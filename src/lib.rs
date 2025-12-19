#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, BytesN, Env,
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    FundNotFound = 1,
    Unauthorized = 2,
    DeadlineNotExpired = 3,
    AlreadyApproved = 4,
    AlreadyReleased = 5,
    AlreadyRefunded = 6,
    InvalidState = 7,
    InsufficientBalance = 8,
    NotInitialized = 9,
    AlreadyInitialized = 10,
    InvalidAmount = 11,
    DeadlinePassed = 12,
    FundExpired = 13,
    NoProofSubmitted = 14,
    InvalidConfiguration = 15,
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum FundStatus {
    Pending,
    ProofSubmitted,
    Approved,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Fund {
    pub funder: Address,
    pub beneficiary: Address,
    pub verifier: Address,
    pub amount: i128,
    pub deadline: u64,
    pub proof_hash: BytesN<32>,
    pub requirement_hash: BytesN<32>,
    pub status: FundStatus,
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

#[contracttype]
pub enum DataKey {
    Fund(u64),
    NextFundId,
    XlmAsset,
}

// ============================================================================
// CONTRACT
// ============================================================================

#[contract]
pub struct ProofPayContract;

#[contractimpl]
impl ProofPayContract {
    
    /// Initialize contract with native XLM asset address
    pub fn initialize(env: Env, xlm_asset: Address) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::XlmAsset) {
            return Err(ContractError::AlreadyInitialized);
        }
        
        env.storage().instance().set(&DataKey::XlmAsset, &xlm_asset);
        env.storage().instance().extend_ttl(15768000, 15768000);
        
        Ok(())
    }
    
    /// Create conditional escrow fund
    pub fn create_fund(
        env: Env,
        funder: Address,
        beneficiary: Address,
        verifier: Address,
        amount: i128,
        deadline: u64,
        requirement_hash: BytesN<32>,
    ) -> Result<u64, ContractError> {
        funder.require_auth();
        
        if !env.storage().instance().has(&DataKey::XlmAsset) {
            return Err(ContractError::NotInitialized);
        }
        
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        
        if deadline <= env.ledger().timestamp() {
            return Err(ContractError::DeadlinePassed);
        }
        
        if beneficiary == funder || verifier == funder || verifier == beneficiary {
            return Err(ContractError::InvalidConfiguration);
        }
        
        let fund_id = Self::get_next_fund_id(&env);
        Self::set_next_fund_id(&env, fund_id + 1);
        
        let token_client = token::Client::new(&env, &Self::get_xlm_asset(&env)?);
        token_client.transfer(&funder, &env.current_contract_address(), &amount);
        
        let fund = Fund {
            funder: funder.clone(),
            beneficiary,
            verifier,
            amount,
            deadline,
            proof_hash: BytesN::from_array(&env, &[0u8; 32]),
            requirement_hash,
            status: FundStatus::Pending,
        };
        
        Self::write_fund(&env, fund_id, &fund);
        
        Ok(fund_id)
    }
    
    /// Beneficiary submits proof
    pub fn submit_proof(
        env: Env,
        beneficiary: Address,
        fund_id: u64,
        proof_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        beneficiary.require_auth();
        
        let mut fund = Self::read_fund(&env, fund_id)?;
        
        if fund.beneficiary != beneficiary {
            return Err(ContractError::Unauthorized);
        }
        
        if fund.status != FundStatus::Pending && fund.status != FundStatus::ProofSubmitted {
            return Err(ContractError::InvalidState);
        }
        
        if env.ledger().timestamp() > fund.deadline {
            return Err(ContractError::FundExpired);
        }
        
        fund.proof_hash = proof_hash;
        fund.status = FundStatus::ProofSubmitted;
        
        Self::write_fund(&env, fund_id, &fund);
        
        Ok(())
    }
    
    /// Verifier approves proof
    pub fn approve_proof(
        env: Env,
        verifier: Address,
        fund_id: u64,
    ) -> Result<(), ContractError> {
        verifier.require_auth();
        
        let mut fund = Self::read_fund(&env, fund_id)?;
        
        if fund.verifier != verifier {
            return Err(ContractError::Unauthorized);
        }
        
        if fund.status != FundStatus::ProofSubmitted {
            return Err(ContractError::InvalidState);
        }
        
        let zero_hash = BytesN::from_array(&env, &[0u8; 32]);
        if fund.proof_hash == zero_hash {
            return Err(ContractError::NoProofSubmitted);
        }
        
        fund.status = FundStatus::Approved;
        
        Self::write_fund(&env, fund_id, &fund);
        
        Ok(())
    }
    
    /// Beneficiary releases approved funds
    pub fn release_funds(
        env: Env,
        beneficiary: Address,
        fund_id: u64,
    ) -> Result<(), ContractError> {
        beneficiary.require_auth();
        
        let mut fund = Self::read_fund(&env, fund_id)?;
        
        if fund.beneficiary != beneficiary {
            return Err(ContractError::Unauthorized);
        }
        
        if fund.status != FundStatus::Approved {
            return Err(ContractError::InvalidState);
        }
        
        let token_client = token::Client::new(&env, &Self::get_xlm_asset(&env)?);
        let contract_balance = token_client.balance(&env.current_contract_address());
        
        if contract_balance < fund.amount {
            return Err(ContractError::InsufficientBalance);
        }
        
        token_client.transfer(
            &env.current_contract_address(),
            &beneficiary,
            &fund.amount
        );
        
        fund.status = FundStatus::Released;
        
        Self::write_fund(&env, fund_id, &fund);
        
        Ok(())
    }
    
    /// Funder reclaims expired funds
    pub fn refund_funder(
        env: Env,
        funder: Address,
        fund_id: u64,
    ) -> Result<(), ContractError> {
        funder.require_auth();
        
        let mut fund = Self::read_fund(&env, fund_id)?;
        
        if fund.funder != funder {
            return Err(ContractError::Unauthorized);
        }
        
        if env.ledger().timestamp() <= fund.deadline {
            return Err(ContractError::DeadlineNotExpired);
        }
        
        match fund.status {
            FundStatus::Released => return Err(ContractError::AlreadyReleased),
            FundStatus::Refunded => return Err(ContractError::AlreadyRefunded),
            FundStatus::Approved => return Err(ContractError::AlreadyApproved),
            FundStatus::Pending | FundStatus::ProofSubmitted => {}
        }
        
        let token_client = token::Client::new(&env, &Self::get_xlm_asset(&env)?);
        let contract_balance = token_client.balance(&env.current_contract_address());
        
        if contract_balance < fund.amount {
            return Err(ContractError::InsufficientBalance);
        }
        
        token_client.transfer(
            &env.current_contract_address(),
            &funder,
            &fund.amount
        );
        
        fund.status = FundStatus::Refunded;
        
        Self::write_fund(&env, fund_id, &fund);
        
        Ok(())
    }
    
    // ========================================================================
    // INTERNAL HELPERS
    // ========================================================================
    
    fn read_fund(env: &Env, fund_id: u64) -> Result<Fund, ContractError> {
        let key = DataKey::Fund(fund_id);
        env.storage()
            .persistent()
            .get(&key)
            .ok_or(ContractError::FundNotFound)
    }
    
    fn write_fund(env: &Env, fund_id: u64, fund: &Fund) {
        let key = DataKey::Fund(fund_id);
        env.storage().persistent().set(&key, fund);
        env.storage().persistent().extend_ttl(&key, 15768000, 15768000);
    }
    
    fn get_next_fund_id(env: &Env) -> u64 {
        let key = DataKey::NextFundId;
        env.storage().instance().get(&key).unwrap_or(0)
    }
    
    fn set_next_fund_id(env: &Env, id: u64) {
        let key = DataKey::NextFundId;
        env.storage().instance().set(&key, &id);
        env.storage().instance().extend_ttl(15768000, 15768000);
    }
    
    fn get_xlm_asset(env: &Env) -> Result<Address, ContractError> {
        env.storage()
            .instance()
            .get(&DataKey::XlmAsset)
            .ok_or(ContractError::NotInitialized)
    }
}

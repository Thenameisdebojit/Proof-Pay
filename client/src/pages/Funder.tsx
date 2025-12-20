import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useFunds, useCreateFund } from "@/hooks/use-funds";
import { FundCard } from "@/components/FundCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFundSchema } from "@shared/schema";
import { Plus, Wallet, Users, Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { useLocation } from "wouter";

// Funder Dashboard

export default function Funder() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { address } = useWallet();
  const [, setLocation] = useLocation();

  // Redirect if not authorized
  useEffect(() => {
      if (!isAuthLoading && (!user || user.role !== 'Funder')) {
          setLocation('/login');
      }
  }, [user, isAuthLoading, setLocation]);

  const { data: funds, isLoading } = useFunds({ role: "Funder", address: address || "" });
  const createFund = useCreateFund();
  const [open, setOpen] = useState(false);

  // Stats calculation
  const totalLocked = funds?.reduce((acc, fund) => acc + parseFloat(fund.amount), 0).toFixed(2) || "0.00";
  const activeBeneficiaries = new Set(funds?.map(f => f.beneficiaryAddress)).size || 0;
  const pendingVerifications = funds?.filter(f => f.status === "Pending Verification").length || 0;

  const form = useForm<z.infer<typeof insertFundSchema>>({
    resolver: zodResolver(insertFundSchema),
    defaultValues: {
      funderAddress: address || "",
      beneficiaryAddress: "", 
      verifierAddress: "", 
      amount: "",
      conditions: "",
      requiredDocuments: "Proof Document", // Default value
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ~30 days default
    }
  });

  // Update default address when wallet connects
  useEffect(() => {
      if (address) {
          form.setValue("funderAddress", address);
      }
  }, [address, form]);

  const onSubmit = (data: z.infer<typeof insertFundSchema>) => {
    // Convert comma-separated string to JSON string array
    const docs = (data.requiredDocuments || "Proof Document").split(',').map(s => s.trim()).filter(Boolean);
    const finalData = { ...data, requiredDocuments: JSON.stringify(docs) };
    
    createFund.mutate(finalData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  if (isAuthLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Locked</p>
              <h3 className="text-3xl font-display font-bold">{totalLocked} XLM</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Beneficiaries</p>
              <h3 className="text-2xl font-display font-bold text-foreground">{activeBeneficiaries}</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Pending Review</p>
              <h3 className="text-2xl font-display font-bold text-foreground">{pendingVerifications}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-2xl font-display font-bold">Your Funds</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="w-4 h-4 mr-2" /> New Fund
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create Scholarship Fund</DialogTitle>
              <DialogDescription>
                Define the conditions for this conditional disbursement.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (XLM)</FormLabel>
                        <FormControl>
                          <Input placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="beneficiaryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Address (Wallet)</FormLabel>
                      <FormControl>
                        <Input placeholder="G..." className="font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verifierAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verifier Address (Institution)</FormLabel>
                      <FormControl>
                        <Input placeholder="G..." className="font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions for Release</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="E.g. Must maintain GPA > 3.0 and complete fallback semester."
                          className="h-24 resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Documents (Comma separated)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g. Aadhar Card, Pan Card, Transcript"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createFund.isPending}>
                    {createFund.isPending ? "Locking Funds..." : "Create Fund"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : funds?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-sm">
            <Wallet className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-medium text-lg">No funds created yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Create your first scholarship fund to start supporting beneficiaries securely.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds?.map((fund) => (
            <FundCard key={fund.id} fund={fund} role="Funder" />
          ))}
        </div>
      )}
    </Layout>
  );
}

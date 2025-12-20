import mongoose from 'mongoose';
import { User } from '@shared/schema';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Beneficiary', 'Funder', 'Verifier'], 
    required: true 
  },
  about: { type: String },
  walletAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<User & mongoose.Document>('User', UserSchema);

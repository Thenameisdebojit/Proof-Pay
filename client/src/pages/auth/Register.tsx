import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Beneficiary"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
    } catch (e) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/">
        <div className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-lg">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">ProofPay</span>
        </div>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join the ProofPay ecosystem today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="John Doe"
                className="h-11" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="name@institution.edu"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
                minLength={6}
                className="h-11" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beneficiary">Beneficiary (Student)</SelectItem>
                  <SelectItem value="Funder">Funder (Institution)</SelectItem>
                  <SelectItem value="Verifier">Verifier (Auditor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

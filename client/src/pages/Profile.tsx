import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { User, Wallet, Mail, FileText, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
      name: "",
      email: "",
      about: ""
  });
  
  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name,
              email: user.email,
              about: user.about || ""
          });
      }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Implement update profile API call (not yet in backend)
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
  };

  if (!user) return <div className="p-8">Please log in to view profile.</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-3 rounded-xl">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">User Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-2">
                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            Personal Information
                          </CardTitle>
                          <CardDescription>Update your personal details here.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="space-y-2">
                                  <Label>Full Name</Label>
                                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                  <Label>Email</Label>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={formData.email} disabled className="pl-9 bg-muted" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                              </div>
                              <div className="space-y-2">
                                  <Label>About</Label>
                                  <Textarea 
                                    value={formData.about} 
                                    onChange={e => setFormData({...formData, about: e.target.value})} 
                                    rows={4} 
                                    placeholder="Tell us about yourself..." 
                                    className="resize-none"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label>Role</Label>
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <Badge variant="secondary" className="px-3 py-1">{user.role}</Badge>
                                  </div>
                              </div>
                              <Button type="submit" className="mt-2">Save Changes</Button>
                          </form>
                      </CardContent>
                  </Card>
              </div>
              
              {/* Wallet Status Card */}
              <div>
                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-muted-foreground" />
                            Wallet Status
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="text-sm font-medium">Connection</span>
                              <Badge variant={isConnected ? "default" : "destructive"} className="shadow-sm">
                                  {isConnected ? "Connected" : "Disconnected"}
                              </Badge>
                          </div>
                          {isConnected && (
                              <div className="space-y-2">
                                  <span className="text-sm font-medium block">Address</span>
                                  <div className="bg-muted p-3 rounded-lg border text-xs font-mono break-all leading-relaxed">
                                      {address}
                                  </div>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
    </Layout>
  );
}

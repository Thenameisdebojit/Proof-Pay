import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { User, InsertUser } from '@shared/schema';
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  demoLogin: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (data: any) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errorMessage = 'Login failed';
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
             const err = await res.json();
             errorMessage = err.message || errorMessage;
          } else {
             const text = await res.text();
             console.error("Non-JSON response:", text);
             // Try to extract a meaningful message if it's HTML or plain text
             errorMessage = `Server Error (${res.status}): ${text.slice(0, 100)}`;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      const userData = await res.json();
      setUser(userData);
      toast({ title: "Welcome back!", description: `Logged in as ${userData.name}` });
      
      // Redirect based on role
      redirectBasedOnRole(userData.role);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
      throw error;
    }
  };

  const demoLogin = async () => {
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Demo login failed');
      }

      const userData = await res.json();
      setUser(userData);
      toast({ title: "Demo Mode Active", description: `Logged in as ${userData.name}` });
      
      redirectBasedOnRole(userData.role);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Demo Login Failed", description: error.message });
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errorMessage = 'Registration failed';
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
             const err = await res.json();
             errorMessage = err.message || errorMessage;
          } else {
             const text = await res.text();
             console.error("Non-JSON response:", text);
             errorMessage = `Server Error (${res.status}): ${text.slice(0, 100)}`;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      const userData = await res.json();
      setUser(userData);
      toast({ title: "Account Created", description: "Welcome to ProofPay!" });
      
      redirectBasedOnRole(userData.role);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      setLocation('/');
      toast({ title: "Logged out", description: "See you soon!" });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const redirectBasedOnRole = (role: string) => {
      switch(role) {
          case 'Beneficiary': setLocation('/dashboard/beneficiary'); break;
          case 'Verifier': setLocation('/dashboard/verifier'); break;
          case 'Funder': setLocation('/dashboard/funder'); break;
          default: setLocation('/');
      }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      demoLogin,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

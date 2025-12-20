import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Funder from "@/pages/Funder";
import Beneficiary from "@/pages/Beneficiary";
import Verifier from "@/pages/Verifier";
import History from "@/pages/History";
import SystemStatus from "@/pages/SystemStatus";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

import Profile from "@/pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Role Dashboards */}
      <Route path="/dashboard/funder" component={Funder} />
      <Route path="/dashboard/beneficiary" component={Beneficiary} />
      <Route path="/dashboard/verifier" component={Verifier} />
      
      <Route path="/profile" component={Profile} />
      
      {/* Support legacy routes or secondary routes */}
      <Route path="/history" component={History} />
      <Route path="/status" component={SystemStatus} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="proofpay-theme">
        <AuthProvider>
          <WalletProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

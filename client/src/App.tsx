import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Funder from "@/pages/Funder";
import Beneficiary from "@/pages/Beneficiary";
import Verifier from "@/pages/Verifier";
import History from "@/pages/History";
import SystemStatus from "@/pages/SystemStatus";
import { WalletProvider, useWallet } from "@/context/WalletContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/Layout";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isConnected } = useWallet();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isConnected && location !== "/") {
      setLocation("/");
    }
  }, [isConnected, location, setLocation]);

  if (!isConnected) {
    return null; // or a loading spinner
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Role Dashboards - Protected */}
      <Route path="/dashboard/funder">
        <ProtectedRoute component={Funder} />
      </Route>
      <Route path="/dashboard/beneficiary">
        <ProtectedRoute component={Beneficiary} />
      </Route>
      <Route path="/dashboard/verifier">
        <ProtectedRoute component={Verifier} />
      </Route>
      
      {/* Support legacy routes or secondary routes */}
      <Route path="/history">
        <ProtectedRoute component={History} />
      </Route>
      <Route path="/status">
        <ProtectedRoute component={SystemStatus} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="proofpay-theme">
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

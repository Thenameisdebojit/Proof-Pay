import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Beneficiary from "@/pages/Beneficiary";
import Verifier from "@/pages/Verifier";
import History from "@/pages/History";
import SystemStatus from "@/pages/SystemStatus";
import { WalletProvider } from "@/context/WalletContext";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/beneficiary" component={Beneficiary} />
      <Route path="/verifier" component={Verifier} />
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

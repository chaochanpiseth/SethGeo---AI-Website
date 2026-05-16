import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipPrimitive.Provider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster richColors position="top-right" />
      </TooltipPrimitive.Provider>
    </QueryClientProvider>
  );
}

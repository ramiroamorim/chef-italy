import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import ThankYou from "@/pages/ThankYou";
import { VisitorTrackingProvider } from "@/contexts/VisitorTrackingContext";

function App() {
  return (
    <VisitorTrackingProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/merci" component={ThankYou} />
        <Route component={NotFound} />
      </Switch>
    </VisitorTrackingProvider>
  );
}

export default App;
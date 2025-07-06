import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import ThankYou from "@/pages/ThankYou";
import AdminPanel from "@/pages/AdminPanel";
import { VisitorTrackingProvider } from "@/contexts/VisitorTrackingContext";
import TrackingDebug from "@/components/debug/TrackingDebug";

function App() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <VisitorTrackingProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/merci" component={ThankYou} />
        <Route path="/admin" component={AdminPanel} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Debug component - só aparece em desenvolvimento */}
      <TrackingDebug />
    </VisitorTrackingProvider>
  );
}

export default App;
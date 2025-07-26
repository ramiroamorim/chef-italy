import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import ThankYou from "@/pages/ThankYou";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/merci" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
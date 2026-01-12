import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AgentPage from "./pages/AgentPage";
import CustomerEntry from "./pages/CustomerEntry";
import CustomerConversation from "./pages/CustomerConversation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/agent" element={<AgentPage />} />

      <Route path="/customer" element={<CustomerEntry />} />
      <Route path="/customer/:customerId" element={<CustomerConversation />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

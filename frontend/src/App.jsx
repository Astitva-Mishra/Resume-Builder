import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import { User } from "lucide-react";
import UserProvider from "./context/UserContext";

const App = () => {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume/:id" element={<Resume />} />
      </Routes>
    </UserProvider>
  );
};

export default App;

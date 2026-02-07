import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { WalletProvider } from "./contexts/WalletContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import { AppLayout } from "./components/layout/AppLayout";

import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Blacklist from "./pages/Blacklist";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WalletProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Dashboard />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Complaints />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blacklist"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Blacklist />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/report" element={<ReportPage />} />
    <Route path="/rewards" element={<RewardsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>;

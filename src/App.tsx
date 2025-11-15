import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import ListingDetail from "./pages/ListingDetail";
import BookingReview from "./pages/BookingReview";
import BookingConfirm from "./pages/BookingConfirm";
import Profile from "./pages/Profile";
import Host from "./pages/Host";
import HostListingDetail from "./pages/HostListingDetail";
import NotFound from "./pages/NotFound";
import CreateTestData from "./pages/CreateTestData";
import Information from "./pages/Information";
import ExportData from "./pages/ExportData";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { SydeContainer } from "./components/syde/SydeContainer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SydeContainer />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/search" element={<Search />} />
          <Route path="/listing/:slug" element={<ListingDetail />} />
          <Route path="/booking/review" element={<BookingReview />} />
          <Route path="/confirm/:bookingId" element={<BookingConfirm />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="Guest">
                  <Profile />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/host"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="Host">
                  <Host />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/listing/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="Host">
                  <HostListingDetail />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/create-test-data" element={<CreateTestData />} />
          <Route path="/info" element={<Information />} />
          <Route path="/export-data" element={<ExportData />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

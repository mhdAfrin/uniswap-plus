import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SavedProvider } from "./context/SavedContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Sidebar, Topbar, MobileNav, PageLoader } from "./components/components";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import MyListings from "./pages/MyListings";
import MyRequests from "./pages/MyRequests";
import ListingDetail from "./pages/ListingDetail";
import RequestDetail from "./pages/RequestDetail";
import Opportunities from "./pages/Opportunities";
import Messages from "./pages/Messages";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

function AppShell() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);

  if (loading) return <PageLoader />;

  // Public marketing/auth pages render without the app chrome.
  if (isPublic && !user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">
          <Routes>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SavedProvider>
            <AppShell />
          </SavedProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

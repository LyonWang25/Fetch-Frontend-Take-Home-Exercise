import { Navigate } from "react-router";
// Protected Route component to handle authentication
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Add debug logging
  console.log('ProtectedRoute check - Current cookies:', document.cookie);
  
  // Check both the specific cookie and general authentication state
  const isAuthenticated = document.cookie.includes("fetch-access-token");
  console.log('Is authenticated:', isAuthenticated);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Authenticated, rendering protected content');
  return <>{children}</>;
};
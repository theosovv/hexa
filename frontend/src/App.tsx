import { Route, Router } from "@solidjs/router";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthCallback } from "./pages/AuthCallback";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { StudioPage } from "./pages/Studio";

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Route
          path="/"
          component={() => (
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/studio"
          component={() => (
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/login"
          component={() => (
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          )}
        />
        <Route path="/auth/callback" component={AuthCallback} />
      </Router>
    </AuthProvider>
  );
}

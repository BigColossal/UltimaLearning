import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Hub from "./pages/Hub";
import SkillPage from "./pages/SkillPage";
import DomainPage from "./pages/DomainPage";
import SubskillPage from "./pages/SubskillPage";
import UserProfile from "./pages/UserProfile";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import OAuthSuccess from "./components/auth/OAuthSuccess";

function App() {
  return (
    <Router>
      <UserProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/hub"
                element={
                  <PrivateRoute>
                    <Hub />
                  </PrivateRoute>
                }
              />
              <Route
                path="/skill/:id"
                element={
                  <PrivateRoute>
                    <SkillPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/domain/:id"
                element={
                  <PrivateRoute>
                    <DomainPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/subskill/:id"
                element={
                  <PrivateRoute>
                    <SubskillPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
            </Routes>
          </main>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;

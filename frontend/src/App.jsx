import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
// import Hub from "./pages/Hub";
import LearningHub from "./pages/LearningHub";
// import SkillPage from "./pages/SkillPage";
// import DomainPage from "./pages/DomainPage";
// import SubskillPage from "./pages/SubskillPage";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                {/* <Route
                  path="/hub"
                  element={
                    <ProtectedRoute>
                      <Hub />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path="/learning-hub"
                  element={
                    <ProtectedRoute>
                      <LearningHub />
                    </ProtectedRoute>
                  }
                />
                {/* <Route
                  path="/skill/:id"
                  element={
                    <ProtectedRoute>
                      <SkillPage />
                    </ProtectedRoute>
                  }
                /> */}
                {/* <Route
                  path="/domain/:id"
                  element={
                    <ProtectedRoute>
                      <DomainPage />
                    </ProtectedRoute>
                  }
                /> */}
                {/* <Route
                  path="/subskill/:id"
                  element={
                    <ProtectedRoute>
                      <SubskillPage />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;

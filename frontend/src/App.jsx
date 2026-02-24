import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Hub from './pages/Hub';
import SkillPage from './pages/SkillPage';
import DomainPage from './pages/DomainPage';
import SubskillPage from './pages/SubskillPage';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/skill/:id" element={<SkillPage />} />
              <Route path="/domain/:id" element={<DomainPage />} />
              <Route path="/subskill/:id" element={<SubskillPage />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import Ask from './pages/Ask';
import Knowledge from './pages/Knowledge';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-hw-bg text-hw-text">
        <div className="circuit-bg" />
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

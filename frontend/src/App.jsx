import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Statistics from './pages/Statistics';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl shadow-slate-200/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
          <Navigation />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

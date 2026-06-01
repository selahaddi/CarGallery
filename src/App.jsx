import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentDetail from './pages/ContentDetail';
import { LanguageProvider } from './LanguageContext';
import { SidebarProvider } from './SidebarContext';

function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/icerik/:slug" element={<ContentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <Router>
          <Layout />
        </Router>
      </SidebarProvider>
    </LanguageProvider>
  );
}

export default App;

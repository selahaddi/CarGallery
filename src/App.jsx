import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SideNavBar from './components/SideNavBar';
import Home from './pages/Home';
import Services from './pages/Services';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentDetail from './pages/ContentDetail';
import { LanguageProvider } from './LanguageContext';
import { SidebarProvider } from './SidebarContext';

function App() {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <Router>
          <div className="min-h-screen bg-transparent flex flex-col">
          <Navbar />
          <SideNavBar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/icerik/:slug" element={<ContentDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
      </SidebarProvider>
    </LanguageProvider>
  );
}

export default App;

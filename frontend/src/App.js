import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sitemap } from './components/Sitemap';
import { QuoteModal } from './components/QuoteModal';
import { FeedbackModal } from './components/FeedbackModal';
import { HomePage } from './pages/HomePage';
import { HirePage } from './pages/HirePage';
import { ServicesPage } from './pages/ServicesPage';
import { PackagesPage } from './pages/PackagesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminSignup } from './pages/admin/AdminSignup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuoteManagement } from './pages/admin/QuoteManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { PackagesManagement } from './pages/admin/packagesManagement';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import { MessageManagement } from './pages/admin/MessageManagement';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { CONTACT } from './config/contact';
import { ChevronRight, Home as HomeIcon, MessageCircle, Phone, Mail } from 'lucide-react';

// Inlined ScrollToTop to reduce component count
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReduced ? 'auto' : 'smooth';
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id) || document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior, block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, hash]);
  return null;
}

// Inlined Breadcrumb
function Breadcrumb() {
  const location = useLocation();
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [];
    breadcrumbs.push({ name: 'Home', path: '/', current: pathnames.length === 0 });
    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      const isLast = index === pathnames.length - 1;
      const readableName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ name: readableName, path: currentPath, current: isLast });
    });
    return breadcrumbs;
  };
  const breadcrumbs = generateBreadcrumbs();
  if (breadcrumbs.length <= 1) return null;
  return (
    <nav className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              {breadcrumb.current ? (
                <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
              ) : (
                <Link to={breadcrumb.path} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center">
                  {breadcrumb.name === 'Home' ? (
                    <HomeIcon className="w-4 h-4" />
                  ) : (
                    breadcrumb.name
                  )}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

// Inlined FloatingSocial
function FloatingSocial() {
  const whatsappNumber = CONTACT.whatsapp.number;
  const whatsappText = encodeURIComponent(CONTACT.whatsapp.text);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
      <a
        href={`tel:${CONTACT.phones[0].tel}`}
        className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-900 border"
        aria-label="Call Us"
      >
        <Phone className="w-6 h-6" />
      </a>
      <a
        href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Inquiry from Website')}`}
        className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-900 border"
        aria-label="Email Us"
      >
        <Mail className="w-6 h-6" />
      </a>
    </div>
  );
}

// Inlined ProtectedRoute
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600 font-medium">Checking authentication...</div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AppContent() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

  const openQuoteModal = (data = null) => {
    setQuoteData(data);
    setIsQuoteModalOpen(true);
  };
  
  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setQuoteData(null);
  };

  // Global keyboard shortcut for admin access
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl + Shift + A for admin access
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        window.location.href = '/admin/login';
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen">
      {!isAdminRoute && <Header onQuoteClick={openQuoteModal} />}
      <ScrollToTop />
      
      {/* Breadcrumb for non-admin pages */}
      {!isAdminRoute && <Breadcrumb />}
      
      {/* Add padding to account for fixed header */}
      <main className={isAdminRoute ? '' : 'pt-0'}>
        <Routes future={{ v7_relativeSplatPath: true }}>
          <Route path="/" element={<HomePage onQuoteClick={openQuoteModal} onOpenFeedback={() => setIsFeedbackOpen(true)} />} />
          <Route path="/hire" element={<HirePage onQuoteClick={openQuoteModal} />} />
          <Route path="/services" element={<ServicesPage onQuoteClick={openQuoteModal} />} />
          <Route path="/packages" element={<PackagesPage onQuoteClick={openQuoteModal} />} />
          <Route path="/about" element={<AboutPage onQuoteClick={openQuoteModal} />} />
          <Route path="/contact" element={<ContactPage onQuoteClick={openQuoteModal} />} />
          <Route path="/sitemap" element={<Sitemap />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes future={{ v7_relativeSplatPath: true }}>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/quotes" element={<QuoteManagement />} />
                  <Route path="/customers" element={<CustomerManagement />} />
                  <Route path="/packages" element={<PackagesManagement />} />
                  <Route path="/messages" element={<MessageManagement />} />
                  <Route path="/equipment" element={<EquipmentManagement />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Handle preview_page.html redirect */}
          <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Footer for non-admin pages */}
      {!isAdminRoute && <Footer />}
      
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={closeQuoteModal} 
        preSelectedItem={quoteData?.preSelectedItem}
      />
      {/* Floating Social Icons for non-admin pages */}
      {!isAdminRoute && <FloatingSocial />}
      {/* Global Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default function App() {
  // Determine the basename for the router
  const basename = window.location.pathname.includes('preview_page.html') 
    ? window.location.pathname.replace('/preview_page.html', '') 
    : '';

  return (
    <AuthProvider>
      <Router basename={basename}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src={logo} 
                alt="Fight Club 01 Logo" 
                className="h-10 w-10 rounded-lg transition-transform duration-200 group-hover:scale-110"
              />
              <div className="flex items-center">
                <span className="text-2xl font-display font-bold text-primary-400 group-hover:text-primary-300 transition-colors">
                  FC
                </span>
                <span className="text-2xl font-display font-bold text-white group-hover:text-gray-200 transition-colors">
                  01
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-primary-400 bg-primary-400/10' 
                    : 'text-gray-300 hover:text-primary-400 hover:bg-primary-400/5'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/about') 
                    ? 'text-primary-400 bg-primary-400/10' 
                    : 'text-gray-300 hover:text-primary-400 hover:bg-primary-400/5'
                }`}
              >
                About
              </Link>
              <Link 
                to="/rules" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/rules') 
                    ? 'text-primary-400 bg-primary-400/10' 
                    : 'text-gray-300 hover:text-primary-400 hover:bg-primary-400/5'
                }`}
              >
                Rules
              </Link>
              <Link 
                to="/members" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/members') 
                    ? 'text-primary-400 bg-primary-400/10' 
                    : 'text-gray-300 hover:text-primary-400 hover:bg-primary-400/5'
                }`}
              >
                Members
              </Link>
              <Link 
                to="/events" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/events') 
                    ? 'text-primary-400 bg-primary-400/10' 
                    : 'text-gray-300 hover:text-primary-400 hover:bg-primary-400/5'
                }`}
              >
                Events
              </Link>
              <Link 
                to="/tools" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/tools') 
                    ? 'text-primary-400 bg-primary-400/10' 
                    : 'text-gray-300 hover:text-primary-400 hover:bg-primary-400/5'
                }`}
              >
                Tools
              </Link>
              <Link 
                to="/join" 
                className="btn-primary"
              >
                Join Tribe
              </Link>
              <Link 
                to="/login" 
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors ml-4"
              >
                Admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={logo} alt="Fight Club 01" className="h-8 w-8 rounded" />
                <span className="text-xl font-display font-bold text-white">Fight Club 01</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The premier Transformice tribe focused on teamwork, events, and community. 
                Join us in the underground where legends are made.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">About</Link></li>
                <li><Link to="/rules" className="text-gray-400 hover:text-primary-400 transition-colors">Rules</Link></li>
                <li><Link to="/members" className="text-gray-400 hover:text-primary-400 transition-colors">Members</Link></li>
                <li><Link to="/events" className="text-gray-400 hover:text-primary-400 transition-colors">Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://discord.gg/ASFb2fWduG" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    Discord Server
                  </a>
                </li>
                <li><Link to="/join" className="text-gray-400 hover:text-primary-400 transition-colors">Join Tribe</Link></li>
                <li><Link to="/tools" className="text-gray-400 hover:text-primary-400 transition-colors">Tools</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Fight Club 01 — Transformice Tribe. All rights reserved.
            </p>
            <Link 
              to="/" 
              className="text-gray-400 hover:text-primary-400 transition-colors text-sm mt-4 md:mt-0"
            >
              Back to top ↑
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

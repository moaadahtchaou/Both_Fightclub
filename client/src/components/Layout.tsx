import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const logoSrc = "/logo1.png";
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="h-[50px] fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/98 via-gray-800/98 to-gray-900/98 backdrop-blur-xl border-b border-gradient-to-r from-primary-500/20 via-primary-400/30 to-primary-500/20 shadow-lg shadow-primary-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <img 
                  src={logoSrc} 
                  alt="The Freeborn Logo" 
                  className="relative h-12 w-12 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/25"
                />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-3xl font-display font-black bg-gradient-to-r from-primary-400 via-primary-300 to-primary-500 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:via-primary-200 group-hover:to-primary-400 transition-all duration-300">
                  THE
                </span>
                <span className="text-3xl font-display font-black bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent group-hover:from-gray-100 group-hover:via-white group-hover:to-gray-100 transition-all duration-300">
                  FREEBORN
                </span>
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/" 
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  isActive('/') 
                    ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                }`}
              >
                <span className="relative z-10">Home</span>
                {!isActive('/') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
              </Link>
              <Link 
                to="/about" 
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  isActive('/about') 
                    ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                }`}
              >
                <span className="relative z-10">About</span>
                {!isActive('/about') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
              </Link>
              <Link 
                to="/rules" 
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  isActive('/rules') 
                    ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                }`}
              >
                <span className="relative z-10">Rules</span>
                {!isActive('/rules') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
              </Link>
              <Link 
                to="/members" 
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  isActive('/members') 
                    ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                }`}
              >
                <span className="relative z-10">Members</span>
                {!isActive('/members') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
              </Link>
              {/* <Link 
                to="/events" 
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  isActive('/events') 
                    ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                }`}
              >
                <span className="relative z-10">Events</span>
                {!isActive('/events') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
              </Link> */}
              {isAuthenticated && (
                <Link 
                  to="/tools" 
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                    isActive('/tools') 
                      ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                  }`}
                >
                  <span className="relative z-10">Tools</span>
                  {!isActive('/tools') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                    isActive('/dashboard') 
                      ? 'text-primary-300 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-md shadow-primary-500/20 border border-primary-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20'
                  }`}
                >
                  <span className="relative z-10">Dashboard</span>
                  {!isActive('/dashboard') && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                </Link>
              )}
              
              {isAuthenticated && user ? (
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <UserCircleIcon className="w-7 h-7 text-primary-400 group-hover:text-primary-300 transition-colors duration-300" />
                      <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="hidden sm:inline font-medium">{user.username}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-all duration-300 ${isDropdownOpen ? 'rotate-180 text-primary-400' : 'text-gray-400'}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-primary-500/20 z-50">
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:text-primary-300 transition-all duration-200 rounded-lg mx-2"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="flex items-center space-x-2">
                            <span>📊</span>
                            <span>Dashboard</span>
                          </span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:text-primary-300 transition-all duration-200 rounded-lg mx-2"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <span className="flex items-center space-x-2">
                              <span>⚙️</span>
                              <span>Admin Panel</span>
                            </span>
                          </Link>
                        )}
                        <div className="border-t border-gray-700/50 my-2 mx-2"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-red-400 transition-all duration-200 rounded-lg mx-2"
                        >
                          <span className="flex items-center space-x-2">
                            <span>🚪</span>
                            <span>Logout</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="relative px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:shadow-lg hover:shadow-primary-500/10 hover:border hover:border-primary-500/20 transition-all duration-300 group ml-4"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
              <Link 
                to="/join" 
                className="relative ml-4 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 transform hover:scale-105 border border-primary-400/20"
              >
                <span className="relative z-10">Join Tribe</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
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
      <main className='pt-[50px]'>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={logoSrc} alt="The Freeborn" className="h-8 w-8 rounded" />
                <span className="text-xl font-display font-bold text-white">The Freeborn</span>
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
                {isAuthenticated && (
                  <li><Link to="/tools" className="text-gray-400 hover:text-primary-400 transition-colors">Tools</Link></li>
                )}
                {isAuthenticated && (
                  <li><Link to="/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors">Dashboard</Link></li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} The Freeborn — by AceAlgo.
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

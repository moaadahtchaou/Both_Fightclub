import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{username?: string; password?: string}>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  // Input validation functions
  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 30) {
      return 'Username must be less than 30 characters';
    }
    if (!/^[a-zA-Z0-9#_.-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, #, _, ., -';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (value.length > 128) {
      return 'Password is too long';
    }
    return undefined;
  };

  // Real-time validation
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const error = validateUsername(value);
    setValidationErrors(prev => ({ ...prev, username: error }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setValidationErrors(prev => ({ ...prev, password: error }));
  };

  // Account lockout management
  const handleFailedLogin = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      setIsLocked(true);
      setLockTimeRemaining(LOCK_DURATION);
      localStorage.setItem('loginLockTime', (Date.now() + LOCK_DURATION).toString());
      setError(`Account temporarily locked due to too many failed attempts. Try again in 15 minutes.`);
    }
  };

  // Check if account is locked on component mount
  useEffect(() => {
    const lockTime = localStorage.getItem('loginLockTime');
    if (lockTime) {
      const lockEndTime = parseInt(lockTime);
      const now = Date.now();
      
      if (now < lockEndTime) {
        setIsLocked(true);
        setLockTimeRemaining(lockEndTime - now);
      } else {
        localStorage.removeItem('loginLockTime');
        setLoginAttempts(0);
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            setLoginAttempts(0);
            localStorage.removeItem('loginLockTime');
            setError('');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimeRemaining]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if account is locked
    if (isLocked) {
      return;
    }
    
    // Clear previous errors
    setError('');
    setValidationErrors({});
    
    // Validate inputs
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    
    if (usernameError || passwordError) {
      setValidationErrors({
        username: usernameError,
        password: passwordError
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Reset login attempts on successful login
        setLoginAttempts(0);
        localStorage.removeItem('loginLockTime');
        
        // Navigate to intended destination
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
        handleFailedLogin();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
      handleFailedLogin();
    } finally {
      setLoading(false);
    }
  };
  
  // Format time remaining for lockout display
  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <ShieldCheckIcon className="h-12 w-12 text-primary-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Secure Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Welcome back! Please sign in to your account
          </p>
          {loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
            <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-300">
                  {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}. 
                  {MAX_LOGIN_ATTEMPTS - loginAttempts} attempt{MAX_LOGIN_ATTEMPTS - loginAttempts > 1 ? 's' : ''} remaining.
                </p>
              </div>
            </div>
          )}
          {isLocked && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <p className="text-sm text-red-300 font-medium">
                    Account Temporarily Locked
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Time remaining: {formatTimeRemaining(lockTimeRemaining)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                disabled={isLocked}
                autoComplete="username"
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                  validationErrors.username 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                maxLength={30}
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked}
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                    validationErrors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  maxLength={128}
                />
                <button
                  type="button"
                  disabled={isLocked}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Password must be at least 6 characters long
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-600 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || isLocked || !!validationErrors.username || !!validationErrors.password}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ShieldCheckIcon className="h-5 w-5 text-primary-300 group-hover:text-primary-400" />
              </span>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : isLocked ? (
                'Account Locked'
              ) : (
                'Sign in Securely'
              )}
            </button>
          </div>
          
          {/* Security notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Your connection is secure and encrypted
            </p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/join" className="text-primary-400 hover:text-primary-300 transition-colors">
                Join the tribe
              </Link>
            </p>
            <Link 
              to="/" 
              className="inline-block text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
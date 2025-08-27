import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  InformationCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  username: string;
  role: string;
  credits: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const UserModal = ({ user, isOpen, onClose, onUpdate }: UserModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [creditAction, setCreditAction] = useState<'set' | 'add' | 'subtract'>('add');
  const [creditAmount, setCreditAmount] = useState(0);
  const [newRole, setNewRole] = useState(user?.role || 'user');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user) {
      setNewRole(user.role);
      setIsActive(user.isActive);
    }
  }, [user]);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordReset = async () => {
    if (!user || !newPassword) return;
    
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/users/${user._id}/password`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Password updated successfully!', 'success');
        setNewPassword('');
        onUpdate();
      } else {
        showMessage(data.msg || 'Failed to update password', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditUpdate = async () => {
    if (!user || creditAmount <= 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/users/${user._id}/credits`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ action: creditAction, amount: creditAmount }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage(`Credits ${creditAction}ed successfully!`, 'success');
        setCreditAmount(0);
        onUpdate();
      } else {
        showMessage(data.msg || 'Failed to update credits', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/users/${user._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ role: newRole, isActive }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('User updated successfully!', 'success');
        onUpdate();
      } else {
        showMessage(data.msg || 'Failed to update user', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <UserIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Manage User</h2>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
            messageType === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              {messageType === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircleIcon className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <InformationCircleIcon className="w-6 h-6 mr-3 text-blue-400" />
                User Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Username:</span>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Current Role:</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {user.role === 'admin' ? (
                        <><ShieldCheckIcon className="w-3 h-3 mr-1 inline" />Admin</>
                      ) : (
                        <><UserGroupIcon className="w-3 h-3 mr-1 inline" />User</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Credits:</span>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">{user.credits.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {user.isActive ? (
                        <><CheckCircleIcon className="w-3 h-3 mr-1" />Active</>
                      ) : (
                        <><XCircleIcon className="w-3 h-3 mr-1" />Inactive</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Member Since:</span>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Last Login:</span>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-green-400" />
                      <span className="text-white">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Reset */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <KeyIcon className="w-5 h-5 mr-2 text-red-400" />
              Reset Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={loading || !newPassword || newPassword.length < 6}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Resetting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <KeyIcon className="w-4 h-4" />
                    <span>Reset Password</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Credit Management */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-yellow-400" />
              Manage Credits
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                  <select
                    value={creditAction}
                    onChange={(e) => setCreditAction(e.target.value as 'set' | 'add' | 'subtract')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                  >
                    <option value="add" className="bg-gray-800">Add Credits</option>
                    <option value="subtract" className="bg-gray-800">Subtract Credits</option>
                    <option value="set" className="bg-gray-800">Set Credits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    min="0"
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleCreditUpdate}
                disabled={loading || creditAmount <= 0}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>Update Credits</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Role and Status Management */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-400" />
              Role & Status Management
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="user" className="bg-gray-800">👤 User</option>
                    <option value="admin" className="bg-gray-800">🛡️ Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Status</label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="active" className="bg-gray-800">✅ Active</option>
                    <option value="inactive" className="bg-gray-800">❌ Inactive</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleUserUpdate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Update Role & Status</span>
                  </div>
                )}
              </button>
            </div>
          </div>
         </div>
         
         {/* Action Buttons */}
         <div className="mt-8 pt-6 border-t border-white/10">
           <div className="flex flex-col sm:flex-row gap-4">
             <button
               onClick={onClose}
               className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
             >
               Cancel
             </button>
             <button
               onClick={() => {
                 // Add delete user functionality here
                 if (window.confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
                   // Call delete API
                 }
               }}
               className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
             >
               <div className="flex items-center justify-center space-x-2">
                 <TrashIcon className="w-4 h-4" />
                 <span>Delete User</span>
               </div>
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 };

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.USERS), {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(buildApiUrl('/users/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ 
          username: newUsername, 
          password: newPassword,
          role: newRole 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`User ${newUsername} created successfully!`);
        setNewUsername('');
        setNewPassword('');
        setNewRole('user');
        fetchUsers();
      } else {
        setError(data.msg || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/users/${userId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`User ${username} deleted successfully!`);
        fetchUsers();
      } else {
        setError(data.msg || 'Failed to delete user');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);
  const adminUsers = users.filter(u => u.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                  <p className="text-xs text-gray-300">Management Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/30"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.username}!</h2>
            <p className="text-gray-300">Here's what's happening with your platform today.</p>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
                <p className="text-xs text-green-400 mt-1">↗ +12% from last month</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <UserGroupIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-white">{activeUsers}</p>
                <p className="text-xs text-green-400 mt-1">{((activeUsers/totalUsers)*100).toFixed(1)}% active rate</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Credits</p>
                <p className="text-3xl font-bold text-white">{totalCredits.toLocaleString()}</p>
                <p className="text-xs text-yellow-400 mt-1">Avg: {Math.round(totalCredits/totalUsers)} per user</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Administrators</p>
                <p className="text-3xl font-bold text-white">{adminUsers}</p>
                <p className="text-xs text-purple-400 mt-1">{((adminUsers/totalUsers)*100).toFixed(1)}% of users</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Create User Form - Enhanced */}
          <div className="xl:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <PlusIcon className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Create New User</h2>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  >
                    <option value="user" className="bg-gray-800">User</option>
                    <option value="admin" className="bg-gray-800">Admin</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <PlusIcon className="w-4 h-4" />
                      <span>Create User</span>
                    </div>
                  )}
                </button>
              </form>
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">{success}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Users List - Enhanced */}
          <div className="xl:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <UserGroupIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">User Management</h2>
                      <p className="text-sm text-gray-400">{filteredUsers.length} users found</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all w-full sm:w-64"
                      />
                    </div>
                    
                    <div className="relative">
                      <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as 'all' | 'user' | 'admin')}
                        className="pl-10 pr-8 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="all" className="bg-gray-800">All Roles</option>
                        <option value="user" className="bg-gray-800">Users</option>
                        <option value="admin" className="bg-gray-800">Admins</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No users found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user._id} className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-white font-semibold text-lg">{user.username}</h3>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {user.role === 'admin' ? (
                                    <><ShieldCheckIcon className="w-3 h-3 mr-1" />Admin</>
                                  ) : (
                                    <><UserGroupIcon className="w-3 h-3 mr-1" />User</>
                                  )}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  user.isActive 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  {user.isActive ? (
                                    <><CheckCircleIcon className="w-3 h-3 mr-1" />Active</>
                                  ) : (
                                    <><XCircleIcon className="w-3 h-3 mr-1" />Inactive</>
                                  )}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                                <span className="text-gray-400">Credits:</span>
                                <span className="text-yellow-400 font-medium">{user.credits.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-gray-400">Created:</span>
                                <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="w-4 h-4 text-green-400" />
                                <span className="text-gray-400">Last Login:</span>
                                <span className="text-white">
                                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => openUserModal(user)}
                              className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 group-hover:scale-105"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Manage</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.username)}
                              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50 group-hover:scale-105"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeUserModal}
        onUpdate={fetchUsers}
      />
    </div>
  );
};

export default Admin;
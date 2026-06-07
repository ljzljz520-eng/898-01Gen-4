import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Cpu,
  Home,
  BookOpen,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/knowledge', label: '知识库', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-hw-bg-light border-b border-hw-border sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Cpu className="w-8 h-8 text-hw-primary transition-transform group-hover:rotate-12" />
                <Zap className="w-3 h-3 text-hw-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="font-display font-bold text-xl text-hw-text group-hover:text-hw-primary transition-colors">
                Hardware<span className="text-hw-primary">QA</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-hw-primary/10 text-hw-primary'
                      : 'text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hw-text-secondary" />
              <input
                type="text"
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-hw-bg border border-hw-border rounded-lg text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
              />
            </form>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/ask"
                  className="flex items-center gap-2 px-4 py-2 bg-hw-primary text-hw-bg font-medium rounded-lg hover:bg-hw-primary-dark transition-all shadow-glow-green hover:shadow-glow-green/60"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>发布问题</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hw-bg transition-colors"
                  >
                    <div className="w-8 h-8 bg-hw-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-hw-primary" />
                    </div>
                    <span className="text-sm text-hw-text">{user?.username}</span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-hw-bg-light border border-hw-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-hw-text-secondary hover:text-hw-text transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-hw-primary text-hw-bg font-medium rounded-lg hover:bg-hw-primary-dark transition-all"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-hw-bg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-hw-text" />
            ) : (
              <Menu className="w-6 h-6 text-hw-text" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-hw-border bg-hw-bg-light">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hw-text-secondary" />
              <input
                type="text"
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-hw-bg border border-hw-border rounded-lg text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary"
              />
            </form>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-hw-primary/10 text-hw-primary'
                    : 'text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/ask"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-hw-primary text-hw-bg font-medium rounded-lg"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>发布问题</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">退出登录</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center px-4 py-3 border border-hw-border text-hw-text rounded-lg hover:bg-hw-bg transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center px-4 py-3 bg-hw-primary text-hw-bg font-medium rounded-lg"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

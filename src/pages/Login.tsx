import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Github,
  Twitter,
  ShieldCheck
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<{
        data: { token: string; user: any };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      login(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : '登录失败，请检查邮箱和密码');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-hw-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-hw-bg" />
            </div>
            <span className="font-display font-bold text-xl text-hw-text">
              HW问答
            </span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-hw-text mb-2">
            欢迎回来
          </h1>
          <p className="text-hw-text-secondary">
            登录后参与开源硬件社区讨论
          </p>
        </div>

        <div className="bg-hw-bg-card border border-hw-border rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hw-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hw-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-hw-error/10 border border-hw-error/30 rounded-xl">
                <p className="text-sm text-hw-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-hw-primary text-hw-bg font-semibold rounded-xl hover:bg-hw-primary-dark transition-all shadow-glow-green hover:shadow-glow-green/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {submitting ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hw-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-hw-bg-card text-hw-text-secondary">或使用第三方登录</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-hw-bg border border-hw-border rounded-xl text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg/70 transition-all"
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-hw-bg border border-hw-border rounded-xl text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg/70 transition-all"
            >
              <Twitter className="w-5 h-5" />
              Twitter
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-hw-text-secondary">
              还没有账号？{' '}
              <Link
                to="/register"
                className="text-hw-primary hover:underline font-medium"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-hw-bg-card border border-hw-border rounded-xl">
          <p className="text-xs text-hw-text-secondary text-center">
            测试账号：dev@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}

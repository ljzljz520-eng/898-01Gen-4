import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { User as UserType } from '../../shared/types';

export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('请填写所有必填项');
      return;
    }

    if (username.length < 3) {
      setError('用户名至少需要3个字符');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<{
        data: { token: string; user: UserType };
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password
        })
      });

      login(response.data.user, response.data.token);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Register error:', err);
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
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
            创建账号
          </h1>
          <p className="text-hw-text-secondary">
            加入开源硬件开发者社区
          </p>
        </div>

        <div className="bg-hw-bg-card border border-hw-border rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                用户名 <span className="text-hw-error">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hw-text-secondary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="你的用户名"
                  className="w-full pl-11 pr-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
                  autoComplete="username"
                  maxLength={20}
                />
              </div>
              <p className="mt-1 text-xs text-hw-text-secondary">
                {username.length}/20 字符，至少3个字符
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                邮箱 <span className="text-hw-error">*</span>
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
                密码 <span className="text-hw-error">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hw-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6个字符"
                  className="w-full pl-11 pr-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                确认密码 <span className="text-hw-error">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hw-text-secondary" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full pl-11 pr-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
                  autoComplete="new-password"
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
              disabled={submitting || !username.trim() || !email.trim() || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-hw-primary text-hw-bg font-semibold rounded-xl hover:bg-hw-primary-dark transition-all shadow-glow-green hover:shadow-glow-green/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {submitting ? '注册中...' : '创建账号'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-hw-bg border border-hw-border rounded-xl">
            <h3 className="text-sm font-medium text-hw-text mb-2">开源社区协议</h3>
            <ul className="text-xs text-hw-text-secondary space-y-1">
              <li>• 您的贡献将遵循相应的开源许可证</li>
              <li>• 请尊重他人的知识产权和署名权</li>
              <li>• 禁止发布商业广告和违规内容</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-hw-text-secondary">
              已有账号？{' '}
              <Link
                to="/login"
                className="text-hw-primary hover:underline font-medium"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

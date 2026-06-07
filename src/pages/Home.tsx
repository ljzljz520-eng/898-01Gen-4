import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CircuitBoard,
  Cpu,
  Box,
  HelpCircle,
  Filter,
  Loader2,
  Zap,
  Users,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Question } from '../../shared/types';
import QuestionCard from '../components/QuestionCard';

const categories = [
  { id: 'all', label: '全部', icon: HelpCircle },
  { id: 'circuit', label: '电路板', icon: CircuitBoard },
  { id: 'sensor', label: '传感器', icon: Cpu },
  { id: 'case', label: '外壳', icon: Box },
  { id: 'other', label: '其他', icon: HelpCircle },
];

const statusFilters = [
  { id: 'all', label: '全部状态' },
  { id: 'open', label: '待解决' },
  { id: 'solved', label: '已解决' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [status, setStatus] = useState('all');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchQuestions();
  }, [page, category, status, searchQuery]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (category !== 'all') params.append('category', category);
      if (status !== 'all') params.append('status', status);
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiRequest<{
        data: Question[];
        total: number;
        page: number;
        limit: number;
      }>(`/questions?${params.toString()}`);

      setQuestions(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Fetch questions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-hw-text mb-2">
                开源硬件问答社区
              </h1>
              <p className="text-hw-text-secondary">
                解决电路板、传感器、外壳设计等硬件开发问题
              </p>
            </div>
            <Link
              to="/ask"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-hw-primary text-hw-bg font-semibold rounded-xl hover:bg-hw-primary-dark transition-all shadow-glow-green hover:shadow-glow-green/60"
            >
              <Zap className="w-5 h-5" />
              发布问题
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-hw-bg-card border border-hw-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-hw-primary/10 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-hw-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-text font-mono">{total}</p>
                  <p className="text-sm text-hw-text-secondary">问题总数</p>
                </div>
              </div>
            </div>
            <div className="bg-hw-bg-card border border-hw-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-hw-accent/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-hw-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-text font-mono">
                    {questions.filter(q => q.status === 'solved').length}
                  </p>
                  <p className="text-sm text-hw-text-secondary">已解决</p>
                </div>
              </div>
            </div>
            <div className="bg-hw-bg-card border border-hw-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-text font-mono">128</p>
                  <p className="text-sm text-hw-text-secondary">活跃开发者</p>
                </div>
              </div>
            </div>
            <div className="bg-hw-bg-card border border-hw-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-hw-success/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-hw-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-text font-mono">256</p>
                  <p className="text-sm text-hw-text-secondary">知识库条目</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-hw-bg-card border border-hw-border rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-hw-primary" />
                <h2 className="font-display font-semibold text-lg text-hw-text">筛选</h2>
              </div>

              <div className="mb-6">
                <p className="text-sm text-hw-text-secondary mb-3">硬件类型</p>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          category === cat.id
                            ? 'bg-hw-primary/10 text-hw-primary'
                            : 'text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm text-hw-text-secondary mb-3">问题状态</p>
                <div className="space-y-1">
                  {statusFilters.map((stat) => (
                    <button
                      key={stat.id}
                      onClick={() => {
                        setStatus(stat.id);
                        setPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                        status === stat.id
                          ? 'bg-hw-primary/10 text-hw-primary'
                          : 'text-hw-text-secondary hover:text-hw-text hover:bg-hw-bg'
                      }`}
                    >
                      <span className="text-sm font-medium">{stat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {searchQuery && (
              <div className="mb-4 p-4 bg-hw-bg-card border border-hw-primary/30 rounded-xl">
                <p className="text-hw-text-secondary">
                  搜索结果：<span className="text-hw-primary font-medium">"{searchQuery}"</span>
                  <button
                    onClick={() => {
                      searchParams.delete('search');
                      setSearchParams(searchParams);
                    }}
                    className="ml-3 text-sm text-hw-accent hover:underline"
                  >
                    清除搜索
                  </button>
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
              </div>
            ) : questions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-hw-border text-hw-text-secondary rounded-lg hover:bg-hw-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2 text-hw-text">
                      第 {page} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-hw-border text-hw-text-secondary rounded-lg hover:bg-hw-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <HelpCircle className="w-16 h-16 text-hw-text-secondary mx-auto mb-4 opacity-50" />
                <p className="text-hw-text-secondary text-lg mb-2">暂无问题</p>
                <p className="text-hw-text-secondary text-sm">
                  成为第一个发布问题的开发者吧！
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

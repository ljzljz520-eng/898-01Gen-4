import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Box,
  HelpCircle,
  Clock,
  User,
  ArrowUpRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { KnowledgeEntry } from '../../shared/types';

const categories = [
  { id: 'all', label: '全部', icon: BookOpen },
  { id: 'circuit', label: '电路板', icon: CircuitBoard },
  { id: 'sensor', label: '传感器', icon: Cpu },
  { id: 'case', label: '外壳', icon: Box },
  { id: 'other', label: '其他', icon: HelpCircle },
];

export default function Knowledge() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [category]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') {
        params.append('category', category);
      }

      const url = params.toString()
        ? `/knowledge?${params.toString()}`
        : '/knowledge';
      const response = await apiRequest<{
        data: KnowledgeEntry[];
      }>(url);

      let data = response.data;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(
          (entry) =>
            entry.title.toLowerCase().includes(query) ||
            entry.summary.toLowerCase().includes(query)
        );
      }

      setEntries(data);
    } catch (error) {
      console.error('Fetch knowledge entries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries();
  };

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await apiRequest<{ data: KnowledgeEntry }>(
        `/knowledge/${id}`
      );
      setSelectedEntry(response.data);
    } catch (error) {
      console.error('Fetch knowledge detail error:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-hw-text mb-2">
              项目知识库
            </h1>
            <p className="text-hw-text-secondary">
              被采纳的验证方案，经过社区验证的最佳实践
            </p>
          </div>
          <div className="stats-chip bg-hw-primary/10 border border-hw-primary/30 rounded-full px-4 py-2">
            <BookOpen className="w-5 h-5 text-hw-primary" />
            <span className="font-semibold text-hw-primary">{entries.length}</span>
            <span className="text-hw-text-secondary">条知识</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-hw-bg-card border border-hw-border rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-hw-primary" />
                <h2 className="font-display font-semibold text-lg text-hw-text">筛选</h2>
              </div>

              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-hw-text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索知识条目..."
                    className="w-full pl-10 pr-4 py-2.5 bg-hw-bg border border-hw-border rounded-lg text-sm text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary transition-all"
                  />
                </div>
              </form>

              <div className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setSelectedEntry(null);
                      }}
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
          </div>

          <div className="flex-1 min-w-0">
            {selectedEntry ? (
              <div className="bg-hw-bg-card border border-hw-border rounded-2xl p-6 md:p-8">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex items-center gap-2 text-hw-text-secondary hover:text-hw-primary mb-6 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  返回列表
                </button>

                {detailLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-hw-success/10 text-hw-success">
                        <CheckCircle className="w-3.5 h-3.5" />
                        已验证方案
                      </span>
                      <span className="text-xs text-hw-text-secondary">
                        {categories.find(c => c.id === selectedEntry.hardwareType)?.label}
                      </span>
                    </div>

                    <h1 className="font-display font-bold text-2xl text-hw-text mb-4">
                      {selectedEntry.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-hw-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDate(selectedEntry.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {selectedEntry.answer?.user?.username}
                      </span>
                    </div>

                    <div className="mb-8">
                      <h3 className="font-semibold text-hw-text mb-3">问题描述</h3>
                      <Link
                        to={`/questions/${selectedEntry.questionId}`}
                        className="block p-4 bg-hw-bg border border-hw-border rounded-xl mb-4 hover:border-hw-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-medium text-hw-text mb-2">
                            {selectedEntry.question?.title || selectedEntry.title}
                          </h4>
                          <ArrowUpRight className="w-4 h-4 text-hw-text-secondary flex-shrink-0" />
                        </div>
                        <p className="text-sm text-hw-text-secondary line-clamp-2">
                          {selectedEntry.question?.description}
                        </p>
                      </Link>
                    </div>

                    <div className="mb-8">
                      <h3 className="font-semibold text-hw-text mb-3">解决方案摘要</h3>
                      <div className="p-4 bg-hw-primary/5 border border-hw-primary/20 rounded-xl">
                        <p className="text-hw-text-secondary">
                          {selectedEntry.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="font-semibold text-hw-text mb-3">完整方案</h3>
                      <div className="markdown-content">
                        {selectedEntry.answer?.content?.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>

                    {(selectedEntry.question?.attachments || selectedEntry.answer?.attachments) && (
                      <div>
                        <h3 className="font-semibold text-hw-text mb-3">相关附件</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[...(selectedEntry.question?.attachments || []), ...(selectedEntry.answer?.attachments || [])].map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-3 p-4 bg-hw-bg border border-hw-border rounded-xl"
                            >
                              <div className="p-2.5 bg-hw-primary/10 rounded-lg">
                                <FileText className="w-4 h-4 text-hw-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-hw-text font-medium truncate">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-hw-text-secondary">
                                  {attachment.downloadCount} 次下载
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-hw-border">
                      <Link
                        to={`/questions/${selectedEntry.questionId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-hw-primary text-hw-bg font-medium rounded-xl hover:bg-hw-primary-dark transition-all"
                      >
                        查看完整讨论
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
                  </div>
                ) : entries.length > 0 ? (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => fetchDetail(entry.id)}
                        className="bg-hw-bg-card border border-hw-border rounded-xl p-6 cursor-pointer hover:border-hw-primary/50 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-hw-success/10 text-hw-success">
                                <CheckCircle className="w-3.5 h-3.5" />
                                已验证
                              </span>
                              <span className="text-xs text-hw-text-secondary">
                                {categories.find(c => c.id === entry.hardwareType)?.label}
                              </span>
                              <span className="text-xs text-hw-text-secondary">
                                • {formatDate(entry.createdAt)}
                              </span>
                            </div>

                            <h3 className="font-semibold text-lg text-hw-text mb-2 group-hover:text-hw-primary transition-colors">
                              {entry.title}
                            </h3>

                            <p className="text-sm text-hw-text-secondary line-clamp-2 mb-3">
                              {entry.summary}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-hw-text-secondary">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {entry.answer?.user?.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                原问题
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-hw-text-secondary group-hover:text-hw-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-hw-bg-card border border-hw-border rounded-xl">
                    <BookOpen className="w-16 h-16 text-hw-text-secondary mx-auto mb-4 opacity-50" />
                    <p className="text-hw-text-secondary text-lg mb-2">暂无知识条目</p>
                    <p className="text-sm text-hw-text-secondary/70">
                      被采纳的验证方案将自动收录到知识库
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

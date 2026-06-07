import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Clock, CheckCircle, CircuitBoard, Box, Cpu, HelpCircle, Tag } from 'lucide-react';
import { Question } from '../../shared/types';

interface QuestionCardProps {
  question: Question;
}

const hardwareTypeConfig = {
  circuit: { icon: CircuitBoard, label: '电路板', color: 'text-hw-primary', bg: 'bg-hw-primary/10' },
  sensor: { icon: Cpu, label: '传感器', color: 'text-hw-accent', bg: 'bg-hw-accent/10' },
  case: { icon: Box, label: '外壳', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  other: { icon: HelpCircle, label: '其他', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

export default function QuestionCard({ question }: QuestionCardProps) {
  const typeConfig = hardwareTypeConfig[question.hardwareType] || hardwareTypeConfig.other;
  const TypeIcon = typeConfig.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 30) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <Link
      to={`/question/${question.id}`}
      className="block group"
    >
      <div className="bg-hw-bg-card border border-hw-border rounded-xl p-5 transition-all duration-300 hover:border-hw-primary/50 hover:shadow-card-hover hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeConfig.label}
            </span>
            {question.status === 'solved' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-hw-success/10 text-hw-success">
                <CheckCircle className="w-3.5 h-3.5" />
                已解决
              </span>
            )}
            {question.firmwareVersion && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-hw-border text-hw-text-secondary font-mono">
                {question.firmwareVersion}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-hw-text-secondary">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {question.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {question.answerCount}
            </span>
          </div>
        </div>

        <h3 className="font-display font-semibold text-lg text-hw-text mb-2 group-hover:text-hw-primary transition-colors line-clamp-2">
          {question.title}
        </h3>

        <p className="text-hw-text-secondary text-sm mb-4 line-clamp-2">
          {question.description.replace(/[#*`]/g, '')}
        </p>

        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-hw-bg text-hw-text-secondary border border-hw-border"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-hw-border/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-hw-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-hw-primary">
                {question.user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-hw-text font-medium">
                {question.user?.username}
              </p>
              {question.user?.isVerified && (
                <span className="text-xs text-hw-accent">认证开发者</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-hw-text-secondary">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(question.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

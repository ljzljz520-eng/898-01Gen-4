import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Clock,
  Tag,
  CheckCircle,
  ShieldCheck,
  CircuitBoard,
  Cpu,
  Box,
  HelpCircle,
  FileText,
  Download,
  Loader2,
  Send,
  User
} from 'lucide-react';
import { apiRequest, apiUpload, downloadFile } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Question, Answer, License, Attachment } from '../../shared/types';
import AnswerCard from '../components/AnswerCard';
import LicenseModal from '../components/LicenseModal';

const hardwareTypeConfig = {
  circuit: { icon: CircuitBoard, label: '电路板', color: 'text-hw-primary', bg: 'bg-hw-primary/10' },
  sensor: { icon: Cpu, label: '传感器', color: 'text-hw-accent', bg: 'bg-hw-accent/10' },
  case: { icon: Box, label: '外壳', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  other: { icon: HelpCircle, label: '其他', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [licenseModal, setLicenseModal] = useState<{
    isOpen: boolean;
    license: License | null;
    attachment: Attachment | null;
  }>({ isOpen: false, license: null, attachment: null });

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchAnswers();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await apiRequest<{ data: Question }>(`/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Fetch question error:', error);
    }
  };

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ data: Answer[] }>(`/questions/${id}/answers`);
      setAnswers(response.data);
    } catch (error) {
      console.error('Fetch answers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!answerContent.trim()) {
      alert('请填写回答内容');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', answerContent);
      formData.append('isVerified', String(isVerified));
      formData.append('license', 'cc-by-sa-4.0');

      answerFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      await apiUpload<{ data: Answer }>(`/questions/${id}/answers`, formData);

      setAnswerContent('');
      setIsVerified(false);
      setAnswerFiles([]);
      fetchAnswers();
      fetchQuestion();
    } catch (error) {
      console.error('Submit answer error:', error);
      alert(error instanceof Error ? error.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnswerFiles(Array.from(e.target.files));
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const response = await apiRequest<{
        data: { attachment: Attachment; license: License };
      }>(`/attachments/${attachment.id}/license`);

      setLicenseModal({
        isOpen: true,
        license: response.data.license,
        attachment
      });
    } catch (error) {
      console.error('Get license error:', error);
    }
  };

  const confirmDownload = async () => {
    if (!licenseModal.attachment) return;

    try {
      await downloadFile(
        `/attachments/${licenseModal.attachment.id}/download?confirmed=true`,
        licenseModal.attachment.originalName
      );
      setLicenseModal({ isOpen: false, license: null, attachment: null });
      fetchQuestion();
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : '下载失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'schematic':
        return <FileText className="w-4 h-4" />;
      case 'firmware':
        return <FileText className="w-4 h-4" />;
      case 'photo':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const fileTypeLabels = {
    schematic: '原理图',
    firmware: '固件',
    photo: '照片',
    other: '其他'
  };

  if (!question && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 text-hw-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-hw-text-secondary text-lg mb-2">问题不存在</p>
          <Link to="/" className="text-hw-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = question
    ? hardwareTypeConfig[question.hardwareType] || hardwareTypeConfig.other
    : null;
  const TypeIcon = typeConfig?.icon;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-hw-text-secondary hover:text-hw-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回问题列表
        </Link>

        {loading && !question ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
          </div>
        ) : (
          question && (
            <>
              <div className="bg-hw-bg-card border border-hw-border rounded-2xl p-6 md:p-8 mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {typeConfig && TypeIcon && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      {typeConfig.label}
                    </span>
                  )}
                  {question.status === 'solved' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-hw-success/10 text-hw-success">
                      <CheckCircle className="w-3.5 h-3.5" />
                      已解决
                    </span>
                  )}
                  {question.firmwareVersion && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-hw-border text-hw-text-secondary font-mono">
                      固件: {question.firmwareVersion}
                    </span>
                  )}
                </div>

                <h1 className="font-display font-bold text-2xl md:text-3xl text-hw-text mb-4">
                  {question.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-hw-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {question.viewCount} 次浏览
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {question.answerCount} 个回答
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDate(question.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-hw-border">
                  <div className="w-10 h-10 bg-hw-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-hw-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-hw-text">{question.user?.username}</p>
                      {question.user?.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-hw-accent" />
                      )}
                    </div>
                    <p className="text-xs text-hw-text-secondary">问题发布者</p>
                  </div>
                </div>

                <div className="markdown-content mb-6">
                  {question.description.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-hw-bg text-hw-text-secondary border border-hw-border"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {question.attachments && question.attachments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-hw-text-secondary font-medium">附件 ({question.attachments.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-4 bg-hw-bg border border-hw-border rounded-xl hover:border-hw-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 bg-hw-primary/10 rounded-lg">
                              {getFileTypeIcon(attachment.fileType)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-hw-text font-medium truncate">
                                {attachment.originalName}
                              </p>
                              <p className="text-xs text-hw-text-secondary">
                                {fileTypeLabels[attachment.fileType as keyof typeof fileTypeLabels]} · {attachment.downloadCount} 次下载
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(attachment)}
                            className="p-2.5 text-hw-text-secondary hover:text-hw-primary hover:bg-hw-primary/10 rounded-lg transition-colors"
                            title="下载"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="font-display font-bold text-xl text-hw-text mb-4">
                  回答 ({answers.length})
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-hw-primary animate-spin" />
                  </div>
                ) : answers.length > 0 ? (
                  <div className="space-y-4">
                    {answers.map((answer) => (
                      <AnswerCard
                        key={answer.id}
                        answer={answer}
                        questionUserId={question.userId}
                        questionAcceptedAnswerId={question.acceptedAnswerId}
                        onUpdate={() => {
                          fetchAnswers();
                          fetchQuestion();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-hw-bg-card border border-hw-border rounded-xl">
                    <MessageSquare className="w-12 h-12 text-hw-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-hw-text-secondary">暂无回答</p>
                    <p className="text-sm text-hw-text-secondary/70">成为第一个回答的开发者吧！</p>
                  </div>
                )}
              </div>

              <div className="bg-hw-bg-card border border-hw-border rounded-2xl p-6 md:p-8">
                <h3 className="font-display font-bold text-xl text-hw-text mb-6">
                  提交你的回答
                </h3>

                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-hw-text-secondary mb-4">请先登录后再回答问题</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-hw-primary text-hw-bg font-medium rounded-xl hover:bg-hw-primary-dark transition-all"
                    >
                      登录并回答
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAnswer}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-hw-text mb-2">
                        回答内容 <span className="text-hw-error">*</span>
                      </label>
                      <textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        rows={6}
                        placeholder="详细描述你的解决方案，包括步骤、代码、原理等..."
                        className="w-full px-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all resize-none"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-hw-text mb-2">
                        附件上传
                      </label>
                      <div className="border-2 border-dashed border-hw-border rounded-xl p-6 text-center hover:border-hw-primary/50 transition-colors">
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer"
                        >
                          <FileText className="w-10 h-10 text-hw-text-secondary mx-auto mb-2" />
                          <p className="text-sm text-hw-text-secondary mb-1">
                            点击或拖拽文件到此处上传
                          </p>
                          <p className="text-xs text-hw-text-secondary/70">
                            支持原理图 (PDF)、固件 (bin/hex)、照片 (jpg/png) 等格式
                          </p>
                        </label>
                        {answerFiles.length > 0 && (
                          <div className="mt-4 text-left">
                            <p className="text-sm text-hw-primary mb-2">已选择 {answerFiles.length} 个文件：</p>
                            <ul className="text-sm text-hw-text-secondary space-y-1">
                              {answerFiles.map((file, index) => (
                                <li key={index} className="truncate">
                                  • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isVerified}
                          onChange={(e) => setIsVerified(e.target.checked)}
                          disabled={!user?.isVerified}
                          className="w-4 h-4 rounded border-hw-border bg-hw-bg text-hw-primary focus:ring-hw-primary/50 disabled:opacity-50"
                        />
                        <span className={`text-sm ${user?.isVerified ? 'text-hw-text' : 'text-hw-text-secondary/50'}`}>
                          <ShieldCheck className="w-4 h-4 inline mr-1" />
                          标记为已验证方案
                          {!user?.isVerified && ' (需要认证开发者)'}
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={submitting || !answerContent.trim()}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-hw-primary text-hw-bg font-semibold rounded-xl hover:bg-hw-primary-dark transition-all shadow-glow-green hover:shadow-glow-green/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                        {submitting ? '提交中...' : '提交回答'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )
        )}

        {licenseModal.isOpen && licenseModal.license && licenseModal.attachment && (
          <LicenseModal
            isOpen={licenseModal.isOpen}
            onClose={() => setLicenseModal({ isOpen: false, license: null, attachment: null })}
            onConfirm={confirmDownload}
            license={licenseModal.license}
            fileName={licenseModal.attachment.originalName}
            fileSize={licenseModal.attachment.fileSize}
          />
        )}
      </div>
    </div>
  );
}

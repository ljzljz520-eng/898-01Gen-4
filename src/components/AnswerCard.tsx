import { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Award,
  ShieldCheck,
  Clock,
  FileText,
  Download,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Answer, Attachment, License } from '../../shared/types';
import { useAuthStore } from '../store/authStore';
import { apiRequest, downloadFile } from '../utils/api';
import LicenseModal from './LicenseModal';

interface AnswerCardProps {
  answer: Answer;
  questionUserId: number;
  questionAcceptedAnswerId?: number;
  onUpdate: () => void;
}

export default function AnswerCard({
  answer,
  questionUserId,
  questionAcceptedAnswerId,
  onUpdate
}: AnswerCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isVoting, setIsVoting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [licenseModal, setLicenseModal] = useState<{
    isOpen: boolean;
    license: License | null;
    attachment: Attachment | null;
  }>({ isOpen: false, license: null, attachment: null });

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

  const handleVote = async (direction: number) => {
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    setIsVoting(true);
    try {
      await apiRequest(`/answers/${answer.id}/vote`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ direction })
      });
      onUpdate();
    } catch (error) {
      console.error('Vote error:', error);
      alert(error instanceof Error ? error.message : '投票失败');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated || user?.id !== questionUserId) {
      return;
    }

    if (questionAcceptedAnswerId) {
      alert('该问题已有采纳的回答');
      return;
    }

    if (!confirm('确定采纳此回答作为最佳解决方案吗？采纳后将自动加入知识库。')) {
      return;
    }

    try {
      await apiRequest(`/answers/${answer.id}/accept`, {
        method: 'POST',
        requireAuth: true
      });
      onUpdate();
    } catch (error) {
      console.error('Accept error:', error);
      alert(error instanceof Error ? error.message : '采纳失败');
    }
  };

  const handleVerify = async () => {
    if (!isAuthenticated || !user?.isVerified) {
      alert('只有认证开发者才能标记验证状态');
      return;
    }

    try {
      await apiRequest(`/answers/${answer.id}/verify`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ isVerified: !answer.isVerified })
      });
      onUpdate();
    } catch (error) {
      console.error('Verify error:', error);
      alert(error instanceof Error ? error.message : '标记失败');
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
      onUpdate();
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : '下载失败');
    }
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

  const shouldTruncate = answer.content.length > 300;
  const displayContent = shouldTruncate && !showFullContent
    ? answer.content.substring(0, 300) + '...'
    : answer.content;

  return (
    <div
      className={`relative bg-hw-bg-card border rounded-xl p-5 transition-all duration-300 ${
        answer.isAccepted
          ? 'border-hw-success/50 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]'
          : 'border-hw-border hover:border-hw-primary/30'
      }`}
    >
      {answer.isAccepted && (
        <div className="absolute -top-3 left-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-hw-success text-hw-bg text-xs font-bold rounded-full shadow-glow-green">
            <Award className="w-3.5 h-3.5" />
            已采纳方案
          </span>
        </div>
      )}

      {answer.isVerified && (
        <div className="absolute -top-3 right-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-hw-accent text-white text-xs font-bold rounded-full shadow-glow-orange">
            <ShieldCheck className="w-3.5 h-3.5" />
            已验证
          </span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            onClick={() => handleVote(1)}
            disabled={isVoting}
            className="p-2 rounded-lg hover:bg-hw-primary/10 text-hw-text-secondary hover:text-hw-primary transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <span className={`text-lg font-bold font-mono ${
            answer.voteCount > 0 ? 'text-hw-primary' :
            answer.voteCount < 0 ? 'text-hw-error' : 'text-hw-text-secondary'
          }`}>
            {answer.voteCount}
          </span>
          <button
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            className="p-2 rounded-lg hover:bg-hw-error/10 text-hw-text-secondary hover:text-hw-error transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-hw-primary/20 rounded-full flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-hw-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-hw-text">{answer.user?.username}</p>
                  {answer.user?.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-hw-accent" />
                  )}
                </div>
                <p className="text-xs text-hw-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(answer.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && user?.isVerified && (
                <button
                  onClick={handleVerify}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    answer.isVerified
                      ? 'bg-hw-accent/20 text-hw-accent'
                      : 'bg-hw-border text-hw-text-secondary hover:bg-hw-accent/10 hover:text-hw-accent'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {answer.isVerified ? '已验证' : '标记验证'}
                </button>
              )}

              {isAuthenticated && user?.id === questionUserId && !questionAcceptedAnswerId && (
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-hw-success/10 text-hw-success rounded-lg text-xs font-medium hover:bg-hw-success/20 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  采纳此回答
                </button>
              )}
            </div>
          </div>

          <div className="markdown-content text-hw-text mb-4">
            {displayContent.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {shouldTruncate && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="flex items-center gap-1 text-sm text-hw-primary hover:text-hw-primary-dark mb-4"
            >
              {showFullContent ? (
                <>
                  收起 <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  展开全部 <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {answer.attachments && answer.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-hw-text-secondary mb-2">附件 ({answer.attachments.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {answer.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-hw-bg border border-hw-border rounded-lg hover:border-hw-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-hw-primary/10 rounded-lg">
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
                      className="p-2 text-hw-text-secondary hover:text-hw-primary hover:bg-hw-primary/10 rounded-lg transition-colors"
                      title="下载"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
  );
}

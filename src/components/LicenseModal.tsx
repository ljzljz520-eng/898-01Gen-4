import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { License } from '../../shared/types';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  license: License;
  fileName: string;
  fileSize: number;
}

export default function LicenseModal({
  isOpen,
  onClose,
  onConfirm,
  license,
  fileName,
  fileSize
}: LicenseModalProps) {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-hw-bg-card border border-hw-accent/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-hw-accent/20 to-hw-accent/5 border-b border-hw-accent/30 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-hw-accent/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-hw-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-hw-text">
                  许可证确认
                </h3>
                <p className="text-sm text-hw-text-secondary">
                  下载前请仔细阅读以下条款
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-hw-bg transition-colors text-hw-text-secondary hover:text-hw-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-hw-bg border border-hw-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-hw-text-secondary">文件名</span>
              <span className="text-sm text-hw-text font-mono">{fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-hw-text-secondary">大小</span>
              <span className="text-sm text-hw-text">{formatFileSize(fileSize)}</span>
            </div>
          </div>

          <div className="bg-hw-bg border border-hw-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-hw-primary" />
              <span className="font-display font-semibold text-hw-primary">
                {license.fullName}
              </span>
            </div>
            <p className="text-sm text-hw-text-secondary mb-4">
              {license.description}
            </p>
            <a
              href={license.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-hw-primary hover:underline"
            >
              查看完整许可证 →
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={`text-center p-3 rounded-xl ${license.commercialUse ? 'bg-hw-success/10 border border-hw-success/30' : 'bg-hw-error/10 border border-hw-error/30'}`}>
              {license.commercialUse ? (
                <CheckCircle className="w-5 h-5 text-hw-success mx-auto mb-1" />
              ) : (
                <XCircle className="w-5 h-5 text-hw-error mx-auto mb-1" />
              )}
              <p className="text-xs font-medium text-hw-text">商业使用</p>
              <p className={`text-xs ${license.commercialUse ? 'text-hw-success' : 'text-hw-error'}`}>
                {license.commercialUse ? '允许' : '禁止'}
              </p>
            </div>

            <div className={`text-center p-3 rounded-xl ${license.attributionRequired ? 'bg-hw-warning/10 border border-hw-warning/30' : 'bg-hw-success/10 border border-hw-success/30'}`}>
              {license.attributionRequired ? (
                <AlertTriangle className="w-5 h-5 text-hw-warning mx-auto mb-1" />
              ) : (
                <CheckCircle className="w-5 h-5 text-hw-success mx-auto mb-1" />
              )}
              <p className="text-xs font-medium text-hw-text">署名</p>
              <p className={`text-xs ${license.attributionRequired ? 'text-hw-warning' : 'text-hw-success'}`}>
                {license.attributionRequired ? '需要' : '无需'}
              </p>
            </div>

            <div className={`text-center p-3 rounded-xl ${license.shareAlike ? 'bg-hw-primary/10 border border-hw-primary/30' : 'bg-hw-success/10 border border-hw-success/30'}`}>
              {license.shareAlike ? (
                <Info className="w-5 h-5 text-hw-primary mx-auto mb-1" />
              ) : (
                <CheckCircle className="w-5 h-5 text-hw-success mx-auto mb-1" />
              )}
              <p className="text-xs font-medium text-hw-text">相同方式共享</p>
              <p className={`text-xs ${license.shareAlike ? 'text-hw-primary' : 'text-hw-success'}`}>
                {license.shareAlike ? '需要' : '无需'}
              </p>
            </div>
          </div>

          {!license.commercialUse && (
            <div className="bg-hw-accent/10 border border-hw-accent/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-hw-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-hw-accent mb-1">
                    禁止商业使用
                  </p>
                  <p className="text-sm text-hw-text-secondary">
                    此文件采用 {license.name} 许可证，禁止用于商业目的或在闭源商业项目中使用。
                    请确保您的使用符合许可证条款。
                  </p>
                </div>
              </div>
            </div>
          )}

          {license.shareAlike && (
            <div className="bg-hw-primary/10 border border-hw-primary/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-hw-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-hw-primary mb-1">
                    相同方式共享
                  </p>
                  <p className="text-sm text-hw-text-secondary">
                    如果您修改或基于此文件创作衍生作品，必须采用相同的许可证发布您的作品。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-hw-bg border-t border-hw-border px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-hw-border text-hw-text-secondary rounded-xl hover:bg-hw-bg-light transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-hw-accent text-white rounded-xl hover:bg-hw-accent-dark transition-all font-medium animate-pulse-glow flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              我已阅读并同意，开始下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

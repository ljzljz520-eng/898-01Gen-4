import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CircuitBoard,
  Cpu,
  Box,
  HelpCircle,
  Upload,
  Loader2,
  Send,
  FileText,
  X
} from 'lucide-react';
import { apiUpload } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { licenses } from '../../shared/licenses';

const hardwareTypes = [
  { id: 'circuit', label: '电路板', icon: CircuitBoard },
  { id: 'sensor', label: '传感器', icon: Cpu },
  { id: 'case', label: '外壳', icon: Box },
  { id: 'other', label: '其他', icon: HelpCircle },
];

const fileTypes = [
  { id: 'schematic', label: '原理图 (.pdf, .sch, .brd)' },
  { id: 'firmware', label: '固件 (.bin, .hex, .ino)' },
  { id: 'photo', label: '测试照片 (.jpg, .png)' },
  { id: 'other', label: '其他' },
];

interface FileItem {
  file: File;
  type: string;
  license: string;
}

export default function Ask() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hardwareType, setHardwareType] = useState('circuit');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFileType, setCurrentFileType] = useState('schematic');
  const [currentFileLicense, setCurrentFileLicense] = useState('cc-by-sa-4.0');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        type: currentFileType,
        license: currentFileLicense
      }));
      setFiles([...files, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('请填写标题和问题描述');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('hardwareType', hardwareType);
      formData.append('firmwareVersion', firmwareVersion);
      formData.append('tags', tags);

      files.forEach((item, index) => {
        formData.append('attachments', item.file);
        formData.append(`fileTypes[${index}]`, item.type);
        formData.append(`licenses[${index}]`, item.license);
      });

      const response = await apiUpload<{ data: { id: number } }>('/questions', formData);

      navigate(`/questions/${response.data.id}`);
    } catch (error) {
      console.error('Submit question error:', error);
      alert(error instanceof Error ? error.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-hw-text-secondary hover:text-hw-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回问题列表
        </Link>

        <div className="bg-hw-bg-card border border-hw-border rounded-2xl p-6 md:p-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-hw-text mb-6">
            发布新问题
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                硬件类型 <span className="text-hw-error">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hardwareTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setHardwareType(type.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                        hardwareType === type.id
                          ? 'border-hw-primary bg-hw-primary/10 text-hw-primary'
                          : 'border-hw-border bg-hw-bg text-hw-text-secondary hover:border-hw-primary/50 hover:text-hw-text'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                问题标题 <span className="text-hw-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="清晰描述你遇到的硬件问题..."
                className="w-full px-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
                maxLength={200}
                required
              />
              <p className="mt-1 text-xs text-hw-text-secondary">
                {title.length}/200
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                固件版本 (可选)
              </label>
              <input
                type="text"
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                placeholder="例如: v1.2.3, 2.0.1-beta"
                className="w-full px-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                问题描述 <span className="text-hw-error">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="详细描述你的问题：&#10;1. 硬件配置和连接方式&#10;2. 预期行为和实际现象&#10;3. 已尝试的解决方案&#10;4. 相关的代码或原理图说明"
                className="w-full px-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-hw-text mb-2">
                标签 (可选)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="使用逗号分隔，例如: ESP32, I2C, 电源"
                className="w-full px-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-hw-text placeholder-hw-text-secondary focus:outline-none focus:border-hw-primary focus:ring-1 focus:ring-hw-primary/50 transition-all"
              />
            </div>

            <div className="border-t border-hw-border pt-6">
              <label className="block text-sm font-medium text-hw-text mb-4">
                附件上传 (原理图、固件、测试照片等)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-hw-text-secondary mb-2">文件类型</label>
                  <select
                    value={currentFileType}
                    onChange={(e) => setCurrentFileType(e.target.value)}
                    className="w-full px-3 py-2 bg-hw-bg border border-hw-border rounded-lg text-hw-text text-sm focus:outline-none focus:border-hw-primary"
                  >
                    {fileTypes.map((ft) => (
                      <option key={ft.id} value={ft.id}>{ft.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-hw-text-secondary mb-2">许可证</label>
                  <select
                    value={currentFileLicense}
                    onChange={(e) => setCurrentFileLicense(e.target.value)}
                    className="w-full px-3 py-2 bg-hw-bg border border-hw-border rounded-lg text-hw-text text-sm focus:outline-none focus:border-hw-primary"
                  >
                    {licenses.map((lic) => (
                      <option key={lic.id} value={lic.id}>{lic.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-2 border-dashed border-hw-border rounded-xl p-6 text-center hover:border-hw-primary/50 transition-colors">
                <input
                  type="file"
                  id="question-file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="question-file-upload"
                  className="cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-hw-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-hw-text-secondary mb-1">
                    点击或拖拽文件到此处上传
                  </p>
                  <p className="text-xs text-hw-text-secondary/70">
                    单个文件最大 50MB
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-hw-primary font-medium">
                    已选择 {files.length} 个文件：
                  </p>
                  {files.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-hw-bg border border-hw-border rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-hw-primary/10 rounded-lg">
                          <FileText className="w-4 h-4 text-hw-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-hw-text font-medium truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-hw-text-secondary">
                            {formatFileSize(item.file.size)} · {fileTypes.find(f => f.id === item.type)?.label} · {licenses.find(l => l.id === item.license)?.name}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1.5 text-hw-text-secondary hover:text-hw-error hover:bg-hw-error/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-hw-border">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-hw-border text-hw-text-secondary font-medium rounded-xl hover:bg-hw-bg transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-hw-primary text-hw-bg font-semibold rounded-xl hover:bg-hw-primary-dark transition-all shadow-glow-green hover:shadow-glow-green/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {submitting ? '发布中...' : '发布问题'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

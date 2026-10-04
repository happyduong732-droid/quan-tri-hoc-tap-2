import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, Trash2, Volume2, VolumeX, X, Database, ShieldCheck } from 'lucide-react';
import { AppData } from '../types';
import { exportAppDataToFile, importAppDataFromFile } from '../services/storage';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (newData: AppData) => void;
  onResetSample: () => void;
  onClearData: () => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
  onResetSample,
  onClearData,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportAppDataToFile(data);
    onNotify('success', 'Đã xuất dữ liệu thành công', 'Tệp tin JSON đã được tải về thiết bị của thầy.');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importAppDataFromFile(file);
      onUpdateData(imported);
      onNotify('success', 'Nhập dữ liệu thành công', `Đã khôi phục ${imported.students.length} học sinh và ${imported.lessons.length} bài học.`);
      onClose();
    } catch (err) {
      onNotify('error', 'Không thể nhập dữ liệu', err instanceof Error ? err.message : 'Tệp tải lên không hợp lệ.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSound = () => {
    const next = !data.soundEnabled;
    onUpdateData({ ...data, soundEnabled: next });
    onNotify('info', next ? 'Đã bật hiệu ứng âm thanh' : 'Đã tắt hiệu ứng âm thanh', 'Âm thanh thông báo nhẹ khi hoàn thành tác vụ.');
  };

  return (
    <div
      id="data-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="data-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Quản lý Lưu trữ & Sao lưu</h3>
              <p className="text-xs text-slate-500">Dữ liệu lưu an toàn trên trình duyệt (LocalStorage)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Toàn bộ dữ liệu của lớp, học sinh, điểm số và bài học được lưu trực tiếp trên thiết bị của thầy.
              Thầy có thể xuất tệp JSON để chuyển sang máy tính xách tay hoặc trình chiếu trên lớp dễ dàng.
            </p>
          </div>

          {/* Sound Setting */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${data.soundEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                {data.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-800">Hiệu ứng âm thanh thao tác</span>
                <p className="text-xs text-slate-500">Chuông nhẹ khi lưu hoặc xóa thành công</p>
              </div>
            </div>
            <button
              id="toggle-sound-btn"
              type="button"
              onClick={toggleSound}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                data.soundEnabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {data.soundEnabled ? 'Đang Bật' : 'Đang Tắt'}
            </button>
          </div>

          {/* Actions Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thao tác dữ liệu</h4>

            {/* Export */}
            <button
              id="export-data-btn"
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Xuất dữ liệu ra tệp (.JSON)</span>
                  <p className="text-xs text-slate-500">Tải xuống bản sao lưu toàn bộ thông tin về máy</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Xuất ngay →</span>
            </button>

            {/* Import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              id="import-data-btn"
              type="button"
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Nhập dữ liệu từ tệp (.JSON)</span>
                  <p className="text-xs text-slate-500">Khôi phục từ tệp sao lưu đã tải về trước đó</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Chọn tệp →</span>
            </button>

            {/* Reset Sample */}
            <button
              id="reset-sample-btn"
              type="button"
              onClick={onResetSample}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Khôi phục dữ liệu mẫu ban đầu</span>
                  <p className="text-xs text-slate-500">Tải lại danh sách 4 lớp (6A1, 7A1, 8A1, 9A1) và bài học mẫu</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">Khôi phục →</span>
            </button>

            {/* Clear All */}
            <button
              id="clear-all-data-btn"
              type="button"
              onClick={onClearData}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-200/80 hover:bg-rose-50 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-rose-900">Xóa dữ liệu mẫu để nhập mới</span>
                  <p className="text-xs text-rose-600/90">Xóa trắng tất cả để thầy tự nhập danh sách lớp từ đầu</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">Xóa trắng →</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

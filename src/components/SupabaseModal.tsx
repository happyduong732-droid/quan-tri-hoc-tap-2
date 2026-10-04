import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  X,
  KeyRound,
  Database,
  Code2,
  FileCheck2
} from 'lucide-react';
import { AppData } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushDataToSupabase,
  pullDataFromSupabase,
  SUPABASE_SQL_SETUP_SCRIPT,
  sanitizeSupabaseUrl
} from '../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (newData: AppData) => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
  onNotify,
}) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    hasTables: boolean;
    tablesFound: string[];
  }>({
    tested: false,
    connected: false,
    message: '',
    hasTables: false,
    tablesFound: [],
  });

  const [activeTab, setActiveTab] = useState<'sync' | 'config' | 'sql'>('sync');
  const [copiedSql, setCopiedSql] = useState(false);

  // Form input states
  const [urlInput, setUrlInput] = useState(config.url);
  const [anonKeyInput, setAnonKeyInput] = useState(config.anonKey);
  const [autoSyncInput, setAutoSyncInput] = useState(config.autoSync);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      const cleanUrl = sanitizeSupabaseUrl(current.url);
      setConfig({ ...current, url: cleanUrl });
      setUrlInput(cleanUrl);
      setAnonKeyInput(current.anonKey);
      setAutoSyncInput(current.autoSync);

      // Tự động kiểm tra kết nối khi mở modal
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult({
        tested: true,
        connected: result.connected,
        message: result.message,
        hasTables: result.hasTables,
        tablesFound: result.tablesFound,
      });
      if (result.connected) {
        onNotify('success', 'Kết nối Supabase thành công', result.message);
      } else {
        onNotify('warning', 'Chưa kết nối được Supabase', result.message);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestResult({
        tested: true,
        connected: false,
        message: msg,
        hasTables: false,
        tablesFound: [],
      });
      onNotify('error', 'Lỗi kiểm tra kết nối', msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!urlInput.trim() || !anonKeyInput.trim()) {
      onNotify('warning', 'Thiếu thông tin', 'Vui lòng điền đủ Supabase Project URL và Anon Key.');
      return;
    }
    const cleanUrl = sanitizeSupabaseUrl(urlInput);
    saveSupabaseConfig(cleanUrl, anonKeyInput.trim(), autoSyncInput);
    setConfig({ url: cleanUrl, anonKey: anonKeyInput.trim(), autoSync: autoSyncInput });
    setUrlInput(cleanUrl);
    onNotify('success', 'Đã lưu cấu hình Supabase', 'Đã cập nhật URL và khóa truy cập.');
    handleTestConnection();
  };

  const handlePushData = async () => {
    setIsPushing(true);
    try {
      const res = await pushDataToSupabase(data);
      onNotify('success', 'Đồng bộ lên đám mây thành công', res.message);
      handleTestConnection();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onNotify('error', 'Không thể đồng bộ lên Supabase', msg);
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullData = async () => {
    if (!window.confirm('Tải dữ liệu từ Supabase sẽ cập nhật và thay thế dữ liệu trên máy hiện tại. Thầy có muốn tiếp tục?')) {
      return;
    }

    setIsPulling(true);
    try {
      const res = await pullDataFromSupabase();
      if (res.data) {
        onUpdateData(res.data);
        onNotify('success', 'Tải dữ liệu thành công', res.message);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onNotify('error', 'Không thể tải dữ liệu từ Supabase', msg);
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    onNotify('success', 'Đã sao chép mã SQL', 'Thầy hãy dán vào mục SQL Editor trên trang Supabase và nhấn RUN.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div
      id="supabase-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="supabase-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Kết nối Cơ sở Dữ liệu Supabase</h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  Chính chủ
                </span>
              </div>
              <p className="text-xs text-slate-500">Đồng bộ dữ liệu học tập lên đám mây an toàn & tự động</p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Đồng bộ dữ liệu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Mã SQL tạo bảng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Cấu hình kết nối
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-sm transition-all ${
              testResult.tested
                ? testResult.connected
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.tested ? (
                testResult.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )
              ) : (
                <Database className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {testResult.tested
                    ? testResult.connected
                      ? 'Trạng thái: Đã kết nối thành công với Supabase!'
                      : 'Trạng thái: Chưa thể kết nối tới Supabase'
                    : 'Đang kiểm tra kết nối với Supabase...'}
                </p>
                <p className="text-xs mt-1 text-slate-600">
                  {testResult.tested
                    ? testResult.message
                    : `Dự án: ${config.url || 'Chưa cấu hình'}`}
                </p>
                {testResult.tablesFound.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {testResult.tablesFound.map((tbl) => (
                      <span
                        key={tbl}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 rounded-md border border-emerald-200"
                      >
                        ✓ {tbl}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
            </button>
          </div>

          {/* TAB 1: SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Push Card */}
                <div className="p-4 rounded-xl border border-blue-200 bg-linear-to-b from-blue-50/50 to-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                      <CloudUpload className="w-5 h-5 text-blue-600" />
                      Đẩy dữ liệu lên Supabase
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Tải toàn bộ {data.classes.length} lớp học, {data.students.length} học sinh,{' '}
                      {data.lessons.length} bài học, điểm số và nhận xét từ máy này lưu trữ lên Supabase Cloud.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushData}
                    disabled={isPushing}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CloudUpload className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                    {isPushing ? 'Đang tải lên Supabase...' : 'Đẩy dữ liệu lên Cloud ngay'}
                  </button>
                </div>

                {/* Pull Card */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-linear-to-b from-emerald-50/50 to-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CloudDownload className="w-5 h-5 text-emerald-600" />
                      Tải dữ liệu từ Supabase về
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Kéo dữ liệu mới nhất từ đám mây Supabase về máy tính này (rất tiện khi thầy đổi máy tính khác hoặc sang máy ở trường).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullData}
                    disabled={isPulling}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CloudDownload className={`w-4 h-4 ${isPulling ? 'animate-bounce' : ''}`} />
                    {isPulling ? 'Đang tải về...' : 'Tải dữ liệu từ Cloud về máy'}
                  </button>
                </div>
              </div>

              {/* Data Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Dữ liệu hiện có trên ứng dụng của thầy:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-700 text-sm block">{data.classes.length}</span>
                    Lớp học
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-700 text-sm block">{data.students.length}</span>
                    Học sinh
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-700 text-sm block">{data.lessons.length}</span>
                    Bài học
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-700 text-sm block">{data.grades.length}</span>
                    Cột điểm đã nhập
                  </div>
                </div>
              </div>

              {/* Step Guide */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600 shrink-0" />
                  Mẹo hữu ích khi lần đầu kết nối:
                </p>
                <p>
                  1. Nếu Supabase của thầy là dự án mới tinh, hãy chuyển qua tab <strong>"Mã SQL tạo bảng"</strong>, bấm sao chép và dán vào <strong>SQL Editor</strong> trên Supabase để tạo bảng.
                </p>
                <p>
                  2. Sau đó bấm nút <strong>"Đẩy dữ liệu lên Cloud ngay"</strong> ở trên để lưu toàn bộ học sinh và điểm số của thầy lên Supabase.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SQL SETUP SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Mã SQL tạo sẵn cho Supabase</h4>
                  <p className="text-xs text-slate-500">
                    Tạo tự động các bảng: <code>app_backup</code>, <code>classes</code>, <code>students</code>, <code>lessons</code>, <code>tasks</code>, <code>grades</code>, <code>comments</code> và cấp quyền RLS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Đã sao chép!' : 'Sao chép toàn bộ SQL'}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                  {SUPABASE_SQL_SETUP_SCRIPT}
                </pre>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <span>Đi đến trang quản trị Supabase SQL Editor:</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                >
                  Mở Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Supabase Anon Key (Public Key)
                </label>
                <textarea
                  rows={3}
                  value={anonKeyInput}
                  onChange={(e) => setAnonKeyInput(e.target.value)}
                  placeholder="sb_publishable_... hoặc eyJhbGciOi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autosync-check"
                  checked={autoSyncInput}
                  onChange={(e) => setAutoSyncInput(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="autosync-check" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Tự động đồng bộ lên Supabase ngầm khi có cập nhật dữ liệu mới
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Lưu & Áp dụng cấu hình
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Dự án: {config.url.replace('https://', '')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

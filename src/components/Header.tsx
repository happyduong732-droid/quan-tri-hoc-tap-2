import React from 'react';
import { Calendar, Search, Database, Volume2, VolumeX, Menu, BookMarked } from 'lucide-react';
import { AppData } from '../types';

interface HeaderProps {
  data: AppData;
  onOpenSearch: () => void;
  onOpenDataModal: () => void;
  onToggleSound: () => void;
  onToggleMobileSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  onOpenSearch,
  onOpenDataModal,
  onToggleSound,
  onToggleMobileSidebar,
}) => {
  // Format Vietnamese date: e.g. "Thứ Sáu, ngày 18 tháng 09, 2026"
  const now = new Date();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = dayNames[now.getDay()];
  const formattedDate = `${dayName}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Branding & Teacher Info */}
          <div className="flex items-center gap-3.5">
            <button
              id="toggle-sidebar-mobile-btn"
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Mở bảng điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <BookMarked className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  TRỢ LÝ QUẢN TRỊ HỌC TẬP
                </h1>
                <p className="text-xs sm:text-sm font-medium text-blue-700 leading-tight mt-0.5">
                  Thầy Dương Thành Tín <span className="text-slate-300 font-normal">|</span> Ngữ văn{' '}
                  <span className="text-slate-300 font-normal">|</span> THCS Phan Bội Châu
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Search + Date + Tool Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search Bar trigger */}
            <button
              id="quick-search-trigger"
              type="button"
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-sm border border-slate-200/80 transition-all w-60 lg:w-72"
              title="Tìm kiếm nhanh (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="flex-1 text-left text-xs truncate">Tìm học sinh, lớp, bài học...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded-md border border-slate-300 shadow-2xs">
                Tìm kiếm
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
              title="Tìm kiếm nhanh"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Date Display Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {/* Sound Toggle */}
            <button
              id="header-sound-toggle-btn"
              type="button"
              onClick={onToggleSound}
              className={`p-2.5 rounded-xl border transition-all ${
                data.soundEnabled
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
              }`}
              title={data.soundEnabled ? 'Âm thanh: Đang Bật (Bấm để tắt)' : 'Âm thanh: Đang Tắt (Bấm để bật)'}
            >
              {data.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Backup / Restore Data Button */}
            <button
              id="header-data-manager-btn"
              type="button"
              onClick={onOpenDataModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all hover:border-slate-300 active:scale-95"
              title="Quản lý sao lưu & Dữ liệu mẫu"
            >
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Sao lưu dữ liệu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

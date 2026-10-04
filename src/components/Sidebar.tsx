import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Award,
  TrendingUp,
  MessageSquareQuote,
  BarChart3,
  X
} from 'lucide-react';
import { NavTab, AppData } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  data: AppData;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  data,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Quick dynamic counts for badges
  const pendingTasksCount = data.tasks.filter((t) => t.status !== 'Đã hoàn thành').length;
  const needAttentionCount = data.students.filter((s) => s.needAttention).length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: '1. Tổng quan', icon: LayoutDashboard },
    { id: 'classes', label: '2. Lớp học', icon: Users, badge: data.classes.length },
    { id: 'students', label: '3. Học sinh', icon: GraduationCap, badge: data.students.length },
    { id: 'lessons', label: '4. Bài học', icon: BookOpen, badge: data.lessons.length },
    {
      id: 'tasks',
      label: '5. Nhiệm vụ',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount} chờ` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'grades', label: '6. Điểm số', icon: Award },
    {
      id: 'progress',
      label: '7. Tiến độ học tập',
      icon: TrendingUp,
      badge: needAttentionCount > 0 ? `${needAttentionCount} lưu ý` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    { id: 'comments', label: '8. Nhận xét', icon: MessageSquareQuote, badge: data.comments.length },
    { id: 'stats', label: '9. Thống kê', icon: BarChart3 },
  ];

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-800 text-sm">Danh mục chức năng</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Hệ thống quản trị
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile Info Box */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200">
              DT
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Thầy Dương Thành Tín</p>
              <p className="text-[11px] text-slate-500 truncate">Ngữ văn • THCS Phan Bội Châu</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

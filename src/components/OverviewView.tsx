import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Award,
  TrendingUp,
  Clock,
  AlertCircle,
  Activity,
  ArrowRight,
  CalendarCheck,
  Plus
} from 'lucide-react';
import { AppData, NavTab } from '../types';

interface OverviewViewProps {
  data: AppData;
  onNavigate: (tab: NavTab, filter?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ data, onNavigate }) => {
  // Compute Key Metrics
  const totalClasses = data.classes.length;
  const totalStudents = data.students.length;

  // Bài học đang triển khai (status: 'Đang dạy')
  const ongoingLessons = data.lessons.filter((l) => l.status === 'Đang dạy');

  // Nhiệm vụ chưa hoàn thành (status !== 'Đã hoàn thành')
  const pendingTasks = data.tasks.filter((t) => t.status !== 'Đã hoàn thành');

  // Điểm trung bình toàn bộ học sinh
  const averageScore =
    data.grades.length > 0
      ? (data.grades.reduce((sum, g) => sum + g.score, 0) / data.grades.length).toFixed(1)
      : '0.0';

  // Tỷ lệ hoàn thành nhiệm vụ (tính theo số học sinh đã hoàn thành trên tổng lượt học sinh của nhiệm vụ)
  let totalAssignedSlots = 0;
  let totalCompletedSlots = 0;
  data.tasks.forEach((t) => {
    const classStudentCount = data.students.filter((s) => s.classId === t.classId).length;
    totalAssignedSlots += classStudentCount > 0 ? classStudentCount : 1;
    totalCompletedSlots += t.completedStudentIds.length;
  });
  const taskCompletionRate =
    totalAssignedSlots > 0 ? Math.round((totalCompletedSlots / totalAssignedSlots) * 100) : 0;

  // Kế hoạch hôm nay: Các bài học đang dạy hoặc có lịch dạy hôm nay/gần nhất + các nhiệm vụ hạn gần
  const todayPlans = [
    ...ongoingLessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: 'Bài học Ngữ văn' as const,
      tag: 'Tiết dạy trên lớp',
      classId: l.classId,
      timeInfo: `Ngày dạy: ${l.teachDate}`,
      tab: 'lessons' as NavTab,
    })),
    ...pendingTasks.slice(0, 3).map((t) => ({
      id: t.id,
      title: t.title,
      type: 'Nhiệm vụ học tập' as const,
      tag: `Ưu tiên: ${t.priority}`,
      classId: t.classId,
      timeInfo: `Hạn hoàn thành: ${t.dueDate}`,
      tab: 'tasks' as NavTab,
    })),
  ];

  // Học sinh cần chú ý: điểm < 6.5 hoặc có cờ needAttention hoặc chưa làm nhiệm vụ
  const attentionStudents = data.students.filter((s) => {
    if (s.needAttention) return true;
    const studentGrades = data.grades.filter((g) => g.studentId === s.id);
    if (studentGrades.length > 0) {
      const avg = studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length;
      if (avg < 6.5) return true;
    }
    return false;
  });

  return (
    <div id="overview-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Chào Thầy Dương Thành Tín!
          </h2>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Bảng điều khiển môn Ngữ văn hôm nay đã sẵn sàng. Thầy có{' '}
            <strong className="text-white font-bold">{ongoingLessons.length} bài học đang triển khai</strong> và{' '}
            <strong className="text-white font-bold">{pendingTasks.length} nhiệm vụ cần theo dõi</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="overview-quick-add-student"
            type="button"
            onClick={() => onNavigate('students')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs transition-colors border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Quản lý học sinh</span>
          </button>
          <button
            id="overview-quick-enter-grades"
            type="button"
            onClick={() => onNavigate('grades')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-blue-800 hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Award className="w-4 h-4" />
            <span>Nhập điểm nhanh</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Tổng số lớp */}
        <div
          id="stat-card-classes"
          onClick={() => onNavigate('classes')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng số lớp</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalClasses}</span>
            <span className="text-xs text-slate-500 font-medium">lớp THCS</span>
          </div>
        </div>

        {/* Card 2: Tổng số học sinh */}
        <div
          id="stat-card-students"
          onClick={() => onNavigate('students')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng số học sinh</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
        </div>

        {/* Card 3: Bài học đang triển khai */}
        <div
          id="stat-card-lessons"
          onClick={() => onNavigate('lessons')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bài học đang dạy</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{ongoingLessons.length}</span>
            <span className="text-xs text-slate-500 font-medium">chủ đề</span>
          </div>
        </div>

        {/* Card 4: Nhiệm vụ chưa hoàn thành */}
        <div
          id="stat-card-pending-tasks"
          onClick={() => onNavigate('tasks')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nhiệm vụ chờ</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{pendingTasks.length}</span>
            <span className="text-xs text-slate-500 font-medium">chưa xong</span>
          </div>
        </div>

        {/* Card 5: Điểm trung bình */}
        <div
          id="stat-card-grades"
          onClick={() => onNavigate('grades')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Điểm trung bình</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">{averageScore}</span>
            <span className="text-xs text-slate-500 font-medium">/10 điểm</span>
          </div>
        </div>

        {/* Card 6: Tỷ lệ hoàn thành nhiệm vụ */}
        <div
          id="stat-card-completion-rate"
          onClick={() => onNavigate('progress')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tỷ lệ hoàn thành</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-700">{taskCompletionRate}%</span>
            <span className="text-xs text-slate-500 font-medium">tiến độ</span>
          </div>
        </div>
      </div>

      {/* 3 Columns: Kế hoạch hôm nay, Hoạt động gần đây, Cần chú ý */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Kế hoạch hôm nay */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Kế hoạch hôm nay</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {todayPlans.length} mục
            </span>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {todayPlans.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Không có lịch học hoặc nhiệm vụ đến hạn hôm nay.</p>
            ) : (
              todayPlans.map((plan) => {
                const className = data.classes.find((c) => c.id === plan.classId)?.name || 'Lớp';
                return (
                  <div
                    key={plan.id}
                    onClick={() => onNavigate(plan.tab)}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          Lớp {className}
                        </span>
                        <span className="text-xs text-slate-400">{plan.tag}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mt-1.5 leading-snug group-hover:text-blue-700 transition-colors">
                        {plan.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{plan.timeInfo}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Hoạt động gần đây */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Hoạt động gần đây</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Nhật ký
            </span>
          </div>

          <div className="mt-4 space-y-3.5 flex-1">
            {data.activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có ghi nhận hoạt động nào.</p>
            ) : (
              data.activityLogs.slice(0, 6).map((log) => {
                const date = new Date(log.timestamp);
                const timeString = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} - ${date.toLocaleDateString('vi-VN')}`;

                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 font-medium leading-relaxed">{log.action}</p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{timeString}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 3: Cần chú ý */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Cần chú ý</h3>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              {attentionStudents.length} học sinh
            </span>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {attentionStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs font-semibold text-emerald-600">Tuyệt vời! Hiện không có học sinh nào cần lưu ý đặc biệt.</p>
              </div>
            ) : (
              attentionStudents.slice(0, 5).map((student) => {
                const className = data.classes.find((c) => c.id === student.classId)?.name || 'Lớp';
                const grades = data.grades.filter((g) => g.studentId === student.id);
                const avg = grades.length > 0 ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 'Chưa có';

                return (
                  <div
                    key={student.id}
                    onClick={() => onNavigate('students', student.fullName)}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{student.fullName}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                          {className}
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 mt-1 leading-snug line-clamp-1">
                        {student.note || `Điểm TB: ${avg} • Cần động viên hoàn thành bài`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

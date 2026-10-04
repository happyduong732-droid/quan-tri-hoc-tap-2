import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  Filter,
  Users,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { AppData, NavTab } from '../types';

interface ProgressViewProps {
  data: AppData;
  onNavigate: (tab: NavTab, filter?: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ data, onNavigate }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Filter dataset by class
  const currentStudents = useMemo(() => {
    return selectedClassId === 'ALL'
      ? data.students
      : data.students.filter((s) => s.classId === selectedClassId);
  }, [data.students, selectedClassId]);

  const currentLessons = useMemo(() => {
    return selectedClassId === 'ALL'
      ? data.lessons
      : data.lessons.filter((l) => l.classId === selectedClassId);
  }, [data.lessons, selectedClassId]);

  const currentTasks = useMemo(() => {
    return selectedClassId === 'ALL'
      ? data.tasks
      : data.tasks.filter((t) => t.classId === selectedClassId);
  }, [data.tasks, selectedClassId]);

  const currentGrades = useMemo(() => {
    return selectedClassId === 'ALL'
      ? data.grades
      : data.grades.filter((g) => g.classId === selectedClassId);
  }, [data.grades, selectedClassId]);

  // Key metrics calculation
  const completedLessonsCount = currentLessons.filter((l) => l.status === 'Đã hoàn thành').length;
  const remainingTasksCount = currentTasks.filter((t) => t.status !== 'Đã hoàn thành').length;

  const avgScore =
    currentGrades.length > 0
      ? (currentGrades.reduce((sum, g) => sum + g.score, 0) / currentGrades.length).toFixed(1)
      : '0.0';

  // Overall Task Completion Ratio
  let totalAssigned = 0;
  let totalCompleted = 0;
  currentTasks.forEach((t) => {
    const classCount = data.students.filter((s) => s.classId === t.classId).length;
    totalAssigned += classCount > 0 ? classCount : 1;
    totalCompleted += t.completedStudentIds.length;
  });
  const overallTaskRate =
    totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  // Lesson Progress Rate
  const lessonRate =
    currentLessons.length > 0
      ? Math.round((completedLessonsCount / currentLessons.length) * 100)
      : 0;

  // Students requiring follow up
  const studentsNeedingAttention = currentStudents.filter((s) => {
    if (s.needAttention) return true;
    const stGrades = data.grades.filter((g) => g.studentId === s.id);
    if (stGrades.length > 0) {
      const avg = stGrades.reduce((sum, g) => sum + g.score, 0) / stGrades.length;
      if (avg < 6.5) return true;
    }
    return false;
  });

  return (
    <div id="progress-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Theo dõi Tiến độ Học tập</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng hợp tiến độ bài giảng, mức độ hoàn thành nhiệm vụ và danh sách học sinh cần đồng hành
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none"
          >
            <option value="ALL">Toàn bộ các khối lớp</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                Khối {c.gradeLevel} - Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Core Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tỷ lệ hoàn thành nhiệm vụ */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tỷ lệ hoàn thành</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">{overallTaskRate}%</span>
            <span className="text-xs text-slate-500">nhiệm vụ</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallTaskRate}%` }}
            />
          </div>
        </div>

        {/* Số bài học đã hoàn thành */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bài học đã dạy xong</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{completedLessonsCount}</span>
            <span className="text-xs text-slate-500">/{currentLessons.length} bài ({lessonRate}%)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${lessonRate}%` }}
            />
          </div>
        </div>

        {/* Số nhiệm vụ còn lại */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nhiệm vụ còn lại</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{remainingTasksCount}</span>
            <span className="text-xs text-slate-500">chưa hoàn thành</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cần nhắc nhở học sinh nộp đúng hạn</p>
        </div>

        {/* Điểm trung bình */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Điểm trung bình</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-700">{avgScore}</span>
            <span className="text-xs text-slate-500">/10 điểm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Môn Ngữ văn THCS</p>
        </div>
      </div>

      {/* Progress by Class visual bars */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Tiến độ hoàn thành nhiệm vụ theo từng lớp</span>
        </h3>

        <div className="space-y-4">
          {data.classes.map((cls) => {
            const classTasks = data.tasks.filter((t) => t.classId === cls.id);
            const classStudents = data.students.filter((s) => s.classId === cls.id);

            let assigned = 0;
            let completed = 0;
            classTasks.forEach((t) => {
              assigned += classStudents.length;
              completed += t.completedStudentIds.length;
            });

            const percent = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

            return (
              <div key={cls.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Lớp {cls.name}</span>
                    <span className="text-xs text-slate-400">({classStudents.length} học sinh)</span>
                  </div>
                  <span className="font-extrabold text-blue-700">{percent}% hoàn thành</span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>{classTasks.length} nhiệm vụ đã giao</span>
                  <span>{completed}/{assigned} lượt nộp bài</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danh sách học sinh cần theo dõi */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Danh sách học sinh cần theo dõi</h3>
              <p className="text-xs text-slate-500">
                Những học sinh có bài tập chưa hoàn thành hoặc kết quả bài làm cần sự hỗ trợ, khích lệ từ thầy
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
            {studentsNeedingAttention.length} học sinh
          </span>
        </div>

        {studentsNeedingAttention.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm font-semibold text-emerald-600">
              Không có học sinh nào cần theo dõi đặc biệt trong danh sách này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentsNeedingAttention.map((st) => {
              const className = data.classes.find((c) => c.id === st.classId)?.name || 'Lớp';
              const grades = data.grades.filter((g) => g.studentId === st.id);
              const avg =
                grades.length > 0
                  ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)
                  : 'Chưa có';

              const assignedTasks = data.tasks.filter((t) => t.classId === st.classId);
              const unfinishedTasks = assignedTasks.filter(
                (t) => !t.completedStudentIds.includes(st.id)
              );

              return (
                <div
                  key={st.id}
                  className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{st.fullName}</h4>
                        <p className="text-xs text-slate-500">
                          Mã: <span className="font-mono">{st.studentCode}</span> • Lớp{' '}
                          <strong className="text-slate-700">{className}</strong>
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        ĐTB: {avg}
                      </span>
                    </div>

                    <p className="text-xs text-rose-800 mt-2.5 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-rose-100">
                      {st.note || `Còn ${unfinishedTasks.length} nhiệm vụ chưa nộp bài`}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-rose-100/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {unfinishedTasks.length} bài tập chưa nộp
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('students', st.fullName)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Hồ sơ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Filter,
  Users,
  Award,
  TrendingUp,
  BookOpen,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { AppData, NavTab } from '../types';

interface StatsViewProps {
  data: AppData;
  onNavigate: (tab: NavTab, filter?: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ data, onNavigate }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  const filteredClasses = useMemo(() => {
    return selectedClassId === 'ALL'
      ? data.classes
      : data.classes.filter((c) => c.id === selectedClassId);
  }, [data.classes, selectedClassId]);

  // Calculations per class
  const classStats = useMemo(() => {
    return filteredClasses.map((cls) => {
      const students = data.students.filter((s) => s.classId === cls.id);
      const grades = data.grades.filter((g) => g.classId === cls.id);
      const avgScore =
        grades.length > 0
          ? Number((grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1))
          : 0;

      const lessons = data.lessons.filter((l) => l.classId === cls.id);
      const completedLessons = lessons.filter((l) => l.status === 'Đã hoàn thành').length;
      const lessonRate =
        lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

      const tasks = data.tasks.filter((t) => t.classId === cls.id);
      let totalSlots = 0;
      let completedSlots = 0;
      tasks.forEach((t) => {
        totalSlots += students.length;
        completedSlots += t.completedStudentIds.length;
      });
      const taskRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

      const needAttentionCount = students.filter((s) => {
        if (s.needAttention) return true;
        const stGrades = grades.filter((g) => g.studentId === s.id);
        if (stGrades.length > 0) {
          const avg = stGrades.reduce((sum, g) => sum + g.score, 0) / stGrades.length;
          return avg < 6.5;
        }
        return false;
      }).length;

      return {
        classItem: cls,
        studentCount: students.length,
        avgScore,
        lessonRate,
        completedLessons,
        totalLessons: lessons.length,
        taskRate,
        totalTasks: tasks.length,
        needAttentionCount,
      };
    });
  }, [filteredClasses, data]);

  // Overall calculations
  const maxClassSize = Math.max(...data.classes.map((c) => data.students.filter((s) => s.classId === c.id).length), 1);

  return (
    <div id="stats-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Báo cáo & Thống kê Tổng hợp</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Phân tích số liệu học tập môn Ngữ văn các khối THCS Phan Bội Châu
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
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: 2 Main Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Số lượng học sinh theo lớp (Bar Visualization) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Sĩ số học sinh theo từng lớp</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Phân bố số lượng học sinh các lớp phụ trách</p>

          <div className="space-y-4">
            {classStats.map((item) => {
              const barWidth = Math.round((item.studentCount / maxClassSize) * 100);
              return (
                <div key={item.classItem.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">Lớp {item.classItem.name}</span>
                    <span className="text-blue-700 font-extrabold">{item.studentCount} học sinh</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex items-center p-0.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-md transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Điểm trung bình theo lớp */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Điểm trung bình môn Ngữ văn theo lớp</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Thang điểm 10.0 dựa trên các bài đã kiểm tra</p>

          <div className="space-y-4">
            {classStats.map((item) => {
              const barWidth = Math.min(Math.round((item.avgScore / 10) * 100), 100);
              return (
                <div key={item.classItem.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">Lớp {item.classItem.name}</span>
                    <span className="text-indigo-700 font-extrabold">{item.avgScore.toFixed(1)} / 10.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex items-center p-0.5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-md transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Tỷ lệ hoàn thành nhiệm vụ & Tiến độ bài học */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tỷ lệ hoàn thành nhiệm vụ */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Tỷ lệ hoàn thành nhiệm vụ học tập</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Đo lường mức độ nộp bài đúng hạn của học sinh</p>

          <div className="space-y-4">
            {classStats.map((item) => (
              <div key={item.classItem.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-800">Lớp {item.classItem.name}</span>
                  <span className="text-emerald-700">{item.taskRate}% hoàn thành</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.taskRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiến độ bài học */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Tiến độ giảng dạy bài học</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Tỷ lệ các bài học đã hoàn thành theo kế hoạch</p>

          <div className="space-y-4">
            {classStats.map((item) => (
              <div key={item.classItem.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-800">Lớp {item.classItem.name}</span>
                  <span className="text-amber-700">
                    {item.completedLessons}/{item.totalLessons} bài ({item.lessonRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.lessonRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tổng hợp Học sinh cần theo dõi theo khối lớp */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Số lượng học sinh cần theo dõi hỗ trợ theo lớp</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Học sinh có điểm trung bình dưới 6.5 hoặc còn tồn đọng bài tập cần thầy động viên
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {classStats.map((item) => (
            <div
              key={item.classItem.id}
              onClick={() => onNavigate('progress')}
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer text-center"
            >
              <span className="text-xs font-bold text-slate-700 block">Lớp {item.classItem.name}</span>
              <span className="text-3xl font-black text-rose-600 block mt-2">
                {item.needAttentionCount}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">học sinh cần hỗ trợ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  X
} from 'lucide-react';
import { GradeEntry, AppData } from '../types';

interface GradesViewProps {
  data: AppData;
  initialClassFilter?: string;
  onAddGrade: (grade: Omit<GradeEntry, 'id'>) => void;
  onUpdateGrade: (grade: GradeEntry) => void;
  onDeleteGrade: (gradeId: string) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  data,
  initialClassFilter = 'ALL',
  onAddGrade,
  onUpdateGrade,
  onDeleteGrade,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeEntry | null>(null);

  // Form states
  const [classId, setClassId] = useState(data.classes[0]?.id || '');
  const [studentId, setStudentId] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [score, setScore] = useState<number | string>(8.0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Filtering
  const filteredGrades = useMemo(() => {
    return data.grades.filter((g) => {
      if (selectedClassId !== 'ALL' && g.classId !== selectedClassId) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const student = data.students.find((s) => s.id === g.studentId);
        const matchesStudent = student ? student.fullName.toLowerCase().includes(q) : false;
        const matchesActivity = g.activityTitle.toLowerCase().includes(q);
        const matchesNote = g.note ? g.note.toLowerCase().includes(q) : false;
        if (!matchesStudent && !matchesActivity && !matchesNote) return false;
      }
      return true;
    });
  }, [data.grades, data.students, selectedClassId, search]);

  // Statistics calculation for filtered set
  const stats = useMemo(() => {
    if (filteredGrades.length === 0) {
      return { avg: '0.0', max: '0.0', min: '0.0', count: 0, highCount: 0, midCount: 0, lowCount: 0 };
    }
    const scores = filteredGrades.map((g) => g.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / scores.length).toFixed(1);
    const max = Math.max(...scores).toFixed(1);
    const min = Math.min(...scores).toFixed(1);

    const highCount = scores.filter((s) => s >= 8.0).length; // Mức tốt / giỏi
    const midCount = scores.filter((s) => s >= 6.5 && s < 8.0).length; // Mức khá
    const passCount = scores.filter((s) => s >= 5.0 && s < 6.5).length; // Đạt
    const lowCount = scores.filter((s) => s < 5.0).length; // Cần cố gắng

    return { avg, max, min, count: scores.length, highCount, midCount, passCount, lowCount };
  }, [filteredGrades]);

  const handleOpenAdd = () => {
    setEditingGrade(null);
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (data.classes[0]?.id || '');
    setClassId(targetClass);
    const studentsInClass = data.students.filter((s) => s.classId === targetClass);
    setStudentId(studentsInClass[0]?.id || '');
    setActivityTitle('Kiểm tra đọc hiểu & viết đoạn văn');
    setScore(8.0);
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: GradeEntry) => {
    setEditingGrade(g);
    setClassId(g.classId);
    setStudentId(g.studentId);
    setActivityTitle(g.activityTitle);
    setScore(g.score);
    setDate(g.date);
    setNote(g.note || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleClassChangeInForm = (newClassId: string) => {
    setClassId(newClassId);
    const studentsInClass = data.students.filter((s) => s.classId === newClassId);
    setStudentId(studentsInClass[0]?.id || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setFormError('Vui lòng chọn học sinh');
      return;
    }
    if (!activityTitle.trim()) {
      setFormError('Vui lòng nhập tên bài kiểm tra / hoạt động');
      return;
    }
    const numScore = parseFloat(String(score));
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      setFormError('Điểm số phải từ 0.0 đến 10.0');
      return;
    }

    if (editingGrade) {
      onUpdateGrade({
        ...editingGrade,
        classId,
        studentId,
        activityTitle: activityTitle.trim(),
        score: numScore,
        date,
        note: note.trim() || undefined,
      });
    } else {
      onAddGrade({
        classId,
        studentId,
        activityTitle: activityTitle.trim(),
        score: numScore,
        date,
        note: note.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div id="grades-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Điểm số môn Ngữ văn</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Nhập điểm kiểm tra đọc hiểu, viết đoạn văn, bài tập thường xuyên và phân tích thống kê
          </p>
        </div>
        <button
          id="add-grade-btn"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all min-h-[44px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nhập điểm mới</span>
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Điểm trung bình</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-700">{stats.avg}</span>
            <span className="text-xs text-slate-400">/10</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dựa trên {stats.count} bài chấm</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Điểm cao nhất</span>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-2xl font-black text-emerald-700">{stats.max}</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">{stats.highCount} bài đạt ≥ 8.0</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Điểm thấp nhất</span>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-2xl font-black text-rose-600">{stats.min}</span>
            <ArrowDownRight className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{stats.lowCount} bài dưới 5.0</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phân loại mức điểm</span>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-700 font-bold">8.0 - 10:</span>
              <span className="font-semibold">{stats.highCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 font-bold">6.5 - 7.9:</span>
              <span className="font-semibold">{stats.midCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, bài kiểm tra, lời phê..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">Tất cả các lớp</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">STT</th>
                <th className="py-3.5 px-4">Học sinh</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Bài kiểm tra / Hoạt động</th>
                <th className="py-3.5 px-4 text-center">Điểm số</th>
                <th className="py-3.5 px-4">Ngày chấm</th>
                <th className="py-3.5 px-4">Lời phê / Ghi chú</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">Chưa có cột điểm nào</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thầy có thể bấm nút "+ Nhập điểm mới" để ghi nhận kết quả cho học sinh.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g, idx) => {
                  const student = data.students.find((s) => s.id === g.studentId);
                  const className = data.classes.find((c) => c.id === g.classId)?.name || 'Lớp';

                  return (
                    <tr key={g.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {student?.fullName.charAt(0) || 'H'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {student?.fullName || 'Học sinh chưa xác định'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {student?.studentCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
                          {className}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {g.activityTitle}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-black text-sm px-3 py-1 rounded-xl border ${
                            g.score >= 8.0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : g.score >= 6.5
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {g.score.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                        {g.date}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                        {g.note ? (
                          <span className="italic">"{g.note}"</span>
                        ) : (
                          <span className="text-slate-300">--</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(g)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Sửa điểm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteGrade(g.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa điểm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Grade Modal */}
      {isModalOpen && (
        <div
          id="grade-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base">
                {editingGrade ? 'Chỉnh sửa điểm số' : '+ Nhập điểm học sinh mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chọn lớp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => handleClassChangeInForm(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    {data.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chọn học sinh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    {data.students
                      .filter((s) => s.classId === classId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.studentCode})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên bài kiểm tra / hoạt động <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra 15 phút đọc hiểu, Bài viết văn số 1..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Điểm số (Thang điểm 10) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base font-extrabold text-blue-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày chấm điểm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời phê của thầy / Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Bài làm đủ ý, dẫn chứng phong phú, cần rèn thêm cách chuyển đoạn..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {editingGrade ? 'Lưu thay đổi' : 'Ghi nhận điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

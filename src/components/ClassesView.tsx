import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Eye, BookOpen, GraduationCap, X } from 'lucide-react';
import { ClassItem, AppData, Student } from '../types';

interface ClassesViewProps {
  data: AppData;
  onAddClass: (classItem: Omit<ClassItem, 'id'>) => void;
  onUpdateClass: (classItem: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  onViewClassStudents: (classId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  data,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onViewClassStudents,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(6);
  const [room, setRoom] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Drawer / modal to view students of a class
  const [previewClass, setPreviewClass] = useState<ClassItem | null>(null);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('');
    setGradeLevel(6);
    setRoom('');
    setAcademicYear('2025-2026');
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setName(c.name);
    setGradeLevel(c.gradeLevel);
    setRoom(c.room || '');
    setAcademicYear(c.academicYear || '2025-2026');
    setNote(c.note || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('Vui lòng nhập tên lớp (ví dụ: 6A1, 7A2)');
      return;
    }

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        name: cleanName,
        gradeLevel: Number(gradeLevel),
        room: room.trim() || undefined,
        academicYear: academicYear.trim() || '2025-2026',
        note: note.trim() || undefined,
      });
    } else {
      onAddClass({
        name: cleanName,
        gradeLevel: Number(gradeLevel),
        room: room.trim() || undefined,
        academicYear: academicYear.trim() || '2025-2026',
        note: note.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div id="classes-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Lớp học môn Ngữ văn</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Danh sách các lớp đang giảng dạy tại Trường THCS Phan Bội Châu
          </p>
        </div>
        <button
          id="add-class-btn"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all min-h-[44px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm lớp học</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      {data.classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có lớp học nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Thầy có thể thêm lớp mới hoặc khôi phục dữ liệu mẫu từ mục Sao lưu.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            + Thêm lớp ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.classes.map((c) => {
            const classStudents = data.students.filter((s) => s.classId === c.id);
            const classLessons = data.lessons.filter((l) => l.classId === c.id);
            const classTasks = data.tasks.filter((t) => t.classId === c.id);

            return (
              <div
                key={c.id}
                id={`class-card-${c.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Card Top Banner */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-blue-50/70 to-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                        Khối {c.gradeLevel}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">Lớp {c.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.room ? `Phòng: ${c.room}` : 'Chưa xếp phòng'} • Năm học {c.academicYear}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {c.name}
                    </div>
                  </div>
                </div>

                {/* Card Body Stats */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Sĩ số</span>
                      <strong className="text-base font-extrabold text-slate-800">
                        {classStudents.length}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Bài học</span>
                      <strong className="text-base font-extrabold text-indigo-700">
                        {classLessons.length}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Nhiệm vụ</span>
                      <strong className="text-base font-extrabold text-amber-700">
                        {classTasks.length}
                      </strong>
                    </div>
                  </div>

                  {c.note && (
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
                      "{c.note}"
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewClass(c)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-100 transition-colors min-h-[36px]"
                    title="Xem danh sách học sinh của lớp"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem học sinh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                    title="Sửa thông tin lớp"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteClass(c.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                    title="Xóa lớp học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="class-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base">
                {editingClass ? 'Chỉnh sửa thông tin lớp' : 'Thêm lớp học mới'}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: 6A1, 7A2, 8B..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phòng học</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Ví dụ: Phòng 204"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Năm học</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú đặc điểm lớp</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Lớp năng nổ phát biểu, học sinh thích đọc sách..."
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
                  {editingClass ? 'Lưu thay đổi' : 'Thêm lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Students of Class Modal */}
      {previewClass && (
        <div
          id="class-students-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewClass(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Danh sách học sinh lớp {previewClass.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {previewClass.room || 'Phòng học chưa ghi'} • Sĩ số:{' '}
                  {data.students.filter((s) => s.classId === previewClass.id).length} học sinh
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewClass(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                const students = data.students.filter((s) => s.classId === previewClass.id);
                if (students.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400">
                      <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">Lớp này hiện chưa có học sinh nào.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewClass(null);
                          onViewClassStudents(previewClass.id);
                        }}
                        className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Đi tới danh sách học sinh để thêm
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100">
                    {students.map((st, idx) => {
                      const grades = data.grades.filter((g) => g.studentId === st.id);
                      const avg =
                        grades.length > 0
                          ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)
                          : '--';

                      return (
                        <div key={st.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-xs text-slate-400 font-mono text-center">
                              {idx + 1}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                              {st.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{st.fullName}</p>
                              <p className="text-xs text-slate-400 font-mono">Mã: {st.studentCode}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              ĐTB: {avg}
                            </span>
                            {st.needAttention && (
                              <span className="block text-[10px] font-semibold text-rose-600 mt-0.5">
                                Cần lưu ý
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setPreviewClass(null);
                  onViewClassStudents(previewClass.id);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Quản lý chi tiết danh sách học sinh lớp {previewClass.name} →
              </button>
              <button
                type="button"
                onClick={() => setPreviewClass(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-lg text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

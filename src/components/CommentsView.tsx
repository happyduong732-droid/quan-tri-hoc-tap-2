import React, { useState, useMemo } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  Calendar,
  Tag,
  User,
  X
} from 'lucide-react';
import { StudentComment, AppData } from '../types';

interface CommentsViewProps {
  data: AppData;
  initialClassFilter?: string;
  onAddComment: (comment: Omit<StudentComment, 'id'>) => void;
  onUpdateComment: (comment: StudentComment) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CommentsView: React.FC<CommentsViewProps> = ({
  data,
  initialClassFilter = 'ALL',
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter);
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<StudentComment | null>(null);

  // Form states
  const [classId, setClassId] = useState(data.classes[0]?.id || '');
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [skillCategory, setSkillCategory] = useState<
    'Đọc hiểu' | 'Viết bài' | 'Nói & Nghe' | 'Thái độ & Chuyên cần' | 'Khác'
  >('Đọc hiểu');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Filtering
  const filteredComments = useMemo(() => {
    return data.comments.filter((cm) => {
      if (selectedClassId !== 'ALL' && cm.classId !== selectedClassId) return false;
      if (selectedSkill !== 'ALL' && cm.skillCategory !== selectedSkill) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const student = data.students.find((s) => s.id === cm.studentId);
        const matchesStudent = student ? student.fullName.toLowerCase().includes(q) : false;
        const matchesContent = cm.content.toLowerCase().includes(q);
        const matchesNote = cm.note ? cm.note.toLowerCase().includes(q) : false;
        if (!matchesStudent && !matchesContent && !matchesNote) return false;
      }
      return true;
    });
  }, [data.comments, data.students, selectedClassId, selectedSkill, search]);

  const handleOpenAdd = () => {
    setEditingComment(null);
    const targetClass = selectedClassId !== 'ALL' ? selectedClassId : (data.classes[0]?.id || '');
    setClassId(targetClass);
    const studentsInClass = data.students.filter((s) => s.classId === targetClass);
    setStudentId(studentsInClass[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setSkillCategory('Đọc hiểu');
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cm: StudentComment) => {
    setEditingComment(cm);
    setClassId(cm.classId);
    setStudentId(cm.studentId);
    setDate(cm.date);
    setContent(cm.content);
    setSkillCategory(cm.skillCategory);
    setNote(cm.note || '');
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
    if (!content.trim()) {
      setFormError('Vui lòng nhập nội dung nhận xét');
      return;
    }

    if (editingComment) {
      onUpdateComment({
        ...editingComment,
        classId,
        studentId,
        date,
        content: content.trim(),
        skillCategory,
        note: note.trim() || undefined,
      });
    } else {
      onAddComment({
        classId,
        studentId,
        date,
        content: content.trim(),
        skillCategory,
        note: note.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div id="comments-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ghi chú & Nhận xét Học sinh</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Đánh giá thường xuyên quá trình phát triển các kỹ năng Ngữ văn của học sinh THCS
          </p>
        </div>
        <button
          id="add-comment-btn"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all min-h-[44px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm nhận xét mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, nội dung nhận xét..."
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">Tất cả các lớp</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">Tất cả kỹ năng</option>
            <option value="Đọc hiểu">Đọc hiểu</option>
            <option value="Viết bài">Viết bài</option>
            <option value="Nói & Nghe">Nói & Nghe</option>
            <option value="Thái độ & Chuyên cần">Thái độ & Chuyên cần</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có nhận xét nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            Thầy hãy bấm "+ Thêm nhận xét mới" để ghi lại sự tiến bộ của học sinh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComments.map((cm) => {
            const student = data.students.find((s) => s.id === cm.studentId);
            const className = data.classes.find((c) => c.id === cm.classId)?.name || 'Lớp';

            return (
              <div
                key={cm.id}
                id={`comment-card-${cm.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                        {student?.fullName.charAt(0) || 'H'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          {student?.fullName || 'Học sinh'}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Mã: {student?.studentCode} • Lớp{' '}
                          <strong className="text-slate-700">{className}</strong>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-100 shrink-0">
                      {cm.skillCategory}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 mt-4 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    "{cm.content}"
                  </p>

                  {cm.note && (
                    <p className="text-xs text-slate-500 mt-2 italic px-1">
                      Kế hoạch hỗ trợ: {cm.note}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {cm.date}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cm)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Sửa nhận xét"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteComment(cm.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa nhận xét"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Comment Modal */}
      {isModalOpen && (
        <div
          id="comment-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base">
                {editingComment ? 'Chỉnh sửa nhận xét' : '+ Thêm nhận xét học sinh mới'}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chủ đề / Kỹ năng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={skillCategory}
                    onChange={(e) =>
                      setSkillCategory(
                        e.target.value as
                          | 'Đọc hiểu'
                          | 'Viết bài'
                          | 'Nói & Nghe'
                          | 'Thái độ & Chuyên cần'
                          | 'Khác'
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Đọc hiểu">Đọc hiểu</option>
                    <option value="Viết bài">Viết bài</option>
                    <option value="Nói & Nghe">Nói & Nghe</option>
                    <option value="Thái độ & Chuyên cần">Thái độ & Chuyên cần</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày nhận xét <span className="text-rose-500">*</span>
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
                  Nội dung nhận xét <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Đọc diễn cảm tự tin, vốn từ phong phú, cần rèn luyện thêm chính tả..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kế hoạch hướng dẫn / Ghi chú thêm
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đã nhắc nhở ngồi bàn đầu, giao thêm 1 bài đọc ngắn..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
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
                  {editingComment ? 'Lưu thay đổi' : 'Lưu nhận xét'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

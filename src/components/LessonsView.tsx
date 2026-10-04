import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  CircleDashed,
  X,
  Target
} from 'lucide-react';
import { Lesson, LessonStatus, AppData } from '../types';

interface LessonsViewProps {
  data: AppData;
  initialClassFilter?: string;
  initialSearchQuery?: string;
  onAddLesson: (lesson: Omit<Lesson, 'id'>) => void;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  data,
  initialClassFilter = 'ALL',
  initialSearchQuery = '',
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter);
  const [statusFilter, setStatusFilter] = useState<'ALL' | LessonStatus>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [topic, setTopic] = useState('');
  const [objectives, setObjectives] = useState('');
  const [summary, setSummary] = useState('');
  const [teachDate, setTeachDate] = useState('');
  const [status, setStatus] = useState<LessonStatus>('Chưa dạy');
  const [formError, setFormError] = useState('');

  // Filtering
  const filteredLessons = useMemo(() => {
    return data.lessons.filter((l) => {
      if (selectedClassId !== 'ALL' && l.classId !== selectedClassId) return false;
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesTopic = l.topic.toLowerCase().includes(q);
        const matchesSummary = l.summary.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesSummary) return false;
      }
      return true;
    });
  }, [data.lessons, selectedClassId, statusFilter, search]);

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setTitle('');
    setClassId(data.classes[0]?.id || '');
    setTopic('');
    setObjectives('');
    setSummary('');
    const today = new Date().toISOString().split('T')[0];
    setTeachDate(today);
    setStatus('Đang dạy');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: Lesson) => {
    setEditingLesson(l);
    setTitle(l.title);
    setClassId(l.classId);
    setTopic(l.topic);
    setObjectives(l.objectives);
    setSummary(l.summary);
    setTeachDate(l.teachDate);
    setStatus(l.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên bài học');
      return;
    }
    if (!classId) {
      setFormError('Vui lòng chọn lớp học');
      return;
    }
    if (!teachDate) {
      setFormError('Vui lòng chọn ngày dạy dự kiến');
      return;
    }

    if (editingLesson) {
      onUpdateLesson({
        ...editingLesson,
        title: title.trim(),
        classId,
        topic: topic.trim() || 'Chủ đề Ngữ văn',
        objectives: objectives.trim() || 'Mục tiêu phát triển phẩm chất và năng lực',
        summary: summary.trim() || 'Nội dung cốt lõi của bài học',
        teachDate,
        status,
      });
    } else {
      onAddLesson({
        title: title.trim(),
        classId,
        topic: topic.trim() || 'Chủ đề Ngữ văn',
        objectives: objectives.trim() || 'Mục tiêu phát triển phẩm chất và năng lực',
        summary: summary.trim() || 'Nội dung cốt lõi của bài học',
        teachDate,
        status,
      });
    }

    setIsModalOpen(false);
  };

  // Quick toggle status helper
  const handleQuickStatus = (lesson: Lesson, nextStatus: LessonStatus) => {
    onUpdateLesson({ ...lesson, status: nextStatus });
  };

  return (
    <div id="lessons-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Bài học & Chủ đề Ngữ văn</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kế hoạch bài dạy, nội dung tóm tắt và mục tiêu học tập THCS
          </p>
        </div>
        <button
          id="add-lesson-btn"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all min-h-[44px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm bài học mới</span>
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
            placeholder="Tìm theo tên bài học, chủ đề, nội dung tóm tắt..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | LessonStatus)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Chưa dạy">Chưa dạy</option>
            <option value="Đang dạy">Đang dạy</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Lessons Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy bài học nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            Thầy có thể tạo bài giảng mới hoặc điều chỉnh lại bộ lọc tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => {
            const className = data.classes.find((c) => c.id === lesson.classId)?.name || 'Chưa gán';
            const relatedTasks = data.tasks.filter((t) => t.lessonId === lesson.id);

            return (
              <div
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Top Info Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      Lớp {className}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        lesson.status === 'Đã hoàn thành'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lesson.status === 'Đang dạy'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {lesson.status === 'Đã hoàn thành' && <CheckCircle className="w-3.5 h-3.5" />}
                      {lesson.status === 'Đang dạy' && <Clock className="w-3.5 h-3.5" />}
                      {lesson.status === 'Chưa dạy' && <CircleDashed className="w-3.5 h-3.5" />}
                      <span>{lesson.status}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {lesson.title}
                  </h3>

                  <p className="text-xs font-medium text-indigo-700 mt-1">
                    {lesson.topic}
                  </p>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3.5 flex-1 text-xs">
                  {lesson.objectives && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                        <span>Mục tiêu học tập:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5 line-clamp-3">
                        {lesson.objectives}
                      </p>
                    </div>
                  )}

                  {lesson.summary && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed line-clamp-3">
                      <strong className="text-slate-700 font-semibold block mb-0.5">Tóm tắt nội dung:</strong>
                      {lesson.summary}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Ngày dạy: <strong className="text-slate-700">{lesson.teachDate}</strong>
                    </span>

                    <span className="text-[11px] font-semibold text-slate-600">
                      {relatedTasks.length} nhiệm vụ liên kết
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Quick status switch buttons */}
                  <div className="flex items-center gap-1">
                    {lesson.status !== 'Đang dạy' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(lesson, 'Đang dạy')}
                        className="px-2 py-1 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="Chuyển sang Đang dạy"
                      >
                        Đang dạy
                      </button>
                    )}
                    {lesson.status !== 'Đã hoàn thành' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(lesson, 'Đã hoàn thành')}
                        className="px-2 py-1 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Chuyển sang Đã hoàn thành"
                      >
                        Hoàn thành
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lesson)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Sửa bài học"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteLesson(lesson.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Xóa bài học"
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

      {/* Add / Edit Lesson Modal */}
      {isModalOpen && (
        <div
          id="lesson-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base">
                {editingLesson ? 'Chỉnh sửa bài học' : '+ Tạo bài học Ngữ văn mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên bài học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thực hành Tiếng Việt: Nghĩa của từ ngữ..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp áp dụng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
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
                    Trạng thái tiến độ
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LessonStatus)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Chưa dạy">Chưa dạy</option>
                    <option value="Đang dạy">Đang dạy</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chủ đề / Bài học lớn
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ví dụ: Chủ đề: Yêu thương và chia sẻ"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày dạy dự kiến <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={teachDate}
                    onChange={(e) => setTeachDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mục tiêu học tập
                </label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Giúp học sinh nhận biết từ đa nghĩa, vận dụng phân tích biện pháp tu từ so sánh..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung tóm tắt
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Hướng dẫn tìm ví dụ cụ thể, làm bài tập thực hành theo nhóm..."
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
                  {editingLesson ? 'Lưu thay đổi' : 'Tạo bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, User, BookOpen, CheckSquare, Users, ArrowRight, X } from 'lucide-react';
import { AppData, NavTab } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onNavigate: (tab: NavTab, filterText?: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  data,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const cleanTerm = searchTerm.trim().toLowerCase();

  const results = useMemo(() => {
    if (!cleanTerm) return { students: [], classes: [], lessons: [], tasks: [] };

    const students = data.students
      .filter(
        (s) =>
          s.fullName.toLowerCase().includes(cleanTerm) ||
          s.studentCode.toLowerCase().includes(cleanTerm) ||
          (s.note && s.note.toLowerCase().includes(cleanTerm))
      )
      .slice(0, 5);

    const classes = data.classes
      .filter(
        (c) =>
          c.name.toLowerCase().includes(cleanTerm) ||
          (c.note && c.note.toLowerCase().includes(cleanTerm)) ||
          (c.room && c.room.toLowerCase().includes(cleanTerm))
      )
      .slice(0, 4);

    const lessons = data.lessons
      .filter(
        (l) =>
          l.title.toLowerCase().includes(cleanTerm) ||
          l.topic.toLowerCase().includes(cleanTerm) ||
          l.summary.toLowerCase().includes(cleanTerm)
      )
      .slice(0, 5);

    const tasks = data.tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(cleanTerm) ||
          t.description.toLowerCase().includes(cleanTerm)
      )
      .slice(0, 5);

    return { students, classes, lessons, tasks };
  }, [cleanTerm, data]);

  if (!isOpen) return null;

  const totalResults =
    results.students.length +
    results.classes.length +
    results.lessons.length +
    results.tasks.length;

  return (
    <div
      id="quick-search-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="quick-search-container"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm nhanh học sinh, lớp học, bài học, nhiệm vụ..."
            className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 text-base focus:outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-200/70 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!cleanTerm ? (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Nhập từ khóa để tra cứu tức thời</p>
              <p className="text-xs text-slate-400 mt-1">
                Ví dụ: "Mai Anh", "6A1", "So sánh", "Nghị luận", "HS0601"...
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-semibold">Không tìm thấy kết quả phù hợp cho "{searchTerm}"</p>
              <p className="text-xs text-slate-400 mt-1">Thầy vui lòng kiểm tra lại từ khóa tìm kiếm</p>
            </div>
          ) : (
            <>
              {/* Students Results */}
              {results.students.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Học sinh ({results.students.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.students.map((student) => {
                      const className = data.classes.find((c) => c.id === student.classId)?.name || 'Lớp';
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            onNavigate('students', student.fullName);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{student.fullName}</p>
                              <p className="text-xs text-slate-500">
                                Mã: <span className="font-mono">{student.studentCode}</span> • Lớp: <span className="font-semibold text-blue-600">{className}</span>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Classes Results */}
              {results.classes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lớp học ({results.classes.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.classes.map((cls) => {
                      const studentCount = data.students.filter((s) => s.classId === cls.id).length;
                      return (
                        <div
                          key={cls.id}
                          onClick={() => {
                            onNavigate('classes', cls.name);
                            onClose();
                          }}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer transition-all"
                        >
                          <div>
                            <span className="font-bold text-base text-slate-900">Lớp {cls.name}</span>
                            <p className="text-xs text-slate-500">{cls.room || 'Khối ' + cls.gradeLevel} • {studentCount} học sinh</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lessons Results */}
              {results.lessons.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bài học Ngữ văn ({results.lessons.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.lessons.map((lesson) => {
                      const clsName = data.classes.find((c) => c.id === lesson.classId)?.name || 'Chung';
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            onNavigate('lessons', lesson.title);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 border border-transparent hover:border-indigo-200 cursor-pointer transition-all"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-sm font-semibold text-slate-800 truncate">{lesson.title}</p>
                            <p className="text-xs text-slate-500 truncate">
                              Lớp {clsName} • {lesson.topic} • Trạng thái: <span className="font-medium">{lesson.status}</span>
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nhiệm vụ học tập ({results.tasks.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.tasks.map((task) => {
                      const clsName = data.classes.find((c) => c.id === task.classId)?.name || 'Chung';
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            onNavigate('tasks', task.title);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200 cursor-pointer transition-all"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                            <p className="text-xs text-slate-500 truncate">
                              Lớp {clsName} • Hạn nộp: {task.dueDate} • Trạng thái: {task.status}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

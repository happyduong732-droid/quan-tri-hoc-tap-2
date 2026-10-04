import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  GraduationCap,
  Filter,
  CheckCircle2,
  X,
  FileText,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Student, AppData, ClassItem } from '../types';
import { ExcelImportModal } from './ExcelImportModal';

interface StudentsViewProps {
  data: AppData;
  initialClassFilter?: string;
  initialSearchQuery?: string;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onAddStudentsBatch?: (students: Omit<Student, 'id'>[]) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToComment?: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  data,
  initialClassFilter = 'ALL',
  initialSearchQuery = '',
  onAddStudent,
  onAddStudentsBatch,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [classId, setClassId] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [status, setStatus] = useState<'Đang học' | 'Nghỉ học' | 'Chuyển lớp'>('Đang học');
  const [note, setNote] = useState('');
  const [needAttention, setNeedAttention] = useState(false);
  const [formError, setFormError] = useState('');

  // Student Detail Drawer / Modal
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Filtering
  const filteredStudents = useMemo(() => {
    return data.students.filter((st) => {
      if (selectedClassId !== 'ALL' && st.classId !== selectedClassId) return false;
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesName = st.fullName.toLowerCase().includes(query);
        const matchesCode = st.studentCode.toLowerCase().includes(query);
        const matchesNote = st.note ? st.note.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesCode && !matchesNote) return false;
      }
      return true;
    });
  }, [data.students, selectedClassId, search]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFullName('');
    setClassId(data.classes[0]?.id || '');
    // Auto suggest student code e.g. HS06 + (totalStudents + 1)
    const nextNum = String(data.students.length + 1).padStart(2, '0');
    setStudentCode(`HS06${nextNum}`);
    setGender('Nam');
    setStatus('Đang học');
    setNote('');
    setNeedAttention(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFullName(st.fullName);
    setClassId(st.classId);
    setStudentCode(st.studentCode);
    setGender(st.gender);
    setStatus(st.status);
    setNote(st.note || '');
    setNeedAttention(!!st.needAttention);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Vui lòng nhập Họ và tên học sinh');
      return;
    }
    if (!classId) {
      setFormError('Vui lòng chọn lớp học');
      return;
    }
    if (!studentCode.trim()) {
      setFormError('Vui lòng nhập Mã học sinh (ví dụ: HS0601)');
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        fullName: fullName.trim(),
        classId,
        studentCode: studentCode.trim().toUpperCase(),
        gender,
        status,
        note: note.trim() || undefined,
        needAttention,
      });
    } else {
      onAddStudent({
        fullName: fullName.trim(),
        classId,
        studentCode: studentCode.trim().toUpperCase(),
        gender,
        status,
        note: note.trim() || undefined,
        needAttention,
      });
    }

    setIsModalOpen(false);
  };

  const handleImportStudentsFromExcel = (newStudents: Omit<Student, 'id'>[]) => {
    if (onAddStudentsBatch) {
      onAddStudentsBatch(newStudents);
    } else {
      newStudents.forEach((st) => onAddStudent(st));
    }
  };

  const handleExportExcel = () => {
    if (data.students.length === 0) {
      alert('Chưa có dữ liệu học sinh để xuất file Excel.');
      return;
    }

    const studentsToExport = filteredStudents;
    const exportData = studentsToExport.map((st, idx) => {
      const className = data.classes.find((c) => c.id === st.classId)?.name || 'Chưa gán';
      const studentGrades = data.grades.filter((g) => g.studentId === st.id);
      const avgScore =
        studentGrades.length > 0
          ? (
              studentGrades.reduce((sum, g) => sum + g.score, 0) /
              studentGrades.length
            ).toFixed(1)
          : 'Chưa có';
      const assignedTasks = data.tasks.filter((t) => t.classId === st.classId);
      const completedTasks = assignedTasks.filter((t) =>
        t.completedStudentIds.includes(st.id)
      );

      return {
        'STT': idx + 1,
        'Họ và tên': st.fullName,
        'Mã học sinh': st.studentCode,
        'Lớp': className,
        'Giới tính': st.gender,
        'Điểm TB Ngữ văn': avgScore,
        'Nhiệm vụ hoàn thành': `${completedTasks.length}/${assignedTasks.length}`,
        'Trạng thái': st.status,
        'Cần chú ý': st.needAttention ? 'Có' : 'Không',
        'Ghi chú': st.note || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 14 },
      { wch: 10 },
      { wch: 12 },
      { wch: 18 },
      { wch: 22 },
      { wch: 14 },
      { wch: 14 },
      { wch: 36 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
    const classSuffix =
      selectedClassId !== 'ALL'
        ? `_Lop_${data.classes.find((c) => c.id === selectedClassId)?.name || ''}`
        : '_TatCaLop';
    XLSX.writeFile(workbook, `Danh_sach_hoc_sinh_Ngu_van${classSuffix}.xlsx`);
  };

  return (
    <div id="students-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Học sinh</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng số: <strong className="text-blue-700">{data.students.length}</strong> học sinh đang theo học môn Ngữ văn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            id="export-students-excel-btn"
            type="button"
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-all min-h-[42px] active:scale-95"
            title="Xuất danh sách học sinh ra file Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          {/* Import from Excel */}
          <button
            id="import-students-excel-btn"
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all min-h-[42px] active:scale-95"
            title="Nhập danh sách học sinh hàng loạt từ file Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập từ Excel</span>
          </button>

          {/* Manual Add Student */}
          <button
            id="add-student-btn"
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all min-h-[42px] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã HS, ghi chú..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
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

        {/* Filter by class */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="filter-student-class"
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

      {/* Main Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">STT</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Mã học sinh</th>
                <th className="py-3.5 px-4 text-center">Điểm TB</th>
                <th className="py-3.5 px-4 text-center">Nhiệm vụ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">Không tìm thấy học sinh nào</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thầy hãy thử đổi bộ lọc hoặc thêm học sinh mới.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const className = data.classes.find((c) => c.id === st.classId)?.name || 'Chưa gán';

                  // Calculate Student Average Score
                  const studentGrades = data.grades.filter((g) => g.studentId === st.id);
                  const avgScore =
                    studentGrades.length > 0
                      ? (
                          studentGrades.reduce((sum, g) => sum + g.score, 0) /
                          studentGrades.length
                        ).toFixed(1)
                      : null;

                  // Calculate tasks completed
                  const assignedTasks = data.tasks.filter((t) => t.classId === st.classId);
                  const completedTasks = assignedTasks.filter((t) =>
                    t.completedStudentIds.includes(st.id)
                  );
                  const taskRatio = `${completedTasks.length}/${assignedTasks.length}`;

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {st.fullName.charAt(0)}
                          </div>
                          <div>
                            <span
                              onClick={() => setDetailStudent(st)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors block"
                            >
                              {st.fullName}
                            </span>
                            {st.note && (
                              <span className="text-xs text-slate-400 truncate max-w-xs block">
                                {st.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
                          {className}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">
                        {st.studentCode}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {avgScore !== null ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold ${
                              Number(avgScore) >= 8.0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : Number(avgScore) >= 6.5
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {avgScore}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Chưa có</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {taskRatio}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              st.status === 'Đang học'
                                ? 'bg-emerald-500'
                                : st.status === 'Nghỉ học'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span className="text-xs font-medium text-slate-700">{st.status}</span>
                          {st.needAttention && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-rose-100 text-rose-700 ml-1">
                              Lưu ý
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailStudent(st)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem hồ sơ học sinh"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(st)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteStudent(st.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa học sinh"
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div
          id="student-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? 'Chỉnh sửa thông tin học sinh' : '+ Thêm học sinh mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Switch Tab between Manual and Excel when adding */}
            {!editingStudent && (
              <div className="px-6 pt-4 pb-0">
                <div className="flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white text-blue-700 shadow-2xs transition-all"
                  >
                    Nhập từng học sinh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsExcelModalOpen(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-white/60 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nhập từ file Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingStudent && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Có sẵn file Excel danh sách học sinh?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsExcelModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    Tải file Excel lên ngay →
                  </button>
                </div>
              )}

              {formError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp <span className="text-rose-500">*</span>
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
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Ví dụ: HS0601"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Đang học' | 'Nghỉ học' | 'Chuyển lớp')}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                    <option value="Chuyển lớp">Chuyển lớp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú của giáo viên</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Chăm chú phát biểu, chữ viết đẹp, cần rèn chính tả..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  id="attention-checkbox"
                  checked={needAttention}
                  onChange={(e) => setNeedAttention(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
                />
                <label htmlFor="attention-checkbox" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Đánh dấu "Cần chú ý" để tiện theo dõi trên bảng tổng quan
                </label>
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
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Detail Modal */}
      {detailStudent && (
        <div
          id="student-detail-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDetailStudent(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs text-white font-black text-2xl flex items-center justify-center shadow-inner">
                  {detailStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">{detailStudent.fullName}</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Mã: {detailStudent.studentCode} • Lớp{' '}
                    {data.classes.find((c) => c.id === detailStudent.classId)?.name || ''} • Giới tính:{' '}
                    {detailStudent.gender}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Note */}
              {detailStudent.note && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <span className="text-xs font-bold text-blue-900 block mb-1">Ghi chú của thầy:</span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{detailStudent.note}"</p>
                </div>
              )}

              {/* Grades history */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Lịch sử Điểm số môn Ngữ văn
                </h4>
                {(() => {
                  const grades = data.grades.filter((g) => g.studentId === detailStudent.id);
                  if (grades.length === 0) {
                    return <p className="text-xs text-slate-400 italic">Chưa có cột điểm nào.</p>;
                  }
                  return (
                    <div className="space-y-2">
                      {grades.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50"
                        >
                          <div>
                            <p className="font-semibold text-xs text-slate-800">{g.activityTitle}</p>
                            <span className="text-[11px] text-slate-400">{g.date}</span>
                            {g.note && <p className="text-xs text-slate-600 mt-0.5 italic">{g.note}</p>}
                          </div>
                          <span className="text-base font-extrabold text-blue-700 px-3 py-1 bg-white rounded-lg border border-slate-200">
                            {g.score.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Comments history */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Nhận xét & Đánh giá rèn luyện
                </h4>
                {(() => {
                  const comments = data.comments.filter((c) => c.studentId === detailStudent.id);
                  if (comments.length === 0) {
                    return <p className="text-xs text-slate-400 italic">Chưa có nhận xét nào.</p>;
                  }
                  return (
                    <div className="space-y-2">
                      {comments.map((cm) => (
                        <div
                          key={cm.id}
                          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {cm.skillCategory}
                            </span>
                            <span className="text-slate-400">{cm.date}</span>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed">{cm.content}</p>
                          {cm.note && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">Ghi chú: {cm.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        classes={data.classes}
        existingStudents={data.students}
        defaultClassId={selectedClassId !== 'ALL' ? selectedClassId : undefined}
        onImportStudents={handleImportStudentsFromExcel}
      />
    </div>
  );
};

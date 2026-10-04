import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Info,
  Check,
  Filter
} from 'lucide-react';
import { Student, ClassItem } from '../types';

interface ParsedStudentRow {
  key: string;
  fullName: string;
  studentCode: string;
  classId: string;
  className: string;
  gender: 'Nam' | 'Nữ';
  status: 'Đang học' | 'Nghỉ học' | 'Chuyển lớp';
  note: string;
  needAttention: boolean;
  isValid: boolean;
  errorReason?: string;
  isDuplicateCode: boolean;
  selected: boolean;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  existingStudents: Student[];
  onImportStudents: (students: Omit<Student, 'id'>[]) => void;
  defaultClassId?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  existingStudents,
  onImportStudents,
  defaultClassId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetClassMode, setTargetClassMode] = useState<'auto' | string>(
    defaultClassId && defaultClassId !== 'ALL' ? defaultClassId : 'auto'
  );
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to normalize strings for header matching
  const normalizeHeader = (str: string): string => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Generate and download a sample Excel template
  const handleDownloadTemplate = () => {
    const defaultClassName = classes[0]?.name || '6A1';
    const sampleData = [
      {
        'STT': 1,
        'Họ và tên': 'Nguyễn Văn An',
        'Mã học sinh': 'HS0601',
        'Lớp': defaultClassName,
        'Giới tính': 'Nam',
        'Trạng thái': 'Đang học',
        'Ghi chú': 'Học sinh chăm ngoan, phát biểu tốt',
        'Cần chú ý': 'Không'
      },
      {
        'STT': 2,
        'Họ và tên': 'Trần Thị Mai',
        'Mã học sinh': 'HS0602',
        'Lớp': defaultClassName,
        'Giới tính': 'Nữ',
        'Trạng thái': 'Đang học',
        'Ghi chú': 'Chữ viết đẹp, cần rèn thêm văn miêu tả',
        'Cần chú ý': 'Có'
      },
      {
        'STT': 3,
        'Họ và tên': 'Lê Hoàng Nam',
        'Mã học sinh': 'HS0603',
        'Lớp': classes[1]?.name || defaultClassName,
        'Giới tính': 'Nam',
        'Trạng thái': 'Đang học',
        'Ghi chú': 'Đọc diễn cảm tốt',
        'Cần chú ý': 'Không'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 24 }, // Họ và tên
      { wch: 14 }, // Mã học sinh
      { wch: 10 }, // Lớp
      { wch: 12 }, // Giới tính
      { wch: 14 }, // Trạng thái
      { wch: 36 }, // Ghi chú
      { wch: 14 }, // Cần chú ý
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
    XLSX.writeFile(workbook, 'Mau_nhap_hoc_sinh_THCS_Phan_Boi_Chau.xlsx');
  };

  // Process uploaded file
  const processExcelFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    setParseError(null);
    setFile(uploadedFile);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('File Excel không có trang tính (sheet) nào.');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (rawData.length === 0) {
        throw new Error('Tệp tải lên không chứa dữ liệu.');
      }

      // Find the header row
      let headerRowIndex = -1;
      let colNameIdx = -1;
      let colLastNameIdx = -1; // "Họ và tên đệm"
      let colFirstNameIdx = -1; // "Tên"
      let colCodeIdx = -1;
      let colClassIdx = -1;
      let colGenderIdx = -1;
      let colStatusIdx = -1;
      let colNoteIdx = -1;
      let colAttentionIdx = -1;

      for (let r = 0; r < Math.min(15, rawData.length); r++) {
        const row = rawData[r];
        if (!Array.isArray(row)) continue;

        let foundName = false;
        let foundCodeOrClass = false;

        row.forEach((cellVal, colIdx) => {
          const norm = normalizeHeader(String(cellVal));
          if (!norm) return;

          if (
            norm === 'hovaten' ||
            norm === 'hoten' ||
            norm === 'tenhocsinh' ||
            norm === 'fullname' ||
            norm === 'name' ||
            norm === 'hocsinh'
          ) {
            colNameIdx = colIdx;
            foundName = true;
          } else if (
            norm === 'hodem' ||
            norm === 'hovadem' ||
            norm === 'holot' ||
            norm === 'hovachulot' ||
            norm === 'lastname'
          ) {
            colLastNameIdx = colIdx;
          } else if (norm === 'ten' || norm === 'firstname') {
            colFirstNameIdx = colIdx;
          }

          if (
            norm === 'mahocsinh' ||
            norm === 'mahs' ||
            norm === 'masv' ||
            norm === 'sobaodanh' ||
            norm === 'sbd' ||
            norm === 'studentcode' ||
            norm === 'code' ||
            norm === 'maso'
          ) {
            colCodeIdx = colIdx;
            foundCodeOrClass = true;
          }

          if (
            norm === 'lop' ||
            norm === 'lophoc' ||
            norm === 'class' ||
            norm === 'tenlop' ||
            norm === 'khoilop'
          ) {
            colClassIdx = colIdx;
            foundCodeOrClass = true;
          }

          if (norm === 'gioitinh' || norm === 'phai' || norm === 'gender' || norm === 'sex') {
            colGenderIdx = colIdx;
          }

          if (norm === 'trangthai' || norm === 'tinhtrang' || norm === 'status') {
            colStatusIdx = colIdx;
          }

          if (norm === 'ghichu' || norm === 'note' || norm === 'nhanxet' || norm === 'luuy') {
            colNoteIdx = colIdx;
          }

          if (
            norm === 'canchuy' ||
            norm === 'chuy' ||
            norm === 'canquantam' ||
            norm === 'attention' ||
            norm === 'luuy'
          ) {
            colAttentionIdx = colIdx;
          }
        });

        if (foundName || (colLastNameIdx !== -1 && colFirstNameIdx !== -1) || foundCodeOrClass) {
          headerRowIndex = r;
          break;
        }
      }

      if (headerRowIndex === -1 && rawData.length > 0) {
        // Fallback: assume first row is header
        headerRowIndex = 0;
      }

      // Existing codes lookup
      const existingCodes = new Set(existingStudents.map((s) => s.studentCode.toUpperCase()));
      const seenFileCodes = new Set<string>();

      const parsed: ParsedStudentRow[] = [];
      let autoSeqNumber = existingStudents.length + 1;

      for (let r = headerRowIndex + 1; r < rawData.length; r++) {
        const row = rawData[r];
        if (!Array.isArray(row) || row.every((c) => String(c).trim() === '')) {
          continue; // Skip empty rows
        }

        // 1. Resolve Full Name
        let fullName = '';
        if (colNameIdx !== -1 && row[colNameIdx]) {
          fullName = String(row[colNameIdx]).trim();
        } else if (colLastNameIdx !== -1 || colFirstNameIdx !== -1) {
          const lastName = colLastNameIdx !== -1 ? String(row[colLastNameIdx] || '').trim() : '';
          const firstName = colFirstNameIdx !== -1 ? String(row[colFirstNameIdx] || '').trim() : '';
          fullName = `${lastName} ${firstName}`.trim();
        } else {
          // If neither found, inspect row cells
          const textCells = row.map((c) => String(c).trim()).filter((c) => c && isNaN(Number(c)));
          if (textCells.length > 0) {
            fullName = textCells[0];
          }
        }

        // Clean up full name
        fullName = fullName.replace(/\s+/g, ' ');

        // 2. Resolve Class
        let targetClass: ClassItem | undefined;
        let classValue = colClassIdx !== -1 ? String(row[colClassIdx] || '').trim() : '';

        if (targetClassMode !== 'auto') {
          // Explicit override
          targetClass = classes.find((c) => c.id === targetClassMode);
        } else if (classValue) {
          const normClass = classValue.toLowerCase().replace(/^(lớp|lop)\s*/i, '').trim();
          targetClass = classes.find((c) => {
            const cNorm = c.name.toLowerCase().replace(/^(lớp|lop)\s*/i, '').trim();
            return cNorm === normClass || c.name.toLowerCase() === classValue.toLowerCase();
          });
        }

        if (!targetClass) {
          // Fallback to default class or first class
          targetClass = classes.find((c) => c.id === defaultClassId) || classes[0];
        }

        // 3. Resolve Student Code
        let studentCode = colCodeIdx !== -1 ? String(row[colCodeIdx] || '').trim() : '';
        if (!studentCode) {
          // Auto generate student code
          const prefix = targetClass ? `HS${String(targetClass.gradeLevel).padStart(2, '0')}` : 'HS06';
          studentCode = `${prefix}${String(autoSeqNumber).padStart(2, '0')}`;
          autoSeqNumber++;
        }
        studentCode = studentCode.toUpperCase().replace(/\s+/g, '');

        // Check duplicate
        const isDuplicateCode = existingCodes.has(studentCode) || seenFileCodes.has(studentCode);
        seenFileCodes.add(studentCode);

        // 4. Resolve Gender
        let gender: 'Nam' | 'Nữ' = 'Nam';
        if (colGenderIdx !== -1) {
          const rawGender = String(row[colGenderIdx] || '').toLowerCase().trim();
          if (rawGender === 'nữ' || rawGender === 'nu' || rawGender === 'f' || rawGender === 'female') {
            gender = 'Nữ';
          }
        }

        // 5. Resolve Status
        let status: 'Đang học' | 'Nghỉ học' | 'Chuyển lớp' = 'Đang học';
        if (colStatusIdx !== -1) {
          const rawStatus = String(row[colStatusIdx] || '').toLowerCase().trim();
          if (rawStatus.includes('nghỉ') || rawStatus.includes('nghi')) {
            status = 'Nghỉ học';
          } else if (rawStatus.includes('chuyển') || rawStatus.includes('chuyen')) {
            status = 'Chuyển lớp';
          }
        }

        // 6. Resolve Note
        const note = colNoteIdx !== -1 ? String(row[colNoteIdx] || '').trim() : '';

        // 7. Resolve Need Attention
        let needAttention = false;
        if (colAttentionIdx !== -1) {
          const rawAttn = String(row[colAttentionIdx] || '').toLowerCase().trim();
          needAttention =
            rawAttn === 'có' ||
            rawAttn === 'co' ||
            rawAttn === 'x' ||
            rawAttn === '1' ||
            rawAttn === 'true' ||
            rawAttn.includes('chú ý') ||
            rawAttn.includes('quan tâm');
        }

        // Validation
        let isValid = true;
        let errorReason = '';

        if (!fullName || fullName.length < 2) {
          isValid = false;
          errorReason = 'Thiếu họ và tên học sinh';
        } else if (!targetClass) {
          isValid = false;
          errorReason = 'Chưa xác định được lớp học';
        }

        parsed.push({
          key: `row_${r}_${Date.now()}`,
          fullName,
          studentCode,
          classId: targetClass ? targetClass.id : classes[0]?.id || '',
          className: targetClass ? targetClass.name : 'Chưa rõ',
          gender,
          status,
          note,
          needAttention,
          isValid,
          errorReason,
          isDuplicateCode,
          selected: isValid,
        });
      }

      if (parsed.length === 0) {
        throw new Error('Không đọc được dòng dữ liệu học sinh nào từ tệp đã chọn.');
      }

      setParsedRows(parsed);
    } catch (err: any) {
      console.error('Error parsing excel:', err);
      setParseError(err.message || 'Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  // Toggle selection
  const handleToggleSelectAll = (select: boolean) => {
    setParsedRows((prev) =>
      prev.map((row) => (row.isValid ? { ...row, selected: select } : row))
    );
  };

  const handleToggleRow = (key: string) => {
    setParsedRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, selected: !row.selected } : row))
    );
  };

  const handleUpdateRowClass = (key: string, newClassId: string) => {
    const cls = classes.find((c) => c.id === newClassId);
    setParsedRows((prev) =>
      prev.map((row) =>
        row.key === key
          ? {
              ...row,
              classId: newClassId,
              className: cls?.name || '',
              isValid: row.fullName.length >= 2,
              errorReason: row.fullName.length < 2 ? 'Thiếu họ và tên học sinh' : undefined,
            }
          : row
      )
    );
  };

  const handleConfirmImport = () => {
    const selectedRows = parsedRows.filter((r) => r.selected && r.isValid);
    if (selectedRows.length === 0) {
      alert('Chưa có học sinh hợp lệ nào được chọn để nhập.');
      return;
    }

    const studentsToImport: Omit<Student, 'id'>[] = selectedRows.map((r) => ({
      fullName: r.fullName,
      studentCode: r.studentCode,
      classId: r.classId,
      gender: r.gender,
      status: r.status,
      note: r.note || undefined,
      needAttention: r.needAttention,
    }));

    onImportStudents(studentsToImport);
    handleResetModal();
    onClose();
  };

  const handleResetModal = () => {
    setFile(null);
    setParsedRows([]);
    setParseError(null);
    setSearchFilter('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filtered preview rows
  const displayedRows = parsedRows.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.studentCode.toLowerCase().includes(q) ||
      r.className.toLowerCase().includes(q) ||
      r.note.toLowerCase().includes(q)
    );
  });

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const selectedCount = parsedRows.filter((r) => r.selected && r.isValid).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicateCode).length;

  return (
    <div
      id="excel-import-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Nhập danh sách học sinh từ Excel</h3>
              <p className="text-xs text-emerald-100">
                Hỗ trợ tệp .xlsx, .xls, .csv – Tự động nhận diện cột và gán lớp học
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Step 1: Download template or choose file */}
          {parsedRows.length === 0 ? (
            <div className="space-y-5">
              {/* Template Download Prompt */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Chưa có tệp Excel theo định dạng chuẩn?</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Thầy có thể tải tệp mẫu Excel có sẵn các cột chuẩn (Họ tên, Mã HS, Lớp, Giới tính, Ghi chú) để điền nhanh.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 rounded-xl border border-emerald-300 shadow-2xs shrink-0 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Tải file Excel mẫu</span>
                </button>
              </div>

              {/* Class target selection setting */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Quy tắc gán lớp học:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Tự động phân lớp theo cột "Lớp" trong file, hoặc ép toàn bộ danh sách vào một lớp cụ thể.
                  </span>
                </div>
                <select
                  value={targetClassMode}
                  onChange={(e) => setTargetClassMode(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="auto">⚡ Tự động theo cột trong file</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Tất cả vào lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  {isProcessing ? (
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  {isProcessing ? 'Đang đọc dữ liệu tệp Excel...' : 'Kéo và thả file Excel vào đây'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Hoặc bấm vào để duyệt tệp từ máy tính của thầy (chấp nhận <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong>)
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Chọn tệp từ máy tính</span>
                </div>
              </div>

              {/* Error Message */}
              {parseError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Data Preview & Confirmation Table */
            <div className="space-y-4">
              {/* File Info and Stats Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{file?.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      Đã đọc: <strong>{parsedRows.length}</strong> dòng • Hợp lệ:{' '}
                      <strong className="text-emerald-700">{validCount}</strong> • Đã chọn:{' '}
                      <strong className="text-blue-700">{selectedCount}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Chọn file khác</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                    title="Tải lại file mẫu"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải mẫu</span>
                  </button>
                </div>
              </div>

              {/* Duplicate code warning */}
              {duplicateCount > 0 && (
                <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Phát hiện <strong>{duplicateCount}</strong> học sinh có mã trùng với mã học sinh đã có trên hệ thống hoặc trong file. Thầy hãy kiểm tra lại để tránh nhầm lẫn.
                  </span>
                </div>
              )}

              {/* Search & Bulk action controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(true)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    Chọn tất cả hợp lệ ({validCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(false)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Bỏ chọn
                  </button>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Lọc trong bảng xem trước..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">
                          <Check className="w-3.5 h-3.5 mx-auto text-slate-400" />
                        </th>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3 w-28">Mã HS</th>
                        <th className="py-2.5 px-3 w-32">Lớp học</th>
                        <th className="py-2.5 px-3 w-20 text-center">Giới tính</th>
                        <th className="py-2.5 px-3 w-24">Trạng thái</th>
                        <th className="py-2.5 px-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                            Không có kết quả phù hợp với từ khóa lọc
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row, idx) => (
                          <tr
                            key={row.key}
                            className={`transition-colors ${
                              !row.isValid
                                ? 'bg-rose-50/50 text-rose-800'
                                : row.selected
                                ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                                : 'hover:bg-slate-50 opacity-60'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                disabled={!row.isValid}
                                checked={row.selected}
                                onChange={() => handleToggleRow(row.key)}
                                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{row.fullName}</div>
                              {row.errorReason && (
                                <div className="text-[10px] text-rose-600 font-medium">
                                  ⚠️ {row.errorReason}
                                </div>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <span
                                className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                                  row.isDuplicateCode
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {row.studentCode}
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              <select
                                value={row.classId}
                                onChange={(e) => handleUpdateRowClass(row.key, e.target.value)}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-emerald-600"
                              >
                                {classes.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    Lớp {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  row.gender === 'Nam'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-pink-100 text-pink-800'
                                }`}
                              >
                                {row.gender}
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="text-slate-600">{row.status}</span>
                              {row.needAttention && (
                                <span className="ml-1 text-[9px] font-bold px-1 py-0.2 bg-rose-100 text-rose-700 rounded-xs">
                                  Lưu ý
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="text-slate-500 italic truncate max-w-xs block">
                                {row.note || '—'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 && (
              <span>
                Sẽ thêm <strong className="text-emerald-700 font-bold">{selectedCount}</strong> học sinh vào hệ thống.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Hủy
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận nhập ({selectedCount}) học sinh</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

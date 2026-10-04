/**
 * src/services/supabase.ts
 * Quản lý kết nối & đồng bộ dữ liệu với cơ sở dữ liệu Supabase
 * Cho Web App: "TRỢ LÝ QUẢN TRỊ HỌC TẬP – THẦY DƯƠNG THÀNH TÍN"
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppData, ClassItem, Student, Lesson, LearningTask, GradeEntry, StudentComment, ActivityLog } from '../types';

const CONFIG_KEY = 'tro_ly_supabase_config_v1';

// Lấy cấu hình mặc định từ file .env hoặc localStorage
export function getSupabaseConfig(): { url: string; anonKey: string; autoSync: boolean } {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          autoSync: parsed.autoSync ?? false,
        };
      }
    }
  } catch (e) {
    console.error('Error reading supabase config from storage:', e);
  }

  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || 'https://hgeiudwywxajjhddmcsu.supabase.co',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_H0EsTtg1e3HiNUgkghIWng_bvjOGPm0',
    autoSync: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string, autoSync: boolean = false): void {
  try {
    localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim(), autoSync })
    );
    cachedClient = null; // Reset cached client to use new config
  } catch (e) {
    console.error('Error saving supabase config:', e);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

/**
 * Kiểm tra kết nối tới Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  hasTables: boolean;
  tablesFound: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Chưa cấu hình URL hoặc Anon Key của Supabase.',
      hasTables: false,
      tablesFound: [],
    };
  }

  try {
    const tablesToCheck = ['app_backup', 'classes', 'students', 'lessons', 'tasks', 'grades', 'comments'];
    const found: string[] = [];

    // Kiểm tra từng bảng xem đã tạo chưa
    for (const table of tablesToCheck) {
      const { error } = await client.from(table).select('count', { count: 'exact', head: true });
      if (!error) {
        found.push(table);
      }
    }

    if (found.length > 0) {
      return {
        connected: true,
        message: `Kết nối thành công! Đã tìm thấy ${found.length} bảng dữ liệu (${found.join(', ')}).`,
        hasTables: true,
        tablesFound: found,
      };
    } else {
      return {
        connected: true,
        message: 'Kết nối máy chủ Supabase thành công, nhưng chưa tạo bảng nào trong Database. Thầy hãy chạy mã SQL tạo bảng trong Supabase SQL Editor.',
        hasTables: false,
        tablesFound: [],
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Không thể kết nối đến Supabase: ${errorMsg}`,
      hasTables: false,
      tablesFound: [],
    };
  }
}

/**
 * Đẩy toàn bộ dữ liệu từ ứng dụng lên Supabase
 */
export async function pushDataToSupabase(data: AppData): Promise<{
  success: boolean;
  message: string;
  tablesUpdated: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Chưa khởi tạo Supabase Client. Vui lòng kiểm tra lại URL và Anon Key.');
  }

  const updatedTables: string[] = [];
  let backupSaved = false;

  // 1. Thử lưu vào bảng app_backup (Lưu nguyên gói dữ liệu dạng JSON)
  try {
    const { error: backupErr } = await client.from('app_backup').upsert(
      {
        id: 'main_school_data',
        data: data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (!backupErr) {
      updatedTables.push('app_backup (Sao lưu tổng)');
      backupSaved = true;
    }
  } catch {
    // Không có bảng app_backup thì tiếp tục thử bảng chi tiết
  }

  // 2. Thử đồng bộ vào từng bảng chi tiết nếu đã có bảng
  // Lớp học
  if (data.classes.length > 0) {
    const classRows = data.classes.map((c) => ({
      id: c.id,
      name: c.name,
      grade_level: c.gradeLevel,
      room: c.room || '',
      academic_year: c.academicYear,
      note: c.note || '',
    }));
    const { error } = await client.from('classes').upsert(classRows, { onConflict: 'id' });
    if (!error) updatedTables.push('classes');
  }

  // Học sinh
  if (data.students.length > 0) {
    const studentRows = data.students.map((s) => ({
      id: s.id,
      student_code: s.studentCode,
      full_name: s.fullName,
      class_id: s.classId,
      gender: s.gender,
      status: s.status,
      note: s.note || '',
      need_attention: !!s.needAttention,
    }));
    const { error } = await client.from('students').upsert(studentRows, { onConflict: 'id' });
    if (!error) updatedTables.push('students');
  }

  // Bài học
  if (data.lessons.length > 0) {
    const lessonRows = data.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      class_id: l.classId,
      topic: l.topic,
      objectives: l.objectives,
      summary: l.summary,
      teach_date: l.teachDate,
      status: l.status,
    }));
    const { error } = await client.from('lessons').upsert(lessonRows, { onConflict: 'id' });
    if (!error) updatedTables.push('lessons');
  }

  // Nhiệm vụ
  if (data.tasks.length > 0) {
    const taskRows = data.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      class_id: t.classId,
      lesson_id: t.lessonId || null,
      description: t.description,
      due_date: t.dueDate,
      priority: t.priority,
      status: t.status,
      completed_student_ids: t.completedStudentIds,
    }));
    const { error } = await client.from('tasks').upsert(taskRows, { onConflict: 'id' });
    if (!error) updatedTables.push('tasks');
  }

  // Điểm số
  if (data.grades.length > 0) {
    const gradeRows = data.grades.map((g) => ({
      id: g.id,
      student_id: g.studentId,
      class_id: g.classId,
      activity_title: g.activityTitle,
      lesson_id: g.lessonId || null,
      score: g.score,
      date: g.date,
      note: g.note || '',
    }));
    const { error } = await client.from('grades').upsert(gradeRows, { onConflict: 'id' });
    if (!error) updatedTables.push('grades');
  }

  // Nhận xét
  if (data.comments.length > 0) {
    const commentRows = data.comments.map((cm) => ({
      id: cm.id,
      student_id: cm.studentId,
      class_id: cm.classId,
      date: cm.date,
      content: cm.content,
      skill_category: cm.skillCategory,
      note: cm.note || '',
    }));
    const { error } = await client.from('comments').upsert(commentRows, { onConflict: 'id' });
    if (!error) updatedTables.push('comments');
  }

  // Nhật ký
  if (data.activityLogs.length > 0) {
    const logRows = data.activityLogs.slice(-50).map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      type: log.type,
      action: log.action,
    }));
    const { error } = await client.from('activity_logs').upsert(logRows, { onConflict: 'id' });
    if (!error) updatedTables.push('activity_logs');
  }

  if (updatedTables.length === 0 && !backupSaved) {
    throw new Error(
      'Chưa thể ghi dữ liệu vì chưa tạo bảng nào trên Supabase. Thầy hãy sao chép mã SQL và chạy trong mục "SQL Editor" trên trang Supabase để tạo bảng trước.'
    );
  }

  return {
    success: true,
    message: `Đã đồng bộ thành công lên Supabase (${updatedTables.join(', ')})!`,
    tablesUpdated: updatedTables,
  };
}

/**
 * Tải toàn bộ dữ liệu từ Supabase về ứng dụng
 */
export async function pullDataFromSupabase(): Promise<{
  success: boolean;
  data?: AppData;
  source: string;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Chưa khởi tạo Supabase Client.');
  }

  // 1. Thử lấy từ bảng app_backup trước
  try {
    const { data: backupRow, error: backupErr } = await client
      .from('app_backup')
      .select('data')
      .eq('id', 'main_school_data')
      .single();

    if (!backupErr && backupRow && backupRow.data) {
      const parsed = backupRow.data as AppData;
      return {
        success: true,
        data: parsed,
        source: 'app_backup (Sao lưu đám mây)',
        message: 'Đã tải thành công bản sao lưu mới nhất từ Supabase Cloud.',
      };
    }
  } catch {
    // Tiếp tục thử lấy từ các bảng quan hệ
  }

  // 2. Thử truy vấn các bảng thành phần
  try {
    const [classesRes, studentsRes, lessonsRes, tasksRes, gradesRes, commentsRes, logsRes] = await Promise.all([
      client.from('classes').select('*'),
      client.from('students').select('*'),
      client.from('lessons').select('*'),
      client.from('tasks').select('*'),
      client.from('grades').select('*'),
      client.from('comments').select('*'),
      client.from('activity_logs').select('*'),
    ]);

    const hasAny =
      (classesRes.data && classesRes.data.length > 0) ||
      (studentsRes.data && studentsRes.data.length > 0) ||
      (lessonsRes.data && lessonsRes.data.length > 0);

    if (!hasAny) {
      throw new Error('Không tìm thấy dữ liệu nào trên Supabase. Thầy có thể nhấn "Đẩy dữ liệu hiện tại lên Supabase" trước.');
    }

    // Map DB fields về interface AppData
    const classes: ClassItem[] = (classesRes.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      gradeLevel: row.grade_level,
      room: row.room,
      academicYear: row.academic_year,
      note: row.note,
    }));

    const students: Student[] = (studentsRes.data || []).map((row: any) => ({
      id: row.id,
      studentCode: row.student_code,
      fullName: row.full_name,
      classId: row.class_id,
      gender: row.gender,
      status: row.status,
      note: row.note,
      needAttention: !!row.need_attention,
    }));

    const lessons: Lesson[] = (lessonsRes.data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      classId: row.class_id,
      topic: row.topic,
      objectives: row.objectives,
      summary: row.summary,
      teachDate: row.teach_date,
      status: row.status,
    }));

    const tasks: LearningTask[] = (tasksRes.data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      classId: row.class_id,
      lessonId: row.lesson_id,
      description: row.description,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status,
      completedStudentIds: row.completed_student_ids || [],
    }));

    const grades: GradeEntry[] = (gradesRes.data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      classId: row.class_id,
      activityTitle: row.activity_title,
      lessonId: row.lesson_id,
      score: Number(row.score),
      date: row.date,
      note: row.note,
    }));

    const comments: StudentComment[] = (commentsRes.data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      classId: row.class_id,
      date: row.date,
      content: row.content,
      skillCategory: row.skill_category,
      note: row.note,
    }));

    const activityLogs: ActivityLog[] = (logsRes.data || []).map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      action: row.action,
    }));

    const loadedData: AppData = {
      classes,
      students,
      lessons,
      tasks,
      grades,
      comments,
      activityLogs,
      soundEnabled: false,
    };

    return {
      success: true,
      data: loadedData,
      source: 'Các bảng Supabase (classes, students, lessons...)',
      message: `Đã nạp thành công ${students.length} học sinh và ${lessons.length} bài học từ cơ sở dữ liệu Supabase.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Lỗi khi lấy dữ liệu: ${errorMsg}`);
  }
}

/**
 * Đoạn mã SQL sẵn sàng để thầy copy dán vào Supabase SQL Editor
 */
export const SUPABASE_SQL_SETUP_SCRIPT = `-- ====================================================================
-- MÃ SQL KHỞI TẠO CƠ SỞ DỮ LIỆU SUPABASE
-- TRỢ LÝ QUẢN TRỊ HỌC TẬP – THẦY DƯƠNG THÀNH TÍN (THCS PHAN BỘI CHÂU)
-- ====================================================================
-- Hướng dẫn:
-- 1. Vào trang quản trị Supabase -> Chọn dự án của thầy
-- 2. Nhấn vào mục "SQL Editor" ở menu bên trái
-- 3. Tạo "New Query", dán toàn bộ đoạn mã này vào và nhấn "RUN" (Chạy)
-- ====================================================================

-- 1. BẢNG SAO LƯU TỔNG HỢP NHANH (Dễ dàng lưu trữ và đồng bộ tức thì)
create table if not exists app_backup (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- 2. BẢNG LỚP HỌC (classes)
create table if not exists classes (
  id text primary key,
  name text not null,
  grade_level integer not null,
  room text,
  academic_year text not null,
  note text,
  created_at timestamp with time zone default now()
);

-- 3. BẢNG HỌC SINH (students)
create table if not exists students (
  id text primary key,
  student_code text not null,
  full_name text not null,
  class_id text not null,
  gender text not null,
  status text not null,
  note text,
  need_attention boolean default false,
  created_at timestamp with time zone default now()
);

-- 4. BẢNG BÀI HỌC / GIÁO ÁN (lessons)
create table if not exists lessons (
  id text primary key,
  title text not null,
  class_id text not null,
  topic text,
  objectives text,
  summary text,
  teach_date text,
  status text,
  created_at timestamp with time zone default now()
);

-- 5. BẢNG NHIỆM VỤ HỌC TẬP (tasks)
create table if not exists tasks (
  id text primary key,
  title text not null,
  class_id text not null,
  lesson_id text,
  description text,
  due_date text,
  priority text,
  status text,
  completed_student_ids jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 6. BẢNG ĐIỂM SỐ (grades)
create table if not exists grades (
  id text primary key,
  student_id text not null,
  class_id text not null,
  activity_title text not null,
  lesson_id text,
  score numeric not null,
  date text,
  note text,
  created_at timestamp with time zone default now()
);

-- 7. BẢNG NHẬN XÉT HỌC SINH (comments)
create table if not exists comments (
  id text primary key,
  student_id text not null,
  class_id text not null,
  date text,
  content text not null,
  skill_category text,
  note text,
  created_at timestamp with time zone default now()
);

-- 8. BẢNG NHẬT KÝ HOẠT ĐỘNG (activity_logs)
create table if not exists activity_logs (
  id text primary key,
  timestamp text not null,
  type text not null,
  action text not null,
  created_at timestamp with time zone default now()
);

-- ====================================================================
-- PHÂN QUYỀN BẢO MẬT (ROW LEVEL SECURITY - RLS)
-- Cho phép khóa công khai Anon Key có toàn quyền đọc / ghi an toàn
-- ====================================================================

alter table app_backup enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table lessons enable row level security;
alter table tasks enable row level security;
alter table grades enable row level security;
alter table comments enable row level security;
alter table activity_logs enable row level security;

-- Tạo chính sách (Policies) cho phép đọc và ghi dữ liệu với Anon Key
create policy "Cho phep truy cap app_backup" on app_backup for all using (true) with check (true);
create policy "Cho phep truy cap classes" on classes for all using (true) with check (true);
create policy "Cho phep truy cap students" on students for all using (true) with check (true);
create policy "Cho phep truy cap lessons" on lessons for all using (true) with check (true);
create policy "Cho phep truy cap tasks" on tasks for all using (true) with check (true);
create policy "Cho phep truy cap grades" on grades for all using (true) with check (true);
create policy "Cho phep truy cap comments" on comments for all using (true) with check (true);
create policy "Cho phep truy cap activity_logs" on activity_logs for all using (true) with check (true);
`;

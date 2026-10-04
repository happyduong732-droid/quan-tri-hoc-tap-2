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
          autoSync: parsed.autoSync ?? true,
        };
      }
    }
  } catch (e) {
    console.error('Error reading supabase config from storage:', e);
  }

  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || 'https://hgeiudwywxajjhddmcsu.supabase.co',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_H0EsTtg1e3HiNUgkghIWng_bvjOGPm0',
    autoSync: true,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string, autoSync: boolean = true): void {
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

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
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

  // Dọn dẹp các bài học đã xóa trên giao diện nhưng vẫn còn trên Supabase
  try {
    const { data: remoteLessons } = await client.from('lessons').select('id');
    if (remoteLessons && remoteLessons.length > 0) {
      const localLessonIds = new Set(data.lessons.map((l) => l.id));
      const toDelete = remoteLessons.filter((r: { id: string }) => !localLessonIds.has(r.id)).map((r: { id: string }) => r.id);
      if (toDelete.length > 0) {
        await client.from('lessons').delete().in('id', toDelete);
      }
    }
  } catch (cleanErr) {
    console.warn('Lỗi khi dọn dẹp bài học đã xóa trên Supabase:', cleanErr);
  }

  // Dọn dẹp học sinh đã xóa
  try {
    const { data: remoteStudents } = await client.from('students').select('id');
    if (remoteStudents && remoteStudents.length > 0) {
      const localStudentIds = new Set(data.students.map((s) => s.id));
      const toDelete = remoteStudents.filter((r: { id: string }) => !localStudentIds.has(r.id)).map((r: { id: string }) => r.id);
      if (toDelete.length > 0) {
        await client.from('students').delete().in('id', toDelete);
      }
    }
  } catch (cleanErr) {
    console.warn('Lỗi khi dọn dẹp học sinh đã xóa trên Supabase:', cleanErr);
  }

  // Dọn dẹp nhiệm vụ đã xóa
  try {
    const { data: remoteTasks } = await client.from('tasks').select('id');
    if (remoteTasks && remoteTasks.length > 0) {
      const localTaskIds = new Set(data.tasks.map((t) => t.id));
      const toDelete = remoteTasks.filter((r: { id: string }) => !localTaskIds.has(r.id)).map((r: { id: string }) => r.id);
      if (toDelete.length > 0) {
        await client.from('tasks').delete().in('id', toDelete);
      }
    }
  } catch (cleanErr) {
    console.warn('Lỗi khi dọn dẹp nhiệm vụ đã xóa trên Supabase:', cleanErr);
  }

  // Dọn dẹp điểm số đã xóa
  try {
    const { data: remoteGrades } = await client.from('grades').select('id');
    if (remoteGrades && remoteGrades.length > 0) {
      const localGradeIds = new Set(data.grades.map((g) => g.id));
      const toDelete = remoteGrades.filter((r: { id: string }) => !localGradeIds.has(r.id)).map((r: { id: string }) => r.id);
      if (toDelete.length > 0) {
        await client.from('grades').delete().in('id', toDelete);
      }
    }
  } catch (cleanErr) {
    console.warn('Lỗi khi dọn dẹp điểm đã xóa trên Supabase:', cleanErr);
  }

  // Dọn dẹp nhận xét đã xóa
  try {
    const { data: remoteComments } = await client.from('comments').select('id');
    if (remoteComments && remoteComments.length > 0) {
      const localCommentIds = new Set(data.comments.map((c) => c.id));
      const toDelete = remoteComments.filter((r: { id: string }) => !localCommentIds.has(r.id)).map((r: { id: string }) => r.id);
      if (toDelete.length > 0) {
        await client.from('comments').delete().in('id', toDelete);
      }
    }
  } catch (cleanErr) {
    console.warn('Lỗi khi dọn dẹp nhận xét đã xóa trên Supabase:', cleanErr);
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

  // 1. ƯU TIÊN LẤY TỪ CÁC BẢNG QUAN HỆ CHÍNH (classes, students, lessons, tasks, grades, comments)
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

    // Nếu bảng classes tồn tại và không bị lỗi
    if (!classesRes.error && Array.isArray(classesRes.data)) {
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
        source: 'Các bảng dữ liệu Supabase (classes, students...)',
        message: `Đã nạp thành công ${classes.length} lớp học và ${students.length} học sinh từ cơ sở dữ liệu Supabase.`,
      };
    }
  } catch (err: unknown) {
    // Nếu bảng quan hệ chưa có thì thử bảng app_backup
  }

  // 2. Dự phòng: Thử lấy từ bảng app_backup
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
        message: 'Đã tải thành công bản sao lưu từ Supabase Cloud.',
      };
    }
  } catch {
    // Không có dữ liệu
  }

  throw new Error('Chưa tìm thấy dữ liệu trên Supabase.');
}

/**
 * Xóa một bản ghi trực tiếp trên Supabase và cập nhật bản sao lưu
 */
export async function deleteFromSupabase(
  table: 'lessons' | 'students' | 'classes' | 'tasks' | 'grades' | 'comments',
  id: string,
  updatedData?: AppData
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    // 1. Xóa trong bảng quan hệ (Nếu xóa lớp thì xóa kèm các dữ liệu phụ thuộc)
    if (table === 'classes') {
      await Promise.allSettled([
        client.from('classes').delete().eq('id', id),
        client.from('students').delete().eq('class_id', id),
        client.from('lessons').delete().eq('class_id', id),
        client.from('tasks').delete().eq('class_id', id),
        client.from('grades').delete().eq('class_id', id),
        client.from('comments').delete().eq('class_id', id),
      ]);
    } else {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) {
        console.warn(`Lỗi khi xóa từ bảng ${table}:`, error.message);
      }
    }

    // 2. Cập nhật bản sao lưu toàn diện app_backup nếu có
    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error(`Lỗi khi gọi deleteFromSupabase (${table}):`, err);
  }
}

/**
 * Thêm hoặc Cập nhật Bài học trên Supabase
 */
export async function upsertLessonToSupabase(lesson: Lesson, updatedData?: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('lessons').upsert(
      {
        id: lesson.id,
        title: lesson.title,
        class_id: lesson.classId,
        topic: lesson.topic,
        objectives: lesson.objectives,
        summary: lesson.summary,
        teach_date: lesson.teachDate,
        status: lesson.status,
      },
      { onConflict: 'id' }
    );

    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error('Lỗi khi upsert bài học lên Supabase:', err);
  }
}

/**
 * Thêm hoặc Cập nhật Học sinh trên Supabase
 */
export async function upsertStudentToSupabase(student: Student, updatedData?: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('students').upsert(
      {
        id: student.id,
        student_code: student.studentCode,
        full_name: student.fullName,
        class_id: student.classId,
        gender: student.gender,
        status: student.status,
        note: student.note || '',
        need_attention: !!student.needAttention,
      },
      { onConflict: 'id' }
    );

    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error('Lỗi khi upsert học sinh lên Supabase:', err);
  }
}

/**
 * Thêm hoặc Cập nhật Lớp học trên Supabase
 */
export async function upsertClassToSupabase(cls: ClassItem, updatedData?: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('classes').upsert(
      {
        id: cls.id,
        name: cls.name,
        grade_level: cls.gradeLevel,
        room: cls.room || '',
        academic_year: cls.academicYear,
        note: cls.note || '',
      },
      { onConflict: 'id' }
    );

    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error('Lỗi khi upsert lớp lên Supabase:', err);
  }
}

/**
 * Thêm hoặc Cập nhật Nhiệm vụ trên Supabase
 */
export async function upsertTaskToSupabase(task: LearningTask, updatedData?: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('tasks').upsert(
      {
        id: task.id,
        title: task.title,
        class_id: task.classId,
        lesson_id: task.lessonId || null,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority,
        status: task.status,
        completed_student_ids: task.completedStudentIds,
      },
      { onConflict: 'id' }
    );

    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error('Lỗi khi upsert nhiệm vụ lên Supabase:', err);
  }
}

/**
 * Thêm hoặc Cập nhật Điểm số trên Supabase
 */
export async function upsertGradeToSupabase(grade: GradeEntry, updatedData?: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('grades').upsert(
      {
        id: grade.id,
        student_id: grade.studentId,
        class_id: grade.classId,
        activity_title: grade.activityTitle,
        lesson_id: grade.lessonId || null,
        score: grade.score,
        date: grade.date,
        note: grade.note || '',
      },
      { onConflict: 'id' }
    );

    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error('Lỗi khi upsert điểm số lên Supabase:', err);
  }
}

/**
 * Thêm hoặc Cập nhật Nhận xét trên Supabase
 */
export async function upsertCommentToSupabase(comment: StudentComment, updatedData?: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('comments').upsert(
      {
        id: comment.id,
        student_id: comment.studentId,
        class_id: comment.classId,
        date: comment.date,
        content: comment.content,
        skill_category: comment.skillCategory,
        note: comment.note || '',
      },
      { onConflict: 'id' }
    );

    if (updatedData) {
      await client.from('app_backup').upsert(
        {
          id: 'main_school_data',
          data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.error('Lỗi khi upsert nhận xét lên Supabase:', err);
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

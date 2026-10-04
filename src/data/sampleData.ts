/**
 * Dữ liệu mẫu minh họa cho môn Ngữ văn THCS
 * Thầy giáo: Dương Thành Tín - Trường THCS Phan Bội Châu
 * Lưu ý: Toàn bộ dữ liệu dưới đây chỉ mang tính chất minh họa thao tác,
 * dễ dàng chỉnh sửa, thêm, xóa hoặc khôi phục bất cứ lúc nào.
 */

import { AppData, ClassItem, Student, Lesson, LearningTask, GradeEntry, StudentComment, ActivityLog } from '../types';

export const initialClasses: ClassItem[] = [
  {
    id: 'c-6a1',
    name: '6A1',
    gradeLevel: 6,
    room: 'Phòng 201',
    academicYear: '2025-2026',
    note: 'Lớp sôi nổi, hào hứng với hoạt động kể chuyện và đọc diễn cảm'
  },
  {
    id: 'c-7a1',
    name: '7A1',
    gradeLevel: 7,
    room: 'Phòng 203',
    academicYear: '2025-2026',
    note: 'Lực học đồng đều, có thế mạnh về cảm thụ văn học thơ'
  },
  {
    id: 'c-8a1',
    name: '8A1',
    gradeLevel: 8,
    room: 'Phòng 302',
    academicYear: '2025-2026',
    note: 'Tập trung rèn kỹ năng viết đoạn văn nghị luận xã hội'
  },
  {
    id: 'c-9a1',
    name: '9A1',
    gradeLevel: 9,
    room: 'Phòng 305',
    academicYear: '2025-2026',
    note: 'Lớp cuối cấp, chú trọng ôn tập phương pháp phân tích tác phẩm truyện'
  }
];

export const initialStudents: Student[] = [
  // Lớp 6A1
  { id: 's-601', studentCode: 'HS0601', fullName: 'Nguyễn Hoàng Nam', classId: 'c-6a1', gender: 'Nam', status: 'Đang học', note: 'Chăm chú nghe giảng, đọc diễn cảm tốt' },
  { id: 's-602', studentCode: 'HS0602', fullName: 'Trần Thị Mai Anh', classId: 'c-6a1', gender: 'Nữ', status: 'Đang học', note: 'Chữ viết đẹp, bài văn giàu cảm xúc' },
  { id: 's-603', studentCode: 'HS0603', fullName: 'Lê Minh Đức', classId: 'c-6a1', gender: 'Nam', status: 'Đang học', note: 'Cần rèn thêm chính tả và dấu câu', needAttention: true },
  { id: 's-604', studentCode: 'HS0604', fullName: 'Phạm Thuỳ Linh', classId: 'c-6a1', gender: 'Nữ', status: 'Đang học', note: 'Tích cực phát biểu xây dựng bài học' },
  { id: 's-605', studentCode: 'HS0605', fullName: 'Đỗ Quang Huy', classId: 'c-6a1', gender: 'Nam', status: 'Đang học', note: 'Cần nộp bài tập đúng hạn hơn', needAttention: true },
  { id: 's-606', studentCode: 'HS0606', fullName: 'Vũ Ngọc Bảo Trâm', classId: 'c-6a1', gender: 'Nữ', status: 'Đang học', note: 'Có năng khiếu kể chuyện và đóng vai nhân vật' },

  // Lớp 7A1
  { id: 's-701', studentCode: 'HS0701', fullName: 'Hoàng Quốc Tuấn', classId: 'c-7a1', gender: 'Nam', status: 'Đang học', note: 'Viết mở bài ấn tượng, lập dàn ý khoa học' },
  { id: 's-702', studentCode: 'HS0702', fullName: 'Bùi Thanh Hằng', classId: 'c-7a1', gender: 'Nữ', status: 'Đang học', note: 'Yêu thích thơ lục bát và ca dao' },
  { id: 's-703', studentCode: 'HS0703', fullName: 'Nguyễn Đình Phúc', classId: 'c-7a1', gender: 'Nam', status: 'Đang học', note: 'Cần củng cố kiến thức từ loại Tiếng Việt', needAttention: true },
  { id: 's-704', studentCode: 'HS0704', fullName: 'Đặng Ngọc Ánh', classId: 'c-7a1', gender: 'Nữ', status: 'Đang học', note: 'Trình bày bài nói lưu loát, tự tin trước lớp' },
  { id: 's-705', studentCode: 'HS0705', fullName: 'Phan Trọng Khang', classId: 'c-7a1', gender: 'Nam', status: 'Đang học', note: 'Hoàn thành tốt các dự án đọc sách' },

  // Lớp 8A1
  { id: 's-801', studentCode: 'HS0801', fullName: 'Trịnh Gia Bảo', classId: 'c-8a1', gender: 'Nam', status: 'Đang học', note: 'Lý lẽ nghị luận sắc bén, luận điểm rõ' },
  { id: 's-802', studentCode: 'HS0802', fullName: 'Ngô Thảo My', classId: 'c-8a1', gender: 'Nữ', status: 'Đang học', note: 'Cẩn thận trong việc sử dụng dẫn chứng văn học' },
  { id: 's-803', studentCode: 'HS0803', fullName: 'Võ Minh Quân', classId: 'c-8a1', gender: 'Nam', status: 'Đang học', note: 'Cần chú ý diễn đạt tránh lặp từ ngữ' },
  { id: 's-804', studentCode: 'HS0804', fullName: 'Lý Diệu Anh', classId: 'c-8a1', gender: 'Nữ', status: 'Đang học', note: 'Rất chăm chỉ, thường xuyên mượn sách thư viện' },
  { id: 's-805', studentCode: 'HS0805', fullName: 'Hồ Tuấn Kiệt', classId: 'c-8a1', gender: 'Nam', status: 'Đang học', note: 'Đang tiến bộ trong bài viết đoạn văn ngắn' },

  // Lớp 9A1
  { id: 's-901', studentCode: 'HS0901', fullName: 'Dương Khánh Linh', classId: 'c-9a1', gender: 'Nữ', status: 'Đang học', note: 'Học lực xuất sắc môn Ngữ văn, khả năng tự học cao' },
  { id: 's-902', studentCode: 'HS0902', fullName: 'Vũ Đức Thịnh', classId: 'c-9a1', gender: 'Nam', status: 'Đang học', note: 'Cần luyện thêm kỹ năng phân tích tâm lý nhân vật', needAttention: true },
  { id: 's-903', studentCode: 'HS0903', fullName: 'Trần Bích Phương', classId: 'c-9a1', gender: 'Nữ', status: 'Đang học', note: 'Lối viết truyền cảm, biết liên hệ mở rộng thực tế' },
  { id: 's-904', studentCode: 'HS0904', fullName: 'Lê Hoàng Long', classId: 'c-9a1', gender: 'Nam', status: 'Đang học', note: 'Vốn từ vựng phong phú, tham gia thảo luận hăng hái' },
  { id: 's-905', studentCode: 'HS0905', fullName: 'Nguyễn Ngọc Yến', classId: 'c-9a1', gender: 'Nữ', status: 'Đang học', note: 'Ghi chép bài học cẩn thận, chu đáo' }
];

export const initialLessons: Lesson[] = [
  {
    id: 'l-01',
    title: 'Thực hành Tiếng Việt: Nghĩa của từ và biện pháp tu từ so sánh',
    classId: 'c-6a1',
    topic: 'Chủ đề: Lắng nghe lịch sử nước mình',
    objectives: 'Nhận biết từ đa nghĩa, phân tích tác dụng gợi hình gợi cảm của biện pháp so sánh trong ngữ cảnh cụ thể.',
    summary: 'Phân biệt nghĩa gốc và nghĩa chuyển; luyện tập đặt câu có hình ảnh so sánh sinh động.',
    teachDate: '2026-09-18',
    status: 'Đang dạy'
  },
  {
    id: 'l-02',
    title: 'Viết đoạn văn ghi lại cảm xúc về một bài thơ lục bát',
    classId: 'c-6a1',
    topic: 'Chủ đề: Yêu thương và chia sẻ',
    objectives: 'Nắm chắc cấu trúc đoạn văn diễn dịch/quy nạp; thể hiện cảm xúc chân thực về tình cảm gia đình.',
    summary: 'Hướng dẫn các bước lập dàn ý, chọn lọc chi tiết và từ ngữ biểu cảm.',
    teachDate: '2026-09-22',
    status: 'Chưa dạy'
  },
  {
    id: 'l-03',
    title: 'Đặc điểm của thể thơ bốn chữ, năm chữ và nhịp thơ',
    classId: 'c-7a1',
    topic: 'Chủ đề: Khúc nhạc tâm hồn',
    objectives: 'Nhận diện vần, nhịp, hình ảnh và nhạc điệu trong các bài thơ ngắn giàu nhạc tính.',
    summary: 'Thực hành ngắt nhịp và phân tích tâm trạng người viết qua từng dòng thơ.',
    teachDate: '2026-09-17',
    status: 'Đã hoàn thành'
  },
  {
    id: 'l-04',
    title: 'Nói và nghe: Trao đổi về một vấn đề đời sống mà em quan tâm',
    classId: 'c-7a1',
    topic: 'Chủ đề: Trí tuệ dân gian',
    objectives: 'Rèn luyện sự tự tin khi nói trước tập thể; biết lắng nghe và phản hồi ý kiến bạn cùng lớp.',
    summary: 'Chuẩn bị bài thuyết trình 3 phút, sử dụng cử chỉ và ánh mắt phù hợp.',
    teachDate: '2026-09-19',
    status: 'Đang dạy'
  },
  {
    id: 'l-05',
    title: 'Viết bài văn nghị luận về một hiện tượng đời sống',
    classId: 'c-8a1',
    topic: 'Chủ đề: Gương mặt thân quen',
    objectives: 'Xây dựng hệ thống luận điểm, luận cứ xác thực; rèn luyện thói quen tư duy phản biện.',
    summary: 'Tìm hiểu đề tài giữ gìn vệ sinh trường học và văn hóa ứng xử trên mạng xã hội.',
    teachDate: '2026-09-18',
    status: 'Đang dạy'
  },
  {
    id: 'l-06',
    title: 'Phương pháp phân tích nhân vật trong tác phẩm truyện',
    classId: 'c-9a1',
    topic: 'Chủ đề: Khát vọng và lý tưởng sống',
    objectives: 'Phân tích ngoại hình, hành động, lời nói, nội tâm và mối quan hệ với các nhân vật khác.',
    summary: 'Luyện tập lập dàn bài chi tiết bài văn phân tích nhân vật trọng tâm của học kỳ.',
    teachDate: '2026-09-16',
    status: 'Đã hoàn thành'
  },
  {
    id: 'l-07',
    title: 'Ôn tập tổng hợp kiến thức Tiếng Việt THCS',
    classId: 'c-9a1',
    topic: 'Chủ đề: Chuyên đề ôn tập tích hợp',
    objectives: 'Hệ thống hóa các kiểu câu, thành phần biệt lập, các phép liên kết câu và đoạn văn.',
    summary: 'Giải đề luyện tập nhanh dạng trắc nghiệm và câu hỏi tự luận ngắn.',
    teachDate: '2026-09-25',
    status: 'Chưa dạy'
  }
];

export const initialTasks: LearningTask[] = [
  {
    id: 't-01',
    title: 'Tìm 3 ví dụ về biện pháp so sánh trong văn bản đã học',
    classId: 'c-6a1',
    lessonId: 'l-01',
    description: 'Chỉ rõ vế A, vế B, từ so sánh và nêu ngắn gọn tác dụng của từng hình ảnh so sánh.',
    dueDate: '2026-09-19',
    priority: 'Bình thường',
    status: 'Đang thực hiện',
    completedStudentIds: ['s-601', 's-602', 's-604', 's-606']
  },
  {
    id: 't-02',
    title: 'Viết đoạn văn ngắn 5-7 câu nêu cảm nghĩ về nhân vật',
    classId: 'c-6a1',
    lessonId: 'l-01',
    description: 'Chú ý dung lượng đoạn văn, không mắc lỗi chính tả và có sử dụng ít nhất một câu cảm thán.',
    dueDate: '2026-09-20',
    priority: 'Quan trọng',
    status: 'Đã giao',
    completedStudentIds: ['s-602', 's-604']
  },
  {
    id: 't-03',
    title: 'Chuẩn bị dàn ý bài nói thuyết trình 3 phút',
    classId: 'c-7a1',
    lessonId: 'l-04',
    description: 'Chọn 1 chủ đề: Tình bạn tuổi học trò, Thói quen đọc sách mỗi ngày, hoặc Bảo vệ cây xanh.',
    dueDate: '2026-09-19',
    priority: 'Quan trọng',
    status: 'Đang thực hiện',
    completedStudentIds: ['s-701', 's-702', 's-704', 's-705']
  },
  {
    id: 't-04',
    title: 'Sưu tầm 2 dẫn chứng thực tế cho bài văn nghị luận',
    classId: 'c-8a1',
    lessonId: 'l-05',
    description: 'Dẫn chứng người thật việc thật gần gũi với lứa tuổi học sinh, kèm nguồn tin cậy.',
    dueDate: '2026-09-21',
    priority: 'Khẩn cấp',
    status: 'Đã giao',
    completedStudentIds: ['s-801', 's-802', 's-804']
  },
  {
    id: 't-05',
    title: 'Hoàn thành phiếu học tập: Sơ đồ tư duy phẩm chất nhân vật',
    classId: 'c-9a1',
    lessonId: 'l-06',
    description: 'Vẽ sơ đồ tư duy tóm tắt tính cách, lời thoại tiêu biểu và biến chuyển tâm trạng của nhân vật.',
    dueDate: '2026-09-18',
    priority: 'Quan trọng',
    status: 'Đã hoàn thành',
    completedStudentIds: ['s-901', 's-902', 's-903', 's-904', 's-905']
  },
  {
    id: 't-06',
    title: 'Đọc trước bài ôn tập Tiếng Việt trang 45',
    classId: 'c-9a1',
    lessonId: 'l-07',
    description: 'Gạch chân các thuật ngữ ngữ pháp cần giải đáp thêm trong tiết học tới.',
    dueDate: '2026-09-24',
    priority: 'Bình thường',
    status: 'Chưa giao',
    completedStudentIds: []
  }
];

export const initialGrades: GradeEntry[] = [
  // Lớp 6A1
  { id: 'g-01', studentId: 's-601', classId: 'c-6a1', activityTitle: 'Kiểm tra đọc hiểu văn bản', score: 8.5, date: '2026-09-15', note: 'Trả lời đủ ý, trình bày sạch sẽ' },
  { id: 'g-02', studentId: 's-602', classId: 'c-6a1', activityTitle: 'Kiểm tra đọc hiểu văn bản', score: 9.0, date: '2026-09-15', note: 'Cảm thụ tinh tế, diễn đạt giàu hình ảnh' },
  { id: 'g-03', studentId: 's-603', classId: 'c-6a1', activityTitle: 'Kiểm tra đọc hiểu văn bản', score: 6.0, date: '2026-09-15', note: 'Chưa trả lời hết câu hỏi số 3' },
  { id: 'g-04', studentId: 's-604', classId: 'c-6a1', activityTitle: 'Kiểm tra đọc hiểu văn bản', score: 8.0, date: '2026-09-15', note: 'Nắm chắc kiến thức cơ bản' },
  { id: 'g-05', studentId: 's-605', classId: 'c-6a1', activityTitle: 'Kiểm tra đọc hiểu văn bản', score: 5.5, date: '2026-09-15', note: 'Cần chú ý cẩn thận khi đọc yêu cầu đề' },
  { id: 'g-06', studentId: 's-606', classId: 'c-6a1', activityTitle: 'Kiểm tra đọc hiểu văn bản', score: 8.5, date: '2026-09-15', note: 'Lời văn mạch lạc, tự nhiên' },

  // Lớp 7A1
  { id: 'g-07', studentId: 's-701', classId: 'c-7a1', activityTitle: 'Bài viết đoạn văn cảm thụ', score: 8.0, date: '2026-09-14', note: 'Dẫn chứng thơ hợp lý' },
  { id: 'g-08', studentId: 's-702', classId: 'c-7a1', activityTitle: 'Bài viết đoạn văn cảm thụ', score: 8.5, date: '2026-09-14', note: 'Cảm xúc mượt mà, sâu lắng' },
  { id: 'g-09', studentId: 's-703', classId: 'c-7a1', activityTitle: 'Bài viết đoạn văn cảm thụ', score: 6.0, date: '2026-09-14', note: 'Đoạn văn còn ngắn, cần bổ sung luận cứ' },
  { id: 'g-10', studentId: 's-704', classId: 'c-7a1', activityTitle: 'Bài viết đoạn văn cảm thụ', score: 9.0, date: '2026-09-14', note: 'Ý tưởng sáng tạo, từ ngữ trau chuốt' },
  { id: 'g-11', studentId: 's-705', classId: 'c-7a1', activityTitle: 'Bài viết đoạn văn cảm thụ', score: 7.5, date: '2026-09-14', note: 'Bài làm đúng trọng tâm' },

  // Lớp 8A1
  { id: 'g-12', studentId: 's-801', classId: 'c-8a1', activityTitle: 'Kiểm tra 15 phút: Luận điểm nghị luận', score: 8.5, date: '2026-09-16', note: 'Lập luận chặt chẽ' },
  { id: 'g-13', studentId: 's-802', classId: 'c-8a1', activityTitle: 'Kiểm tra 15 phút: Luận điểm nghị luận', score: 8.5, date: '2026-09-16', note: 'Phân tích dẫn chứng tốt' },
  { id: 'g-14', studentId: 's-803', classId: 'c-8a1', activityTitle: 'Kiểm tra 15 phút: Luận điểm nghị luận', score: 7.0, date: '2026-09-16', note: 'Còn lặp ý ở câu kết' },
  { id: 'g-15', studentId: 's-804', classId: 'c-8a1', activityTitle: 'Kiểm tra 15 phút: Luận điểm nghị luận', score: 9.0, date: '2026-09-16', note: 'Rất thuyết phục, có dẫn chứng thực tiễn' },
  { id: 'g-16', studentId: 's-805', classId: 'c-8a1', activityTitle: 'Kiểm tra 15 phút: Luận điểm nghị luận', score: 7.5, date: '2026-09-16', note: 'Có cố gắng, cải thiện rõ rệt' },

  // Lớp 9A1
  { id: 'g-17', studentId: 's-901', classId: 'c-9a1', activityTitle: 'Phân tích nhân vật văn học', score: 9.5, date: '2026-09-17', note: 'Bài văn toàn diện, tư duy chiều sâu xuất sắc' },
  { id: 'g-18', studentId: 's-902', classId: 'c-9a1', activityTitle: 'Phân tích nhân vật văn học', score: 6.5, date: '2026-09-17', note: 'Cần phân tích kỹ hơn tâm trạng nhân vật' },
  { id: 'g-19', studentId: 's-903', classId: 'c-9a1', activityTitle: 'Phân tích nhân vật văn học', score: 9.0, date: '2026-09-17', note: 'Chất văn tự nhiên, góc nhìn tinh tế' },
  { id: 'g-20', studentId: 's-904', classId: 'c-9a1', activityTitle: 'Phân tích nhân vật văn học', score: 8.0, date: '2026-09-17', note: 'Ý tứ mạch lạc, đúng yêu cầu' },
  { id: 'g-21', studentId: 's-905', classId: 'c-9a1', activityTitle: 'Phân tích nhân vật văn học', score: 8.5, date: '2026-09-17', note: 'Bố cục cân đối, chữ rõ đẹp' }
];

export const initialComments: StudentComment[] = [
  {
    id: 'cm-01',
    studentId: 's-601',
    classId: 'c-6a1',
    date: '2026-09-16',
    content: 'Đọc diễn cảm rất truyền cảm, giọng to rõ, biết nhấn giọng đúng trọng tâm bài văn.',
    skillCategory: 'Nói & Nghe',
    note: 'Đề xuất cử tham gia nhóm đọc mẫu của khối 6'
  },
  {
    id: 'cm-02',
    studentId: 's-603',
    classId: 'c-6a1',
    date: '2026-09-17',
    content: 'Em nắm được ý chính nhưng tốc độ ghi bài còn chậm, đôi chỗ viết tắt chưa chuẩn.',
    skillCategory: 'Viết bài',
    note: 'Thầy đã nhắc nhở ngồi gần bàn đầu để quan sát bảng tốt hơn'
  },
  {
    id: 'cm-03',
    studentId: 's-704',
    classId: 'c-7a1',
    date: '2026-09-15',
    content: 'Thuyết trình tự tin, tương tác ánh mắt với cả lớp tốt, bài chuẩn bị có hình ảnh minh họa sinh động.',
    skillCategory: 'Nói & Nghe',
    note: 'Khen ngợi trước lớp để khích lệ tinh thần'
  },
  {
    id: 'cm-04',
    studentId: 's-801',
    classId: 'c-8a1',
    date: '2026-09-16',
    content: 'Có khả năng phản biện văn học rất tốt, đặt ra các câu hỏi mở thú vị trong giờ thảo luận.',
    skillCategory: 'Đọc hiểu',
    note: 'Nên khuyến khích đọc thêm tài liệu tham khảo'
  },
  {
    id: 'cm-05',
    studentId: 's-902',
    classId: 'c-9a1',
    date: '2026-09-17',
    content: 'Cần dành thêm thời gian luyện viết đoạn phân tích diễn biến tâm lý, tránh kể lể cốt truyện thuần túy.',
    skillCategory: 'Viết bài',
    note: 'Thầy đã hướng dẫn mẫu phân tích mẫu trong giờ phụ đạo'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'act-01', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), type: 'grade', action: 'Đã cập nhật điểm bài "Phân tích nhân vật văn học" lớp 9A1' },
  { id: 'act-02', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'task', action: 'Đã giao nhiệm vụ mới: "Sưu tầm dẫn chứng nghị luận" cho lớp 8A1' },
  { id: 'act-03', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), type: 'lesson', action: 'Đã cập nhật trạng thái bài học Tiếng Việt lớp 6A1 sang "Đang dạy"' },
  { id: 'act-04', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), type: 'comment', action: 'Đã thêm nhận xét rèn luyện kỹ năng cho học sinh Lê Minh Đức' },
  { id: 'act-05', timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(), type: 'student', action: 'Đã kiểm tra và đồng bộ danh sách học sinh khối THCS' }
];

export const initialAppData: AppData = {
  classes: initialClasses,
  students: initialStudents,
  lessons: initialLessons,
  tasks: initialTasks,
  grades: initialGrades,
  comments: initialComments,
  activityLogs: initialActivityLogs,
  soundEnabled: false // Âm thanh tắt mặc định theo đúng yêu cầu đề bài
};

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/exam-results/section/:sectionId",
      handler: "custom-exam-result.findBySection",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/sections/:sectionId/input-scores",
      handler: "custom-exam-result.inputScores",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/students/:id/semesters",
      handler: "custom-exam-result.getStudentScoresBySemester",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
    {
      method: "GET",
      path: "/students/:studentId/schedule/:semesterId",
      handler: "custom-exam-result.getSchedule",
      config: {
        auth: false, // Tùy chọn bật xác thực
      },
    },
    {
      method: "GET",
      path: "/teachers/:teacherId/schedule/:semesterId",
      handler: "custom-exam-result.getScheduleOfTeacher",
      config: {
        auth: false, // Tùy chọn bật xác thực
      },
    },
    {
      method: "GET",
      path: "/exams/upcoming/:studentId",
      handler: "custom-exam-result.getUpcomingExams",
      config: {
        auth: false, // Thay đổi nếu cần bảo mật
      },
    },
  ],
};

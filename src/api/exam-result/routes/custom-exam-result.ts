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
  ],
};

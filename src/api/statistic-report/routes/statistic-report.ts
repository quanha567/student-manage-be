export default {
  routes: [
    {
      method: "GET",
      path: "/summary-report",
      handler: "statistic-report.summaryReport",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gender-report",
      handler: "statistic-report.genderRatio",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/number-student-report",
      handler: "statistic-report.reportStudentsByClass",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

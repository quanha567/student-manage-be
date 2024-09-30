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
  ],
};

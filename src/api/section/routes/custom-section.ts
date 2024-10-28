module.exports = {
  routes: [
    {
      method: "GET",
      path: "/sections/get-point-detail/:id",
      handler: "custom-section.getListPointBySectionId",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/sections/input-point/:id",
      handler: "custom-section.inputStudentPoint",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

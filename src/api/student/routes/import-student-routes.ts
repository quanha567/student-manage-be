module.exports = {
  routes: [
    {
      method: "POST",
      path: "/students/import",
      handler: "import-student.importStudentList",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/students/my-score/:id",
      handler: "import-student.getMyScore",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

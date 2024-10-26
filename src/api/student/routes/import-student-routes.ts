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
  ],
};

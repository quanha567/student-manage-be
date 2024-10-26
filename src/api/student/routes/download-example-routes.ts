export default {
  routes: [
    {
      method: "GET",
      path: "/students/download-example",
      handler: "import-student.downloadExample",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

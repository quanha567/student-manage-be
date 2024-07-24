export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "POST",
      path: "/students/login",
      handler: "api::student.student.login",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

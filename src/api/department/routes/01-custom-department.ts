export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "DELETE",
      path: "/departments/delete-multiple",
      handler: "department.deleteByIds",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

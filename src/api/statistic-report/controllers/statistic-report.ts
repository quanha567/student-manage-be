/**
 * A set of functions called "actions" for `statistic-report`
 */

export default {
  summaryReport: async (ctx, next) => {
    try {
      const [studentCount, teacherCount, classCount, departmentCount] =
        await Promise.all([
          strapi.entityService.count("api::student.student"),
          strapi.entityService.count("api::teacher.teacher"),
          strapi.entityService.count("api::class.class"),
          strapi.entityService.count("api::department.department"),
        ]);

      return {
        studentCount,
        teacherCount,
        classCount,
        departmentCount,
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        message: "An error occurred while fetching statistics",
        error: err.message,
      };
    }
  },
};

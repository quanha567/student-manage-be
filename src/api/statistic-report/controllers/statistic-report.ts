/**
 * A set of functions called "actions" for `statistic-report`
 */

const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
    borderColor: `rgb(${r}, ${g}, ${b})`,
  };
};

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
  async genderRatio(ctx) {
    try {
      // Query the count of each gender from the student collection
      const maleCount = await strapi.db.query("api::student.student").count({
        where: { gender: "MALE" },
      });
      const femaleCount = await strapi.db.query("api::student.student").count({
        where: { gender: "FEMALE" },
      });
      const otherCount = await strapi.db.query("api::student.student").count({
        where: { gender: "OTHER" },
      });

      // Calculate total students
      const total = maleCount + femaleCount + otherCount;

      // Calculate the gender ratios as percentages
      const maleRatio = total > 0 ? (maleCount / total) * 100 : 0;
      const femaleRatio = total > 0 ? (femaleCount / total) * 100 : 0;
      const otherRatio = total > 0 ? (otherCount / total) * 100 : 0;

      // Return response with the ratios
      return ctx.send({
        labels: ["Nam", "Nữ", "Khác"],
        data: [
          maleRatio.toFixed(2),
          femaleRatio.toFixed(2),
          otherRatio.toFixed(2),
        ],
      });
    } catch (error) {
      ctx.throw(500, "An error occurred while calculating gender ratios.");
    }
  },
  async reportStudentsByClass(ctx) {
    try {
      // Query all classes with related students
      const classes = await strapi.db.query("api::class.class").findMany({
        populate: ["students"],
      });

      // Map the data to the desired structure
      const labels = classes.map((classItem) => classItem.className);
      const data = classes.map((classItem) => classItem.students.length);
      const colors = classes.map(() => generateRandomColor());
      const backgroundColor = colors.map((color) => color.backgroundColor);
      const borderColor = colors.map((color) => color.borderColor);

      return ctx.send({
        labels,
        data,
        backgroundColor,
        borderColor,
      });
    } catch (error) {
      ctx.throw(500, "An error occurred while generating the class report.");
    }
  },
};

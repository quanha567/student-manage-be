import { Context } from "koa";

module.exports = {
  async getListPointBySectionId(ctx: Context) {
    const { id } = ctx.request.params;

    if (!id) return ctx.badRequest("Section id is required!");

    const section = await strapi.query("api::section.section").findOne({
      where: { id },
      populate: ["deep"],
    });

    const examResults = await strapi
      .query("api::exam-result.exam-result")
      .findMany({
        populate: ["deep"],
      });

    if (!section) return ctx.notFound();

    const students =
      Array.isArray(section?.enrollments) && section.enrollments.length > 0
        ? section.enrollments.map((enrollment) => enrollment.student)
        : [];

    const exams = section?.course?.exams || [];
    const data = students.map((student, index) => {
      // Map exam scores and merge them into one object per student
      const studentExams = exams.map((exam) => {
        const targetPoint = examResults.find(
          (result) =>
            result?.student?.id === student?.id && result?.exam?.id === exam?.id
        );

        return { [`${index}-${exam.id}`]: targetPoint?.score || null };
      });

      // Combine fullName and exam results into a single object for each student
      return studentExams.reduce(
        (acc, exam) => {
          return { ...acc, ...exam };
        },
        { ...student }
      );
    });

    return {
      exams,
      data,
    };
  },
  async inputStudentPoint(ctx: Context) {
    const { data } = ctx.request.body;

    if (Array.isArray(data) && data.length > 0) {
      const examResults = await strapi
        .query("api::exam-result.exam-result")
        .findMany({
          populate: ["deep"],
        });

      for (const studentPoint of data) {
        // Create an array of promises for each exam result
        const promises = Object.entries(studentPoint).map(
          async ([key, point]) => {
            if (
              String(key).match(/^\d+-\d+$/) &&
              !Number.isNaN(Number(point))
            ) {
              const examId = String(key).split("-")[1];

              const isExisted = examResults?.find(
                (result) =>
                  result?.student?.id === studentPoint?.id &&
                  result?.exam?.id == examId
              );

              if (isExisted) {
                return strapi.entityService.update(
                  "api::exam-result.exam-result",
                  isExisted?.id,
                  {
                    data: {
                      score: Number(point),
                    },
                  }
                );
              } else {
                return strapi.entityService.create(
                  "api::exam-result.exam-result",
                  {
                    data: {
                      student: studentPoint?.id,
                      exam: examId,
                      score: Number(point),
                    },
                  }
                );
              }
            }
          }
        );

        // Await all promises for the current studentPoint
        await Promise.all(promises);
      }
      return examResults;
    }

    return ctx.badRequest("Missing data");
  },
};

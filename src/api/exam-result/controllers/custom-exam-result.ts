function calculateGrade(finalScore) {
  if (finalScore === null) return null;
  if (finalScore >= 8.5) return "A";
  if (finalScore >= 7.0) return "B";
  if (finalScore >= 5.5) return "C";
  if (finalScore >= 4.0) return "D";
  return "F";
}

function calculateGPA(totalScore) {
  if (totalScore >= 8.5) return 4.0;
  if (totalScore >= 7.0) return 3.0;
  if (totalScore >= 5.5) return 2.0;
  if (totalScore >= 4.0) return 1.0;
  return 0.0;
}

module.exports = {
  async findBySection(ctx) {
    const { sectionId, hasPractice } = ctx.params;

    try {
      // Lấy dữ liệu lớp học
      const section = await strapi.entityService.findOne(
        "api::section.section",
        sectionId,
        {
          populate: {
            enrollments: { populate: { student: true } },
            exam_results: { populate: { student: true } },
          },
        }
      );

      if (!section) {
        return ctx.notFound("Không tìm thấy lớp học");
      }

      // Hệ số tính điểm
      const weightQT = hasPractice ? 0.4 : 0.3; // Điểm quá trình
      const weightCK = hasPractice ? 0.6 : 0.7; // Điểm cuối kỳ

      // Lấy danh sách sinh viên
      const students = section.enrollments.map(
        (enrollment) => enrollment.student
      );

      // Map kết quả điểm thi theo studentId
      const examResultsMap = new Map(
        section.exam_results.map((result) => [
          result.student.id,
          {
            ...result,
            finalScore:
              (result.scoreQT || 0) * weightQT +
              (result.scoreCK || 0) * weightCK,
          },
        ])
      );

      // Tính toán kết quả cho từng sinh viên
      const studentScores = students.map((student) => {
        const result = examResultsMap.get(student.id);

        if (result) {
          // Sinh viên có điểm
          return {
            studentId: student.id,
            studentName: student.fullName,
            studentCode: student.studentCode,
            scoreQT: result.scoreQT,
            scoreGK: result.scoreGK,
            scoreTH: result.scoreTH,
            scoreCK: result.scoreCK,
            finalScore: parseFloat(result.finalScore.toFixed(1)), // Làm tròn đến 1 chữ số thập phân
            grade: calculateGrade(result.finalScore), // Xếp loại
            note: result.note,
          };
        } else {
          // Sinh viên chưa có điểm
          return {
            studentId: student.id,
            studentName: student.fullName,
            studentCode: student.studentCode,
            scoreQT: null,
            scoreGK: null,
            scoreTH: null,
            scoreCK: null,
            finalScore: null,
            grade: null,
            note: null,
          };
        }
      });

      // Tổng hợp thông tin lớp học
      const totalStudents = students.length;
      const passedStudents = studentScores.filter(
        (s) => s.finalScore !== null && s.finalScore >= 4
      ).length;
      const failedStudents = studentScores.filter(
        (s) => s.finalScore !== null && s.finalScore < 4
      ).length;

      const passPercentage =
        ((passedStudents / totalStudents) * 100).toFixed(1) + "%";
      const failPercentage =
        ((failedStudents / totalStudents) * 100).toFixed(1) + "%";

      // Trả về kết quả
      return ctx.send({
        sectionId: section.id,
        sectionName: section.code,
        totalStudents,
        passedStudents,
        failedStudents,
        passPercentage,
        failPercentage,
        studentScores,
      });
    } catch (error) {
      strapi.log.error("Lỗi trong findBySection:", error);
      return ctx.internalServerError("Có lỗi xảy ra khi xử lý yêu cầu");
    }
  },
  async inputScores(ctx) {
    const { sectionId } = ctx.params;
    const { studentScores } = ctx.request.body;

    if (!sectionId || !studentScores) {
      return ctx.badRequest("sectionId and studentScores are required");
    }

    try {
      const section = await strapi.entityService.findOne(
        "api::section.section",
        sectionId,
        {
          populate: { exam_results: { populate: { student: true } } },
        }
      );

      if (!section) {
        return ctx.notFound("Section not found");
      }

      // Map existing exam results by student ID for quick lookup
      const existingExamResults = new Map(
        section.exam_results.map((result) => [result.student.id, result])
      );

      // Iterate over studentScores to update or create exam results
      const operations = studentScores.map(async (studentScore) => {
        const {
          studentId,
          scoreQT,
          scoreGK,
          scoreTH,
          scoreCK,
          note = "",
        } = studentScore;

        if (existingExamResults.has(studentId)) {
          // Update existing exam result
          const existingResult = existingExamResults.get(studentId);
          return await strapi.entityService.update(
            "api::exam-result.exam-result",
            existingResult.id,
            {
              data: {
                scoreQT,
                scoreGK,
                scoreTH,
                scoreCK,
                note,
              },
            }
          );
        } else {
          // Create a new exam result
          return await strapi.entityService.create(
            "api::exam-result.exam-result",
            {
              data: {
                student: studentId,
                section: sectionId,
                scoreQT,
                scoreGK,
                scoreTH,
                scoreCK,
                note,
              },
            }
          );
        }
      });

      // Execute all update/create operations
      await Promise.all(operations);

      return ctx.send({ message: "Scores have been successfully processed." });
    } catch (error) {
      strapi.log.error("Error processing scores:", error);
      return ctx.internalServerError(
        "An error occurred while processing scores."
      );
    }
  },

  async getStudentScoresBySemester(ctx) {
    const { id } = ctx.params; // Get student ID from the route parameters

    try {
      // Fetch the student with all relevant relations
      const student = await strapi.entityService.findOne(
        "api::student.student",
        id,
        {
          populate: {
            enrollments: {
              populate: {
                section: {
                  populate: {
                    course: {
                      populate: {
                        semester: true,
                        subject: true,
                      },
                    },
                    teacher: true,
                    exam_results: true,
                  },
                },
              },
            },
          },
        }
      );

      if (!student) {
        return ctx.notFound("Student not found");
      }

      // Prepare grouped scores by semester
      const semestersMap = {};

      student.enrollments.forEach((enrollment) => {
        const section = enrollment.section;
        const course = section?.course;
        const semester = course?.semester;

        if (!semester) return;

        const semesterKey = semester.id;

        // Initialize semester entry if not already present
        if (!semestersMap[semesterKey]) {
          semestersMap[semesterKey] = {
            semesterId: semester.id,
            semesterName: semester.name,
            startDate: semester.startDate,
            endDate: semester.endDate,
            totalCredits: 0,
            courses: [],
          };
        }

        // Filter exam results for the current student
        const examResults = section.exam_results;

        if (!examResults.length) return;

        // Process each exam result
        examResults.forEach((result) => {
          const totalScore = (
            (result.scoreQT || 0) * 0.3 +
            (result.scoreGK || 0) * 0.2 +
            (result.scoreTH || 0) * 0.2 +
            (result.scoreCK || 0) * 0.3
          ).toFixed(2);

          semestersMap[semesterKey].courses.push({
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            sectionCode: section.code,
            classroom: section.classroom,
            teacher: section.teacher?.fullName,
            subjectName: course.subject?.name,
            credits: course.credits,
            scoreQT: result.scoreQT,
            scoreGK: result.scoreGK,
            scoreTH: result.scoreTH,
            scoreCK: result.scoreCK,
            totalScore,
            gpaScore: calculateGPA(Number(totalScore)),
            remarks: Number(totalScore) >= 4 ? "Đạt" : "Không đạt",
          });

          // Update total credits for the semester
          semestersMap[semesterKey].totalCredits += course.credits;
        });
      });

      // Calculate GPA average for each semester
      const groupedSemesters = Object.values(semestersMap).map(
        (semester: any) => {
          const gpaSum = semester.courses.reduce(
            (sum: number, course: any) => sum + course.gpaScore,
            0
          );
          semester.gpaAverage = (gpaSum / semester.courses.length || 0).toFixed(
            2
          );
          return semester;
        }
      );

      // Format the final response
      const response = {
        studentName: student.fullName,
        studentCode: student.studentCode,
        groupedScores: groupedSemesters,
      };

      return ctx.send(response);
    } catch (error) {
      console.error(error);
      return ctx.internalServerError("An error occurred");
    }
  },
  async getSchedule(ctx) {
    const { studentId, semesterId } = ctx.params;

    if (!studentId || !semesterId) {
      return ctx.badRequest("Missing studentId or semesterId");
    }

    try {
      // Fetch enrollments for the given student and semester
      const enrollments = await strapi.db
        .query("api::enrollment.enrollment")
        .findMany({
          where: {
            student: studentId,
            section: {
              course: {
                semester: semesterId,
              },
            },
          },
          populate: {
            section: {
              populate: {
                course: true,
                teacher: true,
                schedules: {
                  populate: {
                    room: true, // Populate room directly here
                  },
                },
              },
            },
          },
        });

      // Construct the schedule
      const schedule = enrollments.flatMap((enrollment) => {
        const section = enrollment.section;
        return section.schedules.map((schedule) => ({
          courseName: section.course.name || null,
          courseCode: section.course.code || null,
          teacherName: section.teacher ? section.teacher.fullName : "N/A",
          day: schedule.day || null,
          startTime: schedule.startTime || null,
          endTime: schedule.endTime || null,
          room: schedule.room ? schedule.room.name : "N/A",
          courseStartTime: section.course.startDate || null,
          courseEndTime: section.course.endDate || null,
        }));
      });

      return ctx.send(schedule);
    } catch (error) {
      console.error("Error retrieving schedule:", error);
      return ctx.internalServerError("Error retrieving schedule", error);
    }
  },
  async getUpcomingExams(ctx) {
    const { studentId } = ctx.params;

    if (!studentId) {
      return ctx.badRequest("Student ID is required");
    }

    try {
      // Tìm các section mà sinh viên đã đăng ký
      const enrollments = await strapi.entityService.findMany(
        "api::enrollment.enrollment",
        {
          filters: {
            student: studentId,
          },
          populate: { section: true }, // Populate để lấy thông tin section
        }
      );

      if (!enrollments || enrollments.length === 0) {
        return ctx.notFound("No enrollments found for this student");
      }

      // Lấy danh sách ID các sections
      const sectionIds = enrollments.map((enrollment) => enrollment.section.id);

      // Tìm các kỳ thi sắp tới thuộc các sections đó
      const now = new Date();
      const exams = await strapi.entityService.findMany("api::exam.exam", {
        filters: {
          course: {
            sections: { id: { $in: sectionIds } }, // Lọc theo sections
          },
          examDate: { $gt: now.toISOString() }, // Chỉ lấy kỳ thi trong tương lai
        },
        populate: { course: true }, // Populate để lấy thông tin khóa học
        sort: { examDate: "asc" }, // Sắp xếp theo thời gian tăng dần
      });

      return ctx.send({ exams });
    } catch (error) {
      strapi.log.error("Error fetching upcoming exams:", error);
      return ctx.internalServerError("Something went wrong");
    }
  },
};

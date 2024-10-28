import * as fs from "fs";
import { Context } from "koa";
import * as xlsx from "xlsx";

interface StudentData {
  fullName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  phoneNumber?: string;
  className: string;
}

module.exports = {
  async importStudentList(ctx: Context) {
    try {
      // Access the file uploaded via form data
      const { files } = ctx.request.files as { files?: { path: string } };

      if (!files) {
        return ctx.throw(400, "No file provided");
      }

      const file = files;

      if (!file || !file.path) {
        return ctx.throw(400, "No file provided 1");
      }

      const filePath = file.path;
      if (!fs.existsSync(filePath)) {
        return ctx.throw(400, "File path is invalid");
      }

      // Read and parse the Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const studentDataArray: StudentData[] =
        xlsx.utils.sheet_to_json(worksheet);

      // Loop through each student entry
      for (const data of studentDataArray) {
        // Check if the class already exists
        let classRecord = await strapi.entityService
          .findMany("api::class.class", {
            filters: { className: data.className },
            limit: 1,
          })
          .then((results) => results[0]);

        // Create the class if it doesn't exist
        if (!classRecord) {
          classRecord = await strapi.entityService.create("api::class.class", {
            data: {
              className: data.className,
              // Include additional fields as needed
            },
          });
        }

        // Create a new student record and associate it with the class
        await strapi.entityService.create("api::student.student", {
          data: {
            fullName: data.fullName,
            // dateOfBirth: data.dateOfBirth
            //   ? moment(data.dateOfBirth, "dd/MM/yyyy").format("YYYY-MM-DD")
            //   : undefined,
            gender: data.gender,
            address: data.address,
            phoneNumber: String(data.phoneNumber),
            class: classRecord.id, // Associate with the class ID
            // Add any additional fields if needed
          },
        });
      }

      ctx.send({ message: "Student list imported successfully" });
    } catch (error) {
      console.error(error);
      ctx.throw(500, "Failed to import student list");
    }
  },
  async downloadExample(ctx: Context) {
    try {
      // Example data
      const students = [
        {
          fullName: "Nguyễn Văn A",
          dateOfBirth: "16/11/2000",
          gender: "MALE",
          address: "123 Main St",
          phoneNumber: "1234567890",
          className: "CNTT05",
        },
        {
          fullName: "Nguyễn Văn B",
          dateOfBirth: "2/2/2000",
          gender: "FEMALE",
          address: "456 Elm St",
          phoneNumber: "987654321",
          className: "CNTT05",
        },
      ];

      // Convert JSON data to worksheet
      const worksheet = xlsx.utils.json_to_sheet(students);

      // Create a new workbook and append the worksheet
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Students");

      // Generate buffer from workbook
      const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

      // Set response headers for file download
      ctx.set("Content-Disposition", 'attachment; filename="students.xlsx"');
      ctx.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      // Send the buffer as the response
      ctx.body = buffer;
    } catch (error) {
      ctx.throw(500, "An error occurred while generating the Excel file.");
    }
  },
  async getMyScore(ctx: Context) {
    try {
      const { id } = ctx.request.params;

      if (!id) return ctx.badRequest();

      const examResults = await strapi
        .query("api::exam-result.exam-result")
        .findMany({
          where: {
            student: {
              id,
            },
          },
          populate: ["deep"],
        });

      const transformedData = [];

      examResults.forEach((result) => {
        const courseName = result.exam.course.name;
        const examName = result.exam.examName;
        const score = result.score;

        // Tìm xem subjectName đã tồn tại trong transformedData chưa
        let subject = transformedData.find(
          (item) => item.subjectName === courseName
        );

        // Nếu chưa tồn tại, tạo mới
        if (!subject) {
          subject = {
            subjectName: courseName,
            scores: [],
          };
          transformedData.push(subject);
        }

        // Thêm điểm vào scores
        subject.scores.push({
          name: examName,
          score: score,
        });
      });

      return transformedData;
    } catch (error) {
      ctx.throw(500, "An error occurred while generating the Excel file.");
    }
  },
};

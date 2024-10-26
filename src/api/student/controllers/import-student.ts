import { Context } from "koa";
import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";
import moment from "moment";

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
      // Define the file path
      const filePath = path.resolve(
        __dirname,
        "../../../../public/example.xlsx"
      );
      console.log("downloadExample  filePath:", filePath);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        ctx.throw(404, "Example file not found");
      }

      // Set headers for file download
      ctx.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      ctx.set("Content-Disposition", 'attachment; filename="example.xlsx"');

      // Send the file as response
      ctx.body = fs.createReadStream(filePath);
    } catch (error) {
      console.error(error);
      ctx.throw(500, "Failed to download example file");
    }
  },
};

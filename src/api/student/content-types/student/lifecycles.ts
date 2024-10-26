export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Get the last entry for studentCode
    const lastEntry = await strapi.entityService.findMany(
      "api::student.student",
      {
        sort: { studentCode: "desc" },
        limit: 1,
      }
    );

    // Determine the new studentCode value
    let newID = "0000000001";
    if (lastEntry.length > 0) {
      const lastID = parseInt(lastEntry[0].studentCode, 10);
      newID = String(lastID + 1).padStart(10, "0");
    }

    // Set the new studentCode value
    data.studentCode = newID;

    // Create email from studentCode
    const email = `${newID}@stu.vlu.edu.vn`;

    // Create a new user associated with this student
    const newUser = await strapi.plugins["users-permissions"].services.user.add(
      {
        username: email,
        email: email,
        password: "000000", // You should generate a secure password or allow the user to set it
        confirmed: true,
        blocked: false,
        provider: "local", // Ensure provider is set to 'local'
      }
    );

    // Assign the new user's ID to the student
    data.user = newUser.id;
    data.email = email; // Optionally set the email field in student to this email

    const role = await strapi.query("plugin::users-permissions.role").findOne({
      where: { type: "student" },
    });

    console.log(role);

    if (role) {
      // Update user to include 'Sinh viên' role
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: newUser.id },
        data: {
          role: role.id, // Add the 'Sinh viên' role to existing roles
        },
      });
    } else {
      console.error('Role "Sinh viên" not found');
    }
  },
  async beforeDelete(event) {
    const { id } = event.params.where;

    if (!id) {
      console.error("No ID provided to beforeDelete");
      return;
    }

    try {
      // Find the student by ID
      const student = await strapi.entityService.findOne(
        "api::student.student",
        id,
        {
          populate: ["user"], // Populate the user relation
        }
      );

      // Check if the student has an associated user
      if (student.user) {
        // Delete the associated user
        await strapi.entityService.delete(
          "plugin::users-permissions.user",
          student.user.id
        );
      }
    } catch (error) {
      console.error("Error deleting user associated with student:", error);
    }
  },
};

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    // Get the last entry for teacherCode
    const lastEntry = await strapi.entityService.findMany(
      "api::teacher.teacher",
      {
        sort: { teacherCode: "desc" },
        limit: 1,
      }
    );
    // Determine the new teacherCode value
    let newID = "0000000001";
    if (lastEntry.length > 0) {
      const lastID = parseInt(lastEntry[0].teacherCode, 10);
      newID = String(lastID + 1).padStart(10, "0");
    }
    // Set the new teacherCode value
    data.teacherCode = newID;
    // Create email from teacherCode
    const email = `${newID}@teacher.vlu.edu.vn`;
    // Create a new user associated with this teacher
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
    // Assign the new user's ID to the teacher
    data.user = newUser.id;
    data.email = email; // Optionally set the email field in teacher to this email
    const role = await strapi.query("plugin::users-permissions.role").findOne({
      where: { type: "teacher" },
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
};

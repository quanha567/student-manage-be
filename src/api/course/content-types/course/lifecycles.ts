export default {
  async beforeCreate(event) {
    const { data } = event.params;

    const lastEntry = await strapi.entityService.findMany(
      "api::course.course",
      {
        sort: { code: "desc" },
        limit: 1,
      }
    );

    let newCode = "0000000001";
    if (lastEntry.length > 0) {
      const lastID = parseInt(lastEntry[0].code, 10);
      newCode = String(lastID + 1).padStart(10, "0");
    }

    data.code = newCode;
  },
};

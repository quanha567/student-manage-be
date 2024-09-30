export default {
  async beforeCreate(event) {
    try {
      const { data } = event.params;
      const CODE_LENGTH = 6;

      const lastEntry = await strapi.entityService.findMany(
        "api::subject.subject",
        {
          sort: { code: "desc" },
          limit: 1,
        }
      );

      let newCode = String(1).padStart(CODE_LENGTH, "0");

      if (lastEntry.length > 0) {
        const lastID = parseInt(lastEntry[0].code, 10);
        newCode = String(lastID + 1).padStart(CODE_LENGTH, "0");
      }

      data.code = newCode;
    } catch (err) {
      console.log(err);
    }
  },
};

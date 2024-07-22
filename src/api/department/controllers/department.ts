/**
 * department controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::department.department",
  ({ strapi }) => ({
    async deleteByIds(ctx) {
      const { ids } = ctx.request.body; // Lấy danh sách IDs từ body của request
      if (!Array.isArray(ids)) {
        return ctx.badRequest("Ids should be an array");
      }

      try {
        // Sử dụng lệnh xóa nhiều bản ghi
        await strapi.db.query("api::department.department").deleteMany({
          where: { id: { $in: ids } },
        });
        ctx.body = { message: "Departments deleted successfully" };
      } catch (error) {
        ctx.throw(500, "Failed to delete departments");
      }
    },
  })
);

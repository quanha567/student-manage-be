/**
 * student controller
 */

import { factories } from "@strapi/strapi";
import { sanitize } from "@strapi/utils";
import { Context } from "koa";

interface LoginRequestBody {
  email: string;
  password: string;
}

export default factories.createCoreController(
  "api::student.student",
  ({ strapi }) => ({
    async login(ctx: Context) {
      const { email, password }: LoginRequestBody = ctx.request.body;

      console.log(email);

      if (!email || !password) {
        return ctx.badRequest("Email and password are required");
      }

      // Find the user by email
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { username: email },
          populate: ["student"],
        });

      console.log(user);

      if (!user) {
        return ctx.badRequest("Invalid email or password");
      }

      // Check if the provided password matches the stored password
      const validPassword = await strapi.plugins[
        "users-permissions"
      ].services.user.validatePassword(password, user.password);

      if (!validPassword) {
        return ctx.badRequest("Invalid email or password");
      }

      // Generate JWT token
      const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
      });

      // Sanitize the user object to remove sensitive data
      const sanitizedUser = await sanitize.contentAPI.output(
        user,
        strapi.getModel("plugin::users-permissions.user")
      );

      // Return the token and user info
      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    },
  })
);

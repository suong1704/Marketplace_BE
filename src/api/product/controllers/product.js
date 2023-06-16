"use strict";

/**
 * product controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async find(ctx) {
    try {
      const data = await strapi.service("api::product.product").find(ctx);
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
  async getProductsByCategory(ctx) {
    try {
      const data = await strapi
        .service("api::product.product")
        .getProductsByCategory(ctx);
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
  async getSpecific(ctx, next) {
    try {
      const data = await strapi
        .service("api::product.product")
        .getSpecific(ctx);

      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
  async createProduct(ctx, next) {
    try {
      const data = await strapi
        .service("api::product.product")
        .createProduct(ctx);

      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
  async editProduct(ctx, next) {
    try {
      const data = await strapi
        .service("api::product.product")
        .editProduct(ctx);

      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
  async activateSell(ctx, next) {
    try {
      const data = await strapi
        .service("api::product.product")
        .activateSell(ctx);

      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
  async archiveSell(ctx, next) {
    try {
      const data = await strapi
        .service("api::product.product")
        .archiveSell(ctx);

      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Post report controller error", { moreDetails: err });
    }
  },
}));

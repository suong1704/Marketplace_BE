"use strict";

const { create } = require("../../../../../server/models/Product");

/**
 * product router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::product.product", {
  prefix: "",
  only: ["find", "findOne", "create", "update"],
  except: [],
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    
  },
});

"use strict";

/**
 * product service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::product.product", ({ strapi }) => ({
  async find(ctx) {
    try {
      const { page, search } = ctx.query;
      let entries;
      if (search !== "" && search !== undefined) {
        entries = await strapi.db.query("api::product.product").findMany({
          where: {
            title: {
              $containsi: search,
            },
            active: true,
          },
          populate: {
            seller: {
              select: ["id"],
            },
          },
        });
      } else {
        entries = await strapi.db.query("api::product.product").findMany({
          where: {
            active: true,
          },
          populate: {
            seller: {
              select: ["id"],
            },
          },
          offset: (parseInt(page) - 1) * 5,
          limit: 5,
        });
      }
      let result;
      if (entries && Array.isArray(entries)) {
        result = entries.reduce((acc, item) => {
          acc = acc || [];
          acc.push({
            _id: String(item.id),
            likes: item.likes || [],
            category: item.category,
            title: item.title,
            price: item.price,
            description: item.description,
            city: item.city,
            active: item.active,
            image: item.image,
            addedAt: item.addedAt,
            seller: String(item.seller.id),
            description: item.description,
            __v: 0,
          });
          return acc;
        }, []);
      }
      return { products: result };
    } catch (error) {}
  },
  async getProductsByCategory(ctx) {
    try {
      const { page, search } = ctx.query;
      const { category } = ctx.params;

      let entries;
      if (search !== "" && search !== undefined) {
        entries = await strapi.db.query("api::product.product").findMany({
          where: {
            title: {
              $containsi: search,
            },
            category: category,
            active: true,
          },
          populate: {
            seller: {
              select: ["id"],
            },
          },
        });
      } else {
        entries = await strapi.db.query("api::product.product").findMany({
          where: {
            category: category,
            active: true,
          },
          populate: {
            seller: {
              select: ["id"],
            },
          },
          offset: (parseInt(page) - 1) * 5,
          limit: 5,
        });
      }
      let result;
      if (entries && Array.isArray(entries)) {
        result = entries.reduce((acc, item) => {
          acc = acc || [];

          acc.push({
            _id: String(item.id),
            likes: item.likes || [],
            category: item.category,
            title: item.title,
            price: item.price,
            description: item.description,
            city: item.city,
            active: item.active,
            image: item.image,
            addedAt: item.addedAt,
            seller: String(item.seller.id),
            description: item.description,
            __v: 0,
          });
          return acc;
        }, []);
      }
      return { products: result };
    } catch (error) {}
  },
  async getSpecific(ctx) {
    let entries = await strapi.db.query("api::product.product").findMany({
      where: { id: ctx.params.id },
      populate: {
        seller: {
          select: ["id", "avatar", "username", "phoneNumber", "email"],
          populate: {
            createdSells: {
              select: ["id"],
            },
          },
        },
        likes: {
          select: ["id"],
        },
      },
    });
    let result;
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const { id, isAdmin = false } = await strapi.plugins[
        "users-permissions"
      ].services.jwt.getToken(ctx);
      if (entries && Array.isArray(entries)) {
        result = entries.reduce((acc, item) => {
          acc = acc || [];
          let likes = [];
          item.likes.map((i) => {
            likes.push(String(i.id));
          });
          acc.push({
            _id: String(item.id),
            likes: likes,
            category: item.category || "",
            title: item.title || "",
            price: item.price || 0,
            description: item.description || "",
            city: item.city || "",
            image: item.image || "",
            addedAt: item.addedAt || "",
            seller: String(item.seller.id) || "",
            name: item.seller.username || "",
            phoneNumber: item.seller.phoneNumber || "",
            email: item.seller.email || "",
            avatar: item.seller.avatar || "",
            sellerId: item.seller.id || "",
            active: item.active,
            createdSells: item.seller.createdSells.length,
            isAuth: true,
            isSeller: item.seller.id === id ? true : false,
            isWished: likes.includes(String(id)) ? true : false,
            __v: 0,
          });
          return acc;
        }, []);
      }
    } else {
      if (entries && Array.isArray(entries)) {
        result = entries.reduce((acc, item) => {
          acc = acc || [];
          let likes = [];
          item.likes.map((i) => {
            likes.push(String(i.id));
          });
          acc.push({
            _id: String(item.id),
            likes: likes,
            category: item.category || "",
            title: item.title || "",
            price: item.price || 0,
            description: item.description || "",
            city: item.city || "",
            image: item.image || "",
            addedAt: item.addedAt || "",
            seller: String(item.seller.id) || "",
            name: item.seller.username || "",
            phoneNumber: item.seller.phoneNumber || "",
            email: item.seller.email || "",
            avatar: item.seller.avatar || "",
            sellerId: item.seller.id || "",
            active: item.active,
            createdSells: item.seller.createdSells.length,
            isAuth: false,
            __v: 0,
          });
          return acc;
        }, []);
      }
    }
    ctx.response.status = 200;
    return result[0];
  },
  async createProduct(ctx) {
    const { title, price, description, city, category, image } =
      ctx.request.body;
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      if (Date.now() < exp * 1000) {
        console.log(id);
        let errors = [];
        if (title.length < 3 || title.length > 50) {
          errors.push(
            "Title should be at least 3 characters long and max 50 characters long; "
          );
        }
        if (isNaN(Number(price))) {
          errors.push("Price should be a number; ");
        }
        if (description.length < 10 || description.length > 1000) {
          errors.push(
            "Description should be at least 10 characters long and max 1000 characters long; "
          );
        }
        if (/^[A-Za-z]+$/.test(city) == false) {
          errors.push("City should contains only english letters; ");
        }
        if (!category) {
          errors.push("Category is required; ");
        }
        if (errors.length !== 0) {
          return (ctx.body = {
            error: [errors],
          });
        } else {
          const product = await strapi.db.query("api::product.product").create({
            data: {
              ...ctx.request.body,
              price: Number(price),
              seller: Number(id),
              addedAt: new Date(),
              // image: compressedImg,
            },
          });
          ctx.response.status = 200;
          return (ctx.body = { productId: product.id });
        }
      } else {
        return (ctx.body = {
          message: "Cannot read properties of undefined (reading '_id')",
        });
      }
    } else {
      return (ctx.body = {
        message: "Cannot read properties of undefined (reading '_id')",
      });
    }
  },
  async editProduct(ctx) {
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);
      if (Date.now() < exp * 1000) {
        console.log(1, id);
        const product = await strapi.db.query("api::product.product").findOne({
          populate: {
            seller: {
              select: ["id"],
            },
          },
          where: {
            id: ctx.params.id,
          },
        });
        console.log(product);
        try {
          const { title, price, description, city, category, image } =
            ctx.request.body;
          const errors = [];
          if (String(id) !== String(product.seller.id)) {
            errors.push("You have no permission to perform this action! ");
          }
          if (title.length < 3 || title.length > 50)
            errors.push(
              "Title should be at least 3 characters long and max 50 characters long; "
            );
          if (isNaN(Number(price))) errors.push("Price should be a number; ");
          if (description.length < 10 || description.length > 1000)
            errors.push(
              "Description should be at least 10 characters long and max 1000 characters long; "
            );
          if (/^[A-Za-z]+$/.test(city) == false)
            errors.push("City should contains only english letters; ");
          if (category === "" || category == "Choose...")
            errors.push("Category is required; ");

          if (errors.length !== 0) {
            return {
              error: [errors],
            };
          } else {
            const entry = await strapi.db.query("api::product.product").update({
              where: { id: ctx.params.id },
              data: { title, price, description, city, category, image },
            });
            ctx.response.status = 200;
            return { message: "Updated!" };
          }
        } catch (error) {}
      } else {
        return (ctx.body = {
          message: "Not loged in",
        });
      }
    } else {
      return (ctx.body = {
        message: "Cannot read properties of undefined (reading '_id')",
      });
    }
  },
  async activateSell(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.db.query("api::product.product").update({
        where: { id: id },
        data: { active: true },
      });
      ctx.response.status = 200;
      return { msg: "Activated" };

      return result;
    } catch (error) {}
  },
  async archiveSell(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.db.query("api::product.product").update({
        where: { id: id },
        data: { active: false },
      });
      ctx.response.status = 200;
      return { msg: "Archived" };
    } catch (error) {}
  },
}));

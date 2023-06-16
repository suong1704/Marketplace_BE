const _ = require("lodash");

module.exports = (plugin) => {
  plugin.controllers.auth.registerUser = async (ctx) => {
    const {
      email,
      password,
      username,
      phoneNumber,
      repeatPassword,
      gender,
      lastName,
    } = ctx.request.body;
    const errors = [];
    const existingUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: email } });
    const existingUsername = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { username: username } });
    if (existingUser) {
      errors.push("This email address is already in use.");
    }
    if (existingUsername) {
      errors.push("This username is already existing.");
    }
    if (username.length < 3 || username.length > 50)
      errors.push(
        "Name should be at least 3 characters long and max 50 characters long; "
      );
    if (
      /(\+)?(359|0)8[789]\d{1}(|-| )\d{3}(|-| )\d{3}/.test(phoneNumber) == false
    )
      errors.push("Phone number should be a valid BG number; ");
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false)
      errors.push("Please fill a valid email address; ");
    if (password !== repeatPassword) errors.push("Passwords should match; ");
    if (password.length < 8)
      errors.push("Password should be at least 8 characters long; ");
    if (password.length > 20)
      errors.push("Password should be at max 20 characters long; ");

    if (errors.length !== 0) {
      return (ctx.body = {
        error: [errors],
      });
    } else {
      await strapi
        .plugin("users-permissions")
        .controllers.auth.register(ctx)
        .then(() => {});

      ctx.response.status = 200;
    }
  };
  plugin.controllers.user.getUser = async (ctx) => {
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      if (Date.now() < exp * 1000) {
        try {
          const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: id },
              populate: {
                createdSells: { select: ["id"] },
              },
            });

          ctx.body = {
            user: {
              _id: String(user.id),
              name: user.username,
              email: user.email,
              phoneNumber: user.phoneNumber,
              totalSells: user.createdSells.length,
              avatar: user.avatar,
              isMe: true,
            },
          };
          ctx.response.status = 200;
        } catch (err) {
          ctx.badRequest("Post report controller error", {
            moreDetails: err,
          });
        }
      } else {
        ctx.body = {
          message: "Not loged in",
        };
      }
    } else {
      ctx.body = {
        message: "Not loged in",
      };
    }
  };

  plugin.controllers.user.getUserById = async (ctx) => {
    console.log(ctx.request.header.authorization);
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);
      console.log(id);
      if (Date.now() < exp * 1000) {
        try {
          const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: ctx.params.id },
              populate: {
                createdSells: { select: ["id"] },
              },
            });
          (ctx.body = {
            user: {
              _id: String(user.id),
              name: user.username,
              email: user.email,
              phoneNumber: user.phoneNumber,
              totalSells: user.createdSells.length,
              avatar: user.avatar,
              isMe: id === Number(user.id) ? true : false,
            },
          }),
            (ctx.response.status = 200);
        } catch (err) {
          ctx.badRequest("Post report controller error", {
            moreDetails: err,
          });
        }
      } else {
        ctx.body = {
          message: "Not loged in",
        };
      }
    } else {
      ctx.body = {
        message: "Not loged in",
      };
    }
  };

  plugin.controllers.user.editUserProfile = async (ctx) => {
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      if (Date.now() < exp * 1000) {
        let { name, phoneNumber, email } = ctx.request.body;
        if (String(id) !== String(ctx.request.params.id)) {
          ctx.response.status = 404;
          return {
            error: `E11000 duplicate key error collection: all-for-you.users index: email_1 dup key: { email: ${email} }`,
          };
        } else {
          const errors = [];

          const checkUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({ where: { id: id } });

          if (checkUser && checkUser.id.toString() !== id.toString())
            errors.push("This email address is already in use; ");
          if (name.length < 3 || name.length > 50)
            errors.push(
              "Name should be at least 3 characters long and max 50 characters long; "
            );
          if (
            /(\+)?(359|0)8[789]\d{1}(|-| )\d{3}(|-| )\d{3}/.test(phoneNumber) ==
            false
          )
            errors.push("Phone number should be a valid BG number; ");
          if (
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false
          )
            errors.push("Please fill a valid email address; ");

          if (errors.length !== 0) {
            return (ctx.body = {
              error: [errors],
            });
          } else {
            const newUser = await strapi
              .query("plugin::users-permissions.user")
              .update({
                where: { id: id },
                data: {
                  ...ctx.request.body,
                  username: name,
                },
              });

            ctx.body = {
              message: "Updated!",
            };

            ctx.response.status = 200;
          }
        }
      } else {
        ctx.body = {
          message: "Not loged in",
        };
      }
    } else {
      ctx.body = {
        message: "Not loged in",
      };
    }
  };
  plugin.controllers.user.getUserWishlist = async (ctx) => {
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);
      if (Date.now() < exp * 1000) {
        const user = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: id },
            populate: {
              wishedProducts: {
                select: [
                  "id",
                  "active",
                  "title",
                  "price",
                  "description",
                  "city",
                  "category",
                  "image",
                  "addedAt",
                ],
                populate: {
                  likes: {
                    select: ["id"],
                  },
                  seller: {
                    select: ["id"],
                  },
                },
              },
            },
          });

        let result = [];
        if (user.wishedProducts && Array.isArray(user.wishedProducts)) {
          result = user.wishedProducts.reduce((acc, item) => {
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
              active: item.active,
              __v: 0,
            });
            return acc;
          }, []);
        }

        (ctx.body = {
          wishlist: result,
        }),
          (ctx.response.status = 200);
      } else {
        ctx.body = {
          message: "Not loged in",
        };
      }
    } else {
      ctx.body = {
        message: "Cannot read properties of undefined (reading '_id')",
      };
    }
  };
  plugin.controllers.user.getUserActiveSells = async (ctx) => {
    const { id } = ctx.params;
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: id },
        populate: {
          createdSells: {
            select: [
              "id",
              "active",
              "title",
              "price",
              "description",
              "city",
              "category",
              "image",
              "addedAt",
            ],
            where: { active: true },
            populate: {
              likes: {
                select: ["id"],
              },
              seller: {
                select: ["id"],
              },
            },
          },
        },
      });

    let result = [];
    if (user.createdSells && Array.isArray(user.createdSells)) {
      result = user.createdSells.reduce((acc, item) => {
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
          active: item.active,
          __v: 0,
        });
        return acc;
      }, []);
    }

    (ctx.body = {
      sells: result,
      user: { ...user, _id: user.id },
    }),
      (ctx.response.status = 200);
  };
  plugin.controllers.user.getUserArchivedSells = async (ctx) => {
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      const token = await strapi.db
        .query("api::block-list.block-list")
        .findOne({
          where: { token: ctx.request.header.authorization.split(" ")[1] },
          select: ["token"],
        });

      if (Date.now() < exp * 1000) {
        const user = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: id },
            populate: {
              createdSells: {
                select: [
                  "id",
                  "active",
                  "title",
                  "price",
                  "description",
                  "city",
                  "category",
                  "image",
                  "addedAt",
                ],
                where: { active: false },
                populate: {
                  likes: {
                    select: ["id"],
                  },
                  seller: {
                    select: ["id"],
                  },
                },
              },
            },
          });

        let result = [];
        if (user.createdSells && Array.isArray(user.createdSells)) {
          result = user.createdSells.reduce((acc, item) => {
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
              active: item.active,
              __v: 0,
            });
            return acc;
          }, []);
        }

        (ctx.body = {
          sells: result,
          user: { ...user, _id: user.id },
        }),
          (ctx.response.status = 200);
      } else {
        ctx.body = {
          message: "Not loged in",
        };
      }
    } else {
      ctx.body = {
        message: "Cannot read properties of undefined (reading '_id')",
      };
    }
  };
  plugin.controllers.user.wishProduct = async (ctx) => {
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const {
        id,
        isAdmin = false,
        exp,
      } = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      if (Date.now() < exp * 1000) {
        try {
          console.log(id);
          const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: id },
              populate: { wishedProducts: { select: ["id"] } },
            });
          if (
            !user.wishedProducts.find(
              (product) => product.id === Number(ctx.params.id)
            )
          ) {
            const result = await strapi.db
              .query("plugin::users-permissions.user")
              .update({
                where: { id: id },
                data: {
                  ...user,
                  wishedProducts: [
                    ...user.wishedProducts,
                    Number(ctx.params.id),
                  ],
                },
              });
            ctx.body = { msg: "wished" };
          } else {
            const result = await strapi.db
              .query("plugin::users-permissions.user")
              .update({
                where: { id: id },
                data: {
                  wishedProducts: user.wishedProducts.filter(
                    (item) => item.id !== Number(ctx.params.id)
                  ),
                },
              });
            ctx.body = { msg: "unwished" };
          }
        } catch (error) {
          ctx.body = {
            message1: error,
          };
        }
      } else {
        ctx.body = {
          message: "Not loged in",
        };
      }
    } else {
      ctx.body = {
        message: "Cannot read properties of undefined (reading '_id')",
      };
    }
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/registerUser",
    handler: "auth.registerUser",
    config: {
      prefix: "",
      policies: [],
    },
  });

  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/user/getUser",
    handler: "user.getUser",
    config: {
      prefix: "",
      policies: [],
    },
  });

  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/user/getUserById/:id",
    handler: "user.getUserById",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/user/edit-profile/:id",
    handler: "user.editUserProfile",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/wishlist/getWishlist",
    handler: "user.getUserWishlist",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/sells/active/:id",
    handler: "user.getUserActiveSells",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/sells/archived",
    handler: "user.getUserArchivedSells",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/wish/:id",
    handler: "user.wishProduct",
    config: {
      prefix: "",
      policies: [],
    },
  });
  return plugin;
};

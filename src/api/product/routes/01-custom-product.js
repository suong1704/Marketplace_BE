module.exports = {
  routes: [
    {
      method: "GET",
      path: "/products/:category",
      handler: "product.getProductsByCategory",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/products/create",
      handler: "product.createProduct",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/products/specific/:id",
      handler: "product.getSpecific",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "PATCH",
      path: "/products/edit/:id",
      handler: "product.editProduct",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/products/enable/:id",
      handler: "product.activateSell",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/products/archive/:id",
      handler: "product.archiveSell",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};

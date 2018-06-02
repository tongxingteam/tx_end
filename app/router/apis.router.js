'use strict';
/* 提供api数据的路由 */
module.exports = app => {
  const { router, controller, config } = app;
  router.post(`/${config.version}/index`, controller.home.index);
};
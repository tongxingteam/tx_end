'use strict';
/* 提供api数据的路由 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/index', controller.home.index);
};
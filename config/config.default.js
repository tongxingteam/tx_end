'use strict';

module.exports = appInfo => {
  return {
    keys: appInfo.name + '_1527593394240_2392', // 用于设置cookie的key名称
    middleware: [ 'apiLogger', 'checkApi' ], // 对请求加入中间件过滤
    security: { // 对请求的安全设置
      csrf: {
        enable: false
      }
    },
    mysql: { // MySQL设置
      client: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'tongxing'
      },
      USER_DB: 'tx_user' //用户基本信息表
    },
    redis: { // redis设置
      client: {
        host: 'localhost',
        port: '6379',
        password: 'root',
        db: 0
      }
    }
  }
};

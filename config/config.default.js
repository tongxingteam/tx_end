'use strict';

module.exports = appInfo => {
  return {
    version: 'v1',
    keys: appInfo.name + '_1527593394240_2392', // 用于设置cookie的key名称
    middleware: [ 'apiLogger', 'checkApi' ], // 对请求加入中间件过滤
    checkApi: {
      version: 'v1'
    },
    security: { // 对请求的安全设置
      csrf: {
        enable: false
      }
    },
    mysql: { // MySQL设置
      client: {
        host: '47.89.246.57',
        port: '3306',
        user: 'root',
        password: 'admin2018',
        database: 'tx_db'
      },
      USER_DB: 'tx_user', //用户基本信息表
      TRIP_DB: 'tx_trip', //行程基本信息表
      APPLY_DB: 'tx_apply', //申请记录表
      TRIP_COMMENT_DB: 'tx_trip_comment' //基于行程的对用户的评论
    },
    redis: { // redis设置
      client: {
        host: '47.89.246.57',
        port: '6379',
        password: '',
        db: 0
      }
    },
    wxInfo: { // 微信小程序信息
      appid: "wx45a3c0812c6d6f0b",
      secret: "d332d231486e8690f9956f535a25740d"
    },
    token_i: {
      skey: "qwe",
      gkey: "asd"
    }
  }
};

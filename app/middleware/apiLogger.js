'use strict';

/* 接口调用日志 */
const moment = require('moment');
const utiluuid = require('../util/uuid');
const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const loggerReq = new Logger();
const loggerRes = new Logger();
loggerReq.set('file', new FileTransport({
  file: 'logs/api.req.log',
  level: 'INFO'
}));
loggerRes.set('file', new FileTransport({
  file: 'logs/api.res.log',
  level: 'INFO'
}));

module.exports = options => {
  return async function apiLogger(ctx, next){
    const { uid, page, platform } = ctx.header;
    const userAgent = ctx.header['user-agent'];
    const { ip, url, method } = ctx;
    const logFlag = utiluuid.uuid;
    const logReqTime = moment().format();
    loggerReq.info(
      [
        logFlag,
        logReqTime,
        ip,
        page,
        url,
        method,
        uid,
        platform,
        userAgent
      ].join('|')
    );
    await next();
    const logResTime = moment().format();
    loggerRes.info(
      [
        logFlag,
        logResTime,
        ctx.status,
        JSON.stringify(ctx.body)
      ].join('|')
    );
  }
}
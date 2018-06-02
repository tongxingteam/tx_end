'use strict';

/* 接口调用日志 */
const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const logger = new Logger();
logger.set('file', new FileTransport({
    file: 'logs/api.log',
    level: 'INFO'
}));

module.exports = options => {
    return async function apiLogger(ctx, next){
        
          logger.info('api 访问');
    }
}
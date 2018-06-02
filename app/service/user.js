'use strict';

/* 提供user模型相关的数据操作 */

const Service = require('egg').Service;

module.exports = class UserService extends Service {
    async getUserList() {
        const { USER_DB } = this.config.mysql;
        const userList = await this.app.mysql.select(USER_DB);
        return userList;
    }
}
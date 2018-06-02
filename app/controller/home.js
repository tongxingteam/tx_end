'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  // async login() {
  //   let userList = await this.ctx.service.user.getUserList()
  //   this.ctx.body = userList;
  // }
}

module.exports = HomeController;

'use strict';

const Controller = require('egg').Controller;

class YuhtController extends Controller {
   // 用户发布的行程
   async queryMyPublish(){
    // 获取service
    const { yuht } = this.ctx.service;
    // 获取请求参数
    const { user_id, currentPage, pageSize } = this.ctx.request.body;
    // 判断参数是否合法
    // console.log(user_id, currentPage, pageSize, typeof(pageSize)=="number", !typeof(pageSize)=="number");
    if(!user_id || !currentPage || !pageSize){
      console.log("参数不合法");
      return this.ctx.body = {code: 70001, msg: '参数不合法'};
    }

    try{
      // 等待数据库返回结果
      const trip = await yuht.queryMyTripList(user_id, currentPage, pageSize);
      this.ctx.body = trip;
    }catch(error){
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  
  // 用户参与的同行
  async queryMyTx(){
    // 获取service
    const { yuht } = this.ctx.service;
    // 获取请求参数
    const { user_id, currentPage, pageSize } = this.ctx.request.body;
    // 判断参数是否合法
    if(!user_id || !currentPage || !pageSize){
      console.log("参数不合法");
      return this.ctx.body = {code: 70001, msg: '参数不合法'};
    }
    try{
      // 等待数据库返回结果
      const trip = await yuht.queryJoinTripList(user_id, currentPage, pageSize);
      this.ctx.body = trip;
    }catch(error){
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  // 我的草稿
  async queryMyDraftList(){
    // 获取service
    const { yuht } = this.ctx.service;
    // 获取请求参数
    const { user_id, currentPage, pageSize } = this.ctx.request.body;
    // 判断参数是否合法
    if(!user_id || !currentPage || !pageSize){
      console.log("参数不合法");
      return this.ctx.body = {code: 70001, msg: '参数不合法'};
    }
    try{
      // 等待数据库返回结果
      const trip = await yuht.queryMyDraftTripList(user_id, currentPage, pageSize);
      this.ctx.body = trip;
    }catch(error){
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  // 我的申请页面
  async queryMyRequestList(){
    // 获取service
    const { yuht } = this.ctx.service;
    // 获取请求参数
    const { user_id, currentPage, pageSize } = this.ctx.request.body;
    // 判断参数是否合法
    if(!user_id || !currentPage || !pageSize){
      console.log("参数不合法");
      return this.ctx.body = {code: 70001, msg: '参数不合法'};
    }
    try{
      // 等待数据库返回结果
      const apply = await yuht.queryMyApplyTripList(user_id, currentPage, pageSize);
      this.ctx.body = apply;
    }catch(error){
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  // 对于我的评论
  async queryCommentToMe(){
    // 获取service
    const { yuht } = this.ctx.service;
    // 获取请求参数
    const { user_id, currentPage, pageSize } = this.ctx.request.body;
    // 判断参数是否合法
    if(!user_id || !currentPage || !pageSize){
      console.log("参数不合法");
      return this.ctx.body = {code: 70001, msg: '参数不合法'};
    }
    try{
      // 等待数据库返回结果
      const comment = await yuht.queryCommentToMe(user_id, currentPage, pageSize);
      this.ctx.body = comment;
    }catch(error){
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }

  // 记录页面标记
  async pageSign(){
    // 获取请求参数
    const body = this.ctx.request.body;
    this.ctx.body = {code: 60001, msg: '头部缺少页面标识字段'};
  }

  // 登录
  async login(){
    // 获取service
    const { yuht } = this.ctx.service;
    // 获取请求参数
    const { code } = this.ctx.request.body;
    // 判断参数是否合法
    if(!code){
      this.ctx.body = {code: 70001, msg: '参数不合法'};
    };
    try{
      this.ctx.body = "接口开发中";
      return;
      const result = await yuht.requestUserJsCode2Session(code);
      this.ctx.body = result;
    }catch(err){
      console.log(err);
      this.ctx.body = {code: 50003, msg: '服务器调用其他接口错误,' + err};
    }
  }
}

module.exports = YuhtController;

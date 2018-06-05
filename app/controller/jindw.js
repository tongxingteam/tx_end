'use strict';

const moment = require('moment');
const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const loggerWord = new Logger();
loggerWord.set('file', new FileTransport({
  file: 'logs/api.keyword.log',
  level: 'INFO'
}));

const Controller = require('egg').Controller;

class JindwController extends Controller {
  // 获取行程列表
  async queryTripListByWord() {
    // 获取参数
    const { jindw } = this.ctx.service;
    let { currentPage = 1, pageSize = 10, keyword } = this.ctx.request.body;
    currentPage = parseInt(currentPage) || 1;
    pageSize = parseInt(pageSize) || 10;
    let offset = (currentPage - 1) * pageSize;
    if(!keyword || keyword.length === 0){
      try {
        this.ctx.body = await jindw.queryTripList(offset, pageSize);
      } catch (error) {
        console.log(error);
        this.ctx.body = {code: 50000, msg: '服务器错误'};
      }
    }else{
      try {
        this.ctx.body = await jindw.queryTripListByWord(keyword, offset, pageSize);
      } catch (error) {
        console.log(error);
        this.ctx.body = {code: 50000, msg: '服务器错误'};
      }
      // 热词日志
      const { ip, header } = this.ctx;
      const { uid, platform } = header;
      const timeNow = moment().format();
      loggerWord.info(
        [
          timeNow,
          ip,
          uid,
          platform,
          keyword
        ].join('|')
      );
    }
  }
  // 行程详情
  async queryTripDetail(){
    const { jindw } = this.ctx.service;
    const { trip_id, user_id } = this.ctx.request.body;
    try{
      const [trip, apply_status] = await Promise.all([jindw.queryTripDetail(trip_id), jindw.queryUserStatusToTrip(user_id, trip_id)]);
      if(trip === null){
        this.ctx.body = {code: 40004, msg: '不存在的记录'};
      }else{
        this.ctx.body = {...trip, apply_status_to_add: apply_status}
      }
    }catch(error){
      console.log(error);
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  // 申请参团
  async requestJoin(){
    const { jindw } = this.ctx.service;
    const { trip_id, user_id, publisher_id, user_apply_content } = this.ctx.request.body;
    try {
      await jindw.insertUserApply(trip_id, user_id, publisher_id, user_apply_content);
      this.ctx.body = {code: 20000, msg: '申请成功'};
    } catch (error) {
      let body = null;
      switch(error.message){
        case '1':
          body = {code: 40001, msg: '不存在的用户'};
          break;
        case '2':
          body = {code: 40001, msg: '申请记录已经存在'};
          break;
        case '3':
          body = {code: 40001, msg: '申请失败'};
          break;
        case '4':
          body = {code: 40001, msg: '旅行记录不可用'};
          break;
        default:
          body = {code: 40001, msg: '未知错误'};
      }
      this.ctx.body = body;
    }
  }
  // 获取申请列表(对于发起人)
  async queryTripApplyList(){

  }
  // 发布人同意参团
  async agreeJoin(){

  }
  // 查询新状态
  async myNews(){

  }
}

module.exports = JindwController;

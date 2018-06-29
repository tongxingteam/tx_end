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
        this.ctx.status = 500;
        this.ctx.body = {code: 50000, msg: '服务器错误'};
      }
    }else{
      try {
        this.ctx.body = await jindw.queryTripListByWord(keyword, offset, pageSize);
      } catch (error) {
        console.log(error);
        this.ctx.status = 500;
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
  async queryTripDetail() {
    const { jindw } = this.ctx.service;
    const { trip_id, user_id } = this.ctx.request.body;
    try{
      const [trip, apply_status] = await Promise.all([jindw.queryTripDetail(trip_id), jindw.queryUserStatusToTrip(user_id, trip_id)]);
      if(trip === null){
        this.ctx.body = {code: 40004, msg: '不存在的记录'};
      }else{
        // 判断行程是否是自己发布的
        if(user_id == trip.publish_user_id){
          const self_trip = true;
        }else{
          const self_trip = false;          
        }
        this.ctx.body = {...trip, apply_status_to_add: apply_status, self_trip}
      }
    }catch(error){
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  // 申请参团
  async requestJoin() {
    const { jindw } = this.ctx.service;
    const { trip_id, user_id, publisher_id, user_apply_content } = this.ctx.request.body;
    try {
      await jindw.insertUserApply(trip_id, user_id, publisher_id, user_apply_content);
      this.ctx.body = {code: 20000, msg: '申请成功'};
    } catch (error) {
      let body = null;
      switch(error.message){
        case '1':
          body = {code: 40001, msg: '非法的用户'};
          break;
        case '2':
          body = {code: 40001, msg: '非法的申请记录'};
          break;
        case '3':
          body = {code: 40001, msg: '申请失败'};
          break;
        case '4':
          body = {code: 40001, msg: '非法的旅行记录'};
          break;
        default:
          body = {code: 40001, msg: '未知错误'};
      }
      this.ctx.body = body;
    }
  }
  // 获取申请列表(对于发起人)
  async queryTripApplyList(){
    const { jindw } = this.ctx.service;
    let { trip_id, currentPage = 1, pageSize = 10 } = this.ctx.request.body;
    currentPage = parseInt(currentPage) || 1;
    pageSize = parseInt(pageSize) || 10;
    let offset = (currentPage - 1) * pageSize;
    try {
      const applyList = await jindw.queryTripApplyList(trip_id, offset, pageSize);
      this.ctx.body = applyList;
    } catch (error) {
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
  // 发布人同意参团
  async agreeJoin(){
    const { jindw } = this.ctx.service;
    const { apply_id } = this.ctx.request.body;
    try {
      await jindw.agreeJoin(apply_id);
      this.ctx.body = {code: 20000, msg: '同意成功'};
    } catch (error) {
      let body = null;
      switch(error.message){
        case '1':
          body = {code: 40001, msg: '非法记录'};
          break;
        case '2':
          body = {code: 40001, msg: '非法记录'};
          break;
        case '3':
          body = {code: 40002, msg: '当前行程正在改变发布人，不可操作'};
          break;
        case '4':
          body = {code: 40003, msg: '当前的行程正在进行中，不可操作'};
          break;
        case '5':
          body = {code: 40005, msg: '申请人状态不符合'};
          break;  
        default:
          body = {code: 50000, msg: '同意失败'};
      }
      this.ctx.body = body;
    }
  }
  // 查询新状态
  async myNews(){
    const { jindw } = this.ctx.service;
    const { user_id } = this.ctx.request.body;
    try {
      const result = await jindw.myNews(user_id); 
      this.ctx.body = result;
    } catch (error) {
      console.log(error);
      this.ctx.status = 500;
      this.ctx.body = {code: 50000, msg: '服务器错误'};
    }
  }
}

module.exports = JindwController;

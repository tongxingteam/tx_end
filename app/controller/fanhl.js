'use strict';

const moment = require('moment');
const Controller = require('egg').Controller;

class FanhlController extends Controller {
  // 发布人不同意参团
  async notAgreeJoin(){
    const { fanhl } = this.ctx.service;
    const { apply_trip_id, user_id, apply_publisher_id } = this.ctx.request.body;
    if(!apply_trip_id || !user_id || !apply_publisher_id){
      this.ctx.status = 400;
      this.ctx.body = {code:40000,msg:"参数错误"}
    }else{
      try{
        let changeStatus = await fanhl.changeApplyStatus(apply_trip_id,user_id,apply_publisher_id);
        //拒绝成功
        if(changeStatus === 1){
          this.ctx.status = 200;
          this.ctx.body = {code:20000,msg:'拒绝成功'}
        }else{
          //未知错误导致的拒绝失败
          this.ctx.status = 500;
          this.ctx.body = {code:50010,msg:"拒绝失败"}
        }
      }catch(error){
        console.log(error)
        this.ctx.status = 500;
        this.ctx.body = {code:50000,msg:"服务器错误"}
      }
    }
  }

  async list(){
    const { fanhl } = this.ctx.service;
    try {
      let quitStatus = await fanhl.list();
      this.ctx.status = 200;
      this.ctx.body = quitStatus;
    } catch (error) {
      this.ctx.status = 500;
      this.ctx.code = 50000;
      this.ctx.msg = "服务器错误";
      this.ctx.body = {msg: this.ctx.msg, code: this.ctx.code};
    }
  }

  // 退出行程团
  async leave(){
    const { fanhl } = this.ctx.service;
    const { trip_id, user_id, publisher_id } = this.ctx.request.body;
    if(!trip_id || !user_id || !publisher_id){
      this.ctx.status = 400;
      this.ctx.body = {code:40000,msg:"参数错误"}
    }else{
      let tripWhere = {trip_id,trip_active:1};
      let applyWhere = {apply_trip_id:trip_id,user_id,apply_publisher_id:publisher_id,apply_active:1};
      let applyOptions = {apply_status_to_add:3};
      let tripOptions = {}
      //发起人退出
      if(publisher_id === user_id){
        applyOptions = {apply_status_to_add:3,apply_trip_change_publisher:1};
        tripOptions = {trip_change_publisher:1}
      }
      try{
        let quitStatus = await fanhl.quitTrip(applyWhere,applyOptions,tripWhere,tripOptions)
        if(quitStatus == 1){
          this.ctx.status = 200;
          this.ctx.body = {code:20000,msg:'退出成功'}
        }else{
          this.ctx.status = 500;
          this.ctx.body = {code:50010,msg:"退出失败"}
        }
      }catch(error){
        console.log(error)
        this.ctx.status = 500;
        this.ctx.body = {code:50000,msg:"服务器错误"}
      }
    }
  }
  // 在当前行程下评论团中其他人
  async merberComment(){
    const { fanhl } = this.ctx.service;
    const { trip_id,trip_end_location,trip_end_time,from_user_id,to_user_id,trip_comment_content } = this.ctx.request.body;
    try{
      let commentStatus = await fanhl.updateTripComment(trip_id,trip_end_location,trip_end_time,from_user_id,to_user_id,trip_comment_content)
      
      if(commentStatus == 1){
        this.ctx.status = 200;
        this.ctx.body = {code:20000,msg:'评论成功'}
      }else{
        this.ctx.status = 500;
        this.ctx.body = {code:50010,msg:"评论失败"}
      }
    } catch(error){
      console.log(error)
      this.ctx.body = {code:50000,msg:"服务器错误"}
    }
  }
  // 直接发布行程(包含修改行程的请求)
  async publishTrip(){
    const { fanhl } = this.ctx.service;
    const {
      trip_id,
      trip_start_location,
      trip_end_location,
      trip_start_time,
      trip_end_time,
      trip_member_count,
      trip_other_desc,
      user_id
    } = this.ctx.request.body;
    const trip_status = 1;
    if(typeof trip_id === 'undefined'){
      // 发布新的行程信息
      try{
        await fanhl.insertTrip(
          trip_start_location,
          trip_end_location,
          trip_start_time,
          trip_end_time,
          trip_member_count,
          trip_other_desc,
          trip_status,
          user_id
        );
        this.ctx.body = {code: 20000, msg: '发布成功'};
      } catch(error){
        const { message } = error;
        if(message === '1'){
          this.ctx.body = {code:50010,msg:"用户信息错误"};
        }else{
          this.ctx.body = {code:50000,msg:"发布失败"}
        }
        console.error(error);
      }
    }else{
      // 修改行程信息
      const trip_edit_time = moment().format('YYYY-MM-DD HH:mm:ss');
      try {
        await fanhl.editPublishedTrip(
          trip_id,
          trip_start_location,
          trip_end_location,
          trip_start_time,
          trip_end_time,
          trip_member_count,
          trip_edit_time,
          trip_other_desc);
        this.ctx.body = {code: 20000, msg: '修改成功'};
      } catch (error) {
        const { message } = error;
        if(message === '1'){
          this.ctx.body = {code: 50010, msg: '未找到合法的行程记录'};
        }else{
          this.ctx.body = {code: 50000, msg: '服务异常'};
        }
        console.error(error);
      }
    }
  }
  // 保存为草稿
  async saveAsDraft(){
    const { fanhl } = this.ctx.service;
    const {
      trip_id,
      trip_start_location,
      trip_end_location,
      trip_start_time,
      trip_end_time,
      trip_member_count,
      trip_other_desc,
      trip_publish_user_id 
    } = this.ctx.request.body;
    const trip_create_time = moment().format();
    const trip_edit_time = trip_create_time;
    const trip_status = 0;
    if(typeof trip_id === 'undefined'){
      // 新的草稿记录
      try {
        await fanhl.insertTrip(
          trip_start_location,
          trip_end_location,
          trip_start_time,
          trip_end_time,
          trip_member_count,
          trip_other_desc,
          trip_status,
          trip_publish_user_id);
        this.ctx.body = {code: 20000, msg: '保存成功'};
      } catch (error) {
        const { message } = error;
        if(message === '1'){
          this.ctx.body = {code: 50010, msg: '不存在的用户操作'};
        }else if(message === '2'){
          this.ctx.body = {code: 50020, msg: '保存草稿失败'};
        }else{
          this.ctx.body = {code: 50000, msg: '服务异常'};
        }
        console.error(error);
      }
    }else{
      // 二次编辑并保存为草稿
       // 数据集
      const options = {
        trip_start_location,
        trip_end_location,
        trip_start_time,
        trip_end_time,
        trip_member_count,
        trip_other_desc,
        trip_create_time,
        trip_edit_time
      };
      const where = {
        trip_id,
        trip_active: 1,
        trip_status: 0
      };
      try {
        await fanhl.updateTrip( where, options );
        this.ctx.body = {code: 20000, msg: '保存成功'};
      } catch (error) {
        const { message } = error;
        if(message === '1'){
          this.ctx.body = {code: 50010, msg: '不存在的草稿记录'};
        }else if(message === '0'){
          this.ctx.body = {code: 50020, msg: '保存草稿失败'};
        }else{
          this.ctx.body = {code: 50000, msg: '服务异常'};
        }
      }
    }
  }

  // 草稿发布为正常的行程
  async publishDraftToTrip(){
    const { fanhl } = this.ctx.service;
    const { 
      trip_id,
      trip_start_location,
      trip_end_location,
      trip_start_time,
      trip_end_time,
      trip_member_count,
      trip_other_desc
    } = this.ctx.request.body;
    const trip_create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    const trip_edit_time = trip_create_time;
    const where = { 
      trip_id, // 已经存在的trip_id
      trip_active: 1, // 激活状态
      trip_status: 0 // 草稿标识
    };
    const options = {
      trip_start_location,
      trip_end_location,
      trip_start_time,
      trip_end_time,
      trip_member_count,
      trip_other_desc,
      trip_create_time,
      trip_edit_time,
      trip_status: 1,
    }
    try{
      await fanhl.updateTrip(where, options);
      this.ctx.body = {code:20000, msg:'发布成功'};
    }catch(error){
      const { message } = error;
      if(message === '1'){
        this.ctx.body = {code:50010, msg:"不存在的草稿记录"};
      }else if(message === '2'){
        this.ctx.body = {code:50020, msg:"发布失败"};
      }else{
        this.ctx.body = {code: 50000, msg: '服务异常'};
      }
      console.log(error);
    }
  }
}

module.exports = FanhlController;

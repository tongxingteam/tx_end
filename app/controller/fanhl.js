'use strict';

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
  // 直接发布行程
  async publishTrip(){
    const { fanhl } = this.ctx.service;
    let { trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id } = this.ctx.request.body;
    trip_end_location = JSON.stringify(trip_end_location);
    try{
      await fanhl.insertTrip(trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id);
    } catch(error){
      const { message } = error;
      if(message === '1'){
        this.ctx.body = {code:50000,msg:"用户信息错误"};
      }else{
        this.ctx.body = {code:50000,msg:"发布失败"}
      }
      console.error(error);
      return;
    }
    this.ctx.body = {code: 20000, msg: '发布成功'};
  }
  // 草稿的保存
  async saveTrip(){
    const { fanhl } = this.ctx.service;
    const { trip_id,trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id } = this.ctx.request.body;
    //更新
    if(trip_id.length !== 2){
        const where = { trip_id,trip_active: 1}
        const options = {trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_status:0}
      try{
        let updateTripStatus = await fanhl.updateTrip(where,options)
        if(insertTripStatus == 1){
          this.ctx.status = 200;
          this.ctx.body = {code:20000,msg:'保存成功'}
        }else{
          this.ctx.status = 500;
          this.ctx.body = {code:50010,msg:"保存失败"}
        }
      }catch(error){
        console.log(error)
        this.ctx.status = 500;
        this.ctx.body = {code:50000,msg:"服务器错误"}
      }
    }else{
    //新增
      try{
        let insertTripStatus = await fanhl.insertTrip(trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id,0)
        
        if(insertTripStatus == 1){
          this.ctx.status = 200;
          this.ctx.body = {code:20000,msg:'保存成功'}
        }else{
          this.ctx.status = 500;
          this.ctx.body = {code:50010,msg:"保存失败"}
        }
      } catch(error){
        console.log(error)
        this.ctx.status = 500;
        this.ctx.body = {code:50000,msg:"服务器错误"}
      }
    }

  }

  // 草稿的发布
  async publishSaveTrip(){
    const { fanhl } = this.ctx.service;
    const { trip_id,trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id } = this.ctx.request.body;
    let newTime = (new Date()).valueOf();
    let trip_start_timeC = (new Date(trip_start_time)).valueOf()
    let trip_end_timeC = (new Date(trip_end_time)).valueOf()
    let trip_status = 1;

    //结束
    if(newTime > trip_end_timeC){
      trip_status = 3;
    }
    
    //进行中
    if(newTime > trip_start_timeC && newTime < trip_end_timeC){
      trip_status = 2;
    }

    const where = { trip_id,trip_active: 1}
    const options = {trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id}

    try{
      let updateTripStatus = await fanhl.updateTrip(where,options)
    if(updateTripStatus == 1){
      this.ctx.status = 200;
      this.ctx.body = {code:20000,msg:'发布成功'}
    }else{
      this.ctx.status = 500;
      this.ctx.body = {code:50010,msg:"发布失败"}
    }
  }catch(error){
    console.log(error)
    this.ctx.status = 500;
    this.ctx.body = {code:50000,msg:"服务器错误"}
  }
  }
}

module.exports = FanhlController;

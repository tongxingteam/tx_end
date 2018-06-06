'use strict';

const Controller = require('egg').Controller;

class FanhlController extends Controller {
  // 发布人不同意参团
  async notAgreeJoin(){
    const { fanhl } = this.ctx.service;
    let { apply_trip_id, user_id, apply_publisher_id } = this.ctx.request.body;
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
          this.ctx.body = {code:20010,msg:"拒绝失败"}
        }
      }catch(error){
        console.log(error)
        this.ctx.status = 500;
        this.ctx.body = {code:50000,msg:"服务器错误"}
      }
    }
  }
  // 退出行程团
  async leave(){

  }
  // 在当前行程下评论团中其他人
  async merberComment(){

  }
  // 发布行程
  async publishTrip(){

  }
  // 编辑之后发布(包括我的草稿)
  async saveTrip(){
      
  }
}

module.exports = FanhlController;

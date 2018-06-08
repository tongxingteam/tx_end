'use strict';

const Service = require('egg').Service;
const uuid = require('../util/uuid');
const moment = require('moment');

class FanhlService extends Service {
    //根据用户id,行程id,发起人id修改用户的申请状态
    async changeApplyStatus(apply_trip_id, user_id, apply_publisher_id) {
        const { APPLY_DB } = this.config.mysql;
        const { mysql } = this.app;
        const where = {apply_trip_id,user_id,apply_publisher_id,apply_active: 1};
        const options = {apply_status_to_add: 2,apply_status_to_user: 1};
        return await this.updateApply(where,options)
    }

    //根据某个条件查询行程表
    async serchTtrip(columns,trip_id){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        const trip =  await mysql.queryOne(`select ${columns.join(',')} from ${TRIP_DB} where trip_id = '${trip_id}' and trip_active = 1`);
        return trip;
    }

    // 修改申请表
    async updateApply(where,options){
        const { APPLY_DB } = this.config.mysql;
        const { mysql } = this.app;
        let changeStatus = await mysql.update(APPLY_DB, options, { where })
        return changeStatus.affectedRows;
    }

    //修改行程表
    async updateTrip(where,options){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        let changeStatus = await mysql.update(TRIP_DB, options, { where })
        return changeStatus.affectedRows;
    }

    async quitTrip(applyWhere,applyOptions,tripWhere,tripOptions){
        const [applyStatue,tripMemberInfo] = await Promise.all([
            this.updateApply(applyWhere, applyOptions),
            this.serchTtrip(['trip_member_info'], tripWhere.trip_id),
        ]);

        let re = new RegExp('\{\"id\"\:"'+applyWhere.user_id+'"[^\}]*\}\,?','i');
        console.log(re)
        let trip_member_info = tripMemberInfo.trip_member_info.replace(re,"");
        console.log(trip_member_info)
        return await this.updateTrip({trip_id:tripWhere.trip_id},{trip_member_info,...tripOptions})
    }

    // 查询用户基本信息
    async queryUserInfo(columns, user_id){
        const { USER_DB } = this.config.mysql;
        const { mysql } = this.app;
       return await mysql.queryOne(`select ${columns.join(',')} from ${USER_DB} where user_id = '${user_id}' and user_active = 1`);
    }

    //新建评论表
    async insertTripComment(trip_id,trip_end_location,trip_end_time,from_user_id,to_user_id,trip_comment_content){
        const [fromUser,toUser] = await Promise.all([
            this.queryUserInfo(['*'], from_user_id),
            this.queryUserInfo(['*'], to_user_id),
        ])

        const { TRIP_COMMENT_DB } = this.config.mysql;
        const { mysql } = this.app;
        const comment_id = uuid.uuid;
        const insertStatus = await mysql.insert(TRIP_COMMENT_DB,{
            comment_id,
            trip_end_location,
            trip_end_time,
            trip_id,
            from_user_id:fromUser.user_id,
            from_user_wx_name:fromUser.user_wx_name,
            from_user_wx_portriat:fromUser.user_wx_portriat,
            to_user_id:toUser.user_id,
            to_user_wx_name:toUser.user_wx_name,
            to_user_wx_portriat:toUser.user_wx_portriat,
            trip_comment_content,
            trip_comment_active:1,
            trip_comment_create_time:moment().format('YYYY-MM-DD HH:mm:ss'),
            trip_comment_see:1
        })

        return insertStatus.affectedRows;
    }

    //新建行程列表
    async insertTrip(trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_other_desc,trip_publish_user_id,trip_status){
        
        const publishInfo = await this.queryUserInfo(['*'], trip_publish_user_id);
        const trip_member_info = `[{"id":"${trip_publish_user_id}","user_wx_name":"${publishInfo.user_wx_name}","user_wx_portriat":"${publishInfo.user_wx_portriat}"}]`
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        const trip_id = uuid.uuid;
        const insertStatus = await mysql.insert(TRIP_DB,{
            trip_id,
            trip_start_location,
            trip_end_location,
            trip_start_time,
            trip_end_time,
            trip_member_count,
            trip_other_desc,
            trip_status,
            publish_user_id:trip_publish_user_id,
            publish_user_wx_name:publishInfo.user_wx_name,
            publish_user_wx_portriat:publishInfo.user_wx_portriat,
            trip_create_time:moment().format('YYYY-MM-DD HH:mm:ss'),
            trip_active:1,
            trip_member_info,
            trip_edit_time:moment().format('YYYY-MM-DD HH:mm:ss'),
            trip_apply_news:0,
            trip_comment_news:0,
            trip_change_publisher:0
        })
        return insertStatus.affectedRows
    }
}

module.exports = FanhlService;
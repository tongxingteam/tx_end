'use strict';

const Service = require('egg').Service;
const uuid = require('../util/uuid');
const moment = require('moment');

class JindwService extends Service {
    // 查询行程列表
    async queryTripList(offset = 0, limit = 10){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        const list = await mysql.select(TRIP_DB, {
            where: {'trip_status':1, 'trip_active':1},
            columns: [
                'trip_id',
                'publish_user_id',
                'publish_user_wx_name',
                'publish_user_wx_portriat',
                'trip_create_time',
                'trip_end_location',
                'trip_start_time',
                'trip_end_time',
                'trip_merber_count'
            ],
            limit: limit,
            offset: offset,
            order: [['trip_start_time','desc']]
        });
        return list.map((trip)=>{
            trip.trip_end_location = JSON.parse(trip.trip_end_location);
            return trip;
        });
    }
    // 根据热词搜索行程列表
    async queryTripListByWord(keyword, offset = 0, limit = 10){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        const fields = [
            'trip_id',
            'publish_user_id',
            'publish_user_wx_name',
            'publish_user_wx_portriat',
            'trip_create_time',
            'trip_end_location',
            'trip_start_time',
            'trip_end_time',
            'trip_merber_count'
        ];
        const list = await mysql.query(
                `select ${fields.join(',')} from ${TRIP_DB} where trip_status = 1 and trip_active = 1 and LOCATE(:keyword, 'trip_start_location')>0 or LOCATE(:keyword, 'trip_end_location')>0 or LOCATE(:keyword, 'trip_other_desc')>0 order by trip_start_time desc limit :offset,:limit`, {
                    keyword: keyword,
                    offset: offset,
                    limit: limit
            });
        return list.map((trip)=>{
            trip.trip_end_location = JSON.parse(trip.trip_end_location);
            return trip;
        });    
    }
    // 查询行程详情
    async queryTripDetail(trip_id){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        const columns = [
            'publish_user_id',
            'publish_user_wx_name',
            'publish_user_wx_portriat',
            'trip_id',
            'trip_create_time',
            'trip_start_location',
            'trip_end_location',
            'trip_start_time',
            'trip_end_time',
            'trip_member_count',
            'trip_member_info',
            'trip_other_desc',
            'trip_status'
        ];
        const trip = await mysql.queryOne(`select ${columns.join(',')} from ${TRIP_DB} where trip_id='${trip_id}' and trip_active=1`);
        trip.trip_end_location = JSON.parse(trip.trip_end_location);
        return trip;
    }
    // 查询用户对于行程的状态
    async queryUserStatusToTrip(user_id, trip_id){
        const { APPLY_DB } = this.config.mysql;
        const { mysql } = this.app;
        return await mysql.queryOne(`select apply_status_to_add from ${APPLY_DB} where apply_active = 1 and user_id = '${user_id}' and apply_trip_id = '${trip_id}'`);
    }
    // 查询用户基本信息
    async queryUserInfo(columns, user_id){
        const { USER_DB } = this.config.mysql;
        const { mysql } = this.app;
       return await mysql.queryOne(`select ${columns.join(',')} from ${USER_DB} where user_id = '${user_id}' and user_active = 1`);
    }
    // 更新申请记录为参团状态
    async insertUserApply(trip_id, user_id, publisher_id, user_apply_content){
        const [user, publisher, apply] = await Promise.all([
            this.queryUserInfo(['user_wx_name', 'user_wx_portriat'], user_id),
            this.queryUserInfo(['user_wx_name', 'user_wx_portriat'], publisher_id),
            this.queryUserStatusToTrip(user_id, trip_id)
        ]);
        if(!user || !publisher){
            throw new Error(1);
        }else if(apply){
            throw new Error(2);
        }else{
            const apply_id = uuid.uuid;
            const { TRIP_DB, APPLY_DB } = this.config.mysql;
            const { mysql } = this.app;
            await mysql.beginTransactionScope(async conn => {
                const insert = await conn.insert(APPLY_DB, {
                    apply_id,
                    apply_trip_id: trip_id,
                    user_id,
                    ...user,
                    apply_publisher_id: publisher_id,
                    apply_create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                    user_apply_content
                });
                if(insert.affectedRows === 0){
                    throw new Error(3);
                }
                const update = await conn.update(TRIP_DB, {trip_apply_news: 1}, {where:{trip_id,trip_active:1,trip_status:1}});
                if(update.affectedRows === 0){
                    throw new Error(4);
                }else{
                    return;
                }
              }, this.ctx);
        }
    }
    // 获取行程的申请列表
    async queryTripApplyList(trip_id, offset, limit){
        const { APPLY_DB } = this.config.mysql;
        const { mysql } = this.app;
        const columns = [
            'apply_id',
            'user_id',
            'user_wx_name',
            'user_wx_portriat',
            'apply_status_to_add',
            "date_format(apply_create_time, '%Y-%m-%d %H:%i:%s') as apply_create_time"
        ];
        return await mysql.query(`select ${columns.join(',')} from ${APPLY_DB} where apply_trip_id = '${trip_id}' and apply_publisher_id !=user_id and apply_active = 1 order by apply_create_time desc limit ${offset},${limit}`);
    }
    // 同意参团
    async agreeJoin(apply_id){
        const { APPLY_DB, TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        const apply_columns = [
            'apply_trip_id',
            'user_id',
            'user_wx_name',
            'user_wx_portriat',
            'apply_status_to_add',
            'apply_active',
            'apply_trip_change_publisher'
        ];
        const apply_info = await mysql.queryOne(`select ${apply_columns.join(',')} from ${APPLY_DB} where apply_id='${apply_id}'`);
        if(apply_info === null){
            throw new Error(1); // 无对应记录
        }else if(apply_info.apply_active === 0){
            throw new Error(2); // 记录不可用
        }else if(apply_info.apply_trip_change_publisher === 1){
            throw new Error(3); // 行程正在易主，不可操作
        }else if(apply_info.apply_status_to_add !== 0){
            throw new Error(5); // 申请人不在申请中...
        }
        const trip_info = await mysql.queryOne(`select trip_member_info,trip_status,trip_active from ${TRIP_DB} where trip_id='${apply_info.apply_trip_id}'`);
        if(trip_info === null){
            throw new Error(1); // 无对应记录
        }else if(trip_info['trip_active'] === 0){
            throw new Error(2); // 记录不可用
        }else if(trip_info['trip_status'] !==1){
            throw new Error(4); // 行程正在进行中，不可操作
        }
        let user_info = `{"id":"${apply_info.user_id}","user_wx_name":"${apply_info.user_wx_name}","user_wx_portriat":"${apply_info.user_wx_portriat}"}`;
        if(trip_info.trip_member_info.length === 0){
            user_info = `[${user_info}]`;
        }else{
            user_info = `${trip_info.trip_member_info.slice(0, -1)},${user_info}]`;
        }
        await mysql.beginTransactionScope(async conn => {
            const update_apply = await conn.update(APPLY_DB, {
                apply_status_to_add: 1,
                apply_status_to_publisher: 0,
                apply_status_to_user: 1
            }, {
                where: {apply_id: apply_id}
            });
            if(update_apply.affectedRows === 0){
                throw new Error();
            }
            const update_trip = await conn.update(TRIP_DB, {
                trip_member_info: user_info
            }, {
                where: {trip_id: apply_info.apply_trip_id}
            });
            if(update_trip.affectedRows === 0){
                throw new Error();
            }else{
                return;
            }
        });
    }
    // 统计用户新消息
    async myNews(user_id){
        const { TRIP_DB, APPLY_DB, TRIP_COMMENT_DB } = this.config.mysql;
        const { mysql } = this.app;
        const [trip_publish, trip_apply, trip_comment, trip_follow] = await Promise.all([
            mysql.query(`select count(trip_id) as trip_publish from ${TRIP_DB} where publish_user_id='${user_id}' and trip_active=1 and trip_apply_news=1`),
            mysql.query(`select count(apply_id) as trip_apply from ${APPLY_DB} where user_id='${user_id}' and apply_active=1 and apply_status_to_user=1`),
            mysql.query(`select count(comment_id) as trip_comment from ${TRIP_COMMENT_DB} where to_user_id='${user_id}' and trip_comment_active=1 and trip_comment_see=1`),
            mysql.query(`select count(apply_id) as trip_follow from ${APPLY_DB} where user_id='${user_id}' and apply_active=1 and apply_trip_is_edit=1 or apply_trip_change_publisher=1`)
        ]);
        return {
            trip_publish, // 我发布的
            trip_apply, // 我申请的
            trip_comment, // 对我的评论
            trip_follow
            // 我同行的
        }
    }
}

module.exports = JindwService;
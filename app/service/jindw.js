'use strict';

const Service = require('egg').Service;

class JindwService extends Service {
    // 查询行程列表
    async queryTripList(offset = 0, limit = 10){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        return await mysql.select(TRIP_DB, {
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
        return await mysql.query(
            `select ${fields.join(',')} from ${TRIP_DB} where trip_status = 1 and trip_active = 1 and LOCATE(:keyword, 'trip_start_location')>0 or LOCATE(:keyword, 'trip_end_location')>0 or LOCATE(:keyword, 'trip_other_desc')>0 order by trip_start_time desc limit :offset,:limit`, {
                keyword: keyword,
                offset: offset,
                limit: limit
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
        return await mysql.queryOne(`select ${columns.join(',')} from ${TRIP_DB} where trip_id=${trip_id} and trip_active=1`);
    }
    // 查询用户对于行程的状态
    async queryUserStatusToTrip(user_id, trip_id){
        const { APPLY_DB } = this.config.mysql;
        const { mysql } = this.app;
        return await mysql.queryOne(`select apply_status_to_add from ${APPLY_DB} where apply_active = 1 and user_id = ${user_id} and apply_trip_id = ${trip_id}`);
    }
}

module.exports = JindwService;
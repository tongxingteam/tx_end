'use strict';

const Service = require('egg').Service;

class JindwService extends Service {
    // 查询行程列表
    async queryTripList(offset = 0, limit = 10){
        const { TRIP_DB } = this.config.mysql;
        const { mysql } = this.app;
        return await mysql.select(TRIP_DB, {
            where: {'trip_status':0},
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
            `select ${fields.join(',')} from ${TRIP_DB} where trip_status = 0 and LOCATE(:keyword, 'trip_start_location')>0 or LOCATE(:keyword, 'trip_end_location')>0 or LOCATE(:keyword, 'trip_other_desc')>0 order by trip_start_time desc limit :offset,:limit`, {
                keyword: keyword,
                offset: offset,
                limit: limit
            });
    }
}

module.exports = JindwService;
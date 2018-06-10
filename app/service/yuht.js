'use strict';

const Service = require('egg').Service;

class YuhtService extends Service {
    // 查询我发起的行程列表
    async queryMyTripList(user_id, currentPage, pageSize) {
        const {
            TRIP_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        // sql
        // return await mysql.select(TRIP_DB, { // 搜索 post 表
        //     where: {
        //         "publish_user_id": user_id
        //     }, // WHERE 条件
        //     columns: ['trip_create_time', 'trip_end_location', 'trip_start_time', 'trip_end_time', 'trip_member_count', 'trip_id', 'trip_status', 'trip_member_info'], // 要查询的表字段
        //     orders: [
        //         ['trip_create_time', 'desc']
        //     ], // 排序方式
        //     limit: pageSize, // 返回数据量
        //     offset: (currentPage - 1) * pageSize, // 数据偏移量
        // });
        const trip = await mysql.query(`
        select SQL_CALC_FOUND_ROWS trip_create_time,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_id,trip_status,trip_member_info,trip_apply_news,trip_comment_news 
        from ${TRIP_DB}
        where publish_user_id='${user_id}'
        order by trip_create_time desc 
        limit ${(currentPage - 1) * pageSize}, ${pageSize};
        `);
        const total = await mysql.query(`select found_rows()`);
        return {
            "total": total[0]["found_rows()"],
            trip
        }
    }

    // 查询我参与的行程列表
    async queryJoinTripList(user_id, currentPage, pageSize) {
        const {
            TRIP_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        // sql
        const trip = await mysql.query(`
        select SQL_CALC_FOUND_ROWS trip_create_time,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_id,trip_status,trip_member_info 
        from ${TRIP_DB}
        where trip_member_info like '%${user_id}%'
        order by trip_create_time desc 
        limit ${(currentPage - 1) * pageSize}, ${pageSize};
        `);
        const total = await mysql.query(`select found_rows()`);
        return {
            "total": total[0]["found_rows()"],
            trip
        }
    }

    // 查询我的草稿
    async queryMyDraftTripList(user_id, currentPage, pageSize) {
        const {
            TRIP_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        // sql
        const trip = await mysql.query(`
            select SQL_CALC_FOUND_ROWS trip_create_time,trip_start_location,trip_end_location,trip_start_time,trip_end_time,trip_member_count,trip_id,trip_other_desc
            from ${TRIP_DB}
            where publish_user_id='${user_id}' and trip_status=0
            order by trip_create_time desc 
            limit ${(currentPage - 1) * pageSize}, ${pageSize};
            `);
        const total = await mysql.query(`select found_rows()`);
        return {
            "total": total[0]["found_rows()"],
            trip
        }
    }

    // 查询我的申请记录
    async queryMyApplyTripList(user_id, currentPage, pageSize) {
        const {
            TRIP_DB,
            APPLY_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        // sql
        const apply = await mysql.query(`
            select SQL_CALC_FOUND_ROWS *
            from ${APPLY_DB} 
            left join ${TRIP_DB} 
            on (${APPLY_DB}.apply_trip_id = ${TRIP_DB}.trip_id) 
            where ${APPLY_DB}.user_id = '${user_id}' 
            order by apply_create_time desc 
            limit ${(currentPage - 1) * pageSize}, ${pageSize};
        `);
        const total = await mysql.query(`select found_rows()`);
        return {
            "total": total[0]["found_rows()"],
            apply
        }
    }

    // 查询我的评论
    async queryCommentToMe(user_id, currentPage, pageSize) {
        const {
            TRIP_COMMENT_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        // sql
        const comment = await mysql.query(`
                select SQL_CALC_FOUND_ROWS *
                from ${TRIP_COMMENT_DB} 
                where ${TRIP_COMMENT_DB}.to_user_id = '${user_id}' 
                order by trip_comment_create_time desc 
                limit ${(currentPage - 1) * pageSize}, ${pageSize};
            `);
        const total = await mysql.query(`select found_rows()`);
        return {
            "total": total[0]["found_rows()"],
            comment
        }
    }
}

module.exports = YuhtService;
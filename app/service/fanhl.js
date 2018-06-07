'use strict';

const Service = require('egg').Service;

class FanhlService extends Service {
    //根据用户id,行程id,发起人id修改用户的申请状态
    async changeApplyStatus(apply_trip_id, user_id, apply_publisher_id) {
        const { APPLY_DB } = this.config.mysql;
        const { mysql } = this.app;
        let changeStatus = await mysql.update(APPLY_DB, {
            apply_status_to_add: 2,
            apply_status_to_user: 1
        }, {
            where: {
                apply_trip_id,
                user_id,
                apply_publisher_id,
                apply_active: 1
            }
        })
        return changeStatus.affectedRows;
    }

    //根据某个条件查找申请表
    async applySerch(where,options){

    }

    //根据某个条件查询行程表
    async tripSerch(where,options){

    }

    // 退出申请修改申请表状态
    async applyQuit(where,options){


    }
    //退出申请修改行程表状态
    async tripQuit(where,options){


    }
}

module.exports = FanhlService;
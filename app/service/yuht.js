'use strict';

const Service = require('egg').Service;
const request = require('request');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
var uuid = require('node-uuid');

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

    // 请求微信openid
    async requestUserJsCode2Session(code) {
        const {
            wxInfo,
            token_i
        } = this.app;

        // 请求参数
        const option = `appid=${wxInfo.appid}&secret=${wxInfo.secret}&js_code=${code}&grant_type=authorization_code`;

        // 请求微信接口
        var result = await request(`https://api.weixin.qq.com/sns/jscode2session?${option}`, function (error, response, body) {
            console.log(error);
            console.log(response);
            console.log(body);
            if (!error && response.statusCode == 200) {
                const result = {
                    "openid": "OPENID",
                    "session_key": "SESSIONKEY",
                };
                return result;
            } else {
                return {
                    "code": 50003,
                    "msg": error
                };
            };
        });

        // 判断是否登陆过
        const judgeOpnIdResult = await judgeOpnId(result);

        if (judgeOpnIdResult) {
            // 登陆过
            // 拼接入住信息
            var data = Object.assign({
                user_id: judgeOpnIdResult.user_id
            }, result);
            console.log(data);
            // 生成token
            const token = await vargenerateToken(data);
            return token;
        }

        // 未登录过
        // 生成user_id
        const user_id = await generateUid();
        // 拼接入住信息
        var data = Object.assign({
            user_id
        }, result);
        console.log(data);
        // 将用户保存到数据库
        const saveUserResult = await saveUser(data);
        if (!saveUserResult) {
            return "保存失败";
        }
        // 生成token
        const token = await vargenerateToken(data);
        return token;
    }

    // 生成token
    async generateToken(data) {
        let created = Math.floor(Date.now() / 1000);
        let cert = fs.readFileSync(path.join(__dirname, token_i.skey)); //私钥
        let token = jwt.sign({
            data,
            exp: created + 3600 * 24
        }, cert, {
            algorithm: 'RS256'
        });
        return token;
    }

    // 通过openID，判断用户是否登陆过,如果登录过，返回userId，没有登陆过，返回false
    async judgeOpnId(data) {
        return false;
    }

    //生成user_id
    async generateUid() {
        return uuid.v1();
    }

    // 保存用户
    async saveUser(data) {
        return true;
    }
}

module.exports = YuhtService;
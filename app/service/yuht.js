'use strict';

const Service = require('egg').Service;
const request = require('request');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const uuid = require('../util/uuid');

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
        // 引入信息
        const { wxInfo, token_i } = this.app.config;
        const { USER_DB } = this.config.mysql;
        const { mysql } = this.app;

        // 请求参数
        const option = `appid=${wxInfo.appid}&secret=${wxInfo.secret}&js_code=${code}&grant_type=authorization_code`;

        // 请求微信接口
        var result = await this.wx_req(option);
        console.log(result);
        result = JSON.parse(result);
        // 判断请求微信是否失败
        if(!result.openid){
            throw result.errcode + ',' + result.errmsg;
        };
        console.log(1);

        // 判断是否登陆过
        const judgeOpnIdResult = await this.judgeOpnId(result);

        if (judgeOpnIdResult) {
            // 登陆过
            // 拼接入住信息
            var data = Object.assign({
                user_id: judgeOpnIdResult.user_id
            }, result);           
            // 生成token
            const token = await this.generateToken(data);
            return token;
        }
        console.log(2);

        // 未登录过
        // 生成user_id
        const user_id = uuid.uuid;
        // 拼接入住信息
        var data = Object.assign({
            user_id
        }, result);
        // console.log(data);
        // 将用户保存到数据库
        const saveUserResult = await this.saveUser(data);
        if (!saveUserResult) {
            return "保存失败";
        }
        // 生成token
        const token = await this.generateToken(data);
        return token;
    }

    // 调用微信接口
    async wx_req(option) {
        var result;
        var result = await new Promise(function(res, rej){
            request(`https://api.weixin.qq.com/sns/jscode2session?${option}`, function (error, response, body) {
                console.log(body, "微信返回的数据");
                // const result = {
                //     "openid": "123456789",
                //     "session_key": "abcdefg",
                // };
                // return result;
                console.log(1);
                if (!error && response.statusCode == 200) {
                    res(body)
                } else {
                    res({
                        "code": 50003,
                        "msg": error
                    })
                };
            });
        }) 
        console.log(result);
        console.log(2);
        return result;
    }

    // 生成token
    async generateToken(data) {
        // 引入信息
        const {
            wxInfo,
            token_i
        } = this.app.config;
        let created = Math.floor(Date.now() / 1000);
        // let cert = fs.readFileSync(path.join(__dirname, token_i.skey)); //私钥
        let cert = token_i.skey; //私钥
        let token = await jwt.sign(data, cert, {
            // expiresIn: 60 * 60 * 24 // 24小时过期
            expiresIn: 60 * 60 * 24
        });
        console.log(token, "token1");
        return {token};
    }

    // 通过openID，判断用户是否登陆过,如果登录过，返回userId，没有登陆过，返回false
    async judgeOpnId(data) {
        // 引入数据库信息
        const {
            USER_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        const result = await mysql.query(`
            SELECT * FROM ${USER_DB} WHERE user_openid = '${data.openid}' limit 1;
        `);
        if (result.length == 0) {
            return false;
        } else {
            return result[0];
        }
    }

    // 保存用户
    async saveUser(data) {
        const {
            USER_DB
        } = this.config.mysql;
        const {
            mysql
        } = this.app;
        console.log(data);
        var data = {
            user_id: data.user_id,
            user_phone: "",
            user_openid: data.openid,
            user_session_key: data.session_key,
            user_nick_name: "",
            user_sex: 0,
            user_wx_id: "",
            user_wx_portriat: "",
            user_wx_name: "",
            user_level: 0,
            user_score: 0,
            user_create_time: new Date(),
            user_last_login_time: new Date(),
            user_agent: "",
            user_disabled_end_time: new Date(),
            user_active: 1
        };
        console.log(data);
        const result = await mysql.insert(USER_DB, data);
        return true;
    }

    // 验证解析token方法
    async verifyToken(token) {
        // 引入信息
        const {
            wxInfo,
            token_i
        } = this.app.config;
        //私钥
        let cert = token_i.skey;
        // 验证token
        var result = await jwt.verify(token, cert, function (err, decode) {
            if (err) { //  时间失效的时候/ 伪造的token
                return {err: err};
            } else {
                return decode;
            }
        });
        return result;
    }
}

module.exports = YuhtService;
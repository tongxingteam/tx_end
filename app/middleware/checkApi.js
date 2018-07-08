'use strict';
/* 如果是来自api连接的请求则需要检查来源 */
const platforms = ['wechat'];
module.exports = options => {
    const reg = new RegExp(`^/${options.version}`);
    return async function checkApi(ctx, next) {
        // 验证头部信息
        // if(reg.test(ctx.path)){
        //     const { platform, uid, page } = ctx.header;
        //     if(platforms.indexOf(platform) ===-1 || !uid || !page){
        //         ctx.status = 401;
        //         ctx.body = {code: 40001, msg: '非法请求'};
        //         return;                
        //     }
        // }

        // 验证token
        const { token } = ctx.header;
        console.log(token, "token2");
        if(token != undefined && token != "undefined"){
            // 登录失效
            if(token == "" || token == null || token == "null" || token == false || token == "false" ){
                // 未登录
                ctx.body = {code: 60004, msg: '未登录'};
                return;                
            }else{
                // 已经登录
                // ctx.body = {code: 20000,msg: '验证登录开发中'};
                // return;
                // 该函数有效返回token解析出的数据，无效返回false
                var verifyToken = await ctx.service.yuht.verifyToken(token);
                console.log(verifyToken, "verifyToken2");
                if(verifyToken.err){
                    // token 解析错误
                    ctx.body = {code: 60003, msg: verifyToken.err};
                    return;
                }else{
                    console.log(verifyToken.user_id, "check");
                    // token 解析成功，主动添加user_id
                    ctx.request.body.user_id = verifyToken.user_id;
                    ctx.header.uid = verifyToken.user_id;
                }
            }
        };

        await next();
        // 响应
        if (ctx.status === 200 && !ctx.body.code) {
            ctx.body = {
                code: 20000,
                msg: 'success',
                data: ctx.body
            };
        }else{
            ctx.body = ctx.body;
        }
    }
}
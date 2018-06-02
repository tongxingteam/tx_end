'use strict';
/* 如果是来自api连接的请求则需要检查来源 */
module.exports = options => {
    return async function checkApi(ctx, next){
        if(/^\/api/.test(ctx.path)){
            let platform = ctx.get('platform');
            if(platform === 'wechat'){
                await next();
            }else{
                ctx.body = {code: 401, msg: '非法请求'};
            }
        }else{
            ctx.body = {code: 401, msg: '非法请求'};
        }
    }
}
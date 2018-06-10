<!-- 余宏图接口 -->
<!-- 我发起的行程接口 -->
// 在链表查询时，一条行程对应多个申请记录、多个状态，查询出一个行程会有多条数据，无法做指定页数、指定条数查询，暂时没做联表查询

request:
url: http://localhost:7001/v1/queryMyPublish/
method: post
Headers: {
    "Content-Type": "application/json",
    "platform": "wechat",
    "uid": "123",
    "page": "123"
}
param: {
	"user_id": "b019406067d511e89c437132ae595195", 
	"currentPage": 1,
	"pageSize": 10
}

response:
{
    "code": 20000,
    "msg": "success",
    "data": {
        "total": 2,
        "trip": [
            {
                "trip_create_time": "2018-06-08T09:43:13.000Z",
                "trip_end_location": "大连",
                "trip_start_time": "2018-06-05T16:00:00.000Z",
                "trip_end_time": "2018-06-06T16:00:00.000Z",
                "trip_member_count": 3,
                "trip_id": "5cbe08506b0011e8a53a53d3bea89acf",
                "trip_status": 3,
                "trip_member_info": "[{id:b019406067d511e89c437132ae595195,user_wx_name:三生三世,user_wx_portriat:https://imgs.wx.com/userId=asdasd32432432}]"
            },
            {
                "trip_create_time": "2018-06-04T11:33:20.000Z",
                "trip_end_location": "天津",
                "trip_start_time": "2018-06-04T16:00:00.000Z",
                "trip_end_time": "2018-06-13T16:00:00.000Z",
                "trip_member_count": 5,
                "trip_id": "a123",
                "trip_status": 1,
                "trip_member_info": "[]"
            }
        ]
    }
}

<!-- 我参与的行程接口 -->
request:
url: http://localhost:7001/v1/queryMyTx
method: post
Headers: {
    "Content-Type": "application/json",
    "platform": "wechat",
    "uid": "123",
    "page": "123"
}
param: {
	"user_id": "b019406067d511e89c437132ae595195", 
	"currentPage": 1,
	"pageSize": 10
}

response:
{
    "code": 20000,
    "msg": "success",
    "data": {
        "total": 1,
        "trip": [
            {
                "trip_create_time": "2018-06-08T09:43:13.000Z",
                "trip_end_location": "大连",
                "trip_start_time": "2018-06-05T16:00:00.000Z",
                "trip_end_time": "2018-06-06T16:00:00.000Z",
                "trip_member_count": 3,
                "trip_id": "5cbe08506b0011e8a53a53d3bea89acf",
                "trip_status": 3,
                "trip_member_info": "[{id:b019406067d511e89c437132ae595195,user_wx_name:三生三世,user_wx_portriat:https://imgs.wx.com/userId=asdasd32432432}]"
            }
        ]
    }
}

<!-- 我的草稿行程接口 -->
request:
url: http://localhost:7001/v1/queryMyDraftList
method: post
Headers: {
    "Content-Type": "application/json",
    "platform": "wechat",
    "uid": "123",
    "page": "123"
}
param: {
	"user_id": "b019406067d511e89c437132ae595195", 
	"currentPage": 1,
	"pageSize": 10
}

response:
{
    "code": 20000,
    "msg": "success",
    "data": {
        "total": 3,
        "trip": [
            {
                "trip_create_time": "2018-06-08T03:51:17.000Z",
                "trip_start_location": "山海关",
                "trip_end_location": "大连",
                "trip_start_time": "2018-06-05T16:00:00.000Z",
                "trip_end_time": "2018-06-06T16:00:00.000Z",
                "trip_member_count": 3,
                "trip_id": "32dc40f06acf11e8a5931304263138fa",
                "trip_other_desc": "开心就好  哈哈"
            },
            {
                "trip_create_time": "2018-06-08T03:10:38.000Z",
                "trip_start_location": "北京",
                "trip_end_location": "天津",
                "trip_start_time": "2018-06-05T16:00:00.000Z",
                "trip_end_time": "2018-06-06T16:00:00.000Z",
                "trip_member_count": 6,
                "trip_id": "84ce8d606ac911e8ad3e87387f709ce4",
                "trip_other_desc": "开心就好"
            },
            {
                "trip_create_time": "2018-06-08T02:07:30.000Z",
                "trip_start_location": "北京",
                "trip_end_location": "天津",
                "trip_start_time": "2018-06-13T16:00:00.000Z",
                "trip_end_time": "2018-06-14T16:00:00.000Z",
                "trip_member_count": 6,
                "trip_id": "b35299006ac011e88e773f6057c55a10",
                "trip_other_desc": "开心就好"
            }
        ]
    }
}

<!-- 我的申请记录列表接口 -->
request:
url: http://localhost:7001/v1/queryMyRequestList
method: post
Headers: {
    "Content-Type": "application/json",
    "platform": "wechat",
    "uid": "123",
    "page": "123"
}
param: {
	"user_id": "a019406067d511e89c437132ae595195", 
	"currentPage": 1,
	"pageSize": 10
}

response:
{
    "code": 20000,
    "msg": "success",
    "data": {
    "total": 1,
    "apply": [
            {
                "apply_id": "3c179a00695011e8aa8be57159244964",
                "apply_trip_id": "a123",
                "user_id": "a019406067d511e89c437132ae595195",
                "user_wx_name": "十里桃花",
                "user_wx_portriat": "https://imgs.wx.com/userId=098765",
                "apply_publisher_id": "b019406067d511e89c437132ae595195",
                "apply_status_to_add": 2,
                "apply_create_time": "2018-06-05T06:09:56.000Z",
                "apply_active": 1,
                "apply_publisher_confirm": 0,
                "apply_follow_confirm": 0,
                "apply_status_to_publisher": 0,
                "apply_status_to_user": 1,
                "apply_trip_is_edit": 0,
                "user_apply_content": "想去天津",
                "apply_trip_change_publisher": 0,
                "trip_id": "a123",
                "trip_start_location": "北京",
                "trip_end_location": "天津",
                "trip_start_time": "2018-06-04T16:00:00.000Z",
                "trip_end_time": "2018-06-13T16:00:00.000Z",
                "trip_member_count": 5,
                "trip_other_desc": "有车有房",
                "trip_status": 1,
                "publish_user_id": "b019406067d511e89c437132ae595195",
                "publish_user_wx_name": "三生三世",
                "publish_user_wx_portriat": "https://imgs.wx.com/userId=asdasd32432432",
                "trip_create_time": "2018-06-04T11:33:20.000Z",
                "trip_active": 1,
                "trip_member_info": "[]",
                "trip_edit_time": "2018-06-27T16:00:00.000Z",
                "trip_apply_news": 0,
                "trip_comment_news": 0,
                "trip_change_publisher": 1
            }
        ]
    }
}

<!-- 对我的评论列表接口 -->
request:
url: http://localhost:7001/v1/queryCommentToMe
method: post
Headers: {
    "Content-Type": "application/json",
    "platform": "wechat",
    "uid": "123",
    "page": "123"
}
param: {
	"user_id": "b019406067d511e89c437132ae595195", 
	"currentPage": 1,
	"pageSize": 10
}

response:
{
    "code": 20000,
    "msg": "success",
    "data": {
        "total": 1,
        "comment": [
            {
                "comment_id": "7bd2b1e06a2511e89b6c9dab4e5b5912",
                "trip_id": "a123",
                "trip_end_time": "2018-06-13T16:00:00.000Z",
                "trip_end_location": "天津",
                "from_user_id": "a019406067d511e89c437132ae595195",
                "from_user_wx_name": "十里桃花",
                "from_user_wx_portriat": "https://imgs.wx.com/userId=098765",
                "to_user_id": "b019406067d511e89c437132ae595195",
                "to_user_wx_name": "三生三世",
                "to_user_wx_portriat": "https://imgs.wx.com/userId=asdasd32432432",
                "trip_comment_content": "人特别nice",
                "trip_comment_create_time": "2018-06-07T07:36:25.000Z",
                "trip_comment_active": 1,
                "trip_comment_see": 1
            }
        ]
    }
}


<!-- 问题 -->
1.申请记录中的对于参加人是否有新状态（apply_status_to_user）字段，参与人有多个，一个数字无法表示，应该每个参与人绑定一个状态


<!-- 草稿 -->
// `SELECT tx_apply.apply_status_to_publisher, tx_trip.*
// FROM tx_apply
// INNER JOIN tx_trip
// ON tx_trip.trip_id=tx_apply.apply_trip_id;`
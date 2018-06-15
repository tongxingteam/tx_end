# tongxing



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org


### 状态码规范  

####程序状态码（status）  
http://www.runoob.com/http/http-status-codes.html  


####业务状态码（code） 

20000 无异常  

30001 资源或数据被永久转移到其它URL  
30004 接口数据未改变，使用缓存  

40004 未找到该接口  

50000 服务器错误  
50001 服务器代码逻辑错误  
50002 服务器对接数据库错误  
50003 服务器调用其他接口错误  
50004 服务器读写文件错误  

60000 请求headers错误  
60001 头部缺少字段  
60002 客户端类型错误  

70000 请求body参数错误  
70001 缺少参数  
70002 参数类型错误  



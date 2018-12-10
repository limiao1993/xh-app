const express = require ("express");
const pool = require("./pool");
const cors = require ("cors")
var app = express();
app.use(cors({origin:["http://127.0.0.1:3001","http://localhost:3001"],
credentials:true
}))
app.use(express.static(__dirname+"/public"));
app.listen(3000);
//功能一 
app.get("/imagelist",(req,res)=>{
    var obj=[
    {id:1,img_url:"http://127.0.0.1:3000/img/1.png"},
    {id:2,img_url:"http://127.0.0.1:3000/img/2.jpg"},
    {id:3,img_url:"http://127.0.0.1:3000/img/3.jpg"},
];
res.send(obj)
});
//2.2查找当前分页内容：
app.get("/newslist",(req,res)=>{
    var pno= req.query.pno;
    var pageSize = req.query.pageSize;
    //2.1查找总记录数--总页数
    var sql="SELECT count(id) as c FROM xh_news1";
    var obj = {};
    var progress = 0;
    pool.query(sql,(err,result)=>{
        if(err) throw err;
        var c=Math.ceil(result[0].c/pageSize);
        obj.pageCount = c;
        progress+=50;
        if(progress==100){ 
        res.send(obj);
        }
   });
   //2.2查询当前页的内容
   var sql = " SELECT id,title,img_url,ctime,point";
    sql += " FROM xh_news1";
     sql += " LIMIT ?,?";
    var offset = parseInt(pno-1)*pageSize;//计算分页偏移量
    //3.结果格式
    pageSize = parseInt(pageSize);
    pool.query(sql,[offset,pageSize],(err,result)=>{ 
    if(err) throw err;
        console.log(result);
        progress+=50;
        obj.data=result;
        if(progress==100){ 
        res.send(obj);
        }
    });
    //res.send({code:"ok"})
});
//功能三：发送脚手架新闻详细
app.get("/newsinfo",(req,res)=>{
    var obj = {
        title:"大红大紫(一对)",
        content:"鞭炮轰来财运绕，花篮送来聚财宝，祝词带来福音到，贺宴迎来人气高；新店开业美不少，祝福声声喜来报，祝你财源滚滚至，生意兴隆万事好！",
    };
    res.send(obj);
});
//功能四：y用户发表评论
const qs=require("querystring")
app.post("/postcomment",(req,res)=>{
    //为req对象绑定事件data 客户数据发送成功
    //触发事件
    req.on("data",(buf)=>{
        var str= buf.toString();
        var obj = JSON.parse(str);

        var msg =obj.msg;
        var nid= parseInt(obj.nid);
        var sql = "INSERT INTO xh_comment(content,user_name,ctime,nid) VALUES(?,'匿名',now(),?)";
        pool.query(sql,[msg,nid],(err,result)=>{
            if(err) throw err;
            res.send({code:1,msg:"添加成功"});
        })
    })
})
//功能五 用户获取指定新闻编号所有评论 测试地址 http://127.0.0.1:3000/getComment?id=1&pno=1&pageSize=5
app.get("/getComment",(req,res)=>{
    //获取指定新闻编号
    var nid= parseInt(req.query.id);
    var pno= req.query.pno;
    var pageSize = req.query.pageSize;
    //2.1查找总记录数--总页数
    var sql=" SELECT count(id) as c FROM xh_comment";
    sql += " WHERE nid = ?";
    var obj = {};
    var progress = 0;
    pool.query(sql,[nid],(err,result)=>{
        if(err) throw err;
        var c=Math.ceil(result[0].c/pageSize);
        obj.pageCount = c;
        progress+=50;
        if(progress==100){ 
        res.send(obj);
        }
   });
   //2.2查询当前页的内容
   var sql = " SELECT id,content,ctime,user_name";
    sql += " FROM xh_comment";
    sql += " WHERE nid= ? "
    sql += " ORDER BY id DESC";//降序排列
     sql += " LIMIT ?,?";
    var offset = parseInt(pno-1)*pageSize;//计算分页偏移量
    //3.结果格式
    pageSize = parseInt(pageSize);
    pool.query(sql,[nid,offset,pageSize],(err,result)=>{ 
    if(err) throw err;
        console.log(result);
        progress+=50;
        obj.data=result;
        if(progress==100){ 
        res.send(obj);
        }
    })
    
})
//功能六 返回商品详细信息 pid是商品编号
app.get("/goodsinfo",(req,res)=>{
    
    var id=req.query.id;
    var obj={id:id,title:"情真如初*香槟玫瑰x33枝",now:299,old:399,pid:"2567"};
    res.send(obj);
});
//功能七 购物车数据列表 模拟的数据 没有放在数据库
app.get("/shopCart",(req,res)=>{
    var obj=[];
    obj.push({id:1,title:"情真如初*香槟玫瑰x33枝",price:399,count:25})
    obj.push({id:2,title:"忘情巴黎&粉色、香槟玫瑰x33枝",price:299,count:45})

    obj.push({id:3,title:"纯静如水_11枝粉玫瑰预订",price:199,count:15})

    obj.push({id:4,title:"进口郁金香鲜花芍药混搭花束",price:298,count:10})
    res.send(obj);

})
//功能八 将商品信息添加至购物车
app.get("/addCart",(req,res)=>{
    var pid=req.query.pid;
    var count=req.query.count;
    var reg=/^[0-9]{1,}$/
    if(!reg.test(pid)){
        res.send({code:-1,msg:"参数有误"})//商品编号参数有误
        return;
    }
    if(!reg.test(count)){
        res.send({code:-2,msg:"商品数量参数有误"})
        return;
    }
    res.send({code:1,msg:"添加成功"});
})
//功能八 用户登陆
app.get("/login",(req,res)=>{
    //1.获取参数
    var uname=req.query.uname;
    var upwd=req.query.upwd;
//2.正则表达式验证
//3.sql语句
var sql=" SELECT count (id) as c FROM xh_user";
sql +=" WHERE uname=? AND upwd = md5(?)";
pool.query(sql,[uname,upwd],(err,result)=>{
    if(err) throw err;
    if(result[0].c==0){
        res.send({code:-1,msg:"用户名或者密码有误"})
    }else {
        res.send({code:1,msg:"登陆成功"})
    }
})
})
//微信小程序中的newslist1
/*app.get("/newslist1",(req,res)=>{
    var obj= [
        {id:1,ctime:"2018-3-18",title:"情真如初*香槟玫瑰x33枝",img_url:"http://127.0.0.1:3000/img/FH62125370(1).jpg",desc:"最美时光"},
        {id:2,ctime:"2018-3-18",title:"忘情巴黎&粉色、香槟玫瑰x33枝",img_url:"http://127.0.0.1:3000/img/FH62125370(2).jpg",desc:"恋你一生"},
        {id:3,ctime:"2018-3-18",title:"纯静如水_11枝粉玫瑰预订",img_url:"http://127.0.0.1:3000/img/FH62125370(3).jpg",desc:"此生挚爱"},
    ];
    res.send(obj);
})
//微信小程序 
app.post("/postProduct",(req,res)=>{
    req.on("data",(buff)=>{
        var obj=qs.parse(buff.toString());
        var pno = obj.pno;
        var price=obj.price;
        res.send({code:1,msg:":"+pno+":"+price});
    });
   
});*/
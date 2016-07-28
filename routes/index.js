var express = require('express');
var router = express.Router();
// var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
//个人资料修改
router.post('/profic/update',function(req,res,next){
     //生成multiparty对象，并配置上传目标路径
    

});

router.post('/changepsw',function(req,res,next){
    if(!req.session.user){                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
        var id = req.session.user['_id'];
        var  oldpsw = req.body.oldpsw;
        var  newpsw = req.body.newpsw;
        var renewpsw = req.body.renewpsw;
        if(oldpsw == req.session.user['password'] ){
            if(  newpsw == renewpsw ){
                    var User = global.dbHandel.getModel('user');
                    User.update({_id:req.session.user['_id']},{$set : { password : newpsw  } },{ upsert : true },function(err){
                            if(err){
                                console.log(err);
                            }else{
                                console.log('密码修改成功');
                                res.redirect('/profic');
                            }
                    });
            }else{
                console.log('两次输入的密码不一致');
                res.redirect('/changepsw');
            }
        }else{
            console.log('原密码错误');
            res.redirect('/changepsw');
        }
});


//显示个人资料页面
router.get('/profic',function(req,res){
    if(!req.session.user){                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    var welcome = 'welcome to  profile';
    res.render('profic' , {profic:welcome} );
});
//显示个人密码修改页面
router.get('/changepsw',function(req,res){
     if(!req.session.user){                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    var welcome = 'welcome to here to change your password';
    res.render('changepsw' , {profic:welcome} );
});

//异步处理评论
router.post('/sendcomment',function(req,res,next){
    if(!req.session.user){                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    var  userid = req.body.userid;
    var articleid = req.body.articleid;
    var comtext = req.body.comtext;
    var comtime = req.body.comtime;
    var doc = {userid:userid,articleid:articleid,comtext:comtext,comtime:comtime};
    console.log(doc);
    var Comment  = global.dbHandel.getModel('comment');
    Comment.create(doc,function(err){
        if(err){
           res.send(500);
           console.log(err);
       }else{
        console.log('comment success');
        res.send(200);
    }
});
});

//前台首页，登陆注册，文章列表页
router.get('/', function(req, res, next) {
    var Article = global.dbHandel.getModel('article');
    Article.find({},function(err,doc){
             if(err){                                         //错误就返回给原post处（login.html) 状态码为500的错误
                res.send(500);
                console.log(err);
            }
             //console.log(doc);
             res.render('index', { title: 'Express' ,articles:doc});
         });

});

//显示文章详情信息显示具体文章内容和留言信息。
router.get('/list/:id/:page?', function(req, res, next) {
    if(!req.session.user){                 
        var user = null;
    }else{
        var user = req.session.user;
    }
    var Article = global.dbHandel.getModel('article');
    var Comment = global.dbHandel.getModel('comment');
    id = req.params.id;
    if(req.params.page){
        var page = parseInt(req.params.page);
    }else{  
        var page = 1;
    }
    var data = [];
        // var a = () => {
        //     return "asdadad";
        // }
        /***
        ***/
        //promise 执行多个条件语句,
        var get_article = ()=>{
            return Article.findOne({_id:id}).exec();
        }
        var get_comment=()=>{
            return Comment.find({articleid:id}).sort({'comtime':-1}).limit(2).skip( (page-1)*2 ).exec();
        }
        Promise.all([get_article(), get_comment()])
        .then( (data) => {
            res.render('list',{list: data[0],comments:data[1],user:user,page:page,isFirstPage:page-1==0,isLastPage: (page-1)*2==data[1].length  });
        })
        .catch( (e) => {
            console.log(e);
            res.send({err:e});
        })
    });

//前台用户退出
router.get('/logout',function(req,res){
    req.session.user = null;
    req.session.error = null;
    res.redirect('/');
});

//前台用户登陆
router.get('/login',function(req,res){
    res.render("login",{title:'User Login'});
});

//前台用户登陆处理，验证
router.post("/login",function(req,res){
            //get User info
         //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在router.js中已经实现)
         var User = global.dbHandel.getModel('user');  
        var uname = req.body.uname;                //获取post上来的 data数据中 uname的值
                User.findOne({name:uname},function(err,doc){   //通过此model以用户名的条件 查询数据库中的匹配信息
                    if(err){                                         //错误就返回给原post处（login.html) 状态码为500的错误
                        res.send(500);
                        console.log(err);
                    }else if(!doc){                                 //查询不到用户名匹配信息，则用户名不存在
                        req.session.error = '用户名不存在';
                        res.send(404);                            //    状态码返回404
                    //    res.redirect("/login");
                }else{ 
                        if(req.body.upwd != doc.password){     //查询到匹配用户名的信息，但相应的password属性不匹配
                            req.session.error = "密码错误";
                            res.send(404);
                        //    res.redirect("/login");
                        }else{                                     //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                            req.session.user = doc;
                            res.send(200);
                        //    res.redirect("/home");
                    }
                }
            });
});

//前台用户注册页面
    router.get('/register',function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
        res.render("register",{title:'User register'});
    });

//前台用户注册处理程序
router.post('/register',function(req,res){ 
     //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在router.js中已经实现)
     var User = global.dbHandel.getModel('user');
     var uname = req.body.uname;
     var upwd = req.body.upwd;
    User.findOne({name: uname},function(err,doc){   // 同理 /login 路径的处理方式
        if(err){ 
            res.send(500);
            req.session.error =  '网络异常错误！';
            console.log(err);
        }else if(doc){ 
            req.session.error = '用户名已存在！';
            res.send(500);
        }else{ 
            User.create({                             // 创建一组user对象置入model
                name: uname,
                password: upwd
            },function(err,doc){ 
               if (err) {
                res.send(500);
                console.log(err);
            } else {
                req.session.error = '用户名创建成功！';
                res.send(200);
            }
        });
        }
    });
});

//前台登陆后的主页面
router.get("/home",function(req,res){ 
    if(!req.session.user){                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    var name = req.session.user['name'];
    res.render("home",{title:'Home' , name: name});         //已登录则渲染home页面
});

module.exports = router;
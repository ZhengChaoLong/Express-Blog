var express = require('express');
var router = express.Router();
//url 访问时为admin 加上以下的路由才能访问
/* GET admin listing. */

//后台登陆处理程序
router.post('/', function(req, res, next) {
    if(req.session.admin) next();
    var Admin = global.dbHandel.getModel('admin');
    var adname = req.body.adname;                //获取post上来的 data数据中 uname的值
    Admin.findOne({adname:adname},function(err,doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
        if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
            res.send(500);
            console.log(err);
        } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
            req.session.error = '用户名不存在';
            res.render('admin/login', {title: "后台登录页"});
        } else {
            if (req.body.apwd != doc.password) {     //查询到匹配用户名的信息，但相应的password属性不匹配
                req.session.error = "密码错误";
                res.render('admin/login', {title: "后台登录页"});
            } else {                                     //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                req.session.admin = doc;
                res.redirect("/home");
            }
        }
    })
})

//显示后台登陆页面
router.get('/', function(req, res, next) {
    res.render('admin/login',{title:'Admin'});
});

//过滤url
router.all('/:id',function (req,res,next) {
    if(!req.session.admin){
        res.redirect('/admin/');
    }
    else{
        next();
    }
})


//显示所有的留言
router.get('/comment',function(req,res,next){
    var Comment = global.dbHandel.getModel('comment');
    Comment.find({},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            console.log('show comment');
            return res.render('admin/comment',{comments:doc});
        }
    });
});



//删除留言
router.get('/comment/delete/:id',function(req,res,next){
    var id = req.params.id;
    var Comment  = global.dbHandel.getModel('comment');
    Comment.remove({_id:id},function(err){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            res.redirect('/admin/comment');
        }
    });
});


//文章分类接口
router.get('/category',function(req,res,next){
    var Category = global.dbHandel.getModel('category');
    Category.find({isdelete:0}).sort({'_id':-1}).exec(function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            console.log(doc)
           res.render('admin/category',{ categorys : doc })
        }
    });
});

//该类别的文章列表
router.get('/articles/category/:cname',function(req,res,next){
            var cname = req.params.cname;
            var  Article = global.dbHandel.getModel('article');
            Article.find({cname:cname,isdelete:0},function(err,doc){
                    if(err){
                        res.send(500);
                        console.log(err);
                    }else{
                        res.render('admin/articleslist',{title:cname,articles:doc});
                    }
            });
});

//删除分类
router.get('/category/delete/:id',function(req,res,next){
     var Category = global.dbHandel.getModel('category');
     var id = req.params.id;
    Category.update({_id:id},{isdelete : 1},{overwrite:false},function(err){
                  if(err){
                        res.send(500);
                    }else{
                        res.redirect('/admin/category');
                    }
        });
     
});

//编辑分类
router.post('/category/edit/',function(req,res,next){
    var Category = global.dbHandel.getModel('category');
    var cname = req.body.cname;
    var id = req.body.id;
    Category.update({_id:id},{cname:cname},{overwrite:false},function (err) {
        if(err){
            res.send(500);
        }else{
            res.redirect('/admin/category');
        }
    })

});

//添加分类
router.post('/category/add',function(req,res,next){
        var Category = global.dbHandel.getModel('category');
        var cname = req.body.cname;
    console.log(cname)
        var doc = {cname:cname};
        Category.create(doc,function(err){
            if(err){
                    res.send(500);
                    console.log(err);
            }else{
                    res.redirect('/admin/category');
            }
        });

});

//后台管理员列表页
router.get('/administrator',function(req,res,next){
             //res.locals.success = req.session? req.session.success:null;
    var Admin = global.dbHandel.getModel('admin');
    Admin.find({},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            res.render('admin/administrator', { admins:doc,success: req.flash('success')});
        }
    });
});

//管理员删除
router.get('/administrator/delete/:id',function(req,res,next){
    var id = req.params.id;
    var Admin  = global.dbHandel.getModel('admin');
    Admin.remove({_id:id},function(err){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            res.redirect('/admin/administrator');
        }
    });
});

//创建一个管理员
router.post('/administrator/add',function(req,res,next){
    adname = req.body.adname;
    password = req.body.password;
    var Admin  = global.dbHandel.getModel('admin');
    var doc = {adname:adname,password:password};
    Admin.create(doc,function(err){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            console.log('create user ok');
            req.flash('success','create admin ok');
            res.redirect('/admin/administrator');
        }
    });
});


//后台用户列表页
router.get('/users',function(req,res,next){
  	var User = global.dbHandel.getModel('user');
  	User.find({},function(err,doc){
  		if(err){
  			res.send(500);
  			console.log(err);
  		}else{
  			res.render('admin/userlist', { title: 'Admin',users:doc,success: req.flash('success')});
  		}
  	});
});

//用户删除
router.get('/users/delete/:id',function(req,res,next){
	var id = req.params.id;
	var User  = global.dbHandel.getModel('user');
	User.remove({_id:id},function(err){
		if(err){
			res.send(500);
			console.log(err);
		}else{
			res.redirect('/admin/users');
		}
	});
});

//创建一个用户
router.post('/users/add',function(req,res,next){
    username = req.body.username;
    password = req.body.password;
    var User  = global.dbHandel.getModel('user');
    var doc = {name:username,password:password};
    User.create(doc,function(err){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            console.log('create user ok');
            req.flash('success','create user ok');
            res.redirect('/admin/users');
        }
    });
});


//显示后台主页
router.get('/home', function(req, res, next) {    
                if(!req.session.admin){                     //到达/admin/home路径首先判断是否已经登录
                    req.session.error = "请先登录"
                    res.redirect("/admin");                //未登录则重定向到 /login 路径
                }
                var adname =req.session.admin.adname;
                var Article = global.dbHandel.getModel('article');
                Article.find({isdelete:0},function(err,doc){
                  if(err){                                         //错误就返回给原post处（login.html) 状态码为500的错误
                        res.send(500);
                        console.log(err);
                    }else{
                        res.render('admin/home', { title: 'Admin',adname:adname,articles:doc});
                    }
        });
                //res.render('admin/home', { title: 'Admin',adname:adname,articles:articles});
});

//显示回收站
router.get('/articles/recycle',function(req,res,next){
    var Article = global.dbHandel.getModel('article');
    Article.find({isdelete:1},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            console.log(doc.length);
            res.render('admin/recycle',{articles:doc});
        }
    });
});

//恢复回收站的文章
router.get('/recycle/restore/:id',function(req,res,next){
    id = req.params.id;
    var Article = global.dbHandel.getModel('article');
    Article.update({_id:id},{ $set : { isdelete :  0 }},{ upsert : true },function(err){
        if(err){
            console.log(err);
        }else{
            console.log('restore ok');
            res.redirect('/admin/articles/recycle');
        }
    });
});
//永久删除回收站的文章
router.get('/recycle/delete/:id',function(req,res,next){
    id = req.params.id;
    var Article = global.dbHandel.getModel('article');
    Article.remove({_id:id },function(err){
            if(err){
                console.log(err);
            }else{
                console.log('permenatary delete ok');
                res.redirect('/admin/articles/recycle');
            }
    });
});

//清空回收站
router.get('/recycle/flush',function(req,res,next){
    var Article = global.dbHandel.getModel('article');
    Article.remove({isdelete:1},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            res.render('admin/recycle',{articles:doc});
        }
    });
});

//文章列表页
router.get('/articles',function(req,res,next){
    var Article = global.dbHandel.getModel('article');
    var Author = global.dbHandel.getModel('admin');
    var Category = global.dbHandel.getModel('category');
    Article.find({isdelete:0},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            for(var i=0;i<doc.length;i++){
                doc[i].formated_date = doc[i].date.toLocaleString();
            }
            i=0;
            var j=0
            var k=0;
            var categories='';

            //作者名
            var dealAuthor = function () {
                console.log(i)
                console.log(doc[i])
                Author.findById(doc[i]._authorid,function (err,adv) {
                    if(err) sendStatus(500);
                    doc[i].author_name = adv.adname
                    if(i+1==doc.length){
                        dealCategory();return;
                    }
                    i++;
                    dealAuthor();
                });
            };


            //分类名
            var dealCategory = function () {
                Category.findById(doc[j]._categoryid[k],function (err,adv) {
                    categories += ((k==0?'':',')+adv.cname)
                    if(k+1==doc[j]._categoryid.length){
                        doc[j].categorys_name = categories;
                        categories='';
                        if(j+1==doc.length){
                            dealRender();return;
                        }
                        j++;k=0;
                    }
                    else k++;
                    dealCategory();
                })
            }

            var dealRender = function () {
                res.render('admin/articleslist',{title:'文章列表',articles:doc});
            }
            if(!doc.length) dealRender();
            else dealAuthor();


        }
    })
});

//添加文章页面
router.get('/add',function(req,res,next){
    var Category = global.dbHandel.getModel('category');
    Category.find({isdelete:0},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else{
            res.render('admin/add',{title:'文章发布',categorys:doc});
        }
    })
});

//文章修改处理
router.post('/articles/update/:id',function(req,res,next){
        var id = req.params.id;
        var title = req.body.title;
        var conten =  req.body.conten;
        var cname = req.body.cname;
        var Article = global.dbHandel.getModel('article');
        Article.update({_id:id},{ $set : { title :  title  , conten :  conten ,cname:cname}  },{ upsert : true},function(err){
            if(err){
                console.log(err);
            }else{
                console.log('update ok');
                res.redirect('/admin/home');
            }
        });

});

//处理文章发布
router.post('/articles/add',function(req,res,next){

    console.log(req.body)

    var title = req.body.title;
    var content = req.body.content;
    var cids = req.body.cids;
    console.log(req.session.admin)
    var aid = req.session.admin._id;
    var doc = { title :  title , content: content ,_categoryid:cids,_authorid:aid};
    var Article = global.dbHandel.getModel('article');
        Article.create(doc, function(error){
        if(error) {
            console.log(error);
        } else {
            console.log('save ok');
            res.redirect('/admin/add');
        }
    });
});


//后台主页下admin/home下的文章删除处理--------软删除
router.get('/articles/delete/:id',function(req,res,next){
     var Article = global.dbHandel.getModel('article');
     id = req.params.id;
     Article.update({_id:id},{  $set : { isdelete : 1 }}, { upsert : true },function(err){
                  if(err){                                         //错误就返回给原post处（login.html) 状态码为500的错误
                        res.send(500);
                        console.log(err);
                    }else{
                        res.redirect('/admin/home');
                    }
        });
     
});

router.get('/administrator',function (req,res,next) {
    res.render('admin/administrator');
})

//后台管理退出
  router.get('/logout',function(req,res){
        req.session.admin = null;
        req.session.error = null;
        res.redirect('/admin');
    });



module.exports = router;

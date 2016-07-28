var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var models = require("./models");


for(var m in models){
    console.log(m);
    mongoose.model(m,new Schema(models[m]));
}

// var cate = mongoose.model('category');
//
// var list = ['java','node.js','前端'];
// for(var li in list) {
//     new cate({
//         cname: list[li]
//     }).save();
// }
//

module.exports = { 
    getModel: function(type){ 
        return _getModel(type);
    }
};

var _getModel = function(type){ 
    return mongoose.model(type);
};
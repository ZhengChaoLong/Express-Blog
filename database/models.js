module.exports = { 
    user:{ 
        name:{type:String,required:true},
        picurl:{type:String},
        password:{type:String,required:true}
    },
    article:{
         title:{type:String,required:true},
         _authorid:{type:String,required:true},
         content:{type:String,required:true},
         data:{type:Date,default: Date.now},
         _categoryid:[String],
         isdelete:{type:Number,default:0}
    },
    admin:{
        adname:{type:String,required:true},
        password:{type:String,required:true}
    },
    category:{
        cname:{type:String,required:true},
        isdelete:{type:Number,default:0}
    },
    comment:{
        userid:{type:String,required:true},
        articleid:{type:String,required:true},
        comtext:{type:String,required:true},
        comtime:{type:String,required:true}
    }
};
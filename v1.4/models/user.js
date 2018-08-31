var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var UserSchema=new mongoose.Schema(
    {
        username:String,
        passowrd:String
    });
    UserSchema.plugin(passportLocalMongoose);//this will run some method
    module.exports = mongoose.model("User",UserSchema);
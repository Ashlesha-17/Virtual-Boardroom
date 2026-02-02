const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
    key : {type:String, required:true, unique:true},
    value : {type:String,required:true},
    updatedAt : {type:Date, default:Date.now}
});

module.exports = mongoose.model("Config", ConfigSchema);
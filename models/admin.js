const mongoose = require('mongoose')


const admin = new mongoose.Schema({

    username:String,
    email:String,
    password:String

})

const adminModel = mongoose.model('user' , admin)
module.exports = adminModel
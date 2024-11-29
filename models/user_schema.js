const {model,Schema} = require('mongoose')

let userSchema = new Schema({
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
})


module.exports = model('UserModel', userSchema)
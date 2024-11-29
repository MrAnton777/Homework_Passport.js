const {model,Schema} = require('mongoose')

let bookSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        default:""
    },
    authors:{ type:String,},
    favourite:{ type:String,},
    fileCover:{ type:String,},
    fileName:{ type:String,},
})


module.exports = model('BookModel', bookSchema)
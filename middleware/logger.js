const fs = require('fs')
const os = require('os')

module.exports = (req,res,next) =>{
    let now = Date.now()
    let {url, method} = req

    let data = `${now} ${method} ${url}`

    fs.appendFile('server.log',data + os.EOL,(err)=>{
        if (err) throw err;
    })

    next()
}
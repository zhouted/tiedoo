const FileDao = require('./dao-file.js')

class UserImg extends FileDao{
    constructor(){
        super('user-img')
    }
}

module.exports = new UserImg()

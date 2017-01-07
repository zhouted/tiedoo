//@abandoned
const Dao = require('./dao.js')

class Company extends Dao{
    constructor(){
        super('company')
    }
}

module.exports = new Company()

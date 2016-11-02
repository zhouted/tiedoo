const Dao = require('./dao.js')

class Customer extends Dao{
    constructor(){
        super('customer')
    }
}

module.exports = new Customer()

const daoCust = require(appPath + '/dao/customer.js')
// const daoCustImg = require(appPath + '/dao/customer-img.js')

let srvCust = {}

srvCust.load = function(){
    return daoCust.find(...arguments)
}

srvCust.loadById = function(id, p){
    return daoCust.findById(id, p)
}

srvCust.save = function(doc){
    return daoCust.save(doc)
}

srvCust.delete = function(){
    return daoCust.remove(...arguments)
}

module.exports = srvCust

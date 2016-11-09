const daoCust = require(appPath + '/dao/customer.js')
// const daoCustImg = require(appPath + '/dao/customer-img.js')

let srvCust = {}

srvCust.load = function(param, project){
    let cond = {}
    if (param.key){
        key = new RegExp(param.key)
        cond.$or = [{name: key}, {addr: key}]
    }
    let sortBy = param.sortBy = param.sortBy||{name:1}
    let paging = param.paging = param.paging||{pageSize:10}
    return daoCust.find(cond, project, sortBy, paging)
}

srvCust.loadById = function(id, project){
    return daoCust.findById(id, project)
}

srvCust.save = function(doc){
    return daoCust.save(doc)
}

srvCust.delete = function(){
    return daoCust.remove(...arguments)
}

module.exports = srvCust

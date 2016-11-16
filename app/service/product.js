const daoProduct = require(appPath + '/dao/product.js')
const daoProductImg = require(appPath + '/dao/product-img.js')

let srvProduct = {}

srvProduct.load = function(param, project){
    let cond = {}
    if (param.key){
        key = new RegExp(param.key)
        cond.$or = [{code: key}, {name: key}, {'specs.0.name': key}]
    }
    let sortBy = param.sortBy = param.sortBy||{code:1}
    let paging = param.paging = param.paging||{pageSize:10}
    return daoProduct.find(cond, project, sortBy, paging)
}

srvProduct.loadById = function(id, project){
    return daoProduct.findById(id, project)
}

srvProduct.save = function(doc){
    return daoProduct.save(doc)
}

srvProduct.delete = function(){
    return daoProduct.remove(...arguments)
}

srvProduct.saveImg = function(file){
    return daoProductImg.fsave(file)
}

srvProduct.loadImg = function(id){
    return daoProductImg.findById(id)
}

srvProduct.newSpecId = function(){
    return daoProduct.newId()
}

module.exports = srvProduct

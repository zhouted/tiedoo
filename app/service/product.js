const daoProduct = require(appPath + '/dao/product.js')
const daoProductImg = require(appPath + '/dao/product-img.js')

let srcProduct = {}

srcProduct.load = function(param, project){
    let cond = {}
    if (param.key){
        key = new RegExp(param.key)
        cond.$or = [{code: key}, {name: key}, {'specs.0.name': key}]
    }
    let sortBy = param.sortBy = param.sortBy||{name:1}
    let paging = param.paging = param.paging||{pageSize:10}
    return daoProduct.find(cond, project, sortBy, paging)
}

srcProduct.loadById = function(id, project){
    return daoProduct.findById(id, project)
}

srcProduct.save = function(doc){
    return daoProduct.save(doc)
}

srcProduct.delete = function(){
    return daoProduct.remove(...arguments)
}

srcProduct.saveImg = function(file){
    return daoProductImg.fsave(file)
}

srcProduct.loadImg = function(id){
    return daoProductImg.findById(id)
}

module.exports = srcProduct

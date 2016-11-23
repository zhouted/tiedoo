const daoCate = require(appPath + '/dao/category.js')
// const daoCateImg = require(appPath + '/dao/category-img.js')

let srvCate = {}

srvCate.load = function(param, project){
    let cond = {}
    if (param.key){
        key = new RegExp(param.key)
        cond.$or = [{code: key}, {'name': key}]
    }
    let sortBy = param.sortBy = param.sortBy||{code:1}
    let paging = param.paging = param.paging||{pageSize:100000}
    return daoCate.find(cond, project, sortBy, paging)
}

srvCate.loadById = function(id, project){
    return daoCate.findById(id, project)
}

srvCate.save = function(doc){
    if (doc){
        doc.pcode = doc.pcode||''
        doc.scode = doc.scode||''
        doc.code = doc.pcode + doc.scode
    }
    return daoCate.save(doc)
}

srvCate.removeByIds = function(ids){
    return daoCate.removeByIds(ids)
}

module.exports = srvCate

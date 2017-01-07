//@abandoned

const daoComp = require(appPath + '/dao/company.js')
const daoCompImg = require(appPath + '/dao/company-img.js')

let srvComp = {}

srvComp.load = function(){
    return daoComp.findOne({}) // 用户公司信息只有一条记录
}

srvComp.save = function(doc){
    return daoComp.save(doc)
}

srvComp.saveImg = function(file){
    return daoCompImg.fsave(file)
}

srvComp.loadImg = function(id){
    return daoCompImg.findById(id)
}

module.exports = srvComp

const daoComp = require(appPath + '/dao/company.js')
const daoCompImg = require(appPath + '/dao/company-img.js')

let srvComp = {_dao: daoComp, _daoImage: daoCompImg}

srvComp.load = function(){
    return daoComp.findOne({})
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

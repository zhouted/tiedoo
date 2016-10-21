const daoComp = require(appPath + '/dao/company.js')

let mComp = {_dao: daoComp}

mComp.load = function(){
    return daoComp.findOne({})
}

mComp.save = function(doc){
    return daoComp.save(doc)
}

module.exports = mComp

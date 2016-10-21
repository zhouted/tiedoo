const dsCur = require(appPath + '/dao/current.js')
// const DataStore = require(appPath + '/dao/dao.js')

let mCur = {_dao: dsCur}

mCur.getCur = function(){
    return dsCur.findOne({})
}

mCur.save = function(cur){
    return dsCur.save(cur)
}

module.exports = mCur

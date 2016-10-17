const DataStore = require(appPath + '/dao/dao.js')

let dsCur = new DataStore('current')

function getCur(){
    return dsCur.findOne({})
}

function save(cur){
    return dsCur.save(cur)
}

module.exports = {
    getCur,
    save
}

const daoCurr = require(appPath + '/dao/current.js')
const daoUser = require(appPath + '/dao/user.js')
const md5 = require('md5')

let srvCurr = {
    _dao: daoCurr,
}

srvCurr.load = function() {
    return daoCurr.findOne({})
}

srvCurr.loadCurrUser = function() {
    return new Promise((resolve, reject) => {
        daoCurr.findOne({}).then(curr => {
            if (curr) {
                return daoUser.findOne({
                    _id: curr.uid
                })
            }
            resolve(null)
        }).then(user => {
            resolve(user)
        }).catch(err => {
            reject(err)
        })
    })
}

// srvCurr.save = function(cur) {
//     return daoCurr.save(cur)
//         // .then(rst => {
//         //     Object.assign(srvCurr, cur)
//         // })
// }

module.exports = srvCurr

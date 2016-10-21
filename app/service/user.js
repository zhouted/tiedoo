const daoUser = require(appPath + '/dao/user.js')
const md5 = require('md5')

let srvUser = {_dao: daoUser}

// srvUser.load = function() {
//     return new Promise((resolve, reject) => {
//         daoCurr.findOne({}).then(run => {
//             if (run) {
//                 return daoUser.findOne({
//                     _id: run.uid
//                 })
//             }
//             resolve(null)
//         }).then(user => {
//             resolve(user)
//         }).catch(err => {
//             reject(err)
//         })
//     })
// }

srvUser.save = function(user) {
    return daoUser.save(user)
}

module.exports = srvUser

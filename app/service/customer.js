const daoCust = require(appPath + '/dao/customer.js')
// const daoCustImg = require(appPath + '/dao/customer-img.js')
const remoteContact = require(appPath + '/service/remote/contact.js')

let srvCust = {}

srvCust.load = function(param, project){
    let cond = {}
    if (param.key){
        let key = new RegExp(param.key)
        cond.$or = [{name: key}, {'contacts.0.name': key}]
    }
    if (param.group){
        cond.group = param.group
    }
    let sortBy = param.sortBy = param.sortBy||{name:1}
    let paging = param.paging = param.paging||{pageSize:10}
    return daoCust.find(cond, project, sortBy, paging)
}

srvCust.loadById = function(id, project){
    return daoCust.findById(id, project)
}

srvCust.save = function(doc){
    return daoCust.save(doc)
}

srvCust.removeByIds = function(ids){
    return daoCust.removeByIds(ids)
}

srvCust.download = function(token, cb){//从云端下载客户数据
    return new Promise((resolve, reject) => {
        remoteContact.getAllContacts(token).then(customers => {
            cb && cb('contact', 'merging')
            return daoCust.find({}).then(existCusts => {
                let mergedCusts = mergeCates(existCusts, customers)
                cb && cb('contact', 'merged')
                // return srvCate.saveAll(mergedCates).then(rst => {
                return daoCust.upsert(mergedCusts).then(rst => {
                    cb && cb('contact', 'done')
                    resolve(rst)
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
    function mergeCates(existCusts, customers){
        existCusts = existCusts || []
        for (let cust of customers){
            for (let exist of existCusts){
                if (exist.id === cust.id){
                    tfn.merge(exist, cust)
                    cust._id = exist._id
                    break
                }
            }
            if (!cust._id){
                existCusts.push(cust)
            }
        }
        return existCusts
    }
}

module.exports = srvCust

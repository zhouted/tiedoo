const daoProduct = require(appPath + '/dao/product.js')
const daoProductImg = require(appPath + '/dao/product-img.js')
const daoProductDiscard = require(appPath + '/dao/product-discard.js')

let srvProduct = {}

srvProduct.load = function(param, project){
    let cond = {}
    if (param.key){
        key = new RegExp(param.key)
        cond.$or = [{code: key}, {name: key}, {'specs.0.name': key}]
    }
    let sortBy = param.sortBy = param.sortBy||{code:1}
    let paging = param.paging = param.paging||{pageSize:10}
    let dao = param.discard? daoProductDiscard : daoProduct
    return dao.find(cond, project, sortBy, paging)
}

srvProduct.loadById = function(id, project){
    return daoProduct.findById(id, project)
}

srvProduct.save = function(doc){
    return daoProduct.save(doc)
}

srvProduct.saveImg = function(file){
    return daoProductImg.fsave(file)
}

srvProduct.loadImg = function(id){
    return daoProductImg.findById(id)
}

srvProduct.newSpecId = function(){
    return daoProduct.newId()
}

srvProduct.discardSpecByIds = function(specIds){
    let p = new Promise((resolve, reject) => {
        let p = daoProduct.find({'specs._id': {$in: specIds}})
        p.then(docs => {
            if (!docs) return resolve(0)
            let pAll = docs.map(doc => this.discardPdSpecs(doc, specIds)) // 得到作废每个产品的promise数组
            Promise.all(pAll).then(rst =>{
                resolve(rst)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return p
}

srvProduct.discardPdSpecs = function(pd, specIds){ // 作废产品指定的规格s
    if (!pd || !pd.specs || !pd.specs.length) return 0
    if (!specIds || !specIds.length) return 0
    let specs = pd.specs; pd.specs = []
    let pdBasic = tfn.merge({}, pd); delete pdBasic.specs
    let discard = [] //待废弃的规格数据
    for (let spec of specs) {// 分离要作废的和要保留的规格
        if (!spec) continue
        if (specIds.indexOf(spec._id) >= 0){
            discard.push(spec)
        }else{
            pd.specs.push(spec)
        }
    }
    let p = new Promise((resolve, reject) => {
        // 先把作废的规格保存到discard里
        let p1 = daoProductDiscard.update({_id: pdBasic._id}, {$set: pdBasic, $push: {specs: {$each: discard}}}, {upsert:true})
        p1.then((rst) => {
            let p2 // 再保存或删除产品
            if (!pd.specs || !pd.specs.length){ // 没有规格了就删除产品
                p2 = daoProduct.remove({_id: pd._id})
            }else{
                p2 = daoProduct.save(pd)
            }
            return p2.then(() => {
                resolve(rst)
            })
        }).catch(err => {
            reject(err)
        })
    })
    return p
}

srvProduct.restoreSpecByIds = function(specIds){
    let p = new Promise((resolve, reject) => {
        let p = daoProductDiscard.find({'specs._id': {$in: specIds}})
        p.then(docs => {
            if (!docs) return resolve(0)
            let pAll = docs.map(doc => this.restorePdSpecs(doc, specIds)) // 得到恢复每个产品的promise数组
            Promise.all(pAll).then(rst =>{
                resolve(rst)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return p
}

srvProduct.restorePdSpecs = function(pdDiscard, specIds){ // 恢复产品指定的规格s
    if (!pdDiscard || !pdDiscard.specs || !pdDiscard.specs.length) return 0
    if (!specIds || !specIds.length) return 0
    let specs = pdDiscard.specs; pdDiscard.specs = []
    let pdBasic = tfn.merge({}, pdDiscard); delete pdBasic.specs
    let restore = [] // 待恢复的规格数据
    for (let spec of specs) {// 分离要恢复的和要保留的规格
        if (!spec) continue
        if (specIds.indexOf(spec._id) >= 0){
            restore.push(spec)
        }else{
            pdDiscard.specs.push(spec)
        }
    }
    let p = new Promise((resolve, reject) => {
        daoProduct.findOne({_id: pdBasic._id}).then(pd => {// 查询出现有产品，TODO:判断重复性
            let p1, p2
            if (!pd) {//不存在才恢复产品基本信息
                p1 = daoProduct.update({_id: pdBasic._id}, {$set: pdBasic, $push: {specs: {$each: restore}}}, {upsert:true})
            }else{//只恢复规格数据
                p1 = daoProduct.update({_id: pdBasic._id}, {$push: {specs: {$each: restore}}})
            }
            return p1.then((rst) => {// 先把要恢复的规格保存到product里，再保存或删除
                if (!pdDiscard.specs || !pdDiscard.specs.length){ // 没有规格了就删除产品
                    p2 = daoProductDiscard.remove({_id: pdDiscard._id})
                }else{
                    p2 = daoProductDiscard.save(pdDiscard)
                }
                return p2.then(() => {
                    resolve(rst)
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
    return p
}

// srvProduct.removeByIds = function(ids){
//     return daoProductDiscard.removeByIds(ids)
// }

srvProduct.removeSpecByIds = function(specIds){
    let p = new Promise((resolve, reject) => {
        let p = daoProductDiscard.find({'specs._id': {$in: specIds}})
        p.then(docs => {
            if (!docs) return resolve(0)
            let pAll = docs.map(doc => this.removePdSpecs(doc, specIds)) // 得到删除每个产品的promise数组
            Promise.all(pAll).then(rst =>{
                resolve(rst)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return p
}

srvProduct.removePdSpecs = function(pdDiscard, specIds){ // 恢复产品指定的规格s
    if (!pdDiscard || !pdDiscard.specs || !pdDiscard.specs.length) return 0
    if (!specIds || !specIds.length) return 0
    let specs = pdDiscard.specs; pdDiscard.specs = []
    let removes = [] // 待删除的规格数据
    for (let spec of specs) {// 分离要删除的和要保留的规格
        if (!spec) continue
        if (specIds.indexOf(spec._id) >= 0){
            removes.push(spec)
        }else{
            pdDiscard.specs.push(spec)
        }
    }
    let p
    if (!pdDiscard.specs || !pdDiscard.specs.length){ // 没有规格了就删除产品
        p = daoProductDiscard.remove({_id: pdDiscard._id})
    }else{
        p = daoProductDiscard.save({specs: pdDiscard.specs})
    }
    return p
}

module.exports = srvProduct

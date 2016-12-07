const daoProduct = require(appPath + '/dao/product.js')
const daoProductImg = require(appPath + '/dao/product-img.js')
const daoProductDiscard = require(appPath + '/dao/product-discard.js')

const srvProduct = {}
const unclassified = require(appPath + '/service/category.js').unclassified

srvProduct.load = function(param, project){
    let cond = {}
    if (param.key){// search key
        key = new RegExp(param.key)
        cond.$or = [{code: key}, {name: key}, {tags: param.key}]
    }
    if (param.category && param.category.code){// category code
        if (param.category.code == unclassified.code){
            cond.$or = [{category:null}, {'category.code':''}]
        }else{
            cond['category.code'] = new RegExp('^'+param.category.code)
        }
    }
    if (param.pdIds){
        cond._id = {$in: param.pdIds}
    }
    let sortBy = param.sortBy = param.sortBy||{code:1}
    let paging = param.paging// = param.paging||{pageSize:10}
    let dao = !param.discard? daoProduct : daoProductDiscard
    return dao.find(cond, project, sortBy, paging)
}

srvProduct.loadById = function(id, discard, project){
    let dao = !discard? daoProduct : daoProductDiscard
    return dao.findById(id, project)
}

srvProduct.save = function(pd, discard){
    if (pd && pd.specs && pd.specs.length){
        pd.specs.sort((a, b) => {
            return (a.code||'') > (b.code||'')
        })
    }
    let dao = !discard? daoProduct : daoProductDiscard
    let p = new Promise((resolve, reject) => {
        checkCode(pd).then(() => {
            return dao.save(pd).then((rst) => {
                resolve(rst)
            })
        }).catch(err => reject(err))
    })
    return p
    function checkCode(pd, oCode){
        let p = new Promise((resolve, reject) => {
            let cond = {$not: {_id: pd._id}, code: pd.code}
            let p1 = daoProduct.count(cond)
            let p2 = daoProductDiscard.count(cond)
            Promise.all([p1,p2]).then(cnts => {
                if (cnts[0] || cnts[1]){
                    return reject(new Error('产品编码已存在！'))
                }
                resolve(0)
            })
        })
        return p
    }
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

//批量作废产品规格
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
    let pdBasic = tfn.merge({}, pd)//; delete pdBasic.specs
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
        daoProductDiscard.findOne({_id: pdBasic._id}).then(pdDiscard => {// 查询出现有产品
            pdDiscard = tfn.merge(pdDiscard||{}, pdBasic)
            pdDiscard.specs = discard.concat(pdDiscard.specs||[])
            pdDiscard.specs.sort((a, b) => {
                return (a.code||'') > (b.code||'')
            })
            let p1 = daoProductDiscard.save(pdDiscard)
            return p1.then((rst) => {// 先把作废的规格保存到discard里，再保存或删除产品
                let p2
                if (!pd.specs || !pd.specs.length){ // 没有规格了就删除产品
                    p2 = daoProduct.remove({_id: pd._id})
                }else{
                    p2 = daoProduct.save(pd)
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

//批量恢复产品规格
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
    let pdBasic = tfn.merge({}, pdDiscard)//; delete pdBasic.specs
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
            pd = pd || pdBasic //不存在才恢复产品基本信息i
            pd.specs = restore.concat(pd.specs||[])
            pd.specs.sort((a, b) => {
                return (a.code||'') > (b.code||'')
            })
            let p1 = daoProduct.save(pd)
            return p1.then((rst) => {// 先把要恢复的规格保存到product里，再保存或删除
                let p2
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
//批量删除产品规格
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

srvProduct.moveTo = function(pdIds, cate){
    let cateCode = cate && cate.code
    if (cateCode == unclassified.code){
        cateCode = ''
    }
    return daoProduct.update({_id: {$in: pdIds}}, {$set:{'category.code': cateCode}}, {multi: true})
}

module.exports = srvProduct

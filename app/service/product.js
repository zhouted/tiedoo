const daoProduct = require(appPath + '/dao/product.js')
const daoProductImg = require(appPath + '/dao/product-img.js')
const daoProductDiscard = require(appPath + '/dao/product-discard.js')

const remotePd = require(appPath + '/service/remote/product.js')
const remoteFile = require(appPath+'/service/remote/remote-file.js')

const srvProduct = {}
const unclassified = require(appPath + '/service/category.js').unclassified

srvProduct.load = function(param, project){
    let cond = {}
    if (param.key){// search key
        let key = new RegExp(param.key, 'i')
        cond.$or = [{code: key}, {name: key}, {nameEn: key}, {tags: param.key}]
    }
    if (param.categoryCode){// category code
        if (param.categoryCode == unclassified.code){
            cond.$or = [{categoryCode:''}, {categoryCode:null}, {categoryCode:{$exists:false}}]
        }else{
            cond.categoryCode = new RegExp('^'+param.categoryCode)
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
//保存
srvProduct.save = function(pd, discard){
    if (pd && pd.specs && pd.specs.length){
        pd.specs.sortBy('code')
    }
    let dao = !discard? daoProduct : daoProductDiscard
    let p = new Promise((resolve, reject) => {
        srvProduct.checkPdCode(pd).then(() => {
            return dao.save(pd).then((rst) => {
                resolve(rst)
            })
        }).catch(err => reject(err))
    })
    return p
}
srvProduct.checkPdCode = function(pd){
    let p = new Promise((resolve, reject) => {
        if (!pd.code){
            return reject(new Error('产品编码不能为空！'))
        }
        let cond = {$not: {_id: pd._id}, code: pd.code}
        let p1 = daoProduct.count(cond)
        let p2 = daoProductDiscard.count(cond)
        Promise.all([p1,p2]).then(cnts => {
            if (cnts[0] || cnts[1]){
                return reject(new Error('产品编码已存在！'))
            }
            if (!pd.specs){
                return resolve(0)
            }
            srvProduct.checkPdSpecCodes(pd).then(() => {
                resolve(0)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return p
}
srvProduct.checkPdSpecCodes = function(pd){
    let p = new Promise((resolve, reject) => {
        let codes = []
        for (let spec of pd.specs){
            if (!spec.code) {
                let err = new Error('规格编号不能为空！')
                err.code = pd.code, err.specCode = ''
                return reject(err)
            }
            if (codes.includes(spec.code)){
                let err = new Error('规格编号重复！')
                err.code = pd.code, err.specCode = spec.code
                return reject(err)
            }
            codes.push(spec.code)
        }
        let cond = {_id: pd._id, 'specs.code': {$in: codes}}
        daoProductDiscard.findOne(cond, {specs:1}).then(rst => {
            if (rst && rst.specs){
                let err = new Error('规格编号与已废弃规格重复！')
                err.code = pd.code
                for (let spec of rst.specs){//找出重复的规格编号
                    if (codes.includes(spec.code)){
                        err.specCode = spec.code
                        break
                    }
                }
                reject(err)
            }else{
                resolve(0)
            }
        }).catch((err => {
            console.error(err)
        }))
    })
    return p
}
//批量保存
srvProduct.saveAll = function(pds, discard){
    let dao = !discard? daoProduct : daoProductDiscard
    let p = new Promise((resolve, reject) => {
        checkCodes(pds).then(() => {
            return dao.upsert(pds).then((rst) => {
                resolve(rst)
            })
        }).catch(err => reject(err))
    })
    return p
    function checkCodes(pds){
        let p = new Promise((resolve, reject) => {
            let err = new Error('产品编码重复！')
            let ids = [], codes = [], specCodePromises = []
            for (let pd of pds) {
                pd._id && ids.push(pd._id)
                if (codes.includes(pd.code)){
                    err.code = pd.code
                    return reject(err)
                }
                codes.push(pd.code)
                specCodePromises.push(srvProduct.checkPdSpecCodes(pd))
            }
            let cond = {$not: {_id: {$in: ids}}, code: {$in: codes}}
            let p1 = daoProduct.find(cond, {code:1})
            let p2 = daoProductDiscard.find(cond, {code:1})
            Promise.all([p1,p2]).then(rsts => {
                for (let rst of rsts) {
                    if (rst && rst.length){
                        err.code = rst[0].code
                        return reject(err)
                    }
                }
                Promise.all(specCodePromises).then(() => {
                    resolve(0)
                }).catch(err => {
                    reject(err)
                })
            })
        })
        return p
    }
}

srvProduct.saveImg = function(file){
    return daoProductImg.fsave(file)
}

srvProduct.loadImg = function(id){
    if (remoteFile.typeOfId(id)){//是云端文件
        return remoteFile.loadImg(id)
    }
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
    let pdBasic = tfn.clone(pd)//; delete pdBasic.specs
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
            pdDiscard.specs.sortBy('code')
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
    let pdBasic = tfn.clone(pdDiscard)//; delete pdBasic.specs
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
            pd.specs.sortBy('code')
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
srvProduct.removePdSpecs = function(pdDiscard, specIds){ // 删除产品指定的规格s
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
    return daoProduct.update({_id: {$in: pdIds}}, {$set:{categoryCode: cateCode}}, {multi: true})
}

srvProduct.download = function(token, cb){//从云端下载产品数据
    let imgIds = [] //收集图片ids
    return new Promise((resolve, reject) => {
        remotePd.getAllPds(token).then(pds => {
            cb && cb('product', 'merging')
            let pMerges = pds.map(pd => mergePd(pd))
            return Promise.all(pMerges).then((mergedPds) => {
                cb && cb('product', 'merged')
                // return daoProduct.upsert(mergedPds).then(rst => {
                return srvProduct.saveAll(mergedPds).then(rst => {
                    cb && cb('product', 'images')
                    return remoteFile.downloadImgs(imgIds).then(() => {
                        cb && cb('product', 'done')
                        resolve(rst)
                    })
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
    function mergePd(pd){
        pd.imageId && imgIds.push(pd.imageId)
        return new Promise((resolve, reject) => {
            daoProduct.findOne({id: pd.id}).then(existPd => {
                existPd = existPd || {}
                existPd.specs = existPd.specs||[]
                mergeSpecs(existPd.specs, pd.specs)
                delete pd.specs
                tfn.merge(existPd, pd)
                resolve(existPd)
            }).catch(err => {
                reject(err)
            })
        })
        function mergeSpecs(existSpecs, specs){
            for (let spec of specs){
                spec.imageId && imgIds.push(spec.imageId)
                for (let exist of existSpecs){
                    if (exist.id === spec.id){
                        tfn.merge(exist, spec)
                        spec._id = exist._id
                        break
                    }
                }
                if (!spec._id){
                    spec._id = srvProduct.newSpecId()
                    existSpecs.push(spec)
                }
            }
            existSpecs.sortBy('code')
        }
    }
}

module.exports = srvProduct

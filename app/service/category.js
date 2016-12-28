const daoCate = require(appPath + '/dao/category.js')
const daoProduct = require(appPath + '/dao/product.js')
const daoProductDiscard = require(appPath + '/dao/product-discard.js')
// const daoCateImg = require(appPath + '/dao/category-img.js')
const remoteCate = require(appPath + '/service/remote/category.js')

let srvCate = {}
const unclassified = srvCate.unclassified = {id:'unclassified', code:'unclassified', text:'未分类'}

srvCate.load = function(param, project){
    let cond = {}
    if (param.key){
        key = new RegExp('^'+param.key, 'i')
        cond.$or = [{code: key}]
    }
    let sortBy = param.sortBy = param.sortBy||{code:1}
    // let paging = param.paging = param.paging||{pageSize:10}
    return daoCate.find(cond, project, sortBy)
}

srvCate.loadById = function(id, project){
    return daoCate.findById(id, project)
}

srvCate.loadTree = function(pcode = '', opts = {}){
    let cond = {}
    if (pcode){
        cond.code = new RegExp('^'+pcode, 'i')
    }
    let p = new Promise((resolve, reject) => {
        daoCate.find(cond, {}, {code:1}).then(cates => {
            let nodes = catesToTreeNodes(cates, opts)
            resolve(nodes)
        }).catch(err => {
            reject(err)
        })
    })
    return p
}
function catesToTreeNodes(cates, opts){
    let parents = {}, nodes = []
    for (let cate of cates){
        let pNode = cate.pcode && parents[cate.pcode]
        if (pNode){
            if (!pNode.children){
                pNode.children = [];
                pNode.isParent = true;
                pNode.chkDisabled = opts.disableParentCheck
                pNode.toggleState = opts.toggleState
            }
            if (pNode.children.indexOf(cate)<0){
                pNode.children.push(cate)
            }
        }else{
            nodes.push(cate)
        }
        cate.id = cate.code
        cate.text = cate.code+' '+cate.name
        cate.title = cate.text
        if (cate.nameEn) {
            cate.title += '('+cate.nameEn+')'
        }
        parents[cate.code] = cate
        opts.checkCode && checkNodeExpand(cate, opts.checkCode)
    }
    if (opts.unclassified){
        nodes.push(tfn.clone(unclassified))
    }
    return nodes
    function checkNodeExpand(node, checkCode){
        node.checked = (node.code == checkCode)
        if (node.checked){
            opts.checkName = node.name
            while (node && node.pcode){
                node = parents[node.pcode]
                node.toggleState = 'expand'
            }
        }
    }
}


srvCate.save = function(cate){
    let nCode, oCode = cate && cate.code
    if (cate){//合成code
        cate.pcode = cate.pcode||''
        cate.scode = cate.scode||''
        cate.code = nCode = cate.pcode + cate.scode
    }
    let p = new Promise((resolve, reject) => {
        checkCode(cate, oCode).then(cnt => {
            return daoCate.save(cate).then(rst => {
                if (!rst || !oCode){
                    return resolve(rst)
                }
                let p = updateSubs(oCode, nCode).then(() => {
                    resolve(rst)
                })
                return p
            })
        }).catch(err => reject(err))
    })
    return p
    function checkCode(cate, oCode){
        let p = new Promise((resolve, reject) => {
            let err = null
            if (!cate || !cate.code){
                err = new Error('编码不能为空！'), err.level = 0
                return reject(err)
            }
            let cond = {$not: {_id: cate._id}}
            let rPcode = new RegExp('^'+oCode)
            let rCode = new RegExp('^'+cate.code)
            cond.$where = function(){
                if (err && err.level <= 1) return false
                if (cate._id && (this._id == cate._id || this.pcode.match(rPcode))){//跳过本身及下级
                    return false
                }
                if (this.code == cate.code){
                    err = new Error('编码已存在！'), err.level = 0
                    return true
                }
                if (err && err.level <= 2) return false
                if (this.code.match(rCode)){
                    err = new Error('编码不能是已有编码的前缀！'), err.level = 2
                    return true
                }
                if (err && err.level <= 3) return false
                if (cate.pcode.search(this.pcode) < 0 && cate.code.search(this.code) === 0){
                    err = new Error('编码的前缀是已有编码，请直接添加子品类。'), err.level = 3
                    return true
                }
                return false
            }
            let p1 = daoCate.count(cond)
            return p1.then(cnt => {
                if (cnt) return reject(err)
                return resolve(cnt)
            })
        })
        return p
    }
    function updateSubs(oCode, nCode){
        let likey = new RegExp('^'+oCode)
        //查找出所有下级品类，更改其编码
        let p1 = daoCate.find({pcode: likey}).then(scates => {
            for (let scate of scates){
                scate.pcode = scate.pcode && scate.pcode.replace(oCode, nCode)
                scate.code = scate.pcode + scate.scode
            }
            return daoCate.upsert(scates)
        })
        //查找出所有下级产品，更改其编码
        let cond = {categoryCode: likey}
        let p2 = daoProduct.find(cond, {category:1}).then(pds => {
            for (let pd of pds){
                if (!pd.categoryCode) continue
                pd.categoryCode = pd.categoryCode.replace(oCode, nCode)
            }
            daoProduct.upsert(pds)
        })
        let p3 = daoProductDiscard.find(cond, {category:1}).then(pds => {
            for (let pd of pds){
                if (!pd.categoryCode) continue
                pd.categoryCode = pd.categoryCode.replace(oCode, nCode)
            }
            daoProductDiscard.upsert(pds)
        })
        return p1 // let p2、p3 be!
    }
}

srvCate.removeOf = function({id, pcode, code}){
    return daoCate.removeByIds(id).then((rst) => {
        //更改其下产品品类为未分类
        let cond = {categoryCode: new RegExp('^'+code)}
        let $set = {$set: {categoryCode: ''}}
        let p1 = daoProduct.update(cond, $set, {multi: true})
        let p2 = daoProductDiscard.update(cond, $set, {multi: true})
    })
}

srvCate.removeById = function(id){
    return daoCate.removeByIds(id)
}

srvCate.download = function(token, cb){//从云端下载品类数据
    return new Promise((resolve, reject) => {
        remoteCate.getCategories(token).then(cates => {
            return daoCate.find({}).then(existCates => {
                let mergedCates = mergeCates(existCates, cates)
                if (typeof(cb) == 'function'){
                    cb('category')
                }
                // return srvCate.saveAll(mergedCates).then(rst => {
                return daoCate.upsert(mergedCates).then(rst => {
                    resolve(rst)
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
    function mergeCates(existCates, cates){
        existCates = existCates || []
        for (let cate of cates){
            for (let exist of existCates){
                if (exist.id === cate.id){
                    tfn.merge(exist, cate)
                    cate._id = exist._id
                    break
                }
            }
            if (!cate._id){
                existCates.push(cate)
            }
        }
        return existCates.sortBy('code')
    }
}

module.exports = srvCate

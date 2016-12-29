const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')

const remoteCate = {}

remoteCate.getCategories = function(token){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.getCategories, {token}).then(cates => {
            let categories = toLocalCates(cates)
            resolve(categories)
        }).catch(err => {
            reject(err)
        })
    })
}

function toLocalCates(cates){
    let categories = [], parents = {}
    cates.sortBy('cateNo')
    for (let cate of cates) {
        let category = {
            id: cate.id,
            code: cate.cateNo,
            name: cate.chsName&&cate.chsName.replace(cate.cateNo+' ',''),
            nameEn: cate.enName&&cate.enName.replace(cate.cateNo+' ',''),
            pcode: '',
        }
        let parent = parents[cate.parentId]
        if (parent){
            category.pcode = parent.code
        }
        category.scode = category.code.replace(category.pcode,'')
        parents[cate.id] = category
        categories.push(category)
    }
    return categories.sortBy('code')
}

module.exports = remoteCate

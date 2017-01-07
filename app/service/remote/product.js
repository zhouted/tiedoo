const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')

const remotePd = {}

remotePd.getAllPds = function(token){
    return new Promise((resolve, reject) => {
        remotePd.getPdVersions(token).then(vers => {
            let ids = vers.map(ver => ver&&ver.id)
            return remotePd.getPdByIds(ids, token).then(pds => {
                let products = toLocalPds(pds)
                resolve(products)
            })
        }).catch(err => {
            reject(err)
        })
    })
}

remotePd.getPdVersions = function(token){
    let state = JSON.stringify(['f1', 'f3'])
    return remoteFn.request(remoteUrls.getPdVersions, {token, state})
}

remotePd.getPdByIds = function(ids, token){
    let data = JSON.stringify(ids)
    return remoteFn.request(remoteUrls.getPdByIds, {token, data})
}

function toLocalPds(pds){
    let products = [], product
    pds.sortBy('cateId')
    for (let pd of pds) {
        if (!product || product.id !== pd.cateId){
            product = {
                id: pd.cateId,
                code: pd.cateNo,
                name: pd.chsName,
                nameEn: pd.enName,
                desc: pd.chsIntro,
                descEn: pd.enIntro,
                tariffNo: pd.tariffNo,
                taxRebate: pd.fobRate,
                imageId: pd.cateImageIds&&pd.cateImageIds[0],
                categoryCode: pd.categoryVo&&pd.categoryVo.cateNo,
                specs: [],
            }
            if (pd.categoryVo){
                product.category = {
                    id: pd.categoryVo.cateId,
                    code: pd.categoryVo.cateNo,
                }
            }
            products.push(product)
        }
        let spec = {
            id: pd.id,
            code: transSpecCode(pd.productNo, product.specs),
            name: pd.specification,
            unit: pd.chsMeasurementUnit,
            unitEn: pd.enMeasurementUnit,
            cost: pd.purchasePrice,
            price: pd.exPrice,
            moq: pd.moq,
            packUnit: pd.outerPackUnit,
            packUnitEn: pd.enOuterPackUnit,
            packNetWeight: pd.outerPackNetWeight,
            packGrossWeight: pd.outerPackGrossWeight,
            packLength: pd.outerPackLength,
            packWidth: pd.outerPackWidth,
            packHeight: pd.outerPackHeight,
            packNum: pd.outerPackNum,
            imageId: pd.imageIds&&pd.imageIds[0],
            state: pd.state,
            version: pd.version,
        }
        product.specs.push(spec)
    }
    return products.sortBy('code')
    function transSpecCode(productNo, specs){
        let code = productNo||('0'+(specs.length+1))
        let pos = code.indexOf('.')+1
        if (!pos) pos = code.indexOf('-')+1
        if (!pos) pos = code.indexOf('_')+1
        if (pos){
            code = code.substring(pos)
        }
        for (let spec of specs){
            if (spec.code == code){
                code += '-'+(specs.length+1)
                break
            }
        }
        return code
    }
}

module.exports = remotePd

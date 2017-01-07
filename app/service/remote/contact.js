const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')

const remoteContact = {}

remoteContact.getAllContacts = function(token){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.getAllContacts, {token}).then(data => {
            let {customers, suppliers} = toLocalContacts(data)
            resolve({customers, suppliers})
        }).catch(err => {
            reject(err)
        })
    })
}

function toLocalContacts(data){
    let customers = [], suppliers = []
    let comp
    data.sortBy('company')
    for (let item of data) {
        if (!item || !item.group || (item.group !== 'c' && item.group !== 's')){
            continue
        }
        if (!comp || comp.name !== item.company){
            comp = {id: item.id, name: item.company, contacts: []}
            if (item.group === 'c'){
                customers.push(comp)
            }else{
                suppliers.push(comp)
            }
        }
        comp.alias = comp.alias || item.companyNo
        comp.tel = comp.tel || item.officePhone
        comp.fax = comp.fax || item.fax
        comp.site = comp.site || item.homepage
        comp.postcode = comp.postcode || item.zipcode
        comp.addr = comp.addr || item.address
        comp.src = comp.src || item.customerSource
        comp.market = comp.market || item.market
        comp.marketGoal = comp.marketGoal || item.goalMarket
        comp.marketRole = comp.marketRole || item.marketRole
        comp.labels = comp.labels || item.level
        comp.imageId = comp.imageId || item.avatarId
        comp.remark = comp.remark || item.remark
        // kind: '',
        // staffies: '',
        // amount: '',
        let contact = {
            id: item.id,
            name: item.name,
            sex: item.gender,
            email: item.email,
            tel: item.mobile,
            qq: item.qq,
            skype: item.skype,
            remark: item.remark,
        }
        comp.contacts.push(contact)
    }
    return {customers, suppliers}
}

module.exports = remoteContact

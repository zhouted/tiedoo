const datPath = app.getPath('userData')+'/Nedbs/'
const Nedb = require('nedb')
// const deasync = require('deasync')

// Promisify Nedb&Cursor
const dummyDb = new Nedb()
const Cursor = dummyDb.find().constructor
Promise.promisifyAll(Nedb.prototype)
Promise.promisifyAll(Cursor.prototype)

// DataStore
let {openDs, setUserId} = (function (Nedb){
    let _opts = {
        autoload: true,
        timestampData: true,
        onload(err){
            err && console.error(err)
        }
    }
    let dsCaches = {}
    let dsGlobal = ['user','token'] // 不分用户存放的全局dat
    let userId = ''
    function openDs(name){
        let filename = name + '.dat'
        if (!dsGlobal.includes(name)){// 按用户id分目录存放数据
            if (!userId) return null//没设定userId时这些ds暂不能访问
            filename = path.join(userId, filename)
        }
        let ds = dsCaches[filename]
        if (!ds){
            let opts = tfn.merge({filename: datPath + filename}, _opts)
            ds = dsCaches[filename] = new Nedb(opts)
        }
        return ds
    }
    function setUserId(uid){
        userId = uid
    }
    return {openDs, setUserId}
})(Nedb);

// Base Data Access Objects
class Dao{
    constructor(name){
        this._name = name
        this._compacting = this._compactNum = 0
    }
    get name(){
        return this._name
    }
    get filename(){
        return this.ds.filename
    }
    get ds(){
        return openDs(this._name)
    }
    newId(){
        return this.ds.createNewId()
    }
    count(cond){
        return this.ds.countAsync(cond)
    }
    find(cond, project, sortBy, paging){
        let csr = this.ds.find(cond, project)
        if (sortBy){
            csr = csr.sort(sortBy)
        }
        if (paging){
            paging.pageNo = paging.pageNo||1
            paging.pageSize = paging.pageSize||20
            let skip = paging.pageSize*paging.pageNo-paging.pageSize
            if (skip){
                csr = csr.skip(skip)
            }
            csr = csr.limit(paging.pageSize)
            return this.count(cond).then(total => {
                paging.total = total
                paging.totalPages = Math.ceil(total/paging.pageSize)
                return csr.execAsync()
            })
        }
        return csr.execAsync()
    }
    findOne(){
        return this.ds.findOneAsync(...arguments)
    }
    // findOneSync(){
    //     let findOne = deasync(this.ds.findOne)
    //     return findOne(...arguments)
    // }
    findById(id, p){
        return this.ds.findOneAsync({_id: id}, p)
    }
    insert(){
        return this.ds.insertAsync(...arguments)
    }
    update(){
        return this.ds.updateAsync(...arguments).then(rst => {
            this.compactDatafile(rst)
            return rst
        })
    }
    save(doc, opts = {upsert: true}){
        if (!doc) {
            return Promise.reject(new Error('upsert: no data!'))
        }
        if (this._name == 'token' && doc.uid){//save token's uid
            setUserId(doc.uid)
        }
        if (doc._id){// 使用$set保存
            return this.update({_id: doc._id}, {$set:doc}, opts)
        }else{
            delete doc._id; // 避免空字符串
            return this.ds.insertAsync(doc)
        }
    }
    upsert(docs){
        if (!Array.isArray(docs)){
            return this.save(docs)
        }
        let p = new Promise((resolve, reject) => {
            let pAll = docs.map(doc => this.save(doc))
            return Promise.all(pAll).then(rst => {
                resolve(rst)
            }).catch(err => {
                reject(err)
            })
        })
        return p
    }
    remove(){
        return this.ds.removeAsync(...arguments).then(rst => {
            this.compactDatafile(rst)
            return rst
        })
    }
    removeByIds(ids){
        if (!Array.isArray(ids)){
            return this.remove({_id: ids})
        }
        return this.remove({_id: {$in: ids}}, {multi: true})
    }
    compactDatafile(num){
        if (this._compacting) return // 已经在进行compact
        this._compactNum += Number.parseInt(num)||0
        if (this._compactNum < 10) return // 有需要compact的记录数不多，不必compact
        this.ds.once('compaction.done', () => {
            this._compacting = this._compactNum = 0
            console.log(this._name, 'compaction.done!')
        })
        this._compacting = true
        setTimeout(() => this.ds.persistence.compactDatafile())
    }
}

module.exports = Dao

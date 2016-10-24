// Base Data Access Objects
const datPath = app.getPath('userData')+'/dbs/'
const Nedb = require('nedb')
const md5 = require('md5')
const fs = require('fs')
const mkdirp = require('mkdirp')

// Promisify Nedb&Cursor
const dummyDb = new Nedb()
const Cursor = dummyDb.find().constructor
Promise.promisifyAll(Nedb.prototype)
Promise.promisifyAll(Cursor.prototype)

// Promisify fs
Promise.promisifyAll(fs)
const mkdir = Promise.promisify(mkdirp)

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
    let dsGlobal = ['current','user'] // 不分用户存放的全局dat
    let userId = ''
    function openDs(name){
        let datFile = name + '.dat'
        if (!dsGlobal.includes(name)){// 按用户id分目录存放数据
            datFile = userId + '/' + datFile
        }
        let ds = dsCaches[datFile]
        if (!ds){
            let opts = Object.assign({filename: datPath + datFile}, _opts)
            ds = dsCaches[datFile] = new Nedb(opts)
        }
        return ds
    }
    function setUserId(uid){
        userId = uid
    }
    return {openDs, setUserId};
})(Nedb);

class Dao{
    constructor(name){
        this._name = name;
    }
    get name(){
        return this._name;
    }
    get ds(){
        return openDs(this._name);
    }
    find(){
        return this.ds.findAsync(...arguments);
    }
    findOne(){
        return this.ds.findOneAsync(...arguments);
    }
    insert(){
        return this.ds.insertAsync(...arguments);
    }
    update(){
        return this.ds.updateAsync(...arguments);
    }
    save(doc, opts = {upsert: true}){
        if (!doc) {
            return Promise.reject(new Error('no data!'));
        }
        if (this._name == 'current' && doc.uid){
            setUserId(doc.uid);
        }
        if (doc._id){// 使用$set保存
            return this.ds.updateAsync({_id: doc._id}, {$set:doc}, opts);
        }else{
            delete doc._id; // 避免空字符串
            return this.ds.insertAsync(doc);
        }
    }
    remove(){
        return this.ds.removeAsync(...arguments);
    }
    //files' save method
    fsave(file){
        if (!file || !file.path){
            return this.save(file)
        }
        let doc = {}, buf //文件内容
        return fs.readFileAsync(file.path).then(data => { //读取文件内容并得到hashId
            buf = data
            doc.md5 = md5(data)
            return this.findOne({md5: doc.md5}) //查出相同文件
        }).then(exists => {
            if (exists){
                return Promise.resolve(exists)
            }else{
                doc._id = this.ds.createNewId()
                doc.name = file.name.replace(/^.*\./, doc._id+'.')
                let dir = this.ds.filename.replace('.dat', '.files/')
                return mkdir(dir).then(()=>{
                    doc.path = this.ds.filename.replace('.dat', '.files/'+doc.name)
                    return fs.writeFileAsync(doc.path, buf)
                }).then(()=>{
                    doc.type = file.type, doc.size =  file.size
                    return this.insert(doc)
                })
            }
        })
    }
}

module.exports = Dao

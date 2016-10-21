// Base Data Access Objects
const datPath = app.getPath('userData')+'/dbs/'
const Nedb = require('nedb');

// Promisify Nedb&Cursor
const dummyDb = new Nedb();
const Cursor = dummyDb.find().constructor;
Promise.promisifyAll(Nedb.prototype);
Promise.promisifyAll(Cursor.prototype);

// DataStore
let {openDs, setUserId} = (function (Nedb){
    let _opts = {
        autoload: true,
        timestampData: true,
        onload(err){
            err && console.error(err);
        }
    }
    let dsCaches = {};
    let dsGlobal = ['current','user']; // 不分用户存放的全局dat
    let userId = ''
    function openDs(name){
        let datFile = name + '.dat'
        if (!dsGlobal.includes(name)){// 按用户id分目录存放数据
            datFile = userId + '/' + datFile
        }
        let ds = dsCaches[datFile]
        if (!ds){
            let opts = Object.assign({filename: datPath + datFile}, _opts);
            ds = dsCaches[datFile] = new Nedb(opts);
        }
        return ds;
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
        if (!doc) return;
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
}

module.exports = Dao

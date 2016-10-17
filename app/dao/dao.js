// Base Data Access Objects: DataStore...
const datPath = app.getPath('userData')
const Nedb = require('nedb');

// Promisify Nedb&Cursor
const dummyDb = new Nedb();
const Cursor = dummyDb.find().constructor;
Promise.promisifyAll(Nedb.prototype);
Promise.promisifyAll(Cursor.prototype);

let {openDs,  closeDs} = (function (Nedb){
    let _opts = {
        autoload: true,
        timestampData: true,
        onload(err){
            err && console.log(err);
        }
    }
    let dsCaches = {};
    function openDs(name){
        let ds = dsCaches[name];
        if (!ds){
            let opts = Object.assign({filename: `${datPath}/dbs/${name}.dat`}, _opts);
            ds = dsCaches[name] = new Nedb(opts);
        }
        return ds;
    }
    function closeDs(name){//没用处？
        delete dsCaches[name];
    }
    return {openDs, closeDs};
})(Nedb);

class DataStore{
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

module.exports = DataStore

const Dao = require('./dao.js')
const md5 = require('md5')
const fs = require('fs')
const mkdirp = require('mkdirp')
// Promisify fs
Promise.promisifyAll(fs)
const mkdir = Promise.promisify(mkdirp)

class FileDao extends Dao {
    //files' save method
    fsave(file){
        if (!file || !file.path){
            return super.save(file)
        }
        let doc = {}, buf //文件内容
        return fs.readFileAsync(file.path).then(data => { //读取文件内容并得到hashId
            buf = data
            doc.md5 = md5(data)
            return super.findOne({md5: doc.md5}) //查出相同文件
        }).then(exists => {
            if (exists){
                return Promise.resolve(exists)
            }
            // insert new file
            doc._id = super.newId()
            doc.name = file.name.replace(/^.*\./, doc._id+'.') //_id用做文件名
            let dir = super.ds.filename.replace('.dat', '.files/')//文件存放在dat文件对应的.files下
            return mkdir(dir).then(()=>{//创建路径、保存文件
                doc.path = dir + doc.name
                return fs.writeFileAsync(doc.path, buf)
            }).then(()=>{//插入文件记录
                doc.type = file.type, doc.size = file.size
                return super.insert(doc)
            })
        })
    }
}

module.exports = FileDao

const Dao = require('./dao.js')
const md5 = require('md5')

// File Data Access Object
class DaoFile extends Dao {
    // 文件实际存放在该路径下
    get filepath(){
        let paths = path.parse(super.filename) // 数据文件路径信息
        return path.join(paths.dir, paths.name+'.files') // 文件实际存放在dat文件对应的.files下
    }
    //files' save method
    fsave(file){
        if (!file || !(file.path || file.buf || file.data)){
            return super.save(file)
        }
        let doc = {type: file.type, ext: path.extname(file.path)}
        let pExists, buf = file.buf //文件内容
        if (buf || file.data) { // 已带有数据
            if (file.data) {//data:image/png;base64,iVB......ggg==
                let matches = file.data.match((/^data:(.+)\/(.+);(.+),(.+)$/))
                doc.type = matches[1]+'/'+matches[2]
                doc.ext = '.'+matches[2]
                buf = new Buffer(matches[4], matches[3])
            }
            doc.md5 = md5(buf)
            pExists = super.findOne({md5: doc.md5}) //查出相同文件
        } else { // 只有文件路径
            pExists = fs.readFileAsync(file.path).then(data => { //读取文件内容并得到hashId
                buf = data
                doc.md5 = md5(data)
                return super.findOne({md5: doc.md5}) //查出相同文件
            })
        }
        return pExists.then(exists => {
            if (exists){ // 已存在文件，直接返回
                return Promise.resolve(exists)
            }
            // insert new file
            doc._id = super.newId()
            doc.name = doc._id + doc.ext //_id用做文件名
            doc.size = buf.size
            doc.filename = path.basename(file.path) //保留原文件名备查
            let pSave = super.insert(doc) //插入文件信息记录
            let pWrite = mkdir(this.filepath).then(()=>{//创建路径、保存文件
                let filepath = path.join(this.filepath, doc.name)
                return fs.writeFileAsync(filepath, buf)
            })
            return Promise.all([pSave, pWrite]).then(()=>{
                return pSave
            })
        })
    }
    findById(id){
        return super.findOne({_id: id}).then(file => {
            if (file){
                file.path = path.join(this.filepath, file.name)//重置路径
            }
            return Promise.resolve(file)
        })
    }
}

module.exports = DaoFile

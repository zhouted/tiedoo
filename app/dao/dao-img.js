const DaoFile = require('./dao-file.js')
const fs = require('fs')
const path = require('path')
const nativeImage = electron.nativeImage

function cropsize(image, rect){
    let size = image.getSize()
    if (rect.x || rect.y){ //先裁剪
        image = image.crop({x:rect.x, y:rect.y})
        size = image.getSize()
    }
    for (let side of ['width', 'height']){ // 再等比缩放
        if (rect[side] && rect[side] < size[side]){
            image = image.resize({width: rect[side]})
            size = image.getSize()
        }
    }
    return {image, size}
}

class DaoImg extends DaoFile {
    fsave(file, rect){
        if (!file || !rect){
            return super.fsave(file)
        }
        let image = nativeImage.createFromPath(file.path)
        image = image.crop({x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height)})
        file.buf = image.toPNG()
        return super.fsave(file)
    }
    findById(id, size){
        return super.findById(id).then(file => {
            if (!file || !size){
                return Promise.resolve(file)
            }
            let filepath = path.join(super.filepath, path.basename(file.name, file.ext)+'@'+size.width+'X'+size.height+'.png')
            if (fs.existsSync(filepath)) { // existsAsync:Unhandled rejection Error?
                file.path = filepath
                return Promise.resolve(file)
            }
            // let resized = image.resize(size) //TODO: 等比缩放
            let {image, resize} = cropsize(nativeImage.createFromPath(file.path), size)
            let buf = image.toPNG()
            return fs.writeFileAsync(filepath, buf).then(() => {
                file.path = filepath
                file.size = buf.size
                return Promise.resolve(file)
            }).catch(err => {
                console.log(err)
                return Promise.resolve(file)
            })
        })
    }
}

module.exports = DaoImg

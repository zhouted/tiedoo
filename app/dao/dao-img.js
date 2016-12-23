const DaoFile = require('./dao-file.js')
// const fs = require('fs')
// const path = require('path')
const nativeImage = electron.nativeImage

// Image File Data Access Object
class DaoImg extends DaoFile {
    fsave(file, toSize){
        if (!file || !toSize){
            return super.fsave(file)
        }
        let image = createImage(file)
        image = cropsize(image, toSize)
        file.buf = getImageBuf(image, file.type)
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
            let image = cropsize(nativeImage.createFromPath(file.path), size)
            let buf = getImageBuf(image, file.type)
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

function createImage(file){
    if (file.buf){
        return nativeImage.createFromBuffer(file.buf)
    }else if (file.data){
        return nativeImage.createFromDataURL(file.data)
    }else{
        return nativeImage.createFromPath(file.path)
    }
}

function getImageBuf(image, type){
    if (type === 'image/jpg' || type === 'image/jpeg'){
        return image.toJPEG(92)
    }else{
        return image.toPNG()
    }
}

function cropsize(image, rect){
    let size = image.getSize()
    if (rect.x || rect.y){ //先裁剪
        image = image.crop({x:rect.x, y:rect.y})
        size = image.getSize()
    }
    for (let side of ['width', 'height']){ // 再等比缩放
        if (rect[side] && rect[side] < size[side]){
            let resize = {}
            resize[side] = rect[side]
            image = image.resize(resize)
            size = image.getSize()
        }
    }
    return image
}

module.exports = DaoImg

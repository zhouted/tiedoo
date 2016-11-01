const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvComp = require(appPath+'/service/company.js')

class CompForm extends BaseForm{
    get $img(){
        return this._$img || (this._$img = this.$form.find('img.image-preview'))
    }
    get $imgIpt(){
        return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    }
    init(){
        super.init()
        this.initImg()
    }
    initImg(){
        this.$imgIpt.inputImg().change((e) => {
            let file = e.target.files[0]
            if (!file || !file.path) return
            this.$img.attr('src', file.path);
            srvComp.saveImg(file).then(file => {
                console.log(file)
                this.$imgIpt.data('fileId', file._id)
                this.$imgIpt.val('') //reset file input
                this.$form.input('edit')
            })
        })
    }
    doLoad(){
        srvComp.load().then(comp => {
            this.$form.input('values', comp)
            this.loadImg()
        })
    }
    loadImg(){
        srvComp.loadImg(this.$imgIpt.data('fileId')).then(file => {
            file && this.$img.attr('src', file.path)
        })
    }
    doSave(){
        let data = this.getFormData()
        return srvComp.save(data).then(comp => {
            // $('body').trigger('changed.comp', [data])
        })
    }
}

module.exports = CompForm

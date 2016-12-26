const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')

class CompForm extends BaseForm{
    get $img(){
        return this._$img || (this._$img = this.$form.find('img.image-preview'))
    }
    get $imgIpt(){
        return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    }
    onReady(){
        super.onReady()
        this.initImg()
    }
    initEvents(){
        super.initEvents()
        router.$main.on('changed.user', (e, user) => {
            if (user && user.comp){
                this.reload()
            }
        })
    }
    initImg(){
        this.$imgIpt.inputImg().change((e) => {
            let file = e.target.files[0]
            if (!file || !file.path) return
            this.$img.attr('src', file.path);
            srvUser.saveImg(file).then(file => {
                console.log(file)
                this.$imgIpt.data('fileId', file._id)
                this.$imgIpt.val('') //reset file input
                this.$form.input('edit')
            })
        })
    }
    doLoad(){
        return srvUser.loadComp()
    }
    render(comp){
        this.setFormData(comp)
        this.loadImg()
    }
    loadImg(){
        srvUser.loadImg(this.$imgIpt.data('fileId')).then(file => {
            this.$img.attr('src', file&&file.path||this.$img.attr('alt-src'))
        })
    }
    doSave(comp){
        return srvUser.saveComp(comp).then(rst => {
            // $('body').trigger('changed.comp', [comp])
            return rst
        })
    }
}

module.exports = CompForm

const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const consts = require(appPath+'/apps/consts.js')

class UserForm extends BaseForm{
    get btns(){
        return tfn.merge(super.btns, {onPasswd: '.btn.passwd'})
    }
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
            this.reload()
        })
    }
    initImg(){
        this.$imgIpt.inputImg({
            aspectRatio: 1 / 1
        }).on('done.cropper', (e, file) => {
            this.$img.attr('src', file.data);
            srvUser.saveImg(file).then(file => {
                // console.log(file)
                this.$imgIpt.data('fileId', file._id)
                this.$form.input('edit')
            })
        })
    }
    initValidators(){
        super.initValidators()

        let $email = this.$form.find('input[name=email]')
        $email.data('validator', (ipt) => {
            let val = ipt.value
            return consts.RE_EMAIL.test(val)
        })
        let $mobile = this.$form.find('input[name=mobile]')
        $mobile.data('validator', (ipt) => {
            let val = ipt.value
            return consts.RE_MOBILE.test(val)
        })
    }
    doLoad(){
        return srvUser.load()
    }
    render(user){
        this.setFormData(user)
        this.loadImg()
    }
    loadImg(){
        srvUser.loadImg(this.$imgIpt.data('fileId')).then(file => {
            this.$img.attr('src', file&&file.path||this.$img.attr('alt-src'))
        })
    }
    doSave(data){
        return srvUser.save(data).then(rst => {
            $('body').trigger('changed.user', [data])
            return rst
        })
    }
    onPasswd(){
        let opts = {id: 'passwdModal', append: true}
        router.$main.loadFile('ui/setting/setting-pwd.html', opts).then(() => {
            let $modal = $('#'+opts.id)
            $modal.modal('show')
        })
    }
}

module.exports = UserForm

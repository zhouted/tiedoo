const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const {RE_EMAIL: reEmail, RE_MOBILE: reMobile} = require(appPath+'/apps/consts.js')

class UserForm extends BaseForm{
    get clicks(){
        return Object.assign(super.clicks, {onPasswd: '.btn.passwd'})
    }
    get $img(){
        return this._$img || (this._$img = this.$form.find('img.image-preview'))
    }
    get $imgIpt(){
        return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    }
    get $account(){
        return this._$account || (this._$account = this.$form.find('input[name=account]'))
    }
    init(){
        super.init()
        this.initImg()
    }
    initImg(){
        this.$imgIpt.inputImg({
            aspectRatio: 1 / 1
        }).on('done.cropper', (e, file) => {
            this.$img.attr('src', file.data);
            srvUser.saveImg(file).then(file => {
                console.log(file)
                this.$imgIpt.data('fileId', file._id)
                this.$form.input('edit')
            })
        })
    }
    initValidators(){
        super.initValidators()
        this.$account.data('validator', (ipt) => {
            let val = ipt.value
            return reEmail.test(val) || reMobile.test(ipt, val)
        })
    }
    doLoad(){
        return srvUser.load().then(user => {
            this.setFormData(user)
            this.loadImg()
        })
    }
    loadImg(){
        srvUser.loadImg(this.$imgIpt.data('fileId')).then(file => {
            file && this.$img.attr('src', file.path)
        })
    }
    doSave(){
        let data = this.getFormData()
        return srvUser.save(data).then(user => {
            $('body').trigger('changed.user', [data])
        })
    }
    onPasswd(){
        this.$page.addFile('ui/setting/setting-pwd.html').then(() => {
            let $modal = $('#passwdModal')
            $modal.modal('show')
        })
    }
}

module.exports = UserForm

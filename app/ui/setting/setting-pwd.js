const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvUser = require(appPath+'/service/user.js')

class PwdForm extends ModalForm{
    get $pwd(){
        return this._$pwd || (this._$pwd = this.$form.find('input[name=pwd]'))
    }
    get $pwdOld(){
        return this._$pwdOld || (this._$pwdOld = this.$form.find('input[name=pwdOld]'))
    }
    get $pwdAg(){
        return this._$pwdAg || (this._$pwdAg = this.$form.find('input[name=pwdAg]'))
    }
    initValidators(){
        super.initValidators()
        this.$pwdOld.data('validator', (ipt) => {
            return srvUser.validPasswd(ipt.value, this._data) //TODO: use checkPasswd
            // return srvUser.checkPasswd(ipt.value).then((pass) => {
                // if (!pass){
                //     window.alert('原密码错误！')
                //     $pwdOld.focus()
                // }
            // })
        })
        this.$pwdAg.data('validator', (ipt) => {
            return this.$pwdAg.val() == this.$pwd.val()
        })
    }
    doLoad(){
        return srvUser.load()
    }
    render(){
        null
    }
    rerender(){
        null
    }
    doSave(){
        let pwdOld = this.$pwdOld.val()
        let pwd = this.$pwd.val()
        return srvUser.changePasswd(pwdOld, pwd).then((rst) => {
            console.log(rst)
            this.$form[0].reset()
            this.$modal.modal('hide')
            return rst
        })
    }
}

module.exports = PwdForm

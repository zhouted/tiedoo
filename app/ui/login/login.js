const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvUser = require(appPath+'/service/user.js')
const {RE_EMAIL: reEmail, RE_MOBILE: reMobile} = require(appPath+'/apps/consts.js')

class LoginForm extends ModalForm {
    get $account(){
        return this._$account || (this._$account = this.$form.find('input[name=account]'))
    }
    get $pwd(){
        return this._$pwd || (this._$pwd = this.$form.find('input[name=pwd]'))
    }
    get $pwdAg(){
        return this._$pwdAg || (this._$pwdAg = this.$form.find('input[name=pwdAg]'))
    }
    get $agree(){
        return this._$agree || (this._$agree = this.$form.find('input[name=agree]'))
    }
    get $confirm(){
        return this._$confirm || (this._$confirm = this.$form.find('.btn.confirm'))
    }
    prepareEvents(){
        super.prepareEvents()
        this.$form.on('keyup', '.form-control', e => {
            if (e && e.which == 13){
                this.$confirm.click()
            }
        })
    }
    initValidators(){
        super.initValidators()
        this.$account.data('validator', (ipt) => {
            let val = ipt.value
            return reEmail.test(val) || reMobile.test(val)
        })
        this.$pwdAg.data('validator', (ipt) => {
            return !this.$pwdAg.is(':visible') || (this.$pwdAg.val()===this.$pwd.val())
        })
    }
    checkFormData(){
        let valid = super.checkFormData()
        if (valid && this.$agree.is(':visible')){
            valid = this.$agree.prop('checked')
            if (!valid){
                tfn.tips('您必须同意服务协议才能使用本软件！', 'warning')// alert('您必须同意服务协议才能使用本软件！')
                this.$agree.focus()
            }
        }
        return valid
    }
    doLoad(){
        return srvUser.loadLastUser()
    }
    render(user){
        if (user){// 显示上次登录用户
            this.$account.val(user.account)
            this.$pwd.focus()
        }else{
            this.$account.focus()
        }
    }
    doSave(data){ //doLogin 登录和注册 交互处理
        return srvUser.login(data).then(rst => {
            if (rst.passed && rst.user) {
                if (rst.user.isNew){
                    this.showFirst()
                }else{
                    router.loadMain()
                }
            } else if (rst.user) {
                tfn.tips('密码错误', 'warning')// alert('密码错误')
                this.$pwd.focus()//.popover("show")
            } else { // 用户未注册
                this.showRegister()
            }
        })
    }
    showRegister() { // 显示隐藏的注册输入项
        this.$page.find('.register-more').removeClass('hidden')
        setTimeout(()=>{
            this.$pwdAg.focus()
        })
    }
    showFirst(){ // 首次登录 完善资料
        $('body').loadFile('ui/login/first.html')
    }

}

module.exports = LoginForm

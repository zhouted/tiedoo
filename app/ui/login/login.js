const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvUser = require(appPath+'/service/user.js')
const consts = require(appPath+'/apps/consts.js')

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
    initEvents(){
        super.initEvents()
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
            let isEmail = consts.RE_EMAIL.test(val)
            let isMobile = consts.RE_MOBILE.test(val)
            return isEmail || isMobile
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
        return srvUser.loadToken()//account
    }
    render(token){
        if (token){// 显示上次登录用户
            this.$account.val(token.account)
            this.$pwd.focus()
        }else{
            this.$account.focus()
        }
    }
    doSave(data){ //doLogin 登录和注册 交互处理
        return srvUser.login(data).then(rst => {
            if (rst && rst.isNew) {
                this.showFirst()
            }else{
                router.loadMain()
            }
        }).catch(err => {
            if (err == consts.ERR_PWD){//密码错误
                tfn.tips(err.message)
                this.$pwd.focus()//.popover("show")
            }else if (err == consts.ERR_USER){ // 用户未注册
                this.showRegister()
            }else{
                tfn.tips(err.message, 'warning')
            }
            throw err
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

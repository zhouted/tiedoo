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
    get $smsCode(){
        return this._$smsCode || (this._$smsCode = this.$form.find('input[name=smsCode]'))
    }
    get $companyName(){
        return this._$companyName || (this._$companyName = this.$form.find('input[name=companyName]'))
    }
    get $agree(){
        return this._$agree || (this._$agree = this.$form.find('input[name=agree]'))
    }
    initEvents(){
        super.initEvents()

        //回车即确认
        let $confirm = this.$form.find('.btn.confirm')
        this.$form.on('keyup', '.form-control', e => {
            if (e && e.which == 13){
                $confirm.click()
            }
        })

        //手机验证码
        let $btnSms = this.$form.find('.btn.sms-code')
        let sending = false
        $btnSms.click(() => {
            if (sending) return false
            let mobile = this.$account.val()
            if (!consts.RE_MOBILE.test(mobile)){
                this.$account.focus()
                return false
            }
            sending = true
            srvUser.sendSmsCode(mobile).then(() => {
                tfn.tips('验证码已发送，请查收手机短信，输入验证码完成注册。')
                this.$smsCode.focus()
                waitTimeout(60)
            }).catch(err => {
                tfn.tips(err.message, 'warning')
                sending = false
            })
        })
        function waitTimeout(count){
            $btnSms.text(`请耐心等待${count}秒`)
            if (--count>0){
                setTimeout(() => waitTimeout(count), 1000)
            }else{
                $btnSms.text('重新获取验证码')
                sending = false
            }
        }
    }
    initValidators(){
        super.initValidators()

        let $smsGroup = this.$form.find('.input-group.sms-code')
        this.$account.data('validator', (ipt) => {
            let val = ipt.value
            let isEmail = consts.RE_EMAIL.test(val)
            let isMobile = consts.RE_MOBILE.test(val)
            if (isMobile){//手机才显示手机验证码
                $smsGroup.removeClass('hidden')
            }else{
                $smsGroup.addClass('hidden')
            }
            if (isEmail || isMobile){
                srvUser.checkAccount(val).then(() => {
                    this.showRegister()
                }).catch(err => {
                    if (err == consts.ERR_USER_EXISTS){
                        this.hideRegister()
                    }else{
                        tfn.tips(err)
                    }
                })
            }
            return isEmail || isMobile
        })
        this.$pwdAg.data('validator', () => {
            return !this.$pwdAg.is(':visible') || (this.$pwdAg.val()===this.$pwd.val())
        })
        this.$companyName.data('validator', () => {
            return !this.$companyName.is(':visible') || (this.$companyName.val() != '')
        })
        this.$smsCode.data('validator', () => {
            return !this.$smsCode.is(':visible') || (this.$smsCode.val() != '')
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
    getFormData(){
        let data = this.$form.find('input:visible').input('values')
        return data
    }
    doSave(data){ //doLogin 登录和注册 交互处理
        return srvUser.login(data).then(() => {
            if (data.pwdAg) {//新注册用首次登录
                this.showFirst()
            }else{
                router.loadMain()
            }
        }).catch(err => {
            if (err == consts.ERR_PWD){//密码错误
                this.$pwd.focus()//input('pop', err.message)
            }else if (err == consts.ERR_SMSCODE){//验证码错误
                this.$smsCode.focus()//.input('pop', err.message)
            }else if (err == consts.ERR_COMPNAME){//公司名已存在
                this.$companyName.focus()//.input('pop', err.message)
            }else if (err == consts.ERR_USER_NO){ // 用户未注册
                this.showRegister()
            }
            tfn.tips(err.message, 'warning')
            throw err
        })
    }
    showRegister() { // 显示隐藏的注册输入项
        this.$page.find('.register-more').removeClass('hidden')
        if (!this.$pwd.val()){
            this.$pwd.focus()
        }else if (!this.$pwdAg.val()){
            this.$pwdAg.focus()
        }
    }
    hideRegister() {
        this.$page.find('.register-more').addClass('hidden')
        this.$pwd.focus()
    }
    showFirst(){ // 首次登录 完善资料
        $('body').loadFile('ui/login/first.html')
    }

}

module.exports = LoginForm

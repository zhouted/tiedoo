//RegExp:
exports.RE_EMAIL = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
exports.RE_MOBILE = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/

//Errors:
exports.ERR_NETWORK = new Error('未连接网络！')
exports.ERR_USER = new Error('用户未注册！')
exports.ERR_PWD = new Error('密码错误！')

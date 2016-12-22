// const basePath = 'http://test.tiedoo.net/'
const basePath = 'http://192.9.5.88:8083/tiedoo/'
const urls = {
    basePath,
    login: basePath+'web/usermngt/user/login',
    register: basePath+'web/usermngt/user/doreg',
    sendSmsCode: basePath+'web/usermngt/user/sendShortMsgCode',
    checkCompName: basePath+'web/usermngt/user/existsCompName',
}

module.exports = urls

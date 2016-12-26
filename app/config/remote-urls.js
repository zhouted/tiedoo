// const basePath = 'http://test.tiedoo.net/'
const basePath = 'http://192.9.5.88:8083/tiedoo/'
const urls = {
    basePath,
    login: basePath+'web/usermngt/user/login',
    loginAuto: basePath+'web/usermngt/user/doAutoLogin',
    register: basePath+'web/usermngt/user/doreg',
    checkAccount: basePath+'web/usermngt/user/mobileValidated',
    sendSmsCode: basePath+'web/usermngt/user/sendShortMsgCode',
    checkCompName: basePath+'web/usermngt/user/existsCompName',
    getPdVersions: basePath+'web/workbench/product/getVersions',
    getPdByIds: basePath+'web/workbench/product/findByIds',
    downloadFile: basePath+'web/file/dl/',
}

module.exports = urls

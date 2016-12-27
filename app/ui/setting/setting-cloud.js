const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const srvProduct = require(appPath+'/service/product.js')

class CompForm extends BaseForm{
    get btns(){
        return {
            onDownload: '.btn.download',
            onUpload: '.btn.upload',
        }
    }
    onDownload(e, btn){
        if (this.downloading){
            return
        }
        if (!window.confirm('确认从云端下载数据吗？')){
            return
        }
        this.downloading = true
        this.doDownload()
    }
    doDownload(){
        let $progress = this.$form.find('.progress').removeClass('hidden')
        let $progressBar = $progress.find('.progress-bar')
        let progress = (percent) => {
            $progressBar.css('width', percent+'%')
        }
        let callback = (step, left) => {
            if (step == 'user'){
                progress(10)
            }else if (step == 'product'){
                progress(30)
            }
        }

        progress(0)//准备下载
        let pUser = srvUser.download(callback)//先下载用户信息
        pUser.then(user => {
            progress(20)
            router.$main.trigger('changed.user', [user])
            //下载产品
            let pPd = srvProduct.download(user.token, callback).then(rst => {
                progress(40)
            })

            return Promise.all([pPd]).then(rsts => {
                progress(100)
                tfn.tips('下载完成！')
            })
        }).catch(err => {
            tfn.tips(err.message, 'danger')
        }).finally(() => {
            this.downloading = false
        })
    }
    onUpload(e, btn){
        tfn.tips('该功能暂不开放。')
    }
}

module.exports = CompForm

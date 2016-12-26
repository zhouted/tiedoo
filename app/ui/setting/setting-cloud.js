const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')

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
        let $progressBar = $progress.find('.progress-bar').css('width', 0)
        let progress = (step) => {
            switch (step) {
                case 'requested':
                    $progressBar.css('width', '50%')
                    break
                case 'finished': default:
                    $progressBar.css('width', '100%')
            }
        }
        srvUser.download(progress).then(user => {
            progress('finished')
            tfn.tips('下载完成！')
            router.$main.trigger('changed.user', [user])
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

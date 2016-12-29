const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const srvCate = require(appPath+'/service/category.js')
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
        let progress = (p) => {
            progress.percent += p||1
            $progressBar.css('width', progress.percent+'%')
        }
        progress.percent = 0
        let callback = (step, left) => {
            switch (step){
                case 'user': progress(10); break
                case 'tags': progress(10); break
                case 'category': progress(10); break
                case 'product': progress(10); break
                default: progress(1); break
            }
        }

        progress(0)//准备下载
        let pUser = srvUser.download(callback)//先下载用户信息
        pUser.then(user => {
            progress(10)
            router.$main.trigger('changed.user', [user])
            //下载品类
            let pCate = srvCate.download(user.token, callback).then(rst => {
                progress(10)
                router.$main.trigger('changed.category', [rst])
            })
            //下载产品
            let pPd = srvProduct.download(user.token, callback).then(rst => {
                progress(20)
                router.$main.trigger('changed.product', [rst])
            })

            return Promise.all([pCate, pPd]).then(rsts => {
                progress(100-progress.percent)
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

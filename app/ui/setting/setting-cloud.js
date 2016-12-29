const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const srvSetting = require(appPath+'/service/setting.js')
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
        this.doDownload(btn)
    }
    doDownload(btn){
        let $btn = $(btn).addClass('disabled')
        let $tips = $btn.find('.tips').removeClass('text-danger').text('......')
        let $progress = this.$form.find('.progress').removeClass('hidden')
        let $progressBar = $progress.find('.progress-bar')
        let $steps = this.$form.find('.steps')
        let progress = (p) => {
            progress.percent += p||1
            $progressBar.css('width', progress.percent+'%')
        }
        progress.percent = 0
        let callback = (step, left) => {
            let $step = $steps.find('.'+step)
            $step.find('.status').text('下载中')
            switch (step){
                case 'user': case 'tags': case 'units': case 'pack-units': progress(5); break
                case 'category': progress(10); break
                case 'product': progress(20); break
                default: progress(1); break
            }
        }
        progress(0); $steps.find('.status').text('未开始') //准备下载
        let pUser = srvUser.download(callback)//先下载用户信息
        pUser.then(user => {
            progress(5); $steps.find('.user .status').text('已完成')
            router.$main.trigger('changed.user', [user])
            //下载tags
            let pTags = srvSetting.downloadTags(user.token, callback).then(rst => {
                progress(5); $steps.find('.tags .status').text('已完成')
                router.$main.trigger('changed.setting.tags', [rst])
            })
            //下载Units&PackUnits
            let pUnit = srvSetting.downloadUnits(user.token, callback).then(rst => {
                progress(5); $steps.find('.units .status').text('已完成')
            })
            let pPackUnit = srvSetting.downloadPackUnits(user.token, callback)
            Promise.all([pUnit, pPackUnit]).then(rst => {
                progress(5); $steps.find('.pack-units .status').text('已完成')
                router.$main.trigger('changed.setting.units', [rst])
            })
            //下载品类
            let pCate = srvCate.download(user.token, callback).then(rst => {
                progress(10); $steps.find('.category .status').text('已完成')
                router.$main.trigger('changed.category', [rst])
            })
            //下载产品
            let pPd = srvProduct.download(user.token, callback).then(rst => {
                progress(20); $steps.find('.product .status').text('已完成')
                router.$main.trigger('changed.product', [rst])
            })

            return Promise.all([pTags, pUnit, pPackUnit, pCate, pPd]).then(rsts => {
                progress(100-progress.percent)
                tfn.tips('下载完成！')
                $tips.text('')
            })
        }).catch(err => {
            tfn.tips(err.message, 'danger')
            $tips.text(err.message).addClass('text-danger')
        }).finally(() => {
            this.downloading = false
            $btn.removeClass('disabled')

        })
    }
    onUpload(e, btn){
        tfn.tips('该功能暂不开放。')
    }
}

module.exports = CompForm

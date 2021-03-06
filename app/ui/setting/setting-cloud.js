const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const srvSetting = require(appPath+'/service/setting.js')
const srvCust = require(appPath+'/service/customer.js')
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
        progress(0) //准备下载
        $steps.find('.status').text('等待下载...')
        let callback = (step, stage) => {
            let $step = $steps.find('.'+step)
            let $status = $step.find('.status')
            switch (stage){
            case 'merging':
                $status.text('合并数据...'); break
            case 'merged':
                $status.text('保存数据...'); break
            case 'images':
                $status.text('下载图片...'); break
            case 'done': default:
                $status.text('下载完成')
            }
            progress(5)
            // switch (step){
            // case 'user': case 'tags': case 'units': case 'pack-units':
            //     progress(5); break
            // case 'contact': case 'category':
            //     progress(10); break
            // case 'product':
            //     progress(10); break
            // default:
            //     progress(1); break
            // }
        }
        let pUser = srvUser.download(callback)//先下载用户信息
        pUser.then(user => {
            router.$main.trigger('changed.user', [user])
            //下载tags
            let pTags = srvSetting.downloadTags(user.token, callback).then(rst => {
                router.$main.trigger('changed.setting.tags', [rst])
            })
            //下载Units&PackUnits
            let pUnit = srvSetting.downloadUnits(user.token, callback)
            let pPackUnit = srvSetting.downloadPackUnits(user.token, callback)
            Promise.all([pUnit, pPackUnit]).then(rst => {
                router.$main.trigger('changed.setting.units', [rst])
            })
            // 下载客户和供应商
            let pCust = srvCust.download(user.token, callback).then(rst => {
                router.$main.trigger('changed.customer', [rst])
            })
            //下载品类
            let pCate = srvCate.download(user.token, callback).then(rst => {
                router.$main.trigger('changed.category', [rst])
            })
            //下载产品
            let pPd = srvProduct.download(user.token, callback).then(rst => {
                router.$main.trigger('changed.product', [rst])
            })
            return Promise.all([pCust, pTags, pUnit, pPackUnit, pCate, pPd]).then(() => {
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
    onUpload(){
        tfn.tips('该功能暂不开放。')
    }
}

module.exports = CompForm

const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvProduct = require(appPath+'/service/product.js')
require(appPath+'/ui/base/jquery/dropdown/dd-unit.js')

class ProductSpecForm extends ModalForm {
    get $img(){
        return this._$img || (this._$img = this.$form.find('img.image-preview'))
    }
    get $imgIpt(){
        return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    }
    prepareEvents(){
        super.prepareEvents()
        this._autoRead = false
        this.prepareUnits()
    }
    prepareUnits(){
        let $units = this.$form.find('input[name][data-dd-type]')
        $units.autoDdGrid().on('typeahead:select', (e, s) => {
            this.doSelect(e.target, s)
        })
    }
    refreshUnits(){
        let $units = this.$form.find('input[name][data-dd-type]')
        $units.autoDdGrid('refresh')
    }
    doSelect(target, selected){
        let $target = $(target)
        let $ipts = $target.closest('.input-group').find('input[name]')
        for (let ipt of $ipts){
            // if (ipt == target) continue
            let $ipt = $(ipt)
            let val = selected[$ipt.data('ddKey')]
            $ipt.autoDdGrid('val', val)
            this.$page.find('span[name='+ipt.name+']').text(val)
        }
    }
    init(){
        super.init()
        this.initImg()
    }
    initImg(){
        this.$imgIpt.inputImg().change((e) => {
            let file = e.target.files[0]
            if (!file || !file.path) return
            this.$img.attr('src', file.path);
            srvProduct.saveImg(file).then(file => {
                console.log(file)
                this.$imgIpt.data('fileId', file._id)
                this.$imgIpt.val('') //reset file input
                this.$form.closest('.on-reading, .on-editing').input('edit')
            })
        })
    }
    // doLoad(){
    //     return srvProduct.load()
    // }
    render(spec){
        this.setFormData(spec)
        this.loadImg()
        this.refreshUnits()
    }
    loadImg(){
        srvProduct.loadImg(this.$imgIpt.data('fileId')).then(file => {
            this.$img.attr('src', file&&file.path||this.$img.attr('alt-src'))
        })
    }
    doSave(spec){
        this.$parentPage.trigger('changed.spec.product', [spec])
        return true
    }
    toRead(){
        this.$parentPage.toRead()
    }
    toEdit(){
        this.$parentPage.toEdit()
    }
}

module.exports = ProductSpecForm

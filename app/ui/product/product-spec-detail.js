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
        this.prepareUnits()
    }
    prepareUnits(){
        let $units = this.$form.find('input[name=unit],input[name=unitEn]')
        $units.autoDdGrid().on('typeahead:select', (e, s) => {
            this.doSelect(e, s)
        })
    }
    refreshUnits(){
        let $units = this.$form.find('input[name=unit],input[name=unitEn]')
        $units.autoDdGrid('refresh')
    }
    doSelect(e, s){
        s.name && this.$form.find('input[name=unit]').autoDdGrid('val', s.name)
        s.nameEn && this.$form.find('input[name=unitEn]').autoDdGrid('val', s.nameEn)
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
    onConfirm(){
        if (this.isEditing){
            let spec = this.getFormData()
            this.$parentPage.trigger('changed.spec.product', [spec])
        }
        this.$modal.modal('hide')
    }
}

module.exports = ProductSpecForm

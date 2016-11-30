const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvProduct = require(appPath+'/service/product.js')
require(appPath+'/ui/base/jquery/dropdown/dd-units.js')

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
        let $unit = this.$form.find('input[name=unit],input[name=unitEn]')
        $unit.autoDdGrid({
            minLength: 0, highlight: true
        }).on('typeahead:select', (e, s) => {
            this.doSelect(e, s)
        })
        // $unit = this.$form.find('input[name=unitEn]')
        // $unit.autoDdGrid('DdUnits', {
        //     minLength: 0, highlight: true
        // }).on('typeahead:select', (e, s) => {
        //     this.doSelect(e, s)
        // })
    }
    doSelect(e, s){
        s.name && this.$form.find('input[name=unit]').val(s.name)
        s.nameEn && this.$form.find('input[name=unitEn]').val(s.nameEn)
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

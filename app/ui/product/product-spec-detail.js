const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvProduct = require(appPath+'/service/product.js')
require(appPath+'/ui/base/jquery/dropdown/dd-unit.js')

class ProductSpecForm extends ModalForm {
    prepare(){
        super.prepare()
        this._autoRead = false
    }
    get $img(){
        return this._$img || (this._$img = this.$form.find('img.image-preview'))
    }
    get $imgIpt(){
        return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    }
    initEvents(){
        super.initEvents()
        this.initImg()
        this.initUnits()
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
    initUnits(){
        let $units = this.$form.find('input[name][data-dd-type]')
        $units.autoDdGrid().on('typeahead:select', (e, suggestion) => {
            this.selectUnits(e.target, suggestion)
        })
    }
    refreshUnits(){
        let $units = this.$form.find('input[name][data-dd-type]')
        $units.autoDdGrid('refresh')
    }
    selectUnits(target, suggestion){
        let $target = $(target)
        let $ipts = $target.closest('.input-group').find('input[name]')
        for (let ipt of $ipts){
            this.$page.find('span[name='+ipt.name+']').text(ipt.value)
        }
    }
    initValidators(){
        super.initValidators()
        // let $code = this.$form.find('input[name=code]')
        // $tags.data('validator', (ipt) => {
        //     return !!ipt.value
        // })
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
    checkFormData(){
        let valid = super.checkFormData()
        if (valid){
            valid = this.checkSpecCode()
        }
        return valid
    }
    checkSpecCode(){
        let _$id = this.$form.find('input[name=_id]')
        let _id = _$id.val()
        let $code = this.$form.find('input[name=code]')
        let code = $code.val()
        let parent = this.$parentPage.data('page')
        let valid = parent.checkSpecCode({_id,code})
        if (!valid){
            tfn.tips('规格编号重复！', 'warning')
            $code.focus()
        }
        return valid
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

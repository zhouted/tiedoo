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
                // console.log(file)
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
    selectUnits(target){
        let $target = $(target)
        let $ipts = $target.closest('.input-group').find('input[name]')
        for (let ipt of $ipts){
            this.$page.find('span[name='+ipt.name+']').text(ipt.value)
        }
    }
    initValidators(){
        super.initValidators()
        //检查规格编号
        let $code = this.$form.find('input.spec-code')
        $code.data('validator', (ipt) => {
            if (!ipt.value){
                $code.attr('data-content', '规格编号不能为空！')
                return false
            }else{
                $code.attr('data-content', '规格编号重复！')
            }
            let spec = {
                _id: this.$form.find('input[name=_id]').val(),
                code: ipt.value,
            }
            let parent = this.$parentPage.data('page')
            let valid = parent.checkSpecCode(spec)//交给父窗口(产品明细)去检查
            return valid
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
    // checkFormData(){
    //     let valid = super.checkFormData()
    //     if (valid){
    //         valid = this.checkSpecCode()
    //     }
    //     return valid
    // }
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

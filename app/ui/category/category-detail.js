const ModalForm = require(appPath+'/ui/base/modal-form.js')
const srvCategory = require(appPath+'/service/category.js')

class CategoryDetailForm extends ModalForm {
    // get $img(){
    //     return this._$img || (this._$img = this.$form.find('img.image-preview'))
    // }
    // get $imgIpt(){
    //     return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    // }
    // init(){
    //     super.init()
    //     this.initImg()
    // }
    // initImg(){
    //     this.$imgIpt.inputImg().change((e) => {
    //         let file = e.target.files[0]
    //         if (!file || !file.path) return
    //         this.$img.attr('src', file.path);
    //         srvCategory.saveImg(file).then(file => {
    //             console.log(file)
    //             this.$imgIpt.data('fileId', file._id)
    //             this.$imgIpt.val('') //reset file input
    //             this.$form.closest('.on-reading, .on-editing').input('edit')
    //         })
    //     })
    // }
    onShown(){
        this.toEdit()
    }
    doLoad(param){
        return srvCategory.loadById(param._id).then(cate => {
            cate = cate || {pcode: param.pcode}
            return cate
        })
    }
    render(cate){
        this.setFormData(cate)
        // this.loadImg()
    }
    // loadImg(){
    //     srvCategory.loadImg(this.$imgIpt.data('fileId')).then(file => {
    //         this.$img.attr('src', file&&file.path||this.$img.attr('alt-src'))
    //     })
    // }
    doSave(cate){
        return srvCategory.save(cate).then((rst) => {
            this.$parentPage.trigger('changed.category', [cate])
            return rst
        }).catch(err => {
            tfn.tips(err.message, 'danger')
            return Promise.reject(err)
        })
    }
    // onConfirm(){
    //     if (this.isEditing){
    //         let cate = this.getFormData()
    //         this.$parentPage.trigger('changed.category', [cate])
    //     }
    //     this.$modal.modal('hide')
    // }
}

module.exports = CategoryDetailForm

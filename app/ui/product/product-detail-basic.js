const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvProduct = require(appPath+'/service/product.js')
const srvCategory = require(appPath+'/service/category.js')
require(appPath+'/ui/base/jquery/jquery.ctree.js')

class ProductDetailBasicForm extends BaseForm {
    get $img(){
        return this._$img || (this._$img = this.$form.find('img.image-preview'))
    }
    get $imgIpt(){
        return this._$imgIpt || (this._$imgIpt = this.$form.find('input[name=imageId]'))
    }
    get $ctree(){
        return this._$ctree || (this._$ctree = this.$page.find('.category .ctree'))
    }
    get $cateCode(){
        return this._$cateCode || (this._$cateCode = this.$form.find('.category input[name=code]'))
    }
    get $cateName(){
        return (this._$cateName = this.$form.find('.category span[name=name]'))
    }
    prepareEvents(){
        super.prepareEvents()
        this.prepareCategory()
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
    prepareCategory(){
        // 品类选择器
        let $selector = this.$page.find('.category .selector')
        this.$form.find('.category-toggle').click(function(){
            $selector.toggle()
        })
        this.$form.find('.category input[name-space=category]').focusin(function(){
            $selector.show()
        })
        $(document).click(function(e){
            var parents = $(e.target).closest('.category')
            if (!parents.length){
                $selector.hide('fast')
            }
        })
        // 品类树
        var treeOpt = {//hideCheck: false, checkType: 'radio',
            keepFocus: true,
        }
        this.$ctree.cTree('init', treeOpt)
        this.$ctree.on('ctree:load', (e, ctree, cnode) => {
            srvCategory.loadTree().then((nodes) => {
                ctree.load(nodes, cnode)
                this.renderCate()
            })
        }).on('ctree:click', (e, ctree, cnode) => {
            this.$cateCode.val(cnode.code)
            this.$cateName.text(cnode.name)
        })
        router.$main.on('changed.category', (e, data) => {
            this.$ctree.cTree('refresh', treeOpt)
        })
    }
    // doLoad(){
    //     return srvProduct.load()
    // }
    render(product){
        this.setFormData(product)
        this.loadImg()
        this.renderCate()
    }
    loadImg(){
        srvProduct.loadImg(this.$imgIpt.data('fileId')).then(file => {
            this.$img.attr('src', file&&file.path||this.$img.attr('alt-src'))
        })
    }
    renderCate(){
        let node = {id: this.$cateCode.val()}
        let $node = this.$ctree.cTree('locate', node)
        // let node = this.$ctree.cTree('get', $node)
        this.$cateName.text(node.name||'')
    }
}

module.exports = ProductDetailBasicForm

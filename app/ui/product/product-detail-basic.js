const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvProduct = require(appPath+'/service/product.js')
const srvCategory = require(appPath+'/service/category.js')
const srvSetting = require(appPath+'/service/setting.js')

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
    get $categoryCode(){
        return this._$categoryCode || (this._$categoryCode = this.$form.find('.category input[name=categoryCode]'))
    }
    get $categoryName(){
        return (this._$categoryName = this.$form.find('.category span[name=categoryName]'))
    }
    initEvents(){
        super.initEvents()
        this.initImg()
        this.initCategory()
        this.initTags()
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
    initValidators(){
        super.initValidators()
        let $pdCode = this.$form.find('input.product-code')
        $pdCode.data('validator', (ipt) => {
            let pd = this.$form.input('values')
            let p = srvProduct.checkPdCode(pd)
            return p
        })
        let $tags = this.$form.find('input[name=tags]')
        let limit = $tags.data('tagsLimit')||10
        $tags.data('validator', (ipt) => {
            return !ipt.value || ipt.value.split(',').length <= limit
        })
    }
    initCategory(){
        // 品类选择器
        let $selector = this.$page.find('.category .selector')
        this.$form.find('.category-toggle').click(function(){
            $selector.toggle()
        })
        this.$categoryCode.focusin(function(){
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
            this.$categoryCode.val(cnode.code)
            this.$categoryName.text(cnode.name)
        })
        router.$main.on('changed.category', (e, data) => {
            this.$ctree.cTree('refresh', treeOpt)
        })
    }
    initTags(){
        this.$form.find('.form-group.tags').on('keyup', (e) => {
            if (e.keyCode == 229){
                e.target.value = e.target.value.replace(/，/g, ', ');
            }
        })
        //预置标签
        let $tags = this.$form.find('.preset-tags')
        $tags.on('click', '.label', (e) => {
            this.toAddTag(e.target)
        })
        function loadTags(){
            srvSetting.loadTags().then(tags => {
                $tags.children().remove()
                for (let tag of tags){
                    let $tag = $('<span></span>').addClass('label label-default').text(tag)
                    $tags.append($tag)
                }
            })
        }
        router.$main.on('changed.setting.tags', (e, data) => {
            loadTags()
        })
        loadTags()
    }
    // doLoad(){
    //     return srvProduct.load()
    // }
    render(product){
        this.setFormData(product)
        this.loadImg()
        this.renderCate()
        this.renderTags()
    }
    loadImg(){
        srvProduct.loadImg(this.$imgIpt.data('fileId')).then(file => {
            this.$img.attr('src', file&&file.path||this.$img.attr('alt-src'))
        })
    }
    renderCate(){
        let node = {id: this.$categoryCode.val()}
        let $node = this.$ctree.cTree('locate', node)
        // let node = this.$ctree.cTree('get', $node)
        this.$categoryName.text(node.name||'')
    }
    renderTags(){
        let tags = this.$form.find('input[name=tags]').val()
        let $tags = this.$form.find('.form-control-tags')
        $tags.text('')
        if (!tags) return
        tags = tags.split(',')
        for (let tag of tags){
            let $tag = $('<span></span>').addClass('label label-default').text(tag)
            $tags.append($tag)
        }
    }
    toAddTag(tag){
        let $tag = $(tag)
        tag = $.trim($tag.text())
        let $ipt = $tag.closest('.form-group.tags').find('input[name=tags]')
        let limit = $ipt.data('tagsLimit')||10
        let tags = $ipt.val()? $ipt.val().split(',') : []
        tags = tags.map(tag => $.trim(tag))
        let pos = tags.indexOf(tag)
        if (pos < 0){
            if (tags.length >= limit){
                tfn.tips('产品标签数不要超过'+limit+'个！')
                return
            }
            tags.push(tag)
        }else{
            tags.splice(pos, 1)
        }
        $ipt.val(tags.join(', '))
    }
}

module.exports = ProductDetailBasicForm

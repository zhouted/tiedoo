const ListPage = require(appPath+'/ui/base/list-page.js')
const srvProduct = require(appPath+'/service/product.js')
const srvCategory = require(appPath+'/service/category.js')
require(appPath+'/ui/base/jquery/jquery.ctree.js')

class ProductPage extends ListPage{
    get $ctree(){
        return this._$ctree || (this._$ctree = this.$page.find('.ctree'))
    }
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table.product-list'))
    }
    get $tplPd(){
        return this._$tplPd || (this._$tplPd = this.$table.find('#tplPd'))
    }
    get $tplSpec(){
        return this._$tplSpec || (this._$tplSpec = this.$table.find('#tplSpec'))
    }
    get selectedSpecIds(){
        let ids = []
        let $checks = this.$table.find('.product-item-spec>.field-check>input[type=checkbox]:checked')
        for (let check of $checks){
            let id = this.getItemId(check)
            id && ids.push(id)
        }
        return ids

    }
    getItemPdId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('.product-item')
        return $item.data('id')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onDiscard: '.btn.discard',
            onRestore: '.btn.restore',
            onToggleDiscarded: '.btn.toggle-discarded',
            onToggleLeft: '.btn.toggle-category',
            onDetail: '.product-item>tr>td',
        })
    }
    // showBtns(){
    // }
    prepareEvents(){
        super.prepareEvents()
        this.prepareCategory()
        router.$main.on('changed.product', (e, data) => {
            this.reload()
        })
    }
    prepareCategory(){
        let treeOpt = {
            root: {children: null},
            showIcon: false,
        }
        this.$ctree.cTree('init', treeOpt)
        this.$ctree.on('ctree:load', (e, ctree, cnode) => {
            srvCategory.loadTree().then(nodes => {
                ctree.load(nodes, cnode)
                if (this._param.category){
                    this.$ctree.cTree('locate', {id: this._param.category.code})
                }
            })
        }).on('ctree:click', (e, ctree, cnode) => {
            cnode && this.load({category:{code:cnode.code}})
        })
        router.$main.on('changed.category', (e, data) => {
            this.$ctree.cTree('refresh', treeOpt)
        })
        this.$page.find('.btn-category').click((e) => {
            router.loadMainPanel('category')
            e.stopPropagation()
        })
    }
    get defaultParam(){
        let param = {
            orderBy: {code:1},
            paging: {pageSize: 10},
            discard: this._discard||false,
        }
        return param
    }
    doLoad(param){
        return srvProduct.load(param)
    }
    render(data){
        this.$tplPd.siblings('tbody').remove()
        for (let pd of data) {
            let $item = $(tfn.template(this.$tplPd, pd))
            let specs = pd.specs
            if (specs){
                $item.append(tfn.template(this.$tplSpec, specs))
            }
            this.$tplPd.before($item)
        }
        this.loadImg()
    }
    loadImg(){
        this.$table.find('img[data-id]').each((i, img) => {
            let $img = $(img), imageId = $img.data('id')
            srvProduct.loadImg(imageId).then(file => {
                file && $img.attr('src', file.path)
            })
        })
    }
    doSearch(text){
        this.load({key: text})
    }
    toDetail(id){
        router.loadMainPanel('productDetail', {_id:id, _discard:this._discard})
    }
    onDetail(e, target){
        let id = this.getItemPdId(target)
        if (!id) return
        this.toDetail(id)
    }
    onAddNew(e, btn){
        this.toDetail()
    }
    onToggleDiscarded(e, btn){
        this._discard = !this._discard
        let category = this._param.category
        this.load({category}).then(() => {
            if (this._discard){
                this.$page.find('.for-discarded-hidden').addClass('hidden')
                this.$page.find('.for-discarded').removeClass('hidden')
            }else{
                this.$page.find('.for-discarded').addClass('hidden')
                this.$page.find('.for-discarded-hidden').removeClass('hidden')
            }
        })
    }
    onToggleLeft(e, btn){
        this.toggleLeft()
    }
    toggleLeft(show){
		var $toggle = this.$page.find('.toggle-category');
		var $left = this.$ctree.closest('aside');
		var $right = $left.nextAll();
		if (show === undefined){
		   show = !$left.is(':visible');
		}
		var $icon = $toggle.find('.glyphicon');
		// var showClass = 'glyphicon-backward';
		// var hideClass = 'glyphicon-forward';
		var rowClasses = 'col-xs-10';
		if (!show){//隐藏左侧树
			$icon.addClass('ts-x')//.removeClass(showClass).addClass(hideClass);
			$toggle.data('toggling', true);
			$left.hide('slow', function(){
				$right.removeClass(rowClasses);
				// !page.editMode && $right.find('.hide-more').show();
				$toggle.data('toggling', false);;
			});
		}else{//显示左侧树
			$icon.removeClass('ts-x')//.removeClass(hideClass).addClass(showClass);
			$toggle.data('toggling', true);
			$right.addClass(rowClasses);
			// !page.editMode && $right.find('.hide-more').hide();
			$left.show('slow', function(){
				$toggle.data('toggling', false);
			});
		}
	}
    onDiscard(e, btn){
        let ids = this.selectedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要归档的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认归档这${ids.length}个产品规格吗？`)){
            return
        }
        let p = srvProduct.discardSpecByIds(ids)
        p.then((rst) => {
            console.log(rst)
            this.reload()
        })
    }
    onRestore(e, btn){
        let ids = this.selectedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要还原的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认还原这${ids.length}个产品规格吗？`)){
            return
        }
        let p = srvProduct.restoreSpecByIds(ids)
        p.then((rst) => {
            console.log(rst)
            this.reload()
        })
    }
    onDelete(e, btn){
        let ids = this.selectedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要删除的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认删除这个${ids.length}产品规格吗？`)){
            return
        }
        let p = srvProduct.removeSpecByIds(ids)
        p.then((rst) => {
            console.log(rst)
            this.reload()
        })
    }
}

module.exports = ProductPage

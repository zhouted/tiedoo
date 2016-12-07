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
    get $checkedBar(){
        return this._$checkedBar || (this._$checkedBar = this.$page.find('.checked-bar'))
    }
    get $checkAllPages(){
        return this._$checkAllPages || (this._$checkAllPages = this.$page.find('.check-allpages'))
    }
    get checkedPdIds(){
        return this._checkedPdIds || (this._checkedPdIds = [])
    }
    get checkedSpecIds(){
        return this._checkedSpecIds || (this._checkedSpecIds = [])
    }
    showCheckedBar(){
        let $bar = this.$checkedBar
        let pdNum = this.checkedPdIds.length
        $bar.find('.pd-num').text(pdNum)
        let specNum = this.checkedSpecIds.length
        $bar.find('.spec-num').text(specNum)
        if (pdNum || specNum){
            $bar.removeClass('hidden')
        }else{
            $bar.addClass('hidden')
        }
    }
    checkOne(checked, $check, $tr){
        let id = this.getItemId($tr)
        this.checkedSpecIds.popush(id, checked)
    }
    checkGroup(checked, $check, $tr){
        let id = this.getItemPdId($tr)
        this.checkedPdIds.popush(id, checked)
    }
    getItemPdId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('.product-item')
        return $item.data('id')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onShowChecked: '.btn.show-checked',
            onClearChecked: '.btn.clear-checked',
            onCheckAllPages: '.btn.check-allpages',
            onMove: '.btn.move',
            onDiscard: '.btn.discard',
            onRestore: '.btn.restore',
            onToggleDiscarded: '.btn.toggle-discarded',
            onToggleLeft: '.btn.toggle-category',
            onDetail: '.product-item>tr>td',
        })
    }
    // showBtns(){
    // }
    initEvents(){
        super.initEvents()
        this.initCategory()
        router.$main.on('changed.product', (e, data) => {
            this.reload()
        })
    }
    onClearChecked(e, btn){
        this.clearChecked()
    }
    clearChecked(){
        this.checkedPdIds.splice(0)
        this.checkedSpecIds.splice(0)
        this.$checkAllPages.removeClass('be-checked')
        this.setAllChecks(false)
    }
    onCheckAllPages(e, btn){
        this.checkAllPages()
    }
    checkAllPages(){
        let param = tfn.merge({}, this._param)
        param.paging = null
        srvProduct.load(param).then((pds) => {
            let $btn = this.$checkAllPages
            let checked = $btn.toggleClass('be-checked').is('.be-checked')
            for (let pd of pds){
                this.checkedPdIds.popush(pd._id, checked)
                for (let spec of pd.specs){
                    this.checkedSpecIds.popush(spec._id, checked)
                }
            }
            this.setAllChecks(checked)
        })
    }
    initCategory(){
        let treeOpt = {
            root: {children: null},
            showIcon: false,
        }
        this.$ctree.cTree('init', treeOpt)
        this.$ctree.on('ctree:load', (e, ctree, cnode) => {
            srvCategory.loadTree('',{unclassified:true}).then(nodes => {
                ctree.load(nodes, cnode)
                if (this._param && this._param.category){
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
        this.$tplPd.prevAll('tbody').remove()
        for (let pd of data) {
            pd.checked = this.checkedPdIds.includes(pd._id)
            let $item = $(tfn.template(this.$tplPd, pd))
            let specs = pd.specs||[]
            for (let spec of specs){
                spec.checked = this.checkedSpecIds.includes(spec._id)
                $item.append(tfn.template(this.$tplSpec, spec))
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
        let ids = this.checkedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要归档的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认归档这${ids.length}个产品规格吗？`)){
            return
        }
        let p = srvProduct.discardSpecByIds(ids)
        p.then((rst) => {
            this.clearChecked()
            this.reload()
        })
    }
    onRestore(e, btn){
        let ids = this.checkedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要还原的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认还原这${ids.length}个产品规格吗？`)){
            return
        }
        let p = srvProduct.restoreSpecByIds(ids)
        p.then((rst) => {
            this.clearChecked()
            this.reload()
        })
    }
    onDelete(e, btn){
        let ids = this.checkedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要删除的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认删除这个${ids.length}产品规格吗？`)){
            return
        }
        let p = srvProduct.removeSpecByIds(ids)
        p.then((rst) => {
            this.clearChecked()
            this.reload()
        })
    }
    onMove(e, btn){
        let ids = this.checkedPdIds
        if (!ids.length){
            tfn.tips('请先选择要修改的产品！', 'warning')
            return
        }
        let title = '将所选的 <span class="num text-danger">'+ids.length+'</span> 个产品转移至：'
        let doLoad = ()=>{
            let $ctree = $('#selectCate.ctree')
            $ctree.cTree('init')
            $ctree.on('ctree:load', (e, ctree, cnode) => {
                let tree = this.$ctree.cTree('get') //取主窗口品類數據
                let nodes = tree && tree.root && tree.root.children
                ctree.load(tfn.merge([],nodes), cnode)
            })
        }
        let doMove = ()=>{
            let $ctree = $('#selectCate.ctree')
            let cate = $ctree.cTree('get', 'focus')
            if (!cate){
                tfn.tips('请选择目标品类！')
                return
            }
            srvProduct.moveTo(ids, cate).then(() => {
                $ctree.closest('.modal').modal('hide')
                // this.$ctree.cTree('locate', cate)
                // this.load({category:{code:cate.code}})
                this.clearChecked()
                this.reload()
            })
        }
        router.loadModal({
            id: 'selectCate', title: title,
            content: '<ul id="selectCate" class="ctree for-move" style="max-height:400px; overflow:auto;"></ul>',
            onLoad: () => doLoad(), reload: true,
            confirmClick: () => doMove(),
        })
    }
}

module.exports = ProductPage

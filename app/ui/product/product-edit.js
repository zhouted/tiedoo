const ListPage = require(appPath+'/ui/base/list-page.js')
const srvProduct = require(appPath+'/service/product.js')
const srvCategory = require(appPath+'/service/category.js')
require(appPath+'/ui/base/jquery/jquery.ctree.js')
require(appPath+'/ui/base/jquery/dropdown/dd-unit.js')

class ProductPage extends ListPage{
    prepare(){
        super.prepare()
        this._forceLoad = true
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
    getItemPdId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('.product-item')
        return $item.data('id')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onDetail: '.product-item>tr>td',
        })
    }
    initEvents(){
        super.initEvents()
        //最后一个规格修改后新增一个
        this.$table.on('change', '.product-item>.product-item-spec:last-child input[name]', (e) => this.addNewSpec(e.target))
        // this.initInputs()
    }
    // getRowValues($ele){
    //     if (!($ele instanceof jQuery)){
    //         $ele = $($ele)
    //     }
    //     let values = $ele.closest('tr').input('value')
    //     return values
    // }
    initInputs($ipts){
        let $p = $ipts.closest('tr')
        $ipts.input('init', {onlyEdit:true})
        if ($p.is('.product-item-basic')){
            $ipts.find('input[name=code]').data('validator', (ipt) => this.checkPdCode(ipt))
        }
        if ($p.is('.product-item-spec')){
            $ipts.find('input[name=code]').data('validator', (ipt) => this.checkSpecCode(ipt))
        }
        if ($p.is('.product-item-spec')){
            $ipts.find('input[name][data-dd-type]').autoDdGrid()
        }
    }
    checkPdCode(ipt){
        let $ipt = $(ipt), $row = $ipt.closest('.product-item-basic')
        //非空行的编码不能为空
        let values = $row.input('values')
        if (tfn.isBlankObject(values)){
            return true
        } else if (!ipt.value){
            $ipt.attr('data-content', '编码不能为空！')
            return false
        }
        //检查编码重复
        let $otherIpts = this.$table.find('.product-item-basic').find('input[name=code]')
        for (let otherIpt of $otherIpts){
            if (otherIpt !== ipt && otherIpt.value === ipt.value){
                $ipt.attr('data-content', '编码重复！')
                return false
            }
        }
        return true
    }
    checkSpecCode(ipt){
        let $ipt = $(ipt), $row = $ipt.closest('.product-item-spec')
        //非空行的编码不能为空
        let values = $row.input('values')
        if (tfn.isBlankObject(values)){
            !$row.is(':last-child') && setTimeout(()=>$row.remove())
            return true
        } else if (!ipt.value){
            $ipt.attr('data-content', '编号不能为空！')
            return false
        }
        //检查编码重复
        let $otherIpts = $row.closest('.product-item').find('.product-item-spec').find('input[name=code]')
        for (let otherIpt of $otherIpts){
            if (otherIpt !== ipt && otherIpt.value === ipt.value){
                $ipt.attr('data-content', '编号重复！')
                return false
            }
        }
        return true
    }
    get defaultParam(){
        return {
            orderBy: {code:1},
            paging: {pageSize: 10},
        }
    }
    doLoad(param){
        this._addNew = param && param.addNew
        if (this._addNew){
            return []
        }
        return srvProduct.load(param)
    }
    render(data){
        this.$tplPd.prevAll('tbody').remove()
        if (data && data.length){
            for (let pd of data) {
                this.renderPd(pd)
            }
        }else{//没有产品时默认新增一个
            data = data||[]
            this.addNewPd()
        }
        this.loadImg()
    }
    renderPd(pd){
        let $item = $(tfn.template(this.$tplPd, pd)).data('pd', pd)
        this.initInputs($item.find('.product-item-basic'))
        let specs = pd.specs = pd.specs||[]
        for (let spec of specs){
            this.renderSpec(spec, $item)
        }
        this.renderSpec({_id:''}, $item)//默认添加一条新规格
        this.$tplPd.before($item)
    }
    renderSpec(spec, $pdItem){
        let $item = $(tfn.template(this.$tplSpec, spec)).data('spec', spec)
        this.initInputs($item)
        $pdItem.append($item)
    }
    addNewPd(){
        let pd = {_id:'', specs:[]}
        this.renderPd(pd)
    }
    addNewSpec(target){
        let $target = $(target)
        let $item = $target.closest('.product-item')
        this.renderSpec({_id:''}, $item)
    }
    loadImg(){
        this.$table.find('img[data-id]').each((i, img) => {
            let $img = $(img), imageId = $img.data('id')
            srvProduct.loadImg(imageId).then(file => {
                file && $img.attr('src', file.path)
            })
        })
    }
    checkPageData(){
        let valid = this.$table.input('check')
        return valid
    }
    getPageData(){
        let pds = this._data = this._data||[]
        let $pdItems = this.$table.find('.product-item')
        for (let pdItem of $pdItems){
            let $pdItem = $(pdItem)
            let pd = $pdItem.data('pd')
            let $basic = $pdItem.find('.product-item-basic')
            let basic = $basic.input('value')
            tfn.merge(pd, basic)//把修改合并到原始数据中
            let $specItems = $pdItem.find('.product-item-spec')
            for (let specItem of $specItems){
                let $specItem = $(specItem)
                let spec = $specItem.data('spec')
                let specEx = $specItem.input('value')
                tfn.merge(spec, specEx)
                if (!pd.specs.includes(spec)){//新增的加入进来
                    if (!tfn.isBlankObject(spec)){//但不要啥都没填的
                        pd.specs.push(spec)
                    }
                }
            }
            if (!pds.includes(pd)){
                if (!tfn.isBlankObject(pd)){
                    pds.push(pd)
                }
            }
        }
        return pds
    }
    doSave(data){
        console.log(data)
    }
    onAddNew(e, btn){
        this.addNewPd()
    }
    toDetail(id){
        // router.loadMainPanel('productDetail', {_id:id, _discard:this._discard})
    }
    onDetail(e, target){
        // let id = this.getItemPdId(target)
        // if (!id) return
        // this.toDetail(id)
    }
    onDelete(e, btn){
        // let ids = this.checkedSpecIds
        // if (!ids.length){
        //     tfn.tips('请先选择要删除的记录！', 'warning')
        //     return
        // }
        // if (!window.confirm(`确认删除这个${ids.length}产品规格吗？`)){
        //     return
        // }
        // let p = srvProduct.removeSpecByIds(ids)
        // p.then((rst) => {
        //     this.clearChecked()
        //     this.reload()
        // })
    }
    onHide(){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return false
            // this.render(this._data)
            this._modified = false
        }
        return true
    }
    onBack(e, btn){
        router.loadMainPanel('product')
    }
}

module.exports = ProductPage

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
        $ipts.find('input[type=file][name=imageId]').each((i, ipt) => {
            let $ipt = $(ipt), imageId = $ipt.data('fileId')
            let $img = $ipt.siblings('img')
            if (imageId){
                srvProduct.loadImg(imageId).then(file => {
                    file && $img.attr('src', file.path)
                })
            }
            $ipt.inputImg().change(e => {
                let file = e.target.files[0]
                if (!file || !file.path) return
                $img.attr('src', file.path)
                srvProduct.saveImg(file).then(file => {
                    $ipt.data('fileId', file._id)
                    $ipt.val('') //reset file input
                })
            })
            $ipt.closest('.field-img').hover(e => {
                if ($ipt.data('fileId')){
                    $(e.target).find('.btn.img-clear').removeClass('hidden')
                }
            }, e => {
                $(e.target).find('.btn.img-clear').addClass('hidden')
            }).find('.btn.img-clear').click(e => {
                $ipt.data('fileId', '').change()
                $img.attr('src', 'ui/images/default.png')
            })
        })
        if ($p.is('.product-item-basic')){
            $ipts.find('input[name=code]').data('validator', (ipt) => this.checkPdCode(ipt))
        }
        if ($p.is('.product-item-spec')){
            $ipts.find('input[name=code]').data('validator', (ipt) => this.checkSpecCode(ipt))
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
        let p = srvProduct.checkPdCode(values)
        return p
    }
    checkSpecCode(ipt){
        let $ipt = $(ipt), $row = $ipt.closest('.product-item-spec')
        //非空行的编码不能为空
        let values = $row.input('values')
        if (tfn.isBlankObject(values)){
            !$row.is(':last-child') && setTimeout(()=>$row.remove())//移除多余的空行
            return true
        } else if (!ipt.value){
            $ipt.attr('data-content', '规格编号不能为空！')
            return false
        }
        //检查编码重复
        let $otherIpts = $row.closest('.product-item').find('.product-item-spec').find('input[name=code]')
        for (let otherIpt of $otherIpts){
            if (otherIpt !== ipt && otherIpt.value === ipt.value){
                $ipt.attr('data-content', '规格编号重复！')
                return false
            }
        }
        let pdBasic = $row.siblings('.product-item-basic').input('values')
        if (pdBasic._id){
            pdBasic.specs = [$row.input('values')]
            let p = srvProduct.checkPdSpecCodes(pdBasic)
            return p
        }
        return true
    }
    get defaultParam(){
        return {
            orderBy: {code:1},
            paging: {pageSize: 100},
        }
    }
    doLoad(param){
        return srvProduct.load(param).then(pds => {
            pds = pds || []
            this._hideSpecIds = [] //存放没选中的规格id
            pds.forEach(pd => {
                if (!pd.specs || !pd.specs.length) return
                pd.specs.forEach(spec => {
                    if (!param.specIds.includes(spec._id)){
                        this._hideSpecIds.push(spec._id)
                    }
                })
            })
            return pds
        })
    }
    rerender(data, saved){
        if (Array.isArray(data) && Array.isArray(saved)){
            let pdIds = this._param.pdIds
            let specIds = this._param.specIds
            //把保存返回的数据（主要是_id）合并到当前数据中
            saved.forEach((saved, i) => {// data 和 saved 应该是一一对应的
                let pd = data[i]
                if (saved && typeof(saved)=='object'){
                    if (!pd._id && saved._id){//选中新增产品id
                        pdIds.push(saved._id)
                        router.$main.trigger('checked.product', {pdId: saved._id})
                    }
                    tfn.merge(pd, saved)
                }
                pd.specs.forEach(spec => {//选中新增规格id
                    if (!specIds.includes(spec._id) && !this._hideSpecIds.includes(spec._id)){
                        specIds.push(spec._id)
                        router.$main.trigger('checked.product', {specId: spec._id})
                    }
                })
            })
            router.$main.trigger('changed.product', {})
        }
        this.render(data)
        this._data = data
    }
    render(pds){
        this.$tplPd.prevAll('tbody').remove()
        if (pds && pds.length){
            for (let pd of pds) {
                this.renderPd(pd)
            }
        }else{//没有产品时默认新增一个
            pds = pds||[]
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
        if (this._hideSpecIds && this._hideSpecIds.length && spec._id){
            if (this._hideSpecIds.includes(spec._id)){
                $item.addClass('hidden')//隐藏没选的规格
            }
        }
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
        let pds = []
        let $pdItems = this.$table.find('.product-item')
        for (let pdItem of $pdItems){
            let $pdItem = $(pdItem)
            let $basic = $pdItem.find('.product-item-basic')
            let $specItems = $pdItem.find('.product-item-spec')
            let pd = $basic.input('value')
            pd.specs = []
            for (let specItem of $specItems){
                let $specItem = $(specItem)
                let spec = tfn.merge({}, $specItem.data('spec'))
                let specEx = $specItem.input('value')
                tfn.merge(spec, specEx)//把修改合并到原始数据中
                // if (!pd.specs.includes(spec)){//新增的加入进来
                    if (!tfn.isBlankObject(spec)){//不要啥都没填的
                        spec._id = spec._id || srvProduct.newSpecId()
                        pd.specs.push(spec)
                    }
                // }
            }
            if (!tfn.isBlankObject(pd)){
                pds.push(pd)
            }
        }
        return pds
    }
    doSave(data){
        return srvProduct.saves(data).then(rst => {
            tfn.tips('保存成功！')
            return rst
        }).catch(err => {
            tfn.tips(err.message, 'danger')
            if (err.code){//定位重复代码
                let $ipts = this.$table.find('.product-item-basic:visible').find('input[name=code]')
                for (let ipt of $ipts){
                    if (ipt.value !== err.code) continue
                    if (!err.specCode){
                        $(ipt).attr('data-content', err.message).focus().popover('show')
                        break
                    }
                    let $ipt = $(ipt)
                    let $specIpts = $ipt.closest('.product-item-basic').siblings('.product-item-spec:visible').find('input[name=code]')
                    for (let specIpt of $specIpts){
                        if (specIpt.value !== err.specCode) continue
                        $(specIpt).attr('data-content', err.message).focus().popover('show')
                        break
                    }
                }
            }
            return Promise.reject(err)
        })
    }
    onAddNew(e, btn){
        this.addNewPd()
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
    onPaging(pageNo, prePageNo){
        if (this._modified){
            tfn.tips('请先保存修改！')
            return false
        }
        return super.onPaging(pageNo)
    }
    onSort(e){
        if (this._modified){
            tfn.tips('请先保存修改！')
            return
        }
        super.onSort(e)
    }
}

module.exports = ProductPage

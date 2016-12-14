const BasePage = require(appPath+'/ui/base/base-page.js')
class ListPage extends BasePage{
    prepare(){
        super.prepare()
        this._forceLoad = false
    }
    get $searchBtn(){
        return this._$searchBtn || (this._$searchBtn = $(this.$page.find(this.btns.onSearch)))
    }
    get $searchIpt(){
        return this._$searchIpt || (this._$searchIpt = $(this.$page.find('input[type=search]')))
    }
    get $paging(){
        return this._$paging || (this._$paging = this.$page.find('.pagination'))
    }
    get $sortables(){
        return this._$sortables || (this._$sortables = this.$page.find('thead>tr>th.sortable'))
    }
    initEvents(){
        super.initEvents()
        // on search
        this.$searchIpt.keyup(e => {
            if (e && e.which == 13){
                this.$searchBtn.click()
            }
        })
        // on toggle group
        this.$page.on('click', 'thead>tr>th.field-toggle', e => this.onToggleAll(e))
        this.$page.on('click', 'tbody>tr.group>th.field-toggle', e => this.onToggleGroup(e))
        // on check
        this.$page.on('change', 'thead>tr>th>input[type=checkbox]', e => this.onCheckAll(e))
        this.$page.on('change', 'tbody>tr.group>th>input[type=checkbox]', e => this.onCheckGroup(e))
        this.$page.on('change', 'tbody>tr:not(.group)>th>input[type=checkbox]', e => this.onCheckOne(e))
        // sortables
        this.$sortables.click(e => this.onSort(e))
    }
    get defaultParam(){
        return {orderBy:{name:1}, paging:{pageSize:20}}
    }
    onLoaded({data, param}){
        super.onLoaded({data, param})
        this.setCheckAll()
        param && param.paging && this.renderPager(param.paging)
    }
    renderPager(paging){
        let pagination = this.$paging.data('twbs-pagination')
        if (pagination){
            if (pagination.options.totalPages == paging.totalPages){
                return
            }
            pagination.destroy()
        }
        if (!paging.totalPages || paging.totalPages <= 1){
            return//不操过1页不显示分页栏
        }
        let options = {
            startPage: paging.pageNo||1,
            totalPages: paging.totalPages||1,
            currentPage: paging.pageNo||1,
            onPageClick: (e, pageNo)=>{
                console.log(pageNo, e)
                let pagination = this.$paging.data('twbs-pagination')
                if (pagination && pagination.options.currentPage !== pageNo) {
                    if (!this.onPaging(pageNo)){
                        pagination.show(pagination.options.currentPage)
                    }else{
                        pagination.options.currentPage = pageNo
                    }
                }
            }
        }
        this.$paging.twbsPagination(options)
    }
    onPaging(pageNo){
        this.reload({paging:{pageNo}})
        return true
    }
    onSearch(e, btn){
        let text = this.$searchIpt.val()
        this.doSearch(text)
    }
    doSearch(text){
        tfn.tips(text)
    }
    onToggleAll(e){

    }
    onToggleGroup(e){
        
    }
    get checkedIds(){
        let ids = []
        let $checks = this.$table.find('input[type=checkbox]:checked')
        for (let check of $checks){
            let id = this.getItemId(check)
            id && ids.push(id)
        }
        return ids
    }
    $itemOf(item){
        let $item = (item instanceof jQuery)? item : $(item)
        return $item.closest('tr')
    }
    getItemData(item){
        return this.$itemOf(item).data()
    }
    getItemId(item){
        return this.$itemOf(item).data('id')
    }
    checkOne(checked, $check, $tr){
        console.log('checkOne')
    }
    checkGroup(checked, $check, $tr){
        console.log('checkGroup')
    }
    setAllChecks(checked){
        this.$table.find('input[type=checkbox]').prop('checked', checked)
        this.showCheckedBar()
    }
    setCheckAll(){
        let $allChecks = this.$table.find('tbody').find('input[type=checkbox]')
        let checked = $allChecks.length && !$allChecks.filter(':not(:checked)').length
        this.$table.find('thead>tr>th>input[type=checkbox]').prop('checked', checked)
        this.showCheckedBar()
    }
    onCheckOne(e){
        let $check = $(e.target), checked = $check.prop('checked')
        let $tr = $check.closest('tr'), $tb = $tr.closest('tbody')
        this.checkOne(checked, $check, $tr)
        let $allChecks = $tb.find('tr:not(.group)').find('input[type=checkbox]')
        let $group = $tb.find('tr.group')
        let $checkGroup = $group.find('input[type=checkbox]')
        if ($checkGroup.length && $checkGroup.prop('checked') !== checked){// 有分组时，联动选中分组行
            if (checked || !$allChecks.filter(':checked').length){
                $checkGroup.prop('checked', checked)
                this.checkGroup(checked, $checkGroup, $group)
            }
        }
        this.setCheckAll()
    }
    onCheckGroup(e){
        let $checkGroup = $(e.target), checked = $checkGroup.prop('checked')
        let $group = $checkGroup.closest('tr'), $tb = $group.closest('tbody')
        this.checkGroup(checked, $checkGroup, $group)
        let $allChecks = $tb.find('tr:not(.group)').find('input[type=checkbox]')
        for (let check of $allChecks){
            let $check = $(check)
            if ($check.prop('checked') == checked) continue
            $check.prop('checked', checked)
            this.checkOne(checked, $check, $check.closest('tr'))
        }
        this.setCheckAll()
    }
    onCheckAll(e){
        let $checkAll = $(e.target), checked = $checkAll.prop('checked')
        let $grpChecks = $checkAll.closest('table').children('tbody').find('tr.group').find('input[type=checkbox]')
        for (let check of $grpChecks){
            let $check = $(check)
            if ($check.prop('checked') == checked) continue
            $check.prop('checked', checked)
            this.checkGroup(checked, $check, $check.closest('tr'))
        }
        let $allChecks = $checkAll.closest('table').children('tbody').find('tr').find('input[type=checkbox]')
        for (let check of $allChecks){
            let $check = $(check)
            if ($check.prop('checked') == checked) continue
            $check.prop('checked', checked)
            this.checkOne(checked, $check, $check.closest('tr'))
        }
        this.showCheckedBar()
    }
    showCheckedBar(){
    }
    onSort(e){
        let sortBy = {}
        let $sortable = $(e.target)
        for (let sort of this.$sortables){
            let $sort = $(sort), field = $sort.data('field')||'name'
            let $arrow = $sort.find('.sort-arrow')
            sortBy[field] = 0
            if (sort == e.target){
                sortBy[field] = 1
                if (!$arrow.length){
                    $arrow = $('<span class="sort-arrow">↑</span>')
                    $sort.prepend($arrow)
                }else if ($arrow.text() == '↑'){
                    $arrow.text('↓')
                    sortBy[field] = -1
                }else{
                    $arrow.text('↑')
                }
            } else {
                $sort.find('.sort-arrow').remove()
            }
        }
        this.reload({sortBy})
    }
}

module.exports = ListPage

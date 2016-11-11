const BasePage = require(appPath+'/ui/base/base-page.js')
class ListPage extends BasePage{
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
    prepareEvents(){
        super.prepareEvents()
        // on search
        this.$searchIpt.keyup(e => {
            if (e && e.which == 13){
                this.$searchBtn.click()
            }
        })
        // on check
        this.$page.on('change', 'thead>tr>th>input[type=checkbox]', e => this.onCheckAll(e))
        this.$page.on('change', 'tbody>tr>th>input[type=checkbox]', e => this.onCheckOne(e))
        // sortables
        this.$sortables.click(e => this.onSort(e))
    }
    init(){ // do init on document ready
        super.init()
        // this.doResize()
    }
    get defaultParam(){
        return {orderBy:{name:1}, paging:{pageSize:20}}
    }
    onLoaded({data, param}){
        super.onLoaded({data, param})
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
        let options = {
            startPage: paging.pageNo||1,
            totalPages: paging.totalPages||1,
            onPageClick: (e, pageNo)=>{
                console.log(pageNo, e)
                let pagination = this.$paging.data('twbs-pagination')
                if (pagination && pagination.options.currentPage !== pageNo) {
                    this.onPaging(pageNo)
                }
            }
        }
        this.$paging.twbsPagination(options)
    }
    onPaging(pageNo){
        this.reload({paging:{pageNo}})
    }
    onSearch(e, btn){
        let text = this.$searchIpt.val()
        this.doSearch(text)
    }
    doSearch(text){
        tfn.tips(text)
    }
    onCheckOne(e){
        var $check = $(e.target), checked = $check.prop('checked');
        var $checkAll = $check.closest('table').children('thead').find('input[type=checkbox]');
        var $allChecks = $check.closest('tbody').find('input[type=checkbox]');
        if ((checked && !$allChecks.filter(':not(:checked)').length)
        || !(checked || $allChecks.filter(':checked').length)){
            $checkAll.prop('checked', checked);
        }
    }
    onCheckAll(e){
        var $checkAll = $(e.target), checked = $checkAll.prop('checked');
        var $allChecks = $checkAll.closest('table').children('tbody').find('input[type=checkbox]');
        $allChecks.prop('checked', checked);
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

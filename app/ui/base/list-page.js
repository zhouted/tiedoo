const BasePage = require(appPath+'/ui/base/base-page.js')
class ListPage extends BasePage{
    get $searchBtn(){
        return this._$searchBtn || (this._$searchBtn = $(this.$page.find(this.btns.onSearch)))
    }
    get $searchIpt(){
        return this._$searchIpt || (this._$searchIpt = $(this.$page.find('input[type=search]')))
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
    }
    init(){ // do init on document ready
        super.init()
        // this.doResize()
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
}

module.exports = ListPage

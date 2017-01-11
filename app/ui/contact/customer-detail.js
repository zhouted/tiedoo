const BasePage = require(appPath+'/ui/base/base-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailPage extends BasePage {
    get $title(){
        return this._$title || (this._$title = this.$page.find('.panel-title'))
    }
    get paneInfo(){
        return this._paneInfo || (this._paneInfo = this.$subPane('Info').data('page'))
    }
    get paneContact(){
        return this._paneContact || (this._paneContact = this.$subPane('Contact').data('page'))
    }
    get $btnAddContact(){
        return this._$btnAddContact || (this._$btnAddContact = this.$page.find('.btn.add-contact'))
    }
    get $scroll(){// 页面内的滚动区域
        // return this._$scroll || (this._$scroll = this.$page.find('.auto-scroll'))
        return (this._$scroll = this.$page.find('.auto-scroll'))
    }
    get group(){
        return this._group || this._pid[0]//return c-customer or s-supplier
    }
    set group(group){
        this._group = group
    }
    get groupName(){
        return (this.group==='s')? '供应商' : '客户'
    }
    prepare(){
        super.prepare()
        this._forceLoad = true
        this.$page.find('.customer-group-name').text(this.groupName)
        if (this.group==='s'){
            this.$page.find('.customer-quotation-tab').addClass('hidden')
            this.$page.find('.customer-suproduct-tab').removeClass('hidden')
        }else{
            this.$page.find('.customer-quotation-tab').removeClass('hidden')
            this.$page.find('.customer-suproduct-tab').addClass('hidden')
        }
    }
    initEvents(){
        super.initEvents()
        this.$btnAddContact.click(() => {
            this.paneContact.addNew()
        })
        this.$subtabs.on('shown.bs.tab', (e)=>{
            this.$btnAddContact.addClass('hide')
            //显示联系人pane时才显示add-contact按钮
            if (e.target === this.paneContact.$navtab[0]){
                this.$btnAddContact.removeClass('hide')
            }
        })
    }
    onHide(){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return false
            this._modified = false
            this.render(this._data)
        }
        return true
    }
    onBack(){
        let detailPanelKey = (this.group==='s')? 'supplier':'customer'
        router.loadMainPanel(detailPanelKey)
    }
    doLoad(param){
        return srvCust.loadById(param._id)
    }
    render(data){
        this.renderTitle(data)
        this.paneInfo && this.paneInfo.render(data)
        this.paneContact && this.paneContact.render(data)
        if (!data || !data._id){
            this.toEdit()
        }else{
            this.group = data.group
            this.toRead()
        }
    }
    renderTitle(customer){
        customer = customer || {}
        this.$title.find('.bind-customer-name').text(customer.name||'公司名称')
        this.$title.find('.bind-customer-createdAt').text(tfn.fdate(customer.createdAt||new Date()))
        // this.$title.find('.bind-customer-creator').text(customer.creator||'创建者')
        this.$title.find('.bind-customer-contact-name').text(customer.contacts && customer.contacts[0].name||'首要联系人')
    }
    getPageData(){
        let info = this.paneInfo.getFormData()
        let contacts = this.paneContact.getFormData()
        let data = tfn.clone(info, {contacts}, {group: this.group})
        return data
    }
    doSave(data){
        return srvCust.save(data).then(rst => {
            setTimeout(()=>router.$main.trigger('changed.customer', [data]))
            return rst
        })
    }
}

module.exports = CustomerDetailPage

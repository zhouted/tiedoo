const BasePage = require(appPath+'/ui/base/base-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailPage extends BasePage {
    get $title(){
        return this._$title || (this._$title = this.$page.find('.panel-title'))
    }
    get $btnAddContact(){
        return this._$btnAddContact || (this._$btnAddContact = this.$page.find('.btn.add-contact'))
    }
    get $paneInfo(){
        return this._$paneInfo || (this._$paneInfo = this.$page.find('#customerDetailInfo'))
    }
    get paneInfo(){
        return this.$paneInfo.data('page')
    }
    get $paneContact(){
        return this._$paneContact || (this._$paneContact = this.$page.find('#customerDetailContact'))
    }
    get paneContact(){
        return this.$paneContact.data('page')
    }
    prepareEvents(){
        super.prepareEvents()
        this.$btnAddContact.click(e => {
            this.paneContact.addNew()
        })
        this.$subtabs.on('shown.bs.tab', (e)=>{
            //显示联系人pane时才显示add-contact按钮
            if (e.target === this.paneContact.$navtab[0]){
                this.$btnAddContact.removeClass('hide')
                return
            }
            this.$btnAddContact.addClass('hide')
        })
    }
    onBack(e, btn){
        router.loadMainPanel('customerPanel')
    }
    doLoad(param){
        return srvCust.loadById(param._id)//.then(data => this.render(data))
    }
    render(data){
        this.renderTitle(data)
        this.paneInfo.render(data)
        this.paneContact.render(data)
    }
    renderTitle(customer){
        customer = customer || {}
        this.$title.find('.bind-customer-name').text(customer.name||'客户名称')
        this.$title.find('.bind-customer-createdAt').text(tfn.fdate(customer.createdAt||new Date()))
        // this.$title.find('.bind-customer-creator').text(customer.creator||'创建者')
        this.$title.find('.bind-customer-contact-name').text(customer.contacts && customer.contacts[0].name||'首要联系人')
    }
    getPageData(){
        let info = this.paneInfo.getFormData()
        let contacts = this.paneContact.getFormData()
        let data = tfn.merge({}, info, {contacts})
        return data
    }
    doSave(data){
        return srvCust.save(data).then(rst => {
            router.$main.trigger('changed.customer', [data])
        })
    }
}

module.exports = CustomerDetailPage

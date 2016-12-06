const BasePage = require(appPath+'/ui/base/base-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailPage extends BasePage {
    prepare(){
        super.prepare()
        this._forceLoad = true
    }
    get $title(){
        return this._$title || (this._$title = this.$page.find('.panel-title'))
    }
    get paneInfo(){
        return this._paneInfo || (this._paneInfo = this.$page.find('#customerDetailInfo').data('page'))
    }
    get paneContact(){
        return this._paneContact || (this._paneContact = this.$page.find('#customerDetailContact').data('page'))
    }
    get $btnAddContact(){
        return this._$btnAddContact || (this._$btnAddContact = this.$page.find('.btn.add-contact'))
    }
    get $scroll(){// 页面内的滚动区域
        // return this._$scroll || (this._$scroll = this.$page.find('.auto-scroll'))
         return (this._$scroll = this.$page.find('.auto-scroll'))
    }
    initEvents(){
        super.initEvents()
        this.$btnAddContact.click(e => {
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
    onBack(e, btn){
        router.loadMainPanel('customer')
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
            this.toRead()
        }
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
            setTimeout(()=>router.$main.trigger('changed.customer', [data]))
            return rst
        })
    }
}

module.exports = CustomerDetailPage

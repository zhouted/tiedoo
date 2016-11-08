const BasePane = require(appPath+'/ui/base/base-pane.js')
class BasePage extends BasePane{
    get $topbar(){// 页面上的工具栏
        return  this._$topbar || (this._$topbar = $(this.$page.find('.panel-heading, .nav.nav-tabs')))
    }
    get $subtabs(){// 页面内的子nav-tabs
        return this._$subtabs || (this._$subtabs = $(this.$page.find('.nav-tabs>li>a[role=tab]')))
    }
    get $subcont(){// 页面内的子tab-content
        return this._$subcont || (this._$subcont = this.$page.find('.tab-content'))
    }
    get $scroll(){// 页面内的滚动区域
        return this._$scroll || (this._$scroll = this.$page.find('.auto-scroll'))
    }
    get $searchBtn(){
        return this._$searchBtn || (this._$searchBtn = $(this.$page.find(this.btns.onSearch)))
    }
    get $searchIpt(){
        return this._$searchIpt || (this._$searchIpt = $(this.$page.find('input[type=search]')))
    }
    prepareEvents(){
        super.prepareEvents()
        // on resize
        let resizing = false
        this.$tabpanel.on('resize.td.page', (e) => {
            if (resizing) return
            if (!this.$tabpanel.is(':visible')) return
            resizing = true; console.log(e)
            setTimeout(() => {
                this.doResize()
                resizing = false
            })
        })
        // on scroll
        if (this.$scroll.length){
            let $fixed = this.$scroll.find('.rel-fixed')
            if (!$fixed.length) return
            this.$scroll.scroll(function(e){
                $fixed.css('top', this.scrollTop);
            });
        }
        // on search
        this.$searchIpt.keyup(e => {
            if (e && e.which == 13){
                this.$searchBtn.click()
            }
        })
    }
    init(){ // do init on document ready
        super.init()
        this.doResize()
    }
    doResize(){
        let height = this.$tabpanel.height() - 15
        height -= this.getFixedHeight()
        this.$scroll.css('max-height', height)
        this.$subcont.css('height', height)
    }
    getFixedHeight(){
        if (!this.$topbar.length) return 0
        let height = this.$topbar.outerHeight(true)
        return height
    }
    onShow(data){
        super.onShow(data)
        if (this.$subtabs.length){
            this.doSubtabs(data)
        }
    }
    onShown(data){
        super.onShown(data)
        this.doResize()
    }
    doSubtabs(data){
        let tab = this.$subtabs.filter('[aria-expanded=true]')
        if (!tab.length){
            tab = this.$subtabs.first()
        }
        let panel = $(tab.attr('href')).removeClass('active')
        tab.parent().removeClass('active')
        this.$subtabs.data('_spv', data)
        tab.tab('show')
    }
    onSearch(e, btn){
        let text = this.$searchIpt.val()
        this.doSearch(text)
    }
    doSearch(text){
        tfn.tips(text)
    }
}

module.exports = BasePage

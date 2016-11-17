const BasePane = require(appPath+'/ui/base/base-pane.js')
class BasePage extends BasePane{
    get $topbar(){// 页面上的工具栏
        return  this._$topbar || (this._$topbar = $(this.$page.find('.topbar')))
    }
    get autosubs(){// 自动传播到下级的事件
        return {onShow:true}
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
        let height = 0
        for (let bar of this.$topbar){
            height += $(bar).outerHeight(true)
        }
        return height
    }
    onShow(data){
        super.onShow(data)
        if (this.$subtabs.length && this.autosubs.onShow){
            this.doSubtabs(data)
        }
    }
    onShown(){
        super.onShown()
        this.doResize()
        this.$scroll.scrollTop(0)
    }
    onLoaded(param){
        super.onLoaded(param)
        if (this.autosubs.onLoaded){
            this.doSubtabs(this._data)
        }
    }
    doSubtabs(data){
        let tab = this.$subtabs.parent('li.active').children('a[role=tab]')
        if (!tab.length){
            tab = this.$subtabs.first()
        }
        let panel = $(tab.attr('href')).removeClass('active')
        tab.parent().removeClass('active')
        this.$subtabs.data('_spv', data)
        tab.tab('show')
    }
}

module.exports = BasePage

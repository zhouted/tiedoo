const BasePane = require(appPath+'/ui/base/base-pane.js')
class BasePage extends BasePane{
    parentEvents(){
        super.parentEvents()
        // on parent's panel resize
        let resizing = false
        this.$tabpanel.on('resize.td.page', () => {
            if (resizing) return
            if (!this.$tabpanel.is(':visible')) return
            resizing = true;
            setTimeout(() => {
                this.doResize()
                resizing = false
            })
        })
        // !resizing && this.doResize()
    }
    get $topbar(){// 页面上的工具栏
        return  this._$topbar || (this._$topbar = $(this.$page.find('.topbar')))
    }
    get autosubs(){// 自动传播到下级的事件
        return {onShow:true}
    }
    $subPane(id){
        let pid = this.pid
        if (id.search(pid) < 0) {
            id = pid + id
        }
        return this.$page.find('#'+id)
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
    initEvents(){
        super.initEvents()
        // on scroll
        if (this.$scroll.length){
            let $fixed = this.$scroll.find('.fixed-y')
            if (!$fixed.length) return
            this.$scroll.scroll(function(){
                let $scroll = $(this)
                $scroll.find('.fixed-y').css('top', this.scrollTop)
                $scroll.find('.fixed-x').css('left', this.scrollLeft)
                // $scroll.find('.fixed-right').css('right', this.scrollWidth-$scroll.width()-this.scrollLeft)
            });
        }
    }
    doResize(){
        let height = this.$tabpanel.height() - 15
        height -= this.getFixedHeight()
        this.$subcont.css('height', height)
        this.$scroll.css('height', height)
        this.$scroll.css('max-height', height)
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
        if (this._modified){
            this.reload(data)
        }
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
        let $tab = this.$subtabs.parent('li.active').children('a[role=tab]')
        if ($tab.length){//去活当前tab
            $($tab.attr('href')).removeClass('active')
            $tab.parent().removeClass('active')
        }
        //把数据传给子tabs，并默认显示第一个
        this.$subtabs.data('_spv', data)
        this.$subtabs.first().tab('show')
    }
}

module.exports = BasePage

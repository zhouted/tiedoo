/******************************************************************************
 * jquery.spv.js
 *
 * JQuery plugin for Single Page app's Views
 *
 * @version     0.2.0
 * @author      Tiedoo
 * @url         www.tiedoo.com
 * @inspiration Single Page app's Views plugin for Tiedoo,  based on jquery & bootstrap.
 * @usage:
 * $(".tab-content").spv("open", 'panelId');//打开（加载并显示）视图（tabpanel）
 *****************************************************************************/
$.fn.spv = function(act, opts) {
    let $content = this.first() // 只支持一个

    switch (act) {
        case 'tabs':
            initTabs($content, opts)
            break
        case 'open':
        default:
            openPanel($content, opts)
    }

    return this
}

function initTabs($tabs, tabs){
    if (!$tabs.is('.nav-tabs')){
        $tabs = $tabs.children('.nav-tabs').first() // 仅直接下级
    }
    if (!$tabs.length){
        return console.warn('A nav-tabs is required to init spv tabs!')
    }
    // tabs && tabs.length
    for (let tab of tabs){
        $tabs.append(`<li role="presentation"><a href="#${tab.key}Panel" src="${tab.src}" role="tab" data-toggle="tab">${tab.name}</a></li>`)
    }
}

function openPanel($content, opts){
    if (!$content.is('.tab-content')){
        $content = $content.children('.tab-content').first() // 仅直接下级
    }
    if (!$content.length){
        return console.warn('A tab-content is required to open spv!')
    }
    if (!opts || !opts.key){
        return console.warn('The panel.key is required to open spv!')
    }
    let id = opts.key + 'Panel'
    let $panel = $content.children('#'+id)
    let $tab =  $('a[href="#'+id+'"]');
    $tab.data('_spv', opts.data)
    if (!$panel.length){
        let src = $tab.attr('src')
        $panel = $('<div role="tabpanel" class="tab-pane panel panel-default"></div>').attr('id', id)
        $panel.loadFile(src).then(() => {
            $content.append($panel)
            $tab.tab('show')
        })
    }else{
        $tab.tab('show')
    }
}

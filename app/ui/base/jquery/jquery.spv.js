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
 * $("#tabPanel").spv("open", 'panelId');//显示视图
 *****************************************************************************/
$.fn.spv = function(act, id, data) {
    let $content = this.first() // 只支持一个
    if (!$content.is('.tab-content')){
        $content = $content.children('.tab-content').first() // 仅直接下级
    }
    if (!$content.length) return this // 不是tab-content

    // opts = opts || {}
    // if (typeof(opts) == 'string') {
    //     opts = {id: opts}
    // }
    // if (!id) return this // 没指定id

    switch (act) {
        case 'open':
        default:
            id && openPanel($content, id, data)
    }

    return this
}

function openPanel($content, panelId, data){
    let $panel = $content.children('#'+panelId)
    let $tab =  $('a[href="#'+panelId+'"]');
    $tab.data('_spv', data)
    if (!$panel.length){
        let src = $tab.attr('src')
        $panel = $('<div role="tabpanel" class="tab-pane panel panel-default"></div>').attr('id', panelId)
        $panel.loadFile(src).then(() => {
            $content.append($panel)
            $tab.tab('show')
        })
        // $tab.on('show.bs.tab', (e) => {
        //     $panel.trigger('show.bs.panel', [data])
        // })
    }else{
        $tab.tab('show')
    }
}

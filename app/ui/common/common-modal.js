exports.init = function({pid}) {
    let $modal = $('#' + pid)

    //修改titleId
    let titleId = pid+'Label'
    $modal.attr('aria-labelledby', titleId)
    let $title = $modal.find('.modal-title').attr('id', titleId)
    $modal.on('show.bs.modal', () => {
        let opts = $modal.data()
        //修改title
        opts.title && $title.html(opts.title)
        //設置按鈕事件
        for (let btn in {confirm:1, preview:1, custom:1, cancel:1}){
            let $btn = $modal.find('button.'+btn).off('click').hide();
            if (opts[btn+'Label'] || opts[btn+'Click'] || btn == 'cancel'){
                $btn.show();
                opts[btn+'Click'] && $btn.click(opts[btn+'Click']);
                opts[btn+'Label'] && $btn.text(opts[btn+'Label']);
            }
        }
    })
}

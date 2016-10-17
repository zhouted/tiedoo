const mUser = require(appPath+'/mdl/user.js')

function init(modalId){
    let $modal = $(modalId), $form = $modal.find('form')
    $modal.on('shown.bs.modal', () => {
        adjustMiddle()
        doLoad()
    }).on('hide.bs.modal', () =>{
        !router.isLoadMain() && router.loadMain()
    })

    let $confirm = $modal.find('.btn.confirm').click(onSave)

    function doLoad(){
        mUser.getCurUser().then(user => {
            $form.input('values', user)
        }).catch(err => {
            console.log(err)
        })
    }

    function onSave(){
        $confirm.button('loading');
        let data = $form.input('values');
        let p = mUser.save(data);
        p.then(user => {
            $modal.modal('hide')
            $('body').trigger('changed.profile', [data])
        }).finally(a => {
            $confirm.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }


    function adjustMiddle(){ // 上下居中
        let $dialog = $modal.find('.modal-dialog')
        let top = (window.innerHeight - $dialog.find('.modal-content').height())/2
        if (top > 0){
            $dialog.css('margin-top', top)
        }
    }
}

module.exports = {init}

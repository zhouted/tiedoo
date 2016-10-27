const srvComp = require(appPath+'/service/company.js')

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')
    $form.input('init')

    //加载数据
    doLoad()
    function doLoad(){
        srvComp.load().then(comp => {
            $form.input('values', comp)
            loadImg()
        }).catch(err => {
            console.log(err)
        })
    }

    // 编辑、保存数据
    let $edit = $form.find('.btn.edit').click(function(){
        $form.input('edit')
    })
    let $back = $form.find('.btn.back').click(function(){
        $form.input('read')
    })
    let $save = $form.find('.btn.save').click(onSave)
    function onSave(){
        // if (!checkValid()){
        //     return;
        // }
        doSave()
    }
    function doSave(){
        $save.button('loading');
        let data = $form.input('values');
        let p = srvComp.save(data);
        p.then(user => {
            $form.input('read', true)
            //$('body').trigger('changed.profile', [data])
        }).finally(a => {
            $save.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }

    let $img = $form.find('img.image-preview')
    let $imgIpt = $form.find('input[name=imgId]')
    $imgIpt.inputImg().change(function(){
        let file = this.files[0]
        if (!file || !file.path) return
        $img.attr('src', file.path);
        srvComp.saveImg(file).then(file => {
            console.log(file)
            $imgIpt.data('fileId', file._id)
            $imgIpt.val('') //reset file input
            $form.input('edit')
        })
    })

    function loadImg(){
        srvComp.loadImg($imgIpt.data('fileId')).then(file => {
            file && $img.attr('src', file.path)
        })
    }

}

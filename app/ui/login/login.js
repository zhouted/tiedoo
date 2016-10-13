const {login} = require(appPath+'/mdl/user.js')

function init(modalId){
   console.log('login loaded!'+modalId);
   let $modal = $(modalId);
   let $form = $modal.find('form');
   let $confirm = $modal.find('.btn.confirm')
   $confirm.click(onLogin);

   function onLogin(){
       let $btn = $(this);
       $btn.button('loading');
       let data = toPO($form);
       let promise = login(data);
       promise.then((rst)=>{
           console.log(rst);
           if (rst.ok){
               router.loadMain()
               $modal.modal('hide');
           }else{
               alert(rst.ok);
           }
       }).finally((a)=>{
           console.log(a);
           $btn.button('reset');
       }).catch((err)=>{
           console.log(err);
       });
   }

   $modal.on('show.bs.modal', onShow)
   function onShow(){
       $form.find('input[name=email]').val('ted@concordtools.cn')
   }
}

function toPO($form){//TODO: move to jquery.forms plugin
    let po = {}
    let values = $form.serializeArray();
    for (value of values) {
        po[value.name] = value.value;
    }
    return po;
}

module.exports = {init}

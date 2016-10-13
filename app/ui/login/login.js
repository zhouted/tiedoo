const mUser = require(appPath+'/mdl/user.js')

function init(loginId){
   console.log('login loaded!'+loginId);
   let $login = $(loginId);
   let $form = $login.find('form');
   $form.find('input[name=email]').val('ted@concordtools.cn')
   let $confirm = $login.find('.btn.confirm')
   $confirm.click(doLogin);

   function doLogin(){
       $confirm.button('loading');
       let data = toPO($form);
       let p = mUser.login(data);
       p.then((rst)=>{
           console.log(rst);
           if (rst.ok){
               router.loadMain()
               $login.remove();
           }else{
               alert(rst.ok);
           }
       }).finally(()=>{
           $confirm.button('reset');
       }).catch((err)=>{
           console.log(err);
       });
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

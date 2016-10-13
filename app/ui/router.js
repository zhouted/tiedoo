function loadMain(){
    return $('#main').loadFile('ui/main/main.html').catch((err)=>{
        alert(JSON.stringify(err))
    })
}

function showLogin(){
    let id = 'login'
    $('body').addFile('ui/login/login.html', {id}).then((data)=>{
        $('#'+id).modal('show')
    }).catch((err)=>{
        alert(JSON.stringify(err))
    })
}

module.exports = {loadMain, showLogin}

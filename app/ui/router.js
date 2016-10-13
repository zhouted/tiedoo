function loadMain(){
    return $('body').loadFile('ui/main/main.html').catch((err)=>{
        alert(JSON.stringify(err))
    })
}

function showLogin(){
    let id = 'logon'
    $('body').loadFile('ui/login/login.html', {id}).catch((err)=>{
        alert(JSON.stringify(err))
    })
}

module.exports = {loadMain, showLogin}

function loadMain() {
    return $('body').loadFile('ui/main/main.html').catch(err => {
        console.error(err)
    })
}

function showLogin() {
    $('body').loadFile('ui/login/login.html').catch(err => {
        console.error(err)
    })
}

function showProfile() {
    let id = 'profile'
    $('body').addFile('ui/profile/profile.html', {
        id
    }).then(() => {
        $('#id').modal('show')
    }).catch(err => {
        console.error(err)
    })
}

module.exports = {
    loadMain,
    showLogin,
    showProfile
}

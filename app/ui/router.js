const srvUser = require(appPath+'/service/user.js')

var router = {
    get $body(){
        return $('body')
    },
    get $main(){
        return $('#main')
    },
    panels:[
        {key: 'category', name: '品类管理', src: 'ui/category/category.html'},
        {key: 'product', name: '产品管理', src: 'ui/product/product.html'},
        {key: 'productDetail', name: '产品详情', src: 'ui/product/product-detail.html'},
        {key: 'quota', name: '业务报价', src: 'ui/quota/quota.html'},
        {key: 'customer', name: '客户管理', src: 'ui/contact/customer.html'},
        {key: 'customerDetail', name: '客户详情', src: 'ui/contact/customer-detail.html'},
        {key: 'supplier', name: '供应商', src: 'ui/contact/supplier.html'},
        {key: 'setting', name: '设置', src: 'ui/setting/setting.html'},
    ],
}

router.gohome = function(){
    srvUser.loadToken().then(token => {
        if (token && token.active){
            srvUser.autoLogin(token)
            router.loadMain()
        }else{
            router.showLogin()
        }
    }).catch(err => {
        console.error(err)
    })
}

router.showLogin = function() {
    router.$body.loadFile('ui/login/login.html').catch(err => {
        console.error(err)
    })
}

router.logout = function(){
    srvUser.logout().then(() => {
        router.showLogin()
    }).catch(err => {
        console.error(err)
    })
}

router.loadMain = function () {
    router.$body.loadFile('ui/main/main.html').then(()=>{
        router.$main.spv('tabs', router.panels)
        let {key, data} = tfn.store('mainPanel')||{key:'setting'}
        router.loadMainPanel(key, data)
    }).catch(err => {
        console.error(err)
    })
}

router.loadMainPanel = function(key, data) {
    let opts = {key, data}
    router.$main.spv('open', opts)
    tfn.store('mainPanel', opts)
}

// 图片剪裁弹窗(传入file input)
router.showCropper = function(ipt){
    let opts = {id: 'cropModal', append: true}
    return router.$body.loadFile('ui/common/crop-modal.html', opts).then(() => {
        let $modal = $('#'+opts.id)
        $modal.find('#image').attr('src', ipt.files[0].path).data('srcIpt', ipt)
        $modal.modal('show')
    }).catch(err => {
        console.error(err)
    })
}

module.exports = router

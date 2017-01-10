const srvUser = require(appPath+'/service/user.js')

const router = {
    get $body(){
        return $('body')
    },
    get $main(){
        return $('#main')
    },
    panels:[
        {key: 'category', name: '品类管理', src: 'ui/category/category.html'},
        {key: 'product', name: '产品管理', src: 'ui/product/product.html'},
        {key: 'productEdit', name: '产品编辑', src: 'ui/product/product-edit.html'},
        {key: 'productDetail', name: '产品详情', src: 'ui/product/product-detail.html'},
        {key: 'quota', name: '业务报价', src: 'ui/quota/quota.html'},
        {key: 'customer', name: '客户管理', src: 'ui/contact/customer.html'},
        {key: 'customerDetail', name: '客户详情', src: 'ui/contact/customer-detail.html'},
        {key: 'supplier', name: '供应商', src: 'ui/contact/customer.html'},
        {key: 'supplierDetail', name: '供应商详情', src: 'ui/contact/customer-detail.html'},
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

router.loadModal = function(opts){
    let modalId = opts.id + 'Modal'
    return router.$body.loadFile('ui/common/common-modal.html', {id: modalId, append: true}).then(() => {
        let $modal = $('#'+modalId).data(opts)
        let $content = $modal.find('.modal-body')
        if (opts.reload || !$content.children().length){
            if (!opts.content && opts.src){
                $content.loadFile(opts.src, {id: opts.id}).then((rsp) => {
                    $modal.trigger('load.bs.modal', rsp)
                    opts.onLoad && opts.onLoad.call($modal[0], rsp)
                    $modal.modal('show')
                })
            }else{
                $content.html(opts.content)
                setTimeout(function(){
                    $modal.trigger('load.bs.modal', opts.content)
                    opts.onLoad && opts.onLoad.call($modal[0], opts.content)
                    $modal.modal('show')
                })
            }
        }else{
            $modal.modal('show')
        }
    }).catch(err => {
        console.error(err)
    })
}


module.exports = router

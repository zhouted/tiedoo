class BasePage {
    constructor({pid}){
        this._pid = '#'+pid
    }
    get pid(){
        return this._pid
    }
    get $page(){
        return this._$page || (this._$page = $(this._pid))
    }
    init(){
        this.load()
        this.initBtns()
    }
    get btns(){
        return {
            onBack: '.btn.back',
            onAddNew: '.btn.add-new',
            onDelete: '.btn.delete',
            onSearch: '.btn.search',
        }
    }
    initBtns(){
        let self = this
        for (let btn in this.btns){
            let cls = this.btns[btn]
            if (typeof(self[btn]) === 'function'){
                self.$page.off('click', cls).on('click', cls, function(e){
                    self[btn](e, this)
                })
            }
        }
    }
    load(){
        let p = this.doLoad()
        if (!(p instanceof Promise)) {
            this.onLoaded()
            return
        }
        p.catch(err => {
            console.log(err)
        }).finally(() => {
            this.onLoaded()
        })
    }
    doLoad(){
        // this.setFormData(data)
    }
    onLoaded(){

    }
}

module.exports = BasePage

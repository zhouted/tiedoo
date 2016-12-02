const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvSetting = require(appPath+'/service/setting.js')

const MAX_UNITS = 120 //最大标数量
class UnitForm extends BaseForm{
    get $tpl(){
        return this._$tpl || (this._$tpl = this.$form.find('#tpl'))
    }
    prepareEvents(){
        super.prepareEvents()
        this._autoRead = false
        this.$form.on('change', 'input[name=name]:last', e => this.tryAddMore(e.target))
        this.$form.on('change', 'input[name=nameEn]:last', e => this.tryAddMore(e.target))
    }
    // init(){
    //     super.init()
    // }
    doLoad(){
        return srvSetting.loadUnits()
    }
    render(units){
        this.$tpl.prevAll().remove()
        this.$tpl.renderTpl(units)
        this.tryAddMore()
        // this.$form.input('read', true)
    }
    tryAddMore(ipt){
        let $units = this.$form.find('input[name=name]')
        if ($units.length >= MAX_UNITS){//不要太多
            ipt && tfn.tips('预置单位太多啦！')
            return
        }
        this.$tpl.renderTpl({name:'', nameEn:''})
        if (ipt && ipt.name == 'nameEn'){
            this.$form.find('input[name=name]').last().focus()
        }
    }
    getFormData(){
        let units = super.getFormDataArray('.input-group.unit')
        units = units.filter(unit => unit.name)
        return units
    }
    doSave(units){
        return srvSetting.saveUnits(units).then(rst => {
            tfn.tips('保存成功！')
            router.$main.trigger('changed.setting.units', [units])
            return units
        })
    }
}

module.exports = UnitForm

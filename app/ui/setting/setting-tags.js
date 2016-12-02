const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvSetting = require(appPath+'/service/setting.js')

const TAGS = srvSetting.TAGS
const MAX_TAGS = 9 //最大标签数
class TagsForm extends BaseForm{
    get $tpl(){
        return this._$tpl || (this._$tpl = this.$form.find('#tpl'))
    }
    prepareEvents(){
        super.prepareEvents()
        this._autoRead = false
        this.$form.on('change', 'input[name=tags]:last', e => this.tryAddMore(e.target))
    }
    // init(){
    //     super.init()
    // }
    doLoad(){
        return srvSetting.loadTags()
    }
    render(tags){
        this.$tpl.prevAll().remove()
        this.$tpl.renderTpl(tags)
        this.tryAddMore()
        // this.$form.input('read', true)
    }
    tryAddMore(ipt){
        let $tags = this.$form.find('input[name=tags]')
        if ($tags.length >= MAX_TAGS){//不要太多
            tfn.tips('预置标签太多啦！')
            return
        }
        this.$tpl.renderTpl('')
        this.$form.find('input[name=tags]').last().focus()
    }
    getFormData(){
        let $tags = this.$form.find('input[name=tags]')
        let tags = []
        for (let tag of $tags){
            let val = $.trim(tag.value)
            val && tags.push(val)
        }
        return tags
    }
    doSave(tags){
        return srvSetting.saveTags(tags).then(rst => {
            tfn.tips('保存成功！')
            router.$main.trigger('changed.setting.tags', [tags])
            return tags
        })
    }
}

module.exports = TagsForm

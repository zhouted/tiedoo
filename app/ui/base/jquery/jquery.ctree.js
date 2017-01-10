/******************************************************************************
 * jquery.ctree.js
 *
 * JQuery plugin for Categories Tree view/index
 *
 * @version     0.2.0
 * @author      Tiedoo
 * @url         www.tiedoo.com
 * @inspiration Categories Tree view/index plugin for Tiedoo,  based on jquery & bootstrap.
 * @usage:
 * $("#id").cTree('init').on('ctree:load', loadTree).on('ctree:click', onClick)
 *****************************************************************************/

(function ($) {
    //***************** 选项(参数)数据 ******************//
    $.cTree = $.cTree || {}
    //常量
    var _consts = $.cTree.consts = {
            keys: {root: 'ctree', node: 'category'},//key for $.data
            events: {
                load: 'ctree:load', check: 'ctree:check', click: 'ctree:click',
            },
            classes: {
                root: 'ctree-root', node: 'ctree-node', branch:'ctree-branch',
                text: 'ctree-text', icon: 'ctree-icon', check: 'ctree-check',
                toggle: 'ctree-toggle',
            },
        },    //consts short label:
        _rootKey   = _consts.keys.root,
        _nodeKey   = _consts.keys.node,
        _loadEvt   = _consts.events.load,
        _checkEvt  = _consts.events.check,
        _clickEvt  = _consts.events.click,
        _rootCls   = _consts.classes.root,   _rootDls   = '.' + _rootCls,
        _nodeCls   = _consts.classes.node,   _nodeDls   = '.' + _nodeCls,
        _branchCls = _consts.classes.branch, _branchDls = '.' + _branchCls,
        _textCls   = _consts.classes.text,   _textDls   = '.' + _textCls,
        _iconCls   = _consts.classes.icon,   _iconDls   = '.' + _iconCls,
        _checkCls  = _consts.classes.check,  _checkDls  = '.' + _checkCls,  _checkIptDls = _checkDls+'>input',
        _toggleCls = _consts.classes.toggle, _toggleDls = '.' + _toggleCls
    //default options
    var _option = $.cTree.defaults = {
        id: null,
        root: {
            id: '', toggleState: 'expand', children: null
        },
        keys: {
            id: 'id', text: 'text', title: 'title'
        },
        templates:{
            branch: '<ul class="nav"></ul>',//分支模板
            node:'<li>'//节点模板
                +' <a href="javascript:;">'
                +'  <span class="ctree-check"><input type="checkbox"></span>'
                +'  <span class="ctree-toggle"/>'
                +'  <span class="ctree-icon"/>'
                +'  <span class="ctree-text"/>'
                +'</a></li>',
        },
        classes: {//样式
            loading:    'glyphicon glyphicon-asterisk',
            collapse:   'glyphicon glyphicon-triangle-right',//plus',
            expand:     'glyphicon glyphicon-triangle-bottom',//minus',
            folderClose:'glyphicon glyphicon-folder-close',
            folderOpen: 'glyphicon glyphicon-folder-open',
            file:       'glyphicon glyphicon-file',
            focus:      'open',
        },
        bgcolors: null,//['#fff', '#f9f9f9', '#f4f4f4', '#e9e9e9', '#e2dfdf']
        showIcon: false,
        keepFocus: true,
        checkType: 'checkbox',//or 'radio'
        checkboxRelation:{'true':'c', 'false':'c'},//{'true':'pc', 'false':'pc'}
        hideCheck: true,
    }

    //***************** 对外接口方法  ******************//
    $.fn.cTree = cTreeFn
    function cTreeFn(action, option){
        //methods map of action
        var methods = {
            i: init,    //init
            d: destory, //delete|destory
            r: refresh, //refresh|reload
            e: expand,  //expand
            c: collapse,//collapse
            f: focusNode,//focus
            g: getData,  //getNode|tree
            l: locateNode,//locate
            s: selectNodes,//select
        }
        //prepare action && option
        if (typeof action == 'object'){
            option = $.extend(true, action, option)
            action = 'create'
        }else if (typeof action !== 'string'){
            action = 'create'
        }
        //get method
        var method = methods[action[0].toLowerCase()]
        if (!method){
            console.error('Invalid cTree action "'+action+'"')
            return this
        }
        //call method on this element
        return method.call(this, option)
    }
    function init(option){//初始化
        var $tree = this
        var tree = $.extend(true, {}, _option, option)
        bind(tree, $tree)
        return refresh.call($tree, option)
    }
    function bind(tree, $tree){//初始化-绑定
        var id = tree.id = tree.id||$tree.attr('id')
        if (!id){
            id = tree.id = newId()
            console.warn('Create a id "'+id+'"')
        }
        //options[id] = tree
        var tpls = tree.templates
        //for root && tree
        $tree.attr('id', id).data(_rootKey, tree).addClass(_rootCls)

        //for node
        var $tpl = tpls.$node = $(tpls.node).addClass(_nodeCls)
        var $head = $tree.find('.ctree-head').addClass(_nodeCls)
        $tree.on('click', _nodeDls+'>a', onClick)
        $tree.on('click', _toggleDls+','+_iconDls, onToggle)
        var $check = $tpl.find(_checkDls)
        tree.hideCheck && ($check.hide(), $head.find(_checkDls).hide())
        $tpl.find(_checkIptDls).prop('type', tree.checkType)
        $tree.on('change', _checkIptDls, onCheck)
        //$check.click(function(e){e.stopPropagation();})

        //for branch
        var $branch = tpls.$branch = $(tpls.branch)
        $branch.addClass(_branchCls)
        $tree.addClass($branch.attr('class'))
    }
    function destory(){//销毁
        var $tree = this
        // var id = $tree.attr('id')
        //delete options[id]
        $tree.removeData(_rootKey)
        $tree.children().remove()
        return this
    }
    function refresh(option){//刷新
        var $tree = this
        var tree = getTree($tree)
        if (!tree){
            console.error('cTree has not been initialized!')
            return this
        }
        tree.root = $.extend({}, _option.root)//清空跟节点
        option && $.extend(true, tree, option, {id: tree.id});//不能改id

        var $head = $tree.find('.ctree-head')
        var $trunk = !$head.length? $tree : $head.children(_branchDls)//有header时主干放到head下
        if (!$trunk.length){
            $trunk = getBranch(tree, $head, true)
        }
        $trunk.children().remove()
        var root = tree.root
        $head.attr('id', tree.id+'_'+encodeId(root.id)).data(_nodeKey, root)
        if (root.children){
            buildTree(tree, root.children, $trunk)
        }else{
            setTimeout(function(){
                $trunk.trigger(_loadEvt, [tree, root])
            })
        }
        return this
    }
    function buildTree(tree, nodes, $p){//构建子树
        var cls = tree.classes
        $p = getBranch(tree, $p, true)
        nodes.forEach(function(node){
            var $li = tree.templates.$node.clone(true, true)
            var text = node[tree.keys.text], nodeId = tree.id+'_'+encodeId(node.id)
            //tree.nodes[nodeId] = node
            $li.attr('id', nodeId).data(_nodeKey, node)
            $li.find(_textDls).text(text)
            $li.find('a').attr('title', node[tree.keys.title]||text)
            var $toggle = $li.find(_toggleDls).addClass(cls.collapse)
            var $check = $li.find(_checkIptDls)
            $check.prop('checked', node.checked)
            $check.prop('disabled', node.chkDisabled)
            $p.append($li)
            if (node.children){
                node.isParent = node.loaded = true
                buildTree(tree, node.children, $li);//构建子树
                doToggle(tree, $li, node.toggleState)
            }else if (!node.isParent){
                node.toggleState = 'hidden'
                $toggle.css('visibility', 'hidden');//doToggle(tree, $li, 'hidden')
            }else if (node.toggleState == 'expand'){
                node.toggleState = ''
                toggle(tree, node, 'expand')
            }
            if (tree.showIcon){
                var $icon = $li.find(_iconDls)
                if (node.isParent){
                    $icon.addClass(cls.folderClose)
                }else{
                    $icon.addClass(cls.file)
                }
            }
        })
    }
    function getBranch(tree, $p, append){//获取子分支（append?不存在则添加一个）
        if ($p.is(_branchDls) || $p.is(_rootDls)){
            return $p
        }
        if (!$p.is(_nodeDls)){
            $p = $p.closest(_nodeDls)
        }
        var $branch = $p.children(_branchDls)
        if (!$branch.length && append){//新增子分支：根据level设置背景色
            var level = 1 + ($p.closest(_branchDls).data('level')||0)
            $branch = tree.templates.$branch.clone(true,true).hide()
            $branch.data('level',level)
            var colors = tree.bgcolors
            if (colors && colors.length){
                if (colors && colors.length){
                    var bgColor = colors[level%colors.length]
                    if (bgColor){
                        $branch.css('background-color', bgColor)
                    }
                }
            }
            $p.append($branch);//添加子容器
        }
        return $branch
    }
    function expand(node){//展开树节点
        toggle(getTree(this), node, 'expand')
        return this
    }
    function collapse(node){//展开树节点
        toggle(getTree(this), node, 'collapse')
        return this
    }
    function toggle(tree, node, state){//展开(state=expand)|收起(state=collapse)树节点
        var $nodes = $locate(tree, node)
        if (!$nodes.is(_nodeDls)){
            $nodes = $nodes.children(_nodeDls)
        }
        $nodes.each(function(){
            var $node = $(this), node = getNode($node)
            if (node && node.isParent && node.toggleState !== state){
                node.toggleState = state
                if (state !== 'expand' || !trLoad(tree, $node, node)){
                    doToggle(tree, $node, node.toggleState)
                }
            }
        })
        return this
    }
    function doToggle(tree, $node, state){//toggle $node state to: expand|collapse|hidden
        if (!state || !$node){
            return
        }
        var cls = tree.classes
        var $a = $node.children('a')
        var $toggle = $a.find(_toggleDls)
        var $icon = $a.find(_iconDls)
        var $branch = $node.children(_branchDls)
        if (state == 'hidden'){
            $toggle.css('visibility', 'hidden')
            return
        }
        for (var k in cls){
            $toggle.removeClass(cls[k])
        }
        $toggle.addClass(cls[state])
        if (state == 'expand'){
            tree.showIcon && $icon.removeClass(cls.folderClose).addClass(cls.folderOpen)
            $branch.show('slow')
        }else{
            tree.showIcon && $icon.removeClass(cls.folderOpen).addClass(cls.folderClose)
            $branch.hide('slow')
        }
    }
    function trLoad(tree, $node, node){//try to trigger _loadEvt
        var loaded = node.loaded || !node.isParent
        if (!loaded){
            doToggle(tree, $node, 'loading')
            $node.trigger(_loadEvt, [tree, node])
            return true
        }
        return false
    }
    function focusNode(node){
        var $tree = this
        var tree = getTree($tree)
        if (!tree){
            console.warn('Not initialized!')
            return this
        }
        if (tree.keepFocus){
            $tree.find(_nodeDls).removeClass(tree.classes.focus)
            if (node){
                var $node = $locate(tree, node)
                $node.addClass(tree.classes.focus)
            }
        }
        return this
    }
    function getData($node){
        if ($node === 'focus'){
            $node = this.find(_nodeDls+'.open')
            if (!$node.length){
                return null
            }
        }
        if (!$node){
            return getTree(this)
        }
        return getNode($node)
    }
    function locateNode(data){
        var $tree = this
        var tree = getTree($tree)
        if (!tree){
            console.warn('Not initialized!')
            return null
        }
        var $node = $locate(tree, data)
        var node = getNode($node)
        if ($.isPlainObject(data)){
            $.extend(true, data, node)
        }
        focusNode.call(this, node)
        let $pNode = $node.parent().closest(_nodeDls)
        while($pNode.is(_nodeDls)){
            toggle(tree, getNode($pNode), 'expand')
            $pNode = $pNode.parent().closest(_nodeDls)
        }
        return $node
    }
    function selectNodes(checked){
        var $checkes = this.find(_checkIptDls)
        $checkes.each(function(){
            var $check = $(this), node = $check.closest(_nodeDls).data(_nodeKey)
            if (!$check.is(':visible') || $check.prop('disabled')) return
            $check.prop('checked', checked)
            node.checked = checked
        })
        return this
    }
    function selectParents(checked){
        var $parents = this.parents(_nodeDls)
        $parents.each(function(){
            var $node = $(this), node = $node.data(_nodeKey)
            var $check = $node.children('a').find(_checkIptDls)
            if (!$check.is(':visible') || $check.prop('disabled')) return
            $check.prop('checked', checked)
            node.checked = checked
        })
        return this
    }

    //***************** 加载节点数据  ******************//
    _option.load = loadNodes;//Be called after data loaded in _loadEvt handler
    function loadNodes(nodes, node){//根据nodes构建树
        var tree = this
        var $node = $locate(tree, node)
        if (!$node || !$node.length){
            return
        }
        node.loaded = false
        if (nodes && nodes.length){
            buildTree(tree, nodes, $node)
            node.children = nodes
        }else{//无数据
            node.children = null
            node.toggleState = 'hidden'
        }
        //toggle(tree, node, node.toggleState)
        doToggle(tree, $node, node.toggleState)
        node.loaded = true
    }


    //***************** 事件处理方法  ******************//
    function onToggle(e){//展开/收起树节点
        e.stopPropagation();// e.stopImmediatePropagation
        $(this).closest('a').blur()
        var $node = $(this).closest(_nodeDls)
        var tree = getTree($node)
        var node = getNode($node)
        if (node.toggleState == 'hidden'){
            return
        }
        if (node.toggleState !== 'expand'){
            node.toggleState = 'expand'
            if (trLoad(tree, $node, node)){
                return
            }
        }else{
            node.toggleState = 'collapse'
        }
        doToggle(tree, $node, node.toggleState)
        $(this).closest(_rootDls).click()
    }
    function onClick(e){//点击节点
        //e.stopPropagation();// e.stopImmediatePropagation
        //console.log(e.target)
        var $target = $(e.target)
        if ($target.is(_checkDls)||$target.is(_checkIptDls)||$target.is(_toggleDls)){
            return;//
        }
        var $node = $(this).closest(_nodeDls), node = getNode($node)
        var tree = getTree($node), $tree = $locate(tree)
        var $check = $(this).find(_checkIptDls)
        doCheck($check)
        if (!tree.keepFocus){
            $(this).blur()
        }else{
            $tree.find(_nodeDls).removeClass(tree.classes.focus)
            $node.addClass(tree.classes.focus)
        }
        $node.trigger(_clickEvt, [tree, node])
        //$(this).closest(_rootDls).click()
    }
    function onCheck(e){
        e.preventDefault()
        doCheck($(this))
    }
    function doCheck($check){
        if (!$check || !$check.length || !$check.is(':visible') || $check.prop('disabled')) return
        var $node = $check.closest(_nodeDls), node = getNode($node)
        var tree = getTree($node), $tree = $locate(tree)
        if (tree.checkType == 'radio'){
            if (!node.checked){
                selectNodes.call($tree, false)
                node.checked = true
            }
        }else{
            node.checked = !node.checked
            var rel = tree.checkboxRelation[node.checked]
            if (rel.indexOf('c')>=0){
                selectNodes.call($node, node.checked)
            }
            if (rel.indexOf('p')>=0){
                selectParents.call($node, node.checked)
            }
        }
        $check.prop('checked', node.checked)
        $node.trigger(_checkEvt, [tree, node])
    }

    //***************** utility/tools  ******************//
    _option.$locate = $locate
    function $locate(tree, data){//$定位：根据data定位相关的jquery对象
        var id = tree.id
        if (!data || data.id == id){
            return $('#'+id)
        }
        if (data.id === ''){
            var $head = $('#'+id+'_')
            if (!$head.length){
                return $('#'+id)
            }
            return $head
        }
        return $('#'+id+'_'+encodeId(data.id?data.id:data))
    }
    _option.getTree = getTree
    function getTree($obj){//获取关联的ctree数据(option)
        var $root = $obj
        if (!$root.is(_rootDls)){
            $root = $root.closest(_rootDls)
        }
        return $root.data(_rootKey)
    }
    _option.getNode = getNode
    function getNode($obj){//获取关联的节点数据
        var $node = $obj
        if (!$node.is(_nodeDls)){
            $node = $node.closest(_nodeDls)
        }
        return $node.data(_nodeKey)
    }
    _option.getParentNode = getParentNode
    function getParentNode($obj){//获取父节点数据
        if ($obj){
            $obj = $obj.parents(_nodeDls).first()
        }
        return $obj.data(_nodeKey)
    }
    function encodeId(id){
        return encodeURIComponent(id).replace(/%/g,'_').replace(/\./g,'_2d')
    }
    function newId(){
        return 'ctree_' + uuid()
    }
    function uuid(){
        var mould = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        return mould.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0
            var v = c === 'x' ? r : (r&0x3|0x8)
            return v.toString(16)
        })
    }
})(jQuery)

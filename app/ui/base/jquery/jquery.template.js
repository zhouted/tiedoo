/*
* 模板处理
*/

// 渲染模板：默认就地输出（调用$tpl.before）
// sample: <script type="text/html" role="template">
//              <a href="${data.url}">${data.name}</a>
//         </script>
// usage: $('#tpl').renderTpl([{url:'a.html', '啊'}, {url:'b.html'}, '吧']);
$.fn.renderTpl = function(data, $to, fn){
    if ($to && !fn){
        fn = $to.append;
    }
    for (let tpl of this) {
        $tpl = $(tpl);
        renderTpl($tpl, data, $to||$tpl, fn||$tpl.before);
    }
    return this;
}

//模板渲染处理函数
//把数据 data 绑定到模板 $tpl，并调用 fn 输出到 $to
function renderTpl($tpl, data, $to, fn){
    let render = compile($tpl);
    if ($.isArray(data)) {
        for (let d of data) {
            doRender($tpl, d, data.indexOf(d));
        }
    }else{
        doRender($tpl, data, $tpl.index());
    }
    function doRender($tpl, data, index){
        if (validData(data)){
            var html = render(data, index);
            fn.call($to, html); // $tpl.trigger('template.render', [html, data]);
        }
    }
}

//生成并缓存模板函数
function compile($tpl){
    const TPL_RENDER = '_tplRender';
    if (!($tpl instanceof jQuery)){
        $tpl = $(tpl);
    }
    if ($tpl.data(TPL_RENDER)){
        return $tpl.data(TPL_RENDER);
    }
    let tpl = $.trim($tpl.html());
    let bind = $tpl.data('bind')||'data';
    let render = new Function(bind, 'index', 'return '+'`'+tpl+'`');
    $tpl.data(TPL_RENDER, render);
    return render;
}

//把数据 data 绑定到模板 $tpl，返回处理结果
function template($tpl, data, index = 0){
    var result;
    if (!($tpl instanceof jQuery)){
        $tpl = $(tpl);
    }
    let render = compile($tpl);
    if ($.isArray(data)) {
        result = [];
        for (let d of data) {
            if (validData(d)){
                result.push(render(d, index+data.indexOf(d)));
            }
        }
    }else if (validData(data)){
        result = render(data, index);
    }
    return result;
}

function validData(data){
    return !Object.is(data,null) && !Object.is(data,undefined)
}

if (module){
    module.exports = template
}

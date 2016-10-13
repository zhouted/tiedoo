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
            doRender($tpl, d);
        }
    }else{
        doRender($tpl, data);
    }
    function doRender($tpl, data){
        if ($.isPlainObject(data)){
            var html = render(data);
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
    let tpl = $tpl.html();
    let bind = $tpl.data('bind')||'data';
    let render = new Function(bind, 'return '+bind+'&&`'+tpl+'`');
    $tpl.data(TPL_RENDER, render);
    return render;
}

//把数据 data 绑定到模板 $tpl，返回处理结果
function template($tpl, data){
    var result;
    if (!($tpl instanceof jQuery)){
        $tpl = $(tpl);
    }
    let render = compile($tpl);
    if ($.isArray(data)) {
        result = [];
        for (let d of data) {
            if ($.isPlainObject(d)){
                result.push(render(d));
            }
        }
    }else if ($.isPlainObject(data)){
        result = render(data);
    }
    return result;
}

if (module){
    module.exports = {template};
}

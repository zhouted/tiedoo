/*
* 加载和处理UI(html+css+js)框架
*/

// 处理html文档中的<include>标签
// usage: $(document).loadIncludes();
// $.fn.loadIncludes = function(){
//     return includer(this);
// }

// 加载文件：如果指定id则检查唯一性（即只加载一次）；默认覆盖this下的内容（可指定jQuery DOM操作方法）
// usage: $('#div').loadFile('a.html', {id: 'pid'});
$.fn.loadFile = function(filename, opts){
    opts = opts || {}
    if (typeof(opts) == 'string'){
        opts = {id: opts}
    }
    if (opts.id){// 如果指定id则检查唯一性
        let $exists = this.find('#'+opts.id);
        if ($exists && $exists.length){//存在即不再加载
            let deferred = $.Deferred();
            deferred.resolve($exists);
            return deferred.promise();
        }
    }
    return loader(filename, opts).then($content => {
        if (opts.append){
            this.append($content);
        }else if (opts.prepend){
            this.prepend($content);
        }else{
            this.empty().append($content);
        }
    });
}

// 处理 $scope 下的所有<include>标签：用src指向的文件内容替换之
function includer($scope){
    let $incs = $scope.find('INCLUDE');
    let promises = $incs.map(function(){
        let $inc = $(this), opts = $inc.data()
        let filename = $inc.attr('src');
        let promise = loader(filename, opts);
        promise.then($content => {
            $inc.replaceWith($content);
        });
        return promise;
    });
    return $.when.apply($, promises);
    // return Promise.all(promises);
}

// 把文件内容加载到 $inc
function loader(filename, opts){
    let deferred = $.Deferred();
    // console.debug('loading '+filename);
    $.ajax(filename).then(data => {
        let contents = data;//.toString();
        let css, cssname = filename.replace(/.html$/, '.css')
        $.ajax(cssname).then(data => {
            css = data;
        }).always(()=>{
            if (css){
                contents += `<style>${css}</style>`
            }
            tryLoadAll(contents)
        })
    }).catch((err)=>{
        reject(err);
    });
    return deferred.promise();

    function resolve(data){
        deferred.resolve(data);
        // console.debug(filename + ' loaded!');
    }
    function reject(err){
        deferred.reject(err);
    }
    // 尝试加载进一步包含的文件
    function tryLoadAll(contents){
        let pid = opts&&opts.id
        let $contents = tryContents(contents, pid)
        $contents = addScript($contents, pid);
        if ($contents instanceof $){ // 递归加载
            includer($contents).then(() => {
                resolve($contents)
            }).catch(err => { // ignore errors
                resolve($contents)
                console.warn(err);
            });
        }else{//TODO: 不合法的html格式？
            resolve($contents);
        }
    }
    //试图把contents转为jQuery对象，同时处理pid
    function tryContents(contents, pid){
        contents = contents.replace(new RegExp('#pid', 'g'), '#'+pid)
        let $contents = contents.replace(new RegExp('\\$\\{pid\\}', 'g'), pid)
        try{
            $contents = $($contents);
        }catch(e){
            console.warn(e);
        }
        return $contents
    }
    // 为加载内容附加同名js文件，同时处理content's id
    function addScript($contents, pid){
        let aScript = `<script>(function(){
            let p = require('./${filename.replace(/.html$/, '.js')}')
            if (typeof(p)=='function'){
                p = new p({pid:'${pid}'})
            }else{
                p && p.prepare && p.prepare({pid:'${pid}'})
            }
            p && $(function(){
                p.onReady && p.onReady({pid:'${pid}'})
            })})()</script>`
        if ($contents instanceof $){
            $.merge($contents, $(aScript));
        }else{
            $contents += aScript;
        }
        return $contents
    }
}

// if (module){
//     module.exports = {loader};
// }

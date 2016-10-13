/*
* 加载和处理页面框架
*/

// 处理html文档中的<include>标签
// usage: $(document).loadIncludes();
$.fn.loadIncludes = function(){
    return includer(this);
}

// 加载html文件覆盖this下的内容
// usage: $('#div').loadFile('a.html');
$.fn.loadFile = function(filename, opts){
    return loader(filename, opts).then(($content)=>{
        this.empty().append($content);
    });
}

// 把html文件追加到this下，如果指定id则检查唯一性（即只加载一次）
// usage: $('body').addFile('a.html');
$.fn.addFile = function(filename, opts){
    let id = opts&&opts.id;
    if (id){// 如果指定id则检查唯一性
        let $exists = this.find('#'+id);
        if ($exists && $exists.length){//存在即不再加载
            let deferred = $.Deferred();
            deferred.resolve($exists);
            return deferred.promise();
        }
    }
    return loader(filename, opts).then(($content)=>{
        this.append($content);
    });
}

// 处理 $scope 下的所有<include>标签：用src指向的文件内容替换之
function includer($scope){
    let $incs = $scope.find('INCLUDE');
    let promises = $incs.map(function(){
        let $inc = $(this); opts = $inc.data();
        let filename = $inc.attr('src');
        let promise = loader(filename, opts);
        promise.then(($content)=>{
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
    console.debug('loading '+filename);
    $.ajax(filename).then((data)=>{
        let $scope = data;//.toString();
        try{
            $scope = $($scope);
        }catch(e){
            console.log(e);
        }finally{
            appendScript($scope, opts&&opts.id);
            if ($scope instanceof $){
                includer($scope).then(()=>{
                    resolve($scope)
                }).catch((err)=>{
                    resolve($scope)
                    console.log(err);
                });
            }else{//TODO: 不合法的html格式？
                resolve($scope);
            }
        }
    }).catch((err)=>{
        deferred.reject(err);
    });
    return deferred.promise();

    function resolve($content){
        deferred.resolve($content);
        console.debug(filename + ' loaded!');
    }
    function reject(err){
        deferred.reject(err);
    }

    function appendScript($scope, id){// 为加载内容附加关联脚本
        let oid // 存放原有id
        if ($scope instanceof $ && $scope[0]){
            oid = $scope[0].id
        }
        id = id || oid || 'undef' // 指定id 或 原有id //TODO uuid
        let aScript = `<script>
            $(function(){
                //try{
                    const ${id} = require('./${filename.replace(/.html$/, '.js')}');
                    ${id} && ${id}.init && ${id}.init('#${id}');
                //}catch(e){
                //    console.debug(e);
                //}
            })
        </script>`
        if ($scope instanceof $){
            if (oid){// 替换内嵌脚本可能用到的scope id
                $scope.siblings('script').each(function(){
                    let $script = $(this);
                    $script.text($script.text().replace('#'+oid, '#'+id));
                });
            }
            if (id && id !== 'undef'){// 重设scope id
                $scope[0].id = id;
            }
            $.merge($scope, $(aScript));
        }else{
            $scope += aScript;
        }
    }
}

if (module){
    module.exports = {loader};
}

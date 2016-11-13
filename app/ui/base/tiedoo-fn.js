exports.equals = equals
function equals(x, y) {
    // If both x and y are null or undefined and exactly the same
    if (Object.is(x, y)) {
        return true
    }
    // If they are not strictly equal, they both need to be Objects
    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) {
        return false;
    }
    //They must have the exact same prototype chain,the closest we can do is
    //test the constructor.
    if ( x.constructor !== y.constructor ) {
        return false;
    }

    for ( var p in x ) {
        //Inherited properties were tested using x.constructor === y.constructor
        if ( x.hasOwnProperty( p ) ) {
            // Allows comparing x[ p ] and y[ p ] when set to undefined
            if ( ! y.hasOwnProperty( p ) ) {
                return false;
            }
            // If they have the same strict value or identity then they are equal
            if ( x[ p ] === y[ p ] ) {
                continue;
            }
            // Numbers, Strings, Functions, Booleans must be strictly equal
            if ( typeof( x[ p ] ) !== "object" ) {
                return false;
            }
            // Objects and Arrays must be tested recursively
            if (!equals(x[p], y[p])) {
                return false;
            }
        }
    }

    for ( p in y ) {
        // allows x[ p ] to be set to undefined
        if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) {
             return false;
        }
    }
    return true;
};


exports.isObject = isObject
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

exports.merge = merge
function merge(){ //deep Object.assion
    if ($ && $.extend){
        return $.extend(true, ...arguments)
    }
    // just recursive Object.assign
    let merged = Object.assign({}, ...arguments)
    for (let p in merged){
        let o = merged[p]
        if (isObject(o)){
            let args = [] //arguments.map(a => a&&a[p])
            for (let i in arguments){
                if (arguments[i] && isObject(arguments[i][p])){
                    args.push(arguments[i][p])
                }
            }
            merged[p] = merge(o, ...args)
        }
    }
    return Object.assign(arguments[0], merged)
}

//formaters:
exports.fstr = exports.escapeHtml = escapeHtml
function escapeHtml(str) {
    if (str === null || str === undefined) return ''
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}
exports.fdate = dateToStr
function dateToStr(date){
    return (date instanceof Date) && date.toLocaleDateString() || ''
}
exports.ftime = timeToStr
function timeToStr(date){
    return (date instanceof Date) && date.toLocaleTimeString() || ''
}
exports.fdatetime = dateToLStr
function dateToLStr(date){
    return (date instanceof Date) && date.toLocaleString() || ''
}

exports.tips = tips // 弹出提示信息（几秒钟后自动消失）
function tips(msg, type, complete) {//type:对应bootstrap的alert-*：'success'是成功信息，'danger'是失败信息,'info'是普通信息,'warning'是警告信息
    var $tip = $("#_tip");//已经有了重用
    if ($tip.length == 0){//没有则加一个
	    $tip = $('<strong id="_tip" style="position:fixed;top:50px;left: 50%;z-index:8888"></strong>');
	    $('body').append($tip);
	    $tip.click(function(){$tip.hide();});//点击消失
    }
    type = type || "success";
    $tip.stop(true)//停掉正在的
    	.prop('class', 'alert alert-' + type).text(msg)//alert信息
    	.css('margin-left', - $tip.outerWidth() / 2)//居中
    	.fadeIn(600).delay(2000).fadeOut(600, complete);//渐入.停留.淡出
}

exports.store = store; //浏览器端存储函数(可代替cookies)
function store(key, val){
    if (!localStorage || !key) return;
    try{
        if (typeof val !== "undefined"){
            localStorage.setItem(key, JSON.stringify(val));
        }else{
            return JSON.parse(localStorage.getItem(key));
        }
    }catch(err){
        console.log(err);
    }
}

/*****************************************
* Tool/functions for Tiedoo
******************************************/
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
    }
    !str.replace && (str = str.toString())
    return str.replace(/[&<>"']/g, m => map[m])
}
exports.fnum = numToStr
function numToStr(num, fixed){
    if (typeof(num) !== 'number'){
        num = Number.parseFloat(num)
    }
    if (Number.isNaN(num)){
        return ''
    }
    if (fixed === undefined){
        return num.toString()
    }
    return num.toFixed(fixed)
}
exports.fdate = dateToStr
function dateToStr(date){
    return (date instanceof Date) && date.toLocaleDateString() || date || ''
}
exports.ftime = timeToStr
function timeToStr(date){
    return (date instanceof Date) && date.toLocaleTimeString() || date || ''
}
exports.fdatetime = dateToLStr
function dateToLStr(date){
    return (date instanceof Date) && date.toLocaleString() || date || ''
}
exports.funit = funit
function funit(unit1, unit2){
    unit1 = escapeHtml(unit1)
    unit2 = escapeHtml(unit2)
    if (unit1 && unit2) return unit1+'('+unit2+')'
    return unit1+unit2
}
exports.fsize = fsize
function fsize(s1, s2, s3){
    if (!s1&&!s2&&!s3) return ''
    s1 = numToStr(s1)||'-'
    s2 = numToStr(s2)||'-'
    s3 = numToStr(s3)||'-'
    return s1+'x'+s2+'x'+s3
}
exports.fweight = fweight
function fweight(net, cross){
    if (!net&&!cross) return ''
    net = numToStr(net)||'-'
    cross = numToStr(cross)||'-'
    return net+'/'+cross
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
        console.error(err);
    }
}

exports.equals = equals
function equals(x, y) { // contents compare (seek: http://stackoverflow.com/questions/1068834/object-comparison-in-javascript)
    // If both x and y are null or undefined and exactly the same
    if (Object.is(x, y)) {
        return true
    }
    // If they are not strictly equal, they both need to be Objects
    if (!(x instanceof Object) || !(y instanceof Object)) {
        return false
    }
    //They must have the exact same prototype chain,the closest we can do is test the constructor.
    if (x.constructor !== y.constructor) {
        return false
    }
    for (var p in x) {
        //Inherited properties were tested using x.constructor === y.constructor
        if (x.hasOwnProperty(p)) {
            // Allows comparing x[ p ] and y[ p ] when set to undefined
            if (!y.hasOwnProperty(p)) {
                return false
            }
            // If they have the same strict value or identity then they are equal
            if (x[p] === y[p]) {
                continue
            }
            // Numbers, Strings, Functions, Booleans must be strictly equal
            if (typeof(x[p]) !== "object") {
                return false
            }
            // Objects and Arrays must be tested recursively
            if (!equals(x[p], y[p])) {
                return false
            }
        }
    }
    for (p in y) {
        // allows x[ p ] to be set to undefined
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false
        }
    }
    return true
}

exports.isBlank = isBlank
function isBlank(a){
    return !a && (a !== 0)
}
exports.isBlankObject = isBlankObject
function isBlankObject(obj){//判断对象的所有属性值是否为空
    if (isBlank(obj)) return true
    if (typeof(obj) !== 'object') return false
    if (Array.isArray(obj)) return !obj.length
    for (let i in obj){//递归检查（TODO:循环引用问题）
        if (!isBlankObject(obj[i])) return false
    }
    return true
}

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
exports.clone = function(){
    return merge({}, ...arguments)
}

exports.contain = contain
function contain(obj, keys){//判断obj是否“包含”keys所有的属性且值相等
    if (!isObject(obj) || !isObject(keys)) return false
    for (let k in keys){
        if (!Object.is(obj[k], keys[k])) return false
    }
    return true
}

// Array扩展
Array.prototype.itemOf = function(keys){//返回匹配keys值的item
    for (let item of this){
        if (contain(item, keys)) return item
    }
    return null
}
Array.prototype.sortBy = function(field){//按item的指定属性排序
    if (field){
        return this.sort(cb)
    }
    return this.sort()
    function cb(a, b){
        let x = a&&a[field], y = b&&b[field]
        if (x>y) return 1
        if (x<y) return -1
        return 0
    }
}
Array.prototype.popush = function(item, push = true){
    //为避免重复以及让再加入的移到后面
    //先移除已存在的item再push；push=false时仅移除item
    let pos = this.indexOf(item)
    if (pos >= 0){
        this.splice(pos, 1)
    }
    if (push){
        this.push(item)
    }
    return this
}

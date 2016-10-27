/*
 * form.input的处理：readonly状态切换，输入限制，合法性检查等
 * @version     0.2.0
 * @author      Tiedoo
*/
(function($){
	//缺省选项
	var _options = {
		clsEditing: 'on-editing',
		clsForEditonly: 'for-editonly',
		clsReading: 'on-reading',
		clsForReadonly: 'for-readonly',
	}

	//插件方法：$('#form').readonly();
	$.fn.input = initInput;
	function initInput(act, options){
		var act = act[0];
		switch (act){
		case 'c'://check valid
			return checkValids(this, options);
		case 'v'://get/set values
			if (options){
				setValues(this, options); break;
			}else{
				return getValues(this);
			}
		case 'r'://to reading model
			toReading(this, options); break;
		case 'e'://to editing | enable
			toEditing(this, options); break;
		case 'i'://init
		default:
			initReading(this, options);
			initEditing(this, options)
		}
		return this;
	}

	function getValues($form) {
	    var doc = {}
		$form.find('input[name]').each(function(){
			let $ipt = $(this)//, val = $ipt.val(), orgval = $ipt.data('_orgval')
			let name = $ipt.attr('name-map')||$ipt.attr('name')
			let ns = $ipt.attr('name-space')
			if (ns) {
				doc[ns] = doc[ns]||{}
				getValue($ipt, doc[ns], name)
			}else{
				getValue($ipt, doc, name)
			}
		})
		function getValue($ipt, doc, name){
			let type = $ipt.attr('type')
			if (type == 'radio' && !$ipt.prop('checked')){ // 跳过没选中的radio
				return
			}
			let val = getVal($ipt, type)
			if (doc.hasOwnProperty(name)){// 同名出现多次转为数组
				if (!Array.isArray(doc[name])){
					if (doc[name] === null){// null值不放入数组，使单checkbox保持单值属性，多checkbox转为数组属性
						doc[name] = []
					}else{
						doc[name] = [doc[name]]
					}
				}
				if (val !== null){ // 跳过空值：没选中的checkbox
					doc[name].push($ipt.val())
				}
			}else{
				doc[name] = getVal($ipt, type)
			}
		}
		function getVal($ipt, type){
			if (type === 'checkbox'){ // 单checkbox没选中返回null
				return $ipt.prop('checked')? $ipt.val() : null
			} if (type === 'file'){ // input file 的id保存在data里
				return $ipt.data('fileId')
			}
			return $ipt.val()
		}
		return doc
	}

	function setValues($form, doc){
		$form.find('input[name]').each(function(){
			let $ipt = $(this)
			let name = $ipt.attr('name-map')||$ipt.attr('name')
			let ns = $ipt.attr('name-space')
			if (ns) {
				if (doc[ns]) {
					setValue($ipt, doc[ns][name])
				}
			} else {
				setValue($ipt, doc[name])
			}
		})
		initReading($form, true)
		function setValue($ipt, val){
			if ($ipt.is('[type=checkbox],[type=radio]')){
				let checked = false
				if (Array.isArray(val)){
					checked = val.includes($ipt.val())
				}else{
					checked = ($ipt.val() === val)
				}
				$ipt.prop('checked', checked);
			}else if ($ipt.is('[type=file]')){
				$ipt.data('fileId', val)
			}else{
				$ipt.val(val)
			}
			// $ipt.data('_orgval', val)
		}
	}

	function checkValids($inputs, quiet){
		var valid = true;
		if ($inputs.prop('tagName') != 'INPUT'){
			$inputs = $inputs.find("input");
		}
		if (typeof(quiet) == 'object'){
			var options = quiet;
			quiet = options.quiet;
		}
		$inputs.each(function(){
			valid && (valid = checkValid(this, quiet, options));
		});
		return valid;
	}
	function checkValid(input, quiet, options){
		if (!input || !input.checkValidity) return true;//!this.validity || (this.validity && this.validity.valid);
		var valid = input.checkValidity();
		if (valid && options && options.validator){
			valid = options.validator(input);
		}
		if (!valid){
			var $ipt = $(input), $panel = $ipt.closest('.tab-pane');
			if ($panel.length && !$panel.is('.active')){
				$('a[href="#'+$panel.attr('id')+'"]').tab('show');
			}
			!quiet && $ipt.focus().popover("show");//.parent().addClass("has-error");
		}else{
			$(input).popover('destroy');
		}
		return valid;
	}

	function initEditing($form, values){
		//values && setValues($form, values)
		//限制输入
		var modes = [
			{cls: 'number', keys:/[\d]/,  pattern:'\\d*'},
 		    {cls: 'integer', keys:/[\d\+-]/,  pattern:'[\\+-]?\\d*'},
		    {cls: 'numeric', keys:/[\d\+-.]/, pattern:'[\\+-]?\\d*\\.?\\d*'},
			{cls: 'english', keys:/[\w\s\+-,\.#\*\[\]\(\)]/,  pattern:'[\\w\\s\\+-,\\.#\\*\\[\\]\\(\\)]*'},
		];
		modes.forEach(function(mode){
			var $ipts = $form.find('.form-control.'+mode.cls);
			$ipts.attr('pattern', '^'+mode.pattern+'$').data(mode);
			$ipts.off('keypress').on('keypress', onEditKeypress);
			$ipts.off('keyup').on('keyup', onEditKeyup);
		});
		function onEditKeypress(e){
			var code = e.which;
			if (code<32 || (code>126 && code<160)) return true;//FF!!
			var keys = $(this).data('keys');
			if (keys && !keys.test(String.fromCharCode(code))){
				return false;
			}
			return true;
		}
		function onEditKeyup(e){
			var $ipt = $(this), val = $ipt.val();
			var pattern = $ipt.attr('pattern');
			if (!RegExp(pattern).test(val)){
				pattern = $ipt.data('pattern');
				var vals = RegExp(pattern).exec(val);
				vals && $ipt.val(vals[0]);
			}
		}

		//自动补全url
		$form.find('.form-control.url').change(function(){
			var $ipt = $(this), val = $ipt.val();
			var pos = val.search('://');
			if (pos<0){
				$ipt.val('http://'+val);
			}
		});
		//自动转行大小写
		$form.find('.form-control.auto-lowcase, .form-control.auto-upcase').change(function(){
			var $ipt = $(this), val = $ipt.val();
			if (val){
				val = $ipt.is('.auto-lowcase')? val.toLowerCase() : val.toUpperCase();
				$ipt.val(val);
			}
		});

		//TODO: 为input自动生成id，使用lable.for?
	}

	function initReading($form, values){
		//values && setValues($form, values)
		$form.find('.input-group-addon.before-input.'+_options.clsForEditonly).each(addOn)//.hide();
		$form.find('.form-control.'+_options.clsForEditonly+'[name]').each(function(){
			var $ipt = $(this);
			var $p = getReadonlyP($ipt);
			var $span = getReadonlySpan($p, 'form-control-'+this.name, (this.tagName=='TEXTAREA'?'pre':'span'));
			var value = $ipt.val()||'-';
			if (this.tagName == 'SELECT'){
				value = $ipt.find('option[value='+value+']').text();
			}
			$span.text(value);
			//$p.show();
		})//.hide();
		$form.find('.input-group-addon.after-input.'+_options.clsForEditonly).each(addOn)//.hide();
		$form.find('.control-label.'+_options.clsForEditonly).each(function(){
			var $label = $(this);
			var $ipt = $label.children('input');
			if ($ipt.prop('checked')){
				$label.show();
				$ipt.hide();
			}else{
				$label.hide();
			}
		});

		function addOn(){
			var $addon = $(this);
			var $p = getReadonlyP($addon);
			var addCls = 'input-group-addon-span';
			$addon.is('.before-input') && (addCls+='.before-input');
			$addon.is('.affter-input') && (addCls+='.affter-input');
			var $span = getReadonlySpan($p, addCls);
			$span.text($addon.text());
			//$p.show();
		}

		function getReadonlyP($ctrl){
			var $parent = $ctrl.parent();
			var $p = $parent.find('p.form-control-static.'+_options.clsForReadonly);
			if (!$p || !$p.length){
				$p = $('<p/>').addClass('form-control-static '+_options.clsForReadonly);
				$parent.append($p);
			}
			return $p;
		}
		function getReadonlySpan($p, cls, tag){
			tag = tag || 'span';
			var $span = $p.find(tag+'.'+cls);
			if (!$span || !$span.length){
				$span = $('<'+tag+'/>').addClass(cls);
				$p.append($span);
			}
			return $span;
		}
	}

	function toReading($form, init){
		$form.addClass(_options.clsReading).removeClass(_options.clsEditing)
		init && initReading($form)
	}

	function toEditing($form, init){
		$form.removeClass(_options.clsReading).addClass(_options.clsEditing)
		init && initEditing($form);
	}

})(jQuery);

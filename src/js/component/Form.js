/**
 * 表单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

define('C.Form',
'C.AbstractComponent',
function(AC){
	
	var Form=AC.define('Form');
	
	Form.extend({
		//初始配置
		xConfig         : {
			cls         : 'form'
		},
		
		tmpl            : [
			'<div>',
				'<form action="">',
					'<div class="hui-form-tips c-txt-error"></div>',
					'{{placeItem}}',
				'</form>',
			'</div>'
		].join(''),
		
		hasChanged      : fHasChanged      //检测是否有表单改变的域/值
		
	});
	
	/**
	 * 检测是否有表单改变的域/值
	 * @return {boolean} true表示有变化
	 */
	function fHasChanged(){
		var me=this;
		var bHasChange=false;
		me.findEl('input,textarea').each(function(i,oEl){
			if(oEl.type==='checkbox'||oEl.type==='radio'){
				if (oEl.checked != oEl.defaultChecked){
					bHasChange=true;
					return false;
				}
			}else{
				if (oEl.value != oEl.defaultValue){
					bHasChange=true;
					return false;
				}
			}
		});
		me.findEl('select').each(function(i,oEl){
			var def = 0, opt;
			for (var i = 0, len = oEl.options.length; i < len; i++) {
				opt = oEl.options[i];
				bHasChange = bHasChange || (opt.selected != opt.defaultSelected);
				if (opt.defaultSelected){
					def = i;
				}
			}
			if (bHasChange && !oEl.multiple){
				bHasChange = (def != oEl.selectedIndex);
			}
			if (bHasChange){
				return false;
			}
		});
		return bHasChange;
	}
	
	return Form;
	
});
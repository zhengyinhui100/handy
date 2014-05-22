/**
 * 表单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Form',
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
		].join('')
		
	});
	
	return Form;
	
});
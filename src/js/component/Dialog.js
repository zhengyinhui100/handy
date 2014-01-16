/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('handy.component.Dialog',
'handy.component.AbstractComponent',
function(AC){
	
	var Dialog=AC.define('Dialog');
	
	$HO.extend(Dialog.prototype,{
		//初始配置
		
		tmpl            : ['']
		
	});
	
	return Dialog;
	
});
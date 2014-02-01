/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Popup',
'c.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup');
	
	$HO.extend(Popup.prototype,{
		//初始配置
		
		//组件共有配置
		withMask        : true,
		
		tmpl            : [
		]
		
	});
	
	return Popup;
	
});
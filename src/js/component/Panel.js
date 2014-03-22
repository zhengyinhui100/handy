/**
 * 面板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('C.Panel',
'C.AbstractComponent',
function(AC){
	
	var Panel=AC.define('Panel');
	
	Panel.extend({
		//初始配置
//		content         : '',                 //内容
		
		tmpl            : [
			'<div><%=#%><%=this.content||this.getHtml(">*")%><div>'
		]
	});
	
	return Panel;
	
});
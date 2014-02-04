/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('c.Icon',
'c.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	
	Icon.extend({
		//初始配置
		hasBg           : true,               //是否有背景
//		name            : '',                  //图标名称
		
		tmpl            : ['<span class="hui-icon hui-icon-<%=this.name%><%if(this.hasBg){%> hui-icon-bg<%}%>"></span>']
		
	});
	
	return Icon;
	
});
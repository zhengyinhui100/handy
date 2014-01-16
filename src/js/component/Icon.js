/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('handy.component.Icon',
'handy.component.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	
	$HO.extend(Icon.prototype,{
		//初始配置
//		hasBg           : false,               //是否有背景
//		name            : '',                  //图标名称
		
		tmpl            : ['<span class="w-icon w-icon-<%=this.name%><%if(this.hasBg){%> w-icon-bg<%}%>"></span>']
		
	});
	
	return Icon;
	
});
/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('c.Icon',
'c.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	//检查浏览器是否支持svg，不支持则添加标记class
	$H.Support.testSvg(function(bSupport){
		if(!bSupport){
			$('html').addClass('w-nosvg');
		}
	})
	
	$HO.extend(Icon.prototype,{
		//初始配置
		hasBg           : true,               //是否有背景
//		name            : '',                  //图标名称
		
		tmpl            : ['<span class="w-icon w-icon-<%=this.name%><%if(this.hasBg){%> w-icon-bg<%}%>"></span>']
		
	});
	
	return Icon;
	
});
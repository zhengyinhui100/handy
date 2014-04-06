/**
 * 文字标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Label',
'C.AbstractComponent',
function(AC){
	
	var Label=AC.define('Label');
	
	Label.extend({
		//初始配置
//		labelColor      : '',      //label字体颜色
//		labelAlign      : '',      //label文字对齐，默认左对齐
		
		tmpl            : [
			'<label class="',
				'<%if(this.labelColor){%> hui-label-<%=this.labelColor%><%}%><%if(this.labelAlign){%> c-txt-<%=this.labelAlign%><%}%>" for="<%=this.forName%>">',
				'<%=this.text%>',
			'</label>'
		]
		
	});
	
	return Label;
	
});
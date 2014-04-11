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
//		color           : '',      //label字体颜色
//		textAlign       : '',      //label文字对齐，默认左对齐
		
		tmpl            : [
			'<label class="',
				'<%if(this.color){%> hui-label-<%=this.color%><%}%><%if(this.textAlign){%> c-txt-<%=this.textAlign%><%}%>" for="<%=this.forName%>">',
				'<%=this.text%>',
			'</label>'
		]
		
	});
	
	return Label;
	
});
/**
 * 表单域类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('c.Field',
'c.AbstractComponent',
function(AC){
	
	var Field=AC.define('Field');
	
	Field.extend({
		//初始配置
//		forName         : '',      //label标签for名字
//		label           : '',      //label文字
//		text            : '',      //右边文字
		
		tmpl            : [
			'<div class="hui-form-field">',
				'<label class="hui-form-left" for="<%=this.forName%>"><%=this.label%></label>',
				'<div class="hui-form-right">',
					'<%=this.text%>',
					'<%=this.findHtml("$>*")%>',
				'</div>',
			'</div>'
		]
		
	});
	
	return Field;
	
});
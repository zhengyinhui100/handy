/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('c.Set',
'c.AbstractComponent',
function(AC){
	
	var Set=AC.define('Set');
	
	Set.extend({
		
//		title           : '',      //标题
		
		tmpl            : [
			'<div class="hui-set">',
				'<h1 class="hui-set-title"><%=this.title%></h1>',
				'<div class="hui-set-content">',
					'<%=this.getHtml("$>*")%>',
				'</div>',
			'</div>'
		]
		
	});
	
	return Set;
	
});
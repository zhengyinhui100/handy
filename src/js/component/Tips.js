/**
 * 提示类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-15
 */

$Define('c.Tips',
['c.AbstractComponent',
'c.Popup',
'c.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Tips=AC.define('Tips',Popup);
	
	Tips.extend({
		//初始配置
//		text            : '',
		theme           : 'white',
		radius          : 'normal',
		
		tmpl            : [
			'<div class="hui-tips<%if(!this.text){%> hui-tips-notxt<%}%>">',
				'<%=this.getHtml("$>*")%>',
				'<%if(this.text){%><span class="hui-tips-txt"><%=this.text%></span><%}%>',
			'</div>'
		]
		
	});
	
	return Tips;
	
});
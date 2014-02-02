/**
 * 菜单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-02
 */

$Define('c.Menu',
['c.AbstractComponent',
'c.Popup',
'c.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Menu=AC.define('Menu',Popup);
	$HO.inherit(Menu,ControlGroup);
	
	$HO.extend(Menu.prototype,{
		//初始配置
		
		tmpl            : [
			'<div class="hui-menu">',
				'<ul>',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
						'<li class="hui-menu-item">',
							'<%=this.children[i].getHtml()%>',
						'</li>',
					'<%}%>',
				'</ul>',
			'</div>'
		]
	
	});
	
	return Menu;
	
});
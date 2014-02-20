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
	
	//扩展取得ControlGroup的属性及方法
	Menu.extend(ControlGroup.prototype);
	
	Menu.extend({
		//初始配置
//		markType        : null,         //选中的标记类型，默认不带选中效果，'active'是组件active效果，'dot'是点选效果
		notDestroy      : true,
		
		tmpl            : [
			'<div class="hui-menu<%if(this.markType=="dot"){%> hui-menu-mark<%}%>">',
				'<ul>',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
						'<li class="hui-menu-item<%if(this.children[i].selected){%> hui-item-mark<%}%>">',
							'<%=this.children[i].getHtml()%>',
							'<%if(this.markType=="dot"){%><span class="hui-icon-mark"></span><%}%>',
						'</li>',
					'<%}%>',
				'</ul>',
			'</div>'
		],
		
		selectItem      : fSelectItem         //选中/取消选中
	});
	
	/**
	 * 选中/取消选中
	 * @method selectItem
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		var me=this;
		bSelect=bSelect!=false;
		//优先使用配置的效果
		if(me.markType=="dot"){
			oItem.selected=bSelect;
			var oLi=oItem.getEl().parent();
			oLi[bSelect==false?"removeClass":"addClass"]('hui-item-mark');
		}else if(me.markType=='active'){
			ControlGroup.prototype.selectItem.call(me,oItem,bSelect);
		}else{
			//无选中效果
			oItem.selected=bSelect;
		}
	}
	
	return Menu;
	
});
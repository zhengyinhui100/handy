/**
 * 工具栏类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('handy.component.Toolbar',
'handy.component.AbstractComponent',
function(AC){
	
	var Toolbar=AC.define('Toolbar');
	
	$HO.extend(Toolbar.prototype,{
		//初始配置
//		title            : '',                  //标题
		
		tmpl             : [
			'<div class="w-tbar"><%=this.getChildrenHtml()%>',
				'<%if(this.title){%><h1 class="w-tbar-title"><%=this.title%></h1><%}%>',
			'</div>'
		],
		
		parseItem        : fParseItem           //处理子组件配置
		
	});
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.xtype=='Button'){
			oItem.shadowSurround=true;
			if(oItem.pos=='left'){
				oItem.extCls=(oItem.extCls||"")+'w-tbar-btn-left';
			}else if(oItem.pos=="right"){
				oItem.extCls=(oItem.extCls||"")+'w-tbar-btn-right';
			}
		}
	}
	
	return Toolbar;
	
});
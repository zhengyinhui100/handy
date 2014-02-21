/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('c.Tab',
['c.AbstractComponent',
'c.ControlGroup'],
function(AC,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	Tab.extend({
		//初始配置
//		hasContent      : false,        //是否有内容框
		defItem         : {             //默认子组件是Button
//			content     : '',           //tab内容
			xtype       : 'Button',
			radius      : null,
			isInline    : false,
			extCls      : 'js-item',
			iconPos     : 'top',
			shadow      : false
		},
		
		tmpl            : [
			'<div class="hui-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<li class="hui-tab-item" style="width:<%=100/len%>%">',
					'<%=this.children[i].getHtml()%>',
					'</li>',
					'<%}%>',
				'</ul>',
				'<%if(this.hasContent){%>',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
						'<div class="js-tab-content"<%if(!this.children[i].selected){%> style="display:none"<%}%>>',
						'<%=this.children[i].content%>',
						'</div>',
					'<%}%>',
				'<%}%>',
			'</div>'
		],
		
		parseItem       : fParseItem,          //处理子组件配置
		onItemClick     : fOnItemClick         //子项点击事件处理
	});
	
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.selected){
			oItem.isActive=true;
		}
	}
	/**
	 * 子项点击事件处理
	 * @method onItemClick
	 * @param {jQ:Event}oEvt jQ事件对象
	 * @param {number}nIndex 子项目索引
	 */
	function fOnItemClick(oEvt,nIndex){
		var me=this;
		//点击tab按钮显示对应的content
		if(me.hasContent){
			me.find('.js-tab-content').hide().eq(nIndex).show();
		}
		me.callSuper([oEvt,nIndex]);
	}
	
	return Tab;
	
});
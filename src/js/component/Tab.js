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
//		theme           : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
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
					'<%for(var i=0,len=this.children.length;i<len;i++){',
					//IE7下width有小数点时会有偏差(width:500px,len=3,结果会多一像素导致换行)，所以这里统一都没有小数点
					'var width=Math.floor(100/len);%>',
					'<li class="hui-tab-item" style="width:<%=(i==len-1)?(100-width*(len-1)):width%>%">',
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
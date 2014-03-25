/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('C.Tab',
['C.AbstractComponent',
'C.TabItem',
'C.ControlGroup'],
function(AC,TabItem,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	Tab.extend({
		//初始配置
//		activeType      : '',           //激活样式类型，
//		theme           : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
		defItem         : {             //默认子组件是TabItem
//			content     : '',           //tab内容
			xtype       : 'TabItem'
		},
		listeners       : [{
			name        : 'afterRender add remove',
			custom      : true,
			handler     : function(){
				this.layout();
			}
			
		}],
		
		tmpl            : [
			'<div class="hui-tab">',
				'<ul class="js-tab-btns c-clear">',
					'<%var aBtns=this.find("$>TabItem");',
					'for(var i=0,len=aBtns.length;i<len;i++){%>',
						'<li class="hui-tab-item">',
						'<%=aBtns[i].getHtml()%>',
						'</li>',
					'<%}%>',
				'</ul>',
				'<%=this.findHtml("$>TabItem>[xrole=\'content\']")%>',
			'</div>'
		],
		
		doConfig        : fDoConfig,           //初始化配置
		layout          : fLayout,             //布局
//		add             : fAdd,                //添加子组件
		setTabContent   : fSetTabContent       //设置标签页内容
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		//默认选中样式
		if(me.activeType){
			me.defItem.activeType=me.activeType;
		}
	}
	/**
	 * 布局
	 */
	function fLayout(){
		var me=this;
		var nLen=me.children.length;
		var width=Math.floor(100/nLen);
		me.find('.js-tab-btns>li').each(function(i,el){
			if(i<nLen-1){
				el.style.width=width+'%';
			}else{
				el.style.width=(100-width*(nLen-1))+'%';
			}
		});
	}
	/**
	 * 添加标签项
	 * @param {object|Array}item 标签项对象或标签项配置或数组
	 * @param {number=}nIndex 指定添加的索引，默认添加到最后
	 * @return {?Component} 添加的标签项只有一个时返回标签项对象，参数是数组时返回空
	 */
	function fAdd(item,nIndex){
		var me=this;
		if(me._applyArray()){
			return;
		}
		if(me.inited){
			var oUl=me.find('.js-tab-btns');
			var oRenderTo=$('<li class="hui-tab-item"></li>').appendTo(oUl);
			item.renderTo=oRenderTo;
		}
		me.callSuper();
	}
	/**
	 * 设置标签页内容
	 * @param {String}sContent 内容
	 * @param {number=}nIndex 索引，默认是当前选中的那个
	 */
	function fSetTabContent(sContent,nIndex){
		var me=this;
		nIndex=nIndex||me.getSelected(true);
		me.find('js-tab-content').index(nIndex).html(sContent);
	}
	
	return Tab;
	
});
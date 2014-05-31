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
		xConfig         : {
			cls             : 'tab'
//			theme           : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
			
		},
//		activeType      : '',           //激活样式类型，
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
			'<div>',
				'<ul class="js-tab-btns c-clear">',
					'{{placeItem > TabItem}}',
				'</ul>',
				'{{placeItem > TabItem > [xrole=content]}}',
			'</div>'
		].join(''),
		
		parseItem       : fParseItem,          //分析处理子组件 
		layout          : fLayout,             //布局
		setTabContent   : fSetTabContent       //设置标签页内容
	});
	/**
	 * 分析处理子组件
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		var me=this;
		//默认选中样式
		if(me.activeType){
			oItem.activeType=me.activeType;
		}
		me.callSuper();
	}
	/**
	 * 布局
	 */
	function fLayout(){
		var me=this;
		var nLen=me.children.length;
		var width=Math.floor(100/nLen);
		me.findEl('.js-tab-btns>li').each(function(i,el){
			if(i<nLen-1){
				el.style.width=width+'%';
			}else{
				el.style.width=(100-width*(nLen-1))+'%';
			}
		});
	}
	/**
	 * 设置标签页内容
	 * @param {String}sContent 内容
	 * @param {number=}nIndex 索引，默认是当前选中的那个
	 */
	function fSetTabContent(sContent,nIndex){
		var me=this;
		nIndex=nIndex||me.getSelected(true);
		me.findEl('.js-tab-content').index(nIndex).html(sContent);
	}
	
	return Tab;
	
});
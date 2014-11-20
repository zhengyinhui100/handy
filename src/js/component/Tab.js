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
			cls         : 'tab',
			direction   : 'h'
//			theme       : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
		},
//		activeType      : '',           //激活样式类型，
		slidable        : $H.mobile(),
		
		defItem         : {             //默认子组件是TabItem
//			content     : '',           //tab内容
			xtype       : 'TabItem'
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-tab-titles js-titles c-clear">',
					'{{placeItem > TabItem}}',
				'</div>',
				'<div class="hui-tab-contents js-contents">',
					'{{placeItem > TabItem > [xrole=content]}}',
				'</div>',
			'</div>'
		].join(''),
		
		doConfig        : fDoConfig,           //初始化配置
		parseItem       : fParseItem,          //分析处理子组件 
		getLayoutItems  : fGetLayoutItems,     //获取布局子元素
		getSelectedItem : fGetSelectedItem,    //获取当前选中的TabItem组件
		setTabContent   : fSetTabContent,      //设置标签页内容
		selectItem      : fSelectItem          //选中/取消选中
	});
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		if(me.slidable){
			var sContSel='.js-tab-content';
			me.listen({
				name:'touchstart',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					me.contentWidth=oEl.clientWidth;
					oEvt.preventDefault();
					oEvt = oEvt.touches[0];
					me.startX=oEvt.clientX;
					me.startY=oEvt.clientY;
					me.delX=0;
				}
			});
			me.listen({
				name:'touchmove',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					oEvt = oEvt.touches[0];
					var x=oEvt.clientX;
					var y=oEvt.clientY;
					var nDelX=x-me.startX;
					var nDelY=y-me.startY;
					//横向移动为主
					if(Math.abs(nDelX)>Math.abs(nDelY)){
						var nIndex=me.getSelected(true);
						//第一项不能向右滑动，最后一项不能向左滑动
						if(nIndex===0&&nDelX>0||nIndex===me.children.length-1&&nDelX<0){
							return;
						}
						var oBrother=me.children[nDelX>0?nIndex-1:nIndex+1];
						me.delX=nDelX;
						var nWidth=me.contentWidth;
						var oBrotherCmp=me.brotherCmp=oBrother.contentCmp;
						oBrother=oBrotherCmp.getEl()[0];
						oBrother.style.left=(nDelX>0?nDelX-nWidth:nWidth+nDelX)+'px';
						oBrotherCmp.show();
						oEl.style.left=nDelX+'px';
					}
				}
			});
			me.listen({
				name:'touchend',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					var nWidth=me.contentWidth;
					var nMin=nWidth/4;
					var nDelX=me.delX;
					var nIndex=me.getSelected(true);
					if(nDelX>nMin){
						//向右滑动
						me.onItemSelect(nIndex-1);
						oEl.style.left=nWidth+'px';
					}else if(nDelX<-nMin){
						//向左滑动
						me.onItemSelect(nIndex+1);
						oEl.style.left=-nWidth+'px';
					}else if(nDelX!==0){
						//移动距离很短，恢复原样
						oEl.style.left=0;
						me.brotherCmp.hide();
					}
				}
			});
		}
	}
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
	 * 获取布局子元素
	 * @return {object} 返回布局子元素
	 */
	function fGetLayoutItems(){
		return this.getEl().children('.js-titles').children('.js-item');
	}
	/**
	 * 获取当前选中的TabItem组件
	 * @return {Component} 返回当前选中的TabItem组件
	 */
	function fGetSelectedItem(){
		var me=this;
		nIndex=nIndex||me.getSelected(true);
		me.children[nIndex];
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
	/**
	 * 选中/取消选中
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		bSelect=bSelect!=false;
		if(bSelect&&oItem.contentCmp){
			oItem.contentCmp.getEl().css({
				left:0
			});
		}
		this.callSuper();
	}
	
	return Tab;
	
});
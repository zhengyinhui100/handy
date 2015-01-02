/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

define('C.Tab',
[
'L.Browser',
'B.Support',
'C.AbstractComponent',
'C.TabItem',
'C.ControlGroup'
],
function(Browser,Support,AC,TabItem,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	Tab.extend({
		//初始配置
		xConfig         : {
			cls         : 'tab',
			direction   : 'h'
//			theme       : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
		},
//		activeType      : '',           //激活样式类型，
		slidable        : Browser.mobile(),
		
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
		var aTrans3d=['translate3d(','px,0px,0px)'];
		var sTransform;
		if(me.slidable&&(sTransform=Support.ifSupportStyle('transform',aTrans3d[0]+0+aTrans3d[1]))){
			var _fTran=function(oEl,nPos){
				oEl.style[sTransform]=aTrans3d[0]+nPos+aTrans3d[1];
			}
			var sContSel='.js-tab-content';
			var oContEl;
			me.listen({
				name:'afterRender',
				custom:true,
				handler:function(){
					oContEl=me.findEl(sContSel).addClass('hui-ani-3d');
				}
			});
			me.listen({
				name:'touchstart',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					me.startTime=new Date().getTime();
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					me.contentWidth=oEl.clientWidth;
					oEvt = oEvt.touches[0];
					me.startX=oEvt.clientX;
					me.startY=oEvt.clientY;
					me.delX=0;
					oContEl.removeClass('hui-ani-150');
				}
			});
			me.listen({
				name:'touchmove',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					oTouch = oEvt.touches[0];
					var x=oTouch.clientX;
					var y=oTouch.clientY;
					var nDelX=x-me.startX;
					var nDelY=y-me.startY;
					//横向移动为主
					if(Math.abs(nDelX)>Math.abs(nDelY*5/4)){
						//TODO 不阻止默认事件的话，touchend不会触发，而是触发touchcancel
					    oEvt.preventDefault();
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
						_fTran(oBrother,(nDelX>0?nDelX-nWidth:nWidth+nDelX));
						oBrotherCmp.show();
						_fTran(oEl,nDelX);
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
					var nTime=new Date().getTime()-me.startTime;
					var nSpeed=nDelX/nTime;
					var bChange=nTime<500&&Math.abs(nDelX)>20;
					var nIndex=me.getSelected(true);
					oContEl.addClass('hui-ani-150');
					me.animating=true;
					setTimeout(function(){
						me.animating=false;
					},150);
					var oBrother=me.brotherCmp.getEl()[0];
					if(nDelX>nMin||bChange&&nDelX>0){
						//向右滑动
						_fTran(oEl,nWidth);
						_fTran(oBrother,0);
						me.onItemSelect(nIndex-1);
					}else if(nDelX<-nMin||bChange&&nDelX<0){
						//向左滑动
						_fTran(oEl,-nWidth);
						_fTran(oBrother,0);
						me.onItemSelect(nIndex+1);
					}else if(nDelX!==0){
						//移动距离很短，恢复原样
						_fTran(oEl,0);
						_fTran(oBrother,0);
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
		nIndex=me.getSelected(true);
		return me.children[nIndex];
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
		var me=this;
		bSelect=bSelect!=false;
		//动画过程中创建dom节点会卡，这里延迟选中（选中事件中伴有初始化组件操作）
		if(me.animating){
			setTimeout(function(){
				ControlGroup.prototype.selectItem.call(me,oItem,bSelect);
			},150);
		}else{
			me.callSuper();
		}
	}
	
	return Tab;
	
});
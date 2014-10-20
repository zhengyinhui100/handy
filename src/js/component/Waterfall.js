/**
 * 瀑布流类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-20
 */

$Define('C.Waterfall',
'C.AbstractComponent',
function(AC){
	
	var Waterfall=AC.define('Waterfall');
	
	Waterfall.extend({
		//初始配置
		xConfig             : {
			cls             : 'wfall'
		},
		
	    columnCount     : 0,    //列数
	    columnWidth     : 220,  //每列宽度
	    columnGap       : 15,   //每列间隔距离(PS：这里指定的是相邻两栏间隔的一半)
		
		listeners       : [{
			name:'resize',
			el:$(window),
			handler:function(){
				this.range();
			}
		},{
			name:'scroll',
			el:$(window),
			handler:function(){
				var me=this;
				var nScroll=document.documentElement.scrollTop || document.body.scrollTop;
				var nWinHeight=$(window).height();
				if((!me._lastScroll||Math.abs(me._lastScroll-nScroll)>150)&&nScroll+nWinHeight>me.height-50){
					var nIndex=me.children.length;
					me._lastScroll=nScroll;
					me.add(me.getMore());
					me.range(nIndex);
				}
			}
		}],
		
		doConfig        : fDoConfig,           //初始化配置
		range           : fRange               //计算并排列子组件
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.listen({
			name:'afterShow',
			custom:true,
			times:1,
			handler:function(){
				me.range();
			}
		});
		me.callSuper([oSettings]);
	}
	/**
	 * 计算并排列子组件
	 * @param {number=}nIndex 排序起始索引，默认是0
	 * @param {boolean=}bForce 强制排序
	 */
	function fRange(nIndex,bForce){
		var me=this;
		nIndex=nIndex||0;
		var nCGap=me.columnGap;
		var nCWidth=me.columnWidth;
		var num=me.columnCount;
		var aChildren=me.children;
		var aHeights=me.columnHeights;
		var nContainerHeight=0;
		//计算列数
		if(nIndex===0||bForce){
			var nWidth=me.getEl()[0].offsetWidth;
			num=Math.floor(nWidth/(nCWidth+nCGap*2));
			//列数不变不需修改
			if((num===me.columnCount||num===0)&!bForce){
				return;
			}
			me.columnCount=num;
			aHeights=me.columnHeights=[];
			for(var i=0;i<num;i++){
				aHeights.push(0);
			}
		}
		
		for(var i=nIndex,len=aChildren.length;i<len;i++){
			var oItem=aChildren[i];
			var nMin=0;
			for(var j=1,l=num;j<l;j++){
				if(aHeights[nMin]>aHeights[j]){
					nMin=j;
				}
			}
			var nLeft=nCGap+nMin*(nCWidth+nCGap*2);
			var nTop=nCGap+aHeights[nMin];
			var oEl=oItem.getEl();
			oEl.css({
				left:nLeft,
				top:nTop
			});
			var h=aHeights[nMin]=nTop+oEl[0].offsetHeight+nCGap;
			nContainerHeight=nContainerHeight>h?nContainerHeight:h;
			me.height=nContainerHeight;
		}
		me.getEl().css({height:me.height});
	}
	
	return Waterfall;
	
});
/**
 * 拖拽效果类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.effect.Draggable"
$Define('E.Draggable',
'B.Class',
function(){
	
	var Draggable=$H.createClass();
	
	var _events=$H.hasTouch()?['touchstart','touchmove','touchend']:['mousedown','mousemove','mouseup'];
	
	$H.extend(Draggable.prototype,{
		initialize        : fInitialize,        //初始化
		start             : fStart,             //开始
		move              : fMove,              //移动
		end               : fEnd,               //结束
		destroy           : fDestroy            //销毁
	});
	/**
	 * 初始化
	 * @param {string|element|jquery}el 需要拖拽效果的节点
	 * @param {object}oOptions 选项{
	 * 		{boolean=}preventDefault:true,false表示不阻止默认事件
	 * 		{function(}start:开始移动时的回调函数
	 * 		{function({object}oPos)}move:移动时的回调函数
	 * 		{function(}end:结束移动时的回调函数
	 * }
	 */
	function fInitialize(el,oOptions) {
		var me = this;
		me.options=oOptions||{};
		var oEl =me.el= $(el);
		var fHandler=me.startHandler=function(oEvt){
			me.start(oEvt);
		};
		oEl.on(_events[0],fHandler);
		fHandler=me.moveHandler=function(oEvt){
			me.move(oEvt);
		};
		oEl.on(_events[1],fHandler);
		fHandler=me.endHandler=function(oEvt){
			me.end(oEvt);
		};
		oEl.on(_events[2],fHandler);
	}
	/**
	 * 开始
	 * @param {jEvent}oEvt 事件对象
	 */
	function fStart(oEvt) {
		var me=this;
		me.drag=true;
		if($H.hasTouch()){
			//zepto.js event对象就是原生事件对象
			oEvt = oEvt.originalEvent||oEvt;
			oEvt = oEvt.touches[0];
		}
		me.eventX=oEvt.clientX;
		me.eventY=oEvt.clientY;
		var oEl=me.el[0];
		var left=oEl.style.left||0;
		if($H.isStr(left)){
			left=parseInt(left.replace('px',''));
		}
		me.elX=left;
		var top=oEl.style.top||0;
		if($H.isStr(top)){
			top=parseInt(top.replace('px',''));
		}
		me.elY=top;
		var oOptions=me.options;
		oOptions.start&&oOptions.start.call(me);
	}
	/**
	 * 移动
	 * @param {jEvent}oEvt 事件对象
	 */
	function fMove(oOrigEvt) {
		var me=this;
		//阻止滚动页面或原生拖拽
		if(me.options.preventDefault!==false){
			oOrigEvt.preventDefault();
		}
		if(me.drag===true){
			if($H.hasTouch()){
				oEvt = oOrigEvt.originalEvent||oOrigEvt;
				oEvt = oEvt.touches[0];
			}else{
				oEvt= oOrigEvt;
			}
			var nOffsetX=oEvt.clientX-me.eventX;
			var nOffsetY=oEvt.clientY-me.eventY;
			var oEl=me.el[0];
			var left=me.elX+nOffsetX;
			var top=me.elY+nOffsetY;
			var oOptions=me.options;
			var result=oOptions.move&&oOptions.move({
				origX:me.elX,
				origY:me.elY,
				curX:left,
				curY:top,
				offsetX:nOffsetX,
				offsetY:nOffsetY
			},oOrigEvt);
			if(result!==false){
				oEl.style.left=(result&&result.curX||left)+'px';
				oEl.style.top=(result&&result.curY||top)+'px';
			}
		}
	}
	/**
	 * 结束
	 */
	function fEnd(){
		var me=this;
		me.drag=false;
		var oOptions=me.options;
		oOptions.end&&oOptions.end();
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		var oEl=me.el;
		oEl.off(_events[0],me.startHandler);
		oEl.off(_events[1],me.moveHandler);
		oEl.off(_events[2],me.endHandler);
	}
	
	return Draggable;
	
});
/**
 * 抽象事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-20
 */
//"handy.common.AbstractEvents"
$Define('CM.AbstractEvents',
function(){
	
	var AbstractEvents=$H.createClass();
	
	$H.extend(AbstractEvents.prototype,$H.Events);
	
	$H.extend(AbstractEvents.prototype,{
		_eventCache   : {},              //自定义事件池
		_listenTo     : [],              //存储对其它对象的监听
		listenTo      : fListenTo,       //监听指定对象的事件
		unListenTo    : fUnListenTo      //移除对其它对象的监听
	});
	/**
	 * 监听指定对象的事件
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * 其余参数同base.Events.on
	 */
	function fListenTo(oTarget,name,fHandler,context,nTimes){
		var me=this;
		var fCall=me._delegateHandler(fHandler);
		me._listenTo.push({
			target:oTarget,
			name:name,
			delegation:fCall,
			handler:fHandler
		});
		oTarget.on(name,fCall,context||me,nTimes);
	}
	/**
	 * 移除对其它对象的监听
	 * @param {CM.AbstractEvents|string}oTarget 参数对象，继承自AbstractEvents的实例对象，
	 * 							也可以传入'all'，表示移除所有监听
	 * 其余参数同base.Events.off
	 */
	function fUnListenTo(oTarget,name,fHandler){
		var aListenTo=this._listenTo;
		var bAll=oTarget=='all';
		var oListenTo;
		for(var i=0,len=aListenTo.length;i<len;i++){
			oListenTo=aListenTo[i];
			if(bAll||(oListenTo.name==name&&oListenTo.handler==fHandler&&oListenTo.target==oTarget)){
				oTarget.off(name,oListenTo.delegation);
				aListenTo.splice(i,1);
			}
		}
	}
	
	return AbstractEvents;
});
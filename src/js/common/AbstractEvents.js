/**
 * 抽象事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-20
 */
//"handy.common.AbstractEvents"
define('CM.AbstractEvents',
['B.Object','B.Class','B.Event'],
function(Obj,Class,Event){
	
	var AbstractEvents=Class.createClass();
	
	Obj.extend(AbstractEvents.prototype,Event);
	
	Obj.extend(AbstractEvents.prototype,{
//		_eventCache          : {},                     //自定义事件池
//		_execEvtCache        : [],                     //待执行事件队列
//		_listenTo            : [],                     //存储对其它对象的监听
		initialize           : fInitialize,            //初始化
		_parseListenToEvents : _fParseListenToEvents,  //处理对象类型或者空格相隔的多事件
		listenTo             : fListenTo,              //监听指定对象的事件
		unlistenTo           : fUnlistenTo             //移除对其它对象的监听
	});
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me._eventCache={};
		me._execEvtCache=[];
		me._listenTo=[];
	}
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @method _parseListenToEvents(sMethod,name[,param,..])
	 * @param {string}sMethod 调用的方法名
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {*=}param 附加参数，具体参照对应的方法
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseListenToEvents(sMethod,oTarget,name,param){
		var me=this;
		var aArgs=Obj.toArray(arguments,3);
		return me._parseEvents(name,function(aParams){
			aParams.unshift(oTarget);
			me[sMethod].apply(me,aParams.concat(aArgs));
		});
	}
	/**
	 * 监听指定对象的事件
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * 其余参数同base.Events.on
	 */
	function fListenTo(oTarget,name,fHandler,context,nTimes){
		var me=this;
		if(me._parseListenToEvents('listenTo',oTarget,name,fHandler,context,nTimes)){
			return;
		}
		if(typeof context=='number'){
			nTimes=context;
			context=null;
		}
		context=context||me;
		var fCall=me._delegateHandler(fHandler,context);
		me._listenTo.push({
			target:oTarget,
			name:name,
			delegation:fCall,
			handler:fHandler
		});
		oTarget.on(name,fCall,context,nTimes);
	}
	/**
	 * 移除对其它对象的监听
	 * @param {CM.AbstractEvents|string}oTarget 参数对象，继承自AbstractEvents的实例对象，
	 * 							也可以传入'all'，表示移除所有监听
	 * 其余参数同base.Events.off
	 */
	function fUnlistenTo(oTarget,name,fHandler){
		var me=this;
		if(me._parseListenToEvents('unlistenTo',oTarget,name,fHandler)){
			return;
		}
		var aListenTo=me._listenTo;
		var bAll=oTarget=='all';
		Obj.each(aListenTo,function(i,oListenTo){
			if(bAll||(oListenTo.name==name&&oListenTo.handler==fHandler&&oListenTo.target==oTarget)){
				oListenTo.target.off(oListenTo.name,oListenTo.delegation);
				aListenTo.splice(i,1);
			}
		})
	}
	
	return AbstractEvents;
});
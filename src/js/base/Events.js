/**
 * 自定义事件类，事件名称支持'all'表示所有事件，支持复杂形式：'event1 event2'或{event1:func1,event:func2}，
 * 事件名称支持命名空间(".name")，如：change.one
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Events',function($H){
	
	var Events={
		_eventCache        : {},                   //自定义事件池
		_parseEvents       : _fParseEvents,        //分析事件对象
		_parseCustomEvents : _fParseCustomEvents,  //处理对象类型或者空格相隔的多事件
		_delegateHandler   : _fDelegateHandler,    //统一代理回调函数
		on                 : fOn,                  //添加事件
		once               : fOnce,                //监听一次
		off                : fOff,                 //移除事件
		suspend            : fSuspend,             //挂起事件
		resume             : fResume,              //恢复事件
		trigger            : fTrigger              //触发事件
	};
	
	/**
	 * 分析事件对象
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {Function}fCall({Array}aParams) 回调函数，参数aParams是事件名和事件函数，如果aParams长度为1则表示没有事件函数
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseEvents(name,fCall){
		var me=this;
		var rSpace=/\s+/;
		if(typeof name=='object'){
			for(var key in name){
				fCall([key,name[key]]);
			}
			return true;
		}else if(typeof name=='string'&&rSpace.test(name)){
			//多个空格相隔的事件
			var aName=name.split(rSpace);
			for(var i=0,len=aName.length;i<len;i++){
				fCall([aName[i]]);
			}
			return true;
		}
		return false;
	}
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @method _parseCustomEvents(sMethod,name[,param,..])
	 * @param {string}sMethod 调用的方法名
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {*=}param 附加参数，具体参照对应的方法
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseCustomEvents(sMethod,name,param){
		var me=this;
		var aArgs=$H.toArray(arguments,2);
		return me._parseEvents(name,function(aParams){
			me[sMethod].apply(me,aParams.concat(aArgs));
		});
	}
	/**
	 * 统一代理回调函数
	 * @param {Function}fHandler 回调函数
	 * @param {*=}context 事件函数执行上下文，默认是this
	 * @return {Function} 返回代理函数
	 */
	function _fDelegateHandler(fHandler,context){
		var me=this;
		return function(){
			if(me.isSuspend!=true){
				return fHandler.apply(context||me,arguments);
			}
		};
	}
	/**
	 * 添加事件
	 * @method on(name,fHandler[,context,nTimes])如果第三个参数是整形，则它表示执行次数，此时，context为空
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}，
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {Function=}fHandler 事件函数
	 * @param {*=}context 事件函数执行上下文，默认是this
	 * @param {number=}nTimes 执行次数，默认无限次
	 */
	function fOn(name,fHandler,context,nTimes){
		var me=this;
		if(me._parseCustomEvents('on',name,fHandler,context,nTimes)){
			return;
		}
		if(typeof context=='number'){
			nTimes=context;
			context=null;
		}
		var oCache=me._eventCache;
		var aCache=oCache[name];
		if(!aCache){
			aCache=oCache[name]=[];
		}
		var fCall=me._delegateHandler(fHandler,context);
		aCache.push({
			times:nTimes,
			handler:fHandler,
			context:context,
			delegation:fCall
		});
	}
	/**
	 * 监听一次
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {function=}fHandler 事件函数
	 * @param {*=}context 事件函数执行上下文，默认是this
	 */
	 function fOnce(name,fHandler,context){
	 	var me=this;
	 	var aArgs=$H.toArray(arguments);
	 	me.on.apply(me,aArgs.push(1));
	 }
	/**
	 * 移除事件
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {function=}fHandler 事件函数，如果此参数为空，表示删除指定事件名下的所有函数
	 * @param {boolean} true表示删除成功，false表示失败
	 */
	function fOff(name,fHandler){
		var me=this;
		//移除所有事件
		if(name=="all"){
			me._eventCache={};
			return true;
		}
		if(me._parseCustomEvents('off',name,fHandler)){
			return;
		}
		var oCache=me._eventCache;
		//处理命名空间名称，如:name=="change"，则要移除所有change及change.one，而".one"则要移除所有.one结尾的事件
		var nIndex=name.indexOf('.');
		if(!fHandler&&nIndex<=0){
			for(var key in oCache){
				//key=change.one匹配change或.one
				if(key.split('.')[0]==name||(nIndex==0&&key.indexOf(name)>=0)){
					delete oCache[key];
				}
			}
			return true;
		}
		
		//移除简单事件
		var aCache=oCache[name];
		if(!aCache){
			return false;
		}
		if(!fHandler){
			delete oCache[name];
			return true;
		}else{
			for(var i=0,len=aCache.length;i<len;i++){
				if(aCache[i].handler==fHandler){
					aCache.splice(i,1);
					return true;
				}
			}
		}
		return false;
	}
	/**
	 * 触发事件
	 * @method trigger(name[,data,..])
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {*}data 传递参数
	 * @return {*}只是返回最后一个函数的结果，复杂格式事件不返回
	 */
	function fTrigger(name,data){
		var me=this;
		var aNewArgs=$H.toArray(arguments);
		aNewArgs.unshift('trigger');
		if(me._parseCustomEvents.apply(me,aNewArgs)){
			return;
		}
		var oCache=me._eventCache;
		var aArgs=$H.toArray(arguments,1);
		var result,aCache;
		//内部函数，执行事件队列
		function _fExec(aCache){
			if(!aCache){
				return;
			}
			for(var i=0,len=aCache.length;i<len;i++){
				var oEvent=aCache[i];
				var fDelegation=oEvent.delegation;
				//控制执行次数
				if(typeof oEvent.times=='number'){
					if(oEvent.times>1){
						oEvent.times--;
					}else{
						me.off(key,oEvent.handler);
					}
				}
				//只是返回最后一个函数的结果
				result=fDelegation.apply(null,aArgs);
			}
		}
		//带命名空间的事件只需执行自身事件
		if(name.indexOf(".")>0){
			aCache=oCache[name];
			_fExec(aCache);
		}else{
			//change或者.one类型需要匹配所有符合的事件
			for(var key in oCache){
				//处理命名空间名称，如:name=="change"，则要移除所有change及change.one，而".one"则要移除所有.one结尾的事件
				var nIndex=name.indexOf('.');
				//key=change.one匹配change或.one
				if(key.split('.')[0]==name||(nIndex==0&&key.indexOf(name)>=0)){
					aCache=oCache[key];
					_fExec(aCache);
				}
			}
		}
		//all事件
		_fExec(oCache['all']);
		return result;
	}
	/**
	 * 挂起事件
	 * @method suspend
	 * @return {boolean=}如果已经挂起了，则直接返回false
	 */
	function fSuspend(){
		var me=this;
		//已经挂起，直接退回
		if(me.isSuspend){
			return false;
		}
		me.isSuspend=true;
	}
	/**
	 * 恢复事件
	 * @method resume
	 * @return {boolean=}如果已经恢复了，则直接返回false
	 */
	function fResume(){
		var me=this;
		//已经恢复，直接退回
		if(!me.isSuspend){
			return false;
		}
		me.isSuspend=false;
	}
	
	return Events;
});
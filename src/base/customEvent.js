/**
 * 事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('CustomEvent',["Object"],function($){
	
	var Object=$.Object;

	var CustomEvent=Object.createClass();
	
	Object.extend(CustomEvent.prototype,{
		initialize                     : fInitialize,                  //初始化自定义事件
		preventDefault                 : fPreventDefault,              //停止事件默认行为
		stopPropagation                : fStopPropagation,             //停止事件冒泡
		stopImmediatePropagation       : fStopImmediatePropagation,    //当前节点开始立即停止事件冒泡
		isDefaultPrevented             : _fReturnFalse,                //是否停止了事件默认行为
		isPropagationStopped           : _fReturnFalse,                //是否停止了冒泡
		isImmediatePropagationStopped  : _fReturnFalse                 //是否当前节点停止了冒泡
	});
	
	//返回false
	function _fReturnFalse() {
		return false;
	}
	
	//返回true
	function _fReturnTrue() {
		return true;
	}
	
	/**
	 * 初始化自定义事件
	 * @method initialize(src[, oProps])
	 * @param {event|string}src 事件对象或者事件类型
	 * @param {Object}oProps (可选)要扩展的属性
	 */
	function fInitialize(src, oProps){
		var that=this;
		//允许不用new关键字
		if ( !(that instanceof jQuery.Event) ) {
			return new jQuery.Event( src, props );
		}

		// src是事件对象
		if ( src && src.type ) {
			that.originalEvent = src;
			that.type = src.type;

			// 修正冒泡过程中被修改的值
			that.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
				src.getPreventDefault && src.getPreventDefault() ) ? _fReturnTrue : _fReturnFalse;

		// src是事件类型
		} else {
			that.type = src;
		}

		// 扩展属性
		if ( props ) {
			Object.extend( that, props );
		}

		that.timeStamp = src && src.timeStamp || jQuery.now();

		//标记为fixed事件
		that[ $.expando ] = true;
	}
	/**
	 * 停止事件默认行为
	 * @method preventDefault
	 */
	function fPreventDefault() {
		var that=this;
		that.isDefaultPrevented = _fReturnTrue;

		var originalEvent = that.originalEvent;
		if ( !originalEvent ) {
			return;
		}

		if ( originalEvent.preventDefault ) {
			originalEvent.preventDefault();
		} else {
			originalEvent.returnValue = false;
		}
	}
	/**
	 * 停止事件冒泡
	 * @method stopPropagation
	 */
	function fStopPropagation() {
		var that=this;
		that.isPropagationStopped = _fReturnTrue;

		var originalEvent = that.originalEvent;
		if ( !originalEvent ) {
			return;
		}
		if ( originalEvent.stopPropagation ) {
			originalEvent.stopPropagation();
		}
		originalEvent.cancelBubble = true;
	}
	/**
	 * 当前节点开始立即停止事件冒泡
	 * @method stopImmediatePropagation
	 */
	function fStopImmediatePropagation() {
		var that=this;
		that.isImmediatePropagationStopped = _fReturnTrue;
		that.stopPropagation();
	}
	
	return CustomEvent;
	
})
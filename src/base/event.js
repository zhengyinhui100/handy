/**
 * 事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Event',['CustomEvent','Data'],function($){
	
	var Data=$.Data,
	
		rHoverHack = /(?:^|\s)hover(\.\S+|)\b/,
		rTypeNamespace = /^([^\.]*|)(?:\.(.+)|)$/;
	
	var Event={
		_hoverHack            : _fHoverHack,  //hover纠正
		listen                : fListen,      //封装原生绑定事件方法，ps:一般不推荐使用
		unlisten              : fUnlisten,    //封装原生移除事件方法，ps:一般不推荐使用
		add                   : fAdd,         //添加事件
		remove                : fRemove,      //移除事件
		trigger               : fTrigger,     //触发事件
		dispatch              : fDispatch,    //事件委派
		special				  : {             //特殊事件
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			
			focus: {
				delegateType: "focusin"
			},
			blur: {
				delegateType: "focusout"
			},
			
			beforeunload: {
				setup: function( data, namespaces, eventHandle ) {
					// We only want to do this special case on windows
					if ( $.Util.isWindow( this ) ) {
						this.onbeforeunload = eventHandle;
					}
				},
				
				teardown: function( namespaces, eventHandle ) {
					if ( this.onbeforeunload === eventHandle ) {
						this.onbeforeunload = null;
					}
				}
			}
		}
	};
	/**
	 * hover纠正
	 * @method _fHoverHack
	 * @param {string} sEvents 事件类型
	 */
	function _fHoverHack( sEvents ) {
		return this.special.hover ? sEvents : sEvents.replace( rHoverHack, "mouseenter$1 mouseleave$1" );
	}
	/**
	 * 监听事件
	 * @method _fListen
	 * @param {object} oElement 事件的源对象
	 * @param {string} sName 事件名称
	 * @param {function()} fObserver 绑定的方法
	 * @param {boolean} bUseCapture 是否捕获
	 */
	function fListen(oElement, sName, fObserver, bUseCapture) {
		if (oElement.addEventListener) {
			oElement.addEventListener(sName, fObserver, bUseCapture);
		}else if(oElement.attachEvent){
			oElement.attachEvent('on' + sName, fObserver);
		}
	}
	/**
	 * 移除事件监听
	 * @method fUnlisten
	 * @param {object} oElement 事件的源对象
	 * @param {string} sName 事件名称
	 * @param {function} fObserver 绑定的方法
	 * @param {boolean} bUseCapture 是否捕获
	 * @return {void}
	 */
	function fUnlisten(oElement, sName, fObserver, bUseCapture) {
		if(oElement.removeEventListener){
			oElement.removeEventListener(sName, fObserver, bUseCapture);
		}else if(oElement.detachEvent){
			var sName = "on" + sName;
			if ( oElement.detachEvent ) {
				// 避免自定义事件在IE6-8下引起内存泄露，
				if ( typeof oElement[ sName ] === "undefined" ) {
					oElement[ sName ] = null;
				}
				oElement.detachEvent(sName, fObserver);
			}
		}
	}
	/**
	 * 添加事件监听
	 * @method add
	 * @param {object}param 参数{
	 * 		{element} element 事件的源对象
	 * 		{string} type 事件类型，多个事件之间用空格分开
	 * 		{function} handler 绑定的方法
	 * 		{any} data 绑定的数据
	 * 		{string} selector 选择符
	 * }
	 * @return {void}
	 */
	function fAdd(oParam){
		var that=this,
			eElem=oParam.element,
			sTypes=oParam.type, 
			fHandler=oParam.handler, 
			data=oParam.data, 
			sSelector=oParam.selector,
			elemData;
		//文本/注释节点、不能绑定数据的节点，不能添加事件
		if ( !sTypes || !fHandler ||eElem.nodeType === 3 || eElem.nodeType === 8 || !(elemData=Data.data( eElem ))) {
			return;
		}
		//添加uuid，查找和删除时用到
		if ( !fHandler.guid ) {
			fHandler.guid = jQuery.guid++;
		}
		var oEvents = elemData.events;
		if ( !oEvents ) {
			elemData.events = oEvents = {};
		}
		var fEventHandle = elemData.handle;
		if ( !fEventHandle ) {
			elemData.handle = fEventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof $ !== "undefined" && (!e || that.triggered !== e.type) ?
					that.dispatch.apply( fEventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			fEventHandle.elem = eElem;
		}
		// 处理命名空间
		// $(...).bind("mouseover mouseout", fn);
		var aTypes = $.String.trim( that._hoverHack(sTypes) ).split( " " );
		for ( t = 0; t < aTypes.length; t++ ) {

			aTypeNamespace = rTypeNamespace.exec( aTypes[t] ) || [];
			var sType = aTypeNamespace[1];
			namespaces = ( aTypeNamespace[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ sType ] || {};

			// If selector defined, determine special event api type, otherwise given type
			sType = ( selector ? special.delegateType : special.bindType ) || sType;

			// Update special based on newly reset type
			special = jQuery.event.special[ sType ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: sType,
				origType: aTypeNamespace[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ sType ];
			if ( !handlers ) {
				handlers = events[ sType ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( sType, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + sType, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ sType ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	}
	/**
	 * 移除事件监听
	 * @method remove
	 * @param {object} oElement 事件的源对象
	 * @param {string} sName 事件名称
	 * @param {function} fObserver 绑定的方法
	 * @param {boolean} bUseCapture 是否捕获
	 * @return {void}
	 */
	function fRemove(){
		var t, aTypeNamespace, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );
	
		if ( !elemData || !(events = elemData.events) ) {
			return;
		}
	
		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			aTypeNamespace = rTypeNamespace.exec( types[t] ) || [];
			type = origType = aTypeNamespace[1];
			namespaces = aTypeNamespace[2];
	
			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}
	
			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
	
			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];
	
				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );
	
					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}
	
			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}
	
				delete events[ type ];
			}
		}
	
		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
	
			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	}
	
	function fTrigger(){
		
	}
	function fDispatch(){
		
	}
	
	
	return Event;
	
})
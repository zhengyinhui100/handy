/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("c.ComponentManager", function() {

	var CM = $HO.createClass(),
	_expando = $H.expando+"_cmp_",             // 组件id前缀
	//存储组件类
	_types={},
	//存储所有组件实例
	_all={};
	
	//全局快捷别名
	$C=CM;

	// 静态方法
	$HO.extend(CM, {
		init          : fInit,            //初始化
		registerType  : fRegisterType,    //注册组件类
		getClass      : fGetClass,        //根据xtype获取组件类
		register      : fRegister,        //注册组件
		unregister    : fUnRegister,      //注销组件
		eachInEl      : fEachInEl,        //遍历指定节点里的所有组件
		afterRender   : fAfterRender,     //调用指定dom节点包含的组件的afterRender方法
		destroy       : fDestroy,         //销毁组件，主要用于删除元素时调用
		generateId    : fGenerateId,      //生成组件的id
		get           : fGet              //根据id或cid查找组件
	});
	
	//初始化监听document上的remove事件
	CM.init();
	
	/**
	 * 初始化
	 * @method init
	 */
	function fInit(){
		//监听afterRender自定义事件，调用相关组件的afterRender方法
		$HL.add("afterRender",function(oEl){
			//调用包含的组件的afterRender方法
			CM.afterRender(oEl);
		})
		//监听removeEl自定义事件，jQuery的remove方法被拦截(base/adapt.js)，执行时先触发此事件
		$HL.add('removeEl',function(oEl){
			//销毁包含的组件
			CM.destroy(oEl);
		})
	}
	/**
	 * 注册组件类型
	 * @method registerType
	 * @param {string}sXType 组件类型
	 * @param {object}oClass 组件类
	 */
	function fRegisterType(sXtype,oClass){
		_types[sXtype]=oClass;
		oClass.prototype.xtype=sXtype;
		//快捷别名
		$C[sXtype]=oClass;
	}
	/**
	 * 根据xtype获取组件类
	 * @method getClass
	 * @param {string}sXType 组件类型
	 * @return {object} 返回对应的组件类
	 */
	function fGetClass(sXtype){
		return _types[sXtype];
	}
	/**
	 * 注册组件
	 * @method register
	 * @param {object}oComponent 组件对象
	 */
	function fRegister(oComponent){
		_all[oComponent.getId()]=oComponent;
	}
	/**
	 * 注销组件
	 * @method unRegister
	 * @param {object}oComponent 组件对象
	 */
	function fUnRegister(oComponent){
		delete _all[oComponent.getId()];
	}
	/**
	 * 遍历指定节点里的所有组件
	 * @method eachInEl
	 * @param {jQuery}oEl 指定的节点
	 * @param {function(Component)}fCall
	 */
	function fEachInEl(oEl,fCall){
		//获取组件el
		var oCmpEl=oEl.find('.js-component');
		oCmpEl.each(function(i,oEl){
			oEl=$(oEl);
			var sId=oEl.attr('id');
			var oCmp=CM.get(sId);
			fCall(oCmp);
		})
	}
	/**
	 * 调用指定dom节点包含的组件的afterRender方法
	 * @method afterRender
	 * @param {jQuery}oEl 指定的节点
	 */
	function fAfterRender(oEl){
		CM.eachInEl(oEl,function(oCmp){
			//只需要调用祖先组件，后辈的方法会通过callChild调用
			if(!oCmp.parent){
				oCmp.afterRender();
			}
		});
	}
	/**
	 * 销毁组件，主要用于删除元素时调用
	 * @method destroy
	 * @param {jQuery}oRemoveEl 需要移除组件的节点
	 */
	function fDestroy(oRemoveEl){
		CM.eachInEl(oRemoveEl,function(oCmp){
			//只需要调用祖先组件，后辈的方法会通过callChild调用
			if(!oCmp.parent){
				oCmp.destroy(true);
			}
		});
	}
	/**
	 * 生成组件的id
	 * @method generateId
	 * @param {string=}sCid 组件的cid
	 * @param {boolean=}bNotChk 仅当为true时不检查id是否重复
	 */
	function fGenerateId(sCid,bNotChk){
		var sId=_expando+(sCid||$H.Util.getUuid());
		if(bNotChk!=true&&_all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找组件
	 * @method get
	 * @param {string}sId 组件id或者cid
	 */
	function fGet(sId){
		return _all[sId]||_all[CM.generateId(sId,true)];
	}

	return CM;
	
});
/**
 * handy 基本定义
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
(function(){
	
	var _handy = window.handy,
	_$ = window.$,
	
	handy=window.handy=window.$H=function(selector,context){
		//return new handy.Element(selector,context);
	};
	
	
	handy.version    = '1.0.0';    //版本号
	handy.isDebug    = typeof gEnv=='undefined'?false:gEnv=='dev';     //是否是调试状态
	handy.expando    = ("handy-" +  handy.version).replace(/\./g,'_');    //自定义属性名
	handy.base={};
	handy.add        = fAdd;            //添加子模块
	handy.noConflict = fNoConflict;     //处理命名冲突
	handy.noop       = function(){};    //空函数
	
	
	/**
	 * 添加子模块
	 * @method add
	 * @param {string}sName 模块名称
	 * @param {Object=}aRequires 模块依赖资源
	 * @param {function|object}factory 模块功能定义
	 */
	function fAdd(sName,aRequires,factory){
		if(!factory){
			factory=aRequires;
			aRequires=null;
		}
		var oModule=factory;
		if(typeof factory==='function'){
			var args=[];
			if(aRequires){
				if(typeof aRequires=="string"){
					args.push(handy.base.Object.ns(aRequires));
				}else{
					for(var i=0;i<aRequires.length;i++){
						args.push(handy.base.Object.ns(aRequires[i]));
					}
				}
			}
			oModule=factory.apply(window,args);
		}
		handy.base[sName]=handy[sName]=oModule;
		for(var method in oModule){
			//!Function[method]专为bind方法
			if(handy.isDebug&&typeof handy[method]!="undefined"&&('console' in window)&&!Function[method]){
				console.log(handy[method]);
				console.log(sName+"命名冲突:"+method);
			}
			handy[method]=oModule[method];
		}
	}
	/**
	 * 处理命名冲突
	 * @method noConflict
	 * @param {boolean}isDeep 是否处理window.handy冲突
	 * @retrun {Object}handy 返回当前定义的handy对象
	 */
	function fNoConflict( isDeep ) {
		if ( window.$ === handy ) {
			window.$ = _$;
		}

		if ( isDeep && window.handy === handy ) {
			window.handy = _handy;
		}

		return handy;
	}
	
})();
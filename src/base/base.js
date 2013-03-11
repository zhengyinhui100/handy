/**
 * HANDY 基本定义
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
(function(){
	
	var _HANDY = window.HANDY,
	_$ = window.$,
	
	HANDY=window.HANDY=window.$=function(selector,context){
		//return new HANDY.Element(selector,context);
	};
	
	
	HANDY.version    = '1.0.0';    //版本号
	HANDY.expando    = "handy" + ( HANDY.version + Math.random() ).replace( /\D/g, "" );    //自定义属性名
	HANDY.add        = fAdd;            //添加子模块
	HANDY.noConflict = fNoConflict;   //处理命名冲突
	
	/**
	 * 添加子模块
	 * @method add
	 * @param {string}sName 模块名称
	 * @param {Object=}aRequires 模块依赖资源
	 * @param {function(Object):*}fDefined 模块功能定义
	 */
	function fAdd(sName,aRequires,fDefined){
		if(!fDefined){
			fDefined=aRequires;
			aRequires=null;
		}
		if(!aRequires||!HANDY.Loader||true){
			HANDY[sName]=fDefined(HANDY);
		}else{
			HANDY.Loader.require(aRequires,function(){
				HANDY[sName]=fDefined(HANDY);
			});
		}
	}
	/**
	 * 处理命名冲突
	 * @method noConflict
	 * @param {boolean}isDeep 是否处理window.HANDY冲突
	 * @retrun {Object}HANDY 返回当前定义的HANDY对象
	 */
	function fNoConflict( isDeep ) {
		if ( window.$ === HANDY ) {
			window.$ = _$;
		}

		if ( isDeep && window.HANDY === HANDY ) {
			window.HANDY = _HANDY;
		}

		return HANDY;
	}
	
})();

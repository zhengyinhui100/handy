/**
 * handy 基本定义
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
(function(){
	
	var _handy = window.handy,
	_$ = window.$,
	
	handy=window.handy=window.$=function(selector,context){
		//return new handy.Element(selector,context);
	};
	
	
	handy.version    = '1.0.0';    //版本号
	handy.expando    = "handy" + ( handy.version + Math.random() ).replace( /\D/g, "" );    //自定义属性名
	handy.add        = fAdd;            //添加子模块
	handy.noConflict = fNoConflict;   //处理命名冲突
	
	
	/**
	 * 添加子模块
	 * @method add
	 * @param {string}sName 模块名称
	 * @param {Object=}aRequires 模块依赖资源
	 * @param {function(Object):*}fDefined 模块功能定义
	 */
	function fAdd(sName,aRequires,fDefined,dds){
		if(!fDefined){
			fDefined=aRequires;
			aRequires=null;
		}
		//TODO 由于Loader可能还未定义，这里特殊处理，以后考虑将Loader单独抽出来
		if(!aRequires||!handy.Loader){
			if(!handy.base){
				handy.base={};
			}
			var args=[];
			if(aRequires){
				if(typeof aRequires=="string"){
					args.push(handy.base.Object.namespace(aRequires));
				}else{
					for(var i=0;i<aRequires.length;i++){
						args.push(handy.base.Object.namespace(aRequires[i]));
					}
				}
			}
			args.push(handy);
			handy.base[sName]=handy[sName]=fDefined.apply(window,args);
		}else{
			handy.Loader.require(aRequires, function() {
				Array.prototype.push.call(arguments, handy);
				handy.base[sName] = handy[sName] = fDefined.apply(window,arguments);
			});
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
	
})()
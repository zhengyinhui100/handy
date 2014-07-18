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
	handy.isDebug    = typeof gEnv=='undefined'?false:gEnv=='dev';     //是否是调试状态
	handy.expando    = ("handy-" +  handy.version).replace(/\./g,'_');    //自定义属性名
	handy.add        = fAdd;            //添加子模块
	handy.noConflict = fNoConflict;     //处理命名冲突
	handy.noop       = function(){};    //空函数
	
	
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
		if(true||!aRequires||!handy.Loader){
			if(!handy.base){
				handy.base={};
			}
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
			args.push(handy);
			var oModule=fDefined.apply(window,args);
			handy.base[sName]=handy[sName]=oModule;
			if('Browser,Class,Array,Geo,Cookie,Date,Events,Function,Json,Object,String,Template,Util,Url'.indexOf(sName)>=0){
				for(var key in oModule){
					//!Function[key]专为bind方法
					if(handy.isDebug&&typeof handy[key]!="undefined"&&('console' in window)&&!Function[key]){
						console.log(handy[key]);
						console.log(sName+"命名冲突:"+key);
					}
					handy[key]=oModule[key];
				}
			}
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
	
})();
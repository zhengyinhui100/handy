/**
 * handy 基本定义
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
(function(){
	
	var oWin=window,
	_handy = oWin.handy,
	_$ = oWin.$,
	handy=oWin.handy=oWin.$H=function(selector,context){
		//return new handy.base.Element(selector,context);
	};
	
	handy.version    = '1.0.0';    //版本号
	handy.isDebug    = typeof gEnv=='undefined'?false:gEnv=='dev';     //是否是调试状态
	handy.expando    = ("handy-" +  handy.version).replace(/\./g,'_');    //自定义属性名
	handy.base={};
	handy.noConflict = fNoConflict;     //处理命名冲突
	handy.noop       = function(){};    //空函数
	handy._alias     = {                //存储别名，公共库建议大写，以便更好地与普通名称区别开，具体项目的别名建议小写
		'B'             : 'handy.base',
		'C'             : 'handy.component',
		'M'             : 'handy.module',
		'U'             : 'handy.util',
		'E'             : 'handy.effect',
		'CM'            : 'handy.common',
		'D'             : 'handy.data',
		'V'             : 'handy.view',
		'P'             : 'handy.plugin'
	};              
	handy.ns         = fNamespace;    //创建或读取命名空间，可以传入用以初始化该命名空间的对象
	handy.alias      = fAlias;        //创建别名/读取实名
	handy.generateMethod = fGenerateMethod   //归纳生成方法
	oWin.define=handy.add = fAdd;            //添加子模块
	
	/**
	 * 处理命名冲突
	 * @method noConflict
	 * @param {boolean}isDeep 是否处理window.handy冲突
	 * @retrun {Object}handy 返回当前定义的handy对象
	 */
	function fNoConflict( isDeep ) {
		if ( oWin.$ === handy ) {
			oWin.$ = _$;
		}

		if ( isDeep && oWin.handy === handy ) {
			oWin.handy = _handy;
		}

		return handy;
	}
	/**
    * 创建或读取命名空间
    * @method ns (sPath,obj=)
    * @param {string}sPath 命名空间路径字符串
    * @param {*=}obj (可选)用以初始化该命名空间的对象，不传表示读取命名空间
    * @return {?*} 返回该路径的命名空间，不存在则返回undefined
    */
	function fNamespace(sPath,obj){
		var oObject=null, j, aPath, root,bIsCreate,len; 
		//尝试转换别名
		sPath=handy.alias(sPath);
        aPath=sPath.split(".");  
        root = aPath[0]; 
        bIsCreate=arguments.length==2;
        if(!bIsCreate){
        	oObject=oWin[root];
        }else{
        	oObject=oWin[root]||(oWin[root]={});
        }
        //循环命名路径
        for (j=1,len=aPath.length; j<len; ++j) { 
        	//obj非空
        	if(j==len-1&&bIsCreate){
        		oObject[aPath[j]]=obj;
        	}else if(bIsCreate||(oObject&&oObject[aPath[j]])){
	            oObject[aPath[j]]=oObject[aPath[j]]||{};  
        	}else{
        		return;
        	}
            oObject=oObject[aPath[j]];  
        } 
        
        //base库特殊处理，直接添加到handy下
		var sBase='handy.base.';
		if(bIsCreate&&sPath.indexOf(sBase)===0){
			$H.add(sPath.replace(sBase,''),oObject);
		}
    	return oObject;
	}
	/**
	 * 创建别名/读取实名，别名没有对应的存储空间，需要先转换为原始名字才能获取对应的存储空间，
	 * Loader自动会优先尝试转换别名，因此，别名不能与现有的命名空间重叠
	 * @method alias
	 * @param {string||object=}sAlias 别名，如'B.Namespace'，为空时表示读取所有存储的别名，也可以传入hash对象,{sAlias:sOrig}
	 * @param {string=}sOrig 原名，如'handy.base.Object'，为空时表示读取实名
	 */
	function fAlias(sAlias,sOrig){
		if(typeof sAlias==='object'){
			for(var k in sAlias){
				handy.alias(k,sAlias[k]);
			}
			return;
		}
		var oAlias=handy._alias;
		//创建别名
		if(sOrig){
			if(oAlias[sAlias]){
				$D.error('别名已被使用'+sAlias+':'+oAlias[sAlias]);
			}else{
				oAlias[sAlias]=sOrig;
			}
		}else if(sAlias){
			//转换别名
			var sName=sAlias,nIndex=sAlias.length,sSuffix='';
			do{
				//找到别名返回实名
				if(oAlias[sName]){
					return oAlias[sName]+sAlias.substring(nIndex);
				}
				//截掉最后一截再尝试
				nIndex=sName.lastIndexOf('.');
			}while(nIndex>0&&(sName=sName.substring(0,nIndex)))
			return sAlias;
		}else{
			return oAlias;
		}
	}
	/**
    * 归纳生成类方法
    * @method generateMethod
    * @param {Object}oTarget 需要生成方法的对象
    * @param {Array.<string>}aMethod 需要生成的方法列表
    * @param {function()}fDefined 方法定义函数，该函数执行后返回方法定义
    * @return {Array} 返回转换后的数组
    */
    function fGenerateMethod(oTarget,aMethod,fDefined){
    	for ( var i = 0; i < aMethod.length; i++ ){
			var sMethod = aMethod[i];
			oTarget[sMethod] = fDefined(sMethod);
    	}
    }
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
					args.push(handy.ns(aRequires));
				}else{
					for(var i=0;i<aRequires.length;i++){
						args.push(handy.ns(aRequires[i]));
					}
				}
			}
			args.push(handy);
			oModule=factory.apply(oWin,args);
		}
		handy.base[sName]=handy[sName]=oModule;
		for(var method in oModule){
			//!Function[method]专为bind方法
			if(handy.isDebug&&typeof handy[method]!="undefined"&&('console' in oWin)&&!Function[method]){
				console.log(handy[method]);
				console.log(sName+"命名冲突:"+method);
			}
			handy[method]=oModule[method];
		}
	}
	
})();
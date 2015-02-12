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
	
	handy.extend = fExtend;
	var sVersion='1.0.0';
	var sEnv=typeof gEnv=='undefined'?'online':gEnv;
	fExtend(handy,{
		version    : sVersion,    //版本号
		env        : sEnv,        //默认是线上环境
		isDev    : sEnv=='dev',                              //是否是开发环境
		isTest     : sEnv=='test',                             //是否是测试环境
		isOnline   : sEnv=='online',                           //是否是线上环境
		expando    : ("handy-" +  sVersion).replace(/\./g,'_'), //自定义属性名
		base       : {},
		noConflict : fNoConflict,     //处理命名冲突
		noop       : function(){},    //空函数
		_alias     : {                //存储别名，公共库建议大写，以便更好地与普通名称区别开，具体项目的别名建议小写
			'L'             : 'handy.loader',
			'B'             : 'handy.base',
			'C'             : 'handy.component',
			'M'             : 'handy.module',
			'U'             : 'handy.util',
			'E'             : 'handy.effect',
			'CM'            : 'handy.common',
			'D'             : 'handy.data',
			'V'             : 'handy.view',
			'P'             : 'handy.plugin'
		},              
		ns         : fNamespace,    //创建或读取命名空间，可以传入用以初始化该命名空间的对象
		alias      : fAlias,        //创建别名/读取实名
		generateMethod : fGenerateMethod   //归纳生成方法
	});
	oWin.define=handy.add = fAdd;            //添加子模块
	
	/**
	 * @param {Object} oDestination 目标对象
	 * @param {Object} oSource 源对象
	 * @return {Object} 扩展后的对象
	*/
	function fExtend(oDestination,oSource){
		for(var k in oSource){
			oDestination[k]=oSource[k];
		}
		return oDestination;
	}
	/**
	 * 处理命名冲突
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
    * @param {string|object}path 命名空间路径字符串或对{string}path:路径}，
    * 				传入对象表示传入的是实际路径，不需要再执行alias去获取实际路径，节省开销
    * @param {*=}obj (可选)用以初始化该命名空间的对象，不传表示读取命名空间
    * @return {?*} 返回该路径的命名空间，不存在则返回undefined
    */
	function fNamespace(path,obj){
		var oObject=null, j, aPath, root,bIsCreate,len; 
		if(path.path){
			path=path.path;
		}else{
			//尝试转换别名
			path=handy.alias(path);
		}
        aPath=path.split(".");  
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
        
//        //base库特殊处理，直接添加到handy下
//		var sBase='handy.base.';
//		if(bIsCreate&&path.indexOf(sBase)===0){
//			handy.add(path.replace(sBase,''),oObject);
//		}
    	return oObject;
	}
	/**
	 * 创建别名/读取实名，别名没有对应的存储空间，需要先转换为原始名字才能获取对应的存储空间，
	 * Loader自动会优先尝试转换别名，因此，别名不能与现有的命名空间重叠
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
			var sName=sAlias,nIndex=sAlias.length,sResult;
			do{
				//找到别名返回实名
				if(oAlias[sName]){
					//缓存并返回找到的实名
					sResult=oAlias[sName]+sAlias.substring(nIndex);
					oAlias[sAlias]||(oAlias[sAlias]=sResult);
					return sResult;
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
		handy.ns(sName,oModule);
		return;
		//将base库里的所有方法挂载到handy下方便使用
		for(var method in oModule){
			//!Function[method]专为bind方法
			if(handy.isDev&&typeof handy[method]!="undefined"&&('console' in oWin)&&!Function[method]){
				console.log(handy[method]);
				console.log(sName+"命名冲突:"+method);
			}
			handy[method]=oModule[method];
		}
	}
	
})();
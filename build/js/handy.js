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
/**
 * Json类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
 //参考：https://github.com/douglascrockford/JSON-js/blob/master/json2.js
 //https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/JSON
handy.add('Json',function(){
	
	var Json={
		stringify   : fStringify,    //序列化，将json对象转化为字符串
		parseJson   : fParseJson     //将字符串转化为json对象
	}
	
	var _bNativeJson='JSON' in window,
        _replacer,   //替换参数
        gap,         //
        _indent,     //缩进
        
        //在一些特殊情况原生方法会出错，所以这里不管JSON是否有原生方法，都声明以下变量，以便后续可以强制使用自定义方法转换
		//匹配控制符、引号、反斜杠等不能在引号内的内容
		_rEscapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    //不合法字符替换表
		_oMeta = {
	        '\b': '\\b',
	        '\t': '\\t',
	        '\n': '\\n',
	        '\f': '\\f',
	        '\r': '\\r',
	        '"' : '\\"',
	        '\\': '\\\\'
	    },
	    _rCx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    _rValidchars = /^[\],:{}\s]*$/,
	    _rValidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	    _rValidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	    _rValidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	
    /**
     * 在字符串两端添加引号
     * @param {string}sStr 参数字符串
     * @param {string} 返回添加好引号的结果
     */
    function _fQuote(sStr) {
		//每次执行须重置查找索引
        _rEscapable.lastIndex = 0;
        if(_rEscapable.test(sStr)){
        	//替换不能直接加引号的内容(控制符、引号、反斜杠)
        	sStr= sStr.replace(_rEscapable, function (a) {
	            var c = _oMeta[a];
	            return typeof c === 'string'? c
	                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        });
        }
        return  '"' + sStr + '"';
    }
    /**
     * 将对象指定键的值转化为字符串
     * @param {string}sKey
     * @param {Array|Object}holder
     * @return {string}
     */
    function _fToString(sKey, holder) {
        var i,k,val, length,
            mind = gap,
            aResult,
            value = holder[sKey];
		//如果对象有toJSON接口，使用该接口生成的返回值
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(sKey);
        }
		//执行替换函数(如果有的话)
        if (typeof _replacer === 'function') {
            value = _replacer.call(holder, sKey, value);
        }

        switch (typeof value) {
	        case 'undefined':
	            return 'undefined';
	        case 'string':
	            return _fQuote(value);
	        case 'number':
	        	//无穷大的数字转换为null
	            return isFinite(value) ? String(value) : 'null';
	        case 'boolean':
	        case 'null':
	        	//typeof null=='object'，而不是'null',这里只是为了将来可能修正的情况
	            return String(value);
	        case 'object':
	        	//value==null
	            if (!value) {
	                return 'null';
	            }
	            gap += _indent;
	            aResult = [];
	
	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                	//对每个元素递归调用
	                    aResult[i] = _fToString(i, value) || 'null';
	                }
	                val = aResult.length === 0? '[]'
	                    : gap? '[\n' + gap + aResult.join(',\n' + gap) + '\n' + mind + ']'
	                    : '[' + aResult.join(',') + ']';
	                gap = mind;
	                return val;
	            }
	
				//如果替换参数是数组，只检出此数组中包含的key
	            if (_replacer && typeof _replacer === 'object') {
	                length = _replacer.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof _replacer[i] === 'string') {
	                        k = _replacer[i];
	                        val = _fToString(k, value);
	                        if (val) {
	                            aResult.push(_fQuote(k) + (gap ? ': ' : ':') + val);
	                        }
	                    }
	                }
	            } else {
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        val = _fToString(k, value);
	                        if (val) {
	                            aResult.push(_fQuote(k) + (gap ? ': ' : ':') + val);
	                        }
	                    }
	                }
	            }
	
	            val = aResult.length === 0
	                ? '{}'
	                : gap
	                ? '{\n' + gap + aResult.join(',\n' + gap) + '\n' + mind + '}'
	                : '{' + aResult.join(',') + '}';
	            gap = mind;
	            return val;
        }
    }
    /**
     * 序列化，将json对象转化为字符串
     * @param {*}value 参数对象
     * @param {function(key,value)|Array}replacer 如果是函数，第一个参数为，返回
     * @param {string|number}space 间隔符，可以更好的可视化结果，如果是数字，则间隔符为指定个数的空格
     * @param {boolean=}bNotNative true表示强制不使用原生的JSON方法，在一些特殊情况原生方法会出错(如：space="&nbsp;")
     * @return {string} 返回序列化的字符串
     */
	function fStringify(value, replacer, space , bNotNative) {
		if(_bNativeJson&&!bNotNative){
			return JSON.stringify.apply(null,arguments);
		}
        var i;
        gap = '';
        _indent = '';
        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                _indent += ' ';
            }

        } else if (typeof space === 'string') {
            _indent = space;
        }

        _replacer = replacer;
        //替换参数只能是函数或者数组
        if (replacer && typeof replacer !== 'function' &&
            (typeof replacer !== 'object' ||
            typeof replacer.length !== 'number')) {
            $D.error(new Error('Json.stringify:替换参数只能是函数或者数组'));
            return;
        }
        return _fToString('', {'': value});
    }
    /**
     * 将字符串转化为json对象
     * @param {string}sText 参数字符串
     * @param {Function=} 一个转换结果的函数。 将为对象的每个成员调用此函数。 如果成员包含嵌套对象，则先于父对象转换嵌套对象。 
     * 					对于每个成员，会发生以下情况：
     * 						如果 reviver 返回一个有效值，则成员值将替换为转换后的值。
     * 						如果 reviver 返回它接收的相同值，则不修改成员值。
     * 						如果 reviver 返回 null 或 undefined，则删除成员。
     * @param {boolean=}bNotNative true表示强制不使用原生的JSON方法
     * @return {Object} 返回json对象
     */
	function fParseJson(sText, fReviver,bNotNative) {
		if(_bNativeJson&&!bNotNative){
			return JSON.parse.apply(null,arguments);
		}
        var j;
        function _fReviver(holder, key) {
            var k, val, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        val = _fReviver(value, k);
                        if (val !== undefined) {
                            value[k] = val;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return fReviver.call(holder, key, value);
        }

        sText = String(sText);
        _rCx.lastIndex = 0;
        if (_rCx.test(sText)) {
            sText = sText.replace(_rCx, function (a) {
                return '\\u' +
                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }

        if (_rValidchars.test(sText.replace(_rValidescape, '@')
            .replace(_rValidtokens, ']')
            .replace(_rValidbraces, ''))) {
            j = eval('(' + sText + ')');
            return typeof fReviver === 'function'
                ? _fReviver({'': j}, '')
                : j;
        }
        $D.error(new SyntaxError('JSON.parse'));
    }
	
	return Json;
});
/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Object',function(){
	
	var oWin=window;
	var wObject=oWin.Object;
	
	var Object={
		_alias              : {                 //存储别名，公共库建议大写，以便更好地与普通名称区别开，具体项目的别名建议小写
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
		ns                  : fNamespace,       //创建或读取命名空间，可以传入用以初始化该命名空间的对象
		alias               : fAlias,           //创建别名/读取实名
		extend              : fExtend,          //对象的属性扩展，可以自定义选项
		extendIf            : fExtendIf,        //对象的属性扩展，不覆盖原有属性
		mix                 : fMix,             //自定义的继承方式，可以继承object和prototype，prototype方式继承时，非原型链方式继承。
		isNum               : fIsNum,           //是否是数字
		isStr               : fIsStr,           //是否是字符串
		isBool              : fIsBool,          //是否是布尔类型
		isSimple            : fIsSimple,        //是否是基本类型：string/number/boolean
		isUndef             : fIsUndef,         //是否未定义
		isFunc		    	: fIsFunc,	        //判断对象是否是函数
		isArr				: fIsArr,    		//判断对象是否是数组
		isObj               : fIsObj,           //是否是对象
		isClass             : fIsClass,         //判断对象是否是类
		isInstance          : fIsInstance,      //判断对象是否是类的实例
		equals				: fEquals, 		    //对象对比，对比每一个值是否相等
		clone				: fClone,			//对象复制
		isEmpty				: fIsEmpty, 		//判断对象是否为空
		each				: fEach, 			//遍历对象
		contains            : fContains,        //是否包含指定属性/数组元素
		largeThan           : fLargeThan,       //是否大于另一个对象|数组（包含另一个对象的所有属性或包含另一个数组的所有元素）
		count				: fCount,			//计算对象长度
		removeUndefined     : fRemoveUndefined, //移除undefined的元素或属性
		toArray				: fToArray(),       //将类数组对象转换为数组，比如arguments, nodelist
		fromArray           : fFromArray,       //将元素形如{name:n,value:v}的数组转换为对象
		generateMethod      : fGenerateMethod   //归纳生成类方法
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
		sPath=Object.alias(sPath);
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
	 * @param {string||object=}sAlias 别名，如'B.Object'，为空时表示读取所有存储的别名，也可以传入hash对象,{sAlias:sOrig}
	 * @param {string=}sOrig 原名，如'handy.base.Object'，为空时表示读取实名
	 */
	function fAlias(sAlias,sOrig){
		if(typeof sAlias==='object'){
			for(var k in sAlias){
				Object.alias(k,sAlias[k]);
			}
			return;
		}
		var oAlias=Object._alias;
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
    * 对象的属性扩展，可以自定义选项
    * @method extend(oDestination, oSource , oOptions=)
    * @param {Object} oDestination 目标对象
    * @param {Object} oSource 源对象
    * @param {Object=} oOptions(可选){
    * 				{array=}cover 仅覆盖此参数中的属性
    * 				{boolean=|array=|function(sprop)=}notCover 不覆盖原有属性/方法，当此参数为true时不覆盖原有属性；当此参数为数组时，
    * 					仅不覆盖数组中的原有属性；当此参数为函数时，仅当此函数返回true时不执行拷贝，PS：不论目标对象有没有该属性
    * 				{boolean=}isClone 克隆，仅当此参数为true时克隆
    * 					源对象的修改不会导致目标对象也修改
    * }
    * @return {Object} 扩展后的对象
    */
    function fExtend(oDestination, oSource, oOptions) {
    	if(!oSource||Object.isStr(oSource)||Object.isNum(oSource)){
    		return oDestination;
    	}
    	var notCover=oOptions?oOptions.notCover:false;
    	var aCover=oOptions?oOptions.cover:null;
    	var bIsClone=oOptions?oOptions.IsClone:false;
    	oDestination=oDestination||{};
    	//如果是类扩展，添加方法元数据
    	var oConstructor=oDestination.constructor;
    	var bAddMeta=oConstructor.$isClass;
    	var value;
        for (var sProperty in oSource) {
        	value=oSource[sProperty];
        	//仅覆盖oOptions.cover中的属性
        	if(!aCover||Object.contains(aCover,sProperty)){
	        	//不复制深层prototype
	        	if(oSource.hasOwnProperty(sProperty)){
		        	var bHas=oDestination.hasOwnProperty(sProperty);
		        	var bNotCover=notCover===true?bHas:false;
		        	//当此参数为数组时，仅不覆盖数组中的原有属性
		        	if(Object.isArr(notCover)){
		        		bNotCover=Object.contains(notCover,sProperty)&&bHas;
		        	}else if(Object.isFunc(notCover)){
		        		//当此参数为函数时，仅当此函数返回true时不执行拷贝，PS：不论目标对象有没有该属性
		        		bNotCover=notCover(sProperty,value);
		        	}
		            if (!bNotCover) {
		            	var value=bIsClone?Object.clone(value):value;
		            	//为方法添加元数据：方法名和声明此方法的类
						if(bAddMeta&&Object.isFunc(value)&&!value.$name){
							value.$name=sProperty;
							value.$owner=oConstructor;
						}
						oDestination[sProperty] = value;
		            }
	        	}
        	}
        }
        return oDestination;
    };
    /**
     * 对象的属性扩展，不覆盖原有属性
     * @param {Object} oDestination 目标对象
     * @param {Object} oSource 源对象
     */
    function fExtendIf(oDestination,oSource){
    	return Object.extend(oDestination,oSource,{notCover:true});
    }
    /**
    * 自定义的继承方式，可以继承object和prototype，prototype方式继承时，非原型链方式继承。
	* 如需原型链方式继承使用Object.inherit。
	* 此继承方式的继承的对象可以是对普通对象或者是prototype对象，并且可以实现多重继承
    * @param {Object} oChild 子对象
    * @param {Object} oParent 父对象
    * @param {Object} oExtend 扩展的属性方法
    * @param {Object} oPrototypeExtend 扩展的prototype属性方法
    * @return {Object} 扩展后的类
    */
    //TODO 重写
    function fMix(oChild, oParent, oExtend, oPrototypeExtend) {
        if (!oChild.superProto) {
            oChild.superProto = {};
        }
        for (var sProperty in oParent) {
            if(Object.isFunc(oParent[sProperty])){// 如果是方法
                if(!oChild.superProto[sProperty]){// superProto里面没有对应的方法，直接指向父类方法
                    oChild.superProto[sProperty] = oParent[sProperty];
                }else{// superProto里有对应方法，需要新建一个function依次调用
                    var _function = oChild.superProto[sProperty];
                    oChild.superProto[sProperty] = function (_property, fFunc) {
						return function () {
							fFunc.apply(this, arguments);
							oParent[_property].apply(this, arguments);
						};
                    }(sProperty, _function);
                }
            }else{// 类属性，直接复制
                oChild.superProto[sProperty] = oParent[sProperty];
            }
            if(!oChild[sProperty]){// 子类没有父类的方法或属性，直接拷贝
                oChild[sProperty] = oParent[sProperty];
            }
        }
        if (oExtend) {
            Object.extend(oChild, oExtend);
        }
        // toString 单独处理
        if (oParent.toString != oParent.constructor.prototype.toString) {
            oChild.superProto.toString = function () {
                oParent.toString.apply(oChild, arguments);
            };
        }
        if (oPrototypeExtend && oChild.prototype && oParent.prototype) {
            //Object.inherit(oChild, oParent,null, oPrototypeExtend);
        }
        return oChild;
    };
    /**
     * 是否是数字
     * @param {*}obj 参数对象
     * @return {boolean} true表示是数字
     */
    function fIsNum(obj){
    	return typeof obj=='number';
    }
    /**
     * 是否是字符串
     * @param {*}obj 参数对象
     * @return {boolean} true表示是字符串
     */
    function fIsStr(obj){
    	return typeof obj=='string';
    }
    /**
     * 是否是布尔类型
     * @param {*}obj 参数对象
     * @return {boolean} true表示是布尔类型
     */
    function fIsBool(obj){
    	return typeof obj=='boolean';
    }
    /**
     * 是否是基本类型：string/number/boolean
     * @param {*}obj 参数对象
     * @return {boolean} true表示是基本类型
     */
    function fIsSimple(obj){
    	return Object.isStr(obj)||Object.isNum(obj)||Object.isBool(obj);
    }
    /**
     * 是否未定义
     * @param {*}obj 参数对象
     * @return {boolean} true表示未定义
     */
    function fIsUndef(obj){
    	return typeof obj=='undefined';
    }
    /**
    * 对象是否是函数类型
    * @method isFunc
    * @param {Object} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsFunc(obj) {
        return wObject.prototype.toString.call(obj) === "[object Function]";
    }
    /**
    * 对象是否是数组类型
    * method isArr
    * @param {Object} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsArr(obj) {
        return wObject.prototype.toString.call(obj) === "[object Array]";
    }
    /**
     * 是否是对象
     * @param {*}obj 参数对象
     * @return {boolean} true表示是对象类型
     */
    function fIsObj(obj){
    	return typeof obj=='object'&&!Object.isArr(obj);
    }
    /**
     * 判断对象是否是类
     * @param {*}obj 参数对象
     * @return {boolean} true表示参数对象是类
     */
    function fIsClass(obj){
    	return Object.isFunc(obj)&&obj.$isClass===true;
    }
    /**
     * 判断对象是否是类的实例
     * @param {*}obj 参数对象
     * @return {boolean} true表示参数对象是类的实例
     */
    function fIsInstance(obj){
    	return obj&&obj.constructor&&obj.constructor.$isClass===true;
    }
    /**
    * 对比对象值是否相同
    * @method equals
    * @param {Object} o1 对象1
    * @param {Object} o2 对象2
    * @param {boolean=}bStrict 仅当为true时表示严格对比，包括类型和值，
    * 						   不为true时，转换成字符串时相等即返回true，如：1和"1"、true和"true"
    * @return {boolean} 返回判断结果
    */
    function fEquals(o1, o2,bStrict) {
        //判断类型
        if (typeof (o1) == typeof (o2)) {
            //判断非对象类型
            if (typeof (o1) != "object") {
                //恒等
                return o1 === o2;
                //对象类型判断
            } else {
                //两个对象有相同的引用
                if (o1 === o2) {
                    return true;
                    //两个对象引用不同，循环判断他们的值是否相同
                } else {
                    //数组判断
                    if (Object.isArr(o1) && Object.isArr(o2)) {
                        //数组长度不相等，不相等
                        if (o1.length != o2.length) {
                            return false;
                        }
                        for (var i = 0, m = o1.length; i < m; i++) {
                            if (!Object.equals(o1[i], o2[i])) {
                                return false;
                            }
                        }
                        return true;
                        //对象判断
                    } else if (!Object.isArr(o1) && !Object.isArr(o2)) {
                    	//对象属性项不一样
                    	if(Object.count(o1)!=Object.count(o2)){
                    		return false;
                    	}
                        for (var sKey in o1) {
                            if (o2[sKey] === undefined) {
                                return false;
                            }
                            if (!Object.equals(o1[sKey], o2[sKey])) {
                                return false;
                            }
                        }
                        return true;
                        //一个是数组，一个是非数组，不相等
                    } else {
                        return false;
                    }
                }
            }
            //类型不一样，不相等
        } else {
        	if(bStrict!==true&&Object.isSimple(o1)&&Object.isSimple(o2)&&(o1+''===o2+'')){
        		return true;
        	}
            return false;
        }
    }
	/**
    * clone一个对象
    * @method clone
    * @param {Object} oFrom 需要clone的对象
    * @return {Object} 返回克隆的对象，如果对象属性不支持克隆，将原来的对象返回
    */
	function fClone(oFrom){
		if(oFrom == null || typeof(oFrom) != 'object'){
			return oFrom;
		}else{
			var Constructor = oFrom.constructor;
			if (Constructor != wObject && Constructor != oWin.Array){
				return oFrom;
			}else{

				if (Constructor == oWin.Date || Constructor == oWin.RegExp || Constructor == oWin.Function ||
					Constructor == oWin.String || Constructor == oWin.Number || Constructor == oWin.Boolean){
					return new Constructor(oFrom);
				}else{
					try{
						var oTo = new Constructor(); // changed

						for(var key in oFrom){
							oTo[key] = Object.clone(oFrom[key]);
						}
						return oTo;
					}catch(exp){
						return oFrom;
					}
				}
			}
		}
	}
    /**
    * 对象是否是空
    * @method isEmpty
    * @param {Object}object 参数对象
    * @return {boolean} 返回判断结果
    */
    function fIsEmpty(object) {
        if (Object.isArr(object)) {
            return object.length == 0;
        } else {
            for (var k in object) {
                return false;
            }
            return true;
        }
    }
    /**
    * 遍历对象
    * @method each
    * @param {*}object 参数对象
    * @param {function}fCallback 回调函数:fCallback(property,value)|fCallback(args)this=value,返回false时退出遍历
    * @param {*}args  回调函数的参数
    */
    function fEach(object, fCallback, args) {
    	if(!object){
    		return;
    	}
    	var sName, i = 0,
			nLength = object.length,len,
			bIsObj = nLength === undefined || Object.isFunc( object );
		if ( args ) {
			if ( bIsObj ) {
				for ( sName in object ) {
					if ( fCallback.apply( object[ sName ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < nLength; ) {
					if ( fCallback.apply( object[ i ], args ) === false ) {
						break;
					}
					//这里可能fCallback里进行了删除操作
					len=object.length;
					if(nLength==len){
						i++;
					}else{
						nLength=len;
					}
				}
			}
		//call性能会明显高于apply，因此，一般情况(没有传args)下，使用call
		} else {
			if ( bIsObj ) {
				for ( sName in object ) {
					if ( fCallback.call( object[ sName ], sName, object[ sName ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < nLength; ) {
					if ( fCallback.call( object[ i ], i, object[ i ] ) === false ) {
						break;
					}
					//这里可能fCallback里进行了删除操作
					len=object.length;
					if(nLength==len){
						i++;
					}else{
						nLength=len;
					}
				}
			}
		}
		return object;
    }
    /**
     * 是否包含指定属性/数组元素
     * @method contains 
     * @param {*}obj 指定对象
     * @param {*}prop 指定属性/数组元素
     * @return {boolean} 包含则返回true
     */
    function fContains(obj,prop){
    	if(!obj){
    		return false;
    	}
    	var bIsContain=false;
    	Object.each(obj,function(i,p){
    		if(Object.equals(p,prop)){
    			bIsContain=true;
    			return false;
    		}
    	});
    	return bIsContain;
    }
    /**
     * 是否大于另一个对象|数组（包含另一个对象的所有属性或包含另一个数组的所有元素）
     * @method largeThan
     * @param {Object|Array}o1 要比较的对象
     * @param {Object|Array}o2 比较的对象
     */
    function fLargeThan(o1,o2){
    	if(typeof o1=='object'&&typeof o2=='object'){
    		var bResult=true;
    		Object.each(o2,function(p,v){
    			if(!Object.equals(o2[p],o1[p])){
    				return bResult=false;
    			}
    		});
    		return bResult;
    	}
    }
    /**
    * 计算对象长度
    * @method count
    * @param {Object}oParam 参数对象
    * @return {number} 返回对象长度
    */
    function fCount(oParam) {
        if (Object.isArr(oParam)) {
            return oParam.length;
        } else {
	        var nCount = 0;
            for (var k in oParam) {
                nCount++;
            }
	        return nCount;
        }
    }
    /**
     * 移除undefined的元素或属性
     * @param {Object|Array}obj 参数对象
     * @param {boolean=}bNew 是否新建结果对象，不影响原对象
     * @param {Object|Array} 返回结果
     */
    function fRemoveUndefined(obj,bNew){
    	var bIsArray=Object.isArr(obj);
    	if(bNew){
    		if(bIsArray){
    			var aResult=[];
    			Object.each(obj,function(k,value){
		    		if(value!==undefined){
		    			aResult.push(value);
		    		}
	    		});
	    		return aResult;
    		}else{
	    		return Object.extend({},obj,{
	    			isClone:true,
	    			notCover:function(k,value){
	    				return value===undefined;
	    		}});
    		}
    	}else{
	    	Object.each(obj,function(k,value){
	    		if(value===undefined){
	    			if(bIsArray){
	    				obj.splice(k,1);
	    			}else{
	    				delete obj[k];
	    			}
	    		}
	    	});
	    	return obj;
    	}
    }
    /**
    * 将类数组对象转换为数组，比如arguments, nodelist
    * @method toArray(oParam,nStart=,nEnd=)
    * @param {Object}oParam 参数对象
    * @param {number=}nStart 起始位置
    * @param {number=}nEnd   结束位置
    * @return {Array} 返回转换后的数组
    */
    function fToArray(){
    	var aMatch=oWin.navigator.userAgent.match(/MSIE ([\d.]+)/);
    	if(aMatch&&parseInt(aMatch[0])<9){
    		//IE9以下，由于nodeList不是javascript对象，使用slice方法会抛异常，这里使用循环
    		return function(oParam,nStart,nEnd){
    			var aReturn = [];
    			if (oParam.length) {
    				for (var i = nStart||0,m = nEnd||oParam.length; i < m; i++) {
    					aReturn.push(oParam[i]);
    				}
    			}
    			return aReturn;
    		}
    	}else{
    		return function(oParam,nStart,nEnd){
    			return Array.prototype.slice.call(oParam,nStart||0,nEnd||oParam.length);
    		}
    	}
    }
    /**
     * 将元素形如{name:n,value:v}的数组转换为对象
     * @param {Array}aParam 参数数组
     */
    function fFromArray(aParam){
    	var oResult={};
    	for(var i=0,len=aParam.length;i<len;i++){
    		var oItem=aParam[i];
    		oResult[oItem.name]=oItem.value;
    	}
    	return oResult;
    }
    /**
    * 归纳生成类方法
    * @method generateMethod
    * @param {Object}oTarget 需要生成方法的对象
    * @param {string|Array.<string>}method 需要生成的方法列表，如果是字符串，用","作为分隔符
    * @param {function()}fDefined 方法定义函数，该函数执行后返回方法定义
    * @return {Array} 返回转换后的数组
    */
    function fGenerateMethod(oTarget,method,fDefined){
    	var aMethod=Object.isArr(method)?method:method.split(",");
    	for ( var i = 0; i < aMethod.length; i++ ){
			var sMethod = aMethod[i];
			oTarget[sMethod] = fDefined(sMethod);
    	}
    }
	
	return Object;
	
});
/**
 * 浏览器环境类，分析浏览器类型、版本号、操作系统、内核类型、壳类型、flash版本
 * 浏览器版本，$H.Browser.ie/firefox/chrome/opera/safari(),如果浏览器是IE的，$H.Browser.ie()的值是浏览器的版本号，!$H.Browser.ie()表示非IE浏览器
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Browser","handy.base.Object",function(Object){

	var _oInfo={};
	
	var Browser={};
	
	//归纳生成方法，如：Browser.ie()返回ie的版本号(默认返回整型，传入true参数时返回实际版本号，如：'20.0.1132.43')，Browser.windows()返回是否是windows系统
	Object.generateMethod(Browser,[
			'ie','firefox','chrome','safari','opera','weixin',  //浏览器版本，@return{number|string}
			'windows','linux','mac',                    //操作系统，@return{boolean}
			'trident','webkit','gecko','presto',        //浏览器内核类型，@return{boolean}
			'sogou','maxthon','tt','theWorld','is360',  //浏览器壳类型，@return{boolean}
			'mobile',                                   //移动设备类型，@return{string}'ios'|'android'|'nokian'|'webos'
			'android','ios',                            //android或者ios版本，@return{string}
			'iPhone','iPod','iPad',                     //ios设备版本，@return{string}
			'tablet',                                   //是否是平板电脑
			'phone',                                    //是否是手机
			'hasTouch',                                 //是否是触摸设备
			'flash'                                     //flash版本，@return{string}
		],
		function(sName){
			return function(bNotInt){
				var sValue=_oInfo[sName];
				return !bNotInt&&typeof sValue==='string'&&/^[\d\.]+$/.test(sValue)?parseInt(sValue):sValue;
			}
		}
	);
		
	/**
	 * 初始化
	 * @method _fInit
	 */
	function _fInit(){
		var userAgent = window.navigator.userAgent;
		_fParseBrowser(userAgent);
		_fParseOs(userAgent);
	    _fParseKernel(userAgent);
		_fParseShell(userAgent);
		_fParseMobile(userAgent);
		_fParseFlash();
		if("ontouchend" in document){
			_oInfo.hasTouch=true;
		}
	}
	/**
	 * 分析浏览器类型及版本
	 * @method _fParseBrowser
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseBrowser(userAgent){
		var ua =userAgent;
		var matcher;
		// 使用正则表达式在userAgent中提取浏览器版本信息
		(matcher = ua.match(/MSIE ([\d.]+)/)) ? _oInfo.ie = matcher[1] :
		(matcher = ua.match(/Firefox\/([\d.]+)/))? _oInfo.firefox = matcher[1]: 
		(matcher = ua.match(/Chrome\/([\d.]+)/))? _oInfo.chrome = matcher[1]: 
		(matcher = ua.match(/Opera.([\d.]+)/))? _oInfo.opera = matcher[1]: 
		(matcher = ua.match(/MicroMessenger\/([\d.]+)/)) ? _oInfo.weixin = matcher[1] :
		(matcher = ua.match(/Version\/([\d.]+).*Safari/))? _oInfo.safari = matcher[1]: 0;
	}
	/**
	 * 分析浏览器类型及版本
	 * @method _fParseOs
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseOs(userAgent){
		var os;
		// 读取分析操作系统
		/windows|win32/i.test(userAgent)?_oInfo.windows=true:
		/linux/i.test(userAgent)?_oInfo.linux=true:
		/macintosh/i.test(userAgent)?_oInfo.mac=true:0;
	}
	/**
	 * 分析浏览器内核类型
	 * @method _fParseKernel
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseKernel(userAgent){
		var ua =userAgent;
		// 使用正则表达式在userAgent中提取浏览器版本信息
		/trident/i.test(ua) ? _oInfo.trident = true :
		/webkit/i.test(ua)? _oInfo.webkit = true: 
		/gecko/i.test(ua)? _oInfo.gecko = true: 
		/presto/i.test(ua)? _oInfo.presto = true: 0;
	}
	/**
	 * 分析浏览器壳类型
	 * @method _fParseShell
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseShell(userAgent){
		var ua=userAgent;
		// 使用正则表达式在userAgent中提取浏览器壳信息
		/MetaSr/i.test(ua) ? _oInfo.sogou = true :
		/Maxthon/i.test(ua)? _oInfo.maxthon = true: 
		/TencentTraveler/i.test(ua)? _oInfo.tt = true: 
		/TheWorld/i.test(ua)? _oInfo.theWorld = true: 
		/360[S|E]E/i.test(ua)? _oInfo.is360 = true: 0;
	}
	/**
	 * 分析移动浏览器类型
	 * @method _fParseMobile
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseMobile(userAgent) {
		var ua = userAgent,m;
		if ((m = ua.match(/AppleWebKit\/?([\d.]*)/)) && m[1]){
			if (/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
				_oInfo.mobile = 'ios'; // iPad, iPhone, iPod Touch
	
				//版本号
				m = ua.match(/OS ([^\s]*)/);
				if (m && m[1]) {
					_oInfo.ios = m[1].replace('_', '.');
				}
				m = ua.match(/iPad|iPod|iPhone/);
				if (m && m[0]) {
					_oInfo[m[0].toLowerCase()] = _oInfo.ios;
				}
				if(/ipad/.test(ua)){
					_oInfo.tablet='ios';
				}else{
					_oInfo.phone='ios';
				}
			} else if (/Android/i.test(ua)) {
				_oInfo.mobile = 'android';
				if (/Mobile/.test(ua)) {
					_oInfo.phone='android';
				}else{
					_oInfo.tablet='android';
				}
				m = ua.match(/Android ([^\s]*);/);
				if (m && m[1]) {
					_oInfo.android = m[1];
				}
			} else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
				_oInfo.mobile = m[0].toLowerCase(); // Nokia N-series, Android, webOS,
												// ex: NokiaN95
			}
		}
	}
	/**
	 * 分析浏览器flash版本
	 * 
	 * @method _fParseFlash
	 */
	function _fParseFlash(){
		var flashVersion;
		try{
			// 如果是ie浏览器
			if(_oInfo.ie){
				// 创建一个activeobject
				var oFlash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				if(oFlash){
					flashVersion = oFlash.getVariable("$version").split(" ")[1];
				}
			// 其他浏览器
			}else{
				if(navigator.plugins && navigator.plugins.length > 0){
					var oFlash=navigator.plugins["Shockwave Flash"];
					if(oFlash){
						var aInfo = oFlash.description.split(" ");
						for(var i=0,m=aInfo.length;i<m;i++){
							if(parseInt(aInfo[i])>0){
								flashVersion = aInfo[i];
								break;
							}
						}
					}
				}
			}
		}catch(e){
		}
		_oInfo.flash = !!flashVersion?flashVersion:null;
	}
	
	_fInit();
	return Browser;
	
});
/**
 * 调试类，方便各浏览器下调试，在发布时统一删除调试代码，所有的输出和调试必须使用此类的方法，
 * 不得使用console等原生方法，发布到线上时需要把除了需要反馈给服务器的方法外的方法统一过滤掉
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Debug",['handy.base.Json','handy.base.Browser'],function(Json,Browser){
	
	var Debug=window.$D={
		level	    : $H.isDebug?0:5,  //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	: 1,            //日志级别
		DEBUG_LEVEL : 2,            //调试级别
		INFO_LEVEL  : 3,            //信息级别
		WARN_LEVEL  : 4,            //警告级别
		ERROR_LEVEL	: 5,            //错误级别
		showInPage  : !("console" in window)||!!Browser.mobile(),        //是否强制在页面上输出调试信息，主要用于不支持console的浏览器，如：IE6，或者ietester里面，或者移动浏览器
		out         : fOut,         //直接输出日志
		log			: fLog,		    //输出日志
		info		: fInfo,		//输出信息
		warn        : fWarn,        //输出警告信息
		error		: fError,		//输出错误信息
		time        : fTime,        //输出统计时间,info级别
		trace       : fTrace,       //追踪统计时间
//		debugLog    : $H.noop,      //线上错误处理
		debug		: fDebug		//出现调试断点
	}
	/**
	 * 输出信息
	 * @method fOut
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 * @param {string} sType 日志类型：log,info,error
	 */
	function fOut(oVar,bShowInPage,sType){
		sType = sType||'log';
		//输出到页面
		if(bShowInPage||Debug.showInPage){
			var sDivId = $H.expando+'debugDiv';
			var oDocument = top.document;
			var oDebugDiv = oDocument.getElementById(sDivId);
			if(!oDebugDiv){
				oDebugDiv = oDocument.createElement("DIV");
				oDebugDiv.id = sDivId;
				oDebugDiv.innerHTML = [
					'<a href="javascript:void(0)" onclick="this.parentNode.style.display=\'none\'">关闭</a>',
					'<a href="javascript:void(0)" onclick="this.parentNode.getElementsByTagName(\'DIV\')[0].innerHTML=\'\';">清空</a>',
					'<a href="javascript:void(0)" onclick="if(this.innerHTML==\'全屏\'){this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';this.innerHTML=\'收起\'}else{this.parentNode.style.height=\'6.25em\';this.innerHTML=\'全屏\';}">收起</a>',
					'<a href="javascript:void(0)" onclick="var oDv=this.parentNode.getElementsByTagName(\'div\')[0];if(this.innerHTML==\'底部\'){oDv.scrollTop=oDv.scrollHeight;this.innerHTML=\'顶部\';}else{oDv.scrollTop=0;this.innerHTML=\'底部\';}">顶部</a>',
					'<a href="javascript:void(0)" onclick="location.reload();">刷新</a>',
					'<a href="javascript:void(0)" onclick="history.back();">后退</a>'
				].join('&nbsp;&nbsp;&nbsp;&nbsp;')+'<div style="padding-top:0.313;height:90%;overflow:auto;font-size:0.75em;"></div>';
				oDebugDiv.style.position = 'fixed';
				oDebugDiv.style.width = '100%';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '100%';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '1em';
				oDebugDiv.style.padding = '0.625em';
				oDebugDiv.style.zIndex = 9999999999;
				oDebugDiv.style.opacity=0.95;
				oDebugDiv.style.filter="alpha(opacity=95)";
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			oVar=oVar instanceof Error?oVar.message:oVar;
			//这里原生的JSON.stringify有问题(&nbsp;中最后的'p;'会丢失)，统一强制使用自定义方法
			var sMsg=typeof oVar=='string'?oVar:$H.Json.stringify(oVar, null, '&nbsp;&nbsp;&nbsp;&nbsp;',true);
			sMsg=sMsg.replace(/\n|\\n/g,'<br/>');
			var sStyle;
			if(sType=='log'){
				sStyle='';
			}else{
				sStyle=' style="color:'+(sType=='error'?'red':sType=='info'?'green':'yellow');
			}
			oAppender.innerHTML += '<div'+sStyle+'">'+sType+":<br/>"+sMsg+"</div><br/><br/>";
			oAppender.scrollTop=oAppender.scrollHeight;
		}
		//尝试获取调用位置
		var fCaller=arguments.callee.caller;
		if(!fCaller.$owner){
			fCaller=fCaller.caller;
		}
		try{
			//如果是类方法，输出方法定位信息
			if(fCaller.$owner){
				console[sType]('['+fCaller.$owner.$ns+'->'+fCaller.$name+']');
			}
			console[sType](oVar);
		}catch(e){
		}
	}
	/**
	 * 输出日志
	 * @method log
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fLog(oVar,bShowInPage){
		if(Debug.level>Debug.LOG_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'log');
	}
	/**
	 * 输出信息
	 * @method info
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fInfo(oVar,bShowInPage){
		if(this.level>Debug.INFO_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'info');
	}
	/**
	 * 输出信息
	 * @method warn
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fWarn(oVar,bShowInPage){
		if(Debug.level>Debug.WARN_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'warn');
	}
	/**
	 * 输出错误
	 * @method error
	 * @param {Object}oVar	需要输出的变量
	 * @param {boolean=}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fError(oVar,bShowInPage){
		if(Debug.level>Debug.ERROR_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,"error");
		if($H.isDebug){
			if(oVar instanceof Error){
				//抛出异常，主要是为了方便调试，如果异常被catch住的话，控制台不会输出具体错误位置
				throw oVar;
			}
		}else{
			//线上自行实现log接口
			Debug.debugLog&&Debug.debugLog(oVar);
		}
	}
	/**
	 * 输出统计时间
	 * @method time
	 * @param {boolean=}bOut 为true时，计算时间并输出信息，只有此参数为true时，后面两个参数才有意义
	 * @param {string=}sMsg 输出的信息
	 * @param {boolean=}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fTime(bOut,sMsg,bShowInPage){
		if(Debug.level>Debug.INFO_LEVEL){
			return;
		}
		var nTime=window.performance&&window.performance.now?window.performance.now():(new Date().getTime());
		if(bOut){
			if(typeof sMsg=='boolean'){
				bShowInPage=sMsg;
				sMsg='';
			}
			Debug.out((sMsg||'')+(nTime-(Debug.lastTime||0)),!!bShowInPage);
		}else{
			Debug.lastTime=nTime;
		}
	}
	/**
	 * 追踪统计时间
	 * @param {object}oParams {
	 * 		{string=}name:名称,
	 * 		{boolean=}end:是否结束计时，默认是开始计时,
	 * 		{boolean=}out:true表示输出结果,
	 * 		{string=}method:输出使用的方法，默认是log
	 * }
	 */
	function fTrace(oParams){
		var bOut=oParams.out;
		var oTimes=Debug._traceTimes||(Debug._traceTimes={});
		if(bOut){
			for(var sName in oTimes){
				var oItem=oTimes[sName];
				oItem.average=oItem.total/oItem.num;
			}
			var sMethod=oParams.method||'log';
			Debug[sMethod](oTimes);
			return;
		}
		var sName=oParams.name;
		var bEnd=oParams.end;
		var oItem=oTimes[sName]||(oTimes[sName]={});
		var nTime=window.performance?window.performance.now():(new Date().getTime());
		if(!bEnd){
			oItem.num=(oItem.num||0)+1;
			oItem.start=nTime;
		}else{
			oItem.total=(oItem.total||0)+nTime-oItem.start;
		}
	}
	/**
	 * 添加调试断点
	 * @method debug
	 * @param {boolean}isDebug	仅为false时不进入debug
	 */
	function fDebug(isDebug){
		if(Debug.level>Debug.DEBUG_LEVEL){
			return;
		}
		if(isDebug!==false){
			debugger;
		}
	}
	/**
	 * 处理异常
	 * @method throwExp
	 * @param {Object}oExp 异常对象
	 */
	function fThrowExp(oExp){
		if(Debug.level<=Debug.DEBUG_LEVEL){
			throw oExp;
		}
	}
	
	return Debug;
	
});
/**
 * 资源加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Loader",
["B.Debug","B.Object"],
function(Debug,Object){
	
	var _LOADER_PRE='[Handy Loader] ',
		_RESOURCE_NOT_FOUND= _LOADER_PRE+'not found: ',
		_eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement,
		_UA = navigator.userAgent,
        _bIsWebKit = _UA.indexOf('AppleWebKit'),
    	_aContext=[],         //请求上下文堆栈
    	_requestingNum=0,     //正在请求(还未返回)的数量
	    _oCache={};           //缓存
	
	var Loader= {
		traceLog                : false,                     //是否打印跟踪信息
		combine                 : $H.isDebug?false:true,     //是否合并请求
		isMin                   : false,                     //是否请求*.min.css和*.min.js
//		rootPath                : {
//			'handy'        : 'http://localhost:8081/handy/src',
//			'com.example'  : 'http://example.com:8082/js'
//		},                       //根url，根据命名空间前缀匹配替换，如果没有匹配则是空字符串''；如果rootPath是字符串则直接使用
		timeout                 : 15000,
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
//		sourceMap               : {
//			'example':{
//				url       : 'http://url',     //url
//				chkExist  : function(){return true}    //验证此资源是否存在的方法
//			}
//		},                       //自定义资源配置   
		
	    showLoading				: function(bIsLoading){},	//加载中的提示，由具体逻辑重写
		define                  : fDefine,                  //定义资源资源
	    require                 : fRequire                  //获取所需资源后执行回调
	}
	
	window.$Define=Loader.define;
	window.$Require=Loader.require;
	
     /**
	 * 检查对应的资源是否已加载，只要检测到一个不存在的资源就立刻返回
	 * @method _fChkExisted
	 * @param {string|Array}id 被检查的资源id
	 * @return {Object}  {
	 * 		{Array}exist: 存在的资源列表
	 * 		{string}notExist: 不存在的资源id
	 * }
	 */
    function _fChkExisted(id){
    	function _fChk(sId){
    		//css和js文件只验证是否加载完
    		if(/\.(css|js)/.test(sId)){
    			return _oCache[sId]&&_oCache[sId].status=='loaded';
    		}else if(Loader.sourceMap&&Loader.sourceMap[sId]){
    			//自定义资源使用自定义方法验证
    			return Loader.sourceMap[sId].chkExist();
    		}else{
    			//标准命名空间规则验证
	    		return Object.ns(sId);
    		}
    	}
    	var oResult={}
    	var aExist=[];
    	var aNotExist=[];
    	if(typeof id=="string"){
    		id=[id];
    	}
    	for(var i=0,nLen=id.length;i<nLen;i++){
    		var sId=id[i];
    		sId=Object.alias(sId);
    		var result=_fChk(sId);
    		if(!result){
    			aNotExist.push(sId);
    		}else{
    			aExist.push(result);
    		}
    	}
    	oResult.exist=aExist;
    	oResult.notExist=aNotExist;
    	return oResult;
    }
    
    /**
	 * 通过id获取实际url
	 * @method _fGetUrl
	 * @param {string}sId 资源id，可以是命名空间，也可以是url
	 * @return {string}sUrl 实际url
	 */
    function _fGetUrl(sId){
    	if(/\/+/.test(sId)){
    		return sId;
    	}
    	var sUrl=Loader.sourceMap&&Loader.sourceMap[sId]&&Loader.sourceMap[sId].url;
    	if(!sUrl){
    		var sRoot='';
    		var rootPath=Loader.rootPath;
    		if(typeof rootPath=='string'){
    			sRoot=rootPath;
    		}else if(typeof rootPath=="object"){
	    		for(var prifix in rootPath){
	    			if(sId.indexOf(prifix)==0){
	    				sRoot=rootPath[prifix];
	    				sId=sId.replace(prifix,'');
	    			}
	    		}
    		}else{
    			sRoot="";
    		}
    		//css文件
    		if(/\.css$/.test(sId)){
    			sUrl=sId.indexOf('/')==0?sId:"/css/"+sId;
    		}else if(/\.js$/.test(sId)){
    			//js文件
    			sUrl=sId;
    		}else{
    			//命名空间
    			sUrl=sId.replace(/\./g,"/")+".js";
    		}
    		sUrl=sRoot.replace(/\/$/,'')+'/'+sUrl.replace(/^\//,'');
    	}
		if(Loader.isMin){
			sUrl=sUrl.replace(/\.(css|js)$/,'.min.$1');
		}
		return sUrl;
    }
	/**
	 * 获取js脚本
	 * @method _getScript
	 * @param {string}sUrl 请求url
	 * @param {function()}fCallback 回调函数
	 */
    function _fGetScript(sUrl,fCallback) {
    	var eScript=document.createElement("script");
    	//脚本相对于页面的其余部分异步地执行(当页面继续进行解析时，脚本将被执行)
    	eScript.async = "async";
    	eScript.src=sUrl;
    	eScript.type="text/javascript";
    	_fAddOnload(eScript,fCallback);
		_eHead.appendChild(eScript);
	}
	/**
	 * 获取css
	 * @method _getCss
	 * @param {string}sUrl 请求url
	 * @param {function()}fCallback 回调函数
	 */
    function _fGetCss(sUrl,fCallback) {
    	var aStyles=_eHead.getElementsByTagName("link");
    	//检查是否已经加载，顺便获取皮肤节点
    	for(var i=0;i<aStyles.length;i++){
    		var sHref=aStyles[i].href;
    		if(!Loader.skinNode&&sHref.indexOf(Loader.skinName)>=0){
    			Loader.skinNode=aStyles[i];
    		}
    		//如果已经加载了，直接返回
    		if(sHref.indexOf(sUrl)>=0||sUrl.indexOf(sHref)>=0){
    			return;
    		}
    	}
    	var eCssNode=document.createElement("link");
    	eCssNode.rel="stylesheet";
    	eCssNode.href=sUrl;
    	_fAddOnload(eCssNode,fCallback);
    	if(Loader.skinNode){
	    	//插入到皮肤css之前
	    	_eHead.insertBefore(eCssNode,Loader.skinNode);
    	}else{
    		//没有皮肤css，直接加到最后
    		_eHead.appendChild(eCssNode);
    	}
	}
	/**
	 * 为css/script资源添加onload事件，包含超时处理
	 * @method _fAddOnload
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fAddOnload(eNode,fCallback){
		//onload回调函数
	    function _fCallback() {
	      if (!_fCallback.isCalled) {
	        _fCallback.isCalled = true;
	        clearTimeout(nTimer);
	        fCallback();
	      }
	    }
	    
		if (eNode.nodeName === 'SCRIPT') {
	       _fScriptOnload(eNode, _fCallback);
	    } else {
	       _fStyleOnload(eNode, _fCallback);
	    }
	
	    //超时处理
	    var nTimer = setTimeout(function() {
	      Debug.error('Time is out:'+ eNode.src);
	      _fCallback();
	    }, Loader.timeout);
	
	}
	/**
	 * script资源onload函数
	 * @method _fScriptOnload
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fScriptOnload(eNode, fCallback) {
		var _fCall=function() {
		if (/loaded|complete|undefined/.test(eNode.readyState)) {
				// 保证只运行一次回调
				eNode.onload = eNode.onerror = eNode.onreadystatechange = null;
//				//TODO 防止内存泄露
//				if (eNode.parentNode) {
//					try {
//						if (eNode.clearAttributes) {
//							eNode.clearAttributes();
//						} else {
//							Chrome下这里执行后eNode回变为“TypeError”，原因暂不明
//							for (var p in eNode){
//								if(eNode=="TypeError")Debug.debug();
//								delete eNode[p];
//							}
//						}
//					} catch (e) {
//						Debug.error("Loader script onload:"+e.message,e);
//					}
//				}
				// 移除标签
				//_eHead.removeChild(eNode);
				eNode = null;
				// IE10下新加载的script会在此之后才执行，所以此处需延迟执行
				setTimeout(fCallback, 0);
			}
		};
		eNode.onload  = eNode.onreadystatechange = _fCall;
		eNode.onerror=function(){
			Debug.error(_LOADER_PRE+'load script error:\n'+eNode.src);
			_fCall();
		}
		// 注意:在opera下，当文件是404时，不会发生任何事件，回调函数会在超时的时候执行
	}
	/**
	 * css资源onload函数
	 * 
	 * @method _fStyleOnload
	 * @param {element}eNode
	 *            节点
	 * @param {function()}fCallback
	 *            回调函数
	 */
	function _fStyleOnload(eNode, fCallback) {
	    // IE6-9 和 Opera
	    if (window.hasOwnProperty('attachEvent')) { // see #208
		    eNode.attachEvent('onload', fCallback);
		    // 注意:
		    // 1. 在IE6-9下，当文件是404时，onload会被触发，但是在这种情况下，opera下不会被出发，只会出发超时处理；
		    // 2. onerror事件在所有浏览器中均不会触发
	    }else {
	    //Firefox, Chrome, Safari下，采用轮询
	    	//在eNode插入后开始
	        setTimeout(function() {
	        	_fPollStyle(eNode, fCallback);
	      	}, 0); 
	    }
	
	}
	/**
	 * css资源轮询检测
	 * @method _fPollStyle
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fPollStyle(eNode, fCallback) {
	    if (fCallback.isCalled) {
	        return;
	    }
	    var bIsLoad;
	    if (_bIsWebKit) {
	        if (eNode['sheet']) {
	        	bIsLoad = true;
	        }
	    } else if (eNode['sheet']) {
	    // Firefox
	        try {
	            if (eNode['sheet'].cssRules) {
	          		bIsLoad = true;
	            }
	        } catch (ex) {
	            if (ex.name === 'SecurityError' || // firefox >= 13.0
	                ex.name === 'NS_ERROR_DOM_SECURITY_ERR') { // 旧的firefox
	         	    bIsLoad = true;
	            }
	        }
	    }
	
	    setTimeout(function() {
	        if (bIsLoad) {
	            // 把callback放在这里是因为要给时间给渲染css
	            fCallback();
	        } else {
	            _fPollStyle(eNode, fCallback);
	        }
	    }, 1);
	}
    /**
	 * 请求资源
	 * @method _fRequest
	 * @param {Array}aRequestIds 需要加载的资源id数组
	 */
    function _fRequest(aRequestIds){
    	var bNeedRequest=false;
    	var bCombine=Loader.combine,
    	oCombineJs={},
    	oCombineCss={};
    	for(var i=0,nLen=aRequestIds.length;i<nLen;i++){
    		var sId=aRequestIds[i];
    		//不处理已经在请求列表里的资源
    		if(!_oCache[sId]){
	    		var sUrl=_fGetUrl(sId);
    			bNeedRequest=true;
	    		_oCache[sId]={
					id:sId,
					status:'loading'
				}
				if(!bCombine){
					var _fCallback=function(){
						_fResponse(sId);
					}
		    		if(Loader.traceLog){
						Debug.log(_LOADER_PRE+"request:\n"+sUrl);
			   		}
		    		if(/\.css/.test(sUrl)){
		    			_fGetCss(sUrl,_fCallback);
		    		}else{
		    			_fGetScript(sUrl,_fCallback) ;
		    		}
		    		_requestingNum++;
				}else{
					//按照域名整理js和css
					var host=sUrl.match(/([^:]+:\/\/)?[^/]+\/?/);
					host=host&&host[0]||'';
					var sUri=sUrl.substring(host.length);
					if(/\.css/.test(sUrl)){
						var oCss=oCombineCss[host];
		    			if(!oCss){
							oCss=oCombineCss[host]={ids:[],uris:[]};
						}
						oCss.ids.push(sId);
						oCss.uris.push(sUri);
		    		}else{
		    			var oJs=oCombineJs[host];
		    			if(!oJs){
							oJs=oCombineJs[host]={ids:[],uris:[]};
						}
						oJs.ids.push(sId);
						oJs.uris.push(sUri);
		    		}
				}
    		}
    	}
    	//合并请求
    	var _fCmbRequest=function(oCombine){
    		for(var host in oCombine){
				var oItem=oCombine[host];
				var aUris=oItem.uris;
    			var _fCallback=function(){
    				_fResponse(oItem.ids);
    			}
    			var sUrl=host+(aUris.length>1?('??'+aUris.join(',')):aUris[0]);
	    		if(Loader.traceLog){
					Debug.log(_LOADER_PRE+"request:\n"+sUrl);
		   		}
		   		_fGetScript(sUrl,_fCallback) ;
		   		_requestingNum++;
			}
    	}
    	//提示loading
    	if(bNeedRequest){
    		if(bCombine){
    			_fCmbRequest(oCombineJs);
    			_fCmbRequest(oCombineCss);
    		}
    		Loader.showLoading(true);
    	}
    }
    /**
	 * 资源下载完成回调
	 * @method _fResponse
	 * @param {string|array}id 资源id或数组
	 */
    function _fResponse(id){
    	Loader.showLoading(false);
    	_requestingNum--;
    	id=typeof id==='string'?[id]:id;
    	//标记资源已加载
    	for(var i=0;i<id.length;i++){
	    	_oCache[id[i]].status='loaded';
    	}
    	if(Loader.traceLog){
			Debug.log(_LOADER_PRE+"Response:\n"+id.join('\n'));
   		}
    	_fExecContext();
    }
    /**
     * 执行上下文
     * @method _fExecContext
     */
    function _fExecContext(){
    	//每次回调都循环上下文列表
   		for(var i=_aContext.length-1;i>=0;i--){
	    	var oContext=_aContext[i];
	    	var oResult=_fChkExisted(oContext.deps);
	    	if(oResult.notExist.length===0){
	    		_aContext.splice(i,1);
	    		oContext.callback.apply(null,oResult.exist);
	    		//定义成功后重新执行上下文
	    		_fExecContext();
	    		break;
	    	}else if(i==0&&_requestingNum==0){
	    		//输出错误分析
	    		for(var i=_aContext.length-1;i>=0;i--){
	    			var oContext=_aContext[i];
	    			var oResult=_fChkExisted(oContext.deps);
	    			var aNotExist=oResult.notExist;
	    			var bHasDepds=false;
	    			for(var j=_aContext.length-1;j>=0;j--){
	    				if(Object.contains(aNotExist,_aContext[j].id)){
	    					bHasDepds=true;
	    					break;
	    				}
	    			}
	    			if(!bHasDepds){
						Debug.error(_RESOURCE_NOT_FOUND+oContext.id);
	    			}
    				Debug.warn(oContext.id);
    				Debug.warn("----notExist : "+oResult.notExist);
	    		}
	    		Debug.error(_RESOURCE_NOT_FOUND+oResult.notExist);
	    	}
   		}
    }
    /**
	 * 定义loader资源
	 * @method define(sId,deps=,factory)
	 * @param {string}sId   资源id，可以是id、命名空间，也可以是url地址（如css）
	 * @param {Array|string=}deps  依赖的资源
	 * @param {*}factory  资源工厂，可以是函数，也可以是字符串模板
	 * @return {number}nIndex 返回回调索引
	 */
	function fDefine(sId,deps,factory){
		//读取实名
		sId=Object.alias(sId);
		var nLen=arguments.length;
		if(nLen==2){
			factory=deps;
			deps=[];
		}else{
			deps=typeof deps=="string"?[deps]:deps;
		}
		
		//检出factory方法内声明的$Require依赖，如：var m=$Require('m');
		if(Object.isFunc(factory)){
			var m,sFactoryStr=factory.toString();
			var r=/\$Require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
			while(m=r.exec(sFactoryStr)){
				deps.push(m[1]);
			}
		}
		
		Loader.require(deps,function(){
			var resource;
			if(typeof factory=="function"){
				try{
					if(Loader.traceLog){
						Debug.log(_LOADER_PRE+"define:\n"+sId);
					}
					//考虑到传入依赖是数组，这里回调参数形式依然是数组
					resource=factory.apply(null,arguments);
				}catch(e){
					//资源定义错误
					e.message=_LOADER_PRE+sId+":\nfactory define error:\n"+e.message;
					Debug.error(e);
					return;
				}
			}else{
				resource=factory;
			}
			
			if(resource){
				Object.ns(sId,resource);
				//添加命名空间元数据
				var sType=typeof resource;
				if(sType=="object"||sType=="function"){
					resource.$ns=sId;
				}
			}else{
				Debug.warn(_LOADER_PRE+'factory no return:\n'+sId);
			}
		},sId);
	}
    /**
	 * 加载所需的资源
	 * @method require(id,fCallback=)
	 * @param {string|array}id    资源id（数组）
	 * @param {function()=}fCallback(可选) 回调函数
	 * @param {string=}sDefineId 当前请求要定义的资源id，这里只是为了检查加载出错时使用，外部使用忽略此参数
	 * @return {any}返回最后一个当前已加载的资源，通常用于className只有一个的情况，这样可以立即通过返回赋值
	 */
    function fRequire(id,fCallback,sDefineId){
    	var aIds=typeof id=="string"?[id]:id;
    	fCallback=fCallback||$H.noop;
    	//此次required待请求资源数组
    	var aRequestIds=[];
    	//已加载的资源
    	var aExisteds=[];
    	//是否保存到上下文列表中，保证callback只执行一次
    	var bNeedContext=true;
    	for(var i=0,nLen=aIds.length;i<nLen;i++){
    		var sId=aIds[i];
			//读取实名
			sId=Object.alias(sId);
    		var oResult=_fChkExisted(sId);
    		if(oResult.notExist.length>0){
    			//未加载资源放进队列中
    			aRequestIds.push(sId);
    			if(bNeedContext){
    				bNeedContext=false;
	    			_aContext.push({
	    				id        : sDefineId,
	    				deps      : aIds,
	    				callback  : fCallback
	    			});
    			}
    			if(Loader.traceLog){
					Debug.log(_RESOURCE_NOT_FOUND+sId);
		   		}
    		}else{
    			aExisteds.push(oResult.exist[0]);
    		}
    	}
    	
    	//没有需要加载的资源，直接执行回调或返回资源
    	if(aRequestIds.length==0){
    		fCallback&&fCallback.apply(null,aExisteds);
    		return aExisteds.length==1?aExisteds[0]:aExisteds;
    	}else{
    		//请求资源
    		_fRequest(aRequestIds);
    	}
    }
    
    return Loader;
	
});
/**
 * 面向对象支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define("B.Class",["B.Object",'B.Debug'],function(Object,Debug){
	
	var Cls={
		createClass         : fCreateClass,     //创建类
		inherit				: fInherit,  		//继承
		getSingleton        : fGetSingleton     //获取单例
	}
	
	/**
    * 创建类
    * @param {string=}sPath 类路径
    * @return {Object} 返回新创建的类
    */
    function fCreateClass(sPath) {
        //获得一个类定义，并且绑定一个类初始化方法，这里使用名字Class在控制台显得更友好
        var Class = function(){
        	var me,fInitialize,oArgs=arguments;
        	//new 方式调用
        	if(this.constructor==Class){
        		me = this;
        	}else{
        		//非new方式(如Class(args))，转换为new方式，但一般不推荐这种方式
        		me = oArgs.callee;
        		var t=function(){};
        		t.prototype=me.prototype;
        		var newObj=new t;
        		me.apply(newObj,oArgs);
        		return newObj;
        	}
        	//获得initialize引用的对象，如果不是通过new调用(比如:Class())，就没有this.initialize
        	fInitialize = me.initialize;
            if (fInitialize) {
            	//所有对象类型包括数组类型的属性都重新clone，避免在实例方法中修改到类属性
            	//根据组件example页面118-11800个不同组件的测试，手机上大概会影响5-10%的性能，pc上不是很明显
//            	for(var p in me){
//            		if(typeof me[p]=="object"){
//            			me[p]=Object.clone(me[p]);
//            		}
//            	}
                // 返回当前class派生出来对象可以被定义
            	return fInitialize.apply(me, oArgs);
            }
        };
        Class.$isClass=true;
        /**
         * 便捷创建子类方法
         * @param {Object=} oProtoExtend 需要扩展的prototype属性
    	 * @param {Object=} oStaticExtend 需要扩展的静态属性
   	     * @param {object=} oExtendOptions 继承父类静态方法时，extend方法的选项
         */
        Class.derive=function(oProtoExtend,oStaticExtend,oExtendOptions){
        	var cChild=Cls.createClass();
        	Cls.inherit(cChild,this,oProtoExtend,oStaticExtend,oExtendOptions);
        	return cChild;
        }
        /**
         * 便捷访问父类方法
         * @method callSuper
         * @param {Class=}oSuper 指定父类，如果不指定，默认为定义此方法的类的父类，如果该值为空，则为实际调用对象的父类
         * @param {Array}aArgs 参数数组，默认为调用它的函数的参数
         * @return {*} 返回对应方法执行结果
         */
        Class.prototype.callSuper=function(oSuper,aArgs){
        	var me=this;
        	if(oSuper&&!oSuper.$isClass&&oSuper.length!==undefined){
        		aArgs=oSuper;
        		oSuper=null;
        	}
        	var fCaller=arguments.callee.caller;
        	var oCallerSuper=fCaller.$owner.superProto;
        	aArgs=aArgs||fCaller.arguments;
        	oSuper=oSuper?oSuper.prototype:(oCallerSuper||me.constructor.superProto);
        	var sMethod=fCaller.$name;
        	if(oSuper){
        		var fMethod=oSuper[sMethod];
        		if(Object.isFunc(fMethod)){
        			return fMethod.apply(me,aArgs);
        		}
        	}
        };
        if(sPath){
        	this.ns(sPath,Class);
        }
        return Class;
    }
    /**
    * 继承
    * @param {Object} oChild 子类
    * @param {Object} oParent 父类
    * @param {Object=} oProtoExtend 需要扩展的prototype属性
    * @param {Object=} oStaticExtend 需要扩展的静态属性
    * @param {object=} oExtendOptions 继承父类静态方法时，extend方法的选项
    */
    function fInherit(oChild, oParent,oProtoExtend,oStaticExtend,oExtendOptions) {
        var Inheritance = function(){};
        Inheritance.prototype = oParent.prototype;
		/* 
			使用new父类方式生成子类的prototype
			为什么不使用oChild.prototype = oParent.prototype?
			1.子类和父类的prototype不能指向同一个对象，否则父类的属性或者方法会可能被覆盖
			2.父类中构造函数可能会有对象成员定义
			缺点：
			1.父类的构造函数不能继承，如果父类的构造函数有参数或者代码逻辑的话，会有些意外情况出现
			2.constructor需要重新覆盖
		*/
        //继承静态方法
        Object.extend(oChild, oParent,oExtendOptions);
        oChild.prototype = new Inheritance();
        //重新覆盖constructor
        oChild.prototype.constructor = oChild;
        oChild.superClass = oParent;
        oChild.superProto = oParent.prototype;
        //额外的继承动作
        if(oParent._onInherit){
            try{
                oParent._onInherit(oChild);
            }catch(e){
            	Debug.error(e);
            }
        }
        //扩展静态属性
        if(oStaticExtend){
            Object.extend(oChild, oStaticExtend);
        }
        //扩展prototype属性
        if(oProtoExtend){
            Object.extend(oChild.prototype, oProtoExtend);
        }
    }
    /**
     * 获取单例
     * @param {string|Class}clazz 类或者命名空间
     * @return {Object} 返回单例对象
     */
    function fGetSingleton(clazz){
    	var cClass;
    	if(typeof clazz=='string'){
    		cClass=Object.ns(clazz);
    	}else{
    		cClass=clazz;
    	}
    	return cClass&&(cClass.$singleton||(cClass.$singleton=new cClass()));
    }
	
	return Cls;
	
});
/**
 * 函数类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Function',function(){
	
	var Function={
		bind                : fBind,              //函数bind方法
		intercept           : fIntercept          //创建函数拦截器
	}
	
	var _nUuid=0;
	
	/**
	 * 函数bind方法
	 * @method  bind
	 * @param {function()}fFunc 被绑定的函数
	 * @param {Object}oScope  需要绑定的对象
	 * @param {Object}args    需要绑定的参数
	 * @return  {function()}    返回新构造的函数
	 */
	function fBind(fFunc,oScope,args) {
		var aBindArgs = Array.prototype.slice.call(arguments,2);
		return function() {
			var aArgs=aBindArgs.slice();
			Array.prototype.push.apply(aArgs, arguments);
			return fFunc.apply(oScope, aArgs);
		};
	}
	/**
	 * 创建函数拦截器
	 * @method  intercept(fExecFunc,fInterceptFunc[,oExecScope,oInterceptScope])
	 * @param {function()}fExecFunc 被拦截的函数，this指向oExecScope||window
	 * @param {function()}fInterceptFunc 拦截函数,仅当当拦截函数返回false时，不执行被拦截函数；拦截函数this指向oInterceptScope||oExecScope||window
	 * @param {Object}oExecScope  被拦截的函数绑定的对象
	 * @param {Object}oInterceptScope  拦截函数绑定的对象
	 * @return  {function()}    返回新构造的函数
	 */
	function fIntercept(fExecFunc,fInterceptFunc,oExecScope,oInterceptScope) {
		if($H.Object.isFunc(fExecFunc)&&$H.Object.isFunc(fInterceptFunc)){
			return function() {
						var oExScope=oExecScope||this;
						var oInterScope={};
		                var args = arguments;
						oInterScope.scope=oInterceptScope;
		                oInterScope.target = oExScope;
		                oInterScope.method = fExecFunc;
		                return fInterceptFunc.apply(oInterScope, args) != false ?
				                   fExecFunc.apply(oExScope, args) :false;
				   };
		}
		return fExecFunc||fInterceptFunc;
	}
	
	return Function;
	
});
/**
 * 自定义事件类，事件名称支持'all'表示所有事件，支持复杂形式：'event1 event2'或{event1:func1,event:func2}，
 * 事件名称支持命名空间(".name")，如：change.one
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Events',function(){
	
	var Events={
		_eventCache        : {},                   //自定义事件池
		_execEvtCache      : [],                   //待执行事件队列
//		_stopEvent         : false,                //是否停止(本次)事件
		_parseEvents       : _fParseEvents,        //分析事件对象
		_parseCustomEvents : _fParseCustomEvents,  //处理对象类型或者空格相隔的多事件
		_delegateHandler   : _fDelegateHandler,    //统一代理回调函数
		_pushEvent         : _fPushEvent,          //将需要执行的事件放入执行队列
		_execEvents        : _fExecEvents,         //执行事件队列
		on                 : fOn,                  //添加事件
		once               : fOnce,                //监听一次
		off                : fOff,                 //移除事件
		suspend            : fSuspend,             //挂起事件
		resume             : fResume,              //恢复事件
		stop               : fStop,                //停止(本次)事件
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
		return function(evt){
			//只屏蔽浏览器事件及自定义事件，模型事件不用屏蔽
			if(me.isSuspend!=true||(typeof evt==='string'&&evt.indexOf(':')>0)){
				return fHandler.apply(context||me,arguments);
			}
		};
	}
	/**
	 * 将需要执行的事件放入执行队列
	 * @param {Object}oEvent 参数事件对象
	 */
	function _fPushEvent(oEvent){
		var me=this;
		me._execEvtCache.push(oEvent);
	}
	/**
	 * 执行事件队列，统一执行周期中，同名的事件会被覆盖，只有最后一个事件有效
	 * @return {?} 只是返回最后一个函数的结果，返回结果在某些情况(一般是只有一个监听函数时)可以作为通知器使用
	 */
	function _fExecEvents(){
		var me=this,result;
		var aEvts=me._execEvtCache;
		$H.each(aEvts,function(i,oEvent){
			aEvts.splice(i,1);
			var fDelegation=oEvent.delegation;
			//控制执行次数
			if(typeof oEvent.times=='number'){
				if(oEvent.times>1){
					oEvent.times--;
				}else{
					me.off(oEvent.name,oEvent.handler);
				}
			}
			//只是返回最后一个函数的结果，返回结果在某些情况可以作为通知器使用
			result=fDelegation.apply(me,oEvent.args);
			if(me._stopEvent){
				aEvts.splice(0,aEvts.length);
				return false;
			}
		});
		me._stopEvent=false;
		return result;
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
	 	aArgs.push(1);
	 	me.on.apply(me,aArgs);
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
	 * 停止(本次)事件
	 */
	function fStop(){
		this._stopEvent=true;
	}
	/**
	 * 触发事件
	 * @method trigger(name[,data,..])
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {*}data 传递参数
	 * @return {?}只是返回最后一个函数的结果，返回结果在某些情况(一般是只有一个监听函数时)可以作为通知器使用
	 */
	function fTrigger(name,data){
		var me=this;
		var aNewArgs=$H.toArray(arguments);
		aNewArgs.unshift('trigger');
		if(me._parseCustomEvents.apply(me,aNewArgs)){
			return;
		}
		var oCache=me._eventCache;
		var aArgs=$H.toArray(arguments);
		var aCache;
		//内部函数，执行事件队列
		function _fExec(aCache){
			if(!aCache){
				return;
			}
			for(var i=0,len=aCache.length;i<len;i++){
				var oEvent=aCache[i];
				oEvent.args=aArgs;
				oEvent.name=name;
				//这里立即执行，aCache可能会被改变（如update会删除并重新添加事件），所以先放入队列中
				//另外，也考虑日后扩展事件队列，如优先级，去重等
				me._pushEvent(oEvent);
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
		return me._execEvents();
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
/**
 * 日期扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Date',function(){
	
	var WDate=window.Date;
	
	var Date={
		getWeek              : fGetWeek,             //返回周几
		isWeeken             : fIsWeeken,            //是否周末
		getDaysInMonth       : fGetDaysInMonth,      //返回该月总共有几天
		getDaysInYear        : fGetDaysInYear,       //返回该年总共有几天
		getDayIndexOfYear    : fGetDayIndexOfYear,   //计算该天是该年的第几天
		formatDate           : fFormatDate,          //返回指定格式的日期字符串
		parseDate            : fParseDate,           //将日期字符串转换为Date对象
		now                  : fNow,                 //设置/读取服务器时间
		howLong              : fHowLong              //计算距离现在多久了
	}
	
	//客户端和服务器端时间差
	var _timeDif=0;
	
	/**
	 * 返回周几
	 * @method getWeek
	 * @param  {Date} oDate 需要增减的日期对象
	 * @param {number}nDiff	天偏移量-7~7
	 * @return {string} 返回周几的中文
	 */
	function fGetWeek(oDate, nDiff){
		var aWeek = [ "日","一","二","三","四","五","六" ];
		var nDay = oDate.getDay();
		if(nDiff){
			nDay += nDiff%7+7;
			nDay %= 7;
		}
		return aWeek[nDay];
	}
	/**
	 * 是否周末
	 * @method isWeeken
	 * @param  {Date} oDate 参数日期对象
	 * @return {boolean} 返回true表示是周末
	 */
	function fIsWeeken(oDate){
		return oDate.getDay()==0 || oDate.getDay()==6;
	}
	/**
	 * 返回该月总共有几天
	 * @method getDaysInMonth
	 * @param  {Date} oDate 参数日期对象
	 * @return {number} 返回当该月的天数
	 */
	function fGetDaysInMonth(oDate){
		oDate=new WDate(oDate.getFullYear(),oDate.getMonth()+1,0);
		return oDate.getDate();
	}
	/**
	 * 返回该年总共有几天
	 * @method getDaysInYear
	 * @param  {Date} oDate 参数日期对象
	 * @return {number} 返回当该年的天数
	 */
	function fGetDaysInYear(oDate){
		var oStart = new WDate(oDate.getFullYear(),0,0);
		var oEnd=new WDate(oDate.getFullYear()+1,0,0);
		return Math.floor((oEnd.getTime() - oStart.getTime()) / 86400000);
	}
	/**
	 * 计算该天是该年的第几天
	 * @method getDayIndexOfYear
	 * @param  {Date} oDate 参数日期对象
	 * @return {number} 返回该天是该年的第几天
	 */
	function fGetDayIndexOfYear(oDate){
		var oTmp = new WDate("1/1/" + oDate.getFullYear());
		return Math.ceil((oDate.getTime() - oTmp.getTime()) / 86400000);
	}
	/**
	 * 返回指定格式的日期字符串
	 * @method formatDate(oDate[,sFormator])
	 * @param  {Date} oDate 需要格式化的日期对象
	 * @param  {string}sFormator(可选)  格式化因子,如：'yyyy年 第q季 M月d日 星期w H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {string} 返回字符串日期
	 */
	function fFormatDate(oDate, sFormator) {
		if(typeof oDate=='string'){
			oDate=Date.parseDate(oDate);
		}
		if(typeof oDate!='object'){
			return oDate;
		}
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var nHours=oDate.getHours();
		var nQuarter=Math.floor((oDate.getMonth() + 3) / 3)
		var oData = {
			"y+" : oDate.getFullYear(),
			"M+" : oDate.getMonth() + 1,
			"d+" : oDate.getDate(),
			"h+" : nHours % 12 == 0 ? 12 : nHours % 12, //12小时制 
            "H+" : nHours, //24小时制
			"m+" : oDate.getMinutes(),
			"s+" : oDate.getSeconds(),
			"w+" : Date.getWeek(oDate),
			"q+" : nQuarter,//季度(阿拉伯数字)
			"Q+" : ["一","二","三","四"][nQuarter-1],//季度(中文数字)
			"S+" : oDate.getMilliseconds()
		}

		for (var k in oData) {
			if (new RegExp("(" + k + ")").test(sFormator)) {
				var nLen=RegExp.$1.length;
				sFormator = sFormator.replace(RegExp.$1, nLen== 1 ? oData[k] : ("00" + oData[k]).slice(-nLen));
			}
		}
 		return sFormator;
	}
	/**
	 * 将日期字符串转换为Date对象
	 * @method parseDate(date[,sFormator])
	 * @param  {number|string} date 需要分析的日期字符串或者getTime方法返回的数字，其它类型的参数直接返回参数本身，除了日期数据外不能有数字出现，如：参数("2012年 12/13","yyyy年 MM/dd")是正确的，而参数("2012年 11 12/13","yyyy年 11 MM/dd")的11是错误的
	 * @param  {string}sFormator(可选)  格式化因子,除了formator元素外，不能出现字母(与第一个参数类似)，如：'yyyy年 M月d日 H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {Object} 返回Date对象
	 */
	function fParseDate(date, sFormator) {
		var sType=typeof date;
		var oDate=new WDate();
		if(sType=='number'){
			oDate.setTime(date);
			return oDate;
		}
		if(sType!='string'){
			return date;
		}
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var aFormatorMatches=sFormator.match(/[a-zA-Z]+/g);
		var aNumMatches=date.match(/\d+/g);
		//格式错误，返回空值
		if(!aNumMatches){
			return;
		}
		//如果设置月份时，日期大于要设置的月份的最大天数，会使月份数增加一月，所以这里先设置为1
		oDate.setDate(1);
		for(var i=0;i<aNumMatches.length;i++){
			var sFormatorMatch=aFormatorMatches[i];
			var nNum=parseInt(aNumMatches[i]);
			switch (sFormatorMatch){
				case 'yyyy':
					oDate.setFullYear(nNum);
					break;
				case 'MM':
					oDate.setMonth(nNum-1);
					break;
				case 'dd':
					//如果要设置的日期数大于该月最大天数，设置为该月最后一天
					var nDay=Date.getDaysInMonth(oDate);
					if(nNum>nDay){
						nNum=nDay;
					}
					oDate.setDate(nNum);
					break;
				case 'HH':
					oDate.setHours(nNum);
					break;
				case 'mm':
					oDate.setMinutes(nNum);
					break;
				case 'ss':
					oDate.setSeconds(nNum);
					break;
				case 'SS':
					oDate.setMilliseconds(nNum);
					break;
			}
		}
		return oDate;
	}
	/**
	 * 设置/读取服务器时间
	 * @param {number|string|Date=|boolean=}time 不传或布尔值表示读取，当为true时表示读取字符串类型时间，不为true时返回Date格式的时间
	 * 										其他类型参数表示设置服务器时间
	 * @param {Date} 返回当前服务器时间
	 */
	function fNow(time){
		var oNow = new WDate();
		if(time&&time!==true){
			if(typeof time!='number'){
				time=Date.parseDate(time).getTime();
			}
			_timeDif=time-oNow.getTime();
		}else{
			oNow.setTime(oNow.getTime()+_timeDif);
			if(time){
				oNow=Date.formatDate(oNow);
			}
			return oNow;
		}
	}
	/**
	 * 计算距离现在多久了
	 * @param {Date|String}time 参数时间
	 * @param {boolean=}bFormat 仅当false时不进行格式化：小于60分钟的单位是分钟，
	 * 					小于一天的单位是小时，小于30天的单位是天，大于30天返回"30天前"
	 */
	function fHowLong(time,bFormat){
		if(!time){
			return;
		}
		time=Date.parseDate(time);
		var oNow=Date.now();
		var nTime=oNow.getTime()-time.getTime();
		if(bFormat!=false){
			var sUnit;
			if((nTime=nTime/(1000*60))<60){
				sUnit='分钟'; 
				nTime=nTime||1;
			}else if((nTime=nTime/60)<24){
				sUnit='小时'; 
			}else if((nTime=nTime/24)<30){
				sUnit='天'; 
			}else{
				return '30天前'; 
			}
			//最少显示一分钟前
			nTime=nTime>0?nTime:1;
			nTime=(Math.floor(nTime)||1)+sUnit+'前';
		}
		return nTime;
	}
	
	return Date;
});
/**
 * String工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define("B.String",function(){
	
	var String={
		stripTags		: fStripTags,       // 删除标签
		escape   		: fEscape    ,      // html编码
		unescape    	: fUnescape,        // html解码
		encodeHTML		: fEncodeHTML,	    // html编码
		decodeHTML		: fDecodeHTML,	    // html解码
		htmlToTxt       : fHtmlToTxt,       // htlm转换为纯文本
		TxtToHtml       : fTxtToHtml,       // 纯文本转换为html
		trim			: fTrim,            // 删除字符串两边的空格
		check			: fCheck,		    // 检查特殊字符串
		len				: fLen,         	// 计算字符串打印长度,一个中文字符长度为2
		left			: fLeft,			// 截断left
		isNumStr		: fIsNumStr,        // 字符串是否是数字
		hasChn          : fHasChn,          // 字符是否包含中文
		isChn           : fIsChn            // 字符是否是中文
	}
	/**
	 * 删除标签字符串
	 * @method  stripTags
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} 删除标签后的字符串 
	 */
	function fStripTags(sStr){
		return sStr.replace(/<\/?[^>]+>/gi, '');
	};
	/**
	 * html编码,escape方式
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {string} 编码后的html代码
	 */
	function fEscape(sStr){
		if(!sStr){
			return sStr;
		}
		var oDiv = document.createElement('div');
		var oText = document.createTextNode(sStr);
		oDiv.appendChild(oText);
		return oDiv.innerHTML;
	};

	/**
	 * html解码,escape方式
	 * @param  {string} sStr	需要操作的字符串
	 * @return {string}  	解码后的html代码  
	 */
	function fUnescape(sStr){
		var oDiv = document.createElement('div');
		oDiv.innerHTML = String.stripTags(sStr);
		return oDiv.childNodes[0].nodeValue;
	};
	/**
	 * html编码，替换<>等为html编码
	 * @method  encodeHTML
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} sStr 编码后的html代码  
	 */
	function fEncodeHTML(sStr){
		sStr = sStr.replace(/&/gi,"&amp;");
		sStr = sStr.replace(/</gi,"&lt;");
		sStr = sStr.replace(/>/gi,"&gt;");
		sStr = sStr.replace(/\"/gi,"&quot;");
		sStr = sStr.replace(/\'/gi,"&apos;");
		sStr = sStr.replace(/\n/gi,"</br>");
		sStr = sStr.replace(/ /gi,"&nbsp;");
		return sStr;
	};
	/**
	 * html解码，替换掉html编码
	 * @method  decodeHTML
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} sStr 解码后的html代码  
	 */
	function fDecodeHTML(sStr){
		sStr = sStr.replace(/&lt;/gi,"<");
		sStr = sStr.replace(/&gt;/gi,">");
		sStr = sStr.replace(/&quot;/gi,"\"");
		sStr = sStr.replace(/&apos;/gi,"\'");
		sStr = sStr.replace(/<\/?br>/gi,"\n");
		sStr = sStr.replace(/&amp;/gi,"&");
		sStr = sStr.replace(/&nbsp;/gi," ");
		return sStr;
	};
	/**
	 * html转换为纯文本
	 * @param {string}sHtml 参数html
	 * @param {boolean}bIgnore 是否忽略换行
	 * @return {string} 返回纯文本
	 */
	function fHtmlToTxt(sHtml,bIgnore){
		sHtml = sHtml.replace(/\n/ig, "");
		sHtml = sHtml.replace(/\\s+/ig, "");
		if(!bIgnore){
			// 替换块级标签为换行符
			sHtml = sHtml.replace(/<\/(address|blockquote|center|dir|div|dl|fieldset|form|hr|h[1-6]|isindex|iframe|menu|ol|p|pre|table|ul)>/gi,"\n");
			// 替换换行符
			sHtml = sHtml.replace(/<br>/gi, "\n");
		}
		// 处理列表
		sHtml = sHtml.replace(/<li>/gi, " . ");
		// 消除遗留html标签
		sHtml = sHtml.replace(/<[^>]+>/g, "");
		// 处理转义字符
		sHtml = String.decodeHTML(sHtml);
		return sHtml;
	}
	/**
	 * 纯文本转换为html
	 * @param {string}sContent 参数纯文本
	 * @return {string} 返回hmlt片段
	 */
	function fTxtToHtml(sContent){
		return String.encodeHTML(sContent);
	}
	/**
	 * 去掉字符串两边的空格
	 * @method  trim
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} sStr 去掉两边空格后的字符串  
	 */
	function fTrim(sStr){
		sStr = sStr.replace(/(^(\s|　)+)|((\s|　)+$)/g, ""); 
		return sStr;
	}

	/**
	 * 检查字符串是否含有"% \' \" \\ \/ "的字符
	 * @method  check
	 * @param  {string} sStr 需要操作的字符串
	 * @param   {Object}rKey 需要寻找的字符正则匹配	
	 * @return  {boolean} 如果没有特殊字符返回false,否则返回true
	 */
	function fCheck(sStr,rKey){
		if(!rKey){
			rKey=/[,%\'\"\/\\;|\<\>\^]/;
		}
		return sStr.search(rKey)>-1;
	};
	/**
	 * 计算字符串打印长度,一个中文字符长度为2
	 * @method  len
	 * @param  {string} sStr 需要操作的字符串
	 * @return {number} 字符串的长度    
	 */
	function fLen(sStr){
		return sStr.replace(/[^\x00-\xff]/g,"**").length;
	};
	/**
	 * 截取字符串左边n位
	 * @method  left
	 * @param  {string} sStr 需要操作的字符串
	 * @param  {number} nLength	要截取的位数
	 * @param  {number|boolean} nEllipsisLength	省略号长度
	 * @return {string} 被截取后的字符串
	 */
	function fLeft(sStr,nLength,nEllipsisLength){
		if(String.len(sStr)>nLength){
			// 如果传递的是boolean，并且为true，默认为两个字符的缩略
			if(nEllipsisLength===true){
				nEllipsisLength = 2;
			// 非大于0的变量，设置为0
			}else if(!(nEllipsisLength>0)){
				nEllipsisLength = 0;
			}
			var i = 0;
			var j = 0;
			nLength = nLength-nEllipsisLength;
			while(j<nLength){
				if(sStr.charCodeAt(i)>255){
					j += 2;
				}else{
					j ++;
				}
				i ++;
			}
			sStr = sStr.substring(0,i);
			for(var i=0;i<nEllipsisLength;i++){
				sStr+='.';
			}
		}
		return sStr;
	};
	/**
	 * 判断是否数字
	 * @method  isNumStr
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否数字   
	 */
	function fIsNumStr(sStr){
		return (sStr.search(/^\d+$/g) == 0);
	}
	/**
	 * 判断是否包含中文
	 * @method  hasChn
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否包含中文   
	 */
	function fHasChn(sStr){
		return /[\u4E00-\u9FA5]+/.test(sStr);
	}
	/**
	 * 判断是否是中文
	 * @method  isChn
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否是中文
	 */
	function fIsChn(sStr){
		return /^[\u4E00-\u9FA5]+$/.test(sStr);
	}
	
	return String;
});
/**
 * Cookie工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Cookie',function(){
	
	var Cookie={
		getCookie     : fGetCookie,    //获取cookie
		setCookie     : fSetCookie,    //设置cookie
		delCookie     : fDeleteCookie  //删除cookie
	}
	
	/**
	 * 获取cookie
	 * @param   {string}sName cookie的name
	 * @param   {boolean}bNotUnescape 不解码
	 */
	function fGetCookie(sName,bNotUnescape) {
		var sSearch = sName + "=";
		var sValue = "";
		var sCookie = document.cookie;
		if(sCookie.length > 0){
			var nOffset = sCookie.indexOf(sSearch);
			if(nOffset != -1){
				nOffset += sSearch.length;
				var sEnd = sCookie.indexOf(";", nOffset);
				if(sEnd == -1){
					sEnd = sCookie.length;
				}
				sValue = sCookie.substring(nOffset, sEnd);
				//需要解码
				if(!bNotUnescape){
					sValue = unescape(sValue);
				}
			}
		}
		return sValue;
	}
	/**
	 * 设置cookie
	 * @method  setCookie(sName, sValue[,oOptions])
	 * @param {string}sName cookie的name
	 * @param {string}sValue cookie的value
	 * @param {Object}oOptions{
	 * 		{string}path    : cookie的path,根目录为"/",
	 * 		{string}domain  : cookie的domain,
	 * 		{string}expires : cookie的expires,值为GMT(格林威治时间)格式的日期型字符串,如：new Date().toGMTString(),
	 *      {boolean}secure : 是否有secure属性
	 * }
	 */
	function fSetCookie(sName, sValue, oOptions) {
		var aParam = [];
		if(sName!==undefined&&sValue!==undefined){
			aParam.push(sName + "=" + escape(sValue));
		}
		if(oOptions){
			if(oOptions.path!==undefined){
				aParam.push("path=" + oOptions.path);
			}
			if(oOptions.domain!==undefined){
				aParam.push("domain=" + oOptions.domain);
			}
			if(oOptions.expires!==undefined){
				aParam.push("expires=" + oOptions.expires);
			}
			if(oOptions.secure){
				aParam.push("secure");
			}
		}
		document.cookie = aParam.join(";");
	}
	/**
	 * 删除cookie
	 * @param {string}sName cookie的name
	 */
	function fDeleteCookie(sName){
		//当前时间
	    var oDate = new Date();
	    //设置为过期时间
	    oDate.setTime(oDate.getTime() - 1);
	    document.cookie = sName + "=;expires=" + oDate.toGMTString();
	}
	
	return Cookie;
});
/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Util','B.Object',function(Object){
	
	var Util={
		isWindow         : fIsWindow,          //检查是否是window对象
		uuid             : fUuid,              //获取handy内部uuid
		getDefFontSize   : fGetDefFontSize,    //获取默认字体大小
		setDefFontSize   : fSetDefFontSize,    //设置默认字体大小
		em2px            : fEm2px,             //em转化为px
		px2em            : fPx2em,             //px转化为em
		position         : fPosition,          //获取节点位置
		result           : fResult             //如果对象中的指定属性是函数, 则调用它, 否则, 返回它
	}
	
	var _nUuid=0;
	var _defFontSize;
	
	/**
	 * 检查是否是window对象
	 * @method  isWindow
	 * @param {*}obj 参数对象
	 * @return  {boolean}
	 */
	function fIsWindow( obj ) {
		return obj != null && obj == obj.window;
	}
	/**
	 * 获取handy内部uuid
	 * @method  uuid
	 * @return  {number}  返回uuid
	 */
	function fUuid(){
		return ++_nUuid;
	}
	/**
	 * 获取默认字体大小
	 * @param {element=}oParent 需要检测的父元素，默认是body
	 * @return {number} 返回默认字体大小(px单位)
	 */
	function fGetDefFontSize(oParent) {
		var bGlobal=!oParent;
		if(bGlobal&&_defFontSize){
			return _defFontSize;
		}
		oParent = oParent || document.body;
		var oDiv = document.createElement('div');
		oDiv.style.cssText = 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';
		oDiv.appendChild(document.createTextNode('M'));
		oParent.appendChild(oDiv);
		var nSize = oDiv.offsetHeight;
		if(bGlobal){
			_defFontSize=nSize;
		}
		oParent.removeChild(oDiv);
		return nSize;
	}
	/**
	 * 设置默认字体大小
	 * @param {number|string}size 需要设置的字体大小
	 * @param {element=}oParent 需要检测的父元素，默认是body
	 */
	function fSetDefFontSize(size,oParent){
		oParent = oParent || document.body;
		if(typeof size=='number'){
			size+='px';
		}
		oParent.style.fontSize=size;
	}
	/**
	 * em转化为px
	 * @param {number}nEm 参数em值
	 * @return {number} 返回相应px值
	 */
	function fEm2px(nEm){
		if(typeof nEm==='string'){
			nEm=parseFloat(nEm.replace('em',''));
		}
		var nDef=Util.getDefFontSize();
		return Math.floor(nEm*nDef);
	}
	/**
	 * px转化为em
	 * @param {number}nPx 参数px值
	 * @return {number} 返回相应em值
	 */
	function fPx2em(nPx){
		var nDef=Util.getDefFontSize();
		var nEm=1/nDef*nPx;
  		nEm=Math.ceil(nEm*1000)/1000;
  		return nEm;
	}
	/**
	 * 获取节点位置
	 * @param {element}el
	 * @return {object} {
	 * 		{number}left:左边偏移量,
	 * 		{number}top:顶部偏移量
	 * }
	 */
	function fPosition(el){
		var nLeft=0;
		var nTop=0;
　　　　 while(el){
			nLeft += el.offsetLeft;
			nTop+=el.offsetTop;
			el = el.offsetParent;
　　　　 }
　　　　 return {top:nTop,left:nLeft};
	}
	/**
	 * 如果对象中的指定属性是函数, 则调用它, 否则, 返回它
	 * @method result
	 * @param {Object}oObj 参数对象
	 * @param {string}sProp
	 * @return {*} 如果指定属性值是函数, 则返回该函数执行结果, 否则, 返回该值
	 */
	function fResult(oObj,sProp){
		var value=oObj[sProp];
		if(Object.isFunc(value)){
			return value();
		}else{
			return value;
		}
	}
	
	return Util;
	
});
/**
 * Url工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define("B.Url","B.Object",function(Object){
	
	var Url={
		isUrl           : fIsUrl,           //是否是url
		isAbsUrl        : fIsAbsUrl,        //是否是绝对路径url
		isPic           : fIsPic,           //是否是图片
		paramToStr      : fParamToStr,      //将对象转化为url参数字符串
		strToParam      : fStrToParam,      //将url参数字符串转化为对象
		getQuery        : fGetQuery,        //获取query字符串
		setQuery        : fSetQuery,        //设置query字符串
		getQueryParam   : fGetQueryParam,   //获取url里的get参数
		setQueryParam   : fSetQueryParam,   //设置url的get参数
		getHash         : fGetHash,         //获取hash
		setHash         : fSetHash,         //设置hash
		getHashParam    : fGetHashParam,    //获取hash参数
		setHashParam    : fSetHashParam     //设置hash参数
	}
	/**
	 * 是否是url
	 * @param {string}sParam 参数字符串
	 * @return {boolean} true表示是url
	 */
	function fIsUrl(sParam){
		return /^(\w+:\/\/)?(\w+\.\w+)?[\w\/\.]+/.test(sParam);
	}
	/**
	 * 是否是绝对路径url
	 * @param {string}sParam 参数字符串
	 * @return {boolean} true表示是绝对路径url
	 */
	function fIsAbsUrl(sParam){
		return /^(\w+:\/\/)?\w+\.\w+/.test(sParam);
	}
	/**
	 * 是否是图片
	 * @param {string}sParam 参数字符串
	 * @return {boolean} true表示是图片
	 */
	function fIsPic(sParam){
		return /\.(jpg|jpeg|png|bmp|gif)$/.test(sParam);
	}
	/**
	 * 将对象转化为url参数字符串
	 * @param {object}oParams 参数对象
	 * @return {string} 返回字符串参数
	 */
	function fParamToStr(oParams){
		var aUrl=[];
		for(var k in oParams){
			aUrl.push(k+'='+oParams[k]);
		}
		return aUrl.join('&');
	}
	/**
	 * 将url参数字符串转化为对象
	 * @param {string}sStr 字符串参数
	 * @return {object}oParams 参数对象
	 */
	function fStrToParam(sStr){
		if(!sStr){
			return {};
		}
		var aParams=sStr.split('&');
		var oParams={};
		for(var i=0,len=aParams.length;i<len;i++){
			var o=aParams[i].split('=');
			oParams[o[0]]=o[1];
		}
		return oParams;
	}
	/**
	 * 获取query字符串
	 * @param {string}sUrl 参数url，传空值表示获取当前地址栏url
	 * @return {string} 返回query(不带"?")
	 */
	function fGetQuery(sUrl){
		var sQuery=sUrl?sUrl.substring(sUrl.indexOf('?')+1,sUrl.indexOf('#')):top.location.search.substring(1);
		return sQuery;
	}
	/**
	 * 设置query字符串
	 * @param {string}sUrl 参数url，传空值表示设置当前地址栏url
	 * @param {string}sQuery 要设置的query字符串(不带"?")
	 * @return {string} 返回设置好的url
	 */
	function fSetQuery(sUrl,sQuery){
		if(sUrl){
			var nHashIndex=sUrl.indexOf('#');
			sUrl=sUrl.substring(0,sUrl.indexOf('?')+1)+sQuery+(nHashIndex>0?sUrl.substring(nHashIndex):'');
			return sUrl;
		}else{
			top.location.search="?"+sQuery;
			return top.location.href;
		}
	}
	/**
	 * 获取query参数
	 * @param {string}sUrl null表示获取地址栏hash
	 * @param {string=}sParam 不传表示获取所有参数
	 * @return {string|object} 返回对应hash参数，sParam不传时返回object类型(所有参数)
	 */
	function fGetQueryParam(sUrl,sParam){
		var sQuery=Url.getQuery(sUrl);
		var oParams=Url.strToParam(sQuery);
		return sParam?oParams[sParam]:oParams;
	}
	/**
	 * 设置query参数
	 * @param {string}sUrl null表示设置地址栏hash
	 * @param {object} oHashParam要设置的hash参数
	 * @return {string=} 传入sUrl时，返回设置过hash参数的url
	 */
	function fSetQueryParam(sUrl,oHashParam){
		var sQuery=Url.getQuery(sUrl);
		var oParams=Url.strToParam(sQuery);
		Object.extend(oParams,oHashParam);
		sQuery=Url.paramToStr(oParams);
		return Url.setQuery(sUrl,sQuery);
	}
	/**
	 * 获取hash字符串
	 * @param {string}sUrl 参数url，传空值表示获取当前地址栏url
	 * @return {string} 返回hash(不带"#")
	 */
	function fGetHash(sUrl){
		var sHash=sUrl?sUrl.substring(sUrl.indexOf('#')+1):top.location.hash.substring(1);
		return sHash;
	}
	/**
	 * 设置hash字符串
	 * @param {string}sUrl 参数url，传空值表示设置当前地址栏url
	 * @param {string}sHash 要设置的hash字符串(不带"#")
	 * @return {string} 返回设置好的url
	 */
	function fSetHash(sUrl,sHash){
		if(sUrl){
			sUrl=sUrl.substring(0,sUrl.indexOf('#')+1)+sHash;
			return sUrl;
		}else{
			top.location.hash="#"+sHash;
			return top.location.href;
		}
	}
	/**
	 * 获取hash参数
	 * @param {string}sUrl 空值表示获取地址栏hash
	 * @param {string=}sParam 不传表示获取所有参数
	 * @return {string|object} 返回对应hash参数，sParam不传时返回object类型(所有参数)
	 */
	function fGetHashParam(sUrl,sParam){
		var sHash=Url.getHash(sUrl);
		var oParams=Url.strToParam(sHash);
		return sParam?oParams[sParam]:oParams;
	}
	/**
	 * 设置hash参数
	 * @param {string}sUrl 空值表示设置地址栏hash
	 * @param {object} oHashParam要设置的hash参数
	 * @return {string=} 传入sUrl时，返回设置过hash参数的url
	 */
	function fSetHashParam(sUrl,oHashParam){
		var sHash=Url.getHash(sUrl);
		var oParams=Url.strToParam(sHash);
		Object.extend(oParams,oHashParam);
		sHash=Url.paramToStr(oParams);
		return Url.setHash(sUrl,sHash);
	}
	
	return Url;
});
/**
 * 数组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Array','B.Object',function(Object){
	
	var Arr={
		map           : fMap,          //映射每一个值, 通过一个转换函数产生一个新的数组
		pluck         : fPluck,        //提取集合里指定的属性值
		some          : fSome,         //检查集合是否包含某种元素
		every         : fEvery,        //检查是否每一个元素都符合
		indexOf       : fIndexOf,      //返回元素 value 在数组 array 里的索引位置
		find          : fFind,         //查找元素，只返回第一个匹配的元素
		filter        : fFilter,       //过滤集合，返回所有匹配元素的数组
		where         : fWhere,        //返回包含指定 key-value 组合的对象的数组
		findWhere     : fFindWhere,    //返回包含指定 key-value 组合的第一个对象
		invoke        : fInvoke,       //在集合里的每个元素上调用指定名称的函数
		sortedIndex   : fSortedIndex,  //获取 value 插入到排好序的 list 里的所在位置的索引.
		sortBy        : fSortBy,       //排序
		groupBy       : fGroupBy(),    //把一个集合分为多个集合
		countBy       : fCountBy()     //把一个数组分组并返回每一组内对象个数
	}
	
	/**
	 * 返回对象本身，用来充当迭代函数
	 * @param {*}value
	 * @return {*}value
	 */
	function _fIdentity(value){
		return value;
	}
	/**
	 * 返回获取对象指定属性的函数，用于充当迭代器
	 * @param {string}sKey 参数属性
	 * @return {Function} 返回迭代函数
	 */
	function _fProperty(sKey){
		return function(obj){
			return obj[sKey];
		}
	}
	/**
	 * 获取迭代函数
	 * @param {Function|string=}value 为空时返回获取本身的迭代函数，为字符串时返回获取该属性的迭代函数，如果是函数则返回自身
	 * @return {Function} 返回迭代函数
	 */
	function _fGetIterator(value) {
	    if (value == null){
	    	return _fIdentity;
	    }
	    if ($H.isFunc(value)){
	    	return value;
	    }
	    return _fProperty(value);
	}
	/**
	 * 返回判断对象是否包含指定key-value 组合的函数
	 * @param {Object}oAttrs
	 * @return {Function} 返回判断函数
	 */
	function _fMatches(oAttrs) {
	    return function(obj) {
	        if (obj === oAttrs){
	      	    return true;
	        }
	        for (var key in oAttrs) {
	            if (oAttrs[key] !== obj[key]){
	                return false;
	            }
	        }
	        return true;
	    }
	}
	/**
	 * 分组，具体分组依赖分组行为函数
	 * @param {Function}fBehavior 分组行为函数，决定如何分组
	 * @param {Object}返回分组结果
	 */
	function _fGroup(fBehavior) {
	    return function(obj, iterator, context) {
	        var oResult = {};
	        iterator = _fGetIterator(iterator);
	        Object.each(obj, function(index,value) {
	            var key = iterator.call(context, value, index, obj);
	            fBehavior(oResult, key, value);
	        });
	        return oResult;
	    };
	};
	/**
	 * 映射每一个值, 通过一个转换函数产生一个新的数组. 
	 * 如果有原生的 map 函数, 将用之代替. 如果 list 是一个 JavaScript 对象, 
	 * iterator的参数将会是 (value, key, list).
	 * @param {Array|Object}obj 参数对象
	 * @param {function}fIterator(value,nIndex) 转换函数，参数依次是值、索引
	 * @param {*}context 转换时的上下文对象
	 * @return {Array} 返回转换后的数组
	 */
	function fMap(obj, fIterator, context){
		var aResults = [];
	    if (obj == null) return aResults;
	    var fNativeMap=Array.prototype.map;
	    if (fNativeMap && obj.map === fNativeMap){
	    	return obj.map(fIterator, context);
	    }
	    Object.each(obj, function(index,value) {
	        aResults.push(fIterator.call(context, value, index));
	    });
	    return aResults;
	}
	/**
	 *  提取集合里指定的属性值
	 *  @param {Array|Object}obj 参数对象
	 *  @param {string}sKey 参数属性
	 *  @return {Array} 返回集合对应属性的数组
	 */
	function fPluck(obj,sKey){
		return this.map(obj,_fProperty(sKey));
	}
	/**
	 * 检查集合是否包含某种元素，对集合中的每个元素都执行一次指定的函数（callback），直到此函数返回 true，
	 * 如果发现这个元素，some 将返回 true，如果回调函数对每个元素执行后都返回 false ，some 将返回 false。
	 * 它只对集合中的非空元素执行指定的函数，没有赋值或者已经删除的元素将被忽略。
	 * @param {Array|Object}obj 参数对象
	 * @param {Function}fPredicate 判断函数，有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 回调函数上下文对象
	 * @return {boolean} true表示集合存在指定元素
	 */
	function fSome(obj, fPredicate, context) {
	    var bResult = false;
	    if (obj == null||!fPredicate){
	    	return bResult;
	    }
	    var fNativeSome=Array.prototype.some;
	    if (fNativeSome && obj.some === fNativeSome){
	    	return obj.some(fPredicate, context);
	    }
	    $H.each(obj, function(index,value, obj) {
	        if (bResult || (bResult = fPredicate.call(context, value, index, obj))){
	      	    return false;
	        }
	    });
	    return !!bResult;
	}
	/**
	 * 检查是否每一个元素都符合，对集合中的每个元素都执行一次指定的函数（callback），直到此函数返回 false，
	 * 如果发现这个元素，every 将返回 false，如果回调函数对每个元素执行后都返回 true ，every 将返回 true。
	 * 它只对集合中的非空元素执行指定的函数，没有赋值或者已经删除的元素将被忽略
	 * @param {Array|Object}obj 参数对象
	 * @param {Function}fPredicate 判断函数，有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 回调函数上下文对象
	 * @return {boolean} 如果所有元素都符合则返回true，否则返回false
	 */
	function fEvery(obj, fPredicate, context) {
	    var result = true;
	    if (obj == null||!fPredicate){
	    	return result;
	    }
	    var fNativeEvery=Array.prototype.every;
	    if (fNativeEvery && obj.every === fNativeEvery){
	    	return obj.every(fPredicate, context);
	    }
	    $H.each(obj, function(index,value, list) {
	      if (!(result=fPredicate.call(context, value, index, list))){
	      	  return false;
	      }
	    });
	    return !!result;
	}
	/**
	 * 返回元素 value 在数组 array 里的索引位置, 如果元素没在数组 array 中, 将返回 -1. 
	 * 此函数将使用原生的 indexOf 方法, 除非原生的方法无故消失或者被覆盖重写了, 才使用非原生的. 
	 * 如果您要处理一个大型数组, 而且确定数组已经排序, 参数 isSorted 可以传 true, 
	 * 函数将使用更快的二分搜索来进行处理,或者, 传一个数字作为 第三个参数, 以便于在指定索引之后开始寻找对应值.
	 * @param {Array}array 待查找的数组
	 * @param {*}item 带查找的元素
	 * @param {boolean|number=}isSorted true表示数组已排序，可以使用二分查找，如果是数字，表示起始查找索引
	 * @return {number}
	 */
     function fIndexOf(array, item, isSorted) {
	     if (array == null){
	     	return -1;
	     }
	     var i = 0, length = array.length;
	     if (isSorted) {
	         if (typeof isSorted == 'number') {
	             i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
	         } else {
	         	i = Arr.sortedIndex(array, item);
	         	return array[i] === item ? i : -1;
	         }
	     }
	     var fNativeIndexOf=Array.prototype.indexOf;
	     if ( fNativeIndexOf&& array.indexOf === fNativeIndexOf){
	     	return array.indexOf(item, isSorted);
	     }
	     for (; i < length; i++){
	     	if (array[i] === item){
	     		return i;
	     	}
	     }
	     return -1;
	}
	/**
	 * 查找元素，只返回第一个匹配的元素，对集合中的每个元素都执行一次指定的函数（callback），直到此函数返回 true，
	 * 如果发现这个元素，将返回此元素，如果回调函数对每个元素执行后都返回 false ，将返回undefined。
	 * 它只对集合中的非空元素执行指定的函数，没有赋值或者已经删除的元素将被忽略。
	 * @param {Array|Object}obj 参数对象
	 * @param {Function}fPredicate 判断函数，有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 回调函数上下文对象
	 * @return {*} 返回找到的元素，如果没找到，返回undefined
	 */
	function fFind(obj, fPredicate, context) {
	    var result;
	    this.some(obj, function(value, index, list) {
	        if (fPredicate.call(context, value, index, list)) {
	       	    result = value;
	            return true;
	        }
	    });
	    return result;
	}
	/**
	 * 过滤集合，返回所有匹配元素的数组，对集合中的每个元素都执行一次指定的函数（callback），并且创建一个新的数组，
	 * 该数组元素是所有回调函数执行时返回值为 true 的原集合元素。它只对数组中的非空元素执行指定的函数，
	 * 没有赋值或者已经删除的元素将被忽略，同时，新创建的数组也不会包含这些元素。
	 * @param {Array|Object}obj 参数对象
	 * @param {Function}fPredicate 判断函数，返回true则添加到结果中，有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 回调函数上下文对象
	 * @return {Array} 返回包含所有匹配元素的数组，如果没找到，返回空数组
	 */
	function fFilter(obj, fPredicate, context) {
	    var results = [];
	    if (obj == null){
	    	return results;
	    }
	    var fNativeFilter=Array.prototype.filter;
	    if (fNativeFilter && obj.filter === fNativeFilter){
	    	return obj.filter(fPredicate, context);
	    }
	    $H.each(obj, function(index,value, list) {
	        if (fPredicate.call(context, value, index, list)){
	      	    results.push(value);
	        }
	    });
	    return results;
	}
	/**
	 * 返回包含指定 key-value 组合的对象的数组
	 * @param {Array}obj 参数对象
	 * @param {Object}oAttrs key-value 组合
	 * @return {Array} 返回匹配对象的数组，如果没有，则返回空数组
	 */
	function fWhere(obj, oAttrs) {
        return this.filter(obj, _fMatches(oAttrs));
    }
	/**
	 * 返回包含指定 key-value 组合的第一个对象
	 * @param {Array}obj 参数对象
	 * @param {Object}oAttrs key-value 组合
	 * @return {*} 返回匹配的结果，如果没有则返回undefined
	 */
    function fFindWhere(obj, oAttrs) {
        return this.find(obj, _fMatches(oAttrs));
    }
	/**
	 * 在集合里的每个元素上调用指定名称的函数
	 * @param {Array|Object}obj 参数对象
	 * @param {Function|string}method 函数或者函数名
	 * @return {Array} 返回method函数执行结果的数组
	 */
	function fInvoke(obj,method){
		var aArgs = Array.prototype.slice.call(arguments, 2);
        var bIsFunc = Object.isFunc(method);
        return this.map(obj, function(value) {
            return (bIsFunc ? method : value[method]).apply(value, aArgs);
        });
	}
	/**
	 * 为了保持 list 已经排好的顺序, 使用二分搜索来检测 value 应该 插入到 list 里的所在位置的索引. 
	 * 如果传入了一个 iterator , 它将用来计算每个值的排名, 包括所传的 value 参数.
	 * @param {Array}array 要查找的数组
	 * @param {*}obj 待插入的值
	 * @param {Function|string=}iterator 为空时返回获取本身的迭代函数，为字符串时返回获取该属性的迭代函数，
	 * 							如果是函数则返回自身,有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 迭代器执行上下文对象
	 * 
	 */
    function fSortedIndex(array, obj, iterator, context,bDesc) {
	    iterator = _fGetIterator(iterator);
	    var value = iterator.call(context, obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	        var mid = (low + high) >>> 1;
	        var val=iterator.call(context, array[mid]);
	        (bDesc ? val>value:val< value )? low = mid + 1 : high = mid;
	    }
	    return low;
	}
	/**
	 * 排序
	 * @param {Array}obj 参数对象
	 * @param {Function|string=}iterator 为空时返回获取本身的迭代函数，为字符串时返回获取该属性的迭代函数，
	 * 							如果是函数则返回自身,有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 判断函数上下文对象
	 * @param {boolean=}bDesc 是否是降序
	 * @return {Array} 返回排序过后的集合
	 */
	function fSortBy(obj, iterator, context,bDesc) {
		var me=this;
	    iterator = _fGetIterator(iterator);
	    return me.pluck(me.map(obj, function(value, index, list) {
	        return {
	       	    value: value,
	            index: index,
	            criteria: iterator.call(context, value, index, list)
	      };
	    }).sort(function(left, right) {
	        var a = left.criteria;
	        var b = right.criteria;
	        if (a !== b) {
	            if (a > b || a === void 0){
	            	return bDesc?-1:1;
	            }
	            if (a < b || b === void 0){
	            	return bDesc?1:-1;
	            }
	        }
	        return left.index - right.index;
	    }), 'value');
	}
	/**
	 * 把一个集合分为多个集合, 通过 iterator 返回的结果进行分组. 如果 iterator 是一个字符串而不是函数, 
	 * 那么将使用 iterator 作为各元素的属性名来对比进行分组
	 * @method groupBy(array,iterator,context)
	 * @param {Array}array 参数数组
	 * @param {Function|string=}iterator 为空时返回获取本身的迭代函数，为字符串时返回获取该属性的迭代函数，
	 * 							如果是函数则返回自身,有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 判断函数上下文对象
	 * @return {Object} 返回分组结果
	 * @example Array.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); });
	 * 			=> {1: [1.3], 2: [2.1, 2.4]}
	 * 			Array.groupBy(['one', 'two', 'three'], 'length');
	 * 			=> {3: ["one", "two"], 5: ["three"]}
	 */
    function fGroupBy(){
	    return _fGroup(function(oResult, key, value) {
		    oResult[key] ? oResult[key].push(value) : oResult[key] = [value];
		})
    }
    /**
	 * 把一个数组分组并返回每一组内对象个数. 与 groupBy 相似, 但不是返回一组值, 而是组内对象的个数
	 * @method countBy(array,iterator,context)
	 * @param {Array}array 参数数组
	 * @param {Function|string=}iterator 为空时返回获取本身的迭代函数，为字符串时返回获取该属性的迭代函数，
	 * 							如果是函数则返回自身,有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 判断函数上下文对象
	 * @return {Object} 返回统计结果
	 * @example Array.countBy([1, 2, 3, 4, 5], function(num) {return num % 2 == 0 ? 'even': 'odd';});
	 * 			=> {odd: 3, even: 2}
	 */
    function fCountBy(){
	    return _fGroup(function(oResult, key) {
		    oResult[key] ? oResult[key]++ : oResult[key] = 1;
		})
    }
	
	return Arr;
	
});
/**
 * 地理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Geo',function(){
	
	var Geo={
		distance         : fDistance          //计算两点距离(单位为km，保留两位小数)
	}
	
	/**
	 * 计算两点距离(单位为km，保留两位小数)
	 * @param {Object|Array|Model}oCoord1 参数坐标1
	 * 				Object类型{
	 * 					{number}latitude:纬度,
	 * 					{number}longitude:经度
	 * 				}
	 * 				Array类型[{number}latitude,{number}longitude]
	 * 				Model类型，包含latitude和longitude属性
	 * @param {Object|Array}oCoord2 参数坐标2
	 * @param {boolean=}bFormat 仅当false时不进行格式化：单位是km(取两位小数)，如：32120->3.21km
	 * @return {number} 返回两点间的距离
	 */
	function fDistance(oCoord1,oCoord2,bFormat){
		if(!oCoord1||!oCoord2){
			return;
		}
		/** 
         * 求某个经纬度的值的角度值 
         * @param {Object} degree 
         */  
        function _fRad(nDegree){  
            return nDegree*Math.PI/180;  
        }
        /**
         * 格式化输入数据，返回数组形式
         */
        function _fFormatData(oCoord){
        	if(oCoord.get){
	        	oCoord=[oCoord.get("latitude"),oCoord.get("longitude")];
	        }else if($H.isObj(oCoord)){
	        	oCoord=[oCoord.latitude,oCoord.longitude];
	        }
	        return oCoord;
        }
        var EARTH_RADIUS = 6371,nLat1,nLng1,nLat2,nLng2;
        oCoord1=_fFormatData(oCoord1);
    	nLat1=oCoord1[0];
        nLng1=oCoord1[1];
        oCoord2=_fFormatData(oCoord2);
        nLat2=oCoord2[0];
        nLng2=oCoord2[1];
        var nRadLat1 = _fRad(nLat1);
	    var nRadLat2 = _fRad(nLat2);
	    var nDistance = EARTH_RADIUS
						* Math.acos(Math.cos(nRadLat2) * Math.cos(nRadLat1)
						* Math.cos(_fRad(nLng1) - _fRad(nLng2))
						+ Math.sin(nRadLat2)
						* Math.sin(nRadLat1));
	    nDistance=nDistance.toFixed(2);
	    if(bFormat!=false){
	    	if(isNaN(nDistance)){
			    //TODO 可能是计算精度的原因，相同坐标计算结果是NaN
	    		if(nLat1==nLat2&&nLng1==nLng2&&$H.isNum(nLat1)&&$H.isNum(nLng1)){
	    			nDistance=0;
	    		}else{
		    		return '未知';
	    		}
	    	}
	    	nDistance+='km';
	    }
	    return nDistance;
	}
	
	return Geo;
	
});
/**
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Template',['B.Object','B.String','B.Debug','B.Function'],function(Object,String,Debug,Function){
		
	var T={
		//配置
		openTag         : '{{',            //模板语法开始标签
		closeTag        : '}}',            //模板语法结束标签
		isTrim          : true,            //是否过滤标签间空白和换行
		isEscape        : false,           //是否开启js变量输出转义
		
		getIfPlusJoin   : fGetIfPlusJoin,  //获取是否使用+连接字符串 
		registerHelper  : fRegisterHelper, //添加辅助函数
		tmpl            : fTmpl            //编译/渲染模板
	};
	
	var _cache={},                //缓存
		_aCode,                   //存储用于生成模板函数的代码字符串
		_valPreReg=/^=/,          //简单替换正则
		_isNewEngine=''.trim,     //''.trim同'__proto__' in {}，测试浏览器是否是新引擎，一般新引擎+会快些，旧式引擎使用数组join形式
		_nLogicNum=0,             //逻辑编号，生成抽象语法树时使用
		//字符拼接的声明及收尾
		_aJoinDefine=[           
			'var $r='+(_isNewEngine?'""':'[]')+',$tmp,helper;',
			'return '+(_isNewEngine?'$r;':'$r.join("");')
		],
		
		//辅助函数
		_helpers={
			'default':{
				'if':_fIf,
				'unless':_fUnless,
				'each':_isNewEngine?_fEach:_fEachOld,
				escape:_fEscapeHTML,
				trim:String.trim
			}
		};
	/**
	 * 转化为字符串，除字符串、数字外都转为空字符，如：undefined、null转化为''
	 * @param {*}value 参数值
	 * @return 返回字符串
	 */
	function _fToString(value) {
		var sType=typeof value;
        if (sType!== 'string') {
            if (sType === 'number') {
                value += '';
            } else {
                value = '';
            }
        }
        return value;
    }
	/**
	 * html编码
	 * @param {*}content 待编码参数
	 * @return {string} 返回编码后的html
	 */
    function _fEscapeHTML(content) {
        return String.encodeHTML(_fToString(content));
    }	
	/**
	 * if辅助函数
	 * @param {string|function}condition 条件语句
	 * @param {object}oOptions 选项{
	 * 		{boolean=}inverse:true时表示条件反转,
	 * 		{function}fn:回调函数,
	 * 		{string}exp:表达式,
	 * 		{object}context:模板函数执行上下文对象,
	 * 		{number}num:逻辑编号,
	 * 		{object}helpers:辅助函数表
	 * }
	 * @return {string=} 返回生成的html
	 */
	function _fIf(condition,oOptions){
		var data=oOptions.data;
		if (Object.isFunc(condition)) { 
			condition = condition.call(data); 
		}
		if((condition&&!oOptions.inverse)||(!condition&&oOptions.inverse)){
			return oOptions.fn(data);
		}
	}
	/**
	 * unless辅助函数
	 * 参数说明同if辅助函数
	 */
	function _fUnless(condition, oOptions){
		oOptions.inverse=true;
		return oOptions.helpers['if'].call(this, condition, oOptions);
	}
	/**
	 * each辅助函数，新式浏览器里使用，chrome下性能大约提升一倍
	 * @param {array|object}data 可遍历数据对象
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @return {string=} 返回生成的html
	 */
	function _fEach(data,oOptions){
		var fn=oOptions.fn,r='';
		//这里为了优化性能，使用原生循环，比换成Object.each整体性能提升5~10%左右
		if(!data){
			return;
		}
		if(data.length!==undefined){
			for(var i=0,l=data.length;i<l;i++){
				r+=fn(data[i]);
			}
		}else{
			for(var i in data){
				r+=fn(data[i]);
			}
		}
		return r;
	}
	/**
	 * each辅助函数，使用数组拼接字符串，在旧式浏览器中使用
	 * 同上个each
	 */
	function _fEachOld(data,oOptions){
		var fn=oOptions.fn,aResult=[];
		//这里为了优化性能，使用原生循环，比换成Object.each整体性能提升5~10%左右
		if(!data){
			return;
		}
		if(data.length!==undefined){
			for(var i=0,l=data.length;i<l;i++){
				aResult.push(fn(data[i]));
			}
		}else{
			for(var i in data){
				aResult.push(fn(data[i]));
			}
		}
		return aResult.join('');
	}
	/**
	 * 结果函数添加一行字符串
	 * @method _fAddLine
	 * @param {string}sCode 要添加的代码
	 * @return {string} 返回添加好的代码
	 */
	function _fAddLine(sCode){
		//旧浏览器使用数组方式拼接字符串
        return _isNewEngine?'$r+='+sCode+';':'$r.push('+sCode+');';
	}
	/**
	 * 处理html
	 * @method _fParseHtml
	 * @param {string}sHtml html字符串
	 * @return {string} 返回处理过的html
	 */
	function _fParseHtml(sHtml){
		sHtml=sHtml
			// 引号与反斜杠转义
            .replace(/("|\\)/g, '\\$1')
            // 换行符转义(windows + linux)
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
		return _fAddLine('"'+sHtml+'"');
	}
	/**
	 * 处理脚本
	 * @method _fParseScript
	 * @param {object}oScript AST的script元素
	 * @param {object=}oOptions 选项
	 * @return {string} 返回处理过的脚本
	 */
	function _fParseScript(oScript,oOptions){
		var oOptions=oOptions||{};
		var sExp=oScript.exp.replace(/"/g,'\'');
		sExp=String.trim(sExp).replace(/\s{2,}/g,' ');
		var oHelpers=oOptions.helpers;
		var fGetValue=oHelpers&&oHelpers.getValue;
		var fParseValue=oHelpers&&oHelpers.parseValue;
		var sBlockName=oScript.blockName;
		var aChildren=oScript.children;
		var nNumber=oScript.num;
		var sCode;
		var sAdd='\nif($tmp||$tmp===0){'+_fAddLine('$tmp')+'}';
		var sParams=(oScript.inverse?'inverse:true,':'')+'num:'+nNumber+',context:$me,exp:"'+sExp+'",helpers:$helpers,data:$data}';
		var sGetter=fGetValue?'$helpers.getValue.call($me,"'+sExp+'",$data,{'+sParams+')':'($data&&$data.'+sExp+')';
		//辅助函数
		if(sBlockName){
			var sProgramName='$program'+nNumber;
			sCode='$tmp = $helpers["'+sBlockName+'"].call($me,'+sGetter+', {fn:'+sProgramName+','+sParams+');'+sAdd;
			if(aChildren){
				var aCode=_fCompileAST(aChildren,oOptions);
				var sCodeInner=_aJoinDefine[0]+'\n'+aCode.join('\n')+'\n'+_aJoinDefine[1];
				//插入到变量声明后
				_aCode.splice(2,0,'\nfunction '+sProgramName+'($data){\n'+sCodeInner+'\n}\n');
			}
		}else{
			//辅助函数
			var m;
			//func isChk
			if(m=sExp.match(/([^\s]+)\s([^\n]+)/)){
				//func
				sExp=m[1];
				//m[2]:isChk
				sCode='if (helper = $helpers.'+sExp+') {\n$tmp = helper.call($me,"'+m[2]+'",{'+sParams+'); \n}else{$tmp="";}';
			}else{
				//直接表达式
				sCode='if (helper = $helpers.'+sExp+') {\n$tmp = helper.call($me,"",{'+sParams+'); \n}'+
				  		'else{\nhelper = '+sGetter+'; $tmp = typeof helper === functionType ? helper.call($me,{'+sParams+') : helper;\n'+
				  			(fParseValue?'\n$tmp=$helpers.parseValue'+'.call($me,$tmp,{'+sParams+');':'')+
				  		'}'
				  		T.isEscape?'\n$tmp=escape($tmp);':'';
			}
			sCode+=sAdd;
		}
		return sCode;
	}
	/**
	 * 分析模板，生成基本语法树
	 * @param {string}sTmpl 模板字符串
	 * @param {Object=}oParent 父节点，主要用于递归调用
	 * @return {Object} 返回生成的语法树
	 */
	function _fParseTmpl(sTmpl,oParent){
		if(!sTmpl){
			return;
		}
		
		var oRoot=oParent||{},
		sOpenTag=T.openTag,
		sCloseTag=T.closeTag,
		nIndex,
		aAst;
		if(oRoot.children){
			aAst=oRoot.children;
		}else{
			oRoot.children=aAst=[];
		}
		
		//查找块结束位置
		function _fSearchEnd(sName,sEndTag,sTmpl){
			//查找匹配的结束标签{{/if}}
			var oMacther,oReg=new RegExp(sOpenTag+'[#\/]'+sName+'((?!'+sCloseTag+').)*'+sCloseTag,'ig'),num=0;
			while(oMacther=oReg.exec(sTmpl)){
				if(oMacther[0]==sEndTag){
					if(num==0){
						return oMacther.index;
					}else{
						num--;
					}
				}else{
					num++;
				}
			}
			return -1;
		}
		
		//'<div>{{#if title}}<div>{{title}}</div>{{else}}<div>empty</div>{{/if}}</div>'
		if((nIndex=sTmpl.indexOf(sOpenTag))>=0){
			//'<div>'
			var sHtml=sTmpl.substring(0,nIndex);
			if(sHtml){
				aAst.push({
					html:sHtml
				});
			}
			//'#if title}}<div>{{title}}</div>{{else}}<div>empty</div>{{/if}}</div>'
			sTmpl=sTmpl.substring(nIndex+sOpenTag.length);
			//逻辑块
			if(sTmpl.indexOf('#')==0){
				sTmpl=sTmpl.substring(1);
				var aName=sTmpl.match(/^[a-z]+/);
				//['if']
				if(aName){
					var sName=aName[0];
					nIndex=sTmpl.indexOf(sCloseTag);
					//'title'
					var sExp=sTmpl.substring(sName.length+1,nIndex);
					//'<div>{{title}}</div>{{else}}<div>empty</div>{{/if}}</div>'
					sTmpl=sTmpl.substring(nIndex+sCloseTag.length);
					var oCurrent={
						num:++_nLogicNum,
						blockName:sName,
						//'item in list'
						exp:sExp
					}
					aAst.push(oCurrent);
					
					//'{{/if}}'
					var sEndTag=sOpenTag+'/'+sName+sCloseTag;
					//查找块结束位置
					nIndex=_fSearchEnd(sName,sEndTag,sTmpl);
					var sContent;
					if(nIndex==-1){
						Debug.error('未找到块结束位置:'+sEndTag);
						return;
					}else{
						//'<div>{{title}}</div>{{else}}<div>empty</div>'
						sContent=sTmpl.substring(0,nIndex);
						//'</div>'
						sTmpl=sTmpl.substring(nIndex+sEndTag.length);
					}
					
					//分析子内容
					_fParseTmpl(sContent,oCurrent);
					
					//检出else
					if(sName=='if'){
						var aChildNodes=oCurrent.children;
						for(var i=0,l=aChildNodes.length;i<l;i++){
							var oChd=aChildNodes[i];
							if(oChd.exp=='else'){
								//把else块提出到if块后面
								oChd.exp=oCurrent.exp;
								oChd.blockName='if';
								oChd.num=++_nLogicNum;
								oChd.inverse=true;
								oChd.children=aChildNodes.slice(i+1);
								aAst.push(oChd);
								oCurrent.children=aChildNodes.slice(0,i);
							}
						}
					}
				}else{
					Debug.error('找不到辅助函数:'+sTmpl);
					return;
				}
			}else{
				//逻辑语句
				nIndex=sTmpl.indexOf(sCloseTag);
				aAst.push({
					num:++_nLogicNum,
					exp:sTmpl.substring(0,nIndex)
				});
				sTmpl=sTmpl.substring(nIndex+sCloseTag.length);
			}
			//继续处理后续模板
			_fParseTmpl(sTmpl,oRoot);
		}else if(sTmpl){
			aAst.push({
				html:sTmpl
			});
		}
		return oRoot;
	}
	/**
	 * 编译AST
	 * @param  {array}aAST 表达式列表
	 * @param {object}oOptions 选项
	 * @return {array}     返回编译好的代码数组
	 */
	function _fCompileAST(aAST,oOptions){
		var aCode=[];
		if(aAST){
			for(var i=0,len=aAST.length;i<len;i++){
				var oItem=aAST[i];
				if(oItem.html){
					aCode.push(_fParseHtml(oItem.html));
				}else if(oItem.exp){
					aCode.push(_fParseScript(oItem,oOptions));
				}
			}
		}
		return aCode;
	}
	/**
	 * 编译模板
	 * @method _fCompile
	 * @param  {string}sTmpl 模板字符串
	 * @param  {Object=}oOptions 选项{
	 * 		{object}helpers:自定义辅助函数列表，这里传入不影响全局的辅助函数定义，只会在本次编译时extend全局的辅助函数
	 * 				{
	 * 					name:fHelper,
	 * 					...
	 * 				}
	 * }
	 * @return {string}      返回结果字符串
	 */
	function _fCompile(sTmpl,oOptions){
		var sOpenTag=T.openTag,
		sCloseTag=T.closeTag;
		//过滤掉注释
		sTmpl=sTmpl.replace(new RegExp(sOpenTag+'!'+'((?!'+sCloseTag+').)*'+sCloseTag,'ig'),'');
		//过滤无用的空白和换行
		if(T.isTrim){
			sTmpl=sTmpl.replace(/^[\s\n]+/,'').replace(/[\s\n]+$/,'').replace(new RegExp('('+sCloseTag+'|\\>)(\\s|\\n)+(?=('+sOpenTag+'|<))','ig'),'$1').
			replace(new RegExp(sCloseTag+'[\\s\\n]+([^\\n]+)[\\s\\n]+(?=('+sOpenTag+'|<))','ig'),sCloseTag+'$1');
		}
		//旧浏览器使用数组方式拼接字符串
		_aCode=[_aJoinDefine[0]];
		_aCode.push('var escape=$helpers.escape,functionType="function",$me=this;');
		
		//处理设置
		var sNameSpace=oOptions&&oOptions.ns;
		var oHelpers;
		//有自定义辅助函数，覆盖默认函数
		if(sNameSpace){
			oHelpers=Object.extend({},_helpers['default']);
			oHelpers=Object.extend(oHelpers,_helpers[sNameSpace]);
		}else{
			oHelpers=_helpers['default'];
		}
		oOptions.helpers=oHelpers;
		
		var oAst=_fParseTmpl(sTmpl);
		//分析完重置为0
		_nLogicNum=0;
		var aCode=_fCompileAST(oAst.children,oOptions);
		_aCode=_aCode.concat(aCode);
		_aCode.push(_aJoinDefine[1]);
		var sCode=_aCode.join('\n');
		try{
			var aParams = ["$T", "$helpers", "$data",sCode];
			var fRender=window.Function.apply(null,aParams);
			//Debug.log(fRender.toString());
			return function($data,oContext){
				return fRender.call(oContext||$data,T,oHelpers,$data);
			}
		}catch(e){
			Debug.log(sCode);
			Debug.error(e);
		}
	}
	/**
	 * 获取是否使用+连接字符串
	 * @return {boolean} true表示使用+，false表示使用数组join形式
	 */
	function fGetIfPlusJoin(){
		return _isNewEngine;
	}
	/**
	 * 添加辅助函数
	 * @param {string}sNameSpace 命名空间
	 * @param {string|Object}sName 辅助函数名，也可以传入hash形式的参数{sName:fHelper}
	 * @param {Function}fHelper 辅助函数
	 */
	function fRegisterHelper(sNameSpace,sName,fHelper){
		if(Object.isObj(sName)){
			if(!_helpers[sNameSpace]){
				_helpers[sNameSpace]={};
			}
			Object.extend(_helpers[sNameSpace],sName);
		}else{
			_helpers[sNameSpace][sName]=fHelper;
		}
	}
	/**
	 * 执行模板
	 * @method tmpl
	 * @param {object|string|Array}tmpl 当tmpl为字符串或字符串数组时，表示模板内容，为对象时如下：
	 * {
	 * 		{string}id : 模板的id，要使用缓存，就必须传入id
	 * 		{string|Array=}tmpl : 模板字符串，以id为缓存key，此参数为空时，表示内容为根据id查找到的script标签的内容
	 * 		{Object=}helpers : 自定义辅助列表（参照_fCompile方法说明）
	 * }
	 * @param {object}oData 数据
	 * @param {object=}oContext 模板函数执行的上下文对象
	 * @return {function|string} 当oData为空时返回编译后的模板函数，不为空时返回渲染后的字符串
	 */
	function fTmpl(tmpl,oData,oContext){
		var sTmpl,fTmpl,sId;
		if(typeof tmpl=='string'){
			sTmpl=tmpl;
		}else if(tmpl.length!==undefined){
			sTmpl=tmpl.join('');
		}else{
			sTmpl=tmpl.tmpl;
			if(sId=tmpl.id){
			    if (_cache[sId]) {
			        fTmpl = _cache[sId];
			    } else if(!sTmpl) {
			    	//从script标签获取模板
			        var oEl = document.getElementById(sId);
			        if (oEl) {
			            sTmpl = (oEl.value || oEl.innerHTML).replace(/\s/g, '');
			        }
			    }
			}
		}
		if(!fTmpl){
			if(!sTmpl){
				Debug.error('模板未定义');
				return;
			}
			fTmpl=_fCompile(sTmpl,tmpl);
			//根据id缓存
			if(sId){
				_cache[sId]=fTmpl;
			}
		}
		//渲染数据
		if(oData){
			try{
				return fTmpl(oData,oContext);
			}catch(e){
				Debug.log(fTmpl.toString());
				Debug.error(e);
			}
		}else{
			return fTmpl;
		}
	}
	
	return T;
	
});
/**
 * HashChange类，兼容IE6/7浏览器实现hashchange事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
$Define("B.HashChange",
['handy.base.Debug','handy.base.Util'],
function(Debug,Util){

	/**
	 * IE8+ | FF3.6+ | Safari5+ | Chrome | Opera 10.6+ 支持hashchange
		FF3.6+ Chrome Opera支持 oldURL 和 newURL
	    IE6直接用location.hash取hash，可能会取少一部分内容：
		比如 http://www.xxx.com#stream/xxxxx?lang=zh_c
		ie6 => location.hash = #stream/xxxxx
		其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
		firefox 会对hash进行decodeURIComponent
		比如 http://www.xxx.com/#!/home/q={%22thedate%22:%2220121010~20121010%22}
		firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
		其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
	 */
	var _bIsInited,   //是否已初始化
		_nListener=0,    //仅用于生成内部唯一的监听器key
		_oDoc = document, 
		_oIframe,
		_sLastHash,     //上一个hash值，用于比较hash是否改变
		//这个属性的值如果是5，则表示混杂模式（即IE5模式）；如果是7，则表示IE7仿真模式；如果是8，则表示IE8标准模式
		_nDocMode = _oDoc.documentMode,
		//是否支持原生hashchange事件
	    _bSupportHashChange = ('onhashchange' in window) && ( _nDocMode === void 0 || _nDocMode > 7 ),
		
	    HashChange={
	    	delay    : 50,         //定时查看iframe内容的时间
	    	
			listen   : fListen,    //绑定hashchange监听函数
			unListen : fUnListen   //删除hashchange监听函数
		};
		/**
		 * HashChange初始化
		 * @method _fInit
		 */
		function _fInit(){
			if(_bIsInited){
				return;
			}
			_bIsInited=true;
			HashChange.listeners={};
			//不支持原生hashchange事件的，使用定时器拉取hash值+隐藏iframe形式实现
			if(!_bSupportHashChange){
				//创建一个隐藏的iframe，使用这博文提供的技术 http://www.paciellogroup.com/blog/?p=604.
				_oIframe = $('<iframe id="fff" tabindex="-1" style="display:none" width=0 height=0 title="empty" />').appendTo( _oDoc.body )[0];
                $(_oIframe).one("load",function(){
                	_fSetIfrHash(location.hash);
                	setInterval(_fPoll,HashChange.delay);
                });
			}else{
				$(window).on("hashchange",function(){
					_fOnChange(location.hash);
				})
			}
		}
		/**
		 * 设置新的iframe的hash
		 * @method setHash
		 * @param {string} sHash要设置hash
		 */
		function _fSetIfrHash(sHash){
			if(sHash==_sLastHash){
				return false;
			}
			var _oIframeWin = _oIframe.contentWindow;
			var oDoc=_oIframeWin.document;
			oDoc.open();
            oDoc.write('<!doctype html><html><body>'+sHash+'</body></html>');
            oDoc.close();
            _sLastHash=sHash;
            Debug.log("set:"+_oIframe.contentWindow.document.body.innerText);
		}
		/**
		 * 定时检查hash有没有变化
		 * @method _fPoll
		 */
		function _fPoll() {
			var sHash=location.hash;
			var sIfrHash = _oIframe.contentWindow.document.body.innerText;
			//如果地址栏hash变化了，设置iframe的hash并处罚hashchange
			if (sHash != _sLastHash) {
				_fSetIfrHash(sHash);
				_fOnChange(sHash);
			}else if(sIfrHash!=_sLastHash){
				//iframe的hash发生了变化(点击前进/后退)，更新地址栏hash
				Debug.log("update:"+_oIframe.contentWindow.document.body.innerText);
				location.hash=sIfrHash;
			}
		}
		/**
		 * 执行监听函数
		 * @method _fOnChange
		 */
		function _fOnChange(sHash){
			var oListeners=HashChange.listeners
			for(var func in oListeners){
				oListeners[func](sHash);
			}
		}
		/**
		 * 绑定hashchange监听函数
		 * @method listen(fListener[,sName])
		 * @param {function} fListener监听函数
		 * @param {string=}  sName监听函数的名称，删除该监听时用到
		 * @return {?string}
		 */
		function fListen(fListener,sName){
			if(!_bIsInited){
				_fInit();
			}
			if(sName in HashChange.listeners){
				$D.error(new Error('Duplicate name'));
			}else{
				sName=sName||$H.expando+(++_nListener);
				HashChange.listeners[sName]=fListener;
				return sName;
			}
		}
		/**
		 * 删除hashchange监听函数
		 * @method unListen([sName])
		 * @param {string=} sName监听函数的名称，不传此参数表示删除所有监听函数
		 */
		function fUnListen(sName){
			for(var name in HashChange.listeners){
				if(!sName||sName==name){
					delete HashChange.listeners[name];
				}
			}
		}
		
	return HashChange;
});
/**
 * 支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Support','B.Browser',function(Browser){
	
	
	var Support={
//		testSvg               : fTestSvg          //检查是否支持svg
		testPerf              : fTestPerf,        //测试硬件性能
		ifSupportStyle        : fIfSupportStyle,  //检测样式是否支持
		mediaQuery            : fMediaQuery       //检查设备并添加class
	}
	
	Support.mediaQuery();
	
//	var _supportSvg; //标记是否支持svg
	
	//解决IE6下css背景图不缓存bug
	if(Browser.ie()==6){   
	    try{   
	        document.execCommand("BackgroundImageCache", false, true);   
	    }catch(e){}   
	}  
	/**
	 * 检查是否支持svg
	 * @method testSvg
	 * @param {function(boolean)} fCall 回调函数，如果支持svg则回调参数为true，反之则为false
	 
	function fTestSvg(fCall) {
		if(_supportSvg!=undefined){
			fCall(_supportSvg);
			return;
		}
		//this method is from jquery mobile 1.4.0
		// Thanks Modernizr & Erik Dahlstrom
		var w = window,
		//opera 通过createElementNS方式检测的确不准
			bSvg = !!w.document.createElementNS && !!w.document.createElementNS( "http://www.w3.org/2000/svg", "svg" ).createSVGRect && !( w.opera && navigator.userAgent.indexOf( "Chrome" ) === -1 ),
			support = function( data ) {
				if ( !( data && bSvg ) ) {
					_supportSvg=false;
				}else{
					_supportSvg=true;
				}
				fCall(_supportSvg);
			},
			img = new w.Image();
	
		img.onerror = function() {
			support( false );
		};
		img.onload = function() {
			support( img.width === 1 && img.height === 1 );
		};
		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
	}
	*/
	
	//TODO
	/**
	 * 测试硬件性能
	 */	
	function fTestPerf(){
		var now = Date.now();
		for(var i = 0; i < 1e9; i++) {
			new Object().toString();
		}
		var performance = 1 / (Date.now() - now);
		$D.log(performance);
	}
	/**
	 * 检测样式是否支持
	 * @param{string}sName 样式名
	 * @param{string}sValue 属性值
	 * @return{boolean} true表示支持，false表示不支持
	 */
	function fIfSupportStyle(sName,sValue){
		var oEl = document.createElement('div');
		var sProp;
		if(sName in oEl.style){
			sProp=sName;
		}else if ('-ms-' + sName in oEl.style){
 			sProp='-ms-' + sName;
 		}else{
			var aVendors = 'Khtml O Moz Webkit'.split(' '),
	 		len = aVendors.length;
			sName = sName.replace(/^[a-z]/, function(val) {
			    return val.toUpperCase();
			});
			while(len--) {
				if ( aVendors[len] + sName in oEl.style ) {
				    sProp=aVendors[len] + sName;
				    break;
				}
			}
 		}
		if(sProp){
			if(sValue===undefined){
				return true;
			}
		    oEl.style[sName] = sValue;
		    return oEl.style[sName] === sValue;
		}
	    return false;
	}
	/**
	 * 检查设备并添加class
	 * @method mediaQuery
	 */
	function fMediaQuery(){
		var sCls='';
		if(Browser.mobile()){
			sCls="hui-mobile";
		}else{
			sCls="hui-pc";
			var ie=Browser.ie();
			if(ie){
				sCls+=' ie'+ie;
			}
		}
		if(Browser.ios()){
			sCls+=' hui-ios'
		}
		document.documentElement.className+=" "+sCls+" hui";
	}
	
	return Support;
	
});
/**
 * 校验类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.Validator',['B.String','B.Object'],function(String,Object){
	
	var Validator={
		messages: {
			required     : "{name}不能为空",
			email        : "请输入正确的邮件地址",
			url          : "请输入正确的链接地址",
			date         : "请输入正确的日期",
			dateISO      : "请输入正确格式的日期",
			number       : "{name}须是数字",
			digits       : "{name}须是整数",
			creditcard   : "请输入正确的信用卡号码",
			equalTo      : "请输入相同的{name}",
			min          : "{name}不能小于{0}",
			max          : "{name}不能大于{0}",
			range        : "{name}要在{0}到{1}之间",
			maxlength    : "{name}长度不能超过{0}",
			minlength    : "{name}长度不能少于{0}",
			rangelength  : "{name}长度要在{0}到{1}之间"
		},
		valid            : fValid,          //校验
		required         : fRequired,       //不为空
		email            : fEmail,          //是否是邮箱地址
		url              : fUrl,            //是否是url
		date             : fDate,           //是否是日期
		dateISO          : fDateISO,        //是否是正确格式的日期(ISO)，例如：2009-06-23，1998/01/22 只验证格式，不验证有效性
		number           : fNumber,         //是否是合法的数字(负数，小数)
		digits           : fDigits,         //是否是整数
		creditcard       : fCreditcard,     //是否是合法的信用卡号
		min              : fMin,            //是否符合最小值
		max              : fMax,            //是否符合最大值
		range            : fRange,          //数值是否在指定区间内
		minlength        : fMinlength,      //是否符合最小长度
		maxlength        : fMaxlength,      //是否符合最大长度
		rangelength      : fRangelength,    //长度是否在指定区间内
		equalTo          : fEqualTo         //是否跟指定值相等(包括数据类型相等)
	}
	/**
	 * 校验
	 * @param {?}value 需要校验的值
	 * @param {Object}oValidator{
	 * 		{Object}rules : 校验规则，可以有多条，可以是此Validator类里的规则，也可以传入自定义的校验函数
	 * 		{
	 * 			{string}name:{*}valid 如果传入的是函数，表示自定义验证规则(valid(value)返回false则为校验不通过)，
	 * 				如果要使用本类中的校验方法，则传入相应规则要求的参数，如：{required:true,maxlength:50}
	 * 		}
	 * 		{object=}messages : 自定义提示文字，这里定义优先级高于默认的提示
	 * 		{
	 * 			{string}name:msg name对应的时校验规则名，msg则是相应的提示文字
	 * 		}
	 * 		{Function}error : 自定义提示方法
	 * }
	 * @return {boolean} true表示验证成功，false表示失败
	 */
	function fValid(value,oValidator){
		var oRules=oValidator.rules;
		for(var rule in oRules){
			var param=oRules[rule];
			var fValid=typeof param=='function'?param:Validator[rule];
			var bResult=fValid(value,param);
			if(!bResult){
				var fError=oValidator.error||Validator.error;
				var sMessage=oValidator.messages&&oValidator.messages[rule]||Validator.messages[rule];
				//替换{}中的内容，优先匹配param中的，比如{0}、{1}，再匹配oRule中的属性，如：{name}，如果没有匹配则替换为空字符串
				sMessage=sMessage.replace(/\{([^\}]+)\}/g,function(m,$1){
					return param[$1]||($1==0&&param)||oValidator[$1]||param||'';
				})
				fError&&fError(sMessage);
				return bResult;
			}
		}
		return true;
	}
	/**
	 * 不为空
	 * @method required
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fRequired(sValue) {
		return String.trim(''+sValue).length > 0;
	}
	/**
	 * 是否是邮箱地址
	 * @method email
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fEmail( sValue ) {
		return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(sValue);
	}
	/**
	 * 是否是url
	 * @method url
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fUrl( sValue ) {
		return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(sValue);
	}
	/**
	 * 是否是日期
	 * @method date
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fDate( sValue ) {
		return !/Invalid|NaN/.test(new Date(sValue).toString());
	}
	/**
	 * 是否是正确格式的日期(ISO)，例如：2009-06-23，1998/01/22 只验证格式，不验证有效性
	 * @method dateISO
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fDateISO( sValue ) {
		return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(sValue);
	}
	/**
	 * 是否是合法的数字(负数，小数)
	 * @method number
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fNumber( sValue ) {
		return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(sValue);
	}
	/**
	 * 是否是整数
	 * @method digits
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fDigits( sValue ) {
		return /^\d+$/.test(sValue);
	}
	/**
	 * 是否是合法的信用卡号
	 * @method creditcard
	 * @param {String}sValue 待校验值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fCreditcard( sValue ) {
		//只能包含数字、空格、横杠
		if ( /[^0-9 \-]+/.test(sValue) ) {
			return false;
		}
		var nCheck = 0,
			nDigit = 0,
			bEven = false;

		sValue = sValue.replace(/\D/g, "");

		for (var n = sValue.length - 1; n >= 0; n--) {
			var cDigit = sValue.charAt(n);
			nDigit = parseInt(cDigit, 10);
			if ( bEven ) {
				if ( (nDigit *= 2) > 9 ) {
					nDigit -= 9;
				}
			}
			nCheck += nDigit;
			bEven = !bEven;
		}

		return (nCheck % 10) === 0;
	}
	/**
	 * 是否符合最小值
	 * @method min
	 * @param {String}sValue 待校验值
	 * @param {number}nNum 指定的最小数值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMin( sValue,nNum ) {
		return sValue >= nNum;
	}
	/**
	 * 是否符合最大值
	 * @method max
	 * @param {String}sValue 待校验值
	 * @param {number}nNum 指定的最大数值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMax( sValue,nNum ) {
		return sValue <= nNum;
	}
	/**
	 * 数值是否在指定区间内
	 * @method range
	 * @param {String}sValue 待校验值
	 * @param {Array}aRange 区间数组
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fRange( sValue,aRange ) {
		return ( sValue >= aRange[0] && sValue <= aRange[1] );
	}
	/**
	 * 是否符合最小长度
	 * @method minlength
	 * @param {String|Array}value 待校验值
	 * @param {number}nLen 长度
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMinlength( value ,nLen) {
		var length = Object.isArr( value ) ? value.length : String.trim(''+value).length;
		return length >= nLen;
	}
	/**
	 * 是否符合最大长度
	 * @method maxlength
	 * @param {String}value 待校验值
	 * @param {number}nLen 长度
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fMaxlength( value,nLen ) {
		var length = Object.isArr( value ) ? value.length : String.trim(''+value).length;
		return length <= nLen;
	}
	/**
	 * 长度是否在指定区间内
	 * @method rangelength
	 * @param {String}value 待校验值
	 * @param {Array}aRange 长度区间，如[2,10]
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fRangelength( value,aRange ) {
		var length = Object.isArr( value ) ? value.length : String.trim(''+value).length;
		return ( length >= aRange[0] && length <= aRange[1] );
	}
	/**
	 * 是否跟指定值相等(包括数据类型相等)
	 * @method equalTo
	 * @param {String}sValue 待校验值
	 * @param {*}val 指定值
	 * @return {boolean} 符合规则返回true，否则返回false
	 */
	function fEqualTo( sValue,val ) {
		return sValue === val;
	}
	
	return Validator;
	
});
/**
 * LocalStorage类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define('B.LocalStorage',['B.Browser','B.Events','B.Json'],function(Browser,Events,Json){
	
	var LocalStorage={
		_init           : _fInit,              //初始化
		getItem         : fGetItem,            //获取值
		setItem         : fSetItem,            //设置值
		removeItem      : fRemoveItem,         //删除值
		clear           : fClear               //清除所有数据
	}
	
	//在IE下，本地文件是不能访问localStorage的，此时localStorage字段为空，
	//另外，页面里有id为localStorage的元素，某些浏览器可以通过window.localStorage索引到这个元素，所以还要加上判断
	var _supportLocalStorage= window.localStorage && window.localStorage.getItem;
	var localStorage=window.localStorage;
	//ie7-下保存数据的对象
	var _oUserData;
	var _file=document.domain;
	var _typeSplit='$$:';
	
	/**
	 * 初始化
	 */
	 function _fInit() {
		if (!_supportLocalStorage&&Browser.ie()) {
			var sId='LocalStorageUserDataDiv';
			_oUserData = document.getElementById(sId);
			if (!_oUserData) {
				_oUserData = document.createElement('DIV');
				_oUserData.style.display = 'none';
				_oUserData.id = sId;
				_oUserData.addBehavior('#default#userData');
				document.body.appendChild(_oUserData);
		 		_oUserData.load(_file);
			}
		}
	}
	/**
	 * 获取值
	 * @param {string}sKey 键
	 * @return {*} 返回对应值
	 */
	 function fGetItem(sKey){
	 	var value;
	 	if(_supportLocalStorage){
	 		value=localStorage.getItem(sKey);
	 	}else{
			value=_oUserData.getAttribute(sKey);
	 	}
	 	value=Json.parseJson(value);
	 	return value;
	 }
	 /**
	 * 设置值
	 * @param {string}sKey 键
	 * @param {*}value 值
	 * @return {boolean} true表示存储成功
	 */
	 function fSetItem(sKey,value){
		//ie6、7可以提供最多1024kb的空间，LocalStorage一般可以存储5~10M
	 	value=Json.stringify(value);
	 	try{
		 	if(_supportLocalStorage){
		 		localStorage.setItem(sKey,value);
		 	}else{
				_oUserData.setAttribute(sKey,value);
				_oUserData.save(_file);
		 	}
 		}catch(e){
 			$D.error(e);
 			return false;
 		}
 		return true;
	 }
	 /**
	 * 删除值
	 * @method removeItem
	 * @param {string}sKey 键
	 */
	 function fRemoveItem(sKey){
	 	if(_supportLocalStorage){
	 		localStorage.removeItem(sKey);
	 	}else{
	 		_oUserData.removeAttribute(sKey);
			_oUserData.save(_file);
	 	}
	 }
	 /**
	  * 清除所有数据
	  */
	 function fClear(){
	 	if(_supportLocalStorage){
	 		localStorage.clear();
	 	}else{
	 		_oUserData.unload();
	 	}
	 }
	
	 LocalStorage._init();
	 
	 return LocalStorage;
});
/**
 * 适配类库
 */
$Define('B.Adapt','B.Function',function(){
	
	//框架全局变量
	
	

	//项目系统全局变量
	$G={
		config:{}
	};
	
	/*var $$=window.$;
	var ajax=$$.ajax;
	$$.ajax=$.Function.intercept($$.ajax,function(){
		console.log("intercept");
	},$$);*/
	
	//拦截jQuery的remove方法，通知组件元素删除
	var $$=window.$
	$$.fn.remove=$H.intercept($$.fn.remove,function(){
		var oEl=this.target;
		$H.trigger('removeEl',oEl);
	});
	
	return 1;
	
});

/**
 * 图片压缩类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.util.ImgCompress"
$Define('U.ImgCompress',
'B.Class',
function(){
	var ImgCompress=$H.createClass();
	
	$H.extend(ImgCompress,{
		compress         : fCompress        //压缩
	});
	
	/**
	 * 压缩
	 * @param {object|string}image 参数图片，可以是File对象、base64图片字符串，URL.createObjectURL的对象，或者其他可以设置在img.src上的对象
	 * @param {object}oOptions 选项{
	 * 		{number=}width:压缩后图片宽度，不传表示使用原图的宽度，优先级高于maxWidth
	 * 		{number=}height:压缩后图片高度，不传表示使用原图的高度，优先级高于maxHeight，宽度和高度如果只提供一个则另一个根据实际尺寸等比例计算得出
	 * 		{number=}maxWidth:压缩后最大宽度
	 * 		{number=}maxHeight:压缩后最大高度
	 * 		{number=}cropX:裁剪图片的起始横坐标
	 * 		{number=}cropY:裁剪图片的起始纵坐标
	 * 		{number=}cropW:裁剪图片的宽度
	 * 		{number=}cropH:裁剪图片的高度
	 * 		{number=}quality:压缩率，默认是0.5
	 * 		{function({object})}success:回调函数，参数说明:{
	 * 			{object|string}orig:原图对象
	 * 			{string}base64:压缩后的base64字符串
	 * 			{string}clearBase64:去除data前缀的压缩后的base64字符串
	 * 		}
	 * }
	 */
	function fCompress(image,oOptions){
		if(!image){
			return;
		}
		var oImgSrc=image;
		if(typeof File==='object'&&image instanceof File){
			var oURL = URL || webkitURL;
			oImgSrc = oURL.createObjectURL(image);
		}
		var oImg = new Image();
            oImg.src = oImgSrc;
            
        oImg.onload = function () {

            // 生成比例
            var w = oImg.width,
                h = oImg.height,
                bCrop=oOptions.cropX!==undefined,
                nMaxW=oOptions.maxWidth,
                nMaxH=oOptions.maxHeight,
                nSettingW=oOptions.width,
                nSettingH=oOptions.height;
            var _fCeil=Math.ceil;
            //修正图片尺寸
            var _fFixSize=function(w,h){
                var scale = w / h;
	            if(nSettingW){
	            	w=nSettingW;
	            	if(!nSettingH){
			            h = w / scale;
	            	}
	            }else if(w>nMaxW){
	            	w=nMaxW;
	            	h = w / scale;
	            }
	            
	            if(nSettingH){
	            	h=nSettingH;
	            	if(!nSettingW){
		            	w=h*scale;
	            	}
	            }else if(h>nMaxH){
	            	h=nMaxH;
	            	w=h*scale;
	            }
	            return {
	            	w:_fCeil(w),
	            	h:_fCeil(h)
	            }
            }
            
            // 生成canvas
            var oCanvas = document.createElement('canvas');
            var oCtx = oCanvas.getContext('2d');
            var jCanvas=$(oCanvas);
        	var nCropW=oOptions.cropW;
        	var nCropH=oOptions.cropH;
        	var nCropX=oOptions.cropX;
        	var nCropY=oOptions.cropY;
        	var bIOS=$H.ios();
            //需要裁剪
            if(bCrop){
            	var oSize=_fFixSize(nCropW,nCropH);
            	if(bIOS){
            		//需要第三方库修正图片，canvas先绘制原图，等修正后再进行截取
            		nCropW=oSize.w;
            		nCropH=oSize.h;
            		var nCropScale=nCropW/oOptions.cropW;
            		if(nCropScale!=1){
            			w=_fCeil(w*nCropScale);
            			nCropX=_fCeil(nCropX*nCropScale);
            		}
            		nCropScale=nCropH/oOptions.cropH;
            		if(nCropScale!=1){
            			h=_fCeil(h*nCropScale);
            			nCropY=_fCeil(nCropY*nCropScale);
            		}
            		jCanvas.attr({width : w, height : h});
	            	oCtx.drawImage(oImg, 0, 0, w, h);
            	}else{
	            	w=oSize.w;
	            	h=oSize.h;
		            jCanvas.attr({width:w, height:h});
	            	oCtx.drawImage(oImg,nCropX,nCropY,nCropW,nCropH,0,0,w,h);
            	}
            }else{
            	var oSize=_fFixSize(w,h);
            	w=oSize.w;
            	h=oSize.h;
           		jCanvas.attr({width : w, height : h});
	            oCtx.drawImage(oImg, 0, 0, w, h);
            }
            

            
            //图片背景如果是透明的，默认保存成base64会变成黑色的，这里把白色图片跟原图合并，这样保存后透明背景就变成指定颜色(#ffffff)的了
			oCtx.globalCompositeOperation = "destination-over";
			oCtx.fillStyle = '#ffffff';
			oCtx.fillRect(0,0,w,h);
            
            var nQuality=oOptions.quality||0.5;
			var base64;

            // 修复IOS
            if(bIOS) {
                var mpImg = new MegaPixImage(oImg);
                mpImg.render(oCanvas, { maxWidth: w, maxHeight: h, quality: nQuality, orientation: 6 });
                if(bCrop){
                	var oData=oCtx.getImageData(nCropX,nCropY,nCropW,nCropH);
                	jCanvas.attr({width : nCropW, height : nCropH});
                	oCtx.putImageData(oData,0,0);
                }
                base64 = oCanvas.toDataURL('image/jpeg', nQuality);
            }else if($H.android()) {
	            // 修复android
                var encoder = new JPEGEncoder();
                base64 = encoder.encode(oCtx.getImageData(0,0,w,h), nQuality * 100 );
            }else{
				//生成base64
	            base64 = oCanvas.toDataURL('image/jpeg', nQuality );
            }

            // 生成结果
            var oResult = {
                orig : image,
                base64 : base64,
                //去除data前缀的数据
                clearBase64 : base64.substr( base64.indexOf(',') + 1 )
            };
            
            oOptions&&oOptions.success&&oOptions.success(oResult);
        }
	}
	
	/* jpeg_encoder_basic.js  for android jpeg压缩质量修复 */
	function JPEGEncoder(a){function I(a){var c,i,j,k,l,m,n,o,p,b=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];for(c=0;64>c;c++)i=d((b[c]*a+50)/100),1>i?i=1:i>255&&(i=255),e[z[c]]=i;for(j=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99],k=0;64>k;k++)l=d((j[k]*a+50)/100),1>l?l=1:l>255&&(l=255),f[z[k]]=l;for(m=[1,1.387039845,1.306562965,1.175875602,1,.785694958,.5411961,.275899379],n=0,o=0;8>o;o++)for(p=0;8>p;p++)g[n]=1/(8*e[z[n]]*m[o]*m[p]),h[n]=1/(8*f[z[n]]*m[o]*m[p]),n++}function J(a,b){var f,g,c=0,d=0,e=new Array;for(f=1;16>=f;f++){for(g=1;g<=a[f];g++)e[b[d]]=[],e[b[d]][0]=c,e[b[d]][1]=f,d++,c++;c*=2}return e}function K(){i=J(A,B),j=J(E,F),k=J(C,D),l=J(G,H)}function L(){var c,d,e,a=1,b=2;for(c=1;15>=c;c++){for(d=a;b>d;d++)n[32767+d]=c,m[32767+d]=[],m[32767+d][1]=c,m[32767+d][0]=d;for(e=-(b-1);-a>=e;e++)n[32767+e]=c,m[32767+e]=[],m[32767+e][1]=c,m[32767+e][0]=b-1+e;a<<=1,b<<=1}}function M(){for(var a=0;256>a;a++)x[a]=19595*a,x[a+256>>0]=38470*a,x[a+512>>0]=7471*a+32768,x[a+768>>0]=-11059*a,x[a+1024>>0]=-21709*a,x[a+1280>>0]=32768*a+8421375,x[a+1536>>0]=-27439*a,x[a+1792>>0]=-5329*a}function N(a){for(var b=a[0],c=a[1]-1;c>=0;)b&1<<c&&(r|=1<<s),c--,s--,0>s&&(255==r?(O(255),O(0)):O(r),s=7,r=0)}function O(a){q.push(w[a])}function P(a){O(255&a>>8),O(255&a)}function Q(a,b){var c,d,e,f,g,h,i,j,l,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,k=0;var m=8,n=64;for(l=0;m>l;++l)c=a[k],d=a[k+1],e=a[k+2],f=a[k+3],g=a[k+4],h=a[k+5],i=a[k+6],j=a[k+7],p=c+j,q=c-j,r=d+i,s=d-i,t=e+h,u=e-h,v=f+g,w=f-g,x=p+v,y=p-v,z=r+t,A=r-t,a[k]=x+z,a[k+4]=x-z,B=.707106781*(A+y),a[k+2]=y+B,a[k+6]=y-B,x=w+u,z=u+s,A=s+q,C=.382683433*(x-A),D=.5411961*x+C,E=1.306562965*A+C,F=.707106781*z,G=q+F,H=q-F,a[k+5]=H+D,a[k+3]=H-D,a[k+1]=G+E,a[k+7]=G-E,k+=8;for(k=0,l=0;m>l;++l)c=a[k],d=a[k+8],e=a[k+16],f=a[k+24],g=a[k+32],h=a[k+40],i=a[k+48],j=a[k+56],I=c+j,J=c-j,K=d+i,L=d-i,M=e+h,N=e-h,O=f+g,P=f-g,Q=I+O,R=I-O,S=K+M,T=K-M,a[k]=Q+S,a[k+32]=Q-S,U=.707106781*(T+R),a[k+16]=R+U,a[k+48]=R-U,Q=P+N,S=N+L,T=L+J,V=.382683433*(Q-T),W=.5411961*Q+V,X=1.306562965*T+V,Y=.707106781*S,Z=J+Y,$=J-Y,a[k+40]=$+W,a[k+24]=$-W,a[k+8]=Z+X,a[k+56]=Z-X,k++;for(l=0;n>l;++l)_=a[l]*b[l],o[l]=_>0?0|_+.5:0|_-.5;return o}function R(){P(65504),P(16),O(74),O(70),O(73),O(70),O(0),O(1),O(1),O(0),P(1),P(1),O(0),O(0)}function S(a,b){P(65472),P(17),O(8),P(b),P(a),O(3),O(1),O(17),O(0),O(2),O(17),O(1),O(3),O(17),O(1)}function T(){var a,b;for(P(65499),P(132),O(0),a=0;64>a;a++)O(e[a]);for(O(1),b=0;64>b;b++)O(f[b])}function U(){var a,b,c,d,e,f,g,h;for(P(65476),P(418),O(0),a=0;16>a;a++)O(A[a+1]);for(b=0;11>=b;b++)O(B[b]);for(O(16),c=0;16>c;c++)O(C[c+1]);for(d=0;161>=d;d++)O(D[d]);for(O(1),e=0;16>e;e++)O(E[e+1]);for(f=0;11>=f;f++)O(F[f]);for(O(17),g=0;16>g;g++)O(G[g+1]);for(h=0;161>=h;h++)O(H[h])}function V(){P(65498),P(12),O(3),O(1),O(0),O(2),O(17),O(3),O(17),O(0),O(63),O(0)}function W(a,b,c,d,e){var h,l,o,q,r,s,t,u,v,w,f=e[0],g=e[240];var i=16,j=63,k=64;for(l=Q(a,b),o=0;k>o;++o)p[z[o]]=l[o];for(q=p[0]-c,c=p[0],0==q?N(d[0]):(h=32767+q,N(d[n[h]]),N(m[h])),r=63;r>0&&0==p[r];r--);if(0==r)return N(f),c;for(s=1;r>=s;){for(u=s;0==p[s]&&r>=s;++s);if(v=s-u,v>=i){for(t=v>>4,w=1;t>=w;++w)N(g);v=15&v}h=32767+p[s],N(e[(v<<4)+n[h]]),N(m[h]),s++}return r!=j&&N(f),c}function X(){var b,a=String.fromCharCode;for(b=0;256>b;b++)w[b]=a(b)}function Y(a){if(0>=a&&(a=1),a>100&&(a=100),y!=a){var b=0;b=50>a?Math.floor(5e3/a):Math.floor(200-2*a),I(b),y=a,console.log("Quality set to: "+a+"%")}}function Z(){var c,b=(new Date).getTime();a||(a=50),X(),K(),L(),M(),Y(a),c=(new Date).getTime()-b,console.log("Initialization "+c+"ms")}var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H;Math.round,d=Math.floor,e=new Array(64),f=new Array(64),g=new Array(64),h=new Array(64),m=new Array(65535),n=new Array(65535),o=new Array(64),p=new Array(64),q=[],r=0,s=7,t=new Array(64),u=new Array(64),v=new Array(64),w=new Array(256),x=new Array(2048),z=[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63],A=[0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0],B=[0,1,2,3,4,5,6,7,8,9,10,11],C=[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,125],D=[1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250],E=[0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0],F=[0,1,2,3,4,5,6,7,8,9,10,11],G=[0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,119],H=[0,1,2,3,17,4,5,33,49,6,18,65,81,7,97,113,19,34,50,129,8,20,66,145,161,177,193,9,35,51,82,240,21,98,114,209,10,22,36,52,225,37,241,23,24,25,26,38,39,40,41,42,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,130,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,226,227,228,229,230,231,232,233,234,242,243,244,245,246,247,248,249,250],this.encode=function(a,b){var d,e,f,m,n,o,p,y,z,A,B,C,D,E,F,G,H,I,J,K,c=(new Date).getTime();for(b&&Y(b),q=new Array,r=0,s=7,P(65496),R(),T(),S(a.width,a.height),U(),V(),d=0,e=0,f=0,r=0,s=7,this.encode.displayName="_encode_",m=a.data,n=a.width,o=a.height,p=4*n,z=0;o>z;){for(y=0;p>y;){for(D=p*z+y,E=D,F=-1,G=0,H=0;64>H;H++)G=H>>3,F=4*(7&H),E=D+G*p+F,z+G>=o&&(E-=p*(z+1+G-o)),y+F>=p&&(E-=y+F-p+4),A=m[E++],B=m[E++],C=m[E++],t[H]=(x[A]+x[B+256>>0]+x[C+512>>0]>>16)-128,u[H]=(x[A+768>>0]+x[B+1024>>0]+x[C+1280>>0]>>16)-128,v[H]=(x[A+1280>>0]+x[B+1536>>0]+x[C+1792>>0]>>16)-128;d=W(t,g,d,i,k),e=W(u,h,e,j,l),f=W(v,h,f,j,l),y+=32}z+=8}return s>=0&&(I=[],I[1]=s+1,I[0]=(1<<s+1)-1,N(I)),P(65497),J="data:image/jpeg;base64,"+btoa(q.join("")),q=[],K=(new Date).getTime()-c,console.log("Encoding time: "+K+"ms"),J},Z()}function getImageDataFromImage(a){var d,b="string"==typeof a?document.getElementById(a):a,c=document.createElement("canvas");return c.width=b.width,c.height=b.height,d=c.getContext("2d"),d.drawImage(b,0,0),d.getImageData(0,0,c.width,c.height)}

	/* megapix-image.js for IOS(iphone5+) drawImage画面扭曲修复  */
	!function(){function a(a){var d,e,b=a.naturalWidth,c=a.naturalHeight;return b*c>1048576?(d=document.createElement("canvas"),d.width=d.height=1,e=d.getContext("2d"),e.drawImage(a,-b+1,0),0===e.getImageData(0,0,1,1).data[3]):!1}function b(a,b,c){var e,f,g,h,i,j,k,d=document.createElement("canvas");for(d.width=1,d.height=c,e=d.getContext("2d"),e.drawImage(a,0,0),f=e.getImageData(0,0,1,c).data,g=0,h=c,i=c;i>g;)j=f[4*(i-1)+3],0===j?h=i:g=i,i=h+g>>1;return k=i/c,0===k?1:k}function c(a,b,c){var e=document.createElement("canvas");return d(a,e,b,c),e.toDataURL("image/jpeg",b.quality||.8)}function d(c,d,f,g){var m,n,o,p,q,r,s,t,u,v,w,h=c.naturalWidth,i=c.naturalHeight,j=f.width,k=f.height,l=d.getContext("2d");for(l.save(),e(d,l,j,k,f.orientation),m=a(c),m&&(h/=2,i/=2),n=1024,o=document.createElement("canvas"),o.width=o.height=n,p=o.getContext("2d"),q=g?b(c,h,i):1,r=Math.ceil(n*j/h),s=Math.ceil(n*k/i/q),t=0,u=0;i>t;){for(v=0,w=0;h>v;)p.clearRect(0,0,n,n),p.drawImage(c,-v,-t),l.drawImage(o,0,0,n,n,w,u,r,s),v+=n,w+=r;t+=n,u+=s}l.restore(),o=p=null}function e(a,b,c,d,e){switch(e){case 5:case 6:case 7:case 8:a.width=d,a.height=c;break;default:a.width=c,a.height=d}switch(e){case 2:b.translate(c,0),b.scale(-1,1);break;case 3:b.translate(c,d),b.rotate(Math.PI);break;case 4:b.translate(0,d),b.scale(1,-1);break;case 5:b.rotate(.5*Math.PI),b.scale(1,-1);break;case 6:b.rotate(.5*Math.PI),b.translate(0,-d);break;case 7:b.rotate(.5*Math.PI),b.translate(c,-d),b.scale(-1,1);break;case 8:b.rotate(-.5*Math.PI),b.translate(-c,0)}}function f(a){var b,c,d;if(window.Blob&&a instanceof Blob){if(b=new Image,c=window.URL&&window.URL.createObjectURL?window.URL:window.webkitURL&&window.webkitURL.createObjectURL?window.webkitURL:null,!c)throw Error("No createObjectURL function found to create blob url");b.src=c.createObjectURL(a),this.blob=a,a=b}a.naturalWidth||a.naturalHeight||(d=this,a.onload=function(){var b,c,a=d.imageLoadListeners;if(a)for(d.imageLoadListeners=null,b=0,c=a.length;c>b;b++)a[b]()},this.imageLoadListeners=[]),this.srcImage=a}f.prototype.render=function(a,b){var e,f,g,h,i,j,k,l,m,n,o;if(this.imageLoadListeners)return e=this,this.imageLoadListeners.push(function(){e.render(a,b)}),void 0;b=b||{},f=this.srcImage.naturalWidth,g=this.srcImage.naturalHeight,h=b.width,i=b.height,j=b.maxWidth,k=b.maxHeight,l=!this.blob||"image/jpeg"===this.blob.type,h&&!i?i=g*h/f<<0:i&&!h?h=f*i/g<<0:(h=f,i=g),j&&h>j&&(h=j,i=g*h/f<<0),k&&i>k&&(i=k,h=f*i/g<<0),m={width:h,height:i};for(n in b)m[n]=b[n];o=a.tagName.toLowerCase(),"img"===o?a.src=c(this.srcImage,m,l):"canvas"===o&&d(this.srcImage,a,m,l),"function"==typeof this.onrender&&this.onrender(a)},"function"==typeof define&&define.amd?define([],function(){return f}):this.MegaPixImage=f}();
	
	return ImgCompress;
	
});
/**
 * 拖拽效果类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.effect.Draggable"
$Define('E.Draggable',
'B.Class',
function(){
	
	var Draggable=$H.createClass();
	
	var _events=$H.hasTouch()?['touchstart','touchmove','touchend']:['mousedown','mousemove','mouseup'];
	
	$H.extend(Draggable.prototype,{
		initialize        : fInitialize,        //初始化
		start             : fStart,             //开始
		move              : fMove,              //移动
		end               : fEnd,               //结束
		destroy           : fDestroy            //销毁
	});
	/**
	 * 初始化
	 * @param {string|element|jquery}el 需要拖拽效果的节点
	 * @param {object}oOptions 选项{
	 * 		{function(}start:开始移动时的回调函数
	 * 		{function({object}oPos)}move:移动时的回调函数
	 * 		{function(}end:结束移动时的回调函数
	 * }
	 */
	function fInitialize(el,oOptions) {
		var me = this;
		me.options=oOptions||{};
		var oEl =me.el= $(el);
		var fHandler=me.startHandler=function(oEvt){
			me.start(oEvt);
		};
		oEl.on(_events[0],fHandler);
		fHandler=me.moveHandler=function(oEvt){
			me.move(oEvt);
		};
		oEl.on(_events[1],fHandler);
		fHandler=me.endHandler=function(oEvt){
			me.end(oEvt);
		};
		oEl.on(_events[2],fHandler);
	}
	/**
	 * 开始
	 * @param {jEvent}oEvt 事件对象
	 */
	function fStart(oEvt) {
		var me=this;
		me.drag=true;
		if($H.hasTouch()){
			//zepto.js event对象就是原生事件对象
			oEvt = oEvt.originalEvent||oEvt;
			oEvt = oEvt.touches[0];
		}
		me.eventX=oEvt.clientX;
		me.eventY=oEvt.clientY;
		var oEl=me.el[0];
		var left=oEl.style.left||0;
		if($H.isStr(left)){
			left=parseInt(left.replace('px',''));
		}
		me.elX=left;
		var top=oEl.style.top||0;
		if($H.isStr(top)){
			top=parseInt(top.replace('px',''));
		}
		me.elY=top;
		var oOptions=me.options;
		oOptions.start&&oOptions.start();
	}
	/**
	 * 移动
	 * @param {jEvent}oEvt 事件对象
	 */
	function fMove(oEvt) {
		var me=this;
		//阻止滚动页面或原生拖拽
		oEvt.preventDefault();
		if(me.drag===true){
			if($H.hasTouch()){
				oEvt = oEvt.originalEvent||oEvt;
				oEvt = oEvt.touches[0];
			}
			var nOffsetX=oEvt.clientX-me.eventX;
			var nOffsetY=oEvt.clientY-me.eventY;
			var oEl=me.el[0];
			var left=me.elX+nOffsetX;
			var top=me.elY+nOffsetY;
			var oOptions=me.options;
			var result=oOptions.move&&oOptions.move({
				origX:me.elX,
				origY:me.elY,
				curX:left,
				curY:top,
				offsetX:nOffsetX,
				offsetY:nOffsetY
			});
			if(result!==false){
				oEl.style.left=(result&&result.curX||left)+'px';
				oEl.style.top=(result&&result.curY||top)+'px';
			}
		}
	}
	/**
	 * 结束
	 */
	function fEnd(){
		var me=this;
		me.drag=false;
		var oOptions=me.options;
		oOptions.end&&oOptions.end();
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		var oEl=me.el;
		oEl.off(_events[0],me.startHandler);
		oEl.off(_events[1],me.moveHandler);
		oEl.off(_events[2],me.endHandler);
	}
	
	return Draggable;
	
});
/**
 * 抽象事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-20
 */
//"handy.common.AbstractEvents"
$Define('CM.AbstractEvents',
['B.Class','B.Events'],
function(){
	
	var AbstractEvents=$H.createClass();
	
	$H.extend(AbstractEvents.prototype,$H.Events);
	
	$H.extend(AbstractEvents.prototype,{
//		_eventCache          : {},                     //自定义事件池
//		_execEvtCache        : [],                     //待执行事件队列
//		_listenTo            : [],                     //存储对其它对象的监听
		initialize           : fInitialize,            //初始化
		_parseListenToEvents : _fParseListenToEvents,  //处理对象类型或者空格相隔的多事件
		listenTo             : fListenTo,              //监听指定对象的事件
		unlistenTo           : fUnlistenTo             //移除对其它对象的监听
	});
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me._eventCache={};
		me._execEvtCache=[];
		me._listenTo=[];
	}
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @method _parseListenToEvents(sMethod,name[,param,..])
	 * @param {string}sMethod 调用的方法名
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {*=}param 附加参数，具体参照对应的方法
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseListenToEvents(sMethod,oTarget,name,param){
		var me=this;
		var aArgs=$H.toArray(arguments,3);
		return me._parseEvents(name,function(aParams){
			aParams.unshift(oTarget);
			me[sMethod].apply(me,aParams.concat(aArgs));
		});
	}
	/**
	 * 监听指定对象的事件
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * 其余参数同base.Events.on
	 */
	function fListenTo(oTarget,name,fHandler,context,nTimes){
		var me=this;
		if(me._parseListenToEvents('listenTo',oTarget,name,fHandler,context,nTimes)){
			return;
		}
		if(typeof context=='number'){
			nTimes=context;
			context=null;
		}
		context=context||me;
		var fCall=me._delegateHandler(fHandler,context);
		me._listenTo.push({
			target:oTarget,
			name:name,
			delegation:fCall,
			handler:fHandler
		});
		oTarget.on(name,fCall,context,nTimes);
	}
	/**
	 * 移除对其它对象的监听
	 * @param {CM.AbstractEvents|string}oTarget 参数对象，继承自AbstractEvents的实例对象，
	 * 							也可以传入'all'，表示移除所有监听
	 * 其余参数同base.Events.off
	 */
	function fUnlistenTo(oTarget,name,fHandler){
		var me=this;
		if(me._parseListenToEvents('unlistenTo',oTarget,name,fHandler)){
			return;
		}
		var aListenTo=me._listenTo;
		var bAll=oTarget=='all';
		$H.each(aListenTo,function(i,oListenTo){
			if(bAll||(oListenTo.name==name&&oListenTo.handler==fHandler&&oListenTo.target==oTarget)){
				oListenTo.target.off(oListenTo.name,oListenTo.delegation);
				aListenTo.splice(i,1);
			}
		})
	}
	
	return AbstractEvents;
});
/**
 * 设备基本插件模块，提供本地相关的基本功能
 * 
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("P.Device", 
function() {

	var Device = {
		isPhonegap     : fIsPhonegap,     //是否是phonegap环境
		getNetType     : fGetNetType,     //获取网络类型
		isWifi         : fIsWifi          //是否是wifi
	}
	/**
	 * 是否是phonegap环境
	 * @return {boolean} true表示是phonegap
	 */
	function fIsPhonegap(){
		return !!window.cordova;
	}
	/**
	 * 获取网络类型
	 * @return {number} 返回类型代码:可与下列值相比较
	 * Connection.UNKNOWN
	 * Connection.ETHERNET
	 * Connection.WIFI
	 * Connection.CELL_2G
	 * Connection.CELL_3G
	 * Connection.CELL_4G
	 * Connection.CELL
	 * Connection.NONE
	 */
	function fGetNetType(){
		var oConnection=navigator.connection;
		return oConnection&&oConnection.type;
	}
	/**
	 * 是否是wifi
	 * @return{boolean} true 表示是wifi
	 */
	function fIsWifi(){
		return typeof Connection!='undefined'&&Device.getNetType()===Connection.WIFI;
	}

	return Device;

});
/**
 * 相机插件模块，提供本地相关的基本功能
 * 
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("P.Camera", 
function() {

	var Cam = {
		getPicture     : fGetPicture     //获取照片
	}
	/**
	 * 获取照片
	 * @param {object}选项 {
	 * 		{string}sourceType:照片源，'CAMERA'表示照相机,'PHOTOLIBRARY'表示本地图库
	 * 		{function({string}picUri)}success:成功回调函数
	 * 		{function({string}errCode)}error:失败回调函数
	 * 		{number}quality:照片品质，默认是50
	 * }
	 */
	function fGetPicture(oOptions){
		var me=this;
		var fSuccess=oOptions.success;
		var fError=oOptions.error;
		var sSourceType=oOptions.sourceType;
		var nSourceType=Camera.PictureSourceType[sSourceType];
		//phonegap
		navigator.camera.getPicture(
			function (imageData) {
			    fSuccess&&fSuccess(imageData);
			},
			function onFail(message) {
				//用户取消不提示
				if(fError&&fError(message)!==false){
					if(message!='no image selected'&&message.indexOf('cancel')<0){
					    $C.Tips({text:'获取照片失败: ' + message,theme:'error'});
					}
				}
			}, 
			{ 
				quality: oOptions.quality||50,
				mediaType:Camera.MediaType.PICTURE,
			    destinationType:Camera.DestinationType.FILE_URI,
			    sourceType:nSourceType
			}
		);
	}

	return Cam;

});
/**
 * PhonegapPlugin模块，提供phonegap功能
 * 
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-25
 */

//var position = {
//	"coords" : {
//		"latitude" : 23.05027,
//		"longitude" : 113.404926,
//		"accuracy" : 27.5,
//		"altitude" : null,
//		"heading" : null,
//		"speed" : 0,
//		"altitudeAccuracy" : null
//	},
//	"timestamp" : "2013-12-25T17:18:18.663Z"
//}

$Define("P.Geolocation", 
function() {

	var Geolocation = {
		getCurrentPosition     : fGetCurrentPosition,     //获取当前位置
		onSuccess              : fOnSuccess,              //成功回调函数
		onError                : fOnError                 //错误回调函数
	}

	/**
	 * 获取当前位置
	 * @param {Function({Object}oPosition)}fOnSucc 成功回调函数
	 * @param {Function=}fOnError 错误回调函数
	 */
	function fGetCurrentPosition(fOnSucc,fOnError) {
		var me=this;
	    var fSucc=$H.intercept(me.onSuccess,fOnSucc);
	    var fErr=$H.intercept(me.onError,fOnError);
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(fSucc, fErr);
		}else{
			new $C.Tips({
				showPos:'top',
				size:'mini',
				timeout:null,
				theme:'error',
				noMask:true,
				text:'当前设备不支持获取位置'
			});
		}
	}
	/**
	 * 成功回调函数
	 * @param {Object}oPos 当前位置信息
	 */
	function fOnSuccess(oPos){
	}
	/**
	 * 错误回调函数
	 * @param {Object}oError 错误信息
	 */
	function fOnError(oError) {
		var sMsg;
		switch (oError.code) {
			case oError.PERMISSION_DENIED :
				sMsg = "您拒绝了位置请求"
				break;
			case oError.POSITION_UNAVAILABLE :
				sMsg = "位置不可用"
				break;
			case oError.TIMEOUT :
				sMsg = "请求超时"
				break;
			case oError.UNKNOWN_ERROR :
				sMsg = "未知错误"
				break;
		}
		new $C.Tips({
			showPos:'top',
			size:'mini',
			noMask:true,
			text:sMsg,
			theme:'error'
		});
	}

	return Geolocation;

});
/**
 * 数据仓库类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.data.DataStore"
$Define('D.DataStore',
'B.Class',
function(){
	var DataStore=$H.createClass();
	
	$H.extend(DataStore.prototype,{
		get            : fGet,       //获取数据
		find           : fFind,
		push           : fPush       //放入仓库
	});
	//缓存池
	var _cache={
//		name : []
	};
	
	//全局快捷别名
	$S=$H.getSingleton(DataStore);
	
	/**
	 * 获取数据
	 * @param {string}sName 模型名称或者cid
	 * @param {Object=}oOptions 用于匹配的键值对
	 * @return {Model|Array} 如果通过cid或id获取，返回模型对象，否则返回匹配的模型数组
	 */
	function fGet(sName,oOptions){
		var oCache;
		if($H.isClass(sName)){
			sName=sName.$ns;
		}else if($H.isInstance(sName)){
			sName=sName.constructor.$ns;
		}else{
			sName=$H.alias(sName);
		}
		if(oCache=_cache[sName]){
			if(oOptions===undefined){
				return oCache;
			}
			if(!$H.isObj(oOptions)){
				//根据id查找
				oOptions={id:oOptions};
			}
			var aResult=[];
			$H.each(oCache,function(k,obj){
				if($H.largeThan(obj,oOptions)){
					aResult.push(obj);
				}
			});
			return aResult.length>0?aResult[0]:null;
		}
	}
	/**
	 * 
	 */
	function fFind(){
		
	}
	/**
	 * 放入仓库
	 * @param {string=}sCid 客户id
	 * @param {*}data 数据
	 */
	function fPush(sCid,data){
		if(typeof sCid!='string'){
			data=sCid;
			sCid=null;
		}
		var sName=data.constructor.$ns;
		var aCache=_cache[sName]||(_cache[sName]={});
		aCache[data.uuid]=data;
		//快捷访问别名(客户id)
		if(sCid){
			if(!_cache[sCid]){
				_cache[sCid]=data;
			}
		}
	}
	
	return DataStore;
	
});
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2014-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.data.AbstractDao
$Define('D.AbstractDao',
[
'B.LocalStorage',
'B.Class'
],
function(LS){
	
	var AbstractDao=$H.createClass();
	
	$H.extend(AbstractDao.prototype,{
		_ajaxMethodMap   : {
			'create': 'POST',
			'update': 'POST',
			'patch':  'PATCH',
			'delete': 'DELETE',
			'read':   'GET'
	    },
	    _localMethodMap  : {
	    	'create': 'setItem',
			'update': 'setItem',
			'patch':  'setItem',
			'delete': 'removeItem',
			'read':   'getItem'
	    },
		ajax             : fAjax,        //ajax方法
		parseParam       : $H.noop,      //预处理请求参数
		beforeSend       : fBeforeSend,  //发送前处理
		complete         : fComplete,    //发送完处理
		error            : $H.noop,      //错误处理
		success          : $H.noop,      //成功处理
		showLoading      : $H.noop,      //显示/隐藏loading提示
		get              : fGet,         //获取数据
		set              : fSet,         //设置数据
		remove           : fRemove,      //删除数据
		sync             : fSync         //同步数据
	});
	
	/**
	 * 发送ajax请求，这里回调函数的设计师为了方便统一处理公共的逻辑，比如登录超时等，同时又能保证各模块能够自行处理回调而避开公共处理逻辑
	 * @param {Object}oParams{
	 * 			{function=}beforeSucc 成功回调函数，在公共this.success方法前执行，若beforeSucc返回false则不继续执行this.success方法
	 * 			{function=}success 成功回调函数，在公共this.success方法后执行，如果公共方法已经作出了处理并返回false，则此方法不执行
	 * 			{function=}beforeErr 执行机制类似beforeSucc
	 * 			{function=}error 执行机制类似success
	 * }
	 * 
	 */
	function fAjax(oParams){
		var me=this;
		//处理参数
		oParams=me.parseParam(oParams);
		//包装回调函数
		var fError=$H.intercept(oParams.error,me.error);
		oParams.error=$H.intercept(fError,oParams.beforeErr);
		var fSucc=$H.intercept(oParams.success,me.success);
		oParams.success=$H.intercept(fSucc,oParams.beforeSucc);
		oParams.beforeSend=$H.intercept($H.bind(me.beforeSend,me,oParams),oParams.beforeSend);
		oParams.complete=$H.intercept($H.bind(me.complete,me,oParams),oParams.complete);
		return $.ajax(oParams);
	}
	/**
	 * 发送前处理
	 */
	function fBeforeSend(oParams){
		this.showLoading(true,oParams);
	}
	/**
	 * 发送完处理
	 */
	function fComplete(oParams){
		this.showLoading(false,oParams);
	}
	/**
	 * 获取数据
	 */
	function fGet(){
	}
	/**
	 * 设置数据
	 */
	function fSet(){
	}
	/**
	 * 删除数据
	 */
	function fRemove(){
	}
	/**
	 * 同步数据
	 * @param {string}sMethod 操作方法(read/update/delete/create/patch）
	 * @param {Model|Collection}oModel 参数模型或集合对象
	 * @param {Object}oOptions 选项{
	 * 		{string=}storeType:存储类型(local/remote),默认是remote
	 * 		{string=}data:要同步的数据
	 * 		{Object=}attrs:要同步的键值对
	 * }
	 * @return {*} 如果是get操作，返回指定的数据
	 */
	function fSync(sMethod, oModel, oOptions){
		var me=this;
		oOptions=oOptions||{};
		var sStoreType=oOptions.storeType||'remote';
		//ajax请求参数
		var oParam={type: 'POST'||me._ajaxMethodMap[sMethod], dataType: 'json'};
		if(!oOptions.url){
		    oParam.url =oModel.getUrl();
		}
	    if (oOptions.data == null && oModel && (sMethod === 'create' || sMethod === 'update' || sMethod === 'patch')) {
	        //oParam.contentType = 'application/json';
	        oParam.data = oOptions.attrs || oModel.toJSON(oOptions);
	    }
	    var result;
		if(sStoreType=='remote'){
			//服务端存储
			oParam.url+='/'+sMethod+'.do';
			$H.extend(oParam,oOptions);
			result=me.ajax(oParam);
		}else{
			//本地存储
			result=LS[me._localMethodMap[sMethod]](oParam);
		}
		oModel.trigger('request', oModel, oOptions);
		return result;
	}
	
	return AbstractDao;
	
});
/**
 * 抽象数据类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.data.AbstractData"
$Define('D.AbstractData',
['D.AbstractDao',
'CM.AbstractEvents',
'D.DataStore'],
function(AbstractDao,AbstractEvents){
	
	var AbstractData=AbstractEvents.derive({
		_isDirty        : true,
		dirtyTime       : 30*60*1000,     //数据失效时间，超出则标记为脏数据
//		lastSyncTime    : null,           //上次同步时间
//		dao             : null,           //数据访问对象，默认为common.AbstractDao
		initialize      : fInitialize,    //初始化
		isDirty         : fIsDirty,       //返回是否是脏数据
		setDirty        : fSetDirty,      //设置脏数据
		sync            : fSync,          //同步数据，可以通过重写进行自定义
		fetch           : $H.noop,        //抓取数据
		fetchIf         : fFetchIf        //仅在脏数据时抓取数据
	});
	
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me.callSuper();
		me.uuid=$H.uuid();
		//配置dao对象
		me.dao=me.dao||$H.getSingleton(AbstractDao);
	}
	/**
	 * 返回是否是脏数据
	 * @return {boolean} true表示是脏数据
	 */
	function fIsDirty(){
		var me=this;
		var bDirty=me._isDirty;
		if(!bDirty){
			if(me.lastSyncTime){
				var now=$H.now();
				bDirty=now.getTime()-me.lastSyncTime.getTime()>=me.dirtyTime;
			}
		}
		return bDirty;
	}
	/**
	 * 设置为脏数据
	 */
	function fSetDirty(){
		this._isDirty=true;
	}
	/**
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {D.AbstractData}oData 数据对象
	 * @param {Object}oOptions 设置
	 * @return {*} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
	 */
    function fSync(sMethod,oData,oOptions) {
    	var me=this;
    	me.lastSyncTime=$H.now();
    	this._isDirty=false;
        return me.dao.sync(sMethod,oData,oOptions);
    }
    /**
     * 仅在脏数据时抓取数据
     * @param {object=}oOptions 选项
     * @return {*=} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
     */
    function fFetchIf(oOptions){
    	var me=this;
    	//非脏数据不进行抓取
        if(me.isDirty()){
        	return me.fetch(oOptions);
        }
    }
	
	return AbstractData;
	
});
/**
 * 模型类，负责数据封装，可监听事件：invalid、sync、destroy、change:attr、change
 * PS：
 * 1、为了保证模型的一致性，新建模型实例必须使用静态get方法，而不能用new方式；
 * 2、自定义属性默认不提交，需要提交需配置save:true
 * 3、嵌套属性（自定义属性中类型为模型或集合类型的属性）区别于普通属性，不可通过hasChanged、changedAttrs等方法获取改变，save时也不会提交
 *    只能通过相关委托事件(_onAttrEvent方法里)进行监测；
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.data.Model"
$Define('D.Model',
[
'D.AbstractData',
'D.DataStore'
],
function(AbstractData){
	
	var Model=AbstractData.derive({
		//可扩展属性
//      fields                : {},                  
		/**
		 * 属性声明列表，一般是需要额外处理的定制属性，基本类型的属性不需要在此声明，{
	     *	普通形式：
	     *	{string}name:{
		 *	    {string|Class=}type:类型，可以是字符串(string/number/Date/Model/Collection),也可以是类,
		 *		{boolean=}unsave:是否不需要保存，嵌套属性都不提交，基本类型的自定义字段保存时默认提交，仅当声明为unsave:true时不提交
		 *		{object=}options:新建模型/集合实例时的选项,
		 *		{*=}def:默认值,
		 *   	{Function=}parse:设置该属性时自定义解析操作,
		 *   	{Array=}depends:依赖的属性，计算属性需要此配置检查和计算
	     *	}
	     *	简便形式:
	     *	{name:default}
	     *}
	     */
////    belongsTo             : null,                //保留属性，描述一对一关系，
////    hasMany               : null,                //保留属性，描述一对多关系
//		cid                   : 0,                   //客户id
//		id                    : 0,                   //模型id
        idAttribute           : 'id',                //id默认属性名
//      uuid                  : 0,                   //uuid，初始化时系统分配，具有全局唯一性
        
        //系统属性
//      fetching              : false,               //是否正在抓取数据，model.get('fetching')==true表示正在抓取
//		saving                : false,               //正在保存
//		destroyed             : false,               //是否已销毁
		$isModel              : true,                //模型标记
		
        //内部属性
//		_changing             : false,               //是否正在改变，但未保存
		_pending              : false,               //
//		_previousAttributes   : {},                  //较早的值
//		_attributes           : {},                  //属性对象
//    	_changed              : {},                  //改变了的值
//	    validationError       : {},                  //校验错误的值
        
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
   		_doDepends            : _fDoDepends,         //处理计算/依赖属性
   		_parseFields          : _fParseFields,       //属性预处理
   		_onAttrEvent          : _fOnAttrEvent,       //处理属性模型和集合事件
		
		initialize            : fInitialize,         //类初始化
//		init                  : $H.noop,             //自定义初始工作
		getDefaults           : fGetDefaults,        //获取默认值
		toJSON                : fToJSON,             //返回对象数据副本
   		get                   : fGet,                //获取指定属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
   		each                  : fEach,               //遍历字段
   		hasChanged            : fHasChanged,         //判断自上次change事件后有没有修改，可以指定属性
   		changedAttrs          : fChangedAttrs,       //返回改变过的属性，可以指定需要判断的属性
   		filterUnsave          : fFilterUnsave,       //过滤掉不需要保存的属性
   		previous              : fPrevious,           //返回修改前的值，如果没有修改过，则返回null
   		fetch                 : fFetch,              //获取模型数据
   		save                  : fSave,               //保存模型
   		destroy               : fDestroy,            //销毁/删除模型
   		getUrl                : fGetUrl,             //获取模型url
   		parse                 : fParse,              //分析处理回调数据，默认直接返回response
   		clone                 : fClone,              //克隆模型
   		isNew                 : fIsNew,              //判断是否是新模型(没有提交保存，并且缺少id属性)
   		isValid               : fIsValid             //校验当前是否是合法的状态
	},{
		get                   : fStaticGet           //静态get方法，为了保证模型的一致性，新建模型实例必须使用此方法，而不能用new方式
	});
	
	/**
	 * 静态get方法，为了保证模型的一致性，新建模型实例必须使用此方法，而不能用new方式
	 * @method get
	 * @param {object}oVal
	 * @param {object=}oOptions new模型实例时的选项
	 * @param {object=}oChange 如果传入object，返回时，oChange.changed表示此次操作改变了原模型的值或者新建了模型实例
	 * @return {Model} 返回模型实例
	 */
	function fStaticGet(oVal,oOptions,oChange){
		if(!oVal){
			return;
		}
		var _Class=this;
		var oModel;
		var sIdName=_Class.prototype['idAttribute'];
		var id;
		//是否改变了原有模型，new操作也表示改变了
		var bHasChange=false;
		//如果有id，需要先查找是否有存在的模型，查询直接id效率高，所以先进行查询，查询不到id才通过new后，查询联合id
		if(id=oVal[sIdName]){
	        oModel=$S.get(_Class,{id:id});
        }
        if(!oModel){
	        //因为可能存在自定义联合主键，所以这里没有现存的模型而新建一个实例时，要把val传入，以便获取正确的主键
	        var oModel=new _Class(oVal,oOptions),tmp;
	        //放入数据仓库
			if(!(tmp=$S.get(oModel,{id:oModel.id}))){
				bHasChange=true;
				$S.push(oModel);
			}else{
				//已存在的对应的模型，设置新值
				bHasChange=tmp.set(oVal).changed;
				oModel=tmp;
			}
        }else{
        	//已存在的对应的模型，设置新值
        	bHasChange=oModel.set(oVal).changed;
        }
        oChange&&(oChange.changed=bHasChange);
        return oModel;
	}
	/**
	 * 执行校验，如果通过校验返回true，否则，触发"invalid"事件
	 * @param {Object=}oAttrs 参数属性，传入表示只校验参数属性
	 * @param {Object=}oOptions 选项
	 * @return {boolean} true表示通过校验
	 */
    function _fValidate(oAttrs, oOptions) {
    	var me=this;
        if (!oOptions.validate || !me.validate){
        	return true;
        }
        oAttrs = $H.extend({}, me._attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, $H.extend(oOptions, {validationError: error}));
        return false;
    }
    /**
     * 处理计算/依赖属性
     * @param {object}oChanges 当前操作改变的属性
     * @param {boolean}bSilent 是否不触发事件
     */
    function _fDoDepends(oChanges,bSilent){
    	var me=this;
    	//处理计算属性
	    var oFields=me.fields,oField,aDeps,oSets={},bNeed;
	    for(var key in oFields){
	    	var oField=oFields[key];
			if(oField&&(aDeps=oField.depends)){
				for(var i=0;i<aDeps.length;i++){
			    	//当依赖属性变化时，设置计算属性
					if(oChanges.hasOwnProperty(aDeps[i])){
						oSets[key]=undefined;
						bNeed=true;
						break;
					}
				}
			}
	    }
	    bNeed&&me.set(oSets,null,{silent:bSilent});
    }
    /**
     * 属性预处理
     * @param {Object}oAttrs 属性表
     * @return {Object} 返回处理好的属性表
     */
    function _fParseFields(oAttrs){
    	var me=this;
    	var oFields;
    	if(!(oFields=me.fields)){
    		return oAttrs;
    	}
    	var oField,fParse,val,aDeps,type,oOptions;
    	var oResult={};
		for(var key in oAttrs){
			val=oAttrs[key];
			if(oField=oFields[key]){
				type=oField.type;
				oOptions=oField.options;
				//自定义解析
				if(fParse=oField.parse){
					val=fParse.apply(me,[val,oAttrs]);
				}
				//自定义类型，包括Model和Collection
				if($H.isStr(type)){
					if(type=='Date'){
						val=$H.parseDate(val);
					}else if(type=='string'||type=='str'){
						val=val?''+val:'';
					}else if(type=='number'||type=='num'){
						val=val?parseFloat(val):0;
					}else if(type=='boolean'||type=='bool'){
						val=val&&val!=='false';
					}else if(type.indexOf('.')>0){
						type=$H.ns(type);
					}
				}
				if($H.isClass(type)&&!(val instanceof type)){
					//模型
					if(type.get){
						var oChange={};
				        val=type.get(val,oOptions,oChange);
				        val&&(val._changedTmp=oChange.changed);
					}else{
						//集合
						var oCurrent=me.get(key);
						if(oCurrent){
							var tmp=oCurrent.set(val);
							val=oCurrent;
							val._changedTmp=tmp.changed;
							
						}else{
							val=new type(val,oOptions);
							val._changedTmp=true;
						}
					}
				}
			}
			oResult[key]=val;
		}
		return oResult;
    }
    /**
	 * 处理属性模型和集合事件
	 * @param {string}sAttr 属性名
	 * @param {string}sEvent 事件名称
	 * @param {Model|Collection}obj 对象
	 */
    function _fOnAttrEvent(sAttr,sEvent, oModel,oCollection) {
    	if(sEvent=='invalid'||sEvent=='sync'||sEvent=='request'||sEvent.indexOf('change:')==0){
    		return;
    	}
    	//模型被添加事件无需处理，如果是集合add事件，oCollection是集合对象
    	if(sEvent=='add'&&!$H.isInstance(oCollection)){
    		return;
    	}
    	var me=this;
    	var oVal=me.get(sAttr);
    	var args=$H.toArray(arguments,1);
    	me.trigger.apply(me,['change:'+sAttr,me,oVal].concat(args));
    	me.trigger.apply(me,['change',me].concat(args));
    	//me.trigger.apply(me, arguments);
    	//标记已触发对应属性change事件，通知set方法不必再触发
    	me._attrEvts[sAttr]=1;
    	var oChange={};
    	oChange[sAttr]=oVal;
    	me._doDepends(oChange);
    }
	/**
	 * 初始化
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * 		{object=}custom 自定义配置
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
		me.callSuper();
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = 'md_'+$H.Util.uuid();
		me._attributes = {};
		me._attrEvts={};
		if(oOptions.custom){
			$H.extend(me,oOptions.custom);
		}
		if (oOptions.collection){
			me.collection = oOptions.collection;
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		oAttrs = $H.extendIf(oAttrs, me.getDefaults());
		if(me.init){
			me.init();
		}
		me.set(oAttrs, oOptions);
		me._changed = {};
	}
	/**
	 * 获取默认值
	 * @return 返回默认值
	 */
	function fGetDefaults(){
		var me=this;
		var oDefaults={},oFields;
		if(oFields=me.fields){
			for(var k in oFields){
				var field=oFields[k];
				oDefaults[k]=(field&&$H.isObj(field))?field.def:field;
			}
		}
		return oDefaults;
	}
	/**
	 * 返回对象数据副本
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return $H.clone(this._attributes);
    }
    /**
     * 获取指定属性值
     * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性
     */
    function fGet(sAttr) {
        return this._attributes[sAttr];
    }
	/**
	 * 获取html编码过的属性值
	 * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性编码后的值
	 */
    function fEscape(sAttr) {
        return $H.String.escape(this.get(sAttr));
    }
	/**
	 * 判断是否含有参数属性
	 * @param {string}sAttr 参数属性
	 * @return {boolean} 指定属性不为空则返回true
	 */
    function fHas(sAttr) {
    	var value=this.get(sAttr);
    	return  value!== null&&value!==undefined;
    }
	/**
	 * 设置值，并触发change事件(如果发生了变化)
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否清除设置
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 * @return {object}{
	 * 		{boolean}changed : true表示此次设置改变了模型，false表示未改变
	 * 		{boolean=}invalid : 仅当true时表示未通过校验
	 * 		{Model}result:模型对象自身,
	 * 		{boolean=}silent:true时不触发事件
	 * } 
	 */
    function fSet(sKey, val, oOptions) {
    	var me=this;
    	var oAttrs;
    	var oResult={result:me};
	    if (typeof sKey === 'object') {
	    	oAttrs = sKey;
	    	oOptions = val;
	    } else {
	    	(oAttrs = {})[sKey] = val;
	    }
	    oOptions || (oOptions = {});
	    if(oAttrs instanceof Model){
	    	oAttrs=oAttrs._attributes;
	    }
	    //属性预处理
	    oAttrs= me._parseFields(oAttrs);
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	oResult.invalid=true;
	    	return oResult;
	    }
	
	    var bUnset= oOptions.unset;
	    var bSilent= oOptions.silent;
	    var oChanges={};
	    var bChanging= me._changing;
	    me._changing  = true;
	
	    //开始改变前，先存储初始值
	    if (!bChanging) {
	        me._previousAttributes = $H.Object.clone(me._attributes);
	    	me._changed = {};
	    }
	    var oCurrent = me._attributes, 
	    	oPrev = me._previousAttributes;
	
	    //id特殊处理
	    if (me.idAttribute in oAttrs){
	  	    me.id = oAttrs[me.idAttribute];
	    }
	    
	    //循环进行设置、更新、删除
	    for (var sAttr in oAttrs) {
	   	    val = oAttrs[sAttr];
	    	var curVal=oCurrent[sAttr];
	    	//当前属性是否是嵌套属性
	   	    var bCurNested=curVal&&$H.isInstance(curVal);
	   	    //新值是否是嵌套属性
	   	    var bNewNested=val&&$H.isInstance(val);
	    	//嵌套属性设置，不需要在此触发相关事件，而是通过监听该属性上的事件触发事件，计算属性也是通过事件触发计算
	    	if(bCurNested||bNewNested){
	    		//删除旧值或更换嵌套属性，须移除原来在该属性上的事件
	    		if(bUnset){
	    			delete oCurrent[sAttr];
	    			//如果有旧值，需要清除相关事件
	    			curVal&&me.unlistenTo(curVal,'all');
	    		}else{
					oCurrent[sAttr] = val;
					if(!curVal||!val||curVal.id!=val.id){
						//如果有旧值，需要清除相关事件
	    				curVal&&me.unlistenTo(curVal,'all');
	    				if(val){
							//这里如果传入就是模型，_parseFields方法不进行处理，因此这里标记为已改变
							val._changedTmp=true;
							//新模型需要监听事件
		    				me.listenTo(val,'all',$H.bind(me._onAttrEvent,me,sAttr));
	    				}
					}
	    		}
	    		////与当前值不相等，放入本次改变列表中
    			if(bUnset||!val||val._changedTmp){
    				oChanges[sAttr]=val;
    			}
				val&&delete val._changedTmp;
	    	}else{
		   	    //与当前值不相等，放入本次改变列表中
		    	if (!$H.equals(oCurrent[sAttr], val)){
		    		oChanges[sAttr]=val;
		    	}
		    	//与初始值不相等，放入已经改变的hash对象中
		    	if (!$H.equals(oPrev[sAttr], val)) {
		            me._changed[sAttr] = val;
		    	} else {
		    		//跟初始值相等，即没有变化
		        	delete me._changed[sAttr];
		    	}
		    	
		    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    	}
	    }
	    
		var bHasChange=!$H.isEmpty(oChanges);
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (bHasChange){
	        	me._pending = oOptions;
	        }
	        for (var k in oChanges) {
	        	//_onAttrEvent里触发过了的属性事件，这里不需要再触发
	        	if(!me._attrEvts[k]){
		      	    me.trigger('change:' + k, me, oCurrent[k], oOptions);
	        	}
	        }
	    }
	
	    if (bChanging){
	    	//return me;
	    }
	    //触发模型对象change事件
	    if (!bSilent) {
	        while (me._pending) {
	       		oOptions = me._pending;
	            me._pending = false;
	            me.trigger('change', me, oOptions);
	        }
	    }
	    me._pending = false;
	    me._changing = false;
	    //处理依赖属性
	    if(bHasChange){
		    me._doDepends(oChanges,bSilent);
	    }
	    oResult.changed=bHasChange;
	    //重新清空属性事件标记
	    me._attrEvts={};
	    return oResult;
    }
    /**
     * 移除指定属性
     * @param {string}sAttr 参数属性
     * @param {Object=}oOptions 备选参数
     * @return {Model}返回模型对象本身
     */
    function fUnset(sAttr, oOptions) {
    	oOptions=oOptions||{};
    	oOptions.unset=true;
        return this.set(sAttr, void 0, oOptions);
    }
    /**
     * 清除所有属性
     * @param {Object=}oOptions 
     */
    function fClear(oOptions) {
    	var me=this;
        var oAttrs = {};
        for (var sKey in me._attributes) {
            oAttrs[sKey] = void 0;
        }
        oOptions=oOptions||{};
    	oOptions.unset=true;
        return me.set(oAttrs,oOptions);
    }
    /**
     * 遍历字段
     * @param {function}fCall({string}attr,{*}value) 回调函数
     */
    function fEach(fCall){
    	var oAttrs=this._attributes;
    	$H.each(oAttrs,fCall);
    }
	/**
	 * 判断自上次change事件后有没有修改，可以指定属性
	 * @param {string=}sAttr 参数属性，为空表示判断对象有没有修改
	 * @param {boolean=}bAll 仅当为true时检测所有的属性，否则只检测需要提交的属性
	 * @return {boolean} true表示有修改
	 */
    function fHasChanged(sAttr,bAll) {
    	if($H.isBool(sAttr)){
    		bAll=sAttr;
    		sAttr=undefined;
    	}
    	if(bAll){
	    	var oChanged=this._changed;
	        if (sAttr == null){
	        	return !$H.isEmpty(oChanged);
	        }
	        return $H.contains(oChanged, sAttr);
    	}else{
    		var oChanged=this.changedAttrs();
    		if(sAttr == null){
    			return !!oChanged;
    		}
	    	return oChanged&&$H.contains(oChanged, sAttr);
    	}
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @param {Object=}oDiff 参数属性，表示只判断传入的属性列表，返回跟参数属性不同的属性表
	 * @param {boolean=}bAll 仅当为true时检测所有的属性，否则只检测需要提交的属性
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttrs(oDiff,bAll) {
    	var me=this;
    	if($H.isBool(oDiff)){
    		bAll=oDiff;
    		oDiff=undefined;
    	}
        var val, changed = false;
        var oFields=me.fields;
        var oOld = me._changing ? me._previousAttributes : me._attributes;
        var _fGet=function(oAttrs){
	        for (var sAttr in oAttrs) {
	        	var bNeed=true;
            	val = oAttrs[sAttr];
	        	//bAll不为true时只检测需要保存的属性
	        	if(!bAll){
	        		var bHas=oFields.hasOwnProperty(sAttr);
	        		bNeed=!bHas||(bHas&&($H.isSimple(val)&&!oFields[sAttr].unsave));
	        	}
	            if (bNeed){
	            	if(!oDiff||(oDiff&&!$H.equals(oOld[sAttr], val))){
			            (changed || (changed = {}))[sAttr] = val;
	            	}
	            }
	        }
        }
        if(oDiff){
        	_fGet(oDiff);
        }else{
        	_fGet(me._changed);
        }
        return changed;
    }
    /**
     * 过滤掉不需要保存的属性
     * @param {object=}oAttrs 要处理的属性表，默认是模型属性表
     * @return {object} 返回需要提交保存的属性表
     */
    function fFilterUnsave(oAttrs){
    	var me=this;
    	var oFields=me.fields;
    	oAttrs=oAttrs||me._attributes;
    	var oResult={};
    	$H.each(oAttrs,function(k,val){
	    	var bHas=oFields.hasOwnProperty(k);
		    var bNeed=!bHas||(bHas&&$H.isSimple(val)&&!oFields[k].unsave);
		    if(bNeed){
		    	oResult[k]=val;
		    }
    	})
    	return oResult;
    }
	/**
	 * 返回修改前的值，如果没有修改过，则返回null
	 * @param {string}sAttr 指定属性
	 * @return {*} 返回修改前的值，如果没有修改过，则返回null
	 */
    function fPrevious(sAttr) {
    	var me=this;
        if (sAttr == null || !me._previousAttributes){
        	return null;
        }
        return me._previousAttributes[sAttr];
    }
	/**
	 * 返回所有修改前的值
	 * @return {Object} 返回所有修改前的值
	 */
    function fPreviousAttributes() {
        return $H.clone(this._previousAttributes);
    }
	/**
	 * 获取模型数据
	 * @param {Object=}oOptions 备选参数{
	 * 		{function=}beforeSet 设置前操作，返回false则不进行后续设置
	 * 		{function=}success 设置成功回调
	 * 		{function|boolean=}parse boolean表示是否要使用parse函数处理回调数据，function表示使用该函数处理回调数据
	 * }
	 * @return {*} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (oOptions.parse === void 0) {
        	oOptions.parse = true;
        }
        var fSuccess = oOptions.success;
        var fBeforeSet = oOptions.beforeSet;
        oOptions.success = function(resp) {
        	me.set('fetching',false);
        	var oData=me.parse(resp, oOptions);
        	if (fBeforeSet){
        		if(fBeforeSet(me, oData, oOptions)==false){
        			return;
        		}
        	}
        	var r=me.set(oData, oOptions);
        	if (r.invalid){
        		return false;
        	}
        	if (fSuccess){
        		fSuccess(me, oData, oOptions);
        	}
        	me.trigger('sync', me, oData, oOptions);
        };
    	me.set('fetching',true);
        return me.sync('read', me, oOptions);
    }
	/**
	 * 保存模型
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object|Function=}oOptions 选项，如果传入的是函数，表示成功回调函数{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * 		{function=}success 成功回调函数
	 * 		{boolean=}update true时执行update操作
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * 		{function=}noChanged 没有需要提交的属性时，调用的函数
	 * 		{object=}extAttrs 额外提交的属性，只在原有属性有改变需要提交时才提交，noChanged时忽略此属性
	 * }
	 */
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, sMethod, oXhr;
        //sKey, value 或者 {sKey: value}
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else {
        	(oAttrs = {})[sKey] = val;
        }

        if($H.isFunc(oOptions)){
        	oOptions={success:oOptions};
        }
        oOptions = $H.extend({validate: true}, oOptions);

        //now==true，立刻设置数据
        if (oAttrs && oOptions.now) {
       	    if (me.set(oAttrs, oOptions).invalid){
       	    	return false;
       	    }
        } else {
        	//验证数据
        	if (!me._validate(oAttrs, oOptions)){
		        return false;
		    }
        }

        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var fSuccess = oOptions.success;
        oOptions.success = function(resp) {
        	me.saving=false;
	        var oServerAttrs = me.parse(resp, oOptions);
	        //now!=true，确保更新相应数据(可能没有返回相应数据)
	        if (!oOptions.now){
	        	oServerAttrs = $H.extend(oAttrs || {}, oServerAttrs);
	        }
	        //服务器返回的值可能跟现在不一样，还要根据返回值修改
	        if ($H.isObj(oServerAttrs) && me.set(oServerAttrs, oOptions).invalid) {
	            return false;
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        me.trigger('sync', me, resp, oOptions);
	    };
		var fError = oOptions.error;
		oOptions.error=function(){
			me.saving=false;
			if(fError){
				fError.apply(me,arguments);
			}
		}
	    sMethod = me.isNew() ? 'create' : (oOptions.update ? 'update':'patch' );
    	//patch只提交所有改变的值
	    var oSaveAttrs;
	    if (sMethod === 'patch'){
	    	var oChanged=me.changedAttrs(oAttrs);
	    	//没有改变的属性，直接执行回调函数
	    	if(!oChanged){
	    		var fNoChange = oOptions.noChange;
	    		if (fNoChange){
		        	fNoChange(me, oOptions);
		        }
		        return;
	    	}
	    	oSaveAttrs = oChanged;
	    }else{
	    	//提交所有属性值
	    	var oCurrent=$H.extend({},me._attributes);
	    	oSaveAttrs = $H.extend(oCurrent,oAttrs);
	    }
	    oSaveAttrs=me.filterUnsave(oSaveAttrs);
	    //额外属性
	    if(oOptions.extAttrs){
	    	$H.extend(oSaveAttrs,oOptions.extAttrs);
	    }
	    oOptions.attrs=oSaveAttrs;
	    me.saving=true;
	    me.sync(sMethod, me, oOptions);
    }
	/**
	 * 销毁/删除模型
	 * @param {Object=}oOptions 备选参数{
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * }
	 */
    function fDestroy(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        var fSuccess = oOptions.success;

        var destroy = function() {
            me.trigger('destroy', me, me.collection, oOptions);
            me.off('all');
            me.destroyed=true;
        };

        oOptions.success = function(resp) {
	        if (!oOptions.now || me.isNew()){
	        	destroy();
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        if (!me.isNew()){
	        	me.trigger('sync', me, resp, oOptions);
	        }
	    };

        if (me.isNew()) {
       	    oOptions.success();
            return false;
        }

        me.sync('delete', me, oOptions);
        if (oOptions.now){
        	destroy();
        }
    }
	/**
	 * 获取模型url
	 * @return {string} 返回模型url
	 */
    function fGetUrl() {
    	var me=this;
        var sUrl =$H.result(me, 'url') ||$H.result(me.collection, 'url');
        if(!sUrl){
        	$D.error(new Error('必须设置一个url属性或者函数'));
        }
        if (me.isNew()){
        	return sUrl;
        }
        return sUrl.replace(/([^\/])$/, '$1/') + encodeURIComponent(me.id);
    }
    /**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
    	if(resp.code){
	        return resp.data;
    	}else{
    		return resp;
    	}
    }
    /**
     * 克隆模型
     * @return {Model} 返回克隆副本
     */
    function fClone() {
    	var me=this;
        return new me.constructor(me._attributes);
    }
	/**
	 * 判断是否是新模型(没有提交保存，并且缺少id属性)
	 * @return {boolean} true表示是新模型
	 */
    function fIsNew() {
    	var me=this;
        return me.id===undefined;
    }
	/**
	 * 校验当前是否是合法的状态
	 * @return {boolean} true表示合法
	 */
    function fIsValid(oOptions) {
        return this._validate({}, $H.extend(oOptions || {}, { validate: true }));
    }
	
	return Model;
	
});
/**
 * 集合类，封装模型集合，可监听事件：invalid、add、remove、sync、sort、sortItem、reset及模型的事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.data.Collection"
$Define('D.Collection',
[
'B.Array',
'D.AbstractData',
'D.Model',
'D.DataStore'
],
function(Arr,AbstractData,Model){
	
	var Collection=AbstractData.derive({
		//可扩展属性
//		url                    : '',                  //集合url
		model                  : Model,               //子对象模型类
//		comparator             : '',                  //比较属性名或比较函数
//		desc                   : false,               //是否降序
		
//      fetching              : false,                //是否正在抓取数据，collection.fetching==true表示正在抓取
		//内部属性
//		_models                : [],                  //模型列表
//		_byId                  : {},                  //根据id和cid索引
//		length                 : 0,                   //集合长度
		$isCollection          : true,                //集合标记
		
		_getIterator           : _fGetIterator,       //获取迭代函数
		_reset                 : _fReset,             //重置集合
		_prepareModel          : _fPrepareModel,      //初始化模型
		_addReference          : _fAddReference,      //关联模型和集合
		_removeReference       : _fRemoveReference,   //移除模型和集合关联关系
		_onModelEvent          : _fOnModelEvent,      //模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
		
		initialize             : fInitialize,         //初始化
		toJSON                 : fToJSON,             //返回json格式数据(模型数据的数组)
		add                    : fAdd,                //添加模型
		remove                 : fRemove,             //移除模型
		set                    : fSet,                //设置模型
		each                   : fEach,               //遍历集合
		eachDesc               : fEachDesc,           //降序遍历集合
		reset                  : fReset,              //重置模型，此方法不会触发add、remove等事件，只会触发reset事件
		push                   : fPush,               //添加到集合最后
		pop                    : fPop,                //取出集合最后一个模型
		unshift                : fUnshift,            //添加到集合最前面
		shift                  : fShift,              //取出集合第一个模型
		slice                  : fSlice,              //返回选定的元素的数组，同"Array.slice"
		get                    : fGet,                //通过id或cid获取模型
		size                   : fSize,               //获取集合元素个数
		at                     : fAt,                 //获取指定位置的模型
		where                  : fWhere,              //返回包含指定 key-value 组合的模型的数组
		findWhere              : fFindWhere,          //返回包含指定 key-value 组合的第一个模型
		sort                   : fSort,               //排序
		sortItem               : fSortItem,           //对指定模型进行排序
		pluck                  : fPluck,              //提取集合里指定的属性值
		getUrl                 : fGetUrl,             //获取集合url
		fetch                  : fFetch,              //请求数据
		create                 : fCreate,             //新建模型
		parse                  : fParse,              //分析处理回调数据，默认直接返回response
		clone                  : fClone               //克隆
		
	});
	
	//从base.Array生成方法
	$H.each([
		'map','some','every','find','filter','invoke','indexOf'
	], function(i,sMethod) {
	    Collection.prototype[sMethod] = function() {
	      var aArgs = Array.prototype.slice.call(arguments);
	      aArgs.unshift(this._models);
	      return Arr[sMethod].apply(Arr, aArgs);
	    };
	});
	
    Collection.prototype['sortedIndex'] = function(value, context,bDesc) {
        var iterator = this._getIterator(this.comparator);
        bDesc=this.desc||bDesc;
        return Arr['sortedIndex'](this._models, value,iterator, context,bDesc);
    };
	
	$H.each(['sortBy','groupBy','countBy'], function(i,sMethod) {
	    Collection.prototype[sMethod] = function(value, context,bDesc) {
	        var iterator = this._getIterator(value);
	        bDesc=this.desc||bDesc;
	        return Arr[sMethod](this._models, iterator, context,bDesc);
        };
    });
	
    /**
	 * 获取迭代函数
	 * @param {Function|string=}value 为字符串时返回获取该属性的迭代函数，如果是函数则返回自身
	 * @return {Function} 返回迭代函数
	 */
	function _fGetIterator(value) {
	    if ($H.isFunc(value)){
	    	return value;
	    }
	    return function(oModel) {
		           return oModel.get(value);
		       };
	}
	/**
	 * 重置集合
	 */
    function _fReset() {
    	var me=this;
        me.length = 0;
        me._models = [];
        me._byId  = {};
    }

    /**
     * 初始化模型
     * @param {Object}oAttrs key-value组合
     * @param {Object}oOptions 选项，同Model初始化选项
     * @return {Model|boolean} 返回初始化的模型，如果初始化失败，则返回false
     */
    function _fPrepareModel(oAttrs, oOptions) {
    	var me=this;
        if (oAttrs instanceof Model){
        	return oAttrs;
        }
        oOptions = oOptions ? $H.clone(oOptions) : {};
        oOptions.collection = me;
        var oModel = me.model.get(oAttrs, oOptions);
        if (!oModel.validationError){
        	return oModel;
        }
        me.trigger('invalid', me, oModel.validationError, oOptions);
        return false;
    }
	/**
	 * 关联模型和集合
	 * @param {Model}oModel 模型对象
	 */
    function _fAddReference(oModel) {
    	var me=this;
        me._byId[oModel.cid] = oModel;
        if (oModel.id != null){
        	me._byId[oModel.id] = oModel;
        }
        if (!oModel.collection){
        	oModel.collection = me;
        }
        oModel.on('all', me._onModelEvent, me);
    }
    /**
     * 移除模型和集合关联关系
     * @param {Model}oModel 模型对象
     */
    function _fRemoveReference(oModel) {
    	var me=this;
        if (me === oModel.collection){
        	delete oModel.collection;
        }
        oModel.off('all', me._onModelEvent, me);
    }
	/**
	 * 模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
	 * @param {string}sEvent 事件名称
	 * @param {Model}oModel 模型对象
	 * @param {Collection}oCollection
	 * @param {Object}oOptions 同remove方法的选项
	 */
    function _fOnModelEvent(sEvent, oModel, oCollection, oOptions) {
    	var me=this;
        if ((sEvent === 'add' || sEvent === 'remove') && oCollection !== me){
        	return;
        }
        if (sEvent === 'destroy'){
        	me.remove(oModel, oOptions);
        }
        //id特殊处理
        if (oModel && sEvent === 'change:' + oModel.idAttribute) {
            delete me._byId[oModel.previous(oModel.idAttribute)];
            if (oModel.id != null){
            	me._byId[oModel.id] = oModel;
            }
        }
        me.trigger.apply(me, arguments);
    }
	/**
	 * 初始化
	 * @param {Array=}aModels 模型数组
	 * @param {Object=}oOptions 选项{
	 * 		{Model=}model 模型类
	 * 		{object=}custom 自定义配置
	 * }
	 */
	function fInitialize(aModels, oOptions) {
		var me=this;
		me.callSuper();
	    oOptions || (oOptions = {});
	    if (oOptions.model) {
	    	me.model = oOptions.model;
	    }
	    if(oOptions.custom){
			$H.extend(me,oOptions.custom);
		}
	    me._reset();
	    if (aModels){
	    	me.reset(aModels, $H.extend({silent: true}, oOptions));
	    }
	    //如果比较器是属性名，监听相应的事件进行必要的排序
	    var comparator=me.comparator;
	    if($H.isStr(comparator)){
    		me.on('change:'+comparator,function(sEvt,oModel,sTime){
    			me.sortItem(oModel);
    		});
	    }
	}
	/**
	 * 返回json格式数据(模型数据的数组)
	 * @param {Object=}oOptions 选项(同set方法)
	 * @return {Array} 模型数据数组
	 */
    function fToJSON(oOptions) {
    	var me=this;
        return $H.map(me._models,function(oModel){
        	return oModel.toJSON(oOptions); 
        });
    }
	/**
	 * 添加模型
	 * @param 同"set"方法
	 * @return {Model}返回被添加的模型，如果是数组，返回第一个元素
	 */
    function fAdd(models, oOptions) {
    	oOptions=$H.extend({
    		add:true,
    		remove:false,
    		merge:false
    	},oOptions);
        return this.set(models,oOptions).result;
    }
    /**
     * 移除模型
     * @param 同"set"方法
     * @return {Model}返回被移除的模型，如果是数组，返回第一个元素
     */
    function fRemove(models, oOptions) {
    	var me=this;
        var bSingular = !$H.isArr(models);
        models = bSingular ? [models] : $H.clone(models);
        oOptions || (oOptions = {});
        var i, l, index, oModel;
        for (i = 0, l = models.length; i < l; i++) {
        	oModel = models[i] = me.get(models[i]);
        	if (!oModel){
        		continue;
        	}
        	delete me._byId[oModel.id];
        	delete me._byId[oModel.cid];
        	index = me.indexOf(oModel);
        	me._models.splice(index, 1);
        	me.length--;
        	if (!oOptions.silent) {
          		oOptions.index = index;
          		oModel.trigger('remove', oModel, me, oOptions);
        	}
        	me._removeReference(oModel, oOptions);
        }
        return bSingular ? models[0] : models;
    }
	/**
	 * 设置模型
	 * @param {Object|Model|Array}models 模型属性对象或模型对象或数组
	 * @param {Object}oOptions 选型{
	 * 		{boolean=}add : 是否是添加
	 * 		{boolean=}merge : 是否是合并
	 * 		{boolean=}remove : 是否删除
	 * 		{boolean=}sort : 是否排序
	 * 		{number=}at : 指定添加位置
	 * 		{boolean=}parse : 是否分析处理数据
	 * }
	 * @return {object}{
	 * 		{boolean}changed : true表示此次设置改变了模型，false表示未改变
	 * 		{Collection}result: 集合自身
	 * }
	 */
    function fSet(models, oOptions) {
    	var me=this;
    	if(!models){
    		return {result:me};
    	}
    	oOptions = $H.extend({
    		add: true,
    		remove: false,
    		merge: true
    	},oOptions);
    	if(models instanceof Collection){
    		models=models._models;
    	}
        if (oOptions.parse){
        	models = me.parse(models, oOptions);
        }
        var bSingular = !$H.isArr(models);
        var aModels = bSingular ? (models ? [models] : []) : $H.clone(models);
        var aCurModels=me._models;
        var i, l, id, oModel, oAttrs, oExisting;
        var at = oOptions.at;
        var cTargetModel = me.model;
        //是否可排序
        var bSortable = me.comparator && (at == null) && oOptions.sort !== false;
        //是否添加
        var bAdd = oOptions.add, 
        //是否合并
        bMerge = oOptions.merge,
        //是否移除
        bRemove = oOptions.remove,
        //记录是否发生了改变
        bHasChange=false;

        //循环设置模型
        for (i = 0, l = aModels.length; i < l; i++) {
        	oAttrs = aModels[i] || {};
        	if (oAttrs instanceof Model) {
          		id = oModel = oAttrs;
        	} else {
         		id = oAttrs[cTargetModel.prototype.idAttribute || 'id'];
        	}

        	//如果已经存在对应id的模型
        	if (oExisting = me.get(id)) {
        		//移除
            	if (bRemove){
            		me.remove(oExisting, oOptions);
            		bHasChange=true;
            	}
            	//合并
          		if (bMerge) {
           			oAttrs = oAttrs === oModel ? oModel.attributes : oAttrs;
                	if (oOptions.parse){
                		oAttrs = oExisting.parse(oAttrs, oOptions);
                	}
		        	var _changed=oExisting.set(oAttrs, oOptions).changed;
            		bHasChange=bHasChange||_changed;
          		}
         		aModels[i] = oExisting;

        	} else if (bAdd) {
        		oOptions.id=id;
         		//添加	
            	oModel = aModels[i] = me._prepareModel(oAttrs, oOptions);
            	if (!oModel){
            		continue;
            	}
            	me._addReference(oModel, oOptions);
            	if(bSortable){
	       			//获取排序位置
	       			at=me.sortedIndex(oModel);
	       		}
            	//指定位置上添加
	        	if (at != null) {
	            	aCurModels.splice(at, 0, oModel);
	       		}else{
	       			aCurModels.push(oModel);
	       		}
            	me.length +=1;
	       		//触发相应事件
       			if (!oOptions.silent) {
            		oModel.trigger('add', oModel, me, oOptions,at);
       			}
       			bHasChange=true;
        	}

        }

        return {
        	changed:bHasChange,
        	result:me
        };
    }
    /**
     * 遍历集合
     * @param {function}fCall(nIndex,oModel) 回调函数
     */
    function fEach(fCall){
    	$H.each(this._models,fCall);
    }
    /**
     * 降序遍历集合
     * @param {function}fCall(nIndex,oModel) 回调函数
     */
    function fEachDesc(fCall){
    	var aModels=this._models;
    	for(var i=aModels.length-1;i>=0;i--){
    		fCall(i,aModels[i]);
    	}
    }
	/**
	 * 重置模型，此方法不会触发add、remove等事件，只会触发reset事件
	 * @param 同"set"方法
	 * @return {Model} 返回重置的模型
	 */
    function fReset(models, oOptions) {
    	var me=this;
        oOptions || (oOptions = {});
        for (var i = 0, l = me._models.length; i < l; i++) {
        	me._removeReference(me._models[i], oOptions);
        }
        oOptions.previousModels = me._models;
        me._reset();
        if(models){
	        models = me.add(models, $H.extend({silent: true}, oOptions)).result;
        }
        if (!oOptions.silent){
        	me.trigger('reset', me, oOptions);
        }
        return models;
    }
	/**
	 * 添加到集合最后
	 * @param 同"set"方法
	 * @return 返回添加的模型
	 */
    function fPush(oModel, oOptions) {
    	var me=this;
        return me.add(oModel, $H.extend({at: me.length}, oOptions)).result;
    }
	/**
	 * 取出集合最后一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回取出的模型
	 */
    function fPop(oOptions) {
    	var me=this;
        var oModel = me.at(me.length - 1);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 添加到集合最前面
	 * @param 同"set"方法
	 * @return {Model} 返回添加的模型
	 */
    function fUnshift(oModel, oOptions) {
        return this.add(oModel, $H.extend({at: 0}, oOptions)).result;
    }
	/**
	 * 取出集合第一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回第一个模型
	 */
    function fShift(oOptions) {
    	var me=this;
        var oModel = me.at(0);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 返回选定的元素的数组，同"Array.slice"
	 * @param {number}nStart 规定从何处开始选取。如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，
	 * 						 -1 指最后一个元素，-2 指倒数第二个元素，以此类推。
	 * @param {number=}nEnd 规定从何处结束选取。该参数是数组片断结束处的数组下标。如果没有指定该参数，
	 * 						那么切分的数组包含从 start 到数组结束的所有元素。如果这个参数是负数，
	 * 						那么它规定的是从数组尾部开始算起的元素。
	 * @return {Array} 选定的元素的数组
	 */
    function fSlice() {
      return Array.prototype.slice.apply(this._models, arguments);
    }
	/**
	 * 通过id或cid获取模型
	 * @param {Object|number|string}obj 可以直接是id或cid，也可以是包含id或cid属性的对象
	 * @return {Model} 返回对应模型
	 */
    function fGet(obj) {
    	var me=this;
        if (obj == null){
      		return void 0;
        }
        return me._byId[obj] || me._byId[obj.id] || me._byId[obj.cid];
    }
    /**
     * 获取集合元素个数
     * @return {number} 返回元素个数
     */
    function fSize(){
    	return this.length;
    }
	/**
	 * 获取指定位置的模型
	 * @param {number}nIndex 参数索引
	 * @return {Model} 返回该模型
	 */
    function fAt(nIndex) {
        return this._models[nIndex];
    }
	/**
	 * 返回包含指定 key-value 组合的模型的数组
	 * @param {Object}oAttrs key-value 组合
	 * @param {boolean}bFirst 是否只返回第一个模型
	 * @return {Array|Model|undefined} 返回匹配对象的数组，如果没有，则返回空数组，如果bFirst==true，返回第一个匹配的模型
	 */
    function fWhere(oAttrs, bFirst) {
    	var me=this;
        if ($H.isEmpty(oAttrs)){
        	return bFirst ? void 0 : [];
        }
        return me[bFirst ? 'find' : 'filter'](function(oModel) {
        	for (var key in oAttrs) {
            	if (oAttrs[key] !== oModel.get(key)){
            		return false;
            	}
        	}
        	return true;
        });
    }
	/**
	 * 返回包含指定 key-value 组合的第一个模型
	 * @param {Object}oAttrs key-value 组合
	 * @return {Model|undefined} 返回第一个匹配的模型，没有匹配的模型则返回undefined
	 */
    function fFindWhere(oAttrs) {
        return this.where(oAttrs, true);
    }
	/**
	 * 排序
	 * @param {Object=}oOptions 选项{
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 * @return {Collection} 返回排序后的集合
	 */
    function fSort(oOptions) {
    	var me=this;
        if (!me.comparator){
        	$D.error(new Error('没有比较器'));
        }
        oOptions || (oOptions = {});

        if (typeof me.comparator=='string' || me.comparator.length === 1) {
        	me._models = me.sortBy(me.comparator, me,oOptions.desc);
        } else {
       		me._models.sort($H.Function.bind(me.comparator, me));
        }

        if (!oOptions.silent){
        	me.trigger('sort', me, oOptions);
        }
        return me;
    }
    /**
     * 对指定模型进行排序
     * @param {Model}oModel 参数模型
     * @param {number=}nIndex 要排到的索引，如不传，则自动根据sortedIndex方法进行计算
     */
    function fSortItem(oModel,nIndex){
    	var me=this;
    	if(nIndex===undefined){
    		nIndex=me.sortedIndex(oModel);
    	}
    	var nCurIndex=me.indexOf(oModel);
    	var aModels=me._models;
    	aModels.splice(nCurIndex,1);
    	aModels.splice(nIndex,0,oModel);
    	me.trigger('sortItem',oModel,nIndex,nCurIndex,me);
    }
    /**
     * 提取集合里指定的属性值
	 *  @param {string}sAttr 参数属性
	 *  @return {Array} 返回集合对应属性的数组
     */
    function fPluck(sAttr) {
      return $H.invoke(this._models, 'get', sAttr);
    }
    /**
     * 获取url
     * @return {string}返回集合的url
     */
    function fGetUrl(){
    	return this.url;
    }
	/**
	 * 请求数据
	 * @param {Object=}oOptions{
	 * 		{function=}beforeSet 设置前操作，返回false则不进行后续设置
	 * 		{function=}success 设置成功回调
	 * 		{boolean=}reset true表示使用reset方法设置
	 * }
	 * @return {*} 返回同步方法的结果，如果是抓取远程数据，返回jQuery的xhr对象
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        var fSuccess = oOptions.success;
        var fBeforeSet = oOptions.beforeSet;
        oOptions.success = function(resp) {
        	me.fetching=false;
        	var oData=me.parse(resp, oOptions);
        	if (fBeforeSet){
        		if(fBeforeSet(me, oData, oOptions)==false){
        			return;
        		}
        	}
        	var method = oOptions.reset ? 'reset' : oOptions.add?'add':'set';
        	me[method](oData, oOptions);
        	if (fSuccess){
        		fSuccess(me, oData, oOptions);
        	}
        	me.trigger('sync', me, oData, oOptions);
        };
    	me.fetching=true;
        return me.sync('read', me, oOptions);
    }
	/**
	 * 新建模型
	 * @param {C.Model|Object}oModel 模型对象或者模型属性集
	 * @param {Object=}oOptions 选项
	 * @return {C.Model} 返回新建的模型
	 */
    // Create a new instance of a model in me collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    function fCreate(oModel, oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (!(oModel = me._prepareModel(oModel, oOptions))){
        	return false;
        }
        if (oOptions.now){
        	me.add(oModel, oOptions);
        }
        var success = oOptions.success;
        oOptions.success = function(oModel, resp) {
        	if (!oOptions.now){
        		me.add(oModel, oOptions);
        	}
        	if (success){
        		success(oModel, resp, oOptions);
        	}
        };
        oModel.save(null, oOptions);
        return oModel;
    }
	/**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions){
        if(resp.code){
	        return resp.data;
    	}else{
    		return resp;
    	}
    }
	/**
	 * 克隆
	 * @return {Collection} 返回克隆的集合
	 */
    function fClone() {
    	var me=this;
        return new me.constructor(me._models);
    }
	
	return Collection;
	
});
/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.view.AbstractManager"
$Define("V.AbstractManager", 'B.Class',function() {

	var AbstractManager = $H.createClass();
	
	$H.extend(AbstractManager.prototype, {
//	    _types        : {},               //存储类
//	    _all          : {},               //存储所有实例
	    initialize    : fInitialize,      //初始化
		type          : 'manager',        //被管理对象的类型，也用于生成标记被管理对象的class
		registerType  : fRegisterType,    //注册视图类
		getClass      : fGetClass,        //根据xtype获取视图类
		register      : fRegister,        //注册视图
		unregister    : fUnRegister,      //注销视图
		eachInEl      : fEachInEl,        //循环指定节点里的被管理对象
		generateId    : fGenerateId,      //生成视图的id
		get           : fGet,             //根据id或cid查找视图
		find          : fFind             //查找视图
	});
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me._types={};
		me._all={};
		me._allForCid={};
	}
	/**
	 * 注册视图类型
	 * @method registerType
	 * @param {string}sXType 视图类型
	 * @param {object}oClass 视图类
	 */
	function fRegisterType(sXtype,oClass){
		var me=this;
		me._types[sXtype]=oClass;
		oClass.prototype.xtype=sXtype;
	}
	/**
	 * 根据xtype获取视图类
	 * @method getClass
	 * @param {string|Class}xtype 视图类型或命名空间或视图类
	 * @return {object} 返回对应的视图类
	 */
	function fGetClass(xtype){
		if($H.isClass(xtype)){
			return xtype;
		}
		return this._types[xtype]||$H.ns(xtype);
	}
	/**
	 * 注册视图
	 * @method register
	 * @param {object}oView 视图对象
	 */
	function fRegister(oView,oParams){
		var me=this;
		var sCid=oView.cid=oParams.cid||$H.uuid();
		var sId=oView._id=me.generateId(sCid,oView.xtype);
		me._all[sId]=oView;
		me._allForCid[sCid]=oView;
	}
	/**
	 * 注销视图
	 * @method unRegister
	 * @param {object}oView 视图对象
	 */
	function fUnRegister(oView){
		var oAll=this._all;
		var sId=oView.getId();
		var sCid=oView.getCid();
		//执行update时，如果id没有改变，这里不需要删除，因为已经新对象被覆盖了
		if(oAll[sId]==oView){
			delete oAll[sId];
		}
		var oCids=this._allForCid;
		if(oCids[sCid]==oView){
			delete oCids[sCid];
		}
	}
	/**
	 * 遍历指定节点里的所有视图
	 * @method eachInEl
	 * @param {jQuery}oEl 指定的节点
	 * @param {function(Component)}fCall
	 */
	function fEachInEl(oEl,fCall){
		var me=this;
		//获取视图el
		var oItemEl=oEl.find(".js-"+me.type);
		oItemEl.each(function(i,oEl){
			oEl=$(oEl);
			var sId=oEl.attr('id');
			var oItem=me.get(sId);
			//如果未被销毁，执行回调
			if(oItem){
				fCall(oItem);
			}
		})
	}
	/**
	 * 生成视图的id
	 * @method generateId
	 * @param {string=}sCid cid
	 * @param {string}sType 视图xtype
	 */
	function fGenerateId(sCid,sType){
		var me=this;
		var sId=$H.expando+"-"+me.type+"-"+sType+'-'+(sCid||$H.uuid());
		if(me._all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找视图
	 * @method get
	 * @param {string}sId 视图id或者cid
	 * @return {View} 返回找到的视图
	 */
	function fGet(sId){
		var me=this;
		return me._all[sId]||me._allForCid[sId];
	}
	/**
	 * 查找视图
	 * @param {string}sQuery
	 * @return {array} 返回匹配的结果数组
	 */
	function fFind(sQuery){
		var me=this;
		var all=me._all;
		var r=[];
		for(var id in all){
			var oView=all[id];
			if(!oView.parent){
				if(oView.match(sQuery)){
					r.push(oView);
				}
				var tmp=oView.find(sQuery);
				if(tmp.length>0){
					r=r.concat(tmp);
				}
			}
		};
		return r;
	}

	return AbstractManager;
	
});
/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-17
 */
//"handy.view.ViewManager"
$Define("V.ViewManager", ['V.AbstractManager','B.Events'],function(AbstractManager) {

	var ViewManager = AbstractManager.derive({
		type          : 'view',           //管理类型
		initialize    : fInitialize,      //初始化
		afterRender   : fAfterRender,     //调用指定dom节点包含的视图的afterRender方法
		destroy       : fDestroy          //销毁视图，主要用于删除元素时调用
	});
	
	//全局快捷别名
	$V=$H.getSingleton(ViewManager);
	
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		var me=this;
		me.callSuper();
		//监听afterRender自定义事件，调用相关视图的afterRender方法
		$H.on("afterRender",function(sEvt,oEl){
			//调用包含的视图的afterRender方法
			me.afterRender(oEl);
		})
		//监听removeEl自定义事件，jQuery的remove方法被拦截(base/adapt.js)，执行时先触发此事件
		$H.on('removeEl',function(sEvt,oEl){
			//销毁包含的视图
			me.destroy(oEl);
		})
	}
	/**
	 * 调用指定dom节点包含的视图的afterRender方法
	 * @method afterRender
	 * @param {jQuery}oEl 指定的节点
	 */
	function fAfterRender(oEl){
		this.eachInEl(oEl,function(oView){
			oView.afterRender();
		});
	}
	/**
	 * 销毁视图，主要用于删除元素时调用
	 * @method destroy
	 * @param {jQuery}oRemoveEl 需要移除视图的节点
	 */
	function fDestroy(oRemoveEl){
		this.eachInEl(oRemoveEl,function(oView){
			oView.destroy(true);
		});
	}

	return ViewManager;
	
});
/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-17
 */
 //"handy.view.AbstractView"
$Define('V.AbstractView',
[
'V.ViewManager',
'CM.AbstractEvents'
],
function(ViewManager,AbstractEvents){
	
	var AbstractView=AbstractEvents.derive({
		xtype               : 'View',            //类型
		//配置
//		cid                 : '',                //客户id，是id去除视图前缀后的部分，在视图内唯一，方便使用
//		renderTo            : null,              //渲染节点
		renderBy            : 'append',          //默认渲染方式
		autoRender          : true,              //是否默认就进行渲染
//		manager             : null,              //视图管理对象
		listeners           : [],                //事件配置列表，初始参数可以是对象也可以是对象数组
		//属性
//		_config             : null,              //配置模型对象
//		_id                 : null,              //id
//		inited              : false,             //是否已经初始化
//		initParam           : null,              //保存初始化时传入的参数
//		_container          : null,              //试图对象容器节点
//		rendered            : false,             //是否已渲染
//      listened            : false,             //是否已初始化事件
//		_listeners          : [],                //实例事件池
		
		_parseListenEvents  : _fParseListenEvents,  //处理对象类型或者空格相隔的多事件
				
		initialize          : fInitialize,       //初始化
		init                : $H.noop,           //初始化，doConfig后调用，一般留给具体项目使用，方便开发
		doConfig            : fDoConfig,         //初始化配置
		getId               : fGetId,            //获取id
		getCid              : fGetCid,           //获取cid
		getEl               : fGetEl,            //获取容器节点
		getHtml             : fGetHtml,          //获取html
		render              : fRender,           //渲染
		findEl              : fFindEl,           //查找视图内节点
		parseItems          : $H.noop,           //分析子视图
		callChild           : $H.noop,           //调用子视图方法
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		destroy             : fDestroy           //销毁
	});
	
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @param {string}sMethod 调用的方法名
	 * @param {Object}oEvent 参数同this.listen
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseListenEvents(sMethod,oEvent){
		var me=this;
		var name=oEvent.name;
		return me._parseEvents(name,function(aParams){
			var oEvt=$H.extend({},oEvent);
			oEvt.name=aParams[0];
			if(aParams.length==2){
				oEvt.handler=aParams[1];
			}
			me[sMethod].call(me,oEvt);
		});
	}
	
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		oParams=oParams||{};
		me.callSuper();
		me._listeners=[];
		me.listeners=$H.clone(me.listeners);
		//注册视图管理
		me.manager=me.constructor.manager||$H.getSingleton(ViewManager);
		//注册视图，各继承类自行实现
		me.manager.register(me,oParams);
		//初始化配置
		me.doConfig(oParams);
		//初始化，一般留给具体项目实现，方便开发
		me.init(oParams);
		//分析子视图
		me.parseItems();
		//渲染
		if(me.autoRender!=false){
			me.render();
		}
		me.inited=true;
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		//复制保存初始参数
		me.initParam=oSettings;
		var oParams=oSettings||{};
		
		$H.extend(me,oParams);
		var renderTo;
		if(renderTo=oParams.renderTo){
			me.renderTo=$(renderTo);
		}else{
			me.renderTo=$(document.body);
		}
	}
	/**
	 * 获取id
	 * @method getId
	 * @return {string}返回id
	 */
	function fGetId(){
		return this._id;
	}
	/**
	 * 获取cid
	 * @method getCid
	 * @return {string}返回id
	 */
	function fGetCid(){
		return this.cid;
	}
	/**
	 * 获取容器节点
	 * @method getEl
	 * @return {jQuery} 返回容器节点
	 */
	function fGetEl(){
		return this._container;
	}
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		return this.html;
	}
	/**
	 * 渲染
	 * @method render
	 * @return {boolean=} 仅当没有成功渲染时返回false
	 */
	function fRender(){
		var me=this;
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
		//缓存容器
		me._container=$("#"+me.getId());
		me.initListeners();
	}
	/**
	 * 查找视图内节点
	 * @param {string}sSel jQuery选择器
	 * @return {jQuery} 返回结果
	 */
	function fFindEl(sSel){
		return this.getEl().find(sSel);
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function(Object[,fireParam..])}handler : 监听函数，第一个参数为事件对象oListener，其后的参数为fire时传入的参数
	 * 			{any=}data        : 数据
	 * 			{jQuery|Function(this:this)=}el       : 绑定事件的节点，不传表示容器节点，传入函数(this是本视图对象)则使用函数返回值
	 * 			{CM.AbstractEvents|Function=}target : 监听对象(listenTo方法)，继承自AbstractEvents的实例对象，传入函数(this是本视图对象)则使用函数返回值
	 * 			{boolean=}custom  : 为true时是自定义事件
	 * 			{number=}times    : 执行次数
	 * 			{boolean=}condition : 条件，不传默认执行监听
	 * 			{string=}selector : 选择器
	 * 			{any=}context     : 监听函数执行的上下文对象，默认是对象
	 * 			{string=}method   : 绑定方式，默认为"bind"，可以是"delegate","on"等jquery提供的事件方法
	 * }
	 */
	function fListen(oEvent){
		var me=this;
		if(me._parseListenEvents('listen',oEvent)){
			return;
		}
		if(oEvent.hasOwnProperty('condition')&&!oEvent.condition){
			return;
		}
		var sName=oEvent.name,
			context=oEvent.context,
			nTimes=oEvent.times,
			oTarget=oEvent.target,
			bIsCustom=oEvent.custom||oTarget||$H.contains(me._customEvents,sName),
			fHandler=oEvent.handler;
		if($H.isFunc(oTarget)){
			oTarget=oTarget.call(me);
		}
		//自定义事件
		if(bIsCustom){
			var aArgs=$H.removeUndefined([oTarget,sName,fHandler,context,nTimes]);
			me[oTarget?'listenTo':'on'].apply(me,aArgs);
		}else{
			//没有初始化事件，直接放入队列中
			if(!me.listened){
				me.listeners.push(oEvent);
				return;
			}
			//element事件
			var aListeners=me._listeners,
				oEl=oEvent.el,
				sMethod=oEvent.method||"bind",
				sSel=oEvent.selector,
				oData=oEvent.data,
				fFunc=oEvent.delegation=me._delegateHandler(fHandler,context);
			if($H.isFunc(oEl)){
				oEl=oEl.call(me);
			}
			oEl=oEl?typeof oEl=='string'?me.findEl(oEl):oEl:me.getEl();
			if(sSel){
				if(oData){
					oEl[sMethod](sSel,sName,oData,fFunc);
				}else{
					oEl[sMethod](sSel,sName,fFunc);
				}
			}else{
				if(oData){
					oEl[sMethod](sName,oData,fFunc);
				}else{
					oEl[sMethod](sName,fFunc);
				}
			}
			aListeners.push(oEvent);
		}
	}
	/**
	 * 解除事件
	 * @method unlisten
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示容器节点
	 * 			{boolean=}custom  : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fUnlisten(oEvent){
		var me=this;
		if(me._parseListenEvents('unlisten',oEvent)){
			return;
		}
		var sName=oEvent.name,
			fHandler=oEvent.handler;
		if(oEvent.custom){
			me.off(sName,fHandler);
		}else{
			var oEl=oEvent.el,
				sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
				sSel=oEvent.selector,
				fDelegation;
			oEl=oEl?typeof oEl=='string'?me.findEl(oEl):oEl:me.getEl();
			for(var i=me._listeners.length-1;i>=0;i--){
				var oListener=me._listeners[i]
				if(oListener.handler==fHandler){
					fDelegation=oListener.delegation;
					me._listeners.splice(i,1);
					break;
				}
			}
			if(sSel){
				oEl[sMethod](sSel,sName,fDelegation);
			}else{
				oEl[sMethod](sName,fDelegation);
			}
		}
	}
	/**
	 * 初始化所有事件
	 * @method initListeners
	 * @return {boolean=}如果已经初始化了，则直接返回false
	 */
	function fInitListeners(){
		var me=this;
		//已经初始化，直接退回
		if(me.listened){
			return false;
		}
		me.listened=true;
		var aListeners=me.listeners;
		for(var i=aListeners.length-1;i>=0;i--){
			me.listen(aListeners[i]);
		}
		me.callChild();
	}
	/**
	 * 清除所有事件
	 * @method clearListeners
	 */
	function fClearListeners(){
		var me=this;
		var aListeners=me._listeners;
		for(var i=aListeners.length-1;i>=0;i--){
			me.unlisten(aListeners[i]);
		}
		me.off('all');
		me.unlistenTo('all');
		me.callChild();
	}
	/**
	 * 销毁
	 * @method destroy
	 * @return {boolean=} 成功返回true，失败返回false，如果之前已经销毁返回空
	 */
	function fDestroy(){
		var me=this;
		if(me.destroyed){
			return;
		}
		me.clearListeners();
		me.unlistenTo('all');
		me.getEl().remove();
		me.destroyed=true;
		
		//注销组件
		me.manager.unregister(me);
		delete me._container;
		delete me.renderTo;
		delete me.html;
		return true;
	}
	
	return AbstractView;
	
});
/**
 * 模型视图类，实现视图与数据的同步
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-11
 */
//"handy.view.ModelView"
$Define('V.ModelView',
[
'B.Template',
'V.AbstractView',
'D.Model',
'D.Collection'
],
function(Template,AbstractView,Model,Collection){
	
	var ModelView=AbstractView.derive({
		bindType            : 'both',              //绑定类型，‘el’表示绑定(监听)节点，‘model’表示绑定(监听)模型，‘both’表示双向绑定
//		model               : null,                //模型对象
//		xmodel              : null,                //执行模板时使用的模型对象，本类中与model属性相同
//		modelClass          : null,                //模型类
//		_bindModelNums      : {},				   //保存逻辑块对应编号是否已绑定模型
//		_bindElNums         : {},                  //保存逻辑块对应编号是否已绑定节点
		
		initialize          : fInitialize,         //初始化
		doConfig            : fDoConfig,           //初始化配置
		preTmpl             : fPreTmpl,            //预处理模板
		getTmplFn           : fGetTmplFn,          //初始化模板函数
		getHtml             : fGetHtml,            //初始化html
		ifBind              : fIfBind,             //查询指定逻辑单元是否需要绑定模型对象或节点，检查后设为已绑定，确保每个逻辑单元只绑定一次事件
		getMetaMorph        : fGetMetaMorph,       //根据id获取元标签
		updateMetaMorph     : fUpdateMetaMorph,    //更新内容
		wrapMetaMorph       : fWrapMetaMorph,      //包装结果html
		get                 : fGet,                //获取配置属性
    	set                 : fSet,                //设置配置属性
		update              : fUpdate,             //更新数据
		getXmodel           : fGetXmodel           //获取配置对象
	});
	
	//注册自定义辅助函数
	Template.registerHelper('ModelView',{
		'if'       : fIf,
		'unless'   : fUnless,
		'each'     : fEach,
		getValue   : fGetValue,
		parseValue : fParseValue,
		bindAttr   : fBindAttr,
		input      : fInput,
		textarea   : fTextarea
	});
	
	var _bIfPlusJoin=Template.getIfPlusJoin();
	var _oExecAttrs=/((\w+)=['"]?)?([#\w][\s\w\.\?:#-]*)(['"]?)(?!\w*=)/g;
	
	/**
	 * if辅助函数
	 * @param {string|function}condition 条件语句
	 * @param {object}oOptions 选项{
	 * 		{boolean=}inverse:true时表示条件反转,
	 * 		{function}fn:回调函数,
	 * 		{string}exp:表达式,
	 * 		{object}context:模板函数执行上下文对象,
	 * 		{*}data:当前数据对象,
	 * 		{number}num:逻辑编号,
	 * 		{object}helpers:辅助函数表
	 * }
	 * @return {string} 返回生成的html
	 */
	function fIf(condition,oOptions){
		var me=oOptions.context;
		var oData=oOptions.data;
		var sExp=oOptions.exp;
		if ($H.isFunc(condition)) { 
			condition = condition.call(oData); 
		}
		var sHtml;
		if((condition&&!oOptions.inverse)||(!condition&&oOptions.inverse)){
			sHtml=oOptions.fn(oData);
		}
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(me.ifBind(nNum,oData)){
			me.listenTo(oData,'change:'+sExp,function(sName,oModel,sValue){
				var sHtml;
				if((sValue&&!oOptions.inverse)||(!sValue&&oOptions.inverse)){
					sHtml=oOptions.fn(oModel);
				}
				me.updateMetaMorph(sMetaId,sHtml);
			});
		}
		return me.wrapMetaMorph(sMetaId,sHtml);
	}
	/**
	 * unless辅助函数
	 * 参数说明同if辅助函数
	 */
	function fUnless(condition, oOptions){
		oOptions.inverse=true;
		return oOptions.helpers['if'].call(this, condition, oOptions);
	}
	/**
	 * each辅助函数，新式浏览器里使用，chrome下性能大约提升一倍
	 * @param {array|object}data 可遍历数据对象
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @return {string} 返回生成的html
	 */
	function fEach(data,oOptions){
		var me=oOptions.context;
		var fn=oOptions.fn,r=_bIfPlusJoin?'':[];
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(!data){
			return;
		}
		var sTmp;
		//集合类型数据
		if(data instanceof Collection){
			data.each(function(i,item){
				sTmp=me.wrapMetaMorph(sMetaId+'-'+item.uuid,fn(item));
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			});
			if(me.ifBind(nNum,data)){
				me.listenTo(data,'add',function(sEvt,oModel,oCollection,oOptions){
					var sHtml=me.wrapMetaMorph(sMetaId+'-'+oModel.uuid,fn(oModel));
					var at=oOptions.at;
					if(at){
						var oPre=oCollection.at(at-1);
						var n=sMetaId+'-'+oPre.uuid;
						$('#metamorph-'+n+'-end').after(sHtml);
					}else{
						$('#metamorph-'+sMetaId+'-end').before(sHtml);
					}
				});
				me.listenTo(data,'remove',function(sEvt,oModel,oCollection,oOptions){
					var n=sMetaId+'-'+oModel.uuid;
					me.updateMetaMorph(n,'','remove');
				});
			}
		}else if(data.length!==undefined){
			for(var i=0,l=data.length;i<l;i++){
				sTmp=me.wrapMetaMorph(sMetaId+'-'+i,fn(data[i]));
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}else{
			for(var i in data){
				sTmp=me.wrapMetaMorph(sMetaId+'-'+i,fn(data[i]));
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}
		return me.wrapMetaMorph(sMetaId,_bIfPlusJoin?r:r.join(''));
	}
	/**
	 * 获取值
	 * @param {string}sExp 表达式
	 * @param {object}oData 数据对象
	 * @return {string} 返回值
	 */
	function fGetValue(sExp,oData){
		var sValue=oData.get?oData.get(sExp):oData[sExp];
		return sValue;
	}
	/**
	 * 分析处理值
	 * @param {string}sValue 当前要处理的值
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @return {string} 返回生成的html
	 */
	function fParseValue(sValue,oOptions){
		var me=oOptions.context;
		var oData=oOptions.data;
		var sExp=oOptions.exp;
		var bIsEscape=Template.isEscape;
		var oHelpers=oOptions.helpers;
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(me.ifBind(nNum,oData)){
			me.listenTo(oData,'change:'+sExp,function(sName,oModel,sValue){
				if(bIsEscape){
					sValue=oHelpers.escape(sValue);
				}
				me.updateMetaMorph(sMetaId,sValue);
			});
		}
		if(bIsEscape){
			sValue=oHelpers.escape(sValue);
		}
		return me.wrapMetaMorph(sMetaId,sValue);
	}
	/**
	 * 绑定属性，使用形式如：<input type="text" {{bindAttr id="#input2" disabled?disabled value="value" class="isRed?red:green extCls #static-cls"}}/>
	 * id="#input2"，#开头表示常量，直接输出id=input2;
	 * dis?disabled，当dis字段为真(即：if(dis))时输出，disabled="disabled"，否则输出空字符；
	 * value="value"，如果value的值为my value，输出value="my value"；
	 * isRed?red:green，如果isRed为真，输出red，否则输出green
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数，特殊：type表示输入框类型input或textarea
	 * @return {string} 返回生成的html
	 */
	function fBindAttr(sExp,oOptions){
		var me=oOptions.context,
		oData=oOptions.data,
		nNum=oOptions.num,
		sType=oOptions.type,
		sMetaId=me.getCid()+'-'+nNum,
		sId='bindAttr-'+sMetaId,
		m,
		result=[],
		aMatches=[],
		bBindModel=me.ifBind(nNum,oData),
		bBindEl=sType&&me.ifBind(nNum,oData,true);
		
		//循环分析表达式，先找出id属性
		while(m=_oExecAttrs.exec(sExp)){
			if(m[2]=='id'){
				if(m[3].indexOf('this.')==0){
					sId= me[m[3].substring(5)];
				}else{
					sId=_fGetVal(m[3],oData);
				}
			}else{
				aMatches.push(m);
			}
		}
		
		result.push('id="'+sId+'"');
		
		//循环处理表达式
		var expStr,sAttr,aExps,aValues,ret;
		for(var i=0,len=aMatches.length;i<len;i++){
			m=aMatches[i];
			sAttr=m[2];
			expStr=m[3];
			aExps=expStr.split(' ');
			aValues=[];
			//多个表达式用空格分开
			for(var j=0;j<aExps.length;j++){
				ret=fParseAttrExp(me,sId,sAttr,aExps[j],bBindModel,bBindEl,oData);
				if(ret||ret===0){
					aValues.push(ret);
				}
			}
			var sVal=aValues.join(' ');
			//有属性名的绑定
			if(sAttr){
				//传递结果值给输入框辅助函数
				if(sType&&sAttr=='value'){
					oOptions.value=sVal;
					//textarea不需设置value
					if(sType==='textarea'){
						continue;
					}
				}
				sVal=(m[1]||'')+sVal+m[4];
			}else if(sVal){
				//无属性，如：isChk?checked
				sVal=sVal+'="'+sVal+'"';
			}
			sVal&&result.push(sVal);
		}
		
		return ' '+result.join(' ')+' ';
	}
	/**
	 * 根据表达式获取结果，用于属性绑定
	 * @param {string}sExp 参数表达式
	 * @param {object}oData 当前数据对象
	 * @return {string} 返回结果
	 */
	function _fGetVal(sExp,oData){
		if(!sExp){
			return sExp;
		}
		//#开头表示常量
		if(sExp.indexOf('#')==0){
			return sExp.substring(1);
		}else{
			return fGetValue(sExp,oData);
		}
	}
	/**
	 * 分析处理属性表达式
	 * @param {object}oContext 上下文对象
	 * @param {string}sId 当前节点的id
	 * @param {string}sAttr 要绑定的属性名
	 * @param {string}sExp 表达式
	 * @param {boolean}bListen 是否需要监听事件
	 * @param {object}oData 当前数据对象
	 * @return {string} 返回属性值
	 */
	function fParseAttrExp(oContext,sId,sAttr,sExp,bBindModel,bBindEl,oData){
		var me=oContext,val,
		sId='#'+sId,
		nMark1=sExp.indexOf('?'),
		nMark2=sExp.indexOf(':');
		//三目运算exp1?exp2:exp3、exp1?exp2、exp1:esExp
		if(sExp.indexOf('this.')==0){
			return me[sExp.substring(5)];
		}else if(nMark1>0||nMark2>0){
			var exp1=sExp.substring(0,nMark1>0?nMark1:nMark2);
			var exp2=nMark1<0?'':sExp.substring(nMark1+1,nMark2>0?nMark2:sExp.length);
			var exp3=nMark2<0?'':sExp.substring(nMark2+1,sExp.length);
			val=_fGetVal(exp1,oData);
			if(bBindModel&&exp1.indexOf('#')!=0){
				me.listenTo(oData,"change:"+exp1,function(sName,oModel,sValue){
					var jEl=$(sId);
					if(!sAttr){
						//没有属性值，如：isChk?checked或者isDisabled?disabled
						if(sValue){
							jEl.prop(exp2,true);
						}else{
							jEl.prop(exp2,false);
						}
					}else if(sAttr=='class'){
						if(sValue){
							exp3&&jEl.removeClass(exp3);
							exp2&&jEl.addClass(exp2);
						}else{
							exp2&&jEl.removeClass(exp2);
							exp3&&jEl.addClass(exp3);
						}
					}else{
						jEl.attr(sAttr,sValue?exp2:exp3);
						
					}
				});
			}
			return val?exp2:exp3;
		}else{
			val=_fGetVal(sExp,oData);
			if(sExp.indexOf('#')!=0){
				bBindModel&&me.listenTo(oData,"change:"+sExp,function(sName,oModel,sValue){
					var jEl=$(sId);
					if(sAttr=='class'){
						jEl.removeClass(val);
						jEl.addClass(sValue);
						//更新闭包的值
						val=sValue;
					}else{
						var v=sValue||'';
						//设置value如果使用jQuery的attr方法，会调用node.setAttribute("value",v)方法，导致defaultValue也改变
						if(sAttr==='value'){
							//避免输入时经过模型事件设置值
							if(v!==jEl.val()){
								jEl.val(v);
							}
						}else{
							jEl.attr(sAttr,v);
						}
					}
				});
				if(sAttr=='value'&&bBindEl){
					me.listen({
						name:'input propertychange',
						el:sId,
						handler:function(evt){
							oData.set(sExp,evt.target.value);
						}
					});
				}
			}
			return val;
		}
	}
	/**
	 * input框辅助函数，用于生产input
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 */
	function fInput(sExp,oOptions){
		oOptions.type='input';
		var sHtml=fBindAttr(sExp,oOptions);
		return '<input '+sHtml+'/>';
	}
	/**
	 * textarea框辅助函数，用于生产textarea
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 */
	function fTextarea(sExp,oOptions){
		oOptions.type='textarea';
		var sHtml=fBindAttr(sExp,oOptions);
		return '<textarea '+sHtml+'>'+oOptions.value+'</textarea>';
	}
	
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		me._bindModelNums={};
		me._bindElNums={};
		me.callSuper();
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var cModel=me.modelClass||Model;
		if(!me.model){
			me.model=new cModel(me.data);
		}
		me.xmodel=me.model;
	}
	
	var _oTagReg=/[^<]*(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/class=['"]?([#\w][\s\w\.\?:#-]*)(['"]?)(?!\w*=)/;
	var _oHasBindAttrReg=/^[^>]+{{bindAttr/;
	var _oBindClass=/^[^>]+{{bindAttr((?!}}).)class=/;
	var _oBindAttrReg=/({{bindAttr)/;
	/**
	 * 预处理模板
	 */
	function fPreTmpl(){
		var me=this;
		var tmpl=me.tmpl;
		if($H.isArr(tmpl)){
			tmpl=tmpl.join('');
		}
		//添加视图固定的绑定属性
		var bHasCls=_oHasClsReg.test(tmpl);
		var sExtCls='#js-'+me.manager.type+" "+'#js-'+me.xtype;
		//检出模板现有的class
		if(bHasCls){
			var cls=tmpl.match(_oClsReg)[1];
			//class不在bind属性里，需要添加常量标志#
			if(cls){
				if(!_oBindClass.test(tmpl)){
					cls=cls.replace(/([^\s]+)/g,'#$1');
				}
				sExtCls+=' '+cls;
			}
			tmpl=tmpl.replace(_oClsReg,'');
		}
		//添加id
		var sBindAttr=' id=this._id'+' class="'+sExtCls+'"';
		if(_oHasBindAttrReg.test(tmpl)){
			tmpl=tmpl.replace(_oBindAttrReg,'$1'+sBindAttr);
		}else{
			tmpl=tmpl.replace(_oTagReg,'$1 {{bindAttr'+sBindAttr+'}}');
		}
		me.tmpl=tmpl;
	}
	/**
	 * 获取模板函数
	 * @return {function} 返回编译后的模板函数
	 */
	function fGetTmplFn(){
		var me=this;
		//编译模板，固定模板的类只需执行一次
		var tmpl=me.tmpl,oConstructor=me.constructor;
		if(!$H.isFunc(tmpl)&&!$H.isFunc(tmpl=oConstructor.tmpl)){
			me.preTmpl();
			tmpl=oConstructor.tmpl=$H.tmpl({
				tmpl:me.tmpl,
				ns:'ModelView'
			});
		}
		return me.tmpl=tmpl;
	}
	/**
	 * 初始化html
	 * @return {string} 返回html
	 */
	function fGetHtml(){
		var me=this;
		if(me.html){
			return me.html;
		}
		var fTmpl=me.getTmplFn();
		//由模板生成html
		var sHtml=me.html=fTmpl(me.xmodel,me);
		return sHtml;
	}
	/**
	 * 查询指定逻辑单元是否需要绑定模型对象或节点，检查后设为已绑定，确保每个逻辑单元只绑定一次事件
	 * @param {string}nNum 查询的逻辑单元编号
	 * @param {object}oData 数据对象，只有此参数是可观察对象(集合或者模型)时才执行绑定
	 * @param {boolean=}bIsEl 仅当为true时表示查询节点
	 * @return true表示需要绑定
	 */
	function fIfBind(nNum,oData,bIsEl){
		var me=this;
		if((!bIsEl&&me.bindType=='el')||(bIsEl&&me.bindType=='model')){
			return false;
		}
		var oNums=bIsEl?me._bindElNums:me._bindModelNums;
		var bIfBind=!oNums[nNum]&&((oData&&(oData instanceof Model||oData instanceof Collection))||!oData);
		oNums[nNum]=1;
		return bIfBind;
	}
	/**
	 * 根据id获取元标签
	 * @param {number}nId 逻辑节点id
	 * @param {boolean=}bIsEnd 仅当true时表示获取结束元素
	 * @return {jquery} 返回对应jQuery元素
	 */
	function fGetMetaMorph(nId,bIsEnd){
		return $('#metamorph-'+nId+(bIsEnd?'-end':'-start'));
	}
	/**
	 * 更新内容
	 * @param {number}nId 逻辑节点id
	 * @param {string=}sHtml 替换逻辑节点内容的html，不传表示清空内容
	 * @param {boolean=}bRemove 仅当true时移除首尾逻辑节点
	 * @param {string=}sType 默认是更新内容，'append'表示追加内容，'remove'表示移除内容(包括元标签)
	 */
	function fUpdateMetaMorph(nId,sHtml,sType){
		var me=this;
		if(sType=='append'){
			me.getMetaMorph(nId,true).before(sHtml);
			return;
		}
		var jStart=me.getMetaMorph(nId);
		//找不到开始节点，是外部逻辑块已移除，直接忽略即可
		if(jStart.length==0){
			return;
		}
		var sEndId='metamorph-'+nId+'-end';
		var eNext=jStart[0].nextSibling,jTmp;
		while(eNext){
			if(eNext.id==sEndId){
				break;
			}else{
				jTmp=$(eNext);
				eNext=eNext.nextSibling;
				//移除节点必须使用jQuery的remove接口，才能通知组件或视图执行销毁
				jTmp.remove();
			}
		}
		sHtml!==undefined&&jStart.after(sHtml);
		if(sType=='remove'){
			jStart.remove();
			$(eNext).remove();
		}
	}
	/**
	 * 包装结果html
	 * @param {number}nId 逻辑节点id
	 * @param {string}sHtml 参数html
	 * @return {string} 返回包装好的html
	 */
	function fWrapMetaMorph(nId,sHtml){
		var sStart='<script id="metamorph-';
		var sEnd='" type="text/x-placeholder"></script>';
		sHtml=sHtml===undefined?'':sHtml;
		return sStart+nId+'-start'+sEnd+sHtml+sStart+nId+'-end'+sEnd;
	}
	/**
	 * 读取配置属性
	 * @param {string}sKey 属性名称
	 * @return {?} 返回属性值
	 */
	function fGet(sKey){
		return this.xmodel.get(sKey);
	}
	/**
	 * 设置配置属性
	 * @param {string}sKey 属性名称
	 * @param {*}value 属性值
	 */
	function fSet(sKey,value){
		this.xmodel.set(sKey,value);
	}
	/**
	 * 更新数据
	 */
	function fUpdate(oSettings){
		this.xmodel.set(oSettings);
	}
	/**
	 * 获取配置对象
	 */
	function fGetXmodel(){
		return this.xmodel;
	}
	
	return ModelView;
});
/**
 * 视图类
 * PS：注意，扩展视图类方法必须用本类的extend方法，扩展类的静态方法则可以使用$H.Object.extend方法，例如
 * var ExampleCmp=AbstractComponent.define('ExampleCmp');
 * ExampleCmp.extend({
 * 	   test:''
 * });
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-17
 */
//"handy.view.View"
$Define('V.View',
['V.ViewManager',
'V.ModelView',
'D.Model',
'B.Template'],
function(ViewManager,ModelView,Model,Template){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/(class=")/;
	
	//自定义事件
	var View=ModelView.derive({
		
		xtype               : 'View',            //类型
		
		//配置
//		cClass              : '',                //客户定义class，无特殊限制，方便查找，类似于css的class
//		renderTo            : null,              //渲染节点或选择器，可以是函数，调用上下文为本视图对象，如果选择器字符以">"开头，表示在父视图内查找节点
//		defItem             : null,              //默认子视图配置
//		hidden              : false,             //是否隐藏
//		delayShow           : false,             //是否延迟显示，主要用于弹出层
//		hideMode            : 'display',         //隐藏方式,'display'|'visibility'
//		disabled            : false,             //是否禁用
//		extCls              : '',                //附加class
//		wrapHtml            : ['<div>','</div>'],//外面包裹的html
//		notListen           : false,             //不自动初始化监听器
//		items               : [],                //子视图配置，初始参数可以是对象也可以是对象数组
////	lazy                : false,             //保留属性：懒加载，初始化时只设置占位标签，只在调用show方法时进行实际初始化
		xConfig             : {},                //视图模型xmodel的字段配置
		
//		width               : null,              //宽度(默认单位是px)
//		height              : null,              //高度(默认单位是px)
//		style               : {},                //其它样式，如:{top:10,left:10}
		
		//属性
//		configed            : false,             //是否已经调用了doConfig
//		startParseItems     : false,             //是否已开始初始化子视图
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
		tmpl                : '<div>{{placeItem}}</div>',    //模板，字符串或数组字符串，ps:模板容器节点上不能带有id属性
//      showed              : false,             //是否已显示
		bindRefType         : 'bindRef',         //绑定引用模型的方式：both(双向绑定)、bindRef{绑定引用模型}、bindXmodel(绑定xmodel)、null或空(不绑定)
//		refModelAttrs       : {},                //引用模型属性列表
//		children            : [],                //子视图列表
		fastUpdateMethod    : {                  //快捷更新接口
			renderTo        : function(value){
				this.getEl()[this.renderBy]($(value));
			},
			hidden          : function(value){
				value?this.hide():this.show();
			},
			disabled        : function(value){
				value?this.disable():this.enable();
			}
		},
		//TODO 首字母大写以便区分事件监听还是函数？
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','render','afterRender',
			'beforeShow','show','afterShow',
			'beforeHide','hide','afterHide',
			'beforeUpdate','update','afterUpdate',
			'beforeDestroy','destroy','afterDestroy',
			'add','remove',
			'Select','Unselect'
////		'layout'    //保留事件
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'mousedown','mouseup','mouseover','mousemove','mouseenter','mouseleave',
			'dragstart','drag','dragenter','dragleave','dragover','drop','dragend',
			'touchstart','touchmove','touchend','touchcancel',
			'keydown','keyup','keypress',
			'click','dblclick',
			'focus','focusin','focusout',
			'contextmenu','change','submit'
		],
		
		_applyArray         : _fApplyArray,      //在数组上依次执行方法
		
		//初始化相关
		initialize          : fInitialize,       //初始化
////	lazyInit            : fLazyInit,         //保留方法：懒加载，初始化时只设置占位标签，以后再进行真正的初始化
		doConfig            : fDoConfig,         //初始化配置
		getHtml             : fGetHtml,          //获取html
		findHtml            : fFindHtml,         //获取子视图html
		initStyle           : fInitStyle,        //初始化样式
//   	layout              : fLayout,           //布局
		
		beforeRender        : fBeforeRender,     //渲染前工作
		render              : fRender,           //渲染
		afterRender         : fAfterRender,      //渲染后续工作
		beforeShow          : fBeforeShow,       //显示前工作
		show                : fShow,             //显示
		afterShow           : fAfterShow,        //显示后工作
		beforeHide          : fBeforeHide,       //隐藏前工作
		hide                : fHide,             //隐藏
		afterHide           : fAfterHide,        //隐藏后工作
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		getContent          : fGetContent,       //获取内容
		setContent          : fSetContent,       //设置内容
		
		//事件相关
		suspend             : fSuspend,          //挂起事件
		resume              : fResume,           //恢复事件
		
		parentsEl           : fParentsEl,        //查找视图的祖先节点
		
		//视图管理相关
    	get                 : fGet,              //获取配置属性
    	set                 : fSet,              //设置配置属性
    	getRefModel         : fGetRefModel,      //获取引用模型
    	bindRefModel        : fBindRefModel,     //绑定引用模型
		each                : fEach,             //遍历子视图
		match               : fMatch,            //匹配选择器
		find                : fFind,             //查找视图
		parents             : fParents,          //查找祖先视图
		index               : fIndex,            //获取本身的索引，如果没有父视图则返回null
		callChild           : fCallChild,        //调用子视图方法
		add                 : fAdd,              //添加子视图
		remove              : fRemove,           //删除子视图
		parseItem           : $H.noop,           //分析子视图，由具体视图类实现
		parseItems          : fParseItems,       //分析子视图列表
		
		//更新、销毁
		beforeUpdate        : fBeforeUpdate,     //更新前工作
		fastUpdate          : fFastUpdate,       //快速更新
		update              : fUpdate,           //更新
		replace             : fReplace,          //替换视图
		afterUpdate         : fAfterUpdate,      //更新后工作
		beforeDestroy       : fBeforeDestroy,    //销毁前工作
		destroy             : fDestroy,          //销毁
		afterDestroy        : fAfterDestroy      //销毁后工作
	},{
		extend              : fExtend,           //扩展原型定义
		html                : fHtml              //静态初始化视图并生成html
	});
	
	//注册自定义辅助函数
	Template.registerHelper('ModelView',{
		placeItem : fPlaceItem
	});
	/**
	 * 输出子视图
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @param {object}oData 数据
	 * @return {string} 返回生成的html
	 */
	function fPlaceItem(sExp,oOptions){
		var me=oOptions.context,
		nNum=oOptions.num,
		sMetaId=me.getCid()+'-'+nNum;
		var sHtml=me.findHtml(sExp);
		if(me.ifBind(nNum)){
			me.on('add',function(sEvt,oItem,nIndex){
				if(oItem.match(sExp.replace(/^>\s?/,''))){
					if(nIndex!==undefined){
						var oEl=me.getMetaMorph(sMetaId);
						for(var i=0;i<nIndex;i++){
							oEl=oEl.next();
						}
						oEl.after(oItem.getHtml());
					}else{
						me.updateMetaMorph(sMetaId,oItem.getHtml(),'append');
					}
					oItem.afterRender();
				}
			});
		}
		return me.wrapMetaMorph(sMetaId,sHtml)
	}
	
	/**
	 * 扩展原型定义
	 * @method extend
	 * @param {Object}oExtend 扩展源
	 */
	function fExtend(oExtend){
		var oProt=this.prototype;
		$H.extend(oProt, oExtend,{notCover:function(p){
			//继承父类的事件
			if(p=='_customEvents'||p=='listeners'){
				//拼接数组
				oProt[p]=(oExtend[p]||[]).concat(oProt[p]||[]);
				return true;
			}else if(p=='xtype'||p=='constructor'){
				return true;
			}else if(p=='xConfig'||p=='fastUpdateMethod'){
				//继承父类配置
				oProt[p]=$H.extendIf(oExtend[p],oProt[p]);
				return true;
			}
		}});
	}
	/**
	 * 静态初始化视图并生成html
	 * @method html
	 * @param {object}oParams 初始化参数
	 */
	function fHtml(oParams){
		var oView=new this($H.extend({autoRender:false},oParams));
		return oView.getHtml();
	}
	/**
	 * 在数组上依次执行方法
	 * @method _applyArray([sMethod,aParams,param...]) 不传参数的话，默认是调用者的方法名和参数
	 * @param {string=}sMethod 执行的方法名
	 * @param {Array|*=}aParams 参数对象，如果是数组，则在其元素上分别执行执行方法，
	 * 							并返回true，如果不是数组，返回false
	 * @return {boolean} true表示已处理
	 */
	function _fApplyArray(sMethod,aParams){
		var me=this;
		var aArgs=arguments;
		var fCaller=aArgs.callee.caller;
		var oOwner=fCaller.$owner.prototype;
		if(aArgs.length==0){
			aArgs=fCaller.arguments;
			aArgs=$H.toArray(aArgs);
			sMethod=fCaller.$name;
			aParams=aArgs.shift();
		}else{
			aArgs=$H.toArray(aArgs,2);
		}
		if($H.isArr(aParams)){
			$H.each(aParams,function(i,oItem){
				oOwner[sMethod].apply(me,[oItem].concat(aArgs));
			});
			return true;
		}
		return false;
	}
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		me.items=[];
		me.children=[];
		me.callSuper();
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		//这里主要是避免双继承下的多次调用
		if(me.configed){
			return;
		}
		me.configed=true;
		//复制保存初始参数
		me.initParam=oSettings;
		if(typeof oSettings=='string'){
			oSettings={text:oSettings};
		}
		var oParams=oSettings||{};
		
		$H.extend(me,oParams,{notCover:function(p,val){
			//检测引用模型属性
			var refAttr;
			if(refAttr=/^{{(((?!}}).)+)}}$/.exec(val)){
				refAttr=refAttr[1];
				(me.refModelAttrs||(me.refModelAttrs={}))[p]=refAttr;
			}
			var value=me[p];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$H.contains(me._customEvents,p);
			var bIsDefEvt=$H.contains(me._defaultEvents,p);
			
			if(bIsDefEvt){
				me.listeners.push({
					name:p,
					handler:oParams[p]
				});
				return true;
			}else if(bIsCustEvt){
				me.on(p,oParams[p]);
				return true;
			}else if(p=='defItem'){
				me[p]=$H.extend(me[p],val);
				return true;
			}else if(p=='listener'){
				me.listeners=me.listeners.concat($H.isArr(val)?val:[val]);
				return true;
			}else if(p=='items'){
				me.add(val);
				return true;
			}else if(p=='extCls'&&me[p]){
				me[p]+=' '+val;
				return true;
			}else if(p=='xtype'){
				if(me[p]=='View'){
					me[p]=typeof val=='string'?val:val.$ns;
				}
				return true;
			}
		}});
		var renderTo;
		if(renderTo=oParams.renderTo){
			if($H.isFunc(renderTo)){
				renderTo=renderTo.call(me);
			}else if($H.isStr(renderTo)&&renderTo.indexOf('>')==0){
				var oParent=me.parent;
				renderTo=oParent.inited&&oParent.findEl(renderTo.substring(1));
			}else{
				renderTo=$(renderTo);
			}
			me.renderTo=renderTo;
		}else{
			me.renderTo=$(document.body);
		}
		
		//获取绑定属性
		var oRefModel=me.getRefModel();
		if(oRefModel){
			var aAttrs=me.refModelAttrs;
			for(var attr in aAttrs){
				var refAttr=aAttrs[attr],val;
				//嵌套属性
				if(refAttr.indexOf('.')>0){
					var attrs=refAttr.split('.');
					val=oRefModel.get(attrs[0]);
					val=val&&val.get(attrs[1]);
				}else{
					val=oRefModel.get(refAttr);
				}
				me[attr]=val;
			}
		}
		
		//生成modelclass
		var oFields=me.xConfig,cModel=me.modelClass;
		if(!cModel&&!(cModel=me.constructor.modelClass)){
			var clazz
			if(oFields){
				clazz=Model.derive({
					fields:oFields
				})
			}else{
				clazz=Model;
			}
			cModel=me.constructor.modelClass=clazz;
		}
		//初始化xmodel
		var oAttrs={};
		$H.each(oFields,function(k,v){
			var value=me[k];
			if(value!==undefined){
				oAttrs[k]=value;
			}
		});
		me.xmodel=new cModel(oAttrs);
		//绑定引用模型
		me.bindRefModel();
	}
	
	var _oTagReg=/[^<]*(<[a-zA-Z]+)/;
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		var me=this;
		var sId=me.getId();
		//添加隐藏style，调用show方法时才显示
		var sStyle,sCls=me.extCls||'';
 		if(me.displayMode=='visibility'){
			sStyle='visibility:hidden;';
 		}else{
			sCls+=' hui-hidden';
 		}
 		var sHtml=me.callSuper();
		//添加id和style
 		if(sStyle){
			sHtml=sHtml.replace(_oTagReg,'$1 style="'+sStyle+'"');
 		}
		if(sCls){
			sHtml=sHtml.replace(/(class=['"])/,'$1'+sCls+' ');
		}
		var aWrapHtml;
		if(aWrapHtml=me.wrapHtml){
			sHtml=aWrapHtml[0]+sHtml+aWrapHtml[1];
		}
		return me.html=sHtml;
	}
	/**
	 * 获取子视图html
	 * @method findHtml
	 * @param {string=}sSel 选择器，不传表示返回自身的html
	 * @return {string} 返回对应html
	 */
	function fFindHtml(sSel){
		var me=this;
		var aItems=me.find(sSel);
		var aHtml=[];
		for(var i=0;i<aItems.length;i++){
			aHtml.push(aItems[i].getHtml());
		}
		return aHtml.join('');
	}
	/**
	 * 初始化样式
	 * @method initStyle
	 */
	function fInitStyle(){
		var me=this;
		var oEl=this.getEl();
		//添加style
		var oStyle=me.style||{};
		if(me.width!==undefined){
			oStyle.width=me.width;
		}
		if(me.height!==undefined){
			oStyle.height=me.height;
		}
		oEl.css(oStyle);
	}
	/**
	 * 渲染前工作
	 * @method beforeRender
	 * @return {boolean=} 仅当返回false时阻止渲染
	 */
	function fBeforeRender(){
		return this.trigger('beforeRender');
	}
	/**
	 * 渲染
	 * @method render
	 * @return {boolean=} 仅当没有成功渲染时返回false
	 */
	function fRender(){
		var me=this;
		if(me.beforeRender()==false){
			return false;
		}
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
		me.afterRender();
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 * @param {boolean=}bParentCall 是否是来自callChild的调用
	 * @return {boolean=} 仅当已经完成过渲染时返回false
	 */
	function fAfterRender(bParentCall){
		var me=this;
		if(me.rendered){
			return false;
		}
		me.trigger('render');
		//缓存容器
		me._container=$("#"+me.getId());
		me.callChild([true]);
		me.rendered=true;
		//初始化样式
		me.initStyle();
		//初始化事件
		if(me.notListen!=true){
			me.initListeners();
		}
		if(me.disabled){
			me.disable();
		}
		me.trigger('afterRender');
		//显示
		if(!bParentCall&&!me.hidden){
			me.show();
		}
	}
	/**
	 * 显示前工作
	 * @return {boolean=} 仅当返回false时阻止显示
	 */
	function fBeforeShow(){
		return this.trigger('beforeShow');
	}
	/**
	 * 显示
	 * @method show
	 * @param {boolean=}bNotDelay 仅当为true时强制不延迟显示
	 * @param {boolean=}bParentCall true表示是父组件通过callChild调用
	 * @return {boolean=} 仅当不是正常成功显示时返回false
	 */
	function fShow(bNotDelay,bParentCall){
		var me=this;
		if(me.beforeShow()==false
			//已经显示，直接退回
			||me.showed
			//设置了hidden=true的组件不随父组件显示而显示
			||(bParentCall&&me.hidden)){
			return false;
		}
		
		if(!bNotDelay&&me.delayShow){
			setTimeout(function(){
				//这里必须指定基类的方法，不然会调用到组件自定义的show方法
				View.prototype.show.call(me,true);
			},0);
			return;
		}
		me.trigger('show');
		me.showed=true;
		me.hidden=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"visible"})
		}else{
			//测试组件数目：77，使用show和hide时，组件初始化时间是500ms左右，而使用添加\移除’hui-hidden’的方式时间是170ms左右
			oEl.removeClass('hui-hidden');
		}
		me.callChild([null,true]);
		me.afterShow();
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		var me=this;
		//等浏览器渲染后才触发事件
		setTimeout(function(){
			me.trigger('afterShow');
		},0);
	}
	/**
	 * 隐藏前工作
	 * @return {boolean} 仅当返回false时阻止隐藏
	 */
	function fBeforeHide(){
		return this.trigger('beforeHide');
	}
	/**
	 * 隐藏
	 * @method hide
	 * @param {boolean=}bNotSetHidden 仅当true时不设置hidden属性，设置hidden属性可以避免来自父视图的show调用导致显示，所以一般外部调用都默认设置
	 * @return {boolean=} 仅当没有成功隐藏时返回false
	 */
	function fHide(bNotSetHidden){
		var me=this;
		if(me.beforeHide()==false
			//已经隐藏，直接退回
			||!me.showed){
			return false;
		}
		me.showed=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"hidden"})
		}else{
			oEl.addClass('hui-hidden');;
		}
		if(bNotSetHidden!=true){
			me.hidden=true;
		}
		me.trigger('hide');
		me.callChild([true]);
		me.afterHide();
	}
	/**
	 * 隐藏后工作
	 */
	function fAfterHide(){
		this.trigger('afterHide');
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resume();
		me.getEl().removeClass("hui-disable").find('input,textarea,select').removeAttr('disabled');
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspend();
		me.getEl().addClass("hui-disable").find('input,textarea,select').attr('disabled','disabled');
	}
	/**
	 * 读取内容
	 * @param {boolean=}bHtml 仅当false表示获取子组件列表，其它表示获取html内容
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @return {string|Array.<Component>} 返回内容
	 */
	function fGetContent(bHtml,obj){
		var me=this;
		if(obj){
			if(!obj instanceof View){
				obj=me.find(obj)[0];
			}
		}else{
			obj=me;
		}
		if(bHtml==false){
			var aChildren=obj.children;
			return aChildren;
		}else{
			return obj.getEl().html();
		}
	}
	/**
	 * 设置内容
	 * @param {string|Component|Array.<Component>}content 内容，html字符串或组件或组件数组
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @retun {View} 如果只添加一个组件(或配置)，则返回该组件
	 */
	function fSetContent(content,obj){
		var me=this;
		if(obj){
			if(!obj instanceof View){
				obj=me.find(obj)[0];
			}
			return obj.setContent(content);
		}
		if(typeof content=='string'){
			me.set('content',content);
			//移除子组件
			me.remove();
		}else{
			//移除html内容
			me.set('content','');
			return me.add(content);
		}
	}
	/**
	 * 挂起事件
	 * @method suspend
	 */
	function fSuspend(){
		var me=this;
		//已经挂起，直接退回
		if(me.isSuspend){
			return false;
		}
		me.isSuspend=true;
		me.callChild();
	}
	/**
	 * 恢复事件
	 * @method resume
	 */
	function fResume(){
		var me=this;
		//已经恢复，直接退回
		if(!me.isSuspend){
			return false;
		}
		me.isSuspend=false;
		me.callChild();
	}
	/**
	 * 查找视图的祖先节点
	 * @param {string}sSel jQuery选择器
	 * @return {jQuery} 返回结果
	 */
	function fParentsEl(sSel){
		return this.getEl().parents(sSel);
	}
	/**
	 * 读取配置属性
	 * @param {string}sKey 属性名称
	 * @return {?} 返回属性值
	 */
	function fGet(sKey){
		var me=this;
		var oConfig=me.xConfig;
		var value;
		var oModel=me.xmodel;
		if(oModel&&oConfig[sKey]!==undefined){
			value=oModel.get(sKey);
		}else{
			value=me[sKey];
		}
		return value;
	}
	/**
	 * 设置配置属性
	 * @param {string}sKey 属性名称
	 * @param {*}value 属性值
	 */
	function fSet(sKey,value){
		var me=this;
		var o={};
		o[sKey]=value;
		//fastUpdate不成功则直接设置类属性
		if(!me.fastUpdate(o)){
			me[sKey]=value;
		}
	}
	/**
	 * 获取引用模型，优先获取当前视图的引用模型，如果当前视图的引用模型没有设置，
	 * 则寻找父视图的引用模型，直到找到最近的引用模型为止，返回找到的引用模型，
	 * 如果直到最顶级的视图都没有引用模型，则返回顶级视图的模型(.model)
	 * @return {Model} 返回引用模型
	 */
	function fGetRefModel(){
		var me=this,oModel;
		if(oModel=me.refModel||me.model){
			return oModel;
		}
		var oParent=me.parent;
		while(oParent){
			if(oModel=oParent.refModel||oParent.model){
				return me.refModel=oModel;
			}
			if(oParent.parent){
				oParent=oParent.parent;
			}else{
				return oParent.model;
			}
		}
	}
	/**
	 * 绑定引用模型
	 */
	function fBindRefModel(){
		var me=this;
		var sType=me.bindRefType;
		var oAttrs=me.refModelAttrs;
		if(!sType||!oAttrs){
			return;
		}
		var oRefModel=me.getRefModel();
		var oXmodel=me.xmodel;
		function _fBind(sAttr,sRefAttr){
			//嵌套属性
			var sNestedAttr;
			if(sRefAttr.indexOf('.')>0){
				var attrs=sRefAttr.split('.');
				sRefAttr=attrs[0];
				sNestedAttr=attrs[1];
			}
			//绑定引用模型
			if(sType=='both'||sType=='bindRef'){
				me.listenTo(oRefModel,'change:'+sRefAttr,function(sEvt,oModel,value){
					if(sNestedAttr){
						value=value&&value.get(sNestedAttr);
					}
					me.set(sAttr,value);
				});
			}
			//绑定xmodel
			if(sType=='both'||sType=='bindXmodel'){
				me.listenTo(oXmodel,'change:'+sAttr,function(sEvt,oModel,value){
					if(sNestedAttr){
						var m=oRefModel;
						m=m.get(sRefAttr);
						m&&m.set(sNestedAttr,value);
					}else{
						oRefModel.set(sRefAttr,value);
					}
				});
			}
		}
		for(var sAttr in oAttrs){
			_fBind(sAttr,oAttrs[sAttr]);
		}
	}
	/**
	 * 遍历子视图
	 * @method each
     * @param {function}fCallback 回调函数:fCallback(i,oChild)|fCallback(args)this=oChild,返回false时退出遍历
     * @param {Array=}aArgs  回调函数的参数
	 */
	function fEach(fCallback, aArgs){
		var me=this;
		var aChildren=this.children;
		var nLen=aChildren.length;
		var bResult;
		for(var i=0;i<nLen;){
			var oChild=aChildren[i];
			if(aArgs){
				bResult=fCallback.apply(oChild,aArgs);
			}else{
				bResult=fCallback(i,oChild);
			}
			if(bResult===false){
				break;
			}
			//这里注意aChildren可能由于调用destroy而减少
			if(nLen==aChildren.length){
				i++;
			}else{
				nLen=aChildren.length;
			}
		}
	}
	/**
	 * 匹配选择器
	 * @method match
	 * @param {string}sSel 选择器，只支持一级选择器 xtype[attr=value]
	 * @param {Object=}oObj 被匹配的对象，默认为视图对象本身
	 * @return {boolean} 匹配则返回true
	 */
	function fMatch(sSel,oObj){
		if(sSel=="*"){
			return true;
		}
		oObj=oObj||this;
		var m,prop,op,value,viewVal;
		//#btn => [cid=tbn]
		sSel=sSel.replace(/^#([^\s,\[]+)/,'[cid=$1]');
		//.btn => [cClass=tbn]
		sSel=sSel.replace(/^\.([^\s,\[]+)/,'[cClass=$1]');
		//'Button[attr=value]'=>'[xtype=Button][attr=value]'
		sSel=sSel.replace(/^([^\[]+)/,'[xtype=$1]');
		//循环检查
		var r=/\[(\!?[^=|\!]+)(=|\!=)?([^=]*)?\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			viewVal=oObj.get?oObj.get(prop):oObj[prop];
			//操作符：=|!=
			op=m[2];
			//三目运算
			if(op){
				value=m[3];
				if(value==='false'){
					value=false;
				}else if(value==='true'){
					value=true;
				}else if(value==='null'){
					value=null;
				}else if(value==='undefined'){
					value=undefined;
				}
				if(op==="="?viewVal!=value:viewVal==value){
					return false;
				}
			}else{
				//简略表达式，如：!val、val
				if((prop.indexOf('!')==0&&viewVal)||(prop.indexOf('!')<0&&!viewVal)){
					return false;
				}
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子视图
	 * @method find
	 * @param {number|string=|Function(View)|Class}sel 不传表示获取子视图数组，数字表示子组件索引，
	 * 				如果是字符串：多个选择器间用","隔开('sel1,sel2,...')，语法类似jQuery，
	 * 				如：'xtype[attr=value]'、'ancestor descendant'、'parent > child'，
	 * 				'#'表示cid，如'#btn'，表示cid为btn的视图，
	 * 				'.'表示cClass，如'.btn'，表示cClass为btn的视图，
	 * 				'> Button'表示仅查找当前子节点中的按钮，'Button'表示查找所有后代节点中的按钮，
	 * 				如果是函数(参数是当前匹配的视图对象)，则将返回true的结果加入结果集，
	 * 				如果是类，查找该类的实例
	 * @param {Array=}aResult 用于存储结果集的数组
	 * @return {Array} 返回匹配的结果，如果没找到匹配的子视图则返回空数组，ps:只有一个结果也返回数组，便于统一接口
	 */
	function fFind(sel,aResult){
		var me=this,aResult=aResult||[];
		if(!sel){
			aResult=aResult.concat(me.children);
		}else if($H.isNum(sel)){
			var oItem=me.children[sel];
			aResult.push(oItem);
		}else if($H.isStr(sel)){
			//多个选择器
			if(sel.indexOf(",")>0){
				$H.each(sel.split(","),function(i,val){
					aResult=aResult.concat(me.find(val));
				})
				return aResult;
			}
			//查找视图
			var bOnlyChildren=sel.indexOf('>')==0;
			var sCurSel=sel.replace(/^>?\s?/,'');
			//分割当前选择器及后代选择器
			var nIndex=sCurSel.search(/\s/);
			var sCurSel,sExtSel;
			if(nIndex>0){
				sExtSel=sCurSel.substring(nIndex+1);
				sCurSel=sCurSel.substring(0,nIndex);
			}
			//匹配子视图
			me.each(function(i,oChild){
				var bMatch=oChild.match(sCurSel);
				if(bMatch){
					//已匹配所有表达式，加入结果集
					if(!sExtSel){
						aResult.push(oChild);
					}else{
						//还有未匹配的表达式，继续查找
						oChild.find(sExtSel,aResult);
					}
				}
				if(!bOnlyChildren){
					//如果不是仅限当前子节点，继续从后代开始查找
					oChild.find(sel,aResult);
				}
			});
		}else if($H.isFunc(sel)){
			var bIsClass=$H.isClass(sel);
			//匹配子视图
			me.each(function(i,oChild){
				if((bIsClass&&oChild instanceof sel)||(!bIsClass&&sel(oChild))){
					aResult.push(oChild);
				}
				oChild.find(sel,aResult);
			});
		}
		return aResult;
	}
	/**
	 * 查找祖先视图
	 * @method parents
	 * @param {string=}sSel 若此参数为空，直接返回最顶级祖先视图
	 * @return {jQuery|Component|null} 返回匹配的结果，如果没找到匹配的视图则返回null
	 */
	function fParents(sSel){
		var me=this;
		var oCurrent=me;
		while(oCurrent.parent){
			oCurrent=oCurrent.parent;
			if(sSel&&me.match(sSel,oCurrent)){
				return oCurrent;
			}
		}
		return sSel||oCurrent===me?null:oCurrent;
	}
	/**
	 * 获取本身的索引，如果没有父视图则返回null
	 * @method index
	 * @return {number} 返回对应的索引，如果没有父视图(也就没有索引)，返回null
	 */
	function fIndex(){
		var me=this;
		var oParent=me.parent;
		if(!oParent){
			return null;
		}else{
			var nIndex;
			oParent.each(function(i,oItem){
				if(oItem==me){
					nIndex=i;
					return false;
				}
			});
			return nIndex;
		}
	}
	/**
	 * 调用子视图方法
	 * @method callChild
	 * @param {string=}sMethod 方法名，不传则使用调用者同名函数
	 * @param {Array=}aArgs 参数数组
	 */
	function fCallChild(sMethod,aArgs){
		var me=this;
		if(me.children.length==0){
			return;
		}
		//没传方法名
		if(sMethod&&typeof sMethod!='string'){
			aArgs=sMethod;
			sMethod=null;
		}
		sMethod=sMethod||arguments.callee.caller.$name;
		me.each(function(i,oChild){
			if(aArgs){
				oChild[sMethod].apply(oChild,aArgs);
			}else{
				oChild[sMethod].call(oChild);
			}
		});
	}
	/**
	 * 添加子视图
	 * @method add
	 * @param {object|Array}item 视图对象或视图配置或数组，可以加上条件判断:item.condition(为假时忽略该配置项)
	 * @param {number=}nIndex 指定添加的索引，默认添加到最后
	 * @return {?Component} 添加的子视图只有一个时返回该视图对象，参数是数组时返回空
	 */
	function fAdd(item,nIndex){
		var me=this;
		if(me._applyArray()){
			return;
		}
		//条件为假，直接忽略
		if(item.hasOwnProperty('condition')&&!item.condition){
			return;
		}
		var bNoIndex=nIndex===undefined;
		//还没初始化子视图配置，直接添加到配置队列里
		if(!me.startParseItems){
			var aItems=me.items;
			if(bNoIndex){
				aItems.push(item);
			}else{
				aItems.splice(nIndex,0,item);
			}
			return;
		}
		//开始初始化后，如果是配置，先创建子视图
		if(!(item instanceof View)){
			//默认子视图配置
			if(me.defItem){
				$H.extend(item,me.defItem,{notCover:true});
			}
			//具体视图类处理
			me.parseItem(item);
			var Item=me.manager.getClass(item.xtype);
			if(Item){
				var renderTo=item.renderTo;
				//父组件未初始化，不能通过>选择器render
				if(!me.inited&&$H.isStr(renderTo)&&renderTo.indexOf('>')==0){
					renderTo=null;
				}
				if(!renderTo){
					//设置子组件不进行自动render，而是由placeItem辅助函数render或组件本身进行render
					item.autoRender=false;
				}
				item.parent=me;
				item=new Item(item);
			}else{
				$D.error("xtype:"+item.xtype+"未找到");
			}
		}else{
			item.parent=me;
		}
		var aChildren=me.children;
		if(bNoIndex){
			aChildren.push(item);
		}else{
			aChildren.splice(nIndex,0,item);
		}
		me.trigger('add',item,nIndex);
		return item;
	}
	/**
	 * 删除子视图
	 * @method remove
	 * @param {object|number|string}item 视图对象或视图索引或选择器
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(item){
		var me=this;
		if(me._applyArray()){
			return;
		}
		var aChildren=me.children;
		var bResult=false;
		var nIndex;
		if($H.isNum(item)){
			nIndex=item;
			item=aChildren[nIndex];
		}else if($H.isStr(item)||$H.isFunc(item)){
			item=me.find(item);
			for(var i=0,len=item.length;i<len;i++){
				if(me.remove(item[i])==false){
					return false;
				}
				bResult=true;
			}
		}else if(item instanceof View){
			if(item.parent==me){
				for(var i=0,len=aChildren.length;i<len;i++){
					if(aChildren[i]==item){
						nIndex=i;
						break;
					}
				}
			}else{
				return item.parent.remove(item);
			}
		}
		if(nIndex!==undefined&&item.destroy(true)!=false){
			aChildren.splice(nIndex,1);
			bResult=true;
		}
		me.trigger('remove',item);
		return bResult;
	}
	/**
	 * 分析子视图列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		me.startParseItems=true;
		var aItems=me.items;
		if(!aItems){
			return;
		}
		aItems=$H.isArr(aItems)?aItems:[aItems];
		//逐个初始化子视图
		for(var i=0,len=aItems.length;i<len;i++){
			me.add(aItems[i]);
		}
	}
	/**
	 * 更新前工作
	 * @return {boolean=} 仅当返回false时阻止更新
	 */
	function fBeforeUpdate(){
		return this.trigger('beforeUpdate');
	}
	/**
	 * 快速更新
	 * @param {Object}oOptions 配置
	 * @return {boolean} true表示快速更新成功
	 */
	function fFastUpdate(oOptions){
		var me=this;
		var oXmodel=me.xmodel;
		if(!oXmodel){
			return false;
		}
		var oConfigs=me.xConfig;
		var oFastUpdate=me.fastUpdateMethod;
		var bContain=true;
		var oXconf={},oFast={},oOther={};
		//检查选项是否都是xmodel或fastUpdateMethod的字段，如果是，则只需要更新xmodel或调用fastUpdateMethod方法即可，ui自动更新
		$H.each(oOptions,function(p,v){
			//xConfig里没有的配置
			if(oConfigs.hasOwnProperty(p)){
				oXconf[p]=v;
			}else if(oFastUpdate[p]){
				oFast[p]=v;
			}else{
				oOther[p]=v;
				bContain=false;
			}
		})
		if(bContain){
			oXmodel.set(oXconf);
			$H.each(oFast,function(k,v){
				oFastUpdate[k].call(me,v);
			})
			return true;
		}
		return false;
	}
	/**
	 * 更新
	 * @param {Object}oOptions 配置
	 * @param {boolean=}bNewConfig 仅当为true时，表示从初始化的参数的配置里继承，否则，从当前组件初始配置里扩展配置
	 * @return {boolean|Object} 更新失败返回false，成功则返回更新后的视图对象
	 */
	function fUpdate(oOptions,bNewConfig){
		var me=this;
		if(!oOptions||me.beforeUpdate()==false){
			return false;
		}
		var oNew;
		//先尝试快速更新
		if(me.fastUpdate(oOptions)===true){
			oNew=me;
		}else{
			//执行完全更新
			var oParent=me.parent;
			var oPlaceholder=$('<span></span>').insertBefore(me.getEl());
			
			if(!bNewConfig){
				//由于子组件的初始配置都是autoRender=false，这里需要特殊处理下
				if(oOptions.autoRender===undefined){
					oOptions.autoRender=true;
				}
				oOptions=$H.extend(oOptions,me.initParam,{notCover:true});
			}
			//cid不同
			oOptions=$H.extend(oOptions,{
				xtype:me.xtype,
				renderBy:'replaceWith',
				renderTo:oPlaceholder
			},{notCover:['xtype']});
			//不需要改变id/cid
			if(!oOptions.cid||oOptions.cid==me.cid){
				oOptions._id=me._id;
			}
			if(oParent){
				var nIndex=me.index();
				if(oParent.remove(me)==false){
					oPlaceholder.remove();
					return false;
				}
				oNew=oParent.add(oOptions,nIndex);
			}else{
				if(me.destroy()==false){
					oPlaceholder.remove();
					return false;
				}
				oNew=new me.constructor(oOptions);
			}
		}
		me.trigger('update',oNew);
		me.afterUpdate(oNew);
		return oNew;
	}
	/**
	 * 替换视图
	 * @param {Object}oConfig 配置项
	 * @return {boolean|Object} 更新失败返回false，成功则返回更新后的视图对象
	 */
	function fReplace(oConfig){
		return this.update(oConfig,true);
	}
	/**
	 * 更新后工作
	 * @param {Object} 更新后的视图对象
	 */
	function fAfterUpdate(oNew){
		this.trigger('afterUpdate',oNew);
	}
	/**
	 * 销毁前工作
	 * @return {boolean=} 仅当返回false时阻止销毁
	 */
	function fBeforeDestroy(){
		return this.trigger('beforeDestroy');
	}
	/**
	 * 销毁
	 * @method destroy
	 * @param {boolean=} 仅当true时表示从remove里的调用，不需要再这里调用parent.remove
	 * @return {boolean=} 成功返回true，失败返回false，如果之前已经销毁返回空
	 */
	function fDestroy(bFromRemove){
		var me=this;
		if(me.beforeDestroy()==false){
			return false;
		}
		if(me.destroyed){
			return;
		}
		me.callChild();
		
		me.trigger('destroy');
		me.clearListeners();
		me.getEl().remove();
		me.destroyed=true;
		
		if(!bFromRemove&&me.parent){
			me.parent.remove(me);
		}
		//注销组件
		me.manager.unregister(me);
		delete me.initParam;
		delete me._container;
		delete me.renderTo;
		delete me._listeners;
		delete me.html;
		delete me.xmodel;
		delete me.children;
		me.afterDestroy();
		return true;
	}
	/**
	 * 销毁后工作
	 */
	function fAfterDestroy(){
		this.trigger('afterDestroy');
	}
	
	return View;
	
});
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("M.AbstractModule","V.View",function (View) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = View.derive({
		
		xtype          : 'Module',
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		
		//模块管理相关属性
//		_forceExit     : false,          //true表示下一次退出操作不调用exit方法，直接退出
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		notCache       : false,          //{boolean}是否不使用cache，默认使用,仅当配置成true时不使用
//      clearCache     : false,          //仅清除一次当前的缓存，下次进入模块时执行清除并恢复原先缓存设置
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
//		referer        : null,           //记录从哪个模块进入
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		useCache       : $H.noop,        //判断是否使用模块缓存
		cache          : $H.noop,        //显示模块缓存时调用
		init           : $H.noop,        //初始化函数, 在模块创建后调用（在所有模块动作之前）
		entry          : $H.noop,        //进入模块，new和cache后都会调用此方法
		reset          : $H.noop,        //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},  //离开该模块前调用, 仅当返回false时不允许离开
		initialize     : fInitialize,    //初始化
		cleanCache     : fCleanCache     //清除模块缓存
	});
	/**
	 * 初始化
	 * @param{object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		//初始化模型
		if(!oParams.model&&me.modCls){
			me.model=new me.modCls();
			me.model.id=oParams.modelId;
		}
		me.callSuper();
	}
	/**
	 * 清除模块缓存
	 */
	function fCleanCache(){
		this.clearCache=true;
	}
	
	return AbstractModule;
});
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/
//handy.module.AbstractNavigator
$Define("M.AbstractNavigator",["handy.base.Object",'B.Class'],function (Object) {
	/**
	 * 模块导航效果基类
	 * 
	 * @class AbstractNavigator
	 */
	var AbstractNavigator = $H.createClass();
	
	Object.extend(AbstractNavigator.prototype, {
		navigate      : function(){}      //显示导航效果，参数是当前进入的模块实例和模块管理类实例，此方法返回true表示不需要模块管理类的导航功能
	});
	
	return AbstractNavigator;
});
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
//handy.module.History
$Define("M.History",
['handy.base.HashChange',
'B.Class'],
function(HashChange){

	var History=$H.createClass();
	
	var _nIndex=0;
	
	$H.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
		saveHash           : fSaveHash,        //保存参数到hash
		getHashParam       : fGetHashParam,    //获取当前hash参数
		getCurrentState    : fGetCurrentState, //获取当前状态
		getPreState        : fGetPreState,     //获取前一个状态
		back               : fBack,            //后退一步
		getSafeUrl         : fGetSafeUrl       //获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {string=}sKey 历史记录类的key，用于区分可能的多个history实例
	 * @param {function=}fError 错误处理函数
	 */
	function fInitialize(sKey,fError){
		var me=this;
		if(typeof sKey=="function"){
			fError=sKey;
			sKey=null;
		}
		me.error=fError||$H.noop;
		me.key=sKey||'handy';
		me.states=[];
		HashChange.listen($H.Function.bind(me.stateChange,me));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var me=this,oHashParam=me.getHashParam();
		if(!oHashParam){
			return;
		}
		var sKey=oHashParam.hKey,
		 	sCurKey=me.currentKey,
		 	aStates=me.states,
		 	oCurState=aStates[sCurKey];
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		//&&$H.equals(oHashParam.param,oCurState.param)
		if(sKey==sCurKey){
			return false;
		}
		var oState=aStates[sKey];
		//监听全局hisoryChange，返回false可阻止当前变化
		var bResult=$H.trigger('hisoryChange',oState,oCurState);
		if(bResult!==false){
			if(oState){
				bResult=oState.onStateChange(oState.param,true);
			}else{
				$D.warn("hisory state not found");
				bResult=me.error('stateNotFound',oHashParam);
			}
		}
		//如果调用不成功，则恢复原先的hashstate
		if(bResult===false){
			var oParam=oCurState.param;
			oHashParam=$H.extend({
				hKey    : sCurKey
			},oParam);
			me.saveHash(oHashParam);
		}else{
			//改变当前hkey
			me.currentKey=sKey;
		}
	}
	/**
	 * 保存当前状态
	 * @method saveState
	 * @param {object} oState{
	 * 				{object}param            : 进入模块的参数
	 * 				{function}onStateChange  : 历史状态变化时的回调函数
	 * 	}
	 */
	function fSaveState(oState){
		var me=this;
		var sHistoryKey=me.currentKey=me.key+(++_nIndex);
		me.states.push(sHistoryKey);
		me.states[sHistoryKey]=oState;
		var oParam=oState.param;
		var oHashParam=$H.extend({
			hKey    : sHistoryKey
		},oParam);
		me.saveHash(oHashParam);
	}
	/**
	 * 保存状态值到hash中
	 * @method saveHash
	 * @param {*}param 要保存到hash中的参数
	 */
	function fSaveHash(param){
		//这里主动设置之后还会触发hashchange，不能在hashchange里添加set方法屏蔽此次change，因为可能不止一个地方需要hashchange事件
		//TODO:单页面应用SEO：http://isux.tencent.com/seo-for-single-page-applications.html
		$H.setHashParam(null,param);
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		return $H.getHashParam();
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var me=this;
		//获取url模块参数，hash优先级高于query中retPage
		var oUrlParam=$H.getHashParam();
		if($H.isEmpty(oUrlParam)){
			var sRetPage=$H.getQueryParam(null,'retPage');
			try {
				oUrlParam=$H.parseJson(decodeURIComponent(sRetPage));
			} catch (e) {
				$D.log("parse retPage param from hash error:"
						+ e.message);
			}
		}
		return me.states&&me.states[oUrlParam.hKey]||oUrlParam;
	}
	/**
	 * 获取前一个状态
	 * @method getPreState
	 * @return {object} 返回前一个状态
	 */
	function fGetPreState(){
		var me=this;
		try{
			var oHashParam=me.getHashParam();
			var sHKey=oHashParam.hKey;
			var aStates=me.states;
			var nLen=aStates.length;
			for(var i=1;i<nLen;i++){
				if(aStates[i]==sHKey){
					return i>0?aStates[aStates[--i]]:null;
				}
			}
		}catch(e){
			$H.Debug.error("History.getPreState error:"+e.message,e);
		}
	}
	/**
	 * 后退一步
	 * @method back
	 */
	function fBack(){
		var me=this;
		var oState=me.getPreState();
		if(oState){
			oState.onStateChange(oState.param);
		}
	}
	/**
	 * 获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	 * @return {string} 返回安全的url
	 */
	function fGetSafeUrl(){
		var oHashParam=$H.getHashParam();
		delete oHashParam.hKey;
		var oParam={
			retPage:encodeURIComponent($H.stringify(oHashParam))
		}
		var sUrl=$H.setQueryParam(location.href,oParam);
		return sUrl;
	}
	
	return History;
	
});
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

/**
 * 模块管理类
 * @class ModuleManager
 */
//handy.module.ModuleManager
$Define("M.ModuleManager",
["M.History",
"V.AbstractManager"],
function(History,AbstractManager){
	
	//TODO 使用AbstractManager的方法
	var ModuleManager=AbstractManager.derive({
		
		type               : 'module',
		
//		history            : null,   //历史记录
//		conf               : null,   //配置参数
//		container          : null,   //默认模块容器
//		navigator          : null,   //定制模块导航类
//		defEntry           : null,   //默认模块，当调用back方法而之前又没有历史模块时，进入该模块
//		defModPackage      : "com.xxx.module",  //默认模块所在包名
		maxModNum          : $H.mobile()?($H.android()>=4||$H.ios()>=7)?15:5:30,     //最大缓存模块数
		
//		requestMod         : '',     //正在请求的模块名
//		currentMod         : '',     //当前模块名
//		_modules           : {},     //模块缓存
//		_modStack          : [],     //模块调度记录
//		_modNum            : {},     //模块名数量统计
		
		_getModId          : _fGetModId,        //获取modId
		_createMod         : _fCreateMod,       //新建模块
		_showMod           : _fShowMod,         //显示模块
		
		initialize         : fInitialize,      //初始化模块管理
		setModule          : fSetModule,       //设置/缓存模块
		getModule          : fGetModule,       //获取缓存的模块
		go                 : fGo,              //进入模块
		destroy            : fDestroy,         //销毁模块
		update             : fUpdate,          //更新模块
		clearCache         : fClearCache,      //清除缓存模块
		back               : fBack,            //后退一步
		getSafeUrl         : fGetSafeUrl       //获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	});
	
	/**
	 * 获取modId
	 * @param {string}sModName 模块名
	 * @param {string|number=}sModelId 模型/集合id
	 * @return {string} 返回模块id
	 */
	function _fGetModId(sModName,sModelId){
		return sModName+(sModelId?'-'+sModelId:'');
	}
	/**
	 * 新建模块
	 * @method _createMod
	 * @param {object}oParams 选项
	 * @return {Module}返回新创建的模块
	 */
	function _fCreateMod(oParams){
		var me=this;
		var sModName=oParams.modName;
		var sModId=oParams.modId;
		var Module=$Require(sModName);
		var oOptions={
			renderTo:me.container,
			modName:sModName,
			modId:sModId,
			name:sModName,
			xtype:sModName,
			cid:sModId.replace(/\./g,'-'),
			extCls:'js-module m-module '+sModName.replace(/\./g,'-'),
			hidden:true
		};
		$H.extend(oOptions,oParams);
		var oMod=new Module(oOptions);
		
		//异步模块在此标记referer
		var oWaitting=me._modules[sModId];
		oMod.referer=oWaitting.referer;
		
		me._modules[sModId]=oMod;
		$H.trigger('afterRender',oMod.getEl());
		oMod.entry(oParams);
		//只有当前请求的模块恰好是本模块时才显示（可能加载完时，已切换到其它模块了）
		if(me.requestMod==sModId){
			me._showMod(oMod);
		}
		return oMod;
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param {Module}oMod 要显示的模块
	 */
	function _fShowMod(oMod){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		//如果导航类方法返回false，则不使用模块管理类的导航
		var r=me.navigator&&me.navigator.navigate(oMod,oCurMod,me);
		//TODO:写成这样在iPad mini ios7下无效:if((me.navigator&&me.navigator.navigate(oMod,oCurMod,me))!==false){
		if(r!==false){
			if(oCurMod){
				oCurMod.hide();
			}
			oMod.show();
		}
		if(oCurMod){
			oCurMod.isActive=false;
		}
		oMod.isActive=true;
		me.currentMod=oMod.modId;
	}
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage   : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator    : 定制导航类
	 * 			{string|object}entry    : 初始模块
	 * 			{string|object}defEntry : 默认入口，没有初始入口参数时进入该模块，或者后退但没有上一个模块时进入该模块
	 * }
	 */
	function fInitialize(oConf){
		var me=this;
		me.callSuper();
		if(oConf){
			me.conf=oConf;
			$H.extend(me,oConf);
			me.container=oConf.container?$(oConf.container):$(document.body);
		}
		me.history=new History(function(sCode,oParam){
			me.go(oParam.param);
		});
		me._modules={};
		me._modStack=[];
		me._modNum={};
		
		//解析url参数
		var oUrlParam=me.history.getCurrentState();
		//有返回页
		if(!$H.isEmpty(oUrlParam)){
			var fChk=oConf.chkEntry;
			var bResult=fChk&&fChk(oUrlParam);
			//开发模式下可以进入所有子模块，线上环境只允许进入指定模块
			if(bResult!==false){
				me.go(oUrlParam);
				return;
			}
		}
		var oDefEntry=oConf.entry||oConf.defEntry;
		me.go(oDefEntry);
	}
	/**
	 * 设置/缓存模块，当缓存的模块数量超过限制时，删除历史最久的超过模块各类型平均限制数的模块
	 * @param {new:M.AbstractModule}oModule 模块对象
	 * @param {string}sModName 模块名
	 * @param {string|number=}modelId 模型/集合id
	 */
	function fSetModule(oModule,sModName,modelId){
		var me=this;
		var oMods=me._modules;
		var aStack=me._modStack;
		var oNum=me._modNum;
		var sModId=me._getModId(sModName,modelId);
		oMods[sModId]=oModule;
		aStack.push({
			modId:sModId,
			modName:sModName
		});
		if(!oNum[sModName]){
			oNum[sModName]=1;
		}else{
			oNum[sModName]++;
		}
		if(aStack.length>me.maxModNum){
			var nModTypeNum=$H.count(oNum);
			var nAverage=me.maxModNum/nModTypeNum;
			for(var i=0,len=aStack.length;i<len;i++){
				var oItem=aStack[i];
				if(oNum[oItem.modName]>nAverage){
					me.destroy(oMods[oItem.modId]);
					break;
				}
			}
		}
	}
	/**
	 * 获取缓存的模块
	 * @param {string}sModName 模块名
	 * @param {string|number=}modelId 模型/集合id
	 * @return {?new:M.AbstractModule}返回对应的模块
	 */
	function fGetModule(sModName,modelId){
		var me=this;
		var sModId=me._getModId(sModName,modelId);
		return me._modules[sModId];
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param {Object|string}param  直接模块名字符串或者{  //传入参数
	 * 		modName:模块名称
	 * 		...
	 * }
	 * @param {boolean=}bNotSaveHistory仅当为true时，不保存历史记录
	 * @return {boolean} true表示成功，false表示失败
	 */
	function fGo(param,bNotSaveHistory){
		if(!param){
			return;
		}
		var me=this;
		if(typeof param=="string"){
			param={modName:param};
		}
		var sModName=param.modName;
		//模块模型id
		var sModelId=param.modelId;
		if(param.model){
			sModelId=param.modelId=param.model.id;
		}
		var sModId=me._getModId(sModName,sModelId);
		param.modId=sModId;
		//当前显示的模块名
		var sCurrentMod=me.currentMod;
		var oMods=me._modules;
		var oCurrentMod=oMods[sCurrentMod];
		//如果要进入的正好是当前显示模块，调用模块reset方法
		if(sCurrentMod==sModId){
			if(!oCurrentMod.waiting){
				oCurrentMod.reset();
			}
			return;
		}
		
		//当前显示模块不允许退出，直接返回
		if(oCurrentMod&&!oCurrentMod.waiting){
			if(oCurrentMod._forceExit){
				//标记为强制退出的模块不调用exit方法，直接退出，并将_forceExit重置为false
				oCurrentMod._forceExit=false;
			}else if(oCurrentMod.exit()===false){
				//模块返回false，不允许退出
				return false;
			}
		}
		
		//标记当前请求模块，主要用于异步请求模块回调时判断是否已经进了其它模块
		me.requestMod=sModId;
		
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModId];
		//如果模块有缓存
		if(oMod){
			//还在请求资源，直接返回
			if(oMod.waiting){
				return;
			}
			//这里oCurrentMod可能被用户调用了destroy而销毁
			if(oCurrentMod){
				var bIsBack=oCurrentMod.referer===oMod;
				//回退时不能改变父模块的referer
				if(!bIsBack){
					oMod.referer=oCurrentMod;
				}
			}
			//标记使用缓存，要调用cache方法
			if(oMod.notCache!=true&&oMod.clearCache!=true&&oMod.useCache(param)!=false){
				//恢复设置
				oMod.clearCache==false;
				me._showMod(oMod);
				oMod.cache(param);
				oMod.entry(param);
			}else{
				//标记不使用缓存，销毁模块
				me.destroy(oMod);
				//重新标记当前模块
//				me.currentMod=sModName;
				//重新创建模块
				oMod=me._createMod(param);
				if(!bIsBack){
					oMod.referer=oCurrentMod;
				}
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			//先标记为正在准备中，新建成功后赋值为模块对象
			me.setModule({waiting:true,referer:oCurrentMod},sModName,sModelId);
			$Require(sModName,function(Module){
				var oNewMod=me._createMod(param);
			});
		}
		
		
		//主要是处理前进和后退hash变化引起的调用，不需要再保存历史记录
		if(bNotSaveHistory!=true){
			var o={
				modName:param.modName
			};
			if(sModelId){
				o.modelId=sModelId;
			}
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:o
			});
		}
		return true;
	}
	/**
	 * 销毁模块
	 * @param {Module}oMod 待销毁的模块
	 */
	function fDestroy(oMod){
		var me=this;
		var aStack=me._modStack;
		var sModId=oMod.modId;
		if(me.currentMod===sModId){
			$M.back();
		}
		for(var i=0,len=aStack.length;i<len;i++){
			if(aStack[i].modId===sModId){
				aStack.splice(i,1);
				me._modNum[oMod.modName]--;
				break;
			}
		}
		oMod.destroy();
		delete me._modules[sModId];
	}
	/**
	 * 更新模块
	 * @param {Module}oModule 模块对象
	 * @param {Object}oParams 参数
	 * @return {Module}oNew 返回新的模块对象
	 */
	function fUpdate(oModule,oParams){
		var oNew=oModule.update(oParams);
		if(oNew){
			this._modules[oModule.modId]=oNew;
			$H.trigger('afterRender',oNew.getEl());
		}
		return oNew;
	}
	/**
	 * 清除缓存模块
	 * @param {Module|string}module 参数模块或模块名
	 * @param {number=|string=}modelId 模型id
	 */
	function fClearCache(module,modelId){
		if($H.isStr(module)){
			module=this.getModule(module,modelId);
		}
		if(module){
			module.notCache=true;
		}
	}
	/**
	 * 后退一步
	 * @method back
	 * @param {boolean=} 当传入true时，强制退出当前模块，即不调用模块的exit而直接退出
	 */
	function fBack(bForceExit){
		var me=this;
		var oCurMod=me._modules[me.currentMod];
		if(bForceExit){
			oCurMod._forceExit=true;
		}
		if(me.history.getPreState()){
			history.back();
		}else{
			me.go(me.defEntry);
		}
	}
	/**
	 * 获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	 * @return {string} 返回安全的url
	 */
	function fGetSafeUrl(){
		return this.history.getSafeUrl();
	}
	
	return ModuleManager;
	
});
/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("C.ComponentManager", 
['V.AbstractManager',
'V.ViewManager'],
function(AbstractManager,ViewManager) {

	var ComponentManager = AbstractManager.derive({
		type          : 'component',      //管理类型
		initialize    : fInitialize       //初始化
	});
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		var me=this;
		var oVm=$H.getSingleton(ViewManager);
		me._types=oVm._types;
		me._all=oVm._all;
	}
	
	//全局快捷别名
	$CM=new ComponentManager();
	
	return ComponentManager;
});
/**
 * 组件基类，所有组件必须继承自此类或此类的子类，定义组件必须用AbstractComponent.define方法
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
$Define('C.AbstractComponent',["V.ViewManager",'V.View','C.ComponentManager','B.Class'],function(ViewManager,View){
	
	//访问component包内容的快捷别名
	$C=$H.ns('C');
	
	var AC=View.derive({
		//实例属性、方法
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
//		icon                : null,              //图标
		
		////通用样式
		xConfig             : {
			extCls          : '',                //附加样式名
			tType           : '',                //主题类型
			theme           : '',                //主题
			cls             : '',                //组件css命名前缀
			radius          : null,         	 //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
			shadow          : false,        	 //外阴影
			shadowInset     : false,        	 //内阴影
			shadowSurround  : false,             //外围亮阴影，主要用于黑色工具栏内的按钮
			shadowOverlay   : false,             //遮罩层里组件的阴影效果，主要用于弹出层
			size            : '',       	     //尺寸，normal:正常，mini:小号
			isActive        : false,             //是否激活
			isFocus         : false,        	 //聚焦
			isInline        : false,             //是否内联(宽度自适应)
			activeCls       : 'hui-active',      //激活样式
			cmpCls          : {
				depends : ['cls'],
				parse :function(){
					return 'hui-'+this.get("cls");
				}
			},
			sizeCls          : {
				depends : ['size'],
				parse :function(){
					var size=this.get("size");
					return size&&'hui-size-'+size;
				}
			},
			tTypeCls        : {
				depends : ['tType'],
				parse :function(){
					var tType=this.get("tType");
					return tType?'hui-'+this.get("cls")+'-'+tType:'';
				}
			},
			themeCls        : {
				depends : ['theme'],
				parse :function(){
					var sTheme=this.get("theme");
					return sTheme?'hui-'+this.get("cls")+'-'+this.get("theme"):'';
				}
			},
			activeClass     : {
				depends : ['isActive','activeCls'],
				parse :function(){
					return this.get('isActive')?this.get('activeCls'):'';
				}
			},
			radiusCls       : {
				depends : ['radius'],
				parse :function(){
					var sRadius=this.get('radius');
					return sRadius?'hui-radius-'+sRadius:'';
				}
			}
		},
		
		//属性
//		cls                 : '',                //组件样式名，空则使用xtype的小写，如Dialog，cls为"dialog"，因此样式前缀是“hui-dialog-”
//		xrole               : '',                //保留属性，用于模板中筛选组件的选择器，如this.findHtml(">[xrole='content']")
		
		//组件初始化相关
		hasConfig           : fHasConfig,        //检查是否已存在指定配置
		doConfig            : fDoConfig,         //初始化配置
		preTmpl             : fPreTmpl,          //预处理模板
		//组件公用功能
		active              : fActive,           //激活
		unactive            : fUnactive,         //不激活
		txt                 : fTxt,              //设置/读取文字
		valid               : fValid             //校验数据
	},{
		//静态方法
		define              : fDefine            //定义组件
	});
	
	/**
	 * 定义组件
	 * @method define
	 * @param {string}sXtype 组件类型
	 * @param {Component=}oSuperCls 父类，默认是AbstractComponent
	 * @return {class}组件类对象
	 */
	function fDefine(sXtype,oSuperCls){
		var Component=$H.createClass();
		var oSuper=oSuperCls||AC;
		$H.inherit(Component,oSuper,null,null,{notCover:function(p){
			return p == 'define';
		}});
		$H.getSingleton(ViewManager).registerType(sXtype,Component);
		//快捷别名
		$C[sXtype]=Component;
		return Component;
	}
	/**
	 * 检查是否已存在指定配置
	 * @method hasConfig
	 * @param {string}sSel 指定的配置
	 * @param {Object|Array}params 配置对象
	 * @return {boolean} true表示已存在配置
	 */
	function fHasConfig(sSel,params){
		var me=this;
		if(!params){
			return false;
		}
		if($H.isArr(params)){
			for(var i=0,len=params.length;i<len;i++){
				if(me.match(sSel,params[i])){
					return true;
				}
			}
		}else{
			if(me.match(sSel,params)){
				return true;
			}
		}
		return false;
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		me.callSuper();
		
		//图标组件快捷添加
		var icon;
		if(icon=me.icon){
			if(typeof icon==='string'){
				me.add({
					xtype:'Icon',
					name:icon
				})
			}else{
				icon.xtype='Icon';
				me.add(icon);
			}
		}
	}
	/**
	 * 预处理模板，添加组件样式
	 */
	function fPreTmpl(){
		var me=this;
		me.callSuper();
		me.tmpl=me.tmpl.replace(/(class=['"])/,'$1#js-component cmpCls tTypeCls themeCls radiusCls sizeCls shadow?hui-shadow shadowSurround?hui-shadow-surround '+
		'shadowOverlay?hui-shadow-overlay shadowInset?hui-shadow-inset activeClass isFocus?hui-focus isInline?hui-inline ');
	}
	/**
	 * 激活
	 * @method active
	 */
	function fActive(){
		this.update({isActive:true});
	}
	/**
	 * 不激活
	 * @method unactive
	 */
	function fUnactive(){
		this.update({isActive:false});
	}
	/**
	 * 设置/读取文字
	 * @method txt
	 * @param {string=}sTxt
	 * @return {string} 
	 */
	function fTxt(sTxt){
		var me=this;
		if(sTxt!==undefined){
			return me.set('text',sTxt);
		}else{
			return me.get('text');
		}
	}
	/**
	 * 校验数据
	 * @method valid
	 * @return 符合校验规则返回true，否则返回false
	 */
	function fValid(){
		var me=this;
		var oValidator=me.validator;
		if(oValidator){
			var sValue=me.val();
			if(!oValidator.error){
				//默认提示方法
				oValidator.error=function(sMsg){
					new $C.Tips({
						text:sMsg,
						theme:'error'
					});
				}
			}
			var result=$H.Validator.valid(sValue,oValidator);
			return result;
		}else{
			var aChildren=me.children;
			for(var i=0,nLen=aChildren.length;i<nLen;i++){
				var result=aChildren[i].valid();
				if(!result){
					return result;
				}
			}
			return true;
		}
	}
		
	return AC;
	
});
/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('C.Icon',
'C.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	
	Icon.extend({
		//初始配置
		xConfig         : {
			cls         : 'icon',
			theme       : 'bg-gray',             //颜色
			isAlt       : false,              //是否使用深色图标
			radius      : 'big',
			name        : '',                 //图标名称
			iconName    : {
				depends : ['name'],
				parse :function(){
					return 'hui-icon-'+this.get('name');
				}
			}
		},
		
		bgColor         : '',                 //指定具体的背景颜色值
		
		tmpl            : 
			'<span {{bindAttr class="isAlt?hui-alt-icon iconName"}}></span>',
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		if($H.isStr(oSettings)){
			oSettings={name:oSettings};
		}
		if(oSettings.bgColor){
			oSettings.style=$H.extend(oSettings.style,{backgroundColor:oSettings.bgColor})
		}
		me.callSuper([oSettings]);
	}
	
	return Icon;
	
});
/**
 * 链接类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-08-07
 */

$Define('C.Link',
'C.AbstractComponent',
function(AC){
	
	var Link=AC.define('Link');
	
	Link.extend({
		//初始配置
		xConfig         : {
			cls         : 'link',
			text        : ''               
		},
		
		tmpl            : 
			'<a hidefocus="true" href="javascript:;">{{text}}</a>'
		
	});
	
	return Link;
	
});
/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('C.Button',
'C.AbstractComponent',
function(AC){
	
	var Button=AC.define('Button');
	
	Button.extend({
		//初始配置
		xConfig             : {
			cls             : 'btn',
			text            : '',                  //按钮文字
			extTxt          : '',                  //附加文字
			theme           : 'gray',              //主题
//			tType           : 'adapt',             //自适应按钮，一般用于工具栏
			markType        : '',                  //标记类型，默认无标记，'black'黑色圆点标记，'red'红色圆点标记
			iconPos         : '',                  //图标位置，"left"|"right"|"top"|"bottom"，空字符表示无图标
			activeCls       : 'hui-btn-active',    //激活样式
			isBack          : false,               //是否是后退按钮
			radius          : 'little',            //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
			gradient        : false,               //渐变效果
			isInline        : true,                //宽度自适应
			noTxtCls        : {
				depends : ['text','tType'],
				parse : function(){
					var sTxt=this.get('text');
					if(!(this.get('tType')=='adapt'||sTxt||sTxt===0)){
						return 'hui-btn-icon-notxt';
					}
				}
			},
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			},
			markCls      : {
				depends : ['markType'],
				parse :function(){
					var markType=this.get('markType');
					return markType?'hui-btn-mark-'+markType:'';
				}
			}
		},
//		icon            : null,                //图标名称
		
		defItem         : {
			xtype       : 'Icon',
			theme       : 'gray',
			isAlt       : true
		},
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" {{bindAttr class="noTxtCls isBack?hui-btn-back gradient?hui-gradient markCls iconPosCls"}}>',
								'<span class="hui-btn-txt">{{text}}</span>',
								'<span class="hui-btn-ext">{{extTxt}}</span>',
								'{{placeItem}}',
								'<span class="hui-btn-mark"></span>',
							'</a>'].join(''),
		doConfig        : fDoConfig           //初始化配置
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		if(oSettings.theme==='black'||oSettings.theme==='dark'){
			me.defItem=$H.clone(me.defItem);
			$H.extend(me.defItem,{
				isAlt:false,
				theme:null
			})
		}
		if(oSettings.tType==='adapt'){
			oSettings=$H.clone(oSettings);
			$H.extend(oSettings,{
				isInline:true,
				radius:null,
				shadow:null,
				shadowSurround:null
			});
			if(typeof oSettings.icon==='string'){
				oSettings.icon={
					name:oSettings.icon,
					theme:null
				}
			}
		}
		me.callSuper([oSettings]);
	}
	
	return Button;
	
});
/**
 * 描述类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Desc',
['C.AbstractComponent',
'D.Model',
'D.Collection'],
function(AC,Model,Collection){
	
	var Desc=AC.define('Desc');
	
	Desc.extend({
		//初始配置
		xConfig  : {
			cls      : 'desc',
			icon     : '',
			text     : '',
			txtOverflow : true,     //文字超出长度显示省略号
			iconCls : {
				depends:['icon'],
				parse:function(){
					var sIcon=this.get('icon');
					return sIcon?'hui-icon-'+sIcon:'';
				}
			}
		},
		
		tmpl     : [
			'<div {{bindAttr class="#c-clear txtOverflow?c-txt-overflow"}}>',
				'{{placeItem > [xrole=icon]}}',
				'<span class="hui-desc-txt">{{text}}</span>',
				'<div class="hui-desc-right">',
					'{{placeItem > [xrole=right]}}',
				'</div>',
				'{{placeItem > [!xrole]}}',
			'</div>'
		].join(''),
		
		parseItem  : fParseItem      //分析子组件
	});
	
	/**
	 * 分析子组件
	 * @param{object}oItem
	 */
	function fParseItem(oItem){
		if(oItem.xtype==='Icon'){
			$H.extendIf(oItem,{
				xrole:'icon',
				isAlt:true,
				extCls:'hui-light',
				size:'mini',
				theme:null
			});
		}
	}
		
	return Desc;
	
});
/**
 * 面板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('C.Panel',
'C.AbstractComponent',
function(AC){
	
	var Panel=AC.define('Panel');
	
	Panel.extend({
		//初始配置
		xConfig             : {
			cls             : 'panel',
			content         : '',               //内容
			isLoading       : false,            //是否显示正在加载中
			loadingTxt      : '正在加载中...'    //正在加载中的提示文字
		},
		
		tmpl            : [
			'<div>',
				'{{#if isLoading}}',
					'<div class="hui-panel-loading">',
						'<div class="hui-mask"></div>',
						'<div class="hui-loading-container">',
							'<div class="hui-tips hui-tips-big hui-tips-black hui-radius-little">',
								'<span class="hui-icon hui-icon-loading"></span>',
								'<span class="hui-tips-txt">{{loadingTxt}}</span>',
							'</div>',
						'</div>',
					'</div>',
				'{{/if}}',
				'{{#if content}}',
					'{{content}}',
				'{{else}}',
					'{{placeItem}}',
				'{{/if}}',
			'</div>'
		].join('')
	});
	
	return Panel;
	
});
/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('C.Popup',
'C.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup'),
	_popupNum=0,
	_mask;
	
	Popup.extend({
		//初始配置
		delayShow       : true,            //延迟显示
		clickHide       : true,            //是否点击就隐藏
//		timeout         : null,            //自动隐藏的时间(毫秒)，不指定此值则不自动隐藏
		isFixed         : false,           //是否是position:fixed
		showPos         : 'center',        //定位方法名:center(居中)、followEl(跟随指定元素)、top(顶部)，或者传入自定义定位函数
//		offsetTop       : 0,               //顶部偏移量
		destroyWhenHide : true,            //隐藏时保留对象，不自动销毁，默认弹出层会自动销毁
//		noMask          : false,           //仅当true时没有遮罩层
		
		//组件共有配置
		shadowOverlay   : true,
		
		tmpl            : '<div>{{placeItem}}</div>',
		
		doConfig         : fDoConfig,        //初始化配置
		afterShow        : fAfterShow,       //显示
		hide             : fHide,            //隐藏
		top              : fTop,             //顶部显示
		center           : fCenter,          //居中显示
		bottom           : fBottom,          //底部显示
		followEl         : fFollowEl,        //根据指定节点显示
		mask             : fMask,            //显示遮罩层
		unmask           : fUnmask           //隐藏遮罩层
	});
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oParam){
		var me=this;
		me.callSuper();
		me.extCls=(me.extCls||'')+' hui-popup'+(me.isFixed?' hui-popup-fixed':'');
		//添加点击即隐藏事件
		if(me.clickHide){
			me.listeners.push({
				name:'click',
				el: $(document),
				handler:function(){
					this.hide();
				}
			});
		}
		//Android下弹出遮罩层时，点击仍能聚焦到到输入框，暂时只能在弹出时disable掉，虽然能避免聚焦及弹出输入法，
		//不过，仍旧会有光标竖线停留在点击的输入框里，要把延迟加到几秒之后才能避免，但又会影响使用
		if($H.android()){
			me.listeners.push({
				name:'show',
				custom:true,
				handler:function(){
					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
					var bHasDone=$H.Events.trigger("component.popup.show");
					if(bHasDone!=true){
						$("input,textarea,select").attr("disabled","disabled");
					}
				}
			});
			me.listeners.push({
				name:'hide',
				custom:true,
				handler:function(){
					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
					var bHasDone=$H.Events.trigger("component.popup.hide");
					if(bHasDone!=true){
						//ps:这里延迟300ms执行还是有可能会有聚焦效果，所以设个保险的500ms
						setTimeout(function(){
							$("input,textarea,select").removeAttr("disabled");
						},500);
					}
				}
			});
		}
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		oEl.css('z-index',_popupNum*1000+1000);
		//如果未设置宽度，默认和父组件宽度一样
		if(!me.width&&me.parent){
			var oParentEl=me.parent.getEl();
			var width=me.width=oParentEl[0].clientWidth;
			oEl.css('width',width);
		}
		//默认居中显示
		var showPos=me.showPos;
		var sType=typeof showPos;
		if(sType==="string"){
			me[showPos]();
		}else if(sType==="function"){
			showPos.call(me);
		}else if(sType==='object'&&showPos!==null){
			oEl.css(me.showPos);
		}
		if(!me.noMask){
			me.mask();
		}
		//定时隐藏
		if(me.timeout){
			setTimeout(function(){
				if(!me.destroyed){
					me.hide();
				}
			},me.timeout);
		}
		//用户点击后退时先隐藏弹出层
		$H.once('hisoryChange',function(){
			if(me.showed&&!me.destroyed){
				me.hide();
				$H.stop();
				return false;
			}
		});
		me.callSuper();
	}
	/**
	 * 隐藏
	 * @method hide
	 */
	function fHide(){
		var me=this;
		var bIsHide=me.callSuper();
		if(bIsHide!=false){
			if(!me.noMask){
				me.unmask();
			}
			if(me.destroyWhenHide){
				me.destroy();
			}
		}
	}
	/**
	 * 顶部显示
	 */
	function fTop(){
		var me=this;
		var oEl=me.getEl();
		oEl.css({
			left: '50%',
			top:$H.em2px(0.5),
			position:'fixed'
		});
	}
	/**
	 * 居中显示
	 * @method center
	 */
	function fCenter(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var width=oEl[0].clientWidth;
		var height=oEl[0].clientHeight;
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - width)/2;
		var nClientHeight=oDoc.documentElement.clientHeight || oDoc.body.clientHeight;
		//稍微偏上一些显示
		var nSpace=nClientHeight - height;
		var y = nSpace/2 -nSpace/10;
		if(!me.isFixed){
			y+= oDoc.documentElement.scrollTop||oDoc.body.scrollTop;
		}
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
	}
	/**
	 * 底部显示
	 */
	function fBottom(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var width=oEl[0].clientWidth;
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - width)/2;
		oEl.css({
			left:x + "px",
			bottom:me.get('hasArrow')?'1em':0
		});
	}
	/**
	 * 显示在指定元素显示
	 * @method followEl
	 * @param {jQuery}oEl 定位标准元素
	 */
	function fFollowEl(oEl){
		var me=this;
		var el=oEl||me.parent.getEl();
		var oPos=$H.position(el[0]);
		me.getEl().css(oPos);
	}
	/**
	 * 显示遮罩层
	 * @method mask
	 */
	function fMask(){
		var me=this;
		if(!_mask){
			_mask=$('<div class="hui-mask hui-hidden"></div>').appendTo(me.renderTo);
		}else{
			_mask.appendTo(me.renderTo);
		}
		_mask.css('z-index',_popupNum*1000+998);
		if(_popupNum==0){
			_mask.removeClass('hui-hidden');
		}
		_popupNum++;
	}
	/**
	 * 隐藏遮罩层
	 * @method unmask
	 */
	function fUnmask(){
		var me=this;
		_popupNum--;
		if(_popupNum==0){
			_mask.addClass('hui-hidden');
		}else{
			_mask.css('z-index',(_popupNum-1)*1000+998);
		}
	}
	
	return Popup;
	
});
/**
 * 控制组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('C.ControlGroup',
'C.AbstractComponent',
function(AC){
	
	var ControlGroup=AC.define('ControlGroup');
	
	ControlGroup.extend({
		//初始配置
		xConfig:{
			cls              : 'ctrlgp',
			direction        : 'v',                  //排列方向，'v'表示垂直方向，'h'表示水平方向
			directionCls     : {
				depends:['direction'],
				parse:function(){
					return 'hui-ctrlgp-'+this.get('direction');
				}
			}
		},
		multi                : false,                //是否多选
//		notSelect            : false,                //点击不需要选中
//		itemClick            : function(oCmp,nIndex){},         //子项点击事件函数，函数参数为子组件对象及索引
		
		//默认子组件配置
		defItem              : {
			xtype            : 'Button',
			radius           : null,
			shadow           : false,
//			selected         : false,             //是否选中
			isInline         : false
		},
		
		_customEvents        : ['Select','Unselect'],
		
		tmpl                 : '<div {{bindAttr class="directionCls"}}>{{placeItem}}</div>',
		
		listeners       : [
			{
				name :'click',
				selector : '.js-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					var oCurrentEl=$(oEvt.currentTarget);
					//可能后后代组件有'.js-item'，因此这里只寻找子组件
					var oCurCmp=me.find('> [_id='+oCurrentEl.attr("id")+']');
					if(oCurCmp.length>0){
						var nIndex=oCurCmp[0].index();
						me.onItemSelect(nIndex);
					}
				}
			}
		],
		
		doConfig             : fDoConfig,            //初始化配置
		parseItem            : fParseItem,           //分析子组件配置
		layout               : fLayout,              //布局
		select               : fSelect,              //选中指定项
		getSelected          : fGetSelected,         //获取选中项/索引
		selectItem           : fSelectItem,          //选中/取消选中
		val                  : fVal,                 //获取/设置值
		onItemSelect         : fOnItemSelect         //子项点击事件处理
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置对象
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		//水平布局需要js计算
		if(me.get('direction')=='h'){
			me.listen({
				name        : 'afterRender add remove',
				custom      : true,
				handler     : function(){
					me.layout();
				}
				
			});
		}
	}
	/**
	 * 分析子组件配置
	 * @param {object}oItem 子组件配置项
	 */
	function fParseItem(oItem){
		oItem.extCls=(oItem.extCls||"")+' js-item';
	}
	/**
	 * 布局
	 */
	function fLayout(){
		var me=this;
		if(me.rendered){
			var nLen=me.children.length;
			var width=Math.floor(100/nLen);
			var oItems;
			if(me.getLayoutItems){
				oItems=me.getLayoutItems();
			}else{
				oItems=me.getEl().children('.js-item');
			}
			var sFirstCls='hui-item-first';
			var sLastCls='hui-item-last';
			oItems.each(function(i,el){
				var jEl=$(el);
				if(i==0){
					jEl.removeClass(sLastCls);
					jEl.addClass(sFirstCls);
				}else if(i==nLen-1){
					jEl.removeClass(sFirstCls);
					jEl.addClass(sLastCls);
				}else{
					jEl.removeClass(sFirstCls);
					jEl.removeClass(sLastCls);
				}
				if(i<nLen-1){
					el.style.width=width+'%';
				}else{
					el.style.width=(100-width*(nLen-1))+'%';
				}
			});
		}
	}
	/**
	 * 选中指定项
	 * @method select
	 * @param {number|string|Component}item number表示索引，string表示选择器，也可以传入组件对象
	 */
	function fSelect(item){
		var me=this,oItem;
		if(me.notSelect){
			return;
		}
		if(typeof item=='number'){
			oItem=me.children[item];
		}else if(typeof item=="string"){
			oItem=me.find(item)[0];
		}else{
			oItem=item;
		}
		if(oItem){
			if(!me.multi&&!oItem.multi){
				//单选操作要先取消别的选中
				var oSelected=me.getSelected();
				if(oSelected){
					me.selectItem(oSelected,false);
				}
				me.selectItem(oItem);
			}else{
				me.selectItem(oItem,!oItem.get('selected'));
			}
		}
	}
	/**
	 * 获取选中项/索引
	 * @method getSelected
	 * @param {boolean=}bIsIndex 仅当true时返回索引
	 * @return {Component|number|Array} 返回当前选中的组件或索引，单选返回单个对象，复选返回数组(不管实际选中几个),
	 * 									无选中则返回null
	 */
	function fGetSelected(bIsIndex){
		var me=this,aItem=[];
		me.each(function(i,item){
			if(item.get(item.select?'selected':'isActive')){
				aItem.push(bIsIndex?i:item);
			}
		});
		return aItem.length>0?me.multi?aItem:aItem[0]:null;
	}
	/**
	 * 选中/取消选中
	 * @method selectItem
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		bSelect=bSelect!=false;
		if(bSelect){
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select();
			}else{
				oItem.active();
			}
			oItem.trigger('Select');
		}else{
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select(bSelect);
			}else{
				oItem.unactive();
			}
			oItem.trigger('Unselect');
		}
	}
	/**
	 * 获取/设置值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值，如果是多个值，用","隔开
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue!==undefined){
			var aValues=(''+sValue).split(',');
			me.each(function(i,oCmp){
				if($H.contains(aValues,oCmp.get('value'))){
					me.selectItem(oCmp,true);
				}else{
					me.selectItem(oCmp,false);
				}
			});
		}else{
			var aValues=[];
			me.each(function(i,oCmp){
				if(oCmp.get('selected')){
					aValues.push(oCmp.value);
				}
			})
			return aValues.join(',');
		}
	}
	/**
	 * 子项点击事件处理
	 * @param {number}nIndex 子项目索引
	 */
	function fOnItemSelect(nIndex){
		var me=this,bResult;
		if(me.itemClick){
			var oCmp=me.children[nIndex];
			bResult=me.itemClick(oCmp,nIndex);
		}
		if(bResult!==false){
			me.select(nIndex);
		}
	}
	
	
	return ControlGroup;
	
});
/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-29
 */

$Define('C.Radio',
'C.AbstractComponent',
function(AC){
	
	var Radio=AC.define('Radio');
	
	Radio.extend({
		//初始配置
		xConfig         : {
			cls             : 'radio',
			name            : '',                  //选项名
			text            : '',                  //文字
			value           : '',                  //选项值
			selected        : false                //是否选中
		},
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray selected?hui-radio-on"}}>',
				'<span class="hui-icon hui-icon-radio"></span>',
				'<input type="radio" {{bindAttr selected?checked name="name" value="value"}}/>',
				'<span class="hui-radio-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		select          : fSelect,            //选中
		val             : fVal                //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		this.update({selected:!(bSelect==false)});
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue!==undefined){
			me.set("value",sValue);
		}else{
			return me.get("value");
		}
	}
	
	return Radio;
	
});
/**
 * 多选框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('C.Checkbox',
'C.AbstractComponent',
function(AC){
	
	var Checkbox=AC.define('Checkbox');
	
	Checkbox.extend({
		//初始配置
		xConfig         : {
			cls             : 'chkbox',            //组件样式名
			name            : '',                  //选项名
			text            : '',                  //文字
			value           : '',                  //选项值
			selected        : false                //是否选中
		},
		multi           : true,                //多选
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray selected?hui-chkbox-on"}}>',
				'<span class="hui-icon hui-icon-chkbox"></span>',
				'<input type="checkbox" {{bindAttr selected?checked name="name" value="value"}}/>',
				'<span class="hui-chkbox-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		this.update({selected:!(bSelect==false)});
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue!==undefined){
			me.set('value',sValue);
		}else{
			return me.get('value');
		}
	}
	
	return Checkbox;
	
});
/**
 * 下拉选择框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('C.Select',
'C.AbstractComponent',
function(AC){
	
	var Select=AC.define('Select');
	
	Select.extend({
		//初始配置
		xConfig         : {
			cls             : 'select',
			name            : '',                  //选项名
			text            : '请选择...',          //为选择时的文字
			value           : '',                  //默认值
			radius          : 'little',
			iconPos         : 'right',             //图标位置，"left"|"right"|"top"|"bottom"
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			}
		},
//		options         : [{text:"文字",value:"值"}],    //选项
//		optionWidth     : 0,                            //选项菜单宽度
		optionClick     : function(){},
		defItem         : {
			xtype       : 'Menu',
			hidden      : true,
			markType    : 'hook',
			showPos     : $H.mobile()?'center':'followEl',
			renderTo    : "body"              //子组件须设置renderTo才会自动render
		},
		
		_customEvents   : ['change'],
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray iconPosCls"}}>',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input {{bindAttr value="value" name="name"}}/>',
				'<span class="hui-btn-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		listeners       : [
			{
				name:'click',
				handler:function(){
					this.showOptions();
				}
			}
		],
		
		doConfig         : fDoConfig,             //初始化配置
		showOptions      : fShowOptions,          //显示选项菜单
		val              : fVal,                  //获取/设置值
		clearValue       : fClearValue            //清除选中值
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		me.callSuper();
		//options配置成菜单
		var oOptions=$H.clone(oParams.options);
		me.defTxt=me.get('text');
		var sValue=me.get('value');
		//根据默认值设置默认文字
		var bHasVal=false;
		for(var i=0,len=oOptions.length;i<len;i++){
			var oOption=oOptions[i];
			var val=oOption.value;
			if(val!==undefined&&val==sValue){
				me.set('text',oOption.text);
				oOption.selected=true;
				bHasVal=true;
				break;
			}
		}
		if(!bHasVal){
			delete me.value;
		}
		me.add({
			itemClick:function(oButton,nIndex){
				var sValue=oButton.get('value');
				me.val(sValue);
			},
			width:me.optionWidth||me.width,
			items:oOptions
		})
	}
	/**
	 * 显示选项菜单
	 */
	function fShowOptions(){
		var me=this;
		me.children[0].show();
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue!==undefined){
			if(me.get('value')!=sValue){
				var oMenu=me.children[0];
				var oItem=oMenu.find('> [value='+sValue+']');
				if(oItem.length>0){
					oItem=oItem[0];
					me.set('value',sValue);
					me.txt(oItem.get('text'));
					//更新菜单选中状态
					oMenu.select(oItem);
					me.trigger("change",sValue,oItem);
				}
			}
		}else{
			return me.get('value');
		}
	}
	/**
	 * 清除选中值
	 */
	function fClearValue(){
		var me=this;
		var oMenu=me.children[0];
		oMenu.selectItem(oMenu.getSelected(),false);
		me.set('value','');
		me.set('text',me.defTxt);
	}
	
	return Select;
	
});
/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('C.Input',
'C.AbstractComponent',
function(AC){
	
	var Input=AC.define('Input');
	
	Input.extend({
		//初始配置
		xConfig         : {
			cls             : 'input',
			isTextarea      : false,               //是否是textarea
			name            : '',
			value           : '',                  //默认值
			placeholder     : '',                  //placeholder
			radius          : 'little',            //普通圆角
			iconPos         : '',                  //图标位置，'left'或'right'
			btnPos          : '',                  //按钮位置，'left'或'right'
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sIconPos=this.get('iconPos');
					return sIconPos?'hui-input-icon-'+sIconPos:'';
				}
			},
			btnPosCls       : {
				depends : ['btnPos'],
				parse :function(){
					var sBtnPos=this.get('btnPos');
					return sBtnPos?'hui-input-btn-'+sBtnPos:'';
				}
			}
		},
		fastUpdateMethod : {
			inputHeight  : function(value){
				this.findEl('input,textarea').css('height',value);
			}
		},
//		inputHeight     : null,                //输入框高度 
		type            : '',                  //输入框类型，默认为普通输入框，'search':搜索框
		maxHeight       : '5.313em',           //输入框最大高度，进对textarea有效
		withClear       : false,               //带有清除按钮
		
		tmpl            : [
		'<div {{bindAttr class="iconPosCls btnPosCls"}}>',
			'{{placeItem}}',
			'{{#if isTextarea}}',
				'{{textarea class="#js-input #hui-input-txt" name="name" placeholder="placeholder" value=value}}',
			'{{else}}',
				'{{input type="#text" class="#js-input #hui-input-txt" name="name" placeholder="placeholder" value="value"}}',
			'{{/if}}',
		'</div>'].join(''),
		listeners       : [
			{
				name : 'focus',
				el : '.js-input',
				handler : function(){
					var me=this;
					me.getEl().addClass('hui-focus');
					me.focused=true;
					if($H.mobile()){
						//用户点击后退时先隐藏弹出层
						$H.once('hisoryChange',function(){
							if(me.focused&&!me.destroyed){
								me.blur();
								$H.stop();
								return false;
							}
						});
					}
				}
			},{
				name : 'blur',
				el : '.js-input',
				handler : function(){
					var me=this;
					me.getEl().removeClass('hui-focus');
					me.focused=false;
				}
			}
		],
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem,        //分析处理子组件
		val             : fVal,              //获取/设置输入框的值
		focus           : fFocus,            //聚焦
		blur            : fBlur              //失焦
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oSettings){
		var me=this;
		//搜索框快捷配置方式
		if(oSettings.type=='search'){
			me.icon='search';
		}
		me.callSuper();
		me.maxHeight=$H.em2px(me.maxHeight);
		if(oSettings.isTextarea){
			//textarea高度自适应，IE6、7、8支持propertychange事件，input被其他浏览器所支持
			me.listeners.push({
				name:'input propertychange',
				el:'.js-input',
				handler:function(){
					var oIptDv=me.getEl();
					oIptDv.height('auto');
					var oTextarea=me.findEl(".js-input");
					var nNewHeight=oTextarea[0].scrollHeight;
					//TODO Firefox下scrollHeight不准确，会忽略padding
					if(nNewHeight>=50){
						var nMax=me.inputHeight&&me.maxHeight<me.inputHeight?me.inputHeight:me.maxHeight;
						nNewHeight=nNewHeight<=nMax?nNewHeight:nMax
						oTextarea.css("height",nNewHeight);
					}
				}
			});
		}
		//清除按钮快捷配置方式
		if(me.withClear){
			me.add({
				xtype:'Button',
				radius:'big',
				icon:'delete',
				click:function(){
					this.parent.findEl('input').val('').focus();
				}
			});
		}
		if(oSettings.inputHeight){
			me.on('afterRender',function(){
				me.findEl('input,textarea').css('height',oSettings.inputHeight);
			});
		}
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		//设置图标/按钮默认位置
		if(oItem.xtype=="Icon"){
			if(!me.get('iconPos')){
				me.set('iconPos','left');
			}
		}else if(oItem.xtype=="Button"){
			if(!me.get('btnPos')){
				me.set('btnPos','right');
			}
		}
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var oInput=this.findEl('.js-input');
		if(sValue!==undefined){
			oInput.val(sValue);
		}else{
			return oInput.val();
		}
	}
	/**
	 * 聚焦
	 * @method focus
	 */
	function fFocus(){
		this.findEl('.js-input').focus();
	}
	/**
	 * 失焦
	 * @method focus
	 */
	function fBlur(){
		this.findEl('.js-input').blur();
	}
	
	return Input;
	
});
/**
 * 文字标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Label',
'C.AbstractComponent',
function(AC){
	
	var Label=AC.define('Label');
	
	Label.extend({
		//初始配置
		xConfig         : {
			cls         : 'label',
			text        : '',      //label文字
			color       : '',      //label字体颜色
			textAlign   : '',      //label文字对齐，默认左对齐
			forName     : '',      //label的for属性
			colorCls    : {
				depends:['color'],
				parse:function(){
					var s=this.get('color');
					return s?'hui-label-'+s:'';
				}
			},
			textAlignCls    : {
				depends:['textAlign'],
				parse:function(){
					var s=this.get('textAlign');
					return s?'c-txt-'+s:'';
				}
			}
		},
		
		tmpl            : [
			'<label {{bindAttr class="colorCls textAlignCls" for="forName"}}>',
				'{{text}}',
			'</label>'
		].join('')
		
	});
	
	return Label;
	
});
/**
 * 列表行类，用于多行的结构
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.RowItem',
'C.AbstractComponent',
function(AC){
	
	var RowItem=AC.define('RowItem');
	
	RowItem.extend({
		//初始配置
		xConfig         : {
			cls             : 'rowitem',
			text            :'',             //文字
			comment         : '',            //底部注解文字
			extTxt          : '',            //右边说明文字
			underline       : false,         //右边下划线，文字域默认有下划线
			hasArrow        : false,         //右边箭头，有click事件时默认有箭头
			newsNum         : 0,             //新消息提示数目，大于9自动显示成"9+"
			padding         : 'big',         //上下padding大小
			paddingCls      : {
				depends : ['padding'],
				parse:function(){
					var padding=this.get('padding');
					return padding?'hui-rowitem-padding-'+padding:''
				}
			},
			newsNumTxt      : {
				depends : ['newsNum'],
				parse:function(){
					var newsNum=this.get('newsNum');
					return newsNum?newsNum>9?'9+':newsNum:0
				}
			}
		},
		
		tmpl            : [
			'<div {{bindAttr class="underline?hui-rowitem-underline paddingCls hasArrow?hui-rowitem-padding-right"}}>',
				'{{placeItem}}',
				'<div class="hui-rowitem-txt">{{text}}</div>',
				'<div class="hui-rowitem-comment">{{comment}}</div>',
				'<div class="hui-rowitem-ext">{{extTxt}}</div>',
				'{{#if newsNumTxt}}',
					'<span class="hui-news-tips">{{newsNumTxt}}</span>',
				'{{else}}',
					'{{#if hasArrow}}',
						'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情"><span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span></a>',
					'{{/if}}',
				'{{/if}}',
			'</div>'
		].join(''),
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		//空格占位符
		var sText=me.get('text');
		if(!sText&&sText!==0){
			me.set('text',"&nbsp;");
		}
		//默认文字域有下划线
		if(me.text!==undefined&&!oSettings.hasOwnProperty('underline')){
			me.set('underline',true);
		}
		//有点击函数时默认有右箭头
		if(oSettings.click&&!oSettings.hasOwnProperty('hasArrow')){
			me.set('hasArrow',true);
		}
		//有注解
		if(oSettings.comment&&oSettings.padding===undefined){
			me.set('padding','normal');
		}
	}
	
	return RowItem;
	
});
/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Set',
'C.AbstractComponent',
function(AC){
	
	var Set=AC.define('Set');
	
	Set.extend({
		xConfig         : {
			cls         : 'set',
			theme       : 'normal',
			title       : ''      //标题
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-set-title">',
					'{{#if title}}',
						'<h1 class="hui-title-txt">{{title}}</h1>',
					'{{/if}}',
					'{{placeItem > [xrole=title]}}',
				'</div>',
				'<div class="hui-set-content">',
					'{{placeItem > [xrole!=title]}}',
				'</div>',
			'</div>'
		].join('')
		
	});
	
	return Set;
	
});
/**
 * 表单域类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Field',
'C.AbstractComponent',
function(AC){
	
	var Field=AC.define('Field');
	
	Field.extend({
		//初始配置
		xConfig         : {
			cls           : 'field',
			noPadding     : false     //true表示没有上下间隙
		},
//		forName         : '',      //label标签for名字
//		title           : '',      //label文字字符串，或者Label或其它组件的配置项
//		content         : '',      //右边文字，或组件配置
		
		defItem         : {
			xtype       : 'RowItem',
			xrole       : 'content'
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-field-left">',
					'{{placeItem > [xrole=title]}}',
				'</div>',
				'<div {{bindAttr class="#hui-field-right noPadding?hui-field-nopadding"}}>',
					'{{placeItem > [xrole=content]}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig       : fDoConfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		var title=oSettings.title;
		if($H.isSimple(title)){
			title={
				text:title
			};
		}
		title=$H.extend({
			xtype:'Label',
			xrole:'title'
		},title);
		me.add(title);
		
		//内容
		var content=oSettings.content;
		//默认有空白字符
		if(content===undefined&&!oSettings.items){
			content='';
		}
		//包装文字内容
		if($H.isSimple(content)){
			content=({
				text:content,
				//默认文字域有下划线
				underline:true
			})
		}
		if(content){
			me.noPadding=true;
			me.add(content);
		}
		var oSet=$.extend({},oSettings);
		delete oSet.title;
		delete oSet.content;
		me.callSuper([oSet]);
	}
	
	return Field;
	
});
/**
 * 表单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Form',
'C.AbstractComponent',
function(AC){
	
	var Form=AC.define('Form');
	
	Form.extend({
		//初始配置
		xConfig         : {
			cls         : 'form'
		},
		
		tmpl            : [
			'<div>',
				'<form action="">',
					'<div class="hui-form-tips c-txt-error"></div>',
					'{{placeItem}}',
				'</form>',
			'</div>'
		].join(''),
		
		hasChanged      : fHasChanged      //检测是否有表单改变的域/值
		
	});
	
	/**
	 * 检测是否有表单改变的域/值
	 * @return {boolean} true表示有变化
	 */
	function fHasChanged(){
		var me=this;
		var bHasChange=false;
		me.findEl('input,textarea').each(function(i,oEl){
			if(oEl.type==='checkbox'||oEl.type==='radio'){
				if (oEl.checked != oEl.defaultChecked){
					bHasChange=true;
					return false;
				}
			}else{
				if (oEl.value != oEl.defaultValue){
					bHasChange=true;
					return false;
				}
			}
		});
		me.findEl('select').each(function(i,oEl){
			var def = 0, opt;
			for (var i = 0, len = oEl.options.length; i < len; i++) {
				opt = oEl.options[i];
				bHasChange = bHasChange || (opt.selected != opt.defaultSelected);
				if (opt.defaultSelected){
					def = i;
				}
			}
			if (bHasChange && !oEl.multiple){
				bHasChange = (def != oEl.selectedIndex);
			}
			if (bHasChange){
				return false;
			}
		});
		return bHasChange;
	}
	
	return Form;
	
});
/**
 * 标签项类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-24
 */

$Define('C.TabItem',
[
'C.AbstractComponent',
'C.Panel'
],
function(AC,Panel){
	
	var TabItem=AC.define('TabItem');
	
	TabItem.extend({
		//初始配置
		xConfig         : {
			cls             : 'tabitem'
		},
//		selected        : false,
//		title           : ''|{},        //顶部按钮，可以字符串，也可以是Button的配置项
//		content         : null,         //标签内容，可以是html字符串，也可以是组件配置项
//		activeType      : '',           //激活样式类型，
		defItem         : {             //默认子组件是Button
			xtype       : 'Button',
			xrole       : 'title',
			radius      : null,
			isInline    : false,
			shadow      : false
		},
		_customEvents   : ['selectchange'],
		
		//属性
//		titleCmp        : null,         //标题组件
//		contentCmp      : null,         //内容组件
		tmpl            : '<div>{{placeItem > [xrole=title]}}</div>',
		initialize      : fInitialize,  //初始化
		doConfig        : fDoConfig,    //初始化配置
		parseItem       : fParseItem,   //分析处理子组件
		select          : fSelect,      //处理子组件配置
		getContent      : fGetContent,  //获取内容
		setContent      : fSetContent   //设置内容
	});
	/**
	 * 初始化
	 * @param {Object}oSettings
	 */
	function fInitialize(oSettings){
		var me=this;
		me.callSuper();
		me.titleCmp=me.find('> [xrole=title]')[0];
		me.contentCmp=me.find('> [xrole=content]')[0];
	}
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var title=oSettings.title;
		if(typeof title=='string'){
			title={text:title};
		}
		if(typeof title=='object'){
			me.add(title);
		}
		var content=oSettings.content;
		if(typeof content=='string'){
			content={
				xtype:'Panel',
				content:content
			}
		}
		if(typeof content=='object'){
			$H.extend(content,{
				xrole:'content',
				hidden:!me.selected,
				extCls:(content.extCls||'')+' hui-tab-content js-tab-content'
			});
			me.add(content);
		}
	}
	/**
	 * 分析处理子组件
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		var me=this;
		if(me.selected&&oItem.xrole=="title"){
			oItem.isActive=true;
		}
		if(oItem.icon&&oItem.iconPos===undefined){
			oItem.iconPos='top';
		}
		//默认选中样式
		if(me.activeType){
			oItem.activeCls='hui-btn-active-'+me.activeType;
		}
	}
	/**
	 * 选择
	 * @param {boolean=} 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		var oTitle=me.titleCmp;
		var oContent=me.contentCmp;
		if(bSelect==false){
			oTitle.unactive();
			oContent&&oContent.hide();
			me.set('selected',false);
			me.trigger('selectchange',false);
		}else{
			oTitle.active();
			oContent&&oContent.show();
			me.set('selected',true);
			me.trigger('selectchange',true);
		}
	}
	/**
	 * 读取内容
	 * @param {boolean=}bHtml 仅当false表示获取子组件列表，其它表示获取html内容
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @return {string|Array.<Component>} 返回内容
	 */
	function fGetContent(bHtml,obj){
		var me=this;
		if(!obj){
			obj=me.contentCmp;
		}
		return me.callSuper([bHtml,obj]);
	}
	/**
	 * 设置内容
	 * @param {string|Component|Array.<Component>}content 内容，html字符串或组件或组件数组
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 */
	function fSetContent(content,obj){
		var me=this;
		if(!obj){
			obj=me.contentCmp;
		}
		return me.callSuper([content,obj]);
	}
	
	return TabItem;
	
});
/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('C.Tab',
['C.AbstractComponent',
'C.TabItem',
'C.ControlGroup'],
function(AC,TabItem,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	Tab.extend({
		//初始配置
		xConfig         : {
			cls         : 'tab',
			direction   : 'h'
//			theme       : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
		},
//		activeType      : '',           //激活样式类型，
		slidable        : $H.mobile(),
		
		defItem         : {             //默认子组件是TabItem
//			content     : '',           //tab内容
			xtype       : 'TabItem'
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-tab-titles js-titles c-clear">',
					'{{placeItem > TabItem}}',
				'</div>',
				'<div class="hui-tab-contents js-contents">',
					'{{placeItem > TabItem > [xrole=content]}}',
				'</div>',
			'</div>'
		].join(''),
		
		doConfig        : fDoConfig,           //初始化配置
		parseItem       : fParseItem,          //分析处理子组件 
		getLayoutItems  : fGetLayoutItems,     //获取布局子元素
		getSelectedItem : fGetSelectedItem,    //获取当前选中的TabItem组件
		setTabContent   : fSetTabContent,      //设置标签页内容
		selectItem      : fSelectItem          //选中/取消选中
	});
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		if(me.slidable){
			var sContSel='.js-tab-content';
			var oContEl;
			me.listen({
				name:'afterRender',
				custom:true,
				handler:function(){
					oContEl=me.findEl(sContSel).addClass('hui-ani-3d');
				}
			});
			me.listen({
				name:'touchstart',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					me.contentWidth=oEl.clientWidth;
					oEvt.preventDefault();
					oEvt = oEvt.touches[0];
					me.startX=oEvt.clientX;
					me.startY=oEvt.clientY;
					me.delX=0;
					oContEl.removeClass('hui-ani');
				}
			});
			me.listen({
				name:'touchmove',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					oEvt = oEvt.touches[0];
					var x=oEvt.clientX;
					var y=oEvt.clientY;
					var nDelX=x-me.startX;
					var nDelY=y-me.startY;
					//横向移动为主
					if(Math.abs(nDelX)>Math.abs(nDelY)){
						var nIndex=me.getSelected(true);
						//第一项不能向右滑动，最后一项不能向左滑动
						if(nIndex===0&&nDelX>0||nIndex===me.children.length-1&&nDelX<0){
							return;
						}
						var oBrother=me.children[nDelX>0?nIndex-1:nIndex+1];
						me.delX=nDelX;
						var nWidth=me.contentWidth;
						var oBrotherCmp=me.brotherCmp=oBrother.contentCmp;
						oBrother=oBrotherCmp.getEl()[0];
						oBrother.style.left=(nDelX>0?nDelX-nWidth:nWidth+nDelX)+'px';
						oBrotherCmp.show();
						oEl.style.left=nDelX+'px';
					}
				}
			});
			me.listen({
				name:'touchend',
				selector:sContSel,
				method:'delegate',
				handler:function(oEvt){
					var oEl=oEvt.currentTarget;
					oEvt = oEvt.originalEvent||oEvt;
					var nWidth=me.contentWidth;
					var nMin=nWidth/4;
					var nDelX=me.delX;
					var nIndex=me.getSelected(true);
					oContEl.addClass('hui-ani');
					me.animating=true;
					setTimeout(function(){
						me.animating=false;
					},150);
					if(nDelX>nMin){
						//向右滑动
						oEl.style.left=nWidth+'px';
						me.onItemSelect(nIndex-1);
					}else if(nDelX<-nMin){
						//向左滑动
						oEl.style.left=-nWidth+'px';
						me.onItemSelect(nIndex+1);
					}else if(nDelX!==0){
						//移动距离很短，恢复原样
						oEl.style.left=0;
						me.brotherCmp.hide();
					}
				}
			});
		}
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		var me=this;
		//默认选中样式
		if(me.activeType){
			oItem.activeType=me.activeType;
		}
		me.callSuper();
	}
	/**
	 * 获取布局子元素
	 * @return {object} 返回布局子元素
	 */
	function fGetLayoutItems(){
		return this.getEl().children('.js-titles').children('.js-item');
	}
	/**
	 * 获取当前选中的TabItem组件
	 * @return {Component} 返回当前选中的TabItem组件
	 */
	function fGetSelectedItem(){
		var me=this;
		nIndex=nIndex||me.getSelected(true);
		me.children[nIndex];
	}
	/**
	 * 设置标签页内容
	 * @param {String}sContent 内容
	 * @param {number=}nIndex 索引，默认是当前选中的那个
	 */
	function fSetTabContent(sContent,nIndex){
		var me=this;
		nIndex=nIndex||me.getSelected(true);
		me.findEl('.js-tab-content').index(nIndex).html(sContent);
	}
	/**
	 * 选中/取消选中
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		var me=this;
		bSelect=bSelect!=false;
		if(bSelect&&oItem.contentCmp){
			oItem.contentCmp.getEl().css({
				left:0
			});
		}
		//动画过程中创建dom节点会卡，这里延迟选中（选中事件中伴有初始化组件操作）
		if(me.animating){
			setTimeout(function(){
				ControlGroup.prototype.selectItem.call(me,oItem,bSelect);
			},150);
		}else{
			me.callSuper();
		}
	}
	
	return Tab;
	
});
/**
 * 工具栏类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('C.Toolbar',
'C.AbstractComponent',
function(AC){
	
	var Toolbar=AC.define('Toolbar');
	
	Toolbar.extend({
		//初始配置
		xConfig          : {
			cls              : 'tbar',
			title            : '',                  //标题
			isHeader         : false,
			isFooter         : false           
		},
		defItem          : {
			xtype        : 'Button',
			theme        : 'black',
			xrole        : 'content'
		},
		
		tmpl             : [
			'<div {{bindAttr class="isHeader?hui-header isFooter?hui-footer"}}>',
				'<div class="hui-tbar-left">',
					'{{placeItem > [xrole=left]}}',
				'</div>',
				'{{placeItem > [xrole=content]}}',
				'{{#if title}}<div class="hui-tbar-title js-tbar-txt">{{title}}</div>{{/if}}',
				'<div class="hui-tbar-right">',
					'{{placeItem > [xrole=right]}}',
				'</div>',
			'</div>'
		].join(''),
		
		parseItem        : fParseItem           //处理子组件配置
		
	});
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.xtype==='Button'&&oItem.shadowSurround===undefined){
			oItem.shadowSurround=true;
		}
	}
	
	return Toolbar;
	
});
/**
 * 提示类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-15
 */

$Define('C.Tips',
['C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Tips=AC.define('Tips',Popup);
	
	Tips.extend({
		//初始配置
		xConfig         : {
			cls             : 'tips',
			text            : '',
			radius          : 'normal',
			hasArrow        : false,               //是否有箭头
			theme           : 'black'
		},
//		type            : 'miniLoading',            类型，‘loading’表示居中加载中提示，‘topTips’表示顶部简单提示，‘miniLoading’表示顶部无背景loading小提示
		timeout         : 2000,
		
		tmpl            : [
			'<div {{bindAttr class="text:hui-tips-notxt c-clear"}}>',
				'{{placeItem}}',
				'{{#if text}}<span class="hui-tips-txt">{{text}}</span>{{/if}}',
				'{{#if hasArrow}}',
					'<div class="hui-triangle"><div class="hui-triangle hui-triangle-inner"></div></div>',
				'{{/if}}',
			'</div>'
		].join(''),
		doConfig        : fDoConfig     //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 设置项
	 */
	function fDoConfig(oSettings){
		var me=this;
		//普通居中loading提示
		if(oSettings.type=='loading'){
			$H.extend(me,{
				text:'正在加载中...',
				timeout:null,
				noMask:true,
				icon:'loading'
			});
		}else if(oSettings.type=='miniLoading'){
			//顶部小loading
			$H.extend(me,{
				showPos:{
					left:'50%',
					top:$H.em2px(0.625)
				},
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				theme:'tbar-black',
				noMask:true,
				tType:'mini',
				items:{
					xtype:'Icon',
					name:'loading-mini',
					theme:null
				}
			});
		}else if(oSettings.type=='topTips'){
			//顶部提示默认配置
			$H.extend(me,{
				showPos:'top',
				noMask:true,
				tType:'mini'
			});
		}else if(oSettings.type==='inlineLoading'){
			//顶部提示默认配置
			$H.extend(me,{
				noMask:true,
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				size:'mini',
				tType:'inline',
				width:'auto',
				style:{
					zIndex:0
				},
				theme:null,
				showPos:{
					left:$H.em2px(0.625),
					top:$H.em2px(0.625)
				},
				items:{
					xtype:'Icon',
					name:'loading-mini',
					theme:null
				}
			});
		}
		me.callSuper();
	}
	
	return Tips;
	
});
/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('C.Dialog',
['C.AbstractComponent',
'C.Popup'],
function(AC,Popup){
	
	var Dialog=AC.define('Dialog',Popup);
	
	//快捷静态方法
	$H.extend(Dialog,{
		alert           : fAlert,    //弹出警告框
		confirm         : fConfirm,  //弹出确认框
		prompt          : fPrompt    //弹出输入框
	});
	
	Dialog.extend({
		
		//对话框初始配置
		xConfig         : {
			cls             : 'dialog',
			radius          : 'little',
			content         : '',         //html内容，传入此值时将忽略contentTitle和contentMsg
			contentTitle    : '',         //内容框的标题
			contentMsg      : ''          //内容框的描述
		},
//		title           : '',             //标题
//		noClose         : false,          //true时没有close图标
//		noAction        : false,          //true时没有底部按钮
//		noOk            : false,          //true时没有确定按钮
//		noCancel        : false,          //true时没有取消按钮
		noIgnore        : true,           //true时没有忽略按钮
		okTxt           : '确定',         //确定按钮文字
		cancelTxt       : '取消',         //取消按钮文字
		ignoreTxt       : '不保存',       //忽略按钮文字
//		activeBtn       : null,          //为按钮添加激活样式，1表示左边，2表示右边，3为中间(如果有忽略按钮的话)
//		okCall          : function(){},  //确定按钮事件函数
//		cancelCall      : function(){},  //取消按钮事件函数
//		ignoreCall      : function(){},  //忽略按钮事件函数
		
		clickHide       : false,          //点击不隐藏
		
		tmpl            : [
			'<div>',
				'{{placeItem > [xrole=dialog-header]}}',
				'<div class="hui-dialog-body">',
					'{{#if content}}',
						'{{content}}',
					'{{else}}',
						'<div class="hui-body-content c-clear">',
							'<h1 class="hui-content-title">{{contentTitle}}</h1>',
							'<div class="hui-content-msg">{{contentMsg}}</div>',
							'{{placeItem > [xrole=dialog-content]}}',
						'</div>',
					'{{/if}}',
					'{{#unless noAction}}',
						'<div class="hui-body-action">',
						'{{placeItem > [xrole=dialog-action]}}',
						'</div>',
					'{{/unless}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig         : fDoConfig        //处理配置
	});
	
	/**
	 * 弹出警告框
	 * @method alert
	 * @param {string}sMsg 提示信息
	 */
	function fAlert(sMsg){
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			noCancel:true
		});
	}
	/**
	 * 弹出确认框
	 * @method confirm
	 * @param {string}sMsg 提示信息
	 * @param {function(boolean)}fCall 回调函数，参数为true表示点击的是"确定"按钮，false则为"取消"按钮
	 */
	function fConfirm(sMsg,fCall){
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			okCall:function(){
				return fCall&&fCall(true);
			},
			cancelCall:function(){
				return fCall&&fCall(false);
			}
		});
	}
	/**
	 * 弹出输入框
	 * @method prompt
	 * @param {string}sMsg 提示信息
	 * @param {string=}sDefault 输入框默认值
	 * @param {function(string)}fCall 回调函数，参数为输入框的值
	 */
	function fPrompt(sMsg,sDefault,fCall){
		if(!fCall){
			fCall=sDefault;
			sDefault='';
		}
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			items:{
				xtype:'Input',
				xrole:'dialog-content',
				value:sDefault
			},
			okCall:function(){
				var value=this.find('Input')[0].val();
				return fCall&&fCall(value);
			}
		});
	}
	/**
	 * 处理配置
	 * @method doConfig
	 * @param {object}oSettings 设置参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var aItems=oSettings.items;
		if(me.title&&!me.hasConfig('[xrole=dialog-header]',aItems)){
			//顶部标题栏
			me.add({
				xtype:'Toolbar',
				title:me.title,
				theme:'gray',
				xrole:'dialog-header',
				extCls:'hui-dialog-header',
				items:!me.noClose&&{
					xtype:'Button',
					radius:'big',
					icon:'delete',
					shadow:false,
					shadowSurround:false,
					theme:'gray',
					xrole:'left',
					click:function(){
						me.hide();
					}
				}
			})
		}
		if(!me.noAction&&!me.hasConfig('[xrole=dialog-action]',aItems)){
			var aActions=[];
			if(!me.noCancel){
				//取消按钮
				aActions.push({
					title:{
						isActive:me.activeBtn==1,
						text:me.cancelTxt,
						cClass:'cancelBtn',
						click:function(){
							if(!me.cancelCall||me.cancelCall()!=false){
								me.hide();
							}
						}
					}
				});
			}
			if(!me.noIgnore){
				//忽略按钮
				aActions.push({
					title:{
						isActive:me.activeBtn==3,
						text:me.ignoreTxt,
						cClass:'ignoreBtn',
						click:function(){
							if(!me.ignoreCall||me.ignoreCall()!=false){
								me.hide();
							}
						}
					}
				});
			}
			if(!me.noOk){
				//确定按钮
				aActions.push({
					title:{
						text:me.okTxt,
						cClass:'okBtn',
						isActive:me.activeBtn==2,
						click:function(){
							if(!me.okCall||me.okCall()!=false){
								me.hide();
							}
						}
					}
				});
			}
			me.add({
				xtype:'Tab',
				xrole:'dialog-action',
				theme:'no-border',
				tType:'sep',
				notSelect:true,
				items:aActions
			});
		}
	}
	
	return Dialog;
	
});
/**
 * 菜单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-02
 */

$Define('C.Menu',
['C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Menu=AC.define('Menu',Popup);
	
	//扩展取得ControlGroup的属性及方法
	Menu.extend(ControlGroup.prototype);
	
	Menu.extend({
		xConfig         : {
			cls              : 'menu'
		},
		markType         : null,         //选中的标记类型，默认不带选中效果，'active'是组件active效果，'hook'是勾选效果
		destroyWhenHide  : false,
		//默认子组件配置
		defItem          : {
			xtype            : 'Button',
			radius           : null,
			shadow           : false,
			theme            : null,
//			selected         : false,             //是否选中
			isInline         : false
		},
		
		tmpl            : '<div {{bindAttr class="directionCls"}}>{{placeItem}}</div>',
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem         //分析子组件配置
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置对象
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper(ControlGroup);
		me.callSuper();
	}
	/**
	 * 分析子组件配置
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		var me=this;
		ControlGroup.prototype.parseItem.call(me,oItem);
		var sType=me.markType;
		if(!sType){
			me.notSelect=true;
		}else if(sType=='hook'){
			oItem.items={
				name:'check',
				isAlt:true,
				theme:null
			};
			oItem.iconPos='left';
			oItem.activeCls='hui-item-select';
		}
		oItem.isActive=oItem.selected;
	}
	
	return Menu;
	
});
/**
 * 时间选择弹窗类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.DatePicker',
['C.AbstractComponent',
'C.Dialog'],
function(AC,Dialog){
	
	var DatePicker=AC.define('DatePicker',Dialog);
	
	DatePicker.getInstance=fGetInstance;      //静态获取实例方法，此方法会获取缓存中的实例对象(如果有的话)，避免多次创建同样的实例，提升性能
	
	DatePicker.extend({
		//初始配置
		xConfig         : {
			cls         : 'dp'
		},
//		date            : null,               //初始时间，Date对象或日期字符串，默认是当前($H.now())
//		formator        : 'yyyy-MM-dd HH:mm', //格式因子
		extCls          : 'hui-dialog',
		_customEvents   : [
			'change',                         //用户操作导致值改变时触发
			'confirm'                         //用户点击确认时触发
		],
		doConfig        : fDoConfig,          //初始化配置
		val             : fVal                //设置/读取值
	});
	
	/**
	 * 静态获取实例方法，此方法会获取缓存中的实例对象(如果有的话)，避免多次创建同样的实例，提升性能
	 * @param {object}oParams 初始化配置，同initialize方法
	 * @return {DatePicker} 返回日期选择弹窗实例
	 */
	function fGetInstance(oParams){
		var oPicker;
		var sFormator=oParams.formator||'default';
		var oInstance=DatePicker.instance||(DatePicker.instance={});
		if(oPicker=oInstance[sFormator]){
			//宿主对象不同，需重新绑定事件
			if(oPicker.host!=oParams.host){
				oPicker.host=oParams.host
				oPicker.off('change confirm');
				oParams.change&&oPicker.on('change',oParams.change);
				oParams.confirm&&oPicker.on('confirm',oParams.confirm);
				if(oParams.date){
					oPicker.val(oParams.date);
				}
			}
			oPicker.show();
		}else{
			oPicker=oInstance[sFormator]=new DatePicker($H.extend(oParams,{destroyWhenHide:false}));
		}
		return oPicker;
		
	}
	/**
	 * 获取选择框配置对象
	 * @param {string}sValue 选中值
	 * @param {number}nMin 最小值
	 * @param {number}nMax 最大值
	 * @param {string}sName 选择框名称
	 * @param {number=}nMaxDay 当前月份最大天数
	 * @return {object} 返回选择框配置
	 */
	function _fGetSelect(sValue,nMin,nMax,sName,nMaxDay){
		var oItem={
			xtype:'Select',
			xrole:'dialog-content',
			name:'dialogSelect',
			value:sValue,
			width:$H.em2px(3.125),
			cClass:sName,
			optionWidth:$H.em2px(6.25),
			iconPos:'bottom',
			extCls:'hui-dp-'+sName,
			options:[],
			defItem:{
				showPos:'center'
			},
			change:function(){
				var me=this;
				var oDp=me.parent;
				var oTime=oDp.val(true);
				//月份发生变化，要更新当月份的天数
				if(me.cClass=='month'){
					var nDay=$H.getDaysInMonth(oTime);
					var oDateMenu=oDp.find('.date > Menu')[0];
					var aMenuItems= oDateMenu.find();
					if(oDateMenu.val()>nDay){
						oDateMenu.val(nDay);
					}
					for(var i=28;i<31;i++){
						var oItem=aMenuItems[i];
						if(i<nDay){
							oItem.hidden=false;
						}else{
							oItem.hidden=true;
						}
					}
				}
				var sTime=oDp.val();
				oDp.val(sTime);
				oDp.trigger('change');
			}
		};
		for(var i=nMin;i<=nMax;i++){
			oItem.options.push({
				//分钟数补零
				text:sName=='minute'&&i<10?'0'+i:i,
				value:i,
				hidden:nMaxDay&&i>nMaxDay
			});
		}
		return oItem;
	}
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		oSettings=oSettings||{};
		var oDate=oSettings.date;
		if($H.isStr(oDate)){
			oDate=$H.parseDate(oDate);
		}
		var oDate=oDate||$H.now();
		var sFormator=oSettings.formator||(oSettings.formator='yyyy-MM-dd HH:mm');
		var sTime=$H.formatDate(oDate,sFormator);
		var aItems=[];
		var nMaxDay=$H.getDaysInMonth(oDate);
		var aFormatorMatches=sFormator.match(/[a-zA-Z]+/g);
		var aNumMatches=sTime.match(/\d+/g);
		for(var i=0;i<aFormatorMatches.length;i++){
			var sFormatorMatch=aFormatorMatches[i];
			var nNum=parseInt(aNumMatches[i]);
			switch (sFormatorMatch){
				case 'yyyy':
					aItems.push(_fGetSelect(nNum,nNum,nNum+10,'year'));
					break;
				case 'MM':
					aItems.push(_fGetSelect(nNum,1,12,'month'));
					break;
				case 'dd':
					aItems.push(_fGetSelect(nNum,1,31,'date',nMaxDay));
					break;
				case 'HH':
					aItems.push(_fGetSelect(nNum,0,23,'hour'));
					break;
				case 'mm':
					aItems.push(_fGetSelect(nNum,0,59,'minute'));
					break;
			}
		}
		$H.extend(oSettings,{
			contentTitle:sTime+' 星期'+$H.getWeek(oDate),
			items:aItems,
			okCall:function(){
				return me.trigger('confirm');
			}
		});
		me.callSuper([oSettings]);
	}
	/**
	 * 获取/设置值
	 * @param {string=|Date=|boolean}value 字符串或者日期值，表示设置操作，如果为空则表示读取操作，true表示读取Date类型时间
	 * @return {string=} 读取操作时返回当前时间
	 */
	function fVal(value){
		var me=this;
		var aSel=me.find('Select');
		var sFormator=me.formator;
		//读取
		if(!value||$H.isBool(value)){
			var sTime='';
			for(var i=0;i<aSel.length;i++){
				if(i==1||i==2){
					sTime+='-';
				}else if(i==3){
					sTime+=' ';
				}else if(i==4){
					sTime+=':';
				}
				sTime+=aSel[i].val();
			}
			var oDate=$H.parseDate(sTime);
			return value?oDate:$H.formatDate(oDate,sFormator);
		}else{
			//设置
			var sTime=value,oTime=value;
			if($H.isStr(value)){
				oTime=$H.parseDate(value,sFormator);
			}else{
				sTime=$H.formatDate(value,sFormator);
			}
			var aValues=sTime.match(/\d+/g);
			for(var i=0;i<aSel.length;i++){
				aSel[i].val(aValues[i]);
			}
			me.set('contentTitle',sTime+' 星期'+$H.getWeek(oTime));
		}
	}
	
	return DatePicker;
	
});
/**
 * 日期选择框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.DateSelect',
[
'C.AbstractComponent',
'C.DatePicker'
],
function(AC,DatePicker){
	
	var DateSelect=AC.define('DateSelect');
	
	DateSelect.extend({
		//初始配置
		xConfig         : {
			cls             : 'dsel',
			name            : '',                  //选项名
			value           : '',             //默认值
			text            : {                    //选择框的文字
				depends   : ['value'],
				parse     : function(){
					var sTxt=this.get('value');
					if(sTxt){
						return sTxt+' 星期'+$H.getWeek($H.parseDate(sTxt));
					}else{
						return '请选择...';
					}
				}
			},         
			radius          : 'little',
			iconPos         : 'right',             //图标位置，"left"|"right"|"top"|"bottom"
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			}
		},
//		date            : null,               //初始时间，Date对象，默认是当前($H.now()，默认分钟数清零)
//		formator        : 'yyyy-MM-dd HH:mm', //格式因子
		_customEvents   : ['change','confirm'],
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray iconPosCls"}}>',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input {{bindAttr value="value" name="name"}}/>',
				'<span class="hui-btn-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		listeners       : [
			{
				name:'click',
				handler:function(){
					this.showDialog();
				}
			}
		],
		
		doConfig         : fDoConfig,             //初始化配置
		showDialog       : fShowDialog,           //显示日期选择弹窗
		val              : fVal                   //获取/设置值
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		var oTime=oParams.date;
		if(!oTime){
			oTime=$H.now();
			//不传时间默认分钟数清零
			oTime.setMinutes(0);
		}
		me.date=oTime;
		var sTime=$H.formatDate(oTime,oParams.formator||(oParams.formator='yyyy-MM-dd HH:mm'));
		me.set('value',sTime);
		me.callSuper();
	}
	/**
	 * 显示日期选择弹窗
	 */
	function fShowDialog(){
		var me=this;
		DatePicker.getInstance({
			date:me.get('value'),
			formator:me.formator,
			host:me,
			confirm:function(){
				me.set('value',this.val());
				me.trigger('change');
				return me.trigger('confirm');
			}
		});
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=|Date=|boolean}value 字符串或者日期值，表示设置操作，如果为空则表示读取操作，true表示读取Date类型时间
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(value){
		var me=this;
		if(!value||$H.isBool(value)){
			var sTime=me.get('value');
			return value?$H.parseDate(sTime):sTime;
		}else{
			value=$H.formatDate(value,me.formator);
			if(me.get('value')!=value){
				me.set('value',value);
				me.trigger("change");
			}
		}
	}
	
	return DateSelect;
	
});
/**
 * 图片抽象类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.AbstractImage',
'C.AbstractComponent',
function(AC){
	
	var AbstractImage=AC.define('AbstractImage');
	
	AbstractImage.extend({
		_customEvents   : ['imgFixed'], //自定义事件，图片已修正
//		height          : 50,           //指定高度会自动修正图片高度，在不改变图片宽高比的前提下，最大化接近指定的高度
//		width           : 50,           //指定宽度会自动修正图片宽度，在不改变图片宽高比的前提下，最大化接近指定的宽度
		fixImgSize      : fFixImgSize   //修正图片尺寸，及居中显示
	});
	/**
	 * 修正图片尺寸，及居中显示
	 * @param {element}oImg 图片节点对象
	 * @return {boolean=}bContain 是否把图片缩小以显示所有图片，默认是放大图片以覆盖父节点
	 */
	function fFixImgSize(oImg,bContain){
		var me=this;
		//先移除宽度和高度属性才能获取准确的图片尺寸
		var jImg=$(oImg).removeAttr("width").removeAttr("height").css({width:'',height:''});
		var oEl=me.getEl()[0];
		// 生成比例
        var w = nOrigW=oImg.width,
            h = nOrigH=oImg.height,
            scale = w / h,
            nFixW=me.width,
            nFixH=me.height;
    	if(nFixW===undefined||($H.isStr(nFixW)&&nFixW.indexOf('em')>0)){
    		nFixW=oEl.clientWidth;
    	}
    	if(nFixH===undefined||($H.isStr(nFixH)&&nFixH.indexOf('em')>0)){
    		nFixH=oEl.clientHeight;
    	}
    	if(bContain){
    		//缩小以显示整个图片
	        if(nFixW||nFixH){
	            if(nFixW&&w!=nFixW){
	            	w=nFixW;
	            	h = Math.ceil(w / scale);
	            }
	            if(nFixH&&h>nFixH){
	            	h=nFixH;
	            	w=Math.ceil(h*scale);
	            }
	            jImg.css({width:w,height:h});
	        }
	        //居中定位
	        var nLeft=0,nTop=0;
	        if(w<nFixW){
	        	nLeft=(nFixW-w)/2;
	        	nLeft=Math.ceil(nLeft);
	        }
	    	jImg.css('left',nLeft);
	        if(h<nFixH){
	        	nTop=(nFixH-h)/2;
	        	nTop=Math.ceil(nTop);
	        }
	    	jImg.css('top',nTop);
    	}else{
    		//放大以覆盖父节点
	        if(nFixW||nFixH){
	            if(nFixW&&w!=nFixW){
	            	w=nFixW;
	            	h = Math.ceil(w / scale);
	            }
	            if(nFixH&&h<nFixH){
	            	h=nFixH;
	            	w=Math.ceil(h*scale);
	            }
	            jImg.css({width:w,height:h});
	        }
	        //居中定位
	        var nLeft=0,nTop=0;
	        if(w>nFixW){
	        	nLeft=(nFixW-w)/2;
	        	nLeft=Math.ceil(nLeft);
	        }
	    	jImg.css('left',nLeft);
	        if(h>nFixH){
	        	nTop=(nFixH-h)/2;
	        	nTop=Math.ceil(nTop);
	        }
	    	jImg.css('top',nTop);
    	}
    	
        //修正尺寸后才显示图片，避免出现图片大小变化过程
        jImg.removeClass('hui-unvisible');
		me.trigger("imgFixed",jImg);
		return {
			width:w,
			height:h,
			origW:nOrigW,
			origH:nOrigH,
			left:nLeft,
			top:nTop
		}
	}
	
	return AbstractImage;
	
});
/**
 * 图片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-07-12
 */

$Define('C.Image',
[
'C.AbstractComponent',
'C.AbstractImage'
],
function(AC,AbstractImage){
	
	var Image=AC.define('Image',AbstractImage);
	
	Image.extend({
		//初始配置
		xConfig         : {
			cls         : 'image',
			imgSrc      : '',          //图片地址
			radius      : 'normal'     //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		},
		listeners       : [{
			name:'load',
			el:'img',
			handler:function(oEvt){
				var me=this;
				var oImg=oEvt.target;
				me.fixImgSize(oImg);
			}
		}],
		
		tmpl            : '<div><img {{bindAttr src="imgSrc"}} class="hui-unvisible"/></div>'
		
	});
	
	return Image;
	
});
/**
 * 图片上传类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-07-11
 */

$Define('C.ImgUpload',
[
'C.AbstractComponent',
'U.ImgCompress',
'P.Device',
'P.Camera'
],
function(AC,ImgCompress,Device,Camera){
	
	var ImgUpload=AC.define('ImgUpload');
	
	ImgUpload.extend({
		//初始配置
		xConfig             : {
			cls             : 'img-upload',
			transparent     : false,      //是否透明
			useFileInput    : true,       //是否使用file input获取文件
			showImg         : true        //是否显示预览
		},
		
		crop                : true,      //是否需要剪切
//		cropWinW            : 100,       //裁剪窗口宽度
//		cropWinH            : 100,       //裁剪窗口高度
//		cropOptions         : {},        //裁剪选项，参照Crop类
//		compressOptions     : {}         //压缩选项，参照ImgCompress.compress方法
		
		listeners       : [{
			el   : 'input',
			name : 'change',
			handler : function(e) {
				var oInput=e.target;
				var file,name,imgSrc,oFiles;
				if(oFiles=oInput.files){
					if(oFiles.length==0){
						return;
					}
					file= oFiles[0];
					oInput.value='';
					name=file.name
					var oURL = URL || webkitURL;
					imgSrc = oURL.createObjectURL(file);
				}else{
					oInput.select(); 
					//ie9在file控件下获取焦点情况下 document.selection.createRange() 将会拒绝访问
					oInput.blur();
    				imgSrc = document.selection.createRange().text;  
					if(!imgSrc){
						return;
					}
					name=imgSrc;
				}
				if(!/.+\.(jpg|gif|png|jpeg|bmp)$/.test(name)){
					$C.Tips({text:"您选择的文件不是图片",theme:'error'});
					return;
				}
				this.processImg(imgSrc);
			}
		},{
			name:'click',
			el:'.js-file-input',
			handler:function(oEvt){
				if($H.ie()<10){
					//ie本地图片预览，http://www.cnblogs.com/yansi/archive/2013/04/14/3021199.html
					//网页端裁剪图片(FileAPI)，兼容谷歌火狐IE6/7/8，http://www.oschina.net/code/snippet_988397_33758
					//Flash头像上传新浪微博破解加强版，https://github.com/zhushunqing/FaustCplus
					oEvt.preventDefault();
					$C.Tips('上传功能暂时不支持IE9及以下版本，请使用其它浏览器，推荐chrome浏览器。')
				}
			}
		}],
		
		tmpl            : [
			'<div {{bindAttr class="transparent?hui-transparent"}}>',
				'{{#unless transparent}}',
					'<div>',
						'<img {{bindAttr class="#js-orig showImg?:hui-hide"}}/>',
					'</div>',
					'<div>',
						'<img src="" class="js-preview">',
					'</div>',
				'{{/unless}}',
				'<input type="hidden" class="js-file-content" name="fileContent">',
				'{{#if useFileInput}}',
					'<input type="file" class="js-file-input hui-file-input">',
				'{{/if}}',
			'</div>'].join(''),
		
		doConfig         : fDoConfig,           //初始化配置
		showSelDialog    : fShowSelDialog,      //显示选择照片源类型对话框
		processImg       : fProcessImg,         //处理图片
		cleanContent     : fCleanContent        //清除文件内容
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 选项
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var oCmprOptions=oSettings.compressOptions;
		var fSuccess=oCmprOptions&&oCmprOptions.success;
		me.compressOptions=$H.extend({},me.compressOptions);
		me.compressOptions.success=function(oData){
			me.findEl('.js-file-content').val(oData.clearBase64);
			fSuccess&&fSuccess(oData);
		}
		if(oSettings.useFileInput===undefined){
			me.set('useFileInput',!Device.isPhonegap());
		}
		if(!me.get('useFileInput')){
			me.listen({
				name:'click',
				handler:function(){
					me.showSelDialog();
				}
			})
		}
	}
	/**
	 * 显示选择照片源类型对话框
	 */
	function fShowSelDialog(){
		var me=this;
		var oDialog=new $C.Dialog({
			contentMsg:'上传照片',
			width:$H.em2px(15.625),
			noAction:true,
			clickHide:true,
			items:{
				xtype:'Panel',
				xrole:'dialog-content',
				items:[{
					xtype:'Button',
					text:'拍照',
					isInline:false,
					click:function(){
						Camera.getPicture({
							sourceType:'CAMERA',
							success:function (imageData) {
						   		me.processImg(imageData);
							}
						});
					}
				},{
					xtype:'Button',
					text:'相册',
					isInline:false,
					click:function(){
						Camera.getPicture({
							sourceType:'PHOTOLIBRARY',
							success:function (imageData) {
						    	me.processImg(imageData);
							}
						});
					}
				}]
			}
		})
	}
	
	/**
	 * 处理图片
	 * @param {object|string}imgSrc 图片源
	 */
	function fProcessImg(imgSrc){
		var me=this;
		if(me.crop){
			var oCropOptions=me.cropOptions||{};
			oCropOptions.imgSrc=imgSrc;
			$Require('C.CropWindow',function(CropWindow){
				var oWin=new CropWindow({
					cropOptions:oCropOptions,
					width:me.cropWinW,
					height:me.cropWinH,
					success:function(oResult){
						oWin.hide();
						var oOptions=$H.extend(oResult,me.compressOptions);
						ImgCompress.compress(imgSrc,oOptions);
					}
				});
			});
		}else{
			ImgCompress.compress(imgSrc,me.compressOptions);
		}
	}
	/**
	 * 清除文件内容
	 */
	function fCleanContent(){
		this.findEl('.js-file-content').val('');
	}
	
	return ImgUpload;
	
});
/**
 * 图片展示类，弹出展示大图片
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.DisplayImage',
[
'C.AbstractComponent',
'C.Popup',
'C.AbstractImage'
],
function(AC,Popup,AbstractImage){
	
	var DisplayImage=AC.define('DisplayImage',Popup);
	
	$H.extendIf(DisplayImage.prototype,AbstractImage.prototype);
	
	DisplayImage.extend({
		//初始配置
		xConfig         : {
			cls         : 'dispimg'
		},
		
//		imgSrc          : '',              //缩略图src
//		origSrc         : '',              //原图src
		showPos         : null,
		noMask          : true,
		isFixed         : true,

		listeners       : [{
			name:'afterShow',
			custom:true,
			handler:function(){
				var me=this;
				var oEl=me.getEl()[0];
				me.findEl('.js-loading').css({
					left:oEl.clientWidth/2-$H.em2px(1.375),
					top:oEl.clientHeight/2-$H.em2px(1.375)
				});
				me.showLoading();
				me.findEl('.js-img').attr('src',me.imgSrc);
				me.findEl('.js-orig').attr('src',me.origSrc);
			}
		},{
			name:'load',
			el:'.js-img',
			handler:function(oEvt){
				var me=this;
			    me.fixImgSize(oEvt.target,true);
			}
		},{
			name:'load',
			el:'.js-orig',
			handler:function(oEvt){
				var me=this;
				me.showLoading(false);
			    me.findEl('.js-img').addClass('hui-hidden');
				me.fixImgSize(oEvt.target,true);
			}
		}],
		tmpl        : [
			'<div class="c-v-middle-container">',
				'<span class="js-loading hui-icon hui-icon-loading hui-icon-bg hui-hidden"></span>',
				'<img class="js-img hui-unvisible"/>',
				'<img class="js-orig hui-unvisible">',
			'</div>'].join(""),
		showLoading : fShowLoading       //显示/隐藏加载提示
		
	});
	
	/**
	 * 调整图片大小以最大化适应模块大小
	 * @param {jquery}jImg 图片对象
	 */
	function fFixImgSize(jImg){
		var oImg=jImg[0];
		var oEl=this.getEl()[0];
		//先移除宽度和高度属性才能获取准确的图片尺寸
		jImg.removeAttr("width").removeAttr("height");
        var w = oImg.width,
            h = oImg.height,
            scale = w / h,
            nFixW=oEl.clientWidth,
            nFixH=oEl.clientHeight;
        if(nFixW&&w!=nFixW){
        	w=nFixW;
        	h = Math.ceil(w / scale);
        }
        if(nFixH&&h>nFixH){
        	h=nFixH;
        	w=Math.ceil(h*scale);
        }
        jImg.css({width:w,height:h});
        jImg.css("marginTop",-h/2);
        jImg.removeClass('hui-hidden');
	}
	/**
	 * 显示/隐藏加载提示
	 * @param {boolean=}bShow 仅当false隐藏
	 */
	function fShowLoading(bShow){
		var me=this;
		me.findEl('.js-loading')[bShow===false?"addClass":"removeClass"]('hui-hidden');
	}
	
	return DisplayImage;
	
});
/**
 * 图片裁剪类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Crop',
[
'C.AbstractComponent',
'C.AbstractImage',
'E.Draggable'
],
function(AC,AbstractImage,Draggable){
	
	var Crop=AC.define('Crop',AbstractImage);
	
	var _startEvent=$H.hasTouch()?'touchstart':'mousedown';
	
	Crop.extend({
		//初始配置
		xConfig         : {
			cls         : 'crop'
		},
		listeners       : [{
			name:'show',
			custom:true,
			handler:function(){
				var me=this;
				me.findEl('.js-orig-img,.js-crop-img').attr('src',me.imgSrc);
			}
		},{
			name:'load',
			el:'.js-orig-img',
			handler:function(){
				this.initCrop();
			}
		},{
			name:_startEvent,
			el:'.js-box-img',
			handler:function(){
				this.startDrag();
			}
		},{
			name:_startEvent,
			el:'.js-op-bar',
			handler:function(oEvt){
				this.startZoom(oEvt);
			}
		}],
		
		imgSrc          : '',                  //图片源
		cropWidth       : '9.375em',           //剪切框宽度
		cropHeight      : '9.375em',           //剪切框高度
//		cropImgSize     : false,               //true时裁剪框跟图片一样大小，忽略cropWidth和cropHeight的值
//		fixedScale      : 1,                   //固定宽高比
		
		tmpl            : [
			'<div>',
				'<img class="js-orig-img hui-orig-img hui-unvisible">',
				'<div class="hui-mask"></div>',
				'<div class="js-crop-box hui-crop-box">',
					'<div class="js-box-img hui-box-img">',
						'<img class="js-crop-img hui-crop-img hui-unvisible">',
					'</div>',
					'<div class="hui-box-op">',
						'<div class="hui-op-handle hui-op-handle-n"></div>',
						'<div class="hui-op-handle hui-op-handle-e"></div>',
						'<div class="hui-op-handle hui-op-handle-s"></div>',
						'<div class="hui-op-handle hui-op-handle-w"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-n"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-e"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-s"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-w"></div>',
					'</div>',
				'</div>',
			'</div>'].join(''),
		initCrop        : fInitCrop,   //初始化
		startDrag       : fStartDrag,  //点击剪切框内容，准备开始拖拽
		startZoom       : fStartZoom,  //点击剪切框边框，准备开始缩放
		move            : fMove,       //移动选择框
		dragCrop        : fDragCrop,   //拖拽选中框
		zoomCrop        : fZoomCrop,   //缩放选择框
		getResult       : fGetResult,  //获取裁剪结果
		destroy         : fDestroy     //销毁
	});
	
	/**
	 * 初始化
	 */
	function fInitCrop(){
		var me=this;
		var oImg=me.origImg=me.findEl('.js-orig-img');
		//修正图片大小
		var oSize=me.fixImgSize(oImg[0],true);
		me.origW=oSize.origW;
		me.origH=oSize.origH;
		//裁剪框大小
		if(me.cropImgSize){
			me.cropWidth=oSize.width;
			me.cropHeight=oSize.height;
		}else{
			if($H.isStr(me.cropWidth)){
				me.cropWidth=$H.em2px(me.cropWidth);
			}
			if($H.isStr(me.cropHeight)){
				me.cropHeight=$H.em2px(me.cropHeight);
			}
		}
		//图片居中显示的偏移量
		var nLeftOffset=me.leftOffset=oSize.left;
		var nTopOffset=me.topOffset=oSize.top;
		//裁剪框居中显示
		var nWidth=oSize.width;
		var nHeight=oSize.height;
		//缩放比例
		me.scale=nHeight/oSize.origH;
		var nLeft=me.cropX=Math.ceil((nWidth-me.cropWidth)/2);
		var nTop=me.cropY=Math.ceil((nHeight-me.cropHeight)/2);
		me.cropBox=me.findEl('.js-crop-box').css({
			left:nLeftOffset+nLeft,
			top:nTopOffset+nTop,
			width:me.cropWidth,
			height:me.cropHeight
		});
		//裁剪框中的图片校对位置
		me.cropImg=me.findEl('.js-crop-img').css({
			height:nHeight,
			width:nWidth,
			marginLeft:-nLeft,
			marginTop:-nTop
		}).removeClass('hui-unvisible');
		me.draggable=new Draggable(me.getEl(),{
			move:function(oPos){
				return me.move(oPos);
			},
			end:function(){
				me.dragging=false;
				me.zooming=false;
			}
		});
	}
	/**
	 * 点击剪切框内容，准备开始拖拽
	 */
	function fStartDrag(){
		var me=this;
		me.dragging=true;
		me.initCropX=me.cropX;
		me.initCropY=me.cropY;
	}
	/**
	 * 点击剪切框边框，准备开始缩放
	 * @param {jEvent}oEvt 事件对象
	 */
	function fStartZoom(oEvt){
		var me=this;
		me.zooming=true;
		me.initCropWidth=me.cropWidth;
		me.initCropHeight=me.cropHeight;
		var sCls=oEvt.currentTarget.className;
		if(sCls.indexOf('-n')>0){
			me.zoomDirect='n';
		}else if(sCls.indexOf('-e')>0){
			me.zoomDirect='e';
		}else if(sCls.indexOf('-s')>0){
			me.zoomDirect='s';
		}else{
			me.zoomDirect='w';
		}
		me.initCropX=me.cropX;
		me.initCropY=me.cropY;
	}
	/**
	 * 移动选择框
	 * @param {object}oPos 位置信息
	 */
	function fMove(oPos){
		var me=this;
		if(me.dragging){
			me.dragCrop(oPos);
		}else if(me.zooming){
			me.zoomCrop(oPos);
		}
		return false;
	}
	/**
	 * 拖拽选择框
	 * @param {object}oPos 位置信息
	 */
	function fDragCrop(oPos){
		var me=this;
		me.cropX=me.initCropX+oPos.offsetX;
		me.cropY=me.initCropY+oPos.offsetY;
		me.cropImg.css({
			marginLeft:-me.cropX,
			marginTop:-me.cropY
		});
		me.cropBox.css({
			left:me.leftOffset+me.cropX,
			top:me.topOffset+me.cropY
		});
	}
	/**
	 * 缩放选择框
	 * @param {object}oPos 位置信息
	 */
	function fZoomCrop(oPos){
		var me=this;
		var sDirection=me.zoomDirect;
		var nFixedScale=me.fixedScale;
		var nOffsetX,nOffsetY;
		if(sDirection==='n'||sDirection==='s'){
			nOffsetY=oPos.offsetY;
			nOffsetX=nFixedScale?nOffsetY*nFixedScale:oPos.offsetX;
		}else{
			nOffsetX=oPos.offsetX;
			nOffsetY=nFixedScale?nOffsetX/nFixedScale:oPos.offsetY;
		}
		//向上或向左
		if(sDirection==='n'||sDirection==='w'){
			me.dragCrop({
				offsetX:nOffsetX,
				offsetY:nOffsetY
			});
			nOffsetX=-nOffsetX;
			nOffsetY=-nOffsetY;
		}
		me.cropWidth=me.initCropWidth+nOffsetX;
		me.cropHeight=me.initCropHeight+nOffsetY;
		me.cropBox.css({
			width:me.cropWidth,
			height:me.cropHeight
		});
		return false;
	}
	/**
	 * 获取裁剪结果
	 * @return {object} {
	 * 		{number}x:起始横坐标,
	 * 		{number}y:起始纵坐标,
	 * 		{number}w:宽度,
	 * 		{number}h:高度
	 * }
	 */
	function fGetResult(){
		var me=this;
		var nScale=me.scale;
		var fCeil=Math.ceil;
		return {
			cropX:fCeil(me.cropX/nScale),
			cropY:fCeil(me.cropY/nScale),
			cropW:fCeil(me.cropWidth/nScale),
			cropH:fCeil(me.cropHeight/nScale),
			origW:me.origW,
			origH:me.origH
		};
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		me.draggable.destroy();
		me.callSuper();
	}
	
	return Crop;
	
});
/**
 * 截图窗口类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.CropWindow',
[
'C.AbstractComponent',
'C.Popup',
'C.Crop'
],
function(AC,Popup,Crop){
	
	var CropWindow=AC.define('CropWindow',Popup);
	
	CropWindow.extend({
		//初始配置
		xConfig         : {
			cls         : 'cropwin'
		},
		
		title           : '裁切图片',         //标题
//		cropOptions    : {},                //Crop组件初始化参数
//		success         : $H.noop,           //裁剪成功回调函数
		
		showPos         : null,
		noMask          : true,
		clickHide       : false,
		
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var oCrop={
			xtype:'Crop'
		};
		$H.extend(oCrop,me.cropOptions);
		me.add([{
			xtype:'Toolbar',
			title:me.title,
			isHeader:true,
			items:[{
				xtype:'Button',
				xrole:'left',
				theme:'dark',
				tType:'adapt',
				icon:'carat-l',
				click:function(){
					me.hide();
				}
			},{
				xtype:'Button',
				xrole:'right',
				theme:'dark',
				tType:'adapt',
				icon:'check',
				click:function(){
					var oResult=me.find('Crop')[0].getResult();
					me.success&&me.success(oResult);
				}
			}]
		},oCrop]);
	}
	
	return CropWindow;
	
});
/**
 * 横向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Hcard',
'C.AbstractComponent',
function(AC){
	
	var Hcard=AC.define('Hcard');
	
	Hcard.extend({
		//初始配置
		xConfig  : {
			cls       : 'hcard',
			image     : '',    //图片
			title     : '',    //标题
			titleExt  : '',    //小标题
			titleDesc : '',    //标题说明
			hasImg    : true,  //是否有图片
			txtOverflow : true, //文字超出长度显示省略号
			hasArrow  : false, //是否有右边箭头，有点击函数时默认有右箭头
			newsNum   : 0,     //新消息提示数目，大于9自动显示成"9+"
			hasBorder : false, //是否有边框
			hasImgCls    : {      //是否有图片
				depends : ['image','hasImg'],
				parse:function(val){
					return (this.get('image')||this.get('hasImg'))?'hui-hcard-hasimg':'';
				}
			},  
			newsNumTxt      : {
				depends : ['newsNum'],
				parse:function(){
					var newsNum=this.get('newsNum');
					return newsNum?newsNum>9?'9+':newsNum:0
				}
			}
		},
		defItem  : {
			xtype : 'Desc',
			xrole : 'content'
		},
		
//		imgClick        : $H.noop,        //图片点击事件函数
//		contentClick    : $H.noop,        //图片点击事件函数
		
		tmpl     : [
			'<div {{bindAttr class="hasImgCls hasBorder?hui-border hasArrow?hui-hcard-padding-right"}}>',
				'{{#if image}}',
					'<div class="hui-hcard-img js-img">',
						'<img {{bindAttr src="image"}}>',
					'</div>',
				'{{/if}}',
				'<div class="hui-hcard-content js-content">',
					'<div {{bindAttr class="#hui-content-title txtOverflow?c-txt-overflow"}}>',
						'{{title}}',
						'<span class="hui-title-ext">{{titleExt}}</span>',
						'<span class="hui-title-desc">{{titleDesc}}</span>',
					'</div>',
					'{{placeItem > [xrole=content]}}',
				'</div>',
				'{{placeItem > [xrole!=content]}}',
				'{{#if newsNumTxt}}',
					'<span class="hui-news-tips">{{newsNumTxt}}</span>',
				'{{else}}',
					'{{#if hasArrow}}',
						'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情">',
							'<span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span>',
						'</a>',
					'{{/if}}',
				'{{/if}}',
			'</div>'
		].join(''),
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		//有点击函数时默认有右箭头
		if(oSettings.click&&me.hasArrow===undefined){
			me.set('hasArrow',true);
		}
		//描述类
		var aDesc=me.desc;
		if(aDesc){
			if(aDesc.length==1){
				me.set('theme','little');
			}
			me.add(aDesc);
		}
		if(me.imgClick){
			me.listen({
				name:'click',
				selector:'.js-img',
				method:'delegate',
				handler:function(){
					me.imgClick.call(me);
				}
			})
		}
		if(me.contentClick){
			me.listen({
				name:'click',
				selector:'.js-content',
				method:'delegate',
				handler:function(){
					me.contentClick.call(me);
				}
			})
		}
	}
		
	return Hcard;
	
});
/**
 * 纵向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Vcard',
'C.AbstractComponent',
function(AC){
	
	var Vcard=AC.define('Vcard');
	
	Vcard.extend({
		//初始配置
		xConfig      : {
			cls          : 'vcard',
			hasImg       : false, //标题是否有图片
			title        : '',    //标题
			hasBorder    : false, //是否有边框
			extTitle     : ''       //标题右边文字
		},
		
//		action       : {}         //快捷指定按钮
		
		tmpl         : [
			'<div {{bindAttr class="hasBorder?hui-border"}}>',
				'<div {{bindAttr class="#hui-vcard-title hasImg?hui-title-hasimg #c-clear"}}>',
					'{{placeItem > [xrole=title]}}',
					'{{#if title}}',
						'<div class="hui-title-txt">{{title}}</div>',
					'{{/if}}',
					'{{#if extTitle}}',
						'<div class="hui-title-extra">{{extTitle}}</div>',
					'{{/if}}',
				'</div>',
				'{{placeItem > [xrole!=title][xrole!=action]}}',
				'<div class="hui-vcard-action">',
					'{{placeItem > [xrole=action]}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var oAction=oSettings.action;
		if(oAction){
			oAction=$H.extend({
				xtype:'Button',
				radius:null,
				isInline:false,
				xrole:'action'
			},oAction);
			me.add(oAction);
		}
	}
	
	return Vcard;
	
});
/**
 * 会话类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Conversation',
'C.AbstractComponent',
function(AC){
	
	var Conversation=AC.define('Conversation');
	
	Conversation.extend({
		//初始配置
		xConfig         : {
			cls         : 'conversation',
			theme       : 'left',         //会话类型，"left"左边对齐，"right"右边对齐
			time        : '',             //会话时间
			image       : '',             //头像图标
			content     : ''              //会话内容
		},
		
//		imgClick        : $H.noop,        //头像点击事件函数
		
		tmpl            : [
			'<div class="c-clear">',
				'<div class="hui-conver-time">{{time}}</div>',
				'<div class="hui-conver-img js-conver-img">',
					'{{#if image}}',
						'<img {{bindAttr src="image"}}>',
					'{{else}}',
						'{{placeItem}}',
					'{{/if}}',
				'</div>',
				'<div class="hui-conver-content">',
					'{{content}}',
					'<div class="hui-triangle">',
					'</div>',
				'</div>',
			'</div>'].join(''),
		
		doConfig        : fDoConfig
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置项
	 */
	function fDoConfig(){
		var me=this;
		me.callSuper();
		if(me.imgClick){
			me.listen({
				name:'click',
				selector:'.js-conver-img',
				method:'delegate',
				handler:function(){
					me.imgClick.call(me);
				}
			})
		}
	}
	
	return Conversation;
	
});
/**
 * 模型列表
 * ps:使用下拉刷新需要引入iScroll4
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("C.ModelList",
'C.AbstractComponent',
function(AC){
	
	var ModelList=AC.define('ModelList');
	
	ModelList.extend({
		xConfig     : {
			cls             : 'mlist',
			isEmpty         : false,             //列表是否为空
			emptyTips       : '暂无',            //空列表提示
			pdTxt           : '',               //下拉刷新提示文字
			pdComment       : '上次刷新时间：',    //下拉刷新附加说明
			pdTime          : '',                //上次刷新时间
			hasMoreBtn      : true,              //是否有获取更多按钮
			moreBtnTxt      : '查看更多',         //查看更多按钮的文字 
			showBtnIfEmpty  : false,              //空列表时是否显示更多按钮，默认不显示
			hasPullRefresh  : false,              //是否有下拉刷新
			showMoreBtn     : {
				depends : ['isEmpty','showBtnIfEmpty'],
				parse   : function(){
					return this.get('showBtnIfEmpty')||!this.get('isEmpty');
				}
			}
		},
		
		pullTxt             : '下拉可刷新',       //下拉过程提示文字
		flipTxt             : '松开可刷新',       //到松开可以执行刷新操作时的提示
		releaseTxt          : '正在刷新',         //松开时提示文字
		maxNumFromCache     : 20,                //使用缓存数据时单次最大加载数目    
		scrollPos           : 'top',             //默认滚动到的位置，'top'顶部，'bottom'底部
		pulldownIsRefresh   : true,              //true表示下拉式刷新，而按钮是获取更多，false表示相反
//		itemXtype           : '',                //子组件默认xtype
//		refresh             : null,              //刷新接口
//		getMore             : null,              //获取更多接口
		
		tmpl        : [
			'<div class="hui-list">',
				'<div class="hui-list-inner">',
					'{{#if hasPullRefresh}}',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle">',
								'<span class="hui-icon hui-alt-icon hui-icon-arrow-d hui-light"></span>',
								'<span class="hui-icon hui-alt-icon hui-icon-loading-mini"></span>',
								'<div class="hui-pd-txt">',
									'{{#if pdTxt}}<div class="js-txt">{{pdTxt}}</div>{{/if}}',
									'{{#if pdComment}}',
										'<div class="js-comment hui-pd-comment">',
										'<span class="js-pdComment">{{pdComment}}</span>',
										'<span class="js-pdTime">{{pdTime}}</span>',
										'</div>',
									'{{/if}}',
								'</div>',
							'</div>',
						'</div>',
					'{{/if}}',
					'{{#if isEmpty}}',
						'<div class="hui-list-empty js-empty">{{emptyTips}}</div>',
					'{{/if}}',
					'<div class="hui-list-container js-item-container">{{placeItem}}</div>',
					'{{#if hasMoreBtn}}',
						'<div {{bindAttr class="#hui-list-more showMoreBtn:hui-hidden"}}>',
							'<a href="javascript:;" hidefocus="true" class="hui-btn hui-btn-gray hui-shadow hui-inline hui-radius-little">',
								'<span class="hui-btn-txt">{{moreBtnTxt}}</span>',
							'</a>',
						'</div>',
					'{{/if}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig            : fDoconfig,           //初始化配置
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem,     //删除列表项
		refreshScroller     : fRefreshScroller,    //刷新iScroll
		lazyRefresh         : fLazyRefreshScroller,//懒刷新iScroll
		scrollTo            : fScrollTo,           //滚动到指定位置
		loadMore            : fLoadMore,           //获取更多数据
		pullLoading         : fPullLoading,        //显示正在刷新
		destroy             : fDestroy             //销毁
	});
	/**
	 * 初始化配置
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		me.set('pdTxt',me.pullTxt);
		if(me.itemXtype){
			(me.defItem||(me.defItem={})).xtype=me.itemXtype;
		}
		var oListItems=me.model;
		if(oListItems.size()==0){
			me.set('isEmpty',true);
		}else{
			me.loadMore();
		}
		me.listenTo(oListItems,{
			'add':function(sEvt,oListItem){
				me.addListItem(oListItem);
			},
			'remove':function(sEvt,oListItem){
				me.removeListItem(oListItem);
			},
			'sortItem':function(sEvt,oListItem,nNewIndex,nOldIndex){
				var oView=me.find(function(oView){
					return oView.model&&oView.model.id==oListItem.id;
				});
				oView=oView[0];
				var oEl=oView.getEl();
				var oParent=oEl.parent();
				var oTmp=oParent.children('div').eq(nNewIndex);
				oTmp.before(oEl);
			},
			'reset':function(){
				me.removeListItem('emptyAll');
			},
			'sync':function(){
				if(oListItems.size()===0){
					me.set('isEmpty',true);
				}
			}
		});
		//下拉刷新
		var bHasPd=me.hasPullRefresh&&window.iScroll&&!$H.ie();
		me.set('hasPullRefresh',bHasPd);
		if(bHasPd){
			//如果在afterShow里初始化iScroll，会看见下拉刷新的元素，所以这里先初始化，afterShow时再调用refresh
			me.listen({
				name : 'afterRender',
				handler : function(){
					var me=this;
					var oWrapper=me.getEl();
					var oPdEl=oWrapper.find('.hui-list-pulldown');
					var nStartY=$H.em2px(3.125);
					var nValve=$H.em2px(0.313);
					var sRefreshCls='hui-pd-refresh';
					var sReleaseCls='hui-pd-release';
					me.scroller= new window.iScroll(oWrapper[0], {
						useTransition: true,
						topOffset: nStartY,
						//bounce:false,
						//bounceLock:true,
						mouseWheel:true,
						vScrollbar:false,
						onRefresh: function () {
							if(oPdEl.hasClass(sRefreshCls)){
				                oPdEl.removeClass(sRefreshCls+' '+sReleaseCls);  
				                me.set('pdTxt',me.pullTxt);  
							}
						},
						onScrollMove: function () {
							if (this.y > nValve && !oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sReleaseCls);  
				                me.set('pdTxt',me.flipTxt);  
								this.minScrollY = 0;
				            } else if (this.y < nValve && oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.removeClass(sReleaseCls);;  
				                me.set('pdTxt',me.pullTxt); 
								this.minScrollY = -nStartY;
				            } 
						},
						onScrollEnd: function () {
							if (oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sRefreshCls);  
				                me.set('pdTxt',me.releaseTxt); 
				                me.pulldownIsRefresh?me.refresh():me.loadMore();
				            }
						}
					});
				}
			});
			//同步数据后需要刷新
			me.listenTo(me.model,'sync',function(){
				me.set('pdTime',$H.formatDate($H.now(),'HH:mm'));
				me.lazyRefresh();
			});
			//show后需要refresh下，否则无法滚动，iscroll需要浏览器渲染后才能正常初始化
			me.listen({
				name:'afterShow',
				handler:function(){
					me.lazyRefresh();
					if(me.scrollPos=='bottom'){
						setTimeout(function(){
							me.scrollTo('bottom');
						},0);
					}
				}
			});
		}
		
		if(me.get('hasMoreBtn')){
			me.listen({
				name    : 'click',
				method : 'delegate',
				selector : '.hui-list-more',
				handler : function(){
					me.pulldownIsRefresh?me.loadMore():me.refresh();
				}
			});
		}
	}
	/**
	 * 添加列表项
	 * @param {Object}oListItem 列表项模型
	 * @param {number=}nIndex 指定添加位置
	 */
	function fAddListItem(oListItem,nIndex){
		var me=this;
		me.set('isEmpty',false);
		if(nIndex===undefined){
			nIndex=me.model.indexOf(oListItem);
			//可能有缓存数据没有加载到视图中
			var nCurLen=me.inited?me.children.length:me.items.length;
			nIndex=nIndex>nCurLen?nCurLen:nIndex;
		}
		me.add({
			model:oListItem
		},nIndex);
		me.lazyRefresh();
	}
	/**
	 * 删除列表项
	 * @param {Object}oListItem 列表项模型
	 */
	function fRemoveListItem(oListItem){
		var me=this;
		if(oListItem=='emptyAll'){
			me.remove(me.children);
		}else{
			me.remove(function(oView){
				return oView.model&&oView.model.id==oListItem.id;
			});
		}
		if(me.children.length==0){
			me.set('isEmpty',true);;
		}
		me.lazyRefresh();
	}
	/**
	 * 刷新iScroll
	 */
	function fRefreshScroller(){
		var me=this;
		//仅在页面显示时才刷新，否则scroller会不可用
		if(me.scroller&&me.getEl()[0].clientHeight){
	    	me.scroller.refresh();
		}
	}
	/**
	 * 懒刷新iScroll，多次调用此方法只会执行一次实际刷新
	 */
	function fLazyRefreshScroller(){
		var me=this;
		if(me._toRefresh){
			return;
		}
		me._toRefresh=1;
		setTimeout(function(){
			me._toRefresh=0;
			me.refreshScroller();
		},0);
	}
	/**
	 * 滚动到指定位置
	 * @param {string|number}pos 位置，字符串参数：'top'表示顶部，'bottom'表示底部，数字参数表示横坐标
	 * @param {number=}pageY 纵坐标
	 * @param {number=}nTime 动画时间
	 */
	function fScrollTo(pos,pageY,nTime){
		var me=this;
		if(!me.scrollToTimer){
			var aArgs=arguments;
			//dom有改变时，不延迟的话，scrollTo无效
			me.scrollToTimer=setTimeout(function(){
				me.scrollTo.apply(me,aArgs);
				me.scrollToTimer=null;
			},0);
			return;
		}
		var oScroller=me.scroller;
		if($H.isStr(pos)){
			if(pos=='top'){
				oScroller.scrollTo(0,-$H.em2px(3.125));
			}else if(pos=='bottom'){
				var nHeight=me.findEl('.hui-list-inner')[0].clientHeight;
				oScroller.scrollTo(0,-nHeight);
			}
		}else{
			oScroller.scrollTo(pos,pageY,nTime);
		}
	}
	/**
	 * 获取更多数据
	 */
	function fLoadMore(){
		var me=this;
		var oListItems=me.model;
		var nCurNum=me.children.length;
		var nSize=oListItems.size();
		if(nSize>nCurNum){
			//先尝试从缓存中获取
			var nMax=me.maxNumFromCache,nStart=nCurNum,nEnd=nCurNum+nMax;
			if(me.pulldownIsRefresh){
				oListItems.each(function(i,item){
					if(i>=nStart&&i<nEnd){
						me.addListItem(item);
					}
				});
			}else{
				nEnd=nSize-nCurNum;
				nStart=nEnd-nMax;
				oListItems.eachDesc(function(i,item){
					if(i>=nStart&&i<nEnd){
						me.addListItem(item,0);
					}
				});
			}
			me.lazyRefresh();
		}else{
			me.getMore();
		}
	}
	/**
	 * 显示正在刷新
	 * @param{boolean=}bRefresh 仅当true时执行刷新
	 */
	function fPullLoading(bRefresh){
		var me=this;
		var oScroller=me.scroller;
		var tmp=oScroller.minScrollY;
		oScroller.minScrollY=$H.em2px(0.625);
		if(bRefresh){
			var oPdEl=me.findEl('.hui-list-pulldown');
			oPdEl.addClass('hui-pd-release');
		}
		oScroller.scrollTo(0,0,200);
		setTimeout(function(){
			oScroller.minScrollY=tmp;
		},1000);
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		if(me.scroller){
			me.scroller.destroy();
			me.scroller=null;
		}
		me.callSuper();
	}
	
	return ModelList;
});
/**
 * 编辑器类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-09-11
 */
$Define('C.Editor',
'C.AbstractComponent',
function(AC){
	
	var Editor=AC.define('Editor');
	
	Editor.extend({
		//初始配置
		xConfig         : {
			cls         : 'editor',
			name        : '',
			value       : ''                 //默认值
		},
		listeners       : [{
			name:'afterRender',
			custom:true,
			handler:function(){
				this.makeEditable();
			}
		}],
		
		color           : '#333',
		fontSize        : '1em',
		fontFamily      : 'tahoma,arial,sans-serif',
		value           : '',
		
		tmpl            : [
			'<div>',
				'<iframe class="hui-editor-iframe" hideFocus=true frameborder=0></iframe>',
				'{{textarea class="#hui-editor-textarea" name="name" placeholder="placeholder" value=value}}',
			'</div>'].join(''),
		
		getInitHtml     : fGetInitHtml,       //获取初始化编辑框的html字符串
		makeEditable    : fMakeEditable,      //使iframe可编辑
		val             : fVal,               //设置/读取内容
		sync            : fSync               //同步textarea
	});
	
	/**
	 * 获取初始化编辑框的html字符串
	 * @param {object}oParams {
	 * 				fontsize:默认文字大小,
	 *              forecolor:默认文字颜色,
	 *              fontname:默认字体,
	 *              content:html内容
	 *           }
	 * @return {string}返回初始化编辑框的html字符串
	 */
	function fGetInitHtml() {
		var me=this;
		// 初始化时添加空div是为了解决ie默认的换行问题：默认情况下的换行是<p>，而把内容放在div里，默认换行是div
		return '<head><style>\
				html{word-wrap:break-word;}\
				body{color:'
				+ me["color"]
				+ ';font-size:'
				+ me["fontSize"]
				+ ';font-family:'
				+ me["fontFamily"]
				+ ';line-height:1.7;padding:0.5em 0.625em;margin:0;\
				background-color:#ffffff;}\
				img{max-width:100%;}\
				pre{\
					white-space: pre-wrap; /* css-3 */\
					white-space: -moz-pre-wrap; /* Mozilla, since 1999 */\
					white-space: -pre-wrap; /* Opera 4-6 */\
					white-space: -o-pre-wrap; /* Opera 7 */\
					word-wrap: break-word; /* Internet Explorer 5.5+ */\
					/* white-space : normal ;Internet Explorer 5.5+ */\
					font-family:arial;\
				}\
				span.typoRed{border-bottom:0.125em dotted #ff0000;cursor:pointer;}\
				</style></head><body>'+(me["value"]||'')+'</body>';
	}
	/**
	 * 使iframe可编辑
	 */
	function fMakeEditable() {
		var me=this;
		var oIframe=me.findEl('iframe')[0];
		var oWin = me.ifrWin=oIframe.contentWindow||oIframe.window;
		var oDoc = me.ifrDoc=oWin.document;
		var sHtml=me.getInitHtml();
		oDoc.open("text/html", "replace");
		oDoc.writeln(sHtml);
		oDoc.close();
		// that.win.document.charset = "gb2312";
		// 打开编辑模式
		if ($H.ie()) {
			if (Browser.ie() == "5.0") {
				oDoc.designMode = 'on';
			} else {
				oDoc.body.contentEditable = true;
				//TODO ie7聚焦问题
			}
		} else {
			oDoc.designMode = 'on';
			oDoc.execCommand("useCSS", false, true);
		}
		me.ifrBody=oDoc.body;
	}
	/**
	 * 获取/设置值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		var oBody=me.ifrBody;
		if(sValue===undefined){
			return oBody.innerHTML;
		}else{
			oBody.innerHTML=sValue;
		}
	}
	/**
	 * 同步textarea
	 */
	function fSync(){
		var me=this;
		var sValue=me.val();
		me.findEl('textarea').val(sValue);
	}
	
	return Editor;
	
});
/**
 * 社会化分享类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Share',
'C.AbstractComponent',
function(AC){
	
	var Share=AC.define('Share');
	
	Share.extend({
		//初始配置
		xConfig         : {
			cls         : 'share'
//			title       : '',           //分析标题
//			summary     : '',           //分享内容摘要
		},
		
//		url             : '',           //分享
		
		listeners       : [{
			name:'afterRender',
			custom:true,
			handler:function(){
				var me=this;
				$Require('http://static.bshare.cn/b/buttonLite.js#style=-1&uuid=f19aa603-e8fa-437c-8069-f5a12dff7e4e',
				function(){
					bShare.init();
					me.listen({
						name:'click',
						selector:'a',
						method:'delegate',
						handler:function(oEvt){
							var oEntry={
						        title:me.get('title')||document.title, // 获取文章标题
						        url:me.url||location.href,	// 获取文章链接
						        summary:me.get('summary')||''	// 从postBody中获取文章摘要
						    };
							if(me.getEntry){
								var oEnt=me.getEntry();
								$H.extend(oEntry,oEnt);
							}
							bShare.entries=[];
							//oEntry.url=encodeURIComponent(oEntry.url);
							bShare.addEntry(oEntry);
						    var sName=oEvt.currentTarget.className;
						    if(sName==='more'){
						    	bShare.more();
						    }else{
							    bShare.share(oEvt.originalEvent,sName);
						    }
						}
					})
				});
			}
		}],
		
		tmpl            : [
			'<div>',
				'<ul class="bshare c-clear">',
					'<li>分享到:</li>',
					'<li><a title="分享到微信" class="weixin" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/weixin.gif "/></a></li>',
					'<li><a title="分享到新浪微博" class="sinaminiblog" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/sinaminiblog.gif "/></a></li>',
					'<li><a title="分享到QQ空间" class="qzone" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/qzone.gif "/></a></li>',
					'<li><a title="分享到人人网" class="renren" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/renren.gif "/></a></li>',
					'<li><a title="分享到豆瓣"  class="douban" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/douban.gif "/></a></li>',
					'<li><a title="更多" class="more" href="javascript:void(0);" ><img src="http://static.bshare.cn/frame/images/logos/s4/more-style-addthis.png"/></a></li>',
					'<li><a class="bshareDiv" href="http://www.bshare.cn/share"></a></li>',
				'</ul>',
			'</div>'
		].join('')
		
	});
	
	return Share;
	
});
/**
 * 图片展示卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-20
 */

$Define('C.PicCard',
'C.AbstractComponent',
function(AC){
	
	var PicCard=AC.define('PicCard');
	
	PicCard.extend({
		//初始配置
		xConfig             : {
			cls             : 'picard',
			radius          : 'normal',
			shadowOverlay   : true,
			headerImg       : '',             //头部展示图片
			desc            : '',             //中间描述文字
			avatar          : '',             //用户头像
			userName        : '',             //用户名
			opDesc          : '',             //操作描述
			opNum           : 0               //赞次数
		},
		
		listeners           : [{
			name:'mouseover',
			el:'.js-header',
			handler:function(oEvt){
				$(oEvt.currentTarget).addClass('hui-hover');
			}
		},{
			name:'mouseout',
			el:'.js-header',
			handler:function(oEvt){
				$(oEvt.currentTarget).removeClass('hui-hover');
			}
		},{
			name:'click',
			selector:'.js-avatar',
			method:'delegate',
			handler:function(){
				this.avatarClick&&this.avatarClick();
			}
		},{
			name:'click',
			selector:'.js-op',
			method:'delegate',
			handler:function(){
				this.opClick&&this.opClick();
			}
		}],
		
		tmpl            : [
		'<div>',
			'<div class="js-header hui-picard-header">',
				'<a href="javascript:;" hidefocus="true" class="hui-header-img">',
					'<img class="js-header-img" {{bindAttr src="headerImg"}}/>',
				'</a>',
				'<div class="hui-header-op">',
					'<div class="hui-mask"></div>',
					'<div class="hui-op-container c-h-middle-container">',
						'{{placeItem > [xrole=headerOp]}}',
					'</div>',
				'</div>',
			'</div>',
			'<div class="hui-picard-footer">',
				'<div class="hui-picard-desc c-comment">{{desc}}</div>',
				'<div class="hui-picard-op c-clear">',
					'<a class="js-avatar hui-op-avatar" href="javascript:;" hidefocus="true">',
						'<div class="hui-avatar hui-radius-large">',
							'<div class="hui-avatar-img hui-radius-large">',
								'<img {{bindAttr src="avatar"}}>',
							'</div>',
						'</div>',
						'<span class="hui-op-link">{{userName}}</span>',
					'</a>',
					'<span class="hui-op-desc">{{opDesc}}</span>',
					'<a class="js-op hui-op-like" href="javascript:;" hidefocus="true">',
						'<span class="hui-op-num">{{opNum}}</span>',
						'<span class="hui-icon hui-alt-icon hui-radius-big hui-icon-heart hui-light"></span>',
					'</a>',
				'</div>',
			'</div>',
		'</div>'].join('')
	});
	
	return PicCard;
	
});
/**
 * 瀑布流类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-20
 */

$Define('C.Waterfall',
'C.AbstractComponent',
function(AC){
	
	var Waterfall=AC.define('Waterfall');
	
	Waterfall.extend({
		//初始配置
		xConfig             : {
			cls             : 'wfall'
		},
		
	    columnCount     : 0,    //列数
	    columnWidth     : 220,  //每列宽度
	    columnGap       : 15,   //每列间隔距离(PS：这里指定的是相邻两栏间隔的一半)
		
		listeners       : [{
			name:'resize',
			el:$(window),
			handler:function(){
				this.range();
			}
		},{
			name:'scroll',
			el:$(window),
			handler:function(){
				var me=this;
				var nScroll=document.documentElement.scrollTop || document.body.scrollTop;
				var nWinHeight=$(window).height();
				if((!me._lastScroll||Math.abs(me._lastScroll-nScroll)>150)&&nScroll+nWinHeight>me.height-50){
					var nIndex=me.children.length;
					me._lastScroll=nScroll;
					me.add(me.getMore());
					me.range(nIndex);
				}
			}
		}],
		
		doConfig        : fDoConfig,           //初始化配置
		range           : fRange               //计算并排列子组件
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.listen({
			name:'afterShow',
			custom:true,
			times:1,
			handler:function(){
				me.range();
			}
		});
		me.callSuper([oSettings]);
	}
	/**
	 * 计算并排列子组件
	 * @param {number=}nIndex 排序起始索引，默认是0
	 * @param {boolean=}bForce 强制排序
	 */
	function fRange(nIndex,bForce){
		var me=this;
		nIndex=nIndex||0;
		var nCGap=me.columnGap;
		var nCWidth=me.columnWidth;
		var num=me.columnCount;
		var aChildren=me.children;
		var aHeights=me.columnHeights;
		var nContainerHeight=0;
		//计算列数
		if(nIndex===0||bForce){
			var nWidth=me.getEl()[0].offsetWidth;
			num=Math.floor(nWidth/(nCWidth+nCGap*2));
			//列数不变不需修改
			if((num===me.columnCount||num===0)&!bForce){
				return;
			}
			me.columnCount=num;
			aHeights=me.columnHeights=[];
			for(var i=0;i<num;i++){
				aHeights.push(0);
			}
		}
		
		for(var i=nIndex,len=aChildren.length;i<len;i++){
			var oItem=aChildren[i];
			var nMin=0;
			for(var j=1,l=num;j<l;j++){
				if(aHeights[nMin]>aHeights[j]){
					nMin=j;
				}
			}
			var nLeft=nCGap+nMin*(nCWidth+nCGap*2);
			var nTop=nCGap+aHeights[nMin];
			var oEl=oItem.getEl();
			oEl.css({
				left:nLeft,
				top:nTop
			});
			var h=aHeights[nMin]=nTop+oEl[0].offsetHeight+nCGap;
			nContainerHeight=nContainerHeight>h?nContainerHeight:h;
			me.height=nContainerHeight;
		}
		me.getEl().css({height:me.height});
	}
	
	return Waterfall;
	
});
/**
 * 幻灯片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-21
 */

$Define('C.Slide',
'C.AbstractComponent',
function(AC){
	
	var Slide=AC.define('Slide');
	
	Slide.extend({
		//初始配置
		xConfig         : {
			cls         : 'slide',
			pics        : []
		},
		
		height          : $H.em2px(20), 
		timeout         : 3000,        //播放时间间隔
		
		listeners       : [{
			name        : 'afterRender',
			handler     : function(){
				this.autoSlide();
			}
		},{
			name        : 'mouseover',
			handler     : function(){
				this.autoSlide(true);
			}
		},{
			name        : 'mouseout',
			handler     : function(){
				this.autoSlide();
			}
		},{
			name:'click',
			selector:'.js-op',
			method:'delegate',
			handler:function(oEvt){
				var me=this;
				var oCur=oEvt.currentTarget;
				me.findEl('.js-op').each(function(i,el){
					if(el===oCur){
						me.slide(i);
						return false;
					}
				})
			}
		}],
		
		tmpl            : [
			'<div class="hui-slide">',
				'<div class="hui-slide-cont">',
					'{{#each pics}}',
						'<div {{bindAttr class="#js-pic #hui-cont-pic active:hui-hidden"}}>',
							'<img class="hui-pic-img" {{bindAttr src="img"}}/>',
							'<h1 class="hui-pic-desc">{{title}}</h1>',
						'</div>',
					'{{/each}}',
				'</div>',
				'<div class="hui-slide-op">',
					'{{#each pics}}',
						'<a href="javascript:;" hidefocus="true" {{bindAttr class="#js-op #hui-op-btn active?hui-active"}}></a>',
					'{{/each}}',
				'</div>',
			'</div>'
		].join(''),
		
		doConfig        : fDoConfig,          //初始化配置
		slide           : fSlide,             //转换到指定页
		autoSlide       : fAutoSlide,         //自动转换
		destroy         : fDestroy            //销毁
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		var aPics=oSettings.pics;
		aPics[0].active=true;
		me.callSuper([oSettings]);
	}
	/**
	 * 转换到指定项
	 * @param {number=}nIndex 指定要切换到的索引，默认为下一张
	 */
	function fSlide(nIndex){
		var me=this;
	 	var aPics=me.findEl('.js-pic');
	 	var aOps=me.findEl('.js-op');
 		var sCls='hui-hidden';
 		var sActiveCls='hui-active';
 		var nWidth=me.getEl()[0].clientWidth;
	 	aPics.each(function(i,el){
	 		var jEl=$(el);
	 		if(!jEl.hasClass(sCls)){
	 			jEl.animate({
	 				left:-nWidth
	 			},function(){
		 			$(aOps[i]).removeClass(sActiveCls);
		 			jEl.addClass(sCls);
	 			});
	 			if(nIndex===undefined){
	 				nIndex=i==aPics.length-1?0:i+1;
	 			}
	 		}
	 	});
	 	var oActive=$(aPics[nIndex]);
	 	oActive.css({left:nWidth}).removeClass(sCls).animate({
	 		left:0
	 	},function(){
			$(aOps[nIndex]).addClass(sActiveCls);
	 	})
	}
	/**
	 * 自动转换
	 * @param{boolean=}bStop 仅当为true时停止自动播放
	 */
	function fAutoSlide(bStop){
		var me=this;
		if(bStop){
			clearTimeout(me.slideTimer);
			return;
		}
		me.slideTimer=setTimeout(function(){
			me.slide();
			me.autoSlide();
		},me.timeout)
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		clearTimeout(me.slideTimer);
		me.callSuper();
	}
	
	return Slide;
	
});
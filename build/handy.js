/* Handy v1.0.0-dev | 2014-05-22 | zhengyinhui100@gmail.com */
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
			if('Browser,Class,Array,Geo,Cookie,Date,Events,Function,Json,Object,String,Template,Util'.indexOf(sName)>=0){
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
	
})();/**
 * Json类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
 //参考：https://github.com/douglascrockford/JSON-js/blob/master/json2.js
 //https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/JSON
handy.add('Json',function($H){
	
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
});/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Object',function($H){
	
	var Object={
		_alias              : {                 //存储别名，公共库建议大写，以便更好地与普通名称区别开，具体项目的别名建议小写
			'B'             : 'handy.base',
			'C'             : 'handy.component',
			'M'             : 'handy.module',
			'CM'            : 'handy.common'
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
	
	var wObject=window.Object;
	
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
        //改这里eval的代码须考虑压缩的因素
        if(!bIsCreate){
        	oObject=eval('(function(){if (typeof ' + root + ' != "undefined")return ' + root + ';})()');
        }else{
	        oObject=eval('(function(){if (typeof ' + root + ' == "undefined"){' + root + ' = {};}return ' + root + ';})()');  
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
    	return oObject;
	}
	/**
	 * 创建别名/读取实名，别名没有对应的存储空间，需要先转换为原始名字才能获取对应的存储空间，
	 * Loader自动会优先尝试转换别名，因此，别名不能与现有的命名空间重叠
	 * @method alias
	 * @param {string=}sAlias 别名，如'B.Object'，为空时表示读取所有存储的别名
	 * @param {string=}sOrig 原名，如'handy.base.Object'，为空时表示读取实名
	 */
	function fAlias(sAlias,sOrig){
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
			var sName=sAlias,nIndex=sAlias.length-1,sSuffix='';
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
						if(bAddMeta&&Object.isFunc(value)){
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
    * 对比对象值是否相同
    * @method equals
    * @param {Object} o1 对象1
    * @param {Object} o2 对象2
    * @return {boolean} 返回判断结果
    */
    function fEquals(o1, o2) {
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
			if (Constructor != wObject && Constructor != window.Array){
				return oFrom;
			}else{

				if (Constructor == window.Date || Constructor == window.RegExp || Constructor == window.Function ||
					Constructor == window.String || Constructor == window.Number || Constructor == window.Boolean){
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
    	var aMatch=window.navigator.userAgent.match(/MSIE ([\d.]+)/);
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
	
});/**
 * 浏览器环境类，分析浏览器类型、版本号、操作系统、内核类型、壳类型、flash版本
 * 浏览器版本，$H.Browser.ie/firefox/chrome/opera/safari(),如果浏览器是IE的，$H.Browser.ie()的值是浏览器的版本号，!$H.Browser.ie()表示非IE浏览器
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Browser","handy.base.Object",function(Object,$H){

	var _oInfo={};
	
	var Browser={};
	
	//归纳生成方法，如：Browser.ie()返回ie的版本号(默认返回整型，传入true参数时返回实际版本号，如：'20.0.1132.43')，Browser.windows()返回是否是windows系统
	Object.generateMethod(Browser,[
			'ie','firefox','chrome','safari','opera',   //浏览器版本，@return{number|string}
			'windows','linux','mac',                    //操作系统，@return{boolean}
			'trident','webkit','gecko','presto',        //浏览器内核类型，@return{boolean}
			'sogou','maxthon','tt','theWorld','is360',  //浏览器壳类型，@return{boolean}
			'mobile',                                   //移动设备类型，@return{string}'ios'|'android'|'nokian'|'webos'
			'android','ios',                            //android或者ios版本，@return{string}
			'iPhone','iPod','iPad',                     //ios设备版本，@return{string}
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
		if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]){
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
			} else if (/ Android/i.test(ua)) {
				if (/Mobile/.test(ua)) {
					_oInfo.mobile = 'android';
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
	
});/**
 * 调试类，方便各浏览器下调试，在发布时统一删除调试代码，所有的输出和调试必须使用此类的方法，
 * 不得使用console等原生方法，发布到线上时需要把除了需要反馈给服务器的方法外的方法统一过滤掉
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Debug",['handy.base.Json','handy.base.Browser'],function(Json,Browser,$H){
	
	var Debug={
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
					'<a href="javascript:void(0)" onclick="if(this.innerHTML==\'全屏\'){this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';this.innerHTML=\'收起\'}else{this.parentNode.style.height=\'100px\';this.innerHTML=\'全屏\';}">收起</a>',
					'<a href="javascript:void(0)" onclick="var oDv=this.parentNode.getElementsByTagName(\'div\')[0];if(this.innerHTML==\'底部\'){oDv.scrollTop=oDv.scrollHeight;this.innerHTML=\'顶部\';}else{oDv.scrollTop=0;this.innerHTML=\'底部\';}">顶部</a>',
					'<a href="javascript:void(0)" onclick="location.reload();">刷新</a>',
					'<a href="javascript:void(0)" onclick="history.back();">后退</a>'
				].join('&nbsp;&nbsp;&nbsp;&nbsp;')+'<div style="padding-top:5px;height:90%;overflow:auto;"></div>';
				oDebugDiv.style.position = 'fixed';
				oDebugDiv.style.width = '100%';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '100%';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '12px';
				oDebugDiv.style.padding = '10px';
				oDebugDiv.style.zIndex = 9999999999;
				oDebugDiv.style.opacity=0.95;
				oDebugDiv.style.filter="alpha(opacity=95)";
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
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
		if(oVar instanceof Error){
			//抛出异常，主要是为了方便调试，如果异常被catch住的话，控制台不会输出具体错误位置
			throw oVar;
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
		if(bOut){
			if(typeof sMsg=='boolean'){
				bShowInPage=sMsg;
				sMsg='';
			}
			Debug.out((sMsg||'')+(new Date().getTime()-(Debug.lastTime||0)),!!bShowInPage)
		}else{
			Debug.lastTime=new Date().getTime();
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
	
});/**
 * 函数类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Function',function($H){
	
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
		return fExecFunc;
	}
	
	return Function;
	
});/**
 * 面向对象支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Class",["B.Object",'B.Debug'],function(Object,Debug,$H){
	
	var CL={
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
        	var cChild=CL.createClass();
        	CL.inherit(cChild,this,oProtoExtend,oStaticExtend,oExtendOptions);
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
	
	return CL;
	
});/**
 * 资源加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Loader",
["B.Debug","B.Object","B.Function"],
function(Debug,Object,Function,$H){
	
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
//		rootPath                : {
//			'handy'        : 'http://localhost:8081/handy/src',
//			'com.example'  : 'http://example.com:8082/js'
//		},                       //根url，根据命名空间前缀匹配替换，如果没有匹配则是空字符串''；如果rootPath是字符串则直接使用
		timeout                 : 15000,
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
//		urlMap                  : {
//			'example':{
//				url       : 'http://url',     //url
//				chkExist  : function(){return true}    //验证此资源是否存在的方法
//			}
//		},                       //自定义资源配置   
		
	    showLoading				: function(bIsLoading){},	//加载中的提示，由具体逻辑重写
		define                  : fDefine,                  //定义资源资源
	    require                 : fRequire                  //获取所需资源后执行回调
	}
	
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
    		if(/\.(css|js)$/.test(sId)){
    			return _oCache[sId]&&_oCache[sId].status=='loaded';
    		}else if(Loader.urlMap&&Loader.urlMap[sId]){
    			//自定义资源使用自定义方法验证
    			return Loader.urlMap[sId].chkExist();
    		}else{
    			//标准命名空间规则验证
	    		return Object.ns(sId);
    		}
    	}
    	var oResult={}
    	var aExist=[];
    	if(typeof id=="string"){
    		id=[id];
    	}
    	for(var i=0,nLen=id.length;i<nLen;i++){
    		var result=_fChk(id[i]);
    		if(!result){
    			oResult.notExist=id[i];
    			return oResult;
    		}else{
    			aExist.push(result);
    		}
    	}
    	oResult.exist=aExist;
    	return oResult;
    }
    
    /**
	 * 通过id获取实际url
	 * @method _fGetUrl
	 * @param {string}sId 资源id，可以是命名空间，也可以是url
	 * @return {string}sUrl 实际url
	 */
    function _fGetUrl(sId){
    	var sUrl=Loader.urlMap&&Loader.urlMap[sId]&&Loader.urlMap[sId].url;
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
    		if(/.css$/.test(sId)){
    			sUrl=sId.indexOf('/')==0?sId:"/css/"+sId;
    		}else if(/.js$/.test(sId)){
    			//js文件
    			sUrl=sId;
    		}else{
    			//命名空间
    			sUrl=sId.replace(/\./g,"/")+".js";
    		}
    		sUrl=sRoot.replace(/\/$/,'')+'/'+sUrl.replace(/^\//,'');
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
				_eHead.removeChild(eNode);
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
				var _fCallback=Function.bind(_fResponse,null,sId);
	    		if(Loader.traceLog){
					Debug.log(_LOADER_PRE+"request:\n"+sUrl);
		   		}
	    		if(/.css$/.test(sUrl)){
	    			_fGetCss(sUrl,_fCallback);
	    		}else{
	    			_fGetScript(sUrl,_fCallback) ;
	    		}
	    		_requestingNum++;
    		}
    	}
    	//提示loading
    	if(bNeedRequest){
    		Loader.showLoading(true);
    	}
    }
    /**
	 * 资源下载完成回调
	 * @method _fResponse
	 * @param {string}sId 资源id
	 */
    function _fResponse(sId){
    	Loader.showLoading(false);
    	_requestingNum--;
    	_oCache[sId].status='loaded';
    	if(Loader.traceLog){
			Debug.log(_LOADER_PRE+"Response:\n"+sId);
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
	    	if(!oResult.notExist){
	    		_aContext.splice(i,1);
	    		oContext.callback.apply(null,oResult.exist);
	    		//定义成功后重新执行上下文
	    		_fExecContext();
	    		break;
	    	}else if(i==0&&_requestingNum==0){
	    		Debug.error(_RESOURCE_NOT_FOUND+oResult.notExist);
	    	}
   		}
    }
    /**
	 * 定义loader资源
	 * @method define(sId,aDeps=,factory)
	 * @param {string}sId   资源id，可以是id、命名空间，也可以是url地址（如css）
	 * @param {Array=}aDeps  依赖的资源
	 * @param {*}factory  资源工厂，可以是函数，也可以是字符串模板
	 * @return {number}nIndex 返回回调索引
	 */
	function fDefine(sId,aDeps,factory){
		//读取实名
		sId=$H.Object.alias(sId);
		var nLen=arguments.length;
		if(nLen==2){
			factory=aDeps;
			aDeps=[];
		}
		Loader.require(aDeps,function(){
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
				Debug.error(_LOADER_PRE+'factory no return:\n'+sId);
			}
		});
	}
    /**
	 * 加载所需的资源
	 * @method require(id,fCallback=)
	 * @param {string|array}id    资源id（数组）
	 * @param {function()=}fCallback(可选) 回调函数
	 * @return {any}返回最后一个当前已加载的资源，通常用于className只有一个的情况，这样可以立即通过返回赋值
	 */
    function fRequire(id,fCallback){
    	var aIds=typeof id=="string"?[id]:id;
    	//此次required待请求资源数组
    	var aRequestIds=[];
    	//已加载的资源
    	var aExisteds=[];
    	//是否保存到上下文列表中，保证callback只执行一次
    	var bNeedContext=true;
    	for(var i=0,nLen=aIds.length;i<nLen;i++){
    		var sId=aIds[i];
			//读取实名
			sId=$H.Object.alias(sId);
    		var oResult=_fChkExisted(sId);
    		if(oResult.notExist){
    			//未加载资源放进队列中
    			aRequestIds.push(sId);
    			if(bNeedContext){
    				bNeedContext=false;
	    			_aContext.push({
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
	
});/**
 * 自定义事件类，事件名称支持'all'表示所有事件，支持复杂形式：'event1 event2'或{event1:func1,event:func2}，
 * 事件名称支持命名空间(".name")，如：change.one
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Events',function($H){
	
	var Events={
		_eventCache        : {},                   //自定义事件池
		_execEvtCache      : [],                   //待执行事件队列
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
		return function(){
			if(me.isSuspend!=true){
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
		});
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
});/**
 * 日期扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Date',function(){
	
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
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var oDate=oDate;

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
	 * @param {number|string|Date=}time 不传表示读取
	 * @param {Date} 返回当前服务器时间
	 */
	function fNow(time){
		var oNow = new WDate();
		if(time){
			if(typeof time!='number'){
				time=Date.parseDate(time).getTime();
			}
			_timeDif=time-oNow.getTime();
		}else{
			oNow.setTime(oNow.getTime()+_timeDif);
			return oNow;
		}
	}
	/**
	 * 计算距离现在多久了
	 * @param {Date}oTime 参数时间
	 * @param {boolean=}bFormat 仅当false时不进行格式化：小于60分钟的单位是分钟，
	 * 					小于一天的单位是小时，小于30天的单位是天，大于30天返回"30天前"
	 */
	function fHowLong(oTime,bFormat){
		if(!oTime){
			return;
		}
		var oNow=Date.now();
		var time=oNow.getTime()-oTime.getTime();
		if(bFormat!=false){
			var sUnit;
			if((time=time/(1000*60))<60){
				sUnit='分钟'; 
				time=time||1;
			}else if((time=time/60)<24){
				sUnit='小时'; 
			}else if((time=time/24)<30){
				sUnit='天'; 
			}else{
				return '30天前'; 
			}
			//最少显示一分钟前
			time=(Math.floor(time)||1)+sUnit+'前';
		}
		return time;
	}
	
	return Date;
});/**
 * String工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("String",function(){
	
	var String={
		stripTags		: fStripTags,       // 删除标签
		escapeHTML		: fEscapeHTML,      // html编码
		unescapeHTML	: fUnescapeHTML,    // html解码
		decodeHTML		: fDecodeHTML,	    // html解码
		encodeHTML		: fEncodeHTML,	    // html编码
		trim			: fTrim,            // 删除字符串两边的空格
		check			: fCheck,		    // 检查特殊字符串
		len				: fLen,         	// 计算字符串打印长度,一个中文字符长度为2
		left			: fLeft,			// 截断left
		isNumStr		: fIsNumStr,        // 字符串是否是数字
		hasChn          : fHasChn,          // 字符是否包含中文
		isChn           : fIsChn,           // 字符是否是中文
		addParam		: fAddParam		    // 在url后面增加get参数
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
	 * @method  escapeHTML
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {string} 编码后的html代码
	 */
	function fEscapeHTML(sStr){
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
	 * @method  unescapeHTML
	 * @param  {string} sStr	需要操作的字符串
	 * @return {string}  	解码后的html代码  
	 */
	function fUnescapeHTML(sStr){
		var oDiv = document.createElement('div');
		oDiv.innerHTML = String.stripTags(sStr);
		return oDiv.childNodes[0].nodeValue;
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
	/**
	 * 在该字符串中增加get需要的参数，如果改字符串代表的url没有get的参数，需要在后面加?，如果有，需要在后面加&
	 * @method  addParam
	 * @param  {string} sStr 需要操作的字符串
	 * @param  {string} sParam 需要添加到url中的参数
	 * @return {string} sStr 新组成的字符串
	 */
	function fAddParam(sStr, sParam){
		if(sParam){
			sStr += (sStr.indexOf("?")>-1 ? "&" : "?")+sParam;
		}
		return sStr;
	}
	
	return String;
});/**
 * Cookie工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Cookie',function(){
	
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
});/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Util','B.Object',function(Object,$H){
	
	var Util={
		isWindow         : fIsWindow,  //检查是否是window对象
		uuid             : fUuid,      //获取handy内部uuid
		getHash          : fGetHash,   //获取hash，不包括“？”开头的query部分
		setHash          : fSetHash,   //设置hash，不改变“？”开头的query部分
		position         : fPosition,  //获取节点位置
		result           : fResult     //如果对象中的指定属性是函数, 则调用它, 否则, 返回它
	}
	
	var _nUuid=0;
	
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
	 * 获取hash，不包括“？”开头的query部分
	 * @method getHash
	 * @return {?string} 返回hash
	 */
	function fGetHash(){
		var sHash=top.location.hash;
		return sHash.replace(/\?.*/,'');
	}
	/**
	 * 设置hash，不改变“？”开头的query部分
	 * @method setHash
	 * @param {string} sHash要设置的hash
	 */
	function fSetHash(sHash){
		var sOrgHash=top.location.hash;
		if(sOrgHash.indexOf("#")>=0){
			sHash=sOrgHash.replace(/#[^\?]*/,sHash);
		}
		top.location.hash=sHash;
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
	
});/**
 * 数组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Array','B.Object',function(Object,$H){
	
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
    function fSortedIndex(array, obj, iterator, context) {
	    iterator = _fGetIterator(iterator);
	    var value = iterator.call(context, obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	        var mid = (low + high) >>> 1;
	        iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
	    }
	    return low;
	}
	/**
	 * 排序
	 * @param {Array}obj 参数对象
	 * @param {Function|string=}iterator 为空时返回获取本身的迭代函数，为字符串时返回获取该属性的迭代函数，
	 * 							如果是函数则返回自身,有三个参数：当前元素，当前元素的索引和当前的集合对象
	 * @param {*=}context 判断函数上下文对象
	 * @return {Array} 返回排序过后的集合
	 */
	function fSortBy(obj, iterator, context) {
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
	            	return 1;
	            }
	            if (a < b || b === void 0){
	            	return -1;
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
	
});/**
 * 地理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Geo',function($H){
	
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
	    		return '未知';
	    	}
	    	nDistance+='km';
	    }
	    return nDistance;
	}
	
	return Geo;
	
});/**
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Template',['B.Object','B.String','B.Debug','B.Function'],function(Object,String,Debug,Function,$H){
		
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
			//if isChk
			if(m=sExp.match(/([^\s]+)\s([^\n]+)/)){
				//if
				sExp=m[1];
				//m[2]:isChk
				sCode='if (helper = $helpers.'+sExp+') {\n$tmp = helper.call($me,"'+m[2]+'",{'+sParams+'); \n}else{$tmp="";}';
			}else{
				//直接表达式
				sCode='if (helper = $helpers.'+sExp+') {\n$tmp = helper.call($me,"",{'+sParams+'); \n}'+
				  		'else{\nhelper = '+sGetter+'; $tmp = typeof helper === functionType ? helper.call($me,{'+sParams+') : helper;\n}'+
				  		(fParseValue?
				  		'\n$tmp=$helpers.parseValue'+'.call($me,$tmp,{'+sParams+');'
				  		:(T.isEscape?'\n$tmp=escape($tmp);':''));
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
	
});/**
 * HashChange类，兼容IE6/7浏览器实现hashchange事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
//use jQuery
handy.add("HashChange",
['handy.base.Debug','handy.base.Util'],
function(Debug,Util,$H){

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
                	_fSetIfrHash(Util.getHash());
                	setInterval(_fPoll,HashChange.delay);
                });
			}else{
				$(window).on("hashchange",function(){
					_fOnChange(Util.getHash());
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
			var sHash=Util.getHash();
			var sIfrHash = _oIframe.contentWindow.document.body.innerText;
			//如果地址栏hash变化了，设置iframe的hash并处罚hashchange
			if (sHash != _sLastHash) {
				_fSetIfrHash(sHash);
				_fOnChange(sHash);
			}else if(sIfrHash!=_sLastHash){
				//iframe的hash发生了变化(点击前进/后退)，更新地址栏hash
				Debug.log("update:"+_oIframe.contentWindow.document.body.innerText);
				Util.setHash(sIfrHash);
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
});/**
 * 支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Support','B.Browser',function(Browser,$H){
	
	
	var Support={
//		testSvg               : fTestSvg          //检查是否支持svg
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
	
	/**
	 * 检查设备并添加class
	 * @method mediaQuery
	 */
	function fMediaQuery(){
		var sCls;
		if(Browser.mobile()){
			sCls="hui-mobile";
		}else{
			sCls="hui-pc";
			var ie=Browser.ie();
			if(ie){
				sCls+=' ie'+ie;
			}
		}
		document.documentElement.className+=" "+sCls;
	}
	
	return Support;
	
});/**
 * 校验类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Validator',['B.String','B.Object'],function(String,Object,$H){
	
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
	 * @method valid
	 * @param {Object}oRule{
	 * 		{boolean|Array|Function}rules : 校验规则，可以有多条，可以是此Validator类里的规则，也可以传入自定义的校验函数
	 * 		{string}messages : 自定义提示文字
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
	
});/**
 * LocalStorage类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('LocalStorage',['B.Browser','B.Events','B.Json'],function(Browser,Events,Json,$H){
	
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
});/**
 * 适配类库
 */
(function($){
	
	//框架全局变量
	$H=$.noConflict();
	H=$H;
	Hui=$H;
	$D=$H.Debug;
	$HD=$H.Date;
	$Define=$H.Loader.define;
	$Require=$H.Loader.require;
	

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
	
	
})(handy);/**
 * 抽象事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-20
 */
//"handy.common.AbstractEvents"
$Define('CM.AbstractEvents',
function(){
	
	var AbstractEvents=$H.createClass();
	
	$H.extend(AbstractEvents.prototype,$H.Events);
	
	$H.extend(AbstractEvents.prototype,{
//		_eventCache          : {},                     //自定义事件池
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
});/**
 * 数据仓库类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.common.DataStore"
$Define('CM.DataStore',
function(){
	var DataStore=$H.createClass();
	
	$H.extend(DataStore.prototype,{
		get            : fGet,       //获取数据
//		find           : fFind,
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
		var aCache;
		if(aCache=_cache[sName]){
			if(!oOptions){
				return aCache;
			}else{
				return $H.where(aCache,oOptions);
			}
		}
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
		var aCache=_cache[sName]||(_cache[sName]=[]);
		aCache.push(data);
		if(sCid){
			if(!_cache[sCid]){
				_cache[sCid]=data;
			}
		}
	}
	
	return DataStore;
	
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2014-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.common.AbstractDao
$Define('CM.AbstractDao',
'B.LocalStorage',
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
		oParams.beforeSend=$H.intercept($H.bind(me.beforeSend,me),oParams.beforeSend);
		oParams.complete=$H.intercept($H.bind(me.complete,me),oParams.complete);
		return $.ajax(oParams);
	}
	/**
	 * 发送前处理
	 */
	function fBeforeSend(){
		this.showLoading(true);
	}
	/**
	 * 发送完处理
	 */
	function fComplete(){
		this.showLoading(false);
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
		var sToreType=oOptions.storeType||'remote';
		//ajax请求参数
		var oParam={type: 'POST'||me._ajaxMethodMap[sMethod], dataType: 'json'};
		if(!oOptions.url){
		    oParam.url =oModel.getUrl();
		}
	    if (oOptions.data == null && oModel && (sMethod === 'create' || sMethod === 'update' || sMethod === 'patch')) {
	        //oParam.contentType = 'application/json';
	        oParam.data = oOptions.attrs || oModel.toJSON(oOptions);
	    }
	    
		if(sToreType=='remote'){
			//服务端存储
			oParam.url+='/'+sMethod+'.do';
			$H.extend(oParam,oOptions);
			me.ajax(oParam);
		}else{
			//本地存储
			LS[me._localMethodMap[sMethod]](oParam);
		}
		oModel.trigger('request', oModel, oOptions);
	}
	
	return AbstractDao;
	
});/**
 * 模型类，负责数据封装，可监听事件：invalid、sync、destroy、change:attr、change
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Model"
$Define('CM.Model',
['CM.AbstractDao',
'CM.AbstractEvents',
'CM.DataStore'],
function(AbstractDao,AbstractEvents){
	
	var Model=AbstractEvents.derive({
		//可扩展属性
//      fields                : {},                  
		/**
		 * 属性声明列表，一般是需要额外处理的定制属性，基本类型的属性不需要在此声明，{
	     *	普通形式：
	     *	{string}name:{
		 *	    {string|Class=}type:类型，可以是字符串(string/number/Date/Model/Collection),也可以是类
		 *		{*=}def:默认值
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
//		dao                   : null,                //数据访问对象，默认为common.AbstractDao
		
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
		
		initialize            : fInitialize,         //初始化
		getDefaults           : fGetDefaults,        //获取默认值
		toJSON                : fToJSON,             //返回对象数据副本
		sync                  : fSync,               //同步数据，可以通过重写进行自定义
   		get                   : fGet,                //获取指定属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
   		each                  : fEach,               //遍历字段
   		hasChanged            : fHasChanged,         //判断自上次change事件后有没有修改，可以指定属性
   		changedAttrbutes      : fChangedAttributes,  //返回改变过的属性，可以指定需要判断的属性
   		previous              : fPrevious,           //返回修改前的值，如果没有修改过，则返回null
   		fetch                 : fFetch,              //获取模型数据
   		save                  : fSave,               //保存模型
   		destroy               : fDestroy,            //销毁/删除模型
   		getUrl                : fGetUrl,             //获取模型url
   		parse                 : fParse,              //分析处理回调数据，默认直接返回response
   		clone                 : fClone,              //克隆模型
   		isNew                 : fIsNew,              //判断是否是新模型(没有提交保存，并且缺少id属性)
   		isValid               : fIsValid             //校验当前是否是合法的状态
	});
	
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
	    var oFields=me.fields,oField,aDeps,oSets={};
	    for(var key in oFields){
	    	var oField=oFields[key];
			if(oField&&(aDeps=oField.depends)){
				for(var i=0;i<aDeps.length;i++){
			    	//当依赖属性变化时，设置计算属性
					if(oChanges.hasOwnProperty(aDeps[i])){
						oSets[key]=0;
						break;
					}
				}
			}
	    }
	    me.set(oSets,null,{silent:bSilent});
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
    	var oField,fParse,val,aDeps,type;
    	var oResult={};
		for(var key in oAttrs){
			val=oAttrs[key];
			if(oField=oFields[key]){
				type=oField.type;
				//自定义解析
				if(fParse=oField.parse){
					val=fParse.apply(me,[val,oAttrs]);
				}
				//自定义类型，包括Model和Collection
				if($H.isStr(type)){
					if(type=='Date'){
						val=$H.parseDate(val);
					}else if(type.indexOf('.')>0){
						type=$H.ns(type);
					}
				}
				if($H.isClass(type)&&!(val instanceof type)){
					val=new type(val);
					//监听所有事件
					val.on('all',$H.bind(me._onAttrEvent,me,key));
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
    function _fOnAttrEvent(sAttr,sEvent, obj) {
    	if(sEvent=='invalid'||sEvent=='sync'){
    		return;
    	}
    	var me=this;
    	var oVal=me.get(sAttr);
        if (sEvent.indexOf('change:')!=0){
        	me.trigger('change:'+sAttr,me,oVal);
        	me.trigger('change',me);
        }
    }
	/**
	 * 初始化
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
		me.callSuper();
		me.uuid=$H.uuid();
		//配置dao对象
		me.dao=me.dao||$H.getSingleton(AbstractDao);
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = $H.Util.uuid();
		me._attributes = {};
		if (oOptions.collection){
			me.collection = oOptions.collection;
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		oAttrs = $H.extendIf(oAttrs, me.getDefaults());
		me.set(oAttrs, oOptions);
		me._changed = {};
		//放入数据仓库
		$S.push(me);
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
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {CM.Model}oModel 模型对象
	 * @param {Object}oOptions 设置
	 * @return {*} 根据同步方法的结果
	 */
    function fSync(sMethod,oModel,oOptions) {
        return this.dao.sync(sMethod,oModel,oOptions);
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
        return $H.String.escapeHTML(this.get(sAttr));
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
	 */
    function fSet(sKey, val, oOptions) {
    	var me=this;
    	var oAttrs;
	    if (typeof sKey === 'object') {
	    	oAttrs = sKey;
	    	oOptions = val;
	    } else {
	    	(oAttrs = {})[sKey] = val;
	    }
	    oOptions || (oOptions = {});
	    //属性预处理
	    oAttrs= me._parseFields(oAttrs);
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	return false;
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
	   	    //与当前值不相等，放入改变列表中
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
	    	//如果取消设置，删除对应属性
	    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    }
	    
		var bHasChange=!$H.isEmpty(oChanges);
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (bHasChange){
	        	me._pending = oOptions;
	        }
	        for (var k in oChanges) {
	      	    me.trigger('change:' + k, me, oCurrent[k], oOptions);
	        }
	    }
	
	    if (bChanging){
	    	return me;
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
	    
	    return me;
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
	 * @retur {boolean} true表示有修改
	 */
    function fHasChanged(sAttr) {
    	var oChange=this._changed;
        if (sAttr == null){
        	return !$H.isEmpty(oChange);
        }
        return $H.contains(oChange, sAttr);
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @param {Object=}oDiff 参数属性，表示只判断传入的属性
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttributes(oDiff) {
    	var me=this;
        if (!oDiff){
            return me.hasChanged() ? $H.clone(me._changed) : false;
        }
        var val, changed = false;
        var oOld = me._changing ? me._previousAttributes : me._attributes;
        for (var sAttr in oDiff) {
            if (!$H.equals(oOld[sAttr], (val = oDiff[sAttr]))){
	            (changed || (changed = {}))[sAttr] = val;
            }
        }
        return changed;
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
	 * @param {Object=}oOptions 备选参数
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
        	if (fBeforeSet){
        		if(fBeforeSet(me, resp, oOptions)==false){
        			return;
        		}
        	}
        	if (!me.set(me.parse(resp, oOptions), oOptions)){
        		return false;
        	}
        	if (fSuccess){
        		fSuccess(me, resp, oOptions);
        	}
        	me.trigger('sync', me, resp, oOptions);
        };
        me.sync('read', me, oOptions);
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
       	    if (!me.set(oAttrs, oOptions)){
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
	        var oServerAttrs = me.parse(resp, oOptions);
	        //now!=true，确保更新相应数据(可能没有返回相应数据)
	        if (!oOptions.now){
	        	oServerAttrs = $H.extend(oAttrs || {}, oServerAttrs);
	        }
	        //服务器返回的值可能跟现在不一样，还要根据返回值修改
	        if ($H.isObj(oServerAttrs) && !me.set(oServerAttrs, oOptions)) {
	            return false;
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        me.trigger('sync', me, resp, oOptions);
	    };

	    sMethod = me.isNew() ? 'create' : (oOptions.update ? 'update':'patch' );
    	//patch只提交所有改变的值
	    if (sMethod === 'patch'){
	    	var oChanged=me.changedAttrbutes(oAttrs);
	    	//没有改变的属性，直接执行回调函数
	    	if(!oChanged){
	    		if (fSuccess){
		        	fSuccess(me, oOptions);
		        }
		        return;
	    	}
	    	oOptions.attrs = oChanged;
	    }else{
	    	//提交所有属性值
	    	var oCurrent=$H.extend({},me._attributes);
	    	oOptions.attrs = $H.extend(oCurrent,oAttrs);
	    }
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
    	if(resp.code&&resp.data){
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
	
});/**
 * 集合类，封装模型集合，可监听事件：invalid、add、remove、sync、sort、reset及模型的事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Collection"
$Define('CM.Collection',
['CM.AbstractDao',
'CM.AbstractEvents',
'CM.Model',
'CM.DataStore'],
function(AbstractDao,AbstractEvents,Model){
	
	var Collection=AbstractEvents.derive({
		//可扩展属性
//		url                    : '',                  //集合url
		model                  : Model,               //子对象模型类
//		dao                    : null,                //数据访问对象，默认为common.AbstractDao
		
		//内部属性
//		_models                : [],                  //模型列表
//		_byId                  : {},                  //根据id和cid索引
//		length                 : 0,                   //模型集合长度
		
		_reset                 : _fReset,             //重置集合
		_prepareModel          : _fPrepareModel,      //初始化模型
		_addReference          : _fAddReference,      //关联模型和集合
		_removeReference       : _fRemoveReference,   //移除模型和集合关联关系
		_onModelEvent          : _fOnModelEvent,      //模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
		
		initialize             : fInitialize,         //初始化
		toJSON                 : fToJSON,             //返回json格式数据(模型数据的数组)
		sync                   : fSync,               //同步数据，可以通过重写进行自定义
		add                    : fAdd,                //添加模型
		remove                 : fRemove,             //移除模型
		set                    : fSet,                //设置模型
		each                   : fEach,               //遍历集合
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
		pluck                  : fPluck,              //提取集合里指定的属性值
		getUrl                 : fGetUrl,             //获取集合url
		fetch                  : fFetch,              //请求数据
		create                 : fCreate,             //新建模型
		parse                  : fParse,              //分析处理回调数据，默认直接返回response
		clone                  : fClone               //克隆
		
	});
	
    var HA=$H.Array;
    
	//从base.Array生成方法
	$H.each([
		'map','some','every','find','filter','invoke','indexOf'
	], function(i,sMethod) {
	    Collection.prototype[sMethod] = function() {
	      var aArgs = Array.prototype.slice.call(arguments);
	      aArgs.unshift(this._models);
	      return HA[sMethod].apply(HA, aArgs);
	    };
	});
	
	$H.each(['sortBy','groupBy','countBy'], function(sMethod) {
	    Collection.prototype[sMethod] = function(value, context) {
	        var iterator = $H.isFunc(value) ? value : function(oModel) {
	            return oModel.get(value);
	        };
	        return HA[sMethod](this._models, iterator, context);
        };
    });
	
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
        //如果数据仓库里已经存在，直接使用
        var oModel;
        if(oOptions.id){
	        oModel=$S.get(me.model.$ns,{id:oOptions.id});
	        if(oModel=oModel&&oModel[0]){
	        	oModel.set(oAttrs,oOptions);
	        	return oModel;
	        }
        }
        
        oModel = new me.model(oAttrs, oOptions);
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
	 * 		{function=}comparator 比较函数
	 * }
	 */
	function fInitialize(aModels, oOptions) {
		var me=this;
		me.callSuper();
		me.dao=me.dao||$H.getSingleton(AbstractDao);
	    oOptions || (oOptions = {});
	    if (oOptions.model) {
	    	me.model = oOptions.model;
	    }
	    if (oOptions.url) {
	    	me.url = oOptions.url;
	    }
	    if (oOptions.comparator !== void 0) {
	    	me.comparator = oOptions.comparator;
	    }
	    me._reset();
	    if (aModels){
	    	me.reset(aModels, $H.extend({silent: true}, oOptions));
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
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {Collection}oCollection 集合对象
	 * @param {Object}oOptions 设置
	 * @return {*} 返回同步方法的结果
	 */
    function fSync(sMethod,oCollection,oOptions) {
        return this.dao.sync(sMethod,oCollection,oOptions);
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
        return this.set(models,oOptions);
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
	 * @return {Model}返回被设置的模型，如果是数组，返回第一个元素
	 */
    function fSet(models, oOptions) {
    	var me=this;
    	if(!models){
    		return;
    	}
    	oOptions = $H.extend({
    		add: true,
    		remove: true,
    		merge: true
    	},oOptions);
        if (oOptions.parse){
        	models = me.parse(models, oOptions);
        }
        var bSingular = !$H.isArr(models);
        var aModels = bSingular ? (models ? [models] : []) : $H.clone(models);
        var i, l, id, oModel, oAttrs, oExisting, sort;
        var at = oOptions.at;
        var cTargetModel = me.model;
        //是否可排序
        var bSortable = me.comparator && (at == null) && oOptions.sort !== false;
        var sortAttr = typeof me.comparator=="string" ? me.comparator : null;
        var aToAdd = [], aToRemove = [], oModelMap = {};
        //是否添加
        var bAdd = oOptions.add, 
        //是否合并
        bMerge = oOptions.merge,
        //是否移除
        bRemove = oOptions.remove;
        var order = !bSortable && bAdd && bRemove ? [] : false;

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
            		oModelMap[oExisting.cid] = true;
            	}
            	//合并
          		if (bMerge) {
           			oAttrs = oAttrs === oModel ? oModel.attributes : oAttrs;
                	if (oOptions.parse){
                		oAttrs = oExisting.parse(oAttrs, oOptions);
                	}
            		oExisting.set(oAttrs, oOptions);
            		//
            		if (bSortable && !sort && oExisting.hasChanged(sortAttr)){
            			sort = true;
            		}
          		}
         		aModels[i] = oExisting;

        	} else if (bAdd) {
        		oOptions.id=id;
         		//添加	
            	oModel = aModels[i] = me._prepareModel(oAttrs, oOptions);
            	if (!oModel){
            		continue;
            	}
            	aToAdd.push(oModel);
            	me._addReference(oModel, oOptions);
        	}

        	oModel = oExisting || oModel;
        	if (order && (oModel.isNew() || !oModelMap[oModel.id])){
        		order.push(oModel);
        	}
        	oModelMap[oModel.id] = true;
        }

        //如果有需要的话，移除相应模型
        if (bRemove) {
        	for (i = 0, l = me.length; i < l; ++i) {
           		if (!oModelMap[(oModel = me._models[i]).cid]){
           			aToRemove.push(oModel);
           		}
        	}
        	if (aToRemove.length){
        		me.remove(aToRemove, oOptions);
        	}
        }

        if (aToAdd.length || (order && order.length)) {
        	if (bSortable){
        		sort = true;
        	}
        	//更新长度
            me.length += aToAdd.length;
            //指定位置上添加
        	if (at != null) {
            	for (i = 0, l = aToAdd.length; i < l; i++) {
            		me._models.splice(at + i, 0, aToAdd[i]);
          		}
       		} else {
          		if (order){
          			me._models.length = 0;
          		}
          		var orderedModels = order || aToAdd;
          		for (i = 0, l = orderedModels.length; i < l; i++) {
            		me._models.push(orderedModels[i]);
          		}
        	}
        }

        //排序
        if (sort){
        	me.sort({silent: true});
        }

        //触发相应事件
        if (!oOptions.silent) {
        	for (i = 0, l = aToAdd.length; i < l; i++) {
            	(oModel = aToAdd[i]).trigger('add', oModel, me, oOptions);
        	}
        	if (sort || (order && order.length)){
        		me.trigger('sort', me, oOptions);
        	}
        }

        //返回被设置的模型，如果是数组，返回第一个元素
        return bSingular ? aModels[0] : aModels;
    }
    /**
     * 遍历集合
     * @param {function}fCall(nIndex,oModel) 回调函数
     */
    function fEach(fCall){
    	$H.each(this._models,fCall);
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
	        models = me.add(models, $H.extend({silent: true}, oOptions));
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
        return me.add(oModel, $H.extend({at: me.length}, oOptions));
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
        return this.add(oModel, $H.extend({at: 0}, oOptions));
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
        	me._models = me.sortBy(me.comparator, me);
        } else {
       		me._models.sort($H.Function.bind(me.comparator, me));
        }

        if (!oOptions.silent){
        	me.trigger('sort', me, oOptions);
        }
        return me;
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
	 * @param {Object=}oOptions
	 * @return {}
	 */
    // Fetch the default set of models for me collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var fSuccess = oOptions.success;
        var fBeforeSet = oOptions.beforeSet;
        oOptions.success = function(resp) {
        	if (fBeforeSet){
        		if(fBeforeSet(me, resp, oOptions)==false){
        			return;
        		}
        	}
        	var method = oOptions.reset ? 'reset' : oOptions.add?'add':'set';
        	me[method](resp, oOptions);
        	if (fSuccess){
        		fSuccess(me, resp, oOptions);
        	}
        	me.trigger('sync', me, resp, oOptions);
        };
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
    function fParse(resp, oOptions) {
        return resp.data;
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
	
});/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.common.AbstractManager"
$Define("CM.AbstractManager", function() {

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
		get           : fGet              //根据id或cid查找视图
	});
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me._types={};
		me._all={};
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
		me._all[sCid]=oView;
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
		if(oAll[sCid]==oView){
			delete oAll[sCid];
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
	 */
	function fGet(sId){
		var me=this;
		var all=me._all;
		return all[sId];
	}

	return AbstractManager;
	
});/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-17
 */
//"handy.common.ViewManager"
$Define("CM.ViewManager", 'CM.AbstractManager',function(AbstractManager) {

	var ViewManager = $H.createClass();

	$H.inherit(ViewManager,AbstractManager,{
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
	
});/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-17
 */
 //"handy.common.AbstractView"
$Define('CM.AbstractView',
[
'CM.ViewManager',
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
	 * 			{string=}selector : 选择器
	 * 			{any=}context     : 监听函数执行的上下文对象，默认是对象
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fListen(oEvent){
		var me=this;
		if(me._parseListenEvents('listen',oEvent)){
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
	 * 			{boolean=}custom    : 为true时是自定义事件
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
	
});/**
 * 模型视图类，实现视图与数据的同步
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-11
 */
//"handy.common.ModelView"
$Define('CM.ModelView',
[
'B.Template',
'CM.AbstractView',
'CM.Model',
'CM.Collection'
],
function(Template,AbstractView,Model,Collection){
	
	var ModelView=AbstractView.derive({
		bindType            : 'both',              //绑定类型，‘el’表示绑定节点，‘model’表示绑定模型，‘both’表示双向绑定
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
					var data={};
					data[sExp]=sValue;
					sHtml=oOptions.fn(data);
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
						jEl.attr(sAttr,sValue||'');
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
		var bIfBind=!oNums[nNum]&&(oData instanceof Model||oData instanceof Collection);
		oNums[nNum]=1;
		return bIfBind;
	}
	/**
	 * 更新内容
	 * @param {number}nId 逻辑节点id
	 * @param {string=}sHtml 替换逻辑节点内容的html，不传表示清空内容
	 * @param {boolean=}bRemove 仅当true时移除首尾逻辑节点
	 * @param {string=}sType 默认是更新内容，'append'表示追加内容，'remove'表示移除内容(包括元标签)
	 */
	function fUpdateMetaMorph(nId,sHtml,sType){
		if(sType=='append'){
			$('#metamorph-'+nId+'-end').before(sHtml);
			return;
		}
		var jStart=$('#metamorph-'+nId+'-start');
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
		sHtml&&jStart.after(sHtml);
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
		return sStart+nId+'-start'+sEnd+(sHtml||'')+sStart+nId+'-end'+sEnd;
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
});/**
 * 视图类
 * PS：注意，扩展视图类方法必须用本类的extend方法，扩展类的静态方法则可以使用$H.Object.extend方法，例如
 * var ExampleCmp=AbstractComponent.define('ExampleCmp');
 * ExampleCmp.extend({
 * 	   test:''
 * });
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-17
 */
//"handy.common.View"
$Define('CM.View',
['CM.ViewManager',
'CM.ModelView',
'CM.Model',
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
		
		//属性
//		startParseItems     : false,             //是否已开始初始化子视图
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
		tmpl                : '<div>{{placeItem}}</div>',    //模板，字符串或数组字符串，ps:模板容器节点上不能带有id属性
//      showed              : false,             //是否已显示
		bindRefType         : 'bindRef',         //绑定引用模型的方式：both(双向绑定)、bindRef{绑定引用模型}、bindXmodel(绑定xmodel)、null或空(不绑定)
//		refModelAttrs       : {},                //引用模型属性列表
//		children            : [],                //子视图列表
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','render','afterRender',
			'beforeShow','show','afterShow',
			'beforeHide','hide','afterHide',
			'beforeUpdate','update','afterUpdate',
			'beforeDestroy','destroy','afterDestroy',
			'add','remove'
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
		
		_applyArray         : _fApplyArray,         //在数组上依次执行方法
		
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
		parseItem           : function(){},      //分析子视图，由具体视图类实现
		parseItems          : fParseItems,       //分析子视图列表
		
		//更新、销毁
		beforeUpdate        : fBeforeUpdate,     //更新前工作
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
		//TODO
		if(0&&!me.inited){
			me.on('add',function(sEvt,oItem){
				if(oItem.match(sExp)){
					me.updateMetaMorph(sMetaId,oItem.getHtml(),'append');
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
			}else if(p=='xConfig'){
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
				(me.refModelAttrs||(me.refModelAttrs={}))[refAttr]=p;
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
				me[aAttrs[attr]]=oRefModel.get(attr);
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
	 * @return {boolean=} 仅当已经完成过渲染时返回false
	 */
	function fAfterRender(){
		var me=this;
		if(me.rendered){
			return false;
		}
		me.trigger('render');
		me.callChild();
		//缓存容器
		me._container=$("#"+me.getId());
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
		if(!me.hidden){
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
	 * @return {boolean=} 仅当没有成功隐藏时返回false
	 */
	function fHide(){
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
		me.trigger('hide');
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
		var oEl=me.getEl();
		oEl.contents().remove();
		if(typeof content=='string'){
			oEl.html(content);
		}else{
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
		if(oConfig[sKey]===undefined){
			value=me[sKey];
		}else{
			value=me.xmodel.get(sKey);
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
		var oConfig=me.xConfig;
		if(oConfig[sKey]===undefined){
			me[sKey]=value;
		}else{
			me.xmodel.set(sKey,value);
		}
	}
	/**
	 * 获取引用模型，优先获取当前视图的引用模型，如果当前视图的引用模型没有设置，
	 * 则寻找父视图的引用模型，直到找到最近的引用模型为止，返回找到的引用模型，
	 * 如果直到最顶级的视图都没有引用模型，则返回顶级视图的模型(.model)
	 * @return {Model} 返回引用模型
	 */
	function fGetRefModel(){
		var me=this;
		if(me.refModel){
			return me.refModel;
		}
		var oParent=me.parent;
		while(oParent){
			if(oParent.refModel){
				return me.refModel=oParent.refModel;
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
		function _fBind(sRefAttr,sXmodelAttr){
			//绑定引用模型
			if(sType=='both'||sType=='bindRef'){
				me.listenTo(oRefModel,'change:'+sRefAttr,function(sEvt,oModel,value){
					me.set(sXmodelAttr,value);
				});
			}
			//绑定xmodel
			if(sType=='both'||sType=='bindXmodel'){
				me.listenTo(oXmodel,'change:'+sXmodelAttr,function(sEvt,oModel,value){
					oRefModel.set(sRefAttr,value);
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
		var r=/\[([^=|\!]+)(=|\!=)([^=]+)\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			//操作符：=|!=
			op=m[2];
			value=m[3];
			if(value=='false'||value=='true'){
				value=eval(value);
			}
			viewVal=oObj.get?oObj.get(prop):oObj[prop];
			if(op==="="?viewVal!=value:viewVal==value){
				return false;
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子视图
	 * @method find
	 * @param {number|string=|Function(View)|Class}sel 不传表示获取子视图数组，数字表示子组件索引，
	 * 				如果是字符串：多个选择器间用","隔开('sel1,sel2,...')，语法类似jQuery，
	 * 				如：'xtype[attr=value]'、'ancestor descendant'、'parent>child'，
	 * 				'#'表示cid，如'#btn'，表示cid为btn的视图
	 * 				'>Button'表示仅查找当前子节点中的按钮，'Button'表示查找所有后代节点中的按钮，
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
			var nIndex=sCurSel.search(/\s|>/);
			var sCurSel,sExtSel;
			if(nIndex>0){
				sExtSel=sCurSel.substring(nIndex);
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
	 * @param {object|Array}item 视图对象或视图配置或数组
	 * @param {number=}nIndex 指定添加的索引，默认添加到最后
	 * @return {?Component} 添加的子视图只有一个时返回该视图对象，参数是数组时返回空
	 */
	function fAdd(item,nIndex){
		var me=this;
		if(me._applyArray()){
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
					//初始化过后，默认添加到容器节点里
					if(me.inited){
						item.renderTo=me.getEl();
					}else{
						//没有初始化时，设置子组件不进行自动render，而是由组件本身进行render
						item.autoRender=false;
					}
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
		me.trigger('add',item);
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
	 * 更新
	 * @param {Object}oOptions
	 * @param {boolean=}bNewConfig 仅当为true时，表示全新的配置，否则，从当前组件初始配置里扩展配置
	 * @return {boolean|Object} 更新失败返回false，成功则返回更新后的视图对象
	 */
	function fUpdate(oOptions,bNewConfig){
		var me=this;
		if(!oOptions||me.beforeUpdate()==false){
			return false;
		}
		var oConfigs=me.xConfig;
		var bContain=true;
		//检查选项是否都是xmodel的字段，如果是，则只需要更新xmodel即可，ui自动更新
		$H.each(oOptions,function(p,v){
			if(typeof oConfigs[p]=='undefined'){
				bContain=false;
				return false;
			}
		})
		var oNew;
		if(bContain){
			me.xmodel.set(oOptions);
			oNew=me;
		}else{
			//有不是xmodel的属性，执行完全更新
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
	
});/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("C.ComponentManager", 
['CM.AbstractManager',
'CM.ViewManager'],
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
});/**
 * 组件基类，所有组件必须继承自此类或此类的子类，定义组件必须用AbstractComponent.define方法
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
$Define('C.AbstractComponent',["CM.ViewManager",'CM.View'],function(ViewManager,View){
	
	//访问component包内容的快捷别名
	$C=$H.ns('C',{});
	
	var AC=$H.createClass();
	
	$H.inherit(AC,View,{
		//实例属性、方法
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
//		icon                : null,              //图标
		
		////通用样式
//		width               : null,              //宽度(默认单位是px)
//		height              : null,              //高度(默认单位是px)
//		style               : {},                //其它样式，如:{top:10,left:10}
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
			isMini          : false,       	     //小号
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
		if(me.icon){
			me.add({
				xtype:'Icon',
				name:me.icon
			})
		}
		//父组件是迷你的，子组件默认也是迷你的
		if(me.isMini){
			me.defItem=$H.extend({isMini:true},me.defItem);
		}
	}
	/**
	 * 预处理模板，添加组件样式
	 */
	function fPreTmpl(){
		var me=this;
		me.callSuper();
		me.tmpl=me.tmpl.replace(/(class=['"])/,'$1#js-component cmpCls tTypeCls themeCls radiusCls isMini?hui-mini shadow?hui-shadow shadowSurround?hui-shadow-surround '+
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
	
});/**
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
			hasBg       : true,               //是否有背景
			isAlt       : false,              //是否使用深色图标
			name        : '',                 //图标名称
			iconName    : {
				depends : ['name'],
				parse :function(){
					return 'hui-icon-'+this.get('name');
				}
			}
		},
		
		tmpl            : 
			'<span {{bindAttr class="isAlt?hui-alt-icon iconName hasBg?hui-icon-bg"}}></span>',
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
		me.callSuper([oSettings]);
	}
	
	return Icon;
	
});/**
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
			theme           : 'gray',
			iconPos         : '',                  //图标位置，"left"|"top"
			activeCls       : 'hui-btn-active',    //激活样式
			isBack          : false,               //是否是后退按钮
			radius          : 'little',            //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
			shadow          : true,        	       //外阴影
			isInline        : true,                //宽度自适应
			iconPosCls      : {
				depends : ['iconPos'],
				parse :function(){
					var sPos=this.get('iconPos');
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			}
		},
//		icon            : null,                //图标名称
		cls             : 'btn',               //组件样式名
		
		defItem         : {
			xtype       : 'Icon'
		},
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" {{bindAttr class="text:hui-btn-icon-notxt isBack?hui-btn-back iconPosCls"}}>',
								'<span class="hui-btn-txt">{{text}}</span>',
								'{{placeItem}}',
							'</a>'].join('')
	});
	
	return Button;
	
});/**
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
				'{{content}}',
				'{{placeItem}}',
			'</div>'
		].join('')
	});
	
	return Panel;
	
});/**
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
		showPos         : 'center',        //定位方法名:center(居中)、followEl(跟随指定元素)、top(顶部)，或者传入自定义定位函数
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
			var width=me.width=me.parent.getEl().outerWidth();
			oEl.css('width',width);
		}
		//默认居中显示
		var showPos=me.showPos;
		if(typeof showPos=="string"){
			me[showPos]();
		}else if(typeof showPos=="function"){
			showPos.call(me);
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
			left: "80px",
			top:"8px",
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
		var width=me.width||oEl.outerWidth();
		var height=me.height||oEl.outerHeight();
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - width)/2;
		var y = ((oDoc.documentElement.clientHeight || oDoc.body.clientHeight) - height)/2 + (oDoc.documentElement.scrollTop||oDoc.body.scrollTop);
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
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
			_mask=$('<div class="hui-mask" style="display:none;"></div>').appendTo(document.body);
		}
		_mask.css('z-index',_popupNum*1000+998);
		if(_popupNum==0){
			_mask.show();
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
			_mask.hide();
		}else{
			_mask.css('z-index',(_popupNum-1)*1000+998);
		}
	}
	
	return Popup;
	
});/**
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
					var oCurCmp=me.find('>[_id='+oCurrentEl.attr("id")+']');
					if(oCurCmp.length>0){
						var nIndex=oCurCmp[0].index();
						me.onItemClick(oEvt,nIndex);
					}
				}
			}
		],
		
		parseItem            : fParseItem,           //分析子组件配置
		select               : fSelect,              //选中指定项
		getSelected          : fGetSelected,         //获取选中项/索引
		selectItem           : fSelectItem,          //选中/取消选中
		val                  : fVal,                 //获取/设置值
		onItemClick          : fOnItemClick          //子项点击事件处理
	});
	
	/**
	 * 分析子组件配置
	 * @param {object}oItem 子组件配置项
	 */
	function fParseItem(oItem){
		oItem.extCls=(oItem.extCls||"")+'js-item';
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
		}else{
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select(bSelect);
			}else{
				oItem.unactive();
			}
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
		if(sValue){
			var aValues=sValue.split(','),aSel=[];
			me.each(function(i,oCmp){
				oCmp.select($H.contains(aValues,oCmp.value));
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
	 * @method onItemClick
	 * @param {jQ:Event}oEvt jQ事件对象
	 * @param {number}nIndex 子项目索引
	 */
	function fOnItemClick(oEvt,nIndex){
		var me=this;
		me.select(nIndex);
		if(me.itemClick){
			var oCmp=me.children[nIndex];
			me.itemClick(oCmp,nIndex);
		}
	}
	
	
	return ControlGroup;
	
});/**
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
		if(sValue){
			me.set("value",sValue);
		}else{
			return me.get("value");
		}
	}
	
	return Radio;
	
});/**
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
		if(sValue){
			me.set('value',sValue);
		}else{
			return me.get('value');
		}
	}
	
	return Checkbox;
	
});/**
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
			radius          : 'little'
		},
//		options         : [{text:"文字",value:"值"}],    //选项
		optionClick     : function(){},
		defItem         : {
			xtype       : 'Menu',
			hidden      : true,
			markType    : 'hook',
			showPos     : 'followEl',
			renderTo    : "body"              //子组件须设置renderTo才会自动render
		},
		
		_customEvents   : ['change'],
		tmpl            : [
			'<div class="hui-btn hui-btn-gray hui-btn-icon-right">',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input {{bindAttr value="value" name="name"}}/>',
				'<span class="hui-btn-txt js-select-txt">{{text}}</span>',
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
		val              : fVal                   //获取/设置值
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
		var oOptions=oParams.options;
		//根据默认值设置默认文字
		var bHasVal=false;
		for(var i=0,len=oOptions.length;i<len;i++){
			var oOption=oOptions[i];
			if(oOption.value==oParams.value){
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
			width:me.width,
			items:oOptions
		})
	}
	/**
	 * 显示选项菜单
	 * @method setChecked
	 * @param {boolean}bChecked 仅当为false时取消选中
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
		if(sValue){
			if(me.get('value')!=sValue){
				var oMenu=me.children[0];
				var oItem=oMenu.find('>[value='+sValue+']');
				if(oItem.length>0){
					me.trigger("change");
					oItem=oItem[0];
					me.set('value',sValue);
					me.txt(oItem.get('text'));
					//更新菜单选中状态
					oMenu.select(oItem);
				}
			}
		}else{
			return me.get('value');
		}
	}
	
	return Select;
	
});/**
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
		type            : '',                  //输入框类型，默认为普通输入框，'search':搜索框
		withClear       : false,               //带有清除按钮
		
		tmpl            : [
		'<div {{bindAttr class="iconPosCls btnPosCls"}}>',
			'{{placeItem}}',
			'{{#if isTextarea}}',
				'{{textarea class="#js-input" name="name" placeholder="placeholder" value=value}}',
			'{{else}}',
				'{{input type="#text" class="#js-input #hui-input-txt" name="name" placeholder="placeholder" value="value"}}',
			'{{/if}}',
		'</div>'].join(''),
		listeners       : [
			{
				name : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('hui-focus');
				}
			},
			{
				name : 'blur',
				el : '.js-input',
				handler : function(){
					this.getEl().removeClass('hui-focus');
				}
			}
		],
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem,        //分析处理子组件
		val             : fVal,              //获取/设置输入框的值
		focus           : fFocus             //聚焦
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
		if(oSettings.isTextarea){
			//textarea高度自适应，IE6、7、8支持propertychange事件，input被其他浏览器所支持
			me.listeners.push({
				name:'input propertychange',
				el:'.js-input',
				handler:function(){
					var oTextarea=me.findEl(".js-input");
					var nNewHeight=oTextarea[0].scrollHeight;
					//TODO Firefox下scrollHeight不准确，会忽略padding
					if(nNewHeight>=50){
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
		var oInput=this.findEl('input,textarea');
		if(sValue){
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
		this.findEl('input').focus();
	}
	
	return Input;
	
});/**
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
	
});/**
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
			underline       : false,         //右边下划线，文字域默认有下划线
			hasArrow        : false          //右边箭头，有click事件时默认有箭头
		},
		
		tmpl            : [
			'<div {{bindAttr class="text?hui-rowitem-txt underline?hui-rowitem-underline"}}>',
				'{{text}}',
				'{{placeItem}}',
				'{{#if hasArrow}}',
					'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情"><span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span></a>',
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
		if(!me.get('text')){
			me.set('text',"&nbsp;");
		}
		//默认文字域有下划线
		if(me.text&&me.underline===undefined){
			me.set('underline',true);
		}
		//有点击函数时默认有右箭头
		if(oSettings.click&&me.hasArrow===undefined){
			me.set('hasArrow',true);
		}
	}
	
	return RowItem;
	
});/**
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
			title       : ''      //标题
		},
		
		tmpl            : [
			'<div>',
				'<h1 class="hui-set-title">{{title}}</h1>',
				'<div class="hui-set-content">',
					'{{placeItem}}',
				'</div>',
			'</div>'
		].join('')
		
	});
	
	return Set;
	
});/**
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
			'<div {{bindAttr class="noPadding?hui-field-nopadding"}}>',
				'<div class="hui-field-left">',
					'{{placeItem >[xrole=title]}}',
				'</div>',
				'<div class="hui-field-right">',
					'{{placeItem >[xrole=content]}}',
				'</div>',
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
		var title=me.title;
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
		var content=me.content;
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
	}
	
	return Field;
	
});/**
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
		].join('')
		
	});
	
	return Form;
	
});/**
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
			cls             : 'tabitem',
			extCls          : 'js-item'
		},
//		selected        : false,
//		title           : ''|{},        //顶部按钮，可以字符串，也可以是Button的配置项
//		content         : null,         //标签内容，可以是html字符串，也可以是组件配置项
//		activeType      : '',           //激活样式类型，
		wrapHtml    : ['<li class="hui-tab-item">','</li>'],
		defItem         : {             //默认子组件是Button
			xtype       : 'Button',
			xrole       : 'title',
			radius      : null,
			isInline    : false,
			shadow      : false
		},
		
		//属性
//		titleCmp        : null,         //标题组件
//		contentCmp      : null,         //内容组件
		tmpl            : '<div>{{placeItem >[xrole=title]}}</div>',
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
		me.titleCmp=me.find('>[xrole=title]')[0];
		me.contentCmp=me.find('>[xrole=content]')[0];
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
				extCls:'js-content'
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
		}else{
			oTitle.active();
			oContent&&oContent.show();
			me.set('selected',true);
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
	
});/**
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
			cls             : 'tab'
//			theme           : null,         //null:正常边框，"noborder":无边框，"border-top":仅有上边框
			
		},
//		activeType      : '',           //激活样式类型，
		defItem         : {             //默认子组件是TabItem
//			content     : '',           //tab内容
			xtype       : 'TabItem'
		},
		listeners       : [{
			name        : 'afterRender add remove',
			custom      : true,
			handler     : function(){
				this.layout();
			}
			
		}],
		
		tmpl            : [
			'<div>',
				'<ul class="js-tab-btns c-clear">',
					'{{placeItem >TabItem}}',
				'</ul>',
				'{{placeItem >TabItem>[xrole=content]}}',
			'</div>'
		].join(''),
		
		parseItem       : fParseItem,          //分析处理子组件 
		layout          : fLayout,             //布局
		setTabContent   : fSetTabContent       //设置标签页内容
	});
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
	 * 布局
	 */
	function fLayout(){
		var me=this;
		var nLen=me.children.length;
		var width=Math.floor(100/nLen);
		me.findEl('.js-tab-btns>li').each(function(i,el){
			if(i<nLen-1){
				el.style.width=width+'%';
			}else{
				el.style.width=(100-width*(nLen-1))+'%';
			}
		});
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
	
	return Tab;
	
});/**
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
			theme        : 'black'
		},
		
		tmpl             : [
			'<div {{bindAttr class="isHeader?hui-header isFooter?hui-footer"}}>',
				'{{placeItem}}',
				'{{#if title}}<h1 class="hui-tbar-title js-tbar-txt">{{title}}</h1>{{/if}}',
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
		if(oItem.xtype=='Button'){
			oItem.shadowSurround=true;
			if(oItem.pos=='left'){
				oItem.extCls=(oItem.extCls||"")+' hui-tbar-btn-left';
			}else if(oItem.pos=="right"){
				oItem.extCls=(oItem.extCls||"")+' hui-tbar-btn-right';
			}
		}
	}
	
	return Toolbar;
	
});/**
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
			tType           : 'big',
			theme           : 'black'
		},
//		type            : 'miniLoading',            类型，‘loading’表示居中加载中提示，‘topTips’表示顶部简单提示，‘miniLoading’表示顶部无背景loading小提示
		timeout         : 1000,
		
		tmpl            : [
			'<div {{bindAttr class="text:hui-tips-notxt"}}>',
				'{{placeItem}}',
				'{{#if text}}<span class="hui-tips-txt">{{text}}</span>{{/if}}',
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
				showPos:'top',
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				theme:null,
				noMask:true,
				tType:'mini',
				items:{
					xtype:'Icon',
					name:'loading-mini',
					hasBg:false
				}
			});
		}else if(oSettings.type=='topTips'){
			//顶部提示默认配置
			$H.extend(me,{
				showPos:'top',
				noMask:true,
				tType:'mini'
			});
		}
		me.callSuper();
	}
	
	return Tips;
	
});/**
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
		okTxt           : '确定',         //确定按钮文字
		cancelTxt       : '取消',         //取消按钮文字
//		activeBtn       : null,          //为按钮添加激活样式，1表示左边，2表示右边
//		okCall          : function(){},  //确定按钮事件函数
//		cancelCall      : function(){},  //取消按钮事件函数
		
		clickHide       : false,          //点击不隐藏
		
		tmpl            : [
			'<div>',
				'{{placeItem >[xrole=dialog-header]}}',
				'<div class="hui-dialog-body">',
					'{{#if content}}',
						'{{content}}',
					'{{else}}',
						'<div class="hui-body-content">',
							'<h1 class="hui-content-title">{{contentTitle}}</h1>',
							'<div class="hui-content-msg">{{contentMsg}}</div>',
							'{{placeItem >[xrole=dialog-content]}}',
						'</div>',
					'{{/if}}',
					'{{#unless noAction}}',
						'<div class="hui-body-action">',
						'{{placeItem >[xrole=dialog-action]}}',
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
					isMini:false,
					theme:'gray',
					pos:'left',
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
						click:function(){
							if((me.cancelCall&&me.cancelCall())!=false){
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
						isActive:me.activeBtn==2,
						click:function(){
							if((me.okCall&&me.okCall())!=false){
								me.hide();
							}
						}
					}
				});
			}
			me.add({
				xtype:'Tab',
				xrole:'dialog-action',
				theme:'border-top',
				notSelect:true,
				items:aActions
			});
		}
	}
	
	return Dialog;
	
});/**
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
//			selected         : false,             //是否选中
			isInline         : false
		},
		tmpl            : '<div {{bindAttr class="directionCls"}}>{{placeItem}}</div>',
		parseItem       : fParseItem         //分析子组件配置
	});
	
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
				hasBg:false
			};
			oItem.iconPos='left';
			oItem.activeCls='hui-item-select';
		}
		oItem.isActive=oItem.selected;
	}
	
	return Menu;
	
});/**
 * 横向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Hcard',
['C.AbstractComponent',
'CM.Model',
'CM.Collection'],
function(AC,Model,Collection){
	
	var Hcard=AC.define('Hcard');
	
	Hcard.extend({
		//初始配置
		xConfig  : {
			cls      : 'hcard',
			image    : '',    //图片
			title    : '',    //标题
			hasArrow : false, //是否有右边箭头，有点击函数时默认有右箭头
			desc     : null,    //描述，可以是单个配置也可以是配置数组{icon:图标,text:文字}
			descs    : {
				depends:['desc'],
				type : Collection.derive({
					model : Model.derive({
						fields:{
							iconCls : {
								depends:['icon'],
								parse:function(){
									var sIcon=this.get('icon');
									return sIcon?'hui-icon-'+sIcon:'';
								}
							}
						}
					})
				}),
				parse  : function(){
					var desc=this.get('desc');
					return desc?$H.isArr(desc)?desc:[desc]:desc;
				}
			}
		},
		
		tmpl     : [
			'<div {{bindAttr class="image?hui-hcard-hasimg"}}>',
				'{{#if image}}',
					'<div class="hui-hcard-img">',
						'<img {{bindAttr src="image"}}>',
					'</div>',
				'{{/if}}',
				'<div class="hui-hcard-content">',
					'<div class="hui-content-title">{{title}}</div>',
					'{{#each descs}}',
						'<div class="hui-content-desc">',
							'{{#if icon}}',
								'<span {{bindAttr class="#hui-icon #hui-mini #hui-alt-icon iconCls #hui-light"}}></span>',
							'{{/if}}',
							'{{text}}',
						'</div>',
					'{{/each}}',
				'</div>',
				'{{placeItem}}',
				'{{#if hasArrow}}',
					'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情">',
						'<span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span>',
					'</a>',
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
			me.hasArrow=true;
		}
	}
		
	return Hcard;
	
});/**
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
			image        : '',    //图片
			title        : '',    //标题
			extraTitle   : ''     //标题右边文字
		},
		
		tmpl         : [
			'<div>',
				'<div class="hui-vcard-title hui-title-hasimg c-clear">',
					'<div class="hui-title-img">',
						'<img {{bindAttr src="image"}}>',
					'</div>',
					'<div class="hui-title-txt">{{title}}</div>',
					'<div class="hui-title-extra">{{extraTitle}}</div>',
				'</div>',
				'{{placeItem >[xrole!=action]}}',
				'<div class="hui-vcard-action">',
					'{{placeItem >[xrole=action]}}',
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
	
});/**
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
			cls         : 'mlist',
			isEmpty     : false,             //列表是否为空
			emptyTips   : '暂无结果',         //空列表提示
			pdText      : '下拉可刷新',       //下拉刷新提示文字
			pdComment   : '上次刷新时间：',    //下拉刷新附加说明
			pdTime      : '',                //上次刷新时间
			hasPullRefresh : false           //是否有下拉刷新
		},
//		itemXtype   : '',                //子组件默认xtype
//		refresh     : null,              //刷新接口
//		getMore     : null,              //获取更多接口
		
		tmpl        : [
			'<div class="hui-list">',
				'<div class="hui-list-inner">',
					'{{#if isEmpty}}',
						'<div class="hui-list-empty js-empty">{{emptyTips}}/div>',
					'{{/if}}',
					'{{#if hasPullRefresh}}',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle">',
								'<span class="hui-icon hui-alt-icon hui-icon-arrow-d hui-light"></span>',
								'<span class="hui-icon hui-alt-icon hui-icon-loading-mini"></span>',
								'<div class="hui-pd-txt">',
									'{{#if pdText}}<div class="js-txt">{{pdText}}</div>{{/if}}',
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
					'<div class="js-item-container">{{placeItem}}</div>',
					'{{#if hasPullRefresh}}',
						'<div class="hui-list-more">',
							'<a href="javascript:;" hidefocus="true" class="hui-btn hui-btn-gray hui-shadow hui-inline hui-radius-normal">',
								'<span class="hui-btn-txt">查看更多</span>',
							'</a>',
						'</div>',
					'{{/if}}',
				'</div>',
			'</div>'
		].join(''),
		init                : fInit,               //初始化
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem,     //删除列表项
		refreshScroller     : fRefreshScroller,    //刷新iScroll
		destroy             : fDestroy             //销毁
	});
	/**
	 * 初始化
	 */
	function fInit(){
		var me=this;
		if(me.itemXtype){
			(me.defItem||(me.defItem={})).xtype=me.itemXtype;
		}
		var oListItems=me.model;
		oListItems.each(function(i,item){
			me.addListItem(item);
		});
		me.listenTo(oListItems,{
			'add':function(sEvt,oListItem){
				me.addListItem(oListItem);
			},
			'remove':function(sEvt,oListItem){
				me.removeListItem(oListItem);
			},
			'reset':function(){
				me.removeListItem('emptyAll');
			}
		});
		//下拉刷新
		me.hasPullRefresh=me.hasPullRefresh&&window.iScroll;
		if(me.hasPullRefresh){
			//如果在afterShow里初始化iScroll，会看见下拉刷新的元素，所以这里先初始化，afterShow时再调用refresh
			me.listen({
				name : 'afterRender',
				handler : function(){
					var me=this;
					var oWrapper=me.getEl();
					var oPdEl=oWrapper.find('.hui-list-pulldown');
					var nStartY=50;
					var sRefreshCls='hui-pd-refresh';
					var sReleaseCls='hui-pd-release';
					me.scroller= new window.iScroll(oWrapper[0], {
						useTransition: true,
						topOffset: nStartY,
						onRefresh: function () {
							if(oPdEl.hasClass(sRefreshCls)){
				                oPdEl.removeClass(sRefreshCls+' '+sReleaseCls);  
				                me.set('pdText','下拉可刷新');  
							}
						},
						onScrollMove: function () {
							if (this.y > 5 && !oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sReleaseCls);  
				                me.set('pdText','松开可刷新');  
								this.minScrollY = 0;
				            } else if (this.y < 5 && oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.removeClass(sReleaseCls);;  
				                me.set('pdText','下拉可刷新'); 
								this.minScrollY = -nStartY;
				            } 
						},
						onScrollEnd: function () {
							if (oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sRefreshCls);  
				                me.set('pdText','正在刷新'); 
				                me.refresh();
				            }
						}
					});
					
				}
			});
			//同步数据后需要刷新
			me.listenTo(me.model,'sync',function(){
				me.findEl('.js-pdTime').html($H.formatDate($H.now(),'HH:mm'));
				setTimeout(function(){
					me.refreshScroller();
				},0);
			});
			//show后需要refresh下，否则无法滚动，iscroll需要浏览器渲染后才能正常初始化
			me.listen({
				name:'afterShow',
				handler:function(){
					me.refreshScroller();
				}
			});
			me.listen({
				name    : 'click',
				method : 'delegate',
				selector : '.hui-list-more',
				handler : function(){
					me.getMore();
				}
			});
		}
	}
	/**
	 * 添加列表项
	 * @param {Object}oListItem 列表项模型
	 */
	function fAddListItem(oListItem){
		var me=this;
		me.set('isEmpty',false);
		me.add({
			model:oListItem
		});
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
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("M.AbstractModule","CM.View",function (View) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = $H.createClass();
	
	$H.inherit(AbstractModule,View, {
		
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		                                 //模块初始化后以_container为准，获取需用getEl方法
//		notCache       : false,          //{boolean}是否不使用cache，默认使用,仅当配置成true时不使用
//      clearCache     : false,          //仅清除一次当前的缓存，下次进入模块时执行清除并恢复原先缓存设置
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		useCache       : $H.noop,        //判断是否使用模块缓存
		cache          : $H.noop,        //显示模块缓存时调用
		init           : $H.noop,        //初始化函数, 在模块创建后调用（在所有模块动作之前）
		reset          : $H.noop,        //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},  //离开该模块前调用, 返回true允许离开, 否则不允许离开
		cleanCache     : fCleanCache     //清除模块缓存
	});
	/**
	 * 清除模块缓存
	 */
	function fCleanCache(){
		this.clearCache=true;
	}
	
	return AbstractModule;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/
//handy.module.AbstractNavigator
$Define("M.AbstractNavigator","handy.base.Object",function (Object) {
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
});/****************************************************************
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
'handy.base.HashChange',
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
		back               : fBack             //后退一步
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
		var me=this,
			oHashParam=me.getHashParam(),
		    sKey=oHashParam.hKey,
		 	sCurKey=me.currentKey,
		 	aStates=me.states,
		 	oCurState=aStates[sCurKey];
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		//&&$H.equals(oHashParam.param,oCurState.param)
		if(sKey==sCurKey){
			return false;
		}
		var oState=aStates[sKey];
		var bResult;
		if(oState){
			bResult=oState.onStateChange(oState.param,true);
		}else{
			$D.warn("hisory state not found");
			bResult=me.error('stateNotFound',oHashParam);
		}
		//如果调用不成功，则恢复原先的hashstate
		if(bResult!=true){
			oHashParam={
				hKey    : sCurKey,
				param   : oCurState.param
			};
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
		me.saveHash({
			hKey    : sHistoryKey,
			param   : oState.param
		});
	}
	/**
	 * 保存状态值到hash中
	 * @method saveHash
	 * @param {*}param 要保存到hash中的参数
	 */
	function fSaveHash(param){
		//这里主动设置之后还会触发hashchange，不能在hashchange里添加set方法屏蔽此次change，因为可能不止一个地方需要hashchange事件
		$H.setHash("#"+$H.Json.stringify(param));
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		var me=this;
		try{
			var sHash=$H.getHash().replace("#","");
			var oHashParam=$H.parseJson(sHash);
			return oHashParam;
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var me=this;
		try{
			var oHashParam=me.getHashParam();
			return me.states[oHashParam.hKey];
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
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
			for(var i=0;i++;i<nLen){
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
	
	return History;
	
});/****************************************************************
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
"CM.AbstractManager"],
function(History,AbstractManager){
	
	var ModuleManager=$H.createClass();
	
	//TODO 使用AbstractManager的方法
	$H.inherit(ModuleManager,AbstractManager,{
		
		type               : 'module',
		
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		
//		requestMod         : '',     //正在请求的模块名
//		currentMod         : '',     //当前模块名
		
		_createMod         : _fCreateMod,       //新建模块
		_showMod           : _fShowMod,         //显示模块
		_destroy           : _fDestroy,         //销毁模块
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo,              //进入模块
		update             : fUpdate,          //更新模块
		clearCache         : fClearCache,      //清除缓存模块
		back               : fBack             //后退一步
	});
	
	/**
	 * 新建模块
	 * @method _createMod
	 * @param 
	 */
	function _fCreateMod(oParams){
		var me=this;
		var sModName=oParams.modName;
		//先标记为正在准备中，新建成功后赋值为模块对象
		me.modules[sModName]={waiting:true};
		//请求模块
		$Require(me.defModPackage+sModName,function(Module){
			var oOptions={
				renderTo:me.container,
				name:sModName,
				xtype:sModName,
				extCls:'js-module m-module m-'+sModName.replace(/\./g,'-'),
				hidden:true
			};
			$H.extend(oOptions,oParams);
			var oMod=new Module(oOptions);
			me.modules[sModName]=oMod;
			$H.trigger('afterRender',oMod.getEl());
			//可能加载完时，已切换到其它模块了
			if(me.requestMod==sModName){
				me._showMod(oMod);
			}
		});
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param
	 */
	function _fShowMod(oMod){
		var me=this;
		var oCurMod=me.modules[me.currentMod];
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(!(me.navigator&&me.navigator.navigate(oMod,oCurMod,me))){
			if(oCurMod){
				oCurMod.hide();
			}
			oMod.show();
		}
		if(oCurMod){
			oCurMod.isActive=false;
		}
		oMod.isActive=true;
		me.currentMod=oMod.name;
	}
	/**
	 * 销毁模块
	 * @method _destroy
	 * @param {Module}oMod 待销毁的模块
	 */
	function _fDestroy(oMod){
		var me=this;
		oMod.destroy();
		delete me.modules[oMod.name];
	}
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage  : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator   : 定制导航类
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
		me.defModPackage=me.defModPackage+".";
		me.history=new History(function(sCode,oParam){
			me.go(oParam.param);
		});
		me.modules={};
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
		var me=this;
		if(typeof param=="string"){
			param={modName:param};
		}
		var sModName=param.modName;
		//当前显示的模块名
		var sCurrentMod=me.currentMod;
		var oMods=me.modules;
		var oCurrentMod=oMods[sCurrentMod];
		//如果要进入的正好是当前显示模块，调用模块reset方法
		if(sCurrentMod==sModName){
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
			}else if(oCurrentMod.exit()==false){
				//模块返回false，不允许退出
				return false;
			}
		}
		
		//标记当前请求模块，主要用于异步请求模块回调时判断是否已经进了其它模块
		me.requestMod=sModName;
		
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod){
			//标记使用缓存，要调用cache方法
			if(oMod.notCache!=true&&oMod.clearCache!=true&&oMod.useCache(param)!=false){
				//恢复设置
				oMod.clearCache==false;
				me._showMod(oMod);
				oMod.cache(param);
			}else if(!oMod.waiting){
				//标记不使用缓存，销毁模块
				me._destroy(oMod);
				//重新标记当前模块
//				me.currentMod=sModName;
				//重新创建模块
				me._createMod(param);
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			me._createMod(param);
		}
		//主要是处理前进和后退hash变化引起的调用，不需要再保存历史记录
		if(bNotSaveHistory!=true){
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:param
			});
		}
		return true;
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
			this.modules[oModule.name]=oNew;
			$H.trigger('afterRender',oNew.getEl());
		}
		return oNew;
	}
	/**
	 * 清除缓存模块
	 * @param {Module}oModule 参数模块
	 */
	function fClearCache(oModule){
		oModule.notCache=true;
	}
	/**
	 * 后退一步
	 * @method back
	 * @param {boolean=} 当传入true时，强制退出当前模块，即不调用模块的exit而直接退出
	 */
	function fBack(bForceExit){
		var me=this;
		if(bForceExit){
			me.modules[me.currentMod]._forceExit=true;
		}
		history.back();
	}
	
	return ModuleManager;
	
});
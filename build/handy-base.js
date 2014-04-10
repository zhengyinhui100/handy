/* Handy v1.0.0-dev | 2014-04-10 | zhengyinhui100@gmail.com */
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
	handy.expando    = "handy" + ( handy.version + Math.random() ).replace( /\D/g, "" );    //自定义属性名
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
			if('Browser,Class,Array,Cookie,Date,Events,Function,Json,Object,String,Template,Util'.indexOf(sName)>=0){
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
	
	var Obj={
		_alias              : {                 //存储别名，公共库建议大写，以便更好地与普通名称区别开，具体项目的别名建议小写
			'B'             : 'handy.base',
			'C'             : 'handy.component',
			'M'             : 'handy.module',
			'CM'            : 'handy.common'
		},               
		ns                  : fNamespace,       //创建或读取命名空间，可以传入用以初始化该命名空间的对象
		alias               : fAlias,           //创建别名/读取实名
		extend              : fExtend,          //对象的属性扩展
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
		sPath=Obj.alias(sPath);
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
	 * @param {string=}sAlias 别名，如'B.Obj'，为空时表示读取所有存储的别名
	 * @param {string=}sOrig 原名，如'handy.base.Obj'，为空时表示读取实名
	 */
	function fAlias(sAlias,sOrig){
		var oAlias=Obj._alias;
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
    * 对象的属性扩展
    * @method extend(oDestination, oSource , oOptions=)
    * @param {Obj} oDestination 目标对象
    * @param {Obj} oSource 源对象
    * @param {Obj=} oOptions(可选){
    * 				{array=}cover 仅覆盖此参数中的属性
    * 				{boolean=|array=|function(sprop)=}notCover 不覆盖原有属性/方法，当此参数为true时不覆盖原有属性；当此参数为数组时，
    * 					仅不覆盖数组中的原有属性；当此参数为函数时，仅当此函数返回true时不执行拷贝，PS：不论目标对象有没有该属性
    * 				{boolean=}isClone 克隆，仅当此参数为true时克隆
    * 					源对象的修改会导致目标对象也修改
    * }
    * @return {Obj} 扩展后的对象
    */
    function fExtend(oDestination, oSource, oOptions) {
    	if(!oSource||Obj.isStr(oSource)||Obj.isNum(oSource)){
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
        	if(!aCover||Obj.contains(aCover,sProperty)){
	        	//不复制深层prototype
	        	if(oSource.hasOwnProperty(sProperty)){
		        	var bHas=oDestination.hasOwnProperty(sProperty);
		        	var bNotCover=notCover===true?bHas:false;
		        	//当此参数为数组时，仅不覆盖数组中的原有属性
		        	if(Obj.isArr(notCover)){
		        		bNotCover=Obj.contains(notCover,sProperty)&&bHas;
		        	}else if(Obj.isFunc(notCover)){
		        		//当此参数为函数时，仅当此函数返回true时不执行拷贝，PS：不论目标对象有没有该属性
		        		bNotCover=notCover(sProperty,value);
		        	}
		            if (!bNotCover) {
		            	var value=bIsClone?Obj.clone(value):value;
		            	//为方法添加元数据：方法名和声明此方法的类
						if(bAddMeta&&Obj.isFunc(value)){
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
    * 自定义的继承方式，可以继承object和prototype，prototype方式继承时，非原型链方式继承。
	* 如需原型链方式继承使用Object.inherit。
	* 此继承方式的继承的对象可以是对普通对象或者是prototype对象，并且可以实现多重继承
    * @param {Obj} oChild 子对象
    * @param {Obj} oParent 父对象
    * @param {Obj} oExtend 扩展的属性方法
    * @param {Obj} oPrototypeExtend 扩展的prototype属性方法
    * @return {Obj} 扩展后的类
    */
    //TODO 重写
    function fMix(oChild, oParent, oExtend, oPrototypeExtend) {
        if (!oChild.superProto) {
            oChild.superProto = {};
        }
        for (var sProperty in oParent) {
            if(Obj.isFunc(oParent[sProperty])){// 如果是方法
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
            Obj.extend(oChild, oExtend);
        }
        // toString 单独处理
        if (oParent.toString != oParent.constructor.prototype.toString) {
            oChild.superProto.toString = function () {
                oParent.toString.apply(oChild, arguments);
            };
        }
        if (oPrototypeExtend && oChild.prototype && oParent.prototype) {
            //Obj.inherit(oChild, oParent,null, oPrototypeExtend);
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
    	return Obj.isStr(obj)||Obj.isNum(obj)||Obj.isBool(obj);
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
    * @param {Obj} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsFunc(obj) {
        return Object.prototype.toString.call(obj) === "[object Function]";
    }
    /**
    * 对象是否是数组类型
    * method isArr
    * @param {Obj} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsArr(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
    /**
     * 是否是对象
     * @param {*}obj 参数对象
     * @return {boolean} true表示是对象类型
     */
    function fIsObj(obj){
    	return typeof obj=='object'&&!Obj.isArr(obj);
    }
    /**
     * 判断对象是否是类
     * @param {*}obj 参数对象
     * @return {boolean} true表示参数对象是类
     */
    function fIsClass(obj){
    	return Obj.isFunc(obj)&&obj.$isClass===true;
    }
    /**
    * 对比对象值是否相同
    * @method equals
    * @param {Obj} o1 对象1
    * @param {Obj} o2 对象2
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
                    if (Obj.isArr(o1) && Obj.isArr(o2)) {
                        //数组长度不相等，不相等
                        if (o1.length != o2.length) {
                            return false;
                        }
                        for (var i = 0, m = o1.length; i < m; i++) {
                            if (!Obj.equals(o1[i], o2[i])) {
                                return false;
                            }
                        }
                        return true;
                        //对象判断
                    } else if (!Obj.isArr(o1) && !Obj.isArr(o2)) {
                    	//对象属性项不一样
                    	if(Obj.count(o1)!=Obj.count(o2)){
                    		return false;
                    	}
                        for (var sKey in o1) {
                            if (o2[sKey] == undefined) {
                                return false;
                            }
                            if (!Obj.equals(o1[sKey], o2[sKey])) {
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
    * @param {Obj} oFrom 需要clone的对象
    * @return {Obj} 返回克隆的对象，如果对象属性不支持克隆，将原来的对象返回
    */
	function fClone(oFrom){
		if(oFrom == null || typeof(oFrom) != 'object'){
			return oFrom;
		}else{
			var Constructor = oFrom.constructor;
			if (Constructor != Object && Constructor != window.Array){
				return oFrom;
			}else{

				if (Constructor == window.Date || Constructor == window.RegExp || Constructor == window.Function ||
					Constructor == window.String || Constructor == window.Number || Constructor == window.Boolean){
					return new Constructor(oFrom);
				}else{
					try{
						var oTo = new Constructor(); // changed

						for(var key in oFrom){
							oTo[key] = Obj.clone(oFrom[key]);
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
    * @param {Obj}object 参数对象
    * @return {boolean} 返回判断结果
    */
    function fIsEmpty(object) {
        if (Obj.isArr(object)) {
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
			bIsObj = nLength === undefined || Obj.isFunc( object );
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
    	Obj.each(obj,function(i,p){
    		if(Obj.equals(p,prop)){
    			bIsContain=true;
    			return false;
    		}
    	});
    	return bIsContain;
    }
    /**
     * 是否大于另一个对象|数组（包含另一个对象的所有属性或包含另一个数组的所有元素）
     * @method largeThan
     * @param {Obj|Array}o1 要比较的对象
     * @param {Obj|Array}o2 比较的对象
     */
    function fLargeThan(o1,o2){
    	if(typeof o1=='object'&&typeof o2=='object'){
    		var bResult=true;
    		Obj.each(o2,function(p,v){
    			if(!Obj.equals(o2[p],o1[p])){
    				return bResult=false;
    			}
    		});
    		return bResult;
    	}
    }
    /**
    * 计算对象长度
    * @method count
    * @param {Obj}oParam 参数对象
    * @return {number} 返回对象长度
    */
    function fCount(oParam) {
        if (Obj.isArr(oParam)) {
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
     * @param {Obj|Array}obj 参数对象
     * @param {boolean=}bNew 是否新建结果对象，不影响原对象
     * @param {Obj|Array} 返回结果
     */
    function fRemoveUndefined(obj,bNew){
    	var bIsArray=Obj.isArr(obj);
    	if(bNew){
    		if(bIsArray){
    			var aResult=[];
    			Obj.each(obj,function(k,value){
		    		if(value!==undefined){
		    			aResult.push(value);
		    		}
	    		});
	    		return aResult;
    		}else{
	    		return Obj.extend({},obj,{
	    			isClone:true,
	    			notCover:function(k,value){
	    				return value===undefined;
	    		}});
    		}
    	}else{
	    	Obj.each(obj,function(k,value){
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
    * @param {Obj}oParam 参数对象
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
    * @param {Obj}oTarget 需要生成方法的对象
    * @param {string|Array.<string>}method 需要生成的方法列表，如果是字符串，用","作为分隔符
    * @param {function()}fDefined 方法定义函数，该函数执行后返回方法定义
    * @return {Array} 返回转换后的数组
    */
    function fGenerateMethod(oTarget,method,fDefined){
    	var aMethod=Obj.isArr(method)?method:method.split(",");
    	for ( var i = 0; i < aMethod.length; i++ ){
			var sMethod = aMethod[i];
			oTarget[sMethod] = fDefined(sMethod);
    	}
    }
	
	return Obj;
	
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
					'<a href="javascript:void(0)" onclick="if(this.innerHTML==\'全屏\'){this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';this.innerHTML=\'收起\'}else{this.parentNode.style.height=\'100px\';this.innerHTML=\'全屏\';}">全屏</a>',
					'<a href="javascript:void(0)" onclick="var oDv=this.parentNode.getElementsByTagName(\'div\')[0];if(this.innerHTML==\'底部\'){oDv.scrollTop=oDv.scrollHeight;this.innerHTML=\'顶部\';}else{oDv.scrollTop=0;this.innerHTML=\'底部\';}">顶部</a>',
					'<a href="javascript:void(0)" onclick="location.reload();">刷新</a>',
					'<a href="javascript:void(0)" onclick="history.back();">后退</a>'
				].join('&nbsp;&nbsp;&nbsp;&nbsp;')+'<div style="padding-top:5px;height:90%;overflow:auto;"></div>';
				oDebugDiv.style.position = 'fixed';
				oDebugDiv.style.width = (oDocument.body.offsetWidth-20)+'px';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '150px';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '12px';
				oDebugDiv.style.padding = '10px';
				oDebugDiv.style.zIndex = 9999999999;
				oDebugDiv.style.opacity=0.8;
				oDebugDiv.style.filter="alpha(opacity=80)";
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			//这里原生的JSON.stringify有问题(&nbsp;中最后的'p;'会丢失)，统一强制使用自定义方法
			var sMsg=$H.Json.stringify(oVar, null, '&nbsp;&nbsp;&nbsp;&nbsp;',true).replace(/\n/g,'<br/>');
			oAppender.innerHTML += sType+" : "+sMsg+"<br/>";
			oAppender.scrollTop=oAppender.scrollHeight;
		}
		try{
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
			Array.prototype.push.apply(aBindArgs, arguments);
			return fFunc.apply(oScope, aBindArgs);
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
            	for(var p in me){
            		if(typeof me[p]=="object"){
            			me[p]=Object.clone(me[p]);
            		}
            	}
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
        	if(oSuper&&!oSuper.$isClass&&oSuper.length!=undefined){
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
    		if(sUrl.indexOf('/')!=0){
    			sUrl='/'+sUrl;
    		}
    		sUrl=sRoot+sUrl;
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
		if(Loader.traceLog){
			Debug.info(_LOADER_PRE+"request:"+sUrl);
   		}
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
    	//插入到皮肤css之前
    	_eHead.insertBefore(eCssNode,Loader.skinNode);
    	if(Loader.traceLog){
			Debug.info(_LOADER_PRE+"request:"+sUrl);
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
		eNode.onload = eNode.onerror = eNode.onreadystatechange = function() {
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
			Debug.info(_LOADER_PRE+"Response: "+sId);
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
	    		$D.error(_RESOURCE_NOT_FOUND+oResult.notExist);
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
					//考虑到传入依赖是数组，这里回调参数形式依然是数组
					resource=factory.apply(null,arguments);
					if(Loader.traceLog){
						Debug.info(_LOADER_PRE+"define: "+sId);
					}
				}catch(e){
					//资源定义错误
					e.message=_LOADER_PRE+sId+":factory define error:"+e.message;
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
				$D.error(_LOADER_PRE+'factory no return: '+sId);
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
					Debug.info(_RESOURCE_NOT_FOUND+sId);
		   		}
    		}else{
    			aExisteds.push(oResult.exist[0]);
    		}
    	}
    	
    	//没有需要加载的资源，直接执行回调或返回资源
    	if(aRequestIds.length==0){
    		fCallback&&fCallback.apply(null,aExisteds);
    		return aExisteds.length==0?aExisteds[0]:aExisteds;
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
		$H.each(me._execEvtCache,function(i,oEvent){
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
		me._execEvtCache=[];
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
	 	me.on.apply(me,aArgs.push(1));
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
		var oDate=oDate||new WDate();

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
	 * @param {boolean=}bFormat 仅当true进行格式化：小于60分钟的单位是分钟，
	 * 					小于一天的单位是小时，小于30天的单位是天，大于30天返回"30天前"
	 */
	function fHowLong(oTime,bFormat){
		var oNow=Date.now();
		var time=oNow.getTime()-oTime.getTime();
		if(bFormat){
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
		if(sName!=undefined&&sValue!=undefined){
			aParam.push(sName + "=" + escape(sValue));
		}
		if(oOptions){
			if(oOptions.path!=undefined){
				aParam.push("path=" + oOptions.path);
			}
			if(oOptions.domain!=undefined){
				aParam.push("domain=" + oOptions.domain);
			}
			if(oOptions.expires!=undefined){
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
		getUuid          : fGetUuid,   //获取handy内部uuid
		getHash          : fGetHash,   //获取hash，不包括“？”开头的query部分
		setHash          : fSetHash,   //设置hash，不改变“？”开头的query部分
		distance         : fDistance,  //计算两点距离(单位为km，保留两位小数)
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
	 * @method  getUuid
	 * @return  {number}  返回uuid
	 */
	function fGetUuid(){
		return _nUuid++;
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
	 * 计算两点距离(单位为km，保留两位小数)
	 * @param {Object|Array|Model}oCoord1 参数坐标1
	 * 				Object类型{
	 * 					{number}latitude:纬度,
	 * 					{number}longitude:经度
	 * 				}
	 * 				Array类型[{number}latitude,{number}longitude]
	 * 				Model类型，包含latitude和longitude属性
	 * @param {Object|Array}oCoord2 参数坐标2
	 * @param {boolean=}bFormat 仅当true进行格式化：单位是km(取两位小数)，如：32120->3.21km
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
        var EARTH_RADIUS = 6378.137,nLat1,nLng1,nLat2,nLng2;
        oCoord1=_fFormatData(oCoord1);
    	nLat1=oCoord1[0];
        nLng1=oCoord1[1];
        oCoord2=_fFormatData(oCoord2);
        nLat2=oCoord2[0];
        nLng2=oCoord2[1];
        var nRadLat1 = _fRad(nLat1);
	    var nRadLat2 = _fRad(nLat2);
	    var nRadLatDif = nRadLat1 - nRadLat2;
	    var nRadLngDif = _fRad(nLng1) - _fRad(nLng2);
	    var nDistance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(nRadLatDif/2),2) +
	     	Math.cos(nRadLat1)*Math.cos(nRadLat2)*Math.pow(Math.sin(nRadLngDif/2),2)));
	    nDistance = nDistance * EARTH_RADIUS;
	    nDistance = Math.round(nDistance * 10000);
	    nDistance=(nDistance/1000).toFixed(2);
	    if(bFormat){
	    	if(isNaN(nDistance)){
	    		return '未知';
	    	}
	    	nDistance+='km';
	    }
	    return nDistance;
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
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Template','B.String',function(String,$H){
		
	var T={
		//配置
		openTag         : '<%',            //模板语法开始标签
		closeTag        : '%>',            //模板语法结束标签
		isEscape        : true,            //是否开启js变量输出转义
		
		registerHelper  : fRegisterHelper, //添加辅助函数
		tmpl            : fTmpl            //渲染模板
	};
	
	var _cache={},                //缓存
		_valPreReg=/^=/,          //简单替换正则
		_isNewEngine = ''.trim,   // '__proto__' in {}
		//辅助函数
		_helpers={
			escape:String.escapeHTML,
			trim:String.trim
		},
		//辅助函数内部定义语句
		_helpersDefine='var oHelpers=arguments.callee.$helpers,escape=oHelpers.escape,trim=oHelpers.trim,';
		
	/**
	 * 设置变量
	 * @method _fSetValue
	 * @param  {string}sTmpl 模板字符串
	 * @param  {Object}oData     	数据
	 * @return {string}          返回结果字符串
	 */
	function _fSetValue(sTmpl,oData){
		return sTmpl.replace(_valPreReg,function(){
			return oData&&oData[arguments[1]]||'';
		});
	}
	/**
	 * 结果函数添加一行字符串
	 * @method _fAddLine
	 * @param {string}sCode 要添加的代码
	 * @return {string} 返回添加好的代码
	 */
	function _fAddLine(sCode){
		//旧浏览器使用数组方式拼接字符串
        return _isNewEngine?'$r+='+sCode+';\n':'$r.push('+sCode+');\n';
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
		var sCode=_fAddLine('"'+sHtml+'"');
		return sCode;
	}
	/**
	 * 处理脚本
	 * @method _fParseScript
	 * @param {string}sScript script字符串
	 * @return {string} 返回处理过的脚本
	 */
	function _fParseScript(sScript){
		sScript=sScript.replace(/this/g,'$data');
		//输出内容
		if(sScript.indexOf('=')==0){
			var sExp="("+sScript.replace(_valPreReg,'')+")";
			sExp=sExp+'==undefined?"":'+sExp;
			sScript=_fAddLine(sExp);
		}
		return sScript+"\n";
	}
	/**
	 * 编译模板
	 * @method _fCompile
	 * @param  {string}sTmpl 模板字符串
	 * @return {string}      返回结果字符串
	 */
	function _fCompile(sTmpl){
		//旧浏览器使用数组方式拼接字符串
		var sCode=_helpersDefine+'$r='+(_isNewEngine?'""':'[]')+';\n';
		var oMatch;
		//循环处理模板，分离html和script部分
		$H.Object.each(sTmpl.split(T.openTag),function(i,sValue){
			var aCode=sValue.split(T.closeTag);
			//[html]
			if(aCode.length==1){
				sCode+=_fParseHtml(aCode[0]);
			}else{
				//[script,html]
				sCode+=_fParseScript(aCode[0]);
				if(aCode[1]){
					sCode+=_fParseHtml(aCode[1]);
				}
			}
		})
		sCode+='return '+(_isNewEngine?'$r;':'$r.join("");');
//		$D.log(sCode);
		var fRender=new Function('$data',sCode);
		fRender.$helpers=_helpers;
		return fRender;
	}
	/**
	 * 添加辅助函数
	 * @param {string}sName 辅助函数名
	 * @param {Function}fHelper 辅助函数
	 */
	function fRegisterHelper(sName,fHelper){
		if(!_helpers[sName]){
			_helpersDefine+=sName+'=oHelpers.'+sName+',';
		}
		_helpers[sName]=fHelper;
	}
	/**
	 * 执行模板
	 * @method tmpl
	 * @param {object|string|Array}tmpl 当tmpl为字符串或字符串数组时，表示模板内容，为对象时如下：
	 * {
	 * 		{string}id : 模板的id，要使用缓存，就必须传入id
	 * 		{string|Array=}tmpl : 模板字符串，以id为缓存key，此参数为空时，表示内容为根据id查找到的script标签的内容
	 * }
	 * @param {object}oData 数据
	 * @return {function|string} 当oData为空时返回编译后的模板函数，不为空时返回渲染后的字符串
	 */
	function fTmpl(tmpl,oData){
		var sTmpl,fTmpl,sId;
		if(typeof tmpl=='string'){
			sTmpl=tmpl;
		}else if(tmpl.length!=undefined){
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
				$H.Debug.error('模板未定义');
				return;
			}
			fTmpl=_fCompile(sTmpl);
			//根据id缓存
			if(sId){
				_cache[sId]=fTmpl;
			}
		}
		//渲染数据
		if(oData){
			return fTmpl(oData);
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
	
	
})(handy);
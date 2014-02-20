/* Handy v1.0.0-dev | 2014-02-20 | zhengyinhui100@gmail.com */
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
	
})()/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
handy.add('Json',function(){
	var JSON;
	if (!JSON) {
	    JSON = {};
	}
	
	(function () {
	    'use strict';
	
	    function f(n) {
	        // Format integers to have at least two digits.
	        return n < 10 ? '0' + n : n;
	    }
	
	    if (typeof Date.prototype.toJSON !== 'function') {
	
	        Date.prototype.toJSON = function (key) {
	
	            return isFinite(this.valueOf())
	                ? this.getUTCFullYear()     + '-' +
	                    f(this.getUTCMonth() + 1) + '-' +
	                    f(this.getUTCDate())      + 'T' +
	                    f(this.getUTCHours())     + ':' +
	                    f(this.getUTCMinutes())   + ':' +
	                    f(this.getUTCSeconds())   + 'Z'
	                : null;
	        };
	
	        String.prototype.toJSON      =
	            Number.prototype.toJSON  =
	            Boolean.prototype.toJSON = function (key) {
	                return this.valueOf();
	            };
	    }
	
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;
	
	
	    function quote(string) {
	
	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.
	
	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string'
	                ? c
	                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }
	
	
	    function str(key, holder) {
	
	// Produce a string from holder[key].
	
	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            mind = gap,
	            partial,
	            value = holder[key];
	
	// If the value has a toJSON method, call it to obtain a replacement value.
	
	        if (value && typeof value === 'object' &&
	                typeof value.toJSON === 'function') {
	            value = value.toJSON(key);
	        }
	
	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.
	
	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }
	
	// What happens next depends on the value's type.
	
	        switch (typeof value) {
	        case 'string':
	            return quote(value);
	
	        case 'number':
	
	// JSON numbers must be finite. Encode non-finite numbers as null.
	
	            return isFinite(value) ? String(value) : 'null';
	
	        case 'boolean':
	        case 'null':
	
	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce 'null'. The case is included here in
	// the remote chance that this gets fixed someday.
	
	            return String(value);
	
	// If the type is 'object', we might be dealing with an object or an array or
	// null.
	
	        case 'object':
	
	// Due to a specification blunder in ECMAScript, typeof null is 'object',
	// so watch out for that case.
	
	            if (!value) {
	                return 'null';
	            }
	
	// Make an array to hold the partial results of stringifying this object value.
	
	            gap += indent;
	            partial = [];
	
	// Is the value an array?
	
	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	
	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.
	
	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }
	
	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.
	
	                v = partial.length === 0
	                    ? '[]'
	                    : gap
	                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	                    : '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }
	
	// If the replacer is an array, use it to select the members to be stringified.
	
	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof rep[i] === 'string') {
	                        k = rep[i];
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {
	
	// Otherwise, iterate through all of the keys in the object.
	
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }
	
	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.
	
	            v = partial.length === 0
	                ? '{}'
	                : gap
	                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	                : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }
	
	// If the JSON object does not yet have a stringify method, give it one.
	
	    if (typeof JSON.stringify !== 'function') {
	        JSON.stringify = function (value, replacer, space) {
	
	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.
	
	            var i;
	            gap = '';
	            indent = '';
	
	// If the space parameter is a number, make an indent string containing that
	// many spaces.
	
	            if (typeof space === 'number') {
	                for (i = 0; i < space; i += 1) {
	                    indent += ' ';
	                }
	
	// If the space parameter is a string, it will be used as the indent string.
	
	            } else if (typeof space === 'string') {
	                indent = space;
	            }
	
	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.
	
	            rep = replacer;
	            if (replacer && typeof replacer !== 'function' &&
	                    (typeof replacer !== 'object' ||
	                    typeof replacer.length !== 'number')) {
	                throw new Error('JSON.stringify');
	            }
	
	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.
	
	            return str('', {'': value});
	        };
	    }
	
	
	// If the JSON object does not yet have a parse method, give it one.
	
	    if (typeof JSON.parse !== 'function') {
	        JSON.parse = function (text, reviver) {
	
	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.
	
	            var j;
	
	            function walk(holder, key) {
	
	// The walk method is used to recursively walk the resulting structure so
	// that modifications can be made.
	
	                var k, v, value = holder[key];
	                if (value && typeof value === 'object') {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            if (v !== undefined) {
	                                value[k] = v;
	                            } else {
	                                delete value[k];
	                            }
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }
	
	
	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.
	
	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return '\\u' +
	                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }
	
	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with '()' and 'new'
	// because they can cause invocation, and '=' because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.
	
	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
	// replace all simple value tokens with ']' characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or ']' or
	// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
	
	            if (/^[\],:{}\s]*$/
	                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	
	// In the third stage we use the eval function to compile the text into a
	// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
	// in JavaScript: it can begin a block or an object literal. We wrap the text
	// in parens to eliminate the ambiguity.
	
	                j = eval('(' + text + ')');
	
	// In the optional fourth stage, we recursively walk the new structure, passing
	// each name/value pair to a reviver function for possible transformation.
	
	                return typeof reviver === 'function'
	                    ? walk({'': j}, '')
	                    : j;
	            }
	
	// If the text is not JSON parseable, then a SyntaxError is thrown.
	
	            throw new SyntaxError('JSON.parse');
	        };
	    }
	}());

	return JSON;
	
})
/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Object',function($H){
	
	var Object={
		_alias              : {                 //存储别名
			'b'             : 'handy.base',
			'c'             : 'handy.component',
			'm'             : 'handy.module',
			'cm'            : 'handy.common'
		},               
		namespace           : fNamespace,       //创建或读取命名空间，可以传入用以初始化该命名空间的对象
		alias               : fAlias,           //创建别名/读取实名
		createClass         : fCreateClass,     //创建类
		extend              : fExtend,          //对象的属性扩展
		mix                 : fMix,             //自定义的继承方式，可以继承object和prototype，prototype方式继承时，非原型链方式继承。
		inherit				: fInherit, 		//类继承方式扩展
		isFunction			: fIsFunction,	    //判断对象是否是函数
		isArray				: fIsArray, 		//判断对象是否是数组
		equals				: fEquals, 		    //对象对比，对比每一个值是否相等
		clone				: fClone,			//对象复制
		isEmpty				: fIsEmpty, 		//判断对象是否为空
		each				: fEach, 			//遍历对象
		contains            : fContains,        //是否包含指定属性/数组元素
		largeThan           : fLargeThan,       //是否大于另一个对象|数组（包含另一个对象的所有属性或包含另一个数组的所有元素）
		count				: fCount,			//计算对象长度
		toArray				: fToArray,		    //将类数组对象转换为数组，比如arguments, nodelist
		generateMethod      : fGenerateMethod   //归纳生成类方法
	}
	/**
    * 创建或读取命名空间
    * @method namespace (sPath,obj=)
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
	 * @param {string=}sAlias 别名，如'b.Object'，为空时表示读取所有存储的别名
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
    * 创建并返回一个类
    * @method createClass
    * @param {string}sPath 类路径
    * @return {Object} 返回新创建的类
    */
    function fCreateClass(sPath) {
        //获得一个类定义，并且绑定一个类初始化方法
        var Class = function(){
        	var me,fInitialize;
        	//获得initialize引用的对象，如果不是通过new调用(比如:Class())，就没有this.initialize
        	if(this.constructor==Class){
        		me = this;
        	}else{
        		me = arguments.callee;
        	}
        	fInitialize = me.initialize;
            if (fInitialize) {
                // 返回当前class派生出来对象可以被定义
            	return fInitialize.apply(me, arguments);
            }
        };
        Class.$isClass=true;
        /**
         * 便捷访问父类方法
         * @method callSuper
         * @param {Class=}oSuper 指定父类，如果不指定，默认为定义此方法的类的父类，如果该值为空，则为实际调用对象的父类
         * @param {Array}aArgs 参数数组
         */
        Class.prototype.callSuper=function(oSuper,aArgs){
        	var me=this;
        	if(oSuper&&!oSuper.$isClass&&oSuper.length!=undefined){
        		aArgs=oSuper;
        		oSuper=null;
        	}
        	var fCaller=arguments.callee.caller;
        	var oCallerSuper=fCaller.$owner.superProto;
        	oSuper=oSuper?oSuper.prototype:(oCallerSuper||me.constructor.superProto);
        	var sMethod=fCaller.$name;
        	if(oSuper){
        		var fMethod=oSuper[sMethod];
        		if(Object.isFunction(fMethod)){
        			if(aArgs){
	        			return fMethod.apply(me,aArgs);
        			}else{
        				return fMethod.call(me);
        			}
        		}
        	}
        };
        if(sPath){
        	this.namespace(sPath,Class);
        }
        return Class;
    }
	/**
    * 对象的属性扩展
    * @method extend(oDestination, oSource , oOptions=)
    * @param {Object} oDestination 目标对象
    * @param {Object} oSource 源对象
    * @param {Object=} oOptions(可选){
    * 				{array=}cover 仅覆盖此参数中的属性
    * 				{boolean=|array=|function(sprop)=}notCover 不覆盖原有属性/方法，当此参数为true时不覆盖原有属性；当此参数为数组时，
    * 					仅不覆盖数组中的原有属性；当此参数为函数时，仅当此函数返回true时不执行拷贝，PS：不论目标对象有没有该属性
    * 				{boolean=}notClone 不克隆，仅当此参数为true时不克隆，此时，由于目标对象里的复杂属性(数组、对象等)是源对象中的引用，
    * 					源对象的修改会导致目标对象也修改
    * }
    * @return {Object} 扩展后的对象
    */
    function fExtend(oDestination, oSource, oOptions) {
    	var notCover=oOptions?oOptions.notCover:false;
    	var aCover=oOptions?oOptions.cover:null;
    	var bNotClone=oOptions?oOptions.notClone:false;
    	//如果是类扩展，添加方法元数据
    	var oConstructor=oDestination.constructor;
    	var bAddMeta=oConstructor.$isClass;
        for (var sProperty in oSource) {
        	//仅覆盖oOptions.cover中的属性
        	if(!aCover||Object.contains(aCover,sProperty)){
	        	//不复制深层prototype
	        	if(oSource.hasOwnProperty(sProperty)){
		        	var bHas=oDestination.hasOwnProperty(sProperty);
		        	var bNotCover=notCover===true?bHas:false;
		        	//当此参数为数组时，仅不覆盖数组中的原有属性
		        	if(Object.isArray(notCover)){
		        		bNotCover=Object.contains(notCover,sProperty)&&bHas;
		        	}else if(Object.isFunction(notCover)){
		        		//当此参数为函数时，仅当此函数返回true时不执行拷贝，PS：不论目标对象有没有该属性
		        		bNotCover=notCover(sProperty);
		        	}
		            if (!bNotCover) {
		            	var value=bNotClone?oSource[sProperty]:Object.clone(oSource[sProperty]);
		            	//为方法添加元数据：方法名和声明此方法的类
						if(bAddMeta&&Object.isFunction(value)){
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
    * @param {Object} oChild 子对象
    * @param {Object} oParent 父对象
    * @param {Object} oExtend 扩展的属性方法
    * @param {Object} oPrototypeExtend 扩展的prototype属性方法
    * @return {Object} 扩展后的类
    */
    function fMix(oChild, oParent, oExtend, oPrototypeExtend) {
        if (!oChild.superProto) {
            oChild.superProto = {};
        }
        for (var sProperty in oParent) {
            if(Object.isFunction(oParent[sProperty])){// 如果是方法
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
            Object.inherit(oChild, oParent,null, oPrototypeExtend);
        }
        return oChild;
    };
    /**
    * prototype的原型链继承
    * @method inherit
    * @param {Object} oChild 子类
    * @param {Object} oParent 父类
    * @param {Object=} oStaticExtend 需要扩展的静态属性
    * @param {Object=} oExtend 需要扩展的prototype属性
    * @param {object=} oExtendOptions 继承父类静态方法时，extend方法的设置，默认为{notCover:true}
    */
    function fInherit(oChild, oParent, oStaticExtend,oExtend,oExtendOptions) {
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
        oExtendOptions=oExtendOptions||{notCover:true}
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
            	$H.Debug.error("_onInherit error",e);
            }
        }
        //扩展静态属性
        if(oStaticExtend){
            Object.extend(oChild, oStaticExtend);
        }
        //扩展prototype属性
        if(oExtend){
            Object.extend(oChild.prototype, oExtend);
        }
    }
    /**
    * 对象是否是函数类型
    * @method isFunction
    * @param {Object} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsFunction(obj) {
        return window.Object.prototype.toString.call(obj) === "[object Function]";
    }
    /**
    * 对象是否是数组类型
    * method isArray
    * @param {Object} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsArray(obj) {
        return window.Object.prototype.toString.call(obj) === "[object Array]";
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
                    if (Object.isArray(o1) && Object.isArray(o2)) {
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
                    } else if (!Object.isArray(o1) && !Object.isArray(o2)) {
                    	//对象属性项不一样
                    	if(Object.count(o1)!=Object.count(o2)){
                    		return false;
                    	}
                        for (var sKey in o1) {
                            if (o2[sKey] == undefined) {
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
			if (Constructor != window.Object && Constructor != window.Array){
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
        if (Object.isArray(object)) {
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
    	var sName, i = 0,
			nLength = object.length,
			bIsObj = nLength === undefined || Object.isFunction( object );
		if ( args ) {
			if ( bIsObj ) {
				for ( sName in object ) {
					if ( fCallback.apply( object[ sName ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < nLength; ) {
					if ( fCallback.apply( object[ i++ ], args ) === false ) {
						break;
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
					if ( fCallback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
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
        if (Object.isArray(oParam)) {
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
    fToArray=fToArray();
    /**
    * 归纳生成类方法
    * @method generateMethod
    * @param {Object}oTarget 需要生成方法的对象
    * @param {string|Array.<string>}method 需要生成的方法列表，如果是字符串，用","作为分隔符
    * @param {function()}fDefined 方法定义函数，该函数执行后返回方法定义
    * @return {Array} 返回转换后的数组
    */
    function fGenerateMethod(oTarget,method,fDefined){
    	var aMethod=Object.isArray(method)?method:method.split(",");
    	for ( var i = 0; i < aMethod.length; i++ ){
			var sMethod = aMethod[i];
			oTarget[sMethod] = fDefined(sMethod);
    	}
    }
	
	return Object;
	
})/**
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
 * 不得使用console等原生方法
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Debug",['handy.base.Json','handy.base.Browser'],function(Json,Browser,$H){
	
	var Debug={
		level	    : 0,            //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	: 1,            //日志级别
		INFO_LEVEL  : 2,            //信息级别
		WARN_LEVEL  : 3,            //警告级别
		ERROR_LEVEL	: 4,            //错误级别
		DEBUG_LEVEL : 5,            //调试级别
//		showInPage  : !("console" in window)||!!Browser.mobile(),        //是否强制在页面上输出调试信息，主要用于不支持console的浏览器，如：IE6，或者ietester里面，或者移动浏览器
		log			: fLog,		    //输出日志
		info		: fInfo,		//输出信息
		warn        : fWarn,        //输出警告信息
		error		: fError,		//输出错误信息
		time        : fTime,        //输出统计时间,info级别
		debug		: fDebug		//出现调试断点
	}
	/**
	 * 输出信息
	 * @method _fOut
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 * @param {string} sType 日志类型：log,info,error
	 */
	function _fOut(oVar,bShowInPage,sType){
		sType = sType||'log';
		//输出到页面
		if(bShowInPage||Debug.showInPage){
			var sDivId = $H.expando+'debugDiv';
			var oDocument = top.document;
			var oDebugDiv = oDocument.getElementById(sDivId);
			if(!oDebugDiv){
				oDebugDiv = oDocument.createElement("DIV");
				oDebugDiv.id = sDivId;
				oDebugDiv.innerHTML = '<a href="javascript:void(0)" onclick="this.parentNode.style.display=\'none\'">关闭</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.getElementsByTagName(\'DIV\')[0].innerHTML=\'\';">清空</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';">全屏</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.style.height=\'100px\';">收起</a><div style="padding-top:5px"></div>';
				oDebugDiv.style.position = 'absolute';
				oDebugDiv.style.width = (oDocument.body.offsetWidth-20)+'px';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '100px';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '12px';
				oDebugDiv.style.padding = '10px';
				oDebugDiv.style.overflow = 'auto';
				oDebugDiv.style.zIndex = 99999999;
				oDebugDiv.style.opacity=0.5;
				oDebugDiv.style.filter="alpha(opacity=50)";
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oVarDiv = oDocument.createElement("DIV");
			//TODO JSON
			oVarDiv.innerHTML = sType+" : "+JSON.stringify(oVar, null, '<br/>');
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			oAppender.innerHTML = oAppender.innerHTML+oVarDiv.innerHTML+"<br/>";
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
		_fOut(oVar,!!bShowInPage,'log');
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
		_fOut(oVar,!!bShowInPage,'info');
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
		_fOut(oVar,!!bShowInPage,'warn');
	}
	/**
	 * 输出错误
	 * @method error
	 * @param {Object}oVar	需要输出的变量
	 * @param {Error=}oError 
	 * @param {boolean=}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fError(oVar,oError,bShowInPage){
		if(Debug.level>Debug.ERROR_LEVEL){
			return;
		}
		if(typeof oError=="boolean"){
			bShowInPage=oError;
		}
		_fOut(oVar,!!bShowInPage,"error");
		if(typeof oError=="object"){
			//抛出异常，主要是为了方便调试，如果异常被catch住的话，控制台不会输出具体错误位置
			throw oError;
		}
	}
	/**
	 * 输出统计时间
	 * @method time
	 * @param {string}sMsg 输出的信息
	 * @param {boolean}bOut 为true时，计算时间并输出信息
	 * @param {boolean}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fTime(sMsg,bOut,bShowInPage){
		if(Debug.level>Debug.INFO_LEVEL){
			return;
		}
		sMsg=sMsg||'';
		if(bOut){
			_fOut(sMsg+", 消耗时间:"+(new Date().getTime()-(Debug.lastTime||0)),!!bShowInPage)
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
	
})/**
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
		if($H.Object.isFunction(fExecFunc)&&$H.Object.isFunction(fInterceptFunc)){
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
	
})/**
 * 资源加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
handy.add("Loader",
["handy.base.Debug","handy.base.Object","handy.base.Function"],
function(Debug,Object,Function,$H){
	
	var _RESOURCE_NOT_FOUND= 'Resource not found: ',
		_eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement,
		_UA = navigator.userAgent,
        _bIsWebKit = _UA.indexOf('AppleWebKit'),
    	_aContext=[],         //请求上下文堆栈
	    _oCache={};           //缓存
	
	var Loader= {
		traceLog                : true,                     //是否打印跟踪信息
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
	 * 检查对应的资源是否已加载
	 * @method _fChkExisted
	 * @param {string|Array}id 被检查的资源id
	 * @return {boolean}返回true表示该资源已经被加载
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
	    		return Object.namespace(sId);
    		}
    	}
    	if(typeof id=="string"){
    		return _fChk(id);
    	}
    	var aExist=[];
    	for(var i=0,nLen=id.length;i<nLen;i++){
    		var result=_fChk(id[i]);
    		if(!result){
    			return false;
    		}else{
    			aExist.push(result);
    		}
    	}
    	return aExist;
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
    		//读取实名
    		sId=$H.Object.alias(sId);
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
			Debug.info("Loader request:"+sUrl);
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
			Debug.info("Loader request:"+sUrl);
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
	      Debug.error('Time is out:', eNode.src);
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
//								console.log(p)
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
    	_oCache[sId].status='loaded';
    	if(Loader.traceLog){
			Debug.info("Loader Response: "+sId);
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
	    	var aExists=_fChkExisted(oContext.deps);
	    	if(aExists){
	    		_aContext.splice(i,1);
	    		oContext.callback.apply(null,aExists);
	    		//定义成功后重新执行上下文
	    		_fExecContext();
	    		break;
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
					Debug.info("Loader define: "+sId);
				}catch(e){
					//资源定义错误
					Debug.error("Loader "+sId+":factory define error:"+e.message,e);
					return;
				}
			}else{
				resource=factory;
			}
			Object.namespace(sId,resource);
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
    		var oExisted=_fChkExisted(sId);
    		if(!oExisted){
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
    			aExisteds.push(oExisted);
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
	
})/**
 * 自定义事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Listener',function($H){
	
	var _cache={};             //自定义事件池
		
	var Listener={
		add            : fAdd,            //添加事件
		remove         : fRemove,         //移除事件
		fire           : fFire            //触发事件
	};
	
	/**
	 * 添加事件
	 * @method add
	 * @param {string}sName 事件名
	 * @param {function}fHandler 事件函数
	 */
	function fAdd(sName,fHandler){
		var aCache=_cache[sName];
		if(!aCache){
			aCache=_cache[sName]=[]
		}
		aCache.push(fHandler);
		
	}
	/**
	 * 移除事件
	 * @method remove
	 * @param {string}sName 事件名
	 * @param {function=}fHandler 事件函数，如果此参数为空，表示删除指定事件名下的所有函数
	 * @param {boolean} true表示删除成功，false表示失败
	 */
	function fRemove(sName,fHandler){
		var aCache=_cache[sName];
		if(!aCache){
			return false;
		}
		if(!fHandler){
			delete _cache[sName];
		}else{
			for(var i=0,len=aCache.length;i<len;i++){
				if(aCache[i]==fHandler){
					aCache.splice(i,1);
					return true;
				}
			}
		}
		return false;
	}
	/**
	 * 触发事件
	 * @method fire(sName[,data,..])
	 * @param {string}sName 事件名
	 * @param {*}data 传递参数
	 * @return {*}只是返回最后一个函数的结果
	 */
	function fFire(sName,data){
		var aCache=_cache[sName];
		if(!aCache){
			return false;
		}
		var aArgs=Array.prototype.slice.call(arguments,1);
		for(var i=0,len=aCache.length;i<len;i++){
			//只是返回最后一个函数的结果
			if(i==len-1){
				return aCache[i].apply(null,aArgs);
			}else{
				aCache[i].apply(null,aArgs);
			}
		}
	}
	
	return Listener;
	
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
		format               : fFormat,              //返回指定格式的日期字符串
		parse                : fParse,               //将日期字符串转换为Date对象
		parseObject          : fParseObject          //将后端传过来的时间对象转换成Date对象
	}
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
	 * @method formate(oDate[,sFormator])
	 * @param  {Date} oDate 需要格式化的日期对象
	 * @param  {string}sFormator(可选)  格式化因子,如：'yyyy年 第q季 M月d日 星期w H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {string} 返回字符串日期
	 */
	function fFormat(oDate, sFormator) {
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
	 * @method parse(sDateStr[,sFormator])
	 * @param  {string} sDateStr 需要分析的日期字符串，除了日期数据外不能有数字出现，如：("2012年 12/13","yyyy年 MM/dd")是正确的，("2012年 11 12/13","yyyy年 11 MM/dd")是错误的
	 * @param  {string}sFormator(可选)  格式化因子,除了formator元素外，不能出现字母(与第一个参数类似)，如：'yyyy年 M月d日 H时m分s秒S毫秒',默认是'yyyy-MM-dd HH:mm:ss'
	 * @return {Object} 返回Date对象
	 */
	function fParse(sDateStr, sFormator) {
		var sFormator=sFormator||'yyyy-MM-dd HH:mm:ss';
		var aFormatorMatches=sFormator.match(/[a-zA-Z]+/g);
		var aNumMatches=sDateStr.match(/\d+/g);
		var oDate=new WDate();
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
	 * 将后端传过来的时间对象转换成Date对象
	 * @method parseObject
	 * @param {Object}oParam
	 * @return {Date} 返回Date对象
	 */
	function fParseObject(oParam){
		return new WDate(oParam.year+1900,oParam.month,oParam.date,oParam.hours,oParam.minutes,oParam.seconds);
	}
	
	return Date;
})/**
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
		isNumber		: fIsNumber,        // 字符串是否是数字
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
	 * @method  isNumber
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否数字   
	 */
	function fIsNumber(sStr){
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
})/**
 * Cookie工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Cookie',function(){
	
	var Cookie={
		get     : fGet,    //获取cookie
		set     : fSet,    //设置cookie
		del     : fDelete  //删除cookie
	}
	
	/**
	 * 获取cookie
	 * @method  get
	 * @param   {string}sName cookie的name
	 * @param   {boolean}bNotUnescape 不解码
	 */
	function fGet(sName,bNotUnescape) {
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
	 * @method  set(sName, sValue[,oOptions])
	 * @param {string}sName cookie的name
	 * @param {string}sValue cookie的value
	 * @param {Object}oOptions{
	 * 		{string}path    : cookie的path,根目录为"/",
	 * 		{string}domain  : cookie的domain,
	 * 		{string}expires : cookie的expires,值为GMT(格林威治时间)格式的日期型字符串,如：new Date().toGMTString(),
	 *      {boolean}secure : 是否有secure属性
	 * }
	 */
	function fSet(sName, sValue, oOptions) {
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
	 * @method del
	 * @param {string}sName cookie的name
	 */
	function fDelete(sName){
		//当前时间
	    var oDate = new Date();
	    //设置为过期时间
	    oDate.setTime(oDate.getTime() - 1);
	    document.cookie = sName + "=;expires=" + oDate.toGMTString();
	}
	
	return Cookie;
})/**
 * 工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Util',function($H){
	
	var Util={
		isWindow         : fIsWindow,  //检查是否是window对象
		getUuid          : fGetUuid,   //获取handy内部uuid
		getHash          : fGetHash,   //获取hash，不包括“？”开头的query部分
		setHash          : fSetHash    //设置hash，不改变“？”开头的query部分
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
	
	return Util;
	
})/**
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Template',function($H){
	
	var _cache={},             //缓存
		_valPreReg=/^=/,        //简单替换正则
		_isNewEngine = ''.trim;   // '__proto__' in {}
		
	var T={
		openTag         : '<%',            //模板语法开始标签
		closeTag        : '%>',            //模板语法结束标签
		
//		_setValue       : _fSetValue,      //设置变量
		_add            : _fAdd,           //结果函数添加一行字符串
		_parseHtml      : _fParseHtml,     //处理html
		_parseScript    : _fParseScript,   //处理脚本
		_compile        : _fCompile,       //编译模板
		tmpl            : fTmpl            //渲染模板
	};
	/**
	 * 设置变量
	 * @method _setValue
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
	 * @method _add
	 * @param {string}sCode 要添加的代码
	 * @return {string} 返回添加好的代码
	 */
	function _fAdd(sCode){
		//旧浏览器使用数组方式拼接字符串
        return _isNewEngine?'$r+='+sCode+';\n':'$r.push('+sCode+');\n';
	}
	/**
	 * 处理html
	 * @method _parseHtml
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
		var sCode=T._add('"'+sHtml+'"');
		return sCode;
	}
	/**
	 * 处理脚本
	 * @method _parseScript
	 * @param {string}sScript script字符串
	 * @return {string} 返回处理过的脚本
	 */
	function _fParseScript(sScript){
		sScript=sScript.replace(/this/g,'$data');
		if(sScript.indexOf('=')==0){
			sScript=T._add(sScript.replace(_valPreReg,'')+'||""');
		}
		return sScript+"\n";
	}
	/**
	 * 编译模板
	 * @method _compile
	 * @param  {string}sTmpl 模板字符串
	 * @return {string}      返回结果字符串
	 */
	function _fCompile(sTmpl){
		//旧浏览器使用数组方式拼接字符串
		var sCode='var $r='+(_isNewEngine?'""':'[]')+';\n';
		var oMatch;
		//循环处理模板，分离html和script部分
		$H.Object.each(sTmpl.split(T.openTag),function(i,sValue){
			var aCode=sValue.split(T.closeTag);
			//[html]
			if(aCode.length==1){
				sCode+=T._parseHtml(aCode[0]);
			}else{
				//[script,html]
				sCode+=T._parseScript(aCode[0]);
				if(aCode[1]){
					sCode+=T._parseHtml(aCode[1]);
				}
			}
		})
		sCode+='return '+(_isNewEngine?'$r;':'$r.join("");');
//		$D.log(sCode);
		return new Function('$data',sCode);
	}
	/**
	 * 执行模板
	 * @method tmpl
	 * @param {object|string}tmpl 当tmpl为字符串时，表示模板内容，为对象时如下：
	 * {
	 * 		{string}id : 模板的id，要使用缓存，就必须传入id
	 * 		{string=}tmpl : 模板字符串，以id为缓存key，此参数为空时，表示内容为根据id查找到的script标签的内容
	 * }
	 * @param {object}oData 数据
	 * @return {function|string} 当oData为空时返回编译后的模板函数，不为空时返回渲染后的字符串
	 */
	function fTmpl(tmpl,oData){
		var sTmpl,fTmpl,sId;
		if(typeof tmpl=='string'){
			sTmpl=tmpl;
		}else{
			sTmpl=tmpl.tmpl;
			if(sId=tmpl.id){
			    if (_cache[sId]) {
			        fTmpl = _cache[sId];
			    } else {
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
			fTmpl=T._compile(sTmpl);
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
	var _bIsInited,_nListener=0,_oDoc = document, _oIframe,_sLastHash,
		//这个属性的值如果是5，则表示混杂模式（即IE5模式）；如果是7，则表示IE7仿真模式；如果是8，则表示IE8标准模式
		_nDocMode = _oDoc.documentMode,
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
			_bIsInited=true;
			HashChange.listeners={};
			//不支持原生hashchange事件的，使用定时器+隐藏iframe形式实现
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
				throw new Error("Duplicate name");
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
handy.add('Support',function($H){
	
	
	var Support={
//		testSvg               : fTestSvg          //检查是否支持svg
		mediaQuery            : fMediaQuery       //检查设备并添加class
	}
	
	Support.mediaQuery();
	
//	var _supportSvg; //标记是否支持svg
	
	//解决IE6下css背景图不缓存bug
	if($H.Browser.ie()==6){   
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
		if($H.Browser.mobile()){
			sCls="hui-mobile";
		}else{
			sCls="hui-pc";
		}
		document.documentElement.className+=" "+sCls;
	}
	
	return Support;
	
})/**
 * 适配类库
 */
(function($){
	
	//框架全局变量
	$H=$.noConflict();
	H=$H;
	Hui=$H;
	$D=$H.Debug;
	$HB=$H.Browser;
	$HC=$H.Cookie;
	$HD=$H.Date;
	$HF=$H.Function;
	$HO=$H.Object;
	$HS=$H.String;
	$HU=$H.Util;
	$HL=$H.Listener;
	$Define=$H.Loader.define;
	$Require=$H.Loader.require;


	//系统全局变量
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
	$$.fn.remove=$HF.intercept($$.fn.remove,function(){
		var oEl=this.target;
		$HL.fire('removeEl',oEl);
	});
	
	
})(handy)/**
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
			//如果未被销毁，执行回调
			if(oCmp){
				fCall(oCmp);
			}
		})
	}
	/**
	 * 调用指定dom节点包含的组件的afterRender方法
	 * @method afterRender
	 * @param {jQuery}oEl 指定的节点
	 */
	function fAfterRender(oEl){
		CM.eachInEl(oEl,function(oCmp){
			oCmp.afterRender();
		});
	}
	/**
	 * 销毁组件，主要用于删除元素时调用
	 * @method destroy
	 * @param {jQuery}oRemoveEl 需要移除组件的节点
	 */
	function fDestroy(oRemoveEl){
		CM.eachInEl(oRemoveEl,function(oCmp){
			oCmp.destroy(true);
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
	
});/**
 * 组件基类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.component.AbstractComponent"
$Define('c.AbstractComponent',["c.ComponentManager",'cm.AbstractView'],function(CM,AbstractView){
	
	var AC=$HO.createClass(),
	_oTagReg=/^(<[a-zA-Z]+)/,
	_oClsReg=/(class=")/;
	
	//快捷别名
	$C.AbstractComponent=AC;
	
	$HO.inherit(AC,AbstractView,{
		//静态方法
		define              : fDefine,           //定义组件
		extend              : fExtend,           //扩展组件原型对象
		html                : fHtml              //静态生成组件html
	},{
		//实例方法
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
//		renderTo            : null,              //渲染节点
//		hidden              : false,             //是否隐藏
//		hideMode            : 'display',         //隐藏方式,'display'|'visibility'
//		disabled            : false,             //是否禁用
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
//		notListen           : false,             //不自动初始化监听器
//		delayShow           : false,             //是否延迟显示，主要用于弹出层
//		extCls              : '',                //组件附加class
		activeCls           : 'hui-active',      //激活样式
//		defItem             : null,              //默认子组件配置
//		icon                : null,              //图标
//		withMask            : false,             //是否有遮罩层
		
		////通用样式
//		width               : null,              //宽度(默认单位是px)
//		height              : null,              //高度(默认单位是px)
//		theme               : null,              //组件颜色
//		radius              : null,         	 //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
//		shadow              : false,        	 //外阴影
//		shadowInset         : false,        	 //内阴影
//		shadowSurround      : false,             //外围亮阴影，主要用于黑色工具栏内的按钮
//		shadowOverlay       : false,             //遮罩层里组件的阴影效果，主要用于弹出层
//		isMini              : false,       	     //小号
//		isActive            : false,             //是否激活
//		isFocus             : false,        	 //聚焦
//		isInline            : false,             //是否内联(宽度自适应)
//		style               : {},                //其它样式，如:{top:10,left:10}
		
		//属性
//		cls                 : '',                //组件样式名，空则使用xtype的小写，如Dialog，cls为"dialog"，因此样式前缀是“hui-dialog-”
//		role                : '',                //保留属性，用于模板中筛选组件的选择器，如this.getHtml("$>[role='content']")
//		params              : null,              //初始化时传入的参数
//		_id                 : null,              //组件id
//		tmpl                : [],                //组件模板，首次初始化前为数组，初始化后为字符串，ps:组件模板容器节点上不能带有id属性
//		html                : null,              //组件html
//		rendered            : false,             //是否已渲染
//      showed              : false,             //是否已显示
//		children            : [],                //子组件
//      listeners           : [],                //类事件配置
//		_listeners          : {},                //实例事件池  
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','afterRender','show','hide','destroy'
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'click','mouseover','focus'
		],
		//组件初始化相关
		initialize          : fInitialize,       //初始化
		doConfig            : fDoConfig,         //初始化配置
		initHtml            : fInitHtml,         //初始化html
		initStyle           : fInitStyle,        //初始化样式
		getId               : fGetId,            //获取组件id
		getHtml             : fGetHtml,          //获取组件或子组件html
		getExtCls           : fGetExtCls,        //生成通用样式
		afterRender         : fAfterRender,      //渲染后续工作
		//组件公用功能
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		active              : fActive,           //激活
		unactive            : fUnactive,         //不激活
		mask                : fMask,             //显示遮罩层
		unmask              : fUnmask,           //隐藏遮罩层
		txt                 : fTxt,              //设置/读取文字
		
		//事件相关
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		
		//组件管理相关
//		update
		each                : fEach,             //遍历子组件
		match               : fMatch,            //匹配选择器
		find                : fFind,             //查找子元素
		index               : fIndex,            //获取本身的索引，如果没有父组件则返回null
		callChild           : fCallChild,        //调用子组件方法
		add                 : fAdd,              //添加子组件
		remove              : fRemove,           //删除子组件
		addItem             : fAddItem,          //添加子组件配置
		parseItem           : function(){},      //分析子组件，由具体组件类实现
		parseItems          : fParseItems,       //分析子组件列表
		destroy             : fDestroy           //销毁
	});
	
	/**
	 * 定义组件
	 * @method define
	 * @param {string}sXtype 组件类型
	 * @param {Component=}oSuperCls 父类，默认是AbstractComponent
	 * @return {class}组件类对象
	 */
	function fDefine(sXtype,oSuperCls){
		var Component=$HO.createClass();
		var oSuper=oSuperCls||AC;
		$HO.inherit(Component,oSuper,null,null,{notCover:function(p){
			return p == 'define';
		}});
		CM.registerType(sXtype,Component);
		return Component;
	}
	/**
	 * 扩展组件原型对象
	 * @method extend
	 * @param {Object}oExtend 扩展源
	 */
	function fExtend(oExtend){
		var oProt=this.prototype;
		$HO.extend(oProt, oExtend,{notCover:function(p){
			//继承父类的事件
			if(p=='_customEvents'||p=='listeners'){
				oProt[p]=(oExtend[p]||[]).concat(oProt[p]||[]);
				return true;
			}else if(p=='xtype'||p=='constructor'){
				return true;
			}
		}});
	}
	/**
	 * 静态生成组件html
	 * @method html
	 * @param {object}oSettings 初始化参数
	 */
	function fHtml(oSettings){
		oSettings.autoRender=false;
		var component=new this(oSettings);
		return component.getHtml();
	}
		
	/**
	 * 初始化
	 * @method initialize
	 * @param {object}oSettings 初始化参数
	 */
	function fInitialize(oSettings){
		var me=this;
		//初始化配置
		me.doConfig(oSettings);
		//分析处理子组件
		me.parseItems();
		me.initHtml();
		me.fire('beforeRender');
		if(me.autoRender!=false){
			me.renderTo[me.renderBy](me.getHtml());
			//渲染后续工作
			me.afterRender();
		}
		//注册组件
		CM.register(me);
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		//保存参数
		me.params=oParams;
		//复制参数
		me.settings=$HO.clone(oParams);
		
		//事件列表对象特殊处理，不影响类定义
		var aListeners=me.listeners?me.listeners.concat():[];
		//添加参数中的事件
		if(oParams.listeners){
			aListeners=aListeners.concat(oParams.listeners);
		}
		me._listeners=aListeners;
		
		//只覆盖基本类型的属性
		$HO.extend(me,oParams,{notCover:function(sProp){
			var value=me[sProp];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$HO.contains(me._customEvents,sProp);
			var bIsDefEvt=$HO.contains(me._defaultEvents,sProp);
			if(bIsCustEvt||bIsDefEvt){
				me._listeners.push({
					type:sProp,
					notEl:bIsCustEvt,
					handler:oParams[sProp]
				});
			}
			if((value!=null&&typeof value=='object')||$HO.isFunction(value)){
				return true;
			}
		}});
		
		//样式名
		if(!me.cls){
			me.cls=me.xtype.toLowerCase();
		}
		//覆盖子组件配置
		if(oParams.defItem){
			$HO.extend(me.defItem,oParams.defItem);
		}
		if(oParams.renderTo){
			me.renderTo=$(oParams.renderTo);
		}else{
			me.renderTo=$(document.body);
		}
		me.children=[];
	}
	/**
	 * 初始化html
	 * @method initHtml
	 */
	function fInitHtml(){
		var me=this;
		//将组件数组方式的模板转为字符串
		if(typeof me.tmpl!='string'){
			me.constructor.prototype.tmpl=me.tmpl.join('');
		}
		//由模板生成组件html
		var sHtml=$H.Template.tmpl({id:me.xtype,tmpl:me.tmpl},me);
		var sId=me.getId();
		//添加隐藏style，调用show方法时才显示
		var sStyle;
 		if(me.displayMode=='visibility'){
			sStyle='visibility:hidden;';
 		}else{
			sStyle='display:none;';
 		}
		//添加id和style
		sHtml=sHtml.replace(_oTagReg,'$1 id="'+sId+'" style="'+sStyle+'"');
		//添加附加class
		sHtml=sHtml.replace(_oClsReg,'$1'+me.getExtCls());
		me.html=sHtml;
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
		if(me.width!=undefined){
			oStyle.width=me.width;
		}
		if(me.height!=undefined){
			oStyle.height=me.height;
		}
		oEl.css(oStyle);
	}
	/**
	 * 获取组件id
	 * @method getId
	 * @return {string}返回组件id
	 */
	function fGetId(){
		var me=this;
		return me._id||(me._id=CM.generateId(me.cid));
	}
	/**
	 * 获取组件或子组件html
	 * @method getHtml
	 * @param {string=}sSel 选择器，不传表示返回自身的html
	 * @return {string} 返回对应html
	 */
	function fGetHtml(sSel){
		var me=this;
		if(!sSel){
			return me.html;
		}
		var aChildren=sSel==">*"?me.children:me.find(sSel);
		var aHtml=[];
		for(var i=0;i<aChildren.length;i++){
			aHtml.push(aChildren[i].getHtml());
		}
		return aHtml.join('');
	}
	/**
	 * 生成通用样式
	 * @method getExtCls
	 * @return {string} 返回通用样式
	 */
	function fGetExtCls(){
		var me=this;
		//组件标志class
		var aCls=['js-component'];
		if(me.extCls){
			aCls.push(me.extCls);
		}
		if(me.theme){
			aCls.push('hui-'+me.cls+'-'+me.theme);
		}
		if(me.disabled){
			aCls.push('hui-disable');
		}
		if(me.radius){
			aCls.push('hui-radius-'+me.radius);
		}
		if(me.isMini){
			aCls.push('hui-mini');
		}
		if(me.shadow){
			aCls.push('hui-shadow');
		}
		if(me.shadowSurround){
			aCls.push('hui-shadow-surround');
		}
		if(me.shadowOverlay){
			aCls.push('hui-shadow-overlay');
		}
		if(me.shadowInset){
			aCls.push('hui-shadow-inset');
		}
		if(me.isActive){
			aCls.push(me.activeCls);
		}
		if(me.isFocus){
			aCls.push('hui-focus');
		}
		if(me.isInline){
			aCls.push('hui-inline');
		}
		return aCls.length>0?aCls.join(' ')+' ':'';
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 */
	function fAfterRender(){
		var me=this;
		if(me.rendered){
			return;
		}
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
			me.suspendListeners();
		}
		me.fire('afterRender');
		//显示
		if(!me.hidden){
			me.show();
		}
		delete me.html;
	}
	/**
	 * 隐藏
	 * @method hide
	 */
	function fHide(){
		var me=this;
		//已经隐藏，直接退回
		if(!me.showed){
			return;
		}
		me.showed=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"hidden"})
		}else{
			oEl.hide();
		}
		if(me.withMask){
			me.unmask();
		}
		me.fire('hide');
	}
	/**
	 * 显示
	 * @method show
	 * @param {boolean=}bNotDelay 仅当为true时强制不延迟显示
	 * @param {boolean=}bParentCall true表示是父组件通过callChild调用
	 */
	function fShow(bNotDelay,bParentCall){
		var me=this;
		//已经显示，直接退回
		if(me.showed){
			return;
		}
		if(bParentCall&&me.hidden){
			//设置了hidden=true的组件不随父组件显示而显示
			return;
		}
		if(!bNotDelay&&me.delayShow){
			setTimeout(function(){
				//这里必须指定基类的方法，不然会调用到组件自定义的show方法
				AC.prototype.show.call(me,true);
			},0);
			return;
		}
		me.showed=true;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"visible"})
		}else{
			oEl.show();
		}
		if(me.withMask){
			me.mask();
		}
		me.fire('show');
		me.callChild([null,true]);
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resumeListeners();
		me.getEl().removeClass("hui-disable");
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspendListeners();
		me.getEl().addClass("hui-disable");
	}
	/**
	 * 激活
	 * @method active
	 */
	function fActive(){
		var me=this;
		me.getEl().addClass(me.activeCls);
	}
	/**
	 * 不激活
	 * @method unactive
	 */
	function fUnactive(){
		var me=this;
		me.getEl().removeClass(me.activeCls);
	}
	/**
	 * 显示遮罩层
	 * @method mask
	 */
	function fMask(){
		if(!AC.mask){
			AC.mask=$('<div class="hui-mask" style="display:none;"></div>').appendTo(document.body);
		}
		AC.mask.show();
	}
	/**
	 * 隐藏遮罩层
	 * @method unmask
	 */
	function fUnmask(){
		if(AC.mask){
			AC.mask.hide();
		}
	}
	/**
	 * 设置/读取文字
	 * @method txt
	 * @param {string=}sTxt
	 * @return {string} 
	 */
	function fTxt(sTxt){
		var me=this;
		//先寻找js私有的class
		var oTxtEl=me.find('.js-'+me.cls+'-txt');
		//如果找不到，再通过css的class查找
		if(oTxtEl.length==0){
			oTxtEl=me.find('.hui-'+me.cls+'-txt')
		}
		if(sTxt!=undefined){
			oTxtEl.text(sTxt);
		}else{
			return oTxtEl.text();
		}
	}
	//ps:以下四个方法虽然一模一样，但callSuper需要使用元数据$name，所以要分开定义;另一方面，压缩后代码也不多
	/**
	 * 初始化所有事件
	 * @method initListeners
	 */
	function fInitListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 清除所有事件
	 * @method clearListeners
	 */
	function fClearListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 挂起事件
	 * @method suspendListeners
	 */
	function fSuspendListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 恢复事件
	 * @method resumeListeners
	 */
	function fResumeListeners(){
		var me=this;
		if(me.callSuper()!=false){
			me.callChild();
		}
	}
	/**
	 * 遍历子组件
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
	 * @return {boolean} 匹配则返回true
	 */
	function fMatch(sSel){
		if(sSel=="*"){
			return true;
		}
		var me=this,m,prop,op,value;
		//'Button[attr=value]'=>'[xtype=Button][attr=value]'
		sSel=sSel.replace(/^([^\[]+)/,'[xtype="$1"]');
		//循环检查
		var r=/\[([^=|\!]+)(=|\!=)([^=]+)\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			//操作符：=|!=
			op=m[2];
			value=eval(m[3]);
			if(op==="="?me[prop]!=value:me[prop]==value){
				return false;
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子组件
	 * @method find
	 * @param {string}sSel '$'开头表示查找组件，多个选择期间用","隔开('$sel1,$sel2,...')，语法类似jQuery，如：'$xtype[attr=value]'、'$ancestor descendant'、'$parent>child'，
	 * 				'$>Button'表示仅查找当前子节点中的按钮，'$Button'表示查找所有后代节点中的按钮，
	 * @param {Array=}aResult 用于存储结果集的数组
	 */
	function fFind(sSel,aResult){
		var me=this;
		//查找元素
		if(sSel.indexOf('$')!=0){
			return me.getEl().find(sSel);
		}
		var aResult=aResult||[];
		//多个选择器
		if(sSel.indexOf(",")>0){
			$HO.each(sSel.split(","),function(i,val){
				aResult=aResult.concat(me.find(val));
			})
			return aResult;
		}
		//查找组件
		var bOnlyChildren=sSel.indexOf('>')==1;
		var sCurSel=sSel.replace(/^\$>?\s?/,'');
		//分割当前选择器及后代选择器
		var nIndex=sCurSel.search(/\s|>/);
		var sCurSel,sExtSel;
		if(nIndex>0){
			sExtSel=sCurSel.substring(nIndex);
			sCurSel=sCurSel.substring(0,nIndex);
		}
		//匹配子组件
		me.each(function(i,oChild){
			var bMatch=oChild.match(sCurSel);
			if(bMatch){
				//已匹配所有表达式，加入结果集
				if(!sExtSel){
					aResult.push(oChild);
				}else{
					//还有未匹配的表达式，继续查找
					oChild.find('$'+sExtSel,aResult);
				}
			}
			if(!bOnlyChildren){
				//如果不是仅限当前子节点，继续从后代开始查找
				oChild.find(sSel,aResult);
			}
		});
		return aResult;
	}
	/**
	 * 获取本身的索引，如果没有父组件则返回null
	 * @method index
	 * @return {number} 返回对应的索引
	 */
	function fIndex(){
		var me=this;
		var oParent=me.parent;
		if(!oParent){
			return null;
		}else{
			var nIndex;
			oParent.each(function(i,oCmp){
				if(oCmp==me){
					nIndex=i;
					return false;
				}
			});
			return nIndex;
		}
	}
	/**
	 * 调用子组件方法
	 * @method callChild
	 * @param {string=}sMethod 方法名，不传则使用调用者同名函数
	 * @param {Array=}aArgs 参数数组
	 */
	function fCallChild(sMethod,aArgs){
		var me=this;
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
	 * 添加子组件
	 * @method add
	 * @param {object}oCmp 组件对象
	 */
	function fAdd(oCmp){
		var me=this;
		me.children.push(oCmp);
		oCmp.parent=me;
	}
	/**
	 * 删除子组件
	 * @method remove
	 * @param {object}oCmp 组件对象
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(oCmp){
		var me=this;
		var aChildren=me.children;
		var bResult=false;
		for(var i=0,len=aChildren.length;i<len;i++){
			if(aChildren[i]==oCmp){
				aChildren.splice(i,1);
				oCmp.destroy();
				bResult=true;
			}
		}
		return bResult;
	}
	/**
	 * 添加子组件配置
	 * @method addItem
	 * @param {object}oItem 子组件配置
	 */
	function fAddItem(oItem){
		var me=this;
		var oSettings=me.settings;
		var items=oSettings.items;
		if(!items){
			oSettings.items=[];
		}else if(!$HO.isArray(items)){
			oSettings.items=[items];
		}
		oSettings.items.push(oItem);
	}
	/**
	 * 分析子组件列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		//图标组件快捷添加
		if(me.icon){
			me.addItem({
				xtype:'Icon',
				name:me.icon
			})
		}
		var aItems=me.settings.items;
		if(!aItems){
			return;
		}
		aItems=aItems.length?aItems:[aItems];
		//逐个初始化子组件
		for(var i=0,len=aItems.length;i<len;i++){
			var oItem=aItems[i];
			//默认子组件配置
			if(me.defItem){
				$HO.extend(oItem,me.defItem,{notCover:true});
			}
			//具体组件类处理
			me.parseItem(oItem);
			var Component=CM.getClass(oItem.xtype);
			if(Component){
				if(!oItem.renderTo){
					oItem.autoRender=false;
				}
				var oCmp=new Component(oItem);
				me.add(oCmp);
			}else{
				$D.error("xtype:"+oItem.xtype+"未找到");
			}
		}
	}
	/**
	 * 销毁组件
	 * @method destroy
	 * @return {boolean=}如果已经销毁了，则直接返回false
	 */
	function fDestroy(){
		var me=this;
		if(me.destroyed){
			return false;
		}
		me.callChild();
		me.callSuper();
		if(me.parent){
			me.parent.remove(me);
		}
		//注销组件
		CM.unregister(me);
		delete me.params;
		delete me.settings;
		delete me._container;
		delete me.renderTo;
		delete me._listeners;
		delete me.children;
	}
		
	return AC;
	
});/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Popup',
'c.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup');
	
	Popup.extend({
		//初始配置
		delayShow       : true,            //延迟显示
		clickHide       : true,            //是否点击就隐藏
//		timeout         : null,            //自动隐藏的时间(毫秒)，不指定此值则不自动隐藏
		showPos         : 'center',        //定位方法名，或者传入自定义定位函数
		
		//组件共有配置
		withMask        : true,
		shadowOverlay   : true,
		
		tmpl            : [
			'<div class="hui-popup"><%=this.getHtml("$>*")%></div>'
		],
		listeners       : [{
			type:'click',
			el: $(document),
			handler:function(){
				var me=this;
				if(me.clickHide){
					this.hide();
				}
			}
		}],
		
		show             : fShow,            //显示
		center           : fCenter,          //居中显示
		underEl          : fUnderEl          //根据指定节点显示
	});
	
	/**
	 * 显示
	 * @method show
	 */
	function fShow(){
		// 设置定位坐标
		var me=this;
		//默认居中显示
		var showPos=me.showPos;
		if(typeof showPos=="string"){
			me[showPos]();
		}else if(typeof showPos=="function"){
			showPos.call(me);
		}
		//如果是父组件通过callChild调用的会有参数，要传进去
		me.callSuper(arguments);
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
	 * 居中显示
	 * @method center
	 */
	function fCenter(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - oEl.width())/2;
		var y = ((oDoc.documentElement.clientHeight || oDoc.body.clientHeight) - oEl.height())/2 + oDoc.documentElement.scrollTop;
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
	}
	/**
	 * 显示在指定元素下方
	 * @method underEl
	 * @param {jQuery}oEl 定位标准元素
	 */
	function fUnderEl(oEl){
		var me=this;
		var oPos=oEl.position();
		oPos.width=me.width||oEl.outerWidth();
		me.getEl().css(oPos);
	}
	
	return Popup;
	
});/**
 * 控制组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('c.ControlGroup',
['c.ComponentManager',
'c.AbstractComponent'],
function(CM,AC){
	
	var ControlGroup=AC.define('ControlGroup');
	
	ControlGroup.extend({
		//初始配置
//		direction            : 'v',                  //排列方向，'v'表示垂直方向，'h'表示水平方向
		radius               : 'little',             //圆角
		multi                : false,                //是否多选
//		itemClick            : function(oCmp,nIndex){},         //子项点击事件函数，函数参数为子组件对象及索引
		
		//默认子组件配置
		defItem              : {
			xtype            : 'Button',
			extCls           : 'js-item',
			radius           : null,
			shadow           : false,
//			isSelected       : false,             //是否选中
			isInline         : false
		},
		
		tmpl                 : [
			'<div class="hui-ctrlgp<%if(this.direction=="h"){%> hui-ctrlgp-h<%}else{%> hui-ctrlgp-v<%}%>">',
			'<%=this.getHtml("$>*")%>',
			'</div>'
		],
		
		listeners       : [
			{
				type :'click',
				selector : '.js-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					var oCurrentEl=$(oEvt.currentTarget);
					var nIndex=CM.get(oCurrentEl.attr("id")).index();
					me.onItemClick(oEvt,nIndex);
				}
			}
		],
		
		select               : fSelect,              //选中指定项
		getSelected          : fGetSelected,         //获取选中项/索引
		selectItem           : fSelectItem,          //选中/取消选中
		val                  : fVal,                 //获取/设置值
		onItemClick          : fOnItemClick          //子项点击事件处理
	});
	
	/**
	 * 选中指定项
	 * @method select
	 * @param {number|string|Component}item number表示索引，string表示选择器，也可以传入组件对象
	 */
	function fSelect(item){
		var me=this,oItem;
		if(typeof item=='number'){
			oItem=me.children[item];
		}else if(typeof item=="string"){
			oItem=me.find(item)[0];
		}else{
			oItem=item;
		}
		if(!me.multi&&!oItem.multi){
			//单选操作要先取消别的选中
			var oSelected=me.getSelected();
			if(oSelected){
				me.selectItem(oSelected,false);
			}
			me.selectItem(oItem);
		}else{
			me.selectItem(oItem,!oItem.selected);
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
			if(item.selected){
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
			oItem.selected=bSelect;
			//优先使用子组件定义的接口
			if(oItem.select){
				oItem.select();
			}else{
				oItem.active();
			}
		}else{
			oItem.selected=bSelect;
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
				oCmp.select($HO.contains(aValues,oCmp.value));
			});
		}else{
			var aCmp=me.find('$>[selected=true]');
			var aValues=[];
			$HO.each(aCmp,function(i,oCmp){
				aValues.push(oCmp.value);
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
 * @created 2014-01-01
 */

$Define('c.Icon',
'c.AbstractComponent',
function(AC){
	
	var Icon=AC.define('Icon');
	
	Icon.extend({
		//初始配置
//		noBg            : false,              //是否取消背景
//		isAlt           : false,              //是否使用深色图标
//		name            : '',                 //图标名称
		
		tmpl            : [
			'<span class="hui-icon',
			'<%if(this.isAlt){%>',
				' hui-alt-icon',
			'<%}%>',
			' hui-icon-<%=this.name%>',
			'<%if(!this.noBg){%>',
			' hui-icon-bg',
			'<%}%>"></span>']
		
	});
	
	return Icon;
	
});/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('c.Button',
'c.AbstractComponent',
function(AC){
	
	var Button=AC.define('Button');
	
	Button.extend({
		//初始配置
//		text            : '',                  //按钮文字
//		isActive        : false,               //是否是激活状态
//		icon            : null,                //图标名称
		iconPos         : 'left',              //图标位置，"left"|"top"
		theme           : 'gray',
		activeCls       : 'hui-btn-blue',      //激活样式
		cls             : 'btn',               //组件样式名
//		isBack          : false,               //是否是后退按钮
		
		defItem         : {
			xtype       : 'Icon'
		},
		
		////通用效果
		radius          : 'normal',               //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow          : true,        	       //外阴影
		isInline        : true,                //宽度自适应
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" class="hui-btn',
							'<%if(!this.text){%> hui-btn-icon-notxt<%}',
							'if(this.isBack){%> hui-btn-back<%}',
							'if(this.hasIcon&&this.text){%> hui-btn-icon-<%=this.iconPos%><%}%>">',
							'<span class="hui-btn-txt"><%=this.text%></span>',
							'<%=this.getHtml("$>*")%>',
							'</a>'],
							
		parseItem       : fParseItem           //分析处理子组件
	});
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		if(oItem.xtype=="Icon"){
			me.hasIcon=true;
		}
	}
	
	return Button;
	
});/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-29
 */

$Define('c.Radio',
'c.AbstractComponent',
function(AC){
	
	var Radio=AC.define('Radio');
	
	Radio.extend({
		//初始配置
//		name            : '',                  //选项名
//		text            : '',                  //文字
//		value           : '',                  //选项值
//		selected        : false,               //是否选中
		
		tmpl            : [
			'<div class="hui-radio hui-btn hui-btn-gray<%if(this.selected){%> hui-radio-on<%}%>">',
				'<span class="hui-icon hui-icon-radio"></span>',
				'<input type="radio"<%if(this.selected){%> checked=true<%}%>',
				'<%if(this.disabled){%> disabled="<%=this.disabled%>"<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-radio-txt"><%=this.text%></span>',
			'</div>'
		],
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		bSelect=!(bSelect==false);
		me.selected=bSelect;
		var oInput=me.find('input');
		var oEl=me.getEl();
		if(bSelect){
			oInput.attr("checked",true);
			oEl.addClass('hui-radio-on');
		}else{
			oInput.removeAttr("checked");
			oEl.removeClass('hui-radio-on');
		}
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
			me.value=sValue;
			me.find('input').val(sValue);
		}else{
			return me.value;
		}
	}
	
	return Radio;
	
});/**
 * 多选框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('c.Checkbox',
'c.AbstractComponent',
function(AC){
	
	var Checkbox=AC.define('Checkbox');
	
	Checkbox.extend({
		//初始配置
//		name            : '',                  //选项名
		text            : '',                  //文字
		value           : '',                  //选项值
		selected        : false,               //是否选中
		multi           : true,                //多选
		
		cls             : 'chkbox',            //组件样式名
		tmpl            : [
			'<div class="hui-chkbox hui-btn hui-btn-gray<%if(this.selected){%> hui-chkbox-on<%}%>">',
				'<span class="hui-icon hui-icon-chkbox"></span>',
				'<input type="checkbox"<%if(this.selected){%> checked=true<%}%>',
				'<%if(this.disabled){%> disabled="<%=this.disabled%>"<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-chkbox-txt"><%=this.text%></span>',
			'</div>'
		],
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelected 仅当为false时取消选中
	 */
	function fSelect(bSelected){
		var me=this;
		bSelected=!(bSelected==false);
		me.selected=bSelected;
		var oInput=me.find('input');
		var oEl=me.getEl();
		if(bSelected){
			oInput.attr("checked",true);
			oEl.addClass('hui-chkbox-on');
		}else{
			oInput.removeAttr("checked");
			oEl.removeClass('hui-chkbox-on');
		}
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
			me.value=sValue;
			me.find('input').val(sValue);
		}else{
			return me.value;
		}
	}
	
	return Checkbox;
	
});/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Select',
'c.AbstractComponent',
function(AC){
	
	var Select=AC.define('Select');
	
	Select.extend({
		//初始配置
//		name            : '',                  //选项名
		text            : '请选择...',          //为选择时的文字
		value           : '',                  //默认值
		radius          : 'little',
//		options         : [{text:"文字",value:"值"}],    //选项
		optionClick     : function(){},
		defItem         : {
			xtype       : 'Menu',
			hidden      : true,
			markType    : 'dot',
			renderTo    : "body"              //子组件须设置renderTo才会自动render
		},
		
		_customEvents   : ['change'],
		tmpl            : [
			'<div class="hui-select hui-btn hui-btn-gray hui-btn-icon-right">',
				'<span class="hui-icon hui-alt-icon hui-icon-carat-d hui-light"></span>',
				'<input value="<%=this.value%>" name="<%=this.name%>"/>',
				'<span class="hui-btn-txt js-select-txt"><%=this.text%></span>',
			'</div>'
		],
		
		listeners       : [
			{
				type:'click',
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
		me.callSuper([oParams]);
		//options配置成菜单
		var oOptions=oParams.options;
		//根据默认值设置默认文字
		for(var i=0,len=oOptions.length;i<len;i++){
			var oOption=oOptions[i];
			if(oOption.value==oParams.value){
				me.text=oOption.text;
				oOption.selected=true;
				break;
			}
		}
		me.addItem({
			itemClick:function(oButton,nIndex){
				var sValue=oButton.value;
				me.val(sValue);
			},
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
			if(me.value!=sValue){
				var oMenu=me.children[0];
				var oItem=oMenu.find('$>[value="'+sValue+'"]');
				if(oItem.length>0){
					me.fire("change");
					oItem=oItem[0];
					me.value=sValue;
					var oSel=me.find('input');
					oSel.attr('value',sValue);
					me.txt(oItem.text);
					//更新菜单选中状态
					oMenu.select(oItem);
				}
			}
		}else{
			return me.value;
		}
	}
	
	return Select;
	
});/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('c.Input',
'c.AbstractComponent',
function(AC){
	
	var Input=AC.define('Input');
	
	Input.extend({
		//初始配置
//		type            : '',                  //输入框类型，默认为普通输入框，'search':搜索框，'textarea':textarea输入框
//		value           : '',                  //默认值
//		placeholder     : '',                  //placeholder
//		withClear       : false,               //带有清除按钮
		radius          : 'little',            //普通圆角
		iconPos         : 'left',              //图标位置
		btnPos          : 'right',             //按钮位置
		
		tmpl            : [
		'<div class="hui-input',
			'<%if(this.hasIcon){%>',
				' hui-input-icon-<%=this.iconPos%>',
			'<%}%>',
			'<%if(this.hasBtn){%>',
				' hui-input-btn-<%=this.btnPos%>',
			'<%}%>">',
			'<%=this.getHtml("$>*")%>',
			'<%if(this.type=="textarea"){%>',
				'<textarea class="js-input"',
			'<%}else{%>',
				'<input type="text" class="js-input hui-input-txt"',
			'<%}%> ',
			' name="<%=this.name%>"',
			'<%if(this.placeholder){%>',
				' placeholder="<%=this.placeholder%>"',
			'<%}%>',
			'<%if(this.type=="textarea"){%>',
				'><%=this.value%></textarea>',
			'<%}else{%>',
				' value="<%=this.value%>"/>',
			'<%}%> ',
		'</div>'],
		listeners       : [
			{
				type : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('hui-focus');
				}
			},
			{
				type : 'blur',
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
		me.callSuper([oSettings]);
		//搜索框快捷配置方式
		if(me.type=='search'){
			me.icon='search';
		}else if(me.type=="textarea"){
			//textarea高度自适应，IE6、7、8支持propertychange事件，input被其他浏览器所支持
			me._listeners.push({
				type:'input propertychange',
				el:'.js-input',
				handler:function(){
					var oTextarea=me.find(".js-input");
					oTextarea.css("height",oTextarea[0].scrollHeight);
				}
			});
		}
		//清除按钮快捷配置方式
		if(me.withClear){
			me.addItem({
				xtype:'Button',
				radius:'big',
				icon:'delete',
				click:function(){
					this.parent.find('input').val('').focus();
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
		if(oItem.xtype=="Icon"){
			me.hasIcon=true;
		}else if(oItem.xtype=="Button"){
			me.hasBtn=true;
		}
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var oInput=this.find('input');
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
		this.find('input').focus();
	}
	
	return Input;
	
});/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('c.Tab',
['c.AbstractComponent',
'c.ControlGroup'],
function(AC,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	Tab.extend({
		//初始配置
		defItem         : {                    //默认子组件是Button
			xtype:'Button',
			radius:null,
			isInline:false,
			extCls:'js-item',
			iconPos:'top',
			shadow:false
		},
		
		tmpl            : [
			'<div class="hui-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<li class="hui-tab-item" style="width:<%=100/len%>%">',
					'<%=this.children[i].getHtml()%>',
					'</li>',
					'<%}%>',
				'</ul>',
				'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<div class="js-tab-content"<%if(!this.children[i].selected){%> style="display:none"<%}%>>',
					'<%=this.children[i].content%>',
					'</div>',
				'<%}%>',
			'</div>'
		],
		
		parseItem       : fParseItem,          //处理子组件配置
		onItemClick     : fOnItemClick         //子项点击事件处理
	});
	
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.selected){
			oItem.isActive=true;
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
		//点击tab按钮显示对应的content
		me.find('.js-tab-content').hide().eq(nIndex).show();
		me.callSuper([oEvt,nIndex]);
	}
	
	return Tab;
	
});/**
 * 工具栏类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('c.Toolbar',
'c.AbstractComponent',
function(AC){
	
	var Toolbar=AC.define('Toolbar');
	
	Toolbar.extend({
		//初始配置
//		title            : '',                  //标题
		cls              : 'tbar',
//		type             : null,                //null|'header'|'footer'
		defItem          : {
			xtype        : 'Button',
			theme        : 'black',
			pos          : 'right',
			isMini       : true
		},
		
		tmpl             : [
			'<div class="hui-tbar<%if(this.type=="header"){%> hui-header<%}else if(this.type=="footer"){%> hui-footer<%}%>">',
				'<%=this.getHtml(">*")%>',
				'<%if(this.title){%><h1 class="hui-tbar-title js-tbar-txt"><%=this.title%></h1><%}%>',
			'</div>'
		],
		
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

$Define('c.Tips',
['c.AbstractComponent',
'c.Popup',
'c.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Tips=AC.define('Tips',Popup);
	
	Tips.extend({
		//初始配置
//		text            : '',
		theme           : 'black',
		timeout         : 2000,
		radius          : 'normal',
		
		tmpl            : [
			'<div class="hui-tips<%if(!this.text){%> hui-tips-notxt<%}%>">',
				'<%=this.getHtml("$>*")%>',
				'<%if(this.text){%><span class="hui-tips-txt"><%=this.text%></span><%}%>',
			'</div>'
		]
		
	});
	
	return Tips;
	
});/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('c.Dialog',
['c.AbstractComponent',
'c.Popup'],
function(AC,Popup){
	
	var Dialog=AC.define('Dialog',Popup);
	
	//快捷静态方法
	$HO.extend(Dialog,{
		alert           : fAlert,    //弹出警告框
		confirm         : fConfirm,  //弹出确认框
		prompt          : fPrompt    //弹出输入框
	});
	
	Dialog.extend({
		
		//对话框初始配置
//		title           : '',             //标题
//		noClose         : false,          //true时没有close图标
//		content         : '',             //html内容，传入此值时将忽略contentTitle和contentMsg
//		contentTitle    : '',             //内容框的标题
//		contentMsg      : '',             //内容框的描述
//		noAction        : false,          //true时没有底部按钮
//		noOk            : false,          //true时没有确定按钮
//		noCancel        : false,          //true时没有取消按钮
		okTxt           : '确定',          //确定按钮文字
		cancelTxt       : '取消',          //取消按钮文字
//		okCall          : function(){},   //确定按钮事件函数
//		cancelCall      : function(){},   //取消按钮事件函数
		
		clickHide       : false,          //点击不隐藏
		
		//组件共有配置
		radius          : 'normal',
		
		tmpl            : [
			'<div class="hui-dialog">',
				'<%=this.getHtml("$>Toolbar")%>',
				'<div class="hui-dialog-body">',
					'<%if(this.content){%><%=this.content%><%}else{%>',
						'<div class="hui-body-content">',
							'<h1 class="hui-content-title"><%=this.contentTitle%></h1>',
							'<div class="hui-content-msg"><%=this.contentMsg%></div>',
							'<%=this.getHtml("$>[role=\'content\']")%>',
						'</div>',
					'<%}%>',
					'<%if(!this.noAction){%>',
						'<div class="hui-body-action">',
						'<%=this.getHtml("$>Button")%>',
						'</div>',
					'<%}%>',
				'</div>',
			'</div>'
		],
		doConfig         : fDoConfig        //处理配置
	});
	
	/**
	 * 弹出警告框
	 * @method alert
	 * @param {string}sMsg 提示信息
	 */
	function fAlert(sMsg){
		return new Dialog({
			title:'&nbsp;',
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
			title:'&nbsp;',
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
			title:'&nbsp;',
			contentMsg:sMsg,
			noClose:true,
			items:{
				xtype:'Input',
				role:'content',
				value:sDefault
			},
			okCall:function(){
				var value=this.find('$Input')[0].val();
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
		me.callSuper([oSettings]);
		if(me.title){
			//顶部标题栏
			me.addItem({
				xtype:'Toolbar',
				title:me.title,
				theme:'gray',
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
		if(!me.noAction){
			if(!me.noOk){
				//确定按钮
				me.addItem({
					xtype:'Button',
					isActive:true,
					text:me.okTxt,
					isInline:false,
					click:function(){
						if((me.okCall&&me.okCall())!=false){
							me.hide();
						}
					}
				});
			}
			if(!me.noCancel){
				//取消按钮
				me.addItem({
					xtype:'Button',
					isInline:false,
					text:me.cancelTxt,
					click:function(){
						if((me.cancelCall&&me.cancelCall())!=false){
							me.hide();
						}
					}
				});
			}
		}
	}
	
	return Dialog;
	
});/**
 * 菜单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-02
 */

$Define('c.Menu',
['c.AbstractComponent',
'c.Popup',
'c.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Menu=AC.define('Menu',Popup);
	
	//扩展取得ControlGroup的属性及方法
	Menu.extend(ControlGroup.prototype);
	
	Menu.extend({
		//初始配置
//		markType        : null,         //选中的标记类型，默认不带选中效果，'active'是组件active效果，'dot'是点选效果
		
		tmpl            : [
			'<div class="hui-menu<%if(this.markType=="dot"){%> hui-menu-mark<%}%>">',
				'<ul>',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
						'<li class="hui-menu-item<%if(this.children[i].selected){%> hui-item-mark<%}%>">',
							'<%=this.children[i].getHtml()%>',
							'<%if(this.markType=="dot"){%><span class="hui-icon-mark"></span><%}%>',
						'</li>',
					'<%}%>',
				'</ul>',
			'</div>'
		],
		
		selectItem      : fSelectItem         //选中/取消选中
	});
	
	/**
	 * 选中/取消选中
	 * @method selectItem
	 * @param {Component}oItem 要操作的组件
	 * @param {boolean=}bSelect 仅当为false时表示移除选中效果
	 */
	function fSelectItem(oItem,bSelect){
		var me=this;
		bSelect=bSelect!=false;
		//优先使用配置的效果
		if(me.markType=="dot"){
			oItem.selected=bSelect;
			var oLi=oItem.getEl().parent();
			oLi[bSelect==false?"removeClass":"addClass"]('hui-item-mark');
		}else if(me.markType=='active'){
			ControlGroup.prototype.selectItem.call(me,oItem,bSelect);
		}else{
			//无选中效果
			oItem.selected=bSelect;
		}
	}
	
	return Menu;
	
});/**
 * 列表类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-06
 */

$Define('c.List',
['c.AbstractComponent',
'c.ControlGroup'],
function(AC,ControlGroup){
	
	var List=AC.define('List',ControlGroup);
	
	List.extend({
		tmpl              : [
			'<div class="hui-list">',
				'<div class="hui-list-item c-clear">',
				'</div>',
			'</div>'
		]
	});
	
	return List;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("m.AbstractModule","cm.AbstractView",function (AbstractView) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = $HO.createClass();
	
	$HO.inherit(AbstractModule,AbstractView,null, {
		
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		                                 //模块初始化后以_container为准，获取需用getEl方法
		useCache       : true,           //{boolean}是否使用cache
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		initialize     : fInitialize,    //模块类创建时初始化
		cache          : function(){},   //显示模块缓存
		init           : function(){},   //初始化函数, 在模块创建后调用（在所有模块动作之前）
		beforeRender   : function(){},   //模块渲染前调用
		render         : function(){},   //模块渲染
		afterRender    : function(){},   //模块渲染后调用
		reset          : function(){},   //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},   //离开该模块前调用, 返回true允许离开, 否则不允许离开
		destroy        : fDestroy,       //模块销毁
		getHtml        : fGetHtml        //获取该模块的html
	});
	/**
	 * 构造函数
	 * @param{any} oConf 模块配置对象
	 * @return{void} 
	 */
	function fInitialize(oConf) {
		//Object.extend(this, oConf);
		this.conf = oConf;
	}
	/**
	 * 销毁模块
	 * @method destroy
	 */
	function fDestroy(){
		var me=this;
		me.getEl().remove();
	}
	/**
	 * 获取该模块的html
	 * @method getHtml
	 * @return {string} 返回模板html
	 */
	function fGetHtml(){
		var me=this;
		if(!me.tmpl){
			return '';
		}
		//将组件数组方式的模板转为字符串
		if(typeof me.tmpl!='string'){
			me.constructor.prototype.tmpl=me.tmpl.join('');
		}
		//由模板生成组件html
		var sHtml=$H.Template.tmpl({id:me.name,tmpl:me.tmpl},me);
		return sHtml;
	}
	
	return AbstractModule;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.module.AbstractDao
$Define('m.AbstractDao',function(){
	
	var AbstractDao=$HO.createClass();
	
	$HO.extend(AbstractDao,{
		ajax         : fAjax,        //ajax方法
		beforeSend   : $H.noop,      //发送前处理
		error        : $H.noop,      //错误处理
		success      : $H.noop       //成功处理
	});
	
	/**
	 * ajax
	 * @method ajax
	 * @param {Object}oParams
	 * 
	 */
	function fAjax(oParams){
		var me=this;
		me.beforeSend(oParams);
		oParams.error=$HF.intercept(me.error,oParams.error);
		oParams.success=$HF.intercept(me.success,oParams.success);
		return $.ajax(oParams);
	}
	
	return AbstractDao;
	
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 视图抽象类，模块的视图都要继承此类
 */
//handy.module.AbstractView
$Define('m.AbstractView',function(){
	
	var AbstractView=$HO.createClass();
	
	$HO.extend(AbstractView.prototype,{
	});
	
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/
//handy.module.AbstractNavigator
$Define("m.AbstractNavigator","handy.base.Object",function (Object) {
	/**
	 * 模块导航效果基类
	 * 
	 * @class AbstractNavigator
	 */
	var AbstractNavigator = Object.createClass();
	
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
$Define("m.History",
'handy.base.HashChange',
function(HashChange){

	var History=$HO.createClass();
	
	var _nIndex=0;
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
		getHashParam       : fGetHashParam,    //获取当前hash参数
		getCurrentState    : fGetCurrentState, //获取当前状态
		getPreState        : fGetPreState,     //获取前一个状态
		back               : fBack             //后退一步
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {?string} sKey历史记录类的key，用于区分可能的多个history实例
	 */
	function fInitialize(sKey){
		var me=this;
		me.key=sKey||'handy';
		me.states=[];
		HashChange.listen($H.Function.bind(me.stateChange,me));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var me=this;
		var oHashParam=me.getHashParam();
		var sKey=oHashParam.hKey;
		var aStates=me.states;
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		if(sKey==aStates[aStates.length-1]){
			//return;
		}
		var oState=aStates[sKey];
		if(oState){
			oState.onStateChange(oState.param,true);
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
		var sHistoryKey=me.key+(++_nIndex);
		me.states.push(sHistoryKey);
		me.states[sHistoryKey]=oState;
		var oHashParam={
			hKey    : sHistoryKey,
			param : oState.param
		};
		$HU.setHash("#"+JSON.stringify(oHashParam));
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		var me=this;
		try{
			var sHash=$HU.getHash().replace("#","");
			var oHashParam=JSON.parse(sHash);
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
			var oHashParam=JSON.parse($HU.getHash().replace("#",""));
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
$Define("m.ModuleManager",
"m.History",
function(History){
	
	var ModuleManager=$HO.createClass();
	
	$HO.extend(ModuleManager.prototype,{
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//modules          : null,   //缓存模块
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		
		_getModWrapper     : _fGetModWrapper,   //获取模块包装div
		_createMod         : _fCreateMod,       //新建模块
		_showMod           : _fShowMod,         //显示模块
		_hideAll           : _fHideAll,         //隐藏所有模块
		_destroy           : _fDestroy,         //销毁模块
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo               //进入模块
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
			var oMod=new Module();
			oMod.name=sModName;
			oMod.mType=sModName;
			oMod.initParam=oParams;
			me.modules[sModName]=oMod;
			//模块初始化
			oMod.init(oParams);
			oMod.beforeRender();
			//模块渲染
			var oModWrapper=me._getModWrapper(sModName);
			oMod._container=oModWrapper;
			var oContainer=oMod.renderTo?$(oMod.renderTo):me.container;
			oModWrapper.html(oMod.getHtml());
			oContainer.append(oModWrapper);
			$HL.fire('afterRender',oModWrapper);
			oMod.render(oModWrapper);
			//可能加载完时，已切换到其它模块了
			if(me.currentMod==sModName){
				me._showMod(oMod);
			}
			oMod.afterRender();
		});
	}
	/**
	 * 获取模块包装div
	 * @method _getModWrapper
	 * @param {string}sModName
	 */
	function _fGetModWrapper(sModName){
		var me=this;
		var sId="modWrapper_"+sModName;
		var oDiv=$("#"+sId);
		if(oDiv.length==0){
			oDiv=$('<div id="'+sId+'" class="js-module m-module"></div>');
		}
		return oDiv;
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param
	 */
	function _fShowMod(oMod){
		var me=this;
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(me.navigator&&me.navigator.navigate(oMod,me)){
			return false;
		}else{
			this._hideAll();
			oMod._container.show();
		}
		oMod.isActive=true;
	}
	/**
	 * 隐藏所有模块
	 * @method _hideAll
	 * @param
	 */
	function _fHideAll(){
		var oModules=this.modules
		for(var module in oModules){
			oModules[module]._container.hide();
			oModules[module].isActive=false;
		}
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
		if(oConf){
			me.conf=oConf;
			$HO.extend(me,oConf);
			me.container=oConf.container?$(oConf.container):$(document.body);
		}
		me.defModPackage=me.defModPackage+".";
		me.history=new History();
		me.modules={};
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param {object}oParams{  //传入参数
	 * 		modName:模块名称
	 * 		...
	 * }
	 * @param {boolean=}bNotSaveHistory仅当为true时，不保存历史记录
	 */
	function fGo(oParams,bNotSaveHistory){
		var me=this;
		var sModName=oParams.modName;
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
		if(oCurrentMod&&!oCurrentMod.waiting&&!oCurrentMod.exit()){
			return false;
		}
		
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod){
			//标记使用缓存，要调用cache方法
			if(oMod.useCache){
				me._showMod(oMod);
				oMod.cache(oParams);
			}else if(!oMod.waiting){
				//标记不使用缓存，销毁新建
				me._destroy(oMod);
				me._createMod(oParams);
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			me._createMod(oParams);
		}
		if(bNotSaveHistory!=true){
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:oParams
			});
		}
		//重新标记当前模块
		me.currentMod=sModName;
	}
	
	return ModuleManager;
	
});
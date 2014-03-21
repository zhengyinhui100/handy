/**
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
});
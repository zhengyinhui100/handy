/**
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
	    if ($H.isFunction(value)){
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
        var bIsFunc = Object.isFunction(method);
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
	
});
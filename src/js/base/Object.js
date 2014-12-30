/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define('B.Object',function(){
	
	var oWin=window;
	var wObject=oWin.Object;
	
	var Obj={
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
		fromArray           : fFromArray        //将元素形如{name:n,value:v}的数组转换为对象
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
						if(bAddMeta&&Obj.isFunc(value)&&!value.$name){
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
    	return Obj.extend(oDestination,oSource,{notCover:true});
    }
    /**
    * 自定义的继承方式，可以继承object和prototype，prototype方式继承时，非原型链方式继承。
	* 如需原型链方式继承使用Class.inherit。
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
            //Class.inherit(oChild, oParent,null, oPrototypeExtend);
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
                            if (o2[sKey] === undefined) {
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
        	if(bStrict!==true&&Obj.isSimple(o1)&&Obj.isSimple(o2)&&(o1+''===o2+'')){
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
    * @param {Object}object 参数对象
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
     * @param {Object|Array}o1 要比较的对象
     * @param {Object|Array}o2 比较的对象
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
    * @param {Object}oParam 参数对象
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
     * @param {Object|Array}obj 参数对象
     * @param {boolean=}bNew 是否新建结果对象，不影响原对象
     * @param {Object|Array} 返回结果
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
	
	return Obj;
	
});
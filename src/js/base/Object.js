/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Object',function($H){
	
	var Object={
		namespace           : fNamespace,       //创建或读取命名空间，可以传入用以初始化该命名空间的对象
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
		contain             : fContain,         //是否包含指定属性/数组元素
		count				: fCount,			//计算对象长度
		toArray				: fToArray,		    //将类数组对象转换为数组，比如arguments, nodelist
		genMethod           : fGenerateMethod   //归纳生成类方法
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
    * 创建并返回一个类
    * @method createClass
    * @param {string}sPath 类路径
    * @return {Object} 返回新创建的类
    */
    function fCreateClass(sPath) {
        //获得一个类定义，并且绑定一个类初始化方法
        var Class = function(){
        	var that,fInitialize;
        	//获得initialize引用的对象，如果是类调用，就没有this.initialize
        	if(this.constructor==Class){
        		that = this;
        	}else{
        		that = arguments.callee;
        	}
        	fInitialize = that.initialize;
            if (fInitialize) {
                // 返回当前class派生出来对象可以被定义
            	return fInitialize.apply(that, arguments);
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
    * 				{boolean=|array=}notCover 不覆盖原有属性/方法，当此参数为true时不覆盖所有属性,当此参数为数组时，仅不覆盖数组中的属性
    * 				{array=}ignore 忽略的属性/方法
    * 				{boolean=}notClone 不克隆，仅当此参数为true时不克隆，此时，由于目标对象里的复杂属性(数组、对象等)是源对象中的引用，源对象的修改会导致目标对象也修改
    * }
    * @return {Object} 扩展后的对象
    */
    function fExtend(oDestination, oSource, oOptions) {
    	var notCover=oOptions?oOptions.notCover:false;
    	var bNotClone=oOptions?oOptions.notClone:false;
        for (var sProperty in oSource) {
        	var bNotCover=typeof notCover=='array'?Object.contain(notCover,sProperty):notCover;
            if (!(oOptions&&oOptions.ignore&&Object.contain(oOptions.ignore,sProperty))&&(!bNotCover||!oDestination.hasOwnProperty(sProperty))) {
				oDestination[sProperty] = bNotClone?oSource[sProperty]:Object.clone(oSource[sProperty]);
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
        if (!oChild.superProt) {
            oChild.superProt = {};
        }
        for (var sProperty in oParent) {
            if(Object.isFunction(oParent[sProperty])){// 如果是方法
                if(!oChild.superProt[sProperty]){// superProt里面没有对应的方法，直接指向父类方法
                    oChild.superProt[sProperty] = oParent[sProperty];
                }else{// superProt里有对应方法，需要新建一个function依次调用
                    var _function = oChild.superProt[sProperty];
                    oChild.superProt[sProperty] = function (_property, fFunc) {
						return function () {
							fFunc.apply(this, arguments);
							oParent[_property].apply(this, arguments);
						};
                    }(sProperty, _function);
                }
            }else{// 类属性，直接复制
                oChild.superProt[sProperty] = oParent[sProperty];
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
            oChild.superProt.toString = function () {
                oParent.toString.apply(oChild, arguments);
            };
        }
        if (oPrototypeExtend && oChild.prototype && oParent.prototype) {
            Object.inherit(oChild, oParent, oPrototypeExtend);
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
    */
    function fInherit(oChild, oParent, oStaticExtend,oExtend) {
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
        Object.extend(oChild, oParent,{notCover:true});
        oChild.prototype = new Inheritance();
        oChild.prototype.constructor = oChild;
        oChild.superClass = oParent;
        oChild.superProt = oParent.prototype;
        //额外的继承动作
        if(oParent._onInherit){
            try{
                oParent._onInherit(oChild);
            }catch(e){}
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
    * @param {Object}fCallback 回调函数:fCallback(property,value),返回false时退出遍历
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
     * @method contain 
     * @param {*}obj 指定对象
     * @param {*}prop 指定属性/数组元素
     * @return {boolean} 包含则返回true
     */
    function fContain(obj,prop){
    	var bIsContain=false;
    	Object.each(obj,function(i,p){
    		if(p===prop){
    			bIsContain=true;
    			return false;
    		}
    	});
    	return bIsContain;
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
    * @method genMethod
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
	
})
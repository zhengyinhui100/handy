/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Object',function($){
	
	var Object={
		namespace           : fNamespace,       //创建或读取命名空间，可以传入用以初始化该命名空间的对象
		checkNs             : fCheckNamespace,  //检查命名空间是否存在/正确
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
		count				: fCount,			//计算对象长度
		toArray				: fToArray,		    //将类数组对象转换为数组，比如arguments, nodelist
		genMethod           : fGenerateMethod   //归纳生成类方法
	}
	/**
    * 创建或读取命名空间，可以传入用以初始化该命名空间的对象
    * @method namespace (sPath[,object])
    * @param {string}sPath 命名空间路径字符串
    * @param {any}object (可选)用以初始化该命名空间的对象，默认是空对象
    * @return {object} 如果只传一个路径，返回该路径的命名空间
    */
	function fNamespace(sPath,object){
		var oObject=null, j, aPath, root,len;  
        aPath=sPath.split(".");  
        root = aPath[0];  
        eval('if (typeof ' + root + ' == "undefined"){' + root + ' = {};} oObject = ' + root + ';');  
        //循环命名路径
        for (j=1,len=aPath.length; j<len; ++j) { 
        	if(j==len-1&&object){
        		oObject[aPath[j]]=object;
        	}else{
	            oObject[aPath[j]]=oObject[aPath[j]] || {};  
        	}
            oObject=oObject[aPath[j]];  
        } 
    	return oObject;
	}
	/**
    * 检查命名空间是否存在/正确
    * @method chkNs(sPath[,fCheck])
    * @param {string}sPath 命名空间路径字符串
    * @param {function}fCheck (可选)附加检查函数,将该命名空间下的对象作为检查函数的参数，返回检查函数执行结果
    * @return {boolean} true表示存在/正确
    */
	function fCheckNamespace(sPath,fCheck){
        var aPath=sPath.split(".");  
        var root = aPath[0],oObject,isExist=true;  
        eval('if(typeof ' + root + ' == "undefined"){isExist= false;}else{oObject = ' + root + ';}');  
        if(!isExist){
        	return false;
        }
        //循环命名路径
        for (var j=1,nLen=aPath.length; j<nLen; ++j) {  
        	var oCurrent=oObject[aPath[j]];
        	if(!oCurrent){
        		return false;
        	}else if(j==nLen-1&&fCheck){
        		return fCheck(oCurrent);
        	}
            oObject=oCurrent;  
        } 
        return true;
	}
	/**
    * 创建并返回一个类
    * @method createClass
    * @param {void}
    * @return {funciton} 返回新创建的类
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
    * @method extend(oDestination, oSource [, oOptions])
    * @param {object} oDestination 目标对象
    * @param {object} oSource 源对象
    * @param {object} oOptions(可选){
    * 				notCover 不覆盖原有属性方法，仅当此参数为true时不覆盖,
    * 				notClone 不克隆，仅当此参数为true时不克隆，此时，由于目标对象里的复杂属性(数组、对象等)是源对象中的引用，源对象的修改会导致目标对象也修改
    * }
    * @return {object} 扩展后的对象
    */
    function fExtend(oDestination, oSource, oOptions) {
    	var bNotCover=oOptions?oOptions.notCover:false;
    	var bNotClone=oOptions?oOptions.notClone:false;
        for (var sProperty in oSource) {
            if (!bNotCover || !oDestination.hasOwnProperty(sProperty)) {
				oDestination[sProperty] = bNotClone?oSource[sProperty]:Object.clone(oSource[sProperty]);
            }
        }
        return oDestination;
    };
    /**
    * 自定义的继承方式，可以继承object和prototype，prototype方式继承时，非原型链方式继承。
	* 如需原型链方式继承使用Object.inherit。
	* 此继承方式的继承的对象可以是对普通对象或者是prototype对象，并且可以实现多重继承
    * @param {object} oChild 子对象
    * @param {object} oParent 父对象
    * @param {object} oExtend 扩展的属性方法
    * @param {object} oPrototypeExtend 扩展的prototype属性方法
    * @return {object} 扩展后的类
    */
    function fMix(oChild, oParent, oExtend, oPrototypeExtend) {
        if (!oChild.superClass) {
            oChild.superClass = {};
        }
        for (var sProperty in oParent) {
            if(Object.isFunction(oParent[sProperty])){// 如果是方法
                if(!oChild.superClass[sProperty]){// superClass里面没有对应的方法，直接指向父类方法
                    oChild.superClass[sProperty] = oParent[sProperty];
                }else{// superClass里有对应方法，需要新建一个function依次调用
                    var _function = oChild.superClass[sProperty];
                    oChild.superClass[sProperty] = function (_property, fFunc) {
						return function () {
							fFunc.apply(this, arguments);
							oParent[_property].apply(this, arguments);
						};
                    }(sProperty, _function);
                }
            }else{// 类属性，直接复制
                oChild.superClass[sProperty] = oParent[sProperty];
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
            oChild.superClass.toString = function () {
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
    * @param {object} oChild 子类
    * @param {object} oParent 父类
    * @param {object} oExtend 需要扩展的prototype方法集
    */
    function fInherit(oChild, oParent, oExtend) {
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
        oChild.superConstructor = oParent;
        oChild.superClass = oParent.prototype;
        //额外的继承动作
        if(oParent._onInherit){
            try{
                oParent._onInherit(oChild);
            }catch(e){}
        }
        //扩展属性
        if(oExtend){
            Object.extend(oChild.prototype, oExtend);
        }
    }
    /**
    * 对象是否是函数类型
    * @method isFunction
    * @param {object} obj 对象
    * @return {boolean} 返回判断结果
    */
    function fIsFunction(obj) {
        return window.Object.prototype.toString.call(obj) === "[object Function]";
    }
    /**
    * 对象是否是数组类型
    * method isArray
    * @param {object} obj 对象
    * @return {bool} 返回判断结果
    */
    function fIsArray(obj) {
        return window.Object.prototype.toString.call(obj) === "[object Array]";
    }
    /**
    * 对比对象值是否相同
    * @method equals
    * @param {object} o1 对象1
    * @param {object} o2 对象2
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
    * @param {object} oFrom 需要clone的对象
    * @return {object} 返回克隆的对象，如果对象属性不支持克隆，将原来的对象返回
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
    * @param {object}object 参数对象
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
    * @param {any}object 参数对象
    * @param {object}fCallback 回调函数:fCallback(property,value),返回false时退出遍历
    * @param {any}args  回调函数的参数
    * @return {void}
    */
    function fEach(object, fCallback, args) {
    	var sName, i = 0,
			nLength = object.nLength,
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
    * @method toArray(oParam[,nStart,nEnd])
    * @param {Object}oParam 参数对象
    * @param {number}nStart 起始位置
    * @param {number}nEnd   结束位置
    * @return {array} 返回转换后的数组
    */
    var fToArray=(function() {
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
    })()
    /**
    * 归纳生成类方法
    * @method genMethod
    * @param {object}oTarget 需要生成方法的对象
    * @param {string|array}method 需要生成的方法列表，如果是字符串，用","作为分隔符
    * @param {function}fDefined 方法定义函数，该函数执行后返回方法定义
    * @return {array} 返回转换后的数组
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
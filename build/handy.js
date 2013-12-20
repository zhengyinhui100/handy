/* Handy v1.0.0-dev  |  zhengyinhui100@gmail.com */
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
	handy.noConflict = fNoConflict;   //处理命名冲突
	
	/**
	 * 添加子模块
	 * @method add
	 * @param {string}sName 模块名称
	 * @param {Object=}aRequires 模块依赖资源
	 * @param {function(Object):*}fDefined 模块功能定义
	 */
	function fAdd(sName,aRequires,fDefined){
		if(!fDefined){
			fDefined=aRequires;
			aRequires=null;
		}
		if(!aRequires||!handy.Loader||true){
			if(!handy.base){
				handy.base={};
			}
			handy.base[sName]=handy[sName]=fDefined(handy);
		}else{
			handy.Loader.require(aRequires,function(){
				handy[sName]=fDefined(handy);
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
	
})()/**
 * 对象扩展类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Object',function($){
	
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
		count				: fCount,			//计算对象长度
		toArray				: fToArray,		    //将类数组对象转换为数组，比如arguments, nodelist
		genMethod           : fGenerateMethod   //归纳生成类方法
	}
	/**
    * 创建或读取命名空间
    * @method namespace (sPath,object=)
    * @param {string}sPath 命名空间路径字符串
    * @param {*=}obj (可选)用以初始化该命名空间的对象
    * @return {?*} 返回该路径的命名空间，不存在则返回undefined
    */
	function fNamespace(sPath,obj){
		var oObject=null, j, aPath, root,len;  
        aPath=sPath.split(".");  
        root = aPath[0]; 
        //考虑压缩的因素
        oObject=eval('(function(){if (typeof ' + root + ' == "undefined"){' + root + ' = {};}return ' + root + ';})()');  
        //循环命名路径
        for (j=1,len=aPath.length; j<len; ++j) { 
        	if(j==len-1&&obj){
        		oObject[aPath[j]]=obj;
        	}else if(obj||oObject[aPath[j]]){
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
    * 				notCover 不覆盖原有属性方法，仅当此参数为true时不覆盖,
    * 				notClone 不克隆，仅当此参数为true时不克隆，此时，由于目标对象里的复杂属性(数组、对象等)是源对象中的引用，源对象的修改会导致目标对象也修改
    * }
    * @return {Object} 扩展后的对象
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
    * @param {Object} oChild 子对象
    * @param {Object} oParent 父对象
    * @param {Object} oExtend 扩展的属性方法
    * @param {Object} oPrototypeExtend 扩展的prototype属性方法
    * @return {Object} 扩展后的类
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
    * @param {Object} oChild 子类
    * @param {Object} oParent 父类
    * @param {Object} oExtend 需要扩展的prototype方法集
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
	
})/**
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
		parse                : fParse                //将日期字符串转换为Date对象
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
	
	return Date;
})/**
 * 浏览器环境类，分析浏览器类型、版本号、操作系统、内核类型、壳类型、flash版本
 * 浏览器版本，$Browser.ie/firefox/chrome/opera/safari(),如果浏览器是IE的，$.Browser.ie()的值是浏览器的版本号，!$.Browser.ie()表示非IE浏览器
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Browser",["Object"],function($){

	var oInfo={};
	
	var Browser={};
	
	//归纳生成方法，如：Browser.ie()返回ie的版本号(默认返回整型，传入true参数时返回实际版本号，如：'20.0.1132.43')，Browser.windows()返回是否是windows系统
	$.Object.genMethod(Browser,[
			'ie','firefox','chrome','safari','opera',   //浏览器版本，@return{string}
			'windows','linux','mac',                    //操作系统，@return{boolean}
			'trident','webkit','gecko','presto',        //浏览器内核类型，@return{boolean}
			'sogou','maxthon','tt','theWorld','is360',  //浏览器壳类型，@return{boolean}
			'flash'                                     //flash版本，@return{string}
		],
		function(sName){
			
			return function(bNotInt){
				var sValue=oInfo[sName];
				return !bNotInt&&typeof sValue==='string'?parseInt(sValue):sValue;
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
		(matcher = ua.match(/MSIE ([\d.]+)/)) ? oInfo.ie = matcher[1] :
		(matcher = ua.match(/Firefox\/([\d.]+)/))? oInfo.firefox = matcher[1]: 
		(matcher = ua.match(/Chrome\/([\d.]+)/))? oInfo.chrome = matcher[1]: 
		(matcher = ua.match(/Opera.([\d.]+)/))? oInfo.opera = matcher[1]: 
		(matcher = ua.match(/Version\/([\d.]+).*Safari/))? oInfo.safari = matcher[1]: 0;
	}
	/**
	 * 分析浏览器类型及版本
	 * @method _fParseOs
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseOs(userAgent){
		var os;
		// 读取分析操作系统
		/windows|win32/i.test(userAgent)?oInfo.windows=true:
		/linux/i.test(userAgent)?oInfo.linux=true:
		/macintosh/i.test(userAgent)?oInfo.mac=true:0;
	}
	/**
	 * 分析浏览器内核类型
	 * @method _fParseKernel
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseKernel(userAgent){
		var ua =userAgent;
		var matcher;
		// 使用正则表达式在userAgent中提取浏览器版本信息
		/trident/i.test(ua) ? oInfo.trident = true :
		/webkit/i.test(ua)? oInfo.webkit = true: 
		/gecko/i.test(ua)? oInfo.gecko = true: 
		/presto/i.test(ua)? oInfo.presto = true: 0;
	}
	/**
	 * 分析浏览器壳类型
	 * @method _fParseShell
	 * @param {string}userAgent 浏览器userAgent
	 */
	function _fParseShell(userAgent){
		var matcher;
		var ua=userAgent;
		// 使用正则表达式在userAgent中提取浏览器壳信息
		/MetaSr/i.test(ua) ? oInfo.sogou = true :
		/Maxthon/i.test(ua)? oInfo.maxthon = true: 
		/TencentTraveler/i.test(ua)? oInfo.tt = true: 
		/TheWorld/i.test(ua)? oInfo.theWorld = true: 
		/360[S|E]E/i.test(ua)? oInfo.is360 = true: 0;
	}
	/**
	 * 分析浏览器flash版本
	 * @method _fParseFlash
	 */
	function _fParseFlash(){
		var flashVersion;
		try{
			// 如果是ie浏览器
			if(oInfo.ie){
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
		oInfo.flash = !!flashVersion?flashVersion:null;
	}
	
	_fInit();
	return Browser;
	
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
handy.add('Util',function($){
	
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
		var sNewHash=sOrgHash.replace(/#[^\?]*/,sHash);
		return top.location.hash=sNewHash;
	}
	
	return Util;
	
})/**
 * 函数类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Function',['Object'],function($){
	
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
		var oExecScope=oExecScope||window;
		var oInterceptScope=oInterceptScope||oExecScope||window;
		if($.Object.isFunction(fInterceptFunc)){
			return function() {
		                var args = arguments;
		                oInterceptScope.target = oExecScope;
		                oInterceptScope.method = fExecFunc;
		                return fInterceptFunc.apply(oInterceptScope, args) != false ?
				                   fExecFunc.apply(oExecScope, args) :null;
				   };

		}
	}
	
	return Function;
	
})/**
 * 调试类，方便个浏览器下调试，在发布时统一删除调试代码
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Debug",['Json'],function($){
	
	var Debug={
		level	    : 0,            //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	: 1,            //日志级别
		INFO_LEVEL  : 2,            //信息级别
		WARN_LEVEL  : 3,            //警告级别
		ERROR_LEVEL	: 4,            //错误级别
		DEBUG_LEVEL : 5,            //调试级别
		showInPage  : false,        //是否强制在页面上输出调试信息，主要用于不支持console的浏览器，如：IE6
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
		if(bShowInPage||this.showInPage){
			var sDivId = 'debugDiv';
			var oDocument = top.document;
			var oDebugDiv = oDocument.getElementById(sDivId);
			if(!oDebugDiv){
				oDebugDiv = oDocument.createElement("DIV");
				oDebugDiv.id = sDivId;
				oDebugDiv.innerHTML = '<a href="javascript:void(0)" onclick="this.parentNode.style.display=\'none\'">关闭</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.getElementsByTagName(\'DIV\')[0].innerHTML=\'\';">清空</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';">全屏</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.style.height=\'100px\';">恢复</a><div></div>';
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
				oDebugDiv.style.zIndex = 999;
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oVarDiv = oDocument.createElement("DIV");
			//TODO JSON
			oVarDiv.innerHTML = sType+":"+JSON.stringify(oVar, null, '<br/>');
			oDebugDiv.getElementsByTagName('DIV')[0].innerHTML = oVarDiv.innerHTML;
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
		var that=this;
		if(that.level>that.LOG_LEVEL){
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
		var that=this;
		if(this.level>that.INFO_LEVEL){
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
		var that=this;
		if(that.level>that.WARN_LEVEL){
			return;
		}
		_fOut(oVar,!!bShowInPage,'warn');
	}
	/**
	 * 输出错误
	 * @method error
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fError(oVar,bShowInPage){
		var that=this;
		if(that.level>that.ERROR_LEVEL){
			return;
		}
		_fOut(oVar,!!bShowInPage,"error");
	}
	/**
	 * 输出统计时间
	 * @method time
	 * @param {string}sMsg 输出的信息
	 * @param {boolean}bOut 为true时，计算时间并输出信息
	 * @param {boolean}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fTime(sMsg,bOut,bShowInPage){
		var that=this;
		if(that.level>that.INFO_LEVEL){
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
	 * @param {Object} fCondiction	输出断点的条件就判断是否返回true，也可以不传，不传为默认debug
	 */
	function fDebug(fCondiction){
		var that=this;
		if(that.level>that.DEBUG_LEVEL){
			return;
		}
		if(typeof fCondiction != 'undefined'){
			if(!fCondiction()){
				return;
			}
		}
		debugger;
	}
	/**
	 * 处理异常
	 * @method throwExp
	 * @param {Object}oExp 异常对象
	 */
	function fThrowExp(oExp){
		var that=this;
		if(that.level<=that.DEBUG_LEVEL){
			throw oExp;
		}
	}
	
	return Debug;
	
})/**
 * 资源加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
handy.add("Loader",["Debug","Object","Function"],function($){
	
	var _RESOURCE_NOT_FOUND= 'Resource not found: ',
		_eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement,
		_UA = navigator.userAgent,
        _bIsWebKit = _UA.indexOf('AppleWebKit'),
    	_aContext=[],         //请求上下文堆栈
	    _oCache={};           //缓存
	
	var Loader= {
		traceLog                : true,                     //是否打印跟踪信息
		rootPath                : {
			'handy'        : 'http://localhost:8081/handy/src',
			'com.sport'    : 'http://localhost:8082/sportapp/www/js'
		},                       //根url，根据命名空间前缀匹配替换，如果没有匹配则是空字符串''；如果rootPath是字符串则直接使用
		timeout                 : 15000,
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
		urlMap                  : {},                       //id-url映射表    
		
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
    		return /\.(css|js)$/.test(sId)?(_oCache[sId]&&_oCache[sId].status=='loaded'):$.Object.namespace(sId);
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
    	var sUrl=Loader.urlMap[sId];
    	if(!sUrl){
    		var sRoot='';
    		var rootPath=Loader.rootPath;
    		if(typeof rootPath=='string'){
    			sRoot=rootPath;
    		}else{
	    		for(var prifix in rootPath){
	    			if(sId.indexOf(prifix)==0){
	    				sRoot=rootPath[prifix];
	    				sId=sId.replace(prifix,'');
	    			}
	    		}
    		}
    		//css文件
    		if(/.css$/.test(sId)){
    			sUrl=sId.indexOf('/')==0?sId:"/css/"+sId;
    		}else if(/.js$/.test(sId)){
    			//js文件
    			sUrl="/"+sId;
    		}else{
    			//命名空间
    			sUrl='/'+sId.replace(/\./g,"/")+".js";
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
	      $.Debug.error('Time is out:', eNode.src);
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
	    eNode.onload = eNode.onerror = eNode.onreadystatechange =function() {
	        if (/loaded|complete|undefined/.test(eNode.readyState)) {
	            // 保证只运行一次回调
	            eNode.onload = eNode.onerror = eNode.onreadystatechange = null;
	            //防止内存泄露
	            if (eNode.parentNode) {
	              try {
	                if (eNode.clearAttributes) {
	                  eNode.clearAttributes();
	                }
	                else {
	                  for (var p in eNode) delete eNode[p];
	                }
	              } catch (e) {
	              }
	              //移除标签
	              _eHead.removeChild(eNode);
	            }
	            eNode = undefined;
	            //IE10下新加载的script会在此之后执行，所以此处需延迟执行
				setTimeout(fCallback,0);
	          }
	      };
	   // 注意:在opera下，当文件是404时，不会发生任何事件，回调函数会在超时的时候执行
	}
	/**
	 * css资源onload函数
	 * @method _fStyleOnload
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
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
				var _fCallback=$.Function.bind(_fResponse,null,sId);
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
    	//每次回调都循环上下文列表
   		for(var i=_aContext.length-1;i>=0;i--){
	    	var oContext=_aContext[i];
	    	var aExists=_fChkExisted(oContext.deps);
	    	if(aExists){
	    		oContext.callback.apply(null,aExists);
	    		_aContext.splice(i,1);
	    	}
   		}
   		if(Loader.traceLog){
			$.Debug.info("Response: "+sId);
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
				}catch(e){
					//资源定义错误
					$.Debug.error(sId+":factory define error:"+e.message);
					return;
				}
			}else{
				resource=factory;
			}
			var oCache=_oCache[sId];
			oCache.deps=aDeps;
			oCache.factory=factory;
			oCache.resource=resource;
			$.Object.namespace(sId,resource);
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
					$.Debug.info(_RESOURCE_NOT_FOUND+sId);
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
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Template',function($){
	
	var Template={
		simpleReg       : /<%=this\.([^%>]+)%>/g,  //简单替换正则
		compile         : fCompile //执行模板
	};
	
	/**
	 * 执行模板
	 * @method compile
	 * @param  {string}sTemplate 模板字符串
	 * @param  {Object}oData     	数据
	 * @return {string}          返回结果字符串
	 */
	function fCompile(sTemplate,oData){
		var oReg=this.simpleReg;
		return sTemplate.replace(oReg,function(){
			return oData&&oData[arguments[1]]||'';
		});
	}
	
	return Template;
	
});/**
 * HashChange类，兼容IE6/7浏览器实现hashchange事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
handy.add("HashChange",function($H){

	/**
	 * IE8+ | FF3.6+ | Safari5+ | Chrome | Opera 10.6+ 支持hashchange
		FF3.6+ Chrome Opera支持 oldURL 和 newURL
	 * IE6直接用location.hash取hash，可能会取少一部分内容：
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
		_nDocMode = _oDoc._nDocMode,
	    _bSupportHashChange = ('onhashchange'   in window) && ( _nDocMode === void 0 || _nDocMode > 7 ),
		
	    HashChange={
			listen   : fListen,    //绑定处理函数
			getHash  : fGetHash,   //获取当前hash
			setHash  : fSetHash    //设置新的hash
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
				_oIframe = $('<iframe tabindex="-1" style="display:none" widht=0 height=0 title="empty" />').appendTo( _oDoc.body )[0];
                _sLastHash=HashChange.getHash();
                HashChange.setHash(_sLastHash);
                setInterval(function(){
                	var sHash=HashChange.getHash();
                	if(sHash!=_sLastHash){
                		_sLastHash=sHash;
	                	_fOnChange(sHash);
                	}
                },50);
			}else{
				$(window).on("hashchange",function(){
					_fOnChange(HashChange.getHash());
				})
			}
		}
		/**
		 * 执行监听函数
		 * @method _fExecListeners
		 */
		function _fOnChange(sHash){
			if(sHash!=_sLastHash){
				var oListeners=HashChange.listeners
				for(var func in oListeners){
					oListeners[func](sHash);
				}
				_sLastHash=sHash;
			}
		}
		/**
		 * 增加hashchange监听函数
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
		/**
		 * 获取当前hash
		 * @method getHash
		 * @return {string}返回当前hash
		 */
		function fGetHash(){
			return $H.Util.getHash();
		}/**
		 * 设置新的hash
		 * @method setHash
		 * @param {string} sHash要设置hash
		 * @param {boolean=} bFireChange是否要触发hashchange事件，仅当为true时触发
		 */
		function fSetHash(sHash,bFireChange){
			$H.Util.setHash(sHash);
			if(!_bSupportHashChange){
				var _oIframeWin = _oIframe.contentWindow;
                _oIframe.document.write('<!doctype html><html><body>'+sHash+'</body></html>');
			}
			if(bFireChange!=true){
				_sLastHash=sHash;
			}
		}
		
	return HashChange;
});/**
 * 支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Support',['Browser'],function($){
	
	var Support={
	}
	
	//解决IE6下css背景图不缓存bug
	if($.Browser.ie()==6){   
	    try{   
	        document.execCommand("BackgroundImageCache", false, true);   
	    }catch(e){}   
	}  
	
	return Support;
	
})/**
 * 适配类库
 */
(function($){
	
	//框架全局变量
	$H=$.noConflict();
	$HO=$H.Object;
	$HS=$H.String;
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
	
	
})(handy)//组件基类


(function(){
	
	var Component=$HO.createClass("handy.component.Component");
	
	//静态方法
	$HO.extend(Component,{
		
		_expando   : "_handy_", // 组件id前缀
		_template  : '<div id="<%=this.id%>"><%=this.html%></div>', // 组件html模板, 模板必须有一个最外层的容器
		
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		render:function(settings){
			return new this(settings);
		},
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		html:function(settings,parentComponent){
			settings.notListener=true;
			settings.notRender=true;
			var component=new this(settings);
			if(parentComponent){
				parentComponent.children.push(component);
			}
			return component.getHtml();
		}
	});
	
	//类方法
	$HO.extend(Component.prototype,{
		
		ctype:'component',
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			that.doConfig(settings);
			//组件html
			that.initHtml(settings);
			var cHtml=that.chtml;
			var template=cHtml.indexOf('<%=this.id%>')>-1?cHtml:Component._template;
			var html=that.html=$H.Template.compile(template,{
				id:that.id,
				html:that.chtml
			});
			if(settings.notRender!=true){
				that.renderTo.append(html);
				//缓存容器
				that.container=$("#"+that.id);
			}
			
			if(settings.notListener!=true){
				if(that.delayInitListener){
					setTimeout(function(){
						that.initListener();
					});
				}else{
					that.initListener();
				}
			}
		},
		
		doConfig:function(settingParams){
			var that=this;
			var settings=that.settings={};
			$HO.extend(settings,settingParams);
			if(settings.renderTo){
				that.renderTo=$(settings.renderTo);
			}else{
				that.renderTo=$(document.body);
			}
			that.children=[];
			//组件id
			that.id=Component._expando+that.constructor.ctype+"_"+$H.Util.getUuid();
		},
		
		getId:function(){
			
		},
		
		initHtml:function(){
		},
		
		getHtml:function(){
			return this.html;
		},
		
		initListener:function(){
			var that=this;
			//缓存容器
			that.container=that.container||$("#"+that.id);
			var children=that.children;
			for(var i=0,len=children.length;i<len;i++){
				if(children.settings.notListener){
					children.initListener();
				}
			}
		},
		
		find:function(selector){
			return this.container.find(selector);
		},
		
		hide:function(){
			this.container.hide();
		},
		
		destroy:function(){
			this.container.remove();
		}
		
	});
	
})();

//树形菜单


(function(){
	
	var TreeMenu=$HO.createClass("handy.component.TreeMenu");;
	
	
	$HO.inherit(TreeMenu,$HO.namespace("handy.component.Component"),{
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			TreeMenu.superClass.initialize.call(that,settings);
		},
		
		initHtml:function(settings){
			var that=this;
			that.chtml=that.createMenu(settings.data).join('');
		},
		
		createMenu:function(menus,html,marginLeft){
			var that=this;
			//是否是第一级菜单
			var isFirst=!!!html;
			var html=html||[];
			var marginLeft=marginLeft||0;
			//除第一级菜单外，其他默认隐藏
			html.push('<ul class="menu-tree"',isFirst?'':' style="display:none"','>');
			for(var i=0,len=menus.length;i<len;i++){
				var menu=menus[i];
				var hasChildren=!!menu.childMenus;
				html.push(
					'<li><a class="menu-tree-item">',
							//每级缩进
							'<span class="gi ',hasChildren?'gi-plus':'gi-minus','"',marginLeft?'style="margin-left:'+marginLeft+'px"':'','></span>',
							menu.menuName,
						'</a>'
				);
				if(hasChildren){
					that.createMenu(menu.childMenus,html,marginLeft+20);
				}
				html.push('</li>');
			}
			html.push('</ul>');
			return html;
		},
		
		initListener:function(){
			var that=this;
			TreeMenu.superClass.initListener.call(that);
			var container=that.container;
			//展开/收起子菜单事件
			container.delegate('.gi','click',function(event){
				var icon=$(this);
				var childMenu=icon.parent().next('ul');
				if(childMenu.length==0){
					return;
				}
				if(icon.attr("class").indexOf('gi-plus')>-1){
					icon.attr("class","gi gi-minus");
					childMenu.show();
				}else{
					icon.attr("class","gi gi-plus");
					childMenu.hide();
				}
			});
		}
	});
	
	$HO.extend(TreeMenu,{
		ctype:'treemenu'
	});
	
	
})();//手风琴菜单


(function(){
	
	var AccordionMenu=$HO.createClass("handy.component.AccordionMenu");;
	
	$HO.inherit(AccordionMenu,$HO.namespace("handy.component.Component"),{
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			AccordionMenu.superClass.initialize.call(that,settings);
			that.setSize();
		},
		
		doConfig:function(settings){
			var that=this;
			AccordionMenu.superClass.doConfig.call(that,settings);
		},
		
		initHtml:function(settings){
			var that=this;
			var data=settings.data;
			var html=[
			    '<ul class="menu-accordion" style="height:',that.settings.height,'px">'
			];
			for(var i=0,len=data.length;i<len;i++){
				var menu=data[i];
				var childHtml=menu.childMenus.length>0?$H.TreeMenu.html({data:menu.childMenus}):'';
				html.push(
					'<li>',
						'<a href="javascript:;" data-url="',menu.menuUrl,'" class="menu-accordion-item"><span class="gi ',menu.icon||'gi-Operation-maintenance','"></span>',menu.menuName,'</a>',
						'<div class="js-content" style="display:none;','">',
						childHtml,
						'</div>',
					'</li>');
			}
			html.push('</ul>');
			that.chtml=html.join('');
		},
		
		setSize:function(height){
			var that=this;
			var settings=that.settings;
			var h=that.height=height||settings.height||that.renderTo.height();
			var contentHeight=h-settings.data.length*43;
			that.container.find('.js-content').height(contentHeight);
		},
		
		open:function(param){
			var that=this;
			that.container.find(".menu-accordion-item[data-url='"+param.menuUrl+"']").click();
		},
		
		initListener:function(){
			var that=this;
			AccordionMenu.superClass.initListener.call(that);
			var container=that.container;
			var settings=that.settings;
			//展开/收起子菜单事件
			container.delegate('.menu-accordion-item','click',function(event){
				var menuItem=$(this);
				var itemClick=settings.itemClick;
				if(itemClick){
					itemClick(menuItem);
				}
				var childMenu=menuItem.next('.js-content');
				if(menuItem.attr("class").indexOf('js-open')>-1){
					return;
				}
				container.find('.js-open').removeClass("js-open accordion-item-active").next('.js-content').hide();
				menuItem.addClass('js-open accordion-item-active');
				if(childMenu.children().length>0){
					childMenu.show();
				}
			});
		}
	});
	
	$HO.extend(AccordionMenu,{
		ctype:'accordionMenu'
	});
	
	
})();//浮层提示框


(function(){
	
	var TipsBox=$HO.createClass("handy.component.TipsBox");;
	
	
	$HO.inherit(TipsBox,$HO.namespace("handy.component.Component"),{
		
		delayInitListener:true,
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
			var that=this;
			//下次调用时需要关闭之前的实例
			if(TipsBox.current){
				TipsBox.current.destroy();
			}
			TipsBox.current=that;
			TipsBox.superClass.initialize.call(that,settings);
			that.show();
		},
		
		doConfig:function(settings){
			var that=this;
			TipsBox.superClass.doConfig.call(that,settings);
		},
		
		initHtml:function(settings){
			var that=this;
			var html=[
			    '<div id="<%=this.id%>" class="c-tipsbox ',settings.extClass||'','" style="',settings.width?'width:'+settings.width+'px':'','">',
					'<div class="w-triangle-top">',
						'<div class="w-triangle-top w-triangle-inner"></div>',
					'</div>'];
			if(!settings.noTitle){
				html.push(
						'<div class="c-tipsbox-header">',
						settings.title,
						'</div>'
				);
			}
			html.push(
					'<div class="c-tipsbox-content">',
					settings.content,
					'</div>',
					'<div class="w-triangle-bottom" style="display:none">',
						'<div class="w-triangle-bottom w-triangle-inner"></div>',
					'</div>',
					'</div>'
			);
			that.chtml=html.join('');
		},
		
		show:function(){
			// 设置定位坐标
			var that=this;
			var trigger=that.settings.trigger;
			var triggerPos=trigger.position();
			var tipsbox=that.container;
			var doc=document;
			
			var width=tipsbox.width();
			var height=tipsbox.height();
			var bodyWidth=doc.documentElement.offsetWidth || doc.body.offsetWidth;
			var bodyHeight=doc.documentElement.clientHeight || doc.body.clientHeight+ document.body.scrollTop;
			var triggerWidth=trigger.width();
			var triggerHeight=trigger.height();
			
			/*console.log(triggerPos)
			console.log(triggerWidth)
			console.log(triggerHeight)
			console.log(bodyHeight)
			console.log(bodyWidth)
			console.log(width)
			console.log(height)*/
			
			var x = triggerPos.left+ triggerWidth/2;
			var y = triggerPos.top;
			
			//默认右下角显示
			var passivePos="rightBottom";
			var passiveTop=y+triggerHeight+height>bodyHeight;
			if(x+width>bodyWidth){
				if(passiveTop){
					passivePos="leftTop";
				}else{
					passivePos="leftBottom";
				}
			}else if(passiveTop){
				passivePos="rightTop";
			}
			
			var posType=that.settings.position||passivePos;
			if(posType=="leftBottom"){
				//10是三角形尖到提示框上边界的距离
				y=y+triggerHeight+10;
				x=x-width;
				tipsbox.find('.w-triangle-top').css({
					right:'10px'
				});
			}else if(posType=="rightBottom"){
				y=y+triggerHeight+10;
				//20是三角形尖到提示框左边界的距离
				x-=20;
			}else if(posType=="leftTop"){
				y=y-height;
				x=x-width;
				tipsbox.find('.w-triangle-top').hide();
				tipsbox.find('.w-triangle-bottom').css({
					right:'10px'
				}).show();
			}else if(posType=="rightTop"){
				//12是三角形的高度
				y=y-height-12;
				//20是三角形尖到提示框左边界的距离
				x-=20;
				tipsbox.find('.w-triangle-top').hide();
				tipsbox.find('.w-triangle-bottom').show();
			}
			
			tipsbox.css({
				left:x + "px",
				top:y-(that.settings.offsetTop||0) + "px"
			});
		},
		
		position:function(){
			
		},
		
		hide:function(){
			var that=this;
			that.container.hide();
		},
		
		initListener:function(){
			var that=this;
			TipsBox.superClass.initListener.call(that);
			var notClose=false;
			that.container.click(function(event){
				notClose=true;
			});
			$(document).click(function(event){
				if(!notClose){
					that.hide();
				}
				notClose=false;
			});
		}
	});
	
	$HO.extend(TipsBox,{
		ctype:'TipsBox'
	});
	
	
})();/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

$Define("handy.module.AbstractModule","handy.base.Object",function (Object) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = Object.createClass();
	
	Object.extend(AbstractModule.prototype, {
		isLoaded       : false,          //模块是否已载入
		isActived      : false,          //模块是否是当前活跃的
		//container    : null,           //模块的容器对象
		useCache       : true,           //是否使用cache
		//name         : null,           //模块名
		//chName       : null,           //模块的中文名称
		//getData      : null,           //获取该模块的初始化数据
		//clone        : null,           //克隆接口
		//getHtml      : null,           //获取该模块的html
		cache          : function(){},   //显示模块缓存
		init           : function(){},   //初始化函数, 在模块创建后调用（在所有模块动作之前）
		beforeRender   : function(){},   //模块渲染前调用
		render         : function(){},   //模块渲染
		afterRender    : function(){},   //模块渲染后调用
		reset          : function(){},   //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},   //离开该模块前调用, 返回true允许离开, 否则不允许离开
		initialize     : fInitialize     //模块类创建时初始化
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
	
	return AbstractModule;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/

$Define("handy.module.AbstractNavigator","handy.base.Object",function (Object) {
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
$Define("handy.module.History",
['handy.base.Object','handy.base.HashChange'],
function(Object,HashChange){

	var History=Object.createClass();
	
	var _nIndex=0;
	
	Object.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		saveState          : fSaveState,       //保存当前状态
		getCurrentState    : fGetCurrentState, //获取当前状态
		stateChange        : fStateChange      //历史状态改变
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {?string} sKey历史记录类的key，用于区分可能的多个history实例
	 */
	function fInitialize(sKey){
		var that=this;
		that.key=sKey||'handy';
		that.states=[];
		HashChange.listen(that.stateChange.bind(that));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var that=this;
		var oState=that.getCurrentState();
		if(oState){
			oState.onStateChange(oState.param);
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
		var that=this;
		var sHistoryKey=that.key+(++_nIndex);
		that.states.push(sHistoryKey);
		that.states[sHistoryKey]=oState;
		var oHashParam={
			hKey    : sHistoryKey,
			param : oState.param
		};
		HashChange.setHash("#"+JSON.stringify(oHashParam));
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var that=this;
		try{
			var oHashParam=JSON.parse(HashChange.getHash().replace("#",""));
			return that.states[oHashParam.hKey];
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
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
$Define("handy.module.ModuleManager",
["handy.base.Function","handy.module.History"],
function(Function,History){
	
	var ModuleManager=$HO.createClass();
	
	$HO.extend(ModuleManager.prototype,{
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//modules          : null,   //缓存模块
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo,              //进入模块
		createMod          : fCreateMod,       //新建模块
		getModWrapper      : fGetModWrapper,   //获取模块包装div
		showMod            : fShowMod,         //显示模块
		hideAll            : fHideAll          //隐藏所有模块
	});
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage  : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator   : 定制导航类
	 * }
	 */
	function fInitialize(oConf){
		var that=this;
		if(oConf){
			that.conf=oConf;
			$HO.extend(that,oConf);
			that.container=oConf.container?$(oConf.container):$(document.body);
		}
		that.defModPackage=that.defModPackage+".";
		that.history=new History();
		that.modules={};
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param
	 */
	function fGo(oParams){
		var that=this;
		var sModName=oParams.modName;
		var sCurrentMod=that.currentMod;
		var oMods=that.modules;
		var oCurrentMod=oMods[sCurrentMod];
		//如果正好是当前模块，调用模块reset方法
		if(sCurrentMod==sModName){
			oCurrentMod.reset();
			return;
		}
		//当前模块不允许退出，直接返回
		if(oCurrentMod&&!oCurrentMod.exit()){
			return false;
		}
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod&&oMod.useCache){
			that.showMod(oMod);
			oMod.cache(oParams);
		}else{
			//否则新建一个模块
			that.createMod(oParams);
		}
		//保存状态
		that.history.saveState({
			onStateChange:Function.bind(that.go,that),
			param:oParams
		});
	}
	/**
	 * 新建模块
	 * @method createMod
	 * @param 
	 */
	function fCreateMod(oParams){
		var that=this;
		var sModName=oParams.modName;
		//请求模块
		$Require(that.defModPackage+sModName,function(Module){
			var oMod=new Module();
			oMod.initParam=oParams;
			//模块初始化
			oMod.init(oParams);
			oMod.beforeRender();
			//模块渲染
			var oModWrapper=that.getModWrapper(sModName);
			oMod.wrapper=oModWrapper;
			var oContainer=oMod.container=oMod.container?$(oMod.container):that.container;
			if(oMod.getHtml){
				oModWrapper.html(oMod.getHtml());
				oContainer.append(oModWrapper);
			}
			oMod.render(oModWrapper);
			that.showMod(oMod);
			oMod.afterRender();
			that.modules[sModName]=oMod;
		});
	}
	/**
	 * 获取模块包装div
	 * @method getModWrapper
	 * @param {string}sModName
	 */
	function fGetModWrapper(sModName){
		var that=this;
		var sId="modWrapper_"+sModName;
		var oDiv=$("#"+sId);
		if(oDiv.length==0){
			oDiv=$('<div id="'+sId+'"></div>');
		}
		return oDiv;
	}
	/**
	 * 显示模块
	 * @method showMod
	 * @param
	 */
	function fShowMod(oMod){
		var that=this;
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(that.navigator&&that.navigator.navigate(oMod,that)){
			return false;
		}else{
			this.hideAll();
			oMod.wrapper.show();
		}
		oMod.isActive=true;
	}
	/**
	 * 隐藏所有模块
	 * @method hideAll
	 * @param
	 */
	function fHideAll(){
		var oModules=this.modules
		for(var module in oModules){
			oModules[module].wrapper.hide();
			oModules[module].isActive=false;
		}
	}
	
	return ModuleManager;
	
});
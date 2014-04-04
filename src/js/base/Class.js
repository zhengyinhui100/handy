/**
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
        	var me,fInitialize;
        	//获得initialize引用的对象，如果不是通过new调用(比如:Class())，就没有this.initialize
        	if(this.constructor==Class){
        		me = this;
        	}else{
        		me = arguments.callee;
        	}
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
            	return fInitialize.apply(me, arguments);
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
        		if(Object.isFunction(fMethod)){
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
	
});
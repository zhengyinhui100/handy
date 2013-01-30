/**
 * 函数类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Function',['Object'],function($){
	
	var Function={
		bind                : fBind,              //函数bind方法
		intercept           : fIntercept          //创建函数拦截器
	}
	
	var _nUuid=0;
	
	/**
	 * 函数bind方法
	 * @method  bind
	 * @param {function}fFunc 被绑定的函数
	 * @param {object}oScope  需要绑定的对象
	 * @param {object}args    需要绑定的参数
	 * @return  {function}    返回新构造的函数
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
	 * @param {function}fExecFunc 被拦截的函数，this指向oExecScope||window
	 * @param {function}fInterceptFunc 拦截函数,仅当当拦截函数返回false时，不执行被拦截函数；拦截函数this指向oInterceptScope||oExecScope||window
	 * @param {object}oExecScope  被拦截的函数绑定的对象
	 * @param {object}oInterceptScope  拦截函数绑定的对象
	 * @return  {function}    返回新构造的函数
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
	
})
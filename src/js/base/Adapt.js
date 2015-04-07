/**
 * 适配类库
 */
define('B.Adapt',['B.Function','B.Event'],function(Function,Event){
	
	//框架全局变量
	
	

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
	$$.fn.remove=Function.intercept($$.fn.remove,function(){
		var oEl=this.target;
		Event.trigger('removeEl',oEl);
	});
	
	return 1;
	
});

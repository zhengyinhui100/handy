/**
 * 适配类库
 */
(function($){
	
	//框架全局变量
	$H=$.noConflict();
	H=$H;
	Hui=$H;
	$D=$H.Debug;
	$HD=$H.Date;
	$Define=$H.Loader.define;
	$Require=$H.Loader.require;
	

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
	$$.fn.remove=$H.intercept($$.fn.remove,function(){
		var oEl=this.target;
		$H.trigger('removeEl',oEl);
	});
	
	
})(handy)
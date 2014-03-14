/**
 * 适配类库
 */
(function($){
	
	//框架全局变量
	$H=$.noConflict();
	H=$H;
	Hui=$H;
	$D=$H.Debug;
	$HB=$H.Browser;
	$HC=$H.Cookie;
	$HD=$H.Date;
	$HF=$H.Function;
	$HO=$H.Object;
	$HS=$H.String;
	$HU=$H.Util;
	$HE=$H.Events;
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
	$$.fn.remove=$HF.intercept($$.fn.remove,function(){
		var oEl=this.target;
		$HE.trigger('removeEl',oEl);
	});
	
	
})(handy)
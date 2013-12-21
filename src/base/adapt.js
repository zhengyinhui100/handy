/**
 * 适配类库
 */
(function($){
	
	//框架全局变量
	$H=$.noConflict();
	$D=$H.Debug;
	$HB=$H.Browser;
	$HC=$H.Cookie;
	$HD=$H.Date;
	$HF=$H.Function;
	$HO=$H.Object;
	$HS=$H.String;
	$HU=$H.Util;
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
	
	
})(handy)
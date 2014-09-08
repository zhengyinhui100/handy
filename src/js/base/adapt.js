/**
 * 适配类库
 */
$Define('B.Adapt','B.Function',function(){
	
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
	$$.fn.remove=$H.intercept($$.fn.remove,function(){
		var oEl=this.target;
		$H.trigger('removeEl',oEl);
	});
	
	return 1;
	
});
/**
 * 单体模式，使用方法:Demo.publicMethod();
 */
Demo=(function(){
	
	var privateAttr;
	
	function privateMethod(){
	}
	
	return {
		publicAttr:'',
		publicMethod:function(){}
	}
	
})()
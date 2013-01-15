/**
 * 惰性加载单体，使用时才初始化，使用方法:Demo.getInstance().publicMethod();
 */
Demo=(function(){
	
	var uniqueInstance;
	
	function constructor(){
		
		var privateAttr;
		
		function privateMethod(){
		}
		
		return {
			publicAttr:'',
			publicMethod:function(){}
		}
	}
	
	return {
		getInstance:function(){
			if(!uniqueInstance){
				uniqueInstance=constructor();
			}
			return uniqueInstance;
		}
	}
})()
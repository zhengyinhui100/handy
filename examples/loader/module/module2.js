//模块测试

$.Loader.define('module.module2',['module.module1'],function(aModules){
	
	return {
		name:"module2",
		
		init:function(){
			aModules[0].action('module2');
		}
	}
});
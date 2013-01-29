//模块测试

$.Loader.define('module.module2',['module.module1'],function(){
	
	
	
	return {
		name:"module2",
		init:function(){
			alert();
		}
	}
});
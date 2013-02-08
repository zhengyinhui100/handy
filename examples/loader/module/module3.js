//模块测试

$.Loader.define('module.module3',function(){
	return {
		name:"module3",
		
		action:function(){
			$.Loader.require("module.module1").action('module3');
		}
	}
});
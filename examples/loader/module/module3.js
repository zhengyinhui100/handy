//模块测试

define('module.Module3',function(){
	return {
		name:"Module3",
		
		action:function(){
			require("module.Module1").action('module3');
		}
	}
});
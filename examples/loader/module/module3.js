//模块测试

$Define('module.Module3',function(){
	return {
		name:"Module3",
		
		action:function(){
			$Require("module.Module1").action('module3');
		}
	}
});
//模块测试

$Define('module.Module2',function(){
	
	var module1=$Require ( 'module.Module1');
	var module3=$Require('module.Module3');
	
	return {
		name:"Module2",
		
		init:function(){
			module1.action('module2');
			module3.action();
		}
	}
});
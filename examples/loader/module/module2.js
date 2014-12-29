//模块测试

define('module.Module2',function(){
	
	var module1=require ( 'module.Module1');
	var module3=require('module.Module3');
	
	return {
		name:"Module2",
		
		init:function(){
			module1.action('module2');
			module3.action();
		}
	}
});
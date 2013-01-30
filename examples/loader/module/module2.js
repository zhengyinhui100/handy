//模块测试

$.Loader.define('module.module2',['module.module1'],function(){
	
	var module1=$.Loader.require('module.module1');
	
	return {
		name:"module2",
		
		init:function(){
			alert(this.name+"call:"+module1.name);
		}
	}
});
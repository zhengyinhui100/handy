//模块测试

$.Loader.define('module.module1',function(){
	return {
		name:"module1",
		action:function(){
			alert(this.name);
		}
	}
});
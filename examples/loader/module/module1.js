//模块测试

define('module.Module1',function(){
	return {
		name:"Module1",
		action:function(caller){
			alert((caller?caller+" call:":'')+this.name);
		}
	}
});
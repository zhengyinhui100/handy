/**
 * 分支，需要在缩短计算时间（因为使用分支技术时，判断该使用哪个对象的代码只会执行一次）和内存消耗（分支技术因为有多份实现，会占用更多内存）之间权衡
 */
Branching=(function(){
	
	var objectA={
		method:function(){
			//实现1
		}
	}
	
	var objectB={
		method:function(){
			//实现2
		}
	}
	
	return condition?objectA:objectB;
	
})()
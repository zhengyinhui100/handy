/**
 * 
 */
var Interface=function(name,methods){
 	var that=this;
 	that.name=name;
 	that.methods=[];
 	for(var i=0,len=methods.length;i<len;i++){
 		if(typeof methods[i]!=='string'){
 			throw new Error("方法名只能是字符串")
 		}
 		that.methods.push(methods[i]);
 	}
}
 
Interface.ensureImplements=function(object,intf0,intf1){
	for(var i=1,len=arguments.length;i<len;i++){
		var intf=arguments[i];
		if(intf.constructor!==Interface){
			throw new Error("参数对象必须是Interface类的实例")
		}
		for(var j=0,methodLen=intf.methods.length;j<methodLen;j++){
			var method=intf.methods[j];
			if(!object[method]||typeof object[method]!=='function'){
				throw new Error("对象未实现"+intf.name+"的"+method+"接口")
			}
		}
	}
	
}
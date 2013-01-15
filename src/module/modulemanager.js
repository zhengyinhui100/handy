

(function(){
	
	var ModuleManager=$HO.createClass("hui.module.ModuleManager");
	
	$HO.extend(ModuleManager,{
		
		go:function(params){
			var that=this;
			var moduleName=params.moduleName;
			var moduleUrl=params.moduleUrl;
			var url=params.moduleUrl||that.getModUrl(moduleName);
			$("#contentIframe").attr("src",url);
			var hash=location.hash;
			if(moduleName){
				if(hash.indexOf("module=")>0){
					hash=hash.replace(/module=[^&]+/, "module="+moduleName);
				}else{
					hash+="#module="+moduleName;
				}
			}
			if(moduleUrl){
				if(hash.indexOf("moduleUrl=")>0){
					hash=hash.replace(/moduleUrl=[^&]+/, "moduleUrl="+moduleUrl);
				}else{
					hash+="#moduleUrl="+moduleUrl;
				}
			}
			location.hash=hash;
		},
		
		getModUrl:function(moduleName){
			return $G.config.moduleUrl[moduleName];
		}

	});
	
	
})();
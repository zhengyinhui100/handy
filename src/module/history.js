/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
$Define("handy.module.History",function(){

	/**
	 * IE6直接用location.hash取hash，可能会取少一部分内容：
		比如 http://www.xxx.com#stream/xxxxx?lang=zh_c
		ie6 => location.hash = #stream/xxxxx
		其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
		firefox 会对hash进行decodeURIComponent
		比如 http://www.xxx.com/#!/home/q={%22thedate%22:%2220121010~20121010%22}
		firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
		其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
	 */
	var oDoc = document,  
		//这个属性的值如果是5，则表示混杂模式（即IE5模式）；如果是7，则表示IE7仿真模式；如果是8，则表示IE8标准模式
		documentMode = oDoc.documentMode,
	    bSupportHashChange = ('onhashchange'   in window) && ( documentMode === void 0 || documentMode > 7 ),
	    
		History=$HO.createClass();
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize      //历史记录类初始化
		saveState          : fSaveState,
		getState           : fGetState,
		
	});
	/**
	 * 历史记录类初始化
	 */
	function fInitialize(){
		
	}
	
	return History;
	
})
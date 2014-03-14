/**
 * LocalStorage类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('LocalStorage',['b.Browser','b.Events','b.Json'],function(Browser,Events,Json,$H){
	
	var LS={
		init            : fInit,
		getItem         : fGetItem,            //获取值
		setItem         : fSetItem,            //设置值
		removeItem      : fRemoveItem          //删除值
	}
	
	//在IE下，本地文件是不能访问localStorage的，此时localStorage字段为空，
	//另外，页面里有id为localStorage的元素，某些浏览器可以通过window.localStorage索引到这个元素，所以还要加上判断
	var _supportLocalStorage= window.localStorage && window.localStorage.getItem;
	//ie7-下保存数据的对象
	var _oUserData;
	var _file=document.domain;
	
	/**
	 * 初始化
	 * @method init
	 */
	 function fInit() {
		if (!_supportLocalStorage&&Browser.ie()) {
			var sId='LocalStorageUserDataDiv';
			_oUserData = document.getElementById(sId);
			if (!_oUserData) {
				_oUserData = document.createElement('DIV');
				_oUserData.style.display = 'none';
				_oUserData.id = sId;
				_oUserData.addBehavior('#default#userData');
				document.body.appendChild(_oUserData);
			}
		}
	}
	/**
	 * 获取值
	 * @method getItem
	 * @param {string}sKey 键
	 * @return {*} 返回对应值
	 */
	 function fGetItem(sKey){
	 	if(_supportLocalStorage){
	 		return localStorage[sKey];
	 	}else{
	 		_oUserData.load(_file);
			return _oUserData.getAttribute(sKey);
	 	}
	 }
	 /**
	 * 设置值
	 * @method setItem
	 * @param {string}sKey 键
	 * @param {*}value 值
	 * @return {boolean} true表示存储成功
	 */
	 function fSetItem(sKey,value){
		//ie6、7可以提供最多1024kb的空间，LocalStorage一般可以存储5~10M
	 	try{
		 	if(_supportLocalStorage){
		 		if(typeof value=="object"){
		 			value=Json.stringify(value);
		 		}
		 		localStorage(sKey,value);
		 	}else{
				_oUserData.setAttribute(sKey,value);
				_oUserData.save(_file);
		 	}
 		}catch(e){
 			$D.error('localstorage error',e);
 			return false;
 		}
 		return true;
	 }
	 /**
	 * 删除值
	 * @method removeItem
	 * @param {string}sKey 键
	 */
	 function fRemoveItem(sKey){
	 	if(_supportLocalStorage){
	 		localStorage.removeItem(sKey);
	 	}else{
	 		LS.setItem(sKey,"");
	 	}
	 }
	
	 LS.init();
	 
	 return LS;
})
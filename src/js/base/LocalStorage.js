/**
 * LocalStorage类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define('B.LocalStorage',['B.Browser','B.Events','B.Json'],function(Browser,Events,Json){
	
	var LocalStorage={
		_init           : _fInit,              //初始化
		getItem         : fGetItem,            //获取值
		setItem         : fSetItem,            //设置值
		removeItem      : fRemoveItem,         //删除值
		clear           : fClear               //清除所有数据
	}
	
	//在IE下，本地文件是不能访问localStorage的，此时localStorage字段为空，
	//另外，页面里有id为localStorage的元素，某些浏览器可以通过window.localStorage索引到这个元素，所以还要加上判断
	var _supportLocalStorage= window.localStorage && window.localStorage.getItem;
	var localStorage=window.localStorage;
	//ie7-下保存数据的对象
	var _oUserData;
	var _file=document.domain;
	var _typeSplit='$$:';
	
	/**
	 * 初始化
	 */
	 function _fInit() {
		if (!_supportLocalStorage&&Browser.ie()) {
			var sId='LocalStorageUserDataDiv';
			_oUserData = document.getElementById(sId);
			if (!_oUserData) {
				_oUserData = document.createElement('DIV');
				_oUserData.style.display = 'none';
				_oUserData.id = sId;
				_oUserData.addBehavior('#default#userData');
				document.body.appendChild(_oUserData);
		 		_oUserData.load(_file);
			}
		}
	}
	/**
	 * 获取值
	 * @param {string}sKey 键
	 * @return {*} 返回对应值
	 */
	 function fGetItem(sKey){
	 	var value;
	 	if(_supportLocalStorage){
	 		value=localStorage.getItem(sKey);
	 	}else{
			value=_oUserData.getAttribute(sKey);
	 	}
	 	value=Json.parseJson(value);
	 	return value;
	 }
	 /**
	 * 设置值
	 * @param {string}sKey 键
	 * @param {*}value 值
	 * @return {boolean} true表示存储成功
	 */
	 function fSetItem(sKey,value){
		//ie6、7可以提供最多1024kb的空间，LocalStorage一般可以存储5~10M
	 	value=Json.stringify(value);
	 	try{
		 	if(_supportLocalStorage){
		 		localStorage.setItem(sKey,value);
		 	}else{
				_oUserData.setAttribute(sKey,value);
				_oUserData.save(_file);
		 	}
 		}catch(e){
 			$D.error(e);
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
	 		_oUserData.removeAttribute(sKey);
			_oUserData.save(_file);
	 	}
	 }
	 /**
	  * 清除所有数据
	  */
	 function fClear(){
	 	if(_supportLocalStorage){
	 		localStorage.clear();
	 	}else{
	 		_oUserData.unload();
	 	}
	 }
	
	 LocalStorage._init();
	 
	 return LocalStorage;
});
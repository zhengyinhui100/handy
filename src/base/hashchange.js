/**
 * HashChange类，兼容IE6/7浏览器实现hashchange事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
handy.add("HashChange",function($H){

	/**
	 * IE8+ | FF3.6+ | Safari5+ | Chrome | Opera 10.6+ 支持hashchange
		FF3.6+ Chrome Opera支持 oldURL 和 newURL
	 * IE6直接用location.hash取hash，可能会取少一部分内容：
		比如 http://www.xxx.com#stream/xxxxx?lang=zh_c
		ie6 => location.hash = #stream/xxxxx
		其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
		firefox 会对hash进行decodeURIComponent
		比如 http://www.xxx.com/#!/home/q={%22thedate%22:%2220121010~20121010%22}
		firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
		其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
	 */
	var _bIsInited,_nListener=0,_oDoc = document, _oIframe,_sLastHash,
		//这个属性的值如果是5，则表示混杂模式（即IE5模式）；如果是7，则表示IE7仿真模式；如果是8，则表示IE8标准模式
		_nDocMode = _oDoc._nDocMode,
	    _bSupportHashChange = ('onhashchange'   in window) && ( _nDocMode === void 0 || _nDocMode > 7 ),
		
	    HashChange={
			listen   : fListen,    //绑定处理函数
			getHash  : fGetHash,   //获取当前hash
			setHash  : fSetHash    //设置新的hash
		};
		/**
		 * HashChange初始化
		 * @method _fInit
		 */
		function _fInit(){
			_bIsInited=true;
			HashChange.listeners={};
			//不支持原生hashchange事件的，使用定时器+隐藏iframe形式实现
			if(!_bSupportHashChange){
				//创建一个隐藏的iframe，使用这博文提供的技术 http://www.paciellogroup.com/blog/?p=604.
				_oIframe = $('<iframe tabindex="-1" style="display:none" widht=0 height=0 title="empty" />').appendTo( _oDoc.body )[0];
                _sLastHash=HashChange.getHash();
                HashChange.setHash(_sLastHash);
                setInterval(function(){
                	var sHash=HashChange.getHash();
                	if(sHash!=_sLastHash){
                		_sLastHash=sHash;
	                	_fExecListeners(sHash);
                	}
                },50);
			}else{
				$(window).on("hashchange",function(){
					_fExecListeners(HashChange.getHash());
				})
			}
		}
		/**
		 * 执行监听函数
		 * @method _fExecListeners
		 */
		function _fExecListeners(sHash){
			var oListeners=HashChange.listeners
			for(var func in oListeners){
				oListeners[func](sHash);
			}
		}
		/**
		 * 增加hashchange监听函数
		 * @method listen(fListener[,sName])
		 * @param {function} fListener监听函数
		 * @param {string=}  sName监听函数的名称，删除该监听时用到
		 * @return {?string}
		 */
		function fListen(fListener,sName){
			if(!_bIsInited){
				_fInit();
			}
			if(sName in HashChange.listeners){
				throw new Error("Duplicate name");
			}else{
				sName=sName||$H.expando+(++_nListener);
				HashChange.listeners[sName]=fListener;
				return sName;
			}
		}
		/**
		 * 删除hashchange监听函数
		 * @method unListen([sName])
		 * @param {string=} sName监听函数的名称，不传此参数表示删除所有监听函数
		 */
		function fUnListen(sName){
			for(name in HashChange.listeners){
				if(!sName||sName==name){
					delete HashChange.listeners[name];
				}
			}
		}
		/**
		 * 获取当前hash
		 * @method getHash
		 * @return {string}返回当前hash
		 */
		function fGetHash(){
			return location.hash;
		}/**
		 * 设置新的hash
		 * @method setHash
		 * @param {string} sHash要设置hash
		 */
		function fSetHash(sHash){
			location.hash=sHash;
			if(!_bSupportHashChange){
				var _oIframeWin = _oIframe.contentWindow;
                _oIframe.document.write('<!doctype html><html><body>'+sHash+'</body></html>');
			}
		}
		
	return HashChange;
});
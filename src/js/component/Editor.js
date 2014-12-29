/**
 * 编辑器类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-09-11
 */
define('C.Editor',
'C.AbstractComponent',
function(AC){
	
	var Editor=AC.define('Editor');
	
	Editor.extend({
		//初始配置
		xConfig         : {
			cls         : 'editor',
			name        : '',
			value       : ''                 //默认值
		},
		listeners       : [{
			name:'afterRender',
			custom:true,
			handler:function(){
				this.makeEditable();
			}
		}],
		
		color           : '#333',
		fontSize        : '1em',
		fontFamily      : 'tahoma,arial,sans-serif',
		value           : '',
		
		tmpl            : [
			'<div>',
				'<iframe class="hui-editor-iframe" hideFocus=true frameborder=0></iframe>',
				'{{textarea class="#hui-editor-textarea" name="name" placeholder="placeholder" value=value}}',
			'</div>'].join(''),
		
		getInitHtml     : fGetInitHtml,       //获取初始化编辑框的html字符串
		makeEditable    : fMakeEditable,      //使iframe可编辑
		val             : fVal,               //设置/读取内容
		sync            : fSync               //同步textarea
	});
	
	/**
	 * 获取初始化编辑框的html字符串
	 * @param {object}oParams {
	 * 				fontsize:默认文字大小,
	 *              forecolor:默认文字颜色,
	 *              fontname:默认字体,
	 *              content:html内容
	 *           }
	 * @return {string}返回初始化编辑框的html字符串
	 */
	function fGetInitHtml() {
		var me=this;
		// 初始化时添加空div是为了解决ie默认的换行问题：默认情况下的换行是<p>，而把内容放在div里，默认换行是div
		return '<head><style>\
				html{word-wrap:break-word;}\
				body{color:'
				+ me["color"]
				+ ';font-size:'
				+ me["fontSize"]
				+ ';font-family:'
				+ me["fontFamily"]
				+ ';line-height:1.7;padding:0.5em 0.625em;margin:0;\
				background-color:#ffffff;}\
				img{max-width:100%;}\
				pre{\
					white-space: pre-wrap; /* css-3 */\
					white-space: -moz-pre-wrap; /* Mozilla, since 1999 */\
					white-space: -pre-wrap; /* Opera 4-6 */\
					white-space: -o-pre-wrap; /* Opera 7 */\
					word-wrap: break-word; /* Internet Explorer 5.5+ */\
					/* white-space : normal ;Internet Explorer 5.5+ */\
					font-family:arial;\
				}\
				span.typoRed{border-bottom:0.125em dotted #ff0000;cursor:pointer;}\
				</style></head><body>'+(me["value"]||'')+'</body>';
	}
	/**
	 * 使iframe可编辑
	 */
	function fMakeEditable() {
		var me=this;
		var oIframe=me.findEl('iframe')[0];
		var oWin = me.ifrWin=oIframe.contentWindow||oIframe.window;
		var oDoc = me.ifrDoc=oWin.document;
		var sHtml=me.getInitHtml();
		oDoc.open("text/html", "replace");
		oDoc.writeln(sHtml);
		oDoc.close();
		// that.win.document.charset = "gb2312";
		// 打开编辑模式
		if ($H.ie()) {
			if (Browser.ie() == "5.0") {
				oDoc.designMode = 'on';
			} else {
				oDoc.body.contentEditable = true;
				//TODO ie7聚焦问题
			}
		} else {
			oDoc.designMode = 'on';
			oDoc.execCommand("useCSS", false, true);
		}
		me.ifrBody=oDoc.body;
	}
	/**
	 * 获取/设置值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		var oBody=me.ifrBody;
		if(sValue===undefined){
			return oBody.innerHTML;
		}else{
			oBody.innerHTML=sValue;
		}
	}
	/**
	 * 同步textarea
	 */
	function fSync(){
		var me=this;
		var sValue=me.val();
		me.findEl('textarea').val(sValue);
	}
	
	return Editor;
	
});
/**
 * 模型视图类，实现视图与数据的同步
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-11
 */
//"handy.common.ModelView"
$Define('CM.ModelView',
['CM.AbstractEvents',
'CM.Model',
'B.Template'],
function(AbstractEvents,Model,Template){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	Template.registerHelper('set',function(oOptions,sValue,nIndex){
		var me=oOptions.data;
		var fEscape=oOptions.helper.escape;
		return '<script id="metamorph-'+nIndex+'-start" type="text/x-placeholder"></script>'+fEscape(sValue)+'<script id="metamorph-'+nIndex+'-end" type="text/x-placeholder"></script>';
	});
	
	var ModelView=AbstractEvents.derive({
		initialize     : fInitialize,         //初始化
		update         : fUpdate              //更新
	});
	/**
	 * 初始化
	 */
	function fInitialize(oSettings){
		var me=this;
		var oConfig=me._config=new Model();
		me.html=Template.tmpl(oSettings.tmpl,oSettings.data);
	}
	
	function fUpdate(){
	}
	
	return ModelView;
});
/**
 * 提示类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-15
 */

$Define('C.Tips',
['C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Tips=AC.define('Tips',Popup);
	
	Tips.extend({
		//初始配置
//		text            : '',
		cls             : 'tips',
		theme           : 'black',
		timeout         : 1000,
		radius          : 'normal',
		
		tmpl            : [
			'<div class="<%if(!this.text){%> hui-tips-notxt<%}%>">',
				'<%=this.findHtml(">*")%>',
				'<%if(this.text){%><span class="hui-tips-txt"><%=this.text%></span><%}%>',
			'</div>'
		],
		doConfig        : fDoConfig     //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 设置项
	 */
	function fDoConfig(oSettings){
		var me=this;
		//顶部提示默认配置
		if(oSettings.showPos=='top'){
			$H.extend(me,{
				isMini:true
			},{noCover:true});
			if(oSettings.icon=='loading-mini'){
				$H.extend(me,{
					shadowOverlay:null,
					theme:null
				},{noCover:true});
			}
		}
		me.callSuper();
	}
	
	return Tips;
	
});
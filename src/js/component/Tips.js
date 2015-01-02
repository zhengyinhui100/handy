/**
 * 提示类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-15
 */

define('C.Tips',
[
'B.Object',
'B.Util',
'C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(Obj,Util,AC,Popup,ControlGroup){
	
	var Tips=AC.define('Tips',Popup);
	
	Tips.extend({
		//初始配置
		xConfig         : {
			cls             : 'tips',
			text            : '',
			radius          : 'normal',
			hasArrow        : false,               //是否有箭头
			theme           : 'black'
		},
//		type            : 'miniLoading',            类型，‘loading’表示居中加载中提示，‘topTips’表示顶部简单提示，‘miniLoading’表示顶部无背景loading小提示
		timeout         : 2000,
		
		tmpl            : [
			'<div {{bindAttr class="text:hui-tips-notxt c-clear"}}>',
				'{{placeItem}}',
				'{{#if text}}<span class="hui-tips-txt">{{text}}</span>{{/if}}',
				'{{#if hasArrow}}',
					'<div class="hui-triangle"><div class="hui-triangle hui-triangle-inner"></div></div>',
				'{{/if}}',
			'</div>'
		].join(''),
		doConfig        : fDoConfig     //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 设置项
	 */
	function fDoConfig(oSettings){
		var me=this;
		//普通居中loading提示
		if(oSettings.type=='loading'){
			Obj.extend(me,{
				text:'正在加载中...',
				timeout:null,
				noMask:true,
				icon:'loading'
			});
		}else if(oSettings.type=='miniLoading'){
			//顶部小loading
			Obj.extend(me,{
				showPos:{
					left:'50%',
					marginLeft:'-1em',
					top:Util.em2px(0.625)
				},
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				theme:'tbar-black',
				noMask:true,
				tType:'mini',
				items:{
					xtype:'Icon',
					name:'loading-mini',
					theme:null
				}
			});
		}else if(oSettings.type=='topTips'){
			//顶部提示默认配置
			Obj.extend(me,{
				showPos:'top',
				noMask:true,
				tType:'mini'
			});
		}else if(oSettings.type==='inlineLoading'){
			//顶部提示默认配置
			Obj.extend(me,{
				noMask:true,
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				size:'mini',
				tType:'inline',
				width:'auto',
				style:{
					zIndex:0
				},
				theme:null,
				showPos:{
					left:Util.em2px(0.625),
					top:Util.em2px(0.625)
				},
				items:{
					xtype:'Icon',
					name:'loading-mini',
					theme:null
				}
			});
		}
		me.callSuper();
	}
	
	return Tips;
	
});
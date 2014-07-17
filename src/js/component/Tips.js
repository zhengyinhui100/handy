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
		xConfig         : {
			cls             : 'tips',
			text            : '',
			radius          : 'normal',
			theme           : 'black'
		},
//		type            : 'miniLoading',            类型，‘loading’表示居中加载中提示，‘topTips’表示顶部简单提示，‘miniLoading’表示顶部无背景loading小提示
		timeout         : 2000,
		
		tmpl            : [
			'<div {{bindAttr class="text:hui-tips-notxt c-clear"}}>',
				'{{placeItem}}',
				'{{#if text}}<span class="hui-tips-txt">{{text}}</span>{{/if}}',
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
			$H.extend(me,{
				text:'正在加载中...',
				timeout:null,
				noMask:true,
				icon:'loading'
			});
		}else if(oSettings.type=='miniLoading'){
			//顶部小loading
			$H.extend(me,{
				showPos:'top',
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				theme:null,
				noMask:true,
				tType:'mini',
				items:{
					xtype:'Icon',
					name:'loading-mini',
					hasBg:false
				}
			});
		}else if(oSettings.type=='topTips'){
			//顶部提示默认配置
			$H.extend(me,{
				showPos:'top',
				noMask:true,
				tType:'mini'
			});
		}else if(oSettings.type==='inlineLoading'){
			//顶部提示默认配置
			$H.extend(me,{
				noMask:true,
				clickHide:false,
				destroyWhenHide:false,
				timeout:null,
				delayShow:false,
				shadowOverlay:null,
				isMini:true,
				tType:'inline',
				width:'auto',
				style:{
					zIndex:0
				},
				theme:null,
				showPos:{
					left:10,
					top:10
				},
				items:{
					xtype:'Icon',
					name:'loading-mini',
					hasBg:false
				}
			});
		}
		me.callSuper();
	}
	
	return Tips;
	
});
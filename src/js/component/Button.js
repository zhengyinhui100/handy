/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

define('C.Button',
[
'B.Object',
'C.AbstractComponent'
],
function(Obj,AC){
	
	var Button=AC.define('Button');
	
	Button.extend({
		//初始配置
		xConfig             : {
			cls             : 'btn',
			text            : '',                  //按钮文字
			extTxt          : '',                  //附加文字
			theme           : 'gray',              //主题
//			tType           : 'adapt',             //自适应按钮，一般用于工具栏
			markType        : '',                  //标记类型，默认无标记，'black'黑色圆点标记，'red'红色圆点标记
			iconPos         : '',                  //图标位置，"left"|"right"|"top"|"bottom"，空字符表示无图标
			activeCls       : 'hui-btn-active',    //激活样式
			isBack          : false,               //是否是后退按钮
			radius          : 'little',            //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
			gradient        : false,               //渐变效果
			isInline        : true,                //宽度自适应
			noTxtCls        : {
				deps : ['text','tType'],
				parseDeps : function(sTxt,tType){
					if(!(tType=='adapt'||sTxt||sTxt===0)){
						return 'hui-btn-icon-notxt';
					}
				}
			},
			iconPosCls      : {
				deps : ['iconPos'],
				parseDeps :function(sPos){
					return sPos?'hui-btn-icon-'+sPos:'';
				}
			},
			markCls      : {
				deps : ['markType'],
				parseDeps :function(markType){
					return markType?'hui-btn-mark-'+markType:'';
				}
			}
		},
//		icon            : null,                //图标名称
		
		defItem         : {
			xtype       : 'Icon',
			theme       : 'gray',
			isAlt       : true
		},
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" {{bindAttr class="noTxtCls isBack?hui-btn-back gradient?hui-gradient markCls iconPosCls"}}>',
								'<span class="hui-btn-txt">{{text}}</span>',
								'<span class="hui-btn-ext">{{extTxt}}</span>',
								'{{placeItem}}',
								'<span class="hui-btn-mark"></span>',
							'</a>'].join(''),
		doConfig        : fDoConfig           //初始化配置
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		if(oSettings.theme==='black'||oSettings.theme==='dark'){
			me.defItem=Obj.clone(me.defItem);
			Obj.extend(me.defItem,{
				isAlt:false,
				theme:null
			})
		}
		if(oSettings.tType==='adapt'){
			oSettings=Obj.clone(oSettings);
			Obj.extend(oSettings,{
				isInline:true,
				radius:null,
				shadow:null,
				shadowSurround:null
			});
			if(typeof oSettings.icon==='string'){
				oSettings.icon={
					name:oSettings.icon,
					theme:null
				}
			}
		}
		me.callSuper([oSettings]);
	}
	
	return Button;
	
});
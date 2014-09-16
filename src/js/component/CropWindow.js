/**
 * 截图窗口类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.CropWindow',
[
'C.AbstractComponent',
'C.Popup',
'C.Crop'
],
function(AC,Popup,Crop){
	
	var CropWindow=AC.define('CropWindow',Popup);
	
	CropWindow.extend({
		//初始配置
		xConfig         : {
			cls         : 'cropwin'
		},
		
		title           : '裁切图片',         //标题
//		cropOptions    : {},                //Crop组件初始化参数
//		success         : $H.noop,           //裁剪成功回调函数
		
		showPos         : null,
		noMask          : true,
		clickHide       : false,
		
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var oCrop={
			xtype:'Crop'
		};
		$H.extend(oCrop,me.cropOptions);
		me.add([{
			xtype:'Toolbar',
			title:me.title,
			isHeader:true,
			items:[{
				xtype:'Button',
				xrole:'left',
				theme:'dark',
				tType:'adapt',
				icon:'carat-l',
				click:function(){
					me.hide();
				}
			},{
				xtype:'Button',
				xrole:'right',
				theme:'dark',
				tType:'adapt',
				icon:'check',
				click:function(){
					var oResult=me.find('Crop')[0].getResult();
					me.success&&me.success(oResult);
				}
			}]
		},oCrop]);
	}
	
	return CropWindow;
	
});
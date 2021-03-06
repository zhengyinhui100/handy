/**
 * 图片上传类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-07-11
 */

define('C.ImgUpload',
[
'L.Browser',
'B.Object',
'B.Util',
'C.AbstractComponent',
'U.ImgCompress',
'P.Device',
'P.Camera'
],
function(Browser,Obj,Util,AC,ImgCompress,Device,Camera){
	
	var ImgUpload=AC.define('ImgUpload');
	
	ImgUpload.extend({
		//初始配置
		xConfig             : {
			cls             : 'img-upload',
			inputName       : 'fileContent',
			transparent     : false,      //是否透明
			useFileInput    : true,       //是否使用file input获取文件
			showImg         : true        //是否显示预览
		},
		
		crop                : true,      //是否需要剪切
//		cropWinW            : 100,       //裁剪窗口宽度
//		cropWinH            : 100,       //裁剪窗口高度
//		cropOptions         : {},        //裁剪选项，参照Crop类
//		compressOptions     : {}         //压缩选项，参照ImgCompress.compress方法
		
		tmpl            : [
			'<div {{bindAttr class="transparent?hui-transparent"}}>',
				'{{#unless transparent}}',
					'<div>',
						'<img {{bindAttr class="#js-orig showImg?:hui-hide"}}/>',
					'</div>',
					'<div>',
						'<img src="" class="js-preview">',
					'</div>',
				'{{/unless}}',
				'<input type="hidden" class="js-file-content" {{bindAttr name="inputName"}}>',
				'{{#if useFileInput}}',
					'<input type="file" class="js-file-input hui-file-input" accept="image/*">',
				'{{/if}}',
			'</div>'].join(''),
		
		listeners       : [{
			el   : 'input',
			name : 'change',
			handler : function(e) {
				var oInput=e.target;
				var file,name,imgSrc,oFiles;
				if(oFiles=oInput.files){
					if(oFiles.length==0){
						return;
					}
					file= oFiles[0];
					oInput.value='';
					name=file.name;
					var oURL = window.URL || window.webkitURL;
					imgSrc = oURL.createObjectURL(file);
				}else{
					oInput.select(); 
					//ie9在file控件下获取焦点情况下 document.selection.createRange() 将会拒绝访问
					oInput.blur();
    				imgSrc = document.selection.createRange().text;  
					if(!imgSrc){
						return;
					}
					name=imgSrc;
				}
				if(!/.+\.(jpg|gif|png|jpeg|bmp)$/i.test(name)){
					$C.Tips({text:"您选择的文件不是图片",theme:'error'});
					return;
				}
				this.processImg(imgSrc,file);
			}
		},{
			name:'click',
			el:'.js-file-input',
			handler:function(oEvt){
				if(Browser.ie()<10){
					//ie本地图片预览，http://www.cnblogs.com/yansi/archive/2013/04/14/3021199.html
					//网页端裁剪图片(FileAPI)，兼容谷歌火狐IE6/7/8，http://www.oschina.net/code/snippet_988397_33758
					//Flash头像上传新浪微博破解加强版，https://github.com/zhushunqing/FaustCplus
					oEvt.preventDefault();
					new $C.Dialog({
						contentMsg:'上传功能暂时不支持IE9及以下版本，请使用其它浏览器，推荐chrome浏览器。',
						noCancel:true,
						width:'15.625em',
						okTxt:'我知道了'
					});
				}
			}
		}],
		
		doConfig         : fDoConfig,           //初始化配置
		showSelDialog    : fShowSelDialog,      //显示选择照片源类型对话框
		processImg       : fProcessImg,         //处理图片
		cleanContent     : fCleanContent        //清除文件内容
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 选项
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var oCmprOptions=oSettings.compressOptions;
		var fSuccess=oCmprOptions&&oCmprOptions.success;
		me.compressOptions=Obj.extend({},me.compressOptions);
		me.compressOptions.success=function(oData){
			me.findEl('.js-file-content').val(oData.clearBase64);
			fSuccess&&fSuccess(oData);
		}
		if(oSettings.useFileInput===undefined){
			me.set('useFileInput',!Device.isPhonegap());
		}
		if(!me.get('useFileInput')){
			me.listen({
				name:'click',
				handler:function(){
					me.showSelDialog();
				}
			})
		}
	}
	/**
	 * 显示选择照片源类型对话框
	 */
	function fShowSelDialog(){
		var me=this;
		var oDialog=new $C.Dialog({
			contentMsg:'上传照片',
			width:Util.em2px(15.625),
			noAction:true,
			clickHide:true,
			items:{
				xtype:'Panel',
				xrole:'dialog-content',
				items:[{
					xtype:'Button',
					theme:'green',
					text:'拍照',
					isInline:false,
					click:function(){
						Camera.getPicture({
							sourceType:'CAMERA',
							success:function (imageData) {
						   		me.processImg(imageData);
							}
						});
					}
				},{
					xtype:'Button',
					text:'相册',
					theme:'green',
					isInline:false,
					click:function(){
						Camera.getPicture({
							sourceType:'PHOTOLIBRARY',
							success:function (imageData) {
						    	me.processImg(imageData);
							}
						});
					}
				}]
			}
		})
	}
	
	/**
	 * 处理图片
	 * @param {object|string}imgSrc 图片源
	 * @param {object=}oFile 图片文件对象，移动端压缩需要使用
	 */
	function fProcessImg(imgSrc,oFile){
		var me=this;
		if(me.crop){
			var oCropOptions=me.cropOptions||{};
			oCropOptions.imgSrc=imgSrc;
			require('C.CropWindow',function(CropWindow){
				var oWin=new CropWindow({
					cropOptions:oCropOptions,
					width:me.cropWinW,
					height:me.cropWinH,
					success:function(oResult){
						oWin.hide();
						var oOptions=Obj.extend(oResult,me.compressOptions);
						ImgCompress.compress(oFile||imgSrc,oOptions);
					}
				});
			});
		}else{
			ImgCompress.compress(oFile||imgSrc,me.compressOptions);
		}
	}
	/**
	 * 清除文件内容
	 */
	function fCleanContent(){
		this.findEl('.js-file-content').val('');
	}
	
	return ImgUpload;
	
});
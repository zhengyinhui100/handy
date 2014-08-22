/**
 * 图片上传类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-07-11
 */

$Define('C.ImgUpload',
[
'C.AbstractComponent',
'U.ImgCompress'
],
function(AC,ImgCompress){
	
	var ImgUpload=AC.define('ImgUpload');
	
	ImgUpload.extend({
		//初始配置
		xConfig             : {
			cls             : 'img-upload',
			transparent     : false,      //是否透明
			useFileInput    : true,       //是否使用file input获取文件
			showImg         : true        //是否显示预览
		},
		
		crop                : true,      //是否需要剪切
//		cropWinW            : 100,       //裁剪窗口宽度
//		cropWinH            : 100,       //裁剪窗口高度
//		compressOptions     : {}         //压缩选项，参照ImgCompress.compress方法
		
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
					name=file.name
					var oURL = URL || webkitURL;
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
				if(!/.+\.(jpg|gif|png|jpeg|bmp)$/.test(name)){
					$C.Tips({text:"您选择的文件不是图片",theme:'error'});
					return;
				}
				this.processImg(imgSrc);
			}
		},{
			name:'click',
			el:'.js-file-input',
			handler:function(oEvt){
				if($H.ie()<10){
					//ie本地图片预览，http://www.cnblogs.com/yansi/archive/2013/04/14/3021199.html
					//网页端裁剪图片(FileAPI)，兼容谷歌火狐IE6/7/8，http://www.oschina.net/code/snippet_988397_33758
					//Flash头像上传新浪微博破解加强版，https://github.com/zhushunqing/FaustCplus
					oEvt.preventDefault();
					$C.Tips('上传功能暂时不支持IE9及以下版本，请使用其它浏览器，推荐chrome浏览器。')
				}
			}
		}],
		
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
				'<input type="hidden" class="js-file-content" name="fileContent">',
				'{{#if useFileInput}}',
					'<input type="file" class="js-file-input hui-file-input">',
				'{{/if}}',
			'</div>'].join(''),
		
		doConfig         : fDoConfig,           //初始化配置
		showSelDialog    : fShowSelDialog,      //显示选择照片源类型对话框
		getPicture       : fGetPicture,         //获取照片
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
		me.compressOptions=$H.extend({},me.compressOptions);
		me.compressOptions.success=function(oData){
			me.findEl('.js-file-content').val(oData.clearBase64);
			fSuccess&&fSuccess(oData);
		}
		if(oSettings.useFileInput===undefined){
			me.set('useFileInput',!window.cordova);
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
			width:$H.em2px(15.625),
			noAction:true,
			clickHide:true,
			items:{
				xtype:'Panel',
				xrole:'dialog-content',
				items:[{
					xtype:'Button',
					text:'拍照',
					isInline:false,
					click:function(){
						me.getPicture(Camera.PictureSourceType.CAMERA);
					}
				},{
					xtype:'Button',
					text:'相册',
					isInline:false,
					click:function(){
						me.getPicture(Camera.PictureSourceType.PHOTOLIBRARY);
					}
				}]
			}
		})
	}
	/**
	 * 获取照片
	 * @param {number}nSourceType 照片源类型
	 */
	function fGetPicture(nSourceType){
		var me=this;
		//phonegap
		navigator.camera.getPicture(
			function (imageData) {
			    me.processImg(imageData);
			},
			function onFail(message) {
				//用户取消不提示
				if(message!='no image selected'&&message.indexOf('cancel')<0){
				    $C.Tips({text:'获取照片失败: ' + message,theme:'error'});
				}
			}, 
			{ 
				quality: 50,
				mediaType:Camera.MediaType.PICTURE,
			    destinationType:Camera.DestinationType.FILE_URI,
			    sourceType:nSourceType
			}
		);
	}
	/**
	 * 处理图片
	 * @param {object|string}imgSrc 图片源
	 */
	function fProcessImg(imgSrc){
		var me=this;
		if(me.crop){
			$Require('C.CropWindow',function(CropWindow){
				var oWin=new CropWindow({
					imgSrc:imgSrc,
					width:me.cropWinW,
					height:me.cropWinH,
					success:function(oResult){
						oWin.hide();
						var oOptions=$H.extend(oResult,me.compressOptions);
						ImgCompress.compress(imgSrc,oOptions);
					}
				});
			});
		}else{
			ImgCompress.compress(imgSrc,me.compressOptions);
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
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
		
//		compressOptions     : {}         //压缩选项，参照ImgCompress.compress方法
		
		listeners       : [{
			el   : 'input',
			name : 'change',
			handler : function(e) {
				var oFile = e.target.files[0];
				ImgCompress.compress(oFile,this.compressOptions);
			}
		},{
			
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
					'<input type="file" class="hui-file-input">',
				'{{/if}}',
			'</div>'].join(''),
		
		doConfig         : fDoConfig,           //初始化配置
		showSelDialog    : fShowSelDialog,      //显示选择照片源类型对话框
		getPicture       : fGetPicture,         //获取照片
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
		me.compressOptions=$H.clone(me.compressOptions);
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
			width:250,
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
			    ImgCompress.compress(imageData,me.compressOptions);
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
	 * 清除文件内容
	 */
	function fCleanContent(){
		this.findEl('.js-file-content').val('');
	}
	
	return ImgUpload;
	
});
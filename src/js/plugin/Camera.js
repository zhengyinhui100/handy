/**
 * 相机插件模块，提供本地相关的基本功能
 * 
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("P.Camera", 
function() {

	var Cam = {
		getPicture     : fGetPicture     //获取照片
	}
	/**
	 * 获取照片
	 * @param {object}选项 {
	 * 		{string}sourceType:照片源，'CAMERA'表示照相机,'PHOTOLIBRARY'表示本地图库
	 * 		{function({string}picUri)}success:成功回调函数
	 * 		{function({string}errCode)}error:失败回调函数
	 * 		{number}quality:照片品质，默认是50
	 * }
	 */
	function fGetPicture(oOptions){
		var me=this;
		var fSuccess=oOptions.success;
		var fError=oOptions.error;
		var sSourceType=oOptions.sourceType;
		var nSourceType=Camera.PictureSourceType[sSourceType];
		//phonegap
		navigator.camera.getPicture(
			function (imageData) {
			    fSuccess&&fSuccess(imageData);
			},
			function onFail(message) {
				//用户取消不提示
				if(fError&&fError(message)!==false){
					if(message!='no image selected'&&message.indexOf('cancel')<0){
					    $C.Tips({text:'获取照片失败: ' + message,theme:'error'});
					}
				}
			}, 
			{ 
				quality: oOptions.quality||50,
				mediaType:Camera.MediaType.PICTURE,
			    destinationType:Camera.DestinationType.FILE_URI,
			    sourceType:nSourceType
			}
		);
	}

	return Cam;

});
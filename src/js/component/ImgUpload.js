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
			showImg         : true       //是否显示预览
		},
		
//		compressOptions     : {}         //压缩选项，参照ImgCompress.compress方法
		
		listeners       : [{
			el   : 'input',
			name : 'change',
			handler : function(e) {
				var oFile = e.target.files[0];
				ImgCompress.compress(oFile,this.compressOptions);
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
				'<input type="file" class="hui-file-input">',
			'</div>'].join('')
	});
	
	return ImgUpload;
	
});
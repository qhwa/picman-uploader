package 
{
	import cn.alibaba.product.uploader.core.File;
	import cn.alibaba.product.uploader.AliUploader;

	public class PicmanUploader extends AliUploader
	{
		private var _fileCountLimit:uint = 0;
		private var _state:String;

		public function PicmanUploader()
		{
		}

		public function initApp():void
		{
			initApplication();
		}
		
		public function canSelectFile():Boolean {
			return isUIEnabled() && _fileCountLimit > 0;
		}

		public function rotate( id:String ):void
		{
			
		}
	
		public function getRotation( id:String ):Number
		{
			return 90;
		}
		
		public function previewBeforeUpload():void
		{
			state = 'preview';
		}
		
		public function get fileCountLimit():uint {
			return _fileCountLimit;
		}
		
		public function set fileCountLimit(value:uint):void {
			_fileCountLimit = value;
			setFileCountLimit( value );
		}

		public function get state():String {
			return _state;
		}
		
		public function set state(value:String):void {
			_state = value;
		}

	}


}

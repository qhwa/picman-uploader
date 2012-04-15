package 
{
	import cn.alibaba.product.uploader.core.File;
	import cn.alibaba.common.image.BitmapMinifier;
	import cn.alibaba.common.image.events.*;
	import cn.alibaba.util.BitmapDataUtil;
	import flash.events.*;
	import flash.utils.*;
	import flash.display.BitmapData;

	public class ThumbManager extends EventDispatcher
	{
		static private var _instance:ThumbManager;
		static private var _cache:Dictionary = new Dictionary(true);

		static public function get instance():ThumbManager
		{
			if(!_instance) {
				_instance = new ThumbManager(new Singletone);
			}
			return _instance;
		}
		
		public function ThumbManager(enf:Singletone)
		{
		}

		public function loadThumb( id:String ):void
		{
			if(_cache[id]){
				dispatchEvent( new ThumbEvent( ThumbEvent.LOADED, id ));
			} else {
				var file:File = File.id2file(id);
				file.addEventListener( File.LOADED, onFileDataLoaded );
				file.load();
			}
		}

		public function getThumb(id:String):BitmapData
		{
			return _cache[id];
		}

		private function onFileDataLoaded(evt:Event):void
		{
			evt.target.removeEventListener( evt.type, arguments.callee );

			var file:File = evt.target as File;
			var minifier:BitmapMinifier = new BitmapMinifier();
			minifier.addEventListener( MinifyEvent.DECODED, onDecoded );
			minifier.addEventListener( MinifyEvent.DECODE_ERROR, onDecoded );
			minifier.file = file.id;
			minifier.decode( file.data );
		}

		private function onDecoded(evt:MinifyEvent):void
		{
			var minifier:BitmapMinifier = evt.target as BitmapMinifier;
			var bmpd:BitmapData = minifier.inputBitmapData.clone();
			minifier.dispose();
			minifier.removeEventListener( MinifyEvent.DECODED, onDecoded );
			minifier.removeEventListener( MinifyEvent.DECODE_ERROR, onDecoded );

			if(bmpd){
				const WIDTH:int = 80;
				const HEIGHT:int = 80;
				_cache[evt.file] = BitmapDataUtil.verySmoothShrink( bmpd , WIDTH, HEIGHT );
				bmpd.dispose();
				dispatchEvent(new ThumbEvent( ThumbEvent.LOADED, evt.file ));
			}
		}
		
	}


}

class Singletone
{
}

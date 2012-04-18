package
{
	import flash.display.BitmapData;
	import spark.primitives.Rect;
    import mx.core.UIComponent;
    import mx.styles.CSSStyleDeclaration;
    import mx.styles.StyleManager;
    import mx.core.FlexGlobals;

	[Style(name="lineColor",type="color",format="color", inherit="no")]
	[Style(name="lineAlpha",type="Numer",format="Number", inherit="no")]

	public class Dotline extends UIComponent
	{
		public function Dotline()
		{
			super();
		}
		
        private static var classConstructed:Boolean = classConstruct();
        private static function classConstruct():Boolean 
		{
            if (!FlexGlobals.topLevelApplication.styleManager.getStyleDeclaration("Dotline"))
            {
                var styles:CSSStyleDeclaration = new CSSStyleDeclaration();
                styles.defaultFactory = function():void {
                    this.lineColor = 0;
                    this.lineAlpha = 1;
                };
                FlexGlobals.topLevelApplication.styleManager.setStyleDeclaration("Dotline", styles, true);

            }
            return true;
        }
    
        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void 
		{
            super.updateDisplayList(unscaledWidth, unscaledHeight);

			var lineColor:uint   = getStyle("lineColor");
			var lineAlpha:Number = (getStyle("lineAlpha") || 1 ) * 0xFF;
			var color:uint       = (lineAlpha << 24 ) | lineColor;
			var bmpd:BitmapData  = new BitmapData(4,1,true,0);
			bmpd.setPixel32(3,0,color);
			
			graphics.clear();
			graphics.beginBitmapFill(bmpd);
			graphics.drawRect(0, 0, unscaledWidth, unscaledHeight);
        }
	}


}

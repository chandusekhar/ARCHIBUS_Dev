package common
{
	import flash.external.ExternalInterface;
	
	import mx.formatters.DateFormatter;
	import mx.formatters.Formatter;

	public class FullDateStringFormatter extends Formatter
	{
		
		public function FullDateStringFormatter()
		{
			super();
		}
		
		override public function format(value:Object):String {
			var _dateFormatter:DateFormatter = new DateFormatter();
			_dateFormatter.formatString = "YYYY/MM/DD";
			var isoDate:String = _dateFormatter.format(value);
			var result:String = ExternalInterface.call("getFullDateString", isoDate);		
			return result;
		}
		
	}
}
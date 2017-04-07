/***********************************************************************
 * AbNumberFormatter
 * Fomat a numeric value based on specifed decimal and group separators.
 */
package chart
{
	import mx.formatters.NumberFormatter;
	public class AbNumberFormatter
	{
		private var formatter:NumberFormatter;
		public function AbNumberFormatter(decimalSeparator:String, thousandsSeparator:String, decimals:int)
		{
			formatter = new NumberFormatter();
			formatter.decimalSeparatorFrom = ".";
			//XXX: ChartDataHandler.java NOT format the values with group separators
			formatter.thousandsSeparatorFrom = "";
			
			formatter.decimalSeparatorTo = decimalSeparator;
			formatter.thousandsSeparatorTo = thousandsSeparator;
			formatter.precision = decimals;
		}
		
		public function fomat(value:Object):String{
			return formatter.format(value);
		}

	}
}
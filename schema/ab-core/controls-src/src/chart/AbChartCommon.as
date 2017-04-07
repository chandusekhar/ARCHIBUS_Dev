import mx.charts.events.ChartEvent;
import mx.charts.events.ChartItemEvent;
import flash.external.ExternalInterface;

public function getChartType(panelId:String):String {
	var strType:String;

	try{
		if (ExternalInterface.available) {
			var wrapperFunction:String = "getChartType_JS";
			strType = ExternalInterface.call(wrapperFunction, panelId);
		}	
	} catch(error:Error){
		// ??? display the error
	}
	return strType; 
}

/**
 * get the chart's configObj in JSON string
 */
public function getChartConfigObj(panelId:String):String {
	var strConfigObj:String = "{}";
	try{
		if (ExternalInterface.available) {
			var wrapperFunction:String = "getChartConfigObj_JS";
			strConfigObj = ExternalInterface.call(wrapperFunction, panelId);
		}	
	} catch(error:Error){
		// ??? display the error
	}

	return strConfigObj;
}

/**
 * get the chart's data in JSON string
 */
public function getChartData(panelId:String):String {
	var strChartData:String = "{}";

	try{
		if (ExternalInterface.available) {
			var wrapperFunction:String = "getChartData_JS";
			strChartData = ExternalInterface.call(wrapperFunction, panelId);
		} 
	} catch(error:Error){
		// ??? display the error
	}

	return strChartData;
}

public function getDecimalSeparator():String{
	try{
		if (ExternalInterface.available) {
			var wrapperFunction:String = "getDecimalSeparator_JS";
			return ExternalInterface.call(wrapperFunction);
		} 
	} catch(error:Error){
		// ??? display the error
	}

	return ".";

}

public function getGroupingSeparator():String{
	try{
		if (ExternalInterface.available) {
			var wrapperFunction:String = "getGroupingSeparator_JS";
			return ExternalInterface.call(wrapperFunction);
		} 
	} catch(error:Error){
		// ??? display the error
	}

	return ",";

}



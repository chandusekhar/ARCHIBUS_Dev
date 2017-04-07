/*
*	This object is the base of three tab controller.  Each tab controller will extend this js component.
* 	  @author Zhang Yi
*/
var abSpAllocTrendMetricTabCommCtrl = View.createController('abSpAllocTrendMetricTabCommCtrl', {
	
	//filter console	 panel 
	console: null,

	//default chart view name that initial loaded in tab
	defaultChartViewName: "",
	
	//group by option, in chart's DataSource stands for secondaryGroupingAxis
	groupByOption: "",
	
	//Y-axis option, in chart stands for groupingAxix
	yAxisOption:"",
	
	//X-axis option, in chart stands for dataAxis
	xAxisOption:"",

	// combined group options(group by - x axix - y axis ),
	combinedGroupKeys:"",

	afterInitialDataFetch:function(){
		//call real inheriter's initial method
		this.initial();

		//close original tab since it's not used, and create a new tab for default loaded chart view
		this.chartTabs.consoleRestrictionStr=" 1=1 ";
		this.chartTabs.createTab(this.defaultChartViewName);
		this.chartTabs.closeTab("initial");

		this.getCombinedGroupKey();
	},

	/*
	* Event handler for action 'Show' of console: create and cache new chart tab or find and refresh existed chart tab. 
	*/
	onShow: function(){
		//get String format restriction from console
		this.chartTabs.consoleRestrictionStr = getRestrictionStrFromConsole(this.console, this.fieldsArraysForRestriction);
		//get Object format restriction from console
 		this.chartTabs.consoleRestrictionObj =	this.console.getFieldRestriction();

		this.getCombinedGroupKey();
		var chartViewName =  this.getChartViewName();
		
		//create a new Tab. 
		this.chartTabs.createTab(chartViewName);

		//call inheriter's function to store values selected in console
		if(this.prepareSqlParameterValueFromConsole){
			this.prepareSqlParameterValueFromConsole();
		}
	},

	/*
	* Private function: get combined key from group option selections; set according properties. 
	*/
	getCombinedGroupKey: function(){
		this.groupByOption =  this.console.getFieldValue("group_by");
		this.yAxisOption =  this.console.getFieldValue("y_axis");
		this.xAxisOption =  this.console.getFieldValue("x_axis");
		this.combinedGroupKeys = this.groupByOption +'-'+this.xAxisOption +'-'+this.yAxisOption ;
	}
})

function getRestrictionStrFromConsole(console, fieldsArraysForRestriction){
    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {
        var field = fieldsArraysForRestriction[i];
        var consoleFieldValue = console.getFieldValue(field[0]);
        if (consoleFieldValue) {
            if (!isMultiSelect(consoleFieldValue)) {
                if (field[1] && field[1] == 'like') {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + " like '%" + consoleFieldValue + "%' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + " like '%" + consoleFieldValue + "%' ";
                    }
                }
                else {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + "='" + consoleFieldValue + "' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + "='" + consoleFieldValue + "' ";
                    }
                }
            }else{
				otherRes = otherRes + " AND " + getMultiSelectFieldRestriction(field, consoleFieldValue);
			}
        }
    }
    return otherRes;
}

function isMultiSelect(consoleFieldValue){
    return (consoleFieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "";
    if (field[2]) {
        restriction =  field[2] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    else {
        restriction =  field[0] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    
    return resultedString;
}


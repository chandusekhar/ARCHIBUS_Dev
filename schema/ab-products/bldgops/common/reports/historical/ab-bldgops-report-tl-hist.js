/**
 * Controller of the Tool Usage History Report
 * @author Guo Jiangtao
 */
var abBldgopsReportTlHistController = View.createController('abBldgopsReportTlHistController', {

    //Restriction of console panel  type String
    consoleRes: "",
    
    //Restriction of date range in consoel panel  type String
    dateRangRes: "",
    
    //normal console fields which can be used for get restriction by common method getRestrictionStrFromConsole
    normalConsoleField: new Array(['hwr.site_id'], ['hwr.bl_id'], ['hwr.fl_id'], ['hwr.dv_id'], ['hwr.dp_id']),
    
    
    //group field definition Map according the option of the console panel
    //'1'--group by Tool Id and Problem Type. '2'--group by Tool Id and Cause Type. '3'--group by Tool Id and Repair Type.  '4'--group by Tool Id  
    groupFieldMap: {
        '1': "RTRIM(hwrtl.tool_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.prob_type)",
        '2': "RTRIM(hwrtl.tool_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.cause_type)",
        '3': "RTRIM(hwrtl.tool_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.repair_type)",
        '4': "hwrtl.tool_id"
    },
    
    /**
     * on_click event handler for 'Show' action
     */
    abBldgopsReportTlHistConsole_onShow: function(){
        //get the group option in the console
        var secondGrouping = $('secondGrouping').value;
        
        //set the groupfield parameter of crosstable datasource according the group option and groupFieldMap
        View.selectedGroupField = this.groupFieldMap[secondGrouping];
        this.abBldgopsReportTlHistCrossTable.addParameter('groupfield', View.selectedGroupField);
        this.abBldgopsReportTlHistGrid.addParameter('groupfield', View.selectedGroupField);
        
        this.getConsoleRestriction();
        //refresh the report
        this.abBldgopsReportTlHistCrossTable.refresh(this.consoleRes);
    },
    
    abBldgopsReportTlHistConsole_onClear: function(){
		this.abBldgopsReportTlHistConsole.clear();
		setDefaultValueForHtmlField(['work_type', 'secondGrouping'], ['', '1']);
    },
    
    /**
     * get console restriction
     */
    getConsoleRestriction: function(){
    
        //get the date range restriction 
        this.dateRangRes = getRestrictionStrOfDateRange(this.abBldgopsReportTlHistConsole, 'hwr.date_completed');
        
        //get the console restriction and store it to this.consoleRes
        this.consoleRes = getRestrictionStrFromConsole(this.abBldgopsReportTlHistConsole, this.normalConsoleField) + this.dateRangRes;
        
        var probType = $('work_type').value;
        this.consoleRes = appendWorkTypeRestriction(this.consoleRes, probType, 'hwr');
        
        var toolType = this.abBldgopsReportTlHistConsole.getFieldValue('tl.tool_type');
        if (toolType) {
            this.consoleRes += " AND EXISTS(SELECT 1 FROM tl WHERE hwrtl.tool_id = tl.tool_id AND " + getMultiSelectFieldRestriction(['tl.tool_type'], toolType) + ")";
        }
    },
    
    /**
     * create restriction for pop up grid
     */
    createPopUpRestriction: function(clickObject){
        var restriction = '1=1'
        if (clickObject.restriction.clauses) {
            for (var i = 0; i < clickObject.restriction.clauses.length; i++) {
				var clause = clickObject.restriction.clauses[i];
                if (clause.name.indexOf('x_month') != -1) {
                    restriction += " AND ${sql.yearMonthOf('hwr.date_completed')}";
                }
                if (clause.name.indexOf('groupfield') != -1) {
                    restriction += " AND " + View.selectedGroupField;
                }
				
				if(clause.op == 'IS NULL'){
					restriction += " IS NULL ";
				}else{
					restriction += " = '" + clause.value + "'";
				}
            }
        }
        
        return restriction;
    }
});

/**
 * Show details panel as pop-up
 * @param ob {Object} click object.
 */
function showDetails(ob){
    var grid = View.panels.get('abBldgopsReportTlHistGrid');
    grid.addParameter('consoleRes', " AND " + abBldgopsReportTlHistController.consoleRes);
    var restriciton = abBldgopsReportTlHistController.createPopUpRestriction(ob);
    grid.refresh(restriciton);
    grid.showInWindow({
        width: 1000,
        height: 500
    });
}

/**
 * Show line chart view
 */
function showLineChart(){
    View.openDialog('ab-bldgops-report-tl-hist-line-chart.axvw', abBldgopsReportTlHistController.consoleRes);
}

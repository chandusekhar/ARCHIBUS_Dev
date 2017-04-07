/**
 * Controller of the Trade and Craftsperson Workload Report
 * @author Guo Jiangtao
 */
var abBldgOpsReportWorkloadController = View.createController('abBldgOpsReportWorkloadController', {

    //Restriction of trade tab console panel  type Ab.view.Restriction
    trConsoleRes: null,
    
    //Restriction of Craftsperson tab console panel  type Ab.view.Restriction
    cfConsoleRes: null,
    
    /**
     * on_click event handler for 'Show' action in trade tab console
     */
    abBldgOpsReportWorkloadTrTabConsole_onShow: function(){
        //get the console restriction and store it to this.consoleRes
        this.trConsoleRes = getConsoleRes(this.abBldgOpsReportWorkloadTrTabConsole);
        //refresh the summary report
		this.abBldgOpsReportWorkloadTrTabCrossTable.addParameter('trConsoleRes', this.trConsoleRes);
		this.abBldgOpsReportWorkloadTrTabGrid.addParameter('trConsoleRes', this.trConsoleRes);
        this.abBldgOpsReportWorkloadTrTabCrossTable.refresh();
    },
    
    /**
     * on_click event handler for 'Show' action in Craftsperson tab console
     */
    abBldgOpsReportWorkloadCfTabConsole_onShow: function(){
        //get the console restriction and store it to this.consoleRes
        this.cfConsoleRes = getConsoleRes(this.abBldgOpsReportWorkloadCfTabConsole);
        //refresh the summary report
		this.abBldgOpsReportWorkloadCfTabCrossTable.addParameter('cfConsoleRes', this.cfConsoleRes);
		this.abBldgOpsReportWorkloadCfTabGrid.addParameter('cfConsoleRes', this.cfConsoleRes);
        this.abBldgOpsReportWorkloadCfTabCrossTable.refresh();
    },
	
	/**
     * on_click event handler for 'clear' action in trade tab console
     */
    abBldgOpsReportWorkloadTrTabConsole_onClear: function(){
		this.abBldgOpsReportWorkloadTrTabConsole.clear();
		setDefaultValueForHtmlField(['work_type_tr'], ['']);
    },
    
    /**
     * on_click event handler for 'clear' action in Craftsperson tab console
     */
    abBldgOpsReportWorkloadCfTabConsole_onClear: function(){
		this.abBldgOpsReportWorkloadCfTabConsole.clear();
		setDefaultValueForHtmlField(['work_type_cf'], ['']);
    }
});

/**
 * Show details panel as pop-up when click trade cross table
 * @param ob {Object} click object.
 */
function onTrCrossTableClick(ob){
    var grid = View.panels.get('abBldgOpsReportWorkloadTrTabGrid');
    grid.refresh(ob.restriction);
    grid.showInWindow({
        width: 1200,
        height: 600
    });
}

/**
 * Show details panel as pop-up when click Craftsperson cross table
 * @param ob {Object} click object.
 */
function onCfCrossTableClick(ob){
    var grid = View.panels.get('abBldgOpsReportWorkloadCfTabGrid');
    grid.refresh(ob.restriction);
    grid.showInWindow({
        width: 1200,
        height: 600
    });
}


/**
 * get console restriction
 */
function getConsoleRes(console){
    var fieldArray = new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.supervisor'], ['wr.work_team_id']);
    var probType = '';
    var dateFieldName = "";
    if (console.id == 'abBldgOpsReportWorkloadTrTabConsole') {
        probType = $('work_type_tr').value;
        dateFieldName = "wrtr.date_assigned";
    }
    else {
        probType = $('work_type_cf').value;
        dateFieldName = "wrcf.date_assigned";
		fieldArray.push(['cf.tr_id']);
    }
	
	var restriction = getRestrictionStrFromConsole(console, fieldArray);
    restriction += getRestrictionStrOfDateRange(console, dateFieldName);
    
    if (probType) {
        if (probType == "OD") {
            restriction += " AND wr.prob_type != 'PREVENTIVE MAINT'";
        }
        if (probType == "PM") {
            restriction += " AND wr.prob_type = 'PREVENTIVE MAINT'";
        }
    }
    
    return restriction;
}

/**
 * Controller of the Parts Usage History Report
 * @author Guo Jiangtao
 */
var abBldgopsReportPtHistController = View.createController('abBldgopsReportPtHistController', {

    //Restriction of console panel  type String
    consoleRes: "",
    
    //Restriction of date range in consoel panel  type String
    dateRangRes: "",
    
    //normal console fields which can be used for get restriction by common method getRestrictionStrFromConsole
    normalConsoleField: new Array(['wr.site_id','','hwr.site_id'], ['wr.bl_id','','hwr.bl_id'], ['wr.fl_id','','hwr.fl_id'], ['wr.dv_id','','hwr.dv_id'], ['wr.dp_id','','hwr.dp_id'],['wr.prob_type','like','hwr.prob_type']),
    
    //group field definition Map according the option of the console panel
    //'1'--group by Tool Id and Problem Type. '2'--group by Tool Id and Cause Type. '3'--group by Tool Id and Repair Type.  '4'--group by Tool Id  
    groupFieldMap: {
        '1': "(${sql.yearMonthOf('hwrpt.date_assigned')})",
        '2': "(${sql.yearMonthDayOf('hwrpt.date_assigned')})",
        '3': "(hwr.prob_type)",
        '4': "(hwr.site_id)"
    },
    
    selectedGroupField: '',
    
    /**
     * on_click event handler for 'Show' action
     */
    abBldgopsReportPtHistConsole_onShow: function(){
        //get the group option in the console
        var groupBy = $('groupBy').value;
        
        //set the groupfield parameter of crosstable datasource according the group option and groupFieldMap
        this.selectedGroupField = this.groupFieldMap[groupBy];
        this.getConsoleRestriction();
        this.abBldgopsReportPtHistChart.addParameter('groupfield', this.selectedGroupField);
        this.abBldgopsReportPtHistGrid.addParameter('groupfield', this.selectedGroupField);
        this.abBldgopsReportPtHistChart.addParameter('consoleRes', this.consoleRes);
        this.abBldgopsReportPtHistGrid.addParameter('consoleRes', this.consoleRes);
        
        //refresh the report
        this.abBldgopsReportPtHistChart.refresh();
    },
    
    abBldgopsReportPtHistConsole_onClear: function(){
        this.abBldgopsReportPtHistConsole.clear();
        setDefaultValueForHtmlField(['work_type', 'groupBy'], ['', '1']);
    },
    
    /**
     * get console restriction
     */
    getConsoleRestriction: function(){
    
        //get the date range restriction 
        this.dateRangRes = getRestrictionStrOfDateRange(this.abBldgopsReportPtHistConsole, 'wrpt.date_assigned');
        this.dateRangRes = this.dateRangRes.replace(/wrpt/g, "hwrpt");
        //get the console restriction and store it to this.consoleRes
        this.consoleRes = " AND " + getRestrictionStrFromConsole(this.abBldgopsReportPtHistConsole, this.normalConsoleField) + this.dateRangRes;
        
        var probType = $('work_type').value;
        this.consoleRes = appendWorkTypeRestriction(this.consoleRes, probType, 'hwr');
        
        var partId = this.abBldgopsReportPtHistConsole.getFieldValue('pt.part_id');
        if (partId) {
            this.consoleRes += " AND " + getMultiSelectFieldRestriction(['hwrpt.part_id'], partId );
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
                if (clause.name.indexOf('groupfield') != -1) {
                    restriction += " AND " + this.selectedGroupField;
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
    var grid = View.panels.get('abBldgopsReportPtHistGrid');
    grid.addParameter('consoleRes', abBldgopsReportPtHistController.consoleRes);
    var restriciton = abBldgopsReportPtHistController.createPopUpRestriction(ob);
    grid.refresh(restriciton);
    grid.showInWindow({
        width: 1000,
        height: 500
    });
}

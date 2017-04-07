/**
 * Controller of the Work Request Aging Report
 * @author Guo Jiangtao
 */
var abBldgopsReportWrAgingGridController = View.createController('abBldgopsReportWrAgingGridController', {
    //parameter value of report parameter 'monthStart' type String
    monthStart: null,
    
    //parameter value of report parameter 'monthEnd' type String
    monthEnd: null,
    
    //restriction of the console panel for table wr
    consoleResWr: "",
    
    //restriction of the console panel for table hwr
    consoleResHwr: "",
    
    //normal console fields which can be used for get restriction by common method getRestrictionStrFromConsole
    normalConsoleField: new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.eq_id'], ['wr.prob_type','like'], ['wr.supervisor'], ['wr.work_team_id']),
    
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //set the report parameter 'monthStart' and 'monthEnd'
        this.setMonth();
        this.abBldgopsReportWrAgingCrossTable.addParameter('openworkrequesttitle', getMessage('openworkrequesttitle'));
        this.abBldgopsReportWrAgingGrid.addParameter('openworkrequesttitle', getMessage('openworkrequesttitle'));
    },
    
    /**
     * set this.monthStart as current month of last year like '2009-07' , this.monthEnd as current month like '2010-07'
     */
    setMonth: function(){
        var now = new Date();
        
        //set year
        this.monthStart = (now.getFullYear() - 1) + '-';
        this.monthEnd = now.getFullYear() + '-';
        
        //set month like '07' '12'
        if (now.getMonth() < 9) {
            this.monthStart += '0' + (now.getMonth() + 1);
            this.monthEnd += '0' + (now.getMonth() + 1);
        }
        else {
            this.monthStart += (now.getMonth() + 1);
            this.monthEnd += (now.getMonth() + 1);
        }
        
        //set the report panel and details panel datasource parameters
        this.abBldgopsReportWrAgingCrossTable.addParameter('monthStart', this.monthStart);
        this.abBldgopsReportWrAgingCrossTable.addParameter('monthEnd', this.monthEnd);
        this.abBldgopsReportWrAgingGrid.addParameter('monthStart', this.monthStart);
        this.abBldgopsReportWrAgingGrid.addParameter('monthEnd', this.monthEnd);
    },
    
    /**
     * on_click event handler for 'Show' action
     */
    abBldgopsReportWrAgingConsole_onShow: function(){
        //get console restriction
        this.getConsoleRestriction();
        //refresh the report
        this.abBldgopsReportWrAgingCrossTable.refresh(this.consoleResWr);
    },
    
    /**
     * get console restriction
     */
    getConsoleRestriction: function(){
    
        //get the console restriction and store it to this.consoleRes
        this.consoleResWr = getRestrictionStrFromConsole(this.abBldgopsReportWrAgingConsole, this.normalConsoleField);
        
        var eqStd = this.abBldgopsReportWrAgingConsole.getFieldValue('eq.eq_std');
        if (eqStd) {
            this.consoleResWr += " AND EXISTS(SELECT 1 FROM eq WHERE eq.eq_id = wr.eq_id AND " + getMultiSelectFieldRestriction(['eq.eq_std'],eqStd) + ")";
        }
        
        this.consoleResHwr = this.consoleResWr.replace(/wr/g, 'hwr');
    }
    
});

/**
 * Show details panel as pop-up
 * @param ob {Object} click object.
 */
function showDetails(ob){
    var grid = View.panels.get('abBldgopsReportWrAgingGrid');
    grid.addParameter('consoleResWr', abBldgopsReportWrAgingGridController.consoleResWr + " AND ");
    grid.addParameter('consoleResHwr', abBldgopsReportWrAgingGridController.consoleResHwr + " AND ");
    grid.refresh(ob.restriction);
    grid.showInWindow({
        width: 1000,
        height: 500
    });
}

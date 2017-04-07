/**
 * Controller of the Labor Analysis Report
 * @author Guo Jiangtao
 */
var abBldgopsReportLaborAnalController = View.createController('abBldgopsReportLaborAnalController', {

    //Restriction of console panel  type String
    consoleRes: "",
    
    //Restriction of date range in consoel panel  type String
    dateRangRes: "",
    
    //normal console fields which can be used for get restriction by common method getRestrictionStrFromConsole
    normalConsoleField: new Array(['hwr.site_id'], ['hwr.bl_id'], ['hwr.fl_id'], ['hwr.dv_id'], ['hwr.dp_id'], ['hwr.work_team_id']),
    
    //console value of first grouping field
    firstGrouping: "",
    
    //console value of second grouping field
    secondGrouping: "",
    
    //the selected group field by selecting the firstGrouping and secondGrouping
    selectedGroupField: null,
    
    //group field definition Map according the option of the console panel
    //'11'--group by Trade and Problem Type. '12'--group by Trade and Cause Type. '13'--group by Trade and Repair Type.  '14'--group by Trade  
    //'21'--group by Craftsperson and Problem Type. '22'--group by Craftsperson and Cause Type. '23'--group by Craftsperson and Repair Type.  '24'--group by Craftsperson
    //'31'--group by Work Team and Problem Type. '32'--group by  Work Team and Cause Type. '33'--group by  Work Team and Repair Type.  '34'--group by  Work Team
    groupFieldMap: {
        '11': "RTRIM(hwrtr.tr_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.prob_type)",
        '12': "RTRIM(hwrtr.tr_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.cause_type)",
        '13': "RTRIM(hwrtr.tr_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.repair_type)",
        '14': "hwrtr.tr_id",
        '21': "RTRIM(hwrcf.cf_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.prob_type)",
        '22': "RTRIM(hwrcf.cf_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.cause_type)",
        '23': "RTRIM(hwrcf.cf_id)${sql.concat}'-'${sql.concat}RTRIM(hwr.repair_type)",
        '24': "hwrcf.cf_id",
        '31': "RTRIM(work_team_id)${sql.concat}'-'${sql.concat}RTRIM(prob_type)",
        '32': "RTRIM(work_team_id)${sql.concat}'-'${sql.concat}RTRIM(cause_type)",
        '33': "RTRIM(work_team_id)${sql.concat}'-'${sql.concat}RTRIM(repair_type)",
        '34': "work_team_id"
    },
    
    //////////////////////////////////////////event handler//////////////////////////////////////////////////
    
    /**
     * on_click event handler for 'Show' action
     */
    abBldgopsReportLaborAnalConsole_onShow: function(){
        //get group option from console
        this.getGroupOption();
        
        //set the datasourceId of the crosstable according the first grouping field
        this.setCrossTableDataSource();
        
        //get the console restriction and store it to this.consoleRes
        this.getConsoleRestriction();
        
        //gset datasource parameters
        this.setDatasourceParameters();
        
        //refresh the report
        this.abBldgopsReportLaborAnalCrossTable.refresh();
        
        //show or hidden Bar Chart button according group option
        this.showOrHideBarChartButton();
    },
    
    /**
     * on_click event handler for 'Clear' action
     */
    abBldgopsReportLaborAnalConsole_onClear: function(){
		this.abBldgopsReportLaborAnalConsole.clear();
		setDefaultValueForHtmlField(['work_type', 'firstGrouping', 'secondGrouping'], ['', '1', '1']);
    },
    
    /**
     * Show details panel as pop-up
     * @param ob {Object} click object.
     */
    showDetails: function(ob){
        var gridName = 'abBldgopsReportLaborAnalGridHwrtrGrid';
        if (abBldgopsReportLaborAnalController.firstGrouping != '1') {
            gridName = 'abBldgopsReportLaborAnalGridHwrcfGrid';
        }
        var grid = View.panels.get(gridName);
		
		//add to fix KB3028988
		var restriction = this.createPopUpRestriction(ob);
        grid.refresh(restriction);
        grid.showInWindow({
            width: 1000,
            height: 500,
            title: getMessage('details'),
            closeButton: true
        });
    },
    
    /**
     * Show line chart view
     */
    showLineChart: function(){
        View.openDialog('ab-bldgops-report-labor-anal-line-chart.axvw');
    },
    
    /**
     * Show bar chart view
     */
    showBarChart: function(){
        View.openDialog('ab-bldgops-report-labor-anal-bar-chart.axvw');
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    
    //////////////////////////////////////////logic method//////////////////////////////////////////////////
    
    /**
     * get console restriction
     */
    getConsoleRestriction: function(){
    
        //get the date range restriction 
        this.dateRangRes = getRestrictionStrOfDateRange(this.abBldgopsReportLaborAnalConsole, 'hwr.date_completed');
        
        //get the console restriction and store it to this.consoleRes
        this.consoleRes = getRestrictionStrFromConsole(this.abBldgopsReportLaborAnalConsole, this.normalConsoleField) + this.dateRangRes;
        
        var probType = $('work_type').value;
        this.consoleRes = appendWorkTypeRestriction(this.consoleRes, probType, 'hwr');
    },
    
    /**
     * set datasource parameters
     */
    getGroupOption: function(){
        //get the group option in the console
        this.firstGrouping = $('firstGrouping').value;
        this.secondGrouping = $('secondGrouping').value;
        
        //set the groupfield parameter of crosstable datasource according the group option and groupFieldMap
        if (this.firstGrouping == '4') {
            this.selectedGroupField = this.groupFieldMap['3' + this.secondGrouping];
        }
        else {
            this.selectedGroupField = this.groupFieldMap[this.firstGrouping + this.secondGrouping];
        }
    },
    
    
    /**
     * set datasource parameters
     */
    setDatasourceParameters: function(){
        this.abBldgopsReportLaborAnalCrossTable.addParameter('groupfield', this.selectedGroupField);
        this.abBldgopsReportLaborAnalGridHwrtrGrid.addParameter('groupfield', this.selectedGroupField);
        this.abBldgopsReportLaborAnalGridHwrcfGrid.addParameter('groupfield', this.selectedGroupField);
        this.abBldgopsReportLaborAnalCrossTable.addParameter('consoleRes', this.consoleRes);
        this.abBldgopsReportLaborAnalGridHwrtrGrid.addParameter('consoleRes', this.consoleRes);
        this.abBldgopsReportLaborAnalGridHwrcfGrid.addParameter('consoleRes', this.consoleRes);
    },
    
    
    /**
     * show or hidden Bar Chart button according group option
     */
    showOrHideBarChartButton: function(){
    
        //get bar chart action
        var action = this.abBldgopsReportLaborAnalCrossTable.actions.get('barChart');
        
        //This chart applies only to Craftsperson and Work Team groupings
        if (this.firstGrouping == '1' || this.firstGrouping == '4') {
            action.show(false);
        }
        else {
            action.show(true);
        }
    },
    
    /**
     * set the datasourceId of the crosstable according the first grouping field
     */
    setCrossTableDataSource: function(){
        //if the group by trade data will come from table hwrtr, else will come from hwrcf
        if (this.firstGrouping == '1') {
            this.abBldgopsReportLaborAnalCrossTable.dataSourceId = 'abBldgopsReportLaborAnalCrossTableHwrtrDS';
            this.abBldgopsReportLaborAnalCrossTable.viewDef.dataSourceId = 'abBldgopsReportLaborAnalCrossTableHwrtrDS';
        }
        else 
            if (this.firstGrouping == '4') {
                this.abBldgopsReportLaborAnalCrossTable.dataSourceId = 'abBldgopsReportLaborAnalCrossTableWorkTeamPerCfDS';
                this.abBldgopsReportLaborAnalCrossTable.viewDef.dataSourceId = 'abBldgopsReportLaborAnalCrossTableWorkTeamPerCfDS';
            }
            else {
                this.abBldgopsReportLaborAnalCrossTable.dataSourceId = 'abBldgopsReportLaborAnalCrossTableHwrcfDS';
                this.abBldgopsReportLaborAnalCrossTable.viewDef.dataSourceId = 'abBldgopsReportLaborAnalCrossTableHwrcfDS';
            }
        
        var groupByFields = [];
        var calculatedFields = [];
        this.abBldgopsReportLaborAnalCrossTable.getDataSource().fieldDefs.each(function(fieldDef){
            if (fieldDef.groupBy) {
                groupByFields.push(fieldDef);
            }
            else {
                calculatedFields.push(fieldDef);
            }
        });
        this.abBldgopsReportLaborAnalCrossTable.groupByFields = groupByFields;
        this.abBldgopsReportLaborAnalCrossTable.calculatedFields = calculatedFields;
    },
	
    /**
     * create restriction for pop up grid
     */
    createPopUpRestriction: function(clickObject){
        var restriction = '1=1'
        if (clickObject.restriction.clauses) {
            for (var i = 0; i < clickObject.restriction.clauses.length; i++) {
				var clause = clickObject.restriction.clauses[i];
                if (clause.name.indexOf('x_month')!=-1) {
                    restriction += " AND ${sql.yearMonthOf('hwr.date_completed')}" ;
                }
                if (clause.name.indexOf('groupfield')!=-1) {
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
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

});




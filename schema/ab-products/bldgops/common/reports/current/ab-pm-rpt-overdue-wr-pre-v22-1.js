/**
 * Controller of report Overdue Work Requests
 * @author Guo Jiangtao
 */
var abPmRptOverdueWrController = View.createController('abPmRptOverdueWrController', {

    //restriction of console panel
    consoleRes: "",
	
	//overDaysDisplay table definition used in the datasource parameter
    OverDaysDisplayTableDefine: "",
    
    //overDaysDisplay field definition used in the datasource parameter
    OverDaysDisplayFieldDefine: "",
    
    //normal console fields which can be used for get restriction by common method getRestrictionStrFromConsole
    normalConsoleField: new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.supervisor'], ['wr.work_team_id']),
    
    
    //////////////////////////////////////////event handler//////////////////////////////////////////////////
    
    /**
     * on_click event handler for 'Show' action
     */
    abPmRptOverdueWrConsole_onShow: function(){
    
        //gset datasource parameters
        this.setDatasourceParameters();
        
        //refresh the chart
        this.abPmRptOverdueWrChart.refresh();
        
    },
    
    /**
     * Clear restriction and set default value
     */
    abPmRptOverdueWrConsole_onClear: function(){
        this.abPmRptOverdueWrConsole.clear();
        setDefaultValueForHtmlField(['work_type', 'categorize_by'], ['', 'D']);
    },
	
	/**
     * open Craftsperson Workload as a pop up window
     */
    abPmRptOverdueWrChart_onOpenCrWorkLoadWindow: function(){
        View.openDialog("ab-bldgops-report-cf-workload.axvw");
    },
    
    
    /**
     * Show details panel as pop-up
     * @param ob {Object} click object.
     */
    showDetails: function(ob){
        var grid = this.abPmRptOverdueWrGrid;
        grid.refresh(ob.restriction);
        grid.showInWindow({
            width: 1200,
            height: 500
        });
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    //////////////////////////////////////////logic method//////////////////////////////////////////////////
    
    /**
     * set datasource parameters
     */
    setDatasourceParameters: function(){
    
        //get the console restriction and store it to this.consoleRes
        this.getConsoleRestriction();
		
		this.getOverDaysDisplayTableDefine();
        
        this.getOverDaysDisplayFieldDefine();
        
        this.abPmRptOverdueWrChart.addParameter('consoleRes', this.consoleRes);
		this.abPmRptOverdueWrChart.addParameter('over_days_diplay_table', this.OverDaysDisplayTableDefine);
        this.abPmRptOverdueWrChart.addParameter('over_days_diplay', this.OverDaysDisplayFieldDefine);
        this.abPmRptOverdueWrGrid.addParameter('consoleRes', this.consoleRes);
        this.abPmRptOverdueWrGrid.addParameter('over_days_diplay', this.OverDaysDisplayFieldDefine);
    },
    
    /**
     * get console restriction
     */
    getConsoleRestriction: function(){
    
        //get the console restriction and store it to this.consoleRes
        this.consoleRes = getRestrictionStrFromConsole(this.abPmRptOverdueWrConsole, this.normalConsoleField);
        
        var eqStd = this.abPmRptOverdueWrConsole.getFieldValue('eq.eq_std');
        if (eqStd) {
            this.consoleRes += " AND EXISTS(SELECT 1 FROM eq WHERE eq.eq_id = wr.eq_id AND " + getMultiSelectFieldRestriction(['eq.eq_std'],eqStd) + ")"
        }
        
        var probType = $('work_type').value;
        this.consoleRes = appendWorkTypeRestriction(this.consoleRes, probType, 'wr');
        
    },
	
    /**
     * get overDaysDisplay table definition according the categorizeBy field value in the console
     */
    getOverDaysDisplayTableDefine: function(){
        //get the group option in the console
        categorizeBy = $('categorize_by').value;
        var overDaysDiplayArray = null;
        
        if (categorizeBy == "D") {
            overDaysDiplayArray = ['one_day_text', 'two_day_text', 'three_day_text', 'four_day_text', 'five_day_text', 
			'six_day_text', 'seven_day_text', 'greate_7_day_text'];
        }
        //if categorize By week show chart by week
        if (categorizeBy == "W") {
            overDaysDiplayArray = ['one_week_text', 'two_week_text', 'three_week_text', 'four_week_text', 'five_week_text',
			 'greate_5_week_text'];
        }
        //if categorize By month show chart by month
        if (categorizeBy == "M") {
            overDaysDiplayArray = ['one_month_text', 'two_month_text', 'three_month_text', 'four_month_text', 'five_month_text', 
			'six_month_text', 'seven_month_text', 'eight_month_text', 'nine_month_text', 'ten_month_text', 'eleven_month_text', 
			'twevle_month_text', 'greate_12_month_text']
        }
        
        this.OverDaysDisplayTableDefine = "SELECT * FROM (" + this.getUnionSql(overDaysDiplayArray) + ") ${sql.as} over_days_diplay_table";
    },
	
	/**
     * get sql clause that union a array as a static table
     * using 'select distinct ... from ctry' to aviod the difference among the three supported database types
     */
    getUnionSql: function(overDaysDiplayArray){
		var sql = "";
		for(var i=0;i<overDaysDiplayArray.length;i++){
			sql += " SELECT DISTINCT "+ i+ " ${sql.as} display_order," + this.literal(getMessage(overDaysDiplayArray[i]))+" ${sql.as} over_days_diplay FROM ctry UNION"
		}
		return sql.substring(0,sql.length-5);
    },
	
	
	/**
     * get overDaysDisplay field definition according the categorizeBy field value in the console
     */
    getOverDaysDisplayFieldDefine: function(){
        //get the group option in the console
        categorizeBy = $('categorize_by').value;
		var daysDiffSqlString = "${sql.daysBeforeCurrentDate(sql.isNull('wr.date_escalation_completion', 'wr.date_assigned'))}";
        
        if (categorizeBy == "D") {
			this.OverDaysDisplayFieldDefine =  " CASE WHEN "+daysDiffSqlString+ " =1   THEN  "+ this.literal(getMessage('one_day_text'))
			+" WHEN "+daysDiffSqlString+ " =2   THEN  " + this.literal(getMessage('two_day_text'))
			+" WHEN "+daysDiffSqlString+ " =3   THEN  " + this.literal(getMessage('three_day_text'))
			+" WHEN "+daysDiffSqlString+ " =4   THEN  " + this.literal(getMessage('four_day_text'))
			+" WHEN "+daysDiffSqlString+ " =5   THEN  " + this.literal(getMessage('five_day_text'))
			+" WHEN "+daysDiffSqlString+ " =6   THEN  " + this.literal(getMessage('six_day_text'))
			+" WHEN "+daysDiffSqlString+ " =7   THEN  " + this.literal(getMessage('seven_day_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 7   THEN  "+ this.literal(getMessage('greate_7_day_text'))
			+" END";
        }
        //if categorize By week show chart by week
        if (categorizeBy == "W") {
           this.OverDaysDisplayFieldDefine =  " CASE WHEN "+daysDiffSqlString+ " &lt;=7   THEN  "+ this.literal(getMessage('one_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 7 AND " +daysDiffSqlString+"  &lt;= 14  THEN  "+ this.literal(getMessage('two_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 14 AND " +daysDiffSqlString+"  &lt;= 21  THEN  "+ this.literal(getMessage('three_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 21 AND " +daysDiffSqlString+"  &lt;= 28  THEN  "+ this.literal(getMessage('four_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 28 AND " +daysDiffSqlString+"  &lt;= 35  THEN  "+ this.literal(getMessage('five_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 35 THEN  "+ this.literal(getMessage('greate_5_week_text'))
			+" END";
        }
        //if categorize By month show chart by month
        if (categorizeBy == "M") {
           this.OverDaysDisplayFieldDefine =  " CASE WHEN "+daysDiffSqlString+ " &lt;=30   THEN  "+ this.literal(getMessage('one_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 30 AND " +daysDiffSqlString+"  &lt;= 60  THEN  "+ this.literal(getMessage('two_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 60 AND " +daysDiffSqlString+"  &lt;= 90  THEN  "+ this.literal(getMessage('three_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 90 AND " +daysDiffSqlString+"  &lt;= 120  THEN  "+ this.literal(getMessage('four_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 120 AND " +daysDiffSqlString+"  &lt;= 150  THEN  "+ this.literal(getMessage('five_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 150 AND " +daysDiffSqlString+"  &lt;= 180  THEN  "+ this.literal(getMessage('six_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 180 AND " +daysDiffSqlString+"  &lt;= 210  THEN  "+ this.literal(getMessage('seven_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 210 AND " +daysDiffSqlString+"  &lt;= 240  THEN  "+ this.literal(getMessage('eight_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 240 AND " +daysDiffSqlString+"  &lt;= 270  THEN  "+ this.literal(getMessage('nine_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 270 AND " +daysDiffSqlString+"  &lt;= 300  THEN  "+ this.literal(getMessage('ten_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 300 AND " +daysDiffSqlString+"  &lt;= 330  THEN  "+ this.literal(getMessage('eleven_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 330 AND " +daysDiffSqlString+"  &lt;= 365  THEN  "+ this.literal(getMessage('twevle_month_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 365 THEN  "+ this.literal(getMessage('greate_12_month_text'))
			+" END";
        }
    },
	
	/**
     * add '' outsite the text
     */
	literal: function(text){
		if(valueExists(text)){
			return "'"+text+"'";
		}else{
			return "''";
		}
	}
});

/**
 * Added for 22.1 Compliance and Building Operations Integration: Programs with Overdue Work report.
 * By Zhang Yi - 2015.5
 */
var abCompRptOverdueWrCtrl = View.createController('abCompRptOverdueWrCtrl', {

	workRequestResForLinkedPm:" 1=1 ",
	workRequestFieldsArraysForLinkedPmRes: new Array( ['wr.site_id'], ['wr.pmp_id'],['wr.bl_id'], ['wr.status'],
			['eqstd.category'], ['eqstd.eq_std'], 
			['pmp.pmp_type'], ['pms.pm_group'], 
			['regreq_pmp.regulation'], ['regreq_pmp.reg_program'], ['regreq_pmp.reg_requirement'], 
			['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], 
			['regprogram.project_id'], ['regprogram.priority']),

	workRequestResForLinkedEvent:" 1=1 ",
	workRequestFieldsArraysForLinkedEventRes: new Array( ['wr.site_id'], ['wr.pmp_id'],['wr.bl_id'], ['wr.status'],
			['eqstd.category'], ['eqstd.eq_std'], 
			['pmp.pmp_type'], ['pms.pm_group'], 
			['regreq_pmp.regulation', '', 'event.regulation'], ['regreq_pmp.reg_program','', 'event.reg_program'], ['regreq_pmp.reg_requirement','', 'event.reg_requirement'], 
			['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], 
			['regprogram.project_id'], ['regprogram.priority']),

	//restriction for selected 'Time Interval' option
	timeIntervalSelection:"days",
	//Time Interval options 
	timeIntervalOptions: new Array("days","weeks","months"),
	//array of restrictions for Time Interval options
	timeIntervalOptionRestrictions: new Array(),

	// Custom select SQL of virtual table-view includes all display value for overdue days
	overdueDaysViewSQL:"",
	// Custom calculation SQL of overdue days
	overdueDaysCalculationSQL:"",

	afterInitialDataFetch : function() {
		//initial list box on title bar of chart panel for 'Time Interval' options
		this.initialTimeIntervalOnPanelTitle();

		// initial custom sub SQLs for chart's custom DataSource
		this.generateOverdueDaysViewSQL();
		this.generateOverdueDaysCalculationSQL();
	},

	/**
	* Construct and Show list box on title bar of Grid
	*/
	initialTimeIntervalOnPanelTitle: function(){
		var panelTitleNode = this.abCompRptOverdueWrChart.getTitleEl().dom.parentNode.parentNode;
		//var cell = Ext.DomHelper.insertBefore(document.getElementById('exportDOCX').firstChild.firstChild.firstChild,  {
		var cell = Ext.DomHelper.append(panelTitleNode,  {
			tag : 'td',
			id : 'listBox'
		});
		this.lableDom = cell;

		var tn = Ext.DomHelper.append(cell, '<p>' + View.getLocalizedString(getMessage("timeIntervalTitle")) + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'time_interval_td'
		});
		
		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'time_interval'
		}, true);
		this.dropDownDom = options.dom;
		
		for(var i=0;i<this.timeIntervalOptions.length;i++){
			options.dom.options[i] = new Option(getMessage(this.timeIntervalOptions[i]), this.timeIntervalOptions[i]);
		}
		options.dom.selectedIndex = 0;
		options.on('change', this.onChangeTimeInterval, this, {
			delay : 100,
			single : false
		});
	},

	/**
	* Event handler when selection of list box is change
	*/
	onChangeTimeInterval : function(e, selectEl) {
		this.timeIntervalSelection = this.timeIntervalOptions[selectEl.selectedIndex];

		// reset custom sub SQLs for chart's custom DataSource since the selection of 'Time Interval' is changed
		this.generateOverdueDaysViewSQL();
		this.generateOverdueDaysCalculationSQL();

		// refresh the chart
		this.abCompRptWrConsole_onShow();
	},

	abCompRptWrConsole_onShow: function(){
		var chartPanel = this.abCompRptOverdueWrChart;
		var gridPanel = this.abCompRptWrGrid;

		this.workRequestResForLinkedPm = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedPmRes); 
		this.workRequestResForLinkedEvent = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedEventRes);

		chartPanel.addParameter("resForPmpLink", this.workRequestResForLinkedPm);
		chartPanel.addParameter("resForEventLink", this.workRequestResForLinkedEvent);
		chartPanel.addParameter('overdueDaysViewSQL', this.overdueDaysViewSQL);
        chartPanel.addParameter('overdueDaysCalculationSQL', this.overdueDaysCalculationSQL);

		gridPanel.addParameter("resForPmpLink", this.workRequestResForLinkedPm);
		gridPanel.addParameter("resForEventLink", this.workRequestResForLinkedEvent);
        gridPanel.addParameter('overdueDaysCalculationSQL', this.overdueDaysCalculationSQL);

		chartPanel.refresh();
		chartPanel.show(true);
	},

    /**
     * Called when clicking on chart
     * @param ob {Object} click object.
     */
	showWorkRequestList: function(obj){	
        var grid = this.abCompRptWrGrid;
        grid.refresh(obj.restriction);
        grid.showInWindow({
			x : 200,
			y : 200,
			closeButton: true,
			modal : true,
            width: 1200,
            height: 500
        });
	},

    /**
     * Get the sub SQL according the Time Interval selection value on the chart's title bar
     */
    generateOverdueDaysViewSQL: function(){

        var overdueDaysDisplayArray = null;       
        if ( "days"==this.timeIntervalSelection ) {
            overdueDaysDisplayArray = ['one_day_text', 'two_day_text', 'three_day_text', 'four_day_text', 'five_day_text', 
			'six_day_text', 'seven_day_text', 'greate_7_day_text'];
        }	
		else if ( "weeks"==this.timeIntervalSelection ) {
            overdueDaysDisplayArray = ['one_week_text', 'two_week_text', 'three_week_text', 'four_week_text', 'five_week_text',
			 'greate_5_week_text'];
        }
		else if ( "months"==this.timeIntervalSelection ) {
            overdueDaysDisplayArray = ['one_month_text', 'two_month_text', 'three_month_text', 'four_month_text', 'five_month_text', 
			'six_month_text', 'seven_month_text', 'eight_month_text', 'nine_month_text', 'ten_month_text', 'eleven_month_text', 
			'twevle_month_text', 'greate_12_month_text']
        }
        
        this.overdueDaysViewSQL = "SELECT * FROM (" + this.getUnionSql(overdueDaysDisplayArray) + ") ${sql.as} overdueDaysView";
    },
	
	/**
     * Get sql clause that union a array as a static table
     * using 'select distinct ... from ctry' to aviod the difference among the three supported database types
     */
    getUnionSql: function(overdueDaysDisplayArray){
		var sql = "";
		for(var i=0;i<overdueDaysDisplayArray.length;i++){
			sql += " SELECT DISTINCT "+ i+ " ${sql.as} display_order," + this.literal(getMessage(overdueDaysDisplayArray[i]))+" ${sql.as} overdueDaysDisplay FROM ctry UNION"
		}
		return sql.substring(0,sql.length-5);
    },
	
	/**
     * Get custom calculation sql for overdue days.
     */
    generateOverdueDaysCalculationSQL: function(){
		var daysDiffSqlString = "${sql.daysBeforeCurrentDate(sql.isNull('wr.date_escalation_completion', 'wr.date_assigned'))}";
        
        if ( "days"==this.timeIntervalSelection ) {
			this.overdueDaysCalculationSQL =  " CASE WHEN "+daysDiffSqlString+ " =1   THEN  "+ this.literal(getMessage('one_day_text'))
			+" WHEN "+daysDiffSqlString+ " =2   THEN  " + this.literal(getMessage('two_day_text'))
			+" WHEN "+daysDiffSqlString+ " =3   THEN  " + this.literal(getMessage('three_day_text'))
			+" WHEN "+daysDiffSqlString+ " =4   THEN  " + this.literal(getMessage('four_day_text'))
			+" WHEN "+daysDiffSqlString+ " =5   THEN  " + this.literal(getMessage('five_day_text'))
			+" WHEN "+daysDiffSqlString+ " =6   THEN  " + this.literal(getMessage('six_day_text'))
			+" WHEN "+daysDiffSqlString+ " =7   THEN  " + this.literal(getMessage('seven_day_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 7   THEN  "+ this.literal(getMessage('greate_7_day_text'))
			+" END";
        }
		else if ( "weeks"==this.timeIntervalSelection ) {
           this.overdueDaysCalculationSQL =  " CASE WHEN "+daysDiffSqlString+ " &lt;=7   THEN  "+ this.literal(getMessage('one_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 7 AND " +daysDiffSqlString+"  &lt;= 14  THEN  "+ this.literal(getMessage('two_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 14 AND " +daysDiffSqlString+"  &lt;= 21  THEN  "+ this.literal(getMessage('three_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 21 AND " +daysDiffSqlString+"  &lt;= 28  THEN  "+ this.literal(getMessage('four_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 28 AND " +daysDiffSqlString+"  &lt;= 35  THEN  "+ this.literal(getMessage('five_week_text'))
			+" WHEN "+daysDiffSqlString+ " &gt; 35 THEN  "+ this.literal(getMessage('greate_5_week_text'))
			+" END";
        }
		else if ( "months"==this.timeIntervalSelection ) {
           this.overdueDaysCalculationSQL =  " CASE WHEN "+daysDiffSqlString+ " &lt;=30   THEN  "+ this.literal(getMessage('one_month_text'))
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
	
	literal: function(text){
		if(valueExists(text)){
			return "'"+text+"'";
		}else{
			return "''";
		}
	}
});


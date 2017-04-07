var teamsStatisticsController = View.createController('teamsStatisticsController', {

    /**
	 * The current mode the application handles.
	 */
	asOfDate:getCurrentDateInISOFormat(),

	selectedReport: null, 
		    
	/**
     * after Initial Data Fetch.
     */
    afterInitialDataFetch: function() {
		var consoleCtrl = View.getOpenerView().controllers.get('spaceExpressConsole');
		if ( consoleCtrl && consoleCtrl.asOfDate ){
			this.asOfDate = consoleCtrl.asOfDate;
		}
		this.rmTeamFilter.setFieldValue('rm_team.date_start', this.asOfDate);
		this.selectedReport = this.rmTeam_table;

		this.rmTeam_table.addParameter("asOfDate", this.rmTeamFilter.getFieldValue('rm_team.date_start'));
		this.rmTeam_table.refresh();

		this.teamRmList.addParameter("asOfDate", this.rmTeamFilter.getFieldValue('rm_team.date_start'));
	},
    
    afterViewLoad: function() {
		this.rmTeam_table.addEventListener('afterGetData', this.afterGetData, this);
		this.rmTeamCat_table.addEventListener('afterGetData', this.afterGetData, this);
		this.rmTeamType_table.addEventListener('afterGetData', this.afterGetData, this);
		this.rmTeamStd_table.addEventListener('afterGetData', this.afterGetData, this);
    },

    afterGetData: function(report) {
		this.rmTeamFilter.setFieldValue("group_by", report.id, report.id, false);
    },

	rmTeamFilter_onShow: function(){
		this.selectedReport.addParameter("asOfDate", this.rmTeamFilter.getFieldValue('rm_team.date_start'));
		var activeTeamOnly = ( 'active'==this.rmTeamFilter.getCheckboxValues('activeTeamOnly') ?  "1=0" : "1=1" ) ;
		this.selectedReport.addParameter("activeTeamOnly", activeTeamOnly);
		this.selectedReport.refresh();

		this.teamRmList.addParameter("asOfDate", this.rmTeamFilter.getFieldValue('rm_team.date_start'));
	},

	/**
	  * The user can choose one of these four options, along with an As-Of date. Refresh the crosstable after selecting report type
	  */
  	onOptionChange: function(value){
		var panel = View.panels.get(value);
		
		if (panel!=this.selectedReport) {
			this.selectedReport.show(false);
			this.selectedReport = panel;
			panel.show(true);
			panel.addParameter("asOfDate", this.rmTeamFilter.getFieldValue('rm_team.date_start'));
			panel.refresh();
		}
	}
});

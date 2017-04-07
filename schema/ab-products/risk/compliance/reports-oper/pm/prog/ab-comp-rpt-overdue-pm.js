/**
 * Added for 22.1 Compliance and Building Operations Integration: Programs with Overdue PM Schedules report.
 * By Zhang Yi - 2015.5
 */
var abCompRptPmsTabCtrl = View.createController('abCompRptPmsTabCtrl', {
	currentShow: "pms",
		
	pmsRes:" 1=1 ",
	pmsResFieldsArrays: new Array( 
			['pms.site_id'], ['pms.bl_id'], 
			['pms.pmp_id'], ['pmp.pmp_type'], ['pms.pm_group'],
			['eqstd.category'], ['eq.eq_std'], 
			['regreq_pmp.regulation'], ['regreq_pmp.reg_program'], ['regreq_pmp.reg_requirement'], 
			['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], 
			['regprogram.project_id'], ['regprogram.priority']),

	abCompRptPmsConsole_onShow: function(){
		this.showAndRefreshGrid(this.abCompRptPmsGrid);
	},

	showAndRefreshGrid: function(gridPanel){
		var days_since_last_completed = this.abCompRptPmsConsole.getFieldValue("daysSinceLastCompleted");
		var daysSinceLastCompleted = 0;
		if (valueExistsNotEmpty(days_since_last_completed)) {
		  daysSinceLastCompleted = parseInt( days_since_last_completed );			
		}
		gridPanel.addParameter("daysSinceLastCompleted", daysSinceLastCompleted);

		this.pmsRes = getRestrictionStrFromConsole( this.abCompRptPmsConsole, this.pmsResFieldsArrays); 
		gridPanel.addParameter("pmsRes", this.pmsRes);

		gridPanel.refresh();
		gridPanel.show(true);
	}		
});


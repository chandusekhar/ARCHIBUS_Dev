/**
 * Added for 22.1 Compliance and Building Operations Integration: Compliance Work History report - Work Request Tab.
 */
var abCompRptPmpTabCtrl = View.createController('abCompRptPmpTabCtrl', {
	currentShow: "wr",
		
	//Event restriction from table activity_log only related to date
	pmsDateRestriction:" 1=1 ",
	pmsateFieldsArraysForRes: new Array( ['pms.date_last_completed']),

	pmsRes:" 1=1 ",
	pmsResFieldsArrays: new Array( 
			['pms.site_id'], ['pms.bl_id'], ['pms.fl_id'], ['pms.rm_id'],
			['pms.pmp_id'], ['pms.pm_group'], ['pmp.pmp_type'], 
			['pms.eq_id'], ['pms.dv_id'], ['pms.dp_id'],
			['eqstd.category'], ['eq.eq_std'], ['wr.status']
		),

	afterInitialDataFetch: function(){
		checkLicense(['AbBldgOpsPM'], this.abCompRptPmpGrid, true); 
	},		

	showAndRefreshGrid: function(gridPanel){
		gridPanel.addParameter("regulation", View.parentTab.parentPanel.regulation);
 		gridPanel.addParameter("reg_program", View.parentTab.parentPanel.reg_program);
		gridPanel.addParameter("reg_requirement", View.parentTab.parentPanel.reg_requirement);

		gridPanel.refresh();
		gridPanel.show(true);
	}
});
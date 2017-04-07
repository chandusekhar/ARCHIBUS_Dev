/**
 * Added for 22.1 Compliance and Building Operations Integration: Compliance Work History report - Work Request Tab.
 */
var abCompRptPmsTabCtrl = View.createController('abCompRptPmsTabCtrl', {
	//Event restriction from table activity_log only related to date
	pmsDateRestriction:" 1=1 ",
	pmsateFieldsArraysForRes: new Array( ['pms.date_last_completed']),

	pmsRes:" 1=1 ",
	pmsResFieldsArrays: new Array( 
			['pms.site_id'], ['pms.bl_id'], ['pms.fl_id'], ['pms.rm_id'],
			['pms.pmp_id'], ['pms.pm_group'], ['pmp.pmp_type'], 
			['pms.eq_id'], ['pms.dv_id'], ['pms.dp_id'],
			['eqstd.category'], ['eq.eq_std']
		),

	afterInitialDataFetch: function(){
		checkLicense(['AbBldgOpsPM'], this.abCompRptPmsConsole, true); 
	},
		
	abCompRptPmsConsole_onShow: function(){
		this.showAndRefreshGrid(this.abCompRptPmsGrid);
	},

	showAndRefreshGrid: function(gridPanel){
		this.pmsDateRestriction = getDatesRestrictionFromConsole(this.abCompRptPmsConsole, this.pmsateFieldsArraysForRes);

		this.pmsRes = getRestrictionStrFromConsole( this.abCompRptPmsConsole, this.pmsResFieldsArrays); 
		var wr_status = this.abCompRptPmsConsole.getFieldValue('wr.status');
		if (wr_status != '') {
		  this.pmsRes = this.pmsRes + "  AND EXISTS (SELECT 1 FROM wr WHERE wr.pms_id=pms.pms_id AND wr.status='" + wr_status +"')";
		}
		
		gridPanel.addParameter("resForPms", this.pmsDateRestriction + " and " + this.pmsRes);

		gridPanel.addParameter("regulation", View.parentTab.parentPanel.regulation);
 		gridPanel.addParameter("reg_program", View.parentTab.parentPanel.reg_program);
		gridPanel.addParameter("reg_requirement", View.parentTab.parentPanel.reg_requirement);

		gridPanel.refresh();
		gridPanel.show(true);
	}
});
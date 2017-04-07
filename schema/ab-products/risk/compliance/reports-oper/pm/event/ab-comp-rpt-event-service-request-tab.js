/**
 * Added for 22.1 Compliance and Building Operations Integration: Compliance Work History report - Service Tab.
 */
var abCompRptSrTabCtrl = View.createController('abCompRptSrTabCtrl', {
	serviceRequestDateRestriction:" 1=1 ",
	serviceRequestDateFieldsArraysForRes: new Array( ['activity_log.date_requested'], ['activity_log.date_required'], 
		['activity_log.date_completed']),

	serviceRequestResForLinkedEvent:" 1=1 ",
	serviceRequestFieldsArraysForLinkedEventRes: new Array( 
			['activity_log.site_id'],['activity_log.bl_id'], ['activity_log.fl_id'], ['activity_log.rm_id'], 
			['activity_log.eq_id'], ['eq.eq_std'], ['eqstd.category'], 
			['activity_log.dv_id'],['activity_log.dp_id'],['activity_log.status'], ['activity_log.requestor'], ['activity_log.prob_type']),

	isLicensedForODSD:null,

	afterInitialDataFetch: function(){
		checkLicense(['AbBldgOpsOnDemandWork', 'AbBldgOpsPM'], this.abCompRptSrConsole, false, this); 
	},

	abCompRptSrConsole_onShow: function(){
		this.showAndRefreshGrid(this.abCompRptSrGrid);
	},

	showAndRefreshGrid: function(gridPanel){
		this.serviceRequestDateRestriction = getDatesRestrictionFromConsole(this.abCompRptSrConsole, this.serviceRequestDateFieldsArraysForRes).replace(/activity_log\./g, "activity_log_hactivity_log.");

		this.serviceRequestResForLinkedEvent = getRestrictionStrFromConsole( this.abCompRptSrConsole, this.serviceRequestFieldsArraysForLinkedEventRes).replace(/activity_log\./g, "activity_log_hactivity_log."); 
		gridPanel.addParameter("resForEventLink", this.serviceRequestDateRestriction + " and " + this.serviceRequestResForLinkedEvent);

		gridPanel.addParameter("eventId", View.parentTab.parentPanel.eventId);

		gridPanel.refresh();
		gridPanel.show(true);
	},

	afterCheckLicense: function(isLicensed){
		this.isLicensedForODSD = isLicensed;
		if ( !isLicensed ){
			showHideColumns(this.abCompRptSrGrid, "viewSrDetail", true);
		}

		this.showAndRefreshGrid(this.abCompRptSrGrid);
	}
});


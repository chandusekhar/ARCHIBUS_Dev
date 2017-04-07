/**
 * Added for 22.1 Compliance and Building Operations Integration: Compliance Work History report - Work Request Tab.
 */
var abCompRptWrTabCtrl = View.createController('abCompRptWrTabCtrl', {
	currentShow: "wr",
		
	//Event restriction from table activity_log only related to date
	wrDateRestriction:" 1=1 ",
	wrDateFieldsArraysForRes: new Array( ['wr.date_requested'], ['wr.date_assigned'], 
		['wr.date_completed']),

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

	isLicensedForODSD:null,

	afterInitialDataFetch: function(){
		checkLicense(['AbBldgOpsOnDemandWork', 'AbBldgOpsPM'], this.abCompRptWrConsole, false, this);
		
		//remove status A  when activity parameter value of AbBldgOpsOnDemandWork-WorkRequestsOnly is 1
		var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
		if (workRequestsOnly == '1') {
			var statusField = this.abCompRptWrConsole.fields.get('wr.status').dom;
			for (var i = statusField.length - 1; i >= 0; i--) {
    			if ('A' == statusField[i].value) {
    				statusField.remove(i);
    				break;
    			}
    		}
			
			var statusFieldDef = this.abCompRptWrGrid.getFieldDef("wr.status");
			delete statusFieldDef.enumValues['A']; 
		}
			
	},

	abCompRptWrConsole_onShow: function(){
		if ( 'wr' == this.currentShow)	 {
			this.abCompRptWoGrid.show(false);
			this.showAndRefreshGrid(this.abCompRptWrGrid);
		} else {
			this.abCompRptWrGrid.show(false);
			this.showAndRefreshGrid(this.abCompRptWoGrid);
		}
	},

	showAndRefreshGrid: function(gridPanel){
		this.wrDateRestriction = getDatesRestrictionFromConsole(this.abCompRptWrConsole, this.wrDateFieldsArraysForRes).replace(/wr\./g, "wrhwr.");

		this.workRequestResForLinkedPm = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedPmRes).replace(/wr\./g, "wrhwr."); 
		gridPanel.addParameter("resForPmpLink", this.wrDateRestriction + " and " + this.workRequestResForLinkedPm);

		this.workRequestResForLinkedEvent = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedEventRes).replace(/wr\./g, "wrhwr."); 
		gridPanel.addParameter("resForEventLink", this.wrDateRestriction + " and " + this.workRequestResForLinkedEvent);

		gridPanel.setSingleVisiblePanel(true);
		gridPanel.refresh();
		gridPanel.show(true);
	},

	afterCheckLicense: function(isLicensed){
		this.isLicensedForODSD = isLicensed;
		if ( !isLicensed ){
			showHideColumns(this.abCompRptWrGrid, "viewWrDetail", true);
			showHideColumns(this.abCompRptWoGrid, "viewWoDetail", true);
		}
	},

	abCompRptWrGrid_onViewWos: function(){	
		this.abCompRptWrGrid.show(false);
		this.showAndRefreshGrid(this.abCompRptWoGrid);
		this.currentShow = "wo";
	},
		
	abCompRptWoGrid_onViewWrs: function(){	
		this.abCompRptWoGrid.show(false);
		this.showAndRefreshGrid(this.abCompRptWrGrid);
		this.currentShow = "wr";
	},

	abCompRptWoGrid_viewWoDetail_onClick: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('wohwo.wo_id', row.record['wohwo.wo_id']);
		View.openDialog('ab-comp-rpt-work-order-details.axvw', restriction, false, {
			width: 1024, 
			height: 800, 
			closeButton: true 
		});
	}
});


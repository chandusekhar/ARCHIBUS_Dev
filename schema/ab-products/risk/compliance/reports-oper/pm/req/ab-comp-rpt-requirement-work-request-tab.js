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
	workRequestFieldsArraysForLinkedPmRes: new Array( 
			['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.rm_id'], 
			['wr.eq_id'], ['eq.eq_std'], ['eqstd.category'], 
			['wr.pmp_id'], ['wr.pms_id'], ['pmp.pmp_type'], ['pms.pm_group'], 
			['wr.dv_id'], ['wr.dp_id'], ['wr.status'], ['wr.vn_id'] ),

	workRequestResForLinkedEvent:" 1=1 ",
	workRequestFieldsArraysForLinkedEventRes: new Array( 
			['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.rm_id'], 
			['wr.eq_id'], ['eq.eq_std'], ['eqstd.category'], 
			['wr.pmp_id'], ['wr.pms_id'], ['pmp.pmp_type'], ['pms.pm_group'], 
			['wr.dv_id'], ['wr.dp_id'], ['wr.status'], ['wr.vn_id'] ),

	isLicensedForODSD:null,

	afterInitialDataFetch: function(){
		checkLicense(['AbBldgOpsOnDemandWork', 'AbBldgOpsPM'], this.abCompRptWrConsole, false, this); 
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

		//this.workRequestResForLinkedEvent = getRestrictionStrFromConsole( this.abCompRptWrConsole, this.workRequestFieldsArraysForLinkedEventRes); 
		this.workRequestResForLinkedEvent = this.workRequestResForLinkedPm; 
		gridPanel.addParameter("resForEventLink", this.wrDateRestriction + " and " + this.workRequestResForLinkedEvent);

		gridPanel.addParameter("regulation", View.parentTab.parentPanel.regulation);
 		gridPanel.addParameter("reg_program", View.parentTab.parentPanel.reg_program);
		gridPanel.addParameter("reg_requirement", View.parentTab.parentPanel.reg_requirement);

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
		var oldTitle = this.abCompRptWrGrid.getTitle();
		this.showAndRefreshGrid(this.abCompRptWoGrid);
		var newTitle = oldTitle.replace(getMessage('selectWr'), getMessage('selectWo')) ;
		this.abCompRptWoGrid.setTitle (newTitle);
		this.currentShow = "wo";
	},
		
	abCompRptWoGrid_onViewWrs: function(){	
		this.abCompRptWoGrid.show(false);
		var oldTitle = this.abCompRptWoGrid.getTitle();
		this.showAndRefreshGrid(this.abCompRptWrGrid);
		var newTitle = oldTitle.replace(getMessage('selectWo'), getMessage('selectWr')) ;
		this.abCompRptWrGrid.setTitle (newTitle);
		this.currentShow = "wr";
	},
	
	getActivePanelName: function(){	
	    var pname = "abCompRptWrGrid";
		if ( 'wo' == this.currentShow)	 {
			pname = "abCompRptWoGrid";
		} 
		return pname;
	},
	
	refreshOnSelectParentTabs: function(){	
	    if (this.abCompRptWoGrid) {
			this.abCompRptWoGrid.show(false);
		}
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


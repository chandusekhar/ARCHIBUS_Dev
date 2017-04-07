
var abCbRptMyLocs_ctrl = View.createController('abCbRptMyLocs', {

	restrictions: null,
	
	afterViewLoad:function(){
		
		View.controllers.get('abCbRptFilter').isProjectRequired = true;
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptMyLocsBlDetail' panel.
	 */
	abCbRptMyLocsBlDetail_onDoc:function(){
		var restrict = (this.abCbRptMyLocsBlDetail.restriction) ? this.abCbRptMyLocsBlDetail.restriction : "1=1";
		var restriction = {"abCbRptLocBlDetail_ds":restrict};
		
		var consoleRestrictions = View.controllers.get('abCbRptFilter').getSqlRestriction();
		var consolePrintableRestriction = consoleRestrictions.printableRestriction;
		
		var finalPrintableRestriction = null;
		if(consolePrintableRestriction){
			finalPrintableRestriction = consolePrintableRestriction;
		}
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': finalPrintableRestriction
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-bldg-pgrpt.axvw',restriction,parameters);
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptMyLocsFlByBldgBlDetail' panel.
	 */
	abCbRptMyLocsFlByBldgBlDetail_onDoc:function(){
		var restriction = {"abCbRptLocBlDetail_ds":this.abCbRptMyLocsFlByBldgBlDetail.restriction, 
			 	"abCbRptLocFlDetail_ds": this.abCbRptMyLocsFlByBldgFl.restriction
					+ " AND EXISTS(select 1 from activity_log , project where activity_log.bl_id = fl.bl_id and activity_log.fl_id = fl.fl_id and activity_log.project_id = project.project_id and project.project_type = 'ASSESSMENT - HAZMAT')"
}
		
		var bl_id = this.abCbRptMyLocsFlByBldgBlDetail.getFieldValue('bl.bl_id');
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-fl-by-bl-pgrpt.axvw', restriction, parameters);
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptMyLocsRmByBldgBlDetail' panel.
	 */
	abCbRptMyLocsRmByBldgBlDetail_onDoc:function(){
		var restriction = {"abCbRptLocBlDetail_ds":this.abCbRptMyLocsRmByBldgBlDetail.restriction,
				"abCbRptLocFlDetail_ds" : (this.restrictions ? this.restrictions.flRestriction + " AND " : "")
				+ " EXISTS(select 1 from activity_log , project where activity_log.bl_id = fl.bl_id and activity_log.fl_id = fl.fl_id and activity_log.project_id = project.project_id and project.project_type = 'ASSESSMENT - HAZMAT')",
				"abCbRptLocsRmByBldgRm_ds": (this.restrictions ? this.restrictions.rmRestriction + " AND " : "")
				+ "EXISTS(select 1 from activity_log , project where activity_log.bl_id = rm.bl_id and activity_log.fl_id = rm.fl_id and activity_log.rm_id = rm.rm_id  and activity_log.project_id = project.project_id and project.project_type = 'ASSESSMENT - HAZMAT')"
				};
		
		var bl_id = this.abCbRptMyLocsRmByBldgBlDetail.getFieldValue('bl.bl_id');
				
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-rm-by-flandbl-pgrpt.axvw', restriction, parameters);
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptMyLocsFl' panel.
	 */
	abCbRptMyLocsFl_onDoc:function(){
		var restrict = (this.abCbRptMyLocsFl.restriction) ? this.abCbRptMyLocsFl.restriction : "1=1";
		var restriction = {"abCbRptLocFlDetail_ds":restrict};
		
		var consoleRestrictions = View.controllers.get('abCbRptFilter').getSqlRestriction();
		var consolePrintableRestriction = consoleRestrictions.printableRestriction;
		
		var finalPrintableRestriction = null;
		if(consolePrintableRestriction){
			finalPrintableRestriction = consolePrintableRestriction;
		}
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': finalPrintableRestriction
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-fl-pgrpt.axvw', restriction, parameters);
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptMyLocsRm' panel.
	 */
	abCbRptMyLocsRm_onDoc:function(){
		var restrict = (this.abCbRptMyLocsRm.restriction) ? this.abCbRptMyLocsRm.restriction : "1=1";
		var restriction = {"abCbRptLocBlDetail_ds": restrict, "abCbRptLocRmDetail_ds":restrict};
		
		var consoleRestrictions = View.controllers.get('abCbRptFilter').getSqlRestriction();
		var consolePrintableRestriction = consoleRestrictions.printableRestriction;
		
		var finalPrintableRestriction = null;
		if(consolePrintableRestriction){
			finalPrintableRestriction = consolePrintableRestriction;
		}
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': finalPrintableRestriction
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-rms-pgrpt.axvw', restriction, parameters);
	}
  
})

/**
 * Apply console restriction to the tabs panels.
 * 
 * @param restriction
 */
function applyFilterRestriction(restrictions){
	
	abCbRptMyLocs_ctrl.restrictions = restrictions;
	var tabsCtrl = abCbRptMyLocs_ctrl.abCbRptLocDetailsTabs;
	tabsCtrl.selectTab('abCbRptMyLocsBlTab', restrictions.blRestriction);
	abCbRptMyLocs_ctrl.abCbRptMyLocsBlDetail.refresh(restrictions.blRestriction);
	abCbRptMyLocs_ctrl.abCbRptMyLocsFl.refresh(restrictions.flRestriction);
	abCbRptMyLocs_ctrl.abCbRptMyLocsRm.refresh(restrictions.rmRestriction);
	
	tabsCtrl.findTab('abCbRptMyLocsFlByBlTab').enable(false);
	tabsCtrl.findTab('abCbRptMyLocsRmByBlTab').enable(false);

}
/**
 * Event listener for clicking on 'bl_id' from 'abCbRptMyLocsBlDetail' panel 
 * 
 * @param row
 */
function onClickBuilding(row){
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', row['bl.bl_id']);
	
	var flRestriction = " fl.bl_id = '" + row['bl.bl_id'] + "' ";
	if(abCbRptMyLocs_ctrl.restrictions){
		flRestriction += " and " + abCbRptMyLocs_ctrl.restrictions.flRestriction;
	}
	
	var rmRestriction = " rm.bl_id = '" + row['bl.bl_id'] + "' ";
	if(abCbRptMyLocs_ctrl.restrictions){
		rmRestriction += " and " + abCbRptMyLocs_ctrl.restrictions.rmRestriction;
	}
	
	var tabsCtrl = abCbRptMyLocs_ctrl.abCbRptLocDetailsTabs;
	
	//Enable , refresh and select 'abCbRptMyLocsFlByBlTab'
	tabsCtrl.findTab('abCbRptMyLocsFlByBlTab').enable(true);
	tabsCtrl.selectTab('abCbRptMyLocsFlByBlTab', restriction);
	abCbRptMyLocs_ctrl.abCbRptMyLocsFlByBldgBlDetail.refresh(restriction);
	abCbRptMyLocs_ctrl.abCbRptMyLocsFlByBldgFl.refresh(flRestriction);
	
	//Enable and refresh 'abCbRptMyLocsRmByBlTab'
	tabsCtrl.findTab('abCbRptMyLocsRmByBlTab').enable(true);
	abCbRptMyLocs_ctrl.abCbRptMyLocsRmByBldgBlDetail.refresh(restriction);
	abCbRptMyLocs_ctrl.abCbRptMyLocsRmByBldgRm.refresh(rmRestriction);
	
}

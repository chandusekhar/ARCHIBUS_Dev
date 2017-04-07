
var abCbRptLocs_ctrl = View.createController('abCbRptLocs', {

	restrictions:null,
	
	/**
	 * Listener for 'doc' action from 'abCbRptLocsBlDetail' panel.
	 */
	abCbRptLocsBlDetail_onDoc:function(){
		var restrict = (this.abCbRptLocsBlDetail.restriction) ? this.abCbRptLocsBlDetail.restriction : "1=1";
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
	 * Listener for 'doc' action from 'abCbRptLocsFlByBldgBlDetail' panel.
	 */
	abCbRptLocsFlByBldgBlDetail_onDoc:function(){
		var restriction = {"abCbRptLocBlDetail_ds":this.abCbRptLocsFlByBldgBlDetail.restriction,
						   "abCbRptLocFlDetail_ds":this.abCbRptLocsFlByBldgFl.restriction};
		
		var bl_id = this.abCbRptLocsFlByBldgBlDetail.getFieldValue('bl.bl_id');
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-fl-by-bl-pgrpt.axvw', restriction, parameters);
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptLocsRmByBldgBlDetail' panel.
	 */
	abCbRptLocsRmByBldgBlDetail_onDoc:function(){
		var restriction = {"abCbRptLocBlDetail_ds":this.abCbRptLocsRmByBldgBlDetail.restriction,
						   "abCbRptLocsRmByBldgRm_ds":this.abCbRptLocsRmByBldgRm.restriction};
		
		var bl_id = this.abCbRptLocsRmByBldgBlDetail.getFieldValue('bl.bl_id');
				
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true
			};
		
		View.openPaginatedReportDialog('ab-cb-rpt-rm-by-flandbl-pgrpt.axvw', restriction, parameters);
	},
	
	/**
	 * Listener for 'doc' action from 'abCbRptLocsFl' panel.
	 */
	abCbRptLocsFl_onDoc:function(){
		var restrict = (this.abCbRptLocsFl.restriction) ? this.abCbRptLocsFl.restriction : "1=1";
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
	 * Listener for 'doc' action from 'abCbRptLocsRm' panel.
	 */
	abCbRptLocsRm_onDoc:function(){
		var restrict = (this.abCbRptLocsRm.restriction) ? this.abCbRptLocsRm.restriction : "1=1";
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
	
	abCbRptLocs_ctrl.restrictions = restrictions;
	
	var tabsCtrl = abCbRptLocs_ctrl.abCbRptLocDetailsTabs;
	tabsCtrl.selectTab('abCbRptLocsBlTab', restrictions.blRestriction);
	abCbRptLocs_ctrl.abCbRptLocsFl.refresh(restrictions.flRestriction);
	abCbRptLocs_ctrl.abCbRptLocsRm.refresh(restrictions.rmRestriction);
	
	tabsCtrl.findTab('abCbRptLocsFlByBlTab').enable(false);
	tabsCtrl.findTab('abCbRptLocsRmByBlTab').enable(false);
	abCbRptLocs_ctrl.abCbRptLocsRmByBldgRm.show(false);
}
/**
 * Event listener for clicking on 'bl_id' from 'abCbRptLocsBlDetail' panel 
 * 
 * @param row
 */
function onClickBuilding(row){
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', row['bl.bl_id']);
	
	var flRestriction = " fl.bl_id = '" + row['bl.bl_id'] + "' ";
	if(abCbRptLocs_ctrl.restrictions){
		flRestriction += " and " + abCbRptLocs_ctrl.restrictions.flRestriction;
	}
	
	var rmRestriction = " rm.bl_id = '" + row['bl.bl_id'] + "' ";
	if(abCbRptLocs_ctrl.restrictions){
		rmRestriction += " and " + abCbRptLocs_ctrl.restrictions.rmRestriction;
	}
	
	var tabsCtrl = abCbRptLocs_ctrl.abCbRptLocDetailsTabs;
	
	//Enable , refresh and select 'abCbRptLocsFlByBlTab'
	tabsCtrl.findTab('abCbRptLocsFlByBlTab').enable(true);
	tabsCtrl.selectTab('abCbRptLocsFlByBlTab', restriction);
	abCbRptLocs_ctrl.abCbRptLocsFlByBldgFl.refresh(flRestriction);
	
	//Enable and refresh 'abCbRptLocsRmByBlTab'
	tabsCtrl.findTab('abCbRptLocsRmByBlTab').enable(true);
	abCbRptLocs_ctrl.abCbRptLocsRmByBldgBlDetail.refresh(restriction);
	abCbRptLocs_ctrl.abCbRptLocsRmByBldgRm.refresh(rmRestriction);
	
}

/**
 * Event listener for clicking on 'fl_id' from 'abCbRptLocsRmByBldgFl' panel 
 * 
 * @param row
 */
function onClickFloor(row){
	var rmRestriction = " rm.bl_id = '" + row['fl.bl_id'] + "' and rm.fl_id = '" + row['fl.fl_id'] + "'";
	if(abCbRptLocs_ctrl.restrictions){
		rmRestriction += " and " + abCbRptLocs_ctrl.restrictions.rmRestriction;
	}
	abCbRptLocs_ctrl.abCbRptLocsRmByBldgRm.refresh(rmRestriction);
}

/**
 * Obtain a map({title,value}) value by title.
 * @param map
 * @param title
 * @returns map value for the specified title.
 */
function getMapValue(map, title){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			return map[i].value;
		}
	}
}

/**
 * Replace a map({title,value}) value.
 * @param map
 * @param title
 * @param newVal
 * @returns map after replacement
 */
function setMapValue(map, title, newVal){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			map[i].value = newVal;
			return map;
		}
	}
	return map;
}
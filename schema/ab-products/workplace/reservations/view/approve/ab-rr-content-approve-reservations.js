/**
 * The controller is only used for ab-rr-content-reservations.axvw, 
 * it used for initlizing parameters, holding parameters etc.
 * 
 */
var abRCARVController = View.createController('abRrContentApproveRVController', {
	parentTabs: null,
	detailTabs: null,
	roomsPanel: null,
	resourcesPanel: null,
	selectedPanel: null,
	shouldShowAll: false,
	
	afterInitialDataFetch: function() {
		initParameters();
	}
});

/**
 * intialize all parameters, including the restrictions and parameters in the controller.
 */
function initParameters() {
	abRCARVController.parentTabs  = {};
	abRCARVController.detailTabs  = View.panels.get("roomResTabs");
	abRCARVController.detailTabs.addEventListener('afterTabChange', onChangeTab);
	
	abRCARVController.roomsPanel  = View.panels.get("ApproveReportRm");
	abRCARVController.resourcesPanel  = View.panels.get("ApproveReportRes");
	abRCARVController.selectedPanel = abRCARVController.roomsPanel;
	
	initRestriction();
	refreshTabView();
	shouldHasShowAll();
}

/**
 * Refresh the panel in the selected tab.
 * @param {Object} tabPanel roomResTabs
 * @param {Object} selectedTabName 'rooms-approve' / 'resources-approve'
 * @param {Object} newTabName 'rooms-approve' / 'resources-approve'
 */
function onChangeTab(tabPanel, selectedTabName, newTabName) {
	
	switch (selectedTabName) {
		case 'rooms-approve':
		    abRCARVController.roomsPanel.refresh(abRCARVController.parentTabs.res_rmRestriction);
			abRCARVController.selectedPanel = abRCARVController.roomsPanel;
			break;
		case 'resources-approve':
			abRCARVController.resourcesPanel.refresh(abRCARVController.parentTabs.res_rsRestriction);
			abRCARVController.selectedPanel = abRCARVController.resourcesPanel;
			break;
		default:
		    abRCARVController.roomsPanel.refresh(abRCARVController.parentTabs.res_rmRestriction);
			abRCARVController.selectedPanel = abRCARVController.roomsPanel;
	}
}

/**
 * create restrictions according to the user's groups, 
 * and apply it on all tabs (Room and Resources tab).
 * 
 * The restrictions should be created once the user access this page.
 */
function initRestriction() {
	var res_rmRestriction = new Ab.view.Restriction();
	var res_rsRestriction = new Ab.view.Restriction();
	
	//If any of the groups in the User.groups[] array is 'RESERVATION MANAGER' 
	//we don't have to apply any restriction
	if (ABRV_isMemberOfGroup(View.user,'RESERVATION MANAGER') || ABRV_isMemberOfGroup(View.user,'%')) {
		// no restrictions
		
	} else if (ABRV_isMemberOfGroup(View.user,'RESERVATION SERVICE DESK')) {
		// If the current user is a memeber of 'RESERVATION SERVICE DESK', he can see all the reservations
		// that need an approval for which the arrangement or resource doesn't have an approver group
		// assigned or for which he is a member of the assigned approver group.
		res_rmRestriction.addClause("rm_arrange.group_name", "", "IS NULL", ")AND(");
		res_rsRestriction.addClause("resources.group_name", "", "IS NULL", ")AND(");
		
		res_rmRestriction.addClause("rm_arrange.group_name", View.user.groups, "IN", "OR");
		res_rsRestriction.addClause("resources.group_name", View.user.groups, "IN", "OR");
	
		// Add a dummy restriction to close the OR of the two restrictions above.
		res_rmRestriction.addClause("reserve_rm.rm_id", "", "IS NOT NULL", ")AND(");
		res_rsRestriction.addClause("reserve_rs.resource_id", "", "IS NOT NULL", ")AND(");
		
	} else {
		// If 'RESERVATION APPROVER' or no group he can see all the reservations that
		// need an approval for which he is a member of the assigned approver group.
		res_rmRestriction.addClause("rm_arrange.group_name", View.user.groups, "IN");
		res_rsRestriction.addClause("resources.group_name", View.user.groups, "IN");
	}
	
	if (!isShowAllChecked()) {
		res_rmRestriction.addClause("reserve_rm.date_start", ABRV_getCurrentDate(), "&gt;=");
		res_rsRestriction.addClause("reserve_rs.date_start", ABRV_getCurrentDate(), "&gt;=");
	}
	
	abRCARVController.parentTabs.res_rmRestriction = res_rmRestriction ;
	abRCARVController.parentTabs.res_rsRestriction = res_rsRestriction ;
	
}

/**
 * refresh the tab.
 */
function refreshTabView() {
	// Show by default the first editable report
	switch(abRCARVController.detailTabs.selectedTabName) {
		case 'rooms-approve':
		    abRCARVController.roomsPanel.refresh(abRCARVController.parentTabs.res_rmRestriction);
			break;
		case 'resources-approve':
			abRCARVController.resourcesPanel.refresh(abRCARVController.parentTabs.res_rsRestriction);
			break;
		default:
		    abRCARVController.roomsPanel.refresh(abRCARVController.parentTabs.res_rmRestriction);
	}
}

/**
 * The function detect whether current user is member of "Reservation Manager", then disable or enable the show all check box button.
 * Added by ZY 2008-04-15
 */
function shouldHasShowAll(){
	abRCARVController.shouldShowAll = false;
	if (View.user.isMemberOfGroup('RESERVATION MANAGER') || View.user.isMemberOfGroup('%')){
		abRCARVController.shouldShowAll = true;
	}
	
	if (!abRCARVController.shouldShowAll) {
		var showAll = $("show_all_pending_approval");
		if (showAll) {
			showAll.disabled = true;
		}
		return false;
	}
	return true;
}

/**
 * It initializes the values of the console in the JSON to be able to apply the criteria search
 *
 */
function onSearch() {
	
	// Check the security groups the user belongs to, in order to restrict the list of reservations 
    // that must be showed
    initRestriction();
    
    var panel = View.panels.get("requestPanel");
    
	var approveReservation = {};
	// Update the JSObjects values with the selected information in the console fields
	approveReservation.ctry_id = panel.getFieldValue("bl.ctry_id");
	approveReservation.bl_id = panel.getFieldValue("reserve_rm.bl_id");
	approveReservation.fl_id = panel.getFieldValue("reserve_rm.fl_id");
	approveReservation.rm_id = panel.getFieldValue("reserve_rm.rm_id");
	approveReservation.site_id = panel.getFieldValue("bl.site_id");
	approveReservation.config_id = panel.getFieldValue("reserve_rm.config_id");
	approveReservation.rm_arrange_type_id = panel.getFieldValue("reserve_rm.rm_arrange_type_id");
	approveReservation.user_created_by = panel.getFieldValue("reserve.user_created_by");
	approveReservation.user_requested_by = panel.getFieldValue("reserve.user_requested_by");
	approveReservation.user_requested_for = panel.getFieldValue("reserve.user_requested_for");
	approveReservation.date_start = panel.getFieldValue("reserve.date_start");
	approveReservation.time_start = ABRV_formatTime(panel.getFieldValue("reserve.time_start"));
	approveReservation.time_end = ABRV_formatTime(panel.getFieldValue("reserve.time_end"));
	approveReservation.resource_id = panel.getFieldValue("resources.resource_id");
	approveReservation.resource_std = panel.getFieldValue("resource_std.resource_std");
	
	// Refres approveReservation in windows with new values.
	abRCARVController.parentTabs.approveReservation = approveReservation;		
	
	// Create the restrictions to apply with the values selected by the user
	applySearchRestrictions();
	
	// refresh Tab.
	refreshTabView();
}

/**
 * The function must clear all the console value fields, all the existing restrictions 
 * for the editable report, and the editable report results list.
 */
function onClear() {
	var panel = View.panels.get("requestPanel");
	
	//Clear all the console value fields
	panel.setInputValue("bl.ctry_id", "", "");
	panel.setInputValue("reserve_rm.bl_id", "", "");
	panel.setInputValue("reserve_rm.fl_id", "", "");
	panel.setInputValue("reserve_rm.rm_id", "", "");
	panel.setInputValue("bl.site_id", "", "");
	panel.setInputValue("reserve_rm.config_id", "", "");
	panel.setInputValue("reserve_rm.rm_arrange_type_id", "", "");
	panel.setInputValue("reserve.user_created_by", "", "");
	panel.setInputValue("reserve.user_requested_by", "", "");
	panel.setInputValue("reserve.user_requested_for", "", "");
	panel.setInputValue("reserve.date_start", "", "");
	panel.setInputValue("reserve.time_start", "", "");
	panel.setInputValue("reserve.time_end", "", "");
	
	clearShowAllCheckBox();

	panel.setInputValue("resources.resource_id", "", "");
	panel.setInputValue("resource_std.resource_std", "", "");
	
	// Check the security groups the user belongs to, in order to restrict the list of reservations 
    // that must be showed
    initRestriction();
	
	refreshTabView();	
}


/**
 * It applies the JSON's criteria in the view.
 * more, conver the JSON's criteria to Object Ab.view.Restriction()
 * and apply it on the tab.
 */
function applySearchRestrictions() {

   	var approveReservation = abRCARVController.parentTabs.approveReservation;
   	
	var rmrest = new Ab.view.Restriction();
	var rsrest = new Ab.view.Restriction();
	
    // it create restriction with console criteri
	if (approveReservation.ctry_id != '') {  
   		rmrest.addClause("bl.ctry_id", approveReservation.ctry_id, "=");
		rsrest.addClause("bl.ctry_id", approveReservation.ctry_id, "=");
	}	
	if (approveReservation.bl_id != '') {  
		rmrest.addClause("reserve_rm.bl_id", approveReservation.bl_id, "=");
		rsrest.addClause("reserve_rs.bl_id", approveReservation.bl_id, "=");
	}	
	
	if (approveReservation.fl_id != '') {
		rmrest.addClause("reserve_rm.fl_id", approveReservation.fl_id, "=");
		rsrest.addClause("reserve_rs.fl_id", approveReservation.fl_id, "=");
	}
		
	if (approveReservation.rm_id != '') {
		rmrest.addClause("reserve_rm.rm_id", approveReservation.rm_id, "=");
		rsrest.addClause("reserve_rs.rm_id", approveReservation.rm_id, "=");
	}	
	
	if (approveReservation.site_id != '') {
		rmrest.addClause("bl.site_id", approveReservation.site_id, "=");
		rsrest.addClause("bl.site_id", approveReservation.site_id, "=");
	}	
	
	if (approveReservation.config_id != '') {
		rmrest.addClause("reserve_rm.config_id", approveReservation.config_id, "=");
	}	
	
	if (approveReservation.rm_arrange_type_id != '') {
		rmrest.addClause("reserve_rm.rm_arrange_type_id", approveReservation.rm_arrange_type_id, "=");
	}	
	
	if (approveReservation.user_created_by != '') {  
   		rmrest.addClause("reserve.user_created_by", approveReservation.user_created_by, "=");
		rsrest.addClause("reserve.user_created_by", approveReservation.user_created_by, "=");
	}	
	
	if (approveReservation.user_requested_by != '') {  
		rmrest.addClause("reserve.user_requested_by", approveReservation.user_requested_by, "=");
		rsrest.addClause("reserve.user_requested_by", approveReservation.user_requested_by, "=");
	}	
	
	if (approveReservation.user_requested_for != '') {
		rmrest.addClause("reserve.user_requested_for", approveReservation.user_requested_for, "=");
		rsrest.addClause("reserve.user_requested_for", approveReservation.user_requested_for, "=");
	}
		
	if (!isShowAllChecked()) {
		rmrest.addClause("reserve_rm.date_start", ABRV_getCurrentDate(), "&gt;=");
		rsrest.addClause("reserve_rs.date_start", ABRV_getCurrentDate(), "&gt;=");
	}
	
	if(approveReservation.date_start != ''){
		rmrest.addClause("reserve_rm.date_start", approveReservation.date_start, "=");
		rsrest.addClause("reserve_rs.date_start", approveReservation.date_start, "=");
	}
	
	if (approveReservation.time_start != '') {
		rmrest.addClause("reserve_rm.time_start", approveReservation.time_start, "&gt;=");
		rsrest.addClause("reserve_rs.time_start", approveReservation.time_start, "&gt;=");
	}	
	
	if (approveReservation.time_end != '') {
		rmrest.addClause("reserve_rm.time_end", approveReservation.time_end, "&lt;=");
		rsrest.addClause("reserve_rs.time_end", approveReservation.time_end, "&lt;=");
	}	
	
	
	if (approveReservation.resource_id != '') {
		rsrest.addClause("reserve_rs.resource_id", approveReservation.resource_id, "=");
	}
		
	var rsrest_2 = new Ab.view.Restriction();
	if (approveReservation.resource_std != '') {
		rsrest_2.addClause("reserve_rs.resource_id", getResourceIdsByResStd(approveReservation.resource_std), "IN");
	}
	
	// Once we have the restrictions to apply to the two editable reports
	// Apply the restriction rmrest to the results for room reservations report tab
	abRCARVController.parentTabs.res_rmRestriction.addClauses(rmrest, true);

    // Apply the restriction rsrest to the results for resource reservations report tab
    abRCARVController.parentTabs.res_rsRestriction.addClauses(rsrest, true);
    abRCARVController.parentTabs.res_rsRestriction.addClauses(rsrest_2, true);
}

/**
 * return the related the array of resource ids from 
 * resources according to the parameter resource standard.
 * 
 * @param {Object} resStd resource standard
 */
function getResourceIdsByResStd(resStd) {
	var results = new Array();
	 var parameter0 = {
        tableName: 'resources',
        fieldNames: toJSON(['resources.resource_id']),
        restriction: toJSON({
            'resources.resource_std': resStd
        })
    };
    //when not all work request were closed out of the same work order, 
    //the closed work request is still in the wr table. 
    var resources = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter0);
    if (resources.code == 'executed') {
        if (resources.data.records.length > 0) {
            for (var i=0; i < resources.data.records.length; i++) { 
            	results.push(resources.data.records[i]['resources.resource_id']);
            }
        }
   } else {
     View.showMessage(resources.message);
   }
   return results;
}

/**
 * The function clear the show all check box button when it is showen.
 * Added by ZY 2008-04-15
 */
function clearShowAllCheckBox(){
	if(abRCARVController.shouldShowAll){
		var showAll = $("show_all_pending_approval");
		showAll.checked = false;
	}
}

/**
 * The function return whether the show all check box button is checked.
 * Added by ZY 2008-04-15
 */
function isShowAllChecked() {
	if(abRCARVController.shouldShowAll){
		var showAll = $("show_all_pending_approval");
		if(showAll)
			return showAll.checked;
	}
	return false;
}


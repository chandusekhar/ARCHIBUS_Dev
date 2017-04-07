var abGrMoAppCtrl = View.createController('abGrMoApp_ctrl', {
	
    report_ab_group_move_approve_pr_afterRefresh: function(){
		hideElements();
    	replaceNewLinesInDivFields(this.report_ab_group_move_approve_pr);
    },


	//get restriction from Moves panel
	
	getRestriction:function(panel){
		var rooms = "";
        var employees = "";
        
        // get em_id from grid rows if mo_type is Employee or Room 
        for (i = 0; i < panel.rows.length; i++) {
            var row = panel.rows[i];
            var mo_type = row['mo.mo_type'];
            var em_id = row['mo.em_id'];
            
            if (mo_type == 'Employee' || mo_type == 'Employee Leaving' || mo_type == 'New Hire') {
                if (employees == "") {
                    employees += "('" + em_id + "'";
                }
                else {
                    employees += " ,'" + em_id + "'";
                }
                
            }
            
            if (mo_type == 'Room') {
                if (rooms == "") {
                    rooms += "('" + em_id + "'";
                }
                else {
                    rooms += " ,'" + em_id + "'";
                }
                
            }
        }
        
        // construct the restriction based on em_id collected from grid rows
		var restriction = "";
        if (employees != "") {
			restriction += " em_id in " + employees + ")";
			if (rooms != "") {
				restriction += " or from_bl_id ${sql.concat}'|'${sql.concat}from_fl_id${sql.concat}'|'${sql.concat}from_rm_id in " + rooms + ")";
				
			}
			
		}
		else {
			if (rooms != "") {
				restriction += " from_bl_id ${sql.concat}'|'${sql.concat}from_fl_id${sql.concat}'|'${sql.concat}from_rm_id in " + rooms + ")";
			}
		}
		return restriction;
		
	}
    
});


function showAction(){

    var restriction = View.panels.get('form_ab_group_move_approve_console').getRecord().toRestriction();
    View.panels.get('grid_ab_group_move_approve').refresh(restriction);
    
	hideDetailsPanels();
}


// hide details panels
function hideDetailsPanels(){
	//hide panels
	View.panels.get('report_ab_group_move_approve_pr').show(false);
    View.panels.get('grid_ab_group_move_approve_mo_em').show(false);
	View.panels.get('grid_ab_group_move_approve_mo_hr').show(false);
	View.panels.get('grid_ab_group_move_approve_mo_lv').show(false);
	View.panels.get('grid_ab_group_move_approve_mo_eq').show(false);
	View.panels.get('grid_ab_group_move_approve_mo_as').show(false);
	View.panels.get('grid_ab_group_move_approve_mo_rm').show(false);
	View.panels.get('rep_abMoGroupListMoEq_list').show(false);
	View.panels.get('rep_abMoGroupListMoTa_list').show(false);
	
	//hide tabs
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_employee_tab' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_new_hire_tab' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_leaving_tab' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_equipment_tab' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_asset_tab' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_room_tab' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_moeq' , false);
	abGrMoAppCtrl.moves_tabsFrame.showTab('abGrMoApp_mota' , false);
	
	
}

function hideApproveRejectButtons(){
	View.panels.get('report_ab_group_move_approve_pr').enableButton("approve", false);
	View.panels.get('report_ab_group_move_approve_pr').enableButton("reject", false);
}

// after refresh listener for report_ab_group_move_approve_pr panel
function hideElements(){
    var panel = View.panels.get('report_ab_group_move_approve_pr');
    var app_mgr1 = panel.getFieldValue("project.apprv_mgr1");
	var status_mgr1 = panel.getFieldValue("project.apprv_mgr1_status");
	var app_mgr2 = panel.getFieldValue("project.apprv_mgr2");
	var status_mgr2 = panel.getFieldValue("project.apprv_mgr2_status");
    var app_mgr3 = panel.getFieldValue("project.apprv_mgr3");
	var status_mgr3 = panel.getFieldValue("project.apprv_mgr3_status");
	
	// hide managers fields if them are empty 
	/*
	 * 06/08/2010 IOAN KB 3027892
	 * hide rows and keep default values for hidden fields
	 */
	if(!valueExistsNotEmpty(app_mgr1)){
		panel.fields.get("project.apprv_mgr1").dom.parentNode.parentNode.style.display = 'none';
		panel.fields.get("project.apprv_mgr1_status").dom.parentNode.parentNode.style.display = 'none';
		panel.fields.get("project.date_app_mgr1").dom.parentNode.parentNode.style.display = 'none';
	}
	if(!valueExistsNotEmpty(app_mgr2)){
		panel.fields.get("project.apprv_mgr2").dom.parentNode.parentNode.style.display = 'none';
		panel.fields.get("project.apprv_mgr2_status").dom.parentNode.parentNode.style.display = 'none';
		panel.fields.get("project.date_app_mgr2").dom.parentNode.parentNode.style.display = 'none';
	}
	if(!valueExistsNotEmpty(app_mgr3)){
		panel.fields.get("project.apprv_mgr3").dom.parentNode.parentNode.style.display = 'none';
		panel.fields.get("project.apprv_mgr3_status").dom.parentNode.parentNode.style.display = 'none';
		panel.fields.get("project.date_app_mgr3").dom.parentNode.parentNode.style.display = 'none';
	}

	//hide actions buttons	
	if (checkMgr(app_mgr1, status_mgr1)&&checkMgr(app_mgr2,status_mgr2)&&checkMgr(app_mgr3,status_mgr3)) {
		panel.actions.get('approve').show(false);
		panel.actions.get('reject').show(false);
	}else{
		panel.actions.get('approve').show(true);
		panel.actions.get('reject').show(true);
	} 
    
}

//returns true for hidding actions buttons - if the approving manager is the user  of the application and status is not 'NR'
function checkMgr(manager, status){
	var user = View.user.employee.id;
	
	if(user != manager){
		return true;
	}else{
		if(status !='NR')
			return true;
	}
	return false;
}

/**
 * used for paginated report as command function 
 * 
 * @param {Object} type - values 'group', 'single', 'scenario' 
 * @param {Object} commandObject
 */
function onPaginatedReport(type, commandObject){
	var panel = commandObject.getParentPanel();
	var projectId = "";
	var moveId = "";
	
	if(type == 'group'){
		projectId = panel.getFieldValue('project.project_id');
	}else if(type == 'single'){
		moveId = panel.getFieldValue('mo.mo_id');
	}else if(type == 'scenario'){
		var isAssigned = false;
		panel.gridRows.each(function(row){
			if(valueExistsNotEmpty(row.getRecord().getValue('mo_scenario_em.to_rm_id'))){
				isAssigned = true;
			}
		});
		if(panel.gridRows.length > 0 && isAssigned){
			var row = panel.gridRows.get(0);
			moveId = row.getRecord().getValue('mo_scenario_em.scenario_id');
			projectId = row.getRecord().getValue('mo_scenario_em.project_id');
		}else{
			View.showMessage(getMessage('error_no_data_rpt'));
			return;
		}
	}
	
	var result = Workflow.callMethod('AbMoveManagement-MoveService-onPaginatedReport', type, projectId, moveId);

    if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
		result.data = eval('(' + result.jsonExpression + ')');
		var jobId = result.data.jobId;
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	}
}

//show Moves panels


function showMoves(row){
	var restr = new Ab.view.Restriction(row.restriction);
	
	restr.addClause('mo.mo_type', 'Employee', '=');
	View.panels.get('grid_ab_group_move_approve_mo_em').refresh(restr);
	View.panels.get('grid_ab_group_move_approve_mo_em').removeSorting();
	showTab('abGrMoApp_employee_tab', abGrMoAppCtrl.grid_ab_group_move_approve_mo_em);
	
	restr.addClause('mo.mo_type', 'New Hire', '=', true);
	View.panels.get('grid_ab_group_move_approve_mo_hr').refresh(restr);
	View.panels.get('grid_ab_group_move_approve_mo_hr').removeSorting();
	showTab('abGrMoApp_new_hire_tab', abGrMoAppCtrl.grid_ab_group_move_approve_mo_hr);
	
	restr.addClause('mo.mo_type', 'Leaving', '=', true);
	View.panels.get('grid_ab_group_move_approve_mo_lv').refresh(restr);
	View.panels.get('grid_ab_group_move_approve_mo_lv').removeSorting();
	showTab('abGrMoApp_leaving_tab', abGrMoAppCtrl.grid_ab_group_move_approve_mo_lv);
	
	restr.addClause('mo.mo_type', 'Equipment', '=', true);
	View.panels.get('grid_ab_group_move_approve_mo_eq').refresh(restr);
	View.panels.get('grid_ab_group_move_approve_mo_eq').removeSorting();
	showTab('abGrMoApp_equipment_tab', abGrMoAppCtrl.grid_ab_group_move_approve_mo_eq);
	
	restr.addClause('mo.mo_type', 'Asset', '=', true);
	View.panels.get('grid_ab_group_move_approve_mo_as').refresh(restr);
	View.panels.get('grid_ab_group_move_approve_mo_as').removeSorting();
	showTab('abGrMoApp_asset_tab', abGrMoAppCtrl.grid_ab_group_move_approve_mo_as);
	
	restr.addClause('mo.mo_type', 'Room', '=', true);
	View.panels.get('grid_ab_group_move_approve_mo_rm').refresh(restr);
	View.panels.get('grid_ab_group_move_approve_mo_rm').removeSorting();
	showTab('abGrMoApp_room_tab', abGrMoAppCtrl.grid_ab_group_move_approve_mo_rm);
	
	//refresh associated assets panels (Equipment and Furniture)
	var restrAssets = new Ab.view.Restriction();
	restrAssets.addClause('mo.project_id' ,row.restriction['project.project_id'], '=' ); 
	
	abGrMoAppCtrl.rep_abMoGroupListMoEq_list.refresh(restrAssets);
	abGrMoAppCtrl.rep_abMoGroupListMoTa_list.refresh(restrAssets);
	
	
	showTab('abGrMoApp_moeq', abGrMoAppCtrl.rep_abMoGroupListMoEq_list);
	showTab('abGrMoApp_mota', abGrMoAppCtrl.rep_abMoGroupListMoTa_list);
	
}

/**
 * Show the tab if the grid panel from the tab has records and add records count to tab title.
 * Else hide the tab
 * 
 * @param {Object} tabName
 * @param {Object} gridPanel
 */
function showTab(tabName, gridPanel){
	var tabsContainer = abGrMoAppCtrl.moves_tabsFrame;
	if(gridPanel.rows.length>0){
		tabsContainer.showTab(tabName, true);
		var tab = tabsContainer.findTab(tabName);
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else{
		tabsContainer.showTab(tabName, false);
	}
	
}


function onApproveMove(cmdContext){
	var form = cmdContext.command.getParentPanel();
	var project_id = form.getFieldValue("project.project_id");
	var apprv_mgr1 = form.getFieldValue("project.apprv_mgr1");
	var apprv_mgr2 = form.getFieldValue("project.apprv_mgr2");
	var apprv_mgr3 = form.getFieldValue("project.apprv_mgr3");
	try{
		var result = Workflow.callMethod("AbMoveManagement-MoveService-approveGroupMove", project_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
		return true;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}

function onRejectMove(cmdContext){
	var form = cmdContext.command.getParentPanel();
	var project_id = form.getFieldValue("project.project_id");
	var apprv_mgr1 = form.getFieldValue("project.apprv_mgr1");
	var apprv_mgr2 = form.getFieldValue("project.apprv_mgr2");
	var apprv_mgr3 = form.getFieldValue("project.apprv_mgr3");
	try{
		var result = Workflow.callMethod("AbMoveManagement-MoveService-rejectGroupMove", project_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
		return true;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}


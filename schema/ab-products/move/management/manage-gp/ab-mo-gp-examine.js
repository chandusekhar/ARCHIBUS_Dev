var abGrMoExamineCtrl = View.createController('abGrMoExamine_ctrl', {

    report_ab_group_move_examine_pr_afterRefresh: function(){
    	replaceNewLinesInDivFields(this.report_ab_group_move_examine_pr);
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
	
	var restriction = getFieldsRestriction(View.panels.get('form_ab_group_move_examine_console'));
	View.panels.get('grid_ab_group_move_examine').refresh(restriction);
	//hide panels
	View.panels.get('report_ab_group_move_examine_pr').show(false);
	View.panels.get('grid_ab_group_move_examine_mo_em').show(false);
	View.panels.get('grid_ab_group_move_examine_mo_hr').show(false);
	View.panels.get('grid_ab_group_move_examine_mo_lv').show(false);
	View.panels.get('grid_ab_group_move_examine_mo_eq').show(false);
	View.panels.get('grid_ab_group_move_examine_mo_as').show(false);
	View.panels.get('grid_ab_group_move_examine_mo_rm').show(false);
	View.panels.get('grid_ab_group_move_examine_ac').show(false);
	View.panels.get('rep_abMoGroupListMoEq_list').show(false);
	View.panels.get('rep_abMoGroupListMoTa_list').show(false);
	
	
	//hide tabs
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_employee_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_new_hire_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_leaving_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_equipment_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_asset_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_room_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGrMoExamine_action_tab' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGroupMoveExamine_moeq' , false);
	abGrMoExamineCtrl.moves_tabsFrame.showTab('abGroupMoveExamine_mota' , false);
}

function showDetails(row){
	var restrPrj = new Ab.view.Restriction(row.restriction);
	
	View.panels.get('report_ab_group_move_examine_pr').refresh(restrPrj);
	View.panels.get('grid_ab_group_move_examine_ac').refresh(restrPrj);
	
	var restrEm = new Ab.view.Restriction(row.restriction);
	restrEm.addClause('mo.mo_type', 'Employee', '=');
	View.panels.get('grid_ab_group_move_examine_mo_em').refresh(restrEm);
	showTab('abGrMoExamine_employee_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_mo_em);
	
	var restrHr = new Ab.view.Restriction(row.restriction);
	restrHr.addClause('mo.mo_type', 'New Hire', '=', true);
	View.panels.get('grid_ab_group_move_examine_mo_hr').refresh(restrHr);
	showTab('abGrMoExamine_new_hire_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_mo_hr);
	
	var restrLeaving = new Ab.view.Restriction(row.restriction);
	restrLeaving.addClause('mo.mo_type', 'Leaving', '=', true);
	View.panels.get('grid_ab_group_move_examine_mo_lv').refresh(restrLeaving);
	showTab('abGrMoExamine_leaving_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_mo_lv);
	
	var restrEq = new Ab.view.Restriction(row.restriction);
	restrEq.addClause('mo.mo_type', 'Equipment', '=', true);
	View.panels.get('grid_ab_group_move_examine_mo_eq').refresh(restrEq);
	showTab('abGrMoExamine_equipment_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_mo_eq);
	
	var restrAsset = new Ab.view.Restriction(row.restriction);
	restrAsset.addClause('mo.mo_type', 'Asset', '=', true);
	View.panels.get('grid_ab_group_move_examine_mo_as').refresh(restrAsset);
	showTab('abGrMoExamine_asset_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_mo_as);
	
	var restrRm = new Ab.view.Restriction(row.restriction);
	restrRm.addClause('mo.mo_type', 'Room', '=', true);
	View.panels.get('grid_ab_group_move_examine_mo_rm').refresh(restrRm);
	showTab('abGrMoExamine_room_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_mo_rm);
	
	
	showTab('abGrMoExamine_action_tab' ,abGrMoExamineCtrl.grid_ab_group_move_examine_ac);
	
	
	
	//refresh associated assets panels (Equipment and Furniture)
	var restrAssets = new Ab.view.Restriction();
	restrAssets.addClause('mo.project_id' ,row.restriction['project.project_id'], '=' ); 
	
	abGrMoExamineCtrl.rep_abMoGroupListMoEq_list.refresh(restrAssets);
	abGrMoExamineCtrl.rep_abMoGroupListMoTa_list.refresh(restrAssets);
	
	showTab('abGroupMoveExamine_moeq' ,abGrMoExamineCtrl.rep_abMoGroupListMoEq_list);
	showTab('abGroupMoveExamine_mota' ,abGrMoExamineCtrl.rep_abMoGroupListMoTa_list);
	
}

/**
 * Show the tab if the grid panel from the tab has records and add records count to tab title.
 * Else hide the tab
 * 
 * @param {Object} tabName
 * @param {Object} gridPanel
 */
function showTab(tabName, gridPanel){
	var tabsContainer = abGrMoExamineCtrl.moves_tabsFrame;
	if(gridPanel.rows.length>0){
		tabsContainer.showTab(tabName, true);
		var tab = tabsContainer.findTab(tabName);
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else{
		tabsContainer.showTab(tabName, false);
	}
	
}

function getFieldsRestriction(console){
	var restriction = new Ab.view.Restriction();
	var project_id = console.getFieldValue('project.project_id');
	if( valueExistsNotEmpty(project_id)){
		restriction.addClause('project.project_id', '%'+project_id+'%', 'LIKE');
	}
	var status = console.getFieldValue('project.status');
	if(valueExistsNotEmpty(status)){
		restriction.addClause('project.status', status, '=');
	}
	var requestor = console.getFieldValue('project.requestor');
	if(valueExistsNotEmpty(requestor)){
		restriction.addClause('project.requestor', requestor, '=');
	}

	var proj_mgr = console.getFieldValue('project.proj_mgr');
	if(valueExistsNotEmpty(proj_mgr)){
		restriction.addClause('project.proj_mgr', proj_mgr, '=');
	}
	
	var dv_id = console.getFieldValue('project.dv_id');
	if(valueExistsNotEmpty(dv_id)){
		restriction.addClause('project.dv_id', dv_id, '=');
	}
	
	var dp_id = console.getFieldValue('project.dp_id');
	if(valueExistsNotEmpty(dp_id)){
		restriction.addClause('project.dp_id', dp_id, '=');
	}
	var date_requested = console.getFieldValue('project.date_requested');
	if(valueExistsNotEmpty(date_requested)){
		restriction.addClause('project.date_requested', date_requested, '>=');
	}

	var date_end = console.getFieldValue('project.date_end');
	if(valueExistsNotEmpty(date_end)){
		restriction.addClause('project.date_requested', date_end, '<', false);
	}

	var date_commence_work = console.getFieldValue('project.date_commence_work');
	if(valueExistsNotEmpty(date_commence_work)){
		restriction.addClause('project.date_commence_work', date_commence_work, '>=');
	}
	
	var date_target_end = console.getFieldValue('project.date_target_end');
	if(valueExistsNotEmpty(date_target_end)){
		restriction.addClause('project.date_commence_work', date_target_end, '<', false);
	}
	return restriction;
}

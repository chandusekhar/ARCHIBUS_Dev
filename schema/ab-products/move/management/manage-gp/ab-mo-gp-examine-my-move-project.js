var abExamMyMoPr_ctrl = View.createController('abExamMyMoPr_ctrl', {

    report_ab_examine_my_move_project_pr_afterRefresh: function(){
    	replaceNewLinesInDivFields(this.report_ab_examine_my_move_project_pr);
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



//show Moves panels


function showMoves(row){
	var restr = new Ab.view.Restriction(row.restriction);
	
	restr.addClause('mo.mo_type', 'Employee', '=');
	View.panels.get('grid_ab_examine_my_move_project_mo_em').refresh(restr);
	View.panels.get('grid_ab_examine_my_move_project_mo_em').removeSorting();
	showTab('abExamMyMoPr_employee_tab', abExamMyMoPr_ctrl.grid_ab_examine_my_move_project_mo_em);
	
	restr.addClause('mo.mo_type', 'New Hire', '=', true);
	View.panels.get('grid_ab_examine_my_move_project_mo_hr').refresh(restr);
	View.panels.get('grid_ab_examine_my_move_project_mo_hr').removeSorting();
	showTab('abExamMyMoPr_new_hire_tab', abExamMyMoPr_ctrl.grid_ab_examine_my_move_project_mo_hr);
	
	restr.addClause('mo.mo_type', 'Leaving', '=', true);
	View.panels.get('grid_ab_examine_my_move_project_mo_lv').refresh(restr);
	View.panels.get('grid_ab_examine_my_move_project_mo_lv').removeSorting();
	showTab('abExamMyMoPr_leaving_tab', abExamMyMoPr_ctrl.grid_ab_examine_my_move_project_mo_lv);
	
	restr.addClause('mo.mo_type', 'Equipment', '=', true);
	View.panels.get('grid_ab_examine_my_move_project_mo_eq').refresh(restr);
	View.panels.get('grid_ab_examine_my_move_project_mo_eq').removeSorting();
	showTab('abExamMyMoPr_equipment_tab', abExamMyMoPr_ctrl.grid_ab_examine_my_move_project_mo_eq);
	
	restr.addClause('mo.mo_type', 'Asset', '=', true);
	View.panels.get('grid_ab_examine_my_move_project_mo_as').refresh(restr);
	View.panels.get('grid_ab_examine_my_move_project_mo_as').removeSorting();
	showTab('abExamMyMoPr_asset_tab', abExamMyMoPr_ctrl.grid_ab_examine_my_move_project_mo_as);
	
	restr.addClause('mo.mo_type', 'Room', '=', true);
	View.panels.get('grid_ab_examine_my_move_project_mo_rm').refresh(restr);
	View.panels.get('grid_ab_examine_my_move_project_mo_rm').removeSorting();
	showTab('abExamMyMoPr_room_tab', abExamMyMoPr_ctrl.grid_ab_examine_my_move_project_mo_rm);
	
	//refresh associated assets panels (Equipment and Furniture)
	var restrAssets = new Ab.view.Restriction();
	restrAssets.addClause('mo.project_id' ,row.restriction['project.project_id'], '=' ); 
	
	abExamMyMoPr_ctrl.rep_abMoGroupListMoEq_list.refresh(restrAssets);
	abExamMyMoPr_ctrl.rep_abMoGroupListMoTa_list.refresh(restrAssets);
	
	showTab('abExamMyMoPr_moeq', abExamMyMoPr_ctrl.rep_abMoGroupListMoEq_list);
	showTab('abExamMyMoPr_mota', abExamMyMoPr_ctrl.rep_abMoGroupListMoTa_list);
	
	
}

/**
 * Show the tab if the grid panel from the tab has records and add records count to tab title.
 * Else hide the tab
 * 
 * @param {Object} tabName
 * @param {Object} gridPanel
 */
function showTab(tabName, gridPanel){
	var tabsContainer = abExamMyMoPr_ctrl.moves_tabsFrame;
	if(gridPanel.rows.length>0){
		tabsContainer.showTab(tabName, true);
		var tab = tabsContainer.findTab(tabName);
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else{
		tabsContainer.showTab(tabName, false);
	}
	
}

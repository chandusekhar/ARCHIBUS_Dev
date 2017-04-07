var abMoGroupApproveFormCtrl = View.createController('abMoGroupApproveForm_ctrl', {
	afterInitialDataFetch: function(){
		if(this.view.restriction) {
			this.report_abMoGroupApproveForm_pr.addParameter("projectId", this.view.restriction.clauses[0].value);
			this.report_abMoGroupApproveForm_pr.refresh();
			showMoves(this.view.restriction);
		}
	},

    report_abMoGroupApproveForm_pr_afterRefresh: function(){
		hideElements();
		//KB 3047263 field layout was changed from core, this function is no longer required 
 //   	replaceNewLinesInDivFields(this.report_abMoGroupApproveForm_pr);
    },


    grid_abMoGroupApproveForm_mo_em_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupApproveForm_em_eq , this.grid_abMoGroupApproveForm_em_ta,this.getRestriction(this.grid_abMoGroupApproveForm_mo_em));
    },
	
	 grid_abMoGroupApproveForm_mo_hr_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupApproveForm_hr_eq , this.grid_abMoGroupApproveForm_hr_ta,this.getRestriction(this.grid_abMoGroupApproveForm_mo_hr));
    },
	
	 grid_abMoGroupApproveForm_mo_lv_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupApproveForm_lv_eq , this.grid_abMoGroupApproveForm_lv_ta,this.getRestriction(this.grid_abMoGroupApproveForm_mo_lv));
    },
	
	 grid_abMoGroupApproveForm_mo_rm_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupApproveForm_rm_eq , this.grid_abMoGroupApproveForm_rm_ta,this.getRestriction(this.grid_abMoGroupApproveForm_mo_rm));
    },
	
	
	refreshAssesmentsPanels:function(eq_panel , ta_panel, restriction){

		// refresh Equipments and Furniture panels if the restriction is not empty
		if(restriction !=""){
			var project_id = this.report_abMoGroupApproveForm_pr.getFieldValue("project.project_id");
			eq_panel.refresh(restriction + " and exists (select 1 from mo where mo.mo_id = mo_eq.mo_id and mo.project_id='"+project_id+"')");
			ta_panel.refresh(restriction+ " and exists (select 1 from mo where mo.mo_id = mo_ta.mo_id and mo.project_id='"+project_id+"')");
		}else{
			eq_panel.show(false);
			ta_panel.show(false);
		} 
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


function replaceNewLinesInDivFields(form, changeColor){
	var fields = ['project.description','project.comments'];
	
	for(var i=0; i < fields.length; i++) {
		var fieldName = fields[i];
		if (form.fields.get(fieldName).fieldDef.readOnly
				&& form.getFieldElement(fieldName)
				&& form.getFieldElement(fieldName).nextSibling) {
			if (form.getFieldValue(fieldName) != "") {
				form.getFieldElement(fieldName).nextSibling.innerHTML = form.getFieldValue(fieldName).replace(/\n/g, "<BR/>");
			}
			else {
				// for Firefox we must have a new line in the DIV in order to have the same height as the field's label
				form.getFieldElement(fieldName).nextSibling.innerHTML = "<BR/>";
			}	
			form.getFieldElement(fieldName).nextSibling.style.overflow = "visible";
			if(changeColor != false) {
				form.getFieldElement(fieldName).nextSibling.style.backgroundColor = "white";
				form.getFieldElement(fieldName).nextSibling.style.borderWidth = "0px";
			}
		}
	}
}

// aftre refresh listener for report_abMoGroupApproveForm_pr panel
function hideElements(){
    var panel = View.panels.get('report_abMoGroupApproveForm_pr');
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
}

//show Moves panels


function showMoves(restriction){
	var restr = new Ab.view.Restriction();
	restr.addClause("mo.project_id", restriction.clauses[0].value, restriction.clauses[0].op);
	
	restr.addClause('mo.mo_type', 'Employee', '=');
	View.panels.get('grid_abMoGroupApproveForm_mo_em').refresh(restr);
	View.panels.get('grid_abMoGroupApproveForm_mo_em').removeSorting();
	abMoGroupApproveFormCtrl.abMoGroupApproveForm_moTabsFrame.showTab('abMoGroupApproveForm_employee_tab' , (abMoGroupApproveFormCtrl.grid_abMoGroupApproveForm_mo_em.rows.length>0));
	
	restr.addClause('mo.mo_type', 'New Hire', '=', true);
	View.panels.get('grid_abMoGroupApproveForm_mo_hr').refresh(restr);
	View.panels.get('grid_abMoGroupApproveForm_mo_hr').removeSorting();
	abMoGroupApproveFormCtrl.abMoGroupApproveForm_moTabsFrame.showTab('abMoGroupApproveForm_new_hire_tab' , (abMoGroupApproveFormCtrl.grid_abMoGroupApproveForm_mo_hr.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Leaving', '=', true);
	View.panels.get('grid_abMoGroupApproveForm_mo_lv').refresh(restr);
	View.panels.get('grid_abMoGroupApproveForm_mo_lv').removeSorting();
	abMoGroupApproveFormCtrl.abMoGroupApproveForm_moTabsFrame.showTab('abMoGroupApproveForm_leaving_tab' , (abMoGroupApproveFormCtrl.grid_abMoGroupApproveForm_mo_lv.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Equipment', '=', true);
	View.panels.get('grid_abMoGroupApproveForm_mo_eq').refresh(restr);
	View.panels.get('grid_abMoGroupApproveForm_mo_eq').removeSorting();
	abMoGroupApproveFormCtrl.abMoGroupApproveForm_moTabsFrame.showTab('abMoGroupApproveForm_equipment_tab' , (abMoGroupApproveFormCtrl.grid_abMoGroupApproveForm_mo_eq.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Asset', '=', true);
	View.panels.get('grid_abMoGroupApproveForm_mo_as').refresh(restr);
	View.panels.get('grid_abMoGroupApproveForm_mo_as').removeSorting();
	abMoGroupApproveFormCtrl.abMoGroupApproveForm_moTabsFrame.showTab('abMoGroupApproveForm_asset_tab' , (abMoGroupApproveFormCtrl.grid_abMoGroupApproveForm_mo_as.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Room', '=', true);
	View.panels.get('grid_abMoGroupApproveForm_mo_rm').refresh(restr);
	View.panels.get('grid_abMoGroupApproveForm_mo_rm').removeSorting();
	abMoGroupApproveFormCtrl.abMoGroupApproveForm_moTabsFrame.showTab('abMoGroupApproveForm_room_tab' , (abMoGroupApproveFormCtrl.grid_abMoGroupApproveForm_mo_rm.rows.length>0));
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

var abMoGroupExamineForm_ctrl = View.createController('abMoGroupExamineForm_ctrl', {
	afterInitialDataFetch: function(){
		if(this.view.restriction) {
			this.report_abMoGroupExamineForm_pr.addParameter("projectId", this.view.restriction.clauses[0].value);
			this.report_abMoGroupExamineForm_pr.refresh();
			showMoves(this.view.restriction);
		}
	},

    report_abMoGroupExamineForm_pr_afterRefresh: function(){
    	//KB 3047263 field layout was changed from core, this function is no longer required 
//    	replaceNewLinesInDivFields(this.report_abMoGroupExamineForm_pr);
    },

    grid_abMoGroupExamineForm_mo_em_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupExamineForm_em_eq , this.grid_abMoGroupExamineForm_em_ta,this.getRestriction(this.grid_abMoGroupExamineForm_mo_em));
    },
	
	 grid_abMoGroupExamineForm_mo_hr_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupExamineForm_hr_eq , this.grid_abMoGroupExamineForm_hr_ta,this.getRestriction(this.grid_abMoGroupExamineForm_mo_hr));
    },
	
	 grid_abMoGroupExamineForm_mo_lv_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupExamineForm_lv_eq , this.grid_abMoGroupExamineForm_lv_ta,this.getRestriction(this.grid_abMoGroupExamineForm_mo_lv));
    },
	
	 grid_abMoGroupExamineForm_mo_rm_afterRefresh: function(){
    
    	this.refreshAssesmentsPanels(this.grid_abMoGroupExamineForm_rm_eq , this.grid_abMoGroupExamineForm_rm_ta,this.getRestriction(this.grid_abMoGroupExamineForm_mo_rm));
    },
	
	
	refreshAssesmentsPanels:function(eq_panel , ta_panel, restriction){

		// refresh Equipments and Furniture panels if the restriction is not empty
		if(restriction !=""){
			var project_id = this.report_abMoGroupExamineForm_pr.getFieldValue("project.project_id");
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



//show Moves panels


function showMoves(restriction){
	var restr = new Ab.view.Restriction();
	restr.addClause("mo.project_id", restriction.clauses[0].value, restriction.clauses[0].op);
	
	restr.addClause('mo.mo_type', 'Employee', '=');
	View.panels.get('grid_abMoGroupExamineForm_mo_em').refresh(restr);
	View.panels.get('grid_abMoGroupExamineForm_mo_em').removeSorting();
	abMoGroupExamineForm_ctrl.abMoGroupExamineForm_moTabsFrame.showTab('abMoGroupExamineForm_employee_tab' , (abMoGroupExamineForm_ctrl.grid_abMoGroupExamineForm_mo_em.rows.length>0));
	
	restr.addClause('mo.mo_type', 'New Hire', '=', true);
	View.panels.get('grid_abMoGroupExamineForm_mo_hr').refresh(restr);
	View.panels.get('grid_abMoGroupExamineForm_mo_hr').removeSorting();
	abMoGroupExamineForm_ctrl.abMoGroupExamineForm_moTabsFrame.showTab('abMoGroupExamineForm_new_hire_tab' , (abMoGroupExamineForm_ctrl.grid_abMoGroupExamineForm_mo_hr.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Leaving', '=', true);
	View.panels.get('grid_abMoGroupExamineForm_mo_lv').refresh(restr);
	View.panels.get('grid_abMoGroupExamineForm_mo_lv').removeSorting();
	abMoGroupExamineForm_ctrl.abMoGroupExamineForm_moTabsFrame.showTab('abMoGroupExamineForm_leaving_tab' , (abMoGroupExamineForm_ctrl.grid_abMoGroupExamineForm_mo_lv.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Equipment', '=', true);
	View.panels.get('grid_abMoGroupExamineForm_mo_eq').refresh(restr);
	View.panels.get('grid_abMoGroupExamineForm_mo_eq').removeSorting();
	abMoGroupExamineForm_ctrl.abMoGroupExamineForm_moTabsFrame.showTab('abMoGroupExamineForm_equipment_tab' , (abMoGroupExamineForm_ctrl.grid_abMoGroupExamineForm_mo_eq.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Asset', '=', true);
	View.panels.get('grid_abMoGroupExamineForm_mo_as').refresh(restr);
	View.panels.get('grid_abMoGroupExamineForm_mo_as').removeSorting();
	abMoGroupExamineForm_ctrl.abMoGroupExamineForm_moTabsFrame.showTab('abMoGroupExamineForm_asset_tab' , (abMoGroupExamineForm_ctrl.grid_abMoGroupExamineForm_mo_as.rows.length>0));
	
	restr.addClause('mo.mo_type', 'Room', '=', true);
	View.panels.get('grid_abMoGroupExamineForm_mo_rm').refresh(restr);
	View.panels.get('grid_abMoGroupExamineForm_mo_rm').removeSorting();
	abMoGroupExamineForm_ctrl.abMoGroupExamineForm_moTabsFrame.showTab('abMoGroupExamineForm_room_tab' , (abMoGroupExamineForm_ctrl.grid_abMoGroupExamineForm_mo_rm.rows.length>0));
}

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

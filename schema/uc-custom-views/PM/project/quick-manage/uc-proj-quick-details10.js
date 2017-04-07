// CHANGE LOG
// 2016/02/08 - MSHUSSAI - WR290586 - Update Javascript in order to enable changes for Notification Email on 80 percent or more Construction Complete, added function formPanelCustomActions_form_beforeSave

VIEW_PATH = "/archibus/schema/uc-custom-views/PM/project/quick-manage/";

var ucProjQuickDetails2Ctrl = View.createController('ucProjQuickDetails2Ctrl', {
    rowHeight: 25,
    
    afterViewLoad: function() {
        this.projDetailsTab.addEventListener('afterTabChange', projDetailsTab_afterTabChange);
		this.expandableWithHeaders(this.collaspibleCommitmentsGrid);
    },

	

    formPanelCustomActions_form_afterRefresh: function() {
	
		var role = View.user.role;


		switch (role) {

		case "UC-SYSDEV":
		case "UC-CPADMIN":
		case "UC-PMOADMIN":
			//Info Fields
			this.formPanelCustomActions_form.enableField("project.project_cat_id", true);
			this.formPanelCustomActions_form.enableField("project.proj_mgr", true);
			this.formPanelCustomActions_form.enableField("project.program_id", true);
			this.formPanelCustomActions_form.enableField("project.proj_acct", true);
			this.formPanelCustomActions_form.enableField("project.proj_phase", true);
			this.formPanelCustomActions_form.enableField("project.alert_level", true);
			this.formPanelCustomActions_form.enableField("project.date_target_end", true);
			this.formPanelCustomActions_form.enableField("project.date_end", true);
			this.formPanelCustomActions_form.enableField("project.pct_const_comp", true);
			this.formPanelCustomActions_form.enableField("project.proj_acct", true);
			break;
		case "UC-PMOPM":

			//Info Fields
			this.formPanelCustomActions_form.enableField("project.project_cat_id", false);
			this.formPanelCustomActions_form.enableField("project.proj_mgr", false);
			this.formPanelCustomActions_form.enableField("project.program_id", false);
			this.formPanelCustomActions_form.enableField("project.proj_acct", false);
			this.formPanelCustomActions_form.enableField("project.proj_phase", true);
			this.formPanelCustomActions_form.enableField("project.alert_level", true);
			this.formPanelCustomActions_form.enableField("project.date_target_end", true);
			this.formPanelCustomActions_form.enableField("project.date_end", true);
			this.formPanelCustomActions_form.enableField("project.pct_const_comp", true);
			this.formPanelCustomActions_form.enableField("project.proj_acct", true);
			break;
		default:

			//Info Fields
			this.formPanelCustomActions_form.enableField("project.proj_phase", false);
			this.formPanelCustomActions_form.enableField("project.project_cat_id", false);
			this.formPanelCustomActions_form.enableField("project.proj_mgr", false);
			this.formPanelCustomActions_form.enableField("project.program_id", false);
			this.formPanelCustomActions_form.enableField("project.proj_acct", false);
			this.formPanelCustomActions_form.enableField("project.alert_level", false);
			this.formPanelCustomActions_form.enableField("project.date_target_end", false);
			this.formPanelCustomActions_form.enableField("project.date_end", false);
			this.formPanelCustomActions_form.enableField("project.pct_const_comp", false);
			this.formPanelCustomActions_form.enableField("project.proj_acct", false);
			
			View.panels.get("formPanelCustomActions_form").actions.get("saveInfoTab").button.setVisible(false);
			break;
		}
		
		
		var project_id = View.panels.get('formPanelCustomActions_form').getFieldValue("project.project_id");
		//View.panels.get('project_wr_original_grid').refresh("project_id = '"+project_id+"'");
		View.panels.get('project_wr_original_grid').refresh("project_id='"+project_id+"'");
		//View.panels.get('project_wr_original_grid').addParameter("projIDRest", " project_id = '%"+project_id+"%'");
		//View.panels.get('project_wr_original_grid').refresh();
		
    },


	project_preConstructionPanel1_afterRefresh: function() {
		var role = View.user.role;
		switch (role) {

		case "UC-SYSDEV":
		case "UC-PMOADMIN":
			//PreConstruction Fields
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.q_ehs_con", true);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.q_ehs_precon", true);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.doc_ehs_precon", true);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.doc_ehs_con", true);
			break;
		case "UC-PMOPM":
			//PreConstruction Fields
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.q_ehs_con", true);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.q_ehs_precon", true);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.doc_ehs_precon", true);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.doc_ehs_con", true);
			break;
		default:
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.q_ehs_con", false);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.q_ehs_precon", false);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.doc_ehs_precon", false);
			this.project_preConstructionPanel1.enableField("uc_proj_quest_docs.doc_ehs_con", false);
			View.panels.get("project_preConstructionPanel1").actions.get("project_questions_save").button.setVisible(false);
			break;
		}
	},
	
	project_preConstructionPanel2_afterRefresh: function() {
	var role = View.user.role;
		switch (role) {

		case "UC-SYSDEV":
		case "UC-RECORDS":
		case "UC-PMOADMIN":
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_con_arc", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_con_ce", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_des_arc", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_des_ce", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_sch_arc", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_sch_ce", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_sch", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_des", true);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_con", true);			
			break;
		case "UC-PMOPM":
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_con_arc", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_con_ce", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_des_arc", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_des_ce", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_sch_arc", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_sch_ce", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_sch", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_des", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_con", false);	
			break;
		default:
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_con_arc", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_con_ce", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_des_arc", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_des_ce", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_sch_arc", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.q_rec_sch_ce", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_sch", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_des", false);
			this.project_preConstructionPanel2.enableField("uc_proj_quest_docs.doc_rec_con", false);	
			break;
		}
	},
	
	
	
	project_preConstructionPanel3_afterRefresh: function() {
		var role = View.user.role;
		switch (role) {

		case "UC-SYSDEV":
		case "UC-PMOADMIN":
			//PreConstruction Fields
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_client_conwalk", true);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_client_prewalk", true);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_maint_conwalk", true);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_maint_prewalk", true);
			break;
		case "UC-PMOPM":
			//PreConstruction Fields
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_client_conwalk", true);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_client_prewalk", true);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_maint_conwalk", true);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_maint_prewalk", true);
			break;
		default:
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_client_conwalk", false);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_client_prewalk", false);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_maint_conwalk", false);
			this.project_preConstructionPanel3.enableField("uc_proj_quest_docs.q_maint_prewalk", false);
			break;
		}
	},
	
	
	project_closeoutForm_afterRefresh: function() {
		var role = View.user.role;
		switch (role) {

		case "UC-SYSDEV":
		case "UC-PMOADMIN":
		case "UC-PMOPM":
			//PreConstruction Fields
			this.project_closeoutForm.enableField("project.closeout_conf1", true);
			this.project_closeoutForm.enableField("project.doc_closeout1", true);
			this.project_closeoutForm.enableField("project.closeout_conf2", true);
			this.project_closeoutForm.enableField("project.doc_closeout2", true);
			this.project_closeoutForm.enableField("project.closeout_conf3", true);
			this.project_closeoutForm.enableField("project.doc_closeout3", true);
			this.project_closeoutForm.enableField("project.closeout_conf4", true);
			this.project_closeoutForm.enableField("project.doc_closeout4", true);
			this.project_closeoutForm.enableField("project.closeout_conf5", true);
			this.project_closeoutForm.enableField("project.doc_closeout5", true);
			break;
		default:
			this.project_closeoutForm.enableField("project.closeout_conf1", false);
			this.project_closeoutForm.enableField("project.doc_closeout1", false);
			this.project_closeoutForm.enableField("project.closeout_conf2", false);
			this.project_closeoutForm.enableField("project.doc_closeout2", false);
			this.project_closeoutForm.enableField("project.closeout_conf3", false);
			this.project_closeoutForm.enableField("project.doc_closeout3", false);
			this.project_closeoutForm.enableField("project.closeout_conf4", false);
			this.project_closeoutForm.enableField("project.doc_closeout4", false);
			this.project_closeoutForm.enableField("project.closeout_conf5", false);
			this.project_closeoutForm.enableField("project.doc_closeout5", false);
			View.panels.get("project_closeoutForm").actions.get("project_checklist_save").button.setVisible(false);
			break;
		}
	},
	
	projectGLAFEGrid1_afterRefresh: function() {
		//alert("Refreshing AFEs1");
	    // Collapse the extra space
	    var numRows = this.projectGLAFEGrid1.rows.length;
	    document.getElementById("grid_projectGLAFEGrid1_divBody").style.height = (numRows * this.rowHeight) + "px";
	},

	projectGLGrid_afterRefresh: function() {
		//alert("Refreshing GLs");
	},
	
	collaspibleCommitmentsGrid_afterRefresh: function() {
		this.collaspibleCommitmentsGrid.removeSorting();
	},



		
    collaspibleCommitmentsGrid_onChangeState:function(row){
        this.expandCollapseGrid(this.collaspibleCommitmentsGrid,row,"uc_proj_collapse_commit.state");
    },


		
    panelState:{
        collaspibleCommitmentsGrid :{
            indexField : "uc_proj_collapse_commit.PO_ID",
            values : [],
            preparedValues:[]
        }
    },

	expandableWithHeaders : function(panel){
		var me = this;
		panel.afterCreateCellContent = function(row, col, cellElement) {
			var panel = row.grid,
			    stateField = ucProjQuickDetails2Ctrl.getPanelStateField(panel),
			    state = row[stateField],
			    record = row.row.record,
			    panel = row.grid, link,
			    panelState = ucProjQuickDetails2Ctrl.panelState[panel.id]
				postedField = ucProjQuickDetails2Ctrl.getPanelPostedField(panel),
				posted = row[postedField];

            if (col.id === "changeState") {
                if(state === ""  || state == "sub-title"){
					cellElement.style.visibility = "hidden";

					if(state == "sub-title"){
						row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;text-align:center;";
					}else{
						if (posted == "U") {
							row.row.dom.style.cssText += ";color:#666666;";
						}
						cellElement.style.visibility = "hidden";
					}

					if(panelState.values.indexOf(record[panelState.indexField]) == -1){
					    row.row.dom.style.display = "none";
					}
                }
                else{
                    if(panelState.values.indexOf(record[panelState.indexField]) > -1){
                        state = "-";
                    }
				    me.configureGridBtn(state, cellElement);
				    row.row.dom.style.cssText += ";background:#CCCCCC;font-weight:bold;";
				    Ext.get(cellElement).dom.style.cssText += "text-align:center;";
                }
            }else if(state == "sub-title"){
				link = Ext.get(cellElement).child("a");
				if(link){
					link.dom.style.cssText += ";text-decoration:none;color:black;cursor:text;";
				}
				cellElement.style.textAlign = "left";
			}else if((state === "" || state == "sub-title") && panelState.values.indexOf(record[panelState.indexField]) == -1){
				row.row.dom.style.display = "none";
			}
        };
	},


	configureGridBtn:function(state, cellElement){
	    var imgCell = Ext.get(cellElement).child("img");
	    if (imgCell != null) {
	        var btn = imgCell.dom;
	        if(btn){
	            var image =((state === "+") ? VIEW_PATH+"images/plus.gif" : VIEW_PATH+"images/minus.gif");
	            btn.setAttribute("data-state",state);
	            btn.setAttribute("src",image);
	            cellElement.setAttribute("data-state",state);
	            cellElement.style.cssText+=";width:18px;";
	        }
	    }
        return this;
    },

    getPanelStateField:function(panel){
	    return panel.getDataSource().mainTableName+".state";
	},

	getPanelPostedField:function(panel){
		return panel.getDataSource().mainTableName+".Amount";
	},

	expandCollapseGrid : function(grid, row, stateField){
		var recordIndex = row.record.index,gridRow,
		state = row.record[stateField],
		btnCell = grid.multipleSelectionEnabled ? row.cells.items[1].dom : row.cells.items[0].dom;
		for(var i = recordIndex + 1, j=grid.rows.length; i < j; i++){
			gridRow = grid.rows[i];
			if(gridRow[stateField] !== "" && gridRow[stateField] !== "sub-title"){
				break;
			}
			if(state === "-"){
				gridRow.row.dom.style.display = "none";
                var h = document.getElementById("grid_collaspibleCommitmentsGrid_divBody").style.height;
                h.replace(/px/g, "");
                h = parseInt(h) - this.rowHeight;
                document.getElementById("grid_collaspibleCommitmentsGrid_divBody").style.height = h + "px";
			}else{
				gridRow.row.dom.style.display ="";
				var h = document.getElementById("grid_collaspibleCommitmentsGrid_divBody").style.height;
				h.replace(/px/g, "");
				h = parseInt(h) + this.rowHeight;
				document.getElementById("grid_collaspibleCommitmentsGrid_divBody").style.height = h + "px";
			}
		}
		if(state === "-"){
			grid.rows[recordIndex][stateField]  = "+";
			this.configureGridBtn("+",btnCell);
		}else{
			grid.rows[recordIndex][stateField]  = "-";
			this.configureGridBtn("-",btnCell);
		}
		this.savePanelState(grid,row.record,state);
        /*
		if(this.allExpanded(grid)){
			grid.actions.get("expandAll").button.setText(COLLAPSE_ALL_TEXT);
		}else{
			grid.actions.get("expandAll").button.setText(EXPAND_ALL_TEXT);
		}
        */
	},

	savePanelState:function(panel, record, state){
	    var panelState = this.panelState[panel.id];
	        if(state === "-"){
	            panelState.values.splice(record[panelState.indexField], 1);
	            panelState.preparedValues.splice(makeLiteralOrNull(record[panelState.indexField]),1)
	        }else{
	            if(panelState.values.indexOf(record[panelState.indexField]) == -1){
	                panelState.values.push(record[panelState.indexField]);
	                panelState.preparedValues.push(makeLiteralOrNull(record[panelState.indexField]));
	            }
	        }
	    return this;
	},

	clearPanelState:function(){
	    var panelState = this.panelState;
	    for(var panel in panelState){
	        if(panelState.hasOwnProperty(panel)){
	            panelState[panel].values = [];
	            panelState[panel].preparedValues = [];
	        }
	    }
	},
	
	
	project_preConstructionPanel1_beforeSave: function() {
		this.project_preConstructionPanel2.save();
		this.project_preConstructionPanel3.save();
		
	},
	
	formPanelCustomActions_form_beforeSave: function() {
				
		var consForm = View.getControl('', 'formPanelCustomActions_form');
		
		var projName = consForm.getFieldValue("project.project_id");
		var projCategory = consForm.getFieldValue("project.project_cat_id");
		var consComplete = consForm.getFieldValue("project.pct_const_comp");
		
		var consCompleteOriginal = consForm.record.getValue("project.pct_const_comp");
		
		
		var sendTo = "afm.records@ucalgary.ca";
		var subject = "[Automated] Archibus - Project "+projName+" is now at "+consComplete+"% Construction Complete";
		var emailBody = "We just wanted to inform you that the Project: "+projName+" is now at "+consComplete+"% Construction Complete. "+ "<br><br><br>* You have received this email because you are listed as a forward for the email afm.records@ucalgary.ca *<br>" +
									"*Contact afm@ucalgary.ca if you have any questions or for more information.*";
				
		if ((consComplete != consCompleteOriginal) && (consComplete >= 80))	{
			//View.showMessage("Success "+consComplete);
			// Email
			uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');
		}
		else {
			//View.showMessage("Fail "+consComplete);
		}
		
	},
});

function projDetailsTab_afterTabChange(tabPanel, selectedTabName) {

	View.openProgressBar("Grabbing Info from the Data Warehouse...");
	setTimeout(function() {
	
		if (selectedTabName == 'financeTab') {
		 
		 
				var int_key = View.panels.get('formPanelCustomActions_form').getFieldValue("project.int_key");
				var project_id = View.panels.get('formPanelCustomActions_form').getFieldValue("project.project_id");
				
				View.panels.get('projectGLAFEGrid1').refresh("Internal_Key = '"+int_key+"' AND (Acct_Key='1045')");
				
				
				var int_num = View.panels.get('formPanelCustomActions_form').getFieldValue("project.int_num");
				View.panels.get('project_wr_grid').addParameter("intNumRest", " ac_id like '%"+int_num+"%'");
				View.panels.get('project_wr_grid').refresh();
				
				
				View.panels.get('collaspibleCommitmentsGrid').refresh("c1 = '"+int_key+"'");

				View.panels.get('projectGLGrid').refresh("Internal_Key = '"+int_key+"' AND Invoice_ID='' AND Acct_Key <> '1045' AND Acct_Key <> '1044'");
				View.panels.get('fundingOtherGrid').refresh("project_id='"+project_id+"'");

		}
		View.closeProgressBar();
		
	},500);
}


function fillRequiredInfo(optionvalue)
{

	var tablename;
	var editPanelName;
	var type_num='0';
	var type_name="Type 1";
	var timecard = false;

	// determine which panel to fill information for from the button id


	switch (optionvalue) {

		case 1:
			tablename = "uc_project_notes";
			editPanelName = "project_notes_addForm";
			type_num = '1';
			type_name='Type 1';
			break;
		case 2:
			tablename = "uc_project_notes";
			editPanelName = "project_notes_addForm";
			type_num= '2';
			type_name='Type 2';
			break;
		case 3:
			tablename = "uc_project_notes";
			editPanelName = "project_notes_addForm";
			type_num='3';
			type_name='Type 3';
			break;
		case 4:
			tablename = "uc_project_notes";
			editPanelName = "project_notes_addForm";
			type_num='4';
			type_name='Type 4';
			break;
		case 5:
			tablename = "uc_project_notes";
			editPanelName = "project_notes_addForm";
			type_num='5';
			type_name='Type 5';
			break;

	}


	// fill in wr_id and date/time
	if (tablename != undefined) {
		var panel = View.getControl('',editPanelName);

		record = panel.record;
		panel.setFieldValue(tablename+".comment_type", type_num);
		record.setValue(tablename+".comment_type", type_num);

		//panel.setFieldValue(tablename+".comment_type", type_num);
		panel.setFieldValue(tablename+".comments", "");
	}



}



function refreshNoteGrid()
{
	View.getControl('', 'project_notes_grid1').refresh();
	View.getControl('', 'project_notes_grid2').refresh();
	View.getControl('', 'project_notes_grid3').refresh();
	View.getControl('', 'project_notes_grid4').refresh();
	View.getControl('', 'project_notes_grid5').refresh();

}


function refreshFundingGrid()
{
	View.getControl('', 'fundingOtherGrid').refresh();
}


function makeLiteralOrNull(val) {
    var rVal = "NULL";
    if (val != '') {
        rVal = "'" + val.toString().replace(/'/g, "''") + "'";
    }
    return rVal;
}
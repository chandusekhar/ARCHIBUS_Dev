// CHANGE LOG:
// 2016/03/22  -  MSHUSSAI - Added the ability to search by Building Zones

var projectManagerController = View.createController('projectManagerController', {
	consoleRestriction: "",

	consolePanel_onClear: function(){
		this.consolePanel.clear();	
		$('showArchived').checked = false;		
	},
	
	afterInitialDataFetch: function() {
		this.inherit();

		this.projListPanel.afterCreateCellContent = function(row, col, cellElement) {
			if (col.id == 'project.int_num') {
				cellElement.style.fontWeight = "bold";
			}
			else if (col.id == 'project.adw_afe_value') {
				cellElement.style.fontWeight = "bold";
			}
			else if (col.id == 'project.balance') {
				var value = row['project.balance'];

				if (value < 0) {
					cellElement.style.color='#FF4444';
				}
				cellElement.style.fontWeight = "bold";
			}
			else if (col.id == 'project.proj_phase') {
				var value = row['project.alert_level'];
				cellElement.style.fontWeight = "bold";
				if (value == 'Red') {
					cellElement.style.backgroundColor="#ddaaaa";
					cellElement.style.color = '#000000';
					cellElement.style.fontWeight = "bold";
				}
				else if (value == 'Yellow') {
					cellElement.style.backgroundColor="#ffff66";
					cellElement.style.color = '#000000';
					cellElement.style.fontWeight = "bold";
				}
				else if (value == 'Green') {
					cellElement.style.color = '#000000';
					cellElement.style.fontWeight = "normal";
				}
			}
			
		}

	},


	consolePanel_onShow: function(){
		View.openProgressBar("Retrieving Information...");

		setTimeout(function() {
			var role = View.user.role;
			var proj_mgr = projectManagerController.consolePanel.getFieldValue('project.proj_mgr');
			var project_id = projectManagerController.consolePanel.getFieldValue('project.project_id');
			var int_num = projectManagerController.consolePanel.getFieldValue('project.int_num');
			var proj_phase = projectManagerController.consolePanel.getFieldValue('project.proj_phase');
			var program_id = projectManagerController.consolePanel.getFieldValue('project.program_id');
            var company = projectManagerController.consolePanel.getFieldValue('em.company');
			var project_cat_id = projectManagerController.consolePanel.getFieldValue('project.project_cat_id');
			var bl_id = projectManagerController.consolePanel.getFieldValue('project.bl_id');
			var zone_id = projectManagerController.consolePanel.getFieldValue('bl.zone_id');
			var showArchived = $('showArchived').checked;
			

			var restriction="1=1";
			var outlookRestriction="1=1";
			var summaryRestriction="1=1";
			//var outlookds = View.dataSources.get("projSummary_ds1");

			if (proj_mgr != "") {
				restriction = restriction + " AND project.proj_mgr = "+projectManagerController.literalOrNull(proj_mgr);
				outlookRestriction = outlookRestriction + " AND p.proj_mgr = "+projectManagerController.literalOrNull(proj_mgr);
				//ds.addParameter("proj_mgr", proj_mgr);
			}
			if (project_id != "") {
				restriction = restriction + " AND project.project_id LIKE "+projectManagerController.literalOrNullLike(project_id);
				outlookRestriction = outlookRestriction + " AND p.project_id LIKE "+projectManagerController.literalOrNullLike(project_id);
			}
			if (int_num != "") {
				restriction = restriction + " AND project.int_num = "+projectManagerController.literalOrNull(int_num);
				outlookRestriction = outlookRestriction + " AND p.int_num = "+projectManagerController.literalOrNull(int_num);
			}
			
			if (proj_phase != "") { 
				restriction = multiSelectParse('consolePanel', 'project.proj_phase', 'project.proj_phase', restriction); 
				outlookRestriction = multiSelectParse('consolePanel', 'project.proj_phase', 'p.proj_phase', outlookRestriction); 
			}
			
			if (program_id != "") { 
				restriction = multiSelectParse('consolePanel', 'project.program_id', 'project.program_id', restriction); 
				outlookRestriction = multiSelectParse('consolePanel', 'project.program_id', 'p.program_id', outlookRestriction); 
			}
			if (project_cat_id != "") { 
				restriction = multiSelectParse('consolePanel', 'project.project_cat_id', 'project.project_cat_id', restriction); 
				outlookRestriction = multiSelectParse('consolePanel', 'project.project_cat_id', 'p.project_cat_id', outlookRestriction); 
			}
			if (bl_id != "") { 
				restriction = multiSelectParse('consolePanel', 'project.bl_id',  'project.bl_id',restriction); 
				outlookRestriction = multiSelectParse('consolePanel', 'project.bl_id',  'p.bl_id',outlookRestriction); 
				
			}


			if (company != "") {
				restriction = restriction + " AND EXISTS (SELECT 1 FROM em WHERE em.em_id = project.proj_mgr AND em.company = "+projectManagerController.literalOrNull(company)+")";
				outlookRestriction = outlookRestriction + " AND EXISTS (SELECT 1 FROM em WHERE em.em_id = p.proj_mgr AND em.company = "+projectManagerController.literalOrNull(company)+")";
			}
			
			if (zone_id != "") {
				restriction = restriction + " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND bl.zone_id = "+projectManagerController.literalOrNull(zone_id)+")";
				outlookRestriction = outlookRestriction + " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = p.bl_id AND bl.zone_id = "+projectManagerController.literalOrNull(zone_id)+")";
			}
			

			if (role == "UC-PMOPM") {
				restriction = restriction + " AND project.proj_phase NOT IN ('CLOSEOUT-PMO ADM', 'CLOSEOUT-FINANCE', 'CLOSEOUT-PM','ARCHIVE') ";
				outlookRestriction = outlookRestriction +  " AND p.proj_phase NOT IN ('CLOSEOUT-PMO ADM', 'CLOSEOUT-FINANCE', 'CLOSEOUT-PM','ARCHIVE') ";
			}

			//because of the way the outlook panel works, the status/archive restrictions are placed inside the
			//query, instead of the outside nest.
			//View.panels.get("bottomMid").addParameter("restriction", restriction);
			
			
			if(!showArchived) {
				restriction = restriction + " AND project.status NOT IN ('Requested-Rejected','Approved-Cancelled','Completed-Verified') ";
				outlookRestriction = outlookRestriction +  " AND p.status NOT IN ('Requested-Rejected','Approved-Cancelled','Completed-Verified') ";
				
			} else {
				restriction = restriction + " AND project.status NOT IN ('Requested-Rejected','Approved-Cancelled') ";
				outlookRestriction = outlookRestriction +  " AND p.status NOT IN ('Requested-Rejected','Approved-Cancelled') ";
			}

			View.panels.get("projListPanel").refresh(restriction);
			
			//outlookRestriction = outlookRestriction +  " AND p.sjfkldsj NOT IN ('Requested-Rejected','Approved-Cancelled') ";
			//alert(outlookRestriction);
			
			var outlookView = View.panels.get("bottomMid");
			outlookView.addParameter('summaryRest', outlookRestriction);
			outlookView.refresh();
			
			//View.panels.get("bottomMid").addParameter('summaryRest', outlookRestriction);
			//View.panels.get("bottomMid").refresh();
			View.panels.get("bottomright").refresh(restriction);
			

            View.panels.get("panel_abViewdefSummaryChart_popup").addParameter("consoleRest", restriction);
			
			
			View.closeProgressBar();
		},500);


	},

	projListPanel_afterRefresh: function() {
		//View.closeProgressBar();
	},



	
	literalOrNullLike: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'%" + val.replace(/'/g, "''") + "%'";
	},
	
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	}
});



function multiSelectParse(consolename, sourceString, destString, restriction) {
	var console = View.panels.get(consolename);
	var valuesArray = console.getFieldMultipleValues(sourceString);
	
	var restriction_txt = restriction + " AND " + destString + " IN (";
	for (var i=0; i < valuesArray.length; i++) {
		restriction_txt = restriction_txt + literalOrNull(valuesArray[i].trim());
		if (i < valuesArray.length-1) {
			restriction_txt = restriction_txt + ",";
		}
	}
	restriction_txt = restriction_txt + ") ";
	return restriction_txt;
}

function literalOrNull(val, emptyString) {
	if(val == undefined || val == null)
		return "NULL";
	else if (!emptyString && val == "")
		return "NULL";
	else
		return "'" + val.replace(/'/g, "''") + "'";
}



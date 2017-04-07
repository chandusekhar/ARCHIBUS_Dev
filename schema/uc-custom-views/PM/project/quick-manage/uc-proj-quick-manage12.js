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
		var role = View.user.role;

		setTimeout(function() {
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
			//alert(proj_mgr);

			if (proj_mgr != "") { restriction = restriction + " AND project.proj_mgr = "+projectManagerController.literalOrNull(proj_mgr); }
			if (project_id != "") { restriction = restriction + " AND project.project_id LIKE  "+projectManagerController.literalOrNullLike(project_id); }
			if (int_num != "") { restriction = restriction + " AND project.int_num = "+projectManagerController.literalOrNull(int_num); }
			if (proj_phase != "") { restriction = restriction + " AND project.proj_phase = "+projectManagerController.literalOrNull(proj_phase); }
			if (program_id != "") { restriction = restriction + " AND project.program_id = "+projectManagerController.literalOrNull(program_id); }
			if (bl_id != "") { restriction = restriction + " AND project.bl_id = "+projectManagerController.literalOrNull(bl_id); }

			if (project_cat_id != "") { restriction = restriction + " AND project.project_cat_id = "+projectManagerController.literalOrNull(project_cat_id); }
			if (company != "") {
				restriction = restriction + " AND EXISTS (SELECT 1 FROM em WHERE em.em_id = project.proj_mgr AND em.company = "+projectManagerController.literalOrNull(company)+")";
			}
			
			if (zone_id != "") {
				restriction = restriction + " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND bl.zone_id = "+projectManagerController.literalOrNull(zone_id)+")";
			}
			
			
			if (role == "UC-PMOPM" && !showArchived) {
				//limit access
				restriction = restriction + " AND project.proj_phase NOT IN ('CLOSEOUT-PMO ADM', 'CLOSEOUT-FINANCE', 'ARCHIVE', 'Completed-Verified', 'Requested-Rejected','Approved-Cancelled') ";
//			} 
//			
//			if(!showArchived) {
//				restriction = restriction + " AND project.status NOT IN ('Requested-Rejected','Approved-Cancelled','Completed-Verified') ";
			} else {
				//don't limit access
				restriction = restriction + " AND project.status NOT IN ('Requested-Rejected','Approved-Cancelled') ";
			}
			
			//alert(restriction);
			//this.projListPanel.addParameter("consoleRest", restriction);
			View.panels.get("projListPanel").refresh(restriction);
			//this.projListPanel.refresh();
			View.closeProgressBar();
		},500);

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



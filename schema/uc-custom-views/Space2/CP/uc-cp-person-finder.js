var viewPersonFinderController = View.createController('viewPersonFinderController', {

	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		//this.consolePanel_onShow();
	},
	
	
	//console filter
	consolePanel_onShow: function() {

		var emplid = this.consolePanel.getFieldValue('uc_d_person_ps.emplid');
		var person_name = this.consolePanel.getFieldValue('uc_d_person_ps.person_name');
		var person_last_name = this.consolePanel.getFieldValue('uc_d_person_ps.person_last_name');
		var person_first_name = this.consolePanel.getFieldValue('uc_d_person_ps.person_first_name');
		var person_eid = this.consolePanel.getFieldValue('uc_d_person_ps.person_eid');
		var person_active_staff_flag = this.consolePanel.getFieldValue('uc_d_person_ps.person_active_staff_flag');
		var person_campus_email = this.consolePanel.getFieldValue('uc_d_person_ps.person_campus_email');
		var person_campus_location = this.consolePanel.getFieldValue('uc_d_person_ps.person_campus_location');
		var person_campus_phone = this.consolePanel.getFieldValue('uc_d_person_ps.person_campus_phone');
		var person_main_dept_id = this.consolePanel.getFieldValue('uc_d_person_ps.person_main_dept_id');
		
		var restriction="1=1";
		

		if (emplid != "") {restriction = restriction + " AND uc_d_person_ps.emplid like '%"+emplid+"%'"; }	
		if (person_name != "") {restriction = restriction + " AND uc_d_person_ps.person_name like '%"+person_name+"%'"; }	
		if (person_last_name != "") {restriction = restriction + " AND uc_d_person_ps.person_last_name like '%"+person_last_name+"%'";}	
		if (person_first_name != "") {restriction = restriction + " AND uc_d_person_ps.person_first_name like '%"+person_first_name+"%'"; }	
		if (person_eid != "") {restriction = restriction + " AND uc_d_person_ps.person_eid like '%"+person_eid+"%'"; }	
		if (person_active_staff_flag != "") {restriction = restriction + " AND uc_d_person_ps.person_active_staff_flag = "+this.literalOrNull(person_active_staff_flag); }	
		if (person_campus_email != "") {restriction = restriction + " AND uc_d_person_ps.person_campus_email like '%"+person_campus_email+"%'"; }	
		if (person_campus_location != "") {restriction = restriction + " AND uc_d_person_ps.person_campus_location like '%"+person_campus_location+"%'"; }	
		if (person_main_dept_id != "") {restriction = restriction + " AND uc_d_person_ps.person_main_dept_id = "+this.literalOrNull(person_main_dept_id); }	
		if (person_campus_phone != "") {restriction = restriction + " AND uc_d_person_ps.person_campus_phone like '%"+person_campus_phone+"%'"; }	


//		var date_entered = this.consolePanel.getFieldValue('uc_wrcf_staging.date_entered');
//		var cf_id = this.consolePanel.getFieldValue('uc_wrcf_staging.cf_id');
//		var tr_id = $('selectbox_tr_id').value;
//		var zone_id = this.consolePanel.getFieldValue('zone_id');//2012.08.08 - AS- add zone in the search console 
//		var restriction = "1=1";
//		if(date_entered != ""){	restriction = restriction + " AND uc_wrcf_staging.date_entered = "+this.literalOrNull(date_entered);	}
//		if(cf_id != ""){	restriction = restriction + " AND uc_wrcf_staging.cf_id = "+this.literalOrNull(cf_id);	}
//		if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+this.literalOrNull(tr_id);	}
//		if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where bl.bl_id=wr.bl_id AND bl.zone_id = "+this.literalOrNull(zone_id)+" ) ";	}//2012.08.08 - AS- add zone in the search console 
		this.GridPanel.show(true, false);
		this.GridPanel.refresh(restriction);
	},
	
	
	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
	},
	
	
		//refresh list
	ucWrcfStagingListPanel_onRefresh: function(){
		this.GridPanel.refresh();
	},
	
	
	//utility functions
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},
	
	

	
});
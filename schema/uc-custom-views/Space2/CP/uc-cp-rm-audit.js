var viewPersonFinderController = View.createController('viewPersonFinderController', {

	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		//this.consolePanel_onShow();
	},
	
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},
	
	//console filter
	consolePanel_onShow: function() {
		var bl_id = this.consolePanel.getFieldValue('uc_rm_audit_log.bl_id');
		var fl_id = this.consolePanel.getFieldValue('uc_rm_audit_log.fl_id');
		var rm_id = this.consolePanel.getFieldValue('uc_rm_audit_log.rm_id');
		var dp_id = this.consolePanel.getFieldValue('uc_rm_audit_log.dp_id');
		var date_from = this.consolePanel.getFieldValue('uc_rm_audit_log.modification_date.from');
		var date_to = this.consolePanel.getFieldValue('uc_rm_audit_log.modification_date.to');
		var modification_type = this.consolePanel.getFieldValue('uc_rm_audit_log.modification_type');

		
		var restriction="1=1";
		

		if (bl_id != "") {restriction = restriction + " AND uc_rm_audit_log.bl_id = '"+bl_id+"'"; }	
		if (fl_id != "") {restriction = restriction + " AND uc_rm_audit_log.fl_id = '"+fl_id+"'"; }	
		if (rm_id != "") {restriction = restriction + " AND uc_rm_audit_log.rm_id = '"+rm_id+"'"; }	
		if (dp_id != "") {restriction = restriction + " AND uc_rm_audit_log.dp_id = '"+dp_id+"'"; }	
		if (modification_type != "") {restriction = restriction + " AND uc_rm_audit_log.modification_type = '"+modification_type+"'"; }	
		if (date_from != "") {	restriction = restriction + " AND uc_rm_audit_log.modification_date >= "+this.literalOrNull(date_from); }	
		if (date_to != "") {	restriction = restriction + " AND uc_rm_audit_log.modification_date <= "+this.literalOrNull(date_to);	}
		
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
var abEhsRptEmMedMonCtrl = View.createController('abEhsRptEmMedMonCtrl',{
	emId:null,
	
	abEhsRptEmMedMon_workRestr_afterRefresh: function(){
		var medMonId = this.abEhsRptEmMedMon_workRestr.restriction["ehs_medical_mon_results.medical_monitoring_id"];
		this.abEhsRptEmMedMon_workRestr.setTitle(getMessage("workRestrTitle").replace("{1}", medMonId));
	},
	
	abEhsRptEmMedMon_medMon_onExportDOCX: function(){
		var filterRestriction = this.abEhsRptEmMedMon_medMon.restriction;
		
		var medRecords = this.abEhsRptEmMedMon_medMonDs.getRecords(filterRestriction);
		var medMonIds = [];
		for (var i = 0; i < medRecords.length; i++ ){
			var rec = medRecords[i];
			medMonIds.push(rec.getValue("ehs_medical_mon_results.medical_monitoring_id"));
		}
		
		var medMonRestriction = "";
		medMonRestriction = 'ehs_restrictions.medical_monitoring_id' + " IN ('" + medMonIds.join("','") + "')";
		
		var restriction = {"abEhsRptEmMedicalMonitoringPgrp_emDs": filterRestriction, "abEhsRptEmMedicalMonitoringPgrp_workRestrDs": medMonRestriction};
		
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-ehs-rpt-em-medical-monitoring-pgrp.axvw", restriction, parameters);
	}
})
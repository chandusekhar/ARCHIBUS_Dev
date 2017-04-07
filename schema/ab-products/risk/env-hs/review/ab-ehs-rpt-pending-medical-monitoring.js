var abEhsRptPendingMedMonCtrl = View.createController('abEhsRptPendingMedMonCtrl', {

    afterViewLoad: function() {
		this.inherit();
		this.abEhsRptPendingMedMon_medMon.addParameter('MedicalMonitoringDaysDeadline',View.activityParameters['AbRiskEHS-MedicalMonitoringDaysDeadline']);
        this.abEhsRptPendingMedMon_medMon.afterCreateCellContent = function(row, column, cellElement) {
        	var colorId = row['ehs_medical_mon_results.vf_color_order'];
        	var color='';
        	var textColor='#000000';
        	var weight='';
        	switch(colorId){
        	case '0': 
        		//red
        		color = '#993333';
        		textColor='#FFFFFF';
        		weight = 'bold';
        		break;
        	case '1':
        		//yellow
        		color = '#FFCC00';
        		break;
        	} 
			
        	cellElement.style.background = color;
        	cellElement.style.color = textColor;
        	cellElement.style.fontWeight = weight;
        }
        
        //add colored instructions
        var instructions = "<span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("redInstrunction")+"</span>";
    	instructions +="<br /><span style='background-color:#FFCC00'>"+getMessage("yellowInstrunction").replace('{0}',View.activityParameters['AbRiskEHS-MedicalMonitoringDaysDeadline'])+"</span>";
        this.abEhsRptPendingMedMon_medMon.setInstructions(instructions);
    },
    //Applies user restriction to grid
    abEhsRptPendingMedMon_console_onFilter:function(){
    	var filterRestriction = getFilterRestriction(this.abEhsRptPendingMedMon_console);
		this.abEhsRptPendingMedMon_medMon.refresh(filterRestriction);
    }
});

function getFilterRestriction(console){
	var restriction = new Ab.view.Restriction(); 
    
	var fieldId = 'ehs_medical_mon_results.medical_monitoring_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_medical_mon_results.monitoring_type';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_medical_mon_results.em_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_medical_mon_results.incident_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	return restriction;
}
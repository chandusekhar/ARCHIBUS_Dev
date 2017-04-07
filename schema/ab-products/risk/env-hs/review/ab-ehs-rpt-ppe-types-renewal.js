var abEhsRptEmPPETypesRenewalCtrl = View.createController('abEhsRptEmPPETypesRenewalCtrl', {

    afterViewLoad: function() {
		this.inherit();
		this.abEhsRptEmPPETypesRenewal_grid.addParameter('PpeDaysDeadline',View.activityParameters['AbRiskEHS-PpeDaysDeadline']);
        this.abEhsRptEmPPETypesRenewal_grid.afterCreateCellContent = function(row, column, cellElement) {
        	var colorId = row['ehs_em_ppe_types.vf_color_order'];
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
    	instructions +="<br /><span style='background-color:#FFCC00'>"+String.format(getMessage("yellowInstrunction"), View.activityParameters['AbRiskEHS-PpeDaysDeadline'])+"</span>";
        this.abEhsRptEmPPETypesRenewal_grid.setInstructions(instructions);
    },
    //Applies user restriction to grid
    abEhsRptEmPPETypesRenewal_console_onFilter:function(){
    	var filterRestriction = getFilterRestriction(this.abEhsRptEmPPETypesRenewal_console);
		this.abEhsRptEmPPETypesRenewal_grid.refresh(filterRestriction);
    }
});

function getFilterRestriction(console){
	var restriction = new Ab.view.Restriction(); 
    
	var fieldId = 'ehs_em_ppe_types.ppe_type_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_ppe_types.eq_std';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_em_ppe_types.em_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);

	return restriction;
}
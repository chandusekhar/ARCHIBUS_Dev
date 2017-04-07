var abEhsRptPendingTrainingCtrl = View.createController('abEhsRptPendingTrainingCtrl', {

    afterViewLoad: function() {
		this.inherit();
		this.abEhsRptPendingTraining_training.addParameter('TrainingDaysDeadline',View.activityParameters['AbRiskEHS-TrainingDaysDeadline']);
        this.abEhsRptPendingTraining_training.afterCreateCellContent = function(row, column, cellElement) {
        	var colorId = row['ehs_training_results.vf_color_order'];
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
        	
        	if (column.id == 'view' && row['ehs_training_results.doc'] == '') {
        		if(Ext.get(cellElement).dom.firstChild){
        			Ext.get(cellElement).dom.innerHTML = "";
        		}
        	}
        }
        
        //add colored instructions
        var instructions = "<span style='background-color:#993333;color:#FFFFFF;font-weight:bold;'>"+getMessage("redInstrunction")+"</span>";
    	instructions +="<br /><span style='background-color:#FFCC00'>"+String.format(getMessage("yellowInstrunction"), View.activityParameters['AbRiskEHS-TrainingDaysDeadline'])+"</span>";
        this.abEhsRptPendingTraining_training.setInstructions(instructions);
    },
    //Applies user restriction to grid
    abEhsRptPendingTraining_console_onFilter:function(){
    	var filterRestriction = getFilterRestriction(this.abEhsRptPendingTraining_console);
		this.abEhsRptPendingTraining_training.refresh(filterRestriction);
    }
});

function getFilterRestriction(console){
	var restriction = new Ab.view.Restriction(); 
    
	var fieldId = 'ehs_training_results.training_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training.training_name';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training.training_category_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training.training_type_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training_results.em_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training.ppe_type_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training.eq_std';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	fieldId = 'ehs_training_results.incident_id';
	restriction = addClauseToRestriction(console, restriction, fieldId);
	
	return restriction;
}
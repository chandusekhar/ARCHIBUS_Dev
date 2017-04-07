function addClauseToRestriction(console, restriction, fieldId){
	var fieldValue = console.hasFieldMultipleValues(fieldId) ? console.getFieldMultipleValues(fieldId) : console.getFieldValue(fieldId);
	if(valueExistsNotEmpty(fieldValue)){
		if(typeof(fieldValue) === 'object' && fieldValue instanceof Array){
			restriction.addClause(fieldId, fieldValue, 'IN');
		} else {
			restriction.addClause(fieldId, fieldValue, '=');
		}
	}
	return restriction;
}

function showIncidentDetails(commandContext){
	var restriction = new Ab.view.Restriction();
	
	if(commandContext.restriction['ehs_incidents.incident_id']){
		restriction.addClause('ehs_incidents.incident_id', commandContext.restriction['ehs_incidents.incident_id'], '=');
	} else if(commandContext.getParentPanel){
		var grid = commandContext.getParentPanel();
		var selGridRow = grid.gridRows.get(grid.selectedRowIndex);
		var incidentId = selGridRow.getFieldValue("ehs_incidents.incident_id");
		if(valueExistsNotEmpty(incidentId)){
			restriction.addClause('ehs_incidents.incident_id', incidentId, '=');
		}
	}
	
	View.openDialog('ab-ehs-incident-details-dialog.axvw', restriction, false);
}

function showRequestDetails(commandContext){
	var restriction = new Ab.view.Restriction();
	if(commandContext.restriction['activity_log.activity_log_id']){
		restriction.addClause('activity_log.activity_log_id', commandContext.restriction['activity_log.activity_log_id'], '='); 
	}
	View.openDialog('ab-ehs-request-details-dialog.axvw', restriction, false);
}

/**
 * Returns the title of the given field of the console
 * @param console
 * @param fieldName
 * @returns {String}
 */
function getTitleOfConsoleField(console, fieldName){
	var title = "";
	
	console.fields.each(function(field){
		if(field.fieldDef.id == fieldName)
			title = field.fieldDef.title;
	});
	
	return title;
}

function showEmployeeTrainingDoc(context){
	var row = context.row;
	var ds = row.panel.getDataSource();
	
	var dateKey = ds.formatValue('ehs_training_results.date_actual', row.getFieldValue('ehs_training_results.date_actual'), false);
    var keys = {
		'training_id': row.getFieldValue('ehs_training_results.training_id'),
		'em_id': row.getFieldValue('ehs_training_results.em_id'),
		'date_actual': dateKey
    };
    
    var tableName = "ehs_training_results";
    var fieldName = "doc";
    var docName = row.getFieldValue("ehs_training_results.doc");
    
	View.showDocument(keys, tableName, fieldName, docName);
}

function showTrainingDoc(context){
	var row = context.row;
	var ds = row.panel.getDataSource();
	
    var keys = {
		'training_id': row.getFieldValue('ehs_training.training_id')
    };
    
    var tableName = "ehs_training";
    var fieldName = "doc";
    var docName = row.getFieldValue("ehs_training.doc");
    
	View.showDocument(keys, tableName, fieldName, docName);
}
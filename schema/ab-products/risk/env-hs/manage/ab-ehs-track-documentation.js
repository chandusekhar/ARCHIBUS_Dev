var abEhsTrackDocumentationCtrl = View.createController('abEhsTrackDocumentationCtrl',{
	
	afterViewLoad: function(){
		this.abEhsTrackDocumentation_grid.addParameter('docAsignedToTraining', getMessage('docAsignedToTraining'));
		this.abEhsTrackDocumentation_grid.addParameter('docAsignedToPpeType', getMessage('docAsignedToPpeType'));
		this.abEhsTrackDocumentation_grid.addParameter('docAsignedToIncident', getMessage('docAsignedToIncident'));
		this.abEhsTrackDocumentation_grid.addParameter('docAsignedToIncidentWitness', getMessage('docAsignedToIncidentWitness'));
		this.abEhsTrackDocumentation_grid.addParameter('docAsignedToRestriction', getMessage('docAsignedToRestriction'));
	},
	
	/**
	 * Shows the report according to the user restriction
	 */
	abEhsTrackDocumentation_console_onFilter: function(){
		var filterRestriction = this.getFilterRestriction(this.abEhsTrackDocumentation_console);
		this.abEhsTrackDocumentation_grid.refresh(filterRestriction);
		this.hideForms();
	},
	
	clearForm: function(){
		this.abEhsTrackDocumentation_console.clear();
		document.getElementById("selectRelatedTo").selectedIndex = 0;
	},
	
	/**
	 * Get filter restriction
	 */
	getFilterRestriction: function(console){
		var restriction = new Ab.view.Restriction(); 
	    
		if(console.getFieldValue('date_doc_from')){
			restriction.addClause('docs_assigned.date_doc', console.getFieldValue('date_doc_from'), '>=');
		}
		if(console.getFieldValue('date_doc_to')){
			restriction.addClause('docs_assigned.date_doc', console.getFieldValue('date_doc_to'), '<=');
		}
        
		var fieldId = 'docs_assigned.name';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.doc_author';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.doc_cat';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.doc_type';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.doc_folder';
		restriction = addClauseToRestriction(console, restriction, fieldId);
	
		fieldId = 'docs_assigned.site_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.bl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.training_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.ppe_type_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.medical_monitoring_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.incident_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'docs_assigned.restriction_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
				
		var selectRelatedToField = console.fields.get("vf_related_to").fieldDef;
		var selectRelatedTo = document.getElementById("selectRelatedTo");
		var relatedTo = selectRelatedTo.options[selectRelatedTo.selectedIndex].value;
		switch (relatedTo){
			case 'Training':
				restriction.addClause('docs_assigned.training_id', '', 'IS NOT NULL');
				break;
			case 'PPE Type':
				restriction.addClause('docs_assigned.ppe_type_id', '', 'IS NOT NULL');
				break;
			case 'Medical Monitoring':
				restriction.addClause('docs_assigned.medical_monitoring_id', '', 'IS NOT NULL');
				break;
			case 'Incident':
				restriction.addClause('docs_assigned.incident_id', '', 'IS NOT NULL');
				break;
			case 'Work Restriction':
				restriction.addClause('docs_assigned.restriction_id', '', 'IS NOT NULL');
				break;
		}
		
		return restriction;
	},
	
	abEhsTrackDocumentation_grid_onEdit: function(row, button){
	    var record = row.getRecord();
	    var tableName = record.getValue('docs_assigned.vf_table_name');
	    var ds = View.dataSources.get('abEhsTrackDocumentation_ds');
	    var restriction = null;
		var formName = "";
	    
	    this.hideForms();
	    
	    switch (tableName) {
		case 'ehs_training_results':
			var dateKey = ds.formatValue('docs_assigned.date_doc', record.getValue('docs_assigned.date_key'), false);
			restriction = new Ab.view.Restriction({
					'ehs_training_results.training_id': record.getValue('docs_assigned.training_id'),
		    		'ehs_training_results.em_id': record.getValue('docs_assigned.em_id'),
		    		'ehs_training_results.date_actual': dateKey
	    		});
			formName = "abEhsTrackDocumentation_formTraining";
		    break;

		case 'ehs_em_ppe_types':
			var dateKey = ds.formatValue('docs_assigned.date_doc', record.getValue('docs_assigned.date_key'), false);
			restriction = {
	    		'ehs_em_ppe_types.ppe_type_id': record.getValue('docs_assigned.ppe_type_id'),
	    		'ehs_em_ppe_types.em_id': record.getValue('docs_assigned.em_id'),
	    		'ehs_em_ppe_types.date_use': dateKey
		    };
		    formName = "abEhsTrackDocumentation_formPpeType";
		    break;

		case 'ehs_incidents':
			restriction = {'ehs_incidents.incident_id': record.getValue('docs_assigned.incident_id')};
		    formName = "abEhsTrackDocumentation_formIncident";
		    break;

		case 'ehs_incident_witness':
			restriction = {'ehs_incident_witness.incident_witness_id': record.getValue('docs_assigned.incident_witness_id')};
		    formName = "abEhsTrackDocumentation_formIncidentWitness";
		    break;

		case 'ehs_restrictions':
			restriction = {'ehs_restrictions.restriction_id': record.getValue('docs_assigned.restriction_id')};
		    formName = "abEhsTrackDocumentation_formRestriction";
		    break;

		case 'docs_assigned':
		default:
			restriction = button.command.restriction;
			formName = "abEhsTrackDocumentation_form";
		    break;
		}
	    
	    View.panels.get(formName).refresh(restriction, false);
	},
	
	hideForms: function(){
		this.abEhsTrackDocumentation_form.show(false);
		this.abEhsTrackDocumentation_formTraining.show(false);
		this.abEhsTrackDocumentation_formPpeType.show(false);
		this.abEhsTrackDocumentation_formIncident.show(false);
		this.abEhsTrackDocumentation_formIncidentWitness.show(false);
		this.abEhsTrackDocumentation_formRestriction.show(false);
	},
	
	/**
	 * Set default values for the document author and the date document fields. (KB3036265)
	 */
	abEhsTrackDocumentation_form_afterRefresh: function(){
		if(this.abEhsTrackDocumentation_form.newRecord){
			this.abEhsTrackDocumentation_form.setFieldValue('docs_assigned.doc_author', View.user.employee.id);
			var today = Date();
			var uiToday = this.abEhsTrackDocumentation_ds.parseValue('docs_assigned.date_doc', today, true);
			this.abEhsTrackDocumentation_form.setFieldValue('docs_assigned.date_doc', uiToday);
		}
	}
});	

/**
 * Display the document for the selected row
 * @param row
 */
function onView(row){
    var record = row.row.getRecord();
    var tableName = record.getValue('docs_assigned.vf_table_name');
    var docName = record.getValue('docs_assigned.doc');
    var fieldName = "doc";
    var keys = {};
    var ds = View.dataSources.get('abEhsTrackDocumentation_ds');
    
    switch (tableName) {
	case 'ehs_training_results':
		var dateKey = ds.formatValue('docs_assigned.date_doc', record.getValue('docs_assigned.date_key'), false);
	    keys = {
    		'training_id': record.getValue('docs_assigned.training_id'),
    		'em_id': record.getValue('docs_assigned.em_id'),
    		'date_actual': dateKey
	    };
	    break;

	case 'ehs_em_ppe_types':
		var dateKey = ds.formatValue('docs_assigned.date_doc', record.getValue('docs_assigned.date_key'), false);
	    keys = {
    		'ppe_type_id': record.getValue('docs_assigned.ppe_type_id'),
    		'em_id': record.getValue('docs_assigned.em_id'),
    		'date_use': dateKey
	    };
	    break;

	case 'ehs_incidents':
		fieldName = "cause_doc";
		keys = {'incident_id': record.getValue('docs_assigned.incident_id')};
	    break;

	case 'ehs_incident_witness':
		keys = {'incident_witness_id': record.getValue('docs_assigned.incident_witness_id')};
	    break;

	case 'ehs_restrictions':
		keys = {'restriction_id': record.getValue('docs_assigned.restriction_id')};
	    break;

	case 'docs_assigned':
	default:
	    keys = {'doc_id': record.getValue('docs_assigned.doc_id')};
	    break;
	}
    
    if (docName != '') {
    	View.showDocument(keys, tableName, fieldName, docName);
    } else {
    	View.showMessage(getMessage("noDocumentAttached"))
    }
    
    
}



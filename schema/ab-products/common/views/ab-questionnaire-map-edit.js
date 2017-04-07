 var questionnaireMapEditController = View.createController('questionnaireMapEditController', {
	
	/**
	 * Edit the question map item.
	 */
	editQuestionnaireMap: function() {
		var qmGrid = this.questionnaireMapGrid;
		var row = qmGrid.rows[qmGrid.selectedRowIndex];
		var questionnaireId = row["questionnaire_map.questionnaire_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('questionnaire_map.questionnaire_id', questionnaireId, '=');
		this.questionnaireMapEditForm.show(true);
		this.questionnaireMapEditForm.refresh(restriction);
	},
	
	/**
	 * Filter the questionnaire map list.
	 */
	filterQuestionnaireConsole_onFilter: function() {
		var restriction = new Ab.view.Restriction();
		var panel = this.filterQuestionnaireConsole;
		var fields = ['questionnaire_map.questionnaire_id', 'questionnaire_map.eq_std', 'questionnaire_map.project_type'];
		_.each(fields, function(field) {
			if (panel.hasFieldMultipleValues(field)) {
				restriction.addClause(field, panel.getFieldMultipleValues(field), 'IN');
			} else {
				var value = panel.getFieldValue(field);
				if(value != null && value != ''){
					restriction.addClause(field, panel.getFieldValue(field), '=');
				}
			}
		});
		this.questionnaireMapGrid.show()
		this.questionnaireMapGrid.refresh(restriction);
	},
	
	/**
	 * Clear the filter console.
	 */
	filterQuestionnaireConsole_onClear: function() {
		this.filterQuestionnaireConsole.clear();
	},
	
	questionnaireMapEditForm_onCancelEditQuestionnaireMap: function() {
		this.questionnaireMapEditForm.show(false);
	},
	
	questionnaireMapEditForm_beforeSave: function() {
		var restriction = new Ab.view.Restriction();
		var form = this.questionnaireMapEditForm;
		var dataSource = this.questionnaireMapDs;
		var projectType = form.getFieldValue('questionnaire_map.project_type');
		var eqStd = form.getFieldValue('questionnaire_map.eq_std');

		// add error trapping to prevent duplicates in the mapping table.
		if (valueExistsNotEmpty(projectType) && valueExistsNotEmpty(eqStd)) {
			restriction.addClause('questionnaire_map.project_type', projectType);
			restriction.addClause('questionnaire_map.eq_std', eqStd);
			var records = dataSource.getRecords(restriction);
			
			if (records.length > 0) {
				form.validationResult.valid = false;
				form.validationResult.message = getMessage('questionnaireMapExists');
				form.validationResult.invalidFields['questionnaire_map.project_type'] = '';
				form.validationResult.invalidFields['questionnaire_map.eq_std'] = '';
				return false;
			} else {
				return true;
			}
			
		} else {
			return false;
		}
	}
});
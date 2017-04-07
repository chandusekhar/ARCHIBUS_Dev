var capitalBudgetGenerateController = View.createController('capitalBudgetGenerate', {
	
	afterInitialDataFetch : function() {
		this.capitalBudgetGenerateConsole_onClear();
	},
	
	capitalBudgetGenerateConsole_onClear : function() {
		this.capitalBudgetGenerateConsole.clear();
		setDefaultDateValues();
		$('update_yes').checked = true;
		$('update_no').checked = false;
	},
	
	capitalBudgetGenerateConsole_onGenerateCapitalBudget : function() {
		var budget_id = this.capitalBudgetGenerateConsole.getFieldValue('prog_budget_items.budget_id');
		if (budget_id == "" || trim($('from_year').value) == "" || trim($('to_year').value) == "") {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		if (!validateConsoleFields()) return;
		var programsites = this.capitalBudgetGenerateConsole.getFieldValue('program.site_id');
		var programtypes = this.capitalBudgetGenerateConsole.getFieldValue('program.program_type');
		
		var parameters = {
			'sites_list': programsites.replace(new RegExp(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,'g'), ';'),
			'program_type_list': programtypes.replace(new RegExp(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,'g'), ';'),
			'from_year': $('from_year').value,
			'to_year': $('to_year').value,
			'budget_id': budget_id,
			'updateBudgetItems': $('update_yes').checked		
		};
		
		try {
			var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-generateProgramBudget', parameters);
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('prog_budget_items.budget_id', budget_id);
				this.capitalBudgetEditItemsTable.refresh(restriction);
			}
		} 
		catch (e) {
			Workflow.handleError(e);
		}
	}	
});

/* Console date functions */

var systemYear = 2025;

function setDefaultDateValues()
{
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	
	$('from_year').value = systemYear;
	$('to_year').value = systemYear+5;
}

function changeYear(amount, fieldId)
{
	if ($(fieldId)) 
	{
		var field_value = $(fieldId).value? parseInt($(fieldId).value) : systemYear+2; 
		$(fieldId).value = amount + field_value;
	}
}

function validateConsoleFields() {
	var timeframeRestriction = "";
	var from_year = trim($('from_year').value);
	var to_year = trim($('to_year').value);
	var objRegExp  = /^-?\d+$/;
	if(!objRegExp.test(from_year) || !objRegExp.test(to_year)){
		View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}	
	if (to_year < from_year) {
	  	View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}
	if (to_year - from_year > 50) {
	  	View.showMessage(getMessage('range_exceeds_maximum'));
	   	return false;
	}
	if (to_year - from_year > 10) {
		var message = String.format(getMessage('range_exceeds_ten'), to_year - from_year);
		return confirm(message);
	}
	return true;
}
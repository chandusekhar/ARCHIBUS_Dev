var capbudFciAnalyzeController = View.createController('capbudFciAnalyze', {
	projects : '',
	buildings : '',
	scenarios : '',
	selected_project : '',
	// overwritten during runtime
	abSchemaSystemGraphicsFolder : '/archibus/schema/ab-system/graphics',
	
	
	afterInitialDataFetch : function() {
		var html = '';
        html += '<input id="capbudFciAnalyzeConsole_projects" name="capbudFciAnalyzeConsole_projects" class="inputField" style="width:1000px;" type="text" onkeypress="View.showMessage(getMessage(\'useSelValButton\'))" onfocus="View.showMessage(getMessage(\'useSelValButton\'))"  maxlength="500" size="500"/>';
        html += '<img class="selectValue_Button" style="z-index:99" value="..." onclick="View.openDialog(\'ab-capbud-fci-analyze-select-proj.axvw\');" src="' + this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif" />';
		$('capbudFciAnalyzeConsole_projects').parentNode.innerHTML = html;
		
        html  = '<input id="capbudFciAnalyzeConsole_scenarios" name="capbudFciAnalyzeConsole_scenarios" class="inputField" style="width:1000px;" type="text" onkeypress="View.showMessage(getMessage(\'useSelValButton\'))" onfocus="View.showMessage(getMessage(\'useSelValButton\'))"  maxlength="500" size="500"/>';
        html += '<img class="selectValue_Button" value="..." onclick="View.openDialog(\'ab-capbud-fci-analyze-select-scn.axvw\');" src="' + this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif" />';
		$('capbudFciAnalyzeConsole_scenarios').parentNode.innerHTML = html;
		
        html  = '<input id="capbudFciAnalyzeConsole_buildings" name="capbudFciAnalyzeConsole_buildings" class="inputField" style="width:1000px;" onkeypress="View.showMessage(getMessage(\'useSelValButton\'))" onfocus="View.showMessage(getMessage(\'useSelValButton\'))"  maxlength="500" size="500"/>';
        html += '<img class="selectValue_Button" value="..." onclick="View.openDialog(\'ab-capbud-fci-analyze-select-bl.axvw\');" src="' + this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif" />';
		$('capbudFciAnalyzeConsole_buildings').parentNode.innerHTML = html;
		
		$('from_yeard').parentNode.innerHTML = '<img id="from_yeard" style="vertical-align:top;border:0;margin:0;padding:0" alt="Up" src="' + this.abSchemaSystemGraphicsFolder + '/but_yeard.gif" onclick="changeYear(1, \'from_year\');"/>';
		$('from_yearu').parentNode.innerHTML = '<img id="from_yearu" style="vertical-align:top;border:0;margin:0;padding:0" alt="Down" src="' + this.abSchemaSystemGraphicsFolder + '/but_yearu.gif" onclick="changeYear(-1, \'from_year\');"/>';
		
		$('to_yeard').parentNode.innerHTML = '<img id="to_yeard" style="vertical-align:top;border:0;margin:0;padding:0" alt="Up" src="' + this.abSchemaSystemGraphicsFolder + '/but_yeard.gif" onclick="changeYear(1, \'to_year\');"/>';
		$('to_yearu').parentNode.innerHTML = '<img id="to_yearu" style="vertical-align:top;border:0;margin:0;padding:0" alt="Down" src="' + this.abSchemaSystemGraphicsFolder + '/but_yearu.gif" onclick="changeYear(-1, \'to_year\');"/>';

		this.setDefaultConsoleValues();
	},
	
	setDefaultConsoleValues : function() {
		$('capbudFciAnalyzeConsole_projects').value = getMessage('allTypes');
		$('capbudFciAnalyzeConsole_scenarios').value = getMessage('allTypes');
		$('capbudFciAnalyzeConsole_buildings').value = getMessage('allTypes');
		setDefaultDateValues();		
	},
	
	capbudFciAnalyzeConsole_onClear : function() {
		this.setDefaultConsoleValues();
		this.projects = null;
		this.buildings = null;
		this.scenarios = null;
		this.capbudFciAnalyzeScenariosTable.addParameter('projRestriction', 'activity_log.project_id IN (activity_log.project_id)');
		this.capbudFciAnalyzeScenariosTable.addParameter('scnRestriction', 'actscns.proj_scenario_id IN (actscns.proj_scenario_id)');
		this.capbudFciAnalyzeScenariosTable.addParameter('blRestriction', 'activity_log.bl_id IN (activity_log.bl_id)');
	},
	
	showConsoleValues : function() {
		$('capbudFciAnalyzeConsole_projects').value = 
			getStrListOfValues(this.projects, 'project.project_id', ', ') == ''? getMessage('allTypes') : getStrListOfValues(this.projects, 'project.project_id', ', ');
		$('capbudFciAnalyzeConsole_buildings').value = 
			getStrListOfValues(this.buildings, 'bl.bl_id', ', ') == ''? getMessage('allTypes') : getStrListOfValues(this.buildings, 'bl.bl_id', ', ');
		$('capbudFciAnalyzeConsole_scenarios').value = 
			getStrListOfValues(this.scenarios, 'actscns.proj_scenario_id', ', ') == ''? getMessage('allTypes') : getStrListOfValues(this.scenarios, 'actscns.proj_scenario_id', ', ');
	},
	
	capbudFciAnalyzeConsole_onShow : function() {
		if (!validateConsoleFields()) return;
		var projRestriction = "";
		if (this.projects && this.projects.length > 0) {
			projRestriction = "activity_log.project_id IN ('";
			projRestriction += getStrListOfValues(this.projects, 'project.project_id', "','");
			projRestriction += "')";
			this.selected_project = this.projects[0].getValue('project.project_id');
			if (this.projects.length == 1) this.capbudFciAnalyzeScenariosTable.appendTitle(this.selected_project);
			else this.capbudFciAnalyzeScenariosTable.appendTitle("");
		}
		else {
			projRestriction = "activity_log.project_id IN (activity_log.project_id)";
			this.selected_project = "";	
			this.capbudFciAnalyzeScenariosTable.appendTitle("");
		}
		this.capbudFciAnalyzeScenariosTable.addParameter('projRestriction', projRestriction);
		
		var scnRestriction = "";
		if (this.scenarios && this.scenarios.length > 0) {
			scnRestriction = "actscns.proj_scenario_id IN ('";
			scnRestriction += getStrListOfValues(this.scenarios, 'actscns.proj_scenario_id', "','");
			scnRestriction += "')";
		}
		else {
			scnRestriction = "actscns.proj_scenario_id IN (actscns.proj_scenario_id)";
		}
		this.capbudFciAnalyzeScenariosTable.addParameter('scnRestriction', scnRestriction);
		
		var blRestriction = "";
		if (this.buildings && this.buildings.length > 0) {
			blRestriction = "activity_log.bl_id IN ('";
			blRestriction += getStrListOfValues(this.buildings, 'bl.bl_id', "','");
			blRestriction += "')";
		}
		else {
			blRestriction = "activity_log.bl_id IN (activity_log.bl_id)";
		}
		this.capbudFciAnalyzeScenariosTable.addParameter('blRestriction', blRestriction);
		
		this.capbudFciAnalyzeScenariosTable.addParameter('fiscal_year_from', trim($('from_year').value)?trim($('from_year').value):'fiscal_years.fiscal_year');
		this.capbudFciAnalyzeScenariosTable.addParameter('fiscal_year_to', trim($('to_year').value)?trim($('to_year').value):'fiscal_years.fiscal_year');
		this.capbudFciAnalyzeScenariosTable.refresh();
		this.capbudFciAnalyzeScenariosTable.show(true);
	},

	createScenarioItems: function(record) {
		var parameters = {
		  		'proj_scenario_id':record.getValue('actscns.proj_scenario_id'),			
				'fiscal_year':record.getValue('actscns.fiscal_year'),
				'project_id':record.getValue('activity_log.project_id')		
		};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-createFCIScenario', parameters);
		if (result.code == 'executed') {
			return true;
		} else {
			alert(result.code + " :: " + result.message);
			return false;
		}
	},
	
	capbudFciAnalyzeAddScenarioForm_afterRefresh: function() {
		if (this.selected_project) this.capbudFciAnalyzeAddScenarioForm.setFieldValue('activity_log.project_id', this.selected_project);		
	}
});

var systemYear = 2025;

function setDefaultDateValues()
{
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	
	$('from_year').value = systemYear;
	$('to_year').value = systemYear+20;
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
	if (from_year == "" && to_year == "") return true;
	var objRegExp  = /^-?\d+$/;
	if(!objRegExp.test(from_year) || !objRegExp.test(to_year)){
		View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}	
	if (to_year < from_year) {
	  	View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}
	return true;
}

function getStrListOfValues(records, fieldname, tokenizer) {
	var str_list = '';
	var i = 0;
	if (records && records.length > 0) {
		for (i = 0; i < records.length-1; i++) {
			str_list += records[i].getValue(fieldname) + tokenizer;			
		}
		str_list += records[i].getValue(fieldname);
	}
	return str_list;
}

function capbudFciAnalyzeGrid_onClick(obj) {
	var controller = View.controllers.get('capbudFciAnalyze');
	controller.selected_project = obj.restriction['project.project_id'];
	var projRestriction = "activity_log.project_id IN ('";
	projRestriction += controller.selected_project;
	projRestriction += "')";
	controller.capbudFciAnalyzeScenariosTable.addParameter('projRestriction', projRestriction);
	controller.capbudFciAnalyzeScenariosTable.addParameter('scnRestriction', 'actscns.proj_scenario_id IN (actscns.proj_scenario_id)');
	controller.capbudFciAnalyzeScenariosTable.addParameter('blRestriction', 'activity_log.bl_id IN (activity_log.bl_id)');
	controller.capbudFciAnalyzeScenariosTable.addParameter('fiscal_year_from', 1900);
	controller.capbudFciAnalyzeScenariosTable.addParameter('fiscal_year_to', 2990);
	controller.capbudFciAnalyzeScenariosTable.refresh();
	controller.capbudFciAnalyzeScenariosTable.show(true);
	controller.capbudFciAnalyzeScenariosTable.appendTitle(controller.selected_project);
}

function capbudFciAnalyzeScenariosTable_onClick(obj) {
	if (obj.restriction.clauses.length == 0) return;
	if (obj.restriction.clauses.length == 1 && obj.restriction.clauses[0].name == 'actscns.fiscal_year') return;
	var restriction = '';
	for (var i = 0; i < obj.restriction.clauses.length; i++) {
		if (restriction != '') restriction += " AND ";
		if(obj.restriction.clauses[i].name == 'actscns.project_scenario_building') {
			var project_scenario_building = obj.restriction.clauses[i].value;
			restriction += "RTRIM(activity_log.project_id) ${sql.concat} '-' ${sql.concat} "; 
			restriction += "RTRIM(actscns.proj_scenario_id) ${sql.concat} '-' ${sql.concat} ";
			restriction += "RTRIM(activity_log.bl_id)  = \'" + project_scenario_building + "\' ";
		}
		else if(obj.restriction.clauses[i].name == 'actscns.fiscal_year') {
			restriction += "RTRIM(actscns.fiscal_year) = '" + obj.restriction.clauses[i].value + "\' ";		
		}
	}
	View.openDialog("ab-capbud-fci-analyze-items.axvw", restriction);
}

function saveScenario() {
	var controller = View.controllers.get('capbudFciAnalyze');
	var record = controller.capbudFciAnalyzeAddScenarioForm.getRecord();
	if (record.getValue('actscns.proj_scenario_id') == '' || record.getValue('activity_log.project_id') == '' || record.getValue('actscns.fiscal_year') == '') {
		View.showMessage(getMessage('emptyRequiredFields'));
		return false;
	}
	controller.createScenarioItems(record);
	controller.capbudFciAnalyzeScenariosTable.refresh();
}
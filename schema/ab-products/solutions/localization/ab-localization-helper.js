function populateLanguage(default_language){
	var languageSelect = $('language');

	// call WFR to get list of languages
	var parameters = {
		tableName: 'lang_lang',
		fieldNames: toJSON(['lang_lang.language', 'lang_lang.is_default_language', 'lang_lang.locale', 'lang_lang.lang_to_fld_mapping']),
		sortValues: toJSON([{
			fieldName: "lang_lang.language",
			sortOrder: 1
    }])
	};
	
	try {
		var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
		var default_language_index = 0;
		
		// create a new option with empty			
		var option = document.createElement('option');
		option.appendChild(document.createTextNode(""));
		languageSelect.appendChild(option);
					
		for (var i = 0; i < result.data.records.length; i++) {
			var record = result.data.records[i];
			var language = record['lang_lang.language'];
			var lang_to_fld_mapping  = record['lang_lang.lang_to_fld_mapping'];
			var is_default_language = record['lang_lang.is_default_language'];
			var locale = record['lang_lang.locale'];
										
			// create a new option			
			var option = document.createElement('option');
			option.value = language;
			option.name = lang_to_fld_mapping.toLowerCase();
			option.locale = locale;

			// set default language
			if (language == default_language){
				option.selected = true;				
			}
			
			option.appendChild(document.createTextNode(language));
			languageSelect.appendChild(option);
		}
		
		// setDefaultLanguage(default_language_index);
	} catch (e) {
		Workflow.handleError(e);
	}
}

function setLocLanguage() {
	window.top.locLanguage = $('language').value;
}

function showInserted(language, type){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('lang_' + type + '.language', language,'=');
	restriction.addClause('lang_' + type + '.transfer_status','INSERTED','=');
	View.openDialog('ab-localization-inserted-lang-' + type + '.axvw', restriction, false, 20, 40, 800, 600);
}


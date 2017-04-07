var localizationReadWriteTablesController = View.createController('localizationReadWriteTables', {
	language: null,
	dbExtension: null,
	bSchema: null,
	bPNav: null,
	bOther: null,
	bOnlyUntranslated: null,
	errorMsg: null,
	
	afterInitialDataFetch: function(){
		var grid = this.abLocalizationReadWriteTablesHiddenPanel;
		var rows = grid.rows;
		var default_language = '';
		
		// if  a record in the Language (lang_lang) table has its "Default Language" set to Yes, that language is used.
		// otherwise, the value of the "Language" control is set in Javascript memory and is shared with other views.
		if (rows.length == 1){
			var row = rows[0];
			default_language = row['lang_lang.language'];

		} else {
			default_language = window.top.locLanguage;
		}		
		populateLanguage(default_language);
	},
	
	setLanguageAndDbExtension: function(){		
		var languageSelect = $('language');		
		this.language = languageSelect.value;
		this.dbExtension = languageSelect.options[languageSelect.selectedIndex].name;
	},
	
	setSchema: function(){
		this.bSchema=$('abLocalizationReadWriteTables_lang_strings.tablesToInclude.schema').checked;
	},
	
	setPNav: function(){
		this.bPNav=$('abLocalizationReadWriteTables_lang_strings.tablesToInclude.pNav').checked;
	},
	
	setOther: function(){
		this.bOther=$('abLocalizationReadWriteTables_lang_strings.tablesToInclude.other').checked;
	},
	
	setOnlyUntranslated: function(){
		this.bOnlyUntranslated=$('abLocalizationReadWriteTables_lang_strings.onlyUntranslated').checked;
	},

	setCommonSelectedOptions: function(){
		this.setLanguageAndDbExtension();
		this.setSchema();
		this.setPNav();
		this.setOther();
		this.setOnlyUntranslated();
	},
			
	checkCommonFormSelections: function(){
		this.errorMsg = '';
		if (!valueExistsNotEmpty(this.language)){
			this.errorMsg += getMessage('noLanguage') + '<br/>';
		}
		if ( !this.bSchema && !this.bPNav && !this.bOther ){
			this.errorMsg += getMessage('noTableTypes')  + '<br/>';
		}
	},
		
	abLocalizationReadWriteTablesConsolePanel_onReadTables: function(){
		var path = View.originalRequestURL;
		var viewName = path.substring(path.lastIndexOf('/') + 1);
		var newPath = path.replace(viewName, 'ab-localization-edit-lang-enum.axvw');
		var newPath2 = path.replace(viewName, 'ab-localization-edit-lang-strings.axvw');
				
		this.setCommonSelectedOptions();
		this.checkCommonFormSelections();

		if (this.errorMsg != ''){
			View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationRead-readTranslatableTables', this.language, this.bSchema, this.bPNav, this.bOther);
				var panel = this.abLocalizationReadWriteTablesConsolePanel;
				var language = this.language;
				View.openJobProgressBar(getMessage('readingTables'), jobId, '', function(status) {
					if(status.jobFinished == true){
						panel.setFieldValue('affectedEnums', '<a href="javascript://" onclick="showInserted(' + "'" + language + "', 'enum'" + ')">' + status.jobProperties.affectedEnums + ' ' + getMessage('records')  + '</a>');
						panel.setFieldValue('affectedStrings', '<a href="javascript://" onclick="showInserted(' + "'" + language + "', 'strings'" + ')">' + status.jobProperties.affectedStrings + ' ' + getMessage('records')  + '</a>');
					// panel.setFieldValue('affectedStrings', '<a href="' + newPath + '" target="_blank">' + status.jobProperties.affectedStrings + ' ' + getMessage('records') + '</a>');	
					}				
				});
			} catch (e) {
				Workflow.handleError(e);
			}			        			
		}
	},	
			
	abLocalizationReadWriteTablesConsolePanel_onWriteTables: function(){
		this.setCommonSelectedOptions();
		this.setOnlyUntranslated();
		this.checkCommonFormSelections();
				
		if (this.errorMsg !=''){
			View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationWrite-writeTranslatableTables', this.language, this.bSchema, this.bPNav, this.bOther, this.bOnlyUntranslated, this.dbExtension);
				var panel = this.abLocalizationReadWriteTablesConsolePanel;
				View.openJobProgressBar(getMessage('writingTables'), jobId, '', function(status) {			
				});				
			} catch (e) {
				Workflow.handleError(e);
			}	
		}
	}
});


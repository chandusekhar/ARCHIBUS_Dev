var localizationExportImportGlosController = View.createController('localizationExportImportGlos', {
	language: null,
	dbExtension: null,
	stringsToInclude: null,
	format: null,
	errorMsg: null,
	
	afterInitialDataFetch: function(){
		var grid = this.abLocalizationExportImportGlosHiddenPanel;
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

	setStringsToInclude: function(){		
		var stringsToInclude = document.getElementsByName('abLocalizationExportImportGlos.stringsToInclude');	
		for (var i=0; i<stringsToInclude.length; i++){
			if (stringsToInclude[i].checked == true){
				this.stringsToInclude = stringsToInclude[i].value;
			}
		}
	},
	
	setFormat: function(){
		var formats = document.getElementsByName('abLocalizationExportImportGlos.format');	
		for (var i=0; i<formats.length; i++){
			if (formats[i].checked == true){
				this.format = formats[i].value;
			}
		}	
	},
			
	checkCommonInputs: function(){	
		this.errorMsg = '';
		if (!valueExistsNotEmpty(this.language)){
			this.errorMsg += getMessage('noLanguage') + '<br/>';
		}
		if (!valueExistsNotEmpty(this.stringsToInclude)){
			this.errorMsg += getMessage('noStringsToInclude')  + '<br/>';
		}
	},

	checkExportInputs: function(){	
		this.checkCommonInputs();
		if (!valueExistsNotEmpty(this.format)){
			this.errorMsg += getMessage('noFormat')  + '<br/>';
		}
	},

	checkImportInputs: function(){	
		this.errorMsg = '';
		
		if (!valueExistsNotEmpty(this.language)){
			this.errorMsg += getMessage('noLanguage') + '<br/>';
		}
	},
		
	abLocalizationExportImportGlosConsolePanel_onExport: function(){
		this.setLanguageAndDbExtension();
		this.setStringsToInclude();
		this.setFormat();
		this.checkExportInputs();
							
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationImportExport-exportGlossaryFiles', this.language, this.stringsToInclude, this.format, this.dbExtension.toUpperCase());
				var controller = this;
				
				View.openJobProgressBar(getMessage('exporting'), jobId, '', function(status) {
					if(status.jobFinished == true){
						var href = status.jobProperties.dtPath;
						controller.abLocalizationExportImportGlosConsolePanel.setFieldValue('dtPathLinks', href);
						controller.abLocalizationExportImportGlosConsolePanel.setFieldLabel('dtPathLinks', getMessage('exportedFiles'));
					}										
				});
			} catch (e) {
				Workflow.handleError(e);
			}
		}	
	},
				
	abLocalizationExportImportGlosConsolePanel_onImport: function(){
		this.setLanguageAndDbExtension();
		this.checkImportInputs();
			
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
				var url = 'ab-localization-transfer-main.axvw';
				window.open(url);
		}	
	},
	
	abLocalizationExportImportGlosConsolePanel_onRead: function(){
		this.setLanguageAndDbExtension();
		this.setStringsToInclude();
		this.checkCommonInputs();
		
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationGlossary-readStringsIntoGlossary', this.language, this.stringsToInclude);
				var controller = this;
				var panel = controller.abLocalizationExportImportGlosConsolePanel;
				var language = this.language;
				
				View.openJobProgressBar(getMessage('reading'), jobId, '', function(status) {
					if(status.jobFinished == true){
						panel.setFieldValue('lang_glossaryAffected', '<a href="javascript://" onclick="showInserted(' + "'" + language + "', 'glossary'" + ')">' + status.jobProperties.affectedLangFiles + ' ' + getMessage('records')  + '</a>');
						// panel.setFieldValue('lang_glossaryAffected', status.jobProperties.affectedLangFiles + ' ' + getMessage('records'));
					}											
				});
			} catch (e) {
				Workflow.handleError(e);
			}
		}	
	},
	
	abLocalizationExportImportGlosConsolePanel_onWrite: function(){
		this.setLanguageAndDbExtension();
		this.setStringsToInclude();
		this.checkCommonInputs();
		
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationGlossary-writeStringsFromGlossary', this.language, this.stringsToInclude);
				var controller = this;
				var panel = controller.abLocalizationExportImportGlosConsolePanel;
				
				View.openJobProgressBar(getMessage('writing'), jobId, '', function(status) {
					if(status.jobFinished == true){
						panel.setFieldValue('affectedFiles', status.jobProperties.affectedFiles + ' ' + getMessage('records'));											
						panel.setFieldValue('affectedStrings', status.jobProperties.affectedStrings + ' ' + getMessage('records'));	
						panel.setFieldValue('affectedEnums', status.jobProperties.affectedEnums + ' ' + getMessage('records'));
					}	
				});
			} catch (e) {
				Workflow.handleError(e);
			}
		}	
	}			
});

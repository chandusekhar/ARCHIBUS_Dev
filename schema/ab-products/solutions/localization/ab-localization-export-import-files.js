var localizationExportImportFilesController = View.createController('localizationExportImportFiles', {
	language: null,
	dbExtension: null,
	stringsToInclude: null,
	format: null,
	errorMsg: null,
	
	
	afterInitialDataFetch: function(){
		var grid = this.abLocalizationExportImportFilesHiddenPanel;
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
		var stringsToInclude = document.getElementsByName('abLocalizationExportImportFiles.stringsToInclude');	
		for (var i=0; i<stringsToInclude.length; i++){
			if (stringsToInclude[i].checked == true){
				this.stringsToInclude = stringsToInclude[i].value;
			}
		}
	},
	
	setFormat: function(){
		var formats = document.getElementsByName('abLocalizationExportImportFiles.format');	
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
	},

	checkExportInputs: function(){	
		this.checkCommonInputs();

		if (!valueExistsNotEmpty(this.stringsToInclude)){
			this.errorMsg += getMessage('noStringsToInclude')  + '<br/>';
		}
		
		if (!valueExistsNotEmpty(this.format)){
			this.errorMsg += getMessage('noFormat')  + '<br/>';
		}
	},

	checkImportInputs: function(){	
		this.checkCommonInputs();	  
	},
		
	abLocalizationExportImportFilesConsolePanel_onExport: function(){
		this.setLanguageAndDbExtension();
		this.setStringsToInclude();
		this.setFormat();
		this.checkExportInputs();
							
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationImportExport-exportExtractFiles', this.language, this.stringsToInclude, this.format, this.dbExtension.toUpperCase());
				var controller = this;
				
				View.openJobProgressBar(getMessage('exporting'), jobId, '', function(status) {
					if(status.jobFinished == true){
						var href = status.jobProperties.dtPath;
						controller.abLocalizationExportImportFilesConsolePanel.setFieldValue('dtPathLinks', href);
						controller.abLocalizationExportImportFilesConsolePanel.setFieldLabel('dtPathLinks', getMessage('exportedFiles'));	
					}									
				});
			} catch (e) {
				Workflow.handleError(e);
			}
		}	
	},
				
	abLocalizationExportImportFilesConsolePanel_onImport: function(){
		this.setLanguageAndDbExtension();
		this.setStringsToInclude();
		this.setFormat();
		this.checkImportInputs();
		
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
				var url = 'ab-localization-transfer-main.axvw';
				window.open(url);
		}		
	}	
});

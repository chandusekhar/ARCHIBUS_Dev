var localizationDeleteAllLocTablesController = View.createController('localizationDeleteAllLocTables', {
	language: null,
	dbExtension: null,
	bFiles: false,
	bEnums: false,
	bStrings: false,
	bGlossary: false,
	bRemoveGreeked: true,
	errorMsg: null,

	afterInitialDataFetch: function(){
		var grid = this.abLocalizationGreekTablesHiddenPanel;
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

	setLanguage: function(){	
		var languageSelect = 	$('language');
		this.language= languageSelect.value;
		this.dbExtension = languageSelect.options[languageSelect.selectedIndex].name;
	},
			
	setFiles: function(){		
		this.bFiles=$('abLocalizationDeleteAllLocTables_tables.files').checked;
	},
	
	setEnums: function(){		
		this.bEnums=$('abLocalizationDeleteAllLocTables_tables.enums').checked;
	},

	setStrings: function(){		
		this.bStrings=$('abLocalizationDeleteAllLocTables_tables.strings').checked;
	},			

	setGlossary: function(){		
		this.bGlossary=$('abLocalizationDeleteAllLocTables_tables.glossary').checked;
	},
	
	setRemoveGreeked: function(){
		var stringsToDelete = document.getElementsByName('abLocalizationGreekTables.stringsToDelete');	
		for (var i=0; i<stringsToDelete.length; i++){
			if (stringsToDelete[i].checked == true){
				this.bRemoveGreeked = stringsToDelete[i].value;
			}
		}		
	},	
		
	setValues: function(){
		this.setLanguage();
		this.setFiles();
		this.setEnums();
		this.setStrings();
		this.setGlossary();
		this.setRemoveGreeked();
	},

	checkInputs: function(){	
		this.errorMsg = '';
		if (!valueExistsNotEmpty(this.language)){
			this.errorMsg += getMessage('noLanguage') + '<br/>';
		}
		if (!this.bFiles && !this.bEnums && !this.bStrings && !this.bGlossary ){
			this.errorMsg += getMessage('noTable')  + '<br/>';
		}
	},
	
	abLocalizationDeleteAllLocTablesConsolePanel_onDelete: function(){
		this.setValues();
		this.checkInputs();
			
		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
			var controller = this;
			var msg = getMessage('deleteConfirmation');
			View.confirm(msg, function(button) {
				if (button == 'yes') {
					controller.deleteTables();
				}
			});	
		}	
	},
	
	deleteTables: function(){
		var panel = this.abLocalizationDeleteAllLocTablesConsolePanel;
		
		try {				
			var jobId = Workflow.startJob(
				'AbSystemAdministration-LocalizationWrite-deleteLocalizationTables', this.bFiles, this.bEnums, this.bStrings, this.bGlossary, this.language, this.dbExtension, this.bRemoveGreeked);
			View.openJobProgressBar(getMessage('deleting'), jobId, '', function(status) {
			});
		} catch (e) {
			Workflow.handleError(e);
		}
	}	
});

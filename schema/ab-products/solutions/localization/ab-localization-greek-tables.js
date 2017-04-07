var localizationGreekTablesController = View.createController('localizationGreekTables', {
	language: null,
	dbExtension: null,
	type: null,
	bEmpty: false,
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

	setType: function(){	
		var types = document.getElementsByName('abLocalizationGreekTables.type');	
		for (var i=0; i<types.length; i++){
			if (types[i].checked == true){
				this.type = types[i].value;
			}
		}		
	},
		
	setStringsToGreek: function(){
		var stringsToGreek = document.getElementsByName('abLocalizationGreekTables.stringsToGreek');	
		for (var i=0; i<stringsToGreek.length; i++){
			if (stringsToGreek[i].checked == true){
				this.bEmpty = stringsToGreek[i].value;
			}
		}		
	},

	checkInputs: function(){	
		this.errorMsg = '';
		if (!valueExistsNotEmpty(this.language)){
			this.errorMsg += getMessage('noLanguage') + '<br/>';
		}
		if (!valueExistsNotEmpty(this.type)){
			this.errorMsg += getMessage('noType')  + '<br/>';
		}
	},
			
	abLocalizationGreekTablesConsolePanel_onGreek: function(){
		this.setLanguage();
		this.setType();
		this.setStringsToGreek();
		this.checkInputs();
		var msg = (this.bEmpty == 'true') ? getMessage('greekingConfirmationLimited') : getMessage('greekingConfirmationAll');

		if (this.errorMsg != ''){
				View.showMessage(this.errorMsg);
		} else {
			  var controller = this;
				View.confirm(msg, function(button) {
				if (button == 'yes') {
					controller.greekTables();
				}
		});	
		}	
	},
	
	greekTables: function(){
		try {
			var jobId = Workflow.startJob('AbSystemAdministration-LocalizationGreek-greekLangTables', this.language, this.type, this.dbExtension, this.bEmpty);
			var controller = this;
			
			View.openJobProgressBar(getMessage('greeking'), jobId, '', function(status) {
				});
		} catch (e) {
			Workflow.handleError(e);
		}
	}	
});


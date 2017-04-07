var localizationReadWriteFilesController = View.createController('localizationReadWriteFiles', {
	language: null,
	dbExtension: null,
	locale: null,
	activityDir: null,
	activityId: null,
	bAxvwXslJsp: false,
	bJs: false,
	bJava: false,
	bResx: false,
	bMnu: false,
	bMobile: false,
	bCore: false,
	whenWriting: -1,
	errorMsg: null,
	
	afterInitialDataFetch: function(){
		var grid = this.abLocalizationReadWriteFilesHiddenPanel;
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
		this.locale = trim(languageSelect.options[languageSelect.selectedIndex].locale);
	},

	setActivityToInclude: function(){
		if($('abLocalizationReadWriteFiles_lang_files.activitiesToInclude.all').checked == true){	
			// if include all activities was selected, pass in 'ab-products' folder	
			this.activityDir= '/ab-products/';
		} else if($('abLocalizationReadWriteFiles_lang_files.activitiesToInclude.single').checked == true){
			if ($('activityDir').value == ''){
				View.showMessage(getMessage('noActivityToInclude'));
			} else {
				var activityDir = $('activityDir').value;
				this.activityDir= activityDir.replace(/\\/g, '/');
			}		
		} else if($('abLocalizationReadWriteFiles_lang_files.activitiesToInclude.mobile').checked == true){
			this.activityDir= '/ab-products/common/mobile/';
		}
		this.activityId = $('activityId').value;
	},

	setAxvwXslJsp: function(){
		this.bAxvwXslJsp=$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').checked;
	},

	setJs: function(){
		this.bJs=$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').checked;
	},

	setJava: function(){
		this.bJava=$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').checked;
	},	

	setResx: function(){
		this.bResx=$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').checked;
	},

	setMnu: function(){
		this.bMnu=$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').checked;
	},
	
	setMobile: function(){
		this.bMobile=$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked;
	},
	
	setCore: function(){
		this.bCore=$('abLocalizationReadWriteFiles_lang_files.fileTypesToInclude.coreFiles').checked;
	},		
	
	setWhenWriting: function(){
		if ($('abLocalizationReadWriteFiles_lang_files.fileWriting.append').checked){
			this.whenWriting=0;
		}
		if ($('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate').checked){
			this.whenWriting=1;
		}		
		if ($('abLocalizationReadWriteFiles_lang_files.fileWriting.extension').checked){
			this.whenWriting=2;
		}	
	},	
	
	setCommonSelectedOptions: function(){
		this.setLanguageAndDbExtension();
		this.setActivityToInclude();
		this.setAxvwXslJsp();
		this.setJs();
		this.setJava();
		this.setResx();
		this.setMnu();
		this.setMobile();
		this.setCore();
	},

	checkCommonFormSelections: function(){
		this.errorMsg = '';
		
		// check language
		if (!valueExistsNotEmpty(this.language)){
			this.errorMsg += getMessage('noLanguage') + '<br/>';
		}
		
		// check activity to include
		if (!valueExistsNotEmpty(this.activityDir)){
			this.errorMsg += getMessage('noActivityToInclude')  + '<br/>' ;
		}

		// if specific activity selected, check that a subfolder was specified
    var subfolderPrompt = String(getMessage('subfolderPrompt'));
		if (this.activityDir == convertFromXMLValue(subfolderPrompt)){
			this.errorMsg += getMessage('emptySubfolder') + '<br/>';
		}
		
		// check for at least one filetype specified
		if ( !this.bAxvwXslJsp && !this.bJs && !this.bJava && !this.bResx && !this.bMnu && !this.bMobile){
			this.errorMsg += getMessage('noFileTypes')  + '<br/>';
		}
		// return this.errorMsg;
	},
							
	abLocalizationReadWriteFilesConsolePanel_onReadFiles: function(){
		this.setCommonSelectedOptions();
		this.checkCommonFormSelections();
		
		if (this.errorMsg != ''){
			View.showMessage(this.errorMsg);
		} else {
			try {	
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationRead-readTranslatableFiles', this.language, this.activityDir, this.bAxvwXslJsp, this.bJava, this.bJs, this.bResx, this.bMnu, this.bCore, this.bMobile);
				var controller = this;
				var panel = this.abLocalizationReadWriteFilesConsolePanel;
				var language = this.language;
				
				View.openJobProgressBar(getMessage('reading'), jobId, '', function(status) {
					if(status.jobFinished == true){
						// panel.setFieldValue('affectedFiles', status.jobProperties.affectedFiles + ' ' + getMessage('records'));
						panel.setFieldValue('affectedFiles', '<a href="javascript://" onclick="showInserted(' + "'" + language + "', 'files'" + ')">' + status.jobProperties.affectedFiles + ' ' + getMessage('records')  + '</a>');
					}												
				});
			} catch (e) {
				Workflow.handleError(e);
			}	
		}
	},	
			
	abLocalizationReadWriteFilesConsolePanel_onWriteFiles: function(){
		this.setCommonSelectedOptions();
		this.setWhenWriting();
		this.checkCommonFormSelections();
		if (this.whenWriting == -1){
			this.errorMsg += getMessage('whenWritingMsg');
		}
		if (this.errorMsg !=''){
			View.showMessage(this.errorMsg);
		} else {
			try {
				var jobId = Workflow.startJob('AbSystemAdministration-LocalizationWrite-writeTranslatableFiles', this.language, this.activityDir, this.bAxvwXslJsp, this.bJs, this.bJava, this.bResx, this.bMnu, this.bMobile, this.bCore, this.whenWriting, this.activityId, this.dbExtension, this.locale);
				var controller = this;
				
				View.openJobProgressBar(getMessage('writing'), jobId, '', function(status) {
									
				});
			} catch (e) {
				Workflow.handleError(e);
			}					
		}
	}
});

function selectActivityToInclude(){
    View.selectValue({
    	formId: 'abLocalizationReadWriteFilesConsolePanel',
    	title: 'subfolder',
    	fieldNames: ['activityDir'],
    	selectTableName: 'afm_activities',
    	selectFieldNames: ['afm_activities.subfolder'],
    	visibleFieldNames: ['afm_processes.activity_id', 'afm_activities.title', 'afm_activities.subfolder'],
    	restriction: "(EXISTS(SELECT * FROM afm_activities WHERE afm_activities.activity_id = afm_processes.activity_id AND afm_activities.subfolder NOT LIKE '\\ab-products\\solutions%' AND afm_activities.subfolder NOT LIKE '\\adn-products\\solutions%' AND afm_activities.is_active=1 AND afm_processes.process_type IN ('WEB', 'WEB-DASH')))",
    	actionListener: 'afterSelectVActivityToInclude',
    	showIndex: false,
    	width: 1000,
    	height: 500
    });
}

function afterSelectVActivityToInclude(fieldName, selectedValue, previousValue, selectedValueRaw, rows){
	if (valueExistsNotEmpty(selectedValue)){
		$('activityDir').value = selectedValue;		
	} else {
		View.showMessage(getMessage('emptySubfolder'));
		$('activityDir').value = convertFromXMLValue(getMessage('subfolderPrompt'));
		$('activityDir').focus();
		$('activityDir').select();
	}
	
	// store activity_id
	$('activityId').value = rows[0]['afm_processes.activity_id'];
}

function toggle(){
	  var appendChckBx = $('abLocalizationReadWriteFiles_lang_files.fileWriting.append');
	  var recreateChckBx = $('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate');
	  var coreChckBx = $('abLocalizationReadWriteFiles_lang_files.fileTypesToInclude.coreFiles');
	  var extensionChckBx = $('abLocalizationReadWriteFiles_lang_files.fileWriting.extension');
	  var jsChckBx = $('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js');
	  var resxChckBx = $('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx');
	  var mnuChckBx = $('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu');
	  if (coreChckBx.checked == true){
	  	appendChckBx.disabled=true;
	  	appendChckBx.checked=false;
	  	recreateChckBx.checked=true;
	  	extensionChckBx.disabled=true;
	  	$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').disabled=false;
	  	$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').checked=true;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').disabled=false;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').checked=true;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').disabled=false;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').checked=true;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked=true;
	  } else {
		  	if($('abLocalizationReadWriteFiles_lang_files.activitiesToInclude.single').checked == true){
				appendChckBx.disabled=false;
				appendChckBx.checked=true;
				recreateChckBx.disabled=true;
				recreateChckBx.checked=false;
	  		} else {
	  		  	appendChckBx.disabled=true;
	  		  	appendChckBx.checked=false;
	  		  	recreateChckBx.checked=true;
	  		  	extensionChckBx.disabled=true;
	  		}
			// extensionChckBx.disabled=false;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').disabled=true;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').disabled=true;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').disabled=true;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').checked=false;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').checked=false;
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').checked=false;		
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').disabled=true;	
			$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked=false;	
	  }
}	

function onClickActivitiesToIncludeAll(){
		var core = $('abLocalizationReadWriteFiles_lang_files.fileTypesToInclude.coreFiles');
		core.disabled=false;
		core.checked=true;
		toggle();
		
		$('activityToIncludeOption').style.display='none';
		$('activityDir').value='';		
		
		// if the user selects �include a single activity�, allow the �delete existing ARCHIBUS language files and recreate� option.
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate').disabled=false;
		
		// allow �create new language files for personalized extension� for single activity
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.extension').disabled=true;	
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.extension').checked=false;		

		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').disabled=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').checked=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').disabled=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').checked=true;

		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').disabled=false;	
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked=true;	
}
	
function onClickActivitiesToIncludeSingle(){		
		$('abLocalizationReadWriteFiles_lang_files.fileTypesToInclude.coreFiles').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileTypesToInclude.coreFiles').checked=false;
		$('activityToIncludeOption').style.display='';
		toggle();
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.js').checked=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.resx').checked=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mnu').checked=false;
				
		// if the user selects �include a single activity�, disallow the �delete existing ARCHIBUS language files and recreate� option.
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate').checked=false;	
		
		// allow �create new language files for personalized extension� for single activity
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.extension').disabled=false;	

		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').disabled=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').checked=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').disabled=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').checked=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').disabled=true;	
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked=false;	
}


function onClickActivitiesToIncludeMobile(){
		onClickActivitiesToIncludeSingle();
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked=true;	
		$('activityToIncludeOption').style.display='none';
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.java').checked=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.axvw').checked=false;
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').disabled=false;	
		$('abLocalizationReadWriteFiles_lang_files.fileFormatToInclude.mobile').checked=true;	
		
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.extension').disabled=true;
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate').disabled=false;
		$('abLocalizationReadWriteFiles_lang_files.fileWriting.recreate').checked=true;			
}

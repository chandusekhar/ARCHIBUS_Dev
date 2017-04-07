// ab-localization-edit-lang-files.js
//
var localizationEditLangFilesController = View.createController('localizationEditLangFiles', {

	afterInitialDataFetch: function() {
		var grid =  View.panels.get('abLocalizationEditLangFilesHiddenPanel');
        var rows = grid.rows;                       
        var default_language = '';
                        
        if (rows.length == 1){
			var row = rows[0];
            default_language = row['lang_lang.language'];
		} 
		else {
			default_language = window.top.locLanguage;
        }
        populateLanguage(default_language);
        this.setFilterAndRender();
	},

                    
	abLocalizationEditLangFiles_consolePanel_onShowResults: function() {
		this.setFilterAndRender();
	},

	abLocalizationEditLangFiles_consolePanel_onSetFilterAndRender: function() {
		this.setFilterAndRender();
	},

    setFilterAndRender: function() {
        var restriction = new Ab.view.Restriction();
        var sqlRest = '';
        var console = View.panels.get('abLocalizationEditLangFiles_consolePanel');
                                         
        var language = Ext.get('language').dom.value;
        if (language != '') {
			restriction.addClause('lang_files.language', language + '%', 'LIKE');
            sqlRest += "lang_files.language LIKE '" + language + "%' AND ";
        }
                            
        var fileTypeObj = Ext.get('filetype').dom;  
        var fileType= fileTypeObj.options[fileTypeObj.selectedIndex].value;
        if (fileType != '') {
			if (fileType == '%.js') {
				restriction.addClause('lang_files.constant', '%||%', 'LIKE');
                sqlRest += "lang_files.constant LIKE ''" + '%||% ' + "' AND ";
            }    
            restriction.addClause('lang_files.filename', fileType, 'LIKE');
            sqlRest += "lang_files.filename LIKE '" + fileType + "' AND ";                                     
        }
                                                 
        var report = View.panels.get('abLocalizationEditLangFiles_detailsPanel');
        if (Ext.get('abLocalizationEditLangFiles.longStrings').dom.checked) {
			sqlRest += 'length(lang_files.string_trans) > 2000';   
            report.refresh(sqlRest);
        }
		else {
			report.refresh(restriction);
        }

        report.show(true);
    },
		
	
	abLocalizationEditLangFiles_consolePanel_onFindMistranslatedParams: function() {
		var report = View.panels.get('abLocalizationEditLangFiles_detailsPanel'); 
		var console = View.panels.get('abLocalizationEditLangFiles_consolePanel');
                        
		try {
			var result = Workflow.callMethod(
				'AbSystemAdministration-LocalizationRead-findMistranslatedParams', 
				Ext.get('language').dom.value, 
				'ab-localization-edit-lang-files.axvw', 
				'abLocalizationEditLangFiles_ds_0');
			report.setRecords(result.dataSet.records);
			report.show(true);
		} 
		catch (e) {
			Workflow.handleError(e);
		}
	}					 
});

function clearPanel() {
	Ext.get('language').dom.selectedIndex = 0;
    Ext.get('filetype').dom.selectedIndex = 0;
    Ext.get('abLocalizationEditLangFiles.longStrings').dom.checked = false;
}       

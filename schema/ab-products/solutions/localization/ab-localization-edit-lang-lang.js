// prevent users from specifying more than one default language
// check if a default language already exists.  if so, don't save.
function beforeSaveForm(){
	var grid = View.panels.get('abLocalizationEditLangLang_treePanel');
	var rows = grid.rows;
	var form_language = $('lang_lang.language').value;
	var form_is_default_language = $('lang_lang.is_default_language').value;
	var form_locale = $('lang_lang.locale').value;

	// check locale	
	if(!form_locale.match(/[a-z]{2}_[A-Z]{2}/) && !form_locale.match(/^[a-z]{2}$/)){
		alert(getMessage('invalidLocale'));
		return false;
	}
				
	if (form_is_default_language == 1){
		var proceed = false;
		for(var i=0; i<rows.length; i++){
			var row = grid.rows[i];

			if ((row['lang_lang.is_default_language'] == 'Yes') && (row['lang_lang.language'] != form_language) ){
				var answer = confirm(getMessage('overwrite'));
				if (answer) {					
					var record = new Ab.data.Record({
						'lang_lang.language': row['lang_lang.language'],
						'lang_lang.is_default_language': 0
					}, false);
										
					var oldValues = new Object();
					record.oldValues["lang_lang.language"] = row['lang_lang.language'];	
					record.oldValues["lang_lang.is_default_language"] = 1;
					record.oldValues["lang_lang.locale"] = row['lang_lang.locale'];				
										
					try{
						var ds = grid.getDataSource(grid.dataSourceId);
						ds.saveRecord(record);
					} catch(e){
						View.showMessage('error', '', e.message, e.data);
					}

				} else {
					return false;
				}
			}
		}
	}			
}

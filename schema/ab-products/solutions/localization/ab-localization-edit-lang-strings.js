                     function afterViewLoad(){     
                             var consolePrefix = 'abLocalizationEditLangStrings_consolePanel_';                            
                             setup_enum_field(consolePrefix, 'lang_strings', 'string_type');                                         
                     }

                    function afterInitialDataFetch(){
                        var grid =  View.panels.get('abLocalizationEditLangSringsHiddenPanel');
                        var rows = grid.rows;
                        var default_language = '';
                        
                        if (rows.length == 1){
                            var row = rows[0];
                            default_language = row['lang_lang.language']; 
                        } else {
                             default_language = window.top.locLanguage;
                        }
                        populateLanguage(default_language);
                        setFilterAndRender()
                    }
                    
                    function setFilterAndRender() {
                           var restriction = new Ab.view.Restriction();
                           var sqlRest = '';
                           var console = View.panels.get('abLocalizationEditLangStrings_consolePanel');                 
                           var language = Ext.get('language').dom.value;
                           if (language != '') {
                                     restriction.addClause('lang_strings.language', language + '%', 'LIKE');
                                     sqlRest += "lang_strings.language LIKE '" + language + "%' AND ";
                            }
                            
                           var string_type = console.getFieldValue('lang_strings.string_type');
                           if (string_type != '') {
                                    restriction.addClause('lang_strings.string_type', string_type, '=');
                                    sqlRest += "lang_strings.string_type LIKE '" + string_type + "%' AND ";
                            }

                         var report = View.panels.get('abLocalizationEditLangStrings_detailsPanel');                          
                         if (Ext.get('abLocalizationEditLangStrings.longStrings').dom.checked){
                                    sqlRest += '(length(lang_strings.string_trans) > 128) AND (string_type=7 OR string_type=11 OR string_type=13 OR string_type=14)';   
                                    report.refresh(sqlRest);
                          }  else {
                                    report.refresh(restriction);
                          }                                                                
                 }  
                 
                    function clearPanel(){
                         Ext.get('language').dom.selectedIndex = 0;
                         Ext.get('abLocalizationEditLangStrings.longStrings').dom.checked = false;
                    } 
                    
                    function translateSimilarSlHeadings() {                  	                    	
                        try {
                        	var jobId = Workflow.startJob('AbSystemAdministration-LocalizationRead-translateSimilarSlHeadings', Ext.get('language').dom.value, 'ab-localization-edit-lang-strings.axvw', 'abLocalizationEditLangStrings_ds_0');
                			View.openJobProgressBar(getMessage('reading'), jobId, '', function(status) {
                				if(status.jobFinished == true){
                    				var report = View.panels.get('abLocalizationEditLangStrings_detailsPanel'); 
                    				report.refresh();            					
                				}
                			});                                          			
                        } catch (e) {
                        	Workflow.handleError(e);
                        }                                                              
                  }  

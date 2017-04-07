// ab-localization-edit-lang-enum.js

                    function afterInitialDataFetch(){                                                              
                        var grid =  View.panels.get('abLocalizationEditLangEnumHiddenPanel');
                        var rows = grid.rows;
                        var default_language = '';
                        
                        if (rows.length == 1){
                            var row = rows[0];
                            default_language = row['lang_lang.language'];                                                                            
                        } else {
                            default_language = window.top.locLanguage;
                        }
                        populateLanguage(default_language);
                        setFilterAndRender();
                    }
	
                    function setFilterAndRender() {
                           var restriction = new Ab.view.Restriction();
                           var sqlRest = '';
                           var console = View.panels.get('abLocalizationEditLangEnum_consolePanel');                
                           var language = Ext.get('language').dom.value;

                           if (language != '') {
                                     restriction.addClause('lang_enum.language', language + '%', 'LIKE');
                                     sqlRest += "lang_enum.language LIKE '" + language + "%' AND ";
                            }
         
                         var report = View.panels.get('abLocalizationEditLangEnum_detailsPanel');                
                         if (Ext.get('abLocalizationEditLangEnum.longStrings').dom.checked){
                                    sqlRest += 'length(lang_enum.enum_trans) > 500';   
                                    report.refresh(sqlRest);
                          }  else {
                                    report.refresh(restriction);
                          }                
                    }        
                                        
                    function findMistranslatedEnums(){
                        var report = View.panels.get('abLocalizationEditLangEnum_detailsPanel'); 
                        var console = View.panels.get('abLocalizationEditLangEnum_consolePanel');
                        
                        try {
                            var result = Workflow.callMethod(
                                'AbSystemAdministration-LocalizationRead-findMistranslatedEnums', Ext.get('language').dom.value, 'ab-localization-edit-lang-enum.axvw', 'abLocalizationEditLangEnum_ds_0');
                               report.setRecords(result.dataSet.records);
                               report.show(true);     
                       } catch (e) {
                            Workflow.handleError(e);
                       }
                    }
                    
                    function clearPanel(){
                         Ext.get('language').dom.selectedIndex = 0;
                         Ext.get('abLocalizationEditLangEnum.longStrings').dom.checked = false;
                    }                       

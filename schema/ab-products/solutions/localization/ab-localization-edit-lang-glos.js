// ab-localization-edit-lang-glos.js
                    function afterInitialDataFetch(){                                                              
                        var grid =  View.panels.get('abLocalizationEditGlosHiddenPanel');
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
                           var console = View.panels.get('abLocalizationEditGlos_consolePanel');                
                           var language = Ext.get('language').dom.value;

                           if (language != '') {
                                     restriction.addClause('lang_glossary.language', language + '%', 'LIKE');
                            }
         
                         var report = View.panels.get('abLocalizationEditGlos_detailsPanel');                
                         report.refresh(restriction);           
                    }        
                                                         
                    function clearPanel(){
                         Ext.get('language').dom.selectedIndex = 0;
                         //Ext.get('abLocalizationEditGlos.longStrings').dom.checked = false;
                    }                       

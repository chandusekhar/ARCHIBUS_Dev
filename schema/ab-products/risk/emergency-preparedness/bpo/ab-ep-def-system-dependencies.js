///ab-ep-def-system-dependencies.js

                     function afterViewLoad(){     
                             var consolePrefix = 'abEpDefSystemDependencies_consolePanel_';
                                        
                     }


                    function setFilterAndRender() {
                           var restriction = new Ab.view.Restriction();
                           var console = View.panels.get('abEpDefSystemDependencies_consolePanel');


                     
                           var auto_number = console.getFieldValue('system_dep.auto_number');
                           if (auto_number != '') {
                                     restriction.addClause('system_dep.auto_number',  auto_number);
                            }   
                            
                           var system_id_master = console.getFieldValue('system_dep.system_id_master');
                           if (system_id_master != '') {
                                     restriction.addClause('system_dep.system_id_master', system_id_master + '%', 'LIKE');
                            }
                            
                           var system_id_depend = console.getFieldValue('system_dep.system_id_depend');
                           if (system_id_depend != '') {
                                     restriction.addClause('system_dep.system_id_depend', system_id_depend + '%', 'LIKE');
                            }
                            

                         var report = View.panels.get('abEpDefSystemDependencies_treePanel');
                         report.refresh(restriction);

                         report.show(true);
              }                            

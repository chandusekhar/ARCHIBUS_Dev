                     function afterViewLoad(){     
                             var consolePrefix = 'project_consolePanel_';
                                        
                     }


                    function setFilterAndRender() {
                           var restriction = new Ab.view.Restriction();
						   var restriction_txt = " 1 = 1 ";

                           var console = View.panels.get('project_consolePanel');

                     
                           var project_id = console.getFieldValue('project.project_id');
                           if (project_id != '') {
								restriction_txt = multiSelectParse('project_consolePanel', 'project.project_id', restriction_txt);
								//	 restriction_txt = restriction_txt + " AND project.project_id = "+literalOrNull(project_id);
                            }
							
							var bl_id = console.getFieldValue('project.bl_id');
							if (bl_id != '') {
								restriction_txt = multiSelectParse('project_consolePanel', 'project.bl_id', restriction_txt);
							}
							
							var proj_mgr = console.getFieldValue('project.proj_mgr');
                           if (proj_mgr != '') {
									restriction_txt = multiSelectParse('project_consolePanel', 'project.proj_mgr', restriction_txt);
									 //restriction_txt = restriction_txt + " AND project.proj_mgr = "+literalOrNull(proj_mgr);
                            }
							
							var proj_phase = console.getFieldValue('project.proj_phase');
                           if (proj_phase != '') {
									restriction_txt = multiSelectParse('project_consolePanel', 'project.proj_phase', restriction_txt);
									 //restriction_txt = restriction_txt + " AND project.proj_phase = "+literalOrNull(proj_phase);
                            }
							
							
							var proj_cat_id = console.getFieldValue('project.project_cat_id');
                           if (proj_cat_id != '') {
									restriction_txt = multiSelectParse('project_consolePanel', 'project.project_cat_id', restriction_txt);
									// restriction_txt = restriction_txt + " AND project.project_cat_id = "+literalOrNull(proj_cat_id);
                            }
							
							var program_id = console.getFieldValue('project.program_id');
                           if (program_id != '') {
									restriction_txt = multiSelectParse('project_consolePanel', 'project.program_id', restriction_txt);
									 //restriction_txt = restriction_txt + " AND project.program_id = "+literalOrNull(program_id);
                            }
							
							var company_id = console.getFieldValue('em.company');
                           if (company_id != '') {
									restriction_txt = multiSelectParse('project_consolePanel', 'em.company', restriction_txt);
									 //restriction_txt = restriction_txt + " AND em.company = "+literalOrNull(company_id);
                            }
							
							var zone_id = console.getFieldValue('bl.zone_id');
                           if (zone_id != '') {
									restriction_txt = multiSelectParse('project_consolePanel', 'bl.zone_id', restriction_txt);
									// restriction_txt = restriction_txt + " AND bl.zone_id = "+literalOrNull(zone_id);
                            }
							
							var date_from = console.getFieldValue('project.date_created.from');
							var date_to = console.getFieldValue('project.date_created.to');
							
							if(date_from != '' || date_to != ''){
								if (date_from != '') {
									restriction_txt += " AND uc_project_notes.date_created >= "+restLiteral(date_from);
								}
								if (date_to != '') {
									restriction_txt += " AND uc_project_notes.date_created <= "+restLiteral(date_to);	
								}
							}
                           
						var reportView = View.panels.get("project_drilldown");
						reportView.addParameter('consoleRest', restriction_txt);
						reportView.refresh();

              }                            
			
			
			
				function restLiteral(value) {
					return "'"+value.replace(/'/g, "'")+"'";
				}
				
				
				function literalOrNull(val, emptyString) {
					if(val == undefined || val == null)
						return "NULL";
					else if (!emptyString && val == "")
						return "NULL";
					else
						var str = "'" + val.replace(/'/g, "''") + "'";
						str = str.replace(/\uFFFD/g, '');
						return str;
						
				}
				
				function multiSelectParse(consolename, fieldString, restriction) {
					var console = View.panels.get(consolename);
					var valuesArray = console.getFieldMultipleValues(fieldString);
					
					var restriction_txt = restriction + " AND " + fieldString + " IN (";
					for (var i=0; i < valuesArray.length; i++) {
						restriction_txt = restriction_txt + literalOrNull(valuesArray[i].trim());
						if (i < valuesArray.length-1) {
							restriction_txt = restriction_txt + ",";
						}
					}
					restriction_txt = restriction_txt + ") ";
					return restriction_txt;
				
				}
				

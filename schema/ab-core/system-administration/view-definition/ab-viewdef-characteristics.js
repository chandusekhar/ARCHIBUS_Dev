var tabsFrame = View.getView('parent').getView('parent').panels.get('tabsFrame');
var myTabsFrame = View.getView('parent').panels.get('charTabs');
var pattern = tabsFrame.patternRestriction;
var viewType = tabsFrame.typeRestriction;
var bIsPaginatedHighlight = false;
var bIsPaginatedHighlightRestriction = false;
var bIsPaginatedHighlightThematic = false;
var bSetPaginatedRestrictionLegend = false;
var bSetPaginatedThematicLegend = false;
var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
	
var vdw_characteristics_control = View.createController('vdw_characteristics', {
    /**
     * Called when Charactistics tab is loaded.  Ensure that the summary child tab will be
     * loaded first.
     *
     * @param	None
     * @return	None
     *
     */
    afterInitialDataFetch: function(){
    	if (myTabsFrame.getSelectedTabName() != 'page4a') {
        	//if(is64BitIE()){
            user_form_afterSelect();
          //}
      }          
    },
   
    selectedFieldsSummary_onAddVirtualField: function() {

    	var view = tabsFrame.newView;
    	var numberOfTgrps = view.tableGroups.length;
    	// find the index
    	var index = numberOfTgrps - tabsFrame.selectedTableGroup - 1;
    	var main_table = view.tableGroups[index].tables[0].table_name;
    	
    	// open dialog window and load another view into it
    	var dialog = View.openDialog('ab-viewdef-add-virtual.axvw', null, false, {
    		closeButton: true,
    		maximize: false,
    		
    		// this callback function will be called after the add virtual field dialog view is loaded
    		afterInitialDataFetch: function(dialogView) {
    			
    			// access the dialog controller property
    			var dialogController = dialogView.controllers.get('addVirtual');
    			dialogController.hideButton('saveChanges');			
    			dialogController.showButton('add');	
    			dialogController.fillFormWithTableName(main_table);
    			
    			// set the dialog controller onClose callback                
    			//dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);    			
    		}	
    	});        
    },
	    
    addVirtualField: function(virtualFieldObject){
    	addSelectedFields(virtualFieldObject);
    },
    
    replaceVirtualField: function(virtualFieldObject, rowIndex){
    	replaceSelectedFields(virtualFieldObject, rowIndex);
    }    
});

function afterViewLoad(){
  if ((myTabsFrame.selectedTabName == 'page4b')) {
		removeIrrelevantMlHeadings('fields_grid');
  } else if( (myTabsFrame.selectedTabName == 'page4d')){
		removeIrrelevantMlHeadings('field_grid');
  } 
}

/**
 * Remove/hide irrelevant afm_flds_lang.ml_heading_xx and afm_flds.ml_heading based on current dbExtension
 *
 * @param	None
 * @return	None
 *
 */
function removeIrrelevantMlHeadings(panelId){
	var grid = Ab.view.View.getControl('', panelId);
	if(grid){
		// get dbextension and corresponding ml_heading_xx field
		var dbExtension = View.user.dbExtension;
		var currentLanguageField = 'afm_flds_lang.ml_heading' + '_' + dbExtension;
		// go through each column, and remove non-relevant ml_heading fields
		for (j=0; j<grid.fieldDefs.length; j++){
			var fieldName = grid.fieldDefs[j].id;
			if (fieldName.match(/afm_flds_lang.ml_heading/gi) && (fieldName != currentLanguageField)){
				var index = getColumnIndexByFullName(fieldName, grid.columns)
				grid.removeColumn(index);
			}
		}  
			
		// if dbextension not english, remove english ml_heading
		if (dbExtension != ''){
			//grid.removeColumn(getColumnIndexByFullName('afm_flds.ml_heading', grid.columns));
		} 
	}  
}

/**
 * Return column index using the full field name and given columns
 *
 * @param	fieldFullName
 * @param gridColumns
 * @return	Number (index)
 */
function getColumnIndexByFullName(fieldFullName, gridColumns){
    var len = gridColumns.length;
    for (var i = 0; i < len; i++) {
        var column = gridColumns[i];
        if (column.id == fieldFullName) {
            return i;
        }
    }
    return -1;
}

/**
 * Called when Charactistics tab is refreshed.  All child tabs call this function to setup the display.
 *
 * @param	None
 * @return	None
 *
 */
function afterRefreshCharSummary(){
    user_form_afterSelect();
}


/**
 * Called when Charactistics tab is loaded.  Used in set standards.
 *
 * @param	None
 * @return	None
 *
 */
function user_form_onload(){
	if (myTabsFrame.selectedTabName == 'page4b') {
		var grid = Ab.view.View.getControl('', 'fields_grid');
		if (grid) {
			//enable new multiple feature - selection over multiple ages
			grid.selectionAcrossPagesEnabled=true;
		}
	}
	
	if (myTabsFrame.selectedTabName == 'page4d') {
		var grid = Ab.view.View.getControl('', 'field_grid');
		if (grid) {
			grid.enableSelectAll(false);
			
			// override default index listener to check previously selected fields
			grid.indexListener = checkStandardsIndex;
			
			grid.prevListener = onClickPrev;
			grid.nextListener = onClickNext;
			
			
			// override default filter listener to check previously selected fields
			//grid.filterListener = checkStandardsFilter; //XXX: registered is not registered as Listener??? 
			grid.onFilter = function(e, el){
				if (e && e.target){
					e.target.blur(); //otherwise click two times to fire the event???
				}
				
				if (grid.filterPaletteIsActive) {
					grid.firstRecords = [];
				}

				var parameters = grid.getParameters(
						grid.getCurrentSortValues(), 
						new Ab.grid.IndexValue(grid.indexColumnID, grid.indexValue, grid.indexLevel));
				try {
				    var result = grid.getData(parameters);
				    grid.reloadOnFilter(result.data);

					if(el && el.target){
						el.target.focus();
						//el.target.select();
					}
					checkStandards(grid);
				} catch (e) {
					grid.handleError(e);
				}
			};

			// override default clearFilter listener to check previously selected fields
			grid.clearFilterListener = checkStandardsClearFilter;
									
			// override, default onMultipleSelectionChange
			grid.addEventListener('onMultipleSelectionChange', function(row){
				saveStandards(row);
			});
			
			// show filter
			grid.isCollapsed = false;
			grid.showIndexAndFilter();
		}
	}
}

/**
 * Called when the tabs are first loaded or when refreshed.  Disable "Save" and "Publish" parent tabs if not
 * alter view wizard.  Hide "Add Standard" tab if alter view wizard.  Setup display of view depending
 * upon which child tab was selected.  Note that the "View Summary" tab is the portal to rest of the
 * characteristics tabs, and that is why this tab must always be displayed first.  When a button is selected,
 * besides navigating to the appropriate tab, a restriction for the appropriate tablegroup is also sent
 * the child tab.
 *
 * @param	None
 * @return	None
 *
 */
function user_form_afterSelect(){
    // disable "Save" and "Publish" parent tabs if not alter view wizard.
    if (!isAlterWizard()) {
        tabsFrame.setTabEnabled("page6", false);
        tabsFrame.setTabEnabled("page7", false);

    	if((myTabsFrame.selectedTabName == 'page4a')){
			var view = tabsFrame.newView;
	    		if(!view.hasOwnProperty('panelProperties')){
	    			var actionProperty = new Object();	
	    			view.panelProperties = [actionProperty,actionProperty,actionProperty];
	    			tabsFrame.newView = view;
			}
    	}

    }
    else {
        // hide "Add Standard" tab if alter view wizard.
        myTabsFrame.hideTab('page4d', true);
    }
	
    var viewType = tabsFrame.typeRestriction;
    var view = tabsFrame.newView;
    pattern = tabsFrame.patternRestriction;
	numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
	bIsPaginatedHighlight = pattern.match(/paginated-highlight/gi);
	bIsPaginatedHighlightThematic = pattern.match(/paginated-highlight-thematic/gi);
	bIsPaginatedHighlightRestriction = pattern.match(/paginated-highlight-restriction/gi);
	if (bIsPaginatedHighlightRestriction && (tabsFrame.selectedTableGroup == 2) && (tabsFrame.fileToConvert == null)){
		bSetPaginatedRestrictionLegend = true;
	}

	if (bIsPaginatedHighlightThematic && (tabsFrame.selectedTableGroup == 2) && (tabsFrame.fileToConvert == null)){
		bSetPaginatedThematicLegend = true;
	}
				
    // warn if no pattern was selected
    if ((tabsFrame.patternRestriction == undefined) || (tabsFrame.patternRestriction == "")) {
        alert(getMessage('noPattern'));
        tabsFrame.selectTab('page2');
    }
    else 
        if (view.tableGroups.length == 0) {
            // warn if no tablegroups were selected
            alert(getMessage('noTables'));
            tabsFrame.selectTab('page3');
        }
        else {
        
            // setup display of view depending upon which tab was selected
            switch (myTabsFrame.selectedTabName) {
            
                case "page4a":
  
                    // if "View Summary" tab was selected
                    var summaryPanel = Ab.view.View.getControl('', 'tgFrame_page4a');
                    if (summaryPanel) {
                        // explicitly display the button and status rows for the owner2 and owner tablegroups
                        $('drill2Checklist').style.display = "";
                        $('drillChecklist').style.display = "";
                        $('drill2Characteristics').style.display = "";
                        $('drillCharacteristics').style.display = "";
                        
                        // explicitly reset the title
                        $('viewTitle').value = getMessage('viewTitleText');
                        
                        // show button text (for localization)
                        var buttonArr = ["selectFields", "setSortOrder", "addStandard", "setRestriction", "setOptions"];
                        for (var i = 0; i < buttonArr.length; i++) {
							document.getElementById('setSortOrder0')
                            $(buttonArr[i] + "0").value = getMessage(buttonArr[i]);
                            $(buttonArr[i] + "1").value = getMessage(buttonArr[i]);
                            $(buttonArr[i] + "2").value = getMessage(buttonArr[i]);
                        }
                        
                        // clear any restrictions
                        tabsFrame.restriction = null;
                        
                        // get the view title from view object and display
                        var title = view.title;
                        if (title != undefined) {
                            $('viewTitle').value = replaceXMLAmp(title);
                        }
						
						if (pattern.match(/paginated-highlight/gi)){
							$('drawingOptions').style.display = "";
							
							// hide sort, restriction, and options for label datasource
							$('drillSrt').style.display = "none";
							$('drillRst').style.display = "none";
							$('drillOpt').style.display = "none";
							$('setSortOrder1').style.display = "none";
							$('setRestriction1').style.display = "none";
							$('setOptions1').style.display = "none";
						} else {
							$('drawingOptions').style.display = "none";	
							$('drillSrt').style.display = "";
							$('drillRst').style.display = "";
							$('drillOpt').style.display = "";	
							$('setSortOrder1').style.display = "";
							$('setRestriction1').style.display = "";
							$('setOptions1').style.display = "";						
						}
						
						if (pattern.match(/paginated-highlight-thematic/gi)) {
							$('drill2Opt').style.display = "none";
							$('setOptions2').style.display = "none";														
						} else{
							$('drill2Opt').style.display = "";
							$('setOptions2').style.display = "";							
						}

 /*                       
                        // if this is summary report, set the tab title and button to "Set Grouping"
                        if ((viewType == 'summaryReports') || (pattern.match(/paginated/gi) && hasSummarizeBySortOrder(view.tableGroups[index]))) {
                            $('setSortOrder' + index).value = getMessage("setGrouping");
                            myTabsFrame.setTabTitle('page4c', getMessage("setGrouping"));
                        }
                        else {
                        
                            // otherwise, set the tab title and button to "Set Sort Order"
                            $('setSortOrder' + index).value = getMessage("setSortOrder");
                            myTabsFrame.setTabTitle('page4c', getMessage("selectSortOrder"));
                        }
 */                       
                        // restrict options according to the number of tablegroups available
                        switch (numberOfTblgrps) {
                            case 1:
                                
                                // if one tablegroup was selected, hide the owner and owner2 rows (both buttons and status rows)
                                $('drill2Checklist').style.display = "none";
                                $('drillChecklist').style.display = "none";
                                $('drill2Characteristics').style.display = "none";
                                $('drillCharacteristics').style.display = "none";
                                
                                // fill in the table name in input box
                                $('dataTable').value = tabsFrame.datagrpRestriction;
                                
                                // update the status for each characteristic (Required, Optional, or Checked)
                                markCheckList('data', view.tableGroups[0]);
                                
                                // if table empty warn and navigate to "Select Data" tab
                                if ($('dataTable').value == "") {
                                    alert(getMessage("noTables"));
                                    tabsFrame.selectTab("page3");
                                }
                                break;
                                
                            case 2:
                                
                                // if two tablegroups were selected, hide the owner row (both buttons and status rows)
                                $('drill2Checklist').style.display = "none";
                                $('drill2Characteristics').style.display = "none";
                                
                                // fill in the table names of each tablegroup
                                $('dataTable').value = tabsFrame.datagrpRestriction;
                                $('drillDownTable').value = tabsFrame.ownergrpRestriction;
                                
                                // update the status for each characteristic (Required, Optional, or Checked)
                                markCheckList("data", view.tableGroups[1]);
                                markCheckList("drill", view.tableGroups[0]);
                                
                                // warn if table were not selected and navigate to "Select Data" tab
                                if (($('drillDownTable').value == '') || ($('dataTable').value == '')) {
                                    alert(getMessage('noTables'));
                                    tabsFrame.selectTab('page3');
                                }
                                
                                break;
                                
                            case 3:
                                
								// display appropriate table labels
								if (pattern.match(/paginated-highlight/gi)){
									$('drillDown2Title').innerHTML = getMessage('highlightTable');	
									$('drillDownTitle').innerHTML = getMessage('labelTable');	
									$('dataTitle').innerHTML = getMessage('legendTable');
									
									var bSyncLegend = $('syncLegendCheckBox').checked;
									if (bSyncLegend == true){
										copyDataBand(view);
									}	
									
								} else {
									$('drillDown2Title').innerHTML = getMessage('drillDown2Table');	
									$('drillDownTitle').innerHTML = getMessage('drillDownTable');	
									$('dataTitle').innerHTML = getMessage('dataTable');									
								}
								
                                // if three tablegroups were selected, fill in the table names
                                $('dataTable').value = tabsFrame.datagrpRestriction;
                                $('drillDownTable').value = tabsFrame.ownergrpRestriction;
                                $('drillDownTable2').value = tabsFrame.owner2grpRestriction;
                                
                                // update the status for each characteristic (Required, Optional, or Checked)
                                markCheckList("data", view.tableGroups[2]);
                                markCheckList("drill", view.tableGroups[1]);
                                markCheckList("drill2", view.tableGroups[0]);
                                
                                // if no table was selected, warn and navigate back to "Select Data" tab
                                if (($('drillDownTable').value == '') || ($('dataTable').value == '') || ($('drillDownTable2').value == '')) {
                                    alert(getMessage('noTables'));
                                    tabsFrame.selectTab('page3');
                                }
                                break;
                        }
                    }
                    break;
                    
                case "page4b":
                    // if "Select Fields" tab was selected
                    showAddVFButton();

					var numberOfTgrps = view.tableGroups.length;
					// find the index
					var index = numberOfTgrps - tabsFrame.selectedTableGroup - 1;
					// show/hide parameters restriction based on pattern and which tablegroup
					if (pattern.match(/paginated-parent/gi) && (index < (numberOfTgrps - 1))){
						$('restrictionParameterColumn').style.display = "";
					} else {
						$('restrictionParameterColumn').style.display = "none";	
					}

					if (pattern.match(/editform/gi) && (index == (numberOfTblgrps - 1))){
						$('showSelectValueActionColumn').style.display = "";
					} else {
						$('showSelectValueActionColumn').style.display = "none";	
					}
										
                    // reset summary table
                    resetTable('selectedFields');
                    
                    var table = $('selectedFields');
                    var tBody = table.tBodies[0];
                    
                    // get the table name from the passed in restriction, if there is one
                    if (tabsFrame.restriction.clauses) {
                        var table_name = tabsFrame.restriction.clauses[0].value;
                    }
                                     
                    // array of field properties                    
                    //var fieldsList = ["field_name", "ml_heading", "data_type", "afm_type", "primary_key", "table_name"];
                    var fieldsList = ["field_name", "ml_heading", "data_type", "afm_type", "primary_key", "table_name", "ml_heading_english"];
                    
                    // find the main table based on index
                    var main_table = view.tableGroups[index].tables[0].table_name;
                    
                    // show only fields that pertain to the main table of the tablegroup
                    if (main_table == tabsFrame.restriction.clauses[0].value) {
                        var fields = view.tableGroups[index].fields;
                    }
                    
                    // set restriction on grid to show only fields with selected table name
                    setRestrictionOnGrid();
                    
                    // check check boxes for selected fields
                    checkBoxesForSelectedFields();
                    var fields_grid = Ab.view.View.getControl('', 'fields_grid');
                 
                    //XXX: clearFieldsSelection in ab-viewdef-helper.js to clear selection model when starting over
                    if(tabsFrame.clearFieldsSelection){
                    	fields_grid.clearAllSelected();
                    	tabsFrame.clearFieldsSelection = false;
                    }
                    
                    fields_grid.initializeSelectionModel(main_table+index);

					// auto-pkey: highlight primary keys for restriction drawing or paginated-parent reports
					if ( pattern.match(/ab-viewdef-report|edit|columnreport/gi) || pattern == 'ab-viewdef-paginated' || (pattern.match(/highlight-restriction/gi) && ((index == 0) || (index == 2)))  || pattern.match(/paginated-parent/gi)){
						if ((fields == undefined) || fields == '') {
							checkPKeysAsDefaults();
							// highlightPKeyRows();
							
							// if paginated parent (not a child tablegroup), set restriction parameters on primary keys as default
							if (isPaginatedParent()){
								setPKeysAsRestrictionParams();
							}
						}
					}
										
					var status = 'none';					
					if (pattern.match(/paginated-parent/gi) && (index < (numberOfTblgrps - 1))){
						status = '';	
					}
	                    
                    // create the summary table
                    if (fields != undefined) {
                        for (m = 0; m < fields.length; m++) {
                        
                            // create the row and give it an id
                            var new_tr = document.createElement('tr');
                            new_tr.id = "row" + m;
                                                       
                            // get field object
                            var fldObj = fields[m];
                            new_tr.ml_heading_english = fldObj['ml_heading_english'];
                            if(valueExistsNotEmpty(fldObj.ml_heading_english_original)){
                            	new_tr.ml_heading_english_original = fldObj['ml_heading_english_original'];
                            }
                            if(valueExistsNotEmpty(fldObj.rowspan)){
                            	new_tr.rowspan = fldObj['rowspan'];
                            }
                            if(valueExistsNotEmpty(fldObj.colspan)){
                            	new_tr.colspan = fldObj['colspan'];
                            } 
                            
                            // loop through and fill in the field property values in the summary table
                            for (var j = 0; j < fieldsList.length; j++) {
                                var new_td = document.createElement('td');
                                new_td.innerHTML = fldObj[fieldsList[j]];
                                if((j > 2 ) && (fieldsList[j] == 'ml_heading_english')){
                                	new_td.style.display = 'none';
                                	if(valueExistsNotEmpty(fldObj['ml_heading_english_original'])){
                                		new_td.innerHTML = fldObj['ml_heading_english_original'];
                                	}
                                }	
                                new_tr.appendChild(new_td);
                                if(fldObj['is_virtual'] && fldObj['sql']){
                                	var sql = fldObj['sql'];
                                	if(typeof(sql) == 'string'){
                                	 sql = eval("(" + fldObj['sql'] + ")");
                                	}
                                	var sqlMsg = '<b>' + getMessage('generic') + '</b>  ' + sql.generic + '<br/><b>' + getMessage('oracle') + '</b>  ' + sql.oracle + '<br/><b>' + getMessage('sqlServer') + '</b>  ' + sql.sqlServer + '<br/><b>' + getMessage('sybase') + '</b>  ' + sql.sybase;
                                	new_td.setAttribute('ext:qtip', sqlMsg);
                                	new_td.vf = fldObj;
                                	new_td.sql = sql;
                                }
                            }
							
							// add restriction parameter column
                            var new_td = document.createElement('td');
							var id = 'td_' + fldObj.table_name + '.' + fldObj.field_name;
							new_td.id = id;
							new_td.style.display = status;
							var temp = '<input id="param_' + fldObj.table_name + '.' + fldObj.field_name + '" type="checkBox" onclick="getFieldValues()"';
							if (fldObj.hasOwnProperty('restriction_parameter') ){		// for new view
								if (fldObj.restriction_parameter != '') {
									temp += 'checked="checked"';
								}
							}							
							temp += '/>';
							new_td.innerHTML = temp;
                            new_tr.appendChild(new_td);

							// add showselectvalueaction column
                            var new_td = document.createElement('td');
							var id = 'td_' + fldObj.table_name + '.' + fldObj.field_name;
							new_td.id = id;	

							// show						
							var temp = '<input id="showSelectValueAction_' + fldObj.table_name + '.' + fldObj.field_name + '" type="checkBox" onclick="getFieldValues();showSelectVWarning(this.checked);" value="true" ';
							if (fldObj.hasOwnProperty('showSelectValueAction') ){		// for new view
								if (fldObj.showSelectValueAction == true) {
									temp += 'checked="checked"';
								}
							}						
							temp += 'style="';
							if ((fldObj['primary_key'] == 0) && pattern.match(/editform/) && (index == (numberOfTblgrps - 1))) {
								temp += '"/>';								
							} else {
								temp += 'display:none"></input>';								
							} 															
							
							new_td.innerHTML = temp;
                            new_tr.appendChild(new_td);
							/*
                            var new_td = document.createElement('td');
							var id = 'td_' + fldObj.table_name + '.' + fldObj.field_name;
							new_td.id = id;	
							
							// show						
							var temp = '<input name="showSelectValueAction_' + fldObj.table_name + '.' + fldObj.field_name + '" type="radio" onclick="getFieldValues()" value="true" ';
							if (fldObj.hasOwnProperty('showSelectValueAction') ){		// for new view
								if (fldObj.showSelectValueAction == true) {
									temp += 'checked="checked"';
								}
							}						
							temp += 'style="';
							if ((fldObj['primary_key'] == 0) && pattern.match(/editform/) && (index == (numberOfTblgrps - 1))) {
								temp += '">' + getMessage('show') + '</input>&nbsp;&nbsp;';								
							} else {
								temp += 'display:none"></input>';								
							} 	
							
							// hide 
							temp += '<input name="showSelectValueAction_' + fldObj.table_name + '.' + fldObj.field_name + '" type="radio" onclick="getFieldValues()" value="false" ';
							if (fldObj.hasOwnProperty('showSelectValueAction') ){		// for new view
								if (fldObj.showSelectValueAction == false) {
									temp += 'checked="checked"';
								}
							}							
							temp += 'style="';
							if ((fldObj['primary_key'] == 0) && pattern.match(/editform/) && (index == (numberOfTblgrps - 1))) {
								temp += '">' + getMessage('hide') + '</input>';								
							} else {
								temp += 'display:none"></input>';								
							}						
							new_td.innerHTML = temp;
                            new_tr.appendChild(new_td);
							*/
													                              													                            
                            // add extra column
                            var new_td = document.createElement('td');
                            new_td.innerHTML = fldObj['is_virtual'];
                            new_td.sql = fldObj['sql'];
                            new_tr.appendChild(new_td);
                            
                            // add the "Remove", "Up", and "Dn" buttons
                            var new_td = document.createElement('td');
                            new_td.setAttribute("nowrap", "nowrap");	
                            createButton("Remove", "removeRow", getMessage("remove"), "selectedFields", new_td);
                            createButton("Up", "moveUp", getMessage("up"), "selectedFields", new_td);
                            createButton("Down", "moveDown", getMessage("dn"), "selectedFields", new_td);
                            if(fldObj.afm_type == 'Virtual Field'){
                            	createButton("Edit", "editVirtualField", getMessage("edit"), "selectedFields", new_td);                           	
                            }
                            new_tr.appendChild(new_td);
                            							                          
                            // add extra column
                            var new_td = document.createElement('td');
                            new_tr.appendChild(new_td);
                            
                            // add to summary table
                            tBody.appendChild(new_tr);
                        }
                    }
                    break;
                    
                case "page4c":
                    
                    // if "Set Sort Order" (aka "Set Grouping") tab was selected, create the summary table 
                    onLoadSortSummary();
                    
                    // set primary keys as default
                    if(pattern.match(/ab-viewdef-report|edit/gi) && !(pattern.match(/edit/) && (index == view.tableGroups.length-1))){
                    	setPKeysAsSortDefaults();
                    }
                    
                    break;
                    
                case "page4d":
                    // if "Add Standard" was selected
							                    
					// only show button if drawing pattern
					if (pattern.match(/paginated-highlight/gi)){
						$('showOnlyHightlightsPkeys').style.display = '';
					} else {
						$('showOnlyHightlightsPkeys').style.display = 'none';
					}
					
					// if index had been used, reset to show top level
                    var grid = Ab.view.View.getControl('', 'field_grid');
					grid.enableSelectAll(false);
																			
					if (grid.indexLevel > 0){
						grid.indexLevel = 0;
						grid.refresh();
					}

					// check checkboxes of previously selected standards
					checkStandards(grid);
					
                    break;
                    
                case "page4e":
                    // if "Set Restriction" tab was selected
                    
                    // display button text (for localization)
                    $('addButton').value = getMessage("add");
                    
                    // set up the restriction form
                    loadRestrictionForm();
                    
                    // get restrictions from view object
                    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
                    var restrictions = view.tableGroups[index].parsedRestrictionClauses;
                    
                    // if previously selected restrictions exist, display them in a summary table
                    if (restrictions != undefined) {
                        resetTable('restrictionSummary');
                        for (j = 0; j < restrictions.length; j++) {
                            var field = restrictions[j].table_name + "." + restrictions[j].field_name;
                            var relop = restrictions[j].relop;
                            var value = restrictions[j].value;
                            var op = restrictions[j].op;
                            createRestrictionSummary(relop, field, op, value);
                        }
                    }
                    
                    break;
                    
                case "page4f":

					// if "Set Options" tab was selected
					var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
					var summaryPanel = Ab.view.View.getControl('', 'statsOptionsPanel');
					var panel_title = view.tableGroups[index].title;
					
					var titleEl = Ext.get('titleRow');
					if ( pattern.match(/paginated/gi)) {
						titleEl.dom.hidden = true;
						//.setHidden(true);
					} else {
						titleEl.dom.hidden = false;
						// display button text (for localization)
						$('panelTitle').value = getMessage('panelTitle');
						
						// if a panel title exists, show title
						if (panel_title != undefined) {
							$('panelTitle').value = replaceXMLAmp(panel_title);
						}	
					}
										
					var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
					if((pattern.match(/editform|columnreport/) && (index == (numberOfTblgrps - 1))) || (pattern.match(/editform-drilldown-console/) && (index == 0))){
						$('numberOfColumns').style.display = "";							
						displayNumberOfColumns();	
					} else {
						$('numberOfColumns').style.display = "none";
					}
															
					// get statistics and chart options panels
					var statsOptionsPanel = Ab.view.View.getControl('', 'statsOptionsPanel');
					var chartOptionsPanel = Ab.view.View.getControl('', 'chartOptionsPanel');
					var paginatedOptionsPanel = Ab.view.View.getControl('', 'paginatedOptionsPanel');
					var columnReportOptionsPanel = Ab.view.View.getControl('', 'columnReportOptionsPanel');
					
					// get list of field objects from view object
					var fields = view.tableGroups[index].fields;
					
					// if fields were not selected for this tablegroup, warn and go back to summary tab					
					if (fields == undefined) {
						alert(getMessage("noFields"));
						myTabsFrame.selectTab('page4a');
						
					}
					else {
					
						// otherwise, explicity reset/delete all rows from the summary table 
						resetTable('measuresSummary');

						// redraw the summary table per selected tablegroup's field specifications
						createMeasuresSummaryTable(view, index);
																												
						// check checkboxes
						markSelectedMeasures(view, index);
						
						// for redisplaying
						$('measuresSummary').style.display = "";
						$('enableDrilldownTable').style.display = "";
						$('paginatedPanelOptions').style.display = "none";
						
						// if paginated, hide the enable drilldown option and show the paginated options panel
						if (pattern.match(/paginated/gi)) {						
							$('enableDrilldownTable').style.display = "none";
							$('paginatedPanelOptions').style.display = "";
							var curTgrp = view.tableGroups[index];
							if (hasSummarizeBySortOrder(curTgrp) || (pattern.match(/paginated-stats-data/gi) && index == 0) ){								
								$('summarizeBySortOrder').checked = true;
								// $('measuresSummary').style.display = "";
								showStatisticsColumns('', '')
							} else {
								$('summarizeBySortOrder').checked = false;
								showStatisticsColumns('', 'none')
								// $('measuresSummary').style.display = "none";
							}
							
							// check box as disabled
							if(pattern.match(/paginated-stats-data/gi) && index == 0){
								$('summarizeBySortOrder').disabled= true;
								// set property
								setPaginatedPanelProperty('summarizeBySortOrder', 'summarizeBySortOrder');
							} else {
								$('summarizeBySortOrder').disabled= false;
							}
													
							// don't allow statistics or summarizebysortorder for drawings
							if(pattern.match(/paginated-highlight-restriction/gi)){
								$('summarizeBySortOrder').checked = false;
								$('measuresSummary').style.display = "none";
								$('summarizeBySortOrderOption').style.display = "none";
							} else {
								$('measuresSummary').style.display = "";
								$('summarizeBySortOrderOption').style.display = "";
							}
							
							if(pattern.match(/highlight-restriction/gi) || pattern.match(/paginated-parent|paginated-highlight-thematic/gi) && ($('summarizeBySortOrder').checked == false)){
							// if(pattern.match(/paginated-parent/gi) && (index != (numberOfTblgrps-1)) && ($('summarizeBySortOrder').checked == false)){
								$('measuresSummary').style.display = "none";
							} else {
								$('measuresSummary').style.display = "";
							}
														
							if (!curTgrp.hasOwnProperty('paginatedPanelProperties')){
								curTgrp.paginatedPanelProperties = new Object();
							}
							var paginatedPanelProperties = curTgrp.paginatedPanelProperties;
														
							if (paginatedPanelProperties.hasOwnProperty('pageBreakBefore')) {
								$('pageBreakBefore').value = paginatedPanelProperties.pageBreakBefore;
							}
							if (paginatedPanelProperties.hasOwnProperty('format')) {
								if (paginatedPanelProperties.format == 'table'){
									$('groupBandFormat').value = paginatedPanelProperties.format + '-';									
								} else {
									$('groupBandFormat').value = paginatedPanelProperties.format + '-' + paginatedPanelProperties.column;
								}
							}
					
						}                        
                    }
              
                    // if a viewType was specified		                  
                    if (viewType != "undefined") {
                    
                        // if view is a summary report and the selected tablegroup is data tablegroup                   
                        // if ((viewType.match(/summaryReports|paginated/gi)) && (tabsFrame.selectedTableGroup == 0)) {
                        if ((viewType.match(/summaryReports/gi) && (tabsFrame.selectedTableGroup == 0)) || pattern.match(/chart-2d/gi) || (pattern.match(/paginated/gi))) {                   
                            // if it is a statistics report, show only stats options and explicity hide chart options                    
                            if (!pattern.match(/chart/)) {
                                chartOptionsPanel.show(false);
                                statsOptionsPanel.show();
								
								/*
								if (pattern.match(/paginated-highlight/gi) && (index != 2) ){
									// only show the statsOptionsPanel for legend data band
                                	chartOptionsPanel.show(false);
                                	statsOptionsPanel.show(false);
                                	paginatedOptionsPanel.show();									
								}
                           		else 
                           		*/
								if (pattern.match(/paginated/)) {
                                	chartOptionsPanel.show(false);
                                	statsOptionsPanel.show();
                                	paginatedOptionsPanel.show();
                            	} else {
                                	paginatedOptionsPanel.show(false);
                            	}

                            } 
   
                            else {
                                // if not first tgrp in 2d chart, show both panels
                                if(!(pattern.match(/summary-chart-2d/gi) && (tabsFrame.selectedTableGroup == 1))){ 
                                	chartOptionsPanel.show();
                                }
                                statsOptionsPanel.show();
                                
								// reset chart options in form
								resetChartOptions();
								
                                // get chart properties
                                var chartProperties = view.chartProperties;
                                
                                // check or uncheck "Enable Chart Drilldown" option based on configuration
                                if (view.enableChartDrilldown == true) {
                                    $('drilldown').checked = true;
                                }
                                else {
                                    $('drilldown').checked = false;
                                }
                                
                                // if chart properties have been specified
                                if (chartProperties != null) {
                                
                                    // display selected chart properties
                                    for (var i in chartProperties) {
										if (chartProperties.hasOwnProperty(i)) {
											var propertyObj = $(i);
											// code for filling in properties displayed in a select box
											if (propertyObj.type.match(/select/)) {
												var options = propertyObj.options;
												for (var x = 0; x < options.length; x++) {
													if (chartProperties[i].match(options[x].value)) {
														propertyObj.selectedIndex = x;
													}
												}
												
											}
											else {
												// code for displaying height and width properties which has a '%'
												var value = chartProperties[i];
												var strValue = String(chartProperties[i]);
												var last_char = strValue.substring(strValue.length - 1, strValue.length);
												if ((i == 'width') || (i == 'height')) {
													if (last_char == '%') {
														var temp = strValue.substring(0, value.length - 1);
														propertyObj.value = Number(temp);
													}
												}
												else {											
													// otherwise, just display the value as-is
													propertyObj.value = value;
												}
											}
										}
									}
                                }
                                
                                // display the autoCalculateTickSizeInterval property depending upon certain conditions
                                // var autocalc = $('autoCalculateTickSizeInterval');
                                // toggleRelatedProperty('autoCalculateTickSizeInterval', autocalc.options[autocalc.selectedIndex].value)
                            }
                            
												// show totals and counts for edit and report forms
												}else if(!hasFieldsWithSameName(view.tableGroups[index].fields) && (pattern.match(/ab-viewdef-report/) || (pattern.match(/editform/)) &&  (pattern.match(/editform-drilldown-popup/gi) || (index != (numberOfTblgrps-1)) ) )){
                        	  statsOptionsPanel.show(true);
                        	  showStatisticsColumns('', 'none');
                        	  $('enableDrilldownTable').style.display = "none";
                        }else{
                        
                            // if view is not a summary report or if the tableggroup is not data group, hide stats and chart options 
                            chartOptionsPanel.show(false);
                            statsOptionsPanel.show(false);
                            paginatedOptionsPanel.show(false);
                        }
                    }
                    
                    if (((viewType == 'columnReports') && (index == (numberOfTblgrps-1)))){
                    	$('columnReportSummary').style.display = '';
                    	resetTable('columnReportSummary');
                    	createColumnReportSummaryTable(view, index);
                    } else {
                    	$('columnReportSummary').style.display = 'none';
                    }	
                                               
                    // only show action button options for report views
                    var actionsPanel = Ab.view.View.getControl('', 'actionOptionsPanel');
                    actionsPanel.show( ((viewType == 'reports') || ((viewType == 'summaryReports')) && (index == (numberOfTblgrps-1))) );
                    var bDataTgrp = (index == numberOfTblgrps - 1) ? true : false;
                    //showSelectedActionOptions(view.actionProperties[index], index, bDataTgrp);
                    showSelectedActionOptions(view.panelProperties[index], index, bDataTgrp); 
            }
        }
}


/**
 * Called only when index is selected.  Performs regular index actions and then checks
 * the checkboxes of any previously selected standard fields
 *
 * @param	indexString 	Obj passed from original indexListener
 * @return	None
 *
 */
function checkStandardsIndex(indexString) {
	var grid = Ab.view.View.getControl('', 'field_grid');
		
	// continue regular index
	grid.onClickIndex(indexString);  
	
	// check checkboxes of previously selected standards
	checkStandards(grid);   
}


/**
 * Called only when clearFilter is click.  Performs regular clearFilter actions and then checks
 * the checkboxes of any previously selected standard fields
 *
 * @param	indexString 	Obj passed from original indexListener
 * @return	None
 *
 */
function checkStandardsClearFilter(indexString) {
	var grid = Ab.view.View.getControl('', 'field_grid');
		
	// continue regular index
	grid.clearAllFilters(indexString);  
	
	// check checkboxes of previously selected standards
	checkStandards(grid);   
}

/**
 * Checks the checkboxes of any previously selected standard fields
 *
 * @param	None
 * @return	None
 *
 */
function checkStandards(grid){
	var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var curTgrp = view.tableGroups[index];
    var fields = curTgrp.fields;
   
    // allow adding of standards without first adding fields
    if (fields === undefined) {
        view.tableGroups[index].fields = [];
        tabsFrame.newView = view;
    }
	if ((grid !== null) && (fields !== undefined) && (fields.length > 0)) {
	    checkMatchedRows(grid, fields);
	}	
}
/**
 * Checks the matched rows basde on the values stored with fields
 */
function checkMatchedRows(grid, fields){
	 // for each row in the grid
    for (var i = 0; i < grid.rows.length; i++) {
    	var row = grid.rows[i];
    	var rowFieldName = row['afm_flds.field_name'];
        var rowTableName = row['afm_flds.table_name'];
        //selected standards stored in curTgrp.fields
    	for (var j=0; j<fields.length; j++) {
          var table_name = fields[j].table_name;
          var field_name = fields[j].field_name;
          if((field_name === rowFieldName) && (table_name === rowTableName)){
        	  row.row.select(true);
          }
    	}
    } 	
}

function onClickNext() {
	var grid = Ab.view.View.getControl('', 'field_grid');
	grid.onClickNext();
	checkStandards(grid);
}

function onClickPrev(){
	var grid = Ab.view.View.getControl('', 'field_grid');
	grid.onClickPrev();
	checkStandards(grid);
}

/**
 * Used when "Set Sort" (aka "Set Grouping" is loaded or refreshed).  Redraws and displays
 * sort characteristics based on selected tablegroup.
 *
 * @param	None
 * @return	None
 *
 */
function onLoadSortSummary(){
    var view = tabsFrame.newView;
    var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
    var viewType = tabsFrame.typeRestriction;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    
    // if this is a summary view, hide sort references and display grouping references
    if (viewType == 'summaryReports') {
        $('sort').style.display = "none";
        $('group1').style.display = "";
        $('group2').style.display = "";
        $('group3').style.display = "";
        $('sortOrder_title').innerHTML = getMessage('setGrouping');
    }
    else {
    
        // otherwise, show sort references
        $('sort').style.display = "";
        $('group1').style.display = "none";
        $('group2').style.display = "none";
        $('group3').style.display = "none";
        $('sortOrder_title').innerHTML = getMessage('selectSortOrder');
    }
    
    // create the sort summary table, filling in the field properties and creating the sort buttons
    createSortSummaryTable();
    
    // create an array for displaying/tracking the order of the sorts and stores this array in the summary table
    createSortSelectionArray();
    
    // get the array of sort objects
    var sortFldsArray = view.tableGroups[index].sortFields;
    
    // if sorts have been defined,
    if (sortFldsArray != undefined) {
        var summaryTable = $('sortOrderSummary');
        tBody = summaryTable.tBodies[0];
        var numOfRows = tBody.rows.length;
        
        // for each sort specified
        for (k = 0; k < sortFldsArray.length; k++) {
        
            // loop through the summary table
            for (var j = 1; j < numOfRows; j++) {
                var fieldNameCell = summaryTable.rows[j].cells[0];
                var tableNameCell = summaryTable.rows[j].cells[5];
                var setButtonCell = summaryTable.rows[j].cells[8];
                
                // if there is a match, display the order and hide the "Sort" button
                if ((sortFldsArray[k].field_name == fieldNameCell.innerHTML) && (sortFldsArray[k].table_name == tableNameCell.innerHTML)) {
                    var rowID = setButtonCell.parentNode.id;
                    setSort("", rowID);
                }
            }
        }
        
    }
	
	/*
	if ( pattern.match(/highlight-restriction/gi) && (sortFldsArray == undefined) && ((index == 0) || (index == 2)) ){
		setPKeysAsSortDefaults();
	}
	*/	
}

/**
 * Used in "View Summary" of "Characteristics" tab.  Display the checklist/status of characteristics for given
 * tablegroup.
 *
 * @param 	prefix 	String containing tablegroup (ie. 'data', 'drill', 'drill2'
 * @param	tgrp	Object containing tablegroup selected
 * @return	None
 *
 */
function markCheckList(prefix, tgrp){
	var tabsFrame = View.getView('parent').getView('parent').panels.get('tabsFrame');	
    var pattern = tabsFrame.patternRestriction;
    var view = tabsFrame.newView;
    // for fields
    var fld = $(prefix + 'Fld');
	var buttonIndex = 0;

	var prefixes = ["data", "drill", "drill2"];
	for (var i=0; i< prefixes.length; i++){
		if (prefixes[i] == prefix){
			buttonIndex = i;
		}
	}
    	
    // if this is summary report, set the tab title and button to "Set Grouping"
    if ((pattern.match(/summary/gi)) || (pattern.match(/paginated/gi) && hasSummarizeBySortOrder(tgrp))) {
		$('setSortOrder' + buttonIndex).value = getMessage("setGrouping");
		myTabsFrame.setTabTitle('page4c', getMessage("setGrouping"));
    } else {
                        
        // otherwise, set the tab title and button to "Set Sort Order"
        $('setSortOrder' + buttonIndex).value = getMessage("setSortOrder");
        myTabsFrame.setTabTitle('page4c', getMessage("selectSortOrder"));
    }    
						
    // if fields have been selected, display checked icon
	// if ((tgrp.fields) && tgrp.fields.length > 0){
	if (checkIfHasMainField(tgrp.fields, tgrp.tables[0].table_name)){
        fld.innerHTML = "";
        addIcon(fld);
    }  
	// else if ( (bIsPaginatedHighlight && prefix == 'drill') || bIsPaginatedHighlightThematic ){
	else if ((bIsPaginatedHighlight && prefix == 'drill') || (bIsPaginatedHighlightThematic && tgrp.tables[0].table_name != 'zone')){	
		// if you do not want any labels to appear, do not select any fields.  [As such the Select Fields setting is not required for this dataSource.  Users can leave this list empty, which is the default.]
        fld.innerHTML = getMessage('optional');
        fld.style.color = "green";		
	}
    else {
    
        // otherwise, show "Required" in red 
        fld.innerHTML = getMessage('required');
        fld.style.color = "red";
    }
    
    // for sorts	
    var sort = $(prefix + 'Srt');

	// auto set summarizebysortorder for pattern.  placed here for switching between different patterns
	if (pattern.match(/paginated-stats-data/gi) && (prefix=='drill')) {
		// set summarize by sort order
		if(!tgrp.hasOwnProperty('paginatedPanelProperties')){
			tgrp.paginatedPanelProperties = new Object();
		}
		tgrp.paginatedPanelProperties['summarizeBySortOrder'] = 'summarizeBySortOrder';
	} 
		
		    
    // if sort was specified, display checked icon
    if ((tgrp.sortFields) && (tgrp.sortFields.length > 0)) {
        sort.innerHTML = "";
        addIcon(sort);
    //} else if ((pattern.match(/summary/gi) && (prefix == "data")) || pattern.match(/chart-2d/gi) || (pattern.match(/paginated-highlight/gi) && ((prefix == 'drill2') || (prefix == 'data')) ) || ((pattern.match(/paginated/gi) && hasSummarizeBySortOrder(tgrp) && !(pattern.match(/paginated-stats-data/gi) && (prefix == 'drill')) ))) {
    }else 
        if ((pattern.match(/summary/gi) && (prefix == "data")) || pattern.match(/chart-2d/gi) || (pattern.match(/paginated-highlight/gi) && ((prefix == 'drill2') || (prefix == 'data')) ) || ((pattern.match(/paginated/gi) && hasSummarizeBySortOrder(tgrp) && !(pattern.match(/paginated-stats-data/gi) && (prefix == 'drill')) ))) {            
            // otherwise, if summary pattern and last/"data" tablegroup, display "Required" in red
			// For datasource and legend datasource that do not have the hpattern fields, we will need to add sort field to both ds definition, otherwise, 
			// we do not know which field to group on for legends, we will do not know to which fields our auto colors generation based on. Also, it will 
			// keep both datasource in order and match each other.
            sort.innerHTML = getMessage('required');
            sort.style.color = "red";
    } else if (pattern.match(/paginated-stats-data/gi) && hasSummarizeBySortOrder(tgrp) && (prefix == 'drill')) {
            sort.innerHTML = getMessage('required');
            sort.style.color = "red";
    }else {
        
            // otherwise, display "Optional" in green
            sort.innerHTML = getMessage('optional');
            sort.style.color = "green";
    }
    
    // for standards
    
    // if not alter view wizard
    if (!isAlterWizard()) {
    
        // if contains tables
        if (tgrp.tables) {
            var length = tgrp.tables.length;
            var bFound = false;
            
            // look for tables with a role of "standard"
            for (var i = 0; i < length; i++) {
                if (tgrp.tables[i].role == "standard") {
                    bFound = true;
                }
            }
            
            var std = $(prefix + 'Std');
            
            // if standard table was found, display checked icon
            if (bFound) {
                std.innerHTML = "";
                addIcon(std);
            } else if (pattern.match(/highlight-thematic/gi) && prefix != 'drill' && tgrp.tables[0].table_name != 'zone'){				
            	//	std.innerHTML = getMessage('recommended');
            	//std.style.color = "orange";
            	std.innerHTML = getMessage('required');
            	std.style.color = "red";
            } else {
            	// otherwise, display "Optional" in green
            	std.innerHTML = getMessage('optional');
            	std.style.color = "green";
            }
        }
    } else {
    
        // if used in alter view wizard, hide standard column
        var addStandardLabelArea = $("addStandardLabelArea");
        addStandardLabelArea.style.display = "none";
        var addStandard1Label1Area = $("addStandard1Label1Area");
        addStandard1Label1Area.style.display = "none";
        var addStandardLabe2Area = $("addStandardLabe2Area");
        addStandardLabe2Area.style.display = "none";
        var addStandardArea = $("addStandardArea");
        addStandardArea.style.display = "none";
        var addStandard1Area = $("addStandard1Area");
        addStandard1Area.style.display = "none";
        var addStandard2Area = $("addStandard2Area");
        addStandard2Area.style.display = "none";
        
        var startOver = $("startOver");
        startOver.style.display = "none";
    }
    
    // for restrictions	
    var rst = $(prefix + 'Rst');
    
    // if restrictions were specified, display checked icon
    if ((tgrp.parsedRestrictionClauses) && (tgrp.parsedRestrictionClauses.length > 0)) {
        rst.innerHTML = "";
        addIcon(rst);
    }
    else if (pattern.match(/paginated-highlight-restriction/gi) && (prefix.match(/drill2|data/))){
	    rst.innerHTML = getMessage('required');
        rst.style.color = "red";	
	} else{
    
        // othewise, optional in green
        rst.innerHTML = getMessage('optional');
        rst.style.color = "green";
    }
    
    // for options
    var opt = $(prefix + 'Opt');
    
    // if summmary pattern and last/"data" tablegroup
	  if ((pattern.match(/summary/gi) && (prefix == "data")) || (pattern.match(/paginated-stats-data/gi) && prefix== 'drill') ) {
    
        // if measures/dimensions were specified, display checked icon
        if ((tgrp.measures) && (tgrp.measures.length > 0)) {
            opt.innerHTML = "";
            addIcon(opt);
        }else {
        
            // otherwise, display "Required" in red
            opt.innerHTML = getMessage('required');
            opt.style.color = "red";
        }
    // } else if ((pattern.match(/paginated/gi)) && (prefix == "data")){
    } else if (pattern.match(/paginated/gi)){
        // if measures/dimensions, paginated panel properties, or paginated report properties were specified, display checked icon
        // if (((tgrp.measures) && (tgrp.measures.length > 0)) || hasProperties(view.paginatedPanelProperties) || hasProperties(view.paginatedProperties) || ((tgrp.title) && (tgrp.title != getMessage('titleForPanel')))){
		if(hasSummarizeBySortOrder(tgrp) && tgrp.measures && !(tgrp.measures.length > 0)){
			// otherwise, display "Required" in red
			opt.innerHTML = getMessage('required');
			opt.style.color = "red";
		}else if (((tgrp.measures) && (tgrp.measures.length > 0)) || hasProperties(tgrp.paginatedPanelProperties) || hasProperties(view.paginatedProperties) || ((tgrp.title) && (tgrp.title != getMessage('titleForPanel')))){
            opt.innerHTML = "";
            addIcon(opt);
        }else {       
            // otherwise, display "Optional" in green
            opt.innerHTML = getMessage('optional');
            opt.style.color = "green";
        }		
	} else if(pattern.match(/editform|viewdef-report/gi) && hasShowCountOrTotals(tgrp.measures) ){
			if(hasFieldsWithSameName(tgrp.fields)){	
				var newMeasures = removeShowCountOrTotals(tgrp.measures);		
				if(newMeasures.length == 0){
					delete tgrp.measures;
					view.tableGroups[buttonIndex] = tgrp;
					tabsFrame.newView = view;
					opt.innerHTML = getMessage('optional');
					opt.style.color = "green"; 
				}
			} else {
				opt.innerHTML = "";
    		addIcon(opt);
    	}				
	}else if(pattern.match(/editform/gi)){
    	if(tgrp.hasOwnProperty('numberOfColumns') && tgrp['numberOfColumns'] != 2){
    		opt.innerHTML = "";
    		addIcon(opt);
    	} else {
    		// otherwise, green
    		opt.innerHTML = getMessage('optional');
    		opt.style.color = "green";    		
    	}
	} else if(pattern.match(/columnreport/gi)){
    	if((tgrp.hasOwnProperty('numberOfColumns') && tgrp['numberOfColumns'] != 2) || hasColumnReportOpts(tgrp['fields'])){
    		opt.innerHTML = "";
    		addIcon(opt);
    	} else {
    		// otherwise, green
    		opt.innerHTML = getMessage('optional');
    		opt.style.color = "green";    		
    	}
	} else {
    
        // if title specified, display checked icon
        if ((tgrp.title) && (tgrp.title != getMessage('titleForPanel'))) {
            opt.innerHTML = "";
            addIcon(opt);
        }
        else {
        
            // otherwise, green
            opt.innerHTML = getMessage('optional');
            opt.style.color = "green";
        }
    }
    
    // actionproperties
    if((this.viewType == 'reports') || (this.viewType == 'summaryReports')){ 
    	var numberOfTgrps = view.tableGroups.length;
    	var prefixesRev = [ "drill2", "drill",  "data"];
    	for(var b=numberOfTgrps+1; b<=prefixesRev.length; b++){
    		prefixesRev.splice(0, 1);
    	}

    	var index = (numberOfTgrps == 1) ? 0 : prefixesRev.indexOf(prefix);
    	

    	if(!view.hasOwnProperty('panelProperties')){
    		var actionProperty = new Object();	
    		//view.actionProperties = [actionProperty,actionProperty,actionProperty];
    		view.panelProperties = [actionProperty,actionProperty,actionProperty];
    		tabsFrame.newView = view;
    	}
                    
    	//if((toJSON(view.actionProperties[index]) != '{}')){
    	if((toJSON(view.panelProperties[index]) != '{}')){
    		opt.innerHTML = '';
    		addIcon(opt);
    	}
    }
}

/**
 * Deletes all rows (except for headings) in HTML table with given table name
 *
 * @param	table_name	String containing name of HTML table
 * @return	None
 *
 */
function resetTable(table_name){
    var table = $(table_name);
    var rows = table.tBodies[0].rows.length;
    for (var i = rows; i > 1; i--) {
        table.deleteRow(i - 1);
    }
}

/**
 * Used "View Summmary" view of "Set Characteristics" tab.  Add an image tag with checked icon
 * to given element.
 *
 * @param	element		HTML object
 * @return	None
 *
 */
function addIcon(element){
    var image_path = "/archibus/schema/ab-core/graphics/icons/tick-white.png";
    var src = image_path;
    
    var img = document.createElement("img");
    img.setAttribute("src", src);
    img.setAttribute("border", "0");
    
    img.setAttribute("align", "middle");
    img.setAttribute("valign", "right");
    
    element.appendChild(img);
}

function hasColumnReportOpts(fields){
	if(fields){
		for(var i=0; i<fields.length; i++){
			if(valueExistsNotEmpty(fields[i]['ml_heading_english']) && valueExistsNotEmpty(fields[i]['ml_heading_english_original'])) {
				if(fields[i]['ml_heading_english'].replace('\r\n', ' ') != fields[i]['ml_heading_english_original'].replace('\r\n', ' ')){
					return true;
				}
			}
			if(valueExists(fields[i]['colspan'])){
				return true;
			}
			if(valueExists(fields[i]['rowspan'])){
				return true;
			}
		}	
		return false;
	}
}
/**
 * Used in "Set Fields" child tab.  Checks checkboxes for selected fields.
 *
 * @param	None
 * @return	None
 *
 */
function checkBoxesForSelectedFields(){
    var view = tabsFrame.newView;
    
    // get index of tablegroup
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;   
    // get main table
    var main_table = view.tableGroups[index].tables[0].table_name;
    
    var fields = [];  
    // if main table matches restriction, get fields
    if (main_table === tabsFrame.restriction.clauses[0].value) {
         fields = view.tableGroups[index].fields;
    }
    
    // get grid
    var grid = Ab.view.View.getControl('', 'fields_grid');
    
    // if grid and fields exist
    if ((grid !== null) && (fields !== undefined) && (fields.length > 0)) {
    	 checkMatchedRows(grid, fields);
    }
}

/**
 * Used in "Set Options" tab.  Gets list of fields in view object and create measures
 * summary table based on field properties.
 *
 * @param 	view	Object of view properties
 * @param	index	Integer holding the index of the selected tablegroup
 * @return	None
 *
 */
function createMeasuresSummaryTable(view, index){

    // get fields
    var fields = view.tableGroups[index].fields;
    
    // get HTML table
    var summaryTable = $('measuresSummary');
    tBody = summaryTable.tBodies[0];
    
    // if fields were defined
    if (fields != undefined) {
    
        // for each field in selected tablegroup of view object
        for (var i = 0; i < fields.length; i++) {
        		//if(fields[i].is_virtual == 'false'){
        			
        			// get the number of rows in the HTML table.  this number changes as fields are added
        			var numOfRows = tBody.rows.length;
        			var data_type = fields[i].data_type;
        			
        			// create row and add id (although this id can become obsolete as we can remove rows
        			var new_tr = document.createElement('tr');
        			new_tr.id = "row" + i;
        			new_tr.ml_heading_english = fields[i].ml_heading_english;
        			        			
        			// add cell with ml heading
        			var new_td = document.createElement('td');
        			new_td.name = "scShow";
        			new_td.innerHTML = fields[i].ml_heading;
        			new_tr.appendChild(new_td);
        			
        			// add cell with field name
        			var new_td = document.createElement('td');
        			new_td.name = "scShow";
        			new_td.innerHTML = fields[i].field_name;
        			new_tr.appendChild(new_td);
        			
        			// add cell with checkbox for count
        			var new_td = document.createElement('td');
        			new_td.name = "scShow";

        			if((fields[i].is_virtual == 'false') || (fields[i].is_virtual == false)){
        				if ( !(i == 0 && fields[i].table_name != view.tableGroups[index].tables[0].table_name) ) {
        					new_td.innerHTML = '<input type="checkbox" name="' + fields[i].field_name + '" value="Count" onClick="saveOps(this)"/>';       					
        				}
        			}
        			new_tr.appendChild(new_td);
        			
        			// add cell for sum, but only create checkbox if "Numeric" data_type
        			var new_td = document.createElement('td');
        			new_td.name = "scShow";
        			if (data_type.match(/Numeric|Integer|SmallInt/gi) && ((fields[i].is_virtual == 'false') || (fields[i].is_virtual == false))) {
        				new_td.innerHTML = '<input type="checkbox" name="' + fields[i].field_name + '" value="Sum" onClick="saveOps(this)"/>';
        			}
        			new_tr.appendChild(new_td);
        			
        			// add cell for avg, but only create checkbox if "Numeric" data_type            
        			var new_td = document.createElement('td');
        			new_td.name = "aoHide";
        			if (data_type.match(/Numeric|Integer|SmallInt/gi) && ((fields[i].is_virtual == 'false') || (fields[i].is_virtual == false))) {
        				new_td.innerHTML = '<input type="checkbox" name="' + fields[i].field_name + '" value="Avg" onClick="saveOps(this)"/>';
        			}
        			new_tr.appendChild(new_td);
        			
        			// add cell with checkbox for count-percentage
        			var new_td = document.createElement('td');
        			new_td.name = "aoHide";
        			if((fields[i].is_virtual == 'false') || (fields[i].is_virtual == false)){
        				new_td.innerHTML = '<input type="checkbox" name="' + fields[i].field_name + '" value="count_percent" onClick="saveOps(this)"/>';
        			}
        			new_tr.appendChild(new_td);
        			
        			// add cell for sum-percentage, but only create checkbox if "Numeric" data_type              
        			var new_td = document.createElement('td');
        			new_td.name = "aoHide";
        			if (data_type.match(/Numeric|Integer|SmallInt/gi) && ((fields[i].is_virtual == 'false') || (fields[i].is_virtual == false))) {
        				new_td.innerHTML = '<input type="checkbox" name="' + fields[i].field_name + '" value="sum_percent" onClick="saveOps(this)"/>';
        			}
        			new_tr.appendChild(new_td);
        			
        			// add cell for avg-percentage, but only create checkbox if "Numeric" data_type               
        			var new_td = document.createElement('td');
        			new_td.name = "aoHide";
        			// if (data_type.match(/Numeric|Integer/gi)) {
        			//     new_td.innerHTML = '<input type="checkbox" name="' + fields[i].field_name + '" value="avg_percent" onClick="saveOps(this)"/>';
        			// }
        			new_tr.appendChild(new_td);
        			
        			// add row to table body
        			tBody.appendChild(new_tr);
        		//}
        }
        
        // add table body to table
        summaryTable.appendChild(tBody);
    }
}

/**
 * Used in "Set Options" tab. If measures have been selected, mark appropriate checkboxes.
 *
 * @param	view	Object holding view properties
 * @param	index	Integer of index for current tablegroup
 * @return	None
 *
 */
function markSelectedMeasures(view, index){

    // get array of measures from view object
	var measures = view.tableGroups[index].measures;

    // if measures were defined
    if (measures != undefined) {
        // loop through each measure object
        for (i = 0; i < measures.length; i++) {
            var fieldName = measures[i].field_name;
            var stats = measures[i].stats;
            var cb = document.getElementsByName(fieldName);
            // for each statistics, if match in summary table, check the checkbox
            for (j = 0; j < stats.length; j++) {
                for (k = 0; k < cb.length; k++) { 
                	/*               	
                		var cb_value = cb[k].value.toLowerCase();
                		cb_value = cb_value.replace('_', '-', 'gi');

                    if (cb_value == stats[j].toLowerCase()) {
                        cb[k].checked = true;
                    }
                   */
                		var cb_value = createStatPrefix(cb[k].value);

                    if (cb_value == createStatPrefix(stats[j])) {
                        cb[k].checked = true;
                    }
                }
            }
        }
    }
}

/**
 * Used in "Set Options tab.  Certain chart properties need to have values that fall within a
 * specified range.  Used to check if the value does fall within the range.  If so, proceed
 * to set the chart property.  Warn if it does not.
 *
 * @param 	start 	Numeric		Minimum value that input can be
 * @param	end		Numeric		Maximum value that input can be
 * @param	id		String		Name of chart property
 * @param	value	Numeric		Input value
 * @return	None
 *
 */
function validateAndSetNumericOption(default_value, start, end, id, value){

    // regular expression to check if numeric
    var regex = /[^\d|.]/gi;
    
    // if not numeric or value is out of range, warn
    if ((value.match(regex)) || (start > value) || (value > end)) {
        alert(getMessage('inputRange') + " " + start + '-' + end);
    }
    else {
    
        // otherwise, proceed to set property
        setChartProperty(default_value, id, value);
    }
}

/**
 * Sets and store view-level properties into view object in tab frame
 *
 * @param	name			String 	Name of view-level property
 * @param	default_value	String	Default value of property	
 * @param	property		String 	Name of chart property
 * @param	value			String	Input value (this might be further processed to match view validation)
 * @return	None
 *
 */
function setViewLevelProperty(name, default_value, property, value){
	var view = tabsFrame.newView;
	var properties = view[name];
	if ((default_value == value) && (properties.hasOwnProperty(property) )){
		delete properties[property];
	} else {
		properties[property] = value;	
	}

	view[name] = properties;
    tabsFrame.newView = view;   
}

/**
 * Sets and store chart property into view object in tab frame if selected value is different 
 * from default value
 *
 * @param	default_value	String	Default value 
 * @param	property		String 	Name of chart property
 * @param	original		String	Input value (this might be further processed to match view validation)
 * @return	None
 *
 */
function setChartProperty(default_value, property, value){
   
    // if property is width or height, trim off percentage sign
    if ((property == 'width') || (property == 'height')) {
        value = value + '%';
    }

	setViewLevelProperty('chartProperties', default_value, property, value);    
}

/**
 * Sets and store paginated property into view object in tab frame if selected value is different from
 * default value
 *
 * @param	default_value	String	Default value  
 * @param	id				String 	Name of chart property
 * @param	value			String	Input value (this might be further processed to match view validation)
 * @return	None
 *
 */
function setPaginatedProperty(default_value, property, value){	
	setViewLevelProperty('paginatedProperties', default_value, property, value); 
}

/**
 * Sets and store paginated panel property into view object in tab frame
 *
 * @param	id		String 	Name of chart property
 * @param	value	String	Input value (this might be further processed to match view validation)
 * @return	None
 *
 */
function setPaginatedPanelProperty(property, value){
    var view = tabsFrame.newView;
	var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
	var curTgrp = view.tableGroups[index];
	
	switch (property) {					
		case "groupBandFormat":
		
			// if the property is groupBandFormat, each option actually stores two properties (format and column) as format-column
			var temp = value.split('-');
			var format = temp[0];
			curTgrp.paginatedPanelProperties['format'] = format;
		
			// if this is a table format, there are no columns so remove property
			if (format == 'table') {
				delete curTgrp.paginatedPanelProperties.column;
			}
			else {
		
				// otherwise, insert the column value
				curTgrp.paginatedPanelProperties['column'] = temp[1];
			}
        break;

		case "pageBreakBefore":
			if (value == 'false'){
				delete curTgrp.paginatedPanelProperties.pageBreakBefore;
			} else {
				curTgrp.paginatedPanelProperties['pageBreakBefore'] = true;
			}
		break;	
						
		case "summarizeBySortOrder":
		
			// get the checkbox		
			var summarizeBySortOrder = $('summarizeBySortOrder');
			
			//if(pattern.match(/paginated-parent/gi) && (index != (numberOfTblgrps-1)) && ($('summarizeBySortOrder').checked == false)){
			if(pattern.match(/paginated-parent|paginated-highlight-thematic/gi) && ($('summarizeBySortOrder').checked == false)){
				$('measuresSummary').style.display = "none";
			} else {
				$('measuresSummary').style.display = "";
			}	
							
			// if checked, store value and show summary table.  if unchecked, remove property, hide summary, and clear measures			
			if (summarizeBySortOrder.checked == true) {
				curTgrp.paginatedPanelProperties[property] = value;
				//$('measuresSummary').style.display = '';
				showStatisticsColumns('', '');
			} else {
							
				// otherwise, delete property	
				delete curTgrp.paginatedPanelProperties.summarizeBySortOrder;
				// $('measuresSummary').style.display = 'none';
				// redraw table
				var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
				tabsFrame.newView.tableGroups[index].measures = new Array();
				
				resetTable('measuresSummary');
				createMeasuresSummaryTable(view, index);
				markSelectedMeasures(view, index);
				showStatisticsColumns('', 'none');										
			}
			
        break;
        default:
			curTgrp.paginatedPanelProperties[property] = value;
        break;
   }	
		
    tabsFrame.newView = view;
}

/**
 * Certain chart properties can affect whether other chart properties are available.  Used to control
 * which which properties are available during onChange event.
 *
 * @param	property	String of name for inital property
 * @param	value		String of value for initial property
 * @return	None
 *
 */
function toggleRelatedProperty(property, value){
    var regEx = /^barChart$|^columnChart$|^pieChart$/;
  
    // only bar, column or pie charts allow a labelposition to be set
    if (property == 'controlType') {
		var labelPosition = $('labelPosition');
		var firstOptionValue = labelPosition.options[0].value;
        if (!value.match(regEx)) {
            labelPosition.style.display = 'none';
			labelPosition.value = firstOptionValue;
			setChartProperty(firstOptionValue, 'labelPosition', firstOptionValue);
        }
        else {
            $('labelPosition').style.display = '';
        }
    }
    
    // if autoCalculateTickSizeInterval
    if (property == 'autoCalculateTickSizeInterval') {
        var tickSizeIntervalObj = $('tickSizeInterval');
        
        // and  autoCalculateTickSizeInterval is set to true, hide tick size interval
        if (value.match(/true/i)) {
            tickSizeIntervalObj.style.display = 'none';
			tickSizeIntervalObj.value = 1000;
			setChartProperty(1000, 'tickSizeInterval', 1000);
        }
        else {       
            // otherwise, explicitly display option
            tickSizeIntervalObj.style.display = '';
        }
    }   
}

/**
 * Restrict records to show only fields with selected table name
 *
 * @param	None
 * @return	None
 *
 */
function setRestrictionOnGrid(){

    var table_name = tabsFrame.restriction.clauses[0].value;
    var grid = Ab.view.View.getControl(window, 'fields_grid');
    
    // create restriction to show only fields with specified table name
    var restriction = new Ab.view.Restriction();
    if (table_name != "") {
        restriction.addClause("afm_flds.table_name", table_name, '=');
    }
    
    var listOfRestrictedFields = tabsFrame.listOfRestrictionFields;
    if(listOfRestrictedFields){
    	restriction = addFieldsToRestriction(restriction, listOfRestrictedFields);
  	}
    
    // override onMultipleSelectionChange event with custom onCheck function
    grid.addEventListener('onMultipleSelectionChange', function(row){
        onCheck(row);
    });

	grid.indexLevel = 0;
	grid.isCollapsed = false;
	grid.showIndexAndFilter();
					    
    // refresh and show grid
    grid.refresh(restriction)
    grid.showOnLoad = true;
    //grid.show();
;



}

/**
 * Used in "Select Fields" tab.  Onclick event handler for checkboxes.  If checkbox is checked,
 * add selected fields to summary table and to view object.  If unchecked, remove.
 *
 * @param	row		Object row
 * @return	None
 *
 */
function onCheck(row){
    var sTable = $("selectedFields");
    var table_name = row['afm_flds.table_name'];
    var field_name = row['afm_flds.field_name'];
    var tBody = sTable.tBodies[0];
 
    // if checkbox is checked,add selected fields to summary table and to view object.
    var tRowIndex = getSelectedFieldsTableRowIndex(table_name, field_name,  tBody.rows);
    if (row.row.isSelected()) {
    	if(tRowIndex < 0){
    		addSelectedFields(row);
    	}
    } else  {
    	if(tRowIndex > 0){
    		  // otherwise, get the "Remove" button and click it
            removeButtons = document.getElementsByName("removeRow");
            removeButtons[tRowIndex - 1].click();
    	}
    }

    // save	
    getFieldValues();
}

function getSelectedFieldsTableRowIndex(table_name, field_name, tableRows){
	 for (var x = 1; x < tableRows.length; x++) {
         var sRow = tableRows[x];
         if ((field_name === sRow.cells[0].innerHTML) && (table_name === sRow.cells[5].innerHTML)) {
            return x;
         }
     }  
	 
	 return -1;
}

/**
 * Used when a characteristic button is pressed in "View Summary" tab.  Store index of tablegroup
 * that was selected.  Navigate to desired tab, apply appropriate restriction based on table name selected.
 *
 * @param 	tabName		String name of Characteristic child tab (page4a, page4b, etc)
 * @param	tableGroup	String that describes selected tablegroup's hierarchy
 * @param	tableName	String of selected table name
 * @return	None
 *
 */
function showTab(tabName, tableGroup, tableName){

    // store the index of tablegroup that was selected
    switch (tableGroup) {
        case "owner2grpRestriction":
            tabsFrame.selectedTableGroup = 2;
            break;
        case "ownergrpRestriction":
            tabsFrame.selectedTableGroup = 1;
            break;
        case "datagrpRestriction":
            tabsFrame.selectedTableGroup = 0;
            break;
        //		default: tabsFrame.selectedTableGroup = 0;
    }
    
    // navigate to desired tab, applying appropriate restriction based on table name selected. 
    switch (tabName) {
        case "page4b":
            // If the target frame is page4b (Select Fields), then restrict the records
            // according to the table name 
            var restriction = new Ab.view.Restriction();
            restriction.addClause("afm_flds.table_name", tableName, "=");
            tabsFrame.restriction = restriction;
            myTabsFrame.selectTab('page4b');
            break
        case "page4c":
            var restriction = new Ab.view.Restriction();
            restriction.addClause("afm_flds.table_name", tableName, "=");
            tabsFrame.restriction = restriction;
            myTabsFrame.selectTab('page4c', restriction);
            break
        case "page4d":
            var restriction = new Ab.view.Restriction();  
            var inValues = [];         					
         //   restriction = "afm_flds.table_name IN (";
                       
            var parameters = {
                tableName: 'afm_flds',
                fieldNames: toJSON(['afm_flds.table_name', 'afm_flds.field_name', 'afm_flds.ref_table']),
                restriction: '{"afm_flds.table_name":' + tableName + '}',
                recordLimit: 0
            };
            var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
            
            if (result.code == 'executed') {           
                for (var i = 0; i < result.data.records.length; i++) {
                    var record = result.data.records[i];
                    if (record['afm_flds.ref_table'] != '') {
                       inValues.push(  record['afm_flds.ref_table']);
                    }
                }
            }
            // kb3044874 if there are no standard fields
            if (inValues.length == 0) {
            	inValues = [''];
            }
            
            //restriction += "' ')";
            restriction.addClause("afm_flds.table_name", inValues, "IN");
              
            var listOfRestrictedFields = tabsFrame.listOfRestrictionFields;
            if(listOfRestrictedFields){
            	restriction = addFieldsToRestriction(restriction, listOfRestrictedFields);
          	}
            myTabsFrame.refTable = tableName;
            tabsFrame.restriction = restriction;
            myTabsFrame.selectTab('page4d', restriction);
            break
        case "page4e":
            var restriction = new Ab.view.Restriction();
            restriction.addClause("afm_flds.table_name", tableName, "=");
            tabsFrame.restriction = restriction;
            myTabsFrame.selectTab('page4e', restriction);
            break
        case "page4f":
            myTabsFrame.selectTab('page4f');
            var restriction = new Ab.view.Restriction();
            restriction.addClause("afm_flds.table_name", tableName, "=");
            tabsFrame.restriction = restriction;
            myTabsFrame.selectTab('page4f', restriction);
            break
    }
}

/**
 * Get list of field properties, including appropriate ml_heading_xx using with dbextension
 *
 * @param	None
 * @return	fieldsList array
 *
 */
function getLocalizationFieldProperties(){
	  var dbExtension = View.user.dbExtension;
    var currentLanguageField = 'afm_flds_lang.ml_heading' + '_' + dbExtension;
	  var fieldsList = new Array();
    fieldsList.push("afm_flds.field_name");
    if(dbExtension == ''){
    	fieldsList.push("afm_flds.ml_heading");
    } else {
    	fieldsList.push(currentLanguageField);
    }

    fieldsList.push("afm_flds.data_type");
    fieldsList.push("afm_flds.afm_type");
    fieldsList.push("afm_flds.primary_key");
    fieldsList.push("afm_flds.table_name");
    fieldsList.push("afm_flds.ml_heading");
    return fieldsList;	
}

/**
 * Add selected field to summary table if it does not already exist.
 *
 * @param	None
 * @return	None
 *
 */
function addSelectedFields(row){
	var table = $("selectedFields");
	var tBody = table.tBodies[0];
	var new_tr = createRowForSelectedField(row);
	
	tBody.appendChild(new_tr);
	// $('td_' + table_name + '.' + field_name).style.display = status;
	table.name = tBody.rows.length;             
}

function replaceSelectedFields(row, index){
	var table = $("selectedFields");
	var tBody = table.tBodies[0];
	var new_tr = createRowForSelectedField(row);
	tBody.replaceChild(new_tr, table.rows[index]);

	// $('td_' + table_name + '.' + field_name).style.display = status;
	table.name = tBody.rows.length;             
}

function createRowForSelectedField(row){
	    var grid = Ab.view.View.getControl('', 'fields_grid');       
    var fieldsList = getLocalizationFieldProperties();  
//    var fieldsList = ["afm_flds.field_name", "afm_flds.ml_heading", "afm_flds.data_type", "afm_flds.afm_type", "afm_flds.primary_key", "afm_flds.table_name"];
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
	var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);

	var status = 'none';					
	if (pattern.match(/paginated-parent/gi) && (index < (numberOfTblgrps - 1))){
		status = '';	
	}
	
	var field_name = row['afm_flds.field_name'];
	var table_name = row['afm_flds.table_name'];
	
	var new_tr = document.createElement('tr');
	new_tr.id = "row_" + table_name + '.' + field_name;
		
	for (var j = 0; j < fieldsList.length; j++) {
		var new_td = document.createElement('td');
		// if(fieldsList[j] == 'afm_flds.ml_heading'){
			new_td.innerHTML = row[fieldsList[j]];	
			if((j > 2 ) && (fieldsList[j] == 'afm_flds.ml_heading')){
				new_td.style.display = 'none';
			}		
		// }
		new_tr.appendChild(new_td);
		if(row['is_virtual']){
			var sql = eval('(' + row['sql'] + ')');
			var sqlMsg = '<b>' + getMessage('generic') + '</b>  ' + sql.generic + '<br/><b>' + getMessage('oracle') + '</b>  ' + sql.oracle + '<br/><b>' + getMessage('sqlServer') + '</b>  ' + sql.sqlServer + '<br/><b>' + getMessage('sybase') + '</b>  ' + sql.sybase;
			new_td.setAttribute('ext:qtip', sqlMsg);
			//new_td.sql = sql;
			new_td.sql = row['sql'];
			new_td.vf = row;
		}
		new_tr.ml_heading_english = row['afm_flds.ml_heading'];
	}
	
	var new_td = document.createElement('td'); 
	new_td.id = 'td_' + table_name + '.' + field_name; 
	new_td.style.display = status; 
	new_td.innerHTML = '<input id="param_' + table_name + '.' + field_name + '" type="checkBox" onclick="getFieldValues()">';
	new_tr.appendChild(new_td);

	var new_td = document.createElement('td'); 
	new_td.id = 'td_' + table_name + '.' + field_name;  
	var strCheckBox = '<input id="showSelectValueAction_' + table_name + '.' + field_name + '" type="checkbox" value="true" onclick="getFieldValues();showSelectVWarning(this.checked);" ';
	strCheckBox += 'style="';
	if ((row['afm_flds.primary_key'] == 0) && pattern.match(/editform/) && (index == (numberOfTblgrps - 1))) {
		strCheckBox += '"/>';
	} else {
		strCheckBox += 'display:none"></input>';
	}
	
	/*
	var new_td = document.createElement('td'); 
	new_td.id = 'td_' + table_name + '.' + field_name;  
	var strCheckBox = '<input name="showSelectValueAction_' + table_name + '.' + field_name + '" type="radio" value="true" onclick="getFieldValues();this.checked=true;" ';
	strCheckBox += 'style="';
	if ((row['afm_flds.primary_key'] == 0) && pattern.match(/editform/) && (index == (numberOfTblgrps - 1))) {
		strCheckBox += '">' + getMessage('show') + '</input>&nbsp;&nbsp;';
	} else {
		strCheckBox += 'display:none"></input>';
	}
	strCheckBox += '<input name="showSelectValueAction_' + table_name + '.' + field_name + '" type="radio" value="false" onclick="getFieldValues();this.checked=true;" ';
	strCheckBox += 'style="';
	if ((row['afm_flds.primary_key'] == 0) && pattern.match(/editform/) && (index == (numberOfTblgrps - 1))) {		
		strCheckBox += '">' + getMessage('hide') + '</input>';
	} else {
		strCheckBox += 'display:none"></input>';
	}
	*/
	
	new_td.innerHTML = strCheckBox;	
	new_tr.appendChild(new_td);

	var new_td = document.createElement('td');
	if(row['is_virtual']){
		new_td.innerHTML = 'true';
	}else{
		new_td.innerHTML = 'false';
	}
	new_tr.appendChild(new_td);
			
	var new_td = document.createElement('td');	
	new_td.setAttribute("nowrap", "nowrap");			           
	createButton("Remove", "removeRow", getMessage("remove"), "selectedFields", new_td);
	createButton("Up", "moveUp", getMessage("up"), "selectedFields", new_td);
	createButton("Down", "moveDown", getMessage("dn"), "selectedFields", new_td);
	if(row['afm_flds.afm_type'] == 'Virtual Field'){
		createButton("Edit", "editVirtualField", getMessage("edit"), "selectedFields", new_td);                           	
	}
	new_tr.appendChild(new_td);
		
	var new_td = document.createElement('td');
	new_tr.appendChild(new_td);
	return new_tr;
}


/**
 * Move row up
 *
 * @param	e
 * @param	tableId	String Id of table
 * @return	None
 *
 */
function moveUp(e, tableId){
    var tableObject = $(tableId);
    var trObject = this.parentNode.parentNode;
    var rowIndex = trObject.rowIndex;
    
    if (rowIndex > 1) {
        var nextSibling = tableObject.rows[rowIndex - 1];
        tableObject.tBodies[0].insertBefore(trObject, nextSibling);
    }
    if (tableId == "restrictionSummary") {
        saveRestrictions();
    }
    if (tableId == "selectedFields") {
        getFieldValues();
    }
}

/**
 * Move row down
 *
 * @param	e
 * @param	tableId	String Id of table
 * @return	None
 *
 */
function moveDown(e, tableId){
    var tableObject = $(tableId);
    var trObject = this.parentNode.parentNode;
    var rowIndex = trObject.rowIndex;
    if (rowIndex < tableObject.tBodies[0].rows.length - 1) {
        var nextSibling = tableObject.rows[rowIndex + 1];
        tableObject.tBodies[0].insertBefore(nextSibling, trObject);
    }
    if (tableId == "restrictionSummary") {
        saveRestrictions();
    }
    if (tableId == "selectedFields") {
        getFieldValues();
    }
}

/**
 * Remove specified row and save changes
 *
 * @param	e
 * @parem	tableId	Id of HTML table	
 * @return	None
 *
 */
function removeRow(e, tableId){
    var tableObject = $(tableId);
    var trObject = this.parentNode.parentNode;
    var field_name = trObject.cells[0].innerHTML;
    var table_name = '';
    if(tableId == 'restrictionSummary'){
    	trObject.cells[4].innerHTML;
  	} else {
  		trObject.cells[5].innerHTML;
  	}
    var rowIndex = trObject.rowIndex;
    tableObject.deleteRow(rowIndex);
    
    // Uncheck the removed field (for Select Fields only)
    var grid = Ab.view.View.getControl('', 'fields_grid');
    if (grid != null) {
    	var rows = grid.rows;
        var dataRows = grid.getDataRows();
        var notAvailable = true;
        for (var i = 0; i < dataRows.length; i++) {
            var dataRow = dataRows[i];
            var fieldname = dataRow.cells[1].innerHTML;
            if (field_name === fieldname) {
            	notAvailable = false;
               // var checkbox = dataRow.firstChild.firstChild;
                //checkbox.checked = false;
                grid.updateSelectionModel(rows[i], false, true);
                break;
            }
        }
        if(notAvailable){
            //remove from selectionModel
        	var selectedRows = grid.getAllSelectedRows();
        	for (var r = 0, row; row = selectedRows[r]; r++) {
        		if(field_name === row.row.record['afm_flds.field_name']){
        			grid.selectionModel.remove(row);
        			break;
        		}
        	}
        }
    }
    if (tableId == "restrictionSummary") {
        saveRestrictions();
    }
    
    if (tableId == "selectedFields") {
			//--> begin index field
    	var view = tabsFrame.newView;
    	var tgrpndx = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    	var curTgrp = view.tableGroups[tgrpndx];    	
    	
    	// if an index field exists
    	if (curTgrp.hasOwnProperty('indexField')){
    		var indexField = curTgrp.indexField;
    		// is the removed field also the index field?
    		if ((indexField.table_name == table_name) && (indexField.field_name == field_name)){
    			//if so, remove
    			delete view.tableGroups[tgrpndx].indexField;
    			tabsFrame.newView = view;
    		}
    	}
    	// end index field
    	
      getFieldValues();
    }
}

/**
 * Create button, attach appropriate listener method and parameters depending on name, 
 * and add button to cell
 *
 * @param	id		String	Button id
 * @param	name	String	Button name
 * @param	value	String	Button value
 * @param	param	Object	Parameters for listener method
 * @param	tdObjectObject	Cell object
 * @return	None
 *
 */
function createButton(id, name, value, param, tdObject){

    try {
        // For IE
        var new_button = document.createElement('<input id="' + id + '" name="' + name + '" type="button" value="' + value + '" />');
    } 
    catch (e) {
        // For FF
        var new_button = document.createElement('input');
        new_button.setAttribute("id", id);
        new_button.setAttribute("name", name);
        new_button.setAttribute("value", value);
        new_button.setAttribute("type", "button");
    }
    
    var parameters = [];
    parameters["param"] = param;
    
    switch (name) {
        case "removeRow":
            YAHOO.util.Event.addListener(new_button, "click", removeRow, param);
            break;
        case "moveUp":
            YAHOO.util.Event.addListener(new_button, "click", moveUp, param);
            break;
        case "moveDown":
            YAHOO.util.Event.addListener(new_button, "click", moveDown, param);
            break;
        case "editVirtualField":
            YAHOO.util.Event.addListener(new_button, "click", editVirtualField, param);
            break;
        case "setSort":
            YAHOO.util.Event.addListener(new_button, "click", setSortAndSave, param);
           	break;
    }
    tdObject.appendChild(new_button);
}

/**
 * Remove any existing rows from given tBody
 *
 * @param	None
 * @return	None
 *
 */
function removeExistingRows(tBody){
    var num = tBody.rows.length;
    if (tBody.rows.length > 1) {
        for (var i = 1; i < num; i++) {
            var rowToDelete = tBody.rows[1];
            tBody.deleteRow(rowToDelete.rowIndex);
        }
    }
}

function clearFields(){
	// reset the summary panel
    var table = document.getElementById("selectedFields");
  	var tBody = table.tBodies[0];
   	removeExistingRows(tBody);
	getFieldValues();		
	
	// reset the selection panel
	var grid = Ab.view.View.getControl('', 'fields_grid');
	grid.selectionModel.clear();
	grid.reloadGrid();
}

/**
 * Ensure that selected characteristics are valid
 *
 * @param	curTgrp	Object current tablegroup
 * @param	index	Index of current tablegroup
 * @return	None
 *
 */
function validateSelections(curTgrp, index){
    var fields = curTgrp.fields;
    var tables = curTgrp.tables;
    var sortFields = curTgrp.sortFields;
    var restrictions = curTgrp.parsedRestrictionClauses;
    var statistics = curTgrp.statistics;
    
    if (tables != undefined) {
        var tblCheck = checkAgainstTables(tables, fields);
        curTgrp.tables = tblCheck.arrNew;
    }
    
    if (sortFields != undefined) {
        var sortCheck = checkAgainstTblAndFlds(sortFields, fields);
        curTgrp.sortFields = sortCheck.arrNew;
    }
    
    if (restrictions != undefined) {
        var restCheck = checkAgainstTblAndFlds(restrictions, fields);
        curTgrp.parsedRestrictionClauses = restCheck.arrNew;
    }
    
    if (hasStat(curTgrp)) {
        var measures = curTgrp.measures;
        var measureCheck = checkAgainstTblAndFlds(measures, fields);
        curTgrp.measures = measureCheck.arrNew;
    }

    var view = tabsFrame.newView;
    view.tableGroups[index] = curTgrp;
    tabsFrame.newView;
}

/**
 * Check if there are any tables that do not have fields and remove the table
 *
 * @param 	checkee	 Array
 * @param	checker	 Array
 * @return 	Object	Object that has two properties arrNew and arrRemoved
 *
 */
function checkAgainstTables(checkee, checker){
    var arrNew = new Array();
    var arrRemoved = new Array();
    arrNew.push(checkee[0]);
    
    for (var i = 1; i < checkee.length; i++) {
        var bFound = false;
        var tTbl = checkee[i].table_name;
        
        for (var j in checker) {
            if (checker[j].table_name == checkee[i].table_name) {
                bFound = true;
                break;
            }
        }
        if (bFound == false) {
            arrRemoved.push(checkee[i]);
        }
        else {
            arrNew.push(checkee[i]);
        }
    }
    return {
        arrNew: arrNew,
        arrRemoved: arrRemoved
    };
}

/**
 * Check if there are any non-main tables that do not have fields and remove the table
 *
 * @param	checkee	Array
 * @param	checker	Array
 * @return	Object	Object that has two properties arrNew and arrRemoved
 *
 */
function checkAgainstTblAndFlds(checkee, checker){
    var arrNew = new Array();
    var arrRemoved = new Array();
    
    // Check if there are any non-main tables that do not have fields and remove the table
    for (var i = 0; i < checkee.length; i++) {
        var bFoundTbl = false;
        var tTbl = checkee[i].table_name;
        for (var j in checker) {
            if ((checker[j].table_name == checkee[i].table_name) && (checker[j].field_name == checkee[i].field_name)) {
                bFoundTbl = true;
            }
        }
        if (bFoundTbl == false) {
            arrRemoved.push(checkee[i]);
        }
        else {
            arrNew.push(checkee[i]);
        }
    }
    return {
        arrNew: arrNew,
        arrRemoved: arrRemoved
    };
}

/**
 * Get field property values and save in view object
 *
 * @param	None
 * @return	None
 *
 */
function getFieldValues(){
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;	
    var table = $('selectedFields');
    var tBody = table.tBodies[0];
    var numberOfRows = table.name;
    var table_name = tabsFrame.restriction.clauses[0].value;
    var fields = new Array();
	var paramRestArray = new Array();
	var parameters = new Array();
	
    for (var i = 1; i < tBody.rows.length; i++) {
        var fldObject = new Object();
		var field_name = tBody.rows[i].firstChild.innerHTML;
		var table_name = tBody.rows[i].childNodes[5].innerHTML;
		var data_type = tBody.rows[i].childNodes[2].innerHTML;
		
        fldObject.field_name = tBody.rows[i].firstChild.innerHTML;
        fldObject.ml_heading = tBody.rows[i].childNodes[1].innerHTML;
        fldObject.ml_heading_english = tBody.rows[i].ml_heading_english;       
        fldObject.data_type = data_type;
        fldObject.afm_type = tBody.rows[i].childNodes[3].innerHTML;
		fldObject.primary_key = tBody.rows[i].childNodes[4].innerHTML;
        fldObject.table_name = table_name;

        if(valueExistsNotEmpty(tBody.rows[i].ml_heading_english_original)){
        	fldObject.ml_heading_english_original = tBody.rows[i].ml_heading_english_original;
        } else {
        	fldObject.ml_heading_english_original = tBody.rows[i].ml_heading_english;        	        
        }
        if(valueExistsNotEmpty(tBody.rows[i].rowspan)){
        	fldObject.rowspan = tBody.rows[i].rowspan;
        }        
        if(valueExistsNotEmpty(tBody.rows[i].colspan)){
        	fldObject.colspan = tBody.rows[i].colspan;
        }
        
		// store restriction parameter
		var paramRestChckBox = $('param_' + table_name + '.' + field_name );
		if (paramRestChckBox.checked && view.tableGroups[index + 1]){
			var value = convertToCamelCase(table_name + ' ' + field_name);
			fldObject.restriction_parameter = value;

			// create new property in the tablegroup to specifically store parameter restrictions.  eventually part of this will merge with
			// parsed restrictions in preview-helper and part will create the  <parameter name="woId" dataType="text" value=""/>
			var paramRestObj = new Object();
           	paramRestObj.relop = 'AND';
            paramRestObj.op = '=';
            paramRestObj.value = value;
            // paramRestObj.table_name = table_name;
			// use child group's main table name
			paramRestObj.table_name = view.tableGroups[index + 1].tables[0].table_name;
			paramRestObj.field_name = field_name;
			paramRestArray.push(paramRestObj);
			
			var parameterObj = new Object();
			parameterObj.name = value;
			parameterObj.value = "";
			parameterObj.dataType = data_type.toLowerCase();	
			parameters.push(parameterObj);
		}

		var showSelectValueActionRadio = $('showSelectValueAction_' + table_name + '.' + field_name );

		if (showSelectValueActionRadio.checked){
			fldObject.showSelectValueAction = true;
		}
		
		fldObject.is_virtual = tBody.rows[i].childNodes[9].innerHTML;
		if(fldObject.is_virtual){
			fldObject.sql = tBody.rows[i].childNodes[1].sql;
		}

		fields.push(fldObject);
		
		// store showSelectValueAction
		/*
		var showSelectValueActionRadio = document.getElementsByName('showSelectValueAction_' + table_name + '.' + field_name );

		if (showSelectValueActionRadio[0].checked){
			fldObject.showSelectValueAction = true;
		}
		if (showSelectValueActionRadio[1].checked){
		}
        fields.push(fldObject);
        */
    }
    
    // Add and store the selected fields information into previously created view array of tablegroup objects		
    var curTgrp = view.tableGroups[index];
    curTgrp.fields = fields;
	
	// store restriction parameters in child tablegroup, not the current tablegroup
	// if (paramRestArray.length > 0) {
	if(view.tableGroups[index + 1]){
		view.tableGroups[index + 1].parameterRestrictionClauses = paramRestArray;
		view.tableGroups[index + 1].parameters = parameters;
		tabsFrame.newView = view;
	}
    //tabsFrame.newView = view;	 
    validateSelections(curTgrp, index);
}

/**
 * Save select fields go to set characteristics
 *
 * @param	None
 * @return	None
 *
 */
function saveSelectedFields(){
    var table = $('selectedFields');
    var tBody = table.tBodies[0];
    var pattern = tabsFrame.patternRestriction;
	var view = tabsFrame.newView;
	  var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;	
	  var curTgrp = view.tableGroups[index];
	// var bIsPaginatedHighlight = pattern.match(/paginated-highlight/gi);
	
	// detect if fields have been selected and allow the label datasource for paginated drawings to be left empty  
    if ((tBody.rows.length > 1) || bIsPaginatedHighlight) {
        getFieldValues();			
    }
       
    if( isPaginatedParent() &&  !checkRestrictionParams(curTgrp.fields) && (tBody.rows.length > 1)){
    	alert(getMessage('noRestrictionParameter'));
    } else {
    	tabsFrame.selectTab('page4');
    }
}

function isPaginatedParent(){
	var pattern = tabsFrame.patternRestriction;
	var view = tabsFrame.newView;
	var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;	
	if (pattern.match(/paginated-parent/gi) && (index < view.tableGroups.length -1)){
		return true;
	}
	return false;
}

function checkRestrictionParams(fields){	
		for (var x=0; x<fields.length; x++){
			var field = fields[x];
			if (field.hasOwnProperty('restriction_parameter')){
				return true;
			}
		}
		
		return false;
}


/**
 * Create the sort summary table
 *
 * @param	None
 * @return	None
 *
 */
function createSortSummaryTable(){
    // Extract the value property of from the restriction object
    var table_name = tabsFrame.restriction.clauses[0].value;
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    resetTable('sortOrderSummary');
    var table = $('sortOrderSummary');
    var tBody = table.tBodies[0];
    var pattern = tabsFrame.patternRestriction;
    
    var fieldProperties = ["field_name", "ml_heading", "primary_key", "data_type", "afm_type", "table_name", "ml_heading_english"];
    //var fieldProperties = ["field_name", "ml_heading", "primary_key", "data_type", "afm_type", "table_name"];
    //var dateOptions = ['', getMessage('year'), getMessage('yearQuarter'), getMessage('yearMonth'), getMessage('yearMonthDay'), getMessage('yearWeek')];
    // var dateValues = ['', 'year', 'quarter', 'month', 'day', 'week'];
    var curTgrp = view.tableGroups[index];
    var fields = curTgrp.fields;
    var sortFields = curTgrp.sortFields;
    
 //   var groupByDate = '';
 //   var groupByTable = '';
  //  var groupByField = '';
 
    if (hasGroupByDate(curTgrp)) {   	  
        if (pattern.match(/summary|paginated/)) {
            $('groupDates').style.display = "";
        }
    }
    
    // For each field within the tablegroup, create a row 
    if (fields == undefined) {
        alert(getMessage("noFields"));
        tabsFrame.selectTab('page4');
    }
    else {
        for (var k = 0; k < fields.length; k++) {
            var new_tr = document.createElement('tr');
            new_tr.id = "row" + k;
            var fieldObj = fields[k];
            var hasDate = false;
            
            // Loop through the field object, and extract its relevant properties (ie. Field Name, Heading, Primary Key) to fill in table cell			
            for (p in fieldProperties) {
            
                //if ((fieldObj[fieldProperties[p]] != undefined) && (!fieldProperties[p].toString().match(/function/gi)) && (fieldObj[fieldProperties[p]] != "stats")) {
                if ((fieldObj[fieldProperties[p]] != undefined) && (!fieldProperties[p].toString().match(/function/gi)) && (fieldObj[fieldProperties[p]] != "stats") && (fieldProperties[p] != "ml_heading_english")) {
                    var new_td = document.createElement('td');
                    new_td.innerHTML = fieldObj[fieldProperties[p]];
                    new_td.is_virtual = fieldObj['is_virtual'];
                    new_td.sql = fieldObj['sql'];
                    new_tr.appendChild(new_td);                    
                }
                
                if (fieldObj['data_type'] == 'Date') {
                    //	 $('groupDates').style.display = "";
                    hasDate = true;
                }
                
            }
            
            new_tr.ml_heading_english = fieldObj['ml_heading_english'];

			// create cell for ascending/descending
            var new_td = document.createElement('td');
            var id = 'sort_' + fieldObj['table_name'] + '.' + fieldObj['field_name'];
            new_td.innerHTML = '<input type="checkbox" id="' + id + '" onclick="setAscending(this, ' + k + ')" value="false"/>';
            new_tr.appendChild(new_td);
			            
            // Create a cell for the "Sort Order" column 
            var new_td = document.createElement('td');
            new_tr.appendChild(new_td);
            
            // Create a cell for the column with a "Set" button 			 			
            var new_td = document.createElement('td');
            // if (stat == ''){
            createButton("set", "setSort", getMessage("set"), "row" + k, new_td);
            // }			
            new_tr.appendChild(new_td);
            
            // If date field, insert "Group Dates By" column
            var new_td = document.createElement('td');
            if ((hasDate == true) && (pattern.match(/summary|paginated/))) {
            	new_td = fillGroupByDateCell(new_td, curTgrp, fields[k]);

                
 /*           
                if ((groupByTable == fields[k].table_name) && (groupByField == fields[k].field_name) && ((groupByDate == 'year') || (groupByDate == 'month') || (groupByDate == 'quarter') || (groupByDate == 'day') || (groupByDate == 'week'))) {
                    // var oOption = document.createElement("OPTION");
                    // oOption.appendChild( document.createTextNode( dateOptions[dateValues.indexOf(stat)] ));
                    // oOption.value = stat;
                    
                    // newSelect.appendChild(oOption);
                    new_td.innerHTML = dateOptions[dateValues.indexOf(groupByDate)];
                }
                else {
                    var newSelect = document.createElement('select');
                    newSelect.name = "groupBy";
                    newSelect.disabled = false;
                    for (var x = 0; x < dateOptions.length; x++) {
                        var oOption = document.createElement("OPTION");
                        oOption.appendChild(document.createTextNode(dateOptions[x]));
                        oOption.value = dateValues[x];
                        
                        newSelect.appendChild(oOption);
                        
                    }
                    
                    var parameters = [];
                    parameters["select_box"] = newSelect;
                    parameters["field"] = fieldObj;
                    YAHOO.util.Event.addListener(newSelect, "change", onChangeGroupDate, parameters);
                    new_td.appendChild(newSelect);
                }
*/                
            }
            new_tr.appendChild(new_td);
            tBody.appendChild(new_tr);
            
            // Create empty cell in last column 
            var new_td = document.createElement('td');
            new_tr.appendChild(new_td);
            tBody.appendChild(new_tr);
            //      	  	alert(tBody.innerHTML);
        }
    }
	
	// check checkbox if descending order was set
	if (sortFields != undefined){
		for (var m = 0; m < sortFields.length; m++) {
			if (sortFields[m].isAscending == false) {
				var id = 'sort_' + sortFields[m].table_name + '.' + sortFields[m].field_name;
				$(id).checked = true;
			}
		}
	}
}

function fillGroupByDateCell(new_td, curTgrp, field){

	var dateOptions = ['', getMessage('year'), getMessage('yearQuarter'), getMessage('yearMonth'), getMessage('yearMonthDay'), getMessage('yearWeek')];
	var dateValues = ['', 'year', 'quarter', 'month', 'day', 'week'];
	var groupByDates = getGroupByDates(curTgrp);
	var bMatch = false;
	
	for(var n=0; n<groupByDates.length; n++){
		var groupByDate = groupByDates[n].groupByDate;
		var groupByTable = groupByDates[n].table_name;
		var groupByField = groupByDates[n].field_name;
		// alert(groupByField + ' ==> ' + groupByDate );
		
		if ((groupByTable == field.table_name) && (groupByField == field.field_name) && ((groupByDate == 'year') || (groupByDate == 'month') || (groupByDate == 'quarter') || (groupByDate == 'day') || (groupByDate == 'week'))) {
				bMatch = true;
				break;
		}
	}
	
	var newSelect = document.createElement('select');
	newSelect.name = "groupBy";
	newSelect.id = "groupByDate_" + field.table_name + '.' + field.field_name;
	newSelect.disabled = false;
	
	for (var x = 0; x < dateOptions.length; x++) {
		var oOption = document.createElement("OPTION");
		oOption.appendChild(document.createTextNode(dateOptions[x]));
		oOption.value = dateValues[x];
		newSelect.appendChild(oOption);
	}
	
	var parameters = [];
	parameters["select_box"] = newSelect;
	parameters["field"] = field;
	YAHOO.util.Event.addListener(newSelect, "change", onChangeGroupDate, parameters);
	new_td.appendChild(newSelect);
	
	if (bMatch && (field.data_type == 'Date') && pattern.match(/summary|paginated/gi)){
		newSelect.value = groupByDate;
		// alert(groupByDate);
		// selectBox.options[selectBox.selectedIndex].value;
	}
	
	return new_td;
}

/**
 * Determine whether current tablegroup has statistics
 *
 * @param	curTgrp		Object holding current tablegroup
 * @return	bFound		Boolean status of whether found
 *
 */
function hasStat(curTgrp){
    var bFound = false;
    var measures = curTgrp.measures;
    if ((measures) && (measures.length > 0)) {
        var stats = measures[0];
        if ((stats)) {
            bFound = true;
        }
    }
    return bFound;
}

/**
 * Control grouping by date
 *
 * @param	e
 * @param	obj	
 * @return	None
 *
 */
function onChangeGroupDate(e, obj){
    var selectBox = obj["select_box"];
    var fieldObj = obj["field"];
    var view = tabsFrame.newView;
    
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    // kb3031802
    var sortFields = view.tableGroups[index].sortFields;
    // var sortFields = view.tableGroups[(view.tableGroups.length - 1)].sortFields;
    // var sortFields = view.tableGroups[(0)].sortFields;
    
   	/*if ((sortFields == 'undefined') || (sortFields == undefined) || (sortFields == '') || (sortFields.length == 0)){
     //	selectBox.options[selectBox.selectedIndex].value = '';
     alert(getMessage('setSortOrderFirst'));
     selectBox.selectedIndex = 0;
     } else {
     */

    if ((sortFields) && (sortFields.length > 0)) {
        for (var i = 0; i < sortFields.length; i++) {       	
            var sortFld = sortFields[i];
            if ((sortFld['field_name'] == fieldObj['field_name']) && (sortFld['table_name'] == fieldObj['table_name'])) {
                sortFields[i].groupByDate = selectBox.options[selectBox.selectedIndex].value;
                break;
            }
        }
        //view.tableGroups[(view.tableGroups.length - 1)].sortFields = sortFields;
        // kb3031802
        view.tableGroups[index].sortFields = sortFields;
        tabsFrame.newView = view;
    }
    else {
        alert(getMessage('setSortOrderFirst'));
        selectBox.selectedIndex = 0;
    }
}

/**
 * Create array that will used to track the sort order and store this array in summmary table
 *
 * @param	None
 * @return	None
 *
 */
function createSortSelectionArray(){
    var ssArray = new Array();
    ssArray = [getMessage('x20th'), getMessage('x19th'), getMessage('x18th'), getMessage('x17th'), getMessage('x16th'), getMessage('x15th'), getMessage('x14th'), getMessage('x13th'), getMessage('x12th'), getMessage('x11th'), getMessage('x10th'), getMessage('x9th'), getMessage('x8th'), getMessage('x7th'), getMessage('x6th'), getMessage('x5th'), getMessage('x4th'), getMessage('x3rd'), getMessage('x2nd'), getMessage('x1st')];
    var table = $('sortOrderSummary');
    table.name = ssArray;
}

/**
 * On click of "Set" button, hide button and display it order (1st, 2nd, 3rd, etc).
 * If this is summary pattern, only allow one grouping to be made.
 *
 * @param 	e
 * @param	rowID	Object selected row
 * @return	None
 *
 */
function setSort(e, rowID){
	  var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var sortFields = view.tableGroups[index].sortFields;
    var numberSortFields = 0;
    if(valueExistsNotEmpty(sortFields)){
    	numberSortFields = sortFields.length;
    }
    var bDataTgrp = (index == numberOfTblgrps - 1) ? true : false;

    var table = $('sortOrderSummary');
    var ssArray = table.name;
    var selectedRow = $(rowID);
    var pattern = tabsFrame.patternRestriction;	
    
    //    selectedRow.cells[6].innerHTML = '<font color="navy"><b>' + ssArray.pop() + '</b></font>';
    selectedRow.cells[7].innerHTML = ssArray.pop();
    var selectedButtonCell = selectedRow.cells[8];
    selectedRow.cells[8].innerHTML = "";
    table.name = ssArray;

    if ( (pattern.match(/summary-report/) && bDataTgrp && (numberSortFields >= 1)) || (pattern.match(/chart-2d/gi))  || (pattern.match(/chart/gi) && bDataTgrp) ) {
        var rows = table.tBodies[0].rows;
        // hide the set buttons       
        for (var i = 0; i < rows.length; i++) {
            rows[i].cells[8].innerHTML = "";
        }

        
        var selectBoxes = document.getElementsByTagName('select');
    	var groupByBox = selectedRow.cells[9].getElementsByTagName('select');
		var data_type = selectedRow.cells[3].innerHTML;
	

        for (var j = 0; j < selectBoxes.length; j++) {
            selectBoxes[j].disabled = true;
        }


        if (groupByBox.length > 0) {
            groupByBox[0].disabled = false;
        }
       
    }
        
 /*       
    if (pattern.match(/summary/)) {
        var rows = table.tBodies[0].rows;
        // hide the set buttons       
        for (var i = 0; i < rows.length; i++) {
            rows[i].cells[8].innerHTML = "";
        }

        
        var selectBoxes = document.getElementsByTagName('select');
    	var groupByBox = selectedRow.cells[9].getElementsByTagName('select');
		var data_type = selectedRow.cells[3].innerHTML;
	

        for (var j = 0; j < selectBoxes.length; j++) {
            selectBoxes[j].disabled = true;
        }


        if (groupByBox.length > 0) {
            groupByBox[0].disabled = false;
        }
       
    }
    */
}

/**
 * Set the sort and save to view object
 *
 * @param 	e
 * @param 	rowID
 * @return
 *
 */
function setSortAndSave(e, rowID){
    setSort(e, rowID);
    saveSort();
}

/**
 * Clear sort orders from summary table, redraw summmary table, save changes to view object.
 *
 * @param	None
 * @return	None
 *
 */
function clearSortOrder(){
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var curTgrp = view.tableGroups[index];
    
    curTgrp.sortFields = "";
    /*
     if (hasGroupByDate(curTgrp)){
     var groupByDate = curTgrp.sortFields[0].groupByDate;
     if ((groupByDate == 'year') || (groupByDate == 'month') || (groupByDate == 'quarter') || (groupByDate == 'day') || (groupByDate == 'week')){
     curTgrp.sortFields = new Array();
     }
     }
     */
    resetTable('sortOrderSummary');
    onLoadSortSummary();
    	
    tabsFrame.newView = view;
    myTabsFrame.selectTab('page4c');
    
}

/**
 * Save sort to view object
 *
 * @param	None
 * @return	None
 *
 */
function saveSort(){
    var table_name = "sortOrderSummary";
    var table = $(table_name);
    var tBody = table.tBodies[0];
    var ssArray = new Array();
    ssArray = [getMessage('x20th'), getMessage('x19th'), getMessage('x18th'), getMessage('x17th'), getMessage('x16th'), getMessage('x15th'), getMessage('x14th'), getMessage('x13th'), getMessage('x12th'), getMessage('x11th'), getMessage('x10th'), getMessage('x9th'), getMessage('x8th'), getMessage('x7th'), getMessage('x6th'), getMessage('x5th'), getMessage('x4th'), getMessage('x3rd'), getMessage('x2nd'), getMessage('x1st')];
    
    // var objRegExp = /<font color=navy><b>(.*)<\/b><\/font>/i;
    var sortFldsArray = new Array();
    var view = tabsFrame.newView;
    var numRows = tBody.rows.length;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var curTgrp = view.tableGroups[index];

    for (i = 1; i < numRows; i++) {
        var aOrder = ssArray[ssArray.length - i];
        for (k = 1; k < numRows; k++) {
            var row = tBody.rows[k];
            var tOrder = row.cells[7].innerHTML;
            var sortFldObj = new Object();
            if (aOrder == tOrder) {
                sortFldObj.field_name = row.cells[0].innerHTML;
                sortFldObj.ml_heading = row.cells[1].innerHTML;
                sortFldObj.primary_key = row.cells[2].innerHTML;
                sortFldObj.data_type = row.cells[3].innerHTML;
                sortFldObj.afm_type = row.cells[4].innerHTML;
                sortFldObj.table_name = row.cells[5].innerHTML;
                sortFldObj.is_virtual = row.cells[1].is_virtual;
                sortFldObj.sql = row.cells[1].sql;
                var desc = $('sort_' + row.cells[5].innerHTML + '.' + row.cells[0].innerHTML);
                if (desc.checked){
                	sortFldObj.isAscending = false;	
                } else {
                	sortFldObj.isAscending = true;
                }
               
                if ((row.cells[3].innerHTML == 'Date') && pattern.match(/summary|paginated/gi)){
                	var groupByDateObj =  $('groupByDate_' + row.cells[5].innerHTML + '.' + row.cells[0].innerHTML);
                	sortFldObj.groupByDate = groupByDateObj.value;
                }
                sortFldObj.ml_heading_english = row.ml_heading_english;              
                sortFldsArray.push(sortFldObj);

            }
        }
    }
    var view = tabsFrame.newView;
    curTgrp.sortFields = sortFldsArray;	
    view.tableGroups[index] = curTgrp;	
    tabsFrame.newView = view;
}

/**
 * Clear standard from grid and save to view object
 *
 * @param	None
 * @return	None
 *
 */
function clearStandards(){
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var curTgrp = view.tableGroups[index];
    var tables = curTgrp.tables;
	var tmpTables = new Array();

	for (var i=0; i<tables.length; i++){		
		if (tables[i].role == 'standard'){
			var table_name_t = tables[i].table_name;
			removeFieldsOfSpecifiedTable(table_name_t);
		} else {
			tmpTables.push(tables[i]);			
		}
	}

	curTgrp.tables = tmpTables;	
	view.tableGroups[index] = curTgrp;
	tabsFrame.newView = view;
		
    var grid = Ab.view.View.getControl('', 'field_grid');	
    if (grid != null) {
		grid.indexLevel = 0;
		grid.isCollapsed = false;
		grid.showIndexAndFilter();
		grid.refresh();		
    }	   	    
}

function removeFieldsOfSpecifiedTable(table_name_t){
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var curTgrp = view.tableGroups[index];
	var fields = curTgrp.fields;
	var tmpFields = new Array();
		
	for (var j=0; j<fields.length; j++){
		var table_name_f = fields[j].table_name;
		if(table_name_f == table_name_t){
			// fields.splice(j, 1);
			removeSpecifiedSortField(table_name_f, fields[j].field_name)
		} else {
			tmpFields.push(fields[j]);
		}
	}
	curTgrp.fields = tmpFields;	
	view.tableGroups[index] = curTgrp;
	tabsFrame.newView = view;	
}

/**
 * Restrict the standards grid to show only Color Fields and Primary Keys available to the main table
 *
 * @param	None
 * @return	None
 *
 */
function restrictStandardsToColorsPkeys(){
    var grid = Ab.view.View.getControl('', 'field_grid');

    if (grid != null) {
		var restriction = grid.restriction;
		restriction.addClause('afm_flds.afm_type', '2145', '=', ')AND(');
		restriction.addClause('afm_flds.primary_key', '0', '>', 'OR');
	//	restriction += " AND (afm_type = 2145 OR primary_key > 0)";
		grid.refresh(restriction);
    }
}

/**
 * Save standard to view object
 *
 * @param	None
 * @return	None
 *
 */
function saveStandards(row){
	
	if (valueExists(row)) {

		var view = tabsFrame.newView;
		var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
		var curTgrp = view.tableGroups[index];
		var fields = curTgrp.fields;
		var tables = curTgrp.tables;
		
		// get the table name and field name
		var field_name = row['afm_flds.field_name'];
		var table_name = row['afm_flds.table_name'];
		
		if(row.row.isSelected()){
			// add standard field
			var standard = new Object();
			standard.table_name = row['afm_flds.table_name'];
			//standard.field_name = row['afm_flds.field_name'];
			//standard.ml_heading = row['afm_flds.ml_heading'];
			standard.field_name = row['afm_flds.field_name'];				
			var currentLanguageFieldName= 'afm_flds_lang.ml_heading' + '_' + View.user.dbExtension;

			if(row.hasOwnProperty(currentLanguageFieldName)){
				standard.ml_heading = row[currentLanguageFieldName];
			}else{
				standard.ml_heading = (currentLanguageFieldName == 'afm_flds_lang.ml_heading_') ? row['afm_flds.ml_heading'] : '';
			}

			standard.data_type = row['afm_flds.data_type'];
			standard.afm_type = row['afm_flds.afm_type'];
			standard.primary_key = row['afm_flds.primary_key'];
			standard.ml_heading_english = row['afm_flds.ml_heading'];
			standard.ml_heading_english_original = row['afm_flds.ml_heading'];
			standard.is_virtual = false;
			fields.push(standard);				
			
			// check if table already exists in tables array
			var bTableExists = false;
			for (var x = 0; x < tables.length; x++) {
				if (tables[x].table_name == table_name) {
					bTableExists = true;
				}
			}
			
			// if not, add table
			if (bTableExists == false) {
				var tbl = new Object();
				tbl.table_name = standard.table_name;
				//							tbl.role = "Ab.ViewDef.Table.STANDARD_TABLE";
				tbl.role = "standard";
				tbl.fileExt = ".AXVW";
				tables.push(tbl);
			}
		}else{
			// remove de-selected fields			
			var temp = new Array();
			if (fields) {
				var count_standard_table = 0;
				for (var k = 0; k < fields.length; k++) {
					var table_name_f = fields[k].table_name;
					var field_name_f = fields[k].field_name;
					// track if table needs to be removed from tables array					
					if (table_name_f == table_name) {
						count_standard_table = count_standard_table + 1;
					}
					
					if ((table_name_f == table_name) && (field_name_f == field_name)) {
						// remove
						count_standard_table = count_standard_table - 1;
						removeSpecifiedSortField(table_name, field_name);
					}
					else {
						temp.push(fields[k]);
					}
				}
				fields = temp;
			}
			
			// if no other fields have the same standard table, remove table from table array
			if (count_standard_table == 0) {
				for (var x = 0; x < tables.length; x++) {
					if (tables[x].table_name == table_name) {
						// remove table
						tables.splice(x, 1);
					}
				}
			}
		}
		
		
		curTgrp.fields = fields;
		curTgrp.tables = tables;
		tabsFrame.newView = view;
	}	
}

/**
 * Clear restriction and navigate to "View Summary"
 *
 * @param	None
 * @return	None
 *
 */
function saveStandardsAndContinue(){
    tabsFrame.restriction = null;	
    myTabsFrame.selectTab('page4a')
}

function removeSpecifiedSortField(table_name, field_name){
	var view = tabsFrame.newView;
	var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
	var curTgrp = view.tableGroups[index];
	var sortFields = curTgrp.sortFields;
	var tmpSortFields = new Array();
		
	if (sortFields){
		for (var i=0; i<sortFields.length; i++){
			if ((sortFields[i].table_name == table_name) && (sortFields[i].field_name == field_name)){
				
			} else {
				tmpSortFields.push(sortFields[i]);
			}
		}
	}
		
	curTgrp.sortFields = tmpSortFields;	
	view.tableGroups[index] = curTgrp;
	tabsFrame.newView = view;		
}

/**
 * Populate the Field dropdown list.  Warn if there are no fields.
 *
 * @param	None
 * @return	None
 *
 */
function loadRestrictionForm(){
    var table_name = tabsFrame.restriction.clauses[0].value;
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    
    // Find the array of fields
    if (view.tableGroups[index].tables[0].table_name == table_name) {
        var fields = view.tableGroups[index].fields;
    }
    
    // Populate the Field dropdown list
    if (fields) {
        var fieldNames = new Array();
        var texts = new Array();
        var fieldTypes = new Array();
        for (k = 0; k < fields.length; k++) {
            var value = fields[k].table_name + "." + fields[k].field_name;
            var text = fields[k].ml_heading + "   (" + fields[k].table_name + "." + fields[k].field_name + ")";
            fieldNames.push(value);
            texts.push(text);
            fieldTypes.push(fields[k].data_type);
        }
        // reset options
        resetTable('restrictionSummary');
        $('fieldName').options.length = 1;
        addOptionsToDropDown("fieldName", fieldNames, texts, fieldTypes);
        
    }
    else {
        alert(getMessage("noField"));
        tabsFrame.selectTab('page4');
    }
}

/**
 * Create the dropdown with provided id and add to provided parent element
 *
 * @param	id			String of id name
 * @param	parentID	String of parent id name
 * @return	None
 *
 */
function createDropdown(id, parentID){
    var selectBox = document.createElement("SELECT");
    selectBox.id = id;
    selectBox.name = id; //			selectBox.class = "inputField_box";
    parentID.appendChild(selectBox);
}

/**
 * Add options to provided dropdown
 *
 * @param	id		String of id name
 * @param	values	Array of option values
 * @param	texts	Array of option text
 * @return	None
 *
 */
function addOptionsToDropDown(id, values, texts, additionalAttrs){
    for (i = 0; i < values.length; i++) {
        var oOption = document.createElement("OPTION");
        oOption.appendChild(document.createTextNode(values[i]));
        oOption.value = values[i];
        oOption.text = texts[i];
        oOption.additionalAttr = additionalAttrs[i];
        $(id).appendChild(oOption);
    }
}

/**
 * Depending upon the field name selected, display appropriate field values
 *
 * @param	None
 * @return	None
 *
 */
function selectFieldValue(){
    var temp = $('fieldName').value;
    temp = temp.split(".");
    var table_name = temp[0];
    var field_name = temp[1];
    var tf = "['" + table_name + "." + field_name + "']";
    var tfJsonObject = eval(tf);
    var selectv = $('fieldName');
    var data_type = selectv[selectv.selectedIndex].additionalAttr;
      
    if ((field_name != '') && (field_name != undefined)) {
    	if(data_type == 'Date'){
    		Calendar.getController('fieldValue','/archibus/schema/ab-system/graphics');
    	} else {
        Ab.view.View.selectValue('restSelectPanel', field_name, ['fieldValue'], table_name, tfJsonObject, tfJsonObject, "" + table_name + "." + field_name + " IS NOT NULL ", 'afterSelectFieldValue', true, false, '', 1000, 500);
			}
    }
    else {
        alert(getMessage("noField"));
    }

}

/**
 * Need in 17.2.  Event handler field value's select value.  Show the select value from
 * dialog in input box
 *
 * @param	fieldName			String of field name
 * @param	selectedValue		String of select value
 * @param	previousValue		String of previous value
 * @param	selectedValueRaw	String of raw value
 * @return 	true 				Boolean
 *
 */
function afterSelectFieldValue(fieldName, selectedValue, previousValue, selectedValueRaw){
		if (valueExistsNotEmpty(selectedValueRaw)) {
       $('fieldValue').value = selectedValueRaw;
   	} else {
       $('fieldValue').value = selectedValue;
    }
    return true;
}

// override existing calendar function
Calendar.setupDateInputFieldValue = function (day, month, year){
	if(this.anchorObject!=null){
		//FormattingDate in date-time.js
		var newDate=FormattingDate(day, month, year, strDateShortPattern);
		if(typeof afm_form_values_changed!="undefined" && this.anchorObject.value!=newDate)
			if(afm_form_values_changed!=null)
				afm_form_values_changed=true;

		this.anchorObject.value = getDateWithISOFormat(newDate);

		//force to fire onchange event???
		if(this.anchorObject.onchange)
			this.anchorObject.onchange();

		//required by firefox
		if(typeof this.anchorObject.setAttribute == 'function')
				this.anchorObject.setAttribute("autocomplete","off");
		this.anchorObject.focus();
		this.anchorObject.blur();
		this.anchorObject.focus();
	}
};

/**
 * If operator is "IS NULL" or "IS NOT NULL", hide and clear the field value input and its corresponding
 * select value button.  Otherwise, explicitly show.
 *
 * @param	None
 * @return	None
 *
 */
function checkOperatorValue(){
    var operator = $('operator').value;
    var fieldValue = $('fieldValue');
    var selectVButton = $('selectVButton');
    
    if ((operator == "IS NULL") || (operator == "IS NOT NULL")) {
        fieldValue.style.display = "none";
        fieldValue.value = "";
        selectVButton.style.display = "none";
    }
    else {
        fieldValue.style.display = "";
        selectVButton.style.display = "";
    }
}

/**
 * Adds the selected restriction to summary table
 *
 * @param	None
 * @return	None
 *
 */
function addRestriction(){
    var fieldValue = $('fieldValue').value;
    fieldValue = fieldValue.replace("&", "&amp;");
        
    var operator = $('operator');
    var fieldName = $('fieldName').value;
    var conjunction = $('conjunction');
       
    if (fieldName == "") {
        alert(getMessage("noFieldName"));
    }
    else 
        if ((fieldValue == "") && (operator.value != "IS NULL") && (operator.value != "IS NOT NULL")) {
            alert(getMessage("noFieldValue"));
        }
        else {
            var summTableName = "restrictionSummary";
            var summTable = $(summTableName);
            var summtBody = summTable.tBodies[0];
            var new_tr = document.createElement('tr');
            
            for (var j = 0; j < 5; j++) {
                var new_td = document.createElement('td');
                new_tr.appendChild(new_td);
            }
            
            summtBody.appendChild(new_tr);
            
            var rowIndex = summtBody.rows.length - 1;
            new_tr.id = 'row' + rowIndex;
            
            summtBody.rows[rowIndex].cells[0].innerHTML = conjunction.options[conjunction.selectedIndex].innerHTML;
            var conjFld = createHiddenField('conjunctionHid', conjunction.value);
            summtBody.rows[rowIndex].cells[0].appendChild(conjFld);
            summtBody.rows[rowIndex].cells[1].innerHTML = fieldName;

            summtBody.rows[rowIndex].cells[2].innerHTML = operator.value;
			// operator.options[operator.selectedIndex].innerHTML;
			if (operator.value == "<") {
				summtBody.rows[rowIndex].cells[2].innerHTML  = "&lt;";
				// operator.value = '&lt;';
			}

						           
            var operatorFld = createHiddenField('operatorHid', summtBody.rows[rowIndex].cells[2].innerHTML);
            summtBody.rows[rowIndex].cells[2].appendChild(operatorFld);
            summtBody.rows[rowIndex].cells[3].innerHTML = fieldValue;
            
            summtBody.rows[rowIndex].cells[4].setAttribute("nowrap", "nowrap");            
            createButton("Remove", "removeRow", getMessage("remove"), "restrictionSummary", summtBody.rows[rowIndex].cells[4]);
            createButton("Up", "moveUp", getMessage("up"), "restrictionSummary", summtBody.rows[rowIndex].cells[4]);
            createButton("Down", "moveDown", getMessage("dn"), "restrictionSummary", summtBody.rows[rowIndex].cells[4]);
            saveRestrictions();
            $('fieldValue').value = '';
        }
}

/**
 * Create hidden input field with provided name and value and return as object
 *
 * @param	name		String for hidden input's name
 * @param	value		String for hidden input's value
 * @return	hiddenFld	Object for hidden input
 *
 */
function createHiddenField(name, value){
    var hiddenFld = document.createElement('input');
    hiddenFld.setAttribute('name', name);
    hiddenFld.setAttribute('type', 'hidden');
    hiddenFld.setAttribute('value', value);
    
    return hiddenFld;
}

/**
 * Clear restriction from summary table and save changes to view object
 *
 * @param	None
 * @return	None
 *
 */
function clearRestrictions(){
    var summTable = $("restrictionSummary");
    var summtBody = summTable.tBodies[0];
    
    for (var x = summtBody.rows.length - 1; x > 0; x--) {
        summtBody.deleteRow(x);
    }
    saveRestrictions();
}

/**
 * When the field name drop down box changes, clear the field value input box
 *
 * @param	None
 * @return	None
 *
 */
function clearValue(){
    $('fieldValue').value = '';
}

/**
 * Save selected restriction to view object
 *
 * @param	None
 * @return	None
 *
 */
function saveRestrictions(){
    var sTableName = "restrictionSummary";
    var sTableObj = $(sTableName);
    var tBody = sTableObj.tBodies[0];
    var numberOfRows = tBody.rows.length;
    var restrictions = new Array();
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    
    if (numberOfRows > 0) {
        for (var i = 1; i < numberOfRows; i++) {
            var row = tBody.rows[i];
            
            var restObject = new Object();
            
            var relopHid = row.cells[0].getElementsByTagName('input');
            restObject.relop = relopHid[0].value;
            //	restObject.relop = row.cells[0].innerHTML;   				
            var temp = row.cells[1].innerHTML;
            temp = temp.split(".");
            restObject.table_name = temp[0];
            restObject.field_name = temp[1];
            var operatorHid = row.cells[2].getElementsByTagName('input');
            restObject.op = operatorHid[0].value;
            restObject.value = row.cells[3].innerHTML;
            restrictions.push(restObject);
        }
    }
    
    // Add and store the restriction information into previously created view array of tablegroup objects		
    var view = tabsFrame.newView;
    view.tableGroups[index].parsedRestrictionClauses = restrictions;		
    tabsFrame.newView = view;
}

/**
 * Save selected restrictions and navigate back to "View Summary" tab
 *
 * @param	None
 * @return	None
 *
 */
function saveRestrictionsCont(){
    saveRestrictions();
    myTabsFrame.selectTab('page4a');
}

/**
 * Adds previously selected restriction to restriction summary table
 *
 * @param	conjunction		String containing conjuction (AND, OR, etc)
 * @param	fieldName		String containing name of field
 * @param	operator		String containing operator	 (=, !=, NULL, etc)
 * @param	fieldValue		String containing value fo field
 * @return	None
 *
 */
function createRestrictionSummary(conjunction, fieldName, operator, fieldValue){
    var summTableName = "restrictionSummary";
    var summTable = $(summTableName);
    var summtBody = summTable.tBodies[0];
    var new_tr = document.createElement('tr');
    
    // create empty cells for row
    for (var j = 0; j < 5; j++) {
        var new_td = document.createElement('td');
        new_tr.appendChild(new_td);
    }
    
    // add row to end of table
    var rowIndex = summtBody.rows.length;
    summtBody.appendChild(new_tr);
    new_tr.id = 'row' + rowIndex;
    
    // fill in conjunction (display value for localization)
    summtBody.rows[rowIndex].cells[0].innerHTML = conjunction;
    
    // create hidden field to store stored value and append to cell
    var conjFld = createHiddenField('conjunctionHid', conjunction);
    summtBody.rows[rowIndex].cells[0].appendChild(conjFld);
    
    // fill in field name
    summtBody.rows[rowIndex].cells[1].innerHTML = fieldName;
    
    // fill in operator (display value for localization)
    summtBody.rows[rowIndex].cells[2].innerHTML = operator;
    if(operator == '<'){
		summtBody.rows[rowIndex].cells[2].innerHTML = '&lt;';
	}
	
    // create hidden field to store stored value and append to cell
    var operatorFld = createHiddenField('operatorHid', operator);
    summtBody.rows[rowIndex].cells[2].appendChild(operatorFld);
    
    // fill in field value
    summtBody.rows[rowIndex].cells[3].innerHTML = fieldValue;
    
    // add "Remove", "Up", and "Down" buttons
    summtBody.rows[rowIndex].cells[4].setAttribute("nowrap", "nowrap");
    createButton("Remove", "removeRow", getMessage("remove"), "restrictionSummary", summtBody.rows[rowIndex].cells[4]);
    createButton("Up", "moveUp", getMessage("up"), "restrictionSummary", summtBody.rows[rowIndex].cells[4]);
    createButton("Down", "moveDown", getMessage("dn"), "restrictionSummary", summtBody.rows[rowIndex].cells[4]);
}

/**
 * Reset Options to default values
 *
 * @param	None
 * @return	None
 *
 */
function clearOptions(){
    view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var emptyArray = new Array();
    var curTgrp = view.tableGroups[index];
    
    resetChartOptions();
    if(curTgrp.hasOwnProperty('numberOfColumns')){
    	delete curTgrp.numberOfColumns;
    }
	   
    curTgrp.title = getMessage('panelTitle');
    view.chartProperties = emptyArray;
    view.paginatedProperties = emptyArray;
    curTgrp.paginatedPanelProperties = new Object();
    view.tableGroups[index].measures = emptyArray;
    
    
    curTgrp = resetColumnReportOptions(curTgrp);
    createColumnReportSummaryTable(view, index);
    
    // clear action properties
    //view.actionProperties[index] = new Object();
    view.panelProperties[index] = new Object();
    	
	$('logoImageFile').value = 'archibus-logo.gif';
	tabsFrame.newView = view;
    myTabsFrame.selectTab('page4f');
}

/**
 * Explicitly reset chart options in chart panel form for redisplaying purposes
 *
 * @param	None
 * @return	None
 *
 */
function resetChartOptions(){
    // Explicitly reset selectbox fields
    var selectBoxFields = document.getElementsByTagName('select');
    for (var i = 0; i < selectBoxFields.length; i++) {
        selectBoxFields[i].selectedIndex = 0;
    }
		
	$('width').value = 100;
    $('height').value = 100;
    $('backgroundColor').value = '0xFFFFFF';
    $('backgroundColor').style.backgroundColor = '#FFFFFF';
    $('fillColor').value = '';
    $('fillColor').style.backgroundColor = '#FFFFFF';
    $('percentGradientChange').value = 1.0;
    $('percentTransparency').value = 1.0;
    $('labelRotation').value = 0;
    $('tickSizeInterval').value = 1000;
	$('tickSizeInterval').style.display = 'none';
	setChartProperty(1000, 'tickSizeInterval', 1000);
    $('drilldown').checked = false;
}

/**
 * Save Options to view object
 *
 * @param 	None
 * @return	None
 *
 */
function saveOps(checkBox){

    var view = tabsFrame.newView;
    var panelTitle = replaceAmpersand($('panelTitle').value);
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var table_name = tabsFrame.restriction.clauses[0].value;
    var totalBoxesChecked = 0;
    var measures = new Array();
    var curTgrp = view.tableGroups[index];
    curTgrp.title = panelTitle;
    var fields = curTgrp.fields;

    if (fields != undefined) {
        for (i = 0; i < fields.length; i++) {
            var fieldName = fields[i].field_name;
            var cb = document.getElementsByName(fieldName);
            var temp = fields[i];
            var stats = new Array();
            var ml_headings = new Array();
            var before = totalBoxesChecked;
            var ml_headings_english = new Array();
            
            // get all checkboxes pertaining to a specific field (rm_id)
            for (j = 0; j < cb.length; j++) {
                if (cb[j].checked == true) {
                    totalBoxesChecked = totalBoxesChecked + 1;
                    stats.push(cb[j].value);
                    ml_headings.push(fields[i].ml_heading.replace(/[\n|\r]/, ""));
                    ml_headings_english.push(fields[i].ml_heading_english.replace(/[\n|\r]/, ""));
                }
            }
            // If more checkboxes were checked for a field, add to measures array
            if (before < totalBoxesChecked) {
                temp.stats = stats;
                temp.ml_headings = ml_headings;
                temp.ml_headings_english = ml_headings_english;
                measures.push(temp);
            }
        }
    }
    
    
    curTgrp.measures = measures;
    tabsFrame.newView = view;
    
}

/**
 * Save panel title into view object
 *
 * @param	title	String holding panel title
 * @return	None
 *
 */
function savePanelTitle(title){
    var panelTitle = replaceAmpersand($('panelTitle').value);
    var view = tabsFrame.newView;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    var curTgrp = view.tableGroups[index];
    curTgrp.title = panelTitle;
    tabsFrame.newView = view;
}


/**
 * Replace XML ampersand with display ampersand (ie replace &amp; with &)
 *
 * @param	str_original	String 	Input
 * @return	str_new			String 	Output with &amp; replaced as &
 *
 */
function replaceXMLAmp(str_original){
    var objRegExp = /\&amp;/gi;
    var str_new = str_original.replace(objRegExp, '&');
    return str_new;
}

/**
 * Navigate to "Preview" tab.
 *
 * @param	None
 * @return	None
 *
 */
function saveAndPreview(){    
		var view = tabsFrame.newView;
		//if (pattern.match(/highlight-thematic/gi) && prefix != 'drill' && view.tableGroups.tables[0].table_name != 'zone'){
		if (pattern.match(/highlight-thematic/gi)){
			var drill2 = $('drill2Std').innerHTML;
			var data = $('dataStd').innerHTML;
			var requiredMsg = getMessage('required');
			if((drill2 == requiredMsg || data == requiredMsg) && view.tableGroups[0].tables[0].table_name != 'zone'){
				alert(getMessage('noStandards'));
		    	return;
			} 
		}
				
    if ((pattern.match(/paginated-parent/gi) && validateParameterRestrictions(view) == false) || !removeVirtualFields(view)){
    } else if(hasMeasuresInSummarizeBySortOrder() == false){
    	alert(getMessage('noStatistics')); 
    } else {
    	tabsFrame.selectTab('page5');
  	}
}

function hasMeasuresInSummarizeBySortOrder(){
	var view = tabsFrame.newView;
	var pattern = tabsFrame.patternRestriction;
	for(var i=0; i<view.tableGroups.length; i++){
		var tgrp = view.tableGroups[i];
		if(pattern.match(/paginated/gi) && hasSummarizeBySortOrder(tgrp)){
			if(!(tgrp.hasOwnProperty('measures') && (tgrp.measures.length > 0))){
				return false;
			}
		}				
	}

	return true;
}


/**
 * Get value of enableDrilldown option and store in view object of tabs frame.
 *
 * @param 	id
 * @param	value
 * @return	None
 *
 */
function enableDrilldown(id, value){
    var cb = $(id);
    var view = tabsFrame.newView;
    
    if (cb.checked) {
        view.enableChartDrilldown = true;
    }
    else {
        view.enableChartDrilldown = false;
    }
    
    tabsFrame.view = view;
}

/**
 * Show or hide statistic columns in measures summary panel. 
 *
 * @param	scStatus	boolean		''|'none' to show|hide for sum column
 * @param 	aoStatus	boolean 	''|'none' to show|hide for all other measures columns
 * return	None
 */
function showStatisticsColumns(scStatus, aoStatus){
	// var tds = $('measuresSummary').tBodies[0].getElementsByTagName('td');
	var tds = document.getElementsByTagName('td');
	// alert(document.getElementsByTagName('aoHide'))
	for (var i=0; i<tds.length; i++){
		var td = tds[i];
		if (td.name == "aoHide"){
			td.style.display = aoStatus;
		} else {
			td.style.display = scStatus;			
		}	
	}	     
}

function syncLegend(status){
	tabsFrame.bSyncLegend = status;
	bSyncLegend = status;
}


function copyDataBand(view){
	var hltTgrp = view.tableGroups[0];
	var lgndTgrp = view.tableGroups[2];

	if ((hltTgrp) && (lgndTgrp)) {
		if (hltTgrp.hasOwnProperty('tables')) {
			lgndTgrp.tables = hltTgrp.tables;
		}
		
		if (hltTgrp.hasOwnProperty('fields')) {
			lgndTgrp.fields = hltTgrp.fields;
		}
		
		if (hltTgrp.hasOwnProperty('sortFields')) {
			lgndTgrp.sortFields = hltTgrp.sortFields;
		}
		
		if (hltTgrp.hasOwnProperty('parsedRestrictionClauses')) {
			lgndTgrp.parsedRestrictionClauses = hltTgrp.parsedRestrictionClauses;
		}
		
		view.tableGroups[0] = hltTgrp;
		view.tableGroups[2] = lgndTgrp;
		tabsFrame.newView = view;
	}
}

/**
 * Set primary keys as default sort.  
 *
 * @param	None
 * return	None
 */
function setPKeysAsSortDefaults(){
	  var view = tabsFrame.newView;
    var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
    var viewType = tabsFrame.typeRestriction;
    var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
    
    
    var numberofSortFields = 0;
    if (view.tableGroups[index].hasOwnProperty('sortFields')){
    	numberOfSortFields = view.tableGroups[index].sortFields.length;
  	}

    if(numberofSortFields == 0){         
    var summaryTable = $('sortOrderSummary');
    tBody = summaryTable.tBodies[0];
    var numOfRows = tBody.rows.length;
    	      
    // loop through the summary table
    for (var j = 1; j < numOfRows; j++) {
        var pKeyCell = summaryTable.rows[j].cells[2];
        var setButtonCell = summaryTable.rows[j].cells[8];
        
        // if there is a match, display the order and hide the "Sort" button
        //if (pKeyCell.innerHTML != '0') {
        if ((pKeyCell.innerHTML != '0') && setButtonCell.innerHTML.match(/button/gi)) {
            var rowID = setButtonCell.parentNode.id;
            setSortAndSave('', rowID);
        }
    }
  	}
}

/**
 * Add primary keys as defaults.  Checks checkboxes and add field
 *
 * @param		
 * return	
 */
function checkPKeysAsDefaults(){
	var grid = Ab.view.View.getControl('', 'fields_grid');
    var rows = grid.rows;
    for (var i = rows.length-1; i > -1; i--) {
        var row = rows[i];
        if (row['afm_flds.primary_key'] != 0) {
        	//rows[i].row.select(true);
            grid.updateSelectionModel(row, true, true);
			addSelectedFields(row);
        }
    }    	
}

function setAscending(obj, k){
	var field = obj.name;
	field = field.replace(/^sort_/, '');
	var temp = field.split('.')
	var table_name = temp[0];
	var field_name = temp[1];
	var bAsc = true;
	if (obj.checked == true){
		bAsc = false;
	}
	// var bAsc = obj.value;

    var summaryTable = $('sortOrderSummary');

	var row = summaryTable.rows[k + 1];
	var setButtonCell = row.cells[8];
	if (setButtonCell.innerHTML != ''){
		var rowID = setButtonCell.parentNode.id;
		setSortAndSave('', rowID);
	} else {
		saveSort();
	}		
}

function showSelectVWarning(bChecked){
	if (bChecked == true){
		alert(getMessage('showSelectValueActionMessage'));
	}
}

/**
 * Set primary keys as default restriction param.  
 *
 * @param	None
 * return	None
 */
function setPKeysAsRestrictionParams(){     
    var summaryTable = $('selectedFields');
    tBody = summaryTable.tBodies[0];
    var numOfRows = tBody.rows.length;
      
    // loop through the summary table
    for (var j = 1; j < numOfRows; j++) {
        var pKeyCell = summaryTable.rows[j].cells[4];
        var fieldName = summaryTable.rows[j].cells[0].innerHTML; 
        var tableName = summaryTable.rows[j].cells[5].innerHTML; 
        if (pKeyCell.innerHTML > 0){       
        	$('param_' + tableName + '.' + fieldName).checked = true;
      	}
    }
}

function setTrueColor(inputName){
    oColorPicker = $(inputName);
    showColorPicker();
}

function clickColor(colorStr){
    oColorPicker.style.backgroundColor = colorStr;
    oColorPicker.colorValue = colorStr;
    oColorPopup.style.display = "none";
    var chartColorStr = colorStr.replace('#', '0x');
    oColorPicker.value = chartColorStr;
    setChartProperty('0xFFFFFF', oColorPicker.id, chartColorStr);
}

function setNumberOfColumns(id, value){
		var view = tabsFrame.newView;
		var numberOfTgrps = view.tableGroups.length;
		var index = numberOfTgrps - tabsFrame.selectedTableGroup - 1;
		var tgrp = view.tableGroups[index];
		tgrp['numberOfColumns'] = value;
}

function displayNumberOfColumns(){
		var view = tabsFrame.newView;
		var numberOfTgrps = view.tableGroups.length;
		var index = numberOfTgrps - tabsFrame.selectedTableGroup - 1;
		var tgrp = view.tableGroups[index];
		if(tgrp.hasOwnProperty('numberOfColumns')){
			var numberOfColumns = tgrp['numberOfColumns'];
			var obj = $('columns');
			// obj.value = numberOfColumns;
			var options = obj.options;
			for (var x = 0; x < options.length; x++) {
				if (numberOfColumns == options[x].value) {
					obj.selectedIndex = x;
				}
			}
		} else if($('columns')){
				$('columns').selectedIndex = 1;
				if(tgrp.hasOwnProperty('numberOfColumns')){
					delete curTgrp.numberOfColumns;
				}
		}
}

/**
 * Edit Virtual Field
 *
 * @param	e
 * @param	tableId	String Id of table
 * @return	None
 *
 */
function editVirtualField(e, tableId){
	var trObject = this.parentNode.parentNode;
	var rowIndex = trObject.rowIndex;
	var table = $('selectedFields');
	var tBody = table.tBodies[0];
	var vf = trObject.childNodes[0].vf;

	
	var trObject = this.parentNode.parentNode;
	var dialog = View.openDialog('ab-viewdef-add-virtual.axvw', null, false, {
		closeButton: true,
		maximize: false,		
		
		// this callback function will be called after the add virtual field dialog view is loaded
		afterInitialDataFetch: function(dialogView) {
			// access the dialog controller property
			var dialogController = dialogView.controllers.get('addVirtual');
			dialogController.hideButton('add');	
			dialogController.showButton('saveChanges');			
			dialogController.rowIndex = trObject.rowIndex;
			dialogController.fillFormWithVFData(vf);  			
		}		
	}); 
	
}


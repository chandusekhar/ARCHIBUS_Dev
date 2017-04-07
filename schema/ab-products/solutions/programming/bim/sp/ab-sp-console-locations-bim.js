/**
 * Controller for the Locations panel (filter console and grid).
 *
 * Events:
 * app:space:express:console:filter
 * app:space:express:console:selectLocation
 */
var spaceExpressConsoleLocations = View.createController('spaceExpressConsoleLocations', {
	
	/**
	 * identify you selected building or floor after click add new button.
	 */
	addNewAssetType: null,
	
	/**
	 * get row restriction after click row link.
	 */
	rowResForOpenDialog: null,

    /**
     * Location and occupancy restrictions applied from the filter panel.
     */
    filter: null,
    
    /**
     * checked rows assign value before swith Mode.
     */
    checkedRows: null,
	
    /**
     * the application's current mode
     */
    mode: '',

    /**
     * For 23.1: sign of whether 'Team Space' function is enabled
     */
	isTeamSpaceEnabled: false,
	
    /**
     * Constructor.
     */
    afterCreate: function() {
    	jQuery("#locationsGrid_title").hide();
        this.on('app:space:express:console:locationFilter', this.refresh);
        this.on('app:space:express:console:changeMode', this.afterChangeMode);
        this.on('app:space:express:console:locateEmployeesOrRooms', this.locateEmployeesOrRooms);
        this.on('app:space:express:console:locateTeamRooms', this.locateTeamRooms);
        this.on('app:space:express:console:locationFilter_onClearLocations', this.locationFilter_onClearLocations);
        this.on('app:space:express:console:reselectLocationsForDrawing', this.reselectLocationsForDrawing);
        this.on('app:space:express:console:setEmClauseToFilter', this.setEmClauseToFilter);
        this.on('app:space:express:console:unselectfloors', this.unselectFloors);
        this.on('app:space:express:console:filterFloorsForTeamAssign', this.onFilterFloorsForTeamAssign);
        this.on('app:space:express:console:clearFilterFloorForTeamAssign', this.onClearFilterFloorForTeamAssign);
        this.on('app:space:express:console:asOfDateUpdate', this.onUpdateAsOfDate);
    },

    /**
     * Sets the initial UI state.
     */
    afterViewLoad: function() {
    	jQuery("#locationsGrid_title").hide();
        $('occupancyVacantOnly').checked = false;
        var controller = this;
        this.locationsGrid.addEventListener('onMultipleSelectionChange', function(row) {
            controller.trigger('app:bim:example:addFloorPlan', row, controller.locationsGrid, controller.locationFilter.getFieldMultipleValues('rm.dp_id'));
        });

        this.displayRecentSearches();
        // hide the drawing name column if there are no floors with > 1 drawing
        this.showDefaultColumn();
        //When you select "Vacant only" in the filter, the option for "Vacant" in the expanded filter section should also get checked. 
        //These two checkboxes should always change together.
    	this.cascadeFiledVacant();
    	//kb 3042960 click the arrow to hidden the filter section take effect on all the filters
    	jQuery("#locationFilter_collapse").click(function() {
    		if(!spaceExpressConsoleLocations.locationFilterOptions.collapsed){
    			spaceExpressConsoleLocations.locationFilterOptions.setCollapsed(spaceExpressConsoleLocations.locationFilter.collapsed);
    			jQuery("#moreOptions").text(getMessage('locationFilterMore'));
    		}
    	});
    },

    /**
     * after Initial Data Fetch, call filter method manually.
     */
    afterInitialDataFetch: function() {
		// Added for 23.1: initial as of date
		this.locationFilter.setFieldValue('rm.date_last_surveyed', null, new Date() );

		var blId = window.location.parameters['blId'];
    	var demoMode = View.activityParameters['AbSystemAdministration-DemoMode'];
		if ( blId && demoMode==="1" ) {
			this.locationFilter.setFieldValue("rm.bl_id",blId);
		}
    	
    	//KB3044090 load the floor and tab according to parameter SpaceConsoleLoadOnOpen
    	var loadInforWhenStart = View.activityParameters['AbSpaceRoomInventoryBAR-SpaceConsoleLoadDataOnOpen'];
    	if (loadInforWhenStart == "1" || !loadInforWhenStart) {
    		this.locationFilter_onFilterLocations();
    	}
        //set the select all function to false in panel 'locationFilter';
        this.locationsGrid.enableSelectAll(false);
        jQuery("#totalArea").siblings("span").html(View.user.areaUnits.title);
    },
    
    /**
     * Hide the drawing name column if there are no floors having more than one drawing names
     */
    showDefaultColumn: function() {
		var maxDrawingsPerFloor = 1;
		var records = this.drawingsPerFloorDS.getRecords();
		for (var i = 0; i < records.length; i++) {
			var drawingsPerFloor = records[i].getValue('rm.count_dwg');
			if (drawingsPerFloor > maxDrawingsPerFloor) {
				maxDrawingsPerFloor = drawingsPerFloor;
			}
		}
		if (maxDrawingsPerFloor > 1) {
			this.locationsGrid.showColumn('rm.dwgname', true);
		}
    },
    
    /**
     * When you select "Vacant only" in the filter, the option for "Vacant" in the expanded filter section should also get checked. 
     * These two checkboxes should always change together.
     */
    cascadeFiledVacant: function() {
    	document.getElementById('occupancyVacantOnly').onclick = function() {
    		$('occupancyVacant').checked = $('occupancyVacantOnly').checked;
    		$('occupancyAvailable').checked = false;
    		$('occupancyAtCapacity').checked = false;
    		$('occupancyExceedsCapacity').checked = false;
    	}
    	document.getElementById('occupancyVacant').onclick = function() {
    		$('occupancyVacantOnly').checked = $('occupancyVacant').checked;
    	}
    	//Vacant Only' should not be automatically checked if user selection more than one Occupancy options
    	document.getElementById('div_checkbox_control').onclick = function() {
    		if (jQuery("input:checked").length>1) {
    			$('occupancyVacantOnly').checked = false;
    		}
    	}
    },

    /**
     * Show or hide filter controls depending on the mode.
     */
    afterChangeMode: function(mode) {
    	this.mode = mode;
		this.initialFilterFieldsForModeChange();

        //reset filter solve the export report without print restriction issue.
    	var filter = this.getFilterQueryCondition();
    	this.filter = filter;
		
		// 23.1 : don't think need below extra code to do fiter one more time. 
        // if (Ext.get('excludedHotalableRm').dom.checked) {
        	// this.locationFilter_onFilterLocations();
        // }
    },

	initialFilterFieldsForModeChange: function(){
		//The mini-console searches in the Employee grid are not working.  They throw errors.
		this.locationFilter.showField('em.em_id', this.mode === 'employeeMode');
		//work around for kb#3051828: also disable select value button of field em_id
		var emSelectValue = $('locationFilter.em.em_id_selectValue');
		this.locationFilter.showElement(emSelectValue, this.mode === 'employeeMode');

		this.showFilterFieldsForTeamSpace(this.isTeamSpaceEnabled);

        if ( this.mode === 'employeeMode' ) {
        	jQuery("#excludedHotalableRm").parent("div").show();
        } else {
        	jQuery("#excludedHotalableRm").parent("div").hide();
        }
	},
    
    /**
     * Invoke uncheck and check action for original checked rows.
     */
    reselectLocationsForDrawing: function() {
    	var checkedLocation = this.locationsGrid.getSelectedRows();
		for (var i=0; i<checkedLocation.length; i++) {
			var row = checkedLocation[i];
			this.trigger('app:space:express:console:selectLocation', row);
		}
    },

    /**
     * Show/Hide fields according to Team Space Functionality enable/disable.
     */
    showFilterFieldsForTeamSpace: function(isShow) {
		this.isTeamSpaceEnabled = isShow;
		this.locationFilter.showField('team_properties.team_id', (this.mode === 'employeeMode') && isShow);
		this.locationFilter.showField('rm.date_last_surveyed', (this.mode === 'employeeMode') && isShow);

		this.locationFilter.showField('em.em_id', this.mode === 'employeeMode');
	},

    /**
     * Applies the filter restriction to the locations list.
     */
    refresh: function(filter) {
    	//If you are displaying a floor plan, and then you run a new filter and the same floor plan is among the filtered results,
    	//then the checkbox for that floor should be checked.  The same thing applies when the filter is cleared.  
    	//Also, the floor plan should be re-displayed with whatever the new highlighting is for the new filter.
    	//get checked location records before refresh location grid.
    	var checkedLocation = this.locationsGrid.getSelectedRows();

        this.locationsGrid.clearParameters();        
        var spaceExpressConsole = View.controllers.get('spaceExpressConsole');
        if(spaceExpressConsole.mode === 'employeeMode') {
        	//use a common parameters reduce dataSource code.
        	this.locationsGrid.addParameter('commonParameters', getCommonParameters() + " AND ${parameters['excludedHotalableRm']}");
        } else {
        	//use a common parameters reduce dataSource code.
        	this.locationsGrid.addParameter('commonParameters', getCommonParameters());
        }

		// Added for 23.1 Team Space Functionality: add team restriction when 'Team Space' functionality is enabled
		if ( spaceExpressConsole.showTeams==1 ) {
			var teamClause = getQueryParameter(filter,this.locationFilter,'team_properties.team_id',true);
			filter.parameters['teamClause'] = teamClause;
			addTeamRoomRestrictionParameter(filter, false); 
		}

        this.locationsGrid.addParameters(filter.parameters);
        this.locationsGrid.refresh();

        //after grid refresh, found previous checked records if not exists in grid, rmove it from Drawing plan.
        this.showPreviousCheckedFloorPlan(checkedLocation);
        this.addRecentSearch();
        this.displayRecentSearches();
    },

    /**
     * show related floor panel according checked locations.
     */
    showPreviousCheckedFloorPlan: function(checkedLocation) {
		var rows = this.locationsGrid.rows;
		for (var i=0; i<checkedLocation.length; i++) {
			 var rowChecked = false;
			 for (var j = 0; j < rows.length; j++) {
	            var row = rows[j];
	            if (row["rm.bl_id"]+row["rm.fl_id"] == checkedLocation[i]["rm.bl_id"]+checkedLocation[i]["rm.fl_id"]) {
	            	rowChecked = true;
	    			row.row.select();
	            	break;
	        	}
	        }
			if (!rowChecked) {
				var row = checkedLocation[i];
				row.row.unselect();
	            this.trigger('app:space:express:console:selectLocation', row);
			}
		}
    },
    
    /**
     * Adds another search to the recent searches sidecar.
     */
    addRecentSearch: function() {
        var search = this.getFilterArray();
    	var sidecar = this.locationFilter.getSidecar();
    	var myRecentSearches = sidecar.get('myRecentSearches');
    	// make is to put the most recent searches at the top of the list and eliminate duplicates from this list.
    	var newRecentSearches = [];
    	if (search) {
    		var existsInRecent = false;
    		if (typeof(myRecentSearches)!= 'undefined') {
        		for (var i=0;i<myRecentSearches.length;i++) {
        			if (JSON.stringify(search) == JSON.stringify(myRecentSearches[i])) {
        				existsInRecent = true;
        			}
        		}
    		}
    		if (!existsInRecent) {
    			newRecentSearches.push(search);
        		if (typeof(myRecentSearches)!= 'undefined') {
        			newRecentSearches = newRecentSearches.concat(myRecentSearches);
        		}
        		sidecar.set('myRecentSearches', newRecentSearches);
        		sidecar.save();
    		}
    	}
    },
    
    /**
     * get filter fields and values for recent search.
     */
    getFilterArray: function() {
    	
        var filterObject = {"locationFilter": [], "locationFilterOptions": [], "checkedFilters": [], "inputFilters": []};
        _.each(['rm.dv_id', 'rm.dp_id', 'rm.bl_id', 'rm.fl_id', 'rm.rm_id'], function(fieldName) {
        	var value = spaceExpressConsoleLocations.locationFilter.getFieldValue(fieldName);
        	if (value!= '') {
        		filterObject.locationFilter.push({"field": fieldName, "value": value});
        	}
        });
        _.each(['rm.rm_cat', 'rm.rm_type'], function(fieldName) {
        	var value = spaceExpressConsoleLocations.locationFilterOptions.getFieldValue(fieldName);
        	if (value!= '') {
        		filterObject.locationFilterOptions.push({"field": fieldName, "value": value});
        	}
        });
        _.each(['occupancyVacantOnly','occupancyVacant','organizationUnassigned', 'typeUnassigned','occupancyAvailable','occupancyAtCapacity','occupancyExceedsCapacity','excludedHotalableRm'], function(fieldName) {
        	if ($(fieldName).checked) {
        		var displayedMsg = getMessage(fieldName + "DisplayedMsg");
        		filterObject.checkedFilters.push({"field":fieldName, "value":displayedMsg});
        	}
        });
        _.each(['occupancyWithTotalArea', 'occupancyWithTotalRooms'], function(fieldName) {
        	if ($(fieldName).checked) {
        		var displayedMsg = getMessage(fieldName + "DisplayedMsg");
        		if (fieldName == 'occupancyWithTotalArea') {
        			filterObject.inputFilters.push({"field": fieldName, "displayedMessage": displayedMsg, "operand": Ext.get('totalAreaOp').dom.value,  "operandData": Ext.get('totalArea').dom.value});
        		} else {
        			filterObject.inputFilters.push({"field": fieldName, "displayedMessage": displayedMsg, "operand": Ext.get('totalRoomsOp').dom.value, "operandData": Ext.get('totalRooms').dom.value});
        		}
        	}
        });
        
        var result = filterObject;
        with (filterObject) {
        	if(locationFilter.length == 0 && locationFilterOptions.length == 0 && checkedFilters.length == 0 && inputFilters.length == 0) {
        		result = null;
        	}
        }
        return result;
    },
    
    /**
     * Displays the recent searches list.
     */
    displayRecentSearches: function() {
    	
        var controller = this;
        var recentSearchMenu = this.locationFilter.actions.get('recentSearchMenu');
        recentSearchMenu.clear();

        var sidecar = this.locationFilter.getSidecar();
        var filterObject = sidecar.get('myRecentSearches');
        _.each(filterObject, function(search, index) {
        	var title = '';
        	_.each(search.locationFilter, function(object) {
        		title += ('  '+ object.value);
        	});
        	_.each(search.locationFilterOptions, function(object) {
        		title += ('   '+ object.value);
        	});
        	var checkedMessages = '';
        	_.each(search.checkedFilters, function(object) {
        		checkedMessages += ('  ' + object.value);
        	});
        	_.each(search.inputFilters, function(object){
        		checkedMessages += ('  ' + object.displayedMessage + "[" + object.operand + object.operandData + "]");
        	});
        	
            if (checkedMessages != "") {
        		title += '  '+ checkedMessages.replace(/:true/gi, "").replace(/"/gi, "").replace("{","").replace("}","").replace(",","");
            }
            recentSearchMenu.addAction(index, title.replace(",",""),
                controller.onSelectRecentSearch.createDelegate(controller, [search]));
        });
    },
    
    /**
     * Selects a recent search.
     * @param search Ab.view.Restriction.
     */
    onSelectRecentSearch: function(search) {
        this.clearLocations();
    	//first put all input field value from recent string.
    	_.each(search.locationFilter, function(filterObject) {
    		spaceExpressConsoleLocations.locationFilter.setFieldValue(filterObject.field, filterObject.value);
    	});
    	_.each(search.locationFilterOptions, function(filterObject) {
    		spaceExpressConsoleLocations.locationFilterOptions.setFieldValue(filterObject.field, filterObject.value);
    	});
    	_.each(search.checkedFilters, function(filterObject) {
    		jQuery("#" + filterObject.field).attr("checked", true);
    	});
    	_.each(search.inputFilters, function(filterObject) {
    		jQuery("#"+filterObject.field).attr("checked", true);
    		if(filterObject.field == "occupancyWithTotalArea") {
    			jQuery("#totalAreaOp").val(filterObject.operand);
        		jQuery("#totalArea").val(filterObject.operandData);
    		} else {
    			jQuery("#totalRoomsOp").val(filterObject.operand);
        		jQuery("#totalRooms").val(filterObject.operandData);
    		}
    	});
    	
        //call filter method.
        this.locationFilter_onFilterLocations();
    },

    /**
     * Called to locate a collection of employees on the drawing.
     * check if exists floor which not loaded in drawing plan.
     * if true, trigger locate employee with warning method. or would highlight employee room directly.
     */
    locateEmployeesOrRooms: function(employeesOrRooms, isLocateEmployee) {
    	if (employeesOrRooms[0].bl_id != "" && employeesOrRooms[0].fl_id != "" && employeesOrRooms[0].rm_id != "") {
    		//if not located employee doesn't exists in grid list. alert message and return.
    		if (!this.isFlExistsInLocationGrid(employeesOrRooms[0].bl_id, employeesOrRooms[0].fl_id)) {
    			View.alert(getMessage("emNotExistsInFilter"));
    		} else {
    			//below code block check if the drawing show reday. for different case. call method separately.
    			var existsFlNotLoad = false;
    			for (var i = 0; i < employeesOrRooms.length; i++) {
    				var flag = this.isFlExistsInLocationGrid(employeesOrRooms[i].bl_id, employeesOrRooms[i].fl_id, true);
    				if (!flag) { // as long as one floor not exists in the location checked records. 
    					existsFlNotLoad = true;
    					break;
    				}
    			}
    			if (existsFlNotLoad) {
    				//check locations which exists in selected rows
    				this.checkIfSelectedRowsInLocationGrid(employeesOrRooms);
    				if (isLocateEmployee) {
    					this.trigger('app:space:express:console:loadAndHighLightSelectedEmployees', employeesOrRooms);
    				}else{
    					this.trigger('app:space:express:console:loadAndHighLightSelectedRoom', employeesOrRooms);
    				}
    			} else {
    				this.trigger('app:space:express:console:highlightRooms', employeesOrRooms);
    			}
    		}
    	}
    },
    
    /**
     * Added for 23.1, alled to locate a collection of team's rooms on the drawing : 
	 *		- Load the floor plan(s) that corresponds to the selected team��s rooms and check the corresponding check boxes in the floor grid.
	 *		- If the floors for those locations are not yet on the floor grid (there is a filter, for example, and the teams list is not restricting to location), then display this warning message: "This floor plan cannot be displayed because it does not satisfy the filter. Please change or clear the filter and try again."
	 *		- Essentially, this action acts as an additional room filter for highlights.  Only rooms that pertain to the selected team��s rooms are included.
     */
    locateTeamRooms: function(teamId, floors) {
    	if ( teamId ) {
    		// check if all given floors are in location list.
			for ( var j=0; j<floors.length; j++){
				if ( !this.isFlExistsInLocationGrid(floors[j]['rm.bl_id'], floors[j]['rm.fl_id']) ) {
					View.alert(getMessage("teamFloorNotInLocationList"));
					return;
				}
			}

			var floorRows = this.checkIfSelectedRowsInLocationGrid(floors);
			for ( var j=0; j<floors.length; j++){
				this.trigger('app:space:express:console:selectLocation', floorRows[j]);
				//this.trigger.defer(5000, this, ['app:space:express:console:selectLocation', floorRows[j]]);
			}
			
			this.trigger('app:space:express:console:highlightTeamRooms', teamId, floorRows);
    	}
    },

	/**
     * check if locations grid that include selected rows.
     */
    checkIfSelectedRowsInLocationGrid: function(rows) {
		var floorRows = [];
    	//first uncheck all checked checkbox and trigger 'selectLocation' remove floor plan.
    	this.locationsGrid.unselectAll();
    	var locationRows = this.locationsGrid.rows;
    	//check all the rows checkbox and trigger 'selectLocation' show floor plan.
    	for (var i=0; i<rows.length; i++) {
    		for (var j = 0; j < locationRows.length; j++) {
    			var row = locationRows[j]; 
    			if (row["rm.bl_id"]+row["rm.fl_id"] == rows[i].bl_id+rows[i].fl_id) {
    				row.row.select();
					floorRows.push(row);
    				break;
    			}
    		}
    	}
		return floorRows;
	},
	
	/**
	 * Get the filter condition.
	 */
	getFilterQueryCondition: function() {
		var organizationUnassigned =  $('organizationUnassigned').checked? " rm.dv_id IS NULL AND rm.dp_id IS NULL ": "1=1";
        var typeUnassigned =  $('typeUnassigned').checked? " rm.rm_cat IS NULL AND rm.rm_type IS NULL ": "1=1";
        var filter = {
            restriction: new Ab.view.Restriction(),
            parameters: {
            	totalArea: this.getTotalAreaAndCountQueryParameter(),
                occupancy: createOccupancyRestriction(),
                excludedHotalableRm: this.excludedHotalableRmRestriction(),
                organizationUnassigned: organizationUnassigned,
                rm_std: " 3=3 ",//clear rm_std parameter(refer to method 'filterDrawingByRoomStd' in room_standard.js).
                typeUnassigned: typeUnassigned,
				asOfDate: this.locationFilter.getFieldValue('rm.date_last_surveyed')
            },
			searchValuesString:'',
			//other search string for html element generated like:
			//Occupancy,Total room area, total room count, division-department unassigned, room category and type unassigned.
			otherSearchValuesString: this.getSearchString()
        };

        var controller = this;
        _.each(['rm.dv_id', 'rm.dp_id', 'rm.bl_id', 'rm.fl_id', 'rm.rm_id'], function(fieldName) {
            controller.addFilterValue(filter, controller.locationFilter, fieldName);
        });
        _.each(['rm.rm_cat', 'rm.rm_type'], function(fieldName) {
            controller.addFilterValue(filter, controller.locationFilterOptions, fieldName);
        });
        
        return filter;
	},

	/**
	 * set employee code clause to filter only for employee tab.
	 */
	setEmClauseToFilter: function(filter) {
		var emClause = getQueryParameter(filter,this.locationFilter,'em.em_id',true);
        var emRestrictioin = " exists (select 1 from em where em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id and "+emClause+")";
        var value = this.locationFilter.getFieldValue('em.em_id');
        filter.parameters['emRestriction'] = value? emRestrictioin : '1=1';
        //this parameter only for em Tab.
        filter.parameters['emClause'] = emClause; 
	},
	
    /**
     * Filters the locations.
     */
    locationFilter_onFilterLocations: function() {
    	var filter = this.getFilterQueryCondition();
    	this.filter = filter;
    	clearUIRestricTo(filter);
        this.doFilter(filter);
    },
    
    /**
     * concerate filter logic after user click filter button.
     */
    doFilter: function(filter) {
        this.trigger('app:space:express:console:locationFilter', filter);
        this.trigger('app:space:express:console:refreshDrawing', filter);
        var spaceExpressConsole = View.controllers.get('spaceExpressConsole');
        
        var selectedRows =  this.locationsGrid.getSelectedRows();
        if(selectedRows.length > 0){
        	var dps = this.locationFilter.getFieldMultipleValues('rm.dp_id');
        	 if(dps && dps.length > 0){
        		 var restriction = new Ab.view.Restriction();
            	 restriction.addClause('rm.dp_id', dps, 'IN' );
            	 this.trigger('app:space:express:console:bim:updateHighlight', restriction);
        	 }
        	
        	
        }
       
		//set asOfDate to spaceExpressConsole controller
		spaceExpressConsole.asOfDate = filter.parameters['asOfDate'];
        
		var selectedTab = spaceExpressConsole.attributeTabs.getSelectedTabName();
        var filterArray = spaceExpressConsole.filterArray;
        for (var i=0; i< filterArray.length; i++) {
        	var obj = filterArray[i];
        	if (obj.key == selectedTab) {
            	this.trigger(obj.value, filter);
            	break;
        	}
        }
    },
    
    /**
     * Clears the locations filter.
     */
    locationFilter_onClearLocations: function() {
        this.clearLocations();
        var filter = this.getFilterQueryCondition();
        this.filter = filter;
        this.doFilter(filter);
    },
    /**
     * Clears the locations filter.
     */
    clearLocations: function() {
    	this.locationFilter.clear();
    	this.locationFilterOptions.clear();
    	
    	$('occupancyVacantOnly').checked = false;
    	$('occupancyVacant').checked = false;
    	$('occupancyAvailable').checked = false;
    	$('occupancyAtCapacity').checked = false;
    	$('occupancyExceedsCapacity').checked = false;
    	$('occupancyWithTotalArea').checked = false;
    	$('occupancyWithTotalRooms').checked = false;
    	$('organizationUnassigned').checked = false;
    	$('typeUnassigned').checked = false;
    	$('excludedHotalableRm').checked = false;
    	
    	//kb 3040281  clear filter, should all clear the restricted to message.
        jQuery("#dpRestriction").hide();
        jQuery("#catRestriction").hide();
        jQuery("#roomsRestriction").hide();
        jQuery("#employeeRestrictToLocation").hide();
        jQuery("#employeesResMessageSpan").hide();
        jQuery("#roomStandardRestriction").hide();
        jQuery("#teamRestrictToLocation").hide();
        jQuery("#teamResMessageSpan").hide();
        jQuery('#totalArea').val('');
        jQuery('#totalRooms').val('');

		this.locationFilter.setFieldValue("rm.date_last_surveyed", getCurrentDateInISOFormat());
    },
    
    /**
     * private method.
     * Returns true if specified floor is exists in location grid.
     * @param buildingId
     * @param floorId
     * @param onlySelect
     * @return {Boolean}
     */
    isFlExistsInLocationGrid: function(buildingId, floorId, onlySelect) {
    	var rows = this.locationsGrid.rows;
    	if (arguments.length == 3 && onlySelect == true) {
    		rows = this.locationsGrid.getSelectedRows();
    	} 
		var flag = false;
		for (var i=0; i<rows.length; i++) {
            var row = rows[i];
            if (row["rm.bl_id"]+row["rm.fl_id"] == buildingId+floorId) {
            	flag = true;
            	break;
            }
		}
		return flag;
    },
    
    /**
     * Opens the More Options panel.
     * @param panel
     * @param action
     */
    locationFilter_onMoreOptions: function(panel, action) {
        this.locationFilterOptions.toggleCollapsed();
        //this.hideOrShowExcludeHotelableRoom();
        action.setTitle(this.locationFilterOptions.collapsed ?
            getMessage('locationFilterMore') : getMessage('locationFilterLess'));

        this.locationsGrid.updateHeight();
    },
    
    /**
     * employee mode show, else hide.
     */
    hideOrShowExcludeHotelableRoom: function() {
        var spaceExpressConsole = View.controllers.get('spaceExpressConsole');
        if(spaceExpressConsole.mode === 'employeeMode') {
        	jQuery("#excludedHotalableRm").parent("div").show();
        } else {
        	jQuery("#excludedHotalableRm").parent("div").hide();
        }
    },

    // ----------------------- restrictions -------------------------------------------------------

    /**
     * Adds filter value entered by the user to the filter object.
     * @param filter The filter object.
     * @param form The form panel.
     * @param fieldName The field name.
     */
    addFilterValue: function (filter, form, fieldName) {
        this.addRestrictionClause(filter.restriction, form, fieldName);
        var parameterName = fieldName.split('.')[1];
        filter.parameters[parameterName] = getQueryParameter(filter,form,fieldName,true);
    },
    
    /**
     * Add clause to the restriction object.
     */
    addRestrictionClause: function(restriction, panel, fieldName) {
        if (panel.hasFieldMultipleValues(fieldName)) {
            restriction.addClause(fieldName, panel.getFieldMultipleValues(fieldName), 'IN');
        } else {
            var value = panel.getFieldValue(fieldName);
            if (value) {
                restriction.addClause(fieldName, value, '=');
            }
        }
    },
        
    /**
     * Get is hotelable room sql condition as a sql parameter.
     */
    excludedHotalableRmRestriction: function() {
        var checkTotalArea = Ext.get('excludedHotalableRm').dom.checked;

        //var spaceExpressConsole = View.controllers.get('spaceExpressConsole');
        if (checkTotalArea && this.mode === 'employeeMode') {
        	return  " rm.hotelable = 0 ";
        } else {
        	return " 5=5 ";
        }
    },
    
    /**
     * Get total area and room count sql condition as a sql parameter.
     */
    getTotalAreaAndCountQueryParameter: function() {
        var areaAndCount = ' 1=1 ';

        var checkTotalArea = Ext.get('occupancyWithTotalArea').dom.checked && Ext.get('totalArea').dom.value!="";
        var checkTotalRooms = Ext.get('occupancyWithTotalRooms').dom.checked && Ext.get('totalRooms').dom.value!="";
        
        var totalAreaValue = Ext.get('totalArea').dom.value;
        if (checkTotalArea && isNaN(totalAreaValue)) {
        	alert("The total area value should be a number");
        	return;
        }
        
        var totalRoomCount = Ext.get('totalRooms').dom.value;
        if (checkTotalRooms && isNaN(totalRoomCount)) {
        	alert("The total room count should be a number");
        	return;
        }
        
        var areaRestriction = ' total_area ' + Ext.get('totalAreaOp').dom.value + ' ' + Ext.get('totalArea').dom.value;
        var roomsRestriction = ' total_count ' + Ext.get('totalRoomsOp').dom.value + ' ' + Ext.get('totalRooms').dom.value;
        
        if (checkTotalArea&&checkTotalRooms) {
            areaAndCount = areaRestriction + ' AND ' +roomsRestriction;
        } else if (checkTotalArea&&!checkTotalRooms) {
            areaAndCount = areaRestriction;
        } else if (!checkTotalArea&&checkTotalRooms) {
        	areaAndCount =  roomsRestriction;;
        }

        return areaAndCount;
    },
    
    /**
     * Get floor total sql condition as sql parameter.
     */
    getFloorTotalsRestriction: function() {
        var restriction = new Ab.view.Restriction();

        if (Ext.get('occupancyWithTotalArea').dom.checked) {
            restriction.addClause('rm.area_rm', Ext.get('totalArea').dom.value, Ext.get('totalAreaOp').dom.value);
        }
        if (Ext.get('occupancyWithTotalRooms').dom.checked) {
        }

        return restriction;
    },
    
    /**
     * other search string html element generated.
	 *	//Occupancy,Total room area, total room count, division-department unassigned, room category and type unassigned.
     */
    getSearchString: function() {
    	var result = "";
    	if ($('organizationUnassigned').checked) {
    		result+=" "+getMessage('textUnassignedOrganization')+" ";
    	}
    	if ($('typeUnassigned').checked) {
    		result+=" "+getMessage('textUnassignedRoomCategories')+" ";
    	}
    	var occupancy = "";
    	if ($('occupancyVacantOnly').checked) {
    		occupancy+=" "+getMessage('textVacantonly')+" ";
    	}
    	if ($('occupancyVacant').checked) {
    		occupancy+=" "+getMessage('textVacantonly')+" ";
    	}
    	if ($('occupancyAvailable').checked) {
    		occupancy+=" "+getMessage('textAvailable')+" ";
    	}
    	if ($('occupancyAtCapacity').checked) {
    		occupancy+=" "+getMessage('textAtCapacity')+" ";
    	}
    	if ($('occupancyExceedsCapacity').checked) {
    		occupancy+=" "+getMessage('textExceedscapacity')+" ";
    	}

        var spaceExpressConsole = View.controllers.get('spaceExpressConsole');
        if(spaceExpressConsole.mode === 'employeeMode') {
        	if ($('excludedHotalableRm').checked) {
        		result+=" "+getMessage('textExcludedHotelableRoom')+" ";
        	}
        } 
    	
    	if (jQuery("#div_checkbox_control input:checked").length>0) {
    		result+=" "+getMessage('textOccupancy')+"["+occupancy.substring(0,occupancy.length-2)+"]";
    	}
    	if ($('occupancyWithTotalArea').checked) {
    		result+=" "+getMessage('textWithtotalarea') + Ext.get('totalAreaOp').dom.value + ' ' + Ext.get('totalArea').dom.value;
    	}
    	if ($('occupancyWithTotalRooms').checked) {
    		result+=" "+getMessage('textWithtotalcount') + Ext.get('totalRoomsOp').dom.value + ' ' + Ext.get('totalRooms').dom.value;
    	}
    	return result;
    },
    
    /**
     *  Save button click, save current form, close dialog and call filter method.
     */
    editBuildingForm_onSaveBuilding: function() {
    	
    	this.editBuildingForm.save();
    	this.editBuildingForm.closeWindow();
		this.locationFilter_onFilterLocations();
    },
    
    /**
     *  Save button click, save current form, close dialog and call filter method.
     */
    editFloorForm_onSaveFloor: function() {
    	this.editFloorForm.save();
    	this.editFloorForm.closeWindow();
    	this.locationFilter_onFilterLocations();
    },
	
    /**
     * grid after refresh.
     */
    locationsGrid_afterRefresh: function() {
    	//make the row can't clickable if user is not 'SPACE-CONSOLE-ALL-ACCESS'.
    	if (!View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')) {
    		jQuery("#locationsGrid a[id*='rm.bl_id'],#locationsGrid a[id*='rm.fl_id']").each(function() {
    			jQuery(this).parent().html(jQuery(this).html());
    		});
    	}
    },
    
    /**
     * unselect all floors to show background layers.
     */
    unselectFloors: function() {
    	this.locationsGrid.unselectAll();
    },

	/**
     *	Added for 23.1: logics for team assign functionality, by ZY, 2016-01-21. 
	 *	  -	Filter the Locations list for floors that have at least that many open seats that are not already assigned to any employee or team on the assignment start date.
     */
    onFilterFloorsForTeamAssign: function(selectDateStart, selectDateEnd, requiredFloorCapcity) {
		this.refreshFloorsForTeamCapcity(selectDateStart, selectDateEnd, requiredFloorCapcity);
	},	

	/**
     *	Added for 23.1: logics for team assign functionality, by ZY, 2016-01-21. 
	 *	  -	Remove restriction applied on the Locations list of floors matching open seats requirement for team.
     */
    onClearFilterFloorForTeamAssign: function(selectDateStart, selectDateEnd) {
		this.refreshFloorsForTeamCapcity(selectDateStart, selectDateEnd, 0);
	},


	/**
     *	Added for 23.1: logics for team assign functionality, by ZY, 2016-01-21. 
	 *	  -	Filter the Locations list for floors that have at least that many open seats that are not already assigned to any employee or team on the assignment start date.
     */
    refreshFloorsForTeamCapcity: function(selectDateStart, selectDateEnd, requiredFloorCapcity) {
		var checkedLocation = this.locationsGrid.getSelectedRows();
		this.locationsGrid.addParameter('totalTeamCap', requiredFloorCapcity==0 ?  '1=1' : ('wraped_rm_for_oracleDb.total_team_cap>='+requiredFloorCapcity) );
		this.locationsGrid.addParameter('selectDateStart', selectDateStart);
		this.locationsGrid.addParameter('selectDateEnd', selectDateEnd);
		this.locationsGrid.refresh();
        this.showPreviousCheckedFloorPlan(checkedLocation);
	},	

	/**
     *	Added for 23.1: logics for update as of date from selected date start after assign team operations( commit, cancel, etc), 2016-03-04. 
     */
	onUpdateAsOfDate: function(asOfDate){
		this.locationFilter.setFieldValue('rm.date_last_surveyed', asOfDate);
		this.locationFilter_onFilterLocations();
	}
});

/**
 * Export in XLS format.
 */
function exportLocationToXLS() {
	doLocationCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
}

/**
 * Export in docx format.
 */
function exportLocationToDOCX() {
	doLocationCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doLocationCustomExport(workflowRuleName, outputType) {

	var locationsGrid = View.panels.get("locationsGrid");
	var parameters = locationsGrid.getParametersForRefresh();
	var restriction = spaceExpressConsoleLocations.filter.restriction;
	var printableRestrictions = getPrintableRestrictions(restriction, true);
	
	parameters.printRestriction = printableRestrictions.length == 0 ? false: true;
	parameters.printableRestriction = printableRestrictions;
	parameters.categoryFields = getCategoryFieldsArray(locationsGrid, 'locationsDS');
	parameters.showTotals = locationsGrid.getParametersForRefresh().showTotals;
	parameters.showCounts = locationsGrid.getParametersForRefresh().showCounts;
	
	var jobId = '';
	var locationReport = getMessage("locationReport");
	if (outputType == 'xls') {
		jobId = locationsGrid.callXLSReportJob(locationReport,'',parameters);
	} else {
		jobId = locationsGrid.callDOCXReportJob(locationReport,'',parameters);
	}
	//get and open reported URL
	doExportPanel(jobId, outputType);
}

/**
 * Show the room standard tab
 */
function openRoomStandardTab(action) {
	if ( action.checked ) {
		if (spaceExpressConsoleLocations.mode != 'spaceMode') {
			action.setChecked(false);
			View.showMessage('message',getMessage('roomStandardUnavailable'));
		} else {
			spaceExpressConsoleLocations.trigger('app:space:express:console:openRoomStandardTab', action);
		}
	}
	else {
		spaceExpressConsoleLocations.trigger('app:space:express:console:openRoomStandardTab', action);
	}
}

/**
 * Show the room standard tab
 */
function openTeamsTab(action) {
	var teamPropTbl = View.dataSources.get('teamSchemaDs').getRecords();
	if ( teamPropTbl && teamPropTbl[0]) {
		if (action.checked) {
			if (spaceExpressConsoleLocations.mode == 'employeeMode') {
				spaceExpressConsoleLocations.trigger('app:space:express:console:openTeamsTab', action);
			} 
			else {
				action.setChecked(false);
				View.showMessage('message',getMessage('teamUnavailableInSpaceMode'));
			}
		} 
		else {
			spaceExpressConsoleLocations.trigger('app:space:express:console:openTeamsTab', action);
		}

		spaceExpressConsoleLocations.showFilterFieldsForTeamSpace(action.checked);
	}
	else {
		View.showMessage('message', getMessage('teamSchemaUnavailable'));
	}
}
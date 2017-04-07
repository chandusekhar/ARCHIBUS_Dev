/**
 * Controller for the drawing panel.
 *
 * TODO: save and restore the employeesWaiting collection into the sidecar.
 * See the pendingAssignments collection in ab-sp-console-assignments.js.
 *
 * Events:
 * app:space:express:console:commitAssignment
 * app:space:express:console:cancelAssignment
 * app:space:express:console:viewAssignment
 * app:space:express:console:selectRoom
 * app:space:express:console:viewSelectedRooms
 * app:space:express:console:moveEmployee
 * app:space:express:console:removeEmployeeWaiting
 */
var spaceExpressConsoleDrawing = View.createController('spaceExpressConsoleDrawing', {

    /**
     * A copy of the parent view mode.
     */
    mode: '',

    /**
     * The object that describes what rooms are assigned to: a department, a room type, or employees.
     */
    assignmentTarget: null,

    /**
     * The Ab.space.express.console.Assignments collection of pending assignments.
     */
    pendingAssignments: null,
    
    /**
     * The objects contains all the selected rooms.
     */
    selectedRooms: null,
    
    /**
     * Rooms for assignment.
     */
    assignedRooms: null,
    
    /**
     * Rooms for employees moving for highlighting.
     */
    movedEmployeesRooms: null,

    /**
     * The array of {bl_id, fl_id, dwgname} for displayed floors.
     */
    selectedFloors: null,

    /**
     * The array of em_id values for employees that are currently on the bus.
     */
    employeesWaiting: null,

    /**
     * Set to true after the employee panel has been created.
     */
    assetPanelCreated: false,

    /**
     * Location and occupancy restrictions applied from the filter panel.
     */
    filter: null,
    
    /**
     * filter for last time.
     */
    lastFilter: null,
    
    /**
     * Selected grid rows
     */
    selectedEmployeeRows: null,
	
	/**
	 * Number of selected grid rows
	 */
	totalSelectedEmployeeRows: 0,
	
	/**
	 * The flag to indicate whether the user is locate an employee or a room.
	 */
	isLocateEvent: false,
	
	/**
	 * The stored team id for locate.
	 */
	locateTeamId: null,

	/**
	 * The element for the check box of show room standard.
	 */
	openRoomStandardAction:null,
	
	/**
	 * An action element copy of room standard for performance.
	 */
	copyOfRoomStandardElement:null,
	
	/**
	 * The current selected plan type.
	 */
	selectedPlanType: null,
	
	/**
	 * The current selected legend datasource.
	 */
	currentLegendDataSource: null,
	
	/**
	 * The current legend panel.
	 */
	currentLegendPanel: null,

	/**
	 * Suffix of drawing files according to user selected background and its option value as well.
	 */
	backgroundSuffix:null,
	backgroundOptionValue:null,

	/**
	 * Current asOfDate .
	 */
	asOfDate:getCurrentDateInISOFormat(),

	/**
	 * Current selected start date.
	 */
	selectDateStart:null,
	
	/**
	 * Current selected end date.
	 */
	selectDateEnd:null,

	originalHighlightTeamDs:null,
	originalLabelTeamDs:null,

    /**
     * For 23.1: sign of whether 'Team Space' function is enabled
     */
	isTeamSpaceEnabled: false, 

	/**
     * Constructor.
     */
    afterCreate: function() {
        this.initializeVariables();
        this.initializeEventListener();
    },
    
    /**
     * Initialize the variables after the view is created.
     * Add by heqiang
     */
    initializeVariables: function() {
    	this.assignmentTarget = null;
        this.selectedFloors = [];
        this.employeesWaiting = [];
        this.resetRoomsData();
        this.setFilter();
    },
    
    /**
     * Register all the listener this controller handles.
     * Add by heqiang
     */
    initializeEventListener: function() {
        this.on('app:space:express:console:refreshDrawing', this.refreshDrawing);
        this.on('app:space:express:console:selectLocation', this.addFloorPlan);
        this.on('app:space:express:console:changeMode', this.changeMode);
        this.on('app:space:express:console:addEmployeeWaiting', this.addEmployeeWaiting);
        this.on('app:space:express:console:unassignEmployees', this.unassignEmployees);
        this.on('app:space:express:console:removeAssignment', this.removeAssignment);
        this.on('app:space:express:console:afterBeginAssignment', this.afterBeginAssignment);
        this.on('app:space:express:console:afterClearAssignment', this.afterClearAssignment);
        this.on('app:space:express:console:afterChangeAssignmentTarget', this.afterChangeAssignmentTarget);
        this.on('app:space:express:console:loadAndHighLightSelectedEmployees', this.loadAndHighlightSelectedEmployees);
        this.on('app:space:express:console:loadAndHighLightSelectedRoom', this.loadAndHighlightSelectedRoom);
        this.on('app:space:express:console:highlightRooms', this.highlightRooms);
        this.on('app:space:express:console:highlightTeamRooms', this.highlightTeamRooms);
        this.on('app:space:express:console:cancelSelectedRooms', this.cancelSelectedRooms);
        this.on('app:space:express:console:cancelEmployeeAssignment', this.cancelEmployeeAssignment);
        this.on('app:space:express:console:commitRoomsAlteration', this.afterCommitRoomsAlteration);
        this.on('app:space:express:console:rollbackEmployeeAssignment', this.rollbackEmployeeAssignment);
        this.on('app:space:express:console:afterCommitPendingAssignment', this.afterCommitPendingAssignment);
        this.on('app:space:express:console:enableTeamSpace', this.enableTeamSpace);
		// Space Utilization: To enable Space Utilization functionaliy: remove "//" from start of below code line 
		// this.on('app:space:express:console:refreshUtilization', this.refreshDrawingForUtil);	
    },
    
    /**
     * After view is loaded, we will set the UI state and register event for the drawing panel.
     */
    afterViewLoad: function() {
    	//set draggable assets to employee and selection pattern
    	this.drawingPanel.enableLiteDisplay(false);
    	this.drawingPanel.setDraggableAssets(['em']);
        this.drawingPanel.setDiagonalSelectionPattern(true);
        
        //set callback function when special event that we are interested in occurs.
        this.drawingPanel.addEventListener('onclick', this.onClickRoom.createDelegate(this));
        this.drawingPanel.addEventListener('ondwgload', this.reHighlightSelectedAssets.createDelegate(this));
        this.drawingPanel.addEventListener('onMultipleSelectionChange', this.onDrawingPanelMultipleSelectionChange.createDelegate(this));
        this.drawingPanel.addEventListener('onselecteddatasourcechanged', this.handleSelectDataSource.createDelegate(this));
        this.doAppendRuleSet();
        //change the number value to text label for the legend panel.
        this.legendGrid.afterCreateCellContent = setLegendLabel;
        this.borderLegendGrid.afterCreateCellContent = setLegendLabel;
    },
    
	/**
	* Added for 23.1: Show/Hide highlight/border/label select options related to 'Team Space' functionality by default.
	*/
	showHighlightSelections: function(enabled){
		this.changeSelectorOptions("selector_hilite", 
				[{value:'highlightTeamDs', text:'highlightTeamDsText'}, {value:'highlightTeamDivisionsDs', text:'highlightTeamDvDsText'},{value:'highlightTeamDepartmentsDs', text:'highlightTeamDpDsText'}], 
				enabled);

		this.changeSelectorOptions("selector_IBorders", 
				[{value:'highlightTeamDs', text:'highlightTeamDsText'}, {value:'highlightTeamDivisionsDs', text:'highlightTeamDvDsText'},{value:'highlightTeamDepartmentsDs', text:'highlightTeamDpDsText'}], 
				enabled);

		this.changeSelectorOptions("selector_labels", [{value:'labelTeamsDs', text:'labelTeamDsText'}, {value:'labelTeamDivisionsDs', text:'highlightTeamDvDsText'},{value:'labelTeamDepartmentsDs', text:'highlightTeamDpDsText'}], enabled);
	},

	/**
	* Added for 23.1: By given selector id and options, show or hide select options related to 'Team Space' functionality.
	*/
	changeSelectorOptions: function(selectorId, optionsArray, isShow) {
		var selector = "#"+selectorId;
		if (isShow) {
			if ( this.drawingPanel ) {
				jQuery(selector+" option[value='"+this.drawingPanel.noneTxt+"']").remove();
			}
			jQuery(selector+" option[value='None']").remove();
			for (var i=0; i<optionsArray.length; i++ ){
				var value = optionsArray[i]['value'];
				var text = optionsArray[i]['text'];
				jQuery(selector).append("<option value='"+value+"'>"+getMessage(text)+"</option>"); 
			}
			jQuery(selector).append("<option value='None'>"+getMessage('highlightNoneText')+"</option>");
		} 
		else {
			for (var i=0; i<optionsArray.length; i++ ){
				var value = optionsArray[i]['value'];
				jQuery(selector+" option[value='"+value+"']").remove();
			}
		}
	},

	afterInitialDataFetch: function() {
    	this.drawingPanel.getSidecar().load();
    	var employeesWaiting = this.drawingPanel.getSidecar().get('employeesWaiting');
    	//Need to get mode from side car because the changeMode event is not triggered.
    	this.mode = this.modeSelector.getSidecar().get('mode');
    	
    	this.employeesWaiting = employeesWaiting;
    	if(!this.employeesWaiting) {
    		this.employeesWaiting = [];
    	}
    	//The waiting room can't be shown in IE.Need special treatment.
    	if (this.mode === "employeeMode") {
    		this.refreshAssetPanel.defer(2500, this);
    	}
		
		if ( !this.isTeamSpaceEnabled ){
			this.showHighlightSelections(false);
		}
    },
    
	/**
	* Added for 23.1 Team Space: add 'Select Date' UI to action bar or drawing panel.
	*/
	appendSelectDateToActionBar: function(){
		var tdNode = Ext.get('drawingPanel_actionbar').dom.childNodes[0].childNodes[0].childNodes[0].childNodes[0];

		tdCell = Ext.DomHelper.insertBefore(tdNode,  {
			tag : 'td',
			id : 'filterFloor'
		});
		var str = "<input type='checkbox' id='filterFloorCheckbox' style='margin-left:15px;'/>";
		var filterFloorCheckbox = Ext.DomHelper.append(tdCell, str , true);
		var label = Ext.DomHelper.append(tdCell,  "<label for='filterFloorLabel' style='margin-right:25px;'><b translatable='true'>"+" "+getMessage("filterFloorTitle")+"</b><img src='/archibus/schema/ab-core/graphics/icons/help.png' style='margin-left:5px;' title='"+getMessage("helpAvailableFloor")+"'/></label>", true);
		this.bindEventsForFilterFloorCheckBox();
		
		this.selectDateStart = this.asOfDate;

		var showButtonCell = Ext.DomHelper.insertBefore(tdCell,  {
			tag : 'td',
			id : 'drawingPanel_selectDateBar'
		});
		var showButtonTitle = getMessage("highlightFrom")+" "+this.selectDateStart+(this.selectDateEnd? (" "+getMessage("highlightTo")+" "+this.selectDateEnd):" ");
		var showButtonHtml = "<table style='margin-left:15px;' border='0' cellpadding='0' cellspacing='0' class='x-btn-wrap x-btn mainAction ' id='showForDate'><tbody><tr><td class='x-btn-left'><i>&nbsp;</i></td><td class='x-btn-center'><em unselectable='on'><button class='x-btn-text' type='button' id='showButton'>"+showButtonTitle+"</button></em></td><td class='x-btn-right'><i>&nbsp;</i></td></tr></tbody></table>";
		Ext.DomHelper.append(showButtonCell, showButtonHtml, true);

		var thisController = this;
    	document.getElementById('showForDate').onclick = function() {
			thisController.showSelectDateForm(this);
		}
	},

	/**
     * Set the highlight rule for employee datasource.
     */
    doAppendRuleSet: function() {
		this.drawingPanel.clearRuleSets();
		var ruleset = new DwgHighlightRuleSet();
    	ruleset.appendRule("rm.countEm", "0", "DBDBDB", "==");//gray    	:Not Assignable
        ruleset.appendRule("rm.countEm", "1", "4DFF4D", "==");//green      :Vacant
        ruleset.appendRule("rm.countEm", "2", "4D4DFF", "==");//blue       :Available
        ruleset.appendRule("rm.countEm", "3", "FFFF4D", "==");//yellow     :At Capacity
        ruleset.appendRule("rm.countEm", "4", "FF4D4D", "==");//red        :Exceeds Capacity
        this.drawingPanel.appendRuleSet("highlightEmployeesDs", ruleset);
    },
    
    /**
     * When switch mode, clears the selected rooms and pending assignments.
     */
    changeMode: function(mode) {
    	if (valueExists(mode)) {
    		this.mode = mode;
        }
		//Reset all the rooms selection.
    	this.resetRoomsData();
        
        //switch highlight and label option according to mode.
    	this.swithOptionForMode();
    	
    	//Do some operation related to concrete mode.
        this.handleModeAction();
    },
    
    /**
     * Applies specified location and occupancy restrictions to the drawing panel.
     */
    refreshDrawing: function(filter) {
    	this.setFilter(filter);
		
		// kb#3052729: need to reset the Select Date info when changing the as of date not in 'team assign' mode. 
		if ( (!this.assignmentTarget || this.assignmentTarget.type != 'team') && $('showButton')) {
			this.selectDateStart=this.asOfDate;
			this.selectDateEnd=null;  
			var showButtonTitle = getMessage("highlightFrom")+" "+this.selectDateStart+(this.selectDateEnd? (" "+getMessage("highlightTo")+" "+this.selectDateEnd):" ");
			$('showButton').innerText = showButtonTitle;
		}

        this.trigger('app:space:express:console:cancelSelectedRooms');
        for ( var i = 0; i < View.dataSources.length; i++ ) {
            var ds = View.dataSources.get(i);
            if (ds && ds.type === 'DrawingControlHighlight') {
                ds.addParameters(this.filter.parameters);
                ds.setRestriction(this.filter.restriction);
            }
            if (ds && ( ds.id === 'labelTeamDivisionsDs' || ds.id === 'labelTeamDepartmentsDs' || ds.id === 'labelTeamsDs' ) ) {
                ds.addParameters(this.filter.parameters);
            }
			// Space Utilization: To enable Space Utilization functionaliy: remove "//" from below code lines between start and end 
			// Start
            //if (ds && ( ds.id === 'highlightUtilizationDs') ) {
           //     ds.addParameter('fromDate', this.filter.parameters['fromDate']);
           //    ds.addParameter('toDate', this.filter.parameters['toDate']);
          //      ds.addParameter('fromTime', this.filter.parameters['fromTime']);
          //      ds.addParameter('toTime', this.filter.parameters['toTime']);
          //  }
			// End
        }

        if (this.drawingPanel.dwgLoaded) {
        	this.drawingPanel.clearPersistFills();
        	this.drawingPanel.refresh();
        }
    },
    
	// Space Utilization: To enable Space Utilization functionaliy: remove the line "/*" below 'Space utilization - Start'; and the line '*/' above the 'Space utilization - End'.
    /**
     * Applies specified from and to date/time for highlight drawing by Utilization.
     */
	// Space utilization - Start
	/*
    refreshDrawingForUtil: function(parameters) {
        if ( this.drawingPanel.dwgLoaded && this.drawingPanel.currentHighlightDS==='highlightUtilizationDs' ){
			this.trigger('app:space:express:console:cancelSelectedRooms');
			for ( var i = 0; i < View.dataSources.length; i++ ) {
				var ds = View.dataSources.get(i);
				if (ds && ( ds.id === 'highlightUtilizationDs') ) {
					ds.addParameter('fromDate', parameters['fromDate']);
					ds.addParameter('toDate', parameters['toDate']);
					ds.addParameter('fromTime', parameters['fromTime']);
					ds.addParameter('toTime', parameters['toTime']);
				}
			}
        	this.drawingPanel.clearPersistFills();
        	this.drawingPanel.refresh();
        }
    },
     */ 
	// Space utilization - End

    /**
     * Set the filter value to that comes from the location filter console.
     */
    setFilter: function(filter) {
        if (filter) {
            this.filter = filter;
			this.asOfDate = filter.parameters['asOfDate'];
        } else {
        	if (this.filter == null) {
        		this.filter = {
                        restriction: null,
                        parameters: {'asOfDate': this.asOfDate}
                    };
        	}
        }
    },
    
    /**
     * When a user enters a special mode, we need to do some action that is usable in this mode.
     */
    handleModeAction: function() {
    	if (this.mode == 'employeeMode') {
        	this.drawingPanel.setDraggableAssets(['em']);
        	this.refreshAssetPanel();
        } else {
            if (this.filter) {
            	this.filter.restriction = new Ab.view.Restriction();
            }
            this.drawingPanel.setDraggableAssets(null);
            this.hideAssetPanel();
        }
    	
    	this.trigger('app:space:express:console:reselectLocationsForDrawing');
    	
    	if (!this.isLocateEvent && this.drawingPanel.dwgLoaded) {
        	this.reHighlightSelectedAssets();
        }
    },
    
    /**
     * Switch the status of the gear icon above drawing panel.
     */
    switchRoomStandardIconStatus: function(enabled) {
    	var innerThis = this;
    	if (this.copyOfRoomStandardElement == null) {
    		this.drawingPanel.actions.each(function(action) {
    			if(action.id == 'drawingMenu') {
    				innerThis.copyOfRoomStandardElement = action;
    				action.enable(enabled);
    			}
    		});
    	} else {
    		this.copyOfRoomStandardElement.enable(enabled);
    	}
    },
    
    /**
     * Reset all rooms and clear their current status.
     */
    resetRoomsData: function() {
    	this.selectedRooms = new Ab.space.express.console.Rooms();
    	this.assignedRooms = new Ab.space.express.console.Rooms();
    	this.movedEmployeesRooms = new Ab.space.express.console.Rooms();
    },
    
    /**
     * As for mode, we will change the highlight or labels option according to it.
     */
    swithOptionForMode: function() {
    	if (this.mode == 'employeeMode') {
    		if (this.drawingPanel.dwgLoaded) {
    			this.drawingPanel.setDataSource('labels', 'labelEmployeesDs');
    		}
    	} else {
    		var spaceHighlightDs = this.drawingPanel.currentHighlightDS;
    		if (!spaceHighlightDs || spaceHighlightDs=='' || spaceHighlightDs=='None') {
    			this.drawingPanel.setDataSource('highlight', 'highlightDivisionsDs');
    		}
    	}
    },

    /**
     * Handle the multiple room selection when hold the ctrl key and drag the mouse and then make selections on drawing panel.
     * add by heqiang
     */
    onDrawingPanelMultipleSelectionChange: function() {
    	var drawingPanel = View.getControl('', 'drawingPanel')
    	var selectedAssetsMap = drawingPanel.getMultipleSelectedAssets();
    	if (selectedAssetsMap.length > 0) {
    		for ( var i = 0 ;i < selectedAssetsMap.length; i++ ) {
    			this.onClickRoom(selectedAssetsMap[i].pks,  selectedAssetsMap[i].selected);
    		}
    	}
    },

    /**
     * Called when the user selects or un-selects a floor in the Locations panel.
     * @param row
     */
    addFloorPlan: function(row) {
        this.fireBuildingCheckEvent(row);

		if (this.backgroundSuffix){
			var opts = new DwgOpts();
			opts.backgroundSuffix =  this.backgroundSuffix;
			this.drawingPanel.addDrawing(row, opts);
		} else {
			this.drawingPanel.addDrawing(row, null);
		};

		if (row.row.isSelected() ) {
			if (this.selectedPlanType) {
				this.openPlanTypesDialogCloseHandler(this.selectedPlanType)
			}
		}

		this.refreshDrawing();
        if (this.drawingPanel.dwgLoaded && this.mode == 'employeeMode') {
        	this.drawingPanel.showAssetPanel('em');
        }
    },
    
    /**
     * When the user select or unselect a row from the building-floor grid, we will push or pop the floor correspondingly.
     */
    fireBuildingCheckEvent: function(row) {
    	var buildingId = row.row.getFieldValue('rm.bl_id');
        var floorId = row.row.getFieldValue('rm.fl_id');
        var dwgname = row.row.getFieldValue('rm.dwgname');
        this.selectedFloors = _.reject(this.selectedFloors, function(selectedFloor) {
            return selectedFloor.bl_id === buildingId && selectedFloor.fl_id === floorId;
        });
        if (row.row.isSelected()) {
            this.selectedFloors.push({
                bl_id: buildingId,
                fl_id: floorId,
                dwgname: dwgname
            });
        }
    },
    
    /**
     * When the user selects the highlight datasource or label datasource, we will keep the former highlighted rooms.
     * Add by heqiang 
     */
    handleSelectDataSource: function() {
    	this.selectedPlanType = null;
    	this.currentLegendDataSource = null;
    	this.currentLegendPanel = null;
    	
		if (this.drawingPanel.dwgLoaded) {
    		for (var i = 0; i < View.dataSources.length; i++) {
                var ds = View.dataSources.get(i);
                if (ds && ds.type === 'DrawingControlHighlight') {
                    ds.addParameters(this.filter.parameters);
                    ds.setRestriction(this.filter.restriction);
                }
            }
        	var highlightDS = this.drawingPanel.currentHighlightDS;
        	var labelsDS = this.drawingPanel.currentLabelsDS;
        	if (highlightDS == '') {
        		highlightDS = 'highlightDivisionsDs';
        	}
        	if (labelsDS == '') {
        		labelsDS = 'labelDivisionsDs';
        	}
    		
        	this.drawingPanel.setDataSource('highlight', highlightDS);
            this.drawingPanel.setDataSource('labels', labelsDS);
    		this.drawingPanel.clearPersistFills();
    		
    		//after the user change the highlight ds, we should keep all the selections the user made.
    		this.reHighlightSelectedAssets.defer(1, this);
    	}

		if ( this.locateTeamId ){
			this.highlightTeamRooms(this.locateTeamId, null, this.drawingPanel.currentHighlightDS);
		}
    },
    
    /**
     * ReHighlight all the selected assets according to types.
     * add by heqiang
     */
    reHighlightSelectedAssets: function(parameters) {
    	if (this.mode === 'spaceMode') {
        	if (this.assignedRooms.length > 0) 
        		this.reHighlightPendingAssignments();
            if (this.selectedRooms.length > 0)
            	this.reHighlightSelectedRooms();
    	} else {
    		if (this.selectedRooms.length > 0) {
        		this.reHighlightSelectedRooms();
        	}
        	if (this.movedEmployeesRooms.length > 0) {
        		this.reHighlightEmployeesMovedRooms();
        	}
    	}
    },
    
    
    /**
     * ReHighlight the selected rooms in the session when user reopens the floor plan if has any.
     * add by heqiang
     */
    reHighlightSelectedRooms: function() {
    	for ( var i = 0; i < this.selectedFloors.length; i++ ) {
    		var selectedFloor = this.selectedFloors[i];
    		var targetBlId = selectedFloor.bl_id;
    		var targetFlId = selectedFloor.fl_id;
    		var roomsArray = this.selectedRooms.targetToArray(targetBlId, targetFlId);
    		if (roomsArray.length > 0) {
        		if (this.drawingPanel.dwgLoaded) {
        			this.drawingPanel.selectAssets(roomsArray);
        		}
        	}
    	}
    },
    
    /**
     * ReHighlight the assignments in the session when user reopens the floor plan if has any.
     * add by heqiang
     */
    reHighlightPendingAssignments: function() {
    	for (var i = 0; i < this.selectedFloors.length; i++) {
    		var selectedFloor = this.selectedFloors[i];
    		var targetBlId = selectedFloor.bl_id;
    		var targetFlId = selectedFloor.fl_id;
    		var roomsArray = this.assignedRooms.targetToArray(targetBlId, targetFlId);
    		if (roomsArray.length > 0) {
        		if (this.drawingPanel.dwgLoaded) {
        			this.drawingPanel.selectAssets(roomsArray);
        		}
        	}
    	}
    },

    /**
     * ReHighlight assinged rooms in the session when user reopens the floor plan.
     * add by heqiang
     */
    reHighlightEmployeesMovedRooms: function() {
    	for ( var i = 0; i < this.selectedFloors.length; i++ ) {
    		var selectedFloor = this.selectedFloors[i];
    		var targetBlId = selectedFloor.bl_id;
    		var targetFlId = selectedFloor.fl_id;
    		var roomsArray = this.movedEmployeesRooms.targetToArray(targetBlId, targetFlId);
    		if (roomsArray.length > 0) {
    			if (this.drawingPanel.dwgLoaded) {
    				for (var j = 0; j < roomsArray.length; j++) {
    					var room = roomsArray[j];
    					var dwgname = this.getDwgnameByBlIdAndFlId(room[0], room[1]);
    					this.reHighlightRoom.defer(50, this, [room[0] +';' +room[1]+ ';' +room[2], dwgname]);
    				}
    			}
    		}
    	}
    },
    
    /**
     * After the user commits the selected rooms,we will reset the collection.
     */
    afterCommitRoomsAlteration: function() {
    	this.selectedRooms = new Ab.space.express.console.Rooms();
    	this.drawingPanel.clearPersistFills();
        this.drawingPanel.refresh();
    },
    
    
    /**
     * When cancel employee assignment from the popup window, we should clear the rehighlighted rooms.
     */
    cancelEmployeeAssignment: function() {
    	this.clearAssignmentTarget();
    	this.employeesWaiting = [];
    	this.drawingPanel.getSidecar().set('employeesWaiting', this.employeesWaiting);
    	if (!this.drawingPanel.getDrawingControl()) {
            return;
    	}
    	this.drawingPanel.clearPersistFills();
        this.drawingPanel.refresh();
        this.trigger('app:space:express:console:cancelAssignment');
    },
    
    /**
     * Get dwgname with building id and floor id.
     */
    getDwgnameByBlIdAndFlId: function(buildingId, floorId) {
    	for ( var i = 0; i < this.selectedFloors.length; i++ ) {
    		var floor = this.selectedFloors[i];
    		if (floor.bl_id == buildingId && floor.fl_id == floorId) {
    			return floor.dwgname;
    		}
    	}
    	return null;
    },
    
    /**
     * Returns true if specified floor is selected.
     * @param buildingId
     * @param floorId
     * @return {Boolean}
     */
    isFloorSelected: function(buildingId, floorId) {
        return valueExists(_.find(this.selectedFloors, function(selectedFloor) {
            return (selectedFloor.bl_id === buildingId && selectedFloor.fl_id === floorId);
        }));
    },
    
    /**
     * Invoke highlight rooms for selected employee.  zoom in if only one employee selected.
     */
    loadAndHighlightSelectedEmployees: function(employees) {
    	//when locating an employee. Change highlight drop-down to "None".
        this.drawingPanel.setDataSource('highlight', 'None');
    	
    	//if location clicked. set this varibalbe true and it doesn't refresh drawing in 'ondwgload'.
    	this.isLocateEvent = true;
	    this.selectedEmployeeRows = this.employeeGrid.getSelectedRows();
	    var nextRow = this.selectedEmployeeRows.pop();
	    this.fireBuildingCheckEvent(nextRow);
	    
	    this.drawingPanel.clear();
		this.drawingPanel.currentHighlightDS = "";
        this.drawingPanel.setDataSource('labels', 'labelEmployeesDs');
	    this.drawingPanel.highlightAssets(null, nextRow);
	    
	    this.zoomIn.defer(500, this, [nextRow["rm.bl_id"],nextRow["rm.fl_id"], nextRow["rm.rm_id"], nextRow['rm.dwgname']]);
	    this.setIsLocateEvent.defer(500, this, [false]);
    },
	
    /**
     * Load drawing plan for selected room and zoom in.
     */
    loadAndHighlightSelectedRoom: function(room) {
    	//when locating employees, change highlight drop-down to "None".
        this.drawingPanel.setDataSource('highlight', 'None');
        
    	// set the sign 'isLocateEvent' to true at the begining of locating the room, so that to prevent the refresh of drawing when 'ondwgload'.
    	this.isLocateEvent = true;
    	
    	var row = this.roomsGrid.rows[this.roomsGrid.selectedRowIndex];
    	this.fireBuildingCheckEvent(row);
    	
		// highlight drawing for selected room
		this.drawingPanel.clear();
		this.drawingPanel.currentHighlightDS = "";
        this.drawingPanel.setDataSource('labels', 'labelEmployeesDs');
	    this.drawingPanel.highlightAssets(null, row);

		//zoom in the selected room, use defer to wait the drawing load complete.
		this.zoomIn.defer(500, this, [room[0].bl_id,room[0].fl_id, room[0].rm_id, room[0].dwgname]);
	    
		// set the sign 'isLocateEvent' to false at the end of locating  room, add a delay to make sure this variable is changed after locate execution completed.
		this.setIsLocateEvent.defer(500, this, [false]);
    },
    
	/**
	 * Set method for boolean sign 'isLocateEvent'
	 */
	setIsLocateEvent: function(flag) {
		this.isLocateEvent = flag;
	},
	
	/**
	 * Zoom in	 the given room in drawing plan
	 */
	zoomIn: function(bl_id,fl_id,rm_id,dwgname) {
		var dcl = new Ab.drawing.DwgCtrlLoc(bl_id, fl_id, rm_id, dwgname);
		var opts = new DwgOpts();
		opts.rawDwgName = dwgname;
		this.drawingPanel.findAsset(dcl, opts, true, null, false);
	},
	
	 /**
     * Called after location button click. Highlight rooms which contains selected rows.
     */
    highlightRooms: function(rows) {
    	//when locating an employee. Change highlight drop-down to "None".
        this.drawingPanel.setDataSource('highlight', 'None');
        if (rows.length > 0) {
            this.drawingPanel.clearHighlights();
        	for (var i = 0; i < rows.length; i++) {
        		var opts_selectable = new DwgOpts();
        		opts_selectable.rawDwgName = rows[i].dwgname;
            	opts_selectable.appendRec(rows[i].bl_id+ ';' +rows[i].fl_id+ ';' +rows[i].rm_id);
            	this.drawingPanel.setSelectColor('0xFFFF00'); //set to yellow for exist assignment
            	this.drawingPanel.highlightAssets(opts_selectable);
            }
        }
        //zoom in if only one record.
        if (rows.length==1) {
        	this.zoomIn(rows[0].bl_id, rows[0].fl_id, rows[0].rm_id, rows[0].dwgname);
        }
    },

    /**
     * Added for 23.1 Team Space: Load drawing plans for selected team.
     */
    highlightTeamRooms: function(teamId, floorRows, highlightDs) {
		if ( !this.locateTeamId || this.locateTeamId!=teamId ) {
			//when locating team, change highlight drop-down to "None".
			this.drawingPanel.setDataSource('highlight', 'None');
			this.drawingPanel.setDataSource('labels', 'labelTeamsDs');

			// set the sign 'isLocateEvent' to true at the begining of locating the room, so that to prevent the refresh of drawing when 'ondwgload'.
			this.drawingPanel.currentHighlightDS = "highlightTeamDs";
			View.dataSources.get('highlightTeamDs').addParameter('teamIdRestriction', "rm_team.team_id='"+teamId+"'");
			this.drawingPanel.refresh();
			this.locateTeamId = teamId;
		} 
		else {
			if (highlightDs) {
				this.drawingPanel.setDataSource('highlight', highlightDs);
			} else {
				this.drawingPanel.setDataSource('highlight', 'highlightTeamDs');
			}
			View.dataSources.get('highlightTeamDs').addParameter('teamIdRestriction', ' 1=1 ');
			this.drawingPanel.refresh();
			this.locateTeamId = null;
		}
    },

    /**
     * Event handler when click room in the drawing panel
     * @param {Object} pk
     * @param {boolean} selected
     */
    onClickRoom: function(pk, selected) {
        var room = { bl_id: pk[0], fl_id: pk[1], rm_id: pk[2] };
        
        if (this.mode === 'spaceMode') {
        	this.onClickRoomInSpaceMode(room, selected);
        } else {
			if ( this.assignmentTarget && this.assignmentTarget.type=="team") {
				this.onClickRoomInTeamAssignMode(room, selected);
			} 
			else {
        		this.onClickRoomInEmployeeMode(room, selected);
			}
        }
    },
    
    /**
     * Process the click event in space mode.
     * add by heqiang
     */
    onClickRoomInSpaceMode: function(room, selected) {
    	//in assign model, highlight the room and add room to assignment container.
    	if (this.assignmentTarget != null) {
    		this.updateLocalRoomForReHighlight(this.assignedRooms, room, selected);
    	} else {
    		this.updateLocalRoomForReHighlight(this.selectedRooms, room, selected);
    	}
    	this.trigger('app:space:express:console:selectRoom', room, selected);
    },
    
    /**
     * Process the click event in team-assign mode.
     * add by ZY.
     */
    onClickRoomInTeamAssignMode: function(room, selected) {
		// check whether the room is occupiable for team.
		var rmRecord = abSpConsole_getRoomFromTeamOccupiableDs(room.bl_id, room.fl_id, room.rm_id, this.selectDateStart, this.selectDateEnd);
		if ( rmRecord ) {
			var isRoomOccupiableForTeam = parseInt( rmRecord.getValue('rm.occupiable') );
			if ( isRoomOccupiableForTeam===1 ) {
				//this.drawingPanel.unselectAssets(this.getAssetForRoom(room));
				this.updateLocalRoomForReHighlight(this.assignedRooms, room, selected);
				room['selectDateStart'] = this.selectDateStart;
				room['selectDateEnd'] = this.selectDateEnd;

				var roomCpapcity = parseInt( rmRecord.getValue('rm.capacity') );
				room['roomCpapcity'] = roomCpapcity;

				this.trigger('app:space:express:console:selectRoom', room, selected);
			} else {
				this.drawingPanel.unselectAssets(this.getAssetForRoom(room));
			}
		}
    },

	/**
     * Process the click event in employee mode.
     * add by heqiang
     */
    onClickRoomInEmployeeMode: function(room, selected) {
    	if (this.assignmentTarget != null) {
    		
    		this.drawingPanel.unselectAssets(this.getAssetForRoom(room));
    		
    		//If users don't select any employee, we give a warning message.
    		if (this.isProhibitAssignEmployee()) {
    			View.alert("Please first select an employee, then click on a room");
    			return;
    		} 
    		
    		//check if the room is non occupiable.
    		if (this.checkRoomIfNonOccupiable(room, selected)) {
    			var innerThis = this;
    			View.confirm(getMessage('assignedRoomIsNonOccupiable'), function(button) {
    				if (button == 'yes') {
    					innerThis.processAssignEmployees(room, selected);
    					innerThis.updateLocalRoomForReHighlight(innerThis.movedEmployeesRooms, room, selected);
    				}
    			});
    		} else {
    			this.processAssignEmployees(room, selected);
        		this.updateLocalRoomForReHighlight(this.movedEmployeesRooms, room, selected);
    		}
    	} else {
    		this.updateLocalRoomForReHighlight(this.selectedRooms, room, selected);
    		this.trigger('app:space:express:console:selectRoom', room, selected);
    	}
    },
    
    /**
     * To check if the room is non occupiable
     */
    checkRoomIfNonOccupiable: function(room, selected) {
		var occupiable = abSpConsole_getFieldValueFromOccupiableDs(room.bl_id, room.fl_id, room.rm_id, 'rmcat.occupiable');
		if(isNaN(occupiable) || occupiable == 0) {
			return true;
		}
    	return false;
    },
    
    /**
     * If prohibit the user from assigning employees.
     */
    isProhibitAssignEmployee: function() {
    	var rows = this.employeeGrid.getSelectedRows();
    	return rows.length == 0;
    },
    
    /**
     * Process rooms when assign employees.
     */
    processAssignEmployees: function(room, selected) {
    	var appendRec = room.bl_id + ';' + room.fl_id + ';' + room.rm_id;
    	var dwgname = this.getDwgnameByBlIdAndFlId(room.bl_id, room.fl_id);
    	this.drawingPanel.unselectAssets(this.getAssetForRoom(room));
    	
    	//if only one employee is selected, then show the employee's name on the drawing panel.
    	for(var i = 0 ; i < this.assignmentTarget.employees.length; i++) {
    		var em_id = this.assignmentTarget.employees[i].em_id;
    		var employeeLabel = [];
        	var labelArray = {field:'em.em_id', record:{'em.em_id':em_id, 'bl_id':room.bl_id, 'fl_id':room.fl_id, 'rm_id':room.rm_id}};
        	employeeLabel.push(labelArray);
        	this.drawingPanel.addLabels(employeeLabel);
    	}
    	
    	//highlight the room.
    	if (selected) {
    		this.trigger('app:space:express:console:selectRoom', room, selected);
    	    this.reHighlightRoom(appendRec, dwgname);
    	}
    },
    
    /**
     * Check whether a room is assigned.
     */
    isRoomAssigned: function(room) {
    	var currentPendingAssignments = this.drawingPanel.getSidecar().get('pendingAssignments');
    	for( var i = 0; i < currentPendingAssignments.models.length; i++) {
    		var assignment = currentPendingAssignments.models[i];
    		var bl_id = assignment.attributes.to_bl_id;
    		var fl_id = assignment.attributes.to_fl_id;
    		var rm_id = assignment.attributes.to_rm_id;
    		if (room.bl_id == bl_id && room.fl_id == fl_id && room.rm_id == rm_id) {
    			return true;
    		}
    	}
    	return false;
    },
    
    /**
     * Update the local copy of all assigned rooms.
     */
    updateLocalRoomForReHighlight: function(roomContainer, room, selected) {
    	if(selected) {
    		if (!roomContainer.findRoom(room)) {
    			roomContainer.addRoom(room);
    		}
    	} else {
    		roomContainer.removeRoom(room);
    	}
    },

    /**
     * Hides the asset panel.
     */
    hideAssetPanel: function() {
        if (this.assetPanelCreated) {
            this.drawingPanel.closeAssetPanel('em');
        }
    },
   
    /**
     * Refreshes the asset panel to display employees that are currently in waiting.
     */
    refreshAssetPanel: function() {
        if (!this.drawingPanel.getDrawingControl()) {
            return;
        }
        
        this.drawingPanel.clearPersistFills();
        this.drawingPanel.refresh();
        
       //we will create the asset panel if we have not, or we will just refresh it.
        if (!this.assetPanelCreated) {
        	var restriction = new Ab.view.Restriction();
        	restriction.addClause('em.em_id', 'none', '='); 
        	this.employeesWaitingDS.setRestriction(restriction);
        	
            this.drawingPanel.enableAssetPanel('em', getMessage('assetPanelTitle'), "employeesWaitingDS", {
                actions: [],
                filter: false,
                size: {width: 400, height: 200},
                font: {fontFamily:'Arial', fontSize:'11'},
                selectionColor:'#FFEAC6'
            });
            this.drawingPanel.addEventListener('onAssetLocationChange', this.onDropAsset.createDelegate(this));
            this.drawingPanel.addAssetPanelRowAction({
                type: 'em',
                title: getMessage('removeButton'),
                icon: Ab.view.View.contextPath + "/schema/ab-core/graphics/delete.gif",
                handler: this.onRemoveEmployeeWaiting.createDelegate(this)});
            this.assetPanelCreated = true;
        } else {
        	if(this.mode == 'employeeMode') {
        		this.drawingPanel.showAssetPanel('em');
        		this.refreshEmployeeWaitingPanel();
        	} else {
        		this.drawingPanel.closeAssetPanel('em');
        	}
        }
    },

    /**
     * The drawing calls this method when the user drags an employee from one room to another,
     * from a room to the asset panel, or from the asset panel to a room.
     * @param record
     * @param assetType
     * @return {Boolean}
     */
    onDropAsset: function(record, assetType, dwgname) {
        if (assetType == 'em') {
            var assignment = this.createEmployeeAssignmentFromDrawingRecord(record);
            var em_id = assignment.em_id;
            var from_bl_id = assignment.bl_id;
            var from_fl_id = assignment.fl_id;
            var from_rm_id = assignment.rm_id;
            var bl_id = assignment.to_bl_id;
            var fl_id = assignment.to_fl_id;
            var rm_id = assignment.to_rm_id;
            var room = {
            	bl_id: bl_id,
            	fl_id: fl_id,
            	rm_id: rm_id
            };
            if (this.checkUserVPAPass(assignment)) {
            	
            	if (rm_id != '') {
            		this.trigger('app:space:express:console:moveEmployee', assignment);
            		if (!this.movedEmployeesRooms.findRoom(room)) {
            			this.movedEmployeesRooms.addRoom(room);
            		}
            		this.removeEmployeeWaiting(assignment);
            		this.refreshEmployeeWaitingPanel();
            		this.reHighlightRoom.defer(50, this, [bl_id + ';' + fl_id + ';' + rm_id, dwgname]);
            	} else {
            		//If the user drag an employee from room to waiting room, just refresh the waiting panel.
            		this.trigger('app:space:express:console:moveEmployee', assignment);
            		if (this.movedEmployeesRooms.findRoom(room)) {
            			this.movedEmployeesRooms.removeRoom(room);
            		}
            		this.employeesWaiting.push(assignment.em_id);
            		this.drawingPanel.getSidecar().set('employeesWaiting', this.employeesWaiting);
            		this.drawingPanel.getSidecar().save();
            		this.refreshEmployeeWaitingPanel();
            	}
            	// console is a 'read-only' version, for those users who do not have authority to make any edits or assignments
            	this.disableButtonIfReadOnlyUserGroup();
            } else {
            	alert(getMessage('dropEmPromptVPA'));
            	return false;
             }
        }
        return true;
    },
    
    /**
     * check if user VPA permit em move to dest room.
     */
    checkUserVPAPass: function(assignment) {
        var bl_id = assignment.to_bl_id;
        var fl_id = assignment.to_fl_id;
        var rm_id = assignment.to_rm_id;
        //if move to waiting room. return true.
        if (rm_id == '') {
            return true;   
        }
    	var userRoomsDS = View.dataSources.get("userRoomsDS");
    	userRoomsDS.addParameter('bl_id', bl_id);
    	userRoomsDS.addParameter('fl_id', fl_id);
    	userRoomsDS.addParameter('rm_id', rm_id);
    	var records = userRoomsDS.getRecords();
        if(records != null && records.length > 0){
        	return true;
        }
        return false;   
    },
    
    /**
     * Refresh the employee waiting panel when the user do certain update operation.
     * add by heqiang
     */
    refreshEmployeeWaitingPanel: function() {
    	var restriction = new Ab.view.Restriction();
        if (this.employeesWaiting && this.employeesWaiting.length > 0) {
            restriction.addClause('em.em_id', this.employeesWaiting, 'IN');
        } else {
            restriction.addClause('em.em_id', 'none', '=');
        }
        this.employeesWaitingDS.setRestriction(restriction);
        this.drawingPanel.refreshAssetPanel('em');
    },
    
    /**
     * Make console a 'read-only' version for those users who do not have authority to make any edits or assignments
     */
    disableButtonIfReadOnlyUserGroup: function() {
		this.drawingPanel.actionbar.actions.each(function (action) {
			if (action.id == 'commitPendingAssignments') {
				action.enable(View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS'));
			}
		});
    },
    
    /**
     * Highlight room by passed-in parameter appendRec.
     */
    reHighlightRoom: function(appendRec, dwgname) {
    	//Set the border thickness and filled color
    	var fillValue = new DwgFill();
    	fillValue.bc = 0x0000ff;
    	fillValue.bt = 5;
        fillValue.bo = 1.0;
        fillValue.fc = 0xFFFF00;
    	
        var opts_selectable = new DwgOpts();
        if (dwgname) {
        	opts_selectable.rawDwgName = dwgname;
        }
    	opts_selectable.appendRec(appendRec, fillValue);
    	opts_selectable.mode='none';
    	this.drawingPanel.highlightAssets(opts_selectable);
    },
    
    /**
     * Updates the employee assignments in the waiting for specified new assignment.
     * @param assignment
     */
    updateEmployeesWaiting: function(assignment) {
        if (assignment.to_bl_id === '') {
            // the user has dropped an employee onto the bus - add the assignment to the bus
        	var deletedRoom = { 
             		 bl_id: assignment.bl_id,
                     fl_id: assignment.fl_id,
                     rm_id: assignment.rm_id};
        	if (this.movedEmployeesRooms.findRoom(deletedRoom)) {
        		this.movedEmployeesRooms.removeRoom(deletedRoom);
        	}
            this.employeesWaiting.push(assignment.em_id);
            this.drawingPanel.getSidecar().set('employeesWaiting', this.employeesWaiting);
        	this.drawingPanel.getSidecar().save();
        } else {
            // the user has dragged an employee from the bus, or between rooms -
            // if the assignment is on the bus, remove it from the bus
            this.removeEmployeeWaiting(assignment);
            var addedRoom = { 
            		bl_id: assignment.to_bl_id,
                    fl_id: assignment.to_fl_id,
                    rm_id: assignment.to_rm_id};
            
            if (!this.movedEmployeesRooms.findRoom(addedRoom)) {
            	this.movedEmployeesRooms.addRoom(addedRoom);
            }
        }
    },

    /**
     * Removes specified employee from the waiting room, and removes the pending assignment.
     * @param assignment
     */
    removeEmployeeWaiting: function(assignment) {
        this.employeesWaiting = _.reject(this.employeesWaiting, function(em_id) {
            return assignment.em_id === em_id;
        });
        this.drawingPanel.getSidecar().set('employeesWaiting', this.employeesWaiting);
    	this.drawingPanel.getSidecar().save();
    },

    /**
     * Adds specified employees to waiting room.
     * @param assignments
     */
    addEmployeeWaiting: function(assignments) {
        for (var i = 0; i < assignments.length; i++) {
            this.updateEmployeesWaiting(assignments[i]);
        }
        this.refreshEmployeeWaitingPanel();
    },

    /**
     * Called from the asset panel when the user clicks on the Remove button.
     * @param record
     */
    onRemoveEmployeeWaiting: function(record) {
        var assignment = this.createEmployeeAssignmentFromDrawingRecord(record);
        this.removeEmployeeWaiting(assignment);
        this.refreshEmployeeWaitingPanel();
        this.trigger('app:space:express:console:removeEmployeeWaiting', assignment);
    },

    /**
     * Called when the user removes a pending assignment.
     */
    removeAssignment: function(assignment) {
        this.removeEmployeeWaiting(assignment);
        this.refreshEmployeeWaitingPanel();
        var rooms = this.getAssignedRoom(assignment);
        if (this.mode == 'spaceMode') {
        	this.assignedRooms.removeRoom(assignment);
        } else {
        	this.movedEmployeesRooms.removeRoom(assignment);
        	this.drawingPanel.selectAssets(rooms);
        }
        this.drawingPanel.unselectAssets(rooms);
    },
    
    /**
     * Obtain a rooms array from assignment.
     */
    getAssignedRoom: function(assignment) {
    	var rooms = [];
    	var room  = [];
    	room[0] = assignment.bl_id;
    	room[1] = assignment.fl_id;
    	room[2] = assignment.rm_id;
    	rooms.push(room);
    	return rooms;
    },
    
    /**
     * Obtain a rooms array from room.
     */
    getAssetForRoom: function(room) {
    	var rooms = [];
    	var roomArray  = [];
    	roomArray[0] = room.bl_id;
    	roomArray[1] = room.fl_id;
    	roomArray[2] = room.rm_id;
    	rooms.push(roomArray);
    	return rooms;
    },

    /**
     * Immediately unassigns specified employees. If there are pending assignments for some employees, removes them.
     * @param assignments
     */
    unassignEmployees: function(assignments) {
        for (var i = 0; i < assignments.length; i++) {
            this.removeEmployeeWaiting(assignments[i]);
        }
        this.refreshAssetPanel();
    },

    showSelectDateBar: function(isShow) {
		if ( jQuery("#drawingPanel_selectDateBar") ) {
			if (isShow){
				jQuery("#drawingPanel_selectDateBar").removeClass("x-hide-display");
				jQuery("#filterFloor").removeClass("x-hide-display");
			}
			else {
				jQuery("#drawingPanel_selectDateBar").addClass("x-hide-display");
				jQuery("#filterFloor").addClass("x-hide-display");
			}

			// kb#3052542: every time show/hide the 'Select Date' in drawing's toolbar, uncheck the 'Show Available Floors' checkbox and clear that restriction from the Locations grid.
			if ( $("filterFloorCheckbox") ) {
				$("filterFloorCheckbox").checked = false;
				this.trigger('app:space:express:console:clearFilterFloorForTeamAssign', this.selectDateStart, this.selectDateEnd);
			}			
		}
	},
    
	/**
     * clear assignment mode.
     */
    clearAssignmentTarget: function(isTeamAssignMode) {
		// 23.1 when quit from team assign mode, hide the Fiter floor check box and restore the selections of highlight/labels
		this.showSelectDateBar(false);

		if ( isTeamAssignMode ) {
			this.restoreSelectionForTeamAssignMode();
		 }

        this.assignmentTarget = null;
        if (this.mode === 'spaceMode') {
        	this.assignedRooms = new Ab.space.express.console.Rooms();
        } else {
        	this.movedEmployeesRooms = new Ab.space.express.console.Rooms();
        }
    },
    
    /**
     * Called after the assignment has been initialized.
     */
    afterBeginAssignment: function(assignmentTarget, pendingAssignments) {
        this.pendingAssignments = pendingAssignments;
        this.setToAssign(assignmentTarget);
        this.assignmentTarget = assignmentTarget;
    },

    /**
     * Called after the user has selected a different assignment target (e.g. another department).
     * @param assignmentTarget
     */
    afterChangeAssignmentTarget: function(assignmentTarget) {
        this.assignmentTarget = assignmentTarget;
        this.setToAssign(assignmentTarget);
    },

    /**
     * Sets the assignment target for the drawing control.
     * @param assignmentTarget
     */
    setToAssign: function(assignmentTarget) {
		//For 23.1 Team Space
		if (	 assignmentTarget.type === 'team' ){
			if ( $('drawingPanel_selectDateBar') ){
				this.showSelectDateBar(true);
			} else {
				this.appendSelectDateToActionBar();
			}
		} 
		else if ( $('drawingPanel_selectDateBar') ) {
			this.showSelectDateBar(false);
		}

        if (this.drawingPanel.getDrawingControl() && this.drawingPanel.dwgLoaded) {
        	if (assignmentTarget.type === 'division') {
        		this.drawingPanel.setToAssign("rm.dv_id", assignmentTarget.dv_id);
        	} else if (assignmentTarget.type === 'department') {
                 this.drawingPanel.setToAssign("rm.dp_id", assignmentTarget.dp_id);
            } else if (assignmentTarget.type === 'category') {
                this.drawingPanel.setToAssign("rm.rm_cat", assignmentTarget.rm_cat);
            } else if (assignmentTarget.type === 'type') {
                this.drawingPanel.setToAssign("rm.rm_type", assignmentTarget.rm_type);
            } else if (assignmentTarget.type === 'standard') {
            	this.drawingPanel.setToAssign("rm.rm_std", assignmentTarget.rm_std);
            } else if(assignmentTarget.type === 'team') {
            	this.drawingPanel.setToAssign("rm.team_id", assignmentTarget.team_id);
            }
        }

		if(assignmentTarget.type === 'team') {
			this.setDrawingForTeamAssignMode();
		}
    },
    
    /**
     *	Added for 23.1: logics for team assign functionality, by ZY, 2016-01-19. 
	 *		- When the user clicks any Assign button in the Teams window, a form appears above the drawing control that asks the user for a Date Range. 
	 *		- The drawing control will display a checkbox called ��Show Available Floors�� when the user is in Assignment mode for teams. 
     */
    setDrawingForTeamAssignMode: function() {
		this.setSelectionForTeamAssignMode();

		// in case assign different team,  re-highlight previous selected rooms
		if (this.assignedRooms.length > 0) 
			this.reHighlightPendingAssignments();
       	//this.reHighlightSelectedAssets();
	},

	/**
	 *  Added for 23.1: logics for team assign functionality, by ZY, 2016-01-19.
     *		- This will filter the Locations list for floors that have enough available capacity to satisfy the team��s target ratio.  
	 *		- The purpose of this is to give the user a quick way of finding floors that have room for the team without requiring the user to split the team into multiple floors.
	 */
	bindEventsForFilterFloorCheckBox: function() {
		//Bind text changed event.
		var thisController = this;
		jQuery('#filterFloorCheckbox').on('change', function() {  
			var isChecked = jQuery("#filterFloorCheckbox")[0].checked;
			if (isChecked) {
				var requiredFloorCapcity = thisController.calculateRequiredFloorCapcity();
				thisController.trigger('app:space:express:console:filterFloorsForTeamAssign', thisController.selectDateStart, thisController.selectDateEnd, requiredFloorCapcity);
			} else {
				thisController.trigger('app:space:express:console:clearFilterFloorForTeamAssign', thisController.selectDateStart, thisController.selectDateEnd);
			}
		});
	},

	/**
     *	Added for 23.1: logics for team assign functionality, by ZY, 2016-01-21. 
	 *	  -	Determine the number of additional seats that the team requires to meet the target seat ratio. 
     */
    calculateRequiredFloorCapcity: function() {
		var teamId = this.assignmentTarget.team_id;
		View.dataSources.get('teamsDS').addParameters(this.filter.parameters);
		var teamRecord = View.dataSources.get('teamsDS').getRecord("team_properties.team_id='"+teamId+"'");
		if (teamRecord) {
			var emCount = teamRecord.getValue('team_properties.vf_em_count');
			var ratio = teamRecord.getValue('team_properties.em_seat_ratio_tgt');
			var cap = teamRecord.getValue('team_properties.vf_cap_em');
			if ( ratio==0 ){
				return 0;
			} else {
				var requiredCap = emCount/ratio - cap;
				return Math.ceil(requiredCap);
			}
		} else {
			return 0;
		}
	},	

    /**
	*  Added for 23.1: logics for team assign functionality, by ZY, 2016-01-19.
     *		- While in Team Assignment mode, the Highlights drop-down will switch to None, and cannot be changed to a different highlight.  
	 *		- The Labels drop-down will automatically switch to Teams when the user is Assignment Mode, but the label must be modified to account for the date range.  The label will display the team code and date range o all teams that occupy a room during the selected date range.
	 *		- The Teams border will also check for all team assigning to rooms during the selected date range.  If multiple teams occupy a room during the date range, then use a dark grey color for the border.
	 *		- The user can choose different labels or borders while in assignment mode.
     */
	setSelectionForTeamAssignMode: function() {
		this.drawingPanel.changeDataSourceSelector('highlight', 'None');
		this.drawingPanel.changeDataSourceSelector('labels', 'labelTeamsDs');

		try{
			if (!this.originalHighlightTeamDs){
				this.originalHighlightTeamDs = View.dataSources.get('highlightTeamDs');
				this.originalLabelTeamDs = View.dataSources.get('labelTeamsDs');
			}

			var teamAssignHighlightDs = this.loadTeamAssignDatasourceFromFile('highlightTeamOccupancyDs');
			var teamAssignLabelDs = this.loadTeamAssignDatasourceFromFile('labelTeamsAssignDs');
			var teamAssignLegendDs = this.loadTeamAssignDatasourceFromFile('legendTeamsAssignDs');
			
			//23.1 TODO: need to apply restrictions of filter on datasource
	    	//		realLegendDs.addParameters(this.filter.parameters);
	    	//		realLegendDs.setRestriction(this.filter.restriction);
			
			//XXX: add new dataSources to View.dataSources for usage of printReport()   
			View.dataSources.add('highlightTeamDs', teamAssignHighlightDs);
			View.dataSources.add('labelTeamsDs', teamAssignLabelDs);
			View.dataSources.add('legendTeamsAssignDs',teamAssignLegendDs);
			
			this.drawingPanel.currentHighlightDS = 'highlightTeamDs';
			this.drawingPanel.currentBordersHighlightDS = 'highlightTeamDs';
			this.drawingPanel.currentLabelsDS = 'labelTeamsDs';
			this.appendRuleSetForTeamAssignMode();
			//this.drawingPanel.ruleSets.add("highlightTeamDs", this.drawingPanel.ruleSets.get('highlightEmployeesDs'));

			this.drawingPanel.refresh();
		} catch(e) {
			Workflow.handleError(e);
		}

		document.getElementById('selector_IBorders').value = 'None';
		document.getElementById('selector_IBorders').disabled = true;
		document.getElementById('selector_hilite').disabled = true;
	},

	loadTeamAssignDatasourceFromFile: function(dsId) {
			var teamAssignDsFile = 'ab-sp-console-ds-team-assign.axvw';
			var teamAssignDs = View.dataSources.get(dsId);
			if ( !teamAssignDs ) {
				//loadDataSourceFromFile will add the datasource to View.dataSources array.
				teamAssignDs = new Ab.data.loadDataSourceFromFile(teamAssignDsFile, dsId);
				teamAssignDs.fromFile = teamAssignDsFile;
			}

			teamAssignDs.addParameter("selectDateStart", this.selectDateStart);
			if (this.selectDateEnd) {
				teamAssignDs.addParameter("selectDateEnd", this.selectDateEnd);
			} else {
				teamAssignDs.addParameter("selectDateEnd", '2900-01-01');
			}
			return teamAssignDs;
	},

	/**
	*  Added for 23.1: logics for team assign functionality, by ZY, 2016-01-19.
    *		- While in Team Space Room Assignment mode, the floor plan will highlight rooms based on occupancy; while also accounting for existing team assignments in the chosen date range. This is a special type of highlight that is not available anywhere else in the Space Console (it does not appear in the Highlights drop-down).
     *  Set the highlight rule for team occupancy datasource.
     */
    appendRuleSetForTeamAssignMode: function() {
		var ruleset = new DwgHighlightRuleSet();
    	ruleset.appendRule("rm.teamOccupancy", "0", "DBDBDB", "==");//gray    	:Not Assignable
        ruleset.appendRule("rm.teamOccupancy", "1", "4DFF4D", "==");//green      :Vacant
        ruleset.appendRule("rm.teamOccupancy", "2", "4D4DFF", "==");//blue       :Available
        ruleset.appendRule("rm.teamOccupancy", "3", "FFFF4D", "==");//yellow     :At Capacity
        ruleset.appendRule("rm.teamOccupancy", "4", "FF4D4D", "==");//red        :Exceeds Capacity
		this.drawingPanel.appendRuleSet("highlightTeamDs", ruleset);
    },
    
	restoreSelectionForTeamAssignMode: function() {
		document.getElementById('selector_hilite').disabled = false;
		document.getElementById('selector_IBorders').disabled = false;

		View.dataSources.add('highlightTeamDs', this.originalHighlightTeamDs);
		View.dataSources.add('labelTeamsDs', this.originalLabelTeamDs);

		document.getElementById('selector_IBorders').value = 'highlightTeamDs';
		this.drawingPanel.changeDataSourceSelector('labels', 'labelTeamsDs');
		this.drawingPanel.changeDataSourceSelector('highlight', 'highlightTeamDs');

		this.drawingPanel.currentHighlightDS = 'highlightTeamDs';
		this.drawingPanel.currentLabelsDS = 'labelTeamsDs';

        this.doAppendRuleSet();
		// this.drawingPanel.refresh();
		//kb#3051870: update as of date with selected date_start back.
		if ( this.selectDateStart && this.asOfDate != this.selectDateStart ) {
			//also need to set new as of date back to filter in location view and do filter.
 			this.trigger('app:space:express:console:asOfDateUpdate', this.selectDateStart);
		}
	},

	showSelectDateForm: function(el) {
		if ( this.selectDateStart ) {
			this.selectDateForm.setFieldValue('team.date_start', this.selectDateStart);
		} 
		else {
			this.selectDateForm.setFieldValue('team.date_start', '');
		}

		if ( this.selectDateEnd ) {
			this.selectDateForm.setFieldValue('team.date_end', this.selectDateEnd);
		} 
		else {
			this.selectDateForm.setFieldValue('team.date_end', '');
		}

		this.selectDateForm.newSelectDateStart=this.selectDateStart;
		this.selectDateForm.newSelectDateEnd=this.selectDateEnd;

        this.selectDateForm.showInWindow({
            anchor: el,
            width: 600,
            height: 250,
            title: getMessage('selectDateTitle'),
			closable: false,
			modal: true
        });
	},

	/**
	*  Added for 23.1: logics for team assign functionality, by ZY, 2016-01-19.
     *		- If the user changes the Start Date or End Date field while there are pending assignments, and click the 'Show' button, then generate a warning message:
	 *		- 'WARNING: changing the date range will remove all pending Team Space assignments.  Do you wish to continue?' [OK/Cancel]
	 *		- If the user clicks OK, the system will clear out any pending assignments.
     */
    selectDateForm_onShow: function() {
		if ( this.selectDateForm.newSelectDateEnd && this.selectDateForm.newSelectDateEnd<this.selectDateForm.newSelectDateStart) {
			View.alert(getMessage("selectDateError"));
			return;
		}

		var isDateChanged = ( this.selectDateForm.newSelectDateStart!=this.selectDateStart || this.selectDateForm.newSelectDateEnd!=this.selectDateEnd );
		if ( isDateChanged ){
			if ( this.pendingAssignments && this.pendingAssignments.length>0 ){
				var thisController = this;
				View.confirm(getMessage("changeDate"), function(result) {
					if (result === 'yes') {
						thisController.trigger('app:space:express:console:clearPendingAssignments');
						thisController.selectDateStart = thisController.selectDateForm.newSelectDateStart; 
						thisController.selectDateEnd = thisController.selectDateForm.newSelectDateEnd; 
						var showButtonTitle = getMessage("highlightFrom")+" "+thisController.selectDateStart+(thisController.selectDateEnd? (" "+getMessage("highlightTo")+" "+thisController.selectDateEnd):" ");
						$('showButton').innerText = showButtonTitle;
						thisController.setSelectionForTeamAssignMode();
					} else {
						return;
					}
				});
			} else {
				this.selectDateStart = this.selectDateForm.newSelectDateStart; 
				this.selectDateEnd = this.selectDateForm.newSelectDateEnd; 
				var showButtonTitle = getMessage("highlightFrom")+" "+this.selectDateStart+(this.selectDateEnd? (" "+getMessage("highlightTo")+" "+this.selectDateEnd):" ");
				$('showButton').innerText = showButtonTitle;
				this.setSelectionForTeamAssignMode();
			}
		}
		this.selectDateForm.closeWindow();
	},
		
	/**
	*  Added for 23.1: logics for team assign functionality, by ZY, 2016-01-19.
     *		- store the changed select date start and date end.
     */
	onSelectDateChange: function(field) {
		if ('selectDateForm_team.date_start'===field.id){
			this.selectDateForm.newSelectDateStart = this.selectDateForm.getFieldValue('team.date_start'); 
		} else {
			this.selectDateForm.newSelectDateEnd = this.selectDateForm.getFieldValue('team.date_end'); 
		}
	},

	/**
     * Called after the assignment has been canceled or committed.
     */
    afterClearAssignment: function(isTeamAssignMode) {
    	this.employeesWaiting = [];
    	this.drawingPanel.getSidecar().set('employeesWaiting', this.employeesWaiting);
    	this.drawingPanel.getSidecar().save();

		this.assignedRooms = new Ab.space.express.console.Rooms();
        if(this.mode == 'employeeMode') {
        	this.refreshEmployeeWaitingPanel();
        }
    	this.assignmentTarget = null;
        if (this.drawingPanel.dwgLoaded) {
        	//after clear button, change back the previous drawing click statues.
        	this.drawingPanel.clearAssignCache(false);
            this.afterCommitPendingAssignment(isTeamAssignMode);
            
            //hide asset panel if it's spaceMode.
            if (this.mode === 'spaceMode') {
            	this.hideAssetPanel();
            }
        }
    },

    /**
     * Return a created assignment form drawing record.
     */
    createEmployeeAssignmentFromDrawingRecord: function(record) {
        var assignment = {
            type: 'employee',
            to_bl_id: '',
            to_fl_id: '',
            to_rm_id: ''
        };

        if (!record.from) {
            record.from = record;
        }

        for ( var i = 0; i < record.from.length; i++ ) {
            switch (record.from[i].name) {
                case 'em.em_id':
                    assignment.em_id = record.from[i].value;
                    break;
                case 'em.bl_id':
                case 'rm.bl_id':
                    assignment.bl_id = record.from[i].value;
                    break;
                case 'em.fl_id':
                case 'rm.fl_id':
                    assignment.fl_id = record.from[i].value;
                    break;
                case 'em.rm_id':
                case 'rm.rm_id':
                    assignment.rm_id = record.from[i].value;
                    break;
                case 'em.location':
                	var location = record.from[i].value;
                	this.setLocationToAssignment(assignment, record, location);
                	break;
            }
        }

        if (record.to) {
            for ( var i = 0; i < record.to.length; i++ ) {
                switch (record.to[i].name) {
                    case 'rm.bl_id':
                        assignment.to_bl_id = record.to[i].value;
                        break;
                    case 'rm.fl_id':
                        assignment.to_fl_id = record.to[i].value;
                        break;
                    case 'rm.rm_id':
                        assignment.to_rm_id = record.to[i].value;
                        break;
                }
            }
        }
        return assignment;
    },
    
    /**
     * Set location bl_id fl_id and rm_id to assignment.
     */
    setLocationToAssignment: function(assignment,record,location) {
    	if (location&&location.indexOf("-")!=-1) {
    		var locatioins = location.split("-");
    	}
        assignment.bl_id = locatioins[0];
        assignment.fl_id = locatioins[1];
        assignment.rm_id = locatioins[2];
    },
    
    /**
     * When a room is over capacity, the assignment should be canceled.
     */
    rollbackEmployeeAssignment: function(room) {
    	if (this.movedEmployeesRooms.findRoom(room)) {
    		this.movedEmployeesRooms.removeRoom(room);
    	}
    	this.drawingPanel.clearPersistFills();
        this.drawingPanel.refresh();
        this.reHighlightSelectedAssets.defer(1, this);
    },
    
    /**
     * view selected rooms in a pop up window.
     */
    drawingPanel_onViewDetails: function() {
        var anchor = this.drawingPanel.actionbar.toolbar.el.dom;
        this.trigger('app:space:express:console:viewSelectedRooms', anchor, this.asOfDate);
    },
    
    /**
     * Commit the assignment to WFR.
     */
    drawingPanel_onCommitPendingAssignments: function() {
		this.trigger('app:space:express:console:commitAssignment');
    },
    
    /**
     * We clear assignment target,clear drawing panel fills and refresh after the user commit pending assignments.
     */
    afterCommitPendingAssignment: function(isTeamAssignMode) {
    	this.clearAssignmentTarget(isTeamAssignMode);
     	this.drawingPanel.clearPersistFills();
        this.drawingPanel.refresh();
    },
   
    /**
     * Cancel the pending assignments.
     */
    drawingPanel_onCancelPendingAssignments: function() {
    	this.clearAssignmentTarget();
    	this.drawingPanel.clearPersistFills();
        this.drawingPanel.refresh();
        
        this.employeesWaiting = [];
    	this.drawingPanel.getSidecar().set('employeesWaiting', this.employeesWaiting);
    	this.drawingPanel.getSidecar().save();
        this.trigger('app:space:express:console:cancelAssignment');
    },
    
    /**
     * view the pending assignments in a popup window.
     */
    drawingPanel_onViewPendingAssignments: function() {
        var anchor = this.drawingPanel.actionbar.toolbar.el.dom;
        this.trigger('app:space:express:console:viewAssignment', anchor);
    },
    
    /**
     * cancel the selected rooms when click the Clear button.
     */
    drawingPanel_onCancelSelectedRooms: function() {
    	this.drawingPanel.clearPersistFills();
    	this.selectedRooms = new Ab.space.express.console.Rooms();
    	this.drawingPanel.refresh();
    	this.trigger('app:space:express:console:cancelSelectedRooms');
    },

	/**
     * Export the floors to paginate report.
     */
    onExportDrawing: function(exportType) {
		var me=this;
		if  ( this.locationsGrid.rows.length>10 ){
			View.confirm(getMessage("muchFloors"), function(result) {
				if (result == 'yes') {
					me.exportDrawing(exportType);
				} else {
					return;
				}
			});
		} 
		else {
			this.exportDrawing(exportType);
		}
    },
    
	exportDrawing:function(exportType){
		if (exportType == 'pdf') {
			this.onExportingDrawingPdf();
		} else if (exportType == 'docx') {
			this.onExportingDrawingDOCX();
		} else {
			View.showMessage( getMessage("notSupportedExportingFormat") );
		}		
	},
	
	/**
     * Export the drawings in the location list to pdf format.
     */
    onExportingDrawingPdf: function(parameters) {
    	if ("None" == this.drawingPanel.currentHighlightDS) {
    		View.showMessage( getMessage("noHighlight") );
    	} else {
    		//this.trigger('app:space:express:console:printPDF', this.filter, this.drawingPanel, this.selectedFloors, parameters);
    		var controller = View.controllers.get('spaceExpressConsoleDrawingExportCtrl');
    		controller.printReport(this,'pdf', parameters);
    	}
    },
    
    /**
     * Export the drawings in the location list to docx format.
     */
    onExportingDrawingDOCX: function() {
    	if ("None" == this.drawingPanel.currentHighlightDS) {
    		View.showMessage( getMessage("noHighlightDOCX") );
    	} else {
    		this.trigger('app:space:express:console:printDOCX', this);
    	}
    },
    
    /**
     * Open print option dialog for users to control print parameters.
     */
    openPrintOptionDialog: function() {
    	var thisController = this;
    	var printOptionDialog = View.openDialog("ab-sp-console-print-option-dialog.axvw", null, true, {
    		width:900,
    		height:600,
    		collapsible: false,
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get("printOptionDialogController");
    			dialogController.callback = thisController.printOptionDialogCloseHandler.createDelegate(thisController);
    			dialogController.selectedPlanType = thisController.selectedPlanType;
    			dialogController.legendDataSource  = thisController.currentLegendDataSource;
    			dialogController.legendPanel = thisController.currentLegendPanel;
    			dialogController.selectionValues = thisController.selectionValues;
    		}
    	});
    },
    
	/**
     * When close the print option dialog and start to export pdf report.
     */
    printOptionDialogCloseHandler: function(parameters) {
		var me=this;
		if  ( this.locationsGrid.rows.length>10 && ( parameters.selectionValues['zoomedInOption']==='no') ){
			View.confirm(getMessage("muchFloors"), function(result) {
				if (result == 'yes') {
					me.onExportingDrawingPdf(parameters);
				} else {
					return;
				}
			});
		} 
		else {
			this.onExportingDrawingPdf(parameters);
		}

		this.selectionValues = parameters.selectionValues;
    },

    /**
     * Open the plan types dialog to allow the users to select plan types option. 
     */
    openPlanTypesDialog: function() {
    	var thisController = this;
    	var planTypesDialog = View.openDialog("ab-sp-console-plan-types-dialog.axvw", null, true, {
    		width:500,
    		height:160,
    		collapsible: false,
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get("planTypesGroupDialogController");
    			dialogController.callback = thisController.openPlanTypesDialogCloseHandler.createDelegate(thisController);
    			dialogController.initialOptionValue = thisController.selectedPlanType;
    		}
    	});
    },
    
    /**
     * Highlight by plan type.
     */
    openPlanTypesDialogCloseHandler: function(planType) {
    	if (planType != 'none') {
    		this.selectedPlanType = planType;
    		var activePlanTypeDs = View.dataSources.get('activePlanTypesDS');
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause('active_plantypes.plan_type', planType, '=');
    		var records = activePlanTypeDs.getRecords(restriction);
    		if(records.length > 0) {
	    		var viewFile = records[0].getValue('active_plantypes.view_file');
	    		var highlightDsId = records[0].getValue('active_plantypes.hs_ds');
	    		var labelDsId = records[0].getValue('active_plantypes.label_ds'); 
	    		var legendDsId = records[0].getValue('active_plantypes.legend_ds');

	    		this.currentLegendDataSource = legendDsId;
	    		this.currentLegendPanel = legendDsId + '_panel'; 
	    		
	    		//this.drawingPanel.setDataSource('highlight', 'None');
	    		//this.drawingPanel.setDataSource('labels', 'None');
	    		//XXX: new changeDataSourceSelector() will just change the values without invoking unnecessary refresh call
	    		this.drawingPanel.changeDataSourceSelector('highlight', 'None');
	    		this.drawingPanel.changeDataSourceSelector('labels', 'None');
	    		
	    		try{
	    			var realHighlightDs = View.dataSources.get(highlightDsId);
	    			if(!realHighlightDs) {
	    				//loadDataSourceFromFile will add the datasource to View.dataSources array.
	    				realHighlightDs = new Ab.data.loadDataSourceFromFile(viewFile, highlightDsId);
	    				realHighlightDs.fromFile = viewFile;
	    			}
	    			realHighlightDs.addParameters(this.filter.parameters);
	    			realHighlightDs.setRestriction(this.filter.restriction);
	    			
	    			var realLabelDs = View.dataSources.get(labelDsId);
	    			if(!realLabelDs) {
	    				realLabelDs = new Ab.data.loadDataSourceFromFile(viewFile, labelDsId);
	    				realLabelDs.fromFile = viewFile;
	    			}
	    			realLabelDs.addParameters(this.filter.parameters);
	    			realLabelDs.setRestriction(this.filter.restriction);
	    			
	    			var realLegendDs = View.dataSources.get(legendDsId);
	    			if (!realLegendDs) {
	    				realLegendDs = new Ab.data.loadDataSourceFromFile(viewFile, legendDsId);
	    				realLegendDs.fromFile = viewFile;
	    			}
	    			realLegendDs.addParameters(this.filter.parameters);
	    			realLegendDs.setRestriction(this.filter.restriction);
	    			
	    			//XXX: add new dataSources to View.dataSources for usage of printReport()   
	    			View.dataSources.add(highlightDsId, realHighlightDs);
	    			View.dataSources.add(labelDsId, realLabelDs);
	    			View.dataSources.add(legendDsId,realLegendDs);
	    			
		    		this.drawingPanel.currentHighlightDS = highlightDsId;
		    		this.drawingPanel.currentLabelsDS = labelDsId;
		    		this.drawingPanel.refresh();
	    		} catch(e) {
	    			Workflow.handleError(e);
	    		}
    		}
    	}  else if (planType == 'none') {
			this.selectedPlanType = null;
			this.drawingPanel.currentHighlightDS = 'None';
			this.drawingPanel.currentLabelsDS = 'None';
			this.drawingPanel.refresh();
		}
    },
    
    /**
     * Open the background dialog to allow the user to select background option.
     */
    openBackgroundDialog: function() {
    	var thisController = this;
    	var backgroundLayerDialog = View.openDialog("ab-sp-console-background-layer-dialog.axvw", null, true, {
    		width:650,
    		height:160,
    		collapsible: false,
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get("backgroundLayerSelectController");
    			dialogController.callback = thisController.backgroundLayerDialogCloseHandler.createDelegate(thisController);
    			dialogController.initialOptionValue = thisController.backgroundOptionValue;
    		}
    	});
    },
    
    /**
     * Add background layer to the flash drawing.
     */
    backgroundLayerDialogCloseHandler: function(parameters) {
    	// store selected background file suffix as well as option value
		this.backgroundSuffix = parameters['rule_suffix'];
    	this.backgroundOptionValue = parameters['rule_id'];

    	// before clear the drawing panel, store selected floor-rows
    	var checkedLocation = this.locationsGrid.getSelectedRows();
    	
		// clear the drawing panel
		this.trigger('app:space:express:console:unselectfloors');

    	// re-check the previously cleared floor-rows as well as to show them in the drawings
		for (var i=0; i<checkedLocation.length; i++) {
			var row = checkedLocation[i];
			row.row.select(true);
			this.trigger('app:space:express:console:selectLocation', row);
		}
    },

    /**
     * Added for 23.1: according to current status of the teams tab, show/hide related options of Highlight/Label/Border for team space.
     */
    enableTeamSpace: function(enabled) {
		this.isTeamSpaceEnabled = enabled;
		this.showHighlightSelections(enabled);
    }	
});

/**
 * Set legend text according the legend level value.
 * @param {Object} row
 * @param {Object} column
 * @param {Object} cellElement
 */
function setLegendLabel(row, column, cellElement) {
    var value = row[column.id];
    if (column.id == 'legend.value' && value != '') {
        var text = value;
        switch (value) {
        	case '0':
        		text = getMessage('legendLevel0');
        		break;
            case '1':
                text = getMessage('legendLevel1');
                break;
            case '2':
                text = getMessage('legendLevel2');
                break;
            case '3':
                text = getMessage('legendLevel3');
                break;
            case '4':
                text = getMessage('legendLevel4');
                break;
        }
        var contentElement = cellElement.childNodes[0];
        if (contentElement)
         contentElement.nodeValue = text;
    }
}
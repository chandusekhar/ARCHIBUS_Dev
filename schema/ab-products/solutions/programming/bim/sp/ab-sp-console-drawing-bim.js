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
     * The array of {bl_id, fl_id} for displayed floors.
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
	 * The element for the check box of show room standard.
	 */
	openRoomStandardAction:null,
	
	/**
	 * An action element copy of room standard for performance.
	 */
	copyOfRoomStandardElement:null,

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
        this.lastFilter = {restriction: null,parameters: {}};
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
        this.on('app:space:express:console:cancelSelectedRooms', this.cancelSelectedRooms);
        this.on('app:space:express:console:cancelEmployeeAssignment', this.cancelEmployeeAssignment);
        this.on('app:space:express:console:commitRoomsAlteration', this.afterCommitRoomsAlteration);
        this.on('app:space:express:console:rollbackEmployeeAssignment', this.rollbackEmployeeAssignment);
        this.on('app:space:express:console:afterCommitPendingAssignment', this.afterCommitPendingAssignment);
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
    		if(Ext.isIE) {
    			this.refreshAssetPanel.defer(2000, this);
    		}
    		this.refreshEmployeeWaitingPanel.defer(2500, this);
    	}
    },
    
    /**
     * Set the highlight rule for employee datasource.
     */
    doAppendRuleSet: function() {
		var ruleset = new DwgHighlightRuleSet();
    	ruleset.appendRule("rm.count_em", "0", "DBDBDB", "==");//gray    	:Not Assignable
        ruleset.appendRule("rm.count_em", "1", "4DFF4D", "==");//green      :Vacant
        ruleset.appendRule("rm.count_em", "2", "4D4DFF", "==");//blue       :Available
        ruleset.appendRule("rm.count_em", "3", "FFFF4D", "==");//yellow     :At Capacity
        ruleset.appendRule("rm.count_em", "4", "FF4D4D", "==");//red        :Exceeds Capacity
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
        this.trigger('app:space:express:console:cancelSelectedRooms');
        for ( var i = 0; i < View.dataSources.length; i++ ) {
            var ds = View.dataSources.get(i);
            if (ds.type === 'DrawingControlHighlight') {
                ds.addParameters(this.filter.parameters);
                ds.setRestriction(this.filter.restriction);
            }
        }
        if (this.drawingPanel.dwgLoaded) {
        	this.drawingPanel.clearPersistFills();
        	this.drawingPanel.refresh();
        }
    },
    

    /**
     * Set the filter value to that comes from the location filter console.
     */
    setFilter: function(filter) {
        if (filter) {
            this.filter = filter;
        } else {
        	if (this.filter == null) {
        		this.filter = {
                        restriction: null,
                        parameters: {}
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
        this.drawingPanel.addDrawing(row, null);
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
		if (this.drawingPanel.dwgLoaded) {
    		for (var i = 0; i < View.dataSources.length; i++) {
                var ds = View.dataSources.get(i);
                if (ds.type === 'DrawingControlHighlight') {
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
    },
    
    /**
     * ReHighlight all the selected assets according to types.
     * add by heqiang
     */
    reHighlightSelectedAssets: function() {
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
     * Event handler when click room in the drawing panel
     * @param {Object} pk
     * @param {boolean} selected
     */
    onClickRoom: function(pk, selected) {
        var room = { bl_id: pk[0], fl_id: pk[1], rm_id: pk[2] };
        
        if (this.mode === 'spaceMode') {
        	this.onClickRoomInSpaceMode(room, selected);
        } else {
        	this.onClickRoomInEmployeeMode(room, selected);
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
    		/*if (this.checkRoomIfNonOccupiable(room, selected)) {
    			var innerThis = this;
    			View.confirm(getMessage('assignedRoomIsNonOccupiable'), function(button) {
    				if (button == 'yes') {
    					innerThis.processAssignEmployees(room, selected);
    					innerThis.updateLocalRoomForReHighlight(innerThis.movedEmployeesRooms, room, selected);
    				}
    			});
    		} else {*/
    			this.processAssignEmployees(room, selected);
        		this.updateLocalRoomForReHighlight(this.movedEmployeesRooms, room, selected);
    		//}
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
    
    /**
     * clear assignment mode.
     */
    clearAssignmentTarget: function() {
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
            }
        }
    },
    
    /**
     * Called after the assignment has been canceled or committed.
     */
    afterClearAssignment: function() {
    	this.employeesWaiting = [];
        this.assignedRooms = new Ab.space.express.console.Rooms();
        if(this.mode == 'employeeMode') {
        	this.refreshEmployeeWaitingPanel();
        }
    	this.assignmentTarget = null;
        if (this.drawingPanel.dwgLoaded) {
        	//after clear button, change back the previous drawing click statues.
        	this.drawingPanel.clearAssignCache(false);
            this.afterCommitPendingAssignment();
            
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
        this.trigger('app:space:express:console:viewSelectedRooms', anchor);
    },
    
    /**
     * Commit the assignment to WFR.
     */
    drawingPanel_onCommitPendingAssignments: function() {
    	if (this.mode == 'employeeMode' && confirmClearWaitingRoom()) {
    		var currentPendingAssignments = this.drawingPanel.getSidecar().get('pendingAssignments');
    		var overCapacityRooms = abSpConsole_getOverAssignmentRooms(currentPendingAssignments);
    		if (overCapacityRooms.length > 0) {
    			/*var innerThis = this;
    			View.confirm(abSpConsole_getOverCapacityWarningMessage(overCapacityRooms), function(button) {
    				if(button == 'yes') {
    					innerThis.trigger('app:space:express:console:commitAssignment');
    					innerThis.afterCommitPendingAssignment();
    				}
    			});*/
    			alert(abSpConsole_getOverCapacityWarningMessage(overCapacityRooms));
    		} else {
    			this.trigger('app:space:express:console:commitAssignment');
				this.afterCommitPendingAssignment();
    		}
    	} else {
    		this.trigger('app:space:express:console:commitAssignment');
        	this.afterCommitPendingAssignment();
    	}
    },
    
    /**
     * We clear assignment target,clear drawing panel fills and refresh after the user commit pending assignments.
     */
    afterCommitPendingAssignment: function() {
    	this.clearAssignmentTarget();
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
    onExportingDrawingPdf: function() {
    	if ("None" == this.drawingPanel.currentHighlightDS) {
    		View.showMessage( getMessage("noHighlight") );
    	} else if ("highlightRoomStandard" == this.drawingPanel.currentHighlightDS || "labelRoomStandardDs" == this.drawingPanel.currentLabelsDS) {
    		View.showMessage( getMessage("noHighlightOnRoomStandard") );
    	} else {
    		this.trigger('app:space:express:console:printPDF', this.filter, this.drawingPanel, this.selectedFloors);
    	}
    },
    
    /**
     * Export the drawings in the location list to docx format.
     */
    onExportingDrawingDOCX: function() {
    	if ("None" == this.drawingPanel.currentHighlightDS) {
    		View.showMessage( getMessage("noHighlightDOCX") );
    	} else if ("highlightRoomStandard" == this.drawingPanel.currentHighlightDS || "labelRoomStandardDs" == this.drawingPanel.currentLabelsDS) {
    		View.showMessage( getMessage("noHighlightOnRoomStandardDOCX") );
    	} else {
    		this.trigger('app:space:express:console:printDOCX', this.filter, this.drawingPanel, this.selectedFloors);
    	}
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
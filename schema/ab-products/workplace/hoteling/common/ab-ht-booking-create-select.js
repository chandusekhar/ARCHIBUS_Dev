/**
 * @author Jiangtao Guo
 */
var editResourceRowIndex = null;

var editBookingResources = "";

var selectedFloorPlan = null;

var lastClickLocation = null;

function user_form_afterSelect(){
	if(abHtBookingCreateSelectController.isLoaded){
		abHtBookingCreateSelectController.afterSelect();
	}
}

var abHtBookingCreateSelectController = View.createController('abHtBookingCreateSelectController', {
    //employee object that booking for
    employee: null,
    
    tag:true,
    //visitor that booking for
    visitor: null,
    
    abHtBookingCreateSearchController:'',
    
    //all select booking 
    bookings: [],
    
    //flag of who will booking for 1|Yourself, 2|Other Employee, 3|External Visitor
    bookingForWho: 1,
    
    //available rooms return from wfr
    availableRooms: [],
    
    //floor plan tree
    floorTree: null,
	
    res: '',
	
	isLoaded: false,
	
	afterInitialDataFetch: function(){
		this.isLoaded = true;
        this.afterSelect();
        this.bookingAndResourcesTabs.addEventListener('afterTabChange', this.afterBookingAndResourcesTabsChange.createDelegate(this));
    },
    
    /**
     * afterTabChange even handler
     */
    afterBookingAndResourcesTabsChange: function(tabPanel, newTabName){
        if (newTabName = "selectBookingsTab") {
            this.selectBookingGrid.clear();
            addBookingRows();
        }
        
        if (newTabName = "unlimitedResourcesTab") {
            this.selectResourceGrid.clear();
            this.selectResourcesGrid_afterRefresh();
        }
        
    },
    
    afterViewLoad: function(){
        this.selectRoomDrawing.addEventListener('onclick', selectRoomDrawing_onClick);
		this.selectRoomDrawing.addEventListener('onselecteddatasourcechanged', onChangeLableDS);
		this.selectRoomDrawing.addEventListener('ondwgload', this.onDwgLoaded);
		this.ds_ab_ht_booking_create_select_drawing_rmLabel.addParameter('capacity',getMessage('capacity'));
    },
	
    onDwgLoaded: function(){
        setTimeout("highlightRoomByAvailSpace();",100);
    },
    
    afterSelect: function(){
        //initiate
        this.employee = null;
        this.visitor = null;
        this.bookings = [];
        
        //clear grids old values
        if (this.selectRoomDrawing && this.selectRoomDrawing.isLoadDrawing) {
        	//KB3037980, remove the IE check condition
			this.selectRoomDrawing.clear();
            this.selectRoomDrawing.lastLoadedBldgFloor = null;
        }
        this.selectBookingGrid.clear();
        this.selectResourceGrid.clear();
        this.selectBookingGrid.sortEnabled = false;
        this.bookingAndResourcesTabs.selectTab('selectBookingsTab');
        
        //get bookingFor and available rooms from abHtBookingCreateSearchController
        var abHtBookingCreateSearchController = View.getOpenerView().panels.get('tabsFrame').abHtBookingCreateSearchController;
		this.abHtBookingCreateSearchController=abHtBookingCreateSearchController;
        this.bookingForWho = abHtBookingCreateSearchController.bookingForWho;
        this.availableRooms = abHtBookingCreateSearchController.availableRooms;
        
        //build a two level Building-Floor tree 
        this.buldFloorTree();
        
        //show layout and panels by flag bookingForWho
        var leftLayout = View.getLayoutManager('nested_west');
        
        //booking for youself
        if (this.bookingForWho == 1 ) {
            //hidden employee and visitor grid and hidden its layout
            this.selectEmployeeGrid.show(false);
            this.selectVisitorsGrid.show(false);
            var leftLayout = View.getLayoutManager('nested_west');
            if (!leftLayout.isRegionCollapsed('south')) {
                leftLayout.collapseRegion('south');
            }
            
            //set current user to object employee
            this.employee = new Object();
            this.employee.id = View.user.employee.id;
            this.employee.divisionId = View.user.employee.organization.divisionId;
            this.employee.departmentId = View.user.employee.organization.departmentId;
        }
        
        //booking for other employee
        if (this.bookingForWho == 2) {
            //show c panel and hidden visitor panel and show its layout
            this.selectEmployeeGrid.show(true);
            this.selectEmployeeGrid.refresh();
            this.selectVisitorsGrid.show(false);
            if (leftLayout.isRegionCollapsed('south')) {
                leftLayout.expandRegion('south');
            }
        }
        
        //booking for other visitors
        if (this.bookingForWho == 3) {
            //set current user to object employee
            this.employee = new Object();
            this.employee.id = View.user.employee.id;
            this.employee.divisionId = View.user.employee.organization.divisionId;
            this.employee.departmentId = View.user.employee.organization.departmentId;
            //show visitor panel and hidden panel panel and show its layout
            this.selectEmployeeGrid.show(false);
            if (leftLayout.isRegionCollapsed('south')) {
                leftLayout.expandRegion('south');
            }
            //If current user does not belong to group Hoteling Administration then only list available visitors in Select Visitor Grid 
            //for the connected user employee (checks on em_id, dv_id and dp_id and date_start and date_end fields); Else should not restrict.
			var restriction = new Ab.view.Restriction();
		if (!((View.isMemberOfGroup(View.user, 'HOTEL BOOKINGS ALL DEPARTMENTS')) || (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')))) {
		    restriction.addClause("visitors.date_start", abHtBookingCreateSearchController.dateStart, "&lt;=");
			restriction.addClause("visitors.date_end", abHtBookingCreateSearchController.dateEnd, "&gt;=");
			restriction.addClause("visitors.is_authorized", 1, "=");
            restriction.addClause("visitors.em_id", View.user.employee.id, "=","))AND((");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", View.user.employee.organization.departmentId, "=");
		    restriction.addClause("visitors.em_id", '', "=",")OR(");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", View.user.employee.organization.departmentId, "=");
			restriction.addClause("visitors.em_id", '', "=",")OR(");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", '', "=");
			restriction.addClause("visitors.em_id", '', "=",")OR(");
            restriction.addClause("visitors.dv_id", '', "=");
            restriction.addClause("visitors.dp_id", '', "=");
			restriction.addClause("visitors.em_id", View.user.employee.id, "=",")OR(");
            restriction.addClause("visitors.dv_id", '', "=");
            restriction.addClause("visitors.dp_id", '', "=");
			restriction.addClause("visitors.em_id", View.user.employee.id, "=",")OR(");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", '', "=");
            this.selectVisitorsGrid.refresh(restriction);
        }
        else 
            if (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')) {
                this.selectVisitorsGrid.refresh();
            }
            else {
		         restriction.addClause("visitors.date_start", abHtBookingCreateSearchController.dateStart, "&lt;=");
			     restriction.addClause("visitors.date_end", abHtBookingCreateSearchController.dateEnd, "&gt;=");
			     restriction.addClause("visitors.is_authorized", 1, "=");
                 restriction.addClause("visitors.em_id", View.user.employee.id, "=","))AND ((");
				 restriction.addClause("visitors.em_id", '', "=",")OR(");
                 this.selectVisitorsGrid.refresh(restriction);
            }
			 this.res = restriction;
        }
        
        //set default panel title for floor plan drawing panel
        setSelectSpaceDefaultTitle();
    },
    refreshSelectVisitorsGrid:function(){
		this.selectVisitorsGrid.refresh(this.res);
	},
    /**
     * build a two level Building-Floor tree
     */
    buldFloorTree: function(){
        //create tree using Yahoo API
        this.floorTree = new YAHOO.widget.TreeView("divFloorTree");
        //get buiding list from availableRooms array
        var blList = this.getBlList();
        for (var i = 0; i < blList.length; i++) {
            //create building Node
			var blNodeText = "<a class=\"ygtvlabel_pk\" href=\"javascript:void(0);\">"+blList[i]+"</a>";
            var blNode = new YAHOO.widget.TextNode(blNodeText, this.floorTree.getRoot(), false);
            //get floor list of select bulding from availableRooms array
            var flList = this.getFlList(blList[i]);
            for (var j = 0; j < flList.length; j++) {
                //create floor Node and set the onclick event handler 'selectFloorTree_onClick'
                var floorNodeText = "<a class=\"ygtvlabel_pk\" href=\"javascript:void(0);\" onclick=\"selectFloorTree_onClick('" + blList[i] + "','" + flList[j]['fl.fl_id'] + "','" + flList[j]['fl.dwgname'] + "')\">" + flList[j]['fl.fl_id'] + " " + flList[j]['fl.dwgname'] + " "+getMessage("availableSeats")+":" + flList[j]['fl.avail_rm_count'] + "</a>";
                var flNode = new YAHOO.widget.TextNode(floorNodeText, blNode, false, false, true);
            }
        }
        
        //draw the tree 
        this.floorTree.draw();
    },
    
    /**
     * get distinct buiding list from availableRooms array
     */
    getBlList: function(){
        var blList = [];
        for (var i = 0; i < this.availableRooms.length; i++) {
            var isExists = false;
            
            for (var j = 0; j < blList.length; j++) {
                if (this.availableRooms[i].getValue("rm.bl_id") == blList[j]) {
                    isExists = true;
                    break;
                }
            }
            
            if (!isExists) {
                blList.push(this.availableRooms[i].getValue("rm.bl_id"));
            }
        }
        
        return blList;
    },
    
    /**
     * get distinct floor list of select building from availableRooms array
     */
    getFlList: function(blId){
        var flList = [];
        for (var i = 0; i < this.availableRooms.length; i++) {
			if (this.availableRooms[i].getValue("rm.bl_id") == blId) {
				var isExists = false;
				for (var j = 0; j < flList.length; j++) {
					if (this.availableRooms[i].getValue("rm.bl_id") == blId && this.availableRooms[i].getValue("rm.fl_id") == flList[j]['fl.fl_id'] && this.availableRooms[i].getValue("rm.dwgname").toLowerCase() == flList[j]['fl.dwgname']) {
						isExists = true;
						break;
					}
				}
				
				if (!isExists) {
					flList.push({
						"fl.fl_id": this.availableRooms[i].getValue("rm.fl_id"),
						"fl.dwgname": this.availableRooms[i].getValue("rm.dwgname").toLowerCase(),
						"fl.avail_rm_count": this.getAvailRmCount(blId, this.availableRooms[i].getValue("rm.fl_id"),this.availableRooms[i].getValue("rm.dwgname"))
					});
				}
			}
        }
        return flList;
    },
    
    /**
     * get available room count of select bulding and  floor  from availableRooms array
     */
    getAvailRmCount: function(blId, flId, dwgname){
        var count = 0;
        for (var i = 0; i < this.availableRooms.length; i++) {
            if (this.availableRooms[i].getValue("rm.bl_id") == blId && this.availableRooms[i].getValue("rm.fl_id") == flId && this.availableRooms[i].getValue("rm.dwgname")==dwgname) {
                count = count + parseInt(this.availableRooms[i].getValue("rm.avail_space"));
            }
        }
        return count;
    },
    
    /**
     * create booking
     */
    selectRoomDrawing_onCreateBooking: function() {
        if (this.bookings.length > 0) {
            var abHtBookingCreateSearchController = View.parentTab.parentPanel.abHtBookingCreateSearchController;
            //Store the resultant list of available spaces returned from WFR to current controller's variable result.
            var parameters = {
                'userDvId': abHtBookingCreateSearchController.filterDvId,
                'userDpId': abHtBookingCreateSearchController.filterDpId,
                'dayPart': abHtBookingCreateSearchController.dayPart,
                'date_start': abHtBookingCreateSearchController.dateStart,
                'date_end': abHtBookingCreateSearchController.dateEnd,
                'recurringRule': abHtBookingCreateSearchController.recurringRule,
                'bookings': toJSON(this.bookings)
            };
			//Firstly check the if rm_std and em_std is matched for each booking
			try {
					var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-checkRmstdEmstd', this.bookings);
					var jsonResult = eval("(" + result.jsonExpression + ")");
			        controller = this;
					if(jsonResult.length>0){
							View.confirm(getMessage("confirmMessage"), function(button){
								if (button == 'no') {
									return;
								}
								else{
									controller.createBookings(parameters);
								}
							});
					}
					else{
						this.createBookings(parameters);
					}
            } 
            catch (e) {
                Workflow.handleError(e);
				return;
            }
        }
        else {
            View.alert(getMessage("noBooking"));
        }
    },

	createBookings: function(parameters){
	
		   try {
                var result1 = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-checkIsDatePassed', 
																	parameters.date_start, parameters.date_end, 
																	parameters.recurringRule,this.bookings);
				if(result1.message=='err2'){
					alert(getMessage("datePassedError"));
					return;
				}
            } 
            catch (e) {
                Workflow.handleError(e);
				return;
            }			
		   try {
                var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-createBookings', 
														parameters.userDvId, parameters.userDpId, parameters.dayPart, 
														parameters.date_start, parameters.date_end,parameters.recurringRule, this.bookings);
				if(result.message=='err1'){
					alert(getMessage("emailNotificationError"));
				}
				var jsonResult = eval("(" + result.jsonExpression + ")");
	            var abHtBookingCreateSearchController = View.parentTab.parentPanel.abHtBookingCreateSearchController;
	            abHtBookingCreateSearchController.createdBookings = jsonResult.createdBookings;
				
				var restriction = new Ab.view.Restriction();
				var createdBookings = abHtBookingCreateSearchController.createdBookings;
				if(createdBookings.length==0){
					restriction.addClause("rmpct.pct_id", -1, "=");
				}
				else{
					for(var i=0; i<createdBookings.length;i++){
						restriction.addClause("rmpct.pct_id", createdBookings[i], "=", "OR");
					}
				}
				
                var tabs = View.parentTab.parentPanel;
                tabs.selectTab("confirmBooking",restriction);
            } 
            catch (e) {
                Workflow.handleError(e);
            }
	},
    
    /**
     * back to search tab
     */
    selectRoomDrawing_onBack: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.selectTab("searchBooking");
    },
    
    /**
     * buid the select resources grid column after it refreshed
     */
    selectResourcesGrid_afterRefresh: function(){
        var columns = [new Ab.grid.Column('rmpct.bl_id', getFieldTitle('rmpct.bl_id'), 'text'), new Ab.grid.Column('rmpct.fl_id', getFieldTitle('rmpct.fl_id'), 'text'), new Ab.grid.Column('rmpct.rm_id', getFieldTitle('rmpct.rm_id'), 'text'), new Ab.grid.Column('rmpct.resources', getMessage('resourcesTitle'), 'text'), new Ab.grid.Column('rm.setResources', '', 'button', selectResourcesGrid_onSet)];
        columns[4].text = getMessage('addEdit');
        var rows = [];
        for (var i = 0; i < this.bookings.length; i++) {
			//fix KB3025184 by Guo Jiangtao 2010-01-12
            //var isChecked = this.bookings[i].getValue("rmpct.resources") ? 'true' : 'false';
            var row = {
                //'rmpct.checked': isChecked,
                'rmpct.bl_id': this.bookings[i].getValue("rmpct.bl_id"),
                'rmpct.fl_id': this.bookings[i].getValue("rmpct.fl_id"),
                'rmpct.rm_id': this.bookings[i].getValue("rmpct.rm_id"),
                'rmpct.resources': this.bookings[i].getValue("rmpct.resources"),
                'rmpct.setResources': false
            };
            rows.push(row);
        }
        this.selectResourceGrid.rows = rows;
        this.selectResourceGrid.columns = columns;
        this.selectResourceGrid.sortEnabled = false;
		//fix KB3025433 by Guo Jiangtao 2010-01-12
		if(rows.length>0){
			this.selectResourceGrid.hasNoRecords = false;
		}else{
			this.selectResourceGrid.hasNoRecords = true;
		}
        this.selectResourceGrid.build();
        
    },
    
    /**
     * open the add new visitor view
     */
    selectVisitorsGrid_onAdd: function(){
    	this.tag=true;
        View.openDialog("ab-ht-create-sp-booking-visitor-mgmt.axvw");
    },
    
    /**
     * saving the edit booking
     */
    editBookingForm_onSave: function(){
		//fix KB3025482 by Guo Jiangtao 2010-01-14
		if (this.editBookingForm.canSave()) {
			var record = this.editBookingForm.getRecord();
			for (var i = 0; i < this.bookings.length; i++) {
				if (this.bookings[i].getValue("rmpct.bl_id") == record.getValue("rmpct.bl_id") &&
				this.bookings[i].getValue("rmpct.fl_id") == record.getValue("rmpct.fl_id") &&
				this.bookings[i].getValue("rmpct.rm_id") == record.getValue("rmpct.rm_id")) {
					this.bookings[i] = record;
				}
			}
			
			addBookingRows();
			this.editBookingForm.closeWindow();
		}
    },


	/**
     * set the checkbox for resources grid after it refreshed
     */
    selectResourceGridPopUp_afterRefresh: function(){
        this.selectResourceGridPopUp.gridRows.each(function(row){
            if (abHtBookingCreateSelectController.isResourceSelected(row.record['resources.resource_id'])) {
                abHtBookingCreateSelectController.selectResourceGridPopUp.getDataRows()[row.getIndex()].firstChild.firstChild.checked = true;
            }
        });
    },
    
    /**
     * is resource selected in the edit booking
     * @param {String} resource
     */
    isResourceSelected: function(resource){
        var isSelected = false;
        if (editBookingResources) {
            var selectedResources = editBookingResources.split(",");
            for (var i = 0; i < selectedResources.length; i++) {
                if (selectedResources[i] == resource) {
                    isSelected = true;
                    break;
                }
            }
        }
        return isSelected;
    },
		
    
    /**
     * @Overwrite the selected bookings resources with the ones introduced in the textarea
     */
    selectResourceGridPopUp_onAdd: function(){
        var selectedresources = "";
        var selectResourcesRecord = this.selectResourceGridPopUp.getSelectedRecords();
        for (var i = 0; i < selectResourcesRecord.length; i++) {
            var resources = selectResourcesRecord[i].getValue("resources.resource_id");
            selectedresources = selectedresources + "," + resources;
        }
        
        if (selectedresources) {
            this.selectResourceGrid.rows[editResourceRowIndex]['rmpct.resources'] = selectedresources.substring(1);
			this.bookings[editResourceRowIndex].setValue('rmpct.resources', selectedresources.substring(1));
        }else{
			this.selectResourceGrid.rows[editResourceRowIndex]['rmpct.resources'] = "";
			this.bookings[editResourceRowIndex].setValue('rmpct.resources', "");
		}
        this.selectResourceGrid.build();
        this.selectResourceGridPopUp.closeWindow();
        
    }
});

/**
 * event handler when click the floor level of the tree
 * @param {String} blId
 * @param {String} flId
 * @param {String} dwgname
 */
function selectFloorTree_onClick(blId, flId, dwgname){
    selectedFloorPlan = {
        'bl_id': blId,
        'fl_id': flId,
        'dwgname': dwgname
    };
    showSelectSpacePanel();
    setSelectSpaceTitle();
}

/**
 * event handler when click the select employee grid
 */
function selectEmployeeGrid_onClick(){
    var grid = abHtBookingCreateSelectController.selectEmployeeGrid;
    var row = grid.rows[grid.selectedRowIndex];
    //Store the selected employee to variable employee of current controller object
    abHtBookingCreateSelectController.employee = new Object();
    abHtBookingCreateSelectController.employee.id = row['em.em_id'];
    abHtBookingCreateSelectController.employee.divisionId = row['em.dv_id'];
    abHtBookingCreateSelectController.employee.departmentId = row['em.dp_id'];
    if (selectedFloorPlan) {
        abHtBookingCreateSelectController.selectRoomDrawing.setToAssign("rm.fl_id", selectedFloorPlan['fl_id']);
    }
    //showSelectSpacePanel();
    setSelectSpaceTitle();
}

/**
 * event handler when click the select visitor grid
 */
function selectVisitorsGrid_onClick(){
    var grid = abHtBookingCreateSelectController.selectVisitorsGrid;
    var row = grid.rows[grid.selectedRowIndex];
    //Store the selected visitor to variable visitor of current controller object
    abHtBookingCreateSelectController.visitor = new Object();
    abHtBookingCreateSelectController.visitor.id = row['visitors.visitor_id'];
    abHtBookingCreateSelectController.visitor.name = row['visitors.name_last'] + " " + row['visitors.name_first'];
	//fix KB3025309 by Guo Jiangtao 2010-01-10
    abHtBookingCreateSelectController.visitor.divisionId = View.user.employee.organization.divisionId;
    abHtBookingCreateSelectController.visitor.departmentId = View.user.employee.organization.departmentId;
    if (selectedFloorPlan) {
        abHtBookingCreateSelectController.selectRoomDrawing.setToAssign("rm.fl_id", selectedFloorPlan['fl_id']);
    }
    //showSelectSpacePanel();
    setSelectSpaceTitle();
}

/**
 * show drawing panel
 */
function showSelectSpacePanel(){
    var drawingPanel = View.panels.get('selectRoomDrawing');
    if (selectedFloorPlan) {
        displayFloor(drawingPanel, selectedFloorPlan);
        drawingPanel.clearAssignCache(true);
    }
    else {
        View.alert(getMessage("noFloorPlan"));
        return;
    }
    
    var bookingForWho = abHtBookingCreateSelectController.bookingForWho;
    if (((bookingForWho == 1 || bookingForWho == 2) && abHtBookingCreateSelectController.employee) || (bookingForWho == 3 && abHtBookingCreateSelectController.visitor)) {
        drawingPanel.setToAssign("rm.fl_id", selectedFloorPlan['fl_id']);
    }
}

/**
 * set drawing panel title
 */
function setSelectSpaceTitle(){
    var drawingPanel = View.panels.get('selectRoomDrawing');
    var title = "";
    var bookingForWho = abHtBookingCreateSelectController.bookingForWho;
    if (bookingForWho == 1) {
        title = String.format(getMessage('drawingPanelTitle'), abHtBookingCreateSelectController.employee.id);
    }
    
    if (bookingForWho == 2) {
        if (abHtBookingCreateSelectController.employee) {
            title = String.format(getMessage('drawingPanelTitle'), abHtBookingCreateSelectController.employee.id);
        }
    }
    
    if (bookingForWho == 3) {
        if (abHtBookingCreateSelectController.visitor) {
            title = String.format(getMessage('drawingPanelTitle'), abHtBookingCreateSelectController.visitor.name);
        }
    }
    if (title) {
        drawingPanel.appendInstruction("default", "", title);
        drawingPanel.processInstruction("default", "");
    }
    
}

/**
 * set drawing panel default title
 */
function setSelectSpaceDefaultTitle(){
    var bookingForWho = abHtBookingCreateSelectController.bookingForWho;
    
    if (bookingForWho == 1) {
		var title = String.format(getMessage('drawingPanelTitle'), abHtBookingCreateSelectController.employee.id);
        abHtBookingCreateSelectController.selectRoomDrawing.appendInstruction("default", "", title);
    }
    
    if (bookingForWho == 2) {
        abHtBookingCreateSelectController.selectRoomDrawing.appendInstruction("default", "", getMessage('selectRmForEm'));
    }
    
    if (bookingForWho == 3) {
        abHtBookingCreateSelectController.selectRoomDrawing.appendInstruction("default", "", getMessage('selectRmForVisitor'));
    }
    
    abHtBookingCreateSelectController.selectRoomDrawing.processInstruction("default", "");
}

/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} floorPlan
 */
function displayFloor(drawingPanel, floorPlan){
    var blId = floorPlan['bl_id'];
    var flId = floorPlan['fl_id'];
    var dwgName = floorPlan['dwgname'];
    var rmRes = "rm.bl_id='" + blId + "' AND rm.fl_id='" + flId + "' AND rm_id IN " + getAvailableRoomsAsRestriction(blId, flId, dwgName);
    View.dataSources.get('ds_ab_ht_booking_create_select_drawing_rmHighlight').addParameter('rmRes', rmRes);
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        highlightRoomByAvailSpace();
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.isLoadDrawing = true;
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
}

/**
 * get available room as a restriction like "('101', '102')"
 * @param {String} blId
 * @param {String} flId
 * @param {String} dwgname
 */
function getAvailableRoomsAsRestriction(blId, flId, dwgname){
    var rooms = "";
    var availableRooms = abHtBookingCreateSelectController.availableRooms;
    for (var i = 0; i < availableRooms.length; i++) {
        if (availableRooms[i].getValue('rm.bl_id') == blId && availableRooms[i].getValue('rm.fl_id') == flId && availableRooms[i].getValue('rm.dwgname').toLowerCase() == dwgname) {
            rooms = rooms + ",'" + availableRooms[i].getValue('rm.rm_id') + "'";
        }
    }
    if (rooms.length > 0) {
        rooms = "(" + rooms.substring(1) + ")";
    }
    
    return rooms;
}

/**
 * click event handler when click drawing room  
 * @param {Array} pk
 * @param {Boolean} selected
 * @param {String} color
 */
function selectRoomDrawing_onClick(pk, selected, color) {
    var bookingForWho = abHtBookingCreateSelectController.bookingForWho;
    if (bookingForWho == 1) {
        if (abHtBookingCreateSelectController.bookings.length == 0) {
            addNewBooking(pk, abHtBookingCreateSelectController.employee, 'em');
        }
        else {
            updateBooking(abHtBookingCreateSelectController.bookings[0], pk);
        }
        
    }
    
    if (bookingForWho == 2) {
        if (abHtBookingCreateSelectController.bookings.length == 0) {
            addNewBooking(pk, abHtBookingCreateSelectController.employee, 'em');
        }
        else {
            var isExists = false;
            for (var i = 0; i < abHtBookingCreateSelectController.bookings.length; i++) {
                if (abHtBookingCreateSelectController.bookings[i].getValue("rmpct.em_id") == abHtBookingCreateSelectController.employee.id) {
                    updateBooking(abHtBookingCreateSelectController.bookings[i], pk);
                    isExists = true;
                }
            }
            if (!isExists) {
                addNewBooking(pk, abHtBookingCreateSelectController.employee, 'em');
            }
        }
        
    }
    
    if (bookingForWho == 3) {
        if (abHtBookingCreateSelectController.bookings.length == 0) {
            addNewBooking(pk, abHtBookingCreateSelectController.visitor, 'visitor');
        }
        else {
            var isExists = false;
            for (var i = 0; i < abHtBookingCreateSelectController.bookings.length; i++) {
                if (abHtBookingCreateSelectController.bookings[i].getValue("rmpct.visitor_id") == abHtBookingCreateSelectController.visitor.id) {
                    updateBooking(abHtBookingCreateSelectController.bookings[i], pk);
                    isExists = true;
                }
            }
            
            if (!isExists) {
                addNewBooking(pk, abHtBookingCreateSelectController.visitor, 'visitor');
            }
        }
    }
	
	//add to fix KB3025622
	var selectedTabName = abHtBookingCreateSelectController.bookingAndResourcesTabs.selectedTabName;
    abHtBookingCreateSelectController.afterBookingAndResourcesTabsChange(null,selectedTabName);
    
    addBookingRows();
    lastClickLocation = pk;
}

/**
 * add new booking to abHtBookingCreateSelectController.bookings array
 * @param {Object} location
 * @param {Object} person
 * @param {String} forWho
 */
function addNewBooking(location, person, forWho){
    if (!isOverBooking(location)) {
        var booking = new Ab.data.Record();
        booking.setValue("rmpct.bl_id", location[0]);
        booking.setValue("rmpct.fl_id", location[1]);
        booking.setValue("rmpct.rm_id", location[2]);
        if (forWho == 'em') {
            booking.setValue("rmpct.em_id", person.id);
        }
        
        if (forWho == 'visitor') {
            booking.setValue("rmpct.em_id", abHtBookingCreateSelectController.employee.id);
            booking.setValue("rmpct.visitor_id", person.id);
			var grid = abHtBookingCreateSelectController.selectVisitorsGrid;
			var row = grid.rows[grid.selectedRowIndex];
            booking.setValue("rmpct.visitor_name",  row['visitors.name_last']+' '+row['visitors.name_first'] );
        }
        
        booking.setValue("rmpct.dv_id", person.divisionId);
        booking.setValue("rmpct.dp_id", person.departmentId);
        var confirmationTime = View.activityParameters['AbSpaceHotelling-ConfirmationTime'];
        var confirmed = 0;
        if(confirmationTime == "None" || !confirmationTime) {
        	confirmed = 1;
        }
        booking.setValue("rmpct.confirmed", confirmed);
        abHtBookingCreateSelectController.bookings.push(booking);
    } else {
        View.alert(getMessage("rmNotAvailable"));
    }
    
    highlightRoomByAvailSpace(location);
}

/**
 * is select room over capcity
 * @param {Object} location
 */
function isOverBooking(location){
    var drawingPanel = abHtBookingCreateSelectController.selectRoomDrawing;
    var availableRooms = abHtBookingCreateSelectController.availableRooms;
    var isOver = false;
    for (var i = 0; i < availableRooms.length; i++) {
        var room = availableRooms[i];
        if ((room.getValue('rm.dwgname').toLowerCase() == drawingPanel.lastLoadedBldgFloor) &&
        (room.getValue('rm.bl_id') == location[0]) &&
        (room.getValue('rm.fl_id') == location[1]) &&
        (room.getValue('rm.rm_id') == location[2])) {
            var availSpace = parseInt(room.getValue('rm.avail_space'));
            var bookingCount = getRoomBookingCount(room);
            if ((availSpace - bookingCount) <= 0) {
                isOver = true;
            }
            
            break;
        }
    }
    
    return isOver;
}

/**
 * update booking room
 * @param {Object} booking
 * @param {Object} location
 */
function updateBooking(booking, location){
    var oldLocation = [];
    oldLocation[0] = booking.getValue("rmpct.bl_id");
    oldLocation[1] = booking.getValue("rmpct.fl_id");
    oldLocation[2] = booking.getValue("rmpct.rm_id");
    
    if (!isOverBooking(location)) {
		if(booking.getValue("rmpct.resources")){
			View.alert(getMessage('resourceLost'));
		}
        booking.setValue("rmpct.bl_id", location[0]);
        booking.setValue("rmpct.fl_id", location[1]);
        booking.setValue("rmpct.rm_id", location[2]);
		booking.setValue("rmpct.resources", "");
    }
    else {
        View.alert(getMessage("rmNotAvailable"));
    }
    
    highlightRoomByAvailSpace(oldLocation);
    highlightRoomByAvailSpace(location);
}

/**
 * delete booking by index
 * @param {int} index
 */
function deleteBooking(index){
    var location = [];
    location[0] = abHtBookingCreateSelectController.bookings[index].getValue("rmpct.bl_id");
    location[1] = abHtBookingCreateSelectController.bookings[index].getValue("rmpct.fl_id");
    location[2] = abHtBookingCreateSelectController.bookings[index].getValue("rmpct.rm_id");
    abHtBookingCreateSelectController.bookings.splice(index, 1);
    highlightRoomByAvailSpace(location);
}

/**
 * add rows to booking grid by abHtBookingCreateSelectController.bookings array
 */
function addBookingRows(){
    var grid = View.panels.get("selectBookingGrid");
    for (i = 0; i < grid.gridRows.length; i++) 
        grid.removeGridRow(0);
    var bookings = abHtBookingCreateSelectController.bookings;
    for (var i = 0; i < bookings.length; i++) {
        var booking = bookings[i];
        grid.addGridRow(booking);
    }
    grid.sortEnabled = false;
    grid.update();
}

/**
 * click event when click edit button of select booking grid row
 */
function selectBookingGrid_onEdit(){
    var grid = abHtBookingCreateSelectController.selectBookingGrid;
    var editBookingForm = abHtBookingCreateSelectController.editBookingForm;
    var record = grid.rows[grid.selectedRowIndex].row.getRecord();
    editBookingForm.show(true);
    editBookingForm.clear();
    editBookingForm.setRecord(record);
    editBookingForm.showInWindow({
        width: 750,
        height: 380,
        closeButton: false
    });
    
    if (abHtBookingCreateSelectController.bookingForWho == 3) {
        editBookingForm.enableField('rmpct.em_id', true);
    }
    else {
        editBookingForm.enableField('rmpct.em_id', false);
    }
    
    if ((View.isMemberOfGroup(View.user, 'HOTEL BOOKINGS ALL DEPARTMENTS')) || (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION'))) {
        editBookingForm.enableField("rmpct.dv_id", true);
        editBookingForm.enableField("rmpct.dp_id", true);
    }
    else {
        editBookingForm.enableField("rmpct.dv_id", false);
        editBookingForm.enableField("rmpct.dp_id", false);
    }
}

/**
 * Remove the booking of the row selected from controller's variable bookings, and then refresh the Selected Bookings panel
 */
function selectBookingGrid_onClear(){
    var grid = abHtBookingCreateSelectController.selectBookingGrid;
    var index = grid.rows[grid.selectedRowIndex].row.getIndex();
    deleteBooking(index);
    addBookingRows();
}


/**
 * open dialog to select resources
 */
function selectResourcesGrid_onSet(row){
    editResourceRowIndex = row.index;
	editBookingResources = row['rmpct.resources'];
		var blId = row['rmpct.bl_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id", blId, "=");
		   var record = View.dataSources.get("ds_ab_ht_booking_create_select_blDS").getRecord(restriction);
        var siteId = record.getValue("bl.site_id");
		var restriction = new Ab.view.Restriction();
			restriction.addClause("resources.bl_id", blId, "=","(");
			restriction.addClause("resources.site_id", siteId, "=","OR");
			restriction.addClause("resources.bl_id", "","=",")OR(");
            restriction.addClause("resources.site_id", "", "=","AND");
  
    var selectResourceGridPopUp = abHtBookingCreateSelectController.selectResourceGridPopUp;
    selectResourceGridPopUp.show(true);
    selectResourceGridPopUp.refresh(restriction);
    selectResourceGridPopUp.showInWindow({
        width: 750,
        height: 380
    });
}

/**
 * highlight drawing rooms by different color, (green|avaiable)|(yellow|avaiable and have booking)|(red|not avaiable)
 */
function highlightRoomByAvailSpace(location){
    var drawingPanel = abHtBookingCreateSelectController.selectRoomDrawing;
    var availableRooms = abHtBookingCreateSelectController.availableRooms;
    var optsGreen = new DwgOpts();
    var optsYellow = new DwgOpts();
    optsGreen.rawDwgName = selectedFloorPlan['dwgname'];
    optsYellow.rawDwgName = selectedFloorPlan['dwgname'];
    for (var i = 0; i < availableRooms.length; i++) {
        var room = availableRooms[i];
        if ((valueExists(location) && (location[0] == room.getValue('rm.bl_id')) &&
        (location[1] == room.getValue('rm.fl_id')) &&
        (location[2] == room.getValue('rm.rm_id'))) ||
        !valueExists(location) ||
        (valueExists(lastClickLocation) && (lastClickLocation[0] == room.getValue('rm.bl_id')) &&
        (lastClickLocation[1] == room.getValue('rm.fl_id')) &&
        (lastClickLocation[2] == room.getValue('rm.rm_id')))) {
            if (drawingPanel.lastLoadedBldgFloor == room.getValue('rm.dwgname').toLowerCase()) {
                var availSpace = parseInt(room.getValue('rm.avail_space'));
                var bookingCount = getRoomBookingCount(room);
                var labels = new Array();
                labels[0] = new DwgLabel("availSpace", getMessage("availability") + ": " + (availSpace - bookingCount), 15, 0xff0000, null, null, true);
                
                if (bookingCount > 0) {
                     //yellow --room that have booking
                    optsYellow.appendRec(room.getValue('rm.bl_id') + ';' + room.getValue('rm.fl_id') + ';' + room.getValue('rm.rm_id'), null, labels);
                }
                else {
					//green --room that not have booking
                    optsGreen.appendRec(room.getValue('rm.bl_id') + ';' + room.getValue('rm.fl_id') + ';' + room.getValue('rm.rm_id'), null, labels);
                }
            }
        }
    }
    
    var loc = new Ab.drawing.DwgCtrlLoc(selectedFloorPlan['bl_id'], selectedFloorPlan['fl_id'], null, selectedFloorPlan['dwgname']);
    //set color and highlight room
    //green --avaiable
    if (optsGreen.recs) {
        drawingPanel.setSelectColor(0x33FF00);
        drawingPanel.highlightAssets(optsGreen);
        drawingPanel.setLabels(loc, optsGreen, 5);
        drawingPanel.setLabels(loc, optsGreen, 2);
    }
    
    //yellow --avaiable and have booking
    if (optsYellow.recs) {
        drawingPanel.setSelectColor(0xFFFF00);
        drawingPanel.highlightAssets(optsYellow);
        drawingPanel.setLabels(loc, optsYellow, 5);
        drawingPanel.setLabels(loc, optsYellow, 2);
    }
}

/**
 * get room booking count
 * @param {Object} room
 */
function getRoomBookingCount(room){
    var count = 0;
    var bookings = abHtBookingCreateSelectController.bookings
    if (room && bookings) {
        if (bookings) 
            for (var i = 0; i < bookings.length; i++) {
                if (bookings[i].getValue("rmpct.bl_id") == room.getValue('rm.bl_id') && bookings[i].getValue("rmpct.fl_id") == room.getValue('rm.fl_id') && bookings[i].getValue("rmpct.rm_id") == room.getValue('rm.rm_id')) {
                    count++;
                }
            }
    }
    return count;
}

/**
 * get field title
 * @param {String} fieldName
 */
function getFieldTitle(fieldName){
    var ds = View.dataSources.get('ds_ab_ht_booking_create_select_grid_rmpct');
    var items = ds.fieldDefs.items;
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var id = item.id;
        if (fieldName == id) {
            return item.title;
        }
    }
    
    return "";
}

function onChangeLableDS(){
	var drawingPanel = abHtBookingCreateSelectController.selectRoomDrawing;
	drawingPanel.applyDS('labels');
	setTimeout("highlightRoomByAvailSpace();",100);
}

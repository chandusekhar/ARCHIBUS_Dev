
var abSpAsgnDpToRm_Controller = View.createController('abSpAsgnDpToRm_Controller', {
	currentNode:'',
	dvId:'',
	dpId:'',
	dwgName:'',
	requestDate:'',
	mainTabs:'',
	activityLogId:'',
	//departmentSpaceEditApprove from approve a request ,|,departmentSpaceDetailTab from create a  request
	taskType:'',
	lastTab:'',
	assignments_changed:0,
	helpdeskRequestApproveEditController:'',
	requestor:'',
	blId:'',
	flId:'',
	bFound:false,
	/**
	 * dwg name.
	 */
	dwgName: null,
	/*
	 * delete row after click drawing.
	 */
	deletedRow: null,
	/**
	 * assignments after view InitialDataFetch
	 */
	originalAssignments: null,
	afterInitialDataFetch: function(){
		var controllerConsole=View.controllers.get('controllerConsole');
		View.controllers.get('treeController').register(runAfterTreeClicked);
		controllerConsole.registerPrevious(this.onPrevious);
		
		
		var drawingPanel = this.abSpAsgnUserDpToRm_drawingPanel;
		//Initial last tab parameter
		
		this.mainTabs = View.parentTab.parentPanel;
		this.mainTabs.lastController=abSpAsgnDpToRm_Controller;
		this.activityLogId=this.mainTabs.activityLogId;
		this.taskType=this.mainTabs.taskType;
		
		if(this.taskType=='departmentSpaceEditApprove'){
			this.helpdeskRequestApproveEditController=this.mainTabs.helpdeskRequestApproveEditController;
		}else if((this.taskType=='departmentSpaceDetailTab')){
			this.lastTab=this.mainTabs.lastTab;
			drawingPanel.actions.get("exportDOCX").show(false);
		}
		
		abSpAsgnDpToRm_Controller.getRequestDate();
 		this.mainTabs.requestDate=this.requestDate;
		///////////////////////////////////////////
		
		this.abSpAsgnUserDpToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
		this.abSpAsgnUserDpToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectRm'));
		this.abSpAsgnUserDpToRm_drawingPanel.addEventListener('onclick', onDrawingClicked);
		this.abSpAsgnUserDpToRm_drawingPanel.addEventListener('ondwgload', onDwgLoaded);
		
		var ruleset = new DwgHighlightRuleSet();//D8D8D8
		ruleset.appendRule("rm.legend_level",'yellow' , "f0c239", "==");
		ruleset.appendRule("rm.legend_level",'blue' , "45B97C", "==");
		//ruleset.appendRule("rm.legend_level",'grey' , "3C3C3C", "==");
		this.abSpAsgnUserDpToRm_drawingPanel.appendRuleSet("abHelpdeskRequestCreateDpSpAssignDrawingDS", ruleset);
		
		this.legendGrid.afterCreateCellContent = setLegendLabel;
		
		var restriction = new Ab.view.Restriction();
	    restriction.addClause("activity_log.activity_log_id", abSpAsgnDpToRm_Controller.activityLogId);
	    var record=this.activityLogDS.getRecord(restriction);
	    if((this.taskType=='departmentSpaceDetailTab')){
			this.dvId = View.user.employee.organization.divisionId;
			this.dpId = View.user.employee.organization.departmentId;
			
		}else{
			
			this.dvId=record.values['activity_log.dv_id'];
			this.dpId=record.values['activity_log.dp_id'];
		}
	    
	    this.requestor=record.values['activity_log.requestor'];
	    
		this.defaultAddDpToAssign('defaultLoad');
		
		this.originalAssignments=this.getAssignmentArray(true);
		this.mainTabs.originalAssignments=this.originalAssignments;
		
		this.loadDefaultDrawing();
		
	    abSpAsgnDpToRm_Controller.documentsPanel.refresh(restriction);
	    abSpAsgnDpToRm_Controller.commentsPanel.refresh(restriction);
		if(abSpAsgnDpToRm_Controller.taskType!='departmentSpaceEditApprove'){
			View.panels.get("requestPanel").refresh(restriction);
		}
		this.showOrHideButton();
		
		
		var rmpctRecords=this.rmpctForRequestorDS.getRecords(" rmpct.em_id=${sql.literal('"+this.requestor+"')} AND (rmpct.date_start IS NULL OR rmpct.date_start &lt;= ${sql.date('"+this.requestDate+"')}) AND (rmpct.date_end IS NULL OR rmpct.date_end &gt;= ${sql.date('"+this.requestDate+"')}) ");
		
		if((this.taskType=='departmentSpaceDetailTab'&&rmpctRecords.length>0)){
			var bl_id=rmpctRecords[0].values["rmpct.bl_id"];
			this.abHelpRequestTreeConsole.setFieldValue("rmpct.bl_id",bl_id);
			controllerConsole.abHelpRequestTreeConsole_onFilter();
			}
			
		
	},
	
	/**
	 * Get request date and format date.
	 */
	getRequestDate:function(){
		this.requestDate=this.mainTabs.requestDate;
		
		//m0/d1/y2
 	    var arr=this.requestDate.split('/');
 		if(arr.length!=1){	   
	   	this.requestDate=arr[2]+"-"+arr[0]+"-"+arr[1];
 		};
	},
	
	/**
	 * Show and hide button function
	 */
	showOrHideButton:function(){
		var controllerConsole=View.controllers.get('controllerConsole');
		if(abSpAsgnDpToRm_Controller.taskType=='departmentSpaceDetailTab'){
			var	keyValue= new Array(
					['questNext',true], //Submit
					['approve',false], //approve
					['reject',false],//reject
					['save',false],//save before issue
					['issue',false],//issue
					['cancel',false],//cancel
					['complete',false],//complete
					['stop',false]//stop
			);
			
			controllerConsole.showOrhideButton(keyValue);
			controllerConsole.registerNext(onNext);
			abSpAsgnDpToRm_Controller.commentsPanel.show(false);
		}else if(abSpAsgnDpToRm_Controller.taskType=='departmentSpaceEditApprove'){
			var	keyValue= new Array(
					['questNext',false], //Submit
					['approve',true], //approve
					['reject',true],//reject
					['save',false],//save before issue
					['issue',false],//issue
					['cancel',false],//cancel
					['complete',false],//complete
					['stop',false]//stop
			);
			controllerConsole.showOrhideButton(keyValue);
			controllerConsole.registerApprove(this.onApprove);
			controllerConsole.registerReject(this.onReject);
			abSpAsgnDpToRm_Controller.commentsPanel.show(true);
		}else{
			var	keyValue= new Array(
					['questNext',false], //Submit
					['approve',false], //approve
					['reject',false],//reject
					['save',true],//save before issue
					['issue',true],//issue
					['cancel',true],//cancel
					['complete',false],//complete
					['stop',false]//stop
			);
			controllerConsole.showOrhideButton(keyValue);
			controllerConsole.registerSave(this.onSaveRequest);
			controllerConsole.registerIssue(this.onIssueRequest);
			controllerConsole.registerCancel(this.onCancelRequest);
			controllerConsole.registerComplete(this.onCompleteRequest);
			controllerConsole.registerStop(this.onStopRequest);
			abSpAsgnDpToRm_Controller.commentsPanel.show(true);
		}
		
	},
	
	/**
	 * Load drawing by the exists request.
	 */
	loadDefaultDrawing:function(){
	 //When the Assignments panel comes up the building(s) that contain the assignments should be filtered by default
    if(this.originalAssignments.length>0){
    	var blId=this.originalAssignments[0]['bl_id'];
    	var flId=this.originalAssignments[0]['fl_id'];
    	//If the existing assignments are on one floor, that floor should default to display on the Floor Plan panel.
    	this.abSpAsgnEmToRm_blTree.refresh();
    	this.abSpAsgnEmToRm_blTree.show(true);
    	var root=this.abSpAsgnEmToRm_blTree.treeView.getRoot();
    	for (var i = 0; i < root.children.length; i++) {
    		var node = root.children[i];
	    		if(node.data['bl.bl_id'] == blId){
	    			node.expand();
	    			this.clickDefaultFlNode.defer(1000,this, [flId, node]);
	    			break;
	    		}
    		}
    	}
	},
	/**
	 * private method ,auto click floor function for loading drawing after view load.
	 */
	clickDefaultFlNode: function(flId,node){
		for (var j = 0; j < node.children.length; j++) {
	    	var flNode = node.children[j];
	    	if(flNode.data['fl.fl_id'] == flId){
        		var dwgName = flNode.data['fl.dwgname'];
        		abSpAsgnDpToRm_Controller.dwgName =  dwgName;
	    		flNode.onLabelClick(flNode);
	    	    $(flNode.labelElId).command.handle();
	    	}
		}
	},
    /**
     * Change tab function.
     */
    changeTab: function(activityLogId,tabs){
    	var restriction = new Ab.view.Restriction();
	    restriction.addClause("activity_log.activity_log_id", activityLogId);
	    tabs.selectTab("select", restriction, false, false, false);
    },
    
    /**
     * Previous button
     */
	onPrevious: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id", abSpAsgnDpToRm_Controller.activityLogId);
    	var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
    	if(dynamicAssemblyTabsController){
    		dynamicAssemblyTabsController.selectPreviousTab(restriction);
    	}else{
//    		tabs.selectTab("quest", restriction, false, false, false);
    	}
	},

    /**
     * private method, get rmpct one record 'date_start' value
     * get assigned employee list.
     */
    getMoveRecordDateStart: function(activityLogIdValue){
    	var dsRmpct = View.dataSources.get("rmpctDS");
    	var records = dsRmpct.getRecords('rmpct.activity_log_id = '+activityLogIdValue);
        if(records!= null&&records.length>0){
            var record = records[0];
            return record.getValue('rmpct.date_start');
        }
        return null;
    },

	/**
	 * 	Approve assignments by call method that from ab-helpdesk-request-dp-sp-assign.axvw
	 */
	onApprove: function(){
		abSpAsgnDpToRm_Controller.getRequestDate();
		var currentAssignmentArray=abSpAsgnDpToRm_Controller.getAssignmentArray(false);
		var mainTabs = View.parentTab.parentPanel;
		var requestDate=abSpAsgnDpToRm_Controller.requestDate;
		var newAssignment=compareAssignmentsChangeReturnNew(abSpAsgnDpToRm_Controller.originalAssignments,currentAssignmentArray);

		//kb 3034042
		if(detectIfExistsMoveFuture(newAssignment, requestDate, getMessage("pendingFutureTransMoveOut"), 2)){
			return;
		}
		
		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(newAssignment, requestDate, 0);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					abSpAsgnDpToRm_Controller.continueApprove(newAssignment);	  
			});
		} else 
			abSpAsgnDpToRm_Controller.continueApprove(newAssignment);	  
	},

	continueApprove: function(newAssignment){
		var mainTabs = View.parentTab.parentPanel;
		var approveActivityRecord=mainTabs.helpdeskRequestApproveEditController.getActivityRecord();
		var requestDate=abSpAsgnDpToRm_Controller.requestDate;
		try {
				var result = "";
				//kb 3034293 Need change date_start to current date if approve a request which has a requested moved date is in the past
				var testDate = abSpAsgnDpToRm_Controller.getMoveRecordDateStart(abSpAsgnDpToRm_Controller.activityLogId);
				
				if(testDate!=null&&testDate<new Date()){
						requestDate = dateFormat(getCurrentDate());
						result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveDepartmentSpaceForPastDate",
							approveActivityRecord,mainTabs.comments, requestDate,parseInt(abSpAsgnDpToRm_Controller.activityLogId),newAssignment);
					}else{
						result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveDepartmentSpace",
							approveActivityRecord,mainTabs.comments, requestDate,parseInt(abSpAsgnDpToRm_Controller.activityLogId),newAssignment);
				}
			}catch(e){
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
					Workflow.handleError(e);
				}
				return;
			}
			abSpAsgnDpToRm_Controller.selectFirstTab(mainTabs);
	},
	
	/**
	 * Return first tab function.
	 */
	selectFirstTab:function(mainTabs){
		this.abSpDpAssignGrid.show(false);
    	this.legendGrid.show(false);
    	this.documentsPanel.show(false);
    	this.abSpAsgnUserDpToRm_drawingPanel.show(false);
    	this.commentsPanel.show(false);
    	var treeController=View.controllers.get('treeController');
    	treeController.abSpAsgnEmToRm_blTree.show(false);
    	mainTabs.findTab("assignments").isContentLoaded=false;
    	mainTabs.selectTab("select");
	},
	
	/**
    * Reject department space assignment request.
    */
	onReject: function(){
		abSpAsgnDpToRm_Controller.getRequestDate();
		var currentAssignmentArray=abSpAsgnDpToRm_Controller.getAssignmentArray(false);
		var mainTabs = View.parentTab.parentPanel;
		var approveActivityRecord=mainTabs.helpdeskRequestApproveEditController.getActivityRecord();
		var requestDate=abSpAsgnDpToRm_Controller.requestDate;
		//kb 3034042
		var newAssignment=compareAssignmentsChangeReturnNew(abSpAsgnDpToRm_Controller.originalAssignments,currentAssignmentArray);
		//kb 3034042
		if(detectIfExistsMoveFuture(newAssignment, requestDate, getMessage("pendingFutureTransMoveOut"), 2)){
			return;
		}
		try {
			var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-rejectAll",
					approveActivityRecord,mainTabs.comments,parseInt(abSpAsgnDpToRm_Controller.activityLogId),
					abSpAsgnDpToRm_Controller.originalAssignments,requestDate);

		}catch(e){
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
				Workflow.handleError(e);
			}
			return;
		}
		abSpAsgnDpToRm_Controller.selectFirstTab(mainTabs);
	},
	

	/**
	* Save request
	* Called by 'Issue' button
	* @param {String} formName form submitted
	*/
	onSaveRequest: function(){	
		abSpAsgnDpToRm_Controller.getRequestDate();
	    var requestDate=abSpAsgnDpToRm_Controller.requestDate;
		var currentAssignmentArray=abSpAsgnDpToRm_Controller.getAssignmentArray(false);
		var assignmentObject=compareAssignmentsChangeReturnNew(abSpAsgnDpToRm_Controller.originalAssignments,currentAssignmentArray);

		//kb 3034042
		if(detectIfExistsMoveFuture({I:assignmentObject["I"],U:[],D:assignmentObject["D"]},
				 requestDate, getMessage("pendingFutureTransMoveOut"), 2)){
			return;
		}

		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(assignmentObject, requestDate, 0);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					abSpAsgnDpToRm_Controller.continueSave(assignmentObject, currentAssignmentArray,requestDate);	  
			});
		} else 
			abSpAsgnDpToRm_Controller.continueSave(assignmentObject, currentAssignmentArray,requestDate);
	},

	continueSave: function(assignmentObject, currentAssignmentArray, requestDate){	
	    var panel = View.panels.get("requestPanel");
	    var record = ABHDC_getDataRecord2(panel);
		try {
			//kb 3034293 Need change date_start to current date if approve a request which has a requested moved date is in the past
			var result = null;
			if(requestDate!=null&&new Date(requestDate)<new Date()){
				assignmentObject = {I:currentAssignmentArray,U:[],D:abSpAsgnDpToRm_Controller.originalAssignments};
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate', 
							parseInt(abSpAsgnDpToRm_Controller.activityLogId), record, requestDate,assignmentObject,true);
				abSpAsgnDpToRm_Controller.requestDate = dateFormat(getCurrentDate());
			}else{
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll', 
						parseInt(abSpAsgnDpToRm_Controller.activityLogId), record, requestDate,assignmentObject,true);
				}
			abSpAsgnDpToRm_Controller.originalAssignments = abSpAsgnDpToRm_Controller.getAssignmentArray(true);
		}catch(e){
			Workflow.handleError(e);
		}

	},
	/**
	 * Issue request
	 * Called by 'Issue' button
	 * @param {String} formName form submitted
	 */
	onIssueRequest: function(){
		abSpAsgnDpToRm_Controller.commentsPanel.save();
		abSpAsgnDpToRm_Controller.getRequestDate();
		//var record = gettingRecordsData(document.forms[formName]);                     
		var currentAssignmentArray=abSpAsgnDpToRm_Controller.getAssignmentArray(false);
		var requestDate=abSpAsgnDpToRm_Controller.requestDate;
		var assignmentObject=compareAssignmentsChangeReturnNew(abSpAsgnDpToRm_Controller.originalAssignments,currentAssignmentArray);

		//kb 3034042
		if(detectIfExistsMoveFuture({I:assignmentObject["I"],U:[],D:assignmentObject["D"]},
				 requestDate, getMessage("pendingFutureTransMoveOut"), 2)){
			return;
		}

		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(assignmentObject, requestDate, 0);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					abSpAsgnDpToRm_Controller.continueIssue(assignmentObject, currentAssignmentArray,requestDate);	  
			});
		} else 
			abSpAsgnDpToRm_Controller.continueIssue(assignmentObject, currentAssignmentArray,requestDate);
	},

	continueIssue: function(assignmentObject, currentAssignmentArray, requestDate){
		var panel = View.panels.get("requestPanel");
		var record = ABHDC_getDataRecord2(panel);
		try {
			//kb 3034293 Need change date_start to current date if approve a request which has a requested moved date is in the past
			var result = null;
			if(requestDate!=null&&new Date(requestDate)<new Date()){
				assignmentObject = {I:currentAssignmentArray,U:[],D:abSpAsgnDpToRm_Controller.originalAssignments};
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate', 
							parseInt(abSpAsgnDpToRm_Controller.activityLogId), record, requestDate,assignmentObject,false);
			}else{
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll', 
						parseInt(abSpAsgnDpToRm_Controller.activityLogId), record, requestDate,assignmentObject,false);
				}
			abSpAsgnDpToRm_Controller.selectFirstTab(View.getOpenerView().tabs);
		}catch(e){
			Workflow.handleError(e);
		}
	},

	/**
	* Cancel request
	* Called by 'Cancel' button
	* @param {String} formName form submitted
	*/
	onCancelRequest: function(){	
		abSpAsgnDpToRm_Controller.getRequestDate();
		
		var panel = View.panels.get("requestPanel");
	    var record = ABHDC_getDataRecord2(panel);

	    var activityLogIdValue = panel.getFieldValue("activity_log.activity_log_id");

		var requestDate=abSpAsgnDpToRm_Controller.requestDate;
		var currentAssignmentArray=abSpAsgnDpToRm_Controller.getAssignmentArray(false);
		//kb 3034042
		var newAssignment=compareAssignmentsChangeReturnNew(abSpAsgnDpToRm_Controller.originalAssignments,currentAssignmentArray);
		if(detectIfExistsMoveFuture({I:[],D:abSpAsgnDpToRm_Controller.originalAssignments},
				requestDate, getMessage("pendingFutureTransMoveOut"), 2)){
			//abSpAsgnDpToRm_Controller.abSpAsgnUserDpToRm_drawingPanel.refresh();
			//abSpAsgnDpToRm_Controller.defaultAddDpToAssign();
			//abSpAsgnDpToRm_Controller.loadDefaultDrawing();
			return;
		}
		
		try {
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-cancelAll',
					parseInt(abSpAsgnDpToRm_Controller.activityLogId), record, abSpAsgnDpToRm_Controller.originalAssignments,requestDate);
			abSpAsgnDpToRm_Controller.selectFirstTab(View.getOpenerView().tabs);
		}catch(e){
			Workflow.handleError(e);
		}
	},

	/**
	* Stop request
	* Called by 'Stop' button
	* @param {String} formName form submitted
	*/
	onStopRequest: function(){	
		abSpAsgnDpToRm_Controller.getRequestDate();
		var panel = View.panels.get("requestPanel");
	    var record = ABHDC_getDataRecord2(panel);
		
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-stopRequest', record);
		}catch(e){
			Workflow.handleError(e);
		}

		if(result.code == 'executed'){
			View.getOpenerView().tabs.selectTab("select");
		} else {
			Workflow.handleError(result);
		}
	},

	/**
	* Complete request
	* Called by 'Complete' button
	* @param {String} formName form submitted
	*/
	onCompleteRequest: function(){
		abSpAsgnDpToRm_Controller.getRequestDate();
		var panel = View.panels.get("requestPanel");
	    var record = ABHDC_getDataRecord2(panel);
	    
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', record);
		}catch(e){
			Workflow.handleError(e);
		}

		if(result.code == 'executed'){
			View.getOpenerView().tabs.selectTab("select");
		} else {
			Workflow.handleError(result);
		}
	},
	
	
    /**
     * private method,only use for approve
     */
    defaultAddDpToAssign: function(isDefaultLoad){
    	var grid = this.abSpDpAssignGrid;
    	var dsRmpct = View.dataSources.get("rmpctDS");
        var records=dsRmpct.getRecords("activity_log_id ="+this.activityLogId);
        if(records.length==0){
        	this.abSpDpAssignGrid.show(true);
        }
        var noUseArr=new Array();
        for (var i = 0; i < records.length; i++) {
        	var recordValues=records[i].values;

     	    var pct_id=recordValues["rmpct.pct_id"];
     	   
            var pk=new Array();
            pk[0]=recordValues["rmpct.bl_id"];
            pk[1]=recordValues["rmpct.fl_id"];
            pk[2]=recordValues["rmpct.rm_id"];
            var hasAdd=false;
            for(var m = 0; m < noUseArr.length; m++){
            	var pctId=noUseArr[m];   
            	if(pct_id==pctId){
            		hasAdd=true;
            		break;
            	}
            	
            }
            if(hasAdd){
            	continue;
            }
            for(var j = 0; j < records.length; j++){
            	var recordValues2=records[j].values;
            	var bl_id=recordValues2["rmpct.bl_id"];
            	var fl_id=recordValues2["rmpct.fl_id"];
            	var rm_id=recordValues2["rmpct.rm_id"];
            	var pctId=recordValues2["rmpct.pct_id"];
            	if(pk[0]==bl_id&&pk[1]==fl_id&&pk[2]==rm_id&&pct_id!=pctId){
            		noUseArr.push(pctId);
            	}
            }
            
            var dvId=recordValues["rmpct.dv_id"];
            var dpId=recordValues["rmpct.dp_id"];
            var claimOrRelease;
    	    if(dvId==this.dvId&&dpId==this.dpId){
    	    	claimOrRelease='Claim';
    	    	 drawingRoomClickHandler(pk, true, grid, 'rm.dv_id', this.dvId, 'rm.dp_id', this.dpId,'rm.claimOrRelease',claimOrRelease,pct_id);
    	    }else{
    	    	claimOrRelease='Release';
    	    	drawingRoomClickHandler(pk, true, grid, 'rm.dv_id', '', 'rm.dp_id', '','rm.claimOrRelease',claimOrRelease,pct_id);
    	    }
        }
        reSetHighLight(1);
    },
    
    /////////////////////////////////
    /**
    * Refresh tree and clear drawing panel
    */
    loadDrawing:function(){
    	setParametersToDataSource(this.requestDate);
    	
		var drawingPanel = this.abSpAsgnUserDpToRm_drawingPanel;
	  
	
		this.abHelpdeskRequestCreateDpSpAssignDrawingDS.addParameter('requestDate', this.requestDate);
	    this.abHelpdeskRequestCreateDpSpAssignDrawingDS.addParameter('blId', this.blId);
	    this.abHelpdeskRequestCreateDpSpAssignDrawingDS.addParameter('flId', this.flId);
	    this.abHelpdeskRequestCreateDpSpAssignDrawingDS.addParameter('dvId', this.dvId);
	    this.abHelpdeskRequestCreateDpSpAssignDrawingDS.addParameter('dpId', this.dpId);
	    //if the seleted floor is same as the current drawing panel, just reset the highlight
	    if (drawingPanel.lastLoadedBldgFloor == this.dwgName) {
	        drawingPanel.clearHighlights();
	        drawingPanel.applyDS('highlight');
	    }
	    else {
	        var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, null, this.dwgName);
	        drawingPanel.addDrawing(dcl);
	        drawingPanel.lastLoadedBldgFloor = this.dwgName;
	    }
	    drawingPanel.processInstruction("default", getMessage('selectRm'));
        drawingPanel.processInstruction("ondwgload", getMessage('selectRm'));
	    
    },
    
   
    /**
     * Get assignment panel array for insertUpdateRmpctRecordsFromDpServiceRequest
     */
    getAssignmentArray:function(isInitial){
    	var grid = this.abSpDpAssignGrid;
    	var arrObject=new Array();
         for (var j = 0; j < grid.rows.length; j++) {
             var row = grid.rows[j];
             var legend_level=row["rm.claimOrRelease.raw"];
             
             var dv_id='';
             var dp_id='';
             if(legend_level=='Claim'){
             	dv_id=this.dvId;
             	dp_id=this.dpId;
             }else{
             	dv_id="";
             	dp_id="";
             }
             var pct_id=row["rm.pct_id"];
             if(!isInitial&&pct_id==''){
	             if(this.originalAssignments.length>0){
	            	 for(var m=0;m<this.originalAssignments.length;m++)  {
	            		 var blIdOld=this.originalAssignments[m]['bl_id'];
	            		 var flIdOld=this.originalAssignments[m]['fl_id'];
	            		 var rmIdOld=this.originalAssignments[m]['rm_id'];
	            		 var pctIdOld=this.originalAssignments[m]['pct_id'];
	            		 if(row["rm.bl_id"]==blIdOld&&row["rm.fl_id"]==flIdOld&&row["rm.rm_id"]==rmIdOld){
	            			 pct_id=pctIdOld;
	            		 }
	            	 }
	                   
	             }
             } 
        
             var obj=new Object();
             obj["pct_id"]=pct_id;
             obj["bl_id"]=row["rm.bl_id"];
             obj["fl_id"]=row["rm.fl_id"];
             obj["rm_id"]=row["rm.rm_id"];
             obj["dv_id"]=dv_id;
             obj["dp_id"]=dp_id;
             obj["status"]=0;
             obj["activity_log_id"]=parseInt(this.activityLogId);
             obj["action"]="insert";
             obj["legend_level"]=legend_level;
             arrObject.push(obj);
           
         }
         return arrObject;
    },
    
    /**
     * Get assignment panel array for highlight
     */
    getAssignmentLoc:function(){
    	var grid = this.abSpDpAssignGrid;
    	var arrObject=new Array();
         for (var j = 0; j < grid.rows.length; j++) {
             var row = grid.rows[j];
             var obj=new Object();
             obj["bl_id"]=row["rm.bl_id"];
             obj["fl_id"]=row["rm.fl_id"];
             obj["rm_id"]=row["rm.rm_id"];
         
             arrObject.push(obj);
           
         }
         return arrObject;
    },
    
    /**
     * Claim selected assignment
     */
    abSpDpAssignGrid_onSelectRmClaim:function(){
    	abSpAsgnDpToRm_Controller.getRequestDate();
    	var locArray=this.getLocArray();

    	this.rmClaimGrid.addParameter('locArray',locArray);
    	this.rmClaimGrid.addParameter('requestDate', this.requestDate);
    	this.rmClaimGrid.refresh();
    	this.rmClaimGrid.show(true);
    	this.rmClaimGrid.showInWindow({
    		width: 1300,
    		height: 500,
    		closeButton: false
    	});
    },

    /**
     * Release selected assignment
     */
    abSpDpAssignGrid_onSelectRmRelease:function(){
    	abSpAsgnDpToRm_Controller.getRequestDate();
    	var locArray=this.getLocArray();
    	this.rmRleaseGrid.addParameter('locArray',locArray);
    	this.rmRleaseGrid.addParameter('requestDate', this.requestDate);
    	this.rmRleaseGrid.addParameter('dvId', this.dvId);
    	this.rmRleaseGrid.addParameter('dpId', this.dpId);
    	
    	this.rmRleaseGrid.refresh();
    	this.rmRleaseGrid.show(true);
    	this.rmRleaseGrid.showInWindow({
    		width: 1300,
    		height: 500,
    		closeButton: false
    	});
    },
    
  
    
    rmClaimGrid_onSaveAndClose:function(){
    	var records = this.rmClaimGrid.getPrimaryKeysForSelectedRows(this.rmClaimGrid);
    	this.rmClaimGrid.closeWindow();
    	for(var i=0;i<records.length;i++){
    		var pk=[];
    		pk[0]=records[i]['rm.bl_id'];
    		pk[1]=records[i]['rm.fl_id'];
    		pk[2]=records[i]['rm.rm_id'];
    		loadAssignmentByGivenRm(pk,true,'Claim');
    	}
    	reSetHighLight(1);
    	
    },
    
    /**
     * Save and close function for selected record.
     */
    rmRleaseGrid_onSaveAndClose:function(){
    	
    	var records = this.rmRleaseGrid.getPrimaryKeysForSelectedRows(this.rmRleaseGrid);
    	this.rmRleaseGrid.closeWindow();
    	for(var i=0;i<records.length;i++){
    		var pk=[];
    		pk[0]=records[i]['rm.bl_id'];
    		pk[1]=records[i]['rm.fl_id'];
    		pk[2]=records[i]['rm.rm_id'];
    	loadAssignmentByGivenRm(pk,true,'Release');
    	}
    	 reSetHighLight(1);
    	
    },
    
    /**
     * Get assignment array from assignment list.
     */
    getLocArray:function(){
    	var arrObject=this.getAssignmentLoc();
    	if(arrObject.length>0){
    		var key=arrObject[0];
    		var locString="'"+key['bl_id']+'-'+key['fl_id']+'-'+key['rm_id']+"'"; 
    		for(var i=1;i<arrObject.length;i++){
    			var key=arrObject[i];
    			var loc="'"+key['bl_id']+'-'+key['fl_id']+'-'+key['rm_id']+"'"; 

    			locString=locString+","+loc
    		}
    		return locString;
    	}else{
    		return "'null'";
    	}
    	
    }
});

/**
 * set parameter to Label dataSource
 */
function setParametersToDataSource(requestDate){
	abSpAsgnDpToRm_Controller.getRequestDate();
	var arrayDs = ['ds_ab-sp-asgn-em-to-rm_drawing_availRm','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel1','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel2','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel3','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel4'];
	for(var i=0;i<arrayDs.length;i++){
		var drawingDataSource = View.dataSources.get(arrayDs[i]);
		if(drawingDataSource){
			drawingDataSource.addParameter('p_date_start', requestDate);
			drawingDataSource.addParameter('p_date_end', requestDate);
		}
	}
}
/**
 * Register this function to tree for running after we click flooring.
 */
function runAfterTreeClicked(){
	abSpAsgnDpToRm_Controller.getRequestDate();

	var c=abSpAsgnDpToRm_Controller;
	c.currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
	c.blId = getValueFromTreeNode(c.currentNode, 'bl.bl_id');
	c.flId = getValueFromTreeNode(c.currentNode, 'fl.fl_id');
	c.dwgName = getValueFromTreeNode(c.currentNode, 'fl.dwgname');
	abSpAsgnDpToRm_Controller.dwgName = c.dwgName;

	 	abSpAsgnDpToRm_Controller.loadDrawing();
	 	
	 	reSetHighLight.defer(800,c, [1]);
}

/**
 * Submit request function.
 */
function onNext(){
	abSpAsgnDpToRm_Controller.getRequestDate();
	var currentAssignmentArray=abSpAsgnDpToRm_Controller.getAssignmentArray(false);
	var requestDate=abSpAsgnDpToRm_Controller.requestDate;;
	var newAssignment=compareAssignmentsChangeReturnNew(abSpAsgnDpToRm_Controller.originalAssignments,currentAssignmentArray);

	//kb 3034042
	if(detectIfExistsMoveFuture(newAssignment, requestDate, getMessage("pendingFutureTransMoveOut"), 2)){
		return;
	}

	//kb#3043425:  add logics to check the same day department/move requests.
	var checkResult =  existsDepartmentAndMoveOnSameDay(newAssignment, requestDate, 0);
	if ( checkResult ) {
		View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
			if (button == 'no') {
				return;
			} else { 
				runSubmitWorkflowRule(newAssignment, requestDate);
			}
		});
	} 
	else 
		runSubmitWorkflowRule(newAssignment, requestDate);
}

function runSubmitWorkflowRule(newAssignment, requestDate){
	var record = ABHDC_getDataRecord2(abSpAsgnDpToRm_Controller.requestPanel);
	var activityLogIdValue = abSpAsgnDpToRm_Controller.activityLogId;                    
	if(activityLogIdValue == ''){
		activityLogIdValue = 0;
	}

	var result;
	try {
		result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-submitDepartmentSpace",
				record, requestDate,parseInt(activityLogIdValue),newAssignment);
	}catch(e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
			Workflow.handleError(e);
		}
		return;
	}

	if (result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get('helpDeskRequestTabs');
		var rest = new Ab.view.Restriction();
		rest.addClause("activity_log.activity_log_id",activityLogIdValue,"=");

		//add for support dynamic tabs in 20.1 and also keep compatible with other applications that not dynamic tabs like On Demand - Create Maintenance Service Request(Guo 2011/06/23)
		var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
		if(dynamicAssemblyTabsController){
			dynamicAssemblyTabsController.selectNextTab(rest);
		}else{
			tabs.selectTab("departmentSpaceResult",rest,false,false,false);	
		}
	}else{
		Workflow.handleError(result);            		 
	}
}

/**
 * get value from tree node
 * @param {Object} treeNode
 * @param {String} fieldName
 */
function getValueFromTreeNode(treeNode, fieldName){
    var value = null;
    if (treeNode.data[fieldName]) {
        value = treeNode.data[fieldName];
        return value;
    }
    if (treeNode.parent.data[fieldName]) {
        value = treeNode.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.parent.data[fieldName];
        return value;
    }
    return value;
}

/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){

	var c=abSpAsgnDpToRm_Controller;
	c.assignments_changed=1;
	var grid = View.panels.get("abSpDpAssignGrid");
	var rows=grid.rows;
	if(rows.length==0)return;
	var tempRows = [];
	
	 for (var i = 0; i < rows.length ; i++) {
		 var row = rows[i];
		 tempRows.push(row);
	 }
	 
	 grid.removeRows(0);
	 grid.update();
	 
	 c.abSpAsgnUserDpToRm_drawingPanel.refresh();
	 grid.sortEnabled = false;
	 grid.rows.showCounts=true;
	 
	 reSetHighLight(0, tempRows);
	 setSelectabilityforCurrentFloor();
}


/**
 * Event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingClicked(pk, selected){
	abSpAsgnDpToRm_Controller.getRequestDate();
    var grid = View.panels.get("abSpDpAssignGrid");
    
    var c=abSpAsgnDpToRm_Controller;
  
    var ds2=c.abHelpdeskRequestCreateDpSpAssignDrawingDS2;
    ds2.addParameter('requestDate', c.requestDate);
    ds2.addParameter('blId', pk[0]);
    ds2.addParameter('flId', pk[1]);
    
    ds2.addParameter('rmId', "='"+pk[2]+"'");
    ds2.addParameter('dvId', c.dvId);
    ds2.addParameter('dpId', c.dpId);
    var record=ds2.getRecord();
    var dvId=record.getValue("rm.dv_id");
    var dpId=record.getValue("rm.dp_id");
    var legend_level=record.getValue("rm.legend_level");
    
    var claimOrRelease;
    if(legend_level=='yellow'){
    	claimOrRelease='Release';
    }else if(legend_level=='blue'){
    	claimOrRelease='Claim';
    }else{
    	return;
    }
    var originalRooms=abSpAsgnDpToRm_Controller.originalAssignments;
    
		for (var i = 0; i < originalRooms.length; i++) {
			var object = originalRooms[i];
			if(record.getValue('rm.bl_id') == object['bl_id']&&record.getValue('rm.fl_id') == object['fl_id']&&record.getValue('rm.rm_id') == object['rm_id']){
				var opts_selectable = new DwgOpts();
			    opts_selectable.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
				opts_selectable.appendRec(record.getValue('rm.bl_id') + ';' + record.getValue('rm.fl_id') + ';' + record.getValue('rm.rm_id'));
				claimOrRelease=object['legend_level'];
			}
		}
    				
    loadAssignmentByGivenRm(pk,selected,claimOrRelease);
    
    if(abSpAsgnDpToRm_Controller.bFound){
    	var deletedRows = [];
    	deletedRows.push(abSpAsgnDpToRm_Controller.deletedRow);
    	reSetHighLight(0, deletedRows);
    }else{
    	reSetHighLight(1);
    }
    	
    
}
/**
 * Higlit drawing for claim and release function.
 * @param pk
 * @param selected
 * @param claimOrRelease
 */
function loadAssignmentByGivenRm(pk,selected,claimOrRelease){
	 var grid = View.panels.get("abSpDpAssignGrid");
	 var c=abSpAsgnDpToRm_Controller;
	 c.assignments_changed=1;
	 if(claimOrRelease=='Claim'){
		 drawingRoomClickHandler(pk, selected, grid, 'rm.dv_id', c.dvId, 'rm.dp_id', c.dpId,'rm.claimOrRelease',claimOrRelease,'');
	 }else if(claimOrRelease=='Release'){
		 drawingRoomClickHandler(pk, selected, grid, 'rm.dv_id', '', 'rm.dp_id', '','rm.claimOrRelease',claimOrRelease,'');
	 }
    
}

/**
 * all rm in the same floor can not selectable
 * @param selectFlag
 */
function setSelectabilityforCurrentFloor(){
	
    var drawingPanel = View.panels.get('abSpAsgnUserDpToRm_drawingPanel');
	 //first set all room unselectable.
    var allroomDataSource = View.dataSources.get('rmDS');
    var restriction = " bl_id = '"+abSpAsgnDpToRm_Controller.blId + "'  and fl_id = '"+ abSpAsgnDpToRm_Controller.flId + "'";
    var allRmRecords = allroomDataSource.getRecords(restriction);
	for (var j = 0; j < allRmRecords.length; j++) {
		var record = allRmRecords[j];
		var opts_selectable = new DwgOpts();
	    opts_selectable.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
        var legend_level = record.getValue('rm.legend_level');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        drawingPanel.setSelectability(opts_selectable, false);
	}
}

/**
 * private method reset Hightlight for deleted or new added rooms. flag=0 delete
 * flag=1 add
 */
function reSetHighLight(flag, rows){
	abSpAsgnDpToRm_Controller.getRequestDate();
	var c=abSpAsgnDpToRm_Controller;
	var ds=c.abHelpdeskRequestCreateDpSpAssignDrawingDS2;
	
    ds.addParameter('requestDate', c.requestDate);
    ds.addParameter('blId', c.blId);
    ds.addParameter('flId', c.flId);
    ds.addParameter('dvId', c.dvId);
    ds.addParameter('dpId', c.dpId);
    ds.addParameter('rmId', "IS NOT NULL");
    var records=ds.getRecords();
	var grid = c.abSpDpAssignGrid;
    var drawingPanel = View.panels.get('abSpAsgnUserDpToRm_drawingPanel');
    var originalRooms=abSpAsgnDpToRm_Controller.originalAssignments;
    
    
    if(flag==0){
    	
    	var rooms = getNotExistInGridRooms(records, rows);

    	for (var j = 0; j < rooms.length; j++) {
    		var record = rooms[j];
    		var opts_selectable = new DwgOpts();
    	    opts_selectable.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
    		
    		 //set drawing cannot be clicked
	        var legend_level = record.getValue('rm.legend_level');
	        var blId = record.getValue('rm.bl_id');
	        var flId = record.getValue('rm.fl_id');
	        var rmId = record.getValue('rm.rm_id');
	        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
    		//add hightlight logic fix the bug when you toggle click a room 
			var color = null;
			if(legend_level=='yellow'){
				color = '0XF4D474';
			}else if(legend_level=='blue'){
				color = '0X7DCEA3'; //BEE7D1
			}
			opts_selectable.setFillColor(color);
			drawingPanel.setSelectColor(color);
			drawingPanel.highlightAssets(opts_selectable);
			
			
    		for (var i = 0; i < originalRooms.length; i++) {
    			var object = originalRooms[i];
    			if(record.getValue('rm.bl_id') == object['bl_id']&&record.getValue('rm.fl_id') == object['fl_id']&&record.getValue('rm.rm_id') == object['rm_id']){
    				var opts_selectable = new DwgOpts();
    			    opts_selectable.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
    				opts_selectable.appendRec(record.getValue('rm.bl_id') + ';' + record.getValue('rm.fl_id') + ';' + record.getValue('rm.rm_id'));
    				var color = null;
    				if(object['legend_level']=='Release'){
    					color = '0XF0C239';
    				}else if(object['legend_level']=='Claim'){
    					//color = '45B97C';
    					color = '0X45B97C';
    				}
    				opts_selectable.setFillColor(color);
    				drawingPanel.setSelectColor(color);
    				drawingPanel.highlightAssets(opts_selectable);
    				break;
    			}
    		}
    	}

    }
    
    var arrObject=c.getAssignmentLoc();
	for (var j = 0; j < arrObject.length; j++) {
		var key=arrObject[j];
		
		if(key["bl_id"]!=c.blId||key["fl_id"]!=c.flId){
			continue;
		}
		var opts = new DwgOpts();
		opts.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
		opts.appendRec(key["bl_id"] + ';' + key["fl_id"] + ';' + key["rm_id"]);
		drawingPanel.setSelectColor('0xFFFF00');// yellow
		drawingPanel.highlightAssets(opts);
	}
    
}

/**
 * private method get deleted rooms.
 */
function getNotExistInGridRooms(records, rows){

	var result = [];
	
    for ( var i = 0; i < records.length; i++) {
		var record = records[i];
		
		var blId = record.getValue('rm.bl_id');
		var flId = record.getValue('rm.fl_id');
		var rmId = record.getValue('rm.rm_id');
		
		for (var j = 0; j < rows.length; j++) {
			var row = rows[j];
	        
			if(blId == row['rm.bl_id']&& flId == row['rm.fl_id']&& rmId == row['rm.rm_id']){
				result.push(record);
				break;
			}
			
		}
	}
	return result;	
}

/**
 * onclick handler for clicking room in drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 * @param {Object} grid
 * @param {String} field1
 * @param {String} value1
 * @param {String} field2
 * @param {String} value2
 */
function drawingRoomClickHandler(pk, selected, grid, field1, value1, field2, value2,field3, value3,pctIdValue){
    var rec = new Ab.data.Record();
    var name = pk[0] + "-" + pk[1] + "-" + pk[2];
    	rec.setValue("composite.loc", name);
    	rec.setValue(field1, value1);
    
    if (field2) {
        rec.setValue(field2, value2);
   		}	
    if (field3) {
        rec.setValue(field3, value3);
   		}
		rec.setValue('rm.bl_id', pk[0]);
		rec.setValue('rm.fl_id', pk[1]);
        rec.setValue('rm.rm_id', pk[2]);
        rec.setValue('rm.pct_id', pctIdValue);
    // Find the existing grid row and remove it, if it exists
        abSpAsgnDpToRm_Controller.bFound = false;
    for (var i = 0; i < grid.gridRows.length && !abSpAsgnDpToRm_Controller.bFound; i++) {
        var row = grid.gridRows.items[i];
        if (row.getFieldValue("composite.loc") == name) {
        	abSpAsgnDpToRm_Controller.deletedRow = grid.rows[i];
            grid.removeGridRow(row.getIndex());
            abSpAsgnDpToRm_Controller.bFound = true;
        }
    }
    if(!abSpAsgnDpToRm_Controller.bFound)
    	
    	grid.addGridRow(rec);
        grid.sortEnabled = false;
        grid.rows.showCounts=true;
        grid.update();
}

/**
 * set legend text according the legend level value.
 * @param {Object} row
 * @param {Object} column
 * @param {Object} cellElement
 */
function setLegendLabel(row, column, cellElement){
    var value = row[column.id];
    if (column.id == 'legend.value' && value != '') {
        var text = '';
        switch (value) {
        	case 'blue':
        		text = getMessage('legendLevel0');
        		break;
            case 'yellow':
                text = getMessage('legendLevel1');
                break;
        }
        var contentElement = cellElement.childNodes[0];
        if(contentElement)
         contentElement.nodeValue = text;
    }
}

/**
 * Cancel selected assignment
 */
function revertSelectedAssignment(){
	var c=abSpAsgnDpToRm_Controller;
	c.assignments_changed=1;
	var grid = View.panels.get("abSpDpAssignGrid");
	var rows=grid.getSelectedRows();
	if(rows.length==0){
		View.alert(getMessage('selectRecord'));
		return;
	}
	 for (var i = 0; i < rows.length ; i++) {
		 var row = rows[i];
		 grid.removeGridRow(row.row.getIndex());
		 grid.update();
	 }
	 c.abSpAsgnUserDpToRm_drawingPanel.refresh();
	 grid.sortEnabled = false;
	 
	 grid.rows.showCounts=true;
	 reSetHighLight(0, rows);
	 setSelectabilityforCurrentFloor();
}

/**
 * Control drawing click function on drawing loading
 */
function onDwgLoaded() {
	abSpAsgnDpToRm_Controller.getRequestDate();
	var c=abSpAsgnDpToRm_Controller;
	   var drawingPanel = View.panels.get('abSpAsgnUserDpToRm_drawingPanel');    
	   var drawingDataSource=c.abHelpdeskRequestCreateDpSpAssignDrawingDS;
    drawingDataSource.addParameter('blId',c.blId );
    drawingDataSource.addParameter('flId',c.flId );
    drawingDataSource.addParameter('rmId'," is not null" );
    drawingDataSource.addParameter('dvId',c.dvId );
    drawingDataSource.addParameter('dpId',c.dpId );
    drawingDataSource.addParameter('requestDate',c.requestDate );
    var rmRecords = drawingDataSource.getRecords();
    var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id", c.blId,'='); 
	restriction.addClause("rm.fl_id", c.flId,'=');
    var rmRecords0=c.rmDS.getRecords(restriction); 
    //set drawing cannot be clicked
    for (var i = 0; i < rmRecords0.length; i++) {
        var record = rmRecords0[i];
        var legend_level = record.getValue('rm.legend_level');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        	drawingPanel.setSelectability(opts_selectable, false);
    }
  //set some room can be clicked
   for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var legend_level = record.getValue('rm.legend_level');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.rawDwgName = abSpAsgnDpToRm_Controller.dwgName;
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        if (legend_level == 'yellow'||legend_level == 'blue') {
        	drawingPanel.setSelectability(opts_selectable, true);
        }
    }
}
/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr
 * @returns
 */
function dateFormat(dateStr){
	if(dateStr!=null&&dateStr!='')
	  return dateStr.split("/")[2]+"-"+dateStr.split("/")[0]+"-"+dateStr.split("/")[1];
	else 
	  return "";
}
/**
 * return current date
 * @returns {String}
 */
function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
//    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
    return  ((month < 10) ? "0" : "") + month + "/" + ((day < 10) ? "0" : "") + day + "/" +year ;
}
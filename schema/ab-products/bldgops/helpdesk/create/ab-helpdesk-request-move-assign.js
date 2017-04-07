/**
 * @author: Song
 */
/**
 * call automatic and refresh all panel in assignment tab when it isn't first load. 
 */
function user_form_afterSelect() {
	if (controllerGmAssign.isNotFirstTimeLoad) {
		controllerGmAssign.refreshAllPanels();
	}
//	controllerGmAssign.isNotFirstTimeLoad = true;
}

var controllerGmAssign = View.createController('abSpAsgnEmToRm_Controller', {
	/**
	 * current tabs object 
	 * initiate after view load
	 */
	tabs: null,
	/**
	 * a String of current activity type value like 'SERVICE DESK - GROUP MOVE'
	 * initiate after view load
	 */
	currentActivityTypeValue: null,
	/**
	 * a flag determine if multiple selection in assign gird is necessary according current view is 'individual move' or 'group move'
	 */
	ifDeleteColumn: true,
	/**
	 * assignments after view InitialDataFetch for select move panel.
	 */
	originalSelectAssignments: null,
	/**
	 * assignments after view InitialDataFetch
	 */
	originalAssignments: null,
	/**
	 * select grid.
	 * kb 3034262 Add action/new design for Select Employee in Group Move
	 */
	selectGrid: null,
	
	/**
	 * flag of first time load.
	 */
	isNotFirstTimeLoad: false,
	
	/**
	 * dwg name.
	 */
	dwgName: null,
	
	/**
	 * This event handler is called after View Load. 
	 * initiate drawing panel 'abSpAsgnEmToRm_drawingPanel'
	 */	
    afterViewLoad: function(){
        // Specify instructions for the Drawing Control
    	View.controllers.get('controllerConsole').registerPrevious(this.onPrevious);
		View.controllers.get('controllerConsole').registerNext(this.onNext);
		View.controllers.get('controllerConsole').registerApprove(this.onApprove);
		View.controllers.get('controllerConsole').registerReject(this.onReject);
		View.controllers.get('controllerConsole').registerSave(this.onSave);//kb 3033489
		View.controllers.get('controllerConsole').registerIssue(this.onIssue);
		View.controllers.get('controllerConsole').registerCancel(this.onCancel);
		View.controllers.get('controllerConsole').registerComplete(this.onComplete);
		View.controllers.get('controllerConsole').registerStop(this.onStop);
		
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectEm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_drawingPanel", "onclick", getMessage('selectRm'));
        this.abSpAsgnEmToRm_drawingPanel.addEventListener('onclick', onDwgPanelClicked);
		this.abSpAsgnEmToRm_drawingPanel.addEventListener('ondwgload', onDwgLoaded);
		
        this.abSpAsgnEmToRm_legendGrid.afterCreateCellContent = setLegendLabel;

        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_emSelect", "onclick", getMessage('selectRm'));
        this.abSpAsgnEmToRm_emSelect.addEventListener('onMultipleSelectionChange', onEmSelectionChange);
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_rmpctSelect", "onclick", getMessage('selectRm'));
        this.abSpAsgnEmToRm_rmpctSelect.addEventListener('onMultipleSelectionChange', onEmSelectionChange);
    },
    
    /**
     * after Initial Data Fetch.
     */
    afterInitialDataFetch: function() {
    	this.refreshAllPanels();
    },
    
    /**
     * Primary Employee Location shows as "1" or "0". change to "Yes" or "No" use this method.
     */
    handlePrimaryEmTranslator: function(){
    	
	  	this.abSpAsgnEmToRm_rmpctSelect.addParameter('p_yes', getMessage('messageYes'));
	  	this.abSpAsgnEmToRm_rmpctSelect.addParameter('p_no', getMessage('messageNo'));
    },
    
    /**
     * This event handler is called after all view data fetch complete. 
     * 1.check current business logic is 'individual move', 'group move' or approve.
     * 2.for different function, rearrange layout size form north region.
     * 3.show default assign employee list if it is approve.
     * 4.initiate variable 'tabs' and 'currentActivityTypeValue'
     */
    refreshAllPanels: function(){
    	this.handlePrimaryEmTranslator();
    	View.controllers.get('treeController').register(runAfterTreeClicked);
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	var tabs = this.tabs;
  	    //check if it is create individual move
  	    var tabBasic = tabs.findTab("basic");
  		//for the individual or group approve function.
  		var activityTypeValue = tabs.activityTypeValue;
  		if(tabBasic&&tabBasic.restriction){
  	    	var restriction = tabBasic.restriction;
  	        activityTypeValue = restriction["activitytype.activity_type"];
  		}
		this.currentActivityTypeValue = activityTypeValue;
		
		var ruleset = new DwgHighlightRuleSet();

		
//  	kb 3037622  use method 'defer(1000... ' before call method 'appendRuleSet' wait until drawing loaded.
		var isNotFirstTimeLoad = controllerGmAssign.isNotFirstTimeLoad;
  	    if(tabs!=null&&tabs.funcType=="group_move_approve"){
//  	    this.invokeGroupMoveApproveInitialize(tabs, ruleset);
  	    	this.invokeGroupMoveApproveInitialize.defer(1000, this, [tabs, ruleset,isNotFirstTimeLoad]);
  	    }else{
//  	    this.invokeGroupMoveInitialize(tabs, ruleset, activityTypeValue);
  	    	this.invokeGroupMoveInitialize.defer(1000, this, [tabs, ruleset, activityTypeValue,isNotFirstTimeLoad]);
  	    }
  	    //  for issue hidden 'Change from location' button 
  	    if(tabs!=null&&tabs.issue==true){
  	       this.hiddenToLocation();
  	    }
  	    //refresh document tab.
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log.activity_log_id", tabs.activityLogIdValue);
    	this.documentsPanel.refresh(restriction);
    },
    
    /**
     * private method.
     * call this method when web page load for 'group more approve' logic.
     */
    invokeGroupMoveApproveInitialize: function(tabs, ruleset,isNotFirstTimeLoad){
    	
	    if (!isNotFirstTimeLoad) {//solve the legend color duplicate issue.
    		//use another HighLight dataSource
    		//3035014 if it's space manager also move to more room.
  	    	this.abSpAsgnEmToRm_drawingPanel.currentHighlightDS="ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove";
	        ruleset.appendRule("rm.legend_level", "0", "33FF00", "==");//soft green    :Vacant
  	        ruleset.appendRule("rm.legend_level", "1", "0000FF", "==");//bule          :Available
  	        //KB3037147 - change at-capacity to E7CB0A to avoid confusing the room selection color
  	        ruleset.appendRule("rm.legend_level", "2", "E7CB0A", "==");//yellow        :At Capacity
  	        ruleset.appendRule("rm.legend_level", "3", "FF0000", "==");//red           :Exceeds Capacity
  	        ruleset.appendRule("rm.legend_level", "4", "00FFFF", "==");//              :Pending request
  	        this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove", ruleset);
	        }
	    	//show assign list by default
	    	this.defaultAddEmployeeToAssign(tabs);
	    	this.hiddenToLocation();
	    	this.abSpAsgnEmToRm_emSelect.actions.get('addSelected').show(true);
	    	this.abSpAsgnEmToRm_emSelect.actions.get('removeSelected').show(true);
	    	this.originalSelectAssignments = this.getAssignments(this.abSpAsgnEmToRm_emSelect);
		this.abSpAsgnEmToRm_emSelect.setTitle(getMessage('abSpAsgnEmToRmEmSelectTitle'));
    	
		this.abSpAsgnEmToRm_rmpctSelect.show(false);  
  	    this.selectGrid = this.abSpAsgnEmToRm_emSelect;	 

  	    //get origianl assignments before made change.
  	    this.originalAssignments = this.getAssignments();
    },

    /**
     * private method.
     * call this method when web page load for 'request group move' logic.
     */
    invokeGroupMoveInitialize: function(tabs, ruleset, activityTypeValue,isNotFirstTimeLoad){

    	if(activityTypeValue=="SERVICE DESK - GROUP MOVE"){
  	    	if (!isNotFirstTimeLoad) {//solve the legend color duplicate issue.
  	    		if(existsUserRoleProcess()){
  	    			this.abSpAsgnEmToRm_drawingPanel.currentHighlightDS="ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove";
  	    			ruleset.appendRule("rm.legend_level", "0", "33FF00", "==");//soft green    :Vacant
  	    			ruleset.appendRule("rm.legend_level", "1", "0000FF", "==");//bule          :Available
  	    		    //KB3037147 - change at-capacity to E7CB0A to avoid confusing the room selection color
  	    			ruleset.appendRule("rm.legend_level", "2", "E7CB0A", "==");//yellow        :At Capacity
  	    			ruleset.appendRule("rm.legend_level", "3", "FF0000", "==");//red           :Exceeds Capacity
  	    			ruleset.appendRule("rm.legend_level", "4", "00FFFF", "==");//              :Pending request
  	    			this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove", ruleset);
  	    		}else{
  	    			ruleset.appendRule("rm.legend_level", "0", "33FF00", "==");//soft green    :Vacant
  	    			ruleset.appendRule("rm.legend_level", "1", "0000FF", "==");//bule          :Available
  	    			ruleset.appendRule("rm.legend_level", "4", "00FFFF", "==");//              :Pending request
  	    			this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm", ruleset);
  	    		}
  	    	}
        	this.abHelpRequestTreeConsole.actions.get("approve").show(false);
        	
        	this.abSpAsgnEmToRm_emAssigned.actions.get('clear').show(false);
	        	
	        //kb 3034262 Add action/new design for Select Employee in Group Move

        	this.abSpAsgnEmToRm_emSelect.show(false);  	  	    	
  	    	this.abSpAsgnEmToRm_rmpctSelect.addParameter('p_date_start', dateFormat(tabs.date_end));
  	    	this.abSpAsgnEmToRm_rmpctSelect.addParameter('p_date_end', dateFormat(tabs.date_end));
  	    	this.abSpAsgnEmToRm_rmpctSelect.refresh();
  	    	this.abSpAsgnEmToRm_rmpctSelect.show(true);
  	    	this.showOrHiddenFields(this.abSpAsgnEmToRm_rmpctSelect);
  	    	this.selectGrid = this.abSpAsgnEmToRm_rmpctSelect;
        }
        //give 'tabs.bl_id' to treeConsole and Show related tree.
        if(tabs.bl_id){
        	this.abHelpRequestTreeConsole.setFieldValue("rmpct.bl_id", tabs.bl_id);
        	controllerConsole.abHelpRequestTreeConsole_onFilter();
        }
		this.updatePanel.show(false);

  	    //get origianl assignments before made change.
  	    this.originalAssignments = this.getAssignments();
    },
    
    /**
     * private method
     */
    abSpAsgnEmToRm_emSelect_onAddSelected: function(){
    	var list = [];
    	var gridSelect = this.abSpAsgnEmToRm_emSelect;
        for (var j = 0; j < gridSelect.rows.length; j++) {
            var row = gridSelect.rows[j];
            list.push(row["em.em_id"]);
        }    
        var restriction = new Ab.view.Restriction();
        if(list!=null&&list.length>0){
        	restriction = " em.em_id not in (" + this.changeFormatForSqlIn(list) + ")";
        }  	  	    	
	    this.abSpAsgnEmToRm_emSelect_PopUp.addParameter('p_date_start', this.dateFormat(this.tabs.date_end));
	  	this.abSpAsgnEmToRm_emSelect_PopUp.addParameter('p_date_end', this.dateFormat(this.tabs.date_end));
	  	this.abSpAsgnEmToRm_emSelect_PopUp.addParameter('primaryRm', '1=1');
    	this.abSpAsgnEmToRm_emSelect_PopUp.refresh(restriction);
    	
    	this.abSpAsgnEmToRm_emSelect_PopUp.showInWindow({
    		width: 800,
    		height: 500
    	});
    },
    /**
     * private method, return date format mm/dd/yyyy 
     * @param dateStr
     * @returns
     */
    dateFormat: function(dateStr){
    	if(dateStr!=null&&dateStr!='')
    	  return dateStr.split("/")[2]+"-"+dateStr.split("/")[0]+"-"+dateStr.split("/")[1];
    	else 
    	  return "";
    },
    /**
     * for method 'abSpAsgnEmToRm_rmpctSelect_onShowAllLocations'
     * true: show all location
     * false: show primary location
     */
    buttonFlag: true,
    /**
     * user selects the button "Show All Locations":
     */
    abSpAsgnEmToRm_rmpctSelect_onShowAllLocations: function(){
    	var action = this.selectGrid.actions.get('showAllLocations');
    	if(this.buttonFlag){
    		this.selectGrid.addParameter('primaryRm', '1=1');
    		action.setTitle(getMessage('showPrimaryLocation'));
    		this.buttonFlag = false;
    	}else{
    		this.selectGrid.addParameter('primaryRm', '(rmpct.primary_em = 1 OR rmpct.primary_em IS NULL)');
    		action.setTitle(getMessage('showAllLocation'));
    		this.buttonFlag = true;
    	}
    	this.selectGrid.refresh();
        
    },
    /**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+array[i]+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },
    /**
     * private method
     */
    abSpAsgnEmToRm_emSelect_onRemoveSelected: function(){
       var grid = this.abSpAsgnEmToRm_emSelect;
       var records = grid.getSelectedRows();
       for ( var i = 0; i < records.length; i++) {
	   		var row = records[i];
	   	    grid.removeGridRow(row.row.getIndex());
	   	    grid.update();
   	   }
       //kb 3035628 Should not change panel titile
//       if(grid.rows.length==0){
//    	   this.abSpAsgnEmToRm_emSelect.setTitle(getMessage('abSpAsgnEmToRmEmSelectTitle'));
//       }
       onEmSelectionChange();//kb 3041899,also need to update the checkbox after remove row.
    },
    /**
     * private method.
     */
    hiddenToLocation: function(){
        var grid = this.abSpAsgnEmToRm_emAssigned;
        grid.hideColumn("toLocation");
		grid.update();
    },
    /**
     * This event handler is called when click the tree bl. 
     * private method
     */
    onTreeFlClick: function(ob){
    	var tabs = this.tabs;
    	var activityTypeValue = this.currentActivityTypeValue;
    	//check if group_move_approve
        resetDrawing(tabs.date_start,tabs.date_end,ob);
    },

    /**
     * private method,only use for approve
     * get assigned employee list.
     */
    getMoveRecords: function(tabs,flag){
    	var dsRmpct = View.dataSources.get("ds_for_get_date_use_by_js");
        dsRmpct.addParameter('activity_log_id',tabs.activityLogIdValue);
        if(flag){
        	return dsRmpct.getRecords(" bl_id is null and fl_id is null and rm_id is null");
        }else{
        	return dsRmpct.getRecords(" bl_id is not null and fl_id is not null and rm_id is not null");
        }
    },

    /**
     * private method, get rmpct one record 'date_start' value
     * get assigned employee list.
     */
    getMoveRecordDateStart: function(tabs){
    	var dsRmpct = View.dataSources.get("ds_for_get_date_use_by_js");
    	dsRmpct.addParameter('activity_log_id',tabs.activityLogIdValue);
    	var records = dsRmpct.getRecords();
        if(records!= null&&records.length>0){
            var record = records[0];
            return record.getValue('rmpct.date_start');
        }
        return null;
    },

    /**
     * return true if exist 'current employee move' in assignment panel.
     * without prompt.
     */
    checkIfEmExistInGrid: function(grid, em_id){

        for (var j = 0; j < grid.rows.length; j++) {
            var row = grid.rows[j];
            if(row["em.em_id"] == em_id){
            	return true;
            }
        }
        return false;
    },

    /**
     * return true if exist 'current employee move' in assignment panel.
     * with prompt.
     */
    promptEmsExistInGrid: function(employees){
    	var result = "";
    	for (var i = 0; i < employees.length; i++) {
    		var em_id = employees[i];
    		result += em_id + ";";
    	}
    	if(result.indexOf(";")!=-1){
    		result = result.substring(0,result.length-1);
    	}
    	var message =getMessage("existEmInAssignment").replace("<{0}>", result);
    	View.alert(message);
    },

    /**
     * add default assignments in assignment panel.
     */
    addAssignGrid: function(blArray,emAssigns,grid){
    	
    	//call clear grid rows first remove previous records.
    	grid.clearGridRows();
        for (var i = 0; i < emAssigns.length; i++) {
            var emAssign = emAssigns[i];
            if(emAssign.getValue('rmpct.bl_id')!=""){
            	blArray.push(emAssign.getValue('rmpct.bl_id'));
            }
            emAssign.setValue("em.pct_id", emAssign.getValue('rmpct.pct_id'));
            emAssign.setValue("em.parent_pct_id", emAssign.getValue('rmpct.parent_pct_id'));
            emAssign.setValue("em.activity_log_id", emAssign.getValue('rmpct.activity_log_id'));
            emAssign.setValue("em.em_id", emAssign.getValue('rmpct.em_id'));
            emAssign.setValue("em.bl_id_current", emAssign.getValue('rmpct.from_bl_id'));
            emAssign.setValue("em.fl_id_current", emAssign.getValue('rmpct.from_fl_id'));
            emAssign.setValue("em.rm_id_current", emAssign.getValue('rmpct.from_rm_id'));
            emAssign.setValue("em.bl_id", emAssign.getValue('rmpct.bl_id'));
            emAssign.setValue("em.fl_id", emAssign.getValue('rmpct.fl_id'));
            emAssign.setValue("em.rm_id", emAssign.getValue('rmpct.rm_id'));
            emAssign.setValue("em.dv_id", emAssign.getValue('rmpct.dv_id'));
            emAssign.setValue("em.dp_id", emAssign.getValue('rmpct.dp_id'));
            emAssign.setValue("em.rm_cat", emAssign.getValue('rmpct.rm_cat'));
            emAssign.setValue("em.rm_type", emAssign.getValue('rmpct.rm_type'));
            emAssign.setValue("em.primary_rm", emAssign.getValue('rmpct.primary_rm'));

            //manually change the propority to 'yes' or 'no' if it was '1' or '0'.
            var assignPrimaryEm = emAssign.getValue("rmpct.primary_em");
            if(assignPrimaryEm=="1"){
            	assignPrimaryEm = getMessage("messageYes");
            }else if(assignPrimaryEm=="0"){
            	assignPrimaryEm = getMessage("messageNo");
            }
            emAssign.setValue("em.primary_em", assignPrimaryEm);
            
            grid.addGridRow(emAssign);
        } 
        grid.sortEnabled = false;
        grid.update();
    },

    /**
     * private method.
     */
    abSpAsgnEmToRm_emSelect_PopUp_onAddSelected: function(){
        var records = this.abSpAsgnEmToRm_emSelect_PopUp.getSelectedRows();
        var employees = [];
	    for ( var i = 0; i < records.length; i++) {
	    	var row = records[i];
	    	row["em.bl_id_current"] = row["em.bl_id"];
	    	row["em.fl_id_current"] = row["em.fl_id"];
	    	row["em.rm_id_current"] = row["em.rm_id"];
	    	row["em.bl_id"] = "";
	    	row["em.fl_id"] = "";
	    	row["em.rm_id"] = "";
	    	//for group move , because it was two assignment list, method 'checkIfEmExistInGrid' will check separately.
	    	if(controllerGmAssign.checkIfEmExistInGrid(this.abSpAsgnEmToRm_emSelect, row["em.em_id"])){
	    		employees.push(row["em.em_id"]);
	    		continue;
	    	}
	    	if(controllerGmAssign.checkIfEmExistInGrid(this.abSpAsgnEmToRm_emAssigned, row["em.em_id"])){
	    		employees.push(row["em.em_id"]);
	    		continue;
	    	}
	    	this.abSpAsgnEmToRm_emSelect.addGridRow(row);
	    }
	    if(employees.length>0){
	    	controllerGmAssign.promptEmsExistInGrid(employees);
	    }
	    this.abSpAsgnEmToRm_emSelect.update();
	    this.abSpAsgnEmToRm_emSelect_PopUp.closeWindow();
    },

    /**
     * for move panel only,
     */
    showOrHiddenFields: function(grid){
		for (var i = 0; i< grid.fieldDefs.length; i++) {
			var field = grid.fieldDefs[i];
			if(field.id == 'em.bl_id'||field.id == 'em.fl_id'||field.id == 'em.rm_id'||field.id == 'em.dv_id'||field.id == 'em.dp_id'){
				grid.columns[i+1].hidden = false;
//			}else if(field.id == 'em.bl_id_current'||field.id == 'em.fl_id_current'||field.id == 'em.rm_id_current'||field.id == 'em.primary_em'){
			}else if(field.id == 'em.bl_id_current'||field.id == 'em.fl_id_current'||field.id == 'em.rm_id_current'){
				grid.columns[i+1].hidden = true;
			}
		}	
		grid.update();
    },

    /**
     * private method,only use for approve
     * show default assign employee list in assign panel.
     */
    defaultAddEmployeeToAssign: function(tabs){
    	
        var emAssignsSelect = this.getMoveRecords(tabs,true);
        var emAssigns = this.getMoveRecords(tabs,false);
	    	
        var blArray = [];
        this.addAssignGrid(blArray,emAssignsSelect,this.abSpAsgnEmToRm_emSelect);
        this.addAssignGrid(blArray,emAssigns,this.abSpAsgnEmToRm_emAssigned);
        
        //When the Assignments panel comes up the building(s) that contain the assignments should be filtered by default
        if(blArray.length>0){
        	var blRes = " bl_id in ("+this.changeFormatForSqlIn(blArray)+")";
        	this.abSpAsgnEmToRm_blTree.addParameter('consoleResBl', blRes);
        	this.abHelpRequestTreeConsole.setFieldValue("rmpct.bl_id", this.getStringWithOutRepeat(blArray));
        	this.abSpAsgnEmToRm_blTree.refresh();
        	this.abSpAsgnEmToRm_blTree.show(true);
        	//If the existing assignments are on one floor, that floor should default to display on the Floor Plan panel.
        	var root=this.abSpAsgnEmToRm_blTree.treeView.getRoot();
        	for (var i = 0; i < root.children.length; i++) {
        		var node = root.children[i];
        		if(node.data['bl.bl_id'] == blArray[0]){
        			node.expand();
        			this.clickDefaultFlNode.defer(2000,this, [emAssigns, node]);
        			break;
        		}
        	}
        }
    	if(tabs.issue&&tabs.issue==true){
        	var recordDs = controllerGmAssign.getActivityLog();
        	var status = recordDs.getValue('activity_log.status');
    		//change button name from 'Submit' to 'Approve' and add 'Reject' button.
    		this.abHelpRequestTreeConsole.actions.get("questNext").show(false);
    		this.abHelpRequestTreeConsole.actions.get("approve").show(false);
    		this.abHelpRequestTreeConsole.actions.get("reject").show(false);
    		this.abHelpRequestTreeConsole.actions.get("save").show(status == 'APPROVED');
    		this.abHelpRequestTreeConsole.actions.get("issue").show(status == 'APPROVED');
    		this.abHelpRequestTreeConsole.actions.get("cancel").show(status == 'APPROVED');
    		this.abHelpRequestTreeConsole.actions.get("complete").show(status == 'IN PROGRESS');
    		this.abHelpRequestTreeConsole.actions.get("stop").show(status == 'IN PROGRESS');
    	}else{
    		//change button name from 'Submit' to 'Approve' and add 'Reject' button.
    		this.abHelpRequestTreeConsole.actions.get("questNext").show(false);
    		this.abHelpRequestTreeConsole.actions.get("approve").show(true);
    		this.abHelpRequestTreeConsole.actions.get("reject").show(true);
    	}
    	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log.activity_log_id", tabs.activityLogIdValue);
    	this.documentsPanel.refresh(restriction);
    	this.updatePanel.refresh(restriction);
    },

    getStringWithOutRepeat: function(o){
    	var MULTIPLE_VALUE_SEPARATOR = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
    	var s = "";
    	for(var i = 0; i < o.length; i++){
    		if (s.indexOf(o[i]) == -1){
    			s+=(o[i]+MULTIPLE_VALUE_SEPARATOR);
    		}
    	}
    	if(s.indexOf(MULTIPLE_VALUE_SEPARATOR)!=-1){
    		s = s.substring(0,s.length-MULTIPLE_VALUE_SEPARATOR.length);
    	}
    	return s;
    },

    /**
     * private method
     */
    clickDefaultFlNode: function(emAssigns,node){
    	var current_fl_id = emAssigns[0].getValue('rmpct.fl_id');
    	for (var j = 0; j < node.children.length; j++) {
        	var flNode = node.children[j];
        	if(flNode.data['fl.fl_id'] == current_fl_id){
        		var dwgName = flNode.data['fl.dwgname'];
        		controllerGmAssign.dwgName =  dwgName;
        		flNode.onLabelClick(flNode);
        	    $(flNode.labelElId).command.handle();
        	}
    	}
    },

    /**
     * private method
     */
    getAssignments: function(panel){
    	var grid = this.abSpAsgnEmToRm_emAssigned;
    	if(panel){
    		grid = panel;
    	}
    	var assignments = [];
        for (var j = 0; j < grid.rows.length; j++) {
            var row = grid.rows[j];
            var gridRow = grid.gridRows.items[j];
            var record = new Object();
            var from_bl_id = gridRow.getFieldValue("em.bl_id_current");
            var from_fl_id = gridRow.getFieldValue("em.fl_id_current");
            var from_rm_id = gridRow.getFieldValue("em.rm_id_current");
            record['pct_id'] = row["em.pct_id"];
            record['parent_pct_id'] = row["em.parent_pct_id"];
            record['activity_log_id'] = this.tabs.activityLogIdValue;
            
            var em_id = row["em.em_id"];
    		
            record['em_id'] = em_id;
            record['bl_id'] = row["em.bl_id"]==null?"":row["em.bl_id"];
            record['fl_id'] = row["em.fl_id"]==null?"":row["em.fl_id"];
            record['rm_id'] = row["em.rm_id"]==null?"":row["em.rm_id"];
            record['from_bl_id'] = from_bl_id==undefined?"":from_bl_id;
            record['from_fl_id'] = from_fl_id==undefined?"":from_fl_id;
            record['from_rm_id'] = from_rm_id==undefined?"":from_rm_id;
            record['status'] = status;
            record['action'] = (status==0||status==2)?'insert':'update';
            record['dv_id'] = row["em.dv_id"]==null?"":row["em.dv_id"];
            record['dp_id'] = row["em.dp_id"]==null?"":row["em.dp_id"];
            record['rm_cat'] = row["em.rm_cat"]==null?"":row["em.rm_cat"];
            record['rm_type'] = row["em.rm_type"]==null?"":row["em.rm_type"];
            record['primary_rm'] = row["em.primary_rm"]==null?0:row["em.primary_rm"];
            if(row["em.primary_em.raw"]==getMessage('messageYes')){
            	record['primary_em'] = 1;
            }else if(row["em.primary_em.raw"]==getMessage('messageNo')){
            	record['primary_em'] = 0;
            }
            assignments.push(record);
        }
            return assignments;
    },

    /**
     * event handle when 'previous' button click
     * will go back to previous tab
     */
    onPrevious: function(){
    	var tabs = controllerGmAssign.tabs;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id", tabs.activityLogIdValue);
    	var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
    	if(dynamicAssemblyTabsController){
    		dynamicAssemblyTabsController.selectPreviousTab(restriction);
    	}else{
    		tabs.selectTab("quest", restriction, false, false, false);
    	}
    },

    /**
     * event handler is called when Next button click.
     * 1.check to make sure that only one assigned room is marked "primary"(Primary Em=1) for each employee
     * 2.check to make sure "From Location" and "To Location" are not allow assign with the same room.
     */
    parpareForSubmit: function(){
    	var tabs = controllerGmAssign.tabs;
    	var checkPrimaryEminfo = checkPrimaryEmValue();
    	if(checkPrimaryEminfo!=""){
    	   var message =getMessage("onlyOnePrimaryEm").replace("<{0}>", checkPrimaryEminfo);
    	   View.alert(message);
    	   return false;
    	}
    	var checkRoomInfo = checkIfSameRoom();
    	if(checkRoomInfo!=""){
    		var message =getMessage("onlyDiffRmForEm").replace("<{0}>", checkRoomInfo);
    		View.alert(message);
    		return false;
    	}
	  
    	var originalAssignments = controllerGmAssign.originalAssignments;
    	var changedAssignments = controllerGmAssign.getAssignments();
    	var resultAssignments = compareAssignmentsChangeReturnNew(originalAssignments,changedAssignments);
    	
    	var resultDate = getDateValue();
    	var dateEnd = resultDate[1];
    	//for doc tab use
    	tabs.originalAssignments = originalAssignments;
    	tabs.assignments = resultAssignments;
    	tabs.changedAssignments = changedAssignments;
    	tabs.dateEnd = dateFormat(dateEnd);
    	if(tabs.funcType=="group_move_approve"){
        	var originalSelectAssignments = controllerGmAssign.originalSelectAssignments;
        	var changedSelectAssignments = controllerGmAssign.getAssignments(this.abSpAsgnEmToRm_emSelect);
        	var select = compareAssignmentsChangeReturnNew(originalSelectAssignments,changedSelectAssignments);
        	var assign = tabs.assignments;
        	var resultAssignments = {I:subContact(select.I,assign.I),U:subContact(select.U,assign.U),D:sortArray(subContact(select.D,assign.D))};
        	tabs.assignments = resultAssignments;
    	}
		return true;
    },

    /**
     * event handler is called when Next button click.
     */
    onNext: function(){
    	var tabs = controllerGmAssign.tabs;
    	
    	if( !controllerGmAssign.parpareForSubmit() ){
    		return;
    	}

    	//kb 3034042
    	if(detectIfExistsMoveFuture(tabs.assignments, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 0)){
    		return;
    	}
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id", tabs.activityLogIdValue);
		controllerGmAssign.onCreateGroupMoveSubmit();
     },

     getActivityLog: function(){
     	var tabs = controllerGmAssign.tabs;
  		var activityLogIdValue = tabs.activityLogIdValue; 
     	var docsDS = View.dataSources.get("docsDS");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id", tabs.activityLogIdValue);
 	    return docsDS.getRecords(restriction)[0];
     },

     /**
      * private method
      * return a record like call original method 'ABHDC_getDataRecord2' 
      */
     getRecord: function(){
      	var tabs = controllerGmAssign.tabs;
  		var activityLogIdValue = tabs.activityLogIdValue; 
    	var recordDs = controllerGmAssign.getActivityLog();
 		var record = {"activity_log.activity_log_id" : activityLogIdValue,
 				"activity_log.created_by" : recordDs.getValue('activity_log.created_by'), 
 				"activity_log.requestor" : recordDs.getValue('activity_log.requestor'), 
 				"activity_log.phone_requestor" : recordDs.getValue('activity_log.phone_requestor'), 
 				"activity_log.assessment_id" : recordDs.getValue('activity_log.assessment_id')};
 		return record;
     },

 	/**
 	 * event handle when 'Submit' button  click
 	 * 1.call WFR submitDocMoveServiceRequest
 	 * 2.if true, go to 'select' tab.
 	 */
 	onCreateGroupMoveSubmit: function(){
 		var tabs = controllerGmAssign.tabs;
 		var activityLogIdValue = tabs.activityLogIdValue;
 		var record = controllerGmAssign.getRecord();
 		//check is exist duplicate records
 		var employees = "";
 		for(var i = 0; i<tabs.assignments.I.length; i++){
 			var assignment = tabs.assignments.I[i];
 			if(this.ifExistDuplicateRecords(tabs.dateEnd,assignment['em_id'])){
 				employees+=(assignment['em_id']+"   ");
 			}
 		}
 		if(employees!=""){
 			var thisObj = this;
 			var message =getMessage("existDuplicate").replace("<{0}>", employees);
 			View.confirm(message, function(button){
 				if (button == 'yes') {
 					thisObj.doSubmit(record, tabs, activityLogIdValue);
 				}
 			});
 		}else{
 			this.doSubmit(record, tabs, activityLogIdValue);
 		}
 	},

 	/**
 	 * private method
 	 * for 'create group move' submit
 	 */
 	doSubmit: function(record, tabs, activityLogIdValue){
		//kb#3043425:  add logics to check the same day department/move requests.
		var result =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( result ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", result), function(button){
				if (button == 'no') {
					return;
				} else { 
					controllerGmAssign.runSubmitWorkflowRule(record, tabs, activityLogIdValue);
				}
			});
		} 
		else 
			controllerGmAssign.runSubmitWorkflowRule(record, tabs, activityLogIdValue);
	},

	/**
 	 * private method
 	 * for 'create group move' submit
 	 */
 	runSubmitWorkflowRule: function(record, tabs, activityLogIdValue){
 	    var result;
 		try {
 			 result =  Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-submitMove', 
 					 activityLogIdValue*1,record,tabs.dateEnd,tabs.assignments);
 		}catch(e){
 			Workflow.handleError(e);
 			return;
 		}
 		if (result){
 			var rest = new Ab.view.Restriction();
 			rest.addClause("activity_log.activity_log_id",activityLogIdValue,"=");
 			//add for support dynamic tabs in 20.1 and also keep compatible with other applications that not dynamic tabs like On Demand - Create Maintenance Service Request(Guo 2011/06/23)
 			var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
 			if(dynamicAssemblyTabsController){
 				dynamicAssemblyTabsController.selectNextTab(rest);
 			}else{
 				tabs.selectTab("groupMoveResult",rest,false,false,false);	
 			}
 		}
 	},

 	/**
 	 * to submit a move request for a person that is already included in another pending move request.
 	 */
 	ifExistDuplicateRecords: function(date,em_id){
     	var dsRmpct = View.dataSources.get("duplicates_rmpct_for_js");
         dsRmpct.addParameter('current_date',date);
         dsRmpct.addParameter('em_id',em_id);
         var dsRecords = dsRmpct.getRecords();
         if(dsRecords.length>0){
     	  return true;
         }
         return false;
 	},

	/**
	 * event handler when 'Approve' button click
	 * call WFR 'approveMoveServiceRequest'
	 * if no exception throw, call sub-method  changeTab complete invoke.
	 */
	onApprove: function(){
 		var tabs = controllerGmAssign.tabs;
    	
    	if(!controllerGmAssign.parpareForSubmit()){
    		return;
    	}

    	//kb 3034042
    	if(detectIfExistsMoveFuture(tabs.assignments, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 0)){
    		return;
    	}
    	
		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					controllerGmAssign.continueApprove();	  
			});
		} else 
			controllerGmAssign.continueApprove();	  
	},
	
	continueApprove: function(){
 		var tabs = controllerGmAssign.tabs;
		var groupMoveDetailTab = tabs.findTab('groupMoveDetailTab');
 		var orginalController = groupMoveDetailTab.getContentFrame().View.controllers.get('helpdeskRequestApproveEditController');
 		var objRecordAndComments = orginalController.getRecordAndComments();
 		
 		objRecordAndComments.comments = this.updatePanel.getFieldValue("activity_log.comments");
 		
		var activityLogIdValue = tabs.activityLogIdValue;
		var result;
		try {
				//kb 3034293 Need change date_start to current date if approve a request which has a requested moved date is in the past
				var testDate = controllerGmAssign.getMoveRecordDateStart(tabs);
				if(testDate!=null&&testDate<new Date()){
					tabs.dateEnd = dateFormat(getCurrentDate());
					result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveMoveForPastDate"
							,activityLogIdValue*1,objRecordAndComments,tabs.dateEnd,tabs.assignments);
				}else{
					result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveMove"
							,activityLogIdValue*1,objRecordAndComments,tabs.dateEnd,tabs.assignments);
				}
	   		}catch(e){
	   			Workflow.handleError(e); 
	   			return false;
	   		}
     	 if(result)
     		controllerGmAssign.selectFirstTab(tabs);
	},
	

	selectFirstTab:function(mainTabs){
		View.controllers.get('treeController').abSpAsgnEmToRm_blTree.show(false);
		if(mainTabs.findTab("groupMoveEditApprove")){
			mainTabs.findTab("groupMoveEditApprove").isContentLoaded=false;
		}
		mainTabs.selectTab("select");
	},
    /**
     * event handler when 'Reject' button click
     * 1.find the previous tab 'groupMoveDetailTab' and call original method 'requestPanel_onReject''
     * 2.call method 'rejectRmpct' remove original assigned employee.
     * 3.if no exception throw, call sub-method  changeTab complete invoke.
     */
    onReject: function(){
 		var tabs = controllerGmAssign.tabs;
 		var groupMoveDetailTab = tabs.findTab('groupMoveDetailTab');
		var orginalController = groupMoveDetailTab.getContentFrame().View.controllers.get('helpdeskRequestApproveEditController');
		var objRecordAndComments = orginalController.getRecordAndComments();
 		objRecordAndComments.comments = this.updatePanel.getFieldValue("activity_log.comments");
		var activityLogIdValue = tabs.activityLogIdValue;
		var result;
		var assign = controllerGmAssign.originalAssignments;
		var select = controllerGmAssign.originalSelectAssignments;
		var newAssignment = subContact(select,assign);

    	if(!controllerGmAssign.parpareForSubmit()){
    		return;
    	}
		//kb 3034042
		if(detectIfExistsMoveFuture({I:[],D:newAssignment}, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 1)){
			return;
		}
		try {
	   		    result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-rejectAll"
	   		    	,objRecordAndComments.record,objRecordAndComments.comments,activityLogIdValue*1,newAssignment,tabs.dateEnd);
	   		}catch(e){
	   			Workflow.handleError(e); 
	   			return false;
	   		}
     	 if(result)
     	   controllerGmAssign.selectFirstTab(tabs);
	},
	/**
	* save request
	* Called by 'Issue' button
	* @param {String} formName form submitted
	*/
	onSave: function(){
		var tabs = controllerGmAssign.tabs;
		//var record = gettingRecordsData(document.forms[formName]);                     
    	
    	if(!controllerGmAssign.parpareForSubmit()){
    		return;
    	}
    	//kb 3034042
    	if(detectIfExistsMoveFuture({I:tabs.assignments["I"],U:[],D:tabs.assignments["D"]}, 
    			tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 5)){
    		return;
    	}
    	   	
		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					controllerGmAssign.continueSave();	  
			});
		} else 
			controllerGmAssign.continueSave();	  
	},

	continueSave: function(){
		var tabs = controllerGmAssign.tabs;
		var panel = this.updatePanel;
		var record = ABHDC_getDataRecord2(panel);

		var assignmentObject = tabs.assignments;

		var activityLogIdValue = tabs.activityLogIdValue;

		var requestDate = tabs.dateEnd;
	    
		try {
			var result = null;

			if(requestDate!=null&&new Date(requestDate)<new Date()){
				assignmentObject = {I:tabs.changedAssignments,U:[],D:tabs.originalAssignments};
			    result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate',
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,true);
			    controllerGmAssign.tabs.date_end = getCurrentDate();
			}else{
			    result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll',
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,true);
			}

			//show assign list by default
			this.abSpAsgnEmToRm_emSelect.removeRows(0);
			this.abSpAsgnEmToRm_emAssigned.removeRows(0);
			controllerGmAssign.defaultAddEmployeeToAssign(tabs);
			
	    	controllerGmAssign.originalAssignments = controllerGmAssign.getAssignments();
	    	if(tabs.funcType=="group_move_approve"){
	    	  controllerGmAssign.originalSelectAssignments = controllerGmAssign.getAssignments(controllerGmAssign.abSpAsgnEmToRm_emSelect);
	    	}
		}catch(e){
			Workflow.handleError(e);
		}
	},

	/**
	 * Issue request
	 * Called by 'Issue' button
	 * @param {String} formName form submitted
	 */
	onIssue: function(){
		var tabs = controllerGmAssign.tabs;
		//3035487 Without To location, we should not allow this request to be issued	
		if(controllerGmAssign.abSpAsgnEmToRm_emSelect.rows.length==0&&controllerGmAssign.abSpAsgnEmToRm_emAssigned.rows.length==0){
			var message =getMessage("withEmptyAssignment");
			View.alert(message);
			return;
		}

		if(controllerGmAssign.ifExistsFromToAllEmpty()){
			var message =getMessage("withEmptyFromAndToLocation");
			View.alert(message);
			return;
		}

		if(!controllerGmAssign.parpareForSubmit()){
			return;
		}
		
		if(this.abSpAsgnEmToRm_emSelect.rows.length>0){
			var message =getMessage("pendingAssign");
			View.alert(message);
			return;
		}

    	//kb 3034042
    	if(detectIfExistsMoveFuture({I:tabs.assignments["I"],U:[],D:tabs.assignments["D"]}, 
    			tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 5)){
    		return;
    	}
		
		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					controllerGmAssign.continueIssue();	  
			});
		} else 
			controllerGmAssign.continueIssue();	  
	},

	continueIssue: function(){
		var tabs = controllerGmAssign.tabs;
		var panel = this.updatePanel;
		var record = ABHDC_getDataRecord2(panel);
		
		var assignmentObject = tabs.assignments;
		
		var activityLogIdValue = tabs.activityLogIdValue;
		
		var requestDate = tabs.dateEnd;
		
		try {
			var result = null;
			if(requestDate!=null&&new Date(requestDate)<new Date()){
				assignmentObject = {I:tabs.changedAssignments,U:[],D:tabs.originalAssignments};
			    result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate',
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,false);
			}else{
			    result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll',
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,false);
			}
			controllerGmAssign.goToNextStep();
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	/**
	 * check if exists from location and to location all empty assignments.
	 */
	ifExistsFromToAllEmpty: function(){
		var selectGrid = this.ifExistsFromToAllEmptyForGrid(this.abSpAsgnEmToRm_emSelect);
		var assignGrid = this.ifExistsFromToAllEmptyForGrid(this.abSpAsgnEmToRm_emAssigned);
		if(selectGrid||assignGrid){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * sub method of 'ifExistsFromToAllEmpty'
	 */
	ifExistsFromToAllEmptyForGrid: function(grid){
        for (var j = 0; j < grid.rows.length; j++) {
        	var row = grid.rows[j];
        	if(row["em.bl_id"]==""&&row["em.fl_id"]==""&&row["em.rm_id"]==""&&
        			row["em.bl_id_current"]==""&&row["em.fl_id_current"]==""&&row["em.rm_id_current"]==""){
        		return true;
        		break;
        	}
        }
        return false;
	},
	goToNextStep: function(){
 		var openerViewRestriction = View.getOpenerView().restriction;
		if(openerViewRestriction){
			View.getOpenerView().getOpenerView().closeDialog();	
		}else{
			var tabs = controllerGmAssign.tabs;
			controllerGmAssign.selectFirstTab(tabs);
		}
	},
	/**
	* Cancel request
	* Called by 'Cancel' button
	* @param {String} formName form submitted
	*/
	onCancel: function(){
		var tabs = controllerGmAssign.tabs;
		var panel = View.panels.get("updatePanel");
	    var record = ABHDC_getDataRecord2(panel);

	    var activityLogIdValue = panel.getFieldValue("activity_log.activity_log_id");
	    
		var assign = controllerGmAssign.originalAssignments;
		var select = controllerGmAssign.originalSelectAssignments;
		var newAssignment = subContact(select,assign);		


    	if(!controllerGmAssign.parpareForSubmit()){
    		return;
    	}

    	//kb 3034042
		if(detectIfExistsMoveFuture({I:[],D:newAssignment}, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 1)){
			//kb 3034042 for cancel, restore chagne to web page first loading.
			controllerGmAssign.abSpAsgnEmToRm_drawingPanel.refresh();
			controllerGmAssign.abSpAsgnEmToRm_emSelect.removeRows(0);
			controllerGmAssign.abSpAsgnEmToRm_emAssigned.removeRows(0);
			controllerGmAssign.defaultAddEmployeeToAssign(tabs);
    		return;
    	}
		try {
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-cancelAll', parseInt(activityLogIdValue), 
					record, newAssignment,tabs.dateEnd);
			controllerGmAssign.goToNextStep();
		}catch(e){
			Workflow.handleError(e);
		}
	},
	/**
	* Complete request<br />
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#completeRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-completeRequest</a><br />
	* Reloads select tab<br />
	* Called by 'Complete' button
	* @param {String} formName form submitted
	*/
	onComplete: function(){
		var tabs = controllerGmAssign.tabs;
		var panel = View.panels.get("updatePanel");
	    var record = ABHDC_getDataRecord2(panel);
	    
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', record);
			if(result.code == 'executed'){
				controllerGmAssign.selectFirstTab(View.getOpenerView().tabs);
       	} else {
				Workflow.handleError(result);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	/**
	* Stop request<br />
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#stopRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-stopRequest</a><br />
	* Reloads select tab<br />
	* Called by 'Stop' button
	* @param {String} formName form submitted
	*/
	onStop: function(){
		var tabs = controllerGmAssign.tabs;
		
		
		var panel = View.panels.get("updatePanel");
	    var record = ABHDC_getDataRecord2(panel);
		
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-stopRequest', record);
			if(result.code == 'executed'){
				View.getOpenerView().tabs.selectTab("select");
			} else {
				Workflow.handleError(result);
			}
		}catch(e){
			Workflow.handleError(e);
		}


	},
 	/**
 	 * get date for 'group move' and date_start for 'individual move' by activity_log_id.
 	 */
	checkRmstdEmstd: function(em_id,bl_id,fl_id,rm_id){
		//should be remove this restriction in the process of Approve and Issue		
  	    if(this.tabs!=null&&this.tabs.funcType=="group_move_approve"){
  	    	return true;
  	    }
 		try {
 			result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransaction-checkRmstdEmstd",em_id,bl_id,fl_id,rm_id);
 			if(result.jsonExpression != ""){
 				res = eval('('+result.jsonExpression+')');
 				if(res.isMatahed&&res.isMatahed=="true"){
 					return true;
 				}
 			}
 		}catch(e){
 			Workflow.handleError(e); 
 		}
 		return null;
 	},
     /**
      * private method
      * change array to String[key=value]
      */
     changeFormatForSqlIn: function(array){
        var result = "";
		for(var i=0;i<array.length;i++){
			result+="'"+array[i]+"',"
		}
		return result.substring(0,result.length-1);
     },
     /**
      * private method
      * get em record by em_id
      */
     getFromLocationByEm: function(em_id){
     	var dataSource = this.ds_ab_assign_em_to_rm_js;
     	var date_end = this.tabs.date_end;
         var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
         var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
         //KB3036965 - support em_id with single quotes
         em_id = em_id.replace(/\'/g, "''");
         var dateRestriction ="rmpct.em_id ='"+em_id+"' AND rmpct.primary_em =1 AND status=1 AND (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
         
         var dsRecords =  dataSource.getRecords(dateRestriction);
         if(dsRecords!=null&&dsRecords.length>0){
         	return dsRecords[0];
         }else{
			return null;
         }
     }
});
/**
 * save selected employee for group move only.
 */
var emAssigns = [];
/**
 * save parameter value pk(contains clicked bl,fl,rm) when a drawing room click.
 */
var pkArray = null;

/**
 * event handler when select one row of existed record dv_id dp_id, rm_cat, rm_type.
 * Get the dv_id dp_id, rm_cat, rm_type from those rmpct records
 */
function chooseOneRecordToRoom(){
    var popUpPanel = View.panels.get('abSpAsgnEmToClickRm_popup');
    var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
    var pct_id = rowIndex["rmpct.pct_id"];
    var dv_id = rowIndex["rmpct.dv_id"];
    var dp_id = rowIndex["rmpct.dp_id"];
    var rm_cat = rowIndex["rmpct.rm_cat"];
    var rm_type = rowIndex["rmpct.rm_type"];
    var primary_rm = rowIndex["rmpct.primary_rm.raw"];
    var ojbDvDpRmCatRmType = {};
    ojbDvDpRmCatRmType.pct_id=pct_id;
    ojbDvDpRmCatRmType.dv_id=dv_id;
    ojbDvDpRmCatRmType.dp_id=dp_id;
    ojbDvDpRmCatRmType.rm_cat=rm_cat;
    ojbDvDpRmCatRmType.rm_type=rm_type;
    ojbDvDpRmCatRmType.primary_rm=primary_rm;
    if(clickSource==null){
    	toAddAssignmentRows(pkArray,ojbDvDpRmCatRmType);
    }else{
        var orginalPanel = View.panels.get('abSpAsgnEmToRm_emAssigned');
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.parent_pct_id"] = ojbDvDpRmCatRmType.pct_id;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.dv_id"] = ojbDvDpRmCatRmType.dv_id;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.dp_id"] = ojbDvDpRmCatRmType.dp_id;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_cat"] = ojbDvDpRmCatRmType.rm_cat;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_type"] = ojbDvDpRmCatRmType.rm_type;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.primary_rm"] = ojbDvDpRmCatRmType.primary_rm;
    }
	
    popUpPanel.show(false);
    popUpPanel.closeWindow();
}
var southSize = 1;
function resetLayOutForScroll(){
  	var layout = View.getLayoutManager('nested_center');
  	layout.setRegionSize('south',150+southSize);
  	southSize=southSize+1;
}
/**
 * private method, for group move 
 * add selected employee to assign list with condition
 * @param pk
 */
function toAddAssignmentRows(pk,ojbDvDpRmCatRmType){
	if (checkCount(pk)) {
        View.confirm(getMessage('countOver'), function(button){
            if (button == 'yes') {
                addAssignmentRows(pk,ojbDvDpRmCatRmType);
            }
        });
    }else{
    	addAssignmentRows(pk,ojbDvDpRmCatRmType);
    }
    View.getControl('', 'abSpAsgnEmToRm_drawingPanel').processInstruction('abSpAsgnEmToRm_drawingPanel', 'onclick');
}
/**
 * private method
 * check is the room is full.
 * @param {Object} pk
 * @return {boolean} isFull
 */
function checkCount(pk){
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    var availableCount = getRoomCountVal(blId, flId, rmId, 'rm.cap_em') - getRoomCountVal(blId, flId, rmId, 'rm.caculated_count_em');
    var newAssignedCount = 0;
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var rows = grid.rows;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row['em.bl_id'] == blId && row['em.fl_id'] == flId && row['em.rm_id'] == rmId ) {
            newAssignedCount++;
        }
    }
    if ((availableCount - newAssignedCount - 1) < 0) {
        return true;
    }
    //for group move
    if ((availableCount - newAssignedCount - emAssigns.length) < 0) {
        return true;
    }
    return false;
}
/**
 * private method, add selected employee to assign list
 * @param {Array} restriction
 */
function addAssignmentRows(pk,ojbDvDpRmCatRmType){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
//    var gridSelect = View.panels.get("abSpAsgnEmToRm_emSelect");
    var gridSelect = controllerGmAssign.selectGrid;
    var employees = [];
    for (var i = 0; i < emAssigns.length; i++) {
        var emAssign = emAssigns[i];
        var em_id = emAssign.getValue('em.em_id');
        emAssign.setValue("em.bl_id", pk[0]);
        emAssign.setValue("em.fl_id", pk[1]);
        emAssign.setValue("em.rm_id", pk[2]);
        
        emAssign.setValue("em.parent_pct_id", ojbDvDpRmCatRmType.pct_id);
        emAssign.setValue("em.dv_id", ojbDvDpRmCatRmType.dv_id);
        emAssign.setValue("em.dp_id", ojbDvDpRmCatRmType.dp_id);
        emAssign.setValue("em.rm_cat", ojbDvDpRmCatRmType.rm_cat);
        emAssign.setValue("em.rm_type", ojbDvDpRmCatRmType.rm_type);
        emAssign.setValue("em.primary_rm", ojbDvDpRmCatRmType.primary_rm);
        //manually change the propority to 'yes' or 'no' if it was '1' or '0'.
        var assignPrimaryEm = emAssign.getValue("em.primary_em");
        if(assignPrimaryEm=="1"){
        	assignPrimaryEm = getMessage("messageYes");
        }else if(assignPrimaryEm=="0"){
        	assignPrimaryEm = getMessage("messageNo");
        }
        emAssign.setValue("em.primary_em", assignPrimaryEm);
        
        //primary em has given value when you select check box.
        if(controllerGmAssign.checkIfEmExistInGrid(grid, em_id)){
        	employees.push(em_id);
        	continue;
        }
        if(!ifExistEqEmBlFlRm(grid,em_id,pk)){
        	grid.addGridRow(emAssign);
        	//remove current record from original move panel.
        	if(controllerGmAssign.tabs!=null&&controllerGmAssign.tabs.funcType=="group_move_approve"){
        		for(j = 0;j< gridSelect.rows.length; j++){
        			var row = gridSelect.rows[j];
        			if (row["em.em_id"] == em_id){
        				gridSelect.removeGridRow(row.row.getIndex());
        				//set floor panl click or can't click after assign.
        			    var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    			        cp.processInstruction("ondwgload", "");
    			        
        				gridSelect.update();
        			}
        		}
        	}
        }
    }
    if(employees.length>0){
    	controllerGmAssign.promptEmsExistInGrid(employees);
    }
    View.panels.get('abSpAsgnEmToRm_drawingPanel').processInstruction('abSpAsgnEmToRm_drawingPanel', 'onclick');
    
    grid.sortEnabled = false;
    grid.update();
	emAssigns = []
	View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
	View.panels.get("abSpAsgnEmToRm_rmpctSelect").setAllRowsSelected(false);
	
	//set color to yellow munally.
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');  
    var opts_selectable = new DwgOpts();
    opts_selectable.rawDwgName = controllerGmAssign.dwgName;
	opts_selectable.appendRec(pk[0]+ ';' +pk[1]+ ';' +pk[2]);
	drawingPanel.setSelectColor('0xFFFF00'); //set to yellow for exist assignment
	drawingPanel.highlightAssets(opts_selectable);
}
/**
 * private method, check out if exist em_id bl_id fl_id and rm_id are all equal in assign grid 
 */
function ifExistEqEmBlFlRm(grid,em_id,pk){
  for (var j = 0; j < grid.rows.length; j++) {
	  var row = grid.rows[j];
	  if (row["em.em_id"] == em_id&&row["em.bl_id"] == pk[0]&&row["em.fl_id"] == pk[1]&&row["em.rm_id"] == pk[2]) {
	     return true;
	  }
 }
	return false;
}
/**
 * event handler when click row of grid 'abSpAsgnEmToRm_emSelect' checkbox.
 * 1.save selected employee to array 'emAssigns'
 * 2.make the drawing panel clickable for selected employee.
 */
function onEmSelectionChange(rowbbb){
    emAssigns = [];
    var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var grid = controllerGmAssign.selectGrid;
    var rows = grid.getSelectedRows();
    cp.clearAssignCache(true);
    cp.processInstruction("ondwgload", "");
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        cp.processInstruction('abSpAsgnEmToRm_emSelect', 'onclick');
        //get record exists in rmpct table, if not exists, get from em.
        var emAssign = new Ab.data.Record();
        emAssign.setValue("em.em_id", row['em.em_id']);
        var emRecord = controllerGmAssign.getFromLocationByEm(row['em.em_id']);
        var tabs = controllerGmAssign.tabs;
        var bl_id = row['em.bl_id'];
        var fl_id = row['em.fl_id'];
        var rm_id = row['em.rm_id'];
        
        //if not exists primary_em is 1 in rmpct table set primary to 1 else 0.
    	if(!ifEmInRmpct(row['em.em_id'],bl_id,fl_id,rm_id)){
            emAssign.setValue("em.primary_em", getMessage("messageYes"));
    	}else{
    		emAssign.setValue("em.primary_em", getMessage("messageNo"));
    	}
        //kb 3034262  If I select an employee's satellite location to move, 
        //then the From Location should show that same location I selected, 
    	//AND the Primary Employee Location field should be set to 0.
        if(!tabs.funcType||tabs.funcType!="group_move_approve"){
        	emAssign.setValue("em.bl_id_current", bl_id);
        	emAssign.setValue("em.fl_id_current", fl_id);
        	emAssign.setValue("em.rm_id_current", rm_id);
        	//if from location was the rmpct's record with primary_em is 1 then set to 1.
        	if(bl_id&&fl_id&&rm_id){
        		emAssign.setValue("em.primary_em", getMessage("messageYes"));
        	}
        }else{
        	emAssign.setValue("em.bl_id_current", row['em.bl_id_current']);
        	emAssign.setValue("em.fl_id_current", row['em.fl_id_current']);
        	emAssign.setValue("em.rm_id_current", row['em.rm_id_current']);
        }
        if(row['em.primary_em']){
    		emAssign.setValue("em.primary_em", row['em.primary_em']);
        }
        emAssigns.push(emAssign);
    }
    if (cp.isLoadedDrawing) {
    	for (var i = 0; i < emAssigns.length; i++) {
    		cp.setToAssign("em.em_id", emAssigns[i].getValue('em.em_id'));
    		break;
    	}
    }
    

}
/**
 * event handler when click room of the drawing panel 'abSpAsgnEmToRm_drawingPanel'.
 * 1.if exist mutiple record of 'dv_id dp_id, rm_cat, rm_type' in table 'rmpct', show panel select one.
 * 2.add employee to assign panel list
 * 3.save panameter 'assignments_changed' for 'approve'
 * @param {Object} pk[bl_id,fl_id,rm_id]
 */
function onDwgPanelClicked(pk, selected, color){
	
	var employees = "";
	if(emAssigns.length!=0){
		
		for (var i = 0; i < emAssigns.length; i++) {
			var emAssign = emAssigns[i];
			var em_id = emAssign.getValue('em.em_id');
			
			//KB3036965 - support em_id with single quotes
			//em_id = em_id.replace(/\'/g, "''");
			//comments this line , do it in the file : SpaceTransactionCommon.java method: getEmRecordById
			
			if(!controllerGmAssign.checkRmstdEmstd(em_id,pk[0],pk[1],pk[2])){
				employees+=(em_id+" ");
			}
		}
		if(employees!=""){
			var message =getMessage("cannotOccupy").replace("<{0}>", " "+employees);
			View.alert(message);
			return;
		}
		
		clickSource = null;
		var ojbDvDpRmCatRmType = popUpSelectDvDpEtc(pk, selected, color);
		if(ojbDvDpRmCatRmType!=null){
			toAddAssignmentRows(pk,ojbDvDpRmCatRmType);
		}
	}
}
/**
 * private method 
 * get all useable room part.
 * 1,get all room part serched from rmpct records by restriction like date.
 * 2,remove the room part which use exists in current assignments list.
 * @parameter dsRecords :all room part records serched from rmpct by restriction like date
 */
function getLeavedRecords(dsRecords){
    var usedRecords = [];// room part which use exists in current assignments list
    var currentAssignments = controllerGmAssign.getAssignments();
    for(var i=0; i< currentAssignments.length; i++){
    	var record = currentAssignments[i];
    	for(var j=0; j< dsRecords.length; j++){
    		var pct_id = dsRecords[j].getValue("rmpct.pct_id");
    		if(pct_id == record['parent_pct_id']){
    			usedRecords.push(dsRecords[j]);
    			break;
    		}
    	}
    }
    
    var tempResultRecords  = [];
    for(var i=0; i< dsRecords.length; i++){
    	var dsRecord = dsRecords[i];
    	var flag = true;
    	for(var j=0; j< usedRecords.length; j++){
    		if(dsRecord == usedRecords[j]){
    			flag = false;
    			break;
    		}
    	}
    	if(flag){
    		tempResultRecords.push(dsRecord);
    	}
    }

    return tempResultRecords;
}

/**
 * get record which paret_pct_id used in pending request.
 */
function getPendingRequestRecordWithParentPct(pctId){
	var ds = controllerGmAssign.ds_abSpGroupMo_rmPendingRequestHighlightDS;	  
	ds.addParameter('blId', tempObjforHightLight.blId);
	ds.addParameter('flId', tempObjforHightLight.flId);
	ds.addParameter('moveDate', dateFormat(controllerGmAssign.tabs.date_end));
	ds.addParameter('parentPctId', pctId);
	var records = ds.getRecords();
	if(records.length>0){
		return true;
	}else{
		return false;
	}
}
/**
 * if a selected room has multiple portions that the user can actually move into,
 * then the system must also pop-up the same window to allow the user to select the portion of the room
 */
function popUpSelectDvDpEtc(pk, selected, color){
	//consider use one dataSource will be Okay, if true, ds_ab-sp-asgn-em-to-click_rm will be delete 
	var dsClickRoom = View.dataSources.get("ds_ab-sp-asgn-em-to-click_rm_pop_up");
	dsClickRoom = addParmeter(dsClickRoom,pk);
    var dsRecords = dsClickRoom.getRecords();
    
    var leavedRecords = getLeavedRecords(dsRecords);

    
    if(leavedRecords.length>0 && emAssigns.length > 1){
		var message =getMessage("existEmptyPartRoom");
		View.alert(message);
		return null;
    }
    
   var ojbDvDpRmCatRmType = {};
   if(leavedRecords.length==0){
	 //if this record not exists, then get fields value form rm table.
	    var dataSource = controllerGmAssign['ds_ab-sp-asgn-rm'];
	   	var restriction = new Ab.view.Restriction();
	   	restriction.addClause("em.bl_id", pk[0]);
	   	restriction.addClause("em.fl_id", pk[1]);
	   	restriction.addClause("em.rm_id", pk[2]);
        var dsRecords =  dataSource.getRecords(restriction);
        if(dsRecords!=null&&dsRecords.length>0){
	       	var record = dsRecords[0];
	       	ojbDvDpRmCatRmType.dv_id=record.getValue("rm.dv_id");
	       	ojbDvDpRmCatRmType.dp_id=record.getValue("rm.dp_id");
	       	ojbDvDpRmCatRmType.rm_cat=record.getValue("rm.rm_cat");
	       	ojbDvDpRmCatRmType.rm_type=record.getValue("rm.rm_type");
        }
        ojbDvDpRmCatRmType.pct_id="";
        ojbDvDpRmCatRmType.primary_rm="";
	   return ojbDvDpRmCatRmType;
   }else if(leavedRecords.length>1){
    	//generate restirction.
    	var list = [];
        for(var i=0; i< leavedRecords.length; i++){
        	var pct_id = leavedRecords[i].getValue("rmpct.pct_id");
        	list.push(pct_id);
        }
        var restriction = " rmpct.pct_id in (" + controllerGmAssign.changeFormatForSqlIn(list) + ")";
	    
    	pkArray = pk;
    	var showPanel=View.panels.get("abSpAsgnEmToClickRm_popup");
    	showPanel = addParmeter(showPanel,pk);
		showPanel.refresh(restriction);
		showPanel.showInWindow({
			width: 800,
			height: 500
		});
    }else{
    	//deal with dsRecords length == 1
        if (leavedRecords.length==1){
        	var pct_id = leavedRecords[0].getValue("rmpct.pct_id");
        	var dv_id = leavedRecords[0].getValue("rmpct.dv_id");
        	var dp_id = leavedRecords[0].getValue("rmpct.dp_id");
        	var rm_cat = leavedRecords[0].getValue("rmpct.rm_cat");
        	var rm_type = leavedRecords[0].getValue("rmpct.rm_type");
        	var primary_rm = leavedRecords[0].getValue("rmpct.primary_rm");
        	ojbDvDpRmCatRmType.pct_id=pct_id;
            ojbDvDpRmCatRmType.dv_id=dv_id;
            ojbDvDpRmCatRmType.dp_id=dp_id;
            ojbDvDpRmCatRmType.rm_cat=rm_cat;
            ojbDvDpRmCatRmType.rm_type=rm_type;
            ojbDvDpRmCatRmType.primary_rm=primary_rm;
        }
        return ojbDvDpRmCatRmType;
    }
    return null;
}
/**
 * private method
 */
function getDateValue(){
	var resultDate = [];
	var tabs = controllerGmAssign.tabs;
	var date_start = null;
	var date_end = null;
	date_start = tabs.date_start;
	date_end = tabs.date_end;
    resultDate.push(date_start);
    resultDate.push(date_end);
    return resultDate;
}
/**
 * private method
 */
function addParmeter(showPanel,pk){
	var resultDate = getDateValue();
	var date_start = resultDate[0];
	var date_end =  resultDate[1];
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
    var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
    var dateRestriction = " AND  (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
    
	showPanel.addParameter('p_bl_id', blId);
	showPanel.addParameter('p_fl_id', flId);
	showPanel.addParameter('p_rm_id', rmId);
	showPanel.addParameter('dateRestriction', dateRestriction);
	return showPanel;
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
 * use when click drawing to assign 
 */
var individualEmId = null;
/**
 * private method, get the room employee count or employee capacity from database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName rm.count_em or rm.cap_em
 * @return {int} cnt
 */
function getRoomCountVal(buildingId, floorId, roomId, fieldName){
	var resultDate = getDateValue();
	var date_start = resultDate[0];
	var date_end = resultDate[1];
    var cnt = 0;
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        
        var drawingDataSource = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_rmCnt");
		drawingDataSource.addParameter('p_date_start', dateFormat(date_end));
		drawingDataSource.addParameter('p_date_end', dateFormat(date_end));
		
        var recs = drawingDataSource.getRecords(restriction);
        if (recs != null&&recs.length>0) 
            cnt = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showException(e);
    }
    
    return parseInt(cnt, 10);
}


/**
 * event handler when 'Remove Selected' button click.
 * remove selected employee assignment from the grid 'abSpAsgnEmToRm_emAssigned'.
 */
function removeAssignSelected(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var records = grid.getSelectedRows();
    
    for ( var i = 0; i < records.length; i++) {
//   	for ( var i = records.length -1 ; i >=0; i--) {
		var row = records[i];
		var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
		if (cp.isLoadedDrawing) {
			//core method
		    cp.unassign('em.em_id', row['em.em_id']);
	    }
	    grid.removeGridRow(row.row.getIndex());
	    grid.update();
	}
    reSetHighLight(records,0);
    
	//add deleted record to emSelect list.
	if(controllerGmAssign.tabs!=null&&controllerGmAssign.tabs.funcType=="group_move_approve"){
		var gridSelect = View.panels.get("abSpAsgnEmToRm_emSelect");
	    for ( var i = 0; i < records.length; i++) {
	    	var selectedRow = grid.gridRows.get(i);
	    	var row = records[i];
	    	row["em.pct_id"] = "";
	    	row["em.parent_pct_id"] = "";
	    	row["em.bl_id"] = "";
	    	row["em.fl_id"] = "";
	    	row["em.rm_id"] = "";
	    	var flag = true;
	    	for(var j=0; j<gridSelect.rows.length; j++){
	    		 var rowSelect = gridSelect.rows[j];
	    		 if(rowSelect["em.em_id"]==row["em.em_id"]){
	    			 flag = false;
	    			 break;
	    		 }
	    	}
	    	if(flag){
	    		gridSelect.addGridRow(row);
	    	}
	    }
	    gridSelect.update();
	}
}
/**
 * event handler when button 'assign selected' click in panel 'select employee' for group move.
 * assign selected employee to assign list.
 */
function assignSelected(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var employees = [];
    for (var i = 0; i < emAssigns.length; i++) {
        var emAssign = emAssigns[i];
        emAssign.setValue("em.bl_id", "");
        emAssign.setValue("em.fl_id", "");
        emAssign.setValue("em.rm_id", "");
        var em_id = emAssign.getValue("em.em_id");
        if(controllerGmAssign.checkIfEmExistInGrid(grid, em_id)){
        	employees.push(em_id);
        	continue;
        }
        grid.addGridRow(emAssign);
    }
    if(employees.length>0){
    	controllerGmAssign.promptEmsExistInGrid(employees);
    }
    grid.sortEnabled = false;
    grid.update();
}
/**
 * event handler when 'clear' button click
 * clear all employee assignments list and clear the highlight.
 */
function clearChanges(){
	var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    if (cp.isLoadedDrawing&&grid.rows[0]) {
    	//core method
    	cp.unassign('em.em_id', grid.rows[0]['em.em_id']);
    }
    grid.removeRows(0);
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
            case '5':
                text = getMessage('legendLevel5');
                break;
        }
        var contentElement = cellElement.childNodes[0];
        if(contentElement)
         contentElement.nodeValue = text;
    }
}
var row_em_id = null;
/**
 * event handler when 'click from location' button click
 * show a pop-up panel for use select other location.
 */
function clickChangeFromLocation(){
	var resultDate = getDateValue();
	var date_start = resultDate[0];
	var date_end = resultDate[1];
    var orginalPanel = View.panels.get('abSpAsgnEmToRm_emAssigned');
    var rowIndex = orginalPanel.rows[orginalPanel.selectedRowIndex];
    var em_id = rowIndex["em.em_id"];
    row_em_id = em_id;
    var popupPanel = View.panels.get('abSpAsgnEmFromRm_popup');
    if(checkIfExistEmMove(em_id,date_end)){
        View.confirm(getMessage('existEmPendingMove'), function(button){
            if (button == 'yes') {
            	//popupPanel.refresh(restriction);
            	popupPanel.showInWindow({
            		width: 800,
            		height: 500
            	});
            	addRadioEleToTitle();
            	radioClick();
            }
        });
    }else{
    	//popupPanel.refresh(restriction);
    	popupPanel.showInWindow({
    		width: 800,
    		height: 500
    	});
    	addRadioEleToTitle();
    	radioClick();
    }
}
/**
 * event handler when 'click to location' button click
 * show a pop-up panel for use select other location.
 */
function clickChangeToLocation(){
	var resultDate = getDateValue();
	var date_end = resultDate[1];
	var popupPanel = View.panels.get('abSpAsgnEmToRm_popup');
	//kb 3037858 make indv and group more consistency.
    if(controllerGmAssign.tabs&&controllerGmAssign.tabs.funcType=="group_move_approve"){
		popupPanel = View.panels.get('abSpAsgnEmToRm_popup_approve');
	}
	
	popupPanel.addEventListener('afterRefresh', hideScroll, this);
	
	popupPanel.addParameter('p_date_start', dateFormat(date_end));
	popupPanel.addParameter('p_date_end', dateFormat(date_end));
	popupPanel.showInWindow({
		width: 800,
		height: 500
	});
	popupPanel.refresh();
}
/**
 * kb 3033641 There are two vertical scroll bar in "Select To Location" pop up window in Request a Group Move
 */
function hideScroll(){
	document.getElementById("abSpAsgnEmToRm_popup").style.overflow=''; 
}
/**
 * private method
 * check if exist em pending move
 */
function checkIfExistEmMove(em_id,date_end){
	var dataSource = View.dataSources.get("ds_ab-sp-asgn-select-location");
	//KB3036965 - support em_id with single quotes
    em_id = em_id.replace(/\'/g, "''");
	var restriction = " EXISTS (SELECT (1) FROM rmpct WHERE em_id = '"+em_id+"' AND status IN (0, 1) " +
	 "AND (date_start IS NULL or date_start &lt;=${sql.date('"+ dateFormat(getCurrentDate()) +"')}) AND (date_end is null or date_end &gt;=${sql.date('"+ dateFormat(getCurrentDate()) +"')})" +
	 		" AND activity_log_id IS NOT NULL) AND rm.hotelable = 0";
	 var records = dataSource.getRecords(restriction);
	 if(records.length>0)
		 return true;
	 return false;
}
/**
 * private method
 * when select panel pop-up add radio button and title
 */
function addRadioEleToTitle(){
	var scenarioList_title_td = Ext.get('scenarioList_title_td');
	if (scenarioList_title_td != null) {
		scenarioList_title_td.remove();
	}
	 var titleNode = document.getElementById('abSpAsgnEmFromRm_popup_title');
     if (titleNode == null) 
         return;
     var prompt = "Scenario Id Lists";
     var prompt ='<input type="radio" name="selectLocation" checked onclick="radioClick()" value="0"><span translatable="true">Select Existing Location </span></input><input type="radio" name="selectLocation" onclick="radioClick()"  value="1"><span translatable="true">Select Another Location</span></input>';
     var pn = titleNode.parentNode.parentNode;
     var cell = Ext.DomHelper.append(pn, {
         tag: 'td',
         id: 'scenarioList_title_td'
     });
     var tn = Ext.DomHelper.append(cell, '<p>' + prompt + '</p>', true);
}
/**
 * event handler when radio 'Select from an existing location' or 'Select another location' click
 * show differnet records according you selected radio
 */
function radioClick(){
	var resultDate = getDateValue();
	var date_start = resultDate[0];
	var date_end = resultDate[1];
	var selectLocation = document.getElementsByName("selectLocation");
	var popupPanel = View.panels.get('abSpAsgnEmFromRm_popup');
//	var restriction = new Ab.view.Restriction();
	//KB3036965 - support em_id with single quotes
    var emId = row_em_id.replace(/\'/g, "''");
	var restriction = " em_id = '"+emId+"' AND status = 1 " +
	"AND (date_start IS NULL or date_start &lt;= ${sql.date('"+ dateFormat(date_end) +"')})" +
	" AND (date_end is null or date_end &gt;=${sql.date('"+ dateFormat(date_end) +"')}) ";
	if (selectLocation[0].checked) {
	    popupPanel.refresh(restriction+ "AND rm.hotelable = 0");
	}else{//another Location
		var restrictionOthers ="rmpct.pct_id not in (SELECT rmpct.pct_id FROM rmpct,(select bl_id,fl_id,rm_id from rmpct " +
				"where"+restriction+") ${sql.as} rmpctExist " +
				"WHERE  rmpct.bl_id= rmpctExist.bl_id and rmpct.fl_id= rmpctExist.fl_id and rmpct.rm_id= rmpctExist.rm_id) " +
				" AND rm.hotelable = 0";
		popupPanel.refresh(restrictionOthers);
	}
}
/**
 * event handler when click one record of from bl fl rm.
 * 1.change assign list according you selected row
 * 2.change 'primary_em' to 0 if you selected different room.
 */
function chooseOneRecordFromRoom(){
	var popUpPanel = View.panels.get('abSpAsgnEmFromRm_popup');
	var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
    var orginalPanel = View.panels.get('abSpAsgnEmToRm_emAssigned');
//    var selectedRow = orginalPanel.gridRows[orginalPanel.selectedRowIndex];
    var bl_id="",fl_id="",rm_id="";
    if(rowIndex){
    	bl_id = rowIndex["rmpct.bl_id"];
    	fl_id = rowIndex["rmpct.fl_id"];
    	rm_id = rowIndex["rmpct.rm_id"];
    }
    var selectedRow = orginalPanel.gridRows.get(orginalPanel.selectedRowIndex);
    selectedRow.setFieldValue("em.bl_id_current",bl_id);
    selectedRow.setFieldValue("em.fl_id_current",fl_id);
    selectedRow.setFieldValue("em.rm_id_current",rm_id);
    //below function for change the row is necessary when add new record to grid avoid lose former change.
    orginalPanel.rows[orginalPanel.selectedRowIndex]["em.bl_id_current"] = bl_id;
    orginalPanel.rows[orginalPanel.selectedRowIndex]["em.fl_id_current"] = fl_id;
    orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_id_current"] = rm_id;
    
    if(ifEmInRmpct(selectedRow.getFieldValue("em.em_id"),bl_id,fl_id,rm_id)){
    	selectedRow.setFieldValue("em.primary_em",getMessage("messageYes"));
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.primary_em"] = getMessage("messageYes");
    }else{
    	selectedRow.setFieldValue("em.primary_em",getMessage("messageNo"));
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.primary_em"] = getMessage("messageNo");
    }
    popUpPanel.closeWindow();
}
var clickSource = null;//'button';
/**
 * event handler when click one record of to bl fl rm.
 * 1.change assign list according you selected row
 */
function chooseOneRecordMoveToRoom(){
	var popUpPanel = View.panels.get('abSpAsgnEmToRm_popup');
	var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
	var orginalPanel = View.panels.get('abSpAsgnEmToRm_emAssigned');
	var bl_id="",fl_id="",rm_id="";
	if(rowIndex){
		bl_id = rowIndex["rm.bl_id"];
		fl_id = rowIndex["rm.fl_id"];
		rm_id = rowIndex["rm.rm_id"];
	}
	var selectedRow = orginalPanel.gridRows.get(orginalPanel.selectedRowIndex);
	
	var em_id = selectedRow.getFieldValue("em.em_id");
	
    //KB3036965 - support em_id with single quotes
	// em_id = em_id.replace(/\'/g, "''"); 
	//comments this line , do it in the file : SpaceTransactionCommon.java method: getEmRecordById
    if(!controllerGmAssign.checkRmstdEmstd(em_id,bl_id,fl_id,rm_id)){
		var message =getMessage("cannotOccupy").replace("<{0}>", " "+em_id);
		View.alert(message);
		return;
    }
	
	selectedRow.setFieldValue("em.bl_id",bl_id);
	selectedRow.setFieldValue("em.fl_id",fl_id);
	selectedRow.setFieldValue("em.rm_id",rm_id);
	//below function for change the row is necessary when add new record to grid avoid lose former change.
	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.bl_id"] = bl_id;
	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.fl_id"] = fl_id;
	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_id"] = rm_id;
	popUpPanel.closeWindow();
	
	var pk = [];
     pk[0] = bl_id;
     pk[1] = fl_id;
     pk[2] = rm_id;
    clickSource = 'button';
	var ojbDvDpRmCatRmType = popUpSelectDvDpEtc(pk);
    if(ojbDvDpRmCatRmType!=null){
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.parent_pct_id"] = ojbDvDpRmCatRmType.pct_id;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.dv_id"] = ojbDvDpRmCatRmType.dv_id;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.dp_id"] = ojbDvDpRmCatRmType.dp_id;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_cat"] = ojbDvDpRmCatRmType.rm_cat;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_type"] = ojbDvDpRmCatRmType.rm_type;
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.primary_rm"] = ojbDvDpRmCatRmType.primary_rm;
    }
   
}

/**
 * private method
 * check if exist primary_em=1 record in rmpct table.
 */
function ifEmInRmpct(em_id,bl_id,fl_id,rm_id){
 	var dataSource = controllerGmAssign.ds_ab_assign_em_to_rm_js;
 	var date_end = controllerGmAssign.tabs.date_end;
     var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
     var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
 	 //KB3036965 - support em_id with single quotes
 	 var emId = em_id.replace(/\'/g, "''");
     var dateRestriction ="rmpct.em_id ='"+emId+"' AND rmpct.primary_em =1 AND status=1 AND (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
     dateRestriction ="rmpct.bl_id='"+bl_id+"' AND rmpct.fl_id='"+fl_id+"' AND rmpct.rm_id='"+rm_id+"' AND "+dateRestriction;
     var dsRecords =  dataSource.getRecords(dateRestriction);
     if(dsRecords!=null&&dsRecords.length>0){
     	return true;
     }else {
    	 return false;
     }
}

/**
 * private method
 * check field priemaryEm to make sure only one value=1 for one employee.
 */
function checkPrimaryEmValue(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    //first get all employee in array distinctEms without repeat.
    var distinctEms = [];
    for (var i = 0; i < grid.rows.length; i++) {
        var row = grid.rows[i];
        var flag = true;
        for(var j = 0; j < distinctEms.length; j++) {
        	if(distinctEms[j]==row["em.em_id"]){
        		flag = false;
        	}
        }
        if(flag){
        	distinctEms.push(row["em.em_id"]);
        }
    }
    //add warning string only have count(primary_em=="1") great than 1
    var showEmployee = "";
    for(var j = 0; j < distinctEms.length; j++) {
    	var count = 0;
    	for (var i = 0; i < grid.rows.length; i++) {
    		var row = grid.rows[i];
    		var gridRow = grid.gridRows.items[i];
    		if(distinctEms[j]==row["em.em_id"]){
    			var primary_em = gridRow.getFieldValue("em.primary_em");
    			if(primary_em=="1"||primary_em==getMessage('messageYes')){
    				count++;
    			}
    		}
    		
    	}
    	if(count>1){
    		showEmployee+=distinctEms[j]+"   ";
    	}
    }
    return showEmployee;
}
/**
 * check if form and to was the save room for current employee
 */
function checkIfSameRoom(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var distinctEms = [];
    for (var i = 0; i < grid.rows.length; i++) {
        var row = grid.rows[i];
        var rowForSelect = grid.gridRows.items[i];
        if (row["em.bl_id"] == row["em.bl_id_current"]&&row["em.fl_id"] == row["em.fl_id_current"]&&row["em.rm_id"] == row["em.rm_id_current"]) {
        	rowForSelect.select(true);
        	//judge if exist the employee in array 'distinctEms'
        	var flag = true;
        	for(var j = 0; j < distinctEms.length; j++) {
        		if(distinctEms[j]==row["em.em_id"]){
            		flag = false;
            	}
        	}
        	if(flag){
        		distinctEms.push(row["em.em_id"]);
        	}
        }
    }
    //add warning string only exist bl fl and rm the equal.
    var showEmployee = "";
    if(distinctEms.length>0){
    	for(var j = 0; j < distinctEms.length; j++) {
    		showEmployee+=distinctEms[j]+"   ";
    	}	
    }
    return showEmployee;
}
/**
 * event handler when click building node of the tree 'abSpAsgnEmToRm_blTree'.
 * 1.check current View is 'group mvoe' or 'individual move' and make sure all the field value was correct.
 * 2.call method 'resetDrawin g' to show drawing panel.
 * 3.call method 'dateFieldOnChange' register onchange event for 'date_end' or 'move_date' field
 */
function runAfterTreeClicked(){
	var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
	controllerGmAssign.onTreeFlClick(currentNode);
}
var tempObjforHightLight={};
/**
 * private method
 * make the drawing room clickable.
 */
function resetDrawing(date_start,date_end,ob){
	 var cp = View.getControl('', 'abSpAsgnEmToRm_drawingPanel');
	 var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
	 var blId = currentNode.parent.data['bl.bl_id'];
	 var flId = currentNode.data['fl.fl_id'];
	 var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
	 setParametersToDataSource(date_start,date_end);
	var dwgName = currentNode.data['fl.dwgname'];
	controllerGmAssign.dwgName =  dwgName;
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	cp.addDrawing(dcl);
	tempObjforHightLight.date_start=date_start;
	tempObjforHightLight.date_end=date_end;
	tempObjforHightLight.restriction=ob.restriction;
	tempObjforHightLight.blId=blId;
	tempObjforHightLight.flId=flId;
	cp.isLoadedDrawing = true;
	cp.clearAssignCache(true);
	emAssigns = []
	View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
	View.panels.get("abSpAsgnEmToRm_rmpctSelect").setAllRowsSelected(false);
	
	//KB3034460 - list pending request and hiighlight the border of the room that with pending request
	var ds = View.controllers.get('abSpAsgnEmToRm_Controller').ds_abSpGroupMo_rmPendingRequestHighlightDS;
	ds.addParameter('blId', blId);
	ds.addParameter('flId', flId);
	ds.addParameter('moveDate', dateFormat(date_end));
	
	var pendingRequestGrid = View.panels.get('abSpGroupMo_rmPendingRequestList');
	pendingRequestGrid.addParameter('blId', blId);
	pendingRequestGrid.addParameter('flId', flId);
	pendingRequestGrid.addParameter('moveDate', dateFormat(date_end));

}

/**
 * show border highlights.
 */
function showBorderHighlights(){
		var controller = View.controllers.get('abSpAsgnEmToRm_Controller');

		var df = new DwgFill();

		// Set the color
		var color = '00FFFF';
	    var highlightOpts = new DwgOpts();
	    highlightOpts.rawDwgName = controllerGmAssign.dwgName;
		highlightOpts.mode = 'none';

		var ds = controller.ds_abSpGroupMo_rmPendingRequestHighlightDS;
	    var records = ds.getRecords();

		for ( var i = 0; i < records.length; i++) {
			df.bc = '0x'+color // Border Color
			df.bt = 15; // Border Thickness
			df.bo = 1.0; // Border Opacity: 1.0 (full intensity)
			var assetId = records[i].getValue('rm.asset_id');
			highlightOpts.appendRec(assetId, df);
		}

		if (highlightOpts.recs) {
			controller.abSpAsgnEmToRm_drawingPanel.highlightAssets(highlightOpts);
		}
	}

/**
 * set parameter to Label dataSource
 */
function setParametersToDataSource(date_start,date_end){
	var arrayDs = ['ds_ab-sp-asgn-em-to-rm_drawing_availRm','ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel1','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel2','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel3','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel4'];
	for(var i=0;i<arrayDs.length;i++){
		var drawingDataSource = View.dataSources.get(arrayDs[i]);
		if(drawingDataSource){
			drawingDataSource.addParameter('p_date_start', dateFormat(date_end));
			drawingDataSource.addParameter('p_date_end', dateFormat(date_end));
		}
	}
}
//original room highlight to yellow.
var originalRooms = [];
/**
 * private method
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(date_start,date_end,restriction,objBlandFl){
    
	originalRooms = [];
	if(objBlandFl.blId!=tempObjforHightLight.blId||objBlandFl.flId!=tempObjforHightLight.flId){
		//setSelectability method invoke may defer period of time. when it did call, if user has click another fl, stop run it.
		return;
	}
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');    
    var drawingDataSource = View.dataSources.get('ds_ab-sp-asgn-em-to-rm_drawing_availRm');
    if(controllerGmAssign.tabs&&controllerGmAssign.tabs.funcType=="group_move_approve"||existsUserRoleProcess()){
    	drawingDataSource = View.dataSources.get('ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove');
    }
    drawingDataSource.addParameter('p_date_start', dateFormat(date_end));
    drawingDataSource.addParameter('p_date_end', dateFormat(date_end));
    var rmRecords = drawingDataSource.getRecords(restriction);
    var locationArray = [];
    var rooms = [];
    
    //first set all room unselectable.
    var allroomDataSource = View.dataSources.get('ds_ab-sp-asgn-rm');
    var allRmRecords = allroomDataSource.getRecords(restriction);

    var opts_selectable = new DwgOpts();
    opts_selectable.rawDwgName = controllerGmAssign.dwgName;
    
    var opts_unselectable = new DwgOpts();
    opts_unselectable.rawDwgName = controllerGmAssign.dwgName;
    
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var legend_level = record.getValue('rm.legend_level');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        //save original color for delete or add asssigament use.
        originalRooms.push({'bl_id':blId,'fl_id':flId,'rm_id':rmId,'legend_level':legend_level});
      //The existing assignments should be highlighted in yellow on the floor plan that displays,
      //indicating that the room contains an assignment.
        var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
        for (var j = 0; j < grid.rows.length; j++) {
        	var row = grid.rows[j];
        	if(blId == row['em.bl_id']&&flId == row['em.fl_id']&&rmId == row['em.rm_id']){
        		locationArray.push(blId + ';' + flId + ';' + rmId);
        	}
        }
        if (legend_level == '0'||legend_level == '1'||legend_level == '2'||legend_level == '3') {
          opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
//        	drawingPanel.setSelectability.defer(1000, this, [opts_selectable, true]);
        	var recordObject = new Object();
        	recordObject["rm_id"]=rmId;
        	rooms.push(recordObject);
        }else{
        	opts_unselectable.appendRec(blId + ';' + flId + ';' + rmId);
        }
    }
	drawingPanel.setSelectability(opts_selectable, true);
	drawingPanel.setSelectability(opts_unselectable, false);
    //kb 3037548 add logic with future trans when caculate highlight occupancy caculation.
    reHightLightIfExistsFuture(drawingPanel,objBlandFl.blId,objBlandFl.flId,rooms,dateFormat(date_end),controllerGmAssign.dwgName);
    
    //loop through all floor  and hightlight exists records in assignments list.
    var opts_selectable = new DwgOpts();
    opts_selectable.rawDwgName = controllerGmAssign.dwgName;
    for(var i = 0;i < locationArray.length; i++){
    	opts_selectable.appendRec(locationArray[i]);
    	drawingPanel.setSelectColor('0xFFFF00'); //set to yellow for exist assignment
    }
    drawingPanel.highlightAssets(opts_selectable);
    //call boder highlight.
    showBorderHighlights();
}

/**
 * private method
 * reset Hightlight for deleted or new added rooms.
 * flag=0  delete 
 * flag=1  add
 */
function reSetHighLight(records,flag){
	
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var rooms = getNotExistInGridRooms(records, grid,flag);
    if(flag==0){
        var deletedRooms = [];
        var callFutrueFalg = false;
    	for (var j = 0; j < rooms.length; j++) {
    		var record = rooms[j];
    		var foundRmId = null;
    		for (var i = 0; i < originalRooms.length; i++) {
    			var object = originalRooms[i];
    	        var blId = record['em.bl_id'];
    	        var flId = record['em.fl_id'];
    	        var rmId = record['em.rm_id'];
    	        
    			if(blId == object['bl_id']&&flId == object['fl_id']&&rmId == object['rm_id']){
    				var opts_selectable = new DwgOpts();
    		        opts_selectable.rawDwgName = controllerGmAssign.dwgName;
    				opts_selectable.appendRec(record['em.bl_id'] + ';' + record['em.fl_id'] + ';' + record['em.rm_id']);
    				var color = null;
    				if(object.legend_level=='0'){
    					color = '0X33FF00';
    				}else if(object.legend_level=='1'){
    					color = '0X0000FF';
    				}else if(object.legend_level=='2'){
    					//KB3037147 - change at-capacity to E7CB0A to avoid confusing the room selection color
    					color = '0XE7CB0A';
    				}else if(object.legend_level=='3'){
    					color = '0XFF0000';
    				}else{
    					color = '0XDDDDDD';
    				}
    				drawingPanel.setSelectColor(color);
    				drawingPanel.highlightAssets(opts_selectable);
    				foundRmId = rmId;
    				break;
    			}
    		}

            var recordObject = new Object();
            if(foundRmId!=null){
            	recordObject["rm_id"]=foundRmId;
            	deletedRooms.push(recordObject);
            	callFutrueFalg = true;
            }
    	}
        if(callFutrueFalg){
        	//kb 3037548 add logic with future trans when caculate highlight occupancy caculation.
        	reHightLightIfExistsFuture(drawingPanel,tempObjforHightLight.blId,tempObjforHightLight.flId,deletedRooms,dateFormat(tempObjforHightLight.date_end),controllerGmAssign.dwgName);
        }
    }else{
    	for (var j = 0; j < rooms.length; j++) {
    		var row = rooms[j];
    		var opts_selectable = new DwgOpts();
            opts_selectable.rawDwgName = controllerGmAssign.dwgName;
    		opts_selectable.appendRec(row.getValue('em.bl_id') + ';' + row.getValue('em.fl_id') + ';' + row.getValue('em.rm_id'));
    		drawingPanel.setSelectColor('0xFFFF00');//yellow
    		drawingPanel.highlightAssets(opts_selectable);
    	}
    }
}

/**
 * private method 
 * get deleted rooms.
 */
function getNotExistInGridRooms(records, grid , flag1){
	var result = [];
    for ( var i = 0; i < records.length; i++) {
		var record = records[i];
		var flag = true;
		for (var j = 0; j < grid.rows.length; j++) {
			var row = grid.rows[j];
			if(flag1==0){
				if(record['em.bl_id'] == row['em.bl_id']&&record['em.fl_id'] == row['em.fl_id']&&record['em.rm_id'] == row['em.rm_id']){
					flag = false;
					continue;
				}
			}else{
				if(record.getValue('em.bl_id') == row['em.bl_id']&&record.getValue('em.fl_id') == row['em.fl_id']&&record.getValue('em.rm_id') == row['em.rm_id']){
					flag = false;
					continue;
				}
			}
		}
		if(flag){
			result.push(record);
		}
	}
	return result;	
}

function onDwgLoaded() {
	//this method invoke later then method 'resetDrawing', so when the Object 'tempObjforHightLight' reset to new value,
	//current Object objBlandFl was still the value last time assigned if click tree node quicker then detering time.
	var objBlandFl = {};
	objBlandFl.blId = tempObjforHightLight.blId;
	objBlandFl.flId = tempObjforHightLight.flId;
	
	setSelectability.defer(1000, this, [tempObjforHightLight.date_start,tempObjforHightLight.date_end,tempObjforHightLight.restriction,objBlandFl]);
} 
/**
 * common method , check if exists process 'Space Manager RmTrans'.
 * @returns
 */
function existsUserRoleProcess(){
	var dataSource = View.dataSources.get('ds_ab-sp-asgn-current-user-role');
	var records = dataSource.getRecords();
	if(records.length>0){
    	return true;
	}
	return false;
}
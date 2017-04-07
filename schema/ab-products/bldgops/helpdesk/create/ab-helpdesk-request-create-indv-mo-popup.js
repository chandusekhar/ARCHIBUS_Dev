/**
 * @author: Song
 */
var controllerCreateIndvMoPopup = View.createController('controllerCreateIndvMoPopup', {
	
	openerController: null,
	
	selectedEmId: null,
	/**
	 * assignments after view InitialDataFetch
	 */
	originalAssignments: null,
	date_end: null,
	tabs: null,
	activityLogIdValue: null,
	openerView: null,
	/**
	 * click 'Change From Location' button and click record or 'Leave From Location Empyt' in the pop-up.
	 */
	fromLocationChanged: false,
	/**
	 * click 'Change From Location' button and click record or 'Leave From Location Empyt' in the pop-up.
	 * save selected from location record to current variable.
	 */
	changedFromLocationRow: null,
	/**
	 * dwg name.
	 */
	dwgName: null,
    /**
     * 
     */
    afterInitialDataFetch: function(){
		var openerView = View.getOpenerView();
		this.openerView = openerView;
		var helpDeskGroupMoveController = openerView.controllers.get("helpDeskGroupMoveController");
		this.openerController = helpDeskGroupMoveController;
		this.tabs = helpDeskGroupMoveController.tabs;
		this.date_end = View.getOpenerWindow().getQuestionnaireFieldValue("date_start");
		var em_id = controllerCreateIndvMoPopup.openerController.emPanel.getFieldValue("rmpct.em_id");
		this.activityLogIdValue = controllerCreateIndvMoPopup.openerController.questPanel.getFieldValue("activity_log.activity_log_id");
		this.selectedEmId = em_id;
		//according kb 3032564 comments, default location change to get value "from location"
//		var bl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.from_bl_id");
//		var fl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.from_fl_id");
		//according kb 3033829 comments, default location change to get value "to location"
		var bl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.bl_id");
		var fl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.fl_id");
		var abSpAsgnEmToRm_blTree = View.panels.get("abSpAsgnEmToRm_blTree");
		
//		var restPart = " and rmpct.fl_id = '"+fl_id+"' and rmpct.bl_id = '"+bl_id+"' ";
		var restPart = bl_id!="" ?" and rmpct.bl_id = '"+bl_id+"' ":"";
		this.resreshTree(restPart);
		

		var consoleDS = View.dataSources.get("ds_ab-sp-asgn-em-to-console-for-tree");
		if(bl_id){
			var consoleDsRecords = consoleDS.getRecords("bl_id =+'"+bl_id+"'");
			if(consoleDsRecords.length>0){
				this.abSpAsgnEmToRmConsole.setFieldValue("bl.site_id",consoleDsRecords[0].getValue("bl.site_id"));
				this.abSpAsgnEmToRmConsole.setFieldValue("bl.bl_id",consoleDsRecords[0].getValue("bl.bl_id"));
			}
		}
    	
    	
        var ruleset = new DwgHighlightRuleSet();
	        ruleset.appendRule("rm.legend_level", "0", "33FF00", "==");//soft green    :Vacant
  	        ruleset.appendRule("rm.legend_level", "1", "0000FF", "==");//bule          :Available
  	        //kb 3033829 IF (the current logged-in user's role has access to the 'Space Manager RmTrans' process in afm_roleprocs)
  	        //THEN (show all occupancy 
        if(helpDeskGroupMoveController.isApproveOrIssue||existsUserRoleProcess()){
        	//KB3037147 - change at-capacity to E7CB0A to avoid confusing the room selection color
  	        ruleset.appendRule("rm.legend_level", "2", "E7CB0A", "==");//yellow        :At Capacity
  	        ruleset.appendRule("rm.legend_level", "3", "FF0000", "==");//red           :Exceeds Capacity
  	        ruleset.appendRule("rm.legend_level", "4", "00FFFF", "==");//              :Pending request
  	    	this.abSpAsgnEmToRm_drawingPanel.currentHighlightDS="ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove";
  	    	this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm_forApprove", ruleset);
        }else{
        	ruleset.appendRule("rm.legend_level", "4", "00FFFF", "==");//              :Pending request
        	this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm", ruleset);
        }
        this.abSpAsgnEmToRm_legendGrid.afterCreateCellContent = setLegendLabel;
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction(getMessage('selectRm'));
        this.abSpAsgnEmToRm_drawingPanel.addEventListener('onclick', onDwgPanelClicked);
        
		this.abSpAsgnEmToRm_drawingPanel.addEventListener('ondwgload', onDwgLoaded);
		
  	    this.originalAssignments = this.getAssignments();
  	    //default click one tree node same as opener view input.
    	var root=this.abSpAsgnEmToRm_blTree.treeView.getRoot();
    	for (var i = 0; i < root.children.length; i++) {
    		var node = root.children[i];
    		if(node.data['bl.bl_id'] == bl_id){
    			node.expand();
    			this.clickDefaultFlNode.defer(1000,this, [fl_id, node]);
    			break;
    		}
    	}
    	this.defaultAddEmployeeToAssign();
    },
    /**
     * refresh tree when page load or click show button in console.
     */
    resreshTree: function(restPart){
		var blRes = " bl_id in (select distinct rm.bl_id from bl, rm left join rmcat on rm.rm_cat =rmcat.rm_cat  where  rmcat.occupiable = 1 " +
				"and rm.bl_id =bl.bl_id  and rm.dwgname IS NOT NULL and " +
				"exists(select 1 from rmpct,bl where bl.bl_id=rmpct.bl_id and  rm.fl_id=rmpct.fl_id and rm.rm_id=rmpct.rm_id" +
				" and  rm.bl_id = rmpct.bl_id "+restPart+"))";
		this.abSpAsgnEmToRm_blTree.addParameter('consoleResBl', blRes);
		this.abSpAsgnEmToRm_blTree.refresh();
    	this.abSpAsgnEmToRm_blTree.show(true);
    },
    /**
     * filter tree when click show button.
     */
    abSpAsgnEmToRmConsole_onFilter: function(){
        var inputRestriction = this.abSpAsgnEmToRmConsole.getFieldRestriction();
		var restPart = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			if (clause.value==''||clause.value==0) {
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.op == "IN"){
					restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
				}
			}
		}
		this.resreshTree(restPart);
    },/**
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
     * private method,only use for approve
     * show default assign employee list in assign panel.
     */
    defaultAddEmployeeToAssign: function(){
		var pct_id = this.openerController.emPanel.getFieldValue("rmpct.pct_id");
		var parent_pct_id = this.openerController.emPanel.getFieldValue("rmpct.parent_pct_id");
		var activity_log_id = this.openerController.emPanel.getFieldValue("rmpct.activity_log_id");
		var em_id = this.openerController.emPanel.getFieldValue("rmpct.em_id");
		var from_bl_id = this.openerController.emPanel.getFieldValue("rmpct.from_bl_id");
		var from_fl_id = this.openerController.emPanel.getFieldValue("rmpct.from_fl_id");
		var from_rm_id = this.openerController.emPanel.getFieldValue("rmpct.from_rm_id");
		var bl_id = this.openerController.emPanel.getFieldValue("rmpct.bl_id");
		var fl_id = this.openerController.emPanel.getFieldValue("rmpct.fl_id");

		var rm_id = this.openerController.emPanel.getFieldValue("rmpct.rm_id");
		var dv_id = this.openerController.emPanel.getFieldValue("rmpct.dv_id");
		var dp_id = this.openerController.emPanel.getFieldValue("rmpct.dp_id");
		var rm_cat = this.openerController.emPanel.getFieldValue("rmpct.rm_cat");
		var rm_type = this.openerController.emPanel.getFieldValue("rmpct.rm_type");
		var primary_rm = this.openerController.emPanel.getFieldValue("rmpct.primary_rm");
		var primary_em = this.openerController.emPanel.getFieldValue("rmpct.primary_em");
		
    	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    	var emAssign = new Ab.data.Record();
//        var emAssign = emAssigns[i];
        emAssign.setValue("em.pct_id", pct_id);
        emAssign.setValue("em.parent_pct_id", parent_pct_id);
        emAssign.setValue("em.activity_log_id", activity_log_id);
        emAssign.setValue("em.em_id", em_id);
        emAssign.setValue("em.bl_id_current", from_bl_id);
        emAssign.setValue("em.fl_id_current", from_fl_id);
        emAssign.setValue("em.rm_id_current", from_rm_id);
        emAssign.setValue("em.bl_id", bl_id);
        emAssign.setValue("em.fl_id", fl_id);
        emAssign.setValue("em.rm_id", rm_id);
        emAssign.setValue("em.dv_id", dv_id);
        emAssign.setValue("em.dp_id", dp_id);
        emAssign.setValue("em.rm_cat", rm_cat);
        emAssign.setValue("em.rm_type", rm_type);
        emAssign.setValue("em.primary_rm", primary_rm);
        
        if(primary_em=="1"){
        	primary_em = getMessage("messageYes");
        }else if(primary_em=="0"){
        	primary_em = getMessage("messageNo");
        }
        emAssign.setValue("em.primary_em", primary_em);
        grid.addGridRow(emAssign);
        grid.sortEnabled = false;
        grid.update();
    },
    /**
     * private method
     */
    clickDefaultFlNode: function(current_fl_id,node){
    	for (var j = 0; j < node.children.length; j++) {
        	var flNode = node.children[j];
        	if(flNode.data['fl.fl_id'] == current_fl_id){
        		flNode.onLabelClick(flNode);
        	    $(flNode.labelElId).command.handle();
        	}
    	}
    },
	/**
	 * This event handler is called when click the tree bl. 
	 * private method
	 */
	onTreeFlClick: function(){
		var date_end = this.date_end;
	    resetDrawing(null,date_end);
	},
    /**
     * private method
     */
    getAssignments: function(status){
    	var grid = this.abSpAsgnEmToRm_emAssigned;
    	var assignments = [];
        for (var j = 0; j < grid.rows.length; j++) {
            var row = grid.rows[j];
            var gridRow = grid.gridRows.items[j];
            var record = new Object();
            record['pct_id'] = row["em.pct_id"];
            record['parent_pct_id'] = row["em.parent_pct_id"];
            record['activity_log_id'] = this.activityLogIdValue;
            record['em_id'] = row["em.em_id"];
            record['bl_id'] = row["em.bl_id"]==null?"":row["em.bl_id"];
            record['fl_id'] = row["em.fl_id"]==null?"":row["em.fl_id"];
            record['rm_id'] = row["em.rm_id"]==null?"":row["em.rm_id"];
            record['from_bl_id'] = gridRow.getFieldValue("em.bl_id_current");
            record['from_fl_id'] = gridRow.getFieldValue("em.fl_id_current");
            record['from_rm_id'] = gridRow.getFieldValue("em.rm_id_current");
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
     * assignment information transferrs to the To Building, To Floor, and To Room fields and close pop-up.
     */
    abSpAsgnEmToRm_emAssigned_onSaveAndClose: function(){
    	var tabs = this.tabs;
		var originalAssignments = this.originalAssignments;
		var changedAssignments = this.getAssignments();
		var resultAssignments = compareAssignmentsChangeReturnNew(originalAssignments,changedAssignments);
    	var dateEnd = this.date_end;
    	//for doc tab use
    	tabs.originalAssignments = originalAssignments;
    	tabs.assignments = resultAssignments;
    	tabs.dateEnd = dateFormat(dateEnd);
    	
	    var em_id = changedAssignments[0]['em_id'];
	    var bl_id = changedAssignments[0]['bl_id'];
	    var fl_id = changedAssignments[0]['fl_id'];
	    var rm_id = changedAssignments[0]['rm_id'];
	    if(bl_id!=""&&fl_id!=""&&rm_id!=""){
	    	if(!this.openerController.checkRmstdEmstd(em_id,bl_id,fl_id,rm_id)){
	    		var message =getMessage("cannotOccupy").replace("<{0}>", " "+em_id);
	    		View.alert(message);
	    		return;
	    	}
	    }
    	
    	if(changedAssignments!=null&&changedAssignments.length>0){
    		this.openerController.emPanel.setFieldValue("rmpct.from_bl_id",changedAssignments[0]['from_bl_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.from_fl_id",changedAssignments[0]['from_fl_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.from_rm_id",changedAssignments[0]['from_rm_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.primary_em",changedAssignments[0]['primary_em']);

    		this.openerController.emPanel.setFieldValue("rmpct.bl_id",changedAssignments[0]['bl_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.fl_id",changedAssignments[0]['fl_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.rm_id",changedAssignments[0]['rm_id']);
    		if(changedAssignments[0]['parent_pct_id']){
    			this.openerController.emPanel.setFieldValue("rmpct.parent_pct_id",changedAssignments[0]['parent_pct_id']*1);
    		}else{
    			this.openerController.emPanel.setFieldValue("rmpct.parent_pct_id",0);
    		}
    		this.openerController.emPanel.setFieldValue("rmpct.dv_id",changedAssignments[0]['dv_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.dp_id",changedAssignments[0]['dp_id']);
    		this.openerController.emPanel.setFieldValue("rmpct.rm_cat",changedAssignments[0]['rm_cat']);
    		this.openerController.emPanel.setFieldValue("rmpct.rm_type",changedAssignments[0]['rm_type']);
    		this.openerController.emPanel.setFieldValue("rmpct.primary_rm",changedAssignments[0]['primary_rm']);
    		
    		
    	}else{
    		this.openerController.emPanel.setFieldValue("rmpct.from_bl_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.from_fl_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.from_rm_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.primary_em","");
    		
    		this.openerController.emPanel.setFieldValue("rmpct.bl_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.fl_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.rm_id","");
    		
    		this.openerController.emPanel.setFieldValue("rmpct.parent_pct_id",0);
    		this.openerController.emPanel.setFieldValue("rmpct.dv_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.dp_id","");
    		this.openerController.emPanel.setFieldValue("rmpct.rm_cat","");
    		this.openerController.emPanel.setFieldValue("rmpct.rm_type","");
    		this.openerController.emPanel.setFieldValue("rmpct.primary_rm","");
    	}
    	this.view.closeThisDialog();
    }
});
/**
 * 
 */
function onDwgLoaded() {

	var objBlandFl = {};
	objBlandFl.blId = tempObjforHightLight.blId;
	objBlandFl.flId = tempObjforHightLight.flId;
	
	setSelectability.defer(1000, this, [tempObjforHightLight.date_start,tempObjforHightLight.date_end,tempObjforHightLight.restriction,objBlandFl]);
}
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
    toAddAssignmentRows(pkArray,ojbDvDpRmCatRmType);
    popUpPanel.show(false);
    popUpPanel.closeWindow();
}
/**
 * event handler when click room of the drawing panel 'abSpAsgnEmToRm_drawingPanel'.
 * 1.if exist mutiple record of 'dv_id dp_id, rm_cat, rm_type' in table 'rmpct', show panel select one.
 * 2.add employee to assign panel list
 * 3.save panameter 'assignments_changed' for 'approve'
 * @param {Object} pk[bl_id,fl_id,rm_id]
 */
function onDwgPanelClicked(pk, selected, color){
	//consider use one dataSource will be Okay, if true, ds_ab-sp-asgn-em-to-click_rm will be delete 
//	var dsClickRoom = View.dataSources.get("ds_ab-sp-asgn-em-to-click_rm");
	var dsClickRoom = View.dataSources.get("ds_ab-sp-asgn-em-to-click_rm_pop_up");
	dsClickRoom = addParmeter(dsClickRoom,pk);
    var dsRecords = dsClickRoom.getRecords();
    if(dsRecords.length>1){
    	pkArray = pk;
    	var showPanel=View.panels.get("abSpAsgnEmToClickRm_popup");
    	showPanel = addParmeter(showPanel,pk);
		showPanel.refresh();
		showPanel.showInWindow({
			width: 800,
			height: 500
		});
    }else{
    	//deal with dsRecords length == 1
    	var ojbDvDpRmCatRmType = {};
        if (dsRecords.length==1){
        	var pct_id = dsRecords[0].getValue("rmpct.pct_id");
        	var dv_id = dsRecords[0].getValue("rmpct.dv_id");
        	var dp_id = dsRecords[0].getValue("rmpct.dp_id");
        	var rm_cat = dsRecords[0].getValue("rmpct.rm_cat");
        	var rm_type = dsRecords[0].getValue("rmpct.rm_type");
        	var primary_rm = dsRecords[0].getValue("rmpct.primary_rm");
        	ojbDvDpRmCatRmType.pct_id=pct_id;
            ojbDvDpRmCatRmType.dv_id=dv_id;
            ojbDvDpRmCatRmType.dp_id=dp_id;
            ojbDvDpRmCatRmType.rm_cat=rm_cat;
            ojbDvDpRmCatRmType.rm_type=rm_type;
            ojbDvDpRmCatRmType.primary_rm=primary_rm;
        }
    	toAddAssignmentRows(pk,ojbDvDpRmCatRmType);
    }
}
/**
 * private method
 */
function addParmeter(showPanel,pk){
	var date_start = null;
	var date_end =  controllerCreateIndvMoPopup.date_end;
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
    var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
    var dateRestriction = " AND  (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
    
//	var dateRestriction = " AND rmpct.date_start &lt;= ${sql.date('"+dateFormat(date_end)+"')} AND" +
//			" rmpct.date_end &gt;= ${sql.date('"+dateFormat(date_end)+"')}";
	showPanel.addParameter('p_bl_id', blId);
	showPanel.addParameter('p_fl_id', flId);
	showPanel.addParameter('p_rm_id', rmId);
	showPanel.addParameter('dateRestriction', dateRestriction);
	return showPanel;
}

/**
 * private method
 * add over capacity check before add row.
 * @param pk
 */
function toAddAssignmentRows(pk,ojbDvDpRmCatRmType){
	if (checkCount(pk)) {
        View.confirm(getMessage('countOver'), function(button){
            if (button == 'yes') {
            	toAddAssignmentRowsAndUpdate(pk,ojbDvDpRmCatRmType);
            }
        });
    }else{
    	toAddAssignmentRowsAndUpdate(pk,ojbDvDpRmCatRmType);
    }
}
/**
 * private method, for individual move 
 * if there already exists a record in the Assignments panel, then remove it. 
 * There can only be one employee assignment (move) for an individual move.
 * @param pk
 */
function toAddAssignmentRowsAndUpdate(pk,ojbDvDpRmCatRmType){
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
	var em_id = controllerCreateIndvMoPopup.selectedEmId;
    var em = getEmRecordsById(em_id);
    
	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
	clearChanges();
    var emAssign = new Ab.data.Record();
    emAssign.setValue("em.em_id", em_id);
	var emRecord = controllerCreateIndvMoPopup.openerController.getFromLocationByEm(em_id);
	//kb 3034036 get the from location from oraginal page 'from location' inputed.
	var bl_id = controllerCreateIndvMoPopup.openerController.emPanel.getFieldValue("rmpct.from_bl_id");
	var fl_id = controllerCreateIndvMoPopup.openerController.emPanel.getFieldValue("rmpct.from_fl_id");
	var rm_id = controllerCreateIndvMoPopup.openerController.emPanel.getFieldValue("rmpct.from_rm_id");
	var primary_em = controllerCreateIndvMoPopup.openerController.emPanel.getFieldValue("rmpct.primary_em");
	 if(emRecord!=null){
		emAssign.setValue("em.bl_id_current",bl_id);
		emAssign.setValue("em.fl_id_current", fl_id);
		emAssign.setValue("em.rm_id_current", rm_id);
        //manually change the propority to 'yes' or 'no' if it was '1' or '0'.
        var assignPrimaryEm = emRecord.getValue("rmpct.primary_em");
        if(assignPrimaryEm=="1"){
        	assignPrimaryEm = getMessage("messageYes");
        }else if(assignPrimaryEm=="0"){
        	assignPrimaryEm = getMessage("messageNo");
        }
	    emAssign.setValue("em.primary_em",assignPrimaryEm);
	 }else if(em!=null&&em.length>0){
		emAssign.setValue("em.bl_id_current",bl_id);
		emAssign.setValue("em.fl_id_current", fl_id);
		emAssign.setValue("em.rm_id_current", rm_id);
    	emAssign.setValue("em.primary_em", getMessage("messageYes"));
    }else{
		emAssign.setValue("em.bl_id_current",bl_id);
		emAssign.setValue("em.fl_id_current", fl_id);
		emAssign.setValue("em.rm_id_current", rm_id);
    	emAssign.setValue("em.primary_em", getMessage("messageNo"));
    }
    emAssign.setValue("em.bl_id", blId);
    emAssign.setValue("em.fl_id", flId);
    emAssign.setValue("em.rm_id", rmId);
    if(primary_em=="1"){
    	primary_em = getMessage("messageYes");
    }else if(primary_em=="0"){
    	primary_em = getMessage("messageNo");
    }
    emAssign.setValue("em.primary_em", primary_em);
    
    emAssign.setValue("em.parent_pct_id", ojbDvDpRmCatRmType.pct_id);
    emAssign.setValue("em.dv_id", ojbDvDpRmCatRmType.dv_id);
    emAssign.setValue("em.dp_id", ojbDvDpRmCatRmType.dp_id);
    emAssign.setValue("em.rm_cat", ojbDvDpRmCatRmType.rm_cat);
    emAssign.setValue("em.rm_type", ojbDvDpRmCatRmType.rm_type);
    emAssign.setValue("em.primary_rm", ojbDvDpRmCatRmType.primary_rm);
    
	grid.addGridRow(emAssign);
	
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
	var opts_selectable = new DwgOpts();
    opts_selectable.rawDwgName = controllerCreateIndvMoPopup.dwgName;
	opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
	drawingPanel.setSelectColor('#FFD700');
	drawingPanel.highlightAssets(opts_selectable);
	
    grid.sortEnabled = false;
    grid.update();
    // if from location had changed by click 'Change From Location' button before select room in Floor Plan, 
    // when click 'Floor Plan' completed, call method 'change from location' again change back to original selected from location and caculate Primary Employee Location
    if(controllerCreateIndvMoPopup.fromLocationChanged){
    	
    	subChooseOneRecordFromRoom(controllerCreateIndvMoPopup.changedFromLocationRow);
    	controllerCreateIndvMoPopup.fromLocationChanged = false;
    	controllerCreateIndvMoPopup.changedFromLocationRow = null;
    }
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
    var availableCount = getRoomCountVal(blId, flId, rmId, 'rm.cap_em') - getRoomCountVal(blId, flId, rmId, 'rm.count_em');
    var newAssignedCount = 0;
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
//    grid.show(true);
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
    return false;
}
/**
 * private method, get the room employee count or employee capacity from database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName rm.count_em or rm.cap_em
 * @return {int} cnt
 */
function getRoomCountVal(buildingId, floorId, roomId, fieldName){
	var date_start = null;
	var date_end =  controllerCreateIndvMoPopup.date_end;
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
 * private method
 * @returns
 */
function getEmRecordsById(em_id){
	var dsRmpct = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_grid_em");
	var restriction = new Ab.view.Restriction();
	restriction.addClause("em.em_id", em_id);
    return dsRmpct.getRecords(restriction);
}

var tempObjforHightLight={};
/**
 * private method
 * make the drawing room clickable.
 */
function resetDrawing(date_start,date_end){
	 var cp = View.getControl('', 'abSpAsgnEmToRm_drawingPanel');
	 var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
	 var blId = currentNode.data['fl.bl_id'];
	 var flId = currentNode.data['fl.fl_id'];
	 var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
	 
	 setParametersToDataSource(date_start,date_end);
	var dwgName = currentNode.data['fl.dwgname'];
	controllerCreateIndvMoPopup.dwgName =  dwgName;
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	cp.addDrawing(dcl);
	tempObjforHightLight.date_start=date_start;
	tempObjforHightLight.date_end=date_end;
	tempObjforHightLight.restriction=currentNode.restriction;
	tempObjforHightLight.blId=blId;
	tempObjforHightLight.flId=flId;
	cp.isLoadedDrawing = true;
	cp.clearAssignCache(true);
	
	var em_id = controllerCreateIndvMoPopup.selectedEmId;
	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    grid.sortEnabled = false;
    grid.update();
	cp = View.getControl('', 'abSpAsgnEmToRm_drawingPanel');
	
	var pendingRequestGrid = View.panels.get('abSpIndvMo_rmPendingRequestList');
	pendingRequestGrid.addParameter('blId', blId);
	pendingRequestGrid.addParameter('flId', flId);
	pendingRequestGrid.addParameter('moveDate', dateFormat(date_end));

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
    if(controllerCreateIndvMoPopup.openerView.controllers.get("helpDeskGroupMoveController").isApproveOrIssue||existsUserRoleProcess()){
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
    opts_selectable.rawDwgName = controllerCreateIndvMoPopup.dwgName;
    
    var opts_unselectable = new DwgOpts();
    opts_unselectable.rawDwgName = controllerCreateIndvMoPopup.dwgName;
    
    for (var i = 0; i < rmRecords.length; i++) {
    	originalRooms.push({'bl_id':blId,'fl_id':flId,'rm_id':rmId,'legend_level':legend_level});
        var record = rmRecords[i];
        var legend_level = record.getValue('rm.legend_level');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        //hightlight yellow for room which exist in assignment list.
        var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
        for (var j = 0; j < grid.rows.length; j++) {
        	var row = grid.rows[j];
        	if(blId == row['em.bl_id']&&flId == row['em.fl_id']&&rmId == row['em.rm_id']){
        		locationArray.push(blId + ';' + flId + ';' + rmId);
        	}
        }
        
        if (legend_level == '0'||legend_level == '1'||legend_level == '2'||legend_level == '3') {
        	opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
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
    reHightLightIfExistsFuture(drawingPanel,objBlandFl.blId,objBlandFl.flId,rooms,dateFormat(date_end),controllerCreateIndvMoPopup.dwgName);
    
    var opts_selectable = new DwgOpts();
    opts_selectable.rawDwgName = controllerCreateIndvMoPopup.dwgName;
    for(var i = 0;i < locationArray.length; i++){
    	opts_selectable.appendRec(locationArray[i]);
    	drawingPanel.setSelectColor('0xFFFF00');
    }
    drawingPanel.highlightAssets(opts_selectable);
    var em_id = controllerCreateIndvMoPopup.selectedEmId;
	drawingPanel.setToAssign("em.em_id", em_id);
	
	//KB3034460 - list pending request and hiighlight the border of the room that with pending request
	showBorderHighlights(tempObjforHightLight.blId,tempObjforHightLight.flId,dateFormat(date_end));
}
/**
 * private method
 * reset Hightlight for deleted or new added rooms.
 */
function reSetHighLight(){
	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");

    var deletedRooms = [];
    var callFutrueFalg = false;
	//make the orignal record highlight color recover.
    for (var j = 0; j < grid.rows.length; j++) {
        var record = grid.rows[j];
		var foundRmId = null;
		for (var i = 0; i < originalRooms.length; i++) {
			var object = originalRooms[i];
	        var blId = record['em.bl_id'];
	        var flId = record['em.fl_id'];
	        var rmId = record['em.rm_id'];
	        
			if(blId!=undefined&&blId == object['bl_id']&&flId == object['fl_id']&&rmId == object['rm_id']){
				
				var opts_selectable = new DwgOpts();
			    opts_selectable.rawDwgName = controllerCreateIndvMoPopup.dwgName;
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
    	reHightLightIfExistsFuture(drawingPanel,tempObjforHightLight.blId,tempObjforHightLight.flId,deletedRooms,dateFormat(tempObjforHightLight.date_end),controllerCreateIndvMoPopup.dwgName);
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

	//make the orignal record highlight color recover.
	reSetHighLight();
	
    grid.removeRows(0);
    grid.update();
}



var row_em_id = null;
/**
 * event handler when 'click from location' button click
 * show a pop-up panel for use select other location.
 */
function clickChangeFromLocation(){
	var date_end =  controllerCreateIndvMoPopup.date_end;
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
	var date_end =  controllerCreateIndvMoPopup.date_end;
	var popupPanel = View.panels.get('abSpAsgnEmToRm_popup');
	popupPanel.addParameter('p_date_start', dateFormat(date_end));
	popupPanel.addParameter('p_date_end', dateFormat(date_end));
	popupPanel.refresh();
	popupPanel.showInWindow({
		width: 800,
		height: 500
	});
}
/**
 * private method
 * check if exist em pending move
 */
function checkIfExistEmMove(em_id,date_end){
	//KB3036965 - support em_id with single quotes
	em_id = em_id.replace(/\'/g, "''");
	
	var dataSource = View.dataSources.get("ds_ab-sp-asgn-select-location");
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
	var date_end =  controllerCreateIndvMoPopup.date_end;
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
 * event handler when 'click to location' button click
 * show a pop-up panel for use select other location.
 */
function clickChangeToLocation(){
	var date_end =  controllerCreateIndvMoPopup.date_end;
	var popupPanel = View.panels.get('abSpAsgnEmToRm_popup');
	popupPanel.addParameter('p_date_start', dateFormat(date_end));
	popupPanel.addParameter('p_date_end', dateFormat(date_end));
	popupPanel.refresh();
	popupPanel.showInWindow({
		width: 800,
		height: 500
	});
}

/**
 * event handler when click one record of from bl fl rm.
 * 1.change assign list according you selected row
 * 2.change 'primary_em' to 0 if you selected different room.
 */
function chooseOneRecordFromRoom(){
	
	var popUpPanel = View.panels.get('abSpAsgnEmFromRm_popup');
	var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
	subChooseOneRecordFromRoom(rowIndex);
	
	controllerCreateIndvMoPopup.fromLocationChanged = true;
	controllerCreateIndvMoPopup.changedFromLocationRow = rowIndex;
}

/**
 * private method.
 * event handler when click one record of from bl fl rm.
 * 1.change assign list according you selected row
 * 2.change 'primary_em' to 0 if you selected different room.
 */
function subChooseOneRecordFromRoom(rowIndex){
	var popUpPanel = View.panels.get('abSpAsgnEmFromRm_popup');
    var orginalPanel = View.panels.get('abSpAsgnEmToRm_emAssigned');
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
    
    if(isEqualBlFlRm(selectedRow.getFieldValue("em.em_id"),bl_id,fl_id,rm_id)){
    	selectedRow.setFieldValue("em.primary_em",getMessage("messageYes"));
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.primary_em"] = getMessage("messageYes");
    }else{
    	selectedRow.setFieldValue("em.primary_em",getMessage("messageNo"));
    	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.primary_em"] = getMessage("messageNo");
    }
    popUpPanel.closeWindow();
}
/**
 * event handler when click one record of to bl fl rm.
 * 1.change assign list according you selected row
 */
function chooseOneRecordMoveToRoom(){
	var popUpPanel = View.panels.get('abSpAsgnEmToRm_popup');
	var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
	var orginalPanel = View.panels.get('abSpAsgnEmToRm_emAssigned');
//    var selectedRow = orginalPanel.gridRows[orginalPanel.selectedRowIndex];
	var bl_id="",fl_id="",rm_id="";
	if(rowIndex){
		bl_id = rowIndex["rm.bl_id"];
		fl_id = rowIndex["rm.fl_id"];
		rm_id = rowIndex["rm.rm_id"];
	}
	var selectedRow = orginalPanel.gridRows.get(orginalPanel.selectedRowIndex);
	selectedRow.setFieldValue("em.bl_id",bl_id);
	selectedRow.setFieldValue("em.fl_id",fl_id);
	selectedRow.setFieldValue("em.rm_id",rm_id);
	//below function for change the row is necessary when add new record to grid avoid lose former change.
	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.bl_id"] = bl_id;
	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.fl_id"] = fl_id;
	orginalPanel.rows[orginalPanel.selectedRowIndex]["em.rm_id"] = rm_id;
	popUpPanel.closeWindow();
}
/**
 * private method
 * check if exist primary_em=1 record.
 */
function isEqualBlFlRm(em_id,bl_id,fl_id,rm_id){
 	var dataSource = controllerCreateIndvMoPopup.openerController.ds_ab_assign_em_to_rm_js;
	var date_end =  controllerCreateIndvMoPopup.date_end;
     var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
     var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
	 //KB3036965 - support em_id with single quotes
     em_id = em_id.replace(/\'/g, "''");
     var dateRestriction ="rmpct.em_id ='"+em_id+"' AND rmpct.primary_em =1 AND status=1 AND (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
     dateRestriction ="rmpct.bl_id='"+bl_id+"' AND rmpct.fl_id='"+fl_id+"' AND rmpct.rm_id='"+rm_id+"' AND "+dateRestriction;
     var dsRecords =  dataSource.getRecords(dateRestriction);
     if(dsRecords!=null&&dsRecords.length>0){
     	return true;
     }else {
         if(ifExistsInEm(em_id,bl_id,fl_id,rm_id)){
         	return true;
         }	
      }
      return false;
 }
 /**
  * private method
  * check if exist record in em table.
  */
 function ifExistsInEm(em_id,bl_id,fl_id,rm_id){
 	if(bl_id==""||fl_id==""||rm_id==""){
 		return false;
 	}
    var dataSource = controllerCreateIndvMoPopup.openerController['ds_ab_assign_em_rm_js'];
 	var restriction = new Ab.view.Restriction();
 	restriction.addClause("em.em_id", em_id);
 	restriction.addClause("em.bl_id", bl_id);
 	restriction.addClause("em.fl_id", fl_id);
 	restriction.addClause("em.rm_id", rm_id);
     var dsRecords =  dataSource.getRecords(restriction);
     if(dsRecords!=null&&dsRecords.length>0){
     	return true;
     }	
     return false;
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

/**
  * show border highlights.
  */
 function showBorderHighlights(blId,flId,moveDate){
	var controller = View.controllers.get('controllerCreateIndvMoPopup');

	var df = new DwgFill();

	// Set the color
	var color = '00FFFF';
	var highlightOpts = new DwgOpts();
	highlightOpts.rawDwgName = controllerCreateIndvMoPopup.dwgName;
	highlightOpts.mode = 'none';
	
	var ds = controller.ds_abSpIndvMo_rmPendingRequestHighlightDS;
	ds.addParameter('blId', blId);
	ds.addParameter('flId', flId);
	ds.addParameter('moveDate', moveDate);

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
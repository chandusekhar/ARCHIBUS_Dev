/**
 * @author zhang.yi
 */
var allocRoomPctCtrl = View.createController('allocRoomPctCtrl', {

    //Restrcition of Room of Current Selected Room or Rmpct Node 
    curRoomRestriction: null,

	//Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    afterInitialDataFetch: function(){
    	this.date = getCurrentDate();
		this.searchRoomConsole.setFieldValue('rmpct.date_start', this.date);
        //set default  flag to 'AllRooms' and set flag to 1  
        var roomOfRadios = document.getElementsByName("roomOf");
        roomOfRadios[0].checked = true;
        
        this.treeview = View.panels.get('pct_tree');
        if(View.restriction!=null){
        	var restriction = ' 1=1 ';
        	for(var i=0; i< View.restriction.clauses.length;i++){
        		restriction += " and "+View.restriction.clauses[i].name+" = '"+View.restriction.clauses[i].value+"'";
        	}
        	this.date =  View.getOpenerView().dateINConsole;
        	this.searchRoomConsole.setFieldValue('rmpct.date_start', this.date);
        	this.treeview.addParameter('rmHotelableRes', restriction);
        	this.treeview.addParameter('dateFrom', this.date);
        	this.treeview.addParameter('dateTo', this.date);
        	this.treeview.refresh();
        	this.expandTreeToFirstNode();
        	//hide the filter console and tree panel
    		var layoutManager = View.getLayoutManager('nested_west');
    		if (!layoutManager.isRegionCollapsed('north')) {
    			layoutManager.collapseRegion('north');
    		}
        }
        
        var useRoomTransactions = '';
        var resyncRoomTransactionsTable = '';
        var record = this.afm_activity_params_ds.getRecord("activity_id='AbSpaceRoomInventoryBAR' AND param_id='UseWorkspaceTransactions'");
        if(record){
        	useRoomTransactions = record.getValue('afm_activity_params.param_value');
        }
        record = this.afm_activity_params_ds.getRecord("activity_id='AbSpaceRoomInventoryBAR' AND param_id='ResyncWorkspaceTransactionsTable'");
        if(record){
        	resyncRoomTransactionsTable = record.getValue('afm_activity_params.param_value');
        }
        if(useRoomTransactions =='1' && resyncRoomTransactionsTable=='1' ){
        	View.showMessage(getMessage('outOfSynch'));
        }

		this.pct_tree.addParameter('dateFrom', this.date);
		this.pct_tree.addParameter('dateTo', this.date);
    },
    
    expandTreeToFirstNode: function(){
    	var root=this.treeview.treeView.getRoot();
    	var blNode = root.children[0];
    	this.treeview.refreshNode(blNode);
    	blNode.expand();
    	var flNode = blNode.children[0];
    	this.treeview.refreshNode(flNode);
    	flNode.expand();
    	var rmNode = flNode.children[0];
    	this.treeview.refreshNode(rmNode);
    	rmNode.expand();
    	var rmpctNode = rmNode.children[0];
    	if(rmpctNode){
        	rmpctNode.onLabelClick(rmpctNode);
        	$(rmpctNode.labelElId).command.handle();	
    	}
    },
    
    searchRoomConsole_onSearch: function(){
		var roomOfRadios = document.getElementsByName("roomOf");
		var blId=this.searchRoomConsole.getFieldValue("rmpct.bl_id");
		var flId=this.searchRoomConsole.getFieldValue("rmpct.fl_id");
		var date=this.searchRoomConsole.getFieldValue("rmpct.date_start");
		var restriction="";
		if(blId!=''){
			restriction+="	and rm.bl_id='"+blId+"'";
		}
		if(flId!=''){
			restriction+="	and rm.fl_id='"+flId+"'";
		}
		if (roomOfRadios[0].checked) {
            this.pct_tree.addParameter('rmHotelableRes', ' 1=1 '+restriction);
	    }
		if (roomOfRadios[1].checked) {
            this.pct_tree.addParameter('rmHotelableRes', ' rm.hotelable=1 '+restriction);
	    }
		if (roomOfRadios[2].checked) {
            this.pct_tree.addParameter('rmHotelableRes', ' rm.hotelable!=1 '+restriction);
	    }

		//The filter field "Date Active" should be used to query the rmpct table to find all rmpct records:
		if(date){
			//WHERE (rmpct.date_start IS NULL OR rmpct.date_start <= <date>) AND (rmpct.date_end IS NULL OR rmpct.date_end >= <date>).
			this.pct_tree.addParameter('dateFrom', date);
			this.pct_tree.addParameter('dateTo', date);
		}
		else {
			// If the filter field "Date Active" is left empty, then the view should show ALL rmpct records, unrestricted.
			this.pct_tree.addParameter('dateFrom', '2200-01-01');
			this.pct_tree.addParameter('dateTo', '1900-01-01');
		}

		this.pct_tree.refresh();
		this.rmpct_detail.show(false);
    },
    searchRoomConsole_onClear: function(){
    	//fix KB3035122 - clear not work
    	this.searchRoomConsole.clear();
        var roomOfRadios = document.getElementsByName("roomOf");
        roomOfRadios[0].checked = true;
        this.searchRoomConsole.setFieldValue('rmpct.date_start', getCurrentDate());
        this.searchRoomConsole_onSearch();
    },
    
    pct_tree_onAddNew: function(){
        var blId = "";
        var flId = "";
        var rmId = "";
        var nodeLevelIndex = -1;
        this.curTreeNode = View.panels.get("pct_tree").lastNodeClicked;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 2: //room node
                    blId = this.curTreeNode.data["rm.bl_id"];
                    flId = this.curTreeNode.data["rm.fl_id"];
                    rmId = this.curTreeNode.data["rm.rm_id"];
                    break;
                case 3: //room percentage node
                    blId = this.curTreeNode.data["rm.bl_id"];
                    flId = this.curTreeNode.data["rm.fl_id"];
                    rmId = this.curTreeNode.data["rm.rm_id"];
                    break;
            }
        }
        
        if (nodeLevelIndex < 2) {
            View.showMessage(getMessage("errorSelectRoom"));
            return;
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rmpct.rm_id", rmId, '=');
        restriction.addClause("rmpct.fl_id", flId, '=');
        restriction.addClause("rmpct.bl_id", blId, '=');
		//store current room restriction
		this.curRoomRestriction = restriction;
        this.rmpct_detail.refresh(restriction, true, false, false);
    },
    
    rmpct_detail_afterRefresh: function(){
    	var form = this.rmpct_detail;
    	var blId = form.getFieldValue('rmpct.bl_id');
    	var flId = form.getFieldValue('rmpct.fl_id');
    	var rmId = form.getFieldValue('rmpct.rm_id');
    	$('bl_id_readonly').innerHTML = blId;
    	$('fl_id_readonly').innerHTML = flId;
    	$('rm_id_readonly').innerHTML = rmId;
		
		//When the user clicks "Add New Workspace Transaction", get room record from current room restriction of clicked room or rmpct node
    	if(form.newRecord){
    		var dsRoom = View.dataSources.get('ds_ab-sp-alloc-pct_tree_rm');
    		var roomRecord= dsRoom.getRecord(this.curRoomRestriction);
    		//When the user clicks "Add New Workspace Transaction", 
    		//default Room Category, Room Type, Division Code, and Department Code to the values that are in the corresponding rm table
    		if(roomRecord){
    			form.setFieldValue("rmpct.dv_id", roomRecord.getValue("rm.dv_id"));
    			form.setFieldValue("rmpct.dp_id", roomRecord.getValue("rm.dp_id"));
    			form.setFieldValue("rmpct.rm_cat", roomRecord.getValue("rm.rm_cat"));
    			form.setFieldValue("rmpct.rm_type", roomRecord.getValue("rm.rm_type"));
    		} 
    	}
		
    },
    
    rmpct_detail_onSave: function(){
        this.commonSave("rmpct_detail");
    },
    
    commonSave: function(formPanelID){
        if( this.checkEmId() ){
			 this.checkPrimaryRmAndEm(formPanelID);
        }
    },
    
   	saveWorkspaceTransaction: function(formPanelID){
		var formPanel = View.panels.get(formPanelID);
		if (formPanel.save()) {
			//refresh the tree panel
			this.refreshTreePanelAfterUpdate();
			
			this.checkTotalPctSpaceOfRm();
			this.updateRmAndEmTable();
			var pct_id= formPanel.getFieldValue("rmpct.pct_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause('rmpct.pct_id', pct_id);
			formPanel.refresh(restriction);
			
			//show text message in the form				
			var message = getMessage('formSaved');
			formPanel.displayTemporaryMessage(message);
		}
	},
	
	checkEmId: function(){
    	var form = this.rmpct_detail;
    	var emId = form.getFieldValue('rmpct.em_id');
    	if(emId){
    		var restriction = new Ab.view.Restriction();
        	restriction.addClause('em.em_id', emId);
        	var ds = this.updteEmDS;
        	var records = ds.getRecords(restriction);
        	if(records.length==0){
    			View.alert(getMessage('invalidEmId'));
    			return false;
    		}
    	}
    	return true;
    },
    
    checkPrimaryRmAndEm: function(formPanelID){
    	var form = this.rmpct_detail;
    	if(!form.canSave()){
    		return false;
    	}
    	var pctId = form.getFieldValue('rmpct.pct_id');
    	if(pctId==''){
    		pctId = '-1'
    	}
    	var emId = form.getFieldValue('rmpct.em_id');
    	var blId = form.getFieldValue('rmpct.bl_id');
    	var flId = form.getFieldValue('rmpct.fl_id');
    	var rmId = form.getFieldValue('rmpct.rm_id');
    	var dvId = form.getFieldValue('rmpct.dv_id');
    	var dp_id = form.getFieldValue('rmpct.dp_id');
    	var rmCat = form.getFieldValue('rmpct.rm_cat');
    	var rmType = form.getFieldValue('rmpct.rm_type');
    	var dateStart = form.getFieldValue('rmpct.date_start');
    	var dateEnd = form.getFieldValue('rmpct.date_end');
    	var primaryRm = form.getFieldValue('rmpct.primary_rm');
    	var primaryEm = form.getFieldValue('rmpct.primary_em');
    	
    	var date_start_range = '';
		var date_end_range = '';
		
		if(dateStart){
			date_start_range += " (date_start IS NULL OR date_start &gt;=${sql.date('"+dateStart+"')})";
			date_end_range += " (date_end IS NULL OR date_end &gt;=${sql.date('"+dateStart+"')})";
		}
		
		if(dateEnd){
			if(date_start_range){
				date_start_range += " AND "
			}
			if(date_end_range){
				date_end_range += " AND "
			}
			date_start_range += "(date_start IS NULL OR date_start &lt;=${sql.date('"+dateEnd+"')})";
			date_end_range += " (date_end IS NULL OR date_end &lt;=${sql.date('"+dateEnd+"')})";
		}
		
		if(!date_start_range){
			date_start_range = " 1=1 ";
		}
		
		if(!date_end_range){
			date_end_range = " 1=1 ";
		}
    	 //check primary_rm
    	if(primaryRm=='1'){
			return this.checkPrimaryRoom(pctId, blId, flId, rmId, dvId, dp_id, rmCat, rmType, date_start_range,date_end_range, primaryEm, emId, formPanelID);
		}  else {
			return this.checkPrimaryEmployee(primaryEm, emId, pctId, blId, flId, rmId,  date_start_range,date_end_range, formPanelID);
		}    	
    },

    checkPrimaryRoom: function(pctId, blId, flId, rmId, dvId, dp_id, rmCat, rmType, date_start_range,date_end_range, primaryEm, emId, formPanelID){
		var ds = this.checkPrimaryRmCountDS;
		ds.addParameter('pct_id', pctId);
		ds.addParameter('bl_id', blId);
		ds.addParameter('fl_id', flId);
		ds.addParameter('rm_id', rmId);
		ds.addParameter('dv_id', (dvId == '') ? " dv_id IS NOT NULL " : "(dv_id IS NULL OR dv_id !='" + dvId + "')");
		ds.addParameter('dp_id', (dp_id == '') ? " dp_id IS NOT NULL " : "(dp_id IS NULL OR dp_id !='" + dp_id + "')");
		ds.addParameter('rm_cat', (rmCat == '') ? " rm_cat IS NOT NULL " : "(rm_cat IS NULL OR rm_cat !='" + rmCat + "')");
		ds.addParameter('rm_type', (rmType == '') ? " rm_type IS NOT NULL " : "(rm_type IS NULL OR rm_type !='" + rmType + "')");
		ds.addParameter('date_start_range', date_start_range);
		ds.addParameter('date_end_range', date_end_range);
		try{
			var record = ds.getRecord();
			if(record.getValue('rmpct.primary_rm_count')>0){
				View.confirm(getMessage('multiple_primary_rm'), function(button){
					if (button == 'yes') {
						return allocRoomPctCtrl.checkPrimaryEmployee(primaryEm, emId, pctId, blId, flId, rmId,  date_start_range,date_end_range, formPanelID);
					}
					else 
						return false;
				}); 
			}
			else {
				return this.checkPrimaryEmployee(primaryEm, emId, pctId, blId, flId, rmId,  date_start_range,date_end_range, formPanelID);
			}
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},

	checkPrimaryEmployee: function(primaryEm, emId, pctId, blId, flId, rmId,  date_start_range,date_end_range, formPanelID){
		//continue check primary_em
		if(primaryEm=='1' && emId){
			var ds = this.checkPrimaryEmCountDS;
			ds.addParameter('pct_id', pctId);
			ds.addParameter('bl_id', blId);
			ds.addParameter('fl_id', flId);
			ds.addParameter('rm_id', rmId);
			ds.addParameter('em_id', emId);
			ds.addParameter('date_start_range', date_start_range);
			ds.addParameter('date_end_range', date_end_range);
			try{
				var record = ds.getRecord();
				if(record.getValue('rmpct.primary_em_count')>0){
					View.confirm(getMessage('multiple_primary_em'), function(button){
						if (button == 'yes') {
							allocRoomPctCtrl.saveWorkspaceTransaction(formPanelID);
							return true;
						}
						else 
							return false;
					}); 
				}
				else {
					this.saveWorkspaceTransaction(formPanelID);
					return true;
				}
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
		else {
			this.saveWorkspaceTransaction(formPanelID);
			return true;		
		}
	},

    checkTotalPctSpaceOfRm: function(){
    	var form = this.rmpct_detail;
    	var blId = form.getFieldValue('rmpct.bl_id');
    	var flId = form.getFieldValue('rmpct.fl_id');
    	var rmId = form.getFieldValue('rmpct.rm_id');
    	var dateStart = form.getFieldValue('rmpct.date_start');
    	if(!dateStart){
    		dateStart = getCurrentDate();
    	}
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('rmpct.bl_id', blId);
    	restriction.addClause('rmpct.fl_id', flId);
    	restriction.addClause('rmpct.rm_id', rmId);
    	this.calculateRmPctSpaceDS.addParameter('date', dateStart);
    	var record = this.calculateRmPctSpaceDS.getRecord(restriction);
    	if(record){
    		var totalPctSpace = record.getValue('rmpct.sum_pct_space');
    		if(totalPctSpace!=100){
				View.confirm(getMessage('runUpdatePercentageOfSpace'), function(button){
					if (button == 'yes') {
						try{
							Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransaction-updatePercentageOfSpaceWithoutHistory", dateStart, blId, flId, rmId);
						}catch(e){
							Workflow.handleError(e);
						}
					}
				}); 
    		}
    	}
    },
    
    updateRmAndEmTable: function(){
    	//KB3038059 - call new WFR updateRmAndEmFromRmpctAndSuspendDataEvent to update rm and em and suspend data change event
    	var record = this.rmpct_detail.getOutboundRecord();
    	
    	try{
    		Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransaction-updateRmAndEmFromRmpctAndSuspendDataEvent", record);
		}catch(e){
			Workflow.handleError(e);
		}
		
    },
    
    rmpct_detail_onDelete: function(){
        this.commonDelete("ds_ab-sp-alloc-pct_form_rmpct", "rmpct_detail", "rmpct.pct_id");
    },
    
    commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        var dataSource = View.dataSources.get(dataSourceID);
        var formPanel = View.panels.get(formPanelID);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(primaryFieldFullName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTreePanelAfterUpdate();
                formPanel.show(false);
                
            }
        })
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(){
        var parentNode = this.getParentNode();
        this.treeview.refreshNode(parentNode);
        if (parentNode.parent) {
            parentNode.parent.expand();
        }
        parentNode.expand();
    },
    
    /**
     * prepare the parentNode parameter for calling refreshNode function
     */
    getParentNode: function(){
        var levelIndex = -1;
        this.curTreeNode = this.treeview.lastNodeClicked;
        if (this.curTreeNode) {
            levelIndex = this.curTreeNode.level.levelIndex;
        }
        switch (levelIndex) {
            case 2:
                return this.curTreeNode;
                break;
            case 3:
                if (this.curTreeNode.parent) {
                    this.curTreeNode.myParent = this.curTreeNode.parent;
                    return this.curTreeNode.parent;
                }
                else {
                    return this.curTreeNode.myParent;
                }
                break;
            default:
                View.showMessage(getMessage("errorSelectRoom"));
                break;
        }
    }
})

/*
 * set the global variable 'curTreeNode' in controller 'defineLocationRM'
 */
function onClickTreeNode(){
    View.controllers.get('allocRoomPct').curTreeNode = View.panels.get("pct_tree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    var labelText1 = "";
    if (treeNode.level.levelIndex == 1) {
        var floorId = treeNode.data['fl.fl_id'];
        var floorName = treeNode.data['fl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + floorId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + floorName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var rmId = treeNode.data['rm.rm_id'];
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + rmId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 3) {
        var rmpctId = treeNode.data['rmpct.pct_id'];
        var dvId = treeNode.data['rmpct.dv_id'];
        var dpId = treeNode.data['rmpct.dp_id'];
        var emId = treeNode.data['rmpct.em_id'];
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + rmpctId +" "+dvId+" "+dpId+" "+emId+ "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

/**
 * get current date in ISO format(like '2011-07-20')
 */
function getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}
var abSpAsgnRmCatRmTypeToRm_Controller = View.createController('abSpAsgnRmCatRmTypeToRm_Controller', {
	type:'',
	flag:true,
	date:null,
	/**
	 * rmpct table restriction from console
	 */
	rmpctConsoleRes : '1=1',
	onclickedFlObj:'',
	dwgName : null,
	
	currentEmAssign:[],
	/**
     * event handler after view load
     */
    afterViewLoad: function(){
    	this.abSpAsgnRmstdToRm_rmstdGrid.show(false);
    	this.abSpAsgnDvDpToRm_dvTree.show(false);
    	this.abSpAsgnEmToRm_emSelect.show(false);
    	this.appendSelector();
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("default", "", "<font color='#F04000'>"+getMessage('selectFloor')+"</font>");
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("ondwgload", "", "<font color='#F04000'>"+getMessage('selectType')+"</font>");
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", "onclick", getMessage('selectRm'), true);
        // set event handler for clicking room on the drawing 
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.addEventListener('onload', onLoadHandler);
        refreshLegendGrid.defer(200);
        showOrHideLegend(false);
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.setTitle("<font color='#F04000'>"+getMessage('selectType')+"</font>");
        this.abSpAsgnRmcatRmTypeToRm_rmcatTree.setSingleVisiblePanel(true);
    },
    /**
     * event handler after Initial Data Fetch
     */
    afterInitialDataFetch: function(){
    	this.date = getCurrentDate();
    	var opennerView = View.getOpenerView();
    	//if current view is opended as a pop up with selected floor , then dirrectly filter the tree and show the floor plan
        if(opennerView && opennerView.blId && opennerView.flId){
        	this.abSpAsgnRmcatRmTypeToRm_blTree.addParameter('blIdRes', "bl.bl_id='"+opennerView.blId+"'");
        	this.abSpAsgnRmcatRmTypeToRm_blTree.addParameter('flIdRes', "fl.fl_id='"+opennerView.flId+"'");
        	this.abSpAsgnRmcatRmTypeToRm_blTree.refresh();
        	//KB3039669 - below code is not necessary for v21.1 and will cause error, so remove this line  
        	//this.abSpAsgnRmcatRmTypeToRm_drawingPanel.initialDataFetch();
        	this.expandTreeToFirstNode.defer(3000,this);
        	maxFloor();
        }else{
        	this.abSpAsgnRmcatRmTypeToRm_blTree.refresh();
        }
        setParameters();
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.setTitle("<font color='#F04000'>"+getMessage('selectType')+"</font>");
    },
    /**
     * expand Tree To First Node.
     */
    expandTreeToFirstNode: function(){
    	var treePanel = this.abSpAsgnRmcatRmTypeToRm_blTree;
    	var root= treePanel.treeView.getRoot();
    	var blNode = root.children[0];
    	treePanel.refreshNode(blNode);
    	blNode.expand();
    	var flNode = blNode.children[0];
    	if(flNode){
    		flNode.onLabelClick(flNode);
        	$(flNode.labelElId).command.handle();
    	}
    },
    
    /**
     * event handler after select rm standard
     */
    selectRmStdType: function(){
        this.abSpAsgnRmstdToRm_rmstdGrid.setColorOpacity(this.abSpAsgnRmcatRmTypeToRm_drawingPanel.getFillOpacity());
        
        // Set the default colors to use based on the ones in the grid
        // This is done so that the drawing control uses the same colors
        var rows = this.abSpAsgnRmstdToRm_rmstdGrid.rows;
        var opacity = this.abSpAsgnRmcatRmTypeToRm_drawingPanel.getFillOpacity();
        for (var i = 0; i < rows.length; i++) {
            var val = rows[i]['rmstd.rm_std'];
            var color = '';
            var hpval = rows[i]['rmstd.hpattern_acad'];
            if (hpval.length) 
                color = gAcadColorMgr.getRGBFromPattern(hpval, true);
            else {
                color = gAcadColorMgr.getColorFromValue('rmstd.rm_std', val, true);
                var cellEl = Ext.get(rows[i].row.cells.get('abSpAsgnRmstdToRm_rmstdLegend').dom.firstChild);
                cellEl.setStyle('background-color', color);
                cellEl.setOpacity(opacity);
            }
            gAcadColorMgr.setColor('rmstd.rm_std', val, color);
        }
        
        if (!this.initialized) {
            this.initialized = true;
            this.abSpAsgnRmstdToRm_rmstdGrid.update();
        }
    },
    /**
     * event handler when click show
     */
    abSpAsgnRmcatRmTypeToRm_filterConsole_onShowTree: function(){
    	var console=this.abSpAsgnRmcatRmTypeToRm_filterConsole;
        var filterBlId = console.getFieldValue('rm.bl_id');
        var filterRmCat = console.getFieldValue('rm.rm_cat');
        var filterDvId = console.getFieldValue('rm.dv_id');
        var filterDpId = console.getFieldValue('rm.dp_id');
        var filterRmStd = console.getFieldValue('rm.rm_std');
        var filterEmId = console.getFieldValue('em.em_id');
        var blTreeRes = new Ab.view.Restriction();
        var rmCatTreeRes = new Ab.view.Restriction();
        var emGridRes = new Ab.view.Restriction();
        emGridRes.addClause("em.em_id", filterEmId + '%', "LIKE");
        emGridRes.addClause("em.dv_id", filterDvId + '%', "LIKE");
        emGridRes.addClause("em.dp_id", filterDpId + '%', "LIKE");
        this.abSpAsgnEmToRm_emSelect.refresh(emGridRes);
        var dvRes = " IS NOT NULL";
        var dpRes = " IS NOT NULL";
        this.rmpctConsoleRes="1=1";
        var rmStdTreeRes = new Ab.view.Restriction();
        
        if (filterBlId) {
            blTreeRes.addClause("bl.bl_id", filterBlId, "=");
        }
        
        if (filterRmCat) {
            rmCatTreeRes.addClause("rmcat.rm_cat", filterRmCat, "=");
            this.rmpctConsoleRes += " and rmpct.rm_cat =" + literal(filterRmCat);
        }
        if (filterDvId) {
            dvRes = " = '" + filterDvId + "'";
            this.rmpctConsoleRes += " and rmpct.dv_id =" + literal(filterDvId);
        }
        if (filterDpId) {
            dpRes = " = '" + filterDpId + "'";
            this.rmpctConsoleRes += " and rmpct.dp_id =" + literal(filterDpId);
        }
        if (filterRmStd) {
            rmStdTreeRes.addClause("rmstd.rm_std", filterRmStd, "=");
        }
        setParameters();
        if(this.type!=""){
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.clear();
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.isLoadedDrawing = false;
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.processInstruction("default", '');
        
        this.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.removeRows(0);
        this.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.update();
        this.abSpAsgnDvDpToRm_dpAssignGrid.removeRows(0);
        this.abSpAsgnDvDpToRm_dpAssignGrid.update();
        this.abSpAsgnRmstdToRm_rmstdAssignGrid.removeRows(0);
        this.abSpAsgnRmstdToRm_rmstdAssignGrid.update();
        
        this.abSpAsgnRmcatRmTypeToRm_blTree.refresh(blTreeRes);
        this.abSpAsgnRmcatRmTypeToRm_rmcatTree.refresh(rmCatTreeRes);
        this.abSpAsgnDvDpToRm_dvTree.addParameter('dvRes', dvRes);
        this.abSpAsgnDvDpToRm_dvTree.addParameter('dpRes', dpRes);
        this.abSpAsgnDvDpToRm_dvTree.refresh();
        this.abSpAsgnRmstdToRm_rmstdGrid.refresh(rmStdTreeRes);
        showHideByType();
        }
    },
    /**
     * append Selector
     */
    appendSelector: function(){
    	//set up drondown list
        this.selectedScenario = null;
        var scenarioList_title_td = Ext.get('scenarioList_title_td');
        if (scenarioList_title_td != null) {
            scenarioList_title_td.remove();
        }
        var scenarioList_selector_td = Ext.get('scenarioList_selector_td');
        if (scenarioList_selector_td != null) {
            scenarioList_selector_td.remove();
        }
        
        var titleNode = document.getElementById('abSpAsgnRmcatRmTypeToRm_drawingPanel_title');
        if (titleNode == null) 
            return;
        
        var items=[getMessage('itemDd'),getMessage('itemRs'),getMessage('itemCt'),getMessage('itemEm')];
        var selectValues=["dd","rs","ct","em"];
        var tot = items.length;
        var names = new Array();
        var nameIdMap = new Object();
        for (var i = 0; i < tot; i++) {
            var name = items[i];
            var selectValue=selectValues[i];
            names[names.length] = name;
            nameIdMap[name] = selectValue;
        }
        
        // If there are 0 or 1 records, there is no need to display the combo
        if (names.length < 1) 
            return;
        
        var prompt =getMessage('itemTitle');
        var pn = titleNode.parentNode.parentNode;
        var cell = Ext.DomHelper.append(pn, {
            tag: 'td',
            id: 'scenarioList_title_td'
        });
        var tn = Ext.DomHelper.append(cell, '<p>' + prompt + '</p>', true);
        Ext.DomHelper.applyStyles(tn, "x-btn-text");
        cell = Ext.DomHelper.append(pn, {
            tag: 'td',
            id: 'scenarioList_selector_td'
        });
        var combo = Ext.DomHelper.append(cell, {
            tag: 'select',
            id: 'selector_' + "scenarioList"
        }, true);
        
        names.sort(); // sort the entries
        for (var i = 0; i < names.length; i++) {
            combo.dom.options[i] = new Option(names[i], nameIdMap[names[i]]);
        }
        
        combo.on('change', this.changeScenario, this, {
            delay: 100,
            single: false
        });
        
        this.type = combo.dom.value;
    },
    
    changeScenario: function(e, combo){
    	var selectType=combo.value;
    	this.type=selectType;
    	changeType();
    }
});
/**
 *show or hide panels by attribute type
 */
function showHideByType(){
	//show or hide panels by attribute type
	switch (abSpAsgnRmCatRmTypeToRm_Controller.type){
	   case "ct":
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(false);
	     break;
	   case "rs":
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(false);
	     break;
	   case "dd":
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(false);
	     break;
	   case "em":
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
	     break;
	   default:
		   View.showMessage(getMessage('noAbbrTypeSelected'));
	}
}
var rmTypeId;
var rmCatId;
var ctRecords;
var ddRecords;
var rmStdId;
var dvId;
var dpId;
/**
 * event handler when click tree node of room type level for the tree abSpAsgnRmcatRmTypeToRm_rmcatTree.
 * @param {Object} ob
 */
function onRmTypeTreeClick(ob){
	 //get selected categary and type value 
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnRmcatRmTypeToRm_rmcatTree').lastNodeClicked;
    rmTypeId = currentNode.data['rmtype.rm_type'];
    rmCatId = currentNode.parent.data['rmcat.rm_cat'];
  //reset the assign color.
    var rmTypeRecords = getRmTypeForAttributesColorReseting(rmCatId, rmTypeId);
    resetAssgnColor('rmtype.hpattern_acad', rmTypeRecords, 'rmtype.rm_cat', rmCatId, 'rmtype.rm_type', rmTypeId);
    
    if (drawingPanel.isLoadedDrawing) {
    	//sets the current assignment values
        drawingPanel.setToAssign("rmtype.rm_type", rmTypeId);
        drawingPanel.processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", 'onclick', rmCatId + "-" + rmTypeId);
        setSelectability(abSpAsgnRmCatRmTypeToRm_Controller.onclickedFlObj.restriction);
    }
    else {
        View.showMessage(getMessage('noFloorSelected'));
    }
    
}

function getRmTypeForAttributesColorReseting(roomCategory, roomType) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rmtype.rm_cat", roomCategory, "=");
	restriction.addClause("rmtype.rm_type", roomType, "=");
	var records = View.dataSources.get('ds_ab-sp-asgn-rmcat-rmtype-to-rm_rmtype').getRecords(restriction);
	return records;
}
 
/**
 * event handler when click tree node of floor level for the tree abSpAsgnRmcatRmTypeToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	abSpAsgnRmCatRmTypeToRm_Controller.onclickedFlObj=ob;
	var currentNode = View.panels.get('abSpAsgnRmcatRmTypeToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    abSpAsgnRmCatRmTypeToRm_Controller.dwgName = currentNode.data['fl.dwgname'];
  //load drawing panel by attribute type
	switch (abSpAsgnRmCatRmTypeToRm_Controller.type)
	   {
	   case "ct":
		    var grid = View.panels.get('abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid');
		    flTreeClickHandler(currentNode, drawingPanel, grid);
		    drawingPanel.isLoadedDrawing = true; 
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.setTitle("<font color='#F04000'>"+getMessage('selectType')+"</font>");
		    break;
	   case "rs":
		    var grid = View.panels.get('abSpAsgnRmstdToRm_rmstdAssignGrid');
		    flTreeClickHandler(currentNode, drawingPanel, grid);
		    drawingPanel.isLoadedDrawing = true; 
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.setTitle("<font color='#F04000'>"+getMessage('selectStd')+"</font>");
		    break;
	   case "dd":
		    var grid = View.panels.get('abSpAsgnDvDpToRm_dpAssignGrid');
		    flTreeClickHandler(currentNode, drawingPanel, grid);
		    
		    //set drawing select ability
		    setSelectability(ob.restriction,'Assign_Department');
		    drawingPanel.isLoadedDrawing = true; 
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.setTitle("<font color='#F04000'>"+getMessage('selectDp')+"</font>");
		    break;
	   case "em":
		    var blId = currentNode.parent.data['bl.bl_id'];
		    var flId = currentNode.data['fl.fl_id'];
		    var dwgName = currentNode.data['fl.dwgname'];
		    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
		    drawingPanel.addDrawing(dcl);
		    
		    //set drawing select ability
		    setSelectability(ob.restriction,'Assign_Employee');
		    drawingPanel.isLoadedDrawing = true;
		    drawingPanel.clearAssignCache(true);
		    emAssigns = []
		    View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false); 
		    View.panels.get("abSpAsgnEmToRm_legendGrid").show(true);
		    resizeLegend.defer(200);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.setTitle("<font color='#F04000'>"+getMessage('selectEm')+"</font>");
		    break;
	   default:
		   View.showMessage(getMessage('noAbbrTypeSelected'));
		   
	}
	
}
/**
 * resize Legend
 */
function resizeLegend(){
	var legend=abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_legendGrid;
    for (var i = legend.gridRows.length; i > 5; i--) {
        var row = legend.gridRows.items[i-1];
        legend.removeRow(row.getIndex());
    }
    legend.reloadGrid();
}
/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
	//set value to room
	//change drawing panel 
	//show or hide panel by attribute type
	switch (abSpAsgnRmCatRmTypeToRm_Controller.type)
	   {
	   case "ct":
		    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
		    drawingRoomClickHandler(pk, selected, grid, 'rm.rm_cat', rmCatId, 'rm.rm_type', rmTypeId);
		    View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel').processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", 'onclick', rmCatId + "-" + rmTypeId);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
		    break;
	   case "rs":
		    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdAssignGrid");
		    drawingRoomClickHandler(pk, selected, grid, 'rm.rm_std', rmStdId)
		    View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel').processInstruction("abSpAsgnRmstdToRm_rmstdGrid", 'onclick', rmStdId);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
		    break;
	   case "dd":
		    var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
		    drawingRoomClickHandler(pk, selected, grid, 'rm.dv_id', dvId, 'rm.dp_id', dpId);
		    View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel').processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
		    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emAssigned.show(false);
		    break;
	   default:
		   View.showMessage(getMessage('noAbbrTypeSelected'));
	}
}

/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    
    switch (abSpAsgnRmCatRmTypeToRm_Controller.type){
	   case "ct":
		    grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
		    break;
	   case "rs":
		    grid = View.panels.get("abSpAsgnRmstdToRm_rmstdAssignGrid");
		    break;
	   case "dd":
		    grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
		    break;
	   default:
		   View.showMessage(getMessage('noAbbrTypeSelected'));
	}
  //reset assignment info
    resetAssignment(drawingPanel, grid);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
	
	//save assignment info
	switch (abSpAsgnRmCatRmTypeToRm_Controller.type)
	   {
	   case "ct":
		   var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
		    checkFutureRmpct('ct',grid);
		    
		    break;
		    
	   case "rs":
		    var dsChanges = View.dataSources.get("ds_ab-sp-assgn-rmstd-to-rm_drawing_rmHighlight");
		    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
		    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdAssignGrid");
	    	saveChange(drawingPanel, grid, dsChanges, ['rm.rm_std'], true);
			drawingPanel.processInstruction("ondwgload", '');
	    
		    break;
	   case "dd":
		   var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
		    checkFutureRmpct('dd',grid);
		    
		    break;
	   default:
		   View.showMessage(getMessage('noAbbrTypeSelected'));
	}
}

/**
 * Check future rooms,kb:3037265 In Define Rooms view and Assign Room Attributes and Occupancy view when select Attritubtes Type is "Categories and Types" or "Divisions and Departments"
 *IF EXISTS (SELECT 1 FROM rmpct where bl_id=<bl_id> and fl_id=<fl_id> and rm_id = <rm_id> and date_start><current date> and primary_rm=1)
 *THEN alert message : �There is a pending request that involves this room. If you continue, please edit that pending request. Do you wish to continue?� <Yes/No>
 * @param type
 * @param grid
 */	 
function checkFutureRmpct(type,grid){
	 for (i = 0; i < grid.gridRows.length; i++) {
		 
		 
        var row = grid.gridRows.items[i];
        var buildingId = row.getFieldValue("rm.bl_id");
        var floorId = row.getFieldValue("rm.fl_id");
        var roomId = row.getFieldValue("rm.rm_id");
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rmpct.bl_id", buildingId, '=');
        restriction.addClause("rmpct.fl_id", floorId, '=');
        restriction.addClause("rmpct.rm_id", roomId, '=');
        
        var ds = View.dataSources.get('checkFutureRmpctDS');
        
    	var futureRmpctRecords = ds.getRecords(restriction);
    	
		if(futureRmpctRecords.length>0){
			
			var message = getMessage('existFutureRmpct');
		     View.confirm(message, function(button){
				         if (button == 'yes') {
				        	 	saveChangeByType(type,grid);
					            }
			        });
		        
    	}else{
    		saveChangeByType(type,grid);
    	}
	 }
	 
}

/**
 * Save changes by categories or devision and department
 * @param type
 * @param grid
 */
function saveChangeByType(type,grid){
	
	if(type=='ct'){
		
		var dsChanges = View.dataSources.get("ds_ab-sp-asgn-rmcat-rmtype-to-rm_drawing_rmLabel");
	    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
	    
	    saveChange(drawingPanel, grid, dsChanges, ['rm.rm_cat', 'rm.rm_type'], true);
   	
	    drawingPanel.processInstruction("ondwgload", '');
   	 
	}else if(type=='dd'){
		
		var dsChanges = View.dataSources.get("ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmLabel");
	    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
	   
		saveChange(drawingPanel, grid, dsChanges, ['rm.dv_id', 'rm.dp_id'], false);
		
	    drawingPanel.processInstruction("ondwgload", '');
	}
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
	//add legend to show highlight pattern in the tree node
	switch (abSpAsgnRmCatRmTypeToRm_Controller.type)
	   {
	   case "ct":
		   addLegendToTree('abSpAsgnRmcatRmTypeToRm_rmcatTree', treeNode, 1, 'rmtype', 'rmtype.rm_type');
		   break;
	   case "dd":
		   addLegendToTree('abSpAsgnDvDpToRm_dvTree', treeNode, 1, 'dp', 'dp.dp_id');
		   break;
	}
    
}

/**
 * add legend to show highlight pattern in the tree node
 * @param {Object} treeNode
 * @param {int}    level
 * @param {String} table
 * @param {String} field
 */
function addLegendToTree(treeControlId, treeNode, level, table, field){
    if (treeNode.treeControl.id != treeControlId) {
        return;
    }
    
    if (treeNode.level.levelIndex == level) {
        var label = "";
        var hpFieldName = table + '.hpattern_acad';        
        var val = treeNode.data[field];
        var hlVal = treeNode.data[hpFieldName];
        var color = null;
        var des="";
        if(table=='dp'){
			des=treeNode.data['dp.name'];
		}
		else if(table=='rmtype'){
			des=treeNode.data['rmtype.description'];
		}
		var hpattern = new Ab.data.HighlightPattern(hlVal);
		if (hpattern.isHatched()) {
			// HATCHED pattern
			var primaryKeyValues = [];
			if(table=='dp'){
				primaryKeyValues[0] = treeNode.parent.data['dv.dv_id'];
			}
			else if(table=='rmtype'){
				primaryKeyValues[0] = treeNode.parent.data['rmcat.rm_cat'];
			}
			else{
				primaryKeyValues[0] = '';
			}
			primaryKeyValues[1] = val;
			var bitmapName = hpattern.getLegendBitmapName(table, primaryKeyValues);
			if (bitmapName) {
				label += '<span>'+ "<img src='" + View.project.projectGraphicsFolder + '/' + bitmapName + ".png'" + " width='60'  height='15'/>" + '</span>';
			}
		}
        else {
			if (hlVal.length && hlVal.substr(0,2) == '0x') {
				color =  hlVal.substr(2);
			}
			else {
				color = gAcadColorMgr.getRGBFromPatternForGrid(hlVal, true);
				if (color == "-1") {
					  color = gAcadColorMgr.getUnassignedColor(true);
				}
			}
			if (color) {
				label += '<span style="display:inline-block;width:60px;height:15px;background-color:' + "#"+ color + '"></span>';
			}
        }
		label += "<span class='" + treeNode.level.cssPkClassName + "'>" + val + "</span> ";
        treeNode.setUpLabel(label+des);
    }
}
/**
 * change dataSource and info of draw panel by selected type
 */
function changeType(){
	var draw=abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel;
	//change drawing panel datasource by attribute type
	switch (abSpAsgnRmCatRmTypeToRm_Controller.type)
	   {
	   case "ct":
		   showOrHideLegend(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(false); 
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(false); 
           abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.setSingleVisiblePanel(true);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(true);
		   draw.currentHighlightDS="ds_ab-sp-asgn-rmcat-rmtype-to-rm_drawing_rmHighlight";
		   draw.appendInstruction("default", "", "<font color='#F04000'>"+getMessage('selectFloor')+"</font>");
		   draw.appendInstruction("ondwgload", "", "<font color='#F04000'>"+getMessage('selectType')+"</font>");
		   draw.appendInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", "onclick", getMessage('selectRm'), true);
		   draw.setTitle("<font color='#F04000'>"+getMessage('selectType')+"</font>");
		   draw.addEventListener('onclick', onDrawingRoomClicked);
		   draw.refresh();
		   break;
	   case "rs":
		   showOrHideLegend(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(false); 
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(false); 
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(true);
		   draw.currentHighlightDS="ds_ab-sp-assgn-rmstd-to-rm_drawing_rmHighlight";
		   draw.appendInstruction("default", "", "<font color='#F04000'>"+getMessage('selectFloor')+"</font>");
		   draw.appendInstruction("ondwgload", "", "<font color='#F04000'>"+getMessage('selectStd')+"</font>");
		   draw.appendInstruction("abSpAsgnRmstdToRm_rmstdGrid", "onclick", getMessage('selectRm'), true);
		   draw.setTitle("<font color='#F04000'>"+getMessage('selectStd')+"</font>");
		   draw.addEventListener('onclick', onDrawingRoomClicked);
		   draw.refresh();
		   abSpAsgnRmCatRmTypeToRm_Controller.selectRmStdType();
		   break;
	   case "dd":
		   showOrHideLegend(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(false); 
           abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.setSingleVisiblePanel(true);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(true);
		   draw.currentHighlightDS="ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmHighlight";
		   draw.appendInstruction("default", "", "<font color='#F04000'>"+getMessage('selectFloor')+"</font>");
		   draw.appendInstruction("ondwgload", "","<font color='#F04000'>"+getMessage('selectDp')+"</font>");
		   draw.appendInstruction("abSpAsgnDvDpToRm_dpTree", "onclick", getMessage('selectRm'), true);// set event handler for clicking room on the drawing 
		   draw.setTitle("<font color='#F04000'>"+getMessage('selectDp')+"</font>");
		   draw.addEventListener('onclick', onDrawingRoomClicked);
		   draw.refresh();
		   
		   //set drawing select ability
		   setSelectability(abSpAsgnRmCatRmTypeToRm_Controller.onclickedFlObj.restriction,'Assign_Department');
		   
		   break;
	   case "em":
		   showOrHideLegend(true);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmcatTree.show(false);
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdGrid.show(false); 
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dvTree.show(false); 
		   abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.show(true);
		   draw.setTitle("<font color='#F04000'>"+getMessage('selectEm')+"</font>");
		   draw.currentHighlightDS="ds_ab-sp-asgn-em-to-rm_drawing_availRm";
		   draw.legendPanel="abSpAsgnEmToRm_legendGrid";
		// Specify instructions for the Drawing Control
		   draw.appendInstruction("default", "", "<font color='#F04000'>"+getMessage('selectFloor')+"</font>");
		   draw.appendInstruction("ondwgload", "", "<font color='#F04000'>"+getMessage('selectEm')+"</font>");
		   draw.appendInstruction("abSpAsgnEmToRm_emSelect", "onclick", getMessage('emSelectRm'));
		   draw.appendInstruction("abSpAsgnRmcatRmTypeToRm_drawingPanel", "onclick", "<font color='#F04000'>"+getMessage('selectAnotherEm')+"</font>");
		   draw.addEventListener('onclick', onDwgPanelClicked);
		  
		    //set drawing legend panel, ruleset will show as legend row
	        var ruleset = new DwgHighlightRuleSet();
	        //Non-Occupiable
	        ruleset.appendRule("rm.legend_level", "1", "ADADAD", "==");
	        //Vacant
	        ruleset.appendRule("rm.legend_level", "2", "33FF00", "==");
	        //Available
	        ruleset.appendRule("rm.legend_level", "3", "0000FF", "==");
	        //At Capacity
	        //KB3037147 - change at-capacity to E7CB0A to avoid confusing the room selection color 
	        ruleset.appendRule("rm.legend_level", "4", "E7CB0A", "==");
	        //Exceeds Capacity
	        ruleset.appendRule("rm.legend_level", "5", "FF0000", "==");
	        draw.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm", ruleset);
	        draw.refresh();
	        
	        //set drawing select ability
	        setSelectability(abSpAsgnRmCatRmTypeToRm_Controller.onclickedFlObj.restriction,'Assign_Employee');
	        
	        if(abSpAsgnRmCatRmTypeToRm_Controller.flag){
	        abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_legendGrid.afterCreateCellContent = setLegendLabel;
	        }
	        draw.refreshLegendPanel();
	        setTimeout('',50);
	        var legend=abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_legendGrid;
	        for (var i = legend.gridRows.length; i > 5; i--) {
	            var row = legend.gridRows.items[i-1];
	            legend.removeRow(row.getIndex());
	        }
	        legend.reloadGrid();
	        abSpAsgnRmCatRmTypeToRm_Controller.flag=false;
	        abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnEmToRm_emSelect.addEventListener('onMultipleSelectionChange', onEmSelectionChange);
		   break;
	   default:
		   View.showMessage(getMessage('noAbbrTypeSelected'));
	}

	}
/**
 * event handler when click tree node of dp level for the tree abSpAsgnDvDpToRm_dvTree.
 * @param {Object} ob
 */
function onDpTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_dvTree').lastNodeClicked;
    dpId = currentNode.data['dp.dp_id'];
    dvId = currentNode.parent.data['dv.dv_id'];
    //reset the assign color
    var dpRecords = getDpRecordsForAttributeColorReseting(dvId, dpId);
    resetAssgnColor('dp.hpattern_acad', dpRecords, 'dp.dv_id', dvId, 'dp.dp_id', dpId);
    if (drawingPanel.isLoadedDrawing) {
    	//sets the current assignment values
        drawingPanel.setToAssign("dp.dp_id", dpId);
        drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
    }
    else {
        View.showMessage(getMessage('noFloorSelected'));
    }
}

function getDpRecordsForAttributeColorReseting(divisionId, departmentId) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("dp.dv_id", divisionId, "=");
	restriction.addClause("dp.dp_id", departmentId, "=");
	var records = View.dataSources.get('ds_ab-sp-asgn-dv-dp-to-rm_dp').getRecords(restriction);
	return records;
}

/**
 * event handler when click row of the grid abSpAsgnRmstdToRm_rmstdGrid.
 * @param {Object} row
 */
function onRmStdSelected(row){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    rmStdId = row['rmstd.rm_std'];
    if (drawingPanel.isLoadedDrawing) {
    	//sets the current assignment values
        drawingPanel.setToAssign("rmstd.rm_std", rmStdId);
        drawingPanel.processInstruction(row.grid.id, 'onclick', rmStdId);
        drawingPanel.processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", 'onclick', rmStdId);
    }
    else {
        View.showMessage(getMessage('noFloorSelected'));
    }
}
/**
 * refresh legend grid.
 */
function refreshLegendGrid(){
    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdGrid");
	grid.refresh();
	grid.show(false);
}
/**
 * show Or Hide Legend.
 */
function showOrHideLegend(flag){
	var layout = View.getLayoutManager('nested_north');
	if(flag){
		layout.expandRegion('east');
	}else{
		layout.collapseRegion('east');
	}
}

var emAssigns = [];

/**
 * event handler when click row of grid 'abSpAsgnEmToRm_emSelect'.
 */
function onEmSelectionChange(rowbbb){
    emAssigns = [];
    var cp = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    if (cp.isLoadedDrawing) {
        var grid = View.panels.get("abSpAsgnEmToRm_emSelect");
        var rows = grid.getSelectedRows();
        if (rows.length < 1) {
            cp.clearAssignCache(true);
            cp.processInstruction("ondwgload", "");
            return;
        }
        
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            cp.processInstruction('abSpAsgnEmToRm_emSelect', 'onclick');
            
            var emAssign = new Ab.data.Record();
            emAssign.setValue("em.em_id", row['em.em_id']);
            emAssign.setValue("em.dv_id", row['em.dv_id']);
            emAssign.setValue("em.dp_id", row['em.dp_id']);
            emAssign.setValue("em.bl_id_current", row['em.bl_id']);
            emAssign.setValue("em.fl_id_current", row['em.fl_id']);
            emAssign.setValue("em.rm_id_current", row['em.rm_id']);
            emAssigns.push(emAssign);
        }
        
        cp.setToAssign("em.em_id", emAssigns[0].getValue('em.em_id'));
    }
}



/**
 * event handler when click room of the drawing panel 'abSpAsgnRmcatRmTypeToRm_drawingPanel'.
 * @param {Object} ob
 */
function onDwgPanelClicked(pk, selected, color){
	abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.show(false);
    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmstdToRm_rmstdAssignGrid.show(false);
    abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
    if (checkCount(pk)) {
        View.confirm(getMessage('countOver'), function(button){
            if (button == 'yes') {
                addAssignmentRows(pk);
                View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
            }
        });
    }
    else {
        addAssignmentRows(pk);
        View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
    }
    
    View.getControl('', 'abSpAsgnRmcatRmTypeToRm_drawingPanel').processInstruction('abSpAsgnRmcatRmTypeToRm_drawingPanel', 'onclick');
}

/**
 * check is the room is full.
 * @param {Object} pk
 * @return {boolean} isFull
 */
function checkCount(pk){
    var isFull = false;
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    
    var availableCount = getRoomCountVal(blId, flId, rmId, 'rm.cap_em') - getRoomCountVal(blId, flId, rmId, 'rm.count_em');
    var newAssignedCount = 0;
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    grid.show(true);
    var rows = grid.rows;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row['em.bl_id'] == blId && row['em.fl_id'] == flId && row['em.rm_id'] == rmId && !isSelectedEm(row['em.em_id'])) {
            newAssignedCount++;
        }
    }
    if ((availableCount - newAssignedCount - emAssigns.length) < 0) {
        isFull = true;
    }
    return isFull;
}

/**
 * check is selected em.
 */
function isSelectedEm(emId){
    var isSelected = false;
    for (var i = 0; i < emAssigns.length; i++) {
        if (emId == emAssigns[i].getValue('em.em_id')) {
            isSelected = true;
            break;
        }
    }
    return isSelected;
}

/**
 * submit Changes.
 */
function submitChanges(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    if (grid.rows.length < 1) {
        View.showMessage(getMessage('noEmSelected'));
        return;
    }
    
    detectIfExistsFutureInDefineEm();
    
}

/**
 * for 'move'
 * check if Another request exists involving the same employee for a future assignment. 
 * @param em_id
 * 
 */
function detectIfExistsFutureInDefineEm(){
	
    
    var em_id = abSpAsgnRmCatRmTypeToRm_Controller.currentEmAssign.getValue('em.em_id');
    
    var bl_id = abSpAsgnRmCatRmTypeToRm_Controller.currentEmAssign.getValue('em.bl_id');
    var fl_id = abSpAsgnRmCatRmTypeToRm_Controller.currentEmAssign.getValue('em.fl_id');
    var rm_id = abSpAsgnRmCatRmTypeToRm_Controller.currentEmAssign.getValue('em.rm_id');
    
	var dsEm = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_grid_emAssign");
	
	var emRecords=dsEm.getRecords("em.em_id=${sql.literal('"+em_id+"')}");
	var emRecord=emRecords[0];
	
	//3037265 ,Define Employee: Alert message is missing when change employee's location when there is future move request
	var oldBl_id = emRecord.getValue("em.bl_id");
	var oldFl_id = emRecord.getValue("em.fl_id");
	var oldRm_id = emRecord.getValue("em.rm_id");
	
	if(bl_id!=oldBl_id||fl_id!=oldFl_id||rm_id!=oldRm_id){
		try {
			
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-detectIfExistsFutureInDefineEm', 
					em_id,oldBl_id,oldFl_id,oldRm_id);
			if(result!=null&&result.message!=""){
				
			 var message = getMessage("existFuture");
			        View.confirm(message, function(button){
			            if (button == 'yes') {
			            	 View.openProgressBar(getMessage('saving'));
			            	 doSubmitChanges.defer(500);
			            }
			        });
			        
				
			}else{
				View.openProgressBar(getMessage('saving'));
			    doSubmitChanges.defer(500);
			}
		}catch(e){
			Workflow.handleError(e); 
		}
		
	}else{
		
		 View.openProgressBar(getMessage('saving'));
	     doSubmitChanges.defer(500);
	}
}

/**
 * save the assignment.
 */
function doSubmitChanges(){
    var dsEmp = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_grid_em");
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    
    try {
    
        for (var i = 0; i < grid.gridRows.length; i++) {
            var row = grid.gridRows.items[i];
            
            var emId = row.getFieldValue("em.em_id");
            var buildingId = row.getFieldValue("em.bl_id");
            var floorId = row.getFieldValue("em.fl_id");
            var roomId = row.getFieldValue("em.rm_id");
            var buildingIdCurrent = row.getFieldValue("em.bl_id_current");
            var floorIdCurrent = row.getFieldValue("em.fl_id_current");
            var roomIdCurrent = row.getFieldValue("em.rm_id_current");
            var dvId = row.getFieldValue("em.dv_id");
            var dpId = row.getFieldValue("em.dp_id");
            
            // First set the new room for the employee
            var rec = new Ab.data.Record();
            rec.isNew = false;
            rec.setValue("em.em_id", emId);
            rec.setValue("em.bl_id", buildingId);
            rec.setValue("em.fl_id", floorId);
            rec.setValue("em.rm_id", roomId);
            rec.setValue("em.dv_id", dvId);
            rec.setValue("em.dp_id", dpId);
            
            rec.oldValues = new Object();
            rec.oldValues["em.em_id"] = emId;
            
            //var rec = grid.gridRows.items[i].getRecord();
            //var rec = grid.rowToRecord(row);
            dsEmp.saveRecord(rec);
            
            //comment out below code, because rm.count_em is calculate will update area total wfr. 
            // Update the rm.count_em value
            //setRoomEmpCnt(buildingId, floorId, roomId, 1);
            //if (buildingIdCurrent && floorIdCurrent && roomIdCurrent) {
            //    setRoomEmpCnt(buildingIdCurrent, floorIdCurrent, roomIdCurrent, -1);
            //}
        }
        
        grid.removeRows(0);
        grid.update();
        View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
        var cp = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
        cp.applyDS('labels');
        cp.applyDS('highlight');
        cp.clearAssignCache(true);
        View.closeProgressBar();
    } 
    catch (e) {
        View.closeProgressBar();
        Workflow.handleError(e);
    }
}

/**
 * change the room employee count in database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {int} cnt
 */
function setRoomEmpCnt(buildingId, floorId, roomId, cnt){
    var rec = new Ab.data.Record();
    
    var cntOld = getRoomCountVal(buildingId, floorId, roomId, 'rm.count_em');
    cnt = cntOld + cnt;
    if (cnt < 0) 
        cnt = 0;
    
    rec.isNew = false;
    rec.setValue("rm.bl_id", buildingId);
    rec.setValue("rm.fl_id", floorId);
    rec.setValue("rm.rm_id", roomId);
    rec.setValue("rm.count_em", cnt);
    
    rec.oldValues = new Object();
    rec.oldValues["rm.bl_id"] = buildingId;
    rec.oldValues["rm.fl_id"] = floorId;
    rec.oldValues["rm.rm_id"] = roomId;
    rec.oldValues["rm.count_em"] = cntOld;
    try {
        View.dataSources.get("ds_ab-sp-asgn-em-to-rm_rmCnt").saveRecord(rec);
    } 
    catch (e) {
        View.showException(e);
    }
}

/**
 * get the room employee count or employee capacity from database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName rm.count_em or rm.cap_em
 * @return {int} cnt
 */
function getRoomCountVal(buildingId, floorId, roomId, fieldName){
    var cnt = 0;
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        var recs = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_rmCnt").getRecords(restriction);
        if (recs != null) 
            cnt = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showException(e);
    }
    
    return parseInt(cnt, 10);
}


/**
 * remove selected  employee assignment from the grid 'abSpAsgnEmToRm_emAssigned'.
 */
function removeEmpFromList(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var row = grid.rows[grid.selectedRowIndex];
    var blId = row['em.bl_id'];
    var flId = row['em.fl_id'];
    var rmId = row['em.rm_id'];
    
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    drawingPanel.unassign('em.em_id', row['em.em_id']);
    grid.removeGridRow(row.row.getIndex());
    grid.update();
    
    //KB3035292 - remove employee selection in the drawing
    removeEmpSelectionFromDrawing(blId,flId,rmId);
}

/**
 * remove selected  employee assignment from the drwing selection.
 */
function removeEmpSelectionFromDrawing(blId, flId, rmId){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    
    var isKeepSelection = false;
    var rows = grid.rows;
    for(var i=0;i<rows.length;i++){
    	if(rows[i]['em.bl_id']==blId && rows[i]['em.fl_id']==flId && rows[i]['em.rm_id']==rmId){
    		isKeepSelection = true;
    		break;
    	}
    }
    
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, abSpAsgnRmCatRmTypeToRm_Controller.dwgName);
    var opts = new DwgOpts();
    opts.mode = isKeepSelection?'selected':'unselected';
	drawingPanel.findAsset(dcl,opts,false,null,isKeepSelection);
}

/**
 * unassign the selected employee.
 */
function unAssign(){
    var grid = View.panels.get("abSpAsgnEmToRm_emSelect");
    var rows = grid.getSelectedRows();
    if (rows.length < 1) {
        View.showMessage(getMessage('noEmSelected'));
        return;
    }
    
    var message = getMessage('emConfirmMessage');
    
    View.confirm(message, function(button){
        if (button == 'yes') {
            try {
                View.openProgressBar(getMessage('saving'));
                completeEmpUnassign.defer(500, this, [rows]);
            } 
            catch (e) {
                View.closeProgressBar();
                View.showMessage('error', '', e.message, e.data);
            }
        }
    });
}

/**
 * clear location info of the selected employee and changed the rm.count_em.
 * @param {Object} row
 */
function completeEmpUnassign(rows){
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!row['em.rm_id']) 
            continue;
        
        var rec = row.row.getRecord(['em.em_id', 'em.bl_id', 'em.fl_id', 'em.rm_id']);
        rec.setValue('em.bl_id', '');
        rec.setValue('em.fl_id', '');
        rec.setValue('em.rm_id', '');
        
        View.dataSources.get("ds_ab-sp-asgn-em-to-rm_grid_em").saveRecord(rec);
        
        var buildingId = row['em.bl_id'];
        var floorId = row['em.fl_id'];
        var roomId = row['em.rm_id'];
        //comment out below code, because rm.count_em is calculate will update area total wfr. 
        //setRoomEmpCnt(buildingId, floorId, roomId, -1);
    }
    
    View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
    clearChanges();
    View.closeProgressBar();
}

/**
 * clear all employee assignments and clear the highlight.
 */
function clearChanges(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var cp = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    if (cp.isLoadedDrawing) {
        cp.clearAssignCache(true);
        cp.applyDS('labels');
        cp.applyDS('highlight');
        cp.processInstruction("ondwgload", "");
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
        contentElement.nodeValue = text;
    }
}

/**
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(restriction,fromwhich){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel')
    var rmRecords = View.dataSources.get('ds_ab-sp-rm_occupiable').getRecords(restriction);
    
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var occupiable = record.getValue('rmcat.occupiable');
        var supercat = record.getValue('rmcat.supercat');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        
        //kb:3030349,by comments (JIANBING 2012-08-09 11:16)
		//2. In view ab-sp-asgn-rm-attributes.axvw, 
		//2.1 I am able to assign dv-dp to both service area and vertical penetrations. 
		// User should be able to assign dv-dp to service area, user should not be able to assign dv-dp to vertical penetration
		// 2.2  I am able to assign employee to both service area and vertical penetrations.
		//  User should not be able to assign employee to non-occupiable area.
        
        if (supercat == 'VERT'&&fromwhich=='Assign_Department') {
            drawingPanel.setSelectability.defer(300, this, [opts_selectable, false]);
        }else if(occupiable == '0'&&fromwhich=='Assign_Employee'){
        	drawingPanel.setSelectability.defer(300, this, [opts_selectable, false]);
        }
        else{
        	drawingPanel.setSelectability.defer(300, this, [opts_selectable, true]);
        }
        
    }
}

/**
 * add an assignment row.
 * @param {Array} restriction
 */
function addAssignmentRows(pk){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    
    for (var i = 0; i < emAssigns.length; i++) {
        var emAssign = emAssigns[i];
        var bFound = false;
        for (var j = 0; j < grid.rows.length && !bFound; j++) {
            var row = grid.rows[j];
            if (row["em.em_id"] == emAssign.getValue('em.em_id')) {
                grid.removeGridRow(j);
                bFound = true;
            }
        }
        
        emAssign.setValue("em.bl_id", pk[0]);
        emAssign.setValue("em.fl_id", pk[1]);
        emAssign.setValue("em.rm_id", pk[2]);
        grid.addGridRow(emAssign);
    }
    
    abSpAsgnRmCatRmTypeToRm_Controller.currentEmAssign=emAssign;
    
    View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel').processInstruction('abSpAsgnRmcatRmTypeToRm_drawingPanel', 'onclick');
    grid.sortEnabled = false;
    grid.update();
}
/**
 * set the draw panel to max size
 */
function maxFloor(){
	var layout=View.getLayoutManager('nested_north');
	layout.collapseRegion('east');
	layout=View.getLayoutManager('main');
	layout.collapseRegion('north');
	layout=View.getLayoutManager('nested_west');
	layout.collapseRegion('north');
	abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.actions.get('max').show(false);
	abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.actions.get('normal').show(true);
	View.getView('parent').defaultLayoutManager.collapseRegion('west');
	if(abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.isLoadedDrawing){
		resizeDrawingPanel.defer(100);
	}
}
/**
 * set the draw panel to normal size
 */
function normalFloor(){
	var layout=View.getLayoutManager('nested_north');
	if(abSpAsgnRmCatRmTypeToRm_Controller.type=="em"){
	layout.expandRegion('east');
	}
	layout=View.getLayoutManager('main');
	layout.expandRegion('north');
	layout=View.getLayoutManager('nested_west');
	layout.expandRegion('north');
	abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.actions.get('max').show(true);
	abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.actions.get('normal').show(false);
	View.getView('parent').defaultLayoutManager.expandRegion('west');
	
	if(abSpAsgnRmCatRmTypeToRm_Controller.abSpAsgnRmcatRmTypeToRm_drawingPanel.isLoadedDrawing){
		resizeDrawingPanel.defer(100);
	}
}

/**
 * resize Drawing Panel
 */
function resizeDrawingPanel(){
	FABridge.abDrawing.root().autoScale(false);
}
/**
 * onload event handler of the drawing panel
 */
function onLoadHandler() {
	// Construct the right click menu items
	var item0 = {
		title : getMessage('editRoom'),
		handler : "editRoom"
	};
	var item1 = {
		title : getMessage('shareRoom'),
		handler : "shareRoom"
	};
	var items = [item0, item1];

	View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel').setRightClickMenu(items);
}

/**
 * edit room menu event handler of the drawing right click menu
 */
function editRoom(ob) {
	if(ob.length > 0){
		//KB3037857 - set refresh restriction for pop up define view to parent view to avoid load error when user group is 'REV' 
		View.editRoomRestriction = createRestrictionFromClickObject(ob);
		View.openDialog('ab-sp-def-loc-rm.axvw', createRestrictionFromClickObject(ob), true, {
	        width: 1000,
	        height: 530
	    });
	} 
}

/**
 * share room menu event handler of the drawing right click menu
 */
function shareRoom(ob) {
	if(ob.length > 0){
		View.dateINConsole = abSpAsgnRmCatRmTypeToRm_Controller.date;
		View.openDialog('ab-sp-alloc-pct.axvw', createRestrictionFromClickObject(ob), true, {
	        width: 1000,
	        height: 530
	    });
	} 
}

/**
 * create restriction from the click event object
 */
function createRestrictionFromClickObject(ob){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id", ob[0].value, "=", true);
	restriction.addClause("rm.fl_id", ob[1].value, "=", true);
	restriction.addClause("rm.rm_id", ob[2].value, "=", true);
	return restriction;
	
}
/**
 * set datasource parameters
 */
function setParameters() {
	var list = ['ds_ab-sp-asgn-rmcat-rmtype-to-rm_drawing_rmHighlight', 
	            'ds_ab-sp-assgn-rmstd-to-rm_drawing_rmHighlight', 
	            'ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmHighlight', 
	            'ds_ab-sp-asgn-em-to-rm_drawing_availRm', 
	            'abSpShareDSForHlRmByDpPerFl_rmLabelDS', 
	            'abSpShareDSForHlRmpctForCatType_rmLabelCatDS', 
	            'abSpShareDSForHlRmpctForCatType_rmLabelCatAndTypeDS', 
	            'rmLabelByDV', 
	            'rmLabelByEm'];
	for ( var i = 0; i < list.length; i++) {
		var control = View.dataSources.get(list[i]);
		if (!control) {
			control = View.panels.get(list[i]);
		}
		control.addParameter('rmpctConsoleRes', abSpAsgnRmCatRmTypeToRm_Controller.rmpctConsoleRes);
		control.addParameter('date', abSpAsgnRmCatRmTypeToRm_Controller.date);
	}

}
/**
 * add sigle quot to given value
 */
function literal(value) {
	return "'" + value + "'"
}
/**
 * get current date in ISO format(like '07/20/2011')
 */
function getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}
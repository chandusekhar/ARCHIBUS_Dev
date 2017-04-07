/**
 * @author Lei
 */

var abSpVwRmpctExceptionsController2 = View.createController('abSpVwRmpctExceptionsController2', {
	filterBlId:'',
	filterFlId:'',
	optionIndex:0,
	sqlParam:'',
	/**
	 * After data fetch
	 */
	afterInitialDataFetch: function(){
		$('abSpVwRmpctExceptionsConsole_field_gen1_labelCell').style.display='none';
		$('allocatedType').style.display='none';
		getExceptionsList();
		this.abSpVwRmpctExceptionsDrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
    },
    abSpVwRmpctExceptionsConsole_afterRefresh : function(){
    	this.abSpVwRmpctExceptionsConsole.clear();
    },
    /**
     * Show tree by console clauses
     */
    abSpVwRmpctExceptionsConsole_onShow: function(){
    	showTreeByExceptionType();
    	
        this.filterBlId = this.abSpVwRmpctExceptionsConsole.getFieldValue('rm.bl_id');
        this.filterFlId = this.abSpVwRmpctExceptionsConsole.getFieldValue('rm.fl_id');
        
        refreshTree();
        //setPanelTitle('abSpVwRmpctExceptionsDrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

/**
 * Refresh tree and clear drawing panel
 */
function refreshTree(){
	var c=abSpVwRmpctExceptionsController2;
	var treePanel=c.abSpVwRmpctExceptionsTree;
    
    if (c.filterBlId) {
    	treePanel.addParameter('blId', " = " + "'" + c.filterBlId + "'");
    }
    else {
    	treePanel.addParameter('blId', "IS NOT NULL");
    }
    
    if (c.filterFlId) {
    	treePanel.addParameter('flId', "= " + "'" + c.filterFlId + "'  ");
    }
    else {
    	treePanel.addParameter('flId', "IS NOT NULL");
    }
    if (c.sqlParam) {
    	treePanel.addParameter('sqlParam', c.sqlParam);
    }
    
    treePanel.refresh();
    
    c.abSpVwRmpctExceptionsDrawingPanel.clear();
    c.abSpVwRmpctExceptionsDrawingPanel.lastLoadedBldgFloor = null;
    c.abSpVwRmpctExceptionsTab2RmDetail.clear();
}



/**
 * Show Exceptions By Exception Type
 */
function showTreeByExceptionType(fromWhere){
	var c=abSpVwRmpctExceptionsController2;
	c.filterBlId = c.abSpVwRmpctExceptionsConsole.getFieldValue('rm.bl_id');
	c.filterFlId = c.abSpVwRmpctExceptionsConsole.getFieldValue('rm.fl_id');
	
	var itemSelect = $('exceptions');
	var exceptionsValue=itemSelect.value;
	
	var itemSelect2 = $('allocatedType');
	var value2=itemSelect2.value;
	
	c.optionIndex=getOptionIndex(itemSelect,exceptionsValue);
	
		//refreshReportByException(c,optionIndex,bl_id,fl_id);

	if(c.optionIndex==8){
		if(fromWhere==0){
			$('abSpVwRmpctExceptionsConsole_field_gen1_labelCell').style.display='';
			$('allocatedType').style.display='';
			getAllocationTypeList();
		}
		var optionIndex2=getOptionIndex(itemSelect2,value2);
		if(optionIndex2==0){
			c.optionIndex=80;
		}else if(optionIndex2==1){
			c.optionIndex=81;
		}else{
			c.optionIndex=82;
		}
		//load list
	}else{
		$('abSpVwRmpctExceptionsConsole_field_gen1_labelCell').style.display='none';
		$('allocatedType').style.display='none';
	}
	
	c.sqlParam=getParamSql(c.optionIndex);
	setParameterForPanel('tree', c.optionIndex);
	
	
	
	
}

/**
 * panelType is tree|drawing
 */
function setParameterForPanel(panelType,optionIndex){
	var c=abSpVwRmpctExceptionsController2;
	
	if(panelType=='tree'){
		refreshTree();
        
	}else if(panelType=='drawing'){
		c.highlightDS1.addParameter('sqlParam', c.sqlParam);
		c.abSpVwRmpctExceptionsTab2RmDetail.addParameter('sqlParam',c.sqlParam);
	}
}

/**
 * event handler when click the floor level of the tree
 */
function onFlTreeClick(ob){
	var c=abSpVwRmpctExceptionsController2;
    var drawingPanel = View.panels.get('abSpVwRmpctExceptionsDrawingPanel');
    var currentNode = View.panels.get('abSpVwRmpctExceptionsTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var highlightResc = "";
    setParameterForPanel('drawing', abSpVwRmpctExceptionsController2.optionIndex);
    var title = String.format(getMessage('drawingPanelTitle2'), blId + '-' + flId);
    displayFloor(drawingPanel, currentNode, title);
    
   var res = new Ab.view.Restriction();
	res.addClauses(ob.restriction);
	var optionIndex=abSpVwRmpctExceptionsController2.optionIndex;
	//var panelArr=[c.rmpctReport1,c.rmpctReport2,c.rmpctReport3,c.rmpctReport4,c.rmpctReport5,c.rmpctReport6,c.rmpctReport7,c.rmpctReport8,c.rmpctReport9];
	var panelArr=[c.rmpctReport1,c.rmpctReport2,c.rmpctReport3,c.abSpVwRmpctExceptionsTab2RmDetail];
	
	for(var i=0;i<panelArr.length;i++){
		panelArr[i].show(false);
	}
	
	if(optionIndex==0){
		c.rmpctReport1.refresh(res,true);
	}else if(optionIndex==1){
		c.rmpctReport2.refresh(res,true);
	}else if(optionIndex==2){
		c.rmpctReport3.refresh(res,true);
	}else {
		View.panels.get('abSpVwRmpctExceptionsTab2RmDetail').refresh(res);
	}
	
}



/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, currentNode, title){
    var blId = getValueFromTreeNode(currentNode, 'bl.bl_id');
    var flId = getValueFromTreeNode(currentNode, 'fl.fl_id');
    var dwgName = getValueFromTreeNode(currentNode, 'fl.dwgname');
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
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


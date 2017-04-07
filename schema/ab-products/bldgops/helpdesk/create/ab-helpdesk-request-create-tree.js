/**
 * @author Song
 */
/**
 * event handler when click building node of the tree 'abSpAsgnEmToRm_blTree'.
 * 1.check current View is 'group mvoe' or 'individual move' and make sure all the field value was correct.
 * 2.call method 'resetDrawing' to show drawing panel.
 * 3.call method 'dateFieldOnChange' register onchange event for 'date_end' or 'move_date' field
 */
//var lastClickedTreeNode = null;//use when end_date change kb 3032150
function onTreeFlClick(ob){
//	lastClickedTreeNode = ob;
	var tabs = View.getControlsByType(parent, 'tabs')[0];
	var tabBasic = tabs.findTab("basic");
	//for the individual or group approve function.
	var activityTypeValue = tabs.activityTypeValue;
	if(tabBasic&&tabBasic.restriction){
    	var restriction = tabBasic.restriction;
        activityTypeValue = restriction["activitytype.activity_type"];
	}
	//check if group_move_approve
    if(tabs!=null&&tabs.funcType=="group_move_approve"){
    	resetDrawing(tabs.date_start,tabs.date_end,ob);
    }else if(tabs!=null&&tabs.funcType=="individual_move_approve"){
    	resetDrawing(null,tabs.move_date,ob);
    }else 
	//check if create group move
	if(activityTypeValue=="SERVICE DESK - GROUP MOVE"){
		resetDrawing(tabs.date_start,tabs.date_end,ob);
		//when end_date change kb 3032150
//		dateFieldOnChange("date_end");
		//check if create individual move
	}else if(activityTypeValue=="SERVICE DESK - INDIVIDUAL MOVE"){
		resetDrawing(null,tabs.move_date,ob);
		// when end_date change kb 3032150
//		dateFieldOnChange("date_start");
	}
}
/**
 * private method
 */
function resetDrawing(date_start,date_end,ob){
	 var cp = View.getControl('', 'abSpAsgnEmToRm_drawingPanel');
	 var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
	 var blId = currentNode.parent.data['bl.bl_id'];
	 var flId = currentNode.data['fl.fl_id'];
	 var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
	 
	 setParametersToDataSource(date_start,date_end);
	 
	var dwgName = currentNode.data['fl.dwgname'];
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	cp.addDrawing(dcl);
	setSelectability(date_start,date_end,ob.restriction);
	cp.isLoadedDrawing = true;
	cp.clearAssignCache(true);
	emAssigns = []
	View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);

}
/**
 * set parameter to Label dataSource
 */
function setParametersToDataSource(date_start,date_end){
	var arrayDs = ['ds_ab-sp-asgn-em-to-rm_drawing_availRm','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel1','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel2','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel3','ds_ab-sp-asgn-em-to-rm_drawing_rmLabel4'];
	for(var i=0;i<arrayDs.length;i++){
		var drawingDataSource = View.dataSources.get(arrayDs[i]);
		if(drawingDataSource){
			drawingDataSource.addParameter('p_date_start', dateFormat(date_end));
			drawingDataSource.addParameter('p_date_end', dateFormat(date_end));
		}
	}
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
/**
 * private method
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(date_start,date_end,restriction){
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var drawingDataSource = View.dataSources.get('ds_ab-sp-asgn-em-to-rm_drawing_availRm');
    drawingDataSource.addParameter('p_date_start', dateFormat(date_end));
    drawingDataSource.addParameter('p_date_end', dateFormat(date_end));
    var rmRecords = drawingDataSource.getRecords(restriction);
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
//        var occupiable = record.getValue('rmcat.occupiable');
        var legend_level = record.getValue('rm.legend_level');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        if (legend_level != '1') {
            drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
        }else{
        	drawingPanel.setSelectability.defer(1000, this, [opts_selectable, true]);
        }
    }
}
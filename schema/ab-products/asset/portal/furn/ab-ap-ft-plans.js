/**
 * controller definition
 */
var abFtPlansController = View.createController('abFtPlansCtrl',{
	afterViewLoad: function(){
        //specify a handler for when drawing is fully loaded; to be able to manually set highlights after load
        View.panels.get('ab-ft-plans_DrawingPanel').addEventListener('ondwgload', onDwgLoaded);
		//add event listener fro clicking on a room
		View.panels.get('ab-ft-plans_DrawingPanel').addEventListener('onclick', onDwgPanelClicked);
    }
});

var selectedBl;
var selectedFl;
var selectedDwgName;

function onDwgLoaded(){
    var opts = new DwgOpts();
	opts.rawDwgName = selectedDwgName;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('rm.bl_id' ,selectedBl);
	restriction.addClause('rm.fl_id' , selectedFl);
	restriction.addClause('rm.dwgname' , selectedDwgName);
	var records = View.dataSources.get('ds_ab_ft_plans_darwing_highlight').getRecords(restriction);
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var id = record.getValue('rm.bl_id') + ";" + record.getValue('rm.fl_id') + ";" + record.getValue('rm.rm_id');
        opts.appendRec(id);
    }
	if(records.length > 0){
		var dwgCtrl = View.panels.get('ab-ft-plans_DrawingPanel');
    	dwgCtrl.highlightAssets(opts);
	}
}

//@ pk  - selected room details (building, floor, room)
function onDwgPanelClicked(pk){
	
	//refresh details panels
	
	document.getElementById("selectedRoom").innerHTML ='<font size="2" face="Verdana"><b>'+getMessage('selected_room')+'</b>'+pk[0]+'-'+pk[1]+'-'+pk[2]+'</font>';
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ta.bl_id' , pk[0]);
	restriction.addClause('ta.fl_id' , pk[1]);
	restriction.addClause('ta.rm_id' , pk[2]);
	
	
	
	View.panels.get('ab-ft-plans-summary').refresh(restriction);
	View.panels.get('ab-ft-plans-list').refresh(restriction);
}



/*
 * clicking on floor event
 * @node - node selected
 */
function loadDrawingPanel(node){
	
	//hide details panels
	document.getElementById("selectedRoom").innerHTML ='';
	View.panels.get('ab-ft-plans-summary').show(false);
	View.panels.get('ab-ft-plans-list').show(false);
	
	//get selected building and floor
	var currentNode = View.panels.get('ab-ft-plans-tree-bl').lastNodeClicked;
    selectedBl = currentNode.parent.data['bl.bl_id'];
    selectedFl = currentNode.data['fl.fl_id'];
	selectedDwgName = currentNode.data['fl.dwgname'];
	
	//draw the floor map
    var drawingPanel = View.panels.get('ab-ft-plans_DrawingPanel');
    var dcl = new Ab.drawing.DwgCtrlLoc(selectedBl, selectedFl, null, selectedDwgName);
    drawingPanel.addDrawing(dcl);
    
}

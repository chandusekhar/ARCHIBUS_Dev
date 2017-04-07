var dcl = undefined;
var recsDwg = undefined;
var indexDwg = undefined;

var abMapLeaseCtrl = View.createController('abMapLeaseCtrl', {
	blId: 'HQ',
	
	afterInitialDataFetch: function(){
		this.refreshView();
	},
	
	refreshView: function(blId){
		if(valueExistsNotEmpty(blId)){
			this.blId = blId;
			dcl = undefined;
			recsDwg = undefined;
			indexDwg = undefined;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls.bl_id', this.blId , '=');
		this.abDashRplmMapLeaseList.refresh(restriction);
		addDrawings();
	}
});


function addDrawings(){
	var dwgPanel  = View.panels.get('abDashRplmMapLeaseDwg');
	var controller = View.controllers.get('abMapLeaseCtrl');
	if(recsDwg == undefined){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('su.bl_id', controller.blId , '=');
		restriction.addClause('su.dwgname', '', 'IS NOT NULL');
		var ds = View.dataSources.get('suDrawings_ds');
		recsDwg = ds.getRecords(restriction);
		indexDwg = -1;
	}
	if(dcl == undefined && dwgPanel.initialized){
		appendDrawing();
	}else{
		setTimeout('addDrawings()', 500);
	}
}

function appendDrawing(){
	var dwgPanel  = View.panels.get('abDashRplmMapLeaseDwg');
	if(indexDwg == -1){
		dwgPanel.clear();
		if(recsDwg.length == 0){
			return;
		}
		indexDwg = 0;
		loadDrawing();
	}else if(dwgPanel.dwgLoaded && indexDwg < recsDwg.length -1){
		indexDwg = indexDwg + 1;
		loadDrawing();
	}else{
		setTimeout('appendDrawing()', 500);
	}
}

function loadDrawing(){
	var dwgPanel  = View.panels.get('abDashRplmMapLeaseDwg');
	var record = recsDwg[indexDwg];
	var blId = record.getValue('su.bl_id');
	var flId = record.getValue('su.fl_id');
	var dwgName = record.getValue('su.dwgname');
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	dwgPanel.addDrawing(dcl);
	if(indexDwg < recsDwg.length -1){
		appendDrawing();
	}
}


function openLeaseDetails(ctx){
	var parentGrid = View.panels.get('abDashRplmMapLeaseList');
	var lsId = ctx.row.getFieldValue("ls.ls_id");
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.ls_id", lsId, "=");
	View.getOpenerView().addDialogParameter('parentGridObj', parentGrid);
	View.getOpenerView().openDialog('ab-dash-rplm-map-leases-details.axvw', restriction, false, {
		width: 800,
		height: 600,
		parentGridObj: parentGrid
	});
	
}
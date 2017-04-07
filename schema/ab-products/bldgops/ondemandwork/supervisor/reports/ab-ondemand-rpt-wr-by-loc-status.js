var control = View.createController("ondemandRptViewWrByLocController",{

	consoleRes:null,
	
	consolePanel_onFilter:function(){
		selectLocation();
	},
	consolePanel_onClear:function(){
		this.consolePanel.clear();
	},
	
	getConsoleRes:function(){
		if (this.consoleRes) {
			this.consoleRes.clauses.length = 0;
		}
		else {
			this.consoleRes = new Ab.view.Restriction();
		}
		
		
		var probType = this.consolePanel.getFieldValue("wr.prob_type");
		if (probType){
			this.consoleRes.addClause("wr.prob_type",probType,"=");
		}
		var supervisor = this.consolePanel.getFieldValue("wr.supervisor");
		if (supervisor){
			this.consoleRes.addClause("wr.supervisor",supervisor,"=");
		}
		var workTeamId = this.consolePanel.getFieldValue("wr.work_team_id");
		if (workTeamId){
			this.consoleRes.addClause("wr.work_team_id",workTeamId,"=");
		}
		
		var dateRequestedFrom = this.consolePanel.getFieldValue('wr.date_requested.from');
    	if (dateRequestedFrom != '') {
    		this.consoleRes.addClause('wr.date_requested', dateRequestedFrom, '>=');
    	}
    	var dateRequestedTo = this.consolePanel.getFieldValue('wr.date_requested.to');
    	if (dateRequestedTo != '') {
    		this.consoleRes.addClause('wr.date_requested', dateRequestedTo, '<=');
    	}
		
		//add a general filter to show only work requests that have an Action Type of “SERVICE DESK – MAINTENANCE”
		this.consoleRes.addClause('wr.activity_type', 'SERVICE DESK - MAINTENANCE', '=');
	}
});

var locationField, locationValue;

/**
 * Called when the user selects any tree node. Applies the selected node restriction to the chart.
 */
function selectLocation() {
	var treePanel = View.panels.get('locationTree');
	var selectedNode = treePanel.lastNodeClicked;
	var selectedLevel = selectedNode.level.levelIndex;
	
	

	// create the SQL restriction for the selected location
	switch (selectedLevel) {
	case 0:
	    locationField = 'ctry_id'; 
	    locationValue = selectedNode.data['ctry.ctry_id'];
		break;
	case 1:
	    locationField = 'regn_id'; 
	    locationValue = selectedNode.data['regn.regn_id'];
		break;
	case 2:
	    locationField = 'state_id'; 
	    locationValue = selectedNode.data['state.state_id'];
		break;
	case 3:
	    locationField = 'city_id'; 
	    locationValue = selectedNode.data['city.city_id'];
		break;
	case 4:
	    locationField = 'site_id'; 
	    locationValue = selectedNode.data['site.site_id'];
		break;
	case 5:
	    locationField = 'bl_id'; 
	    locationValue = selectedNode.data['bl.bl_id'];
		break;
	}
	
	// refresh the chart using the selected location restriction
	var chartPanel = View.panels.get('dataChart');
	chartPanel.addParameter('locationField', locationField);
	chartPanel.addParameter('locationValue', locationValue);
	//re-get the console restriction
	control.getConsoleRes();
	chartPanel.refresh(control.consoleRes);
	
	// display the selected location in the chart title
	chartPanel.appendTitle(locationValue);
}

function onBarChartClick(obj){
	var restriction = new Ab.view.Restriction();
    var status = obj.selectedChartData['wr.status'];
    var detailPanel = View.panels.get('wrDetailGrid');
    var keyValue = getKeyValueOfStatus(obj,status);
    
	restriction.addClause("wr.status",keyValue,"=");
	restriction.addClauses(control.consoleRes);
	
	detailPanel.addParameter('locationField', locationField);
	detailPanel.addParameter('locationValue', locationValue);
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 600,
        height: 400
    });
}

function getKeyValueOfStatus(obj,status){
	var keyValue = status;
	var len = obj.chart.fieldDefs.length;
	for (var i =0; i<len ;i++){
		var fieldId = obj.chart.fieldDefs[i].id;
		if (fieldId == "wr.status"){
			var enumValues = obj.chart.fieldDefs[i].enumValues;
			for (key in enumValues){
				if (enumValues[key] == status){
					keyValue = key;
				}
			}
		}
	}
	return keyValue;
}

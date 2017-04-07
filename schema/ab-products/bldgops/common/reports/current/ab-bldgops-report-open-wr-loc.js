
var abBldgopsReportOpenWrLocController = View.createController('abBldgopsReportOpenWrLocController', {
    locationField: '',
    locationValue: '',
	consoleRestriction:'',
	otherRes:' 1=1 ',
    dateStart: '1900-12-15',
    dateEnd: '2200-12-15',
  	fieldsArraysForRestriction: new Array(['wr.dv_id'], ['wr.dp_id'], ['wr.prob_type','like'], ['wr.supervisor'], ['wr.work_team_id']),
	
	abBldgopsReportOpenWrLocConsole_onClear : function() {	
		this.abBldgopsReportOpenWrLocConsole.clear();
		this.abBldgopsReportOpenWrLocChart.show(false);
	},

	abBldgopsReportOpenWrLocConsole_onShow : function() {
		if ( this.abBldgopsReportOpenWrLocTree.lastNodeClicked ) {
			selectLocation(); 
		} else {
			this.abBldgopsReportOpenWrLocChart.show(true);
			this.locationField = '1';
			this.locationValue = '1';
			this.consoleRestriction = getConsoleRestriction();
			
			// refresh the chart using the console restriction only
			var chartPanel = this.abBldgopsReportOpenWrLocChart;
			chartPanel.addParameter('locationField', '1');
			chartPanel.addParameter('locationValue', '1');
			chartPanel.addParameter('dateStart', this.dateStart);
			chartPanel.addParameter('dateEnd', this.dateEnd);
			chartPanel.addParameter('otherRes', this.consoleRestriction);
			chartPanel.refresh();
		}
	}
})

/**
 * Called when the user selects any tree node. Applies the selected node restriction to the chart.
 */
function selectLocation() {
	abBldgopsReportOpenWrLocController.abBldgopsReportOpenWrLocChart.show(true);
	var treePanel = View.panels.get('abBldgopsReportOpenWrLocTree');
	var selectedNode = treePanel.lastNodeClicked;
	var selectedLevel = selectedNode.level.levelIndex;
	
	var locationField, locationValue;

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
	
	var parentController = View.controllers.get('abBldgopsReportOpenWrLocController');
	parentController.locationField = locationField;
	parentController.locationValue = locationValue;
	parentController.consoleRestriction = getConsoleRestriction();
	
	// refresh the chart using the selected location restriction
	var chartPanel = View.panels.get('abBldgopsReportOpenWrLocChart');
	chartPanel.addParameter('locationField', locationField);
	chartPanel.addParameter('locationValue', locationValue);
	chartPanel.addParameter('dateStart', parentController.dateStart);
	chartPanel.addParameter('dateEnd', parentController.dateEnd);
	chartPanel.addParameter('otherRes', parentController.consoleRestriction);
	//var consoleRestriction = getConsoleRestriction();
	chartPanel.refresh();
	
	// display the selected location in the chart title
	chartPanel.appendTitle(locationValue);
}

function getConsoleRestriction(){
	// add optional console restriction
	var parentController = View.controllers.get(0);
	var console = View.panels.get('abBldgopsReportOpenWrLocConsole');
	setStartAndEndDateValue(parentController, console, "wr.date_requested");

	var otherRes =  getRestrictionStrFromConsole(console, parentController.fieldsArraysForRestriction);
	var eqStd = console.getFieldValue("eq.eq_std");
	if(eqStd){
		otherRes = otherRes + " AND EXISTS ( SELECT 1 FROM eq WHERE eq.eq_id=wr.eq_id AND "+ getMultiSelectFieldRestriction(['eq.eq_std'],eqStd) +")";
	}
	return otherRes;
}


function onChartClick(obj){
	var parentController = View.controllers.get(0);
    var detailGrid = View.panels.get('abBldgopsReportOpenWrLocGrid');
	var otherRes = parentController.consoleRestriction;
	var status = obj.selectedChartData['wr.status'];
    var keyStatus = getKeyValueOfStatus(obj, status);
	if(keyStatus){
		otherRes = otherRes + " AND wr.status='"+keyStatus+"' ";
	}
	var locationField = View.controllers.get('abBldgopsReportOpenWrLocController').locationField;
	var locationValue = View.controllers.get('abBldgopsReportOpenWrLocController').locationValue;
	detailGrid.addParameter('locationField', locationField);
	detailGrid.addParameter('locationValue', locationValue);
	detailGrid.addParameter('dateStart', parentController.dateStart);
	detailGrid.addParameter('dateEnd', parentController.dateEnd);
	detailGrid.addParameter('otherRes', otherRes);
    detailGrid.refresh();
    detailGrid.showInWindow({
        width: 800,
        height: 600
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

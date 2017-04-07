var chart = null;
var dv_dp_value = null;
var old_bl_fl_value = null;
var new_bl_fl_value = null;
var bl_fl_id = null;
var dv_dp_id = null;

var click_index = 0;
var move_flag = "";

var allocStackController = View.createController('allocStack',{

	restoreSelection: function(){
		var console = View.panels.get('allocGroupConsole');

		var dateReport = console.getFieldValue('gp.date_start');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');
		var bl_id = this.tabs.wizard.getBl();

		this.chartPanel.addParameter('dateReview' , dateReport);
		this.chartPanel.addParameter('portfolioScenario' , portfolio_scenario_id);
		this.chartPanel.addParameter('blId' , bl_id);

		var restArray = allocCommonController.getConsoleRestriction();

		this.chartPanel.refresh(restArray["restriction"]);

		this.chartPanel.setTitle(restArray["title"]);
	}
});

// When the user clicks on a the stack chart
function getClickedItemData(obj){

	chart = obj.chart;
	var panel = View.panels.get('chartPanel');

	click_index = click_index + 1;
	if(click_index > 2){
		click_index = 1;
	}

	bl_fl_id = chart.groupingAxis[0].table + "." + chart.groupingAxis[0].field;
	dv_dp_id = chart.secondaryGroupingAxis[0].table + "." + chart.secondaryGroupingAxis[0].field;

	if (click_index == 1){
		dv_dp_value = obj.selectedChartData[dv_dp_id];
		if (dv_dp_value == "AVAILABLE") {
			clearSelection();
			return;
		}
		old_bl_fl_value = obj.selectedChartData[bl_fl_id];
		panel.actions.get('move').setTitle(getMessage("selectFloor") + " " + dv_dp_value + " " + old_bl_fl_value);
	}

	if (click_index == 2){
		new_bl_fl_value = obj.selectedChartData[bl_fl_id];
		
		if (new_bl_fl_value == old_bl_fl_value) {
			clearSelection();
			return;
		}
		
		panel.actions.get('move').setTitle(getMessage("confirmMove") + " " + dv_dp_value + " from: " + old_bl_fl_value + " "  + " to: " + new_bl_fl_value);
		move_flag="CONFIRM";
	}
}

function move(){
	var panel = View.panels.get('chartPanel');

	if (move_flag=="") {
		dv_dp_value = null;
		new_bl_fl_value = null;
		panel.actions.get('move').setTitle(getMessage("selectGroup"));
	}

	if (move_flag=="CONFIRM") {
		assign();
		clearSelection();
	}
}

function clearSelection(){

	var panel = View.panels.get('chartPanel');
	move_flag="";
	click_index=0;
	bl_fl_id = null;
	dv_dp_id = null;
	dv_dp_value=null;
	new_bl_fl_value=null;
	old_bl_fl_value=null;
	panel.actions.get('move').setTitle(getMessage("moveAction"));

}

//assign group to new floor, does the job through javascript
function assign() {

	if(dv_dp_value!=null && new_bl_fl_value!=null){

		var groupDataSource = View.dataSources.get('ds_group');	
		
		//get the new bl and fl
        var findRightGroup = false;
        var findRightFloor = false;
        var currentRecord = null;
        var rightGroupRecord = null;

        var new_fl = "";
        var new_bl = "";
        var bl = "";
        var fl = "";
        var dv = "";
        var dp = "";
        var record_gp = null;
        var gp = null;

		var restArray = allocCommonController.getConsoleRestriction();

		var records = groupDataSource.getRecords(restArray["restriction"]);

		// for each record
        for (var i = 0; i < records.length; i++) {
            currentRecord = records[i];

            if (!findRightGroup || !findRightFloor) {

                bl =  trimRight(currentRecord.getValue("gp.bl_id"));
                fl =  trimRight(currentRecord.getValue("gp.fl_id"));
                dv =  trimRight(currentRecord.getValue("gp.dv_id"));
                dp =  trimRight(currentRecord.getValue("gp.dp_id"));
                gp =  trimRight(currentRecord.getValue("gp.gp_id"));

                // for source group
                if (!findRightGroup && (bl + "-" + fl) == old_bl_fl_value
                        && (dv + "-" + dp) == dv_dp_value) {
                    rightGroupRecord = currentRecord;
                    findRightGroup = true;
                    record_gp = gp;
                }

                // for destination floor
                if (!findRightFloor && (bl + "-" + fl)==new_bl_fl_value) {
                    new_fl = fl;
                    new_bl = bl;
                    findRightFloor = true;
                }
            }// end if (!findRightGroup || !findRightFloor)
            else {
                break;
            }
        }// end for (int i = 0; i < records.size(); i++)

        if (findRightGroup && findRightFloor) {

			//an old record
			rightGroupRecord.isNew = false;

            // set the new bl_fl value for the group
            rightGroupRecord.setValue("gp.fl_id", new_fl);
            rightGroupRecord.setValue("gp.bl_id", new_bl);

            // have to set the old value which is the same as the new value of gp_id
            // it is necessary for the SQL update statement's "WHERE gp.gp_id = 23".
            // and also in order to get the value, have to include it in the view's datasource
            rightGroupRecord.oldValues = new Object();
			rightGroupRecord.oldValues["gp.gp_id"] = record_gp;
			
			groupDataSource.saveRecord(rightGroupRecord);
        }
		
		allocStackController.restoreSelection();
	}
	
	dv_dp_value=null;
	new_bl_fl_value=null;
}
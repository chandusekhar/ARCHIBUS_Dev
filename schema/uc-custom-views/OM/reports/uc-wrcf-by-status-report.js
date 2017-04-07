var wrCfByStatusController = View.createController('wrCfByStatusController', {

	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setupSelectbox_tr_id();
		this.consolePanel_onShow();
	},
	
	////////////////////////////////////////selectbox trade setup//////////////////////////////////////////////////////////////////////////////////////////////////////
	//setup selectbox for Work Unit (tr_id)
	setupSelectbox_tr_id: function(){
		//add trades into options
		this.addTrSelectBoxOptionsOptions();
		//default to user's Work Unit (tr_id)
		this.setDefaultTrade();

	},

	setDefaultTrade:function(){
		var tr_id = this.getUsersTrade();
		var options = $('selectbox_tr_id').options;
		for(var i = 0; i < options.length; i++){
			if(tr_id == options[i].value){
				$('selectbox_tr_id').selectedIndex = i;
				break;
			}
		}
	},

	getUsersTrade: function(){
		var tr_id = null;
		var email = View.user.email; //use user's email to find out the trade
		if(email != ""){
			tr_id = UC.Data.getDataValue('cf', 'tr_id', "email="+this.literalOrNull(email));
		}
		return tr_id;
	},

	addTrSelectBoxOptionsOptions: function(){
		var records = UC.Data.getDataRecords('tr', ['tr.tr_id'], "");
		this.addSelectBoxOptionsByRecords($('selectbox_tr_id'),records,'tr.tr_id',true);
	},
	addSelectBoxOptionsByRecords: function(selectBox, records,fieldName,includeEmptyOption){

		if(includeEmptyOption != undefined){
			if(includeEmptyOption){
				var optn = document.createElement("OPTION");
				optn.text = "";
				optn.value = "";
				selectBox.options.add(optn);	//add blank option at the top
			}
		}
		//This function is used in showInputs to add new items into the selectbox
		for(var i = 0; i< records.length; i++){
			var value = records[i][fieldName];
			var optn = document.createElement("OPTION");
			optn.text = value;
			optn.value = value;
			selectBox.options.add(optn);
		}
	},
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//console filter
	consolePanel_onShow: function() {
		var date_entered = this.consolePanel.getFieldValue('uc_wrcf_staging.date_entered');
		var cf_id = this.consolePanel.getFieldValue('uc_wrcf_staging.cf_id');
		var tr_id = $('selectbox_tr_id').value;
		var zone_id = this.consolePanel.getFieldValue('zone_id');//2012.08.08 - AS- add zone in the search console 
		var restriction = "1=1";
		if(cf_id != ""){	restriction = restriction + " AND wr.cf_id = "+this.literalOrNull(cf_id);	}
		if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+this.literalOrNull(tr_id);	}
		if(zone_id != ""){	restriction = restriction + " AND wr.zone_id = "+this.literalOrNull(zone_id);	}
		this.reportPanel.refresh(restriction);
	},
	
	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		$('selectbox_tr_id').selectedIndex = 0;
	},
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//utility functions
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	}
});



function onCrossTableClick(obj){
	var status="";
	var cf_id="";
	var tr_id = $('selectbox_tr_id').value;
	var zone_id = View.panels.get("consolePanel").getFieldValue('zone_id');
	
	var selected = obj.restriction.clauses;
	
	for(i=0;i<selected.length; i++){
		if(selected[i].name=="wr.status"){
			status = selected[i].value;
		}
		if(selected[i].name=="wr.cf_id"){
			cf_id = selected[i].value;
		}
	}
	var restriction = " 1=1 "
	if(status != ""){	restriction = restriction + " AND wr.status = "+wrCfByStatusController.literalOrNull(status);	}
	if(cf_id != ""){	restriction = restriction + " AND EXISTS(select 1 from wrcf where wr.wr_id=wrcf.wr_id and wrcf.cf_id = "+wrCfByStatusController.literalOrNull(cf_id)+")";	}
	if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+wrCfByStatusController.literalOrNull(tr_id);	}
	if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where wr.bl_id=bl.bl_id and bl.zone_id = "+wrCfByStatusController.literalOrNull(zone_id)+")";	}

	View.openDialog("uc-wrcf-by-status-report-dialog.axvw", restriction);

}
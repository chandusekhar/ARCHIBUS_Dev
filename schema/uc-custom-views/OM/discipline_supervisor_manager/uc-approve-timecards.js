/*
2012.08.08 - ASO- add zone in the search console 
			   - disable reject function
*/
var approveTimecardsController = View.createController('approveTimecardsController', {

	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setupSelectbox_tr_id();
		this.setDefaultWorkTeamId();
		//this.consolePanel_onShow();
	},
	
	////////////////////////////////////////selectbox trade setup//////////////////////////////////////////////////////////////////////////////////////////////////////
	//setup selectbox for Work Unit (tr_id)
	setupSelectbox_tr_id: function(){
		//add trades into options
		this.addTrSelectBoxOptionsOptions();
		//default to user's Work Unit (tr_id)
		//this.setDefaultTrade();
	},
	
	setDefaultWorkTeamId:function(){
		var parameters = {
			tableName: 'cf',
			fieldNames: toJSON(['cf.work_team_id']),
			restriction: "cf.cf_id = '" + View.user.employee.id + "'"
		};
	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			var workTeamId = result.data.records[0]['cf.work_team_id'];
			document.getElementById("work_team_input").value = workTeamId;
		}
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
		var email = View.user.email;
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
		var workTeamId = document.getElementById("work_team_input").value;
		var tr_id = $('selectbox_tr_id').value;
		var zone_id = this.consolePanel.getFieldValue('zone_id');//2012.08.08 - AS- add zone in the search console 
		var restriction = "1=1";
		if(date_entered != ""){	restriction = restriction + " AND uc_wrcf_staging.date_entered = "+this.literalOrNull(date_entered);	}
		if(cf_id != ""){	restriction = restriction + " AND uc_wrcf_staging.cf_id = "+this.literalOrNull(cf_id);	}
		if(workTeamId != ""){	restriction = restriction + " AND wr.work_team_id = "+this.literalOrNull(workTeamId);	}
		if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+this.literalOrNull(tr_id);	}
		if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where bl.bl_id=wr.bl_id AND bl.zone_id = "+this.literalOrNull(zone_id)+" ) ";	}//2012.08.08 - AS- add zone in the search console 
		this.ucWrcfStagingListPanel.refresh(restriction);
	},
	
	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
	},
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//show view requests
	onViewRequest: function(row) {
		var wr_id = row['uc_wrcf_staging.wr_id'];
		var detailsAxvw = "uc-ds-wr-manager-details.axvw?wrId="+wr_id;
		View.openDialog(detailsAxvw);
	},
	
	//refresh list
	ucWrcfStagingListPanel_onRefresh: function(){
		this.ucWrcfStagingListPanel.refresh();
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//approve
	ucWrcfStagingListPanel_onApprove: function(){
				
		var selectedRecords = this.ucWrcfStagingListPanel.getSelectedRecords();
		if(selectedRecords.length <= 0){
			View.showMessage("No records selected.");
			return false;
		}
		if(View.user.employee.id != ""){
			var dsWrcf = View.dataSources.get("uc_wrcf_staging_list_ds1");
			//update all selected uc_wrcf_staging.approved_by field
			for (var i = 0; i < selectedRecords.length; i++) {
				this.updateSetApprovedBy(dsWrcf,selectedRecords[i],View.user.employee.id);
			}
			
			//call the workflow to update the transfer
			try {
			var parameters =  {};
			var result = Workflow.call('AbBldgOpsOnDemandWork-ucTransferWrCfFromStaging', parameters);
				//alert("Workflow: "+result.code);
				this.ucWrcfStagingListPanel_onRefresh();
			}
			catch (e) {
				Workflow.handleError(e);
			}
		}
		else{
			View.showMessage("Your Account is not set up properly, please contact your system administrator.");
			return false;
		}
		
	},
	
	updateSetApprovedBy: function(dsWrcf,record,approvedBy){	
		try{
			var rec = record;
			rec.setValue("uc_wrcf_staging.approved_by", approvedBy);
			dsWrcf.saveRecord(rec);
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	/* update 2012.08.08 -ASO- disable reject function
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//rejected -ADDED BY JJYCHAN
	ucWrcfStagingListPanel_onReject: function(row){
        var selectedRecords = this.ucWrcfStagingListPanel.getPrimaryKeysForSelectedRows();
		//var selectedRecords = this.ucWrcfStagingListPanel.getSelectedRecords();
        if (selectedRecords.length == 0) {
            View.showMessage("No records selected.");
			//return false;
        }
        else {
        
            View.confirm(getMessage('confirm_reject_timeslips'), function(button){
                if (button == 'yes') {
                    try {
                        Workflow.call('AbCommonResources-deleteDataRecords', {
                            records: toJSON(selectedRecords),
							viewName: 'uc-approve-timecards.axvw',
        					dataSourceId: 'uc_wrcf_staging_list_ds'
                        });
                    } 
                    catch (e) {
                        Workflow.handleError(e);
                    }
					this.ucWrcfStagingListPanel_onRefresh();
					//View.controllers.get('mgmtScheduledCost').scheduledCostGrid.refresh();
                }
                else 
                    this.close();
            })
        }
    },
	*/
	
	updateSetApprovedBy: function(dsWrcf,record,approvedBy){	
		try{
			var rec = record;
			rec.setValue("uc_wrcf_staging.approved_by", approvedBy);
			dsWrcf.saveRecord(rec);
		} catch (e) {
			Workflow.handleError(e);
		}
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



function saveTimeSlip()
{

    try {
        View.getControl('', 'ucWrcfStagingListPanel').refresh();
    }
   	catch (e) {
		Workflow.handleError(e);
 	}
}

function selectWorkTeam(){
	View.selectValue('consolePanel', '',
						['work_team_input'],
						'work_team',
						['work_team.work_team_id'],
						['work_team.work_team_id', 'work_team.description'],
						null, onChangeWorkTeamId, true, true);
}

function onChangeWorkTeamId(fieldName,selectedValue,previousValue){
	document.getElementById(fieldName).value = selectedValue;
	return true;
}
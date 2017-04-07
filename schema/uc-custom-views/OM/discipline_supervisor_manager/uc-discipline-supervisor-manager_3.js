// CHANGE LOG:
// 2012/06/27 - ASO - WR173261 - modify wrListPanelhideShowButton() to enable "Create Sub Request" when in "Completed-More Info Needed" Status
// 2012/06/27 - ASO - WR172913 - show completed work request added code in onSelectStatus() and wrListPanelhideShowButton()
// 2012/07/04 - ASO - WR173118 - add new function to re-issue wr  (wrListPanel_onReIssueRequests)
// 2012/09/05 - EW - added auto refresh of panels.
// 2012/11/04 - BH - added Prev Next code.
// 2012/10 - DChampion - added code for c.
// 2015/11/18 - MSHUSSAI - added code for Work Description search field.
// 2015/11/27 - MSHUSSAI - added code for Cause Type and Repair Type search fields.
// 2015/12/09 - MSHUSSAI - updated code for saveWRAuditValues function to add Work Team.
// 2016/01/14 - MSHUSSAI - WR358933 - Added new javascript function called sendEmailOnFWC in order to enable emails on change to FWC.
// 2016/01/21 - MSHUSSAI - WR358933 - Added new javascript function called selectProbCat, onChangeProbCat, selectProbType and onChangeProbType in order to enable pop ups for Problem Category and Problem Type.


var dsManagerRefreshInterval = 5 * 60000; // in ms.

var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };

var disciplineSupervisorManagerController = View.createController('disciplineSupervisorManagerController', {
	wrIdList: "",
	consoleRestriction: "",

	afterViewLoad: function() {

		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		// 2012/11/04 - BH - added Prev Next code.

		//prevNextafterViewLoad(this.wrListPanel,"50,100,250,500,1000","50");
        //prevNextafterViewLoad(this.hwrListPanel,"50,100,250,500,1000","50");
	},
	// 2012/11/04 - BH - added Prev Next code.
	wrListPanel_afterRefresh: function(){
		//prevNext_afterRefresh(this.wrListPanel);
	},
/* 	consolePanel_afterRefresh: function(){
		BRG.UI.addNameField('probcat_name', this.wr_create_details, 'activity_log.bl_id', 'bl', 'name',
        {'bl.bl_id' : 'activity_log.bl_id'},
        nameLabelConfig,'');
	}, */
	afterInitialDataFetch: function() {
		this.inherit();

		this.setupSelectbox_tr_id();
		this.consolePanel_onShow();
		// 2012/10 - DC - added to handle vehicle request.
		titleObj = Ext.get('createNewReq');
		titleObj.on('click', this.showMenuDetailsCreateNewReq, this, null);

		// Overload the afterCreateCellContent to colour-code the status
		this.wrListPanel.afterCreateCellContent = function(row, col, cellElement) {
			if (col.id == 'wr.status') {
				var value = row['wr.status.raw'];
				switch (value) {
				case 'R':
					cellElement.style.color = '#FF0000';
					break;
				case 'A':
					cellElement.style.color = '#FF0000';
					break;
				case 'AA':
					cellElement.style.color = '#9932CC';
					break;
				case 'I':
					cellElement.style.color = '#008000';
					break;
				case 'HA':
				case 'HL':
				case 'HP':
				case 'HD':
				case 'RA':
				case 'PN':
					cellElement.style.color = '#3333FF';
					break;
				case 'FWC':
					cellElement.style.color = '#FFA500';
					break;
				case 'S':
				case 'Com':
				case 'Can':
					cellElement.style.color = '#000000';
					break;
				default:
					break;
				}
			}
			else if (col.id == 'wr.date_requested') {
				var value = row['wr.date_requested'];
				var daysOver = daysBetween(new Date(value), new Date());
				if (daysOver > 30) {
					cellElement.style.color = '#FF0000';
					cellElement.style.fontWeight = "bold";
				}
				else if (daysOver > 20) {
					cellElement.style.color = '#FFA500';
					cellElement.style.fontWeight = "bold";
				}
			}
			else if (col.id == 'wr.rm_id') {
				//var value = row['wr.rm_id'];
				if (row['wr.unit_id'] != '') {
					cellElement.innerHTML = row['wr.unit_id'];
				}

			}


			else if (col.id == 'wr.assigned_cf') {
				var value = row['wr.assigned_cf'];
				if (value == 'MULTIPLE') {
					cellElement.style.fontWeight = "bold";
				}
			}
			else if (col.id == 'wr.wr_id') {
				var value = row['wr.charge_type'];
				if (value == 'Single Funding') {
					cellElement.style.color = "#ffffff";
					//cellElement.style.fontWeight = "bold";
					cellElement.style.backgroundColor="#aaaadd";

				}
			}
			else if (col.id == 'wr.unit_id') {
				var value = row['wr.vehicle_number'];
				if (value) {
					cellElement.innerHTML = row['wr.vehicle_number'];
				}
			}
			else if (col.id == 'wr.priority') {
				var value = row['wr.priority'];
				if (value == '1-Emergency/Safety') {
					cellElement.style.color = '#FF0000';
					cellElement.style.fontWeight = "bold";
				}
			}
		}

		this.hwrListPanel.afterCreateCellContent = function(row, col, cellElement) {
			if (col.id == 'wr.unit_id') {
				var value = row['wr.vehicle_number'];
				if (value) {
					cellElement.innerHTML = row['wr.vehicle_number'];
				}
			}
		}

		var refreshTimeoutID = setTimeout("autoRefreshPanels()", dsManagerRefreshInterval);
	},
// 2012/10 - DC - added to handle vehicle request.
	showMenuDetailsCreateNewReq: function(e, item){
		var menuItems = [];
		menuItems.push({
					text: 'Work Request',
					handler: this.onCreateNewReqButtonPush.createDelegate(this, ['Work Request'])
					});
		menuItems.push({
					text: 'Vehicle Request',
					handler: this.onCreateNewReqButtonPush.createDelegate(this, ['Vehicle Request'])
					});
		var menu = new Ext.menu.Menu({
			items: menuItems
			});
		menu.showAt(e.getXY());
	},
// 2012/10 - DC - added to handle vehicle request.
	onCreateNewReqButtonPush: function(menuItemId){
		switch (menuItemId) {
			case "Work Request":
				View.openDialog('uc-request-dash.axvw',null,null,
					{
						width:1100
					}
				);
				break;
			case "Vehicle Request":
				View.openDialog('uc-vehicle-wr-create-main.axvw',null,null,
					{

					}
				);
				break;
		}
	},

	consolePanel_onShow: function(){
		var tr_id = $('selectbox_tr_id').value;
		var work_type = $('selectbox_work_type').value;
		var assigned_to_cf = $('selectbox_assigned_to_cf').value;
		var zone_id = this.consolePanel.getFieldValue('bl.zone_id');
		var wr_id = this.consolePanel.getFieldValue('wr.wr_id');
		var requestor = this.consolePanel.getFieldValue('wr.requestor');
		var bl_id = this.consolePanel.getFieldValue('wr.bl_id');
		var cf_id = this.consolePanel.getFieldValue('wr.cf_id');
		var charge_type = this.consolePanel.getFieldValue('wr.charge_type');
		var eq_id = this.consolePanel.getFieldValue('wr.eq_id');
		var eq_std = this.consolePanel.getFieldValue('eq.eq_std');
		var inResidence = $('inResidence').checked;
		//var work_team_id = this.consolePanel.getFieldValue('wr.work_team_id');
		var work_team_id = $('selectbox_work_team_id').value;
		var prob_type = this.consolePanel.getFieldValue('wr.prob_type');
		var cause_type = this.consolePanel.getFieldValue('causetyp.cause_type');
		var repair_type = this.consolePanel.getFieldValue('repairty.repair_type');
		var description = "%"+$('inputbox_desc').value+"%";
		var priority = this.consolePanel.getFieldValue('wr.priority');
		//var prob_cat = document.getElementById("prob_cat_input").value;
		
		var prob_cat = document.getElementById("prob_cat_input").value;
		
		var restriction = "1=1";
	
		//JJYCHAN - 20140505 - Removed prob_type IS NOT NULL
		//restriction = "(prob_type NOT IN ('FLEET-RESERVE') OR prob_type IS NOT NULL)"
		restriction = "(prob_type NOT IN ('FLEET-RESERVE') OR prob_type IS NULL)";

		if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+this.literalOrNull(tr_id);	}
		if(bl_id != ""){	restriction = restriction + " AND wr.bl_id = "+this.literalOrNull(bl_id);	}
		if(wr_id != ""){	restriction = restriction + " AND wr.wr_id = "+this.literalOrNull(wr_id);	}
		if(requestor != ""){	restriction = restriction + " AND wr.requestor = "+this.literalOrNull(requestor);	}
		if(charge_type != ""){	restriction = restriction + " AND wr.charge_type = "+this.literalOrNull(charge_type);	}
		if (eq_id != "") {restriction = restriction + " AND wr.eq_id = "+ this.literalOrNull(eq_id); }
		if (eq_std != "") {restriction = restriction + " AND EXISTS(select 1 from eq where wr.eq_id = eq.eq_id and eq.eq_std="+ this.literalOrNull(eq_std)+" )"; }
		if(cause_type != ""){	restriction = restriction + " AND wr.cause_type = "+this.literalOrNull(cause_type);	}
		if(repair_type != ""){	restriction = restriction + " AND wr.repair_type = "+this.literalOrNull(repair_type);	}	

		if(work_team_id != ""){	restriction = restriction + " AND wr.work_team_id = "+this.literalOrNull(work_team_id);	}
		
		if (prob_cat != "") {
			restriction += " AND exists (select 1 from uc_probcat INNER JOIN probtype on uc_probcat.prob_cat = probtype.prob_cat WHERE probtype.prob_type = wr.prob_type " +
			" AND uc_probcat.prob_cat = "+this.literalOrNull(prob_cat)+") AND wr.prob_type IS NOT NULL";			
		}
		
		if(prob_type != ""){	restriction = restriction + " AND wr.prob_type = "+this.literalOrNull(prob_type);	}
		if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where wr.bl_id = bl.bl_id and bl.zone_id="+this.literalOrNull(zone_id)+" )";	}
		if(description != "" || description != "%%"){	restriction = restriction + " AND wr.description like "+this.literalOrNull(description);	}
		if(priority != ""){	restriction = restriction + " AND wr.priority = "+this.literalOrNull(priority);	}

		if(inResidence || View.user.role == 'UC-DSRES') {
			restriction = restriction + " AND wr.bl_id IN ('BR','CA','CD','GL','IH','KA','NO','OL','RU','YA','VCA','VCB','VCC','VCD','VCE','VCF','VCG','VCH','VCI','VCJ','VCK','VCL','VCM','VCN','VCO','VCP','VCQ','VCR','VCS','VCT','VCU','VCV','VCW','VCX','VCY') ";
		}
		switch(work_type){
			case "Demand":
				restriction = restriction + " AND wr.prob_type <> 'PREVENTIVE MAINT'";
			break;
			case "Preventive":
				restriction = restriction + " AND wr.prob_type = 'PREVENTIVE MAINT'";
			break;
		}

		switch(assigned_to_cf){
			case "No":
				restriction = restriction + " AND NOT EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id)";
			break;
			case "Yes":
				restriction = restriction + " AND EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id)";
			break;
		}

		if(cf_id != "") {
			restriction += " AND (EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id AND wrcf.cf_id = "+this.literalOrNull(cf_id)
				+") OR EXISTS (select 1 from wr_other where wr_other.wr_id = wr.wr_id AND wr.wr_id = wr_other.wr_id AND wr_other.other_rs_type = 'CONTRACTOR' and wr_other.vn_id="
				+this.literalOrNull(cf_id)+"))";
		}
			
        var hrestriction = restriction.replace(/\swr/g, " hwr").replace(/=wr/g, "=hwr");
		this.statusPanel.addParameter("hconsoleRest", hrestriction);
		this.hwrListPanel.addParameter("hconsoleRest", hrestriction);
		disciplineSupervisorManagerController.wrIdList = "";
		this.statusPanel.addParameter("consoleRest", restriction);
		this.wrListPanel.addParameter("consoleRest", restriction);
		this.statusPanel.refresh();
		this.wrListPanel.show(false,true);
		//window.document.getElementById('wrListPanel_divPrevNextTop').style.visibility="hidden"
		//window.document.getElementById('wrListPanel_divPrevNextFooter').style.visibility="hidden"
	},

	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		$('selectbox_tr_id').selectedIndex=0;
		$('selectbox_work_team_id').selectedIndex=0;
		$('selectbox_work_type').selectedIndex=0;
		$('selectbox_assigned_to_cf').selectedIndex=0;
		$('inputbox_desc').value = "";		
		$('prob_cat_input').value = "";		
		$('inResidence').checked = false;
	},


	onSelectStatus: function(row){
		var status = row['wr.wr_status'];
		var restriction = "";
		switch(status){
			case 'Requested':
				restriction = " wr.status='AA'";
			break;
			case 'Issued and in Process':
				restriction = " wr.status='I'";
			break;
			case 'For Re-assignment':
				restriction = " wr.status='RA'";
			break;
			case 'Parts Needed':
				restriction = " wr.status='PN'";
			break;
			case 'On Hold for Parts':
				restriction = " wr.status='HP' ";
			break;
			case 'On Hold for Labor':
				restriction = " wr.status='HL' ";
			break;
			case 'On Hold for Access':
				restriction = " wr.status='HA' ";
			break;
			case 'On Hold for Date':
				restriction = " wr.status='HD' ";
			break;
			case 'Parts Complete':
				restriction = " wr.status='PC' ";
			break;
			case 'Field Work Complete':
				restriction = " wr.status='FWC' ";
			break;
			case 'Complete-More Info Needed':
				restriction = " wr.status='IN' ";
			break;
			case 'Complete-Info Returned':
				restriction = " wr.status='IR' ";
			break;
			case 'Completed': //WR172913
				restriction = " wr.status='Com' ";
			break;
			case 'Overdue (Over 30 days)':
				restriction = "datediff(day,wr.date_assigned,getdate())>30 AND wr.status IN ('AA', 'I', 'HP', 'PN', 'HA', 'HL','HD','RA', 'PC') ";
			break;
			case 'All':
				restriction = "wr.status IN ('AA', 'I', 'PN', 'HP', 'HL', 'HA','HD','RA', 'PC', 'IN', 'FWC') ";
			break;
            case 'Archived':
				restriction = "1=1";
            break;
		}

		disciplineSupervisorManagerController.wrIdList = "";
        if (status == 'Archived') {
            View.panels.get("wrListPanel").show(false);
            View.panels.get("hwrListPanel").refresh(restriction);
            // Hide the "Assigned CF" search in miniconsole
            var element = $('hwrListPanel_filterColumn_wr.assigned_cf');
            if (element != null) {
                element.style.display = 'none';
            }
        }
        else {
            View.panels.get("hwrListPanel").show(false);
		View.panels.get("wrListPanel").refresh(restriction);

		disciplineSupervisorManagerController.wrListPanelhideShowButton(status);

		// Hide the "Assigned CF" search in miniconsole
		var element = $('wrListPanel_filterColumn_wr.assigned_cf');
		if (element != null) {
			element.style.display = 'none';
		}
        }
	},

	wrListPanelhideShowButton: function(status){
		var panel = View.panels.get("wrListPanel");

		var issueRequests = 'issueRequests';
		var assignCF = 'assignCF';
		var createSubReq = 'createSubReq';
		var fieldWorkComplete = 'fieldWorkComplete';
		var sendToCCC = "sendToCCC";
		var returnInformation = 'returnInformation';

		var reIssueRequests = 'reIssueRequests';
		panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118 - added new button for re-issue, only On Hold for Labor, On Hold for Access, Parts Complete and Field work Complete can see this
		panel.actions.get(issueRequests).button.setVisible(true);
		panel.actions.get(assignCF).button.setVisible(true);
		panel.actions.get(createSubReq).button.setVisible(true);
		panel.actions.get(fieldWorkComplete).button.setVisible(true);
		panel.actions.get(sendToCCC).button.setVisible(true);
		panel.actions.get(returnInformation).button.setVisible(true);

		switch(status){
			case 'Requested':
				panel.actions.get(createSubReq).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
			case 'For Re-assignment':
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
				panel.actions.get(sendToCCC).button.setVisible(true);
			break;
			case 'Parts Needed':
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
				panel.actions.get(sendToCCC).button.setVisible(false);
			break;
			case 'Issued and in Process':
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;

			case 'On Hold for Parts':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
				break;
			case 'On Hold for Labor':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(true);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
			break;
			case 'On Hold for Access':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(true);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
			break;
			case 'On Hold for Date':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
				break;
			case 'Parts Complete':
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				break;
			case 'Complete-More Info Needed':
				panel.actions.get(returnInformation).button.setVisible(true);
				panel.actions.get(assignCF).button.setVisible(false);
				panel.actions.get(createSubReq).button.setVisible(true); //2012/06/27 - ASO - WR173261 - enable "Create Sub Request" when in "Complete-More Info Needed" Status
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
			case 'Complete-Info Returned':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(false);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
			case 'Field Work Complete':
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
			break;

			case 'Overdue (Over 30 days)':	break;

			case 'Completed': //WR172913 disable all button except print
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(false);
				panel.actions.get(createSubReq).button.setVisible(false);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
		}

	},

	//setup selectbox for Primary Trade (tr_id)
	setupSelectbox_tr_id: function(){
		//add trades into options
		this.addTrSelectBoxOptionsOptions();
		this.addWorkTeamSelectBoxOptions();
		//default to user's Primary Trade (tr_id)
		//this.setDefaultTrade();
		this.setDefaultWorkTeamId();
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
			//this.consolePanel.setFieldValue("wr.work_team_id", workTeamId);
			var options = $('selectbox_work_team_id').options;
			for(var i = 0; i < options.length; i++){
				if(workTeamId == options[i].value){
					$('selectbox_work_team_id').selectedIndex = i;
					break;
				}
			}
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

	addWorkTeamSelectBoxOptions: function(){
		var records = UC.Data.getDataRecords('work_team', ['work_team.work_team_id'], "");
		this.addSelectBoxOptionsByRecords($('selectbox_work_team_id'),records,'work_team.work_team_id',true);
	},

	consolePanel_onSelectCf:function(){
		var filter = "";
		if (this.consolePanel.getFieldValue("wr.cf_id") != "") {
			filter = "&filter=" + this.consolePanel.getFieldValue("wr.cf_id")
		}

		View.openDialog('uc-select-cf-vn-dialog.axvw?parentPanel=consolePanel&tragetTbl=wr&tragetFld=cf_id'+filter, "", false, {
				closeButton: true,
				maximize: false,
				callback: function(res) {
					/*var clause = res.clauses[2];
					var value = clause.value;
					View.panels.get('exWorkRequest_wrForm').setFieldValue('wr.rm_id', value); */
				}
			});
	},

	//------------------------------------------------------------utilities------------------------------------------------------------
	//generic method to add options into the selectbox
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

	onViewRequest: function(row) {
		var wr_id = row['wr.wr_id'];

		var detailsAxvw = "uc-ds-wr-manager-details.axvw?wrId="+wr_id;
// 2012/10 - DC - added to handle vehicle request.
		var prob_type = row['wr.prob_type'];
		var work_team = row['wr.work_team_id'];

		if(work_team=="FLEET"){
			detailsAxvw = "uc-ds-vehicle-wr-manager-details.axvw?wrId="+wr_id;
		}

		var thisController = disciplineSupervisorManagerController;
		View.openDialog(detailsAxvw, null, null, {
			dialogController: null,

			// This gets called after the dialog views afterRefresh/afterInitialDataFetch.
			afterInitialDataFetch: function(dialogView) {
				// add in the refresh function to the save
			    thisController.dialogController = dialogView.controllers.get('managerDetailsController');
			    thisController.dialogController.addedAfterSave = false;
			    thisController.addAfterSaveFunction();
			}
		});
	},

	addAfterSaveFunction: function() {
        var added = disciplineSupervisorManagerController.dialogController.addedAfterSave;
        if (!added) {
            if (disciplineSupervisorManagerController.dialogController.infoTabController != null) {
                disciplineSupervisorManagerController.dialogController.addedAfterSave = true;
                var form = this.dialogController.infoTabController.nav_details_info;
                var thisDialogController = disciplineSupervisorManagerController.dialogController;
                var refreshFunc = function() {
                    thisDialogController.infoTabController.origAfterSaveWorkflow();
                    disciplineSupervisorManagerController.wrListPanelAfterSaveRefresh();
                };
                thisDialogController.infoTabController.origAfterSaveWorkflow =  disciplineSupervisorManagerController.dialogController.infoTabController.afterSaveWorkflow;
                thisDialogController.infoTabController.afterSaveWorkflow = refreshFunc;
            }
            else {
                setTimeout(function() {disciplineSupervisorManagerController.addAfterSaveFunction()}, 1000);
            }
        }
    },
	onViewRequestArchived: function(row) {
		var wr_id = row['wr.wr_id'];
		var detailsAxvw = "uc-wr-manager-hwr-details.axvw?wrId="+wr_id;
		var prob_type = row['wr.prob_type'];
		var work_team = row['wr.work_team_id'];
		if(work_team=="FLEET"){
			detailsAxvw = "uc-ds-vehicle-hwr-manager-details.axvw?wrId="+wr_id;
		}
		var thisController = disciplineSupervisorManagerController;
		View.openDialog(detailsAxvw, null, null, {
	
		});
	},
	wrListPanelAfterSaveRefresh: function() {
		var selectedRecords = this.wrListPanel.getSelectedRecords();

		// Create a list of the selected wr_ids
		var arrayLength = selectedRecords.length;
		for (var i = 0; i < arrayLength; i++) {
			if ( disciplineSupervisorManagerController.wrIdList != "" ) {
				disciplineSupervisorManagerController.wrIdList += ",";
			}
			disciplineSupervisorManagerController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
		}

		var oldRestriction = disciplineSupervisorManagerController.wrListPanel.restriction;
		//alert(oldRestriction);
		var newRestriction = oldRestriction;
		if (arrayLength != 0) {
			newRestriction = "("+oldRestriction+") OR wr_id IN ("+disciplineSupervisorManagerController.wrIdList+")";
		}
		disciplineSupervisorManagerController.wrListPanel.refresh(newRestriction);

		// reselect wr's
		var gridData = disciplineSupervisorManagerController.wrListPanel.gridRows;
		var gridLength = gridData.length;
		for (var i = 0; i < arrayLength; i++) {
			var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
			for (var j = 0 ; j < gridLength; j++ ) {
				if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
					gridData.items[j].select();
					break;	// found, continue to find the next selected.
				}
			}
		}
	},

	wrListPanel_onIssueRequests: function() {
		var success = false;

		var woList = new Array();
		var subReqList = new Array();

		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "AA" state
			if (selectedRecords[i].getValue("wr.status") != "AA") {
				View.showMessage("Not all selected records are in the Requested status.");
				return false;
			}

			if (selectedRecords[i].getValue("wr.ac_id") == "") {
				View.showMessage("Not all selected records have account codes assigned.");
				return false;
			}

			// check if it's a subrequest.  If subrequest.  issue separately using IssueWorkRequest workflow
			if (selectedRecords[i].getValue("wr.activity_log_id") == "" && selectedRecords[i].getValue('wr.prob_type') != 'PREV MAINT') {
				subReqList.push(selectedRecords[i].getValue("wr.wr_id"));
			}
			else {
				woList.push({"wr.wo_id":selectedRecords[i].getValue("wr.wo_id")});
			}
		}

		if (woList.length == 0 && subReqList.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		// Issue the selected work orders
		var result = {};
		try {
			View.openProgressBar("Issuing Requests. Please wait...");

			// Save audit and issue
			if (!this.saveWrAuditValues(selectedRecords,"I")) {
				//View.showMessage("Failed to save audit records.  Please contact an Adminstrator");
				success = false;
				return success;
			}

			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkOrders', woList);

			// Issue the sub requests.
			for (var i = 0; i < subReqList.length; i++) {
				var parameters = {
					'wr.wr_id':subReqList[i]
				};

				Workflow.call('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkRequest', parameters);
			}


			this.afterIssueRequests(selectedRecords);
			success = true;
		} catch (e) {
			View.closeProgressBar();
		  if (e.code == 'ruleFailed') {
			  View.showMessage(e.message);
		  } else{
			  Workflow.handleError(e);
		  }
		}


		View.closeProgressBar();
		return success;
	},

	afterIssueRequests: function(selectedRecords) {
		View.panels.get('statusPanel').refresh();
		View.confirm("Do you want to print the Issued requests?", function(button) {
			if (button=='yes') {
				printCtrl.onPrintButtonPush("Preview");
			}

			// Create a list of the selected wr_ids
			var arrayLength = selectedRecords.length;
			for (var i = 0; i < arrayLength; i++) {
				if ( disciplineSupervisorManagerController.wrIdList != "" ) {
					disciplineSupervisorManagerController.wrIdList += ",";
				}
				disciplineSupervisorManagerController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
			}

			// Refresh grid with selectedRecords still highlighted.
			var oldRestriction = disciplineSupervisorManagerController.wrListPanel.restriction;
			//alert(oldRestriction);
			var newRestriction = oldRestriction;
			if (arrayLength != 0) {
				newRestriction = "("+oldRestriction+") OR wr_id IN ("+disciplineSupervisorManagerController.wrIdList+")";
			}
			disciplineSupervisorManagerController.wrListPanel.refresh(newRestriction);

			// reselect wr's
			var gridData = disciplineSupervisorManagerController.wrListPanel.gridRows;
			var gridLength = gridData.length;
			for (var i = 0; i < arrayLength; i++) {
				var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
				for (var j = 0 ; j < gridLength; j++ ) {
					if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
						gridData.items[j].select();
						break;	// found, continue to find the next selected.
					}
				}
			}
		});
	},

	wrListPanel_onAssignCF: function() {
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		this.assignPanel.refresh(null, true);
		this.assignPanel.show(true, true);
		this.assignPanel.showInWindow({
			width: 500,
			height: 300,
			newRecord: true,
			closeButton: false
        });

	},

	assignPanel_assignToSelect: function() {
		var assign_type = $('assign_cf_type').value;
		var title = "";
		var selectTableName = "";
		var selectFieldNames = "";
		var visibleFieldNames = "";
        var sortFields = null;

		switch(assign_type){
			case "Contractor":
				title = "Select Contractor";
				selectTableName = 'vn';
				selectFieldNames = ['vn.vn_id'];
				visibleFieldNames = ['vn.vn_id','vn.company','vn.vendor_type'];
			break;
			case "Craftsperson":
				title = "Select Craftsperson";
				selectTableName = 'cf';
				selectFieldNames = ['cf.cf_id'];
				visibleFieldNames = ['cf.cf_id','cf.work_team_id','cf.tr_id'];
				sortFields = toJSON([{fieldName : "cf.work_team_id"},{fieldName : "cf.cf_id"}]);
			break;
			default:
			return;
		}

		View.selectValue({
			formId: 'assignPanel',
			title: title,
			fieldNames: ['wrcf.cf_id'],
			selectTableName: selectTableName,
			selectFieldNames: selectFieldNames,
			visibleFieldNames: visibleFieldNames,
			applyFilter: true,
            sortValues: sortFields
		});
	},

	assignPanel_onAssignCF: function() {
		var assign_type = $('assign_cf_type').value;
		var assignTo = this.assignPanel.getFieldValue("wrcf.cf_id");
		var comments = this.assignPanel.getFieldValue("wrcf.comments");

		if (assignTo == "") {
			View.showMessage("No Assigned To selected.");
			return false;
		}

		// Get all the wr_id from the selectedRecords and assign the crafts or contractor.
		var wrListPanel = View.panels.get("wrListPanel");
		var selectedRecords = wrListPanel.getSelectedRecords();

		var dataSource = null;
		var saveRecord = null;
		var wrfieldName = "";

		switch(assign_type){
		case "Contractor":
			if (comments == "") {
				View.showMessage("Description is required when assigning Contractors");
				return false;
			}

			wrfieldName = "wr_other.wr_id";
			dataSource = View.dataSources.get("wrother_add_ds");
			newRecord = dataSource.getDefaultRecord();
			newRecord.setValue("wr_other.other_rs_type", "CONTRACTOR");
			newRecord.setValue("wr_other.qty_used", 1);
			newRecord.setValue("wr_other.vn_id", assignTo);
			newRecord.setValue("wr_other.fulfilled", 1);
			newRecord.setValue("wr_other.description", comments);
		break;
		case "Craftsperson":
			wrfieldName = "wrcf.wr_id";
			dataSource = View.dataSources.get("wrcf_add_ds");
			newRecord = dataSource.getDefaultRecord();
			newRecord.setValue("wrcf.cf_id", assignTo);
			newRecord.setValue("wrcf.entry_type", "Assignment");
		break;
		default:
		return false;
		}

		View.openProgressBar("Assigning Craftsperson/Contractor. Please wait...");
		try {
			// Save each new wrcf/wr_other record
			for (var i = 0; i < selectedRecords.length; i++) {
				var wr_id = selectedRecords[i].getValue("wr.wr_id");
				newRecord.oldValues = [];
				newRecord.isNew = true;
				newRecord.setValue(wrfieldName, wr_id);
				dataSource.saveRecord(newRecord);
			}
		}
		catch (ex) {
			if(ex.message != undefined)
				View.showMessage(ex.message); //give a more detail message
			else
				View.showMessage(ex);
		}
		View.closeProgressBar();

		this.afterAssignCF(selectedRecords);

		this.statusPanel.refresh();
		this.assignPanel.closeWindow();
		return true;
	},

	afterAssignCF: function(selectedRecords) {
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		var allAA = true;
		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "AA" state
			if (selectedRecords[i].getValue("wr.status") != "AA") {
				allAA = false;
				break;
			}
		}

		if (allAA) {
			View.confirm("Do you want to Issue the requests?", function(button) {
				if (button == 'yes') {
					disciplineSupervisorManagerController.wrListPanel_onIssueRequests();
				}

				disciplineSupervisorManagerController.afterAssignCFPrint(selectedRecords);
			});
		}
		else {
			disciplineSupervisorManagerController.afterAssignCFPrint(selectedRecords);
		}

	},

	afterAssignCFPrint: function(selectedRecords) {
		View.confirm("Do you want to print the Assigned requests?", function(button) {
			if (button=='yes') {
				printCtrl.onPrintButtonPush("Preview");
			}

			// Create a list of the selected wr_ids
			var arrayLength = selectedRecords.length;
			for (var i = 0; i < arrayLength; i++) {
				if ( disciplineSupervisorManagerController.wrIdList != "" ) {
					disciplineSupervisorManagerController.wrIdList += ",";
				}
				disciplineSupervisorManagerController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
			}

			// Refresh grid with selectedRecords still highlighted.
			var oldRestriction = disciplineSupervisorManagerController.wrListPanel.restriction;
			var newRestriction = oldRestriction;
			if (arrayLength != 0) {
				newRestriction = "("+oldRestriction+") OR wr_id IN ("+disciplineSupervisorManagerController.wrIdList+")";
			}
			disciplineSupervisorManagerController.wrListPanel.refresh(newRestriction);

			// reselect wr's
			var gridData = disciplineSupervisorManagerController.wrListPanel.gridRows;
			var gridLength = gridData.length;
			for (var i = 0; i < arrayLength; i++) {
				var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
				for (var j = 0 ; j < gridLength; j++ ) {
					if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
						gridData.items[j].select();
						break;	// found, continue to find the next selected.
					}
				}
			}
		});
	},

	assign_cf_type_onchange: function() {
		var assign_type = $('assign_cf_type').value;

		switch(assign_type){
		case "Contractor":
			this.assignPanel.showField("wrcf.comments", true);
		break;
		case "Craftsperson":
			this.assignPanel.showField("wrcf.comments", false);
		break;
		default:
		return false;
		}
	},

	wrListPanel_onCreateSubReq: function() {
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		this.subReqFormPanel.show(true, true);
		this.subReqFormPanel.showInWindow({
			width: 500,
			height: 400,
			newRecord: true,
			closeButton: true
        });
	},

	subReqFormPanel_onSubmit: function() {
		// Copy and check logic taken from uc-wr-subrequest-create view.
		var wrListPanel = View.panels.get("wrListPanel");
		var dataSource = View.dataSources.get("subreq_add_ds");
		var selectedRecords = wrListPanel.getSelectedRecords();

		try {
			for (var i = 0; i < selectedRecords.length; i++) {
				var newRecord = new Ab.data.Record();
				var wr_id = selectedRecords[i].getValue("wr.wr_id");
				var wo_id = selectedRecords[i].getValue("wr.wo_id");
				newRecord.oldValues = [];
				newRecord.isNew = true;

				// Visible fields
				newRecord.setValue('wr.requestor', this.subReqFormPanel.getFieldValue("wr.requestor"));
				newRecord.setValue('wr.priority', this.subReqFormPanel.getFieldValue("wr.priority"));
				newRecord.setValue('wr.date_assigned', this.subReqFormPanel.getFieldValue("wr.date_assigned"));
				newRecord.setValue('wr.phone', this.subReqFormPanel.getFieldValue("wr.phone"));

				// description
				var origDesc = selectedRecords[i].getValue('wr.description');
				var parentId = "Parent Request ID: WR#" + wr_id + "\r\n";
				var newDesc = "REASON FOR SUB-REQUEST: " + replaceLF(this.subReqFormPanel.getFieldValue('subwrcomments')) + "\r\n\r\n" + parentId + origDesc;
				newRecord.setValue('wr.description', newDesc);

				// hidden Fields
				newRecord.setValue('wr.tr_id', "CCC");
				newRecord.setValue('wr.status', "AA");
				newRecord.setValue('wr.site_id', selectedRecords[i].getValue("wr.site_id"));
				newRecord.setValue('wr.bl_id', selectedRecords[i].getValue("wr.bl_id"));
				newRecord.setValue('wr.fl_id', selectedRecords[i].getValue("wr.fl_id"));
				newRecord.setValue('wr.rm_id', selectedRecords[i].getValue("wr.rm_id"));
				newRecord.setValue('wr.location', selectedRecords[i].getValue("wr.location"));
				newRecord.setValue('wr.block_id', selectedRecords[i].getValue("wr.block_id"));
				newRecord.setValue('wr.unit_id', View.panels.get('subReqFormPanel').getFieldValue('wr.unit_id'));
				newRecord.setValue('wr.charge_type', selectedRecords[i].getValue("wr.charge_type"));
				newRecord.setValue('wr.prob_type', selectedRecords[i].getValue("wr.prob_type"));
				newRecord.setValue('wr.supervisor', selectedRecords[i].getValue("wr.supervisor"));
				newRecord.setValue('wr.manager', selectedRecords[i].getValue("wr.manager"));
				newRecord.setValue('wr.work_team_id', 'CCC');
				newRecord.setValue('wr.activity_type', selectedRecords[i].getValue("wr.activity_type"));
				newRecord.setValue('wr.eq_id', selectedRecords[i].getValue("wr.eq_id"));
				newRecord.setValue('wr.dv_id', selectedRecords[i].getValue("wr.dv_id"));
				newRecord.setValue('wr.dp_id', selectedRecords[i].getValue("wr.dp_id"));
				newRecord.setValue('wr.ac_id', selectedRecords[i].getValue("wr.ac_id"));
				newRecord.setValue('wr.prob_type', selectedRecords[i].getValue("wr.prob_type"));
				newRecord.setValue('wr.charge_type', selectedRecords[i].getValue("wr.charge_type"));
				newRecord.setValue('wr.serv_window_start', selectedRecords[i].getValue("wr.serv_window_start"));
				newRecord.setValue('wr.serv_window_end', selectedRecords[i].getValue("wr.serv_window_end"));

				//parse account code
				//if the Internal starts with FMD then replace it with FMD000000
				var acct = selectedRecords[i].getValue("wr.ac_id");
				//business unit
				var position = 0;
				var mark = acct.indexOf('-', position);
				var bu = acct.substring(position, mark);
				//fund
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var fund= acct.substring(position, mark);
				//dept
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var dept= acct.substring(position, mark);
				//account
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var account= acct.substring(position, mark);
				//program
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var program= acct.substring(position, mark);
				//internal
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var internal= acct.substring(position, mark);
				//project
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var project= acct.substring(position, mark);
				//affiliate
				position=mark+1;
				var affiliate= acct.substring(position);

				//If FMD is found in the internal replace with FMD000000
				if (internal.indexOf('FMD') != -1)
				{
					internal="FMD000000";
				}

				acct = bu + "-" + fund + "-" + dept + "-" + account + "-" + program + "-" + internal + "-" + project + "-" + affiliate;
				uc_psAccountCode(bu,fund,dept,account,program,internal,project,affiliate,'doNothing',0);
				newRecord.setValue('wr.ac_id', acct);

				var retRecord = dataSource.saveRecord(newRecord);

				// Attach new wr to the wo via wf.
				var wr_records = [{"wr.wr_id": retRecord.getValue('wr.wr_id')}];
				var result = {};
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-assignWrToWo', wr_records, wo_id);
			}

			this.subReqFormPanel.closeWindow();
			View.showMessage("Subrequests Created.");
		}
		catch (e) {
			Workflow.handleError(e);
		}
	},

	wrListPanel_onFieldWorkComplete: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Field Work Complete Requests. Please wait...");

		var dataSource = View.dataSources.get("subreq_add_ds");
		


		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "I" && status != "HL" && status != "HP" && status != "PC" && status != "HD") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "FWC");

			var wr_id = selectedRecords[i].getValue("wr.wr_id");
			var fwcCount = selectedRecords[i].getValue('wr.fwc_count');
		
			//We are using Totalcound -1 below since the status is not updated until the email is sent and the page reloads
			var totalCount = (selectedRecords[i].getValue('wr.total_count')) - 1;	

			var workTeamId = selectedRecords[i].getValue('wr.work_team_id');
			
			var sendToEmail = this.getEmailForEm(selectedRecords[i].getValue("wr.requestor"));
			
			var wo_id = selectedRecords[i].getValue('wr.wo_id');
			
			var mainReqRest = "wr_id = (SELECT MIN(wr_id) FROM wr t WHERE t.wo_id = "+wo_id+")";
			
			var mainRequestor = this.getEmailForEm(UC.Data.getDataValue('wr','requestor', mainReqRest));
			var mainWRID = UC.Data.getDataValue('wr','wr_id', mainReqRest);
			/* Converted to use SLA workflows
			var updateRecord = new Ab.data.Record();

			updateRecord.isNew = false;
			updateRecord.setValue('wr.wr_id',wr_id);
			updateRecord.setValue('wr.status',"FWC");
			updateRecord.oldValues = {};
			updateRecord.oldValues["wr.wr_id"]  = wr_id;

			dataSource.saveRecord(updateRecord);
            */

			var recordValues = {};
			recordValues["wr.wr_id"] = wr_id;
			recordValues["wr.status"] = selectedRecords[i].getValue("wr.status"); // workflow need to update something.

			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, "FWC");
				success = true;
				this.sendEmailOnFWC(mainWRID, mainRequestor, fwcCount, totalCount, workTeamId);														
				
			} catch(e){
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				   Workflow.handleError(e);
				}
			}			
		}
		
		alert("Field Work Completed "+selectedRecords.length+" work request(s)");
		
		this.statusPanel.refresh();
		this.wrListPanel.refresh();
		View.closeProgressBar();
	},

	// *****************************************************************************************
	// Sends an email to the requestor when the work request is marked as Field Work Complete.
	//
	// Note: Send Email to original requestor of the Work Order and not the Work Request
	// when the ticket is marked as FWC (no open
	//       requests).  If all sub-requests completed send email to requestor of the work order.
	// ******************************************************************************************
	sendEmailOnFWC: function(thisWrId, thisWrEmail, fwcCount1, totalCount1, workTeamId1) {
		var sendEmail = false;

		if (fwcCount1 == totalCount1) {
			
			sendEmail = true;
		}
		else {

			sendEmail = false;
		}

		if (sendEmail && thisWrEmail != null) {
						
			var sendTo = thisWrEmail;			
						
			// Email requestor
			//alert("Sending Email to "+sendTo);

			try {
				if (workTeamId1 == 'RESIDENCE') {
					var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
					'UC_RESIDENCE_FWC_BODY','UC_RESIDENCE_FWC_SUBJECT','wr','wr_id',thisWrId,
					'', sendTo);
				}
				else {
					var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
					'UC_WRMANAGER_FWC_BODY','UC_WRMANAGER_FWC_SUBJECT','wr','wr_id',thisWrId,
					'', sendTo);
				}
			}
			catch (ex) {
			}
		}
	},

	// ************************************************************************
	// Retrieves the email address of emId from the database.
	// ************************************************************************
	getEmailForEm: function(emId) {
		var rest = "em_id = '"+emId.replace(/\'/g, "''")+"'";
		var email = UC.Data.getDataValue("em", "email", rest);
		return email;
	},

	wrListPanel_onReturnInformation: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Return Information Requests. Please wait...");

		var dataSource = View.dataSources.get("subreq_add_ds");

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "IN") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "IR");

			var wr_id = selectedRecords[i].getValue("wr.wr_id");
			var updateRecord = new Ab.data.Record();

			updateRecord.isNew = false;
			updateRecord.setValue('wr.wr_id',wr_id);
			updateRecord.setValue('wr.status',"IR");
			updateRecord.oldValues = {};
			updateRecord.oldValues["wr.wr_id"]  = wr_id;

			dataSource.saveRecord(updateRecord);

			/* No Need for Workflow, just save.
			var recordValues = {};
			recordValues["wr.wr_id"] = wr_id;
			recordValues["wr.eq_id"] = selectedRecords[i].getValue("wr.eq_id"); // workflow need to update something.

			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, "FWC");
				success = true;
			} catch(e){
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				   Workflow.handleError(e);
				}
			}
			*/
		}

		this.statusPanel.refresh();
		this.wrListPanel.refresh();
		View.closeProgressBar();
	},
















	wrListPanel_onSendToCCC: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "AA" && status != "I" && status != "HL" && status != "HP" && status != "HD" && status != "PC" && status != "RA") {
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
// 2012/10 - DC - added to handle vehicle request.
			var prob_type = selectedRecords[i].getValue("wr.prob_type");
			var work_team = selectedRecords[i].getValue("wr.work_team_id");
			if (work_team == "FLEET") {
				View.showMessage("One or more selected records are Vehicle Repair requests. Vehicle Repair requests cannot be returned to CCC");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			var assigned_cf = selectedRecords[i].getValue("wr.assigned_cf");
			if (assigned_cf != "")  {
				var thisController = this;
				View.confirm("One or more selected records have Craftsperson assigned.  Continue sending requests back to CCC?", function(button) {
					if (button == "yes") {
						thisController.sendToCCCPanel.show(true, true);
						thisController.sendToCCCPanel.showInWindow({
							width: 400,
							height: 400,
							newRecord: true,
							closeButton: false
						});
					}
				});
				return false;
			}
		}

		this.sendToCCCPanel.show(true, true);
		this.sendToCCCPanel.showInWindow({
			width: 400,
			height: 400,
			newRecord: true,
			closeButton: false
        });
	},

	sendToCCCPanel_onSendToCCCReturn: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Sending Requests back to CCC. Please wait...");

		var dataSource = View.dataSources.get("subreq_add_ds");

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "AA" && status != "I" && status != "HL" && status != "HP" && status != "HD" && status != "PC" && status != "RA") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		// cf notes
		var reasonComments = replaceLF(this.sendToCCCPanel.getFieldValue('wr.cf_notes'));

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "AA", "CCC", "CCC");

			var origDesc = selectedRecords[i].getValue('wr.cf_notes');

			var currentUser = View.user.name;		// use View.user.employee.name for the em name instead.
			var currentDate = new Date();
			var dateString = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1)
				+ "/" + currentDate.getDate();

			//Parse the hours to get the correct time.
			var curr_hour = currentDate.getHours();
			var am_pm = "";
			if (curr_hour < 12) {
				am_pm = "AM";
			}
			else {
				am_pm = "PM";
			}
			if (curr_hour == 0) {
				curr_hour = 12;
			}
			if (curr_hour > 12) {
				curr_hour = curr_hour - 12;
			}

			// add leading 0 to minutes if needed.
			var curr_min = currentDate.getMinutes();
			curr_min = curr_min + "";
			if (curr_min.length == 1) {
				curr_min = "0" + curr_min;
			}

			var timeString = curr_hour + ":" + curr_min + " " + am_pm;

			var newDesc = origDesc + "\r\n\r\n" + currentUser + " - " + dateString + "-" + timeString + ": RETURNED TO CCC - REASON: " + reasonComments ;

			var wr_id = selectedRecords[i].getValue("wr.wr_id");
			var tr_id = selectedRecords[i].getValue("wr.tr_id");
			var updateRecord = new Ab.data.Record();

			updateRecord.isNew = false;
			updateRecord.setValue('wr.wr_id',wr_id);
			updateRecord.setValue('wr.status',"AA");
			updateRecord.setValue('wr.tr_id', tr_id);
			updateRecord.setValue('wr.work_team_id', "CCC");
			updateRecord.setValue('wr.cf_notes', newDesc);
			updateRecord.oldValues = {};
			updateRecord.oldValues["wr.wr_id"]  = wr_id;

			//bh set ac_id to "" if the user is not a CCC
			//if(View.user.role != 'UC-CSC') {
			//	updateRecord.oldValues["wr.ac_id"]="1"
			//	updateRecord.setValue('wr.ac_id', "");
			//}



			dataSource.saveRecord(updateRecord);
		}

		this.statusPanel.refresh();
		this.wrListPanel.refresh();
		View.closeProgressBar();

		this.sendToCCCPanel.closeWindow();
	},

	saveWrAuditValues: function(selectedRecords, newStatus, newTrade, newWorkTeam) {
		for (var i = 0; i < selectedRecords.length; i++) {
			if (!this.saveWrAuditValue(selectedRecords[i], newStatus, newTrade, newWorkTeam)) {
				return false;
			}
		}

		return true;
	},

	saveWrAuditValue: function(record, newStatus, newTrade, newWorkTeam) {
		var trade = (newTrade == null) ? record.getValue('wr.tr_id') : newTrade;
		var workteam = (newWorkTeam == null) ? record.getValue('wr.work_team_id') : newWorkTeam;
		
		var parameters = {
				'user_name': View.user.employee.id,
				'wr_id': record.getValue('wr.wr_id'),
				'newValues': toJSON( {'wr.status': newStatus,
									  'wr.tr_id': trade,
									  'wr.work_team_id': workteam})
		};

		var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
		if (result.code != 'executed') {
				Workflow.handleError(result);
				return false;
		}

		return true;
	},

	/*WR173118 - add new function to re-issue wr */
	wrListPanel_onReIssueRequests: function() {
		var success = false;

		var selectedRecords = this.wrListPanel.getSelectedRecords();

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the On Hold for Labor (HL), On Hold for Access (HA), Parts Complete(PC) and Field work Complete (FWC)state
			var status = selectedRecords[i].getValue("wr.status");
			if ( (status != "HL") && (status != "HA") && (status != "PC") && (status != "FWC") ){
				View.showMessage("Not all selected records are in the On Hold for Labor, On Hold for Access, Parts Complete or Field work Complete status.");
				return false;
			}
			if (selectedRecords[i].getValue("wr.ac_id") == "") { //make sure ac_id already exists
				View.showMessage("Not all selected records have account codes assigned.");
				return false;
			}
		}

		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return false;
		}

		try {
			View.openProgressBar("Re-Issuing Requests. Please wait...");
			// re-issue each selected record 1 by 1
			for (var i = 0; i < selectedRecords.length; i++) {
				var result = {};
				var wrObject = new Object();
				var wr_id = "";
				var issueStatus = "I";
				// Save audit and issue
				if (!this.saveWrAuditValue(selectedRecords[i],issueStatus)) {
					//View.showMessage("Failed to save audit records.  Please contact an Adminstrator");
					success = false;
					return success;
				}
				wr_id = selectedRecords[i].getValue("wr.wr_id");
				wrObject["wr.wr_id"] = wr_id;
				wrObject["wr.status"] = selectedRecords[i].getValue("wr.status");
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', wrObject, issueStatus);
			}

			View.closeProgressBar();
			this.afterIssueRequests(selectedRecords);
			success = true;
		} catch (e) {
			View.closeProgressBar();
			if (e.code == 'ruleFailed') {
				View.showMessage(e.message);
			} else{
				Workflow.handleError(e);
			}
		}

		return success;
	},
	//Opens the Room Info Panel from Grid View
	//wrListPanel_RmInfo_onClick: function(row, action) {
	getRmInfo: function(row) {
			//alert(action);
			//var request = row.getRecord();
			var bl_id = row['wr.bl_id'];
			var fl_id = row['wr.fl_id'];
			var rm_id = row['wr.rm_id'];
			//var room = row.getValue("wr.rm_id");
			//alert(request.getValue("wr.bl_id"));
			var args = new Object ();
			args.width = 1000;
			args.height = 700;
			args.closeButton = true;
			//var myDlgCmd = new Ab.command.openDialog(args);
			var r = new Ab.view.Restriction();
			//r.addClause("rm.bl_id", request.getValue("wr.bl_id"), "=", true);
			//r.addClause("rm.fl_id", request.getValue("wr.fl_id"), "=", true);
			//r.addClause("rm.rm_id", request.getValue("wr.rm_id"), "=", true);
			r.addClause("rm.bl_id", bl_id, "=", true);
			r.addClause("rm.fl_id", fl_id, "=", true);
			r.addClause("rm.rm_id", rm_id, "=", true);
			View.openDialog('uc-rm-info.axvw', r, false, args);
		/*
			var restriction = "?blId="+this.nav_details_info.getFieldValue("wr.bl_id") +
				"&flId="+this.nav_details_info.getFieldValue("wr.fl_id") +
				"&rmId="+this.nav_details_info.getFieldValue("wr.rm_id");
			window.open('uc-rm-info.axvw'+restriction, 'newWindow',
				'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
		*/
	},

	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	}
});

// *****************************************************************************
// Replaces lone LF (\n) with CR+LF (\r\n)
// *****************************************************************************
function replaceLF(value)
{
	String.prototype.reverse = function () {
		return this.split('').reverse().join('');
	};

	return value.reverse().replace(/\n(?!\r)/g, "\n\r").reverse();
}

function daysBetween(firstDay, secondDay) {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate());
    var two = new Date(secondDay.getFullYear(), secondDay.getMonth(), secondDay.getDate());

    // Do the math.
    var millisecondsPerDay = 86400000;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
}


function autoRefreshPanels()
{
	refreshPanels();
	refreshTimeoutID = setTimeout("autoRefreshPanels()", dsManagerRefreshInterval);
}

function selectProbCat(){
	View.selectValue('consolePanel', '',
						['prob_cat_input'],
						'uc_probcat',
						['uc_probcat.prob_cat'],
						['uc_probcat.prob_cat', 'uc_probcat.description'],
						null, onChangeProbCat, true, true);
}

function onChangeProbCat(fieldName,selectedValue,previousValue){
	//if (selectedValue != previousValue) {
	//	afterSelectProblemType("wr.prob_type", "");
	//}

	document.getElementById(fieldName).value = selectedValue;

	return true;
}

function selectProbType(){
	var probCat = document.getElementById("prob_cat_input").value;
	
	var rest = '';
	if (probCat != '') {
		rest = "probtype.prob_cat ='" + probCat + "'";
	}

	View.selectValue('consolePanel', '',
						['wr.prob_type', 'prob_cat_input'],
						'probtype',
						['probtype.prob_type', 'probtype.prob_cat'],
						['probtype.prob_type', 'probtype.prob_cat'],
						rest, onChangeProbType, true, true);
}

function onChangeProbType(fieldName,selectedValue,previousValue){
	if (fieldName == "wr.prob_type") {
		View.panels.get("consolePanel").setFieldValue("wr.prob_type", selectedValue);
	} else if (fieldName == "prob_cat_input") {
		document.getElementById(fieldName).value = selectedValue;
	}

	return true;
}
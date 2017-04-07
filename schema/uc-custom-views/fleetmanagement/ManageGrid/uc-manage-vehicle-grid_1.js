// CHANGE LOG:
// 2015/12/04 - MSHUSSAI - updated user permissions in order to allow UC_FLEETMANAGER and UC-SYSADMIN roles to edit Vehicle Description and Comments

var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
var vehicleClassLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}<br/>{1}",
        textColor : "#000000", defaultValue : "", raw : false };
var labelClassLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };


var vehicleCreateBasicController = View.createController("vehicleBasicController", {
	quest : null,
	currentStatus: null,
	
	afterViewLoad: function() {
	
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

		BRG.UI.setNameField('haz_doc_span', this.vehicle_details, 'vehicle.haz_doc','<span style="color:#FF0000;">(if applicable)</span>')
		BRG.UI.setNameField('ins_peril_span', this.vehiclerisk_details, 'vehicle.cost_ins_perils','<span style="color:#FF0000;">(excluding Windshield)</span>')
		BRG.UI.setNameField('ins_prem_span', this.vehiclerisk_details, 'vehicle.cost_ins_premium','<span style="color:#FF0000;">(July 1 - June 30)</span>')

		getEquipmentDetails();

	},

	afterInitialDataFetch: function() {
		this.vehicleManagementTabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
	//	var selectBox = $("vehicle_details_vehicle.status");
		var selectBox = $("vstatus");
		selectBox.remove(selectBox.length - 1)
		this.disableTabs();

	},
	
	schedulegrid_afterRefresh: function() {

		this.schedulegrid.gridRows.each(function(row) {
			var record = row.getRecord();
			
			var status = record.getValue('uc_fleetmaintsched.status');
			var cell1 = row.cells.get('createWRButton');
			var cell2 = row.cells.get('ScheduleButton');
			
			//var action1 = ;
			var action1=row.actions.get('createWRButton');
			var action2=row.actions.get('ScheduleButton');
			
			//cell1.column.enabled="false";
			//cell1.column.text="Create WRabc";
			//var a=1;
			
			switch (status) {
				case "WR":
				case "S":
				case "R":
					action1.enabled=false;
					action1.hidden=true;
					//cell1.dom.setStyle('visibility', 'hidden');
					//Ext.get(cell1.dom).setStyle('visibility', 'hidden');
					action2.enabled=false;
					action2.hidden=true;
					//row.actions.get('ScheduleButton').enabled=false;
					//Ext.get(cell2.dom).setStyle('visibility', 'hidden');
					break;
				case "Sch":
					action1.enabled=true;
					action1.hidden=false;
					action2.enabled=false;
					action2.hidden=true;
					//row.actions.get('ScheduleButton').enabled=false;
					break;
				default:
					action1.enabled=true;
					action1.hidden=false;
					action2.enabled=true;
					action2.hidden=false;
					//row.actions.get('ScheduleButton').enabled=true;
			}
			
			
		
		});
	
	
	
	
	},

	beforeTabChange: function(tabPanel, selectedTabName, newTabName){
		if (newTabName == "scheduleTab") {

			this.schedulegrid.gridRows.each(function(row) {
				var record = row.getRecord();
			
				var status = record.getValue('uc_fleetmaintsched.status');
				var cell1 = row.cells.get('createWRButton');
				var cell2 = row.cells.get('ScheduleButton');
				
				//var action1 = ;
				var action1=row.actions.get('createWRButton');
				var action2=row.actions.get('ScheduleButton');
				
				//cell1.column.enabled="false";
				//cell1.column.text="Create WRabc";
				//var a=1;
				
				switch (status) {
					case "WR":
					case "S":
					case "R":
						action1.enabled=false;
						action1.hidden=true;
						//cell1.dom.setStyle('visibility', 'hidden');
						//Ext.get(cell1.dom).setStyle('visibility', 'hidden');
						action2.enabled=false;
						action2.hidden=true;
						//row.actions.get('ScheduleButton').enabled=false;
						//Ext.get(cell2.dom).setStyle('visibility', 'hidden');
						break;
					case "Sch":
						action1.enabled=true;
						action1.hidden=false;
						action2.enabled=false;
						action2.hidden=true;
						//row.actions.get('ScheduleButton').enabled=false;
						break;
					default:
						action1.enabled=true;
						action1.hidden=false;
						action2.enabled=true;
						action2.hidden=false;
						//row.actions.get('ScheduleButton').enabled=true;
				}
			
				
			});
		}
	
	

    },

	showVehicle: function(row) {
		var rest = "vehicle.vehicle_type_id='" + row['vehicle_type.vehicle_type_id'].replace(/'/g, "''") + "'"
		vehicleCreateBasicController.vehicle_drilldown.refresh(rest);
		vehicleCreateBasicController.vehicle_details.show(false);
		vehicleCreateBasicController.vehiclerisk_details.show(false);
		vehicleCreateBasicController.doc_grid.show(false);
		vehicleCreateBasicController.additionalDocsGrid.show(false);
		vehicleCreateBasicController.pms_grid.show(false);
		vehicleCreateBasicController.disableTabs();
	},
	vehicle_type_drilldown_onRefresh: function(){
		this.vehicle_type_drilldown.refresh();
		this.vehicle_drilldown.show(false);
		this.vehicle_details.show(false);
		this.vehiclerisk_details.show(false);;
		this.doc_grid.show(false);
		this.additionalDocsGrid.show(false);
		this.pms_grid.show(false);
		this.disableTabs();
	},
	vehicle_drilldown_onVehicle_addNew : function(){
		this.vehicle_details.refresh(null,true);
		this.eq_details.refresh(null,true);
		this.doc_grid.show(false);
		this.additionalDocsGrid.show(false);
		this.pms_grid.show(false);
		setInsertFlag()
		this.vehicleManagementTabs.disableTab('riskMGRTab');
		this.vehicleManagementTabs.disableTab('docsTab');
	},

	disableTabs: function(){

	},

	veh_search_onActionSearchBarcode: function(){
		// get the barcode from the inputbox.
		var vehCode = this.veh_search.getFieldValue("vehicle.vehicle_id");

		this.vehicle_drilldown.refresh("vehicle_id = '"+vehCode.replace(/'/g, "''")+"'");
	},


	vehicle_details_afterRefresh: function() {
		var status = this.vehicle_details.getFieldValue("vehicle.status");
		this.vehicle_details.setFieldValue("vstatus",status);
		var q_id = 'FLEET - VEHICLE SAFETY';
		//this.quest = new Ab.questionnaire.Quest(q_id, 'vehicle_details', !(View.user.role=='UC_FLEETMANAGER' || View.user.role=='UC-SYSDEV'));

		BRG.UI.addNameField('vehicle_type_info', this.vehicle_details, 'vehicle.vehicle_type_id', 'vehicle_type', ['description','class_id'], {'vehicle_type.vehicle_type_id' : 'vehicle.vehicle_type_id'}, vehicleClassLabelConfig);
		BRG.UI.addNameField('perm_em', this.vehicle_details, 'vehicle.em_id', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.em_id'}, emNameLabelConfig);
		BRG.UI.addNameField('org_contact_info', this.vehicle_details, 'vehicle.org_contact', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.org_contact'}, emNameLabelConfig);
		BRG.UI.addNameField('org_admin_info', this.vehicle_details, 'vehicle.org_admin', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.org_admin'}, emNameLabelConfig);
		BRG.UI.addNameField('budget_owner_info', this.vehicle_details, 'vehicle.budget_owner', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.budget_owner'}, emNameLabelConfig);
		BRG.UI.addNameField('inspected_by_info', this.vehicle_details, 'vehicle.inspected_by', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.inspected_by'}, emNameLabelConfig);
		BRG.UI.addNameField('disposal_requestor_info', this.vehicle_details, 'vehicle.disposal_requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.disposal_requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('disposal_authorizer_info', this.vehicle_details, 'vehicle.disposal_authorizer', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.disposal_authorizer'}, emNameLabelConfig);
		BRG.UI.addNameField('vn_id_info', this.vehicle_details, 'vehicle.vn_id', 'vn', ['company'], {'vn.vn_id' : 'vehicle.vn_id'}, labelClassLabelConfig);

		loadVehAcctCode(this.vehicle_details.getFieldValue("vehicle.ac_id"));
		
		//update the work request tab
		var eq_details = View.panels.get("eq_details");
		var eq_restriction = {"eq.eq_id":this.vehicle_details.getFieldValue("vehicle.eq_id")};

		eq_details.refresh(eq_restriction, false);
		eq_details.show(true);

		var eq_id = eq_details.getFieldValue("eq.eq_id");
		var wr_grid = View.panels.get("wr_grid");
		var hwr_grid=View.panels.get("hwr_grid");
		
		var wr_where_clause = " and wr.eq_id = '" + eq_id + "'";
		var hwr_where_clause = " and hwr.eq_id = '" + eq_id + "'";
		wr_grid.addParameter("clientRestriction", wr_where_clause);
		hwr_grid.addParameter("clientRestriction", hwr_where_clause);
		
		//wr_grid.refresh();
		//wr_grid.show(true);
		
		
	},



	vehicle_details_beforeSave : function() {
    	// beforeSaveQuestionnaire() adds questionnaire answers to virtual XML field
    	//this.quest.beforeSaveQuestionnaire();
    	return true;
    },

	vehiclerisk_details_afterRefresh: function() {
		BRG.UI.addNameField('vehiclerisk_type_info', this.vehiclerisk_details, 'vehicle.vehicle_type_id', 'vehicle_type', ['description','class_id'], {'vehicle_type.vehicle_type_id' : 'vehicle.vehicle_type_id'}, vehicleClassLabelConfig);
		document.getElementById("old_hazmat_types").value = this.vehiclerisk_details.getFieldValue('vehicle.hazmat_types');
		document.getElementById("old_hazmat_from").value = this.vehiclerisk_details.getFieldValue('vehicle.hazmat_from');
		document.getElementById("old_hazmat_to").value = this.vehiclerisk_details.getFieldValue('vehicle.hazmat_to');
		document.getElementById("vehicle.risk_comments.old").value = this.vehiclerisk_details.getFieldValue('vehicle.risk_comments');
	},

	
	schedulegrid_onScheduleButton: function(row, action) {
		this.schedule_date_popup.setFieldValue('uc_fleetmaintsched.status', "Sch");
		
	},

	schedulegrid_onCreateWRButton: function(row, action) {
		var rowDS = row.getRecord();
		
		var description = UC.Data.getDataValue("pmp", "description", "pmp_id='" + rowDS.getValue('uc_fleetmaintsched.pmp_id') + "'");
		
	
		//build the account code
		var parsed_ac_id = $('vac_id_part1').value + "-" +
				$('vac_id_part2').value + "-" + 
				$('vac_id_part3').value + "-" + 
				$('vac_id_part4').value + "-" + 
				$('vac_id_part5').value + "-" + 
				$('vac_id_part6').value + "-" + 
				$('vac_id_part7').value + "-" + 
				$('vac_id_part8').value;
		parsed_ac_id.replace(" ", "");
		
		
		View.openDialog('uc-vehicle-create-pm-request.axvw', '', true, 
			{
				width: 900,
				height: 450,
				afterViewLoad: function(dialogView) {
				
					
					var createWRController = dialogView.controllers.get('createWRController');
					
					//var createPanel=createWRController.wr_create_details;
					//createWRController.wr_create_details.setFieldValue('activity_log.description', 'abc');
					
					createWRController.wr_create_details.setFieldValue('activity_log.eq_id', View.panels.get("vehicle_details").getFieldValue("vehicle.eq_id"));
					createWRController.wr_create_details.setFieldValue('activity_log.dv_id', View.panels.get("vehicle_details").getFieldValue("vehicle.dv_id"));
					createWRController.wr_create_details.setFieldValue('activity_log.dp_id', View.panels.get("vehicle_details").getFieldValue("vehicle.dp_id"));
					createWRController.wr_create_details.setFieldValue('activity_log.description', description);
					createWRController.wr_create_details.setFieldValue('activity_log.pmp_id', rowDS.getValue('uc_fleetmaintsched.pmp_id'));
					createWRController.wr_create_details.setFieldValue('date_assigned', formatDate(rowDS.getValue('uc_fleetmaintsched.date_scheduled')));
					
					createWRController.wr_create_details.setFieldValue('activity_log.ac_id', parsed_ac_id);
					createWRController.wr_create_details.setFieldValue('activity_log.budget_owner', View.panels.get("vehicle_details").getFieldValue("vehicle.budget_owner"));
					
					createWRController.wr_create_details.setFieldValue('maint_id', rowDS.getValue('uc_fleetmaintsched.maint_id'));
					
				}
			}
		);
	}, 
	
	
	wr_grid_onCreateDemandButton: function() {
	
		View.openDialog('uc-ondemand-fleet-request-create.axvw', '', true, 
			{
				width: 900,
				height: 450,
				afterViewLoad: function(dialogView) {
					
					var createWRController = dialogView.controllers.get('abOndReqCreateController');
					var eq_id= View.panels.get("vehicle_details").getFieldValue("vehicle.eq_id");
					var vehicle_id= View.panels.get("vehicle_details").getFieldValue("vehicle.vehicle_id");
					
					
					
					createWRController.vehicle_form.setFieldValue('vehicle.vehicle_id', View.panels.get("vehicle_details").getFieldValue("vehicle.vehicle_id"));
					createWRController.vehicle_form.setFieldValue('vehicle.eq_id', View.panels.get("vehicle_details").getFieldValue("vehicle.eq_id"));
					createWRController.vehicle_form.setFieldValue('vehicle.loc_vehicle', View.panels.get("vehicle_details").getFieldValue("vehicle.loc_vehicle"));
					createWRController.vehicle_form.setFieldValue('vehicle.budget_owner', View.panels.get("vehicle_details").getFieldValue("vehicle.budget_owner"));
					createWRController.vehicle_form.setFieldValue('vehicle.org_contact', View.panels.get("vehicle_details").getFieldValue("vehicle.org_contact"));
					createWRController.vehicle_form.setFieldValue('vehicle.ac_id', View.panels.get("vehicle_details").getFieldValue("vehicle.ac_id"));

					
					
				}
			}
		);

	},
	


	schedule_date_popup_beforeSave: function() {

		if (this.schedule_date_popup.getFieldValue("uc_fleetmaintsched.date_scheduled")=="") {
			alert("No date set");
			return false;
		}
		
		return true;
		
	},
	
	odometerVehicleDetailsPanel_onOdometer_save: function() {
		//saves odometer value in the vehicle record as well as the odo.
		
		var vehicleID=this.odometerVehicleDetailsPanel.getFieldValue("uc_fleet_odo.vehicle_id");
		
		var odoRestriction = new Ab.view.Restriction();
		odoRestriction.addClause("vehicle.vehicle_id", vehicleID, "=");
		
		var dsOdo = new Ab.data.createDataSourceForFields({
		   id: 'dsOdoSave',
		   tableNames: ['vehicle'],
		   fieldNames: ['vehicle.vehicle_id', 'vehicle.meter','vehicle.date_meter_last_read']
		});
		var record = dsOdo.getRecord(odoRestriction);
		record.setValue("vehicle.meter", this.odometerVehicleDetailsPanel.getFieldValue("uc_fleet_odo.odometer"));
		record.setValue("vehicle.date_meter_last_read", this.odometerVehicleDetailsPanel.getFieldValue("uc_fleet_odo.date_odo"));
		
		
		dsOdo.saveRecord(record);
		
		this.vehicle_details.refresh();
		//View.closeDialog();

		
	},
	
	onViewRequest: function(row) {
		var wr_id=row['wr.wr_id'];
		var detailsAxvw = "uc-ds-vehicle-wr-manager-details.axvw?wrId="+wr_id;
		View.openDialog(detailsAxvw, null, false, {
            width: 1024,
            height: 768
            }
        );
    },
});


function createWRfromSched() {
	alert("Work Request has been created from this schedule.");
}

function scheduleMaint() {
	alert("A dialog will open up allowing you to schedule this.");
}

function getEquipmentDetails() {
	//var row = this;
	// Hidden equipment panel
	var vehicle_details = View.panels.get("vehicle_details");
	var vehicle_restriction = {"vehicle.vehicle_id":vehicle_details.getFieldValue("vehicle.eq_id")};
	var eq_details = View.panels.get("eq_details");
	var eq_restriction = {"eq.eq_id":vehicle_details.getFieldValue("vehicle.eq_id")};

	eq_details.refresh(eq_restriction, false);
	eq_details.show(true);

	
	setUpdateFlag();
}

function getNewEquipmentDetails(eqId) {
	// Hidden equipment panel
	var eq_details = View.panels.get("eq_details");
	var eq_restriction = {"eq.eq_id":eqId};

	eq_details.refresh(eq_restriction, false);
	eq_details.show(true);

	var vehicle_details = View.panels.get("vehicle_details");

	var vehicle_restriction = {"vehicle.eq_id":eqId};

	vehicle_details.refresh(vehicle_restriction, false);
	vehicle_details.show(true);

	// PM Schedule Panel
	var pms_grid = View.panels.get("pms_grid");
	var eq_id = eq_details.getFieldValue("eq.eq_id");

	var where_clause = " and pms.eq_id = '" + eq_id + "'";

	pms_grid.addParameter("clientRestriction", where_clause);
	pms_grid.refresh();
	pms_grid.show(true);


	
	// Risk tab panels
	var vehiclerisk_details = View.panels.get("vehiclerisk_details");
	vehicle_restriction = {"vehicle.vehicle_id":vehicle_details.getFieldValue("vehicle.vehicle_id")};
	vehiclerisk_details.refresh(vehicle_restriction, false);

	if(vehiclerisk_details.getFieldValue("vehicle.cost_ins_perils")!="" && parseFloat(vehiclerisk_details.getFieldValue("vehicle.cost_ins_perils"))!=0){
		document.getElementById('insCheckBox').checked = true;
		vehiclerisk_details.fields.get('vehicle.cost_ins_perils').dom.parentElement.parentElement.style.display='';
	//	vehiclerisk_details.fields.get('vehicle.cost_ins_premium').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.hailstorm_writeoff').dom.parentElement.parentElement.style.display='none';
	//	vehiclerisk_details.fields.get('vehicle.hailstorm_repair').dom.parentElement.parentElement.style.display='none';
	} else {
		document.getElementById('insCheckBox').checked = false;
		vehiclerisk_details.fields.get('vehicle.cost_ins_perils').dom.parentElement.parentElement.style.display='none';
	//	vehiclerisk_details.fields.get('vehicle.cost_ins_premium').dom.parentElement.parentElement.style.display='none';
		vehiclerisk_details.fields.get('vehicle.hailstorm_writeoff').dom.parentElement.parentElement.style.display='';
	//	vehiclerisk_details.fields.get('vehicle.hailstorm_repair').dom.parentElement.parentElement.style.display='';
	}

	if(vehiclerisk_details.getFieldValue("vehicle.hazmat_types")!="") {
		document.getElementById('hazCheckBox').checked = true;
		vehiclerisk_details.fields.get('vehicle.hazmat_types').dom.parentElement.parentElement.style.display='';
	//	vehiclerisk_details.fields.get('vehicle.haz_doc').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.hazmat_from').dom.parentElement.parentElement.style.display='';
	//	vehiclerisk_details.fields.get('vehicle.hazmat_to').dom.parentElement.parentElement.style.display='';
	} else {
		document.getElementById('hazCheckBox').checked = false;
		vehiclerisk_details.fields.get('vehicle.hazmat_types').dom.parentElement.parentElement.style.display='none';
	//	vehiclerisk_details.fields.get('vehicle.haz_doc').dom.parentElement.parentElement.style.display='none';
		vehiclerisk_details.fields.get('vehicle.hazmat_from').dom.parentElement.parentElement.style.display='none';
	//	vehiclerisk_details.fields.get('vehicle.hazmat_to').dom.parentElement.parentElement.style.display='none';
	}

	if(!(View.user.role=='UC_FLEETRISKMANAGER' || View.user.role=='UC-SYSDEV')){
		//alert("disable 3");
		document.getElementById('insCheckBox').disabled = true;
		document.getElementById('hazCheckBox').disabled = true;
		//document.getElementById("vehicle.risk_comments.new").style.display='none';
		document.getElementById("vehicle.risk_comments.old").readOnly = true;
		document.getElementById("vehicle.risk_comments.old").className="defaulteditform_textareaabdata_readonly"
	}

	if(!(View.user.role=='UC_FLEETMANAGER' || View.user.role=='UC-SYSDEV' || View.user.role=='UC_FLEETMANAGER' || View.user.role=='UC-SYSADMIN')){
		//document.getElementById("vehicle.description.new").readOnly = true;
		//document.getElementById("vehicle.description.new").className="defaulteditform_textareaabdata_readonly"
		document.getElementById("vehicle.comments.new").readOnly = true;
		document.getElementById("vehicle.comments.new").className="defaulteditform_textareaabdata_readonly"
	}

	//document.getElementById("vehicle.description.new").value = vehicle_details.getFieldValue("vehicle.description");
	document.getElementById("vehicle.comments.new").value = vehicle_details.getFieldValue("vehicle.comments");
	//document.getElementById("vehicle.risk_comments.new").value = "";
	//document.getElementById("vehicle.risk_comments.old").readOnly = true;

	vehiclerisk_details.show(true);

	// Documents Panels

	var eq_docs = View.panels.get('doc_grid');
	
	docCntrl.docPkey= vehicle_details.getFieldValue("vehicle.vehicle_id");
	rest = "(uc_docs_extension.table_name='"+docCntrl.docTable+"' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "')"
	rest += " or (uc_docs_extension.table_name='wr' and exists (select 1 from wr inner join vehicle on wr.eq_id=vehicle.eq_id where vehicle.vehicle_id = '" +  docCntrl.docPkey+ "' and wr.wr_id=uc_docs_extension.pkey))"
	eq_docs.refresh(rest)

	setUpdateFlag();
}

function setUpdateFlag() {
	$('update_or_insert').value = 'update';
}

function setInsertFlag() {
	$('update_or_insert').value = 'insert';
	//$('vehicle.description.new').value = '';
	$('vehicle.comments.new').value = '';
	$('vehicle.risk_comments.old').value = '';
	//$('vehicle.risk_comments.new').value = '';
}

function showCheckedFields(){
	var vehiclerisk_details = View.panels.get("vehiclerisk_details");
	if(document.getElementById('insCheckBox').checked){
		vehiclerisk_details.fields.get('vehicle.cost_ins_perils').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.cost_ins_premium').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.hailstorm_writeoff').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.hailstorm_repair').dom.parentElement.parentElement.style.display='none';
	} else {
		vehiclerisk_details.fields.get('vehicle.cost_ins_perils').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.cost_ins_premium').dom.parentElement.parentElement.style.display='none';
		vehiclerisk_details.fields.get('vehicle.hailstorm_writeoff').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.hailstorm_repair').dom.parentElement.parentElement.style.display='';
	}
	if(document.getElementById('hazCheckBox').checked){
		vehiclerisk_details.fields.get('vehicle.hazmat_types').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.haz_doc').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.hazmat_from').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.hazmat_to').dom.parentElement.parentElement.style.display='';
	} else {
		vehiclerisk_details.fields.get('vehicle.hazmat_types').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.haz_doc').dom.parentElement.parentElement.style.display='none';
		vehiclerisk_details.fields.get('vehicle.hazmat_from').dom.parentElement.parentElement.style.display='none';
		//svehiclerisk_details.fields.get('vehicle.hazmat_to').dom.parentElement.parentElement.style.display='none';
	}
}

function saveVehicleData() {
	var eq_details = View.panels.get("eq_details");
	var vehicle_details = View.panels.get("vehicle_details");

	vehicle_details.clearValidationResult();

	var status = vehicle_details.getFieldValue("vstatus");
	vehicle_details.setFieldValue("vehicle.status",status);
	//vehicle_details.setFieldValue("vehicle.description",document.getElementById("vehicle.description.new").value);
	vehicle_details.setFieldValue("vehicle.comments",document.getElementById("vehicle.comments.new").value);
	var invalid = "false";

	//UPDATE THE EQ DATA BASED ON THE VEHICLE STATUS
	if(status=='DISP'){
	//	vehicle_details.addInvalidField('vehicle.status','');
		vehicle_details.addInvalidField('vstatus','');
		invalid = "true";
	}
	else if(status=='AVAIL'){eq_details.setFieldValue("eq.status","in");}
	else if(status=='UPRM'){eq_details.setFieldValue("eq.status","rep");}
	else if(status=='URPR'){eq_details.setFieldValue("eq.status","rep");}
	else if(status=='UACC'){eq_details.setFieldValue("eq.status","rep");}
	else if(status=='URTN'){eq_details.setFieldValue("eq.status","out");}
	else if(status=='UOTH'){eq_details.setFieldValue("eq.status","out");}
	else {eq_details.setFieldValue("eq.status","out");}

	var eqId = vehicle_details.getFieldValue('vehicle.eq_id');

	if(invalid=="true"){
		vehicle_details.displayValidationResult();
	} else {

		if(document.getElementById('update_or_insert').value=='update') {

			eq_details.setFieldValue('eq.eq_id',eqId);
			eq_details.setFieldValue('eq.dv_id',vehicle_details.getFieldValue('vehicle.dv_id'));
			eq_details.setFieldValue('eq.dp_id',vehicle_details.getFieldValue('vehicle.dp_id'));
			eq_details.setFieldValue('eq.option1',vehicle_details.getFieldValue('vehicle.mfr_id'));
			eq_details.setFieldValue('eq.option2',vehicle_details.getFieldValue('vehicle.model_id'));
			eq_details.setFieldValue('eq.use1','FLEET VEHICLE');
			eq_details.setFieldValue('eq.eq_std','VEHCL-XXXX-XXXXX');
			eq_details.setFieldValue('eq.meter',vehicle_details.getFieldValue('vehicle.meter'));
			eq_details.setFieldValue('eq.meter_units',vehicle_details.getFieldValue('vehicle.meter_units'));
			eq_details.setFieldValue('eq.comments',vehicle_details.getFieldValue('vehicle.description'));

			if (eq_details.save()) {
				if (!vehicle_details.save()){
					return false
				}
			}
			else {
				return false
			}
		} else if(document.getElementById('update_or_insert').value=='insert') {

			eq_details.refresh({}, true);

			eq_details.setFieldValue('eq.eq_id',vehicle_details.getFieldValue('vehicle.eq_id'));
			eq_details.setFieldValue('eq.dv_id',vehicle_details.getFieldValue('vehicle.dv_id'));
			eq_details.setFieldValue('eq.dp_id',vehicle_details.getFieldValue('vehicle.dp_id'));
			eq_details.setFieldValue('eq.option1',vehicle_details.getFieldValue('vehicle.mfr_id'));
			eq_details.setFieldValue('eq.option2',vehicle_details.getFieldValue('vehicle.model_id'));
			eq_details.setFieldValue('eq.use1','FLEET VEHICLE');
			eq_details.setFieldValue('eq.eq_std','VEHCL-XXXX-XXXXX');
			eq_details.setFieldValue('eq.meter',vehicle_details.getFieldValue('vehicle.meter'));
			eq_details.setFieldValue('eq.meter_units',vehicle_details.getFieldValue('vehicle.meter_units'));
			eq_details.setFieldValue('eq.comments',vehicle_details.getFieldValue('vehicle.comments'));
			eq_details.setFieldValue('eq.bl_id','PP');

			if(eq_details.save()) {
				if(!vehicle_details.save()) {
					eq_details.deleteRecord();
					return false;
				} else {
					getNewEquipmentDetails(eqId);
				}
			} else {
				return false;
			}
		} else {
			View.showMessage("Insert / Update flag not set.");
			return false;
		};
	}
}

function dispVehicle() {
	var eq_details = View.panels.get("eq_details");
	var vehicle_details = View.panels.get("vehicle_details");
	var pms_grid = View.panels.get("pms_grid");
	var eq_docs = View.panels.get('doc_grid');
	//var eq_riskdocs = View.panels.get('eq_riskdocs');
	var vehiclerisk_details = View.panels.get("vehiclerisk_details");
	var vehicle_log_panel = View.panels.get("vehicle_log_panel");
	var vehicle_drilldown = View.panels.get("vehicle_drilldown");



	vehicle_details.clearValidationResult();

	var invalid = "false";

	if(vehicle_details.getFieldValue("vehicle.disposal_no")==""){
		invalid = "true";
		vehicle_details.addInvalidField('vehicle.disposal_no','');
	}
	if(vehicle_details.getFieldValue("vehicle.date_excessed")==""){
		invalid = "true";
		vehicle_details.addInvalidField('vehicle.date_excessed','');
	}
	if(vehicle_details.getFieldValue("vehicle.disposal_requestor")==""){
		invalid = "true";
		vehicle_details.addInvalidField('vehicle.disposal_requestor','');
	}
	if(vehicle_details.getFieldValue("vehicle.disposal_authorizer")==""){
		invalid = "true";
		vehicle_details.addInvalidField('vehicle.disposal_authorizer','');
	}
	if(vehicle_details.getFieldValue("vehicle.date_reg_cancelled")==""){
		invalid = "true";
		vehicle_details.addInvalidField('vehicle.date_reg_cancelled','');
	}
	if(vehicle_details.getFieldValue("vehicle.date_ins_cancelled")==""){
		invalid = "true";
		vehicle_details.addInvalidField('vehicle.date_ins_cancelled','');
	}



	if(invalid=="true") {
		pms_grid.show(false);
		vehicle_details.displayValidationResult();
	} else {

		var message = "The selected vehicle will be sent to archive and no longer available in this view. Are you sure?";
		View.confirm(message, function(button) {
			if (button == 'yes') {
				eq_details.setFieldValue("eq.status","dec");
				vehicle_details.setFieldValue("vehicle.status","DISP");

				if(vehicle_details.save()) {
					eq_details.save();
					vehicleCreateBasicController.checkDisablePMS()
					vehicle_details.show(false);
					pms_grid.show(false);
					eq_details.show(false);
					eq_docs.show(false);
					//eq_riskdocs.show(false);
					vehiclerisk_details.show(false);
					vehicle_log_panel.show(false);
					//vehicle_drilldown.show(false);
					vehicle_drilldown.refresh();
					this.disableTabs();
				} else {
					return false;
				}
			}
		});
	}
}

function saveVehicleRiskData() {
	var vehiclerisk_details = View.panels.get("vehiclerisk_details");
	var vehicle_log_panel = View.panels.get("vehicle_log_panel");
	var invalid = "false";

	vehiclerisk_details.clearValidationResult();

	//var status = vehiclerisk_details.getFieldValue("vehicle.status");
	//var status = vehiclerisk_details.getFieldValue("vstatus");

	if (document.getElementById("old_hazmat_types").value != vehiclerisk_details.getFieldValue('vehicle.hazmat_types') ||
		document.getElementById("old_hazmat_from").value != vehiclerisk_details.getFieldValue('vehicle.hazmat_from') ||
		document.getElementById("old_hazmat_to").value != vehiclerisk_details.getFieldValue('vehicle.hazmat_to'))
	{
		vehicle_log_panel.setFieldValue('uc_vehicle_log.vehicle_id',vehiclerisk_details.getFieldValue('vehicle.vehicle_id'));
		vehicle_log_panel.setFieldValue('uc_vehicle_log.hazmat_types',vehiclerisk_details.getFieldValue('vehicle.hazmat_types'));
		vehicle_log_panel.setFieldValue('uc_vehicle_log.hazmat_from',vehiclerisk_details.getFieldValue('vehicle.hazmat_from'));
		vehicle_log_panel.setFieldValue('uc_vehicle_log.hazmat_to',vehiclerisk_details.getFieldValue('vehicle.hazmat_to'));
		vehicle_log_panel.setFieldValue('uc_vehicle_log.safety_quest',vehiclerisk_details.getFieldValue('vehicle.vehicle_quest'));
		vehicle_log_panel.setFieldValue('uc_vehicle_log.em_id',View.user.name);
		vehicle_log_panel.save();
	}

	if(document.getElementById('insCheckBox').checked){
		if(vehiclerisk_details.getFieldValue('vehicle.cost_ins_perils')=="") {
			invalid = "true";
			vehiclerisk_details.addInvalidField('vehicle.cost_ins_perils', getMessage('costInsPerils'));
		}
		if(vehiclerisk_details.getFieldValue('vehicle.cost_ins_premium')=="") {
			invalid = "true";
			vehiclerisk_details.addInvalidField('vehicle.cost_ins_premium', getMessage('costInsPremium'));
		}
	} else if(!document.getElementById('insCheckBox').checked){
		vehiclerisk_details.setFieldValue('vehicle.cost_ins_perils','');
		vehiclerisk_details.setFieldValue('vehicle.cost_ins_premium','');
		vehiclerisk_details.setFieldValue('vehicle.hailstorm_writeoff','0');
		vehiclerisk_details.setFieldValue('vehicle.hailstorm_repair','0');
	}
	if(document.getElementById('hazCheckBox').checked){
		if(vehiclerisk_details.getFieldValue('vehicle.hazmat_types')=="") {
			invalid = "true";
			vehiclerisk_details.addInvalidField('vehicle.hazmat_types', getMessage('hazmatMaterialsCarried'));
		}
		if(vehiclerisk_details.getFieldValue('vehicle.hazmat_from')=="") {
			invalid = "true";
			vehiclerisk_details.addInvalidField('vehicle.hazmat_from', getMessage('hazmatMaterialsFrom'));
		}
		if(vehiclerisk_details.getFieldValue('vehicle.hazmat_to')=="") {
			invalid = "true";
			vehiclerisk_details.addInvalidField('vehicle.hazmat_to', getMessage('hazmatMaterialsTo'));
		}
	} else if(!document.getElementById('hazCheckBox').checked){
		vehiclerisk_details.setFieldValue('vehicle.hazmat_types','');
		vehiclerisk_details.setFieldValue('vehicle.hazmat_from','');
		vehiclerisk_details.setFieldValue('vehicle.hazmat_to','');
	}

	vehiclerisk_details.setFieldValue("vehicle.risk_comments",document.getElementById("vehicle.risk_comments.old").value);

	if(invalid=="true"){
		vehiclerisk_details.displayValidationResult();
	} else {
		if(vehiclerisk_details.save()) {
			vehicle_log_panel.refresh(null,true);
		} else {
			return false;
		}
	}
}

function saveCloseDialog(){
	var eq_details = View.panels.get("eq_details");
	if(eq_details.save()){
		var openingView = View.getOpenerWindow().View;
		openingView.closeDialog() ;
	}
}

function onChangeInfoOrgContact(){

}

function afterSeletectOrgContact(fieldName, selectedValue, previousValue){
	//alert(selectedValue);
}


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

function emailRiskManager() {
	var vehicle_details = View.panels.get("vehicle_details");

	try {
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
		'UC_FLEET_RISKMGR_NOTIFY_BODY','UC_FLEET_RISKMGR_NOTIFY_SUBJECT','vehicle','vehicle_id',vehicle_details.getFieldValue('vehicle.vehicle_id'),
		'', vehicle_details.getFieldValue('em.email'));
	}
		catch (ex) {
	}

}

function emailFleetManager() {
	var vehiclerisk_details = View.panels.get("vehiclerisk_details");

	try {
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
		'UC_FLEET_FLTMGR_NOTIFY_BODY','UC_FLEET_FLTMGR_NOTIFY_SUBJECT','vehicle','vehicle_id',vehiclerisk_details.getFieldValue('vehicle.vehicle_id'),
		'', vehiclerisk_details.getFieldValue('em.email'));
	}
		catch (ex) {
	}

}

// ************************************************************************
// Checks the Account Code (through PHP) and call the saveFormCallback function
// if successful.  Valid Account codes are automatically inserted into the
// ac table.
// ************************************************************************
function checkAcctAndSave()
{
	//check to see if the ac_id entered is null
	var parsed_ac_id = $('ac_id_part1').value +
				$('ac_id_part2').value +
				$('ac_id_part3').value +
				$('ac_id_part4').value +
				$('ac_id_part5').value +
				$('ac_id_part6').value +
				$('ac_id_part7').value +
				$('ac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is null then save form directly
	if (parsed_ac_id=="") {
		saveFormCallback("");
	}
	else {
		// check account code through php
		uc_psAccountCode(
			$('ac_id_part1').value,
			$('ac_id_part2').value,
			$('ac_id_part3').value,
			$('ac_id_part4').value,
			$('ac_id_part5').value,
			$('ac_id_part6').value,
			$('ac_id_part7').value,
			$('ac_id_part8').value,
			'saveFormCallback');
	}
}

function saveFormCallback(acct)
{
	var success = false;
	var ac_id=acct.replace("\r\n\r\n", "");

	//check to see if the ac_id entered is null
	var parsed_ac_id = $('ac_id_part1').value +
				$('ac_id_part2').value +
				$('ac_id_part3').value +
				$('ac_id_part4').value +
				$('ac_id_part5').value +
				$('ac_id_part6').value +
				$('ac_id_part7').value +
				$('ac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is not null, ensure that the returned ac_id isn't blank.
	if (parsed_ac_id != "" && ac_id == "") {
		ac_id = "0";
	}

	switch(ac_id)
	{
	case "1":
		View.showMessage(getMessage('error_Account1'));	success = false;break;
	case "2":
		View.showMessage(getMessage('error_Account2'));	success = false;break;
	case "3":
		View.showMessage(getMessage('error_Account3'));	success = false;break;
	case "4":
		View.showMessage(getMessage('error_Account4'));	success = false;break;
	case "5":
		View.showMessage(getMessage('error_Account5'));	success = false;break;
	case "6":
		View.showMessage(getMessage('error_Account6'));	success = false;break;
	case "7":
		View.showMessage(getMessage('error_Account7')); success = false;break;
	case "8":
		View.showMessage(getMessage('error_Account8'));	success = false;break;
	case "99":
		View.showMessage(getMessage('error_Account99')); success = false;break;
	case "0":
		View.showMessage(getMessage('error_invalidAccount')); success = false;break;
	default:
		success = true;
	};

	// Set the valid account code
	if (success) {
		View.panels.get("schedule_edit").setFieldValue("pms.ac_id", ac_id);
		vehicleCreateBasicController.schedule_edit_saveForm();
	}
}

function loadAcctCode(acct) {
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
	//mark=acct.indexOf('-',mark+1);
	var affiliate= acct.substring(position);

	$('ac_id_part1').value = bu;
	$('ac_id_part2').value = fund;
	$('ac_id_part3').value = dept;
	$('ac_id_part4').value = account;
	$('ac_id_part5').value = program;
	$('ac_id_part6').value = internal;
	$('ac_id_part7').value = project;
	$('ac_id_part8').value = affiliate;
}

function onPMPChange(){
	var panel = View.panels.get('schedule_edit');
	var records = BRG.Common.getDataRecords("pmp", ["pmp.interval_rec","pmp.interval_type","pmp.pmp_cat"], "pmp.pmp_id='" + panel.getFieldValue('pms.pmp_id').replace(/'/g, "''") +"'") ;
	if (records.length>0){
		record = records[0];
		panel.setFieldValue('pmp.interval_rec', record["pmp.interval_rec"]);
		panel.setFieldValue('pms.interval_1', record["pmp.interval_rec"]);
		panel.setFieldValue('pmp.interval_type', record["pmp.interval_type.raw"]);
		panel.setFieldValue('pms.interval_type', record["pmp.interval_type.raw"]);
		pmpSelValAfterSelect('pmp.pmp_cat',null,record["pmp.pmp_cat"]);
	}
}

function pmpSelValAfterSelect(field_name, selectedValue, prevValue, selectedValueRaw) {
	//if (field_name == 'pms.interval_type') {
		// Fixes Archibus issue where the selected value doesn't change the
		// drop down box.
	//	View.panels.get('schedule_edit').setFieldValue('pms.interval_type', selectedValueRaw);
	//}
	//else
	var panel = View.panels.get('schedule_edit');

	if (field_name == 'pmp.pmp_cat') {
		// if LPM make interval readOnly
		//Something wrong with
		panel.setFieldValue('pms.interval_type', panel.getFieldValue('pmp.interval_type'));
        if (selectedValue == 'LPM') {
			panel.enableField('pms.interval_1', false);
			panel.enableField('pms.interval_type', false);
		}
		else {
			panel.enableField('pms.interval_1', true);
			panel.enableField('pms.interval_type', true);
		}
	}
	else if (field_name == 'pms.interval_1') {
		panel.setFieldValue('pmp.interval_rec', selectedValue);
	}
	else if (field_name == 'pms.interval_type') {
		// Fixes Archibus issue where the selected value doesn't change the
		// drop down box.
		panel.setFieldValue('pmp.interval_type', selectedValueRaw);
	}
}

function mfrOnchange(fieldName, selectedValue, previousValue){
	View.panels.get('vehicle_details').setFieldValue("vehicle.model_id","");
}

function modelOnchange(){
	var model = View.panels.get('vehicle_details').getFieldValue("vehicle.model_id");
	var mfr = "";
	if (model != "") {
		var record = UC.Data.getDataRecord('flt_model', ['flt_model.mfr_id'], "flt_model.model_id='" + model.replace(/'/g, "''") + "'");
		mfr=record['flt_model.mfr_id'].l
	}
	View.panels.get('vehicle_details').setFieldValue("vehicle.mfr_id",mfr);
}

function regType(){
	var pnl = View.panels.get('vehicle_details')
	var val = pnl.getFieldValue("vehicle.occ");
	var rt = "<4,500 kg"
	if (val > 10){
		rt = ">10 Passengers"
	}
	else {
		val = pnl.getFieldValue("vehicle.gvw");
		if (val > 11794) {
			rt = ">11,794 kg"
		}
		else if (val >= 4500) {
			rt = "4,500 to 11,794 kg"
		}
	}
	pnl.setFieldValue("eq.option1",rt);
}



// ************************************************************************
// Checks the Account Code (through PHP) and call the saveFormCallback function
// if successful.  Valid Account codes are automatically inserted into the
// ac table.
// ************************************************************************
var vechicleDetailsSaveType = null;
var K_VECHICLE_SAVETYPE_SAVE = 'save';
var K_VECHICLE_SAVETYPE_NOTIFYRISK = 'notifyRisk';

function checkAcctSaveVehicleData() {
	vehicleDetailsSaveType = K_VECHICLE_SAVETYPE_SAVE;
	checkAcctSaveVehicleDetails();
}

function checkAcctNotifyRiskData() {
	vehicleDetailsSaveType = K_VECHICLE_SAVETYPE_NOTIFYRISK;
	checkAcctSaveVehicleDetails();

}

function checkAcctSaveVehicleDetails()
{
	//check to see if the ac_id entered is null
	var parsed_ac_id = $('vac_id_part1').value +
				$('vac_id_part2').value +
				$('vac_id_part3').value +
				$('vac_id_part4').value +
				$('vac_id_part5').value +
				$('vac_id_part6').value +
				$('vac_id_part7').value +
				$('vac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is null then save form directly
	if (parsed_ac_id=="") {
		saveVehFormCallback("");
	}
	else {
		// check account code through php
		uc_psAccountCode(
			$('vac_id_part1').value,
			$('vac_id_part2').value,
			$('vac_id_part3').value,
			$('vac_id_part4').value,
			$('vac_id_part5').value,
			$('vac_id_part6').value,
			$('vac_id_part7').value,
			$('vac_id_part8').value,
			'saveVehFormCallback');
	}
}

function saveVehFormCallback(acct)
{
	var success = false;
	var ac_id=acct.replace("\r\n\r\n", "");

	//check to see if the ac_id entered is null
	var parsed_ac_id = $('vac_id_part1').value +
				$('vac_id_part2').value +
				$('vac_id_part3').value +
				$('vac_id_part4').value +
				$('vac_id_part5').value +
				$('vac_id_part6').value +
				$('vac_id_part7').value +
				$('vac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is not null, ensure that the returned ac_id isn't blank.
	if (parsed_ac_id != "" && ac_id == "") {
		ac_id = "0";
	}

	switch(ac_id)
	{
	case "1":
		View.showMessage(getMessage('error_Account1'));
		success = false;
		break;
	case "2":
		View.showMessage(getMessage('error_Account2'));
		success = false;
		break;
	case "3":
		View.showMessage(getMessage('error_Account3'));
		success = false;
		break;
	case "4":
		View.showMessage(getMessage('error_Account4'));
		success = false;
		break;
	case "5":
		View.showMessage(getMessage('error_Account5'));
		success = false;
		break;
	case "6":
		View.showMessage(getMessage('error_Account6'));
		success = false;
		break;
	case "7":
		View.showMessage(getMessage('error_Account7'));
		success = false;
		break;
	case "8":
		View.showMessage(getMessage('error_Account8'));
		success = false;
		break;
	case "99":
		View.showMessage(getMessage('error_Account99'));
		success = false;
		break;
	case "0":
		View.showMessage(getMessage('error_invalidAccount'));
		success = false;
		break;
	default:
		success = true;
	};

	// Set the valid account code
	if (success) {
		View.panels.get("vehicle_details").setFieldValue("vehicle.ac_id", ac_id);
		if (!saveVehicleData()) {
			return false;
		}

		if (vehicleDetailsSaveType === K_VECHICLE_SAVETYPE_NOTIFYRISK) {
			emailRiskManager();
		}

		//View.panels.get('vehicle_drilldown').refresh();
		//View.panels.get('vehicle_log_panel').show(false);
		setUpdateFlag();
	}
}

function loadVehAcctCode(acct, panel_id) {
    if (panel_id == null) {
        panel_id = 'vac_id_part';
    }

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
	//mark=acct.indexOf('-',mark+1);
	var affiliate= acct.substring(position);

	$(panel_id+'1').value = bu;
	$(panel_id+'2').value = fund;
	$(panel_id+'3').value = dept;
	$(panel_id+'4').value = account;
	$(panel_id+'5').value = program;
	$(panel_id+'6').value = internal;
	$(panel_id+'7').value = project;
	$(panel_id+'8').value = affiliate;
}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
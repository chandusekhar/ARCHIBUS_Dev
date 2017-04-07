
//  Change Log
//  2010/03/31 - JJYCHAN - Resolves Issue: 27. Checks to see if a valid activity_log.description
//					       has been entered (validateform:function)
//  2010/04/06 - JJYCHAN - Resolves Issue: 50. Reformatted email sent to requestor.
//  2010/05/10 - EWONG - Issue: 129. Clear fl/rm when changing bl, clear dp when changing dv.
//  2010/06/02 - JJYCHAN - Revamped account code checker
//  2010/06/23 - EWONG - Issue: 236. Line Feeds not saving on descriptions.
//  2010/06/30 - EWONG - Issue: 155. Updated email text and moved email composing to separate function.
//  2010/08/11 - JJYCHAN - ISSUE 241 - Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca
//  2011/03/22 - JJYCHAN - Included the WR_ID in the subject header of created emails sent to requestor.
var brgTest = false;
var routingOn = false;

if (/msie/i.test (navigator.userAgent)) //only override IE
{
	document.nativeGetElementById = document.getElementById;
	document.getElementById = function(id)
	{
		var elem = document.nativeGetElementById(id);
		if(elem)
		{
			//make sure that it is a valid match on id
			if(elem.id == id)
			{
				return elem;
			}
			else
			{
				//otherwise find the correct element
				for(var i=1;i<document.all[id].length;i++)
				{
					if(document.all[id][i].id == id)
					{
						return document.all[id][i];
					}
				}
			}
		}
		return null;
	};
}






// *****************************************************************************
// View controller object for the Details tab.
// *****************************************************************************
var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };

var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };

var eqstdConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };
		
var blFlRmSelected=false;

var detailsTabController = View.createController('detailsTabController', {
	probtype: {TRID:"",CT:"",WTI:"",AID:""},
	flrmHousingRest: "bl_id in ('BR','CA','CD','VCA','GL','IH','KA','NO','OL','RU','YA')",
	blCT:"",
	flCT:"",
	blProgram:"",
	blZone:"",
	afterViewLoad: function() {
		this.inherit();

		hideObject("wr_create_details_activity_log.res_building_labelCell");
		hideObject("selectbox_div");
		document.getElementById('selectbox_bl_id').selectedIndex = 0;

	},

	afterInitialDataFetch: function() {
		this.inherit();
		var probCat = View.getOpenerView().brg_selProbCat;
		var probType = View.getOpenerView().brg_selProbType;

		this.wr_create_details.setFieldValue("activity_log.prob_type", probType);


		var parameters = {
			tableName: 'probtype',
			fieldNames: toJSON(['probtype.priority','probtype.description','probtype.tr_id','probtype.charge_type','probtype.work_team_id','probtype.accore_id']),
			restriction: "probtype.prob_type = '" + probType.replace(/'/g, "''") + "'"
		};


		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		var ttl = "";
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			var priority = result.data.records[0]['probtype.priority.raw'];
			ttl = result.data.records[0]['probtype.description']
			this.wr_create_details.setFieldValue("activity_log.probtype", result.data.records[0]['probtype.description']);
	
			this.probtype.TRID = result.data.records[0]['probtype.tr_id'];
			this.wr_create_details.setFieldValue('activity_log.tr_id',this.probtype.TRID);
			this.probtype.CT = result.data.records[0]['probtype.charge_type'];
			this.probtype.WTI = result.data.records[0]['probtype.work_team_id'];
			this.wr_create_details.setFieldValue('activity_log.work_team_id',this.probtype.WTI);
			this.probtype.AID = result.data.records[0]['probtype.accore_id'];
			this.showHideAc();
		}

		var parameters = {
			tableName: 'uc_probcat',
			fieldNames: toJSON(['uc_probcat.description']),
			restriction: "uc_probcat.prob_cat = '" + probCat.replace(/'/g, "''") + "'"
		};

		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			//var priority = result.data.records[0]['probtype.priority'];
			ttl =  result.data.records[0]['uc_probcat.description'] + " - " + ttl
			this.wr_create_details.setFieldValue("activity_log.prob_cat", result.data.records[0]['uc_probcat.description']);
		}
		//this.prefillInfo();
		this.wr_create_details.setTitle(ttl)
	},

	wr_create_details_afterRefresh: function() {
		this.wr_create_details.showField('unit_id_holder', false);
			
		document.getElementById('selectbox_bl_id').selectedIndex = 0;
		BRG.UI.addNameField('requestor_name', this.wr_create_details, 'activity_log.requestor', 'em', ['name_first','name_last','phone','email'],
        {'em.em_id' : 'activity_log.requestor'},
        emNameLabelConfig);

		BRG.UI.addNameField('bl_name', this.wr_create_details, 'activity_log.bl_id', 'bl', 'name',
        {'bl.bl_id' : 'activity_log.bl_id'},
        nameLabelConfig,'');

		BRG.UI.addNameField('eqstd', this.wr_create_details, 'activity_log.eq_id', 'eq', 'eq_std',
        {'eq.eq_id' : 'activity_log.eq_id'},
        eqstdConfig,'');
	},

/*	prefillInfo: function() {
		var emId = View.user.employee.id;

		var parameters = {
			tableName: 'em',
			fieldNames: toJSON(['em.name_first','em.name_last','em.phone']),
			restriction: "em.em_id = '" + emId.replace(/'/g, "''") + "'"
		};

		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			var name_first = result.data.records[0]['em.name_first'];
			var name_last = result.data.records[0]['em.name_last'];
			var phone = result.data.records[0]['em.phone'];
			this.wr_create_details.setFieldValue("activity_log.prob_type", probType);
		}
	},
*/
	// ***************************************************************************
	// Submits the request to Archibus SLA engine
	// ***************************************************************************
	submitRequest: function(sTab) {
		this.sTab = sTab;
		if (this.wr_create_details.getFieldValue('activity_log.work_team_id') == "RESIDENCE" && ($('ac_id_part1').value=="" || $('ac_id_part2').value==""|| $('ac_id_part3').value==""|| $('ac_id_part4').value==""|| $('ac_id_part5').value==""|| $('ac_id_part6').value=="")){
			//set the ac if any of the 1st 6 parts are blank
			document.getElementById("ac_id_part1").value = 'UCALG';
			document.getElementById("ac_id_part2").value = '15';
			document.getElementById("ac_id_part3").value = '54460';
			document.getElementById("ac_id_part4").value = '00000';
			document.getElementById("ac_id_part5").value = account;
			document.getElementById("ac_id_part6").value = 'RES000300';
			document.getElementById("ac_id_part7").value = '';
			document.getElementById("ac_id_part8").value = '';
		}
		if (!brgTest) {
			var test = uc_psAccountCode(
				$('ac_id_part1').value,
				$('ac_id_part2').value,
				$('ac_id_part3').value,
				$('ac_id_part4').value,
				$('ac_id_part5').value,
				$('ac_id_part6').value,
				$('ac_id_part7').value,
				$('ac_id_part8').value,
				'checkForm', '1', 'SINGLE FUNDED');
		} else {
			var brgAc = $('ac_id_part1').value + '-' + $('ac_id_part2').value + '-' + $('ac_id_part3').value + '-' + $('ac_id_part4').value;
			brgAc = brgAc  + '-' + $('ac_id_part5').value + '-' + $('ac_id_part6').value + '-' + $('ac_id_part7').value + '-' + $('ac_id_part8').value;
			//Save ac record first
			if (brgAc != "") {
				var acRecord= new Ab.data.Record();
				acRecord.isNew = true;
				acRecord.setValue('ac.ac_id', brgAc);
				try {
					View.dataSources.get('ds_ac_check').saveRecord(acRecord);
				}
				catch (ex) {
					// already exists
				}
			}
			this.checkForm(brgAc); 
			
		}
        
		
		//alert(test);
	},




	// ***************************************************************************
	// Check and Submit the request to Archibus SLA engine
	// ***************************************************************************
	checkForm: function(acct) {


		if (this.validateForm(acct)) {

			// format the description properly.  convert CR/LF.

			var ds = View.dataSources.get(this.wr_create_details.dataSourceId);
			var record = this.wr_create_details.getRecord();

			var parsedDesc = replaceLF(record.values['activity_log.description']);
			record.values['activity_log.description'] = parsedDesc;

			var recordValues = ds.processOutboundRecord(record).values;

			// get the activity_log_id if it's from a "created" record.
			// Mostly for error checking as it should always be new.
			var activity_log_id = 0;
			var activity_log_id_value = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value
			if ( activity_log_id_value != undefined && activity_log_id_value != '') {
				activity_log_id = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value;
			}

			// Note: Can check for Duplication/Similar requests here.

			var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details);
			var isRES = this.wr_create_details.getFieldValue('activity_log.work_team_id') == "RESIDENCE"
			// Submit Request
			try {
				submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id,submitRecord);
				this.wr_create_details.actions.get("submit").enableButton(false);  // diable the submit button so it doesn't get submitted twice.

				// Switch to next tab after setting the restriction.
				var requestor = recordValues["activity_log.requestor"].replace(/'/g, "''");
				var date_requested = recordValues["activity_log.date_requested"];
				//var rest = "wr_id = (SELECT max(wr_id) FROM wr WHERE requestor='"+requestor+"' and date_requested ='"+date_requested+"')";

				var actLogId = submitResult.data['activity_log_id'];
				//var rest = "wr_id = (SELECT wr_id from wr WHERE activity_log_id= '" + actLogId + "')";
				var rest = "activity_log_id=" + actLogId;
				var wrWTI = '';
				var wrId ='';
				var wrREQ = recordValues["activity_log.requestor"];
				//var wrId = UC.Data.getDataValue('wr', 'wr_id, work_team_id', rest);
				var wrRecord = UC.Data.getDataRecords('wr', ['wr_id', 'work_team_id'], rest);
		

				if (wrRecord != null) {
					wrId =  wrRecord[0]['wr.wr_id'];
					wrWTI = wrRecord[0]['wr.work_team_id'];
				}

				var probType = recordValues["activity_log.prob_type"];
				
				//Check if prob_type = PROJECT
				var isProj = false;
				if (probType == 'PROJECT'){
					isProj = true;
				}
				
				
				
				var isCore = false;
				var isSF = false;
				
				
				// Workaround for Submit Request WF losing CF/LF
				// Save the description again... to both activity_log and wr
				var actLogRecord= new Ab.data.Record();
				actLogRecord.isNew = false;
				actLogRecord.setValue('activity_log.activity_log_id', actLogId);
				actLogRecord.setValue('activity_log.description', parsedDesc);
				actLogRecord.oldValues = new Object();
				actLogRecord.oldValues['activity_log.activity_log_id'] = actLogId;
				View.dataSources.get('ds_activity_log1').saveRecord(actLogRecord);

				var wrRecord= new Ab.data.Record();
				wrRecord.isNew = false;
				var CoreWT = this.probtype.WTI
				//Added logic for post-process SLA
				if (!isProj) {
					wrRecord.setValue('wr.tr_id', this.probtype.TRID);
					
					if (isRES) {
						wrRecord.setValue('wr.charge_type', 'Core-Res');
						wrRecord.setValue('wr.work_team_id', 'RESIDENCE');
					}
					else {

						if (this.probtype.CT == "Single Funding" || this.blCT == "Single Funding" || this.flCT == "Single Funding") {
							wrRecord.setValue('wr.charge_type', 'Single Funding');
							isSF = true;
						} else if (this.probtype.CT == "TBD" || this.blCT == "TBD" || this.flCT == "TBD") {
							wrRecord.setValue('wr.charge_type', 'TBD');
						} else {
							wrRecord.setValue('wr.charge_type', 'Core');
							isCore = true;
						}

						if (!isCore) {
							wrRecord.setValue('wr.work_team_id', 'CCC');
						} else if (wrWTI == 'TBD' && this.probtype.WTI == null) {
							wrRecord.setValue('wr.work_team_id', 'CCC');
							CoreWT = 'CCC'
						} else if (wrWTI == 'TBD' && this.probtype.WTI != null){
							if (CoreWT == "ZONE 0") {
								CoreWT = "ZONE " + this.blZone
							}
							wrRecord.setValue('wr.work_team_id', CoreWT);
						} else {
							CoreWT=wrWTI
							if (CoreWT == "ZONE 0") {
								CoreWT = "ZONE " + this.blZone
							}
							

							
							wrRecord.setValue('wr.work_team_id', CoreWT);
							//code if the want to set the AC based on the problem type's work_team_id when the SLA's work_team_id = 'CCC
							//if (wrWTI != 'CCC') {CoreWT=wrWTI}
							
						}
					}

					var ac = this.wr_create_details.getFieldValue('activity_log.ac_id')
					this.wr_create_details.setFieldValue('activity_log.ac_id',"")

					if (isCore) {
						
						//if CCC leave the account code blank
						//if (CoreWT!='CCC') {
							//Get the work team dp_id
							var rest = "work_team_id = '" + CoreWT.replace(/'/g, "''") + "'";				
							var DPID = UC.Data.getDataValue('work_team', 'dp_id', rest);
							
							DPID = DPID.replace(/\s+$/g, "");
							wrId = wrId.replace(/\s+$/g, "");
							
							//Save ac record first
							var acRecord= new Ab.data.Record();
							acRecord.isNew = true;
							var coreAc = 'UCALG-10-'+DPID+'-'+this.probtype.AID+ '-' + this.blProgram +'-FMD'+wrId+'-00000000-000000'
							acRecord.setValue('ac.ac_id', coreAc);
							View.dataSources.get('ds_ac_check').saveRecord(acRecord);
							wrRecord.setValue('wr.ac_id', coreAc);
					//	}
						
					}
					else if (isSF) {
						if (ac == ""){
							// if the ac is blank ask if they know the ac
							if (!confirm("An account code is required for this request.  If you know the account code to use, click Cancel, add the account code and click Submit.  If you do not know the account code, click OK and we will contact you to determine the account code") ){
								this.wr_create_details.actions.get("submit").enableButton(true);
								return;
							}
						}
						else {
							var acRecord= new Ab.data.Record();
							acRecord.isNew = true;
							acRecord.setValue('ac.ac_id', ac);
                            try {
                                View.dataSources.get('ds_ac_check').saveRecord(acRecord);
                            }
                            catch (ex) {
                                // already exists
                            }
							wrRecord.setValue('wr.ac_id', ac)
						}
					}

					var doc='';
					if(this.sTab=='docs'){
						doc='y'
					}
				

				}

				wrRecord.setValue('wr.wr_id', wrId);
				wrRecord.setValue('wr.description', parsedDesc);
				wrRecord.oldValues = new Object();
				wrRecord.oldValues['wr.wr_id'] = wrId;
				
				
				//********************** TURNS ROUTING OFF ******************************
				if (!routingOn) {
					if (!isRES) {
						wrRecord.setValue('wr.work_team_id', 'CCC');
					}
				}
				//********************** ENDS TURNS ROUTING OFF *************************
				
				
				
				View.dataSources.get('ds_wr_save').saveRecord(wrRecord);

				//if (!isSF) {
                    var viewPanel = View.parentViewPanel;
                    if (viewPanel == null) {
                        viewPanel = View.panels.get('reportDisplayPanel');
                    }
					if (viewPanel == null) { 
						viewPanel =View.getOpenerView().panels.get('reportDisplayPanel');
					}
					
					if(this.sTab=='docs'){
						viewPanel.loadView("uc-wr-create-mwr-report.axvw?doc=y", "wr_id='"+wrId+"'", false);
					} else {
						viewPanel.loadView("uc-wr-create-mwr-report.axvw", "wr_id='"+wrId+"'", false);
					}
				//}

				if(this.sTab=='report'){
				// Email the Requestor

				//JC -----------------------------------------------------------------Turned off temporarily.
				//sendRequestorEmail();
				}
			}
			catch (e) {
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				    Workflow.handleError(e);
				}
			}
		}

	},

	dialog_onClose: function(dialogController) {
		View.showMessage('Dialog window has been closed');
    },

	// ***************************************************************************
	// Validates the form fields before submitting the save to the server.
	//
	// Parameters:
	//   table_name - The table to retrieve the records from.
	//   field_names - The columns to retrieve from table_name.
	//   restriction - (Optional) The restriction to apply to the query.
	//
	//	 acct - The account code that was entered. If valid, it will return the
	//		    the account code, if invalid or blank it will return 0.
	// ***************************************************************************
	validateForm: function(acct) {

		var success = true;


		// Check to see if the description is null
		// 2010/03/31 - JJYCHAN
		var form = View.getControl('', 'wr_create_details');
		var desc = form.getFieldValue('activity_log.description');


		if (desc == "") {
			form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}



		form.setFieldValue('activity_log.description', desc);


		// Check the Account Code - Insert into actual field if valid

		if (this.blCT == "Single Funding" || this.flCT == "Single Funding" || this.probtype.CT == "Single Funding" ||  this.wr_create_details.getFieldValue('activity_log.work_team_id') == "RESIDENCE"){
			//var test = uc_psAccountCode(
			//		'UCALG',
			//		'10',
			//		'62100',
			//		'10005',
			//		'00672',
			//		'CI7029509',
			//		'RT703929',
			//		'CLBAK',
			//		'return_me');

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

			//if parsed is null then change ac_id to null.
			if (parsed_ac_id=="" || parsed_ac_id == "UCALG") {
				var ac_id="";
			}
			else {
				var ac_id=acct.replace("\r\n\r\n", "");
			};

			var ac_rest = "ac_id = '"+ac_id+"'";



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
			};

			if (success)
			{
				if ((ac_id.substr(0,5) == "UCALG") ||
					(ac_id.substr(0,5) == "FHOBO") ||
					(ac_id.substr(0,5) == "ARCTC") ||
					(ac_id == ""))
				{
					this.wr_create_details.setFieldValue('activity_log.ac_id', ac_id);
				}
				else
				{
					View.showMessage(getMessage('error_Account99'));
					success = false;
				};
			};
		}
		//Check the Building Code - Building Code must be entered before request can be created.
		var bl_id = this.wr_create_details.getFieldValue('activity_log.bl_id');
		if (bl_id == "") {
			success = false;
			if (document.getElementById("selectbox_bl_id").value == 'VCA' && document.getElementById("chk_is_res").checked) {
				var unit = this.wr_create_details.getFieldValue('activity_log.unit_id');
				if (unit == "") {
					View.showMessage("Family Housing Unit is required");
				} else {
					View.showMessage("Family Housing Unit does not exist");
				}
			} else {
				View.showMessage("Building Code is required");
			}
		}
		
		return success;
	},

	// ***************************************************************************
	// Retrieves and updates the bl/fl/rm information when changing the eq_id.
	// ***************************************************************************
	
	updateLoc: function() {
		blFlRmSelected = true
		var eqId = this.wr_create_details.getFieldValue('activity_log.eq_id');
		var eqRecord = UC.Data.getDataRecords('eq', ['eq_id', 'bl_id', 'fl_id', 'rm_id'], "eq_id='"+eqId.replace(/'/g, "''")+"'");
		//var blId = UC.Data.getDataRecord('eq', 'bl_id', "eq_id='"+eqId.replace(/'/g, "''")+"'");

		if (eqRecord != null) {
			this.wr_create_details.setFieldValue('activity_log.bl_id', eqRecord[0]['eq.bl_id']);
			this.wr_create_details.setFieldValue('activity_log.fl_id', eqRecord[0]['eq.fl_id']);
			this.wr_create_details.setFieldValue('activity_log.rm_id', eqRecord[0]['eq.rm_id']);
		}
	},	
	

	// *************************************************************************
	// Check to see if the building selected is a res building
	// If it is, set the account code
	//**************************************************************************

	checkResBuilding: function(building) {

		//var building = document.getElementById("selectbox_bl_id").value;


		//var building = this.wr_create_details.getFieldValue('activity_log.bl_id');
		building=building.toUpperCase();


		// GET THE BUILDING ACCOUNT CODE
		var account='00000';
		var internal='000000000';

		if (building != "" ) {
			var buildingRecord = UC.Data.getDataRecord('bl', ['bl_id', 'name', 'program'], "bl_id='"+ building +"'");
			if (buildingRecord != null) {account = buildingRecord['bl.program']['n'];}
		} else {

		}


		if (building == 'BR' ||	building == 'CA' ||	building == 'CD' ||	building == 'GL' ||
				building == 'IH' ||	building == 'KA' ||	building == 'NO' ||	building == 'OL' ||
				building == 'RU' ||	building == 'YA' ||	building == 'VCA' || building == 'VCB' ||
				building == 'VCC' || building == 'VCD' || building == 'VCE' || building == 'VCF' ||	building == 'VCG' || building == 'VCH' || building == 'VCI' || building == 'VCJ' ||
				building == 'VCK' || building == 'VCL' || building == 'VCM' || building == 'VCN' || building == 'VCO' || building == 'VCP' || building == 'VCQ' || building == 'VCR' ||
				building == 'VCS' || building == 'VCT' || building == 'VCU' || building == 'VCV' || building == 'VCW' || building == 'VCX' || building == 'VCY') {
			
			//this.wr_create_details.setFieldValue('activity_log.tr_id','RESIDENCE');
			this.wr_create_details.setFieldValue('activity_log.work_team_id','RESIDENCE');
			this.showHideAc();
			
			
			//internals codes are different depending on the building
			
			switch(building) {
				case 'KA':
					internal='RES000100';
					break;
				case 'RU':
					internal='RES000200';
					break;
				case 'BR':
				case 'CA':
				case 'GL':
				case 'NO':
				case 'OL':
					internal='RES000300';
					break;
				case 'CD':
					internal='RES000400';
					break;
				case 'YA':
					internal='RES000500';
					break;
				case 'IH':
					internal='RES000600';
					break;
				default:
					internal='000000000';
			}
				
			
			
			//var ac_id1 = document.getElementById("ac_id_part1");
			//ac_id1.value = 'UCALG';
			document.getElementById("ac_id_part1").value = 'UCALG';
			document.getElementById("ac_id_part2").value = '15';
			document.getElementById("ac_id_part3").value = '54460';
			document.getElementById("ac_id_part4").value = '00000';
			document.getElementById("ac_id_part5").value = account;
			document.getElementById("ac_id_part6").value = internal;
			document.getElementById("ac_id_part7").value = '';
			document.getElementById("ac_id_part8").value = '';

			document.getElementById("ac_id_part1").disabled = false;
			document.getElementById("ac_id_part2").disabled = false;
			document.getElementById("ac_id_part3").disabled = false;
			document.getElementById("ac_id_part4").disabled = false;
			document.getElementById("ac_id_part5").disabled = false;
			document.getElementById("ac_id_part6").disabled = false;
			document.getElementById("ac_id_part7").disabled = false;
			document.getElementById("ac_id_part8").disabled = false;

		} else {
			//this.wr_create_details.setFieldValue('activity_log.tr_id','CCC');
			this.wr_create_details.setFieldValue('activity_log.work_team_id',this.probtype.WTI);
			this.showHideAc()

			document.getElementById("ac_id_part1").value = 'UCALG';
			document.getElementById("ac_id_part2").value = '';
			document.getElementById("ac_id_part3").value = '';
			document.getElementById("ac_id_part4").value = '';
			document.getElementById("ac_id_part5").value = '';
			document.getElementById("ac_id_part6").value = '';
			document.getElementById("ac_id_part7").value = '';
			document.getElementById("ac_id_part8").value = '';

			document.getElementById("ac_id_part1").disabled = false;
			document.getElementById("ac_id_part2").disabled = false;
			document.getElementById("ac_id_part3").disabled = false;
			document.getElementById("ac_id_part4").disabled = false;
			document.getElementById("ac_id_part5").disabled = false;
			document.getElementById("ac_id_part6").disabled = false;
			document.getElementById("ac_id_part7").disabled = false;
			document.getElementById("ac_id_part8").disabled = false;

		}
	},

	changeResFields: function() {
		
		if (document.getElementById("chk_is_res").checked) {
			addSelectValueRest(this.wr_create_details, "activity_log.fl_id",this.flrmHousingRest);
			addSelectValueRest(this.wr_create_details, "activity_log.rm_id",this.flrmHousingRest);
			this.wr_create_details.showField('activity_log.bl_id', false);
			this.wr_create_details.showField('activity_log.eq_id', false);
			this.wr_create_details.showField('activity_log.unit_id', false);
			this.wr_create_details.showField('activity_log.unit_id2', false);
			//this.wr_create_details.showField('unithidden', false);
			this.wr_create_details.showField('unit_holder', false);

	
			document.getElementById('selectbox_bl_id').selectedIndex = 0;

			document.getElementById("wr_create_details_activity_log.res_building_labelCell").hidden=false;
			showObject("wr_create_details_activity_log.res_building_labelCell");
			document.getElementById("selectbox_bl_id").hidden=false;
			showObject("selectbox_div");



		} else {
			this.wr_create_details.setFieldValue('activity_log.work_team_id',this.probtype.WTI);
			this.showHideAc()
			addSelectValueRest(this.wr_create_details, "activity_log.fl_id","");
			addSelectValueRest(this.wr_create_details, "activity_log.rm_id","");
			this.wr_create_details.showField('activity_log.unit_id', true);
			this.wr_create_details.showField('activity_log.unit_id2', false);
			//this.wr_create_details.showField('unithidden', false);
			this.wr_create_details.showField('unit_holder', true);
			this.wr_create_details.showField('activity_log.bl_id', true);
			this.wr_create_details.enableField('activity_log.bl_id', true);
			this.wr_create_details.showField('activity_log.fl_id', true);
			this.wr_create_details.showField('activity_log.rm_id', true);
			document.getElementById("roomErrorLink").style.display=""
			this.wr_create_details.showField('activity_log.eq_id', true);
			this.wr_create_details.setFieldValue('activity_log.bl_id','');
			document.getElementById('selectbox_bl_id').selectedIndex = 0;


			this.wr_create_details.showField('activity_log.eq_id', true);

			document.getElementById("wr_create_details_activity_log.res_building_labelCell").hidden=true;
			hideObject("wr_create_details_activity_log.res_building_labelCell");
			document.getElementById("selectbox_bl_id").hidden=true;
			hideObject("selectbox_div");

			this.changeBlRes();
		}
	},

	changeBlRes: function() {
		buildingValue = document.getElementById("selectbox_bl_id").value;
		
		if (buildingValue != 'VCA' && document.getElementById("chk_is_res").checked) {
			this.wr_create_details.setFieldValue('activity_log.bl_id', buildingValue);
			this.checkResBuilding(buildingValue);

			//this.wr_create_details.showField('activity_log.bl_id', false);
			this.wr_create_details.showField('activity_log.eq_id', false);
			//this.wr_create_details.showField('res_building', true);
			this.wr_create_details.showField('activity_log.fl_id', true);
			this.wr_create_details.showField('activity_log.rm_id', true);
			document.getElementById("roomErrorLink").style.display=""
			this.wr_create_details.showField('activity_log.unit_id', false);
			this.wr_create_details.showField('activity_log.unit_id2', false);
			//this.wr_create_details.showField('unithidden', false);
			this.wr_create_details.showField('activity_log.blank1', true);
			this.wr_create_details.showField('activity_log.blank2', true);


			this.wr_create_details.setFieldValue('activity_log.fl_id', '');
			this.wr_create_details.setFieldValue('activity_log.rm_id', '');
			this.wr_create_details.setFieldValue('activity_log.eq_id', '');
			this.wr_create_details.setFieldValue('activity_log.block_id', '');
			this.wr_create_details.setFieldValue('activity_log.unit_id', '');
			this.wr_create_details.setFieldValue('activity_log.unit_id2', '');
			
		} else if (document.getElementById("chk_is_res").checked) {
			
			this.wr_create_details.setFieldValue('activity_log.bl_id', '');
			this.wr_create_details.showField('activity_log.bl_id', false);
			this.wr_create_details.showField('activity_log.eq_id', false);
			this.wr_create_details.showField('activity_log.fl_id', false);
			this.wr_create_details.showField('activity_log.rm_id', false);
			document.getElementById("roomErrorLink").style.display="none"
			
			this.wr_create_details.showField('activity_log.unit_id', false);
			this.wr_create_details.showField('activity_log.unit_id2', true);
			//this.wr_create_details.showField('unithidden', true);
			this.wr_create_details.showField('activity_log.blank1', false);
			this.wr_create_details.showField('activity_log.blank2', false);


			this.wr_create_details.setFieldValue('activity_log.fl_id', '');
			this.wr_create_details.setFieldValue('activity_log.rm_id', '');
			this.wr_create_details.setFieldValue('activity_log.eq_id', '');
			this.wr_create_details.setFieldValue('activity_log.block_id', '');
			this.wr_create_details.setFieldValue('activity_log.unit_id', '');
			this.wr_create_details.setFieldValue('activity_log.unit_id2', '');
		
		}
	},

	openRoomReportLink: function() {
			View.openDialog('uc-wr-error-report.axvw', null, true, {
				width: 600,
				height: 600,
				closeButton: true
		});
	},

	setSF:function(fld){
		var bl=this.wr_create_details.getFieldValue('activity_log.bl_id');
		var fl =this.wr_create_details.getFieldValue('activity_log.fl_id');

		if (this.probtype.CT == "Single Funding") {
			return;
		}
		else if (fld=='bl'){
			this.blCT =""
			this.flCT =""
			if (bl!="") {
				var parameters = {
					tableName: 'bl',
					fieldNames: toJSON(['bl.charge_type','bl.program','bl.zone_id']),
					restriction: "bl.bl_id = '" + bl.replace(/'/g, "''") + "'"
				};
				var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
				if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
					this.blCT = result.data.records[0]['bl.charge_type'];
					this.blProgram = result.data.records[0]['bl.program'];
					this.blZone = result.data.records[0]['bl.zone_id'];
				}
			}
		}
		else if (this.blCT == "Single Funding") {
			return;
		}
		else {
			this.flCT =""
			if (bl!="" && fl!="") {
				var parameters = {
					tableName: 'fl',
					fieldNames: toJSON(['fl.charge_type']),
					restriction: "fl.bl_id = '" + bl.replace(/'/g, "''") + "' and fl.fl_id = '" + fl.replace(/'/g, "''") + "'"
				};
				var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
				if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
					this.flCT = result.data.records[0]['fl.charge_type'];
				}
			}
		}
		this.showHideAc()

	},
	showHideAc:function(){
		if (this.blCT == "Single Funding" || this.flCT == "Single Funding" || this.probtype.CT == "Single Funding" || this.wr_create_details.getFieldValue('activity_log.work_team_id') == "RESIDENCE"){
			document.getElementById("wr_create_details_account_code_fld_labelCell").parentElement.style.display=""
		}
		else {
			document.getElementById("wr_create_details_account_code_fld_labelCell").parentElement.style.display="none"
		}
	}
});

/* bh removed use selectBLFlRm instead so it doesn't override the fl and rm code when you pick a fl or rm
// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes on the ActionListener.
//
// ***************************************************************************
function clearDetailsFl_AL(fieldname, previousVal, selectedVal)
{
	if (fieldname == "activity_log.bl_id" && previousVal != selectedVal) {
		var form = View.getControl('','wr_create_details');
		form.setFieldValue('activity_log.fl_id','');
		form.setFieldValue('activity_log.rm_id','');

		detailsTabController.checkResBuilding(previousVal);
		return true;
	}
}


// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes.
// ***************************************************************************
function clearDetailsFl() {
	var form = View.getControl('', 'wr_create_details');
	form.setFieldValue('activity_log.fl_id', '');
	form.setFieldValue('activity_log.rm_id', '');
	detailsTabController.setSF('bl')
	return true;
}


function selectFl() {
	var form = View.getControl('', 'wr_create_details');
	form.setFieldValue('activity_log.rm_id', '');
	detailsTabController.setSF('fl')
	return true;
}
*/
//****************************************************************************
// Changes the view if it's a res building
//****************************************************************************
function res_change() {
	detailsTabController.changeResFields();
}

//****************************************************************************
// Changes bl_id field based on the value of the select box
//****************************************************************************
function changeBl() {
	//alert("Changing Building1");
	detailsTabController.changeBlRes();
}


function selectBLFlRm(fieldName,selectedValue ,previousValue) {
	var form = View.getControl('', 'wr_create_details');
	if (fieldName =='activity_log.bl_id' || (fieldName == 'bl_id' && !blFlRmSelected)) {
		if (fieldName == 'bl_id') {selectedValue = form.getFieldValue('activity_log.bl_id')}
		form.setFieldValue('activity_log.fl_id', '');
		form.setFieldValue('activity_log.rm_id', '');
		detailsTabController.setSF('bl')
		detailsTabController.checkResBuilding(selectedValue);
		if (document.getElementById("chk_is_res").checked) {
			document.getElementById("selectbox_bl_id").value = selectedValue 
		} 
	}
	else {
		if (fieldName =='activity_log.fl_id' ||  (fieldName =='fl_id'  && !blFlRmSelected)) {
			if (fieldName =='activity_log.fl_id') {selectedValue=form.getFieldValue('activity_log.fl_id');}
			form.setFieldValue('activity_log.rm_id', '');
			detailsTabController.setSF('fl')
		}
		else if (fieldName =='activity_log.rm_id') {
			form.setFieldValue('activity_log.rm_id', selectedValue)
			//View.panels.get('wr_create_details').enableField('activity_log.bl_id', false);
		}
		blFlRmSelected = fieldName.split('.').length ==2
	}
	return true;
}


// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes.
// ***************************************************************************
function clearDetailsDp() {
	var form = View.getControl('', 'wr_create_details');
	form.setFieldValue('activity_log.dp_id', '');
	return true;
}


/*function selectFloor() {
	var form = View.getControl('', 'wr_create_details');
	var bl_id = form.getFieldValue('activity_log.bl_id');

	var restriction = "";

	if (bl_id != '') {
		restriction = "fl.bl_id='" + bl_id.replace(/'/g, "''") + "'";
	}

	View.selectValue(
        'wr_create_details',
		'Select Floors',
		['activity_log.bl_id','activity_log.fl_id'],
		'fl',
		['fl.bl_id','fl.fl_id'],
		['fl.bl_id', 'fl.fl_id', 'fl.name'],
		restriction,
		null,
		false,
		false,
		'',
		1000,
		500);
}
*/

function enableField(fieldName,selectedValue,previousValue){
	var wrCreateDetails = View.panels.get('wr_create_details');
	wrCreateDetails.enableField("activity_log.fl_id", true);
	//document.getElementById("wr_create_details_activity_log.fl_id").style.display="block";
	document.getElementById("wr_create_details_activity_log.fl_id").style.visibility="visible";
	var test = 1;

}

// Select form for Room Code
/*
function selectRooms() {
	var form = View.getControl('', 'wr_create_details');



	var bl_id = form.getFieldValue('activity_log.bl_id');
	var fl_id = form.getFieldValue('activity_log.fl_id');

	var restriction = "";


	if (bl_id != '') {
		restriction = "rm.bl_id='" + bl_id.replace(/'/g, "''") + "'" + "AND rm.fl_id LIKE '%" + fl_id + "%'";
	}


	Ab.view.View.selectValue(
        'wr_create_details', 												//form name
		'Room', 															//name of select box
		['activity_log.bl_id', 'activity_log.fl_id', 'activity_log.rm_id'], //fields to fill on form
		'rm',																//table to gather fields
		['rm.bl_id', 'rm.fl_id', 'rm.rm_id'], 								//fields used to fill form
		['rm.bl_id', 'rm.fl_id', 'rm.rm_id','rmtype.description'], 			//fields to display
		restriction,														//restriction
		'', 																//actionListener
		false, 																//applyFilter
		false, 																//showIndex
		'', 																//workflowRuleId
		1000, 																//width
		500,																//height
		null,																//selectvaluetype
		null,																//recordlimit
		 toJSON([{fieldName : "rm.bl_id"},{fieldName : "rm.fl_id"},{fieldName : "rm.rm_id"}]));											//sortfields
}
*/


// Calls the submitRequest function in the controller.
function submitRequest(s)
{

	detailsTabController.submitRequest(s);
}

// Calls the checkForm function in the controller
function checkForm(acct)
{

	detailsTabController.checkForm(acct);
}

// *****************************************************************************
// Send email to the Requestor
// *****************************************************************************
function sendRequestorEmail()
{
	var infoForm = View.getControl('','my_info_form');
	var summaryForm = View.getControl('','wr_create_report');

	var eLocation = summaryForm.getFieldValue('wr.bl_id') + "/" + summaryForm.getFieldValue('wr.fl_id') + "/" + summaryForm.getFieldValue('wr.rm_id');
	var eEq_id = summaryForm.getFieldValue('wr.eq_id');
	var eAc_id = summaryForm.getFieldValue('wr.ac_id');
	var eDescription = summaryForm.getFieldValue('wr.description');

	var eFullName = infoForm.getFieldValue('em.em_id');
	var emRecord = UC.Data.getDataRecord('em', ['em_id', 'name_first', 'name_last'], "em_id='"+infoForm.getFieldValue('em.em_id').replace(/'/g, "''")+"'");

	if (emRecord != null) {
		eFullName = emRecord['em.name_first'] + " " + emRecord['em.name_last'];
	}

	var emailMessage = "<b>* For building-related emergencies such as water leaks, broken glass, and power outages, contact Facilities Management at 403-220-7555, Monday to Friday, 8:00 a.m. to 4:30 p.m. *</b> <br><br>" +
					eFullName + ",<br/><br/>Thank you for contacting us. This is an automated response confirming the receipt of your work request. One of our staff will get back to you as soon as possible. For your records, the details of the ticket are listed below. When contacting us (220-7555) please make sure to refer to this request number.<br>" +
					"<br/><table>";

	emailMessage = emailMessage +
					"<tr><td><b>Ticket ID:</b></td>" +
					"<td>" + summaryForm.getFieldValue('wr.wr_id') +"</td></tr>";

	if (eDescription != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Subject:</b>" +
					"    </td>" +
					"    <td>" +
					eDescription +
					"    </td>" +
					"  </tr>";
	}
	if (eLocation != '') {
		emailMessage = emailMessage +
					"<tr><td><b>Location:</b></td>" +
					"<td>" + eLocation +"</td></tr>";
	}
	if (eAc_id != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Account Code:</b>" +
					"    </td>" +
					"    <td>" +
					eAc_id +
					"    </td>" +
					"  </tr>";
	}
	/*
	if (eEq_id != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Equipment Code:</b>" +
					"    </td>" +
					"    <td>" +
					eEq_id +
					"    </td>" +
					"  </tr>";
	}
	*/

	// Status is always requested.  No need to do 2 extra queries (from wr and afm_flds enum_list).
	emailMessage = emailMessage +
				"<tr><td><b>Status:</b></td>" +
				"<td>Requested</td></tr>";

	emailMessage = emailMessage +
					"</table><br/><br/>You can check the status of your work request online at: <a href='http://afm.ucalgary.ca'>http://afm.ucalgary.ca/</a>."+
					"<br/><br/>Kind regards,<br/>Facilities Management & Development<br/><hr>" +
					"<span style='font-size:0.8em'>* You have received this email because you are listed as the requestor.*<br>" +
					"* Contact afm@ucalgary.ca if you have any questions or for more information.*</span>";

	//alert(emailMessage);

	try {
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_WRCREATE_REQ_BODY','UC_WRCREATE_REQ_SUBJECT','wr','wr_id',summaryForm.getFieldValue('wr.wr_id'),
			'', infoForm.getFieldValue('em.email'));

	}
	catch (ex) {

	}


    /*
	uc_email(infoForm.getFieldValue('em.email'),
			 'afm@ucalgary.ca',
			 '[Automated] Archibus - Your Work Request #[' + summaryForm.getFieldValue('wr.wr_id') + '] has been submitted to FM.'
			 , emailMessage,
			 'standard.template');
    */
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

function openMyInfo() {
	var vw = "uc-my-info.axvw";
	View.openDialog(vw, '', false, {
		width: 550,
		height: 500,
		closeButton: true
	});
}

// *****************************************************************************
// Sets block_id and building id when a unit_id is changed.
// *****************************************************************************
function onUnitIdChange(alias) {
    var blId = "";
    var form = View.panels.get('wr_create_details');
    var unitId = form.getFieldValue('activity_log.unit_id' + alias)
	form.setFieldValue('activity_log.unit_id',unitId);
	form.setFieldValue('activity_log.unit_id' + alias,unitId);

	if (unitId!=""){
		var unitRecord = UC.Data.getDataRecord('unit', ['bl_id', 'block_id', 'unit_id'], "unit_id='"+unitId.replace(/'/g, "''")+"'");
		//bh removed not used plus errors if unitrecord returns nothing
		//var unitAccount = UC.Data.getDataRecord('bl', ['bl_id', 'program'], "bl_id='" + unitRecord['unit.bl_id']['n'] + "'");




		if (unitRecord != null) {
			blId = unitRecord['unit.bl_id']['n'];
			//form.setFieldValue('activity_log.bl_id', unitRecord['unit.bl_id']['n']);
			//form.setFieldValue('activity_log.rm_id', unitRecord['unit.unit_id']['n']);
			form.setFieldValue('activity_log.block_id', unitRecord['unit.block_id']['n']);
			detailsTabController.checkResBuilding(unitRecord['unit.bl_id']['n']);
		}
		else {
			form.setFieldValue('activity_log.block_id', "");
			//form.setFieldValue('activity_log.rm_id', "");
		}
		form.setFieldValue('activity_log.bl_id', unitRecord['unit.bl_id']['n']);
	} else {
		form.setFieldValue('activity_log.block_id', "");
	}
    if (blId == "") {
        form.enableField('activity_log.bl_id', true);
    }
    else {
        form.enableField('activity_log.bl_id', false);
    }
}

/* bh moved code to selectBLFlRm
function onUnitIdSelect(fieldName, selectedValue, previousValue) {
    if (fieldName == "activity_log.bl_id") {
        View.panels.get('wr_create_details').enableField('activity_log.bl_id', false);
    }
}
*/




function hideObject(someID)
{
	var theObj = document.getElementById(someID);
	theObj.style.display='none';
}
function showObject(someID)
{
	var theObj = document.getElementById(someID);
	theObj.style.display='block';
}

function addSelectValueRest(panel, field, rest) {
    var field = panel.fields.get(field);
    var action = field.actions.items[0];
    if (action) { action.command.commands[0].dialogRestriction = rest; }
    return field;
}


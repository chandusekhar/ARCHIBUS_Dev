var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
var vehicleClassLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}<br/>{1}",
        textColor : "#000000", defaultValue : "", raw : false };



var vehicleCreateBasicController = View.createController("vehicleBasicController", {
	quest : null,
	currentStatus: null,
	afterViewLoad: function() {
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		docCntrl.docTable='vehicle';
		docCntrl.docPkeyLabel = ['vehicle','Vehicle','wr','Work Request'];
		docCntrl.docPkey= this.vehicle_details.getFieldValue("vehicle.vehicle_id");
		docCntrl.docPdf=false;
		docCntrl.docAdd=false;
		docCntrl.docEdit=false;
		var sectionLabels = document.getElementsByName("sectionLabels");
		 for (var i = 0, len = sectionLabels.length; i < len; i++) {
					this.removeTextChildNodes(sectionLabels[i]);
					var td = sectionLabels[i].parentNode;
					this.removeTextChildNodes(td);
					var tr = td.parentNode;
					tr.deleteCell(0);
					td.colSpan = 4;
					td.width = '100%';
					td.style.padding = "0px";
		}

		//hide bars in buttons
     	var allButtonSeparators = Ext.DomQuery.select("*[class = ytb-sep]");
	    for (var i=0; i< allButtonSeparators.length; i ++ )
	       allButtonSeparators[i].style.display = "none";

		//vehiclerisk_details.getElementField('vehicle.haz_doc')

			//setNameField: function(id, panel, fieldName, nameTable, nameField, restrictValues, configObj)

		BRG.UI.setNameField('haz_doc_span', this.vehicle_details, 'vehicle.haz_doc','<span style="color:#FF0000;">(if applicable)</span>')
		BRG.UI.setNameField('ins_peril_span', this.vehiclerisk_details, 'vehicle.cost_ins_perils','<span style="color:#FF0000;">(excluding Windshield)</span>')
		BRG.UI.setNameField('ins_prem_span', this.vehiclerisk_details, 'vehicle.cost_ins_premium','<span style="color:#FF0000;">(July 1 - June 30)</span>')


	},

	afterInitialDataFetch: function() {
	//	var selectBox = $("vehicle_details_vehicle.status");
		var selectBox = $("vstatus");
		this.pms_grid.show(false);
		selectBox.remove(selectBox.length - 1)
		this.disableTabs();

	},

/* 	vehicle_details_onPrint: function() {
	    document.getElementById("sectionLabels1").style.display = "inline";
		var oContent1 = frames["vehicle_details_form"].innerHTML;
	    document.getElementById("sectionLabels1").style.display = "none";
		//You can manipulate the content here or with the styles
		var oIframe = frames["print_iframe"]

	    if( oIframe.document ) {
			oIframe.document.body.innerHTML = ""; //Chrome, IE
		}else {
			oIframe.contentDocument.body.innerHTML = ""; //FireFox
		}

		var oDoc1
		if (oIframe.document) oDoc1 = oIframe.document;
		this.getPrintTxt(oDoc1,oContent1)

		var browser=navigator.appName;
		if ((browser=="Microsoft Internet Explorer")) {
			oIframe.document.execCommand('print', false, null);
		} else {
			oIframe.print();
		}

		this.print.show(false);

	}, */

	vehicle_details_onPrint: function() {
		var oIframe = frames["print_iframe"]
		var browser=navigator.appName;
		if ((browser=="Microsoft Internet Explorer")) {
				oIframe.document.execCommand('print', false, null);
			} else {

			oIframe.print();
		}
	},

	getPrintTxt: function(oDoc1,oContent1){
		//var title=this.pnl.title
		var styles = []  //used if you need to set a style for printing i.e. hiding a component
		//oDoc1.write("<head><title style='font-size:18;'>" + title + "</title>");
		oDoc1.write("<head><title style='font-size:18;'>Vehicle Report</title>");

		oDoc1.write("<STYLE TYPE='text/css'>");
		for (var y = 0; y < styles.length; y++) {
			oDoc1.write(styles[y]);
		}
		oDoc1.write("</STYLE>");
		var stylesheets = Ext.select("link").elements
		//Add or adjust any print style
		for (var s = 0; s < stylesheets.length; s++) {
			if (stylesheets[s].type == "text/css") {
				oDoc1.write("<LINK href='" + stylesheets[s].href + "' type=text/css rel=stylesheet>");
			}
		}

		oDoc1.write("</head><body onLoad='this.focus();'>");

		oDoc1.write(oContent1);
		oDoc1.write("</body>");
		return oDoc1
	},

	showVehicle: function(row) {
		var rest = "vehicle.vehicle_type_id='" + row['vehicle_type.vehicle_type_id'].replace(/'/g, "''") + "'"
		vehicleCreateBasicController.vehicle_drilldown.refresh(rest);
		vehicleCreateBasicController.vehicle_details.show(false);
		vehicleCreateBasicController.vehiclerisk_details.show(false);
		vehicleCreateBasicController.doc_grid.show(false);
		vehicleCreateBasicController.pms_grid.show(false);
		vehicleCreateBasicController.disableTabs();
	},
	vehicle_type_drilldown_onRefresh: function(){
		this.vehicle_type_drilldown.refresh();
		this.vehicle_drilldown.show(false);
		this.vehicle_details.show(false);
		this.vehiclerisk_details.show(false);;
		this.doc_grid.show(false);
		this.pms_grid.show(false);
		this.disableTabs();
	},
	vehicle_drilldown_onVehicle_addNew : function(){
		this.vehicle_details.refresh(null,true);
		this.eq_details.refresh(null,true);
		this.doc_grid.show(false);
		this.pms_grid.show(false);
		setInsertFlag()
		this.vehicleManagementTabs.disableTab('riskMGRTab');
		this.vehicleManagementTabs.disableTab('docsTab');
	},

	disableTabs: function(){
		this.vehicleManagementTabs.disableTab('fleetMGRTab');
		this.vehicleManagementTabs.disableTab('riskMGRTab');
		this.vehicleManagementTabs.disableTab('docsTab');
	},

	veh_search_onActionSearchBarcode: function(){
		// get the barcode from the inputbox.
		var vehCode = this.veh_search.getFieldValue("vehicle.vehicle_id");

		this.vehicle_drilldown.refresh("vehicle_id = '"+vehCode.replace(/'/g, "''")+"'");
	},


	vehicle_details_afterRefresh: function() {
		this.print.show(false);
		var status = this.vehicle_details.getFieldValue("vehicle.status");
		this.vehicle_details.setFieldValue("vstatus",status);
		var q_id = 'FLEET - VEHICLE SAFETY';
		this.quest = new Ab.questionnaire.Quest(q_id, 'vehicle_details', !(View.user.role=='UC_FleetManager' || View.user.role=='UC-SYSDEV'));
	    document.getElementById("sectionLabels1").style.display = "none";
	    document.getElementById("vehicle_details_field_gen0_labelCell").style.display = "none";

		BRG.UI.addNameField('vehicle_type_info', this.vehicle_details, 'vehicle.vehicle_type_id', 'vehicle_type', ['description','class_id'], {'vehicle_type.vehicle_type_id' : 'vehicle.vehicle_type_id'}, vehicleClassLabelConfig);
		BRG.UI.addNameField('org_contact_info', this.vehicle_details, 'vehicle.org_contact', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.org_contact'}, emNameLabelConfig);
		BRG.UI.addNameField('org_admin_info', this.vehicle_details, 'vehicle.org_admin', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.org_admin'}, emNameLabelConfig);
		BRG.UI.addNameField('budget_owner_info', this.vehicle_details, 'vehicle.budget_owner', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.budget_owner'}, emNameLabelConfig);
		BRG.UI.addNameField('inspected_by_info', this.vehicle_details, 'vehicle.inspected_by', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.inspected_by'}, emNameLabelConfig);
		BRG.UI.addNameField('disposal_requestor_info', this.vehicle_details, 'vehicle.disposal_requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.disposal_requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('disposal_authorizer_info', this.vehicle_details, 'vehicle.disposal_authorizer', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'vehicle.disposal_authorizer'}, emNameLabelConfig);

		//this.replaceDisabledEnumFields('vehicle.color','vehicle.drive_type','vehicle.transmission');
	    vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vstatus').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.color').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.drive_type').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.transmission').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.occ').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.engine').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.meter_units').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.avail_fdo').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.condition').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.hailstorm_writeoff').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.hailstorm_repair').dom]);
		vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle.condition').dom]);

	    document.getElementById("vehicle.description.new").style.background="transparent";
	    document.getElementById("vehicle.description.new").style.overflow="hidden";
	    document.getElementById("vehicle.description.new").style.border="none";

		document.getElementById("vehicle.comments.new").style.background="transparent";
	    document.getElementById("vehicle.comments.new").style.overflow="hidden";
	    document.getElementById("vehicle.comments.new").style.border="none";

		document.getElementById("vehicle.risk_comments.old").style.background="transparent";
	    document.getElementById("vehicle.risk_comments.old").style.overflow="hidden";
	    document.getElementById("vehicle.risk_comments.old").style.border="none";

		document.getElementById("vehicle_details_vehicle.po_doc").style.background="transparent";
	    document.getElementById("vehicle_details_vehicle.po_doc").style.border="none";

		//document.getElementById("vehicle.po_doc").style.background="transparent";
	    //document.getElementById("vehicle.po_doc").style.border="none";

		var hazDocs = document.getElementsByName("vehicle_details1_vehicle.haz_doc");
        for (var i = 0; i < hazDocs.length; i++) {
			hazDocs[i].style.background="transparent";
			hazDocs[i].style.border="none";
		}

		//document.getElementById("vehicle_details_vehicle.haz_doc").style.background="transparent";
	   //document.getElementById("vehicle_details_vehicle.haz_doc").style.border="none";

		//var quest0 = this.vehicle_details.fields.get('vehicle_details_question0.answer_field';
		//vehicleCreateBasicController.replaceDisabledEnumFields([this.vehicle_details.fields.get('vehicle_details_question0.answer_field').dom]);

/* function replaceContentInContainer(matchClass,content) {
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
                > -1) {
            elems[i].innerHTML = content;
        }
    }
} */
		replaceContentInContainer('inputField_box');
		var questFlds = document.getElementsByName("select");
//		makeFieldReadOnly(document.getElementById('vehicle_details_question0.answer_field'));
//		vehicleCreateBasicController.replaceDisabledEnumFields([document.getElementById('vehicle_details_question0.answer_field')]);

		document.getElementById("sectionLabels1").style.display = "inline";
		var oContent1 = frames["vehicle_details_form"].innerHTML;
	    document.getElementById("sectionLabels1").style.display = "none";
		//frames["projectInitiationViewSummaryForm_form"].style.display = "none"
		//this.pnl.show(false,false)
		//You can manipulate the content here or with the styles
		var oIframe = frames["print_iframe"]

	    if( oIframe.document ) {
			oIframe.document.body.innerHTML = ""; //Chrome, IE
		}else {
			oIframe.contentDocument.body.innerHTML = ""; //FireFox
		}

		var oDoc1
		if (oIframe.document) oDoc1 = oIframe.document;
		this.getPrintTxt(oDoc1,oContent1)
		oDoc1.close()
	   frames["vehicle_details_form"].style.display = ""
	},

	vehicle_details_beforeSave : function() {
    	// beforeSaveQuestionnaire() adds questionnaire answers to virtual XML field
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },

	vehiclerisk_details_afterRefresh: function() {
		BRG.UI.addNameField('vehiclerisk_type_info', this.vehiclerisk_details, 'vehicle.vehicle_type_id', 'vehicle_type', ['description','class_id'], {'vehicle_type.vehicle_type_id' : 'vehicle.vehicle_type_id'}, vehicleClassLabelConfig);
		document.getElementById("old_hazmat_types").value = this.vehiclerisk_details.getFieldValue('vehicle.hazmat_types');
		document.getElementById("old_hazmat_from").value = this.vehiclerisk_details.getFieldValue('vehicle.hazmat_from');
		document.getElementById("old_hazmat_to").value = this.vehiclerisk_details.getFieldValue('vehicle.hazmat_to');
		document.getElementById("vehicle.risk_comments.old").value = this.vehiclerisk_details.getFieldValue('vehicle.risk_comments');
	},

   removeTextChildNodes:function(element){
		var node =  undefined;
		var i = (element.childNodes.length)-1;
		for (;i>-1;i--){
			node = element.childNodes[i];
			if ((node!=undefined) && (node.nodeName=="#text")){
				element.removeChild(node);;
			}
		}
	},
	checkDisablePMS: function() {
        if (this.currentStatus == null) {
            this.eq_details.record.oldValues['eq.status'];
        }

        var newStatus = this.eq_details.record.values['eq.status'];
        if (this.currentStatus != newStatus) {
            var interval_freq = 1;
            switch(newStatus) {
            case 'out':
            case 'dec':
                interval_freq = 4;
                break;
            default:
                interval_freq = 1;
                break;
            }

            // change the interval_freq of all the pms
            this.pms_grid.gridRows.each(function (row) {
                var record = row.getRecord();
				var pms_id = record.getValue('pms.pms_id');
				var saveRecord = new Ab.data.Record();
				saveRecord.isNew = false;
				saveRecord.setValue('pms.pms_id', pms_id);
                saveRecord.setValue('pms.interval_freq', interval_freq);

				//delete record.oldValues['pms.interval_freq'];   // ensure the interval_freq saves
				saveRecord.oldValues = new Object();
				saveRecord.oldValues['pms.pms_id'] = pms_id;

				View.dataSources.get('pms_ds').saveRecord(saveRecord);
            });

            // rerun the pmdd generation for this equipment
            var eq_id = this.eq_details.getFieldValue('eq.eq_id');
            var PMSRest = "pms.eq_id = '"+eq_id.replace(/'/g, "''")+"'"

            var parameters = {
                "pmsidRestriction": PMSRest
            }

            try {
                var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
            }
            catch (e) {
                Workflow.handleError(e);
            }


        }

        this.pms_grid.refresh("pms.eq_id='"+this.eq_details.getFieldValue('eq.eq_id').replace(/'/g,"''")+"'");
        this.currentStatus = newStatus;
    },
	schedule_edit_saveForm: function() {

		frm = this.schedule_edit
		bolPMDD = frm.record.isNew

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_type') != frm.getFieldValue('pms.interval_type')}

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_freq') != frm.getFieldValue('pms.interval_freq')}
		if (!bolPMDD) {
			var interval = "pms.interval_" + frm.record.getValue('pms.interval_freq')
			bolPMDD = frm.record.getValue(interval) != frm.getFieldValue(interval)
		}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.fixed') != frm.getFieldValue('pms.fixed')}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.date_first_todo').dateFormat('Y-m-j' ) != frm.getFieldValue('pms.date_first_todo')}

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_type') != frm.getFieldValue('pms.interval_type')}

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_freq') != frm.getFieldValue('pms.interval_freq')}
		if (!bolPMDD) {
			var interval = "pms.interval_" + frm.record.getValue('pms.interval_freq')
			bolPMDD = frm.record.getValue(interval) != frm.getFieldValue(interval)
		}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.fixed') != frm.getFieldValue('pms.fixed')}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.date_first_todo').dateFormat('Y-m-j' ) != frm.getFieldValue('pms.date_first_todo')}

		if (this.schedule_edit.save()) {
			this.pms_grid.refresh();
			if (bolPMDD) {
				PMSRest = "pms.pms_id in (" + frm.getFieldValue('pms.pms_id') + ")"
				PMSRest = PMSRest + " and (exists (select 1 from pmp where pmp.pmp_id = pms.pmp_id and pmp.pmp_type <> 'EQ')"
				PMSRest = PMSRest + " or exists (select 1 from eq where eq.eq_id = pms.eq_id and eq.status = 'in'))"

				var parameters = {
					"pmsidRestriction": PMSRest
				}

				try {
					var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
				}
				catch (e) {
					Workflow.handleError(e);
				}
			}

			//View.closeDialog();
			this.schedule_edit.closeWindow();
		}
	},
	pms_grid_afterRefresh: function() {
        var eqStatus = this.eq_details.getFieldValue('eq.status');
        if (eqStatus == 'out' || eqStatus == 'dec' || this.eq_details.getFieldValue('eq.eq_id') == "") {
            this.pms_grid.actions.get('standard_add').enable(false);
        }
    },
	replaceDisabledEnumFields: function (fields) {
        for (var i = 0, j = fields.length; i < j; i++) {
            if (fields[i] !== null && fields[i].disabled === true) {
                var coverEl = document.createElement("SPAN");
                fields[i].style.display = "none";
                //coverEl.innerHTML = fields[i].options[0].text;
				coverEl.innerHTML = fields[i].options[fields[i].selectedIndex].label;
                if (fields[i].coverEl) {
                    fields[i].parentNode.removeChild(fields[i].coverEl);
                }
                fields[i].coverEl = coverEl;
                fields[i].parentNode.appendChild(coverEl);
            }
            else if (fields[i].coverEl) {
                fields[i].coverEl.style.display = "none";
                fields[i].style.display = "block";
            }
        }

    }
});

function  makeFieldReadOnly(fieldElement)
   {
         fieldElement.readOnly = true;
		 fieldElement.disabled = true;
		 fieldElement.style.border = "1px solid #E8E8F0";
		 fieldElement.style.color = "#000000";
   }

function getEquipmentDetails() {
	var row = this;
	// Hidden equipment panel
	var eq_details = View.panels.get("eq_details");
	var eq_restriction = {"eq.eq_id":row["vehicle.eq_id"]};

	eq_details.refresh(eq_restriction, false);
	eq_details.show(true);

	var vehicle_details = View.panels.get("vehicle_details");

	var vehicle_restriction = {"vehicle.vehicle_id":row["vehicle.vehicle_id"]};

	vehicle_details.refresh(vehicle_restriction, false);
	vehicle_details.show(true);

	// PM Schedule Panel
	var pms_grid = View.panels.get("pms_grid");
	var eq_id = eq_details.getFieldValue("eq.eq_id");

	var where_clause = " and pms.eq_id = '" + eq_id + "'";

	pms_grid.addParameter("clientRestriction", where_clause);
	pms_grid.refresh();
	pms_grid.show(false);

	// Risk tab panels
	var vehiclerisk_details = View.panels.get("vehiclerisk_details");

	vehiclerisk_details.refresh(vehicle_restriction, false);

	if(row["vehicle.cost_ins_perils"]!="" && parseFloat(row["vehicle.cost_ins_perils"])!=0){
		document.getElementById('insCheckBox').checked = true;
		vehiclerisk_details.fields.get('vehicle.cost_ins_perils').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.cost_ins_premium').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.hailstorm_writeoff').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.hailstorm_repair').dom.parentElement.parentElement.style.display='none';
	} else {
		document.getElementById('insCheckBox').checked = false;
		vehiclerisk_details.fields.get('vehicle.cost_ins_perils').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.cost_ins_premium').dom.parentElement.parentElement.style.display='none';
		vehiclerisk_details.fields.get('vehicle.hailstorm_writeoff').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.hailstorm_repair').dom.parentElement.parentElement.style.display='';
	}

	if(row["vehicle.hazmat_types"]!="") {
		document.getElementById('hazCheckBox').checked = true;
		vehiclerisk_details.fields.get('vehicle.hazmat_types').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.haz_doc').dom.parentElement.parentElement.style.display='';
		vehiclerisk_details.fields.get('vehicle.hazmat_from').dom.parentElement.parentElement.style.display='';
		//vehiclerisk_details.fields.get('vehicle.hazmat_to').dom.parentElement.parentElement.style.display='';
	} else {
		document.getElementById('hazCheckBox').checked = false;
		vehiclerisk_details.fields.get('vehicle.hazmat_types').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.haz_doc').dom.parentElement.parentElement.style.display='none';
		vehiclerisk_details.fields.get('vehicle.hazmat_from').dom.parentElement.parentElement.style.display='none';
		//vehiclerisk_details.fields.get('vehicle.hazmat_to').dom.parentElement.parentElement.style.display='none';
	}

	if(!(View.user.role=='UC_RiskManager' || View.user.role=='UC-SYSDEV')){
		document.getElementById('insCheckBox').disabled = true;
		document.getElementById('hazCheckBox').disabled = true;
		//document.getElementById("vehicle.risk_comments.new").style.display='none';
		//document.getElementById("vehiclerisk_details_field_gen22_labelCell").style.display='none';
		//document.getElementById("vehicle.risk_comments.new").parentElement.previousSibling.style.display='none';
		document.getElementById("vehicle.risk_comments.old").readOnly = true;
		document.getElementById("vehicle.risk_comments.old").className="defaulteditform_textareaabdata_readonly"
	}

	if(!(View.user.role=='UC_FleetManager' || View.user.role=='UC-SYSDEV')){
		document.getElementById("vehicle.description.new").readOnly = true;
		document.getElementById("vehicle.description.new").className="defaulteditform_textareaabdata_readonly"
		document.getElementById("vehicle.comments.new").readOnly = true;
		document.getElementById("vehicle.comments.new").className="defaulteditform_textareaabdata_readonly"
	}

	document.getElementById("vehicle.description.new").value = vehicle_details.getFieldValue("vehicle.description");
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
	pms_grid.show(false);

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

	if(!(View.user.role=='UC_RiskManager' || View.user.role=='UC-SYSDEV')){
		document.getElementById('insCheckBox').disabled = true;
		document.getElementById('hazCheckBox').disabled = true;
		//document.getElementById("vehicle.risk_comments.new").style.display='none';
		document.getElementById("vehicle.risk_comments.old").readOnly = true;
		document.getElementById("vehicle.risk_comments.old").className="defaulteditform_textareaabdata_readonly"
	}

	if(!(View.user.role=='UC_FleetManager' || View.user.role=='UC-SYSDEV')){
		document.getElementById("vehicle.description.new").readOnly = true;
		document.getElementById("vehicle.description.new").className="defaulteditform_textareaabdata_readonly"
		document.getElementById("vehicle.comments.new").readOnly = true;
		document.getElementById("vehicle.comments.new").className="defaulteditform_textareaabdata_readonly"
	}

	document.getElementById("vehicle.description.new").value = vehicle_details.getFieldValue("vehicle.description");
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
	$('vehicle.description.new').value = '';
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
	vehicle_details.setFieldValue("vehicle.description",document.getElementById("vehicle.description.new").value);
	vehicle_details.setFieldValue("vehicle.comments",document.getElementById("vehicle.comments.new").value);
	var invalid = "false";

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
					vehicle_drilldown.show(false);
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

function setVehicleBarcode(){
	var schedule_edit = View.panels.get("schedule_edit");
	var vehicle_details = View.panels.get("vehicle_details");

	schedule_edit.setFieldValue("pms.eq_id",vehicle_details.getFieldValue("vehicle.eq_id"));
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
		else if (val > 4500) {
			rt = "4,500 to 11,794 kg"
		}
	}
	pnl.setFieldValue("eq.option1",rt);


}

function replaceContentInContainer(matchClass) {
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
                > -1) {
			var test =1;
			makeFieldReadOnly(document.getElementById(elems[i].id));
			vehicleCreateBasicController.replaceDisabledEnumFields([elems[i]]);
        }
    }
}

var pm_grid_controller = View.createController('pm_grid_controller', {
   afterViewLoad: function()
   {
    //create the checkboxes for site and services
	//try
	//{
	//  this.ptaGrid.afterCreateCellContent = function(row, col, cellElement) {
	//  var theCheckboxes = 	"<span ><input type='checkbox' id='z1'/><font style='padding-left:3px;'>1</font><span> " +
	//                        "<span><input type='checkbox' id='z2' /><font style='padding-left:3px;'>2</font><span><br/> " +
	//						"<span><input type='checkbox' id='z3' /><font style='padding-left:3px;'>3</font><span> " +
	//						"<span><input type='checkbox' id='z4' /><font style='padding-left:3px;'>4</font><span> " +
	//						"<span><input type='checkbox' id='z5' /><font style='padding-left:3px;'>5</font><span> " ;
	//  if (col.id === "theZones" && row["uc_pir_pta.pta_type"].indexOf('Site and Services') != -1)
	//   {
 	//		cellElement.innerHTML = theCheckboxes ;
	//   }
	//}//end afterCreateCellContent
	//} catch (e) {}
   },

  afterInitialDataFetch: function()
  {
 },


  ptaGrid_afterRefresh: function()
  {
  // this.hideShowZones(true);

    //if not in review by PM hide the button: Request PTA Comments
   // var review_by = this.ptaGrid.rows[0]["uc_pir.review_by.raw"];
   var refreshItAgain = 0;
   var review_by = null;
   try
   {
     review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
   }
   catch(e) {}
    var action = null;
    if (review_by != null && review_by != undefined)
        action = this.ptaGrid.actions.get("request_comments");

    if (review_by == 'PM')
          {
            if (action!= null) action.show(true);
	  }
     else
          if (action!= null) action.show(false);

	//if there are no ptas generated then generate them for this request
	 var areThereAnyPtas = this.ptaGrid.rows;
	 if (areThereAnyPtas.length ==0)
	 {
	  var pta_types = BRG.Common.getEnumList("uc_pir_pta","pta_type").split(";");
	  var currType = "";
	  var parameters = null;
	   var pir_id = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		for (var i=0; i < pta_types.length-1; i=i+2)
		    {
			currType = pta_types[i];
			parameters = {
                tableName: "uc_pir_pta",
                fields: toJSON({
				        "uc_pir_pta.pta_type": currType,
						"uc_pir_pta.pir_id": pir_id})
            };
            Workflow.call('AbCommonResources-saveRecord', parameters);

			}//for
			this.ptaGrid.refresh();
	 }

  }, //ptaGrid_afterRefresh


  ptaGrid_onRequest_comments:function()
  {
      /*
	   original: save new record

	  this.ptaForm.actions.get("saveNew").show(true);
	  this.ptaForm.actions.get("saveEdit").show(false);
	  var thisPirId = this.ptaGrid.restriction["uc_pir.pir_id"];
	  this.ptaForm.setFieldValue ("uc_pir_pta.pir_id", thisPirId);
	  this.ptaForm.setTitle ("Add Comments");
	  this.ptaForm.show(true);
	  this.ptaGrid.show(false);

	  end original */
	  var selectedRows = this.ptaGrid.getSelectedRows();
	  var currPtaType = "";
	  //for each selected row an email will go out requesting comments; when the comments are sent back the project manager copies them in the form
	  if (selectedRows.length > 0 )
	  {
	   //this.sendUCEmail(this);
	   for (var i = 0; i < selectedRows.length ; i ++)
	     {
		     currPtaType = selectedRows[i]["uc_pir_pta.pta_type"];
			 this.sendUCEmail (currPtaType);
		 }
	  }
	  else
	    this.view.showMessage("To request PTA comments, select at least one row checkbox.");
    },

  //TO Do - update the email
  sendUCEmail: function(ptaType)
  {
		   var targetEmail = this.view.user.employee.email;
		   var currPir =  this.ptaGrid.restriction["uc_pir.pir_id"]
		   try {
			  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbCapitalBudgeting', 'UC_EMAIL_WFR',
			   'UC_PIR_REQ_PTA_EMAIL_BODY','UC_PIR_REQ_PTA_EMAIL_SUBJECT','uc_pir','pir_id',currPir,
			   'uc-view-my-requests.axvw', targetEmail);
			 }
			 catch (ex) {
				 this.view.showMessage ('There was an error when trying to send the PTA Comments email for ' + ptaType +'. ' + ex.code + '  ' + ex.message);
			 }
  },

   ptaForm_onSaveEdit: function()
  {
    this.savePtaForm(false);
	this.ptaForm.closeWindow();
  },

  savePtaForm: function(isNewRecord)
  {
     this.ptaForm.clearValidationResult();
	 this.ptaForm.validateFields();
	 if (!this.ptaForm.validationResult.valid)
				  return;
	 this.ptaForm.newRecord = isNewRecord;
	 if (!this.ptaForm.save()) return;
	 this.ptaForm.show(false);
	 this.ptaForm.clear();
	// this.ptaGrid.show(true);
	 this.ptaGrid.refresh();
  },
  ptaForm_onCancel: function()
  {
	this.ptaForm.closeWindow();
  },

  onEditButtonClick: function(row)
  {
	var currPir =  this.ptaGrid.restriction["uc_pir.pir_id"];
	var currType = row.restriction["uc_pir_pta.pta_type"];

	var rest = {'uc_pir_pta.pir_id': currPir, 'uc_pir_pta.pir_type': currType};
	View.openDialog('uc-pir-pta-form.axvw', rest, false, {
			width: 800,
			height: 750,
			closeButton: true
			});
  }
});

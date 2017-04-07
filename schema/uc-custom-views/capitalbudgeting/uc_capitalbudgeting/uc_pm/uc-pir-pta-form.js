var pta_form_controller = View.createController('pta_form_controller', {

    afterInitialDataFetch: function()
	{
	   //show the type that the user selected
	  this.ptaForm.refresh("uc_pir_pta.pir_id = '" + this.pGrid.restriction["uc_pir_pta.pir_id"] +"' and uc_pir_pta.pta_type = '" + this.pGrid.restriction["uc_pir_pta.pir_type"] + "'");
	},
	
    pGrid_onRequest_comments_na:function()
    {
      var cols = this.pGrid.getColumns();
	  var rows = this.pGrid.gridRows.items;
	  var currComment = null;
	  var isCurrSelected = null;
	  var currType =  null;
	  var makeAllCommentsNA = false;
	  var qAsked = false;
	  for (var j = 0; j < rows.length; j ++)
	  {
		  if (rows[j].isSelected())
		  {
		  for (var i = 0; i< cols.length; i++)
		  {
			if (cols[i].id == 'uc_pir_pta.comments')
			   {
				 currComment = rows[j].record["uc_pir_pta.comments"] ;
				 if (currComment != "")
				 {
				 if (makeAllCommentsNA == false)
				    if (!qAsked && confirm ("Do you want to update the comments value to N/A for selected rows that already have a comments value ?" ))
                       {
					    makeAllCommentsNA = true;
					    qAsked = true;
					   }
					 else
					   makeAllCommentsNA == false;
				 }//if comments not empty
				 else
				   this.updateRowNA(rows[j]); 
				 }//makeallcommentsna false
		    }//for
			if (makeAllCommentsNA) this.updateRowNA(rows[j]);  
		  }//if selected
		 
	  }//for rows.length
	  
	 
    },
  
   updateRowNA: function (theRow)
   {
		 var currType = theRow.record["uc_pir_pta.pta_type.key"];
		 var currPir =  this.pGrid.restriction["uc_pir_pta.pir_id"];
		 this.ptaForm.refresh("uc_pir_pta.pir_id = " + currPir + "  and uc_pir_pta.pta_type = '" + currType + "'");
		// this.ptaForm.setFieldValue("uc_pir_pta.pir_id",currPir);
		 this.ptaForm.setFieldValue("uc_pir_pta.comments","N/A");
		 this.ptaForm.setFieldValue("uc_pir_pta.pta_type",currType);
		 this.savePtaForm(false);
		 this.pGrid.refresh();
   },
   

   ptaForm_onSaveEdit: function()
  {  
    this.savePtaForm(false);
	//this.ptaForm.closeWindow();
  },
  
  savePtaForm: function(isNewRecord)
  {
     this.ptaForm.clearValidationResult();
	 this.ptaForm.validateFields();	  
	 if (!this.ptaForm.validationResult.valid)
				  return;	
	 this.ptaForm.newRecord = isNewRecord;
	 if (!this.ptaForm.save()) return;
	 this.pGrid.refresh();
	 
	 //refresh opener grid as well
	 var openerView = this.view.getOpenerView();
	 openerView.panels.get('ptaGrid').refresh();
  },
  ptaForm_onCancel: function()
  {
	this.pForm.closeWindow();
  }	
});

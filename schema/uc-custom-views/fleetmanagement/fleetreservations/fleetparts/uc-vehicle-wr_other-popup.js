var wrOtherPopupController = View.createController('wrOtherPopupController', {
    hideQtyUsedActualCost :false,
    afterViewLoad: function(){
     	var allSep= Ext.DomQuery.select("*[class = ytb-sep]");
	    for (var i=0; i< allSep.length; i ++ )
	       allSep[i].style.display = "none";
		
         try {this.hideQtyUsedActualCost = this.view.parameters.hideQtyUsedActualCosts;} catch (e) {}	
		//hide quantity used and actual coosts when opening from Manage Requested Reservations screen
		if (typeof(this.hideQtyUsedActualCost) == "undefined"){this.hideQtyUsedActualCost = false}
	    if (this.hideQtyUsedActualCost == true){
			var theQtyLabel = document.getElementById('wr_other_grid_wr_other.qty_used_labelCell');
			theQtyLabel.parentElement.style.display = "none"; //hide the row  in the form
			var theCostLabel = document.getElementById('wr_other_grid_wr_other.cost_total_labelCell');
			theCostLabel.parentElement.style.display = "none"; //hide the row  in the form
	    }
		else if (this.wr_other_grid.newRecord) {
			var theQtyLabel = document.getElementById('wr_other_grid_wr_other.qty_est_labelCell');
			theQtyLabel.parentElement.style.display = "none"; //hide the row  in the form
			var theCostLabel = document.getElementById('wr_other_grid_wr_other.cost_estimated_labelCell');
			theCostLabel.parentElement.style.display = "none"; //hide the row  in the form
		}
			 
	},
	
	
	wr_other_grid_beforeSave: function()
	{
	      // process date_used
		  // For New Records (or when a new part type is choosen)
		  // fill in the "date_used" field with today's date or the if a record
		  // exist with this primary key (wr_id, other_res_type, date_used) then increment
		  // the date_used to the next available date.
  		  var insertDate = new Date();
		  var wrId = this.wr_other_grid.getFieldValue("wr_other.wr_id");
		  var otherRsType = this.wr_other_grid.getFieldValue("wr_other.other_rs_type");
		  var dsource = View.dataSources.get(this.wr_other_grid.dataSourceId);
		  var rest = "wr_other.wr_id = "+wrId
									+" AND wr_other.other_rs_type ='"+otherRsType
									+"' AND CONVERT(DATETIME, wr_other.date_used, 101) = CONVERT(DATETIME,'"
									+ dsource.formatValue("wr_other.date_used", insertDate, true) + "')";


		  if (dsource.getRecord(rest).values["wr_other.date_used"] != undefined ) {
				// Primary key already exists, use the max date associated with the
				// wr_id and other_rs_type by 1.
				rest = "wr_other.wr_id = "+wrId
									+" AND wr_other.other_rs_type = '"+otherRsType
									+" ' AND wr_other.date_used = (SELECT max(date_used) FROM wr_other WHERE "
									+" wr_other.wr_id = "+wrId
									+" AND wr_other.other_rs_type ='"+otherRsType+"')"

				insertDate = dsource.getRecord(rest).values["wr_other.date_used"];
				insertDate.setTime(insertDate.getTime() + 86400000);	// Add 1 day to the date (86400000ms)
		   }
		  this.wr_other_grid.setFieldValue("wr_other.date_used",
		  dsource.formatValue("wr_other.date_used", insertDate, true));
		  
		  this.wr_other_grid.setFieldValue("wr_other.fulfilled", "1");
	},
	

	
	wr_other_grid_afterRefresh:function()
	{
     var addNewMode = null;
	 var addType = null;
	
	 this.wr_other_grid.setTitle ("Request Details");
	  
	 try { 
	     addNewMode = this.view.parameters.addMode;
		 addType = this.view.parameters.addType;
		 } catch(e) {} ;
	 

		
	 if (addNewMode == false)
	 {
	      this.wr_other_grid.actions.get("saveNew").show(false);
		  this.wr_other_grid.actions.get("save").show(true);
	 }
     else if (addNewMode == true)
	    {
		  //show save for new
		  
		  this.wr_other_grid.actions.get("saveNew").show(true);
		  this.wr_other_grid.actions.get("save").show(false);
		  var currentWrId = this.wr_other_grid.restriction["wr_other.wr_id"];
	 	
		  if (currentWrId == null || currentWrId == undefined)
		   currentWrId = this.wr_other_grid.restriction.clauses[0].value;
		  
		  //clear form since it will be a new record
		  this.wr_other_grid.clear();
		  this.wr_other_grid.newRecord=true;
		  
		  if (addType == 'subwork')
	      {
	       this.wr_other_grid.setFieldValue ("wr_other.other_rs_type", "VEHICLE-WORK"); //default the subwork type
		   this.wr_other_grid.setTitle ("Sub Work Request"); //update popup title
		  }
	       else if (addType == 'miscellaneous')
	      {
	       this.wr_other_grid.setFieldValue ("wr_other.other_rs_type", "VEHICLE-MISC");
		   this.wr_other_grid.setTitle ("Miscellaneous Costs");
		  }
	 
		  this.wr_other_grid.setFieldValue("wr_other.wr_id", currentWrId); 
		}
	 
	}, //wr_other_grid_afterRefresh
	
	refreshParentPanel: function()
	{
	  try
	  {
	  View.getOpenerView().panels.get('wr_other_grid').refresh();
	  }
	  catch(e) {}
	   try
	  {
	  View.getOpenerView().panels.get('wr_subwork_grid').refresh();
	  }
	  catch(e) {}
	  try
	  {
	  if (this.hideQtyUsedActualCost == false || this.hideQtyUsedActualCost == undefined)
	    View.getOpenerView().panels.get('reservations_form').refresh();
	  }
	  catch(e) {}
	},
	
	//function that updates the estimated total cost for the parent wr
    updateWrTotalCost: function() //tried a trigger for this but it didn't work out
	{
	  var currWrId = this.wr_other_grid.getFieldValue("wr_other.wr_id");
	  //get entered estimated cost
	  var estimated_cost = this.wr_other_grid.record.values["wr_other.cost_estimated"];
	  var est_cost = parseFloat(estimated_cost,2);
	  var currentTotalCost = parseFloat(BRG.Common.getDataValue("wr","cost_est_total", "wr_id = " + currWrId),2);
	  
	  var cost_est_total = currentTotalCost + est_cost;
	  
	  var parameters = null;
	  var result = null;
	  parameters = {
							 tableName: "wr",
							 fields: toJSON({
							    "wr.wr_id": currWrId,
								"wr.cost_est_total": cost_est_total})
						  };
	  result = Workflow.call('AbCommonResources-saveRecord', parameters);
	}
 
});//end controller


//Florin
var formController = View.createController('formController', {
   
    afterViewLoad: function()
	{
	    this.projectRequestsGrid.restriction = "uc_pir.status in ('I','PP')";
	},
	
    afterInitialDataFetch: function()
	{
	   var statusOptions = document.getElementById("uc_pirConsolePanel_uc_pir.status");
	   
	   var option=document.createElement("option");
	   option.text="Active";
	   try
		  {
		  // for IE earlier than version 8
		  statusOptions.add(option,statusOptions.options[1]);
		  }
		catch (e)
		  {
		  statusOptions.add(option,1);
		  }
	     statusOptions.value = "Active";
	     statusOptions.selectedIndex = 1;
	    
	 
    },
   
	restLiteral: function(value) {
	return "'"+value.replace(/'/g, "'")+"'";
   },

	uc_pirConsolePanel_onShow:function()
	{
	  var restriction = "1=1";
	  var statusOptions = document.getElementById("uc_pirConsolePanel_uc_pir.status");
	   
	  var pirName = this.uc_pirConsolePanel.getFieldValue('uc_pir.pir_name');
	  var dpId= this.uc_pirConsolePanel.getFieldValue('uc_pir.dp_id');
	  var primaryFunding = this.uc_pirConsolePanel.getFieldValue('uc_pir.funding_primary');
	  var status = this.uc_pirConsolePanel.getFieldValue('uc_pir.status');
	  var blId = this.uc_pirConsolePanel.getFieldValue('uc_pir.bl_id');
	  var rank = this.uc_pirConsolePanel.getFieldValue('uc_pir.rank');
	  var endFrom = this.uc_pirConsolePanel.getFieldValue('uc_pir.date_est_completion.from');
	  var endTo = this.uc_pirConsolePanel.getFieldValue('uc_pir.date_est_completion.to');
	  var flId = this.uc_pirConsolePanel.getFieldValue('uc_pir.fl_id');
	  var dateSubmitted = this.uc_pirConsolePanel.getFieldValue('uc_pir.date_submitted');
	  
	  var targeteltFrom = this.uc_pirConsolePanel.getFieldValue('uc_pir.pag_targetelt_date.from');
	  var targeteltTo = this.uc_pirConsolePanel.getFieldValue('uc_pir.pag_targetelt_date.to');
	  var reviewBy = this.uc_pirConsolePanel.getFieldValue('uc_pir.review_by');
	  var reqWrNum = this.uc_pirConsolePanel.getFieldValue('uc_pir.req_wr_num');
	
      if (pirName != '') 
     	 restriction += " AND uc_pir.pir_name like " + this.restLiteral(pirName+"%");
	
      if (dpId != '') 
     	 restriction += " AND uc_pir.dp_id like " + this.restLiteral(dpId);	
	
	  if (primaryFunding != '') 
     	 restriction += " AND uc_pir.funding_primary like " + this.restLiteral(primaryFunding);
	
	  if (statusOptions.value == 'Active' || statusOptions.selectedIndex == 1)
	     restriction += " AND uc_pir.status in ('I','PP')";
      else if (status != '') 
     	 restriction += " AND uc_pir.status like " + this.restLiteral(status);	
		
      if (blId != '') 
     	 restriction += " AND uc_pir.bl_id like " + this.restLiteral(blId);
	
      if (rank!= '') 
     	 restriction += " AND uc_pir.rank like " + this.restLiteral(rank);
			 
	  if (endFrom != '') 
     	 restriction += " AND uc_pir.date_est_completion >= " + this.restLiteral(endFrom);
	
      if (endTo != '') 
	    restriction += " AND uc_pir.date_est_completion <= " + this.restLiteral(endTo);

	  if (flId != '') 
     	 restriction += " AND uc_pir.fl_id like " + this.restLiteral(flId);
	  
	  if (dateSubmitted != '') 
     	 restriction += " AND convert(varchar(10), uc_pir.date_submitted,120) = convert(varchar(10)," + this.restLiteral(dateSubmitted) + ",120)";

      if (targeteltFrom != '') 
          restriction += " AND uc_pir.pag_targetelt_date >= " + this.restLiteral(targeteltFrom);
     
      if (targeteltTo != '') 
          restriction += " AND uc_pir.pag_targetelt_date <= " + this.restLiteral(targeteltTo);
      
      if (reviewBy != '') 
          restriction += " AND uc_pir.review_by = " + this.restLiteral(reviewBy);
     
       if (reqWrNum!= '') 
          restriction += " AND uc_pir.req_wr_num = " + this.restLiteral(reqWrNum);
             
	  
	  this.projectRequestsGrid.refresh(restriction);	
	  
	 
     /*this.aRestriction = restriction;
      
      this.propViewAnalysis_table.setTitle("Labor Analysis Report");
	  if (this.newTitle != "")
	     {
		   try //in case of error don't display the restriction; just the title
		   {
		   var test = this.propViewAnalysis_table.getTitle();
           this.propViewAnalysis_table.actions.items[0].panel.title = test + " - Restriction: " + this.newTitle;	  //include restriction text in xls exported file
		   }
		   catch (e) {}
		 }
		*/ 
	},
	
	loadExternalView: function(viewName)
	{
	
	}
});



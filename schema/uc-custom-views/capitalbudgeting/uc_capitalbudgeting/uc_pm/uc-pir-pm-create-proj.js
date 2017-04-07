//florin
var pmProjCreateEditController = View.createController('pmProjCreateEditController', {
    
	 afterInitialDataFetch: function()
	 {
	      this.projectForm.refresh("1=0");
	   	  var pir_id = this.pirForm.getFieldValue("uc_pir.pir_id"); 
		  var pir_name = this.pirForm.getFieldValue("uc_pir.pir_name"); 
		  var programId = this.pirForm.getFieldValue("uc_pir.program_id"); 
		  var project_title = this.pirForm.getFieldValue("uc_pir.project_title");
		  var proj_manager = this.view.user.employee.id;
		  var requestor =  this.pirForm.getFieldValue("uc_pir.requestor");
		  var bl_id = this.pirForm.getFieldValue("uc_pir.bl_id");
		  var dp_id = this.pirForm.getFieldValue("uc_pir.dp_id");
		  var dv_id = this.pirForm.getFieldValue("uc_pir.dv_id");
		  var desc = this.pirForm.getFieldValue("uc_pir.criteria"); 
		  var ir = this.pirForm.getFieldValue("uc_pir.infrastructural_requirements");
		  var sa = this.pirForm.getFieldValue("uc_pir.situation_analysis");
		  var site_id= ""
		  if (bl_id !="") {
			var parameters = {
				tableName: 'bl',
				fieldNames: toJSON(['bl.site_id']),
				restriction: "bl.bl_id = '" + bl_id.replace(/'/g,"''") + "'"
			};
			
			var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
			if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
				site_id = result.data.records[0]['bl.site_id'];
			}
		  }
		  var comments = "";
		  if (ir != "")
		     comments += "Infrastructure Requirements: " + ir + " \n";
		  if (sa != "")
		     comments += "Situational Analysis:" + sa;
		  //this.projectForm.setFieldValue("project.project_id", pir_id + ' ' + pir_name);
		  this.projectForm.setFieldValue("project.proj_mgr",proj_manager);
		  this.projectForm.setFieldValue("project.requestor",requestor);
		  this.projectForm.setFieldValue("project.contact_id",'TBD');
		  this.projectForm.setFieldValue("project.description",desc);
		  this.projectForm.setFieldValue("project.comments",comments);
		  this.projectForm.setFieldValue("project.dv_id",dv_id);
		  this.projectForm.setFieldValue("project.dp_id",dp_id);
		  this.projectForm.setFieldValue("project.bl_id",bl_id);
		   this.projectForm.setFieldValue("project.site_id",site_id);
		  this.projectForm.setFieldValue("project.program_id",programId);
		  this.projectForm.setFieldValue("project.project_id",project_title);
		  
		  //this.projectForm.setFieldValue("project.contact_id",proj_manager);
	 },
	 
	 projectForm_onSaveProject: function()
	 {
	  
	  this.projectForm.clearValidationResult();
	  this.projectForm.validateFields();
      var isValid =  	  this.projectForm.validationResult.valid;
      if (! this.projectForm.validationResult.valid)
		  return;
    	var currUser = "";
	   this.projectForm.newRecord = true;
	   try { currUser = this.view.user.employee.id; } catch(e) {} 
	   this.projectForm.setFieldValue("project.status","Approved");
	   this.pirForm.setFieldValue("uc_pir.status","AP");
	   this.pirForm.setFieldValue("uc_pir.project_id",this.projectForm.getFieldValue("project.project_id"));
	   this.pirForm.setFieldValue("uc_pir.approver_pm ",currUser);

	   var test = this.projectForm.save();
	   
	   if (test == true)
	   {
           var workRequest = this.pirForm.getFieldValue("uc_pir.req_wr_num");
           if(workRequest != "")
           {
               Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', {
                    tableName: 'wr',
                    fields: toJSON({'wr.wr_id': workRequest, 'wr.status': 'I', 'wr.project_id': this.projectForm.getFieldValue("project.project_id")})
                });
           }
           
	       this.pirForm.save();
		   var theOpenerView = this.view.getOpenerView();
		   theOpenerView.reload();
	   }
	   
	 }
 });
    

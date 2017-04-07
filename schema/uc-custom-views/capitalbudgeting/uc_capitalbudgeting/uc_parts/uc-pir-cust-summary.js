//florin
var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };

var emNameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{1}, {0}",
        textColor : "#000000", defaultValue : "", raw : false };

var myController = View.createController('myController', {
    openBy:"",
   afterInitialDataFetch:function()
	{


	   //populate funding year lists
	   var fromPrimaryList =  document.getElementById('from_primary');
	   this.generateYearList (fromPrimaryList);
	   var toPrimaryList =  document.getElementById('to_primary');
	   this.generateYearList (toPrimaryList);
	   this.generateYearList (document.getElementById('from_secondary'));
	   this.generateYearList (document.getElementById('to_secondary'));
	   this.generateYearList (document.getElementById('from_tertiary'));
	   this.generateYearList (document.getElementById('to_tertiary'));
	},

   afterViewLoad: function()
   {
		docCntrl.docTable='uc_pir';
		docCntrl.docTitle = "Project Request Documents";
		this.doc_grid.restriction="1=2"
		this.doc_grid.show(false,true)
        //don't let the user enter negative amounts in Primary, Secondary or Tertiary fields
		this.keyPress("fundingPanel_uc_pir.cost_est_primary");
		this.keyPress("fundingPanel_uc_pir.cost_est_secondary");
		this.keyPress("fundingPanel_uc_pir.cost_est_tertiary");

        //hide bars in buttons
     	var allButtonSeparators = Ext.DomQuery.select("*[class = ytb-sep]");
	    for (var i=0; i< allButtonSeparators.length; i ++ )
	       allButtonSeparators[i].style.display = "none";

		//make the title readonly if not on the create screen
	//	if (this.view.originalRequestURL.indexOf("uc-pir-cust-create.axvw") == -1)
	//	   makeFieldReadOnly (this.projectInitiationViewSummaryForm.getFieldElement("uc_pir.pir_name"));


	},

    endorserPanel_afterRefresh: function()
	{
	 BRG.UI.addNameField('endorser_name', this.endorserPanel, 'uc_pir.endorser', 'em', ['name_first','name_last'],
        {'em.em_id' : 'uc_pir.endorser'},
        emNameLabelConfig);
	},

	projectInitiationViewSummaryForm_afterRefresh: function(){
		var status = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.status');
		var review_by = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.review_by');
		hideShowYearFields(review_by == 'C' && (status=='Ret' || status=='C') );
		docCntrl.docAdd = false;
		switch (myController.openBy) {
			case "C":
				docCntrl.docAdd = review_by == 'C' && (status == 'C' || status == 'Ret');
				break;
			case "ROM":
				docCntrl.docAdd = review_by == 'ROM' && status == 'I';
				break;
			case "PM":
				docCntrl.docAdd = review_by == 'PM' && (status == 'I' || status == 'PP');
				break;
			case "CP":
				docCntrl.docAdd = (review_by == 'CP' || review_by == 'CPR' || review_by == 'CPE') && (status == 'I' || status == 'AP'|| status == 'PP');
				break;
			case "EN":
				docCntrl.docAdd = (review_by == 'EN') && (status == 'I');
				break;
            case "CA":
                docCntrl.docAdd = (review_by == 'CA') && (status == 'I');
                break;
            case "CA":
                docCntrl.docAdd = (review_by == 'CA') && (status == 'I');
                break;
            case "PAG":
                docCntrl.docAdd = (review_by == 'PAG') && (status == 'I' ||status == 'PP');
                break;
		}
		docCntrl.docEdit=docCntrl.docAdd;
		docCntrl.docSaveForms=this.projectInitiationViewSummaryForm.newRecord;
		var currentProj = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		var rest = new Ab.view.Restriction();
		rest.addClause('uc_docs_extension.table_name','uc_pir',"=");
		if (currentProj == ""){
			currentProj="-1"
		}
		else {
			docCntrl.docPkey= currentProj
		}
		rest.addClause("uc_docs_extension.pkey", currentProj, "=");
		this.doc_grid.restriction=rest
		this.doc_grid.refresh()
		//this.doc_grid.show(true,true)

		var theRequestor = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.requestor");

		if (this.projectInitiationViewSummaryForm.newRecord == true) { //if new request{
	       try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
	       this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.requestor", theRequestor);
		// this.projectInitiationDocsPanel.restriction = rest;
		// this.projectInitiationDocsPanel.refresh(rest); //this goes to after refresh which will show/hide the add button

	   }

	   var t = document.getElementById("projectInitiationViewSummaryForm_requestorInfo_labelCell");
	   document.getElementById("projectInitiationViewSummaryForm_requestorInfo_labelCell").innerHTML = "Requestor: ";
	   document.getElementById("projectInitiationViewSummaryForm_requestorInfo_labelCell").className = "labelValidated";
	   document.getElementById("theRequestor").innerHTML = theRequestor;
	   document.getElementById("theRequestor").className = "labelTop";

	   var theButton =  document.getElementById("reqdetailsbutton");
	   if (theRequestor == '' || theRequestor == null)
	      theButton.style.display = "none";
	   else
	      {
	      if (this.projectInitiationViewSummaryForm.newRecord == true)
	          theButton.style.display = "none";
	      else
	          theButton.style.display = "inline";
	      }

	   //add name label below the requestor
	  // BRG.UI.addNameField('requestor_name', this.projectInitiationViewSummaryForm, 'uc_pir.requestor', 'em', ['name_first', 'name_last'],{'em.em_id' : 'uc_pir.requestor'},emNameLabelConfig);
  	   document.getElementById("reqName").innerHTML = this.getEmName(theRequestor);
	   document.getElementById("reqName").style.color = "#FF0000";
	   //document.getElementById("reqName").style.textTransform = "lowercase";

       BRG.UI.addNameField('costcenter_name', this.projectInitiationViewSummaryForm, 'uc_pir.dp_id', 'dp', ['name'],
        {'dp.dv_id' : 'uc_pir.dv_id','dp.dp_id' : 'uc_pir.dp_id'},
        nameLabelConfig);

	   BRG.UI.addNameField('building_name', this.projectInitiationViewSummaryForm, 'uc_pir.bl_id', 'bl', ['name'],
        {'bl.bl_id' : 'uc_pir.bl_id'},
        nameLabelConfig);

		this.projectInitiationViewSummaryForm.showField('uc_pir.comments_pp',this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.comments_pp') !="")
		this.projectInitiationViewSummaryForm.showField('uc_pir.reject_comments',this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.reject_comments') !="")



    }, //end projectInitiationViewSummaryForm_afterRefresh

    generateYearList: function(myDropList){
	        var today=new Date();
	        var thisyear = today.getFullYear() - 5; // start 5 years in the past
			// 5 years in past to 15 in future will be 61 years total:
			for (var yr= 0; yr < 15; yr++, thisyear++ )
			{
			myDropList.options[yr] = new Option(thisyear, thisyear);
			}
			myDropList.selectedIndex = 5; // current year *WILL* be at option 5
    }, //end generateYearList


    projectInitiationViewSummaryForm_onNewCustomer: function()
    {
	 this.view.reload();
	},

    //note that there are 2 save buttons - 1 that saves a new record (available when record created) and one that saves/updates an existing record
    //this Save saves a new record   - TO DO : see whats similar with the other SAVE and try to group similar code in methods.
    projectInitiationViewSummaryForm_onSaveCustomer: function()
    {
		//check validation on the panels first
		if (!this.validateFields("custNew")) return false;

		var theStatus = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
		if (theStatus == 'I')
		    if (!this.validateFields("cust")) return false;

		//save estimated amounts and funding years - do it in the docs panel; the updateFieldValuesForSimilarPanels will copy the data in the "to be saved" panel
		this.moveYearsToFields();

		//update fields in the first panel
		this.updateFieldValuesForSimilarPanels(this.projectInitiationViewSummaryForm,this.projectInitiationSummaryPanel);
		this.updateFieldValuesForSimilarPanels(this.projectInitiationViewSummaryForm,this.fundingPanel);
		this.projectInitiationViewSummaryForm.newRecord = true;
		//validate all values and save the record
		if (!this.validatePanelFields(this.projectInitiationViewSummaryForm)) return false;

		if (!this.projectInitiationViewSummaryForm.save()) {return false;}
		var currentProj = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("uc_pir.pir_id", currentProj, "=");
		this.projectInitiationSummaryPanel.newRecord = false;
		this.fundingPanel.newRecord = false;
		this.projectInitiationSummaryPanel.refresh(restriction);
		this.fundingPanel.refresh(restriction);

		//apply restriction of newly created proj to the docs panel
		 var rest = new Ab.view.Restriction();
		 rest.addClause("uc_docs_extension.pkey", currentProj, "=");
		 rest.addClause('uc_docs_extension.table_name','uc_pir', "=");
		// this.projectInitiationDocsPanel.restriction = rest;
		// this.projectInitiationDocsPanel.refresh(rest); //this goes to after refresh which will show/hide the add button
		docCntrl.docPkey= currentProj
		this.doc_grid.refresh(rest)

		 //hide the saveCustomer button -used for new record and show save button - used for existing record
		 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
		 this.projectInitiationViewSummaryForm.actions.get("saveCustomer").show(false);
		 return true;

   },
   
   createWorkRequestForPir: function(){
       //Create WR and assign ID
       if(this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.req_wr_num") == ""){
           var activityLog = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, {
               "wr.prob_type": 'PROJECT',
               "wr.work_team_id": 'PROJECTS',
               "wr.status": 'AA',
               "wr.requestor": 'PROJECT BOT',
               "wr.bl_id": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.bl_id"),
               "wr.fl_id": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.fl_id"),
               "wr.rm_id": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.rm_id"),
               "wr.date_requested": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.date_submitted"),
               "wr.description": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_name") + ': ' + this.projectInitiationSummaryPanel.getFieldValue("uc_pir.criteria"),
               "activity_log.activity_type": 'SERVICE DESK - MAINTENANCE',
               "activity_log.prob_type": 'PROJECT',
               "activity_log.work_team_id": 'PROJECTS',
               "activity_log.tr_id": 'PROJECTS',
               "activity_log.requestor": 'PROJECT BOT',
               "activity_log.bl_id": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.bl_id"),
               "activity_log.fl_id": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.fl_id"),
               "activity_log.rm_id": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.rm_id"),
               "activity_log.date_requested": this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.date_submitted"),
           });
           var workRequest = UC.Data.getDataRecords('wr', ['wr_id'], "activity_log_id=" + activityLog.data['activity_log_id']);
           var result = Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', {
            tableName: 'wr',
            fields: toJSON({'wr.wr_id': workRequest[0]['wr.wr_id'], 'wr.tr_id': 'PROJECTS'})});
           this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.req_wr_num", workRequest[0]['wr.wr_id']);
       }
    },

     /*
      projectInitiationViewSummaryForm_onSubmitCustomer:
	changes the:  status to ‘I’ {Issued}, copies the Funding Years droplist values to the appropriate hidden fields,
	       copies the date_est_completetion  to the date_start, sets the date_submitted = current date
	       and changes the review_by to either:
		?	“PM” {ProvostProject Manager} if the IMP checkbox is checked and it only has a Single Source of Funding
		?	“CP” {Budget OwnerCampus Planning}
     */
     projectInitiationViewSummaryForm_onSubmitCustomer: function()
     {
        //check validation on the panels first
    	if (!this.validateFields("cust"))  return;
	    //save estimated amounts and funding years - do it in the docs panel; the updateFieldValuesForSimilarPanels will copy the data in the "to be saved" panel
	    this.moveYearsToFields();

		//update fields in the first panel
		this.updateFieldValuesForSimilarPanels(this.projectInitiationViewSummaryForm,this.projectInitiationSummaryPanel);
		this.updateFieldValuesForSimilarPanels(this.projectInitiationViewSummaryForm,this.fundingPanel);
		//update status to I
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","I");
		//update review_by based on the imp setting
		var imp = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.imp");
		var fundPrimary = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.funding_primary");
		var fundSecondary = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.funding_secondary");
		var fundTertiary = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.funding_tertiary");
		if (imp == "1" && fundPrimary=="IMP" && fundSecondary=="-" && fundTertiary=="-" )
			this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","PM");
		else
			 this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","CP");
         
        this.createWorkRequestForPir();

		//validate all values and save the record
		if (!this.validatePanelFields(this.projectInitiationViewSummaryForm)) return;
		if(!this.projectInitiationViewSummaryForm.save()){return false};
		var currentProj = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("uc_pir.pir_id", currentProj, "=");
		this.projectInitiationSummaryPanel.newRecord = false;
		this.fundingPanel.newRecord = false;
		this.projectInitiationSummaryPanel.refresh(restriction);
		this.fundingPanel.refresh(restriction);
		//take away Submit and just leave Save - user can submit a request just once
		this.projectInitiationViewSummaryForm.actions.get("submitCustomer").show(false);
		this.projectInitiationViewSummaryForm.actions.get("saveCustomer").show(false);
        this.projectInitiationViewSummaryForm.actions.get("save").show(false);
		this.projectInitiationViewSummaryForm.actions.get("newCustomer").show(true);
		hideShowYearFields(false)
		//apply restriction of newly created proj to the docs panel
		// var rest = new Ab.view.Restriction();
		// rest.addClause("uc_pir_doc.pir_id", currentProj, "=");
		 //this.projectInitiationDocsPanel.restriction = rest;
		 //this.projectInitiationDocsPanel.refresh(rest); //this goes to after refresh which will show/hide the add button
		var rest = new Ab.view.Restriction();
		rest.addClause("uc_docs_extension.pkey", currentProj, "=");
		rest.addClause('uc_docs_extension.table_name','uc_pir', "=");
		docCntrl.docPkey= currentProj
		docCntrl.docEdit=false;
		docCntrl.docAdd=false;
		this.doc_grid.refresh(rest)

		 //make everything readonly
	     this.processPanels();

		 //SEND EMAIL TO THE REQUESTOR - see tech doc for format
	   //  this.sendUCEmail('customer');

     },

     /*
     “Submit for Approval” (visible if In Review By = “C” {Customer}):  changes the:  status to ‘I’ {Issued},
            copies the Funding Years droplist values to the appropriate hidden fields,
	    copies the date_est_completetion  to the date_start and changes the review_by to either:
		?	“PM” {Project Managment} if the IMP checkbox is checked and it only has a Single Source of Funding
		?	“CP” {Campus Plannng} if the current review_by = “C” {Customer}.
	The panel is then saved and refreshes the screen.
     */
     projectInitiationViewSummaryForm_onSubmitForApprovalCustomer:function()
     {
	 if (!this.validateFields("cust"))  return;
       	//update status to I
	this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","I");
	//update years
	this.moveYearsToFields();

	var initialReviewBy = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	//update review_by based on the imp setting
	var imp = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.imp");
	if (imp == "1")
	    this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","PM");
	else
	{
	   var currReviewBy = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	   if (currReviewBy == "C")
	            this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","CP");
	}

    this.createWorkRequestForPir();

	//if review_by = 'C' send email to the requestor
	if (initialReviewBy == 'C')
           this.sendUCEmail('customerApproval');

	//save panels:
	if (!this.projectInitiationViewSummaryForm_onSave()){return false};
	this.projectInitiationViewSummaryForm.actions.get("submitForApprovalCustomer").show(false);
	this.projectInitiationViewSummaryForm.actions.get("save").show(false);
	this.projectInitiationViewSummaryForm.actions.get("cancelRequestCustomer").show(false);

    //hide panel in center
	//this.hideAllPanelsThatAreNotViewType();
	this.refreshAllPanelsThatAreNotViewType();

	try
	 {
	 this.projectViewGrid.refresh();
	 }
	 catch (e) {}

	 //set the title
	   var theTitle = ""
		if (this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") != ""){
			theTitle = "Project Approved [" + this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") + "]"
		} else {
		   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
		   var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
		   var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
		   var status_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues[status];
		   if (status_byValue == 'Returned') {
				theTitle = status_byValue + " To: " + review_byValue;
		   } else {
				theTitle = status_byValue + " By: " + review_byValue;
		   }
		}
		this.projectInitiationViewSummaryForm.setTitle (theTitle)

   },

     /*
    NO:(visible if In Review By = “C” {Customer})  Sets the status to “REJ” { Rejected }, rejected_by to logged in em_id and saves the panel
	Yes: Set the staytus to Cancelled
     */
     projectInitiationViewSummaryForm_onCancelRequestCustomer: function()
     {

        if(!confirm("Are you sure you want to cancel this request?"))
         return;
        //update status to Can
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","Can");
		//set rejected by
		var currEm = "";
		try { currEm = this.view.user.employee.id; } catch(e) {} ;
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.rejected_by",currEm);
		//save panels:
		if(!this.projectInitiationViewSummaryForm_onSave()){return false};
		this.projectInitiationViewSummaryForm.actions.get("submitForApprovalCustomer").show(false);
		this.projectInitiationViewSummaryForm.actions.get("save").show(false);
		this.projectInitiationViewSummaryForm.actions.get("cancelRequestCustomer").show(false);

	    try
		 {
		 this.projectViewGrid.refresh();
		 }
		 catch (e) {}

		 this.projectInitiationViewSummaryForm.setTitle ("Loading...");
        this.refreshAllPanelsThatAreNotViewType();

		//alert ( this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status"));
		var theTitle = ""
		if (this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") != ""){
			theTitle = "Project Approved [" + this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") + "]"
		} else {
		   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
		   var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
		   var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
		   var status_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues[status];
		   if (status_byValue == 'Returned') {
				theTitle = status_byValue + " To: " + review_byValue;
		   } else {
				theTitle = status_byValue + " By: " + review_byValue;
		   }
		}
		this.projectInitiationViewSummaryForm.setTitle (theTitle)
		/*
		var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	    var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
	    var statusLong = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues['Can'];
	    var theTitle = statusLong + " By " + review_byValue+ " (" + currEm + ")";

		this.projectInitiationViewSummaryForm.setTitle (theTitle);
		*/
     },

     /*
      Sets review_by = ‘ROM’, Saves panel 2. W Panel is refreshed and C Panel is hidden
     */
     projectInitiationViewSummaryForm_onSubmitToROMCP: function()
     {
        this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","ROM");
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","I");
		//save panels:
		if (!this.validateFields("cp"))
		    return;
		if(!this.projectInitiationViewSummaryForm_onSave()){return false};
		//hide panel in center
		this.hideAllPanelsThatAreNotViewType();
		//refresh west panel
		this.projectViewGrid.refresh();

     },
     
     /*
     Sets review_by = ‘PAG’, Saves panel 2. W Panel is refreshed and C Panel is hidden
    */
    projectInitiationViewSummaryForm_onSubmitToPagCA: function()
    {
       this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","PAG");
       this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","I");
       //save panels:
       if (!this.validateFields("cp"))
           return;
       if(!this.projectInitiationViewSummaryForm_onSave()){return false};
       //hide panel in center
       this.hideAllPanelsThatAreNotViewType();
       //refresh west panel
       this.projectViewGrid.refresh();
    },
    
     /*
     Sets review_by = ‘CA’, Saves panel 2. W Panel is refreshed and C Panel is hidden
    */
    projectInitiationViewSummaryForm_onSubmittocaCP: function()
    {
       this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","CA");
       this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","I");
       //save panels:
       if (!this.validateFields("cp"))
           return;
       if(!this.projectInitiationViewSummaryForm_onSave()){return false};
       //hide panel in center
       this.hideAllPanelsThatAreNotViewType();
       //refresh west panel
       this.projectViewGrid.refresh();
    },
    
	/*
      Validate that all editable fields are filled, saves panel, then open Send to Endorser Popup
     */
     projectInitiationViewSummaryForm_onSubmitToEndorserCP: function()
     {
	 	if (!this.validateFields("endorsed"))
		    return;
		//save again in case updates are there
	    if(!this.projectInitiationViewSummaryForm_onSave()){return false};

		//open the endorser popup
		var currRest =  null;
        try
		{
		 currRest = this.projectInitiationViewSummaryForm.restriction["uc_pir.pir_id"];
		}
		catch(e) {}

		if (currRest != null)
		{
			View.openDialog('uc-pir-reject.axvw?myButton=endorserReturn', {'uc_pir.pir_id':currRest}, false, {
			width: 650,
			height: 450,
			closeButton: false,
			button: 'endorserReturn'
			});
		} else alert ('Unable to get the current project id.');


	  },

	  /*
	  Validate that all editable fields are filled in
	  then saves panel 3 2 and
	  sets the approver_cp = logged in em_id and review_by = “PM” {Project Mgmt } .
	  W Panel is refreshed and C Panel is hidden
	  */
	 projectInitiationViewSummaryForm_onSubmittopmCP: function()
     {
	  	//save panels:
		if (!this.validateFields("cp"))
		    return;

		this.showInWindow(this.submitToPm,{
			height:160,
			width:400,
			closeButton:false
		});
		this.submitToPm.refresh("uc_pir.pir_id="+ this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id"));

	},

    projectInitiationViewSummaryForm_onGenerateReportPM: function()
    {
       var pir_id = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
       View.openPaginatedReportDialog("brg-pag-recommendation-report.axvw", {'brgPagRecommendationReportDS':'pir_id = '+pir_id}, null);   
    },
    
	submitToPm_onCancel:function(){
		this.submitToPm.closeWindow();
	},
	submitToPm_onSave: function(){
		if (this.submitToPm.getFieldValue("uc_pir.project_title") == "") {
			this.submitToPm.addInvalidField("uc_pir.project_title", "Project Title is Required to Submit.");
			return false
		}
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.project_title",this.submitToPm.getFieldValue("uc_pir.project_title"));
		this.submitToPm.closeWindow();
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.review_by","PM");
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","AP");
		var currUser = "";
		try { currUser = this.view.user.employee.id; } catch(e) {} ;
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.approver_cp",currUser);
		if(!this.projectInitiationViewSummaryForm_onSave()){return false};

		//On Submit to PM, a pir_pta record for each pta type should be created - only if there is only one source of funding
		var fundPrimary = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.funding_primary");
		var fundSecondary = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.funding_secondary");
		var fundTertiary = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.funding_tertiary");
		//if (fundPrimary != "-" && fundSecondary == "-" && fundTertiary == "-")
		//{ //commented out per Bryan's request
		//var pta_types = BRG.Common.getEnumList("uc_pir_pta","pta_type").split(";");
		var currType = "";
		var parameters = null;
		/* var pir_id = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		for (var i=0; i < pta_types.length-1; i=i+2){
			currType = pta_types[i];
			parameters = {
                tableName: "uc_pir_pta",
                fields: toJSON({
				        "uc_pir_pta.pta_type": currType,
						"uc_pir_pta.pir_id": pir_id})
            };
			try {Workflow.call('AbCommonResources-saveRecord', parameters);}catch(e) {} ;


		}//for */
		//}//if

		//hide panel in center
		this.hideAllPanelsThatAreNotViewType();
		//refresh west panel
		this.projectViewGrid.refresh();
		return true;
	 },
	 showInWindow: function (panel, config) {
        View.ensureInViewport(config);
        if (panel.window) {
            panel.window.show();
            if (valueExists(config.x) && valueExists(config.y)) {
                panel.window.setPosition(config.x, config.y)
            }
            panel.afterLayout();
            if (config.restriction) {
                panel.refresh(config.restriction);
            }
            return;
        }
        View.ensureInViewport(config);
        var A = {
            contentEl: panel.getWrapperElementId(),
            height: config.height,
            width: config.width,
            layout: "fit",
            modal: typeof (config.modal) !== "undefined" ? config.modal : true,
            shadow: true,
            autoScroll: true,
            closable: typeof (config.closable) !== "undefined" ? config.closable : true,
            maximizable: typeof (config.maximizable) !== "undefined" ? config.maximizable : true,
            collapsible: typeof (config.collapsible) !== "undefined" ? config.collapsible : true,
            closeAction: "hide",
            bodyStyle: "background-color: white;"
        };
		if((typeof (config.closeButton) !== "undefined" ? config.closeButton : true)){
			A.buttons = [{
                id: "closeButton",
                text: panel.getLocalizedString(View.z_TITLE_CLOSE),
                handler: panel.closeWindow.createDelegate(panel),
                hidden: (valueExists(config.closeButton) && config.closeButton == false),
                hideMode: "visibility"
            }]
		}
        panel.window = new Ext.Window(A);
        panel.window.show();
        if (valueExists(config.x) && valueExists(config.y)) {
            panel.window.setPosition(config.x, config.y)
        } if (valueExists(config.maximize) && config.maximize) {
            panel.window.maximize();
        }
        panel.afterLayout();
        if (config.restriction) {
            panel.refresh(config.restriction);
        }
    },

	 /*
	 Validates Endorser Comments is filled in and Rank <> 0,
	 then saves panel 3 and sets the approver_en = logged in em_id and review_by  to “CPE” {Campus Planning Endorsed}
	 and refreshes page removing the project from the list and details panel
	 */
	 projectInitiationViewSummaryForm_onEndorserdEn : function()
	 {
	  this.endorserPanel.clearValidationResult();
      var commentsValue = this.endorserPanel.getFieldValue("uc_pir.comments_en") ;
	  var rankValue = this.endorserPanel.getFieldValue("uc_pir.rank") ;
	  if (commentsValue == "")
	     this.endorserPanel.addInvalidField("uc_pir.comments_en", "Endorser Comments are required.");
	  if (rankValue == "0" || rankValue == "-")
	     this.endorserPanel.addInvalidField("uc_pir.rank", "A value for rank is required.");
      if (!this.endorserPanel.validateFields()) return;
	  var currUser = "";
	  try { currUser = this.view.user.employee.id; } catch(e) {} ;

	  this.endorserPanel.setFieldValue("uc_pir.approver_en",currUser);
	  this.endorserPanel.setFieldValue("uc_pir.review_by","CPE");
	  if (!this.endorserPanel.save()){return false};
	  //hide panel in center
	  this.hideAllPanelsThatAreNotViewType();
	  //refresh west panel
	  this.projectViewGrid.refresh();

	 },



	/*
	   Saves panel 3, Opens the Return/Reject Popup
	 */
	 projectInitiationViewSummaryForm_onNotendorserdEn : function()
	 {
	   if(!this.endorserPanel.save()){return false};
	   //open the endorser popup
		var currRest =  null;
        try
		{
		 currRest = this.endorserPanel.restriction["uc_pir.pir_id"];
		}
		catch(e) {}

		if (currRest != null)
		{
			View.openDialog('uc-pir-reject.axvw', {'uc_pir.pir_id':currRest}, false, {
			width: 600,
			height: 350,
			closeButton: false,
			button: 'notEndorsed'
			});
		} else alert ('Unable to get the current project id.');
	 },


	 /*
	 Validate that all editable fields are filled in then saves panel 3 2 and sets the approver_rom = logged in em_id and review_by = “FMDCPR” {Facility MgmtCampus Planning ROM }
	 */
	 projectInitiationViewSummaryForm_onSubmitROM : function()
	 {
	  //this.campusPlanningPanel.clearValidationResult();
 	  this.pmoPanel.clearValidationResult();
 //     var romValue = this.campusPlanningPanel.getFieldValue("uc_pir.rom") ;
      var romValue = this.pmoPanel.getFieldValue("uc_pir.rom") ;
	  if (romValue == "")
	    // this.campusPlanningPanel.addInvalidField("uc_pir.rom", "Estimated ROM is required.");
	     this.pmoPanel.addInvalidField("uc_pir.rom", "Estimated ROM is required.");
    //  if (!this.campusPlanningPanel.validateFields()) return;
		if (!this.pmoPanel.validateFields()) return;
	  var currUser = "";
	   try { currUser = this.view.user.employee.id; } catch(e) {} ;
	 // this.campusPlanningPanel.setFieldValue("uc_pir.approver_rom",currUser);
	  this.pmoPanel.setFieldValue("uc_pir.approver_rom",currUser);
	  //this.campusPlanningPanel.setFieldValue("uc_pir.review_by","CPR");
	  this.pmoPanel.setFieldValue("uc_pir.review_by","CAR");
	 // if(!this.campusPlanningPanel.save()){return false};
	  if(!this.pmoPanel.save()){return false};
	  //hide panel in center
	  this.hideAllPanelsThatAreNotViewType();
	  //refresh west panel
	  this.projectViewGrid.refresh();

	 },

	 /*
	 Saves panel 2 & 4 Opens the Return/Reject Popup
	 */
	 projectInitiationViewSummaryForm_onRejectPM : function()
	 {
	    if(!this.projectInitiationViewSummaryForm_onSave()){return false};
		this.projectInitiationViewSummaryForm_RejectReturnButton('rejectToRequestor');
	 },
	 projectInitiationViewSummaryForm_onReturnCA : function(){
	    this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.approver_cp","");
		if (this.endorserPanel.getFieldValue("uc_pir.endorser") == ""){
			this.campusPlanningPanel.setFieldValue("uc_pir.review_by","CP");
		}
		else {
			this.campusPlanningPanel.setFieldValue("uc_pir.review_by","CPE");
		}

		if(!this.campusPlanningPanel.save()){return false};
		//hide panel in center
		this.hideAllPanelsThatAreNotViewType();
		//refresh west panel
		this.projectViewGrid.refresh();
	 },
     projectInitiationViewSummaryForm_onReturnPM : function(){

         this.campusPlanningPanel.setFieldValue("uc_pir.review_by","CA");
         this.campusPlanningPanel.setFieldValue("uc_pir.status","I");


         if(!this.campusPlanningPanel.save()){return false};
         //hide panel in center
         this.hideAllPanelsThatAreNotViewType();
         //refresh west panel
         this.projectViewGrid.refresh();
      },
      projectInitiationViewSummaryForm_onReturnPAG : function(){

          this.campusPlanningPanel.setFieldValue("uc_pir.review_by","CAR");
          this.campusPlanningPanel.setFieldValue("uc_pir.status","I");


          if(!this.campusPlanningPanel.save()){return false};
          //hide panel in center
          this.hideAllPanelsThatAreNotViewType();
          //refresh west panel
          this.projectViewGrid.refresh();
       },

     projectInitiationViewSummaryForm_onCancelPAG : function()
     {
        if(!this.projectInitiationViewSummaryForm_onSave()){return false};
        this.projectInitiationViewSummaryForm_RejectReturnButton('cancelPAG');
     },

	 
	 /*
	 Validate that all editable fields are filled in then saves panel 4 2 and sets the approver_pm = logged in em_id and status = "P"
     status = “P” {Postponed}
	 */
	 projectInitiationViewSummaryForm_onPostponedPM : function()
	 {
	    /* original version: var currUser = "";
		try { currUser = this.view.user.employee.id; } catch(e) {} ;
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.approver_rom",currUser);
		this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.status","PP");
		this.projectInitiationViewSummaryForm_onSave();
		//refresh west panel
	    this.projectViewGrid.refresh();
		end original version */

		/* *** updated version  *** */

		//open the postpone popup
		var currRest =  null;
        try
		{
		 currRest = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		}
		catch(e) {}

		if (currRest != null)
		{
			View.openDialog('uc-pir-postpone-popup.axvw', {'uc_pir.pir_id':currRest}, false, {
			width: 550,
			height: 370,
			closeButton: false
			});
		} else alert ('Unable to get the current project id.');
	 },


	//onSave  save all panels in the view
    projectInitiationViewSummaryForm_onSave: function()
    {
    	//validate all values and save the record
	   	if(!this.projectInitiationViewSummaryForm.save()){return false};
        if(!this.projectInitiationSummaryPanel.save()){return false};
		this.moveYearsToFields();
			//validate all values and save the record
		//if (!this.validatePanelFields(this.fundingPanel)) return false;

		if(!this.fundingPanel.save()){return false};
		var cfPanel = View.panels.get("projectInitiationCommentsForm");
		if (cfPanel != undefined) {
			if(!this.projectInitiationCommentsForm.save()){return false};
		}
		
        var appendicesPanel = View.panels.get("appendicesPanel");
        if (appendicesPanel != undefined) {
            //this means we have a cp panel
            if(!this.appendicesPanel.save()){return false};
        }
        
		var cpPanel = View.panels.get("campusPlanningPanel");
		if (cpPanel != undefined) {
			//this means we have a cp panel
			if(!this.campusPlanningPanel.save()){return false};
		}
		var pmPanel = View.panels.get("pmoPanel");
		if (pmPanel != undefined) {
			//this means we have a pm panel
			if(!this.pmoPanel.save()){return false};
		}
		var enPanel = View.panels.get("endorserPanel");
		if (enPanel != undefined && enPanel.visible) {
		//this means we have a endorser panel
		    if(!this.endorserPanel.save()){return false};
		}
		
        var caPanel = View.panels.get("campusArchitecturePanel");
        if (caPanel != undefined) {
            if(!caPanel.save()){return false};
        }
        
        var pagPanel = View.panels.get("pagPanel");
        if (pagPanel != undefined) {
            if(!pagPanel.save()){return false};
        }

        return true;
    },

   campusPlanningPanel_afterRefresh: function()
	{
	   //	<field name="rom" table = "uc_pir"
	   //  hidden= "${(record['uc_pir.review_by'] != 'CPE' &amp;&amp; record['uc_pir.review_by'] != 'CPR' &amp;&amp; record['uc_pir.review_by'] != 'CP' &amp;&amp; record['uc_pir.review_by'] != 'PM') }"
	   //readOnly="${(record['uc_pir.review_by'] == 'PM' || record['uc_pir.review_by'] != 'ROM' )}" colspan="2" />

	   var inReviewBy = this.campusPlanningPanel.getFieldValue('uc_pir.review_by');
	   var status = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.status');
//	   var romFieldElement = this.campusPlanningPanel.getFieldElement('uc_pir.rom');
//	   var romLabelElement = this.campusPlanningPanel.getFieldLabelElement('uc_pir.rom');
	   if ((inReviewBy == 'CP' && status == 'I') || (inReviewBy == 'CPE' && inReviewBy == 'CPR' && inReviewBy != 'CP' && inReviewBy !='PM' ))
	   {
//	     romFieldElement.style.display= 'none';
//	     this.hideFieldLabel('campusPlanningPanel','uc_pir.rom');
		}
	   else
	   {
//	     romFieldElement.style.display= 'inline';
//		 romLabelElement.style.display= 'inline';
//this.showFieldLabel('campusPlanningPanel','uc_pir.rom');
		 }

	},
	pmoPanel_afterRefresh: function(){
		
	
	},
	

	  /*
	  function used to hide all panels that are not referencing a view file
	  */
     hideAllPanelsThatAreNotViewType: function()
     {
       var allPanels = View.panels.items;
       for(var i = 0; i < allPanels.length; i++)
       {
         var currType = allPanels[i].type;
 	     if (currType != 'viewPanel')
	            allPanels[i].show(false);
       }
     },

	 /*
	  function used to refresh all panels that are not referencing a view file
	  */
     refreshAllPanelsThatAreNotViewType: function()
     {
       var allPanels = View.panels.items;
       for(var i = 0; i < allPanels.length; i++)
       {
         var currType = allPanels[i].type;
 	     if (currType != 'viewPanel')
			var pnlVis = allPanels[i].visible
	        allPanels[i].refresh();
			if (!pnlVis){
				allPanels[i].show(false,true)
			}
       }
     },

	 /*
	 Reject Return button
	 */
    projectInitiationViewSummaryForm_RejectReturnButton: function(buttonType)
     {
        var currRest =  null;
        try
		{
			currRest = this.projectInitiationViewSummaryForm.restriction["uc_pir.pir_id"];
			/*if (currRest == null)
			{
				var clauses = this.projectInitiationViewSummaryForm.restriction.clauses;
				for (var i =0 ; i < clauses.length; i ++)
					if (clauses[i].name == "uc_pir_doc.pir_id")
						currRest = clauses[i].value;
			}
			*/
		}
		catch(e) {}

		if (currRest != null)
		{
			View.openDialog('uc-pir-reject.axvw?myButton=return', {'uc_pir.pir_id':currRest}, false, {
			width: 600,
			height: 350,
			closeButton: false,
			button: buttonType
			});
		} else alert ('Unable to get the current project id.');
	},

	projectInitiationViewSummaryForm_onCreateprojectPM: function()
	{
	   //validate that all pta comments are entered
/* 	   try
	   {
	     var theGrid = View.panels.get("ptaGrid");
		 var gridData = theGrid.gridRows.items;
		 var currComm = "";
		 var errorMessage = "";
		 var errorStatus = false;
		 for (var i=0; i < gridData.length; i++)
		   {
		      currComm = gridData[i].getFieldValue("uc_pir_pta.comments");
			  if (currComm == "")
			  {
			    errorMessage = "Comments are required for all PTA types. Comments are missing for: " + gridData[i].record["uc_pir_pta.pta_type"];
				errorStatus = true;
				break;
			  }
		   }

		 if (errorStatus == true)
		 {
		   this.view.showMessage (errorMessage);
		   return;
		 }
	   }
	   catch(e)
	   {} */

	   //display project creation popup
	   var currRest =  null;
        try
		{
		 currRest = this.projectInitiationViewSummaryForm.restriction["uc_pir.pir_id"];
		}
		catch(e) {}
		if (currRest != null)
		{
			View.openDialog('uc-pir-pm-create-proj.axvw', {'uc_pir.pir_id':currRest}, false, {
			width: 750,
			height: 650,
			closeButton: false
			});
		} else alert ('Unable to get the current project id.');
	},

 /*   projectInitiationDocsPanel_afterRefresh:function()
	{
	  var status = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.status');
	  var review_by = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.review_by');

	  if (review_by == 'C' && status == 'C')
	  {
		    this.projectInitiationDocsPanel.actions.get("add").show(true);
		}
	  else
      {
	     if (status != 'I'|| review_by != 'EN')
		   this.projectInitiationDocsPanel.actions.get("add").show(false);
	     else
	       this.projectInitiationDocsPanel.actions.get("add").show(true);
	   }

	},
*/
	fundingPanel_afterRefresh: function()
	{
	   var review_by = 	this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	   if (review_by != 'C') //make drop downs read only
	   {
	   	 makeFieldReadOnly (document.getElementById('from_primary'));
		 makeFieldReadOnly (document.getElementById('to_primary'));
	     makeFieldReadOnly (document.getElementById('from_secondary'));
		 makeFieldReadOnly (document.getElementById('to_secondary'));
		 makeFieldReadOnly (document.getElementById('from_tertiary'));
		 makeFieldReadOnly (document.getElementById('to_tertiary'));
	   }
	   else
	     {
		 enableReadOnlyField (document.getElementById('from_primary'));
		 enableReadOnlyField (document.getElementById('to_primary'));
	     enableReadOnlyField (document.getElementById('from_secondary'));
		 enableReadOnlyField (document.getElementById('to_secondary'));
		 enableReadOnlyField (document.getElementById('from_tertiary'));
		 enableReadOnlyField (document.getElementById('to_tertiary'));
		 }
	 this.moveFieldValuesToYearsHTML(); //populate the year dropdowns with values

	 //update total costs
	 this.updateEstimatedAmountsTotal();
	},

	//move funding years values from html element into the hidden fields
    moveYearsToFields: function()
    {
    var fromprimary = document.getElementById("from_primary").value;
	var toprimary = document.getElementById("to_primary").value;
	var fromsecondary = document.getElementById("from_secondary").value;
	var tosecondary = document.getElementById("to_secondary").value;
	var fromtertiary = document.getElementById("from_tertiary").value;
	var totertiary = document.getElementById("to_tertiary").value;
	this.fundingPanel.setFieldValue("uc_pir.years_from_primary", fromprimary);
	this.fundingPanel.setFieldValue("uc_pir.years_to_primary", toprimary);
	this.fundingPanel.setFieldValue("uc_pir.years_from_secondary", fromsecondary);
	this.fundingPanel.setFieldValue("uc_pir.years_to_secondary", tosecondary);
	this.fundingPanel.setFieldValue("uc_pir.years_from_tertiary", fromtertiary);
	this.fundingPanel.setFieldValue("uc_pir.years_to_tertiary", totertiary);
    },

    //function to move the years from db to the html elements
    moveFieldValuesToYearsHTML: function()
    {
	 document.getElementById("from_primary").value = this.fundingPanel.getFieldValue("uc_pir.years_from_primary");
	 document.getElementById("to_primary").value = this.fundingPanel.getFieldValue("uc_pir.years_to_primary");
	 document.getElementById("from_secondary").value = this.fundingPanel.getFieldValue("uc_pir.years_from_secondary");
	 document.getElementById("to_secondary").value = this.fundingPanel.getFieldValue("uc_pir.years_to_secondary");
	 document.getElementById("from_tertiary").value = this.fundingPanel.getFieldValue("uc_pir.years_from_tertiary");
	 document.getElementById("to_tertiary").value = this.fundingPanel.getFieldValue("uc_pir.years_to_tertiary");

	 document.getElementById("frompyr").textContent = this.fundingPanel.getFieldValue("uc_pir.years_from_primary");
	 document.getElementById("topyr").textContent = this.fundingPanel.getFieldValue("uc_pir.years_to_primary");
	 document.getElementById("frompyr").innerText = this.fundingPanel.getFieldValue("uc_pir.years_from_primary");
	 document.getElementById("topyr").innerText = this.fundingPanel.getFieldValue("uc_pir.years_to_primary");

	 document.getElementById("fromsyr").textContent = this.fundingPanel.getFieldValue("uc_pir.years_from_secondary");
	 document.getElementById("tosyr").textContent = this.fundingPanel.getFieldValue("uc_pir.years_to_secondary");
	 document.getElementById("fromsyr").innerText = this.fundingPanel.getFieldValue("uc_pir.years_from_secondary");
	 document.getElementById("tosyr").innerText = this.fundingPanel.getFieldValue("uc_pir.years_to_secondary");
	 document.getElementById("fromtyr").textContent = this.fundingPanel.getFieldValue("uc_pir.years_from_tertiary");
	 document.getElementById("totyr").textContent = this.fundingPanel.getFieldValue("uc_pir.years_to_tertiary");
	 document.getElementById("fromtyr").innerText = this.fundingPanel.getFieldValue("uc_pir.years_from_tertiary");
	 document.getElementById("totyr").innerText = this.fundingPanel.getFieldValue("uc_pir.years_to_tertiary");


	},

    hideFieldLabel: function(panelId, fieldId)
	{
	   //this.showFieldLabelForRow(panelId, fieldId);
	   var domId = panelId + "_" + fieldId + "_labelCell";
	   var theTarget = document.getElementById (domId);
	   //theTarget.parentElement.style.display = "block";
	   theTarget.style.display = "none";
	},

	showFieldLabel: function(panelId, fieldId)
	{
	   //this.showFieldLabelForRow(panelId, fieldId);
	   var domId = panelId + "_" + fieldId + "_labelCell";
	   var theTarget = document.getElementById (domId);
	   //theTarget.parentElement.style.display = "block";
	  // theTarget.style.display = "inline";
	},

    //function to update field values for panels that have the same field names - used to populate the top panel
    updateFieldValuesForSimilarPanels: function( toBeUpdatedPanel, sourcePanel)
     {
       	var firstPanelFields = toBeUpdatedPanel.fields;
	var secondPanelFields = sourcePanel.fields;
	//go through all the fields of each panel and update the values in first where they match
	for (var i=0 ; i < firstPanelFields.length; i++)
	  {
	    for (var j=0; j < secondPanelFields.length; j ++)
	    {
	       if (firstPanelFields.keys[i] == secondPanelFields.keys[j])
                  toBeUpdatedPanel.setFieldValue(secondPanelFields.keys[j],sourcePanel.getFieldValue(secondPanelFields.keys[j]));
            }
	  }
     },

    //estimated amounts have to be > 0 if source of funding is provided
    validateEstimatedAmounts: function()
    {
      var primarySource = this.fundingPanel.getFieldValue("uc_pir.funding_primary");
      var secondarySource = this.fundingPanel.getFieldValue("uc_pir.funding_secondary");
      var tertiarySource = this.fundingPanel.getFieldValue("uc_pir.funding_tertiary");
      var primaryAmount = parseFloat(this.fundingPanel.getFieldValue("uc_pir.cost_est_primary")).toFixed(2);
      var secondaryAmount = parseFloat(this.fundingPanel.getFieldValue("uc_pir.cost_est_secondary")).toFixed(2);
      var tertiaryAmount = parseFloat(this.fundingPanel.getFieldValue("uc_pir.cost_est_tertiary")).toFixed(2);
      if (primarySource != "")
      {
         if (primaryAmount == 0 && !(primarySource =="SPC" || primarySource =="LTP")) {this.fundingPanel.addInvalidField("uc_pir.cost_est_primary", "Primary Estimated Amount must be greater than 0.");}
      }
      if (secondarySource != "-")
      {
      if (secondaryAmount == 0 && !(secondarySource =="SPC" || primarySource =="LTP")) {this.fundingPanel.addInvalidField("uc_pir.cost_est_secondary", "Secondary Estimated Amount must be greater than 0.")}
      }
      if (tertiarySource != "-")
      {
         if (tertiaryAmount == 0 && !(tertiarySource =="SPC" || primarySource =="LTP")) {this.fundingPanel.addInvalidField("uc_pir.cost_est_tertiary", "Tertiary Estimated Amount must be greater than 0.");}
      }
    },

	validateFundingSources: function()
	{
	 	   	try {document.getElementById("errmsgp").innerText = "";} catch (e) {}
			try {document.getElementById("errmsgs").innerText = ""; } catch (e) {}
			try {document.getElementById("errmsgt").innerText = ""; } catch (e) {}
			try {document.getElementById("errmsgp").textContent = ""; } catch (e) {}
			try {document.getElementById("errmsgs").textContent = ""; } catch (e) {}
			try {document.getElementById("errmsgt").textContent = ""; } catch (e) {}

			var targetCompletionDate = this.projectInitiationSummaryPanel.getFieldValue("uc_pir.date_est_completion");
			targetCompletionDate = targetCompletionDate.replace(/-/g,"/"); //make sure we have the right date format
			var targetDate = new Date(targetCompletionDate);

			var primarySource = this.fundingPanel.getFieldValue("uc_pir.funding_primary");
			var secondarySource = this.fundingPanel.getFieldValue("uc_pir.funding_secondary");
			var tertiarySource = this.fundingPanel.getFieldValue("uc_pir.funding_tertiary");
			var fundingYearsP = parseInt(document.getElementById("from_primary").value);
			var fundingYearsPTo = parseInt(document.getElementById("to_primary").value);
			var fundingYearsS = parseInt(document.getElementById("from_secondary").value);
			var fundingYearsSTo = parseInt(document.getElementById("to_secondary").value);
			var fundingYearsT = parseInt(document.getElementById("from_tertiary").value);
			var fundingYearsTTo = parseInt(document.getElementById("to_tertiary").value);
			var targetDateYear = targetDate.getFullYear();

			var endingYearMatched = false;

			if (primarySource != "-")
			{
				if (fundingYearsP > fundingYearsPTo)
				{
				  try {document.getElementById("errmsgp").textContent = "To year has to be greater or equal than the From year.";} catch (e) {}
				  try {document.getElementById("errmsgp").innerText = "To year has to be greater or equal than the From year."; } catch (e) {}
				  View.showMessage('Error', 'Validation Error for the primary fiscal years', 'There are validation errors for the primary fiscal years. Please correct them and resubmit the form.');
				  return false;
				}
//				else {
				/*if (fundingYearsP < targetDateYear)
					  this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date cannot be less than the From primary funding year.");
				else*/
/*				   if (fundingYearsPTo > targetDateYear) {
					  this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date cannot be greater than the To Funding Years.");
					  this.projectInitiationSummaryPanel.addInvalidField("p_funding_years", "Target Date cannot be greater than the To Funding Years.");
					 }

					if (fundingYearsPTo == targetDateYear) {
						endingYearMatched = true;
					}
				}
*/
			}

			if (secondarySource != "-")
				{
				if (fundingYearsS > fundingYearsSTo)
				{
				  try {document.getElementById("errmsgs").textContent = "To year has to be greater or equal than the From year."} catch(e){};
				  try {document.getElementById("errmsgs").innerText = "To year has to be greater or equal than the From year."} catch(e) {};
				  View.showMessage('Error', 'Validation Error for the secondary fiscal years', 'There are validation errors for the secondary fiscal years. Please correct them and resubmit the form.');
				  return false;
				  }
//				else {
				/*if (fundingYearsS > targetDateYear )
					  this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date cannot be less than the From secondary funding year.");
				else*/
/*					if (fundingYearsSTo > targetDateYear ) {
						  this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date cannot be greater than the To Funding Years.");
						  this.projectInitiationSummaryPanel.addInvalidField("s_funding_years", "Target Date cannot be greater than the To Funding Years.");
					}


					if (fundingYearsSTo == targetDateYear) {
						endingYearMatched = true;
					}
				}
*/
            }

			if (tertiarySource != "-")
			{
			  if (fundingYearsT > fundingYearsTTo)
				{
				  try {document.getElementById("errmsgt").textContent = "To year has to be greater or equal than the From year."} catch (e) {};
				  try {document.getElementById("errmsgt").innerText = "To year has to be greater or equal than the From year."} catch (e) {};
				  View.showMessage('Error', 'Validation Error for the tertiary fiscal years', 'There are validation errors for the tertiary fiscal years. Please correct them and resubmit the form.');
			      return false;
				  }
//				else {
               /*if (fundingYearsT < targetDateYear)
				  this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date cannot be less than the From tertiary funding year.");
             else*/
/*				   if (fundingYearsTTo > targetDateYear) {
					  this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date cannot be greater than the To Funding Years.");
					  this.projectInitiationSummaryPanel.addInvalidField("t_funding_years", "Target Date cannot be greater than the To Funding Years.");
					}


					if (fundingYearsTTo == targetDateYear) {
						endingYearMatched = true;
					}
				}
 */
           }

/*			if (!endingYearMatched && (primarySource != "-" || secondarySource != "-" || tertiarySource != "-")) {
				this.projectInitiationSummaryPanel.addInvalidField("uc_pir.date_est_completion", "Target Date must be equal to at least one of the To Funding Years.");
				this.projectInitiationSummaryPanel.addInvalidField("p_funding_years", "");
				this.projectInitiationSummaryPanel.addInvalidField("s_funding_years", "");
				this.projectInitiationSummaryPanel.addInvalidField("t_funding_years", "");
			}
*/
			return true;

	},
	//function that validates fields
	//returns true if all valid, false otherwise
	validateFields: function(whichUser)
	{

	   switch(whichUser)
	   {
	     case 'cp': //validate fields for cp
		    {
			//validate top section
			if (!this.validatePanelFields (this.projectInitiationViewSummaryForm)) return false;
            //validate summary section
			if (!this.validatePanelFields (this.projectInitiationSummaryPanel)) return false;
            //validate funding section
            if (!this.validatePanelFields (this.fundingPanel)) return false;
			break;
			}
		case 'cust': //validate fields for cust
		  {
            this.projectInitiationSummaryPanel.clearValidationResult();
			this.fundingPanel.clearValidationResult();

  		    if (!this.validateFundingSources()) return false;

		    this.projectInitiationSummaryPanel.validateFields();
			if (!this.projectInitiationSummaryPanel.validationResult.valid)
			return false;
		    //validate summary section
			if (!this.validatePanelFields (this.projectInitiationSummaryPanel)) return false;
            //validate funding section
            if (!this.validatePanelFields (this.fundingPanel)) return false;
		    break;
		  }
		case 'custNew': //validate fields for cust
		  {
		    //validate summary section
			//if (!this.validatePanelFields (this.projectInitiationSummaryPanel)) return false;
            //validate funding section
            //if (!this.validatePanelFields (this.fundingPanel)) return false;
			this.projectInitiationSummaryPanel.clearValidationResult();

  		    if (!this.validateFundingSources()) return false;

			this.projectInitiationSummaryPanel.validateFields();
			if (!this.projectInitiationSummaryPanel.validationResult.valid)
				  return false;
		    return true;
		    break;
		  }
		case 'endorser': //validate fields for endorser -- kept this separate even though similar to cp - might need to add to this section
		    {
			//validate top section
			if (!this.validatePanelFields (this.projectInitiationViewSummaryForm)) return false;
            //validate summary section
			if (!this.validatePanelFields (this.projectInitiationSummaryPanel)) return false;
            //validate funding section
            if (!this.validatePanelFields (this.fundingPanel)) return false;
			break;
			}

	   }//end switch
	   return true;
	}, //end validateFields

	validatePanelFields: function (thePanel)
	{
			thePanel.clearValidationResult();
			//validate Drivers - can't be -
			if (thePanel.id == 'projectInitiationSummaryPanel')
			{
			  var driverValue = thePanel.getFieldValue("uc_pir.driver");
			  if (driverValue == '-')
				  thePanel.addInvalidField("uc_pir.driver", "Drivers value is required (cannot be TBD).");
			}
			if (thePanel.id == 'fundingPanel')
			{
			  //the user must have selected a Primary Source of Funding (<> '-'), but is not required to pick a Secondary or Tertiary Funding Source.
			  var primarySource = thePanel.getFieldValue("uc_pir.funding_primary");
			  if (primarySource == '-')
				  thePanel.addInvalidField("uc_pir.funding_primary", "Primary Funding Source is required (cannot be TBD).");
			  this.validateEstimatedAmounts();
			}
			thePanel.validateFields();
			if (!thePanel.validationResult.valid)
				  return false;
		    return true;
	}
	,
	//function that returns the enumlist for a specified field
	getEnumList: function(table_name, field_name)
	{
		if (typeof(table_name) == null || table_name == '' ||
			typeof(field_name) == null || field_name == '')
			return "";

		var restriction = new AFM.view.Restriction();
		restriction.addClause('afm_flds.table_name', table_name, '=');
		restriction.addClause('afm_flds.field_name', field_name, '=');

		var record = this.getDataRecords('afm_flds', ['afm_flds.enum_list'], restriction);

		var enumList = "";
		if (typeof(record) != 'undefined' && record.length > 0) {
		  enumList = (record[0]['afm_flds.enum_list'] == null ? "" : record[0]['afm_flds.enum_list']);
		}

	  return enumList;
	},

		/*function that sends the emails

	    /**
     * Sends an email to the specified recipients using a template from the messages table.
     *
     * @param activityId The activity_id of the message template from the messages table.
     * @param referencedBy The referenced_by field of the message template from the messages table.
     * @param bodyMessageCode  The message_id of the message template for the body of the email.
     * @param subjectMessageCode The message_id of the message template for the subject of the email.
     * @param tableName  The table name for the record being used to fill the message template.
     * @param keyField  The primary key field name for the record being used to fill the message template.
     * @param keyValue  The primary key value of the record used to fill the template.
     * @param axvwLink  The axvw page used for the {link} parameter in the template.
     * @param email   Semi-comma separated list of email recipients.

		public void sendEmail(String activityId, String referencedBy, String bodyMessageCode, String subjectMessageCode,
	 String tableName, String keyField, String keyValue, String axvwLink, String email) {
		}
	*/
	sendUCEmail: function(emailtype)
	{
	  var theEmId = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.requestor");
	  var targetEmail = BRG.Common.getDataValue("em","email","em_id='" + theEmId + "'");

	  switch (emailtype)
	  {
	    case 'customer':
		       {
				try {
				  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbCapitalBudgeting', 'UC_EMAIL_WFR',
				   'UC_PIR_REQUESTOR_EMAIL_BODY','UC_PIR_REQUESTOR_EMAIL_SUBJECT','uc_pir','pir_id',this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.pir_id'),
				   'uc-view-my-requests.axvw', targetEmail);
				 }
				 catch (ex) {
				    this.view.showMessage ('There was an error when trying to send the Requestor email. ' + ex.code + '  ' + ex.message+ ' . Email is going to ' + targetEmail);
				 }
                break;
			   }//

	    case 'customerApproval':
		     {
			   try {
				  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbCapitalBudgeting', 'UC_EMAIL_WFR',
				   'UC_PIR_REQ_APPROVAL_EMAIL_BODY','UC_PIR_REQ_APPROVAL_EMAIL_SUBJECT','uc_pir','pir_id',this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.pir_id'),
				   'uc-view-my-requests.axvw', targetEmail);
				 }
				 catch (ex) {
				     this.view.showMessage ('There was an error when trying to send the Requestor Approval email. ' + ex.code + '  ' + ex.message+ ' . Email is going to ' + targetEmail);
				 }
                break;
			 }

       }//switch

	 },

	   readOnlyPanelFields: function(panel)
   {
     //get all panel fields
	 var panelFields = panel.fields.items;
	 for (var i =0 ; i< panelFields.length; i++)
	     panelFields[i].config.readOnly = true;

   },

   processPanels: function ()
   {
     var allPanels = this.view.panels.items;
	 var currType = null;
	 var currPanel = null;
	 var allColumns = null;
	 var theButton = null;
     for (var i = 0; i < allPanels.length; i ++)
     {
	    currType = allPanels[i].type;
		currPanel = this.view.panels.get(allPanels[i].id);
		if (currType == 'form') //then make it readonly
		    	 this.readOnlyPanelFields (currPanel);
/* 		if (allPanels[i].id == 'ptaGrid') //hide columns that are button and checkbox type in the pta grid
		  {
		    allColumns = currPanel.columns;
			theButton = currPanel.actions.get ("request_comments");
            for (var j = 0 ; j < allColumns.length ; j++)
			  {
			     if (allColumns[j].type == 'checkbox' || allColumns[j].type == 'button')
				 {
                          allColumns[j].hidden = true;
                          theButton.hidden = true;
				  }
			  }//for
   			theButton.show(false);
		  } *///if
/*		if (allPanels[i].id == 'projectInitiationDocsPanel')
        {
		   try
		   {
		    currPanel.actions.get("add").show(false);
		   }
		   catch(e){}
		}//if
*/
	 }
   },

   onRequestorButtonClick: function() {
		this.pnlrequestorInfo.showInWindow({
			newRecord: false, 
			width: 600, 
			height: 300,
			closeButton: true 
		});

		/*
		this.showInWindow(this.pnlrequestorInfo,{
			height:300,
			width:600,
			closeButton:true
		});
		*/
		this.pnlrequestorInfo.refresh("em.em_id='"+ this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.requestor").replace(/'/g,"''") + "'");
		
		

     	/*View.openDialog('uc-pir-requestor.axvw', '', false, {
			width: 800,
			height: 750,
			closeButton: true
			});
		*/
   },

   updateEstimatedAmountsTotal: function()
   {

         var primaryAmount = parseFloat(this.fundingPanel.getFieldValue("uc_pir.cost_est_primary"));
	 var secondaryAmount = parseFloat(this.fundingPanel.getFieldValue("uc_pir.cost_est_secondary"));
	 var tertiaryAmount = parseFloat(this.fundingPanel.getFieldValue("uc_pir.cost_est_tertiary"));


	 if (isNaN(primaryAmount) || isNaN(secondaryAmount) || isNaN(tertiaryAmount)) return;

	 var total = primaryAmount + secondaryAmount + tertiaryAmount;

	 total = Ext.util.Format.usMoney(parseFloat(total).toFixed(2));

	 var target = document.getElementById("totalSum");
	 target.innerHTML = total.replace ("$","");
   },
 /*
   addNewDocument: function() {
	var currRest =  null;

    //if a new request then save the request and then try to add the doc
    if (this.projectInitiationViewSummaryForm.newRecord == true)
	 {
	          if (!this.validateFields("custNew")) return;
			  this.projectInitiationViewSummaryForm_onSaveCustomer();
	 }

	var record = new Ab.data.Record({
		'uc_docs_extension.pkey': this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.pir_id'),
		'uc_docs_extension.table_name': 'uc_pir',
		'uc_docs_extension.doc_type_code': '',
		'uc_docs_extension.created_by': View.user.name,
		'uc_docs_extension.modified_by': View.user.name},
		true); // true means new record
	var ds_object = this.projectInitiationDocsDs.saveRecord(record);

	var restriction = {'uc_docs_extension.uc_docs_extension_id':ds_object.getValue('uc_docs_extension.uc_docs_extension_id')};
	View.openDialog('uc-projrequest-documents-dialog.axvw', restriction, false, {
		width: 600,
		height: 400,
		closeButton: false,
		maximize: false
	});
   },//add new document
*/

   keyPress: function(fld) {
      var el = document.getElementById(fld);
      el.onkeypress = function(evt) {
       evt = evt || window.event;
       var charCode = evt.which || evt.keyCode;
       var charStr = String.fromCharCode(charCode);
       if (charStr == "-") {
           if (evt.preventDefault) {
                evt.preventDefault();
           }
           evt.returnValue = false;
           return false;
        }
   };


   }, //end keyPress

   getEmName: function(emId)
   {
    var rest = "em_id = "+BRG.Common.literalOrNull(emId);
    var emFirstName = "";
    var emLastName = "";
    var emRecord = BRG.Common.getDataValues("em", ["name_first", "name_last"], rest);
    if (emRecord != null) {
        emFirstName = emRecord["em.name_first"]["l"];
		emLastName = emRecord["em.name_last"]["l"];
    }

    return this.capitalizeFirstLetter(emLastName) + ", " + this.capitalizeFirstLetter(emFirstName);
    },//getEmName

	capitalizeFirstLetter: function(string)
    {
    return string.charAt(0).toUpperCase() + string.slice(1);
    },

	fillDvBasedOnDp: function()
	{
	   var dpId = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.dp_id");
	   var rest = "dp_id = "+BRG.Common.literalOrNull(dpId);
	   var dpRecord = BRG.Common.getDataValues("dp", ["dv_id"], rest);
	   //if (dpRecord == undefined)
	   //{
	   //  View.showMessage ("Invalid Department Value was entered.");
	   //  return;
	  // }
	    var dvId = "";
	   if (dpRecord != null)
        dvId = dpRecord["dp.dv_id"]["l"];
	   this.projectInitiationViewSummaryForm.setFieldValue("uc_pir.dv_id", dvId);
	}, //fillDv

	selectTheRoom: function()
	{
	  	View.selectValue(
		'projectInitiationViewSummaryForm',
		'Room',
		['uc_pir.bl_id', 'uc_pir.fl_id', 'uc_pir.rm_id'],
		'rm',
		['rm.bl_id','rm.fl_id','rm.rm_id'],
		['rm.bl_id','rm.fl_id','rm.rm_id'],
		null,
		null,
		true,
		true);
	}
});

function  makeFieldReadOnly(fieldElement)
   {
         fieldElement.readOnly = true;
		 fieldElement.disabled = true;
		 fieldElement.style.border = "1px solid #E8E8F0";
		 fieldElement.style.color = "#000000";
   }
function enableReadOnlyField(fieldElement)
{
         fieldElement.readOnly = false;
		 fieldElement.disabled = false;
		 fieldElement.style.border = "1px solid #7F9DB9";
		 fieldElement.style.color = "#000000";
}

/*function editDocument() {
	var row = this;
	var uc_docs_extension_id = row['uc_docs_extension.uc_docs_extension_id'];

	var restriction = {'uc_docs_extension.uc_docs_extension_id':uc_docs_extension_id};
	View.openDialog('uc-projrequest-documents-dialog.axvw', restriction, false, {
		width: 600,
		height: 400,
		closeButton: false,
		maximize: false
	});
}
*/

function grid_onShow(row) {
    var docId = row['uc_docs_extension.uc_docs_extension_id'];
    var DocFileName = row['uc_docs_extension.doc_name'];
    var keys = { 'uc_docs_extension_id': docId };

    View.showDocument(keys, 'uc_docs_extension', 'doc_name', DocFileName);
}

function docSave(){
	var currRest =  null;

    //if a new request then save the request and then try to add the doc
    if (myController.projectInitiationViewSummaryForm.newRecord == true){
	          if (!myController.validateFields("custNew")) return false;
			  return myController.projectInitiationViewSummaryForm_onSaveCustomer();
	 }
	 return true;
}

function hideShowYearFields(show)
{
    var display1 = 'inline';
    var display = 'none';
    if (show) {
        display1 = "none";
        display = "inline";
    }

    document.getElementById("from_primary").style.display = display;
    document.getElementById("from_secondary").style.display = display;
    document.getElementById("from_tertiary").style.display = display;
    document.getElementById("to_primary").style.display = display;
    document.getElementById("to_secondary").style.display = display;
    document.getElementById("to_tertiary").style.display = display;
    document.getElementById("frompyr").style.display = display1;
    document.getElementById("fromsyr").style.display = display1;
    document.getElementById("fromtyr").style.display = display1;
    document.getElementById("topyr").style.display = display1;
    document.getElementById("tosyr").style.display = display1;
    document.getElementById("totyr").style.display = display1;
}

function fillDvBasedOnDp(field,selVal,prevVal){
	myController.fillDvBasedOnDp()
}
/*
function showYearFields: function()
	{
		 document.getElementById("fundingPanel_primary_labelCell").style.display = "inline";
		 document.getElementById("from_primary").style.display = "inline";
		 document.getElementById("fundingLabel").style.display = "inline";
		 document.getElementById("from_secondary").style.display = "inline";
		 document.getElementById("from_tertiary").style.display = "inline";
		 document.getElementById("to_primary").style.display = "inline";
		 document.getElementById("to_secondary").style.display = "inline";
		 document.getElementById("to_tertiary").style.display = "inline";
		 document.getElementById("fromp").style.display = "inline";
		 document.getElementById("froms").style.display = "inline";
		 document.getElementById("fromt").style.display = "inline";
		 document.getElementById("top").style.display = "inline";
		 document.getElementById("tos").style.display = "inline";
		 document.getElementById("tot").style.display = "inline";
	}
*/
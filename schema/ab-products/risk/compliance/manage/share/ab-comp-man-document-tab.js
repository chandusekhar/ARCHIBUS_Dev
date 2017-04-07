/**

* @author lei

*/
var docController = View.createController('docController',
{
	regloc_id:'',
	reg_requirement:'',
	mainController:'',

	mode:'',

	//restriction from select grid in first tab
	selectRes: " 1=1 ", 
	/**
	 * Set the grid cell content of doc field to be rewritten after being filled;
	 * bind event listeners for doc field in form
	 */
    afterViewLoad: function(){

	    this.abCompDocumentRegulationGrid.afterCreateCellContent = 
				abCompDocCommonController.customAfterCreateCellContentForDoc.createDelegate();

		// bind custom lisenter of doc button to refresh grid when any doc change happens
		this.abCompDocumentRegulationForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_CHECKIN, this.onDocChangeHandler, this);
		this.abCompDocumentRegulationForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION, this.onDocChangeHandler, this);
		this.abCompDocumentRegulationForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_DELETE, this.onDocChangeHandler, this);
	},


	//Custom Event handler: after the document is checked in, version changed or deleted, this function will be called to refresh the grid panel
	onDocChangeHandler: function (panel, fieldName, parameters) {
        this.abCompDocumentRegulationGrid.refresh();
	},

	/**
     * @inherit.
     */
	afterInitialDataFetch: function(){
		//get top controller
		this.mainController=View.getOpenerView().controllers.get(0);
		this.mainController.docController=docController;
		
		//set proper restirction to grid and refresh it
		this.setRestriction();
		this.abCompDocumentRegulationGrid.refresh(); 
		
		//set proper title to grid and form
		this.setProperTitle();
		
    },
    
    /**
	 * Private Function: hide the forms after tab change (IE will crash if panels are hidden beforeTabChange).
     */
	afterTabChange: function(){    	
		this.abCompDocumentRegulationForm.show(false);
	},
      
    /**
     * Private Function called from command of action "Save and Add New".
	 * clear doc field value by custom code; add restriction for new record.
     */
    clearDocumentFieldAndAddResForNewRecord: function(){
		this.abCompDocumentRegulationForm.setFieldValue('docs_assigned.doc','');
    	this.setProperRestrictionFieldValue();
    },

	/**
     * Event Handler for action "Add New" in grid.
     */
    abCompDocumentRegulationGrid_onAddNew: function(){
		this.abCompDocumentRegulationForm.newRecord = true;

		enableAllFieldsOfPanel(this.abCompDocumentRegulationForm,true);
		hideActionsOfPanel(this.abCompDocumentRegulationForm, new Array("saveAndAddNew", "copyAsNew", "save", "delete", "cancel") ,true);
		this.abCompDocumentRegulationForm.refresh(null, true);

    	this.abCompDocumentRegulationForm.enableField("docs_assigned.doc", false);
    	this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.doc", '');    	
	},

	/**
     * Event Handler for action "Save".
     */
    abCompDocumentRegulationForm_onSave: function(){
    	this.abCompDocumentRegulationForm.save();
    	this.abCompDocumentRegulationGrid.refresh();
    	
		//kb 3036188, reset hierarchy_ids value after save.
		var records=this.abCompDocumentRegulationFormDS.getRecords("doc_id = "+ this.abCompDocumentRegulationForm.getFieldValue("docs_assigned.doc_id"));
		var record=records[0];
		this.abCompDocumentRegulationForm.setFieldValue("docfolder.hierarchy_ids", record.getValue('docfolder.hierarchy_ids'));
    },
    
	/**
     * Event Handler for action "Copy as New".
     */
    abCompDocumentRegulationForm_onCopyAsNew: function(){
		var doc_id=this.abCompDocumentRegulationForm.getFieldValue("docs_assigned.doc_id");
		if(doc_id){
			var restriction = new Ab.view.Restriction();
			restriction.addClause('docs_assigned.doc_id' ,doc_id);
			var records=this.abCompDocumentRegulationFormDS.getRecords(restriction);
			var record=records[0];
			this.abCompDocumentRegulationForm.newRecord = true;
			this.abCompDocumentRegulationForm.setRecord(record);
			this.abCompDocumentRegulationForm.setFieldValue('docs_assigned.doc_id','');

			this.setProperRestrictionFieldValue();
		}
    },

	/**
	 * Private Function: configure grid and form to report mode. 
	 */
	setReportMode:function(){

		hideActionsOfPanel(this.abCompDocumentRegulationGrid, new Array("addNew") ,false);
		enableAllFieldsOfPanel(this.abCompDocumentRegulationForm,false);
		hideActionsOfPanel(this.abCompDocumentRegulationForm, new Array("saveAndAddNew", "copyAsNew", "save", "delete", "cancel") ,false);

		this.abCompDocumentRegulationGrid.gridRows.each(function(row) {
			row.actions.get("edit").setTitle(getMessage("detail")); 
		});
	},
	
	/**
	 * Private Function: configure grid and form to Coordinator mode. 
	 */
	setCoordinatorMode:function(){
		
		enableAllFieldsOfPanel(this.abCompDocumentRegulationForm,false);
		hideActionsOfPanel(this.abCompDocumentRegulationForm, new Array("saveAndAddNew", "copyAsNew", "save", "delete") ,false);
		
	},

	/**
     * Event Handler for afterRefresh event of grid.
	 * configure grid and form for report mode and set proper instruction text.
     */
	abCompDocumentRegulationGrid_afterRefresh: function(){
		
		if("report"==this.mainController.mode){
			this.setReportMode();
			
		}
		//If exists special instruction string for Document tab loading in current view, then set it.Only for view 'Manage Compliance Locations'
		if(this.mainController.instructionStr){
			var labels="<span>" + this.mainController.instructionStr + "</span>";
			View.panels.get('abCompDocumentRegulationGrid').setInstructions(labels);
		}
	},

	/**
     * Event Handler for afterRefresh event of form.
	 * set default field values for loading in different views.
     */
	abCompDocumentRegulationForm_afterRefresh:function(){
	
		this.setProperRestrictionFieldValue();
	},
	
	/**
	 * Private Function: set proper restriction for loading in different Views 
	 */
	setRestriction: function(){

		var location_id = this.mainController.location_id;
		if(location_id){
			this.selectRes = " docs_assigned.location_id="+this.mainController.location_id; 
		}else{//kb 3036236 Value for location_id is missing from table 'docs_assigned' when add location document.
			//for 'ab-comp-regulation.axvw'
			if(this.mainController.regulation){
				this.selectRes = " docs_assigned.reg_program IS NULL and docs_assigned.regulation='"+this.mainController.regulation+"' ";
			}
			//for 'ab-comp-regprogram.axvw'
			if(this.mainController.regprogram){
				this.selectRes = " docs_assigned.reg_requirement IS NULL and docs_assigned.reg_program='"+this.mainController.regprogram+"' and docs_assigned.regulation='"+this.mainController.regulation+"' ";
			}
			//for 'ab-comp-regrequirement.axvw'
			if(this.mainController.regrequirement){
				this.selectRes =" docs_assigned.reg_requirement='"+this.mainController.regrequirement+"' and docs_assigned.reg_program='"+this.mainController.regprogram+"' and docs_assigned.regulation='"+this.mainController.regulation+"' ";
			}
			
			//for 'ab-comp-all-events.axvw'
			if(this.mainController.event){
				this.selectRes = " docs_assigned.activity_log_id="+this.mainController.event+" ";
			}
		}
		this.abCompDocumentRegulationGrid.addParameter('resFromTab2', this.selectRes);
	},

	/**
	 * Private Function: set proper titles for loading in different Views 
	 */
	setProperTitle: function(){
    	if(this.mainController.regulation){
    		this.abCompDocumentRegulationGrid.setTitle(getMessage("gridTitleRegulation"));
   			this.abCompDocumentRegulationForm.setTitle(getMessage("formTitleRegulation"));
    	}
    	//for 'ab-comp-regprogram.axvw'
    	if(this.mainController.regprogram){
    		this.abCompDocumentRegulationGrid.setTitle(getMessage("gridTitleProgram"));
			this.abCompDocumentRegulationForm.setTitle(getMessage("formTitleProgram"));
    	}
    	//for 'ab-comp-regrequirement.axvw'
    	if(this.mainController.regrequirement){
    		this.abCompDocumentRegulationGrid.setTitle(getMessage("gridTitleRequirement"));
			this.abCompDocumentRegulationForm.setTitle(getMessage("formTitleRequirement"));
    	}

    	//for 'ab-comp-all-events.axvw'
    	if(this.mainController.event){
    		this.abCompDocumentRegulationGrid.setTitle(getMessage("gridTitleEvent"));
    		this.abCompDocumentRegulationForm.setTitle(getMessage("formTitleEvent"));
    	}

		//Set title for loading in 'manage ...by location' view
		if(this.mainController.id=='manageLocationMainController'){
			this.abCompDocumentRegulationForm.setTitle(getMessage("formTitleLocation"));
			this.abCompDocumentRegulationGrid.setTitle(getMessage("gridTitleLocation"));
		}
	},

	/**
	 * Private Function: set proper values of doc fields for loading in different Views 
	 */
	setProperRestrictionFieldValue: function(){
		//kb 3036236 Value for location_id is missing from table 'docs_assigned' when add location document.
		if(this.mainController.location_id){
			this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.location_id", this.mainController.location_id);
		}
		
    	if(this.mainController.regulation){
    		this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.regulation", this.mainController.regulation);
    	}

    	if(this.mainController.regprogram){
    		this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.reg_program", this.mainController.regprogram);
    	}

    	if(this.mainController.regrequirement){
    		this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.reg_requirement", this.mainController.regrequirement);
    	}

    	if(this.mainController.event){
    		this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.activity_log_id", this.mainController.event);
    		if (this.mainController.event_location_id) {
				this.abCompDocumentRegulationForm.setFieldValue("docs_assigned.location_id", this.mainController.event_location_id);
			}
    	}
    	if(this.mainController.event || this.abCompDocumentRegulationForm.getFieldValue("docs_assigned.activity_log_id")) {
			//hide field 'location_id' for loading in event related views and reports
			this.abCompDocumentRegulationForm.showField("docs_assigned.location_id", false);
		}
      else {    
		//disable location_id field but enable its select-value button
		this.abCompDocumentRegulationForm.enableField("docs_assigned.location_id", false);
		this.abCompDocumentRegulationForm.enableFieldActions("docs_assigned.location_id", true);
		this.abCompDocumentRegulationForm.showField("docs_assigned.location_id", true);
      }
	},

	/**
     * Refresh the grid when there are restriction condition changes
     */
	onRefresh:function(){
		if(this.mainController.event){
			this.selectRes = " docs_assigned.activity_log_id="+this.mainController.event+" ";
    		this.abCompDocumentRegulationGrid.addParameter("resFromTab2",this.selectRes);
    	}
		this.abCompDocumentRegulationForm.show(false);
		this.abCompDocumentRegulationGrid.refresh();
	},
	
	/**
     * Event Handler for row action "Edit"/"Details"
	 * Show document information in form for "Edit" or in column report for "Details"
	 *
	 *@param row clicked grid row
     */
	abCompDocumentRegulationGrid_onEdit: function(row){
		if(row){
			var docId = row.getFieldValue("docs_assigned.doc_id");
			if("report"==this.mainController.mode){
				this.abCompDocumentColumnReport.refresh("docs_assigned.doc_id="+docId);
			} else {
				this.abCompDocumentRegulationForm.newRecord = false;
				this.abCompDocumentRegulationForm.refresh("docs_assigned.doc_id="+docId);
				
				//check if it's coordinator model. use for 'Manage My Permits and Licenses'  and  'Manage My Compliance Requirements'
				//When click existing record in Panel 1, disable all fields in Panel 2 (but not when click Add New to add new document).
				if(this.mainController.isCoordinator&&this.mainController.isCoordinator==true){
					this.setCoordinatorMode();
				}
			}
		}
    },

	/**
	* Event Handler of action "Doc"
	*/
	abCompDocumentRegulationGrid_onDoc: function(){
		var	parameters = {};
		parameters.selectRes = this.selectRes;

		var location_id = this.mainController.location_id;
		if(location_id){
			parameters.selectRes =" regloc.location_id = "+location_id;
			View.openPaginatedReportDialog("ab-comp-loc-doc-tab-paginate-rpt.axvw" ,null, parameters);
		}
		else{
			//for 'ab-comp-all-events.axvw'
			if(this.mainController.event){
				View.openPaginatedReportDialog("ab-comp-event-doc-paginate-rpt.axvw" ,null, parameters);
			}
			//for 'ab-comp-regulation.axvw'
			else if(this.mainController.regrequirement){
				View.openPaginatedReportDialog("ab-comp-req-doc-paginate-rpt.axvw" ,null, parameters);
			}
			//for 'ab-comp-regprogram.axvw'
			else if(this.mainController.regprogram){
				View.openPaginatedReportDialog("ab-comp-prog-doc-paginate-rpt.axvw" ,null, parameters);
			}
			//for 'ab-comp-regrequirement.axvw'
			else if(this.mainController.regulation){
				View.openPaginatedReportDialog("ab-comp-reg-doc-paginate-rpt.axvw" ,null, parameters);
			}
		}

	}
}); 

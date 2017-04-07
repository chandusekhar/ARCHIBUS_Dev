var cpEditController = View.createController('cpEditController', {
    afterViewLoad: function()
    {
        myController.openBy = 'CA';
        //restrict the projects list
        var theRequestor = "";
        try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
        this.projectViewGrid.restriction = "uc_pir.review_by like 'CA%' and uc_pir.status = 'I'";
    },

    onProjectSelection: function(row)
    {
        var theRest = row.getRestriction();
       //show Panels for requestor
       this.projectInitiationViewSummaryForm.refresh(theRest);
       this.projectInitiationSummaryPanel.refresh(theRest);
       this.fundingPanel.refresh(theRest);

       this.campusPlanningPanel.refresh(theRest);
       this.appendicesPanel.refresh(theRest);
       this.pmoPanel.refresh(theRest);
       this.endorserPanel.refresh(theRest);
       this.campusArchitecturePanel.refresh(theRest);
        
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

        //show return and reject actions
        var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
        var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
        switch (status)
        {
            case 'I':
            {
                this.projectInitiationViewSummaryForm.actions.get("save").show(true);
                if (review_by == 'CA') {
                    this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(true);
                    this.projectInitiationViewSummaryForm.actions.get("returnCA").show(true);
                    this.projectInitiationViewSummaryForm.actions.get("submitToPagCA").show(false);
                }
                else if (review_by == 'CAR') {
                    this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(false);
                    this.projectInitiationViewSummaryForm.actions.get("returnCA").show(false);
                    this.projectInitiationViewSummaryForm.actions.get("submitToPagCA").show(true);
                }
                break;
            }
            default:
            {
                this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(false);
                this.projectInitiationViewSummaryForm.actions.get("submitToPagCA").show(false);
                this.projectInitiationViewSummaryForm.actions.get("returnCA").show(false);
                this.projectInitiationViewSummaryForm.actions.get("save").show(false);
                break;
            }
            } //end switch
        }
    });

   function onProjectSelect(row)
   {
        cpEditController.onProjectSelection(row);
   }
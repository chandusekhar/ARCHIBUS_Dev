var cpEditController = View.createController('cpEditController', {
    afterViewLoad: function()
    {
        myController.openBy = 'PAG';
        //restrict the projects list
        var theRequestor = "";
        try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
        this.projectViewGrid.restriction = "uc_pir.review_by like 'PAG' and uc_pir.status IN ('I','PP')";
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
       this.pagPanel.refresh(theRest);
        
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

                this.projectInitiationViewSummaryForm.actions.get("postponedPM").show(true);
                this.projectInitiationViewSummaryForm.actions.get("cancelPAG").show(true);
                this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(true);
                this.projectInitiationViewSummaryForm.actions.get("returnPAG").show(true);
                this.projectInitiationViewSummaryForm.actions.get("generateReportPM").show(true);

                break;
            }
            case 'PP':
            {
                this.projectInitiationViewSummaryForm.actions.get("save").show(true);

                this.projectInitiationViewSummaryForm.actions.get("postponedPM").show(false);
                this.projectInitiationViewSummaryForm.actions.get("cancelPAG").show(true);
                this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(true);
                this.projectInitiationViewSummaryForm.actions.get("returnPAG").show(true);
                this.projectInitiationViewSummaryForm.actions.get("generateReportPM").show(true);

                break;
            }
            default:
            {
                this.projectInitiationViewSummaryForm.actions.get("postponedPM").show(false);
                this.projectInitiationViewSummaryForm.actions.get("cancelPAG").show(false);
                this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(false);
                this.projectInitiationViewSummaryForm.actions.get("generateReportPM").show(false);
                this.projectInitiationViewSummaryForm.actions.get("returnPAG").show(false);
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
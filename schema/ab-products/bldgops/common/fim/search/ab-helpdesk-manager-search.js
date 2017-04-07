var helpdeskSearchGridController = View.createController('searchGrid', {
	
	highlightBySubstitute: false,
	
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.searchGridPanel.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
 	   	
    searchGridPanel_onSelect: function(row) {    	    	 
   		 
    	var restriction = new Ab.view.Restriction();
        var activityLogId = row.getRecord().getValue('activity_log_hactivity_log.activity_log_id');
    	restriction.addClause("activity_log_hactivity_log.activity_log_id", activityLogId, '=');
    	
    	  // apply restriction to the tabbed view and select the second page
        var tabPanel = View.getView('parent').panels.get('tabs');
        var detailsTab = tabPanel.findTab('details'); 
        
        detailsTab.restriction = restriction; 
		if ( !detailsTab.isContentLoaded ) {
			// reload the view
			detailsTab.loadView();      
		} 
		detailsTab.refresh(restriction);        

		tabPanel.selectTab('details',null, false, false, true);
   },
  

    afterInitialDataFetch : function() {
		  // refresh the grid panel with console restriction passed from first tab to second result tab
		 var tabPanel = View.getView('parent').panels.get('tabs');
		 var resultsTab = tabPanel.findTab('results');
		 this.searchGridPanel.addParameter( "consoleRes", tabPanel.searchRstriction );
		 this.searchGridPanel.refresh();

		if(View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'] ){
			this.highlightBySubstitute = true;
		} else {
			this.highlightBySubstitute = false;	
		}
		// after build color the grid for escalation values
		this.searchGridColor(this.searchGridPanel.gridRows,this.highlightBySubstitute);
	 
		//add color legend
		this.setLegendInstructions();		
  },    
    
	searchGridPanel_afterRefresh:function(){
		// after build color the grid for escalation values
		this.searchGridColor(this.searchGridPanel.gridRows,this.highlightBySubstitute);
	},

	/**
	 * Called after the request grid is refreshed to display color codes in grid cells.
	 */
	searchGridColor: function(gridRows,highlightBySubstitute) {
		var i =0;
    	gridRows.each(function(row) {    		
			var record = row.getRecord();
    		var color = '#FFF';
    		if (record.getValue('activity_log_hactivity_log.escalated_response') > 0) {
    			color = '#FC6';
    		}
    		if (record.getValue('activity_log_hactivity_log.escalated_completion') > 0) {
    			color = '#F66';
    		}

    		if(highlightBySubstitute){
				if(record.getValue('activity_log_hactivity_log.manager') != View.user.employee.id){
					color = View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'];
				}
    		}
            
            //kb#3045008: only highlight the color of cell 'Service Request Id' but not the whole row, so the color scheme could take affect to the grid's row.
			var cellEl = Ext.get(row.cells.get('activity_log_hactivity_log.activity_log_id').dom);
			cellEl.setStyle('background-color', color);
            i++;     
		});	 
    } ,
	
    setLegendInstructions: function(records){
		var instructions = getMessage("legend");
		instructions +="<br /><span style='background-color:#FC6'>"+getMessage("escalatedResponse")+"</span>";
		instructions +="<br /><span style='background-color:#F66'>"+getMessage("escalatedCompletion")+"</span>";
		if(this.highlightBySubstitute){
			instructions +="<br/><span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>"
		}
		this.searchGridPanel.show();
		this.searchGridPanel.setInstructions(instructions);
	}	
});


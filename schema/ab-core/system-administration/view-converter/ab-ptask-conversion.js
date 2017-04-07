
var ptaskConversionController = View.createController('ptaskConversionController', {

	activityId: '',
        
	// return value constants
    COMMENT_SUCCESS: "OK, V2 convertable",
    COMMENT_SUCCEEDED: "OK, V2 converted",
    COMMENT_PREV_CONV: "OK, Previously converted",
    COMMENT_JAVASCRIPT_VIEW: "JavaScript requires manual conversion",
    COMMENT_MISSING_VIEW: "View not found",
    COMMENT_MISSING_PANEL: "Missing Panel or Tab",
    COMMENT_MISC_FAIL: "Not convertable, misc. failure",
    COMMENT_CHILD_FAIL: "Included child failure",
    COMMENT_UNHANDLED_MACRO: "Unhandled Macro",
    COMMENT_NESTED_TBLGRP: "Nested Tablegroup",
    COMMENT_XSL_VIEW: "XSL based view",
    COMMENT_MDX_VIEW: "MDX based view",


    ptaskPanel_afterRefresh: function() {
		if (this.ptaskPanel.gridRows.length > 0) {
			var row = this.ptaskPanel.gridRows.get(0);
			this.activityId = row.getRecord().getValue('afm_ptasks.activity_id');
		}
		
		var controller = this;
                
        // highlight status colors for all grid rows
        this.ptaskPanel.gridRows.each(function(row) {
            // get status code from the row record
            var status = row.getRecord().getValue('afm_ptasks.comments');
            
            // map status code to a color
            var color = 'Grey';
			var convertable = true;
            switch (status) {
                case controller.COMMENT_SUCCESS:
					color = 'SeaGreen'; 
					break;  
                case controller.COMMENT_SUCCEEDED:
				case controller.COMMENT_PREV_CONV: 
					color = 'Navy'; 
					convertable = false;
					break;  
                case controller.COMMENT_JAVASCRIPT_VIEW: 
					color = 'GoldenRod'; 
					break;  
				case controller.COMMENT_MISSING_PANEL:
				case controller.COMMENT_MISC_FAIL:
                case controller.COMMENT_CHILD_FAIL:
					color = 'FireBrick'; 
					break;  				
				case controller.COMMENT_MISSING_VIEW:
                case controller.COMMENT_UNHANDLED_MACRO: 
					color = 'FireBrick'; 
					convertable = false;
					break;  
                case controller.COMMENT_NESTED_TBLGRP:
					color = 'OrangeRed';
					break; 
                case controller.COMMENT_XSL_VIEW:
                case controller.COMMENT_MDX_VIEW:
					color = 'OrangeRed';
					convertable = false;
					break; 
            };
            
            // get <td> element that displays the status in this row, and set its CSS properties
            var cell = row.cells.get('afm_ptasks.comments');
			if (cell != null && cell.dom != null && cell.dom.innerHTML != "") {
				cell.dom.style.color = color;
				cell.dom.style.fontWeight = 'bold';
			}
        });
    },



	/**
	 *  Run the converter (in noWrite mode) on the activity shown in the panel
	 *  Conversion should update the comments field
	 *  Refresh grid after WFR returns successfully
	 *
	 */
    ptaskPanel_onAnalyzeActivity: function() {
 		// make dialog medium
		View.defaultMessageDialogWidth = 450;
		View.defaultMessageDialogHeight = 300;
		
		var restriction = {'afm_ptasks.activity_id' : this.activityId};
		this.callPTaskWFR(this.activityId, restriction, false, false, 75);
        this.ptaskPanel.refresh();
	},


	/**
	 *  Run the converter (in write mode) on the activity shown in the panel
	 *  Conversion should update the comments field
	 *  Refresh grid after WFR returns successfully
	 *
	 */
    ptaskPanel_onConvertActivity: function() {
 		// make dialog medium
		View.defaultMessageDialogWidth = 450;
		View.defaultMessageDialogHeight = 300;
		
		var restriction = {'afm_ptasks.activity_id' : this.activityId};
		this.callPTaskWFR(this.activityId, restriction, true, false, 75);
		this.ptaskPanel.refresh();
	},


	/**
	 *  Open the nav_task_conversion.log file in a large dialog window
	 *
	 *  C:\Yalta\apps\archibus\WEB-INF\config\conversion_last.log
	 */
    ptaskPanel_onDisplayLog: function() {
		//alert('not yet implemented');
        try {
			var user = View.user;
			var result = Workflow.call('AbSystemAdministration-displayLastConversionLog', {
						    viewName:   'ab-ptask-conversion.axvw',
							dataSourceId: 'ptaskDataSource',
					        activityId: this.activityId,
							userId: user.name
					    });
			View.defaultMessageDialogWidth = 880;
			View.defaultMessageDialogHeight = 600;

			View.showMessage(result.data.lastLogFileText);            
        } 
		catch (e) {
            Workflow.handleError(e);
        }
	},


	/**
	 *  Run the converter (in noWrite mode) on the ptask view shown in the row
	 *  Conversion should generate a temp log that will be displayed in a dialog.
	 *  Conversion should also update the comments field
	 *  Refresh grid after WFR returns successfully
	 *
	 */
    ptaskPanel_onAnalyzeView: function(row, action) {
 		// make dialog big
		View.defaultMessageDialogWidth = 850;
		View.defaultMessageDialogHeight = 400;
		
		var record = row.getRecord();
		var restriction = {'afm_ptasks.activity_id' : this.activityId, 'afm_ptasks.task_file' : record.getValue('afm_ptasks.task_file')};

		this.callPTaskWFR(this.activityId, restriction, false, false);
        this.ptaskPanel.refresh();
	},

    /**
     * Event handler for the force conversion control link.
	 * Convert the selected view and write to disk
	 * allow conversion even if view uses JavaScript and insert panel tag if missing
	 *
     */
    ptaskPanel_onForceViewConversion: function(row, action) {
   		// make dialog big
		View.defaultMessageDialogWidth = 850;
		View.defaultMessageDialogHeight = 400;
		
		var record = row.getRecord();
		var restriction = {'afm_ptasks.activity_id' : this.activityId, 'afm_ptasks.task_file' : record.getValue('afm_ptasks.task_file')};

		this.callPTaskWFR(this.activityId, restriction, true, true);
        this.ptaskPanel.refresh();
	},


	/**
	 * Generic call WFR
	 *
	 */
	callPTaskWFR: function(activity, restriction, writeFlag, forceConvFlag, timeout) {

        try {
			var dialogDiv = Ext.get('ptaskPanel');
			var mask = new Ext.LoadMask(dialogDiv, {msg: 'Running analysis, just a moment...'});
			mask.enable();
			mask.show();

			var result = Workflow.call('AbSystemAdministration-convertTaskViews', {
						    viewName:   'ab-ptask-conversion.axvw',
							dataSourceId: 'ptaskDataSource',
							restriction: toJSON(restriction),
					        activityId: activity,
							writeToDisk: writeFlag,
							forceConversion: forceConvFlag
					    }, timeout);

			mask.hide();
			View.showMessage(result.data.logMessage);
            
            //this.ptaskPanel.refresh();
        } 
		catch (e) {
			if (typeof mask != 'undefined' && mask != null) {
				mask.hide();
			}
            Workflow.handleError(e);
        }

	}



});

// 3-30-10 C. Kriezis Initialize the taskId variable in afterViewLoad function
var taskId;
//

var abMoEditMoAssetsController = View.createController('abMoEditMoAssetsCtrl', {
	afterViewLoad: function() {
		// 3-30-10 C. Kriezis Added to account for the case the view is called from a Dashboard view and not from the Navigator
		taskId = View.taskInfo.taskId;

		var openingWindow = View.getOpenerWindow();
		if (openingWindow) {
			var viewTitle = openingWindow.getMessage('viewTitle');
			if ((viewTitle == 'viewTitle') && (openingWindow != null)) {
				openingWindow = openingWindow.View.getOpenerWindow();
				viewTitle = openingWindow.getMessage('viewTitle');
			}
			// 4-7-10 C. Kriezis Updated to include all cases as the taskId variable gets reset here.
			if (((viewTitle == 'Complete Moves') || (viewTitle == 'Route Moves for Approval') || (viewTitle == 'Issue Moves') || (viewTitle == 'Review and Estimate Moves'))
				&& (taskId != viewTitle)) {
				taskId = viewTitle;
			}
			//
		}
		//

		var disable = (taskId == 'Route Moves for Approval');

		if(this.panel_abMoEditMoeq && disable) {
			this.panel_abMoEditMoeq.multipleSelectionEnabled = false;
			this.panel_abMoEditMoeq.removeColumn(0);
		}
		
		if(this.panel_abMoEditMota && disable) {
			this.panel_abMoEditMota.multipleSelectionEnabled = false;
			this.panel_abMoEditMota.removeColumn(0);
		}
	},
    
	panel_abMoEditMoeq_onDelete: function() {
		this.deleteAssets(this.panel_abMoEditMoeq, "eq");
		
	},
	
	panel_abMoEditMota_onDelete: function() {
		this.deleteAssets(this.panel_abMoEditMota, "ta");
		
	},

	deleteAssets: function(panel, typeOfAssets){
		if(panel.getSelectedRows().length <= 0) {
			View.showMessage(getMessage("selectItems"));
			return;
		}

        View.confirm(getMessage("confirmDelete"), function(button){
            if (button == 'yes') {
                try {
					var rows = panel.getPrimaryKeysForSelectedRows();
					var record = null;
				    for (var i = 0; i < rows.length; i++) {
						record = new Ab.data.Record(rows[i], false); 
				        panel.getDataSource().deleteRecord(record);
				    }
                } 
                catch (e) {
                    View.showMessage('error', getMessage("errorDelete"), e.message, e.data);
                    return;
                }
                panel.refresh();
				
				if (typeOfAssets == "eq") {
					/* refresh the opener-view's move equipments list panel */
					if (View.parameters && View.parameters.eqPanelId && View.parameters.eqPanelId != "") 
						View.getOpenerView().panels.get(View.parameters.eqPanelId).refresh();
				} else if(typeOfAssets == "ta") {
					/* refresh the opener-view's move tagged furniture list panel */
					if (View.parameters && View.parameters.taPanelId && View.parameters.taPanelId != "") 
						View.getOpenerView().panels.get(View.parameters.taPanelId).refresh();
				}
				
            }
        })
	}
})

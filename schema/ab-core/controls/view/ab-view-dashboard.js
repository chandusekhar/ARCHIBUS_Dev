
View.createController('dashboardController', {
	
	// Ext.Window with the list of draggable task titles
	dragWindow: null,
	
	// list of {taskTitle, taskFile} objects
	dragTasks: null,

    // dashboard parameters set from process navigator or dashboard tabs
    activityId: null,
    processId: null,
    dashboardView: null,
    dashboardLayout: null,

	// @begin_translatable
    z_DEFAULT_TITLE: 'Drag Tasks to Dashboard Panels',
	z_DASHBOARD_SAVE_CHANGES: 'Save Changes',
	z_DASHBOARD_CLEAR_CHANGES: 'Clear Changes',
	z_DASHBOARD_CANCEL_CHANGES: 'Cancel',
	z_DASHBOARD_NEW_VIEW: 'New view:',
	z_DASHBOARD_SAVE_VIEW: 'Save dashboard view?',
	z_DASHBOARD_SAVE_ERROR: 'Error saving dashboard view',
	// @end_translatable
	
	/**
	 * Initialization.
	 */
	afterInitialDataFetch: function() {
		this.dragTasks = new Ext.util.MixedCollection();

        var controller = this;		
		View.panels.each(function (panel) {
			if (panel.type === 'viewPanel' && !panel.useFrame) {
                panel.addDragOverListener(controller.viewPanel_onDragOver.createDelegate(controller, [panel.id], true));
				panel.addDragDropListener(controller.viewPanel_onDragDrop.createDelegate(controller, [panel.id], true));
			}

			// To remove scrollbars for all panels in the dashboard, uncomment the following code:
			//
			// var layoutWrapper = Ext.get(panel.getWrapperElementId());
			// if (valueExists(layoutWrapper)) {
			//     layoutWrapper.parent().parent().dom.style.overflow = 'hidden';
			// }
		});
	},
	/**
	 * Adds specified task to the drag window.
	 * @param {Object} taskTitle
	 * @param {Object} taskFile
	 */
	addToDashboard: function(taskTitle, taskFile, taskIcon) {
		this.dragTasks.add({
			title: taskTitle, 
			file: taskFile,
			icon: taskIcon
		});
		this.updateDragWindow();
	},
	
	/**
	 * Updates the drag window content. Shows or hides the window as neccessary.
	 */
	updateDragWindow: function() {
		// discard the current window, if exists
        if (this.dragWindow) {
            this.dragWindow.close();
        }
		
		// if all atsks have been dropped, we don't need to show the window anymore
		if (this.dragTasks.getCount() == 0) {
			return;
		}
        
		// create HTML with drag items
		var html = '<ul class="nav">';
		for (var i = 0; i < this.dragTasks.getCount(); i++) {
			var task = this.dragTasks.get(i);

	        var style = '';
	        if (valueExistsNotEmpty(task.icon)) {
	            style = 'style="background-image: url(' + View.getBaseUrl() + '/schema/ab-system/graphics/' + task.icon + ');"';
	        }

			html = html + '<li class="leafnodes"><span id="dragTask_' + i + '" ' + style + '>' + task.title + '</span></li>';
		}
		html = html + '</ul>';
		
		// create window
        this.dragWindow = new Ext.Window({
            title: View.getLocalizedString(this.z_DEFAULT_TITLE), //'Drag Tasks to Dashboard Panels',
			width: 500,
			autoHeight: true,
            collapsible: true,
			html: html,
			buttons: [{
				text: View.getLocalizedString(this.z_DASHBOARD_SAVE_CHANGES), //'Save Changes',
				handler: this.onSaveChanges.createDelegate(this),
				disabled: true 
			}, {
                text: View.getLocalizedString(this.z_DASHBOARD_CLEAR_CHANGES), //'Clear Changes',
                handler: this.onClearChanges.createDelegate(this),
				disabled: true 
            }, {
				text: View.getLocalizedString(this.z_DASHBOARD_CANCEL_CHANGES), //'Cancel',
				handler: this.onCancel.createDelegate(this)
			}]
        });
        this.dragWindow.show();

        // set drag sources
        for (var i = 0; i < this.dragTasks.getCount(); i++) {
			var dragSource = new Ext.dd.DragSource('dragTask_' + i, {
				dragData: this.dragTasks.get(i)
			});
			dragSource.onStartDrag = function(){
                var span = this.proxy.el.child('span:first');
                span.setStyle('background-image', '');
            }
		}		
	},
	
    /**
     * Handles drag over event over any view panel. 
     * @return true if the drop is allowed.
     */
    viewPanel_onDragOver: function(dragSource, data, e, panelId) {
        return true;  
    },
	
    /**
     * Handles drag drop event over any view panel.
     */
    viewPanel_onDragDrop: function(dragSource, data, e, panelId) {
		this.dragWindow.buttons[0].enable();
        this.dragWindow.buttons[1].enable();
		
		var panel = View.panels.get(panelId);
		
		panel.oldTitle = panel.getMainPanel().config.title;
        panel.newTitle = data.title;
		panel.newViewFile = data.file;
		panel.getMainPanel().setTitle(View.getLocalizedString(this.z_DASHBOARD_NEW_VIEW) + ' ' + data.title);
		panel.getMainPanel().getTitleEl().addClass('changed');
	},
	
	onSaveChanges: function() {
        var controller = this;
		View.confirm(View.getLocalizedString(this.z_DASHBOARD_SAVE_VIEW), function(button) {
			if (button == 'yes') {
				try {
					var viewName = controller.saveChanges();
                    View.parentViewPanel.loadView(viewName);
				} catch (e) {
                    View.showMessage('error', View.getLocalizedString(this.z_DASHBOARD_SAVE_ERROR), e.message, e.data);
				}
			}
		});
	},
	
	onClearChanges: function() {
        View.panels.each(function (panel) {
            if (panel.type === 'viewPanel' && !panel.useFrame && valueExists(panel.newViewFile)) {
				panel.newViewFile = null;
                panel.getMainPanel().setTitle(panel.oldTitle);
                panel.getMainPanel().getTitleEl().removeClass('changed');
            }
        });
	},
	
    onCancel: function() {
        this.onClearChanges();
        this.dragTasks.clear();
        this.dragWindow.close();
    },
    
    /**
     * Saves changed dashboard view.
     */
    saveChanges: function() {
        var rowsId = '';
        var rowsFile = '';
        var rowsOrder = '';
		var rowsPanel = '';
        var index = 0;
        View.panels.each(function (panel) {
            if (panel.type === 'viewPanel' && !panel.useFrame && valueExists(panel.newViewFile)) {
                if (rowsId.length > 0) {
                    rowsId = rowsId + '~';
                }
                if (rowsFile.length > 0) {
                    rowsFile = rowsFile + '~';
                }
                if (rowsOrder.length > 0) {
                    rowsOrder = rowsOrder + '~';
                }
                if (rowsPanel.length > 0) {
                    rowsPanel = rowsPanel + '~';
                }
                rowsId = rowsId + panel.newTitle;
                rowsFile = rowsFile + panel.newViewFile;
                rowsOrder = rowsOrder + index;
				rowsPanel = rowsPanel + panel.id;
                index++;
            }
        });
        
        var parameters = {
			callerPlace: 'DragAndDrop',
            rowsId: rowsId,
            rowsFile: rowsFile,
            rowsOrder: rowsOrder,
			rowsPanel: rowsPanel,
            activityId: this.activityId,
            processId: this.processId,
            dashboardLayout: this.dashboardLayout
        };
        
        var result = Workflow.call('AbSystemAdministration-saveDashboard', parameters);
        return result.data.viewFileName;
    }
});



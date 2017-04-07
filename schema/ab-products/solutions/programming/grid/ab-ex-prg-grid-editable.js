
var gridExampleController = View.createController('gridExample', {
	
	// Ab.grid.Row reference for selected row
	selectedRow: null,

    afterInitialDataFetch: function() {
        this.inherit();

        this.prgGridEditable_roomGrid.gridRows.each(function(row) {
            row.actions.get(2).show(false);
        });
    },
	
    /**
     * Opens Select Value dialog to change rm_use value for the current row.
     * Called when the user clicks on the rm_use field link.
     */
    prgGridEditable_roomGrid_onSelectUse: function(row, action) {
		var controller = this;
		
        // select value using nested function to handle selected value
		var actionListener = function(fieldName, newValue, oldValue) {
            controller.setRowValue(row, 'rm.rm_use', newValue, 4);
            // stop default Select Value processing
            return false;
        };

		View.selectValue({
			title: getMessage('rm_use_title'),
	    	fieldNames: ['rm.rm_use'],
	    	selectTableName: 'rmuse',
	    	selectFieldNames: ['rmuse.rm_use'],
	    	visibleFieldNames: ['rmuse.rm_use', 'rmuse.description'],
	    	actionListener: actionListener,
	    	width: 500,
	    	height: 200
		});
    },

    /**
     * Show hidden form panel in dialog window to let the user edit the room area.
     * @param {Object} row
     * @param {Object} action
     */    
    prgGridEditable_roomGrid_onEditArea: function(row, action) {
		this.selectedRow = row;
		
		// we need cell coordinates to show the dialog at the same location
		var cell = row.cells.get(3).getEl();

		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id', record.getValue('rm.bl_id'));
		restriction.addClause('rm.fl_id', record.getValue('rm.fl_id'));
		restriction.addClause('rm.rm_id', record.getValue('rm.rm_id'));
		this.prgGridEditable_roomAreaForm.refresh(restriction);
        this.prgGridEditable_roomAreaForm.showInWindow({
			x: cell.getLeft(),
			y: cell.getTop(), 
			width: 400,
            closeButton: false,
            title: 'Edit Room Area'
        });
    },
	
    /**
     * User confirms the Edit Room Area dialog.
     */
	prgGridEditable_roomAreaForm_onOK: function() {
		var area = this.prgGridEditable_roomAreaForm.getFieldValue('rm.area');
		
		this.setRowValue(this.selectedRow, 'rm.area', area, 3);

		this.prgGridEditable_roomAreaForm.closeWindow();
	},

    /**
     * User cancels the Edit Room Area dialog.
     */
    prgGridEditable_roomAreaForm_onCancel: function() {
        this.prgGridEditable_roomAreaForm.closeWindow();
    },

    /**
     * This function is invoked when the user clicks on the Save All button.
     */
    prgGridEditable_roomGrid_onSaveAll: function() {
    	var changedRecords = [];
    	this.prgGridEditable_roomGrid.gridRows.each(function(row) {
        	if (row.updatedRecord != null) {
        		changedRecords.push(row.updatedRecord);
        	}
    	});
    	if (changedRecords.length > 0) {
    		try {
    	        this.prgGridEditable_roomDs.saveRecords(changedRecords);

    	    	this.prgGridEditable_roomGrid.gridRows.each(function(row) {
    	        	if (row.updatedRecord != null) {
    	                // clear cell background
    	                row.cells.get(3).dom.style.backgroundColor = '';
    	                row.cells.get(4).dom.style.backgroundColor = '';
    	        
    	                // disable Save button
    	                row.actions.get(2).show(false);
    	        	}
    	    	});
    	        
    		} catch (e) {
    			Workflow.handleError(e);
    		}
    	}
    },
	
    /**
     * This function is invoked when the user clicks on the Save button in the changed row.
     */
    prgGridEditable_roomGrid_onSave: function(row, action) {
        // get updated record from the row
    	if (row.updatedRecord == null) return;
        var record = row.updatedRecord;
        try {
            // save using DataSource
            this.prgGridEditable_roomDs.saveRecord(record);

            // clear cell background
            row.cells.get(3).dom.style.backgroundColor = '';
            row.cells.get(4).dom.style.backgroundColor = '';
    
            // disable Save button
            row.actions.get(2).show(false);

        } catch (e) {
            Workflow.handleError(e);
        }
    },
	
	setRowValue: function(row, fieldName, fieldValue, updateCellIndex) {
        // get the current record and update its value
		var record = row.updatedRecord;
		if (!valueExists(record)) {
			record = row.getRecord();
		}
        record.setValue(fieldName, fieldValue);
        
        // store the updated record in the Ab.grid.Row object for pending Save
        row.updatedRecord = record;
        
        // update visible text
        row.cells.get(updateCellIndex).dom.firstChild.innerHTML = fieldValue;
        
        // change cell background to indicate changed values
        row.cells.get(updateCellIndex).dom.style.backgroundColor = '#E0E0FF';
        
        // enable Save button
        row.actions.get(2).show(true);
	}
});


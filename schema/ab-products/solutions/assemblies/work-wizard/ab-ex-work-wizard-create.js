
View.createController('wrCreate', {
	afterViewLoad: function() {
        this.onToggleDrawingButton();
	},

    createRequestForm_afterRefresh: function() {
        this.createRequestForm.setFieldValue('wr.requestor', View.user.name);
        this.createRequestForm.setFieldValue('wr.phone', View.user.employee.phone);

        Ext.get('sameAsRequestor').on('click', this.onChangeSameAsRequestor.createDelegate(this));
        Ext.get('selectRoom').on('click', this.onSelectRoom.createDelegate(this));
        Ext.get('createRequestForm_wr.bl_id').on('change', this.onToggleDrawingButton.createDelegate(this));
        Ext.get('createRequestForm_wr.fl_id').on('change', this.onToggleDrawingButton.createDelegate(this));       
    },

    onChangeSameAsRequestor: function() {
        if ($('sameAsRequestor').checked) {
            this.createRequestForm.setFieldValue('wr.bl_id', View.user.employee.space.buildingId);
            this.createRequestForm.setFieldValue('wr.fl_id', View.user.employee.space.floorId);
            this.createRequestForm.setFieldValue('wr.rm_id', View.user.employee.space.roomId);
        } else {
            this.createRequestForm.setFieldValue('wr.bl_id', '');
            this.createRequestForm.setFieldValue('wr.fl_id', '');
            this.createRequestForm.setFieldValue('wr.rm_id', '');
        }
        this.onToggleDrawingButton();
    },

    onSelectRoom: function() {
	    var buildingId = this.createRequestForm.getFieldValue('wr.bl_id');
	    var floorId = this.createRequestForm.getFieldValue('wr.fl_id');
	    var roomId = this.createRequestForm.getFieldValue('wr.rm_id');
	        
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('wr.bl_id', buildingId);
	    restriction.addClause('wr.fl_id', floorId);
	    restriction.addClause('wr.rm_id', roomId);
	    
        var controller = this;
        View.openDialog('ab-ex-select-room.axvw', restriction, false, {
            callback: function(res) {
                var clause = res.clauses[2];
                var value = clause.value;
                this.createRequestForm.setFieldValue('wr.rm_id', value);
            }
        });
    },
    
    onToggleDrawingButton: function() {
	    var buildingId = this.createRequestForm.getFieldValue('wr.bl_id');
	    var floorId = this.createRequestForm.getFieldValue('wr.fl_id'); 
        Ext.get('selectRoom').setDisplayed(buildingId != '' && floorId !='');
    },
    
    createRequestForm_beforeSave: function() {	    	   
	    if (this.createRequestForm.getFieldValue('wr.bl_id') == '') {
			this.createRequestForm.clearValidationResult();
			this.createRequestForm.getFieldElement('wr.bl_id').focus();
			this.createRequestForm.addInvalidField("wr.bl_id", '');
			this.createRequestForm.displayValidationResult();
	    }
    },
    
    createRequestForm_onCreateRequest: function() {
    	var problemType = Ext.get('wrCreateProblemType').dom.value;
	    var problemSubtype = Ext.get('wrCreateProblemSubtype').dom.value;
	    var problemTypeConcat = (problemSubtype == '') ? problemType : problemType + '|' + problemSubtype;

	    var priority = Ext.get('wrCreatePriority').dom.value;
	    this.createRequestForm.setFieldValue('wr.priority', priority);

	    if (this.createRequestForm.save()) {
	    	View.getOpenerView().closeDialog(); 
	    }   	    	       
    }               
});
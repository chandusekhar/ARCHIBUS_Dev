var svgRoomsFilterDialogController = View.createController('svgRoomsFilterDialogCtrl', {

	// rooms filters that can be referenced from the opener controller
    filters: {},
    
    //contain a callback function reference that will be called when this dialog is closed
    onClose: null,
    
    // reference to the opener controller
    openerController: null,
    
    blId: '',
    
    flId: '',
    
    titleElem: null,
    
    colorValueInput: null,
    
	afterViewLoad: function(){
		// set random color
		this.colorValueInput = document.getElementById("filterHighlightColorValue");
		this.colorValueInput.value = generateRandomColor();
		
		this.titleElem = document.getElementById("filterHighlightTitle");
		
		this.openerController = View.getOpenerView().controllers.get('filterHighlightCtrl');
        if(this.openerController.filterHighlightControl){
        	this.blId = this.openerController.filterHighlightControl.control.config.pkeyValues.bl_id;
        	this.flId = this.openerController.filterHighlightControl.control.config.pkeyValues.fl_id;
		}
	},
	
	preload: function(filter){

		if(!filter || !filter.title)
			return;
		
		this.titleElem.value = filter.title;
		this.colorValueInput.value = filter.color;
		
		if(filter.dv_id)
			this.rmFilterPanel.setFieldValue("rm.dv_id", filter.dv_id);

		if(filter.dp_id)
			this.rmFilterPanel.setFieldValue("rm.dp_id", filter.dp_id);
		
		if(filter.rm_cat)
			this.rmFilterPanel.setFieldValue("rm.rm_cat", filter.rm_cat);
		
		if(filter.rm_std)
			this.rmFilterPanel.setFieldValue("rm.rm_std", filter.rm_std);

		if(filter.rm_type)
			this.rmFilterPanel.setFieldValue("rm.rm_type", filter.rm_type);
		
		if(filter.area)
			this.rmFilterPanel.setFieldValue("rm.area", filter.area);
		
		if(filter.cap_em)
			this.rmFilterPanel.setFieldValue("rm.cap_em", filter.cap_em);

	},
	
	rmFilterPanel_onShow: function(){
		
		var title = this.titleElem.value; 
		if(!title){
			this.titleElem.style.border = '1px solid #FF0000';
			this.titleElem.focus();
			return;
		}
		
		var filters = {};
        filters.title = title;
        filters.color = this.colorValueInput.value;
        
        var dv_id = this.rmFilterPanel.getFieldValue("rm.dv_id")
        if(dv_id)
        	filters.dv_id = dv_id;

        var dp_id = this.rmFilterPanel.getFieldValue("rm.dp_id")
        if(dp_id)
        	filters.dp_id = dp_id;

        var rm_cat = this.rmFilterPanel.getFieldValue("rm.rm_cat")
        if(rm_cat)
        	filters.rm_cat = rm_cat;

        var rm_type = this.rmFilterPanel.getFieldValue("rm.rm_type")
        if(rm_type)
        	filters.rm_type = rm_type;

        var rm_std = this.rmFilterPanel.getFieldValue("rm.rm_std")
        if(rm_std)
        	filters.rm_std = rm_std;

        var area = this.rmFilterPanel.getFieldValue("rm.area")
        if(area)
        	filters.area = area;

        var cap_em = this.rmFilterPanel.getFieldValue("rm.cap_em")
        if(cap_em)
        	filters.cap_em = cap_em;
        
        if(this.openerController.filterHighlightControl){
        	this.openerController.filterHighlightControl.onFilterRooms(filters, this.openerController.editRowIndex);        	
        	this.openerController.filterHighlightControl.showAction(this.Z_FILTERROOMACTION_ID, true);
        	
        	this.openerController.filterHighlightControl.control.enableActions(true, true);
        	this.openerController.filterHighlightControl.control.redlineControl.getControl().setCurrentColor(filters.color);

        }

		// The .defer method used here is required for proper functionality with Firefox 2
		View.closeThisDialog.defer(100, View);
		
        
	},
	
	rmFilterPanel_onCancel: function(){
		 View.closeThisDialog();
	}
	
});

function beforeSelect(command) {
	var controller = View.controllers.get('svgRoomsFilterDialogCtrl');
    command.dialogRestriction = "rm.bl_id = '" + controller.blId + "' AND rm.fl_id = '" + controller.flId + "'";
}

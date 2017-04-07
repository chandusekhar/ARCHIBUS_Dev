var flag = "", toolType = "";
var FilterController = View.createController('tltype', {
    afterInitialDataFetch: function(){
		var panel = Ab.view.View.getControl('', 'detailsPanel');
		if (panel){
			panel.addEventListener('beforeSave', this.beforeSave.createDelegate(this));
		}
    },
    
    beforeSave: function(){
    	var tool_type = this.detailsPanel.getFieldValue('tl.tool_type');
    	if(!valueExistsNotEmpty(tool_type)){
    		return;
    	}
    	
    	//if tl.tool_type field value is not empty,
    	//do record save for the dataSource named by "ds_ab-def-tl_tt"
        if (flag == "add") {
            forSave("sum", tool_type);
            flag = "show";
        }else if (flag == "show") {
                if (tool_type != toolType) {
                    forSave("sum", tool_type);
					if(toolType!=''){
                    forSave("sub", toolType);
					}
                }
            }
    },
    
    tlPanel_onAddNew: function(){
        flag = "add";
    },
    
    detailsPanel_onDelete: function(){
        forSave("sub", this.detailsPanel.getFieldValue('tl.tool_type'));
    }
    
});
function setParameters(){
    flag = "show";
    toolType = View.panels.get('detailsPanel').getFieldValue('tl.tool_type');
}

function forSave(oper, toolTypeId){
    var record, total_quantity;
    var restriction = new Ab.view.Restriction();
    restriction.addClause('tt.tool_type', toolTypeId, '=');
    record = View.dataSources.get('ds_ab-def-tl_tt').getRecord(restriction);
    total_quantity = record.getValue('tt.total_quantity');
    
    if (oper == "sum") {
        record.setValue("tt.total_quantity", parseInt(total_quantity) + 1);
    }else if (oper == "sub") {
            record.setValue("tt.total_quantity", parseInt(total_quantity) - 1);
        }

    View.dataSources.get("ds_ab-def-tl_tt").saveRecord(record);
}


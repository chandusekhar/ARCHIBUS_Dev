var abEamReceiptPrefixCtrl = View.createController('abEamReceiptPrefixCtrl', {

    afterInitialDataFetch: function () {
        var assetType = View.parameters.assetType;
        var panel = View.panels.get("abEamReceiptPrefix");
        panel.addParameter("pkFieldName", "property" === assetType ?  "pr_id" : assetType + "_id");
        panel.addParameter("assetType", assetType);
        panel.refresh();
    },
    
    abEamReceiptPrefix_afterRefresh: function (panel) {
    	if (panel.gridRows.getCount() == 1 && !valueExistsNotEmpty(panel.gridRows.get(0).getRecord().getValue("bl.prefix"))) {
    		panel.hasNoRecords = true;
        	panel.buildMoreRecordsFooterRow(panel.tableFootElement, getMessage("noPrefixesFind"));
    	}
    	
    }
});

function callCallbackMethod(row) {
    var prefix = row.row.getRecord().getValue("bl.prefix");
    View.parameters.callback(prefix);
}
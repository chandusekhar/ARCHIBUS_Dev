var ctrlAbApFnstdByRm = View.createController('abApFnstdByRmCtrl', {
	afterViewLoad: function(){
		this.list_abApFnstdByRm_fnstd.buildPostFooterRows = addTotalRow;
	},
	
	list_abApFnstdByRm_bl_afterRefresh: function(){
		var rowsLen = this.list_abApFnstdByRm_bl.rows.length;
		this.list_abApFnstdByRm_bl.enableAction("paginatedReportBl", rowsLen > 0);
		
	},
	
	list_abApFnstdByRm_fl_afterRefresh: function(){
		var bl_id = this.list_abApFnstdByRm_bl.rows[this.list_abApFnstdByRm_bl.selectedRowIndex]['bl.bl_id'];
		var recFlLen = this.ds_abApFnstdByRm_fl.getRecords("EXISTS(SELECT fn.fn_id FROM fn WHERE fn.bl_id = '" + bl_id + "' AND fn.fl_id = fl.fl_id)").length;
		this.list_abApFnstdByRm_fl.enableAction("paginatedReportFl", recFlLen > 0);
		
	},
	
	list_abApFnstdByRm_rm_afterRefresh: function(){
		var bl_id = this.list_abApFnstdByRm_bl.rows[this.list_abApFnstdByRm_bl.selectedRowIndex]['bl.bl_id'];
		var selectedRowFl = this.list_abApFnstdByRm_fl.rows[this.list_abApFnstdByRm_fl.selectedRowIndex];
		if(selectedRowFl != undefined){
			//floor is selected
			var fl_id = selectedRowFl['fl.fl_id'];
			var recRmLen = this.ds_abApFnstdByRm_rm.getRecords("EXISTS(SELECT fn.fn_id FROM fn WHERE fn.bl_id = '"+ bl_id +"' AND fn.fl_id = '" + fl_id + "' AND fn.rm_id = rm.rm_id)").length;
			this.list_abApFnstdByRm_rm.enableAction("paginatedReportRm", recRmLen > 0);
		}else{
			var recRmLen = this.ds_abApFnstdByRm_rm.getRecords("EXISTS(SELECT fn.fn_id FROM fn WHERE fn.bl_id = '" + bl_id + "' AND fn.rm_id = rm.rm_id)").length;
			this.list_abApFnstdByRm_rm.enableAction("paginatedReportRm", recRmLen > 0);
		}
		
	},
	
	list_abApFnstdByRm_fnstd_afterRefresh: function(){
		var rowsLen = this.list_abApFnstdByRm_fnstd.rows.length;
		this.list_abApFnstdByRm_fnstd.enableAction("paginatedReportFn", rowsLen > 0);
		
	},

	list_abApFnstdByRm_bl_onPaginatedReportBl: function(){
		try{
			var result = Workflow.callMethod("AbWorkplacePortal-AssetHandler-onPaginatedReport", "", "", "", this.title);
			if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
				result.data = eval('(' + result.jsonExpression + ')');
				var jobId = result.data.jobId;
				var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
				View.openDialog(url);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	list_abApFnstdByRm_fl_onPaginatedReportFl: function(){
		var restriction = this.list_abApFnstdByRm_fl.restriction;
		try{
			var result = Workflow.callMethod("AbWorkplacePortal-AssetHandler-onPaginatedReport", restriction["bl.bl_id"], "", "", this.view.title);
			if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
				result.data = eval('(' + result.jsonExpression + ')');
				var jobId = result.data.jobId;
				var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
				View.openDialog(url);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	list_abApFnstdByRm_rm_onPaginatedReportRm: function(){
		var restriction = this.list_abApFnstdByRm_rm.restriction;
		//if a floor is selected
		var blId = restriction["fl.bl_id"];
		
		//if only the building is selected
		if(blId == null){
			blId = restriction["bl.bl_id"];
		}
		try{
			var result = Workflow.callMethod("AbWorkplacePortal-AssetHandler-onPaginatedReport", blId, restriction["fl.fl_id"], "", this.view.title);
			if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
				result.data = eval('(' + result.jsonExpression + ')');
				var jobId = result.data.jobId;
				var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
				View.openDialog(url);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	list_abApFnstdByRm_fnstd_onPaginatedReportFn:function(){	
		var restriction = this.list_abApFnstdByRm_fnstd.restriction;
		try{
			var result = Workflow.callMethod("AbWorkplacePortal-AssetHandler-onPaginatedReport", restriction["rm.bl_id"], restriction["rm.fl_id"], restriction["rm.rm_id"], this.view.title);
			if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
				result.data = eval('(' + result.jsonExpression + ')');
				var jobId = result.data.jobId;
				var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
				View.openDialog(url);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	}
})

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalCount = 0;
	var totalPrice = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['fn.vf_fnstd_count'];
		if(row['fn.vf_fnstd_count.raw']){
			fntstdCountValue = row['fn.vf_fnstd_count.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalCount += parseInt(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['fn.vf_tot_std_cost'];	
		if(row['fn.vf_tot_std_cost.raw']){
			fntstdPriceValue = row['fn.vf_tot_std_cost.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalPrice += parseFloat(fntstdPriceValue);
		}
    }
	totalCount = totalCount.toFixed(0);
	totalPrice = totalPrice.toFixed(2);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: 'Total' title
    addColumn(gridRow, 1, getMessage('label_total'));
    // column 3: total furniture standard count
    addColumn(gridRow, 1, ds.formatValue('fn.vf_fnstd_count', totalCount, true));
    // column 3: total furniture standard price
    addColumn(gridRow, 1, ds.formatValue('fn.vf_tot_std_cost', totalPrice, true));
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'red';
        }
        gridRow.appendChild(gridCell);
    }
}

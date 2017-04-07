var ctrlAbApFnstdByDpxBl = View.createController('abApFnstdByDpxBlCtrl', {
	afterViewLoad: function(){
		this.list_abApFnstdByDpxBl_fnstd.buildPostFooterRows = addTotalRow;
	}
})

function showCounts(cmdCtx){
	var panel = cmdCtx.command.getParentPanel();
	var row = panel.gridRows.get(panel.selectedRowIndex);
	var record = row.record;
	var bl_id = '';
	var dp_id = '';
	var dv_id = '';
	if(record['rm.bl_id.key']){
		bl_id = record['rm.bl_id.key'];
	}
	if(record['rm.dp_id']){
		dp_id = record['rm.dp_id'];
	}
	if(record['rm.dv_id']){
		dv_id = record['rm.dv_id'];
	}
	var restriction = new Ab.view.Restriction();
	restriction.addClause('fn.bl_id', bl_id, '=');
	restriction.addClause('fn.dp_id', dp_id, '=');
	restriction.addClause('fn.dv_id', dv_id, '=');
	var target = View.panels.get('list_abApFnstdByDpxBl_fnstd');
	target.refresh(restriction);
}

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

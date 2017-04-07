/**
 * add total row
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
        
		var fntstdCountValue = row['ta.vf_fnstd_count'];
		if(row['ta.vf_fnstd_count.raw']){
			fntstdCountValue = row['ta.vf_fnstd_count.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalCount += parseInt(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['ta.vf_tot_std_cost'];	
		if(row['ta.vf_tot_std_cost.raw']){
			fntstdPriceValue = row['ta.vf_tot_std_cost.raw'];
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
    addColumn(gridRow, 1, ds.formatValue('ta.vf_fnstd_count', totalCount, true));
    // column 3: total furniture standard price
    addColumn(gridRow, 1, ds.formatValue('ta.vf_tot_std_cost', totalPrice, true));
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

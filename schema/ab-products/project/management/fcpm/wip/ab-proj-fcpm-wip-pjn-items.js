var projFcpmWipPjnItemsController = View.createController('projFcpmWipPjnItems', {
	afterViewLoad: function() {
        var grid = this.projFcpmWipPjnItemsGrid;

        grid.afterCreateCellContent = function(row, column, cellElement) {
    	    var value = row[column.id];
    		if (column.id == 'proj_forecast_item.date_forecast_mo')	{
    			var mo = Number(value.substring(5));
    			cellElement.innerHTML = getMessage('mo' + mo);
    		}
    	}
	}
});

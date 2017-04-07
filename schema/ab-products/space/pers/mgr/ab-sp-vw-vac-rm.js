/**
 * @author Keven Xi
 */
View.createController('vwVacRm', {

    abSpVwVacRm_rmGrid_afterRefresh: function(){
        var rows = this.abSpVwVacRm_rmGrid.rows;
        var totalArea = 0.00;
        for (var i = 0, row; row = rows[i]; i++) {
            if (row["rm.area.raw"]) {
                totalArea += parseFloat(row["rm.area.raw"]);
            }
            else {
                totalArea += parseFloat(row["rm.area"]);
            }
        }
        totalArea = insertGroupingSeparator(totalArea.toFixed(2));
        var totalRow = new Object();
        totalRow["rm.area"] = totalArea;
        totalRow["rm.rm_cat"] = getMessage("totals");
        this.abSpVwVacRm_rmGrid.addRow(totalRow);
        this.abSpVwVacRm_rmGrid.reloadGrid();
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
    }
})

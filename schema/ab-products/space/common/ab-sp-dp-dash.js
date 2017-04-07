
View.createController('abSpDpDash_controller', {
    afterInitialDataFetch: function(){
        this.abSpDpDash_filterConsole.validateFields = function(){
            if (this.validateField("rm.dv_id", true) && this.validateField("rm.dp_id", true)) {
                return true;
            }
            else {
                View.showMessage(getMessage("notEmpty"));
                return false;
            }
        };
    },
    
    abSpDpDash_availRmPanel_afterRefresh: function(){
        var rows = this.abSpDpDash_availRmPanel.rows;
        var totalArea = 0.00;
        var totalEmCap = 0;
        var totalDiff = 0;
        var totalHeadCount = 0;
        for (var i = 0, row; row = rows[i]; i++) {
            if (row["rm.area.raw"]) {
                totalArea += parseFloat(row["rm.area.raw"]);
            }
            else {
                totalArea += parseFloat(row["rm.area"]);
            }
            totalEmCap += parseInt(row["rm.cap_em"]);
            totalHeadCount += parseInt(row["rm.count_em"]);
            totalDiff += parseInt(row["rm.ava_em"]);
        }
        totalArea = insertGroupingSeparator(totalArea.toFixed(2));
        var totalRow = new Object();
        totalRow["rm.area"] = totalArea;
        totalRow["rm.cap_em"] = totalEmCap + "";
        totalRow["rm.count_em"] = totalHeadCount + "";
        totalRow["rm.ava_em"] = totalDiff + "";
        totalRow["rm.rm_cat"] = getMessage("totals");
        this.abSpDpDash_availRmPanel.addRow(totalRow);
        this.abSpDpDash_availRmPanel.reloadGrid();
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
    }
});

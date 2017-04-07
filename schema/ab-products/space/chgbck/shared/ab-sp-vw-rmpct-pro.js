/**
 * @author zhang.yi
 */
var viewProrateReportController = View.createController('viewProrateReport', {

    rmpct_report_afterRefresh: function(){
        this.addStatisticRows();
    },
    
    addStatisticRows: function(restriction){
        var oldRows = this.rmpct_report.rows;
        if (oldRows.length == 0) {
            return;
        }
        
        var totalArea = 0.00;
        var newRows = [];
        var preProrate = oldRows[0]['rmpct.prorate'];
        for (var i = 0, row; row = oldRows[i]; i++) {
            var tempPro = row["rmpct.prorate"];
            
            if (row["rmpct.area_rm.raw"]) {
                var tempArea = parseFloat(row["rmpct.area_rm.raw"]);
            }
            else {
                var tempArea = parseFloat(row["rmpct.area_rm"]);
            }
            if (tempPro == preProrate) {
                totalArea += tempArea;
            }
            else {
                newRows.push(this.addTotalRow(totalArea, preProrate));
                totalArea = tempArea;
                preProrate = tempPro;
            }
            newRows.push(row);
            
            if (i == oldRows.length - 1) {
                newRows.push(this.addTotalRow(totalArea, preProrate));
            }
        }
        this.rmpct_report.rows = newRows;
        this.rmpct_report.build();
        this.setStatisticRowStyle();
    },
    
    addTotalRow: function(totalArea, prorate){
        var totalArea1 = insertGroupingSeparator(totalArea.toFixed(2));
        var totalRow = new Object();
        totalRow["isStatisticRow"] = true;
        totalRow["rmpct.area_rm"] = totalArea1;
        totalRow["rmpct.date_end"] = getMessage('countFieldTitle') + " " + prorate;
        return totalRow;
    },
    
    setStatisticRowStyle: function(){
        var rows = this.rmpct_report.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
            }
        }
    }
    
})

/**
 * @author Keven Xi
 */
var controller = View.createController('vwProController', {

    abSpVwPro_detailsPanel_afterRefresh: function(){
        this.abSpVwPro_detailsPanel.sortEnabled = false;
        
        var rows = this.abSpVwPro_detailsPanel.rows;
        var totalArea = 0.00;
        var prorate;
        if (rows.length > 0) {
            prorate = rows[0]["rm.prorate"];
        }
        var newRows = [];
        for (var i = 0, row; row = rows[i]; i++) {
            var tempPro = row["rm.prorate"];
            
            if (row["rm.area.raw"]) {
                var tempArea = parseFloat(row["rm.area.raw"]);
            }
            else {
                var tempArea = parseFloat(row["rm.area"]);
            }
            
            if (tempPro == prorate) {
                totalArea += tempArea;
            }
            else {
				//fix KB3022837
                //if (totalArea == 0) {
                //    totalArea = tempArea;
                //}
                newRows.push(this.addTotalRow(totalArea, prorate));
                totalArea = tempArea;
                prorate = tempPro;
            }
            newRows.push(row);
            
            if (i == rows.length - 1) {
                //if (totalArea == 0) {
                //    totalArea = tempArea;
                //}
                newRows.push(this.addTotalRow(totalArea, prorate));
            }
        }
        
        this.abSpVwPro_detailsPanel.clear();
        this.abSpVwPro_detailsPanel.rows = newRows;
        this.abSpVwPro_detailsPanel.build();
        this.setStyleForTotalRow();
    },
    
    addTotalRow: function(totalArea, prorate){
        var totalArea1 = insertGroupingSeparator(totalArea.toFixed(2));
        var totalRow = new Object();
        totalRow["isTotal"] = true;
        totalRow["rm.area"] = totalArea1;
        totalRow["rm.gp_std"] = getMessage("total") + " " + prorate;
        return totalRow;
    },
    
    setStyleForTotalRow: function(){
        var rows = this.abSpVwPro_detailsPanel.rows;
        for (var i = 0, row; row = rows[i]; i++) {
            if (row["isTotal"]) {
                Ext.get(row.row.dom).setStyle('color', '#4040f0');
                Ext.get(row.row.dom).setStyle('font-weight', 'bold');
            }
        }
    }
})

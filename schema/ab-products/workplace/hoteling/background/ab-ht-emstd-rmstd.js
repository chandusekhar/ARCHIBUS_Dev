var controller = View.createController('assignRmstdForEmstdController', {
    emStd: '',
    rmstdEmstdList_onDeleteRecord: function(){
        var rmstdEmstdList = View.panels.get('rmstdEmstdList');
        var rows = rmstdEmstdList.getSelectedRows();
        this.deleteRmstdEmstdRecords(rows);
        emstd_onClick();
        
    },
    /**
     * Refresh title
     */
    rmstdEmstdList_afterRefresh: function(){
        var title = getMessage('title') + '  ' + this.emStd;
        setPanelTitle('rmstdEmstdList', title);
    },
    /**
     * @param {Object} rows
     */
    deleteRmstdEmstdRecords: function(rows){
        for (var i = 0; i < rows.length; i++) {
            var emStd = rows[i]["rmstd_emstd.em_std"];
            var rmStd = rows[i]["rmstd_emstd.rm_std"];
            var record = new Ab.data.Record({
                'rmstd_emstd.em_std': emStd,
                'rmstd_emstd.rm_std': rmStd
            }, true);
            try {//problem
                //This action will insert a new record into the pms table.				
                this.rmstdEmstdDS.deleteRecord(record);
            } 
            catch (e) {
                var message = getMessage('errorDelete');
                View.showMessage('error', message, e.message, e.data);
                return;
            }
        }
    },
    
    
    rmstdList_onAddNew: function(){
        var rmstdList = View.panels.get('rmstdList');
        var rows = rmstdList.getSelectedRows();
        //Associate selected procedures to selected equipment or location in pms table.
        this.addRmstdEmstdRecords(rows);
        emstd_onClick();
        
    },
    addRmstdEmstdRecords: function(rows){
        var selectedRow = this.emstdGrid.rows[this.emstdGrid.selectedRowIndex];
        var emStd = selectedRow["emstd.em_std"];
        for (var i = 0; i < rows.length; i++) {
            var rmStd = rows[i]["rmstd.rm_std"];
            var record = new Ab.data.Record({
                'rmstd_emstd.em_std': emStd,
                'rmstd_emstd.rm_std': rmStd
            }, true);
            try {//problem
                //This action will insert a new record into the pms table.				
                this.rmstdEmstdDS.saveRecord(record);
            } 
            catch (e) {
                var message = getMessage('errorSave');
                View.showMessage('error', message, e.message, e.data);
                return;
            }
        }
    }
})

function emstd_onClick(){
    var restriction = new Ab.view.Restriction();
    
    var grid = View.panels.get('emstdGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    View.controllers.get('assignRmstdForEmstdController')['emStd'] = selectedRow["emstd.em_std"];
    var emStd = View.controllers.get('assignRmstdForEmstdController')['emStd'];
    var rmstdEmstdList = View.panels.get('rmstdEmstdList');
    restriction.addClause("rmstd_emstd.em_std", emStd, "=");
    rmstdEmstdList.refresh(restriction);
    
    var rmstdList = View.panels.get('rmstdList');
    rmstdList.addParameter('emStd', emStd);
    rmstdList.refresh();
}

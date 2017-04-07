var controller = View.createController('assignEmstdForEmstdController', {
    rmStd: '',
	/**
	 * Delete employee and room standard from union table
	 */
    rmstdEmstdList_onDeleteRecord: function(){
        var rmstdEmstdList = View.panels.get('rmstdEmstdList');
        var rows = rmstdEmstdList.getSelectedRows();
        this.deleteRmstdEmstdRecords(rows);
        rmstd_onClick();
        
    },
	rmstdEmstdList_afterRefresh:function(){
		var title=getMessage('title')+'  '+this.rmStd;
		setPanelTitle('rmstdEmstdList', title);
	},
	/**
	 * Delete employee and room standard from union table
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
    
    emstdList_onAddNew: function(){
        var emstdList = View.panels.get('emstdList');
        var rows = emstdList.getSelectedRows();
        //Associate selected procedures to selected equipment or location in pms table.
        this.addRmstdEmstdRecords(rows);
        rmstd_onClick();
        
    },
	/**
	 * Add employee and room standard to  union table
	 */
    addRmstdEmstdRecords: function(rows){
        var selectedRow = this.rmstdGrid.rows[this.rmstdGrid.selectedRowIndex];
        var rmStd = selectedRow["rmstd.rm_std"];
        for (var i = 0; i < rows.length; i++) {
            var emStd = rows[i]["emstd.em_std"];
            var record = new Ab.data.Record({
                'rmstd_emstd.rm_std': rmStd,
                'rmstd_emstd.em_std': emStd
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

function rmstd_onClick(){
    var restriction = new Ab.view.Restriction();
    
    var grid = View.panels.get('rmstdGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    View.controllers.get('assignEmstdForEmstdController')['rmStd'] = selectedRow["rmstd.rm_std"];
    var rmStd = View.controllers.get('assignEmstdForEmstdController')['rmStd'];
    var rmstdEmstdList = View.panels.get('rmstdEmstdList');
    restriction.addClause("rmstd_emstd.rm_std", rmStd, "=");
    rmstdEmstdList.refresh(restriction);
    
    var emstdList = View.panels.get('emstdList');
    emstdList.addParameter('rmStd', rmStd);
    emstdList.refresh();
}

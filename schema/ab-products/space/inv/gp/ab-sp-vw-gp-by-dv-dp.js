/**
 * @author keven.xi
 */
View.createController('vwGpbyDvDp', {
    divisionId: "",
    deptId: "",
    
    dpPanel_afterRefresh: function(){
        if (this.dpPanel.rows.length > 0) {
            var selectedRowIndex = this.dvPanel.selectedRowIndex;
            this.divisionId = this.dvPanel.rows[selectedRowIndex]['dv.dv_id'];
            this.dpPanel.setTitle(getMessage('setTitleForDp') + ' ' + this.divisionId);
        }
        this.gpPanel.clear();
		this.gpPanel.setTitle(getMessage('setTitleForDp'));
    },
    gpPanel_afterRefresh: function(){
        var selectedRowIndex = this.dpPanel.selectedRowIndex;
        this.deptId = this.dpPanel.rows[selectedRowIndex]['dp.dp_id'];
        this.gpPanel.setTitle(getMessage('setTitleForGroup') + ' ' + this.divisionId + "-" + this.deptId);
    }
})

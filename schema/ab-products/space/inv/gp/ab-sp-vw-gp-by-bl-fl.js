var blid = "";
var flid = "";
View.createController('vwGpbyBlFl', {

	flPanel_afterRefresh: function(){
        if (this.flPanel.rows.length > 0) {
            var selectedRowIndex = this.blPanel.selectedRowIndex;
            blid = this.blPanel.rows[selectedRowIndex]['bl.bl_id'];
            this.flPanel.setTitle(getMessage('setTitleForFl') + ' ' + blid);
        }
    },
    gpPanel_afterRefresh: function(){
        var selectedRowIndex = this.flPanel.selectedRowIndex;
        flid = this.flPanel.rows[selectedRowIndex]['fl.fl_id'];
        this.gpPanel.setTitle(getMessage('setTitleForGroup') + ' ' + blid + "-" + flid);
    }
})

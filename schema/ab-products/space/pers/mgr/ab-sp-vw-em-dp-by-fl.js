/**
 * @author keven.xi
 */
View.createController('emDeptbyFl', {

    emsumPanel_afterRefresh: function(){
        var emsumPanel = this.emsumPanel;
        if (this.emsumPanel.restriction != null) {
            emsumPanel.setTitle(getMessage('setTheSecondPanelTitle') +' '+ this.emsumPanel.restriction['fl.bl_id']+"-"+this.emsumPanel.restriction['fl.fl_id']);
        }
        else 
            emsumPanel.setTitle(getMessage('setTheSecondPanelTitle'));
    }
})

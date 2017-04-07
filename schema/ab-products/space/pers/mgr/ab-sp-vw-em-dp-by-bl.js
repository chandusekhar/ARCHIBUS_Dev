/**
 * @author keven.xi
 */
View.createController('emDeptbyBl', {

    emsumPanel_afterRefresh: function(){
        var emsumPanel = this.emsumPanel;
        if (this.emsumPanel.restriction != null) {
            emsumPanel.setTitle(getMessage('setTheSecondPanelTitle') +' '+ this.emsumPanel.restriction['bl.bl_id']);
        }
        else 
            emsumPanel.setTitle(getMessage('setTheSecondPanelTitle'));
    }
})

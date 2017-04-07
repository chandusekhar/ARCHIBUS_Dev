/**
 * @author keven.xi
 */
View.createController('emDeptbyLoc', {

    emsumPanel_afterRefresh: function(){
        var emsumPanel = this.emsumPanel;
        if (this.emsumPanel.restriction != null) {
            emsumPanel.setTitle(getMessage('setTheSecondPanelTitle') +' '+ this.emsumPanel.restriction['dp.dv_id']+"-"+this.emsumPanel.restriction['dp.dp_id']);
        }
        else 
            emsumPanel.setTitle(getMessage('setTheSecondPanelTitle'));
    }
})

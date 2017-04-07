/**
 * @author keven.xi
 */
var vwRmstdbyDvController = View.createController('vwRmstdbyDv', {

    rmstdPanel_afterRefresh: function(){
        var rmstdPanel = this.rmstdPanel;
        if (rmstdPanel.restriction != null) {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd') + ' ' + rmstdPanel.restriction['dv.dv_id']);
        }
        else {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd'));
        }
    }
})

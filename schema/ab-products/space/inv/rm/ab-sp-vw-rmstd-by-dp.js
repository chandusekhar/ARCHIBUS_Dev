/**
 * @author keven.xi
 */
var vwRmstdbyDpController = View.createController('vwRmstdbyDp', {

    rmstdPanel_afterRefresh: function(){
        var rmstdPanel = this.rmstdPanel;
        if (rmstdPanel.restriction != null) {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd') + ' ' + rmstdPanel.restriction['dp.dv_id'] + "-" + rmstdPanel.restriction['dp.dp_id']);
        }
        else {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd'));
        }
    }
})
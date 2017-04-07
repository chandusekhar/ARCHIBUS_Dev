/**
 * @author keven.xi
 */
var vwRmstdbyFlController = View.createController('vwRmstdbyFl', {

    rmstdPanel_afterRefresh: function(){
        var rmstdPanel = this.rmstdPanel;
        if (rmstdPanel.restriction != null) {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd') + ' ' + rmstdPanel.restriction['fl.bl_id'] + "-" + rmstdPanel.restriction['fl.fl_id']);
        }
        else {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd'));
        }
    }
})


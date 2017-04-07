/**
 * @author keven.xi
 */
var vwRmstdbyBlController = View.createController('vwRmstdbyBl', {

    rmstdPanel_afterRefresh: function(){
        var rmstdPanel = this.rmstdPanel;
        if (rmstdPanel.restriction != null) {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd') + ' ' + rmstdPanel.restriction['bl.bl_id']);
        }
        else {
            rmstdPanel.setTitle(getMessage('setTitleForRmstd'));
        }
    }
})


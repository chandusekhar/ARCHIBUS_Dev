View.createController('abSpSuByFlCtrl', {

    abSpSuByFl_detailsFl_afterRefresh: function(){
        var flPanel = this.abSpSuByFl_detailsFl;
        if (flPanel.restriction != null) {
            flPanel.setTitle(getMessage('setTitleForFl') + ' ' + flPanel.restriction['bl.bl_id']);
        }
    },
    
    abSpSuByFl_detailsSu_afterRefresh: function(){
        var suPanel = this.abSpSuByFl_detailsSu;
        suPanel.setTitle(getMessage('setTitleForSu') + ' ' + suPanel.restriction['fl.bl_id'] + "-" + suPanel.restriction['fl.fl_id']);
    }
})

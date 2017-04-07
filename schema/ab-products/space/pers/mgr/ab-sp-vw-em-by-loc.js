var viewEmByLocController = View.createController('viewEmByLocController', {

    flPanel_afterRefresh: function(){
        var flPanel = this.flPanel;
        if (this.flPanel.restriction != null) {
            flPanel.setTitle(getMessage('setTitleForFloor') + ' ' + this.flPanel.restriction['bl.bl_id']);
        }
        else 
            flPanel.setTitle(getMessage('setTitleForFloor'));
        this.rmPanel.clear();
        this.emPanel.clear();
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        if (this.rmPanel.restriction != null) {
            rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['fl.bl_id'] + "-" + this.rmPanel.restriction['fl.fl_id']);
        }
        else 
            rmPanel.setTitle(getMessage('setTitleForRm'));
        this.emPanel.clear();
    },
    
    emPanel_afterRefresh: function(){
        var emPanel = this.emPanel;
        emPanel.setTitle(getMessage('setTitleForEm') +' '+this.emPanel.restriction['rm.bl_id'] + "-" + this.emPanel.restriction['rm.fl_id'] + "-" + this.emPanel.restriction['rm.rm_id']);
    }
})

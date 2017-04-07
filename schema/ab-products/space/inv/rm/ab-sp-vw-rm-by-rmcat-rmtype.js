View.createController('vwRmbyRmcatRmtype', {

    typePanel_afterRefresh: function(){
        var typePanel = this.typePanel;
        if (this.typePanel.restriction != null) {
            typePanel.setTitle(getMessage('setTitleForType') + ' ' + this.typePanel.restriction['rmcat.rm_cat']);
        }
        else 
            typePanel.setTitle(getMessage('setTitleForType'));
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['rmtype.rm_cat'] + "-" + this.rmPanel.restriction['rmtype.rm_type']);
    }
})

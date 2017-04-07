var addSumColumnController = View.createController('addSumColumn', {

    afterInitialDataFetch: function(){
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['rmstd.rm_std']);
    }
})

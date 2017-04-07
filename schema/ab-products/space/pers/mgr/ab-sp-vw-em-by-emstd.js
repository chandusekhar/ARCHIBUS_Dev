var viewEmByStdController = View.createController('viewEmByStdController', {
    
    emPanel_afterRefresh: function(){
        var emPanel = this.emPanel;
        emPanel.setTitle(getMessage('setTitleForEm') + ' ' +this.emPanel.restriction['emstd.em_std'] );
    }
})

/**
 * @author keven.xi
 */
View.createController('emavbyrm', {

    typePanel_afterRefresh: function(){
        var typePanel = this.typePanel;
        if (this.typePanel.restriction != null) {
            typePanel.setTitle(getMessage('setTitleForType') + ' ' + this.typePanel.restriction['rmcat.rm_cat']);
        }
        else 
            typePanel.setTitle(getMessage('setTitleForType'));
    }
})

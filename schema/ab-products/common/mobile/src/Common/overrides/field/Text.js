/**
 * @override
 * @since 23.1
 */
Ext.define('Common.overrides.field.Text', {
    override: 'Ext.field.Text',

    // @private
    updateReadOnly: function(newReadOnly) {
        var componentEl,
            componentDom;

        componentDom = this.getComponent().input.dom;
        if(componentDom && componentDom.parentElement && componentDom.parentElement.parentElement) {
            componentEl = componentDom.parentElement.parentElement;
        }

        if (newReadOnly) {
           if(componentEl){
                Ext.get(componentEl.id).addCls('ab-readonly');
            }

            this.hideClearIcon();
        } else {
            if(componentEl){
                Ext.get(componentEl.id).removeCls('ab-readonly');
            }
            
            this.showClearIcon();
        }

        this.getComponent().setReadOnly(newReadOnly);
    }
});
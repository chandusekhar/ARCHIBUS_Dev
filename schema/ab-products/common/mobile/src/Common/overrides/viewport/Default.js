Ext.define('Common.overrides.viewport.Default', {
    override: 'Ext.viewport.Default',

    /**
     * Override to prevent the SVG element from calling the blur function.
     * @param e
     */
    doBlurInput: function(e) {
        var target = e.target,
            focusedElement = this.focusedElement;

        //In IE9/10 browser window loses focus and becomes inactive if focused element is <body>. So we shouldn't call blur for <body>
        if (focusedElement && focusedElement.nodeName.toUpperCase() !== 'BODY' &&  !this.isInputRegex.test(target.tagName)) {
            delete this.focusedElement;
            if(Ext.isFunction(focusedElement.blur)) {
                focusedElement.blur();
            }
        }
    }
});
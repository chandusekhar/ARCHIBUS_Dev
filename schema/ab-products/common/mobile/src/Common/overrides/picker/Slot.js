Ext.define('Common.overrides.picker.Slot', {
    override: 'Ext.picker.Slot',

    /**
     * Scrolls the Date Picker display ot the passed date value. Does not set the value of Date Picker.
     * @param {Date} value The date value to set the slot values to.
     * @param {Boolean} animated True to animate the display.
     */
    doScrollTo: function (value, animated) {
        var store,
            viewItems,
            valueField,
            index, item;

        if (!this.rendered) {
            //we don't want to call this until the slot has been rendered
            this._value = value;
            return;
        }

        store = this.getStore();
        viewItems = this.getViewItems();
        valueField = this.getValueField();

        index = store.findExact(valueField, value);

        if (index === -1) {
            index = 0;
        }

        item = Ext.get(viewItems[index]);
        this.selectedIndex = index;
        if (item) {
            this.scrollToItem(item, (animated) ? {
                duration: 100
            } : false);
        }
    }
});
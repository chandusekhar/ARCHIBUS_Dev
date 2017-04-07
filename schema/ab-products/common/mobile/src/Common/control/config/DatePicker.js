/**
 * Provides a common Ext.picker.Date configuration for Ext.field.DatePicker fields
 * Adds a clear button to the Ext.field.DatePicker field
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.config.DatePicker', {
    extend: 'Ext.picker.Date',
    xtype: 'datepickerconfig',

    config: {
        toolbar: {
            items: [
                {
                    xtype: 'button',
                    text: LocalizedStrings.z_Clear,
                    align: 'left',
                    style: '-webkit-box-ordinal-group:2',
                    listeners: {
                        tap: function (button) {
                            var picker = button.up('datepicker');
                            picker.fireEvent('change', picker, null);
                            picker.hide();
                        }
                    }
                }
            ]
        },
        doneButton: LocalizedStrings.z_Done,
        cancelButton: LocalizedStrings.z_Cancel,
        yearFrom: 2012,
        yearTo: 2020,
        listeners: {
            show: function (picker) {
                var date = this.getValue();
                if(!date) {
                    picker.scrollSlotsToDate(new Date());
                }
            }
        }
    },

    /**
     * Sets the Date Picker slots to the values of the passed date. Used to set the initial date display
     * when the Date Picker is displayed. Sets the date display without setting the selected value of the Date Picker.
     * @param {Date} date
     */
    scrollSlotsToDate: function (date) {
        var dateValue = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
            },

            slots = this.query('pickerslot');

        Ext.each(slots, function (slot) {
            // Allow Android browsers time to catch up.
            setTimeout(function(){
                slot.doScrollTo(dateValue[slot.getName()], true);
            },500);

        });
    }
});
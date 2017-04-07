/**
 * Provides a common Common.controls.TimePicker configuration that can be applied to all Common.controls.TimePicker.Field
 * controls in the application
 *
 * Adds a Clear button to the Common.controls.TimePicker toolbar
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.config.TimePicker', {

    extend: 'Common.control.picker.Time',

    xtype: 'timepickerconfig',

    config: {
        toolbar: {
            items: [
                {
                    xtype: 'button',
                    text: LocaleManager.getLocalizedString('Clear',
                            'Common.control.config.TimePicker'),
                    align: 'left',
                    style: '-webkit-box-ordinal-group:2',
                    listeners: {
                        tap: function(button) {
                            var picker = button.up('timepicker');
                            picker.fireEvent('change',picker,null);
                            picker.hide();
                        }
                    }
                }
            ]},
        doneButton: LocaleManager.getLocalizedString('Done', 'Common.control.config.TimePicker'),
        cancelButton: LocaleManager.getLocalizedString('Cancel', 'Common.control.config.TimePicker'),
        listeners: {
            show: function () {
                var date = this.getValue();
                if (date && date.getHours() === 0 && date.getMinutes() === 0) {
                    this.setValue(new Date());
                }
            }
        }
    }
});
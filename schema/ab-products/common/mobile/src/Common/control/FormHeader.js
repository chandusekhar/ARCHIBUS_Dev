/**
 * Displays the Work Request code and an optional date in the header of a form.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.control.FormHeader', {
	extend : 'Ext.Component',

	xtype : 'formheader',

    template: [
        {
            cls: 'form-header',
            reference: 'formHeaderEl',
            children: [
                {
                    cls: 'form-header-left',
                    reference: 'leftEl',
                    text: ''
                },
                {
                    cls: 'form-header-right',
                    reference: 'rightEl',
                    text: ''
                }
            ]
        }
    ],

	config : {
		workRequestId : null,

		dateValue : null,

		workRequestLabel : LocaleManager.getLocalizedString('Request','Common.control.FormHeader'),

		dateLabel : '',

		displayLabels : false
	},

	applyWorkRequestId : function(config) {
		this.leftEl.setText(this.getWorkRequestText(config));
	},

	applyDateValue : function(config) {
		var dateString, parsedDate, processedDate;

		if (Ext.isString(config)) {
			parsedDate = Date.parse(config);
			if (!isNaN(parsedDate)) {
				processedDate = new Date(parsedDate);
			}
		}

		if (Ext.isDate(config)) {
			processedDate = config;
		}

		if (processedDate) {
			dateString = Ext.DateExtras.dateFormat(processedDate, LocaleManager.getLocalizedDateFormat());
		} else {
			dateString = config;
		}

		this.rightEl.setText(this.getDateText(dateString));
	},

	getWorkRequestText : function(config) {
		var displayLabels = this.getDisplayLabels(),
            workRequestLabel = this.getWorkRequestLabel(),
            workRequestText;

		if (!displayLabels) {
			return config;
		}

		if (displayLabels && !Ext.isEmpty(workRequestLabel) && !Ext.isEmpty(config)) {
			workRequestText = workRequestLabel + ': ' + config;
		} else {
			workRequestText = config;
		}

		return workRequestText;
	},

	getDateText : function(dateString) {
		var displayLabels = this.getDisplayLabels(),
            dateLabel = this.getDateLabel(),
            dateText;

		if (!displayLabels) {
			return dateString;
		}

		if (displayLabels && !Ext.isEmpty(dateLabel) && !Ext.isEmpty(dateString)) {
			dateText = dateLabel + ': ' + dateString;
		} else {
			dateText = dateString;
		}

		return dateText;
	}

});
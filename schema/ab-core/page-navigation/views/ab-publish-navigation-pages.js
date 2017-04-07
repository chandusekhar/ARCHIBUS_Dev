<!-- ab-publish-navigation-pages.js -->

var publishingController = View.createController('publisher', {
    /**
     * The server's configured default locale
     */
    defaultLanguage : 'en',

	/**
	 * Remove any rows using a duplicate role-language pair within the role-language-country triplet
	 */
	pageNavigationRolesGrid_afterGetData: function(control, resultData) {
        this.trimLanguageCountry(resultData.records);
        this.removeRows(resultData.records, this.getRowsToRemove(resultData.records));
    },

    /**
     * Modify the records in place to remove the country specific parentheses of the locale's language,
     * for example, change English(Canada) to English.
     *
     * @param records
     */
    trimLanguageCountry: function(records) {
        for (var i = 0, record; record = records[i]; i++) {
            var locale = record['afm_users.locale'];
            if (locale.indexOf('(') > 0) {
                locale = locale.substr(0, locale.indexOf('(')).trim();
                record['afm_users.locale'] = locale;
            }
        }
    },

	/**
     * Return a collection of grid row indices for the rows to remove from the grid.
     *
     * Return any row whose:
     *
	 * role-language pair uses the DEFAULT language when there exists another row whose
     * role-language pair matches the role and has a language that matches this.defaultLanguage;
     *
     * has a redundant role-language pair now that the country code is removed from the locale
     *
     * @param records
	 */
	getRowsToRemove: function(records) {
		var rowsToRemove = [];
		var existingRoleLocales = [];
        var record;
        for (var i = 0; record = records[i]; i++) {
            if (record['afm_users.locale.raw'] !== 'DEFAULT') {
                existingRoleLocales.push({
                    locale: record['afm_users.locale.raw'],
                    role: record['afm_users.role_name']
                });
            }
        }

        // remove DEFAULT record when explicit lang record exists
        for (var j = 0; record = records[j]; j++) {
            if (record['afm_users.locale.raw'] === 'DEFAULT') {
                for (var k = 0; k < existingRoleLocales.length; k++) {
                    if (existingRoleLocales[k].role === record['afm_users.role_name'] &&
                        existingRoleLocales[k].locale.substr(0, 2) === this.defaultLanguage) {
                        rowsToRemove.push(j);
                        break;
                    }
                }
            }
        }

        // remove duplicates
        for (var m = 0; record = records[m]; m++) {
            var role = record['afm_users.role_name'];
            var lang = record['afm_users.locale'];
            var testRecord;
            for (var n = m + 1; testRecord = records[n]; n++) {
                ///var testDup = jQuery.inArray(n, rowsToRemove);
                if (role === testRecord['afm_users.role_name'] && lang === testRecord['afm_users.locale'] && rowsToRemove.indexOf(n) === -1) {
                    rowsToRemove.push(n);
                    break;
                }
            }
        }

        // ensure array is in ascending numerical order
		return rowsToRemove.sort(function(a, b){return a - b});
	},

	/**
	 * Remove any rows from the record collection designated by their index in rows to remove.
     * @param records
     * @param rowsToRemove - a collection of row indices.
	 */
	removeRows: function(records, rowsToRemove) {
		// remove rows in reverse order to preserve index validity
		for (var i = rowsToRemove.length - 1, rowToRemove; rowToRemove = rowsToRemove[i]; i--) {
			records.splice(rowToRemove, 1); 
		}
	}
});

/**
 * Publish one role - language.
 * Send the whole, joined, record to the WFR, not just the primary key of the main table.
 */
 function publishForRole(row) {
    var keys = {};
    keys['afm_users.locale'] = row['afm_users.locale.raw'];
    keys['afm_users.role_name'] = row['afm_users.role_name'];
    var fieldValues = toJSON(keys);
	
	var parameters = {
		viewName: "ab-publish-navigation-pages.axvw",
		dataSourceId: "pageNavigationRoles_ds",
		controlId: "pageNavigationRolesGrid",
		doPublishAll: false, 
		records: fieldValues,
		fieldValues: fieldValues,
		version: Ab.view.View.version,
		groupIndex: 0
	};

	try {
		var wfrResult = Workflow.runRuleAndReturnResult('AbCommonResources-generateNavigationPagesForRole', parameters);
		// wfrResult.data.value holds the error count
		if (wfrResult.code == 'executed' && wfrResult.data.value == 0) {
            var lastPublishedDate = wfrResult.data.lastPublishedDate;
            if (!lastPublishedDate) {
			    lastPublishedDate = '-';
			}
			row['afm_users.group_9'] = lastPublishedDate;
			row.grid.update();
			View.alert(wfrResult.data.message);
        }
		else {
            Ab.workflow.Workflow.handleError(wfrResult);
		}
	}
	catch (e) {
		Workflow.handleError(e);
    }
}

/**
 * Publish all roles known on server.
 */
 function publishAll(){
	var parameters = {
		viewName: "ab-publish-navigation-pages.axvw",
		dataSourceId: "pageNavigationRoles_ds",
		controlId: "pageNavigationRolesGrid",
		doPublishAll: true, 
		version: Ab.view.View.version,
		groupIndex: 0
	};

    var message = getMessage("msgProgressBar");
	var progressBarConfig = {
		interval: 500,
		animate: true,
		increment: 25
	};
	View.openProgressBar(message, progressBarConfig);

    message = getMessage("msgProgressBarFailure");
	try {
		var wfrResult = Workflow.runRuleAndReturnResult('AbCommonResources-generateNavigationPagesForRole', parameters);

		// wfrResult.data.value holds the error count
		if (wfrResult.code == 'executed' && wfrResult.data.value == 0) {
            var objGrid = View.panels.get("pageNavigationRolesGrid");
            objGrid.refresh();
		}
		else {
            Ab.workflow.Workflow.handleError(wfrResult);
		}
        message = wfrResult.data.message;
		View.closeProgressBar();
	}
	catch (e) {
        message = wfrResult.data.message;
        View.closeProgressBar();
		Workflow.handleError(e);
	}

    View.alert(message);
}

/**
 * Implements auto-complete for validated text fields. Requires jQuery UI Autocomplete plug-in.
 */
Ab.form.AutoComplete = Base.extend({

    /**
     * Adds auto-complete for validating fields in specified form panel.
     * @param panel The form panel.
     */
    addAutoCompleteToFormFields: function(panel) {
        var nFields = 0,            // number of form fields
            fieldNames = [],        // names of form fields
            selectFieldNames = [],  // names of select fields in the query
            queryFieldName = '',    // name of the select field for which the user types the value
            showImages = false,     // whether to display images in the drop-down
            afterSelect = null;     // the command action listener

        // find the Lookup field on the form that matches the ID field that the user is querying
        var findLookupFieldName = function() {
            var lookupFieldName = '';
            for (var f = 0; f < nFields; f++) {
                var field = panel.fields.get(fieldNames[f]);
                if (field && field.fieldDef && field.fieldDef.lookupName) {
                    lookupFieldName = field.fieldDef.lookupName;
                }
            }

            if (lookupFieldName) {
                // the name of the lookup field is in the form of em.name_lookupFor_project.requestor
                // get the lookup database field name (em.name) to use in the query
                var index = lookupFieldName.indexOf('_lookupFor_');
                if (index != -1) {
                    lookupFieldName = lookupFieldName.slice(0, index);
                }
            }

            return lookupFieldName;
        };

        // creates restriction: parent form field values + query
        var getAutoCompleteRestriction = function(query, field) {
            var restriction = new Ab.view.Restriction();

            // add parent field values
            var lookupFieldName = findLookupFieldName();
            for (var f = 0; f < nFields; f++) {
                if (selectFieldNames[f] !== queryFieldName && selectFieldNames[f] !== lookupFieldName) {
                    var value = panel.getFieldValue(fieldNames[f]);
                    if (valueExistsNotEmpty(value)) {
                        restriction.addClause(selectFieldNames[f], value);
                    }
                }
            }

            // add user query string
            if (valueExistsNotEmpty(query)) {
                if (query === '?') {
                    // do not apply the query restriction, show all available values
                } else if (queryFieldName.indexOf('em_id') == -1) {
                    // get values that begin with user query string
                    // KB 3038599, 3041531: Oracle is case-sensitive
                    restriction.addClause(queryFieldName, query.toUpperCase(), 'LIKE', ')AND(');
                    restriction.addClause(queryFieldName, query.toLowerCase(), 'LIKE', 'OR');
                    
                    if (lookupFieldName && lookupFieldName !== '') {
                        restriction.addClause(lookupFieldName, query.toUpperCase(), 'LIKE', 'OR');
                        restriction.addClause(lookupFieldName, query.toLowerCase(), 'LIKE', 'OR');
                    }
                } else {
                    // for employee names, also get values where the first name begins with user query string
                    // e.q. typing 'EL' returns both 'ELLIS, TERRY' and 'PARKER, ELLEN'
                    restriction.addClause(queryFieldName, query.toUpperCase() + '%', 'LIKE', ')AND(');
                    restriction.addClause(queryFieldName, '%, ' + query.toUpperCase() + '%', 'LIKE', 'OR');
                    // KB 3042573: Oracle is case-sensitive
                    restriction.addClause(queryFieldName, query.toLowerCase() + '%', 'LIKE', 'OR');
                    restriction.addClause(queryFieldName, '%, ' + query.toLowerCase() + '%', 'LIKE', 'OR');

                    if (lookupFieldName && lookupFieldName !== '') {
                        restriction.addClause(lookupFieldName, query.toUpperCase(), 'LIKE', 'OR');
                        restriction.addClause(lookupFieldName, '%, ' + query.toUpperCase() + '%', 'LIKE', 'OR');
                        restriction.addClause(lookupFieldName, query.toLowerCase(), 'LIKE', 'OR');
                        restriction.addClause(lookupFieldName, '%, ' + query.toLowerCase() + '%', 'LIKE', 'OR');
                    }
                }
            }

            return restriction;
        };

        // called by auto-complete to load values based on user's query
        var autoCompleteSource = function(fieldId, request, response) {
            var query = request.term,
                field = panel.fields.get(fieldId),
                command = field.actions.get(0).config.commands[0];

            fieldNames = _.map(command.fieldNames.split(','), function(name) {
                return name.trim();
            });
            selectFieldNames = _.map(command.selectFieldNames.split(','), function(name) {
                return name.trim();
            });
            _.each(fieldNames, function(fieldName, index) {
                if (fieldName === fieldId) {
                    queryFieldName = selectFieldNames[index];
                }
            });
            nFields = fieldNames.length;
            showImages = false;
            afterSelect = command.actionListener;

            var selectTableName = queryFieldName.split('.')[0],
                entries = [];

            var dataSource = valueExistsNotEmpty(command.dataSource) ?
                View.dataSources.get(command.dataSource) :
                Ab.data.createDataSourceForFields({
                    id: panel.id + '_' + fieldId + '_autoComplete',
                    tableNames: [selectTableName],
                    fieldNames: selectFieldNames
                });
            dataSource.recordLimit = command.recordLimit;
            // create a parsed restriction for the value the user just typed
            var restriction = getAutoCompleteRestriction(query, field);
            // add an SQL restriction if specified in the selectValue command
            restriction.sql = command.restriction;

            var sortValues = [{
                fieldName: queryFieldName,
                sortOrder: 1
            }];

            var records = dataSource.getRecords(restriction, {
                isDistinct: true,
                sortValues: toJSON(sortValues),
                controlType: 'autoComplete'
            });

            if (nFields > 0) {
                // for each record in the data set
                for (var r = 0; r < records.length; r++) {
                    // add child entry with parent fields
                    var entry = {};
                    for (var f = 0; f < nFields; f++) {
                        var value = records[r].getValue(selectFieldNames[f]);
                        entry[selectFieldNames[f]] = value;
                    }
                    for (var i = 0; i < selectFieldNames.length; i++) {
                        if (selectFieldNames[i].indexOf('image_file') != -1) {
                            showImages = true;
                            var imageFile = records[r].getValue(selectFieldNames[i]);
                            if (imageFile) {
                                entry.imageFile = imageFile;
                            }
                        }
                    }
                    entries.push(entry);
                }
            } else {
                // assemble flat list of values
                for (var r = 0; r < records.length; r++) {
                    var value = records[r].getValue(selectFieldNames[0]);
                    entries.push(value);
                }
            }

            response(entries);
        };

        var autoCompleteFormatterForId = function(fieldId) {
            var formatString = '{0} - {1}';

            var field = panel.fields.get(fieldId);
            if (field && field.fieldDef && field.fieldDef.lookupName) {
                if (field.fieldDef.lookupDisplayType === 'concatenate') {
                    formatString = field.fieldDef.lookupDisplayFormat;
                }
            }

            formatString = formatString.replace(/\{0\}/g, '{{idValue}}');
            formatString = formatString.replace(/\{1\}/g, '{{lookupValue}}');

            return function(idValue, lookupValue) {
                var template = Handlebars.compile(formatString);
                var context = {
                    'idValue': idValue,
                    'lookupValue': lookupValue
                };
                return template(context);
            };
        };

        // called by auto-complete to format an item
        var autoCompleteFormatter = function(fieldId, ul, item) {
            // the child value to select
            var child = item[queryFieldName];
            // additional Lookup field value, if the child is an ID field
            var lookupFieldName = findLookupFieldName();
            var lookupValue = item[lookupFieldName];
            if (valueExists(lookupValue)) {
                child = autoCompleteFormatterForId(fieldId)(child, lookupValue);
            }

            var parents = '';
            for (var f = 0; f < nFields; f++) {
                if (selectFieldNames[f] !== queryFieldName && selectFieldNames[f] !== lookupFieldName) {
                    var value = item[selectFieldNames[f]];
                    if (valueExists(value)) {
                        if (parents === '') {
                            parents = value;
                        } else {
                            parents = autoCompleteFormatterForId(selectFieldNames[f])(parents, value);
                            break;
                        }
                    }
                }
            }

            // add image if the item has the image_file field
            var style = '';
            if (showImages) {
                style = 'height:50px; padding-left: 54px;';
                if (item.imageFile) {
                    style += 'background: url(' + View.getBaseUrl() + '/projects/hq/graphics/' + item.imageFile.toLowerCase() + ') no-repeat;';
                    style += 'background-position: left center;';
                    style += 'background-size: 50px;';
                }
            }

            var html = '<a style = "' + style + '">' + child + '</a><span>' + parents + '</span>';

            return jQuery("<li></li>")
                .data('item.autocomplete', item)
                .append(html)
                .appendTo(ul);
        };

        // called by auto-complete when the user selects a value
        var autoCompleteSelectListener = function(event, ui) {
            var value = ui.item[queryFieldName];
            if (value) {
            	var listener = panel.getEventListener('onAutoCompleteSelect');
                // fill in parent form field values
                for (var f = nFields - 1; f >= 0; f--) {
                    panel.setFieldValue(fieldNames[f], ui.item[selectFieldNames[f]]);
                    if (listener) {
                    	listener(panel, fieldNames[f], ui.item[selectFieldNames[f]]);
                    }
                    if (afterSelect) {
                        if (!afterSelect.call) {
                            afterSelect = window[afterSelect];
                        }
                        if (afterSelect.call) {
                            var result = afterSelect.call(window, fieldNames[f], ui.item[selectFieldNames[f]]);
                        }
                    }
                }
            }
            event.preventDefault();
        };

        // called by auto-complete when the user modifies the query
        var autoCompleteSearchListener = function(event, ui) {
            var listener = panel.getEventListener('onAutoCompleteQuery');
            if (listener) {
                listener(panel, event, event.target.value);
                // cancel the event
                return false;
            }
        };

        // called by auto-complete when the user clears the query
        var autoCompleteClearListener = function(event) {
            var listener = panel.getEventListener('onAutoCompleteClear');
            if (listener) {
                listener(panel, event);
            }
        };

        // called by auto-complete when the menu opens; sets the menu z-index to be on top of the parent dialog
        var autoCompleteOpenListener = function(event, ui) {
            var menuWidget = jQuery(event.target).autocomplete('widget');
            menuWidget.context.style.zIndex = 9999;
        };

        // attach auto-complete plug-in to text fields
        panel.fields.each(function(field) {
            var fieldDef = field.fieldDef;

            var fieldElement = panel.getFieldElement(fieldDef.id);
            var fieldInput = jQuery(fieldElement);

            if (fieldElement && !fieldDef.isDate) {

                var action = field.actions.get(0);
                if (action && action.command) {
                    var command = action.command.commands[0];
                    if (command && command.type == 'selectValue' && command.autoComplete) {

                        // attach the plug-in to the input
                        fieldInput.autocomplete({
                            minLength: command.minLength,
                            delay: 250,
                            source: function(request, response) {
                                autoCompleteSource(fieldDef.id, request, response);
                            },
                            select: autoCompleteSelectListener,
                            search: autoCompleteSearchListener,
                            clear: autoCompleteClearListener,
                            open: autoCompleteOpenListener,
                            position: { collision: 'flip' }
                        }).autocomplete('instance')._renderItem = function(ul, item) {
							return autoCompleteFormatter(fieldDef.id, ul, item);
						};

                        if (command.minLength === '0') {
                            command.handle = function(context) {
                                if (fieldInput.autocomplete('widget').is(':visible') ) {
                                    fieldInput.autocomplete('close');
                                } else {
                                    fieldInput.autocomplete('search', fieldInput.val());
                                    fieldInput.focus();
                                }
                            }
                        }
                    }
                }
            }
        });
    }
});
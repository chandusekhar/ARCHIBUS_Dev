/**
 * @private
 * Collection of utility functions used by the {@link Common.store.proxy.Sqlite} and
 * {@link Common.store.proxy.ChangeTableStructureOperation} classes
 *
 * @author Jeff Martin
 * @since 21.1
 * @singleton
 */

Ext.define('Common.store.proxy.ProxyUtil', {
    alternateClassName: [ 'ProxyUtil' ],

    singleton: true,

    /**
     * Converts the Model fields definition into an object array containing the field name, the database
     * type for the field, and the field default value.
     * Excludes the Model id field and any Model fields that are marked as non-persistent.
     * The returned object array is used when creating database objects based on the associated Model.
     *
     * @param {Ext.data.Model} The Model instance to retrieve the field definitions from.
     * @return {Object[]} Object array where each item contains the field name, database field type, and
     *         field default value.
     */

    getDbFields: function (model) {
        var me = this,
            idProperty = model.getIdProperty(),
            fields = model.getFields().items,
            databaseFields = [];

        Ext.each(fields, function (field) {
            var type = field.getType().type, name = field.getName();

            // Exclude id fields and fields with persist = false
            if (field.getPersist()) {
                if (name === idProperty) {
                    type = 'INTEGER PRIMARY KEY AUTOINCREMENT';
                } else {
                    type = me.convertToSqlType(type);
                }
                databaseFields.push({
                    name: name,
                    type: type,
                    defaultValue: field.getDefaultValue()
                });
            }
        });
        return databaseFields;
    },

    /**
     * Converts the Model field type to the SQLite database type.
     * Handles the conversion of the Custom Datatypes defined in the {@link Common.type.TypeManager}
     * class.
     * Note: Custom types are read as type AUTO unless the Model class extends the
     * {@link Common.data.Model} class.
     *
     * @param {String} type The type name of the Model field.
     * @return {String} The database type name.
     */
    convertToSqlType: function (type) {
        var databaseType;
        switch (type.toUpperCase()) {
            case 'STRING':
            case 'DATECLASS':
            case 'TIMECLASS':
            case 'TIMESTAMPCLASS':
            case 'DATE':
                databaseType = 'TEXT';
                break;
            case 'INT':
            case 'INTEGERCLASS':
            case 'BOOL':
                databaseType = 'INTEGER';
                break;
            case 'FLOAT':
                databaseType = 'REAL';
                break;
            default:
                databaseType = 'TEXT';
                break;
        }
        return databaseType;
    },

    /**
     * Converts a Model record to a string of comma delimited database fields and types.
     * Used when creating database objects.
     *
     * @private
     * @param {Ext.data.Model} model Model instance of the fields to convert.
     * @return {String} Comma delimited string of database field names and database types.
     */
    constructFields: function (model) {
        var fields = this.getDbFields(model), schema = [];

        Ext.each(fields, function (field) {
            schema.push(field.name + ' ' + field.type);
        });

        return schema.join(',');
    },

    getFilterRestriction: function (filters) {
        var me = this,
            sql = '',
            filterStatement = ' WHERE ',
            sortedFilters;

        if (filters && filters.length) {
            sortedFilters = me.sortFilters(filters);
            Ext.each(sortedFilters, function(filter) {
                var operator,
                    startParen,
                    endParen,
                    filterProperties;

                filterProperties = me.getFilterProperties(filter);
                operator = filterProperties.operator;
                startParen = filter.start ? '(' : '';
                endParen = filter.end ? ')' : '';

                if (filterProperties.property !== null) {
                    if(filter.isSqlFilter) {
                        sql += filterStatement + filter.getSqlFilter();
                    }
                    else if (filterProperties.subFilter) {
                        sql += filterStatement + startParen + me.getSubFilterSql(filter) + endParen;
                    } else if (filterProperties.matchIsNullValue) {
                        // KB 3052245 - Add endParen parameter to the NULL filter
                        sql += filterStatement + filterProperties.property +
                                (filterProperties.isEqual ? (' IS ') : (' IS NOT ')) + 'NULL' + endParen;
                    } else {
                        sql += filterStatement + startParen + filterProperties.property + ' ' +
                                (filterProperties.anyMatch ? ('LIKE \'%' + filterProperties.value + '%\'')
                                        : (operator + ' \'' + filterProperties.value + '\'')) + endParen;
                    }
                    // TODO: This statement uses the conjunction from the previous filter. In some cases this is not
                    // correct. We should be using the conjunction from the current filter when the sql statement
                    // is created above.
                    filterStatement = ' ' + filterProperties.conjunction + ' ';
                }
            }, me);
        }
        return sql;
    },

    getSubFilterSql: function(filter) {
        var subFilter = filter.getSubFilter(),
            ln = subFilter.length,
            sql = '',
            i;

        for(i = 0; i < ln; i++) {
            if(i === 0) {
                sql = '(';
            }
            if(subFilter[i].matchIsNullValue) {
                sql += subFilter[i].property + (subFilter[i].isEqual ? (' IS ') : (' IS NOT ')) + 'NULL ';
            } else {
                sql += subFilter[i].property + ' ' + subFilter[i].operator + ' \'' + subFilter[i].value + '\' ';
            }
            if(i < ln-1) {
                sql += subFilter[i].conjunction + ' ';
            }
            if(i === ln-1) {
                sql += ')';
            }
        }

        return sql;
    },

    // TODO: Do we really need to merge the properties here?
    /**
     * Retrieves the properties from the filter object. Checks if the filter is type of Common.util.
     *
     * @param filter
     */
    getFilterProperties: function (filter) {
        var filterProperties,
            filterValue = filter.getValue();

        // Escape any apostrophes in the filter value
        if (Ext.isString(filterValue)) {
            filterValue = filterValue.replace("'", "''");
        }

        filterProperties = {
            property: filter.getProperty(),
            value: filterValue,
            anyMatch: filter.getAnyMatch(),
            conjunction: 'AND',
            subFilter: false,
            operator: '='
        };

        if (filter.isExtendedFilter) {
            filterProperties.matchIsNullValue = filter.getMatchIsNullValue();
            filterProperties.isEqual = filter.getIsEqual();
            filterProperties.conjunction = filter.getConjunction();
            filterProperties.operator = filter.getOperator();

            if(filter.getSubFilter().length > 0) {
                filterProperties.subFilter = true;
            }
        }
        return filterProperties;
    },

    /**
     * Sorts the filter properties by conjunction property. Used to group the 'OR' statements together
     *
     * @param {Object[]} filterProperties
     */
    sortFilters: function (filters) {
        var andFilters = [],
            sqlFilters = [],
            orFilters = [],
            orFiltersLength;

        Ext.each(filters, function (filter) {
            if(filter.isSqlFilter) {
                sqlFilters.push(filter);
            }
            else if (filter.isExtendedFilter && filter.getConjunction() === 'OR') {
                orFilters.push(filter);
            } else {
                andFilters.push(filter);
            }
        });
        orFiltersLength = orFilters.length;
        // Find first and last OR filters and add parenthesize
        if (orFiltersLength > 1) {
            orFilters[0].start = true;
            orFilters[0].end = null;
            orFilters[orFiltersLength - 1].end = true;
            orFilters[orFiltersLength - 1].start = null;
        }
        // Place the andFilters and the sqlFilters before the OR filters to preserve the
        // proper conjunction order.
        return andFilters.concat(sqlFilters).concat(orFilters);
    }

});
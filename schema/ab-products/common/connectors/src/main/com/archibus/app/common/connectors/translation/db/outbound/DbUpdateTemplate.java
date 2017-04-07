package com.archibus.app.common.connectors.translation.db.outbound;

import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.impl.AbstractDataSourceRequestTemplate;

/**
 * A template for a request to update a record in a given database table.
 * 
 * @author cole
 * 
 */
public class DbUpdateTemplate extends AbstractDataSourceRequestTemplate<List<?>> {
    /**
     * The list of fields to be updated.
     */
    private final List<String> foreignFields;
    
    /**
     * @param dataSourceFieldName the name of the parameter containing the DataSource.
     * @param foreignFields the list of fields to be updated in the order they'd appear in an insert
     *            query.
     */
    public DbUpdateTemplate(final String dataSourceFieldName, final List<String> foreignFields) {
        super(dataSourceFieldName);
        this.foreignFields = foreignFields;
    }
    
    /**
     * @param requestParameters a map of field values to be written to the database.
     * @return a list of field values to be written to the field base in the order they appear in an
     *         insert query.
     */
    public List<?> generateRequest(final Map<String, Object> requestParameters) {
        final List<Object> queryParameters = new ArrayList<Object>();
        for (final String foreignField : this.foreignFields) {
            queryParameters.add(requestParameters.get(foreignField));
        }
        return queryParameters;
    }
}

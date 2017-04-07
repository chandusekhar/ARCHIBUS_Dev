package com.archibus.app.common.connectors.impl.archibus.inbound;

import java.util.List;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A method for extracting field data from a source that provides a list of field values.
 *
 * @author cole
 *
 * @param <ListItemType> the type of item in the list response.
 *
 */
public class ListResponseFieldDefinition<ListItemType> extends
        AbstractArchibusResponseFieldDefinition<List<ListItemType>> {
    /**
     * The position of this field in the list.
     */
    private final int position;
    
    /**
     * Create a method for extracting field data from a source that provides a list of field values
     * based on afm_conn_flds and afm_flds records.
     *
     * @param connectorField the field associated with the afm_connector record that describes this
     *            field.
     * @param fieldDefLoader a means to retrieve the afm_flds data about this field.
     * @param position the position of this field relative to others on the connector.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public ListResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader, final int position)
            throws ConfigurationException {
        super(connectorField, fieldDefLoader);
        this.position = position;
    }
    
    /**
     * Extract this field's value from the response transaction record.
     *
     * @param rspTxRec transaction record.
     * @return The value of the field from the transaction. null will be used if the field isn't
     *         present.
     */
    public ListItemType extractValue(final List<ListItemType> rspTxRec) {
        ListItemType extractedValue = null;
        if (rspTxRec.size() > this.position) {
            extractedValue = rspTxRec.get(this.position);
        }
        return extractedValue;
    }
}

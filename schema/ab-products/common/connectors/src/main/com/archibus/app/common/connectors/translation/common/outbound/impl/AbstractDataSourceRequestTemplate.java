package com.archibus.app.common.connectors.translation.common.outbound.impl;

import java.util.Map;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;
import com.archibus.datasource.DataSourceImpl;

/**
 * A request template for generating a message from an ARCHIBUS data source.
 * 
 * @author cole
 * 
 * @param <RequestType> the type of request generated for the foreign system as defined by the
 *            concrete class.
 */
public abstract class AbstractDataSourceRequestTemplate<RequestType> implements
        IRequestTemplate<RequestType> {
    
    /**
     * The name of the parameter containing the DataSource.
     */
    private final String dataSourceFieldName;
    
    /**
     * Create a request template for creating a message based on records from a DataSource.
     * 
     * @param dataSourceFieldName the name of the parameter containing the DataSource.
     */
    public AbstractDataSourceRequestTemplate(final String dataSourceFieldName) {
        this.dataSourceFieldName = dataSourceFieldName;
    }
    
    /**
     * Return an iterator over records from the DataSource. Note that this buffers the records, it
     * doesn't read them all into memory at once.
     * 
     * @param templateParameters the parameters that contain at least one parameter with a
     *            DataSource as named by the dataSourceFieldName provided to the constructor.
     * @return an Iterable version of the DataSource that iterates over maps of field names to
     *         values representing the records returned by the DataSource.
     */
    public Iterable<? extends Map<String, Object>> generateRequestParameters(
            final Map<String, Object> templateParameters) {
        final DataSourceImpl dataSource =
                (DataSourceImpl) templateParameters.get(this.dataSourceFieldName);
        return new IterableDataSource(dataSource);
    }
}

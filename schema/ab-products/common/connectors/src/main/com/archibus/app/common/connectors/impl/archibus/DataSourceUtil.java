package com.archibus.app.common.connectors.impl.archibus;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.datasource.*;
import com.archibus.db.ViewField.Immutable;

/**
 * Utility for obtaining data sources for connectors.
 *
 * @author cole
 * @since 21.4
 */
public final class DataSourceUtil {
    
    /**
     * For a data source from a view file, the file name for the view.
     */
    private static final String AXVW_DS_VIEW_FILE_PARAM = "viewFileName";
    
    /**
     * For a data source from a view file, the name of the data source.
     */
    private static final String AXVW_DS_NAME_PARAM = "dataSourceName";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DataSourceUtil() {
    }

    /**
     * @param dataSourceConfig describing where the data source is defined.
     * @return the specified data source.
     */
    public static DataSource getDataSource(final JSONObject dataSourceConfig) {
        if (dataSourceConfig.has(AXVW_DS_VIEW_FILE_PARAM)
                && dataSourceConfig.has(AXVW_DS_NAME_PARAM)) {
            return DataSourceFactory.loadDataSourceFromFile(
                dataSourceConfig.getString(AXVW_DS_VIEW_FILE_PARAM),
                dataSourceConfig.getString(AXVW_DS_NAME_PARAM));
        } else {
            throw new ConfigurationException(
                "DataSource parameter specified without either viewFileName or dataSourceName",
                null);
        }
    }

    /**
     * @param connector describing the data source.
     * @return the specified data source.
     */
    public static DataSource getDataSource(final ConnectorConfig connector) {
        final DataSource sourceDataSource = DataSourceFactory.createDataSource();
        sourceDataSource.addTable(connector.getArchibusTable());
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            connectorField.getRule();
            /*
             * Only add it if it's a valid field for a data source.
             */
            if (DataSourceUtil.isRequiredDsField(connectorField)) {
                sourceDataSource.addField(connectorField.getArchibusField());
            }
        }
        return sourceDataSource;
    }
    
    /**
     * @param connectorField the connector field to test.
     * @return whether this field is an ARCHIBUS field that needs to be included in a data source.
     */
    public static boolean isRequiredDsField(final ConnectorFieldConfig connectorField) {
        return DataSourceUtil.isDsField(connectorField)
                && connectorField.getRule().getInstance().requiresExistingValue();
    }
    
    /**
     * @param connectorField the connector field to test.
     * @return whether this field is an ARCHIBUS field.
     */
    public static boolean isDsField(final ConnectorFieldConfig connectorField) {
        return connectorField.getIsSchemaField() && connectorField.getArchibusField() != null;
    }
    
    /**
     * @param connectorField the connector field configuration.
     * @param loader for field definitions.
     * @return the field definition for the connectorField or null if there is none.
     * @throws ConfigurationException if the ARCHIBUS field is not specified for a schema field.
     */
    public static Immutable getFieldDef(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader loader) throws ConfigurationException {
        Immutable fieldDef = null;
        if (connectorField.getIsSchemaField()) {
            final String archibusField = connectorField.getArchibusField();
            if (archibusField == null) {
                throw new ConfigurationException("Field [" + connectorField.getFieldId()
                        + "] is a schema field but the ARCHIBUS field name isn't specified.", null);
            }
            fieldDef =
                    loader.loadFieldDef(connectorField.getConnector().getArchibusTable(),
                        connectorField.getArchibusField());
        }
        return fieldDef;
    }
    
    /**
     * @param connectorField the connector field configuration.
     * @return the field definition for the connectorField or null if there is none.
     * @throws ConfigurationException if the ARCHIBUS field is not specified for a schema field.
     */
    public static Immutable getFieldDef(final ConnectorFieldConfig connectorField)
            throws ConfigurationException {
        return getFieldDef(connectorField, new DataSourceFieldDefLoader());
    }
}

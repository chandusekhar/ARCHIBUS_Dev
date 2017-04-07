package com.archibus.eventhandler.eam.connectors;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.datasource.SqlUtils;

/**
 * Provides pre and post process methods for EAM connectors.
 *
 * @author cole
 * @since 22.1
 *
 */
public final class EAMConnectorUtil {

    /*
     * JUSTIFICATION: bulk update.
     */
    /**
     * SQL Update.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String UPDATE = "UPDATE ";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private EAMConnectorUtil() {
    }
    
    /*
     * JUSTIFICATION: bulk update.
     */
    /**
     * @param connector connector configuration for EAM connector.
     * @throws ConfigurationException if the source_system_id isn't assigned by the connector.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void preprocess(final ConnectorConfig connector) throws ConfigurationException {
        SqlUtils.executeUpdate(connector.getArchibusTable(), UPDATE + connector.getArchibusTable()
                + " SET source_status = 'PROCESSING' WHERE source_system_id = '"
                + getSourceSystemId(connector) + "'");
    }
    
    /*
     * JUSTIFICATION: bulk update.
     */
    /**
     * @param connector connector configuration for EAM connector.
     * @throws ConfigurationException if the source_system_id isn't assigned by the connector.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void postprocess(final ConnectorConfig connector) throws ConfigurationException {
        SqlUtils.executeUpdate(connector.getArchibusTable(), UPDATE + connector.getArchibusTable()
                        + " SET source_status = 'DELETED' "
                        + ", source_date_update = ${sql.currentDate}, source_time_update = ${sql.currentTime} "
                        + ("vn".equals(connector.getArchibusTable()) ? ",is_active=0" : "")
                        + " WHERE source_system_id = '" + getSourceSystemId(connector)
                        + "' AND source_status = 'PROCESSING'");
    }

    /**
     * @param connector connector configuration for EAM connector.
     * @return the source system id.
     * @throws ConfigurationException if the source_system_id isn't assigned by the connector.
     */
    private static String getSourceSystemId(final ConnectorConfig connector)
            throws ConfigurationException {
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            if ("source_system_id".equals(connectorField.getArchibusField())) {
                return connectorField.getParameter();
            }
        }
        throw new ConfigurationException(
            "No Source System ID assigned using SET VALUE on EAM connector.", null);
    }
}

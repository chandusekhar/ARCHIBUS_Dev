package com.archibus.app.common.connectors.dao;

import java.util.List;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.core.dao.IDao;

/**
 * Interface to be implemented by classes that access connector field configuration.
 *
 * @author cole
 * @since 21.4
 *
 */
public interface IConnectorFieldDao extends IDao<ConnectorFieldConfig> {
    /**
     * @param connector a connector configuration in the database.
     * @return connector field configurations associated with the connector identified by the
     *         connectorId.
     */
    List<ConnectorFieldConfig> getConnectorFields(final ConnectorConfig connector);
}

package com.archibus.app.common.connectors.dao;

import java.util.List;

import com.archibus.app.common.connectors.domain.ConnectorRuleConfig;
import com.archibus.core.dao.IDao;

/**
 * Interface to be implemented by classes that access connector rule configuration.
 *
 * @author cole
 * @since 21.4
 *
 */
public interface IConnectorRuleDao extends IDao<ConnectorRuleConfig> {
    /**
     * @param connectorId the identifier of a connector rule configuration in the database.
     * @return connector rule configurations.
     */
    List<ConnectorRuleConfig> getConnectorFields(final String connectorId);
}

package com.archibus.app.common.connectors.dao;

import java.util.List;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ExecFlag;
import com.archibus.core.dao.IDao;

/**
 * Interface to be implemented by classes that access connector configuration.
 *
 * @author cole
 * @since 21.4
 *
 */
public interface IConnectorDao extends IDao<ConnectorConfig> {
    /**
     * @return connector configuration specified in the context.
     */
    ConnectorConfig createFromContext();
    
    /**
     * @param executionStatus the status of execution.
     * @return connector ids for connectors with that execution status.
     */
    List<String> getByExecutionStatus(final ExecFlag executionStatus);
}

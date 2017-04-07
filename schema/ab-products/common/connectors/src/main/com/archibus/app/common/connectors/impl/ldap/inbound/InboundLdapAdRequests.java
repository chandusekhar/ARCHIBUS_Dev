package com.archibus.app.common.connectors.impl.ldap.inbound;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.ldap.ConnectorLdapUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.ldap.InboundPagingLdapAdaptor;

/**
 * Request for data from an LDAP server.
 *
 * @author cole
 *
 */
public class InboundLdapAdRequests extends InboundLdapRequests {

    /**
     * Size of pages for active directory.
     */
    private static final int PAGE_SIZE = 5;

    /**
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if there is an issue with the connector configuration.
     */
    public InboundLdapAdRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        super(stepName, connector, log, new InboundPagingLdapAdaptor(
            ConnectorLdapUtil.buildContext(connector), ConnectorLdapUtil.useStartTls(connector),
            ConnectorLdapUtil.useTlsOnly(connector), null, PAGE_SIZE));
    }
}

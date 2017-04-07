package com.archibus.app.common.connectors.impl.ldap.inbound;

import java.util.*;

import javax.naming.NamingEnumeration;
import javax.naming.directory.SearchResult;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.archibus.inbound.InboundRequests;
import com.archibus.app.common.connectors.impl.ldap.ConnectorLdapUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.IAdaptor;
import com.archibus.app.common.connectors.transfer.ldap.*;
import com.archibus.app.common.connectors.translation.ldap.inbound.*;

/**
 * Request for data from an LDAP server.
 *
 * @author cole
 *
 */
public class InboundLdapRequests
        extends
        InboundRequests<LdapRequest, NamingEnumeration<SearchResult>, SearchResult, LdapResponseRecordDef> {
    /**
     * Template parameter for the LDAP name.
     */
    private static final String LDAP_NAME_PARAM = "ldapName";

    /**
     * Template parameter for the LDAP filter.
     */
    private static final String LDAP_FILTER_PARAM = "ldapFilter";

    /**
     * Template parameter for the LDAP search controls.
     */
    private static final String LDAP_SOURCE_CONTROLS_PARAM = "ldapSourceControls";

    /**
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if there is an issue with the connector configuration.
     */
    public InboundLdapRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        this(stepName, connector, log, new InboundLdapAdaptor(
            ConnectorLdapUtil.buildContext(connector), ConnectorLdapUtil.useStartTls(connector),
            ConnectorLdapUtil.useTlsOnly(connector)));
    }

    /**
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @param adaptor a means for communicating with the LDAP server.
     * @throws ConfigurationException if there is an issue with the connector configuration.
     */
    protected InboundLdapRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log, final IAdaptor<LdapRequest, NamingEnumeration<SearchResult>> adaptor)
            throws ConfigurationException {
        super(stepName, createTemplateParameters(connector), new LdapRequestRecordDef(
            LDAP_NAME_PARAM, LDAP_FILTER_PARAM, LDAP_SOURCE_CONTROLS_PARAM),
            new LdapReadRequestTemplate(LDAP_NAME_PARAM, LDAP_FILTER_PARAM,
                LDAP_SOURCE_CONTROLS_PARAM), adaptor, Collections
                .singletonList(new LdapResponseRecordDef(connector, new ConnectorDataTable(
                    connector), new LdapRecordParser(), connector.getSkipFirstRow())), log);
    }

    /**
     * Create template parameters for the FileRequestTemplate to generate requests for the file or
     * files that need to be read by this connector.
     *
     * @param connector the afm_connector record to use as configuration
     * @return template parameters to be used with the FileRequestTemplate.
     * @throws ConfigurationException if "" isn't a valid name.
     */
    protected static List<? extends Map<String, Object>> createTemplateParameters(
            final ConnectorConfig connector) throws ConfigurationException {
        final Map<String, Object> templateParameters = new HashMap<String, Object>();
        templateParameters.put(LDAP_NAME_PARAM, ConnectorLdapUtil.buildLdapName(connector));
        templateParameters.put(LDAP_FILTER_PARAM, connector.getClause());
        templateParameters.put(LDAP_SOURCE_CONTROLS_PARAM,
            ConnectorLdapUtil.buildSearchControls(connector));
        return Collections.singletonList(templateParameters);
    }
}

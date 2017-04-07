package com.archibus.app.common.connectors.service;

import java.lang.reflect.InvocationTargetException;
import java.util.EnumSet;

import com.archibus.app.common.connectors.AbstractRequests;
import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ConnectorType;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.db.inbound.InboundDbRequests;
import com.archibus.app.common.connectors.impl.db.outbound.OutboundDbRequests;
import com.archibus.app.common.connectors.impl.edi.inbound.InboundEdiRequests;
import com.archibus.app.common.connectors.impl.json.inbound.InboundJsonRequests;
import com.archibus.app.common.connectors.impl.json.outbound.OutboundJsonRequests;
import com.archibus.app.common.connectors.impl.ldap.inbound.*;
import com.archibus.app.common.connectors.impl.text.inbound.InboundTextRequests;
import com.archibus.app.common.connectors.impl.text.inbound.controller.InboundRelatedTextController;
import com.archibus.app.common.connectors.impl.text.outbound.OutboundTextRequests;
import com.archibus.app.common.connectors.impl.xls.inbound.InboundXlsRequests;
import com.archibus.app.common.connectors.impl.xls.inbound.controller.InboundXlsSheetsController;
import com.archibus.app.common.connectors.impl.xls.outbound.OutboundXlsRequests;
import com.archibus.app.common.connectors.impl.xml.inbound.InboundXmlRequests;
import com.archibus.app.common.connectors.impl.xml.outbound.OutboundXmlRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.service.exception.ConnectorConstructorException;

/**
 * Connector request types.
 *
 * @author cole
 * @since 22.1
 *
 */
public enum ConnectorRequestsType {
    /**
     * A connector for exchanging data in text files with delimited or fixed width fields.
     */
    TEXT(SystemType.FILE, DataType.TEXT, InboundTextRequests.class, OutboundTextRequests.class,
            EnumSet.of(ConnectorType.TEXT)),
    /**
     * A connector for exchanging data in excel spread sheets.
     */
    EXCEL(SystemType.FILE, DataType.EXCEL, InboundXlsRequests.class, OutboundXlsRequests.class,
            EnumSet.of(ConnectorType.EXCEL)),
    /**
     * A connector for exchanging data in XML files.
     */
    XML(SystemType.FILE, DataType.XML, InboundXmlRequests.class, OutboundXmlRequests.class, EnumSet
        .of(ConnectorType.XML)),
    /**
     * A connector for exchanging data with an Oracle database.
     */
    DBMS(SystemType.DBMS, DataType.DATA_RECORD, InboundDbRequests.class, OutboundDbRequests.class,
            EnumSet.of(ConnectorType.MS_ACCESS, ConnectorType.ORACLE, ConnectorType.SQL_SERVER,
                ConnectorType.SYBASE)),
    /**
     * A connector for exchanging data with an LDAP system.
     */
    LDAP(SystemType.LDAP, DataType.SEARCH_RESULTS, InboundLdapRequests.class, null, EnumSet
        .of(ConnectorType.LDAP)),
    /**
     * A connector for exchanging data with an Active Directory system via LDAP.
     */
    LDAP_AD(SystemType.ACTIVE_DIRECTORY, DataType.SEARCH_RESULTS, InboundLdapAdRequests.class,
            null, EnumSet.of(ConnectorType.LDAP_AD)),
    /**
     * A connector for exchanging data with multiple XLS spreadsheets.
     */
    XLS_SHEETS(SystemType.FILE, DataType.EXCEL, InboundXlsSheetsController.class, null, EnumSet
        .of(ConnectorType.XLS_SHEETS)),
    /**
     * A connector for exchanging JSON data.
     */
    JSON(SystemType.FILE, DataType.JSON, InboundJsonRequests.class, OutboundJsonRequests.class,
            EnumSet.of(ConnectorType.JSON)),
    /**
     * A connector for exchanging data with Electronic Data Interchange files.
     */
    EDI(SystemType.FILE, DataType.EDI, InboundEdiRequests.class, null, EnumSet
        .of(ConnectorType.EDI)),
    /**
     * A connector for exchanging data in text files with delimited or fixed width fields where
     * record vary or are interrelated.
     */
    RELATED_TEXT(SystemType.FILE, DataType.TEXT, InboundRelatedTextController.class, null, EnumSet
        .of(ConnectorType.RElATED_TEXT)),
    /**
     * A placeholder indicating that the type is unsupported.
     */
    UNSUPPORTED(null, null, null, null, EnumSet.noneOf(ConnectorType.class));

    /**
     * Class for retrieving data of this type.
     */
    private final Class<? extends AbstractRequests<?, ?, ?, ?>> inboundClass;

    /**
     * Class for storing data of this type.
     */
    private final Class<? extends AbstractRequests<?, ?, ?, ?>> outboundClass;

    /**
     * The configured types that correspond to this type of request.
     */
    private final EnumSet<ConnectorType> configuredTypes;

    /**
     * The type of system data is exchanged with.
     */
    private final SystemType systemType;

    /**
     * The type of data exchanged.
     */
    private final DataType dataType;

    /**
     * @param systemType the type of system data is exchanged with.
     * @param dataType the type of data exchanged.
     * @param inboundClass class for retrieving data of this type.
     * @param outboundClass class for storing data of this type.
     * @param configuredTypes the configured types that correspond to this type of request.
     */
    private ConnectorRequestsType(final SystemType systemType, final DataType dataType,
            final Class<? extends AbstractRequests<?, ?, ?, ?>> inboundClass,
            final Class<? extends AbstractRequests<?, ?, ?, ?>> outboundClass,
            final EnumSet<ConnectorType> configuredTypes) {
        this.systemType = systemType;
        this.dataType = dataType;
        this.inboundClass = inboundClass;
        this.outboundClass = outboundClass;
        this.configuredTypes = configuredTypes;
    }

    /**
     * @return the configured types that correspond to this type of request.
     */
    private EnumSet<ConnectorType> getConfiguredTypes() {
        return this.configuredTypes;
    }
    
    /**
     * @param connectorType the configured type.
     * @return the type of requests supporting the configured type or UNSUPPORTED if there is none.
     */
    public static ConnectorRequestsType valueOf(final ConnectorType connectorType) {
        ConnectorRequestsType type = UNSUPPORTED;
        for (final ConnectorRequestsType currType : values()) {
            if (currType.getConfiguredTypes().contains(connectorType)) {
                type = currType;
                break;
            }
        }
        return type;
    }

    /**
     * @param connectorConfig the configuration for making the requests.
     * @param log a log for logging errors.
     * @return method for exchanging data as configured by connectorConfig.
     * @throws ConfigurationException if the method cannot be instantiated for any reason.
     */
    public AbstractRequests<?, ?, ?, ?> getInstance(final ConnectorConfig connectorConfig,
            final IUserLog log) throws ConfigurationException {
        try {
            /*
             * NOTE: this is so far always the case, but exceptions can be handled here with a
             * switch statement.
             */
            return getRequestsClass(connectorConfig).getConstructor(String.class,
                ConnectorConfig.class, IUserLog.class).newInstance(
                generateName(connectorConfig.getExport()), connectorConfig, log);
        } catch (final SecurityException e) {
            throw new ConnectorConstructorException(e);
        } catch (final NoSuchMethodException e) {
            throw new ConnectorConstructorException(e);
        } catch (final IllegalArgumentException e) {
            throw new ConnectorConstructorException(e);
        } catch (final InstantiationException e) {
            throw new ConnectorConstructorException(e);
        } catch (final IllegalAccessException e) {
            throw new ConnectorConstructorException(e);
        } catch (final InvocationTargetException e) {
            throw new ConfigurationException("Configuration Failed: " + e.getCause(), e.getCause());
        }
    }
    
    /**
     * @param connectorConfig the configuration for making the requests.
     * @return the requests class for this configuration.
     * @throws ConfigurationException if the requests class isn't specified.
     */
    private Class<? extends AbstractRequests<?, ?, ?, ?>> getRequestsClass(
            final ConnectorConfig connectorConfig) throws ConfigurationException {
        Class<? extends AbstractRequests<?, ?, ?, ?>> requestsClass;
        if (connectorConfig.getExport()) {
            requestsClass = this.outboundClass;
        } else {
            requestsClass = this.inboundClass;
        }
        if (requestsClass == null) {
            throw new ConfigurationException(this.name() + " not supported for "
                    + (connectorConfig.getExport() ? "export" : "import"), null);
        }
        return requestsClass;
    }
    
    /**
     * @param export whether this is an import or export.
     * @return a name for this type of requests.
     */
    private String generateName(final boolean export) {
        return (export ? "Store" : "Retrieve") + ' ' + this.dataType.getName() + " data "
                + (export ? "to" : "from") + ' ' + this.systemType.getName();
    }
}

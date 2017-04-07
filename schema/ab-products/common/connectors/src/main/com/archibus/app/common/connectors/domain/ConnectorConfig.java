package com.archibus.app.common.connectors.domain;

import java.text.ParseException;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.dao.datasource.ConnectorFieldDataSource;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ConnectorType;
import com.archibus.app.common.connectors.domain.ConnectorTypes.DelimiterType;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ExecFlag;
import com.archibus.app.common.connectors.domain.ConnectorTypes.NotificationLevel;
import com.archibus.app.common.connectors.domain.ConnectorTypes.TextQualifier;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.StringUtil;

/*
 * Suppressing too many fields/public method warnings, as this reflects a table with many fields.
 */
/**
 * Configuration for a connector from the afm_connector table.
 *
 * @author cole
 *
 */
@SuppressWarnings({ "PMD.TooManyFields", "PMD.TooManyMethods", "PMD.ExcessivePublicCount" })
public class ConnectorConfig {
    /**
     * Connector with definitions for transactions defined in a hierarchy where each level is
     * homogeneous.
     */
    private String assignedConnector;

    /**
     * A restriction on transactions from a source.
     */
    private String clause;

    /**
     * Raw custom parameters for various types of connectors.
     */
    private String connParamsDb = "{}";

    /**
     * Custom parameters for various types of connectors.
     */
    private JSONObject connParams = new JSONObject();

    /**
     * Password for adaptors like LDAP and DB.
     */
    private String connPassword;

    /**
     * A URL (with event handler parameters) used to identify a foreign data source.
     */
    private String connStringDb;

    /**
     * User for adaptors like LDAP and DB.
     */
    private String connUser;

    /**
     * A unique identifier for this connector.
     */
    private String connectorId;

    /**
     * The field delimiter in a delimited text file.
     */
    private DelimiterType delimeter;

    /**
     * A description of the connector, intended for the end user.
     */
    private String description;

    /**
     * The table in the foreign system involved in the data exchange.
     */
    private String destinationTbl;

    /**
     * The connector's status, whether it's running, waiting to run or not running.
     */
    private ExecFlag execFlag;

    /**
     * The folder on the FTP site where files are to read/written.
     */
    private String ftpFolder;

    /**
     * The password required to access the FTP service.
     */
    private String ftpPassword;

    /**
     * The port on which the FTP service listens.
     */
    private Integer ftpPort;

    /**
     * Whether the FTP session is secure (not SFTP, just encrypted FTP).
     */
    private Boolean ftpSecure;

    /**
     * URL for FTP Server.
     */
    private String ftpString;

    /**
     * The user name required to access the FTP service.
     */
    private String ftpUser;

    /**
     * Whether data is being provided by ARCHIBUS (export = true) or to ARCHIBUS (export = false).
     */
    private Boolean export;

    /**
     * The email for the end user who should receive notifications about success or failure of the
     * connector.
     */
    private String notifyEmailAddress;

    /**
     * When to notify the end user by email.
     */
    private NotificationLevel notifyUser;

    /**
     * A fully qualified method (com.package.Class.method) to be called after executing the
     * connector.
     */
    private String postProcess;

    /**
     * A fully qualified method (com.package.Class.method) to be called before executing the
     * connector.
     */
    private String preProcess;

    /**
     * How many initial transactions are to be ignored. Generally used when the first transaction is
     * headers.
     */
    private Integer skipFirstRow;

    /**
     * The ARCHIBUS table involved in the data exchange.
     */
    private String sourceTbl;

    /**
     * Delimits the beginning and end of a string of text that contains no control sequences (such
     * as field delimiters).
     */
    private TextQualifier textQualifier;

    /**
     * Connector fields associated with this connector.
     */
    private List<ConnectorFieldConfig> connectorFields;

    /**
     * Connector fields by position.
     */
    private Map<Integer, ConnectorFieldConfig> connectorFieldPositionMap;

    /**
     * The type of data exchange (i.e. a parser and adaptor; an implementation of AbstractRequests).
     */
    private ConnectorType type;

    /**
     * @return connector with definitions for transactions defined in a hierarchy where each level
     *         is homogeneous
     */
    public String getAssignedConnector() {
        return this.assignedConnector;
    }

    /**
     * @return a restriction on transactions from a source.
     */
    public String getClause() {
        return this.clause;
    }

    /**
     * @return a unique identifier for this connector.
     */
    public String getConnectorId() {
        return this.connectorId;
    }

    /**
     * @return parsed custom parameters for various types of connectors.
     * @throws ConfigurationException if the parameters cannot be parsed.
     */
    public JSONObject getConnParams() throws ConfigurationException {
        if (this.connParams == null) {
            try {
                this.connParams =
                        StringUtil.isNullOrEmpty(this.connParamsDb) ? new JSONObject()
                                : new JSONObject(this.connParamsDb);
            } catch (final ParseException e) {
                throw new ConfigurationException(
                    "Unable to parse connector parameters as JSONObject.", e);
            }
        }
        return this.connParams;
    }

    /**
     * @return raw custom parameters for various types of connectors.
     */
    public String getConnParamsDb() {
        if (this.connParamsDb == null) {
            this.connParamsDb =
                    (this.connParams == null || this.connParams.length() <= 0) ? ""
                            : this.connParams.toString();
        }
        return this.connParamsDb;
    }

    /**
     * @return password for adaptors like LDAP and DB.
     */
    public String getConnPassword() {
        return this.connPassword;
    }

    /**
     * @return a URL used to identify a foreign data source.
     */
    public String getConnString() {
        return EventHandlerBase.expandParameters(ContextStore.get().getEventHandlerContext(),
            this.connStringDb);
    }

    /**
     * @return a URL used to identify a foreign data source.
     */
    public String getConnStringDb() {
        return this.connStringDb;
    }

    /**
     * @return user for adaptors like LDAP and DB.
     */
    public String getConnUser() {
        return this.connUser;
    }

    /**
     * @return the DelimeterType equivalent of the field delimiter in a delimited text file.
     */
    public DelimiterType getDelimeter() {
        return this.delimeter;
    }

    /**
     * @return the raw field delimiter in a delimited text file.
     */
    public Integer getDelimeterDb() {
        return this.delimeter == null ? null : this.delimeter.ordinal();
    }

    /**
     * @return a description of the connector, intended for the end user.
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * @return the table in the foreign system involved in the data exchange.
     */
    public String getDestinationTbl() {
        return this.destinationTbl;
    }

    /**
     * @return the connector's status, whether it's running, waiting to run or not running.
     */
    public ExecFlag getExecFlag() {
        return this.execFlag;
    }

    /**
     * @return the connector's raw status, whether it's running, waiting to run or not running.
     */
    public Integer getExecFlagDb() {
        return this.execFlag == null ? null : this.execFlag.ordinal();
    }

    /**
     * @return whether data is being provided by ARCHIBUS (export = true) or to ARCHIBUS (export =
     *         false).
     */
    public Boolean getExport() {
        return this.export;
    }

    /**
     * @return the folder on the FTP site where files are to read/written.
     */
    public String getFtpFolder() {
        return this.ftpFolder;
    }

    /**
     * @return the password required to access the FTP service.
     */
    public String getFtpPassword() {
        return this.ftpPassword;
    }

    /**
     * @return the port on which the FTP service listens.
     */
    public Integer getFtpPort() {
        return this.ftpPort;
    }

    /**
     * @return whether the FTP session is secure (not SFTP, just encrypted FTP).
     */
    public Boolean getFtpSecure() {
        return this.ftpSecure;
    }

    /**
     * @return ftpSecure 1 if the FTP session is secure (not SFTP, just encrypted FTP).
     */
    public Integer getFtpSecureDb() {
        return this.ftpSecure == null ? null : (this.ftpSecure ? 1 : 0);
    }

    /**
     * @return URL for FTP Server.
     */
    public String getFtpString() {
        return this.ftpString;
    }

    /**
     * @return the user name required to access the FTP service.
     */
    public String getFtpUser() {
        return this.ftpUser;
    }

    /**
     * @return whether data is being provided by ARCHIBUS (1) or to ARCHIBUS (0). Please note that
     *         this is the opposite of what you might normally expect from a field called "import".
     */
    public Integer getImportDb() {
        /*
         * Note: the user selects "Import", the field name is "import", the value 0 means "Import"
         * and 1 means "Export", which is not to be confused with the normal representation of a
         * boolean value, which would be reversed.
         */
        return this.export == null ? null : (this.export ? 1 : 0);
    }

    /**
     * @return the email for the end user who should receive notifications about success or failure
     *         of the connector.
     */
    public String getNotifyEmailAddress() {
        return this.notifyEmailAddress;
    }

    /**
     * @return when to notify the end user by email.
     */
    public NotificationLevel getNotifyUser() {
        return this.notifyUser;
    }

    /**
     * @return when to notify the end user by email (integer code for enumeration)
     */
    public Integer getNotifyUserDb() {
        return this.notifyUser == null ? null : this.notifyUser.ordinal();
    }

    /**
     * @return a fully qualified method (com.package.Class.method) to be called after executing the
     *         connector.
     */
    public String getPostProcess() {
        return this.postProcess;
    }

    /**
     * @return a fully qualified method (com.package.Class.method) to be called before executing the
     *         connector.
     */
    public String getPreProcess() {
        return this.preProcess;
    }

    /**
     * @return how many initial transactions are to be ignored. Generally used when the first
     *         transaction is headers.
     */
    public Integer getSkipFirstRow() {
        return this.skipFirstRow;
    }

    /**
     * @return the ARCHIBUS table involved in the data exchange.
     */
    public String getSourceTbl() {
        return this.sourceTbl;
    }

    /**
     * @return delimiter for the beginning and end of a string of text that contains no control
     *         sequences (such as field delimiters).
     */
    public TextQualifier getTextQualifier() {
        return this.textQualifier;
    }

    /**
     * @return raw delimiter for the beginning and end of a string of text that contains no control
     *         sequences (such as field delimiters).
     */
    public Integer getTextQualifierDb() {
        return this.textQualifier == null ? null : this.textQualifier.ordinal();
    }

    /**
     * @return the type of data exchange (i.e. a parser and adaptor; an implementation of
     *         AbstractRequests).
     */
    public ConnectorType getType() {
        return this.type;
    }

    /**
     * @return an enumerated code for the type of data exchange (i.e. a parser and adaptor; an
     *         implementation of AbstractRequests).
     */
    public Integer getTypeDb() {
        return this.type == null ? null : this.type.getCode();
    }

    /**
     * @param assignedConnector a connector with definitions for transactions defined in a hierarchy
     *            where each level is homogeneous.
     */
    public void setAssignedConnector(final String assignedConnector) {
        this.assignedConnector = assignedConnector;
    }

    /**
     * @param clause a restriction on transactions from a source.
     */
    public void setClause(final String clause) {
        this.clause = clause;
    }

    /**
     * @param connectorId a unique identifier for this connector.
     */
    public void setConnectorId(final String connectorId) {
        this.connectorId = connectorId;
    }

    /*
     * Justification: the field being set to null is private and the getter does a null check. This
     * lazy parsing is important for setting the status of the connector and preserving formatting
     * of parameters, even when the parameters have syntax errors.
     */
    /**
     * @param connParamsDb raw custom parameters for various types of connectors.
     */
    @SuppressWarnings("PMD.NullAssignment")
    public void setConnParamsDb(final String connParamsDb) {
        this.connParamsDb = connParamsDb;
        this.connParams = null;
    }

    /**
     * @param connParams parsed custom parameters for various types of connectors.
     */
    public void setConnParams(final JSONObject connParams) {
        this.connParams = connParams;
        this.connParamsDb = "";
    }

    /**
     * @param connPassword password for adaptors like LDAP and DB.
     */
    public void setConnPassword(final String connPassword) {
        this.connPassword = connPassword;
    }

    /**
     * @param connString a URL used to identify a foreign data source.
     */
    public void setConnString(final String connString) {
        throw new UnsupportedOperationException(
            "Setting connString directly is forbidden.  Set connStringDb instead, ensuring that intended parameters are preserved.");
    }

    /**
     * @param connStringDb a URL (with event handler parameters) used to identify a foreign data
     *            source.
     */
    public void setConnStringDb(final String connStringDb) {
        this.connStringDb = connStringDb;
    }

    /**
     * @param connUser user for adaptors like LDAP and DB.
     */
    public void setConnUser(final String connUser) {
        this.connUser = connUser;
    }

    /**
     * @param delimeter the DelimeterType equivalent of the field delimiter in a delimited text
     *            file.
     */
    public void setDelimeter(final DelimiterType delimeter) {
        this.delimeter = delimeter;
    }

    /**
     * @param delimeterDb the raw field delimiter in a delimited text file.
     */
    public void setDelimeterDb(final Integer delimeterDb) {
        this.delimeter = DelimiterType.valueOf(delimeterDb);
    }

    /**
     * @param description a description of the connector, intended for the end user, or the XML
     *            template for transactions.
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * @param destinationTbl the table in the foreign system involved in the data exchange.
     */
    public void setDestinationTbl(final String destinationTbl) {
        this.destinationTbl = destinationTbl;
    }

    /**
     * @param execFlag the ExecFlag equivalent of the connector's status, whether it's running,
     *            waiting to run or not running.
     */
    public void setExecFlag(final ExecFlag execFlag) {
        this.execFlag = execFlag;
    }

    /**
     * @param execFlagDb the connector's raw status, whether it's running, waiting to run or not
     *            running.
     */
    public void setExecFlagDb(final Integer execFlagDb) {
        this.execFlag = ExecFlag.valueOf(execFlagDb);
    }

    /**
     * @param export whether data is being provided by ARCHIBUS (export = true) or to ARCHIBUS
     *            (export = false).
     */
    public void setExport(final Boolean export) {
        this.export = export;
    }

    /**
     * @param exportDb whether data is being provided by ARCHIBUS (export = 1) or to ARCHIBUS
     *            (export = 0).
     */
    public void setImportDb(final Integer exportDb) {
        /*
         * Note: the user selects "Import", the field name is "import", the value 0 means "Import"
         * and 1 means "Export", which is not to be confused with the normal representation of a
         * boolean value, which would be reversed.
         */
        this.export = exportDb.intValue() != 0;
    }

    /**
     * @param ftpFolder the folder on the FTP site where files are to read/written.
     */
    public void setFtpFolder(final String ftpFolder) {
        this.ftpFolder = ftpFolder;
    }

    /**
     * @param ftpPassword the password required to access the FTP service.
     */
    public void setFtpPassword(final String ftpPassword) {
        this.ftpPassword = ftpPassword;
    }

    /**
     * @param ftpPort the port on which the FTP service listens.
     */
    public void setFtpPort(final Integer ftpPort) {
        this.ftpPort = ftpPort;
    }

    /**
     * @param ftpSecure whether the FTP session is secure (not SFTP, just encrypted FTP).
     */
    public void setFtpSecure(final Boolean ftpSecure) {
        this.ftpSecure = ftpSecure;
    }

    /**
     * @param ftpSecureDb 1 if the FTP session is secure (not SFTP, just encrypted FTP).
     */
    public void setFtpSecureDb(final Integer ftpSecureDb) {
        this.ftpSecure = ftpSecureDb.intValue() != 0;
    }

    /**
     * @param ftpString URL for FTP Server.
     */
    public void setFtpString(final String ftpString) {
        this.ftpString = ftpString;
    }

    /**
     * @param ftpUser the user name required to access the FTP service.
     */
    public void setFtpUser(final String ftpUser) {
        this.ftpUser = ftpUser;
    }

    /**
     * @param notifyEmailAddress the email for the end user who should receive notifications about
     *            success or failure of the connector.
     */
    public void setNotifyEmailAddress(final String notifyEmailAddress) {
        this.notifyEmailAddress = notifyEmailAddress;
    }

    /**
     * @param notifyUser when to notify the end user by email.
     */
    public void setNotifyUser(final NotificationLevel notifyUser) {
        this.notifyUser = notifyUser;
    }

    /**
     * @param notifyUserDb when to notify the end user by email (integer code for enumeration)
     */
    public void setNotifyUserDb(final Integer notifyUserDb) {
        this.notifyUser = NotificationLevel.values()[notifyUserDb];
    }

    /**
     * @param postProcess a fully qualified method (com.package.Class.method) to be called after
     *            executing the connector.
     */
    public void setPostProcess(final String postProcess) {
        this.postProcess = postProcess;
    }

    /**
     * @param preProcess a fully qualified method (com.package.Class.method) to be called before
     *            executing the connector.
     */
    public void setPreProcess(final String preProcess) {
        this.preProcess = preProcess;
    }

    /**
     * @param skipFirstRow how many initial transactions are to be ignored. Generally used when the
     *            first transaction is headers.
     */
    public void setSkipFirstRow(final Integer skipFirstRow) {
        this.skipFirstRow = skipFirstRow;
    }

    /**
     * @param sourceTbl the ARCHIBUS table involved in the data exchange.
     */
    public void setSourceTbl(final String sourceTbl) {
        this.sourceTbl = sourceTbl;
    }

    /**
     * @param textQualifier delimiter for the beginning and end of a string of text that contains no
     *            control sequences (such as field delimiters).
     */
    public void setTextQualifier(final TextQualifier textQualifier) {
        this.textQualifier = textQualifier;
    }

    /**
     * @param textQualifierDb raw delimiter for the beginning and end of a string of text that
     *            contains no control sequences (such as field delimiters).
     */
    public void setTextQualifierDb(final Integer textQualifierDb) {
        this.textQualifier = TextQualifier.valueOf(textQualifierDb);
    }

    /**
     * @param type the type of data exchange (i.e. a parser and adaptor; an implementation of
     *            AbstractRequests).
     */
    public void setType(final ConnectorType type) {
        this.type = type;
    }

    /**
     * @param typeDb an enumerated code for the type of data exchange (i.e. a parser and adaptor; an
     *            implementation of AbstractRequests).
     */
    public void setTypeDb(final Integer typeDb) {
        this.type = ConnectorType.valueOf(typeDb);
    }

    /**
     * @return a list of connector fields associated with this connector ordered by position.
     */
    public List<ConnectorFieldConfig> getConnectorFields() {
        if (this.connectorFields == null) {
            this.connectorFields = new ConnectorFieldDataSource().getConnectorFields(this);
        }
        return this.connectorFields;
    }

    /**
     * @return connector fields associated with this connector by position.
     */
    public Map<Integer, ConnectorFieldConfig> getConnectorFieldPositionMap() {
        if (this.connectorFieldPositionMap == null) {
            this.connectorFieldPositionMap = new HashMap<Integer, ConnectorFieldConfig>();
            for (final ConnectorFieldConfig connectorField : getConnectorFields()) {
                this.connectorFieldPositionMap.put(connectorField.getPosition(), connectorField);
            }
            this.connectorFieldPositionMap =
                    Collections.unmodifiableMap(this.connectorFieldPositionMap);
        }
        return this.connectorFieldPositionMap;
    }

    /**
     * @return the table in the ARCHIBUS database this connector exchanges data with.
     */
    public String getArchibusTable() {
        return getDestinationTbl();
    }

    /**
     * @return the path to transactions in a foreign data source, e.g. an excel sheet or xPath to an
     *         set of transaction elements.
     */
    public String getForeignTxPath() {
        return getSourceTbl();
    }
}

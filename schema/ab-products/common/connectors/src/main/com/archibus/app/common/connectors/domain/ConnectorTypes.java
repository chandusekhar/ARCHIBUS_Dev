package com.archibus.app.common.connectors.domain;

/**
 * Enumerations associated with a ConnectorBean.
 *
 * @author cole
 *
 */
public class ConnectorTypes {
    
    /**
     * The type of a connector to be executed indicating the protocol to be used and the format of
     * data exchanged.
     */
    public enum ConnectorType {
        /**
         * A connector for exchanging data in text files with delimited or fixed width fields.
         */
        TEXT(1),
        /**
         * A connector for exchanging data in excel spread sheets files.
         */
        EXCEL(2),
        /**
         * A connector for exchanging data in XML files.
         */
        XML(3),
        /**
         * A connector for exchanging data with an Oracle database.
         */
        ORACLE(4),
        /**
         * A connector for exchanging data with a SQL Server database.
         */
        SQL_SERVER(5),
        /**
         * A connector for exchanging data with a Sybase database.
         */
        SYBASE(6),
        /**
         * A connector for exchanging data with a SOAP Web Service.
         */
        WEB_SERVICE(7),
        /**
         * A connector for exchanging data with a SAP system.
         */
        SAP(8),
        /**
         * A connector for exchanging data with an LDAP system.
         */
        LDAP(9),
        /**
         * A connector for exchanging data with an Active Directory system via LDAP.
         */
        LDAP_AD(10),
        /**
         * A connector for exchanging data with a DBF database.
         */
        DBF(11),
        /**
         * A connector for exchanging data with an Microsof Access database.
         */
        MS_ACCESS(12),
        /**
         * A connector for exchanging data with multiple XLS spreadsheets.
         */
        XLS_SHEETS(13),
        /**
         * A connector for exchanging data with an OSCRE data source.
         */
        OSCRE(14),
        /**
         * A connector for receiving data over an ARCHIBUS web service.
         */
        ARCHIBUS_WS(15),
        /**
         * A connector for exchanging JSON data.
         */
        JSON(16),
        /**
         * A connector for exchanging data with Electronic Data Interchange files.
         */
        EDI(17),
        /**
         * A connector for exchanging data in text files with delimited or fixed width fields where
         * record vary or are interrelated.
         */
        RElATED_TEXT(18),
        /**
         * A connector for exchanging data with a custom data source.
         */
        CUSTOM(99);
        
        /**
         * A database code for a ConnectorType.
         */
        private final int code;
        
        /**
         * @param code a database code for a ConnectorType.
         */
        private ConnectorType(final int code) {
            this.code = code;
        }
        
        /**
         * @param code a database code for a ConnectorType.
         * @return the ConnectorType for the given database code.
         */
        public static ConnectorType valueOf(final Integer code) {
            ConnectorType type = null;
            if (code != null) {
                for (final ConnectorType connectorType : ConnectorType.values()) {
                    if (connectorType.code == code.intValue()) {
                        type = connectorType;
                    }
                }
            }
            return type;
        }
        
        /**
         * @return the database code for this connector type.
         */
        public int getCode() {
            return this.code;
        }
    }
    
    /**
     * The type of field delimiter to be used when parsing a text file.
     *
     */
    public enum DelimiterType {
        /**
         * Delimited by the tab character.
         */
        TAB("\t"),
        /**
         * Delimited by the pipe character.
         */
        PIPE("|"),
        /**
         * Delimited by the comma character.
         */
        COMMA(","),
        /**
         * Delimited by the tilda character.
         */
        TILDA("~"),
        /**
         * Delimited by star character.
         */
        STAR("*"),
        /**
         * Delimited by reaching a certain number of characters.
         */
        FIXED_LENGTH("");
        
        /**
         * The string representation of the field delimiter as it appears in the text it delimits.
         */
        private final String sequence;
        
        /**
         * @param sequence the string representation of the delimiter as it appears in the text it
         *            delimits.
         */
        private DelimiterType(final String sequence) {
            this.sequence = sequence;
        }
        
        /**
         * @param code a database code for a DelimiterType
         * @return the DelimiterType for the given database code.
         */
        public static DelimiterType valueOf(final Integer code) {
            return code == null ? null : values()[code];
        }
        
        /**
         * @return the string representation of the delimiter as it appears in the text it delimits.
         */
        public String getSequence() {
            return this.sequence;
        }
        
        /**
         * @return whether this is not delimited by a sequence but instead by a specified number of
         *         characters.
         */
        public boolean isFixed() {
            return this.sequence == null;
        }
    }
    
    /**
     * The status of a connector.
     *
     */
    public enum ExecFlag {
        /**
         * The connector is not running, but is ready to be run.
         */
        READY,
        /**
         * The connector is queued for execution, but is not running yet.
         */
        EXECUTE,
        /**
         * The connector is currently processing data.
         */
        RUNNING;
        
        /**
         * @param code a database code for a ExecFlag
         * @return the ExecFlag for the given database code.
         */
        public static ExecFlag valueOf(final Integer code) {
            return code == null ? null : values()[code];
        }
    }
    
    /**
     * A threshold for sending email notifications about a connector.
     *
     */
    public enum NotificationLevel {
        /**
         * No email.
         */
        NONE,
        /**
         * Email when an error occurs.
         */
        ERROR,
        /**
         * Email when status changes.
         */
        NORMAL,
        /**
         * Email on errors or when status changes.
         */
        BOTH;
        
        /**
         * @param code a database code for a NotificationLevel
         * @return the NotificationLevel for the given database code.
         */
        public static NotificationLevel valueOf(final Integer code) {
            return code == null ? null : values()[code];
        }
    }
    
    /**
     * Delimiter for text that is not interpreted, e.g. within quotation marks delimiters may be
     * ignored.
     *
     */
    public enum TextQualifier {
        /**
         * All text is interpreted.
         */
        NONE(""),
        /**
         * Text is double quotes is not interpreted.
         */
        DOUBLE_QUOTE("\""),
        /**
         * Text is single quotes is not interpreted.
         */
        SINGLE_QUOTE("'");
        
        /**
         * The string representation of the text qualifier as it appears in the text it delimits.
         */
        private final String sequence;
        
        /**
         * @param sequence the string representation of the text qualifier as it appears in the text
         *            it delimits.
         */
        private TextQualifier(final String sequence) {
            this.sequence = sequence;
        }
        
        /**
         * @param code a database code for a TextQualifier
         * @return the TextQualifier for the given database code.
         */
        public static TextQualifier valueOf(final Integer code) {
            return code == null ? null : values()[code];
        }
        
        /**
         * @return the string representation of the delimiter as it appears in the text it delimits.
         */
        public String getSequence() {
            return this.sequence;
        }
    }
}

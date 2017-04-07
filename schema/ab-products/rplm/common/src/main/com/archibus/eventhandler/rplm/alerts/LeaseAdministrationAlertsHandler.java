package com.archibus.eventhandler.rplm.alerts;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

public class LeaseAdministrationAlertsHandler extends EventHandlerBase {
    
    public static final String RPLM_ACTIVITY_ID = "AbRPLMLeaseAdministration";
    
    private static final String CONTENT_TYPE = "text/plain; charset=UTF-8";
    
    private String mail_from = null;
    
    private String smtp_host = null;
    
    private String smtp_port = null;
    
    private String webcentral_path = null;
    
    public void generateAlerts(final EventHandlerContext context) throws ExceptionBase {
        if (this.log.isDebugEnabled()) {
            this.log.debug("LeaseAdministrationAlertsHandler-generateAlerts : BEGIN");
        }
        
        this.mail_from = getEmailFrom(context);
        this.smtp_host = getEmailHost(context);
        this.smtp_port = getEmailPort(context);
        this.webcentral_path = getWebCentralPath(context);
        
        final DataSource ds0 = DataSourceFactory.createDataSource();
        ds0.addTable("ls", "main");
        ds0.addTable("ls_alert_definition", "standard");
        ds0.addVirtualField("ls_alert_definition", "alert_type", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "ls_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "op_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "description", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "date_start", DataSource.DATA_TYPE_DATE);
        ds0.addVirtualField("ls", "date_end", DataSource.DATA_TYPE_DATE);
        ds0.addVirtualField("ls", "landlord_tenant", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "lease_sublease", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "bl_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "pr_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "comments", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls_alert_definition", "notification_days", DataSource.DATA_TYPE_NUMBER);
        ds0.addVirtualField("ls_alert_definition", "color", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls_alert_definition", "role_name", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField("ls", "op_type", DataSource.DATA_TYPE_TEXT);
        final String sqlQuery0 =
                "SELECT alert_type, ls_id, NULL AS op_id, description, "
                        + "  date_start, date_end, "
                        + "  landlord_tenant, lease_sublease, "
                        + "  bl_id, pr_id, comments, "
                        + "  notification_days, color, "
                        + "  role_name, NULL AS op_type "
                        + "FROM ls, ls_alert_definition "
                        + "WHERE alert_type = 'Lease Due Date' "
                        + "  AND send_email = 1 "
                        + "  AND ls.date_end-CAST(${sql.currentDate} AS DATE) =  notification_days "
                        + "UNION "
                        + "SELECT alert_type, ls_id, op_id, description, "
                        + "  date_start, date_option AS date_end, "
                        + "  NULL AS landlord_tenant, NULL AS lease_sublease, "
                        + "  NULL AS bl_id, NULL AS pr_id, "
                        + "  comments, notification_days, color, "
                        + "  role_name, op_type "
                        + "FROM op, ls_alert_definition "
                        + "WHERE date_exercised IS NULL "
                        + "  AND alert_type = 'Option Due Date' "
                        + "  AND send_email = 1 "
                        + "  AND date_option-CAST(${sql.currentDate} AS DATE) =  notification_days ";
        
        final String sqlQuery1 =
                "SELECT alert_type, ls_id, NULL AS op_id, description, "
                        + "  date_start, date_end, " + "  landlord_tenant, lease_sublease, "
                        + "  bl_id, pr_id, comments, " + "  notification_days, color, "
                        + "  role_name, NULL AS op_type " + "FROM ls, ls_alert_definition "
                        + "WHERE alert_type = 'Lease Due Date' " + "  AND send_email = 1 "
                        + "  AND ls.date_end-${sql.currentDate} =  notification_days " + "UNION "
                        + "SELECT alert_type, ls_id, op_id, description, "
                        + "  date_start, date_option AS date_end, "
                        + "  NULL AS landlord_tenant, NULL AS lease_sublease, "
                        + "  NULL AS bl_id, NULL AS pr_id, "
                        + "  comments, notification_days, color, " + "  role_name, op_type "
                        + "FROM op, ls_alert_definition " + "WHERE date_exercised IS NULL "
                        + "  AND alert_type = 'Option Due Date' " + "  AND send_email = 1 "
                        + "  AND date_option-${sql.currentDate} =  notification_days ";
        
        if (isSybase(context)) {
            ds0.addQuery(sqlQuery0, SqlExpressions.DIALECT_SYBASE);
        } else if (isSqlServer(context)) {
            ds0.addQuery(sqlQuery1, SqlExpressions.DIALECT_SQLSERVER);
        } else if (isOracle(context)) {
            ds0.addQuery(sqlQuery1, SqlExpressions.DIALECT_ORACLE);
        }
        
        // This line does not work because the view has to be rendered first
        // DataSource ds0 =
        // DataSourceFactory.loadDataSourceFromFile("ab-rplm-lsadmin-alerts-service.axvw",
        // "alertsDs");
        final List<DataRecord> alerts = ds0.getRecords();
        
        PortfolioAlert alert = null;
        for (final DataRecord dataRecord : alerts) {
            final DataRecord record = dataRecord;
            
            alert = new PortfolioAlert(record);
            alert.setNotifyList();
            alert.sendAlert(context);
        }
    }
    
    class PortfolioAlert {
        
        private static final String AB_RPLM_LEASE_ADMINITSRATION = "AbRPLMLeaseAdministration";
        
        public DataRecord alertRecord;
        
        private List<DataRecord> notifyList;
        
        /**
         * utility record to have the headings of lease fields
         */
        private final DataRecord leaseRecord;
        
        /**
         * utility record to have the headings of option fields
         */
        private final DataRecord optionRecord;
        
        public PortfolioAlert(final DataRecord alertRecord) {
            this.alertRecord = alertRecord;
            
            // get a lease record in order to have the headings of the lease fields
            final DataSource dsLs = DataSourceFactory.createDataSource();
            dsLs.addTable("ls", "main");
            dsLs.addField("ls_id");
            dsLs.addField("description");
            dsLs.addField("landlord_tenant");
            dsLs.addField("lease_sublease");
            dsLs.addField("date_start");
            dsLs.addField("bl_id");
            dsLs.addField("pr_id");
            dsLs.addField("comments");
            this.leaseRecord = dsLs.getDefaultRecord(null);
            
            // get an option record in order to have the headings of the option fields
            final DataSource dsOp = DataSourceFactory.createDataSource();
            dsOp.addTable("op", "main");
            dsOp.addField("ls_id");
            dsOp.addField("op_id");
            dsOp.addField("op_type");
            dsOp.addField("description");
            dsOp.addField("comments");
            this.optionRecord = dsOp.getDefaultRecord(null);
        }
        
        public void setNotifyList() {
            final DataSource ds0 = DataSourceFactory.createDataSource();
            ds0.addTable("afm_users", "main");
            ds0.addVirtualField("afm_users", "email", DataSource.DATA_TYPE_TEXT);
            ds0.addVirtualField("afm_users", "locale", DataSource.DATA_TYPE_TEXT);
            ds0.addParameter("role_name",
                notNull(this.alertRecord.getValue("ls_alert_definition.role_name")),
                DataSource.DATA_TYPE_TEXT);
            final String sqlQuery0 =
                    "SELECT DISTINCT email,locale FROM afm_users "
                            + "WHERE role_name = ${parameters['role_name']} "
                            + "AND email IS NOT NULL";
            ds0.addQuery(sqlQuery0, SqlExpressions.DIALECT_GENERIC);
            this.notifyList = ds0.getRecords();
        }
        
        public void sendAlert(final EventHandlerContext context) {
            if (!this.notifyList.isEmpty()) {
                String rcpt_to = null, subject = null, body = null;
                final Map<String, Object> values = new HashMap<String, Object>();
                values.put("ls_ls_id", notNull(this.alertRecord.getValue("ls.ls_id")));
                values.put("ls_op_id", notNull(this.alertRecord.getValue("ls.op_id")));
                values.put("ls_description", notNull(this.alertRecord.getValue("ls.description")));
                values.put("ls_date_start", notNull(this.alertRecord.getValue("ls.date_start")));
                values.put("ls_date_end", notNull(this.alertRecord.getValue("ls.date_end")));
                values.put("ls_landlord_tenant",
                    notNull(this.alertRecord.getValue("ls.landlord_tenant")));
                values.put("ls_lease_sublease",
                    notNull(this.alertRecord.getValue("ls.lease_sublease")));
                values.put("ls_bl_id", notNull(this.alertRecord.getValue("ls.bl_id")));
                values.put("ls_pr_id", notNull(this.alertRecord.getValue("ls.pr_id")));
                values.put("ls_comments", notNull(this.alertRecord.getValue("ls.comments")));
                values.put("ls_op_type", notNull(this.alertRecord.getValue("ls.op_type")));
                values.put("ls_alert_definition_alert_type",
                    notNull(this.alertRecord.getValue("ls_alert_definition.alert_type")));
                values.put("ls_alert_definition_color",
                    notNull(this.alertRecord.getValue("ls_alert_definition.color")));
                
                final String alert_type = (String) values.get("ls_alert_definition_alert_type");
                
                final Iterator<DataRecord> it = this.notifyList.iterator();
                while (it.hasNext()) {
                    final DataRecord record = it.next();
                    rcpt_to = (String) record.getValue("afm_users.email");
                    final String afmUsersLocale = (String) record.getValue("afm_users.locale");
                    
                    final String[] args = getArgs(context, values, alert_type, afmUsersLocale);
                    
                    if (alert_type.equals("Lease Due Date")) {
                        subject =
                                prepareMessage(context, RPLM_ACTIVITY_ID, "LS_ALERTS_WFR",
                                    "LS_ALERT_TITLE", afmUsersLocale, args);
                        body =
                                prepareMessage(context, RPLM_ACTIVITY_ID, "LS_ALERTS_WFR",
                                    "LS_ALERT_TEXT", afmUsersLocale, args);
                    } else if (alert_type.equals("Option Due Date")) {
                        subject =
                                prepareMessage(context, RPLM_ACTIVITY_ID, "LS_ALERTS_WFR",
                                    "OP_ALERT_TITLE", afmUsersLocale, args);
                        body =
                                prepareMessage(context, RPLM_ACTIVITY_ID, "LS_ALERTS_WFR",
                                    "OP_ALERT_TEXT", afmUsersLocale, args);
                    }
                    if (StringUtil.notNullOrEmpty(rcpt_to)) {
                        sendEmail(body, LeaseAdministrationAlertsHandler.this.mail_from,
                            LeaseAdministrationAlertsHandler.this.smtp_host,
                            LeaseAdministrationAlertsHandler.this.smtp_port, subject, rcpt_to,
                            null, null, null, null, null, CONTENT_TYPE,
                            AB_RPLM_LEASE_ADMINITSRATION);
                    }
                }
            }
        }
        
        private String[] getArgs(final EventHandlerContext context,
                final Map<String, Object> values, final String alert_type,
                final String afmUsersLocale) {
            String[] args = null;
            // uses un-documented core API
            final Locale locale = XmlImpl.stringToLocale(afmUsersLocale);
            
            if (alert_type.equals("Lease Due Date")) {
                args =
                        new String[] {
                                (String) values.get("ls_ls_id"),
                                (String) values.get("ls_date_end"),
                                "\n\n"
                                        + this.leaseRecord.findField("ls.ls_id").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_ls_id")
                                        + "\n"
                                        + this.leaseRecord.findField("ls.description")
                                            .getFieldDef().multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_description")
                                        + "\n"
                                        + this.leaseRecord.findField("ls.landlord_tenant")
                                            .getFieldDef().multiLineHeadingsToString(locale)
                                            .toString().replaceAll("\\s", "")
                                        + ": "
                                        + this.leaseRecord
                                            .findField("ls.landlord_tenant")
                                            .getFieldDef()
                                            .formatFieldValue(
                                                values.get("ls_landlord_tenant"),
                                                this.leaseRecord.findField("ls.landlord_tenant")
                                                    .getFieldDef().getFormat(), true, locale)
                                        + "\n"
                                        + this.leaseRecord.findField("ls.lease_sublease")
                                            .getFieldDef().multiLineHeadingsToString(locale)
                                            .toString().replaceAll("\\s", "")
                                        + ": "
                                        + this.leaseRecord
                                            .findField("ls.lease_sublease")
                                            .getFieldDef()
                                            .formatFieldValue(
                                                values.get("ls_lease_sublease"),
                                                this.leaseRecord.findField("ls.lease_sublease")
                                                    .getFieldDef().getFormat(), true, locale)
                                        + "\n"
                                        + this.leaseRecord.findField("ls.date_start").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_date_start")
                                        + "\n"
                                        + this.leaseRecord.findField("ls.bl_id").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_bl_id")
                                        + "\n"
                                        + this.leaseRecord.findField("ls.pr_id").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_pr_id")
                                        + "\n"
                                        + this.leaseRecord.findField("ls.comments").getFieldDef()
                                            .multiLineHeadingsToString(locale) + ": "
                                        + values.get("ls_comments") + "\n\n",
                                "\n"
                                        + LeaseAdministrationAlertsHandler.this.webcentral_path
                                        + "/"
                                        + notNull(getActivityParameterString(context,
                                            RPLM_ACTIVITY_ID, "LS_ALERTS_VIEW")) + "?ls.ls_id="
                                        + values.get("ls_ls_id"),
                                localizeColor((String) values.get("ls_alert_definition_color"),
                                    locale) };
            } else if (alert_type.equals("Option Due Date")) {
                args =
                        new String[] {
                                (String) values.get("ls_ls_id") + "-" + values.get("ls_op_id"),
                                (String) values.get("ls_date_end"),
                                "\n\n"
                                        + this.optionRecord.findField("op.ls_id").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_ls_id")
                                        + "\n"
                                        + this.optionRecord.findField("op.op_id").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_op_id")
                                        + "\n"
                                        + this.optionRecord.findField("op.op_type").getFieldDef()
                                            .multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_op_type")
                                        + "\n"
                                        + this.optionRecord.findField("op.description")
                                            .getFieldDef().multiLineHeadingsToString(locale)
                                        + ": "
                                        + values.get("ls_description")
                                        + "\n"
                                        + this.optionRecord.findField("op.comments").getFieldDef()
                                            .multiLineHeadingsToString(locale) + ": "
                                        + values.get("ls_comments") + "\n\n",
                                "\n"
                                        + LeaseAdministrationAlertsHandler.this.webcentral_path
                                        + "/"
                                        + notNull(getActivityParameterString(context,
                                            RPLM_ACTIVITY_ID, "OP_ALERTS_VIEW")) + "?ls.ls_id="
                                        + values.get("ls_ls_id") + "&ls.op_id="
                                        + values.get("ls_op_id"),
                                localizeColor((String) values.get("ls_alert_definition_color"),
                                    locale) };
            }
            return args;
        }
        
        /**
         * Localize color code.
         * 
         * @param value color value
         * @param locale recipient locales
         * @return localized value
         */
        private String localizeColor(final String value, final Locale locale) {
            String result = value;
            if ("Green".equals(value)) {
                result = Messages.getLocalizedMessage(Messages.GREEN, locale);
            } else if ("Red".equals(value)) {
                result = Messages.getLocalizedMessage(Messages.RED, locale);
            } else if ("Yellow".equals(value)) {
                result = Messages.getLocalizedMessage(Messages.YELLOW, locale);
            }
            return result;
        }
    }
}

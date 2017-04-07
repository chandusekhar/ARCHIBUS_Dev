package com.archibus.eventhandler.emergencypreparedness;

import java.util.List;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 *
 * Event handler class that implements a few WFRs for supporting operations in
 * risk/EmergencyPreparedness module.
 *
 * @author Weijie
 */

public class EmergencyPreparednessCommonHandler extends EventHandlerBase {
    
    final static boolean throwException = false;
    
    /**
     * Send e-mails for bulletin.
     *
     * @param recipients recipients to send to
     * @param subject the e-mail subject
     * @param body the e-mail body
     * @param emailFrom the e-mail sender
     * @param sendAsIndividual send as individual or as bcc
     */
    public int emailAdvisoryBulletin(final List<String> recipients, final String subject,
            final String body, final String emailFrom, final int sendAsIndividual) {
        
        int numberOfFailed = 0;
        /*
         * final DataSource ds = DataSourceFactory.createDataSourceForFields("advisory", new
         * String[] { "advisory_id", "bulletin", "email_from", "subject", "notes" });
         * ds.addRestriction(Restrictions.eq("advisory", "advisory_id", advisoryId)); final
         * DataRecord record = ds.getRecord();
         *
         * final String emailFrom = record.getString("advisory.email_from");
         */
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String from =
                StringUtil.notNullOrEmpty(emailFrom) ? emailFrom : EventHandlerBase
                        .getEmailFrom(context);
        final String host = EventHandlerBase.getEmailHost(context);
        final String port = EventHandlerBase.getEmailPort(context);
        final String userId = EventHandlerBase.getEmailUserId(context);
        final String password = EventHandlerBase.getEmailPassword(context);
        
        final MailSender mailSender = new MailSender();

        final MailMessage message = new MailMessage();
        message.setActivityId("AbRiskEmergencyPreparedness");
        message.setContentType(EventHandlerBase.CONTENT_TYPE_TEXT_UFT8);
        message.setUser(userId);
        message.setPassword(password);
        message.setPort(port);
        message.setHost(host);
        message.setFrom(from);
        
        message.setSubject(subject);
        message.setText(body);
        
        if (sendAsIndividual > 0) {
            for (final String recipient : recipients) {
                try {
                    message.setTo(recipient);
                    mailSender.send(message);
                } catch (final ExceptionBase originalException) {
                    this.log.error("Couldn't send email to " + recipient);
                    numberOfFailed++;
                }
            } // end for
        } else {
            try {
                message.setTo(from);
                message.setBcc(recipients);
                mailSender.send(message);
            } catch (final ExceptionBase originalException) {
                this.log.error("Couldn't send emails");
                numberOfFailed = recipients.size();
            }
        }
        
        return numberOfFailed;
    }
    
    /**
     * Update the emergency team contacts.
     *
     * Insert new emergency contact from related tables.
     *
     * When the source data is updated, the status of the contacts and the team archive fields
     * should be updated.
     */
    @SuppressWarnings({ "PMD.AvoidUsingSql" })
    public void updateEmergencyContacts() {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // add new contacts to the team.
        final String updateContactsSql =
                "INSERT INTO team "
                        + " (address_archive,bl_id,cell_num_archive,company_archive,contact_id,contact_type_archive,email_archive,fax_archive,name_archive, "
                        + "notes,phone_archive,pr_id,source_table,status,team_type) " + " SELECT "
                        + formatSqlIsNull(context, "RTRIM(address1),'' ")
                        + formatSqlConcat(context)
                        + " ' ' "
                        + formatSqlConcat(context)
                        + formatSqlIsNull(context, "RTRIM(address2),'' ")
                        + formatSqlConcat(context)
                        + " ', ' "
                        + formatSqlConcat(context)
                        + formatSqlIsNull(context, "RTRIM(city_id),'' ")
                        + formatSqlConcat(context)
                        + " ', ' "
                        + formatSqlConcat(context)
                        + formatSqlIsNull(context, "RTRIM(state_id),'' ")
                        + formatSqlConcat(context)
                        + "' '"
                        + formatSqlConcat(context)
                        + formatSqlIsNull(context, "RTRIM(zip),'' ")
                        + formatSqlConcat(context)
                        + " ' ' "
                        + formatSqlConcat(context)
                        + formatSqlIsNull(context, "RTRIM(ctry_id),'' ")
                        + ",bl_id, cellular_number, company, contact_id, contact_type, email, fax,"
                        + formatSqlIsNull(context, "RTRIM(name_last),'' ")
                        + formatSqlConcat(context)
                        + "', '"
                        + formatSqlConcat(context)
                        + formatSqlIsNull(context, "RTRIM(name_first),'' ")
                        + ",notes, phone, pr_id, 'contact', 'Active', 'Emergency'"
                        + " FROM contact"
                        + " WHERE contact_type IN ('FIRE AND SAFETY','OWNER','LANDLORD','BLDG SUPER','HAZMAT')"
                        + " AND contact.contact_id NOT IN (SELECT contact_id FROM team)";
        
        SqlUtils.executeUpdate("team", updateContactsSql);
        
        // when a related record is removed, the default cascading sets the corresponding field
        // value to NULL, so we can cleanup these invalid records
        final String removeContactsSql =
                "UPDATE team SET status='Removed' "
                        + "  WHERE (team.source_table='contact' AND team.contact_id IS NULL) "
                        + "     OR (team.source_table='em' AND team.em_id IS NULL) "
                        + "     OR (team.source_table='vn' AND team.vn_id IS NULL) ";
        
        SqlUtils.executeUpdate("team", removeContactsSql);
        
        if (SqlUtils.isOracle()) {
            final String updateFromContacts =
                    "UPDATE team SET "
                            + "  (address_archive, cell_num_archive, company_archive, contact_type_archive, email_archive, fax_archive, name_archive, phone_archive) = "
                            + "   (select NVL(RTRIM(ct.address1),'' )|| ' ' ||NVL(RTRIM(ct.address2),'' )||', '||NVL(RTRIM(ct.city_id),'' )||', '||NVL(RTRIM(ct.state_id),'' )|| ' ' ||NVL(RTRIM(ct.zip),'' )||' '||NVL(RTRIM(ct.ctry_id),'' ) ,"
                            + "       ct.cellular_number,  "
                            + "       ct.company,"
                            + "       ct.contact_type,"
                            + "       ct.email,"
                            + "       ct.fax, "
                            + "       NVL(RTRIM(ct.name_last),'' )|| ', ' ||NVL(RTRIM(ct.name_first),'' ),"
                            + "       ct.phone "
                            + "  from contact ct where ct.contact_id = team.contact_id)"
                            + " WHERE team.source_table  = 'contact' "
                            + " AND team.status<>'Removed' ";
            
            SqlUtils.executeUpdate("team", updateFromContacts);

            final String updateFromEmployees =
                    "UPDATE team SET  "
                            + "  (address_archive, cell_num_archive, contact_type_archive, email_archive, fax_archive, name_archive, phone_archive) = "
                            + " (select NVL(RTRIM(em.bl_id),'' )|| '-' ||NVL(RTRIM(em.fl_id),'' )|| '-' ||NVL(RTRIM(em.rm_id),'' ),"
                            + "  em.cellular_number,"
                            + "  em.em_std,"
                            + "  em.email,"
                            + "  em.fax,"
                            + "  NVL(RTRIM(em.name_last),'' )|| ', ' ||NVL(RTRIM(em.name_first),'' ),"
                            + "  em.phone " + " from em where em.em_id = team.em_id)"
                            + " WHERE team.source_table  = 'em' "
                            + " AND team.status<>'Removed' ";
            
            SqlUtils.executeUpdate("team", updateFromEmployees);

            final String updateFromVendors =
                    "UPDATE team SET "
                            + "(address_archive, company_archive, contact_type_archive, email_archive, fax_archive, name_archive, phone_archive, status) = "
                            + " (select  NVL(RTRIM(vn.address1),'' )|| ' ' ||NVL(RTRIM(vn.address2),'' )|| ', ' ||NVL(RTRIM(vn.city),'' )|| ', ' ||NVL(RTRIM(vn.state),'' )|| ' ' ||NVL(RTRIM(vn.postal_code),'' )|| ' '  ||NVL(RTRIM(vn.country),'' ) ,"
                            + " vn.company, "
                            + " vn.vendor_type,"
                            + " vn.email,"
                            + " vn.fax,"
                            + " vn.contact,"
                            + " vn.phone, "
                            + " (CASE WHEN vn.is_active=0  THEN 'Inactive' ELSE team.status END)   "
                            + " from vn where vn.vn_id = team.vn_id)"
                            + " WHERE team.source_table  = 'vn' "
                            + " AND team.status<>'Removed' ";

            SqlUtils.executeUpdate("team", updateFromVendors);
            
        } else {

            // update existing contacts in the team
            final String updateContactDetailsSql =
                    "UPDATE team SET team.address_archive = (CASE team.source_table"
                            + "  WHEN 'contact' THEN "
                            + formatSqlIsNull(context, "RTRIM(ct.address1),'' ")
                            + formatSqlConcat(context)
                            + " ' ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(ct.address2),'' ")
                            + formatSqlConcat(context)
                            + "', '"
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(ct.city_id),'' ")
                            + formatSqlConcat(context)
                            + "', '"
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(ct.state_id),'' ")
                            + formatSqlConcat(context)
                            + " ' ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(ct.zip),'' ")
                            + formatSqlConcat(context)
                            + "' '"
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(ct.ctry_id),'' ")

                            + "  WHEN 'em' THEN "
                            + formatSqlIsNull(context, "RTRIM(em.bl_id),'' ")
                            + formatSqlConcat(context)
                            + " '-' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(em.fl_id),'' ")
                            + formatSqlConcat(context)
                            + " '-' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(em.rm_id),'' ")

                            + "  WHEN 'vn' THEN "
                            + formatSqlIsNull(context, "RTRIM(vn.address1),'' ")
                            + formatSqlConcat(context)
                            + " ' ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(vn.address2),'' ")
                            + formatSqlConcat(context)
                            + " ', ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(vn.city),'' ")
                            + formatSqlConcat(context)
                            + " ', ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(vn.state),'' ")
                            + formatSqlConcat(context)
                            + " ' ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(vn.postal_code),'' ")
                            + formatSqlConcat(context)
                            + " ' '  "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(vn.country),'' ")

                            + "     END)"

                            + ",team.cell_num_archive = (CASE team.source_table"
                            + "  WHEN 'contact' THEN ct.cellular_number "
                            + "  WHEN 'em' THEN em.cellular_number"
                            + "     END)"

                            + ",team.company_archive = (CASE team.source_table"
                            + "   WHEN 'contact' THEN ct.company "
                            + "  WHEN 'vn' THEN vn.company"
                            + "     END)"
                            + ",team.contact_type_archive = (CASE team.source_table"
                            + "   WHEN 'contact' THEN ct.contact_type "
                            + "   WHEN 'vn' THEN vn.vendor_type"
                            + "   WHEN 'em' THEN em.em_std"
                            + "     END)"

                            + ",team.email_archive = (CASE team.source_table"
                            + "  WHEN 'contact' THEN ct.email "
                            + "  WHEN 'em' THEN em.email"
                            + "  WHEN 'vn' THEN vn.email"
                            + "     END)"

                            + " ,team.fax_archive = (CASE team.source_table"
                            + "   WHEN 'contact' THEN ct.fax "
                            + "    WHEN 'em' THEN em.fax"
                            + "   WHEN 'vn' THEN vn.fax"
                            + "      END)"

                            + ",team.name_archive = (CASE team.source_table"
                            + "  WHEN 'contact' THEN "
                            + formatSqlIsNull(context, "RTRIM(ct.name_last),'' ")
                            + formatSqlConcat(context)
                            + " ', ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(ct.name_first),'' ")
                            + "  WHEN 'em' THEN "
                            + formatSqlIsNull(context, "RTRIM(em.name_last),'' ")
                            + formatSqlConcat(context)
                            + " ', ' "
                            + formatSqlConcat(context)
                            + formatSqlIsNull(context, "RTRIM(em.name_first),'' ")
                            + "  WHEN 'vn' THEN vn.contact"
                            + "     END)"

                            + "  ,team.phone_archive = (CASE team.source_table"
                            + "   WHEN 'contact' THEN ct.phone "
                            + "   WHEN 'em' THEN em.phone"
                            + "   WHEN 'vn' THEN vn.phone"
                            + "      END)"
                            
                            + ",team.status = (CASE WHEN team.source_table='vn' AND vn.is_active=0  THEN 'Inactive' ELSE team.status END)"
                            + "  FROM team "
                            + "  LEFT JOIN contact as ct ON team.contact_id=ct.contact_id"
                            + "  LEFT JOIN vn ON team.vn_id=vn.vn_id"
                            + "  LEFT JOIN em ON team.em_id=em.em_id"
                            + "  WHERE team.status<>'Removed'";
            SqlUtils.executeUpdate("team", updateContactDetailsSql);
        }

    }
    
    /**
     * Update equipment's recovery status.
     *
     * @param jsonArrayObjects JSONArray contains DataRecord Object
     * @param recoveryStatus
     * @param tableName
     * @param fieldName
     * @param targetFieldName
     */
    
    public void updateEquipmentRecoveryStatus(final JSONArray jsonArrayObjects,
            final String recoveryStatus) {
        
        this.updateRecoveryStatus(jsonArrayObjects, recoveryStatus, "eq", "recovery_status");
    }
    
    /**
     * Update room's recovery status.
     *
     * @param jsonArrayObjects JSONArray contains DataRecord Object
     * @param recoveryStatus
     * @param tableName
     * @param fieldName
     * @param targetFieldName
     */
    
    public void updateRoomRecoveryStatus(final JSONArray jsonArrayObjects,
            final String recoveryStatus) {
        
        this.updateRecoveryStatus(jsonArrayObjects, recoveryStatus, "rm", "recovery_status");
    }
    
    /**
     * It used for updating recovery status of room and equipment.
     *
     * the method name should be refactored for more generic later!.
     *
     * for example: updateOneField.
     *
     * @param jsonArrayObjects
     * @param recoveryStatus
     * @param tableName
     * @param fieldName
     * @param targetFieldName
     */
    
    private void updateRecoveryStatus(final JSONArray jsonArrayObjects,
            final String recoveryStatus, final String tableName, final String targetFieldName) {
        
        if (jsonArrayObjects.length() > 0) {
            final DataSource updateDs =
                    DataRecord.createDataSourceForRecord(jsonArrayObjects.getJSONObject(0));
            final List<DataRecord> dataRecords = DataRecord.createRecordsFromJSON(jsonArrayObjects);
            
            for (final DataRecord dataRecord : dataRecords) {
                dataRecord.setValue(tableName + "." + targetFieldName, recoveryStatus);
                updateDs.updateRecord(dataRecord);
            }
            updateDs.commit();
        }
    }
    
    /**
     * This WFR method replaced previous database trigger fired when updating the
     * system_bl.recovery_status
     */
    /*
     * ALTER TRIGGER "system_status_t".system_status_t after update of recovery_status order 1 on
     * AFM.system_bl referencing new as newsystem for each row begin declare v_new_recovery_status
     * char(12);if newsystem.recovery_status = 'UNFIT-TEMP' or newsystem.recovery_status =
     * 'UNFIT-PERM' then set v_new_recovery_status='FIT-OFFLINE' else set
     * v_new_recovery_status=newsystem.recovery_status end if; update system_bl set
     * system_bl.recovery_status = v_new_recovery_status where system_bl.system_id = any(select
     * system_id_depend from system_dep where system_dep.system_id_master = newsystem.system_id and
     * system_dep.propagate_status = 1) and system_bl.recovery_status not
     * in('UNFIT-TEMP','UNFIT-PERM',v_new_recovery_status) end
     */
    public void updateSystemStatus(final JSONObject record) {
        if (record == null || !record.has("values")) {
            return;
        }
        
        // Firstly remove the associated trigger 'system_status_t' if it exists
        String sSystemTable = "", sTrigNameField = "";
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // according to different database, set proper name of system table and trigger field
        if (isOracle(context)) {
            sSystemTable = "USER_TRIGGERS";
            sTrigNameField = "trigger_name";
        } else if (isSybase(context)) {
            sSystemTable = "SYSTRIGGER";
            sTrigNameField = "trigger_name";
        } else if (isSqlServer(context)) {
            sSystemTable = "SYSOBJECTS";
            sTrigNameField = "name";
        }
        // for SYBASE and SQLSERVER, determine if trigger exists then delete it
        if (isSybase(context) || isSqlServer(context)) {
            final String selTriggerSql =
                    " SELECT " + sTrigNameField + " FROM " + sSystemTable + " WHERE "
                            + sTrigNameField + " ='system_status_t' ";
            final List tList = selectDbRecords(context, selTriggerSql);
            if (tList != null && tList.size() > 0) {
                executeDbSql(context, "DROP TRIGGER system_status_t", false);
                executeDbCommit(context);
            }
        }
        
        // Secondly save the system_bl record
        final DataSource systemBlDS =
                DataSourceFactory.createDataSourceForFields("system_bl", new String[] {
                        "system_id", "recovery_status", "bl_id", "description", "system_type",
                "comments" });
        
        final JSONObject values = record.getJSONObject("values");
        final JSONObject oldValues = record.getJSONObject("oldValues");
        final boolean isNew = record.getBoolean("isNew");
        DataRecord systemBlRec = null;
        if (isNew) {// if record is new created on client then create a new data-record

            systemBlRec = systemBlDS.createNewRecord();
            systemBlRec.fromJSON(values);// set values from transfered record object's values
            systemBlDS.saveRecord(systemBlRec);
            
        } else { // else query the data-record

            systemBlRec =
                    systemBlDS.getRecord(" system_bl.system_id='"
                            + oldValues.getString("system_bl.system_id") + "'");
            systemBlRec.fromJSON(values);
            systemBlDS.saveRecord(systemBlRec);
            
        }
        systemBlDS.commit();
        
        // Finally according to business logic of previous trigger, update the status of all system
        // depend on current one.
        final DataSource systemDepDS =
                DataSourceFactory.createDataSourceForFields("system_dep", new String[] {
                        "system_id_master", "propagate_status", "system_id_depend" });
        
        updateDepencySystemStatus(systemDepDS, systemBlRec.getString("system_bl.system_id"),
            systemBlDS, systemBlRec.getString("system_bl.recovery_status"));
        
        return;
        
    }
    
    /*
     * For given master system id: 1. get all system depend on it 2. for each system got in first
     * step, update system status and call updateDepencySystemStatus() again
     */
    private void updateDepencySystemStatus(final DataSource systemDepDS,
            final String masterSystemId, final DataSource systemBlDS, final String parentStatus) {
        final List<DataRecord> depList =
                systemDepDS.getRecords("propagate_status=1 AND system_dep.system_id_master='"
                        + masterSystemId + "' ");
        for (final DataRecord systemDep : depList) {
            final String depSystemId = systemDep.getString("system_dep.system_id_depend");
            final DataRecord systemRec =
                    systemBlDS.getRecord(" system_bl.system_id='" + depSystemId + "'");
            if (systemRec == null) {
                continue;
            }
            systemRec.getString("system_bl.recovery_status");
            String newStatus = null;
            if ("UNFIT-TEMP".equals(parentStatus) || "UNFIT-PERM".equals(parentStatus)) {
                newStatus = "FIT-OFFLINE";
            } else {
                newStatus = parentStatus;
            }
            systemRec.setValue("system_bl.recovery_status", newStatus);
            systemBlDS.saveRecord(systemRec);
            
            systemBlDS.commit();
            updateDepencySystemStatus(systemDepDS, depSystemId, systemBlDS, newStatus);
        }
    }
}

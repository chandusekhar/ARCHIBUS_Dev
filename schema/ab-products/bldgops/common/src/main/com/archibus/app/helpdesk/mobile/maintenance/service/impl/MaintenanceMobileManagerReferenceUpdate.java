package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Provides supporting methods related to synchronizing the data in the doc_assign tables. Supports
 * the MaintenanceMobileService class.
 *
 * @author Guoqiang Jia
 * @since 21.3
 *
 */

@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileManagerReferenceUpdate {
    /**
     * Define document field names.
     */
    public static final String[] DOCUMENT_FIELD_NAMES = { DOC };

    /**
     * Constructor.
     */
    private MaintenanceMobileManagerReferenceUpdate() {

    }

    /**
     * Inserts Incident documents into the Incidents document sync table.
     *
     * @param userName User Name
     */
    static void insertReferenceSyncRecords(final String userName) {

        final String insertFields =
                "mob_doc_id,doc,name,description,date_doc,doc_author,eq_std,prob_type,pmp_id,activity_type,url,"
                        + LAST_MODIFIED + SQL_COMMA + DELETED + SQL_COMMA + MOB_LOCKED_BY
                        + SQL_COMMA + MOB_IS_CHANGED;

        final String selectFields =
                "doc_id,docs_assigned.doc,docs_assigned.name,docs_assigned.description,docs_assigned.date_doc,"
                        + "docs_assigned.doc_author,docs_assigned.eq_std,docs_assigned.prob_type,docs_assigned.pmp_id,"
                        + "docs_assigned.activity_type,docs_assigned.url,"
                        + System.currentTimeMillis() + ",0," + SqlUtils.formatValueForSql(userName)
                        + ",0";

        final String sql = "INSERT INTO " + INCIDENT_DOCUMENTS_SYNC_TABLE + START_PARENTHESIS
                + insertFields + ") SELECT distinct " + selectFields + SQL_FROM
                + INCIDENT_DOCUMENTS_TABLE + " JOIN " + START_PARENTHESIS
                + " SELECT wr.wr_id,wr.pmp_id,wr.prob_type,wr.eq_id,eqstd.eq_std " + "FROM wr "
                + "LEFT OUTER JOIN eq ON wr.eq_id=eq.eq_id "
                + "LEFT OUTER JOIN eqstd ON eq.eq_std=eqstd.eq_std "
                + "WHERE EXISTS(SELECT 1 FROM wr_sync WHERE wr.wr_id=wr_sync.wr_id AND wr_sync.deleted=0 AND wr_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName) + END_PARENTHESIS + ") req" + " ON ( "
                + "(docs_assigned.eq_std=req.eq_std AND docs_assigned.prob_type IS NULL AND docs_assigned.pmp_id IS NULL)"
                + SQL_OR
                + "(docs_assigned.prob_type = req.prob_type AND docs_assigned.prob_type <> 'PREVENTIVE MAINT' AND docs_assigned.eq_std IS NULL AND docs_assigned.pmp_id IS NULL)"
                + SQL_OR
                + "(docs_assigned.prob_type = req.prob_type AND docs_assigned.prob_type <> 'PREVENTIVE MAINT' AND docs_assigned.eq_std = req.eq_std AND docs_assigned.pmp_id IS NULL)"
                + SQL_OR
                + "(docs_assigned.prob_type = 'PREVENTIVE MAINT' AND docs_assigned.pmp_id = req.pmp_id AND docs_assigned.eq_std IS NULL)"
                + SQL_OR
                + "(docs_assigned.prob_type = 'PREVENTIVE MAINT' AND docs_assigned.pmp_id = req.pmp_id AND docs_assigned.eq_std = req.eq_std)"
                + END_PARENTHESIS
                + " AND docs_assigned.activity_type = 'SERVICE DESK - MAINTENANCE'"
                + " AND NOT EXISTS(SELECT 1 FROM docs_assigned_sync WHERE docs_assigned_sync.mob_doc_id=docs_assigned.doc_id and docs_assigned_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName) + ")";

        SqlUtils.executeUpdate(INCIDENT_DOCUMENTS_SYNC_TABLE, sql);

        // Copy documents to the sync table
        copyReferenceDocuments(userName);

    }

    /**
     * Copies documents references from the docs_assigned table to the docs_assigned_sync table.
     * <p>
     * Copies only documents for the
     *
     * @param userName of the logged in user;
     */
    static void copyReferenceDocuments(final String userName) {
        final String[] docFields = { DOC };
        final String[] fields = { AUTO_NUMBER, MOB_DOC_ID, DOC, MOB_LOCKED_BY };
        final DataSource syncDataSource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_DOCUMENTS_SYNC_TABLE, fields);

        syncDataSource.setContext();
        syncDataSource.setMaxRecords(0);

        syncDataSource.addRestriction(
            Restrictions.eq(INCIDENT_DOCUMENTS_SYNC_TABLE, MOB_LOCKED_BY, userName));
        syncDataSource.addRestriction(Restrictions.isNotNull(INCIDENT_DOCUMENTS_SYNC_TABLE, DOC));

        final DataSource datasource = DataSourceFactory
            .createDataSourceForFields(INCIDENT_DOCUMENTS_TABLE, INCIDENT_DOCUMENTS_FIELDS);

        final List<DataRecord> syncRecords = syncDataSource.getRecords();
        for (final DataRecord record : syncRecords) {
            final int mobDocId =
                    record.getInt(INCIDENT_DOCUMENTS_SYNC_TABLE + SQL_DOT + MOB_DOC_ID);
            // Get the source record
            datasource.addRestriction(Restrictions.eq(INCIDENT_DOCUMENTS_TABLE, DOC_ID, mobDocId));
            final DataRecord sourceRecord = datasource.getRecord();
            if (sourceRecord != null) {
                DocumentsUtilities.copyDocuments(docFields, sourceRecord, record);
            }
        }

    }
}

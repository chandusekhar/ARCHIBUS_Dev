package com.archibus.eventhandler.rplm;

import java.io.IOException;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;

/**
 * Create Lease From Lease Template The WFR will create new "lease" record , and then creates new
 * associated records . The new "lease" record will have the same values as the "lease template”
 * except the fields : ls_id (pkey – auto incremented ) and USE_AS_TEMPLATE (will have the 0 value)
 * The associated records will be similar with the associated records of the selected
 * "lease template". The associated records with a lease are in the following tables :
 * docs_assigned, contact, cost_tran_recur, ls_resp, op, ls_amendment. Create Lease Template From
 * Lease Similar with the other scenario, except the fact that USE_AS_TEMPLATE will be 1.
 * 
 * draghici 08/27/2010 : add method to copy documents using document service
 * 
 * @author MARIUS
 */

public class LeaseAdministrationService extends EventHandlerBase {
    
    /**
     * Create new lease using as a reference a lease that already exists.
     * 
     * @param newLsId - the 'ls_id' value for the new 'ls' table record
     * @param selectedLsId - reference lease
     * @param isTemplate - specify if reference lease is a lease template or a regular lease
     * @param itemType - building/property
     * @param itemValue - value for building/property
     * @param landlord_tenant - landlord/tenant
     * @param lsParentId - ls_parent_id value
     * @param lease_sublease - LEASE/SUBLEASE
     */
    
    public void duplicateLease(final String newLsId, final String selectedLsId,
            final String isTemplate, final String itemType, final String itemValue,
            final String landlord_tenant, final String lsParentId, final String lease_sublease) {
        
        String prValue = null;
        String blValue = null;
        
        if (itemType.equalsIgnoreCase("building")) {
            blValue = SqlUtils.formatValueForSql(itemValue);
            prValue = " PR_ID";
        } else if (itemType.equalsIgnoreCase("property")) {
            blValue = " BL_ID ";
            prValue = SqlUtils.formatValueForSql(itemValue);
        } else {
            blValue = " BL_ID ";
            prValue = " PR_ID";
        }
        
        // insert new lease
        
        final StringBuilder sqlNewLease = new StringBuilder();
        
        sqlNewLease
            .append("insert into ls (AC_ID , USE_AS_TEMPLATE , AMOUNT_OPERATING , AMOUNT_OTHER , AMOUNT_PCT_RENT,AMOUNT_SECURITY,AMOUNT_TAXES,AMOUNT_TOT_RENT_EXP,AMOUNT_TOT_RENT_INC,AREA_COMMON,AREA_NEGOTIATED,AREA_RENTABLE,AREA_USABLE,AUTOMATIC_RENEWAL,BL_ID,COMMENTS,DATE_COST_ANAL_END,DATE_COST_ANAL_START, DATE_COSTS_LAST_CALCD,DATE_END,DATE_MOVE,DATE_START,DESCRIPTION,DOC,FLOORS,HPATTERN,HPATTERN_ACAD,IMAGE_DOC1,IMAGE_DOC2,IMAGE_DOC3,LANDLORD_TENANT,LD_CONTACT,LD_NAME,LEASE_SUBLEASE,LEASE_TYPE, AMOUNT_BASE_RENT,LS_PARENT_ID,OPTION1,OPTION2,OWNED,PR_ID,QTY_OCCUPANCY,QTY_SUITE_OCCUPANCY,SIGNED,SPACE_USE,TEMPLATE_NAME,TN_CONTACT,TN_NAME,VAT_EXCLUDE,COST_INDEX, LS_ID) (select  AC_ID , ");
        
        sqlNewLease.append(isTemplate);
        sqlNewLease
            .append(" ,AMOUNT_OPERATING,AMOUNT_OTHER, AMOUNT_PCT_RENT, AMOUNT_SECURITY, AMOUNT_TAXES,AMOUNT_TOT_RENT_EXP, AMOUNT_TOT_RENT_INC, AREA_COMMON, AREA_NEGOTIATED,AREA_RENTABLE, AREA_USABLE,AUTOMATIC_RENEWAL,"
                    + blValue
                    + ",COMMENTS, DATE_COST_ANAL_END, DATE_COST_ANAL_START, DATE_COSTS_LAST_CALCD, DATE_END,DATE_MOVE,DATE_START, DESCRIPTION,DOC,FLOORS,HPATTERN, HPATTERN_ACAD,IMAGE_DOC1,IMAGE_DOC2,IMAGE_DOC3,"
                    + (("LANDLORD_TENANT").equalsIgnoreCase(landlord_tenant) ? "LANDLORD_TENANT"
                            : SqlUtils.formatValueForSql(landlord_tenant))
                    + ",LD_CONTACT,LD_NAME,"
                    + (("ls.lease_sublease").equalsIgnoreCase(lease_sublease) ? "ls.lease_sublease"
                            : SqlUtils.formatValueForSql(lease_sublease))
                    + ",LEASE_TYPE,AMOUNT_BASE_RENT, "
                    + (("ls.ls_parent_id").equalsIgnoreCase(lsParentId) ? "ls.ls_parent_id"
                            : SqlUtils.formatValueForSql(lsParentId))
                    + ", OPTION1,OPTION2,OWNED,"
                    + prValue
                    + ",QTY_OCCUPANCY, QTY_SUITE_OCCUPANCY,SIGNED,SPACE_USE,TEMPLATE_NAME,TN_CONTACT, TN_NAME, VAT_EXCLUDE, COST_INDEX, ");
        sqlNewLease.append(SqlUtils.formatValueForSql(newLsId));
        sqlNewLease.append(" from ls where ls.ls_id = ");
        sqlNewLease.append(SqlUtils.formatValueForSql(selectedLsId));
        sqlNewLease.append(")");
        
        SqlUtils.executeUpdate("ls", sqlNewLease.toString());
        
        // draghici 08/27/2010 : copy documents docs_assigned
//BRG??        copyDocuments(selectedLsId, newLsId);
        
        // insert into contact
/* BRG Removed
        final StringBuilder sqlContact = new StringBuilder();
        sqlContact
            .append("insert into contact (ADDRESS1,ZIP,BL_ID,CELLULAR_NUMBER,CITY_ID,COMPANY,ADDRESS2,CONTACT_PHOTO,CONTACT_TYPE,COUNTY_ID,CTRY_ID,EMAIL,FAX,HONORIFIC,IMAGE_FILE,LS_ID,NAME_FIRST,NAME_LAST, NOTES, OPTION1,OPTION2,PAGER,PHONE, PIN,PR_ID,REGN_ID,STATE_ID,STATUS,TAX_AUTH_TYPE,CONTACT_ID)");
        sqlContact
            .append("(select ADDRESS1,ZIP,BL_ID,CELLULAR_NUMBER,CITY_ID,COMPANY,ADDRESS2,CONTACT_PHOTO,CONTACT_TYPE,COUNTY_ID,CTRY_ID,EMAIL,FAX,HONORIFIC,IMAGE_FILE, ");
        sqlContact.append(SqlUtils.formatValueForSql(newLsId));
        
        /**
         * Catalin Purice KB 3031314
        String contactId = "CONTACT_ID";
        if (SqlUtils.isSqlServer()) {
            contactId = "LTRIM(RTRIM(CONTACT_ID))";
        }
        /**
         * KB 3031314
        sqlContact
            .append("  ,NAME_FIRST,NAME_LAST,NOTES,OPTION1,OPTION2,PAGER,PHONE,PIN,PR_ID,REGN_ID,STATE_ID,STATUS,TAX_AUTH_TYPE,"
                    + contactId
                    + "${sql.concat}'-'${sql.concat}'"
                    + newLsId
                    + "'  from contact where contact.ls_id = ");
        sqlContact.append(SqlUtils.formatValueForSql(selectedLsId));
        sqlContact.append(")");
        SqlUtils.executeUpdate("contact", sqlContact.toString());
        
        // insert into cost_tran_recur
        
        final String mcAndVatCostField =
                "AMOUNT_EXPENSE_BASE_BUDGET, AMOUNT_EXPENSE_BASE_PAYMENT, AMOUNT_EXPENSE_TOTAL_PAYMENT, AMOUNT_EXPENSE_VAT_BUDGET, AMOUNT_EXPENSE_VAT_PAYMENT, AMOUNT_INCOME_BASE_BUDGET, AMOUNT_INCOME_BASE_PAYMENT, AMOUNT_INCOME_TOTAL_PAYMENT, AMOUNT_INCOME_VAT_BUDGET, CTRY_ID, AMOUNT_INCOME_VAT_PAYMENT, CURRENCY_BUDGET, CURRENCY_PAYMENT, DATE_USED_FOR_MC_BUDGET, DATE_USED_FOR_MC_PAYMENT, EXCHANGE_RATE_BUDGET, EXCHANGE_RATE_OVERRIDE, EXCHANGE_RATE_PAYMENT, VAT_AMOUNT_OVERRIDE, VAT_PERCENT_OVERRIDE, VAT_PERCENT_VALUE";
        final StringBuilder sqlCostTranRec = new StringBuilder();
        if (SqlUtils.isOracle()) {
            sqlCostTranRec
                .append("insert into cost_tran_recur (AC_ID,YEARLY_FACTOR,AMOUNT_INCOME,BL_ID,COST_CAT_ID,AMOUNT_EXPENSE,DATE_END,DATE_SEASONAL_END,DATE_SEASONAL_START,DATE_START,DATE_TRANS_CREATED,DESCRIPTION,DP_ID,DV_ID,LS_ID,OPTION1,OPTION2,PA_NAME,PARCEL_ID, PERIOD,PERIOD_CUSTOM,PR_ID,STATUS_ACTIVE,"
                        + mcAndVatCostField + ", COST_TRAN_RECUR_ID) ");
        } else {
            sqlCostTranRec
                .append("insert into cost_tran_recur (AC_ID,YEARLY_FACTOR,AMOUNT_INCOME,BL_ID,COST_CAT_ID,AMOUNT_EXPENSE,DATE_END,DATE_SEASONAL_END,DATE_SEASONAL_START,DATE_START,DATE_TRANS_CREATED,DESCRIPTION,DP_ID,DV_ID,LS_ID,OPTION1,OPTION2,PA_NAME,PARCEL_ID, PERIOD,PERIOD_CUSTOM,PR_ID,STATUS_ACTIVE,"
                        + mcAndVatCostField + ") ");
        }
        sqlCostTranRec
            .append("(select AC_ID,YEARLY_FACTOR,AMOUNT_INCOME,BL_ID,COST_CAT_ID,AMOUNT_EXPENSE,DATE_END,DATE_SEASONAL_END,DATE_SEASONAL_START,DATE_START,DATE_TRANS_CREATED,DESCRIPTION,DP_ID,DV_ID,'");
        sqlCostTranRec.append(newLsId);
        if (SqlUtils.isOracle()) {
            sqlCostTranRec
                .append("' , OPTION1,OPTION2,PA_NAME,PARCEL_ID, PERIOD,PERIOD_CUSTOM,PR_ID,STATUS_ACTIVE, "
                        + mcAndVatCostField
                        + ", (AFM_COST_TRAN_RECUR_S.NEXTVAL) from cost_tran_recur where cost_tran_recur.ls_id = '");
        } else {
            sqlCostTranRec
                .append("' , OPTION1,OPTION2,PA_NAME,PARCEL_ID, PERIOD,PERIOD_CUSTOM,PR_ID,STATUS_ACTIVE, "
                        + mcAndVatCostField
                        + " from cost_tran_recur where cost_tran_recur.ls_id = '");
        }
        sqlCostTranRec.append(selectedLsId);
        sqlCostTranRec.append("')");
        
        SqlUtils.executeUpdate("cost_tran_recur", sqlCostTranRec.toString());
        
*/
        // insert into ls_resp
        
        final StringBuilder sqlClauses = new StringBuilder();
        sqlClauses
            .append("insert into ls_resp (LS_ID,RESP_ID,CLAUSE_TYPE_ID,CONTACT_ID,DATE_END,DATE_START,DATES_MATCH_LEASE,RESP_TYPE,DOC,DESCRIPTION,RESP_PARTY,REFERENCE_LOC) (select '");
        sqlClauses.append(newLsId);
        sqlClauses
            .append("' , RESP_ID,CLAUSE_TYPE_ID,CONTACT_ID,DATE_END,DATE_START,DATES_MATCH_LEASE,RESP_TYPE,DOC,DESCRIPTION,RESP_PARTY,REFERENCE_LOC from ls_resp where ls_resp.ls_id = '");
        sqlClauses.append(selectedLsId);
        sqlClauses.append("')");
        
        SqlUtils.executeUpdate("ls_resp", sqlClauses.toString());
        
        // insert into op
        
        final StringBuilder sqlOptions = new StringBuilder();
        sqlOptions
            .append("insert into op (LS_ID,OP_ID,AREA,WHO_CAN_EXERCISE,COST_EST,DATE_EXERCISED,DATE_EXERCISING_APPLICABLE,DATE_OPTION,DATE_OPTION_INTRODUCED,DATE_REVIEW,DATE_START,DATES_MATCH_LEASE,DESCRIPTION,DOC,EXERCISED_BY,IMAGE_DOC1,IMAGE_DOC2,COMMENTS,OP_TYPE) (select '");
        sqlOptions.append(newLsId);
        sqlOptions
            .append("' , OP_ID,AREA,WHO_CAN_EXERCISE,COST_EST,DATE_EXERCISED,DATE_EXERCISING_APPLICABLE,DATE_OPTION,DATE_OPTION_INTRODUCED,DATE_REVIEW,DATE_START,DATES_MATCH_LEASE,DESCRIPTION,DOC,EXERCISED_BY,IMAGE_DOC1,IMAGE_DOC2,COMMENTS,OP_TYPE from op where op.ls_id = '");
        sqlOptions.append(selectedLsId);
        sqlOptions.append("')");
        
        SqlUtils.executeUpdate("op", sqlOptions.toString());
        
        // insert into LS_AMENDMENT
/*BRG removed
        final StringBuilder sqlAmnd = new StringBuilder();
        if (SqlUtils.isOracle()) {
            sqlAmnd
                .append("insert into ls_amendment (LS_AMEND_ID,COMMENTS,DATE_EFFECTIVE,DATE_REQUESTED,LS_ID,DOC,EXERCISED_BY,DESCRIPTION) ");
            sqlAmnd
                .append("(select AFM_LS_AMENDMENT_S.NEXTVAL,COMMENTS,DATE_EFFECTIVE,DATE_REQUESTED, '");
        } else {
            sqlAmnd
                .append("insert into ls_amendment (COMMENTS,DATE_EFFECTIVE,DATE_REQUESTED,LS_ID,DOC,EXERCISED_BY,DESCRIPTION) ");
            sqlAmnd.append("(select COMMENTS,DATE_EFFECTIVE,DATE_REQUESTED, '");
        }
        sqlAmnd.append(newLsId);
        sqlAmnd
            .append("' , DOC,EXERCISED_BY,DESCRIPTION from ls_amendment where ls_amendment.ls_id = '");
        sqlAmnd.append(selectedLsId);
        sqlAmnd.append("')");
        
        SqlUtils.executeUpdate("ls_amendment", sqlAmnd.toString());
        
*/
    }
    
    /**
     * Split suite record.
     * 
     * @param suId suite code
     * @param flId floor code
     * @param blId building code
     */
    public void splitSuite(final String suId, final String flId, final String blId) {
        final String[] suFields =
                { "su_id", "name", "description", "facility_type_id", "area_manual", "fl_id",
                        "ls_id", "bl_id" };
        final String suTable = "su";
        final DataSource dsSuite = DataSourceFactory.createDataSourceForFields(suTable, suFields);
        
        // get new suite id based on existing records
        dsSuite.addRestriction(Restrictions.and(Restrictions.eq(suTable, "bl_id", blId),
            Restrictions.eq(suTable, "fl_id", flId)));
        dsSuite.addSort(suTable, "su_id", "DESC");
        final List<DataRecord> recSuites = dsSuite.getRecords();
        String suCode = "000";
        if (recSuites.isEmpty()) {
            suCode = "001";
        } else {
            String code = suCode;
            for (final DataRecord recSuite : recSuites) {
                String crtCode = recSuite.getString("su.su_id");
                crtCode = crtCode.replaceAll("\\D+", "");
                if (crtCode.length() == 0) {
                    crtCode = "000";
                }
                if (Integer.parseInt(crtCode) > Integer.valueOf(code)) {
                    code = crtCode;
                }
            }
            code = String.valueOf(Integer.parseInt(code) + 1);
            if (code.length() == 1) {
                code = "00" + code;
            } else if (code.length() == 2) {
                code = "0" + code;
            }
            suCode = code;
        }
        // split suite
        dsSuite.clearRestrictions();
        dsSuite.addRestriction(Restrictions.and(Restrictions.eq(suTable, "su_id", suId),
            Restrictions.eq(suTable, "fl_id", flId), Restrictions.eq(suTable, "bl_id", blId)));
        final DataRecord currentSuite = dsSuite.getRecord();
        final DataRecord newSuite = dsSuite.createNewRecord();
        // copy fields
        copyRecordValues(currentSuite, newSuite);
        final double areaManual = currentSuite.getDouble("su.area_manual");
        newSuite.setValue("su.su_id", suCode);
        newSuite.setValue("su.area_manual", areaManual / 2);
        currentSuite.setValue("su.area_manual", areaManual / 2);
        
        // save into database
        dsSuite.saveRecord(newSuite);
        dsSuite.updateRecord(currentSuite);
        
    }
    
    /**
     * copy documents assigned to source record to target record read all documents for source lease
     * create new records in docs_assigned table for target lease copy documents from source to
     * target
     * 
     * @param sourceLsId source lease
     * @param targetLsId target lease
     * @throws IOException
     */
    private void copyDocuments(final String sourceLsId, final String targetLsId) {
        // get documents for source asset
        
        final String docTable = "docs_assigned";
        final String docField = "doc";
        final String[] docFields =
                { "doc_id", "doc", "name", "description", "classification", "ls_id", "bl_id",
                        "pr_id" };
        
        final DataSource ds = DataSourceFactory.createDataSourceForFields(docTable, docFields);
        ds.addRestriction(Restrictions.eq("docs_assigned", "ls_id", sourceLsId));
        final List<DataRecord> records = ds.getRecords();
        
        // get document service object
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        // iterate records and copy documents
        for (final DataRecord srcRec : records) {
            // create destination record
            final DataRecord targetRec = ds.createNewRecord();
            targetRec.setValue("docs_assigned.name", srcRec.getValue("docs_assigned.name"));
            targetRec.setValue("docs_assigned.doc", srcRec.getValue("docs_assigned.doc"));
            targetRec.setValue("docs_assigned.description",
                srcRec.getValue("docs_assigned.description"));
            targetRec.setValue("docs_assigned.classification",
                srcRec.getValue("docs_assigned.classification"));
            targetRec.setValue("docs_assigned.bl_id", srcRec.getValue("docs_assigned.bl_id"));
            targetRec.setValue("docs_assigned.pr_id", srcRec.getValue("docs_assigned.pr_id"));
            targetRec.setValue("docs_assigned.ls_id", targetLsId);
            
            // save new record
            final DataRecord newRec = ds.saveRecord(targetRec);
            // document prop
            final String fileName = srcRec.getString("docs_assigned.doc");
            final String fileDescription = srcRec.getString("docs_assigned.description");
            final String srcDocId = String.valueOf(srcRec.getInt("docs_assigned.doc_id"));
            final String targetDocId = String.valueOf(newRec.getInt("docs_assigned.doc_id"));
            // source doc parameters
            final Map<String, String> srcKeys = new HashMap<String, String>();
            srcKeys.put("doc_id", srcDocId);
            final DocumentParameters srcDocParam =
                    new DocumentParameters(srcKeys, docTable, docField, null, true);
            // target document parameters
            final Map<String, String> targetKeys = new HashMap<String, String>();
            targetKeys.put("doc_id", targetDocId);
            final DocumentParameters targetDocParam =
                    new DocumentParameters(targetKeys, docTable, docField, fileName,
                        fileDescription, "0");
            // copy document
            documentService.copyDocument(srcDocParam, targetDocParam);
        }
    }
    
    public void onPaginatedReport(final JSONObject config) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String callerView = null;
        if (config.has("callerView")) {
            callerView = config.getString("callerView");
        }
        String dataSource = null;
        if (config.has("dataSource")) {
            dataSource = config.getString("dataSource");
        }
        // load dataSource from view
        final DataSource objDataSource =
                DataSourceFactory.loadDataSourceFromFile(callerView, dataSource);
        // create job
        final RepmPaginatedReport repmReportJob = new RepmPaginatedReport(objDataSource, config);
        // start job
        startJob(context, repmReportJob);
    }
    
    /**
     * Start paginated report job
     * 
     * @param context
     * @param job
     */
    private void startJob(final EventHandlerContext context, final Job job) {
        final JobManager.ThreadSafe jobManager = getJobManager(context);
        final String jobId = jobManager.startJob(job);
        
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Copy record values from source to target.
     * 
     * @param source source data record
     * @param target target data record
     */
    private void copyRecordValues(final DataRecord source, final DataRecord target) {
        for (final DataValue field : target.getFields()) {
            final String fieldName = field.getName();
            // do not copy auto number values
            if (!field.getFieldDef().isAutoNumber() && source.valueExists(fieldName)) {
                target.setValue(fieldName, source.getValue(fieldName));
            }
        }
    }
}

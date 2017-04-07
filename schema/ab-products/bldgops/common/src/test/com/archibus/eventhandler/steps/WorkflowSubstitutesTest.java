package com.archibus.eventhandler.steps;

import java.util.*;

import junit.framework.Assert;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.ibm.icu.util.Calendar;

/**
 * Test class for workflow substitutes.
 * 
 * @author Els Coen
 * @since 20.2
 * 
 */
public class WorkflowSubstitutesTest extends DataSourceTestBase {
    
    /**
     * Test user craftspersons code.
     */
    private static final String ABBY_SHARPS_CF_ID = "ABBY SHARPS";
    
    /**
     * Test user employee id.
     */
    private static final String ABERNATHY_ALISON_EM_ID = "ABERNATHY, ALISON";
    
    /**
     * acceptance step type.
     */
    private static final String ACCEPTANCE_STEP_TYPE = "acceptance";
    
    /**
     * Test user employee id.
     */
    private static final String ADAMS_CHRIS_EM_ID = "ADAMS, CHRIS";
    
    /**
     * Test user employee id.
     */
    private static final String AFM_EM_ID = "AFM";
    
    /**
     * Test user employee id.
     */
    private static final String ALLBURG_EM_ID = "ALLBURG";
    
    /**
     * Test user employee id.
     */
    private static final String APPLEBY_STEVE_EM_ID = "APPLEBY, STEVE";
    
    /**
     * approval step type.
     */
    private static final String APPROVAL_STEP_TYPE = "approval";
    
    /**
     * Test user employee id.
     */
    private static final String BABIC_PAUL_EM_ID = "BABIC, PAUL";
    
    /**
     * Test user employee id.
     */
    private static final String BARTLETT_JOAN_EM_ID = "BARTLETT, JOAN";
    
    /**
     * cf.cf_id field name.
     */
    private static final String CF_CF_ID_FIELD_NAME = "cf.cf_id";
    
    /**
     * field name.
     */
    private static final String CF_ID_FIELD_NAME = "cf_id";
    
    /**
     * table name.
     */
    private static final String CF_TABLE_NAME = "cf";
    
    /**
     * Em Id of current user while running unit tests.
     */
    private static final String CURRENT_USER_EM_ID = "AI";
    
    /**
     * Test user craftspersons code.
     */
    private static final String DAVID_VARRISON_CF_ID = "DAVID VARRISON";
    
    /**
     * dispatch step type.
     */
    private static final String DISPATCH_STEP_TYPE = "dispatch";
    
    /**
     * field name.
     */
    private static final String EM_EMAIL_FIELD_NAME = "em.email";
    
    /**
     * field name.
     */
    private static final String EM_ID_FIELD_NAME = "em_id";
    
    /**
     * table name.
     */
    private static final String EM_TABLE_NAME = "em";
    
    /**
     * email field name.
     */
    private static final String EMAIL_FIELD_NAME = "email";
    
    /**
     * estimation step type.
     */
    private static final String ESTIMATION_STEP_TYPE = "estimation";
    
    /**
     * Test user craftspersons code.
     */
    private static final String JOHN_YANDS_CF_ID = "JOHN YANDS";
    
    /**
     * manager role.
     */
    private static final String MANAGER_ROLE = "manager";
    
    /**
     * Test user craftspersons code.
     */
    private static final String MARGARETA_XANOVI_CF_ID = "MARGARETA XANOVI";
    
    /**
     * 15 days before.
     */
    private static final int MIN_FIFTHEEN_DAYS = -15;
    
    /**
     * 5 days before.
     */
    private static final int MIN_FIVE_DAYS = -5;
    
    /**
     * 10 days before.
     */
    private static final int MIN_TEN_DAYS = -10;
    
    /**
     * Test user craftspersons code.
     */
    private static final String RANDOLPH_WATERMA_CF_ID = "RANDOLPH WATERMA";
    
    /**
     * review step type.
     */
    private static final String REVIEW_STEP_TYPE = "review";
    
    /**
     * Test user craftspersons code.
     */
    private static final String REX_ULETON_CF_ID = "REX ULETON";
    
    /**
     * scheduling step type.
     */
    private static final String SCHEDULING_STEP_TYPE = "scheduling";
    
    /**
     * field name.
     */
    private static final String SUB_CF_ID_FIELD_NAME = "substitute_cf_id";
    
    /**
     * field name.
     */
    private static final String SUB_EM_ID_FIELD_NAME = "substitute_em_id";
    
    /**
     * survey step type.
     */
    private static final String SURVEY_STEP_TYPE = "survey";
    
    /**
     * 10 days later.
     */
    private static final int TEN_DAYS = 10;
    
    /**
     * 20 days later.
     */
    private static final int TWENTY_DAYS = 20;
    
    /**
     * field name.
     */
    private static final String WF_SUBS_CF_ID_FIELD_NAME = StepHandler.WF_SUBSTITUTES_TABLE
            + ".cf_id";
    
    /**
     * workflow_substitutes.em_id field name.
     */
    private static final String WF_SUBS_EM_ID_FIELD_NAME = StepHandler.WF_SUBSTITUTES_TABLE
            + ".em_id";
    
    /**
     * field name.
     */
    private static final String WF_SUBS_END_DATE_UNAVAILABLE_FIELD_NAME =
            StepHandler.WF_SUBSTITUTES_TABLE + ".end_date_unavailable";
    
    /**
     * field name.
     */
    private static final String WF_SUBS_START_DATE_UNAVAILABLE_FIELD_NAME =
            StepHandler.WF_SUBSTITUTES_TABLE + ".start_date_unavailable";
    
    /**
     * field name.
     */
    private static final String WF_SUBS_STEPTYPE_FIELD_NAME = StepHandler.WF_SUBSTITUTES_TABLE
            + ".steptype_or_role";
    
    /**
     * field name.
     */
    private static final String WF_SUBS_SUB_CF_ID_FIELD_NAME = StepHandler.WF_SUBSTITUTES_TABLE
            + ".substitute_cf_id";
    
    /**
     * workflow_substitutes.substitute_em_id field name.
     */
    private static final String WF_SUBS_SUB_EM_ID_FIELD_NAME = StepHandler.WF_SUBSTITUTES_TABLE
            + ".substitute_em_id";
    
    /**
     * Test user craftspersons code.
     */
    private static final String WILL_TRAM_CF_ID = "WILL TRAM";
    
    /**
     * Set up for a test case.
     * 
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        final DataSource wfSubDS =
                DataSourceFactory.createDataSourceForFields(StepHandler.WF_SUBSTITUTES_TABLE,
                    new String[] { EM_ID_FIELD_NAME, SUB_EM_ID_FIELD_NAME, CF_ID_FIELD_NAME,
                            SUB_CF_ID_FIELD_NAME, "steptype_or_role", "start_date_unavailable",
                            "end_date_unavailable" });
        
        // test record for em substitute without date restriction
        createSubstitutesEmRecord(wfSubDS, AFM_EM_ID, CURRENT_USER_EM_ID, APPROVAL_STEP_TYPE, null,
            null);
        
        Calendar cal = Calendar.getInstance();
        // test record for em substitute with start date
        cal.add(Calendar.DAY_OF_MONTH, MIN_FIVE_DAYS);
        createSubstitutesEmRecord(wfSubDS, ADAMS_CHRIS_EM_ID, CURRENT_USER_EM_ID,
            ACCEPTANCE_STEP_TYPE, cal.getTime(), null);
        
        cal = Calendar.getInstance();
        // test record for em substitute with end date
        cal.add(Calendar.DAY_OF_MONTH, TEN_DAYS);
        createSubstitutesEmRecord(wfSubDS, BABIC_PAUL_EM_ID, CURRENT_USER_EM_ID,
            DISPATCH_STEP_TYPE, null, cal.getTime());
        
        cal = Calendar.getInstance();
        // test record for em substitute with start+end date - including now
        cal.add(Calendar.DAY_OF_MONTH, MIN_FIFTHEEN_DAYS);
        Date startDate = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, TWENTY_DAYS);
        createSubstitutesEmRecord(wfSubDS, BARTLETT_JOAN_EM_ID, CURRENT_USER_EM_ID,
            ESTIMATION_STEP_TYPE, startDate, cal.getTime());
        
        cal = Calendar.getInstance();
        // test record for em substitute with start date in the future
        cal.add(Calendar.MONTH, 1);
        createSubstitutesEmRecord(wfSubDS, APPLEBY_STEVE_EM_ID, CURRENT_USER_EM_ID,
            SURVEY_STEP_TYPE, cal.getTime(), null);
        
        cal = Calendar.getInstance();
        // test record for em substitute with end date in the past
        cal.add(Calendar.DAY_OF_MONTH, MIN_TEN_DAYS);
        createSubstitutesEmRecord(wfSubDS, ABERNATHY_ALISON_EM_ID, CURRENT_USER_EM_ID,
            REVIEW_STEP_TYPE, null, cal.getTime());
        
        cal = Calendar.getInstance();
        // test record for em substitute with start and end date - excl now
        cal.add(Calendar.DAY_OF_MONTH, 2);
        startDate = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, 2);
        createSubstitutesEmRecord(wfSubDS, ALLBURG_EM_ID, CURRENT_USER_EM_ID, SCHEDULING_STEP_TYPE,
            startDate, cal.getTime());
        
        final String currentUserCfId = getCfIdForUser(CURRENT_USER_EM_ID);
        
        // test record for cf substitute without date restriction
        createSubstitutesCfRecord(wfSubDS, ABBY_SHARPS_CF_ID, currentUserCfId, APPROVAL_STEP_TYPE,
            null, null);
        
        cal = Calendar.getInstance();
        // test record for cf substitute with start date
        cal.add(Calendar.DAY_OF_MONTH, MIN_FIVE_DAYS);
        createSubstitutesCfRecord(wfSubDS, WILL_TRAM_CF_ID, currentUserCfId, ACCEPTANCE_STEP_TYPE,
            cal.getTime(), null);
        
        cal = Calendar.getInstance();
        // test record for cf substitute with end date
        cal.add(Calendar.DAY_OF_MONTH, TEN_DAYS);
        createSubstitutesCfRecord(wfSubDS, REX_ULETON_CF_ID, currentUserCfId, DISPATCH_STEP_TYPE,
            null, cal.getTime());
        
        cal = Calendar.getInstance();
        // test record for cf substitute with start+end date - including now
        cal.add(Calendar.DAY_OF_MONTH, MIN_FIFTHEEN_DAYS);
        startDate = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, TWENTY_DAYS);
        createSubstitutesCfRecord(wfSubDS, DAVID_VARRISON_CF_ID, currentUserCfId,
            ESTIMATION_STEP_TYPE, startDate, cal.getTime());
        
        cal = Calendar.getInstance();
        // test record for cf substitute with start date in the future
        cal.add(Calendar.MONTH, 1);
        createSubstitutesCfRecord(wfSubDS, RANDOLPH_WATERMA_CF_ID, currentUserCfId,
            SURVEY_STEP_TYPE, cal.getTime(), null);
        
        cal = Calendar.getInstance();
        cal.add(Calendar.DATE, MIN_FIFTHEEN_DAYS);
        // test record for cf substitute with end date in the past
        createSubstitutesCfRecord(wfSubDS, MARGARETA_XANOVI_CF_ID, currentUserCfId,
            REVIEW_STEP_TYPE, null, cal.getTime());
        
        cal = Calendar.getInstance();
        // test record for cf substitute with start and end date - excl now
        cal.add(Calendar.DAY_OF_MONTH, 2);
        startDate = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, 2);
        createSubstitutesCfRecord(wfSubDS, JOHN_YANDS_CF_ID, currentUserCfId, SCHEDULING_STEP_TYPE,
            startDate, cal.getTime());
    }
    
    /**
     * Test checkWorkflowCfSubstitute.
     * 
     */
    public void testCheckWorkflowCfSubstitute() {
        assertTrue("ABBY SHARPS should be substitute of AI for Approval",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                ABBY_SHARPS_CF_ID, APPROVAL_STEP_TYPE));
        
        assertFalse("ABBY SHARPS should not be substitute of AI as Service Desk Manager",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                ABBY_SHARPS_CF_ID, MANAGER_ROLE));
        
        assertTrue("WILL TRAM should be substitute of AI for Acceptance",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                WILL_TRAM_CF_ID, ACCEPTANCE_STEP_TYPE));
        
        assertTrue("REX ULETON should be substitute of AI for Dispatch",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                REX_ULETON_CF_ID, DISPATCH_STEP_TYPE));
        
        assertTrue("DAVID VARRISON should be substitute of AI for estimation",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                DAVID_VARRISON_CF_ID, ESTIMATION_STEP_TYPE));
        
        assertFalse("RANDOLPH WATERMA is not yet substitute of AI for surveys",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                RANDOLPH_WATERMA_CF_ID, SURVEY_STEP_TYPE));
        
        assertFalse("MARGARETA XANOVI is not longer substitute of AI for review",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                MARGARETA_XANOVI_CF_ID, REVIEW_STEP_TYPE));
        
        assertFalse("JOHN YANDS isn't substitute of AI for scheduling now",
            StepHandler.checkWorkflowCfSubstitute(this.context.getEventHandlerContext(),
                JOHN_YANDS_CF_ID, SCHEDULING_STEP_TYPE));
    }
    
    /**
     * Test CheckWorkflowEmSubstitute.
     * 
     */
    public void testCheckWorkflowEmSubstitute() {
        assertTrue("AFM should be substitute of AI for Approval",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(), AFM_EM_ID,
                APPROVAL_STEP_TYPE));
        
        assertFalse("AFM should not be substitute of AI as Service Desk Manager",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(), AFM_EM_ID,
                MANAGER_ROLE));
        
        assertTrue("ADAMS should be substitute of AI for Acceptance",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(),
                ADAMS_CHRIS_EM_ID, ACCEPTANCE_STEP_TYPE));
        
        assertTrue("BABIC should be substitute of AI for Dispatch",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(),
                BABIC_PAUL_EM_ID, DISPATCH_STEP_TYPE));
        
        assertTrue("BARTLETT should be substitute of AI for estimation",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(),
                BARTLETT_JOAN_EM_ID, ESTIMATION_STEP_TYPE));
        
        assertFalse("APPLEBY is not yet substitute of AI for surveys",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(),
                APPLEBY_STEVE_EM_ID, SURVEY_STEP_TYPE));
        
        assertFalse("ABERNATHY is not longer substitute of AI for review",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(),
                ABERNATHY_ALISON_EM_ID, REVIEW_STEP_TYPE));
        
        assertFalse("ALLBURG isn't substitute of AI for scheduling now",
            StepHandler.checkWorkflowEmSubstitute(this.context.getEventHandlerContext(),
                ALLBURG_EM_ID, SCHEDULING_STEP_TYPE));
    }
    
    /**
     * Test for StepHandler.getWorkflowEmSubstitutes.
     */
    public void testGetWorkflowEmSubstitutes() {
        final List<String> approvalSubstitute =
                StepHandler.getWorkflowEmSubstitutes(this.context.getEventHandlerContext(),
                    AFM_EM_ID, APPROVAL_STEP_TYPE);
        Assert.assertEquals(1, approvalSubstitute.size());
        
    }
    
    /**
     * Create test record for a craftsperson substitute.
     * 
     * @param wfSubsDS datasource
     * @param cfId cf_id
     * @param substituteCfId substitute_cf_id
     * @param stepTypeOrRole step_type_or_role
     * @param startDate start_date_unavailable
     * @param endDate end_date_unavailable
     */
    private void createSubstitutesCfRecord(final DataSource wfSubsDS, final String cfId,
            final String substituteCfId, final String stepTypeOrRole, final Date startDate,
            final Date endDate) {
        final DataRecord subCfRecord = wfSubsDS.createNewRecord();
        subCfRecord.setValue(WF_SUBS_CF_ID_FIELD_NAME, cfId);
        subCfRecord.setValue(WF_SUBS_SUB_CF_ID_FIELD_NAME, substituteCfId);
        subCfRecord.setValue(WF_SUBS_STEPTYPE_FIELD_NAME, stepTypeOrRole);
        
        subCfRecord.setValue(WF_SUBS_START_DATE_UNAVAILABLE_FIELD_NAME, startDate);
        
        subCfRecord.setValue(WF_SUBS_END_DATE_UNAVAILABLE_FIELD_NAME, endDate);
        wfSubsDS.saveRecord(subCfRecord);
    }
    
    /**
     * Create test record for an employee substitute.
     * 
     * @param wfSubsDS datasource
     * @param emId em_id
     * @param substituteEmId substitute_em_id
     * @param stepTypeOrRole step_type_or_role
     * @param startDate start_date_unavailable
     * @param endDate end_date_unavailable
     */
    private void createSubstitutesEmRecord(final DataSource wfSubsDS, final String emId,
            final String substituteEmId, final String stepTypeOrRole, final Date startDate,
            final Date endDate) {
        final DataRecord subCfRecord = wfSubsDS.createNewRecord();
        subCfRecord.setValue(WF_SUBS_EM_ID_FIELD_NAME, emId);
        subCfRecord.setValue(WF_SUBS_SUB_EM_ID_FIELD_NAME, substituteEmId);
        subCfRecord.setValue(WF_SUBS_STEPTYPE_FIELD_NAME, stepTypeOrRole);
        
        subCfRecord.setValue(WF_SUBS_START_DATE_UNAVAILABLE_FIELD_NAME, startDate);
        
        subCfRecord.setValue(WF_SUBS_END_DATE_UNAVAILABLE_FIELD_NAME, endDate);
        wfSubsDS.saveRecord(subCfRecord);
    }
    
    /**
     * lookup cf_id for given employee, or create cf record.
     * 
     * @param employeeId em_id.
     * @return cf_id for given employee
     */
    private String getCfIdForUser(final String employeeId) {
        final DataSource emDS =
                DataSourceFactory.createDataSourceForFields(EM_TABLE_NAME, new String[] {
                        EM_ID_FIELD_NAME, EMAIL_FIELD_NAME });
        emDS.addRestriction(Restrictions.eq(EM_TABLE_NAME, EM_ID_FIELD_NAME, employeeId));
        final String email = emDS.getRecord().getString(EM_EMAIL_FIELD_NAME);
        
        String result = employeeId;
        
        final DataSource cfDS =
                DataSourceFactory.createDataSourceForFields(CF_TABLE_NAME, new String[] {
                        CF_ID_FIELD_NAME, EMAIL_FIELD_NAME, "tr_id" });
        cfDS.addRestriction(Restrictions.eq(CF_TABLE_NAME, EMAIL_FIELD_NAME, email));
        DataRecord cfRecord = cfDS.getRecord();
        
        if (cfRecord == null) {
            cfRecord = cfDS.createNewRecord();
            cfRecord.setValue(CF_CF_ID_FIELD_NAME, employeeId);
            cfRecord.setValue("cf.email", email);
            cfRecord.setValue("cf.tr_id", "MULTI-TRADE I");
            cfDS.saveRecord(cfRecord);
        } else {
            result = cfRecord.getString(CF_CF_ID_FIELD_NAME);
        }
        
        return result;
    }
    
}

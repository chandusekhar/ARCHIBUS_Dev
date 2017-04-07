package com.archibus.eventhandler.green.scoring;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

public class TestScoringHandler extends DataSourceTestBase {
    
    /**
     * Constant: Field name: "SUCCESS".
     */
    private static final String SUCCESS = "Success";
    
    /**
     * Constant: Field name: "time_archived".
     */
    private static final String FAIL = "fail";
    
    /**
     * Constant: Field name: "LEED_EB_05".
     */
    private static final String LEED_EB_05 = "LEED-EB 05";
    
    /**
     * Constant: Field name: "time_archived".
     */
    private static final String BREEAM_NC_OFF_08 = "BREEAM-NC OFF 08";
    
    /**
     * Constant: Field name: "time_archived".
     */
    private static final String HQ = "HQ";
    
    /**
     * Constant: Field name: "EQUALS_LEFT_QUOTE".
     */
    private static final String EQUALS_LEFT_QUOTE = "='";
    
    /**
     * Constant: Field name: "EQUALS_LEFT_QUOTE".
     */
    private static final String RIGHT_QUOTE = "'";
    
    /**
     * Constant: Field name: "time_archived".
     */
    private static final String GB_CERT_PROJ_CERT_STD = "gb_cert_proj.cert_std";
    
    /**
     * Constant: Field name: "time_archived".
     */
    private static final String HQ_LEED_2005_ASSESSMENT = "HQ LEED 2005 ASSESSMENT";
    
    /**
     * Constant: Field name: "time_archived".
     */
    private static final String GB_CERT_PROJ = "gb_cert_proj";
    
    /**
     * 
     * Test CalculateProjectScores method of class ScoringHandler.
     */
    public void testCalculateProjectScores() {
        try {
            final ScoringHandler scoring = new ScoringHandler();
            scoring.calculateProjectScores();
        } catch (final Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
        
    }
    
    /**
     * 
     * Test CalculateOneProjectScore method of class ScoringHandler.
     */
    public void testCalculateOneProjectScore() {
        try {
            final ScoringHandler scoring = new ScoringHandler();
            // String blId, String certStd, String projectName
            scoring.calculateOneProjectScore(HQ, LEED_EB_05, HQ_LEED_2005_ASSESSMENT);
        } catch (final Throwable t) {
            t.printStackTrace();
            fail();
        }
    }
    
    /**
     * 
     * Test DeleteOldCertStdValues method of class ScoringHandler.
     */
    public void testDeleteOldCertStdValues() {
        
        final DataSource dsProject = DataSourceFactory.createDataSource();
        dsProject.addTable(GB_CERT_PROJ, DataSource.ROLE_MAIN);
        dsProject.addField(GB_CERT_PROJ, "bl_id");
        dsProject.addField(GB_CERT_PROJ, "cert_std");
        dsProject.addField(GB_CERT_PROJ, "project_name");
        dsProject.addField(GB_CERT_PROJ, "tot_self_score");
        dsProject.addField(GB_CERT_PROJ, "tot_final_score");
        try {
            final ScoringHandler scoring = new ScoringHandler();
            // String blId, String certStd, String projectName
            scoring.deleteOldCertStdValues(BREEAM_NC_OFF_08, LEED_EB_05);
            
            final DataRecord projRecord =
                    dsProject.getRecord(GB_CERT_PROJ_CERT_STD + EQUALS_LEFT_QUOTE + LEED_EB_05
                            + RIGHT_QUOTE);
            if (projRecord != null) {
                System.out.print(FAIL);
            } else {
                System.out.print(SUCCESS);
            }
            
        } catch (final Throwable t) {
            t.printStackTrace();
            fail();
        }
        
    }
    
}

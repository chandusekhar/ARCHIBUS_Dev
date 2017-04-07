package com.archibus.app.solution.logiccookbook;

import com.archibus.datasource.SqlUtils;

/**
 * This example demonstrates how to suppress Eclipse, PMD, CheckStyle, FindBugs warnings.
 * 
 * @author Valery Tydykov
 * 
 *         <p>
 *         Suppress PMD warning in this class.
 *         <p>
 *         Justification: I like having unnecessary semicolons.
 */
@SuppressWarnings({ "PMD.EmptyStatementNotInLoop" })
public class SuppressWarningsExample {
    
    /**
     * Method javadoc.
     * <p>
     * Suppress PMD warning "ExcessiveParameterList" in this method.
     * <p>
     * Justification: <thirdPartyLibrary.jar> requires this method signature.
     */
    @SuppressWarnings("PMD.ExcessiveParameterList")
    public void badMethod1(final String p1, final String p2, final String p3, final String p4,
            final String p5, final String p6, final String p7, final String p8, final String p9,
            final String p10) {
    }
    
    /**
     * Method javadoc.
     * <p>
     * Suppress Eclipse warning "unused" in this method.
     * <p>
     * Justification: I like having unused variables.
     */
    @SuppressWarnings("unused")
    public void badMethod2() {
        final String literalOne = "duplicatedLiteral";
        final String literalTwo = "duplicatedLiteral";
        
        // CHECKSTYLE:OFF : Justification: I like having unnecessary semicolons.
        ;
        // CHECKSTYLE:ON
    }
    
    /**
     * Method javadoc.
     * 
     * <p>
     * Suppress FindBugs warning "NP_ALWAYS_NULL" in this method.
     * <p>
     * Justification: I like having NullPointerException.
     */
    @SuppressWarnings("null")
    @edu.umd.cs.findbugs.annotations.SuppressWarnings("NP_ALWAYS_NULL")
    public void badMethod3() {
        final String uninitializedString = null;
        uninitializedString.contains("A");
    }
    
    /**
     * Method javadoc.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2: Statement with INSERT ... SELECT pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void badMethod4() {
        // Generate new pmpsum records.
        String sql = "INSERT INTO pmpsum (date_todo, eq_id, pmp_id, tr_id, hours)"
                + " SELECT pmsd.date_todo, ' ', pmp.pmp_id, pmpstr.tr_id, SUM(pmpstr.hours_req)"
                + " FROM pmsd, pms, pmp, pmps, pmpstr"
                + " WHERE pms.pms_id = pmsd.pms_id AND pmp.pmp_id = pms.pmp_id"
                + " AND pmps.pmp_id =pmp.pmp_id AND pmpstr.pmp_id=pmps.pmp_id"
                + " AND pmpstr.pmps_id = pmps.pmps_id"
                + " AND pmsd.date_todo >= ${parameters['dateFrom']}"
                + " AND pmsd.date_todo <= ${parameters['dateTo']}"
                + " GROUP BY pmsd.date_todo, pmp.pmp_id, pmpstr.tr_id ";
        
        SqlUtils.executeUpdate("pmpsum", sql);
    }
}

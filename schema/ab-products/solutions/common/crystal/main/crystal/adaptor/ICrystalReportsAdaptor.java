package com.archibus.app.solution.common.report.crystal.adaptor;

import java.io.InputStream;

import com.archibus.security.*;
import com.archibus.security.UserAccount.Immutable;

/**
 * Adaptor for CrystalReports.
 *
 * @author Valery Tydykov
 * @since 21.3
 *
 */
public interface ICrystalReportsAdaptor {
    /**
     * Generates stream with PDF report using .rpt file specified by reportFileName. Applies VPA
     * restrictions from the current user account if applyVpa is true.
     *
     * @param reportFileName name of .rpt file with report definition.
     * @param userAccount current user account.
     * @param applyVpa if true, applies VPA restrictions from the current user account.
     * @param clientRestriction restriction passed from client-side
     * @return stream with PDF report.
     */
    InputStream generateReportToStream(final String reportFileName,
            final UserAccount.Immutable userAccount, final boolean applyVpa,
            final String clientRestriction);
    
    /**
     * Publish report by replace the report and subreport datasource connection with the current
     * database and user information.
     *
     * @param reportFileName name of .rpt file with report definition to process
     * @param userAccount current user account information
     * @return true if publishing succeeds, false otherwise.
     */
    boolean publishReport(String reportFileName, Immutable userAccount);
    
}
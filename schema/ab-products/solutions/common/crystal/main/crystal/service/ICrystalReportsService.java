package com.archibus.app.solution.common.report.crystal.service;

import org.directwebremoting.io.FileTransfer;

import com.archibus.utility.ExceptionBase;

/**
 * API of a service that integrates Crystal Report SDK with WebCentral.
 * <p>
 * Provides method for generating PDF report using Crystal Report .rpt file. Does not handle reports
 * with subreports.
 * <p>
 * Managed by Spring, configured in crystal-reports-services.xml.
 * <p>
 * Exposed through DWR.
 * <p>
 * Called from DWR clients (browser).
 * <p>
 * User must be authenticated to access all methods. This is implemented by configuring
 * SecurityInterceptor to intercept all method calls.
 *
 * @author Valery Tydykov
 * @since 21.3
 *
 */
public interface ICrystalReportsService {
    /**
     * Generates PDF single or mulitple table report using .rpt file specified by reportFileName.
     * Applies VPA restrictions from the current user account if applyVpa is true. Applies the
     * client restriction if any.
     *
     * @param reportFileName name of .rpt file with report definition.
     * @param applyVpa If true, applies VPA restrictions from the current user account.
     * @param clientRestriction restriction passed from client-side
     * @return FileTransfer which contains stream with generated PDF. DWR will write that stream
     *         into HTTP response.
     * @throws ExceptionBase if Crystal Report SDK throws an exception or JDBC throws SQLException.
     */
    FileTransfer generateReport(final String reportFileName, boolean applyVpa,
            final String clientRestriction) throws ExceptionBase;

}
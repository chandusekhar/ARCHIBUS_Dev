package com.archibus.app.solution.common.report.crystal.service.impl;

import java.io.*;

import org.apache.log4j.Logger;
import org.directwebremoting.io.FileTransfer;
import org.springframework.util.Assert;

import com.archibus.app.solution.common.report.crystal.adaptor.ICrystalReportsAdaptor;
import com.archibus.app.solution.common.report.crystal.service.ICrystalReportsService;
import com.archibus.security.UserAccount;
import com.archibus.servlet.DWRFileTransfer;
import com.archibus.utility.*;

/**
 * <p>
 * Implementation of ICrystalReportsService that uses ICrystalReportsAdaptor.
 *
 * @author Valery Tydykov
 * @since 21.3
 *
 */
public class CrystalReportsService implements ICrystalReportsService {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Property: current user account.
     */
    private UserAccount.Immutable userAccount;
    
    /**
     * Property: adaptor for CrystalReports.
     */
    private ICrystalReportsAdaptor crystalReportsAdaptor;
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.crystalReportsAdaptor, "crystalReportsAdaptor must be supplied");
        Assert.notNull(this.userAccount, "userAccount must be supplied");
    }
    
    /**
     * Getter for property: crystalReportsAdaptor.
     *
     * @return the crystalReportsAdaptor.
     */
    public ICrystalReportsAdaptor getCrystalReportsAdaptor() {
        return this.crystalReportsAdaptor;
    }
    
    /**
     * Setter for property: crystalReportsAdaptor.
     *
     * @param crystalReportsAdaptor to be set.
     *
     */
    public void setCrystalReportsAdaptor(final ICrystalReportsAdaptor crystalReportsAdaptor) {
        this.crystalReportsAdaptor = crystalReportsAdaptor;
    }
    
    /**
     * Setter for property: userAccount.
     *
     * @param userAccount to be set.
     *
     */
    public void setUserAccount(final UserAccount.Immutable userAccount) {
        this.userAccount = userAccount;
    }
    
    /**
     * Getter for property: userAccount.
     *
     * @return the userAccount.
     */
    public UserAccount.Immutable getUserAccount() {
        return this.userAccount;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public FileTransfer generateReport(final String reportFileName, final boolean applyVpa,
            final String clientRestriction) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(String.format(
                "generateReport for reportFileName=[%s], applyVpa=[%b], clientRestriction=[%s]",
                reportFileName, applyVpa, clientRestriction));
        }
        
        // publish the report to set the reports and sub-reports' datasources with the current
        // user's connection.
        final boolean success =
                this.crystalReportsAdaptor.publishReport(reportFileName, this.userAccount);
        
        DWRFileTransfer fileTransfer = null;

        if (success) {
            String restriction = null;
            if (!"null".equalsIgnoreCase(clientRestriction)) {
                restriction = clientRestriction;
            }
            
            final InputStream inputStream =
                    this.crystalReportsAdaptor.generateReportToStream(reportFileName,
                        this.userAccount, applyVpa, restriction);
            
            // replace extension ".rpt" with ".pdf"
            final String generatedReportFileName =
                    FileUtil.getNameOnly(reportFileName, File.separator) + ".pdf";
            
            fileTransfer =
                    new DWRFileTransfer(generatedReportFileName, "application/pdf", "inline",
                        inputStream);
        }

        return fileTransfer;
    }
}

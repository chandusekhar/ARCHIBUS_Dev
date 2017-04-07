package com.archibus.app.sysadmin.updatewizard.schema.job;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.schema.filefilter.*;
import com.archibus.app.sysadmin.updatewizard.script.service.BatchFileJob;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Recreate structures job.
 *
 * @author Catalin Purice
 *
 */
// CHECKSTYLE:OFF Justification: Suppress "Max coupling classes"
public class RecreateStructuresJob extends JobBase {
    // CHECKSTYLE:ON

    /**
     * SQL files folder name.
     */
    private static final String SQLVIEW_FOLDER_NAME = "sqlviews";

    /**
     * SQL Views Path.
     */
    private static final String SQL_VIEWS_PATH = "schema" + File.separator + "ab-products"
            + File.separator + "common" + File.separator + SQLVIEW_FOLDER_NAME;

    /**
     * Absolute path to SQL view files.
     */
    private static final String ROOT_PATH =
            ContextStore.get().getWebAppPath() + File.separator + SQL_VIEWS_PATH + "\\duw";

    /**
     * database type.
     */
    private transient String dbType = "sybase";

    /**
     * Constructor.
     */
    public RecreateStructuresJob() {
        super();
        if (SqlUtils.isOracle()) {
            this.dbType = "oracle";
        } else if (SqlUtils.isSqlServer()) {
            this.dbType = "mssql";
        }
    }

    @Override
    public void run() {
        final List<File> duwFiles = searchDuwFiles();
        this.status.setTotalNumber(duwFiles.size());
        this.status.addPartialResult(new JobResult("Execute DUW files from " + ROOT_PATH));
        try {
            executeDuwFiles(duwFiles);
        } catch (final IOException ioE) {
            this.status.setCode(JobStatus.JOB_FAILED);
            try {
                throw ioE;
            } catch (final IOException e) {
                Logger.getLogger(this.getClass()).error(ioE.getMessage());
            }
        }

        this.status.setCode(JobStatus.JOB_COMPLETE);
    }

    /**
     *
     * Return the DUW Files to be executed.
     *
     * @return list of DUW files.
     */
    private List<File> searchDuwFiles() {

        final List<File> duwFiles = new ArrayList<File>();

        final FileSearch<DuwFileFilter> duwFileSearch =
                new FileSearch<DuwFileFilter>(new DuwFileFilter(this.dbType));
        duwFiles.addAll(duwFileSearch
            .search(new File(ContextStore.get().getWebAppPath() + File.separator + SQL_VIEWS_PATH))
            .getFindedFiles());
        if (duwFiles.isEmpty()) {
            this.status.addPartialResult(new JobResult("No DUW files found at " + ROOT_PATH));
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }

        return duwFiles;
    }

    /**
     *
     * Execute DUW Files.
     *
     * @param duwFiles DUW files to execute
     * @throws IOException throws IO exception in case the files are inaccessible.
     */
    private void executeDuwFiles(final List<File> duwFiles) throws IOException {
        for (final File duwFile : duwFiles) {
            final String partialStatus = DuwFileFilter.getJobTitle(duwFile);
            this.status.addPartialResult(new JobResult("Executing " + partialStatus));
            new BatchFileJob(new FileInputStream(duwFile)).run();
            this.status.updateLastPartialResult(new JobResult(partialStatus + " updated."));
            this.status.incrementCurrentNumber();
            Logger.getLogger(this.getClass()).info(duwFile.getAbsolutePath() + " executed.");
        }
    }
}

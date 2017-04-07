package com.archibus.datasource;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.datasource.cascade.*;
import com.archibus.datasource.cascade.common.CascadeUtility;
import com.archibus.datasource.cascade.jobs.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.ExceptionBase;

/**
 * Implements cascade methods.
 *
 * @author Catalin Purice
 *
 */
public class CascadeHandlerImpl extends JobBase implements CascadeHandler {

    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * List of fields that do not allow null. Defined in core-optional.xml.
     */
    private List<String> cascadeDeleteDoNotAllowNullFieldsNames;

    /**
     * Starts cascade delete job.
     *
     * @param record record to delete
     * @throws ExceptionBase ExceptionBase
     */
    @Override
    public void cascadeDelete(final DataRecord record) throws ExceptionBase {

        if (record.getFields().isEmpty()) {
            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Update Handler: Skip cascade. Record has no fields.");
            }
            return;
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Delete Handler: JOB STARTED.");
        }

        final CascadeDeleteJob deleteJob = new CascadeDeleteJob(record);
        deleteJob.run();
    }

    /**
     * Starts cascade update job.
     *
     * @param record record to update
     * @throws ExceptionBase ExceptionBase
     */
    @Override
    public void cascadeUpdate(final DataRecord record) throws ExceptionBase {

        if (record.getFields().isEmpty() || !CascadeUtility.hasRecordChanged(record)) {
            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Update Handler: Skip cascade. Primary Key not changed.");
            }
            return;
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Update Handler: JOB STARTED.");
        }

        final CascadeUpdateJob updateJob = new CascadeUpdateJob(record);
        updateJob.run();
    }

    /**
     *
     * Merge primary keys FROM record TO record.
     *
     * @param fromRecord from record
     * @param toRecord to record
     * @throws ExceptionBase throws exception
     */
    public String mergePrimaryKeys(final DataRecord fromRecord, final DataRecord toRecord)
            throws ExceptionBase {

        final String jobId = "";

        if (!fromRecord.getFields().isEmpty() && !toRecord.getFields().isEmpty()
                && CascadeUtility.recordsMatch(fromRecord, toRecord)) {

            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Handler: Records match successfully.");
            }

            final DataRecord recordToMerge = CascadeUtility.buildMergeRecord(fromRecord, toRecord);

            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Handler: Records build successfully.");
            }

            if (CascadeUtility.hasRecordChanged(recordToMerge)) {

                if (this.log.isDebugEnabled()) {
                    this.log.debug("Cascade Handler: JOB STARTED.");
                }
                try {
                    final CascadeRecord updateCascade = new CascadeUpdateImpl(recordToMerge);
                    ((CascadeUpdateImpl) updateCascade).setMergePrimaryKeys(true);
                    ((CascadeUpdateImpl) updateCascade).setJobStatus(this.getStatus());
                    updateCascade.cascade();
                } catch (final ExceptionBase ex) {
                    throw new ExceptionBase(
                        "Records can not be merged. Please see log for details.", true);
                }
            } else {
                throw new ExceptionBase("Records have not been changed. Records can not be merged.",
                    true);
            }
        }

        return jobId;
    }

    /**
     * Getter for the cascadeDeleteDoNotAllowNullFieldsNames property.
     *
     * @see cascadeDeleteDoNotAllowNullFieldsNames
     * @return the cascadeDeleteDoNotAllowNullFieldsNames property.
     */
    public List<String> getCascadeDeleteDoNotAllowNullFieldsNames() {
        return this.cascadeDeleteDoNotAllowNullFieldsNames;
    }

    /**
     * Setter for the cascadeDeleteDoNotAllowNullFieldsNames property.
     *
     * @see cascadeDeleteDoNotAllowNullFieldsNames
     * @param cascadeDeleteDoNotAllowNullFieldsNames the cascadeDeleteDoNotAllowNullFieldsNames to
     *            set
     */

    public void setCascadeDeleteDoNotAllowNullFieldsNames(
            final List<String> cascadeDeleteDoNotAllowNullFieldsNames) {
        this.cascadeDeleteDoNotAllowNullFieldsNames = cascadeDeleteDoNotAllowNullFieldsNames;
    }

}

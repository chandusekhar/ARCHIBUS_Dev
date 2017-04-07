package com.archibus.service.homepagedescriptor;

import java.io.*;
import java.util.*;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.*;

/**
 * Service for Home Page Descriptor as used initially in the Home Page Editor application.
 *
 * @author Steven Meyer
 */
public class HomePageDescriptorServiceImpl implements HomePageDescriptorService {
    /**
     * Database table for processes info.
     */
    private static final String PROCESSES_TABLE = "afm_processes";

    /**
     * Database table for linking roles to processes info.
     */
    private static final String ROLEPROCS_TABLE = "afm_roleprocs";

    /**
     * Database full field name separator.
     */
    private static final String FULL_NAME_SEPARATOR = ".";

    /**
     * WFR Parameter name for fetching a descriptor XML string.
     */
    private static final String DESCRIPTOR_ACTIVITY_ID = "activity_id";

    /**
     * WFR Parameter name for fetching a descriptor XML string.
     */
    private static final String DESCRIPTOR_PROCESS_ID = "process_id";

    /**
     * WFR Parameter name for editing a process record.
     */
    private static final String PROCESS_TITLE = "title";

    /**
     * WFR Parameter name for editing a process record.
     */
    private static final String PROCESS_TYPE = "process_type";

    /**
     * WFR Parameter name for fetching a descriptor XML string.
     */
    private static final String ROLE_NAME = "role_name";

    /**
     * Database column holding descriptor process id.
     */
    private static final String DESCRIPTOR_PROCESS_COLUMN = PROCESSES_TABLE + FULL_NAME_SEPARATOR
            + DESCRIPTOR_PROCESS_ID;

    /**
     * Database column holding descriptor file name.
     */
    private static final String DESCRIPTOR_FILENAME_COLUMN = "afm_processes.dashboard_view";

    /**
     * WFR Parameter name for saving a descriptor XML string.
     */
    private static final String DATASOURCE_VIEW = "ab-pgnav-manage-homepage-processes.axvw";

    /**
     * Datasource name for fetching and saving a descriptor properties.
     */
    private static final String DESCRIPTOR_DATASOURCE_ID = "pageNavigationProcDescriptor_ds";

    /**
     * Datasource name for linking role to process.
     */
    private static final String ROLEPROCS_DATASOURCE_ID = "roleProcs_ds";

    /**
     * WFR Parameter name for saving a descriptor XML string.
     */
    private static final String HOME_PAGE_ACTIVITY_ID = "AbDashboardPageNavigation";

    /**
     * Constant for encoding.
     */
    private static final String UTF8 = "UTF-8";

    /**
     * Property value for clause options.
     */
    private static final String EQUALS = "=";

    /**
     * Property value for clause options.
     */
    private static final String AND = "AND";

    /**
     * Property value for clause options.
     */
    private static final int INDENT_COUNT = 4;

    /**
     * New process / page error message.
     */
    // @translatable
    private static final String PROCESSID_UNIQUENESS_MESSAGE =
            "A process record using that id already exists.";

    /**
     * Directory location for ab-products/common/views/page-navigation/. Parent directory of
     * generated,descriptors,...
     */
    private static final String DIRECTORY_PAGE_NAVIGATION_COMMON = java.io.File.separator
            + "ab-products" + java.io.File.separator + "common" + java.io.File.separator + "views"
            + java.io.File.separator + "page-navigation" + java.io.File.separator;

    /**
     * The Logger object to log messages to archibus.log.
     */
    private final Logger logger = Logger.getLogger(this.getClass());

    /** {@inheritDoc} */
    @Override
    public final JSONObject getPageDescriptorFile(final String activityId, final String processId,
            final String fileName) {
        final JSONObject data = new JSONObject();
        final String descriptorFileName = getDescriptorFileName(fileName, activityId, processId);
        if (!descriptorFileName.isEmpty()) {
            final File descriptorFile =
                    new File(getDescriptorDirectoryPath() + java.io.File.separator
                            + descriptorFileName);
            if (descriptorFile.exists()) {
                String descriptorXml = "";
                try {
                    descriptorXml =
                            FileUtils.readFileToString(descriptorFile, UTF8)
                                .replaceAll("\\s+", " ").trim();
                } catch (final IOException e) {
                    throw new ExceptionBase(e.getMessage());
                }

                data.put("descriptorFileName", descriptorFileName);
                data.put("descriptorXml", descriptorXml);
            } else {
                this.logger.info("The descriptor " + fileName + " was not found.");
            }
        }

        return data;
    }

    /**
     * Return the descriptorFile name from the parameters.
     *
     * @param fileName The file name of a descriptor in the ab-products directory tree.
     * @param activityId Part of the PKey to a process record, afm_processes.activity_id.
     * @param processId Part of the PKey to a process record, afm_processes.process_id.
     * @return descriptorFile name.
     */
    private String getDescriptorFileName(final String fileName, final String activityId,
            final String processId) {
        String descriptorFileName = fileName;
        if (null == descriptorFileName || descriptorFileName.isEmpty()) {
            String activity = activityId;
            if (activityId.isEmpty() && !processId.isEmpty()) {
                activity = HOME_PAGE_ACTIVITY_ID;
            }

            descriptorFileName = getDescriptorNameForRestriction(activity, processId);
        }

        return descriptorFileName;
    }

    /**
     * Return the descriptor Name For the given Restriction.
     *
     * @param activityId afm_processes.activity_id, part of the primary key.
     * @param processId afm_processes.process_id, part of the primary key.
     * @return descriptor file name from the afm_process.dashboard_view column.
     */
    private String getDescriptorNameForRestriction(final String activityId, final String processId) {
        String descriptorFileName = "";
        final DataSource taskDataSource =
                DataSourceFactory.loadDataSourceFromFile(DATASOURCE_VIEW, DESCRIPTOR_DATASOURCE_ID);
        final Restriction restriction =
                new Restriction(AND, Arrays.asList(new Clause(PROCESSES_TABLE,
                    DESCRIPTOR_PROCESS_ID, processId, EQUALS), new Clause(PROCESSES_TABLE,
                    DESCRIPTOR_ACTIVITY_ID, activityId, EQUALS)));
        taskDataSource.addRestriction(restriction);

        final List<DataRecord> records = taskDataSource.getRecords();
        if (!records.isEmpty()) {
            final DataRecord record = records.get(0);
            descriptorFileName = record.getString(DESCRIPTOR_FILENAME_COLUMN);
        }

        return descriptorFileName;
    }

    /**
     * Return the absolute Path to the Descriptor Directory.
     *
     * @return string directory path.
     */
    private String getDescriptorDirectoryPath() {
        final String descriptorSubdir = DIRECTORY_PAGE_NAVIGATION_COMMON + "descriptors";

        // absolute path to the dir where file is written
        final ContextCacheable.Immutable ctx = ContextStore.get().getCurrentContext();
        final String descriptorDirAbsolutePath =
                ctx.getAttribute("/*/preferences/@webAppPath") + java.io.File.separator
                + ctx.getAttribute("/*/preferences/@schemaDirectory") + descriptorSubdir;

        return descriptorDirAbsolutePath;
    }

    /**
     * Writes the home page descriptor to the file system.
     *
     * @param fileName The file name of a descriptor in the ab-products directory tree.
     * @param descriptorXml Unformatted XML string describing the home page layout and content.
     */
    @Override
    public void savePageDescriptorFile(final String fileName, final String descriptorXml) {
        if (fileName.isEmpty() || descriptorXml.isEmpty()) {
            return;
        }

        // Write descriptor string to file. Overwrite policy is freely overwrite.
        try {
            FileUtils.writeStringToFile(new File(getDescriptorDirectoryPath()
                    + java.io.File.separator + fileName),
                XmlImpl.prettyFormatXml(descriptorXml, INDENT_COUNT), UTF8);
        } catch (final IOException e) {
            throw new ExceptionBase(e.getMessage());
        }
    }

    /** {@inheritDoc} */
    @Override
    public void copyPageDescriptorFile(final Map<String, String> parameters) {
        final String fileName = parameters.get("originalDescriptorFileName");
        final String targetFileName = parameters.get(DESCRIPTOR_FILENAME_COLUMN);

        // copy descriptor file may not use new filename -- that's allowed.
        if (!fileName.equalsIgnoreCase(targetFileName)) {
            final String descriptorFilePath =
                    getDescriptorDirectoryPath() + java.io.File.separator + fileName;
            final String descriptorDestinationPath =
                    getDescriptorDirectoryPath() + java.io.File.separator + targetFileName;
            try {
                FileUtils.copyFile(new File(descriptorFilePath),
                    new File(descriptorDestinationPath));
            } catch (final IOException e) {
                throw new ExceptionBase(e.getMessage());
            }
        }
        // Insert afm_roleprocs record when creating or copying afm_processes record.
        createRoleProcsRecord(parameters);
    }

    /** {@inheritDoc} */
    @Override
    public void createRoleProcsRecord(final Map<String, String> parameters) {
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(DATASOURCE_VIEW, ROLEPROCS_DATASOURCE_ID);
        final String processId = parameters.get(DESCRIPTOR_PROCESS_COLUMN);
        final String rolename = ContextStore.get().getUser().getRole();

        final Restriction restriction =
                new Restriction(AND, Arrays.asList(new Clause(ROLEPROCS_TABLE,
                    DESCRIPTOR_ACTIVITY_ID, HOME_PAGE_ACTIVITY_ID, EQUALS), new Clause(
                    ROLEPROCS_TABLE, DESCRIPTOR_PROCESS_ID, processId, EQUALS), new Clause(
                    ROLEPROCS_TABLE, ROLE_NAME, rolename, EQUALS)));
        dataSource.addRestriction(restriction);
        final DataRecord existingRecord = dataSource.getRecord();

        if (existingRecord == null) {
            final DataRecord newRecord = dataSource.createNewRecord();
            newRecord.setValue(ROLEPROCS_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_ACTIVITY_ID,
                HOME_PAGE_ACTIVITY_ID);
            newRecord.setValue(ROLEPROCS_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_PROCESS_ID,
                processId);
            newRecord.setValue(ROLEPROCS_TABLE + FULL_NAME_SEPARATOR + ROLE_NAME, rolename);

            dataSource.saveRecord(newRecord);
        } else {
            final ExceptionBase exception = new ExceptionBase(PROCESSID_UNIQUENESS_MESSAGE);
            exception.setTranslatable(true);
            throw exception;
        }
    }

    /** {@inheritDoc} */
    @Override
    public void saveTransferredTaskRecords(final DataSetList taskRecords,
            final Map<String, String> parameters) {
        // when pTask's process doesn't exist yet, create a new afm_processes record.
        createProcessIfNeeded(parameters);

        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-pgnav-manage-process-tasks.axvw",
                    "pageNavTasks_ds");
        for (final DataRecord record : taskRecords.getRecords()) {
            dataSource.saveRecord(record);
        }
    }

    /**
     * Create an afm_processes record when the FK of the task does not yet exist.
     *
     * @param parameters PK of new record plus title.
     */
    private void createProcessIfNeeded(final Map<String, String> parameters) {
        final String activityId = parameters.get(DESCRIPTOR_ACTIVITY_ID);
        final String processId = parameters.get(DESCRIPTOR_PROCESS_ID);
        final String[] fieldNames =
            { PROCESSES_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_ACTIVITY_ID,
                PROCESSES_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_PROCESS_ID,
                PROCESSES_TABLE + FULL_NAME_SEPARATOR + PROCESS_TITLE,
                PROCESSES_TABLE + FULL_NAME_SEPARATOR + PROCESS_TYPE };
        final DataSource processDataSource =
                DataSourceFactory.createDataSourceForFields(PROCESSES_TABLE, fieldNames);
        processDataSource.addRestriction(new Restriction(AND, Arrays.asList(new Clause(
            PROCESSES_TABLE, DESCRIPTOR_PROCESS_ID, processId, EQUALS), new Clause(PROCESSES_TABLE,
            DESCRIPTOR_ACTIVITY_ID, activityId, EQUALS))));

        final DataRecord processRecord = processDataSource.getRecord();
        if (null == processRecord) {
            createTasksProcess(processDataSource, parameters);
            createNewProcessRoleProcsRecord(ContextStore.get().getUser().getRole(), activityId,
                processId);
        }
    }

    /**
     * Create a pTask's parent afm_processes record.
     *
     * @param processDataSource DataSource used to save process record.
     * @param parameters PK of new record plus title.
     */
    private void createTasksProcess(final DataSource processDataSource,
            final Map<String, String> parameters) {
        // TODO title & display_order,
        // TODO license_level as user's level?
        //
        final DataRecord processRecord = processDataSource.createNewRecord();
        processRecord.setValue(PROCESSES_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_ACTIVITY_ID,
            parameters.get(DESCRIPTOR_ACTIVITY_ID));
        processRecord.setValue(PROCESSES_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_PROCESS_ID,
            parameters.get(DESCRIPTOR_PROCESS_ID));
        processRecord.setValue(PROCESSES_TABLE + FULL_NAME_SEPARATOR + PROCESS_TITLE,
            parameters.get(PROCESS_TITLE));
        processRecord.setValue(PROCESSES_TABLE + FULL_NAME_SEPARATOR + PROCESS_TYPE, "PAGES");
        processDataSource.saveRecord(processRecord);
    }

    /**
     * Create a pTask's parent afm_roleprocs record.
     *
     * @param roleName String afm_roles name, string
     * @param activityId PK of new record.
     * @param processId PK of new record.
     */
    private void createNewProcessRoleProcsRecord(final String roleName, final String activityId,
            final String processId) {
        final DataSource roleProcsDataSource =
                DataSourceFactory.loadDataSourceFromFile(DATASOURCE_VIEW, ROLEPROCS_DATASOURCE_ID);
        final DataRecord roleProcsRecord = roleProcsDataSource.createNewRecord();
        roleProcsRecord.setValue(ROLEPROCS_TABLE + FULL_NAME_SEPARATOR + ROLE_NAME, roleName);
        roleProcsRecord.setValue(ROLEPROCS_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_ACTIVITY_ID,
            activityId);
        roleProcsRecord.setValue(ROLEPROCS_TABLE + FULL_NAME_SEPARATOR + DESCRIPTOR_PROCESS_ID,
            processId);
        roleProcsDataSource.saveRecord(roleProcsRecord);
    }

}
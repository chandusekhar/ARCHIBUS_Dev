package com.archibus.eventhandler.eam.requirements;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.eam.dao.datasource.SpaceBudgetDataSource;
import com.archibus.eventhandler.eam.domain.SpaceBudget;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.StringUtil;

/**
 *
 * Version 22.1 Enterprise Asset Management - Project requirements.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class ProjectRequirementsService extends JobBase {

    /**
     * Create requirement baseline for space budget.
     *
     * @param spBudgetRecord space budget record
     * @param assetTypes list of asset types ['eq', 'rm', 'fn']
     * @param sumAllocation summarize allocation; values ('no', 'bl', 'fl')
     * @param floors building floors; pattern building code concatenated (with separator) with floor
     *            code
     * @param separator concatenation operator used in floors
     */
    public void createBaseline(final DataRecord spBudgetRecord, final List<String> assetTypes,
            final String sumAllocation, final List<String> floors, final String separator) {

        // save/update space budget record
        saveSpaceBudget(spBudgetRecord);
        final SpaceBudget spaceBudget = getSpaceBudget(spBudgetRecord.getString("sb.sb_name"));

        final Map<String, List<String>> bldgFloors = getSelectedFloors(floors, separator);
        final boolean isForSpace = assetTypes.indexOf(Constants.ASSET_TYPE_RM) > -1;
        final boolean isForEquipment = assetTypes.indexOf(Constants.ASSET_TYPE_EQ) > -1;
        final boolean isForFurniture = assetTypes.indexOf(Constants.ASSET_TYPE_FN) > -1;

        if (isForSpace && !bldgFloors.isEmpty()) {
            final SpaceRequirements spaceRequirements = new SpaceRequirements();
            spaceRequirements.createBaseline(spaceBudget, sumAllocation, bldgFloors);
        }
        if (isForEquipment && !bldgFloors.isEmpty()) {
            final EquipmentRequirements equipmentRequirements = new EquipmentRequirements();
            equipmentRequirements.createBaseline(spaceBudget, sumAllocation, bldgFloors);
        }
        if (isForFurniture && !bldgFloors.isEmpty()) {
            final FurnitureRequirements furnitureRequirements = new FurnitureRequirements();
            furnitureRequirements.createBaseline(spaceBudget, sumAllocation, bldgFloors);
        }
    }

    /**
     * Add new locations to project.
     *
     * @param sbName space budget name
     * @param floors selected floors
     * @param separator concatenation operator
     * @param updateRequirements if current sb_items must be updated
     * @param assetTypes list of asset types ['eq', 'rm', 'fn']
     * @param sumAllocation summarize allocation; values ('no', 'bl', 'fl')
     */
    public void addBaselineLocations(final String sbName, final List<String> floors,
            final String separator, final boolean updateRequirements, final List<String> assetTypes,
            final String sumAllocation) {
        final SpaceBudget spaceBudget = getSpaceBudget(sbName);

        final boolean isForSpace = assetTypes.indexOf(Constants.ASSET_TYPE_RM) > -1;
        final boolean isForEquipment = assetTypes.indexOf(Constants.ASSET_TYPE_EQ) > -1;
        final boolean isForFurniture = assetTypes.indexOf(Constants.ASSET_TYPE_FN) > -1;

        final Map<String, List<String>> bldgFloors = getSelectedFloors(floors, separator);

        String summAllocationForRm = sumAllocation;
        String summAllocationForEq = sumAllocation;
        String summAllocationForFn = sumAllocation;

        if (StringUtil.isNullOrEmpty(sumAllocation)) {
            if (Constants.SB_LEVEL_FG.equals(spaceBudget.getLevel())) {
                summAllocationForRm = Constants.SUM_ALLOC_FL;
                summAllocationForEq = Constants.SUM_ALLOC_FL;
                summAllocationForFn = Constants.SUM_ALLOC_FL;
            } else {
                summAllocationForRm = getSummAllocation(sbName, " sb_items.rm_std IS NOT NULL ");
                summAllocationForEq = getSummAllocation(sbName, " sb_items.eq_std IS NOT NULL ");
                summAllocationForFn = getSummAllocation(sbName, " sb_items.fn_std IS NOT NULL ");
            }
        }

        if (isForSpace && !bldgFloors.isEmpty()) {
            final SpaceRequirements spaceRequirements = new SpaceRequirements();
            spaceRequirements.addLocation(spaceBudget, summAllocationForRm, updateRequirements,
                bldgFloors);
        }
        if (isForEquipment && !bldgFloors.isEmpty()) {
            final EquipmentRequirements equipmentRequirements = new EquipmentRequirements();
            equipmentRequirements.addLocation(spaceBudget, summAllocationForEq, updateRequirements,
                bldgFloors);
        }
        if (isForFurniture && !bldgFloors.isEmpty()) {
            final FurnitureRequirements furnitureRequirements = new FurnitureRequirements();
            furnitureRequirements.addLocation(spaceBudget, summAllocationForFn, updateRequirements,
                bldgFloors);
        }

    }

    /**
     * Get existing locations for space budget.
     *
     * @param sbName space budget name
     * @param restriction sql restriction
     * @param separator string separator
     * @param multipleValueSeparator multiple value separator
     * @return String
     */
    public String getExistingLocationsForSpBudget(final String sbName, final String restriction,
            final String separator, final String multipleValueSeparator) {

        final DataSource dsSbItems = DataSourceFactory.createDataSource();
        dsSbItems.setDistinct(true);
        dsSbItems.addTable(Constants.TABLE_SB_ITEMS);
        dsSbItems.addField(Constants.BASELINE_LOCATIONS);
        dsSbItems.addRestriction(
            Restrictions.and(Restrictions.eq(Constants.TABLE_SB_ITEMS, Constants.SB_NAME, sbName),
                Restrictions.isNotNull(Constants.TABLE_SB_ITEMS, Constants.BASELINE_LOCATIONS)));
        if (StringUtil.notNullOrEmpty(restriction)) {
            dsSbItems.addRestriction(Restrictions.sql(restriction));
        }
        String result = "";
        final List<DataRecord> records = dsSbItems.getRecords();
        for (final DataRecord record : records) {
            final String tmpBaselineLocations = record.getString("sb_items.baseline_locations");
            final String[] locations = tmpBaselineLocations.split(Constants.SEMICOLON);
            for (int index = 0; index < locations.length / 2; index++) {
                final String lclvalue = locations[2 * index] + separator + locations[2 * index + 1]
                        + multipleValueSeparator;
                if (result.indexOf(lclvalue) == -1) {
                    result += lclvalue;
                }
            }
        }
        if (result.length() > 0) {
            result = result.substring(0, result.length() - multipleValueSeparator.length());
        }
        return result;
    }

    /**
     * Copy selected work packages to destination project.
     *
     * @param srcProjectId source project
     * @param destProjectId destination project
     * @param workPckgIds work package id's
     */
    public void copyWorkPackages(final String srcProjectId, final String destProjectId,
            final List<String> workPckgIds) {
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        projectRequirementHelper.copyWorkPackagesToProject(srcProjectId, destProjectId,
            workPckgIds);
    }

    /**
     * Copy selected actions to project and workpackage.
     *
     * @param destProjectId destination project id
     * @param destWorkPkgId destination work package
     * @param actionIds activity log id's
     */
    public void copyActions(final String destProjectId, final String destWorkPkgId,
            final List<Integer> actionIds) {
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        projectRequirementHelper.copyActionsToProjectAndWorkPackage(destProjectId, destWorkPkgId,
            actionIds);
    }

    /**
     * Update selection actions.
     *
     * @param record record object with new values
     * @param actionIds list of selected action id's
     */
    public void updateActions(final DataRecord record, final List<Integer> actionIds) {
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        projectRequirementHelper.updateActions(record, actionIds);
    }

    /**
     * Delete information of actions.
     *
     * @param type delete type ('info', 'action')
     * @param fields map<String, String> key - field name, value - field value
     * @param projects list with selected projects
     */
    public void deleteAction(final String type, final Map<String, String> fields,
            final List<String> projects) {
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        projectRequirementHelper.deleteFromProjectDetails(type, fields, projects);
    }

    /**
     * Get selected floors formatted as map.
     *
     * @param floors selected floors list
     * @param separator string separator
     * @return Map<String, List<String>> Map<bl_id, List<fl_id>>
     */
    private Map<String, List<String>> getSelectedFloors(final List<String> floors,
            final String separator) {
        final Map<String, List<String>> result = new HashMap<String, List<String>>();
        for (int index = 0; index < floors.size(); index++) {
            final String buildingFloor = floors.get(index);
            final String[] values = buildingFloor.split(separator);
            final String blId = values[0];
            final String flId = values[1];

            if (!result.containsKey(blId)) {
                result.put(blId, new ArrayList<String>());
            }

            result.get(blId).add(flId);
        }
        return result;
    }

    /**
     * Save space budget and return space budget object.
     *
     * @param record space budget record.
     */
    private void saveSpaceBudget(final DataRecord record) {
        final SpaceBudgetDataSource dataSource = new SpaceBudgetDataSource();
        if (record.isNew()) {
            dataSource.saveRecord(record);
        } else {
            dataSource.updateRecord(record);
        }
    }

    /**
     * Get space budget object.
     *
     * @param name space budget name
     * @return SpaceBudget
     */
    private SpaceBudget getSpaceBudget(final String name) {
        final SpaceBudgetDataSource dataSource = new SpaceBudgetDataSource();
        return dataSource.getSpaceBudget(name);
    }

    /**
     * Get summarize allocation for budget.
     *
     * @param sbName space budget name
     * @param assetTypeRestriction if is from space , equipment or funiture
     * @return string
     *
     */
    private String getSummAllocation(final String sbName, final String assetTypeRestriction) {
        String result = Constants.SUM_ALLOC_NO;
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(
            Constants.TABLE_SB_ITEMS, new String[] { "auto_number", "sb_name", "bl_id", "fl_id" });

        String sqlRestriction = "sb_items.sb_name = " + SqlUtils.formatValueForSql(sbName);
        sqlRestriction += " AND " + assetTypeRestriction;

        final List<DataRecord> floorAllocRecords = dataSource.getRecords(
            sqlRestriction + " AND sb_items.bl_id IS NOT NULL AND sb_items.fl_id IS NOT NULL");
        final List<DataRecord> blAllocRecords =
                dataSource.getRecords(sqlRestriction + " AND sb_items.bl_id IS NOT NULL");
        if (floorAllocRecords.isEmpty() && !blAllocRecords.isEmpty()) {
            result = Constants.SUM_ALLOC_BL;
        } else if (!floorAllocRecords.isEmpty()) {
            result = Constants.SUM_ALLOC_FL;
        }

        return result;
    }

    /**
     *
     * Generate Power Point Presentation based on selected <code>project</code>.
     *
     *
     * @param projectId projectId
     */
    public void generatePPTPresentation(final String projectId) {
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        projectRequirementHelper.generatePPTPresentation(projectId, this.status);
    }

    /**
     * Copy documents assigned to source record into the target record.
     *
     * @param sourceDocId source docs_assigned.doc_id
     * @param targetDocId target docs_assigned.doc_id
     */
    public void copyDocuments(final String sourceDocId, final String targetDocId) {
        final ProjectRequirementHelper projectRequirementHelper = new ProjectRequirementHelper();
        projectRequirementHelper.copyDocuments(sourceDocId, targetDocId);
    }
}

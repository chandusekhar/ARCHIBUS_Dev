package com.archibus.app.common.depreciation.service;

import java.util.List;

import com.archibus.app.common.depreciation.dao.*;
import com.archibus.app.common.depreciation.dao.datasource.*;
import com.archibus.app.common.depreciation.domain.*;
import com.archibus.app.common.depreciation.impl.DepreciationServiceHelper;
import com.archibus.jobmanager.*;

/**
 * Provide methods to calculate and update depreciation job. Run as scheduled job.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DepreciationJob extends JobBase {

    /**
     * Reference to custom data source used to load depreciable equipment.These references are set
     * by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IEquipmentDao<Equipment> equipmentDao;

    /**
     * Reference to custom data source used to load depreciable furniture.These references are set
     * by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IFurnitureDao<Furniture> furnitureDao;

    /**
     * Job status.
     */
    private JobStatus jobStatus;

    /**
     * Calculate asset depreciation for all assets types and active depreciation report.
     *
     */
    public void calculateDepreciation() {
        initPerRequestState();
        // initialize job status total number
        final int noOfDepreciableEquipment = this.equipmentDao.getCountOfDepreciableEquipment();
        final int noOfDepreciableFurniture = this.furnitureDao.getCountOfDepreciableFurniture();
        this.jobStatus.setTotalNumber(noOfDepreciableEquipment + noOfDepreciableFurniture);
        calculateEquipmentDepreciation();
        calculateFurnitureDepreciation();
    }

    /**
     * Calculate equipment depreciation for active depreciation report.
     *
     */
    public void calculateEquipmentDepreciation() {
        initPerRequestState();
        final IDepreciationReportDao<DepreciationReport> reportDao =
                new DepreciationReportDataSource();
        final DepreciationReport activeReport = reportDao.getActiveReport();
        calculateEquipmentDepreciationForReport(activeReport);
    }

    /**
     * Calculate equipment depreciation for depreciation report.
     *
     * @param depreciationReport depreciation report
     */
    public void calculateEquipmentDepreciationForReport(
            final DepreciationReport depreciationReport) {
        initPerRequestState();
        final int noOfDepreciableEquipment = this.equipmentDao.getCountOfDepreciableEquipment();
        // if equipment depreciation method was called directly job total number is not initialized.
        if (noOfDepreciableEquipment > this.jobStatus.getTotalNumber()) {
            this.jobStatus.setTotalNumber(noOfDepreciableEquipment);
        }
        final List<Equipment> equipmentList = this.equipmentDao.getDepreciableEquipmentList();

        final IPropertyTypeDao<PropertyType> propertyTypeDao = new PropertyTypeDataSource();
        final IDepreciationDao<EquipmentDepreciation> equipmentDepreciationDao =
                new EquipmentDepreciationDataSource();
        equipmentDepreciationDao.deleteDataForReport(depreciationReport);

        for (final Equipment equipment : equipmentList) {
            if (this.jobStatus.isStopRequested()) {
                this.jobStatus.setCode(JobStatus.JOB_STOPPED);
                break;
            }
            this.jobStatus.incrementCurrentNumber();

            final PropertyType propertyType =
                    propertyTypeDao.getPropertyTypeByName(equipment.getPropertyType());

            final EquipmentDepreciation equipmentDepreciation = DepreciationServiceHelper
                .calculateEquipmentDepreciation(equipment, propertyType, depreciationReport);
            if (equipmentDepreciation != null) {
                equipmentDepreciationDao.save(equipmentDepreciation);
                equipment.setCostDepValue(equipmentDepreciation.getValueCurrent());
                this.equipmentDao.update(equipment);
            }
        }
    }

    /**
     * Calculate furniture depreciation for active depreciation report.
     *
     */
    public void calculateFurnitureDepreciation() {
        initPerRequestState();
        final IDepreciationReportDao<DepreciationReport> reportDao =
                new DepreciationReportDataSource();
        final DepreciationReport activeReport = reportDao.getActiveReport();
        calculateFurnitureDepreciationForReport(activeReport);
    }

    /**
     * Calculate furniture depreciation for depreciation report.
     *
     * @param depreciationReport depreciation report
     */
    public void calculateFurnitureDepreciationForReport(
            final DepreciationReport depreciationReport) {
        initPerRequestState();
        final int noOfDepreciableFurniture = this.furnitureDao.getCountOfDepreciableFurniture();
        // if equipment depreciation method was called directly job total number is not initialized.
        if (noOfDepreciableFurniture > this.jobStatus.getTotalNumber()) {
            this.jobStatus.setTotalNumber(noOfDepreciableFurniture);
        }
        final List<Furniture> furnitureList = this.furnitureDao.getDepreciableFurnitureList();

        final IPropertyTypeDao<PropertyType> propertyTypeDao = new PropertyTypeDataSource();
        final IDepreciationDao<FurnitureDepreciation> furnitureDeprecitionDao =
                new FurnitureDepreciationDataSource();
        furnitureDeprecitionDao.deleteDataForReport(depreciationReport);

        for (final Furniture furniture : furnitureList) {
            if (this.jobStatus.isStopRequested()) {
                this.jobStatus.setCode(JobStatus.JOB_STOPPED);
                break;
            }
            this.jobStatus.incrementCurrentNumber();

            final PropertyType propertyType =
                    propertyTypeDao.getPropertyTypeByName(furniture.getPropertyType());

            final FurnitureDepreciation furnitureDepreciation = DepreciationServiceHelper
                .calculateFurnitureDepreciation(furniture, propertyType, depreciationReport);
            if (furnitureDepreciation != null) {
                furnitureDeprecitionDao.save(furnitureDepreciation);
                furniture.setValueSalvage(furnitureDepreciation.getValueCurrent());
                this.furnitureDao.update(furniture);
            }
        }
    }

    /**
     * Setter for the equipmentDao property.
     *
     * @see equipmentDao
     * @param equipmentDao the equipmentDao to set
     */

    public void setEquipmentDao(final IEquipmentDao<Equipment> equipmentDao) {
        this.equipmentDao = equipmentDao;
    }

    /**
     * Setter for the furnitureDao property.
     *
     * @see furnitureDao
     * @param furnitureDao the furnitureDao to set
     */

    public void setFurnitureDao(final IFurnitureDao<Furniture> furnitureDao) {
        this.furnitureDao = furnitureDao;
    }

    /**
     * Setter for the jobStatus property.
     *
     * @see jobStatus
     * @param jobStatus the jobStatus to set
     */

    public void setJobStatus(final JobStatus jobStatus) {
        this.jobStatus = jobStatus;
    }

    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        if (this.equipmentDao == null) {
            this.equipmentDao = new EquipmentDataSource();
        }
        if (this.furnitureDao == null) {
            this.furnitureDao = new FurnitureDataSource();
        }
        if (this.jobStatus == null) {
            this.jobStatus = this.status;
        }
    }
}

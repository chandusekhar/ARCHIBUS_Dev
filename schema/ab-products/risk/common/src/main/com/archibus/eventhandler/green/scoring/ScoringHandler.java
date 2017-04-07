package com.archibus.eventhandler.green.scoring;

import java.math.BigDecimal;
import java.util.List;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * ScoringHandler - The plain java class served as Certification Scoring workflow rule, which
 * contians wfr methods for 19.3 Green Building Certification functionality *
 * <p>
 * History:
 * <li>Initial implementation for 19.3 Green Building.
 * 
 * @author Zhang Yi
 */

public class ScoringHandler {
    /**
     * Calculate One Project's total self score and total final score
     * 
     * @param blId: one of three pk values of rating project (gb_cert_proj.bl_id)
     * @param certStd: one of three pk values of rating project (gb_cert_proj.cert_std)
     * @param projectName: one of three pk values of rating project (gb_cert_proj.project_name)
     * 
     */
    
    public void calculateOneProjectScore(String blId, String certStd, String projectName) {

        // Initial datas-ources for following calculation
        final DataSource dsCat = DataSourceFactory.createDataSourceForFields("gb_cert_cat",
            new String[] { "cert_cat", "weight_factor" });

        final DataSource dsCredits = DataSourceFactory.createDataSourceForFields("gb_cert_credits",
            new String[] { "cert_std", "cert_cat", "credit_num", "subcredit_num", "credit_type" });

        final DataSource dsScore = DataSourceFactory.createDataSourceForFields("gb_cert_scores",
            new String[] { "bl_id", "cert_std", "project_name" });
        // This is combine datasource that contains main table gb_cert_proj and standard table
        // gb_cert_std.
        DataSource dsProject = DataSourceFactory.createDataSource();
        dsProject.addTable("gb_cert_proj", DataSource.ROLE_MAIN);
        dsProject.addTable("gb_cert_std", DataSource.ROLE_STANDARD);
        dsProject.addField("gb_cert_proj", "bl_id");
        dsProject.addField("gb_cert_proj", "cert_std");
        dsProject.addField("gb_cert_proj", "project_name");
        dsProject.addField("gb_cert_proj", "tot_self_score");
        dsProject.addField("gb_cert_proj", "tot_final_score");
        dsProject.addField("gb_cert_std", "cert_std");
        dsProject.addField("gb_cert_std", "scoring_type");
        // Retrieve a project record by passed in pk values
        DataRecord projRecord = dsProject.getRecord(" gb_cert_proj.project_name='" + projectName
                + "' AND gb_cert_proj.bl_id='" + blId + "' AND gb_cert_proj.cert_std='" + certStd
                + "' ");
        // If project doesn't exist, then return
        if (projRecord == null) {
            return;
        }

        initialGroupingDatasources();

        EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        boolean selfScore = calculateScoreByProject(dsCredits, dsCat, dsScore, projRecord, true);
        boolean finalScore = calculateScoreByProject(dsCredits, dsCat, dsScore, projRecord, false);
        calculatePaybackPeriodByProject(projRecord);
        
        JSONObject json = new JSONObject();
        
        // Calculate project tot_self_score and tot_final_score
        if (!selfScore || !finalScore) {
            json.put("noCalcInstructions", "true");
        }
        
        
        context.addResponseParameter("jsonExpression", json.toString());
    }

    // Grouping data-source for calculating sub total self-score value group by category
    private DataSourceGroupingImpl selfScoreSumDS = null;

    // Grouping data-source for calculating sub total final-score value group by category
    private DataSourceGroupingImpl finalScoreSumDS = null;

    // Grouping data-source for calculate total max score value (max points) of credits for given
    // certification standard and credit category
    private DataSourceGroupingImpl creditMaxPointSumDS = null;

    /**
     * Calculate Total Self Score and Total Final Score for all certification rating projects
     */
    public void calculateProjectScores() {

        // Initial datas-ources for following calculation
        final DataSource dsCat = DataSourceFactory.createDataSourceForFields("gb_cert_cat",
            new String[] { "cert_cat", "weight_factor" });

        final DataSource dsCredits = DataSourceFactory.createDataSourceForFields("gb_cert_credits",
            new String[] { "cert_std", "cert_cat", "credit_num", "subcredit_num", "credit_type" });

        final DataSource dsScore = DataSourceFactory.createDataSourceForFields("gb_cert_scores",
            new String[] { "bl_id", "cert_std", "project_name" });

        // This is combine datasource that contains main table gb_cert_proj and standard table
        // gb_cert_std.
        final DataSource dsProject = DataSourceFactory.createDataSource();
        dsProject.addTable("gb_cert_proj", DataSource.ROLE_MAIN);
        dsProject.addTable("gb_cert_std", DataSource.ROLE_STANDARD);
        dsProject.addField("gb_cert_proj", "bl_id");
        dsProject.addField("gb_cert_proj", "cert_std");
        dsProject.addField("gb_cert_proj", "project_name");
        dsProject.addField("gb_cert_proj", "tot_self_score");
        dsProject.addField("gb_cert_proj", "tot_final_score");
        dsProject.addField("gb_cert_std", "cert_std");
        dsProject.addField("gb_cert_std", "scoring_type");

        initialGroupingDatasources();

        // Loop rating projects list, calculate scores for each project record
        for (DataRecord projRecord : dsProject.getAllRecords()) {
            // Calculate project tot_self_score
            calculateScoreByProject(dsCredits, dsCat, dsScore, projRecord, true);
            // Calculate project tot_final_score
            calculateScoreByProject(dsCredits, dsCat, dsScore, projRecord, false);
        }
        
        calculatePaybackPeriodByProject(null);
    }

    /**
     * Initial grouping data-sources that will be used for following total max score value and sub
     * total score by category calculations.
     * 
     */
    private void initialGroupingDatasources() {
        // Initial sub total self score data-source, specify Calculated Field.
        this.selfScoreSumDS = new DataSourceGroupingImpl();
        this.selfScoreSumDS.addTable("gb_cert_scores");
        this.selfScoreSumDS.addCalculatedField("gb_cert_scores", "sum_score",
            DataSource.DATA_TYPE_INTEGER, 6, 0, "sum", "gb_cert_scores.self_score");

        // Initial sub total final score data-source, specify Calculated Field.
        this.finalScoreSumDS = new DataSourceGroupingImpl();
        this.finalScoreSumDS.addTable("gb_cert_scores");
        this.finalScoreSumDS.addCalculatedField("gb_cert_scores", "sum_score",

        // Initial total max score value data-source, specify Calculated Field.
            DataSource.DATA_TYPE_INTEGER, 6, 0, "sum", "gb_cert_scores.final_score");
        this.creditMaxPointSumDS = new DataSourceGroupingImpl();
        this.creditMaxPointSumDS.addTable("gb_cert_credits");
        this.creditMaxPointSumDS.addCalculatedField("gb_cert_credits", "sum_max_score",
            DataSource.DATA_TYPE_INTEGER, 6, 0, "sum", "gb_cert_credits.max_points");
    }

    /**
     * Calculate and store total self score and total final score by project through the table
     * gb_cert_scores.
     * 
     * @param dsCredits: DataSource of table gb_cert_credits
     * @param dsCat: DataSource of table gb_cert_cat
     * @param dsScore: DataSource of table gb_cert_score
     * @param projRecord: project record
     * @param isSelfScore: self score(true)|final score(false)
     * @return
     */
    public boolean calculateScoreByProject(DataSource dsCredits, DataSource dsCat,
            DataSource dsScore, DataRecord projRecord, boolean isSelfScore) {

        // retrieve pk values from project record
        String blId = projRecord.getString("gb_cert_proj.bl_id");
        String certStd = projRecord.getString("gb_cert_proj.cert_std");
        String projectName = projRecord.getString("gb_cert_proj.project_name");
        String scoringType = projRecord.getString("gb_cert_std.scoring_type");

        // Self score or final score field string ,value(self_score|final_score)
        String scoreParam = "";
        if (!isSelfScore) {
            scoreParam = "final_score";
        } else {
            scoreParam = "self_score";
        }

        // If can NOT calculate project's score, set 0 and return
        if (!canCalculateCredits(dsCredits, dsScore, blId, certStd, projectName, isSelfScore)) {
            new FieldFormula("gb_cert_proj")
                .addFormula("gb_cert_proj.tot_" + scoreParam, "0")
                .setAssignedRestriction(
                    "gb_cert_proj.bl_id ='" + blId + "' and gb_cert_proj.cert_std='" + certStd
                            + "' and gb_cert_proj.project_name='" + projectName + "'")

                .calculate();
            return false;
        }

        // If Scoring Type is Point Total, then directly add all self score or final score from
        // score records to total self score or total final score field of given project
        if (scoringType.equals("pnt_tot")) {
            // Calculate and save project total score for Scoring Type:Point Total
            new FieldOperation("gb_cert_proj", "gb_cert_scores")
                .setOwnerRestriction(
                    " gb_cert_proj.bl_id ='" + blId + "' and gb_cert_proj.cert_std='" + certStd
                            + "' and gb_cert_proj.project_name='" + projectName + "'")
                .setAssignedRestriction(
                    "gb_cert_scores.credit_type ='C' AND gb_cert_scores.bl_id ='" + blId
                            + "' and gb_cert_scores.cert_std='" + certStd
                            + "' and gb_cert_scores.project_name='" + projectName + "'")
                .calculate("gb_cert_proj.tot_" + scoreParam, "SUM", "gb_cert_scores." + scoreParam);
        }
        // If Scoring Type is Weighted Point Total or Weighted Category % ToPoint Total, then need
        // to consider Certification Category and use different formula.
        else {
            // Prepare restriction string for grouping data-source that calculate sum scores(self
            // score
            // or final score), this make sure only sum scores for given project and category
            StringBuilder strSumRes = new StringBuilder();
            strSumRes.append(" gb_cert_scores.credit_type ='C' ");
            strSumRes.append("  AND gb_cert_scores.bl_id ='").append(blId);
            strSumRes.append("' AND gb_cert_scores.cert_std='").append(certStd);
            strSumRes.append("' AND gb_cert_scores.project_name='").append(projectName);
            strSumRes.append("' AND gb_cert_scores.cert_cat=");

            // Prepare restriction string for grouping data-source that calculate sum max point
            // values of credits for given certification standard, category and credit type is 'C'.
            StringBuilder creditSumRes = new StringBuilder();
            creditSumRes.append(" gb_cert_credits.credit_type ='C' ");
            creditSumRes.append(" AND gb_cert_credits.cert_std='").append(certStd);
            creditSumRes.append("' AND gb_cert_credits.cert_cat=");

            // Calculate total self score or total final score of given project according to boolean
            // isSelfScore.
            double totalScore =  calculateTotalScoresByCat(strSumRes, creditSumRes,
                dsCat, certStd, scoringType, isSelfScore);

            // Update project tot_self_score or tot_final_score
            new FieldFormula()
                .setAssigned("gb_cert_proj")
                .setAssignedRestriction(
                    "gb_cert_proj.bl_id ='" + blId + "' and gb_cert_proj.cert_std='" + certStd
                            + "' and gb_cert_proj.project_name='" + projectName + "'")
                .calculate("gb_cert_proj.tot_" + scoreParam, String.valueOf(totalScore));
        }
        return true;
    }

    /**
     * Calculate total self score or total final score for project whose scoring type of associated
     * certification standard is Weighted Point Total or Weighted Category % ToPoint Total. The
     * calculation need to loop through all categories of certification standard, calculate
     * sub-totals for each category by using different formula and finally add them together.
     * 
     * @param dsCredits: DataSource of table gb_cert_credits
     * @param dsCat: DataSource of table gb_cert_cat
     * @param dsScore: DataSource of table gb_cert_score
     * @param projRecord: project record
     * @param isSelfScore: self score(true)|final score(false)
     * @return
     */
    public double calculateTotalScoresByCat(StringBuilder strSumRes, StringBuilder creditSumRes,
            DataSource dsCat, String certStd, String scoreType, boolean isSelfScore) {

        Double totalScore = 0.0;
        
        DataSourceGroupingImpl scoreSumDS = isSelfScore ?this.selfScoreSumDS : this.finalScoreSumDS;
        
        // Get categories list by project's cert_std field
        List<DataRecord> catRecords = dsCat.getRecords(" gb_cert_cat.cert_std='" + certStd + "' ");
        // Loop the categories list, for each categories, calculate sub total scores and add them to
        // total
        for (DataRecord catRec : catRecords) {
            // Retrieve weight factor value, which is used for calculate score for scoring type
            // Weighted Point Total or Weighted Category % ToPoint Total
            double weightFactor = catRec.getDouble("gb_cert_cat.weight_factor");
            String catId = catRec.getString("gb_cert_cat.cert_cat");
            // Construct restriction string by adding current category ID to already set and passed
            // in strSumRes
            String res = strSumRes.toString().replaceAll("gb_cert_scores.cert_cat=",
                "gb_cert_scores.cert_cat='" + catId + "'");
            // Get sum score record for given category
            DataRecord catSumRecord = scoreSumDS.getRecord(res);
            // Get sub total score value
            int catSumScore = catSumRecord == null ? 0 : catSumRecord
                .getInt("gb_cert_scores.sum_score");
            // If scoring type is Weighted Point Total, then only multiply weight factor with sub
            // total score and add it to total score
            if (scoreType.equals("w_pnt_tot")) {

                totalScore = totalScore + catSumScore * weightFactor;

            }
            // Else If scoring type is Weighted Category % ToPoint Total, then 1.multiply weight
            // factor with sub total score, 2.divide by sum max score value, 3.multiply by 100. And
            // finally add it to total score
            else {

                String creditRes = creditSumRes.toString().replaceAll("gb_cert_credits.cert_cat=",
                    "gb_cert_credits.cert_cat='" + catId + "'");
                DataRecord creditSumRecord = this.creditMaxPointSumDS.getRecord(creditRes);
                int creditSumMaxScore = creditSumRecord == null ? 0 : creditSumRecord
                    .getInt("gb_cert_credits.sum_max_score");
                if (creditSumMaxScore != 0) {
                    totalScore = totalScore + catSumScore * 100 * weightFactor / creditSumMaxScore;
                }
            }
        }
        
        return new BigDecimal(totalScore).setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * Return boolean value indicates that if could calculate project's score or not
     * 
     * @param dsCredits: DataSource of table gb_cert_credits
     * @param dsScore: DataSource of table gb_cert_scores
     * @param blId: gb_cert_proj.bl_id
     * @param certStd: gb_cert_proj.cert_std
     * @param projectName: gb_cert_proj.project_name
     * @return
     */
    public boolean canCalculateCredits(DataSource dsCredits, DataSource dsScore, String blId,
            String certStd, String projectName, boolean isSelfScore) {
        // Get credits list restricted by given certification standard and credit_type is 'P'
        List<DataRecord> creditRecord = dsCredits.getRecords(" gb_cert_credits.cert_std='"
                + certStd + "' AND gb_cert_credits.credit_type='P'");

        String scoreFieldName = isSelfScore ? "self_score" : "final_score";

        // Loop through the 'P' type credits(Prerequisite) list, check if each item have
        // corresponding score record with self_score=1
        for (int i = 0; i < creditRecord.size(); i++) {
            String creditCertCat = (String) creditRecord.get(i)
                .getValue("gb_cert_credits.cert_cat");
            String creditNum = (String) creditRecord.get(i).getValue("gb_cert_credits.credit_num");
            String subcreditnum = (String) creditRecord.get(i).getValue(
                "gb_cert_credits.subcredit_num");
            String creditType = (String) creditRecord.get(i)
                .getValue("gb_cert_credits.credit_type");
            int length = dsScore.getRecords(
                " gb_cert_scores.project_name='" + projectName + "' AND gb_cert_scores.bl_id='"
                        + blId + "' and gb_cert_scores.cert_std='" + certStd
                        + "' AND gb_cert_scores.cert_cat='" + creditCertCat
                        + "' AND gb_cert_scores.credit_num='" + creditNum
                        + "' AND gb_cert_scores.subcredit_num='" + subcreditnum
                        + "' AND gb_cert_scores.credit_type='" + creditType
                        + "' AND gb_cert_scores." + scoreFieldName + "=1 ").size();
            // If there is not score record match given project and credit, then return false
            if (length == 0) {
                return false;
            }
        }
        // If all 'P' type credits match the check condition,which means they all have scores with
        // self_score=1, then return true.
        return true;

    }
    
    /**
     * Delete related records which are associated with an old existed certification standard from
     * table gb_cert_proj,gb_cert_credits,gb_cert_cat, gb_cert_levels, gb_cert_std
     * 
     * @param certStd: certification standard value
     * 
     */
    
    public void deleteOldCertStdValues(String newCertStd, String oldCertStd) {
        // tables that need to delete records associated with old certification standard
        String[] tables = new String[] { "gb_cert_proj", "gb_cert_credits", "gb_cert_cat",
                "gb_cert_levels", "gb_cert_std" };
        
        String[] flds = new String[] { "cert_std" };
        
        List<DataRecord> records;
        // Check for the existence of old certification standard in each table, and only perform the
        // delete from that table if there is a copy
        for (String table : tables) {
            records = SqlUtils.executeQuery(table, flds, " SELECT cert_std FROM " + table
                    + " WHERE  cert_std ='" + newCertStd + "'");
            if (records != null && records.size() > 0) {
                SqlUtils.executeUpdate(table, "DELETE FROM " + table + " WHERE cert_std ='"
                        + oldCertStd + "'");
            } else {
                continue;
            }
        }
        
    }
    
    /**
     * Calculate and store tot_capital_coste, tot_annual_savings and tot_payback_period by project through the table
     * gb_cert_scores.
     * 
     * @param dsScore: DataSource of table gb_cert_score
     * @param projRecord: project record
     */
    private void calculatePaybackPeriodByProject(DataRecord projRecord) {
        
        String restriction = "1=1";
        
        if (projRecord != null) {
            restriction = "gb_cert_proj.bl_id ='" + projRecord.getString("gb_cert_proj.bl_id")
                    + "' and gb_cert_proj.cert_std='"
                    + projRecord.getString("gb_cert_proj.cert_std")
                    + "' and gb_cert_proj.project_name='"
                    + projRecord.getString("gb_cert_proj.project_name") + "'";
        }
        
        new FieldOperation("gb_cert_proj", "gb_cert_scores")
            .addOperation("gb_cert_proj.tot_capital_cost", "SUM", "gb_cert_scores.capital_cost")
            .setOwnerRestriction(restriction).calculate();
        
        new FieldOperation("gb_cert_proj", "gb_cert_scores")
            .addOperation("gb_cert_proj.tot_annual_savings", "SUM", "gb_cert_scores.annual_savings")
            .setOwnerRestriction(restriction).calculate();
        
        new FieldFormula("gb_cert_proj").setAssignedRestriction(
            restriction + " AND gb_cert_proj.tot_annual_savings != 0").calculate(
            "gb_cert_proj.tot_payback_period",
            "gb_cert_proj.tot_capital_cost*1.0 / gb_cert_proj.tot_annual_savings*1.0");
        
        new FieldFormula("gb_cert_proj").setAssignedRestriction(
            restriction + " AND gb_cert_proj.tot_annual_savings = 0").calculate(
            "gb_cert_proj.tot_payback_period", "0");
    }
    
}
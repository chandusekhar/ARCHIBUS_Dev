<?xml version="1.0" encoding="UTF-8"?>
<!-- processing reports in table format -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="ReportTableFormat">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>

		<!-- setting up variables which will be used in xsl -->
		<xsl:variable name="tableWidth" select="$afmTableGroup/@tableWidth"/>
		<xsl:variable name="printable" select="$afmTableGroup/afmReportParameters/@printable"/>
		<xsl:variable name="showGrid" select="$afmTableGroup/@showGrid"/>
		<xsl:variable name="afmTableGroupID" select="generate-id()"/>
		<!-- setting up report table's margin-left according to the value of  margin-left. 
			     style's real margin-left will be 30 times of the value of variable margin-left
		-->
		<div style='margin-left:{$margin-left*30}pt;'>
			<!-- html form identified by afmTableGroupID -->
			<table cellspacing="0" cellpadding="0">
				<form name='{$afmTableGroupID}'>
					<!-- statistics information -->
					<xsl:variable name="hasStatistics" select="$afmTableGroup/dataSource/statistics/statistic"/>
					<xsl:if test="count($hasStatistics) &gt; 0">
						<tr><td>
							<!-- calling tempalte ReportTable_statistics in report-table-statistics.xsl to set up statistics report-->
							<xsl:call-template name="ReportTable_statistics">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							</xsl:call-template>
						</td></tr>
					</xsl:if>
					<!-- data information-->
					<tr><td>
						<!-- calling template ReportTable_data in report-table-data.xsl to set up main report -->
						<xsl:call-template name="ReportTable_data">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
							<xsl:with-param name="level" select="$level"/>
						</xsl:call-template>
					</td></tr>
					<!-- action information-->
					<xsl:variable name="hasRowsSelectionAction" select="$afmTableGroup/rows/selection/afmAction"/>
					<xsl:variable name="hasAction" select="$afmTableGroup/afmAction[@eventName!='renderShowPrintablePdf']"/>
					<xsl:if test="count($hasAction)>0 or count($hasRowsSelectionAction)>0 ">		
						<tr><td>
							<!-- calling template ReportTable_actions in report-table-actions.xsl to set up actions with report-->
							<xsl:call-template name="ReportTable_actions">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
								<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
							</xsl:call-template>
						</td></tr>
					</xsl:if>
				</form>
			</table>
			<!-- setting up some spaces between two reports -->
			<table height="5" cellspacing="0" cellpadding="0"><tr><td></td></tr></table>
		</div>
	</xsl:template>
	<!-- including all template xsl files called by this xsl-->
	<xsl:include href="report-table-statistics.xsl" />
	<xsl:include href="report-table-data.xsl" />
	<xsl:include href="report-table-actions.xsl" />
</xsl:stylesheet>
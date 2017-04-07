<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:import href="../../../../ab-system/xsl/constants.xsl"/>

	<xsl:variable name="ActivityType" select="//message[@name='ActivityType']"/>

	<xsl:variable name="renderAction" select="/*/afmTableGroup/afmAction[@type='render']"/>

	<!-- Global stylesheet variables -->
	<xsl:variable name="recordsDataNode" select="/*/afmTableGroup/dataSource/data/records" />
	<xsl:variable name="membersNode" select="/*/afmTableGroup/dataSource/data/rowDimension" /> 

	<xsl:template match="/">
		<html>
			<title>
				<xsl:value-of select="/*/title"/>
				<xsl:value-of select="$whiteSpace"/>
			</title>
			<head>
				<xsl:call-template name="LinkingCSS"/>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/brg-proj-scorecard.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/brg-proj-management-console-tabmenu.js"><xsl:value-of select="$whiteSpace"/></script>
			</head>
			<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
				<table class="panelReportHeader">
					<tr><td width="100%"><xsl:text/><xsl:value-of select="/*/afmTableGroup[position()=1]/title"/></td>
						<td style="text-align: right; padding-right: 8px">
							<span class="panelButton_input" style="cursor: default" translatable="true" onclick="window.location.reload()">Refresh</span>	
						</td>
					</tr>
				</table>
				<form style="margin:0" name="{$afmInputsForm}" method="post">

				<table valign="top" bgcolor="#FFFFFF" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px">
					<!-- tr><td nowrap="1" style="font-family: Arial; font-size: 16" valign="middle" align="center" colspan="10">
					<xsl:choose>
						<xsl:when test="$ActivityType = 'project'"><h3><span translatable="true">Projects Scorecard</span></h3></xsl:when>
						<xsl:otherwise><h3><span translatable="true">Work Packages Scorecard</span></h3></xsl:otherwise>
					</xsl:choose>
					</td></tr-->
					<tr><td nowrap="1"></td><td nowrap="1"></td><th nowrap="1" style="font-family: Arial; font-size: 13; border-bottom: 1px solid #7F7F7F; padding: 2px" valign="middle" align="center" colspan="8"><span translatable="true">Cost Performance Index*</span></th></tr>

					<xsl:call-template name="doRow">
						<xsl:with-param name="iRowCount" select="9"/>
					</xsl:call-template>

				</table>
				</form>
				<table width="100%" style="margin: 12px">
				<tr><td style="font-family: Arial; font-size: 10"><span translatable="true">* Cost Performance Index = Budgeted Cost of Work Performed / Actual Cost of Work Performed (&gt; 1 means budget exceeded costs; &lt; 1 means costs exceeded budget)</span></td></tr>
				<tr><td style="font-family: Arial; font-size: 10"><span translatable="true">** Schedule Performance Index = Budgeted Cost of Work Performed / Budgeted Cost for Work Scheduled (&gt; 1 means ahead of schedule; &lt; 1 means behind schedule)</span></td></tr>
				</table>

				<xsl:call-template name="common">
					<xsl:with-param name="title" select="/*/title"/>
					<xsl:with-param name="debug" select="//@debug"/>
					<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
					<xsl:with-param name="xml" select="$xml"/>
				</xsl:call-template>

			</body>
		</html>
	</xsl:template>

	<xsl:template name="doRow">
		<xsl:param name="iRowCount" />

		<tr>
		    <!-- Do not use height for better formatting -->
			<!--xsl:attribute name="height">
				<xsl:choose>
					<xsl:when test="$iRowCount=9">12%</xsl:when>
					<xsl:otherwise>11%</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute-->
			<xsl:call-template name="doCol">
				<xsl:with-param name="iColCount" select="9"/>
				<xsl:with-param name="iRowCount" select="$iRowCount"/>
			</xsl:call-template>
		</tr>

		<xsl:if test="$iRowCount &gt; 1" >
			<!-- Recursively call doRow to generate rows -->
			<xsl:call-template name="doRow">
				<xsl:with-param name="iRowCount" select="$iRowCount - 1"/>
			</xsl:call-template>
		</xsl:if>

	</xsl:template>

	<xsl:template name="doCol">
		<xsl:param name="iColCount" />
		<xsl:param name="iRowCount" />

		<xsl:choose>
			<xsl:when test="$iColCount = 9 and $iRowCount = 9">
				<th nowrap="1" colspan="2" style="font-family: Arial; font-size: 12;">
				</th>
			</xsl:when>
			<!-- header cell-->
			<xsl:when test="$iColCount = 9 and $iRowCount = 8">
				<th nowrap="1" width="40" style="font-family: Arial; font-size: 12; border-right: 1px solid #7F7F7F; padding: 2px" valign="middle" align="left" rowspan="8"><span translatable="true">Schedule Performance Index**</span></th>
				<th nowrap="1" bgcolor="#FFF5D1" style="font-family: Arial; font-size: 12; border-bottom: 1px solid #7F7F7F; border-top: 1px solid #7F7F7F; border-right: 1px solid #7F7F7F; padding: 2px" valign="middle" align="center">
				<xsl:call-template name="doContent">
					<xsl:with-param name="iColCount" select="$iColCount"/>
					<xsl:with-param name="iRowCount" select="$iRowCount"/>
				</xsl:call-template>
				</th>
			</xsl:when>
			<xsl:when test="$iColCount = 8 and $iRowCount = 9">
				<th nowrap="1" bgcolor="#FFF5D1" style="font-family: Arial; font-size: 12; border-bottom: 1px solid #7F7F7F; border-right: 1px solid #7F7F7F; border-left: 1px solid #7F7F7F; padding: 2px" valign="middle" align="center">
				<xsl:call-template name="doContent">
					<xsl:with-param name="iColCount" select="$iColCount"/>
					<xsl:with-param name="iRowCount" select="$iRowCount"/>
				</xsl:call-template>
				</th>
			</xsl:when>
			<xsl:when test="$iRowCount = 9 and $iColCount != 9">
				<th nowrap="1" bgcolor="#FFF5D1" style="font-family: Arial; font-size: 12; padding: 2px; border-bottom: 1px solid #7F7F7F; border-right: 1px solid #7F7F7F" valign="middle" align="center">
				<xsl:attribute name="width">
					<xsl:choose>
						<xsl:when test="$iColCount=9">4%</xsl:when>
						<xsl:otherwise>11%</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
				<xsl:attribute name="rowspan">
					<xsl:choose>
						<xsl:when test="$iRowCount=8 and $iColCount=9">9</xsl:when>
						<xsl:otherwise>1</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
				<xsl:attribute name="colspan">
					<xsl:choose>
						<xsl:when test="$iRowCount=9 and $iColCount=9">2</xsl:when>
						<xsl:otherwise>1</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
					<xsl:call-template name="doContent">
					<xsl:with-param name="iColCount" select="$iColCount"/>
					<xsl:with-param name="iRowCount" select="$iRowCount"/>
				</xsl:call-template>
				</th>
			</xsl:when>
			<xsl:when test="$iColCount = 9 and $iRowCount != 9">
				<th nowrap="1" bgcolor="#FFF5D1" style="font-family: Arial; font-size: 12; padding: 2px; border-bottom: 1px solid #7F7F7F; border-right: 1px solid #7F7F7F" valign="middle" align="center">
				<xsl:attribute name="width">
					<xsl:choose>
						<xsl:when test="$iColCount=9">4%</xsl:when>
						<xsl:otherwise>11%</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
				<xsl:attribute name="rowspan">
					<xsl:choose>
						<xsl:when test="$iRowCount=8 and $iColCount=9">9</xsl:when>
						<xsl:otherwise>1</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
				<xsl:attribute name="colspan">
					<xsl:choose>
						<xsl:when test="$iRowCount=9 and $iColCount=9">2</xsl:when>
						<xsl:otherwise>1</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
					<xsl:call-template name="doContent">
					<xsl:with-param name="iColCount" select="$iColCount"/>
					<xsl:with-param name="iRowCount" select="$iRowCount"/>
				</xsl:call-template>
				</th>
			</xsl:when>

			<!-- content cell -->
			<xsl:otherwise>
				<td nowrap="1" style="font-family: Verdana; font-size: 11; color:#FFFFFF; border-bottom: 1px solid #7F7F7F; border-right: 1px solid #7F7F7F">
				<xsl:attribute name="width">
					11%
				</xsl:attribute>
				<xsl:attribute name="bgcolor">
					<!-- xsl:choose>
						<xsl:when test="$iColCount > 6 and  $iRowCount > 6">#FF6500</xsl:when>
						<xsl:when test="$iColCount > 4 and  $iRowCount > 4">#FF9A00</xsl:when>
						<xsl:when test="$iColCount > 2 and $iRowCount > 2">#FFCF00</xsl:when>
						<xsl:otherwise>#FFFFCE</xsl:otherwise>
					</xsl:choose-->
					<xsl:choose>
						<xsl:when test="$iColCount > 6 and  $iRowCount > 6">#594691</xsl:when>
						<xsl:when test="$iColCount > 4 and  $iRowCount > 4">#6953AA</xsl:when>
						<xsl:when test="$iColCount > 2 and  $iRowCount > 2">#9974FF</xsl:when>
						<xsl:otherwise>#B79CFF</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
				<!-- Call template that figures out content based on row and col -->
				<xsl:call-template name="doContent">
					<xsl:with-param name="iColCount" select="$iColCount"/>
					<xsl:with-param name="iRowCount" select="$iRowCount"/>
				</xsl:call-template>
				</td>
			</xsl:otherwise>
		</xsl:choose>

		<!-- Recursively call doCol to generate columns -->
		<xsl:if test="$iColCount &gt; 1">
			<xsl:call-template name="doCol">
				<xsl:with-param name="iColCount" select="$iColCount - 1"/>
				<xsl:with-param name="iRowCount" select="$iRowCount"/>
			</xsl:call-template>
		</xsl:if>

	</xsl:template>

	<xsl:template name="doContent">
		<xsl:param name="iColCount" />
		<xsl:param name="iRowCount" />

		<xsl:choose>
			<!-- header -->
			<xsl:when test="$iRowCount=9"><xsl:call-template name="headerInfo"><xsl:with-param name="iRank" select="$iColCount" /></xsl:call-template></xsl:when>
			<xsl:when test="$iColCount=9"><xsl:call-template name="headerInfo"><xsl:with-param name="iRank" select="$iRowCount" /></xsl:call-template></xsl:when>
			<!--xsl:when test="$iRowCount=9"><xsl:value-of select="$iColCount" /></xsl:when>
			<xsl:when test="$iColCount=9"><xsl:value-of select="$iRowCount" /></xsl:when-->
			<!-- content cell -->
			<xsl:otherwise>
				<table><xsl:value-of select="$whiteSpace"/><tr><td></td></tr>
				<xsl:variable name="MoreProj"/>
				<xsl:call-template name="iterProj">
					<xsl:with-param name="recordIndices" select="/*/afmTableGroup/dataSource/data/recordIndices/recordIndex[@recordIndex &gt; 1]"/>
					<xsl:with-param name="iColCount" select="$iColCount"/>
					<xsl:with-param name="iRowCount" select="$iRowCount"/>
					<xsl:with-param name="MoreProj" select="$MoreProj"/>
				</xsl:call-template>
				</table>
			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>

	<xsl:template name="iterProj">
		<xsl:param name="recordIndices" />
		<xsl:param name="projCount" select="0" />
		<xsl:param name="iColCount" />
		<xsl:param name="iRowCount" />
		<xsl:param name="MoreProj"/>

		<xsl:choose>

			<!-- First 10 projects that match the metrics for this cell -->
			<xsl:when test="$recordIndices and $projCount &lt; 10">

				<xsl:variable name="costLower"><xsl:call-template name="lowerBound"><xsl:with-param name="iRank" select="$iColCount" /></xsl:call-template></xsl:variable>
				<xsl:variable name="costUpper"><xsl:call-template name="upperBound"><xsl:with-param name="iRank" select="$iColCount" /></xsl:call-template></xsl:variable>
				<xsl:variable name="schedLower"><xsl:call-template name="lowerBound"><xsl:with-param name="iRank" select="$iRowCount" /></xsl:call-template></xsl:variable>
				<xsl:variable name="schedUpper"><xsl:call-template name="upperBound"><xsl:with-param name="iRank" select="$iRowCount" /></xsl:call-template></xsl:variable>

				<xsl:variable name="recNode" select="$recordsDataNode/record[position()=$recordIndices/@recordIndex]" />
				<!-- showProj will be true when a project(or work_package) meets the condition -->
                                <xsl:variable name="locale-decimal-separator" select="//locale/@decimalSeparator"/>
                                <xsl:variable name="nonlocal_cost_perf_index_value" select="translate($recNode/@brg_project_view.cost_perf_index_value.min, $locale-decimal-separator, '.')"/>
								<xsl:variable name="nonlocal_sched_perf_index_value" select="translate($recNode/@brg_project_view.sched_perf_index_value.min, $locale-decimal-separator, '.')"/>
                                <xsl:variable name="nonlocal_costLower" select="translate($costLower, $locale-decimal-separator, '.')"/>
                                <xsl:variable name="nonlocal_costUpper" select="translate($costUpper, $locale-decimal-separator, '.')"/>
                                <xsl:variable name="nonlocal_schedLower" select="translate($schedLower, $locale-decimal-separator, '.')"/>
                                <xsl:variable name="nonlocal_schedUpper" select="translate($schedUpper, $locale-decimal-separator, '.')"/>
				<xsl:variable name="showProj">
					<xsl:if test="
							number($nonlocal_cost_perf_index_value)  &gt;= number($nonlocal_costLower) and number($nonlocal_cost_perf_index_value) &lt; number($nonlocal_costUpper)
							and number($nonlocal_sched_perf_index_value) &gt;= number($nonlocal_schedLower) and number($nonlocal_sched_perf_index_value) &lt; number($nonlocal_schedUpper)
					">true</xsl:if>
				</xsl:variable>

				<xsl:choose>
					<xsl:when test="$showProj='true'">
                                	<!-- print project_id(work_pkg_id) and a link -->           	
					<xsl:variable name="activity_name"><xsl:value-of select="$membersNode/member[position()=$recordIndices/@recordIndex]/@name"/></xsl:variable>
					<xsl:variable name="projectId" select="$recNode/@brg_project_view.project_id.min"/>
                                        <xsl:variable name="absoluteAppPath_mm_aps" select="//preferences/@absoluteAppPath"/>
					<tr><td title="{$activity_name}" style="font-family: Verdana; color: #EEEEFF; text-decoration: underline; font-size: 11; cursor: pointer" onclick='DisplaySelected("{$absoluteAppPath_mm_aps}/schema/ab-products/project/management/monitor/ab-proj-{$ActivityType}-report.axvw","{$activity_name}","{$ActivityType}","{$projectId}")'>
					<xsl:value-of select="$membersNode/member[position()=$recordIndices/@recordIndex]/@name"/>
						</td></tr>
						<!-- call iterProj iteratively -->
						<xsl:call-template name="iterProj">
							<xsl:with-param name="recordIndices" select="$recordIndices/following-sibling::recordIndex[position()]"/>
							<xsl:with-param name="projCount" select="$projCount + number(boolean($showProj))"/>
							<xsl:with-param name="iColCount" select="$iColCount"/>
							<xsl:with-param name="iRowCount" select="$iRowCount"/>
							<xsl:with-param name="MoreProj" select="$MoreProj"/>
						</xsl:call-template>
					</xsl:when>
					<xsl:otherwise>

					<!-- call iterProj iteratively -->
					<xsl:call-template name="iterProj">
						<xsl:with-param name="recordIndices" select="$recordIndices/following-sibling::recordIndex[position()]"/>
						<xsl:with-param name="projCount" select="$projCount"/>
						<xsl:with-param name="iColCount" select="$iColCount"/>
						<xsl:with-param name="iRowCount" select="$iRowCount"/>
						<xsl:with-param name="MoreProj" select="$MoreProj"/>
						</xsl:call-template>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>

			<!-- process remaining data to get project_id's or work_pkg_id's -->
			<xsl:when test="$recordIndices">
				<xsl:variable name="costLower"><xsl:call-template name="lowerBound"><xsl:with-param name="iRank" select="$iColCount" /></xsl:call-template></xsl:variable>
				<xsl:variable name="costUpper"><xsl:call-template name="upperBound"><xsl:with-param name="iRank" select="$iColCount" /></xsl:call-template></xsl:variable>
				<xsl:variable name="schedLower"><xsl:call-template name="lowerBound"><xsl:with-param name="iRank" select="$iRowCount" /></xsl:call-template></xsl:variable>
				<xsl:variable name="schedUpper"><xsl:call-template name="upperBound"><xsl:with-param name="iRank" select="$iRowCount" /></xsl:call-template></xsl:variable>

				<xsl:variable name="recNode" select="$recordsDataNode/record[position()=$recordIndices/@recordIndex]" />
				<xsl:variable name="showProj">
				<xsl:if test="
							number($recNode/@brg_project_view.cost_perf_index_value.min)  >= number($costLower) and number($recNode/@brg_project_view.cost_perf_index_value.min) &lt; number($costUpper)
							and number($recNode/@brg_project_view.sched_perf_index_value.min) >= number($schedLower) and number($recNode/@brg_project_view.sched_perf_index_value.min) &lt; number($schedUpper)
					">true</xsl:if>
				</xsl:variable>

				<xsl:choose>
					<xsl:when test="$showProj='true'">
					<xsl:variable name="activity_name"><xsl:value-of select="$membersNode/member[position()=$recordIndices/@recordIndex]/@name"/></xsl:variable>
						<!-- append project_id(work_kg_id) so that all remaining project_id(work_pkg_id) that meets the condition can be sent to the javascript function -->
						<xsl:variable name="MoreProj" select="concat($MoreProj,'ABBCCCZBK',$activity_name,'ABBCCCZBK')"></xsl:variable>
						<xsl:call-template name="iterProj">
							<xsl:with-param name="recordIndices" select="$recordIndices/following-sibling::recordIndex[position()]"/>
							<xsl:with-param name="projCount" select="$projCount + number(boolean($showProj))"/>
							<xsl:with-param name="iColCount" select="$iColCount"/>
							<xsl:with-param name="iRowCount" select="$iRowCount"/>
							<xsl:with-param name="MoreProj" select="$MoreProj"/>
						</xsl:call-template>
					</xsl:when>

					<xsl:otherwise>
						<xsl:call-template name="iterProj">
							<xsl:with-param name="recordIndices" select="$recordIndices/following-sibling::recordIndex[position()]"/>
							<xsl:with-param name="projCount" select="$projCount"/>
							<xsl:with-param name="iColCount" select="$iColCount"/>
							<xsl:with-param name="iRowCount" select="$iRowCount"/>
							<xsl:with-param name="MoreProj" select="$MoreProj"/>
							</xsl:call-template>

					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<!-- print a link when there are more than 10 items -->
			<xsl:when test="$MoreProj">
				<xsl:choose>
					<xsl:when test="$ActivityType = 'project'">
						<xsl:variable name="more_proj" translatable="true">More Projects...</xsl:variable>
						<tr><td title="{$more_proj}" style="font-family: Verdana; font-size: 11; cursor: pointer; color: #EEEEFF; text-decoration: underline;" onclick='MoreProjects("{$ActivityType}","{$renderAction/@serialized}","{$afmInputsForm}","{$iRowCount}","{$iColCount}","{$MoreProj}")'><xsl:value-of select='$more_proj'/></td></tr>
					</xsl:when>
					<xsl:otherwise>
						<xsl:variable name="more_workpkg" translatable="true">More Work Packages...</xsl:variable>
						<tr><td title="{$more_workpkg}" style="font-family: Verdana; font-size: 11;cursor: pointer; color: #EEEEFF; text-decoration: underline;" onclick='MoreProjects("{$ActivityType}","{$renderAction/@serialized}","{$afmInputsForm}","{$iRowCount}","{$iColCount}","{$MoreProj}")'><xsl:value-of select='$more_workpkg'/></td></tr>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>

	<!-- Return MIN and MAX numbers for ends of ranges???? Makes doContent easier -->
	<xsl:template name="lowerBound">
		<xsl:param name="iRank" />
		<xsl:choose>
			<xsl:when test="$iRank=8">-1000000</xsl:when>
			<xsl:when test="$iRank=7">0.5</xsl:when>
			<xsl:when test="$iRank=6">0.75</xsl:when>
			<xsl:when test="$iRank=5">0.9</xsl:when>
			<xsl:when test="$iRank=4">1.0</xsl:when>
			<xsl:when test="$iRank=3">1.1</xsl:when>
			<xsl:when test="$iRank=2">1.25</xsl:when>
			<xsl:when test="$iRank=1">1.5</xsl:when>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="upperBound">
		<xsl:param name="iRank" />
		<xsl:choose>
			<xsl:when test="$iRank=8">0.5</xsl:when>
			<xsl:when test="$iRank=7">0.75</xsl:when>
			<xsl:when test="$iRank=6">0.9</xsl:when>
			<xsl:when test="$iRank=5">1.0</xsl:when>
			<xsl:when test="$iRank=4">1.1</xsl:when>
			<xsl:when test="$iRank=3">1.25</xsl:when>
			<xsl:when test="$iRank=2">1.5</xsl:when>
			<xsl:when test="$iRank=1">9000000</xsl:when>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="headerInfo">
		<xsl:param name="iRank" />
		<xsl:choose>
			<xsl:when test="$iRank=8">&lt; .5</xsl:when>
			<xsl:when test="$iRank=7">&gt;= .5 &lt; .75</xsl:when>
			<xsl:when test="$iRank=6">&gt;= .75  &lt; .9</xsl:when>
			<xsl:when test="$iRank=5">&gt;= .9  &lt; 1.0</xsl:when>
			<xsl:when test="$iRank=4">&gt;= 1.0  &lt; 1.1</xsl:when>
			<xsl:when test="$iRank=3">&gt;= 1.1  &lt; 1.25 </xsl:when>
			<xsl:when test="$iRank=2">&gt;= 1.25  &lt; 1.5</xsl:when>
			<xsl:when test="$iRank=1">&gt;= 1.5</xsl:when>
		</xsl:choose>
	</xsl:template>

	<xsl:include href="../../../../ab-system/xsl/common.xsl"/>
	<xsl:include href="../../../../ab-system/xsl/constants.xsl"/>
</xsl:stylesheet>

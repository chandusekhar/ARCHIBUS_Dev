<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html>	
		<title>
			<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
			<!-- to generate <title /> if there is no title in source XML -->
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->

			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js"><xsl:value-of select="$whiteSpace"/></script>
			
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/reports.js"><xsl:value-of select="$whiteSpace"/></script>
	
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve-detail.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<xsl:variable name="recordPKRM_ID" select="/*/afmTableGroup/dataSource/data/records/record/@rm.rm_id"/>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<xsl:choose>
				<xsl:when test="$recordPKRM_ID!=''">
					<script language="javascript">
						rm_reserve_bl_id='<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@rm.bl_id"/>';
						rm_reserve_fl_id='<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@rm.fl_id"/>';
						rm_reserve_rm_id='<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@rm.rm_id"/>';
						//used by edit form
						var rm_reserve_dv_id='<xsl:value-of select="//preferences/@em_dv_id"/>';
						var rm_reserve_dp_id='<xsl:value-of select="//preferences/@em_dp_id"/>';
					</script>

					<!--xsl:variable name="rm_reserve_action" select="/*/afmTableGroup/afmAction[@type='executeTransaction']"/>
					<xsl:variable name="rm_reserve_response" select="/*/afmTableGroup/afmAction[@type='render']"/-->
					<table class="showingTgrpTitleTable">
						<tr>
							<td align="center">
								<!--xsl:value-of select="/*/afmTableGroup/title"/-->
								<input class="AbActionButtonFormStdWidth" type="button" name="reserve" value="{//message[@name='reserve']}" onclick='makingRoomReservation("{//preferences/@em_em_id}")'/>
							</td>
						</tr>
					</table>

					<table  width="100%" valign="top">
						<!-- main section: going through all afmTableGroups to process their data -->
						<!-- don't use <xsl:for-each select="//afmTableGroup"> ("//" should never be used in <xsl:for-each>)-->
						<xsl:for-each select="/*/afmTableGroup">
							<xsl:call-template name="AfmTableGroups">
								<xsl:with-param name="afmTableGroup" select="."/>
								<xsl:with-param name="margin-left" select="0"/>
								<xsl:with-param name="level" select="1"/>
							</xsl:call-template>
						</xsl:for-each>
					</table>
				</xsl:when>
				<xsl:otherwise>
					<table align="center" valign="MIDDLE">
						<tr align="center" valign="MIDDLE">
							<td  align="center" valign="MIDDLE" style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;color:red">
								<p><xsl:value-of select="//message[@name='warning_message']"/></p>
							</td>
						</tr>
					</table>
				</xsl:otherwise>
			</xsl:choose>
			<!-- calling template common which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- template (AfmTableGroups) used in xslt -->
	<xsl:template name="AfmTableGroups">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
		<!-- checking if there is any afmTableGroup node in xml -->
		<xsl:if test="count($afmTableGroup) &gt; 0">
			<tr valign="top"><td valign="top">
				<!-- using a variable to hold the format of afmTableGroup: form or report (?? changable ??)-->
				<xsl:variable name="format" select="'table'"/>	
				<!-- calling template Report which is in reports/reports.xsl -->
				<xsl:call-template name="Report">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup[1]"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
					<xsl:with-param name="level" select="$level"/>
					<xsl:with-param name="format" select="$format"/>
				</xsl:call-template>
			</td></tr>

			<!-- recursive processing AfmTableGroups in child level -->
			<xsl:for-each select="$afmTableGroup/afmTableGroup">
				<xsl:call-template name="AfmTableGroups">
					<xsl:with-param name="afmTableGroup" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="level" select="$level+1"/>
				</xsl:call-template>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>
	
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	<xsl:include href="../../../ab-system/xsl/reports/reports.xsl" />
</xsl:stylesheet>
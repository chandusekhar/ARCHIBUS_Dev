<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-rm-change-dp-edit.xsl -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	
	<xsl:output method="html" indent="no" />

	<xsl:variable name="recordNode" select="/*/afmTableGroup/dataSource/data/records/record" />

	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>

		<head>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- Common javascript functions and variables -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- Claim/release button handlers -->
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-change-dp-rem-edit.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript">
				strDpChangeBl='<xsl:value-of select="$recordNode/@rm.bl_id" />';
				strDpChangeFl='<xsl:value-of select="$recordNode/@rm.fl_id" />';
				strDpChangeRm='<xsl:value-of select="$recordNode/@rm.rm_id" />';
				strDpChangeDv='<xsl:value-of select="//preferences/@em_dv_id" />';
				strDpChangeDp='<xsl:value-of select="//preferences/@em_dp_id" />';
			</script>
			
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	

			<xsl:call-template name="ReportTableFormat">
				<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup" />
				<xsl:with-param name="margin-left" select="0" />
				<xsl:with-param name="level" select="1" />
			</xsl:call-template>
			
			<!-- Place buttons here for claim/release actions -->
			<table align="center">
				<tr><td>
					<xsl:choose>
						<!-- First, check if the current user has valid email/dp macros -->
						<xsl:when test="//preferences/@em_em_id = '' or //preferences/@em_dv_id = '' or //preferences/@em_dp_id = ''">
							<xsl:value-of select="//message[@name='noMacros']" />
						</xsl:when>
						<!-- If this space is vacant, place a claim button here -->
						<xsl:when test="$recordNode/@rm.dp_id = ''">
							<xsl:variable name="spaceAction" select="//afmTableGroup/afmAction[position()=1]"/>
							<input class="AbActionButtonFormStdWidth" type="button"
								name="{$spaceAction/@name}" value="{$spaceAction/title}"
								onClick="ClaimSpace('{$spaceAction/@serialized}')" />
						</xsl:when>
						<!-- If this space is occupied by the user's department, place a release button here -->
						<xsl:when test="$recordNode/@rm.dv_id = //preferences/@em_dv_id and $recordNode/@rm.dp_id = //preferences/@em_dp_id">
							<xsl:variable name="spaceAction" select="//afmTableGroup/afmAction[position()=2]"/>
							<input class="AbActionButtonFormStdWidth" type="button"
								name="{$spaceAction/@name}" value="{$spaceAction/title}"
								onClick="ReleaseSpace('{$spaceAction/@serialized}')" />
						</xsl:when>
						<!-- Otherwise, let the user know the space is claimed by another department -->
						<xsl:otherwise>
							<xsl:value-of select="//message[@name='spaceClaimed']" />
						</xsl:otherwise>
					</xsl:choose>
				</td></tr>
			</table>
			
			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>

		</body>
		</html>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/reports/report-table-format.xsl" />
</xsl:stylesheet>

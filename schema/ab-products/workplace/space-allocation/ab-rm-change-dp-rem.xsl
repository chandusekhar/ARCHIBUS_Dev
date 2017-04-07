<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-rm-change-dp-rem.xsl -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="drawing_task" translatable="true">Drawing Task</xsl:variable>
	
	<xsl:output method="html" indent="no" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-change-dp-rem.js"><xsl:value-of select="$whiteSpace"/></script>

			<!-- overwrite javascript variable values -->
			<script language="javascript">
				abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
			</script>

		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	

			<!-- Generate our record list with buttons to launch map views -->
			<table cellspacing="0" border="1" class="AbDataTable"><form>
				<tr class="AbHeaderRecord">
					<td align="center">
						<xsl:value-of select="//message[@name='vacantDrawingLabel']"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
					<td align="center">
						<xsl:value-of select="//message[@name='dpDrawingLabel']"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
					<td>
						<xsl:value-of select="//message[@name='floorList']"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
				</tr>
				<xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">
					<xsl:variable name="Autocolor">
						<xsl:choose>
							<xsl:when test="position() mod 2 = 0">AbDataTableAutocolor</xsl:when>
							<xsl:otherwise>AbDataRecord</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<xsl:variable name="vacantImageID">IMG_V<xsl:value-of select="concat(./@rm.bl_id, ./@rm.fl_id)" /></xsl:variable>
					<xsl:variable name="claimedImageID">IMG_C<xsl:value-of select="concat(./@rm.bl_id, ./@rm.fl_id)" /></xsl:variable>
					<tr class="{$Autocolor}">
						<td align="center">
							<A href="#" onClick="ChangeItToActiveItem('{$vacantImageID}'); DoFloorplan('drawingFrame','ab-rm-change-dp-rem-vacant-drawing.axvw', '{./@rm.bl_id}', '{./@rm.fl_id}'); return false;">
								<img alt="{$drawing_task}" id="{$vacantImageID}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dwg.gif" border="0" />
							</A>
						</td>
						<td align="center">
							<A href="#" onClick="ChangeItToActiveItem('{$claimedImageID}'); DoFloorplan('drawingFrame','ab-rm-change-dp-rem-dp-drawing.axvw', '{./@rm.bl_id}', '{./@rm.fl_id}'); return false;">
								<img alt="{$drawing_task}" id="{$claimedImageID}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dwg.gif" border="0" />
							</A>
						</td>
						<td nowrap="1">
							<xsl:for-each select="@*">
								<!-- Show dashes between bl, fl, rm -->
								<xsl:if test="position() > 1 and string-length() > 0">-</xsl:if>
								<xsl:value-of select="."/>
							</xsl:for-each>
						</td>
					</tr>
				</xsl:for-each>
			</form></table>

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
</xsl:stylesheet>

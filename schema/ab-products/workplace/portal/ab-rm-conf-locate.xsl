<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-rm-conf-locate.xsl -->
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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-conf-locate.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	

			<!-- Generate our record list with buttons to launch map views -->
			<table cellspacing="0" border="1" class="AbDataTable"><form>
				<tr class="AbHeaderRecord">
					<td align="center">
						<xsl:value-of select="//message[@name='campusMap']"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
					<td align="center">
						<xsl:value-of select="//message[@name='floorMap']"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
					<xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field">
						<td>
							<xsl:value-of select="@singleLineHeading"/><br />
						</td>
					</xsl:for-each>
				</tr>
				<xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">
					<tr class="AbDataRecord">
						<td align="center">
							<A href="#" onClick="DoCampusMap('detailsFrame','ab-rm-conf-locate-campus-drawing.axvw', '{./@rm.bl_id}'); return false;">
								<img alt="{$drawing_task}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dwg.gif" border="0"/>
							</A>
						</td>
						<td align="center">
							<A href="#" onClick="DoRoomMap('detailsFrame','ab-rm-conf-locate-floor-drawing.axvw', '{./@rm.bl_id}', '{./@rm.fl_id}', '{./@rm.rm_id}'); return false;">
								<img alt="{$drawing_task}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dwg.gif" border="0"/>
							</A>
						</td>
						
						<xsl:variable name="Autocolor">
							<xsl:if test="position() mod 2 = 0">AbDataTableAutocolor</xsl:if>
						</xsl:variable>
						<xsl:for-each select="@*">
							<td class="{$Autocolor}" nowrap="1">
								<xsl:value-of select="."/>
							</td>
						</xsl:for-each>
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



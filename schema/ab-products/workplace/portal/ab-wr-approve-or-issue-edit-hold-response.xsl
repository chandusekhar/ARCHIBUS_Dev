<?xml version="1.0" encoding="utf-8"?>
<!-- ab-wr-approve-or-issue-edit-hold-response.xsl -->
<!-- XSLT for ab-wr-approve-or-issue-edit-hold-response.axvw -->
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
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/reports.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-request-response.js"><xsl:value-of select="$whiteSpace"/></script>
			
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<xsl:variable name="wr_tgrp" select="/*/afmTableGroup[position()=1]"/>
			<xsl:variable name="str_wr_id" select="$wr_tgrp/dataSource/data/records/record/@wr.wr_id"/>
			
				
			<table  width="100%" valign="top">
				<tr><td>
					<table valign="top" class="showingTgrpTitleTable">
						<tr><td>
							<xsl:text/><xsl:value-of select="concat($wr_tgrp/title,': ',$str_wr_id)"/>
						<hr /></td></tr>
					</table>
				</td></tr>
				<tr><td>
					<xsl:call-template name="ReportColumnFormat">
						<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
						<xsl:with-param name="margin-left" select="0"/>
						<xsl:with-param name="level" select="1"/>
						<xsl:with-param name="format" select="'column'"/>
					</xsl:call-template>
				</td></tr>
			</table>
			
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
	<xsl:template name="ReportColumnFormat">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
					
		
		<!-- write report data in column format -->
		<xsl:call-template name="ReportColumnContent">
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
		</xsl:call-template>
		
	</xsl:template>

	<!-- xsl template ReportColumnContent called in this xsl -->
	<xsl:template name="ReportColumnContent">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="field" select="$afmTableGroup/dataSource/data/fields/field"/>
		<xsl:variable name="record" select="$afmTableGroup/dataSource/data/records/record"/>
		<!-- user's setting for column number in view (default as 1) -->
		<xsl:variable name="columnNumber">
			<xsl:choose>
				<xsl:when test="$afmTableGroup/@column">
					<xsl:choose>
						<!-- cannot be less than 1 -->
						<xsl:when test="$afmTableGroup/@column &lt; 1">1</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$afmTableGroup/@column"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>1</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<!-- total number of visible fields -->
		<xsl:variable name="iTotalFields">
				<xsl:for-each select="$field">
					<xsl:if test="position()=last()">
						<xsl:value-of select="last()"/>
					</xsl:if>
				</xsl:for-each>
		</xsl:variable>

		<!--  looping each record -->
		<xsl:for-each select="$record">
			<!-- table for each row -->
			<table width="100%" valign="top">
				<tr>
					<!-- column detail -->
					<xsl:call-template name="columns">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="field" select="$field"/>
						<!-- select individual record -->
						<xsl:with-param name="record" select="."/>
						<xsl:with-param name="startingIndex" select="1"/>
						<xsl:with-param name="columnNumber" select="$columnNumber"/>
						<xsl:with-param name="iTotalFields" select="$iTotalFields"/>
					</xsl:call-template>
				</tr>
			</table>
		</xsl:for-each>
		
		<div>
			<!-- check if there is a report records max limitaion -->
			<xsl:variable name="moreRecords" select="$afmTableGroup/dataSource/data/records/@moreRecords"/>
			<xsl:if test="$moreRecords='true'">
				<table><tr>
					<td class="instruction" align="center" valign="top">
						<p><span translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data</span></p>
					</td>
				</tr></table>
			</xsl:if>
		</div>
	</xsl:template>

	<!-- xsl template columns called in this xsl -->
	<xsl:template name="columns">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="field"/>
		<xsl:param name="record"/>
		<xsl:param name="startingIndex"/>
		<xsl:param name="columnNumber"/>
		<xsl:param name="iTotalFields"/>

		<xsl:variable name="columnWidthData">
			<xsl:value-of select="ceiling(100 div $columnNumber)"/>
		</xsl:variable>
		<!-- check recursive columnNumber -->
		<xsl:if test="$columnNumber &gt; 0">	
			<!--control the fields in current column -->
			<xsl:variable name="iDividedNumber">
				<xsl:choose>
					<xsl:when test="($iTotalFields mod $columnNumber)=0">
						<xsl:value-of select="($iTotalFields div $columnNumber)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="ceiling($iTotalFields div $columnNumber)"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			
			<!-- current column -->
			<td valign="top" width="{$columnWidthData}%">
				<table width="100%" valign="top">
					<colgroup span="2">
						<col  width="25%" class="AbHeaderRecord"/>
						<col  width="75%" class="AbDataRecord"/>
						<xsl:for-each select="$record/@*">
							<xsl:variable name="positionIndex" select="position()"/>
							<xsl:variable name="FieldNode" select="$afmTableGroup/dataSource/data/fields/field[position()=$positionIndex]"/>
							<xsl:variable name="FieldName" select="$FieldNode/@singleLineHeading"/>
							<!-- control how many fields in this column -->
							<xsl:if test="($positionIndex &gt;= $startingIndex) and ($positionIndex &lt; ($startingIndex + $iDividedNumber))">
								<tr>
									<td nowrap="1">
										<xsl:value-of select="$FieldName"/>:<xsl:value-of select="$whiteSpace"/>
									</td>
									<td>
										<xsl:value-of select="."/>
									</td>
								</tr>
							</xsl:if>
						</xsl:for-each>
					</colgroup>
				</table>
			</td>
			<!-- recursive calling template -->
			<xsl:call-template name="columns">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="field" select="$field"/>
				<xsl:with-param name="record" select="$record"/>
				<xsl:with-param name="startingIndex" select="$startingIndex + $iDividedNumber"/>
				<xsl:with-param name="columnNumber" select="$columnNumber - 1"/>
				<xsl:with-param name="iTotalFields" select="$iTotalFields - $iDividedNumber"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	
</xsl:stylesheet>

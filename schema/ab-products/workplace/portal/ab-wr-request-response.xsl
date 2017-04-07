<?xml version="1.0" encoding="utf-8"?>
<!-- ab-wr-request-response.xsl -->
<!-- XSLT for ab-wr-request-response.axvw -->
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
		<body onload="onPageLoad()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">

			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>

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
			<form name="records_value_form">
				<xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record/@*">
					<input type="hidden" name="{name(.)}" value="{.}"/>
				</xsl:for-each>
			</form>
			<!-- calling template common which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
                        <span id="Subject" translatable="true" style="display:none">New Work Request:</span>
                        <form name="DataForm" ><xsl:value-of select="$whiteSpace"/>
				<input id="wr_id" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='wr_id']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.wr_id}"/>
				<input id="requestor"  name="{/*/afmTableGroup/dataSource/data/fields/field[@name='requestor']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.requestor}"/>
				<input id="phone"  name="{/*/afmTableGroup/dataSource/data/fields/field[@name='phone']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.phone}"/>
				<input  id="prob_type" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='prob_type']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.prob_type}"/>
				<input id="eq_id"  name="{/*/afmTableGroup/dataSource/data/fields/field[@name='eq_id']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.eq_id}"/>
				<input  id="bl_id" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='bl_id']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.bl_id}"/>
				<input  id="fl_id" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='fl_id']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.fl_id}"/>
				<input  id="rm_id" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='rm_id']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.rm_id}"/>
				<input  id="location" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='location']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.location}"/>
				<input  id="priority" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='priority']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.priority}"/>
				<input  id="date_requested" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='date_requested']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.date_requested}"/>
				<input  id="time_requested" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='time_requested']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.time_requested}"/>
				<input  id="description" name="{/*/afmTableGroup/dataSource/data/fields/field[@name='description']/@singleLineHeading}" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.description}"/>
			</form>
			<form name="hiddenEmailForm" enctype="text/plain" method="post"><xsl:value-of select="$whiteSpace"/>

			</form>
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
				<xsl:variable name="format" select="$afmTableGroup/@format"/>

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

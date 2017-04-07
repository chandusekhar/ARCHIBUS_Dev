<?xml version="1.0" encoding="utf-8"?>
<!-- ab-em-setup-or-move-edit-respone.xsl -->
<!-- XSLT for ab-em-setup-or-move-edit-respone.axvw -->
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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-em-setup-or-move-edit-respone.js"><xsl:value-of select="$whiteSpace"/></script>

			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<body onload="onPageLoad()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<script language="javascript">
                               <xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field">
					<xsl:variable name="field_name" select="concat(@table,'.',@name)"/>
					<xsl:variable name="field_singleLineHeading" select="@singleLineHeading"/>
					arrFieldsInformation["<xsl:value-of select='$field_name'/>"]="<xsl:value-of select='$field_singleLineHeading'/>";
                                </xsl:for-each>
                                arrFieldsValues["mo.mo_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.mo_id'/>";
                                arrFieldsValues["mo.em_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.em_id'/>";
                                arrFieldsValues["mo.requestor"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.requestor'/>";
                                arrFieldsValues["mo.mp_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.mp_id'/>";
                                arrFieldsValues["mo.from_bl_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.from_bl_id'/>";
                                arrFieldsValues["mo.from_rm_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.from_rm_id'/>";
                                arrFieldsValues["mo.from_fl_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.from_fl_id'/>";
                                arrFieldsValues["mo.to_bl_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.to_bl_id'/>";
                                arrFieldsValues["mo.to_fl_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.to_fl_id'/>";
                                arrFieldsValues["mo.to_rm_id"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.to_rm_id'/>";
                                arrFieldsValues["mo.date_requested"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.date_requested'/>";
                                arrFieldsValues["mo.time_requested"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.time_requested'/>";
                                arrFieldsValues["mo.date_to_perform"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.date_to_perform'/>";
                                arrFieldsValues["mo.time_to_perform"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.time_to_perform'/>";
                                arrFieldsValues["mo.date_issued"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.date_issued'/>";
                                arrFieldsValues["mo.time_issued"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.time_issued'/>";
                                arrFieldsValues["mo.description"]="<xsl:value-of select='/*/afmTableGroup/dataSource/data/records/record/@mo.description'/>";
			</script>

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
                                <input name="mo.mo_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.mo_id}"/>
				<input name="mo.em_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.em_id}"/>
				<input name="mo.requestor" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.requestor}"/>
				<input name="mo.mp_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.mp_id}"/>
				<input name="mo.from_bl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.from_bl_id}"/>
				<input name="mo.from_fl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.from_fl_id}"/>
				<input name="mo.from_rm_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.from_rm_id}"/>
				<input name="mo.to_bl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.to_bl_id}"/>
				<input name="mo.to_fl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.to_fl_id}"/>
				<input name="mo.to_rm_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.to_rm_id}"/>
				<input name="mo.date_requested" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.date_requested}"/>
				<input name="mo.time_requested" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.time_requested}"/>
				<input name="mo.date_to_perform" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.date_to_perform}"/>
				<input name="mo.time_to_perform" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.time_to_perform}"/>
				<input name="mo.date_issued" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.date_issued}"/>
				<input name="mo.time_issued" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.time_issued}"/>
				<input name="mo.description" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.description}"/>
			</table>
			<!-- calling template common which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
                        <form name="records_value_form" ><xsl:value-of select="$whiteSpace"/>
				<input name="mo.mo_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.mo_id}"/>
				<input name="mo.em_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.em_id}"/>
				<input name="mo.requestor" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.requestor}"/>
				<input name="mo.mp_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.mp_id}"/>
				<input name="mo.from_bl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.from_bl_id}"/>
				<input name="mo.from_fl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.from_fl_id}"/>
				<input name="mo.from_rm_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.from_rm_id}"/>
				<input name="mo.to_bl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.to_bl_id}"/>
				<input name="mo.to_fl_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.to_fl_id}"/>
				<input name="mo.to_rm_id" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.to_rm_id}"/>
				<input name="mo.date_requested" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.date_requested}"/>
				<input name="mo.time_requested" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.time_requested}"/>
				<input name="mo.date_to_perform" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.date_to_perform}"/>
				<input name="mo.time_to_perform" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.time_to_perform}"/>
				<input name="mo.date_issued" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.date_issued}"/>
				<input name="mo.time_issued" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.time_issued}"/>
				<input name="mo.description" type="hidden" value="{/*/afmTableGroup/dataSource/data/records/record/@mo.description}"/>
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

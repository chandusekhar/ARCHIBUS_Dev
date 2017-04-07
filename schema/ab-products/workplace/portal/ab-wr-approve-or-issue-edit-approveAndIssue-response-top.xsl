<?xml version="1.0" encoding="utf-8"?>
<!-- ab-wr-approve-or-issue-edit-approveAndIssue-response-top.xsl -->
<!-- XSLT for ab-wr-approve-or-issue-edit-approveAndIssue-response-top.axvw -->
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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-approve-or-issue-edit-approveAndIssue-response-top.js"><xsl:value-of select="$whiteSpace"/></script>
			
		</head>
		<xsl:variable name="executeTransaction" select="//afmAction[@type='executeTransaction']/@serialized"/>
		<xsl:variable name="wr_tgrp" select="/*/afmTableGroup[position()=1]"/>
		<xsl:variable name="wo_tgrp" select="/*/afmTableGroup[position()=2]"/>
		<xsl:variable name="str_wr_id" select="$wr_tgrp/dataSource/data/records/record/@wr.wr_id"/>
		<xsl:variable name="str_wo_id" select="$wo_tgrp/dataSource/data/records/record/@wo.wo_id"/>
		<body class="body"  onload='preparedOnLoad("{$executeTransaction}","{$str_wr_id}","{$str_wo_id}")' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<table align="center" valign="top">
				<tr><td style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;color:red">
					<p><xsl:value-of select="//message[@name='wait']"/></p>
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
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<!--xsl:include href="../../../ab-system/xsl/locale.xsl" /-->
</xsl:stylesheet>

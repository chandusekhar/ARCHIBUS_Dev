<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle actions -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- handle OK|Cancel actions: parameters OK & CANCEL contains OK and Cancel action nodes -->
	<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
	<xsl:template name="ok-and-cancel">
		<xsl:param name="OK"/>
		<xsl:param name="CANCEL"/>
		<xsl:param name="TYPE"/>
		<xsl:param name="newWindowSettings"/>
		
		<table  align="center" class="bottomActionsTable">
			<tr><td>
				<table align="center"><tr align="center">
					<xsl:if test="$TYPE=1">
						<td><input  class="AbActionButtonFormStdWidth" type="button" value="{$OK/title}" title="{$OK/tip}" onclick='sendingDataFromHiddenForm("","{$OK/@serialized}","{$OK/@frame}","{$OK/subFrame/@name}",true,"{$newWindowSettings}")'/></td>
						<td><input  class="AbActionButtonFormStdWidth" type="button" value="{$CANCEL/title}" title="{$CANCEL/tip}" onclick='sendingDataFromHiddenForm("","{$CANCEL/@serialized}","{$CANCEL/@frame}","{$CANCEL/subFrame/@name}",false,"{$newWindowSettings}")'/></td>
					</xsl:if>
					<xsl:if test="$TYPE=0">
						<td nowrap="1" valign="bottom" class="AbActionButtonForm"><A style="cursor:hand" title="{$OK/title}" href="#" onclick='sendingDataFromHiddenForm("","{$OK/@serialized}","{$OK/@frame}","{$OK/subFrame/@name}",true,"{$newWindowSettings}"); return false;'><xsl:value-of select="$OK/title"/></A></td>
						<td nowrap="1" valign="bottom" class="AbActionButtonForm"><A style="cursor:hand" title="{$CANCEL/title}" href="#" onclick='sendingDataFromHiddenForm("","{$CANCEL/@serialized}","{$CANCEL/@frame}","{$CANCEL/subFrame/@name}",false,"{$newWindowSettings}"); return false;'><xsl:value-of select="$CANCEL/title"/></A></td>
					</xsl:if>
				</tr></table>
			</td></tr>
		</table>
	</xsl:template>
	<!-- handle actions: parameter ACTIONS contains all actions -->
	<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
	<xsl:template name="all-actions">
		<xsl:param name="ACTIONS"/>
		<xsl:param name="TYPE"/>
		<xsl:param name="newWindowSettings"/>
		<table   align="center" class="bottomActionsTable">
			<tr  align="center"><td  align="center">
				<table  align="center" ><tr  align="center">
					<xsl:if test="$TYPE=1">
						<xsl:for-each select="$ACTIONS">
							<td><input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",true,"{$newWindowSettings}")'/></td>
						</xsl:for-each>
					</xsl:if>
					<xsl:if test="$TYPE=0">
						<xsl:for-each select="$ACTIONS">
							<td nowrap="1" valign="bottom" class="AbActionButtonForm"><A style="cursor:hand" title="{title}" href="#" onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",false,"{$newWindowSettings}"); return false;'><xsl:value-of select="title"/></A></td>
						</xsl:for-each>
					</xsl:if>
				</tr></table>
			</td></tr>
		</table>
	</xsl:template>
</xsl:stylesheet>



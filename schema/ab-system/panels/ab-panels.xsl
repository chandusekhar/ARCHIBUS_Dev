<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-01-30 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:key name="panel_fields_array" match="panel/fields/field" use="@id"/>
    <xsl:template name="panels">
        <xsl:param name="panels"/>
        <xsl:param name="afmTableGroup_id"/>
        <xsl:param name="afmTableGroup"/>
        <xsl:param name="afmTableGroup_tabIndex"/>

        <xsl:for-each select="$panels/panel">
            <xsl:variable name="tabIndex" select="$afmTableGroup_tabIndex + (position() * 1000)"/>
            <xsl:choose>
                <xsl:when test="@type='ui' or count(ui) &gt; 0">
                     <xsl:call-template name="panel_ui">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="type" select="'form'"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                     </xsl:call-template>
                </xsl:when>
                <xsl:when test="@type='form'">
                     <xsl:call-template name="panel_form">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="type" select="'form'"/>
                        <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                        <xsl:with-param name="isConsole" select="'false'"/>
                     </xsl:call-template>
                </xsl:when>
                <xsl:when test="@type='report' or @type='grid'">
                    <xsl:call-template name="panel_report">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                     </xsl:call-template>
                </xsl:when>
                <xsl:when test="@type='console'">
                    <xsl:call-template name="panel_console">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                     </xsl:call-template>
                </xsl:when>
               <xsl:when test="@type='tree'">
                 <!-- only build the tree for the top level, all the children node will be generated dynamically
                      when user clicks on the parent node. -->
                  <xsl:if test="./@level='0'">
                    <xsl:call-template name="panel_tree">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="panels" select="$panels"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                        <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                        <xsl:with-param name="type" select="@type"/>
                     </xsl:call-template>
                  </xsl:if>
                </xsl:when>
               <xsl:when test="@type='hierTree'">
                 <!-- for hierachy trees, we assume there is only one datasource and one panel definiton -->
                 <!-- we only uses hierachy tree's top panel fields and actions -->
                 <xsl:call-template name="panel_tree">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="panels" select="$panels"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                        <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                        <xsl:with-param name="type" select="@type"/>
                     </xsl:call-template>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:call-template name="panel_custom_control">
                        <xsl:with-param name="panel" select="."/>
                        <xsl:with-param name="panel_id" select="$afmTableGroup_id"/>
                        <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                        <xsl:with-param name="tabIndex" select="$tabIndex"/>
                     </xsl:call-template>
                </xsl:otherwise>
                </xsl:choose>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="panel_custom_control">
        <xsl:param name="panel"/>
        <xsl:param name="panel_id"/>
        <xsl:param name="tabIndex"/>

        <xsl:variable name="panelName">
            <xsl:choose>
                <xsl:when test="$panel/@name!=''">
                    <xsl:value-of select="$panel/@name"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$panel/@id"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="controlType">
            <xsl:value-of select="$panel/@controlType"/>
        </xsl:variable>


        <xsl:if test="$panel/title!='' or count($panel/afmAction) &gt; 0">
            <xsl:variable name="useHeaderClass">
                <xsl:choose>
                    <xsl:when test="$panel/@headerClass!=''">
                        <xsl:value-of select="$panel/@headerClass"/>
                    </xsl:when>
                    <xsl:otherwise>panelHeader</xsl:otherwise>
                </xsl:choose>
            </xsl:variable>

            <xsl:call-template name="afmTableGroup_header_footer_handler">
                <xsl:with-param name="name" select="$panelName"/>
                <xsl:with-param name="title" select="$panel/title"/>
                <xsl:with-param name="actions" select="$panel/afmAction"/>
                <xsl:with-param name="form_name" select="$panel_id"/>
                <xsl:with-param name="actions_style" select="'text-align:right;'"/>
                <xsl:with-param name="table_class" select="$useHeaderClass"/>
                <xsl:with-param name="showActions" select="'true'"/>
                <xsl:with-param name="tabIndex" select="$tabIndex"/>
            </xsl:call-template>
        </xsl:if>

        <xsl:element name="div">
            <xsl:attribute name="id"><xsl:value-of select="$panel/@id"/></xsl:attribute>
            <xsl:attribute name="style"><xsl:value-of select="$panel/@style"/></xsl:attribute>
            <xsl:value-of select="$whiteSpace"/>
        </xsl:element>
        <script language="javascript">
            system_form_onload_handlers.push(
            function() {
                var configObject = new AFM.view.ConfigObject();
                <xsl:for-each select="$panel/options/attribute::*">
                    configObject['<xsl:value-of select="name(.)"/>'] = '<xsl:value-of select="."/>';
                </xsl:for-each>
                var control = new <xsl:value-of select="$controlType"/>('<xsl:value-of select="$panel/@id"/>', configObject);
            });
        </script>

    </xsl:template>

    <xsl:template name="panel_ui">
        <xsl:param name="panel"/>
        <xsl:param name="panel_id"/>
        <xsl:param name="type"/>
        <xsl:param name="tabIndex"/>

        <xsl:variable name="panelName">
            <xsl:choose>
                <xsl:when test="$panel/@name!=''">
                    <xsl:value-of select="$panel/@name"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$panel/@id"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:if test="$panel/title!='' or count($panel/afmAction) &gt; 0">
            <xsl:variable name="useHeaderClass">
                <xsl:choose>
                    <xsl:when test="$panel/@headerClass!=''">
                        <xsl:value-of select="$panel/@headerClass"/>
                    </xsl:when>
                    <xsl:otherwise>panelHeader</xsl:otherwise>
                </xsl:choose>
            </xsl:variable>

            <xsl:call-template name="afmTableGroup_header_footer_handler">
                <xsl:with-param name="name" select="$panelName"/>
                <xsl:with-param name="title" select="$panel/title"/>
                <xsl:with-param name="actions" select="$panel/afmAction"/>
                <xsl:with-param name="form_name" select="$panel_id"/>
                <xsl:with-param name="actions_style" select="'text-align:right;'"/>
                <xsl:with-param name="table_class" select="$useHeaderClass"/>
                <xsl:with-param name="showActions" select="'true'"/>
                <xsl:with-param name="tabIndex" select="$tabIndex"/>
            </xsl:call-template>
        </xsl:if>

        <xsl:for-each select="ui/*">
            <xsl:copy-of select="."/>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="helper_replace_eventHandlerPreParameters">
        <xsl:param name="eventHandler"/>
        <xsl:param name="serialized"/>
        <xsl:param name="form"/>
        <xsl:param name="rowPKs"/>
        <xsl:param name="frame"/>

        <xsl:variable name="eventHandler1">
            <xsl:choose>
                <xsl:when test="contains($eventHandler,'#form#')">
                    <xsl:variable name="str1" select="substring-before($eventHandler,'#form#')"/>
                    <xsl:variable name="str2" select="substring-after($eventHandler,'#form#')"/>
                    <xsl:value-of select="concat($str1,$form,$str2)"/>
                </xsl:when>
                <xsl:otherwise><xsl:value-of select="$eventHandler"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="eventHandler2">
            <xsl:choose>
                <xsl:when test="contains($eventHandler1,'#serialized#')">
                    <xsl:variable name="str1" select="substring-before($eventHandler1,'#serialized#')"/>
                    <xsl:variable name="str2" select="substring-after($eventHandler1,'#serialized#')"/>
                    <xsl:value-of select="concat($str1,$serialized,$str2)"/>
                </xsl:when>
                <xsl:otherwise><xsl:value-of select="$eventHandler1"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="eventHandler3">
            <xsl:choose>
                <xsl:when test="contains($eventHandler2,'#row#')">
                    <xsl:variable name="str1" select="substring-before($eventHandler2,'#row#')"/>
                    <xsl:variable name="str2" select="substring-after($eventHandler2,'#row#')"/>
                    <xsl:value-of select="concat($str1,$rowPKs,$str2)"/>
                </xsl:when>
                <xsl:otherwise><xsl:value-of select="$eventHandler2"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="eventHandler4">
            <xsl:choose>
                <xsl:when test="contains($eventHandler3,'#frame#')">
                    <xsl:variable name="str1" select="substring-before($eventHandler3,'#frame#')"/>
                    <xsl:variable name="str2" select="substring-after($eventHandler3,'#frame#')"/>
                    <xsl:value-of select="concat($str1,$frame,$str2)"/>
                </xsl:when>
                <xsl:otherwise><xsl:value-of select="$eventHandler3"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="$eventHandler4"/>
    </xsl:template>

    <xsl:template name="helper_afmAction">
        <xsl:param name="target"/>
        <xsl:param name="form"/>
        <xsl:param name="afmAction"/>
        <xsl:param name="defaultJSEventHandlerName"/>
        <xsl:param name="bData"/>
        <xsl:param name="buttonClass"/>
        <xsl:param name="buttonStyle"/>
        <xsl:param name="clientData"/>
        <xsl:param name="onclick"/>
        <xsl:param name="rowPKs"/>
        <xsl:param name="tabIndex"/>

        <xsl:variable name="useTarget">
            <xsl:choose>
                <xsl:when test="$target!=''"><xsl:value-of select="$target"/></xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <xsl:when test="$afmAction/@target!=''"><xsl:value-of select="$afmAction/@target"/></xsl:when>
                        <xsl:otherwise><xsl:value-of select="$afmAction/@frame"/></xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="hasData">
            <xsl:choose>
                <xsl:when test="$bData"><xsl:value-of select="$bData"/></xsl:when>
                <xsl:otherwise>true</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="useButtonClass">
            <xsl:choose>
                <xsl:when test="$afmAction/@class!=''"><xsl:value-of select="$afmAction/@class"/></xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <xsl:when test="$buttonClass"><xsl:value-of select="$buttonClass"/></xsl:when>
                        <xsl:otherwise>panelButton</xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="id" select="$afmAction/@id"/>
        <xsl:variable name="icon" select="$afmAction/icon"/>
        <xsl:variable name="title" select="$afmAction/title"/>
        <xsl:variable name="serialized" select="$afmAction/@serialized"/>       
        <xsl:variable name="useOnclick">
            <xsl:choose>
                <xsl:when test="$onclick!=''"><xsl:value-of select="$onclick"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="$afmAction/@onclick"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="select_value" translatable="true">Select Value</xsl:variable>
        <xsl:copy-of select="$afmAction/script"/>

        <xsl:choose>
            <xsl:when test="count($icon) &gt; 0">
                <input type="image" class="selectValue_Button" hspace="1" border="0" style="cursor:hand;" src="{$icon/@request}" alt="{title}" title="{title}" id="{$id}" tabIndex_off="{$tabIndex}" onkeypress="mapKeyPressToClick(event, this)">
                    <!-- if the action contains commands, do not attach default JS event handler -->
                    <xsl:if test="count($afmAction/command) = 0">
                    <xsl:attribute name="onclick">
                        <xsl:choose>
                            <xsl:when test="$useOnclick!=''">
                                <xsl:variable name="eventHandler">
                                    <xsl:call-template name="helper_replace_eventHandlerPreParameters">
                                        <xsl:with-param name="eventHandler" select="$useOnclick"/>
                                        <xsl:with-param name="form" select="$form"/>
                                        <xsl:with-param name="serialized" select="$serialized"/>
                                        <xsl:with-param name="rowPKs" select="$rowPKs"/>
                                        <xsl:with-param name="frame" select="$afmAction/@frame"/>
                                    </xsl:call-template>
                                </xsl:variable>
                                <xsl:value-of select="concat($eventHandler,';return false;')"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:choose>
                                    <xsl:when test="$defaultJSEventHandlerName!=''"><xsl:value-of select="concat('defaultJSEventHandlerName(','$useTarget','$form','$serialized',')')"/></xsl:when>
                                    <xsl:otherwise>
                                        <xsl:choose>
                                            <xsl:when test="$clientData!=''">sendingAfmActionRequestWithClientDataXMLString2Server('<xsl:value-of select="$useTarget"/>','<xsl:value-of select="$serialized"/>','<xsl:value-of select="$clientData"/>');return false;</xsl:when>
                                            <xsl:otherwise>sendingDataFromHiddenForm('','<xsl:value-of select="$serialized"/>','<xsl:value-of select="$useTarget"/>','','<xsl:value-of select="$hasData"/>','');return false;</xsl:otherwise>
                                        </xsl:choose>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:attribute>
                    </xsl:if>
                </input>
            </xsl:when>
            <xsl:otherwise>
                <!-- Ellipses only -->
                <xsl:if test="$title='...'">
                    <input type="image" class="selectValue_Button" alt="{$select_value}" title="{$select_value}" border="0" src="{$abSchemaSystemGraphicsFolder}/ab-icons-ellipses.gif" id="{$id}" onkeypress="mapKeyPressToClick(event, this)">
                        <!-- if the action contains commands, do not attach default JS event handler -->
                        <xsl:if test="count($afmAction/command) = 0">
                        <xsl:attribute name="onclick">
                            <xsl:choose>
                                <xsl:when test="$useOnclick!=''">
                                    <xsl:variable name="eventHandler">
                                        <xsl:call-template name="helper_replace_eventHandlerPreParameters">
                                            <xsl:with-param name="eventHandler" select="$useOnclick"/>
                                            <xsl:with-param name="form" select="$form"/>
                                            <xsl:with-param name="serialized" select="$serialized"/>
                                            <xsl:with-param name="rowPKs" select="$rowPKs"/>
                                            <xsl:with-param name="frame" select="$afmAction/@frame"/>
                                        </xsl:call-template>
                                    </xsl:variable>
                                    <xsl:value-of select="concat($eventHandler,';return false;')"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:choose>
                                        <xsl:when test="$defaultJSEventHandlerName!=''"><xsl:value-of select="concat('defaultJSEventHandlerName(','$useTarget','$form','$serialized',')')"/></xsl:when>
                                        <xsl:otherwise>
                                            <xsl:choose>
                                                <xsl:when test="$clientData!=''">sendingAfmActionRequestWithClientDataXMLString2Server('<xsl:value-of select="$useTarget"/>','<xsl:value-of select="$serialized"/>','<xsl:value-of select="$clientData"/>');return false;</xsl:when>
                                                <xsl:otherwise>sendingDataFromHiddenForm('','<xsl:value-of select="$serialized"/>','<xsl:value-of select="$useTarget"/>','','<xsl:value-of select="$hasData"/>','');return false;</xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:attribute>
                        </xsl:if>
                    </input>
                </xsl:if>
                <xsl:if test="$title!='...'">
                    <xsl:choose>
                        <xsl:when test="contains($useButtonClass,'panel')">
                            <span class="{$useButtonClass}"><hr />
                                <input type="image" class="panelButton_input" value="{title}" title="{title}" id="{$id}" tabIndex_off="{$tabIndex}" onkeypress="mapKeyPressToClick(event, this)">
                                    <xsl:choose>
                                        <xsl:when test="count($afmAction/icon) &gt; 0">
                                            <xsl:attribute name="type">
                                                <xsl:value-of select="'image'"/>
                                            </xsl:attribute>
                                            <xsl:attribute name="src">
                                                <xsl:value-of select="$afmAction/icon/@request"/>
                                            </xsl:attribute>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:attribute name="type">
                                                <xsl:value-of select="'button'"/>
                                            </xsl:attribute>
                                        </xsl:otherwise>
                                    </xsl:choose>

                                <!-- if the action contains commands, do not attach default JS event handler -->
                                <xsl:if test="count($afmAction/command) = 0">
                                <xsl:attribute name="onclick">
                                    <xsl:choose>
                                        <xsl:when test="$useOnclick!=''">
                                            <xsl:variable name="eventHandler">
                                                <xsl:call-template name="helper_replace_eventHandlerPreParameters">
                                                    <xsl:with-param name="eventHandler" select="$useOnclick"/>
                                                    <xsl:with-param name="form" select="$form"/>
                                                    <xsl:with-param name="serialized" select="$serialized"/>
                                                    <xsl:with-param name="rowPKs" select="$rowPKs"/>
                                                    <xsl:with-param name="frame" select="$afmAction/@frame"/>
                                                </xsl:call-template>
                                            </xsl:variable>
                                            <xsl:value-of select="concat($eventHandler,';return false;')"/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:choose>
                                                <xsl:when test="$defaultJSEventHandlerName!=''"><xsl:value-of select="concat('defaultJSEventHandlerName(','$useTarget','$form','$serialized',');return false;')"/></xsl:when>
                                                <xsl:otherwise>sendingDataFromHiddenForm('','<xsl:value-of select="$serialized"/>','<xsl:value-of select="$useTarget"/>','','<xsl:value-of select="$hasData"/>','');return false;</xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:attribute>
                                </xsl:if>
                                </input>
                            </span>
                        </xsl:when>
                        <xsl:otherwise>
                            <input class="{$useButtonClass}" value="{title}" title="{title}" id="{$id}" tabIndex_off="{$tabIndex}" onkeypress="mapKeyPressToClick(event, this)">
                                <xsl:choose>
                                    <xsl:when test="count($afmAction/icon) &gt; 0">
                                        <xsl:attribute name="type"><xsl:value-of select="'image'"/></xsl:attribute>
                                        <xsl:attribute name="src"><xsl:value-of select="$afmAction/icon/@request"/></xsl:attribute>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:attribute name="type"><xsl:value-of select="'button'"/></xsl:attribute>
                                    </xsl:otherwise>
                                </xsl:choose>
                    <!-- if the action contains commands, do not attach default JS event handler -->
                    <xsl:if test="count($afmAction/command) = 0">
                    <xsl:attribute name="onclick">
                        <xsl:choose>
                            <xsl:when test="$useOnclick!=''">
                                <xsl:variable name="eventHandler">
                                    <xsl:call-template name="helper_replace_eventHandlerPreParameters">
                                        <xsl:with-param name="eventHandler" select="$useOnclick"/>
                                        <xsl:with-param name="form" select="$form"/>
                                        <xsl:with-param name="serialized" select="$serialized"/>
                                        <xsl:with-param name="rowPKs" select="$rowPKs"/>
                                        <xsl:with-param name="frame" select="$afmAction/@frame"/>
                                    </xsl:call-template>
                                </xsl:variable>
                                <xsl:value-of select="concat($eventHandler,';return false;')"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:choose>
                                    <xsl:when test="$defaultJSEventHandlerName!=''"><xsl:value-of select="concat('defaultJSEventHandlerName(','$useTarget','$form','$serialized',');return false;')"/></xsl:when>
                                    <xsl:otherwise>sendingDataFromHiddenForm('','<xsl:value-of select="$serialized"/>','<xsl:value-of select="$useTarget"/>','','<xsl:value-of select="$hasData"/>','');return false;</xsl:otherwise>
                                </xsl:choose>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:attribute>
                    </xsl:if>
                </input>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="addActionCommands">
        <xsl:param name="panel"/>
        <xsl:param name="controlId"/>
        <xsl:for-each select="$panel/descendant::afmAction">
            <xsl:if test="count(./command) &gt; 0">
                    var commands = [
            <xsl:for-each select="./command">
                        {
                <xsl:for-each select="attribute::*">
                    <xsl:value-of select="name(.)"/>:'<xsl:value-of select="."/>',
                </xsl:for-each>
                            parentPanelId:'<xsl:value-of select="$controlId"/>'
                        },
            </xsl:for-each>
                        null];
                    control.addButton('<xsl:value-of select="./@id"/>', commands);
            </xsl:if>
        </xsl:for-each>
    <xsl:if test="$panel/@type='grid' and //preferences/pdfButton/@show='true'">
    var export_pdf_button = $("Export:PDF", false);
    if(export_pdf_button!=null){
        var commands = [{type:'exportPanel',outputType:'pdf',panelId:'<xsl:value-of select="$panel/@id"/>',openDialog:'true',parentPanelId:'<xsl:value-of select="$controlId"/>'}, null];
        control.addButton('Export:PDF', commands);
        export_pdf_button.style.display="";
    }
    </xsl:if>
    <xsl:if test="$panel/@type='grid' and //preferences/export/excel/button/@show='true'">
    var export_xls_button = $("Export:EXCEL", false);
    if(export_xls_button!=null){
        var commands = [{type:'exportPanel',outputType:'xls',panelId:'<xsl:value-of select="$panel/@id"/>',openDialog:'true',parentPanelId:'<xsl:value-of select="$controlId"/>'}, null];
        control.addButton('Export:EXCEL', commands);
        export_xls_button.style.display="";
    }
    </xsl:if>
    </xsl:template>

</xsl:stylesheet>

/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    export const ganttProperties = {
        barColor: {
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: "barColor", propertyName: "defaultColor" },
            fillColor: <DataViewObjectPropertyIdentifier>{ objectName: "barColor", propertyName: "fillColor" },
            showall: <DataViewObjectPropertyIdentifier>{ objectName: "barColor", propertyName: "showall" }
        },
        categoryColumnsWidth: {
            categoryLength: <DataViewObjectPropertyIdentifier>{ objectName: "categoryColumnsWidth", propertyName: "categoryLength" },
            width: <DataViewObjectPropertyIdentifier>{ objectName: "categoryColumnsWidth", propertyName: "width" }
        },
        columnHeader: {
            columnOutline: <DataViewObjectPropertyIdentifier>{ objectName: "columnHeader", propertyName: "columnOutline" },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: "columnHeader", propertyName: "fill" },
            fill2: <DataViewObjectPropertyIdentifier>{ objectName: "columnHeader", propertyName: "fill2" },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: "columnHeader", propertyName: "fontFamily" },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: "columnHeader", propertyName: "fontSize" }

        },
        datatype: {
            type: <DataViewObjectPropertyIdentifier>{ objectName: "datatype", propertyName: "type" }
        },
        dateType: {
            enableToday: <DataViewObjectPropertyIdentifier>{ objectName: "dateType", propertyName: "enableToday" },
            type: <DataViewObjectPropertyIdentifier>{ objectName: "dateType", propertyName: "type" }
        },
        displayRatio: {
            ratio: <DataViewObjectPropertyIdentifier>{ objectName: "displayRatio", propertyName: "ratio" }
        },
        general: {
            groupTasks: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "groupTasks" }
        },
        kpiColumnType: {
            indicator: <DataViewObjectPropertyIdentifier>{ objectName: "dataPosition", propertyName: "indicator" },
            type: <DataViewObjectPropertyIdentifier>{ objectName: "dataPosition", propertyName: "type" },
            value: <DataViewObjectPropertyIdentifier>{ objectName: "dataPosition", propertyName: "value" }
        },
        legend: {
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "fontSize" },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "labelColor" },
            position: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "position" },
            show: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "show" },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "showTitle" },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "titleText" }
        },
        persistExpandCollapseState: {
            expandCollapseState: <DataViewObjectPropertyIdentifier>{objectName: "persistExpandCollapseState", propertyName: "expandCollapseState"}
        },
        scrollPosition: {
            position: <DataViewObjectPropertyIdentifier>{ objectName: "scrollPosition", propertyName: "position" },
            position2: <DataViewObjectPropertyIdentifier>{ objectName: "scrollPosition", propertyName: "position2" }
        },
        sortAttributes: {
            prevSortedColumn: <DataViewObjectPropertyIdentifier>{ objectName: "sortAttributes", propertyName: "prevSortedColumn" },
            sortLevel: <DataViewObjectPropertyIdentifier>{ objectName: "sortAttributes", propertyName: "sortLevel" },
            sortOrder: <DataViewObjectPropertyIdentifier>{ objectName: "sortAttributes", propertyName: "sortOrder" }
        },
        taskGridlines: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: "taskGridlines", propertyName: "fill" },
            interval: <DataViewObjectPropertyIdentifier>{ objectName: "taskGridlines", propertyName: "interval" },
            show: <DataViewObjectPropertyIdentifier>{ objectName: "taskGridlines", propertyName: "show" }
        },
        taskLabels: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "fill" },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "fontFamily" },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "fontSize" },
            isExpanded: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "isExpanded" },
            isHierarchy: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "isHierarchy" },
            show: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "show" },
            width: <DataViewObjectPropertyIdentifier>{ objectName: "taskLabels", propertyName: "width" }

        },
        taskResource: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: "taskResource", propertyName: "fill" },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: "taskResource", propertyName: "fontFamily" },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: "taskResource", propertyName: "fontSize" },
            position: <DataViewObjectPropertyIdentifier>{ objectName: "taskResource", propertyName: "position" },
            show: <DataViewObjectPropertyIdentifier>{ objectName: "taskResource", propertyName: "show" }

        }
    };
}

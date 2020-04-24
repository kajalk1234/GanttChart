/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
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
 *
 */
module powerbi.extensibility.visual {

    // d3
    import Selection = d3.Selection;
    import Update = d3.selection.Update;

    // powerbi
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;
    import DataViewObjects = powerbi.DataViewObjects;
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;
    let selectionIds: ISelectionId[];

    // powerbi.extensibility
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

    // powerbi.extensibility.visual
    import IVisual = powerbi.extensibility.visual.IVisual;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

    // powerbi.extensibility.utils.svg
    import svg = powerbi.extensibility.utils.svg;
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import PrimitiveType = powerbi.extensibility.utils.type.PrimitiveType;
    import ValueType = powerbi.extensibility.utils.type.ValueType;

    // powerbi.extensibility.utils.formatting
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    // powerbi.extensibility.utils.interactivity
    import createInteractivitySelectionService = powerbi.extensibility.utils.interactivity.createInteractivitySelectionService;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import InteractivitySelectionService = powerbi.extensibility.utils.interactivity.InteractivitySelectionService;
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    // powerbi.extensibility.utils.chart
    import axis = powerbi.extensibility.utils.chart.axis;
    import scale = powerbi.extensibility.utils.chart.axis.scale;
    import IAxisProperties = powerbi.extensibility.utils.chart.axis.IAxisProperties;

    // powerbi.extensibility.utils.chart.legend
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import positionChartArea = powerbi.extensibility.utils.chart.legend.positionChartArea;

    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewTableRow = powerbi.DataViewTableRow;
    import Scale = d3.time.Scale;

    const dateFormat: RegExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?)?\D$/;
    let uniquelegend: PrimitiveValue[];
    let uniqueColors: any;
    let iterator: number = 1;
    let colorsPersistObject: any = {};
    let errorMessage: boolean = false;
    let legIndex: number;
    let r: number;
    let scrollWidth: number;
    let measureFormat: string;
    let legendData: LegendData;
    const tasks: ITask[] = [];
    let uniquesColorsForLegends: any[] = [];
    let resourcePresent: boolean = false;
    const legendIndex: number = -1;
    const transformRightValue: number = 18;
    const percentFormat: string = "0.00 %;-0.00 %;0.00 %";
    const millisecondsInADay: number = 24 * 60 * 60 * 1000;
    const millisecondsInWeek: number = 7 * millisecondsInADay;
    const millisecondsInAMonth: number = 30 * millisecondsInADay;
    const millisecondsInAQuarter: number = 92 * millisecondsInADay;
    const millisecondsInAYear: number = 365 * millisecondsInADay;
    const chartLineHeight: number = 25;
    const paddingTasks: number = 5;
    const numberFormat: string = "#";
    const dataformat: string = "$";
    const headerCellClassLiteral: string = ".headerCell";
    const nullStringLiteral: string = "";
    const taskColumnClassLiteral: string = ".task-column";
    const taskColumnLiteral: string = "task-column";
    const startDateLiteral: string = "StartDate";
    const endDateLiteral: string = "EndDate";
    const sortOrderLiteral: string = "sortOrder";
    const sortLevelLiteral: string = "sortLevel";
    const prevSortedColumnLiteral: string = "prevSortedColumn";
    const semiColonLiteral: string = ";";
    const verticalLineLiteral: string = "vertical-line";
    const zeroLiteral: string = "0";
    const slashLiteral: string = "/";
    const colonLiteral: string = ":";
    const spaceLiteral: string = " ";
    const horizontalLineClassLiteral: string = ".horizontalLine";
    const pxLiteral: string = "px";
    const categoryIdLiteral: string = "#gantt_category";
    const columnLiteral: string = "column";
    const legendLiteral: string = "legend";
    const clickedTypeLiteral: string = "clickedType";
    const phaseNamesLiteral: string = "phaseNames";
    const milestoneNamesLiteral: string = "milestoneNames";
    const stopPropagationLiteral: string = "stopPropagation";
    const categoryClassLiteral: string = ".gantt_category";
    const taskRowClassLiteral: string = ".task_row";
    const ellipsisLiteral: string = "...";
    const categoryLiteral: string = "gantt_category";
    const dotLiteral: string = ".";
    const headerCellLiteral: string = "headerCell";
    const verticalLineSimpleLiteral: string = "verticalLine";
    const taskRowLiteral: string = "task_row";
    const kpiClassLiteral: string = "gantt_kpiClass";
    const paranthesisStartLiteral: string = "(";
    const paranthesisEndLiteral: string = ")";
    const commaLiteral: string = ",";
    const xFactor: number = 5;
    // nav
    let singleCharacter: Selection<HTMLElement>;

    interface Line {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        tooltipInfo: VisualTooltipDataItem[];
    }

    export interface GanttCalculateScaleAndDomainOptions {
        viewport: IViewport;
        margin: IMargin;
        showCategoryAxisLabel: boolean;
        showValueAxisLabel: boolean;
        forceMerge: boolean;
        categoryAxisScaleType: string;
        valueAxisScaleType: string;
        trimOrdinalDataOnOverflow: boolean;
        forcedTickCount?: number;
        forcedYDomain?: any[];
        forcedXDomain?: any[];
        ensureXDomain?: any;
        ensureYDomain?: any;
        categoryAxisDisplayUnits?: number;
        categoryAxisPrecision?: number;
        valueAxisDisplayUnits?: number;
        valueAxisPrecision?: number;
    }

    /**
     * Gets property value for a particular object.
     *
     * @function
     * @param {DataViewObjects} objects - Map of defined objects.
     * @param {string} objectName       - Name of desired object.
     * @param {string} propertyName     - Name of desired property.
     * @param {T} defaultValue          - Default value of desired property.
     */
    export function getValue<T>(objects: DataViewObjects,
        objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object: DataViewObject;
            object = objects[objectName];
            if (object) {
                let property: T;
                property = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }

        return defaultValue;
    }

    module Selectors {
        export const className: ClassAndSelector = createClassAndSelector("gantt");
        export const chart: ClassAndSelector = createClassAndSelector("gantt_chart");
        export const chartLine: ClassAndSelector = createClassAndSelector("gantt_chart-line");
        export const body: ClassAndSelector = createClassAndSelector("gantt-body");
        export const axisGroup: ClassAndSelector = createClassAndSelector("gantt_axis");
        export const domain: ClassAndSelector = createClassAndSelector("gantt_domain");
        export const axisTick: ClassAndSelector = createClassAndSelector("gantt_tick");
        export const tasks: ClassAndSelector = createClassAndSelector("gantt_tasks");
        export const taskGroup: ClassAndSelector = createClassAndSelector("gantt_task-group");
        export const singleTask: ClassAndSelector = createClassAndSelector("gantt_task");
        export const singlePhase: ClassAndSelector = createClassAndSelector("gantt_phase");
        export const taskRect: ClassAndSelector = createClassAndSelector("gantt_task-rect");
        export const taskResource: ClassAndSelector = createClassAndSelector("gantt_task-resource");
        export const errorPanel: ClassAndSelector = createClassAndSelector("gantt_errorPanel");
        export const taskLines: ClassAndSelector = createClassAndSelector("gantt_task-lines");
        export const kpiLines: ClassAndSelector = createClassAndSelector("gantt_kpi-lines");
        export const label: ClassAndSelector = createClassAndSelector("gantt_label");
        export const legendItems: ClassAndSelector = createClassAndSelector("gantt_legendItem");
        export const legendTitle: ClassAndSelector = createClassAndSelector("gantt_legendTitle");
        export const toggleTask: ClassAndSelector = createClassAndSelector("gantt_toggle-task");
        export const toggleTaskGroup: ClassAndSelector = createClassAndSelector("gantt_toggle-task-group");
        export const barPanel: ClassAndSelector = createClassAndSelector("gantt_barPanel");
        export const taskPanel: ClassAndSelector = createClassAndSelector("gantt_taskPanel");
        export const kpiPanel: ClassAndSelector = createClassAndSelector("gantt_kpiPanel");
        export const timeLinePanel: ClassAndSelector = createClassAndSelector("gantt_timelinePanel");
        export const bottomPannel: ClassAndSelector = createClassAndSelector("gantt_bottomPanel");
        export const imagePanel: ClassAndSelector = createClassAndSelector("gantt_imagePanel");
        export const kpiImagePanel: ClassAndSelector = createClassAndSelector("gantt_kpiImagePanel");
        export const drillAllPanel: ClassAndSelector = createClassAndSelector("gantt_drillAllPanel");
        export const drillAllPanel2: ClassAndSelector = createClassAndSelector("gantt_drillAllPanel2");
        export const drillAllSvg: ClassAndSelector = createClassAndSelector("gantt_drillAllSvg");
        export const drillAllSvg2: ClassAndSelector = createClassAndSelector("gantt_drillAllSvg2");
        export const kpiTitlePanel: ClassAndSelector = createClassAndSelector("gantt_kpiTitlePanel");
        export const bottomMilestonePanel: ClassAndSelector = createClassAndSelector("gantt_bottomMilestonePanel");
        export const kpiSvg: ClassAndSelector = createClassAndSelector("gantt_kpiSvg");
        export const backgroundBoxSvg: ClassAndSelector = createClassAndSelector("gantt_backgroundBox");
        export const taskSvg: ClassAndSelector = createClassAndSelector("gantt_taskSvg");
        export const barSvg: ClassAndSelector = createClassAndSelector("gantt_barSvg");
        export const timeLineSvg: ClassAndSelector = createClassAndSelector("gantt_timelineSvg");
        export const imageSvg: ClassAndSelector = createClassAndSelector("gantt_imageSvg");
        export const bottomMilestoneSvg: ClassAndSelector = createClassAndSelector("gantt_bottomMilestoneSvg");
        export const bottomMilestoneGroup: ClassAndSelector = createClassAndSelector("gantt_bottom-milestone-group");
        export const bottomTaskDiv: ClassAndSelector = createClassAndSelector("gantt_bottomTaskDiv");
        export const bottomTaskSvg: ClassAndSelector = createClassAndSelector("gantt_bottomTaskSvg");
        export const gridGroup: ClassAndSelector = createClassAndSelector("gantt_grids");
        export const todayIndicator: ClassAndSelector = createClassAndSelector("gantt_today-indicator");
        export const todayText: ClassAndSelector = createClassAndSelector("gantt_today-text");
        export const todayGroup: ClassAndSelector = createClassAndSelector("gantt_today-group");
        export const legendPanel: ClassAndSelector = createClassAndSelector("gantt_legendPanel");
        export const legendSvg: ClassAndSelector = createClassAndSelector("gantt_legendSvg");
        export const legendGroup: ClassAndSelector = createClassAndSelector("gantt_legendGroup");
        export const legendText: ClassAndSelector = createClassAndSelector("gantt_legendText");
        export const legendIndicatorPanel: ClassAndSelector = createClassAndSelector("gantt_legendIndicatorPanel");
        export const legendIndicatorTitlePanel: ClassAndSelector = createClassAndSelector("gantt_legendIndicatorTitlePanel");
        export const legendIndicatorTitleSvg: ClassAndSelector = createClassAndSelector("gantt_legendIndicatorTitleSvg");
        export const kpiIndicatorPanel: ClassAndSelector = createClassAndSelector("gantt_kpiIndicatorPanel");
        export const kpiIndicatorSvg: ClassAndSelector = createClassAndSelector("gantt_kpiIndicatorSvg");
        export const milestoneIndicatorPanel: ClassAndSelector = createClassAndSelector("gantt_milestoneIndicatorPanel");
        export const milestoneIndicatorSvg: ClassAndSelector = createClassAndSelector("gantt_milestoneIndicatorSvg");
        export const phaseIndicatorPanel: ClassAndSelector = createClassAndSelector("gantt_phaseIndicatorPanel");
        export const phaseIndicatorSvg: ClassAndSelector = createClassAndSelector("gantt_phaseIndicatorSvg");
    }

    module GanttRoles {
        export const category: string = "Category";
        export const startDate: string = "StartDate";
        export const endDate: string = "EndDate";
        export const kpiValueBag: string = "KPIValueBag";
        export const resource: string = "Resource";
        export const tooltip: string = "Tooltip";
    }

    /**
     * export class Gantt implements IVisual
     */
    export class Gantt implements IVisual {
        public static defaultValues: any = {
            AxisTickSize: 6,
            DateFormatStrings: {
                Day: "MMM dd hh:mm tt",
                Month: "MMM yyyy",
                Quarter: "MMM yyyy",
                Week: "MMM dd",
                Year: "yyyy"
            },
            DefaultDateType: "Month",
            MaxTaskOpacity: 1,
            MinTaskOpacity: 0.4,
            ProgressBarHeight: 4,
            ResourceWidth: 100,
            TaskColor: "#00B099",
            TaskLineWidth: 15
        };
        private static tasknew: any[] = [];
        private static selectionIdHash: boolean[] = [];
        private static expandCollapseStates: {} = {};
        private static globalOptions: VisualUpdateOptions;
        private static previousSel: string;
        private static typeColors: string[] = ["#2c84c6", "#4c4d4e", "#4d4d00", "#cd6600", "#f08080",
            "#cea48b", "#8f4c65", "#af9768", "#42637f", "#491f1c", "#8e201f",
            "#20b2aa", "#999966", "#bd543f", "#996600"];
        private static axisHeight: number = 43;
        private static bottomMilestoneHeight: number = 23;
        private static scrollHeight: number = 17;
        private static defaultTicksLength: number = 45;
        private static defaultDuration: number = 250;
        private static taskLineCoordinateX: number = 15;
        private static axisLabelClip: number = 20;
        private static axisLabelStrokeWidth: number = 1;
        private static taskResourcePadding: number = 4;
        private static barHeightMargin: number = 5;
        private static chartLineHeightDivider: number = 4;
        private static resourceWidthPadding: number = 10;
        private static taskLabelsMarginTop: number = 15;
        private static complectionMax: number = 1;
        private static complectionMin: number = 0;
        private static complectionTotal: number = 100;
        private static minTasks: number = 1;
        private static chartLineProportion: number = 1.5;
        private static milestoneTop: number = 0;
        private static taskLabelWidth: number = 0;
        private static kpiLabelWidth: number;
        private static taskLabelWidthOriginal: number = 0;
        private static kpiLabelWidthOriginal: number = 0;
        private static visualWidth: number = 0;
        private static isPhaseHighlighted: boolean = false;
        private static isLegendHighlighted: boolean = false;
        private static xAxisPropertiesParamter: IAxisPropertiesParameter;
        private static visualCoordinates: IVisualProperty;
        private static earliestStartDate: Date = new Date();
        private static lastestEndDate: Date = new Date();
        private static maxSafeInteger: number = 9007199254740991;
        private static minSafeInteger: number = -9007199254740991;
        private static dataMIN: number = Gantt.maxSafeInteger;
        private static dataMAX: number = Gantt.minSafeInteger;
        private static drillLevelPadding: number = 10;
        private static colorsIndex: number = 0;
        private static totalTasksNumber: number = 0;
        private static currentTasksNumber: number = 0;
        private static minTasksNumber: number = 0;
        private static singleCharacterWidth: number = 0;
        private static maxTaskNameLength: number = 0;
        private static totalDrillLevel: number = 0;
        private static totalTicks: number = 0;
        private static isAllExpanded: boolean = true;
        private static isSubRegionFilteredData: boolean = false;
        private static isProjectFilteredData: boolean = false;
        private static isIncorrectHierarchy: boolean = false;
        private static isPlannedBarPresent: boolean = false;
        private static phaseNames: string[] = [];
        private static milestoneNames: string[] = [];
        private static milestoneShapes: string[] = ["circle", "diamond", "star", "triangle"];
        private static milestoneColor: string[] = ["#0000ff", "#cd00ff", "#78f4ff", "#ff0099"];
        private static milestoneSize: number[] = [20, 14, 18, 16];
        private static isScrolled: boolean = false;
        private static currentSelectionState: any = {};
        private static totalLegendSelected: number = 0;
        private static totalLegendPresent: number = 0;
        private static formatters: IGanttChartFormatters;
        private static multipleSelectFlag: boolean = false;
        private static prevSelectionCount: number = 0;
        private static isDateData: boolean = false;
        private static expandImage: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsSAAALEgHS"
            + "3X78AAAA10lEQVQoz5WRwVHDUAxE3zfcyY0jdICpIM6NW9wBLiEd7GwH7gBTAaED04HpIOnAVPC5yJmPhwPoJD3NalZ"
            + "Syjnzn7i2vQGOUc9AB2yAYWGS2kVQSZqjuQX2QC/pFEO2wN72cBEASBqA12DPtg+S+hXrAFK5g+0JeIhyB0zAWLDHarV"
            + "TU+THsNsWbFwLDkU+/ML6iyXbLfAWjQ9JTfh+CfYuqU05Z2zX4fUGOAM1cF+wT6CRNF+llJY/3AFfwFP8YwRug7Vxaqr"
            + "C5y6mTMG6YHXBfp71L/EN44hU/TumF5gAAAAASUVORK5CYII=";
        private static collapseImage: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBI"
            + "WXMAAAsSAAALEgHS3X78AAAA3ElEQVQoz5WSwVHDQAxF3xru5MYROkjowLlxdAcxHZgKfn4H7g"
            + "BTAaGD0IHTQejAVLBctDM7vkW3/yTtH0mbcs7cEve1sD0AXchR0sn2EWgLS8XBdgd8ReJHUmu7"
            + " Bz6CfUvqUs4Z2zvgDDwAv8AOeK7YBWglLXcppQ1wAp6AP+AVWKL4MVgn6QrQACOwDdujpBmY4g"
            + " GAIRh1Q4ne9mbFhnoxTXS/hd7Gds7Ae2G2p9oBSRPwGexge5A0rlgPkOrD2Z6refbAHMMX9tKs"
            + " DtlG4R64SlrikIUt6dav8Q99qlfX01xJpAAAAABJRU5ErkJggg==";
        private static drillDownImage: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFW"
            + "HRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAA"
            + "AAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8"
            + "+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUC"
            + "BDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gP"
            + "HJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50"
            + "YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8"
            + "vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS"
            + "94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zV"
            + "HlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIw"
            + "MTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc3MkFFQkJBM0JFODExRTc"
            + "5NTJDOUZDRTZDOTFFRjQ4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc3MkFFQkJCM0JFOD"
            + "ExRTc5NTJDOUZDRTZDOTFFRjQ4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlS"
            + "UQ9InhtcC5paWQ6NzcyQUVCQjgzQkU4MTFFNzk1MkM5RkNFNkM5MUVGNDgiIHN0UmVmOmRvY3Vt"
            + "ZW50SUQ9InhtcC5kaWQ6NzcyQUVCQjkzQkU4MTFFNzk1MkM5RkNFNkM5MUVGNDgiLz4gPC9yZGY"
            + "6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz"
            + "4K7pvnAAAAVklEQVR42mJMS0ubzsDAkMFAHJjBBCSyQAxiFIPUMp89e5bB2Nh4G5AjDsQm+BTPm"
            + "jXrPzOIR0ATXDGIwwwTxaEJRTEIMKLbDQwEkNg0KBdFMQgABBgAaoAhSxcNKH0AAAAASUVORK5CYII=";
        private static drillUpImage: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWH"
            + "RTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAA"
            + "AAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+ID"
            + "x4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3"
            + "JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZj"
            + "pSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbn"
            + "MjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYW"
            + "RvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS"
            + "4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZX"
            + "NvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbm"
            + "Rvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjREMjk2MDhDM0JFODExRTc4QTVFODdENT"
            + "ZDMzAyQjJEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjREMjk2MDhEM0JFODExRTc4QTVFOD"
            + "dENTZDMzAyQjJEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paW"
            + "Q6NEQyOTYwOEEzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC"
            + "5kaWQ6NEQyOTYwOEIzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiLz4gPC9yZGY6RGVzY3JpcHRpb2"
            + "4+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5N9DX0AAAATElEQV"
            + "R42mJkwALS0tI6gBQ/EGfNmjXrP7IcMw7F5UBsAsTixsbG286ePYtdA5JiGMDQxIxHMVZNjAQUI4"
            + "MZID+xEKkYBDJABECAAQB/1x1ybiu+cQAAAABJRU5ErkJggg==";
        private static drillDownAllImage: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMA"
            + "AAsSAAALEgHS3X78AAAA00lEQVQoz22PUY0CQRBE3xH+QQIOwAFIwAGcAvYUVLcC1sHuOeAcIGElIG"
            + "EdNB/XkwwDnUwynaqamkdEYGadmZ0jgk/HzM5mZhHBgv9ZA4O79zTj7iMwlH3Z6Bd33wHH3O/AtjaU"
            + "hh74y/semIBHZf5ND18RUdcboKb1R1L/8qU0PiSZu0/AmPpR0t3dO2AtyRbVS4O7j5JuwC7PlNDXlq"
            + "HMKRvmCvpUG5YV9CbFbQIDrAq0JPsE3dX1Od+SCtNrIEMH4JbrQdJU62+BDG2AWdLcak/tkG3X3uJZ"
            + "XAAAAABJRU5ErkJggg==";
        private static drillUpAllImage: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAA"
            + "AsSAAALEgHS3X78AAAA10lEQVQoz32Q0W3CUAxFD4j/dIRs0LJBOkGzQcMGdIIbb8AGfRuUTlA6QekG"
            + "ZQMygfnAAet91JIlyzr21b0LdyeXmT0AOwBJA1Ut8oGZPQEFeIzVL9BJOs/MMsE9cEgwMf/Fo/tBwB9"
            + "AE/sN8BZzA/wEc1OYP5yAtaQiaQc8A1NmVkn+G+hDcQ+cgW2A+9pDkdQBLXAEXoDX8ATQRRj3lMxsiD"
            + "ibKskJ6CUdsukBeA94CtObZPqrNt1WuRdJBVjXppdJ+jPg47yIuY1H13J3xnFs3Z3/emYuR+Rr0nbFP"
            + "j4AAAAASUVORK5CYII=";
        private static legendIcon: string =
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciI"
            + "HZpZXdCb3g9IjAgMCA1NC41IDQ2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6Z3JheTt9PC9zdHls"
            + "ZT48L2RlZnM+PHRpdGxlPkFzc2V0IDI8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9Ikx"
            + "heWVyIDIiPjxnIGlkPSJMYXllcl8xLTIiIGRhdGEtbmFtZT0iTGF5ZXIgMSI+PHJlY3QgY2xhc3M9Im"
            + "Nscy0xIiB3aWR0aD0iNTQuNSIgaGVpZ2h0PSI4LjMiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHk9IjE4L"
            + "jg1IiB3aWR0aD0iNTQuNSIgaGVpZ2h0PSI4LjMiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHk9IjM3Ljci"
            + "IHdpZHRoPSI1NC41IiBoZWlnaHQ9IjguMyIvPjwvZz48L2c+PC9zdmc+";

        private static plusIcon: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAJUlEQVR42mNgAIL"
            + "y8vL/DLgASBKnApgkVgXIkhgKiNKJ005s4gDLbCZBiSxfygAAAABJRU5ErkJggg==";

        private static minusIcon: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAG0lEQVR42mNg"
            + "wAfKy8v/48I4FeA0AacVDFQBAP9wJkE/KhUMAAAAAElFTkSuQmCC";
        private static updateCount: number = 0;
        private static isResizeStarted: boolean = false;
        private static stateValue: any = [];
        private static arrOptimized = [];
        private static oOptimizedObj: IShowData;
        private static columnHeaderBgColor: any;
        private static iHeaderSingleCharWidth: number = 4;
        private static iKPIHeaderSingleCharWidth: number = 4;
        private static categoriesTitle: string[] = [];
        private static columnWidth: number;
        private static categoryColumnsWidth: string;
        private static minDisplayRatio: number;
        private static currentDisplayRatio: number;
        private static prevDisplayRatio: number;
        private static numberOfCategories: number;
        private static isKpiPresent: boolean;
        private static viewModelNew: IGanttViewModel;
        private static sortLevel: number = 0;
        private static sortOrder: string = "asc";
        private static sortDescOrder: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWHRTb"
            + "2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/"
            + "eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1"
            + "ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMT"
            + "M4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6c"
            + "mRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNj"
            + "cmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjA"
            + "vIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZW"
            + "Y9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhd"
            + "G9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlE"
            + "PSJ4bXAuaWlkOjc3MkFFQkJBM0JFODExRTc5NTJDOUZDRTZDOTFFRjQ4IiB4bXBNTTpEb2N1bWVudEl"
            + "EPSJ4bXAuZGlkOjc3MkFFQkJCM0JFODExRTc5NTJDOUZDRTZDOTFFRjQ4Ij4gPHhtcE1NOkRlcml2ZW"
            + "RGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzcyQUVCQjgzQkU4MTFFNzk1MkM5RkNFNkM5M"
            + "UVGNDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzcyQUVCQjkzQkU4MTFFNzk1MkM5RkNFNkM5"
            + "MUVGNDgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2t"
            + "ldCBlbmQ9InIiPz4K7pvnAAAAVklEQVR42mJMS0ubzsDAkMFAHJjBBCSyQAxiFIPUMp89e5bB2Nh4G5"
            + "AjDsQm+BTPmjXrPzOIR0ATXDGIwwwTxaEJRTEIMKLbDQwEkNg0KBdFMQgABBgAaoAhSxcNKH0AAAAAS"
            + "UVORK5CYII=";
        private static sortAscOrder: string =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWHRTb2"
            + "Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eH"
            + "BhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldG"
            + "EgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4ID"
            + "c5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPS"
            + "JodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdG"
            + "lvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bW"
            + "xuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dH"
            + "A6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD"
            + "0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaW"
            + "lkOjREMjk2MDhDM0JFODExRTc4QTVFODdENTZDMzAyQjJEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZG"
            + "lkOjREMjk2MDhEM0JFODExRTc4QTVFODdENTZDMzAyQjJEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0Um"
            + "VmOmluc3RhbmNlSUQ9InhtcC5paWQ6NEQyOTYwOEEzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiIHN0Um"
            + "VmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NEQyOTYwOEIzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiLz4gPC"
            + "9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz"
            + "5N9DX0AAAATElEQVR42mJkwALS0tI6gBQ/EGfNmjXrP7IcMw7F5UBsAsTixsbG286ePYtdA5JiGMDQxI"
            + "xHMVZNjAQUI4MZID+xEKkYBDJABECAAQB/1x1ybiu+cQAAAABJRU5ErkJggg==";
        private static sortDefaultIcon: string = Gantt.sortAscOrder;
        private static prevSortedColumn: number = -1;
        private static legendWidth: number = 90;
        private static maximumNormalizedFontSize: number = 19;
        private static maximumFontSize: number = 40;
        private static isSelected: boolean = false;
        private static regionValueFormatter: IValueFormatter;
        private static datalabelValueFormatter: IValueFormatter;
        private static metroValueFormatter: IValueFormatter;
        private static projectValueFormatter: IValueFormatter;
        private static trancheValueFormatter: IValueFormatter;
        private static lastSelectedbar: number = null;
        private static categorylength: number = null;
        private static ganttDiv: Selection<HTMLElement>;
        private static arrGantt = [];
        private static ganttLen: number = null;
        private static errorDiv: Selection<HTMLElement>;
        private static errorText: Selection<HTMLElement>;

        /**
         * 
         */
        private static get DefaultMargin(): IMargin {
            return {
                bottom: 40,
                left: 20,
                right: 40,
                top: 50

            };
        }

        /**
         * 
         * @param column 
         * @param name 
         */
        private static hasRole(column: DataViewMetadataColumn, name: string): boolean {
            let roles: any = column.roles;
            return roles && roles[name];
        }

        /**
         * Determines whether the actual date is forecast date or a past date
         * @param actualDate date which is actual date
         */
        private static isDateForecast(actualDate: Date): boolean {
            const todayDate: Date = new Date();
            return (todayDate < actualDate ? true : false);
        }

        /**
         * 
         * @param phase 
         * @param formattedDate 
         * @param dataView 
         * @param tooltipDataArray 
         * @param formatters 
         */
        private static phaseStartEnd(phase, formattedDate, dataView, tooltipDataArray, formatters) {
            if (phase.start != null) {
                formattedDate = valueFormatter.format(new Date(phase.start.toString()), dataView.categorical.values[0].source.format);
                tooltipDataArray.push({ displayName: "Start", value: formattedDate });
                formattedDate = valueFormatter.format(new Date(phase.end.toString()), dataView.categorical.values[1].source.format);
                tooltipDataArray.push({ displayName: "End", value: formattedDate });
            } else if (phase.start === null) {
                tooltipDataArray.push({ displayName: "Start", value: formatters.startDataFormatter.format(phase.numStart) });
                tooltipDataArray.push({ displayName: "End", value: formatters.endDataFormatter.format(phase.numEnd) });
            }
        }

        /**
         * Get the tooltip info (data display names & formated values)
         * @param task          - All task attributes.
         * @param formatters            - Formatting options for gantt attributes.
         */
        private static getTooltipInfo(
            phase: ITask, formatters: IGanttChartFormatters,
            dataView: DataView, taskIndex: number, timeInterval: string = "Days"): VisualTooltipDataItem[] {
            let tooltipDataArray: VisualTooltipDataItem[] = [], formattedDate: string = "";
            let tooltipIndex: string[] = [], oColumns: DataViewMetadataColumn[] = dataView.metadata.columns, categorical: DataViewCategorical = dataView.categorical;
            let displayName: string, oMap: any = {}, iColumnLength: number = oColumns.length;
            taskIndex = phase.id;
            for (let iColumnCount: number = 0; iColumnCount < iColumnLength; iColumnCount++) {
                if (oColumns[iColumnCount].roles[GanttRoles.tooltip]) {
                    displayName = oColumns[iColumnCount].displayName;
                    if (!oMap[displayName]) {
                        tooltipIndex.push(displayName);
                        oMap[displayName] = 1;
                    }
                }
            }
            tooltipDataArray = [];
            let tooltipIndexLength: number = tooltipIndex.length;
            if (dataView.metadata.objects === undefined || dataView.metadata.objects.taskLabels === undefined || !dataView.metadata.objects.taskLabels.isHierarchy) {
                for (let iTooltipIndexCount: number = 0; iTooltipIndexCount < tooltipIndexLength; iTooltipIndexCount++) {
                    let iCatLength: number = categorical.categories.length;
                    for (let iCatCount: number = 0; iCatCount < iCatLength; iCatCount++) {
                        if (categorical.categories[iCatCount].source.displayName === tooltipIndex[iTooltipIndexCount]) {
                            if (categorical.categories[iCatCount].values[taskIndex] === null) {
                                categorical.categories[iCatCount].values[taskIndex] = "(Blank)";
                            }
                            if (categorical.categories[iCatCount].values[taskIndex] && categorical.categories[iCatCount].values[taskIndex] !== null
                                && oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                                let iValueFormatter: IValueFormatter;
                                if (categorical.categories[iCatCount].source.format) {
                                    iValueFormatter = valueFormatter.create({ format: categorical.categories[iCatCount].source.format });
                                    const flag: boolean = dateFormat.test(categorical.categories[iCatCount].values[taskIndex].toString()) ? true : false;
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(), value: flag ? iValueFormatter.format(new Date(
                                            categorical.categories[iCatCount].values[taskIndex].toString())) :
                                            iValueFormatter.format(categorical.categories[iCatCount].values[taskIndex])
                                    });
                                } else {
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                        value: categorical.categories[iCatCount].values[taskIndex].toString()
                                    });
                                }
                                oMap[tooltipIndex[iTooltipIndexCount]] = 0;
                            }
                        }
                    }
                    const iValLength: number = categorical.values.length;
                    for (let iValCount: number = 0; iValCount < iValLength; iValCount++) {
                        if (categorical.values[iValCount].source.displayName === tooltipIndex[iTooltipIndexCount]) {
                            if (categorical.values[iValCount].values[taskIndex] === null) {
                                categorical.values[iValCount].values[taskIndex] = "(Blank)";
                            }
                            if (categorical.values[iValCount].values[taskIndex] && categorical.values[iValCount].values[taskIndex] !== null
                                && oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                                let iValueFormatter: IValueFormatter;
                                if (categorical.values[iValCount].source.format) {
                                    iValueFormatter = valueFormatter.create({ format: categorical.values[iValCount].source.format });
                                    const flag: boolean = dateFormat.test(categorical.values[iValCount].values[taskIndex].toString()) ? true : false;
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(), value: flag
                                            ? iValueFormatter.format(new Date(categorical.values[iValCount].values[taskIndex].toString())) :
                                            iValueFormatter.format(categorical.values[iValCount].values[taskIndex])
                                    });
                                } else {
                                    let tooltipValues: string;
                                    if (phase.tooltipInfo === null || phase.tooltipInfo.toString() === "") {
                                        tooltipValues = categorical.values[iValCount].values[taskIndex].toString();
                                        tooltipDataArray.push({ displayName: tooltipIndex[iTooltipIndexCount].toString(), value: tooltipValues });
                                    } else {
                                        const tooltipvalue: any[] = [];
                                        for (let j: number = 0; j < phase.tooltipInfo.length; j++) {
                                            tooltipValues = phase.tooltipInfo[j].value;
                                            tooltipvalue[j] = tooltipValues;
                                        }
                                        tooltipDataArray.push({
                                            displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                            value: tooltipvalue[iTooltipIndexCount].toString()
                                        });
                                    }
                                }
                                oMap[tooltipIndex[iTooltipIndexCount]] = 0;
                            } else {
                                if (oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                        value: categorical.values[iValCount].values[taskIndex].toString()
                                    });
                                }
                            }
                        }
                    }
                }
            } else {
                for (const i of phase.tooltipValues) {
                    tooltipDataArray.push({ displayName: i.name.toString(), value: i.value.toString() });
                }
            }
            // Added Date format
            this.phaseStartEnd(phase, formattedDate, dataView, tooltipDataArray, formatters);
            return tooltipDataArray;
        }

        /**
         * Check if task has data for task
         * @param dataView          - the data model
         */
        private static isChartHasTask(dataView: DataView): boolean {
            if (dataView.metadata &&
                dataView.metadata.columns) {
                let column: DataViewMetadataColumn;
                column = null;
                for (column of dataView.metadata.columns) {
                    if (Gantt.hasRole(column, GanttRoles.category)) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * Check if task has data for data labels
         * @param dataView          - the data model
         */
        private static isChartHasDataLabels(dataView: DataView): boolean {
            if (dataView.metadata &&
                dataView.metadata.columns) {
                let column: DataViewMetadataColumn = null;
                for (column of dataView.metadata.columns) {
                    if (Gantt.hasRole(column, GanttRoles.resource)) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * Returns the chart formatters
         * @param dataView          - the data model
         */
        private static getFormatters(dataView: DataView): IGanttChartFormatters {
            const valuesdata: DataViewValueColumn[] = dataView.categorical.values;
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns) {
                return null;
            }
            let startDataFormat: string = "d";
            let endDataFormat: string = "d";
            if (valuesdata) {
                let dvValues: DataViewValueColumn;
                dvValues = null;
                for (dvValues of valuesdata) {
                    if (Gantt.hasRole(dvValues.source, GanttRoles.startDate)) {
                        startDataFormat = dvValues.source.format;
                    }
                    if (Gantt.hasRole(dvValues.source, GanttRoles.endDate)) {
                        endDataFormat = dvValues.source.format;
                    }
                }
            }
            let iCount: number;
            let dataValue: number = 999;
            const len: number = valuesdata.length;
            for (iCount = 0; iCount < len; iCount++) {
                if (valuesdata[iCount].source.roles.Resource) {
                    dataValue = iCount;
                    break;
                }
            }
            if (dataValue !== 999) {
                measureFormat = valuesdata[dataValue].source.format;
            }
            return <IGanttChartFormatters>{
                completionFormatter: valueFormatter.create
                    ({ format: percentFormat, value: 1, allowFormatBeautification: true }),
                durationFormatter:
                    valueFormatter.create({ format: numberFormat }),
                endDataFormatter: valueFormatter.create({ format: endDataFormat }),
                startDataFormatter: valueFormatter.create({ format: startDataFormat })
            };
        }

        /**
         * 
         */
        private static getCategoricalTaskProperty<T>(columnSource: DataViewMetadataColumn[],
            child: any, propertyName: string, currentCounter: number, sortOrder: number = 0): T {
            if (!child || !columnSource || !(columnSource.length > 0) || !columnSource[0].roles) {
                return null;
            }
            let finalIndex = child.indexOf(child.filter((x) => x.source.roles[propertyName])[0]);
            if (-1 !== sortOrder) {
                finalIndex = child
                    .indexOf(child.filter((x) => x.source.roles[propertyName] && x.source.sortOrder === sortOrder)[0]);
            }
            if (finalIndex === -1) {
                return null;
            }
            let data: any;
            data = child[finalIndex].values[currentCounter];
            if (dateFormat.test(data)) {
                data = new Date(child[finalIndex].values[currentCounter]);
            }
            return data;
        }

        /**
         * 
         * @param length 
         * @param dataView 
         * @param cnt 
         */
        private static switchCaseHelper(length, dataView, cnt): number {
            for (let i: number = 0; i < 5; i++) {
                if (length == i + 1) {
                    if (dataView.categorical.categories[i + 1] !== undefined) {
                        if (dataView.categorical.categories[0].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 0;
                        } else if (dataView.categorical.categories[1].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 1;
                        } else if (dataView.categorical.categories[2].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 2;
                        } else if (dataView.categorical.categories[3].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 3;
                        } else {
                            errorMessage = true;
                        }
                    }
                    return cnt;
                }
            }
        }

        /**
         * Create task objects dataView
         * @param settings 
         * @param kpiValues 
         * @param taskColor 
         * @param endDate 
         * @param index 
         * @param host 
         * @param dataView 
         * @param taskValues 
         * @param datamax 
         * @param datamin 
         * @param resource 
         * @param startDate 
         * @param tooltipValues 
         * @param tasks 
         */
        private static createTasksHelperFunction(settings, kpiValues, taskColor, endDate, index, host, dataView, taskValues, datamax, datamin, resource,
            startDate, tooltipValues, tasks): ITask[] {
            let setColor: any;
            if (settings.barColor.showall) {
                setColor = taskColor;
            } else {
                setColor = settings.barColor.defaultColor;
            }
            tasks.push({
                KPIValues: kpiValues, color: setColor, end: endDate, expanded: null, id: index,
                identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index).createSelectionId(),
                isLeaf: null, level: null, name: taskValues, numEnd: datamax, numStart: datamin, parentId: null, repeat: r, resource, rowId: null, selected: false,
                selectionId: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index).createSelectionId(),
                start: startDate, tooltipInfo: null, tooltipValues
            });
            return tasks;
        }

        /**
         * 
         * @param categoriesdata 
         * @param categoryRoles 
         * @param index 
         * @param taskValues 
         * @param kpiRoles 
         * @param dataView 
         * @param kpiValues 
         * @param tooltipRoles 
         * @param tooltipValues 
         */
        private static forLoopHelper(
            categoriesdata: any,
            categoryRoles: number[],
            index: any,
            taskValues: string[],
            kpiRoles: number[],
            dataView: DataView,
            kpiValues: IKPIValues[],
            tooltipRoles: number[],
            tooltipValues: ITooltipDataValues[]) {
            for (let kpiValueCounter: number = 0; kpiValueCounter < categoryRoles.length; kpiValueCounter++) {
                let value: string = "";
                const maxLength = 15;
                const minLength = 14;
                value = <string>categoriesdata[categoryRoles[kpiValueCounter]].values[index];
                if (value && value !== "0") {
                    value = value;
                }
                else if (parseInt(value, 10) === 0) {
                    value = "0";
                }
                else {
                    value = "";
                }
                if (kpiValueCounter === 0) {
                    Gantt.regionValueFormatter = valueFormatter.create({
                        format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                    });
                }
                else if (kpiValueCounter === 1) {
                    Gantt.metroValueFormatter = valueFormatter.create({
                        format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                    });
                }
                else if (kpiValueCounter === 2) {
                    Gantt.projectValueFormatter = valueFormatter.create({
                        format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                    });
                }
                else {
                    Gantt.trancheValueFormatter = valueFormatter.create({
                        format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                    });
                }
                taskValues.push(value);
                if (typeof (value) === "object" && categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length > Gantt.maxTaskNameLength) {
                    Gantt.maxTaskNameLength = categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length < maxLength
                        ? categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length : minLength;
                }
                if (value.length > Gantt.maxTaskNameLength) {
                    Gantt.maxTaskNameLength = value.length < maxLength ? value.length : minLength;
                }
                const kpiRolesLength: number = kpiRoles.length;
                for (let kpiValueCounter: number = 0; kpiValueCounter < kpiRolesLength; kpiValueCounter++) {
                    const name: string = <string>categoriesdata[kpiRoles[kpiValueCounter]].source.displayName;
                    const format: string = dataView.categorical.categories[kpiRoles[kpiValueCounter]].source.format;
                    let value: string = <string>categoriesdata[kpiRoles[kpiValueCounter]].values[index];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = valueFormatter.format(new Date(value), format);
                        } else {
                            value = valueFormatter.format(value, format);
                        }
                    }
                    kpiValues.push({
                        name, value
                    });
                }
                let name: string;
                const tooltipRolesLength: number = tooltipRoles.length;
                for (let tooltipValueCounter: number = 0; tooltipValueCounter < tooltipRolesLength; tooltipValueCounter++) {
                    name = <string>categoriesdata[kpiRoles[tooltipValueCounter]].source.displayName;
                    let value: string = <string>categoriesdata[kpiRoles[tooltipValueCounter]].values[index];
                    tooltipValues.push({
                        name,
                        value
                    });
                }
            }
        }

        /**
         * Create task objects dataView
         * @param categoriesdata 
         * @param categoryNames 
         * @param kpiRoles 
         * @param kpiValuesNames 
         * @param tooltipValuesName 
         * @param tooltipRoles 
         * @param categoryRoles 
         */
        private static mapCategoriesData(categoriesdata, categoryNames, kpiRoles, kpiValuesNames, tooltipValuesName, tooltipRoles, categoryRoles) {
            categoriesdata.map((child: any, index: number) => {
                // Logic to add roles
                if (child.source.roles[GanttRoles.category]) {
                    // If roles are are already present then not allowed to enter again
                    if (!(categoryNames.indexOf(categoriesdata[index].source.displayName) > -1)) {
                        categoryRoles.push(index); Gantt.categoriesTitle.push(categoriesdata[index].source.displayName);
                        categoryNames.push(categoriesdata[index].source.displayName);
                    }
                }
                if (child.source.roles[GanttRoles.kpiValueBag]) {
                    // If roles are are already present then not allowed to enter again
                    if (!(kpiValuesNames.indexOf(categoriesdata[index].source.displayName) > -1)) {
                        kpiRoles.push(index); kpiValuesNames.push(categoriesdata[index].source.displayName);
                    }
                }
                if (child.source.roles[GanttRoles.tooltip]) {
                    tooltipRoles.push(index);
                    tooltipValuesName.push(categoriesdata[index].source.displayName);
                }
            });
        }

        /**
         * 
         * @param categoriesdata 
         * @param kpiRoles 
         * @param kpiValueCounter 
         * @param dataView 
         * @param kpiValues 
         * @param index 
         */
        private static createTasksForLoopHelper(categoriesdata, kpiRoles, kpiValueCounter, dataView, kpiValues, index): IKPIValues[] {
            const name: string = <string>categoriesdata[kpiRoles[kpiValueCounter]].source.displayName;
            const format: string = dataView.categorical.categories[kpiRoles[kpiValueCounter]].source.format;
            let value: string = <string>categoriesdata[kpiRoles[kpiValueCounter]].values[index];
            if (format !== undefined) {
                if (dateFormat.test(value)) {
                    value = valueFormatter.format(new Date(value.toString()), format);
                } else {
                    value = valueFormatter.format(value, format);
                }
            }
            kpiValues.push({ name, value });
            return kpiValues;
        }

        /**
         * Create task objects dataView
         * @param hashArr 
         * @param levelofSorting 
         * @param orderOfSorting 
         * @param iIterator 
         */
        private static sortCategories(hashArr, levelofSorting, orderOfSorting, iIterator) {
            Object.keys(hashArr).forEach((i: string): void => {
                hashArr[i].sort((m: any, n: any): number => {
                    if (orderOfSorting === "asc") {
                        if (m.name[levelofSorting] === "") {
                            return -1;
                        } else if (n.name[levelofSorting] === "") {
                            return 1;
                        } else {
                            let mValue: any;
                            let nValue: any;
                            if (typeof m.name[iIterator] === "string" && typeof n.name[iIterator] === "string") {
                                mValue = m.name[iIterator].toLowerCase();
                                nValue = n.name[iIterator].toLowerCase();
                            } else {
                                mValue = m.name[iIterator];
                                nValue = n.name[iIterator];
                            }
                            if (mValue < nValue) {
                                return -1;
                            }
                            if (mValue > nValue) {
                                return 1;
                            }
                            return 0;
                        }
                    } else {
                        if (m.name[levelofSorting] === "") {
                            return 1;
                        } else if (n.name[levelofSorting] === "") {
                            return -1;
                        } else {
                            let mValue: any;
                            let nValue: any;
                            if (typeof m.name[iIterator] === "string" && typeof n.name[iIterator] === "string") {
                                mValue = m.name[iIterator].toLowerCase();
                                nValue = n.name[iIterator].toLowerCase();
                            } else {
                                mValue = m.name[iIterator];
                                nValue = n.name[iIterator];
                            }
                            if (mValue > nValue) {
                                return -1;
                            }
                            if (mValue < nValue) {
                                return 1;
                            }
                            return 0;
                        }
                    }
                });
            });
        }

        /**
         * Method to check if kpi is present or not
         * @param kpiRoles 
         */
        private static isKpiPresentHelper(kpiRoles) {
            if (kpiRoles && kpiRoles.length === 0) {
                Gantt.isKpiPresent = false;
            } else {
                Gantt.isKpiPresent = true;
            }
            return Gantt.isKpiPresent;
        }

        /**
         * Method to get duration data
         * @param duration 
         * @param endDate 
         * @param startDate 
         * @param datamax 
         * @param datamin 
         */
        private static getDurationData(duration, endDate, startDate, datamax, datamin) {
            if (startDate != null) {
                let timeDiff: number = endDate.getTime() - startDate.getTime();
                duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (0 > duration) {
                    duration = 0;
                } else if (0 === duration) {
                    duration = 1;
                }
            }
            else if (datamin != null) {
                let valuediffer: number = datamax - datamin;
                duration = valuediffer;
            }
            return duration;
        }

        /**
         * Method to set date
         * @param startDate 
         * @param endDate 
         * @param datamax 
         * @param datamin 
         */
        private static setDate(startDate, endDate, datamax, datamin) {
            if (startDate < Gantt.earliestStartDate && startDate !== null) {
                Gantt.earliestStartDate = startDate;
            }
            if (endDate > Gantt.lastestEndDate && endDate !== null) {
                Gantt.lastestEndDate = endDate;
            }
            if (datamin !== null && datamin < Gantt.dataMIN) {
                Gantt.dataMIN = datamin;
            }
            if (datamax !== null && datamax > Gantt.dataMAX) {
                Gantt.dataMAX = datamax;
            }
        }

        /**
         * Method to set error message
         * @param errorMessage 
         */
        private static setErrorMessage(errorMessage) {
            if (errorMessage) {
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                Gantt.errorText.text('Please select a field that is already present in "Category"');
            }
        }

        /**
         * Create task objects dataView
         * @param iIterator 
         * @param levelofSorting 
         * @param hashArr 
         * @param tasks 
         * @param largest 
         * @param categoryRoles 
         * @param firstVisit 
         * @param orderOfSorting 
         */
        private static sortCategoriesHelperMethod(iIterator, levelofSorting, hashArr, tasks: ITask[], largest, categoryRoles, firstVisit, orderOfSorting) {
            while (iIterator < levelofSorting) {
                hashArr = [];
                const hyphenLiteral: string = "-";
                for (let index: number = 0; index <= largest; index++) {
                    if (hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral + tasks[index].name[iIterator - 2]
                        + hyphenLiteral + tasks[index].name[iIterator - 1]] === undefined) {
                        hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral + tasks[index].name[iIterator - 2]
                            + hyphenLiteral + tasks[index].name[iIterator - 1]] = [];
                    }
                    hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral + tasks[index].name[iIterator - 2]
                        + hyphenLiteral + tasks[index].name[iIterator - 1]].push(tasks[index]);
                }
                Object.keys(hashArr).forEach((i: string): void => {
                    hashArr[i].sort((m: any, n: any): number => {
                        if (m.name[iIterator] === "") {
                            return -1;
                        } else if (n.name[iIterator] === "") {
                            return 1;
                        }
                        else {
                            let mValue: any, nValue: any;
                            if (typeof m.name[iIterator] === "string" && typeof n.name[iIterator] === "string") {
                                mValue = m.name[iIterator].toLowerCase();
                                nValue = n.name[iIterator].toLowerCase();
                            }
                            else {
                                mValue = m.name[iIterator];
                                nValue = n.name[iIterator];
                            }
                            if (mValue < nValue) {
                                return -1;
                            }
                            if (mValue > nValue) {
                                return 1;
                            }
                            return 0;
                        }
                    });
                });
                tasks = [];
                Object.keys(hashArr).forEach((i: string): void => {
                    Object.keys(hashArr[i]).forEach((j: string): void => {
                        tasks.push(hashArr[i][j]);
                    });
                });
                iIterator++;
            }
            while (levelofSorting < categoryRoles.length) {
                hashArr = [];
                const hyphenLiteral: string = "-";
                for (let index: number = 0; index <= largest; index++) {
                    if (hashArr[tasks[index].name[levelofSorting - 3] + hyphenLiteral + tasks[index].name[levelofSorting - 2]
                        + hyphenLiteral + tasks[index].name[levelofSorting - 1]] === undefined)
                        hashArr[tasks[index].name[levelofSorting - 3] + hyphenLiteral + tasks[index].name[levelofSorting - 2]
                            + hyphenLiteral + tasks[index].name[levelofSorting - 1]] = [];
                    hashArr[tasks[index].name[levelofSorting - 3]
                        + hyphenLiteral + tasks[index].name[levelofSorting - 2] + hyphenLiteral + tasks[index].name[levelofSorting - 1]].push(tasks[index]);
                }
                if (!firstVisit) {
                    orderOfSorting = "asc";
                }
                this.sortCategories(hashArr, levelofSorting, orderOfSorting, iIterator);
                if (firstVisit) {
                    firstVisit = 0;
                }
                tasks = [];
                Object.keys(hashArr).forEach((i: string): void => {
                    Object.keys(hashArr[i]).forEach((j: string): void => {
                        tasks.push(hashArr[i][j]);
                    });
                });
                levelofSorting++;
            }
            selectionIds = [];
            for (let iCounter: number = 0; iCounter <= largest; iCounter++) {
                selectionIds.push(tasks[iCounter].selectionId);
            }
            return tasks;
        }

        /**
         * Create task objects dataView
         * @param settings 
         * @param dataView 
         * @param index 
         * @param defaultColor 
         * @param kpiValues 
         * @param host 
         * @param endDate 
         * @param startDate 
         * @param datamax 
         * @param datamin 
         * @param taskValues 
         * @param tooltipValues 
         * @param oUniquelegend 
         * @param legendindex 
         * @param resource 
         * @param tasks 
         * @param legendIndex 
         */
        private static createTasksHelperFunctionSix(settings, dataView, index, defaultColor, kpiValues, host, endDate, startDate, datamax, datamin, taskValues,
            tooltipValues, oUniquelegend, legendindex, resource, tasks, legendIndex) {
            if (settings.barColor.showall) {
                const labelCat: string = dataView.categorical.categories[legendIndex].values[index] === null
                    ? "Null" : dataView.categorical.categories[legendIndex].values[index].toString();
                colorsPersistObject[labelCat] = this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0],
                    index, "barColor", "fillColor", defaultColor).solid.color;
                tasks.push({
                    KPIValues: kpiValues, color: colorsPersistObject[labelCat], end: endDate, expanded: null, id: index,
                    identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index).createSelectionId(),
                    isLeaf: null, level: null, name: taskValues, numEnd: datamax, numStart: datamin, parentId: null, repeat: r,
                    resource, rowId: null, selected: false, selectionId: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index)
                        .createSelectionId(), start: startDate, tooltipInfo: null, tooltipValues
                });
                const sel: string = tasks[index].name[legendindex], selection: any[] = [];
                const catLabel: string = tasks[index].name[legendindex] === "" ? "Null" : tasks[index].name[legendindex];
                colorsPersistObject[catLabel] = this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0], index,
                    "barColor", "fillColor", defaultColor).solid.color;
                if (uniquesColorsForLegends.indexOf(sel) === -1) {
                    uniquesColorsForLegends.push({
                        color: colorsPersistObject[catLabel], name: tasks[index].name[legendindex]
                    });
                    Gantt.tasknew.push({
                        color: tasks[index].color, name: sel, repeat: r, selectionId: tasks[index].selectionId
                    });
                    oUniquelegend[index] = sel;
                }
            } else {
                tasks.push({
                    KPIValues: kpiValues, color: settings.barColor.defaultColor, end: endDate, expanded: null, id: index,
                    identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index).createSelectionId(),
                    isLeaf: null, level: null, name: taskValues, numEnd: datamax, numStart: datamin, parentId: null, repeat: r,
                    resource, rowId: null, selected: false, selectionId: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0],
                        index).createSelectionId(), start: startDate, tooltipInfo: null, tooltipValues
                });
                const categoryLabel: string = dataView.categorical.categories[legendIndex].values[index] === null
                    ? "Null" : dataView.categorical.categories[legendIndex].values[index].toString();
                colorsPersistObject[categoryLabel] = this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0],
                    index, "barColor", "fillColor", defaultColor).solid.color;
                uniquesColorsForLegends.push({ color: colorsPersistObject[categoryLabel] });
            }
            return tasks;
        }

        /**
         * Create task objects dataView
         * @param legendUniqueValues 
         * @param dataView 
         * @param index 
         * @param colorPalette 
         * @param taskValues 
         * @param tasks 
         * @param legendIndex 
         * @param settings 
         * @param kpiValues 
         * @param startDate 
         * @param endDate 
         * @param host 
         * @param datamax 
         * @param datamin 
         * @param tooltipValues 
         * @param oUniquelegend 
         * @param resource 
         * @param largest 
         * @param legendindex 
         * @param formatters 
         */
        private static createTasksHelperFunctionSeven(legendUniqueValues, dataView, index, colorPalette, taskValues, tasks, legendIndex, settings,
            kpiValues, startDate, endDate, host, datamax, datamin, tooltipValues, oUniquelegend, resource, largest, legendindex, formatters) {
            if (legendIndex !== -1) {
                legendUniqueValues = (dataView.categorical.categories[legendIndex].values).filter((e, i, arr) => {
                    return arr.lastIndexOf(e) === i;
                });
            }
            const label: string = legendIndex !== -1 ? dataView.categorical.categories[legendIndex].values[index] === null
                ? "Null" : dataView.categorical.categories[legendIndex].values[index].toString() : "Null";
            const catPresent: boolean = label in colorsPersistObject;
            const defaultColor: Fill = {
                solid: {
                    color: catPresent ? colorsPersistObject[label] : colorPalette.getColor(label).value
                }
            };
            colorsPersistObject[label] = defaultColor.solid.color;
            let taskColor: any, cnt: number = 0;
            const length: number = taskValues.length;
            cnt = this.switchCaseHelper(length, dataView, cnt);
            this.setErrorMessage(errorMessage);
            for (const j of taskValues) {
                for (const i of tasks) {
                    if (taskValues[cnt] === i.name[cnt]) {
                        taskColor = i.color;
                        break;
                    }
                }
            }
            if (legendIndex === -1) {
                taskColor = this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0], index, "barColor", "fillColor", defaultColor).solid.color;
            }
            if (taskColor !== undefined) {
                r = 1;
                tasks = this.createTasksHelperFunction(settings, kpiValues, taskColor, endDate, index, host, dataView, taskValues, datamax,
                    datamin, resource, startDate, tooltipValues, tasks);
            }
            else {
                r = 0;
                tasks = this.createTasksHelperFunctionSix(settings, dataView, index, defaultColor, kpiValues, host, endDate, startDate, datamax, datamin, taskValues,
                    tooltipValues, oUniquelegend, legendindex, resource, tasks, legendIndex);
            }
            Gantt.selectionIdHash[index] = false;
            // Non Hierarchy
            if (dataView.metadata.objects === undefined || dataView.metadata.objects.taskLabels === undefined || !dataView.metadata.objects.taskLabels.isHierarchy) {
                tasks[index].tooltipInfo = Gantt.getTooltipInfo(tasks[index], formatters, dataView, index);
            }
            largest = index;
            if (legendIndex !== -1) {
                uniquelegend = (dataView.categorical.categories[legendIndex].values).filter((e, i, arr) => {
                    return arr.lastIndexOf(e) === i;
                });
            }
            legIndex = legendIndex;
            return largest;
        }

        /**
         * Create task objects dataView
         * @param categoriesdata 
         * @param orderOfSorting 
         * @param firstVisit 
         * @param largest 
         * @param hashArr 
         * @param tasks 
         * @param categoryRoles 
         * @param viewport 
         * @param settings 
         * @param barsLegend 
         * @param legendIndex 
         * @param dataView 
         * @param oUnique 
         * @param oUniquelegend 
         * @param formatters 
         * @param columnSource 
         * @param valuesdata 
         * @param kpiRoles 
         * @param legendindex 
         * @param host 
         * @param legendData 
         * @param colorPalette 
         * @param tooltipRoles 
         */
        private static createTasksHelperFunctionFive(categoriesdata, orderOfSorting, firstVisit, largest, hashArr, tasks: ITask[], categoryRoles, viewport,
            settings, barsLegend, legendIndex, dataView, oUnique, oUniquelegend, formatters, columnSource, valuesdata, kpiRoles, legendindex, host, legendData,
            colorPalette, tooltipRoles) {
            categoriesdata[0].values.map((child: any, index: number) => {
                legendIndex = -1;
                let startDate: Date = null, endDate: Date = null, datamin: number = null, datamax: number = null;
                if ((Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1)
                    && typeof Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1) === typeof this.earliestStartDate) ||
                    (Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1)
                        && typeof Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1) === typeof this.earliestStartDate)) {
                    startDate = Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1);
                    endDate = Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1);
                    startDate = startDate ? startDate : new Date();
                    endDate = endDate ? endDate : new Date();
                    Gantt.isDateData = true;
                } else {
                    datamin = Gantt.getCategoricalTaskProperty<number>(columnSource, valuesdata, GanttRoles.startDate, index, -1);
                    datamax = Gantt.getCategoricalTaskProperty<number>(columnSource, valuesdata, GanttRoles.endDate, index, -1);
                    if (datamax == null || datamin > datamax) {
                        datamax = datamin;
                    }
                    if (datamin == null || datamin > datamax) {
                        datamin = datamax;
                    }
                    if (Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1) ||
                        Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1)) {
                        Gantt.isDateData = false;
                    }
                }
                let resource: string = Gantt.getCategoricalTaskProperty<string>(columnSource, valuesdata, GanttRoles.resource, index, -1);
                let kpiValues: IKPIValues[] = [], tooltipValues: ITooltipDataValues[] = [], taskValues: string[] = [], duration: number = 0;
                this.forLoopHelper(categoriesdata, categoryRoles, index, taskValues, kpiRoles, dataView, kpiValues, tooltipRoles, tooltipValues);
                const kpiRolesLength: number = kpiRoles.length;
                for (let kpiValueCounter: number = 0; kpiValueCounter < kpiRolesLength; kpiValueCounter++) {
                    kpiValues = this.createTasksForLoopHelper(categoriesdata, kpiRoles, kpiValueCounter, dataView, kpiValues, index);
                }
                const tooltipRolesLength: number = tooltipRoles.length;
                for (let tooltipValueCounter: number = 0; tooltipValueCounter < tooltipRolesLength; tooltipValueCounter++) {
                    let name: string = <string>categoriesdata[kpiRoles[tooltipValueCounter]].source.displayName;
                    let value: string = <string>categoriesdata[kpiRoles[tooltipValueCounter]].values[index];
                    tooltipValues.push({ name, value });
                }
                this.setDate(startDate, endDate, datamax, datamin);
                duration = this.getDurationData(duration, endDate, startDate, datamax, datamin);
                const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
                let legendUniqueValues: any[] = [];
                categories.forEach((datum: DataViewCategoricalColumn, ka: number) => {
                    if (datum.source.roles.Legend) {
                        legendIndex = ka;
                    }
                })
                largest = this.createTasksHelperFunctionSeven(legendUniqueValues, dataView, index, colorPalette, taskValues, tasks, legendIndex, settings,
                    kpiValues, startDate, endDate, host, datamax, datamin, tooltipValues, oUniquelegend, resource, largest, legendindex, formatters);
            });
            oUniquelegend.forEach((key: any): any => {
                let found: boolean = false;
                uniquelegend = uniquelegend.filter((item: any): any => {
                    if (item === null) {
                        item = "";
                    }
                    if (!found && item === key) {
                        oUnique.push(item);
                        found = true;
                        return false;
                    } else {
                        return true;
                    }
                });
            });
            uniquelegend = oUnique;
            const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
            categories.forEach((datum, a: number) => {
                if (datum.source.roles.Legend) {
                    legendIndex = a;
                }
            });
            uniqueColors = [];
            if (legendIndex !== -1) {
                uniquelegend.forEach((d: PrimitiveValue, i: number): void => {
                    legendData.dataPoints.push({
                        color: uniquesColorsForLegends[i].color, icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: host.createSelectionIdBuilder().withMeasure(d.toString()).createSelectionId(),
                        label: d.toString() === "" ? "(Blank)" : d.toString(), selected: false,
                    });
                    uniqueColors.push({ color: tasks[i].color, name: d }); // name of the label, indicates the legend is selected or not, type of the icon 
                });
            }
            const legendSettings: ILegendSettings = settings.legend;
            if (legendIndex !== -1) {
                barsLegend.changeOrientation(LegendPosition.Top);
                barsLegend.drawLegend(legendData, viewport);
                positionChartArea(d3.select(".gantt-body"),
                    barsLegend);
            }
            let levelofSorting: number = Gantt.sortLevel;
            Gantt.numberOfCategories = categoryRoles.length;
            let iIterator: number = 0;
            tasks = this.sortCategoriesHelperMethod(iIterator, levelofSorting, hashArr, tasks, largest, categoryRoles, firstVisit, orderOfSorting);
            return tasks;
        }

        /**
         * Create task objects dataView
         * @param dataView The data Model.
         * @param formatters task attributes represented format.
         * @param series An array that holds the color data of different task groups.
         */
        private static createTasks(dataView: DataView, host: IVisualHost, formatters: IGanttChartFormatters,
            colorPalette: IColorPalette, settings: IGanttSettings, barsLegend: ILegend, viewport: any): ITask[] {
            let columns: GanttColumns<GanttCategoricalColumns> = GanttColumns.GETCATEGORICALCOLUMNS(dataView);
            const columnSource: DataViewMetadataColumn[] = dataView.metadata.columns;
            let categoriesdata: any = dataView.categorical.categories;
            const iRow: number = 0;
            let valuesdata: DataViewValueColumn[] = dataView.categorical.values, kpiRoles: number[] = [], tooltipRoles: number[] = [], categoryRoles: number[] = [];
            if (!categoriesdata || categoriesdata.length === 0) {
                return;
            }
            Gantt.categoriesTitle = [];
            let tasks: ITask[] = [], hashArr: ITask[];
            const kpiValuesNames: string[] = [], tooltipValuesName: string[] = [], categoryNames: string[] = [];
            this.mapCategoriesData(categoriesdata, categoryNames, kpiRoles, kpiValuesNames, tooltipValuesName, tooltipRoles, categoryRoles);
            Gantt.isKpiPresent = this.isKpiPresentHelper(kpiRoles);
            let largest: number = 0, firstVisit: number = 1, orderOfSorting: string = Gantt.sortOrder;
            Gantt.totalTasksNumber = 0;
            Gantt.maxTaskNameLength = 0;
            Gantt.earliestStartDate = new Date();
            Gantt.lastestEndDate = new Date();
            Gantt.tasknew = [];
            let legendData: LegendData = { dataPoints: [], fontSize: 8, title: "Legend" };
            const oUniquelegend: any = [], oUnique: any = [];
            let legendindex: number, legendIndex = -1;
            const catlength: number = dataView.categorical.categories.length;
            for (let catindex: number = 0; catindex < catlength; catindex++) {
                if (dataView.categorical.categories[catindex].source.roles.hasOwnProperty("Legend")) {
                    legendindex = catindex;
                    break;
                }
            }
            tasks = this.createTasksHelperFunctionFive(categoriesdata, orderOfSorting, firstVisit, largest, hashArr, tasks, categoryRoles, viewport,
                settings, barsLegend, legendIndex, dataView, oUnique, oUniquelegend, formatters, columnSource, valuesdata, kpiRoles, legendindex, host,
                legendData, colorPalette, tooltipRoles);
            return tasks;
        }

        /**
         * 
         * @param type 
         */
        private static getDateType(type: string): number {
            switch (type) {
                case "Day":
                    return millisecondsInADay;
                case "Week":
                    return millisecondsInWeek;
                case "Month":
                    return millisecondsInAMonth;
                case "Quarter":
                    return millisecondsInAQuarter;
                case "Year":
                    return millisecondsInAYear;
                default:
                    return millisecondsInWeek;
            }
        }

        /**
         * 
         */
        private static getQuarterName(timeinmilliseconds: number): string {
            let date: Date = new Date(timeinmilliseconds);
            let month: number = date.getMonth() + 1;
            let year: number = date.getFullYear();
            let quarter: string = "";
            // Find quarter number of the date based on month number
            if (month <= 3) {
                quarter = "Q1";
            } else if (month <= 6) {
                quarter = "Q2";
            } else if (month <= 9) {
                quarter = "Q3";
            } else {
                quarter = "Q4";
            }
            return quarter + spaceLiteral + year;
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateTaskLabels(settings: IGanttSettings): VisualObjectInstance[] {
            const taskLabelsSettings: ITaskLabelsSettings = settings.taskLabels;
            const instances: VisualObjectInstance[] = [{
                displayName: "Category Labels",
                objectName: "taskLabels",
                properties: {
                    show: taskLabelsSettings.show,
                    fill: taskLabelsSettings.fill,
                    fontSize: taskLabelsSettings.fontSize > 20 ? 20 : taskLabelsSettings.fontSize,
                    fontFamily: taskLabelsSettings.fontFamily,
                    isExpanded: taskLabelsSettings.isExpanded,
                    isHierarchy: taskLabelsSettings.isHierarchy
                },
                selector: null
            }];
            instances[0].properties = {
                show: taskLabelsSettings.show,
                fill: taskLabelsSettings.fill,
                fontSize: taskLabelsSettings.fontSize > 20 ? 20 : taskLabelsSettings.fontSize,
                fontFamily: taskLabelsSettings.fontFamily,
                isExpanded: taskLabelsSettings.isExpanded,
                isHierarchy: taskLabelsSettings.isHierarchy
            };
            return instances;
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateColumnHeader(settings: IGanttSettings): VisualObjectInstance[] {
            const columnHeaderSettings: IColumnHeaderSettings = settings.columnHeader;
            return [{
                displayName: "Column Header",
                objectName: "columnHeader",
                properties: {
                    fill: columnHeaderSettings.fill,
                    fill2: columnHeaderSettings.fill2,
                    columnOutline: columnHeaderSettings.columnOutline,
                    fontFamily: columnHeaderSettings.fontFamily,
                    fontSize: columnHeaderSettings.fontSize > 20 ? 20 : columnHeaderSettings.fontSize
                },
                selector: null
            }];
        }

        /**
         * 
         */
        private static enumerateTaskResource(settings: IGanttSettings): VisualObjectInstance[] {
            const taskResourceSettings: ITaskResourceSettings = settings.taskResource;
            return [{
                displayName: "Data Labels",
                objectName: "taskResource",
                properties: {
                    show: taskResourceSettings.show,
                    position: taskResourceSettings.position,
                    fill: taskResourceSettings.fill,
                    fontSize: taskResourceSettings.fontSize > 20 ? 20 : taskResourceSettings.fontSize,
                    fontFamily: taskResourceSettings.fontFamily
                },
                selector: null
            }];
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateTaskGridLines(settings: IGanttSettings): VisualObjectInstance[] {
            const taskGridLinesSettings: ITaskGridLinesSettings = settings.taskGridlines;
            return [{
                displayName: "Grid Lines",
                objectName: "taskGridLines",
                properties: {
                    show: taskGridLinesSettings.show,
                    fill: taskGridLinesSettings.fill,
                    interval: taskGridLinesSettings.interval
                },
                selector: null
            }];
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateDateType(settings: IGanttSettings): VisualObjectInstance[] {
            const dateTypeSettings: IDateTypeSettings = settings.dateType;
            return [{
                displayName: "Gantt Date Type",
                objectName: "dateType",
                properties: {
                    type: dateTypeSettings.type,
                    enableToday: dateTypeSettings.enableToday
                },
                selector: null
            }];
        }

        /**
         * 
         * @param settings 
         * @param kpiData 
         */
        private static enumerateKPIColumnTypePosition(settings: IGanttSettings, kpiData:
            IKPIConfig[]): VisualObjectInstance[] {
            const kpiColumnTypeSettings: IKPIColumnTypeSettings = settings.kpiColumnType;
            const instances: VisualObjectInstance[] = [];
            let counter: number;
            for (counter = 0; counter < kpiData.length; counter++) {
                let inst: VisualObjectInstance;
                inst = {
                    displayName: kpiData[counter].name,
                    objectName: "kpiColumnType",
                    properties: {
                        type: kpiData[counter].type
                    },
                    selector: kpiData[counter].identity

                };
                instances.push(inst);
            }
            return instances;
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateScrollPosition(settings: IGanttSettings): VisualObjectInstance[] {
            const scrollPositionSettings: IScrollPositionSettings = settings.scrollPosition;
            const instances: VisualObjectInstance[] = [{
                displayName: "Position",
                objectName: "scrollPosition",
                properties: {
                },
                selector: null
            }];
            if (Gantt.isDateData) {
                instances[0].properties = {
                    position: scrollPositionSettings.position
                };
            } else {
                instances[0].properties = {
                    position2: scrollPositionSettings.position2
                };
            }
            return instances;
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateDisplayRatio(settings: IGanttSettings): VisualObjectInstance[] {
            const displayRatioSettings: IDisplayRatioSettings = settings.displayRatio;
            return [{
                displayName: "ratio",
                objectName: "displayRatio",
                properties: {
                    ratio: displayRatioSettings.ratio
                },
                selector: null
            }];
        }

        /**
         * 
         * @param settings 
         */
        private static enumerateLegend(settings: IGanttSettings): VisualObjectInstance[] {
            const legendSettings: ILegendSettings = settings.legend;
            return [{
                displayName: "Legend",
                objectName: "legend",
                properties: {
                    show: legendSettings.show
                },
                selector: null
            }];
        }

        /**
         * 
         * @param options 
         * @param settings 
         */
        private static enumerateBarColor(options: any, settings: IGanttSettings): VisualObjectInstance[] {
            const barSettings: IBarColor = settings.barColor, limiter: number = this.viewModelNew.tasksNew.length;
            const legendLength: number = uniquelegend.length, instances: VisualObjectInstance[] = [];
            let index: number = 0;
            instances.push({
                displayName: `Show All`,
                objectName: "barColor",
                properties: { showall: settings.barColor.showall },
                selector: null
            });
            if (!settings.taskLabels.isHierarchy) {
                if (settings.barColor.showall) {
                    if (uniquelegend.length === 0) {
                        for (const iIterator of this.viewModelNew.tasksNew) {
                            if (iIterator.repeat === 1) {
                                instances.push({
                                    displayName: `Bars color ${index + 1}`,
                                    objectName: "barColor",
                                    properties: { fillColor: iIterator.color },
                                    selector: iIterator.selectionId.getSelector()
                                });
                                index++;
                            }
                        }
                    } else {
                        let categoryIndx: number = 0;
                        const categoryll: any = this.viewModelNew.dataView.categorical.categories;
                        for (let indx: number = 0; indx < categoryll.length; indx++) {
                            if (categoryll[indx].source.roles.hasOwnProperty("Legend")) {
                                categoryIndx = indx;
                                break;
                            }
                        }
                        for (const iIterator of this.viewModelNew.tasksNew) {
                            if (iIterator.repeat === 0) {
                                instances.push({
                                    displayName: iIterator.name[categoryIndx] === "" ? "(Blank)" : iIterator.name[categoryIndx],
                                    objectName: "barColor",
                                    properties: { fillColor: iIterator.color },
                                    selector: iIterator.selectionId.getSelector()
                                });
                            }
                        }
                    }
                } else {
                    instances.push({
                        displayName: `Default color`,
                        objectName: "barColor",
                        properties: { defaultColor: settings.barColor.defaultColor },
                        selector: null
                    });
                }
            } else {
                if (settings.barColor.showall) {
                    if (uniquelegend.length === 0) {
                        instances.push({
                            displayName: `Default color`,
                            objectName: "barColor",
                            properties: { defaultColor: settings.barColor.defaultColor },
                            selector: null
                        });
                    } else {
                        for (const iIterator of Gantt.tasknew) {
                            const displayName: any = iIterator.name;
                            let selectionId: any = iIterator.selectionId;
                            let selectionIdLen: number = selectionId.length;
                            if (uniquelegend.indexOf(displayName.toString()) !== -1 &&
                                iIterator.repeat === 0) {
                                instances.push({
                                    displayName: displayName.toString() === "" ? "(Blank)" : displayName.toString(),
                                    objectName: "barColor",
                                    properties: { fillColor: iIterator.color },
                                    selector: iIterator.selectionId.getSelector()
                                });
                            }
                            index++;
                        }
                        instances.push({
                            displayName: `Default color`,
                            objectName: "barColor",
                            properties: { defaultColor: settings.barColor.defaultColor },
                            selector: null
                        });
                    }
                } else {
                    instances.push({
                        displayName: `Default color`,
                        objectName: "barColor",
                        properties: { defaultColor: settings.barColor.defaultColor },
                        selector: null
                    });
                }
            }
            return instances;
        }

        /**
         * Set the task progress bar in the gantt
         * @param lineNumber Line number that represents the task number
         */
        private static getBarYCoordinate(lineNumber: number): number {
            return (chartLineHeight * lineNumber) + (paddingTasks) - 3;
        }

        /**
         * Method to get bar height
         */
        private static getBarHeight(): number {
            return chartLineHeight / Gantt.chartLineProportion + 8;
        }

        /**
         * Method to get milestone icon
         * @param phaseName 
         */
        private static getMilestoneIcon(phaseName: string): number {
            let milestoneIndex: number = Gantt.milestoneNames.indexOf(phaseName);
            if (-1 === milestoneIndex || milestoneIndex >= Gantt.milestoneShapes.length) {
                milestoneIndex = 0;
            }
            return milestoneIndex;
        }

        /**
         * Method to check if provided date is valid or not
         * @param date 
         */
        private static isValidDate(date: Date): boolean {
            if (Object.prototype.toString.call(date) !== "[object Date]") {
                return false;
            }
            return !isNaN(date.getTime());
        }

        /**
         * Method to get categorical object value
         * @param category 
         * @param index 
         * @param objectName 
         * @param propertyName 
         * @param defaultValue 
         */
        private static getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number,
            objectName: string, propertyName: string, defaultValue: T): T {
            const categoryObjects: DataViewObjects[] = category.objects;
            if (categoryObjects) {
                const categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    const object: DataViewPropertyValue = categoryObject[objectName];
                    if (object) {
                        const property: T = object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }
            }
            return defaultValue;
        }

        /**
         * Get task labels values
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getLabelValuesNew(value: string, property: string, width: number): string {
            if (property === "text") {
                let taskName: string;
                taskName = value;
                if (taskName.length > width) {
                    return taskName.substring(0, width) + ellipsisLiteral;
                }
                return taskName;
            }
            return value;
        }

        /**
         * Get KPI labels values
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getKPIValues(kpiValue: IKPIValues, property: string): string {
            let singleTask: string = kpiValue.value ? kpiValue.value.toString() : "";
            if (property === "text") {
                if (singleTask.length > 8) {
                    singleTask = singleTask.substring(0, 8) + ellipsisLiteral;
                }
                return singleTask;
            } else if (property === "title") {
                return singleTask;
            } else {
                return "";
            }
        }

        /**
         * Get left padding for different levels
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getLeftPadding(iDrillLevel: number): number {
            let iCount: number;
            iCount = Gantt.totalDrillLevel;

            return (iDrillLevel - 1) * Gantt.drillLevelPadding;
        }

        public dataview: any;
        private viewport: IViewport;
        private colors: IColorPalette;
        private legend: ILegend;
        private barsLegend: ILegend;
        private interactiveBehavior?: IInteractiveBehavior;
        private persistExpandCollapseSettings: PersistExpandCollapseSettings;
        private textProperties: TextProperties = {
            fontFamily: "wf_segoe-ui_normal",
            fontSize: PixelConverter.toString(9)
        };
        private margin: IMargin = Gantt.DefaultMargin;
        private body: Selection<HTMLElement>;
        private ganttSvg: Selection<HTMLElement>;
        private viewModel: IGanttViewModel;
        private timeScale: Scale<any, any>;
        private axisGroup: Selection<HTMLElement>;
        private timelineDiv: Selection<HTMLElement>;
        private taskDiv: Selection<HTMLElement>;
        private kpiDiv: Selection<HTMLElement>;
        private barDiv: Selection<HTMLElement>;
        private taskSvg: Selection<HTMLElement>;
        private kpiSvg: Selection<HTMLElement>;
        private timelineSvg: Selection<HTMLElement>;
        private bottomDiv: Selection<HTMLElement>;
        private imageDiv: Selection<HTMLElement>;
        private kpiImageDiv: Selection<HTMLElement>;
        private kpiTitleDiv: Selection<HTMLElement>;
        private drillAllDiv: Selection<HTMLElement>;
        private drillAllDiv2: Selection<HTMLElement>;
        private imageSvg: Selection<HTMLElement>;
        private kpiImageSvg: Selection<HTMLElement>;
        private drillAllSvg: Selection<HTMLElement>;
        private drillAllSvg2: Selection<HTMLElement>;
        private drillAllGroup: Selection<HTMLElement>;
        private kpiTitleSvg: Selection<HTMLElement>;
        private bottommilestoneDiv: Selection<HTMLElement>;
        private bottommilestoneSvg: Selection<HTMLElement>;
        private bottommilestoneGroup: Selection<HTMLElement>;
        private bottomTaskDiv: Selection<HTMLElement>;
        private bottomTaskSvg: Selection<HTMLElement>;
        private backgroundGroupTask: Selection<HTMLElement>;
        private backgroundGroupKPI: Selection<HTMLElement>;
        private backgroundGroupBar: Selection<HTMLElement>;
        private chartGroup: Selection<HTMLElement>;
        private taskGroup: Selection<HTMLElement>;
        private lineGroup: Selection<HTMLElement>;
        private kpiGroup: Selection<HTMLElement>;
        private kpiTitleGroup: Selection<HTMLElement>;
        private toggleTaskGroup: Selection<HTMLElement>;
        private legendDiv: Selection<HTMLElement>;
        private legendSvg: Selection<HTMLElement>;
        private legendGroup: Selection<HTMLElement>;
        private legendIndicatorDiv: Selection<HTMLElement>;
        private arrowDiv: Selection<HTMLElement>;
        private legendIndicatorTitleDiv: Selection<HTMLElement>;
        private legendIndicatorTitleSvg: Selection<HTMLElement>;
        private kpiIndicatorDiv: Selection<HTMLElement>;
        private eventService: IVisualEventService;
        private kpiIndicatorSvg: Selection<HTMLElement>;
        private milestoneIndicatorDiv: Selection<HTMLElement>;
        private milestoneIndicatorSvg: Selection<HTMLElement>;
        private phaseIndicatorDiv: Selection<HTMLElement>;
        private phaseIndicatorSvg: Selection<HTMLElement>;
        private gridGroup: Selection<HTMLElement>;
        private gridRows: d3.selection.Update<DataViewTableRow>;
        private todayGroup: Selection<HTMLElement>;
        private todayindicator: Selection<HTMLElement>;
        private todayText: Selection<HTMLElement>;
        private selectionManager: ISelectionManager;
        private behavior: behavior;
        private interactivityService: IInteractivityService<SelectableDataPoint>;
        private interactivitySelectionService: InteractivitySelectionService;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private host: IVisualHost;
        private isInteractiveChart: boolean = false;
        private offset: number;
        private options: any;
        private bodyElement: any;
        private selectionHandler: ISelectionHandler;
        constructor(options: VisualConstructorOptions) {
            this.eventService = options.host.eventService;
            this.init(options);
        }

        /**
         * Method to set the error statement for particular cases
         * @param errorStatement        - error message to be displayed
         */
        public errorMessageHandler(errorStatement) {
            this.clearViewport();
            Gantt.ganttDiv.classed("gantt_hidden", true);
            Gantt.errorDiv.classed("gantt_hidden", false);
            Gantt.errorText.text(errorStatement);
        }

        /**
         * Method to display error messages if proper fields are not selected
         * @param hasStart 
         * @param hasEnd 
         * @param legendCategory 
         */
        public errorMessageHelperFunction(hasStart, hasEnd, legendCategory) {
            if (!this.viewModel || !this.viewModel.tasksNew) {
                const errorStatement: string = "Please add data to the Category field to load the visual";
                this.errorMessageHandler(errorStatement);
                return;
            } else if (this.viewModel.tasksNew.length === 0) {
                const errorStatement: string = "There is no data to display";
                this.errorMessageHandler(errorStatement);
                return;
            } else if (!hasStart && !hasEnd) {
                const errorStatement: string = "Please add data to the Start and End field to load the visual";
                this.errorMessageHandler(errorStatement);
                return;
            } else if (!hasStart) {
                const errorStatement: string = "Please add data to the Start field to load the visual";
                this.errorMessageHandler(errorStatement);
                return;
            } else if (!hasEnd) {
                const errorStatement: string = "Please add data to the End field to load the visual";
                this.errorMessageHandler(errorStatement);
                return;
            } else if (!legendCategory) {
                const errorStatement: string = 'Please select a field that is already present in "Category"';
                this.errorMessageHandler(errorStatement);
                return;
            } else {
                Gantt.errorDiv.classed("gantt_hidden", true);
                Gantt.ganttDiv.classed("gantt_hidden", false);
            }
        }

        /**
         * Method to get the data and render the visual
         * @param startDate1 
         * @param monthNum 
         * @param yearNum 
         * @param endDate1 
         */
        public updateHelperFunctionOne(dateArray, monthNum, yearNum) {
            // If type is not day
            // handle start date for tick label
            if ("Week" === this.viewModel.settings.dateType.type) {
                dateArray[0].setHours(0, 0, 0, 0);
                dateArray[0].setDate(dateArray[0].getDate() - 1);
            }
            else {
                monthNum = dateArray[0].getMonth();
                if ("Year" === this.viewModel.settings.dateType.type) {
                    monthNum = 0;
                }
                else if ("Quarter" === this.viewModel.settings.dateType.type) {
                    if (monthNum < 3) {
                        monthNum = 0;
                    }
                    else if (monthNum < 6) {
                        monthNum = 3;
                    }
                    else if (monthNum < 9) {
                        monthNum = 6;
                    }
                    else {
                        monthNum = 9;
                    }
                }
                dateArray[0] = new Date(dateArray[0].getFullYear(), monthNum);
            }
            // handle end date for tick label
            monthNum = dateArray[1].getMonth();
            if ("Week" === this.viewModel.settings.dateType.type) {
                dateArray[1].setHours(0, 0, 0, 0);
                dateArray[1].setDate(dateArray[1].getDate() + 1);
                let daysToAdd: number = 0;
                daysToAdd = 7 - (Math.round(Math.abs((dateArray[1].getTime() - dateArray[0].getTime()) / (24 * 60 * 60 * 1000)))) % 7;
                dateArray[1].setDate(dateArray[1].getDate() + daysToAdd);
            } else {
                if ("Year" === this.viewModel.settings.dateType.type) {
                    monthNum = monthNum + 12;
                }
                else if ("Quarter" === this.viewModel.settings.dateType.type) {
                    monthNum = monthNum + 3;
                    monthNum = monthNum - monthNum % 3;
                }
                else if ("Month" === this.viewModel.settings.dateType.type) {
                    monthNum = monthNum + 1;
                }
                if (monthNum >= 12) {
                    yearNum = 1; monthNum = 0;
                }
                dateArray[1] = new Date(dateArray[1].getFullYear() + yearNum, monthNum);
            }
            return dateArray;
        }

        /**
         * Method to get the data and render the visual
         * @param options 
         */
        public addInteractivityService(options): VisualUpdateOptions {
            if (this.interactivityService) {
                let behaviorOptions: any = {
                    behavior: this.behavior, dataPoints: legendData, interactivityService: this.interactivityService,
                    legendSelection: d3.selectAll(".legendItem"), taskSelection: this.taskGroup.selectAll(Selectors.singlePhase.selectorName),
                };
                this.interactivityService.bind(behaviorOptions);
            }
            if (this.viewModel.settings.columnHeader.columnOutline === "leftOnly" || this.viewModel.settings.columnHeader.columnOutline === "leftRight" ||
                this.viewModel.settings.columnHeader.columnOutline === "frame") {
                const drillAllPanelWidth: number = $(".gantt_drillAllPanel2").width();
                $(".gantt_drillAllPanel2").width((drillAllPanelWidth - 1) + pxLiteral);
            }
            this.sortCategories(this);
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_category0").hide();
            }
            // updating visual according to the selections
            this.syncSelectionState(d3.selectAll(dotLiteral + Selectors.taskRect.className), this.selectionManager.getSelectionIds());
            // Persist colors array
            let properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[`captionValue`] = JSON.stringify(colorsPersistObject);
            let caption1: VisualObjectInstancesToPersist = {
                replace: [{ objectName: "caption", properties, selector: null }]
            };
            this.host.persistProperties(caption1);
            return options;
        }

        /**
         * Method to get the data and render the visual for datasets where start date is provided and gantt data is in date format
         * @param startDate 
         * @param endDate 
         * @param yearNum 
         * @param monthNum 
         * @param dateTypeMilliseconds 
         * @param ticks 
         * @param datamax 
         * @param datamin 
         * @param categoryLengthPrev 
         */
        public updateHelperFunctionThree(startDate, endDate, yearNum, monthNum, dateTypeMilliseconds, ticks, datamax, datamin, categoryLengthPrev) {
            let startDate1: Date = new Date(startDate.toString()), endDate1: Date = new Date(endDate.toString());
            yearNum = 0;
            let dateArray: any = [startDate1, endDate1];
            // Set both start and end dates for day
            if ("Day" === this.viewModel.settings.dateType.type) {
                startDate1.setHours(0, 0, 0, 0);
                endDate1.setDate(endDate1.getDate() + 1);
                endDate1.setHours(0, 0, 0, 0);
            }
            else {
                dateArray =  this.updateHelperFunctionOne(dateArray, monthNum, yearNum);
                startDate1 = dateArray[0]; 
                endDate1 = dateArray[1];
            }
            ticks = Math.ceil(Math.round(endDate1.valueOf() - startDate1.valueOf()) / dateTypeMilliseconds);
            ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
            Gantt.totalTicks = ticks;
            let axisLength: number = ticks * Gantt.defaultTicksLength;
            if (this.viewModel.settings.dateType.type === "Day") {
                ticks = 2 * (Math.ceil(Math.round(endDate1.valueOf() - startDate1.valueOf()) / dateTypeMilliseconds));
                ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                axisLength = 2 * ticks * Gantt.defaultTicksLength;
            }
            let rightSectionWidth: number = Gantt.visualWidth - Gantt.taskLabelWidth - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
            if (rightSectionWidth > axisLength) {
                axisLength = rightSectionWidth;
            }
            let viewportIn: IViewport = {
                height: this.viewport.height, width: axisLength
            };
            Gantt.xAxisPropertiesParamter = {
                axisLength, datamax, datamin, endDate: endDate1, startDate: startDate1, textProperties: this.textProperties, ticks, viewportIn
            };
            let xAxisProperties: IAxisProperties = this.calculateAxes(viewportIn, this.textProperties, datamin, datamax, startDate1, endDate1, axisLength, ticks, false);
            this.timeScale = <Scale<number, number>>xAxisProperties.scale;
            let ganttWidth: number = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
            if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                Gantt.scrollHeight = 17;
            }
            else {
                Gantt.scrollHeight = 0;
            }
            this.updateChartSize();
            this.renderCustomLegendIndicator();
            this.updateSvgSize(this, axisLength);
            this.renderAxis(xAxisProperties);
            this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
            if (Gantt.isDateData) {
                this.createTodayLine(Gantt.currentTasksNumber);
            }
            let taskSvgWidth: number = $(dotLiteral + Selectors.taskPanel.className).width();
            Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
            if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
            }
            this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
            this.updateElementsPositions(this.viewport, this.margin);
        }

        /**
         * Method to get the data and render the visual where data max is neither null or undefined
         * @param ticks 
         * @param datamin 
         * @param datamax 
         * @param endDate 
         * @param startDate 
         * @param categoryLengthPrev 
         */
        public updateHelperFunctionFour(ticks, datamin, datamax, endDate, startDate, categoryLengthPrev) {
            ticks = 15;
            if (datamin === datamax) {
                datamax = datamin + 1;
                ticks = 2;
            }
            else if (datamax > 1) {
                ticks = Math.ceil(Math.round(datamax.valueOf() - datamin.valueOf()));
                ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                if (ticks > 15) {
                    ticks = 15;
                }
            } else if (datamax > 0 && datamax < 1) {
                ticks = datamax.valueOf() - datamin.valueOf();
                ticks = ticks * 10;
            }
            Gantt.totalTicks = ticks;
            let axisLength: number = ticks * Gantt.defaultTicksLength;
            let rightSectionWidth: number = Gantt.visualWidth - Gantt.taskLabelWidth - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
            if (rightSectionWidth > axisLength) {
                axisLength = rightSectionWidth;
            }
            let viewportIn: IViewport = {
                height: this.viewport.height, width: axisLength
            };
            Gantt.xAxisPropertiesParamter = {
                axisLength, datamax, datamin, endDate, startDate, textProperties: this.textProperties, ticks, viewportIn
            };
            let xAxisProperties: IAxisProperties = this.calculateAxes(viewportIn, this.textProperties, datamin, datamax, null, null, axisLength, ticks, false);
            this.timeScale = <Scale<number, number>>xAxisProperties.scale;
            const ganttWidth: number = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
            if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                Gantt.scrollHeight = 17;
            }
            else {
                Gantt.scrollHeight = 0;
            }
            this.updateChartSize();
            this.renderCustomLegendIndicator();
            this.updateSvgSize(this, axisLength);
            this.renderAxis(xAxisProperties);
            this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
            if (Gantt.isDateData) {
                this.createTodayLine(Gantt.currentTasksNumber);
            }
            let taskSvgWidth: number = $(dotLiteral + Selectors.taskPanel.className).width();
            Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
            if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
            }
            this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
            this.updateElementsPositions(this.viewport, this.margin);
        }

        /**
         * Method to get the data and render the visual for datasets where datamax is undefined and gantt data is not in date format
         * @param datamin 
         * @param datamax 
         * @param ticks 
         * @param categoryLengthPrev 
         * @param endDate 
         * @param startDate 
         */
        public updateHelperFunctionFive(datamin, datamax, ticks, categoryLengthPrev, endDate, startDate) {
            datamin = 0;
            datamax = 1;
            ticks = 2;
            Gantt.totalTicks = ticks;
            let axisLength: number = ticks * Gantt.defaultTicksLength, rightSectionWidth: number;
            rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
            if (rightSectionWidth > axisLength) {
                axisLength = rightSectionWidth;
            }
            let viewportIn: IViewport = {
                height: this.viewport.height, width: axisLength
            }; Gantt.xAxisPropertiesParamter = {
                axisLength, datamax, datamin, endDate, startDate, textProperties: this.textProperties, ticks, viewportIn
            };
            let xAxisProperties: IAxisProperties = this.calculateAxes(viewportIn, this.textProperties, datamin, datamax, null, null, axisLength, ticks, false);
            this.timeScale = <Scale<number, number>>xAxisProperties.scale;
            let ganttWidth: number = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
            if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                Gantt.scrollHeight = 17;
            }
            else {
                Gantt.scrollHeight = 0;
            }
            this.updateChartSize();
            this.renderCustomLegendIndicator();
            this.updateSvgSize(this, axisLength);
            this.renderAxis(xAxisProperties);
            this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
            if (Gantt.isDateData) {
                this.createTodayLine(Gantt.currentTasksNumber);
            }
            let taskSvgWidth: number = $(dotLiteral + Selectors.taskPanel.className).width();
            Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
            if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
            }
            this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
            this.updateElementsPositions(this.viewport, this.margin);
        }

        /**
         * Method to get the data and render the visual
         * @param options 
         */
        public updateHelperFunctionSix(options): VisualUpdateOptions {
            if (options.type === 2) {
                if (this.viewModel.settings.taskLabels.isExpanded) {
                    d3.select(".gantt_task-lines").attr("visibility", "visible");
                    d3.select(".gantt_toggle-task-group").attr("visibility", "visible");
                    $(".gantt_bottomTaskDiv").show();
                    d3.select("#gantt_ToggleIcon").attr("href", Gantt.collapseImage);
                    d3.select("#gantt_ToggleIcon").classed("collapse", true);
                    d3.select("#gantt_ToggleIcon").classed("expand", false);
                    Gantt.taskLabelWidth = Gantt.taskLabelWidthOriginal;
                } else {
                    d3.select(".gantt_task-lines").attr("visibility", "hidden");
                    d3.select(".gantt_toggle-task-group").attr("visibility", "hidden");
                    $(".gantt_bottomTaskDiv").hide();
                    d3.select("#gantt_ToggleIcon").attr("href", Gantt.expandImage);
                    d3.select("#gantt_ToggleIcon").classed("collapse", false);
                    d3.select("#gantt_ToggleIcon").classed("expand", true);
                }
            }
            return options;
        }

        /**
         * Method to get the data and render the visual
         * @param options 
         */
        public updateHelperFunctionSeven(options): VisualUpdateOptions {
            if (!options.dataViews || !options.dataViews[0] ||
                options.dataViews[0].categorical.categories[0].values.length === 0) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "There is no data to display";
                Gantt.errorText.text(errorStatement); return;
            }
            return options;
        }

        /**
         * 
         * @param iHeaderWidth 
         * @param iTextWidth 
         * @param width 
         */
        public viewModelSettingsUpdate(iHeaderWidth, iTextWidth, width) {
            if (this.viewModel.settings.taskLabels.width <= 1) {
                Gantt.iHeaderSingleCharWidth = iHeaderWidth * 1.5;
            }
            if (this.viewModel.settings.taskLabels.width <= 5) {
                Gantt.singleCharacterWidth = iTextWidth * 0.8;
            }
            singleCharacter.remove();
            if (this.viewModel.settings.taskLabels.width < 0) {
                this.viewModel.settings.taskLabels.width = 0;
            }
            else if (this.viewModel.settings.taskLabels.width > Gantt.maxTaskNameLength) {
                this.viewModel.settings.taskLabels.width = Gantt.maxTaskNameLength;
            }
            if (isNaN(this.viewModel.settings.taskGridlines.interval) || this.viewModel.settings.taskGridlines.interval.toString().length === 0 ||
                parseInt(this.viewModel.settings.taskGridlines.interval.toString(), 10) < 0) {
                this.viewModel.settings.taskGridlines.interval = 0;
            } else if (isNaN(this.viewModel.settings.taskGridlines.interval) || this.viewModel.settings.taskGridlines.interval.toString().length === 0 ||
                parseInt(this.viewModel.settings.taskGridlines.interval.toString(), 10) > 100) {
                this.viewModel.settings.taskGridlines.interval = 100;
            }
            let tasksNewNameLength = this.viewModel.tasksNew[0].name.length;
            let constantsArray: number[] = [15, 40, 65, 90, 114];
            width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width * this.viewModel.tasksNew[0].name.length;
            for (let i: number = 0; i < 5; i++) {
                if (tasksNewNameLength == i + 1) {
                    width = width + constantsArray[i];
                } else if (tasksNewNameLength > 4) {
                    width = width + constantsArray[4];
                }
            }
        }

        /**
         * Method to view or show legend
         */
        public viewModelLegendUpdate() {
            if ((this.viewModel.settings.legend.show && (this.viewport.width > $(".gantt_legendIndicatorPanel").innerWidth() + 100)
                && this.viewport.height > $(".gantt_legendIndicatorPanel").innerHeight() + 50 && this.viewModel.kpiData.length > 0)
                && (parseFloat(d3.select(".gantt_legendPanel").style("left")) > parseFloat(d3.select(".gantt_barPanel").style("left")))) {
                $(".gantt_legendPanel").show();
                if ($("#LegendToggleImage").hasClass("visible")) {
                    $(".gantt_legendIndicatorPanel").show(); $(".arrow").show();
                } else {
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            } else {
                $(".arrow").hide();
                $(".gantt_legendPanel").hide();
                $(".gantt_legendIndicatorPanel").hide();
            }
        }

        /**
         * Method to get the data and render the visual
         * @param datamin 
         * @param datamax 
         * @param ticks 
         * @param categoryLengthPrev 
         * @param endDate 
         * @param startDate 
         * @param yearNum 
         * @param monthNum 
         * @param dateTypeMilliseconds 
         */
        public updateHelperFunctionEight(datamin, datamax, ticks, categoryLengthPrev, endDate, startDate, yearNum, monthNum, dateTypeMilliseconds) {
            if (datamax === undefined && !Gantt.isDateData) {
                this.updateHelperFunctionFive(datamin, datamax, ticks, categoryLengthPrev, endDate, startDate);
            }
            else if (datamax !== undefined && datamax !== null && datamax !== Gantt.minSafeInteger) {
                this.updateHelperFunctionFour(ticks, datamin, datamax, endDate, startDate, categoryLengthPrev);
            }
            else if (startDate && Gantt.isDateData) {
                this.updateHelperFunctionThree(startDate, endDate, yearNum, monthNum, dateTypeMilliseconds, ticks, datamax, datamin, categoryLengthPrev);
            }
        }

        /**
         * Method to set display ratio
         */
        public setDisplayRatio() {
            if (Gantt.currentDisplayRatio < Gantt.minDisplayRatio && Gantt.minDisplayRatio <= 80) {
                this.viewModel.settings.displayRatio.ratio = Gantt.minDisplayRatio;
            }
            else if (Gantt.currentDisplayRatio > 80 || Gantt.minDisplayRatio > 80) {
                this.viewModel.settings.displayRatio.ratio = 80;
            }
        }

        /**
         * Method to get the data and render the visual
         * @param options 
         * @param iTextWidth 
         * @param textProperties 
         * @param width 
         * @param widthFromPercent 
         * @param objects 
         * @param headerFontFamily 
         * @param headerFontSize 
         */
        public updateHelperFunctionNine(options, iTextWidth, textProperties, width, widthFromPercent, objects, headerFontFamily, headerFontSize) {
            let iHeaderWidth: number = 0, headerProperties: TextProperties = {
                fontFamily: headerFontFamily, fontSize: headerFontSize + pxLiteral, text: "W"
            };
            iTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iHeaderWidth = textMeasurementService.measureSvgTextWidth(headerProperties);
            Gantt.iHeaderSingleCharWidth = iHeaderWidth * 0.8;
            Gantt.iKPIHeaderSingleCharWidth = iHeaderWidth * 0.8;
            Gantt.singleCharacterWidth = iTextWidth * 0.74;
            this.viewModelSettingsUpdate(iHeaderWidth, iTextWidth, width);
            Gantt.taskLabelWidthOriginal = width;
            this.viewport = _.clone(options.viewport);
            Gantt.prevDisplayRatio = Gantt.currentDisplayRatio;
            Gantt.currentDisplayRatio = this.viewModel.settings.displayRatio.ratio;
            Gantt.kpiLabelWidthOriginal = Gantt.kpiLabelWidth * this.viewModel.kpiData.length;
            Gantt.kpiLabelWidth = Gantt.kpiLabelWidthOriginal;
            Gantt.taskLabelWidthOriginal = (this.viewport.width - Gantt.kpiLabelWidthOriginal) * Gantt.currentDisplayRatio / 100;
            Gantt.columnHeaderBgColor = this.viewModel.settings.columnHeader.fill2;
            Gantt.minDisplayRatio = Math.ceil((100 * ((0.01 * this.viewport.width) + Gantt.kpiLabelWidthOriginal)) / this.viewport.width);
            this.setDisplayRatio();
            Gantt.currentDisplayRatio = this.viewModel.settings.displayRatio.ratio;
            let defaultGanttRatio: number = Math.ceil((100 * (Gantt.taskLabelWidthOriginal + Gantt.kpiLabelWidthOriginal)) / this.viewport.width);
            if (Gantt.minDisplayRatio > Gantt.currentDisplayRatio) {
                Gantt.minDisplayRatio = 80;
            }
            Gantt.taskLabelWidthOriginal = (Gantt.currentDisplayRatio - Gantt.minDisplayRatio) * this.viewport.width / 100;
            options = this.updateHelperFunctionSix(options);
            if (d3.select("#gantt_ToggleIcon").classed("collapse")) {
                Gantt.taskLabelWidth = width;
            }
            else {
                Gantt.taskLabelWidth = 20;
            }
            if (Gantt.kpiLabelWidth === 0) {
                $(".gantt_kpiImagePanel").hide();
            }
            else {
                if (d3.select("#gantt_KPIToggle").classed("expand")) {
                    Gantt.kpiLabelWidth = 20;
                }
                $(".gantt_kpiImagePanel").show();
            }
            Gantt.visualCoordinates = { height: this.viewport.height, width: this.viewport.width };
            if (this.viewModel.settings.taskLabels.show) {
                if (d3.select("#gantt_ToggleIcon").classed("collapse")) {
                    Gantt.taskLabelWidth = Gantt.taskLabelWidthOriginal;
                } else {
                    Gantt.taskLabelWidth = 0;
                }
                d3.selectAll(".gantt_timelinePanel, .gantt_barPanel").style({ "border-left-width": "1px" });
            } else {
                Gantt.taskLabelWidth = -20;
            }
            Gantt.visualWidth = this.viewport.width;
            if (this.viewport.width < Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 50) {
                Gantt.taskLabelWidth = -10;
                Gantt.kpiLabelWidth = 0;
                $(".gantt_taskPanel, .gantt_imagePanel , .gantt_kpiPanel, .gantt_kpiTitlePanel, .gantt_kpiImagePanel, .gantt_bottomTaskDiv").hide();
            }
            else {
                $(".gantt_taskPanel, .gantt_imagePanel").show();
                if (!this.viewModel.settings.taskLabels.show) {
                    Gantt.taskLabelWidth = -20;
                }
                if (Gantt.kpiLabelWidth !== 0) {
                    $(".gantt_kpiPanel, .gantt_kpiTitlePanel, .gantt_kpiImagePanel, .gantt_bottomTaskDiv").show();
                }
            }
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_bottomTaskDiv").hide();
            }
            widthFromPercent = this.viewport.width * Gantt.currentDisplayRatio / 100;
            if (widthFromPercent > width) {
                this.offset = (widthFromPercent - width) / this.viewModel.dataView.categorical.categories.length;
            }
            this.margin = Gantt.DefaultMargin;
            if (this.viewModel.settings.dateType.enableToday) {
                Gantt.bottomMilestoneHeight = 23;
            } else {
                Gantt.bottomMilestoneHeight = 5;
            }
            const dateTypeMilliseconds: number = Gantt.getDateType(this.viewModel.settings.dateType.type);
            let startDate: Date, endDate: Date, ticks: number, monthNum: number, yearNum: number;
            let datamin: number, datamax: number, categoryLengthPrev: number;
            if (Gantt.dataMIN !== Gantt.maxSafeInteger) {
                datamin = Gantt.dataMIN;
            }
            if (Gantt.dataMAX !== Gantt.minSafeInteger) {
                datamax = Gantt.dataMAX;
            }
            startDate = Gantt.earliestStartDate;
            endDate = Gantt.lastestEndDate;
            categoryLengthPrev = getValue<number>(objects, "categoryColumnsWidth", "categoryLength", 0);
            this.updateHelperFunctionEight(datamin, datamax, ticks, categoryLengthPrev, endDate, startDate, yearNum, monthNum, dateTypeMilliseconds);
            this.adjustResizing(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width, this.viewModel);
            this.viewModelLegendUpdate();
            d3.selectAll(".legendItem").on("click", (d: SelectableDataPoint) => { });
            options = this.addInteractivityService(options);
            return options;
        }

        /**
         * 
         */
        public ifElseHelperFunctionUpdate(valuesLength, startAndEndBool, valuesArray) {
            for (let iCounter: number = 0; iCounter < valuesLength; iCounter++) {
                if (valuesArray[iCounter].source.roles[startDateLiteral]) {
                    startAndEndBool[0] = true;
                }
                if (valuesArray[iCounter].source.roles[endDateLiteral]) {
                    startAndEndBool[1] = true;
                }
            }
            return startAndEndBool;
        }

        /**
         * Method to get the data and render the visual
         * @param options       - Contains references to the size of the container and the dataView which contains all the data the visual had queried.
         */
        public update(options: VisualUpdateOptions): void {
            try {
                this.eventService.renderingStarted(options);
                d3.selectAll(".legend").remove();
                d3.selectAll(".gantt_task-resource").remove();
                resourcePresent = false;
                uniquelegend = [];
                uniquesColorsForLegends = [];
                Gantt.arrGantt = [];
                Gantt.colorsIndex = 0;
                Gantt.kpiLabelWidth = 75;
                Gantt.globalOptions = options;
                Gantt.dataMAX = Gantt.minSafeInteger;
                options.dataViews = options.dataViews ? options.dataViews : null;
                const categoriesArray: any = options.dataViews[0].categorical.categories, valuesArray: any = options.dataViews[0].categorical.values;
                const categoryLength: number = options.dataViews[0].categorical.categories.length, valuesLength: number = options.dataViews[0].categorical.values.length;
                this.dataview = options.dataViews[0];
                const valuesdata: DataViewValueColumn = this.dataview.categorical.values;
                for (let valueIterator: number = 0; valueIterator < valuesLength; valueIterator++) {
                    if (valuesdata[valueIterator].source.roles.Resource) {
                        resourcePresent = true;
                        break;
                    }
                }
                positionChartArea(d3.select(".gantt-body"), this.barsLegend);
                options = this.updateHelperFunctionSeven(options);
                let legendCategory: boolean = true;
                for (let index: number = 0; index < categoryLength; index++) {
                    if (categoriesArray[index].source.roles.Legend) {
                        iterator = 1;
                        legendCategory = (categoriesArray[index].source.roles.Category) ? true : false; break;
                    }
                }
                if (iterator === 1) {
                    this.barsLegend = createLegend(this.options.element, false, this.interactivityService, true);
                }
                let hasStart: boolean = false, hasEnd: boolean = false;
                let startAndEndBool = [hasStart, hasEnd];
                if (valuesArray) {
                    startAndEndBool = this.ifElseHelperFunctionUpdate(valuesLength, startAndEndBool, valuesArray);
                }
                hasStart = startAndEndBool[0], hasEnd = startAndEndBool[1];
                const objects: DataViewObjects = options.dataViews[0].metadata.objects;
                const colorsPersistedArray: string = getValue<string>(objects, "caption", "captionValue", "{}"); // Retrieve persisted colors array value
                const colorsParsedArray: any = JSON.parse(colorsPersistedArray);
                if (colorsPersistedArray !== "{}") {
                    colorsPersistObject = colorsParsedArray;
                }
                let getJSONString1: string = getValue<string>(objects, "sortAttributes", "sortOrder", "asc");
                let getJSONString2: number = getValue<number>(objects, "sortAttributes", "sortLevel", 0);
                let getJSONString3: number = getValue<number>(objects, "sortAttributes", "prevSortedColumn", -1);
                Gantt.sortOrder = getJSONString1;
                Gantt.sortLevel = getJSONString2;
                Gantt.prevSortedColumn = getJSONString2;
                const thisObj: this = this;
                this.viewModel = Gantt.CONVERTER(this.dataview, this.host, this.colors, this.barsLegend, options.viewport);
                this.persistExpandCollapseSettings = this.viewModel.settings.persistExpandCollapseSettings;
                this.barsLegend.changeOrientation(LegendPosition.Top);
                Gantt.expandCollapseStates = JSON.parse(this.persistExpandCollapseSettings.expandCollapseState || "{}");
                Gantt.viewModelNew = this.viewModel; $(".gantt_errorPanel").remove();
                if (this.barDiv) {
                    this.barDiv.remove();
                    this.kpiDiv.remove();
                    this.taskDiv.remove();
                }
                $(".gantt-body").remove();
                this.createViewport(this.bodyElement);
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                Gantt.errorText.text("");
                this.errorMessageHelperFunction(hasStart, hasEnd, legendCategory);
                Gantt.isPhaseHighlighted = false;
                d3.selectAll(".tooltip-content-container").style("visibility", "hidden");
                Gantt.milestoneNames = Gantt.milestoneNames.sort();
                Gantt.currentTasksNumber = Gantt.totalTasksNumber = this.viewModel.tasksNew.length;
                $("#gantt_DrillAll").show();
                let width: number = 0, widthFromPercent: number = 0;
                const normalizer: number = this.viewModel.settings.taskLabels.fontSize;
                this.body.append("text").text("").classed("singleCharacter", true).style({
                    "font-family": "Segoe UI", "font-size": normalizer + pxLiteral
                });
                singleCharacter = d3.selectAll(".singleCharacter");
                const taskLabelsFontSize: number = this.viewModel.settings.taskLabels.fontSize;
                const taskLabelsFontFamily: string = this.viewModel.settings.taskLabels.fontFamily;
                let iTextWidth: number = 0;
                let textProperties: TextProperties = {
                    fontFamily: taskLabelsFontFamily, fontSize: (taskLabelsFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral, text: "W"
                };
                const headerFontSize: number = this.viewModel.settings.columnHeader.fontSize;
                const headerFontFamily: string = this.viewModel.settings.columnHeader.fontFamily;
                options = this.updateHelperFunctionNine(options, iTextWidth, textProperties, width, widthFromPercent, objects, headerFontFamily, headerFontSize);
                this.eventService.renderingFinished(options);
            } catch (exeption) {
                this.eventService.renderingFailed(options, exeption);
            }
        }

        /**
         * This function gets called for each of the
         * objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         * @param options                   - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
            VisualObjectInstanceEnumeration {
            if (!this.viewModel || !this.viewModel.settings) {
                return [];
            }
            let settings: IGanttSettings;
            settings = this.viewModel.settings;
            switch (options.objectName) {
                case "legend": {
                    if (Gantt.isKpiPresent) {
                        return Gantt.enumerateLegend(settings);
                    } else {
                        return null;
                    }
                }
                case "taskLabels": {
                    return Gantt.enumerateTaskLabels(settings);
                }
                case "columnHeader": {
                    return Gantt.enumerateColumnHeader(settings);
                }
                case "taskResource": {
                    if (Gantt.isChartHasDataLabels(this.viewModel.dataView)) {
                        return Gantt.enumerateTaskResource(settings);
                    } else {
                        return null;
                    }
                }
                case "dateType": {
                    if (Gantt.isDateData) {
                        return Gantt.enumerateDateType(settings);
                    }
                    return null;
                }
                case "scrollPosition": {
                    return Gantt.enumerateScrollPosition(settings);
                }
                case "kpiColumnType": {
                    if (Gantt.isKpiPresent) {
                        return Gantt.enumerateKPIColumnTypePosition(settings, this.viewModel.kpiData);
                    } else {
                        return null;
                    }
                }
                case "taskGridlines": {
                    return Gantt.enumerateTaskGridLines(settings);
                }
                case "displayRatio": {
                    return Gantt.enumerateDisplayRatio(settings);
                }
                case "barColor": {
                    return Gantt.enumerateBarColor(options, settings);
                }
                default: {
                    return [];
                }
            }
        }

        /**
         * 
         */
        public persistSortState(): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            properties[sortOrderLiteral] = Gantt.sortOrder;
            properties[sortLevelLiteral] = Gantt.sortLevel;
            properties[prevSortedColumnLiteral] = Gantt.prevSortedColumn;
            let persistSettings: VisualObjectInstancesToPersist;
            persistSettings = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: "sortAttributes",
                        properties,
                        selector: null
                    }]
            };
            this.host.persistProperties(persistSettings);
        }

        /**
         * 
         * @param categoryLength 
         * @param viewModel 
         */
        public persistResizeData(categoryLength: number, viewModel: IGanttViewModel): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            Gantt.categoryColumnsWidth = "";
            let iColumnWidth: number = 0;
            let objects: DataViewObjects;
            objects = this.viewModel.dataView.metadata.objects;
            let categoryLengthPrev: number;
            const hyphenX1Colon: string = "-x1:";
            const hyphenX2Colon: string = "-x2:";
            const hyphenX1Colon0SemiColon: string = "-x1:0;";
            const hyphenX2Colon0SemiColon: string = "-x2:0;";
            const hyphenX2Colon100SemiColon: string = "-x2:100;";
            let lastRectX: number;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            barPanelLeft = parseFloat(d3.select(".gantt_barPanel").style("left"));
            kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));
            categoryLengthPrev = getValue<number>(objects, "categoryColumnsWidth", "categoryLength", 0);
            if (categoryLengthPrev && categoryLengthPrev !== 0 && categoryLengthPrev === categoryLength) {
                for (let iIterator: number = 0; iIterator < categoryLength; iIterator++) {
                    lastRectX = parseFloat($(headerCellClassLiteral + iIterator).attr("x"));
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + d3.select(taskColumnClassLiteral + iIterator).attr("x") + semiColonLiteral;
                    if (iIterator === 0) {
                        if (categoryLength === 1) {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral
                                + parseFloat($(".gantt_kpiPanel").css("left")) + semiColonLiteral;
                        } else {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral
                                + parseFloat($(headerCellClassLiteral + (iIterator + 1)).attr("x")) + semiColonLiteral;
                        }
                    } else if (iIterator === categoryLength - 1) {
                        if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 10) || lastRectX > barPanelLeft - 10) {
                            Gantt.categoryColumnsWidth +=
                                columnLiteral + iIterator + colonLiteral + 100 + semiColonLiteral;
                        } else {
                            if (kpiPanelWidth > 0) {
                                iColumnWidth = (parseFloat(d3.select(".gantt_kpiPanel").style("left"))
                                    - parseFloat($(headerCellClassLiteral + (iIterator)).attr("x")));
                            } else {
                                iColumnWidth =
                                    (this.viewport.width * this.viewModel.settings.displayRatio.ratio / 100) + 20
                                    - parseFloat($(headerCellClassLiteral + (iIterator)).attr("x"));
                            }

                            Gantt.categoryColumnsWidth +=
                                columnLiteral + iIterator + colonLiteral + iColumnWidth + semiColonLiteral;
                        }
                    } else {
                        iColumnWidth = parseFloat($(headerCellClassLiteral + (iIterator + 1)).attr("x"))
                            - parseFloat($(headerCellClassLiteral + (iIterator)).attr("x"));
                        Gantt.categoryColumnsWidth +=
                            columnLiteral + iIterator + colonLiteral + iColumnWidth + semiColonLiteral;
                    }
                }
                properties[ganttProperties.categoryColumnsWidth.categoryLength.propertyName]
                    = categoryLength.toString();
            }
            properties[ganttProperties.categoryColumnsWidth.width.propertyName]
                = JSON.stringify(Gantt.categoryColumnsWidth);
            let totalCategories: number;
            totalCategories = this.viewModel.tasksNew[0].name.length;
            let width: VisualObjectInstancesToPersist;
            width = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: ganttProperties.categoryColumnsWidth.width.objectName,
                        properties,
                        selector: null
                    }]
            };
            this.host.persistProperties(width);
        }

        /**
         * 
         * @param arrGantt 
         */
        public persistExpandCollapseState(arrGantt: any): void {
            const properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[`expandCollapseState`] = JSON.stringify(arrGantt);
            const persistExpandCollapseSettings: VisualObjectInstancesToPersist = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: "persistExpandCollapseSettings",
                        properties,
                        selector: null
                    }]
            };
            this.host.persistProperties(persistExpandCollapseSettings);
        }

        /**
         * 
         * @param categoryLength 
         * @param viewModel 
         */
        public resetResizeData(categoryLength: number, viewModel: IGanttViewModel): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            Gantt.categoryColumnsWidth = "";
            const taskSvgWidth: number = parseInt(this.taskSvg.attr("width"), 10);
            const singleColumnWidth: number = taskSvgWidth / categoryLength;
            const literalFifteen: string = "15";
            const literalFive: string = "5";
            let lastRectX: number;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            const hyphenX1Colon: string = "-x1:";
            const hyphenX2Colon: string = "-x2:";
            const hyphenX1Colon0SemiColon: string = "-x1:0;";
            const hyphenX2Colon0SemiColon: string = "-x2:0;";
            const hyphenX2Colon100SemiColon: string = "-x2:100;";
            barPanelLeft = parseFloat(d3.select(".gantt_barPanel").style("left"));
            kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));
            lastRectX = (categoryLength - 1) * singleColumnWidth;
            for (let iIterator: number = 0; iIterator < categoryLength; iIterator++) {
                if (iIterator === 0) {
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + literalFifteen + semiColonLiteral;
                } else {
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + (iIterator * singleColumnWidth) + semiColonLiteral;
                }
                Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral + singleColumnWidth + semiColonLiteral;
            }
            properties[ganttProperties.categoryColumnsWidth.categoryLength.propertyName] = categoryLength;
            properties[ganttProperties.categoryColumnsWidth.width.propertyName] =
                JSON.stringify(Gantt.categoryColumnsWidth);
            let totalCategories: number;
            totalCategories = this.viewModel.tasksNew[0].name.length;
            let width: VisualObjectInstancesToPersist;
            width = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: ganttProperties.categoryColumnsWidth.width.objectName,
                        properties,
                        selector: null
                    }]
            };
            this.host.persistProperties(width);
        }

        /**
         * Initializer method
         * @param options 
         */
        private init(options: VisualConstructorOptions): void {
            this.host = options.host;
            this.options = options;
            this.colors = options.host.colorPalette;
            this.selectionManager = options.host.createSelectionManager();
            this.selectionManager.registerOnSelectCallback(() => {
                this.syncSelectionState(
                    d3.selectAll(dotLiteral + Selectors.taskRect.className),
                    this.selectionManager.getSelectionIds()
                );
            });
            this.body = d3.select(options.element);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                this.host.tooltipService,
                options.element);
            this.bodyElement = $(options.element);
            this.behavior = new behavior();
            this.interactivityService = createInteractivitySelectionService(this.host);
            this.interactivitySelectionService = new InteractivitySelectionService(options.host);
            this.createViewport(this.bodyElement);
            this.clearViewport();
            Gantt.ganttDiv.classed("gantt_hidden", true);
            Gantt.errorDiv.classed("gantt_hidden", false);
            Gantt.errorText.text("");
            this.barsLegend = createLegend(this.options.element,
                false, null, true);
        }

        /**
         * Create the viewport area of the gantt chart
         * @param element 
         */
        private createViewport(element: JQuery): void {
            // create div container to the whole viewport area
            Gantt.errorDiv = this.body.append("div").classed(Selectors.errorPanel.className, true).classed("gantt_hidden", true);
            Gantt.errorText = Gantt.errorDiv.append("p");
            Gantt.ganttDiv = this.body.append("div").classed(Selectors.body.className, true);
            this.legendDiv = Gantt.ganttDiv.append("div").classed(Selectors.legendPanel.className, true);
            this.legendSvg = this.legendDiv.append("svg").classed(Selectors.legendSvg.className, true);
            this.legendGroup = this.legendSvg.append("g").classed(Selectors.legendGroup.className, true);
            this.legendGroup.append("image")
                .attr({
                    "class": "gantt_legendToggle",
                    "height": 13,
                    "width": 13,
                    "x": 0,
                    "xlink:href": Gantt.legendIcon
                });
            this.legendGroup.append("text")
                .attr({
                    "class": "gantt_legendToggle gantt_legendText",
                    "stroke": "#212121",
                    "stroke-width": 0.5,
                    "x": 18,
                    "y": 10
                }).text("Legend");
            this.legendGroup.append("image")
                .attr({
                    "class": "gantt_legendToggle notVisible",
                    "height": 12,
                    "id": "LegendToggleImage",
                    "width": 12,
                    "x": 62,
                    "xlink:href": Gantt.drillDownImage
                });
            this.addLegendHideShowEvents(this);
            this.arrowDiv = Gantt.ganttDiv.append("div").attr({ class: "gantt_arrow-up arrow" });
            this.legendIndicatorDiv = Gantt.ganttDiv.append("div").classed(Selectors.legendIndicatorPanel.className, true);
            this.legendIndicatorTitleDiv = this.legendIndicatorDiv.append("div").classed(Selectors.legendIndicatorTitlePanel.className, true);
            this.legendIndicatorTitleSvg = this.legendIndicatorTitleDiv.append("svg").classed(Selectors.legendIndicatorTitleSvg.className, true);
            this.kpiIndicatorDiv = this.legendIndicatorDiv.append("div").classed(Selectors.kpiIndicatorPanel.className, true);
            this.kpiIndicatorSvg = this.kpiIndicatorDiv.append("svg").classed(Selectors.kpiIndicatorSvg.className, true);
            this.milestoneIndicatorDiv = this.legendIndicatorDiv.append("div").classed(Selectors.milestoneIndicatorPanel.className, true);
            this.milestoneIndicatorSvg = this.milestoneIndicatorDiv.append("svg").classed(Selectors.milestoneIndicatorSvg.className, true);
            this.phaseIndicatorDiv = this.legendIndicatorDiv.append("div").classed(Selectors.phaseIndicatorPanel.className, true);
            this.phaseIndicatorSvg = this.phaseIndicatorDiv.append("svg").classed(Selectors.phaseIndicatorSvg.className, true);
            this.timelineDiv = Gantt.ganttDiv.append("div").classed(Selectors.timeLinePanel.className, true);
            this.timelineSvg = this.timelineDiv.append("svg").classed(Selectors.className.className, true);
            this.axisGroup = this.timelineSvg.append("g").classed(Selectors.axisGroup.className, true);
            this.kpiTitleDiv = Gantt.ganttDiv.append("div").classed(Selectors.kpiTitlePanel.className, true);
            this.kpiTitleSvg = this.kpiTitleDiv.append("svg");
            this.kpiTitleGroup = this.kpiTitleSvg.append("g").classed(Selectors.kpiLines.className, true);
            this.drillAllDiv = Gantt.ganttDiv.append("div").classed(Selectors.drillAllPanel.className, true);
            this.drillAllDiv2 = Gantt.ganttDiv.append("div").classed(Selectors.drillAllPanel2.className, true);
            this.drillAllSvg = this.drillAllDiv.append("svg").classed(Selectors.drillAllSvg.className, true);
            this.drillAllSvg2 = this.drillAllDiv2.append("svg").classed(Selectors.drillAllSvg2.className, true);
            this.drillAllGroup = this.drillAllSvg2.append("g");
            this.imageDiv = Gantt.ganttDiv.append("div").classed(Selectors.imagePanel.className, true);
            this.imageSvg = this.imageDiv.append("svg");
            this.imageSvg.append("image").attr("id", "gantt_ToggleIcon").attr("class", "collapse")
                .attr("xlink:href", Gantt.collapseImage).attr("width", 12).attr("height", 12);
            this.kpiImageDiv = Gantt.ganttDiv.append("div").classed(Selectors.kpiImagePanel.className, true);
            this.kpiImageSvg = this.kpiImageDiv.append("svg");
            this.kpiImageSvg.append("image").attr("id", "gantt_KPIToggle").attr("class", "collapse")
                .attr("xlink:href", Gantt.collapseImage).attr("width", 12).attr("height", 12);
            this.addExpandCollapseEvent(this);
            this.bottomDiv = Gantt.ganttDiv.append("div").classed(Selectors.bottomPannel.className, true);
            this.kpiDiv = this.bottomDiv.append("div").classed(Selectors.kpiPanel.className, true);
            this.kpiSvg = this.kpiDiv.append("svg").classed(Selectors.kpiSvg.className, true);
            this.backgroundGroupKPI = this.kpiSvg.append("g").classed(Selectors.backgroundBoxSvg.className, true);
            this.kpiGroup = this.kpiSvg.append("g").classed(Selectors.kpiLines.className, true);
            this.taskDiv = this.bottomDiv.append("div").classed(Selectors.taskPanel.className, true);
            this.taskSvg = this.taskDiv.append("svg").classed(Selectors.taskSvg.className, true);
            this.backgroundGroupTask = this.taskSvg.append("g").classed(Selectors.backgroundBoxSvg.className, true);
            this.lineGroup = this.taskSvg.append("g").classed(Selectors.taskLines.className, true);
            this.toggleTaskGroup = this.taskSvg.append("g").classed(Selectors.toggleTaskGroup.className, true);
            this.barDiv = this.bottomDiv.append("div").classed(Selectors.barPanel.className, true);
            this.ganttSvg = this.barDiv.append("svg").classed(Selectors.barSvg.className, true);
            this.backgroundGroupBar = this.ganttSvg.append("g").classed(Selectors.backgroundBoxSvg.className, true);
            this.gridGroup = this.ganttSvg.append("g").classed(Selectors.gridGroup.className, true);
            this.chartGroup = this.ganttSvg.append("g").classed(Selectors.chart.className, true);
            this.taskGroup = this.chartGroup.append("g").classed(Selectors.tasks.className, true);
            this.bottommilestoneDiv = Gantt.ganttDiv.append("div").classed(Selectors.bottomMilestonePanel.className, true);
            this.bottommilestoneSvg = this.bottommilestoneDiv.append("svg").classed(Selectors.bottomMilestoneSvg.className, true);
            this.todayGroup = this.bottommilestoneSvg.append("g").classed(Selectors.todayGroup.className, true);
            this.bottommilestoneGroup = this.bottommilestoneSvg.append("g").classed(Selectors.bottomMilestoneGroup.className, true);
            this.bottomTaskDiv = Gantt.ganttDiv.append("div").classed(Selectors.bottomTaskDiv.className, true);
            this.bottomTaskSvg = this.bottomTaskDiv.append("svg").classed(Selectors.bottomTaskSvg.className, true);
        }

        /**
         * Clear the viewport area
         */
        private clearViewport(): void {
            this.body.selectAll(Selectors.legendItems.selectorName).remove();
            this.body.selectAll(Selectors.legendTitle.selectorName).remove();
            this.axisGroup.selectAll(Selectors.axisTick.selectorName).remove();
            this.axisGroup.selectAll(Selectors.domain.selectorName).remove();
            this.gridGroup.selectAll("*").remove();
            this.bottommilestoneGroup.selectAll("*").remove();
            this.lineGroup.selectAll("*").remove();
            this.kpiTitleGroup.selectAll("*").remove();
            this.kpiGroup.selectAll("*").remove();
            this.chartGroup.selectAll(Selectors.chartLine.selectorName).remove();
            this.chartGroup.selectAll(Selectors.taskGroup.selectorName).remove();
            this.chartGroup.selectAll(Selectors.singlePhase.selectorName).remove();
        }

        /**
         * Update div container size to the whole viewport area
         * @param viewport The vieport to change it size
         */
        private updateChartSize(): void {
            if (legendIndex !== -1) {
                positionChartArea(d3.select(".gantt-body"), this.barsLegend);
            }
            this.viewport.width = Math.ceil(this.viewport.width);
            this.viewport.height = Math.ceil(this.viewport.height);
            const heightSize: number = 20;
            Gantt.ganttDiv.style({
                height: PixelConverter.toString(this.viewport.height - heightSize),
                width: PixelConverter.toString(this.viewport.width)
            });
            this.legendDiv.style({ left: PixelConverter.toString(this.viewport.width - Gantt.legendWidth) });
            this.bottomDiv.style({ top: PixelConverter.toString(Gantt.axisHeight), width: PixelConverter.toString(this.viewport.width) });
            this.taskDiv.style({ width: PixelConverter.toString(Gantt.taskLabelWidth + heightSize) });
            this.kpiDiv.style({ left: PixelConverter.toString(Gantt.taskLabelWidth + heightSize), width: PixelConverter.toString(Gantt.kpiLabelWidth) });
            this.kpiTitleDiv.style({
                "background-color": Gantt.columnHeaderBgColor,
                "height": PixelConverter.toString(23),
                "left": PixelConverter.toString(Gantt.taskLabelWidth + heightSize),
                "top": PixelConverter.toString(20),
                "width": PixelConverter.toString(Gantt.kpiLabelWidth)
            });
            this.barDiv.style({
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + heightSize),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth)
            });
            this.timelineDiv.style({
                height: PixelConverter.toString(Gantt.axisHeight),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + heightSize),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.scrollHeight - Gantt.kpiLabelWidth)
            });
            this.imageDiv.style({
                height: PixelConverter.toString(21),
                left: PixelConverter.toString(Gantt.taskLabelWidth + 5),
                width: PixelConverter.toString(15)
            });
            this.kpiImageDiv.style({
                height: PixelConverter.toString(21),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 5),
                width: PixelConverter.toString(15)
            });
            this.drillAllDiv.style({
                height: PixelConverter.toString(Gantt.axisHeight),
                top: PixelConverter.toString(0),
                width: PixelConverter.toString(Gantt.taskLabelWidth + heightSize)
            });
            this.bottommilestoneDiv.style({
                height: PixelConverter.toString(Gantt.bottomMilestoneHeight + Gantt.scrollHeight),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + heightSize),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - heightSize)
            });
            let thisObj: this = this;
            this.bottommilestoneDiv.on("scroll", (): void => {
                let bottomMilestoneScrollPosition: number = 0;
                let bottomMilestonePanel: any;
                bottomMilestonePanel = document.getElementsByClassName("gantt_bottomMilestonePanel");
                Gantt.isScrolled = true;
                if (bottomMilestonePanel) {
                    bottomMilestoneScrollPosition = bottomMilestonePanel[0].scrollLeft;
                    thisObj.setBottomScrollPosition(bottomMilestoneScrollPosition);
                }
            });
            let categoryWidth: number;
            let categoryWidthSvg: number;
            if (!this.viewModel.settings.taskLabels.isHierarchy) {
                categoryWidth = 700;
                categoryWidthSvg = 700;
            } else {
                const divTask: any = this.taskDiv.append("div");
                categoryWidth = $($(divTask)[0]).parent().width();
                categoryWidthSvg = scrollWidth + 75;
            }
            this.bottomTaskDiv.style({
                "bottom": PixelConverter.toString(0),
                "height": PixelConverter.toString(28),
                "left": PixelConverter.toString(0),
                "overflow-x": "auto",
                "overflow-y": "hidden",
                "position": "absolute",
                "width": PixelConverter.toString(categoryWidth)
            }).on("scroll", (): void => {
                let bottomTaskScrollPosition: number = 0;
                let bottomTaskDiv: any = document.getElementsByClassName("gantt_bottomTaskDiv");
                Gantt.isScrolled = true;
                if (bottomTaskDiv) {
                    bottomTaskScrollPosition = bottomTaskDiv[0].scrollLeft;
                    thisObj.setBottomTaskScrollPosition(bottomTaskScrollPosition);
                }
            });
            this.bottomTaskSvg.style({
                bottom: PixelConverter.toString(0),
                height: PixelConverter.toString(Gantt.scrollHeight + 10),
                left: PixelConverter.toString(0),
                position: "absolute",
                width: PixelConverter.toString(categoryWidthSvg)
            });
        }

        /**
         * 
         * @param tasks 
         * @param taskLabelwidth 
         * @param viewModel 
         */
        private adjustResizing(tasks: ITask[], taskLabelwidth: number, viewModel: IGanttViewModel): void {
            let pressed: boolean = false, moved: boolean = false, start: JQuery = undefined;
            let columnClass: string, startX: number, lastRectStartX: number;
            let startWidth: number, xDiff: number, calculateWidth: number;
            let calculatedLastRectX: number, thisObj: this = this, columnNumber: number = 0;
            let categoriesLength: number = tasks[0].name.length;
            const resizerClassLiteral: string = ".gantt_resizer";
            $(resizerClassLiteral).mousedown(function (e: JQueryMouseEventObject): void {
                Gantt.isResizeStarted = true;
                columnClass = this.getAttribute("columnId");
                start = $(dotLiteral + columnClass);
                pressed = true;
                startX = e.pageX;
                startWidth = this.x.animVal.value;
                lastRectStartX = parseFloat($(headerCellClassLiteral + (tasks[0].name.length - 1)).attr("x"));
            });
            let columnX: string[] = [], scrollerX: string[] = [], verticalLinesX1: string[] = [];
            let horizontalLinesX1: string[] = [], horizontalLinesX2: string[] = [], scroller: number;
            let kpiLeft: string = d3.select(".gantt_kpiPanel").style("left"), barLeft: string = d3.select(".gantt_barPanel").style("left");
            if (!viewModel.settings.taskLabels.isHierarchy) {
                for (let iIterator: number = parseInt(columnNumber + nullStringLiteral, 10);
                    iIterator < tasks[0].name.length; iIterator++) {
                    columnX[iIterator] = d3.select(taskColumnClassLiteral + iIterator).attr("x");
                    if (iIterator !== 0) { scrollerX[iIterator] = d3.select(headerCellClassLiteral + iIterator).attr("x"); }
                }
            }
            let highestLabelLength: number = 0;
            $(document).mousemove((e: JQueryMouseEventObject): void => {
                if (pressed) {
                    moved = true;
                    xDiff = (e.pageX - startX);
                    xDiff = xDiff < (-startWidth + 23) ? (-startWidth + 23) : xDiff;
                    calculateWidth = startWidth + xDiff;
                    calculatedLastRectX = lastRectStartX + xDiff;
                    columnNumber = parseInt(columnClass.substr(10, columnClass.length - 10), 10);
                    let columns: Selection<SVGAElement> = d3.selectAll(taskColumnClassLiteral + (columnNumber - 1));
                    let taskLabelsFontSize: number = viewModel.settings.taskLabels.fontSize;
                    let taskLabelsFontFamily: string = viewModel.settings.taskLabels.fontFamily;
                    let reflectChange: boolean = true, rightMovement: boolean = true;
                    highestLabelLength = 0;
                    let lastRectX: number = 0, allowLeftMove: boolean = true, allowRightMove: boolean = true;
                    lastRectX = parseFloat(d3.select(headerCellClassLiteral + (categoriesLength - 1)).attr("x"));
                    let lastColumns: Selection<SVGAElement> = d3.selectAll(taskColumnClassLiteral + (categoriesLength - 1));
                    columns.each(function (): void {
                        let prevColumnStart: number, currColumnStart: number;
                        if (columnNumber === 1) { prevColumnStart = 15; }
                        else { prevColumnStart = parseFloat(d3.select(headerCellClassLiteral + (columnNumber - 1)).attr("x")); }
                        currColumnStart = parseFloat(d3.select(headerCellClassLiteral + columnNumber).attr("x"));
                        let textProperties: TextProperties = {
                            fontFamily: taskLabelsFontFamily,
                            fontSize: (taskLabelsFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral,
                            text: ""
                        };
                        this.textContent = textMeasurementService.getTailoredTextOrDefault(textProperties, (currColumnStart - prevColumnStart));
                    });
                    scroller = parseInt(columnNumber + nullStringLiteral, 10);
                    let scrollAdd: number;
                    scroller++;
                    let previousColumnStart: number, currentColumnStart: number;
                    if (columnNumber === 1) { previousColumnStart = 15; }
                    else { previousColumnStart = parseFloat(d3.select(headerCellClassLiteral + (columnNumber - 1)).attr("x")); }
                    currentColumnStart = parseFloat(d3.select(headerCellClassLiteral + columnNumber).attr("x"));
                    if (reflectChange) {
                        if (calculateWidth >= previousColumnStart) {
                            d3.select(dotLiteral + columnClass).attr("x", calculateWidth);
                            for (let iIterator: number = scroller; iIterator < tasks[0].name.length; iIterator++) {
                                scrollAdd = parseFloat(scrollerX[iIterator]) + parseFloat(xDiff.toString());
                                d3.select(headerCellClassLiteral + iIterator).attr("x", scrollAdd);
                            }
                            let sum: number;
                            for (let iIterator: number = parseInt(columnNumber + nullStringLiteral, 10);
                                iIterator < tasks[0].name.length; iIterator++) {
                                sum = parseFloat(columnX[iIterator]) + parseFloat(xDiff.toString());
                                d3.selectAll(taskColumnClassLiteral + iIterator).attr("x", sum);
                                d3.selectAll(categoryIdLiteral + iIterator).attr("x", sum);
                            }
                        }
                    }
                }
            });
            $(document).mouseup((): void => {
                if (pressed) {
                    pressed = false;
                    thisObj.persistResizeData(tasks[0].name.length, viewModel);
                }
                if (moved && columnClass) {
                    columnClass = undefined;
                    moved = false;
                }
            });
            let taskSvgWidth: number;
            taskSvgWidth = $(dotLiteral + Selectors.taskPanel.className).width();
            Gantt.columnWidth = taskSvgWidth / tasks[0].name.length;
            let toggleTasks: Selection<SVGAElement>;
            toggleTasks = d3.selectAll(dotLiteral + Selectors.toggleTask.className);
        }

        /**
         * Method to create the data structure for the visual
         * @param elementIterator 
         * @param hierarchicalData 
         * @param levels 
         * @param color 
         * @param resource 
         * @param kpiData 
         * @param tooltipIndexNew 
         * @param resourceField 
         * @param start 
         * @param end 
         * @param numStart 
         * @param numEnd 
         * @param startDisplayName 
         * @param endDisplayName 
         * @param tooltipInfo 
         */
        private static converterHelperFunctionOne(elementIterator, hierarchicalData, levels, color, resource, kpiData,
            tooltipIndexNew, resourceField, start, end, numStart, numEnd, startDisplayName, endDisplayName, tooltipInfo) {
            elementIterator.forEach((d: any, i: any): any => { // Keep this as a reference to the current level
                let depthCursor: any = hierarchicalData.children, kpiValues: IKPIValues[] = [], lastChildId: number = -1, tooltipValues: ITooltipDataValues[] = [];
                const resourceValues: any = [], measure: any = []; // Go down one level at a time
                levels.forEach((property: any, depth: any): void => { // Look to see if a branch has already been created
                    let index: any; depthCursor.forEach((child: any, ind: any): void => {
                        if (child.children.length > 0) {
                            if (d[property] === child.name) {
                                index = ind;
                            }
                        }
                    }); // Add a branch if it isn't there
                    if (isNaN(index)) {
                        depthCursor.push({
                            children: [], color, kpiMeasure: {}, kpiValues: [], lastChildId: -1, measure: {}, name: d[property], resource, tooltipValues: []
                        });
                        index = depthCursor.length - 1;
                    }
                    const measures: any = {}, kpiMeasures: any = {};
                    if (depth === levels.length - 1) { // if this is a leaf, add the measure values, else add 0 as the measure value
                        kpiValues = [];
                        lastChildId = d["lastChildId"];
                        kpiData.forEach((kpiMeasure: any): void => {
                            kpiValues.push({
                                name: kpiMeasure.name, value: d[kpiMeasure.name]
                            });
                        });
                        let index: number = 0;
                        tooltipIndexNew.forEach((tooltipMeasure: any): void => {
                            tooltipValues.push({
                                name: tooltipIndexNew[index], value: d[tooltipMeasure]
                            });
                            index++;
                        });
                        resource = d[resourceField] === undefined ? "" : d[resourceField];
                        if (typeof d[startDisplayName] !== "number") {
                            start = new Date(d[startDisplayName]);
                            end = new Date(d[endDisplayName]);
                        } else {
                            numStart = null === d[startDisplayName] ? d[endDisplayName] : d[startDisplayName];
                            numEnd = null === d[endDisplayName] ? d[startDisplayName] : d[endDisplayName];
                        }
                    } else {
                        kpiValues = [];
                        kpiData.forEach((kpiMeasure: any): void => {
                            kpiValues.push({
                                name: kpiMeasure.name, value: null
                            });
                        });
                        resource = null;
                        tooltipInfo = null;
                        start = null;
                        end = null;
                        numStart = null;
                        numEnd = null;
                    }
                    depthCursor[index].kpiValues = kpiValues;
                    depthCursor[index].tooltipValues = tooltipValues;
                    depthCursor[index].resource = resource;
                    depthCursor[index].measure = measures;
                    depthCursor[index].start = start;
                    depthCursor[index].end = end;
                    depthCursor[index].numStart = numStart;
                    depthCursor[index].numEnd = numEnd;
                    depthCursor[index].lastChildId = lastChildId;
                    depthCursor = depthCursor[index].children; // Now reference the new child array as we go deeper into the tree
                });
            });
        }

        /**
         * Method to create the data structure for the visual
         * @param iRow 
         * @param len 
         * @param rows1 
         * @param roleIndexArray 
         * @param dataView 
         * @param displayNameArray 
         * @param totalLength 
         * @param valuesdata 
         * @param counter 
         */
        private static converterHelperFunctionTwo(iRow, len, rows1, roleIndexArray, dataView, displayNameArray, totalLength, valuesdata, counter) {
            for (iRow = 0; iRow < len; iRow++) {
                rows1[iRow] = [];
                let iColumn: number = 0;
                for (const iCat of roleIndexArray[`Category`]) {
                    const format: string = dataView.categorical.categories[iCat].source.format;
                    let value: any = dataView.categorical.categories[iCat].values[iRow];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = valueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = valueFormatter.format(value, format);
                        }
                    }
                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray.push(dataView.categorical.categories[iCat].source.displayName);
                    }
                    iColumn++;
                }
                let startDateFormat: boolean = dateFormat.test(<any>dataView.categorical.values[roleIndexArray[`StartDate`][0]].values[iRow]);
                rows1[iRow][iColumn] = (startDateFormat) ? new Date(valuesdata[roleIndexArray[`StartDate`][0]].values[iRow].toString())
                    : dataView.categorical.values[roleIndexArray[`StartDate`][0]].values[iRow];
                if (displayNameArray.length < totalLength) {
                    displayNameArray.push(valuesdata[roleIndexArray[`StartDate`][0]].source.displayName);
                }
                iColumn++;
                const endDateFormat: boolean = dateFormat.test(<any>dataView.categorical.values[roleIndexArray[`EndDate`][0]].values[iRow]);
                rows1[iRow][iColumn] = (endDateFormat) ? new Date(valuesdata[roleIndexArray[`EndDate`][0]].values[iRow].toString())
                    : (dataView.categorical.values[roleIndexArray[`EndDate`][0]].values[iRow]);
                if (displayNameArray.length < totalLength) {
                    displayNameArray.push(valuesdata[roleIndexArray[`EndDate`][0]].source.displayName);
                }
                iColumn++;
                for (const iCat of roleIndexArray[`Resource`]) {
                    const flag: boolean = dateFormat.test(valuesdata[iCat].values[iRow]), value: any = (flag)
                        ? new Date(valuesdata[iCat].values[iRow].toString()) : valuesdata[iCat].values[iRow];
                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray.push(valuesdata[iCat].source.displayName);
                    }
                    iColumn++;
                }
                for (const iCat of roleIndexArray[`KPIValueBag`]) {
                    const format: string = dataView.categorical.categories[iCat].source.format;
                    let value: any = dataView.categorical.categories[iCat].values[iRow];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = valueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = valueFormatter.format(value, format);
                        }
                    }
                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray.push(dataView.categorical.categories[iCat].source.displayName);
                    }
                    iColumn++;
                }
                for (const iCat of roleIndexArray[`Tooltip`]) {
                    const format: string = valuesdata[iCat].source.format;
                    let value: any = valuesdata[iCat].values[iRow];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = valueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = valueFormatter.format(value, format);
                        }
                    }
                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray.push(valuesdata[iCat].source.displayName);
                    }
                    iColumn++;
                }
                displayNameArray.push("lastChildId");
                rows1[iRow][iColumn] = counter;
                counter++;
            }
        }

        /**
         * 
         * @param length 
         * @param dataView 
         * @param cnt 
         */
        private static switchCaseHelperConverter(length, dataView, cnt): number {
            for (let i: number = 0; i < 5; i++) {
                if (length == i + 1) {
                    if (dataView.categorical.categories[i + 1] !== undefined) {
                        if (dataView.categorical.categories[0].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 0;
                        } else if (dataView.categorical.categories[1].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 1;
                        } else if (dataView.categorical.categories[2].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 2;
                        } else if (dataView.categorical.categories[3].source.displayName === dataView.categorical.categories[i + 1].source.displayName) {
                            cnt = 3;
                        } else {
                            cnt = 3;
                        }
                    }
                    return cnt;
                }
            }
        }

        /**
         * Method to create the data structure for the visual
         * @param children 
         * @param resData 
         * @param tooltipData 
         * @param arr 
         * @param row 
         * @param sumMeasures 
         * @param dataView 
         * @param host 
         * @param settings 
         * @param selectionidindex 
         * @param level1 
         * @param legenduniquecolors 
         */
        private static converterHelperFunctionThree(children, resData, tooltipData, arr, row, sumMeasures, dataView, host,
            settings, selectionidindex, level1, legenduniquecolors) {
            for (let iIterator: number = 0; iIterator < children.length; iIterator++) {
                if (children.length === 1) {
                    row.resource = children[iIterator].resource;
                }
                resData.push(children[iIterator].resource);
                tooltipData.push(arr.children[iIterator].tooltipValues);
            }
            if (tooltipData.length > 0) {
                row.tooltipValues = tooltipData[0];
                arr.tooltipValues = row.tooltipValues;
            }
            if (resData.length > 0) {
                for (let i: number = 0; i < resData.length; i++) {
                    if (resData[i] === "(Blank)") {
                        resData[i] = null;
                    }
                }
                if (typeof (resData[0]) === "number" || resData[0] == null) {
                    row.resource = sumMeasures(row.resource, resData);
                } else {
                    row.resource = resData[0];
                }
                arr.resource = row.resource;
                resData = [];
            }
            if (arr.resource !== null) {
                row.resource = arr.resource;
            }
            row.level = level1;
            if (children.length === 0) {
                row.isLeaf = true;
                row.lastChildId = arr.lastChildId;
                row.selectionId = host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], selectionidindex).createSelectionId();
                selectionidindex++;
            }
            if (uniquelegend.length === 0) {
                row.color = settings.barColor.defaultColor;
            }
            else {
                if (settings.barColor.showall) {
                    if (uniquelegend.indexOf(row.name) !== -1) {
                        for (let index: number = 0; index < uniquelegend.length; index++) {
                            if (row.name === legenduniquecolors[index].label) {
                                row.color = legenduniquecolors[index].color;
                                break;
                            }
                        }
                    } else {
                        row.color = settings.barColor.defaultColor;
                    }
                } else {
                    row.color = settings.barColor.defaultColor;
                }
            }
        }

        /**
         * Method to create the data structure for the visual
         * @param legendRoleLength 
         * @param kpiRoleLength 
         * @param roleIndexArray 
         * @param combine 
         */
        private static converterHelperFunctionFour(legendRoleLength, kpiRoleLength, roleIndexArray, combine) {
            if (legendRoleLength !== 0 || kpiRoleLength !== 0) {
                if (roleIndexArray[`Legend`].length === 3) {
                    roleIndexArray[`Legend`].splice(2, 1);
                }
                if (roleIndexArray[`Legend`].length === 2) {
                    roleIndexArray[`Legend`].splice(0, 1);
                }
                const index: number = roleIndexArray[`Category`].indexOf(roleIndexArray[`Legend`][0]);
                if (index !== -1) {
                    roleIndexArray[`Category`].splice(index, 1);
                }
                const iIndex: number = roleIndexArray[`KPIValueBag`].indexOf(roleIndexArray[`Legend`][0]);
                if (iIndex !== -1) {
                    roleIndexArray[`KPIValueBag`].splice(iIndex, 1);
                }
                combine = combine.reverse();
                const combineLen: number = Math.floor(combine.length / 2);
                for (let iCat: number = 0; iCat < combineLen; iCat++) {
                    const index1: number = roleIndexArray[`Category`].indexOf(combine[iCat]);
                    const index2: number = roleIndexArray[`KPIValueBag`].indexOf(combine[iCat]);
                    roleIndexArray[`Category`].splice(index1, 1);
                    roleIndexArray[`KPIValueBag`].splice(index2, 1);
                }
            }
        }

        /**
         * Method to create the data structure for the visual
         * @param categoryColumns 
         * @param legendIndex1 
         */
        private static converterHelperFunctionFive(categoryColumns, legendIndex1) {
            for (let i: number = 0; i < categoryColumns.length; i++) {
                if ((!categoryColumns[i].source.roles.Category || categoryColumns[i].source.roles.KPIValueBag)
                    && (!categoryColumns[i].source.roles.Category || !categoryColumns[i].source.roles.KPIValueBag)) {
                    categoryColumns.splice(i, 1); i--;
                }
                if (categoryColumns[i].source.roles.Legend) {
                    legendIndex1 = i;
                }
            }
        }

        /**
         * Method to create the data structure for the visual
         * @param categoriesdata 
         * @param columns 
         * @param valuesdata 
         */
        private static converterHelperFunctionSix(categoriesdata, columns, valuesdata) {
            categoriesdata[0].values.map((child: any, index: number) => {
                let startDate: Date = null, endDate: Date = null, datamin: number = null, datamax: number = null;
                if ((Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.startDate, index, -1)
                    && typeof Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.startDate, index, -1) === typeof this.earliestStartDate)
                    || (Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.endDate, index, -1) &&
                        typeof Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.endDate, index, -1) === typeof this.earliestStartDate)) {
                    startDate = Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.startDate, index, -1);
                    endDate = Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.endDate, index, -1);
                    startDate = startDate ? startDate : new Date();
                    endDate = endDate ? endDate : new Date();
                    Gantt.isDateData = true;
                } else {
                    datamin = Gantt.getCategoricalTaskProperty<number>(columns, valuesdata, GanttRoles.startDate, index, -1);
                    datamax = Gantt.getCategoricalTaskProperty<number>(columns, valuesdata, GanttRoles.endDate, index, -1);
                    if (datamax == null || datamin > datamax) {
                        datamax = datamin;
                    }
                    if (datamin == null || datamin > datamax) {
                        datamin = datamax;
                    }
                    if (Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.startDate, index, -1)
                        || Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.endDate, index, -1)) {
                        Gantt.isDateData = false;
                    }
                }
            });
        }

        /**
         * Method to add selection on categories
         * @param row 
         * @param dataView 
         * @param categoryColumns 
         * @param rows 
         */
        private static addSelection(row: object, dataView, categoryColumns, rows) {
            const categoryLen: number = dataView.categorical.categories.length;
            let maxCategoryLen: number = 0;
            for (let k: number = 0; k < categoryLen; k++) {
                if (dataView.categorical.categories[k].source.roles.Category) {
                    maxCategoryLen++;
                    if (maxCategoryLen > 4) {
                        break;
                    }
                }
            }
            let hashArr: {} = {}, catLength: number = categoryColumns.length, hierarchyArray: any[] = [];
            for (const i of rows) {
                if (hashArr[i[`parentId`]] === undefined) {
                    hashArr[i[`parentId`]] = [];
                }
                hashArr[i[`parentId`]].push(i);
            }
            let selection: ISelectionId[];
            for (const yCounter of rows) {
                if (yCounter.isLeaf !== true) {
                    yCounter[`selectionId`] = [];
                }
                yCounter.tooltipInfo = [];
            }
            let jCounter: number = 0;
            const rowslen: number = rows.length - 1;
            jCounter = maxCategoryLen - 1;
            jCounter = 0;
            for (let iCounter: number = rows.length - 1; iCounter > 0; iCounter--) {
                hierarchyArray[rowslen - iCounter] = rows[iCounter][`parentId`];
            }
            const uniqueElements: any = hierarchyArray.filter((item: any, pos: any): any => {
                return hierarchyArray.indexOf(item) === pos;
            });
            uniqueElements.sort((a, b) => {
                return parseFloat(a) - parseFloat(b);
            });
            for (const iCounter of uniqueElements) {
                for (const kCounter of hashArr[iCounter]) {
                    if (kCounter.isLeaf.toString() === "true") {
                        for (const lCounter of rows) {
                            if (lCounter.rowId === kCounter.parentId) {
                                lCounter.selectionId.push(kCounter.selectionId);
                                break;
                            }
                        }
                    }
                }
            }
            if (catLength === 4) {
                for (const iCounter of uniqueElements) {
                    if (hashArr[iCounter] !== undefined) {
                        for (const kCounter of hashArr[iCounter]) {
                            if (kCounter.level === 3) {
                                for (const lCounter of rows) {
                                    if (lCounter.rowId === kCounter.parentId) {
                                        if (kCounter.selectionId.length > 1) {
                                            for (let i: number = 0; i < kCounter.selectionId.length; i++) {
                                                lCounter.selectionId.push(kCounter.selectionId[i]);
                                            }
                                        }
                                        else {
                                            lCounter.selectionId.push(kCounter.selectionId[0]);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (catLength >= 3) {
                for (const iCounter of uniqueElements) {
                    if (hashArr[iCounter] !== undefined) {
                        for (const kCounter of hashArr[iCounter]) {
                            if (kCounter.level === 2) {
                                for (const lCounter of rows) {
                                    if (lCounter.rowId === kCounter.parentId) {
                                        if (kCounter.selectionId.length > 1) {
                                            for (let i: number = 0; i < kCounter.selectionId.length; i++) {
                                                lCounter.selectionId.push(kCounter.selectionId[i]);
                                            }
                                        }
                                        else {
                                            lCounter.selectionId.push(kCounter.selectionId[0]);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Method to push categories into role index array
         * @param categoriesLength 
         * @param dataView 
         * @param roleIndexArray 
         * @param combine 
         */
        private static roleIndexArrayPushCategories(categoriesLength, dataView, roleIndexArray, combine) {
            for (let iCount: number = 0; iCount < categoriesLength; iCount++) {
                if (dataView.categorical.categories[iCount].source.roles.Category) {
                    roleIndexArray[`Category`].push(iCount);
                }
                if (dataView.categorical.categories[iCount].source.roles.Legend) {
                    roleIndexArray[`Legend`].push(iCount);
                }
                if (dataView.categorical.categories[iCount].source.roles.KPIValueBag) {
                    roleIndexArray[`KPIValueBag`].push(iCount);
                }
                if (dataView.categorical.categories[iCount].source.roles.Category && dataView.categorical.categories[iCount].source.roles.KPIValueBag) {
                    combine.push(iCount);
                }
            }
        }

        /**
         * 
         * @param dataView 
         * @param levels 
         * @param arr 
         * @param row 
         * @param sumMeasures 
         * @param host 
         * @param settings 
         * @param selectionidindex 
         * @param level1 
         * @param legenduniquecolors 
         * @param children 
         * @param currentId 
         * @param parentRowId 
         * @param arrGanttLen 
         * @param categoryColumns 
         */
        private static arrowFunctionHelper(dataView, levels, arr, row, sumMeasures, host, settings, selectionidindex, level1,
            legenduniquecolors, children, currentId, parentRowId, arrGanttLen, categoryColumns) {
            const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
            let cnt: number = 0;
            const length: number = levels.length;
            const arrName: any[] = []; arrName.push(arr.name);
            const arr1: any[] = []; arr1.push(arr);
            cnt = this.switchCaseHelperConverter(length, dataView, cnt);
            row.numStart = arr.numStart;
            row.numEnd = arr.numEnd;
            row.identity = null;
            let resData: any = [], tooltipData: any = [];
            this.converterHelperFunctionThree(children, resData, tooltipData, arr, row, sumMeasures, dataView, host, settings,
                selectionidindex, level1, legenduniquecolors);
            row.rowId = currentId;
            row.parentId = parentRowId;
            if (arrGanttLen === 0) {
                row.expanded = false;
                Gantt.arrGantt[row.rowId] = false;
                Gantt.ganttLen = categoryColumns.length;
            } else {
                Gantt.ganttLen = categoryColumns.length;
                row.expanded = Gantt.arrGantt[row.rowId] === true ? true : false;
            }
        }

        /**
         * Method to perform actions if task labels is in hierarchy view
         * @param rows 
         * @param transformedArr 
         * @param dataView 
         * @param categoryColumns 
         * @param tasknewarray 
         * @param tasksNew 
         */
        private static taskLabelsIsHierarchy(rows, transformedArr, dataView, categoryColumns, tasknewarray, tasksNew) {
            rows = transformedArr.reverse();
            rows.splice(0, 1);
            let rowindex: number = 0;
            tasknewarray.reverse();
            for (const index of rows) {
                index.selectionId = [];
                for (const i of tasknewarray) {
                    if (index.lastChildId.toString() === i.mapId.toString()) {
                        index.selectionId = i.selectionId;
                        rowindex++;
                    }
                }
            }
            this.addSelection(rows, dataView, categoryColumns, rows);
            transformedArr = transformedArr.sort((a, b) => {
                return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
            });
            for (const i of transformedArr) {
                for (let j: number = 0; j < uniquelegend.length; j++) {
                    if (i.name === uniquelegend[j]) {
                        legendData.dataPoints[j].color = i.color;
                    }
                }
            }
            for (const index of transformedArr) {
                tasksNew.push(index);
            }
        }

        /**
         * Method to create the data structure for the visual
         * @param host 
         * @param legenduniquecolors 
         * @param barsLegend 
         * @param viewport 
         */
        private static converterHelperFunctionEleven(host, legenduniquecolors, barsLegend, viewport) {
            uniquelegend.forEach((d: PrimitiveValue, ijk: number): void => {
                // type of the legend icon, selectionId of the legend, name of the label, indicates of the legend is selected or not
                legendData.dataPoints.push({
                    color: uniquesColorsForLegends[ijk].color, icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                    identity: host.createSelectionIdBuilder().withMeasure(d.toString()).createSelectionId(), label: d.toString(), selected: false,
                });
                uniqueColors.push({ color: uniquesColorsForLegends[ijk].color, name: d });
            });
            legenduniquecolors = legendData.dataPoints;
            if (legendIndex !== -1) {
                barsLegend.changeOrientation(LegendPosition.Top);
                barsLegend.drawLegend(legendData, viewport);
                positionChartArea(d3.select(".gantt-body"), barsLegend);
            }
            return legenduniquecolors;
        }

        /**
         * Method to create the data structure for the visual
         * @param rowId 
         * @param colorPalette 
         * @param startArr 
         * @param endArr 
         * @param dataView 
         * @param sumMeasures 
         * @param levels 
         * @param host 
         * @param settings 
         * @param selectionidindex 
         * @param legenduniquecolors 
         * @param rows 
         * @param categoryColumns 
         * @param transformedArr 
         * @param tasksNew 
         * @param color 
         * @param end 
         * @param expanded 
         * @param id 
         * @param isLeaf 
         * @param level 
         * @param numEnd 
         * @param numStart 
         * @param parentId 
         * @param repeat 
         * @param selectionId 
         * @param start 
         * @param repeatValue 
         * @param arrGanttLen 
         * @param viewport 
         * @param barsLegend 
         * @param hierarchicalData 
         * @param tasknewarray 
         * @param tooltipInfo 
         */
        private static converterHelperFunctionSeven(rowId, colorPalette, startArr, endArr, dataView, sumMeasures, levels, host, settings, selectionidindex, legenduniquecolors,
            rows, categoryColumns, transformedArr, tasksNew, color, end, expanded, id, isLeaf, level, numEnd, numStart, parentId, repeat, selectionId, start,
            repeatValue, arrGanttLen, viewport, barsLegend, hierarchicalData, tasknewarray, tooltipInfo) {
            const toArray = (arr, level1, parentRowId): void => {
                const resource: string = "(Blank)";
                if (!arr.children) {
                    return;
                }
                level1++;
                rowId++;
                let currentId: number = rowId, children: any = arr.children.slice(0);
                for (const iIterator of children) {
                    toArray(iIterator, level1, currentId);
                }
                const label: string = currentId.toString(), catPresent: boolean = label in colorsPersistObject;
                const defaultColor: Fill = {
                    solid: {
                        color: catPresent ? colorsPersistObject[label] : colorPalette.getColor(currentId.toString()).value
                    }
                };
                colorsPersistObject[currentId.toString()] = defaultColor.solid.color;
                const identity: string = null;
                let selected: boolean = false, KPIValues: IKPIValues[] = [], tooltipValues: IKPIValues[];
                const row: any = {
                    KPIValues, color, end, expanded, id, identity, isLeaf, lastChildId: -1, level, name, numEnd, numStart,
                    parentId, repeat, resource, rowId, selected, selectionId, start, tooltipInfo, tooltipValues
                };
                row.name = arr.name;
                repeatValue.push(row.name);
                let count: number = 0;
                for (const occur of repeatValue) {
                    if (row.name === occur) {
                        count++;
                    }
                }
                if (count > 1) { row.repeat = 1; }
                else { row.repeat = 0; }
                row.id = currentId;
                children = arr.children.slice(0);
                for (const iIterator of children) {
                    if (children.length === 1) {
                        row.start = new Date(iIterator.start);
                        row.end = new Date(iIterator.end);
                        arr.start = row.start;
                        arr.end = row.end;
                    } else {
                        startArr.push(new Date(iIterator.start));
                        endArr.push(new Date(iIterator.end));
                    }
                }
                if (startArr.length > 0) {
                    if (startArr[0] !== null) {
                        row.start = new Date(Math.min.apply(null, startArr));
                        row.end = new Date(Math.max.apply(null, endArr));
                        arr.start = row.start;
                        arr.end = row.end;
                    }
                    startArr = [];
                    endArr = [];
                }
                if (arr.start !== null && arr.end !== null) {
                    row.start = arr.start;
                    row.end = arr.end;
                }
                row.KPIValues = arr.kpiValues;
                row.tooltipValues = arr.tooltipValues;
                children = arr.children.slice(0);
                for (const iIterator of children) {
                    if (children.length === 1) {
                        row.numStart = iIterator.numStart;
                        row.numEnd = iIterator.numEnd;
                        arr.numStart = row.numStart;
                        arr.numEnd = row.numEnd;
                    } else {
                        startArr.push(iIterator.numStart);
                        endArr.push(iIterator.numEnd);
                    }
                }
                if (startArr.length > 0) {
                    if (startArr[0] !== null) {
                        row.numStart = Math.min.apply(null, startArr);
                        row.numEnd = Math.max.apply(null, endArr);
                        arr.numStart = row.numStart;
                        arr.numEnd = row.numEnd;
                    }
                    startArr = [];
                    endArr = [];
                }
                if (arr.numStart !== null && arr.numStart !== null) {
                    row.numStart = arr.numStart;
                    row.numEnd = arr.numEnd;
                }
                this.arrowFunctionHelper(dataView, levels, arr, row, sumMeasures, host, settings, selectionidindex, level1,
                    legenduniquecolors, children, currentId, parentRowId, arrGanttLen, categoryColumns);
                transformedArr.push(row);
            };
            legenduniquecolors = this.converterHelperFunctionEleven(host, legenduniquecolors, barsLegend, viewport);
            if (settings.taskLabels.isHierarchy) {
                toArray(hierarchicalData, -1, rowId);
                this.taskLabelsIsHierarchy(rows, transformedArr, dataView, categoryColumns, tasknewarray, tasksNew);
            }
        }

        /**
         * Method to update dataview objects
         * @param tasksNew 
         * @param dataView 
         * @param selobjchildrencncierarchy 
         * @param rowIndex 
         * @param mycolor 
         */
        private static dataViewObjectsUpdate(tasksNew, dataView, selobjchildrencncierarchy, rowIndex, mycolor) {
            function getDirectChildInHierarchy(sRowID) {
                $.map(tasksNew, (sObj) => {
                    if (sObj.parentId === sRowID) {
                        selobjchildrencncierarchy.push(sObj);
                        getDirectChildInHierarchy(sObj.rowId);
                    }
                });
                return selobjchildrencncierarchy;
            }
            for (let iIterator: number = 0; iIterator < tasksNew.length; iIterator++) {
                if (dataView.metadata.objects === undefined || dataView.metadata.objects.taskLabels === undefined || dataView.metadata.objects.taskLabels.isHierarchy) {
                    tasksNew[iIterator].tooltipInfo = Gantt.getTooltipInfo(tasksNew[iIterator], this.formatters, dataView, iIterator);
                }
                for (const kIterator of legendData.dataPoints) {
                    const seltaskName: any = tasksNew[iIterator].name;
                    if (kIterator.label === seltaskName) {
                        rowIndex = tasksNew[iIterator].rowId; mycolor = kIterator.color; selobjchildrencncierarchy.push(tasksNew[iIterator]);
                        selobjchildrencncierarchy = getDirectChildInHierarchy(rowIndex);
                        for (const jIterator of selobjchildrencncierarchy) {
                            jIterator.color = mycolor;
                        }
                        selobjchildrencncierarchy = [];
                    }
                }
            }
        }

        /**
         * Method to create the data structure for the visual
         * @param arrOptimized 
         * @param categoryColumns 
         * @param categoryColumnsMappings 
         * @param kpiData 
         * @param categoriesdata 
         * @param columns 
         * @param valuesdata 
         * @param settings 
         * @param elementIterator 
         * @param tooltipIndexNew 
         * @param resourceField 
         * @param tasksNew 
         * @param dataView 
         * @param colorPalette 
         * @param host 
         * @param viewport 
         * @param barsLegend 
         * @param rows 
         * @param transformedArr 
         */
        private static converterHelperFunctionEight(arrOptimized, categoryColumns, categoryColumnsMappings, kpiData, categoriesdata, columns, valuesdata,
            settings, elementIterator, tooltipIndexNew, resourceField, tasksNew, dataView, colorPalette, host, viewport, barsLegend, rows, transformedArr) {
            let startArr: any = [], endArr: any = [], id: number = 0, name: any = " ", start: Date, end: Date;
            let numStart: number = null, numEnd: number = null;
            let resource: any = null, color: string = " ", tooltipInfo: VisualTooltipDataItem[], selectionId: ISelectionId;
            let kpiValues: IKPIValues[] = [], tooltipValues: IKPIValues[] = [], startDisplayName: any;
            let endDisplayName: any, level: number = 0, isLeaf: boolean = false, rowId: number, parentId: number = 0, expanded: boolean, repeat: number = 0;
            const repeatValue: any = [];
            $.map(arrOptimized, (e) => {
                if (name === e.sName) {
                    expanded = e.sFlag;
                }
            });
            if (expanded === undefined || null) {
                expanded = false;
            }
            const hierarchicalData: any = {
                children: [], color, end, id, kpiMeasure: {}, kpiValues: [], lastChildId: -1, measure: {}, name: "Total", numEnd, resource,
                selectionId: [], start, tooltipInfo, tooltipValues: []
            }, levels = categoryColumns.map((a) => a.source.displayName);
            categoryColumnsMappings.forEach((measureCol: any): void => {
                hierarchicalData.measure[measureCol.displayName] = 0;
            });
            kpiData.forEach((kpimeasureCol: any): void => {
                hierarchicalData.kpiMeasure[kpimeasureCol.name] = 0;
            });
            categoryColumnsMappings.forEach((measureCol: any): any => {
                if (measureCol.roles.StartDate) {
                    startDisplayName = measureCol.displayName;
                }
                else if (measureCol.roles.EndDate) {
                    endDisplayName = measureCol.displayName;
                } else {
                    return;
                }
            });
            this.converterHelperFunctionSix(categoriesdata, columns, valuesdata);
            if (settings.taskLabels.isHierarchy) {
                this.converterHelperFunctionOne(elementIterator, hierarchicalData, levels, color, resource, kpiData, tooltipIndexNew, resourceField,
                    start, end, numStart, numEnd, startDisplayName, endDisplayName, tooltipInfo);
            }
            const tasknewarray: any = [];
            let categorylenn: number = 0;
            categorylenn = tasksNew[0].name.length - 1;
            for (const index of tasksNew) {
                tasknewarray.push({
                    categories: index.name, mapId: index.id, name: index.name[categorylenn], selectionId: index.selectionId
                });
            }
            if (settings.taskLabels.isHierarchy) {
                while (tasksNew.length) {
                    tasksNew.pop();
                }
            }
            const arrGanttLen: number = Object.keys(Gantt.arrGantt).length;
            let protoObjecttoArray: any = $.map(Gantt.arrGantt, (value, index) => {
                return [value];
            });
            const sumMeasures = (dest, src) => {
                dest = 0;
                Object.keys(src).forEach((element) => {
                    dest += src[element];
                });
                if (dest === 0) {
                    return null;
                } else {
                    return dest;
                }
            };
            rowId = 0; legendData = {
                dataPoints: [], fontSize: 8, title: "Legend"
            };
            const columnSource: DataViewMetadataColumn[] = dataView.metadata.columns;
            let selectionidindex: number = 0, legenduniquecolors: any = [], valuesdata1: DataViewValueColumn[] = dataView.categorical.values;
            this.converterHelperFunctionSeven(rowId, colorPalette, startArr, endArr, dataView, sumMeasures, levels, host, settings, selectionidindex, legenduniquecolors,
                rows, categoryColumns, transformedArr, tasksNew, color, end, expanded, id, isLeaf, level, numEnd, numStart, parentId, repeat, selectionId, start,
                repeatValue, arrGanttLen, viewport, barsLegend, hierarchicalData, tasknewarray, tooltipInfo);
            let rowIndex: number = 0, selobjchildrencncierarchy: any = [];
            let mycolor: string;
            this.dataViewObjectsUpdate(tasksNew, dataView, selobjchildrencncierarchy, rowIndex, mycolor);
        }

        /**
         * Method to create the data structure for the visual
         * @param rows1 
         * @param roleIndexArray 
         * @param dataView 
         * @param displayNameArray 
         * @param settings 
         * @param kpiData 
         * @param arrOptimized 
         * @param tasksNew 
         * @param valuesdata 
         * @param tooltipIndexNew 
         * @param resourceField 
         * @param colorPalette 
         * @param host 
         * @param viewport 
         * @param transformedArr 
         * @param barsLegend 
         */
        private static converterHelperFunctionNine(rows1, roleIndexArray, dataView, displayNameArray, settings, kpiData, arrOptimized, tasksNew,
            valuesdata, tooltipIndexNew, resourceField, colorPalette, host, viewport, transformedArr, barsLegend) {
            let rows: any = rows1, columns: any = dataView.metadata.columns, columnMappings: any, categoriesdata: any[] = [], categoriesdataLen: number = 0;
            for (const i of roleIndexArray[`Category`]) {
                categoriesdata.push(dataView.categorical.categories[i]);
            }
            let kpiLength: number = kpiData.length, elementIterator: any;
            categoriesdataLen = dataView.categorical.categories.length - (kpiLength + 1);
            columnMappings = dataView.metadata.columns;
            const ganttValues: any = [];
            ganttValues.push(GanttRoles);
            elementIterator = rows.map((ele: any, i: any): any => {
                let obj: any = {}; ele.forEach((e: any, ii: any): void => {
                    if (!obj[displayNameArray[ii]]) {
                        obj[displayNameArray[ii]] = e;
                    }
                });
                return obj;
            });
            let categoryColumns: any = categoriesdata.filter((column) => {
                return !column.isMeasure || !kpiData;
            });
            let categorylen: number = categoryColumns.length, legendIndex1: number = -1;
            this.converterHelperFunctionFive(categoryColumns, legendIndex1);
            Gantt.categorylength = categoryColumns.length;
            let categoryColumnsMappings: any = columnMappings.filter((column) => { return column.isMeasure; });
            for (let i: number = categoryColumns.length - 1; i >= 0; i--) {
                for (const k of kpiData) {
                    if (categoryColumns[i] && (categoryColumns[i].displayName === k.name)) {
                        categoryColumns.splice(i, 1);
                    }
                }
            }
            this.converterHelperFunctionEight(arrOptimized, categoryColumns, categoryColumnsMappings, kpiData, categoriesdata, columns, valuesdata,
                settings, elementIterator, tooltipIndexNew, resourceField, tasksNew, dataView, colorPalette, host, viewport, barsLegend, rows, transformedArr);
        }

        /**
         * Method to create the data structure for the visual
         * @param rows1 
         * @param roleIndexArray 
         * @param dataView 
         * @param displayNameArray 
         * @param settings 
         * @param kpiData 
         * @param arrOptimized 
         * @param tasksNew 
         * @param valuesdata 
         * @param tooltipIndexNew 
         * @param resourceField 
         * @param colorPalette 
         * @param host 
         * @param viewport 
         * @param transformedArr 
         * @param barsLegend 
         * @param categoriesLength 
         * @param valuesLengthCounter 
         * @param valuesLength 
         * @param iRow 
         * @param len 
         */
        private static converterHelperFunctionTen(rows1, roleIndexArray, dataView, displayNameArray, settings, kpiData, arrOptimized, tasksNew,
            valuesdata, tooltipIndexNew, resourceField, colorPalette, host, viewport, transformedArr, barsLegend, categoriesLength, valuesLengthCounter,
            valuesLength, iRow, len) {
            for (let iCount: number = 0; iCount < valuesLength; iCount++) {
                if (valuesdata[iCount].source.roles.StartDate) {
                    roleIndexArray[`StartDate`].push(iCount);
                    valuesLengthCounter++;
                }
                if (valuesdata[iCount].source.roles.EndDate) {
                    roleIndexArray[`EndDate`].push(iCount);
                    valuesLengthCounter++;
                }
                if (valuesdata[iCount].source.roles.Resource) {
                    roleIndexArray[`Resource`].push(iCount);
                    valuesLengthCounter++;
                }
                if (valuesdata[iCount].source.roles.Tooltip) {
                    roleIndexArray[`Tooltip`].push(iCount);
                    valuesLengthCounter++;
                }
            }
            const totalLength: number = categoriesLength + valuesLengthCounter;
            let counter: number = 0;
            this.converterHelperFunctionTwo(iRow, len, rows1, roleIndexArray, dataView, displayNameArray, totalLength, valuesdata, counter);
            this.converterHelperFunctionNine(rows1, roleIndexArray, dataView, displayNameArray, settings, kpiData, arrOptimized, tasksNew,
                valuesdata, tooltipIndexNew, resourceField, colorPalette, host, viewport, transformedArr, barsLegend);
        }

        /**
         * Method to create the data structure for the visual
         * @param dataView              - the dataview object, which contains all data needed to render the visual.
         * @param host                  - Contains references to the host which contains services
         * @param colors 
         * @param barsLegend 
         * @param viewport
         */
        public static CONVERTER(dataView: DataView, host: IVisualHost, colors: IColorPalette, barsLegend: ILegend, viewport): IGanttViewModel {
            if (!dataView || !dataView.categorical || !Gantt.isChartHasTask(dataView)) {
                return null;
            }
            let objects: DataViewObjects = dataView.metadata.objects;
            Gantt.stateValue = getValue(objects, "persistExpandCollapseSettings", "expandCollapseState", "{}");
            Gantt.arrGantt = JSON.parse(Gantt.stateValue);
            let oOptimizedObj: any = {}, arrOptimized = [];
            const settings: IGanttSettings = GanttSettings.PARSE(dataView.metadata.objects, colors);
            $.map(Gantt.arrGantt, (sVal, iKey) => {
                if ("array" === $.type(sVal)) {
                    oOptimizedObj.sName = Object.keys(Gantt.arrGantt[iKey][0]).toString();
                    oOptimizedObj.sFlag = Gantt.arrGantt[iKey][0][oOptimizedObj.sName];
                    arrOptimized.push(oOptimizedObj); oOptimizedObj = {};
                }
            });
            let metadata: DataViewMetadata = dataView.metadata;
            const colorPalette: IColorPalette = host.colorPalette;
            let oMap: any = {}, displayName: string, tooltipIndexNew: string[] = [], gColumns: DataViewMetadataColumn[] = dataView.metadata.columns;
            let iColumnLength: number = gColumns.length;
            for (let iColumnCount: number = 0; iColumnCount < iColumnLength; iColumnCount++) {
                if (gColumns[iColumnCount].roles[GanttRoles.tooltip]) {
                    displayName = gColumns[iColumnCount].displayName;
                    if (!oMap[displayName]) {
                        tooltipIndexNew.push(displayName);
                        oMap[displayName] = 1;
                    }
                }
            }
            let tooltipIndexLength: number = tooltipIndexNew.length, kpiData: IKPIConfig[] = [], resourceField: any = null, transformedArr: any = [];
            const metadataColumnsLength: number = metadata.columns.length, kpiCatData: any = dataView.categorical.categories;
            for (let iIterator: number = 0; iIterator < metadataColumnsLength; iIterator++) {
                if (metadata.columns[iIterator].roles[GanttRoles.kpiValueBag]) {
                    let currentColumn: DataViewMetadataColumn = metadata.columns[iIterator];
                    kpiData.push({
                        identity: { metadata: currentColumn.queryName },
                        name: currentColumn.displayName, type: getValue<string>(currentColumn.objects, "kpiColumnType", "type", "Value")
                    });
                }
                if (metadata.columns[iIterator].roles[GanttRoles.resource]) {
                    resourceField = metadata.columns[iIterator].displayName;
                }
            }
            let newKpiData: any = [], sortKpiData: any = [];
            for (let i: number = kpiCatData.length - 1; i >= 0; i--) {
                for (let jIterator: number = kpiData.length - 1; jIterator >= 0; jIterator--) {
                    if (kpiCatData[i].source.displayName === kpiData[jIterator].name && newKpiData.indexOf(kpiData[jIterator], 0) === -1) {
                        newKpiData.push(kpiData[jIterator]);
                    }
                }
            }
            sortKpiData = newKpiData;
            newKpiData = [];
            for (let i: number = sortKpiData.length - 1; i >= 0; i--) {
                newKpiData.push(sortKpiData[i]);
            }
            while (kpiData.length !== 0) {
                kpiData.pop();
            }
            for (const slen of newKpiData) {
                kpiData.push(slen);
            }
            Gantt.formatters = this.getFormatters(dataView);
            const tasksNew: ITask[] = Gantt.createTasks(dataView, host, Gantt.formatters, colorPalette, settings, barsLegend, viewport), rows1: any[] = [];
            let iRow: number;
            const len: number = dataView.categorical.categories[0].values.length, cLength: number = dataView.metadata.columns.length, mappingIndex: number[] = [];
            const categoriesLength: number = dataView.categorical.categories.length, valuesLength: number = dataView.categorical.values.length;
            let valuesLengthCounter: number = 0, roleIndexArray: any[] = [];
            roleIndexArray[`Category`] = [];
            roleIndexArray[`Legend`] = [];
            roleIndexArray[`StartDate`] = [];
            roleIndexArray[`EndDate`] = [];
            roleIndexArray[`Resource`] = [];
            roleIndexArray[`KPIValueBag`] = [];
            roleIndexArray[`Tooltip`] = [];
            let combine: number[] = [], displayNameArray: any[] = [];
            this.roleIndexArrayPushCategories(categoriesLength, dataView, roleIndexArray, combine);
            const legendRoleLength: number = roleIndexArray[`Legend`].length, kpiRoleLength: number = roleIndexArray[`KPIValueBag`].length;
            this.converterHelperFunctionFour(legendRoleLength, kpiRoleLength, roleIndexArray, combine);
            let valuesdata: any = dataView.categorical.values;
            this.converterHelperFunctionTen(rows1, roleIndexArray, dataView, displayNameArray, settings, kpiData, arrOptimized, tasksNew,
                valuesdata, tooltipIndexNew, resourceField, colorPalette, host, viewport, transformedArr, barsLegend, categoriesLength, valuesLengthCounter,
                valuesLength, iRow, len);
            return {
                dataView, hierarchyArray: transformedArr, kpiData, settings, tasksNew
            };
        }

        /**
         * 
         * @param selection1 
         * @param selections 
         */
        private syncSelectionState(
            selection1: d3.Selection<any>,
            selections: any): void {
            const self: this = this;
            if (!selection1 || !selections || this.viewModel.settings.taskLabels.isHierarchy) {
                return;
            }
            if (!selections.length) {
                $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                Gantt.isSelected = false;
                return;
            }
            $(".gantt_task-rect").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            $(".gantt_toggle-task").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            $(".gantt_kpiClass").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            $(".gantt_task-resource").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            selection1.each(function (d: ITask): void {
                const isSelected: boolean = self.isSelectionIdInArray(selections, d.selectionId);
                if (isSelected) {
                    let sClass: any;
                    sClass = this.className;
                    let oSplittedClassNames: string[];
                    let rowNumber: string;
                    oSplittedClassNames = sClass.animVal.split(" ");
                    for (const iIterator of oSplittedClassNames) {
                        let className: string;
                        className = iIterator;
                        if (className.indexOf("task_row") !== -1) {
                            rowNumber = className.substr(8, className.length - 8);
                            $(taskRowClassLiteral + rowNumber)
                                .addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                        }
                    }
                    let sString: string;
                    sString = "";
                    let sStr: string;
                    sStr = "";
                    if ($(".gantt_task-rect").attr("trancheAttr")) {
                        sString = "trancheAttr";
                    } else if ($(".gantt_task-rect").attr("projectAttr")) {
                        sString = "projectAttr";
                    } else if ($(".gantt_task-rect").attr("metroAttr")) {
                        sString = "metroAttr";
                    } else if ($(".gantt_task-rect").attr("regionAttr")) {
                        sString = "regionAttr";
                    }
                    if (sString) {
                        sStr = $(this).attr(sString);
                    }
                    Gantt.isSelected = true;
                    let $LegendToggleImageId: JQuery;
                    $LegendToggleImageId = $("#LegendToggleImage");
                    if ($LegendToggleImageId.hasClass("visible")) {
                        $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                        $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                        $(".gantt_legendIndicatorPanel").hide();
                        $(".arrow").hide();
                    }
                }
            });
        }

        /**
         * Method to return boolean based on presence of value in array
         * @param selections 
         * @param selectionId 
         */
        private isSelectionIdInArray(selections: ISelectionId[], selectionId: ISelectionId): boolean {
            if (!selections || !selectionId) {
                return false;
            }
            return selections.some((currentSelectionId: ISelectionId) => {
                return currentSelectionId.includes(selectionId);
            });
        }

        /**
         * Method to perform actions when kpi milestone not equals zero
         * @param totalKPIs 
         * @param indicatorTitle 
         * @param indicatorTitleColor 
         * @param indicatorTitleGroup 
         * @param indicatorTitleXCoordinate 
         * @param indicatorTitleYCoordinate 
         * @param kpiGroup 
         * @param eachKPI 
         * @param kpiCircle 
         * @param kpiCircleXCoordinate 
         * @param eachIndicatorGroupStartYCoordinate 
         * @param eachIndiactorRowHeight 
         * @param rowCounter 
         * @param kpiCircleText 
         * @param kpiDescText 
         * @param descTextColor 
         * @param descTextXCoordinate 
         * @param kpiCircleRadius 
         * @param kpiCircleTextXCoordinate 
         * @param totalMilestones 
         * @param kpiIndicatorWidth 
         * @param eachMilestone 
         * @param milestoneGroup 
         * @param milestoneIcon 
         * @param milestoneIconXCoordinate 
         * @param milestoneDescText 
         * @param totalPhases 
         * @param eachPhase 
         * @param phaseGroup 
         * @param phaseIcon 
         * @param phaseIconHeight 
         * @param phaseIconWidth 
         * @param phaseIconXCoordinate 
         * @param phaseDescText 
         * @param milestoneIndicatorWidth 
         */
        public kpiMilestonePhaseNotEqualsZero(totalKPIs, indicatorTitle, indicatorTitleColor, indicatorTitleGroup, indicatorTitleXCoordinate, indicatorTitleYCoordinate, kpiGroup,
            eachKPI, kpiCircle, kpiCircleXCoordinate, eachIndicatorGroupStartYCoordinate, eachIndiactorRowHeight, rowCounter, kpiCircleText, kpiDescText, descTextColor,
            descTextXCoordinate, kpiCircleRadius, kpiCircleTextXCoordinate, totalMilestones, kpiIndicatorWidth, eachMilestone, milestoneGroup, milestoneIcon, milestoneIconXCoordinate,
            milestoneDescText, totalPhases, eachPhase, phaseGroup, phaseIcon, phaseIconHeight, phaseIconWidth, phaseIconXCoordinate, phaseDescText, milestoneIndicatorWidth) {
            if (totalKPIs !== 0) {
                indicatorTitle = indicatorTitleGroup.append("text").classed(Selectors.label.className, true)
                    .attr({ fill: indicatorTitleColor, x: indicatorTitleXCoordinate, y: indicatorTitleYCoordinate }).text("KPIs");
                kpiGroup = this.kpiIndicatorSvg.append("g").classed("kpiIndicatorGroup", true);
                kpiGroup = this.kpiIndicatorSvg.append("g").classed("kpiIndicatorGroup", true);
                eachKPI = kpiGroup.append("g").classed("eachKPIRow", true);
                kpiCircle = eachKPI.append("circle").classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate, "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter, "fill": "#116836",
                        "r": kpiCircleRadius, "stroke-width": Gantt.axisLabelStrokeWidth
                    });
                kpiCircleText = eachKPI.append("text").classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff", x: kpiCircleTextXCoordinate - 0.5, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 4
                    }).text("G");
                kpiDescText = eachKPI.append("text").classed(Selectors.label.className, true)
                    .attr({ fill: descTextColor, x: descTextXCoordinate, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5 })
                    .text("Green (4)");
                rowCounter++;
                eachKPI = kpiGroup.append("g").classed("eachKPIRow", true);
                kpiCircle = eachKPI.append("circle").classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate, "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter, "fill": "#ff9d00",
                        "r": kpiCircleRadius, "stroke-width": Gantt.axisLabelStrokeWidth
                    });
                kpiCircleText = eachKPI.append("text").classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff", x: kpiCircleTextXCoordinate + 0.5, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    }).text("Y");
                kpiDescText = eachKPI.append("text").classed(Selectors.label.className, true)
                    .attr({
                        "fill": descTextColor, "stroke-width": 5, "x": descTextXCoordinate, "y": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    }).text("Yellow (3)");
                rowCounter++;
                eachKPI = kpiGroup.append("g").classed("eachKPIRow", true);
                kpiCircle = eachKPI.append("circle").classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate, "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        "fill": "#d15d0d", "r": kpiCircleRadius, "stroke-width": Gantt.axisLabelStrokeWidth
                    });
                kpiCircleText = eachKPI.append("text").classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff", x: kpiCircleTextXCoordinate - 0.5, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                    }).text("O");
                kpiDescText = eachKPI.append("text").classed(Selectors.label.className, true)
                    .attr({
                        fill: descTextColor, x: descTextXCoordinate, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    }).text("Orange (2)");
                rowCounter++;
                eachKPI = kpiGroup.append("g").classed("eachKPIRow", true);
                kpiCircle = eachKPI.append("circle").classed("kpiCircle", true).attr({ "cx": kpiCircleXCoordinate, "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter, "fill": "#ad1717", "r": kpiCircleRadius, "stroke-width": Gantt.axisLabelStrokeWidth });
                kpiCircleText = eachKPI.append("text").classed(Selectors.label.className, true).attr({ fill: "#fff", x: kpiCircleTextXCoordinate, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5 }).text("R");
                kpiDescText = eachKPI.append("text").classed(Selectors.label.className, true).attr({ fill: descTextColor, x: descTextXCoordinate, y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5 }).text("Red (1)");
            }
        }

        /**
         * Method to render custom legend indicator
         */
        private renderCustomLegendIndicator(): void {
            this.legendIndicatorTitleSvg.selectAll("*").remove();
            this.phaseIndicatorSvg.selectAll("*").remove();
            this.kpiIndicatorSvg.selectAll("*").remove();
            this.milestoneIndicatorSvg.selectAll("*").remove();
            let indicatorTitleGroup: Selection<HTMLElement>, indicatorTitle: Selection<HTMLElement>, kpiGroup: Selection<HTMLElement>, eachKPI: Selection<HTMLElement>;
            let kpiCircle: Selection<HTMLElement>, kpiCircleText: Selection<HTMLElement>, kpiDescText: Selection<HTMLElement>, milestoneGroup: Selection<HTMLElement>;
            let eachMilestone: Selection<HTMLElement>, milestoneIcon: Selection<HTMLElement>, milestoneDescText: Selection<HTMLElement>, phaseGroup: Selection<HTMLElement>;
            let eachPhase: Selection<HTMLElement>, phaseIcon: Selection<HTMLElement>, phaseDescText: Selection<HTMLElement>, rowCounter: number = 0;
            let indicatorTitleXCoordinate: number = 7, indicatorTitleYCoordinate: number = 17, indicatorTitleColor: string = "#404040";
            let eachIndicatorGroupStartYCoordinate: number = 10;
            let eachIndiactorRowHeight: number = 25, descTextColor: string = "#8c8c8c", descTextXCoordinate: number = 25, kpiCircleXCoordinate: number = 15;
            let kpiCircleRadius: number = 8, kpiCircleTextXCoordinate: number = 11, milestoneIconDimension: number = 14, milestoneIconXCoordinate: number = 12;
            let phaseIconWidth: number = 15, phaseIconHeight: number = 10, phaseIconXCoordinate: number = 5, legendIndicatorHeight: number = 150;
            let totalKPIs: number = this.viewModel.kpiData.length, totalMilestones: number = Gantt.milestoneNames.length;
            let totalPhases: number = Gantt.phaseNames.length, kpiIndicatorWidth: number = totalKPIs !== 0 ? 75 : 0;
            let milestoneIndicatorWidth: number = totalMilestones !== 0 ? 120 : 0, phaseIndicatorWidth: number = totalPhases !== 0 ? 120 : 0;
            let legendIndicatorTitleHeight: number = 25, width: number = 0;
            if (totalMilestones > 0) {
                for (let iCount: number = 0; iCount < totalMilestones; iCount++) {
                    let textProperties: TextProperties = {
                        fontFamily: "Segoe UI", fontSize: 12 + pxLiteral, text: Gantt.milestoneNames[iCount]
                    };
                    width = Math.ceil(textMeasurementService.measureSvgTextWidth(textProperties)) + 40;
                    milestoneIndicatorWidth = width > milestoneIndicatorWidth ? width : milestoneIndicatorWidth;
                }
            }
            if (totalPhases > 0) {
                for (let iCount: number = 0; iCount < totalPhases; iCount++) {
                    let textProperties: TextProperties = {
                        fontFamily: "Segoe UI", fontSize: 12 + pxLiteral, text: Gantt.phaseNames[iCount]
                    };
                    width = Math.ceil(textMeasurementService.measureSvgTextWidth(textProperties)) + 60;
                    phaseIndicatorWidth = width > phaseIndicatorWidth ? width : phaseIndicatorWidth;
                }
            }
            let legendIndicatorWidth: number = kpiIndicatorWidth + milestoneIndicatorWidth + phaseIndicatorWidth + 12;
            this.legendIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight),
                left: PixelConverter.toString(this.viewport.width - legendIndicatorWidth - 25),
                top: PixelConverter.toString(Gantt.axisHeight - 16),
                width: PixelConverter.toString(legendIndicatorWidth)
            });
            this.legendIndicatorTitleDiv.style({ width: PixelConverter.toString(legendIndicatorWidth) });
            this.legendIndicatorTitleSvg.attr({
                height: PixelConverter.toString(legendIndicatorTitleHeight),
                width: PixelConverter.toString(legendIndicatorWidth)
            });
            this.arrowDiv.style({
                left: PixelConverter.toString(this.viewport.width - 60),
                top: PixelConverter.toString(Gantt.axisHeight - 1)
            });
            this.kpiIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight),
                width: PixelConverter.toString(kpiIndicatorWidth + 12)
            });
            this.kpiIndicatorSvg.attr({ height: PixelConverter.toString(4 * eachIndiactorRowHeight), width: PixelConverter.toString(kpiIndicatorWidth + 12) });
            this.milestoneIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight),
                width: PixelConverter.toString(milestoneIndicatorWidth)
            });
            this.milestoneIndicatorSvg.attr({
                height: PixelConverter.toString(totalMilestones * eachIndiactorRowHeight),
                width: PixelConverter.toString(milestoneIndicatorWidth)
            });
            this.phaseIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight),
                width: PixelConverter.toString(phaseIndicatorWidth)
            });
            this.phaseIndicatorSvg.attr({
                height: PixelConverter.toString(totalPhases * eachIndiactorRowHeight),
                width: PixelConverter.toString(phaseIndicatorWidth)
            });
            indicatorTitleGroup = this.legendIndicatorTitleSvg.append("g").classed("gantt_indicatorTitle", true);
            this.kpiMilestonePhaseNotEqualsZero(totalKPIs, indicatorTitle, indicatorTitleColor, indicatorTitleGroup, indicatorTitleXCoordinate, indicatorTitleYCoordinate, kpiGroup,
                eachKPI, kpiCircle, kpiCircleXCoordinate, eachIndicatorGroupStartYCoordinate, eachIndiactorRowHeight, rowCounter, kpiCircleText, kpiDescText, descTextColor,
                descTextXCoordinate, kpiCircleRadius, kpiCircleTextXCoordinate, totalMilestones, kpiIndicatorWidth, eachMilestone, milestoneGroup, milestoneIcon, milestoneIconXCoordinate,
                milestoneDescText, totalPhases, eachPhase, phaseGroup, phaseIcon, phaseIconHeight, phaseIconWidth, phaseIconXCoordinate, phaseDescText, milestoneIndicatorWidth);
            Gantt.totalLegendPresent = totalMilestones + totalPhases;
            this.addLegendInteractiveEvent(this);
        }

        /**
         * Method to update svg size
         * @param thisObj 
         * @param axisLength 
         */
        private updateSvgSize(thisObj: Gantt, axisLength: number): void {
            if ((thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight) < (Gantt.currentTasksNumber * chartLineHeight + 20)) {
                axisLength -= 20;
            }
            thisObj.legendSvg.attr({ height: PixelConverter.toString(20), width: PixelConverter.toString(75) });
            thisObj.ganttSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(thisObj.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });
            thisObj.taskSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });
            thisObj.kpiTitleSvg.attr({ height: 20, width: PixelConverter.toString(Gantt.kpiLabelWidth) });
            thisObj.kpiSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(Gantt.kpiLabelWidth)
                });
            if ((thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight) < (Gantt.currentTasksNumber * chartLineHeight + 20)) {
                thisObj.bottomDiv.style({
                    height: PixelConverter.toString(thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                });
                thisObj.bottommilestoneDiv.style({ bottom: PixelConverter.toString(0) });
                thisObj.bottomTaskDiv.style({ bottom: PixelConverter.toString(0) });
                thisObj.barDiv.style("height", "auto");
            } else {
                thisObj.bottomDiv.style({ height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 20) });
                this.bottommilestoneDiv.style({
                    bottom: PixelConverter
                        .toString(this.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight - (Gantt.currentTasksNumber * chartLineHeight + 20))
                });
                this.bottomTaskDiv.style({
                    bottom: PixelConverter
                        .toString(this.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight - (Gantt.currentTasksNumber * chartLineHeight + 20))
                });
                thisObj.barDiv.style("height", "100%");
            }
            thisObj.timelineSvg
                .attr({
                    height: PixelConverter.toString(Gantt.axisHeight),
                    width: PixelConverter.toString(this.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });
            thisObj.imageSvg.attr({ height: PixelConverter.toString(20), width: PixelConverter.toString(20) });
            thisObj.kpiImageSvg.attr({ height: PixelConverter.toString(20), width: PixelConverter.toString(20) });
            thisObj.drillAllSvg
                .attr({
                    height: 20,
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });
            thisObj.drillAllSvg2
                .attr({
                    height: 30,
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });
            d3.select(".hierarchyTitle")
                .attr({
                    width: PixelConverter.toString(Gantt.taskLabelWidth - 30)
                });
            thisObj.bottommilestoneSvg
                .attr({
                    height: PixelConverter.toString(Gantt.bottomMilestoneHeight),
                    width: PixelConverter.toString(this.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });
            if ($(".gantt_bottomPanel").innerHeight() < $(".gantt_barPanel").innerHeight()) {
                $(".gantt_barPanel").css("width", $(".gantt_barPanel").innerWidth() - 20);
            }
            let currentScrollPosition: string;
            if ($(".gantt_barPanel").innerWidth() < thisObj.margin.left
                + axisLength + Gantt.defaultValues.ResourceWidth) {
                let bottomMilestoneScrollPosition: number = 0;
                if (Gantt.isDateData) {
                    currentScrollPosition = thisObj.viewModel.settings.scrollPosition.position.toLowerCase();
                } else {
                    currentScrollPosition = thisObj.viewModel.settings.scrollPosition.position2.toLowerCase();
                }
                switch (currentScrollPosition) {
                    case "start":
                        bottomMilestoneScrollPosition = 0;
                        break;
                    case "today":
                        bottomMilestoneScrollPosition = thisObj.timeScale(new Date());
                        break;
                    case "end":
                        bottomMilestoneScrollPosition = $(".gantt_barSvg").innerWidth();
                        break;
                    default:
                }
                document.getElementsByClassName("gantt_bottomMilestonePanel")[0]
                    .scrollLeft = bottomMilestoneScrollPosition;
                this.setBottomScrollPosition(bottomMilestoneScrollPosition);
            }
        }

        /**
         * Method to set bottom milestone scroll position
         * @param bottomMilestoneScrollPosition 
         */
        private setBottomScrollPosition(bottomMilestoneScrollPosition: number): void {
            if (document.getElementsByClassName("gantt_barPanel")) {
                document.getElementsByClassName("gantt_barPanel")[0].scrollLeft = bottomMilestoneScrollPosition;
            }
            if (document.getElementsByClassName("gantt_timelinePanel")) {
                document.getElementsByClassName("gantt_timelinePanel")[0].scrollLeft = bottomMilestoneScrollPosition;
            }
            if (document.getElementsByClassName("gantt_barPanel")[1]) {
                document.getElementsByClassName("gantt_barPanel")[1].scrollLeft = bottomMilestoneScrollPosition;
            }
        }

        /**
         * Method to set bottom tasks scroll position
         * @param bottomTaskScrollPosition 
         */
        private setBottomTaskScrollPosition(bottomTaskScrollPosition: number): void {
            if (document.getElementsByClassName("gantt_taskPanel")) {
                document.getElementsByClassName("gantt_taskPanel")[0].scrollLeft = bottomTaskScrollPosition;
            }
            if (document.getElementsByClassName("gantt_drillAllPanel")) {
                document.getElementsByClassName("gantt_drillAllPanel")[0].scrollLeft = bottomTaskScrollPosition;
            }
            if (document.getElementsByClassName("gantt_drillAllPanel2")) {
                document.getElementsByClassName("gantt_drillAllPanel2")[0].scrollLeft = bottomTaskScrollPosition;
            }
        }

        /**
         * Method to add legend interactive event
         * @param thisObj 
         */
        private addLegendInteractiveEvent(thisObj: Gantt): void {
            $(".gantt_phaseLegend").on("click", function (event: JQueryMouseEventObject): void {
                event.stopPropagation();
                thisObj.legendSelection(this, thisObj, "data-phasename");
            });

            $(".gantt_milestoneLegend").on("click", function (event: JQueryMouseEventObject): void {
                event.stopPropagation();
                thisObj.legendSelection(this, thisObj, "data-milestonename");
            });
        }

        /**
         * Method to add legend selection functionality
         * @param thisCurrent 
         * @param thisGlobal 
         * @param dataAttribute 
         */
        private legendSelection(thisCurrent: Gantt, thisGlobal: Gantt, dataAttribute: string): void {
            let legendDataAttrName: string;
            const legendEqualsQuote: string = 'legend="';
            const openingSquareBracket: string = "[";
            const quoteClosingSquareBracket: string = '"]';
            const equalsQuote: string = '="';

            legendDataAttrName = $(thisCurrent).attr(dataAttribute + legendLiteral);
            if ($(thisCurrent).parent().hasClass("activeLegend")) {
                Gantt.totalLegendSelected--;
                if (Gantt.totalLegendSelected === 0) {
                    Gantt.isLegendHighlighted = false;
                    thisGlobal.removeAllHighlight();
                } else {
                    $(thisCurrent).parent().removeClass("activeLegend");
                    $(openingSquareBracket + dataAttribute + legendEqualsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .addClass("gantt_loweropacityLegend").removeClass("gantt_higheropacityLegend");
                    $(openingSquareBracket + dataAttribute + equalsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .children().addClass("gantt_loweropacity").removeClass("gantt_higheropacity");
                    let index: number;
                    index = Gantt.currentSelectionState[milestoneNamesLiteral].indexOf(legendDataAttrName);
                    Gantt.currentSelectionState[milestoneNamesLiteral].splice(index, 1, 0);
                }
            } else {
                Gantt.isLegendHighlighted = true;
                if (Gantt.totalLegendSelected === 0) {
                    thisGlobal.moveAllTOBackground();
                    Gantt.currentSelectionState = {};
                    $(".gantt_phaseLegend, .gantt_milestoneLegend")
                        .removeClass("gantt_higheropacityLegend").addClass("gantt_loweropacityLegend");
                    Gantt.currentSelectionState[clickedTypeLiteral] = "legend";
                    Gantt.currentSelectionState[phaseNamesLiteral] = [];
                    Gantt.currentSelectionState[milestoneNamesLiteral] = [];
                }
                Gantt.totalLegendSelected++;
                if (Gantt.totalLegendSelected !== Gantt.totalLegendPresent) {
                    $(thisCurrent).parent().addClass("activeLegend");
                    $(openingSquareBracket + dataAttribute + legendEqualsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .removeClass("gantt_loweropacityLegend").addClass("gantt_higheropacityLegend");
                    $(openingSquareBracket + dataAttribute + equalsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .children().removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                    if (dataAttribute === "data-milestonename") {
                        Gantt.currentSelectionState[milestoneNamesLiteral].push(legendDataAttrName);
                    } else {
                        Gantt.currentSelectionState[phaseNamesLiteral].push(legendDataAttrName);
                    }
                } else {
                    Gantt.isLegendHighlighted = false;
                    thisGlobal.removeAllHighlight();
                }
            }
        }

        /**
         * Method to add legend hide/ show events
         * @param thisObj 
         */
        private addLegendHideShowEvents(thisObj: Gantt): void {
            let $LegendToggleImageId: JQuery;
            $LegendToggleImageId = $("#LegendToggleImage");
            $(".gantt_legendToggle").on("click", (event: JQueryMouseEventObject): void => {
                event.stopPropagation();
                if ($LegendToggleImageId.hasClass("notVisible")) {
                    $LegendToggleImageId.removeClass("notVisible").addClass("visible");
                    $LegendToggleImageId.attr("href", Gantt.drillUpImage);
                    $($(".gantt_legendIndicatorPanel")[0]).css("top", 49 + pxLiteral);
                    $(".gantt_legendIndicatorPanel").show();
                    $(".arrow").show();
                } else {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            });
        }

        private expandCollapseKPIPanel(thisObj, icon, taskLines, toggleTaskGroup, flag) {
            thisObj.expandCollapseTaskKPIPanel(thisObj, icon, taskLines, toggleTaskGroup, flag);
            let $LegendToggleImageId: JQuery;
            $LegendToggleImageId = $("#LegendToggleImage");
            if ($LegendToggleImageId.hasClass("visible")) {
                $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                $(".gantt_legendIndicatorPanel").hide();
                $(".arrow").hide();
            }
        }

        /**
         * Method to add expand collapse event
         * @param thisObj 
         */
        private addExpandCollapseEvent(thisObj: Gantt): void {
            d3.selectAll("#gantt_ToggleIcon").on("click", (): void => {
                this.expandCollapseKPIPanel(thisObj, "#gantt_ToggleIcon",
                ".gantt_task-lines", ".gantt_toggle-task-group", true);
            });
            d3.selectAll("#gantt_KPIToggle").on("click", (): void => {
                this.expandCollapseKPIPanel(thisObj, "#gantt_KPIToggle",
                ".gantt_kpi-lines", ".toggle-kpi-group", false);
            });
        }

        /**
         * Method to expand and collapse Task KPI Panel
         * @param thisObj 
         * @param elementId 
         * @param elementClass 
         * @param elementGroupClass 
         * @param isTaskLabel 
         */
        private expandCollapseTaskKPIPanel(
            thisObj: Gantt, elementId: string, elementClass: string,
            elementGroupClass: string, isTaskLabel: boolean): void {
            $(".gantt_barPanel").not(":first").remove();
            let $LegendToggleImageId: JQuery;
            $LegendToggleImageId = $("#LegendToggleImage");
            if (!$LegendToggleImageId.hasClass("visible")) {
                $($(d3.selectAll(".gantt_barPanel")[0])[0]).attr("style",
                    `width:${this.viewport.width - 18}px; left: 18px`);
            }
            d3.event[stopPropagationLiteral]();
            let element: Selection<SVGAElement>;
            element = d3.select(elementId);
            if (element.classed("collapse")) {
                d3.selectAll(elementClass).attr("visibility", "hidden");
                element.attr("href", Gantt.expandImage);
                element.classed("collapse", false);
                element.classed("expand", true);
                if (elementId === "#gantt_ToggleIcon") {
                    $(".gantt_bottomTaskDiv").hide();
                }
                if (isTaskLabel) {
                    Gantt.taskLabelWidth = -4;
                } else {
                    Gantt.kpiLabelWidth = 20;
                }
            } else {
                d3.selectAll(elementClass).attr("visibility", "visible");
                d3.select(elementGroupClass).attr("visibility", "visible");
                element.attr("href", Gantt.collapseImage);
                element.classed("collapse", true);
                element.classed("expand", false);
                if (elementId === "#gantt_ToggleIcon") {
                    $(".gantt_bottomTaskDiv").show();
                }
                if (isTaskLabel) {
                    Gantt.taskLabelWidth = (Gantt.currentDisplayRatio - Gantt.minDisplayRatio)
                        * this.viewport.width / 100;
                } else {
                    Gantt.kpiLabelWidth = Gantt.kpiLabelWidthOriginal;
                }
            }
            thisObj.redrawChart(thisObj);
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_category0").hide();
                $(".gantt_bottomTaskDiv").hide();
            }
            if (d3.select(".gantt_drillAllPanel2")[0][0] &&
                d3.select(".gantt_taskPanel")[0][0] &&
                parseInt(d3.select(".gantt_taskPanel").style("width"), 10) >= 1) {
                d3.select(".gantt_drillAllPanel2").style("width", PixelConverter
                    .toString($(".gantt_taskPanel").width() - 1));
            }
        }

        /**
         * Method to sort categories
         * @param thisObj 
         */
        private sortCategories(thisObj: Gantt): void {
            for (let iCounter: number = 0; iCounter < Gantt.numberOfCategories; iCounter++) {
                $(categoryClassLiteral + iCounter).on("click", (event: JQueryMouseEventObject): void => {
                    let categoryId: Selection<SVGAElement>;
                    categoryId = d3.select(categoryIdLiteral + iCounter);
                    if (Gantt.prevSortedColumn === iCounter) {
                        Gantt.sortOrder = (Gantt.sortOrder === "asc" ? "desc" : "asc");
                    } else {
                        Gantt.sortOrder = "asc";
                    }
                    Gantt.sortLevel = iCounter;
                    for (let jCounter: number = 0; jCounter < Gantt.numberOfCategories; jCounter++) {
                        if (jCounter !== iCounter) {
                            d3.select(categoryIdLiteral + jCounter).attr("href", Gantt.sortAscOrder);
                        }
                    }
                    if (Gantt.sortOrder === "asc") {
                        categoryId.attr("href", Gantt.sortAscOrder);
                    } else {
                        categoryId.attr("href", Gantt.sortDescOrder);
                    }
                    thisObj.persistSortState();
                    Gantt.prevSortedColumn = iCounter;
                });
            }
        }

        /**
         * Method to review highlight from the selected bar
         */
        private removeAllHighlight(): void {
            Gantt.totalLegendSelected = 0;
            Gantt.currentSelectionState = {};
            $(".milestoneHighlighted").removeClass("milestoneHighlighted");
            $(".phaseHighlighted").removeClass("phaseHighlighted");
            $(".activeLegend").removeClass("activeLegend");
            $(".gantt_task-rect").removeClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeRect");
            $(".gantt_task-progress").removeClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeProgress");
            $(".gantt_actual-milestone").removeClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeMilestone");
            $(".gantt_phaseLegend, .gantt_milestoneLegend")
                .removeClass("gantt_higheropacityLegend").removeClass("gantt_loweropacityLegend");
        }

        /**
         * Method to highlight selected bar
         */
        private moveAllTOBackground(): void {
            Gantt.totalLegendSelected = 0;
            $(".milestoneHighlighted").removeClass("milestoneHighlighted");
            $(".phaseHighlighted").removeClass("phaseHighlighted");
            $(".activeLegend").removeClass("activeLegend");
            $(".gantt_task-rect").addClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeRect");
            $(".gantt_task-progress").addClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeProgress");
            $(".gantt_actual-milestone").addClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeMilestone");
            $(".gantt_phaseLegend, .gantt_milestoneLegend")
                .removeClass("gantt_higheropacityLegend").removeClass("gantt_loweropacityLegend");
        }

        /**
         * Method to redraw chart
         * @param thisObj 
         */
        private redrawChart(thisObj: Gantt): void {
            let rightSectionWidth: number;
            rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                - Gantt.DefaultMargin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
            let newAxisLength: number = Gantt.xAxisPropertiesParamter.axisLength;
            if (rightSectionWidth > newAxisLength) {
                newAxisLength = rightSectionWidth;
                Gantt.xAxisPropertiesParamter.axisLength = rightSectionWidth;
            }
            let ganttWidth: number;
            ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength
                + Gantt.defaultValues.ResourceWidth;
            if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > thisObj.viewport.width) {
                Gantt.scrollHeight = 17;
            } else {
                Gantt.scrollHeight = 0;
            }
            thisObj.updateChartSize();
            thisObj.updateSvgSize(thisObj, newAxisLength);
            let viewportIn: IViewport;
            viewportIn = {
                height: thisObj.viewport.height,
                width: newAxisLength
            };
            let xAxisProperties: IAxisProperties;
            xAxisProperties = thisObj.calculateAxes(
                viewportIn, Gantt.xAxisPropertiesParamter.textProperties,
                Gantt.xAxisPropertiesParamter.datamin, Gantt.xAxisPropertiesParamter.datamax,
                Gantt.xAxisPropertiesParamter.startDate, Gantt.xAxisPropertiesParamter.endDate,
                newAxisLength, Gantt.xAxisPropertiesParamter.ticks, false);
            thisObj.timeScale = <Scale<number, number>>xAxisProperties.scale;
            thisObj.renderAxis(xAxisProperties);
            thisObj.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
            thisObj.updateTaskLabels(thisObj.viewModel.tasksNew, thisObj.viewModel.settings.taskLabels.width);
            if (Gantt.isDateData) {
                thisObj.createTodayLine(Gantt.currentTasksNumber);
            }
            thisObj.updateElementsPositions(thisObj.viewport, thisObj.margin);
            thisObj.adjustResizing(thisObj.viewModel.tasksNew,
                thisObj.viewModel.settings.taskLabels.width, thisObj.viewModel);
            thisObj.sortCategories(thisObj);
        }

        /**
         * Method to set axes properties
         * @param viewportIn 
         * @param textProperties 
         * @param datamin 
         * @param datamax 
         * @param startDate 
         * @param endDate 
         * @param axisLength 
         * @param ticksCount 
         * @param scrollbarVisible 
         */
        private calculateAxes(
            viewportIn: IViewport,
            textProperties: TextProperties,
            datamin: number,
            datamax: number,
            startDate: Date,
            endDate: Date,
            axisLength: number,
            ticksCount: number,
            scrollbarVisible: boolean): IAxisProperties {
            if (datamax !== undefined && datamax !== null && datamax !== Gantt.minSafeInteger) {
                let dataTypeDatetime: ValueType;
                dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Integer);
                let category: DataViewMetadataColumn;
                category = {
                    displayName: "Start Value",
                    index: 0,
                    queryName: GanttRoles.startDate,
                    type: dataTypeDatetime
                };
                let visualOptions: GanttCalculateScaleAndDomainOptions;
                visualOptions = {
                    categoryAxisDisplayUnits: 0,
                    categoryAxisScaleType: scale.linear,
                    forceMerge: false,
                    forcedTickCount: ticksCount,
                    forcedXDomain: [datamin, datamax],
                    margin: this.margin,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    trimOrdinalDataOnOverflow: false,
                    valueAxisDisplayUnits: 0,
                    valueAxisScaleType: null,
                    viewport: viewportIn
                };
                const width: number = viewportIn.width;
                let axes: IAxisProperties;
                axes = this.calculateAxesProperties1(viewportIn, visualOptions, axisLength, category);
                axes.willLabelsFit = axis.LabelLayoutStrategy.willLabelsFit(
                    axes,
                    width,
                    textMeasurementService.measureSvgTextWidth,
                    textProperties);
                // If labels do not fit and we are not scrolling, try word breaking
                axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible)
                    && axis.LabelLayoutStrategy.willLabelsWordBreak(
                        axes, this.margin, width, textMeasurementService.measureSvgTextWidth,
                        textMeasurementService.estimateSvgTextHeight, textMeasurementService.getTailoredTextOrDefault,
                        textProperties);
                return axes;
            } else if (startDate) {
                let dataTypeDatetime: ValueType;
                dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.DateTime);
                let category: DataViewMetadataColumn;
                category = {
                    displayName: "Start Date",
                    index: 0,
                    queryName: GanttRoles.startDate,
                    type: dataTypeDatetime
                };
                let visualOptions: GanttCalculateScaleAndDomainOptions;
                visualOptions = {
                    categoryAxisDisplayUnits: 0,
                    categoryAxisScaleType: scale.linear,
                    forceMerge: false,
                    forcedTickCount: ticksCount,
                    forcedXDomain: [startDate, endDate],
                    margin: this.margin,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    trimOrdinalDataOnOverflow: false,
                    valueAxisDisplayUnits: 0,
                    valueAxisScaleType: null,
                    viewport: viewportIn
                };
                const width: number = viewportIn.width;
                let axes: IAxisProperties;
                axes = this.calculateAxesProperties(viewportIn, visualOptions, axisLength, category);
                axes.willLabelsFit = axis.LabelLayoutStrategy.willLabelsFit(
                    axes,
                    width,
                    textMeasurementService.measureSvgTextWidth,
                    textProperties);
                // If labels do not fit and we are not scrolling, try word breaking
                axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible)
                    && axis.LabelLayoutStrategy.willLabelsWordBreak(
                        axes, this.margin, width, textMeasurementService.measureSvgTextWidth,
                        textMeasurementService.estimateSvgTextHeight, textMeasurementService.getTailoredTextOrDefault,
                        textProperties);
                return axes;
            }
        }

        /**
         * Method to calculate axes properties
         * @param viewportIn 
         * @param options 
         * @param axisLength 
         * @param metaDataColumn 
         */
        private calculateAxesProperties(
            viewportIn: IViewport, options: GanttCalculateScaleAndDomainOptions,
            axisLength: number, metaDataColumn: DataViewMetadataColumn): IAxisProperties {
            let xAxisProperties: IAxisProperties;
            xAxisProperties = axis.createAxis({
                axisDisplayUnits: options.categoryAxisDisplayUnits,
                dataDomain: options.forcedXDomain,
                forcedTickCount: options.forcedTickCount,
                formatString: Gantt.defaultValues.DateFormatStrings[this.viewModel.settings.dateType.type],
                getValueFn: (index, type) => {
                    let dateType: string;
                    dateType = this.viewModel.settings.dateType.type;
                    if (dateType === "Quarter") {
                        return Gantt.getQuarterName(index);
                    } else if (dateType === "Day" || dateType === "Week" ||
                        dateType === "Month" || dateType === "Year") {
                        return valueFormatter.format(
                            new Date(index),
                            Gantt.defaultValues.DateFormatStrings[this.viewModel.settings.dateType.type]);
                    }
                },
                isCategoryAxis: true,
                isScalar: true,
                isVertical: false,
                metaDataColumn,
                outerPadding: 0,
                pixelSpan: viewportIn.width,
                scaleType: options.categoryAxisScaleType,
                useTickIntervalForDisplayUnits: true,
            });
            xAxisProperties.axisLabel = metaDataColumn.displayName;
            return xAxisProperties;
        }

        /**
         * Method to calculate axes properties
         * @param viewportIn 
         * @param options 
         * @param axisLength 
         * @param metaDataColumn 
         */
        private calculateAxesProperties1(
            viewportIn: IViewport, options: GanttCalculateScaleAndDomainOptions, axisLength: number,
            metaDataColumn: DataViewMetadataColumn): IAxisProperties {
            let xAxisProperties1: IAxisProperties;
            xAxisProperties1 = axis.createAxis({
                axisDisplayUnits: options.categoryAxisDisplayUnits,
                dataDomain: options.forcedXDomain,
                forcedTickCount: options.forcedTickCount,
                formatString: this.viewModel.dataView.categorical.values[0].source.format,
                getValueFn: (index, type) => {
                    let datatype: string;
                    datatype = this.viewModel.settings.datatype.type;
                    if (datatype === "Integer") {
                        return index;
                    }
                },
                isCategoryAxis: true,
                isScalar: true,
                isVertical: false,
                metaDataColumn,
                outerPadding: 0,
                pixelSpan: viewportIn.width,
                scaleType: options.categoryAxisScaleType,
                useTickIntervalForDisplayUnits: true
            });
            xAxisProperties1.axisLabel = metaDataColumn.displayName;
            return xAxisProperties1;
        }

        /**
         * Method to render axis
         * @param xAxisProperties 
         * @param duration 
         */
        private renderAxis(xAxisProperties: IAxisProperties, duration: number = Gantt.defaultDuration): void {
            let xAxis: d3.svg.Axis;
            xAxis = xAxisProperties.axis;
            xAxis.orient("bottom");
            this.axisGroup.call(xAxis);
            this.axisGroup.style({ 'font-size': '10px' });
            this.axisGroup.selectAll("path").style({ 'fill': 'none', 'stroke': '#000', 'stroke-width': '1px' });
            this.axisGroup.selectAll("line").style({ 'stroke': '#000', 'stroke-width': '1px' });
        }

        /**
         * Method to render grids
         * @param xAxisProperties 
         * @param totaltasks 
         */
        private rendergrids(xAxisProperties: IAxisProperties, totaltasks: number): void {
            let taskGridLinesShow: boolean;
            let taskGridLinesInterval: number;
            let taskGridLinesColor: string;
            taskGridLinesShow = this.viewModel.settings.taskGridlines.show;
            taskGridLinesInterval = this.viewModel.settings.taskGridlines.interval;
            taskGridLinesColor = this.viewModel.settings.taskGridlines.fill;
            this.gridGroup.selectAll("*").remove();
            $(".gantt_barPanel")
                .css("width", PixelConverter.toString(this.viewport.width
                    - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - 20))
                .css("left", PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20));
            $(".gantt_bottomTaskDiv")
                .css("width", PixelConverter.toString(Gantt.taskLabelWidth + 20));
            let xAxis: d3.svg.Axis;
            xAxis = xAxisProperties.axis;
            xAxis.tickSize(this.getTodayLineLength(totaltasks));
            if (taskGridLinesShow) {
                this.gridGroup.call(xAxis);
                this.gridGroup.selectAll("line").style({ stroke: taskGridLinesColor, 'stroke-width': '1px' });
                this.gridGroup.selectAll("line").style({ 'border-style': 'solid' });
                this.gridGroup.selectAll("text").remove();
                for (let i: number = 0; i < xAxisProperties.values.length; i++) {
                    if (i % taskGridLinesInterval !== 0) {
                        d3.select(this.gridGroup.selectAll("line")[0][i]).attr("visibility", "hidden");
                    }
                }
            }
            this.gridGroup.selectAll("line").attr({
                y1: -20   // to extend the line
            });
        }

        /**
         * 
         * @param $KpiTitlePanelClass 
         * @param $DrillAllPanel2Class 
         * @param $TaskSvg 
         * @param columnHeaderOutline 
         */
        private columnHeaderOutlineUpdate($KpiTitlePanelClass, $DrillAllPanel2Class, $TaskSvg, columnHeaderOutline) {
            if (columnHeaderOutline === "none") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "bottomOnly") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-bottom", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "topOnly") {
                $KpiTitlePanelClass.css("border-top", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-top", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "leftOnly") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "1px");
            } else if (columnHeaderOutline === "rightOnly") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                    $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                } else {
                    $KpiTitlePanelClass.css("border-right", "solid white 0px");
                    $DrillAllPanel2Class.css("border-right", "solid #02B8AB 1px");
                }
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "leftRight") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-left", "solid #02B8AB 1px");
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                    $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                } else {
                    $KpiTitlePanelClass.css("border-right", "solid white 0px");
                    $DrillAllPanel2Class.css("border-right", "solid #02B8AB 1px");
                }
                $TaskSvg.css("margin-left", "1px");
            } else if (columnHeaderOutline === "frame") {
                $KpiTitlePanelClass.css("border-top", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-top", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-bottom", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-bottom", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-left", "solid #02B8AB 1px");
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                    $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                } else {
                    $KpiTitlePanelClass.css("border-right", "solid white 0px");
                    $DrillAllPanel2Class.css("border-right", "solid #02B8AB 1px");
                }
                $TaskSvg.css("margin-left", "1px");
            }
        }

        /**
         * 
         * @param iIterator 
         * @param taskColumnName 
         * @param oSplittedLength 
         * @param columnWidth 
         * @param taskColumnArr 
         * @param jCount 
         * @param vertGrid 
         * @param horizGridX1 
         * @param horizGridX2 
         * @param columnName 
         * @param vertGridArr 
         * @param horizGridX1Arr 
         * @param horizGridX2Arr 
         * @param columnWidthsArr 
         */
        private updateTaskLabelsForLoopHelperOne(iIterator, taskColumnName, oSplittedLength, columnWidth, taskColumnArr, jCount, vertGrid, horizGridX1,
            horizGridX2, columnName, vertGridArr, horizGridX1Arr, horizGridX2Arr, columnWidthsArr) {
            if (iIterator.indexOf(taskColumnName) !== -1) {
                oSplittedLength = iIterator.split(":");
                columnWidth = parseFloat(oSplittedLength[1]);
                taskColumnArr[jCount] = columnWidth;
            }
            else if (iIterator.indexOf(vertGrid) !== -1) {
                oSplittedLength = iIterator.split(":");
                columnWidth = parseFloat(oSplittedLength[1]);
                vertGridArr[jCount] = columnWidth;
            }
            else if (iIterator.indexOf(horizGridX1) !== -1) {
                oSplittedLength = iIterator.split(":");
                columnWidth = parseFloat(oSplittedLength[1]);
                horizGridX1Arr[jCount] = columnWidth;
            }
            else if (iIterator.indexOf(horizGridX2) !== -1) {
                oSplittedLength = iIterator.split(":");
                columnWidth = parseFloat(oSplittedLength[1]);
                horizGridX2Arr[jCount] = columnWidth;
            }
            else if (iIterator.indexOf(columnName) !== -1) {
                oSplittedLength = iIterator.split(":");
                columnWidth = parseFloat(oSplittedLength[1]);
                columnWidthsArr[jCount] = columnWidth;
            }
        }

        /**
         * 
         * @param jCount 
         * @param textElement 
         * @param taskColumnArr 
         * @param sortIconImage 
         */
        private updateTaskLabelsIfElseHelperOne(jCount, textElement, taskColumnArr, sortIconImage) {
            if (Gantt.numberOfCategories !== 1) {
                if (jCount === 0) {
                    textElement.attr("x", 15);
                    if (Gantt.sortOrder === "asc" || Gantt.sortLevel !== jCount) {
                        sortIconImage.attr("x", 15).attr("xlink:href", Gantt.sortAscOrder);
                    }
                    else {
                        sortIconImage.attr("x", 15).attr("xlink:href", Gantt.sortDescOrder);
                    }
                } else {
                    textElement.attr("x", taskColumnArr[jCount]);
                    if (Gantt.sortOrder === "asc" || Gantt.sortLevel !== jCount) {
                        sortIconImage.attr("x", taskColumnArr[jCount]).attr("xlink:href", Gantt.sortAscOrder);
                    }
                    else {
                        sortIconImage.attr("x", taskColumnArr[jCount]).attr("xlink:href", Gantt.sortDescOrder);
                    }
                }
            } else {
                textElement.attr("x", taskColumnArr[jCount]);
                if (Gantt.sortOrder === "asc" || Gantt.sortLevel !== jCount) {
                    sortIconImage.attr("x", taskColumnArr[jCount]).attr("xlink:href", Gantt.sortAscOrder);
                }
                else {
                    sortIconImage.attr("x", taskColumnArr[jCount]).attr("xlink:href", Gantt.sortDescOrder);
                }
            }
        }

        /**
         * 
         * @param objects 
         * @param getJSONString 
         * @param columnWidth 
         * @param jCount 
         * @param taskColumnArr 
         * @param totalCategories 
         * @param kpiPanelWidth 
         * @param lastRectX 
         * @param barPanelLeft 
         * @param columnHeaderBgColor 
         * @param columnHeaderColor 
         * @param columnHeaderFontFamily 
         * @param columnHeaderFontSize 
         * @param vertGridArr 
         * @param horizGridX1Arr 
         * @param horizGridX2Arr 
         * @param columnWidthsArr 
         */
        private updateTaskLabelsForLoopHelperTwo(objects, getJSONString, columnWidth, jCount, taskColumnArr, totalCategories, kpiPanelWidth,
            lastRectX, barPanelLeft, columnHeaderBgColor, columnHeaderColor, columnHeaderFontFamily, columnHeaderFontSize, vertGridArr,
            horizGridX1Arr, horizGridX2Arr, columnWidthsArr) {
            objects = this.viewModel.dataView.metadata.objects;
            getJSONString = getValue<string>(objects, "categoryColumnsWidth", "width", "text");
            columnWidth = 0;
            if (getJSONString && getJSONString.length !== 0 && getJSONString.indexOf("text") === -1) {
                let splittedJSON: string[], columnName: string, taskColumnName: string, horizGridX1: string;
                let horizGridX2: string, vertGrid: string, oSplittedLength: string[];
                splittedJSON = getJSONString.split(";");
                columnName = columnLiteral + jCount;
                taskColumnName = taskColumnLiteral + jCount;
                horizGridX1 = "horizontal-line";
                horizGridX1 += jCount; horizGridX1 += "-x1";
                horizGridX2 = "horizontal-line";
                horizGridX2 += jCount; horizGridX2 += "-x2";
                vertGrid = verticalLineLiteral + jCount;
                for (const iIterator of splittedJSON) {
                    this.updateTaskLabelsForLoopHelperOne(iIterator, taskColumnName, oSplittedLength, columnWidth, taskColumnArr, jCount, vertGrid,
                        horizGridX1, horizGridX2, columnName, vertGridArr, horizGridX1Arr, horizGridX2Arr, columnWidthsArr);
                }
            }
            const textElement: Selection<HTMLElement> = this.drillAllGroup.append("text")
                .attr("class", categoryLiteral + jCount + spaceLiteral + taskColumnLiteral + jCount).attr("x", 15).attr("y", 10);
            const sortIconImage: Selection<HTMLElement> = this.drillAllGroup.append("image").attr("class", "sortAsc")
                .attr("class", categoryLiteral + jCount).attr("id", categoryLiteral + jCount).attr("y", 10).attr("height", 7).attr("width", 7);
            this.updateTaskLabelsIfElseHelperOne(jCount, textElement, taskColumnArr, sortIconImage);
            if (jCount === totalCategories - 1) {
                kpiPanelWidth = parseInt(d3.select(".gantt_kpiPanel").style("left"), 10);
                lastRectX = parseInt(d3.select(categoryClassLiteral + jCount).attr("x"), 10);
                if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 1) || lastRectX > barPanelLeft - 1) {
                    d3.select(categoryClassLiteral + jCount).text(Gantt.categoriesTitle[jCount])
                        .style({
                            "background-color": columnHeaderBgColor, "fill": columnHeaderColor, "font-family": columnHeaderFontFamily,
                            "font-size": columnHeaderFontSize + pxLiteral
                        }).call(axis.LabelLayoutStrategy.clip, 100, textMeasurementService.svgEllipsis);
                } else {
                    d3.select(categoryClassLiteral + jCount).text(Gantt.categoriesTitle[jCount])
                        .style({
                            "background-color": columnHeaderBgColor, "fill": columnHeaderColor, "font-family": columnHeaderFontFamily,
                            "font-size": columnHeaderFontSize + pxLiteral
                        }).call(axis.LabelLayoutStrategy.clip, kpiPanelWidth - lastRectX, textMeasurementService.svgEllipsis);
                }
            } else {
                if (jCount === 0) {
                    d3.select(categoryClassLiteral + jCount).text(Gantt.categoriesTitle[jCount])
                        .style({
                            "background-color": columnHeaderBgColor, "fill": columnHeaderColor, "font-family": columnHeaderFontFamily,
                            "font-size": columnHeaderFontSize + pxLiteral
                        }).call(axis.LabelLayoutStrategy.clip, columnWidthsArr[jCount] - 15, textMeasurementService.svgEllipsis);
                } else {
                    d3.select(categoryClassLiteral + jCount).text(Gantt.categoriesTitle[jCount])
                        .style({
                            "background-color": columnHeaderBgColor, "fill": columnHeaderColor, "font-family": columnHeaderFontFamily,
                            "font-size": columnHeaderFontSize + pxLiteral
                        }).call(axis.LabelLayoutStrategy.clip, columnWidthsArr[jCount] - 10, textMeasurementService.svgEllipsis);
                }
            }
            d3.select(categoryClassLiteral + jCount).append("title")
                .text(Gantt.getLabelValuesNew(Gantt.categoriesTitle[jCount].toString() ? Gantt.categoriesTitle[jCount].toString() : "", "text", 50));
            if (jCount !== 0) {
                let resizer: Selection<HTMLElement> = this.drillAllGroup.append("rect").classed("gantt_resizer", true).classed(headerCellLiteral + jCount, true);
                resizer.attr({ columnId: headerCellLiteral + jCount, fill: columnHeaderBgColor, height: "30px", width: "5px", x: taskColumnArr[jCount] - 10, y: 0 });
            }
        }

        /**
         * 
         * @param sFirstWord 
         * @param sKPITitle 
         */
        private updateTaskLabelsSwitchCaseHelperFour(sFirstWord, sKPITitle) {
            switch (sFirstWord) {
                case "First":
                case "Last":
                case "Earliest":
                case "Latest":
                    sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 1, sKPITitle.length);
                    break;
                case "Count":
                case "Average":
                case "Min":
                case "Max":
                case "Variance":
                case "Median":
                    sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 4, sKPITitle.length);
                    break;
                case "Standard":
                    sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 14, sKPITitle.length);
                default:
            }
        }

        /**
         * 
         * @param jCount 
         * @param regionAttr 
         * @param metroAttr 
         * @param trancheAttr 
         * @param projectAttr 
         * @param tasknumber 
         * @param categoryLabel 
         * @param dataViewNew 
         * @param tasks 
         */
        private updateTaskLabelsSwitchCaseHelperThree(jCount, regionAttr, metroAttr, trancheAttr, projectAttr, tasknumber, categoryLabel, dataViewNew, tasks): string {
            switch (jCount) {
                case 0: {
                    regionAttr = tasks[tasknumber].name[jCount];
                    if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                        categoryLabel = valueFormatter.format(new Date(tasks[tasknumber].name[jCount].toString()),
                            dataViewNew.categorical.categories[jCount].source.format);
                    }
                    else {
                        categoryLabel = Gantt.regionValueFormatter.format(tasks[tasknumber].name[jCount]);
                    }
                    break;
                }
                case 1: {
                    metroAttr = tasks[tasknumber].name[jCount];
                    if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                        categoryLabel = valueFormatter.format(new Date(tasks[tasknumber].name[jCount].toString()), dataViewNew.categorical.categories[jCount].source.format);
                    }
                    else {
                        categoryLabel = Gantt.metroValueFormatter.format(tasks[tasknumber].name[jCount]);
                    }
                    break;
                }
                case 2: {
                    projectAttr = tasks[tasknumber].name[jCount];
                    if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                        categoryLabel = valueFormatter.format(new Date(tasks[tasknumber].name[jCount].toString()), dataViewNew.categorical.categories[jCount].source.format);
                    }
                    else {
                        categoryLabel = Gantt.projectValueFormatter.format(tasks[tasknumber].name[jCount]);
                    }
                    break;
                }
                case 3: {
                    trancheAttr = tasks[tasknumber].name[jCount];
                    if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                        categoryLabel = valueFormatter.format(new Date(tasks[tasknumber].name[jCount].toString()), dataViewNew.categorical.categories[jCount].source.format);
                    }
                    else {
                        categoryLabel = Gantt.trancheValueFormatter.format(tasks[tasknumber].name[jCount]);
                    }
                }
            }
            return categoryLabel;
        }

        /**
         * 
         * @param currentLevel 
         * @param totalKPIs 
         * @param thisObj 
         * @param opacityValue 
         * @param yCoordinate 
         * @param kpiFontColor 
         * @param tasknumber 
         * @param tasks 
         * @param metroAttr 
         * @param regionAttr 
         * @param trancheAttr 
         * @param projectAttr 
         * @param normalizer 
         * @param kpiFontSize 
         * @param width 
         * @param types 
         * @param typeColor 
         */
        private currentLevelKpiLength(currentLevel, totalKPIs, thisObj, opacityValue, yCoordinate, kpiFontColor, tasknumber, tasks, metroAttr,
            regionAttr, trancheAttr, projectAttr, normalizer, kpiFontSize, width, types, typeColor) {
            if (0 !== currentLevel.KPIValues.length) {
                for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                    if (jCount === 0) {
                        thisObj.kpiGroup.append("rect").attr({
                            fill: "#ccc", height: 24, opacity: opacityValue, width: parseInt(d3.select(".gantt_kpiSvg")
                                .attr("width"), 10), x: 0, y: yCoordinate - 17
                        }).attr("x", 0).attr("y", yCoordinate - 17).attr("height", 24)
                            .attr("width", parseInt(d3.select(".gantt_kpiSvg").attr("width"), 10)).attr("fill", "#ccc");
                    }
                    if (this.viewModel.kpiData[jCount].type.toLowerCase() === "indicator") {
                        let axisKPILabel: Selection<HTMLElement>;
                        axisKPILabel = thisObj.kpiGroup.append("circle").classed(Selectors.label.className, true)
                            .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);
                        let color: string = kpiFontColor, text: string = "";
                        let titleText: string = currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : "";
                        let showCircle: boolean = true, extraLeftPadding: number = 0;
                        switch (currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : "") {
                            case "1": color = "#ad1717"; text = "R"; extraLeftPadding = 1.5; break;
                            case "2": color = "#d15d0d"; text = "O"; extraLeftPadding = 1; break;
                            case "3": color = "#ff9d00"; text = "Y"; extraLeftPadding = 2; break;
                            case "4": color = "#116836"; text = "G"; extraLeftPadding = 0.5; break;
                            default: showCircle = false; break;
                        }
                        if (showCircle) {
                            axisKPILabel.attr({
                                "cx": (Gantt.kpiLabelWidth / totalKPIs * jCount) + 37.5, "cy": yCoordinate - 4, "fill": color, "metroAttr": metroAttr,
                                "projectAttr": projectAttr, "r": 8, "regionAttr": regionAttr, "stroke-width": Gantt.axisLabelStrokeWidth, "trancheAttr": trancheAttr
                            }).style("font-size", normalizer + pxLiteral);
                            axisKPILabel.append("title").text(titleText); axisKPILabel = thisObj.kpiGroup.append("text").classed(Selectors.label.className, true);
                            axisKPILabel.attr({
                                "fill": "#fff", "metroAttr": metroAttr, "projectAttr": projectAttr, "regionAttr": regionAttr, "stroke-width": 5,
                                "trancheAttr": trancheAttr, "x": (Gantt.kpiLabelWidth / totalKPIs * jCount) + 32.5 + extraLeftPadding, "y": yCoordinate
                            }).style("font-size", kpiFontSize + pxLiteral);
                            axisKPILabel.text(text); axisKPILabel.append("title").text(titleText);
                        }
                    } else if (thisObj.viewModel.kpiData[jCount].type.toLowerCase() === "type") {
                        let axisKPILabel: Selection<HTMLElement> = thisObj.kpiGroup.append("rect").classed(Selectors.label.className, true).classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);
                        let color: string = "#fff", text: string = currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : "";
                        if (!text) {
                            continue;
                        }
                        let titleText: string = text;
                        if (-1 === types.indexOf(text)) {
                            types.push(text);
                        }
                        let index: number = types.indexOf(text);
                        typeColor = Gantt.typeColors[index % Gantt.typeColors.length];
                        text = text.charAt(0) + text.charAt(-1 !== text.indexOf(" ") ? text.indexOf(" ") + 1 : -1);
                        axisKPILabel.attr({
                            "fill": typeColor, "height": 16, "metroAttr": metroAttr, "projectAttr": projectAttr, "regionAttr": regionAttr,
                            "stroke-width": Gantt.axisLabelStrokeWidth,
                            "trancheAttr": trancheAttr, "width": 24, "x": Gantt.taskLineCoordinateX
                                + (Gantt.kpiLabelWidth / totalKPIs * jCount) + 9.5, "y": yCoordinate - 12
                        }).style("font-size", kpiFontSize + pxLiteral);
                        axisKPILabel.append("title").text(titleText);
                        axisKPILabel = thisObj.kpiGroup.append("text").classed(Selectors.label.className, true);
                        axisKPILabel.attr({
                            "fill": color, "metroAttr": metroAttr, "projectAttr": projectAttr, "regionAttr": regionAttr, "stroke-width": 5,
                            "trancheAttr": trancheAttr, "x": Gantt.taskLineCoordinateX + (Gantt.kpiLabelWidth / totalKPIs * jCount) + 12.5, "y": yCoordinate
                        }).style("font-size", kpiFontSize + pxLiteral);
                        axisKPILabel.text(text.toUpperCase()); axisKPILabel.append("title").text(titleText);
                    } else {
                        let axisKPILabel: Selection<HTMLElement> = thisObj.kpiGroup.append("text").classed(Selectors.label.className, true)
                            .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true), iLeftSpacing: number = 5;
                        if (typeof currentLevel.KPIValues[jCount].value === "number") {
                            let clippedText: string = currentLevel.KPIValues[jCount].value.toString();
                            thisObj.body.append("text").text(clippedText).classed("singleCharacter", true)
                                .style({ "font-family": "Segoe UI", "font-size": kpiFontSize + pxLiteral });
                            const singleCharacterLocal: any = $(".singleCharacter");
                            let textTotalWidth: number = singleCharacterLocal.innerWidth();
                            let numberOfCharactersAllowed: number = Math.floor((Gantt.kpiLabelWidth / totalKPIs) / (textTotalWidth / clippedText.length));
                            if (clippedText.length > numberOfCharactersAllowed) {
                                singleCharacterLocal.text(clippedText.substring(0, numberOfCharactersAllowed - 2) + ellipsisLiteral);
                                textTotalWidth = singleCharacterLocal.innerWidth();
                                let iCount: number = 0;
                                while (textTotalWidth < width) {
                                    iCount++; singleCharacterLocal.text(clippedText.substring(0, numberOfCharactersAllowed - 2 + iCount)
                                        + ellipsisLiteral); textTotalWidth = singleCharacterLocal.innerWidth();
                                }
                            } else {
                                iLeftSpacing = Gantt.kpiLabelWidth / totalKPIs - textTotalWidth - 5;
                            }
                            singleCharacterLocal.remove();
                        }
                        axisKPILabel.attr({
                            "fill": kpiFontColor, "metroAttr": metroAttr, "projectAttr": projectAttr, "regionAttr": regionAttr, "stroke-width": Gantt.axisLabelStrokeWidth,
                            "trancheAttr": trancheAttr, "x": (Gantt.kpiLabelWidth / totalKPIs * jCount) + iLeftSpacing, "y": yCoordinate
                        }).style("font-size", kpiFontSize + pxLiteral);
                        axisKPILabel.text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "text")); axisKPILabel.append("title")
                            .text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "title"));
                    }
                }
            }
        }

        /**
         * Update task labels and add its tooltips
         * @param thisObj 
         * @param tasknumber 
         * @param tasks 
         * @param totalCategories 
         * @param taskLabelsShow 
         * @param categoryObject 
         * @param yVal 
         * @param opacityValue 
         * @param width1 
         * @param axisLabel 
         * @param taskLabelsColor 
         * @param taskColumnArr 
         * @param normalizer 
         * @param lastRectX 
         * @param taskLabelsFontFamily 
         * @param kpiPanelWidth 
         * @param width 
         * @param totalKPIs 
         * @param kpiFontSize 
         * @param types 
         * @param typeColor 
         * @param columnWidthsArr 
         * @param barPanelLeft 
         * @param kpiFontColor 
         */
        private updateTaskLabelsHelperFunctionTen(thisObj, tasknumber, tasks, totalCategories, taskLabelsShow, categoryObject, yVal, opacityValue, width1,
            axisLabel, taskLabelsColor, taskColumnArr, normalizer, lastRectX, taskLabelsFontFamily, kpiPanelWidth, width, totalKPIs, kpiFontSize, types, typeColor,
            columnWidthsArr, barPanelLeft, kpiFontColor) {
            const yCoordinate: number = thisObj.getTaskLabelCoordinateY(tasknumber), currentLevel: ITask = tasks[tasknumber];
            thisObj = this; let regionAttr: string = "", metroAttr: string = "", projectAttr: string = "", trancheAttr: string = "";
            for (let jCount: number = 0; jCount < totalCategories; jCount++) {
                let categoryLabel: string = tasks[tasknumber].name[jCount].toString();
                const dataViewNew: any = this.dataview;
                categoryLabel = this.updateTaskLabelsSwitchCaseHelperThree(jCount, regionAttr, metroAttr, trancheAttr,
                    projectAttr, tasknumber, categoryLabel, dataViewNew, tasks);
                if (taskLabelsShow) {
                    categoryObject[jCount] = tasks[tasknumber].name[jCount];
                    opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                    if (yVal !== yCoordinate) {
                        const greyRect: Selection<HTMLElement> = this.lineGroup.append("rect")
                            .attr({
                                class: "gantt_backgroundRect", fill: "#ccc", height: 24, opacity: opacityValue, width: width1, x: 0, y: yCoordinate - 17
                            });
                        yVal = yCoordinate;
                    }
                    axisLabel = this.lineGroup.append("text").classed(Selectors.label.className, true).classed("gantt_kpiClass", true);
                    if (jCount === 0) {
                        axisLabel.attr({
                            "class": Selectors.toggleTask.className + spaceLiteral + taskRowLiteral + tasknumber + spaceLiteral + taskColumnLiteral + jCount,
                            "fill": taskLabelsColor, "metroAttr": metroAttr, "projectAttr": projectAttr, "regionAttr": regionAttr,
                            "stroke-width": Gantt.axisLabelStrokeWidth, "trancheAttr": trancheAttr, "x": taskColumnArr[jCount], "y": this.getTaskLabelCoordinateY(tasknumber)
                        }).style("font-size", normalizer + pxLiteral).style("font-family", taskLabelsFontFamily);
                    } else {
                        axisLabel.attr({
                            "class": Selectors.toggleTask.className + spaceLiteral + taskRowLiteral + tasknumber + spaceLiteral + taskColumnLiteral + jCount,
                            "fill": taskLabelsColor, "metroAttr": metroAttr, "projectAttr": projectAttr, "regionAttr": regionAttr,
                            "stroke-width": Gantt.axisLabelStrokeWidth, "trancheAttr": trancheAttr, "x": taskColumnArr[jCount], "y": this.getTaskLabelCoordinateY(tasknumber)
                        }).style("font-size", normalizer + pxLiteral).style("font-family", taskLabelsFontFamily);
                    }
                    if (categoryLabel === "") {
                        categoryLabel = "(Blank)";
                    }
                    if (jCount === totalCategories - 1) {
                        lastRectX = parseInt(d3.select(dotLiteral + categoryLiteral + jCount).attr("x"), 10);
                        if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 1) || lastRectX > barPanelLeft - 1) {
                            axisLabel.text(categoryLabel).call(axis.LabelLayoutStrategy.clip, 100, textMeasurementService.svgEllipsis);
                        }
                        else {
                            axisLabel.text(categoryLabel).call(axis.LabelLayoutStrategy.clip, parseInt(d3.select(".gantt_kpiPanel").style("left"), 10)
                                - lastRectX - 10, textMeasurementService.svgEllipsis);
                        }
                    } else {
                        axisLabel.text(categoryLabel).call(axis.LabelLayoutStrategy.clip, columnWidthsArr[jCount] - 20, textMeasurementService.svgEllipsis);
                    }
                    axisLabel.append("title").text(Gantt.getLabelValuesNew(categoryLabel ? categoryLabel : "", "title", width));
                }
            }
            this.currentLevelKpiLength(currentLevel, totalKPIs, thisObj, opacityValue, yCoordinate, kpiFontColor, tasknumber, tasks, metroAttr,
                regionAttr, trancheAttr, projectAttr, normalizer, kpiFontSize, width, types, typeColor);
        }

        /**
         * 
         * @param sFirstWord 
         * @param sKPITitle 
         */
        private updateSwitchCaseHelperThree(sFirstWord, sKPITitle) {
            switch (sFirstWord) {
                case "First":
                case "Last":
                case "Earliest":
                case "Latest":
                    sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 1, sKPITitle.length);
                    break;
                case "Count":
                case "Average":
                case "Min":
                case "Max":
                case "Variance":
                case "Median":
                    sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 4, sKPITitle.length);
                    break;
                case "Standard":
                    sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 14, sKPITitle.length);
                default:
            }
        }

        /**
         * 
         * @param thisObj 
         * @param xPosVal 
         * @param barStartpt1 
         * @param barEndpt1 
         * @param titleWidth 
         */
        private updateTaskLabelsSwitchCaseHelperSix(thisObj, xPosVal, barStartpt1, barEndpt1, titleWidth): number {
            switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                case "center":
                    xPosVal = ((barStartpt1 + (barEndpt1 / 2)));
                    break;
                case "left":
                    xPosVal = barStartpt1 - titleWidth - xFactor;
                    break;
                case "right":
                default:
                    xPosVal = barStartpt1 + barEndpt1 + xFactor;
                    break;
            }
            return xPosVal;
        }

        /**
         * Update task labels and add its tooltips
         * @param taskRect 
         * @param tasknumber 
         * @param currentLevel 
         * @param thisObj 
         * @param parentRowId 
         * @param level1 
         * @param obj 
         * @param tasks 
         */
        private updateTaskLabelsHelperFunctionFive(taskRect, tasknumber, currentLevel, thisObj, parentRowId, level1, obj, tasks) {
            taskRect.classed("show", true)
                .attr({
                    "data-ParentId": tasks[tasknumber].parentId, "data-RowId": tasks[tasknumber].rowId, "data-expanded": tasks[tasknumber].expanded,
                    "data-isLeaf": tasks[tasknumber].isLeaf, "data-level": tasks[tasknumber].level, "data-row": tasknumber
                })
                .style({
                    "background-color": currentLevel.color, "height": Gantt.getBarHeight() / 1.5 + pxLiteral,
                    "margin-left": thisObj.timeScale(currentLevel.start) + 37 + pxLiteral, "margin-top": "-21.4444444px",
                    "opacity": 1, "position": "absolute", "width": 0 === thisObj.taskDurationToWidth(currentLevel)
                        ? 3 + pxLiteral : thisObj.taskDurationToWidth(currentLevel) + pxLiteral
                })
                .on("click", function () {
                    let selobjchildrencncierarchy: any = [];
                    function getDirectChildInHierarchy(sRowID) {
                        $.map(tasks, (sObj) => {
                            if (sObj.parentId === sRowID) {
                                selobjchildrencncierarchy.push(sObj);
                                getDirectChildInHierarchy(sObj.rowId);
                            }
                        });
                        return selobjchildrencncierarchy;
                    }
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (currentLevel.id === tasks[i].id) {
                            obj = tasks[i];
                            level1 = tasks[i].level;
                            parentRowId = tasks[i].rowId;
                            selobjchildrencncierarchy.push(tasks[i]);
                            selobjchildrencncierarchy = getDirectChildInHierarchy(parentRowId);
                            const selectionId: any = tasks[i].selectionId;
                            if (Gantt.lastSelectedbar === null) {
                                Gantt.lastSelectedbar = parseInt(d3.select(this).attr("data-rowid"), 10);
                                thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                                    if ($(this).attr("data-isleaf").toString() === "true") {
                                        let j: number = 0;
                                        d3.selectAll(".taskRect.show").classed("selected", false);
                                        d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                                        d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                        d3.select(this).classed("selected", true).style({ opacity: 1 });
                                        for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                        }
                                        for (let indexselctedobj: number = 0; indexselctedobj < tasks.length; indexselctedobj++) {
                                            if (parseInt($(d3.selectAll(".taskRect.show")[0][indexselctedobj]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                                $(thiskk[0][indexselctedobj]).css("opacity", "1").addClass("selected");
                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                                j++;
                                            }
                                            if (j === selobjchildrencncierarchy.length) { break; }
                                        }
                                    } else {
                                        let j: number = 0; d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                                        d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                        for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                        }
                                        for (let i: number = 0; i < tasks.length; i++) {
                                            if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                                thisk.addClass("selected");
                                                const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                                $(thiskk[0][i]).css("opacity", "1").addClass("selected");
                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                                j++;
                                            }
                                            if (j === selobjchildrencncierarchy.length) { break; }
                                        }
                                    }
                                });
                            } else if (Gantt.lastSelectedbar === parseInt(d3.select(this).attr("data-rowid"), 10)) {
                                thisObj.selectionManager.clear();
                                d3.selectAll(".taskRect.show").classed("selected", false);
                                d3.selectAll(".taskRect.show").style({ opacity: 1 });
                                d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.8 });
                                for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.8 });
                                }
                                Gantt.lastSelectedbar = null;
                            } else {
                                thisObj.ifElseHelperFunctionFour(thisObj, selectionId, selobjchildrencncierarchy, tasks);
                            }
                        }
                    }
                    (<Event>d3.event).stopPropagation();;
                });
        }

        /**
         * 
         * @param thisObj 
         * @param selectionId 
         * @param selobjchildrencncierarchy 
         * @param tasks 
         */
        private ifElseHelperFunctionFour(thisObj, selectionId, selobjchildrencncierarchy, tasks) {
            Gantt.lastSelectedbar = parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10);
            thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                if ($(event.currentTarget).attr("data-isleaf").toString() === "true") {
                    let j: number = 0; d3.selectAll(".taskRect.show").classed("selected", false);
                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    d3.select(event.currentTarget).classed("selected", true).style({ opacity: 1 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                            thisk.addClass("selected");
                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                            $(thiskk[0][i]).css("opacity", "1");
                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                            j++;
                        }
                        if (j === selobjchildrencncierarchy.length) {
                            break;
                        }
                    }
                } else {
                    let j: number = 0; d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                            j++;
                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                            thisk.addClass("selected");
                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                            $(thiskk[0][i]).css("opacity", "1");
                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                        }
                        if (j === selobjchildrencncierarchy.length) {
                            break;
                        }
                    }
                }
            });
        }

        /**
         * 
         * @param xPosVal 
         * @param barStartpt1 
         * @param barEndpt1 
         * @param thisObj 
         */
        private updateTaskLabelsSwitchCaseHelperFive(xPosVal, barStartpt1, barEndpt1, thisObj): number {
            switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                case "center":
                    xPosVal = (barStartpt1 + (barEndpt1 / 2)) - 20;
                    break;
                case "left":
                    xPosVal = barStartpt1 - 40;
                    break;
                case "right":
                default:
                    xPosVal = barStartpt1 + barEndpt1 + 5;
                    break;
            }
            return xPosVal;
        }

        /**
         * Method to update bar background div style based on category length
         * @param categoryLen 
         * @param leveLength 
         * @param barBackgroundDiv 
         * @param parentColour 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param opacityNumber1 
         * @param opacityNumber2 
         * @param tasknumber 
         */
        private categoryLengthUpdate(categoryLen, leveLength, barBackgroundDiv, parentColour, firstChildColour, secondChildColour, thirdChildColour,
            opacityNumber1, opacityNumber2, tasknumber) {
            if (categoryLen === 4) {
                if (leveLength === 1) {
                    barBackgroundDiv.style({ "background-color": parentColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 2) {
                    barBackgroundDiv.style({ "background-color": firstChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 3) {
                    barBackgroundDiv.style({ "background-color": secondChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 4) {
                    barBackgroundDiv.style({ "background-color": thirdChildColour, "opacity": opacityNumber1 });
                }
            } else if (categoryLen === 3) {
                if (leveLength === 1) {
                    barBackgroundDiv.style({ "background-color": firstChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 2) {
                    barBackgroundDiv.style({ "background-color": secondChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 3) {
                    barBackgroundDiv.style({ "background-color": thirdChildColour, "opacity": opacityNumber1 });
                }
            } else if (categoryLen === 2) {
                if (leveLength === 1) {
                    barBackgroundDiv.style({ "background-color": secondChildColour, "opacity": opacityNumber2 });
                }
                else if (leveLength === 2) {
                    barBackgroundDiv.style({ "background-color": thirdChildColour, "opacity": opacityNumber2 });
                }
            } else {
                const backgroundBarColor: string = tasknumber % 2 === 0 ? thirdChildColour : firstChildColour;
                barBackgroundDiv.style({ "background-color": backgroundBarColor, "opacity": opacityNumber2 });
            }
        }

        /**
         * 
         * @param thisObj 
         * @param xPosVal 
         * @param xPosStart 
         * @param xPos 
         * @param titleWidth 
         */
        private updateTaskLabelsSwitchCaseHelperSeven(thisObj, xPosVal, xPosStart, xPos, titleWidth): number {
            switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                case "center": xPosVal = ((xPosStart + xPos) / 2) - (titleWidth / 2);
                    break;
                case "left": xPosVal = xPosStart - titleWidth - xFactor;
                    break;
                case "right":
                default: xPosVal = xPos + xFactor;
                    break;
            }
            return xPosVal;
        }

        /**
         * Update task labels and add its tooltips
         * @param thisObj 
         * @param bars 
         */
        private updateTaskLabelsHelperFunctionTwelve(thisObj, bars) {
            d3.select("html").on("click", (): void => {
                if (!Gantt.isSelected) {
                    (<Event>d3.event).stopPropagation();
                }
                else {
                    thisObj.selectionManager.clear(); bars.attr({ opacity: 1 });
                    $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                    $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                    $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                    $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                    Gantt.isSelected = false;
                }
                let $LegendToggleImageId: JQuery = $("#LegendToggleImage");
                if ($LegendToggleImageId.hasClass("visible")) {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            });
        }

        /**
         * Update task labels and add its tooltips
         */
        private updateTaskLabelsHelperFunctionFour() {
            let chartHeight: number = $(".show").filter(function (): any {
                return $(this).css("display") !== "none";
            }).length; chartHeight = chartHeight / 2;
            if (!Gantt.isDateData) {
                $(".gantt_barPanel").css("height", (chartHeight * 24) + pxLiteral);
            }
            else {
                $(".gantt_barPanel").css("height", (chartHeight * 16) + pxLiteral);
            }
            if (this.viewModel.settings.taskLabels.isExpanded) {
                $(".gantt_taskPanel").show();
            }
            else {
                $(".gantt_taskPanel").hide();
            }
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_taskPanel").hide();
                $(".gantt_bottomTaskDiv").hide();
            }
            else {
                $(".gantt_taskPanel").show();
                $(".gantt_bottomTaskDiv").show();
            }
            if (d3.select("#gantt_KPIToggle").classed("expand")) {
                $(".gantt_kpiPanel").hide();
            }
            else {
                $(".gantt_kpiPanel").show();
            }
        }

        /**
         * Method to update bar background div based on category length
         * @param categoryLen 
         * @param leveLength 
         * @param parentColour 
         * @param opacityNumber1 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param barBackgroundDiv 
         * @param opacityNumber2 
         * @param tasknumber 
         */
        private categoryLenUpdateOne(categoryLen, leveLength, parentColour, opacityNumber1, firstChildColour, secondChildColour, thirdChildColour,
            barBackgroundDiv, opacityNumber2, tasknumber) {
            if (categoryLen === 4) {
                if (leveLength === 1) {
                    barBackgroundDiv.style({ "background-color": parentColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 2) {
                    barBackgroundDiv.style({ "background-color": firstChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 3) {
                    barBackgroundDiv.style({ "background-color": secondChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 4) {
                    barBackgroundDiv.style({ "background-color": thirdChildColour, "opacity": opacityNumber1 });
                }
            } else if (categoryLen === 3) {
                if (leveLength === 1) {
                    barBackgroundDiv.style({ "background-color": firstChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 2) {
                    barBackgroundDiv.style({ "background-color": secondChildColour, "opacity": opacityNumber1 });
                }
                else if (leveLength === 3) {
                    barBackgroundDiv.style({ "background-color": thirdChildColour, "opacity": opacityNumber1 });
                }
            } else if (categoryLen === 2) {
                if (leveLength === 1) {
                    barBackgroundDiv.style({ "background-color": secondChildColour, "opacity": opacityNumber2 });
                }
                else if (leveLength === 2) {
                    barBackgroundDiv.style({ "background-color": thirdChildColour, "opacity": opacityNumber2 });
                }
            } else {
                const backgroundBarColor: string = tasknumber % 2 === 0 ? thirdChildColour : firstChildColour;
                barBackgroundDiv.style({ "background-color": backgroundBarColor, "opacity": opacityNumber2 });
            }
        }

        /**
         * Update task labels and add its tooltips
         * @param tasknumber 
         * @param thisObj 
         * @param tasks 
         * @param leveLength 
         * @param opacityNumber1 
         * @param opacityNumber2 
         * @param categoryLen 
         * @param parentColour 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param taskResourceShow 
         * @param taskResourceColor 
         * @param dataLabelsFontFamily 
         */
        private updateTaskLabelsHelperFunctionSix(tasknumber, thisObj, tasks, leveLength, opacityNumber1, opacityNumber2, categoryLen, parentColour,
            firstChildColour, secondChildColour, thirdChildColour, taskResourceShow, taskResourceColor, dataLabelsFontFamily) {
            let currentLevel: ITask = tasks[tasknumber];
            let barBackgroundDiv: any = thisObj.barDiv.append("div").classed("parentDiv", true).datum(currentLevel)
                .style({
                    "background-color": "grey", "border-bottom": "0.011px", "height": "24px", "margin-left": 0 + pxLiteral,
                    "margin-top": thisObj.getTaskLabelCoordinateY(tasknumber) - 17,
                    "width": parseInt(d3.select(".gantt_barSvg").attr("width"), 10) + pxLiteral,
                }).datum(currentLevel).classed("show", true)
                .attr({
                    "data-ParentId": tasks[tasknumber].parentId, "data-RowId": tasks[tasknumber].rowId, "data-expanded": tasks[tasknumber].expanded,
                    "data-isLeaf": tasks[tasknumber].isLeaf, "data-level": tasks[tasknumber].level, "data-row": tasknumber
                });
            this.categoryLenUpdateOne(categoryLen, leveLength, parentColour, opacityNumber1, firstChildColour, secondChildColour, thirdChildColour, barBackgroundDiv,
                opacityNumber2, tasknumber);
            let taskRect: any = this.barDiv.append("div").classed("taskRect", true).datum(currentLevel);
            let yPos: number = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding, xPos: number = 0;
            let xPosStart: number = 0, obj = {}, level1: number = 0, parentRowId: number = 0;
            const rowId: number = 0;
            this.updateTaskLabelsHelperFunctionFive(taskRect, tasknumber, currentLevel, thisObj, parentRowId, level1, obj, tasks);
            yPos = Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
            if (xPos < thisObj.timeScale(currentLevel.end)) {
                xPos = thisObj.timeScale(currentLevel.start) + (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                xPosStart = thisObj.timeScale(currentLevel.start);
            }
            if (xPos < thisObj.timeScale(currentLevel.end)) {
                xPos = thisObj.timeScale(currentLevel.start) + (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                xPosStart = thisObj.timeScale(currentLevel.start);
            }
            thisObj.renderTooltip(taskRect);
            let labelnormalizer: number = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20 : thisObj.viewModel.settings.taskResource.fontSize;
            if (taskResourceShow) {
                let taskResource: any = barBackgroundDiv.append("text").classed(Selectors.taskResource.className + spaceLiteral + taskRowLiteral + tasknumber, true);
                let titleWidth: any, xPosVal: number = 0;
                d3.selectAll(".resourceLabelText").remove();
                const barStartpt: string = $('div.taskRect[data-row = "' + tasknumber + '"]').css("margin-left");
                const barStartpt1: number = parseInt(barStartpt.substring(0, barStartpt.length - 2));
                const barEndpt: string = $('div.taskRect[data-row = "' + tasknumber + '"]').css("width");
                const barEndpt1: number = parseInt(barEndpt.substring(0, barEndpt.length - 2));
                if (resourcePresent && currentLevel.resource == null) { currentLevel.resource = "(Blank)"; }
                Gantt.datalabelValueFormatter = valueFormatter.create({ format: measureFormat ? measureFormat : valueFormatter.DefaultNumericFormat });
                if (currentLevel.resource !== null) {
                    currentLevel.resource = Gantt.datalabelValueFormatter.format(currentLevel.resource);
                }
                else {
                    currentLevel.resource = " ";
                }
                const textProperties: TextProperties = {
                    fontFamily: thisObj.viewModel.settings.taskResource.fontFamily, fontSize: thisObj.viewModel.settings.taskResource.fontSize + pxLiteral,
                    text: currentLevel.resource
                };
                titleWidth = textMeasurementService.measureSvgTextWidth(textProperties);
                xPosVal = this.updateTaskLabelsSwitchCaseHelperSix(thisObj, xPosVal, barStartpt1, barEndpt1, titleWidth);
                let marginLeftDataLabel: any;
                const widthFactor: number = 5, leftMargin: number = 0;
                if (xPosVal < 0) {
                    marginLeftDataLabel = leftMargin + pxLiteral;
                    titleWidth = barStartpt1 - widthFactor + pxLiteral;
                }
                else {
                    marginLeftDataLabel = xPosVal + pxLiteral;
                    titleWidth = titleWidth + pxLiteral;
                }
                taskResource.append("div").classed("dataLabelDiv", true).style({ "margin-left": marginLeftDataLabel, "width": titleWidth })
                    .text(currentLevel.resource).style({
                        "color": taskResourceColor, "font-family": dataLabelsFontFamily,
                        "font-size": labelnormalizer + pxLiteral, "position": "block"
                    });
                taskResource.append("title").text(currentLevel.resource);
                if (thisObj.viewModel.settings.taskResource.position.toLowerCase() === "center") {
                    taskResource.remove();
                    let displayText: string = null || undefined === currentLevel.resource ? "" : currentLevel.resource;
                    taskRect.append("text").text(displayText);
                    taskRect.style({
                        "color": taskResourceColor, "font-family": dataLabelsFontFamily, "font-size": labelnormalizer + pxLiteral,
                        "line-height": document.querySelector(".taskRect").clientHeight - 2 + pxLiteral, "text-align": "center"
                    });
                }
            }
        }

        /**
         * 
         * @param thisObj 
         * @param selectionId 
         * @param selobjchildrencncierarchy 
         */
        private ifElseHelperFunctionThree(thisObj, selectionId, selobjchildrencncierarchy) {
            Gantt.lastSelectedbar = parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10);
            let j: number = 0;
            thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                if ($(event.currentTarget).attr("data-isleaf").toString() === "true") {
                    d3.selectAll(".taskRect.show").classed("selected", false);
                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    d3.select(event.currentTarget).classed("selected", true).style({ opacity: 1 });
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                            thisk.addClass("selected");
                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                            $(thiskk[0][i]).css("opacity", "1");
                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                            j++;
                        }
                        if (j === selobjchildrencncierarchy.length) { break; }
                    }
                } else {
                    let selobjindex: number = 0; d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[selobjindex].rowId) {
                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                            thisk.addClass("selected");
                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                            $(thiskk[0][i]).css("opacity", "1");
                            selobjindex++;
                        }
                        if (selobjindex === selobjchildrencncierarchy.length) { break; }
                    }
                }
            });
        }

        /**
         * Method to perform actions on click for tasks
         * @param taskRect 
         * @param tasks 
         * @param currentLevel 
         * @param selobjchildrencncierarchy 
         * @param thisObj 
         * @param level1 
         * @param parentRowId 
         * @param obj 
         */
        private updateTaskLabelsHelperFunctionSeven(taskRect, tasks, currentLevel, selobjchildrencncierarchy, thisObj, level1, parentRowId, obj) {
            taskRect.style({
                "background-color": currentLevel.color, "height": Gantt.getBarHeight() / 1.5 + pxLiteral,
                "margin-left": thisObj.timeScale(<any>currentLevel.numStart) + 39 + pxLiteral,
                "margin-top": "-21.4444444px", "opacity": 1, "position": "absolute", "width": 0 === thisObj.taskDurationToWidth1(currentLevel)
                    ? 3 + pxLiteral : thisObj.taskDurationToWidth1(currentLevel) + pxLiteral
            }).on("click", () => {
                function getDirectChildInHierarchy(sRowID) {
                    $.map(tasks, (sObj) => {
                        if (sObj.parentId === sRowID) {
                            selobjchildrencncierarchy.push(sObj);
                            getDirectChildInHierarchy(sObj.rowId);
                        }
                    });
                    return selobjchildrencncierarchy;
                }
                for (const i of tasks) {
                    if (currentLevel.id === i.id) {
                        obj = i; level1 = i.level;
                        parentRowId = i.rowId;
                        selobjchildrencncierarchy.push(i);
                        selobjchildrencncierarchy = getDirectChildInHierarchy(parentRowId);
                        const selectionId: any = i.selectionId;
                        if (Gantt.lastSelectedbar === null) {
                            Gantt.lastSelectedbar = parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10);
                            thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                                if ($(event.currentTarget).attr("data-isleaf").toString() === "true") {
                                    let j: number = 0; d3.selectAll(".taskRect.show").classed("selected", false);
                                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                    }
                                    d3.select(event.currentTarget).classed("selected", true).style({ opacity: 1 });
                                    for (let i: number = 0; i < tasks.length; i++) {
                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                            thisk.addClass("selected");
                                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                            $(thiskk[0][i]).css("opacity", "1");
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                            j++;
                                        }
                                        if (j === selobjchildrencncierarchy.length) { break; }
                                    }
                                } else {
                                    let j: number = 0; d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                    }
                                    for (let i: number = 0; i < tasks.length; i++) {
                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                            thisk.addClass("selected");
                                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                            $(thiskk[0][i]).css("opacity", "1").addClass("selected");
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                            j++;
                                        }
                                        if (j === selobjchildrencncierarchy.length) {
                                            break;
                                        }
                                    }
                                    selobjchildrencncierarchy = [];
                                }
                            });
                        } else if (Gantt.lastSelectedbar === parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10)) {
                            thisObj.selectionManager.clear();
                            d3.selectAll(".taskRect.show").classed("selected", false);
                            d3.selectAll(".taskRect.show").style({ opacity: 1 });
                            d3.selectAll(".gantt_taskPanel .show").style({ opacity: 1 });
                            for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 1 });
                            }
                            Gantt.lastSelectedbar = null;
                        } else {
                            this.ifElseHelperFunctionThree(thisObj, selectionId, selobjchildrencncierarchy);
                        }
                    }
                }
                (<Event>d3.event).stopPropagation();
            });
        }

        /**
         * 
         * @param thisObj 
         * @param selobjchildrencncierarchy 
         * @param selectionId 
         */
        public helperFunctionIfElseTwo(thisObj, selobjchildrencncierarchy, selectionId) {
            Gantt.lastSelectedbar = parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10);
            let j: number = 0;
            thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                if ($(this).attr("data-isleaf").toString() === "true") {
                    d3.selectAll(".taskRect.show").classed("selected", false);
                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    d3.select(event.currentTarget).classed("selected", true).style({ opacity: 1 });
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                            thisk.addClass("selected");
                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                            $(thiskk[0][i]).css("opacity", "1");
                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                            j++;
                        }
                        if (j === selobjchildrencncierarchy.length) { break; }
                    }
                } else {
                    let selobjindex: number = 0;
                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    for (let i: number = 0; i < tasks.length; i++) {
                        if (parseInt($(d3.selectAll('.taskRect.show')[0][i]).attr('data-rowid'), 10) === selobjchildrencncierarchy[selobjindex].rowId) {
                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                            thisk.addClass("selected");
                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                            $(thiskk[0][i]).css("opacity", "1");
                            selobjindex++;
                        }
                        if (selobjindex === selobjchildrencncierarchy.length) {
                            break;
                        }
                    }
                }
            });
        }

        /**
         * Update task labels and add its tooltips
         * @param taskRect 
         * @param tasks 
         * @param currentLevel 
         * @param selobjchildrencncierarchy 
         * @param obj 
         * @param level1 
         * @param parentRowId 
         * @param thisObj 
         */
        private updateTaskLabelsHelperFunctionEight(taskRect, tasks, currentLevel, selobjchildrencncierarchy, obj, level1, parentRowId, thisObj) {
            taskRect.style({
                "background-color": currentLevel.color, "height": Gantt.getBarHeight() / 1.5 + pxLiteral,
                "margin-left": 39 + pxLiteral, "margin-top": "-21.4444444px", "opacity": 1, "position": "absolute", "width": 3 + pxLiteral
            }).on("click", () => {
                function getDirectChildInHierarchy(sRowID) {
                    $.map(tasks, (sObj) => {
                        if (sObj.parentId === sRowID) {
                            selobjchildrencncierarchy.push(sObj);
                            getDirectChildInHierarchy(sObj.rowId);
                        }
                    });
                    return selobjchildrencncierarchy;
                }
                for (const i of tasks) {
                    if (currentLevel.id === i.id) {
                        obj = i; level1 = i.level;
                        parentRowId = i.rowId;
                        selobjchildrencncierarchy.push(i);
                        selobjchildrencncierarchy = getDirectChildInHierarchy(parentRowId);
                        const selectionId: any = i.selectionId;
                        if (Gantt.lastSelectedbar === null) {
                            Gantt.lastSelectedbar = parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10);
                            thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                                if ($(this).attr("data-isleaf").toString() === "true") {
                                    let j: number = 0;
                                    d3.selectAll(".taskRect.show").classed("selected", false);
                                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                    }
                                    d3.select(event.currentTarget).classed("selected", true).style({ opacity: 1 });
                                    for (let i: number = 0; i < tasks.length; i++) {
                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                            thisk.addClass("selected");
                                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                            $(thiskk[0][i]).css("opacity", "1");
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                            j++;
                                        }
                                        if (j === selobjchildrencncierarchy.length) { break; }
                                    }
                                } else {
                                    let j: number = 0;
                                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                    }
                                    for (let i: number = 0; i < tasks.length; i++) {
                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                            const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                            thisk.addClass("selected");
                                            const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                            $(thiskk[0][i]).css("opacity", "1").addClass("selected");
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                            j++;
                                        }
                                        if (j === selobjchildrencncierarchy.length) { break; }
                                    }
                                }
                            });
                        } else if (Gantt.lastSelectedbar === parseInt(d3.select(event.currentTarget).attr("data-rowid"), 10)) {
                            thisObj.selectionManager.clear();
                            d3.selectAll(".taskRect.show").classed("selected", false);
                            d3.selectAll(".taskRect.show").style({ opacity: 1 });
                            d3.selectAll(".gantt_taskPanel .show").style({ opacity: 1 });
                            for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 1 });
                            }
                            Gantt.lastSelectedbar = null;
                        } else {
                            this.helperFunctionIfElseTwo(thisObj, selobjchildrencncierarchy, selectionId);
                        }
                    }
                }
                (<Event>d3.event).stopPropagation();
            });
        }

        /**
         * 
         * @param thisObj 
         * @param selectionId 
         * @param selobjchildrencncierarchy 
         */
        private ifElseHelperFunctionTwo(thisObj, selectionId, selobjchildrencncierarchy, tasks) {
            Gantt.lastSelectedbar = parseInt($($(d3.select($(event.currentTarget).parent()[0]))[0]).attr("data-rowid"), 10);
            thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                if ($(event.currentTarget).parent().attr("data-isleaf").toString() === "true") {
                    d3.selectAll(".taskRect.show").classed("selected", false);
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 }).classed("selected", false);
                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    d3.select($(this).parent()[0]).style({ opacity: 1 }).classed("selected", true);
                    for (let i: number = 0; i < tasks.length; i++) {
                        for (const iCount of selobjchildrencncierarchy) {
                            if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === iCount.rowId) {
                                const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                thisk.addClass("selected");
                                const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                $(thiskk[0][i]).css("opacity", "1");
                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                            }
                        }
                    }
                } else {
                    d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                    }
                    for (let i: number = 0; i < tasks.length; i++) {
                        for (const iCount of selobjchildrencncierarchy) {
                            if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === iCount.rowId) {
                                const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                thisk.addClass("selected");
                                const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                $(thiskk[0][i]).css("opacity", "1");
                            }
                        }
                    }
                }
            });
        }

        /**
         * Method to perform actions on axis label clicks
         * @param axisLabel 
         * @param normalizer 
         * @param taskLabelsFontFamily 
         * @param thisObj 
         * @param tasks 
         * @param textMargin 
         * @param taskLabelsColor 
         */
        private updateTaskLabelsHelperFunctionNine(axisLabel, normalizer, taskLabelsFontFamily, thisObj, tasks, textMargin, taskLabelsColor) {
            axisLabel.style("font-size", normalizer + pxLiteral).style("font-family", taskLabelsFontFamily)
                .style("margin-left", textMargin + pxLiteral).style("color", taskLabelsColor)
                .on("click", function () {
                    let sRowId: number = parseInt($(this).parent().attr("data-rowid"), 10), obj = {};
                    obj = tasks;
                    let selobjchildrencncierarchy: any = [];
                    function getDirectChildInHierarchy(sRowID) {
                        $.map(tasks, (sObj) => {
                            if (sObj.parentId === sRowID) {
                                selobjchildrencncierarchy.push(sObj);
                                getDirectChildInHierarchy(sObj.rowId);
                            }
                        });
                        return selobjchildrencncierarchy;
                    }
                    for (const i of tasks) {
                        if (i.rowId === sRowId) {
                            const selectionId: any = i.selectionId;
                            let parentRowId: number = i.rowId;
                            selobjchildrencncierarchy.push(i);
                            selobjchildrencncierarchy = getDirectChildInHierarchy(parentRowId);
                            if (Gantt.lastSelectedbar === null) {
                                Gantt.lastSelectedbar = parseInt($($(this).parent()[0]).attr("data-rowid"), 10);
                                thisObj.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
                                    if ($(this).parent().attr("data-isleaf") === "true") {
                                        d3.selectAll(".taskRect.show").classed("selected", false);
                                        d3.selectAll(".taskRect.show").style({ opacity: 0.3 });
                                        d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                        d3.select($(this).parent()[0]).classed("selected", true).style({ opacity: 1 });
                                        for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                        }
                                        for (let i: number = 0; i < tasks.length; i++) {
                                            for (const iCount of selobjchildrencncierarchy) {
                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === iCount.rowId) {
                                                    const thisk = $($(d3.selectAll(".taskRect.show")[0][i])).css("opacity", "1");
                                                    thisk.addClass("selected");
                                                    const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                                    $(thiskk[0][i]).css("opacity", "1");
                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                                }
                                            }
                                        }
                                    } else {
                                        d3.selectAll(".taskRect.show").style({ opacity: 0.3 }).classed("selected", false);
                                        d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.3 });
                                        for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                        }
                                        for (let i: number = 0; i < tasks.length; i++) {
                                            for (const iCount of selobjchildrencncierarchy) {
                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === iCount.rowId) {
                                                    const thisk = $(d3.selectAll(".taskRect.show"));
                                                    $(thisk[0][i]).css({ opacity: 1 });
                                                    const thiskk = $(d3.selectAll(".gantt_taskPanel .show"));
                                                    $(thiskk[0][i]).css({ opacity: 1 });
                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[i]).css({ opacity: 1 });
                                                }
                                            }
                                        }
                                    }
                                });
                            } else if (Gantt.lastSelectedbar === parseInt($($(d3.select($(this).parent()[0]))[0]).attr("data-rowid"), 10)) {
                                thisObj.selectionManager.clear();
                                d3.selectAll(".taskRect.show").classed("selected", false);
                                d3.selectAll(".taskRect.show").style({ opacity: 1 });
                                d3.selectAll(".gantt_taskPanel .show").style({ opacity: 0.8 });
                                for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.8 });
                                }
                                Gantt.lastSelectedbar = null;
                            } else {
                                thisObj.ifElseHelperFunctionTwo(thisObj, selectionId, selobjchildrencncierarchy, tasks);
                            }
                        }
                    }
                    (<Event>d3.event).stopPropagation();
                });
        }

        /**
         * Method to update KPI Display div based on category length
         * @param categoryLen 
         * @param leveLength 
         * @param parentColour 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param kpiDisplayDiv 
         * @param tasknumber 
         */
        private categoryLenUpdateTwo(categoryLen, leveLength, parentColour, firstChildColour, secondChildColour, thirdChildColour, kpiDisplayDiv, tasknumber) {
            if (categoryLen === 4) {
                if (leveLength === 1) {
                    kpiDisplayDiv.style({ "background-color": parentColour, "opacity": 0.8 });
                }
                else if (leveLength === 2) {
                    kpiDisplayDiv.style({ "background-color": firstChildColour, "opacity": 0.8 });
                }
                else if (leveLength === 3) {
                    kpiDisplayDiv.style({ "background-color": secondChildColour, "opacity": 0.8 });
                }
                else if (leveLength === 4) {
                    kpiDisplayDiv.style({ "background-color": thirdChildColour, "opacity": 0.8 });
                }
            } else if (categoryLen === 3) {
                if (leveLength === 1) {
                    kpiDisplayDiv.style({ "background-color": firstChildColour, "opacity": 0.8 });
                }
                else if (leveLength === 2) {
                    kpiDisplayDiv.style({ "background-color": secondChildColour, "opacity": 0.8 });
                }
                else if (leveLength === 3) {
                    kpiDisplayDiv.style({ "background-color": thirdChildColour, "opacity": 0.8 });
                }
            } else if (categoryLen === 2) {
                if (leveLength === 1) {
                    kpiDisplayDiv.style({ "background-color": secondChildColour, "opacity": 0.8 });
                }
                else if (leveLength === 2) {
                    kpiDisplayDiv.style({ "background-color": thirdChildColour, "opacity": 0.8 });
                }
            } else {
                const backgroundBarColor: string = tasknumber % 2 === 0 ? thirdChildColour : firstChildColour; kpiDisplayDiv
                    .style({ "background-color": backgroundBarColor, "opacity": 0.8 });
            }
        }

        /**
         * Method to update KPI data type indicator
         * @param kpiDisplayDiv 
         * @param kpiFontColor 
         * @param jCount 
         * @param currentLevel 
         * @param iCenterSpacing 
         * @param kpiFontSize 
         */
        private viewModelKpiDataTypeIndicator(kpiDisplayDiv, kpiFontColor, jCount, currentLevel, iCenterSpacing, kpiFontSize) {
            let axisKPILabel: any = kpiDisplayDiv.append("div").classed("circle", true);
            const iLeftSpacing: number = 5;
            let color: string = kpiFontColor, text: string = "", titleText: string = currentLevel.KPIValues[jCount].value
                ? currentLevel.KPIValues[jCount].value.toString() : "", showCircle: boolean = true;
            let extraLeftPadding: number = 0;
            const iLeftAlignSpacing: number = 30.5;
            switch (currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : "") {
                case "1": color = "#ad1717"; text = "R";
                    extraLeftPadding = 1.5;
                    break;
                case "2": color = "#d15d0d";
                    text = "O";
                    extraLeftPadding = 1;
                    break;
                case "3": color = "#ff9d00";
                    text = "Y";
                    extraLeftPadding = 2;
                    break;
                case "4": color = "#116836";
                    text = "G";
                    extraLeftPadding = 0.5;
                    break;
                default: showCircle = false;
                    break;
            }
            if (showCircle) {
                axisKPILabel.style("font-size", kpiFontSize + pxLiteral).style("background-color", color).style("margin-top", 5 + pxLiteral)
                    .style("margin-left", (): string => {
                        if (text === undefined) {
                            return (jCount * (iCenterSpacing + 15)) + iLeftAlignSpacing + pxLiteral;
                        }
                        else {
                            return (jCount * (iCenterSpacing + 15)) + iLeftAlignSpacing + pxLiteral;
                        }
                    });
                axisKPILabel.append("title").text(titleText);
                axisKPILabel.append("div").append("text").text(text)
                    .style({ "color": "#fff", "stroke-width": Gantt.axisLabelStrokeWidth }).style("font-size", kpiFontSize + pxLiteral)
                    .style("margin-left", (): string => {
                        if (text === undefined) {
                            return (jCount * (iCenterSpacing + 15)) + iLeftAlignSpacing + pxLiteral;
                        } else {
                            return iLeftSpacing + pxLiteral;
                        }
                    });
                axisKPILabel.append("title").text(titleText);
            } else {
                axisKPILabel.style("margin-left", (jCount * (iCenterSpacing + 15)) + iLeftAlignSpacing + pxLiteral);
            }
        }

        /**
         * Update task labels and add its tooltips
         * @param tasknumber 
         * @param tasks 
         * @param parentColour 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param categoryLen 
         * @param leveLength 
         * @param currentLevel 
         * @param totalKPIs 
         * @param kpiFontSize 
         * @param typeColor 
         * @param taskLabelsFontFamily 
         * @param normalizer 
         * @param width 
         * @param thisObj 
         * @param types 
         * @param kpiFontColor 
         */
        private updateTaskLabelsHelperFunctionEleven(tasknumber, tasks, parentColour, firstChildColour, secondChildColour, thirdChildColour, categoryLen,
            leveLength, currentLevel, totalKPIs, kpiFontSize, typeColor, taskLabelsFontFamily, normalizer, width, thisObj, types, kpiFontColor) {
            const kpiDisplayDiv: any = this.kpiDiv.append("div").attr({
                "data-ParentId": tasks[tasknumber].parentId, "data-RowId": tasks[tasknumber].rowId,
                "data-expanded": tasks[tasknumber].expanded, "data-isLeaf": tasks[tasknumber].isLeaf, "data-level": tasks[tasknumber].level, "data-row": tasknumber
            });
            this.categoryLenUpdateTwo(categoryLen, leveLength, parentColour, firstChildColour, secondChildColour, thirdChildColour,
                kpiDisplayDiv, tasknumber);
            if (0 !== currentLevel.KPIValues.length) {
                for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                    let sKPITitle: string = tasks[tasknumber].KPIValues[jCount].name;
                    if (jCount === 0) {
                        kpiDisplayDiv.style({ height: "24px" });
                    }
                    const indicatorWidth: number = 75;
                    if (jCount < totalKPIs - 1) {
                        kpiDisplayDiv.append("div").classed("border", true).style("margin-left", (): string => {
                            return indicatorWidth * (jCount + 1) + pxLiteral;
                        });
                    }
                    const iCenterSpacing: number = 60;
                    if (this.viewModel.kpiData[jCount].type.toLowerCase() === "indicator") {
                        this.viewModelKpiDataTypeIndicator(kpiDisplayDiv, kpiFontColor, jCount, currentLevel, iCenterSpacing, kpiFontSize);
                    } else if (thisObj.viewModel.kpiData[jCount].type.toLowerCase() === "type") {
                        let axisKPILabel: any = kpiDisplayDiv.append("div").classed("rectangle", true), color: string = "#fff";
                        const iLeftAlignSpacing: number = 27; let text: string = currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : "";
                        if (!text) {
                            axisKPILabel.style("margin-left", (jCount * (iCenterSpacing + 15) + iLeftAlignSpacing + pxLiteral));
                            continue;
                        }
                        let titleText: string = text;
                        if (-1 === types.indexOf(text)) {
                            types.push(text);
                        }
                        let index: number = types.indexOf(text); typeColor = Gantt.typeColors[index % Gantt.typeColors.length];
                        text = text.charAt(0) + text.charAt(-1 !== text.indexOf(" ") ? text.indexOf(" ") + 1 : -1);
                        const iLeftSpacing: number = 5;
                        axisKPILabel.style("font-size", kpiFontSize + pxLiteral).style("background-color", typeColor).style("margin-top", 5 + pxLiteral)
                            .style("margin-left", (): string => {
                                if (text === undefined) {
                                    return (Gantt.kpiLabelWidth / totalKPIs * jCount) + iLeftSpacing + pxLiteral;
                                }
                                else {
                                    return ((jCount * (iCenterSpacing + 15)) + iLeftAlignSpacing + pxLiteral);
                                }
                            });
                        axisKPILabel.append("title").text(titleText);
                        axisKPILabel.append("div").append("text").text(text).style({ "color": "#fff", "stroke-width": Gantt.axisLabelStrokeWidth, })
                            .style("font-size", kpiFontSize + pxLiteral).style("margin-left", (): string => {
                                if (text === undefined) {
                                    return (Gantt.kpiLabelWidth / totalKPIs * jCount) + iLeftSpacing + pxLiteral;
                                } else {
                                    return iLeftSpacing + pxLiteral;
                                }
                            });
                        axisKPILabel.append("title").text(titleText);
                    } else {
                        let axisKPILabel: any = kpiDisplayDiv.append("div").classed("textValue", true).append("text"), iLeftSpacing: number = 5, clippedText: string;
                        if (typeof currentLevel.KPIValues[jCount].value === "number") {
                            clippedText = currentLevel.KPIValues[jCount].value.toString(); kpiDisplayDiv.append("text").text(clippedText)
                                .classed("singleCharacter", true).style({ "font-family": taskLabelsFontFamily, "font-size": normalizer + pxLiteral });
                            const singleCharacterLocal: any = $(".singleCharacter");
                            let textTotalWidth: number = singleCharacterLocal.innerWidth();
                            let numberOfCharactersAllowed: number = Math.floor((Gantt.kpiLabelWidth / totalKPIs) / (textTotalWidth / clippedText.length));
                            if (clippedText.length > numberOfCharactersAllowed) {
                                singleCharacterLocal.text(clippedText.substring(0, numberOfCharactersAllowed - 2) + ellipsisLiteral);
                                textTotalWidth = singleCharacterLocal.innerWidth();
                                let iCount: number = 0;
                                while (textTotalWidth < width) {
                                    iCount++;
                                    singleCharacterLocal.text(clippedText.substring(0, numberOfCharactersAllowed - 2 + iCount) + ellipsisLiteral);
                                    textTotalWidth = singleCharacterLocal.innerWidth();
                                }
                            } else {
                                iLeftSpacing = Gantt.kpiLabelWidth / totalKPIs - textTotalWidth - 5;
                            }
                            singleCharacterLocal.remove();
                        }
                        axisKPILabel.attr({ "margin-top": thisObj.getTaskLabelCoordinateY(tasknumber) + pxLiteral, "stroke-width": Gantt.axisLabelStrokeWidth })
                            .style("font-size", kpiFontSize + pxLiteral).style("margin-left", () => {
                                if (clippedText === undefined) {
                                    return (Gantt.kpiLabelWidth / totalKPIs * jCount) + iLeftSpacing + pxLiteral;
                                }
                                else {
                                    return ((jCount * (iCenterSpacing + 10)) + iCenterSpacing + pxLiteral);
                                }
                            });
                        axisKPILabel.text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "text"));
                        axisKPILabel.append("title").text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "title"));
                    }
                }
            }
        }

        /**
         * Method to perform actions when a bar is clicked
         * @param thisObj 
         * @param bars 
         */
        private updateTaskLabelsHelperFunctionThirteen(thisObj, bars) {
            bars.on("click", function (d: ITask): void {
                let sClass: any = this.className, rowNumber: string, oSplittedClassNames: string[] = sClass.animVal.split(" ");
                for (const iIterator of oSplittedClassNames) {
                    let className: string = iIterator;
                    if (className.indexOf("task_row") !== -1) {
                        rowNumber = className.substr(8, className.length - 8);
                        $(taskRowClassLiteral + rowNumber).addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                    }
                }
                thisObj.selectionManager.select(d.selectionId, false).then((ids: ISelectionId[]) => {
                    if (ids.length === 0) {
                        $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        Gantt.isSelected = false;
                    } else {
                        $(".gantt_task-rect").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                        $(".gantt_toggle-task").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                        $(".gantt_kpiClass").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                        $(".gantt_task-resource").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                        let sString: string = "", sStr: string = "";
                        if ($(".gantt_task-rect").attr("trancheAttr")) { sString = "trancheAttr"; }
                        else if ($(".gantt_task-rect").attr("projectAttr")) { sString = "projectAttr"; }
                        else if ($(".gantt_task-rect").attr("metroAttr")) { sString = "metroAttr"; }
                        else if ($(".gantt_task-rect").attr("regionAttr")) { sString = "regionAttr"; }
                        if (sString) { sStr = $(this).attr(sString); }
                        $(".gantt_toggle-task").addClass("gantt_loweropacity").removeClass("gantt_higheropacity");
                        $(taskRowClassLiteral + rowNumber).addClass("gantt_higheropacity").removeClass("gantt_loweropacity"); 
                        Gantt.isSelected = true;
                    }
                    thisObj.syncSelectionState(d3.selectAll(dotLiteral + Selectors.taskRect.className), thisObj.selectionManager.getSelectionIds());
                });
                let $LegendToggleImageId: JQuery = $("#LegendToggleImage");
                if ($LegendToggleImageId.hasClass("visible")) {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide(); 
                    $(".arrow").hide();
                }
                (<Event>d3.event).stopPropagation();
            });
        }

        /**
         * 
         * @param sString 
         */
        private getsString(sString) {
            if ($(this).attr("regionAttr") === "") {
                sString = "";
            } else if ($(this).attr("metroAttr") === "") {
                sString = "regionAttr";
            } else if ($(this).attr("projectAttr") === "") {
                sString = "metroAttr";
            } else if ($(this).attr("trancheAttr") === "") {
                sString = "projectAttr";
            } else {
                sString = "trancheAttr";
            }
            return sString;
        }

        /**
         * Update task labels and add its tooltips
         * @param thisObj 
         * @param tasks 
         * @param textsHierarchy 
         */
        private updateTaskLabelsHelperFunctionFourteen(thisObj, tasks, textsHierarchy) {
            textsHierarchy.on("click", function (d: any): void {
                $(".gantt_toggle-task").addClass("gantt_loweropacity");
                $(".gantt_task-rect").addClass("gantt_loweropacity");
                $(".gantt_kpiClass").addClass("gantt_loweropacity");
                $(".gantt_task-resource").addClass("gantt_loweropacity");
                let sString: string = "", sStr: string = "";
                sString = thisObj.getsString();
                sStr = $(this).attr(sString);
                let flag: boolean = false, categoryName: string = $(this).find("title").text(), selectedSelID: ISelectionId[] = [];
                const tasksLength2: number = tasks.length;
                for (let i: number = 0; i < tasksLength2; i++) {
                    for (let j: number = tasks[0].name.length - 1; j >= 0; j--) {
                        if (!(tasks[i].name[j])) {
                            continue;
                        }
                        let currentcategory: string;
                        if (j === 0) {
                            currentcategory = Gantt.regionValueFormatter.format(tasks[i].name[j]);
                        } else if (j === 1) {
                            currentcategory = Gantt.metroValueFormatter.format(tasks[i].name[j]);
                        } else if (j === 2) {
                            currentcategory = Gantt.projectValueFormatter.format(tasks[i].name[j]);
                        } else {
                            currentcategory = Gantt.trancheValueFormatter.format(tasks[i].name[j]);
                        }
                        let k: number = i;
                        if (currentcategory === categoryName || currentcategory.toString() === categoryName) {
                            if (Gantt.previousSel === categoryName) {
                                for (let m: number = 0; m < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; m++) {
                                    Gantt.selectionIdHash[m] = true;
                                    Gantt.previousSel = null;
                                }
                                $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                Gantt.isSelected = true;
                            } else {
                                for (let m: number = 0; m < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; m++) {
                                    Gantt.selectionIdHash[m] = false;
                                }
                                k = 0; let categoryLength: number, categoryValFormatted: string;
                                for (categoryLength = Gantt.globalOptions.dataViews[0].categorical.categories[j].values.length; k < categoryLength; k++) {
                                    if (j === 0) {
                                        categoryValFormatted = Gantt.regionValueFormatter.format(tasks[k].name[j]);
                                    } else if (j === 1) {
                                        categoryValFormatted = Gantt.metroValueFormatter.format(tasks[k].name[j]);
                                    } else if (j === 2) {
                                        categoryValFormatted = Gantt.projectValueFormatter.format(tasks[k].name[j]);
                                    } else {
                                        categoryValFormatted = Gantt.trancheValueFormatter.format(tasks[k].name[j]);
                                    }
                                    if (categoryValFormatted === categoryName || categoryValFormatted.toString() === categoryName) {
                                        Gantt.selectionIdHash[k] = true;
                                    }
                                }
                                Gantt.previousSel = currentcategory.toString();
                            }
                            flag = true;
                        }
                        if (flag) {
                            break;
                        }
                    }
                    if (flag) {
                        break;
                    }
                }
                selectedSelID = [];
                for (let i: number = 0; i < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; i++) {
                    if (Gantt.selectionIdHash[i] && selectionIds[i]) {
                        selectedSelID.push(selectionIds[i]); $(taskRowClassLiteral + i).addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                        Gantt.isSelected = true;
                    }
                    if (selectedSelID.length === selectionIds.length || selectedSelID.length === 0) {
                        Gantt.isSelected = false;
                    }
                }
                thisObj.selectionManager.select(selectedSelID).then((ids: ISelectionId[]) => {
                    if (ids.length === 0) {
                        $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        Gantt.isSelected = false;
                    }
                });
                let $LegendToggleImageId: JQuery = $("#LegendToggleImage");
                if ($LegendToggleImageId.hasClass("visible")) {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
                (<Event>d3.event).stopPropagation();
            });
        }

        /**
         * Method to get the div width
         * @param divTask 
         * @param divWidth 
         */
        public getDivWidth(divTask, divWidth) {
            if ($($(divTask)[0]).parent().width() < 200) {
                divWidth = 200;
            } else {
                divWidth = $(".ganttDiv").width();
            }
            return divWidth;
        }

        /**
         * Method to update lineDiv style on category length value
         * @param categoryLen 
         * @param leveLength 
         * @param lineDiv 
         * @param parentColour 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param tasknumber 
         * @param tasks 
         */
        public categoryLenUpdateThree(categoryLen, leveLength, lineDiv, parentColour, firstChildColour, secondChildColour, thirdChildColour, tasknumber, tasks) {
            if (categoryLen === 4) {
                if (leveLength === 1) {
                    lineDiv.style({ "background-color": parentColour, "opacity": 0.8 });
                } else if (leveLength === 2) {
                    lineDiv.style({ "background-color": firstChildColour, "opacity": 0.8 });
                } else if (leveLength === 3) {
                    lineDiv.style({ "background-color": secondChildColour, "opacity": 0.8 });
                } else if (leveLength === 4) {
                    lineDiv.style({ "background-color": thirdChildColour, "opacity": 0.8 });
                }
            }
            else if (categoryLen === 3) {
                if (leveLength === 1) {
                    lineDiv.style({ "background-color": firstChildColour, "opacity": 0.8 });
                } else if (leveLength === 2) {
                    lineDiv.style({ "background-color": secondChildColour, "opacity": 0.8 });
                } else if (leveLength === 3) {
                    lineDiv.style({ "background-color": thirdChildColour, "opacity": 0.8 });
                }
            }
            else if (categoryLen === 2) {
                if (leveLength === 1) {
                    lineDiv.style({ "background-color": secondChildColour, "opacity": 0.8 });
                } else if (leveLength === 2) {
                    lineDiv.style({ "background-color": thirdChildColour, "opacity": 0.8 });
                }
            }
            else {
                const backgroundBarColor: string = tasknumber % 2 === 0 ? thirdChildColour : firstChildColour;
                lineDiv.style({ "background-color": backgroundBarColor, "opacity": 0.8 });
            }
        }

        /**
         * 
         * @param tasknumber 
         * @param tasks 
         * @param levelMargin 
         * @param marginLevel 
         * @param marginFactor1 
         * @param axisLabelImg 
         * @param thisObj 
         * @param textMargin 
         * @param marginFactor2 
         * @param categoryLen 
         * @param leveLength 
         * @param lineDiv 
         * @param parentColour 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param currentLevel 
         * @param totalKPIs 
         * @param kpiFontSize 
         * @param typeColor 
         * @param taskLabelsFontFamily 
         * @param normalizer 
         * @param width 
         * @param types 
         * @param kpiFontColor 
         * @param opacityNumber1 
         * @param opacityNumber2 
         * @param taskResourceShow 
         * @param dataLabelsFontFamily 
         * @param taskResourceColor 
         */
        public ifElseHelperFunction(tasknumber, tasks, levelMargin, marginLevel, marginFactor1, axisLabelImg, thisObj, textMargin, marginFactor2,
            categoryLen, leveLength, lineDiv, parentColour, firstChildColour, secondChildColour, thirdChildColour,
            currentLevel, totalKPIs, kpiFontSize, typeColor, taskLabelsFontFamily, normalizer, width, types, kpiFontColor, opacityNumber1, opacityNumber2, taskResourceShow,
            dataLabelsFontFamily, taskResourceColor) {
            if (0 !== tasks[tasknumber].KPIValues.length) {
                this.updateTaskLabelsHelperFunctionEleven(tasknumber, tasks, parentColour, firstChildColour, secondChildColour, thirdChildColour,
                    categoryLen, leveLength, currentLevel, totalKPIs, kpiFontSize, typeColor, taskLabelsFontFamily, normalizer, width, thisObj, types, kpiFontColor);
            }
            if (!Gantt.isDateData) {
                const currentLevel1: ITask = tasks[tasknumber];
                const barBackgroundDiv: any = this.barDiv.append("div").classed("parentDiv", true).datum(currentLevel1).attr({
                    "data-ParentId": tasks[tasknumber].parentId, "data-RowId": tasks[tasknumber].rowId, "data-expanded": tasks[tasknumber].expanded,
                    "data-isLeaf": tasks[tasknumber].isLeaf, "data-level": tasks[tasknumber].level, "data-row": tasknumber
                }).style({
                    "border-bottom": "0.011px", "height": "24px", "margin-left": 0 + pxLiteral,
                    "width": parseInt(d3.select(".gantt_barSvg").attr("width"), 10) + pxLiteral
                });
                this.categoryLengthUpdate(categoryLen, leveLength, barBackgroundDiv, parentColour, firstChildColour, secondChildColour, thirdChildColour,
                    opacityNumber1, opacityNumber2, tasknumber);
                let taskRect: any = this.barDiv.append("div").classed("taskRect", true).datum(currentLevel).classed("show", true)
                    .attr({
                        "data-ParentId": tasks[tasknumber].parentId, "data-RowId": tasks[tasknumber].rowId, "data-expanded": tasks[tasknumber].expanded,
                        "data-isLeaf": tasks[tasknumber].isLeaf, "data-level": tasks[tasknumber].level, "data-row": tasknumber
                    });
                let yPos: number = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding, xPos: number = 0, xPosStart: number = 0;
                let obj = {}, level1: number = 0, parentRowId: number = 0;
                const rowId: number = 0;
                let selobjchildrencncierarchy: any = [];
                if (currentLevel.numEnd !== null || currentLevel.numStart !== null) {
                    if (isNaN(thisObj.taskDurationToWidth1(currentLevel)) || isNaN(thisObj.timeScale(<any>currentLevel.numStart))) {
                        this.updateTaskLabelsHelperFunctionEight(taskRect, tasks, currentLevel, selobjchildrencncierarchy, obj, level1, parentRowId, thisObj);
                    }
                    else {
                        this.updateTaskLabelsHelperFunctionSeven(taskRect, tasks, currentLevel, selobjchildrencncierarchy, thisObj, level1, parentRowId, obj);
                    }
                    yPos = Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                    if (xPos < thisObj.timeScale(<any>currentLevel.numEnd)) {
                        xPos = thisObj.timeScale(<any>currentLevel.numEnd);
                        xPosStart = thisObj.timeScale(<any>currentLevel.numStart);
                    }
                    if (xPos < thisObj.timeScale(<any>currentLevel.numEnd)) {
                        xPos = thisObj.timeScale(<any>currentLevel.numEnd);
                        xPosStart = thisObj.timeScale(<any>currentLevel.numStart);
                    }
                    thisObj.renderTooltip(taskRect);
                    let labelnormalizer: number = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20 : thisObj.viewModel.settings.taskResource.fontSize;
                    if (taskResourceShow) {
                        let taskResource: any = barBackgroundDiv.append("text").classed(Selectors.taskResource.className + spaceLiteral + taskRowLiteral + tasknumber, true);
                        Gantt.datalabelValueFormatter = valueFormatter.create({ format: measureFormat ? measureFormat : valueFormatter.DefaultNumericFormat });
                        if (currentLevel.resource != null) {
                            currentLevel.resource = Gantt.datalabelValueFormatter.format(currentLevel.resource);
                        } else {
                            currentLevel.resource = "";
                        }
                        const titleWidth: number = $(".resourceLabelText").innerWidth() * 0.7;
                        d3.selectAll(".resourceLabelText").remove();
                        let xPosVal: number = 0;
                        const barStartpt: string = $('div.taskRect[data-row = "' + tasknumber + '"]').css("margin-left");
                        const barStartpt1: number = parseInt(barStartpt.substring(0, barStartpt.length - 2));
                        const barEndpt: string = $('div.taskRect[data-row = "' + tasknumber + '"]').css("width");
                        const barEndpt1: number = parseInt(barEndpt.substring(0, barEndpt.length - 2));
                        xPosVal = this.updateTaskLabelsSwitchCaseHelperFive(xPosVal, barStartpt1, barEndpt1, thisObj);
                        taskResource.style({ 'margin-left': xPosVal + pxLiteral }).text(currentLevel.resource)
                            .style({ "color": taskResourceColor, "font-family": dataLabelsFontFamily, "font-size": labelnormalizer + pxLiteral });
                        taskResource.append("title").text(currentLevel.resource);
                        if (thisObj.viewModel.settings.taskResource.position.toLowerCase() === "center") {
                            taskResource.remove();
                            let displayText: string = null || undefined === currentLevel.resource ? "" : currentLevel.resource;
                            taskRect.append("text").text(displayText);
                            taskRect.style({
                                "color": taskResourceColor, "font-family": dataLabelsFontFamily, "font-size": labelnormalizer + pxLiteral,
                                "line-height": document.querySelector(".taskRect").clientHeight - 2 + pxLiteral, "text-align": "center"
                            });
                        }
                    }
                }
            }
            else {
                this.updateTaskLabelsHelperFunctionSix(tasknumber, thisObj, tasks, leveLength, opacityNumber1, opacityNumber2, categoryLen,
                    parentColour, firstChildColour, secondChildColour, thirdChildColour, taskResourceShow, taskResourceColor, dataLabelsFontFamily);
            }
        }

        /**
         * Method to perform actions on axis label click
         * @param axisLabelImg 
         * @param thisObj 
         * @param lineDiv 
         * @param marginLevel 
         * @param tasknumber 
         * @param tasks 
         */
        public axisLabelOnClick(axisLabelImg, thisObj, lineDiv, marginLevel, tasknumber, tasks) {
            axisLabelImg = lineDiv.append("img").style("margin-left", (marginLevel + pxLiteral))
                .attr("src", tasks[tasknumber].expanded ? Gantt.minusIcon : Gantt.plusIcon);
            axisLabelImg.on("click", function (this) {
                let sRowId: string, selectionId: any = thisObj.selectionManager, selectionIdLen: any = selectionId.selectedIds;
                let selectionIdLen1: number = selectionIdLen.length, selobjchildrencncierarchy: any = [];
                sRowId = $(this).parent().attr("data-RowId");
                if ($.grep(tasks, (e: any): any => e.rowId.toString() === sRowId)[0].expanded) {
                    this.src = Gantt.plusIcon;
                    $(this).parent().attr("data-expanded", "false");
                    thisObj.collapseFunctinality(tasks, sRowId);
                } else {
                    this.src = Gantt.minusIcon;
                    $(this).parent().attr("data-expanded", "true");
                    thisObj.expandFunctinality(tasks, sRowId);
                }
                if (selectionIdLen1 !== 0) {
                    thisObj.selectionManager.clear();
                    Gantt.lastSelectedbar = null;
                    d3.selectAll(".taskRect.show").classed("selected", false);
                    d3.selectAll(".taskRect.show").style({ opacity: 1 });
                    d3.selectAll(".gantt_taskPanel .show").style({ opacity: 1 });
                    for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                        $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 1 });
                    }
                }
                function getDirectChildInHierarchy(sRowID: any): any {
                    $.map(tasks, (sObj: any): void => {
                        if (sObj.parentId === sRowID) {
                            selobjchildrencncierarchy.push(sObj);
                            getDirectChildInHierarchy(sObj.rowId);
                        }
                    });
                    return selobjchildrencncierarchy;
                }
                if (Object.keys(Gantt.arrGantt).length === undefined) {
                    Gantt.arrGantt = JSON.parse(Gantt.stateValue);
                }
                for (const i of tasks) {
                    if (Object.keys(Gantt.arrGantt).length === undefined) {
                        if (!(sRowId === i.rowId.toString())) {
                            Gantt.expandCollapseStates[i.rowId] = false;
                        }
                    }
                    if (parseInt(sRowId, 10) === i.rowId && i.expanded !== true) {
                        Gantt.arrGantt[i.rowId] = true;
                    }
                    if (parseInt(sRowId, 10) === i.rowId && i.expanded === true) {
                        selobjchildrencncierarchy.push(i);
                        selobjchildrencncierarchy = getDirectChildInHierarchy(parseInt(sRowId, 10));
                        let j: number = 0;
                        for (const ijIterator of tasks) {
                            if (selobjchildrencncierarchy[j].rowId === ijIterator.rowId) {
                                Gantt.arrGantt[ijIterator.rowId] = false;
                                j++;
                                if (selobjchildrencncierarchy.length === j) {
                                    break;
                                }
                            }
                        }
                    }
                }
                thisObj.persistExpandCollapseState(Gantt.arrGantt);
            });
            return axisLabelImg;
        }

        /**
         * Update task labels and add its tooltips
         * @param parentTasks 
         * @param tasks 
         * @param tasknumber 
         * @param categoryLen 
         * @param parentColour 
         * @param yVal 
         * @param thisObj 
         * @param axisLabel 
         * @param normalizer 
         * @param firstChildColour 
         * @param secondChildColour 
         * @param thirdChildColour 
         * @param taskLabelsFontFamily 
         * @param totalKPIs 
         * @param taskResourceColor 
         * @param dataLabelsFontFamily 
         * @param opacityNumber1 
         * @param opacityNumber2 
         * @param taskResourceShow 
         * @param kpiFontSize 
         * @param kpiFontColor 
         * @param axisLabelImg 
         * @param taskLabelsColor 
         * @param typeColor 
         * @param width 
         * @param types 
         */
        private updateTaskLabelsHelperFunctionFifteen(parentTasks, tasks, tasknumber, categoryLen, parentColour, yVal, thisObj, axisLabel, normalizer,
            firstChildColour, secondChildColour, thirdChildColour, taskLabelsFontFamily, totalKPIs, taskResourceColor, dataLabelsFontFamily, opacityNumber1,
            opacityNumber2, taskResourceShow, kpiFontSize, kpiFontColor, axisLabelImg, taskLabelsColor, typeColor, width, types) {
            parentTasks = tasks.filter((key) => key.id === tasks[tasknumber].parentId);
            if (tasks[tasknumber].parentId === 1 || tasks[tasknumber].expanded || (parentTasks.length !== 0 && parentTasks[0].expanded)) {
                let currentLevel: ITask = tasks[tasknumber], leveLength: number = tasks[tasknumber].level, levelMargin: number, marginLevel: number;
                let textMargin: number = 10;
                levelMargin = (tasks[tasknumber].level * 10);
                if (yVal !== thisObj.getTaskLabelCoordinateY(tasknumber)) {
                    let divWidth: number = 0;
                    const divTask: any = this.taskDiv.append("div");
                    divWidth = this.getDivWidth(divTask, divWidth);
                    const lineDiv: any = this.taskDiv.append("div").style({ height: "24px", width: divWidth + pxLiteral }).classed("show", true)
                        .attr({
                            "data-ParentId": tasks[tasknumber].parentId, "data-RowId": tasks[tasknumber].rowId, "data-expanded": tasks[tasknumber].expanded,
                            "data-isLeaf": tasks[tasknumber].isLeaf, "data-level": tasks[tasknumber].level, "data-row": tasknumber
                        });
                    this.categoryLenUpdateThree(categoryLen, leveLength, lineDiv, parentColour, firstChildColour, secondChildColour, thirdChildColour, tasknumber, tasks);
                    yVal = thisObj.getTaskLabelCoordinateY(tasknumber);
                    const marginFactor1: number = 4, marginFactor2: number = 9;
                    if (!tasks[tasknumber].isLeaf) {
                        marginLevel = levelMargin;
                        if (tasks[tasknumber].level !== 1) {
                            marginLevel = levelMargin + (tasks[tasknumber].level * xFactor) + (tasks[tasknumber].level - 1) * marginFactor1;
                        }
                        axisLabelImg = this.axisLabelOnClick(axisLabelImg, thisObj, lineDiv, marginLevel, tasknumber, tasks);
                    } else {
                        if (tasks[tasknumber].level === 1) {
                            textMargin = levelMargin;
                        } else {
                            textMargin = levelMargin + (tasks[tasknumber].level * xFactor) + (tasks[tasknumber].level - 1) * marginFactor2;
                        }
                        marginLevel = 0;
                        scrollWidth = textMargin;
                    }
                    const taskName: any = (tasks[tasknumber].name) ? tasks[tasknumber].name : "(Blank)";
                    const lableWidth: number = textMeasurementService.measureSvgTextWidth(taskName);
                    const availableWIdth: number = Gantt.taskLabelWidthOriginal - marginLevel, catwidth: number = availableWIdth - textMargin;
                    axisLabel = lineDiv.append("text").text(taskName).call(axis.LabelLayoutStrategy.clip, catwidth, textMeasurementService.svgEllipsis)
                        .attr("title", tasks[tasknumber].name);
                    this.updateTaskLabelsHelperFunctionNine(axisLabel, normalizer, taskLabelsFontFamily, thisObj, tasks, textMargin, taskLabelsColor);
                    this.ifElseHelperFunction(tasknumber, tasks, levelMargin, marginLevel, marginFactor1, axisLabelImg, thisObj, textMargin, marginFactor2,
                        categoryLen, leveLength, lineDiv, parentColour, firstChildColour, secondChildColour, thirdChildColour,
                        currentLevel, totalKPIs, kpiFontSize, typeColor, taskLabelsFontFamily, normalizer, width, types, kpiFontColor, opacityNumber1, opacityNumber2,
                        taskResourceShow, dataLabelsFontFamily, taskResourceColor);
                    $(".gantt_legendIndicatorPanel").hide(); $(".arrow").hide();
                }
            }
        }

        /**
         * Update task labels and add its tooltips
         * @param tasknumber 
         * @param tasks 
         * @param opacityValue 
         * @param thisObj 
         * @param normalizer 
         * @param dataLabelsFontFamily 
         * @param taskResourceColor 
         * @param taskLabelsFontFamily 
         * @param taskResourceShow 
         */
        private updateTaskLabelsHelperFunctionSixteen(tasknumber, tasks, opacityValue, thisObj, normalizer, dataLabelsFontFamily,
            taskResourceColor, taskLabelsFontFamily, taskResourceShow) {
            let currentLevel: ITask = tasks[tasknumber];
            const regionAttr: string = "", metroAttr: string = "", projectAttr: string = "", trancheAttr: string = "";
            opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
            const backgroundRectBar: Selection<HTMLElement> = thisObj.backgroundGroupBar.append("rect")
                .attr({
                    fill: "#ccc", height: 24, opacity: opacityValue, width: parseInt(d3.select(".gantt_barSvg").attr("width"), 10),
                    x: 0, y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17
                });
            let taskGroupSelection: Selection<HTMLElement> = thisObj.taskGroup.append("g").classed(Selectors.taskGroup.className, true);
            let taskSelection: Selection<HTMLElement> = taskGroupSelection.append("g").classed(Selectors.singleTask.className, true);
            let yPos: number = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding, xPos: number = 0, xPosStart: number = 0;
            let eachPhaseSelection: Selection<ITask> = taskSelection.datum(currentLevel).append("g").classed(Selectors.singlePhase.className, true);
            let taskRect: Selection<ITask> = eachPhaseSelection.append("rect").classed(Selectors.taskRect.className, true).classed(taskRowLiteral + tasknumber, true);
            taskRect.attr({
                height: Gantt.getBarHeight() / 1.5, metroAttr, projectAttr, regionAttr, trancheAttr, width: 0 === thisObj.taskDurationToWidth(currentLevel)
                    ? 3 : thisObj.taskDurationToWidth(currentLevel), x: thisObj.timeScale(currentLevel.start), y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3
            })
                .style("fill", currentLevel.color);
            yPos = Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
            if (xPos < thisObj.timeScale(currentLevel.end)) {
                xPos = thisObj.timeScale(currentLevel.start) + (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                xPosStart = thisObj.timeScale(currentLevel.start);
            }
            if (xPos < thisObj.timeScale(currentLevel.end)) {
                xPos = thisObj.timeScale(currentLevel.start) + (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                xPosStart = thisObj.timeScale(currentLevel.start);
            }
            thisObj.renderTooltip(eachPhaseSelection);
            let labelnormalizer: number = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20 : thisObj.viewModel.settings.taskResource.fontSize;
            if (taskResourceShow) {
                let taskResource: Selection<HTMLElement> = taskSelection.append("text").classed(Selectors.taskResource.className + spaceLiteral + taskRowLiteral + tasknumber, true);
                if (resourcePresent && currentLevel.resource == null) {
                    currentLevel.resource = "(Blank)";
                }
                d3.select("body").append("text").text(currentLevel.resource).classed("resourceLabelText", true)
                    .style({ "font-family": dataLabelsFontFamily, "font-size": normalizer + pxLiteral });
                Gantt.datalabelValueFormatter = valueFormatter.create({ format: measureFormat ? measureFormat : valueFormatter.DefaultNumericFormat });
                if (currentLevel.resource !== null) {
                    currentLevel.resource = Gantt.datalabelValueFormatter.format(currentLevel.resource);
                } else {
                    currentLevel.resource = "";
                }
                const textProperties: TextProperties = {
                    fontFamily: thisObj.viewModel.settings.taskResource.fontFamily,
                    fontSize: thisObj.viewModel.settings.taskResource.fontSize + pxLiteral, text: currentLevel.resource
                };
                const titleWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
                d3.selectAll(".resourceLabelText").remove();
                let xPosVal: number = 0, datalabelMaxWidth: number, chartShiftRight: number = this.margin.left + transformRightValue;
                switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                    case "center": xPosVal = ((xPosStart + xPos) / 2) - (titleWidth / 2);
                        datalabelMaxWidth = titleWidth + 5;
                        break;
                    case "left": xPosVal = xPosStart - titleWidth - xFactor;
                        datalabelMaxWidth = chartShiftRight + xPosStart - xFactor;
                        break;
                    case "right":
                    default: xPosVal = xPos + xFactor;
                        datalabelMaxWidth = titleWidth + xFactor;
                        break;
                }
                if (xPosVal < 0) {
                    xPosVal = chartShiftRight + xPosVal;
                    xPosVal = (xPosVal > 0) ? xPosStart - titleWidth - 5 : -chartShiftRight;
                }
                taskResource.attr({ metroAttr, projectAttr, regionAttr, trancheAttr, x: xPosVal, y: yPos + labelnormalizer / 3 })
                    .text(currentLevel.resource).style({ "fill": taskResourceColor, "font-family": dataLabelsFontFamily, "font-size": labelnormalizer + pxLiteral })
                    .call(axis.LabelLayoutStrategy.clip, datalabelMaxWidth, textMeasurementService.svgEllipsis);
                taskResource.append("title").text(currentLevel.resource);
            }
            let selectionManager: ISelectionManager = this.selectionManager;
        }

        /**
         * Helper method to render bars/ rows
         * @param thisObj 
         * @param tasksLength 
         * @param opacityValue 
         * @param taskResourceShow 
         * @param dataLabelsFontFamily 
         * @param normalizer 
         * @param taskResourceColor 
         * @param tasks 
         */
        public forLoopHelperFunctionRenderBars(thisObj, tasksLength, opacityValue, taskResourceShow, dataLabelsFontFamily, normalizer,
            taskResourceColor, tasks: ITask[]) {
            for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                let currentLevel: ITask = tasks[tasknumber];
                const regionAttr: string = "", metroAttr: string = "", projectAttr: string = "", trancheAttr: string = "";
                let taskGroupSelection: Selection<HTMLElement>; opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                const backgroundRectBar: Selection<HTMLElement> = thisObj.backgroundGroupBar.append("rect")
                    .attr({
                        fill: "#ccc", height: 24, opacity: opacityValue, width: parseInt(d3.select(".gantt_barSvg").attr("width"), 10), x: 0,
                        y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17
                    });
                taskGroupSelection = thisObj.taskGroup.append("g").classed(Selectors.taskGroup.className, true);
                let taskSelection: Selection<HTMLElement> = taskGroupSelection.append("g").classed(Selectors.singleTask.className, true);
                let yPos: number = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding, xPos: number = 0, xPosStart: number = 0;
                let eachPhaseSelection: Selection<ITask> = taskSelection.datum(currentLevel).append("g").classed(Selectors.singlePhase.className, true);
                let taskRect: Selection<ITask> = eachPhaseSelection.append("rect").classed(Selectors.taskRect.className, true).classed(taskRowLiteral + tasknumber, true);
                if (currentLevel.numEnd !== null || currentLevel.numStart !== null) {
                    if (isNaN(thisObj.taskDurationToWidth1(currentLevel)) || isNaN(thisObj.timeScale(<any>currentLevel.numStart))) {
                        taskRect.attr({
                            height: Gantt.getBarHeight() / 1.5, metroAttr, projectAttr, regionAttr, trancheAttr, width: 0, x: 0,
                            y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3
                        }).style("fill", currentLevel.color);
                    }
                    else {
                        taskRect.attr({
                            height: Gantt.getBarHeight() / 1.5, metroAttr, projectAttr, regionAttr, trancheAttr,
                            width: 0 === thisObj.taskDurationToWidth1(currentLevel) ? 3 : thisObj.taskDurationToWidth1(currentLevel),
                            x: thisObj.timeScale(<any>currentLevel.numStart), y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3
                        }).style("fill", currentLevel.color);
                    }
                    yPos = Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                    if (xPos < thisObj.timeScale(<any>currentLevel.numEnd)) {
                        xPos = thisObj.timeScale(<any>currentLevel.numEnd);
                        xPosStart = thisObj.timeScale(<any>currentLevel.numStart);
                    }
                    if (xPos < thisObj.timeScale(<any>currentLevel.numEnd)) {
                        xPos = thisObj.timeScale(<any>currentLevel.numEnd);
                        xPosStart = thisObj.timeScale(<any>currentLevel.numStart);
                    }
                }
                thisObj.renderTooltip(eachPhaseSelection);
                if (currentLevel.numStart === null && currentLevel.numEnd === null) {
                    continue;
                }
                let labelnormalizer: number = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20 : thisObj.viewModel.settings.taskResource.fontSize;
                if (taskResourceShow) {
                    let taskResource: Selection<HTMLElement> = taskSelection.append("text").classed(Selectors.taskResource.className + spaceLiteral
                        + taskRowLiteral + tasknumber, true);
                    if (resourcePresent && currentLevel.resource == null) {
                        currentLevel.resource = "(Blank)";
                    }
                    d3.select("body").append("text").text(currentLevel.resource).classed("resourceLabelText", true)
                        .style({ "font-family": dataLabelsFontFamily, "font-size": normalizer + pxLiteral });
                    Gantt.datalabelValueFormatter = valueFormatter.create({ format: measureFormat ? measureFormat : valueFormatter.DefaultNumericFormat });
                    if (currentLevel.resource !== null) {
                        currentLevel.resource = Gantt.datalabelValueFormatter.format(currentLevel.resource);
                    } else {
                        currentLevel.resource = " ";
                    }
                    const textProperties: TextProperties = {
                        fontFamily: thisObj.viewModel.settings.taskResource.fontFamily, fontSize: thisObj.viewModel.settings.taskResource.fontSize + pxLiteral,
                        text: currentLevel.resource
                    };
                    const titleWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
                    d3.selectAll(".resourceLabelText").remove();
                    let xPosVal: number = 0;
                    xPosVal = this.updateTaskLabelsSwitchCaseHelperSeven(thisObj, xPosVal, xPosStart, xPos, titleWidth);
                    taskResource.attr({ metroAttr, projectAttr, regionAttr, trancheAttr, x: xPosVal, y: yPos + labelnormalizer / 3 })
                        .text(currentLevel.resource).style({ "fill": taskResourceColor, "font-family": dataLabelsFontFamily, "font-size": labelnormalizer + pxLiteral })
                        .call(axis.LabelLayoutStrategy.clip, Gantt.defaultValues.ResourceWidth - Gantt.resourceWidthPadding - 20, textMeasurementService.svgEllipsis);
                    taskResource.append("title").text(currentLevel.resource);
                }
            }
        }

        /**
         * Method to perform actions if task label is not in hierarchy view
         * @param kpiPanelWidth 
         * @param totalCategories 
         * @param lastRectX 
         * @param barPanelLeft 
         * @param columnHeaderBgColor 
         * @param columnHeaderColor 
         * @param columnHeaderFontFamily 
         * @param columnHeaderFontSize 
         * @param totalKPIs 
         * @param thisObj 
         * @param taskLabelsShow 
         * @param axisLabel 
         * @param taskLabelsColor 
         * @param normalizer 
         * @param taskLabelsFontFamily 
         * @param width 
         * @param kpiFontSize 
         * @param types 
         * @param typeColor 
         * @param kpiFontColor 
         * @param taskResourceShow 
         * @param dataLabelsFontFamily 
         * @param taskResourceColor 
         * @param tasks 
         */
        public checkIfTaskLabelIsHierarchyView(kpiPanelWidth, totalCategories, lastRectX, barPanelLeft, columnHeaderBgColor, columnHeaderColor, columnHeaderFontFamily,
            columnHeaderFontSize, totalKPIs, thisObj, taskLabelsShow, axisLabel, taskLabelsColor, normalizer, taskLabelsFontFamily, width, kpiFontSize, types, typeColor,
            kpiFontColor, taskResourceShow, dataLabelsFontFamily, taskResourceColor, tasks: ITask[]) {
            let objects: DataViewObjects = null, getJSONString: string, columnWidth: number = 0, horizGridX2Arr: number[] = [], columnWidthsArr: number[] = [];
            let taskColumnArr: number[] = [], horizGridX1Arr: number[] = [], vertGridArr: number[] = [];
            objects = this.viewModel.dataView.metadata.objects;
            getJSONString = getValue<string>(objects, "categoryColumnsWidth", "width", "text");
            let numOfCharsAllowedHeader: number = 0;
            numOfCharsAllowedHeader = Gantt.taskLabelWidth / (Gantt.iHeaderSingleCharWidth * this.viewModel.tasksNew[0].name.length);
            kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));
            for (let iIterator: number = 0; iIterator <= 3; iIterator++) {
                columnWidthsArr[iIterator] = 0;
                taskColumnArr[iIterator] = 0;
                horizGridX1Arr[iIterator] = 0;
                horizGridX2Arr[iIterator] = 0;
                vertGridArr[iIterator] = 0;
            }
            for (let jCount: number = 0; jCount < totalCategories; jCount++) {
                this.updateTaskLabelsForLoopHelperTwo(objects, getJSONString, columnWidth, jCount, taskColumnArr, totalCategories, kpiPanelWidth, lastRectX,
                    barPanelLeft, columnHeaderBgColor, columnHeaderColor, columnHeaderFontFamily, columnHeaderFontSize, vertGridArr, horizGridX1Arr,
                    horizGridX2Arr, columnWidthsArr);
            }
            for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                let axisKPILabel: Selection<HTMLElement> = this.kpiTitleGroup.append("text").classed(Selectors.label.className, true);
                axisKPILabel.attr({
                    "background": columnHeaderBgColor, "fill": columnHeaderColor, "font-family": columnHeaderFontFamily,
                    "font-size": columnHeaderFontSize + pxLiteral, "stroke-width": Gantt.axisLabelStrokeWidth, "x": 3 + (Gantt.kpiLabelWidth / totalKPIs * jCount), "y": 15
                });
                let sKPITitle: string = tasks[0].KPIValues[jCount].name, sFirstWord: string = sKPITitle.substr(0, sKPITitle.indexOf(" "));
                this.updateTaskLabelsSwitchCaseHelperFour(sFirstWord, sKPITitle);
                let numberOfCharsAllowed: number = 75 / (Gantt.iKPIHeaderSingleCharWidth);
                axisKPILabel.text(Gantt.getLabelValuesNew(sKPITitle ? sKPITitle : "", "text", numberOfCharsAllowed));
                axisKPILabel.append("title").text(sKPITitle);
                if (jCount !== 0) {
                    let kpiTitleVerticleLine: Selection<HTMLElement> = this.kpiTitleGroup.append("line").classed(verticalLineSimpleLiteral, true);
                    kpiTitleVerticleLine.attr({
                        stroke: "#f2f2f2", x1: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                        x2: (Gantt.kpiLabelWidth / totalKPIs * jCount), y1: 0, y2: 30
                    });
                    let kpiVerticleLine: Selection<HTMLElement> = this.kpiGroup.append("line").classed(verticalLineSimpleLiteral, true);
                    kpiVerticleLine.attr({
                        stroke: "#f2f2f2", x1: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                        x2: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1, y1: 0, y2: Gantt.currentTasksNumber * chartLineHeight + 8
                    });
                }
            }
            let categoryObject: string[] = [];
            const tasksLength: number = tasks.length;
            let yVal: number = -1, opacityValue: number = 0;
            const width1: number = $(".gantt_taskSvg").width();
            for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                this.updateTaskLabelsHelperFunctionTen(thisObj, tasknumber, tasks, totalCategories, taskLabelsShow, categoryObject, yVal, opacityValue,
                    width1, axisLabel, taskLabelsColor, taskColumnArr, normalizer, lastRectX, taskLabelsFontFamily, kpiPanelWidth, width, totalKPIs,
                    kpiFontSize, types, typeColor, columnWidthsArr, barPanelLeft, kpiFontColor);
            }
            if (!Gantt.isDateData) { // Render bars
                this.forLoopHelperFunctionRenderBars(thisObj, tasksLength, opacityValue, taskResourceShow, dataLabelsFontFamily, normalizer, taskResourceColor, tasks);
            } else {
                for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                    this.updateTaskLabelsHelperFunctionSixteen(tasknumber, tasks, opacityValue, thisObj, normalizer, dataLabelsFontFamily, taskResourceColor,
                        taskLabelsFontFamily, taskResourceShow);
                }
            }
            let bars: Update<ITask> = d3.selectAll(dotLiteral + Selectors.taskRect.className).data(tasks);
            this.updateTaskLabelsHelperFunctionThirteen(thisObj, bars);
            let textsHierarchy: Selection<SVGAElement> = d3.selectAll(dotLiteral + Selectors.toggleTask.className);
            this.updateTaskLabelsHelperFunctionFourteen(thisObj, tasks, textsHierarchy);
            this.updateTaskLabelsHelperFunctionTwelve(thisObj, bars);
            bars.exit().remove();
            let taskPanelWidth: number = $(".gantt_taskPanel").width(), totalCategoryLength: number = this.viewModel.tasksNew[0].name.length;
            lastRectX = parseFloat($(headerCellClassLiteral + (totalCategoryLength - 1)).attr("x"));
            barPanelLeft = parseFloat(d3.select(".gantt_barPanel").style("left"));
            kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));
            d3.select(dotLiteral + Selectors.bottomTaskDiv.className).style({ width: PixelConverter.toString(taskPanelWidth) });
            d3.select(".gantt_drillAllPanel2").style("width", PixelConverter.toString(taskPanelWidth));
            if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 12) || lastRectX > barPanelLeft - 12) {
                d3.select(dotLiteral + Selectors.bottomTaskSvg.className).style({ width: PixelConverter.toString(lastRectX + 100) });
                d3.select(".gantt_taskSvg").style({ width: PixelConverter.toString(lastRectX + 100) });
                d3.selectAll(".gantt_backgroundRect").attr({ width: lastRectX + 100 });
                d3.select(".gantt_drillAllSvg2").style({ width: PixelConverter.toString(lastRectX + 100) });
                d3.selectAll(horizontalLineClassLiteral + (totalCategoryLength - 1)).attr("x2", lastRectX + 100);
            } else {
                d3.select(dotLiteral + Selectors.bottomTaskSvg.className).style({ width: PixelConverter.toString(taskPanelWidth) });
                d3.select(".gantt_taskSvg").style({ width: PixelConverter.toString(taskPanelWidth) });
                d3.selectAll(".gantt_backgroundRect").attr({ width: taskPanelWidth });
                d3.select(".gantt_drillAllSvg2").style({ width: PixelConverter.toString(taskPanelWidth) });
            }
        }

        /**
         * Method to perform actions if task label is in hierarchy view
         * @param columnHeaderBgColor 
         * @param columnHeaderColor 
         * @param columnHeaderFontFamily 
         * @param columnHeaderFontSize 
         * @param totalKPIs 
         * @param thisObj 
         * @param axisLabel 
         * @param normalizer 
         * @param taskLabelsFontFamily 
         * @param taskResourceColor 
         * @param dataLabelsFontFamily 
         * @param taskResourceShow 
         * @param kpiFontSize 
         * @param axisLabelImg 
         * @param typeColor 
         * @param width 
         * @param types 
         * @param kpiFontColor 
         * @param taskLabelsColor 
         * @param tasks 
         */
        public checkIfTaskLabelIsHierarchyViewTwo(columnHeaderBgColor, columnHeaderColor, columnHeaderFontFamily, columnHeaderFontSize, totalKPIs, thisObj,
            axisLabel, normalizer, taskLabelsFontFamily, taskResourceColor, dataLabelsFontFamily, taskResourceShow, kpiFontSize, axisLabelImg, typeColor, width, types,
            kpiFontColor, taskLabelsColor, tasks: ITask[]) {
            this.taskDiv.remove();
            this.kpiDiv.remove();
            this.backgroundGroupBar.remove();
            if ($(".taskRect").length > 0) {
                $(".taskRect").remove();
                $(".gantt_barPanel").not(":first").remove();
            }
            this.taskDiv = this.bottomDiv.append("div").classed(Selectors.taskPanel.className, true);
            this.taskDiv.style({ border: "1px Black", class: "ganttTaskDiv", width: PixelConverter.toString(Gantt.taskLabelWidth + 20) });
            this.kpiDiv = this.bottomDiv.append("div").classed(Selectors.kpiPanel.className, true);
            this.kpiDiv.style({ class: "ganttKpiDiv", left: PixelConverter.toString(Gantt.taskLabelWidth + 20), width: PixelConverter.toString(Gantt.kpiLabelWidth) });
            this.barDiv = this.bottomDiv.append("div").classed(Selectors.barPanel.className, true);
            this.barDiv.style({
                class: "ganttBarDiv", left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - 20)
            });
            const parentColour: string = "#C2C2C2", firstChildColour: string = "#E0E0E0", secondChildColour: string = "#F0F0F0";
            const thirdChildColour: string = "#FFFFFF"; const opacityNumber1: number = 0.6, opacityNumber2: number = 0.8, categoryLen: number = Gantt.categorylength;
            if ((this.viewModel.settings.legend.show && (this.viewport.width > $(".gantt_legendIndicatorPanel").innerWidth() + 100)
                && this.viewport.height > $(".gantt_legendIndicatorPanel").innerHeight() + 50 && this.viewModel.kpiData.length > 0)
                && (parseFloat(d3.select(".gantt_legendPanel").style("left")) > parseFloat(d3.select(".gantt_barPanel").style("left")))) {
                $(".gantt_legendPanel").show();
                if ($("#LegendToggleImage").hasClass("visible")) {
                    $(".gantt_legendIndicatorPanel").show();
                    $(".arrow").show();
                } else {
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            } else {
                $(".arrow").hide();
                $(".gantt_legendPanel").hide();
                $(".gantt_legendIndicatorPanel").hide();
            }
            const textElement: Selection<HTMLElement> = this.drillAllGroup.append("text")
                .attr("class", categoryLiteral + spaceLiteral + taskColumnLiteral).attr("x", 15).attr("y", 10);
            d3.select(categoryClassLiteral).text("Category hierarchy").style({
                "background-color": columnHeaderBgColor, "fill": columnHeaderColor,
                "font-family": columnHeaderFontFamily, "font-size": columnHeaderFontSize + pxLiteral
            });
            d3.select(categoryClassLiteral).append("title")
                .text(Gantt.getLabelValuesNew(Gantt.categoriesTitle.toString() ? Gantt.categoriesTitle.toString() : "", "text", 50));
            for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                let axisKPILabel1: Selection<HTMLElement> = this.kpiTitleGroup.append("text").classed(Selectors.label.className, true);
                axisKPILabel1.attr({
                    "background": columnHeaderBgColor, "fill": columnHeaderColor, "font-family": columnHeaderFontFamily,
                    "font-size": columnHeaderFontSize + pxLiteral, "stroke-width": Gantt.axisLabelStrokeWidth, "x": 3 + (Gantt.kpiLabelWidth / totalKPIs * jCount), "y": 15
                });
                let sKPITitle: string = tasks[0].KPIValues[jCount].name, sFirstWord: string = sKPITitle.substr(0, sKPITitle.indexOf(" "));
                this.updateSwitchCaseHelperThree(sFirstWord, sKPITitle);
                let numberOfCharsAllowed: number = 75 / (Gantt.iKPIHeaderSingleCharWidth);
                axisKPILabel1.text(Gantt.getLabelValuesNew(sKPITitle ? sKPITitle : "", "text", numberOfCharsAllowed));
                axisKPILabel1.append("title").text(sKPITitle);
                if (jCount !== 0) {
                    let kpiTitleVerticleLine: Selection<HTMLElement> = this.kpiTitleGroup.append("line").classed(verticalLineSimpleLiteral, true);
                    kpiTitleVerticleLine.attr({
                        stroke: "#f2f2f2", x1: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                        x2: (Gantt.kpiLabelWidth / totalKPIs * jCount), y1: 0, y2: 30
                    });
                    let kpiVerticleLine: Selection<HTMLElement> = this.kpiGroup.append("line").classed(verticalLineSimpleLiteral, true);
                    kpiVerticleLine.attr({
                        stroke: "#f2f2f2", x1: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                        x2: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1, y1: 0, y2: Gantt.currentTasksNumber * chartLineHeight + 8
                    });
                }
            }
            let yVal: number = -1, parentTasks: any;
            for (let tasknumber: number = 0; tasknumber < tasks.length; tasknumber++) {
                this.updateTaskLabelsHelperFunctionFifteen(parentTasks, tasks, tasknumber, categoryLen, parentColour, yVal, thisObj, axisLabel, normalizer, firstChildColour,
                    secondChildColour, thirdChildColour, taskLabelsFontFamily, totalKPIs, taskResourceColor, dataLabelsFontFamily, opacityNumber1,
                    opacityNumber2, taskResourceShow, kpiFontSize, kpiFontColor, axisLabelImg, taskLabelsColor, typeColor, width, types);
            }
            this.updateTaskLabelsHelperFunctionFour();
        }

        /**
         * Update task labels and add its tooltips
         * @param tasks All tasks array
         * @param width The task label width
         */
        private updateTaskLabels(tasks: ITask[], width: number): void {
            const expandeditems: any = [];
            let axisLabel: Selection<HTMLElement>, axisLabelImg: any, columnHeaderColor: string, columnHeaderBgColor: string, columnHeaderFontSize: number;
            let columnHeaderFontFamily: string, columnHeaderOutline: string, dataLabelsFontFamily: string, taskLabelsShow: boolean;
            let taskLabelsColor: string, taskLabelsFontSize: number, taskLabelsFontFamily: string, totalKPIs: number, totalCategories: number;
            let normalizer: number, kpiFontSize: number;
            let kpiFontColor: string, types: string[], typeColor: string, taskResourceShow: boolean, taskResourceColor: string;
            let taskResourceFontSize: number, valueKPI: string, indicatorKPI: string, taskGridLinesShow: boolean, taskGridLinesColor: string;
            let taskGridLinesInterval: number, isTaskLabelHierarchyView: boolean;
            let thisObj: Gantt, barPanelLeft: number, kpiPanelWidth: number, lastRectX: number;
            thisObj = this;
            columnHeaderColor = this.viewModel.settings.columnHeader.fill;
            columnHeaderBgColor = this.viewModel.settings.columnHeader.fill2;
            columnHeaderFontSize = this.viewModel.settings.columnHeader.fontSize;
            columnHeaderFontFamily = this.viewModel.settings.columnHeader.fontFamily;
            columnHeaderOutline = this.viewModel.settings.columnHeader.columnOutline;
            dataLabelsFontFamily = this.viewModel.settings.taskResource.fontFamily;
            taskLabelsShow = this.viewModel.settings.taskLabels.show;
            taskLabelsColor = this.viewModel.settings.taskLabels.fill;
            taskLabelsFontSize = this.viewModel.settings.taskLabels.fontSize;
            taskLabelsFontFamily = this.viewModel.settings.taskLabels.fontFamily;
            totalKPIs = this.viewModel.kpiData.length;
            totalCategories = tasks[0].name.length;
            normalizer = (this.viewModel.settings.taskLabels.fontSize > 20) ? 20 : this.viewModel.settings.taskLabels.fontSize;
            kpiFontSize = 23 * Gantt.maximumNormalizedFontSize / Gantt.maximumFontSize; kpiFontColor = "#000";
            this.kpiTitleGroup.selectAll("*").remove();
            this.kpiGroup.selectAll("*").remove();
            this.lineGroup.selectAll("*").remove();
            this.drillAllGroup.selectAll("*").remove();
            this.toggleTaskGroup.selectAll("*").remove();
            this.taskGroup.selectAll("*").remove();
            this.backgroundGroupTask.selectAll("*").remove();
            this.backgroundGroupKPI.selectAll("*").remove();
            this.backgroundGroupBar.selectAll("*").remove();
            types = [];
            typeColor = "";
            taskResourceShow = this.viewModel.settings.taskResource.show;
            taskResourceColor = this.viewModel.settings.taskResource.fill;
            taskResourceFontSize = this.viewModel.settings.taskResource.fontSize;
            valueKPI = this.viewModel.settings.kpiColumnType.value;
            indicatorKPI = this.viewModel.settings.kpiColumnType.indicator;
            taskGridLinesShow = this.viewModel.settings.taskGridlines.show;
            taskGridLinesColor = this.viewModel.settings.taskGridlines.fill;
            taskGridLinesInterval = this.viewModel.settings.taskGridlines.interval;
            isTaskLabelHierarchyView = this.viewModel.settings.taskLabels.isHierarchy;
            let $DrillAllPanel2Class: JQuery = $(".gantt_drillAllPanel2"), $KpiTitlePanelClass: JQuery = $(".gantt_kpiTitlePanel"), $TaskSvg: JQuery = $(".gantt_taskSvg");
            $KpiTitlePanelClass.css("background-color", columnHeaderBgColor);
            $DrillAllPanel2Class.css("background-color", columnHeaderBgColor);
            this.columnHeaderOutlineUpdate($KpiTitlePanelClass, $DrillAllPanel2Class, $TaskSvg, columnHeaderOutline);
            if (!isTaskLabelHierarchyView) {
                this.checkIfTaskLabelIsHierarchyView(kpiPanelWidth, totalCategories, lastRectX, barPanelLeft, columnHeaderBgColor, columnHeaderColor, columnHeaderFontFamily,
                    columnHeaderFontSize, totalKPIs, thisObj, taskLabelsShow, axisLabel, taskLabelsColor, normalizer, taskLabelsFontFamily, width, kpiFontSize, types, typeColor,
                    kpiFontColor, taskResourceShow, dataLabelsFontFamily, taskResourceColor, tasks);
            } else {
                this.checkIfTaskLabelIsHierarchyViewTwo(columnHeaderBgColor, columnHeaderColor, columnHeaderFontFamily, columnHeaderFontSize, totalKPIs, thisObj,
                    axisLabel, normalizer, taskLabelsFontFamily, taskResourceColor, dataLabelsFontFamily, taskResourceShow, kpiFontSize, axisLabelImg, typeColor, width, types,
                    kpiFontColor, taskLabelsColor, tasks);
            }
        }

        /**
         * Method to collapse rows in hierarchy view
         * @param tasks 
         * @param parentRowId1 
         */
        public collapseFunctinality(tasks: ITask[], parentRowId1: any): void {
            $('div[data-parentid = "' + parentRowId1 + '"]').hide();
            const arrRowid: any = [];
            const arr: any = [];
            if (($($("div[data-parentid = '" + parentRowId1 + "']")).attr("data-isleaf"))) {
                arr.push($("div[data-parentid = '" + parentRowId1 + "']"));
                for (const ijterator: number = 0; iterator < arr[0].length; iterator++) {
                    arrRowid.push($($("div[data-parentid = '" + parentRowId1 + "']")[ijterator]).attr("data-rowid"));
                }
                for (const rowid1 of arrRowid) {
                    this.collapseFunctinality(tasks, this.collapseFunctinality(tasks, rowid1));
                }
            }
        }

        /**
         * Method to expand rows in hierarchy view
         * @param tasks 
         * @param parentRowId1 
         */
        public expandFunctinality(tasks: ITask[], parentRowId1: any): void {
            $('div[data-parentid = "' + parentRowId1 + '"]').show();
        }

        /**
         * Returns the matching Y coordinate for a given task index
         * @param taskIndex Task Number
         */
        private getTaskLabelCoordinateY(taskIndex: number): number {
            const fontSize: number = + (this.viewModel.settings.taskLabels.fontSize * Gantt.maximumNormalizedFontSize)
                / Gantt.maximumFontSize;
            return (chartLineHeight * taskIndex) + (Gantt.getBarHeight() +
                Gantt.barHeightMargin - (chartLineHeight - fontSize) / Gantt.chartLineHeightDivider) - 3.5;
        }

        /**
         * Convert task duration to width in the time scale
         * @param task The task to convert
         */
        private taskDurationToWidth(task: ITask): number {
            if (this.timeScale(task.end) - this.timeScale(task.start) < 0) {
                return 0;
            }
            return this.timeScale(task.end) - this.timeScale(task.start);
        }

        /**
         * Convert task duration to width in the time scale
         * @param task 
         */
        private taskDurationToWidth1(task: any): number {
            if (this.timeScale(task.numEnd) - this.timeScale(task.numStart) < 0) {
                return 0;
            }
            return this.timeScale(task.numEnd) - this.timeScale(task.numStart);
        }

        /**
         * Method to set tootlip for Today line
         * @param timestamp 
         * @param milestoneTitle 
         */
        private getTooltipForTodayLine(timestamp: number, milestoneTitle: string): VisualTooltipDataItem[] {
            let today: Date;
            today = new Date();
            let stringDate: string;
            stringDate = (zeroLiteral + (today.getMonth() + 1)).slice(-2)
                + slashLiteral + (zeroLiteral + today.getDate()).slice(-2) +
                slashLiteral + today.getFullYear() + spaceLiteral + (zeroLiteral + today.getHours()).slice(-2);
            let tooltip: VisualTooltipDataItem[];
            tooltip = [{ displayName: milestoneTitle, value: stringDate }];
            return tooltip;
        }

        /**
         * Create vertical dotted line that represent milestone in the time axis (by default it shows not time)
         * @param tasks All tasks array
         * @param timestamp the milestone to be shown in the time axis (default Date.now())
         */
        private createTodayLine(totalTasks: number,
            milestoneTitle: string = "Today", timestamp: number = Date.now()): void {
            let todayDate: string;
            todayDate = new Date().toString();
            let line: Line[];
            line = [{
                tooltipInfo: this.getTooltipForTodayLine(timestamp, milestoneTitle),
                x1: this.timeScale(new Date(todayDate)),
                x2: this.timeScale(new Date(todayDate)),
                y1: Gantt.milestoneTop,
                y2: this.getTodayLineLength(totalTasks) + 15
            }];
            let chartLineSelection: Update<Line>;
            chartLineSelection = this.chartGroup.selectAll(Selectors.chartLine.selectorName).data(line);
            if (this.viewModel.settings.dateType.enableToday) {
                chartLineSelection
                    .enter()
                    .append("line")
                    .style({
                        "opacity": 1,
                        "position": "absolute",
                        "z-index": 1000
                    })
                    .classed(Selectors.chartLine.className, true);
                chartLineSelection.attr({
                    x1: (lines: Line) => lines.x1,
                    x2: (lines: Line) => lines.x2,
                    y1: (lines: Line) => lines.y1,
                    y2: (lines: Line) => lines.y2 - $(".gantt_bottomMilestoneSvg").innerHeight() + pxLiteral
                });
                this.renderTooltip(chartLineSelection);
                chartLineSelection.exit().remove();
            } else {
                chartLineSelection.remove();
            }
            // today's indicator
            let xPosition: number;
            xPosition = this.timeScale(new Date(todayDate)) + 21;
            let yPosition: number;
            yPosition = 11;
            let triangleWidth: number;
            triangleWidth = 16;
            let x1: number;
            let y1: number;
            let x2: number;
            let y2: number;
            let x3: number;
            let y3: number;
            let mLiteral: string;
            let lLiteral: string;
            let zLiteral: string;
            let minusLiteral: string;
            let rotateLieral: string;
            x1 = xPosition;
            y1 = yPosition - triangleWidth / 3.5;
            x2 = xPosition;
            y2 = yPosition + triangleWidth / 3.5;
            x3 = xPosition + triangleWidth / 2;
            y3 = yPosition;
            mLiteral = "M";
            lLiteral = "L";
            zLiteral = "Z";
            minusLiteral = "-";
            rotateLieral = "rotate";
            this.todayGroup.selectAll("*").remove();
            if (this.viewModel.settings.dateType.enableToday) {
                let x: number;
                x = this.timeScale(new Date(todayDate)) + 10;
                this.todayindicator = this.todayGroup
                    .append("path")
                    .classed(Selectors.todayIndicator.className, true)
                    .attr({
                        d: mLiteral + x1 + spaceLiteral + y1 + spaceLiteral + lLiteral + x2 + spaceLiteral +
                            y2 + spaceLiteral + lLiteral + x3 + spaceLiteral + y3 + spaceLiteral + zLiteral,
                        transform: rotateLieral + paranthesisStartLiteral + minusLiteral + 90 + commaLiteral +
                            xPosition + commaLiteral + yPosition + paranthesisEndLiteral
                    })
                    .style({
                        fill: "red"
                    });
                this.todayText = this.todayGroup
                    .append("text")
                    .attr({
                        x: this.timeScale(new Date(todayDate)) + 8,
                        y: 20
                    })
                    .text("Today")
                    .classed(Selectors.todayText.className, true);
            }
        }

        /**
         * Method to add tooltip on visual
         * @param selection 
         */
        private renderTooltip(selection: Selection<any>): void {
            this.tooltipServiceWrapper.addTooltip(
                selection,
                (tooltipEvent: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                    return tooltipEvent.data.tooltipInfo;
                });
        }

        /**
         * Method to update elements positions
         * @param viewport 
         * @param margin 
         */
        private updateElementsPositions(viewport: IViewport, margin: IMargin): void {
            const taskLabelsWidth: number = this.viewModel.settings.taskLabels.show ? this.viewModel.settings.taskLabels.width : 0;
            this.gridGroup.attr("transform", svg.translate(margin.left + 18, Gantt.taskLabelsMarginTop)); // added for gridlines
            this.axisGroup.attr("transform", svg.translate(margin.left + 18, Gantt.taskLabelsMarginTop + 3));
            this.chartGroup.attr("transform", svg.translate(margin.left + 18, 0));
            this.lineGroup.attr("transform", svg.translate(0, 0));
            this.bottommilestoneGroup.attr("transform", svg.translate(margin.left + 18, 0));
            this.todayGroup.attr("transform", svg.translate(18, 0));
            this.drillAllGroup.attr("transform", svg.translate(0, 5));
            this.legendGroup.attr("transform", svg.translate(0, 0));
        }

        /**
         * Method to set the length of the Today line
         * @param numOfTasks 
         */
        private getTodayLineLength(numOfTasks: number): number {
            return numOfTasks * chartLineHeight;
        }

    }
}

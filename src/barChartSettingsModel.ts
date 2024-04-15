import powerbiVisualsApi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import { BarChartDataPoint } from "./barChart";

import Card = formattingSettings.SimpleCard;
import Model = formattingSettings.Model;
import FormattingSettingsSlice = formattingSettings.Slice;

class EnableAxisCardSettings extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: undefined,
        value: false,
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Color",
        value: { value: "#000000" }
    });
    topLevelSlice = this.show;
    name: string = "enableAxis";
    displayName: string = "Enable Axis";
    slices = [this.fill];
}


class ColorSelectorCardSettings extends Card {

    public name: string = "colorSelector";
    public displayNameKey:string = "Data Colors";

    //it is important to implement color conditional formating only for a default color, and not to all datapoints colors. In other case there will be no sense to use conditional formatting pattern at all. 
    public defaultColor = new formattingSettings.ColorPicker({
        name: "defaultColor",
        displayNameKey: "Visual_Default_Color",
        value: {value: "#01B8AA"},
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule,
        selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals),
        altConstantSelector: null,
        visible: true
    });

    public showAllDataPoints = new formattingSettings.ToggleSwitch({
        name: "showAllDataPoints",
        displayNameKey: "Visual_DataPoint_Show_All",
        value: false,
        visible: true
    })

    public slices: FormattingSettingsSlice[] = [this.defaultColor, this.showAllDataPoints];
}

class GeneralViewCardSettings extends Card {
    opacity = new formattingSettings.NumUpDown({
        name: "opacity",
        displayName: "Bars Opacity",
        value: 100,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: 0,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: 100,
            }
        }
    });

    showHelpLink = new formattingSettings.ToggleSwitch({
        name: "showHelpLink",
        displayName: "Show Help Button",
        value: false
    });

    name: string = "generalView";
    displayName: string = "General View";
    helpLinkColor: string = "#80B0E0"
    slices = [this.opacity, this.showHelpLink];
}

class AverageLineCardSettings extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: undefined,
        value: false,
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Color",
        value: { value: "#888888" },
    });

    showDataLabel = new formattingSettings.ToggleSwitch({
        name: "showDataLabel",
        displayName: "Data Label",
        value: false
    });

    topLevelSlice = this.show;
    name: string = "averageLine";
    displayName: string = "Average Line";
    analyticsPane: boolean = true;
    slices = [this.show, this.fill, this.showDataLabel];
}

class DirectEditSettings extends Card {
    displayName = 'Direct Edit';
    name = 'directEdit';
    private minFontSize: number = 8;
    private defaultFontSize: number = 11;
    private positionOptions: powerbiVisualsApi.IEnumMember[] = [{ displayName: 'Right', value: 'Right' }, { displayName: 'Left', value: 'Left' }]
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: undefined,
        value: true,
    });

    topLevelSlice = this.show;
    textProperty = new formattingSettings.TextInput({
        displayName: "Text Property",
        name: "textProperty",
        value: "What is your quest?",
        placeholder: ""
    });

    position = new formattingSettings.ItemDropdown({
        name: 'position',
        displayName: 'Position',
        items: this.positionOptions,
        value: this.positionOptions[0]
    });

    font = new formattingSettings.FontControl({
        name: "font",
        displayName: 'Font',
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Font Family",
            value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Font Size",
            value: this.defaultFontSize,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: this.minFontSize,
                }
            }
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: 'bold',
            displayName: "bold",
            value: true
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: 'italic',
            displayName: "italic",
            value: true
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: 'underline',
            displayName: "underline",
            value: true
        })
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Color",
        value: { value: "#000000" }
    });
    background = new formattingSettings.ColorPicker({
        name: "background",
        displayName: "Background Color",
        value: { value: "#FFFFFF" }
    });
    slices = [this.textProperty, this.font, this.fontColor, this.background, this.position];
}

/**
* BarChart formatting settings model class
*/
export class BarChartSettingsModel extends Model {
    enableAxis = new EnableAxisCardSettings();
    colorSelector = new ColorSelectorCardSettings();
    generalView = new GeneralViewCardSettings();
    averageLine = new AverageLineCardSettings();
    directEditSettings = new DirectEditSettings();
    cards = [this.enableAxis, this.colorSelector, this.generalView, this.averageLine, this.directEditSettings];

    /**
     * populate colorSelector object categories formatting properties
     * @param dataPoints 
     */
    populateColorSelector(dataPoints: BarChartDataPoint[]) {
        const slices: FormattingSettingsSlice[] = this.colorSelector.slices;        
        if (dataPoints) {
            dataPoints.forEach(dataPoint => {
                if (this.colorSelector.slices.some((dataPointColorSelector: FormattingSettingsSlice) => dataPointColorSelector.displayName === dataPoint.category)){
                    return;
                }
                slices.push(new formattingSettings.ColorPicker({
                    name: "fill",
                    displayName: dataPoint.category,
                    value: { value: dataPoint.color },
                    selector: dataPoint.selectionId.getSelector(),
                    visible: this.colorSelector.showAllDataPoints.value
                }));
            });
        }
    }
}

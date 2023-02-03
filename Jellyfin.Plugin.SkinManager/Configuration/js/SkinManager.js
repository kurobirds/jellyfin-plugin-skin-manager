var data;
var fonts;
var hasGoogleFont = false;
var plugin = {
    guid: "e9ca8b8e-ca6d-40e7-85dc-58e536df8eb3"
};
var uriSkin = "https://raw.githubusercontent.com/kurobirds/jellyfin-plugin-skin-manager/master/skins-3.0.json";
var uriGoogleFonts =
    "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyB_bPGsf0vxnpO9GmkBjeoEIQ7rE9rbNck";
var config = undefined;
var colorPickers = {};
var savedGoogleFont;

function start() {
    Dashboard.showLoadingMsg();
    $.getJSON(
        uriSkin,
        function (json) {
            $.getJSON(
                uriGoogleFonts,
                function (jsonFonts) {
                    fonts = jsonFonts;
                }
            );

            data = json;
            loadSkins();
            checkEasterEggs();
            Dashboard.hideLoadingMsg();
        }
    );
}

function loadSkins() {
    var cssOptions = document.getElementById("cssOptions");

    data.forEach((element) => {
        var opt = document.createElement("option");
        opt.appendChild(document.createTextNode(element.name));
        opt.value = element.defaultCss;
        cssOptions.appendChild(opt);
    });

    updateSelectors();
    loadConfig();
    preloadPreviews();
}

function loadOptions(skin) {
    var html = "";
    html += '<div data-role="controlgroup">';
    skin.categories.forEach((categories) => {
        if (categories.options.length !== 0) {
            html += getSection(categories.name);
        }

        categories.options.forEach((element) => {
            if (element.type === "checkBox") {
                html += getCheckBox(element);
            } else if (element.type === "colorPicker") {
                html += getColorPicker(element);
            } else if (element.type === "number") {
                html += getNumber(element);
            } else if (element.type === "selector") {
                html += getSelector(element);
            } else if (element.type === "slider") {
                html += getSlider(element);
            } else if (element.type === "googleFonts") {
                html += getFonts(element);
            } else if (element.type === "blurSlider") {
                html += getBlurSlider(element);
            }
        });
    });
    html += "</fieldset>";
    html +=
        '<button is="emby-button" type="button" class="raised block" id="refresh-library" onclick=setSkin()><span>Set Skin</span></button>';
    html += loadPreviews(skin);
    html += "</div>";
    $("#options").html(html).trigger("create");
    generatePlugins();
}

function preloadPreviews() {
    data.forEach((skin) => {
        if (skin.previews != undefined) {
            skin.previews.forEach((img) => {
                var image = new Image();
                image.src = img.url;
            });
        }
    });
}

function loadPreviews(skin) {
    if (skin.previews === undefined) {
        return "";
    }
    var html = "";

    html += '<h2 class="sectionTitle" >Previews</h2>';
    skin.previews.forEach((element) => {
        html += getImage(element.url);
        html += getImgnames(element.name);
    });
    return html;
}

function getCheckBox(option, saved) {
    var html = "";
    var checked = saved === "true" ? 'checked="checked"' : "";
    var id = "chkFolder";
    var name = option.name;
    var css = option.css;
    var description = option.description;

    //html += '<label><input is="emby-checkbox" class="chkLibrary" type="checkbox" data-mini="true" id="' + id + '" name="' + id + '" data-value="' + value + '" '+' /><span>' + name  + '</span></label>';
    html +=
        '<div class="checkboxContainer checkboxContainer-withDescription"><label><input class = "checkbox" type="checkbox" is="emby-checkbox" id="' +
        id +
        '"name="' +
        id +
        '" data-css="' +
        css +
        '" ' +
        checked +
        " /><span>" +
        name +
        "</span>" +
        getToolTip(option) +
        '</label><div class="fieldDescription checkboxFieldDescription">' +
        description +
        "</div></div>";
    return html;
}

function getColorPicker(option, saved) {
    var html = "";
    var id = "colorPicker" + Object.keys(colorPickers).length;
    var name = option.name;
    var defaultValue =
        option.default === undefined ? "#000000" : option.default;
    defaultValue = saved === undefined ? defaultValue : saved;
    colorPickers[id] = defaultValue;
    var css = option.css;
    var description = option.description;
    var mode = option.mode;
    html +=
        '<div class="inputContainer"><label></span>' +
        getToolTip(option) +
        '</label><input class = color type=text  value="' +
        defaultValue +
        '"data-css = "' +
        css +
        '" data-mode="' +
        mode +
        '" id="' +
        id +
        '" name="' +
        id +
        '" label="' +
        name +
        '"  /><span>' +
        name +
        '<div class="fieldDescription">' +
        description +
        "</div></div>";
    return html;
}

function getNumber(option, saved) {
    var html = "";
    var id = "number";
    var name = option.name;
    var css = option.css;
    var step = option.step === undefined ? 1 : option.step;
    var defaultValue = option.default;
    defaultValue = saved === undefined ? defaultValue : saved;
    var description = option.description;
    //html += '<label for=number><input is="emby-input" type=number value=' + defaultValue + ' class = "number" data-css = "'+ css+ '" +  data-mini="true" id="' + id + '" name="' + id + '" data-name="' + name + '" ' + ' /><span>' + name  + '</span></label><br>';
    html +=
        '<div class="inputContainer"><input is="emby-input" type="number" class = "number" value=' +
        defaultValue +
        " step=" +
        step +
        ' data-css = "' +
        css +
        '"  id="' +
        id +
        '" name="' +
        id +
        '"  min="0" max="300" label="' +
        name +
        '" /><div class="fieldDescription">' +
        description +
        "</div></div>";
    return html;
}

function getSelector(option, saved) {
    var html = "";
    var id = "selector";
    var name = option.name;
    var css = option.css;
    var defaultValue = option.default;
    var description = option.description;
    //html += '<label for=number><input is="emby-input" type=number value=' + defaultValue + ' class = "number" data-css = "'+ css+ '" +  data-mini="true" id="' + id + '" name="' + id + '" data-name="' + name + '" ' + ' /><span>' + name  + '</span></label><br>';
    html +=
        '<div class="selectContainer"><select is="emby-select"  data-css= "' +
        css +
        '"class="selector" label="' +
        name +
        '">' +
        getOptions(option, saved) +
        "</select></div>";
    return html;
}

function getFonts(option, saved) {
    var html = "";

    var name = "Change Font";
    var css =
        "html {font-family:  '$',sans-serif ;  } body,h1,h2,h3 { font-family: '$' ,sans-serif;}";
    var description = "Change the default fonts";
    //html += '<label for=number><input is="emby-input" type=number value=' + defaultValue + ' class = "number" data-css = "'+ css+ '" +  data-mini="true" id="' + id + '" name="' + id + '" data-name="' + name + '" ' + ' /><span>' + name  + '</span></label><br>';
    //html += '<div class="selectContainer" ><select is="emby-select" id = "googleFonts" data-css= "'+css + '"class="selector" label="'+name+' " onchange="updateFontPreview()">' + getFontOptions(fonts)+'</select></div>'
    //html += '<div class = "fontPreview"> This is a preview </div>';
    //html += '<div id="font-picker"></div><div class = "apply-font"> This is a preview </div>'
    //html += '	<div class="selectContainer"><label>Change Font </label><br> <input id="font-picker" type="text"> </div>';
    html += `<div class="selectContainer"><label>Change Font </label><br> <input class="fonts" data-css= "${option.css}">`;
    if (saved != undefined) {
        savedGoogleFont = saved;
    }
    hasGoogleFont = true;
    return html;
}

function getFontPreview(categories, option, selections, name) {
    var html = "";
    if (name === "Fonts") {
        html +=
            '<div class="fontCont><p style="font-family: ' +
            categories.option.selections.value +
            ';">Hello, This is your selected font-family.</p></div>"';
        return html;
    } else {
        return "";
    }
}

function getOptions(option, saved) {
    var html = "";
    var selections = option.selections;
    var css = option.css;
    selections.forEach((element) => {
        var name = element.name;
        var value = element.css;
        var selected = saved === name ? ' selected="selected"' : "";
        html +=
            '<option value= "' +
            value +
            '"' +
            selected +
            ">" +
            name +
            "</option>";
    });
    return html;
}

function getSlider(option, saved) {
    var html = "";
    var id = "slider";
    var name = option.name;
    var css = option.css;
    var step = option.step === undefined ? 1 : option.step;
    var defaultValue = option.default;
    defaultValue = saved === undefined ? defaultValue : saved;
    var description = option.description;
    html +=
        +'<div class="inputContainer">' +
        '<input type="range" class="slider" value="' +
        defaultValue +
        '" step="' +
        step +
        '" data-css="' +
        css +
        '" id="' +
        id +
        '" name="' +
        id +
        '"  min="0" max="300" label="' +
        name +
        '">' +
        '<div class="fieldDescription">' +
        description +
        +'</div>' +
        '</div>';
    return html;
}

var blurSliderCount = 0;

function getBlurSlider(option, saved) {

    var html = "";
    var id = "blurSlider" + blurSliderCount;
    blurSliderCount++;
    var name = option.name;
    var css = option.css;
    var step = option.step === undefined ? 1 : option.step;
    var defaultValue = option.default;
    defaultValue = saved === undefined ? defaultValue : saved;
    var description = option.description;
    html +=
        '<div class="inputContainer"><label><span>' +
        name +
        '</span></label><input type="range" class="slider" value="' +
        defaultValue +
        '" oninput ="updateBlur(' +
        "'" +
        id +
        "'" +
        ')"' +
        'step="' +
        step +
        '" data-css="' +
        css +
        '" id="' +
        id +
        '" name="' +
        id +
        '" min="0" max="40" label="' +
        name +
        '">' +
        '<div class="fieldDescription">' +
        description +
        '</div>' +
        '</div>' +
        '<div class="img"><img id="' +
        id +
        'image"' +
        'src="https://i.imgur.com/sMDQSdV.png"></div>';
    return html;
}

function updateBlur(id) {
    var slider = document.getElementById(id);
    var image = document.getElementById(id + 'image');
    image.style.filter = "blur(" + slider.value + "px)";
}

function updateBlurSliders() {
    var sliders = document.getElementsByClassName("slider");
    Array.from(sliders).forEach(slider => {
        if (slider.id.substring(0, 10) === "blurSlider") {
            updateBlur(slider.id);
        }
    });
}

function getImage(url) {
    var html = "";
    html +=
        '<fieldset class="verticalSection verticalSection-extrabottompadding"><img src="' +
        url +
        '">';
    return html;
}

function getImgnames(name) {
    var html = "";
    html += "<legend>" + name + "</legend></fieldset>";
    return html;
}

function getSection(name) {
    var html = "";
    html += "</fieldset>";
    html +=
        '<fieldset class="verticalSection verticalSection-extrabottompadding">';
    html += "<legend>" + name + "</legend>";
    return html;
}

function getToolTip(option) {
    if (option.preview === undefined) {
        return "";
    }
    html = "";
    html +=
        '<div class="tooltip"><span class="material-icons">info</span><span class="tooltiptext">';
    html += '<img src="' + option.preview + '">';
    html += "</span></div>";
    return html;
}

async function createCss() {

    var savedHtml = "";
    //process checkbox
    var css = $("#cssOptions").val();
    savedHtml += document.getElementById("cssOptions").innerHTML;
    var checkboxes = document.getElementsByClassName("checkbox");

    var selectedOptions = $(".checkbox:checked")
        .map(function () {
            return this.getAttribute("data-css");
        })
        .get();

    selectedOptions.forEach((element) => {
        css += element + "\n";
    });

    //proccess selector
    var selectors = document.getElementsByClassName("selector");
    for (var i = 0; i < selectors.length; i++) {
        var element = selectors[i];
        if (checkForImport(element.selectedOptions[0].value)) {
            css = element.selectedOptions[0].value + "\n" + css;
        } else {
            css +=
                element.selectedOptions[0].value +
                "\n";
            savedHtml += element.outerHTML;
        }
    }

    //process colorPicker
    selectedOptions.forEach((element) => {
        css += element + "\n";
    });
    var inputs = document.getElementsByClassName("color");
    for (var i = 0; i < inputs.length; i++) {
        var element = inputs[i];
        var values = $("#" + element.name).spectrum("get");
        var mode = element.getAttribute("data-mode");
        var color = "";
        switch (mode) {
            case "hex":
                color = "#" + values.toHex();
                break;
            case "only_numbers":
                color = values._r + "," + values._g + "," + values._b;
                break;
            default:
                color = "rgba(" + values._r + "," + values._g + "," + values._b + "," + values._a + ")";
                break;
        }
        css += element.getAttribute("data-css").replaceAll("$", color) + "\n";
    }

    //procces number selector
    var numberSelectors = document.getElementsByClassName("number");
    for (var element of numberSelectors) {
        savedHtml += element.outerHTML;
        css +=
            element.getAttribute("data-css").replaceAll("$", element.value) +
            "\n";
    }

    //procces slider
    var sliders = document.getElementsByClassName("slider");
    for (var element of sliders) {
        css +=
            element.getAttribute("data-css").replaceAll("$", element.value) +
            "\n";
    }


    //procces google Fonts
    if (document.getElementsByClassName("fonts").length > 0) {
        var fontPickers = Array.from(
            document.getElementsByClassName(
                "fonts"
            )
        );
        for (var i = 0; i < fontPickers.length; i++) {
            var element = fontPickers[i];
            if (element.value != "") {
                var url = "https://fonts.googleapis.com/css?family=" + element.value;
                var promise = await fetch(url,
                    {
                        mode: 'no-cors'
                    });
                var text = await promise.text();
                css += text;
                css += element.getAttribute("data-css").replaceAll("$", element.value.replaceAll("+", " "));
            }
        }
        console.log("fuera del loop");
    }

    return css;


}

function checkForImport(css) {
    return css.includes("@import");
}


function generatePlugins() {
    if (hasGoogleFont) {
        createFontPicker();
    }

    for (var colorPicker in colorPickers) {
        var id = "#" + colorPicker;
        $(id).spectrum({
            color: colorPickers[colorPicker],
            showInput: true,
            className: "full-spectrum",
            showInitial: true,
            showPalette: true,
            showAlpha: true,
            showSelectionPalette: true,
            maxSelectionSize: 10,
            preferredFormat: "hex",
            localStorageKey: "spectrum.demo",
            move: function (color) {

            },
            show: function () {

            },
            beforeShow: function () {

            },
            hide: function () {

            },
            change: function () {

            },
            palette: [
                [
                    "rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                    "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"
                ],
                [
                    "rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                    "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"
                ],
                [
                    "rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)",
                    "rgb(217, 234, 211)",
                    "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)",
                    "rgb(234, 209, 220)",
                    "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)",
                    "rgb(182, 215, 168)",
                    "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)",
                    "rgb(213, 166, 189)",
                    "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)",
                    "rgb(147, 196, 125)",
                    "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)",
                    "rgb(194, 123, 160)",
                    "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                    "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)",
                    "rgb(166, 77, 121)",
                    "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                    "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"
                ]
            ]
        });
    }
}


function createFontPicker() {
    $('input.fonts').fontpicker({
        variants: false
    });

    if (savedGoogleFont != undefined) {
        $('input.fonts').val(savedGoogleFont).trigger('change');
    }
}

function applyFont(font) {
    console.log("You selected font: " + font);

    // Replace + signs with spaces for css
    font = font.replace(/\+/g, " ");

    // Split font into family and weight
    font = font.split(":");

    var fontFamily = font[0];
    var fontWeight = font[1] || 400;

    // Set selected font on paragraphs
    $("fontPreview").css({
        fontFamily: "'" + fontFamily + "'",
        fontWeight: fontWeight,
    });
}

//$("#font-picker")
//.fontselect()
//.on("change", function () {
//  applyFont(this.value);
//});

function getFontOptions(fonts) {
    var html = "";
    var selections = fonts.items;
    selections.forEach((element) => {
        var name = element.family;
        var value = element.family;
        //var selected = saved==name?'selected="selected"' : "";
        var selected = "";
        html +=
            "<option value=" + value + selected + ">" + name + "</option>";
    });
    return html;
}

function updateFontPreview() {
    var preview = document.getElementsByClassName("fontPreview")[0];
    var selectedOption = document.getElementById("googleFonts")
        .selectedOptions[0].innerText;
    var url =
        "https://fonts.googleapis.com/css?family=" +
        selectedOption.replaceAll(" ", "+");

    fetch(url).then(function (response) {
        response.text().then(function (text) {
            var sheet = document.createElement("style");
            sheet.innerHTML =
                text + ".fontPreview{font-family:'" + selectedOption + "'}";
            preview.appendChild(sheet);
        });
    });
}

function updateSelectors() {
    var selected = document.getElementById("cssOptions");
    var description = document.getElementById("description");
    data.forEach((element) => {
        if (element.name === selected.selectedOptions[0].innerText) {
            loadOptions(element);
            description.innerHTML = element.description;
        }
    });
    updateBlurSliders();
}


function loadConfig() {
    ApiClient.getPluginConfiguration(plugin.guid).then(savedConfig => {

        config = savedConfig;

        if (!config) {
            config.selectedSkin = "";
            config.options = [];
        }

        loadSavedOptions();
    });
}

function loadSavedOptions() {
    var skin = undefined;
    data.forEach((element) => {
        if (element.defaultCss === config.selectedSkin) {
            skin = element;
        }
    });
    if (skin === undefined) {
        return;
    }
    var count = 0;
    for (var option of document.getElementById("cssOptions").options) {
        if (option.value === config.selectedSkin) {
            document.getElementById("cssOptions").selectedIndex = count;
        }
        count++;
    }

    var savedOptions = config.options;
    var html = "";
    html += '<div data-role="controlgroup">';
    skin.categories.forEach((categories) => {
        if (categories.options.length != 0) {
            html += getSection(categories.name);
        }
        var options = categories.options;

        options.forEach((element) => {
            var savedValue = undefined;
            var count = 0;
            savedOptions.forEach((savedOption) => {
                if (element.css === savedOption) {
                    savedValue = savedOptions[count + 1];
                }
                count++;
            });
            if (element.type === "checkBox") {
                html += getCheckBox(element, savedValue);
            } else if (element.type === "colorPicker") {
                html += getColorPicker(element, savedValue);
            } else if (element.type === "number") {
                html += getNumber(element, savedValue);
            } else if (element.type === "selector") {
                html += getSelector(element, savedValue);
            } else if (element.type === "slider") {
                html += getSlider(element, savedValue);
            } else if (element.type === "googleFonts") {
                html += getFonts(element, savedValue);
            } else if (element.type === "blurSlider") {
                html += getBlurSlider(element, savedValue);
            }
        });
    });
    html += "</fieldset>";
    html +=
        '<button is="emby-button" type="button" class="raised block" id="refresh-library" onclick=setSkin()><span>Set Skin</span></button>';
    html += loadPreviews(skin);
    html += "</div>";

    $("#options").html(html).trigger("create");
    generatePlugins();

}

function saveConfig() {
    config.selectedSkin = $("#cssOptions").val();

    var options = [];
    var count = 0;
    data[
        document.getElementById("cssOptions").selectedIndex
    ].categories.forEach((categories) => {
        categories.options.forEach((option) => {
            options[count] = option.css;
            options[count + 1] = getValue(option);
            count += 2;
        });
    });

    config.options = options;

    ApiClient.getPluginConfiguration(plugin.guid).then(function (oldConfig) {
        oldConfig = config;
        ApiClient.updatePluginConfiguration(plugin.guid, oldConfig).then(
            function (res) {
                Dashboard.processPluginConfigurationUpdateResult(res);
            }
        );
    });
}

function getValue(option) {
    var result = "";
    switch (option.type) {
        case "checkBox":
            Array.from(
                document.getElementsByClassName("checkbox emby-checkbox")
            ).forEach((element) => {
                if (option.css === element.getAttribute("data-css")) {
                    result = element.checked ? "true" : "false";
                }

            });
            break;
        case "number":
            Array.from(
                document.getElementsByClassName("number emby-input")
            ).forEach((element) => {
                if (option.css === element.getAttribute("data-css")) {
                    result = element.value;
                }

            });
            break;
        case "colorPicker":
            Array.from(document.getElementsByClassName("color")).forEach(
                (element) => {
                    if (option.css === element.getAttribute("data-css")) {
                        result = element.value;
                    }
                }
            );
            break;
        case "slider":
        case "blurSlider":
            Array.from(document.getElementsByClassName("slider")).forEach(
                (element) => {
                    if (option.css === element.getAttribute("data-css")) {
                        result = element.value;
                    }
                }
            );
            break;

        case "selector":
            Array.from(
                document.getElementsByClassName(
                    "selector emby-select-withcolor emby-select"
                )
            ).forEach((element) => {
                if (option.css === element.getAttribute("data-css")) {
                    result = element.selectedOptions[0].innerText;
                }


            });
            break;
        case "googleFonts":
            Array.from(
                document.getElementsByClassName(
                    "fonts"
                )
            ).forEach((element) => {
                if (option.css === element.getAttribute("data-css")) {
                    result = element.value;
                }
            });
            break;
    }
    return result;
}

function checkEasterEggs() {
    var d = new Date();

    if (
        (d.getDate() >= 18 && d.getMonth() === 11) ||
        (d.getDate() <= 10 && d.getMonth() === 0)
    ) {
        //startChristmas();
    }
}

function startChristmas() {
    $.getScript(
        "https://unpkg.com/magic-snowflakes/dist/snowflakes.min.js",
        function () {
            var sf = new Snowflakes({
                count: 200,
                maxSize: 25,
            });
        }
    );
}

async function setSkin() {
    saveConfig();
    ApiClient.getServerConfiguration().then(function (config) {
        ApiClient.updateServerConfiguration(config).then(function () {
            ApiClient.getNamedConfiguration("branding").then(async function (
                brandingConfig
            ) {
                createCss().then(r => {
                    console.log("despues de then");
                    brandingConfig.CustomCss = r;
                    ApiClient.updateNamedConfiguration(
                        "branding",
                        brandingConfig
                    ).then(function () {
                        Dashboard.processServerConfigurationUpdateResult();
                        window.location.reload(true);
                    });

                });
            });
        });
    });
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex,
        function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}


// =======================================================================================




$("#configPage").on("pageshow",
    function () {
        Dashboard.showLoadingMsg();
        ApiClient.getPluginConfiguration(plugin.guid).then(function (config) {
            $("#cssOptions").val(config.selectedCss).change();
            Dashboard.hideLoadingMsg();
        });
    });

$("#configForm").on("submit",
    function () {
        Dashboard.showLoadingMsg();
        ApiClient.getPluginConfiguration(plugin.guid).then(function (config) {
            config.selectedCss = $("#cssOptions").val();
            ApiClient.updatePluginConfiguration(plugin.guid, config).then(
                function (result) {
                    Dashboard.processPluginConfigurationUpdateResult(result);
                }
            );
        });
        return false;
    });

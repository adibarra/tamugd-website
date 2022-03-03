var rawdatagrid;
var yearRange;
var gpaPlot;
var courseGpaPlot;
var courseLetterPlot;
var courseDiffPlot;
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

document.addEventListener('DOMContentLoaded', () => {
    updateThemeMode();
    $(".raw-data-layout-container").hide();
    $("#department-select").empty();
    getDBDepartments().forEach(function(value, index, array) {
        $("#department-select").append($("<option></option>").attr("value", value.toUpperCase()).text(value));
    });

    $("#department-select").chosen({width: "100%"});
    $("#professor-select").chosen({width: "100%", max_selected_options: 0, disable_search_threshold: 10, hide_results_on_select:false});
    $("#semester-select").chosen({width: "100%", max_selected_options: 3, disable_search: true});
    $("#honors-select").chosen({width: "150px", disable_search: true});
    $("#autopopulate-select").chosen({width: "150px", disable_search: true});

    $('#department-select').trigger('chosen:activate');
    $('#professor-select').on('chosen:maxselected', function(evt, params) { $('#professor-select').trigger('chosen:close'); updateSelections(false); });
    $('#professor-select').chosen().change(function(evt, params) { updateSelections(false); });
    $('#semester-select').chosen().change(function(evt, params) { updateSelections(); });
    $('#honors-select').chosen().change(function(evt, params) { updateSelections(); });

    $("#courseGpaChartCanvas").tipso({
        position: 'bottom',
        width: $("#courseGpaChartCanvas").width(),
        titleBackground: 'rgba(102,102,102,0.66)',
        background: 'rgba(102,102,102,0.66)',
        titleContent: 'How to interpret:',
        content: 'The yellow area indicates the range between the highest'
        +' and lowest GPAs acheived during the selected years and semesters.'
        +' The small green bar indicates the average GPA which was acheived.',
    });
    $("#courseLetterChartCanvas").tipso({
        position: 'bottom',
        width: $("#courseLetterChartCanvas").width(),
        titleBackground: 'rgba(102,102,102,0.66)',
        background: 'rgba(102,102,102,0.66)',
        titleContent: 'How to interpret:',
        content: 'There is a section with a corresponding color for each of the'
        +' following grade letters: [A, B, C, D, F, Q]. This plot shows the percentage'
        +' at which each grade letter was recieved relative to each other.',
    });
    $("#courseOveralldiffChartCanvas").tipso({
        position: 'bottom',
        width: $("#courseOveralldiffChartCanvas").width(),
        titleBackground: 'rgba(102,102,102,0.66)',
        background: 'rgba(102,102,102,0.66)',
        tooltipHover: true,
        titleContent: 'How to interpret:',
        content: 'This plot takes a few of the statistics for the course and plugs them into the following'
        +' <span class="color-white">'
        +'<a href="https://github.com/TAMU-GradeDistribution/TAMU-GradeDistribution-Website/blob/main/public/scripts/main.js#L875">'
        +' formula</a></span> to determine a relative difficulty score for each course.',
    });

    var years = getDBYears();
    yearRange = $('#year-range').jRange({
        from: years[0],
        to: years[years.length-1],
        step: 1,
        scale: years,
        format: '%s',
        width: $(".inner-year-container").width(),
        showLabels: false,
        snap: true,
        isRange: true,
        onstatechange: () => {updateSelections(false);},
    });

    
    var ctx = document.getElementById('gpaChartCanvas').getContext('2d');
    gpaPlot = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getGPAPlotChartLabels($('#year-range').val().split(','),$("#semester-select").chosen().val()),
            datasets: [
                {
                    label: 'Professor 1',
                    data: [1.2,1.8,undefined,3.1,3.2,3.0,3.3,3.6,2.5,2.9,undefined,undefined,3.0,2.6,3.2,3.6],
                    fill: false,
                    borderColor: '#666666',
                    backgroundColor: '#66666680',
                    tension: 0.1,
                    borderWidth: 2,
                    segment: {
                        borderDash: ctx => skipped(ctx, [6, 6]),
                    },
                },
                {
                    label: 'Professor 2',
                    data: [3.2,2.8,3.2,2.6,2.3,undefined,undefined,3.2,3.5,3.6,3.4,2.6,2.9,3.1,3.4,2.75],
                    fill: false,
                    borderColor: '#9944FF',
                    backgroundColor: '#9944FF80',
                    tension: 0.1,
                    borderWidth: 2,
                    segment: {
                        borderDash: ctx => skipped(ctx, [6, 6]),
                    },
                },
                {
                    label: 'Professor 3',
                    data: [2.2,3.8,2.6,3.2,2.6,3.6,2.7,2.1,2.2,1.6,1.45,2.1,2.2,1.45,1.6,2.1],
                    fill: false,
                    borderColor: '#CC77CC',
                    backgroundColor: '#CC77CC80',
                    tension: 0.1,
                    borderWidth: 2,
                    segment: {
                        borderDash: ctx => skipped(ctx, [6, 6]),
                    },
                },
                {
                    label: 'Professor 4',
                    data: [1.5,1.6,1.4,1.8,1.3,1.4,1.9,1.7,1.5,1.5,1.7,1.8,2.0,2.1,1.95,1.7],
                    fill: false,
                    borderColor: '#77CC77',
                    backgroundColor: '#77CC7780',
                    tension: 0.1,
                    borderWidth: 2,
                    segment: {
                        borderDash: ctx => skipped(ctx, [6, 6]),
                    },
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            spanGaps: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    align: 'left',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                    },
                },
            },
            interaction: {
                intersect: false,
            },
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxRotation: 90,
                    minRotation: 0
                }
            }],
        }
    });
    var ctx = document.getElementById('courseGpaChartCanvas').getContext('2d');
    courseGpaPlot = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: '',
                    data: [1.3],
                    backgroundColor: 'rgba(102,102,102,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'GPA Low: 1.300',
                    data: [1.53],
                    backgroundColor: 'rgba(247,194,14,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'GPA Avg: 2.830',
                    data: [0.04],
                    backgroundColor: 'rgba(128,149,7,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'GPA High: 3.910',
                    data: [1.08],
                    backgroundColor: 'rgba(247,194,14,0.66)',
                    borderWidth: 1,
                },
                {
                    label: '',
                    data: [0.05],
                    backgroundColor: 'rgba(102,102,102,0.66)',
                    borderWidth: 1,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: {
                        suggestedMin: 0.0,
                        suggestedMax: 4.0,
                        min: 0.0,
                        max: 4.0,
                    },
                    stacked: true,
                },
                y: {
                    stacked: true,
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Course GPA Range'
                },
                legend: {
                    display:false
                },
                tooltip: {
                    enabled: false,
                    callbacks: {
                        label: function(ctx) {
                            return ctx.dataset.label;
                        },
                    },
                },
            },
            interaction: {
                intersect: false,
                mode: 'y',
            },
        },
    });
    var ctx = document.getElementById('courseLetterChartCanvas').getContext('2d');
    courseLetterPlot = new Chart(ctx, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'A',
                    data: [32],
                    backgroundColor: 'rgba(128,149,7,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'B',
                    data: [39],
                    backgroundColor: 'rgba(175,166,5,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'C',
                    data: [14],
                    backgroundColor: 'rgba(247,194,14,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'D',
                    data: [7],
                    backgroundColor: 'rgba(250,45,8,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'F',
                    data: [5],
                    backgroundColor: 'rgba(211,15,2,0.66)',
                    borderWidth: 1,
                },
                {
                    label: 'Q',
                    data: [3],
                    backgroundColor: 'rgba(102,102,102,0.66)',
                    borderWidth: 1,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        min: 0,
                        max: 100,
                        callback: function(value) {
                            return value + "%"
                        }
                    },
                },
                y: {
                    stacked: true,
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Course Letter Grades'
                },
                legend: {
                    display:false
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ctx.dataset.label+': '+''+Number(ctx.dataset.data).toFixed(1)+'%';
                        },
                    },
                },
                datalabels: {
                    color: '#000000B0',
                    formatter: function(value, ctx) {
                        if (Number(ctx.dataset.data) > 1.5) return ctx.dataset.label;
                        return '';
                    },
                },
            },
            interaction: {
                intersect: false,
            },
        },
    });
    var ctx = document.getElementById('courseOveralldiffChartCanvas').getContext('2d');
    courseDiffPlot = new Chart(ctx, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'Difficulty',
                    data: [6],
                    backgroundColor: 'rgba(247,194,14,0.66)',
                    borderWidth: 1,
                },
                {
                    label: '',
                    data: [4],
                    backgroundColor: 'rgba(102,102,102,0.66)',
                    borderWidth: 1,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        min: 1,
                        max: 10,
                    },
                },
                y: {
                    stacked: true,
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Relative Course Difficulty'
                },
                legend: {
                    display:false
                },
                tooltip: {
                    enabled: false,
                },
                datalabels: {
                    color: '#000000B0',
                    formatter: function(value, ctx) {
                        if (ctx.dataset.label == 'Difficulty')
                            return value+'/10';
                        return '';
                    },
                },
            },
            interaction: {
                intersect: false,
            },
        },
    });
    openOnClick('home_link1', '/home');
    openOnClick('home_link2', '/home');
    document.getElementById('thememode_toggle').addEventListener('click', () => {
        toggleThemeMode();
        regenGPAPlotChartColors();
    });
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HS51DZ5HEM');
});

// colors generated with https://medialab.github.io/iwanthue/
function getColors() {
    let colors;
    if(document.body.classList.contains('light-theme')) {
        colors = [ // colorblind friendly colors
            "#a0b242", "#5858bc", "#d1972c", "#7283e9", "#65bc69",
        "#af439d", "#45c097", "#563482", "#728537", "#c083d8",
        "#bb7937", "#628dd4", "#ba4c41", "#c5639f", "#b44267"
        ];
    } else {
        colors = [ // pastel colors
            "#97ebdd", "#ddb5dc", "#cfeaaf", "#74aff3", "#e9c59a",
            "#5ecee9", "#eab4b5", "#98cea5", "#bcb8ec", "#bdc08c",
            "#92bde8", "#dae9d3", "#7ecac7", "#b3cee3", "#b1beaf"
        ];
    }
    // randomize order
    return colors.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

// list of supported departments
const dbDepartments = [
    "AGCJ", "AGSC", "ALEC", "ALED", "AGEC", "ANSC", "DASC", "BICH", "GENE", "AGSM", "BAEN", "AGLS", "ESSM",
    "FRSC", "RENR", "EEBL", "ENTO", "FIVS", "HORT", "FSTC", "NUTR", "BESC", "PLPA", "POSC", "RPTS", "MEPS",
    "SCSC", "WFSC", "NFSC", "ARCH", "ENDS", "CARC", "COSC", "LAND", "LDEV", "PLAN", "URPN", "URSC", "ARTS",
    "VIST", "VIZA", "BUSH", "INTA", "PSAA", "ACCT", "BUAD", "BUSN", "IBUS", "FINC", "ISYS", "SCMT", "MGMT",
    "MKTG", "ISTM", "BIMS", "DDHS", "OMFP", "ORDI", "ENDO", "AEGD", "OMSF", "ORTH", "PEDD", "PERI", "PROS",
    "HPED", "OBIO", "OMFS", "OMFR", "CEHD", "EDAD", "EHRD", "TCMG", "BEFB", "BIED", "CPSY", "EDTC", "EPFB",
    "EPSY", "INST", "SEFB", "SPED", "SPSY", "ATTR", "DCED", "HEFB", "HLTH", "KINE", "KNFB", "SPMT", "EDCI",
    "MASC", "MEFB", "RDNG", "TEED", "TEFB", "AERO", "MEMA", "BMEN", "CHEN", "SENG", "CVEN", "ENDG", "ENGR",
    "ICPE", "CSCE", "ECEN", "ENTC", "ESET", "IDIS", "MMET", "ISEN", "MSEN", "MEEN", "NUEN", "OCEN", "PETE",
    "BIOT", "EVEN", "MXET", "TCMT", "AREN", "ITDE", "CYBR", "CLEN", "ATMO", "GEOS", "WMHS", "GEOG", "GEOL",
    "GEOP", "OCNG", "LAW ", "ANTH", "AFST", "FILM", "JOUR", "LBAR", "RELS", "WGST", "COMM", "ECMT", "ECON",
    "ENGL", "LING", "HISP", "SPAN", "HIST", "ARAB", "ASIA", "CHIN", "CLAS", "EURO", "FREN", "GERM", "INTS",
    "ITAL", "JAPN", "MODL", "RUSS", "MUSC", "PERF", "THAR", "PHIL", "POLS", "PSYC", "SOCI", "HHUM", "LMAS",
    "MUST", "MCMD", "MPIM", "MSCI", "HCPI", "EDHP", "MPHY", "NEXT", "AERS", "SOMS", "MLSC", "NVSC", "FORS",
    "NURS", "PHEO", "PHEB", "PHPM", "HPCH", "PHLT", "SOPH", "BIOL", "CHEM", "NRSC", "SCEN", "MATH", "ASTR",
    "PHYS", "STAT", "VMID", "VIBS", "VLCS", "VTPP", "VPAR", "VPAT", "VTMI", "VTPB", "VSCS"
].sort();

// list of supported years
const dbYears = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];

// list of professors that teach selected class, populated at runtime
let dbProfessors = [];

// list containing rawdata retrieved from server, populated at runtime
let dbRawDataCache = [];

// list containing rawdata retrieved from server, populated at runtime
let dbRawData = [];

// list used as cache to not spam server with identical requests
let cache = [];

// send request to server and then cache response for later use
function queryDB(department, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Request timed out');
            return;
        }, 5000);
        
        let found = -1;
        let query = 'search?d='+department+'&c='+course;

        for (i = 0; i < cache.length; i++) {
            if (cache[i].query == query) {
                found = i;
                break;
            }
        }

        if (found != -1) {
            if (cache[found].text != '[]') {
                setDBRawDataCache(JSON.parse(cache[found].text));
                resolve('Done');
            }
            else {
                reject(department+' '+course+' not found!');
            }
        }
        else {
            fetch(query)
            .then((response) => {
                response.text()
                .then((text) => {
                    try {
                        cache.push({
                            'query': query,
                            'text': text
                        });
                        if (text != '[]') {
                            setDBRawDataCache(JSON.parse(text));
                            resolve('Done');
                        }
                        else {
                            reject(department+' '+course+' not found!');
                        }
                    } catch {
                        reject('Error: '+text);
                    }
                })
            })
            .catch((err) => {
                reject('Error: '+err);
            });
        }
    });
}

// expands [2017,2021] into [2017,2018,2019,2020,2021]
function interpolateNumArray(data,stepsize) {
    newData = [Number(data[0])];
    while (newData[newData.length-1] < Number(data[data.length-1])) {
        newData.push(newData[newData.length-1] + stepsize);
    }
    return newData;
};

// filter json to return unique keys which fit specified filters
function filterUnique(data, keyName, filterWhitelist, filterKeyName, filterWhitelist2, filterKeyName2) {
    var unique = [];
    for (i = 0; i < data.length; i++) {
        if (filterWhitelist == null || filterWhitelist.indexOf(data[i][filterKeyName]) != -1) {
            if (filterWhitelist2 == null || filterWhitelist2.indexOf(data[i][filterKeyName2]) != -1) {
                if (unique.indexOf(data[i][keyName]) === -1) {
                    unique.push(data[i][keyName]);
                }
            }
        }
    }
    return unique;
}

// filter json to return all keys which fit specified filters
function filterJSON(data, filterWhitelist, filterKeyName, filterWhitelist2, filterKeyName2, filterWhitelist3, filterKeyName3) {
    var matches = [];
    for (i = 0; i < data.length; i++) {
        if (filterWhitelist == null || filterWhitelist.indexOf(data[i][filterKeyName]) != -1) {
            if (filterWhitelist2 == null || filterWhitelist2.indexOf(data[i][filterKeyName2]) != -1) {
                if (filterWhitelist3 == null || filterWhitelist3.indexOf(data[i][filterKeyName3]) != -1) {
                    matches.push(data[i]);
                }
            }
        }
    }
    return matches;
}

// filter json to return all keys which pass specified filter func
function filterFuncJSON(data, filterKeyName, filterFunc, filterFuncArg) {
    var matches = [];
    for (i = 0; i < data.length; i++) {
        if (filterFunc(filterFuncArg,data[i][filterKeyName])) {
            matches.push(data[i]);
        }
    }
    return matches;
}

// replace gpa numbers in json to strings with proper padding (3->3.000)
function padNumJSON(data, keyName, padding) {
    for (i = 0; i < data.length; i++) {
        data[i][keyName] = ''+Number(data[i][keyName]).toFixed(padding)+'';
    }
    return data;
}

// replace number in json to user legible boolean value
function numBoolJSON(data, keyName) {
    for (i = 0; i < data.length; i++) {
        if (Number(data[i][keyName]) == 0) {
            data[i][keyName] = 'No'
        } else if (Number(data[i][keyName]) == 1) {
            data[i][keyName] = 'Yes'
        }
    }
    return data;
}

// get array of allowed sections based on value of honors
function honorsFilter(honors, honorsValue) {
    if (honors == "INHONORS") return true;
    if (honors == "EXHONORS") return honorsValue === 'No';
    if (honors == "ONHONORS") return honorsValue === 'Yes';
    return false;
}

// get functions
function getDBRawDataCache() {
    return dbRawDataCache;
}

function getDBRawData() {
    return dbRawData;
}

function getDBDepartments() {
    return dbDepartments;
}

function getDBYears() {
    return dbYears;
}

function getDBProfessors() {
    return dbProfessors;
}

function setDBRawDataCache(newdbRawDataCache) {
    dbRawDataCache = newdbRawDataCache;

    getGPARangeChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#honors-select").chosen().val(),
    (newDataset) => {
        courseGpaPlot.data.datasets = newDataset;
        courseGpaPlot.update('none');
    });
    getLetterChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#honors-select").chosen().val(),
    (newDataset) => {
        courseLetterPlot.data.datasets = newDataset;
        courseLetterPlot.update('none');
    });
    getCourseDifficultyChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#honors-select").chosen().val(),
    (newDataset) => {
        courseDiffPlot.data.datasets = newDataset;
        courseDiffPlot.update('none');
    });
}

// refilter display data from cache
function updateData(years, semesters, professors, honors) {
    dbRawData = [];
    years = interpolateNumArray(years,1);
    semesters = semesters.map(semester => semester.toUpperCase())
    dbProfessors = filterUnique(dbRawDataCache,'professorName',semesters,'semester');
    dbRawData = padNumJSON(dbRawDataCache,'avgGPA',3)
    dbRawData = numBoolJSON(dbRawDataCache,'honors')
    dbRawData = filterJSON(dbRawData, years,'year',semesters,'semester',professors,'professorName');
    dbRawData = filterFuncJSON(dbRawData, 'honors', honorsFilter, honors)
}

// generate labels for gpa plot chart
function getGPAPlotChartLabels(years, semesters) {
    labels = []
    years = interpolateNumArray(years, 1);
    for (let i = 0; i < years.length; i++) {
        for (let j = 0; j < semesters.length; j++) {
            labels.push(semesters[j]+' '+years[i].toString().slice(2)+'\'')
        }
    }
    return labels;
}

// automatically select profs for gpaPlot
function autoPopulateProfs() {
    $("#professor-select").empty();
    var professors = getDBProfessors();
    professors.forEach((element) => {
        let count = 0;
        let years = [];
        let semesters = [];
        let rawData = getDBRawDataCache();
        for (let i = 0; i < rawData.length; i++) {
            if ((rawData[i]['professorName'].toUpperCase() == element.toUpperCase()) && (years.indexOf(rawData[i]['year']) == -1 || semesters.indexOf(rawData[i]['semester']) == -1)) {
                count += 1;
                years.push(rawData[i]['year']);
                semesters.push(rawData[i]['semester']);
            }
        }
        if (count > 1) {
            $("#professor-select").append($("<option selected></option>").attr("value", element.toUpperCase()).text(element));
        } else {
            $("#professor-select").append($("<option></option>").attr("value", element.toUpperCase()).text(element));
        }
    });
    $('#professor-select').trigger('chosen:updated');
    updateSelections();
}

// regenerate colors for gpa plot chart if not using placeholder data
function regenGPAPlotChartColors() {
    if (dbRawDataCache.length !== 0) {
        getGPAPlotChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#professor-select").chosen().val(),
        (newDataset) => {
            gpaPlot.data.datasets = newDataset;
            gpaPlot.update('none');
        });
    }
}

// FIXME: remake this unoptimized mess
// generate datasets to use in gpa plot chart
function getGPAPlotChartDataset(years, semesters, professors, callback) {
    years = interpolateNumArray(years,1);
    let rawData = dbRawData
    let avgGPA = new Array(professors.length);
    let count = new Array(professors.length);

    for (let i = 0; i < avgGPA.length; i++) {
        avgGPA[i] = new Array(years.length*semesters.length).fill(0);
        count[i] = new Array(years.length*semesters.length).fill(0);
    }

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < years.length*semesters.length; k++) {
            let tmp1 = Math.floor(k/semesters.length)%years.length;
            let tmp2 = Math.floor(k%semesters.length);
            if (rawData[j]['year'] == Number(years[tmp1]) && rawData[j]['semester'] == semesters[tmp2].toUpperCase()) {
                index1 = professors.indexOf(rawData[j]['professorName']);
                if (index1 != -1) {
                    avgGPA[index1][k] = Number(avgGPA[index1][k]) + Number(rawData[j]['avgGPA']);
                    count[index1][k] = Number(count[index1][k]) + 1;
                }
            }
        }
    }

    for (let i = 0; i < avgGPA.length; i++) {
        for (let j = 0; j < years.length*semesters.length; j++) {
            avgGPA[i][j] = (count[i][j] == 0) ? undefined : Number(avgGPA[i][j]) / Number(count[i][j]);
        }
    }
    let colors = getColors();
    let dataset = [];
    for (let i = 0; i < avgGPA.length; i++) {
        //let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16).padStart(6,'0');
        dataset.push({
            label: professors[i],
            data: avgGPA[i],
            fill: false,
            borderColor: colors[i],
            backgroundColor: colors[i]+'80',
            tension: 0.1,
            borderWidth: 2,
            segment: {
                borderDash: ctx => skipped(ctx, [6, 6]),
            },
        });
    }
    return callback(dataset);
}

// generate datasets to use in avg letter grade chart
function getLetterChartDataset(years, semesters, honors, callback) {
    years = interpolateNumArray(years,1);
    let rawData = dbRawDataCache;
    let labels = ['A','B','C','D','F','Q']
    let bgColors = ['rgba(128,149,7,0.66)','rgba(175,166,5,0.66)','rgba(247,194,14,0.66)','rgba(250,45,8,0.66)','rgba(211,15,2,0.66)','rgba(102,102,102,0.66)']
    let avgLetterGrade = new Array(labels.length).fill(0);

    for (let i = 0; i < rawData.length; i++) {
        if (years.includes(rawData[i]['year']) && semesters.includes(rawData[i]['semester']) && honorsFilter(honors,rawData[i]['honors'])) {
            avgLetterGrade[0] += Number(rawData[i]['numA']);
            avgLetterGrade[1] += Number(rawData[i]['numB']);
            avgLetterGrade[2] += Number(rawData[i]['numC']);
            avgLetterGrade[3] += Number(rawData[i]['numD']);
            avgLetterGrade[4] += Number(rawData[i]['numF']);
            avgLetterGrade[5] += Number(rawData[i]['numQ']);
        }
    }
    let count = avgLetterGrade[0]+avgLetterGrade[1]+avgLetterGrade[2]+avgLetterGrade[3]+avgLetterGrade[4]+avgLetterGrade[5];
    for (let i = 0; i < avgLetterGrade.length; i++) {
        // can't use 100 because sometimes charts.js expands the chart to 120%. need to find a fix
        avgLetterGrade[i] = (avgLetterGrade[i]/count)*99.999999;
    }

    dataset = [];
    for (let i = 0; i < avgLetterGrade.length; i++) {
        dataset.push({
            label: labels[i],
            data: [avgLetterGrade[i]],
            backgroundColor: bgColors[i],
            borderWidth: 1,
        });
    }
    return callback(dataset);
}

// generate datasets to use in gpa range chart
function getGPARangeChartDataset(years, semesters, honors, callback) {
    years = interpolateNumArray(years,1);
    let rawData = dbRawDataCache;
    let labels = ['','GPA Low: ','GPA Avg: ','GPA High: ','']
    let bgColors = ['rgba(102,102,102,0.66)','rgba(247,194,14,0.66)','rgba(128,149,7,0.66)','rgba(247,194,14,0.66)','rgba(102,102,102,0.66)']
    let gpaRange = new Array(labels.length).fill(0);
    let gpaMin = 4;
    let gpaMax = 0;
    let gpaAvg = 0;

    let count = 0;
    for (let i = 0; i < rawData.length; i++) {
        if (years.includes(rawData[i]['year']) && semesters.includes(rawData[i]['semester']) && honorsFilter(honors,rawData[i]['honors'])) {
            gpaAvg += Number(rawData[i]['avgGPA']);
            count += 1;

            if (gpaMin > Number(rawData[i]['avgGPA'])) {
                gpaMin = Number(rawData[i]['avgGPA']);
            }

            if (gpaMax < Number(rawData[i]['avgGPA'])) {
                gpaMax = Number(rawData[i]['avgGPA']);
            }
        }
    }
    gpaAvg = (gpaAvg/count);

    gpaRange[2] = 0.04; //constant, thickness of avg gpa indicator
    gpaRange[0] = gpaMin;
    gpaRange[1] = gpaAvg-gpaMin-(gpaRange[2]/2);
    gpaRange[3] = gpaMax-gpaRange[0]-gpaRange[1]-gpaRange[2]-(gpaRange[2]/2);
    gpaRange[4] = 4.0-(gpaRange[0]+gpaRange[1]+gpaRange[2]+gpaRange[3]);

    labels[1] += ''+Number(gpaMin).toFixed(3)+'';
    labels[2] += ''+Number(gpaAvg).toFixed(3)+'';
    labels[3] += ''+Number(gpaMax).toFixed(3)+'';

    dataset = [];
    for (let i = 0; i < gpaRange.length; i++) {
        dataset.push({
            label: labels[i],
            data: [gpaRange[i]],
            backgroundColor: bgColors[i],
            borderWidth: 1,
        });
    }
    return callback(dataset);
}

// generate datasets to use in difficulty range chart
function getCourseDifficultyChartDataset(years, semesters, honors, callback) {
    years = interpolateNumArray(years,1);
    let rawData = dbRawDataCache;
    let bgColors = ['rgba(128,149,7,0.66)','rgba(175,166,5,0.66)','rgba(247,194,14,0.66)','rgba(250,45,8,0.66)','rgba(211,15,2,0.66)']
    let minGPA = 4;
    let avgGPA = 0;
    let count = 0;
    let numStudentsPass = 0;
    let numStudentsFail = 0;
    let courseDiff = 0;
    let profs = []

    for (let i = 0; i < rawData.length; i++) {
        if (years.includes(rawData[i]['year']) && semesters.includes(rawData[i]['semester']) && honorsFilter(honors,rawData[i]['honors'])) {
            avgGPA += Number(rawData[i]['avgGPA']);
            count += 1;

            numStudentsPass += Number(rawData[i]['numA']);
            numStudentsPass += Number(rawData[i]['numB']);
            numStudentsPass += Number(rawData[i]['numC']);
            numStudentsFail += Number(rawData[i]['numD']);
            numStudentsFail += Number(rawData[i]['numF']);
            numStudentsFail += Number(rawData[i]['numI']);
            numStudentsFail += Number(rawData[i]['numS']);
            numStudentsFail += Number(rawData[i]['numU']);
            numStudentsFail += Number(rawData[i]['numQ']);
            numStudentsFail += Number(rawData[i]['numX']);

            if (!profs.includes(rawData[i]['professorName'])) {
                profs.push(rawData[i]['professorName']);
            }

            if (minGPA > Number(rawData[i]['avgGPA'])) {
                minGPA = Number(rawData[i]['avgGPA']);
            }
        }
    }
    avgGPA = (avgGPA/count);

    // TODO: improve courseDiff formula later
    // formula: courseDiff = # of conditions passed / 10;
    courseDiff += 1;
    if (0.075 < numStudentsFail/(numStudentsPass+numStudentsFail)) courseDiff += 1; // > 07.5% of students fail/Q
    if (0.100 < numStudentsFail/(numStudentsPass+numStudentsFail)) courseDiff += 1; // > 10.0% of students fail/Q
    if (avgGPA < 3.50) courseDiff += 1; // avgGPA < 3.5
    if (avgGPA < 3.25) courseDiff += 1; // avgGPA < 3.25
    if (avgGPA < 3.00) courseDiff += 1; // avgGPA < 3.0
    if (avgGPA < 2.75) courseDiff += 1; // avgGPA < 2.75
    if (avgGPA < 2.25) courseDiff += 1; // avgGPA < 2.25
    if (minGPA < 2.50) courseDiff += 1; // minGPA < 2.5
    if (minGPA < 2.00) courseDiff += 1; // minGPA < 2.0

    dataset = [];
    dataset.push({
        label: 'Difficulty',
        data: [courseDiff],
        backgroundColor: bgColors[Math.floor((courseDiff-1)/2)],
        borderWidth: 1,
    });
    dataset.push({
        label: '',
        data: [10-courseDiff],
        backgroundColor: 'rgba(102,102,102,0.66)',
        borderWidth: 1,
    });
    return callback(dataset);
}

// update all data used by interface
function updateSelections(updateProfsList) {
    var department = $("#department-select").val();
    var course = $("#course-field").val();
    if (department == '' || course == '') {
        return;
    }
    updateData($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#professor-select").chosen().val(),$("#honors-select").chosen().val());

    if (updateProfsList) {
        $("#professor-select").empty();
        var professors = getDBProfessors();
        professors.forEach((element) => {
            $("#professor-select").append($("<option></option>").attr("value", element.toUpperCase()).text(element));
        });
        $("#professor-select").attr("data-placeholder", "Click here to select some professors");
        $('#professor-select').trigger('chosen:updated');
    }

    if (rawdatagrid == undefined){}
    else {
        rawdatagrid.updateConfig({
            data: getDBRawData(),
        }).forceRender();
    }
    
    gpaPlot.data.labels = getGPAPlotChartLabels($('#year-range').val().split(','),$("#semester-select").chosen().val());
    getGPAPlotChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#professor-select").chosen().val(),
    (newDataset) => {
        gpaPlot.data.datasets = newDataset;
        gpaPlot.update('none');
    });
    getGPARangeChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#honors-select").chosen().val(),
    (newDataset) => {
        courseGpaPlot.data.datasets = newDataset;
        courseGpaPlot.update('none');
    });
    getLetterChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#honors-select").chosen().val(),
    (newDataset) => {
        courseLetterPlot.data.datasets = newDataset;
        courseLetterPlot.update('none');
    });
    getCourseDifficultyChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#honors-select").chosen().val(),
    (newDataset) => {
        courseDiffPlot.data.datasets = newDataset;
        courseDiffPlot.update('none');
    });
    updateThemeMode();
}

// search button js to initiate db query
function getCourseData() {
    var department = $("#department-select").val();
    var course = $("#course-field").val();
    if (department == '' || course == '') {
        return;
    }

    var imgsave = $("#search-button-img").html();
    $("#search-button-img").html('<i class="fa fa-refresh fa-spin fa-lg" style="color:white;" title="Loading..."></i>');
    queryDB(department, course)
    .then((value) => {
        $("#professor-select").empty();
        updateData($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#professor-select").chosen().val(),$("#honors-select").chosen().val());
        var professors = getDBProfessors();
        professors.forEach((element) => {
            $("#professor-select").append($("<option></option>").attr("value", element.toUpperCase()).text(element));
        });
        $("#professor-select").attr("data-placeholder", "Click here to select some professors");
        $('#professor-select').trigger('chosen:updated');
        updateSelections(true);
    })
    .catch((err) => alert(err))
    .finally(() => {
        $("#search-button-img").html(imgsave);
        if (rawdatagrid == undefined){}
        else {
            rawdatagrid.updateConfig({
                data: getDBRawData(),
            }).forceRender();
        }
        autoPopulateProfs();
    });
    updateThemeMode();
}

// rawdatabutton js to toggle showing the raw data table
function toggleRawData() {
    toggleRawDataHTML = $("#toggle-raw-data-button").html().trim();
    if (toggleRawDataHTML.includes('<i class="fa fa-caret-square-o-up')) {
        $("#toggle-raw-data-button").html('&nbsp;<i class="fa fa-caret-square-o-down" title="Hide Raw Data"></i>&nbsp;&nbsp;Hide Raw Data&nbsp;');
        $(".raw-data-layout-container").show(10,(function() {
            //jumpToAnchor("raw-data-layout-container");
            updateThemeMode();
        }));
        // only load table if needed
        if (rawdatagrid == undefined) {
            rawdatagrid = new gridjs.Grid({
                width: '100%',
                autoWidth: true,
                sort: true,
                columns: [
                    {id:'year',name:'Year'}, {id:'semester',name:'Semester'}, {id:'professorName',name: 'Professor Name'}, {id:'section',name:'Section'}, {id:'honors',name:'Honors'}, {id:'avgGPA',name:'Avg GPA'},
                    {id:'numA',name:'A',sort:false}, {id:'numB',name:'B',sort:false}, {id:'numC',name:'C',sort:false}, {id:'numD',name:'D',sort:false}, {id:'numF',name:'F',sort:false},
                    {id:'numI',name:'I',sort:false}, {id:'numQ',name:'Q',sort:false}, {id:'numS',name:'S',sort:false}, {id:'numU',name:'U',sort:false}, {id:'numX',name:'X',sort:false},
                ],
                data: getDBRawData(),
            }).render(document.getElementById("raw-data-table-container"));
            $(window).resize(function(){
                rawdatagrid.updateConfig().forceRender();
            });
        } else {
            rawdatagrid.updateConfig().forceRender();
        }
    }
    else {
        $("#toggle-raw-data-button").html('&nbsp;<i class="fa fa-caret-square-o-up" title="Display Raw Data"></i>&nbsp;&nbsp;Display Raw Data&nbsp;');
        $(".raw-data-layout-container").hide(10,(function() {}));
    }
}

function openOnClick(elementID, link) {
    document.getElementById(elementID).addEventListener('click', () => { window.location=link;});
}

// toggle-theme js to toggle between light and dark theme
function toggleThemeMode() {
    document.cookie = 'lightmode='+!document.cookie.includes('lightmode=true')+'; SameSite=Strict;';
    updateThemeMode();
}

function updateThemeMode() {
    var light_theme = document.cookie.includes('lightmode=true')
    if (light_theme && !document.body.classList.contains('light-theme')) {
        document.getElementById('thememode_toggle').innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-on" aria-hidden="true"></i>';
    }
    else if(document.body.classList.contains('light-theme')) {
        document.getElementById('thememode_toggle').innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-off" aria-hidden="true"></i>';
    }
    document.body.classList.toggle('light-theme', light_theme);
}
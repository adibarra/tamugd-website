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
let dbRawDataCache = [[]];

// list containing rawdata retrieved from server, populated at runtime
let dbRawData = [[]];

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
function honorsFilter(honors, course) {
    if (honors == "INHONORS") return !course.match(/[a-z]/i);
    if (honors == "EXHONORS") return !course.match(/[a-z]/i) && !(course.match(/2[0-9]{2,}/) || course.match(/58[0-9]{1,}/));
    if (honors == "ONHONORS") return !course.match(/[a-z]/i) &&  (course.match(/2[0-9]{2,}/) || course.match(/58[0-9]{1,}/));
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
    dbRawData = filterFuncJSON(dbRawData, 'section', honorsFilter, honors)
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

// regenerate colors for gpa plot chart
function regenGPAPlotChartColors() {
    getGPAPlotChartDataset($('#year-range').val().split(','),$("#semester-select").chosen().val(),$("#professor-select").chosen().val(),
    (newDataset) => {
        gpaPlot.data.datasets = newDataset;
        gpaPlot.update('none');
    });
}

// generate datasets to use in gpa plot chart
// FIXME: remake this unoptimized mess
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

    dataset = [];
    for (let i = 0; i < avgGPA.length; i++) {
        let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16).padStart(6,'0');
        dataset.push({
            label: professors[i],
            data: avgGPA[i],
            fill: false,
            borderColor: color,
            backgroundColor: color+'80',
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
        if (years.includes(rawData[i]['year']) && semesters.includes(rawData[i]['semester']) && honorsFilter(honors,rawData[i]['section'])) {
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
        if (years.includes(rawData[i]['year']) && semesters.includes(rawData[i]['semester']) && honorsFilter(honors,rawData[i]['section'])) {
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
        if (years.includes(rawData[i]['year']) && semesters.includes(rawData[i]['semester']) && honorsFilter(honors,rawData[i]['section'])) {
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

    //TODO: improve courseDiff formula later
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

// autoscroll to selected anchorID
function jumpToAnchor(anchorID) {
    var url = location.href;
    location.href = "#"+anchorID;
    history.replaceState(null,null,url);
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
    });
    $('#professor-select').trigger('chosen:open');
    updateThemeMode();
}

// rawdatabutton js to toggle showing the raw data table
function toggleRawData() {
    toggleRawDataHTML = $("#toggle-raw-data-button").html().trim();
    if (toggleRawDataHTML.includes('<i class="fa fa-caret-square-o-up')) {
        $("#toggle-raw-data-button").html('&nbsp;<i class="fa fa-caret-square-o-down" title="Hide Raw Data"></i>&nbsp;&nbsp;Display Raw Data&nbsp;');
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

// toggle-darkmode js to toggle darkmode
function toggleDarkMode() {
    toggleDarkmodeHTML = $("#darkmode-toggle").html().trim();
    if (toggleDarkmodeHTML.includes('<i class="fa fa-sun-o')) {
        $("#darkmode-toggle").html('<i class="fa fa-moon-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-on" aria-hidden="true"></i>');
        document.cookie = "darkmode=true; path=/; SameSite=Strict;";
        darkmodeEnabled = true
        
    }
    else {
        $("#darkmode-toggle").html('<i class="fa fa-sun-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-off" aria-hidden="true"></i>');
        document.cookie = "darkmode=false; path=/; SameSite=Strict;";
        darkmodeEnabled = false
    }
    updateThemeMode();
}

// set page to darkmode if darkmode is enabled
function updateThemeMode() {
    if (darkmodeEnabled) {
        $('*').addClass("dark-theme");
    }
    else {
        $('*').removeClass("dark-theme");
    }
}
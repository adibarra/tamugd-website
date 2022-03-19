let allDepartments = [];
let allYears = [];
let responseCache = [];
let courseDataAll = [];
let courseData = [];
let courseProfs = [];
let courseDataGrid;
let courseGPAChart;
let courseGPAChartPlaceholderDataset;
let courseRangeChart;
let courseLetterChart;
let courseDiffChart;
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

document.addEventListener('DOMContentLoaded', () => {
    $("#raw_data_layout_container").hide();

    $("#department_select").chosen({ width: "100%" });
    $("#professor_select").chosen({ width: "100%", max_selected_options: 0, disable_search_threshold: 10, hide_results_on_select: false });
    $("#semester_select").chosen({ width: "100%", max_selected_options: 3, disable_search: true });
    $("#honors_select").chosen({ width: "150px", disable_search: true });

    $('#professor_select').chosen().change(function(evt, params) { updateSelection(); });
    $('#semester_select').chosen().change(function(evt, params) { updateSelection(); });
    $('#honors_select').chosen().change(function(evt, params) { updateSelection(); });

    $("#course_range_chart_canvas").tipso({
        position: 'bottom', width: $("#course_range_chart_canvas").width(),
        titleBackground: 'rgba(102,102,102,.66)', background: 'rgba(102,102,102,.66)', titleContent: 'How to interpret:',
        content: 'The yellow area indicates the range between the highest'
        +' and lowest GPAs acheived during the selected years and semesters.'
        +' The small green bar indicates the average GPA which was acheived.',
    });
    $("#course_letter_chart_canvas").tipso({
        position: 'bottom', width: $("#course_letter_chart_canvas").width(),
        titleBackground: 'rgba(102,102,102,.66)', background: 'rgba(102,102,102,.66)', titleContent: 'How to interpret:',
        content: 'There is a section with a corresponding color for each of the'
        +' following grade letters: [A, B, C, D, F, Q]. This chart shows the percentage'
        +' at which each grade letter was recieved relative to each other.',
    });
    $("#course_difficulty_chart_canvas").tipso({
        position: 'bottom', width: $("#course_difficulty_chart_canvas").width(), tooltipHover: true,
        titleBackground: 'rgba(102,102,102,.66)', background: 'rgba(102,102,102,.66)', titleContent: 'How to interpret:',
        content: 'This chart takes a few of the statistics for the course and plugs them into the following'
        +' <span class="color-white">'
        +'<a href="https://github.com/TAMU-GradeDistribution/TAMU-GradeDistribution-Website/blob/main/public/scripts/main.js#L875">'
        +' formula</a></span> to determine a relative difficulty score for each course.',
    });

    $('#year_range').jRange({
        from: 0, to: 9999999,
        step: 1, scale: 1, format: '%s',
        width: $(".inner-year-container").width(),
        showLabels: false, snap: true, isRange: true,
        onstatechange: () => { updateSelection(); }
    });
    getSupportedData();

    courseGPAChartPlaceholderDataset = [
        { label: 'Professor 1', data: [1.2,1.8,undefined,3.1,3.2,3.0,3.3,3.6,2.5,2.9,undefined,undefined,3.0,2.6,3.2,3.6], fill: false, borderColor: '#666666', backgroundColor: '#66666680', tension: 0.1, borderWidth: 2, segment: { borderDash: ctx => skipped(ctx, [6, 6]) } },
        { label: 'Professor 2', data: [3.2,2.8,3.2,2.6,2.3,undefined,undefined,3.2,3.5,3.6,3.4,2.6,2.9,3.1,3.4,2.75], fill: false, borderColor: '#9944FF', backgroundColor: '#9944FF80', tension: 0.1, borderWidth: 2, segment: { borderDash: ctx => skipped(ctx, [6, 6]) } },
        { label: 'Professor 3', data: [2.2,3.8,2.6,3.2,2.6,3.6,2.7,2.1,2.2,1.6,1.45,2.1,2.2,1.45,1.6,2.1], fill: false, borderColor: '#CC77CC', backgroundColor: '#CC77CC80', tension: 0.1, borderWidth: 2, segment: { borderDash: ctx => skipped(ctx, [6, 6]) } },
        { label: 'Professor 4', data: [1.5,1.6,1.4,1.8,1.3,1.4,1.9,1.7,1.5,1.5,1.7,1.8,2.0,2.1,1.95,1.7], fill: false, borderColor: '#77CC77', backgroundColor: '#77CC7780', tension: 0.1, borderWidth: 2, segment: { borderDash: ctx => skipped(ctx, [6, 6]) } }
    ];
    courseGPAChart = new Chart(ctx = document.getElementById('gpa_chart_canvas').getContext('2d'), {
        type: 'line',
        data: {
            labels: getGPAChartLabels([2014,2021], ['SPRING','FALL']),
            datasets: courseGPAChartPlaceholderDataset
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            spanGaps: true,
            plugins: {
                legend: { display: true, position: 'right', align: 'left', labels: { usePointStyle: true, boxWidth: 10 } },
                tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label+': '+Number(ctx.parsed.y).toFixed(3); } } },
                
            },
            interaction: { intersect: false },
            xAxes: [{ ticks: { autoSkip: true, maxRotation: 90, minRotation: 0 } }]
        }
    });

    courseRangeChart = new Chart(ctx = document.getElementById('course_range_chart_canvas').getContext('2d'), {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                { label: '', data: [1.3], backgroundColor: 'rgba(102,102,102,.66)', borderWidth: 1 },
                { label: 'GPA Low: 1.300', data: [1.53], backgroundColor: 'rgba(247,194,14,.66)', borderWidth: 1 },
                { label: 'GPA Avg: 2.830', data: [0.04], backgroundColor: 'rgba(128,149,7,.66)', borderWidth: 1 },
                { label: 'GPA High: 3.910', data: [1.08], backgroundColor: 'rgba(247,194,14,.66)', borderWidth: 1 },
                { label: '', data: [0.05], backgroundColor: 'rgba(102,102,102,.66)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: { x: { ticks: { suggestedMin: 0.0, suggestedMax: 4.0, min: 0.0, max: 4.0 }, stacked: true }, y: { stacked: true } },
            plugins: {
                title: { display: true, text: 'Course GPA Range' },
                legend: { display: false },
                tooltip: { enabled: false, callbacks: { label: function(ctx) { return ctx.dataset.label; } } }
            },
            interaction: { intersect: false, mode: 'y' }
        }
    });

    courseLetterChart = new Chart(ctx = document.getElementById('course_letter_chart_canvas').getContext('2d'), {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                { label: 'A', data: [32], backgroundColor: 'rgba(128,149,7,.66)', borderWidth: 1 },
                { label: 'B', data: [39], backgroundColor: 'rgba(175,166,5,.66)', borderWidth: 1 },
                { label: 'C', data: [14], backgroundColor: 'rgba(247,194,14,.66)', borderWidth: 1 },
                { label: 'D', data: [07], backgroundColor: 'rgba(250,45,8,.66)', borderWidth: 1 },
                { label: 'F', data: [05], backgroundColor: 'rgba(211,15,2,.66)', borderWidth: 1 },
                { label: 'Q', data: [03], backgroundColor: 'rgba(102,102,102,.66)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: { x: { stacked: true, ticks: { min: 0, max: 100, callback: function(value) { return value + "%" } } }, y: { stacked: true } },
            plugins: {
                title: { display: true, text: 'Course Letter Grades' },
                legend: { display: false },
                tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label+': '+Number(ctx.dataset.data).toFixed(1)+'%'; } } },
                datalabels: { color: '#000000B0', formatter: function(value, ctx) { if (Number(ctx.dataset.data) > 1.5) return ctx.dataset.label; return ''; } }
            },
            interaction: { intersect: false }
        }
    });

    courseDiffChart = new Chart(ctx = document.getElementById('course_difficulty_chart_canvas').getContext('2d'), {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                { label: 'Difficulty', data: [6], backgroundColor: 'rgba(247,194,14,.66)', borderWidth: 1 },
                { label: '', data: [4], backgroundColor: 'rgba(102,102,102,.66)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: { x: { stacked: true, ticks: { min: 1, max: 10 } }, y: { stacked: true } },
            plugins: {
                title: { display: true, text: 'Relative Course Difficulty' },
                legend: { display: false },
                tooltip: { enabled: false },
                datalabels: { color: '#000000B0', formatter: function(value, ctx) { if (ctx.dataset.label === 'Difficulty') return value+'/10'; return ''; } }
            },
            interaction: { intersect: false },
        },
    });

    document.getElementById('thememode_toggle')       .addEventListener('click', () => { regenGPAChartColors(); });
    document.getElementById('course_field')           .addEventListener('keyup', (e) => { if (e.key === "Enter") getCourseData(); });
    document.getElementById('search_button')          .addEventListener('click', () => { getCourseData(); });
    document.getElementById('new_chart_colors_button').addEventListener('click', () => { regenGPAChartColors(); });
    document.getElementById('toggle_raw_data_button') .addEventListener('click', () => { toggleRawData(); });
    document.getElementById('back_to_top')            .addEventListener('click', () => { document.body.scrollTo({ top: 0, behavior: 'smooth' }); });
    $(document.body).scroll(function() {
        if (isElementVisible($('.footer-bar'))) {
            $('#back-to-top').css('bottom', $(window).height() - $('.footer-bar').position().top);
        } else {
            $('#back-to-top').css('bottom','0');
        }
    });
});


// get supported years/departments
function getSupportedData() {
    requestSupported().then((value) => {
        $("#department_select").empty();
        allDepartments.forEach(function(value) { $("#department_select").append($("<option></option>").attr("value", value.toUpperCase()).text(value)); });
        $('#department_select').trigger('chosen:updated');
        $('#year_range').jRange('updateRange', allYears[0]+','+allYears[allYears.length-1]);
        $('#year_range').jRange('updateRender', allYears);
    })
    .catch((err) => { alert(err); });
}

// get data for selected course
function getCourseData() {
    const department = $("#department_select").val();
    const course = $("#course_field").val();
    if (department === '' || course === '') { return; }

    const searchButton = $("#search_button").html();
    $("#search_button").html('<i class="fa fa-refresh fa-spin" title="Loading..."></i>');
    requestSearch(department, course)
    .catch((err) => { alert(err); })
    .finally(() => {
        $("#search_button").html(searchButton);
        autoPopulateProfs();
    });
}

// send [/supported] request to server and cache response
function requestSupported() {
    return new Promise((resolve, reject) => {
        setTimeout(() => { reject('Server error ([/supported] timed out).'); return; }, 5000);
        
        for (let i = 0; i < responseCache.length; i++) {
            if (responseCache[i].query === 'supported') {
                allYears = responseCache[i].years;
                allDepartments = responseCache[i].departments;
                resolve('Found in cache');
                return;
            }
        }

        fetch('supported').then((response) => {
            response.text().then((responseText) => {
                if (responseText === '[]') {
                    reject('Server error ([/supported] bad response).');
                    return;
                }
                allYears = [];
                allDepartments = [];
                JSON.parse(responseText.split('|')[0]).forEach((year) => { allYears.push(year.year); });
                JSON.parse(responseText.split('|')[1]).forEach((dept) => { allDepartments.push(dept.departmentName); });
                allYears.sort();
                allDepartments.sort();
                responseCache.push({ 'query': 'supported', 'years': allYears, 'departments': allDepartments });
                resolve('Done');
            });
        }).catch((err) => { reject(err); });
    });
}

// send [/search] request to server and cache response
function requestSearch(department, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { reject('Server error ([/search] timed out). Try again in a bit.'); return; }, 5000);
        department = department.toUpperCase();
        course = course.toUpperCase();
        const query = 'search?d='+department+'&c='+course;

        for (let i = 0; i < responseCache.length; i++) {
            if (responseCache[i].query === query) {
                if (responseCache[i].data === null) { reject(department+' '+course+' not found!'); }
                courseData = responseCache[i].data;
                courseDataAll = responseCache[i].data;
                filterCourseData();
                resolve('Found in cache');
                return;
            }
        }

        fetch(query).then((response) => {
            response.text().then((responseText) => {
                if (responseText === '[]') {
                    responseCache.push({ 'query': query, 'data': null });
                    reject(department+' '+course+' not found!');
                    return;
                }
                courseData = JSON.parse(responseText);
                courseDataAll = JSON.parse(responseText);
                filterCourseData();
                responseCache.push({ 'query': query, 'data': courseDataAll });
                resolve('Done');
            });
        }).catch((err) => { reject(err); });
    });
}

// refilter and update data based on new selections
function filterCourseData() {
    const selectedYears = interpolateNumArray($('#year_range').val().split(','), 1);
    const selectedSemesters = ($("#semester_select").chosen().val()+'').split(',').map((value) => { return value.toUpperCase(); });
    const selectedHonors = $("#honors_select").chosen().val().toUpperCase();

    // deep copy courseDataAll into courseData
    courseData = JSON.parse(JSON.stringify(courseDataAll));
    // filter courseData by selected year range and semesters
    courseData = courseData.filter(course => selectedYears.includes(course.year) && selectedSemesters.includes(course.semester));
    // filter courseProfs to only include unique professorNames
    courseProfs = courseData.filter((value, index, self) => { return self.indexOf(value) === index; });
    // filter courseData by selected honors
    courseData = courseData.filter(course => honorsFilter(selectedHonors, course.honors));
}

// update all data used by ui
function updateSelection() {
    if ($("#department_select").val() === '' || $("#course_field").val() === '') { return; }

    filterCourseData();
    
    if (courseDataGrid === undefined) { }
    else { courseDataGrid.updateConfig({ data: getCourseDataGridDataset() }).forceRender(); }
    
    courseGPAChart.data.labels = getGPAChartLabels();
    getGPAChartDataset((newDataset) => {
        courseGPAChart.data.datasets = newDataset;
        courseGPAChart.update('none');
    });
    getGPARangeChartDataset((newDataset) => {
        courseRangeChart.data.datasets = newDataset;
        courseRangeChart.update('none');
    });
    getLetterChartDataset((newDataset) => {
        courseLetterChart.data.datasets = newDataset;
        courseLetterChart.update('none');
    });
    getCourseDifficultyChartDataset((newDataset) => {
        courseDiffChart.data.datasets = newDataset;
        courseDiffChart.update('none');
    });
    updateThemeMode();
}

// generate labels for courseGPAChart
function getGPAChartLabels(years, semesters) {
    if (!years) years = $('#year_range').val().split(',');
    if (!semesters) semesters = $("#semester_select").chosen().val();
    const labels = []
    years = interpolateNumArray(years, 1);
    for (let i = 0; i < years.length; i++) {
        for (let j = 0; j < semesters.length; j++) {
            labels.push(semesters[j]+' '+years[i].toString().slice(2)+'\'')
        }
    }
    return labels;
}

// automatically select profs for courseGPAChart
function autoPopulateProfs() {
    // filter courseProfs to only include professors that have taught at least 2 different semesters
    let profs = courseProfs.filter((value, index, self) => {
        let count = 0;
        for (let i = 0; i < self.length; i++) {
            if (self[i].professorName === value.professorName && (self[i].year !== value.year || self[i].semester !== value.semester)) {
                count++;
            }
        }
        return count >= 2;
    });
    $("#professor_select").empty();

    // all filtered profs are added to the dropdown (selected by default)
    profs = profs.map(course => course.professorName);
    profs = profs.filter((value, index, self) => { return self.indexOf(value) === index; });
    profs.forEach((prof) => { $("#professor_select").append('<option value="'+prof+'" selected>'+prof+'</option>'); });

    // all remaining profs are added to the dropdown
    let otherProfs = courseProfs.map(course => course.professorName);
    otherProfs = otherProfs.filter((value, index, self) => { return self.indexOf(value) === index && !profs.includes(value); });
    otherProfs.forEach((prof) => { $("#professor_select").append('<option value="'+prof+'">'+prof+'</option>'); });

    // update dropdown and chart data
    $('#professor_select').trigger('chosen:updated');
    updateSelection();
}

// generate datasets to use in courseGPAChart
function getGPAChartDataset(callback) {
    const years = interpolateNumArray(($('#year_range').val()+'').split(','),1);
    const semesters = $("#semester_select").chosen().val();
    const professors = $("#professor_select").chosen().val();

    const profWeightedGPA = new Array(professors.length);
    const profNumStudents = new Array(professors.length);

    for (let i = 0; i < profWeightedGPA.length; i++) {
        profWeightedGPA[i] = new Array(years.length*semesters.length).fill(0);
        profNumStudents[i] = new Array(years.length*semesters.length).fill(0);
    }

    for (let j = 0; j < courseData.length; j++) {
        for (let k = 0; k < years.length*semesters.length; k++) {
            const tmp1 = Math.floor(k/semesters.length)%years.length;
            const tmp2 = Math.floor(k%semesters.length);
            if (courseData[j].year === Number(years[tmp1]) && courseData[j].semester === semesters[tmp2].toUpperCase()) {
                const prof = professors.indexOf(courseData[j].professorName);
                if (prof != -1) {
                    const sectionNumStudents = Number(courseData[j].numA)+Number(courseData[j].numB)+Number(courseData[j].numC)+Number(courseData[j].numD)+Number(courseData[j].numF);
                    profWeightedGPA[prof][k] += (Number(courseData[j].avgGPA) * Number(sectionNumStudents));
                    profNumStudents[prof][k] += Number(sectionNumStudents);
                }
            }
        }
    }

    for (let i = 0; i < profWeightedGPA.length; i++) {
        for (let j = 0; j < years.length*semesters.length; j++) {
            profWeightedGPA[i][j] = Number(profWeightedGPA[i][j]) / Number(profNumStudents[i][j]);
        }
    }

    const colors = getColors();
    const dataset = [];
    for (let i = 0; i < profWeightedGPA.length; i++) {
        dataset.push({
            label: professors[i], data: profWeightedGPA[i], fill: false, borderColor: colors[i],
            backgroundColor: colors[i]+'80', tension: 0.1, borderWidth: 2,
            segment: { borderDash: ctx => skipped(ctx, [6, 6]) }
        });
    }
    return callback(dataset);
}

// generate datasets to use in courseRangeChart
function getGPARangeChartDataset(callback) {
    const labels = ['','GPA Low: ','GPA Avg: ','GPA High: ','']
    const bgColors = ['rgba(102,102,102,.66)','rgba(247,194,14,.66)','rgba(128,149,7,.66)','rgba(247,194,14,.66)','rgba(102,102,102,.66)']
    const gpaRange = new Array(labels.length).fill(0);
    let gpaMin = 4;
    let gpaMax = 0;
    let gpaAvg = 0;

    let count = 0;
    for (let i = 0; i < courseData.length; i++) {
        const num = Number(courseData[i].avgGPA);
        gpaAvg += num;
        count += 1;

        gpaMin = Math.min(gpaMin, num);
        gpaMax = Math.max(gpaMax, num);
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

// generate datasets to use in courseLetterChart
function getLetterChartDataset(callback) {
    const labels = ['A','B','C','D','F','Q']
    const bgColors = ['rgba(128,149,7,.66)','rgba(175,166,5,.66)','rgba(247,194,14,.66)','rgba(250,45,8,.66)','rgba(211,15,2,.66)','rgba(102,102,102,.66)']
    const avgLetterGrade = new Array(labels.length).fill(0);

    for (let i = 0; i < courseData.length; i++) {
        avgLetterGrade[0] += Number(courseData[i].numA);
        avgLetterGrade[1] += Number(courseData[i].numB);
        avgLetterGrade[2] += Number(courseData[i].numC);
        avgLetterGrade[3] += Number(courseData[i].numD);
        avgLetterGrade[4] += Number(courseData[i].numF);
        avgLetterGrade[5] += Number(courseData[i].numQ);
    }
    const count = avgLetterGrade[0]+avgLetterGrade[1]+avgLetterGrade[2]+avgLetterGrade[3]+avgLetterGrade[4]+avgLetterGrade[5];
    for (let i = 0; i < avgLetterGrade.length; i++) {
        // can't use 100 because sometimes charts.js expands the chart to 120%
        avgLetterGrade[i] = (avgLetterGrade[i]/count)*99.999999;
    }

    const dataset = [];
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

// generate datasets to use in courseDiffChart
function getCourseDifficultyChartDataset(callback) {
    const years = interpolateNumArray(($('#year_range').val()+'').split(','),1);
    const semesters = $("#semester_select").chosen().val();
    const honors = $("#honors_select").chosen().val();

    const bgColors = ['rgba(128,149,7,.66)','rgba(175,166,5,.66)','rgba(247,194,14,.66)','rgba(250,45,8,.66)','rgba(211,15,2,.66)']
    const profs = [];
    let minGPA = 4;
    let avgGPA = 0;
    let count = 0;
    let numStudentsPass = 0;
    let numStudentsFail = 0;
    let courseDiff = 0;

    for (let i = 0; i < courseDataAll.length; i++) {
        if (years.includes(courseDataAll[i].year) && semesters.includes(courseDataAll[i].semester) && honorsFilter(honors,courseDataAll[i].honors)) {
            avgGPA += Number(courseDataAll[i].avgGPA);
            count += 1;

            numStudentsPass += Number(courseDataAll[i].numA);
            numStudentsPass += Number(courseDataAll[i].numB);
            numStudentsPass += Number(courseDataAll[i].numC);
            numStudentsFail += Number(courseDataAll[i].numD);
            numStudentsFail += Number(courseDataAll[i].numF);
            numStudentsFail += Number(courseDataAll[i].numI);
            numStudentsFail += Number(courseDataAll[i].numS);
            numStudentsFail += Number(courseDataAll[i].numU);
            numStudentsFail += Number(courseDataAll[i].numQ);
            numStudentsFail += Number(courseDataAll[i].numX);

            if (!profs.includes(courseDataAll[i].professorName)) {
                profs.push(courseDataAll[i].professorName);
            }

            if (minGPA > Number(courseDataAll[i].avgGPA)) {
                minGPA = Number(courseDataAll[i].avgGPA);
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

    const dataset = [];
    dataset.push({
        label: 'Difficulty',
        data: [courseDiff],
        backgroundColor: bgColors[Math.floor((courseDiff-1)/2)],
        borderWidth: 1,
    });
    dataset.push({
        label: '',
        data: [10-courseDiff],
        backgroundColor: 'rgba(102,102,102,.66)',
        borderWidth: 1,
    });
    return callback(dataset);
}

// generate dataset to use in courseDataGrid
function getCourseDataGridDataset() {
    const selectedProfessors = ($("#professor_select").chosen().val()+'').split(',').map((value) => { return value.toUpperCase(); });
    // deep copy courseData into courseDataGridDataset
    let courseDataGridDataset = JSON.parse(JSON.stringify(courseData));
    // for each element in courseDataGridDataset translate element.honors to a string
    courseDataGridDataset = courseDataGridDataset.map((course) => { course.honors = course.honors ? 'Yes' : 'No'; return course; });
    // pad all gpa numbers to 3 decimal places
    courseDataGridDataset = courseDataGridDataset.map(course => { course.avgGPA = ''+Number(course.avgGPA).toFixed(3); return course; });
    // filter courses to only include selected professors
    courseDataGridDataset = courseDataGridDataset.filter(course => selectedProfessors.includes(course.professorName));
    return courseDataGridDataset;
}

// toggle showing the raw data table
function toggleRawData() {
    if ($("#toggle_raw_data_button").html().trim().includes('<i class="fa fa-caret-square-o-up')) {
        $("#toggle_raw_data_button").html('&nbsp;<i class="fa fa-caret-square-o-down" title="Hide Raw Data"></i>&nbsp;&nbsp;Hide Raw Data&nbsp;');
        $("#raw_data_layout_container").show(10,(function() { updateThemeMode(); }));
        if (courseDataGrid === undefined) {
            courseDataGrid = new gridjs.Grid({
                width: '100%',
                autoWidth: true,
                sort: true,
                columns: [
                    {id:'year',name:'Year'}, {id:'semester',name:'Semester'}, {id:'professorName',name: 'Professor Name'}, {id:'section',name:'Section'}, {id:'honors',name:'Honors'}, {id:'avgGPA',name:'Avg GPA'},
                    {id:'numA',name:'A',sort:false}, {id:'numB',name:'B',sort:false}, {id:'numC',name:'C',sort:false}, {id:'numD',name:'D',sort:false}, {id:'numF',name:'F',sort:false},
                    {id:'numI',name:'I',sort:false}, {id:'numQ',name:'Q',sort:false}, {id:'numS',name:'S',sort:false}, {id:'numU',name:'U',sort:false}, {id:'numX',name:'X',sort:false},
                ],
                data: getCourseDataGridDataset()
            }).render(document.getElementById("raw_data_table_container"));
            $(window).resize(function() { courseDataGrid.updateConfig({ data: getCourseDataGridDataset() }).forceRender(); });
        } else { courseDataGrid.updateConfig({ data: getCourseDataGridDataset() }).forceRender(); }
    }
    else {
        $("#toggle_raw_data_button").html('&nbsp;<i class="fa fa-caret-square-o-up" title="Display Raw Data"></i>&nbsp;&nbsp;Display Raw Data&nbsp;');
        $("#raw_data_layout_container").hide(10,(function() {}));
    }
}

// regenerate colors for courseGPAChart if not using placeholder data
function regenGPAChartColors() {
    if (courseGPAChart.data.datasets !== courseGPAChartPlaceholderDataset) {
        getGPAChartDataset((newDataset) => {
            courseGPAChart.data.datasets = newDataset;
            courseGPAChart.update('none');
        });
    }
}

// check if honors courses are selected
function honorsFilter(selectedHonors, isHonors) {
    switch(selectedHonors) {
        case ("INHONORS"): return true;
        case ("EXHONORS"): return !Boolean(isHonors);
        case ("ONHONORS"): return Boolean(isHonors);
        default: return false;
    }
}

// expands [2017,2021] into [2017,2018,2019,2020,2021]
function interpolateNumArray(numArray, stepsize) {
    const newArray = [Number(numArray[0])];
    while (newArray[newArray.length-1] < Number(numArray[numArray.length-1])) { newArray.push(newArray[newArray.length-1] + stepsize); }
    return newArray;
};

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
    // randomize colors, then add 'extra' colors by duplicating the array and adding it to the end
    colors = colors.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
    return colors.concat(colors);
}
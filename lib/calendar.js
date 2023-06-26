let rootContainer = ""

const today = moment()
const thisYear = today.format('YYYY')
const thisMonth = today.format('MM')

const calendarDataSelector = {}
const calendarDaysData = {}

let prevYearLimit = 3
let nextYearLimit = 3

const templateCalendarContainer = `
<div id="calendar-main-container">
    <div id="calendar-main-controls">
        <select name="year" id="selector-year" onchange="moveDate()"></select>
        <select name="month" id="selector-month" onchange="moveDate()"></select>
        <button onclick="moveToday()">Today</button>

        <button onclick="movePreviousMonth()">Previous Month</button>
        <button onclick="moveNextMonth()">Next Month</button>
    </div>

    <div id="calendar-main-days">Loading..</div>
</div>`

// Template - Yearly selector
const templateSelectorOptionsYear = `
{{#each years}}
{{#if isSelected}}
<option value="{{value}}" selected>{{name}}</option>
{{else}}
<option value="{{value}}">{{name}}</option>
{{/if}}
{{/each}}`

// Template - Monthly selector
const templateSelectorOptionsMonth = `
{{#each months}}
{{#if isSelected}}
<option value="{{value}}" selected>{{name}}</option>
{{else}}
<option value="{{value}}">{{name}}</option>
{{/if}}
{{/each}}`

// Template - Days in a month container
const templateContainerDaysInMonth = `
<div class="month">
    <ul class="weekdays">
        {{#each weekNames}}
        <li>{{this}}</li>
        {{/each}}
    </ul>

    <ul class="days">
        {{#each days}}
        <li class="{{#if isCurrentMonth}}current-month{{/if}} {{#if isToday}}today{{/if}}">{{day}}</li>
        {{/each}}
    </ul>
</div>`

function renderSelectorYears() {
    const template = templateSelectorOptionsYear
    const compiled = Handlebars.compile(template)
    const rendered = compiled(calendarDataSelector)
    document.getElementById('selector-year').innerHTML = rendered
}

function setupSelectorYears(selectedDate) {
    const selectedYear = selectedDate.format('YYYY')
    const thisYear = moment().format('YYYY')

    let diffPreviousYear = prevYearLimit
    if (selectedYear < thisYear - prevYearLimit) {
        diffPreviousYear = parseInt(thisYear) - parseInt(selectedYear)
    }

    let diffNextYear = nextYearLimit
    if (selectedYear > thisYear + nextYearLimit) {
        diffNextYear = parseInt(selectedYear) - parseInt(thisYear)
    }

    const minYear = moment().subtract(diffPreviousYear, 'year').format('YYYY')
    const maxYear = moment().add(diffNextYear, 'year').format('YYYY')

    const years = []

    for (let year = minYear; year <= maxYear; year++) {
        years.push({
            name: year,
            value: year,
            isSelected: year == selectedYear
        })
    }

    calendarDataSelector.years = years
    renderSelectorYears()
}

function renderSelectorMonths() {
    const template = templateSelectorOptionsMonth
    const compiled = Handlebars.compile(template)
    const rendered = compiled(calendarDataSelector)
    document.getElementById('selector-month').innerHTML = rendered
}

function setupSelectorMonths(selectedDate) {
    const selectedYear = selectedDate.format('YYYY')
    const selectedMonth = selectedDate.format('MM')

    const months = moment.months(selectedYear).map((month, index) => {
        return {
            name: month,
            value: String(index + 1).padStart(2, '0'),
            isSelected: index + 1 == parseInt(selectedMonth)
        }
    })

    calendarDataSelector.months = months
    renderSelectorMonths()
}

function renderMonth() {
    const template = templateContainerDaysInMonth
    const compiled = Handlebars.compile(template)
    const rendered = compiled(calendarDaysData)

    const daysContainer = document.querySelector(`#${rootContainer} > #calendar-main-container > #calendar-main-days`)
    daysContainer.innerHTML = rendered
}

function setupCalendar(referenceDate) {
    const calendarContainer = document.getElementById(rootContainer)
    calendarContainer.innerHTML = templateCalendarContainer

    const weekNames = moment.weekdaysShort(true)
    calendarDaysData.weekNames = weekNames

    const refDay = moment(referenceDate) // normally today

    calendarDaysData.month = refDay.format('MM')
    calendarDaysData.year = refDay.format('YYYY')
    calendarDaysData.days = []

    const startOfMonth = moment(refDay).startOf('month')
    const endOfMonth = moment(refDay).endOf('month')

    const startOfCalendar = moment(startOfMonth).startOf('week')
    const endOfCalendar = moment(endOfMonth).endOf('week')

    const day = startOfCalendar
    while (day.isSameOrBefore(endOfCalendar)) {
        calendarDaysData.days.push({
            day: day.format('D'),
            isCurrentMonth: day.isSame(refDay, 'month'),
            isToday: day.isSame(moment(), 'day')
        })
        day.add(1, 'day')
    }

    setupSelectorYears(referenceDate)
    setupSelectorMonths(referenceDate)

    renderMonth()
}

function moveDate() {
    const selectedYear = document.getElementById("selector-year").value
    const selectedMonth = document.getElementById("selector-month").value

    const date = moment(`${selectedYear}-${selectedMonth}-01`)
    setupCalendar(date)
}

function moveToday() {
    const date = moment()
    setupCalendar(date)
}

function movePreviousMonth() {
    const selectedYear = document.getElementById("selector-year").value
    const selectedMonth = document.getElementById("selector-month").value

    const date = moment(`${selectedYear}-${selectedMonth}-01`).subtract(1, 'month')
    setupCalendar(date)
}

function moveNextMonth() {
    const selectedYear = document.getElementById("selector-year").value
    const selectedMonth = document.getElementById("selector-month").value

    const date = moment(`${selectedYear}-${selectedMonth}-01`).add(1, 'month')
    setupCalendar(date)
}

function initCalendar(targetRootContainer) {
    moment.locale("ko")

    const today = moment()
    rootContainer = targetRootContainer
    setupCalendar(today)
}
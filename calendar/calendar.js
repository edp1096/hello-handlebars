const today = moment()
const thisYear = today.format('YYYY')
const thisMonth = today.format('MM')

const calendarDataSelector = {}
const calendarDaysData = {}

let prevYearLimit = 3
let nextYearLimit = 3

function renderSelectorYears() {
    const template = document.getElementById('options-year').innerHTML
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
    const template = document.getElementById('options-month').innerHTML
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

function renderMonth(targetContainer) {
    const template = document.getElementById('container-month').innerHTML
    const compiled = Handlebars.compile(template)
    const rendered = compiled(calendarDaysData)

    daysContainer = document.querySelector(`#${targetContainer}`)
    daysContainer.innerHTML = rendered
}

function setupCalendar(targetContainer, referenceDate) {
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

    renderMonth(targetContainer)
}

function moveDate() {
    const selectedYear = document.getElementById("selector-year").value
    const selectedMonth = document.getElementById("selector-month").value

    const date = moment(`${selectedYear}-${selectedMonth}-01`)
    setupCalendar("calendar-main-days", date)
}

function moveToday() {
    const date = moment()
    setupCalendar("calendar-main-days", date)
}

function movePreviousMonth() {
    const selectedYear = document.getElementById("selector-year").value
    const selectedMonth = document.getElementById("selector-month").value

    const date = moment(`${selectedYear}-${selectedMonth}-01`).subtract(1, 'month')
    setupCalendar("calendar-main-days", date)
}

function moveNextMonth() {
    const selectedYear = document.getElementById("selector-year").value
    const selectedMonth = document.getElementById("selector-month").value

    const date = moment(`${selectedYear}-${selectedMonth}-01`).add(1, 'month')
    setupCalendar("calendar-main-days", date)
}

function initCalendar(targetContainer) {
    moment.locale("ko")

    const today = moment()
    setupCalendar(targetContainer, today)
}
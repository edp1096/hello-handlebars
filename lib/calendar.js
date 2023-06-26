let _calendarClassConnectorAsVariable

class Calendar {
    constructor(targetRootContainer, previousYearLimit = 3, beyondYearLimit = 3) {
        // Template - Calendar container
        this.templateCalendarContainer = `
<div id="calendar-class-container">
    <div id="calendar-class-controls">
        <select
        id="selector-year"
        name="year"
        onchange="_calendarClassConnectorAsVariable.moveDate()"
        ></select>
        <select
        id="selector-month"
        name="month"
        onchange="_calendarClassConnectorAsVariable.moveDate()"
        ></select>
        <button
        onclick="_calendarClassConnectorAsVariable.moveToday()"
        >
            Today
        </button>

        <button
        onclick="_calendarClassConnectorAsVariable.movePreviousMonth()"
        >
            Previous Month
        </button>
        <button
        onclick="_calendarClassConnectorAsVariable.moveNextMonth()"
        >
            Next Month
        </button>
    </div>

    <div id="calendar-class-days">Loading..</div>
</div>`

        // Template - Yearly selector
        this.templateSelectorOptionsYear = `
{{#each years}}
{{#if isSelected}}
<option value="{{value}}" selected>{{name}}</option>
{{else}}
<option value="{{value}}">{{name}}</option>
{{/if}}
{{/each}}`

        // Template - Monthly selector
        this.templateSelectorOptionsMonth = `
{{#each months}}
{{#if isSelected}}
<option value="{{value}}" selected>{{name}}</option>
{{else}}
<option value="{{value}}">{{name}}</option>
{{/if}}
{{/each}}`.replace(/\s{2,}/g, ' ').replace(/(\r\n|\n|\r)/gm, "")

        // Template - Days in month container
        this.templateContainerDaysInMonth = `
<div class="calendar-class-month">
    <ul class="calendar-class-weekdays">
        {{#each weekNames}}
        <li>{{this}}</li>
        {{/each}}
    </ul>

    <ul class="calendar-class-day">
        {{#each days}}
        <li
            class="
                {{#if isCurrentMonth}}calendar-class-current-month{{/if}}
                {{#unless isCurrentMonth}}calendar-class-other-month{{/unless}}
                {{#if isToday}}calendar-class-today{{/if}}
            "
            data-day="{{day}}"
        >
            {{day}}
        </li>
        {{/each}}
    </ul>
</div>`

        this.templateCalendarContainer = this.templateCalendarContainer.replace(/\s{2,}/gm, ' ').replace(/(\r\n|\n|\r)/gm, "")
        this.templateSelectorOptionsYear = this.templateSelectorOptionsYear.replace(/\s{2,}/gm, ' ').replace(/(\r\n|\n|\r)/gm, "")
        this.templateSelectorOptionsMonth = this.templateSelectorOptionsMonth.replace(/\s{2,}/gm, ' ').replace(/(\r\n|\n|\r)/gm, "")
        this.templateContainerDaysInMonth = this.templateContainerDaysInMonth.replace(/\s{2,}/gm, ' ').replace(/(\r\n|\n|\r)/gm, "")

        this.today = moment()
        this.thisYear = this.today.format('YYYY')
        this.thisMonth = this.today.format('MM')

        this.calendarDataSelector = {}
        this.calendarDaysData = {}

        this.prevYearLimit = previousYearLimit
        this.nextYearLimit = beyondYearLimit

        moment.locale("ko")

        this.rootContainer = targetRootContainer
        this.setupCalendar(this.today)

        _calendarClassConnectorAsVariable = this
    }

    renderSelectorYears() {
        const template = this.templateSelectorOptionsYear
        const compiled = Handlebars.compile(template)
        const rendered = compiled(this.calendarDataSelector)
        document.getElementById('selector-year').innerHTML = rendered
    }

    setupSelectorYears(selectedDate) {
        const selectedYear = selectedDate.format('YYYY')
        const thisYear = moment().format('YYYY')

        let diffPreviousYear = this.prevYearLimit
        if (parseInt(selectedYear) < parseInt(thisYear) - parseInt(this.prevYearLimit)) {
            diffPreviousYear = parseInt(thisYear) - parseInt(selectedYear)
        }

        let diffNextYear = this.nextYearLimit
        if (parseInt(selectedYear) > parseInt(thisYear) + parseInt(this.nextYearLimit)) {
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

        this.calendarDataSelector.years = years
        this.renderSelectorYears()
    }

    renderSelectorMonths() {
        const template = this.templateSelectorOptionsMonth
        const compiled = Handlebars.compile(template)
        const rendered = compiled(this.calendarDataSelector)
        document.getElementById('selector-month').innerHTML = rendered
    }

    setupSelectorMonths(selectedDate) {
        const selectedYear = selectedDate.format('YYYY')
        const selectedMonth = selectedDate.format('MM')

        const months = moment.months(selectedYear).map((month, index) => {
            return {
                name: month,
                value: String(index + 1).padStart(2, '0'),
                isSelected: index + 1 == parseInt(selectedMonth)
            }
        })

        this.calendarDataSelector.months = months
        this.renderSelectorMonths()
    }

    renderMonth() {
        const template = this.templateContainerDaysInMonth
        const compiled = Handlebars.compile(template)
        const rendered = compiled(this.calendarDaysData)

        const daysContainer = document.querySelector(`#${this.rootContainer} > #calendar-class-container > #calendar-class-days`)
        daysContainer.innerHTML = rendered
    }

    setupCalendar(referenceDate) {
        const calendarContainer = document.getElementById(this.rootContainer)
        calendarContainer.innerHTML = this.templateCalendarContainer

        const weekNames = moment.weekdaysShort(true)
        this.calendarDaysData.weekNames = weekNames

        const refDay = moment(referenceDate) // normally today

        this.calendarDaysData.month = refDay.format('MM')
        this.calendarDaysData.year = refDay.format('YYYY')
        this.calendarDaysData.days = []

        const startOfMonth = moment(refDay).startOf('month')
        const endOfMonth = moment(refDay).endOf('month')

        const startOfCalendar = moment(startOfMonth).startOf('week')
        const endOfCalendar = moment(endOfMonth).endOf('week')

        const day = startOfCalendar
        while (day.isSameOrBefore(endOfCalendar)) {
            this.calendarDaysData.days.push({
                day: day.format('D'),
                isCurrentMonth: day.isSame(refDay, 'month'),
                isToday: day.isSame(moment(), 'day')
            })
            day.add(1, 'day')
        }

        this.setupSelectorYears(referenceDate)
        this.setupSelectorMonths(referenceDate)

        this.renderMonth()
    }

    moveDate() {
        const selectedYear = document.getElementById("selector-year").value
        const selectedMonth = document.getElementById("selector-month").value

        const date = moment(`${selectedYear}-${selectedMonth}-01`)
        this.setupCalendar(date)
    }

    moveToday() {
        const date = moment()
        this.setupCalendar(date)
    }

    movePreviousMonth() {
        const selectedYear = document.getElementById("selector-year").value
        const selectedMonth = document.getElementById("selector-month").value

        const date = moment(`${selectedYear}-${selectedMonth}-01`).subtract(1, 'month')
        this.setupCalendar(date)
    }

    moveNextMonth() {
        const selectedYear = document.getElementById("selector-year").value
        const selectedMonth = document.getElementById("selector-month").value

        const date = moment(`${selectedYear}-${selectedMonth}-01`).add(1, 'month')
        this.setupCalendar(date)
    }
}


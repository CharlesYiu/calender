if (document.querySelector('link[rel=stylesheet][href$="/calender/style.css"]') === null) {
    const stylesheet = document.createElement("link")
    stylesheet.rel = "stylesheet"
    stylesheet.href = "./calender/style.css"
    document.head.appendChild(stylesheet)
}
class DatePicker extends HTMLDivElement {
    static get Type() { return {
        select: 0,
        multiselect: 1,
        rangeselect: 2
    } }
    #toDayString(day) {
        day = String(day - 1)
        switch (day[day.length - 1]) {
            case "1":
                day += "st"
                break
            case "2":
                day += "nd"
                break
            case "3":
                day += "rd"
                break
            default:
                day += "th"
                break
        }
        return day
    }
    #toMonthString(month) {
        switch (month) {
            case 0:
                return "january"
            case 1:
                return "february"
            case 2:
                return "march"
            case 3:
                return "april"
            case 4:
                return "may"
            case 5:
                return "june"
            case 6:
                return "july"
            case 7:
                return "august"
            case 8:
                return "september"
            case 9:
                return "october"
            case 10:
                return "november"
            case 11:
                return "december"
            default:
                return "null"
        }
    }
    #getColor(year, month, day) {
        return ""
    }

    static scrollPadding = 30

    static get year() { return (new Date(Date.now())).getFullYear() }
    #year = null
    get year() { return this.#year || DatePicker.year }
    set year(value) {
        value = parseInt(value)
        if (isNaN(value)) return
        this.#year = value
    }

    #shiftPressed = false
    #selectedDates = []
    #eventType
    #generate(year, appendDirection = 1, scroll = false) {
        this.year = year

        const currentYearElements = Array.from(this.content.querySelectorAll("div.year > h1"))
            .filter(yearElement => yearElement.innerText === String(this.year))

        if (currentYearElements.length > 0) {
            currentYearElements[0].parentElement.scrollIntoView({ behavior: "smooth" })
            return []
        }

        const collection = []

        const scrollElement = document.createElement("div")
        scrollElement.className = "view"
        collection.push(scrollElement)

        const yearElement = document.createElement("div")
        yearElement.className = "year"
        yearElement.innerHTML = `<h1>${this.year}</h1>`
        collection.push(yearElement)
        
        for (let month = 0; month < 12; month++) {
            let _collection = []

            const fillers = month === 0 ? (new Date(year, month, 1)).getDay() : collection[collection.length - 1].querySelector("div.grid > div.week:nth-last-child(1)").children.length
            if (fillers < 7) for (let index = 0; index < fillers; index++) _collection.push(document.createElement("span"))
            const days = new Date(this.year, month + 1, 0).getDate() + 1
            for (let day = 1; day < days; day++) {
                const button = document.createElement("button")
                button.className = this.#getColor(this.year, month, day)
                button.title = this.#toDayString(day + 1)
                const date = new Date(this.year, month, day)
                button.addEventListener("click", _ => {
                    if (!this.#shiftPressed) {
                        if (this.#eventType !== DatePicker.Type.select) {
                            this.#selectedDates = []
                            this.#eventType = DatePicker.Type.select
                        }
                        _collection.forEach(element => element.classList.remove("active"))
                        if (this.#selectedDates[0] === date) {
                            button.classList.remove("active")
                            this.#selectedDates[0] = null
                        } else {
                            button.classList.add("active")
                            this.#selectedDates[0] = date
                        }

                        this.dispatchEvent(new CustomEvent("dateselection", { detail: this.#selectedDates[0] }))
                    } else {
                        if (this.#eventType !== DatePicker.Type.multiselect) {
                            _collection.forEach(element => element.classList.remove("active"))
                            this.#selectedDates = []
                            this.#eventType = DatePicker.Type.multiselect
                        }
                        if (!this.#selectedDates.includes(date)) {
                            button.classList.add("active")
                            this.#selectedDates.push(date)
                        } else {
                            button.classList.remove("active")
                            this.#selectedDates.splice(this.#selectedDates.indexOf(date), 1)
                        }

                        this.dispatchEvent(new CustomEvent("dateselections", {  detail: this.#selectedDates }))
                    }
                })

                // TODO implement range function

                // function dispatchRangeEvent() {
                    
                // }

                // let mousedown = false
                // button.addEventListener("mousedown", _ => mousedown = true)
                // button.addEventListener("mouseup", _ => mousedown = false)
                // button.addEventListener("mouseover", _ => {
                //     if (!mousedown || this.#shiftPressed) return
                //     if (!this.#selectedDates.includes(date)) this.#selectedDates.push(date)
                //     dispatchRangeEvent()
                // })
                // button.addEventListener("mouseout", _ => {
                //     if (!mousedown || this.#shiftPressed) return
                //     if (this.#selectedDates.includes(date))
                //         this.#selectedDates.splice(this.#selectedDates.indexOf(date), 1)
                //     dispatchRangeEvent()
                // })
                
                // this.dispatchEvent(new CustomEvent("dateselection", {
                //     detail: {
                //         type: 
                //     }
                // }))

                _collection.push(button)
            }

            const grid = document.createElement("div")
            grid.classList.add("grid")
            let week = null
            for (let index = 0; index < _collection.length; index++) {
                if (week === null) {
                    week = document.createElement("div")
                    week.classList.add("week")
                }
                week.append(_collection[index])
                if (week !== null && (week.children.length === 7 || index === _collection.length - 1)) {
                    grid.append(week)
                    week = null
                }
            }

            const div = document.createElement("div")
            div.classList.add("month")
            div.innerHTML = `<h2>${this.#toMonthString(month)}</h2>
                            <div class="label">
                                <p title="sunday">s</p>
                                <p title="monday">m</p>
                                <p title="tuesday">t</p>
                                <p title="wednesday">w</p>
                                <p title="thursday">t</p>
                                <p title="friday">f</p>
                                <p title="saturday">s</p>
                            </div>`
            div.append(grid)

            collection.push(div)
        }

        const yearElements = this.content.querySelectorAll("div.year")
        const viewableElement = appendDirection === 0 ? yearElements.item(0) : yearElements.item(yearElements.length - 1)

        if (appendDirection === 0) collection.reverse()
        collection.forEach((month) => {
            if (appendDirection === 0) this.content.insertBefore(month, this.content.firstChild)
            else this.content.append(month)
        })
        if (viewableElement !== null) viewableElement.scrollIntoView({ behavior: scroll ? "smooth" : "instant" })

        if (scroll) collection[appendDirection === 0 ? collection.length - 2 : 1].scrollIntoView({ behavior: "smooth"})

        if (appendDirection === 0) collection.reverse()
        return collection
    }
    constructor() {
        super()

        this.innerHTML += `<button class="up"></button>
                          <div class="content"></div>
                          <button class="down"></button>`
        this.content = this.querySelector("div.content")
        this.querySelector("button.up").addEventListener("click", _ => this.#generate(this.year - 1, 0, true))
        this.querySelector("button.down").addEventListener("click", _ => this.#generate(this.year + 1, 1, true))

        let isWheel = false
        let timer = null
        let timeout = false
        this.content.addEventListener("wheel", _ => isWheel = true)
        this.content.addEventListener("scroll", _ => {
            clearTimeout(timer)
            timer = setTimeout(() => isWheel = false, 100)
            if (!isWheel) return

            const currentYearElements = Array.from(this.content.querySelectorAll("div.year > h1"))
            if (this.content.scrollTop < DatePicker.scrollPadding && !timeout) {
                this.#generate(parseInt(currentYearElements[0].innerText) - 1, 0, true)
                this.content.scrollTo({
                    top: 40,
                    behavior: "instant"
                })
                timeout = true
                setTimeout(() => timeout = false, 10);
            } else if (this.content.scrollTop > this.content.scrollHeight - this.content.clientHeight - DatePicker.scrollPadding)
                this.#generate(parseInt(currentYearElements[currentYearElements.length - 1].innerText) + 1, 1, true)
        })
        window.addEventListener("keydown", event => { if (event.key === "Shift") this.#shiftPressed = true })
        window.addEventListener("keyup", event => { if (event.key === "Shift") this.#shiftPressed = false })
        this.#generate(this.year)

        setTimeout(() => {
            this.content.scrollTo({
                top: 40,
                behavior: "instant"
            })
        }, 0)
    }
}
customElements.define("date-picker", DatePicker, { extends: "div" })
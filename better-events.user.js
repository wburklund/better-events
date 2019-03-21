// ==UserScript==
// @name          Better Events
// @description   Improves calendar pages for QC Times and RI Argus websites
// @author        Will Burklund
// @match         https://qctimes.com/calendar/
// @match         https://qconline.com/calendar/
// ==/UserScript==

// Load an existing array of hide filters. Otherwise, create a new array.
const hideFilters = JSON.parse(localStorage.getItem('hide_filters')) || []

// Gets a list of events for this page
const getEvents = () => [...document.getElementsByClassName('event-list-item')]

// Gets the event title for an event-list-item
const getTitleForEvent = event => document.querySelector('#' + event.id + ' .event-title a').innerText

const hideEvents = () => {
    let events = getEvents()

    // Find events to hide
    let matchingEvents = events.filter(event => {
        const title = getTitleForEvent(event)
        return hideFilters.some(filter => filter === title)
    })

    // Remove hidden events
    matchingEvents.forEach(event => event.parentNode.removeChild(event))
}

const hideNewEvent = (title) => {
    // Add new filter
    hideFilters.push(title)

    // Update LocalStorage
    localStorage.setItem('hide_filters', JSON.stringify(hideFilters))

    // Update DOM
    hideEvents()
}

const showEventInfo = (event) => {
    const eventLink = event.querySelector('.tnt-asset-link')
    const eventDate = event.querySelector('.event-date')

    fetch(eventLink.href)
        .then(res => res.text())
        .then(text => {
            const parser = new DOMParser()
            const eventDocument = parser.parseFromString(text, 'text/html').documentElement
            const times = [...eventDocument.getElementsByTagName('time')]

            let time = times.map(t => t.innerText.trim()).join(' ')

            if (time.indexOf('@') !== -1) {
                time = time.slice(time.indexOf('@') + 1)
            }

            time = time.trim()

            eventDate.innerText += ` -- ${time}`
        })
}

const addHideButtons = () => {
    // For each event,
    getEvents().forEach(event => {
        // If there isn't already a hide button for this event,
        if (event.firstElementChild.lastElementChild.tagName !== 'BUTTON') {
            // Add one
            event.firstElementChild.appendChild(document.createElement('button'))
            const hideButton = event.firstElementChild.lastElementChild

            // Cover the event-date-square with it
            hideButton.parentElement.style = 'position: relative'
            hideButton.style = 'position: absolute; top: 0%; left: 0%; width: 100%; height: 100%'
            hideButton.innerText = 'Hide'

            // Make button transparent unless it's being hovered over
            hideButton.style.opacity = "0"
            hideButton.onmouseover = function(){this.style.opacity = "1"}
            hideButton.onmouseout = function(){this.style.opacity = "0"}

            // Hide events with this title if the button is clicked
            hideButton.addEventListener('click', function() {
                hideNewEvent(getTitleForEvent(this.parentNode.parentNode))
            })
        }
    })
}

const addResetButton = () => {
    // Find the h1, and add a button as a child
    const eventHeading = document.getElementsByTagName('h1')[0]
    eventHeading.appendChild(document.createElement('button'))
    const resetButton = eventHeading.lastElementChild

    // Cover the h1 with the child button
    resetButton.parentElement.style = 'position: relative'
    resetButton.style = 'position: absolute; top: 0%; left: 0%; width: 100%; height: 100%'
    resetButton.innerText = 'Reset Hidden Events'

    // Make the button transparent unless hovered over
    resetButton.style.opacity = "0"
    resetButton.onmouseover = function(){this.style.opacity = "1"}
    resetButton.onmouseout = function(){this.style.opacity = "0"}

    // Remove hide filters and reload if clicked
    resetButton.addEventListener('click', () => {
        localStorage.removeItem('hide_filters')
        window.location.reload('false')
    })
}

const init = () => {
    hideEvents()
    getEvents().forEach(e => showEventInfo(e))

    addHideButtons()
    addResetButton()
}

init()

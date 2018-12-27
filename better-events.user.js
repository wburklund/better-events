// ==UserScript==
// @name          Better Events
// @description   Improves calendar pages for QC Times and RI Argus websites
// @author        Will Burklund
// @match         https://qctimes.com/calendar/
// @match         https://qconline.com/calendar/
// ==/UserScript==

// Gets a list of events for this page
const getEvents = () => [...document.getElementsByClassName('event-list-item')]

// Gets the event title for an event-list-item
const getTitleForEvent = event => document.querySelector('#' + event.id + ' .event-title a').innerText

const hideEvents = (newFilter) => {
    // Load an existing array of hide filters. Otherwise, create a new array.
    let hideFilters = JSON.parse(localStorage.getItem('hide_filters')) || []

    // Save if a new hide filter is being added
    if (newFilter) {
        hideFilters.push(newFilter)
        localStorage.setItem('hide_filters', JSON.stringify(hideFilters))
    }

    let events = getEvents()

    // Find events to hide
    let matchingEvents = events.filter(event => {
        const title = getTitleForEvent(event)
        return hideFilters.some(filter => filter === title)
    })

    // Remove hidden events
    matchingEvents.forEach(event => event.parentNode.removeChild(event))
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
                hideEvents(getTitleForEvent(this.parentNode.parentNode))
            })
        }
    })
}

const init = () => {
    hideEvents()
    addHideButtons()
}

// Run init before and after page is completely loaded, just to be sure
init()
window.addEventListener('load', init, false)

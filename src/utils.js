export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8am–10pm
export const COLORS = [
    "#e07b54", "#5b8dd9", "#6bbf8e", "#d4669a", "#c9a84c",
    "#7c63c9", "#5bbcbf", "#d4836e",
];

export function getBusyness(events, day, hour, friends) {
    const busy = new Set();
    for (const e of events) {
        if (e.day === day && e.start <= hour && e.end > hour) busy.add(e.user_id);
    }
    return busy.size / friends.length;
}

export function getFreePeople(events, day, hour, friends) {
    const busyIds = new Set();
    for (const e of events) {
        if (e.day === day && e.start <= hour && e.end > hour) busyIds.add(e.user_id);
    }
    return friends.filter(f => !busyIds.has(f.id));
}

export function getBusyPeople(events, day, hour, friends) {
    const busyIds = new Set();
    const busyEvents = {};
    for (const e of events) {
        if (e.day === day && e.start <= hour && e.end > hour) {
            busyIds.add(e.user_id);
            busyEvents[e.user_id] = e;
        }
    }
    return friends.filter(f => busyIds.has(f.id)).map(f => ({ ...f, event: busyEvents[f.id] }));
}

export function heatColor(ratio) {
    if (ratio === 0) return "transparent";
    const r = Math.round(80 + ratio * 175);
    const g = Math.round(20 + (1 - ratio) * 60);
    const b = Math.round(20 + (1 - ratio) * 40);
    return `rgba(${r},${g},${b},${0.15 + ratio * 0.55})`;
}

export function formatTime(h) {
    const ampm = h >= 12 ? "pm" : "am";
    const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hr}${ampm}`;
}

export function parseICS(icsText, userId, userColor) {
    const DAY_MAP = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 }

    // Unfold folded lines (iCal wraps long lines with \r\n + space)
    const unfolded = icsText
        .replace(/\r\n[ \t]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')

    const lines = unfolded.split('\n')

    let current = null
    const rawEvents = []

    for (const line of lines) {
        if (line === 'BEGIN:VEVENT') { current = {}; continue }
        if (line === 'END:VEVENT') {
            if (current) rawEvents.push(current)
            current = null
            continue
        }
        if (!current) continue

        const colonIdx = line.indexOf(':')
        if (colonIdx === -1) continue

        const rawKey = line.slice(0, colonIdx)
        const val = line.slice(colonIdx + 1).trim()
        const key = rawKey.split(';')[0].toUpperCase()

        if (key === 'SUMMARY') current.summary = val
        if (key === 'LOCATION') current.location = val
        if (key === 'CATEGORIES') current.categories = val
        if (key === 'DTSTART') current.dtstart = val
        if (key === 'DTEND') current.dtend = val
        if (key === 'RRULE') current.rrule = val
    }

    // Parse hour from UNSW local datetime string e.g. "20260217T090000"
    const parseHour = (dtStr) => {
        if (!dtStr) return null
        const digits = dtStr.replace(/[TZ\-:]/g, '')
        return parseInt(digits.slice(8, 10), 10)
    }

    // Parse day-of-week (Mon=0) from a date string e.g. "20260217T090000"
    const parseDayFromDate = (dtStr) => {
        if (!dtStr) return null
        const digits = dtStr.replace(/[TZ\-:]/g, '')
        const year = parseInt(digits.slice(0, 4), 10)
        const month = parseInt(digits.slice(4, 6), 10) - 1
        const day = parseInt(digits.slice(6, 8), 10)
        return (new Date(year, month, day).getDay() + 6) % 7
    }

    // Collect unique class slots — key by "title|day|startHour"
    // This deduplicates the multiple VEVENT segments UNSW exports per class
    const seen = new Set()
    const events = []

    for (const ev of rawEvents) {
        // Skip non-class entries like "Start of Term"
        if (!ev.summary) continue
        if (ev.categories === 'AcadCalendar') continue
        if (!ev.rrule && !ev.dtstart) continue

        const startHour = parseHour(ev.dtstart)
        const endHour = ev.dtend ? parseHour(ev.dtend) : (startHour ?? 9) + 1
        if (startHour === null) continue

        // Get days from BYDAY in RRULE e.g. "FREQ=WEEKLY;UNTIL=...;BYDAY=TU"
        let days = []
        if (ev.rrule) {
            const byday = ev.rrule.match(/BYDAY=([^;]+)/)
            if (byday) {
                days = byday[1]
                    .split(',')
                    .map(d => d.replace(/[0-9+-]/g, '').toUpperCase())
                    .map(d => DAY_MAP[d])
                    .filter(d => d !== undefined)
            }
        }

        // Fall back to the date itself if no BYDAY
        if (days.length === 0) {
            const d = parseDayFromDate(ev.dtstart)
            if (d !== null) days = [d]
        }

        for (const day of days) {
            const key = `${ev.summary}|${day}|${startHour}`
            if (seen.has(key)) continue  // skip duplicate segment
            seen.add(key)

            events.push({
                user_id: userId,
                color: userColor,
                title: ev.summary,
                location: ev.location || '',
                type: 'class',
                day,
                start: startHour,
                end: endHour,
            })
        }
    }

    return events
}
type AvailabilityRange = {
    startDate: string | null;
    endDate: string | null;
    weekdays: number;
};

type RequestedRange = {
    startDate: string;
    endDate: string;
};

function parseIsoDate(date: string) {
    return new Date(`${date}T12:00:00.000Z`);
}

export function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function buildWeekdayMask(startDate: string, endDate: string) {
    const current = parseIsoDate(startDate);
    const last = parseIsoDate(endDate);
    let mask = 0;

    while (current <= last) {
        mask |= 1 << current.getUTCDay();
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return mask;
}

export function isRangeWithinAvailability(
    availability: AvailabilityRange,
    requestedRange: RequestedRange
) {
    if (availability.startDate && requestedRange.startDate < availability.startDate) {
        return false;
    }

    if (availability.endDate && requestedRange.endDate > availability.endDate) {
        return false;
    }

    const requestedWeekdayMask = buildWeekdayMask(
        requestedRange.startDate,
        requestedRange.endDate
    );

    return (availability.weekdays & requestedWeekdayMask) === requestedWeekdayMask;
}

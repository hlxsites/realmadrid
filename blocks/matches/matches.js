/* eslint-disable no-underscore-dangle */
import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { getLocale, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
// todo : make it configurable
const API = {
  football: '/realmadridmastersite/matchesVIPFootball',
  basketball: '/realmadridmastersite/matchesVIPBasket',
};

const timeformat = new Intl.DateTimeFormat(getLocale(), { minute: '2-digit', hour12: false, hour: '2-digit' });
const dateformat = new Intl.DateTimeFormat(getLocale(), { weekday: 'short', month: 'short', day: '2-digit' });
const monthFormat = new Intl.DateTimeFormat(getLocale(), { month: 'short' });

function createDiv(classNames, ...children) {
  const element = document.createElement('div');
  element.classList.add(...classNames.split(' '));
  if (children.length && typeof children[0] === 'string') {
    // eslint-disable-next-line prefer-destructuring
    element.innerHTML = children[0];
  } else if (children.length) {
    element.append(...children);
  }
  return element;
}

function toGoogleTime(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/.\d*Z/, 'Z');
}

function getEventInfo(match, placeholders) {
  const {
    description: {
      plaintext,
    },
    dateTime,
    venue: {
      name,
    },
  } = match;
  const { matchday } = placeholders;
  const startTime = new Date(dateTime);
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  const dateStart = toGoogleTime(startTime);
  const dateEnd = toGoogleTime(endTime);
  return {
    dateStart,
    dateEnd,
    description: plaintext,
    location: name,
    details: `${matchday} ${match.week || 0}`,
  };
}

function createCalendarEvent(match, placeholders) {
  const {
    dateStart,
    dateEnd,
    description,
    location,
    details,
  } = getEventInfo(match, placeholders);
  let calendarEvent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${dateStart}`,
    `DTEND:${dateEnd}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${details}`,
    `SUMMARY:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const SEPARATOR = '\n';
  calendarEvent = calendarEvent.join(SEPARATOR);
  return `data:text/plain;charset=utf-8,${calendarEvent}`;
}

const calendars = {
  ical(match, placeholders) {
    return [
      'iCal Calendar',
      createCalendarEvent(match, placeholders),
      { download: 'calendar.ics' },
    ];
  },
  outlook(match, placeholders) {
    return [
      'Outlook Calendar',
      createCalendarEvent(match, placeholders),
      { download: 'calendar.ics' },
    ];
  },
  google(match, placeholders) {
    const {
      dateStart,
      dateEnd,
      description,
      location,
      details,
    } = getEventInfo(match, placeholders);
    const url = new URL('https://calendar.google.com/calendar/u/0/r/eventedit');
    Object.entries({
      text: description,
      dates: `${dateStart}/${dateEnd}`,
      details,
      location,
    }).forEach((k) => url.searchParams.set(...k));
    return ['Google Calendar',
      url.toString(),
      { target: 'blank' },
    ];
  },
};

function renderCalendarIcons(match, placeholders) {
  return Object.entries(calendars).map(([icon, fn]) => {
    const [text, href, attributes = {}] = fn(match, placeholders);
    const attrStr = Object.entries(attributes).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<a class="calendar-icon icon-${icon}" href="${href}" ${attrStr}>${text}</a>`;
  }).join('');
}

// eslint-disable-next-line no-unused-vars
function getOptimizedImage(src) { // todo : use that if optimized image is required. See issue#65
  const match = src.match(/(.+)\.([^.]+)$/);
  return `${match[1]}.app.${match[2]}`;
}

const renderMatch = (placeholders) => (match) => {
  const ctaLabel = placeholders.buyVipTickets;
  const fromText = placeholders.from;
  const { matchday, addToCalendar, pricesAndSales } = placeholders;
  const {
    competition: {
      name: cmpName,
      logo: cmpLogo,
    },
    week,
    venue: {
      name: venueName,
    },
    dateTime,
    homeTeam: {
      logo: homeTeamLogo,
      name: homeTeamName,
    },
    awayTeam: {
      logo: awayTeamLogo,
      name: awayTeamName,
    },
  } = match;
  const time = new Date(dateTime);
  const month = monthFormat.format(time);
  const content = `
  <input type="checkbox" />
  <div class="calendar-info">
    <a href="#">${pricesAndSales}</a>
    <span>${addToCalendar}</span>
    <div class="calendar-icons">
      ${renderCalendarIcons(match, placeholders)}
    </div>
  </div>
  <div class="match-content">
      ${cmpLogo ? `<img class="logo competition" src="${cmpLogo ? cmpLogo._publishUrl : ''}" alt="${cmpName}">` : ''}
      <div class="competition-info">
        <span>${matchday} ${week || 0}</span>
        <span>${venueName}</span>
      </div>
      <div class="datetime">
        <span class="time">${timeformat.format(time)}</span>
        <span class="date">${dateformat.format(time)}</span>
      </div>
      <img class="logo team home" src="${homeTeamLogo._publishUrl}" alt="${homeTeamName}">
      <img class="logo team away" src="${awayTeamLogo._publishUrl}" alt="${awayTeamName}">
      <div class="teams">
        <span>${homeTeamName}</span>
        <span>${awayTeamName}</span>
      </div>
      <div class="price">${fromText} 1.400€</div>
      <a class="button cta" href="#">${ctaLabel}</a>
    </div>
  </div>
  `;
  const div = createDiv('match', content);
  div.setAttribute('data-month', month);
  return div;
};

function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let start = year;
  let end = year + 1;
  if (month < 6) {
    start -= 1;
    end -= 1;
  }
  return `${start.toString().slice(-2)}/${end.toString().slice(-2)}`;
}

function getMonthOptions(months) {
  const content = months
    .map((m) => `<li class="option">
                  <a href="#month-${m}"
                     tabIndex="0"
                    data-filter="${m}">${m.toUpperCase()}</a>
                </li>`)
    .join('');
  return `<ol class="filters level-2">${content}</ol>`;
}

function filterMonth(block, month) {
  const allMatches = block.querySelectorAll(':scope .match');
  let matchesToDisplay;
  if (month === 'all') {
    matchesToDisplay = allMatches;
  } else {
    allMatches.forEach((x) => x.classList.remove('appear'));
    matchesToDisplay = block.querySelectorAll(`:scope .match[data-month="${month}"]`);
  }
  const emptyMatch = block.querySelector(':scope .empty-match');
  emptyMatch.classList.toggle('appear', matchesToDisplay.length === 0);
  matchesToDisplay.forEach((x) => x.classList.add('appear'));
}

function createFilters(block, placeholders, months) {
  const { matchesOnSale, calendar } = placeholders;
  const ol = document.createElement('ol');
  ol.classList.add('filters', 'level-1');
  ol.innerHTML = `
    <li class="option"><a href="#allMatches" tabIndex="0" data-filter="all">${matchesOnSale}</a></li>
    <li class="option nested"><a href="#calendar"tabIndex="0">${calendar} ${getCurrentSeason()}</a>
      ${getMonthOptions(months)}
    </li>
  `;
  ol.addEventListener('click', (e) => {
    const { target } = e;
    if (target.nodeName === 'A') {
      const li = target.parentElement;
      if (!li.classList.contains('active')) {
        const href = target.getAttribute('href');
        const currentOl = li.parentElement;
        const currentActiveEl = currentOl.querySelector(':scope > li.active');
        if (currentActiveEl) {
          currentActiveEl.classList.remove('active');
        }
        currentOl.setAttribute('data-selected', href.substring(1));
        li.classList.add('active');
        if (li.classList.contains('nested')) {
          const selectedOpt = li.querySelector(':scope li.active a') || li.querySelector(':scope li:first-child a');
          selectedOpt.click();
        }
        if (target.dataset.filter) {
          filterMonth(block, target.dataset.filter);
        }
      }
      e.preventDefault();
    }
  });
  return ol;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const placeholders = await fetchLanguagePlaceholders();
  const { aemGqEndpoint, noMatches } = placeholders;
  const { sport } = config;
  const url = new URL(`${aemGqEndpoint}${API[sport.toLowerCase()]}`); // todo: add params fromDate endDate
  const response = await fetch(url);
  const data = await response.json();
  const items = data.data.matchList.items.map(renderMatch(placeholders));
  const itemsWrapper = createDiv(
    'match-list',
    ...items,
    createDiv('empty-match', noMatches),
  );

  const months = [...new Set(items.map((x) => x.dataset.month))];
  block.innerHTML = '';
  const filters = createFilters(block, placeholders, months);
  block.append(filters, itemsWrapper);
  filters.querySelector(':scope > li:first-child a').click();
}

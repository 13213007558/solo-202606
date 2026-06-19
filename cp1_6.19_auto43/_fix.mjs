import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('src/pages/ExhibitionDetail.tsx', 'utf8');

const idx = c.indexOf('days.push');
if (idx < 0) { console.log('ERROR'); process.exit(1); }
const start = c.lastIndexOf('\n', idx) + 1;
const endMarker = 'return days;';
const endIdx = c.indexOf(endMarker, idx);
const end = endIdx + endMarker.length;

const NF = String.fromCharCode(10);
const SQ = String.fromCharCode(39);
const DQ = String.fromCharCode(34);
const BQ = String.fromCharCode(96);
const DS = String.fromCharCode(36);

const NR = NF + NF;
const newBlock = '      const ratio = day.remaining / exhibition.capacity;' + NR +
      'const progressColor = ratio import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('src/pa`' : ' + SQ + '#FC8181' + SQ + ';' + NR +
      '      ' + NR +
      '      days.push(' + NR +
      '        <button' + NR +
      '          key={day.date}' + NR +
      '          className={`Bandc' + BQ + 'calendar-day ' + DS + '{isSelected ? ' + SQ + 'selected' + SQ + ' : ' + SQ : ''} ' + DS + '{isDisabled ? ' + SQ + 'disabled' + SQ + ' : ' + SQ : ''} ' + DS + '{isToday ? ' + SQ < 'today' + SQ : ''} ' + DS + '{day.isFull ? ' + SQ + 'full' + SQ : ''}`}' + NR +
      '          disabled={isDisabled}' + NR +
      '          onClick={() => !isDisabled && setSelectedDate(day.date)}' + NR +
      '        >' + NR +
      '        <span className=' + DQ + 'day-number' + DQ + '>{dayNum}</span>' + NR +
      '        <span className=' + DQ + 'day-week' + DQ + '>{' + SQ +²¥Ê¥Ê¥Ê Ê§Ê§Ê¦Ê¥Ê¥Ê° œÊý{dayOfWeek]}</span>' + NR +
      '        {day.isFull ? (' + NR +
      '          <span className=' + DQ + 'full-dot' + DQ + '></span>' + NR +
      '        ) : !isPast ? (' + NR +
      '          <div className=' + DQ + 'day-ticket-info' + DQ + '>' + NR +
      '            <div className=' + DQ + 'day-progress-bar' + DQ + '>' + NR +
      '            <div' + NR +
      '              className=' + DQ + 'day-progress-fill' + DQ + NR +
      '              style={{' + NR +
      '               width: `' + BQ + DS + '{ratio * 100}%`,' + NR +
      '               backgroundColor: progressColor' + NR +
      '             }}' + NR +
      '            ></div>' + NR +
      '          </div>' + NR +
      '           <span className=' + DQ + 'day-remaining-num' + DQ + ' style={{ color: progressColor }}>{day.remaining}</span>' + NR +
      '          </div>' + NR +
      '        ) : null}' + NR +
      '        </button>' + NR +
      '      );' + NR +
      '    ' + NR +
      '    return days;';

c = c.substring(0, start) + newBlock + c.substring(end);
writeFileSync('src/pages/ExhibitionDetail.tsx', c);
console.log('OK');

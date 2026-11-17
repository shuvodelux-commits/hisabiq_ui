import {formatDay} from '../utils/dateRange';
export function recoveryDisplayDate(value:string){const stamp=Date.parse(value);if(!Number.isFinite(stamp))return value;const dhakaDay=new Date(stamp+6*3600000).toISOString().slice(0,10);return `${formatDay(dhakaDay)} · ${new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dhaka'}).format(stamp)} · Dhaka`;}

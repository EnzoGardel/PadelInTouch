// app/api/availability/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const OPEN = '08:00';
const CLOSE = '23:00';
const SLOT_MINUTES = 90;
const STEP_MINUTES = 30;

function toMinutes(t: string) { const [h,m]=t.split(':').map(Number); return h*60+m; }
function fromMinutes(n: number) { const h=String(Math.floor(n/60)).padStart(2,'0'); const m=String(n%60).padStart(2,'0'); return `${h}:${m}`; }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courtId = Number(searchParams.get('courtId'));
  const date = searchParams.get('date'); // "YYYY-MM-DD"

  if (!courtId || !date) {
    return NextResponse.json({ error: 'courtId y date son requeridos' }, { status: 400 });
  }

  const url = new URL(process.env.DATABASE_URL!);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  });

  try {
    const [rows] = await conn.query(
      `SELECT startDt, endDt FROM Reservation
       WHERE courtId = ? AND DATE(reservationDate) = DATE(?)`,
      [courtId, date]
    ) as any;

    const existing = rows.map((r:any)=>({ start: new Date(r.startDt).getTime(), end: new Date(r.endDt).getTime() }));

    // generar slots crudos
    const slots: {startTime:string; endTime:string}[] = [];
    for (let s = toMinutes(OPEN); s + SLOT_MINUTES <= toMinutes(CLOSE); s += STEP_MINUTES) {
      const st = fromMinutes(s);
      const et = fromMinutes(s + SLOT_MINUTES);
      slots.push({ startTime: st, endTime: et });
    }

    // filtrar los que pisan
    const ts = (hhmm:string)=> new Date(`${date}T${hhmm}:00`).getTime();
    const free = slots.filter(({startTime,endTime})=>{
      const ns = ts(startTime), ne = ts(endTime);
      return !existing.some((e:any)=> ns < e.end && ne > e.start);
    });

    return NextResponse.json(free);
  } finally {
    await conn.end();
  }
}

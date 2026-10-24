import * as Astronomy from 'astronomy-engine';
import { SkyObject, stars, deepSky } from './catalog';

export type SkyPoint = SkyObject & { altitude: number; azimuth: number; illumination?: number };
export type Observer = { latitude: number; longitude: number; height?: number };
export type HorizonEvent = { kind: 'rise' | 'set'; time: Date };
export type TonightTarget = { point: SkyPoint; bestAltitude: number; bestTime: Date };
export type SkyPathSample = { time: Date; altitude: number; azimuth: number };

export const planets = [
  { id:'sun', name:'Sun', body:Astronomy.Body.Sun, kind:'Sun' as const, color:'#fff0b2', magnitude:-26.74, description:'The star at the center of our Solar System. Never look directly at the Sun without proper eye protection.' },
  { id:'mercury', name:'Mercury', body:Astronomy.Body.Mercury, kind:'Planet' as const, color:'#cbbdae', magnitude:-0.4, description:'The smallest planet, moving quickly near the Sun in our sky.' },
  { id:'venus', name:'Venus', body:Astronomy.Body.Venus, kind:'Planet' as const, color:'#ffe0a3', magnitude:-4.0, description:'A brilliant world wrapped in reflective clouds.' },
  { id:'mars', name:'Mars', body:Astronomy.Body.Mars, kind:'Planet' as const, color:'#ff806a', magnitude:0.7, description:'The red planet, home to the largest volcano known in the Solar System.' },
  { id:'jupiter', name:'Jupiter', body:Astronomy.Body.Jupiter, kind:'Planet' as const, color:'#ffd39d', magnitude:-2.0, description:'The largest planet, with four bright moons visible through binoculars.' },
  { id:'saturn', name:'Saturn', body:Astronomy.Body.Saturn, kind:'Planet' as const, color:'#ead6a6', magnitude:0.7, description:'A gas giant whose rings are visible through a small telescope.' },
];

export function horizontal(ra: number, dec: number, date: Date, observer: Observer, pmRaCosDec = 0, pmDec = 0) {
  const yearsSinceJ2000 = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 24 * 60 * 60 * 1000);
  const decAtDate = dec + pmDec * yearsSinceJ2000 / 3_600_000;
  const cosDec = Math.cos(dec * Math.PI / 180);
  // Interpret the catalog's RA component as tangent-plane μα* = μα cos(dec), as in Hipparcos.
  const raAtDate = ra + (Math.abs(cosDec) > 1e-8 ? pmRaCosDec / cosDec : 0) * yearsSinceJ2000 / 3_600_000;
  const time = new Astronomy.AstroTime(date);
  const eqj = Astronomy.VectorFromSphere({ lat: decAtDate, lon: raAtDate, dist: 1 }, time);
  const eqd = Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(time), eqj);
  const coordinates = Astronomy.EquatorFromVector(eqd);
  const location = new Astronomy.Observer(observer.latitude, observer.longitude, observer.height ?? 0);
  const result = Astronomy.Horizon(time, location, coordinates.ra, coordinates.dec, 'normal');
  return { altitude: result.altitude, azimuth: result.azimuth };
}

export function calculateSky(observer: Observer, date = new Date()): SkyPoint[] {
  const fixed = [...stars, ...deepSky].map((obj) => ({
    ...obj,
    ...horizontal(obj.ra!, obj.dec!, date, observer, obj.pmRa, obj.pmDec),
  }));
  const location = new Astronomy.Observer(observer.latitude, observer.longitude, observer.height ?? 0);
  const moving = planets.map((planet) => {
    const time = new Astronomy.AstroTime(date);
    const eq = Astronomy.Equator(planet.body, time, location, true, true);
    const hor = Astronomy.Horizon(time, location, eq.ra, eq.dec, 'normal');
    const brightness = Astronomy.Illumination(planet.body, time);
    return {
      id:planet.id, name:planet.name, kind:planet.kind, magnitude:brightness.mag,
      color:planet.color, description:planet.description, altitude:hor.altitude, azimuth:hor.azimuth,
      illumination:brightness.phase_fraction,
    } as SkyPoint;
  });
  const moonTime = new Astronomy.AstroTime(date);
  const moonEq = Astronomy.Equator(Astronomy.Body.Moon, moonTime, location, true, true);
  const moonHor = Astronomy.Horizon(moonTime, location, moonEq.ra, moonEq.dec, 'normal');
  const moonBrightness = Astronomy.Illumination(Astronomy.Body.Moon, moonTime);
  moving.push({
    id:'moon', name:'Moon', kind:'Moon', magnitude:moonBrightness.mag, color:'#d9e2ef',
    description:'Earth’s natural satellite. Its phase and position change throughout the month.',
    altitude:moonHor.altitude, azimuth:moonHor.azimuth,
    illumination:moonBrightness.phase_fraction,
  } as SkyPoint);
  return [...fixed, ...moving];
}

function altitudeAt(object: SkyPoint, date: Date, observer: Observer): number {
  if (Number.isFinite(object.ra) && Number.isFinite(object.dec)) {
    return horizontal(object.ra!, object.dec!, date, observer, object.pmRa, object.pmDec).altitude;
  }
  const body = object.id === 'moon' ? Astronomy.Body.Moon
    : object.id === 'sun' ? Astronomy.Body.Sun
      : planets.find((planet) => planet.id === object.id)?.body;
  if (body === undefined) return Number.NaN;
  const location = new Astronomy.Observer(observer.latitude, observer.longitude, observer.height ?? 0);
  const time = new Astronomy.AstroTime(date);
  const equatorial = Astronomy.Equator(body, time, location, true, true);
  return Astronomy.Horizon(time, location, equatorial.ra, equatorial.dec, 'normal').altitude;
}

function pointAt(object: SkyPoint, date: Date, observer: Observer): SkyPoint | null {
  if (Number.isFinite(object.ra) && Number.isFinite(object.dec)) {
    return { ...object, ...horizontal(object.ra!, object.dec!, date, observer, object.pmRa, object.pmDec) };
  }
  const body = object.id === 'moon' ? Astronomy.Body.Moon
    : object.id === 'sun' ? Astronomy.Body.Sun
      : planets.find((planet) => planet.id === object.id)?.body;
  if (body === undefined) return null;
  const location = new Astronomy.Observer(observer.latitude, observer.longitude, observer.height ?? 0);
  const time = new Astronomy.AstroTime(date);
  const equatorial = Astronomy.Equator(body, time, location, true, true);
  const horizon = Astronomy.Horizon(time, location, equatorial.ra, equatorial.dec, 'normal');
  const illumination = Astronomy.Illumination(body, time);
  return { ...object, magnitude: illumination.mag, altitude: horizon.altitude, azimuth: horizon.azimuth, illumination: illumination.phase_fraction };
}

/** Samples a target's local altitude and azimuth for an offline observing path. */
export function sampleSkyPath(object: SkyPoint, start: Date, observer: Observer, durationHours = 12, stepMinutes = 30): SkyPathSample[] {
  const safeDuration = Math.max(1, Math.min(48, durationHours));
  const safeStep = Math.max(5, Math.min(120, stepMinutes));
  const count = Math.ceil(safeDuration * 60 / safeStep);
  return Array.from({ length: count + 1 }, (_, index) => {
    const time = new Date(start.getTime() + index * safeStep * 60_000);
    const point = pointAt(object, time, observer);
    return { time, altitude: point?.altitude ?? Number.NaN, azimuth: point?.azimuth ?? Number.NaN };
  });
}

/** Ranks easy-to-find targets by their peak altitude during the next astronomical night. */
export function bestTonightTargets(observer: Observer, start: Date, limit = 5): TonightTarget[] {
  const sun: SkyPoint = { id:'sun', name:'Sun', kind:'Sun', magnitude:-26.74, color:'#fff0b2', description:'The Sun.', altitude:0, azimuth:0 };
  const threshold = -18;
  const searchStep = 10 * 60 * 1000;
  const searchEnd = start.getTime() + 36 * 60 * 60 * 1000;
  let previousTime = start.getTime();
  let previousAltitude = altitudeAt(sun, new Date(previousTime), observer);
  let darkStart = previousAltitude <= threshold ? previousTime : null;
  let darkEnd: number | null = null;

  for (let time = previousTime + searchStep; time <= searchEnd; time += searchStep) {
    const altitude = altitudeAt(sun, new Date(time), observer);
    if (darkStart === null && previousAltitude > threshold && altitude <= threshold) darkStart = time;
    else if (darkStart !== null && previousAltitude <= threshold && altitude > threshold) { darkEnd = time; break; }
    previousTime = time;
    previousAltitude = altitude;
  }
  if (darkStart === null) return [];
  // In polar night there may be no dawn crossing in the search range; use a bounded 12-hour planning window.
  darkEnd ??= Math.min(searchEnd, darkStart + 12 * 60 * 60 * 1000);

  const candidates = [
    ...stars.filter((object) => object.magnitude <= 2.5).map((object) => ({ ...object, altitude:0, azimuth:0 } as SkyPoint)),
    ...deepSky.filter((object) => object.magnitude <= 6).map((object) => ({ ...object, altitude:0, azimuth:0 } as SkyPoint)),
    ...planets.filter((object) => object.id !== 'sun').map(({ body: _body, ...object }) => ({ ...object, altitude:0, azimuth:0 } as SkyPoint)),
    { id:'moon', name:'Moon', kind:'Moon' as const, magnitude:-12, color:'#d9e2ef', description:'Earth’s natural satellite. Its phase and position change throughout the month.', altitude:0, azimuth:0 },
  ];
  const step = 30 * 60 * 1000;
  const bestById = new Map<string, { object: SkyPoint; altitude: number; time: number }>();
  for (let time = darkStart; time <= darkEnd; time += step) {
    const date = new Date(time);
    for (const object of candidates) {
      const altitude = altitudeAt(object, date, observer);
      const previous = bestById.get(object.id);
      if (Number.isFinite(altitude) && (!previous || altitude > previous.altitude)) {
        bestById.set(object.id, { object, altitude, time });
      }
    }
  }

  const ranked = [...bestById.values()].filter((candidate) => candidate.altitude >= 15)
    .sort((a, b) => b.altitude - a.altitude || a.object.magnitude - b.object.magnitude)
    .slice(0, Math.max(1, Math.min(20, Math.floor(limit))));
  return ranked.flatMap((candidate) => {
    const point = pointAt(candidate.object, new Date(candidate.time), observer);
    return point ? [{ point, bestAltitude:candidate.altitude, bestTime:new Date(candidate.time) }] : [];
  });
}

/** Finds the next apparent horizon crossing within two days, without network access. */
export function nextHorizonEvent(object: SkyPoint, start: Date, observer: Observer): HorizonEvent | null {
  const intervalMs = 10 * 60 * 1000;
  const maxSteps = 48 * 6;
  let leftTime = new Date(start);
  let leftAltitude = altitudeAt(object, leftTime, observer);
  if (!Number.isFinite(leftAltitude)) return null;
  const rising = leftAltitude < 0;

  for (let step = 1; step <= maxSteps; step += 1) {
    const rightTime = new Date(start.getTime() + step * intervalMs);
    const rightAltitude = altitudeAt(object, rightTime, observer);
    if (!Number.isFinite(rightAltitude)) return null;
    const crossed = rising
      ? leftAltitude < 0 && rightAltitude >= 0
      : leftAltitude >= 0 && rightAltitude < 0;
    if (crossed) {
      const leftWasAbove = leftAltitude >= 0;
      let low = leftTime.getTime();
      let high = rightTime.getTime();
      for (let iteration = 0; iteration < 18; iteration += 1) {
        const middle = (low + high) / 2;
        const middleAbove = altitudeAt(object, new Date(middle), observer) >= 0;
        if (middleAbove === leftWasAbove) low = middle;
        else high = middle;
      }
      return { kind: rising ? 'rise' : 'set', time: new Date((low + high) / 2) };
    }
    leftTime = rightTime;
    leftAltitude = rightAltitude;
  }
  return null;
}

export function compass(degrees: number) {
  const labels = ['N','NE','E','SE','S','SW','W','NW'];
  return labels[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

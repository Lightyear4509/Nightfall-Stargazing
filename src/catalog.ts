export type SkyObject = {
  id: string;
  name: string;
  kind: 'Star' | 'Planet' | 'Moon' | 'Sun' | 'Deep sky';
  constellation?: string;
  ra?: number;
  dec?: number;
  magnitude: number;
  distance?: string;
  color: string;
  description: string;
  favorite?: boolean;
  pmRa?: number;
  pmDec?: number;
  aliases?: string[];
};

// Curated bright stars retain their descriptive copy; a HYG v4.1 magnitude-limited
// catalog is appended below for broad naked-eye coverage.
export const stars: SkyObject[] = [
  { id:'sirius',name:'Sirius',kind:'Star',constellation:'Canis Major',ra:101.287,dec:-16.716,magnitude:-1.46,distance:'8.6 light years',color:'#b9d8ff',description:'The brightest star in Earth’s night sky. Sirius is a nearby binary star system.' },
  { id:'canopus',name:'Canopus',kind:'Star',constellation:'Carina',ra:95.988,dec:-52.696,magnitude:-0.74,distance:'310 light years',color:'#fff1d0',description:'A brilliant supergiant in the southern constellation Carina.' },
  { id:'arcturus',name:'Arcturus',kind:'Star',constellation:'Boötes',ra:213.915,dec:19.182,magnitude:-0.05,distance:'37 light years',color:'#ffd1a1',description:'An orange giant and one of the nearest bright stars.' },
  { id:'vega',name:'Vega',kind:'Star',constellation:'Lyra',ra:279.235,dec:38.784,magnitude:0.03,distance:'25 light years',color:'#c7deff',description:'A bright blue-white star that forms part of the Summer Triangle.' },
  { id:'capella',name:'Capella',kind:'Star',constellation:'Auriga',ra:79.172,dec:45.998,magnitude:0.08,distance:'43 light years',color:'#ffe0a8',description:'A pair of giant stars that appear as one golden point to the unaided eye.' },
  { id:'rigel',name:'Rigel',kind:'Star',constellation:'Orion',ra:78.634,dec:-8.202,magnitude:0.13,distance:'860 light years',color:'#c4dcff',description:'A luminous blue supergiant marking Orion’s foot.' },
  { id:'procyon',name:'Procyon',kind:'Star',constellation:'Canis Minor',ra:114.825,dec:5.225,magnitude:0.34,distance:'11.5 light years',color:'#fff3d3',description:'A nearby binary star and one of the vertices of the Winter Triangle.' },
  { id:'betelgeuse',name:'Betelgeuse',kind:'Star',constellation:'Orion',ra:88.793,dec:7.407,magnitude:0.5,distance:'~550 light years',color:'#ffb78b',description:'A red supergiant marking Orion’s shoulder. Its brightness varies over time.' },
  { id:'altair',name:'Altair',kind:'Star',constellation:'Aquila',ra:297.696,dec:8.868,magnitude:0.77,distance:'17 light years',color:'#e1e9ff',description:'A rapidly rotating star in Aquila and part of the Summer Triangle.' },
  { id:'aldebaran',name:'Aldebaran',kind:'Star',constellation:'Taurus',ra:68.98,dec:16.509,magnitude:0.85,distance:'65 light years',color:'#ffbe8b',description:'The orange eye of Taurus, appearing in front of the Hyades cluster.' },
  { id:'spica',name:'Spica',kind:'Star',constellation:'Virgo',ra:201.298,dec:-11.161,magnitude:0.97,distance:'250 light years',color:'#c5d9ff',description:'A close pair of hot stars and the brightest star in Virgo.' },
  { id:'antares',name:'Antares',kind:'Star',constellation:'Scorpius',ra:247.352,dec:-26.432,magnitude:1.06,distance:'550 light years',color:'#ff9b78',description:'A red supergiant at the heart of Scorpius.' },
  { id:'pollux',name:'Pollux',kind:'Star',constellation:'Gemini',ra:116.329,dec:28.026,magnitude:1.14,distance:'34 light years',color:'#ffd29e',description:'An orange giant and the brighter of the Gemini twin stars.' },
  { id:'fomalhaut',name:'Fomalhaut',kind:'Star',constellation:'Piscis Austrinus',ra:344.413,dec:-29.622,magnitude:1.16,distance:'25 light years',color:'#d8e6ff',description:'A bright nearby star surrounded by a dusty debris ring.' },
  { id:'deneb',name:'Deneb',kind:'Star',constellation:'Cygnus',ra:310.358,dec:45.28,magnitude:1.25,distance:'2,600 light years',color:'#d7e4ff',description:'A distant luminous supergiant completing the Summer Triangle.' },
  { id:'regulus',name:'Regulus',kind:'Star',constellation:'Leo',ra:152.093,dec:11.967,magnitude:1.35,distance:'79 light years',color:'#d6e2ff',description:'The bright heart of Leo, the lion.' },
  { id:'castor',name:'Castor',kind:'Star',constellation:'Gemini',ra:113.65,dec:31.888,magnitude:1.58,distance:'51 light years',color:'#e0e9ff',description:'A striking multiple-star system that marks one of Gemini’s twins.' },
  { id:'polaris',name:'Polaris',kind:'Star',constellation:'Ursa Minor',ra:37.954,dec:89.264,magnitude:1.98,distance:'~448 light years',color:'#fff1d2',description:'The current North Star, lying close to the north celestial pole.' },
  { id:'mizar',name:'Mizar',kind:'Star',constellation:'Ursa Major',ra:200.981,dec:54.925,magnitude:2.23,distance:'83 light years',color:'#e3eaff',description:'A famous naked-eye double with Alcor, in the Big Dipper’s handle.' },
  { id:'algol',name:'Algol',kind:'Star',constellation:'Perseus',ra:47.043,dec:40.956,magnitude:2.12,distance:'90 light years',color:'#dfe8ff',description:'The Demon Star, an eclipsing binary whose brightness changes predictably.' },
];

import hygStars from './data/hyg-stars-v41.json';
import openNgcObjects from './data/openngc-bright-v1.json';

const curatedIds = new Set(stars.map((star) => star.name.toLocaleLowerCase('en')));
stars.push(...hygStars.map((star) => ({
  id: star.id,
  name: star.name,
  kind: 'Star' as const,
  constellation: star.constellation ?? undefined,
  ra: star.ra,
  dec: star.dec,
  magnitude: star.magnitude,
  distance: star.distanceLy ? `${star.distanceLy.toLocaleString()} light years` : undefined,
  color: '#dfe8ff',
  description: `${star.constellation ? `A star in ${star.constellation}` : 'A star'} from the HYG v4.1 catalog, magnitude ${star.magnitude.toFixed(2)}.`,
  pmRa: star.pmRa,
  pmDec: star.pmDec,
})).filter((star) => !curatedIds.has(star.name.toLocaleLowerCase('en'))));

export const deepSky: SkyObject[] = [
  { id:'m31',name:'Andromeda Galaxy',kind:'Deep sky',constellation:'Andromeda',ra:10.685,dec:41.269,magnitude:3.44,distance:'2.5 million light years',color:'#d4c5ff',description:'A neighboring spiral galaxy. Under dark skies, its central glow can be seen without optical aid.' },
  { id:'m42',name:'Orion Nebula',kind:'Deep sky',constellation:'Orion',ra:83.822,dec:-5.391,magnitude:4.0,distance:'1,344 light years',color:'#a6e5df',description:'A nearby stellar nursery visible as a soft patch in Orion’s sword.' },
  { id:'m45',name:'Pleiades',kind:'Deep sky',constellation:'Taurus',ra:56.75,dec:24.117,magnitude:1.6,distance:'444 light years',color:'#b8d6ff',description:'A bright, young star cluster also known as the Seven Sisters.' },
  { id:'m13',name:'Hercules Cluster',kind:'Deep sky',constellation:'Hercules',ra:250.423,dec:36.46,magnitude:5.8,distance:'22,000 light years',color:'#d4bbff',description:'A dense globular cluster containing hundreds of thousands of old stars.' },
  { id:'m8',name:'Lagoon Nebula',kind:'Deep sky',constellation:'Sagittarius',ra:270.925,dec:-24.38,magnitude:6.0,distance:'4,100 light years',color:'#ffb7a1',description:'A large emission nebula and star-forming region in Sagittarius.' },
  { id:'m44',name:'Beehive Cluster',kind:'Deep sky',constellation:'Cancer',ra:130.1,dec:19.667,magnitude:3.7,distance:'577 light years',color:'#ffe3a9',description:'A nearby open cluster of stars, also called Praesepe.' },
];

const curatedDeepSkyIds = new Set(deepSky.map((object) => object.id));
deepSky.push(...openNgcObjects.map((object) => ({ ...object, kind: 'Deep sky' as const })).filter((object) => !curatedDeepSkyIds.has(object.id)));

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { bestTonightTargets, calculateSky, compass, nextHorizonEvent, Observer, SkyPoint } from './src/sky';
import { LocationSessionGuard, PreferenceHydrationGuard } from './src/client-state-guards';
import constellationData from './src/data/iau-constellation-lines-v1.json';

const C = { bg:'#080d14', panel:'#111923', panel2:'#151f2b', line:'#253342', ink:'#e8edf3', muted:'#8493a3', dim:'#536171', accent:'#8cbea9', accent2:'#bedcc8', gold:'#dbc18d', danger:'#d28b80' };
const categories = ['All','Planets','Stars','Deep sky'] as const;
type Category = typeof categories[number];
const constellationLines: [string,string][] = constellationData.lines.flatMap((line) =>
  line.stars.slice(1).map((star, index) => [line.stars[index], star] as [string,string]),
);

export default function App() {
  const { width } = useWindowDimensions();
  const [observer, setObserver] = useState<Observer>({ latitude:40.7128, longitude:-74.006, height:10 });
  const [place, setPlace] = useState('New York, NY');
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SkyPoint | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [redMode, setRedMode] = useState(false);
  const [now, setNow] = useState(new Date());
  const [manualLat, setManualLat] = useState('40.7128');
  const [manualLon, setManualLon] = useState('-74.0060');
  const [showManual, setShowManual] = useState(false);
  const [followLocation, setFollowLocation] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const locationRequestId = useRef(0);
  const locationSessions = useRef(new LocationSessionGuard());
  const hydrationGuard = useRef(new PreferenceHydrationGuard());
  const [appState, setAppState] = useState(AppState.currentState);
  const [tour, setTour] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState<Date | null>(null);
  const dark = redMode ? { ...C, bg:'#120707', panel:'#1b0c0c', panel2:'#261010', line:'#482020', ink:'#ffd9d0', muted:'#b27870', dim:'#75423d', accent:'#f06b5d', accent2:'#ffb1a1', gold:'#dc998d', danger:'#ff8374' } : C;
  const chartColors = redMode
    ? { background:'#160707', sky:'#1e0909', horizon:'#562626', guide:'#482020', cardinal:'#ef6b5e', constellation:'#ab4139', label:'#ffaaa0', star:'#ff8378', planet:'#ffb5a6', deep:'#e78475' }
    : { background:'#071018', sky:'#091722', horizon:'#314451', guide:'#213340', cardinal:'#97a8b2', constellation:'#607c82', label:'#cbd5dd', star:'#b9d8ff', planet:'#ffe0a3', deep:'#d4c5ff' };
  const chart = Math.min(Math.max(width - 36, 310), 560);
  const skyTime = simulatedTime ?? now;
  const sky = useMemo(() => calculateSky(observer, skyTime), [observer, skyTime]);
  const selectedPoint = selected ? sky.find(object => object.id === selected.id) ?? selected : null;
  const horizonEvent = useMemo(() => selectedPoint ? nextHorizonEvent(selectedPoint, skyTime, observer) : null, [selectedPoint, skyTime, observer]);
  const observingDateKey = `${skyTime.getFullYear()}-${skyTime.getMonth()}-${skyTime.getDate()}`;
  const tonightTargets = useMemo(() => bestTonightTargets(observer, skyTime), [observer, simulatedTime, observingDateKey]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', nextState => {
      setAppState(nextState);
      if (nextState === 'active') setNow(new Date());
    });
    return () => appStateSubscription.remove();
  }, []);
  useEffect(() => {
    if (appState !== 'active') return;
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [appState]);
  useEffect(() => {
    AsyncStorage.getItem('observing.saved').then(v => {
      if (v && hydrationGuard.current.mayApplyStoredValue('saved')) setSaved(JSON.parse(v));
    }).catch(() => {});
    AsyncStorage.getItem('observing.nightMode').then(v => {
      if (v !== null && hydrationGuard.current.mayApplyStoredValue('nightMode')) setRedMode(v === 'true');
    }).catch(() => {});
    AsyncStorage.getItem('observing.followLocation').then(v => {
      if (v === 'true' && hydrationGuard.current.mayApplyStoredValue('followLocation')) setFollowLocation(true);
    }).catch(() => {});
    AsyncStorage.getItem('observing.location').then(v => {
      if (!v || !hydrationGuard.current.mayApplyStoredValue('location')) return;
      const stored = JSON.parse(v) as { observer: Observer; place: string };
      if (stored.observer && Number.isFinite(stored.observer.latitude) && Number.isFinite(stored.observer.longitude) && typeof stored.place === 'string') {
        setObserver(stored.observer); setPlace(stored.place);
        setManualLat(stored.observer.latitude.toFixed(4)); setManualLon(stored.observer.longitude.toFixed(4));
      }
    }).catch(() => {});
  }, []);
  const persistSaved = (items: string[]) => { hydrationGuard.current.markEdited('saved'); setSaved(items); AsyncStorage.setItem('observing.saved', JSON.stringify(items)).catch(() => {}); };
  const persistLocation = (next: Observer, label: string) => {
    hydrationGuard.current.markEdited('location');
    setObserver(next); setPlace(label);
    AsyncStorage.setItem('observing.location', JSON.stringify({ observer:next, place:label })).catch(() => {});
  };
  const setFollowPreference = (enabled: boolean) => {
    hydrationGuard.current.markEdited('followLocation');
    setFollowLocation(enabled);
    AsyncStorage.setItem('observing.followLocation', String(enabled)).catch(() => {});
    if (!enabled) setLocationAccuracy(null);
  };
  const stopFollowingLocation = () => {
    locationRequestId.current += 1;
    locationSessions.current.invalidate();
    setFollowPreference(false);
    setLocationAccuracy(null);
  };
  const applyDeviceLocation = (latitude: number, longitude: number, accuracy?: number) => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    persistLocation({ latitude, longitude }, 'Current device location');
    setManualLat(latitude.toFixed(4));
    setManualLon(longitude.toFixed(4));
    if (Number.isFinite(accuracy)) setLocationAccuracy(accuracy!);
  };
  const startFollowingLocation = async () => {
    const requestId = ++locationRequestId.current;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestId !== locationRequestId.current) return;
      if (!permission.granted) {
        Alert.alert('Location permission not granted', 'You can keep using Nightfall Stargazing with manual coordinates.');
        return;
      }
      if (Platform.OS === 'android' && permission.android?.accuracy !== 'fine') {
        Alert.alert('Precise location is needed for accurate sky positioning', 'Enable precise location for Nightfall Stargazing in Android settings, or continue with manual coordinates.');
        return;
      }
      setFollowPreference(true);
    } catch {
      if (requestId !== locationRequestId.current) return;
      Alert.alert('Location unavailable', 'Check your device settings, or continue with manual coordinates.');
    }
  };
  const forgetSavedLocation = () => {
    hydrationGuard.current.markEdited('location');
    stopFollowingLocation();
    AsyncStorage.removeItem('observing.location').catch(() => {});
    const exampleObserver = { latitude:40.7128, longitude:-74.006, height:10 };
    setObserver(exampleObserver);
    setPlace('Example location · New York');
    setManualLat(exampleObserver.latitude.toFixed(4));
    setManualLon(exampleObserver.longitude.toFixed(4));
  };
  useEffect(() => {
    if (!followLocation || appState !== 'active') return;
    let cancelled = false;
    const sessionId = locationSessions.current.begin();
    let locationSubscription: Location.LocationSubscription | null = null;
    let nativeEvents: { remove(): void } | null = null;
    let stopNative: (() => Promise<void>) | null = null;
    const update = (coords: { latitude: number; longitude: number; accuracy?: number | null }) => {
      if (cancelled || !locationSessions.current.isCurrent(sessionId)) return;
      applyDeviceLocation(coords.latitude, coords.longitude, coords.accuracy ?? undefined);
    };
    const start = async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (cancelled || !locationSessions.current.isCurrent(sessionId)) return;
      if (!permission.granted) { stopFollowingLocation(); return; }
      if (Platform.OS === 'android') {
        if (permission.android?.accuracy !== 'fine') { stopFollowingLocation(); return; }
        const { useLocalGnss } = require('./modules/local-gnss') as typeof import('./modules/local-gnss');
        const gnss = useLocalGnss();
        nativeEvents = gnss.addListener(update);
        stopNative = gnss.stop;
        await gnss.start();
        if (cancelled) await gnss.stop();
      } else {
        locationSubscription = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 30_000,
          distanceInterval: 100,
          mayShowUserSettingsDialog: false,
        }, (location) => update(location.coords));
        if (cancelled) locationSubscription.remove();
      }
    };
    start().catch((error: unknown) => {
      if (cancelled || !locationSessions.current.isCurrent(sessionId)) return;
      stopFollowingLocation();
      Alert.alert('Could not start location updates', error instanceof Error ? error.message : 'Check your device location settings and try again.');
    });
    return () => {
      cancelled = true;
      if (locationSessions.current.isCurrent(sessionId)) locationSessions.current.invalidate();
      locationSubscription?.remove();
      nativeEvents?.remove();
      stopNative?.().catch(() => {});
    };
  }, [followLocation, appState]);
  const visible = sky.filter(o => o.altitude > 0).sort((a,b) => b.altitude - a.altitude);
  const filtered = visible.filter(o => {
    const categoryMatch = category === 'All' || (category === 'Planets' && ['Planet','Moon','Sun'].includes(o.kind)) || o.kind === category.replace(/s$/,'');
    return categoryMatch && `${o.name} ${o.aliases?.join(' ') ?? ''} ${o.constellation ?? ''} ${o.kind}`.toLowerCase().includes(query.toLowerCase());
  });
  const saveToggle = (id: string) => persistSaved(saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]);

  const applyManual = () => {
    const lat = Number(manualLat), lon = Number(manualLon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) { Alert.alert('Check coordinates', 'Latitude must be between −90 and 90; longitude between −180 and 180.'); return; }
    stopFollowingLocation();
    persistLocation({ latitude:lat, longitude:lon }, `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`); setShowManual(false);
  };
  const toggleNight = () => { hydrationGuard.current.markEdited('nightMode'); setRedMode(v => { AsyncStorage.setItem('observing.nightMode', String(!v)).catch(() => {}); return !v; }); };
  const project = (o: SkyPoint) => {
    const r = chart * 0.455 * (90 - Math.max(0, Math.min(90, o.altitude))) / 90;
    const a = (o.azimuth - 90) * Math.PI / 180;
    return { x:chart / 2 + r * Math.cos(a), y:chart / 2 + r * Math.sin(a) };
  };
  const plotted = sky.filter(o => o.altitude > 0).map(o => ({ o, ...project(o) }));
  const xy = new Map(plotted.map(p => [p.o.id, p]));
  const timeLabel = skyTime.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
  const dateLabel = skyTime.toLocaleDateString([], { weekday:'long', month:'long', day:'numeric' });
  const shiftTime = (hours: number) => setSimulatedTime(new Date((simulatedTime ?? now).getTime() + hours * 60 * 60 * 1000));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor:dark.bg }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={[styles.page, { maxWidth:width > 900 ? 1120 : 700 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <View style={styles.brand}><View style={[styles.logo, { borderColor:dark.accent }]}><View style={[styles.logoDot,{backgroundColor:dark.accent}]} /></View><Text style={[styles.brandText,{color:dark.ink}]}>NIGHTFALL</Text><Text style={[styles.edition,{color:dark.muted}]}>FIELD GUIDE 01</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={redMode ? 'Turn off red-light mode' : 'Turn on red-light mode'} accessibilityState={{ selected:redMode }} onPress={toggleNight} style={[styles.nightButton,{borderColor:dark.line}]}><Text style={[styles.nightLabel,{color:dark.muted}]}>{redMode ? '◉  NIGHT MODE' : '◐  RED LIGHT'}</Text></Pressable>
        </View>

        <View style={styles.hero}><View><Text style={[styles.eyebrow,{color:dark.accent}]}>YOUR SKY, RIGHT NOW</Text><Text style={[styles.title,{color:dark.ink}]}>Look up.</Text><Text style={[styles.subtitle,{color:dark.muted}]}>The universe is closer than it looks.</Text></View><View style={styles.heroTime}><Text style={[styles.time,{color:dark.ink}]}>{timeLabel}</Text><Text style={[styles.date,{color:dark.muted}]}>{dateLabel}</Text></View></View>

        <View style={[styles.locationCard,{backgroundColor:dark.panel,borderColor:dark.line}]}>
          <View style={styles.locLeft}><Text style={{color:dark.accent,fontSize:16}}>⌖</Text><View><Text style={[styles.locName,{color:dark.ink}]}>{place}</Text><Text style={[styles.locCoords,{color:dark.muted}]}>{observer.latitude.toFixed(4)}°, {observer.longitude.toFixed(4)}° · {locationAccuracy !== null ? `±${Math.round(locationAccuracy)} m` : 'stored on this device'}</Text></View></View>
          <View style={styles.locActions}><Pressable accessibilityRole="button" accessibilityLabel={followLocation ? 'Stop following device location' : 'Use my location'} onPress={() => followLocation ? stopFollowingLocation() : setShowLocationInfo(v => !v)} style={[styles.locateButton,{backgroundColor:dark.accent}]}><Text style={styles.locateText}>{followLocation ? 'Stop following' : 'Use my location'}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={showManual ? 'Close manual coordinates' : 'Enter location manually'} onPress={() => setShowManual(v => !v)} style={[styles.outlineButton,{borderColor:dark.line}]}><Text style={[styles.outlineText,{color:dark.muted}]}>{showManual ? 'Close' : 'Manual'}</Text></Pressable></View>
        </View>
        {showLocationInfo && <View style={[styles.manualBox,{backgroundColor:dark.panel,borderColor:dark.line}]}><Text style={[styles.smallCaps,{color:dark.accent}]}>LOCATION PRIVACY</Text><Text style={[styles.privacyHint,{color:dark.muted,marginTop:0}]}>Nightfall Stargazing uses your location only to calculate the sky and does not send it to an app server. Android uses satellite GNSS while the app is open; web location is handled by your browser. Your operating system or location provider may process location independently under its own privacy settings. You can deny access or use manual coordinates.</Text><View style={[styles.locActions,{marginTop:12}]}><Pressable accessibilityRole="button" onPress={() => { setShowLocationInfo(false); void startFollowingLocation(); }} style={[styles.locateButton,{backgroundColor:dark.accent}]}><Text style={styles.locateText}>Continue to permission</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setShowLocationInfo(false)} style={[styles.outlineButton,{borderColor:dark.line}]}><Text style={[styles.outlineText,{color:dark.muted}]}>Cancel</Text></Pressable></View></View>}
        {followLocation && <Text style={[styles.privacyHint,{color:dark.muted,marginTop:6}]}>Location follows only while Nightfall Stargazing is open. Stop following any time; coordinates are processed and saved on this device.</Text>}
        {showManual && <View style={[styles.manualBox,{backgroundColor:dark.panel,borderColor:dark.line}]}><Text style={[styles.smallCaps,{color:dark.muted}]}>MANUAL COORDINATES · STORED ON THIS DEVICE</Text><View style={styles.manualRow}><TextInput accessibilityLabel="Latitude in decimal degrees" accessibilityHint="Enter a latitude from minus 90 to 90 degrees." value={manualLat} onChangeText={setManualLat} keyboardType="decimal-pad" placeholder="Latitude" placeholderTextColor={dark.dim} style={[styles.input,{color:dark.ink,borderColor:dark.line}]} /><TextInput accessibilityLabel="Longitude in decimal degrees" accessibilityHint="Enter a longitude from minus 180 to 180 degrees." value={manualLon} onChangeText={setManualLon} keyboardType="decimal-pad" placeholder="Longitude" placeholderTextColor={dark.dim} style={[styles.input,{color:dark.ink,borderColor:dark.line}]} /><Pressable accessibilityRole="button" onPress={applyManual} style={[styles.locateButton,{backgroundColor:dark.accent}]}><Text style={styles.locateText}>Apply</Text></Pressable></View><Text style={[styles.privacyHint,{color:dark.muted}]}>The app does not send your coordinates to an app server or location service. Device location access is optional and can be revoked in system settings; the operating system and its location provider have separate privacy controls.</Text><Pressable accessibilityRole="button" onPress={forgetSavedLocation} style={[styles.outlineButton,{borderColor:dark.line,alignSelf:'flex-start',marginTop:10}]}><Text style={[styles.outlineText,{color:dark.muted}]}>Clear saved coordinates</Text></Pressable></View>}

        <View style={[styles.timeControl,{borderColor:dark.line}]}><View><Text style={[styles.smallCaps,{color:dark.muted,marginBottom:3}]}>OBSERVING TIME</Text><Text style={[styles.timeControlValue,{color:dark.ink}]}>{simulatedTime ? 'PLANNING VIEW' : 'LIVE LOCAL TIME'}</Text></View><View style={styles.timeButtons}><Pressable accessibilityRole="button" accessibilityLabel="Move observing time back one hour" onPress={()=>shiftTime(-1)} style={[styles.timeStep,{borderColor:dark.line}]}><Text style={[styles.timeStepText,{color:dark.ink}]}>− 1 hr</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Return to current local time" onPress={()=>setSimulatedTime(null)} style={[styles.timeNow,{backgroundColor:simulatedTime?dark.panel2:dark.accent,borderColor:dark.line}]}><Text style={[styles.timeNowText,{color:simulatedTime?dark.ink:'#12221b'}]}>Now</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Move observing time forward one hour" onPress={()=>shiftTime(1)} style={[styles.timeStep,{borderColor:dark.line}]}><Text style={[styles.timeStepText,{color:dark.ink}]}>+ 1 hr</Text></Pressable></View></View>

        {tour && <Pressable accessibilityRole="button" accessibilityLabel="Close sky guide" onPress={() => setTour(false)} style={[styles.tourCard,{backgroundColor:dark.panel2,borderColor:dark.accent}]}><Text style={[styles.eyebrow,{color:dark.accent}]}>A QUICK WAY TO READ THE SKY · 1 OF 3</Text><Text style={[styles.tourTitle,{color:dark.ink}]}>Start with the brightest points.</Text><Text style={[styles.body,{color:dark.muted}]}>Planets shine steadily, while stars tend to twinkle. Tap any marked object to see what it is and where to find it. Tap here to close.</Text></Pressable>}

        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            <View style={styles.sectionHead}><View><Text style={[styles.sectionTitle,{color:dark.ink}]}>The sky overhead</Text><Text style={[styles.sectionNote,{color:dark.muted}]}>A live local chart · north is up</Text></View><Text style={[styles.livePill,{color:dark.accent,borderColor:dark.line}]}>● LIVE</Text></View>
            <View style={[styles.chartWrap,{backgroundColor:chartColors.background,borderColor:dark.line}]}>
              <Svg width={chart} height={chart} viewBox={`0 0 ${chart} ${chart}`}>
                <Circle cx={chart/2} cy={chart/2} r={chart*.455} fill={chartColors.sky} stroke={chartColors.horizon} strokeWidth="1" />
                {[.68,.36].map(q => <Circle key={q} cx={chart/2} cy={chart/2} r={chart*.455*q} fill="none" stroke={chartColors.guide} strokeWidth="1" strokeDasharray="2 5" />)}
                <Line x1={chart/2} y1={chart*.045} x2={chart/2} y2={chart*.955} stroke={chartColors.guide} strokeWidth="1" />
                <Line x1={chart*.045} y1={chart/2} x2={chart*.955} y2={chart/2} stroke={chartColors.guide} strokeWidth="1" />
                {constellationLines.map(([a,b],i) => { const p=xy.get(a), q=xy.get(b); return p&&q ? <Line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={chartColors.constellation} strokeOpacity=".62" strokeWidth="1" /> : null; })}
                {plotted.map(({o,x,y}) => { const color = redMode ? (o.kind === 'Deep sky' ? chartColors.deep : ['Planet','Moon','Sun'].includes(o.kind) ? chartColors.planet : chartColors.star) : o.color; return <React.Fragment key={o.id}><Circle cx={x} cy={y} r={Math.max(2.1,Math.min(5.5,5.2-o.magnitude*.7))} fill={color} opacity={o.kind==='Deep sky'?.7:1} /><Circle accessible accessibilityLabel={`${o.name}, ${o.kind}, altitude ${o.altitude.toFixed(1)} degrees, azimuth ${compass(o.azimuth)} ${o.azimuth.toFixed(1)} degrees. Select for details.`} cx={x} cy={y} r={11} fill="transparent" onPress={() => setSelected(o)} />{(['sirius','vega','arcturus','betelgeuse','moon','jupiter','venus','m31','m42'].includes(o.id)) && <SvgText x={x+7} y={y-7} fill={chartColors.label} fontSize="9">{o.name}</SvgText>}</React.Fragment>; })}
                <SvgText x={chart/2} y={19} textAnchor="middle" fill={chartColors.cardinal} fontSize="10" letterSpacing="1">N</SvgText><SvgText x={chart-14} y={chart/2+4} textAnchor="middle" fill={chartColors.cardinal} fontSize="10">E</SvgText><SvgText x={chart/2} y={chart-6} textAnchor="middle" fill={chartColors.cardinal} fontSize="10">S</SvgText><SvgText x={14} y={chart/2+4} textAnchor="middle" fill={chartColors.cardinal} fontSize="10">W</SvgText>
              </Svg>
              <View style={styles.chartFoot}><Text style={[styles.chartFootText,{color:dark.muted}]}>HORIZON</Text><Text style={[styles.chartFootText,{color:dark.muted}]}>{visible.length} OBJECTS ABOVE</Text></View>
            </View>
            <View style={styles.legend}><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:chartColors.star}]}/><Text style={[styles.legendText,{color:dark.muted}]}>Stars</Text></View><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:chartColors.planet}]}/><Text style={[styles.legendText,{color:dark.muted}]}>Planets</Text></View><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:chartColors.deep}]}/><Text style={[styles.legendText,{color:dark.muted}]}>Deep sky</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Open sky guide" onPress={() => setTour(v => !v)}><Text style={[styles.guideLink,{color:dark.accent}]}>✦  Sky guide</Text></Pressable></View>
            {selectedPoint && <View style={[styles.detailCard,{backgroundColor:dark.panel,borderColor:dark.accent}]}><View style={styles.detailHeader}><View style={[styles.objectDot,{backgroundColor:selectedPoint.color}]}/><View style={{flex:1}}><Text style={[styles.objectName,{color:dark.ink}]}>{selectedPoint.name}</Text><Text style={[styles.objectMeta,{color:dark.muted}]}>{selectedPoint.kind}{selectedPoint.constellation ? ` · ${selectedPoint.constellation}` : ''}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={saved.includes(selectedPoint.id) ? `Remove ${selectedPoint.name} from saved targets` : `Save ${selectedPoint.name} to targets`} accessibilityState={{ selected:saved.includes(selectedPoint.id) }} onPress={() => saveToggle(selectedPoint.id)}><Text style={[styles.saveIcon,{color:dark.gold}]}>{saved.includes(selectedPoint.id) ? '★' : '☆'}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Close ${selectedPoint.name} details`} onPress={() => setSelected(null)}><Text style={[styles.close,{color:dark.muted}]}>×</Text></Pressable></View><Text style={[styles.body,{color:dark.muted}]}>{selectedPoint.description}</Text><View style={styles.detailStats}><Text style={[styles.statText,{color:dark.ink}]}>{selectedPoint.altitude.toFixed(0)}° alt</Text><Text style={[styles.statText,{color:dark.ink}]}>{compass(selectedPoint.azimuth)} · {selectedPoint.azimuth.toFixed(0)}°</Text><Text style={[styles.statText,{color:dark.ink}]}>{selectedPoint.magnitude.toFixed(1)} mag</Text>{selectedPoint.illumination !== undefined && <Text style={[styles.statText,{color:dark.ink}]}>{Math.round(selectedPoint.illumination * 100)}% illuminated</Text>}</View><Text style={[styles.statText,{color:dark.muted,marginTop:7}]}>{horizonEvent ? `Next ${horizonEvent.kind} · ${horizonEvent.time.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}` : 'No horizon crossing within 48 hours'}</Text><Text style={[styles.statText,{color:dark.dim,marginTop:5}]}>Estimate uses device time; the observing location may use another time zone. Terrain and local atmospheric conditions are not included.</Text></View>}
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.sectionHead}><View><Text style={[styles.sectionTitle,{color:dark.ink}]}>Tonight’s best sights</Text><Text style={[styles.sectionNote,{color:dark.muted}]}>Peak altitude during astronomical darkness</Text></View></View>
            <View style={[styles.objectList,{backgroundColor:dark.panel,borderColor:dark.line}]}>{tonightTargets.map((target,i) => { const o=target.point; return <View key={o.id} style={[styles.objectRow,i!==tonightTargets.length-1&&{borderBottomColor:dark.line,borderBottomWidth:1}]}><Pressable accessibilityRole="button" accessibilityLabel={`${o.name}, ${o.kind}, best altitude ${target.bestAltitude.toFixed(0)} degrees at ${target.bestTime.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}. Show on chart.`} onPress={() => { setSimulatedTime(target.bestTime); setSelected(o); }} style={{flex:1,flexDirection:'row',alignItems:'center',gap:10}}><View style={[styles.objectDot,{backgroundColor:o.color}]}/><View style={{flex:1}}><Text style={[styles.rowName,{color:dark.ink}]}>{o.name}</Text><Text style={[styles.rowMeta,{color:dark.muted}]}>{o.kind} · {target.bestAltitude.toFixed(0)}° at {target.bestTime.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</Text></View></Pressable><Pressable accessibilityRole="button" accessibilityLabel={saved.includes(o.id) ? `Remove ${o.name} from saved targets` : `Save ${o.name} to targets`} accessibilityState={{ selected:saved.includes(o.id) }} hitSlop={8} onPress={() => saveToggle(o.id)}><Text style={[styles.rowSave,{color:saved.includes(o.id)?dark.gold:dark.dim}]}>{saved.includes(o.id)?'★':'☆'}</Text></Pressable></View>; })}{tonightTargets.length===0&&<Text style={[styles.empty,{color:dark.muted}]}>No astronomical darkness or high-rising bright targets are forecast in the next 36 hours.</Text>}</View>

            <View style={[styles.observingCard,{backgroundColor:dark.panel,borderColor:dark.line}]}><View style={styles.miniHead}><Text style={[styles.sectionTitle,{color:dark.ink,fontSize:16}]}>Your field notes</Text><Text style={[styles.savedCount,{color:dark.accent}]}>{saved.length.toString().padStart(2,'0')}</Text></View><Text style={[styles.sectionNote,{color:dark.muted}]}>Objects you’ve saved to find later.</Text>{saved.length ? saved.map(id => { const o=sky.find(x=>x.id===id); return o?<Pressable key={id} accessibilityRole="button" accessibilityLabel={`Show saved target ${o.name}, ${o.kind}`} onPress={()=>setSelected(o)} style={styles.savedRow}><Text style={[styles.savedName,{color:dark.ink}]}>{o.name}</Text><Text style={[styles.savedKind,{color:dark.muted}]}>{o.kind}</Text></Pressable>:null; }) : <Text style={[styles.emptySmall,{color:dark.muted}]}>Tap ☆ on an object to start a list.</Text>}</View>

            <View style={[styles.privacyCard,{borderColor:dark.line}]}><Text style={[styles.privacyTitle,{color:dark.accent}]}>BUILT FOR QUIET SKIES</Text><Text style={[styles.privacyBody,{color:dark.muted}]}>Nightfall Stargazing processes location locally and does not send it to an app server. Device location access is optional, foreground-only, and can be stopped or revoked. The operating system and its location provider have separate privacy controls.</Text></View>
          </View>
        </View>

        <View style={styles.browseHead}><View><Text style={[styles.sectionTitle,{color:dark.ink}]}>Explore the catalog</Text><Text style={[styles.sectionNote,{color:dark.muted}]}>A hand-picked field guide to the brighter sky</Text></View><Text style={[styles.catalogCount,{color:dark.muted}]}>{sky.length} OBJECTS</Text></View>
        <View style={[styles.searchBox,{backgroundColor:dark.panel,borderColor:dark.line}]}><Text accessibilityElementsHidden importantForAccessibility="no" style={{color:dark.muted,fontSize:17}}>⌕</Text><TextInput accessibilityLabel="Search visible sky objects" accessibilityHint="Search stars, planets, constellations, and deep-sky objects." value={query} onChangeText={setQuery} placeholder="Find a star, planet, constellation…" placeholderTextColor={dark.dim} style={[styles.searchInput,{color:dark.ink}]} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map(c=><Pressable key={c} accessibilityRole="button" accessibilityLabel={`Filter catalog by ${c}`} accessibilityState={{ selected:category===c }} onPress={()=>setCategory(c)} style={[styles.chip,{borderColor:category===c?dark.accent:dark.line,backgroundColor:category===c?dark.panel2:'transparent'}]}><Text style={[styles.chipText,{color:category===c?dark.accent:dark.muted}]}>{c}</Text></Pressable>)}</ScrollView>
        <View style={styles.catalogGrid}>{filtered.slice(0,12).map(o=><View key={o.id} style={[styles.catalogCard,{backgroundColor:dark.panel,borderColor:dark.line}]}><Pressable accessibilityRole="button" accessibilityLabel={`${o.name}, ${o.constellation ?? o.kind}, altitude ${o.altitude.toFixed(0)} degrees. Show details.`} onPress={()=>setSelected(o)} style={{flex:1,flexDirection:'row',alignItems:'center',gap:9}}><View style={[styles.objectDot,{backgroundColor:o.color}]}/><View style={{flex:1}}><Text style={[styles.rowName,{color:dark.ink}]} numberOfLines={1}>{o.name}</Text><Text style={[styles.rowMeta,{color:dark.muted}]}>{o.constellation ?? o.kind} · {o.altitude.toFixed(0)}°</Text></View></Pressable><Pressable accessibilityRole="button" accessibilityLabel={saved.includes(o.id) ? `Remove ${o.name} from saved targets` : `Save ${o.name} to targets`} accessibilityState={{ selected:saved.includes(o.id) }} hitSlop={8} onPress={()=>saveToggle(o.id)}><Text style={[styles.rowSave,{color:saved.includes(o.id)?dark.gold:dark.dim}]}>{saved.includes(o.id)?'★':'☆'}</Text></Pressable></View>)}</View>
        <View style={[styles.footer,{borderTopColor:dark.line}]}><Text style={[styles.footerText,{color:dark.dim}]}>NIGHTFALL · FIELD GUIDE 01</Text><Text style={[styles.footerText,{color:dark.dim}]}>Visibility depends on weather, light pollution & your horizon.</Text><Pressable accessibilityRole="button" accessibilityLabel={showSources ? 'Hide catalog and software attributions' : 'Show catalog and software attributions'} accessibilityState={{ expanded:showSources }} onPress={() => setShowSources(value => !value)}><Text style={[styles.footerText,{color:dark.accent}]}>Sources & licenses</Text></Pressable></View>
        {showSources && <View style={[styles.manualBox,{backgroundColor:dark.panel,borderColor:dark.line}]}><Text style={[styles.smallCaps,{color:dark.accent}]}>SOURCES & LICENSES</Text><Text selectable style={[styles.privacyHint,{color:dark.muted,marginTop:0,lineHeight:17}]}>Star catalog: HYG Database v4.1 by David Nash / Astronexus; adapted subset under CC BY-SA 4.0. Deep-sky catalog: OpenNGC by Mattia Verga and contributors; adapted subset under CC BY-SA 4.0. Constellation figures: Alan MacRobert et al. (IAU / Sky & Telescope), machine-readable transcription by Dominic Ford; CC BY 4.0. Solar-system calculations: Astronomy Engine by Donald Cross; MIT. Direct app software dependencies include Expo, React, React Native, React Native Web, react-native-svg, and AsyncStorage; each declares MIT licensing. Catalog subsets and their source links, transformations, versions, and full dependency list are documented in DATA_LICENSES.md in the source repository.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  safe:{flex:1}, page:{width:'100%',alignSelf:'center',paddingHorizontal:20,paddingBottom:44}, topline:{height:64,borderBottomWidth:1,borderBottomColor:'#1d2935',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, brand:{flexDirection:'row',alignItems:'center',gap:10}, logo:{width:25,height:25,borderRadius:13,borderWidth:1,alignItems:'center',justifyContent:'center'},logoDot:{width:6,height:6,borderRadius:3},brandText:{fontSize:12,letterSpacing:2.4,color:'#e8edf3',fontWeight:'700'},edition:{fontSize:9,letterSpacing:1.3,borderLeftWidth:1,borderLeftColor:'#34404e',paddingLeft:10},nightButton:{borderWidth:1,borderRadius:3,paddingVertical:8,paddingHorizontal:10},nightLabel:{fontSize:9,letterSpacing:1.1},hero:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',paddingTop:36,paddingBottom:24},eyebrow:{fontSize:9,letterSpacing:2.1,marginBottom:8},title:{fontFamily:Platform.OS==='ios'?'Georgia':'serif',fontSize:44,letterSpacing:-1.6,lineHeight:50},subtitle:{fontSize:13,marginTop:7},heroTime:{alignItems:'flex-end',paddingBottom:4},time:{fontFamily:Platform.OS==='ios'?'Georgia':'serif',fontSize:24},date:{fontSize:11,marginTop:5},locationCard:{borderWidth:1,borderRadius:5,minHeight:66,paddingHorizontal:14,paddingVertical:11,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},locLeft:{flexDirection:'row',alignItems:'center',gap:11,flexShrink:1},locName:{fontSize:12,fontWeight:'600'},locCoords:{fontSize:9,marginTop:4},locActions:{flexDirection:'row',gap:8},outlineButton:{paddingHorizontal:11,paddingVertical:9,borderWidth:1,borderRadius:3},outlineText:{fontSize:10},locateButton:{paddingHorizontal:12,paddingVertical:10,borderRadius:3,alignItems:'center',justifyContent:'center'},locateText:{fontSize:10,color:'#12221b',fontWeight:'700'},manualBox:{marginTop:9,padding:14,borderRadius:5,borderWidth:1},smallCaps:{fontSize:9,letterSpacing:1.2,marginBottom:9},manualRow:{flexDirection:'row',gap:8},input:{flex:1,minWidth:70,borderWidth:1,borderRadius:3,paddingHorizontal:9,paddingVertical:9,fontSize:12},privacyHint:{fontSize:10,marginTop:9},timeControl:{marginTop:9,paddingVertical:10,paddingHorizontal:13,borderWidth:1,borderRadius:4,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},timeControlValue:{fontSize:10,fontWeight:'600',letterSpacing:.5},timeButtons:{flexDirection:'row',gap:6},timeStep:{borderWidth:1,borderRadius:3,paddingHorizontal:10,paddingVertical:8},timeStepText:{fontSize:10},timeNow:{borderWidth:1,borderColor:'transparent',borderRadius:3,paddingHorizontal:13,paddingVertical:8},timeNowText:{fontSize:10,fontWeight:'700'},tourCard:{marginTop:14,padding:15,borderRadius:4,borderWidth:1},tourTitle:{fontSize:16,fontWeight:'600',marginBottom:6},body:{fontSize:12,lineHeight:19},columns:{flexDirection:'row',gap:24,marginTop:28,flexWrap:'wrap'},mainColumn:{flex:1.25,minWidth:300},sideColumn:{flex:0.9,minWidth:270},sectionHead:{minHeight:43,flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12},sectionTitle:{fontSize:17,fontWeight:'600',letterSpacing:-.3},sectionNote:{fontSize:10,marginTop:4},livePill:{borderWidth:1,borderRadius:3,paddingVertical:5,paddingHorizontal:7,fontSize:8,letterSpacing:1},chartWrap:{position:'relative',width:'100%',alignItems:'center',overflow:'hidden',borderWidth:1,borderRadius:5,paddingVertical:3},chartFoot:{position:'absolute',bottom:8,left:12,right:12,flexDirection:'row',justifyContent:'space-between'},chartFootText:{fontSize:8,letterSpacing:1.2},legend:{flexDirection:'row',alignItems:'center',gap:13,paddingTop:11,paddingBottom:20,flexWrap:'wrap'},legendItem:{flexDirection:'row',alignItems:'center',gap:5},legendDot:{width:6,height:6,borderRadius:3},legendText:{fontSize:9},guideLink:{fontSize:9,marginLeft:'auto'},detailCard:{borderRadius:5,borderWidth:1,padding:14,marginBottom:20},detailHeader:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:9},objectDot:{width:8,height:8,borderRadius:5},objectName:{fontSize:15,fontWeight:'600'},objectMeta:{fontSize:10,marginTop:3},saveIcon:{fontSize:22,paddingHorizontal:3},close:{fontSize:23,paddingHorizontal:5},detailStats:{borderTopWidth:1,borderTopColor:'#26333e',marginTop:12,paddingTop:10,flexDirection:'row',gap:16},statText:{fontSize:10},objectList:{borderRadius:5,borderWidth:1,paddingHorizontal:12},objectRow:{minHeight:55,flexDirection:'row',alignItems:'center',gap:10},rowName:{fontSize:11,fontWeight:'600'},rowMeta:{fontSize:9,marginTop:4},rowSave:{fontSize:19,paddingHorizontal:4},empty:{fontSize:11,lineHeight:17,paddingVertical:18},observingCard:{marginTop:16,borderRadius:5,borderWidth:1,padding:14},miniHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},savedCount:{fontFamily:'serif',fontSize:19},savedRow:{flexDirection:'row',justifyContent:'space-between',paddingTop:12,marginTop:10,borderTopWidth:1,borderTopColor:'#24313e'},savedName:{fontSize:11},savedKind:{fontSize:10},emptySmall:{fontSize:10,marginTop:12},privacyCard:{marginTop:14,paddingTop:13,borderTopWidth:1},privacyTitle:{fontSize:9,letterSpacing:1.5,marginBottom:7},privacyBody:{fontSize:10,lineHeight:16},browseHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginTop:35,marginBottom:13},catalogCount:{fontSize:8,letterSpacing:1.2},searchBox:{height:42,borderWidth:1,borderRadius:4,flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:11},searchInput:{flex:1,height:40,fontSize:11,outlineStyle:'none' as never},chips:{gap:7,paddingVertical:11},chip:{paddingHorizontal:11,paddingVertical:7,borderWidth:1,borderRadius:3},chipText:{fontSize:10},catalogGrid:{flexDirection:'row',flexWrap:'wrap',gap:9},catalogCard:{width:'48%' as never,minWidth:200,flexGrow:1,borderRadius:4,borderWidth:1,padding:11,flexDirection:'row',alignItems:'center',gap:9},footer:{borderTopWidth:1,marginTop:30,paddingTop:12,flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:8},footerText:{fontSize:8,letterSpacing:.6}});

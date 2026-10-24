import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Observer, sampleSkyPath, SkyPoint } from './sky';

type Props = {
  object: SkyPoint;
  observer: Observer;
  start: Date;
  color: string;
  muted: string;
  grid: string;
};

const WIDTH = 320;
const HEIGHT = 118;
const LEFT = 20;
const RIGHT = 10;
const TOP = 10;
const BOTTOM = 22;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

export default function SkyPathChart({ object, observer, start, color, muted, grid }: Props) {
  const samples = useMemo(() => sampleSkyPath(object, start, observer, 12, 30), [object.id, object.ra, object.dec, start.getTime(), observer.latitude, observer.longitude]);
  const coordinates = samples.map((sample, index) => ({
    x: LEFT + (index / Math.max(1, samples.length - 1)) * PLOT_WIDTH,
    y: TOP + ((90 - Math.max(-10, Math.min(90, sample.altitude))) / 100) * PLOT_HEIGHT,
    altitude: sample.altitude,
    time: sample.time,
  })).filter(point => Number.isFinite(point.altitude));
  const path = coordinates.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const peak = coordinates.reduce<typeof coordinates[number] | null>((best, point) => !best || point.altitude > best.altitude ? point : best, null);
  const aboveHorizon = coordinates.some(point => point.altitude > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: muted }]}>12-HOUR SKY PATH</Text>
        <Text style={[styles.meta, { color: muted }]}>{peak && peak.altitude > 0 ? `PEAK ${Math.round(peak.altitude)}°` : 'BELOW HORIZON'}</Text>
      </View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} accessibilityLabel={`${object.name} altitude path over the next twelve hours. ${peak && peak.altitude > 0 ? `Highest point ${Math.round(peak.altitude)} degrees at ${peak.time.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}.` : 'Object remains below the horizon.'}`}>
        {[0, 30, 60].map(altitude => {
          const y = TOP + ((90 - altitude) / 100) * PLOT_HEIGHT;
          return <React.Fragment key={altitude}>
            <Line x1={LEFT} y1={y} x2={WIDTH - RIGHT} y2={y} stroke={altitude === 0 ? color : grid} strokeOpacity={altitude === 0 ? 0.7 : 0.9} strokeWidth={altitude === 0 ? 1.1 : 0.7} strokeDasharray={altitude === 0 ? '0' : '3 4'} />
            <SvgText x={2} y={y + 3} fill={muted} fontSize="8">{altitude}°</SvgText>
          </React.Fragment>;
        })}
        <Path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {peak && peak.altitude > 0 && <Circle cx={peak.x} cy={peak.y} r={3.5} fill={color} stroke="#081018" strokeWidth="1.5" />}
        {[0, 4, 8, 12].map(hour => <SvgText key={hour} x={LEFT + PLOT_WIDTH * hour / 12} y={HEIGHT - 4} textAnchor={hour === 0 ? 'start' : hour === 12 ? 'end' : 'middle'} fill={muted} fontSize="8">{hour === 0 ? 'NOW' : `+${hour}h`}</SvgText>)}
      </Svg>
      <Text style={[styles.note, { color: muted }]}>{peak && peak.altitude > 0 ? `Highest in this window at ${peak.time.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}. The horizon line marks 0° altitude.` : aboveHorizon ? 'This object crosses the horizon during the next 12 hours.' : 'This object stays below the horizon during the next 12 hours.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop:12, paddingTop:11, borderTopWidth:1, borderTopColor:'#26333e' },
  heading: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  title: { fontSize:8, letterSpacing:1.1, fontWeight:'700' },
  meta: { fontSize:8, letterSpacing:0.7 },
  note: { fontSize:9, lineHeight:14, marginTop:2 },
});

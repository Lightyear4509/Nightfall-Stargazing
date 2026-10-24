import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { SkyPoint } from './sky';

type SkyGlobeColors = {
  background: string;
  sky: string;
  horizon: string;
  guide: string;
  cardinal: string;
  constellation: string;
  label: string;
  star: string;
  planet: string;
  deep: string;
};

type Props = {
  objects: SkyPoint[];
  lines: [string, string][];
  size: number;
  selectedId?: string;
  colors: SkyGlobeColors;
  redMode: boolean;
  muted: string;
  panel: string;
  line: string;
  onSelect: (object: SkyPoint) => void;
};

type Orientation = { yaw: number; pitch: number; zoom: number };
type ProjectedPoint = { x: number; y: number; depth: number };

const LABELLED = new Set(['sirius', 'vega', 'arcturus', 'betelgeuse', 'rigel', 'capella', 'polaris', 'altair', 'deneb', 'antares', 'aldebaran', 'spica', 'regulus', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'm31', 'm42', 'm45', 'm13']);
const DEG = Math.PI / 180;

function project(azimuth: number, altitude: number, size: number, orientation: Orientation): ProjectedPoint {
  const az = azimuth * DEG;
  const alt = altitude * DEG;
  const horizontal = Math.cos(alt);
  const x = horizontal * Math.sin(az);
  const y = horizontal * Math.cos(az);
  const z = Math.sin(alt);

  const cy = Math.cos(orientation.yaw), sy = Math.sin(orientation.yaw);
  const yawX = x * cy - y * sy;
  const yawY = x * sy + y * cy;
  const cp = Math.cos(orientation.pitch), sp = Math.sin(orientation.pitch);
  const pitchY = yawY * cp - z * sp;
  const depth = yawY * sp + z * cp;
  const radius = size * 0.425 * orientation.zoom;
  return { x: size / 2 + yawX * radius, y: size / 2 - pitchY * radius, depth };
}

function pathFor(
  samples: Array<[number, number]>,
  size: number,
  orientation: Orientation,
  close = false,
): string {
  const points = samples.map(([az, alt]) => project(az, alt, size, orientation));
  if (points.length === 0) return '';
  return `${points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')}${close ? ' Z' : ''}`;
}

export default function SkyGlobe({ objects, lines, size, selectedId, colors, redMode, muted, panel, line, onSelect }: Props) {
  const [orientation, setOrientation] = useState<Orientation>({ yaw: 0, pitch: 0, zoom: 1 });
  const dragStart = useRef({ yaw: 0, pitch: 0 });
  const radius = size * 0.425 * orientation.zoom;
  const projected = useMemo(() => objects.map(object => ({
    object,
    ...project(object.azimuth, object.altitude, size, orientation),
  })), [objects, orientation, size]);
  const rendered = useMemo(() => [...projected].sort((a, b) => a.depth - b.depth), [projected]);
  const byId = useMemo(() => new Map(projected.map(point => [point.object.id, point])), [projected]);

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) + Math.abs(gesture.dy) > 7,
    onPanResponderGrant: () => { dragStart.current = { yaw: orientation.yaw, pitch: orientation.pitch }; },
    onPanResponderMove: (_event, gesture) => setOrientation(current => ({
      ...current,
      yaw: dragStart.current.yaw + gesture.dx / size * 2.5,
      pitch: Math.max(-1.25, Math.min(1.25, dragStart.current.pitch + gesture.dy / size * 2.5)),
    })),
    onPanResponderTerminationRequest: () => true,
  }), [orientation.pitch, orientation.yaw, size]);

  const horizonPath = pathFor(Array.from({ length: 73 }, (_, index) => [index * 5, 0] as [number, number]), size, orientation, true);
  const altitudePaths = [30, 60].map(altitude => ({
    altitude,
    d: pathFor(Array.from({ length: 73 }, (_, index) => [index * 5, altitude] as [number, number]), size, orientation, true),
  }));
  const meridianPaths = [0, 30, 60, 90, 120, 150].map(azimuth => ({
    azimuth,
    d: pathFor(Array.from({ length: 37 }, (_, index) => [azimuth, -90 + index * 5] as [number, number]), size, orientation),
  }));
  const projectedConstellations = lines.flatMap(([a, b], index) => {
    const first = byId.get(a), second = byId.get(b);
    return first && second ? [{ key: `${a}-${b}-${index}`, first, second }] : [];
  });
  const labelled = projected.filter(({ object }) => LABELLED.has(object.id) || (object.kind === 'Deep sky' && object.magnitude <= 4));
  const selectedPoint = projected.find(point => point.object.id === selectedId);
  const changeZoom = (amount: number) => setOrientation(current => ({ ...current, zoom: Math.max(0.8, Math.min(1.12, current.zoom + amount)) }));
  const reset = () => setOrientation({ yaw: 0, pitch: 0, zoom: 1 });

  return (
    <View style={{ width: '100%', alignItems: 'center' }} {...pan.panHandlers}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Interactive three-dimensional celestial globe. Drag to rotate; use the controls to zoom or reset. Select an object for details.">
        <Defs><RadialGradient id="nightfall-globe-shade" cx="36%" cy="31%" r="78%"><Stop offset="0%" stopColor={colors.sky} /><Stop offset="78%" stopColor={colors.sky} /><Stop offset="100%" stopColor={colors.background} /></RadialGradient></Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="url(#nightfall-globe-shade)" stroke={colors.horizon} strokeWidth="1.2" />
        {altitudePaths.map(({ altitude, d }) => <Path key={`alt-${altitude}`} d={d} fill="none" stroke={colors.guide} strokeWidth=".8" strokeDasharray="2 4" />)}
        {meridianPaths.map(({ azimuth, d }) => <Path key={`az-${azimuth}`} d={d} fill="none" stroke={colors.guide} strokeWidth=".8" strokeDasharray="2 4" />)}
        {projectedConstellations.map(({ key, first, second }) => <Line key={key} x1={first.x} y1={first.y} x2={second.x} y2={second.y} stroke={colors.constellation} strokeOpacity={first.depth < 0 && second.depth < 0 ? '.09' : '.52'} strokeWidth=".8" />)}
        <Path d={horizonPath} fill="none" stroke={colors.horizon} strokeWidth="1.8" strokeDasharray="4 2" />
        {rendered.map(({ object, x, y, depth }) => {
          const color = redMode
            ? (object.kind === 'Deep sky' ? colors.deep : ['Planet', 'Moon', 'Sun'].includes(object.kind) ? colors.planet : colors.star)
            : object.color;
          const radius = object.kind === 'Planet' || object.kind === 'Moon' || object.kind === 'Sun'
            ? Math.max(4, Math.min(7.5, 5.5 - object.magnitude * 0.25))
            : Math.max(1.35, Math.min(4.5, 3.1 - object.magnitude * 0.32));
          const opacity = depth >= 0 ? 1 : 0.18;
          const isSelected = object.id === selectedId;
          return <React.Fragment key={object.id}>
            {isSelected && <Circle cx={x} cy={y} r={radius + 5} fill="none" stroke={colors.cardinal} strokeWidth="1.2" opacity={opacity} />}
            <Circle cx={x} cy={y} r={radius} fill={color} opacity={opacity * (object.kind === 'Deep sky' ? 0.76 : 1)} />
            <Circle accessible accessibilityLabel={`${object.name}, ${object.kind}, altitude ${object.altitude.toFixed(1)} degrees, azimuth ${object.azimuth.toFixed(1)} degrees. Select for details.`} cx={x} cy={y} r={Math.max(8, radius + 4)} fill="transparent" onPress={() => onSelect(object)} />
          </React.Fragment>;
        })}
        {labelled.map(({ object, x, y, depth }) => <SvgText key={`label-${object.id}`} x={x + 6} y={y - 5} fill={colors.label} fillOpacity={depth >= 0 ? 0.96 : 0.3} fontSize="8.5">{object.name}</SvgText>)}
        {[
          { label: 'N', azimuth: 0 }, { label: 'E', azimuth: 90 },
          { label: 'S', azimuth: 180 }, { label: 'W', azimuth: 270 },
        ].map(({ label, azimuth }) => {
          const point = project(azimuth, 0, size, orientation);
          return <SvgText key={label} x={point.x} y={point.y} textAnchor="middle" fill={colors.cardinal} fontSize="9" fontWeight="700">{label}</SvgText>;
        })}
        {selectedPoint && <Circle cx={selectedPoint.x} cy={selectedPoint.y} r={radius + 7} fill="none" stroke={colors.cardinal} strokeWidth=".7" strokeDasharray="2 4" opacity=".65" />}
      </Svg>
      <View pointerEvents="box-none" style={styles.controls}>
        <Text style={[styles.hint, { color: muted, backgroundColor: panel }]}>DRAG TO ORBIT · NORTH-UP SKY GLOBE</Text>
        <View style={styles.buttonRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Zoom out on sky globe" onPress={() => changeZoom(-0.1)} style={[styles.button, { backgroundColor: panel, borderColor: line }]}><Text style={[styles.buttonText, { color: colors.label }]}>−</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Zoom in on sky globe" onPress={() => changeZoom(0.1)} style={[styles.button, { backgroundColor: panel, borderColor: line }]}><Text style={[styles.buttonText, { color: colors.label }]}>+</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Reset sky globe orientation" onPress={reset} style={[styles.reset, { backgroundColor: panel, borderColor: line }]}><Text style={[styles.resetText, { color: colors.label }]}>RESET</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { position: 'absolute', top: 9, right: 9, left: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hint: { borderRadius: 3, paddingHorizontal: 7, paddingVertical: 5, fontSize: 7, letterSpacing: 0.7, overflow: 'hidden' },
  buttonRow: { flexDirection: 'row', gap: 5 },
  button: { width: 27, height: 27, borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 17, lineHeight: 19 },
  reset: { height: 27, paddingHorizontal: 7, borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontSize: 7, letterSpacing: 0.5 },
});

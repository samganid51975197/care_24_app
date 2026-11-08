import styles from "./gangnam-sev-buildings.module.css";

const floors = [
  { id: "5", rooms: "1501~1510 · 1512~1522호", count: 21 },
  { id: "6", rooms: "1601~1622호", count: 22 },
  { id: "7", rooms: "1701~1711호", count: 11 },
  { id: "8", rooms: "1801~1809호", count: 9 },
];

function Rooms({ numbers, vertical = false }: { numbers: string[]; vertical?: boolean }) {
  return <div className={vertical ? styles.firstRoomColumn : styles.firstRoomRow}>
    {numbers.map(number => <div className={styles.firstRoom} key={number}><strong>{number}호</strong></div>)}
  </div>;
}

function LowerFloors({ floor }: { floor: string }) {
  const room = (number: number) => `1${floor}${String(number).padStart(2, "0")}`;
  return <div className={styles.firstLowerPlan}>
    <div className={styles.firstNorth}><Rooms numbers={[8, 7, 6, 5, 4, 3].map(room)}/></div>
    <div className={styles.firstNorthCorridor}>복도 · 휴게실</div>
    <div className={styles.firstUpperCore}><div className={styles.facilities}>공용 구역 · 계단 · 승강기</div><div className={styles.station}>간호사실 (A)</div></div>
    <div className={styles.firstEast}><Rooms numbers={[2, 1].map(room)} vertical/></div>
    <div className={styles.firstCrossCorridor}>복도 · 승강기 연결</div>
    <div className={styles.firstWest}>
      <div className={styles.facilities}>{floor === "5" ? "15 회의실 · 호흡재활센터" : "161 회의실"}</div>
      <Rooms numbers={(floor === "5" ? [10, 9] : [11, 10, 9]).map(room)}/>
      {floor === "6" && <div className={styles.facilities}>척추정보실</div>}
    </div>
    <div className={styles.firstLowerCore}><div className={styles.facilities}>승강기</div><div className={styles.station}>간호사실 (B)</div></div>
    <div className={styles.firstEastFacilities}>계단 · 승강기{floor === "5" && <span>의국</span>}</div>
    <div className={styles.firstSouthCorridor}>복도</div>
    <div className={styles.firstSouth}><Rooms numbers={Array.from({ length: 11 }, (_, index) => room(index + 12))}/></div>
  </div>;
}

function UpperFloors({ floor }: { floor: string }) {
  const seventh = floor === "7";
  return <div className={styles.firstUpperPlan}>
    <div className={styles.firstTreatment}>
      {(seventh
        ? ["도수·통증 물리치료실", "외래·입원 운동치료실", "소아·언어·심리치료 / 인지재활·작업치료실"]
        : ["국제진료센터 · 일일입원실", "휴게실 · 항암주사실 · 온열치료실", "접수 · 다학제실"]
      ).map(label => <div className={styles.facilities} key={label}>{label}</div>)}
    </div>
    <div className={styles.firstUpperLobby}><span>계단 · 승강기 · 복도</span><div className={styles.facilities}>{seventh ? "관절재활치료실" : "외래주사실 · 암예방정보센터"}</div></div>
    <div className={styles.firstWardRing}>
      <Rooms numbers={seventh ? ["1701", "1702", "1703"] : ["1801", "1802"]} vertical/>
      <div className={styles.firstVerticalCorridor}>복도</div>
      <div className={styles.firstWardCore}><div className={styles.facilities}>{seventh ? "보관실 · 준비실" : "휴게실 · 준비실 · 원무"}<br/>계단 · 승강기</div><div className={styles.station}>간호사실{seventh ? " (NS)" : ""}</div><div className={styles.facilities}>{seventh ? "샤워실" : "상담실 · 샤워실"}</div></div>
      <div className={styles.firstVerticalCorridor}>복도</div>
      <Rooms numbers={seventh ? ["1711", "1710"] : ["1809"]} vertical/>
    </div>
    <div className={styles.firstRingCorridor}>복도</div>
    <Rooms numbers={seventh ? ["1704", "1705", "1706", "1707", "1708", "1709"] : ["1803", "1804", "1805", "1806", "1807", "1808"]}/>
  </div>;
}

export default function FirstBuilding({ floor, onSelect }: { floor: string | null; onSelect: (floor: string) => void }) {
  const selected = floors.find(item => item.id === floor);
  return <>
    <h3>1동 층별 입원병실</h3>
    <nav className={styles.floorButtons} aria-label="1동 층별 안내">
      {floors.map(item => <button type="button" key={item.id} aria-pressed={floor === item.id} aria-controls="gangnam-first-plan" onClick={() => onSelect(item.id)}><strong>{item.id}층</strong><span>{item.rooms}</span></button>)}
    </nav>
    <div id="gangnam-first-plan">{selected ? <>
      <h3>1동 {selected.id}층 입원병실 배치</h3>
      <p>{selected.rooms} · 도면에 표시된 병실 {selected.count}개</p>
      <p className={styles.note}>파란색은 입원병실, 진한색은 간호사실입니다. 작은 화면에서는 배치도를 좌우로 이동하세요.</p>
      <div className={styles.planScroll} role="region" aria-label={`1동 ${selected.id}층 입원병실 배치도`} tabIndex={0}>
        {selected.id === "5" || selected.id === "6" ? <LowerFloors floor={selected.id}/> : <UpperFloors floor={selected.id}/>}
      </div>
      <p className={styles.note}>첨부된 층별 도면의 병실 번호와 상대적 위치를 반영한 간략 배치도입니다. 병실 정원은 도면에 표시되어 있지 않습니다.</p>
      {selected.id === "5" && <p className={styles.note}>1511호는 첨부 도면에 표시되어 있지 않아 배치에 포함하지 않았습니다.</p>}
    </> : <p>층을 선택하면 입원병실 배치도가 표시됩니다.</p>}</div>
  </>;
}

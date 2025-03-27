// 機能名: 選手情報参照画面・選手情報削除画面
'use client';

import {
  CustomButton,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  Label,
  Tab,
} from '@/app/components';
import { CustomPlayerAvatar } from '@/app/components/CustomPlayerAvatar';
import FollowButton from '@/app/components/FollowButton';
import { RoundedBadge } from '@/app/components/RoundedBadge';
import { useAuth } from '@/app/hooks/auth';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import { PlayerInformationResponse, RaceResultRecordsResponse } from '@/app/types';
import AddIcon from '@mui/icons-material/Add';
import RowingIcon from '@mui/icons-material/Rowing';
import { Autocomplete, Chip, TextField } from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { formatDate } from '@/app/utils/dateUtil';
import { SortableHeader } from '@/app/components/SortableHeader';
import { useSort } from '@/app/hooks/useSort';

//種目フィルター用
interface EventNameList {
  id: number;
  name: string;
}
//レース名フィルター用
interface RaceNameList {
  id: number;
  name: string;
}
//組別フィルター用
interface ByGroupList {
  id: number;
  name: string;
}
//クルー名フィルター用
interface CrewNameList {
  id: number;
  name: string;
}
//順位フィルター用
interface RankList {
  id: number;
  name: number;
}
//立ち会いフィルター用
interface AttendanceList {
  id: number;
  name: number | null;
}
//シート番号（出漕時点）フィルター用
interface SeatNameList {
  id: number;
  name: string;
}

const playerInformationInitialValue: PlayerInformationResponse = {
  user_id: 0,
  player_id: 0,
  jara_player_id: '',
  player_name: '',
  date_of_birth: null,
  sexName: '',
  sex_id: null,
  height: null,
  weight: null,
  side_info: [],
  birthCountryName: '',
  birth_country: null,
  birthPrefectureName: '',
  birth_prefecture: null,
  residenceCountryName: '',
  residence_country: null,
  residencePrefectureName: '',
  residence_prefecture: null,
  photo: '',
};

const createSortFunctions = (
  handleSort: (key: string, compareFn: (a: any, b: any) => number) => void,
  parseTimeToSeconds: (timeString: string) => number,
) => ({
  tournamentName: () =>
    handleSort('tourn_name', (a, b) => a.tourn_name.localeCompare(b.tourn_name)),
  eventStartDate: () =>
    handleSort(
      'eventStartDate',
      (a, b) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime(),
    ),
  orgName: () =>
    handleSort('org_name', (a, b) => {
      if (!a.org_name) return 1;
      if (!b.org_name) return -1;
      return a.org_name.localeCompare(b.org_name);
    }),
  raceName: () => handleSort('race_name', (a, b) => a.race_name.localeCompare(b.race_name)),
  eventName: () => handleSort('event_name', (a, b) => a.event_name.localeCompare(b.event_name)),
  raceNumber: () =>
    handleSort('race_number', (a, b) => Number(a.race_number) - Number(b.race_number)),
  byGroup: () => handleSort('by_group', (a, b) => a.by_group.localeCompare(b.by_group)),
  crewName: () => handleSort('crew_name', (a, b) => a.crew_name.localeCompare(b.crew_name)),
  rank: () =>
    handleSort('rank', (a, b) => {
      if (!a.rank) return 1;
      if (!b.rank) return -1;
      return Number(a.rank) - Number(b.rank);
    }),
  lapTime500m: () =>
    handleSort('laptime_500m', (a, b) => {
      if (!a.laptime_500m) return 1;
      if (!b.laptime_500m) return -1;
      const timeA = parseTimeToSeconds(String(a.laptime_500m));
      const timeB = parseTimeToSeconds(String(b.laptime_500m));
      return timeA - timeB;
    }),
  lapTime1000m: () =>
    handleSort('laptime_1000m', (a, b) => {
      if (!a.laptime_1000m) return 1;
      if (!b.laptime_1000m) return -1;
      const timeA = parseTimeToSeconds(String(a.laptime_1000m));
      const timeB = parseTimeToSeconds(String(b.laptime_1000m));
      return timeA - timeB;
    }),
  lapTime1500m: () =>
    handleSort('laptime_1500m', (a, b) => {
      if (!a.laptime_1500m) return 1;
      if (!b.laptime_1500m) return -1;
      const timeA = parseTimeToSeconds(String(a.laptime_1500m));
      const timeB = parseTimeToSeconds(String(b.laptime_1500m));
      return timeA - timeB;
    }),
  lapTime2000m: () =>
    handleSort('laptime_2000m', (a, b) => {
      if (!a.laptime_2000m) return 1;
      if (!b.laptime_2000m) return -1;
      const timeA = parseTimeToSeconds(String(a.laptime_2000m));
      const timeB = parseTimeToSeconds(String(b.laptime_2000m));
      return timeA - timeB;
    }),
  lapTimeFinal: () =>
    handleSort('final_time', (a, b) => {
      if (!a.final_time) return 1;
      if (!b.final_time) return -1;
      const timeA = parseTimeToSeconds(String(a.final_time));
      const timeB = parseTimeToSeconds(String(b.final_time));
      return timeA - timeB;
    }),
  averageHeartRate: () =>
    handleSort('stroke_rate_avg', (a, b) => Number(a.stroke_rate_avg) - Number(b.stroke_rate_avg)),
  strokeRate500m: () =>
    handleSort('stroke_rate_500m', (a, b) => Number(a.stroke_rat_500m) - Number(b.stroke_rat_500m)),
  strokeRate1000m: () =>
    handleSort(
      'stroke_rate_1000m',
      (a, b) => Number(a.stroke_rat_1000m) - Number(b.stroke_rat_1000m),
    ),
  strokeRate1500m: () =>
    handleSort(
      'stroke_rate_1500m',
      (a, b) => Number(a.stroke_rat_1500m) - Number(b.stroke_rat_1500m),
    ),
  strokeRate2000m: () =>
    handleSort(
      'stroke_rate_2000m',
      (a, b) => Number(a.stroke_rat_2000m) - Number(b.stroke_rat_2000m),
    ),
  heartRateAvg: () =>
    handleSort('heart_rate_avg', (a, b) => Number(a.heart_rate_avg) - Number(b.heart_rate_avg)),
  heartRate500m: () =>
    handleSort('heart_rate_500m', (a, b) => Number(a.heart_rate_500m) - Number(b.heart_rate_500m)),
  heartRate1000m: () =>
    handleSort(
      'heart_rate_1000m',
      (a, b) => Number(a.heart_rate_1000m) - Number(b.heart_rate_1000m),
    ),
  heartRate1500m: () =>
    handleSort(
      'heart_rate_1500m',
      (a, b) => Number(a.heart_rate_1500m) - Number(b.heart_rate_1500m),
    ),
  heartRate2000m: () =>
    handleSort(
      'heart_rate_2000m',
      (a, b) => Number(a.heart_rate_2000m) - Number(b.heart_rate_2000m),
    ),
  attendance: () => handleSort('attendance', (a, b) => Number(a.attendance) - Number(b.attendance)),
  seatName: () => handleSort('seat_name', (a, b) => a.seat_name.localeCompare(b.seat_name)),
});

// 選手情報参照画面
export default function PlayerInformationRef() {
  // Next.jsのRouterを利用
  const router = useRouter();
  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得 delete
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'delete':
      break;
    default:
      break;
  }

  const isDeleteMode = mode === 'delete';

  // 選手IDを取得
  const playerId: number = parseInt(
    searchParams.get('playerId') || searchParams.get('player_id') || '',
    10,
  );

  if (!playerId) {
    router.push('/mypage/top');
  }

  useUserType({
    onSuccess: (userType) => {
      const hasAuthority = userType.isPlayer && playerId && userType.playerId === playerId;

      if (isDeleteMode && !hasAuthority) {
        router.push('/playerSearch');
      }
    },
  });

  // タブ切り替え用のステート
  const [activeTab, setActiveTab] = useState<number>(0);
  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);
    setSelectedEventNameList([]);
    setSelectedRaceNameList([]);
    setSelectedByGroupList([]);
    setSelectedCrewNameList([]);
    setSelectedRankList([]);
    setSelectedSeatNameList([]);
  };

  const [followStatus, setFollowStatus] = useState({
    isFollowed: false,
    followerCount: 0,
  });

  // エラーハンドリング用のステート
  const [errors, setErrors] = useState<string[]>([]);

  // レース結果情報のデータステート
  const [raceResultRecordsData, setResultRecordsData] = useState([] as RaceResultRecordsResponse[]);

  // 選手情報のデータステート
  const [playerInformation, setPlayerInformation] = useState<PlayerInformationResponse>(
    playerInformationInitialValue,
  );

  // 削除ボタンの表示制御用のステート
  const [displayFlg, setDisplayFlg] = useState<boolean>(true);

  //削除対象のデータをまとめて送信する 20240202
  const [deleteData, setDeleteDatas] = useState({
    playerInformation: playerInformation, //選手情報
    raceResultRecordsData: raceResultRecordsData, //選手の出漕結果情報
  });

  //種目
  const [eventNameList, setEventNameList] = useState([] as EventNameList[]);
  const [selectedEventNameList, setSelectedEventNameList] = useState([] as EventNameList[]);
  //レース名フィルター用
  const [raceNameList, setRaceNameList] = useState([] as RaceNameList[]);
  const [selectedRaceNameList, setSelectedRaceNameList] = useState([] as RaceNameList[]);
  //組別
  const [byGroupList, setByGroupList] = useState([] as ByGroupList[]);
  const [selectedByGroupList, setSelectedByGroupList] = useState([] as ByGroupList[]);
  //クルー名
  const [crewNameList, setCrewNameList] = useState([] as CrewNameList[]);
  const [selectedCrewNameList, setSelectedCrewNameList] = useState([] as CrewNameList[]);
  //順位
  const [rankList, setRankList] = useState([] as RankList[]);
  const [selectedRankList, setSelectedRankList] = useState([] as RankList[]);
  //立ち会い
  const [attendanceList, setAttendanceList] = useState([] as AttendanceList[]);
  const [selectedAttendanceList, setSelectedAttendanceList] = useState([] as AttendanceList[]);
  //シート番号（出漕時点）
  const [seatNameList, setSeatNameList] = useState([] as SeatNameList[]);
  const [selectedSeatNameList, setSelectedSeatNameList] = useState([] as SeatNameList[]);

  // フィルター用のステート 20240724
  const [showEventNameAutocomplete, setShowEventNameAutocomplete] = useState(false); //種目のフィルター実装　20240724
  const [showRaceNameAutocomplete, setShowRaceNameAutocomplete] = useState(false); //レース名のフィルター実装　20240723
  const [showByGroupAutocomplete, setShowByGroupAutocomplete] = useState(false); //組別のフィルター実装　20240724
  const [showCrewNameAutocomplete, setShowCrewNameAutocomplete] = useState(false); //クルー名のフィルター実装　20240724
  const [showRankAutocomplete, setShowRankAutocomplete] = useState(false); //順位のフィルター実装　20240724
  const [showAttendanceAutocomplete, setShowAttendanceAutocomplete] = useState(false); //順位のフィルター実装　20240724
  const [showSeatNameAutocomplete, setShowSeatNameAutocomplete] = useState(false); //シート番号（出漕時点）のフィルター実装　20240724

  const eventNamefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724
  const raceNamefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240723
  const byGroupfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724
  const crewNamefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724
  const rankfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724
  const attendancefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724
  const seatNamefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724

  //種目
  const [selectedEventNameHeader, setSelectedEventNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //レース名のフィルター実装　20240723
  const [selectedRaceNameHeader, setSelectedRaceNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //組別
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //クルー名
  const [selectedCrewNameHeader, setSelectedCrewNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //順位
  const [selectedRankHeader, setSelectedRankHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //立ち会い
  const [selectedAttendanceHeader, setSelectedAttendanceHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //シート番号
  const [selectedSeatNameHeader, setSelectedSeatNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });

  /**
   * 種目ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleEventNameHeaderClick = (value: string, event: React.MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedEventNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowEventNameAutocomplete((prev) => !prev);
  };

  /**
   * レース名ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleRaceNameHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedRaceNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowRaceNameAutocomplete((prev) => !prev);
  };

  /**
   * 組別ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleByGroupHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedByGroupHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowByGroupAutocomplete((prev) => !prev);
  };

  /**
   * クルー名ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleCrewNameHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedCrewNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowCrewNameAutocomplete((prev) => !prev);
  };

  /**
   * 順位ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleRankHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedRankHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowRankAutocomplete((prev) => !prev);
  };

  /**
   *シート番号ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleSeatNameHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedSeatNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowSeatNameAutocomplete((prev) => !prev);
  };

  /**
   *シート番号ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleAttendanceHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedAttendanceHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowAttendanceAutocomplete((prev) => !prev);
  };

  //選手情報削除関数 20240201
  const dataDelete = async () => {
    deleteData.playerInformation = playerInformation;
    deleteData.raceResultRecordsData = raceResultRecordsData;
    await axios
      .post('api/deletePlayerData', deleteData)
      .then((res) => {})
      .catch((error) => {
        setErrors([error.response?.data?.message]);
      });
  };

  // データ取得用のEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const playerInf = await axios.post('api/getPlayerInfoData', {
          playerId,
        });
        //サイド情報のデータ変換
        const sideList = new Array<boolean>(4).fill(false);
        const sideInfo: string | null = playerInf.data.result.side_info;
        if (sideInfo) {
          for (let i = 0; i < 4; i++) {
            sideList[i] = sideInfo.charAt(i + 4) === '1';
          }
        }
        setPlayerInformation({
          player_id: playerInf.data.result.player_id,
          user_id: playerInf.data.result.user_id,
          jara_player_id: playerInf.data.result.jara_player_id,
          player_name: playerInf.data.result.player_name,
          date_of_birth: playerInf.data.result.date_of_birth,
          sexName: playerInf.data.result.sex_name,
          sex_id: playerInf.data.result.sex,
          height: playerInf.data.result.height,
          weight: playerInf.data.result.weight,
          side_info: sideList,
          birthCountryName: playerInf.data.result.birthCountryName,
          birth_country: playerInf.data.result.birth_country,
          birthPrefectureName: playerInf.data.result.birthPrefectureName,
          birth_prefecture: playerInf.data.result.birth_prefecture,
          residenceCountryName: playerInf.data.result.residenceCountryName,
          residence_country: playerInf.data.result.residence_country,
          residencePrefectureName: playerInf.data.result.residencePrefectureName,
          residence_prefecture: playerInf.data.result.residence_prefecture,
          photo: playerInf.data.result.photo,
        });
        const response = await axios.post('api/getRaceResultRecordsData', {
          playerId,
        });
        setResultRecordsData(response.data.result);

        const followStatus = await axios.get('api/getPlayerFollowStatus', {
          params: { player_id: playerId },
        });
        setFollowStatus({
          isFollowed: followStatus.data.result.isFollowed,
          followerCount: followStatus.data.result.followerCount,
        });
      } catch (error: any) {
        setErrors([error.response?.data?.message]);
      }
    };
    fetchData();
  }, [playerId]);

  const handleFollowToggle = () => {
    axios
      .patch('api/playerFollowed', { playerId })
      .then(() => {
        setFollowStatus((prevStatus) => ({
          isFollowed: !prevStatus.isFollowed,
          followerCount: prevStatus.isFollowed
            ? prevStatus.followerCount - 1
            : prevStatus.followerCount + 1,
        }));
      })
      .catch(() => {
        window.alert('フォロー状態の更新に失敗しました:');
      });
  };

  // フィルターのリストを制御する
  const [filteredArray, setFilteredArray] = useState<RaceResultRecordsResponse[]>([]);

  // フィルターのリストを制御する
  useEffect(() => {
    setFilteredArray(
      raceResultRecordsData.filter((row) => {
        //公式・非公式の場合
        if (activeTab === 2) {
          return row.official === 1;
        } else if (activeTab === 1) {
          return row.official === 0;
        } else {
          return true;
        }
      }),
    );
  }, [raceResultRecordsData, activeTab]);

  useEffect(() => {
    //種目をフィルターできるようにする 20240724
    const eventNameArray = filteredArray.map((item) => item.event_name);
    const uniqueEventNameSet = new Set(eventNameArray);
    const uniqueEventNameArray = Array.from(uniqueEventNameSet);
    setEventNameList(
      uniqueEventNameArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );

    //レースno.をフィルターできるようにする 20240718
    const raceNumberArray = filteredArray.map((item) => item.race_name);
    const uniqueRaceNumberSet = new Set(raceNumberArray);
    const uniqueRaceNumberArray = Array.from(uniqueRaceNumberSet);
    setRaceNameList(
      uniqueRaceNumberArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );
    //組別をフィルターできるようにする 20240724
    const byGroupsArray = filteredArray.map((item) => item.by_group);
    const uniqueByGroupsSet = new Set(byGroupsArray);
    const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
    setByGroupList(
      uniqueByGroupsArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );
    //クルー名をフィルターできるようにする 20240724
    const crewNameArray = filteredArray.map((item) => item.crew_name);
    const uniqueCrewNameSet = new Set(crewNameArray);
    const uniqueCrewNameArray = Array.from(uniqueCrewNameSet);
    setCrewNameList(
      uniqueCrewNameArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );
    //順位をフィルターできるようにする 20240724
    const rankArray = filteredArray.map((item) => item.rank).filter((rank) => rank != null);
    const uniqueRankSet = new Set(rankArray);
    const uniqueRankArray = Array.from(uniqueRankSet);
    setRankList(
      uniqueRankArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );
    //立ち会いをフィルターできるようにする 20240724
    const attendanceArray = filteredArray.map((item) => item.attendance);
    const uniqueAttendanceSet = new Set(attendanceArray);
    const uniqueAttendanceArray = Array.from(uniqueAttendanceSet);
    setAttendanceList(
      uniqueAttendanceArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );
    //順位をフィルターできるようにする 20240724
    const seatNameArray = filteredArray.map((item) => item.seat_name);
    const uniqueSeatNameSet = new Set(seatNameArray);
    const uniqueSeatNameArray = Array.from(uniqueSeatNameSet);
    setSeatNameList(
      uniqueSeatNameArray.map((item, index) => ({
        id: index,
        name: item,
      })),
    );
  }, [filteredArray, raceResultRecordsData]);

  const { sortState, handleSort } = useSort<RaceResultRecordsResponse>({
    currentData: filteredArray,
    onSort: setFilteredArray,
  });

  const parseTimeToSeconds = (timeString: string): number => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const sortFunctions = useMemo(
    () => createSortFunctions(handleSort, parseTimeToSeconds),
    [handleSort],
  );

  useEffect(() => {
    if (showEventNameAutocomplete) {
      if (eventNamefocusTarget.current != null) {
        var target = eventNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedEventNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showRaceNameAutocomplete) {
      if (raceNamefocusTarget.current != null) {
        var target = raceNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedRaceNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showByGroupAutocomplete) {
      if (byGroupfocusTarget.current != null) {
        var target = byGroupfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedByGroupList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showCrewNameAutocomplete) {
      if (crewNamefocusTarget.current != null) {
        var target = crewNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedCrewNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showRankAutocomplete) {
      if (rankfocusTarget.current != null) {
        var target = rankfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedRankList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showAttendanceAutocomplete) {
      if (attendancefocusTarget.current != null) {
        var target = attendancefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedAttendanceList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showSeatNameAutocomplete) {
      if (seatNamefocusTarget.current != null) {
        var target = seatNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedSeatNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [
    showRaceNameAutocomplete,
    showEventNameAutocomplete,
    showByGroupAutocomplete,
    showCrewNameAutocomplete,
    showRankAutocomplete,
    showAttendanceAutocomplete,
    showSeatNameAutocomplete,
  ]);

  const { user } = useAuth({
    middleware: 'auth',
  });

  if (typeof playerInformation.player_id === 'undefined') {
    return <ErrorBox errorText={errors} />;
  }

  return (
    <>
      <CustomTitle displayBack>{mode === 'delete' ? '選手情報削除' : '選手情報参照'}</CustomTitle>
      <ErrorBox errorText={errors} />
      <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
        <div className='flex flex-col sm:flex-row gap-[40px]'>
          <div>
            <CustomPlayerAvatar
              fileName={playerInformation.photo}
              alt={playerInformation.player_name}
              sx={{
                width: 200,
                height: 200,
                fontSize: 14,
              }}
            />
          </div>
          <div className='flex flex-col gap-[10px]'>
            <div className='flex flex-col gap-[10px]'>
              {/* 選手名 */}
              <div className='flex gap-2 items-center flex-wrap'>
                <Label
                  label={playerInformation.player_name}
                  textColor='white'
                  textSize='h3'
                ></Label>
                {playerInformation.user_id !== Number(user?.user_id) && (
                  <FollowButton
                    isFollowed={followStatus.isFollowed}
                    handleFollowToggle={handleFollowToggle}
                    followedCount={followStatus.followerCount}
                    icon={RowingIcon}
                    text='選手'
                  />
                )}
              </div>
              <div className='flex flex-row gap-[10px]'>
                <div className='flex flex-row gap-[10px]'>
                  {/* 選手ID */}
                  <div className='text-gray-40 text-caption1'>選手ID</div>
                  <Label
                    label={playerInformation.player_id?.toString()}
                    textColor='white'
                    textSize='caption1'
                  ></Label>
                </div>
                <div className='flex flex-row gap-[10px]'>
                  {/* 既存選手ID */}
                  <div className='text-gray-40 text-caption1'>JARA選手コード</div>
                  <Label
                    label={playerInformation.jara_player_id ?? ''}
                    textColor='white'
                    textSize='caption1'
                  ></Label>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-[10px]'>
              <Label label='プロフィール' textColor='white' textSize='small' isBold={true}></Label>
              <div className='flex flex-col gap-[5px]'>
                <div className='flex flex-row gap-[20px]'>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row'>
                      {/* 性別 */}
                      <div className='text-gray-40 text-caption1'>性別&nbsp;&nbsp;</div>
                      <Label
                        label={playerInformation.sexName}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                    <div className='flex flex-row'>
                      {/* 生年月日 */}
                      <div className='text-gray-40 text-caption1'>生年月日&nbsp;&nbsp;</div>
                      <Label
                        label={formatDate(playerInformation.date_of_birth, 'yyyy/MM/dd') ?? ''}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row'>
                      {/* 身長 */}
                      <div className='text-gray-40 text-caption1'>身長&nbsp;&nbsp;</div>
                      {playerInformation.height && (
                        <>
                          <Label
                            label={playerInformation.height}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                          <div className='text-white text-caption1'>&nbsp;cm</div>
                        </>
                      )}
                    </div>
                    <div className='flex flex-row'>
                      {/* 体重 */}
                      <div className='text-gray-40 text-caption1'>体重&nbsp;&nbsp;</div>
                      {playerInformation.weight && (
                        <>
                          <Label
                            label={playerInformation.weight}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                          <div className='text-gray-40 text-caption1'>&nbsp;kg</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex flex-row'>
                  <div className='text-gray-40 text-caption1'>出身&nbsp;&nbsp;</div>
                  <Label
                    label={playerInformation.birthCountryName}
                    textColor='white'
                    textSize='caption1'
                  ></Label>
                  <div
                    className={
                      !playerInformation.birthPrefectureName ||
                      playerInformation.birthPrefectureName === ''
                        ? 'hidden'
                        : ''
                    }
                  >
                    <Label
                      label={' / ' + playerInformation.birthPrefectureName}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
                </div>
              </div>
              <div className='flex flex-row'>
                <div className='text-gray-40 text-caption1'>居住&nbsp;&nbsp;</div>
                <Label
                  label={playerInformation.residenceCountryName}
                  textColor='white'
                  textSize='caption1'
                ></Label>
                <div
                  className={
                    !playerInformation.residencePrefectureName ||
                    playerInformation.residencePrefectureName === ''
                      ? 'hidden'
                      : ''
                  }
                >
                  <Label
                    label={' / ' + playerInformation.residencePrefectureName}
                    textColor='white'
                    textSize='caption1'
                  ></Label>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-[10px]'>
              {/* サイド情報 */}
              <Label label='サイド情報' textColor='white' textSize='small' isBold={false}></Label>
              <div className='flex flex-row flex-wrap justify-start gap-[10px]'>
                <RoundedBadge
                  label='S（ストロークサイド）'
                  isValid={!!playerInformation.side_info?.at(3)}
                />
                <RoundedBadge
                  label='B（バウサイド）'
                  isValid={!!playerInformation.side_info?.at(2)}
                />
                <RoundedBadge label='X（スカル）' isValid={!!playerInformation.side_info?.at(1)} />
                <RoundedBadge
                  label='C（コックス）'
                  isValid={!!playerInformation.side_info?.at(0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 選手情報表示 */}
      <div className='text-lg mb-4'>
        {/* 出漕結果情報一覧表示 */}
        <div className='mb-4'>
          <div className='flex justify-between items-center'>
            <div className='mb-1 text-2xl lg:text-4xl font-normal'>出漕結果情報一覧</div>
            {/* 個人記録の追加・編集<ボタン */}
            {mode === 'edit' && (
              <CustomButton
                buttonType='primary-outlined'
                onClick={() => {
                  router.push('/playerRaceResultRegister');
                }}
                className='flex flex-row justify-center gap-[4px] w-full'
              >
                <AddIcon />
                <div> 個人記録の追加・編集</div>
              </CustomButton>
            )}
          </div>
          {/* タブ切り替え */}
          <div className='container mx-auto mt-8'>
            <div className='flex'>
              <Tab
                number={0}
                isActive={activeTab === 0}
                onClick={handleTabChange}
                rounded='rounded-l'
              >
                全て
              </Tab>
              <Tab
                number={2}
                isActive={activeTab === 2}
                onClick={handleTabChange}
                rounded='rounded-none'
              >
                公式
              </Tab>
              <Tab
                number={1}
                isActive={activeTab === 1}
                onClick={handleTabChange}
                rounded='rounded-r'
              >
                非公式
              </Tab>
            </div>
          </div>
        </div>
        <div className='overflow-auto h-[auto]'>
          {/* 出漕結果情報一覧テーブル表示 */}
          <CustomTable>
            <CustomThead>
              <CustomTr>
                <CustomTh align='left'>
                  <SortableHeader
                    column='tourn_name'
                    label='大会名'
                    sortState={sortState}
                    onSort={sortFunctions.tournamentName}
                  />
                </CustomTh>
                <CustomTh>公式／非公式</CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='eventStartDate'
                    label='開催日'
                    sortState={sortState}
                    onSort={sortFunctions.eventStartDate}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='org_name'
                    label='所属団体'
                    sortState={sortState}
                    onSort={sortFunctions.orgName}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='race_number'
                    label='レースNo.'
                    sortState={sortState}
                    onSort={sortFunctions.raceNumber}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='event_name'
                    label='種目'
                    sortState={sortState}
                    onSort={sortFunctions.eventName}
                    hasFilter
                    isFiltered={selectedEventNameList.length > 0}
                    onFilter={(event) => handleEventNameHeaderClick('種目', event)}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='race_name'
                    label='レース名'
                    sortState={sortState}
                    onSort={sortFunctions.raceName}
                    hasFilter
                    isFiltered={selectedRaceNameList.length > 0}
                    onFilter={(event) => handleRaceNameHeaderClick('レース名', event)}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='by_group'
                    label='組別'
                    sortState={sortState}
                    onSort={sortFunctions.byGroup}
                    hasFilter
                    isFiltered={selectedByGroupList.length > 0}
                    onFilter={(event) => handleByGroupHeaderClick('組別', event)}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='crew_name'
                    label='クルー名'
                    sortState={sortState}
                    onSort={sortFunctions.crewName}
                    hasFilter
                    isFiltered={selectedCrewNameList.length > 0}
                    onFilter={(event) => handleCrewNameHeaderClick('クルー名', event)}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='rank'
                    label='順位'
                    sortState={sortState}
                    onSort={sortFunctions.rank}
                    hasFilter
                    isFiltered={selectedRankList.length > 0}
                    onFilter={(event) => handleRankHeaderClick('順位', event)}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='laptime_500m'
                    label='500mlapタイム'
                    sortState={sortState}
                    onSort={sortFunctions.lapTime500m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='laptime_1000m'
                    label='1000mlapタイム'
                    sortState={sortState}
                    onSort={sortFunctions.lapTime1000m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='laptime_1500m'
                    label='1500mlapタイム'
                    sortState={sortState}
                    onSort={sortFunctions.lapTime1500m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='laptime_2000m'
                    label='2000mlapタイム'
                    sortState={sortState}
                    onSort={sortFunctions.lapTime2000m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='final_time'
                    label='最終lapタイム'
                    sortState={sortState}
                    onSort={sortFunctions.lapTimeFinal}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='stroke_rate_avg'
                    label='ストロークレート（平均）'
                    sortState={sortState}
                    onSort={sortFunctions.averageHeartRate}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='stroke_rate_500m'
                    label='500mlapストロークレート'
                    sortState={sortState}
                    onSort={sortFunctions.strokeRate500m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='stroke_rate_1000m'
                    label='1000mlapストロークレート'
                    sortState={sortState}
                    onSort={sortFunctions.strokeRate1000m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='stroke_rate_1500m'
                    label='1500mlapストロークレート'
                    sortState={sortState}
                    onSort={sortFunctions.strokeRate1500m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='stroke_rate_2000m'
                    label='2000mlapストロークレート'
                    sortState={sortState}
                    onSort={sortFunctions.strokeRate2000m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='heart_rate_avg'
                    label='心拍数/分（平均）'
                    sortState={sortState}
                    onSort={sortFunctions.heartRateAvg}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='heart_rate_500m'
                    label='500mlap心拍数/分'
                    sortState={sortState}
                    onSort={sortFunctions.heartRate500m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='heart_rate_1000m'
                    label='1000mlap心拍数/分'
                    sortState={sortState}
                    onSort={sortFunctions.heartRate1000m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='heart_rate_1500m'
                    label='1500mlap心拍数/分'
                    sortState={sortState}
                    onSort={sortFunctions.heartRate1500m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='heart_rate_2000m'
                    label='2000mlap心拍数/分'
                    sortState={sortState}
                    onSort={sortFunctions.heartRate2000m}
                  />
                </CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='attendance'
                    label='立ち合い有無'
                    sortState={sortState}
                    onSort={sortFunctions.attendance}
                    hasFilter
                    isFiltered={selectedAttendanceList.length > 0}
                    onFilter={(event) => handleAttendanceHeaderClick('立ち合い有無', event)}
                  />
                </CustomTh>
                <CustomTh>選手身長（出漕時点）</CustomTh>
                <CustomTh>選手体重（出漕時点）</CustomTh>
                <CustomTh>
                  <SortableHeader
                    column='seat_name'
                    label='シート番号（出漕時点）'
                    sortState={sortState}
                    onSort={sortFunctions.seatName}
                    hasFilter
                    isFiltered={selectedSeatNameList.length > 0}
                    onFilter={(event) => handleSeatNameHeaderClick('シート番号（出漕時点）', event)}
                  />
                </CustomTh>
                <CustomTh>出漕結果記録名</CustomTh>
                <CustomTh>発艇日時</CustomTh>
                <CustomTh>1000m地点風速</CustomTh>
                <CustomTh>1000m地点風向</CustomTh>
                <CustomTh>2000m地点風速</CustomTh>
                <CustomTh>2000m地点風向</CustomTh>
              </CustomTr>
            </CustomThead>
            {/* テーブルボディー */}
            <CustomTbody>
              {filteredArray
                .filter((row) => {
                  if (selectedEventNameList.length > 0) {
                    return selectedEventNameList.some((item) => item.name === row.event_name);
                  } else {
                    return true;
                  }
                })
                .filter((row) => {
                  if (selectedRaceNameList.length > 0) {
                    return selectedRaceNameList.some((item) => item.name === row.race_name);
                  } else {
                    return true;
                  }
                })
                .filter((row) => {
                  if (selectedByGroupList.length > 0) {
                    return selectedByGroupList.some((item) => item.name === row.by_group);
                  } else {
                    return true;
                  }
                })
                .filter((row) => {
                  if (selectedCrewNameList.length > 0) {
                    return selectedCrewNameList.some((item) => item.name === row.crew_name);
                  } else {
                    return true;
                  }
                })
                .filter((row) => {
                  if (selectedRankList.length > 0) {
                    return selectedRankList.some((item) => item.name === row.rank);
                  } else {
                    return true;
                  }
                })
                .filter((row) => {
                  if (selectedAttendanceList.length > 0) {
                    return selectedAttendanceList.some((item) => item.name === row.attendance);
                  } else {
                    return true;
                  }
                })
                .filter((row) => {
                  if (selectedSeatNameList.length > 0) {
                    return selectedSeatNameList.some((item) => item.name === row.seat_name);
                  } else {
                    return true;
                  }
                })
                .map((row, index) => (
                  <CustomTr
                    key={index}
                    isHidden={!(row.official + 1 === activeTab || activeTab === 0)}
                  >
                    {/* 大会名 */}
                    <CustomTd>
                      <Link
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        href={{
                          pathname: '/tournamentRef',
                          query: { tournId: row.tourn_id },
                        }}
                      >
                        {row.tourn_name}
                      </Link>
                    </CustomTd>
                    {/* 公式／非公式 */}
                    <CustomTd>{row.official === 0 ? '非公式' : '公式'}</CustomTd>
                    {/* 開催日 */}
                    <CustomTd>{formatDate(row.eventStartDate, 'yyyy/MM/dd')}</CustomTd>
                    {/* 所属団体 */}
                    <CustomTd>
                      <Link
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        href={{
                          pathname: '/teamRef',
                          query: { orgId: row.org_id },
                        }}
                      >
                        {row.org_name}
                      </Link>
                    </CustomTd>
                    {/* レースNo. */}
                    <CustomTd>{row.race_number}</CustomTd>
                    {/* 種目 */}
                    <CustomTd>{row.event_name}</CustomTd>
                    {/* レース名 */}
                    <CustomTd>{row.race_name}</CustomTd>
                    {/* 組別 */}
                    <CustomTd>{row.by_group}</CustomTd>
                    {/* クルー名 */}
                    <CustomTd>{row.crew_name}</CustomTd>
                    {/* 順位 */}
                    <CustomTd>{row.rank}</CustomTd>
                    {/* 500mラップタイム */}
                    <CustomTd>{row.laptime_500m}</CustomTd>
                    {/* 1000mラップタイム */}
                    <CustomTd>{row.laptime_1000m}</CustomTd>
                    {/* 1500mラップタイム */}
                    <CustomTd>{row.laptime_1500m}</CustomTd>
                    {/* 2000mラップタイム */}
                    <CustomTd>{row.laptime_2000m}</CustomTd>
                    {/* 最終タイム */}
                    <CustomTd>{row.final_time}</CustomTd>
                    {/* ストロークレート（平均） */}
                    <CustomTd>{row.stroke_rate_avg}</CustomTd>
                    {/* 500mlapストロークレート */}
                    <CustomTd>{row.stroke_rat_500m}</CustomTd>
                    {/* 1000mlapストロークレート */}
                    <CustomTd>{row.stroke_rat_1000m}</CustomTd>
                    {/* 1500mlapストロークレート */}
                    <CustomTd>{row.stroke_rat_1500m}</CustomTd>
                    {/* 2000mlapストロークレート */}
                    <CustomTd>{row.stroke_rat_2000m}</CustomTd>
                    {/* 心拍数/分（平均） */}
                    <CustomTd>{row.heart_rate_avg}</CustomTd>
                    {/* 500mlap心拍数/分 */}
                    <CustomTd>{row.heart_rate_500m}</CustomTd>
                    {/* 1000mlap心拍数/分 */}
                    <CustomTd>{row.heart_rate_1000m}</CustomTd>
                    {/* 1500mlap心拍数/分 */}
                    <CustomTd>{row.heart_rate_1500m}</CustomTd>
                    {/* 2000mlap心拍数/分 */}
                    <CustomTd>{row.heart_rate_2000m}</CustomTd>
                    {/* 立ち合い有無 */}
                    <CustomTd>
                      {row.attendance === 0 ? '無' : row.attendance === 1 ? '有' : ''}
                    </CustomTd>
                    {/* 選手身長（出漕時点） */}
                    <CustomTd>{row.player_height}</CustomTd>
                    {/* 選手体重（出漕時点） */}
                    <CustomTd>{row.player_weight}</CustomTd>
                    {/* シート番号（出漕時点） */}
                    <CustomTd>{row.seat_name}</CustomTd>
                    {/* 出漕結果記録名 */}
                    <CustomTd>{row.race_result_record_name}</CustomTd>
                    {/* 発艇日時 */}
                    <CustomTd>{formatDate(row.start_datetime, 'yyyy/MM/dd HH:mm')}</CustomTd>
                    {/* 1000m地点風速 */}
                    <CustomTd>{row.wind_speed_1000m_point}</CustomTd>
                    {/* 1000m地点風向 */}
                    <CustomTd>{row.tenHundredmWindDirectionName}</CustomTd>
                    {/* 2000m地点風速 */}
                    <CustomTd>{row.wind_speed_2000m_point}</CustomTd>
                    {/* 2000m地点風向 */}
                    <CustomTd>{row.twentyHundredmWindDirectionName}</CustomTd>
                  </CustomTr>
                ))}
            </CustomTbody>
          </CustomTable>
          {/* 種目フィルター用のオートコンプリート 20240723 */}
          {showEventNameAutocomplete && (
            <div
              ref={eventNamefocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedEventNameHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedEventNameHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowEventNameAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='eventName'
                multiple
                sx={{ width: 300 }}
                options={eventNameList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name?.includes(inputValue))
                }
                value={selectedEventNameList || []}
                onChange={(e: ChangeEvent<{}>, newValue: EventNameList[]) => {
                  setSelectedEventNameList(newValue);
                }}
                renderOption={(props: any, option: EventNameList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: EventNameList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'種目'}
                  />
                )}
              />
            </div>
          )}
          {/* レース名フィルター用のオートコンプリート 20240719 */}
          {showRaceNameAutocomplete && (
            <div
              ref={raceNamefocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedRaceNameHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedRaceNameHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowRaceNameAutocomplete(false)} //フォーカスが外れたら非表示にする 20240719
            >
              <Autocomplete
                id='raceName'
                multiple
                sx={{ width: 300 }}
                options={raceNameList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name?.includes(inputValue))
                }
                value={selectedRaceNameList || []}
                onChange={(e: ChangeEvent<{}>, newValue: RaceNameList[]) => {
                  setSelectedRaceNameList(newValue);
                }}
                renderOption={(props: any, option: RaceNameList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: RaceNameList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'レース名'}
                  />
                )}
              />
            </div>
          )}
          {/* 組別フィルター用のオートコンプリート 20240724 */}
          {showByGroupAutocomplete && (
            <div
              ref={byGroupfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedByGroupHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedByGroupHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowByGroupAutocomplete(false)} //フォーカスが外れたら非表示にする 20240724
            >
              <Autocomplete
                id='byGroup'
                multiple
                sx={{ width: 300 }}
                options={byGroupList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name?.includes(inputValue))
                }
                value={selectedByGroupList || []}
                onChange={(e: ChangeEvent<{}>, newValue: ByGroupList[]) => {
                  setSelectedByGroupList(newValue);
                }}
                renderOption={(props: any, option: ByGroupList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: ByGroupList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'組別'}
                  />
                )}
              />
            </div>
          )}
          {/* クルー名フィルター用のオートコンプリート 20240724 */}
          {showCrewNameAutocomplete && (
            <div
              ref={crewNamefocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedCrewNameHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedCrewNameHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowCrewNameAutocomplete(false)} //フォーカスが外れたら非表示にする 20240724
            >
              <Autocomplete
                id='crewName'
                multiple
                sx={{ width: 300 }}
                options={crewNameList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name?.includes(inputValue))
                }
                value={selectedCrewNameList || []}
                onChange={(e: ChangeEvent<{}>, newValue: CrewNameList[]) => {
                  setSelectedCrewNameList(newValue);
                }}
                renderOption={(props: any, option: CrewNameList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: CrewNameList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'クルー名'}
                  />
                )}
              />
            </div>
          )}
          {/* 順位フィルター用のオートコンプリート 20240724 */}
          {showRankAutocomplete && (
            <div
              ref={rankfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedRankHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedRankHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowRankAutocomplete(false)} //フォーカスが外れたら非表示にする 20240724
            >
              <Autocomplete
                id='rank'
                multiple
                sx={{ width: 300 }}
                options={rankList}
                filterOptions={(options, { inputValue }) =>
                  options.filter(
                    (option) =>
                      option.name != null && option.name.toString().includes(inputValue.toString()),
                  )
                }
                value={selectedRankList || []}
                onChange={(e: ChangeEvent<{}>, newValue: RankList[]) => {
                  setSelectedRankList(newValue);
                }}
                renderOption={(props: any, option: RankList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: RankList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'順位'}
                  />
                )}
              />
            </div>
          )}
          {/* 立ち会いフィルター用のオートコンプリート 20240724 */}
          {showAttendanceAutocomplete && (
            <div
              ref={attendancefocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedAttendanceHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedAttendanceHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowAttendanceAutocomplete(false)} //フォーカスが外れたら非表示にする 20240724
            >
              <Autocomplete
                id='attendance'
                multiple
                sx={{ width: 300 }}
                options={attendanceList}
                filterOptions={(options, { inputValue }) =>
                  options.filter(
                    (option) => option.name?.toString().includes(inputValue.toString()),
                  )
                }
                value={selectedAttendanceList || []}
                onChange={(e: ChangeEvent<{}>, newValue: AttendanceList[]) => {
                  setSelectedAttendanceList(newValue);
                }}
                renderOption={(props: any, option: AttendanceList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === 0 ? '無' : option.name === 1 ? '有' : ''}
                    </li>
                  );
                }}
                renderTags={(value: AttendanceList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === 0 ? '無' : option.name === 1 ? '有' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'立ち会い'}
                  />
                )}
              />
            </div>
          )}
          {/*シート番号フィルター用のオートコンプリート 20240724 */}
          {showSeatNameAutocomplete && (
            <div
              ref={seatNamefocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedSeatNameHeader.position.top - 120}px`,
                right: `max(0px, calc(100vw - ${selectedSeatNameHeader.position.right}px - 300px))`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowSeatNameAutocomplete(false)} //フォーカスが外れたら非表示にする 20240724
            >
              <Autocomplete
                id='seatName'
                multiple
                sx={{ width: 300 }}
                options={seatNameList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name?.includes(inputValue))
                }
                value={selectedSeatNameList || []}
                onChange={(e: ChangeEvent<{}>, newValue: SeatNameList[]) => {
                  setSelectedSeatNameList(newValue);
                }}
                renderOption={(props: any, option: SeatNameList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: SeatNameList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'シート番号（出漕時点）'}
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>
      <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
        {/* 戻るボタン */}
        {window.history.length > 1 && (
          <CustomButton
            buttonType='primary-outlined'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
        )}
        {/* 削除ボタン */}
        {mode === 'delete' && (
          <CustomButton
            buttonType='primary'
            className={`w-[280px] m-auto ${displayFlg ? '' : 'hidden'}`}
            onClick={async () => {
              setDisplayFlg(false);
              const ok = window.confirm('選手情報を削除します。よろしいですか？');
              if (ok) {
                await dataDelete();
                setDisplayFlg(true);
                window.alert('選手情報の削除が完了しました。');
                router.push('/playerSearch');
              } else {
                setDisplayFlg(true);
              }
            }}
          >
            削除
          </CustomButton>
        )}
      </div>
    </>
  );
}

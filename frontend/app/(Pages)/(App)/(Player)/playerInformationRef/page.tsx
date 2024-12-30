// 機能名: 選手情報参照画面・選手情報削除画面
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent, useRef, MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
// コンポーネントのインポート
import {
  CustomButton,
  CustomTable,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTh,
  CustomTd,
  Tab,
  Label,
  CustomTitle,
  ErrorBox,
} from '@/app/components';
import { RoundedBadge } from '@/app/components/RoundedBadge';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import { RaceResultRecordsResponse, PlayerInformationResponse } from '@/app/types';
import { NO_IMAGE_URL, PLAYER_IMAGE_URL } from '@/app/utils/imageUrl';

import { Autocomplete, Chip, TextField } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FollowButton from '@/app/components/FollowButton';
import RowingIcon from '@mui/icons-material/Rowing';

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
  name: number;
}
//シート番号（出漕時点）フィルター用
interface SeatNameList {
  id: number;
  name: string;
}
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

  // 選手IDを取得
  const playerId: number = parseInt(
    searchParams.get('playerId') || searchParams.get('player_id') || '',
  );

  if (!playerId) {
    router.push('/tournamentSearch');
  }

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
  const [error, setError] = useState({ isError: false, errorMessage: '' });

  // レース結果情報のデータステート
  const [raceResultRecordsData, setResultRecordsData] = useState([] as RaceResultRecordsResponse[]);

  // 選手情報のデータステート
  const [playerInformation, setplayerInformation] = useState({} as PlayerInformationResponse);

  // 削除ボタンの表示制御用のステート
  const [displayFlg, setDisplayFlg] = useState<boolean>(true);

  //削除対象のデータをまとめて送信する 20240202
  const [deleteData, setDeleteDatas] = useState({
    playerInformation: playerInformation, //選手情報
    raceResultRecordsData: raceResultRecordsData, //選手の出漕結果情報
  });

  // 大会名のソート用　20240718
  const [tournNameSortFlag, setTournNameSortFlag] = useState(false);
  const tournNameSort = () => {
    if (tournNameSortFlag) {
      setTournNameSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.tourn_name).localeCompare(b.tourn_name));
    } else {
      setTournNameSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.tourn_name).localeCompare(a.tourn_name));
    }
  };
  // 開催日 のソート用　20240722
  const [eventStartDateSortFlag, seteventStartDateSortFlag] = useState(false);
  const eventStartDateSort = () => {
    if (eventStartDateSortFlag) {
      seteventStartDateSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.eventStartDate).localeCompare(b.eventStartDate));
    } else {
      seteventStartDateSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.eventStartDate).localeCompare(a.eventStartDate));
    }
  };
  // 団体名 のソート用　20240722
  const [orgNameSortFlag, setOrgNameSortFlag] = useState(false);
  const orgNameSort = () => {
    if (orgNameSortFlag) {
      setOrgNameSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.org_name).localeCompare(b.org_name));
    } else {
      setOrgNameSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.org_name).localeCompare(a.org_name));
    }
  };
  // レースNo のソート用　20240722
  const [raceNumberSortFlag, setRaceNumberSortFlag] = useState(false);
  const raceNumberSort = () => {
    if (raceNumberSortFlag) {
      setRaceNumberSortFlag(false);
      raceResultRecordsData.sort((a, b) => Number(a.race_number) - Number(b.race_number));
    } else {
      setRaceNumberSortFlag(true);
      raceResultRecordsData.sort((a, b) => Number(b.race_number) - Number(a.race_number));
    }
  };
  // 種目のソート用　20240722
  const [eventNameSortFlag, setEventNameSortFlag] = useState(false);
  const eventNameSort = () => {
    if (eventNameSortFlag) {
      setEventNameSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.event_name).localeCompare(b.event_name));
    } else {
      setEventNameSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.event_name).localeCompare(a.event_name));
    }
  };
  //レース名のソート用　20240722
  const [raceNameSortFlag, setRaceNameSortFlag] = useState(false);
  const raceNameSort = () => {
    if (raceNameSortFlag) {
      setRaceNameSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.race_name).localeCompare(b.race_name));
    } else {
      setRaceNameSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.race_name).localeCompare(a.race_name));
    }
  };
  //組別のソート用　20240722
  const [byGroupSortFlag, setByGroupSortFlag] = useState(false);
  const bygroupSort = () => {
    if (byGroupSortFlag) {
      setByGroupSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.by_group).localeCompare(b.by_group));
    } else {
      setByGroupSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.by_group).localeCompare(a.by_group));
    }
  };
  //クルー名のソート用　20240722
  const [crewNameSortFlag, setCrewNameSortFlag] = useState(false);
  const crewNameSort = () => {
    if (crewNameSortFlag) {
      setCrewNameSortFlag(false);
      raceResultRecordsData.sort((a, b) => ('' + a.crew_name).localeCompare(b.crew_name));
    } else {
      setCrewNameSortFlag(true);
      raceResultRecordsData.sort((a, b) => ('' + b.crew_name).localeCompare(a.crew_name));
    }
  };
  //順位のソート用　20240722
  const [rankSortFlag, setRankSortFlag] = useState(false);
  const rankSort = () => {
    if (rankSortFlag) {
      setRankSortFlag(false);
      raceResultRecordsData.sort((a, b) => Number(a.rank) - Number(b.rank));
    } else {
      setRankSortFlag(true);
      raceResultRecordsData.sort((a, b) => Number(b.rank) - Number(a.rank));
    }
  };
  //500mlapタイムのソート用　20240722
  const [lapTime500mSortFlag, setLapTime500mSortFlag] = useState(false);
  const lapTime500mSort = () => {
    if (lapTime500mSortFlag) {
      setLapTime500mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.laptime_500m.toString().replace(/[.:]/g, '')) -
          Number(b.laptime_500m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setLapTime500mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.laptime_500m.toString().replace(/[.:]/g, '')) -
          Number(a.laptime_500m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //1000mlapタイムのソート用　20240722
  const [lapTime1000mSortFlag, setLapTime1000mSortFlag] = useState(false);
  const lapTime1000mSort = () => {
    if (lapTime1000mSortFlag) {
      setLapTime1000mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.laptime_1000m.toString().replace(/[.:]/g, '')) -
          Number(b.laptime_1000m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setLapTime1000mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.laptime_1000m.toString().replace(/[.:]/g, '')) -
          Number(a.laptime_1000m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //1500mlapタイムのソート用　20240722
  const [lapTime1500mSortFlag, setLapTime1500mSortFlag] = useState(false);
  const lapTime1500mSort = () => {
    if (lapTime1500mSortFlag) {
      setLapTime1500mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.laptime_1500m.toString().replace(/[.:]/g, '')) -
          Number(b.laptime_1500m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setLapTime1500mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.laptime_1500m.toString().replace(/[.:]/g, '')) -
          Number(a.laptime_1500m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //2000mlapタイムのソート用　20240722
  const [lapTime2000mSortFlag, setLapTime2000mSortFlag] = useState(false);
  const lapTime2000mSort = () => {
    if (lapTime2000mSortFlag) {
      setLapTime2000mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.laptime_2000m.toString().replace(/[.:]/g, '')) -
          Number(b.laptime_2000m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setLapTime2000mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.laptime_2000m.toString().replace(/[.:]/g, '')) -
          Number(a.laptime_2000m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //最終lapタイムのソート用　20240722
  const [lapTimeFinalSortFlag, setLapTimeFinalSortFlag] = useState(false);
  const lapTimeFinalSort = () => {
    if (lapTimeFinalSortFlag) {
      setLapTimeFinalSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.final_time.toString().replace(/[.:]/g, '')) -
          Number(b.final_time.toString().replace(/[.:]/g, '')),
      );
    } else {
      setLapTimeFinalSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.final_time.toString().replace(/[.:]/g, '')) -
          Number(a.final_time.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //ストロークレート（平均）のソート用　20240722
  const [averageStrokeRateSortFlag, setAverageStrokeRateSortFlag] = useState(false);
  const averageHeartRateSort = () => {
    if (averageStrokeRateSortFlag) {
      setAverageStrokeRateSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.stroke_rate_avg.toString().replace(/[.:]/g, '')) -
          Number(b.stroke_rate_avg.toString().replace(/[.:]/g, '')),
      );
    } else {
      setAverageStrokeRateSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.stroke_rate_avg.toString().replace(/[.:]/g, '')) -
          Number(a.stroke_rate_avg.toString().replace(/[.:]/g, '')),
      );
    }
  };

  //500mlapストロークレートのソート用　20240722
  const [strokeRate500mSortFlag, setStrokeRate500mSortFlag] = useState(false);
  const strokeRate500mSort = () => {
    if (strokeRate500mSortFlag) {
      setStrokeRate500mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.stroke_rat_500m.toString().replace(/[.:]/g, '')) -
          Number(b.stroke_rat_500m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setStrokeRate500mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.stroke_rat_500m.toString().replace(/[.:]/g, '')) -
          Number(a.stroke_rat_500m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //1000mlapストロークレートのソート用　20240722
  const [strokeRate1000mSortFlag, setStrokeRate1000mSortFlag] = useState(false);
  const strokeRate1000mSort = () => {
    if (strokeRate1000mSortFlag) {
      setStrokeRate1000mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.stroke_rat_1000m.toString().replace(/[.:]/g, '')) -
          Number(b.stroke_rat_1000m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setStrokeRate1000mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.stroke_rat_1000m.toString().replace(/[.:]/g, '')) -
          Number(a.stroke_rat_1000m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //1500mlapストロークレートのソート用　20240722
  const [strokeRate1500mSortFlag, setStrokeRate1500mSortFlag] = useState(false);
  const strokeRate1500mSort = () => {
    if (strokeRate1500mSortFlag) {
      setStrokeRate1500mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.stroke_rat_1500m.toString().replace(/[.:]/g, '')) -
          Number(b.stroke_rat_1500m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setStrokeRate1500mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.stroke_rat_1500m.toString().replace(/[.:]/g, '')) -
          Number(a.stroke_rat_1500m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //2000mlapストロークレートのソート用　20240722
  const [strokeRate2000mSortFlag, setStrokeRate2000mSortFlag] = useState(false);
  const strokeRate2000mSort = () => {
    if (strokeRate2000mSortFlag) {
      setStrokeRate2000mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.stroke_rat_2000m.toString().replace(/[.:]/g, '')) -
          Number(b.stroke_rat_2000m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setStrokeRate2000mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.stroke_rat_2000m.toString().replace(/[.:]/g, '')) -
          Number(a.stroke_rat_2000m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //lap心拍数/分（平均）のソート用　20240722
  const [heartRateAvgSortFlag, setHeartRateAvgSortFlag] = useState(false);
  const heartRateAvgSort = () => {
    if (heartRateAvgSortFlag) {
      setHeartRateAvgSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.heart_rate_avg.toString().replace(/[.:]/g, '')) -
          Number(b.heart_rate_avg.toString().replace(/[.:]/g, '')),
      );
    } else {
      setHeartRateAvgSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.heart_rate_avg.toString().replace(/[.:]/g, '')) -
          Number(a.heart_rate_avg.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //500mlap心拍数/分のソート用　20240722
  const [heartRate500mSortFlag, setHeartRate500mSortFlag] = useState(false);
  const heartRate500mSort = () => {
    if (heartRate500mSortFlag) {
      setHeartRate500mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.heart_rate_500m.toString().replace(/[.:]/g, '')) -
          Number(b.heart_rate_500m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setHeartRate500mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.heart_rate_500m.toString().replace(/[.:]/g, '')) -
          Number(a.heart_rate_500m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //1000mlap心拍数/分のソート用　20240722
  const [heartRate1000mSortFlag, setHeartRate1000mSortFlag] = useState(false);
  const heartRate1000mSort = () => {
    if (heartRate1000mSortFlag) {
      setHeartRate1000mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.heart_rate_1000m.toString().replace(/[.:]/g, '')) -
          Number(b.heart_rate_1000m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setHeartRate1000mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.heart_rate_1000m.toString().replace(/[.:]/g, '')) -
          Number(a.heart_rate_1000m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //1500mlap心拍数/分のソート用　20240722
  const [heartRate1500mSortFlag, setHeartRate1500mSortFlag] = useState(false);
  const heartRate1500mSort = () => {
    if (heartRate1500mSortFlag) {
      setHeartRate1500mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.heart_rate_1500m.toString().replace(/[.:]/g, '')) -
          Number(b.heart_rate_1500m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setHeartRate1500mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.heart_rate_1500m.toString().replace(/[.:]/g, '')) -
          Number(a.heart_rate_1500m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //2000mlap心拍数/分のソート用　20240722
  const [heartRate2000mSortFlag, setHeartRate2000mSortFlag] = useState(false);
  const heartRate2000mSort = () => {
    if (heartRate2000mSortFlag) {
      setHeartRate2000mSortFlag(false);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(a.heart_rate_2000m.toString().replace(/[.:]/g, '')) -
          Number(b.heart_rate_2000m.toString().replace(/[.:]/g, '')),
      );
    } else {
      setHeartRate2000mSortFlag(true);
      raceResultRecordsData.sort(
        (a, b) =>
          Number(b.heart_rate_2000m.toString().replace(/[.:]/g, '')) -
          Number(a.heart_rate_2000m.toString().replace(/[.:]/g, '')),
      );
    }
  };
  //シート番号（出漕時点）のソート用　20240723
  const [seatNameSortFlag, setSeatNameSortFlag] = useState(false);
  const seatNameSort = () => {
    if (seatNameSortFlag) {
      setSeatNameSortFlag(false);
      raceResultRecordsData.sort((a, b) => Number(a.seat_number) - Number(b.seat_number));
    } else {
      setSeatNameSortFlag(true);
      raceResultRecordsData.sort((a, b) => Number(b.seat_number) - Number(a.seat_number));
    }
  };

  //種目
  const [eventNameList, setEventNameList] = useState([] as EventNameList[]);
  const [selectedEventNameList, setSelectedEventNameList] = useState([] as EventNameList[]);
  //レース名のフィルター実装　20240723
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
    position: { top: 0, left: 0 },
  });
  //レース名のフィルター実装　20240723
  const [selectedRaceNameHeader, setSelectedRaceNameHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //組別
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //クルー名
  const [selectedCrewNameHeader, setSelectedCrewNameHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //順位
  const [selectedRankHeader, setSelectedRankHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //立ち会い
  const [selectedAttendanceHeader, setSelectedAttendanceHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //シート番号
  const [selectedSeatNameHeader, setSelectedSeatNameHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });

  /**
   * 種目ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleEventNameHeaderClick = (
    value: string,
    event: MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedEventNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowEventNameAutocomplete(!showEventNameAutocomplete);
    setShowRaceNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowCrewNameAutocomplete(false);
    setShowRankAutocomplete(false);
    setShowSeatNameAutocomplete(false);
    setShowAttendanceAutocomplete(false);
  };
  /**
   * レース名ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleRaceNameHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedRaceNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowRaceNameAutocomplete(!showRaceNameAutocomplete);
    setShowEventNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowCrewNameAutocomplete(false);
    setShowRankAutocomplete(false);
    setShowSeatNameAutocomplete(false);
    setShowAttendanceAutocomplete(false);
  };
  /**
   * 組別ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleByGroupHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedByGroupHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowByGroupAutocomplete(!showByGroupAutocomplete);
    setShowEventNameAutocomplete(false);
    setShowRaceNameAutocomplete(false);
    setShowCrewNameAutocomplete(false);
    setShowRankAutocomplete(false);
    setShowSeatNameAutocomplete(false);
    setShowAttendanceAutocomplete(false);
  };
  /**
   * クルー名ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleCrewNameHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedCrewNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowCrewNameAutocomplete(!showCrewNameAutocomplete);
    setShowEventNameAutocomplete(false);
    setShowRaceNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowRankAutocomplete(false);
    setShowSeatNameAutocomplete(false);
    setShowAttendanceAutocomplete(false);
  };
  /**
   * 順位ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleRankHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedRankHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowRankAutocomplete(!showRankAutocomplete);
    setShowEventNameAutocomplete(false);
    setShowRaceNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowCrewNameAutocomplete(false);
    setShowSeatNameAutocomplete(false);
    setShowAttendanceAutocomplete(false);
  };
  /**
   *シート番号ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleSeatNameHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedSeatNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowSeatNameAutocomplete(!showSeatNameAutocomplete);
    setShowEventNameAutocomplete(false);
    setShowRaceNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowCrewNameAutocomplete(false);
    setShowRankAutocomplete(false);
    setShowAttendanceAutocomplete(false);
  };
  /**
   *シート番号ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleAttendanceHeaderClick = (
    value: string,
    event: MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedAttendanceHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowAttendanceAutocomplete(!showAttendanceAutocomplete);
    setShowEventNameAutocomplete(false);
    setShowRaceNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowCrewNameAutocomplete(false);
    setShowRankAutocomplete(false);
    setShowSeatNameAutocomplete(false);
  };

  //選手情報削除関数 20240201
  const dataDelete = async () => {
    deleteData.playerInformation = playerInformation;
    deleteData.raceResultRecordsData = raceResultRecordsData;
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('api/deletePlayerData', deleteData)
      .then((res) => {
        //console.log(res.data);
      })
      .catch((error) => {
        setError({ isError: true, errorMessage: error.response?.data });
      });
  };

  // データ取得用のEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const playerInf = await axios.post('api/getPlayerInfoData', {
          playerId,
        });
        //console.log(playerInf.data.result);
        //サイド情報のデータ変換
        const sideList = playerInf.data.result.side_info.split('');
        sideList.splice(0, 4); //サイド情報の先頭４つ分の不要なデータを削除
        for (let i = 0; i < 4; i++) {
          if (sideList[i] == '1') {
            sideList[i] = true;
          } else {
            sideList[i] = false;
          }
        }

        setplayerInformation({
          player_id: playerInf.data.result.player_id,
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
        setError({ isError: true, errorMessage: 'API取得エラー:' + error.message });
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
            ? prevStatus.followerCount--
            : prevStatus.followerCount++,
        }));
      })
      .catch(() => {
        window.alert('フォロー状態の更新に失敗しました:');
      });
  };

  // フィルターのリストを制御する
  const [filteredArray, setFilteredArray] = useState([] as RaceResultRecordsResponse[]);

  // フィルターのリストを制御する
  useEffect(() => {
    setFilteredArray(
      raceResultRecordsData.filter((row, index) => {
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
    const eventNameArray = filteredArray.map((item: any) => item.event_name);
    const uniqueEventNameSet = new Set(eventNameArray);
    const uniqueEventNameArray = Array.from(uniqueEventNameSet);
    setEventNameList(
      uniqueEventNameArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );

    //レースno.をフィルターできるようにする 20240718
    const raceNumberArray = filteredArray.map((item: any) => item.race_name);
    const uniqueRaceNumberSet = new Set(raceNumberArray);
    const uniqueRaceNumberArray = Array.from(uniqueRaceNumberSet);
    setRaceNameList(
      uniqueRaceNumberArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //組別をフィルターできるようにする 20240724
    const byGroupsArray = filteredArray.map((item: any) => item.by_group);
    const uniqueByGroupsSet = new Set(byGroupsArray);
    const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
    setByGroupList(
      uniqueByGroupsArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //クルー名をフィルターできるようにする 20240724
    const crewNameArray = filteredArray.map((item: any) => item.crew_name);
    const uniqueCrewNameSet = new Set(crewNameArray);
    const uniqueCrewNameArray = Array.from(uniqueCrewNameSet);
    setCrewNameList(
      uniqueCrewNameArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //順位をフィルターできるようにする 20240724
    const rankArray = filteredArray.map((item: any) => item.rank);
    const uniqueRankSet = new Set(rankArray);
    const uniqueRankArray = Array.from(uniqueRankSet);
    setRankList(
      uniqueRankArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //立ち会いをフィルターできるようにする 20240724
    const attendanceArray = filteredArray.map((item: any) => item.attendance);
    const uniqueAttendanceSet = new Set(attendanceArray);
    const uniqueAttendanceArray = Array.from(uniqueAttendanceSet);
    setAttendanceList(
      uniqueAttendanceArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //順位をフィルターできるようにする 20240724
    const seatNameArray = filteredArray.map((item: any) => item.seat_name);
    const uniqueSeatNameSet = new Set(seatNameArray);
    const uniqueSeatNameArray = Array.from(uniqueSeatNameSet);
    setSeatNameList(
      uniqueSeatNameArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
  }, [filteredArray]);

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

  const headerArray = [
    '大会名',
    '公式／非公式',
    '開催日',
    '所属団体',
    'レースNo.',
    '種目',
    'レース名',
    '組別',
    'クルー名',
    '順位',
    '500mlapタイム',
    '1000mlapタイム',
    '1500mlapタイム',
    '2000mlapタイム',
    '最終lapタイム',
    'ストロークレート（平均）',
    '500mlapストロークレート',
    '1000mlapストロークレート',
    '1500mlapストロークレート',
    '2000mlapストロークレート',
    '心拍数/分（平均）',
    '500mlap心拍数/分',
    '1000mlap心拍数/分',
    '1500mlap心拍数/分',
    '2000mlap心拍数/分',
    '立ち合い有無',
    'エルゴ体重',
    '選手身長（出漕時点）',
    '選手体重（出漕時点）',
    'シート番号（出漕時点）',
    '出漕結果記録名',
    '発艇日時',
    '2000m地点風速',
    '2000m地点風向',
    '1000m地点風速',
    '1000m地点風向',
  ];

  return (
    <>
      <CustomTitle displayBack>{mode === 'delete' ? '選手情報削除' : '選手情報参照'}</CustomTitle>
      <ErrorBox errorText={error.isError ? [error.errorMessage] : []} />
      <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
        <div className='flex flex-col sm:flex-row gap-[40px]'>
          <div>
            {/* 写真 */}
            <img
              src={
                playerInformation.photo
                  ? `${PLAYER_IMAGE_URL}${playerInformation.photo}`
                  : `${NO_IMAGE_URL}`
              }
              width={200}
              height={200}
              alt='Random'
              className='rounded-full'
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
                <FollowButton
                  isFollowed={followStatus.isFollowed}
                  handleFollowToggle={handleFollowToggle}
                  followedCount={followStatus.followerCount}
                  icon={RowingIcon}
                  text='選手'
                />
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
                        label={playerInformation.date_of_birth}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row'>
                      {/* 身長 */}
                      <div className='text-gray-40 text-caption1'>身長&nbsp;&nbsp;</div>
                      <Label
                        label={playerInformation.height?.toString()} // 身長は数値なのでtoString()で文字列に変換
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                      <div className='text-gray-40 text-caption1'>&nbsp;&nbsp;cm</div>
                    </div>
                    <div className='flex flex-row'>
                      {/* 体重 */}
                      <div className='text-gray-40 text-caption1'>体重&nbsp;&nbsp;</div>
                      <Label
                        label={playerInformation.weight?.toString() + ' '} // 体重は数値なのでtoString()で文字列に変換
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                      <div className='text-gray-40 text-caption1'>&nbsp;&nbsp;kg</div>
                    </div>
                  </div>
                </div>
                <div className='flex flex-row'>
                  {/* 出身地（国） */}
                  <div className='text-gray-40 text-caption1'>出身&nbsp;&nbsp;</div>
                  <Label
                    label={playerInformation.birthCountryName}
                    textColor='white'
                    textSize='caption1'
                  ></Label>
                  {/* 出身地（都道府県） */}
                  <div
                    className={
                      !playerInformation.birthPrefectureName ||
                      playerInformation.birthPrefectureName === ''
                        ? 'hidden'
                        : ''
                    }
                  >
                    <Label
                      label={'　/　' + playerInformation.birthPrefectureName}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
                </div>
                <div className='flex flex-row'>
                  <div className='text-gray-40 text-caption1'>居住&nbsp;&nbsp;</div>
                  {/* 居住地（国） */}
                  <Label
                    label={playerInformation.residenceCountryName}
                    textColor='white'
                    textSize='caption1'
                  ></Label>
                  {/* 居住地（都道府県） */}
                  <div
                    className={
                      !playerInformation.residencePrefectureName ||
                      playerInformation.residencePrefectureName === ''
                        ? 'hidden'
                        : ''
                    }
                  >
                    <Label
                      label={'　/　' + playerInformation.residencePrefectureName}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
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
            {/* テーブルヘッダー */}
            <CustomThead>
              <CustomTr>
                {headerArray.map((header, index) => (
                  <CustomTh align='left' key={index}>
                    {header === '大会名' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => tournNameSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '公式／非公式' && header}
                    {header === '開催日' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => eventStartDateSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '所属団体' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => orgNameSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === 'レースNo.' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => raceNumberSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '種目' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div
                          className='underline'
                          style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                          onClick={() => eventNameSort()}
                        >
                          {header}
                        </div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedEventNameList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                          }}
                          onClick={(event) => handleEventNameHeaderClick('種目', event as any)}
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === 'レース名' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div
                          className='underline'
                          style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                          onClick={() => raceNameSort()}
                        >
                          {header}
                        </div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedRaceNameList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                          }}
                          onClick={(event) => handleRaceNameHeaderClick('レース名', event as any)}
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === '組別' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div
                          className='underline'
                          style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                          onClick={() => bygroupSort()}
                        >
                          {header}
                        </div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedByGroupList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                          }}
                          onClick={(event) => handleByGroupHeaderClick('組別', event as any)}
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === 'クルー名' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div
                          className='underline'
                          style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                          onClick={() => crewNameSort()}
                        >
                          {header}
                        </div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedCrewNameList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                          }}
                          onClick={(event) => handleCrewNameHeaderClick('クルー名', event as any)}
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === '順位' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div
                          className='underline'
                          style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                          onClick={() => rankSort()}
                        >
                          {header}
                        </div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedRankList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                          }}
                          onClick={(event) => handleRankHeaderClick('順位', event as any)}
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === '500mlapタイム' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => lapTime500mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '1000mlapタイム' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => lapTime1000mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '1500mlapタイム' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => lapTime1500mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '2000mlapタイム' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => lapTime2000mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '最終lapタイム' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => lapTimeFinalSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === 'ストロークレート（平均）' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => averageHeartRateSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '500mlapストロークレート' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => strokeRate500mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '1000mlapストロークレート' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => strokeRate1000mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '1500mlapストロークレート' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => strokeRate1500mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '2000mlapストロークレート' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => strokeRate2000mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '心拍数/分（平均）' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => heartRateAvgSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '500mlap心拍数/分' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => heartRate500mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '1000mlap心拍数/分' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => heartRate1000mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '1500mlap心拍数/分' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => heartRate1500mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '2000mlap心拍数/分' && (
                      <div
                        className='underline'
                        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                        onClick={() => heartRate2000mSort()}
                      >
                        {header}
                      </div>
                    )}
                    {header === '立ち合い有無' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div>{header}</div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedAttendanceList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                          }}
                          onClick={(event) => handleAttendanceHeaderClick('立ち会い', event as any)}
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === 'エルゴ体重' && header}
                    {header === '選手身長（出漕時点）' && header}
                    {header === '選手体重（出漕時点）' && header}
                    {header === 'シート番号（出漕時点）' && (
                      <div className='flex flex-row items-center gap-[10px]'>
                        <div
                          className='underline'
                          style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                          onClick={() => seatNameSort()}
                        >
                          {header}
                        </div>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: selectedSeatNameList.length > 0 ? '#F44336' : '#001D74',
                          }}
                          onClick={(event) =>
                            handleSeatNameHeaderClick('シート番号（出漕時点）', event as any)
                          }
                        >
                          <FilterListIcon />
                        </div>
                      </div>
                    )}
                    {header === '出漕結果記録名' && header}
                    {header === '発艇日時' && header}
                    {header === '2000m地点風速' && header}
                    {header === '2000m地点風向' && header}
                    {header === '1000m地点風速' && header}
                    {header === '1000m地点風向' && header}
                  </CustomTh>
                ))}
              </CustomTr>
            </CustomThead>
            {/* テーブルボディー */}
            <CustomTbody>
              {raceResultRecordsData
                .filter((row, index) => {
                  if (selectedEventNameList.length > 0) {
                    return selectedEventNameList.some((item) => item.name === row.event_name);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedRaceNameList.length > 0) {
                    return selectedRaceNameList.some((item) => item.name === row.race_name);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedByGroupList.length > 0) {
                    return selectedByGroupList.some((item) => item.name === row.by_group);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedCrewNameList.length > 0) {
                    return selectedCrewNameList.some((item) => item.name === row.crew_name);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedRankList.length > 0) {
                    return selectedRankList.some((item) => item.name === row.rank);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedAttendanceList.length > 0) {
                    return selectedAttendanceList.some((item) => item.name === row.attendance);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
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
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {row.tourn_name}
                      </Link>
                    </CustomTd>
                    {/* 公式／非公式 */}
                    <CustomTd>{row.official === 0 ? '非公式' : '公式'}</CustomTd>
                    {/* 開催日 */}
                    <CustomTd>{row.eventStartDate}</CustomTd>
                    {/* 所属団体 */}
                    <CustomTd>
                      <Link
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        href={{
                          pathname: '/teamRef',
                          query: { orgId: row.org_id },
                        }}
                        rel='noopener noreferrer'
                        target='_blank'
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
                    {/* エルゴ体重 */}
                    <CustomTd>{row.ergo_weight}</CustomTd>
                    {/* 選手身長（出漕時点） */}
                    <CustomTd>{row.player_height}</CustomTd>
                    {/* 選手体重（出漕時点） */}
                    <CustomTd>{row.player_weight}</CustomTd>
                    {/* シート番号（出漕時点） */}
                    <CustomTd>{row.seat_name}</CustomTd>
                    {/* 出漕結果記録名 */}
                    <CustomTd>{row.race_result_record_name}</CustomTd>
                    {/* 発艇日時 */}
                    <CustomTd>{row.start_datetime.substring(0, 16)}</CustomTd>
                    {/* 2000m地点風速 */}
                    <CustomTd>{row.wind_speed_2000m_point}</CustomTd>
                    {/* 2000m地点風向 */}
                    <CustomTd>{row.wind_direction_2000m_point}</CustomTd>
                    {/* 1000m地点風速 */}
                    <CustomTd>{row.wind_speed_1000m_point}</CustomTd>
                    {/* 1000m地点風向 */}
                    <CustomTd>{row.wind_direction_1000m_point}</CustomTd>
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
                left: `${selectedEventNameHeader.position.left}px`,
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
                left: `${selectedRaceNameHeader.position.left}px`,
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
                left: `${selectedByGroupHeader.position.left}px`,
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
                left: `${selectedCrewNameHeader.position.left}px`,
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
                left: `${selectedRankHeader.position.left}px`,
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
                options={rankList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name.toString().includes(inputValue.toString()))
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
                left: `${selectedAttendanceHeader.position.left}px`,
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
                options={attendanceList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name.toString().includes(inputValue.toString()))
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
                left: `${selectedSeatNameHeader.position.left}px`,
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
            onClick={() => {
              setDisplayFlg(false);
              window.confirm('選手情報を削除します。よろしいですか？')
                ? //okを押したら下の処理を実行 キャンセルを押したらflagをtrueにしてそのまま
                  (dataDelete(),
                  setDisplayFlg(true),
                  window.alert('選手情報の削除が完了しました。'),
                  router.push('/tournamentSearch')) //大会検索画面に遷移する 20240222
                : //router.push('/myPage') : setDisplayFlg(true)
                  setDisplayFlg(true);
            }}
          >
            削除
          </CustomButton>
        )}
      </div>
    </>
  );
}

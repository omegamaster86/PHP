// 機能名: ボランティア情報参照画面・ボランティア情報削除画面
'use client';

import React, { useEffect, useState, ChangeEvent, useRef, MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import {
  ErrorBox,
  CustomTitle,
  InputLabel,
  CustomButton,
  CustomTextField,
  OriginalCheckbox,
  Tab,
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
} from '@/app/components';
import axios from '@/app/lib/axios';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { VolunteerResponse, VolunteerHistoriesResponse, UserIdType } from '@/app/types';

import { Autocomplete, Chip, TextField } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

//ADフィルター用
interface ADList {
  id: number;
  name: string;
}
//祝日フィルター用
interface HolidayList {
  id: number;
  name: boolean;
}
//日曜フィルター用
interface SundayList {
  id: number;
  name: boolean;
}

//月曜フィルター用
interface MondayList {
  id: number;
  name: boolean;
}
//火曜フィルター用
interface TuesdayList {
  id: number;
  name: boolean;
}
//水曜フィルター用
interface WednesdayList {
  id: number;
  name: boolean;
}
//木曜フィルター用
interface ThursdayList {
  id: number;
  name: boolean;
}
//日曜フィルター用
interface FridayList {
  id: number;
  name: boolean;
}
//土曜フィルター用
interface SaturdayList {
  id: number;
  name: boolean;
}

export default function VolunteerInformationRef() {
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20241216
  const [volunteerdata, setVolunteerdata] = useState({} as VolunteerResponse);
  const [volunteerHistoriesdata, setVolunteerHistoriesdata] = useState(
    [] as VolunteerHistoriesResponse[],
  );
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // なし(参照), deleteの2モード
  switch (mode) {
    case 'delete':
      break;
    default:
      // デフォルトは参照モード
      break;
  }

  // ボランティアIDを取得
  const volunteerId = searchParams.get('volunteer_id')?.toString() || '';
  switch (volunteerId) {
    case '':
      break;
    default:
      break;
  }
  const [volunteer_id, setVolunteerId] = useState<any>({
    volunteer_id: volunteerId,
  });

  /**
   * @param binaryString
   * @param index
   * @returns
   * @description
   * 12桁の2進数文字列を受け取り、index番目の値をbool型で返す。
   * indexが12桁より大きい場合、undefinedを返す。
   * @example
   * getDayOfWeekBool('001110000000', 0) // false
   * getDayOfWeekBool('001110000000', 1) // false
   * getDayOfWeekBool('001110000000', 2) // false
   * getDayOfWeekBool('001110000000', 3) // true
   * getDayOfWeekBool('001110000000', 4) // true
   * getDayOfWeekBool('001110000000', 5) // true
   * getDayOfWeekBool('001110000000', 6) // false
   */
  const getDayOfWeekBool = (binaryString: string, index: number) => {
    if (binaryString == undefined) {
      return;
    }
    if (binaryString.length !== 12) {
      return;
    }
    if (binaryString[index] === '1') {
      return true;
    }
    return false;
  };

  const getTimeZoneBool = (binaryString: string, index: number) => {
    if (binaryString == undefined) {
      return;
    }
    if (binaryString.length !== 8) {
      return;
    }
    if (binaryString[index] === '1') {
      return true;
    }
    return false;
  };

  // 大会名のソート用　20240725
  const [tournNameSortFlag, setTournNameSortFlag] = useState(false);
  const tournNameSort = () => {
    if (tournNameSortFlag) {
      setTournNameSortFlag(false);
      volunteerHistoriesdata.sort((a, b) => ('' + a.tourn_name).localeCompare(b.tourn_name));
    } else {
      setTournNameSortFlag(true);
      volunteerHistoriesdata.sort((a, b) => ('' + b.tourn_name).localeCompare(a.tourn_name));
    }
  };
  // 開始日のソート用　20240725
  const [eventStartDateSortFlag, setEventStartDateSortFlag] = useState(false);
  const eventStartDateSort = () => {
    if (eventStartDateSortFlag) {
      setEventStartDateSortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(a.event_start_date.replace(/[- :]/g, '')) -
          Number(b.event_start_date.replace(/[- :]/g, '')),
      );
    } else {
      setEventStartDateSortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(b.event_start_date.replace(/[- :]/g, '')) -
          Number(a.event_start_date.replace(/[- :]/g, '')),
      );
    }
  };
  // 終了日のソート用　20240725
  const [eventEndDateSortFlag, setEventEndDateSortFlag] = useState(false);
  const eventEndDateSort = () => {
    if (eventEndDateSortFlag) {
      setEventEndDateSortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(a.event_end_date.replace(/[- :]/g, '')) -
          Number(b.event_end_date.replace(/[- :]/g, '')),
      );
    } else {
      setEventEndDateSortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(b.event_end_date.replace(/[- :]/g, '')) -
          Number(a.event_end_date.replace(/[- :]/g, '')),
      );
    }
  };

  // 役割のソート用　20240725
  const [roleSortFlag, setRoleSortFlag] = useState(false);
  const roleSort = () => {
    if (roleSortFlag) {
      setRoleSortFlag(false);
      volunteerHistoriesdata.sort((a, b) => ('' + a.role).localeCompare(b.role));
    } else {
      setRoleSortFlag(true);
      volunteerHistoriesdata.sort((a, b) => ('' + b.role).localeCompare(a.role));
    }
  };
  // ADのソート用　20240725
  const [ADSortFlag, setADSortFlag] = useState(false);
  const ADSort = () => {
    if (ADSortFlag) {
      setADSortFlag(false);
      volunteerHistoriesdata.sort((a, b) => ('' + a.ad).localeCompare(b.ad));
    } else {
      setADSortFlag(true);
      volunteerHistoriesdata.sort((a, b) => ('' + b.ad).localeCompare(a.ad));
    }
  };
  // 祝日のソート用　20240725
  const [holidaySortFlag, setHolidaySortFlag] = useState(false);
  const holidaySort = () => {
    if (holidaySortFlag) {
      setHolidaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 7)) - Number(getDayOfWeekBool(b.day_of_week, 7)),
      );
    } else {
      setHolidaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 7)) - Number(getDayOfWeekBool(a.day_of_week, 7)),
      );
    }
  };
  // 日曜のソート用　20240725
  const [sundaySortFlag, setSundaySortFlag] = useState(false);
  const sundaySort = () => {
    if (sundaySortFlag) {
      setSundaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 0)) - Number(getDayOfWeekBool(b.day_of_week, 0)),
      );
    } else {
      setSundaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 0)) - Number(getDayOfWeekBool(a.day_of_week, 0)),
      );
    }
  };
  // 月曜のソート用　20240725
  const [mondaySortFlag, setMondaySortFlag] = useState(false);
  const mondaySort = () => {
    if (mondaySortFlag) {
      setMondaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 1)) - Number(getDayOfWeekBool(b.day_of_week, 1)),
      );
    } else {
      setMondaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 1)) - Number(getDayOfWeekBool(a.day_of_week, 1)),
      );
    }
  };
  // 火曜のソート用　20240725
  const [tuesdaySortFlag, setTuesdaySortFlag] = useState(false);
  const tuesdaySort = () => {
    if (tuesdaySortFlag) {
      setTuesdaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 2)) - Number(getDayOfWeekBool(b.day_of_week, 2)),
      );
    } else {
      setTuesdaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 2)) - Number(getDayOfWeekBool(a.day_of_week, 2)),
      );
    }
  };
  // 水曜のソート用　20240725
  const [wednesdaySortFlag, setWednesdaySortFlag] = useState(false);
  const wednesdaySort = () => {
    if (wednesdaySortFlag) {
      setWednesdaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 3)) - Number(getDayOfWeekBool(b.day_of_week, 3)),
      );
    } else {
      setWednesdaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 3)) - Number(getDayOfWeekBool(a.day_of_week, 3)),
      );
    }
  };
  // 木曜のソート用　20240725
  const [thursdaySortFlag, setThursdaySortFlag] = useState(false);
  const thursdaySort = () => {
    if (thursdaySortFlag) {
      setThursdaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 4)) - Number(getDayOfWeekBool(b.day_of_week, 4)),
      );
    } else {
      setThursdaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 4)) - Number(getDayOfWeekBool(a.day_of_week, 4)),
      );
    }
  };
  // 金曜のソート用　20240725
  const [fridaySortFlag, setFridaySortFlag] = useState(false);
  const fridaySort = () => {
    if (fridaySortFlag) {
      setFridaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 5)) - Number(getDayOfWeekBool(b.day_of_week, 5)),
      );
    } else {
      setFridaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 5)) - Number(getDayOfWeekBool(a.day_of_week, 5)),
      );
    }
  };
  // 土曜のソート用　20240725
  const [saturdaySortFlag, setSaturdaySortFlag] = useState(false);
  const saturdaySort = () => {
    if (saturdaySortFlag) {
      setSaturdaySortFlag(false);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(a.day_of_week, 6)) - Number(getDayOfWeekBool(b.day_of_week, 6)),
      );
    } else {
      setSaturdaySortFlag(true);
      volunteerHistoriesdata.sort(
        (a, b) =>
          Number(getDayOfWeekBool(b.day_of_week, 6)) - Number(getDayOfWeekBool(a.day_of_week, 6)),
      );
    }
  };

  //AD
  const [aDList, setADList] = useState([] as ADList[]);
  const [selectedADList, setSelectedADList] = useState([] as ADList[]);
  //祝日
  const [holidayList, setHolidayList] = useState([] as HolidayList[]);
  const [selectedHolidayList, setSelectedHolidayList] = useState([] as HolidayList[]);
  //日曜
  const [sundayList, setSundayList] = useState([] as SundayList[]);
  const [selectedSundayList, setSelectedSundayList] = useState([] as SundayList[]);
  //月曜
  const [mondayList, setMondayList] = useState([] as MondayList[]);
  const [selectedMondayList, setSelectedMondayList] = useState([] as MondayList[]);
  //火曜
  const [tuesdayList, setTuesdayList] = useState([] as TuesdayList[]);
  const [selectedTuesdayList, setSelectedTuesdayList] = useState([] as TuesdayList[]);
  //水曜
  const [wednesdayList, setWednesdayList] = useState([] as WednesdayList[]);
  const [selectedWednesdayList, setSelectedWednesdayList] = useState([] as WednesdayList[]);
  //木曜
  const [thursdayList, setThursdayList] = useState([] as ThursdayList[]);
  const [selectedThursdayList, setSelectedThursdayList] = useState([] as ThursdayList[]);
  //金曜
  const [fridayList, setFridayList] = useState([] as FridayList[]);
  const [selectedFridayList, setSelectedFridayList] = useState([] as FridayList[]);
  //土曜
  const [saturdayList, setSaturdayList] = useState([] as SaturdayList[]);
  const [selectedSaturdayList, setSelectedSaturdayList] = useState([] as SaturdayList[]);

  // フィルター用のステート 20240725
  const [showADAutocomplete, setShowADAutocomplete] = useState(false); //ADのフィルター実装　20240725
  const [showHolidayAutocomplete, setShowHolidayAutocomplete] = useState(false); //祝日のフィルター実装　20240725
  const [showSundayAutocomplete, setShowSundayAutocomplete] = useState(false); //日曜のフィルター実装　20240725
  const [showMondayAutocomplete, setShowMondayAutocomplete] = useState(false); //日曜のフィルター実装　20240725
  const [showTuesdayAutocomplete, setShowTuesdayAutocomplete] = useState(false); //日曜のフィルター実装　20240725
  const [showWednesdayAutocomplete, setShowWednesdayAutocomplete] = useState(false); //日曜のフィルター実装　20240725
  const [showThursdayAutocomplete, setShowThursdayAutocomplete] = useState(false); //日曜のフィルター実装　20240725
  const [showFridayAutocomplete, setShowFridayAutocomplete] = useState(false); //日曜のフィルター実装　20240725
  const [showSaturdayAutocomplete, setShowSaturdayAutocomplete] = useState(false); //日曜のフィルター実装　20240725

  const ADfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const holidayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const sundayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const mondayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const tuesdayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const wednesdayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const thursdayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const fridayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725
  const saturdayfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240725

  //AD
  const [selectedADHeader, setSelectedADHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //祝日
  const [selectedHolidayHeader, setSelectedHolidayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //日曜
  const [selectedSundayHeader, setSelectedSundayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //月曜
  const [selectedMondayHeader, setSelectedMondayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //火曜
  const [selectedTuesdayHeader, setSelectedTuesdayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //水曜
  const [selectedWednesdayHeader, setSelectedWednesdayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //木曜
  const [selectedThursdayHeader, setSelectedThursdayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //金曜
  const [selectedFridayHeader, setSelectedFridayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //土曜
  const [selectedSaturdayHeader, setSelectedSaturdayHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });

  /**
   * ADヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleADHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedADHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowADAutocomplete(!showADAutocomplete);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 祝日ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleHolidayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedHolidayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowHolidayAutocomplete(!showHolidayAutocomplete);
    setShowADAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 日曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleSundayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedSundayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowSundayAutocomplete(!showSundayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 月曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleMondayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedMondayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowMondayAutocomplete(!showMondayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 火曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleTuesdayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedTuesdayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowTuesdayAutocomplete(!showTuesdayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 水曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleWednesdayHeaderClick = (
    value: string,
    event: MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedWednesdayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowWednesdayAutocomplete(!showWednesdayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 木曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleThursdayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedThursdayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowThursdayAutocomplete(!showThursdayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowFridayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 金曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleFridayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedFridayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowFridayAutocomplete(!showFridayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowSaturdayAutocomplete(false);
  };
  /**
   * 金曜ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleSaturdayHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedSaturdayHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowSaturdayAutocomplete(!showSaturdayAutocomplete);
    setShowADAutocomplete(false);
    setShowHolidayAutocomplete(false);
    setShowSundayAutocomplete(false);
    setShowMondayAutocomplete(false);
    setShowTuesdayAutocomplete(false);
    setShowWednesdayAutocomplete(false);
    setShowThursdayAutocomplete(false);
    setShowFridayAutocomplete(false);
  };

  //ボランティア情報削除関数 20240315
  const dataDelete = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('api/deleteVolunteer', volunteer_id)
      .then((res) => {
        //console.log(res.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();

        const userTypeInfo = await axios.get('api/getIDsAssociatedWithUser');
        setUserIdType(userTypeInfo.data.result[0]); //ユーザIDに紐づいた情報

        const volunteerResponse = await axios.post('api/getVolunteerData', volunteer_id); //ボランティア情報の取得
        const volLangProDataList = volunteerResponse.data.volLangProData.map(
          ({ lang_pro_name, lang_name }: { lang_pro_name: number; lang_name: string }) => ({
            level: lang_pro_name,
            languageName: lang_name,
          }),
        );
        //console.log(volLangProDataList);

        var day_of_week_List = volunteerResponse.data.volAvaData.day_of_week.split('');

        var tmpArray = Array(); //サイド情報のエンディアン入れ替え
        for (let index = day_of_week_List.length - 1; index >= 0; index--) {
          tmpArray.push(day_of_week_List[index]);
        }
        day_of_week_List = tmpArray;

        var time_zone_List = volunteerResponse.data.volAvaData.time_zone.split('');
        var time_tmpArray = Array(); //サイド情報のエンディアン入れ替え
        for (let index = time_zone_List.length - 1; index >= 0; index--) {
          time_tmpArray.push(time_zone_List[index]);
        }
        time_zone_List = time_tmpArray;

        setVolunteerdata({
          volunteer_id: volunteerResponse.data.result.volunteer_id, // ボランティアID
          volunteer_name: volunteerResponse.data.result.volunteer_name, // 氏名
          residence_country: volunteerResponse.data.result.country_name, // 居住地（国）
          residence_prefecture: volunteerResponse.data.result.pref_name, // 居住地（都道府県）
          sex: volunteerResponse.data.result.master_sex_type, // 性別
          date_of_birth: volunteerResponse.data.result.date_of_birth, // 生年月日
          telephone_number: volunteerResponse.data.result.telephone_number, // 電話番号
          mailaddress: volunteerResponse.data.result.mailaddress, // メールアドレス
          clothes_size: volunteerResponse.data.result.master_clothes_size, // 服のサイズ
          personality: volunteerResponse.data.result.personality, // 性格
          dis_type_id: volunteerResponse.data.volSupDisData, // 障碍タイプ
          qualHold: volunteerResponse.data.volQualData, // 保有資格
          language: volLangProDataList, // 言語
          language_proficiency: '', //残件対応項目
          day_of_week: day_of_week_List, // 曜日
          time_zone: time_zone_List, // 時間帯
          photo: volunteerResponse.data.result.photo, // 写真　#置き換え作業未対応
        });
        // const volunteerHistoriesResponse = await axios.get<VolunteerHistoriesResponse[]>(
        //   '/volunteerHistories',
        // );
        //console.log(volunteerResponse.data.volHistData);
        for (let index = 0; index < volunteerResponse.data.volHistData.length; index++) {
          var hist_day_of_week_List =
            volunteerResponse.data.volHistData[index].day_of_week.split('');
          var strData = '';
          //console.log(volunteerResponse.data.volHistData[index].day_of_week);
          for (let j = hist_day_of_week_List.length - 1; j >= 0; j--) {
            strData += hist_day_of_week_List[j];
          }
          //console.log(strData);
          volunteerResponse.data.volHistData[index].day_of_week = strData;
          //console.log(volunteerResponse.data.volHistData[index].day_of_week);
        }
        //console.log(volunteerResponse.data.volHistData);
        setVolunteerHistoriesdata(volunteerResponse.data.volHistData);
      } catch (error) {
        // TODO: エラーハンドリングを実装
        setErrorMessage([
          ...(errorMessage as string[]),
          'API取得エラー:' + (error as Error).message,
        ]);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {}, []);
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);
    setSelectedADList([]);
    setSelectedHolidayList([]);
    setSelectedSundayList([]);
    setSelectedMondayList([]);
    setSelectedTuesdayList([]);
    setSelectedWednesdayList([]);
    setSelectedThursdayList([]);
    setSelectedFridayList([]);
    setSelectedSaturdayList([]);
  };

  // フィルターのリストを制御する
  const [filteredArray, setFilteredArray] = useState([] as VolunteerHistoriesResponse[]);

  // フィルターのリストを制御する
  useEffect(() => {
    setFilteredArray(
      volunteerHistoriesdata.filter((row, index) => {
        //公式・非公式の場合
        if (activeTab === 2) {
          return row.tourn_type === 1;
        } else if (activeTab === 1) {
          return row.tourn_type === 0;
        } else {
          return true;
        }
      }),
    );
  }, [volunteerHistoriesdata, activeTab]);

  useEffect(() => {
    //ADをフィルターできるようにする 20240725
    const ADArray = filteredArray.map((item: any) => item.ad);
    const uniqueADSet = new Set(ADArray);
    const uniqueEventNameArray = Array.from(uniqueADSet);
    setADList(
      uniqueEventNameArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //祝日をフィルターできるようにする 20240725
    const holidayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 7));
    const uniqueHolidaySet = new Set(holidayArray);
    const uniqueHolidayArray = Array.from(uniqueHolidaySet);
    setHolidayList(
      uniqueHolidayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //日曜をフィルターできるようにする 20240725
    const sundayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 0));
    const uniqueSundaySet = new Set(sundayArray);
    const uniqueSundayArray = Array.from(uniqueSundaySet);
    setSundayList(
      uniqueSundayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //月曜をフィルターできるようにする 20240725
    const mondayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 1));
    const uniqueMondaySet = new Set(mondayArray);
    const uniqueMondayArray = Array.from(uniqueMondaySet);
    setMondayList(
      uniqueMondayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //火曜をフィルターできるようにする 20240725
    const tuesdayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 2));
    const uniqueTuesdaySet = new Set(tuesdayArray);
    const uniqueTuesdayArray = Array.from(uniqueTuesdaySet);
    setTuesdayList(
      uniqueTuesdayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //水曜をフィルターできるようにする 20240725
    const wednesdayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 3));
    const uniqueWednesdaySet = new Set(wednesdayArray);
    const uniqueWednesdayArray = Array.from(uniqueWednesdaySet);
    setWednesdayList(
      uniqueWednesdayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //木曜をフィルターできるようにする 20240725
    const thursdayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 4));
    const uniqueThursdaySet = new Set(thursdayArray);
    const uniqueThursdayArray = Array.from(uniqueThursdaySet);
    setThursdayList(
      uniqueThursdayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //金曜をフィルターできるようにする 20240725
    const fridayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 5));
    const uniqueFridaySet = new Set(fridayArray);
    const uniqueFridayArray = Array.from(uniqueFridaySet);
    setFridayList(
      uniqueFridayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //土曜をフィルターできるようにする 20240725
    const saturdayArray = filteredArray.map((item: any) => getDayOfWeekBool(item.day_of_week, 6));
    const uniqueSaturdaySet = new Set(saturdayArray);
    const uniqueSaturdayArray = Array.from(uniqueSaturdaySet);
    setSaturdayList(
      uniqueSaturdayArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
  }, [filteredArray]);

  useEffect(() => {
    if (showADAutocomplete) {
      if (ADfocusTarget.current != null) {
        var target = ADfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedADList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showHolidayAutocomplete) {
      if (holidayfocusTarget.current != null) {
        var target = holidayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedHolidayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showSundayAutocomplete) {
      if (sundayfocusTarget.current != null) {
        var target = sundayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedSundayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showMondayAutocomplete) {
      if (mondayfocusTarget.current != null) {
        var target = mondayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedMondayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showTuesdayAutocomplete) {
      if (tuesdayfocusTarget.current != null) {
        var target = tuesdayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedTuesdayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showWednesdayAutocomplete) {
      if (wednesdayfocusTarget.current != null) {
        var target = wednesdayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedWednesdayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showThursdayAutocomplete) {
      if (thursdayfocusTarget.current != null) {
        var target = thursdayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedThursdayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showFridayAutocomplete) {
      if (fridayfocusTarget.current != null) {
        var target = fridayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedFridayList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showSaturdayAutocomplete) {
      if (saturdayfocusTarget.current != null) {
        var target = saturdayfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedSaturdayList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [
    showADAutocomplete,
    showHolidayAutocomplete,
    showSundayAutocomplete,
    showMondayAutocomplete,
    showTuesdayAutocomplete,
    showWednesdayAutocomplete,
    showThursdayAutocomplete,
    showFridayAutocomplete,
    showSaturdayAutocomplete,
  ]);

  return (
    <>
      <div className='flex flex-row justify-between items-center '>
        <CustomTitle displayBack={true}>
          ボランティア情報{mode === 'delete' && '削除'}
          {mode !== 'delete' && '参照'}
        </CustomTitle>
        {mode !== 'delete' &&
          (userIdType.is_administrator == 1 ||
            userIdType.volunteer_id?.toString() == volunteerId) && (
            <TitleSideButton
              href={{
                pathname: '/volunteerInformationRef',
                query: { mode: 'delete', volunteer_id: volunteerId },
              }}
              icon={DeleteOutlineIcon}
              text='ボランティア情報削除'
            />
          )}
      </div>
      <ErrorBox errorText={errorMessage} />
      <div className='flex flex-row gap-[20px] justify-between'>
        <div className='flex flex-col gap-[20px]'>
          {/* 写真 */}
          <InputLabel label='写真' required={false} />
          <img
            src={volunteerdata.photo}
            className='w-[200px] h-[200px] rounded-[10px] object-cover'
          />
        </div>
      </div>

      <div className='flex flex-wrap justify-between gap-[20px]'>
        <div className='flex flex-col gap-[20px] max-w-[400px]'>
          {/* ボランティアID */}
          <CustomTextField
            label='ボランティアID'
            value={'v' + volunteerdata.volunteer_id}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 氏名 */}
          <CustomTextField
            label='氏名'
            value={volunteerdata.volunteer_name}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 生年月日 */}
          <CustomTextField
            label='生年月日'
            value={volunteerdata.date_of_birth}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 性別 */}
          <CustomTextField
            label='性別'
            value={volunteerdata.sex}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 居住地（国） */}
          <div className='flex flex-row gap-[16px]'>
            <CustomTextField
              label='居住地'
              value={volunteerdata.residence_country}
              readonly
              displayHelp={false}
              onChange={(e) => {}}
            />
            {/* 居住地（都道府県） */}
            <CustomTextField
              label='都道府県'
              value={volunteerdata.residence_prefecture}
              readonly
              displayHelp={false}
              onChange={(e) => {}}
            />
          </div>
          {/* 電話番号 */}
          <CustomTextField
            label='電話番号'
            value={volunteerdata.telephone_number}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* メールアドレス */}
          <CustomTextField
            label='メールアドレス'
            value={volunteerdata.mailaddress}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
        </div>
        <div className='flex flex-col gap-[20px] max-w-[400px]'>
          {/* 服のサイズ */}
          <CustomTextField
            label='服のサイズ'
            value={volunteerdata.clothes_size}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 障碍タイプ */}
          {/* <label htmlFor='disType'>補助が可能な障碍タイプ</label> */}
          <InputLabel
            label='補助が可能な障碍タイプ'
            displayHelp={true}
            toolTipText='PR1：<br>
              腕と肩は完全に動くが、脚の機能が失われている選手。脊椎損傷などが原因として考えられる。平衡機能が弱いため、体をボートに固定させる<br>
              PR2：<br>
              胴体と腕は十分に動くが、脚の機能が減少している選手。漕ぐ時はスライドするシートを使えない<br>
              PR3：<br>
              四肢と胴体に障害があるが、動かすことができる選手。視覚障害者もこのクラスに分類される'
          />
          <div className='flex flex-row gap-[16px] justify-start'>
            {volunteerdata.dis_type_id?.map((volSupDisData: any) => (
              <OriginalCheckbox
                id='disType'
                key={volSupDisData.dis_type_name as string}
                label={volSupDisData.dis_type_name}
                value={volSupDisData.dis_type_name}
                checked={volSupDisData.dis_type_name.length > 0}
                readonly
                onChange={(e) => {}}
              />
            ))}
          </div>
          {/* 資格情報 */}
          {/* <label htmlFor='qualHold'>資格情報</label> */}
          <InputLabel label='資格情報' />
          <div className='flex flex-row gap-[16px] justify-start'>
            {volunteerdata.qualHold?.map((qualHold: any) => (
              <div id='qualHold' key={qualHold.qual_name as string}>
                <p className='text-secondaryText'>
                  {qualHold.qual_id == 99
                    ? (qualHold.others_qual as string)
                    : (qualHold.qual_name as string)}
                </p>
              </div>
            ))}
          </div>
          {/* <label htmlFor='language'>言語</label> */}
          <InputLabel
            label='言語'
            displayHelp={true}
            toolTipText='A1（初心者）：<br>
              自己紹介ができ、どこに住んでいるか、誰を知っているか、何を持っているかと言った個人的なことを聞き、こたえることができる。<br>
              A2（初級）：<br>
               慣れ親しんだ内容であれば単純で直接的な会話ができる。<br>
              B1（中級）：<br>
              仕事や学校、レジャーなど慣れ親しんだ環境の話題であれば、主な内容は理解・会話することができる。<br>
              B2（中級の上）：<br>
              ネイティブスピーカーと、ある程度流暢にストレスなく普通の会話をすることができる。<br>
              C1（上級）：<br>
              言葉や表現に悩まずに自身の考えを流暢によどみなく伝えることができる。<br>
              C2（ネイティブ）：<br>
              どんな複雑な状況下でも一貫して言葉のニュアンスの違いなどに気を配りながら流暢に正確に自己表現ができる。'
          />
          {volunteerdata.language?.map((language: any) => (
            <div
              id='language'
              key={language.languageName}
              className='flex flex-row gap-[6px] justify-start'
            >
              {/* 言語（種類） */}
              <p className='text-secondaryText'>{language.languageName}：</p>
              {/* 言語（レベル） */}
              <p className='text-secondaryText'>{language.level}</p>
            </div>
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-[20px] '>
        {/* 参加可能曜日 */}
        <div className='text-h3 font-bold my-2'>参加しやすい曜日</div>
        <div className='flex flex-row gap-[16px] flex-wrap'>
          曜日指定
          <OriginalCheckbox
            id='anyday'
            label='祝日は可'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 7) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='sunday'
            label='日曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 0) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='monday'
            label='月曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 1) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='tuesday'
            label='火曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 2) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='wednesday'
            label='水曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 3) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='thursday'
            label='木曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 4) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='friday'
            label='金曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 5) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='saturday'
            label='土曜日'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 6) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='any'
            label='相談可能'
            value=''
            checked={getDayOfWeekBool(volunteerdata.day_of_week, 8) || false}
            readonly
            onChange={(e) => {}}
          />
        </div>
        {/* 参加可能時間帯 */}
        <div className='text-h3 font-bold my-2'>参加しやすい時間帯</div>
        <div className='flex flex-col gap-[16px]'>
          時間帯指定
          <OriginalCheckbox
            id='anytime'
            label='相談可能'
            value=''
            checked={getTimeZoneBool(volunteerdata.time_zone, 7) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='earlymorning'
            label='早朝　 06:00〜08:00'
            value=''
            checked={getTimeZoneBool(volunteerdata.time_zone, 0) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='morning'
            label='午前　 08:00〜12:00'
            value=''
            checked={getTimeZoneBool(volunteerdata.time_zone, 1) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='afternoon'
            label='午後　 12:00〜16:00'
            value=''
            checked={getTimeZoneBool(volunteerdata.time_zone, 2) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='night'
            label='夜　　 16:00〜20:00'
            value=''
            checked={getTimeZoneBool(volunteerdata.time_zone, 3) || false}
            readonly
            onChange={(e) => {}}
          />
        </div>
      </div>
      <div className='mx-auto mt-[40px] flex flex-col gap-[8px]'>
        <div className='flex flex-row justify-between items-center'>
          <div className='flex'>
            {/* すべてトグルボタン */}
            <Tab
              number={0}
              isActive={activeTab === 0}
              onClick={handleTabChange}
              rounded='rounded-l'
            >
              全て
            </Tab>
            {/* 公式大会トグルボタン */}
            <Tab
              number={2}
              isActive={activeTab === 2}
              onClick={handleTabChange}
              rounded='rounded-none'
            >
              公式
            </Tab>
            {/* 非公式大会トグルボタン */}
            <Tab
              number={1}
              isActive={activeTab === 1}
              onClick={handleTabChange}
              rounded='rounded-r'
            >
              非公式
            </Tab>
          </div>
          {/* 遷移先の画面未実装のため、コメントアウト 20240525 */}
          {/* {mode !== 'delete' && (
              <Link
                className='text-primary-500 hover:text-primary-700 underline text-small md:text-normal'
                href={{
                  // TODO: ボランティア履歴情報登録画面の正規URLに変更
                  pathname: '/volunteerHistoriesInformationDelete',
                  query: { id: volunteerdata.volunteer_id },
                }}
              >
                履歴の削除
              </Link>
            )} */}
        </div>
        <div className='w-screen flex justify-between items-center'>
          <CustomTable>
            <CustomThead>
              <CustomTr>
                <CustomTh colSpan={17} rowSpan={1}>
                  ボランティア参加履歴
                </CustomTh>
              </CustomTr>
              <CustomTr>
                <CustomTh colSpan={1} rowSpan={2}>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => tournNameSort()}
                  >
                    大会名/イベント名
                  </div>
                </CustomTh>
                <CustomTh colSpan={2}>開催期間</CustomTh>
                <CustomTh colSpan={1} rowSpan={2}>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => roleSort()}
                  >
                    役割
                  </div>
                </CustomTh>
                <CustomTh colSpan={1} rowSpan={2}>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => ADSort()}
                    >
                      AD
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedADList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleADHeaderClick('AD', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh colSpan={8} rowSpan={1}>
                  参加日
                </CustomTh>
              </CustomTr>
              <CustomTr>
                <CustomTh>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => eventStartDateSort()}
                  >
                    開始日
                  </div>
                </CustomTh>
                <CustomTh>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => eventEndDateSort()}
                  >
                    終了日
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => holidaySort()}
                    >
                      祝日
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedHolidayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleHolidayHeaderClick('祝日', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => sundaySort()}
                    >
                      日曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedSundayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleSundayHeaderClick('日曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => mondaySort()}
                    >
                      月曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedMondayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleMondayHeaderClick('月曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => tuesdaySort()}
                    >
                      火曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedTuesdayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleTuesdayHeaderClick('火曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => wednesdaySort()}
                    >
                      水曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedWednesdayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleWednesdayHeaderClick('水曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => thursdaySort()}
                    >
                      木曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedThursdayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleThursdayHeaderClick('木曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => fridaySort()}
                    >
                      金曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedFridayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleFridayHeaderClick('金曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => saturdaySort()}
                    >
                      土曜
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedSaturdayList.length > 0 ? '#F44336' : '#001D74',
                      }}
                      onClick={(event) => handleSaturdayHeaderClick('土曜', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
              </CustomTr>
            </CustomThead>
            {/* ボランティア参加履歴一覧テーブル明細表示 */}
            {volunteerHistoriesdata
              .filter((row, index) => {
                if (selectedADList.length > 0) {
                  return selectedADList.some((item) => item.name === row.ad);
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedHolidayList.length > 0) {
                  return selectedHolidayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 7),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedSundayList.length > 0) {
                  return selectedSundayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 0),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedMondayList.length > 0) {
                  return selectedMondayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 1),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedTuesdayList.length > 0) {
                  return selectedTuesdayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 2),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedWednesdayList.length > 0) {
                  return selectedWednesdayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 3),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedThursdayList.length > 0) {
                  return selectedThursdayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 4),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedFridayList.length > 0) {
                  return selectedFridayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 5),
                  );
                } else {
                  return true;
                }
              })
              .filter((row, index) => {
                if (selectedSaturdayList.length > 0) {
                  return selectedSaturdayList.some(
                    (item) => item.name === getDayOfWeekBool(row.day_of_week, 6),
                  );
                } else {
                  return true;
                }
              })
              .map(
                (volunteerHistoriesdata) =>
                  (volunteerHistoriesdata.tourn_type + 1 == activeTab || activeTab == 0) && (
                    <CustomTbody key={volunteerHistoriesdata.tourn_name}>
                      <CustomTr>
                        {/* 大会名/イベント名 */}
                        <CustomTd align='center'>
                          <Link
                            className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                            href={{
                              pathname: '/tournamentRef',
                              query: { tournId: volunteerHistoriesdata.tourn_id },
                            }}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {volunteerHistoriesdata.tourn_name}
                          </Link>
                        </CustomTd>
                        {/* 開催開始日 */}
                        <CustomTd align='center'>
                          {volunteerHistoriesdata.event_start_date}
                        </CustomTd>
                        {/* 開催終了日 */}
                        <CustomTd align='center'>{volunteerHistoriesdata.event_end_date}</CustomTd>
                        {/* 役割 */}
                        <CustomTd align='center'>{volunteerHistoriesdata.role}</CustomTd>
                        {/* AD */}
                        <CustomTd align='center'>{volunteerHistoriesdata.ad}</CustomTd>
                        {/* 祝日 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 7) && (
                            <p className='text-small'>可</p>
                          )}
                        </CustomTd>
                        {/* 日曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 0) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 月曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 1) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 火曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 2) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 水曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 3) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 木曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 4) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 金曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 5) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 土曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 6) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                      </CustomTr>
                    </CustomTbody>
                  ),
              )}
          </CustomTable>
          {/* ADフィルター用のオートコンプリート 20240725 */}
          {showADAutocomplete && (
            <div
              ref={ADfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedADHeader.position.top - 120}px`,
                left: `${selectedADHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowADAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='AD'
                multiple
                options={aDList}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) => option.name?.includes(inputValue))
                }
                value={selectedADList || []}
                onChange={(e: ChangeEvent<{}>, newValue: ADList[]) => {
                  //console.log(newValue);
                  setSelectedADList(newValue);
                }}
                renderOption={(props: any, option: ADList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  );
                }}
                renderTags={(value: ADList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'AD'}
                  />
                )}
              />
            </div>
          )}
          {/* 祝日フィルター用のオートコンプリート 20240725 */}
          {showHolidayAutocomplete && (
            <div
              ref={holidayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedHolidayHeader.position.top - 120}px`,
                left: `${selectedHolidayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowHolidayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='祝日'
                multiple
                options={holidayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedHolidayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: HolidayList[]) => {
                  //console.log(newValue);
                  setSelectedHolidayList(newValue);
                }}
                renderOption={(props: any, option: HolidayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {/* {option.name} */}
                      {option.name === true ? '可' : ''}
                    </li>
                  );
                }}
                renderTags={(value: HolidayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '可' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'祝日'}
                  />
                )}
              />
            </div>
          )}
          {/* 日曜フィルター用のオートコンプリート 20240725 */}
          {showSundayAutocomplete && (
            <div
              ref={sundayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedSundayHeader.position.top - 120}px`,
                left: `${selectedSundayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowSundayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='日曜'
                multiple
                options={sundayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedSundayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: SundayList[]) => {
                  setSelectedSundayList(newValue);
                }}
                renderOption={(props: any, option: SundayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: SundayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'日曜'}
                  />
                )}
              />
            </div>
          )}
          {/* 月曜フィルター用のオートコンプリート 20240725 */}
          {showMondayAutocomplete && (
            <div
              ref={mondayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedMondayHeader.position.top - 120}px`,
                left: `${selectedMondayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowMondayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='月曜'
                multiple
                options={mondayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedMondayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: MondayList[]) => {
                  setSelectedMondayList(newValue);
                }}
                renderOption={(props: any, option: MondayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: MondayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'月曜'}
                  />
                )}
              />
            </div>
          )}
          {/* 火曜フィルター用のオートコンプリート 20240725 */}
          {showTuesdayAutocomplete && (
            <div
              ref={tuesdayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedTuesdayHeader.position.top - 120}px`,
                left: `${selectedTuesdayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowTuesdayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='火曜'
                multiple
                options={tuesdayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedTuesdayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: TuesdayList[]) => {
                  setSelectedTuesdayList(newValue);
                }}
                renderOption={(props: any, option: TuesdayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: TuesdayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'火曜'}
                  />
                )}
              />
            </div>
          )}
          {/* 水曜フィルター用のオートコンプリート 20240725 */}
          {showWednesdayAutocomplete && (
            <div
              ref={wednesdayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedWednesdayHeader.position.top - 120}px`,
                left: `${selectedWednesdayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowWednesdayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='水曜'
                multiple
                options={wednesdayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedWednesdayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: WednesdayList[]) => {
                  setSelectedWednesdayList(newValue);
                }}
                renderOption={(props: any, option: WednesdayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: WednesdayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'水曜'}
                  />
                )}
              />
            </div>
          )}
          {/* 木曜フィルター用のオートコンプリート 20240725 */}
          {showThursdayAutocomplete && (
            <div
              ref={thursdayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedThursdayHeader.position.top - 120}px`,
                left: `${selectedThursdayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowThursdayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='木曜'
                multiple
                options={thursdayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedThursdayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: ThursdayList[]) => {
                  setSelectedThursdayList(newValue);
                }}
                renderOption={(props: any, option: ThursdayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: ThursdayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'木曜'}
                  />
                )}
              />
            </div>
          )}
          {/* 金曜フィルター用のオートコンプリート 20240725 */}
          {showFridayAutocomplete && (
            <div
              ref={fridayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedFridayHeader.position.top - 120}px`,
                left: `${selectedFridayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowFridayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='金曜'
                multiple
                options={fridayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedFridayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: FridayList[]) => {
                  setSelectedFridayList(newValue);
                }}
                renderOption={(props: any, option: FridayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: FridayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'金曜'}
                  />
                )}
              />
            </div>
          )}
          {/* 土曜フィルター用のオートコンプリート 20240725 */}
          {showSaturdayAutocomplete && (
            <div
              ref={saturdayfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedSaturdayHeader.position.top - 120}px`,
                left: `${selectedSaturdayHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowSaturdayAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
            >
              <Autocomplete
                id='曜'
                multiple
                options={saturdayList}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) => Boolean(option.name)?.toString().includes(inputValue.toString()),
                  );
                }}
                value={selectedSaturdayList || []}
                onChange={(e: ChangeEvent<{}>, newValue: SaturdayList[]) => {
                  setSelectedSaturdayList(newValue);
                }}
                renderOption={(props: any, option: SaturdayList) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.name === true ? '〇' : ''}
                    </li>
                  );
                }}
                renderTags={(value: SaturdayList[], getTagProps: any) => {
                  return value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name === true ? '〇' : ''}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    key={params.id}
                    className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                    {...params}
                    label={'土曜'}
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>
      <div className='flex flex-row mb-1 gap-[16px] justify-center'>
        {/* 戻るボタン */}
        {window.history.length > 1 && (
          <CustomButton
            buttonType='white-outlined'
            className='text-normal h-12 mb-6'
            onClick={() => {
              router.back();
              // ボランティア情報参照画面に遷移
            }}
          >
            戻る
          </CustomButton>
        )}
        {/* 削除ボタン */}
        {mode === 'delete' && (
          <CustomButton
            buttonType='primary'
            className='text-secondaryText text-normal h-12 mr-1 mb-6'
            onClick={() => {
              // TODO: 削除処理
              /**
               * 以下のテーブルに登録されている当該ボランティアのデータの「削除フラグ」に"1"を設定する。
               * 「ボランティアテーブル」
               * 「ボランティア履歴テーブル」
               * 「ボランティアアベイラブルテーブル」
               * 「ボランティア保有資格情報テーブル」
               * 「ボランティア言語レベルテーブル」
               * 「ボランティア支援可能障碍タイプテーブル」
               */
              // TODO: エラーハンドリングを実装
              // 削除に失敗した場合、
              // 以下のメッセージをシステムエラーとして赤文字で表示し、以降の処理は行わない。
              // setErrorMessage(['ユーザー情報の登録に失敗しました。ユーザーサポートにお問い合わせください。']);

              // setDisplayFlg(false);
              window.confirm('ボランティア情報を削除します。よろしいですか？')
                ? //okを押したら下の処理を実行 キャンセルを押したらflagをtrueにしてそのまま
                  (dataDelete(),
                  // setDisplayFlg(true),
                  window.alert('ボランティア情報の削除が完了しました。'),
                  router.push('/volunteerSearch')) //大会検索画面に遷移する 20240222
                : '';
            }}
          >
            削除
          </CustomButton>
        )}
      </div>
    </>
  );
}

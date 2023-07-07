const col = document.querySelector("#col"),
  row = document.querySelector("#row"),
  container = document.querySelector("#container"),
  colLabel = document.querySelector("#col_label"),
  rowLabel = document.querySelector("#row_label"),
  delBtn = document.querySelector("#del_btn"),
  numBtn = document.querySelector("#num_btn"),
  numForm = document.querySelector(".num_form"),
  numInput = document.querySelector("#num_input"),
  pickBtn = document.querySelector("#pick_btn"),
  seatCnt = document.querySelector("#seat_cnt"),
  copyright = document.querySelector(".copyright"),
  closeBtns = document.querySelectorAll(".close_btn");

const NONE_CN = "none",
  DEL_CN = "delete",
  DISABLED_CN = "disabled",
  RETRY_CN = "retry",
  CHANGE_CN = "change",
  BTN_HOVER_CN = "btn-hover";

let isDelStart = false, // 없는 자리 설정이 시작되었는지
  isNumSettingOn = false, // 번호 맞춤 설정 중인지
  isPickStart = false; // 자리 뽑기를 시작했는지

// 삭제된 자리 배열
const deleteList = [];

// 번호 맞춤 설정
function CustomizationNumList(data) {
  let numList = [];
  data += ",";
  while (true) {
    let commaIdx = data.indexOf(",");
    if (commaIdx != -1) {
      let sliceData = data.slice(0, commaIdx);
      let slashIdx = sliceData.indexOf("-");
      if (slashIdx != -1) {
        firstNum = sliceData.slice(0, slashIdx);
        lastNum = sliceData.slice(slashIdx + 1, sliceData.length);
        // 앞에 나온 숫자가 뒤에 나온 숫자보다 큰 경우
        if (firstNum > lastNum) {
          temp = lastNum;
          lastNum = firstNum;
          firstNum = temp;
        }
        for (let i = 0; i < lastNum - firstNum + 1; i++) {
          num = Number(firstNum) + i;
          numList.push(num);
        }
      } else {
        numList.push(Number(sliceData));
      }
      data = data.slice(commaIdx + 1, data.length);
    } else {
      return numList;
    }
  }
}

// 번호 맞춤 설정을 하지 않은 경우의 배열을 만드는 함수
function notCustomizationNumList() {
  let colValue = col.value;
  let rowValue = row.value;
  let numCnt = colValue * rowValue - deleteList.length;
  let numList = [];
  for (let i = 1; i <= numCnt; i++) {
    numList.push(i);
  }
  return numList;
}

function chooseDelSeat() {
  const seatBtns = document.querySelectorAll(".seat_btn");
  if (isDelStart) {
    isDelStart = false;
    delBtn.innerText = "없는 자리 설정";
    for (let i = 0; i < seatBtns.length; i++) {
      seatBtns[i].classList.add(NONE_CN);
    }
  } else {
    isDelStart = true;
    delBtn.innerText = "자리 설정 완료";
    for (let i = 0; i < seatBtns.length; i++) {
      seatBtns[i].classList.remove(NONE_CN);
      seatBtns[i].addEventListener("click", deleteSeat);
    }
  }
}

function deleteSeat(event) {
  let btn = event.target;
  let seat = btn.parentNode;
  seat.classList.toggle(DEL_CN);
  let idx = deleteList.indexOf(seat.id);
  if (idx != -1) {
    deleteList.splice(idx, 1);
  } else {
    deleteList.push(seat.id);
  }
  countSeat();
}

function createSeat(colValue, rowValue) {
  // row를 담아둘 배열
  let lineArray = [];

  // col과 row를 이차원으로 저장하기 위한 이중반복문
  for (let r = 1; r <= rowValue; r++) {
    // row 한줄에 해당하는 변수
    let line = document.createElement("ul");
    line.id = `row${r}`;
    line.className = "line";
    for (let c = 1; c <= colValue; c++) {
      // col 하나에 해당하는 변수
      let seat = document.createElement("li");
      seat.id = `${r},${c}`;
      seat.className = "seat";

      // deleteList에 있는 seat는 delete class 추가 => 검정색으로
      for (let i = 0; i < deleteList.length; i++) {
        if (seat.id == deleteList[i]) {
          seat.classList.add(DEL_CN);
        }
      }

      // 각각의 seat 변수의 자식요소
      let delBtn = document.createElement("button");
      delBtn.innerText = "❌";
      delBtn.className = "seat_btn";
      delBtn.classList.add(NONE_CN);
      delBtn.classList.add("btn");

      seat.appendChild(delBtn);
      line.appendChild(seat);
    }
    lineArray.push(line);
  }
  paintSeat(lineArray);
}

function paintSeat(lineArray) {
  // 기존의 container 자식요소 모두 삭제
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // col index 생성
  let line = document.createElement("ul");
  line.className = "line";
  for (let i = 0; i <= lineArray[0].childElementCount; i++) {
    let idx = document.createElement("li");
    idx.className = "col_idx";
    if (i !== 0) {
      idx.innerText = i;
    } else {
      idx.classList.add("row_idx");
    }
    idx.classList.add("seat");
    idx.classList.add("idx");
    line.appendChild(idx);
    container.appendChild(line);
  }

  for (let r = 0; r < lineArray.length; r++) {
    // row index 생성
    let idx = document.createElement("li");
    idx.className = "row_idx";
    idx.classList.add("seat");
    idx.classList.add("idx");
    idx.innerText = r + 1;
    lineArray[r].insertBefore(idx, lineArray[r].firstChild);

    // container 자식요소 추가
    container.appendChild(lineArray[r]);
  }
}

// 열과 행을 세는 함수
function countRange(colValue, rowValue) {
  colLabel.innerText = `열 ${colValue}개`;
  rowLabel.innerText = `행 ${rowValue}개`;
  countSeat();
}

function rangeChange(event, retry = false) {
  if (!retry) {
    // range input의 값이 달라지면 삭제한 seat 목록도 초기화
    deleteList.splice(0, deleteList.length);
  }

  // col과 row의 range input 값을 가져와서 createSeat 함수로 전달
  let colValue = col.value;
  let rowValue = row.value;
  createSeat(colValue, rowValue);
  countRange(colValue, rowValue);

  // seat 삭제중일때 range input 값이 달라져도 삭제중 지속을 위한 코드
  if (isDelStart) {
    isDelStart = false;
    chooseDelSeat();
  }
}

function handleNumBtn() {
  numForm.classList.toggle(NONE_CN);
  if (isNumSettingOn) {
    isNumSettingOn = false;
    numBtn.innerText = "번호 맞춤 설정";
    numInput.value = "";
  } else {
    isNumSettingOn = true;
    numBtn.innerText = "맞춤 설정 해제";
  }
}

function checkNumInput(input) {
  let isNumber = true;
  // 맞춤 설정 값이 숫자 또는 "-" 또는 "," 인지 확인
  for (let i = 0; i <= input.length - 1; i++) {
    num = input[i];
    if (
      (isNaN(num) && num != "-" && num != ",") ||
      (num == "-" && input[i + 1] == "-") // "-" 뒤에 "-"가 또 있을 경우 뽑기 못함
    ) {
      isNumber = false;
    }
  }
  return isNumber;
}

function handlePickBtn() {
  if (!isPickStart) {
    // 공백 삭제
    // let input = numInput.value.replaceAll(" ", "");
    // replaceAll 이 적용되지 않는 브라우저를 위한 코드
    let input = numInput.value;
    while (true) {
      newInput = input.replace(" ", "");
      if (newInput === input) {
        break;
      } else {
        input = newInput;
      }
    }

    // 없는 자리 설정 중일 경우
    if (isDelStart) {
      delBtn.click();
    }

    // 번호 맞춤 설정을 했을 경우
    if (isNumSettingOn && input != "") {
      numList = CustomizationNumList(input);
      let colValue = col.value;
      let rowValue = row.value;
      let seatCnt = colValue * rowValue - deleteList.length;

      if (!checkNumInput(input)) {
        alert(
          "맞춤 설정 오류 \n정수만 입력하였는지 ',' '-' 기호를 제대로 사용했는지 확인해주세요"
        );
      } else if (numList.length != seatCnt) {
        alert(
          `자리 개수 오류 \n사용자 맞춤 설정(${numList.length}개), 자리 개수(${seatCnt}개)를 맞춰주세요`
        );
      } else {
        disabled();
        pickRandomNum(numList);
      }
    } else {
      // 번호 맞춤 설정을 하지 않았을 경우
      numList = notCustomizationNumList();
      disabled();
      pickRandomNum(numList);
    }
  }
}

function pickRandomNum(numList) {
  let randomIdxList = [];
  for (let i = 0; i < numList.length; i++) {
    let randomNum = Math.floor(Math.random() * Math.floor(numList.length));
    if (randomIdxList.indexOf(randomNum) == -1) {
      randomIdxList.push(randomNum);
    } else {
      i -= 1;
    }
  }

  // randomIdxList에 따라 numList의 셔플 버전의 리스트인 randomNumList 생성
  let randomNumList = [];
  for (let i = 0; i < randomIdxList.length; i++) {
    randomNumList.push(numList[randomIdxList[i]]);
  }
  createRandomSeat(randomNumList);
}

// createSeat 함수 재활용
function createRandomSeat(numList) {
  // row를 담아둘 배열
  let lineArray = [];

  let colValue = col.value;
  let rowValue = row.value;

  // col과 row를 이차원으로 저장하기 위한 이중반복문
  for (let r = 1; r <= rowValue; r++) {
    // row 한줄에 해당하는 변수
    let line = document.createElement("ul");
    line.id = `row${r}`;
    line.className = "line";

    for (let c = 1; c <= colValue; c++) {
      // col 하나에 해당하는 변수
      let seat = document.createElement("li");
      seat.id = `${r},${c}`;
      seat.className = "seat";

      // 각각의 seat 변수의 자식요소
      let span = document.createElement("span");
      span.className = "random_num";

      // 삭제된 seat가 아니면 true 랜덤 숫자 작성
      if (deleteList.indexOf(seat.id) == -1) {
        span.innerText = numList[0];
        numList = numList.slice(1, numList.length);
      } else {
        seat.classList.add(DEL_CN);
      }
      seat.appendChild(span);
      line.appendChild(seat);
    }
    lineArray.push(line);
  }

  // hover 시 효과 해제
  pickBtn.classList.remove(BTN_HOVER_CN);
  pickBtn.removeEventListener("mouseenter", handleEnter);
  pickBtn.removeEventListener("mouseleave", handleLeave);

  // 뽑기 효과
  pickBtn.classList.add(RETRY_CN);
  paintSeat(lineArray);
  pickBtn.innerText = "다시!";
  // 다시하기 버튼 이벤트 연결
  pickBtn.addEventListener("click", handleRetry);
}

function handleRetry() {
  disabled();
  pickBtn.classList.remove(RETRY_CN);
  pickBtn.innerText = "뽑기!";
  rangeChange("", true);
  pickBtn.removeEventListener("click", handleRetry);

  // hover 시 효과 적용
  pickBtn.addEventListener("mouseenter", handleEnter);
  pickBtn.addEventListener("mouseleave", handleLeave);

  // console.log(closeBtns)
  closeBtns[0].click();
}

function disabled() {
  if (!isPickStart) {
    isPickStart = true;
    delBtn.setAttribute(DISABLED_CN, "");
    numBtn.setAttribute(DISABLED_CN, "");
    numInput.setAttribute(DISABLED_CN, "");
    col.setAttribute(DISABLED_CN, "");
    row.setAttribute(DISABLED_CN, "");
  } else {
    isPickStart = false;
    delBtn.removeAttribute(DISABLED_CN);
    numBtn.removeAttribute(DISABLED_CN);
    numInput.removeAttribute(DISABLED_CN);
    col.removeAttribute(DISABLED_CN);
    row.removeAttribute(DISABLED_CN);
  }
}

// 자리 개수 세는 함수
function countSeat() {
  let colValue = col.value;
  let rowValue = row.value;
  let cnt = colValue * rowValue - deleteList.length;
  seatCnt.innerText = cnt;
  seatCnt.classList.remove(CHANGE_CN);
  setTimeout(() => {
    seatCnt.classList.add(CHANGE_CN);
  }, 100);
}

// 모바일인지 또는 휴대폰인지 확인하는 함수
function isMoblie(isPhone = false) {
  const tempUser = navigator.userAgent;

  // isPhone이 true이면 휴대폰, false이면 휴대폰을 포함한 모바일 기기
  // if (isPhone) {
  //   if (
  //     (tempUser.indexOf("iPhone") > 0 ||
  //       tempUser.indexOf("iPot") > 0 ||
  //       tempUser.indexOf("Android") > 0) &&
  //     window.innerWidth <= 500 &&
  //     window.innerHeight <= 900
  //   ) {
  //     return true;
  //   }
  //   return false;
  // } else {
  if (
    tempUser.indexOf("iPhone") > 0 ||
    tempUser.indexOf("iPad") > 0 ||
    tempUser.indexOf("iPot") > 0 ||
    tempUser.indexOf("Android") > 0
  ) {
    return true;
  }
  return false;
  // }
}

// button hover 함수
function handleEnter(event) {
  const btn = event.target;
  btn.classList.add(BTN_HOVER_CN);
}
function handleLeave(event) {
  const btn = event.target;
  btn.classList.remove(BTN_HOVER_CN);
}

// scroll bar를 가지고 있는지 확인하는 함수
function hasScrollBar(el) {
  const x1 = el.scrollLeft;
  el.scrollLeft += 1;
  const x2 = el.scrollLeft;
  el.scrollLeft -= 1;
  const x3 = el.scrollLeft;
  el.scrollLeft = x1;
  return x1 !== x2 || x2 !== x3;
}

function handleScrollLeft() {
  container.scrollLeft -= 50;
}

function handleScrollRight() {
  container.scrollLeft += 50;
}

function init() {
  rangeChange();

  // 모바일 환경이 아니면 button hover 효과 추가
  if (!isMoblie()) {
    // hbtn class : hover를 사용하는 버튼이라는 표시
    const btns = document.querySelectorAll(".hbtn");
    btns.forEach((btn) => {
      btn.addEventListener("mouseenter", handleEnter);
      btn.addEventListener("mouseleave", handleLeave);
    });
  }

  // Event Listener
  col.addEventListener("input", rangeChange);
  row.addEventListener("input", rangeChange);
  numBtn.addEventListener("click", handleNumBtn);
  delBtn.addEventListener("click", chooseDelSeat);
  pickBtn.addEventListener("click", handlePickBtn);
}

init();

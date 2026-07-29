const API_URL =
  "https://script.google.com/macros/s/AKfycbxgmfJoOsG3d8uL7pnHB9GqJMf61jS-1la-aZeWX9aA5q7o5mhnce381-C3bvyqGqiZ/exec";


const STORE_NAME = "길채정 압구정점";
const BRAND_NAME = "길채정";

document.addEventListener("DOMContentLoaded", function () {

  setDefaultDates();
  loadDashboard();
  loadRecentLogs();

});

/* =========================
   TAB
========================= */

function showTab(id, btn) {

  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.remove("active");
  });

  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  btn.classList.add("active");

  if (id === "history") {
    loadRecentLogs();
  }

}

/* =========================
   API
========================= */

function checkApi() {

  if (
    !API_URL ||
    API_URL.includes("입력")
  ) {

    alert(
      "store-manager.js 상단 API_URL에 Apps Script 웹앱 주소를 입력하세요."
    );

    return false;
  }

  return true;

}

async function api(params) {

  if (!checkApi()) {
    throw new Error("API URL 미설정");
  }

  const query =
    new URLSearchParams(params);

  const res =
    await fetch(
      API_URL + "?" + query.toString()
    );

  return await res.json();

}

/* =========================
   UTIL
========================= */

function val(id) {

  const el =
    document.getElementById(id);

  return el
    ? el.value.trim()
    : "";

}

function setDefaultDates() {

  const today = new Date();

  const yyyy =
    today.getFullYear();

  const mm =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const dd =
    String(today.getDate())
      .padStart(2, "0");

  const dateText =
    `${yyyy}-${mm}-${dd}`;

  [
    "dailyDate",
    "employeeDate",
    "customerDate",
    "facilityDate",
    "hygieneDate",
    "complaintDate"
  ].forEach(id => {

    const el =
      document.getElementById(id);

    if (el && !el.value) {
      el.value = dateText;
    }

  });

}

/* =========================
   SAVE
========================= */

async function saveLog(payload) {
  try {

    const data = await api({
      action: "saveStoreDailyLog",
      ...payload
    });

    if (data.success === false) {
      throw new Error(
        data.message ||
        "저장에 실패했습니다."
      );
    }

    alert(
      data.message ||
      "저장되었습니다."
    );

    await loadDashboard();
    await loadRecentLogs();

  } catch (e) {

    console.error(e);

    alert(
      "저장 중 오류가 발생했습니다.\n" +
      e.message
    );
  }
}

/* =========================
   DAILY
========================= */

function saveDailyReport() {

  saveLog({

    type: "일일보고",
    store: STORE_NAME,

    date:
      val("dailyDate"),

    writer:
      val("dailyWriter"),

    urgency:
      val("dailyUrgency"),

    title:
      "일일 운영보고",

    category:
      "일일보고",

    content:
      val("dailyIssue"),

    request:
      val("dailyRequest"),

    extra:
      val("dailyTomorrow"),

    status:
      "본사미확인"

  });

}

/* =========================
   EMPLOYEE
========================= */

function saveEmployeeLog() {

  saveLog({

    type: "직원관리",
    store: STORE_NAME,

    date:
      val("employeeDate"),

    writer:
      val("employeeName"),

    urgency:
      val("employeeUrgency"),

    title:
      val("employeeType"),

    category:
      val("employeeType"),

    content:
      val("employeeMemo"),

    request: "",
    extra: "",

    status:
      val("employeeStatus")

  });

}

/* =========================
   CUSTOMER
========================= */

function saveCustomerLog() {

  saveLog({

    type: "고객관리",
    store: STORE_NAME,

    date:
      val("customerDate"),

    writer:
      val("customerName"),

    urgency:
      val("customerUrgency"),

    title:
      val("customerType"),

    category:
      val("customerType"),

    content:
      val("customerMemo"),

    request:
      val("customerTime"),

    extra: "",

    status:
      "본사미확인"

  });

}

/* =========================
   FACILITY
========================= */

function saveFacilityLog() {

  saveLog({

    type: "설비관리",
    store: STORE_NAME,

    date:
      val("facilityDate"),

    writer:
      "",

    urgency:
      "일반",

    title:
      val("facilityType"),

    category:
      val("facilityStatus"),

    content:
      val("facilityMemo"),

    request: "",
    extra: "",

    status:
      "본사미확인"

  });

}

/* =========================
   HYGIENE
========================= */

function saveHygieneLog() {

  saveLog({

    type: "위생점검",
    store: STORE_NAME,

    date:
      val("hygieneDate"),

    writer:
      "",

    urgency:
      "일반",

    title:
      val("hygieneType"),

    category:
      val("hygieneResult"),

    content:
      val("hygieneMemo"),

    request: "",
    extra: "",

    status:
      "본사미확인"

  });

}

/* =========================
   COMPLAINT
========================= */

function saveComplaintLog() {

  saveLog({

    type: "컴플레인",
    store: STORE_NAME,

    date:
      val("complaintDate"),

    writer:
      "",

    urgency:
      "중요",

    title:
      val("complaintType"),

    category:
      val("complaintType"),

    content:
      val("complaintMemo"),

    request: "",
    extra: "",

    status:
      "본사미확인"

  });

}

/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {

  try {

    const data =
      await api({
        action:
          "getStoreManagerDashboard",
        store:
          STORE_NAME
      });

    document.getElementById(
      "todayCount"
    ).textContent =
      data.todayCount || 0;

    document.getElementById(
      "urgentCount"
    ).textContent =
      data.urgentCount || 0;

    document.getElementById(
      "pendingCount"
    ).textContent =
      data.pendingCount || 0;

  } catch (e) {

    console.log(e);

  }

}

/* =========================
   RECENT
========================= */

async function loadRecentLogs() {
  const box =
    document.getElementById(
      "recentList"
    );

  if (!box) {
    return;
  }

  box.innerHTML = `
    <div class="recent-loading">
      최근내역을 불러오는 중입니다.
    </div>
  `;

  try {

    const data = await api({
      action: "getStoreManagerLogs",
      store: STORE_NAME,
      t: Date.now()
    });

    if (data.success === false) {
      throw new Error(
        data.message ||
        "최근내역 조회에 실패했습니다."
      );
    }

    const logs =
      Array.isArray(data.logs)
        ? data.logs
        : [];

    if (logs.length === 0) {

      box.innerHTML = `
        <div class="recent-loading">
          등록된 내역이 없습니다.
        </div>
      `;

      return;
    }

    box.innerHTML =
      logs.map(function(log) {

        const urgency =
          String(
            log.urgency ||
            "일반"
          ).trim();

        const urgencyClass =
          urgency === "긴급"
            ? "urgent"
            : urgency === "중요"
              ? "important"
              : "normal";

        const status =
          normalizeStoreStatus(
            log.status,
            log.hqCheck ||
            log.hqChecked
          );

        const statusClass =
          getStoreStatusClass(
            status
          );

        const feedback =
          String(
            log.feedback ||
            ""
          ).trim() ||
          extractHeadOfficeFeedback(
            log.extra
          );

        const checkedAt =
          log.checkedAt || "";

        return `
          <article
            class="recent-item ${
              urgency === "긴급"
                ? "urgent"
                : ""
            }">

            <div class="recent-item-header">

              <div>

                <div class="recent-item-title">
                  ${escapeHtml(
                    log.title ||
                    log.category ||
                    log.type ||
                    "매장 운영기록"
                  )}
                </div>

                <div class="recent-item-meta">

                  ${escapeHtml(
                    log.date ||
                    log.createdAt ||
                    ""
                  )}

                  ${
                    log.store
                      ? " · " +
                        escapeHtml(log.store)
                      : ""
                  }

                  ${
                    log.type
                      ? " · " +
                        escapeHtml(log.type)
                      : ""
                  }

                  ${
                    log.writer
                      ? " · 작성자 " +
                        escapeHtml(log.writer)
                      : ""
                  }

                </div>

              </div>

              <span
                class="recent-status-badge ${statusClass}">

                ${escapeHtml(
                  getStoreStatusLabel(status)
                )}

              </span>

            </div>

            <div class="recent-content">

              <strong>구분</strong>
              ${escapeHtml(
                log.category || "-"
              )}

              <br>

              <strong>내용</strong>
              ${escapeHtml(
                log.content || "-"
              )}

              ${
                log.request
                  ? `
                    <br>
                    <strong>요청사항</strong>
                    ${escapeHtml(log.request)}
                  `
                  : ""
              }

            </div>

            <div style="margin-top:12px;">

              <span class="badge ${urgencyClass}">
                ${escapeHtml(urgency)}
              </span>

            </div>

            ${
              feedback
                ? `
                  <div class="head-office-feedback">

                    <div class="head-office-feedback-title">
                      본사 처리내용
                    </div>

                    <div class="head-office-feedback-content">
                      ${escapeHtml(feedback)}
                    </div>

                    ${
                      checkedAt
                        ? `
                          <div class="head-office-checked-at">
                            본사 확인일시:
                            ${escapeHtml(checkedAt)}
                          </div>
                        `
                        : ""
                    }

                  </div>
                `
                : status !== "미확인"
                  ? `
                    <div class="head-office-feedback">

                      <div class="head-office-feedback-title">
                        본사 처리상태
                      </div>

                      <div class="head-office-feedback-content">
                        ${escapeHtml(
                          getStoreStatusLabel(status)
                        )}
                      </div>

                      ${
                        checkedAt
                          ? `
                            <div class="head-office-checked-at">
                              본사 확인일시:
                              ${escapeHtml(checkedAt)}
                            </div>
                          `
                          : ""
                      }

                    </div>
                  `
                  : ""
            }

          </article>
        `;

      }).join("");

  } catch (e) {

    console.error(e);

    box.innerHTML = `
      <div class="recent-loading">
        최근내역을 불러오지 못했습니다.<br>
        ${escapeHtml(e.message)}
      </div>
    `;
  }
}
function normalizeStoreStatus(
  status,
  hqCheck
) {
  const statusText =
    String(status || "").trim();

  const checkText =
    String(hqCheck || "").trim();

  if (statusText === "조치완료") {
    return "조치완료";
  }

  if (statusText === "확인완료") {
    return "확인완료";
  }

  if (statusText === "조치필요") {
    return "조치필요";
  }

  if (
    statusText === "보완요청" ||
    statusText === "보완사항"
  ) {
    return "보완요청";
  }

  if (statusText === "확인사항") {
    return "확인사항";
  }

  if (
    checkText === "Y" ||
    checkText === "확인완료"
  ) {
    return "확인완료";
  }

  if (
    statusText === "" ||
    statusText === "미확인" ||
    statusText === "본사미확인"
  ) {
    return "미확인";
  }

  return statusText;
}


function getStoreStatusLabel(status) {
  const text =
    String(status || "").trim();

  if (text === "미확인") {
    return "본사 미확인";
  }

  if (text === "확인사항") {
    return "본사 확인사항";
  }

  if (text === "보완요청") {
    return "본사 보완요청";
  }

  if (text === "조치필요") {
    return "조치필요";
  }

  if (text === "확인완료") {
    return "확인완료";
  }

  if (text === "조치완료") {
    return "조치완료";
  }

  return text || "본사 미확인";
}


function getStoreStatusClass(status) {
  const text =
    String(status || "").trim();

  if (text === "확인사항") {
    return "status-check";
  }

  if (text === "보완요청") {
    return "status-supplement";
  }

  if (text === "조치필요") {
    return "status-action";
  }

  if (
    text === "확인완료" ||
    text === "조치완료"
  ) {
    return "status-complete";
  }

  return "status-pending";
}


function extractHeadOfficeFeedback(value) {
  const text =
    String(value || "");

  const marker =
    "[본사피드백]";

  const index =
    text.lastIndexOf(marker);

  if (index < 0) {
    return "";
  }

  return text
    .substring(
      index + marker.length
    )
    .trim();
}


function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
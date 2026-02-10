/**
 * V68.5 財富戰情室 (旗艦完整版)
 * 包含：Gemini 2.5 引擎、混合批次處理、資料庫過濾API
 */

// ========== 1. 系統參數設定區 ==========

// ✅ 使用您帳號權限確認過的 2.5 Flash 模型
const MODEL_NAME = 'gemini-2.5-flash'; 

// ⚠️ 請在此填入您的 API KEY
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || "AIzaSyAR-TNuZwh08kj6sfZWgMxOw4mdAsv5_To";

// 資料庫與資料夾 ID (已填入您的專屬 ID)
const SHEET_ID = "1yUf_7kUA7eg4ULxk1cz1eivAzhCewKt1T-A8VV6PIek"; 
const SHEET_TAB_NAME = "db_policy"; 
const INPUT_FOLDER_ID = "1J7NFofgOJe8XPfwZ_0I1kHLX7Wyfo6O7"; 


// ========== V68.51 數據鎖定版 ==========
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setTitle('V68.51 旗艦修復版');
}

function getPortfolioData() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID); 
    const sheet = ss.getSheetByName(SHEET_TAB_NAME);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { error: "資料庫為空。" };

    const dataRange = sheet.getRange(2, 1, lastRow - 1, 19).getValues();
    const clientName = dataRange[0][16] || "林佑恩"; 
    const birthdayVal = dataRange[0][17];          
    const currentYear = 2026;
    let currentAge = 26; 
    if (birthdayVal instanceof Date) { currentAge = currentYear - birthdayVal.getFullYear(); }

    let policyList = [];
    for (let i = 0; i < dataRange.length; i++) {
      let row = dataRange[i];
      if (!row[1]) continue; 
      policyList.push({
        policyNo: row[18], name: row[1], currency: row[2],
        values: [Number(row[3])||0, Number(row[4])||0, Number(row[5])||0, Number(row[6])||0, Number(row[7])||0, Number(row[8])||0],
        remark: row[9], safetyScore: row[10], yieldScore: row[11],
        protectionValue: Number(row[12])||0, totalTerms: Number(row[13])||20, paidYears: Number(row[14])||0, aiAdvice: row[15] || ""
      });
    }
    return { clientName: clientName, currentAge: currentAge, yearsToRetire: 65 - currentAge, policies: policyList };
  } catch (e) { return { error: "後端抓取失敗：" + e.toString() }; }
}

/**
 * 實測通過：啟動保單編修彈窗
 */
function showPolicyEditDialog(p) {
  var html = HtmlService.createTemplateFromFile('EditForm');
  html.policy = p; 
  var output = html.evaluate()
      .setWidth(500)
      .setHeight(650)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(output, '保單編修：' + p.name);
}

function updatePolicyData(data) {
  Logger.log("接收更新: " + JSON.stringify(data));
  return "OK";
}

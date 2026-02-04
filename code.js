// ========== V68.39 核心精算邏輯 (第 11 行開始) ==========

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setTitle('V68.39 林佑恩實名診斷');
}

/**
 * 核心數據抓取：鎖定 A-R 欄位 (共 18 欄)
 * Q (16): 姓名 | R (17): 生日
 */
function getPortfolioData() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID); 
    const sheet = ss.getSheetByName(SHEET_TAB_NAME);
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) return { error: "資料庫 db_policy 尚無數據，請確認試算表內容。" };

    // 讀取 A-R 欄位
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 18).getValues();
    
    // 客戶實名資訊
    const clientName = dataRange[0][16] || "林佑恩"; 
    const birthdayVal = dataRange[0][17];         
    
    // 以 2026 為基準計算年齡
    const currentYear = 2026;
    let currentAge = 26; 
    if (birthdayVal instanceof Date) {
      currentAge = currentYear - birthdayVal.getFullYear();
    } else if (birthdayVal) {
      currentAge = currentYear - new Date(birthdayVal).getFullYear();
    }

    // 計算 65 歲退休跨度
    const yearsToRetire = 65 - currentAge;

    let policyList = [];
    for (let i = 0; i < dataRange.length; i++) {
      let row = dataRange[i];
      if (!row[1]) continue; 

      policyList.push({
        name: row[1],
        currency: row[2],
        // D-I 欄數據：[1, 10, 20, 30, 40, 50, 60]
        values: [ 
          Number(row[3])||0, Number(row[4])||0, Number(row[5])||0, 
          Number(row[6])||0, Number(row[7])||0, Number(row[8])||0 
        ],
        scores: {
          liquidity: Number(row[10]) || 5,
          safety: Number(row[11]) || 5,
          yield: Number(row[12]) || 5,
          protection: Number(row[13]) || 5
        }
      });
    }

    return {
      clientName: clientName,
      currentAge: currentAge,
      yearsToRetire: yearsToRetire,
      policies: policyList
    };
  } catch (e) {
    return { error: "後端連線異常: " + e.toString() };
  }
}

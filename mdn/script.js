document.addEventListener('DOMContentLoaded', () => {
    loadAndCompareFiles();
});

async function loadAndCompareFiles() {
    const statusDiv = document.getElementById('status');
    const originalContainer = document.getElementById('originalParagraphs');
    const translatedContainer = document.getElementById('translatedParagraphs');
    const file1Path = '1.md'; // 假設 1.md 與 index.html 在同一目錄
    const file2Path = '2.md'; // 假設 2.md 與 index.html 在同一目錄

    try {
        // 使用 Promise.all 同時發起兩個 fetch 請求
        const [response1, response2] = await Promise.all([
            fetch(file1Path),
            fetch(file2Path)
        ]);

        // 檢查請求是否成功
        if (!response1.ok) {
            throw new Error(`無法載入 ${file1Path}: ${response1.statusText}`);
        }
        if (!response2.ok) {
            throw new Error(`無法載入 ${file2Path}: ${response2.statusText}`);
        }

        // 讀取文件內容為文字
        const originalText = await response1.text();
        const translatedText = await response2.text();

        statusDiv.textContent = '文件載入完成，正在比對...'; // 更新狀態

        // --- 段落分割與渲染邏輯 (與之前類似) ---

        // 1. 段落分割 (視為純文本，按空白行分割)
        const originalParagraphs = originalText.split(/(\s*\n){2,}/).filter(p => p && p.trim()).map(p => p.trim());
        const translatedParagraphs = translatedText.split(/(\s*\n){2,}/).filter(p => p && p.trim()).map(p => p.trim());

        // 清空可能存在的舊內容 (雖然這裡應該不需要)
        originalContainer.innerHTML = '';
        translatedContainer.innerHTML = '';

        // 2. 渲染段落並添加對應關係
        const maxParagraphs = Math.max(originalParagraphs.length, translatedParagraphs.length);

        for (let i = 0; i < maxParagraphs; i++) {
            const pId = `p-${i}`; // 為每對段落設定一個唯一的 ID

            // 創建原文段落元素
            const originalP = document.createElement('div');
            originalP.classList.add('paragraph');
            originalP.dataset.pairId = pId;
            originalP.textContent = originalParagraphs[i] || '';
            if (!originalParagraphs[i]) {
                originalP.style.backgroundColor = '#f0f0f0';
                originalP.style.fontStyle = 'italic';
                originalP.textContent = '[無對應段落]';
            }
            originalContainer.appendChild(originalP);

            // 創建譯文段落元素
            const translatedP = document.createElement('div');
            translatedP.classList.add('paragraph');
            translatedP.dataset.pairId = pId;
            translatedP.textContent = translatedParagraphs[i] || '';
            if (!translatedParagraphs[i]) {
                translatedP.style.backgroundColor = '#f0f0f0';
                translatedP.style.fontStyle = 'italic';
                translatedP.textContent = '[無對應段落]';
            }
            translatedContainer.appendChild(translatedP);
        }

        // 3. 添加互動高亮事件監聽
        addHighlightListeners();

        statusDiv.style.display = 'none'; // 隱藏狀態提示

    } catch (error) {
        console.error('載入或處理文件時出錯:', error);
        statusDiv.textContent = `錯誤: ${error.message}`;
        statusDiv.style.color = 'red';
    }
}

function addHighlightListeners() {
    const allParagraphs = document.querySelectorAll('.paragraph');
    allParagraphs.forEach(p => {
        p.addEventListener('mouseover', handleMouseOver);
        p.addEventListener('mouseout', handleMouseOut);
        // 如果需要點擊高亮，取消註解下一行並使用對應的 handleClick 函數
        // p.addEventListener('click', handleClick);
    });
}

// --- 高亮處理函數 (與之前相同) ---
function handleMouseOver(event) {
    const pairId = event.target.dataset.pairId;
    if (!pairId) return;
    highlightPair(pairId, true);
}

function handleMouseOut(event) {
    const pairId = event.target.dataset.pairId;
    if (!pairId) return;
    highlightPair(pairId, false);
}

// (如果使用點擊，保留 handleClick 函數)
/*
let currentlyClickedPairId = null;
function handleClick(event) {
    // ... (與上個版本相同)
}
*/

function highlightPair(pairId, addHighlight) {
    const pairedElements = document.querySelectorAll(`.paragraph[data-pair-id="${pairId}"]`);
    pairedElements.forEach(el => {
        if (addHighlight) {
            el.classList.add('highlighted');
        } else {
            el.classList.remove('highlighted');
        }
    });
}

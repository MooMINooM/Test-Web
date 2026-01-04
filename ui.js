// js/ui.js - Lumina Bento Edition (Full Logic & Design Fix)

// --- Global Variable Containers ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config ---
const ITEMS_PER_PAGE = 6; // ปรับเป็น 6 ตามโจทย์อาจารย์ทุกเมนู

// --- State ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER: PAGINATION RENDERER (Lumina Style)
// =============================================================================
function renderPagination(containerId, totalItems, perPage, currentPage, callback) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId + '-pagination');
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<div class="flex justify-center items-center gap-2 mt-8">`;
    for (let i = 1; i <= totalPages; i++) {
        html += `
        <button onclick="${callback}(${i}); window.scrollTo({top: 0, behavior: 'smooth'})" 
            class="w-10 h-10 rounded-xl font-bold text-xs transition-all duration-300 border shadow-sm 
            ${i === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:text-blue-500 hover:border-blue-200'}">
            ${i}
        </button>`;
    }
    html += `</div>`;
    container.innerHTML = html;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (Lumina Style)
// =============================================================================
export function renderSchoolInfo(info) {
    if (!info) return;
    if (info.school_name) document.title = info.school_name;

    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (logoBasic && info.logo_url) {
        logoBasic.src = info.logo_url;
        logoBasic.classList.remove('hidden');
        if (logoPlaceholder) logoPlaceholder.classList.add('hidden');
    }

    const fields = {
        'header-school-name': info.school_name,
        'header-affiliation': info.affiliation,
        'hero-motto': info.motto,
        'school-history-content': info.history,
        'info-vision': info.vision,
        'school-mission-content': info.mission,
        'info-philosophy': info.philosophy,
        'info-motto': info.motto,
        'school-identity-content': info.identity,
        'school-uniqueness-content': info.uniqueness,
        'info-name-th': info.school_name,
        'info-name-en': info.school_name_en,
        'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8,
        'info-obec-code': info.obec_code_6,
        'info-address': info.address
    };

    for (const [id, val] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
    }

    if (info.founding_date && document.getElementById('school-age-badge')) {
        const age = new Date().getFullYear() - new Date(info.founding_date).getFullYear();
        document.getElementById('school-age-badge').innerText = age;
    }

    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#3b82f6';
        const c2 = info.color_code_2 || c1;
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    if (document.getElementById('school-map-container') && info.map_embed) {
        document.getElementById('school-map-container').innerHTML = info.map_embed;
        const ifr = document.getElementById('school-map-container').querySelector('iframe');
        if(ifr) { ifr.style.width="100%"; ifr.style.height="100%"; ifr.style.border="0"; ifr.style.borderRadius="2rem"; }
    }
}

// =============================================================================
// 3. NEWS SYSTEM (✅ แก้ไขดึงครบ + แบ่งหน้า 6)
// =============================================================================
export function renderNews(data, page = 1) {
    if (!data) return;
    if (page === 1) allNewsData = data;
    const source = data.length > 0 ? data : allNewsData;

    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';

    const start = (page - 1) * ITEMS_PER_PAGE;
    const pageItems = source.slice(start, start + ITEMS_PER_PAGE);

    pageItems.forEach(news => {
        container.innerHTML += `
        <div class="bg-white/80 backdrop-blur border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 flex flex-col md:flex-row gap-8 mb-8 group cursor-pointer" onclick="window.open('${news.link || '#'}', '_blank')">
            <div class="w-full md:w-64 h-48 bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-image text-5xl"></i></div>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div>
                    <h4 class="font-bold text-2xl text-slate-800 group-hover:text-blue-600 transition line-clamp-2">${news.title}</h4>
                    <p class="text-sm text-slate-500 mt-4 line-clamp-2 font-light">ข้อมูลประชาสัมพันธ์ประจำวันที่ ${new Date(news.date).toLocaleDateString('th-TH')}</p>
                </div>
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest"><i class="fa-regular fa-clock text-blue-400 mr-2"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-xs font-black group-hover:translate-x-3 transition duration-500 uppercase tracking-widest">อ่านต่อ <i class="fa-solid fa-chevron-right ml-1"></i></span>
                </div>
            </div>
        </div>`;
    });

    renderPagination('news', source.length, ITEMS_PER_PAGE, page, 'window.renderNewsPage');
}
window.renderNewsPage = (p) => renderNews(allNewsData, p);

// =============================================================================
// 4. ACHIEVEMENT SYSTEM (✅ แก้ไขโฟลเดอร์ + ข้อมูลละเอียด + แบ่งหน้า 6)
// =============================================================================
export function renderAchievementSystem(containerId, data, type, page = 1) {
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // สำรองข้อมูลลง Global เมื่อดึงครั้งแรก
    if (type === 'teacher') allTeacherData = data;
    if (type === 'student') allStudentData = data;
    if (type === 'school') allSchoolData = data;

    container.innerHTML = '';

    if (currentFolderFilter === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0 };
            acc[key].count++;
            return acc;
        }, {});

        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8";
        Object.keys(groups).forEach(name => {
            container.innerHTML += `
            <div onclick="window.selectFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="w-20 h-20 bg-blue-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100 group-hover:rotate-12 transition duration-700"><i class="fa-solid fa-folder-open"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1">${name}</h4>
                <div class="mt-4 font-black text-[10px] text-blue-400 bg-blue-50/50 px-4 py-1.5 rounded-full inline-block uppercase tracking-widest">${groups[name].count} รายการ</div>
            </div>`;
        });
    } else {
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

        container.className = "space-y-10 animate-fade-in";
        let html = `
            <div class="flex items-center justify-between bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 class="font-bold text-xl text-slate-800 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${currentFolderFilter}</h3>
                <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full border border-blue-100 shadow-sm hover:shadow-md transition-all"><i class="fa-solid fa-arrow-left mr-2"></i> ย้อนกลับ</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">`;

        pageItems.forEach(item => {
            html += `
            <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-[0.8s] cursor-pointer" onclick="window.open('${item.image || item.file_url || '#'}', '_blank')">
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : '<i class="fa-solid fa-award text-7xl absolute inset-0 m-auto text-slate-100"></i>'}
                    <div class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-blue-600 shadow-xl border border-white/50 text-center line-clamp-1">🏆 ${item.title || 'ประกาศนียบัตร'}</div>
                </div>
                <div class="p-8 text-center space-y-4">
                    <h4 class="font-bold text-lg text-slate-800 line-clamp-2 h-12 leading-snug group-hover:text-blue-600 transition-colors">${item.students || item.name || '-'}</h4>
                    <div class="pt-4 border-t border-slate-50 space-y-2 text-left">
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">${item.program || '-'}</p></div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">${item.competition || '-'}</p></div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div><div id="${containerId}-pagination"></div>`;
        container.innerHTML = html;

        renderPagination(containerId, filtered.length, ITEMS_PER_PAGE, page, `window.renderAchPage('${containerId}', '${type}')`);
    }
}
window.renderAchPage = (cid, type) => (p) => {
    const source = type === 'teacher' ? allTeacherData : (type === 'student' ? allStudentData : allSchoolData);
    renderAchievementSystem(cid, source, type, p);
};

// =============================================================================
// 5. DOCUMENT SYSTEM (Lumina Bento)
// =============================================================================
export function renderDocumentSystem(data, containerId, type = 'official', page = 1) {
    if (!data) return;
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;
    const container = document.getElementById(containerId);
    if (!container) return;
    const current = currentDocFolder[type];

    if (current === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.category || 'ทั่วไป';
            if (!acc[key]) acc[key] = 0; acc[key]++;
            return acc;
        }, {});
        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8";
        container.innerHTML = Object.entries(groups).map(([name, count]) => `
            <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="w-20 h-20 bg-amber-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-amber-500 mx-auto mb-6 shadow-sm border border-amber-100 group-hover:rotate-12 transition duration-700"><i class="fa-solid fa-folder-closed"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1">${name}</h4>
                <div class="mt-4"><span class="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-50/50 px-4 py-1.5 rounded-full border border-amber-50">${count} Files</span></div>
            </div>`).join('');
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

        container.className = "space-y-4 animate-fade-in";
        let html = `
            <div class="flex items-center justify-between bg-slate-100/50 backdrop-blur p-5 rounded-[2rem] border border-white/50 mb-10">
                <h3 class="font-bold text-xl text-slate-700 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 bg-white/80 px-5 py-2.5 rounded-full border border-white shadow-sm hover:shadow-md">ย้อนกลับ</button>
            </div>
            <div class="grid grid-cols-1 gap-4">`;
        
        pageItems.forEach(doc => {
            html += `
            <div class="group bg-white/80 backdrop-blur-sm p-5 rounded-[1.8rem] border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-700 cursor-pointer shadow-sm" onclick="window.open('${doc.fileUrl}', '_blank')">
                <div class="flex items-center gap-6">
                    <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:rotate-3 transition-all duration-500 shadow-inner"><i class="fa-solid fa-file-lines"></i></div>
                    <div>
                        <h4 class="font-bold text-base text-slate-700 group-hover:text-blue-600 transition-colors">${doc.title}</h4>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1"><i class="fa-regular fa-clock text-blue-300"></i> ${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p>
                    </div>
                </div>
                <div class="p-3 rounded-full bg-slate-50 text-slate-200 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm"><i class="fa-solid fa-download text-sm"></i></div>
            </div>`;
        });
        html += `</div><div id="${containerId}-pagination"></div>`;
        container.innerHTML = html;

        renderPagination(containerId, filtered.length, ITEMS_PER_PAGE, page, `window.renderDocPage('${containerId}', '${type}')`);
    }
}
window.renderDocPage = (cid, type) => (p) => {
    const source = type === 'official' ? allOfficialDocs : allFormDocs;
    renderDocumentSystem(source, cid, type, p);
};

// =============================================================================
// 6. OTHER COMPONENTS (Lumina Bento)
// =============================================================================
export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!data.length) return;
    const sorted = [...data].sort((a, b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);
    const createCard = (p, isLeader = false) => `
        <div class="relative group rounded-[2.5rem] p-8 ${isLeader ? 'bg-gradient-to-b from-white to-blue-50/50 border-blue-100 shadow-xl' : 'bg-white/80 backdrop-blur border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2'} overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full">
            <div class="w-36 h-36 rounded-full overflow-hidden border-[6px] ${isLeader ? 'border-blue-100' : 'border-white'} shadow-2xl bg-white mb-6 group-hover:scale-105 group-hover:rotate-3 transition duration-700">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-6xl m-12 text-slate-200"></i>`}
            </div>
            <h3 class="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">${p.name}</h3>
            <div class="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 mt-3"><p class="text-xs text-slate-500 font-bold uppercase tracking-widest">${p.role}</p></div>
        </div>`;
    if (leader) container.innerHTML += `<div class="flex justify-center mb-16">${createCard(leader, true)}</div>`;
    if (others.length) {
        let grid = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">`;
        others.forEach(p => grid += createCard(p));
        container.innerHTML += grid + `</div>`;
    }
}

export function renderStudentChart(data) {
    const summary = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');
    if (!data.length) return;
    let totalM = 0, totalF = 0;
    data.forEach(d => { totalM += parseInt(d.male || 0); totalF += parseInt(d.female || 0); });

    if (summary) {
        summary.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl text-white group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl border border-white/10 group-hover:rotate-12 transition"><i class="fa-solid fa-users"></i></div>
                    <div><p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">ทั้งหมด</p><h3 class="text-4xl font-black">${totalM+totalF}</h3></div>
                </div>
            </div>
            </div>`;
        // (ส่วน Male/Female ก๊อปจาก Total ไปเปลี่ยนสี/ไอคอนได้เลยครับ)
    }

    if (chartCanvas && window.Chart) {
        chartCanvas.parentElement.className = "bg-white/90 backdrop-blur rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100 overflow-hidden";
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar', data: {
                labels: data.map(d => d.grade),
                datasets: [
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8 },
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); if(!c || !newsList.length) return;
    c.innerHTML = '';
    [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => {
        c.innerHTML += `
        <div class="p-5 border-b border-slate-50 flex gap-5 hover:bg-white/80 hover:backdrop-blur-sm cursor-pointer transition-all duration-500 rounded-[1.5rem] group" onclick="window.open('${n.link || '#'}', '_blank')">
            <div class="w-24 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                ${n.image ? `<img src="${n.image}" class="w-full h-full object-cover">` : ''}
            </div>
            <div class="flex-1 space-y-2 py-0.5">
                <h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> ${new Date(n.date).toLocaleDateString('th-TH')}</p>
            </div>
        </div>`; 
    }); 
}

// =============================================================================
// 7. WINDOW BRIDGE (Search & Click Actions)
// =============================================================================
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };

// ✅ ฟังก์ชันค้นหาผลงาน
window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const source = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    const filtered = source.filter(i => (i.title+i.students+i.name+i.competition+i.program).toLowerCase().includes(val));
    currentFolderFilter = val ? 'ผลการค้นหา' : null;
    renderAchievementSystem(containerId, filtered, type);
};

// ✅ ฟังก์ชันค้นหาข่าว
window.filterNews = (inputId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const filtered = allNewsData.filter(i => i.title.toLowerCase().includes(val));
    renderNews(filtered);
};

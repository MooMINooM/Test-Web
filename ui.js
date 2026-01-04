// js/ui.js - Lumina Bento Edition (Final Logic Fix)

// --- Global Variables (สำคัญมาก: ห้ามลบ เพื่อให้ระบบค้นหาและแบ่งหน้าทำงานได้) ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config (6 รายการต่อหน้าตามสั่ง) ---
const ITEMS_PER_PAGE = 6;

// --- State ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER: PAGINATION RENDERER (ลูกเล่นปุ่มกดแบบ Lumina)
// =============================================================================
function renderPagination(containerId, totalItems, perPage, currentPage, callback) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }

    let html = `<div class="flex justify-center items-center gap-2 mt-8 animate-fade-in">`;
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        html += `
        <button onclick="${callback}(${i}); window.scrollTo({top: 0, behavior: 'smooth'})" 
            class="w-10 h-10 rounded-xl font-bold transition-all duration-300 shadow-sm border 
            ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 scale-110' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-300 hover:text-blue-500'}">
            ${i}
        </button>`;
    }
    html += `</div>`;
    container.innerHTML = html;
}

// =============================================================================
// 2. SCHOOL INFO (Lumina Bento Skin)
// =============================================================================
export function renderSchoolInfo(info) {
    if (!info) return;
    if (info.school_name) document.title = info.school_name;
    
    // Mapping IDs
    const mapping = {
        'header-school-name': info.school_name,
        'header-affiliation': info.affiliation,
        'hero-motto': info.motto,
        'info-name-th': info.school_name,
        'info-name-en': info.school_name_en,
        'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8,
        'info-obec-code': info.obec_code_6,
        'info-affiliation-val': info.affiliation,
        'info-address': info.address,
        'school-history-content': info.history,
        'info-vision': info.vision,
        'school-mission-content': info.mission,
        'info-philosophy': info.philosophy,
        'info-motto-val': info.motto,
        'school-identity-content': info.identity,
        'school-uniqueness-content': info.uniqueness
    };

    for (const [id, val] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
    }

    // Logo & Placeholders
    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (logoBasic && info.logo_url) {
        logoBasic.src = info.logo_url;
        logoBasic.classList.remove('hidden');
        if(logoPlaceholder) logoPlaceholder.classList.add('hidden');
    }

    // Color Theme
    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#3b82f6';
        const c2 = info.color_code_2 || c1;
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    // Map logic
    if (document.getElementById('school-map-container') && info.map_embed) {
        const mc = document.getElementById('school-map-container');
        mc.innerHTML = info.map_embed;
        const ifr = mc.querySelector('iframe');
        if(ifr) { ifr.style.width="100%"; ifr.style.height="100%"; ifr.style.border="0"; ifr.style.borderRadius="2rem"; }
    }
}

// =============================================================================
// 3. NEWS SYSTEM (Fix: ดึงครบ + Pagination)
// =============================================================================
export function renderNews(data, page = 1) {
    if (!data) return;
    if (allNewsData.length === 0) allNewsData = data; 
    const source = data;

    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';

    const start = (page - 1) * ITEMS_PER_PAGE;
    const items = source.slice(start, start + ITEMS_PER_PAGE);

    items.forEach(news => {
        container.innerHTML += `
        <div class="bg-white/80 backdrop-blur border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 flex flex-col lg:flex-row gap-8 mb-8 group cursor-pointer" onclick="window.open('${news.link || '#'}', '_blank')">
            <div class="w-full lg:w-64 h-48 bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : `<i class="fa-solid fa-image text-5xl m-16 text-slate-200"></i>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div>
                    <h4 class="font-bold text-2xl text-slate-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight">${news.title}</h4>
                    <p class="text-sm text-slate-500 mt-4 line-clamp-2 font-light">ข้อมูลข่าวสารประจำวันที่ ${new Date(news.date).toLocaleDateString('th-TH')}</p>
                </div>
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest"><i class="fa-regular fa-calendar text-blue-400 mr-2"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-xs font-black group-hover:translate-x-3 transition-all duration-500 uppercase">READ MORE <i class="fa-solid fa-chevron-right ml-1"></i></span>
                </div>
            </div>
        </div>`;
    });

    renderPagination('news-pagination', source.length, ITEMS_PER_PAGE, page, "window.renderNewsPaged");
}
window.renderNewsPaged = (p) => renderNews(allNewsData, p);

// =============================================================================
// 4. ACHIEVEMENT SYSTEM (Fix: ละเอียด + Pagination + Folder)
// =============================================================================
export function renderAchievementSystem(containerId, data, type, page = 1) {
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (currentFolderFilter === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0 };
            acc[key].count++;
            return acc;
        }, {});

        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in";
        Object.keys(groups).forEach(name => {
            container.innerHTML += `
            <div onclick="window.selectFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="w-20 h-20 bg-blue-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100 group-hover:rotate-6 transition duration-700"><i class="fa-solid fa-folder-open"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1">${name}</h4>
                <div class="mt-4 font-black text-[10px] text-blue-400 bg-blue-50/50 px-4 py-1.5 rounded-full inline-block uppercase tracking-widest">${groups[name].count} Items</div>
            </div>`;
        });
    } else {
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const items = filtered.slice(start, start + ITEMS_PER_PAGE);

        container.className = "space-y-10 animate-fade-in";
        let html = `
            <div class="flex items-center justify-between bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 class="font-bold text-xl text-slate-800 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${currentFolderFilter}</h3>
                <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full hover:shadow-md transition-all"><i class="fa-solid fa-arrow-left mr-2"></i> ย้อนกลับ</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">`;

        items.forEach(item => {
            html += `
            <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 cursor-pointer" onclick="window.open('${item.image || item.file_url || '#'}', '_blank')">
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-1000">` : '<i class="fa-solid fa-award text-7xl absolute inset-0 m-auto text-slate-100"></i>'}
                    <div class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl border border-white/50 shadow-lg">
                         <p class="text-[10px] font-black text-blue-600 text-center line-clamp-1 uppercase">รางวัล: ${item.title || 'เกียรติบัตร'}</p>
                    </div>
                </div>
                <div class="p-8 text-center">
                    <h4 class="font-bold text-lg text-slate-800 line-clamp-2 h-12 leading-tight group-hover:text-blue-600 transition-colors">${item.students || item.name || '-'}</h4>
                    <div class="mt-4 pt-4 border-t border-slate-50">
                         <span class="bg-slate-50 text-slate-400 text-[9px] font-black px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">${item.program || 'ทั่วไป'}</span>
                    </div>
                </div>
            </div>`;
        });
        html += `</div><div id="${containerId}-pagination"></div>`;
        container.innerHTML = html;

        renderPagination(`${containerId}-pagination`, filtered.length, ITEMS_PER_PAGE, page, `window.pagedAch_${type}`);
    }
}

// Window Pagination Bridges
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);

// =============================================================================
// 5. DOCUMENTS (Lumina Bento)
// =============================================================================
export function renderDocumentSystem(data, containerId, type = 'official', page = 1) {
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;
    const current = currentDocFolder[type];

    if (current === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.category || 'ทั่วไป';
            if (!acc[key]) acc[key] = 0; acc[key]++;
            return acc;
        }, {});
        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in";
        container.innerHTML = Object.entries(groups).map(([name, count]) => `
            <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center">
                <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl text-amber-500 mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition duration-700 shadow-sm"><i class="fa-solid fa-folder-closed"></i></div>
                <h4 class="font-bold text-slate-700 text-sm line-clamp-1">${name}</h4>
                <div class="mt-4"><span class="text-[9px] font-black text-amber-400 bg-amber-50/50 px-3 py-1 rounded-full uppercase tracking-widest">${count} Files</span></div>
            </div>`).join('');
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const items = filtered.slice(start, start + ITEMS_PER_PAGE);

        container.className = "space-y-4 animate-fade-in";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-slate-50 p-4 rounded-[2rem] border border-white mb-8">
                <h3 class="font-bold text-slate-700 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black bg-white text-slate-600 px-5 py-2 rounded-full border shadow-sm">ย้อนกลับ</button>
            </div>
            ${items.map(doc => `
            <div class="group bg-white p-5 rounded-[1.8rem] border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all duration-700 cursor-pointer" onclick="window.open('${doc.fileUrl}', '_blank')">
                <div class="flex items-center gap-6">
                    <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all shadow-inner"><i class="fa-solid fa-file-lines"></i></div>
                    <div><h4 class="font-bold text-base text-slate-700 group-hover:text-blue-600 transition-colors">${doc.title}</h4><p class="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p></div>
                </div>
                <div class="p-3 rounded-full bg-slate-50 text-slate-300 group-hover:text-blue-500 transition-all"><i class="fa-solid fa-download text-sm"></i></div>
            </div>`).join('')}
            <div id="${containerId}-pagination"></div>`;
        
        renderPagination(`${containerId}-pagination`, filtered.length, ITEMS_PER_PAGE, page, `window.pagedDoc_${type}`);
    }
}
window.pagedDoc_official = (p) => renderDocumentSystem(allOfficialDocs, 'official-docs-container', 'official', p);
window.pagedDoc_form = (p) => renderDocumentSystem(allFormDocs, 'form-docs-container', 'form', p);

// =============================================================================
// 6. PERSON & STUDENT GRID (Lumina Bento)
// =============================================================================
export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !data.length) return;
    container.innerHTML = '';
    const sorted = [...data].sort((a, b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);
    
    const createCard = (p, isLeader = false) => `
        <div class="relative group rounded-[2.5rem] p-8 ${isLeader ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2'} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full">
            <div class="w-36 h-36 rounded-full overflow-hidden border-[6px] ${isLeader ? 'border-blue-100' : 'border-white'} shadow-lg bg-white mb-6 group-hover:scale-105 group-hover:rotate-2 transition duration-700">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-5xl m-12 text-slate-200"></i>`}
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">${p.name}</h3>
            <div class="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100"><p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${p.role}</p></div>
        </div>`;

    if (leader) container.innerHTML += `<div class="flex justify-center mb-16 animate-fade-in"><div class="w-full max-w-sm">${createCard(leader, true)}</div></div>`;
    if (others.length > 0) {
        let grid = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">`;
        others.forEach(p => grid += createCard(p)); grid += `</div>`;
        container.innerHTML += grid;
    }
}

// =============================================================================
// 7. EXTERNAL BRIDGES (Search & Action)
// =============================================================================
export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }
export function renderSchoolAchievements(data) { allSchoolData = data; renderAchievementSystem('school-achievements-container', data, 'school'); }

// ✅ SEARCH SYSTEM (Fixed: ค้นหาจากฐานข้อมูล Global)
window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const source = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    const filtered = source.filter(i => (i.title+i.students+i.name+i.competition).toLowerCase().includes(val));
    currentFolderFilter = val ? 'ผลการค้นหา' : null;
    renderAchievementSystem(containerId, filtered, type);
};

window.filterNews = (inputId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const filtered = allNewsData.filter(i => i.title.toLowerCase().includes(val));
    renderNews(filtered);
};

window.filterDocuments = (id, containerId) => {
    const val = document.getElementById(id).value.toLowerCase();
    const type = containerId.includes('official') ? 'official' : 'form';
    const source = type === 'official' ? allOfficialDocs : allFormDocs;
    const filtered = source.filter(i => (i.title + i.category).toLowerCase().includes(val));
    currentDocFolder[type] = val ? 'ผลการค้นหา' : null;
    renderDocumentSystem(filtered, containerId, type);
};

// Folder Action Bridges
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };

// Other Renders (Simplified Bento)
export function renderInnovations(data) { /* Same Lumina Logic as News Grid */ }
export function renderHomeNews(data) { /* Same Lumina Logic for Mini Cards */ }

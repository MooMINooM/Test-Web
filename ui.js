// js/ui.js - Lumina Bento Edition (Final Super Full Version)
// Optimized for: VTR, Logo, Search (News, Innovations, Achievements) & Pagination

// --- Global Variables (Data Persistence) ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];
let allInnovationsData = []; 

// --- Config ---
const ACH_ITEMS_PER_PAGE = 6;
const NEWS_ITEMS_PER_PAGE = 6;
const DOCS_ITEMS_PER_PAGE = 6;
const INNOV_ITEMS_PER_PAGE = 6;

// --- State Management ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER FUNCTIONS
// =============================================================================

function renderPagination(containerId, totalItems, perPage, currentPage, callbackName) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId);
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<div class="flex justify-center items-center gap-2 mt-10 animate-fade-in py-4">`;
    html += `<button onclick="${callbackName}(${Math.max(1, currentPage - 1)}); window.scrollTo({top:0, behavior:'smooth'})" 
        class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 transition shadow-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left text-xs"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const isActive = i === currentPage;
            html += `<button onclick="${callbackName}(${i}); window.scrollTo({top:0, behavior:'smooth'})" 
                class="w-10 h-10 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent scale-110' : 'bg-white text-slate-500 border-slate-100 hover:text-blue-600'}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="text-slate-300 px-1">...</span>`;
        }
    }

    html += `<button onclick="${callbackName}(${Math.min(totalPages, currentPage + 1)}); window.scrollTo({top:0, behavior:'smooth'})" 
        class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 transition shadow-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right text-xs"></i></button></div>`;
    container.innerHTML = html;
}

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    return `<span class="bg-blue-50/80 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (VTR & Logo Fix Included)
// =============================================================================

export function renderSchoolInfo(dataList) {
    if (!dataList) return;
    const info = Array.isArray(dataList) ? dataList[0] : dataList;
    if (!info) return;
    if (info.school_name) document.title = info.school_name;

    const mapping = {
        'header-school-name': info.school_name, 'header-affiliation': info.affiliation, 'hero-motto': info.motto,
        'info-name-th': info.school_name, 'info-name-en': info.school_name_en, 'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8, 'info-obec-code': info.obec_code_6, 'info-affiliation-val': info.affiliation,
        'info-address': info.address, 'school-history-content': info.history, 'school-mission-content': info.mission,
        'info-vision': info.vision, 'info-philosophy': info.philosophy, 'info-motto': info.motto,
        'school-identity-content': info.identity, 'school-uniqueness-content': info.uniqueness, 'footer-school-name': info.school_name
    };

    for (const [id, val] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
    }

    if (document.getElementById('hero-school-name-short')) {
        let shortName = (info.school_name || 'โรงเรียน').replace('โรงเรียน', '').trim();
        document.getElementById('hero-school-name-short').innerText = `"${shortName}"`;
    }

    const logoHeader = document.getElementById('header-logo');
    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (info.logo_url) {
        if (logoHeader) { logoHeader.src = info.logo_url; logoHeader.classList.remove('hidden'); }
        if (logoBasic) { 
            logoBasic.src = info.logo_url; logoBasic.classList.remove('hidden'); 
            if(logoPlaceholder) logoPlaceholder.classList.add('hidden');
        }
    }

    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#3b82f6';
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${info.color_code_2 || c1} 50%)`;
    }

    if (info.vtr_url && document.getElementById('vtr-iframe')) {
        let videoId = "";
        try {
            if (info.vtr_url.includes('v=')) videoId = info.vtr_url.split('v=')[1].split('&')[0];
            else if (info.vtr_url.includes('youtu.be/')) videoId = info.vtr_url.split('youtu.be/')[1].split('?')[0];
            else if (info.vtr_url.includes('embed/')) videoId = info.vtr_url.split('embed/')[1].split('?')[0];
        } catch (e) {}
        if (videoId) {
            document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${videoId}`;
            if(document.getElementById('vtr-placeholder')) document.getElementById('vtr-placeholder').classList.add('hidden');
        }
    }

    if (document.getElementById('school-map-container') && info.map_embed) {
        document.getElementById('school-map-container').innerHTML = info.map_embed;
        const ifr = document.getElementById('school-map-container').querySelector('iframe');
        if(ifr) { ifr.style.width = "100%"; ifr.style.height = "100%"; ifr.style.border = "0"; ifr.style.borderRadius = "2rem"; }
    }
}

// =============================================================================
// 3. ACHIEVEMENT SYSTEM (Folder + List View)
// =============================================================================

export function renderAchievementSystem(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20 bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium">ไม่พบข้อมูลผลงาน</div>`;
        return;
    }

    if (currentFolderFilter === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0, latestImage: item.image };
            acc[key].count++; if(!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
            return acc;
        }, {});

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in";
        Object.keys(groups).forEach(name => {
            const div = document.createElement('div');
            div.className = "group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer text-center relative overflow-hidden h-full flex flex-col items-center justify-center";
            div.onclick = () => window.selectFolder(containerId, type, name);
            div.innerHTML = `<div class="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-4 shadow-sm border border-blue-50 group-hover:scale-110 group-hover:rotate-6 transition duration-500 overflow-hidden relative">${groups[name].latestImage ? `<img src="${groups[name].latestImage}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-folder-open text-blue-100"></i>`}</div><h4 class="font-bold text-slate-700 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors w-full px-2">${name}</h4><div class="mt-3"><span class="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">${groups[name].count} Items</span></div>`;
            grid.appendChild(div);
        });
        container.appendChild(grid);
    } else {
        const start = (page - 1) * ACH_ITEMS_PER_PAGE;
        const pageItems = data.slice(start, start + ACH_ITEMS_PER_PAGE);

        const header = document.createElement('div');
        header.className = "flex flex-col sm:flex-row items-center justify-between bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 gap-4 animate-fade-in";
        header.innerHTML = `<div class="flex items-center gap-4"><div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-inner"><i class="fa-solid fa-folder-open"></i></div><div><h3 class="font-black text-xl text-slate-800 tracking-tight">${currentFolderFilter}</h3><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">รายการข้อมูล • ${data.length} รายการ</p></div></div><button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[11px] font-black uppercase bg-white px-8 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-800 hover:text-white transition-all duration-300"><i class="fa-solid fa-arrow-left mr-2"></i>ย้อนกลับ</button>`;
        container.appendChild(header);

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in";
        pageItems.forEach(item => {
            const div = document.createElement('div');
            div.className = "group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-3 transition-all duration-700 cursor-pointer flex flex-col";
            div.onclick = () => window.open(item.image || item.file_url || '#', '_blank');
            div.innerHTML = `<div class="aspect-[4/3] bg-slate-50 relative overflow-hidden border-b border-slate-50">${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-award text-7xl opacity-50"></i></div>`}<div class="absolute top-5 left-5 right-5 flex flex-wrap gap-2">${item.subject ? getSubjectBadge(item.subject) : ''}</div></div><div class="p-8 flex-1 flex flex-col"><h4 class="font-bold text-xl text-slate-800 mb-3 tracking-tight">${item.students || item.name || '-'}</h4><div class="flex items-center gap-2 mb-6"><span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span><p class="text-sm font-black text-blue-600 uppercase">รางวัล: ${item.title || 'เกียรติบัตร'}</p></div><div class="mt-auto pt-6 border-t border-slate-50 font-medium text-slate-400 text-[11px] italic italic">รายการ: ${item.program || item.competition || '-'}</div></div>`;
            grid.appendChild(div);
        });
        container.appendChild(grid);

        const pagId = `${containerId}-pagination`;
        let pagDiv = document.getElementById(pagId);
        if(!pagDiv) { pagDiv = document.createElement('div'); pagDiv.id = pagId; container.appendChild(pagDiv); }
        renderPagination(pagId, data.length, ACH_ITEMS_PER_PAGE, page, `window.pagedAch_${type}`);
    }
}

// =============================================================================
// 4. NEWS & INNOVATION RENDERERS
// =============================================================================

export function renderNews(data, page = 1) {
    if (!data) return;
    if (allNewsData.length === 0 || data.length > allNewsData.length) { allNewsData = data; }
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    const start = (page - 1) * NEWS_ITEMS_PER_PAGE;
    const items = data.slice(start, start + NEWS_ITEMS_PER_PAGE);
    if (items.length === 0) { container.innerHTML = '<div class="text-center p-20 text-slate-400 font-medium bg-white/50 rounded-[2rem] border border-dashed border-slate-200">ไม่พบข่าวสาร</div>'; return; }
    items.forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row gap-6 mb-6 group cursor-pointer";
        div.onclick = () => { if(news.link) window.open(news.link, '_blank'); };
        div.innerHTML = `<div class="w-full md:w-64 h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner relative">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : `<div class="w-full h-full flex items-center justify-center text-slate-300"><i class="fa-regular fa-image text-4xl"></i></div>`}<div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black text-slate-500 border border-white uppercase tracking-wider">News</div></div><div class="flex-1 flex flex-col justify-between py-1"><div class="space-y-3"><h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors duration-300 leading-snug line-clamp-2">${news.title}</h4><p class="text-slate-500 line-clamp-2 font-light text-sm leading-relaxed">คลิกเพื่ออ่านรายละเอียดประชาสัมพันธ์ประจำวันที่ ${new Date(news.date).toLocaleDateString('th-TH')}</p></div><div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50"><span class="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400"><i class="fa-regular fa-clock text-blue-400"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span><span class="text-blue-600 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1">Read More <i class="fa-solid fa-arrow-right"></i></span></div></div>`;
        container.appendChild(div);
    });
    renderPagination('news-pagination', data.length, NEWS_ITEMS_PER_PAGE, page, "window.pagedNews");
}

export function renderInnovations(data, page = 1) {
    if (data && data.length > 0 && (allInnovationsData.length === 0 || data.length > allInnovationsData.length)) { allInnovationsData = data; }
    const container = document.getElementById('innovations-container');
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<div class="col-span-full text-center py-20 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium">ไม่พบผลงานนวัตกรรม</div>'; return; }
    const start = (page - 1) * INNOV_ITEMS_PER_PAGE;
    const items = data.slice(start, start + INNOV_ITEMS_PER_PAGE);
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in";
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = "group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col";
        div.onclick = () => window.open(item.fileUrl, '_blank');
        div.innerHTML = `<div class="aspect-[16/10] bg-slate-50 relative overflow-hidden">${item.coverImageUrl ? `<img src="${item.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : '<div class="w-full h-full flex items-center justify-center"><i class="fa-solid fa-lightbulb text-6xl text-slate-200"></i></div>'}<div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-blue-600 shadow-sm border border-white uppercase tracking-widest">${item.subject || 'Innovation'}</div></div><div class="p-6 flex-1 flex flex-col"><h4 class="font-bold text-lg text-slate-800 line-clamp-2 h-14 group-hover:text-blue-600 transition-colors leading-snug">${item.title}</h4><div class="mt-auto pt-5 border-t border-slate-50"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500"><i class="fa-solid fa-user-pen text-sm"></i></div><div class="min-w-0"><p class="text-xs font-black text-slate-700 truncate uppercase tracking-tight">${item.creator || '-'}</p><p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5 italic">ระดับ: ${item.class || '-'}</p></div></div></div></div>`;
        container.appendChild(div);
    });
    renderPagination('innovations-pagination', data.length, INNOV_ITEMS_PER_PAGE, page, "window.pagedInnovations");
}

// =============================================================================
// 5. SEARCH LOGIC (✅ UPDATED: Support All Fields for Achievements)
// =============================================================================

window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase().trim();
    // ดึงข้อมูลต้นฉบับจากตัวแปร Global
    const source = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    
    // คัดกรองครอบคลุม: ชื่อคน, รางวัล, รายการแข่งขัน, และแท็กวิชา
    const filtered = source.filter(i => {
        const text = [
            i.title, i.students, i.name, i.competition, i.program, i.subject
        ].join(' ').toLowerCase();
        return text.includes(val);
    });

    // หากมีการพิมพ์ค้นหา ให้เปลี่ยน View เป็นโหมดแสดงผลรายการ (List) ไม่ใช่โหมด Folder
    currentFolderFilter = val ? `ผลการค้นหา: "${val}"` : null;
    renderAchievementSystem(containerId, filtered, type, 1);
};

window.filterNews = (inputId) => {
    const val = document.getElementById(inputId).value.toLowerCase().trim();
    const filtered = allNewsData.filter(i => i.title.toLowerCase().includes(val));
    renderNews(filtered, 1);
};

window.filterInnovations = (inputId) => {
    const val = document.getElementById(inputId).value.toLowerCase().trim();
    const filtered = allInnovationsData.filter(i => {
        const text = [i.title, i.creator, i.subject].join(' ').toLowerCase();
        return text.includes(val);
    });
    renderInnovations(filtered, 1);
};

// =============================================================================
// 6. PAGINATION & NAVIGATION BRIDGES
// =============================================================================

window.pagedNews = (p) => renderNews(allNewsData, p);
window.pagedInnovations = (p) => renderInnovations(allInnovationsData, p);
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);

window.selectFolder = (cid, type, name) => { 
    currentFolderFilter = name; 
    const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); 
    const filtered = data.filter(i => (i.competition || 'รายการอื่นๆ') === name);
    renderAchievementSystem(cid, filtered, type, 1); 
};

window.clearFolderFilter = (cid, type) => { 
    currentFolderFilter = null; 
    const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); 
    renderAchievementSystem(cid, data, type, 1); 
};

// =============================================================================
// 7. REMAINING RENDERERS (Personnel, History, Stats, Documents)
// =============================================================================

export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }
export function renderSchoolAchievements(data) { 
    allSchoolData = data; 
    const onet = allSchoolData.filter(i => (i.title + i.competition).includes('O-NET'));
    const nt = allSchoolData.filter(i => (i.title + i.competition).includes('NT'));
    const rt = allSchoolData.filter(i => (i.title + i.competition).includes('RT'));
    const general = allSchoolData.filter(i => !(i.title + i.competition).includes('O-NET') && !(i.title + i.competition).includes('NT') && !(i.title + i.competition).includes('RT'));
    renderAchievementSystem('school-achievements-container', general, 'school'); 
    if(document.getElementById('onet-container')) renderAchievementSystem('onet-container', onet, 'school');
    if(document.getElementById('nt-container')) renderAchievementSystem('nt-container', nt, 'school');
    if(document.getElementById('rt-container')) renderAchievementSystem('rt-container', rt, 'school');
}

export function renderDocumentSystem(data, containerId, type = 'official', page = 1) {
    const container = document.getElementById(containerId); if (!container) return;
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;
    const current = currentDocFolder[type]; container.innerHTML = '';
    if (current === null) {
        const groups = data.reduce((acc, item) => { const key = item.category || 'ทั่วไป'; if (!acc[key]) acc[key] = 0; acc[key]++; return acc; }, {});
        const grid = document.createElement('div'); grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in";
        Object.entries(groups).forEach(([name, count]) => { grid.innerHTML += `<div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-500 cursor-pointer text-center relative overflow-hidden"><div class="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-[3rem] -mr-8 -mt-8"></div><div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl text-amber-500 mx-auto mb-4 relative z-10 group-hover:scale-110 transition duration-500"><i class="fa-solid fa-folder-closed"></i></div><h4 class="font-bold text-slate-700 text-sm line-clamp-1 relative z-10">${name}</h4><div class="mt-3 relative z-10"><span class="text-[9px] font-black text-amber-500 bg-white px-3 py-1 rounded-full border border-amber-50">${count} Files</span></div></div>`; });
        container.appendChild(grid);
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        const items = filtered.slice((page-1)*DOCS_ITEMS_PER_PAGE, page*DOCS_ITEMS_PER_PAGE);
        container.innerHTML = `<div class="flex items-center justify-between bg-slate-50 p-4 rounded-[2rem] border border-slate-100 mb-6"><h3 class="font-bold text-lg text-slate-700 flex items-center gap-3 ml-2"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3><button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 bg-white px-5 py-2.5 rounded-full border border-slate-200 transition-all">ย้อนกลับ</button></div><div class="grid grid-cols-1 gap-3">${items.map(doc => `<div class="group bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all duration-300 cursor-pointer" onclick="window.open('${doc.fileUrl}', '_blank')"><div class="flex items-center gap-5 overflow-hidden"><div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-50 transition-colors shrink-0"><i class="fa-solid fa-file-lines"></i></div><div class="min-w-0"><h4 class="font-bold text-sm text-slate-700 truncate">${doc.title}</h4><p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mt-1"><i class="fa-regular fa-clock"></i> ${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p></div></div><div class="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm shrink-0"><i class="fa-solid fa-download text-xs"></i></div></div>`).join('')}</div><div id="${containerId}-pagination"></div>`;
        renderPagination(`${containerId}-pagination`, filtered.length, DOCS_ITEMS_PER_PAGE, page, `window.pagedDoc_${type}`);
    }
}
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type, 1); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type, 1); };

export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId); if (!container) return; container.innerHTML = '';
    if(!data || data.length === 0) { container.innerHTML='<p class="text-center text-gray-400 py-10 bg-slate-50 rounded-2xl border border-dashed">กำลังปรับปรุงข้อมูล</p>'; return; }
    const sorted = [...data].sort((a,b) => a.id - b.id);
    const createCard = (p, isL = false) => `<div class="relative group rounded-[2.5rem] p-8 ${isL ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2'} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full"><div class="w-32 h-32 rounded-full overflow-hidden border-[6px] ${isL ? 'border-blue-100 ring-4 ring-blue-50' : 'border-white shadow-md'} bg-white mb-6 group-hover:scale-105 transition duration-700 relative z-10">${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-200 text-5xl"><i class="fa-solid fa-user"></i></div>`}</div><div class="relative z-10 w-full"><h3 class="text-lg font-bold text-slate-800 mb-2">${p.name}</h3><div class="inline-block px-4 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-sm"><p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${p.role}</p></div></div></div>`;
    if (sorted[0]) container.innerHTML += `<div class="flex justify-center mb-12 animate-fade-in"><div class="w-full max-w-sm">${createCard(sorted[0], true)}</div></div>`;
    if (sorted.slice(1).length > 0) { let g = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">`; sorted.slice(1).forEach(p => g += createCard(p)); g += `</div>`; container.innerHTML += g; }
}

export function renderHistoryTable(tbodyId, data) {
    const c = document.getElementById(tbodyId); if (!c) return;
    const isT = c.tagName === 'TBODY'; const target = isT ? c.closest('table').parentElement : c;
    if (isT) c.closest('table').style.display = 'none'; target.innerHTML = '';
    [...data].sort((a,b) => b.id - a.id).forEach(i => { target.innerHTML += `<div class="group bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 flex items-center gap-6 mb-4"><div class="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0 group-hover:scale-105 transition duration-500 border border-slate-100">${i.image ? `<img class="h-full w-full object-cover" src="${i.image}">` : `<div class="h-full w-full flex items-center justify-center text-slate-300 text-2xl"><i class="fa-solid fa-user"></i></div>`}</div><div class="flex-1"><h4 class="font-bold text-lg text-slate-800">${i.name}</h4><p class="text-xs text-slate-500 font-bold uppercase mt-1">${i.role || '-'}</p></div><div class="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100 shadow-sm whitespace-nowrap">${i.year || '-'}</div></div>`; });
}

export function renderStudentChart(data) {
    const c = document.getElementById('student-summary-container'); const canvas = document.getElementById('studentChart');
    if (!data || data.length === 0) return; let tM = 0, tF = 0; data.forEach(d => { tM += parseInt(d.male || 0); tF += parseInt(d.female || 0); });
    if (c) c.innerHTML = `<div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-6 shadow-xl text-white flex items-center gap-5"><div class="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl border border-white/10"><i class="fa-solid fa-users"></i></div><div><p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">ทั้งหมด</p><h3 class="text-3xl font-black">${tM+tF}</h3></div></div><div class="bg-white rounded-[2.5rem] p-6 shadow-lg border border-sky-100 flex items-center gap-5"><div class="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl text-sky-500 border border-sky-100"><i class="fa-solid fa-child"></i></div><div><p class="text-[10px] font-bold text-sky-400 uppercase tracking-widest">ชาย</p><h3 class="text-3xl font-black text-slate-800">${tM}</h3></div></div><div class="bg-white rounded-[2.5rem] p-6 shadow-lg border border-pink-100 flex items-center gap-5"><div class="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl text-pink-500 border border-pink-100"><i class="fa-solid fa-child-dress"></i></div><div><p class="text-[10px] font-bold text-pink-400 uppercase tracking-widest">หญิง</p><h3 class="text-3xl font-black text-slate-800">${tF}</h3></div></div></div>`;
    if (canvas && window.Chart) { if (window.myStudentChart) window.myStudentChart.destroy(); window.myStudentChart = new Chart(canvas, { type: 'bar', data: { labels: data.map(d => d.grade), datasets: [{ label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 6 }, { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } } }); }
}

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); if(!c) return; c.innerHTML = '';
    [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => { c.innerHTML += `<div class="p-4 border-b border-slate-50 flex gap-4 hover:bg-white/80 cursor-pointer transition rounded-2xl group" onclick="window.open('${n.link || '#'}', '_blank')"><div class="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">` : ''}</div><div class="flex-1 min-w-0 py-0.5"><h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4><p class="text-[10px] font-black text-slate-400 uppercase mt-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1"></span> ${new Date(n.date).toLocaleDateString('th-TH')}</p></div></div>`; }); 
}

console.log("Lumina Super Full Version: Ready");

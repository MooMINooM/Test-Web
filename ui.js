// js/ui.js - Lumina Bento Edition (Final Stable Version)

// --- Global Variables (Data Persistence Layer) ---
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

// --- State ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER FUNCTIONS
// =============================================================================

function renderPagination(containerId, totalItems, perPage, currentPage, callbackName) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }

    let html = `<div class="flex justify-center items-center gap-2 mt-10 animate-fade-in py-4">`;
    html += `<button onclick="${callbackName}(${Math.max(1, currentPage - 1)}); window.scrollTo({top:0, behavior:'smooth'})" class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left text-xs"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const isActive = i === currentPage;
            html += `<button onclick="${callbackName}(${i}); window.scrollTo({top:0, behavior:'smooth'})" class="w-10 h-10 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent scale-110' : 'bg-white text-slate-500 border-slate-100 hover:text-blue-600'}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="text-slate-300 px-1">...</span>`;
        }
    }

    html += `<button onclick="${callbackName}(${Math.min(totalPages, currentPage + 1)}); window.scrollTo({top:0, behavior:'smooth'})" class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 transition shadow-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right text-xs"></i></button></div>`;
    container.innerHTML = html;
}

function getSubjectBadge(subject) {
    if (!subject) return '';
    return `<span class="bg-blue-50/80 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-tag text-[9px]"></i> ${subject.trim()}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (✅ Fixed: VTR Logic)
// =============================================================================

export function renderSchoolInfo(dataList) {
    if (!dataList) return;
    const info = Array.isArray(dataList) ? dataList[0] : dataList;
    if (!info) return;

    // Mapping ข้อมูลพื้นฐาน
    const mapping = {
        'header-school-name': info.school_name, 'header-affiliation': info.affiliation,
        'info-name-th': info.school_name, 'info-name-en': info.school_name_en,
        'info-address': info.address, 'footer-school-name': info.school_name
    };
    for (const [id, val] of Object.entries(mapping)) {
        const el = document.getElementById(id); if (el) el.innerText = val || '-';
    }

    // ชื่อโรงเรียนบน Hero Card (ตัดคำว่าโรงเรียนออก)
    if (document.getElementById('hero-school-name-short')) {
        let shortName = (info.school_name || '').replace('โรงเรียน', '').trim();
        document.getElementById('hero-school-name-short').innerText = `"${shortName}"`;
    }

    // ✅ FIXED: VTR Youtube Logic
    if (info.vtr_url && document.getElementById('vtr-iframe')) {
        let vid = '';
        try {
            if (info.vtr_url.includes('v=')) vid = info.vtr_url.split('v=')[1].split('&')[0];
            else if (info.vtr_url.includes('youtu.be/')) vid = info.vtr_url.split('youtu.be/')[1].split('?')[0];
        } catch (e) { console.error("VTR URL Error", e); }
        
        if (vid) {
            document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${vid}`;
            if(document.getElementById('vtr-placeholder')) document.getElementById('vtr-placeholder').classList.add('hidden');
        }
    }
}

// =============================================================================
// 3. ACHIEVEMENT SYSTEM (Folder + List)
// =============================================================================

export function renderAchievementSystem(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400">ยังไม่มีข้อมูล</div>`;
        return;
    }

    if (currentFolderFilter === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0, img: item.image };
            acc[key].count++; return acc;
        }, {});

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in";
        Object.keys(groups).forEach(name => {
            const div = document.createElement('div');
            div.className = "group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer text-center flex flex-col items-center justify-center";
            div.onclick = () => window.selectFolder(containerId, type, name);
            div.innerHTML = `<div class="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-4xl text-blue-500 mb-4 shadow-sm border border-blue-50 group-hover:scale-110 transition duration-500 overflow-hidden relative">${groups[name].img ? `<img src="${groups[name].img}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-folder-open text-blue-100"></i>`}</div><h4 class="font-bold text-slate-700 text-sm line-clamp-2">${name}</h4><div class="mt-3"><span class="text-[10px] font-black text-blue-400 uppercase bg-blue-50 px-3 py-1 rounded-full">${groups[name].count} Items</span></div>`;
            grid.appendChild(div);
        });
        container.appendChild(grid);
    } else {
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const items = filtered.slice((page - 1) * ACH_ITEMS_PER_PAGE, page * ACH_ITEMS_PER_PAGE);

        const header = document.createElement('div');
        header.className = "flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm mb-10 border border-slate-100";
        header.innerHTML = `<h3 class="font-black text-xl text-slate-800">${currentFolderFilter}</h3><button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[11px] font-black uppercase bg-white px-8 py-3 rounded-full border border-slate-200 hover:bg-slate-800 hover:text-white transition-all"><i class="fa-solid fa-arrow-left mr-2"></i>ย้อนกลับ</button>`;
        container.appendChild(header);

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in";
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = "group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:-translate-y-3 transition-all duration-700 cursor-pointer flex flex-col";
            div.onclick = () => window.open(item.image || item.file_url || '#', '_blank');
            div.innerHTML = `<div class="aspect-[4/3] bg-slate-50 relative overflow-hidden">${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-2s">` : `<div class="w-full h-full flex items-center justify-center text-slate-200 text-7xl"><i class="fa-solid fa-award"></i></div>`}<div class="absolute top-5 left-5">${item.subject ? getSubjectBadge(item.subject) : ''}</div></div><div class="p-8 flex-1 flex flex-col"><h4 class="font-bold text-xl text-slate-800 mb-3">${item.students || item.name || '-'}</h4><p class="text-sm font-black text-blue-600 uppercase mb-6 italic">รางวัล: ${item.title || 'ประกาศนียบัตร'}</p><div class="mt-auto pt-6 border-t border-slate-50 text-[11px] text-slate-400">รายการ: ${item.program || item.competition || '-'}</div></div>`;
            grid.appendChild(div);
        });
        container.appendChild(grid);

        const pagId = `${containerId}-pagination`;
        let pagDiv = document.getElementById(pagId); if(!pagDiv) { pagDiv = document.createElement('div'); pagDiv.id = pagId; container.appendChild(pagDiv); }
        renderPagination(pagId, filtered.length, ACH_ITEMS_PER_PAGE, page, `window.pagedAch_${type}`);
    }
}

// =============================================================================
// 4. NEWS & INNOVATIONS (✅ Fixed: Persistence & Search)
// =============================================================================

export function renderNews(data, page = 1) {
    if (!data) return; if (allNewsData.length === 0 || data.length > allNewsData.length) allNewsData = data;
    const container = document.getElementById('news-container'); if (!container) return; container.innerHTML = '';
    const items = data.slice((page - 1) * NEWS_ITEMS_PER_PAGE, page * NEWS_ITEMS_PER_PAGE);
    items.forEach(n => {
        const div = document.createElement('div');
        div.className = "bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-6 mb-6 group cursor-pointer";
        div.onclick = () => { if(n.link) window.open(n.link, '_blank'); };
        div.innerHTML = `<div class="w-full md:w-64 h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden shrink-0">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-1.5s">` : `<i class="fa-regular fa-image text-4xl"></i>`}</div><div class="flex-1 py-1 flex flex-col justify-between"><h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600">${n.title}</h4><div class="flex justify-between items-center pt-4 border-t border-slate-50"><span class="text-[11px] text-slate-400"><i class="fa-regular fa-clock text-blue-400 mr-2"></i>${new Date(n.date).toLocaleDateString('th-TH')}</span><span class="text-blue-600 text-[10px] font-black uppercase">Read More <i class="fa-solid fa-arrow-right"></i></span></div></div>`;
        container.appendChild(div);
    });
    renderPagination('news-pagination', data.length, NEWS_ITEMS_PER_PAGE, page, "window.pagedNews");
}

export function renderInnovations(data, page = 1) {
    if (!data) return; if (allInnovationsData.length === 0 || data.length > allInnovationsData.length) allInnovationsData = data;
    const container = document.getElementById('innovations-container'); if (!container) return; container.innerHTML = '';
    const items = data.slice((page - 1) * INNOV_ITEMS_PER_PAGE, page * INNOV_ITEMS_PER_PAGE);
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in";
    items.forEach(i => {
        const div = document.createElement('div');
        div.className = "group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all cursor-pointer flex flex-col";
        div.onclick = () => window.open(i.fileUrl, '_blank');
        div.innerHTML = `<div class="aspect-[16/10] bg-slate-50 relative overflow-hidden">${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-2s">` : '<i class="fa-solid fa-lightbulb text-6xl text-slate-200"></i>'}<div class="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-xl text-[10px] font-black text-blue-600">${i.subject || 'Innovation'}</div></div><div class="p-6 flex-1 flex flex-col"><h4 class="font-bold text-lg text-slate-800 mb-4 line-clamp-2">${i.title}</h4><div class="mt-auto pt-5 border-t border-slate-50 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><i class="fa-solid fa-user-pen"></i></div><div class="min-w-0"><p class="text-xs font-black text-slate-700 truncate">${i.creator || '-'}</p><p class="text-[10px] text-slate-400 italic">ระดับ: ${i.class || '-'}</p></div></div></div>`;
        container.appendChild(div);
    });
    renderPagination('innovations-pagination', data.length, INNOV_ITEMS_PER_PAGE, page, "window.pagedInnovations");
}

// =============================================================================
// 5. WINDOW BRIDGES & PAGINATION HANDLERS
// =============================================================================

window.pagedNews = (p) => renderNews(allNewsData, p);
window.pagedInnovations = (p) => renderInnovations(allInnovationsData, p);
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);

window.filterNews = (id) => { const v = document.getElementById(id).value.toLowerCase(); renderNews(allNewsData.filter(n => n.title.toLowerCase().includes(v)), 1); };
window.filterInnovations = (id) => { const v = document.getElementById(id).value.toLowerCase(); renderInnovations(allInnovationsData.filter(i => (i.title+i.creator).toLowerCase().includes(v)), 1); };

window.selectFolder = (cid, type, name) => { currentFolderFilter = name; renderAchievementSystem(cid, type === 'teacher' ? allTeacherData : (type === 'student' ? allStudentData : allSchoolData), type, 1); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; renderAchievementSystem(cid, type === 'teacher' ? allTeacherData : (type === 'student' ? allStudentData : allSchoolData), type, 1); };

export function renderTeacherAchievements(d) { allTeacherData = d; renderAchievementSystem('teacher-achievements-container', d, 'teacher'); }
export function renderStudentAchievements(d) { allStudentData = d; renderAchievementSystem('student-achievements-container', d, 'student'); }
export function renderSchoolAchievements(d) { allSchoolData = d; renderAchievementSystem('school-achievements-container', d, 'school'); }

console.log("Lumina Bento UI System: Ready");

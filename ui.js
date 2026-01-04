// js/ui.js - Lumina Bento Edition (Full Stability Version)

// --- Global Variables (Data Persistence) ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = []; // เก็บข่าวทั้งหมดไว้ที่นี่เพื่อให้แบ่งหน้าได้
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config (6 รายการต่อหน้า) ---
const ITEMS_PER_PAGE = 6;

// --- State ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER: PAGINATION RENDERER (วาดปุ่มเลขหน้า)
// =============================================================================
function renderPagination(containerId, totalItems, perPage, currentPage, callbackName) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (totalPages <= 1) { 
        container.innerHTML = ''; 
        return; 
    }

    let html = `<div class="flex justify-center items-center gap-3 animate-fade-in">`;
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        html += `
        <button onclick="${callbackName}(${i}); window.scrollTo({top: 0, behavior: 'smooth'})" 
            class="w-11 h-11 rounded-2xl font-black text-sm transition-all duration-500 shadow-sm border 
            ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 scale-110' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-300 hover:text-blue-500 hover:shadow-md'}">
            ${i}
        </button>`;
    }
    html += `</div>`;
    container.innerHTML = html;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (Lumina Bento Skin)
// =============================================================================
export function renderSchoolInfo(info) {
    if (!info) return;
    if (info.school_name) document.title = info.school_name;

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

    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (logoBasic && info.logo_url) {
        logoBasic.src = info.logo_url;
        logoBasic.classList.remove('hidden');
        if(logoPlaceholder) logoPlaceholder.classList.add('hidden');
    }

    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#3b82f6';
        const c2 = info.color_code_2 || c1;
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    if (document.getElementById('school-map-container') && info.map_embed) {
        const mc = document.getElementById('school-map-container');
        mc.innerHTML = info.map_embed;
        const ifr = mc.querySelector('iframe');
        if(ifr) { ifr.style.width="100%"; ifr.style.height="100%"; ifr.style.border="0"; ifr.style.borderRadius="2.5rem"; }
    }
}

// =============================================================================
// 3. NEWS SYSTEM (✅ แก้ไขบั๊กแบ่งหน้าและแสดงไม่ครบ)
// =============================================================================
export function renderNews(data, page = 1) {
    if (!data) return;
    
    // บันทึกเข้า Global Variable เมื่อโหลดครั้งแรก หรือข้อมูลมีการเปลี่ยนแปลง
    if (allNewsData.length === 0 || data.length > allNewsData.length) {
        allNewsData = data;
    }

    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';

    const start = (page - 1) * ITEMS_PER_PAGE;
    const items = data.slice(start, start + ITEMS_PER_PAGE);

    if (items.length === 0) {
        container.innerHTML = '<div class="text-center p-20 text-slate-400 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">ไม่พบข่าวสาร</div>';
        return;
    }

    items.forEach(news => {
        container.innerHTML += `
        <div class="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col lg:flex-row gap-8 mb-8 group cursor-pointer" onclick="window.open('${news.link || '#'}', '_blank')">
            <div class="w-full lg:w-72 h-52 bg-slate-100 rounded-[2rem] overflow-hidden shrink-0 shadow-inner relative">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out">` : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-image text-6xl"></i></div>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div class="space-y-4">
                    <h4 class="font-bold text-2xl text-slate-800 group-hover:text-blue-600 transition-colors duration-500 leading-tight line-clamp-2">${news.title}</h4>
                    <p class="text-slate-500 line-clamp-2 font-light leading-relaxed text-sm">อ่านรายละเอียดข่าวประชาสัมพันธ์ ประจำวันที่ ${new Date(news.date).toLocaleDateString('th-TH')}</p>
                </div>
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100 shadow-sm"><i class="fa-regular fa-calendar-alt text-blue-400"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-[11px] font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform duration-500 flex items-center gap-2">อ่านต่อ <i class="fa-solid fa-chevron-right text-[10px]"></i></span>
                </div>
            </div>
        </div>`;
    });

    // เรียกสร้าง Pagination
    renderPagination('news-pagination', data.length, ITEMS_PER_PAGE, page, "window.renderNewsPaged");
}
// ตัวเชื่อมฟังก์ชัน Pagination เข้ากับ Global Data
window.renderNewsPaged = (p) => renderNews(allNewsData, p);

// =============================================================================
// 4. ACHIEVEMENT SYSTEM (Folder + List + Pagination)
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
            <div onclick="window.selectFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] hover:border-blue-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="w-20 h-20 bg-blue-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition duration-700"><i class="fa-solid fa-folder-open"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">${name}</h4>
                <div class="mt-4"><span class="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50/50 px-4 py-1.5 rounded-full border border-blue-50">${groups[name].count} Items</span></div>
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
                <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full border border-blue-100 shadow-sm hover:shadow-md transition-all"><i class="fa-solid fa-arrow-left mr-2"></i> กลับหน้าหลัก</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">`;

        items.forEach(item => {
            html += `
            <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-[0.8s] cursor-pointer" onclick="window.open('${item.image || item.file_url || '#'}', '_blank')">
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : '<i class="fa-solid fa-award text-7xl absolute inset-0 m-auto text-slate-100"></i>'}
                    <div class="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black text-blue-600 shadow-xl border border-white/50 uppercase tracking-widest text-center line-clamp-1">รางวัล: ${item.title || 'ประกาศนียบัตร'}</div>
                </div>
                <div class="p-8 text-center space-y-4">
                    <h4 class="font-bold text-lg text-slate-800 line-clamp-2 h-12 leading-snug group-hover:text-blue-600 transition-colors">${item.students || item.name || '-'}</h4>
                    <div class="pt-4 border-t border-slate-50">
                        <p class="text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">รายการ: ${item.program || 'Achievement'}</p>
                    </div>
                </div>
            </div>`;
        });
        html += `</div><div id="${containerId}-pagination" class="mt-12 flex justify-center"></div>`;
        container.innerHTML = html;

        renderPagination(`${containerId}-pagination`, filtered.length, ITEMS_PER_PAGE, page, `window.pagedAch_${type}`);
    }
}
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);

// =============================================================================
// 5. SEARCH SYSTEM (Fixed Logic)
// =============================================================================
window.filterNews = (id) => {
    const val = document.getElementById(id).value.toLowerCase();
    const filtered = allNewsData.filter(i => i.title.toLowerCase().includes(val));
    renderNews(filtered, 1);
};

window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const source = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    const filtered = source.filter(i => (i.title + i.students + i.name + (i.competition || '')).toLowerCase().includes(val));
    currentFolderFilter = val ? 'ผลการค้นหา' : null;
    renderAchievementSystem(containerId, filtered, type, 1);
};

// =============================================================================
// 6. FOLDER NAVIGATION (Fixed Logic)
// =============================================================================
window.selectFolder = (cid, type, name) => { 
    currentFolderFilter = name; 
    const data = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData); 
    renderAchievementSystem(cid, data, type, 1); 
};

window.clearFolderFilter = (cid, type) => { 
    currentFolderFilter = null; 
    const data = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData); 
    renderAchievementSystem(cid, data, type, 1); 
};

// ... ส่วนการ Render อื่นๆ (Personnel, History, StudentChart) ใช้ตามรูปแบบ Lumina Bento เดิมได้เลยครับ ...

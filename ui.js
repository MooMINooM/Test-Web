// js/ui.js - Lumina Bento Edition (Final Full Version)
// Based on original structure + Lumina Design System

// --- Global Variables (Data Persistence Layer) ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config ---
const ACH_ITEMS_PER_PAGE = 6;
const NEWS_ITEMS_PER_PAGE = 6;
const DOCS_ITEMS_PER_PAGE = 6;

// --- State ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER FUNCTIONS
// =============================================================================

// Helper: สร้างปุ่มแบ่งหน้า (Pagination) สไตล์ Lumina
function renderPagination(containerId, totalItems, perPage, currentPage, callbackName) {
    const totalPages = Math.ceil(totalItems / perPage);
    const container = document.getElementById(containerId);
    
    // ถ้าไม่มี container หรือมีหน้าเดียว ไม่ต้องแสดง
    if (!container) return;
    if (totalPages <= 1) { 
        container.innerHTML = ''; 
        return; 
    }

    let html = `<div class="flex justify-center items-center gap-2 mt-10 animate-fade-in py-4">`;
    
    // ปุ่มย้อนกลับ
    html += `<button onclick="${callbackName}(${Math.max(1, currentPage - 1)}); window.scrollTo({top:0, behavior:'smooth'})" 
        class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-left text-xs"></i>
    </button>`;

    // ปุ่มตัวเลข
    for (let i = 1; i <= totalPages; i++) {
        // แสดงเฉพาะ หน้าแรก, หน้าสุดท้าย, และหน้าใกล้เคียงปัจจุบัน
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const isActive = i === currentPage;
            html += `
            <button onclick="${callbackName}(${i}); window.scrollTo({top:0, behavior:'smooth'})" 
                class="w-10 h-10 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border 
                ${isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent shadow-blue-200 scale-110' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:shadow-md'}">
                ${i}
            </button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="text-slate-300 px-1">...</span>`;
        }
    }

    // ปุ่มถัดไป
    html += `<button onclick="${callbackName}(${Math.min(totalPages, currentPage + 1)}); window.scrollTo({top:0, behavior:'smooth'})" 
        class="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-right text-xs"></i>
    </button>`;

    html += `</div>`;
    container.innerHTML = html;
}

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    // ใช้ Design แบบ Glassmorphism badge
    return `<span class="bg-blue-50/80 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:bg-blue-100 transition"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (Lumina Bento Design)
// =============================================================================

export function renderSchoolInfo(dataList) {
    if (!dataList) return;
    // รองรับทั้งแบบส่งมาเป็น Array หรือ Object เดี่ยว
    const info = Array.isArray(dataList) ? dataList[0] : dataList;
    if (!info) return;

    if (info.school_name) document.title = info.school_name;

    // Header & Hero Mapping
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
        'school-mission-content': info.mission,
        'info-vision': info.vision,
        'info-philosophy': info.philosophy,
        'info-motto': info.motto,
        'school-identity-content': info.identity,
        'school-uniqueness-content': info.uniqueness,
        'footer-school-name': info.school_name
    };

    for (const [id, val] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
    }

    // ✅ ส่วนสำคัญ: Logic ตัดคำว่า "โรงเรียน" สำหรับป้าย Hero Card ใหม่
    if (document.getElementById('hero-school-name-short')) {
        let shortName = info.school_name || 'โรงเรียน';
        // ลบคำว่า "โรงเรียน" ออก และตัดช่องว่างหน้าหลัง
        shortName = shortName.replace('โรงเรียน', '').trim();
        document.getElementById('hero-school-name-short').innerText = shortName;
    }

    // School Age
    if (info.founding_date && document.getElementById('school-age-badge')) {
        const age = new Date().getFullYear() - new Date(info.founding_date).getFullYear();
        document.getElementById('school-age-badge').innerText = `ก่อตั้งมาแล้ว ${age} ปี`;
    }

    // Logo Logic
    const logoHeader = document.getElementById('header-logo');
    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');

    if (info.logo_url) {
        if (logoHeader) { logoHeader.src = info.logo_url; logoHeader.classList.remove('hidden'); }
        if (logoBasic) { 
            logoBasic.src = info.logo_url; 
            logoBasic.classList.remove('hidden'); 
            if(logoPlaceholder) logoPlaceholder.classList.add('hidden');
        }
    } else {
        if (logoHeader) logoHeader.classList.add('hidden');
        if (logoBasic) {
            logoBasic.classList.add('hidden');
            if(logoPlaceholder) logoPlaceholder.classList.remove('hidden');
        }
    }

    // Colors & Media
    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#3b82f6';
        const c2 = info.color_code_2 || c1;
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    if (document.getElementById('student-uniform-img')) {
        const img = document.getElementById('student-uniform-img');
        const placeholder = document.getElementById('uniform-placeholder');
        if (info.uniform_url) {
            img.src = info.uniform_url;
            img.classList.remove('hidden');
            if(placeholder) placeholder.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            if(placeholder) placeholder.classList.remove('hidden');
        }
    }

    if (info.song_url && document.getElementById('school-song')) {
        document.getElementById('school-song').src = info.song_url;
        document.getElementById('music-player-controls').classList.remove('hidden');
    }

    if (info.vtr_url && document.getElementById('vtr-iframe')) {
        let vid = '';
        try {
            if (info.vtr_url.includes('v=')) vid = info.vtr_url.split('v=')[1].split('&')[0];
            else if (info.vtr_url.includes('youtu.be/')) vid = info.vtr_url.split('youtu.be/')[1];
        } catch (e) {}
        if (vid) {
            document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${vid}`;
            if(document.getElementById('vtr-placeholder')) document.getElementById('vtr-placeholder').classList.add('hidden');
        }
    }

    if (document.getElementById('school-map-container') && info.map_embed) {
        const mapContainer = document.getElementById('school-map-container');
        mapContainer.innerHTML = info.map_embed;
        const iframe = mapContainer.querySelector('iframe');
        if(iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "0";
            iframe.style.borderRadius = "2rem"; // Lumina rounded
            iframe.style.filter = "grayscale(20%) contrast(1.1)";
        }
    }
}

// =============================================================================
// 3. ACHIEVEMENT SYSTEM (Folder + List + Search + Pagination)
// =============================================================================

export function renderAchievementSystem(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20 bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium">ยังไม่มีข้อมูลผลงาน</div>`;
        return;
    }

    if (currentFolderFilter === null) {
        // --- VIEW 1: FOLDERS (Lumina Style) ---
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0, latestImage: item.image };
            acc[key].count++;
            if(!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
            return acc;
        }, {});

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in";

        Object.keys(groups).forEach(name => {
            const group = groups[name];
            const div = document.createElement('div');
            // Design: Card with soft shadow and hover effect
            div.className = "group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:border-blue-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer text-center relative overflow-hidden h-full flex flex-col items-center justify-center";
            div.onclick = () => window.selectFolder(containerId, type, name);
            
            div.innerHTML = `
                <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-125 transition duration-700"></div>
                
                <div class="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-4 shadow-sm border border-blue-50 group-hover:scale-110 group-hover:rotate-6 transition duration-500 overflow-hidden relative">
                    ${group.latestImage 
                        ? `<img src="${group.latestImage}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100">` 
                        : `<i class="fa-solid fa-folder-open"></i>`
                    }
                </div>
                
                <h4 class="font-bold text-slate-700 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors w-full px-2">${name}</h4>
                
                <div class="mt-3">
                    <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">${group.count} รายการ</span>
                </div>
            `;
            grid.appendChild(div);
        });
        container.appendChild(grid);

    } else {
        // --- VIEW 2: ITEMS IN FOLDER (Detailed Card + Pagination) ---
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const start = (page - 1) * ACH_ITEMS_PER_PAGE;
        const items = filtered.slice(start, start + ACH_ITEMS_PER_PAGE);

        // Header with Back Button
        const header = document.createElement('div');
        header.className = "flex flex-col sm:flex-row items-center justify-between bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-sm mb-10 gap-4 animate-fade-in";
        header.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-xl"><i class="fa-solid fa-folder-open"></i></div>
                <div>
                    <h3 class="font-bold text-lg text-slate-800 line-clamp-1">${currentFolderFilter}</h3>
                    <p class="text-xs text-slate-400">ทั้งหมด ${filtered.length} รายการ</p>
                </div>
            </div>
            <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[11px] font-black uppercase tracking-[0.1em] text-slate-600 hover:text-white hover:bg-slate-800 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm transition-all flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> ย้อนกลับ
            </button>
        `;
        container.appendChild(header);

        // Grid Items
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in";

        items.forEach(item => {
            const div = document.createElement('div');
            // Design: Detailed Card
            div.className = "group bg-white rounded-[2.5rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col";
            div.onclick = () => window.open(item.image || item.file_url || '#', '_blank');
            
            div.innerHTML = `
                <div class="aspect-[4/3] bg-slate-50 relative overflow-hidden border-b border-slate-50">
                    ${item.image 
                        ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out">` 
                        : `<div class="w-full h-full flex items-center justify-center text-slate-300"><i class="fa-solid fa-award text-6xl opacity-50"></i></div>`
                    }
                    <div class="absolute top-4 right-4">
                        ${getSubjectBadge(item.program || 'ผลงาน')}
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition duration-500">
                        <p class="text-white text-xs font-light"><i class="fa-solid fa-maximize mr-2"></i>คลิกเพื่อดูรายละเอียด</p>
                    </div>
                </div>
                
                <div class="p-6 flex-1 flex flex-col">
                    <h4 class="font-bold text-lg text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                        ${item.title || item.students || item.name || 'ไม่มีชื่อรายการ'}
                    </h4>
                    
                    <div class="mt-auto pt-4 border-t border-slate-50 space-y-2">
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <i class="fa-solid fa-user-circle text-slate-300 text-sm"></i>
                            <span class="truncate font-medium">${item.name || item.students || '-'}</span>
                        </div>
                        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <i class="fa-solid fa-trophy text-yellow-400"></i>
                            <span class="truncate">${item.title || 'รางวัลเข้าร่วม'}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(div);
        });
        container.appendChild(grid);

        // Pagination Area
        const pagId = `${containerId}-pagination`;
        let pagDiv = document.getElementById(pagId);
        if(!pagDiv) {
            pagDiv = document.createElement('div');
            pagDiv.id = pagId;
            container.appendChild(pagDiv);
        }
        
        // Determine callback function based on type
        let callback = `window.pagedAch_${type}`;
        renderPagination(pagId, filtered.length, ACH_ITEMS_PER_PAGE, page, callback);
    }
}

// Window Pagination Bridges (ต้องมีเพื่อให้ HTML string เรียกกลับมาหา JS ได้)
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);

// =============================================================================
// 4. NEWS SYSTEM (Complete Pagination)
// =============================================================================

export function renderNews(data, page = 1) {
    if (!data) return;
    // สำรองข้อมูลเข้า Global หากเป็นการเรียกครั้งแรก
    if (allNewsData.length === 0 || data.length > allNewsData.length) {
        allNewsData = data;
    }

    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';

    const start = (page - 1) * NEWS_ITEMS_PER_PAGE;
    const items = allNewsData.slice(start, start + NEWS_ITEMS_PER_PAGE);

    if (items.length === 0) {
        container.innerHTML = '<div class="text-center p-20 text-slate-400 font-medium bg-white/50 rounded-[2rem] border border-dashed border-slate-200">ไม่พบข่าวสาร</div>';
        return;
    }

    items.forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row gap-6 mb-6 group cursor-pointer";
        div.onclick = () => { if(news.link) window.open(news.link, '_blank'); };
        
        div.innerHTML = `
            <div class="w-full md:w-64 h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner relative group-hover:shadow-lg transition duration-500">
                ${news.image 
                    ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out">` 
                    : `<div class="w-full h-full flex items-center justify-center text-slate-300"><i class="fa-regular fa-image text-4xl"></i></div>`
                }
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black text-slate-500 border border-white uppercase tracking-wider">News</div>
            </div>
            
            <div class="flex-1 flex flex-col justify-between py-1">
                <div class="space-y-3">
                    <h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors duration-300 leading-snug line-clamp-2">${news.title}</h4>
                    <p class="text-slate-500 line-clamp-2 font-light text-sm leading-relaxed">คลิกเพื่ออ่านรายละเอียดข่าวสารกิจกรรมประชาสัมพันธ์...</p>
                </div>
                
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <span class="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <i class="fa-regular fa-clock text-blue-400"></i> ${new Date(news.date).toLocaleDateString('th-TH')}
                    </span>
                    <span class="text-blue-600 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1">
                        Read More <i class="fa-solid fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    renderPagination('news-pagination', allNewsData.length, NEWS_ITEMS_PER_PAGE, page, "window.renderNewsPaged");
}
window.renderNewsPaged = (p) => renderNews(allNewsData, p);

// =============================================================================
// 5. DOCUMENT SYSTEM (Categorized Folders + Pagination)
// =============================================================================

export function renderDocumentSystem(data, containerId, type = 'official', page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Save to global based on type
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;
    const current = currentDocFolder[type];
    
    container.innerHTML = '';

    if (current === null) {
        // --- VIEW 1: FOLDERS ---
        const groups = data.reduce((acc, item) => {
            const key = item.category || 'ทั่วไป';
            if (!acc[key]) acc[key] = 0; acc[key]++;
            return acc;
        }, {});
        
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in";
        
        Object.entries(groups).forEach(([name, count]) => {
            grid.innerHTML += `
                <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.15)] hover:border-amber-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-[3rem] -mr-8 -mt-8 transition group-hover:scale-150"></div>
                    <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl text-amber-500 mx-auto mb-4 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition duration-500 shadow-sm"><i class="fa-solid fa-folder-closed"></i></div>
                    <h4 class="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors relative z-10">${name}</h4>
                    <div class="mt-3 relative z-10"><span class="text-[9px] font-black text-amber-500 bg-white px-3 py-1 rounded-full shadow-sm border border-amber-50">${count} Files</span></div>
                </div>`;
        });
        container.appendChild(grid);

    } else {
        // --- VIEW 2: FILE LIST ---
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        const start = (page - 1) * DOCS_ITEMS_PER_PAGE;
        const items = filtered.slice(start, start + DOCS_ITEMS_PER_PAGE);

        container.className = "space-y-4 animate-fade-in";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-slate-50 p-4 rounded-[2rem] border border-slate-100 mb-6">
                <h3 class="font-bold text-lg text-slate-700 flex items-center gap-3 ml-2"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow transition-all">ย้อนกลับ</button>
            </div>
            <div class="grid grid-cols-1 gap-3">
                ${items.map(doc => `
                <div class="group bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer" onclick="window.open('${doc.fileUrl}', '_blank')">
                    <div class="flex items-center gap-5 overflow-hidden">
                        <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-inner shrink-0">
                            <i class="fa-solid fa-file-lines"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors truncate">${doc.title}</h4>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mt-1">
                                <i class="fa-regular fa-clock"></i> ${new Date(doc.uploadDate).toLocaleDateString('th-TH')}
                            </p>
                        </div>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm shrink-0">
                        <i class="fa-solid fa-download text-xs"></i>
                    </div>
                </div>`).join('')}
            </div>
            <div id="${containerId}-pagination"></div>`;
        
        renderPagination(`${containerId}-pagination`, filtered.length, DOCS_ITEMS_PER_PAGE, page, `window.pagedDoc_${type}`);
    }
}
window.pagedDoc_official = (p) => renderDocumentSystem(allOfficialDocs, 'official-docs-container', 'official', p);
window.pagedDoc_form = (p) => renderDocumentSystem(allFormDocs, 'form-docs-container', 'form', p);

// =============================================================================
// 6. PERSON & STUDENT GRID (Lumina Bento)
// =============================================================================

export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if(!data || data.length === 0) {
        container.innerHTML='<p class="text-center text-gray-400 col-span-full py-10 bg-slate-50 rounded-2xl border border-dashed">กำลังปรับปรุงข้อมูลบุคลากร</p>';
        return;
    }

    const sorted = [...data].sort((a,b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);

    const createCard = (p, isLeader = false) => `
        <div class="relative group rounded-[2.5rem] p-8 ${isLeader ? 'bg-gradient-to-b from-white to-blue-50/50 border-blue-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.2)]' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2'} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full">
            <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-40 bg-blue-100 pointer-events-none"></div>
            
            <div class="w-32 h-32 rounded-full overflow-hidden border-[6px] ${isLeader ? 'border-blue-100 ring-4 ring-blue-50' : 'border-white shadow-md'} bg-white mb-6 group-hover:scale-105 group-hover:rotate-2 transition duration-700 relative z-10">
                ${p.image 
                    ? `<img src="${p.image}" class="w-full h-full object-cover">` 
                    : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-user text-5xl"></i></div>`
                }
            </div>
            
            <div class="relative z-10 w-full">
                <h3 class="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">${p.name}</h3>
                <div class="inline-block px-4 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                    <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${p.role}</p>
                </div>
            </div>
        </div>`;

    if (leader) {
        container.innerHTML += `<div class="flex justify-center mb-12 animate-fade-in"><div class="w-full max-w-sm">${createCard(leader, true)}</div></div>`;
    }
    if (others.length > 0) {
        let grid = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">`;
        others.forEach(p => grid += createCard(p));
        grid += `</div>`;
        container.innerHTML += grid;
    }
}

// =============================================================================
// 7. CORE UI COMPONENTS (History, Charts, Innovations, HomeNews)
// =============================================================================

export function renderHistoryTable(tbodyId, data) {
    const container = document.getElementById(tbodyId); 
    if (!container) return;
    
    // Auto-detect if using table or div
    const isTable = container.tagName === 'TBODY';
    const target = isTable ? container.closest('table').parentElement : container;
    if (isTable) container.closest('table').style.display = 'none';
    
    target.className = "grid grid-cols-1 gap-4";
    target.innerHTML = '';
    
    if(!data || data.length === 0) {
        target.innerHTML = `<div class="p-8 text-center text-slate-400">ยังไม่มีข้อมูล</div>`;
        return;
    }

    [...data].sort((a,b) => b.id - a.id).forEach(item => {
        target.innerHTML += `
        <div class="group bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 flex items-center gap-6 overflow-hidden">
            <div class="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0 group-hover:scale-105 transition duration-500 border border-slate-100">
                ${item.image ? `<img class="h-full w-full object-cover" src="${item.image}">` : `<div class="h-full w-full flex items-center justify-center text-slate-300"><i class="fa-solid fa-user text-2xl"></i></div>`}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">${item.name}</h4>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">${item.role || '-'}</p>
            </div>
            <div class="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100 shadow-sm whitespace-nowrap">${item.year || '-'}</div>
        </div>`;
    });
}

export function renderStudentChart(data) {
    const container = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');
    if (!data || data.length === 0) return;

    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });

    if (container) {
        container.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-6 shadow-xl text-white flex items-center gap-5 hover:-translate-y-1 transition duration-500">
                <div class="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl border border-white/10"><i class="fa-solid fa-users"></i></div>
                <div><p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">ทั้งหมด</p><h3 class="text-3xl font-black">${totalMale+totalFemale}</h3></div>
            </div>
            <div class="bg-white rounded-[2.5rem] p-6 shadow-lg border border-sky-100 flex items-center gap-5 hover:-translate-y-1 transition duration-500">
                <div class="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl text-sky-500 border border-sky-100"><i class="fa-solid fa-child"></i></div>
                <div><p class="text-[10px] font-bold text-sky-400 uppercase tracking-widest">ชาย</p><h3 class="text-3xl font-black text-slate-800">${totalMale}</h3></div>
            </div>
            <div class="bg-white rounded-[2.5rem] p-6 shadow-lg border border-pink-100 flex items-center gap-5 hover:-translate-y-1 transition duration-500">
                <div class="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl text-pink-500 border border-pink-100"><i class="fa-solid fa-child-dress"></i></div>
                <div><p class="text-[10px] font-bold text-pink-400 uppercase tracking-widest">หญิง</p><h3 class="text-3xl font-black text-slate-800">${totalFemale}</h3></div>
            </div>
        </div>`;
    }

    if (chartCanvas && window.Chart) {
        chartCanvas.parentElement.className = "bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border border-slate-100 overflow-hidden";
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.grade),
                datasets: [
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.8 },
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.8 }
                ]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f8fafc' } } },
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: "'Sarabun', sans-serif" } } } }
            }
        });
    }
}

export function renderInnovations(data) { 
    const c = document.getElementById('innovations-container'); 
    if(!c) return;
    c.innerHTML=''; 
    if(!data || data.length === 0) {
        c.innerHTML = '<div class="col-span-full text-center text-slate-400 py-20 font-medium">ยังไม่มีนวัตกรรมใหม่</div>';
        return;
    }
    c.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
    data.forEach(i => { 
        c.innerHTML += `
        <div class="group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
            <div class="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : '<div class="w-full h-full flex items-center justify-center"><i class="fa-solid fa-lightbulb text-6xl text-slate-200"></i></div>'}
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[9px] font-black text-blue-600 shadow-sm border border-white uppercase tracking-widest">${i.subject || 'Innovation'}</div>
            </div>
            <div class="p-6">
                <h4 class="font-bold text-lg text-slate-800 line-clamp-2 h-14 group-hover:text-blue-600 transition-colors">${i.title}</h4>
                <div class="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs"><i class="fa-solid fa-user-pen"></i></div>
                    <div class="text-[10px]"><p class="font-bold text-slate-700">${i.creator}</p><p class="text-slate-400">${i.class || '-'}</p></div>
                </div>
            </div>
        </div>`; 
    }); 
}

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); if(!c) return;
    c.innerHTML = ''; if(!newsList || newsList.length === 0) return;
    [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => {
        c.innerHTML += `
        <div class="p-4 border-b border-slate-50 flex gap-4 hover:bg-white/80 cursor-pointer transition rounded-2xl group" onclick="window.open('${n.link || '#'}', '_blank')">
            <div class="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover">` : ''}</div>
            <div class="flex-1 min-w-0 py-0.5">
                <h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1"></span> ${new Date(n.date).toLocaleDateString('th-TH')}</p>
            </div>
        </div>`; 
    }); 
}

// =============================================================================
// 8. WINDOW BRIDGES (Search, Filter, Actions) - ฉบับแก้ไขสมบูรณ์
// =============================================================================

// ✅ แก้ไข: เพิ่มการ Render แยกประเภท (O-NET, NT, RT) ให้ครบ
export function renderSchoolAchievements(data) { 
    if (!data) return;
    allSchoolData = data.sort((a, b) => b.id - a.id); 
    
    // แยกข้อมูล
    const onet = allSchoolData.filter(i => (i.title + i.competition).includes('O-NET'));
    const nt = allSchoolData.filter(i => (i.title + i.competition).includes('NT'));
    const rt = allSchoolData.filter(i => (i.title + i.competition).includes('RT'));
    const general = allSchoolData.filter(i => 
        !(i.title + i.competition).includes('O-NET') && 
        !(i.title + i.competition).includes('NT') && 
        !(i.title + i.competition).includes('RT')
    );

    // แสดงผลทั่วไป
    renderAchievementSystem('school-achievements-container', general, 'school'); 
    
    // ✅ เพิ่มส่วนนี้: แสดงผลวิชาการแยกกล่อง (ถ้ามีกล่องรองรับใน HTML)
    if(document.getElementById('onet-container')) renderAchievementSystem('onet-container', onet, 'school');
    if(document.getElementById('nt-container')) renderAchievementSystem('nt-container', nt, 'school');
    if(document.getElementById('rt-container')) renderAchievementSystem('rt-container', rt, 'school');
}

export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }

// ✅ แก้ไข: Search แล้วต้องรีเซ็ตไปหน้า 1 เสมอ
window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const source = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    
    // ค้นหาครอบคลุมทุกฟิลด์
    const filtered = source.filter(i => (i.title+i.students+i.name+(i.competition||'')).toLowerCase().includes(val));
    
    currentFolderFilter = val ? 'ผลการค้นหา' : null;
    renderAchievementSystem(containerId, filtered, type, 1); // <-- บังคับหน้า 1
};

window.filterNews = (id) => {
    const val = document.getElementById(id).value.toLowerCase();
    const filtered = allNewsData.filter(i => i.title.toLowerCase().includes(val));
    renderNews(filtered, 1); // <-- บังคับหน้า 1
};

window.filterDocuments = (id, containerId) => {
    const val = document.getElementById(id).value.toLowerCase();
    const type = containerId.includes('official') ? 'official' : 'form';
    const source = type === 'official' ? allOfficialDocs : allFormDocs;
    const filtered = source.filter(i => (i.title + i.category).toLowerCase().includes(val));
    
    currentDocFolder[type] = val ? 'ผลการค้นหา' : null;
    renderDocumentSystem(filtered, containerId, type, 1); // <-- บังคับหน้า 1
};

// Folder Logic Bridges (ต้องส่ง page 1 ไปด้วย เพื่อกันบั๊กหน้าค้าง)
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type, 1); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type, 1); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type, 1); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type, 1); };

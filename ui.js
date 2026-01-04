// js/ui.js - Full Structural Integrity + Lumina Bento Skin

// --- Global Variables (Data Persistence) ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config (Pagination: 6 items per page) ---
const ACH_ITEMS_PER_PAGE = 6;
const NEWS_ITEMS_PER_PAGE = 6;
const DOCS_ITEMS_PER_PAGE = 6;

// --- State Management ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. HELPER FUNCTIONS (Maintain Original Logic)
// =============================================================================

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    return `<span class="bg-blue-50/80 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 inline-flex items-center gap-1 whitespace-nowrap shadow-sm"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (Full Logic)
// =============================================================================

export function renderSchoolInfo(info) {
    if (!info) return;

    // Browser Title
    if (info.school_name) document.title = info.school_name;

    // Header Components
    const headerName = document.getElementById('header-school-name');
    const headerAff = document.getElementById('header-affiliation');
    const headerLogo = document.getElementById('header-logo');

    if (headerName) headerName.innerText = info.school_name || 'กำลังโหลด...';
    if (headerAff) headerAff.innerText = info.affiliation || '-';
    if (headerLogo && info.logo_url) {
        headerLogo.src = info.logo_url;
        headerLogo.classList.remove('hidden');
    }

    // Hero & Footer
    const heroMotto = document.getElementById('hero-motto');
    const footerName = document.getElementById('footer-school-name');
    const schoolAge = document.getElementById('school-age-badge');

    if (heroMotto) heroMotto.innerText = info.motto || '-';
    if (footerName) footerName.innerText = info.school_name || '';
    if (info.founding_date && schoolAge) {
        const age = new Date().getFullYear() - new Date(info.founding_date).getFullYear();
        schoolAge.innerText = `${age}`;
    }

    // Basic Info Page (Hero Card)
    const basicFields = {
        'info-name-th': info.school_name,
        'info-name-en': info.school_name_en,
        'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8,
        'info-obec-code': info.obec_code_6,
        'info-affiliation': info.affiliation,
        'info-address': info.address
    };
    for (const [id, value] of Object.entries(basicFields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value || '-';
    }

    // Logo Handling with Placeholder
    const logoBasic = document.getElementById('header-logo-basic');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (logoBasic) {
        if (info.logo_url) {
            logoBasic.src = info.logo_url;
            logoBasic.classList.remove('hidden');
            if(logoPlaceholder) logoPlaceholder.classList.add('hidden');
        } else {
            logoBasic.classList.add('hidden');
            if(logoPlaceholder) logoPlaceholder.classList.remove('hidden');
        }
    }
    
    // About Page (Full Content)
    const aboutFields = {
        'school-history-content': info.history,
        'info-vision': info.vision,
        'school-mission-content': info.mission,
        'info-philosophy': info.philosophy,
        'info-motto': info.motto,
        'school-identity-content': info.identity,
        'school-uniqueness-content': info.uniqueness
    };
    for (const [id, value] of Object.entries(aboutFields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value || '-';
    }

    // School Colors
    const colorBox = document.getElementById('school-color-box');
    if (colorBox) {
        const c1 = info.color_code_1 || '#ddd';
        const c2 = info.color_code_2 || c1;
        colorBox.style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    // Uniform & Media
    const uniformImg = document.getElementById('student-uniform-img');
    const uniformPlaceholder = document.getElementById('uniform-placeholder');
    if (uniformImg) {
        if (info.uniform_url) {
            uniformImg.src = info.uniform_url;
            uniformImg.classList.remove('hidden');
            if(uniformPlaceholder) uniformPlaceholder.classList.add('hidden');
        } else {
            uniformImg.classList.add('hidden');
            if(uniformPlaceholder) uniformPlaceholder.classList.remove('hidden');
        }
    }

    // Map Embed
    const mapContainer = document.getElementById('school-map-container');
    if (mapContainer && info.map_embed) {
        mapContainer.innerHTML = info.map_embed;
        const iframe = mapContainer.querySelector('iframe');
        if(iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "0";
            iframe.style.borderRadius = "2rem";
        }
    }
}

// =============================================================================
// 3. ACHIEVEMENT SYSTEM (Full Detailed Pagination + Search)
// =============================================================================

export function renderAchievementSystem(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20 bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium">ไม่พบข้อมูลรายการ</div>`;
        return;
    }

    if (currentFolderFilter === null) {
        // --- Folder View ---
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0, image: item.image };
            acc[key].count++;
            return acc;
        }, {});

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in";

        Object.keys(groups).forEach(name => {
            const group = groups[name];
            const div = document.createElement('div');
            div.className = "group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden";
            div.onclick = () => window.selectFolder(containerId, type, name);
            div.innerHTML = `
                <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="w-20 h-20 bg-blue-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition duration-700">
                    <i class="fa-solid fa-folder-open"></i>
                </div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">${name}</h4>
                <div class="mt-4"><span class="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50/50 px-4 py-1.5 rounded-full border border-blue-50">${group.count} Items</span></div>
            `;
            grid.appendChild(div);
        });
        container.appendChild(grid);

    } else {
        // --- Detailed List View with Pagination ---
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const startIndex = (page - 1) * ACH_ITEMS_PER_PAGE;
        const pageItems = filtered.slice(startIndex, startIndex + ACH_ITEMS_PER_PAGE);

        const header = document.createElement('div');
        header.className = "flex items-center justify-between bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-sm mb-10";
        header.innerHTML = `
            <h3 class="font-bold text-xl text-slate-800 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${currentFolderFilter}</h3>
            <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-indigo-600 transition-colors bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm"><i class="fa-solid fa-arrow-left mr-2"></i> กลับหน้าหลัก</button>
        `;
        container.appendChild(header);

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10";

        pageItems.forEach(item => {
            const div = document.createElement('div');
            div.className = "group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-[0.8s] cursor-pointer";
            div.onclick = () => window.open(item.image || item.file_url || '#', '_blank');
            div.innerHTML = `
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-[2s] ease-out">` : '<i class="fa-solid fa-award text-7xl absolute inset-0 m-auto text-slate-100"></i>'}
                    <div class="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black text-blue-600 shadow-xl border border-white/50 uppercase tracking-widest text-center">
                        รางวัล: ${item.title || 'ประกาศนียบัตร'}
                    </div>
                </div>
                <div class="p-8 text-center space-y-4">
                    <h4 class="font-bold text-lg text-slate-800 line-clamp-2 h-12 leading-snug group-hover:text-blue-600 transition-colors">${item.students || item.name || '-'}</h4>
                    <div class="pt-4 border-t border-slate-50">
                        <p class="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase line-clamp-1">รายการ: ${item.program || 'เกียรติบัตร'}</p>
                    </div>
                </div>
            `;
            grid.appendChild(div);
        });
        container.appendChild(grid);

        // Render Pagination
        const paginationId = `${containerId}-pagination`;
        let pagDiv = document.getElementById(paginationId);
        if(!pagDiv) {
            pagDiv = document.createElement('div');
            pagDiv.id = paginationId;
            pagDiv.className = "mt-12";
            container.appendChild(pagDiv);
        }
        renderPagination(paginationId, filtered.length, ACH_ITEMS_PER_PAGE, page, type === 'teacher' ? 'window.pagedAch_teacher' : (type === 'student' ? 'window.pagedAch_student' : 'window.pagedAch_school'));
    }
}

// Pagination Handlers
window.pagedAch_teacher = (p) => renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher', p);
window.pagedAch_student = (p) => renderAchievementSystem('student-achievements-container', allStudentData, 'student', p);
window.pagedAch_school = (p) => renderAchievementSystem('school-achievements-container', allSchoolData, 'school', p);

// =============================================================================
// 4. NEWS SYSTEM (Complete Pagination)
// =============================================================================

export function renderNews(data, page = 1) {
    if (!data) return;
    if (allNewsData.length === 0) allNewsData = data;

    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * NEWS_ITEMS_PER_PAGE;
    const pageItems = data.slice(startIndex, startIndex + NEWS_ITEMS_PER_PAGE);

    pageItems.forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 flex flex-col lg:flex-row gap-8 mb-8 group cursor-pointer";
        div.onclick = () => { if(news.link) window.open(news.link, '_blank'); };
        div.innerHTML = `
            <div class="w-full lg:w-64 h-48 bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-image text-5xl"></i></div>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div class="space-y-4">
                    <h4 class="font-bold text-2xl text-slate-800 group-hover:text-blue-600 transition-colors duration-500 leading-tight line-clamp-2">${news.title}</h4>
                    <p class="text-slate-500 line-clamp-2 font-light leading-relaxed">คลิกเพื่ออ่านรายละเอียดข่าวประชาสัมพันธ์เพิ่มเติม ประจำวันที่ ${new Date(news.date).toLocaleDateString('th-TH')}</p>
                </div>
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100 shadow-sm"><i class="fa-regular fa-calendar-alt text-blue-400"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-3 transition-all duration-500">Read More <i class="fa-solid fa-chevron-right ml-2 text-[10px]"></i></span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    renderPagination('news-pagination', data.length, NEWS_ITEMS_PER_PAGE, page, "window.renderNewsPaged");
}
window.renderNewsPaged = (p) => renderNews(allNewsData, p);

// =============================================================================
// 5. DOCUMENT SYSTEM (Categorized Folders)
// =============================================================================

export function renderDocumentSystem(data, containerId, type = 'official', page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;
    
    const current = currentDocFolder[type];
    container.innerHTML = '';

    if (current === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.category || 'ทั่วไป';
            if (!acc[key]) acc[key] = 0; acc[key]++;
            return acc;
        }, {});
        
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in";
        Object.entries(groups).forEach(([name, count]) => {
            grid.innerHTML += `
                <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                    <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl text-amber-500 mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition duration-700 shadow-sm"><i class="fa-solid fa-folder-closed"></i></div>
                    <h4 class="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors">${name}</h4>
                    <div class="mt-4"><span class="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-50/50 px-4 py-1.5 rounded-full border border-amber-50">${count} Files</span></div>
                </div>`;
        });
        container.appendChild(grid);
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        const startIndex = (page - 1) * DOCS_ITEMS_PER_PAGE;
        const pageItems = filtered.slice(startIndex, startIndex + DOCS_ITEMS_PER_PAGE);

        const header = document.createElement('div');
        header.className = "flex items-center justify-between bg-slate-100/50 backdrop-blur p-5 rounded-[2rem] border border-white/50 mb-10";
        header.innerHTML = `
            <h3 class="font-bold text-xl text-slate-700 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
            <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-800 transition-colors bg-white/80 px-5 py-2.5 rounded-full border border-white shadow-sm hover:shadow-md">ย้อนกลับ</button>
        `;
        container.appendChild(header);

        const list = document.createElement('div');
        list.className = "grid grid-cols-1 gap-4";
        pageItems.forEach(doc => {
            list.innerHTML += `
                <div class="group bg-white/80 backdrop-blur-sm p-5 rounded-[1.8rem] border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-700 cursor-pointer shadow-sm" onclick="window.open('${doc.fileUrl}', '_blank')">
                    <div class="flex items-center gap-6">
                        <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner"><i class="fa-solid fa-file-lines"></i></div>
                        <div class="space-y-1">
                            <h4 class="font-bold text-base text-slate-700 group-hover:text-blue-600 transition-colors duration-500">${doc.title}</h4>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-regular fa-clock text-blue-300"></i> ${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>
                    <div class="p-3 rounded-full bg-slate-50 text-slate-200 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm"><i class="fa-solid fa-download text-sm"></i></div>
                </div>`;
        });
        container.appendChild(list);

        const pagId = `${containerId}-pagination`;
        let pagDiv = document.getElementById(pagId);
        if(!pagDiv) { pagDiv = document.createElement('div'); pagDiv.id = pagId; pagDiv.className="mt-8"; container.appendChild(pagDiv); }
        renderPagination(pagId, filtered.length, DOCS_ITEMS_PER_PAGE, page, type === 'official' ? 'window.pagedDoc_official' : 'window.pagedDoc_form');
    }
}
window.pagedDoc_official = (p) => renderDocumentSystem(allOfficialDocs, 'official-docs-container', 'official', p);
window.pagedDoc_form = (p) => renderDocumentSystem(allFormDocs, 'form-docs-container', 'form', p);

// =============================================================================
// 6. PERSON & STUDENT GRID (Lumina Bento Skin)
// =============================================================================

export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if(!data || data.length === 0) {
        container.innerHTML='<p class="text-center text-gray-500 col-span-full py-10">กำลังปรับปรุงข้อมูล</p>';
        return;
    }

    const sorted = [...data].sort((a,b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);

    const createCard = (p, isLeader = false) => `
        <div class="relative group rounded-[2.5rem] p-8 ${isLeader ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2'} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full">
            <div class="w-36 h-36 rounded-full overflow-hidden border-[6px] ${isLeader ? 'border-blue-100' : 'border-white'} shadow-lg bg-white mb-6 group-hover:scale-105 group-hover:rotate-2 transition duration-700">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-5xl m-12 text-slate-200"></i>`}
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">${p.name}</h3>
            <div class="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">${p.role}</p>
            </div>
        </div>`;

    if (leader) {
        container.innerHTML += `<div class="flex justify-center mb-16 animate-fade-in"><div class="w-full max-w-sm">${createCard(leader, true)}</div></div>`;
    }
    if (others.length > 0) {
        let grid = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">`;
        others.forEach(p => grid += createCard(p));
        grid += `</div>`;
        container.innerHTML += grid;
    }
}

// =============================================================================
// 7. CORE UI COMPONENTS (History, Charts, Innovations)
// =============================================================================

export function renderHistoryTable(tbodyId, data) {
    const container = document.getElementById(tbodyId); 
    if (!container) return;
    const isTable = container.tagName === 'TBODY';
    const target = isTable ? container.closest('table').parentElement : container;
    if (isTable) container.closest('table').style.display = 'none';
    
    target.className = "grid grid-cols-1 gap-6";
    target.innerHTML = '';
    
    [...data].sort((a,b) => b.id - a.id).forEach(item => {
        target.innerHTML += `
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 flex flex-col sm:flex-row items-center gap-8 overflow-hidden">
            <div class="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 group-hover:scale-110 group-hover:rotate-3 transition duration-700">
                ${item.image ? `<img class="h-full w-full object-cover" src="${item.image}">` : `<div class="h-full w-full flex items-center justify-center text-slate-300"><i class="fa-solid fa-user text-3xl"></i></div>`}
            </div>
            <div class="flex-1 text-center sm:text-left">
                <h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors duration-500">${item.name}</h4>
                <p class="text-sm text-slate-500 font-bold uppercase tracking-widest">${item.role || '-'}</p>
            </div>
            <div class="px-5 py-2 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100 shadow-sm">${item.year || '-'}</div>
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
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl text-white group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl border border-white/10 group-hover:rotate-12 transition"><i class="fa-solid fa-users"></i></div>
                    <div><p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">ทั้งหมด</p><h3 class="text-4xl font-black">${totalMale+totalFemale}</h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2.5rem] p-8 shadow-lg border border-sky-100 group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-3xl text-sky-500 border border-sky-100 group-hover:rotate-12 transition"><i class="fa-solid fa-child"></i></div>
                    <div><p class="text-[10px] font-bold text-sky-400 uppercase tracking-widest">ชาย</p><h3 class="text-4xl font-black text-slate-800">${totalMale}</h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2.5rem] p-8 shadow-lg border border-pink-100 group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl text-pink-500 border border-pink-100 group-hover:rotate-12 transition"><i class="fa-solid fa-child-dress"></i></div>
                    <div><p class="text-[10px] font-bold text-pink-400 uppercase tracking-widest">หญิง</p><h3 class="text-4xl font-black text-slate-800">${totalFemale}</h3></div>
                </div>
            </div>
        </div>`;
    }

    if (chartCanvas && window.Chart) {
        chartCanvas.parentElement.className = "bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100 overflow-hidden";
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.grade),
                datasets: [
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8 },
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }
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
    c.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10";
    data.forEach(i => { 
        c.innerHTML += `
        <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
            <div class="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : '<i class="fa-solid fa-lightbulb text-6xl absolute inset-0 m-auto text-slate-200"></i>'}
                <div class="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black text-blue-600 shadow-xl border border-white/50 uppercase tracking-widest">${i.subject || 'CREATIVE'}</div>
            </div>
            <div class="p-8">
                <h4 class="font-bold text-xl text-slate-800 line-clamp-2 group-hover:text-blue-600 transition h-14">${i.title}</h4>
                <div class="flex items-center gap-4 pt-6 border-t border-slate-50">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50 group-hover:rotate-12 transition-transform duration-500"><i class="fa-solid fa-user-pen text-sm"></i></div>
                    <div class="text-[11px]"><p class="font-black text-slate-700 uppercase tracking-wider">${i.creator}</p><p class="text-slate-400 font-bold mt-0.5">${i.class || '-'}</p></div>
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
            <div class="w-20 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover">` : ''}</div>
            <div class="flex-1 space-y-1 py-0.5">
                <h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1"></span> ${new Date(n.date).toLocaleDateString('th-TH')}</p>
            </div>
        </div>`; 
    }); 
}

// =============================================================================
// 8. WINDOW BRIDGES (Search, Filter, Actions)
// =============================================================================

export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }
export function renderSchoolAchievements(data) { 
    allSchoolData = data; 
    const general = data.filter(i => !(i.title+i.competition).includes('O-NET') && !(i.title+i.competition).includes('NT') && !(i.title+i.competition).includes('RT'));
    renderAchievementSystem('school-achievements-container', general, 'school'); 
}

window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const source = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    const filtered = source.filter(i => (i.title+i.students+i.name+i.competition).toLowerCase().includes(val));
    currentFolderFilter = val ? 'ผลการค้นหา' : null;
    renderAchievementSystem(containerId, filtered, type);
};

window.filterNews = (id) => {
    const val = document.getElementById(id).value.toLowerCase();
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

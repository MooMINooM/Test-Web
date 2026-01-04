// js/ui.js

// --- Global Variables ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = []; 
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config ---
const ACH_ITEMS_PER_PAGE = 6;  
const NEWS_ITEMS_PER_PAGE = 5; 
const DOCS_ITEMS_PER_PAGE = 10; 

// --- State ---
let currentFolderFilter = null; 
let currentDocFolder = null;

// =============================================================================
// 1. HELPER FUNCTIONS
// =============================================================================

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    const colorMap = {
        'คณิตศาสตร์': 'bg-red-50 text-red-600 border-red-100', 'คณิต': 'bg-red-50 text-red-600 border-red-100',
        'วิทยาศาสตร์': 'bg-yellow-50 text-yellow-700 border-yellow-200', 'วิทย์': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'ภาษาไทย': 'bg-pink-50 text-pink-600 border-pink-100',
        'ภาษาอังกฤษ': 'bg-sky-50 text-sky-600 border-sky-100', 'อังกฤษ': 'bg-sky-50 text-sky-600 border-sky-100',
        'สังคมศึกษา': 'bg-teal-50 text-teal-600 border-teal-100', 'สังคม': 'bg-teal-50 text-teal-600 border-teal-100',
        'การงานอาชีพ': 'bg-orange-50 text-orange-600 border-orange-100', 'การงาน': 'bg-orange-50 text-orange-600 border-orange-100',
        'สุขะ - พละ': 'bg-green-50 text-green-600 border-green-100', 'สุขะ-พละ': 'bg-green-50 text-green-600 border-green-100',
        'ศิลปะ - ดนตรี': 'bg-indigo-50 text-indigo-600 border-indigo-100', 'ศิลปะ': 'bg-indigo-50 text-indigo-600 border-indigo-100', 'ดนตรี': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'กิจกรรมพัฒนาผู้เรียน': 'bg-purple-50 text-purple-600 border-purple-100', 'ลูกเสือ': 'bg-purple-50 text-purple-600 border-purple-100',
        'ปฐมวัย': 'bg-rose-50 text-rose-600 border-rose-100', 'อนุบาล': 'bg-rose-50 text-rose-600 border-rose-100',
        'อื่นๆ': 'bg-gray-50 text-gray-600 border-gray-200'
    };
    const styleClass = colorMap[cleanSubject] || colorMap['อื่นๆ'];
    return `<span class="${styleClass} text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 whitespace-nowrap"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. ACHIEVEMENT SYSTEM (Folder + Premium Cards)
// =============================================================================

// ✅ Export ฟังก์ชันนี้ เพื่อให้ script.js เรียกใช้ได้ (ตามที่อาจารย์ต้องการ)
export function renderAchievementSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.className = "w-full"; 
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200"><i class="fa-solid fa-folder-open text-4xl mb-4 opacity-50"></i><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    // ถ้ามีการกรอง Folder หรือไม่
    // สำหรับหน้า academic (O-NET/NT/RT) เราบังคับให้แสดง Folder ปีการศึกษาเสมอ
    if (currentFolderFilter === null) {
        renderFolders(containerId, data, type);
    } else {
        const filteredData = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        
        const backBtnContainer = document.createElement('div');
        backBtnContainer.className = "w-full mb-6 animate-fade-in";
        backBtnContainer.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fa-solid fa-folder-open text-yellow-500"></i> ${currentFolderFilter}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1 pl-7">พบข้อมูล ${filteredData.length} รายการ</p>
                </div>
                <button onclick="clearFolderFilter('${containerId}', '${type}')" class="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-bold text-sm bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-full md:w-auto">
                    <i class="fa-solid fa-arrow-left"></i> ย้อนกลับ
                </button>
            </div>
        `;
        container.appendChild(backBtnContainer);

        renderPagedAchievements(container, filteredData, type, 1);
    }
}

function renderFolders(containerId, data, type) {
    const container = document.getElementById(containerId);
    
    // จัดกลุ่มตามชื่อ Competition (ซึ่งเราใช้เป็นชื่อปี หรือชื่อรายการ)
    const groups = data.reduce((acc, item) => {
        const key = item.competition || 'รายการอื่นๆ';
        if (!acc[key]) { acc[key] = { count: 0, items: [], latestImage: null, dates: [] }; }
        acc[key].count++; acc[key].items.push(item);
        if (!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
        if (item.date) acc[key].dates.push(new Date(item.date));
        return acc;
    }, {});

    const themeColor = type === 'teacher' ? 'blue' : (type === 'school' ? 'orange' : 'pink');
    
    const gridDiv = document.createElement('div');
    gridDiv.className = "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    Object.keys(groups).forEach(competitionName => {
        const group = groups[competitionName];
        let dateLabel = 'ไม่ระบุวันที่';
        if(group.dates.length > 0) {
            const maxDate = new Date(Math.max.apply(null, group.dates));
            dateLabel = maxDate.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
        }

        const folderDiv = document.createElement('div');
        folderDiv.className = `bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-${themeColor}-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full animate-fade-in group relative overflow-hidden`;
        folderDiv.onclick = () => selectFolder(containerId, type, competitionName);

        folderDiv.innerHTML = `
            <div class="absolute top-0 right-0 w-24 h-24 bg-${themeColor}-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
            <div class="relative z-10 flex items-start gap-4">
                <div class="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition duration-300 overflow-hidden relative">
                    ${group.latestImage 
                        ? `<img src="${group.latestImage}" class="w-full h-full object-cover object-top">` 
                        : `<i class="fa-solid fa-folder-closed text-${themeColor}-200"></i>`
                    }
                </div>
                <div class="flex-1 min-w-0 pt-1">
                    <h4 class="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-${themeColor}-600 transition">${competitionName}</h4>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                        <span class="bg-${themeColor}-50 text-${themeColor}-600 px-2 py-0.5 rounded-full font-bold border border-${themeColor}-100">${group.count} รายการ</span>
                        <span><i class="fa-regular fa-calendar mr-1"></i>${dateLabel}</span>
                    </div>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 group-hover:text-${themeColor}-500 transition">
                <span>คลิกเพื่อเปิดดู</span><i class="fa-solid fa-arrow-right-long transform group-hover:translate-x-1 transition"></i>
            </div>
        `;
        gridDiv.appendChild(folderDiv);
    });
    container.appendChild(gridDiv);
}

function renderPagedAchievements(container, pageItemsFullList, type, page = 1) {
    let gridWrapper = container.querySelector('.achievements-grid-wrapper');
    if (!gridWrapper) {
        gridWrapper = document.createElement('div');
        gridWrapper.className = "achievements-grid-wrapper w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
        container.appendChild(gridWrapper);
    } else {
        gridWrapper.innerHTML = ''; 
    }

    const oldPag = container.querySelector('.pagination-controls');
    if(oldPag) oldPag.remove();

    const totalItems = pageItemsFullList.length;
    const totalPages = Math.ceil(totalItems / ACH_ITEMS_PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * ACH_ITEMS_PER_PAGE;
    const endIndex = startIndex + ACH_ITEMS_PER_PAGE;
    const pageItems = pageItemsFullList.slice(startIndex, endIndex);

    pageItems.forEach(item => {
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';
        const name = type === 'teacher' ? item.name : (type === 'student' ? item.students : 'โรงเรียน');
        const themeColor = type === 'teacher' ? 'blue' : (type === 'school' ? 'orange' : 'pink');
        const iconClass = type === 'teacher' ? 'fa-chalkboard-user' : (type === 'student' ? 'fa-user-graduate' : 'fa-school');

        // กรณีเป็นไฟล์ (O-NET/NT/RT) ให้กดแล้วเปิดลิงก์
        // กรณีเป็นผลงานทั่วไป ให้เปิดรูป
        const clickAction = item.fileUrl ? `window.open('${item.fileUrl}', '_blank')` : `window.open('${item.image || '#'}', '_blank')`;
        const btnText = item.fileUrl ? 'ดาวน์โหลด/ดูไฟล์' : 'ดูเกียรติบัตร';
        const btnIcon = item.fileUrl ? 'fa-file-pdf' : 'fa-eye';

        const div = document.createElement('div');
        div.className = `achievement-card group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in w-full`;
        
        div.innerHTML = `
            <div class="h-60 bg-gray-50 relative overflow-hidden cursor-pointer border-b border-gray-100" onclick="${clickAction}">
                 ${item.image 
                    ? `<img src="${item.image}" class="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105">` 
                    : `<div class="w-full h-full flex flex-col items-center justify-center text-gray-300"><i class="fa-solid fa-file-contract text-5xl mb-2 opacity-50"></i><span class="text-xs">เอกสาร</span></div>`
                 }
                 <div class="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/5"></div>
                 <div class="absolute top-3 right-3">
                    ${item.level ? `<span class="bg-white/95 backdrop-blur text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-gray-200">${item.level}</span>` : ''}
                 </div>
            </div>

            <div class="p-5 flex-grow flex flex-col justify-between relative">
                <div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${item.competition ? `<span class="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1"><i class="fa-solid fa-trophy text-yellow-500"></i> ${item.competition}</span>` : ''}
                        ${getSubjectBadge(item.subject)}
                    </div>
                    
                    <h4 class="font-bold text-gray-800 text-lg leading-snug mb-1 group-hover:text-${themeColor}-600 transition-colors cursor-pointer" onclick="${clickAction}" title="${item.title}">
                        ${item.title || '-'}
                    </h4>

                    <p class="text-xs text-gray-500 mb-4 flex items-center gap-1">
                        <i class="fa-solid fa-tag text-gray-300"></i> ${item.program || '-'}
                    </p>
                </div>
                
                <div class="mt-auto pt-3 border-t border-gray-50">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                            <i class="fa-solid ${iconClass}"></i>
                        </div>
                        <span class="text-sm font-bold text-gray-800 truncate flex-1">${name}</span>
                    </div>
                    
                    <div class="flex items-center justify-between text-[10px] text-gray-400">
                        <div class="flex items-center gap-1 truncate max-w-[50%]" title="${item.organization}">
                            <i class="fa-solid fa-building"></i> ${item.organization || '-'}
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                            <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                            <a href="javascript:void(0)" onclick="${clickAction}" class="text-${themeColor}-600 hover:text-${themeColor}-700 hover:underline font-bold flex items-center gap-1 transition">
                                <i class="fa-solid ${btnIcon}"></i> ${btnText}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        gridWrapper.appendChild(div);
    });

    if (totalPages > 1) {
        renderAchPagination(container, totalPages, page, type, pageItemsFullList);
    }
}

function renderAchPagination(container, totalPages, currentPage, type, currentFilteredData) {
    const nav = document.createElement('div');
    nav.className = "pagination-controls w-full flex justify-center items-center gap-1.5 mt-6 pt-4 border-t border-gray-100";
    const themeColor = type === 'teacher' ? 'blue' : (type === 'school' ? 'orange' : 'pink');
    
    const createBtn = (label, targetPage, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = label;
        btn.className = `w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition ${isActive ? `bg-${themeColor}-600 text-white shadow-md` : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        if (!isDisabled && !isActive) {
            btn.onclick = () => {
                renderPagedAchievements(container, currentFilteredData, type, targetPage);
                const headerOffset = 150;
                const elementPosition = container.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            };
        }
        return btn;
    };
    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, false, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            nav.appendChild(createBtn(i, i, i === currentPage));
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            nav.appendChild(document.createTextNode("..."));
        }
    }
    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, false, currentPage === totalPages));
    container.appendChild(nav);
}

// System Actions
window.selectFolder = function(containerId, type, programName) {
    currentFolderFilter = programName;
    
    // ตรวจสอบว่ากำลังดูข้อมูลชุดไหน
    let data = [];
    if(type === 'teacher') data = allTeacherData;
    else if(type === 'student') data = allStudentData;
    else if(type === 'school') {
        // ต้องกรองให้ถูกชุด (O-NET หรือ NT หรือ RT)
        if(containerId.includes('onet')) {
            data = allSchoolData.filter(item => item.title.includes('O-NET') || item.competition.includes('O-NET'));
        } else if(containerId.includes('nt')) {
            data = allSchoolData.filter(item => item.title.includes('NT') || item.competition.includes('NT'));
        } else if(containerId.includes('rt')) {
            data = allSchoolData.filter(item => item.title.includes('RT') || item.competition.includes('RT'));
        } else {
            // ผลงานโรงเรียนทั่วไป
            data = allSchoolData.filter(item => !item.title.includes('O-NET') && !item.title.includes('NT') && !item.title.includes('RT'));
        }
    }

    renderAchievementSystem(containerId, data, type);
    const el = document.getElementById(containerId);
    if(el) { const offset = 120; window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' }); }
}

window.clearFolderFilter = function(containerId, type) {
    currentFolderFilter = null;
    
    let data = [];
    if(type === 'teacher') data = allTeacherData;
    else if(type === 'student') data = allStudentData;
    else if(type === 'school') {
        if(containerId.includes('onet')) data = allSchoolData.filter(item => item.title.includes('O-NET') || item.competition.includes('O-NET'));
        else if(containerId.includes('nt')) data = allSchoolData.filter(item => item.title.includes('NT') || item.competition.includes('NT'));
        else if(containerId.includes('rt')) data = allSchoolData.filter(item => item.title.includes('RT') || item.competition.includes('RT'));
        else data = allSchoolData.filter(item => !item.title.includes('O-NET') && !item.title.includes('NT') && !item.title.includes('RT'));
    }

    renderAchievementSystem(containerId, data, type);
}

window.filterAchievements = function(inputId, selectId, containerId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    const searchText = input.value.toLowerCase().trim();
    const filterLevel = select.value;
    
    let sourceData = [];
    let type = 'student';
    
    if (containerId.includes('teacher')) { sourceData = allTeacherData; type = 'teacher'; }
    else if (containerId.includes('student')) { sourceData = allStudentData; type = 'student'; }
    else if (containerId.includes('school') || containerId.includes('onet') || containerId.includes('nt') || containerId.includes('rt')) { 
        sourceData = allSchoolData; 
        type = 'school';
        
        // Filter sub-sets
        if(containerId.includes('onet')) sourceData = sourceData.filter(item => item.title.includes('O-NET') || item.competition.includes('O-NET'));
        else if(containerId.includes('nt')) sourceData = sourceData.filter(item => item.title.includes('NT') || item.competition.includes('NT'));
        else if(containerId.includes('rt')) sourceData = sourceData.filter(item => item.title.includes('RT') || item.competition.includes('RT'));
        else sourceData = sourceData.filter(item => !item.title.includes('O-NET') && !item.title.includes('NT') && !item.title.includes('RT'));
    }

    if (searchText || filterLevel !== 'all') {
        currentFolderFilter = 'ผลการค้นหา'; 
        const filteredData = sourceData.filter(item => {
            const textContent = `${item.title} ${item.program} ${item.competition} ${item.subject} ${item.name || item.students} ${item.organization}`.toLowerCase();
            const itemLevel = item.level || "";
            const matchText = !searchText || textContent.includes(searchText);
            const matchLevel = (filterLevel === "all") || (itemLevel === filterLevel);
            return matchText && matchLevel;
        });
        const container = document.getElementById(containerId);
        container.className = "w-full"; container.innerHTML = ''; 
        const backBtnContainer = document.createElement('div');
        backBtnContainer.className = "w-full mb-4"; 
        backBtnContainer.innerHTML = `<button onclick="clearFolderFilter('${containerId}', '${type}')" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-bold text-sm bg-gray-100 px-4 py-2 rounded-full"><i class="fa-solid fa-times"></i> ล้างการค้นหา / กลับหน้าหลัก</button>`;
        container.appendChild(backBtnContainer);
        renderPagedAchievements(container, filteredData, type, 1);
    } else {
        clearFolderFilter(containerId, type);
    }
}

// =============================================================================
// 3. NEWS, DOCS & EXPORTS
// =============================================================================

window.filterNews = function(inputId, containerId) {
    const input = document.getElementById(inputId);
    const searchText = input.value.toLowerCase().trim();
    const filteredNews = allNewsData.filter(item => !searchText || item.title.toLowerCase().includes(searchText));
    renderPagedNews(containerId, filteredNews, 1);
}

function renderPagedNews(containerId, data, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-10 bg-gray-50 rounded-xl text-gray-500 border border-dashed border-gray-200"><i class="fa-regular fa-newspaper text-3xl mb-2 opacity-50"></i><p>ไม่พบข่าวสาร</p></div>';
        return;
    }

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / NEWS_ITEMS_PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * NEWS_ITEMS_PER_PAGE;
    const endIndex = startIndex + NEWS_ITEMS_PER_PAGE;
    const pageItems = data.slice(startIndex, endIndex);

    pageItems.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const linkTarget = (news.link && news.link !== '#') ? `href="${news.link}" target="_blank"` : 'href="javascript:void(0)" style="cursor: default;"';
        
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4 animate-fade-in group";
        
        div.innerHTML = `
            <div class="md:w-1/4 flex-shrink-0">
                <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100">
                    ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">` : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-regular fa-image text-3xl"></i></div>`}
                </div>
            </div>
            <div class="flex-1 flex flex-col justify-between py-1">
                <div>
                    <a ${linkTarget} class="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2 mb-2 group-hover:text-blue-600">${news.title}</a>
                    <div class="text-sm text-gray-500 mb-3 flex items-center gap-2"><i class="fa-regular fa-calendar text-blue-400"></i> ${dateStr}</div>
                </div>
                <div class="text-right mt-2 md:mt-0">
                     ${(news.link && news.link !== '#') ? `<a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold hover:underline inline-flex items-center gap-1">อ่านต่อ <i class="fa-solid fa-arrow-right"></i></a>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    if (totalPages > 1) renderNewsPagination(container, totalPages, page, data);
}

function renderNewsPagination(container, totalPages, currentPage, currentFilteredData) {
    const nav = document.createElement('div');
    nav.className = "col-span-full flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100";
    const createBtn = (label, targetPage, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = label;
        btn.className = `w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        if (!isDisabled && !isActive) {
            btn.onclick = () => {
                renderPagedNews(container.id, currentFilteredData, targetPage);
                const offset = 120;
                window.scrollTo({ top: container.closest('section').getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
            };
        }
        return btn;
    };
    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, false, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) nav.appendChild(createBtn(i, i, i === currentPage));
        else if (i === currentPage - 2 || i === currentPage + 2) nav.appendChild(document.createTextNode("..."));
    }
    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, false, currentPage === totalPages));
    container.appendChild(nav);
}

window.filterDocuments = function(inputId, containerId) {
    const input = document.getElementById(inputId);
    const searchText = input.value.toLowerCase().trim();
    const isOfficial = containerId.includes('official');
    const sourceData = isOfficial ? allOfficialDocs : allFormDocs;
    const type = isOfficial ? 'official' : 'form';

    if (searchText) {
        currentDocFolder = 'ผลการค้นหา';
        const filteredData = sourceData.filter(item => `${item.title} ${item.category}`.toLowerCase().includes(searchText));
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const backBtn = document.createElement('div');
        backBtn.className = "col-span-full mb-4 w-full";
        backBtn.innerHTML = `<button onclick="clearDocFolder('${containerId}', '${type}')" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-bold text-sm bg-gray-100 px-4 py-2 rounded-full"><i class="fa-solid fa-times"></i> ล้างการค้นหา</button>`;
        container.appendChild(backBtn);
        renderPagedDocs(container, filteredData, type, 1);
    } else {
        clearDocFolder(containerId, type);
    }
}

function renderDocumentSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.className = "w-full"; 
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><i class="fa-solid fa-folder-open text-3xl mb-2 opacity-50"></i><p>ไม่พบเอกสาร</p></div>';
        return;
    }

    if (currentDocFolder === null) {
        renderDocFolders(container, data, type);
    } else {
        const filteredData = data.filter(item => (item.category || 'อื่นๆ') === currentDocFolder);
        const header = document.createElement('div');
        header.className = "w-full mb-6 animate-fade-in";
        header.innerHTML = `
            <div class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="font-bold text-gray-700 flex items-center gap-2"><i class="fa-solid fa-folder-open text-yellow-500"></i> ${currentDocFolder}</h3>
                <button onclick="clearDocFolder('${containerId}', '${type}')" class="text-sm text-blue-600 hover:underline font-bold"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
            </div>
        `;
        container.appendChild(header);
        renderPagedDocs(container, filteredData, type, 1);
    }
}

function renderDocFolders(container, data, type) {
    const groups = data.reduce((acc, item) => {
        const key = item.category || 'อื่นๆ';
        if (!acc[key]) acc[key] = 0;
        acc[key]++;
        return acc;
    }, {});

    const grid = document.createElement('div');
    grid.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full";

    Object.keys(groups).forEach(cat => {
        const count = groups[cat];
        const div = document.createElement('div');
        div.className = "bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col items-center text-center gap-3 group animate-fade-in";
        div.onclick = () => selectDocFolder(container.id, type, cat);
        div.innerHTML = `
            <div class="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300"><i class="fa-solid fa-folder"></i></div>
            <div><h4 class="font-bold text-gray-700 text-sm group-hover:text-blue-600 transition">${cat}</h4><span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">${count} ไฟล์</span></div>
        `;
        grid.appendChild(div);
    });
    container.appendChild(grid);
}

function renderPagedDocs(container, data, type, page = 1) {
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col gap-3 w-full animate-fade-in";
    
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / DOCS_ITEMS_PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * DOCS_ITEMS_PER_PAGE;
    const endIndex = startIndex + DOCS_ITEMS_PER_PAGE;
    const pageItems = data.slice(startIndex, endIndex);

    pageItems.forEach(doc => {
        const dateStr = doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('th-TH') : '-';
        let icon = 'fa-file-lines text-gray-400';
        if (doc.title.toLowerCase().includes('pdf')) icon = 'fa-file-pdf text-red-500';
        else if (doc.title.toLowerCase().includes('doc')) icon = 'fa-file-word text-blue-500';
        else if (doc.title.toLowerCase().includes('xls')) icon = 'fa-file-excel text-green-500';

        const div = document.createElement('div');
        div.className = "flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-200 transition group cursor-pointer";
        div.onclick = () => { if(doc.fileUrl) window.open(doc.fileUrl, '_blank'); };
        
        div.innerHTML = `
            <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl group-hover:bg-white transition shadow-sm"><i class="fa-solid ${icon}"></i></div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-700 text-sm group-hover:text-blue-600 transition truncate">${doc.title}</h4>
                <div class="flex gap-3 text-xs text-gray-400 mt-0.5"><span><i class="fa-regular fa-calendar"></i> ${dateStr}</span><span class="bg-gray-100 px-1.5 rounded text-[10px]">${doc.category || 'ทั่วไป'}</span></div>
            </div>
            <div class="text-gray-300 group-hover:text-blue-500 transition px-2"><i class="fa-solid fa-download"></i></div>
        `;
        wrapper.appendChild(div);
    });
    container.appendChild(wrapper);
    if (totalPages > 1) renderDocPagination(container, totalPages, page, type, data);
}

function renderDocPagination(container, totalPages, currentPage, type, currentFilteredData) {
    const nav = document.createElement('div');
    nav.className = "col-span-full flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-100";
    const createBtn = (label, targetPage, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = label;
        btn.className = `w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition ${isActive ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        if (!isDisabled && !isActive) {
            btn.onclick = () => {
                const oldWrapper = container.querySelector('.flex.flex-col'); if(oldWrapper) oldWrapper.remove();
                const oldNav = container.querySelector('.col-span-full'); if(oldNav) oldNav.remove();
                renderPagedDocs(container, currentFilteredData, type, targetPage);
                const offset = 150; window.scrollTo({ top: container.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
            };
        }
        return btn;
    };
    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, false, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) nav.appendChild(createBtn(i, i, i === currentPage));
        else if (i === currentPage - 2 || i === currentPage + 2) nav.appendChild(document.createTextNode("..."));
    }
    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, false, currentPage === totalPages));
    container.appendChild(nav);
}

window.selectDocFolder = function(containerId, type, catName) {
    currentDocFolder = catName;
    const data = type === 'official' ? allOfficialDocs : allFormDocs;
    renderDocumentSystem(containerId, data, type);
}
window.clearDocFolder = function(containerId, type) {
    currentDocFolder = null;
    const data = type === 'official' ? allOfficialDocs : allFormDocs;
    renderDocumentSystem(containerId, data, type);
}

// --------------------------------------------------------
// EXPORTS
// --------------------------------------------------------

export function renderTeacherAchievements(data) { if(!data) return; allTeacherData = [...data].sort((a, b) => b.id - a.id); renderAchievementSystem('teacher-achievements-container', allTeacherData, 'teacher'); }
export function renderStudentAchievements(data) { if(!data) return; allStudentData = [...data].sort((a, b) => b.id - a.id); renderAchievementSystem('student-achievements-container', allStudentData, 'student'); }
export function renderNews(newsList) { if (!newsList) return; allNewsData = [...newsList].sort((a, b) => b.id - a.id); renderPagedNews('news-container', allNewsData, 1); }
export function renderDocuments(data, containerId) {
    if (!data) return;
    if (containerId.includes('official')) { allOfficialDocs = [...data].sort((a, b) => b.id - a.id); renderDocumentSystem(containerId, allOfficialDocs, 'official'); } 
    else { allFormDocs = [...data].sort((a, b) => b.id - a.id); renderDocumentSystem(containerId, allFormDocs, 'form'); }
}

// ✅ ฟังก์ชันไฮไลท์: รวม O-NET/NT/RT และผลงานทั่วไปเข้าด้วยกัน แล้วแยก Render อัตโนมัติ
export function renderSchoolAchievements(data) { 
    if (!data) return;
    allSchoolData = [...data].sort((a, b) => b.id - a.id);
    
    // 1. แยกข้อมูลตาม keyword
    const onetData = allSchoolData.filter(item => item.title.includes('O-NET') || (item.competition && item.competition.includes('O-NET')));
    const ntData = allSchoolData.filter(item => item.title.includes('NT') || (item.competition && item.competition.includes('NT')));
    const rtData = allSchoolData.filter(item => item.title.includes('RT') || (item.competition && item.competition.includes('RT')));
    const generalData = allSchoolData.filter(item => !item.title.includes('O-NET') && !item.title.includes('NT') && !item.title.includes('RT'));

    // 2. Render ไปยัง Container ต่างๆ (ถ้ามีในหน้า HTML)
    // หน้าผลงานโรงเรียนทั่วไป
    renderAchievementSystem('school-achievements-container', generalData, 'school');
    
    // หน้าวิชาการ
    if(document.getElementById('onet-container')) renderAchievementSystem('onet-container', onetData, 'school');
    if(document.getElementById('nt-container')) renderAchievementSystem('nt-container', ntData, 'school');
    if(document.getElementById('rt-container')) renderAchievementSystem('rt-container', rtData, 'school');
}

export function renderHomeNews(newsList) {
    const container = document.getElementById('home-news-container');
    if (!container) return; container.innerHTML = '';
    if (!newsList || newsList.length === 0) { container.innerHTML = '<p class="text-center text-gray-400 py-4 text-sm">ยังไม่มีข่าวประชาสัมพันธ์</p>'; return; }
    [...newsList].sort((a, b) => b.id - a.id).slice(0, 4).forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        const div = document.createElement('div');
        div.className = `border-b border-gray-100 pb-3 mb-2 last:border-0 last:mb-0 last:pb-0 cursor-pointer hover:bg-gray-50 transition rounded p-2 flex gap-3`;
        div.onclick = () => { if(news.link && news.link !== '#') window.open(news.link, '_blank'); };
        div.innerHTML = `<div class="flex-shrink-0 w-16 h-12 bg-gray-100 rounded-md overflow-hidden">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-regular fa-image"></i></div>`}</div><div class="flex-1 min-w-0"><h4 class="text-sm font-bold text-gray-700 line-clamp-1">${news.title}</h4><p class="text-xs text-gray-400 mt-1 flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${dateStr}</p></div>`;
        container.appendChild(div);
    });
}
export function renderSchoolInfo(dataList) { if (!dataList || dataList.length === 0) return; const info = dataList[0]; document.getElementById('hero-motto').innerText = info.motto || ''; if(info.founding_date) document.getElementById('school-age-badge').innerText = `ก่อตั้งมาแล้ว ${new Date().getFullYear() - new Date(info.founding_date).getFullYear()} ปี`; if(info.identity) { const id = document.getElementById('school-identity'); id.innerText = info.identity; id.classList.remove('hidden'); } const vtr = document.getElementById('vtr-iframe'); if (info.vtr_url && vtr) { const vid = info.vtr_url.split('v=')[1]?.split('&')[0] || info.vtr_url.split('youtu.be/')[1]; if(vid) { vtr.src = `https://www.youtube.com/embed/${vid}`; document.getElementById('vtr-container').classList.remove('hidden'); document.getElementById('vtr-placeholder').style.display='none'; } } document.getElementById('school-color-box').style.background = `linear-gradient(to right, ${info.color_code || '#ddd'} 50%, ${info.color_code_2 || info.color_code || '#ddd'} 50%)`; if(info.song_url) { document.getElementById('school-song').src = info.song_url; document.getElementById('music-player-controls').classList.remove('hidden'); } document.getElementById('school-history-content').innerText = info.history || '-'; document.getElementById('school-mission-content').innerText = info.mission || '-'; document.getElementById('school-identity-content').innerText = info.identity || '-'; document.getElementById('footer-school-name').innerText = info.school_name || ''; }
export function renderPersonGrid(data, containerId) { const container = document.getElementById(containerId); if(!container) return; container.innerHTML = ''; if(!data || data.length === 0) { container.innerHTML='<p class="text-center text-gray-500 col-span-full">กำลังปรับปรุงข้อมูล</p>'; return; } const sorted=[...data].sort((a,b)=>a.id-b.id); const leader=sorted[0]; const others=sorted.slice(1); const createCard = (p) => `<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition transform hover:-translate-y-1 h-full"><div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 shadow-inner bg-gray-200">${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user text-4xl"></i></div>'}</div><h3 class="text-lg font-bold text-gray-800 mb-1">${p.name}</h3><p class="text-blue-600 font-medium text-sm">${p.role}</p></div>`; let html=''; if(leader) html+=`<div class="flex justify-center mb-8"><div class="w-full max-w-xs">${createCard(leader)}</div></div>`; if(others.length>0){ html+='<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">'; others.forEach(p=>html+=createCard(p)); html+='</div>'; } container.innerHTML=html; }
export function renderHistoryTable(tbodyId, data) { const tbody = document.getElementById(tbodyId); if (!tbody) return; tbody.innerHTML = ''; if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">ไม่มีข้อมูล</td></tr>'; return; } [...data].sort((a,b)=>a.id-b.id).forEach((item,index)=>{ const tr=document.createElement('tr'); tr.className=index%2===0?'bg-white':'bg-gray-50'; tr.innerHTML=`<td class="px-6 py-4 text-sm text-gray-500">${index+1}</td><td class="px-6 py-4"><div class="flex items-center"><div class="h-10 w-10 mr-4 bg-gray-200 rounded-full overflow-hidden">${item.image?`<img class="h-10 w-10 object-cover" src="${item.image}">`:'<div class="h-full w-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user"></i></div>'}</div><div class="text-sm font-medium text-gray-900">${item.name}</div></div></td><td class="px-6 py-4 text-sm text-gray-500">${item.role||'-'}</td><td class="px-6 py-4 text-sm text-gray-500">${item.year||`${item.start_date||'-'} ถึง ${item.end_date||'ปัจจุบัน'}`}</td>`; tbody.appendChild(tr); }); }
export function renderInnovations(data) { const container = document.getElementById('innovations-container'); if (!container) return; container.innerHTML = ''; if (!data || data.length === 0) { container.innerHTML = '<div class="col-span-full text-center text-gray-500">ไม่พบนวัตกรรม</div>'; return; } [...data].sort((a, b) => b.id - a.id).forEach(item => { const div = document.createElement('div'); div.className = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"; div.innerHTML = `<div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">${item.coverImageUrl ? `<img src="${item.coverImageUrl}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">` : `<div class="w-full h-full flex items-center justify-center text-blue-200"><i class="fa-solid fa-lightbulb text-5xl"></i></div>`}<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">${item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg w-full text-center transform translate-y-4 group-hover:translate-y-0 transition duration-300">เปิดดูผลงาน</a>` : ''}</div></div><div class="p-5"><div class="flex items-center gap-2 mb-2"><span class="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">${item.subject || 'ทั่วไป'}</span></div><h3 class="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">${item.title}</h3><p class="text-sm text-gray-500 flex items-center gap-2"><i class="fa-solid fa-user-pen"></i> ${item.creator || 'คณะผู้จัดทำ'}</p></div>`; container.appendChild(div); }); }
export function renderStudentChart(data) { const container = document.getElementById('student-summary-container'); const chartCanvas = document.getElementById('studentChart'); if (!data || data.length === 0) { if(container) container.innerHTML = '<p class="text-center text-gray-400 col-span-3">ยังไม่มีข้อมูลนักเรียน</p>'; return; } data.sort((a, b) => a.id - b.id); let totalMale = 0, totalFemale = 0; data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); }); if (container) { container.innerHTML = `<div class="bg-blue-100 p-4 rounded-xl text-center border border-blue-200"><h3 class="text-blue-800 font-bold text-lg">ทั้งหมด</h3><p class="text-3xl font-bold text-blue-600">${totalMale + totalFemale} <span class="text-sm">คน</span></p></div><div class="bg-green-100 p-4 rounded-xl text-center border border-green-200"><h3 class="text-green-800 font-bold text-lg">ชาย</h3><p class="text-3xl font-bold text-green-600">${totalMale} <span class="text-sm">คน</span></p></div><div class="bg-pink-100 p-4 rounded-xl text-center border border-pink-200"><h3 class="text-pink-800 font-bold text-lg">หญิง</h3><p class="text-3xl font-bold text-pink-600">${totalFemale} <span class="text-sm">คน</span></p></div>`; } if (chartCanvas) { if (window.myStudentChart) window.myStudentChart.destroy(); window.myStudentChart = new Chart(chartCanvas, { type: 'bar', data: { labels: data.map(d => d.grade), datasets: [ { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#3b82f6', borderRadius: 4 }, { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 4 } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'แผนภูมิแสดงจำนวนนักเรียนแยกตามระดับชั้น' } } } }); } }
export function setupDropdowns() {}
export function setupModal() {}
export function closeAllDropdowns() { document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden')); }
